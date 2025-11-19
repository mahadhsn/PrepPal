// src/app/api/detect/route.ts
import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import vision from '@google-cloud/vision'
import {
  FIRST_AID_CATALOG,
  categorizeLabel,
  type Priority,
} from '@/lib/firstAidCatalog'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type NormBox = { x0: number; y0: number; x1: number; y1: number }
type BoxOut = {
  box: NormBox
  label: string        // display label (mapped if we have one, else raw)
  score: number
  priority: Priority
  mappedKey?: string   // catalog key if matched
  mappedLabel?: string // catalog label if matched
}

// Put this above POST()
let CACHED_GCP_KEY_PATH: string | null = null

function resolveKeyPath(): string | null {
  // 1) Local dev: use existing absolute/relative paths if present
  const cand: string[] = []
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    cand.push(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  }
  cand.push(path.join(process.cwd(), 'secrets', 'gcp-key.json'))
  cand.push(path.join(process.cwd(), 'src', 'secrets', 'gcp-key.json'))
  for (const c of cand) {
    try { if (fs.existsSync(c)) return c } catch {}
  }

  // 2) Serverless (Vercel): materialize from env to /tmp
  if (CACHED_GCP_KEY_PATH) return CACHED_GCP_KEY_PATH

  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  const b64  = process.env.GOOGLE_APPLICATION_CREDENTIALS_B64

  if (!json && !b64) {
    console.error('No GCP credentials found in env (JSON/B64).')
    return null
  }

  try {
    const payload = json ?? Buffer.from(b64!, 'base64').toString('utf8')
    const outPath = '/tmp/gcp-key.json' // writable on Vercel/Node serverless
    fs.writeFileSync(outPath, payload, { encoding: 'utf8' })
    CACHED_GCP_KEY_PATH = outPath
    return outPath
  } catch (e) {
    console.error('Failed to write GCP key to /tmp:', e)
    return null
  }
}

function iou(a: NormBox, b: NormBox) {
  const xA = Math.max(a.x0, b.x0), yA = Math.max(a.y0, b.y0)
  const xB = Math.min(a.x1, b.x1), yB = Math.min(a.y1, b.y1)
  const inter = Math.max(0, xB - xA) * Math.max(0, yB - yA)
  const areaA = (a.x1 - a.x0) * (a.y1 - a.y0)
  const areaB = (b.x1 - b.x0) * (b.y1 - b.y0)
  return inter / Math.max(1e-6, areaA + areaB - inter)
}

function nms(items: BoxOut[], thr = 0.5) {
  const out: BoxOut[] = []
  const sorted = [...items].sort((a, b) => b.score - a.score)
  for (const d of sorted) {
    if (out.every(o => iou(o.box, d.box) < thr)) out.push(d)
  }
  return out
}

function polyToBox(vertices: { x?: number | null; y?: number | null }[]): NormBox {
  const xs = vertices.map(v => v.x ?? 0)
  const ys = vertices.map(v => v.y ?? 0)
  const x0 = Math.min(...xs), x1 = Math.max(...xs)
  const y0 = Math.min(...ys), y1 = Math.max(...ys)
  return {
    x0: Math.max(0, Math.min(1, x0)),
    y0: Math.max(0, Math.min(1, y0)),
    x1: Math.max(0, Math.min(1, x1)),
    y1: Math.max(0, Math.min(1, y1)),
  }
}

const USE_MOCK = process.env.DETECTOR === 'mock'

// --- Thresholds to reduce wrong guesses ---
const MIN_OBJ_SCORE = 0.55  // objectLocalization minimum score (was 0.30)
const MIN_LABEL_SCORE = 0.65 // labelDetection minimum score to keep
const TEXT_HIT_SCORE = 0.60  // score assigned to OCR-derived hits

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9+]+/i)
    .filter(Boolean)
}

function area(b: NormBox) {
  return Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0)
}

export async function POST(req: Request) {
  // Mock path to keep UI working without GCP billing
  if (USE_MOCK) {
    const mock = [
      { box: { x0: 0.12, y0: 0.35, x1: 0.32, y1: 0.55 }, label: 'Clean cloth / towel', score: 0.82, priority: 'green' as const },
      { box: { x0: 0.55, y0: 0.40, x1: 0.75, y1: 0.68 }, label: 'Zip bag (ice pack)',   score: 0.76, priority: 'orange' as const },
      { box: { x0: 0.30, y0: 0.20, x1: 0.42, y1: 0.36 }, label: 'Cooking oil',          score: 0.70, priority: 'red' as const },
    ]
    return NextResponse.json({
      ok: true,
      boxes: mock.map((b, i) => ({ id: `b${i}`, ...b })),
      findings: {
        green: [{ key: 'clean_cloth', label: 'Clean cloth / towel', confidence: 0.82 }],
        orange:[{ key: 'zip_bag',     label: 'Zip bag (ice pack)',   confidence: 0.76 }],
        red:   [{ key: 'cooking_oil', label: 'Cooking oil',          confidence: 0.70 }],
      },
    })
  }

  // Real detector
  const keyPath = resolveKeyPath()
  if (!keyPath) {
    return new Response(JSON.stringify({ ok: false, error: 'GCP key not found' }), { status: 500 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ ok: false, error: 'No file' }, { status: 400 })

  const buf = Buffer.from(await file.arrayBuffer())
  const client = new vision.ImageAnnotatorClient({ keyFilename: keyPath })

  // --- Request multiple features in one call ---
  const [annot] = await client.annotateImage({
    image: { content: buf },
    features: [
      { type: 'OBJECT_LOCALIZATION' },
      { type: 'TEXT_DETECTION' },
      { type: 'LABEL_DETECTION', maxResults: 50 },
    ],
  })

  // 1) Object localization -> boxed detections
  const objects = annot.localizedObjectAnnotations ?? []
  const objBoxes: BoxOut[] = objects.map(o => {
    const box = polyToBox(o.boundingPoly?.normalizedVertices ?? o.boundingPoly?.vertices ?? [])
    const rawLabel = o.name ?? 'object'
    const score = o.score ?? 0
    const { priority, match } = categorizeLabel(rawLabel)
    return {
      box,
      label: match?.label ?? rawLabel,
      score,
      priority,
      mappedKey: match?.key,
      mappedLabel: match?.label,
    }
  })

  // 2) TEXT_DETECTION -> synthesize detections (no precise boxes needed)
  const fullText = annot.textAnnotations?.[0]?.description ?? ''
  const tokens = new Set(tokenize(fullText))
  // also consider 2-gram joins like "bread knife", "cutting board"
  const words = fullText.toLowerCase().split(/\s+/).filter(Boolean)
  for (let i = 0; i + 1 < words.length; i++) {
    tokens.add(`${words[i]} ${words[i + 1]}`.replace(/[^a-z0-9+ ]+/g, ''))
  }

  const textHits: BoxOut[] = []
  for (const it of FIRST_AID_CATALOG) {
    const hay = new Set([it.label.toLowerCase(), ...(it.synonyms ?? []).map(s => s.toLowerCase())])
    // Only accept exact token or exact bigram match to avoid spurious substring hits
    const hitExact = Array.from(hay).some(h => tokens.has(h))
    if (hitExact) {
      textHits.push({
        box: { x0: 0, y0: 0, x1: 0, y1: 0 },
        label: it.label,
        score: TEXT_HIT_SCORE,
        priority: it.priority,
        mappedKey: it.key,
        mappedLabel: it.label,
      })
    }
  }

  // 3) LABEL_DETECTION -> extra hints (also synthesize, no boxes)
  const labels = annot.labelAnnotations ?? []
  const labelHits: BoxOut[] = labels.map(l => {
    const desc = l.description ?? ''
    const score = l.score ?? 0
    const { priority, match } = categorizeLabel(desc)
    return {
      box: { x0: 0, y0: 0, x1: 0, y1: 0 },
      label: match?.label ?? desc,
      score,
      priority,
      mappedKey: match?.key,
      mappedLabel: match?.label,
    }
  }).filter(h => h.mappedKey && h.score >= MIN_LABEL_SCORE) // keep only ones that mapped into your catalog and pass score threshold

  // Merge all sources
  const raw = [...objBoxes, ...textHits, ...labelHits]

  // NMS only on entries that actually have an area > 0 (true boxes)
  const withBoxes = raw.filter(r => area(r.box) > 0)
  const noBoxes   = raw.filter(r => area(r.box) === 0)

  // Low threshold for recall; adjust IoU as needed
  const boxedKept = nms(withBoxes.filter(r => r.score >= MIN_OBJ_SCORE), 0.45)

  // Deduplicate by label across boxed + no-box entries, keep highest confidence
  const merged = [...boxedKept, ...noBoxes]
  const bestByLabel = new Map<string, BoxOut>()
  for (const d of merged) {
    const key = (d.mappedLabel ?? d.label).toLowerCase()
    const curr = bestByLabel.get(key)
    if (!curr || d.score > curr.score) bestByLabel.set(key, d)
  }
  const filtered = Array.from(bestByLabel.values())

  // Group findings by priority
  const findings = {
    green: [] as { key?: string; label: string; confidence: number }[],
    orange: [] as { key?: string; label: string; confidence: number }[],
    red: [] as { key?: string; label: string; confidence: number }[],
  }
  for (const r of filtered) {
    const bucket = findings[r.priority]
    const label = r.mappedLabel ?? r.label
    bucket.push({ key: r.mappedKey, label, confidence: r.score })
  }

  // Only draw boxes that actually have an area
  const boxesForUi = boxedKept.map((b, i) => ({
    id: `b${i}`,
    box: b.box,
    label: b.label,
    score: b.score,
    priority: b.priority,
  }))

  // Build a set of labels that have real boxes so we can suppress duplicates in the unboxed list
  const boxedLabelSet = new Set<string>(
    boxedKept.map(b => (b.mappedLabel ?? b.label).toLowerCase())
  )

  // NEW: unboxed (things recognized via TEXT/LABEL but not in objectLocalization)
  const unboxedSet = new Map<string, { key?: string; label: string; confidence: number; priority: Priority }>()
  for (const r of filtered) {
    const hasBox = area(r.box) > 0
    const labelKey = (r.mappedLabel ?? r.label).toLowerCase()
    // If a real boxed detection exists for this label, suppress showing it in the unboxed list
    if (!hasBox && !boxedLabelSet.has(labelKey)) {
      const curr = unboxedSet.get(labelKey)
      const val = { key: r.mappedKey, label: r.mappedLabel ?? r.label, confidence: r.score, priority: r.priority }
      if (!curr || val.confidence > curr.confidence) unboxedSet.set(labelKey, val)
    }
  }
  const unboxed = Array.from(unboxedSet.values()) // flat list with priority per item

  return NextResponse.json({
    ok: true,
    boxes: boxesForUi,
    findings,
    unboxed,
    ocrText: fullText,
  })
}