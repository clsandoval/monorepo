export type PlanTier = 'starter' | 'pro';
export type BillingCycle = 'monthly' | 'annual';

interface PriceMap {
  [key: string]: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getPriceId(plan: PlanTier, cycle: BillingCycle): string {
  const map: PriceMap = {
    'starter:monthly': requireEnv('STRIPE_STARTER_MONTHLY_PRICE_ID'),
    'starter:annual': requireEnv('STRIPE_STARTER_ANNUAL_PRICE_ID'),
    'pro:monthly': requireEnv('STRIPE_PRO_MONTHLY_PRICE_ID'),
    'pro:annual': requireEnv('STRIPE_PRO_ANNUAL_PRICE_ID'),
  };
  const key = `${plan}:${cycle}`;
  const priceId = map[key];
  if (!priceId) throw new Error(`No price ID configured for plan=${plan}, cycle=${cycle}`);
  return priceId;
}

export function getPlanFromPriceId(priceId: string): PlanTier | null {
  const starterMonthly = process.env.STRIPE_STARTER_MONTHLY_PRICE_ID;
  const starterAnnual = process.env.STRIPE_STARTER_ANNUAL_PRICE_ID;
  const proMonthly = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const proAnnual = process.env.STRIPE_PRO_ANNUAL_PRICE_ID;

  if (priceId === starterMonthly || priceId === starterAnnual) return 'starter';
  if (priceId === proMonthly || priceId === proAnnual) return 'pro';
  return null;
}
