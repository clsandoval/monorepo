import type { ComplianceStatus } from "@/engine/types";

const STATUS_CONFIG: Record<
  ComplianceStatus,
  { bg: string; text: string; label: string }
> = {
  active: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Active",
  },
  delinquent: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    label: "Delinquent",
  },
  suspended: {
    bg: "bg-crimson/10",
    text: "text-crimson",
    label: "Suspended",
  },
  revoked: {
    bg: "bg-crimson/20",
    text: "text-crimson",
    label: "Revoked",
  },
};

interface StatusBadgeProps {
  status: ComplianceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-block rounded-full px-4 py-1.5 font-display text-lg font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
