export interface CSVRow {
  corporation_name: string;
  corp_type: "stock" | "non_stock" | "opc";
  incorporation_date: string; // YYYY-MM-DD
  re_bracket: string;
  sec_registration_number: string | null;
}

export interface CSVError {
  row: number;
  message: string;
}

export interface CSVValidationResult {
  validRows: CSVRow[];
  errors: CSVError[];
}

const VALID_CORP_TYPES = ["stock", "non_stock", "opc"];
const VALID_RE_BRACKETS = [
  "capital_deficiency", "negative", "0_100k",
  "100k_500k", "500k_5m", "5m_10m", "above_10m",
];

export function parseAndValidateCSV(csvText: string): CSVValidationResult {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return { validRows: [], errors: [{ row: 0, message: "CSV must have a header row and at least one data row" }] };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const validRows: CSVRow[] = [];
  const errors: CSVError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, j) => { row[h] = values[j] ?? ""; });

    const rowNum = i + 1;

    if (!row.corporation_name) {
      errors.push({ row: rowNum, message: "Missing required field: corporation_name" });
      continue;
    }

    const corpType = row.corp_type?.toLowerCase();
    if (!corpType || !VALID_CORP_TYPES.includes(corpType)) {
      errors.push({ row: rowNum, message: `Invalid corp_type "${row.corp_type}". Expected: stock, non_stock, or opc` });
      continue;
    }

    if (!row.incorporation_date) {
      errors.push({ row: rowNum, message: "Missing required field: incorporation_date" });
      continue;
    }

    let incDate = row.incorporation_date;
    if (/^\d{4}$/.test(incDate)) {
      incDate = `${incDate}-01-01`;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(incDate)) {
      errors.push({ row: rowNum, message: `Invalid incorporation_date "${row.incorporation_date}". Expected YYYY-MM-DD or YYYY` });
      continue;
    }

    let reBracket = row.re_bracket?.toLowerCase() || "0_100k";
    if (row.re_bracket && !VALID_RE_BRACKETS.includes(reBracket)) {
      errors.push({ row: rowNum, message: `Invalid re_bracket "${row.re_bracket}"` });
      continue;
    }

    validRows.push({
      corporation_name: row.corporation_name,
      corp_type: corpType as CSVRow["corp_type"],
      incorporation_date: incDate,
      re_bracket: reBracket,
      sec_registration_number: row.sec_registration_number || null,
    });
  }

  return { validRows, errors };
}

export function generateCSVTemplate(): string {
  return "corporation_name,corp_type,incorporation_date,re_bracket,sec_registration_number\n";
}
