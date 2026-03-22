import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UpgradePrompt } from '@/components/upgrade/upgrade-prompt';
import { CasesListClient } from './cases-list-client';

export default async function CasesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const tier = session.user.tier;
  const isPro = tier === 'professional';

  if (!isPro) {
    return (
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-semibold text-primary mb-1">Cases</h1>
          <p className="font-body text-secondary text-sm">
            Organize your computations by case.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-lg px-6 py-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="font-heading font-semibold text-primary text-xl">
            Case Management
          </h2>
          <p className="font-body text-secondary text-sm max-w-sm mx-auto leading-relaxed">
            Organize computations by case, track status from demand to execution,
            and keep all your case materials in one place.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary-light transition-colors duration-150"
          >
            Upgrade to Professional
          </a>
        </div>
      </div>
    );
  }

  const cases = await prisma.case.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { computations: true } },
    },
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-primary mb-1">Cases</h1>
          <p className="font-body text-secondary text-sm">
            {cases.length} case{cases.length !== 1 ? 's' : ''}
          </p>
        </div>
        <a
          href="/cases/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary-light transition-colors duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Case
        </a>
      </div>
      <CasesListClient cases={cases} />
    </div>
  );
}
