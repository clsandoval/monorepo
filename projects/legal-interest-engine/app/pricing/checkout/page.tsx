'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PLAN_LABELS: Record<string, string> = {
  consumer: 'Consumer',
  professional: 'Professional',
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const [status, setStatus] = useState<'loading' | 'placeholder' | 'error'>('loading');

  useEffect(() => {
    if (!plan || !['consumer', 'professional'].includes(plan)) {
      setStatus('error');
      return;
    }

    // PayMongo integration placeholder:
    // When credentials are available, this will call POST /api/checkout/session
    // with { plan } and redirect to the returned checkout URL.
    //
    // Example flow (to be implemented):
    //   const res = await fetch('/api/checkout/session', {
    //     method: 'POST',
    //     body: JSON.stringify({ plan }),
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    //   const { checkoutUrl } = await res.json();
    //   window.location.href = checkoutUrl;

    // For now, show the placeholder immediately.
    setStatus('placeholder');
  }, [plan]);

  const planLabel = plan ? (PLAN_LABELS[plan] ?? plan) : 'Unknown';

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <p className="font-heading text-xl text-primary mb-3">Invalid plan</p>
          <p className="font-body text-secondary text-sm mb-6">
            The plan you selected is not recognized. Please return to pricing and try again.
          </p>
          <Link
            href="/pricing"
            className="font-body text-sm text-primary underline underline-offset-4"
          >
            Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-body text-secondary text-sm">Redirecting to payment...</p>
        </div>
      </div>
    );
  }

  // Placeholder state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-surface border border-border rounded-lg p-8 shadow-sm text-center">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
          </div>

          <h1 className="font-heading text-2xl font-semibold text-primary mb-2">
            {planLabel} Plan
          </h1>
          <p className="font-body text-secondary text-sm mb-6 leading-relaxed">
            Payment integration is coming soon.
          </p>

          {/* Placeholder message box */}
          <div className="bg-background border border-border rounded-md px-5 py-4 mb-6 text-left">
            <p className="font-body text-sm text-primary font-medium mb-1">
              Payment integration coming soon.
            </p>
            <p className="font-body text-sm text-secondary leading-relaxed">
              We&apos;re finalizing our PayMongo integration. To activate the{' '}
              <span className="font-medium text-primary">{planLabel}</span> plan early,
              contact us and we&apos;ll set you up manually.
            </p>
          </div>

          <a
            href="mailto:hello@legalinterestengine.ph?subject=Plan%20Activation%20Request"
            className="block w-full text-center px-4 py-2.5 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary/90 transition-colors duration-150 mb-3"
          >
            Contact us to activate your plan
          </a>

          <Link
            href="/pricing"
            className="block w-full text-center px-4 py-2.5 rounded-md border border-border text-primary font-body font-medium text-sm hover:bg-primary/5 transition-colors duration-150"
          >
            Back to Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
