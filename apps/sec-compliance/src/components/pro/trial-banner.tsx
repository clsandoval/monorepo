import Link from "next/link";
import { trialDaysRemaining } from "@/lib/pro/types";
import type { Organization } from "@/lib/pro/types";

interface TrialBannerProps {
  org: Organization;
}

export function TrialBanner({ org }: TrialBannerProps) {
  if (org.subscription_status === "active") return null;

  if (org.subscription_status === "trialing") {
    const days = trialDaysRemaining(org.trial_ends_at);
    if (days <= 0) {
      return (
        <div className="bg-crimson/10 border-b border-crimson/20 px-4 py-2.5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <p className="font-body text-sm text-crimson font-medium">
              Your trial has ended. Subscribe to continue using Pro features.
            </p>
            <Link
              href="/settings/billing"
              className="font-body text-sm font-semibold text-crimson hover:underline"
            >
              Subscribe now
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-sec-blue/5 border-b border-sec-blue/10 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="font-body text-sm text-sec-blue">
            <span className="font-semibold">{days} day{days !== 1 ? "s" : ""}</span> left in your free trial.
          </p>
          <Link
            href="/settings/billing"
            className="font-body text-sm font-semibold text-sec-blue hover:underline"
          >
            Subscribe now
          </Link>
        </div>
      </div>
    );
  }

  if (org.subscription_status === "past_due") {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="font-body text-sm text-amber-800 font-medium">
            Payment failed. Please update your payment method to avoid losing access.
          </p>
          <Link
            href="/settings/billing"
            className="font-body text-sm font-semibold text-amber-800 hover:underline"
          >
            Update payment
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
