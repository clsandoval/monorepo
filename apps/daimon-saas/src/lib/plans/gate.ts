/**
 * Plan gating utilities — Daimon SaaS
 *
 * Per spec (premium/features-by-tier.md):
 * - The ONLY hard gate is the Discord connection limit.
 * - All 50+ tools are available on every tier (BYOK model removes cost incentive).
 * - isPlanFeature covers soft differences: email support, priority support, uptime SLA.
 */

export type Plan = 'free' | 'starter' | 'pro'

// ---------------------------------------------------------------------------
// Discord connection limits (premium/features-by-tier.md §Rule 1)
// ---------------------------------------------------------------------------

const CONNECTION_LIMITS: Record<Plan, number> = {
  free: 1,
  starter: 3,
  pro: Infinity,
}

/**
 * Return the maximum number of active Discord connections allowed for a plan.
 * "Active" means status NOT IN ('disconnected', 'suspended').
 */
export function getMaxConnections(plan: Plan): number {
  return CONNECTION_LIMITS[plan] ?? 1
}

/**
 * Return true if the tenant can add another Discord connection.
 * activeCount should exclude connections with status 'disconnected' or 'suspended'.
 */
export function canAddConnection(plan: Plan, activeCount: number): boolean {
  return activeCount < getMaxConnections(plan)
}

// ---------------------------------------------------------------------------
// Tool access (premium/features-by-tier.md §Rule 2)
// ---------------------------------------------------------------------------

/**
 * All tools are available on all tiers — no tool gating.
 * Returns true regardless of plan or toolName.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function canAccessTool(_plan: Plan, _toolName: string): boolean {
  return true
}

// ---------------------------------------------------------------------------
// Generic plan feature checks
// ---------------------------------------------------------------------------

export type PlanFeature =
  | 'email_support'      // Starter + Pro
  | 'priority_support'   // Pro only
  | 'uptime_sla'         // Pro only (99.9% monthly)
  | 'annual_billing'     // Starter + Pro

/**
 * Return true if the given plan includes the specified feature.
 */
export function isPlanFeature(plan: Plan, feature: PlanFeature): boolean {
  switch (feature) {
    case 'email_support':
      return plan === 'starter' || plan === 'pro'
    case 'priority_support':
      return plan === 'pro'
    case 'uptime_sla':
      return plan === 'pro'
    case 'annual_billing':
      return plan === 'starter' || plan === 'pro'
    default:
      return false
  }
}

// ---------------------------------------------------------------------------
// Upgrade prompt helpers
// ---------------------------------------------------------------------------

/**
 * Return a human-readable upgrade prompt when a connection limit is reached.
 * Used in UI tooltips and API error responses.
 */
export function connectionLimitMessage(plan: Plan): string {
  const max = getMaxConnections(plan)
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)
  if (plan === 'pro') return '' // no limit
  const nextPlan = plan === 'free' ? 'Starter' : 'Pro'
  return `Your ${planLabel} plan supports ${max} Discord connection${max === 1 ? '' : 's'}. Upgrade to ${nextPlan} to add more.`
}
