import { useState, useEffect, useCallback } from 'react';
import { createRoute } from '@tanstack/react-router';
import { authenticatedRoute } from './__root';
import { authGuard } from '../lib/auth-guard';
import { useOrganization } from '../hooks/useOrganization';
import { listComputations } from '../lib/computations';
import { DeadlineCard } from '../components/deadlines/DeadlineCard';
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
      });
    }
  }

  const grouped = Array.from(groupMap.values());
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
      <div className="space-y-4" data-testid="deadlines-page">
        <h1 className="font-display text-foreground" style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--text-h1-lh)' }}>Deadlines</h1>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const upcoming = deadlines.filter((d) => !d.completed);
  const completed = deadlines.filter((d) => d.completed);

  return (
    <div className="space-y-6" data-testid="deadlines-page">
      <h1 className="font-display text-foreground" style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--text-h1-lh)' }}>Deadlines</h1>

      {deadlines.length === 0 ? (
        <div className="rounded-lg bg-card shadow-sm border border-border/50 p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl text-muted-foreground">📅</span>
          </div>
          <p className="font-medium text-foreground mb-1">No deadlines yet</p>
          <p className="text-sm text-muted-foreground">Create a computation to see filing deadlines.</p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="font-semibold text-foreground" style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--text-h3-lh)' }}>Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">All deadlines completed.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {upcoming.map((d) => (
                  <DeadlineCard
                    key={d.groupKey}
                    milestoneKey={d.milestoneKey}
                    dueDate={d.dueDate}
                    description={d.description}
                    completed={d.completed}
                    computationTitles={d.computationTitles}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-foreground" style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--text-h3-lh)' }}>Completed</h2>
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed deadlines yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {completed.map((d) => (
                  <DeadlineCard
                    key={d.groupKey}
                    milestoneKey={d.milestoneKey}
                    dueDate={d.dueDate}
                    description={d.description}
                    completed={d.completed}
                    computationTitles={d.computationTitles}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
