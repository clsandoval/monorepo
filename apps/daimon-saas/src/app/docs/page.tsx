import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'Learn how to set up and use Daimon — the AI operating system for Discord. Quick start guide, tool reference, billing, and FAQ.',
  openGraph: {
    title: 'Daimon Documentation',
    description:
      'Everything you need to connect your Discord server to 50+ AI-powered tools. Quick start, tool reference, billing guides.',
    url: 'https://daimon.ai/docs',
    type: 'website',
    images: [{ url: '/og/docs.png', width: 1200, height: 630, alt: 'Daimon Documentation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daimon Documentation',
    description: 'Everything you need to connect your Discord server to 50+ AI-powered tools.',
    images: ['/og/docs.png'],
  },
  alternates: { canonical: 'https://daimon.ai/docs' },
}

export default function DocsIndexPage() {
  redirect('/docs/quick-start')
}
