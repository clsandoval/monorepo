import type { ReportType } from "@/engine/types";

export interface ExpectedFiling {
  reportType: ReportType;
  year: number;
  deadline: string;
}

interface TimelineInput {
  incorporationYear: number;
  currentYear: number;
}

const BO_START_YEAR = 2019;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function deadline(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function generateExpectedFilings({
  incorporationYear,
  currentYear,
}: TimelineInput): ExpectedFiling[] {
  const filings: ExpectedFiling[] = [];

  for (let year = incorporationYear; year <= currentYear; year++) {
    filings.push({
      reportType: "GIS",
      year,
      deadline: deadline(year, 5, 31),
    });

    filings.push({
      reportType: "AFS",
      year,
      deadline: deadline(year, 4, 30),
    });
  }

  const boStartYear = Math.max(incorporationYear, BO_START_YEAR);
  for (let year = boStartYear; year <= currentYear; year++) {
    filings.push({
      reportType: "BO",
      year,
      deadline: deadline(year, 5, 31),
    });
  }

  return filings;
}
