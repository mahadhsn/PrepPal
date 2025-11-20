'use client'
import { useState, useEffect } from 'react' 
import SiteHeader from '@/components/site-header'
import ImageAnnotator from '@/components/image-annotator/ImageAnnotator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Priority = 'green' | 'orange' | 'red'

type Box = {
  id: string
  box: { x0: number; y0: number; x1: number; y1: number }
  label: string
  score: number
  priority: Priority
}

export default function UploadPage() {
  const [img, setImg] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const [boxes, setBoxes] = useState<Box[]>([])

  const [findings, setFindings] = useState<any[]>([])
  const [unboxed, setUnboxed] = useState<
    { key?: string; label: string; confidence: number; priority: Priority }[]
  >([])

  const [busy, setBusy] = useState(false)
  const [ocrText, setOcrText] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatReply, setChatReply] = useState<string | null>(null)
  const [lastChatKey, setLastChatKey] = useState<string | null>(null)

  const [freeText, setFreeText] = useState('')
  const [freeChatLoading, setFreeChatLoading] = useState(false)
  const [freeChatReply, setFreeChatReply] = useState<string | null>(null)

  const onFile = (f: File) => {
    setBoxes([])
    setFindings([])
    setUnboxed([])
    setImg(null)
    setChatReply(null)
    setOcrText('')
    setLastChatKey(null)
    setFile(f)

    const reader = new FileReader()
    reader.onload = () => setImg(reader.result as string)
    reader.readAsDataURL(f)
  }

  const detect = async () => {
    if (!file) return
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch('/api/detect', { method: 'POST', body: fd })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'detect failed')

      setBoxes(json.boxes as Box[])

      setFindings(json.findings || [])
      setUnboxed(json.unboxed || [])
      setOcrText(json.ocrText ?? '')
      setChatReply(null)
      setLastChatKey(null)
    } catch (e: any) {
      alert(e.message || 'Detection error')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    const hasData =
      (ocrText && ocrText.trim().length > 0) ||
      (boxes && boxes.length > 0) ||
      (unboxed && unboxed.length > 0) ||
      (findings && findings.length > 0)

    if (!hasData || chatLoading) return

    const key = JSON.stringify({
      ocr: ocrText.slice(0, 500),
      b: boxes.map(b => b.label),
      u: unboxed.map(u => u.label),
      f: findings.length
    })

    if (key === lastChatKey) return
    setLastChatKey(key)

    ;(async () => {
      try {
        setChatLoading(true)
        setChatReply(null)

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ocrText, boxes, findings, unboxed }),
        })

        const data = await res.json()
        if (!data.ok) throw new Error(data.error || 'Chat failed')

        setChatReply(data.reply)
      } catch (err: any) {
        setChatReply(`(Error) ${err.message || 'Chat failed'}`)
      } finally {
        setChatLoading(false)
      }
    })()
  }, [ocrText, boxes, unboxed, findings, chatLoading, lastChatKey])

  return (
    <>
      <SiteHeader />
      <main className="grid gap-6 pb-12">

        {/* Upload card */}
        <Card>
          <CardHeader><CardTitle>Upload a photo</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <Label htmlFor="file">Image</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <span className='text-[11px]'>
                works best with small (*.JPEG)'s
              </span>
              <Button className="w-40 h-8"onClick={detect} disabled={!file || busy}>
              {busy ? 'Detecting…' : 'Detect first-aid items'}
              </Button>
            </div>
            
          </CardContent>
        </Card>

        {img && (
          <Card>
            <CardHeader><CardTitle>Results</CardTitle></CardHeader>
            <CardContent className="space-y-4">

              <div className="flex justify-center items-center">
                <div className="w-full h-auto max-w-[90%] md:max-w-[70%]">
                  <ImageAnnotator src={img} boxes={boxes} />
                </div>
              </div>

              {/* Unboxed */}
              {unboxed.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Also detected (no box):</div>
                  <div className="flex flex-wrap gap-2">
                    {[...unboxed]
                      .sort((a, b) => {
                        const order = { green: 0, orange: 1, red: 2 } as const
                        return order[a.priority] - order[b.priority]
                      })
                      .map((u, i) => {
                        const color =
                          u.priority === 'green'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : u.priority === 'orange'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        return (
                          <span
                            key={`${u.label}-${i}`}
                            className={`text-xs border px-2 py-1 rounded ${color}`}
                            title={`Confidence ${(u.confidence * 100).toFixed(0)}%`}
                          >
                            {u.label} {(u.confidence ?? 0) > 0 ? `(${(u.confidence * 100).toFixed(0)}%)` : ''}
                          </span>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Chatbot output */}
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600">
                    {chatLoading ? 'Generating survival tips…' : 'Survival tips'}
                  </span>
                </div>
                {chatReply && (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm mt-3">
                    {chatReply}
                  </ReactMarkdown>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Free text chat */}
        <Card>
          <CardHeader><CardTitle>Chat without image</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="free-text">Describe the items you have</Label>
            <textarea
              id="free-text"
              className="w-full rounded border p-2 text-sm"
              rows={4}
              placeholder="e.g., towel, plastic wrap, zip bag, knife, lighter..."
              value={freeText}
              onChange={e => setFreeText(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                disabled={freeChatLoading || !freeText.trim()}
                onClick={async () => {
                  try {
                    setFreeChatLoading(true)
                    setFreeChatReply(null)

                    const res = await fetch('/api/chat', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ocrText: freeText,
                        boxes: [],
                        findings: [],
                        unboxed: [],
                      }),
                    })

                    const data = await res.json()
                    if (!data.ok) throw new Error(data.error || 'Chat failed')
                    setFreeChatReply(data.reply)
                  } catch (err: any) {
                    setFreeChatReply(`(Error) ${err.message || 'Chat failed'}`)
                  } finally {
                    setFreeChatLoading(false)
                  }
                }}
              >
                {freeChatLoading ? 'Thinking…' : 'Generate survival tips'}
              </Button>
            </div>

            {freeChatReply && (
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm mt-2">
                {freeChatReply}
              </ReactMarkdown>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}