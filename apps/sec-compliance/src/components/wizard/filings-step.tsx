"use client";

import { useState, useCallback, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface FilingRecord {
  reportType: string;
  year: number;
  status: string;
}

interface FilingsStepProps {
  incorporationYear: number | null;
  filedReports: FilingRecord[];
  onChange: (reports: FilingRecord[]) => void;
}

const REPORT_TYPES = ["GIS", "AFS", "BO"] as const;
const BO_START_YEAR = 2019;

function chunkYears(years: number[]): { label: string; years: number[] }[] {
  if (years.length <= 10) {
    return [{ label: `${years[years.length - 1]}–${years[0]}`, years }];
  }

  const groups: { label: string; years: number[] }[] = [];
  const minYear = years[years.length - 1];
  const maxYear = years[0];

  // Create 5-year blocks from most recent going back
  let blockEnd = maxYear;
  while (blockEnd >= minYear) {
    const blockStart = Math.max(blockEnd - 4, minYear);
    const blockYears = years.filter((y) => y >= blockStart && y <= blockEnd);
    if (blockYears.length > 0) {
      groups.push({
        label: `${blockStart}–${blockEnd}`,
        years: blockYears,
      });
    }
    blockEnd = blockStart - 1;
  }

  return groups;
}

export function FilingsStep({
  incorporationYear,
  filedReports,
  onChange,
}: FilingsStepProps) {
  const currentYear = new Date().getFullYear();
  const startYear = incorporationYear ?? currentYear;

  const allYears = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= startYear; y--) {
      years.push(y);
    }
    return years;
  }, [startYear, currentYear]);

  const groups = useMemo(() => chunkYears(allYears), [allYears]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    if (groups.length > 0) {
      return new Set([groups[0].label]);
    }
    return new Set();
  });

  const isChecked = useCallback(
    (year: number, reportType: string) => {
      return filedReports.some(
        (r) => r.year === year && r.reportType === reportType && r.status === "filed"
      );
    },
    [filedReports]
  );

  const toggleFiling = useCallback(
    (year: number, reportType: string) => {
      const existing = filedReports.find(
        (r) => r.year === year && r.reportType === reportType
      );
      if (existing && existing.status === "filed") {
        onChange(
          filedReports.filter(
            (r) => !(r.year === year && r.reportType === reportType)
          )
        );
      } else {
        const filtered = filedReports.filter(
          (r) => !(r.year === year && r.reportType === reportType)
        );
        onChange([...filtered, { reportType, year, status: "filed" }]);
      }
    },
    [filedReports, onChange]
  );

  const handleBulkFill = useCallback(
    (throughYear: string) => {
      if (!throughYear) return;
      const targetYear = parseInt(throughYear, 10);
      const newReports = [...filedReports];

      for (let y = startYear; y <= targetYear; y++) {
        for (const rt of REPORT_TYPES) {
          if (rt === "BO" && y < BO_START_YEAR) continue;
          const exists = newReports.some(
            (r) => r.year === y && r.reportType === rt && r.status === "filed"
          );
          if (!exists) {
            // Remove any existing non-filed entry
            const idx = newReports.findIndex(
              (r) => r.year === y && r.reportType === rt
            );
            if (idx >= 0) newReports.splice(idx, 1);
            newReports.push({ reportType: rt, year: y, status: "filed" });
          }
        }
      }
      onChange(newReports);
    },
    [filedReports, onChange, startYear]
  );

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  if (!incorporationYear) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-charcoal">
            Filing History
          </h2>
          <p className="mt-1 text-sm text-gray-secondary">
            Please go back and select an incorporation year first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-charcoal">
          Filing History
        </h2>
        <p className="mt-1 text-sm text-gray-secondary">
          Check each report that has been filed. Unchecked boxes indicate missing
          filings.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-charcoal">
          Filed all reports through
        </label>
        <Select onValueChange={(v: string | null) => { if (v) handleBulkFill(v); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {allYears.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.label);
          const needsCollapse = groups.length > 1;

          return (
            <div
              key={group.label}
              className="rounded-lg border border-divider"
            >
              {needsCollapse && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-between px-4 py-3 text-sm font-medium text-charcoal"
                  onClick={() => toggleGroup(group.label)}
                >
                  <span>{group.label}</span>
                  <span className="text-gray-muted">
                    {isExpanded ? "−" : "+"}
                  </span>
                </Button>
              )}

              {(isExpanded || !needsCollapse) && (
                <div className="overflow-x-auto px-4 pb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-divider">
                        <th className="py-2 pr-4 text-left font-medium text-gray-secondary">
                          Year
                        </th>
                        {REPORT_TYPES.map((rt) => (
                          <th
                            key={rt}
                            className="px-3 py-2 text-center font-medium text-gray-secondary"
                          >
                            {rt}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.years.map((year) => (
                        <tr
                          key={year}
                          className="border-b border-divider last:border-0"
                        >
                          <td className="py-2 pr-4 font-medium text-charcoal">
                            {year}
                          </td>
                          {REPORT_TYPES.map((rt) => {
                            const disabled = rt === "BO" && year < BO_START_YEAR;
                            return (
                              <td key={rt} className="px-3 py-2 text-center">
                                {disabled ? (
                                  <span className="inline-block h-4 w-4 rounded bg-gray-100" />
                                ) : (
                                  <Checkbox
                                    checked={isChecked(year, rt)}
                                    onCheckedChange={() =>
                                      toggleFiling(year, rt)
                                    }
                                    aria-label={`${rt} ${year}`}
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
