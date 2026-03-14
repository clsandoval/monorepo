import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your Daimon account password.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Reset Password — Daimon',
    description: 'Reset your Daimon account password.',
    url: 'https://daimon.ai/reset-password',
    images: [{ url: '/og/auth.png', width: 1200, height: 630, alt: 'Reset your Daimon password' }],
  },
  alternates: { canonical: 'https://daimon.ai/reset-password' },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
