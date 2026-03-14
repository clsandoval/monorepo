import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tool Reference',
  description:
    'Complete reference for all 50+ tools in Daimon — Discord, GitHub, Linear, Toggl, Google Analytics, Fly.io, LinkedIn, and more.',
  openGraph: {
    title: 'Tool Reference — Daimon Docs',
    description:
      'Complete reference for all 50+ tools in Daimon. Discord, GitHub, Linear, Toggl, Google Analytics, and more.',
    url: 'https://daimon.ai/docs/tools',
    images: [
      {
        url: '/og/docs-tools.png',
        width: 1200,
        height: 630,
        alt: 'Daimon Tool Reference — 50+ AI-powered tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tool Reference — Daimon Docs',
    description: 'Complete reference for all 50+ tools in Daimon.',
    images: ['/og/docs-tools.png'],
  },
  alternates: { canonical: 'https://daimon.ai/docs/tools' },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
