'use client'
import { useEffect, useRef, useState } from 'react'
import type { Box, NormBox, Priority } from './types'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function toPx(b: NormBox, w: number, h: number) {
  return {
    left: b.x0 * w,
    top: b.y0 * h,
    width: Math.max(0, (b.x1 - b.x0) * w),
    height: Math.max(0, (b.y1 - b.y0) * h),
  }
}

function borderClass(p: Priority) {
  if (p === 'green') return 'border-emerald-500/90 bg-emerald-500/10'
  if (p === 'orange') return 'border-amber-500/90 bg-amber-500/10'
  return 'border-rose-500/90 bg-rose-500/10'
}

export default function ImageAnnotator({
  src,
  boxes = [],
}: {
  src: string
  boxes?: Box[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  // Update dimensions when the container or image resizes
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const imgEl = el.querySelector('img') as HTMLImageElement | null
      if (imgEl) {
        setDims({ w: imgEl.clientWidth, h: imgEl.clientHeight })
      }
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="relative w-full">
        <Image
          src={src}
          alt="uploaded"
          width={1600}
          height={1200}
          className="h-auto w-full rounded-xl border"
          onLoad={() => {
            const el = containerRef.current
            if (!el) return
            const imgEl = el.querySelector('img') as HTMLImageElement | null
            if (imgEl) {
              setDims({ w: imgEl.clientWidth, h: imgEl.clientHeight })
            }
          }}
        />

        {boxes.map((b) => {
          const s = toPx(b.box, dims.w, dims.h)
          return (
            <div
              key={b.id}
              className={cn(
                'absolute rounded-md border-2',
                borderClass(b.priority)
              )}
              style={s}
            >
              <span className="absolute -top-6 left-0">
                <Badge>
                  {b.label}
                  {typeof b.score === 'number'
                    ? ` ${(b.score * 100).toFixed(0)}%`
                    : ''}
                </Badge>
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-neutral-700">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-emerald-500/70 border border-emerald-600" />
          Green: Take!
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-amber-500/70 border border-amber-600" />
          Orange: Take if have space!
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-rose-500/70 border border-rose-600" />
          Red: Leave behind!
        </span>
      </div>
    </div>
  )
}