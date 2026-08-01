/**
 * BIR Form 1801 — CSV export.
 *
 * THIS MODULE WRITES CSV AND NEVER PARSES IT. No CSV parsing library is added
 * and no parser is written here: the classic quoted-comma corruption is a
 * *parser* hazard, and a writer that owns its escaping rule has no need of one.
 *
 * The escaping rule, stated once and implemented once in `escapeCsvField`:
 * a field is wrapped in double quotes when and only when it contains a comma, a
 * double quote, a carriage return or a line feed; an embedded double quote is
 * written as two double quotes; the record separator is CRLF; the file begins
 * with a header row. That rule matters on the first real estate a lawyer files,
 * because a property location such as `Lot 4, Block 12, Quezon City` contains a
 * comma.
 *
 * Every row, label, item number and authority is read from `buildForm1801Lines`.
 * This module constructs no line and authors no section string, so the CSV
 * cannot disagree with the screen or the PDF about which rows exist.
 *
 * The numeric columns are RAW INTEGER CENTAVOS, deliberately. A file carrying
 * only `5,000,000.00` forces its reader to re-parse a locale-formatted string,
 * and a locale-formatted string is where centavos go to die.
 */

import type { EstateTaxFullOutput } from './estate-tax-engine';
import { buildForm1801Lines } from './estate-tax-engine';
import { slugifyName } from './pdf-export';

/** The record separator. RFC 4180 says CRLF, and spreadsheets agree. */
const CRLF = '\r\n';

/** The six columns, in order. */
const HEADER = [
  'Item',
  'Description',
  'Exclusive (centavos)',
  'Conjugal (centavos)',
  'Total (centavos)',
  'Authority',
];

/**
 * Wrap a field in double quotes when it needs them, doubling any embedded
 * quote. Returns the value unchanged when it needs no quoting.
 */
export function escapeCsvField(value: string): string {
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Defuse a spreadsheet formula cell.
 *
 * A cell whose first character is `=`, `+`, `-` or `@` is EXECUTED as a formula
 * by Excel and by Google Sheets when the file is opened. Prefixing a single
 * apostrophe makes the cell literal text.
 */
export function neutraliseFormula(value: string): string {
  if (value.length > 0 && ['=', '+', '-', '@'].includes(value.charAt(0))) {
    return `'${value}`;
  }
  return value;
}

/** A text cell: defused, then escaped. */
function textCell(value: string): string {
  return escapeCsvField(neutraliseFormula(value));
}

/** A numeric cell: a bare integer, or empty when the value is absent. */
function centavoCell(value: number | null): string {
  return value === null ? '' : String(value);
}

function row(cells: string[]): string {
  return cells.join(',');
}

/**
 * Build the whole CSV document for a computed return.
 *
 * `decedentName` is passed in rather than read from the output because the
 * engine output does not carry it.
 */
export function buildForm1801Csv(output: EstateTaxFullOutput, decedentName: string): string {
  const { lines, warnings } = buildForm1801Lines(output);
  const records: string[] = [];

  // Provenance block. It exists so that a cell copied out of this file cannot
  // be mistaken for pesos.
  records.push(row([textCell('Decedent'), textCell(decedentName)]));
  records.push(row([textCell('Document'), textCell('BIR Form 1801 — Estate Tax Return')]));
  records.push(row([textCell('Amounts'), textCell('All numeric columns are integer centavos.')]));
  records.push('');

  records.push(row(HEADER.map(textCell)));

  for (const line of lines) {
    // A declined line writes its WORDS in the total cell, never a zero: a zero
    // is a claim that nothing is owed.
    const total = line.total === null ? textCell(line.displayTotal ?? '') : centavoCell(line.total);
    records.push(
      row([
        textCell(line.item),
        textCell(line.label),
        centavoCell(line.exclusive),
        centavoCell(line.conjugal),
        total,
        textCell(line.authority),
      ]),
    );
  }

  if (warnings.length > 0) {
    records.push('');
    for (const warning of warnings) {
      records.push(row([textCell('MANUAL REVIEW'), textCell(warning)]));
    }
  }

  return records.join(CRLF) + CRLF;
}

/**
 * Build the download filename.
 *
 * `date` is REQUIRED and has no default. A wall-clock read inside an export is
 * exactly what makes an artifact non-reproducible, so the caller supplies the
 * date from the shared fact set.
 */
export function buildForm1801CsvFilename(decedentName: string, date: string): string {
  return `form1801-${slugifyName(decedentName)}-${date}.csv`;
}

/** Build the CSV and hand it to the browser as a download. */
export async function downloadForm1801Csv(
  output: EstateTaxFullOutput,
  decedentName: string,
  date: string,
): Promise<void> {
  const csv = buildForm1801Csv(output, decedentName);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = buildForm1801CsvFilename(decedentName, date);
  a.click();
  URL.revokeObjectURL(url);
}
