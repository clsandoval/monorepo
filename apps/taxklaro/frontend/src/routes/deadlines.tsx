import { useState, useEffect, useCallback } from 'react';
import { createRoute } from '@tanstack/react-router';
import { authenticatedRoute } from './__root';
import { authGuard } from '../lib/auth-guard';
import { useOrganization } from '../hooks/useOrganization';
import { listComputations } from '../lib/computations';
import { CenteredColumn } from '../components/layout/CenteredColumn';
import { ListRow } from '../components/shared/ListRow';
import { EmptyState } from '../components/shared/EmptyState';
import type { ComputationListItem } from '../types/org';

export const DeadlinesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/deadlines',
  beforeLoad: authGuard,
  component: DeadlinesPage,
});

interface DeadlineEntry {
  key: string;
  milestoneKey: string;
  dueDate: string;
  description: string;
  completed: boolean;
  computationTitle: string;
}

/** A grouped deadline: one row per unique date+milestoneKey, listing all computations that share it. */
interface GroupedDeadline {
  groupKey: string;
  milestoneKey: string;
  dueDate: string;
  description: string;
  completed: boolean;
  computationTitles: string[];
  isUrgent: boolean;
}

function isUrgentDate(dueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const daysUntil = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntil <= 30;
}

function formatDueDate(dueDate: string): string {
  return new Date(dueDate + 'T00:00:00').toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Derive filing deadlines from computation metadata, grouped by date+type. */
function deriveDeadlines(computations: ComputationListItem[]): GroupedDeadline[] {
  const entries: DeadlineEntry[] = [];

  for (const c of computations) {
    const year = c.taxYear;
    const title = c.title || `Tax Year ${year}`;

    // Annual ITR deadline: April 15 of the following year
    entries.push({
      key: `${c.id}-annual-itr`,
      milestoneKey: 'annual-itr',
      dueDate: `${year + 1}-04-15`,
      description: `Annual ITR Filing (${year})`,
      completed: c.status === 'finalized' || c.status === 'archived',
      computationTitle: title,
    });

    // Q1 deadline: May 15
    entries.push({
      key: `${c.id}-q1`,
      milestoneKey: 'q1-filing',
      dueDate: `${year}-05-15`,
      description: `Q1 Quarterly Return (${year})`,
      completed: c.status === 'finalized' || c.status === 'archived',
      computationTitle: title,
    });

    // Q2 deadline: August 15
    entries.push({
      key: `${c.id}-q2`,
      milestoneKey: 'q2-filing',
      dueDate: `${year}-08-15`,
      description: `Q2 Quarterly Return (${year})`,
      completed: c.status === 'finalized' || c.status === 'archived',
      computationTitle: title,
    });

    // Q3 deadline: November 15
    entries.push({
      key: `${c.id}-q3`,
      milestoneKey: 'q3-filing',
      dueDate: `${year}-11-15`,
      description: `Q3 Quarterly Return (${year})`,
      completed: c.status === 'finalized' || c.status === 'archived',
      computationTitle: title,
    });
  }

  // Group by date + milestoneKey to avoid duplicate rows for the same deadline
  const groupMap = new Map<string, GroupedDeadline>();
  for (const e of entries) {
    const gk = `${e.dueDate}|${e.milestoneKey}`;
    const existing = groupMap.get(gk);
    if (existing) {
      existing.computationTitles.push(e.computationTitle);
      // If any computation is not completed, the group is not completed
      if (!e.completed) existing.completed = false;
    } else {
      groupMap.set(gk, {
        groupKey: gk,
        milestoneKey: e.milestoneKey,
        dueDate: e.dueDate,
        description: e.description,
        completed: e.completed,
        computationTitles: [e.computationTitle],
        isUrgent: !e.completed && isUrgentDate(e.dueDate),
      });
    }
  }

  // Recompute isUrgent after grouping (completed flag may have changed)
  const grouped = Array.from(groupMap.values()).map((d) => ({
    ...d,
    isUrgent: !d.completed && isUrgentDate(d.dueDate),
  }));

  grouped.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return grouped;
}

function DeadlinesPage() {
  const { orgId, isLoading: orgLoading } = useOrganization();
  const [deadlines, setDeadlines] = useState<GroupedDeadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    const computations = await listComputations(orgId);
    setDeadlines(deriveDeadlines(computations));
    setIsLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  if (orgLoading || isLoading) {
    return (
      <CenteredColumn data-testid="deadlines-page">
        <h1 className="text-2xl font-semibold mb-6">Deadlines</h1>
        <div className="flex flex-col gap-px rounded-md overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-zinc-900/50 animate-pulse" />
          ))}
        </div>
      </CenteredColumn>
    );
  }

  const upcoming = deadlines.filter((d) => !d.completed);
  const completed = deadlines.filter((d) => d.completed);

  return (
    <CenteredColumn data-testid="deadlines-page">
      <h1 className="text-2xl font-semibold mb-6">Deadlines</h1>

      {deadlines.length === 0 ? (
        <EmptyState message="No deadlines yet. Create a computation to see filing deadlines." />
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-zinc-600">All deadlines completed.</p>
            ) : (
              <div className="flex flex-col gap-px rounded-md overflow-hidden">
                {upcoming.map((d) => (
                  <ListRow
                    key={d.groupKey}
                    title={d.description}
                    subtitle={`Due ${formatDueDate(d.dueDate)} · ${d.computationTitles.join(', ')}`}
                    className={d.isUrgent ? 'bg-red-500/5 border border-red-500/10' : undefined}
                    rightContent={
                      <span className={`text-xs ml-4 shrink-0 ${d.isUrgent ? 'text-red-400' : 'text-zinc-600'}`}>
                        {formatDueDate(d.dueDate)}
                      </span>
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Completed</h2>
            {completed.length === 0 ? (
              <p className="text-sm text-zinc-600">No completed deadlines yet.</p>
            ) : (
              <div className="flex flex-col gap-px rounded-md overflow-hidden opacity-60">
                {completed.map((d) => (
                  <ListRow
                    key={d.groupKey}
                    title={d.description}
                    subtitle={`Due ${formatDueDate(d.dueDate)} · ${d.computationTitles.join(', ')}`}
                    rightContent={
                      <span className="text-xs text-zinc-600 ml-4 shrink-0">✓</span>
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </CenteredColumn>
  );
}
