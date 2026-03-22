import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const LinkSchema = z.object({
  computationId: z.string().min(1),
});

async function requireProAndCaseOwnership(caseId: string, userId: string, tier: string) {
  if (tier !== 'professional') {
    return {
      error: NextResponse.json(
        { error: 'Cases are only available on the Professional tier.' },
        { status: 403 }
      ),
    };
  }

  const found = await prisma.case.findUnique({ where: { id: caseId } });
  if (!found) {
    return { error: NextResponse.json({ error: 'Case not found' }, { status: 404 }) };
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
  const { error } = await requireProAndCaseOwnership(id, session.user.id, session.user.tier);
  if (error) return error;

  const links = await prisma.computationCase.findMany({
    where: { caseId: id },
    include: { computation: true },
    orderBy: { computation: { createdAt: 'desc' } },
  });

  return NextResponse.json(links.map((l) => l.computation));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await requireProAndCaseOwnership(id, session.user.id, session.user.tier);
  if (error) return error;

  const body = await request.json();
  const parsed = LinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const computation = await prisma.computation.findUnique({
    where: { id: parsed.data.computationId },
  });
  if (!computation) {
    return NextResponse.json({ error: 'Computation not found' }, { status: 404 });
  }
  if (computation.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const link = await prisma.computationCase.upsert({
    where: {
      computationId_caseId: {
        computationId: parsed.data.computationId,
        caseId: id,
      },
    },
    create: {
      computationId: parsed.data.computationId,
      caseId: id,
    },
    update: {},
  });

  return NextResponse.json(link, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await requireProAndCaseOwnership(id, session.user.id, session.user.tier);
  if (error) return error;

  const body = await request.json();
  const parsed = LinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.computationCase.findUnique({
    where: {
      computationId_caseId: {
        computationId: parsed.data.computationId,
        caseId: id,
      },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  await prisma.computationCase.delete({
    where: {
      computationId_caseId: {
        computationId: parsed.data.computationId,
        caseId: id,
      },
    },
  });

  return NextResponse.json({ success: true });
}
