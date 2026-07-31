import { createRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { rootRoute } from './__root';
import { LayoutDashboard, FilePlus, FolderOpen, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickCalcWidget } from '@/components/quick-calc/QuickCalcWidget';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CaseCard } from '@/components/dashboard/CaseCard';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { listCases } from '@/lib/cases';
import type { CaseListItem } from '@/types';
import type { User } from '@supabase/supabase-js';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

export function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 sm:py-24 px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-[#c5a44e] text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            Philippine Succession Law
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-serif text-foreground mb-4 leading-[1.1]">
            Estate Distribution<br />Made Simple
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
            Compute inheritance shares instantly. Testate, intestate, mixed succession, preterition, and representation.
          </p>
        </div>

        {/* Quick Calc Widget */}
        <div className="max-w-md mx-auto">
          <QuickCalcWidget />
        </div>

        {/* Links to content pages */}
        <div className="mt-16 border-t pt-10 max-w-md mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4 text-center">
            Learn More
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <a href="/intestate-succession-calculator" className="rounded-lg border p-3 hover:border-primary/30 transition-colors text-foreground">
              Intestate Calculator
            </a>
            <a href="/legitimate-share-calculator" className="rounded-lg border p-3 hover:border-primary/30 transition-colors text-foreground">
              Legitime Calculator
            </a>
            <a href="/spouse-and-children-inheritance" className="rounded-lg border p-3 hover:border-primary/30 transition-colors text-foreground">
              Spouse &amp; Children
            </a>
            <a href="/illegitimate-child-inheritance" className="rounded-lg border p-3 hover:border-primary/30 transition-colors text-foreground">
              Illegitimate Children
            </a>
            <a href="/parents-inheritance-share" className="rounded-lg border p-3 hover:border-primary/30 transition-colors text-foreground">
              Parents' Share
            </a>
            <a href="/no-will-inheritance-philippines" className="rounded-lg border p-3 hover:border-primary/30 transition-colors text-foreground">
              No Will?
            </a>
          </div>
          <div className="mt-6 text-center">
            <a href="/blog" className="text-sm text-primary hover:underline font-medium">
              Read our blog on Philippine inheritance law →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <AuthenticatedDashboard user={user} />;
}

function AuthenticatedDashboard({ user }: { user: User }) {
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const { organization } = useOrganization(user.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!organization) return;
    listCases(organization.id)
      .then(setCases)
      .finally(() => setCasesLoading(false));
  }, [organization?.id]);

  if (!organization) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <EmptyState
          icon={Building2}
          title="Set up your firm first"
          description="Create your organization to unlock cases and team features."
          action={{ label: 'Set Up Firm Profile', onClick: () => navigate({ to: '/settings' }) }}
        />
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page" className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight font-serif">Dashboard</h1>
        </div>
        <Link to="/cases/new">
          <Button className="gap-2"><FilePlus className="h-4 w-4" />New Case</Button>
        </Link>
      </div>

      {/* Recent cases */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Recent Cases</h2>
          <Link to="/cases" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        {casesLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : cases.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No cases yet"
            description="Create your first estate case to start computing inheritance distributions."
            action={{ label: 'Create First Case', onClick: () => navigate({ to: '/cases/new' }) }}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {cases.map(c => (
              <Link key={c.id} to="/cases/$caseId" params={{ caseId: c.id }}>
                <CaseCard caseItem={c} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
