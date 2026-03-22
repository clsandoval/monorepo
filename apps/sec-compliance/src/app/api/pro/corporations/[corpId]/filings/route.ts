import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ corpId: string }> }
) {
  const { corpId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify corporation belongs to user's org
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }

  const { data: corp } = await supabase
    .from("corporations")
    .select("id")
    .eq("id", corpId)
    .eq("organization_id", membership.organization_id)
    .single();

  if (!corp) {
    return NextResponse.json({ error: "Corporation not found" }, { status: 404 });
  }

  const body = await request.json();
  const filings = body.filings;

  // Delete existing filing records
  await supabase
    .from("filing_records")
    .delete()
    .eq("corporation_id", corpId);

  // Insert new ones
  if (filings?.length > 0) {
    await supabase.from("filing_records").insert(
      filings.map((f: { reportType: string; year: number; status: string }) => ({
        corporation_id: corpId,
        report_type: f.reportType,
        year: f.year,
        status: f.status,
      }))
    );
  }

  return NextResponse.json({ success: true });
}
