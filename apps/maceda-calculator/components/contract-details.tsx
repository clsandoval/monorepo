"use client";

interface ContractDetailsProps {
  contractPrice: string;
  downPayment: string;
  monthlyInstallment: string;
  contractStartDate: string;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export function ContractDetails({
  contractPrice,
  downPayment,
  monthlyInstallment,
  contractStartDate,
  onChange,
  errors,
}: ContractDetailsProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated p-7">
      <div className="mb-5 font-heading text-[13px] font-semibold uppercase tracking-wider text-text-tertiary">
        Contract Details
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Contract Price"
          prefix="₱"
          value={contractPrice}
          onChange={(v) => onChange("contractPrice", v)}
          error={errors.contractPrice}
        />
        <Field
          label="Down Payment"
          prefix="₱"
          value={downPayment}
          onChange={(v) => onChange("downPayment", v)}
          error={errors.downPayment}
        />
        <Field
          label="Monthly Installment"
          prefix="₱"
          value={monthlyInstallment}
          onChange={(v) => onChange("monthlyInstallment", v)}
          error={errors.monthlyInstallment}
        />
        <Field
          label="Contract Start Date"
          value={contractStartDate}
          onChange={(v) => onChange("contractStartDate", v)}
          placeholder="YYYY-MM-DD"
          error={errors.contractStartDate}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  prefix,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  prefix?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-text-secondary">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-bg px-3.5 py-2.5 font-body text-sm text-text-primary transition-all focus:border-accent focus:bg-bg-elevated focus:shadow-[0_0_0_3px_var(--color-accent-glow)] focus:outline-none ${prefix ? "pl-7" : ""} ${error ? "border-red-400" : "border-border"}`}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
