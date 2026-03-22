'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ResultsBreakdown } from '@/components/computation/results-breakdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import type { ComputationResult } from '@/lib/engine/types';

interface LinkedCase {
  id: string;
  caseTitle: string;
}

interface ComputationDetailClientProps {
  computation: {
    id: string;
    label: string | null;
    tags: string[];
    result: ComputationResult;
    createdAt: string;
    cases: LinkedCase[];
  };
  tier: 'free' | 'consumer' | 'professional';
}

export function ComputationDetailClient({ computation, tier }: ComputationDetailClientProps) {
  const router = useRouter();
  const [label, setLabel] = useState(computation.label ?? '');
  const [editingLabel, setEditingLabel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveLabel() {
    setSaving(true);
    try {
      await fetch(`/api/computations/${computation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim() || null }),
      });
      setEditingLabel(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/computations/${computation.id}`, {
        method: 'DELETE',
      });
      router.push('/computations');
    } finally {
      setDeleting(false);
    }
  }

  async function handleGenerateDocument(type: string) {
    const res = await fetch('/api/documents/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ computationId: computation.id, type }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
      }
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          {editingLabel ? (
            <div className="flex items-center gap-2">
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Computation label"
                className="text-lg font-heading"
                autoFocus
              />
              <Button size="sm" variant="primary" onClick={handleSaveLabel} loading={saving}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingLabel(false); setLabel(computation.label ?? ''); }}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="font-heading text-2xl font-semibold text-primary truncate">
                {label || 'Untitled computation'}
              </h1>
              <button
                onClick={() => setEditingLabel(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded text-muted hover:text-primary"
                aria-label="Edit label"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}

          {/* Tags */}
          {computation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {computation.tags.map((tag) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Linked cases */}
          {computation.cases.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {computation.cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="text-xs font-body text-secondary hover:text-primary underline underline-offset-2 transition-colors duration-150"
                >
                  {c.caseTitle}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
        >
          Delete
        </Button>
      </div>

      {/* Results */}
      <ResultsBreakdown
        result={computation.result}
        tier={tier}
        label={label || undefined}
        onGenerateDocument={handleGenerateDocument}
      />

      {/* Delete confirmation */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete computation"
      >
        <p className="text-sm font-body text-secondary leading-relaxed">
          Are you sure you want to delete this computation? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            loading={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
