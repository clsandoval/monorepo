"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, FileText, Loader2 } from "lucide-react";
import { FilingEditModal } from "@/components/pro/filing-edit-modal";

interface DetailActionsProps {
  corpId: string;
  incorporationYear: number;
  existingFilings: Array<{ reportType: string; year: number; status: string }>;
}

export function DetailActions({ corpId, incorporationYear, existingFilings }: DetailActionsProps) {
  const router = useRouter();
  const [showFilingEdit, setShowFilingEdit] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function handleGenerateReport() {
    setGenerating(true);
    try {
      const res = await fetch("/api/pro/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ corporationId: corpId }),
      });
      const data = await res.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveFilings(filings: Array<{ reportType: string; year: number; status: string }>) {
    // Delete existing and re-insert
    await fetch(`/api/pro/corporations/${corpId}/filings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filings }),
    });
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="default"
          className="gap-1.5 font-body text-sm"
          onClick={() => setShowFilingEdit(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Filing History
        </Button>
        <Button
          variant="default"
          size="default"
          className="gap-1.5 font-body text-sm bg-sec-blue hover:bg-sec-blue/90"
          onClick={handleGenerateReport}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileText className="h-3.5 w-3.5" />
          )}
          {generating ? "Generating..." : "Generate Report"}
        </Button>
      </div>

      <FilingEditModal
        open={showFilingEdit}
        corpId={corpId}
        incorporationYear={incorporationYear}
        existingFilings={existingFilings}
        onSave={handleSaveFilings}
        onClose={() => setShowFilingEdit(false)}
      />
    </>
  );
}
