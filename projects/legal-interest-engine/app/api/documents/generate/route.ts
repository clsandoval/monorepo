import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import type { DocumentType } from '@prisma/client';

const CONSUMER_TYPES: DocumentType[] = ['worksheet', 'summary_memo'];
const ALL_TYPES: DocumentType[] = ['worksheet', 'demand_letter', 'court_filing', 'summary_memo'];

const GenerateDocumentSchema = z.object({
  computationId: z.string().min(1),
  type: z.enum(['worksheet', 'demand_letter', 'court_filing', 'summary_memo']),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = GenerateDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { computationId, type } = parsed.data;
  const tier = session.user.tier;

  // Tier gating
  if (tier === 'free') {
    return NextResponse.json(
      { error: 'Document generation requires a Consumer or Professional subscription.' },
      { status: 403 }
    );
  }

  if (tier === 'consumer' && !CONSUMER_TYPES.includes(type as DocumentType)) {
    return NextResponse.json(
      {
        error: `Document type '${type}' requires a Professional subscription. Consumer tier can access: ${CONSUMER_TYPES.join(', ')}.`,
      },
      { status: 403 }
    );
  }

  if (!ALL_TYPES.includes(type as DocumentType)) {
    return NextResponse.json({ error: 'Invalid document type.' }, { status: 400 });
  }

  // Verify computation ownership
  const computation = await prisma.computation.findUnique({
    where: { id: computationId },
  });
  if (!computation) {
    return NextResponse.json({ error: 'Computation not found' }, { status: 404 });
  }
  if (computation.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Create the Document record (PDF generation will be added in Phase 15)
  const document = await prisma.document.create({
    data: {
      computationId,
      type: type as DocumentType,
      content: {},
      pdfUrl: null,
    },
  });

  return NextResponse.json(document, { status: 201 });
}
