import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeCompliance } from "@/engine/compute";
import type { ComplianceResult } from "@/engine/compute";
import type { ReportType } from "@/engine/types";
import { CostEstimate } from "@/components/remediation/cost-estimate";
import { AmnestyComparison } from "@/components/remediation/amnesty-comparison";
import { StepGuide } from "@/components/remediation/step-guide";
import { DocumentChecklist } from "@/components/remediation/document-checklist";
import { PetitionGenerator } from "@/components/remediation/petition-generator";
import { formatCurrency } from "@/lib/utils";

async function getComplianceResult(): Promise<{
  result: ComplianceResult;
  corporationName?: string;
  secRegistrationNumber?: string;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // First try: query computations table (in case computation was saved)
  const { data: computation } = await supabase
    .from("computations")
    .select(
      `
      result_json,
      corporations (
        sec_registration_number
      )
    `
    )
    .eq("corporations.user_id", user.id)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (computation?.result_json) {
    const corp = Array.isArray(computation.corporations)
      ? computation.corporations[0]
      : computation.corporations;

    return {
      result: computation.result_json as ComplianceResult,
      secRegistrationNumber: corp?.sec_registration_number ?? undefined,
    };
  }

  // Fallback: recompute from stored corporation + filing records
  const { data: corp } = await supabase
    .from("corporations")
    .select(
      `
      id,
      corp_type,
      re_bracket,
      mc28_compliant,
      suspension_date,
      revocation_date,
      sec_registration_number,
      registration_date
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!corp) return null;

  const { data: filingRecords } = await supabase
    .from("filing_records")
    .select("report_type, year, status, filed_date")
    .eq("corporation_id", corp.id);

  // Derive incorporation year from registration_date, fall back to current year - 3
  let incorporationYear = new Date().getFullYear() - 3;
  if (corp.registration_date) {
    incorporationYear = new Date(corp.registration_date).getFullYear();
  }

  const result = computeCompliance({
    domicile: "domestic",
    corpType: corp.corp_type as "stock" | "non_stock" | "opc",
    reBracket: corp.re_bracket,
    mc28Compliant: corp.mc28_compliant,
    incorporationYear,
    currentDate: new Date(),
    suspensionDate: corp.suspension_date ? new Date(corp.suspension_date) : null,
    revocationDate: corp.revocation_date ? new Date(corp.revocation_date) : null,
    filedReports: (filingRecords ?? []).map((r) => ({
      reportType: r.report_type as ReportType,
      year: r.year,
      status: r.status as "not_filed" | "filed_late" | "filed_on_time",
    })),
  });

  return {
    result,
    secRegistrationNumber: corp.sec_registration_number ?? undefined,
  };
}

function LegalDisclaimer() {
  return (
    <div className="rounded-lg bg-gray-100 px-5 py-4">
      <p className="font-body text-sm leading-relaxed text-gray-secondary">
        <strong className="text-charcoal">Disclaimer:</strong> This remediation plan is based
        on estimated penalties and publicly available SEC procedures. It is not legal advice.
        Consult a lawyer or accredited corporate secretary for your specific situation.
      </p>
    </div>
  );
}

function StatusHeader({ status }: { status: ComplianceResult["status"] }) {
  const statusConfig = {
    active: { label: "Active", bg: "bg-green-100", text: "text-green-800" },
    delinquent: {
      label: "Delinquent",
      bg: "bg-amber-100",
      text: "text-amber-800",
    },
    suspended: { label: "Suspended", bg: "bg-orange-100", text: "text-orange-800" },
    revoked: { label: "Revoked", bg: "bg-red-100", text: "text-red-800" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-3">
      <h1 className="font-display text-2xl font-bold text-charcoal">
        Your Remediation Plan
      </h1>
      <span
        className={`inline-block rounded-full px-3 py-1 font-body text-xs font-semibold ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    </div>
  );
}

function PenaltySummaryBanner({
  totalPenalty,
  status,
}: {
  totalPenalty: number;
  status: ComplianceResult["status"];
}) {
  if (totalPenalty === 0) return null;

  return (
    <div className="rounded-lg border-2 border-charcoal/10 bg-white px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-sm text-gray-secondary">Estimated Accumulated Penalties</p>
          <p className="font-display text-3xl font-bold text-charcoal mt-0.5">
            {formatCurrency(totalPenalty)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-body text-xs text-gray-secondary">Compliance Status</p>
          <p className="font-body text-sm font-semibold text-charcoal mt-0.5 capitalize">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function RemediationPage() {
  const data = await getComplianceResult();

  if (!data) {
    redirect("/wizard");
  }

  const { result, secRegistrationNumber } = data;

  // If the corporation is somehow active with zero penalties, still show the page
  // but with a simplified view
  if (result.status === "active" && result.totalPenalty === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <LegalDisclaimer />
        <div className="flex flex-col items-center space-y-4 py-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-charcoal">
            Your corporation is in good standing
          </h1>
          <p className="max-w-md font-body text-sm leading-relaxed text-gray-secondary">
            No outstanding penalties found. Keep filing your GIS, AFS, and Beneficial Ownership
            reports on time to maintain good standing with the SEC.
          </p>
        </div>
      </div>
    );
  }

  const remediationStatus =
    result.status === "active" ? "delinquent" : result.status;

  const computationResultWithMeta = {
    ...result,
    secRegistrationNumber,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      {/* Disclaimer */}
      <LegalDisclaimer />

      {/* Header */}
      <StatusHeader status={result.status} />

      {/* Penalty summary banner */}
      <PenaltySummaryBanner
        totalPenalty={result.totalPenalty}
        status={result.status}
      />

      {/* Cost Estimate */}
      {result.totalPenalty > 0 && (
        <div className="rounded-lg border border-divider bg-white p-6">
          <CostEstimate
            totalPenalties={result.totalPenalty}
            reinstatement={result.reinstatement}
          />
        </div>
      )}

      {/* Amnesty Comparison */}
      <div className="rounded-lg border border-divider bg-white p-6">
        <AmnestyComparison amnestyActive={false} />
      </div>

      {/* Step Guide */}
      <div className="rounded-lg border border-divider bg-white p-6">
        <StepGuide
          status={
            remediationStatus as "delinquent" | "suspended" | "revoked"
          }
        />
      </div>

      {/* Document Checklist */}
      <div className="rounded-lg border border-divider bg-white p-6">
        <DocumentChecklist />
      </div>

      {/* Petition Generator — only for delinquent/suspended */}
      {(result.status === "delinquent" || result.status === "suspended") && (
        <div className="rounded-lg border border-divider bg-white p-6">
          <PetitionGenerator computationResult={computationResultWithMeta} />
        </div>
      )}
    </div>
  );
}
