'use client'

import { useState } from 'react'
import SiteHeader from '@/components/site-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Page() {
  const [userText, setUserText] = useState('')
  const [reply, setReply] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChat = async () => {
    if (!userText.trim()) return
    try {
      setLoading(true)
      setReply(null)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ocrText: userText,
          boxes: [],
          findings: [],
          unboxed: [],
        }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Chat failed')
      setReply(data.reply)
    } catch (err: any) {
      setReply(`(Error) ${err.message || 'Chat failed'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="grid gap-8 py-10">
        {/* Existing upload intro card */}
        <Card>
          <CardHeader>
            <CardTitle>Find best resources in your vicinity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Upload a photo. We'll help you visually highlight items that can
              be repurposed and used in a worst-case scenario (e.g., clean cloths for bandaging, plastic wrap
              for occlusive dressings, etc.).
            </p>
            <Button asChild>
              <Link href="/upload">Get started</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 🆕 General survival Q&A */}
        <Card>
          <CardHeader>
            <CardTitle>Ask for Survival or First-Aid Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              className="w-full rounded border p-2 text-sm"
              rows={4}
              placeholder="Ask me anything — e.g., 'How do I purify water?', 'What should be in a basic first-aid kit?', or 'How do I stop a small burn from blistering?'"
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                disabled={loading || !userText.trim()}
                onClick={handleChat}
              >
                {loading ? 'Thinking…' : 'Ask'}
              </Button>
              <span className="text-xs text-neutral-500">Powered by the survival assistant.</span>
            </div>
            {reply && (
              <div className="prose prose-sm mt-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {reply}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}