import { useState, useEffect, useCallback } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { Plus, Users } from 'lucide-react';
import { authenticatedRoute } from '../__root';
import { authGuard } from '../../lib/auth-guard';
import { supabase } from '../../lib/supabase';
import { useOrganization } from '../../hooks/useOrganization';
import { ClientsTable } from '../../components/clients/ClientsTable';
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

  return (
    <div className="space-y-6" data-testid="clients-page">
      <div className="flex items-center justify-between flex-wrap gap-y-3">
        <h1 className="font-display text-foreground" style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--text-h1-lh)' }}>Clients</h1>
        {(clients.length > 0 || isLoading) && (
          <Button onClick={() => navigate({ to: '/clients/new' })}>
            <Plus className="h-4 w-4 mr-2" /> New Client
          </Button>
        )}
      </div>

      {error ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Unable to load clients. {error}</p>
          <Button variant="outline" onClick={load}>Try again</Button>
        </div>
      ) : clients.length === 0 && !isLoading ? (
        <div className="py-16 px-8 space-y-5" data-testid="empty-clients">
          <Users className="h-10 w-10 text-muted-foreground" />
          <div>
            <h2
              className="font-display text-foreground"
              style={{ fontSize: 'var(--text-h2)', lineHeight: 'var(--text-h2-lh)' }}
            >
              No clients yet
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md" style={{ fontSize: 'var(--text-body)' }}>
              Organize computations by client. Track multiple taxpayers from one account.
            </p>
          </div>
          <Button onClick={() => navigate({ to: '/clients/new' })}>
            <Plus className="h-4 w-4 mr-2" /> New Client
          </Button>
        </div>
      ) : (
        <ClientsTable
          clients={clients}
          isLoading={isLoading}
          onSelect={(id) => navigate({ to: '/clients/$clientId', params: { clientId: id } })}
        />
      )}
    </div>
  );
}
