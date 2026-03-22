'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function NewCaseClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    caseTitle: '',
    caseNumber: '',
    courtBranch: '',
    clientName: '',
    opposingParty: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.caseTitle.trim()) {
      setError('Case title is required.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: form.caseTitle.trim(),
          caseNumber: form.caseNumber.trim() || null,
          courtBranch: form.courtBranch.trim() || null,
          clientName: form.clientName.trim() || null,
          opposingParty: form.opposingParty.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create case. Please try again.');
        return;
      }

      const data = await res.json();
      router.push(`/cases/${data.id}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg px-6 py-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Case Title *"
          placeholder="e.g. Dela Cruz v. Santos"
          value={form.caseTitle}
          onChange={(e) => set('caseTitle', e.target.value)}
          required
        />

        <Input
          label="Case Number (optional)"
          placeholder="e.g. Civil Case No. 2024-0001"
          value={form.caseNumber}
          onChange={(e) => set('caseNumber', e.target.value)}
        />

        <Input
          label="Court / Branch (optional)"
          placeholder="e.g. RTC Manila Branch 1"
          value={form.courtBranch}
          onChange={(e) => set('courtBranch', e.target.value)}
        />

        <Input
          label="Client Name (optional)"
          placeholder="e.g. Juan Dela Cruz"
          value={form.clientName}
          onChange={(e) => set('clientName', e.target.value)}
        />

        <Input
          label="Opposing Party (optional)"
          placeholder="e.g. Pedro Santos"
          value={form.opposingParty}
          onChange={(e) => set('opposingParty', e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] tracking-[1.5px] uppercase text-muted font-body font-medium select-none">
            Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={4}
            placeholder="Case background, key dates, strategic notes…"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-body text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 font-body">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/cases')}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            Create case
          </Button>
        </div>
      </form>
    </div>
  );
}
