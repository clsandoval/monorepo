/**
 * Demand Letter PDF Template
 *
 * Standard Philippine formal demand letter format with embedded computation
 * summary and Nacar citation.
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ComputationResult } from '@/lib/engine/types';
import { formatPeso } from '@/lib/engine/format';
import { CITATIONS } from '@/lib/engine/constants';
import { sharedStyles, PDF_COLORS, DISCLAIMER_TEXT } from './shared-styles';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  addressBlock: {
    marginBottom: 8,
  },
  addressLine: {
    fontSize: 9,
    color: PDF_COLORS.primary,
    lineHeight: 1.5,
  },
  addressLabelLine: {
    fontSize: 8,
    color: PDF_COLORS.secondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  salutation: {
    fontSize: 9,
    color: PDF_COLORS.primary,
    marginTop: 14,
    marginBottom: 10,
  },
  body: {
    fontSize: 9,
    color: PDF_COLORS.primary,
    lineHeight: 1.6,
    marginBottom: 8,
    textAlign: 'justify',
  },
  inlineAmount: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 9,
  },
  summaryBox: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderWidth: 0.5,
    borderColor: PDF_COLORS.border,
    backgroundColor: PDF_COLORS.background,
  },
  summaryTitle: {
    fontFamily: 'Newsreader',
    fontSize: 10,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    marginBottom: 7,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    borderBottomWidth: 0.3,
    borderBottomColor: PDF_COLORS.border,
    paddingBottom: 3,
  },
  summaryLabel: {
    fontSize: 8.5,
    color: PDF_COLORS.secondary,
  },
  summaryValue: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 8,
    color: PDF_COLORS.primary,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.primary,
  },
  summaryTotalLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: PDF_COLORS.primary,
  },
  summaryTotalValue: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 9,
    fontWeight: 600,
    color: PDF_COLORS.primary,
  },
  sigBlock: {
    marginTop: 28,
  },
  sigLabel: {
    fontSize: 9,
    color: PDF_COLORS.primary,
    marginBottom: 30,
  },
  sigLine: {
    borderTopWidth: 0.5,
    borderTopColor: PDF_COLORS.primary,
    width: 200,
    marginBottom: 3,
  },
  sigName: {
    fontSize: 9,
    fontWeight: 700,
    color: PDF_COLORS.primary,
  },
  sigTitle: {
    fontSize: 8.5,
    color: PDF_COLORS.secondary,
  },
  warningBox: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fff8f0',
    borderLeftWidth: 3,
    borderLeftColor: '#c0703a',
  },
  warningText: {
    fontSize: 8.5,
    color: '#7a4020',
    lineHeight: 1.5,
  },
  dateRef: {
    fontSize: 9,
    color: PDF_COLORS.primary,
    marginBottom: 14,
  },
  subjectLine: {
    fontSize: 9,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    marginBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.border,
    paddingBottom: 6,
  },
  annexTitle: {
    fontFamily: 'Newsreader',
    fontSize: 13,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  annexSubtitle: {
    fontSize: 9,
    color: PDF_COLORS.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  colLabel: { flex: 3 },
  colAmount: { flex: 2, textAlign: 'right' },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function fmtRateBps(bps: number): string {
  return `${bps / 100}%`;
}

function todayLong(): string {
  return new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PdfFooter() {
  return (
    <View style={sharedStyles.footer} fixed>
      <Text style={sharedStyles.footerText}>
        Legal Interest Engine • {DISCLAIMER_TEXT.substring(0, 80)}...
      </Text>
      <Text
        style={sharedStyles.footerPageNumber}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}

function ComputationSummaryBox({ result }: { result: ComputationResult }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryTitle}>Computation Summary</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Principal Amount</Text>
        <Text style={styles.summaryValue}>{formatPeso(result.totalPrincipal)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total Accrued Interest</Text>
        <Text style={styles.summaryValue}>{formatPeso(result.totalInterest)}</Text>
      </View>
      {result.totalAdditionalAwards > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Additional Awards</Text>
          <Text style={styles.summaryValue}>{formatPeso(result.totalAdditionalAwards)}</Text>
        </View>
      )}
      {result.totalAdditionalAwardsInterest > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Interest on Additional Awards</Text>
          <Text style={styles.summaryValue}>{formatPeso(result.totalAdditionalAwardsInterest)}</Text>
        </View>
      )}
      <View style={styles.summaryTotalRow}>
        <Text style={styles.summaryTotalLabel}>TOTAL AMOUNT DUE</Text>
        <Text style={styles.summaryTotalValue}>{formatPeso(result.grandTotal)}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Annex: Worksheet summary page
// ---------------------------------------------------------------------------
function AnnexWorksheet({ result }: { result: ComputationResult }) {
  return (
    <Page size="A4" style={sharedStyles.page}>
      <View style={[sharedStyles.headerSection, { borderBottomWidth: 1 }]}>
        <Text style={styles.annexTitle}>ANNEX A</Text>
        <Text style={styles.annexSubtitle}>Detailed Computation of Legal Interest</Text>
        <Text style={sharedStyles.disclaimerText}>{DISCLAIMER_TEXT}</Text>
      </View>

      {/* Period table */}
      <View style={sharedStyles.section}>
        <Text style={sharedStyles.sectionTitle}>Period-by-Period Computation</Text>
        <View style={sharedStyles.table}>
          <View style={sharedStyles.tableHeader}>
            <Text style={[sharedStyles.tableHeaderCell, { flex: 2.2, paddingRight: 4 }]}>Period</Text>
            <Text style={[sharedStyles.tableHeaderCell, { flex: 1.4, paddingRight: 4 }]}>Start</Text>
            <Text style={[sharedStyles.tableHeaderCell, { flex: 1.4, paddingRight: 4 }]}>End</Text>
            <Text style={[sharedStyles.tableHeaderCell, { flex: 0.7, textAlign: 'right', paddingRight: 4 }]}>Days</Text>
            <Text style={[sharedStyles.tableHeaderCell, { flex: 0.9, textAlign: 'right', paddingRight: 4 }]}>Rate</Text>
            <Text style={[sharedStyles.tableHeaderCell, { flex: 1.8, textAlign: 'right', paddingRight: 4 }]}>Base</Text>
            <Text style={[sharedStyles.tableHeaderCell, { flex: 1.8, textAlign: 'right' }]}>Interest</Text>
          </View>
          {[...(result.periods || []), ...(result.postFinality || [])].map((p, i) => (
            <View key={i} style={i % 2 === 0 ? sharedStyles.tableRow : sharedStyles.tableRowAlt}>
              <Text style={[sharedStyles.tableCell, { flex: 2.2, paddingRight: 4 }]}>{p.label}</Text>
              <Text style={[sharedStyles.tableCell, { flex: 1.4, paddingRight: 4 }]}>{fmtDateShort(p.startDate)}</Text>
              <Text style={[sharedStyles.tableCell, { flex: 1.4, paddingRight: 4 }]}>{fmtDateShort(p.endDate)}</Text>
              <Text style={[sharedStyles.tableCellMono, { flex: 0.7, textAlign: 'right', paddingRight: 4 }]}>{p.days}</Text>
              <Text style={[sharedStyles.tableCellMono, { flex: 0.9, textAlign: 'right', paddingRight: 4 }]}>{fmtRateBps(p.rateBps)}</Text>
              <Text style={[sharedStyles.tableCellMono, { flex: 1.8, textAlign: 'right', paddingRight: 4 }]}>{formatPeso(p.baseAmount)}</Text>
              <Text style={[sharedStyles.tableCellMono, { flex: 1.8, textAlign: 'right' }]}>{formatPeso(p.interest)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Citations */}
      <View style={sharedStyles.citationBlock}>
        <Text style={sharedStyles.citationTitle}>Legal Basis</Text>
        {Array.from(new Set([
          ...result.periods.map((p) => p.legalCitation),
          ...(result.postFinality?.map((p) => p.legalCitation) ?? []),
          CITATIONS.NACAR,
        ])).map((c) => (
          <Text key={c} style={sharedStyles.citationText}>• {c}</Text>
        ))}
      </View>

      <PdfFooter />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------
export interface DemandLetterProps {
  result: ComputationResult;
  creditorName: string;
  creditorAddress: string;
  debtorName: string;
  debtorAddress: string;
  obligationDescription: string;
  deadline: string; // e.g. "fifteen (15) days from receipt"
  caseLabel?: string;
}

export function DemandLetterPdf({
  result,
  creditorName,
  creditorAddress,
  debtorName,
  debtorAddress,
  obligationDescription,
  deadline,
  caseLabel,
}: DemandLetterProps) {
  const totalDue = formatPeso(result.grandTotal);

  return (
    <Document
      title="Formal Demand Letter"
      author="Legal Interest Engine"
      subject={caseLabel ?? 'Demand for Payment'}
    >
      {/* Page 1: Letter body */}
      <Page size="A4" style={sharedStyles.page}>
        {/* Date */}
        <Text style={styles.dateRef}>{todayLong()}</Text>

        {/* Creditor address */}
        <View style={styles.addressBlock}>
          <Text style={styles.addressLabelLine}>Sent by:</Text>
          <Text style={styles.addressLine}>{creditorName}</Text>
          {creditorAddress.split('\n').map((line, i) => (
            <Text key={i} style={styles.addressLine}>{line}</Text>
          ))}
        </View>

        {/* Debtor address */}
        <View style={[styles.addressBlock, { marginTop: 10 }]}>
          <Text style={styles.addressLine}>{debtorName}</Text>
          {debtorAddress.split('\n').map((line, i) => (
            <Text key={i} style={styles.addressLine}>{line}</Text>
          ))}
        </View>

        {/* Subject */}
        <Text style={styles.subjectLine}>
          RE: FORMAL DEMAND FOR PAYMENT OF MONETARY OBLIGATION
          {caseLabel ? ` — ${caseLabel}` : ''}
        </Text>

        {/* Salutation */}
        <Text style={styles.salutation}>Dear {debtorName},</Text>

        {/* Body paragraph 1 */}
        <Text style={styles.body}>
          We write on behalf of our client, {creditorName}, to formally demand the immediate
          payment of the outstanding monetary obligation arising from the following: {obligationDescription}.
        </Text>

        {/* Body paragraph 2: computation summary */}
        <Text style={styles.body}>
          As of {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })},
          the total amount due and owing, including principal and legal interest computed in
          accordance with applicable law, is{' '}
          <Text style={styles.inlineAmount}>{totalDue}</Text>, broken down as follows:
        </Text>

        <ComputationSummaryBox result={result} />

        {/* Body paragraph 3: Nacar citation */}
        <Text style={styles.body}>
          The foregoing interest computation is made pursuant to the ruling of the Honorable
          Supreme Court in <Text style={{ fontStyle: 'italic' }}>Nacar v. Gallery Frames</Text>
          {' '}(G.R. No. 189871, August 13, 2013), as implemented by BSP-MB Circular No. 799,
          Series of 2013. Under this framework, the legal interest rate is six percent (6%) per
          annum from July 1, 2013, and twelve percent (12%) per annum for periods prior thereto.
          All amounts accrue from the date of extrajudicial or judicial demand as established by
          the records of this matter.
        </Text>

        {/* Warning box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            DEMAND IS HEREBY MADE upon you to pay the total amount of{' '}
            <Text style={{ fontFamily: 'IBM Plex Mono', fontSize: 8.5 }}>{totalDue}</Text>
            {' '}within {deadline} from your receipt of this letter. Failure to pay within the
            said period shall constrain us to institute the appropriate legal action before the
            proper courts or tribunals to enforce payment, at your cost and expense.
          </Text>
        </View>

        <Text style={[styles.body, { marginTop: 12 }]}>
          We trust that you will give this matter your immediate and preferential attention to
          avoid the necessity of legal proceedings.
        </Text>

        {/* Signature block */}
        <View style={styles.sigBlock}>
          <Text style={styles.sigLabel}>Very truly yours,</Text>
          <View style={styles.sigLine} />
          <Text style={styles.sigName}>{creditorName}</Text>
          <Text style={styles.sigTitle}>Creditor / Authorized Representative</Text>
        </View>

        {/* Footer */}
        <PdfFooter />
      </Page>

      {/* Page 2: Annex A — Detailed Computation */}
      <AnnexWorksheet result={result} />
    </Document>
  );
}
