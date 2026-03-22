import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const UpdateCaseSchema = z.object({
  status: z
    .enum(['active', 'demand_sent', 'filed', 'judgment', 'execution', 'closed'])
    .optional(),
  notes: z.string().optional(),
  caseNumber: z.string().optional(),
  courtBranch: z.string().optional(),
  clientName: z.string().optional(),
  opposingParty: z.string().optional(),
  title: z.string().min(1).optional(),
});

async function requireProAndOwnership(caseId: string, userId: string, tier: string) {
  if (tier !== 'professional') {
    return { error: NextResponse.json({ error: 'Cases are only available on the Professional tier.' }, { status: 403 }) };
  }

  const found = await prisma.case.findUnique({ where: { id: caseId } });
  if (!found) {
    return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) };
  }
  if (found.userId !== userId) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { found };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { error, found } = await requireProAndOwnership(id, session.user.id, session.user.tier);
  if (error) return error;

  const computationsCount = await prisma.computationCase.count({
    where: { caseId: id },
  });

  return NextResponse.json({ ...found, computationsCount });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await requireProAndOwnership(id, session.user.id, session.user.tier);
  if (error) return error;

  const body = await request.json();
  const parsed = UpdateCaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.case.update({
    where: { id },
    data: {
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
      ...(parsed.data.caseNumber !== undefined ? { caseNumber: parsed.data.caseNumber } : {}),
      ...(parsed.data.courtBranch !== undefined ? { courtBranch: parsed.data.courtBranch } : {}),
      ...(parsed.data.clientName !== undefined ? { clientName: parsed.data.clientName } : {}),
      ...(parsed.data.opposingParty !== undefined ? { opposingParty: parsed.data.opposingParty } : {}),
      ...(parsed.data.title !== undefined ? { caseTitle: parsed.data.title } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await requireProAndOwnership(id, session.user.id, session.user.tier);
  if (error) return error;

  await prisma.case.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
