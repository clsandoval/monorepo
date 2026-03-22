'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { formatPeso } from '@/lib/engine/format';
import { format } from 'date-fns';
import type { CaseStatus } from '@prisma/client';

const STATUS_LABELS: Record<CaseStatus, string> = {
  active: 'Active',
  demand_sent: 'Demand Sent',
  filed: 'Filed',
  judgment: 'Judgment',
  execution: 'Execution',
  closed: 'Closed',
};

const STATUS_VARIANT: Record<CaseStatus, 'active' | 'demand_sent' | 'filed' | 'judgment' | 'execution' | 'closed' | 'default'> = {
  active: 'active',
  demand_sent: 'demand_sent',
  filed: 'filed',
  judgment: 'judgment',
  execution: 'execution',
  closed: 'closed',
};

const ALL_STATUSES: CaseStatus[] = ['active', 'demand_sent', 'filed', 'judgment', 'execution', 'closed'];

interface ComputationRef {
  id: string;
  label: string | null;
  tags?: string[];
  grandTotal: number;
  createdAt: string;
}

interface CaseDetailClientProps {
  caseRecord: {
    id: string;
    caseTitle: string;
    caseNumber: string | null;
    courtBranch: string | null;
    clientName: string | null;
    opposingParty: string | null;
    status: CaseStatus;
    notes: string | null;
    computations: ComputationRef[];
  };
  availableComputations: Omit<ComputationRef, 'tags'>[];
}

export function CaseDetailClient({ caseRecord, availableComputations }: CaseDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<CaseStatus>(caseRecord.status);
  const [notes, setNotes] = useState(caseRecord.notes ?? '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkingId, setLinkingId] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkedComputations, setLinkedComputations] = useState(caseRecord.computations);

  async function handleStatusChange(newStatus: CaseStatus) {
    setStatus(newStatus);
    await fetch(`/api/cases/${caseRecord.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      await fetch(`/api/cases/${caseRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      setEditingNotes(false);
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/cases/${caseRecord.id}`, { method: 'DELETE' });
      router.push('/cases');
    } finally {
      setDeleting(false);
    }
  }

  async function handleLinkComputation() {
    if (!linkingId) return;
    setLinking(true);
    try {
      const res = await fetch(`/api/cases/${caseRecord.id}/computations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ computationId: linkingId }),
      });
      if (res.ok) {
        const linked = availableComputations.find((c) => c.id === linkingId);
        if (linked) {
          setLinkedComputations((prev) => [
            { ...linked, tags: [] },
            ...prev,
          ]);
        }
        setLinkOpen(false);
        setLinkingId('');
      }
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="font-heading text-2xl font-semibold text-primary mb-1 truncate">
            {caseRecord.caseTitle}
          </h1>
          {caseRecord.caseNumber && (
            <p className="font-mono text-sm text-muted">{caseRecord.caseNumber}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
        >
          Delete case
        </Button>
      </div>

      {/* Case info */}
      <div className="bg-surface border border-border rounded-lg px-6 py-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {caseRecord.courtBranch && (
            <div>
              <p className="text-xs font-body text-muted uppercase tracking-widest mb-1">Court / Branch</p>
              <p className="font-body text-sm text-primary">{caseRecord.courtBranch}</p>
            </div>
          )}
          {caseRecord.clientName && (
            <div>
              <p className="text-xs font-body text-muted uppercase tracking-widest mb-1">Client</p>
              <p className="font-body text-sm text-primary">{caseRecord.clientName}</p>
            </div>
          )}
          {caseRecord.opposingParty && (
            <div>
              <p className="text-xs font-body text-muted uppercase tracking-widest mb-1">Opposing Party</p>
              <p className="font-body text-sm text-primary">{caseRecord.opposingParty}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-body text-muted uppercase tracking-widest mb-1">Status</p>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm font-body text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Computations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-primary text-lg">
            Computations ({linkedComputations.length})
          </h2>
          {availableComputations.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setLinkOpen(true)}>
              Link computation
            </Button>
          )}
        </div>

        {linkedComputations.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-lg py-8 px-6 text-center">
            <p className="font-body text-secondary text-sm mb-3">No computations linked to this case.</p>
            {availableComputations.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setLinkOpen(true)}>
                Link a computation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {linkedComputations.map((comp) => (
              <Link
                key={comp.id}
                href={`/computations/${comp.id}`}
                className="flex items-center gap-4 bg-surface border border-border rounded-lg px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all duration-150"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-primary text-sm truncate">
                    {comp.label ?? 'Untitled computation'}
                  </p>
                  <p className="font-body text-muted text-xs mt-0.5">
                    {format(new Date(comp.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <p className="font-mono text-sm font-semibold text-primary shrink-0">
                  {formatPeso(comp.grandTotal)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-primary text-lg">Notes</h2>
          {!editingNotes && (
            <button
              onClick={() => setEditingNotes(true)}
              className="text-xs font-body text-secondary hover:text-primary transition-colors duration-150 underline underline-offset-2"
            >
              Edit
            </button>
          )}
        </div>

        {editingNotes ? (
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-body text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Add case notes…"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="primary" onClick={handleSaveNotes} loading={savingNotes}>
                Save notes
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingNotes(false); setNotes(caseRecord.notes ?? ''); }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="bg-surface border border-dashed border-border rounded-lg px-5 py-4 min-h-[80px] cursor-text"
            onClick={() => setEditingNotes(true)}
          >
            {notes ? (
              <p className="font-body text-sm text-secondary whitespace-pre-wrap leading-relaxed">{notes}</p>
            ) : (
              <p className="font-body text-sm text-muted italic">Click to add notes…</p>
            )}
          </div>
        )}
      </div>

      {/* Link computation dialog */}
      <Dialog
        open={linkOpen}
        onClose={() => { setLinkOpen(false); setLinkingId(''); }}
        title="Link a computation"
      >
        <div className="space-y-4">
          <p className="text-sm font-body text-secondary">
            Select a computation to link to this case.
          </p>
          <select
            value={linkingId}
            onChange={(e) => setLinkingId(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-body text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a computation…</option>
            {availableComputations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label ?? 'Untitled'} — {formatPeso(c.grandTotal)} ({format(new Date(c.createdAt), 'MMM d, yyyy')})
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { setLinkOpen(false); setLinkingId(''); }}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleLinkComputation}
            loading={linking}
            disabled={!linkingId}
          >
            Link
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete case"
      >
        <p className="text-sm font-body text-secondary leading-relaxed">
          Are you sure you want to delete this case? Linked computations will not be deleted.
          This action cannot be undone.
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
            Delete case
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
