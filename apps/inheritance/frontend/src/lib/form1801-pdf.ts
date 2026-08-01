/**
 * BIR Form 1801 — PDF export.
 *
 * Mirrors `lib/pdf-export.ts` for the estate-tax return: lazy-load
 * `@react-pdf/renderer`, build the document, hand the blob to the browser.
 *
 * `slugifyName` is imported from `lib/pdf-export.ts` rather than copied. The
 * `date` and `generatedOn` parameters are REQUIRED and have no default: a
 * wall-clock read inside an export is what makes an artifact non-reproducible.
 */

import type { EstateTaxFullOutput } from './estate-tax-engine';
import { slugifyName } from './pdf-export';

/** Build the download filename. */
export function buildForm1801PdfFilename(decedentName: string, date: string): string {
  return `form1801-${slugifyName(decedentName)}-${date}.pdf`;
}

/** Render the return to a PDF blob. */
export async function generateForm1801Pdf(
  output: EstateTaxFullOutput,
  decedentName: string,
  dateOfDeath: string,
  generatedOn: string,
): Promise<Blob> {
  const [{ pdf }, { Form1801PDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../components/pdf/Form1801PDF'),
  ]);

  const doc = Form1801PDF({ output, decedentName, dateOfDeath, generatedOn });
  return await pdf(doc).toBlob();
}

/** Generate the return and trigger a browser download. */
export async function downloadForm1801Pdf(
  output: EstateTaxFullOutput,
  decedentName: string,
  dateOfDeath: string,
  generatedOn: string,
): Promise<void> {
  const blob = await generateForm1801Pdf(output, decedentName, dateOfDeath, generatedOn);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = buildForm1801PdfFilename(decedentName, dateOfDeath);
  a.click();
  URL.revokeObjectURL(url);
}
