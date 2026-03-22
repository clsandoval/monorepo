'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { formatPeso } from '@/lib/engine/format';
import type { Computation } from '@prisma/client';

interface ComputationsListClientProps {
  computations: Computation[];
}

type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest';

export function ComputationsListClient({ computations }: ComputationsListClientProps) {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sort, setSort] = useState<SortOrder>('newest');

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    computations.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [computations]);

  const filtered = useMemo(() => {
    let result = [...computations];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.label?.toLowerCase().includes(q));
    }

    if (tagFilter) {
      result = result.filter((c) => c.tags.includes(tagFilter));
    }

    result.sort((a, b) => {
      const aResult = a.result as { grandTotal?: number };
      const bResult = b.result as { grandTotal?: number };
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'highest') return (bResult?.grandTotal ?? 0) - (aResult?.grandTotal ?? 0);
      if (sort === 'lowest') return (aResult?.grandTotal ?? 0) - (bResult?.grandTotal ?? 0);
      return 0;
    });

    return result;
  }, [computations, search, tagFilter, sort]);

  if (computations.length === 0) {
    return (
      <div className="bg-surface border border-dashed border-border rounded-lg py-16 px-6 text-center">
        <p className="font-heading text-primary font-semibold mb-2">No computations yet</p>
        <p className="font-body text-secondary text-sm mb-4">
          Create your first interest computation to get started.
        </p>
        <Link
          href="/computations/new"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary-light transition-colors duration-150"
        >
          New Computation
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search by label…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm font-body text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {allTags.length > 0 && (
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-body text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOrder)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-body text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest amount</option>
          <option value="lowest">Lowest amount</option>
        </select>

        <Link
          href="/computations/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary-light transition-colors duration-150 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New
        </Link>
      </div>

      {/* Results count */}
      {(search || tagFilter) && (
        <p className="text-xs font-body text-muted">
          Showing {filtered.length} of {computations.length} computations
        </p>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-sm font-body text-muted text-center py-8">
          No computations match your search.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((comp) => {
            const result = comp.result as { grandTotal?: number; totalPrincipal?: number };
            const grandTotal = result?.grandTotal ?? 0;

            return (
              <Link
                key={comp.id}
                href={`/computations/${comp.id}`}
                className="flex items-center gap-4 bg-surface border border-border rounded-lg px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all duration-150"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-body font-medium text-primary text-sm truncate">
                    {comp.label ?? 'Untitled computation'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <p className="font-body text-muted text-xs">
                      {format(new Date(comp.createdAt), 'MMM d, yyyy')}
                    </p>
                    {comp.tags.map((tag) => (
                      <Badge key={tag} variant="default">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-semibold text-primary">
                    {formatPeso(grandTotal)}
                  </p>
                  {result?.totalPrincipal != null && (
                    <p className="font-mono text-xs text-muted mt-0.5">
                      Principal: {formatPeso(result.totalPrincipal)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
