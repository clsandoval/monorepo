"use client";

import { useState } from "react";
import { FilingsStep, type FilingRecord } from "@/components/wizard/filings-step";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilingEditModalProps {
  open: boolean;
  corpId: string;
  incorporationYear: number;
  existingFilings: Array<{ reportType: string; year: number; status: string }>;
  onSave: (filings: Array<{ reportType: string; year: number; status: string }>) => Promise<void>;
  onClose: () => void;
}

export function FilingEditModal({
  open,
  corpId: _corpId,
  incorporationYear,
  existingFilings,
  onSave,
  onClose,
}: FilingEditModalProps) {
  const [filings, setFilings] = useState<FilingRecord[]>(existingFilings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(filings);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setFilings(existingFilings);
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <h2 className="font-display text-xl font-semibold text-charcoal">
            Edit Filing History
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
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 rounded-lg bg-crimson/10 border border-crimson/20 px-4 py-3 text-sm text-crimson font-body">
              {error}
            </div>
          )}
          <FilingsStep
            incorporationYear={incorporationYear}
            filedReports={filings}
            onChange={setFilings}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-divider flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="font-body text-sm text-gray-secondary hover:text-charcoal transition-colors"
          >
            Cancel
          </button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Saving…
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
