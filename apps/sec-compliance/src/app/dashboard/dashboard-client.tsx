"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CorporationTable, type CorpRow } from "@/components/pro/corporation-table";
import { CSVImportModal } from "@/components/pro/csv-import-modal";

interface DashboardClientProps {
  corporations: CorpRow[];
  corpLimit: number;
  currentCorpCount: number;
}

export function DashboardClient({ corporations, corpLimit, currentCorpCount }: DashboardClientProps) {
  const [showImport, setShowImport] = useState(false);
  const router = useRouter();

  function handleImportSuccess() {
    setShowImport(false);
    router.refresh();
  }

  return (
    <>
      <CorporationTable
        corporations={corporations}
        onImportCSV={() => setShowImport(true)}
      />
      {showImport && (
        <CSVImportModal
          open={showImport}
          onClose={() => setShowImport(false)}
          onSuccess={handleImportSuccess}
          corpLimit={corpLimit}
          currentCorpCount={currentCorpCount}
        />
      )}
    </>
  );
}
