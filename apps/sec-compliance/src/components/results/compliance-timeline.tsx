"use client";

import { useState } from "react";
import type { PenaltyLineItem, BOPenaltyItem } from "@/engine/penalties";
import type { ReportType } from "@/engine/types";
import { formatCurrency } from "@/lib/utils";

const BO_START_YEAR = 2019;

type CellStatus = "filed_on_time" | "filed_late" | "not_filed" | "not_required";

interface TimelineCell {
  year: number;
  reportType: ReportType;
  status: CellStatus;
  penalty?: number;
}

interface ComplianceTimelineProps {
  incorporationYear: number;
  currentYear: number;
  filedReports: Array<{
    reportType: string;
    year: number;
    status: string;
  }>;
  lineItems: PenaltyLineItem[];
  boPenalties: BOPenaltyItem[];
}

const STATUS_COLORS: Record<CellStatus, string> = {
  filed_on_time: "bg-green-500",
  filed_late: "bg-amber-500",
  not_filed: "bg-[#A63232]",
  not_required: "bg-gray-200",
};

const STATUS_LABELS: Record<CellStatus, string> = {
  filed_on_time: "Filed on time",
  filed_late: "Filed late",
  not_filed: "Not filed",
  not_required: "Not yet required",
};

function buildTimelineCells(
  incorporationYear: number,
  currentYear: number,
  filedReports: Array<{ reportType: string; year: number; status: string }>,
  lineItems: PenaltyLineItem[],
  boPenalties: BOPenaltyItem[]
): TimelineCell[] {
  const cells: TimelineCell[] = [];
  const filedSet = new Map<string, string>();

  for (const r of filedReports) {
    filedSet.set(`${r.reportType}-${r.year}`, r.status);
  }

  // Build penalty lookup
  const penaltyMap = new Map<string, number>();
  for (const item of lineItems) {
    penaltyMap.set(`${item.reportType}-${item.year}`, item.totalPenalty);
  }
  for (const item of boPenalties) {
    penaltyMap.set(`BO-${item.year}`, item.totalPenalty);
  }

  const reportTypes: ReportType[] = ["GIS", "AFS", "BO"];

  for (let year = incorporationYear; year <= currentYear; year++) {
    for (const rt of reportTypes) {
      const key = `${rt}-${year}`;

      // BO not required before 2019
      if (rt === "BO" && year < BO_START_YEAR) {
        cells.push({
          year,
          reportType: rt,
          status: "not_required",
        });
        continue;
      }

      const filedStatus = filedSet.get(key);
      let status: CellStatus;

      if (filedStatus === "filed_on_time" || filedStatus === "filed") {
        status = "filed_on_time";
      } else if (filedStatus === "filed_late") {
        status = "filed_late";
      } else {
        status = "not_filed";
      }

      cells.push({
        year,
        reportType: rt,
        status,
        penalty: penaltyMap.get(key),
      });
    }
  }

  return cells;
}

export function ComplianceTimeline({
  incorporationYear,
  currentYear,
  filedReports,
  lineItems,
  boPenalties,
}: ComplianceTimelineProps) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const cells = buildTimelineCells(
    incorporationYear,
    currentYear,
    filedReports,
    lineItems,
    boPenalties
  );

  const years: number[] = [];
  for (let y = incorporationYear; y <= currentYear; y++) {
    years.push(y);
  }

  const reportTypes: ReportType[] = ["GIS", "AFS", "BO"];

  const cellsByYearAndType = new Map<string, TimelineCell>();
  for (const cell of cells) {
    cellsByYearAndType.set(`${cell.year}-${cell.reportType}`, cell);
  }

  const handleMouseEnter = (
    cell: TimelineCell,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const parentRect =
      event.currentTarget.closest("[data-timeline]")?.getBoundingClientRect() ?? rect;

    let text = `${cell.reportType} ${cell.year}: ${STATUS_LABELS[cell.status]}`;
    if (cell.penalty !== undefined && cell.penalty > 0) {
      text += ` — ${formatCurrency(cell.penalty)} penalty`;
    }

    setTooltip({
      text,
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-charcoal">
        Compliance Timeline
      </h2>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-body text-charcoal">
        {(
          Object.entries(STATUS_COLORS) as [CellStatus, string][]
        ).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-sm ${color}`} />
            <span>{STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>

      {/* Timeline grid */}
      <div
        className="relative overflow-x-auto rounded-lg border border-divider pb-2"
        data-timeline
      >
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded bg-charcoal px-2.5 py-1.5 text-xs text-white shadow-lg whitespace-nowrap"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.text}
          </div>
        )}

        <div className="inline-flex min-w-full flex-col">
          {/* Year headers */}
          <div className="flex">
            <div className="w-12 flex-shrink-0" />
            {years.map((year) => (
              <div
                key={year}
                className="flex w-10 flex-shrink-0 items-center justify-center border-b border-divider py-2"
              >
                <span className="font-body text-[10px] font-semibold text-gray-secondary">
                  {String(year).slice(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Report type rows */}
          {reportTypes.map((rt) => (
            <div key={rt} className="flex">
              <div className="flex w-12 flex-shrink-0 items-center justify-center">
                <span className="font-body text-xs font-medium text-gray-secondary">
                  {rt}
                </span>
              </div>
              {years.map((year) => {
                const cell = cellsByYearAndType.get(`${year}-${rt}`);
                if (!cell) return null;

                return (
                  <div
                    key={`${rt}-${year}`}
                    className="flex w-10 flex-shrink-0 items-center justify-center p-1"
                  >
                    <div
                      className={`h-6 w-7 rounded-sm cursor-pointer transition-transform hover:scale-110 ${STATUS_COLORS[cell.status]}`}
                      onMouseEnter={(e) => handleMouseEnter(cell, e)}
                      onMouseLeave={handleMouseLeave}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
