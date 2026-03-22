"use client";

import { cn } from "@/lib/utils";
import type { ComplianceStatus } from "@/engine/types";

type FilterValue = "all" | ComplianceStatus;

interface StatusFilterTabsProps {
  active: FilterValue;
  counts: Record<FilterValue, number>;
  onChange: (value: FilterValue) => void;
}

const TABS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "delinquent", label: "Delinquent" },
  { value: "suspended", label: "Suspended" },
  { value: "active", label: "Active" },
  { value: "revoked", label: "Revoked" },
];

export function StatusFilterTabs({ active, counts, onChange }: StatusFilterTabsProps) {
  return (
    <div className="flex gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "px-3.5 py-1.5 rounded-lg font-body text-sm transition-colors",
            active === tab.value
              ? "bg-sec-blue text-white font-medium"
              : "bg-white border border-divider text-gray-secondary hover:text-charcoal"
          )}
        >
          {tab.label} ({counts[tab.value]})
        </button>
      ))}
    </div>
  );
}
