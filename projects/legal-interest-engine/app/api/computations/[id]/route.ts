import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const computation = await prisma.computation.findUnique({
    where: { id },
  });

  if (!computation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (computation.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(computation);
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

  const computation = await prisma.computation.findUnique({
    where: { id },
  });

  if (!computation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (computation.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.computation.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
