// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PrepPal',
  description: 'Disaster awareness and emergency-support assistant.',
  openGraph: {
    title: 'PrepPal',
    description:
      'Detect items and learn how to repurpose them for survival and first-aid.',
    url: 'https://prep-pal-mu.vercel.app',
    siteName: 'PrepPal',
    images: [
      {
        url: '/objects.png',
        width: 1200,
        height: 630,
        alt: 'PrepPal Kitchen-Aid object detection view',
      },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <div className="mx-auto max-w-6xl px-4">
          {children}
        </div>
      </body>
    </html>
  )
}