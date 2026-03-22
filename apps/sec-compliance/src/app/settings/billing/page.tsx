"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PLAN_LIMITS, PLAN_PRICES, type Plan, type SubscriptionStatus } from "@/lib/pro/types";
import { formatCurrency, cn } from "@/lib/utils";

interface BillingOrg {
  id: string;
  plan: Plan;
  subscription_status: SubscriptionStatus;
  paymongo_subscription_id: string | null;
  corp_limit: number;
  trial_ends_at: string;
  current_period_ends_at: string | null;
}

const PLAN_LABELS: Record<Plan, string> = {
  solo: "Solo",
  practice: "Practice",
  firm: "Firm",
};

const STATUS_BADGE: Record<SubscriptionStatus, { label: string; classes: string }> = {
  trialing: { label: "Trial", classes: "bg-blue-100 text-blue-700" },
  active: { label: "Active", classes: "bg-emerald-100 text-emerald-700" },
  past_due: { label: "Past due", classes: "bg-amber-100 text-amber-700" },
  unpaid: { label: "Unpaid", classes: "bg-amber-100 text-amber-700" },
  canceled: { label: "Canceled", classes: "bg-gray-100 text-gray-600" },
};

const PLANS: Plan[] = ["solo", "practice", "firm"];

export default function BillingPage() {
  const [org, setOrg] = useState<BillingOrg | null>(null);
  const [corpCount, setCorpCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState<Plan | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [subscribingPlan, setSubscribingPlan] = useState<Plan | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();
      if (!membership) return;

      const { data: orgData } = await supabase
        .from("organizations")
        .select(
          "id, plan, subscription_status, paymongo_subscription_id, corp_limit, trial_ends_at, current_period_ends_at"
        )
        .eq("id", membership.organization_id)
        .single();

      if (orgData) setOrg(orgData as BillingOrg);

      const { count } = await supabase
        .from("corporations")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", membership.organization_id);

      setCorpCount(count ?? 0);
      setLoading(false);
    }

    load();
  }, []);

  async function handleChangePlan(newPlan: Plan) {
    if (!org || newPlan === org.plan) return;
    setChangingPlan(newPlan);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/billing/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPlan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change plan");
      setOrg((prev) => prev ? { ...prev, plan: newPlan, corp_limit: PLAN_LIMITS[newPlan] } : prev);
      setActionSuccess(`Plan changed to ${PLAN_LABELS[newPlan]}.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setChangingPlan(null);
    }
  }

  async function handleCancel() {
    if (!org) return;
    setCanceling(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to cancel subscription");
      setOrg((prev) => prev ? { ...prev, subscription_status: "canceled" } : prev);
      setActionSuccess("Subscription canceled.");
      setConfirmCancel(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCanceling(false);
    }
  }

  async function handleSubscribe(plan: Plan) {
    if (!paymentMethodId.trim()) {
      setActionError("Please enter a payment method ID.");
      return;
    }
    setSubscribing(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, paymentMethodId: paymentMethodId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to subscribe");
      setOrg((prev) =>
        prev
          ? {
              ...prev,
              plan,
              subscription_status: "active",
              corp_limit: PLAN_LIMITS[plan],
            }
          : prev
      );
      setActionSuccess(`Subscribed to ${PLAN_LABELS[plan]} plan.`);
      setPaymentMethodId("");
      setSubscribingPlan(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubscribing(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center font-body text-sm text-gray-secondary">
        Loading billing info…
      </div>
    );
  }

  if (!org) {
    return (
      <div className="py-12 text-center font-body text-sm text-gray-secondary">
        Unable to load billing information.
      </div>
    );
  }

  const badge = STATUS_BADGE[org.subscription_status];
  const isTrialing = org.subscription_status === "trialing";
  const isCanceled = org.subscription_status === "canceled";
  const corpUsagePct = Math.min(100, Math.round((corpCount / org.corp_limit) * 100));

  return (
    <div className="space-y-10">
      {/* Current Plan */}
      <section className="space-y-4">
        <h2 className="font-display text-base font-semibold text-charcoal">Current plan</h2>

        <div className="rounded-xl border border-divider bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-display text-xl font-semibold text-charcoal">
                {PLAN_LABELS[org.plan]}
              </p>
              <p className="font-body text-sm text-gray-secondary">
                {formatCurrency(PLAN_PRICES[org.plan])}/month
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-xs font-medium",
                badge.classes
              )}
            >
              {badge.label}
            </span>
          </div>

          {/* Corp usage bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="font-body text-sm text-charcoal">
                {corpCount} of {org.corp_limit} corporations used
              </p>
              <p className="font-body text-xs text-gray-secondary">{corpUsagePct}%</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  corpUsagePct >= 90 ? "bg-crimson" : corpUsagePct >= 70 ? "bg-amber-500" : "bg-sec-blue"
                )}
                style={{ width: `${corpUsagePct}%` }}
              />
            </div>
          </div>

          {org.current_period_ends_at && !isCanceled && (
            <p className="font-body text-xs text-gray-secondary">
              Current period ends{" "}
              {new Date(org.current_period_ends_at).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}

          {isTrialing && (
            <p className="font-body text-xs text-gray-secondary">
              Trial ends{" "}
              {new Date(org.trial_ends_at).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </section>

      {/* Plan comparison */}
      <section className="space-y-4">
        <h2 className="font-display text-base font-semibold text-charcoal">Plans</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan === org.plan;
            const newLimit = PLAN_LIMITS[plan];
            const overLimit = corpCount > newLimit;

            return (
              <div
                key={plan}
                className={cn(
                  "rounded-xl border p-5 space-y-4 transition-colors",
                  isCurrent
                    ? "border-sec-blue bg-sec-blue/5"
                    : "border-divider bg-white"
                )}
              >
                <div className="space-y-1">
                  <p
                    className={cn(
                      "font-display text-lg font-semibold",
                      isCurrent ? "text-sec-blue" : "text-charcoal"
                    )}
                  >
                    {PLAN_LABELS[plan]}
                  </p>
                  <p className="font-body text-2xl font-bold text-charcoal">
                    {formatCurrency(PLAN_PRICES[plan])}
                    <span className="font-body text-sm font-normal text-gray-secondary">/mo</span>
                  </p>
                </div>

                <p className="font-body text-sm text-gray-secondary">
                  Up to {newLimit} corporation{newLimit !== 1 ? "s" : ""}
                </p>

                {isCurrent ? (
                  <span className="inline-block font-body text-xs font-medium text-sec-blue">
                    Current plan
                  </span>
                ) : overLimit ? (
                  <p className="font-body text-xs text-crimson">
                    Remove corporations to downgrade ({corpCount}/{newLimit} used)
                  </p>
                ) : !isCanceled && !isTrialing ? (
                  <button
                    onClick={() => handleChangePlan(plan)}
                    disabled={changingPlan !== null}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-body text-sm text-charcoal hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {changingPlan === plan ? "Changing…" : `Switch to ${PLAN_LABELS[plan]}`}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Subscribe section (for trialing users) */}
      {isTrialing && (
        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-charcoal">Subscribe</h2>

          <div className="rounded-xl border border-divider bg-white p-5 space-y-4">
            <p className="font-body text-sm text-gray-secondary">
              Enter your PayMongo payment method ID to activate a subscription.
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="font-body text-sm font-medium text-charcoal" htmlFor="payment-method-id">
                  Payment method ID
                </label>
                <input
                  id="payment-method-id"
                  type="text"
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  placeholder="pm_xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-body text-sm text-charcoal focus:border-sec-blue focus:outline-none focus:ring-2 focus:ring-sec-blue/20"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {PLANS.map((plan) => (
                  <button
                    key={plan}
                    onClick={() => {
                      setSubscribingPlan(plan);
                      handleSubscribe(plan);
                    }}
                    disabled={subscribing}
                    className={cn(
                      "rounded-lg px-4 py-2 font-body text-sm font-medium transition-colors disabled:opacity-50",
                      "bg-sec-blue text-white hover:bg-sec-blue/90"
                    )}
                  >
                    {subscribing && subscribingPlan === plan
                      ? "Subscribing…"
                      : `Subscribe to ${PLAN_LABELS[plan]} — ${formatCurrency(PLAN_PRICES[plan])}/mo`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cancel subscription */}
      {!isCanceled && !isTrialing && (
        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-charcoal">Cancel subscription</h2>

          <div className="rounded-xl border border-divider bg-white p-5 space-y-4">
            <p className="font-body text-sm text-gray-secondary">
              Canceling will stop future billing. You will retain access until the end of your current billing period.
            </p>

            {confirmCancel ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="rounded-lg bg-crimson px-4 py-2 font-body text-sm font-medium text-white hover:bg-crimson/90 transition-colors disabled:opacity-50"
                >
                  {canceling ? "Canceling…" : "Yes, cancel my subscription"}
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-body text-sm text-charcoal hover:bg-gray-50 transition-colors"
                >
                  Never mind
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmCancel(true)}
                className="rounded-lg border border-crimson/40 bg-white px-4 py-2 font-body text-sm font-medium text-crimson hover:bg-crimson/5 transition-colors"
              >
                Cancel subscription
              </button>
            )}
          </div>
        </section>
      )}

      {/* Feedback */}
      {actionSuccess && (
        <p className="font-body text-sm font-medium text-emerald-600">{actionSuccess}</p>
      )}
      {actionError && (
        <p className="font-body text-sm font-medium text-crimson">{actionError}</p>
      )}
    </div>
  );
}
