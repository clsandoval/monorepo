import { useState, useEffect, useCallback } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { authenticatedRoute } from '../__root';
import { authGuard } from '../../lib/auth-guard';
import { supabase } from '../../lib/supabase';
import { useOrganization } from '../../hooks/useOrganization';
import { CenteredColumn } from '../../components/layout/CenteredColumn';
import { ListRow } from '../../components/shared/ListRow';
import { EmptyState } from '../../components/shared/EmptyState';
import { Button } from '../../components/ui/button';

export const ClientsIndexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/clients',
  beforeLoad: authGuard,
  component: ClientsPage,
});

interface ClientRow {
  id: string;
  fullName: string;
  email?: string | null;
  computationCount?: number;
}

function ClientsPage() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('id, full_name, email')
        .eq('org_id', orgId)
        .order('full_name');

      if (fetchError) throw fetchError;
      setClients(
        (data ?? []).map((c) => ({
          id: c.id,
          fullName: c.full_name,
          email: c.email,
        })),
      );
    } catch (err) {
      setError((err as Error).message ?? 'Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  if (isLoading) {
    return (
      <CenteredColumn>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Clients</h1>
        </div>
        <div className="flex flex-col gap-px rounded-md overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-zinc-900/50 animate-pulse" />
          ))}
        </div>
      </CenteredColumn>
    );
  }

  return (
    <CenteredColumn data-testid="clients-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
        {clients.length > 0 && (
          <Button onClick={() => navigate({ to: '/clients/new' })}>+ Add Client</Button>
        )}
      </div>

      {error ? (
        <EmptyState
          message={`Unable to load clients. ${error}`}
          actionLabel="Try again"
          onAction={load}
        />
      ) : clients.length === 0 ? (
        <div data-testid="empty-clients">
          <EmptyState
            message="No clients yet. Organize computations by client to track multiple taxpayers from one account."
            actionLabel="+ Add Client"
            onAction={() => navigate({ to: '/clients/new' })}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-px rounded-md overflow-hidden">
          {clients.map((c) => (
            <ListRow
              key={c.id}
              title={c.fullName}
              subtitle={c.email ?? undefined}
              onClick={() => navigate({ to: '/clients/$clientId', params: { clientId: c.id } })}
            />
          ))}
        </div>
      )}
    </CenteredColumn>
  );
}
