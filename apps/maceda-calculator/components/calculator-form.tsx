"use client";

import { useState, useCallback } from "react";
import { ContractDetails } from "./contract-details";
import { PaymentTable } from "./payment-table";
import { GracePeriodInput } from "./grace-period-input";
import { validateInput } from "@/lib/engine/validation";
import { compute } from "@/lib/engine/compute";
import type { MacedaInput, MacedaResult } from "@/lib/engine/types";
import type { InputSummary } from "./pdf-report";

interface CalculatorFormProps {
  onResult: (result: MacedaResult, inputSummary: InputSummary) => void;
}

function parseCentavos(s: string): number {
  const cleaned = s.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

export function CalculatorForm({ onResult }: CalculatorFormProps) {
  const [contractPrice, setContractPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [monthlyInstallment, setMonthlyInstallment] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [payments, setPayments] = useState<{ date: string; amount: string }[]>(
    [{ date: "", amount: "" }]
  );
  const [previousGracePeriod, setPreviousGracePeriod] = useState(false);
  const [previousGracePeriodDate, setPreviousGracePeriodDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleContractChange = (field: string, value: string) => {
    if (field === "contractPrice") setContractPrice(value);
    if (field === "downPayment") setDownPayment(value);
    if (field === "monthlyInstallment") setMonthlyInstallment(value);
    if (field === "contractStartDate") setContractStartDate(value);
  };

  const handleGraceChange = (field: string, value: string | boolean) => {
    if (field === "previousGracePeriod")
      setPreviousGracePeriod(value as boolean);
    if (field === "previousGracePeriodDate")
      setPreviousGracePeriodDate(value as string);
  };

  const handlePaymentsChange = useCallback(
    (newPayments: { date: string; amount: string }[]) => {
      setPayments(newPayments);
    },
    []
  );

  const handleSubmit = () => {
    const input: MacedaInput = {
      contractPrice: parseCentavos(contractPrice),
      downPayment: parseCentavos(downPayment),
      monthlyInstallment: parseCentavos(monthlyInstallment),
      contractStartDate,
      payments: payments
        .filter((p) => p.date && p.amount)
        .map((p) => ({ date: p.date, amount: parseCentavos(p.amount) })),
      previousGracePeriod,
      previousGracePeriodDate: previousGracePeriod
        ? previousGracePeriodDate
        : undefined,
    };

    const validation = validateInput(input);
    if (!validation.valid) {
      const errMap: Record<string, string> = {};
      validation.errors.forEach((e) => {
        errMap[e.field] = e.message;
      });
      setErrors(errMap);
      return;
    }

    setErrors({});
    const inputSummary: InputSummary = {
      contractPrice: contractPrice ? `PHP ${contractPrice}` : "—",
      downPayment: downPayment ? `PHP ${downPayment}` : "—",
      monthlyInstallment: monthlyInstallment ? `PHP ${monthlyInstallment}` : "—",
      contractStartDate: contractStartDate || "—",
    };
    onResult(compute(input), inputSummary);
  };

  const hasRequiredFields =
    contractPrice && monthlyInstallment && contractStartDate;

  return (
    <div className="space-y-4">
      <ContractDetails
        contractPrice={contractPrice}
        downPayment={downPayment}
        monthlyInstallment={monthlyInstallment}
        contractStartDate={contractStartDate}
        onChange={handleContractChange}
        errors={errors}
      />
      <PaymentTable
        payments={payments}
        onPaymentsChange={handlePaymentsChange}
        contractStartDate={contractStartDate}
        monthlyInstallment={monthlyInstallment}
        error={errors.payments}
      />
      <GracePeriodInput
        previousGracePeriod={previousGracePeriod}
        previousGracePeriodDate={previousGracePeriodDate}
        onChange={handleGraceChange}
        error={errors.previousGracePeriodDate}
      />
      <button
        onClick={handleSubmit}
        disabled={!hasRequiredFields}
        className="w-full rounded-xl bg-text-primary py-4 font-body text-[15px] font-semibold tracking-tight text-bg transition-all hover:-translate-y-px hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
      >
        Calculate my rights
      </button>
    </div>
  );
}
