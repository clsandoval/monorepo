import type { ComplianceStatus } from "@/engine/types";
import type { RiskLevel } from "@/engine/status";

interface RiskFlagProps {
  status: ComplianceStatus;
  riskLevel: RiskLevel;
  riskMessage: string;
  maxOffenseCount: number;
}

export function RiskFlag({
  status,
  riskLevel,
  riskMessage,
  maxOffenseCount,
}: RiskFlagProps) {
  // Don't render if active with no risk
  if (status === "active" && riskLevel === "none") {
    return null;
  }

  const isNearRevocation = maxOffenseCount >= 5;
  const isDelinquent = status === "delinquent";
  const isSuspendedOrRevoked =
    status === "suspended" || status === "revoked";

  // Choose banner style
  const bannerClass =
    isNearRevocation || isSuspendedOrRevoked
      ? "bg-crimson text-white"
      : isDelinquent
        ? "bg-amber-600 text-white"
        : "bg-amber-100 text-amber-900";

  let message: string;

  if (isNearRevocation) {
    message =
      "Your corporation is at immediate risk of revocation. Consult a corporate secretary or lawyer immediately.";
  } else if (isSuspendedOrRevoked) {
    message = riskMessage;
  } else if (isDelinquent) {
    const remaining = 5 - maxOffenseCount;
    message =
      remaining > 0
        ? `Your corporation has been declared delinquent. ${remaining} more offense${remaining !== 1 ? "s" : ""} could result in revocation.`
        : "Your corporation has been declared delinquent and is at risk of revocation.";
  } else {
    message = riskMessage;
  }

  return (
    <div className={`rounded-lg px-5 py-4 ${bannerClass}`}>
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <p className="font-body text-sm font-medium leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
