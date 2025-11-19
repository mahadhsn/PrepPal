// src/app/api/chat/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Priority = 'green' | 'orange' | 'red'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { ocrText, boxes, findings, unboxed } = body || {}

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      // Fallback so UI works without keys
      const summary = buildHeuristicSummary({ ocrText, boxes, findings, unboxed })
      return NextResponse.json({ ok: true, reply: summary, source: 'mock' })
    }

    const system = `You are a calm, practical first-aid and survival assistant.

    Your primary job:
    - When given parsed detections or text describing items (usually from a kitchen or survival setting), explain **how each detected item** could be used for survival or first aid.
    - Organize your response clearly:

    ### 1) USE THESE (Green)
    - Items essential for first aid or immediate survival.
    ### 2) NICE TO HAVE (Orange)
    - Items helpful or situationally useful.
    ### 3) LEAVE (Red)
    - Items not recommended or unsafe.
    ### IF AVAILABLE
    - Items with low confidence or uncertain detection. Start each with “+ If available:”.

    Rules:
    - Be concise and specific. One or two sentences per item.
    - Include **safety or hygiene warnings** when relevant.
    - Do **not invent** items that aren’t in the input.

    If the user asks a general question (not tied to detections or OCR data):
    - Act as a helpful first-aid/survival expert.
    - Provide clear, evidence-based guidance (e.g., “How to treat a burn,” “What to pack for an earthquake,” “How to find clean water”).
    - Keep answers **actionable and realistic** — avoid speculation or fiction.

    Tone: calm, factual, and reassuring. Avoid panic language.`

    const userContext = JSON.stringify({ ocrText, boxes, findings, unboxed })

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Convert this parsed result into practical guidance:\n\n${userContext}` },
        ],
      }),
    })

    if (!res.ok) {
      const msg = await res.text()
      return NextResponse.json({ ok: false, error: msg }, { status: 500 })
    }

    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content ?? 'No response.'
    return NextResponse.json({ ok: true, reply, source: 'openai' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 })
  }
}

function buildHeuristicSummary(input: any) {
  const { findings, unboxed } = input || {}
  const out: string[] = []
  if (findings) {
    const order: Priority[] = ['green', 'orange', 'red']
    for (const p of order) {
      const arr = findings[p] || []
      if (arr.length) {
        const title = p === 'green' ? 'USE THESE' : p === 'orange' ? 'NICE TO HAVE' : 'LEAVE'
        out.push(`**${title}**`)
        for (const it of arr) out.push(`- ${it.label}`)
      }
    }
  }
  const maybes = (unboxed || []) as { label: string; confidence?: number; priority: Priority }[]
  if (maybes.length) {
    out.push('**IF AVAILABLE**')
    for (const m of maybes) out.push(`- ${m.label}`)
  }
  return out.join('\n') || 'No items recognized.'
}