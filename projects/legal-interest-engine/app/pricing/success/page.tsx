import { Suspense } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ---------------------------------------------------------------------------
// Plan feature lists
// ---------------------------------------------------------------------------
const PLAN_FEATURES: Record<string, string[]> = {
  consumer: [
    'Unlimited computations',
    'Save and manage computation history',
    'Download interest computation worksheets (PDF)',
    'Download plain-language summary memos (PDF)',
    'All free-tier features',
  ],
  professional: [
    'Everything in Consumer',
    'Generate formal demand letters (PDF)',
    'Generate court-ready annexes for NLRC / civil court',
    'Full case management',
    'Link computations to cases',
  ],
};

const PLAN_LABELS: Record<string, string> = {
  consumer: 'Consumer',
  professional: 'Professional',
};

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-primary shrink-0 mt-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mx-auto mb-5">
      <svg
        className="w-7 h-7 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
interface SuccessPageProps {
  searchParams: Promise<{ plan?: string; session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const plan = params.plan ?? 'consumer';
  const session = await getServerSession(authOptions);

  const planLabel = PLAN_LABELS[plan] ?? 'Professional';
  const features = PLAN_FEATURES[plan] ?? PLAN_FEATURES.professional;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        {/* Main card */}
        <div className="bg-surface border border-border rounded-lg p-8 shadow-sm text-center mb-4">
          <SuccessIcon />

          <h1 className="font-heading text-2xl font-semibold text-primary mb-2">
            Welcome to {planLabel}!
          </h1>

          <p className="font-body text-secondary text-sm leading-relaxed mb-6">
            Your subscription is active.
            {session?.user?.email && (
              <>
                {' '}A confirmation has been sent to{' '}
                <span className="font-medium text-primary">{session.user.email}</span>.
              </>
            )}
          </p>

          {/* Unlocked features */}
          <div className="bg-background border border-border rounded-md px-5 py-4 text-left mb-6">
            <p className="font-body text-xs font-semibold text-secondary uppercase tracking-widest mb-3">
              What you&apos;ve unlocked
            </p>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span className="font-body text-sm text-secondary leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <Link
            href="/computations/new"
            className="block w-full text-center px-4 py-2.5 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary/90 transition-colors duration-150 mb-3"
          >
            Start Computing
          </Link>

          <Link
            href="/dashboard"
            className="block w-full text-center px-4 py-2.5 rounded-md border border-border text-primary font-body font-medium text-sm hover:bg-primary/5 transition-colors duration-150"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Sub-note */}
        <p className="font-body text-center text-xs text-muted px-4">
          You can manage your subscription anytime from{' '}
          <Link href="/settings" className="underline underline-offset-2 text-secondary hover:text-primary transition-colors">
            Account Settings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
