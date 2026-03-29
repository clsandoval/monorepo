"use client";

interface GracePeriodInputProps {
  previousGracePeriod: boolean;
  previousGracePeriodDate: string;
  onChange: (field: string, value: string | boolean) => void;
  error?: string;
}

export function GracePeriodInput({
  previousGracePeriod,
  previousGracePeriodDate,
  onChange,
  error,
}: GracePeriodInputProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated p-7">
      <div className="mb-5 font-heading text-[13px] font-semibold uppercase tracking-wider text-text-tertiary">
        Grace Period History
      </div>
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={previousGracePeriod}
          onChange={(e) => onChange("previousGracePeriod", e.target.checked)}
          className="h-[18px] w-[18px] accent-accent"
        />
        <span className="text-sm text-text-secondary">
          I have previously exercised my grace period
        </span>
      </label>
      {previousGracePeriod && (
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-text-secondary">
            When was it exercised?
          </label>
          <input
            type="text"
            value={previousGracePeriodDate}
            onChange={(e) =>
              onChange("previousGracePeriodDate", e.target.value)
            }
            placeholder="YYYY-MM-DD"
            className={`w-48 rounded-lg border bg-bg px-3.5 py-2.5 font-body text-sm text-text-primary transition-all focus:border-accent focus:bg-bg-elevated focus:shadow-[0_0_0_3px_var(--color-accent-glow)] focus:outline-none ${error ? "border-red-400" : "border-border"}`}
          />
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      )}
    </div>
  );
}
