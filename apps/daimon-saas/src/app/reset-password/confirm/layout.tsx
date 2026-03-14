import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Set New Password',
  description: 'Set a new password for your Daimon account.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://daimon.ai/reset-password/confirm' },
};

export default function ResetPasswordConfirmLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
