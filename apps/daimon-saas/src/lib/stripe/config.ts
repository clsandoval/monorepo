// ============================================================
// Stripe Configuration — Daimon SaaS
// Single source of truth for all Stripe plan/pricing metadata.
// ============================================================

export type PlanTier = 'free' | 'starter' | 'pro';
export type BillingCycle = 'monthly' | 'annual';

// ---------------------------------------------------------------------------
// Plan pricing amounts (in USD cents and display strings)
// Source: final-mega-spec/integrations/stripe.md
// ---------------------------------------------------------------------------

export interface PlanPricing {
  monthly: {
    amountCents: number;
    amountDisplay: string;
    pricePerMonth: string;
  };
  annual: {
    amountCents: number;
    amountDisplay: string;
    pricePerMonth: string;
    savingsDisplay: string;
  };
}

export const PLAN_PRICING: Record<Exclude<PlanTier, 'free'>, PlanPricing> = {
  starter: {
    monthly: {
      amountCents: 900,
      amountDisplay: '$9',
      pricePerMonth: '$9/mo',
    },
    annual: {
      amountCents: 7900,
      amountDisplay: '$79',
      pricePerMonth: '$6.58/mo',
      savingsDisplay: '$29',
    },
  },
  pro: {
    monthly: {
      amountCents: 2900,
      amountDisplay: '$29',
      pricePerMonth: '$29/mo',
    },
    annual: {
      amountCents: 24900,
      amountDisplay: '$249',
      pricePerMonth: '$20.75/mo',
      savingsDisplay: '$99',
    },
  },
};

// ---------------------------------------------------------------------------
// Env var helpers — read price IDs from environment
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getPriceId(plan: Exclude<PlanTier, 'free'>, cycle: BillingCycle): string {
  const map: Record<string, () => string> = {
    'starter:monthly': () => requireEnv('STRIPE_STARTER_MONTHLY_PRICE_ID'),
    'starter:annual': () => requireEnv('STRIPE_STARTER_ANNUAL_PRICE_ID'),
    'pro:monthly': () => requireEnv('STRIPE_PRO_MONTHLY_PRICE_ID'),
    'pro:annual': () => requireEnv('STRIPE_PRO_ANNUAL_PRICE_ID'),
  };
  const key = `${plan}:${cycle}`;
  const getter = map[key];
  if (!getter) throw new Error(`No price ID configured for plan=${plan}, cycle=${cycle}`);
  return getter();
}

export function getPlanFromPriceId(priceId: string): Exclude<PlanTier, 'free'> | null {
  const starterMonthly = process.env.STRIPE_STARTER_MONTHLY_PRICE_ID;
  const starterAnnual = process.env.STRIPE_STARTER_ANNUAL_PRICE_ID;
  const proMonthly = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const proAnnual = process.env.STRIPE_PRO_ANNUAL_PRICE_ID;

  if (priceId === starterMonthly || priceId === starterAnnual) return 'starter';
  if (priceId === proMonthly || priceId === proAnnual) return 'pro';
  return null;
}

// ---------------------------------------------------------------------------
// Billing period helpers
// ---------------------------------------------------------------------------

/** Returns the number of months in a billing cycle */
export function getBillingCycleMonths(cycle: BillingCycle): number {
  return cycle === 'annual' ? 12 : 1;
}

/** Returns the Stripe billing interval for a cycle */
export function getBillingInterval(cycle: BillingCycle): 'month' | 'year' {
  return cycle === 'annual' ? 'year' : 'month';
}

/** Returns display label for a billing cycle */
export function getBillingCycleLabel(cycle: BillingCycle): string {
  return cycle === 'annual' ? 'Annual' : 'Monthly';
}

/** Returns per-month price display for a plan/cycle combination */
export function getPriceDisplay(
  plan: Exclude<PlanTier, 'free'>,
  cycle: BillingCycle
): string {
  return PLAN_PRICING[plan][cycle].pricePerMonth;
}

// ---------------------------------------------------------------------------
// Stripe env var names — exported for reference and validation
// ---------------------------------------------------------------------------

export const STRIPE_ENV_VARS = {
  secretKey: 'STRIPE_SECRET_KEY',
  publishableKey: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  webhookSecret: 'STRIPE_WEBHOOK_SECRET',
  starterMonthlyPriceId: 'STRIPE_STARTER_MONTHLY_PRICE_ID',
  starterAnnualPriceId: 'STRIPE_STARTER_ANNUAL_PRICE_ID',
  proMonthlyPriceId: 'STRIPE_PRO_MONTHLY_PRICE_ID',
  proAnnualPriceId: 'STRIPE_PRO_ANNUAL_PRICE_ID',
} as const;
