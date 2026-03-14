import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started Free',
  description:
    'Create your free Daimon account. Connect your Discord server to 50+ tools powered by Claude AI. No credit card required.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Get Started Free — Daimon',
    description: 'Create a free account. Connect your Discord server to Claude AI in minutes.',
    url: 'https://daimon.ai/signup',
    images: [{ url: '/og/auth.png', width: 1200, height: 630, alt: 'Create your Daimon account' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Started Free — Daimon',
    description: 'Create a free account. Connect your Discord server to Claude AI in minutes.',
    images: ['/og/auth.png'],
  },
  alternates: { canonical: 'https://daimon.ai/signup' },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
