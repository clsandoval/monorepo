// Per-IP token bucket. In-memory (single long-lived process — BUILD-SPEC rung 0).
// ponytail: in-memory is fine on one machine; move to a shared store only at multi-node.
const buckets = new Map<string, { tokens: number; ts: number }>();
const CAP = Number(process.env.RFP_RATE_CAP ?? 20);       // burst
const REFILL_PER_SEC = Number(process.env.RFP_RATE_REFILL ?? 0.2); // ~12/min sustained

export function allow(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip) ?? { tokens: CAP, ts: now };
  b.tokens = Math.min(CAP, b.tokens + ((now - b.ts) / 1000) * REFILL_PER_SEC);
  b.ts = now;
  if (b.tokens < 1) { buckets.set(ip, b); return false; }
  b.tokens -= 1;
  buckets.set(ip, b);
  return true;
}
