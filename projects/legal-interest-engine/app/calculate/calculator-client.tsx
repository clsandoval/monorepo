'use client';

import React, { useState } from 'react';
import { QuickForm } from '@/components/computation/quick-form';
import { WizardForm } from '@/components/computation/wizard-form';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { ComputationResult } from '@/lib/engine/types';

interface CalculatorClientProps {
  tier: 'free' | 'consumer' | 'professional';
  isAuthenticated: boolean;
}

export function CalculatorClient({ tier, isAuthenticated }: CalculatorClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'quick' | 'wizard'>('quick');
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  function handleSave(result: ComputationResult) {
    if (!isAuthenticated) {
      setLoginPromptOpen(true);
      return;
    }
    // Authenticated user — redirect to new computation page with result
    // The result will be saved via the dashboard flow
    router.push('/computations/new');
  }

  return (
    <>
      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-lg w-fit mb-6">
        <button
          onClick={() => setMode('quick')}
          className={[
            'px-4 py-1.5 rounded-md text-sm font-body font-medium transition-colors duration-150',
            mode === 'quick'
              ? 'bg-primary text-white'
              : 'text-secondary hover:text-primary',
          ].join(' ')}
        >
          Quick
        </button>
        <button
          onClick={() => setMode('wizard')}
          className={[
            'px-4 py-1.5 rounded-md text-sm font-body font-medium transition-colors duration-150',
            mode === 'wizard'
              ? 'bg-primary text-white'
              : 'text-secondary hover:text-primary',
          ].join(' ')}
        >
          Step-by-step
        </button>
      </div>

      {mode === 'quick' ? (
        <QuickForm
          onSave={handleSave}
          onSwitchToWizard={() => setMode('wizard')}
          tier={tier}
        />
      ) : (
        <WizardForm
          onSave={handleSave}
          onSwitchToQuick={() => setMode('quick')}
          tier={tier}
        />
      )}

      {/* Login prompt for anonymous save */}
      <Dialog
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        title="Save your computation"
      >
        <div className="space-y-3">
          <p className="text-sm font-body text-secondary leading-relaxed">
            Create a free account to save this computation and access your history from
            any device.
          </p>
          <ul className="space-y-1.5 text-sm font-body text-secondary">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              3 free computations per month
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Save and revisit computations
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Upgrade anytime for documents &amp; cases
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setLoginPromptOpen(false)}>
            Continue without saving
          </Button>
          <Button variant="primary" onClick={() => router.push('/signup')}>
            Create free account
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
