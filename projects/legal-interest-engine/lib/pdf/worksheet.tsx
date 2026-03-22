/**
 * Interest Computation Worksheet PDF Template
 *
 * Renders a ComputationResult into a professional legal worksheet suitable
 * for court filings and attorney review.
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ComputationResult } from '@/lib/engine/types';
import { formatPeso } from '@/lib/engine/format';
import { CITATIONS } from '@/lib/engine/constants';
import { sharedStyles, PDF_COLORS, DISCLAIMER_TEXT } from './shared-styles';

// ---------------------------------------------------------------------------
// Worksheet-specific styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // Column widths for period breakdown table
  colPeriod: { flex: 2.2, paddingRight: 4 },
  colStart: { flex: 1.4, paddingRight: 4 },
  colEnd: { flex: 1.4, paddingRight: 4 },
  colDays: { flex: 0.7, textAlign: 'right', paddingRight: 4 },
  colRate: { flex: 0.9, textAlign: 'right', paddingRight: 4 },
  colBase: { flex: 1.8, textAlign: 'right', paddingRight: 4 },
  colInterest: { flex: 1.8, textAlign: 'right' },

  // Column widths for summary table
  colSummaryLabel: { flex: 3 },
  colSummaryAmount: { flex: 2, textAlign: 'right' },

  formula: {
    fontSize: 7.5,
    color: PDF_COLORS.secondary,
    fontStyle: 'italic',
    paddingLeft: 6,
    paddingBottom: 4,
    borderBottomWidth: 0.3,
    borderBottomColor: PDF_COLORS.border,
  },
  formulaMono: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 7,
    color: PDF_COLORS.secondary,
  },
  art2212Box: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f4f0',
    borderWidth: 0.5,
    borderColor: PDF_COLORS.accent,
    borderRadius: 3,
  },
  art2212Title: {
    fontSize: 8.5,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    marginBottom: 5,
  },
  art2212Row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  art2212Label: {
    fontSize: 8.5,
    color: PDF_COLORS.secondary,
  },
  art2212Value: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 8,
    color: PDF_COLORS.primary,
  },
  grandTotalBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: PDF_COLORS.primary,
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: PDF_COLORS.white,
    fontFamily: 'Newsreader',
  },
  grandTotalAmount: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 13,
    fontWeight: 600,
    color: PDF_COLORS.white,
  },
});

// ---------------------------------------------------------------------------
// Helper: format date from ISO string
// ---------------------------------------------------------------------------
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function fmtRateBps(bps: number): string {
  const pct = bps / 100;
  return `${pct}%`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PdfHeader({ result, caseLabel }: { result: ComputationResult; caseLabel?: string }) {
  const now = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <View style={sharedStyles.headerSection}>
      <Text style={sharedStyles.headerTitle}>Interest Computation Worksheet</Text>
      {caseLabel && (
        <Text style={sharedStyles.headerSubtitle}>{caseLabel}</Text>
      )}
      <View style={sharedStyles.headerMeta}>
        <Text style={sharedStyles.headerMetaText}>Computation Date: {now}</Text>
        <Text style={sharedStyles.headerMetaText}>
          Target Date: {fmtDate(result.input.targetDate)}
        </Text>
      </View>
      <View style={{ marginTop: 6 }}>
        <Text style={sharedStyles.disclaimerText}>
          {DISCLAIMER_TEXT}
        </Text>
      </View>
    </View>
  );
}

function SummaryTable({ result }: { result: ComputationResult }) {
  const rows: Array<{ label: string; amount: number; bold?: boolean }> = [
    { label: 'Principal Amount', amount: result.totalPrincipal },
    { label: 'Total Interest (all periods)', amount: result.totalInterest },
  ];

  if (result.totalAdditionalAwards > 0) {
    rows.push({ label: 'Additional Awards', amount: result.totalAdditionalAwards });
  }
  if (result.totalAdditionalAwardsInterest > 0) {
    rows.push({ label: 'Interest on Additional Awards', amount: result.totalAdditionalAwardsInterest });
  }

  return (
    <View style={sharedStyles.section}>
      <Text style={sharedStyles.sectionTitle}>Summary</Text>
      <View style={sharedStyles.table}>
        {/* Header */}
        <View style={sharedStyles.tableHeader}>
          <Text style={[sharedStyles.tableHeaderCell, styles.colSummaryLabel]}>Item</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colSummaryAmount]}>Amount</Text>
        </View>
        {rows.map((row, i) => (
          <View key={row.label} style={i % 2 === 0 ? sharedStyles.tableRow : sharedStyles.tableRowAlt}>
            <Text style={[sharedStyles.tableCell, styles.colSummaryLabel]}>{row.label}</Text>
            <Text style={[sharedStyles.tableCellMono, styles.colSummaryAmount]}>{formatPeso(row.amount)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.grandTotalBox}>
        <Text style={styles.grandTotalLabel}>Grand Total</Text>
        <Text style={styles.grandTotalAmount}>{formatPeso(result.grandTotal)}</Text>
      </View>
    </View>
  );
}

function PeriodBreakdownTable({ result }: { result: ComputationResult }) {
  const allPeriods = [
    ...(result.periods || []),
    ...(result.postFinality || []),
  ];

  if (allPeriods.length === 0) return null;

  return (
    <View style={sharedStyles.section}>
      <Text style={sharedStyles.sectionTitle}>Period Breakdown</Text>
      <View style={sharedStyles.table}>
        {/* Header */}
        <View style={sharedStyles.tableHeader}>
          <Text style={[sharedStyles.tableHeaderCell, styles.colPeriod]}>Period</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colStart]}>Start</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colEnd]}>End</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colDays]}>Days</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colRate]}>Rate</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colBase]}>Base Amount</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colInterest]}>Interest</Text>
        </View>

        {allPeriods.map((period, i) => (
          <React.Fragment key={`period-${i}`}>
            <View style={i % 2 === 0 ? sharedStyles.tableRow : sharedStyles.tableRowAlt}>
              <Text style={[sharedStyles.tableCell, styles.colPeriod]}>{period.label}</Text>
              <Text style={[sharedStyles.tableCell, styles.colStart]}>{fmtDateShort(period.startDate)}</Text>
              <Text style={[sharedStyles.tableCell, styles.colEnd]}>{fmtDateShort(period.endDate)}</Text>
              <Text style={[sharedStyles.tableCellMono, styles.colDays]}>{period.days}</Text>
              <Text style={[sharedStyles.tableCellMono, styles.colRate]}>{fmtRateBps(period.rateBps)}</Text>
              <Text style={[sharedStyles.tableCellMono, styles.colBase]}>{formatPeso(period.baseAmount)}</Text>
              <Text style={[sharedStyles.tableCellMono, styles.colInterest]}>{formatPeso(period.interest)}</Text>
            </View>
            {/* Formula row */}
            <Text style={styles.formula}>
              <Text style={styles.formulaMono}>
                {`${formatPeso(period.baseAmount)} × ${fmtRateBps(period.rateBps)} ÷ 365 × ${period.days} days = ${formatPeso(period.interest)}`}
              </Text>
            </Text>
          </React.Fragment>
        ))}

        {/* Totals row */}
        <View style={sharedStyles.tableRowTotal}>
          <Text style={[sharedStyles.tableCell, { ...styles.colPeriod, fontWeight: 700 }]}>Total Interest</Text>
          <Text style={[sharedStyles.tableCell, styles.colStart]}></Text>
          <Text style={[sharedStyles.tableCell, styles.colEnd]}></Text>
          <Text style={[sharedStyles.tableCellMono, styles.colDays]}></Text>
          <Text style={[sharedStyles.tableCellMono, styles.colRate]}></Text>
          <Text style={[sharedStyles.tableCellMono, styles.colBase]}></Text>
          <Text style={[sharedStyles.tableCellMonoBold, styles.colInterest]}>{formatPeso(result.totalInterest)}</Text>
        </View>
      </View>
    </View>
  );
}

function Art2212Section({ result }: { result: ComputationResult }) {
  if (!result.art2212) return null;
  const a = result.art2212;
  return (
    <View style={sharedStyles.section}>
      <Text style={sharedStyles.sectionTitle}>Civil Code Art. 2212 — Interest on Accrued Interest</Text>
      <View style={styles.art2212Box}>
        <Text style={styles.art2212Title}>
          Interest on Stipulated Interest (Art. 2212)
        </Text>
        <View style={styles.art2212Row}>
          <Text style={styles.art2212Label}>Accrued Stipulated Interest (base)</Text>
          <Text style={styles.art2212Value}>{formatPeso(a.accruedStipulatedInterest)}</Text>
        </View>
        <View style={styles.art2212Row}>
          <Text style={styles.art2212Label}>Period</Text>
          <Text style={styles.art2212Value}>{fmtDateShort(a.startDate)} – {fmtDateShort(a.endDate)} ({a.days} days)</Text>
        </View>
        <View style={styles.art2212Row}>
          <Text style={styles.art2212Label}>Rate</Text>
          <Text style={styles.art2212Value}>{fmtRateBps(a.rateBps)}</Text>
        </View>
        <View style={styles.art2212Row}>
          <Text style={styles.art2212Label}>Art. 2212 Interest</Text>
          <Text style={styles.art2212Value}>{formatPeso(a.interest)}</Text>
        </View>
        <Text style={[sharedStyles.disclaimerText, { marginTop: 5 }]}>
          {a.legalCitation}
        </Text>
      </View>
    </View>
  );
}

function AdditionalAwardsSection({ result }: { result: ComputationResult }) {
  if (!result.additionalAwards || result.additionalAwards.length === 0) return null;
  return (
    <View style={sharedStyles.section}>
      <Text style={sharedStyles.sectionTitle}>Additional Awards</Text>
      <View style={sharedStyles.table}>
        <View style={sharedStyles.tableHeader}>
          <Text style={[sharedStyles.tableHeaderCell, styles.colPeriod]}>Award</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colStart]}>Start</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colEnd]}>End</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colDays]}>Days</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colRate]}>Rate</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colBase]}>Award Amount</Text>
          <Text style={[sharedStyles.tableHeaderCell, styles.colInterest]}>Interest</Text>
        </View>
        {result.additionalAwards.map((award, i) => (
          <View key={`award-${i}`} style={i % 2 === 0 ? sharedStyles.tableRow : sharedStyles.tableRowAlt}>
            <Text style={[sharedStyles.tableCell, styles.colPeriod]}>{award.label}</Text>
            <Text style={[sharedStyles.tableCell, styles.colStart]}>{fmtDateShort(award.startDate)}</Text>
            <Text style={[sharedStyles.tableCell, styles.colEnd]}>{fmtDateShort(award.endDate)}</Text>
            <Text style={[sharedStyles.tableCellMono, styles.colDays]}>{award.days}</Text>
            <Text style={[sharedStyles.tableCellMono, styles.colRate]}>{fmtRateBps(award.rateBps)}</Text>
            <Text style={[sharedStyles.tableCellMono, styles.colBase]}>{formatPeso(award.amount)}</Text>
            <Text style={[sharedStyles.tableCellMono, styles.colInterest]}>{formatPeso(award.interest)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function LegalBasisSection({ result }: { result: ComputationResult }) {
  const citations = new Set<string>();
  result.periods.forEach((p) => citations.add(p.legalCitation));
  result.postFinality?.forEach((p) => citations.add(p.legalCitation));
  if (result.art2212) citations.add(result.art2212.legalCitation);
  // Always include the primary Nacar citation
  citations.add(CITATIONS.NACAR);

  return (
    <View style={[sharedStyles.citationBlock, { marginTop: 20 }]}>
      <Text style={sharedStyles.citationTitle}>Legal Basis</Text>
      {Array.from(citations).map((c) => (
        <Text key={c} style={sharedStyles.citationText}>• {c}</Text>
      ))}
    </View>
  );
}

function PdfFooter() {
  return (
    <View style={sharedStyles.footer} fixed>
      <Text style={sharedStyles.footerText}>
        Generated by Legal Interest Engine • {DISCLAIMER_TEXT.substring(0, 80)}...
      </Text>
      <Text
        style={sharedStyles.footerPageNumber}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------
interface WorksheetPdfProps {
  result: ComputationResult;
  caseLabel?: string;
}

export function WorksheetPdf({ result, caseLabel }: WorksheetPdfProps) {
  return (
    <Document
      title="Interest Computation Worksheet"
      author="Legal Interest Engine"
      subject={caseLabel ?? 'Interest Computation'}
    >
      <Page size="A4" style={sharedStyles.page}>
        <PdfHeader result={result} caseLabel={caseLabel} />
        <SummaryTable result={result} />
        <PeriodBreakdownTable result={result} />
        <Art2212Section result={result} />
        <AdditionalAwardsSection result={result} />
        <LegalBasisSection result={result} />
        <PdfFooter />
      </Page>
    </Document>
  );
}
