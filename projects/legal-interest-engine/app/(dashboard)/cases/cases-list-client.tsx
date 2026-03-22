'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { CaseStatus } from '@prisma/client';

interface CaseItem {
  id: string;
  caseTitle: string;
  caseNumber: string | null;
  clientName: string | null;
  status: CaseStatus;
  createdAt: Date;
  _count: { computations: number };
}

interface CasesListClientProps {
  cases: CaseItem[];
}

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

export function CasesListClient({ cases }: CasesListClientProps) {
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');

  const filtered = useMemo(() => {
    if (!statusFilter) return cases;
    return cases.filter((c) => c.status === statusFilter);
  }, [cases, statusFilter]);

  if (cases.length === 0) {
    return (
      <div className="bg-surface border border-dashed border-border rounded-lg py-16 px-6 text-center">
        <p className="font-heading text-primary font-semibold mb-2">No cases yet</p>
        <p className="font-body text-secondary text-sm mb-4">
          Create your first case to start organizing computations.
        </p>
        <Link
          href="/cases/new"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary-light transition-colors duration-150"
        >
          New Case
        </Link>
      </div>
    );
  }

  const allStatuses: CaseStatus[] = ['active', 'demand_sent', 'filed', 'judgment', 'execution', 'closed'];

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={[
            'px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors duration-150 border',
            statusFilter === '' ? 'bg-primary text-white border-primary' : 'border-border text-secondary hover:border-primary/40',
          ].join(' ')}
        >
          All
        </button>
        {allStatuses.map((s) => {
          const count = cases.filter((c) => c.status === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors duration-150 border',
                statusFilter === s ? 'bg-primary text-white border-primary' : 'border-border text-secondary hover:border-primary/40',
              ].join(' ')}
            >
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm font-body text-muted text-center py-8">No cases match this filter.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="flex flex-col bg-surface border border-border rounded-lg px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all duration-150 gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-body font-semibold text-primary text-sm truncate">
                    {c.caseTitle}
                  </p>
                  {c.caseNumber && (
                    <p className="font-mono text-xs text-muted mt-0.5">{c.caseNumber}</p>
                  )}
                </div>
                <Badge variant={STATUS_VARIANT[c.status]}>
                  {STATUS_LABELS[c.status]}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2">
                {c.clientName ? (
                  <p className="font-body text-xs text-secondary truncate">{c.clientName}</p>
                ) : (
                  <span />
                )}
                <p className="font-body text-xs text-muted shrink-0">
                  {c._count.computations} computation{c._count.computations !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
