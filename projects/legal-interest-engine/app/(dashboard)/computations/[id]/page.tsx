import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ComputationDetailClient } from './computation-detail-client';
import type { ComputationResult } from '@/lib/engine/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ComputationDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { id } = await params;
  const userId = session.user.id;
  const tier = session.user.tier as 'free' | 'consumer' | 'professional';

  const computation = await prisma.computation.findUnique({
    where: { id },
    include: {
      cases: {
        include: { case: { select: { id: true, caseTitle: true } } },
      },
    },
  });

  if (!computation || computation.userId !== userId) {
    notFound();
  }

  return (
    <ComputationDetailClient
      computation={{
        id: computation.id,
        label: computation.label,
        tags: computation.tags,
        result: computation.result as unknown as ComputationResult,
        createdAt: computation.createdAt.toISOString(),
        cases: computation.cases.map((cc) => ({
          id: cc.case.id,
          caseTitle: cc.case.caseTitle,
        })),
      }}
      tier={tier}
    />
  );
}
