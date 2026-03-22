export type Plan = "solo" | "practice" | "firm";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "unpaid" | "canceled";
export type UserRole = "free" | "pro";
export type OrgMemberRole = "owner" | "member";

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  logo_url: string | null;
  plan: Plan;
  subscription_status: SubscriptionStatus;
  paymongo_customer_id: string | null;
  paymongo_subscription_id: string | null;
  corp_limit: number;
  trial_ends_at: string;
  current_period_ends_at: string | null;
  created_at: string;
}

export interface OrgMember {
  organization_id: string;
  user_id: string;
  role: OrgMemberRole;
}

export interface Report {
  id: string;
  corporation_id: string;
  organization_id: string;
  generated_at: string;
  report_type: "compliance_summary";
  storage_path: string;
}

export const PLAN_LIMITS: Record<Plan, number> = {
  solo: 5,
  practice: 25,
  firm: 100,
};

export const PLAN_PRICES: Record<Plan, number> = {
  solo: 999,
  practice: 2499,
  firm: 4999,
};

export function isActiveSubscription(status: SubscriptionStatus, trialEndsAt: string): boolean {
  if (status === "active") return true;
  if (status === "trialing") return new Date(trialEndsAt) > new Date();
  return false;
}

export function trialDaysRemaining(trialEndsAt: string): number {
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
