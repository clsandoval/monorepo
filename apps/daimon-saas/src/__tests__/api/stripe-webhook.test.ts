/**
 * Stage 091 — Stripe Webhook Tests
 * Tests all 8 event types, idempotency, signature verification, and unknown events.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Set env vars before any module imports
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.STRIPE_STARTER_MONTHLY_PRICE_ID = 'price_starter_monthly';
process.env.STRIPE_STARTER_ANNUAL_PRICE_ID = 'price_starter_annual';
process.env.STRIPE_PRO_MONTHLY_PRICE_ID = 'price_pro_monthly';
process.env.STRIPE_PRO_ANNUAL_PRICE_ID = 'price_pro_annual';

// --- Mocks (hoisted before imports by Vitest) ---

const mockConstructEvent = vi.fn();
const mockSubscriptionsRetrieve = vi.fn();

vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: mockSubscriptionsRetrieve },
  }),
}));

const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({ from: mockFrom }),
}));

// Import handler after mocks are registered
import { POST } from '@/app/api/stripe/webhook/route';

// --- Helpers ---

/** Build a chainable supabase mock that returns `this` for all methods except single(). */
function buildChain() {
  const c: Record<string, unknown> = {};
  for (const m of ['insert', 'update', 'select', 'eq', 'is']) {
    c[m] = vi.fn(() => c);
  }
  c.single = mockSingle;
  return c;
}

function makeRequest(body: string, signature = 't=1234,v1=abcd') {
  return new NextRequest('http://localhost/api/stripe/webhook', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': signature, 'content-type': 'application/json' },
  });
}

function makeStripeEvent(
  type: string,
  object: Record<string, unknown>,
  id?: string
): Record<string, unknown> {
  return {
    id: id ?? `evt_${type.replace(/\./g, '_')}`,
    type,
    object: 'event',
    data: { object },
    created: 1700000000,
    livemode: false,
    pending_webhooks: 1,
    request: null,
    api_version: '2026-02-25.clover',
  };
}

// --- Fixture data (matches spec constants) ---

const TENANT_ID = 'tenant-uuid-fixture-1';
const CUSTOMER_ID = 'cus_testABC123';
const SUBSCRIPTION_ID = 'sub_testABC123';

const checkoutSession = {
  id: 'cs_test_123',
  object: 'checkout.session',
  customer: CUSTOMER_ID,
  metadata: { tenant_id: TENANT_ID },
};

const subscription = {
  id: SUBSCRIPTION_ID,
  object: 'subscription',
  customer: CUSTOMER_ID,
  status: 'active',
  cancel_at_period_end: false,
  items: {
    data: [
      {
        price: { id: 'price_starter_monthly' },
        current_period_start: 1700000000,
        current_period_end: 1702592000,
      },
    ],
  },
  trial_start: null,
  trial_end: null,
  canceled_at: null,
  metadata: { tenant_id: TENANT_ID },
};

const invoice = {
  id: 'in_test_123',
  object: 'invoice',
  parent: { subscription_details: { subscription: SUBSCRIPTION_ID } },
  amount_due: 900,
};

const stripeCustomer = {
  id: CUSTOMER_ID,
  object: 'customer',
  deleted: true,
};

// -------------------------------------------------------------------

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Fresh chain per test
    mockFrom.mockReturnValue(buildChain());
    // Default single() → truthy data (not a duplicate; idempotency passes)
    mockSingle.mockResolvedValue({ data: { stripe_event_id: 'evt_default' }, error: null });
  });

  // ── Signature verification ────────────────────────────────────────

  describe('signature verification', () => {
    it('returns 400 when stripe-signature header is missing', async () => {
      const req = new NextRequest('http://localhost/api/stripe/webhook', {
        method: 'POST',
        body: '{}',
        headers: { 'content-type': 'application/json' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({ error: 'Missing signature' });
    });

    it('returns 400 when constructEvent throws (invalid signature)', async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Stripe: No signatures found matching the expected signature for payload');
      });
      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({ error: 'Invalid signature' });
    });
  });

  // ── Idempotency ───────────────────────────────────────────────────

  describe('idempotency', () => {
    it('returns 200 and skips processing for a duplicate event_id', async () => {
      const event = makeStripeEvent('checkout.session.completed', checkoutSession, 'evt_dupe_001');
      mockConstructEvent.mockReturnValue(event);
      // Simulate UNIQUE constraint: insert returns null data (event already exists)
      mockSingle.mockResolvedValueOnce({ data: null, error: null });

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ received: true });

      // Only the deduplication table should be queried; no tenant/subscription tables
      const tables = mockFrom.mock.calls.map((c) => c[0] as string);
      expect(tables).toEqual(['stripe_webhook_events']);
    });
  });

  // ── checkout.session.completed ────────────────────────────────────

  describe('checkout.session.completed', () => {
    it('links stripe customer to tenant and returns 200', async () => {
      const event = makeStripeEvent('checkout.session.completed', checkoutSession);
      mockConstructEvent.mockReturnValue(event);

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ received: true });

      const tables = mockFrom.mock.calls.map((c) => c[0] as string);
      expect(tables).toContain('stripe_webhook_events');
      expect(tables).toContain('tenants');
      expect(tables).toContain('tenant_subscriptions');
    });

    it('returns 200 and logs when session has no tenant_id in metadata', async () => {
      const sessionNoMeta = { ...checkoutSession, metadata: {} };
      const event = makeStripeEvent('checkout.session.completed', sessionNoMeta);
      mockConstructEvent.mockReturnValue(event);

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
    });
  });

  // ── checkout.session.expired ──────────────────────────────────────

  describe('checkout.session.expired', () => {
    it('returns 200 without writing to tenant tables', async () => {
      const event = makeStripeEvent('checkout.session.expired', { id: 'cs_expired_1' });
      mockConstructEvent.mockReturnValue(event);

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ received: true });

      // Only idempotency table accessed
      const tables = mockFrom.mock.calls.map((c) => c[0] as string);
      expect(tables).toContain('stripe_webhook_events');
      expect(tables).not.toContain('tenants');
    });
  });

  // ── customer.subscription.created ────────────────────────────────

  describe('customer.subscription.created', () => {
    it('upserts subscription using tenant_id from metadata and returns 200', async () => {
      const event = makeStripeEvent('customer.subscription.created', subscription);
      mockConstructEvent.mockReturnValue(event);

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ received: true });

      const tables = mockFrom.mock.calls.map((c) => c[0] as string);
      expect(tables).toContain('tenant_subscriptions');
    });

    it('falls back to customer lookup when subscription has no tenant_id metadata', async () => {
      const subNoMeta = { ...subscription, metadata: {} };
      const event = makeStripeEvent('customer.subscription.created', subNoMeta);
      mockConstructEvent.mockReturnValue(event);

      // 1st single: idempotency → fresh event
      // 2nd single: lookup tenant by customer ID → found
      mockSingle
        .mockResolvedValueOnce({ data: { stripe_event_id: event.id }, error: null })
        .mockResolvedValueOnce({ data: { tenant_id: TENANT_ID }, error: null });

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ received: true });
    });
  });

  // ── customer.subscription.updated ────────────────────────────────

  describe('customer.subscription.updated', () => {
    it('updates subscription fields and returns 200', async () => {
      const updatedSub = { ...subscription, status: 'past_due', cancel_at_period_end: false };
      const event = makeStripeEvent('customer.subscription.updated', updatedSub);
      mockConstructEvent.mockReturnValue(event);

      // 1st single: idempotency, 2nd single: tenant lookup by subscription_id
      mockSingle
        .mockResolvedValueOnce({ data: { stripe_event_id: event.id }, error: null })
        .mockResolvedValueOnce({ data: { tenant_id: TENANT_ID }, error: null });

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ received: true });

      const tables = mockFrom.mock.calls.map((c) => c[0] as string);
      expect(tables).toContain('tenant_subscriptions');
    });
  });

  // ── customer.subscription.deleted ────────────────────────────────

  describe('customer.subscription.deleted', () => {
    it('downgrades tenant to free plan and returns 200', async () => {
      const deletedSub = { ...subscription, status: 'canceled', canceled_at: 1700000000 };
      const event = makeStripeEvent('customer.subscription.deleted', deletedSub);
      mockConstructEvent.mockReturnValue(event);

      // 1st single: idempotency, 2nd single: lookup tenant by subscription_id
      mockSingle
        .mockResolvedValueOnce({ data: { stripe_event_id: event.id }, error: null })
        .mockResolvedValueOnce({ data: { tenant_id: TENANT_ID }, error: null });

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ received: true });

      const tables = mockFrom.mock.calls.map((c) => c[0] as string);
      expect(tables).toContain('tenant_subscriptions');
    });

    it('returns 200 when no tenant found for subscription (logs error, no throw)', async () => {
      const event = makeStripeEvent('customer.subscription.deleted', subscription);
      mockConstructEvent.mockReturnValue(event);

      // 1st single: idempotency passes; 2nd single: tenant not found
      mockSingle
        .mockResolvedValueOnce({ data: { stripe_event_id: event.id }, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
    });
  });

  // ── invoice.payment_succeeded ─────────────────────────────────────

  describe('invoice.payment_succeeded', () => {
    it('retrieves subscription from Stripe, sets status=active, returns 200', async () => {
      const event = makeStripeEvent('invoice.payment_succeeded', invoice);
      mockConstructEvent.mockReturnValue(event);
      mockSubscriptionsRetrieve.mockResolvedValue(subscription);

      // 1st single: idempotency, 2nd single: tenant lookup
      mockSingle
        .mockResolvedValueOnce({ data: { stripe_event_id: event.id }, error: null })
        .mockResolvedValueOnce({ data: { tenant_id: TENANT_ID }, error: null });

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ received: true });

      // Must fetch fresh subscription data from Stripe
      expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith(SUBSCRIPTION_ID);
      const tables = mockFrom.mock.calls.map((c) => c[0] as string);
      expect(tables).toContain('tenant_subscriptions');
    });

    it('returns 200 and skips when invoice has no subscription_id', async () => {
      const invoiceNoSub = {
        ...invoice,
        parent: { subscription_details: { subscription: null } },
      };
      const event = makeStripeEvent('invoice.payment_succeeded', invoiceNoSub);
      mockConstructEvent.mockReturnValue(event);

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
      expect(mockSubscriptionsRetrieve).not.toHaveBeenCalled();
    });
  });

  // ── invoice.payment_failed ────────────────────────────────────────

  describe('invoice.payment_failed', () => {
    it('sets subscription status to past_due and returns 200', async () => {
      const event = makeStripeEvent('invoice.payment_failed', invoice);
      mockConstructEvent.mockReturnValue(event);

      // 1st single: idempotency, 2nd single: tenant lookup
      mockSingle
        .mockResolvedValueOnce({ data: { stripe_event_id: event.id }, error: null })
        .mockResolvedValueOnce({ data: { tenant_id: TENANT_ID }, error: null });

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ received: true });

      const tables = mockFrom.mock.calls.map((c) => c[0] as string);
      expect(tables).toContain('tenant_subscriptions');
    });

    it('returns 200 and skips when invoice has no subscription_id', async () => {
      const invoiceNoSub = {
        ...invoice,
        parent: { subscription_details: { subscription: null } },
      };
      const event = makeStripeEvent('invoice.payment_failed', invoiceNoSub);
      mockConstructEvent.mockReturnValue(event);

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
    });
  });

  // ── customer.deleted ──────────────────────────────────────────────

  describe('customer.deleted', () => {
    it('clears stripe_customer_id from tenants and tenant_subscriptions, returns 200', async () => {
      const event = makeStripeEvent('customer.deleted', stripeCustomer);
      mockConstructEvent.mockReturnValue(event);

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ received: true });

      const tables = mockFrom.mock.calls.map((c) => c[0] as string);
      expect(tables).toContain('tenants');
      expect(tables).toContain('tenant_subscriptions');
    });
  });

  // ── Unknown event type ────────────────────────────────────────────

  describe('unknown event type', () => {
    it('handles gracefully (logs and ignores) and returns 200', async () => {
      const event = makeStripeEvent('some.future.event.type', { id: 'obj_unknown_1' });
      mockConstructEvent.mockReturnValue(event);

      const res = await POST(makeRequest(JSON.stringify(event)));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ received: true });
    });

    it('does not write to tenant or subscription tables for unknown events', async () => {
      const event = makeStripeEvent('billing.alert.triggered', { id: 'obj_alert_1' });
      mockConstructEvent.mockReturnValue(event);

      await POST(makeRequest(JSON.stringify(event)));

      const tables = mockFrom.mock.calls.map((c) => c[0] as string);
      expect(tables).not.toContain('tenants');
      expect(tables).not.toContain('tenant_subscriptions');
    });
  });
});
