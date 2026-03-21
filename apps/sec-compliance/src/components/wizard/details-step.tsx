"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DetailsStepProps {
  incorporationYear: number | null;
  reBracket: string | null;
  mc28Compliant: boolean;
  onIncorporationYearChange: (year: number | null) => void;
  onReBracketChange: (bracket: string | null) => void;
  onMc28CompliantChange: (compliant: boolean) => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: currentYear - 1900 + 1 },
  (_, i) => currentYear - i
);

const reBrackets = [
  { value: "capital_deficiency", label: "Capital Deficiency" },
  { value: "negative", label: "Negative Retained Earnings" },
  { value: "0_100k", label: "₱0 – ₱100,000" },
  { value: "100k_500k", label: "₱100,001 – ₱500,000" },
  { value: "500k_5m", label: "₱500,001 – ₱5,000,000" },
  { value: "5m_10m", label: "₱5,000,001 – ₱10,000,000" },
  { value: "above_10m", label: "Above ₱10,000,000" },
];

export function DetailsStep({
  incorporationYear,
  reBracket,
  mc28Compliant,
  onIncorporationYearChange,
  onReBracketChange,
  onMc28CompliantChange,
}: DetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-charcoal">
          Corporation Details
        </h2>
        <p className="mt-1 text-sm text-gray-secondary">
          Provide details about your corporation.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inc-year" className="text-sm font-medium text-charcoal">
            Year of Incorporation
          </Label>
          <Select
            value={incorporationYear?.toString() ?? ""}
            onValueChange={(v) =>
              onIncorporationYearChange(v ? parseInt(v, 10) : null)
            }
          >
            <SelectTrigger id="inc-year" className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="re-bracket" className="text-sm font-medium text-charcoal">
            Retained Earnings Bracket
          </Label>
          <Select
            value={reBracket ?? ""}
            onValueChange={(v) => onReBracketChange(v || null)}
          >
            <SelectTrigger id="re-bracket" className="w-full">
              <SelectValue placeholder="Select RE bracket">
                {reBracket
                  ? reBrackets.find((b) => b.value === reBracket)?.label ?? reBracket
                  : "Select RE bracket"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {reBrackets.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-divider p-4">
          <Checkbox
            id="mc28"
            checked={mc28Compliant}
            onCheckedChange={(checked) =>
              onMc28CompliantChange(checked === true)
            }
          />
          <Label htmlFor="mc28" className="cursor-pointer text-sm text-charcoal">
            Compliant with MC No. 28 (Revised Corporation Code)
          </Label>
        </div>
      </div>
    </div>
  );
}
