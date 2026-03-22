import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { SettingsClient } from './settings-client';

type Tier = 'free' | 'consumer' | 'professional';

function getTierVariant(tier: Tier): 'active' | 'filed' | 'default' {
  if (tier === 'professional') return 'active';
  if (tier === 'consumer') return 'filed';
  return 'default';
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;
  const tier = session.user.tier as Tier;

  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'active' },
    orderBy: { createdAt: 'desc' },
  });

  const tierLabel =
    tier === 'professional' ? 'Professional' : tier === 'consumer' ? 'Consumer' : 'Free';

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-primary mb-1">Settings</h1>
        <p className="font-body text-secondary text-sm">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-primary text-lg border-b border-border pb-2">
          Profile
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-body text-muted uppercase tracking-widest mb-1">Name</p>
            <p className="font-body text-primary text-sm">
              {session.user.name ?? <span className="text-muted italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-xs font-body text-muted uppercase tracking-widest mb-1">Email</p>
            <p className="font-body text-primary text-sm">{session.user.email}</p>
          </div>
        </div>
      </section>

      {/* Subscription */}
      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-primary text-lg border-b border-border pb-2">
          Subscription
        </h2>
        <div className="flex items-center gap-3">
          <span className="font-body text-sm text-secondary">Current plan:</span>
          <Badge variant={getTierVariant(tier)}>{tierLabel}</Badge>
        </div>

        {subscription && (
          <p className="font-body text-xs text-muted">
            Renews on{' '}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {tier === 'free' && (
            <a
              href="/pricing"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary-light transition-colors duration-150"
            >
              Upgrade plan
            </a>
          )}
          {tier === 'consumer' && (
            <>
              <a
                href="/pricing"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary-light transition-colors duration-150"
              >
                Upgrade to Professional
              </a>
              <button className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-border text-secondary font-body font-medium text-sm hover:bg-primary/5 transition-colors duration-150">
                Cancel plan
              </button>
            </>
          )}
          {tier === 'professional' && (
            <button className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-border text-secondary font-body font-medium text-sm hover:bg-primary/5 transition-colors duration-150">
              Cancel plan
            </button>
          )}
        </div>
      </section>

      {/* Calculator preferences */}
      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-primary text-lg border-b border-border pb-2">
          Calculator preferences
        </h2>
        <SettingsClient />
      </section>
    </div>
  );
}
