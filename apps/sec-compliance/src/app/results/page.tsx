"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { decodeWizardData } from "@/lib/utils";
import type { ComplianceResult } from "@/engine/compute";
import { StatusBadge } from "@/components/results/status-badge";
import { ComplianceTimeline } from "@/components/results/compliance-timeline";
import { PenaltyTable } from "@/components/results/penalty-table";
import { RiskFlag } from "@/components/results/risk-flag";
import { ResultsSummary } from "@/components/results/results-summary";

interface WizardData {
  corpType: "stock" | "non_stock" | "opc";
  incorporationYear: number;
  reBracket: string;
  mc28Compliant: boolean;
  filedReports: Array<{
    reportType: string;
    year: number;
    status: string;
  }>;
  suspensionDate: string | null;
  revocationDate: string | null;
  hasSuspension?: boolean;
  hasRevocation?: boolean;
}

function LegalDisclaimer() {
  return (
    <div className="rounded-lg bg-gray-100 px-5 py-4">
      <p className="font-body text-sm leading-relaxed text-gray-secondary">
        <strong className="text-charcoal">Disclaimer:</strong> This is an
        estimate based on publicly available SEC penalty schedules. It is not
        legal advice. Consult a lawyer or corporate secretary for your specific
        situation.
      </p>
    </div>
  );
}

function AllClearScreen() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
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

        <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 font-display text-lg font-semibold text-green-800">
          All Clear
        </span>

        <h1 className="font-display text-2xl font-bold text-charcoal">
          Your corporation appears to be in good standing with the SEC
        </h1>

        <p className="max-w-md font-body text-sm leading-relaxed text-gray-secondary">
          No penalties were found based on the information you provided. Keep
          filing your GIS, AFS, and Beneficial Ownership reports on time to
          maintain your good standing.
        </p>
      </div>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [wizardData, setWizardData] = useState<WizardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      const encoded = searchParams.get("data");
      if (!encoded) {
        setError("No data provided. Please complete the wizard first.");
        setLoading(false);
        return;
      }

      try {
        const decoded = decodeWizardData<WizardData>(encoded);
        setWizardData(decoded);

        const response = await fetch("/api/compute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            corpType: decoded.corpType,
            incorporationYear: decoded.incorporationYear,
            reBracket: decoded.reBracket,
            mc28Compliant: decoded.mc28Compliant,
            filedReports: decoded.filedReports,
            suspensionDate: decoded.suspensionDate,
            revocationDate: decoded.revocationDate,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(
            body?.error ?? `Computation failed (${response.status})`
          );
        }

        const data: ComplianceResult = await response.json();
        setResult(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex flex-col items-center space-y-4 py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sec-blue border-t-transparent" />
          <p className="font-body text-sm text-gray-secondary">
            Computing your compliance status...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-crimson/20 bg-crimson/5 px-5 py-4">
          <p className="font-body text-sm text-crimson">{error}</p>
        </div>
      </div>
    );
  }

  if (!result || !wizardData) return null;

  // All clear screen
  if (result.totalPenalty === 0) {
    return <AllClearScreen />;
  }

  const maxOffenseCount = result.lineItems.reduce(
    (max, item) => Math.max(max, item.offenseNumber),
    0
  );

  const boSubtotal = result.boPenalties.reduce(
    (sum, i) => sum + i.totalPenalty,
    0
  );

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Legal Disclaimer */}
      <LegalDisclaimer />

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-charcoal">
          Compliance Results
        </h1>
        <StatusBadge status={result.status} />
      </div>

      {/* Compliance Timeline (hero element) */}
      <ComplianceTimeline
        incorporationYear={wizardData.incorporationYear}
        currentYear={currentYear}
        filedReports={wizardData.filedReports}
        lineItems={result.lineItems}
        boPenalties={result.boPenalties}
      />

      {/* Penalty Table */}
      <PenaltyTable
        lineItems={result.lineItems}
        boPenalties={result.boPenalties}
        mc28Penalty={result.mc28Penalty}
        totalPenalty={result.totalPenalty}
      />

      {/* Risk Flag */}
      <RiskFlag
        status={result.status}
        riskLevel={result.riskLevel}
        riskMessage={result.riskMessage}
        maxOffenseCount={maxOffenseCount}
      />

      {/* Results Summary with CTA */}
      <ResultsSummary
        totalPenalty={result.totalPenalty}
        mc28Penalty={result.mc28Penalty}
        boSubtotal={boSubtotal}
        dataParam={searchParams.get("data") ?? undefined}
      />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="flex flex-col items-center space-y-4 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sec-blue border-t-transparent" />
            <p className="font-body text-sm text-gray-secondary">Loading...</p>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
