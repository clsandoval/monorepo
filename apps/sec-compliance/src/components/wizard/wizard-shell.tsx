"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { encodeWizardData } from "@/lib/utils";
import { CorpTypeStep, type CorpType } from "./corp-type-step";
import { DetailsStep } from "./details-step";
import { FilingsStep, type FilingRecord } from "./filings-step";
import { SuspensionStep } from "./suspension-step";

export interface WizardState {
  corpType: CorpType | null;
  incorporationYear: number | null;
  reBracket: string | null;
  mc28Compliant: boolean;
  filedReports: FilingRecord[];
  hasSuspension: boolean;
  suspensionDate: string | null;
  hasRevocation: boolean;
  revocationDate: string | null;
}

const STEPS = [
  { label: "Type", key: "corp-type" },
  { label: "Details", key: "details" },
  { label: "Filings", key: "filings" },
  { label: "Orders", key: "suspension" },
] as const;

const initialState: WizardState = {
  corpType: null,
  incorporationYear: null,
  reBracket: null,
  mc28Compliant: false,
  filedReports: [],
  hasSuspension: false,
  suspensionDate: null,
  hasRevocation: false,
  revocationDate: null,
};

function canAdvance(step: number, state: WizardState): boolean {
  switch (step) {
    case 0:
      return state.corpType !== null;
    case 1:
      return state.incorporationYear !== null && state.reBracket !== null;
    case 2:
      return true; // Filings can be empty (all unfiled)
    case 3:
      return true; // No order is a valid state
    default:
      return false;
  }
}

export function WizardShell() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(initialState);

  const updateState = useCallback(
    <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      // Final step — navigate to results
      const encoded = encodeWizardData(state);
      router.push(`/results?data=${encoded}`);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    i < step
                      ? "bg-sec-blue text-white"
                      : i === step
                        ? "border-2 border-sec-blue bg-white text-sec-blue"
                        : "border-2 border-divider bg-white text-gray-muted"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={`mt-1 text-xs ${
                    i <= step ? "font-medium text-charcoal" : "text-gray-muted"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    i < step ? "bg-sec-blue" : "bg-divider"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <Card className="p-6">
        {step === 0 && (
          <CorpTypeStep
            value={state.corpType}
            onChange={(v) => updateState("corpType", v)}
          />
        )}
        {step === 1 && (
          <DetailsStep
            incorporationYear={state.incorporationYear}
            reBracket={state.reBracket}
            mc28Compliant={state.mc28Compliant}
            onIncorporationYearChange={(v) =>
              updateState("incorporationYear", v)
            }
            onReBracketChange={(v) => updateState("reBracket", v)}
            onMc28CompliantChange={(v) => updateState("mc28Compliant", v)}
          />
        )}
        {step === 2 && (
          <FilingsStep
            incorporationYear={state.incorporationYear}
            filedReports={state.filedReports}
            onChange={(v) => updateState("filedReports", v)}
          />
        )}
        {step === 3 && (
          <SuspensionStep
            hasSuspension={state.hasSuspension}
            suspensionDate={state.suspensionDate}
            hasRevocation={state.hasRevocation}
            revocationDate={state.revocationDate}
            onHasSuspensionChange={(v) => updateState("hasSuspension", v)}
            onSuspensionDateChange={(v) => updateState("suspensionDate", v)}
            onHasRevocationChange={(v) => updateState("hasRevocation", v)}
            onRevocationDateChange={(v) => updateState("revocationDate", v)}
          />
        )}
      </Card>

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
          className="text-charcoal"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canAdvance(step, state)}
          className="bg-sec-blue text-white hover:bg-sec-blue/90"
        >
          {step === STEPS.length - 1 ? "View Results" : "Next"}
        </Button>
      </div>
    </div>
  );
}
