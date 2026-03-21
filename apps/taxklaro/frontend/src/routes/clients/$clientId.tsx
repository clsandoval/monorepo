import { useState, useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { authenticatedRoute } from '../__root';
import { authGuard } from '../../lib/auth-guard';
import { supabase } from '../../lib/supabase';
import { CenteredColumn } from '../../components/layout/CenteredColumn';

export const ClientsClientIdRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/clients/$clientId',
  beforeLoad: authGuard,
  component: ClientDetailPage,
});

interface ClientDetail {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  tin?: string | null;
  notes?: string | null;
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex gap-4 py-3 border-b border-zinc-800 last:border-0">
      <span className="text-[0.8125rem] font-medium text-zinc-500 w-24 shrink-0">{label}</span>
      <span className="text-[0.9375rem] text-zinc-100">{value}</span>
    </div>
  );
}

function ClientDetailPage() {
  const { clientId } = ClientsClientIdRoute.useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('clients')
          .select('id, full_name, email, phone, tin, notes')
          .eq('id', clientId)
          .single();

        if (cancelled) return;
        if (fetchError || !data) {
          setError('Client not found');
        } else {
          setClient({
            id: data.id,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            tin: data.tin,
            notes: data.notes,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message ?? 'Failed to load client');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [clientId]);

  if (isLoading) {
    return (
      <CenteredColumn wide data-testid="client-detail-page">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-900/50 rounded w-1/3" />
          <div className="h-32 bg-zinc-900/50 rounded" />
        </div>
      </CenteredColumn>
    );
  }

  if (error || !client) {
    return (
      <CenteredColumn wide data-testid="client-detail-page">
        <div className="text-center space-y-4">
          <p className="text-zinc-500">{error ?? 'Client not found'}</p>
          <button
            className="inline-flex items-center py-2.5 text-[0.8125rem] text-zinc-500 hover:text-zinc-200 transition-colors"
            onClick={() => navigate({ to: '/clients' })}
          >
            ← Back to Clients
          </button>
        </div>
      </CenteredColumn>
    );
  }

  return (
    <CenteredColumn wide data-testid="client-detail-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-zinc-50">{client.fullName}</h1>
        <button
          className="inline-flex items-center py-2.5 text-[0.8125rem] text-zinc-500 hover:text-zinc-200 transition-colors"
          onClick={() => navigate({ to: '/clients' })}
        >
          ← Back to Clients
        </button>
      </div>

      <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-1">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Client Information</h2>
        {client.email && <InfoRow label="Email" value={client.email} />}
        {client.phone && <InfoRow label="Phone" value={client.phone} />}
        {client.tin && <InfoRow label="TIN" value={client.tin} />}
        {client.notes && <InfoRow label="Notes" value={client.notes} />}
        {!client.email && !client.phone && !client.tin && !client.notes && (
          <p className="text-sm text-zinc-600 py-2">No additional information.</p>
        )}
      </div>
    </CenteredColumn>
  );
}
