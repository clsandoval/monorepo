"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { CalculatorForm } from "@/components/calculator-form";
import { Results } from "@/components/results";
import type { MacedaResult } from "@/lib/engine/types";
import type { InputSummary } from "@/components/pdf-report";

export default function Home() {
  const [result, setResult] = useState<MacedaResult | null>(null);
  const [inputSummary, setInputSummary] = useState<InputSummary | null>(null);

  const handleResult = (r: MacedaResult, summary: InputSummary) => {
    setResult(r);
    setInputSummary(summary);
  };

  return (
    <main className="mx-auto max-w-[600px] px-6 py-12">
      <Header />
      <CalculatorForm onResult={handleResult} />
      {result && inputSummary && (
        <Results result={result} inputSummary={inputSummary} />
      )}
      <footer className="mt-12 border-t border-border pt-6 text-center text-xs leading-relaxed text-text-tertiary">
        This tool provides estimates based on RA 6552. It is not legal advice.
        <br />
        Consult a licensed attorney for guidance on your specific situation.
      </footer>
    </main>
  );
}
