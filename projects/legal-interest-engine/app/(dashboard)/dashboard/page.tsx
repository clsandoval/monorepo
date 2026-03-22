import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatPeso } from '@/lib/engine/format';
import { format } from 'date-fns';

const FREE_LIMIT = 3;

// Count computations this calendar month
async function getMonthlyCount(userId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return prisma.computation.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;
  const tier = session.user.tier;

  const [totalCount, monthlyCount, recentComputations] = await Promise.all([
    prisma.computation.count({ where: { userId } }),
    getMonthlyCount(userId),
    prisma.computation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const userName = session.user.name?.split(' ')[0] ?? 'there';

  const tierLabel = tier === 'professional' ? 'Professional' : tier === 'consumer' ? 'Consumer' : 'Free';
  const tierVariant =
    tier === 'professional' ? 'active' : tier === 'consumer' ? 'filed' : 'default';

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-primary mb-1">
            Welcome back, {userName}
          </h1>
          <p className="font-body text-secondary text-sm">
            Here&apos;s your computation overview.
          </p>
        </div>
        <Badge variant={tierVariant}>{tierLabel} plan</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg px-6 py-5">
          <p className="text-xs font-body text-muted uppercase tracking-widest mb-2">This month</p>
          <p className="font-mono text-3xl font-semibold text-primary">{monthlyCount}</p>
          <p className="font-body text-secondary text-sm mt-1">computation{monthlyCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg px-6 py-5">
          <p className="text-xs font-body text-muted uppercase tracking-widest mb-2">Total saved</p>
          <p className="font-mono text-3xl font-semibold text-primary">{totalCount}</p>
          <p className="font-body text-secondary text-sm mt-1">computation{totalCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Free tier usage */}
      {tier === 'free' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-body text-sm font-medium text-amber-900">
              Free tier usage
            </p>
            <span className="font-mono text-sm text-amber-800">
              {monthlyCount} / {FREE_LIMIT}
            </span>
          </div>
          <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (monthlyCount / FREE_LIMIT) * 100)}%` }}
            />
          </div>
          <p className="font-body text-xs text-amber-800">
            {FREE_LIMIT - monthlyCount > 0
              ? `${FREE_LIMIT - monthlyCount} free computation${FREE_LIMIT - monthlyCount !== 1 ? 's' : ''} remaining this month.`
              : 'You have used all free computations this month.'}{' '}
            <Link href="/pricing" className="underline hover:no-underline">
              Upgrade for unlimited
            </Link>
          </p>
        </div>
      )}

      {/* Quick action */}
      <div>
        <Link
          href="/computations/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary-light transition-colors duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Computation
        </Link>
      </div>

      {/* Recent computations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-primary text-lg">Recent computations</h2>
          {totalCount > 5 && (
            <Link href="/computations" className="text-sm font-body text-secondary hover:text-primary transition-colors duration-150">
              View all →
            </Link>
          )}
        </div>

        {recentComputations.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-lg py-12 px-6 text-center">
            <p className="font-heading text-primary font-semibold mb-2">No computations yet</p>
            <p className="font-body text-secondary text-sm mb-4">
              Run your first interest computation to see it here.
            </p>
            <Link
              href="/computations/new"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary-light transition-colors duration-150"
            >
              New Computation
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentComputations.map((comp) => {
              const result = comp.result as { grandTotal?: number };
              const grandTotal = result?.grandTotal ?? 0;

              return (
                <Link
                  key={comp.id}
                  href={`/computations/${comp.id}`}
                  className="flex items-center justify-between gap-4 bg-surface border border-border rounded-lg px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all duration-150"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-body font-medium text-primary text-sm truncate">
                      {comp.label ?? 'Untitled computation'}
                    </p>
                    <p className="font-body text-muted text-xs mt-0.5">
                      {format(new Date(comp.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-semibold text-primary">
                      {formatPeso(grandTotal)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
