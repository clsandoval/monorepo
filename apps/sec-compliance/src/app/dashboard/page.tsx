import { requirePro } from "@/lib/pro/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/pro/dashboard-stats";
import { DashboardClient } from "./dashboard-client";
import type { CorpRow } from "@/components/pro/corporation-table";
import type { ComplianceStatus } from "@/engine/types";

export default async function DashboardPage() {
  const { org } = await requirePro();
  const supabase = await createClient();

  // Fetch corporations
  const { data: corporations } = await supabase
    .from("corporations")
    .select("id, name, corp_type, created_at")
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false });

  const corps = corporations ?? [];
  const corpIds = corps.map((c) => c.id);

  // Fetch latest computations
  const { data: computations } = await supabase
    .from("computations")
    .select("corporation_id, result_json, total_penalty")
    .in("corporation_id", corpIds.length > 0 ? corpIds : ["__none__"]);

  const latestComp = new Map<string, { result_json: Record<string, unknown>; total_penalty: number }>();
  for (const comp of computations ?? []) {
    if (!latestComp.has(comp.corporation_id)) {
      latestComp.set(comp.corporation_id, comp);
    }
  }

  // Check filing records
  const { data: filingCounts } = await supabase
    .from("filing_records")
    .select("corporation_id")
    .in("corporation_id", corpIds.length > 0 ? corpIds : ["__none__"]);

  const hasFilings = new Set((filingCounts ?? []).map((f) => f.corporation_id));

  // Map to CorpRow
  const corpRows: CorpRow[] = corps.map((corp) => {
    const comp = latestComp.get(corp.id);
    const result = comp?.result_json as { status?: string } | undefined;
    return {
      id: corp.id,
      name: corp.name,
      corp_type: corp.corp_type,
      status: (result?.status ?? "active") as ComplianceStatus,
      totalPenalty: comp?.total_penalty ?? 0,
      nextDeadline: null,
      hasFilingHistory: hasFilings.has(corp.id),
    };
  });

  // Compute stats
  const totalPenaltyExposure = corpRows.reduce((sum, c) => sum + c.totalPenalty, 0);
  const compliantCount = corpRows.filter((c) => c.status === "active").length;
  const needAttention = 0; // Will be computed from filing deadlines in a future iteration

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-charcoal">
          {org.name}
        </h1>
        <p className="font-body text-sm text-gray-secondary mt-1">
          Portfolio overview
        </p>
      </div>

      <DashboardStats
        totalCorps={corpRows.length}
        corpLimit={org.corp_limit}
        totalPenaltyExposure={totalPenaltyExposure}
        needAttention={needAttention}
        compliantCount={compliantCount}
      />

      <DashboardClient
        corporations={corpRows}
        corpLimit={org.corp_limit}
        currentCorpCount={corpRows.length}
      />
    </main>
  );
}
