import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  totalCorps: number;
  corpLimit: number;
  totalPenaltyExposure: number;
  needAttention: number;
  compliantCount: number;
}

export function DashboardStats({
  totalCorps,
  corpLimit,
  totalPenaltyExposure,
  needAttention,
  compliantCount,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "Total Corporations",
      value: String(totalCorps),
      subtext: `of ${corpLimit} limit`,
      color: "text-charcoal",
    },
    {
      label: "Total Penalty Exposure",
      value: formatCurrency(totalPenaltyExposure),
      subtext: "across all corps",
      color: totalPenaltyExposure > 0 ? "text-crimson" : "text-charcoal",
    },
    {
      label: "Need Attention",
      value: String(needAttention),
      subtext: "filings due within 60 days",
      color: needAttention > 0 ? "text-amber-600" : "text-charcoal",
    },
    {
      label: "Compliant",
      value: String(compliantCount),
      subtext: `of ${totalCorps} corporations`,
      color: "text-green-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-divider bg-white p-5"
        >
          <p className="font-body text-xs uppercase tracking-wide text-gray-muted">
            {stat.label}
          </p>
          <p className={`font-display text-3xl font-bold mt-1 ${stat.color}`}>
            {stat.value}
          </p>
          <p className="font-body text-xs text-gray-muted mt-0.5">
            {stat.subtext}
          </p>
        </div>
      ))}
    </div>
  );
}
