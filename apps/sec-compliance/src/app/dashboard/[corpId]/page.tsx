import { redirect } from "next/navigation";
import { requirePro } from "@/lib/pro/auth";
import { createClient } from "@/lib/supabase/server";
import { computeCompliance, type ComplianceInput } from "@/engine/compute";
import type { ReportType } from "@/engine/types";
import { StatusBadge } from "@/components/results/status-badge";
import { ComplianceTimeline } from "@/components/results/compliance-timeline";
import { PenaltyTable } from "@/components/results/penalty-table";
import { RiskFlag } from "@/components/results/risk-flag";
import { CostEstimate } from "@/components/remediation/cost-estimate";
import { StepGuide } from "@/components/remediation/step-guide";
import { DocumentChecklist } from "@/components/remediation/document-checklist";
import Link from "next/link";
import { ArrowLeft, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ corpId: string }>;
}

export default async function CorporationDetailPage({ params }: PageProps) {
  const { corpId } = await params;
  const { org } = await requirePro();
  const supabase = await createClient();

  // Fetch corporation (with org check)
  const { data: corp } = await supabase
    .from("corporations")
    .select("*")
    .eq("id", corpId)
    .eq("organization_id", org.id)
    .single();

  if (!corp) redirect("/dashboard");

  // Fetch filing records
  const { data: filingRecords } = await supabase
    .from("filing_records")
    .select("*")
    .eq("corporation_id", corpId);

  const filings = filingRecords ?? [];

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
    filedReports: filings.map((f) => ({
      reportType: f.report_type as ReportType,
      year: f.year,
      status: (f.status === "filed" ? "filed_on_time" : f.status) as
        | "not_filed"
        | "filed_late"
        | "filed_on_time",
    })),
  };

  const result = computeCompliance(input);
  const currentYear = new Date().getFullYear();

  // Derive maxOffenseCount from lineItems (needed by RiskFlag)
  const maxOffenseCount = result.lineItems.reduce(
    (max, item) => Math.max(max, item.offenseNumber),
    0
  );

  // Map corp type for display
  const corpTypeDisplay: Record<string, string> = {
    stock: "Stock Corporation",
    non_stock: "Non-Stock Corporation",
    opc: "One Person Corporation",
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 font-body text-sm text-gray-secondary hover:text-charcoal transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-charcoal">
            {corp.name || "Unnamed Corporation"}
          </h1>
          <p className="font-body text-sm text-gray-secondary mt-1">
            {corpTypeDisplay[corp.corp_type] ?? corp.corp_type} · Incorporated {incYear}
            {corp.sec_registration_number && ` · ${corp.sec_registration_number}`}
          </p>
          <div className="mt-3">
            <StatusBadge status={result.status} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button variant="outline" size="default" className="gap-1.5 font-body text-sm">
            <Pencil className="h-3.5 w-3.5" />
            Edit Filing History
          </Button>
          <Button
            variant="default"
            size="default"
            className="gap-1.5 font-body text-sm bg-sec-blue hover:bg-sec-blue/90"
          >
            <FileText className="h-3.5 w-3.5" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="font-body text-xs text-amber-800">
          <span className="font-semibold">Disclaimer:</span> This tool provides estimates
          only. Penalty calculations are based on publicly available SEC memorandum
          circulars. Consult a licensed attorney for official guidance.
        </p>
      </div>

      {/* Compliance Timeline */}
      <ComplianceTimeline
        incorporationYear={incYear}
        currentYear={currentYear}
        filedReports={filings.map((f) => ({
          reportType: f.report_type,
          year: f.year,
          status: f.status,
        }))}
        lineItems={result.lineItems}
        boPenalties={result.boPenalties}
      />

      {/* Penalty Table */}
      {result.totalPenalty > 0 && (
        <PenaltyTable
          lineItems={result.lineItems}
          boPenalties={result.boPenalties}
          mc28Penalty={result.mc28Penalty}
          totalPenalty={result.totalPenalty}
        />
      )}

      {/* Risk Flag */}
      {result.riskLevel !== "none" && (
        <RiskFlag
          riskLevel={result.riskLevel}
          riskMessage={result.riskMessage}
          status={result.status}
          maxOffenseCount={maxOffenseCount}
        />
      )}

      {/* Remediation Section — only for non-active corps */}
      {result.status !== "active" && (
        <>
          <div className="border-t border-divider pt-8">
            <h2 className="font-display text-2xl font-semibold text-charcoal mb-6">
              Remediation
            </h2>
          </div>

          <CostEstimate
            totalPenalties={result.totalPenalty}
            reinstatement={result.reinstatement}
          />

          <StepGuide
            status={result.status as "delinquent" | "suspended" | "revoked"}
          />

          <DocumentChecklist />
        </>
      )}
    </main>
  );
}
