import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paymongo';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('paymongo-signature') ?? '';
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET ?? '';

  if (!secret) {
    console.error('PAYMONGO_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { type: string; data?: { attributes?: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment.paid': {
        await handlePaymentPaid(event.data?.attributes ?? {});
        break;
      }
      case 'subscription.cancelled': {
        await handleSubscriptionCancelled(event.data?.attributes ?? {});
        break;
      }
      default: {
        // Unhandled event type — acknowledge receipt
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentPaid(attributes: Record<string, unknown>) {
  const userId = attributes.metadata
    ? (attributes.metadata as Record<string, unknown>).userId as string | undefined
    : undefined;
  const plan = attributes.metadata
    ? (attributes.metadata as Record<string, unknown>).plan as 'consumer' | 'professional' | undefined
    : undefined;
  const paymongoSubscriptionId = (attributes.id as string | undefined) ?? '';
  const currentPeriodEnd = attributes.current_period_end
    ? new Date((attributes.current_period_end as number) * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // default 30 days

  if (!userId || !plan) {
    console.warn('payment.paid missing userId or plan in metadata', attributes);
    return;
  }

  // Upsert subscription and upgrade user tier
  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { id: paymongoSubscriptionId },
      create: {
        id: paymongoSubscriptionId,
        userId,
        plan,
        paymongoSubscriptionId,
        status: 'active',
        currentPeriodEnd,
      },
      update: {
        status: 'active',
        currentPeriodEnd,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { tier: plan },
    }),
  ]);
}

async function handleSubscriptionCancelled(attributes: Record<string, unknown>) {
  const paymongoSubscriptionId = (attributes.id as string | undefined) ?? '';

  if (!paymongoSubscriptionId) {
    console.warn('subscription.cancelled missing id', attributes);
    return;
  }

  const subscription = await prisma.subscription.findFirst({
    where: { paymongoSubscriptionId },
  });

  if (!subscription) {
    console.warn('subscription.cancelled: subscription not found', paymongoSubscriptionId);
    return;
  }

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'cancelled' },
    }),
    prisma.user.update({
      where: { id: subscription.userId },
      data: { tier: 'free' },
    }),
  ]);
}
