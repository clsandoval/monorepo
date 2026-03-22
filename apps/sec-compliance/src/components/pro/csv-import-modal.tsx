"use client";

import { useState, useRef } from "react";
import {
  parseAndValidateCSV,
  generateCSVTemplate,
  type CSVValidationResult,
  type CSVRow,
} from "@/lib/pro/csv";
import { Button } from "@/components/ui/button";
import { X, Upload, Download, CheckCircle, AlertCircle } from "lucide-react";

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  corpLimit: number;
  currentCorpCount: number;
}

type ModalState = "idle" | "preview" | "importing" | "done";

export function CSVImportModal({
  open,
  onClose,
  onSuccess,
  corpLimit,
  currentCorpCount,
}: CSVImportModalProps) {
  const [state, setState] = useState<ModalState>("idle");
  const [validation, setValidation] = useState<CSVValidationResult | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const slotsRemaining = corpLimit - currentCorpCount;

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseAndValidateCSV(text);
      setValidation(result);
      setState("preview");
    };
    reader.readAsText(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDownloadTemplate() {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "corporations-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    if (!validation || validation.validRows.length === 0) return;

    setState("importing");
    setImportError(null);

    try {
      const res = await fetch("/api/pro/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validation.validRows }),
      });

      const data = await res.json();

      if (!res.ok) {
        setImportError(data.error ?? "Import failed");
        setState("preview");
        return;
      }

      setImportedCount(data.imported);
      setState("done");
      onSuccess();
    } catch {
      setImportError("Unexpected error. Please try again.");
      setState("preview");
    }
  }

  function handleClose() {
    setState("idle");
    setValidation(null);
    setImportError(null);
    setImportedCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  }

  const validCount = validation?.validRows.length ?? 0;
  const errorCount = validation?.errors.length ?? 0;
  const wouldExceedLimit = validCount > slotsRemaining;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <h2 className="font-display text-xl font-semibold text-charcoal">
            Import Corporations
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-secondary hover:text-charcoal transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Idle state */}
          {state === "idle" && (
            <div className="p-6 space-y-4">
              <p className="font-body text-sm text-gray-secondary">
                Upload a CSV file to bulk-import corporations. You have{" "}
                <span className="font-medium text-charcoal">{slotsRemaining}</span>{" "}
                slot{slotsRemaining !== 1 ? "s" : ""} remaining.
              </p>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
                  ${isDragging
                    ? "border-sec-blue bg-sec-blue/5"
                    : "border-divider hover:border-sec-blue hover:bg-gray-50"
                  }
                `}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-secondary mb-3" />
                <p className="font-body text-sm font-medium text-charcoal">
                  Drop a CSV file here or click to browse
                </p>
                <p className="font-body text-xs text-gray-secondary mt-1">
                  .csv files only
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 text-sm text-sec-blue hover:underline font-body"
              >
                <Download className="h-4 w-4" />
                Download CSV template
              </button>
            </div>
          )}

          {/* Preview state */}
          {(state === "preview" || state === "importing") && validation && (
            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-4 text-sm font-body">
                <span className="flex items-center gap-1.5 text-charcoal">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{validCount} valid row{validCount !== 1 ? "s" : ""}</span>
                </span>
                {errorCount > 0 && (
                  <span className="flex items-center gap-1.5 text-crimson">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errorCount} error{errorCount !== 1 ? "s" : ""}</span>
                  </span>
                )}
              </div>

              {wouldExceedLimit && (
                <div className="rounded-lg bg-crimson/10 border border-crimson/20 px-4 py-3 text-sm text-crimson font-body">
                  This import would add {validCount} corporations but you only have{" "}
                  {slotsRemaining} slot{slotsRemaining !== 1 ? "s" : ""} remaining.
                  Upgrade your plan or reduce the number of rows.
                </div>
              )}

              {importError && (
                <div className="rounded-lg bg-crimson/10 border border-crimson/20 px-4 py-3 text-sm text-crimson font-body">
                  {importError}
                </div>
              )}

              {/* Preview table */}
              <div className="overflow-x-auto rounded-lg border border-divider">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="bg-gray-50 border-b border-divider">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-secondary">#</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-secondary">Corporation Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-secondary">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-secondary">Inc. Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-secondary">RE Bracket</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-secondary">SEC Reg #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validation.validRows.map((row: CSVRow, i) => (
                      <tr key={i} className="border-b border-divider last:border-0">
                        <td className="px-3 py-2 text-gray-secondary">{i + 1}</td>
                        <td className="px-3 py-2 text-charcoal font-medium">{row.corporation_name}</td>
                        <td className="px-3 py-2 text-charcoal">{row.corp_type}</td>
                        <td className="px-3 py-2 text-charcoal">{row.incorporation_date}</td>
                        <td className="px-3 py-2 text-charcoal">{row.re_bracket}</td>
                        <td className="px-3 py-2 text-gray-secondary">{row.sec_registration_number ?? "—"}</td>
                      </tr>
                    ))}
                    {validation.errors.map((err, i) => (
                      <tr key={`err-${i}`} className="border-b border-divider last:border-0 bg-crimson/5">
                        <td className="px-3 py-2 text-crimson">{err.row}</td>
                        <td colSpan={5} className="px-3 py-2 text-crimson text-xs">
                          <AlertCircle className="inline h-3.5 w-3.5 mr-1" />
                          {err.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Done state */}
          {state === "done" && (
            <div className="p-6 flex flex-col items-center justify-center gap-4 py-12">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div className="text-center">
                <p className="font-display text-xl font-semibold text-charcoal">
                  Import complete
                </p>
                <p className="font-body text-sm text-gray-secondary mt-1">
                  {importedCount} corporation{importedCount !== 1 ? "s" : ""} imported successfully.
                </p>
              </div>
              <Button onClick={handleClose}>Close</Button>
            </div>
          )}
        </div>

        {/* Footer for preview state */}
        {(state === "preview" || state === "importing") && (
          <div className="px-6 py-4 border-t border-divider flex items-center justify-between gap-3">
            <button
              onClick={handleClose}
              className="font-body text-sm text-gray-secondary hover:text-charcoal transition-colors"
            >
              Cancel
            </button>
            <Button
              onClick={handleImport}
              disabled={
                state === "importing" ||
                validCount === 0 ||
                wouldExceedLimit
              }
            >
              {state === "importing" ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Importing…
                </span>
              ) : (
                `Import ${validCount} valid row${validCount !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
