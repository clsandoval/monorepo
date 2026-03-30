"use client";

import { useState, useCallback } from "react";
import {
  computeAmnesty,
  calculatorSchema,
  MIN_YEAR,
  MAX_YEAR,
  type DelinquentYear,
  type AmnestyResult,
} from "@/lib/engine";

type Props = {
  onResult: (result: AmnestyResult) => void;
};

function parsePesoInput(raw: string): number {
  const cleaned = raw.replace(/[₱,\s]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0) return 0;
  return Math.round(num * 100); // to centavos
}

export function CalculatorForm({ onResult }: Props) {
  const [numYears, setNumYears] = useState(5);
  const [sameAmount, setSameAmount] = useState(true);
  const [amounts, setAmounts] = useState<string[]>(Array(5).fill("15,000"));
  const [errors, setErrors] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const startYear = MAX_YEAR - numYears + 1;

  const handleNumYearsChange = useCallback(
    (value: string) => {
      const n = Math.max(1, Math.min(30, parseInt(value) || 1));
      setNumYears(n);
      setAmounts((prev) => {
        const newAmounts = Array(n).fill("");
        for (let i = 0; i < Math.min(prev.length, n); i++) {
          newAmounts[i] = prev[i];
        }
        if (sameAmount && prev[0]) {
          return newAmounts.map(() => prev[0]);
        }
        return newAmounts;
      });
      setErrors([]);
      setFormError(null);
    },
    [sameAmount]
  );

  const handleAmountChange = useCallback(
    (index: number, value: string) => {
      setAmounts((prev) => {
        const next = [...prev];
        if (sameAmount) {
          return next.map(() => value);
        }
        next[index] = value;
        return next;
      });
      setErrors([]);
      setFormError(null);
    },
    [sameAmount]
  );

  const handleSameAmountToggle = useCallback(
    (checked: boolean) => {
      setSameAmount(checked);
      if (checked && amounts[0]) {
        setAmounts((prev) => prev.map(() => prev[0]));
      }
    },
    [amounts]
  );

  const handleSubmit = useCallback(() => {
    const years: DelinquentYear[] = [];
    const newErrors: string[] = Array(numYears).fill("");

    for (let i = 0; i < numYears; i++) {
      const centavos = parsePesoInput(amounts[i]);
      if (centavos === 0) {
        newErrors[i] = "Enter a valid amount";
      } else {
        years.push({
          calendarYear: startYear + i,
          annualRptSeF: centavos,
        });
      }
    }

    if (newErrors.some((e) => e)) {
      setErrors(newErrors);
      return;
    }

    const parsed = calculatorSchema.safeParse({ years });
    if (!parsed.success) {
      setFormError("Please check your inputs and try again.");
      return;
    }

    const result = computeAmnesty(parsed.data.years);
    onResult(result);
  }, [amounts, numYears, startYear, onResult]);

  return (
    <div className="rounded-lg border border-border bg-bg-panel p-6">
      <h2 className="font-heading text-xl font-bold text-text-primary mb-6">
        Enter Your Delinquent Years
      </h2>

      {/* Number of years */}
      <div className="mb-6">
        <label
          htmlFor="num-years"
          className="block font-heading text-[15px] font-bold text-text-primary mb-1"
        >
          Number of delinquent years
        </label>
        <input
          id="num-years"
          type="number"
          min={1}
          max={30}
          value={numYears}
          onChange={(e) => handleNumYearsChange(e.target.value)}
          className="h-[44px] w-24 rounded-md border-2 border-border bg-bg px-3 font-heading text-lg text-text-primary focus:border-accent focus:outline-none"
        />
        <p className="mt-1 text-sm text-text-secondary font-body">
          Years {startYear}–{MAX_YEAR} ({numYears} year
          {numYears > 1 ? "s" : ""})
        </p>
      </div>

      {/* Same amount toggle */}
      <label className="flex items-center gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={sameAmount}
          onChange={(e) => handleSameAmountToggle(e.target.checked)}
          className="h-[18px] w-[18px] rounded border-2 border-border accent-accent"
        />
        <span className="font-body text-sm text-text-primary">
          Same amount for all years
        </span>
      </label>

      {/* Per-year inputs */}
      <div className="space-y-3 mb-6">
        {amounts.map((amount, i) => (
          <div key={i}>
            <label
              htmlFor={`year-${i}`}
              className="block font-heading text-[15px] font-bold text-text-primary mb-1"
            >
              {startYear + i}
            </label>
            <div className="flex items-center gap-1">
              <span className="font-heading text-lg font-bold text-text-primary">
                ₱
              </span>
              <input
                id={`year-${i}`}
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => handleAmountChange(i, e.target.value)}
                placeholder="15,000"
                className="h-[44px] w-full rounded-md border-2 border-border bg-bg px-3 font-heading text-lg text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
              />
            </div>
            {errors[i] && (
              <p className="mt-1 text-sm text-accent font-body">{errors[i]}</p>
            )}
          </div>
        ))}
      </div>

      {formError && (
        <p className="mb-4 text-sm text-accent font-body">{formError}</p>
      )}

      {/* Compute button */}
      <button
        onClick={handleSubmit}
        className="h-[52px] w-full rounded-md bg-accent text-white font-body text-[17px] font-semibold hover:bg-accent/90 transition-colors cursor-pointer"
      >
        Compute Amnesty Savings
      </button>
    </div>
  );
}
