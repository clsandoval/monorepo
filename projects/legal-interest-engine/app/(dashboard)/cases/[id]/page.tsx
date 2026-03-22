import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CaseDetailClient } from './case-detail-client';
import { formatPeso } from '@/lib/engine/format';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { id } = await params;

  if (session.user.tier !== 'professional') {
    redirect('/cases');
  }

  const caseRecord = await prisma.case.findUnique({
    where: { id },
    include: {
      computations: {
        include: {
          computation: {
            select: {
              id: true,
              label: true,
              result: true,
              createdAt: true,
              tags: true,
            },
          },
        },
        orderBy: { computation: { createdAt: 'desc' } },
      },
    },
  });

  if (!caseRecord || caseRecord.userId !== session.user.id) {
    notFound();
  }

  // Get user's computations not already linked to this case
  const linkedIds = caseRecord.computations.map((cc) => cc.computationId);
  const unlinkableComputations = await prisma.computation.findMany({
    where: {
      userId: session.user.id,
      id: { notIn: linkedIds },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, label: true, result: true, createdAt: true },
  });

  return (
    <CaseDetailClient
      caseRecord={{
        id: caseRecord.id,
        caseTitle: caseRecord.caseTitle,
        caseNumber: caseRecord.caseNumber,
        courtBranch: caseRecord.courtBranch,
        clientName: caseRecord.clientName,
        opposingParty: caseRecord.opposingParty,
        status: caseRecord.status,
        notes: caseRecord.notes,
        computations: caseRecord.computations.map((cc) => ({
          id: cc.computation.id,
          label: cc.computation.label,
          tags: cc.computation.tags,
          grandTotal: (cc.computation.result as { grandTotal?: number })?.grandTotal ?? 0,
          createdAt: cc.computation.createdAt.toISOString(),
        })),
      }}
      availableComputations={unlinkableComputations.map((c) => ({
        id: c.id,
        label: c.label,
        grandTotal: (c.result as { grandTotal?: number })?.grandTotal ?? 0,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}
