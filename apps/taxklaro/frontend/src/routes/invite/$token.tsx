import { createRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { publicRootRoute } from '../__root';
import { supabase } from '../../lib/supabase';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { Skeleton } from '../../components/ui/skeleton';

export const InviteTokenRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/invite/$token',
  component: InvitePage,
});

interface InviteData {
  id: string;
  email: string;
  role: string;
  orgName: string;
  status: string;
  expiresAt: string;
}

function InvitePage() {
  const { token } = InviteTokenRoute.useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<InviteData | null | undefined>(undefined);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error: fetchError } = await supabase
        .from('organization_invitations')
        .select('id, email, role, status, expires_at, organizations(name)')
        .eq('token', token)
        .single();

      if (fetchError || !data) {
        setInvite(null);
        return;
      }

      setInvite({
        id: data.id,
        email: data.email,
        role: data.role,
        orgName: (data.organizations as { name: string } | null)?.name ?? 'Unknown Organization',
        status: data.status,
        expiresAt: data.expires_at,
      });
    }
    load();
  }, [token]);

  async function handleAccept() {
    if (!invite) return;
    setIsAccepting(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('organization_invitations')
        .update({ status: 'accepted' })
        .eq('id', invite.id);
      if (updateError) throw updateError;
      navigate({ to: '/computations' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsAccepting(false);
    }
  }

  if (invite === undefined) {
    return (
      <div className="min-h-screen bg-zinc-950" data-testid="invite-page">
        <PublicHeader />
        <div className="flex items-center justify-center p-4 pt-16">
          <div className="w-full max-w-sm space-y-4">
            <Skeleton className="h-8 w-48 mx-auto bg-zinc-800" />
            <Skeleton className="h-32 w-full bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  if (invite === null) {
    return (
      <div className="min-h-screen bg-zinc-950" data-testid="invite-page">
        <PublicHeader />
        <div className="flex items-center justify-center p-4 pt-16">
          <div className="text-center space-y-3">
            <h1 className="text-lg font-semibold text-zinc-50">Invitation Not Found</h1>
            <p className="text-sm text-zinc-500">This invitation link is invalid or has expired.</p>
            <button
              className="mt-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signin' } })}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(invite.expiresAt) < new Date();
  const isUsed = invite.status !== 'pending';

  return (
    <div className="min-h-screen bg-zinc-950" data-testid="invite-page">
      <PublicHeader />
      <div className="flex items-center justify-center p-4 pt-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 space-y-1">
            <h1 className="text-lg font-semibold text-zinc-50">You're Invited</h1>
            <p className="text-sm text-zinc-500">
              Join <span className="text-zinc-300 font-medium">{invite.orgName}</span> as a{' '}
              <span className="text-zinc-300 font-medium capitalize">{invite.role}</span>.
            </p>
          </div>

          {(isExpired || isUsed) && (
            <p className="text-sm text-red-400 bg-red-950 border border-red-900 rounded-lg px-3 py-2 mb-4 text-center">
              {isExpired ? 'This invitation has expired.' : 'This invitation has already been used.'}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-950 border border-red-900 rounded-lg px-3 py-2 mb-4 text-center">{error}</p>
          )}

          <div className="space-y-3">
            <button
              className="w-full h-11 rounded-lg bg-zinc-50 px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors disabled:opacity-50"
              onClick={handleAccept}
              disabled={isAccepting || isExpired || isUsed}
            >
              {isAccepting ? 'Accepting...' : 'Accept Invite'}
            </button>
            <button
              className="w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2"
              onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signin' } })}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
