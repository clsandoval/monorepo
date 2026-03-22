"use client";

import { useState } from "react";

interface Document {
  id: number;
  name: string;
  description: string;
}

const REQUIRED_DOCUMENTS: Document[] = [
  {
    id: 1,
    name: "SEC Certificate of Registration",
    description: "Original or certified copy issued by the SEC.",
  },
  {
    id: 2,
    name: "Articles of Incorporation / By-Laws",
    description: "Amended versions if any amendments were made after initial registration.",
  },
  {
    id: 3,
    name: "General Information Sheet (GIS) — backlog filings",
    description: "GIS for every year you failed to file. Covers all officers, directors, and stockholders.",
  },
  {
    id: 4,
    name: "Audited Financial Statements (AFS) — backlog filings",
    description: "AFS for every year you failed to file, duly stamped received by BIR.",
  },
  {
    id: 5,
    name: "Beneficial Ownership Report — backlog filings (2019+)",
    description: "Required for all years from 2019 onward where a BO report was not filed.",
  },
  {
    id: 6,
    name: "MC 28 Compliance Documentation",
    description: "Proof of compliance with SEC Memorandum Circular No. 28 (anti-dummy / beneficial ownership).",
  },
  {
    id: 7,
    name: "Board Resolution Authorizing Petition",
    description: "Board resolution authorizing the filing of the petition for revival or lifting of suspension.",
  },
  {
    id: 8,
    name: "Secretary's Certificate",
    description: "Certificate attesting to the authenticity of the board resolution.",
  },
  {
    id: 9,
    name: "Proof of Payment of Penalties",
    description: "Official receipts from the SEC cashier showing full payment of all accumulated penalties.",
  },
  {
    id: 10,
    name: "Petition for Revival / Lifting of Suspension (Notarized)",
    description: "Formal petition addressed to the SEC, notarized before submission.",
  },
];

export function DocumentChecklist() {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const completedCount = checked.size;
  const totalCount = REQUIRED_DOCUMENTS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold text-charcoal">
          Required Documents
        </h2>
        <p className="font-body text-sm text-gray-secondary mt-1">
          Check off each document as you gather it. Progress is saved locally in your browser.
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-gray-secondary">
            {completedCount} of {totalCount} documents gathered
          </span>
          <span className="font-body text-xs font-semibold text-sec-blue">
            {progressPercent}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-sec-blue transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="overflow-hidden rounded-lg border border-divider">
        {REQUIRED_DOCUMENTS.map((doc, index) => {
          const isChecked = checked.has(doc.id);
          return (
            <label
              key={doc.id}
              className={`flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 ${
                index > 0 ? "border-t border-divider" : ""
              } ${isChecked ? "bg-green-50/50" : "bg-white"}`}
            >
              <div className="mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(doc.id)}
                  className="h-4 w-4 rounded border-gray-300 accent-sec-blue"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`font-body text-sm font-medium leading-snug ${
                    isChecked ? "text-gray-secondary line-through" : "text-charcoal"
                  }`}
                >
                  <span className="mr-1.5 text-gray-muted">#{doc.id}</span>
                  {doc.name}
                </p>
                <p className="font-body text-xs text-gray-secondary mt-0.5 leading-relaxed">
                  {doc.description}
                </p>
              </div>
              {isChecked && (
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-4 w-4 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
