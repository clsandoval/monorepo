"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { DeadlineBanner } from "@/components/deadline-banner";
import { CalculatorForm } from "@/components/calculator-form";
import { ResultsPanel } from "@/components/results-panel";
import { LegalBasis } from "@/components/legal-basis";
import { FaqSection } from "@/components/faq-section";
import type { AmnestyResult } from "@/lib/engine";

export default function Home() {
  const [result, setResult] = useState<AmnestyResult | null>(null);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Header />
      <div className="mt-6">
        <DeadlineBanner />
      </div>
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CalculatorForm onResult={setResult} />
        {result ? (
          <ResultsPanel result={result} />
        ) : (
          <div className="rounded-lg border border-border-subtle bg-bg-panel p-6 flex items-center justify-center">
            <p className="text-center text-text-tertiary font-body text-sm">
              Enter your delinquent years and click{" "}
              <strong>Compute Amnesty Savings</strong> to see your results.
            </p>
          </div>
        )}
      </div>
      <LegalBasis />
      <FaqSection />
      <footer className="mt-16 border-t border-border pt-6 text-center text-xs font-body leading-relaxed text-text-secondary">
        This tool provides estimates based on RA 12001 Section 30. It is not
        legal advice. Consult your LGU Treasurer&rsquo;s office for official
        computations.
      </footer>
    </main>
  );
}
