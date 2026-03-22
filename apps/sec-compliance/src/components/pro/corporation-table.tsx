"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { ComplianceStatus } from "@/engine/types";
import { StatusFilterTabs } from "./status-filter-tabs";

export interface CorpRow {
  id: string;
  name: string | null;
  corp_type: string;
  status: ComplianceStatus;
  totalPenalty: number;
  nextDeadline: string | null;
  hasFilingHistory: boolean;
}

interface CorporationTableProps {
  corporations: CorpRow[];
  onImportCSV: () => void;
}

type FilterValue = "all" | ComplianceStatus;
type SortColumn = "name" | "corp_type" | "status" | "totalPenalty" | "nextDeadline";
type SortDirection = "asc" | "desc";

const ROWS_PER_PAGE = 25;

const CORP_TYPE_LABELS: Record<string, string> = {
  stock: "Stock",
  non_stock: "Non-Stock",
  opc: "OPC",
};

const STATUS_BADGE_CLASSES: Record<ComplianceStatus, string> = {
  active: "bg-green-100 text-green-800",
  delinquent: "bg-amber-100 text-amber-800",
  suspended: "bg-crimson/10 text-crimson",
  revoked: "bg-crimson/20 text-crimson",
};

function isWithin60Days(dateStr: string): boolean {
  const deadline = new Date(dateStr);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 60;
}

function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

export function CorporationTable({ corporations, onImportCSV }: CorporationTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const result: Record<FilterValue, number> = {
      all: corporations.length,
      active: 0,
      delinquent: 0,
      suspended: 0,
      revoked: 0,
    };
    for (const corp of corporations) {
      result[corp.status] = (result[corp.status] ?? 0) + 1;
    }
    return result;
  }, [corporations]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return corporations;
    return corporations.filter((c) => c.status === activeFilter);
  }, [corporations, activeFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: string | number | null;
      let bVal: string | number | null;

      switch (sortColumn) {
        case "name":
          aVal = a.name ?? "Unnamed Corporation";
          bVal = b.name ?? "Unnamed Corporation";
          break;
        case "corp_type":
          aVal = CORP_TYPE_LABELS[a.corp_type] ?? a.corp_type;
          bVal = CORP_TYPE_LABELS[b.corp_type] ?? b.corp_type;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "totalPenalty":
          aVal = a.totalPenalty;
          bVal = b.totalPenalty;
          break;
        case "nextDeadline":
          aVal = a.nextDeadline ?? "";
          bVal = b.nextDeadline ?? "";
          break;
      }

      if (aVal === null) aVal = "";
      if (bVal === null) bVal = "";

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const paginated = sorted.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  function handleSort(col: SortColumn) {
    if (sortColumn === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
    setPage(1);
  }

  function handleFilterChange(value: FilterValue) {
    setActiveFilter(value);
    setPage(1);
  }

  function SortIndicator({ col }: { col: SortColumn }) {
    if (sortColumn !== col) return <span className="ml-1 text-gray-muted">↕</span>;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  }

  if (corporations.length === 0) {
    return (
      <div className="rounded-xl border border-divider bg-white overflow-hidden">
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <p className="font-display text-xl font-bold text-charcoal mb-2">
            No corporations yet
          </p>
          <p className="font-body text-sm text-gray-secondary mb-6">
            Add your first corporation to get started.
          </p>
          <Link
            href="/wizard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sec-blue text-white font-body text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Corporation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <StatusFilterTabs
          active={activeFilter}
          counts={counts}
          onChange={handleFilterChange}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={onImportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-divider bg-white font-body text-sm text-gray-secondary hover:text-charcoal transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <Link
            href="/wizard"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-sec-blue text-white font-body text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Corporation
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-divider bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-divider">
              {(
                [
                  { col: "name" as SortColumn, label: "Corporation" },
                  { col: "corp_type" as SortColumn, label: "Type" },
                  { col: "status" as SortColumn, label: "Status" },
                  { col: "totalPenalty" as SortColumn, label: "Penalties" },
                  { col: "nextDeadline" as SortColumn, label: "Next Deadline" },
                ] as { col: SortColumn; label: string }[]
              ).map(({ col, label }) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-muted font-semibold cursor-pointer select-none hover:text-charcoal transition-colors"
                >
                  {label}
                  <SortIndicator col={col} />
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-muted font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((corp) => {
              const displayName = corp.name ?? "Unnamed Corporation";
              const corpTypeLabel = CORP_TYPE_LABELS[corp.corp_type] ?? corp.corp_type;
              const deadlineStr = formatDeadline(corp.nextDeadline);
              const deadlineSoon = corp.nextDeadline ? isWithin60Days(corp.nextDeadline) : false;

              return (
                <tr
                  key={corp.id}
                  onClick={() => {
                    window.location.href = `/dashboard/${corp.id}`;
                  }}
                  className="border-b border-divider last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {/* Corporation */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body font-bold text-charcoal">{displayName}</span>
                      {!corp.hasFilingHistory && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Filing history needed
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className="font-body text-sm text-gray-secondary">{corpTypeLabel}</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                        STATUS_BADGE_CLASSES[corp.status]
                      )}
                    >
                      {corp.status}
                    </span>
                  </td>

                  {/* Penalties */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "font-body text-sm font-semibold",
                        corp.totalPenalty > 0 ? "text-crimson" : "text-green-700"
                      )}
                    >
                      {formatCurrency(corp.totalPenalty)}
                    </span>
                  </td>

                  {/* Next Deadline */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "font-body text-sm",
                        deadlineStr === "—"
                          ? "text-gray-secondary"
                          : deadlineSoon
                          ? "text-amber-600 font-medium"
                          : "text-gray-secondary"
                      )}
                    >
                      {deadlineStr}
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/dashboard/${corp.id}`}
                      className="font-body text-sm font-medium text-sec-blue hover:opacity-75 transition-opacity"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-divider">
            <p className="font-body text-xs text-gray-muted">
              Showing {(page - 1) * ROWS_PER_PAGE + 1}–
              {Math.min(page * ROWS_PER_PAGE, sorted.length)} of {sorted.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 rounded-lg border border-divider font-body text-sm text-gray-secondary disabled:opacity-40 hover:text-charcoal transition-colors"
              >
                ←
              </button>
              <span className="font-body text-sm text-gray-secondary px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 rounded-lg border border-divider font-body text-sm text-gray-secondary disabled:opacity-40 hover:text-charcoal transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
