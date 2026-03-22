"use client";

import { useState } from "react";
import { CorporationTable, type CorpRow } from "@/components/pro/corporation-table";

interface DashboardClientProps {
  corporations: CorpRow[];
}

export function DashboardClient({ corporations }: DashboardClientProps) {
  const [showImport, setShowImport] = useState(false);

  return (
    <>
      <CorporationTable
        corporations={corporations}
        onImportCSV={() => setShowImport(true)}
      />
      {/* CSV import modal will be wired in Task 21 */}
    </>
  );
}
