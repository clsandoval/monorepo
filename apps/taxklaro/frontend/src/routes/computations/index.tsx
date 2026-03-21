import { createRoute } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { authenticatedRoute } from '../__root';
import { authGuard } from '../../lib/auth-guard';
import { listComputations, deleteComputation, updateComputationStatus } from '../../lib/computations';
import { useOrganization } from '../../hooks/useOrganization';
import { CenteredColumn } from '../../components/layout/CenteredColumn';
import { ListRow } from '../../components/shared/ListRow';
import { EmptyState } from '../../components/shared/EmptyState';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import type { ComputationListItem, ComputationStatus } from '../../types/org';

export const ComputationsIndexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/computations',
  beforeLoad: authGuard,
  component: ComputationsPage,
});

type StatusFilter = 'all' | ComputationStatus;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function ComputationsPage() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const [computations, setComputations] = useState<ComputationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const load = useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await listComputations(orgId);
      setComputations(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    await deleteComputation(id);
    setComputations((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleArchive(id: string, currentStatus: ComputationStatus) {
    await updateComputationStatus(id, currentStatus, 'archived');
    setComputations((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: 'archived' as ComputationStatus } : c)
    );
  }

  // Suppress unused variable warnings — kept for potential future use
  void handleDelete;
  void handleArchive;

  const filtered = statusFilter === 'all'
    ? computations
    : computations.filter((c) => c.status === statusFilter);

  if (isLoading) {
    return (
      <CenteredColumn fluid>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Computations</h1>
        </div>
        <div className="flex flex-col gap-px rounded-md overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100/50 animate-pulse" />
          ))}
        </div>
      </CenteredColumn>
    );
  }

  if (error) {
    return (
      <CenteredColumn fluid>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Computations</h1>
          <Button onClick={() => navigate({ to: '/computations/new' })}>+ New</Button>
        </div>
        <EmptyState
          message="Unable to load computations. Please try again."
          actionLabel="Try again"
          onAction={load}
        />
      </CenteredColumn>
    );
  }

  return (
    <CenteredColumn fluid>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Computations</h1>
        <Button onClick={() => navigate({ to: '/computations/new' })}>+ New</Button>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="computed">Computed</TabsTrigger>
          <TabsTrigger value="finalized">Finalized</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {computations.length === 0 ? (
        <EmptyState
          message="No computations yet"
          actionLabel="+ New Computation"
          onAction={() => navigate({ to: '/computations/new' })}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          message="No computations match the selected filter."
          actionLabel="Clear filter"
          onAction={() => setStatusFilter('all')}
        />
      ) : (
        <div className="flex flex-col gap-px rounded-md overflow-hidden" data-testid="computations-list">
          {filtered.map((c) => (
            <ListRow
              key={c.id}
              title={`${c.title} — ${c.taxYear}`}
              subtitle={`${c.status}${c.regimeSelected ? ` · ${c.regimeSelected}` : ''} · ${formatDate(c.updatedAt)}`}
              onClick={() => navigate({ to: '/computations/$compId', params: { compId: c.id } })}
            />
          ))}
        </div>
      )}
    </CenteredColumn>
  );
}
