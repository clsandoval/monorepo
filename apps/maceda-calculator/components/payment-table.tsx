"use client";

import { useState, useEffect, useCallback } from "react";

interface PaymentRow {
  date: string;
  amount: string;
}

interface PaymentTableProps {
  payments: PaymentRow[];
  onPaymentsChange: (payments: PaymentRow[]) => void;
  contractStartDate: string;
  monthlyInstallment: string;
  error?: string;
}

export function PaymentTable({
  payments,
  onPaymentsChange,
  contractStartDate,
  monthlyInstallment,
  error,
}: PaymentTableProps) {
  const [autoFill, setAutoFill] = useState(false);

  const generatePayments = useCallback(() => {
    if (!contractStartDate || !monthlyInstallment) return;
    const start = new Date(contractStartDate);
    if (isNaN(start.getTime())) return;
    const now = new Date();
    const rows: PaymentRow[] = [];
    const current = new Date(start);
    current.setMonth(current.getMonth() + 1);
    while (current <= now) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      rows.push({ date: `${y}-${m}-${d}`, amount: monthlyInstallment });
      current.setMonth(current.getMonth() + 1);
    }
    onPaymentsChange(rows);
  }, [contractStartDate, monthlyInstallment, onPaymentsChange]);

  useEffect(() => {
    if (autoFill) generatePayments();
  }, [autoFill, generatePayments]);

  const addRow = () => onPaymentsChange([...payments, { date: "", amount: "" }]);

  const updateRow = (index: number, field: "date" | "amount", value: string) => {
    const updated = [...payments];
    updated[index] = { ...updated[index], [field]: value };
    onPaymentsChange(updated);
  };

  const removeRow = (index: number) =>
    onPaymentsChange(payments.filter((_, i) => i !== index));

  const showCollapsed = autoFill && payments.length > 6;
  const visibleRows = showCollapsed
    ? [...payments.slice(0, 3), ...payments.slice(-1)]
    : payments;
  const hiddenCount = showCollapsed ? payments.length - 4 : 0;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated p-7">
      <div className="mb-5 font-heading text-[13px] font-semibold uppercase tracking-wider text-text-tertiary">
        Payment History
      </div>

      <div
        className="mb-4 flex cursor-pointer items-center gap-2.5 rounded-lg border border-accent-soft bg-accent-glow px-4 py-3"
        onClick={() => setAutoFill(!autoFill)}
      >
        <div
          className={`relative h-[18px] w-[34px] flex-shrink-0 rounded-full transition-colors ${autoFill ? "bg-accent" : "bg-border"}`}
        >
          <div
            className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-transform ${autoFill ? "right-[2px]" : "left-[2px]"}`}
          />
        </div>
        <span className="text-[13px] font-medium text-accent">
          I paid regularly — auto-fill payments
        </span>
      </div>

      <div className="space-y-0.5">
        <div className="mb-1 grid grid-cols-[28px_1fr_1fr_28px] gap-2 border-b border-border-subtle pb-2.5">
          <div />
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            Date
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            Amount
          </div>
          <div />
        </div>

        {visibleRows.map((row, i) => {
          const actualIndex =
            showCollapsed && i === visibleRows.length - 1
              ? payments.length - 1
              : i;
          return (
            <div
              key={actualIndex}
              className="grid grid-cols-[28px_1fr_1fr_28px] items-center gap-2 py-1.5"
            >
              <div className="pr-1 text-right text-[11px] font-medium text-text-tertiary">
                {actualIndex + 1}
              </div>
              <input
                type="text"
                value={row.date}
                onChange={(e) => updateRow(actualIndex, "date", e.target.value)}
                placeholder="YYYY-MM-DD"
                className="rounded-md border border-border bg-bg px-2.5 py-2 font-body text-[13px] text-text-primary focus:border-accent focus:outline-none"
                readOnly={autoFill}
              />
              <input
                type="text"
                value={row.amount}
                onChange={(e) =>
                  updateRow(actualIndex, "amount", e.target.value)
                }
                placeholder="₱0"
                className="rounded-md border border-border bg-bg px-2.5 py-2 font-body text-[13px] text-text-primary focus:border-accent focus:outline-none"
                readOnly={autoFill}
              />
              {!autoFill ? (
                <button
                  onClick={() => removeRow(actualIndex)}
                  className="text-[11px] text-text-tertiary hover:text-red-400"
                >
                  ×
                </button>
              ) : (
                <div />
              )}
            </div>
          );
        })}

        {showCollapsed && hiddenCount > 0 && (
          <div className="py-2 text-center text-[12px] italic text-text-tertiary">
            … {hiddenCount} auto-filled payments …
          </div>
        )}
      </div>

      {!autoFill && (
        <button
          onClick={addRow}
          className="mt-3 font-body text-[13px] font-medium text-accent hover:underline"
        >
          + Add a payment
        </button>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
