import { useState } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { authenticatedRoute } from '../__root';
import { authGuard } from '../../lib/auth-guard';
import { supabase } from '../../lib/supabase';
import { useOrganization } from '../../hooks/useOrganization';
import { CenteredColumn } from '../../components/layout/CenteredColumn';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export const ClientsNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/clients/new',
  beforeLoad: authGuard,
  component: ClientsNewPage,
});

function ClientsNewPage() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tin, setTin] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('clients').insert({
        org_id: orgId,
        full_name: name.trim(),
        email: email.trim() || null,
        tin: tin.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
      });

      if (insertError) throw insertError;
      navigate({ to: '/clients' });
    } catch (err) {
      setError((err as Error).message ?? 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CenteredColumn data-testid="clients-new-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">New Client</h1>
        <button
          className="inline-flex items-center py-2.5 text-[0.8125rem] text-zinc-500 hover:text-zinc-200 transition-colors"
          onClick={() => navigate({ to: '/clients' })}
        >
          ← Back to Clients
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Client Name *</Label>
            <Input
              id="name"
              data-testid="client-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Juan dela Cruz"
              className="h-11 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tin" className="text-zinc-400 text-xs font-medium uppercase tracking-wide">TIN</Label>
            <Input
              id="tin"
              data-testid="client-tin-input"
              value={tin}
              onChange={(e) => setTin(e.target.value)}
              placeholder="e.g. 123-456-789-000"
              className="h-11 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Email</Label>
            <Input
              id="email"
              type="email"
              data-testid="client-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. juan@example.com"
              className="h-11 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Phone</Label>
            <Input
              id="phone"
              type="tel"
              data-testid="client-phone-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +63 912 345 6789"
              className="h-11 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Notes</Label>
            <Input
              id="notes"
              data-testid="client-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Additional client notes"
              className="h-11 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Client'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/clients' })}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </CenteredColumn>
  );
}
