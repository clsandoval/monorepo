"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { MacedaReport } from "./pdf-report";
import type { MacedaResult } from "@/lib/engine/types";
import type { InputSummary } from "./pdf-report";

interface ExportButtonProps {
  result: MacedaResult;
  inputSummary: InputSummary;
}

export function ExportButton({ result, inputSummary }: ExportButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    setGenerating(true);
    try {
      const blob = await pdf(
        <MacedaReport result={result} inputSummary={inputSummary} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `maceda-report-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={generating}
      className="mt-4 w-full rounded-xl border border-accent bg-transparent py-3.5 font-body text-[14px] font-semibold text-accent transition-all hover:bg-accent-soft disabled:opacity-50"
    >
      {generating ? "Generating PDF..." : "Download Report"}
    </button>
  );
}
