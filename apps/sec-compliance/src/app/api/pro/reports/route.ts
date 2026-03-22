import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { computeCompliance, type ComplianceInput } from "@/engine/compute";
import { ComplianceReport } from "@/components/pdf/compliance-report";
import type { ReportType } from "@/engine/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { corporationId } = body;

  // Get org
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }

  // Fetch org details
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, logo_url")
    .eq("id", membership.organization_id)
    .single();

  // Fetch corporation
  const { data: corp } = await supabase
    .from("corporations")
    .select("*")
    .eq("id", corporationId)
    .eq("organization_id", membership.organization_id)
    .single();

  if (!corp) {
    return NextResponse.json({ error: "Corporation not found" }, { status: 404 });
  }

  // Fetch filing records
  const { data: filings } = await supabase
    .from("filing_records")
    .select("*")
    .eq("corporation_id", corporationId);

  const filingRecords = filings ?? [];

  // Compute compliance
  const incYear = corp.registration_date
    ? new Date(corp.registration_date).getFullYear()
    : 2020;

  const input: ComplianceInput = {
    domicile: "domestic",
    corpType: corp.corp_type as ComplianceInput["corpType"],
    reBracket: (corp.re_bracket || "0_100k") as ComplianceInput["reBracket"],
    mc28Compliant: corp.mc28_compliant ?? false,
    incorporationYear: incYear,
    currentDate: new Date(),
    suspensionDate: corp.suspension_date ? new Date(corp.suspension_date) : null,
    revocationDate: corp.revocation_date ? new Date(corp.revocation_date) : null,
    filedReports: filingRecords.map((f) => ({
      reportType: f.report_type as ReportType,
      year: f.year,
      status: f.status === "filed" ? "filed_on_time" : f.status,
    })),
  };

  const result = computeCompliance(input);
  const now = new Date().toISOString();

  // Render PDF
  const pdfBuffer = await renderToBuffer(
    ComplianceReport({
      orgName: org?.name ?? "Unknown",
      orgLogoUrl: org?.logo_url ?? null,
      corpName: corp.name ?? "Unnamed Corporation",
      corpType: corp.corp_type,
      registrationDate: corp.registration_date ?? "",
      result,
      generatedAt: now,
      filedReports: filingRecords.map((f) => ({
        reportType: f.report_type,
        year: f.year,
        status: f.status,
      })),
      incorporationYear: incYear,
    })
  );

  // Upload to Supabase Storage
  const filename = `${membership.organization_id}/${corporationId}-${Date.now()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("reports")
    .upload(filename, pdfBuffer, { contentType: "application/pdf" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Insert report record
  const { data: report } = await supabase
    .from("reports")
    .insert({
      corporation_id: corporationId,
      organization_id: membership.organization_id,
      report_type: "compliance_summary",
      storage_path: filename,
    })
    .select("id")
    .single();

  // Get signed download URL
  const { data: signedUrl } = await supabase.storage
    .from("reports")
    .createSignedUrl(filename, 3600);

  return NextResponse.json({
    reportId: report?.id,
    downloadUrl: signedUrl?.signedUrl,
  });
}
