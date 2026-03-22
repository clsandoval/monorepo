import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get org membership
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }

  // Fetch corporations with latest computation
  const { data: corporations } = await supabase
    .from("corporations")
    .select("id, name, corp_type, organization_id, registration_date, created_at")
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false });

  if (!corporations) {
    return NextResponse.json({ corporations: [] });
  }

  // Fetch latest computation for each corporation
  const corpIds = corporations.map((c) => c.id);
  const { data: computations } = await supabase
    .from("computations")
    .select("corporation_id, result_json, total_penalty, computed_at")
    .in("corporation_id", corpIds.length > 0 ? corpIds : ["__none__"])
    .order("computed_at", { ascending: false });

  // Get latest computation per corp
  const latestComputation = new Map<string, { result_json: Record<string, unknown>; total_penalty: number }>();
  for (const comp of computations ?? []) {
    if (!latestComputation.has(comp.corporation_id)) {
      latestComputation.set(comp.corporation_id, comp);
    }
  }

  // Check filing records existence
  const { data: filingCounts } = await supabase
    .from("filing_records")
    .select("corporation_id")
    .in("corporation_id", corpIds.length > 0 ? corpIds : ["__none__"]);

  const corpsWithFilings = new Set((filingCounts ?? []).map((f) => f.corporation_id));

  // Map to response format
  const result = corporations.map((corp) => {
    const computation = latestComputation.get(corp.id);
    const resultJson = computation?.result_json as { status?: string; totalPenalty?: number } | undefined;

    return {
      id: corp.id,
      name: corp.name,
      corp_type: corp.corp_type,
      status: resultJson?.status ?? "active",
      totalPenalty: computation?.total_penalty ?? 0,
      nextDeadline: null, // Simplified for now — could compute from filing timeline
      hasFilingHistory: corpsWithFilings.has(corp.id),
    };
  });

  return NextResponse.json({ corporations: result });
}
