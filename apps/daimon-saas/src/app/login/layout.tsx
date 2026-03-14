import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Daimon account to manage your Discord AI bot.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Sign In — Daimon',
    description: 'Sign in to your Daimon account.',
    url: 'https://daimon.ai/login',
    images: [{ url: '/og/auth.png', width: 1200, height: 630, alt: 'Sign in to Daimon' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In — Daimon',
    description: 'Sign in to your Daimon account.',
    images: ['/og/auth.png'],
  },
  alternates: { canonical: 'https://daimon.ai/login' },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
