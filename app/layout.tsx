import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { AppShell } from '@/components/votely/ui'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Votely — Your voice, in the conversation', template: '%s · Votely' },
  description: 'A global community for thoughtful polls, perspectives, and conversations.',
  applicationName: 'Votely',
  icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f8f8fc',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased"><AppShell>{children}</AppShell>{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
