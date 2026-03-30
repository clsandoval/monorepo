"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { DeadlineBanner } from "@/components/deadline-banner";
import { CalculatorForm } from "@/components/calculator-form";
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
        <div className="rounded-lg border border-border-subtle bg-bg-panel p-6">
          {result ? (
            <p className="text-text-primary">Results panel coming next.</p>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-text-tertiary font-body text-sm">
                Enter your delinquent years and click{" "}
                <strong>Compute Amnesty Savings</strong> to see your results.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
