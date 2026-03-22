"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SuspensionStepProps {
  hasSuspension: boolean;
  suspensionDate: string | null;
  hasRevocation: boolean;
  revocationDate: string | null;
  onHasSuspensionChange: (value: boolean) => void;
  onSuspensionDateChange: (date: string | null) => void;
  onHasRevocationChange: (value: boolean) => void;
  onRevocationDateChange: (date: string | null) => void;
}

export function SuspensionStep({
  hasSuspension,
  suspensionDate,
  hasRevocation,
  revocationDate,
  onHasSuspensionChange,
  onSuspensionDateChange,
  onHasRevocationChange,
  onRevocationDateChange,
}: SuspensionStepProps) {
  const hasOrder = hasSuspension || hasRevocation;

  const handleOrderChange = (value: string) => {
    if (value === "no") {
      onHasSuspensionChange(false);
      onSuspensionDateChange(null);
      onHasRevocationChange(false);
      onRevocationDateChange(null);
    } else if (value === "yes") {
      // Default to suspension when "yes" is first selected
      if (!hasSuspension && !hasRevocation) {
        onHasSuspensionChange(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-charcoal">
          Suspension / Revocation
        </h2>
        <p className="mt-1 text-sm text-gray-secondary">
          Has the SEC issued a suspension or revocation order against your
          corporation?
        </p>
      </div>

      <RadioGroup
        value={hasOrder ? "yes" : "no"}
        onValueChange={handleOrderChange}
        className="space-y-3"
      >
        <Label
          htmlFor="order-no"
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-divider p-4 transition-colors hover:border-sec-blue has-[[data-state=checked]]:border-sec-blue has-[[data-state=checked]]:bg-sec-blue/5"
        >
          <RadioGroupItem value="no" id="order-no" />
          <span className="text-sm font-medium text-charcoal">
            No suspension or revocation
          </span>
        </Label>

        <Label
          htmlFor="order-yes"
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-divider p-4 transition-colors hover:border-sec-blue has-[[data-state=checked]]:border-sec-blue has-[[data-state=checked]]:bg-sec-blue/5"
        >
          <RadioGroupItem value="yes" id="order-yes" />
          <span className="text-sm font-medium text-charcoal">
            Yes, we received an order
          </span>
        </Label>
      </RadioGroup>

      {hasOrder && (
        <div className="space-y-4 rounded-lg border border-divider bg-gray-50 p-4">
          <p className="text-sm font-medium text-charcoal">
            Select the applicable orders:
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="has-suspension"
                  checked={hasSuspension}
                  onChange={(e) => {
                    onHasSuspensionChange(e.target.checked);
                    if (!e.target.checked) onSuspensionDateChange(null);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-sec-blue focus:ring-sec-blue"
                />
                <Label
                  htmlFor="has-suspension"
                  className="cursor-pointer text-sm text-charcoal"
                >
                  Suspension Order
                </Label>
              </div>
              {hasSuspension && (
                <div className="ml-7">
                  <Label
                    htmlFor="suspension-date"
                    className="mb-1 block text-xs text-gray-secondary"
                  >
                    Date of suspension order
                  </Label>
                  <input
                    type="date"
                    id="suspension-date"
                    value={suspensionDate ?? ""}
                    onChange={(e) =>
                      onSuspensionDateChange(e.target.value || null)
                    }
                    className="rounded-md border border-divider px-3 py-2 text-sm text-charcoal focus:border-sec-blue focus:outline-none focus:ring-1 focus:ring-sec-blue"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="has-revocation"
                  checked={hasRevocation}
                  onChange={(e) => {
                    onHasRevocationChange(e.target.checked);
                    if (!e.target.checked) onRevocationDateChange(null);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-sec-blue focus:ring-sec-blue"
                />
                <Label
                  htmlFor="has-revocation"
                  className="cursor-pointer text-sm text-charcoal"
                >
                  Revocation Order
                </Label>
              </div>
              {hasRevocation && (
                <div className="ml-7">
                  <Label
                    htmlFor="revocation-date"
                    className="mb-1 block text-xs text-gray-secondary"
                  >
                    Date of revocation order
                  </Label>
                  <input
                    type="date"
                    id="revocation-date"
                    value={revocationDate ?? ""}
                    onChange={(e) =>
                      onRevocationDateChange(e.target.value || null)
                    }
                    className="rounded-md border border-divider px-3 py-2 text-sm text-charcoal focus:border-sec-blue focus:outline-none focus:ring-1 focus:ring-sec-blue"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
