"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type CorpType = "stock" | "non_stock" | "opc";

interface CorpTypeStepProps {
  value: CorpType | null;
  onChange: (value: CorpType) => void;
  isProUser?: boolean;
  corpName?: string | null;
  onCorpNameChange?: (name: string) => void;
}

const options: { value: CorpType; label: string; note?: string }[] = [
  { value: "stock", label: "Stock Corporation" },
  { value: "non_stock", label: "Non-Stock Corporation" },
  {
    value: "opc",
    label: "One Person Corporation (OPC)",
    note: "Only available for domestic corporations.",
  },
];

export function CorpTypeStep({ value, onChange, isProUser, corpName, onCorpNameChange }: CorpTypeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-charcoal">
          Corporation Type
        </h2>
        <p className="mt-1 text-sm text-gray-secondary">
          Select the type of corporation you are filing for.
        </p>
      </div>

      {isProUser && (
        <div className="space-y-1.5 mb-6">
          <Label htmlFor="corp-name" className="font-body text-sm text-charcoal">
            Corporation Name
          </Label>
          <input
            id="corp-name"
            type="text"
            value={corpName ?? ""}
            onChange={(e) => onCorpNameChange?.(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-body text-sm text-charcoal placeholder:text-gray-muted focus:border-sec-blue focus:outline-none focus:ring-2 focus:ring-sec-blue/20"
            placeholder="e.g. ABC Holdings Corp."
          />
        </div>
      )}

      <RadioGroup
        value={value ?? ""}
        onValueChange={(v) => onChange(v as CorpType)}
        className="space-y-3"
      >
        {options.map((opt) => (
          <Label
            key={opt.value}
            htmlFor={`corp-${opt.value}`}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-divider p-4 transition-colors hover:border-sec-blue has-[[data-checked]]:border-sec-blue has-[[data-checked]]:bg-sec-blue/5"
          >
            <RadioGroupItem value={opt.value} id={`corp-${opt.value}`} />
            <div>
              <span className="text-sm font-medium text-charcoal">
                {opt.label}
              </span>
              {opt.note && (
                <p className="mt-0.5 text-xs text-gray-muted">{opt.note}</p>
              )}
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
