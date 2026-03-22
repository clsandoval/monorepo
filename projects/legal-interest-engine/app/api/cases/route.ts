import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import type { CaseStatus } from '@prisma/client';

const CreateCaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  caseNumber: z.string().optional(),
  courtBranch: z.string().optional(),
  clientName: z.string().optional(),
  opposingParty: z.string().optional(),
  notes: z.string().optional(),
});

const VALID_STATUSES: CaseStatus[] = [
  'active',
  'demand_sent',
  'filed',
  'judgment',
  'execution',
  'closed',
];

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.tier !== 'professional') {
    return NextResponse.json(
      { error: 'Cases are only available on the Professional tier.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as CaseStatus | null;

  const cases = await prisma.case.findMany({
    where: {
      userId: session.user.id,
      ...(status && VALID_STATUSES.includes(status) ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(cases);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.tier !== 'professional') {
    return NextResponse.json(
      { error: 'Cases are only available on the Professional tier.' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = CreateCaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const newCase = await prisma.case.create({
    data: {
      userId: session.user.id,
      caseTitle: parsed.data.title,
      caseNumber: parsed.data.caseNumber ?? null,
      courtBranch: parsed.data.courtBranch ?? null,
      clientName: parsed.data.clientName ?? null,
      opposingParty: parsed.data.opposingParty ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  return NextResponse.json(newCase, { status: 201 });
}
