'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuickForm } from '@/components/computation/quick-form';
import { WizardForm } from '@/components/computation/wizard-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ComputationResult } from '@/lib/engine/types';

interface NewComputationClientProps {
  tier: 'free' | 'consumer' | 'professional';
}

export function NewComputationClient({ tier }: NewComputationClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'quick' | 'wizard'>('quick');
  const [pendingResult, setPendingResult] = useState<ComputationResult | null>(null);
  const [label, setLabel] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleSave(result: ComputationResult) {
    setPendingResult(result);
  }

  async function handleSubmitSave(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingResult) return;

    setSaving(true);
    setSaveError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/computations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: pendingResult.input,
          result: pendingResult,
          label: label.trim() || null,
          tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error ?? 'Failed to save. Please try again.');
        return;
      }

      const data = await res.json();
      router.push(`/computations/${data.id}`);
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Show save form after computation
  if (pendingResult) {
    return (
      <div className="max-w-lg space-y-6">
        <div className="bg-surface border border-border rounded-lg px-6 py-5">
          <h2 className="font-heading font-semibold text-primary text-lg mb-1">
            Save computation
          </h2>
          <p className="font-body text-secondary text-sm mb-5">
            Add a label and tags to organize this computation.
          </p>

          <form onSubmit={handleSubmitSave} className="space-y-4">
            <Input
              label="Label"
              placeholder="e.g. Dela Cruz v. Santos — loan interest"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />

            <Input
              label="Tags (comma-separated, optional)"
              placeholder="e.g. civil, 2024, loan"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />

            {saveError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 font-body">
                {saveError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPendingResult(null)}
              >
                ← Back to form
              </Button>
              <Button type="submit" variant="primary" loading={saving}>
                Save computation
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-lg w-fit mb-6">
        <button
          onClick={() => setMode('quick')}
          className={[
            'px-4 py-1.5 rounded-md text-sm font-body font-medium transition-colors duration-150',
            mode === 'quick' ? 'bg-primary text-white' : 'text-secondary hover:text-primary',
          ].join(' ')}
        >
          Quick
        </button>
        <button
          onClick={() => setMode('wizard')}
          className={[
            'px-4 py-1.5 rounded-md text-sm font-body font-medium transition-colors duration-150',
            mode === 'wizard' ? 'bg-primary text-white' : 'text-secondary hover:text-primary',
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
    </>
  );
}
