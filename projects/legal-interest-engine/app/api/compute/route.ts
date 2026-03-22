import { NextResponse } from 'next/server';
import { ComputationInputSchema } from '@/lib/engine/validation';
import { compute } from '@/lib/engine/compute';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = ComputationInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = compute(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
