'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-6">
      <Link href="/" className="font-semibold tracking-tight text-lg">
        PrepPal
      </Link>

      <nav className="flex gap-2">
        <Button asChild variant="ghost">
          <Link href="/">Home</Link>
        </Button>

        <Button asChild variant="ghost">
          <Link href="/upload">Upload</Link>
        </Button>

        <Button
          asChild
          variant="default"
        >
          <Link
            href="https://natural-disaster-map.vercel.app"
          >
            Interactive Global Map
          </Link>
        </Button>
      </nav>
    </header>
  )
}