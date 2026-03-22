import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import type { DocumentType } from '@prisma/client';
import { renderToBuffer } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import React from 'react';

import { WorksheetPdf } from '@/lib/pdf/worksheet';
import { DemandLetterPdf } from '@/lib/pdf/demand-letter';
import { CourtFilingPdf } from '@/lib/pdf/court-filing';
import { SummaryMemoPdf } from '@/lib/pdf/summary-memo';
import type { ComputationResult } from '@/lib/engine/types';

const CONSUMER_TYPES: DocumentType[] = ['worksheet', 'summary_memo'];
const ALL_TYPES: DocumentType[] = ['worksheet', 'demand_letter', 'court_filing', 'summary_memo'];

const GenerateDocumentSchema = z.object({
  computationId: z.string().min(1),
  type: z.enum(['worksheet', 'demand_letter', 'court_filing', 'summary_memo']),
  // Optional metadata for demand letter / court filing
  creditorName: z.string().optional(),
  creditorAddress: z.string().optional(),
  debtorName: z.string().optional(),
  debtorAddress: z.string().optional(),
  obligationDescription: z.string().optional(),
  deadline: z.string().optional(),
  annexLabel: z.string().optional(),
  caseNumber: z.string().optional(),
  court: z.string().optional(),
  parties: z.string().optional(),
  preparerName: z.string().optional(),
  preparerTitle: z.string().optional(),
  preparerPRC: z.string().optional(),
  caseLabel: z.string().optional(),
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

  const { computationId, type, ...meta } = parsed.data;
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

  // Parse stored computation result
  const result = computation.result as unknown as ComputationResult;

  // Generate PDF buffer
  let pdfBuffer: Buffer;
  try {
    let element: React.ReactElement<DocumentProps>;

    switch (type) {
      case 'worksheet':
        element = React.createElement(WorksheetPdf, {
          result,
          caseLabel: meta.caseLabel,
        }) as React.ReactElement<DocumentProps>;
        break;

      case 'demand_letter':
        element = React.createElement(DemandLetterPdf, {
          result,
          creditorName: meta.creditorName ?? 'Creditor',
          creditorAddress: meta.creditorAddress ?? '',
          debtorName: meta.debtorName ?? 'Debtor',
          debtorAddress: meta.debtorAddress ?? '',
          obligationDescription: meta.obligationDescription ?? 'the monetary obligation described herein',
          deadline: meta.deadline ?? 'fifteen (15) days from receipt',
          caseLabel: meta.caseLabel,
        }) as React.ReactElement<DocumentProps>;
        break;

      case 'court_filing':
        element = React.createElement(CourtFilingPdf, {
          result,
          annexLabel: meta.annexLabel ?? 'ANNEX A',
          caseNumber: meta.caseNumber,
          court: meta.court,
          parties: meta.parties,
          preparerName: meta.preparerName,
          preparerTitle: meta.preparerTitle,
          preparerPRC: meta.preparerPRC,
        }) as React.ReactElement<DocumentProps>;
        break;

      case 'summary_memo':
        element = React.createElement(SummaryMemoPdf, {
          result,
          caseLabel: meta.caseLabel,
        }) as React.ReactElement<DocumentProps>;
        break;

      default:
        return NextResponse.json({ error: 'Invalid document type.' }, { status: 400 });
    }

    pdfBuffer = await renderToBuffer(element);
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json(
      { error: 'Failed to generate PDF. Please try again.' },
      { status: 500 }
    );
  }

  // Save document record
  // Note: Blob storage upload will be added when Vercel Blob credentials are available.
  // For now, we save the record and return the PDF directly.
  const document = await prisma.document.create({
    data: {
      computationId,
      type: type as DocumentType,
      content: meta as object,
      pdfUrl: null,
    },
  });

  // Return the PDF as a direct response with document ID in header
  return new Response(new Uint8Array(pdfBuffer), {
    status: 201,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="legal-interest-${type}-${computationId}.pdf"`,
      'X-Document-Id': document.id,
    },
  });
}
