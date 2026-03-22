import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CSVRow } from "@/lib/pro/csv";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get org
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id, corp_limit")
    .eq("id", membership.organization_id)
    .single();

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const body = await request.json();
  const rows: CSVRow[] = body.rows;

  if (!rows || !Array.isArray(rows)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Check corp limit
  const { count } = await supabase
    .from("corporations")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", org.id);

  const currentCount = count ?? 0;
  if (currentCount + rows.length > org.corp_limit) {
    return NextResponse.json({
      error: `This import would add ${rows.length} corporations but you only have ${org.corp_limit - currentCount} slots remaining.`,
    }, { status: 400 });
  }

  // Insert corporations
  const corpsToInsert = rows.map((row) => ({
    name: row.corporation_name,
    organization_id: org.id,
    user_id: user.id,
    corp_type: row.corp_type,
    re_bracket: row.re_bracket,
    registration_date: row.incorporation_date,
    domicile: "domestic",
    mc28_compliant: false,
    sec_registration_number: row.sec_registration_number,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("corporations")
    .insert(corpsToInsert)
    .select("id");

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ imported: inserted?.length ?? 0 });
}
