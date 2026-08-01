/**
 * Form1801PDF — the printable BIR Form 1801 estate tax return.
 *
 * This document BUILDS NO LINE. Every row, item number, label and authority
 * comes from `buildForm1801Lines`, the same array the screen and the CSV
 * render, so the three surfaces cannot disagree about which rows exist.
 *
 * Every peso amount goes through `formatPesoPdf`, and every string of engine
 * prose through `toPdfSafeText`. The document's fonts are PDF base-14 and
 * WinAnsi-encoded: U+20B1 is written as the single byte 0xB1, which extracts as
 * a plus-minus sign at near-zero advance width and OVERPRINTS the first digit of
 * the amount beside it. See `pdf-text.ts` for the measurement.
 *
 * No clock is read. Every date on the document is a parameter, so two runs over
 * the same fact set produce the same bytes.
 *
 * The firm letterhead and the attorney attribution block are deliberately
 * ABSENT: no PDF a user can obtain carries a header today, and adding one here
 * would assert something the product does not render.
 */

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { EstateTaxFullOutput } from '../../lib/estate-tax-engine';
import { buildForm1801Lines } from '../../lib/estate-tax-engine';
import { formatPesoPdf, toPdfSafeText } from './pdf-text';
import { DisclaimerSection } from './DisclaimerSection';

export interface Form1801PDFProps {
  output: EstateTaxFullOutput;
  decedentName: string;
  dateOfDeath: string;
  generatedOn: string;
}

/** Printed where a line carries no amount at all. */
const NO_AMOUNT = '—';

const styles = StyleSheet.create({
  page: {
    paddingTop: '30mm',
    paddingBottom: '25mm',
    paddingLeft: '38mm',
    paddingRight: '25mm',
    fontFamily: 'Times-Roman',
    fontSize: 10,
  },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 10 },
  section: { marginBottom: 12 },
  heading: { fontSize: 11, fontFamily: 'Times-Bold', marginBottom: 4 },
  provenanceLine: { fontSize: 10, marginBottom: 2 },
  row: { flexDirection: 'row', marginTop: 4 },
  summaryRow: { flexDirection: 'row', marginTop: 4, fontFamily: 'Times-Bold' },
  colItem: { width: '10%', fontSize: 9 },
  colDescription: { width: '38%', fontSize: 9 },
  colAmount: { width: '17%', fontSize: 9, textAlign: 'right' },
  authorityLine: { fontSize: 7, marginLeft: '10%', marginBottom: 2 },
  warning: { fontSize: 9, marginBottom: 3 },
  refusal: { fontSize: 9, marginTop: 6 },
});

/** One amount cell: a figure, or an em dash when there is nothing to print. */
function amountText(value: number | null): string {
  return value === null ? NO_AMOUNT : formatPesoPdf(value);
}

export function Form1801PDF({ output, decedentName, dateOfDeath, generatedOn }: Form1801PDFProps) {
  const { lines, warnings } = buildForm1801Lines(output);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>BIR FORM 1801 — ESTATE TAX RETURN</Text>

        <View style={styles.section}>
          <Text style={styles.provenanceLine}>Decedent: {toPdfSafeText(decedentName)}</Text>
          <Text style={styles.provenanceLine}>Date of Death: {dateOfDeath}</Text>
          <Text style={styles.provenanceLine}>Generated: {generatedOn}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colAmount}>Exclusive</Text>
            <Text style={styles.colAmount}>Conjugal</Text>
            <Text style={styles.colAmount}>Total</Text>
          </View>
          {lines.map((line) => (
            <View key={line.id}>
              <View style={line.isSummary ? styles.summaryRow : styles.row}>
                <Text style={styles.colItem}>{line.item}</Text>
                <Text style={styles.colDescription}>{toPdfSafeText(line.label)}</Text>
                <Text style={styles.colAmount}>{amountText(line.exclusive)}</Text>
                <Text style={styles.colAmount}>{amountText(line.conjugal)}</Text>
                <Text style={styles.colAmount}>
                  {line.displayTotal !== null ? toPdfSafeText(line.displayTotal) : amountText(line.total)}
                </Text>
              </View>
              {/*
                The authority prints on its own line rather than in a sixth
                column: a sixth column does not fit the A4 width this report
                already uses, and a truncated authority is worse than a wrapped
                one.
              */}
              <Text style={styles.authorityLine}>Authority: {toPdfSafeText(line.authority)}</Text>
            </View>
          ))}
        </View>

        {warnings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>MANUAL REVIEW</Text>
            {warnings.map((warning) => (
              <Text key={warning} style={styles.warning}>
                {toPdfSafeText(warning)}
              </Text>
            ))}
          </View>
        )}

        {!output.penalties.complete && (
          <Text style={styles.refusal}>{toPdfSafeText(output.penalties.refusal)}</Text>
        )}

        <DisclaimerSection />
      </Page>
    </Document>
  );
}
