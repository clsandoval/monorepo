import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

const SaveComputationSchema = z.object({
  inputs: z.record(z.string(), z.unknown()),
  result: z.record(z.string(), z.unknown()),
  label: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');

  const computations = await prisma.computation.findMany({
    where: {
      userId: session.user.id,
      ...(tag ? { tags: { has: tag } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(computations);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = SaveComputationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Free tier limit: 3 saved computations per calendar month
  if (session.user.tier === 'free') {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthCount = await prisma.computation.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
    });

    if (monthCount >= 3) {
      return NextResponse.json(
        {
          error:
            'Free tier limit reached. You can save up to 3 computations per calendar month. Upgrade to save more.',
        },
        { status: 403 }
      );
    }
  }

  const computation = await prisma.computation.create({
    data: {
      userId: session.user.id,
      inputs: parsed.data.inputs as Prisma.InputJsonValue,
      result: parsed.data.result as Prisma.InputJsonValue,
      label: parsed.data.label ?? null,
      tags: parsed.data.tags ?? [],
    },
  });

  return NextResponse.json(computation, { status: 201 });
}
