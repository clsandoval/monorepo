import dynamic from "next/dynamic";
import type { MacedaResult } from "@/lib/engine/types";
import type { InputSummary } from "./pdf-report";
import { ResultsEligible } from "./results-eligible";
import { ResultsIneligible } from "./results-ineligible";
import { Timeline } from "./timeline";
import { LegalBasis } from "./legal-basis";

const ExportButton = dynamic(
  () => import("./export-button").then((m) => m.ExportButton),
  { ssr: false }
);

interface ResultsProps {
  result: MacedaResult;
  inputSummary: InputSummary;
}

export function Results({ result, inputSummary }: ResultsProps) {
  return (
    <div>
      <div className="relative my-10">
        <div className="h-px bg-border" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg px-4 font-heading text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          Results
        </span>
      </div>
      {result.eligible ? (
        <>
          <ResultsEligible result={result} />
          <Timeline result={result} />
          <LegalBasis section4={false} />
        </>
      ) : (
        <>
          <ResultsIneligible result={result} />
          <LegalBasis section4={true} />
        </>
      )}
      <ExportButton result={result} inputSummary={inputSummary} />
    </div>
  );
}
