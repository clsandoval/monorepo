/**
 * Court Filing PDF Template
 *
 * "Computation of Legal Interest" document formatted for NLRC and civil court
 * filings. Tabular, footnoted, with signature block for preparer.
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
  // Top caption section
  captionBox: {
    marginBottom: 16,
    textAlign: 'center',
    borderWidth: 0.5,
    borderColor: PDF_COLORS.border,
    padding: 12,
  },
  captionCourt: {
    fontFamily: 'Newsreader',
    fontSize: 10,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  captionBranch: {
    fontSize: 9,
    color: PDF_COLORS.secondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  captionCaseNo: {
    fontSize: 8.5,
    color: PDF_COLORS.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  captionParties: {
    fontSize: 8.5,
    color: PDF_COLORS.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  docTitle: {
    fontFamily: 'Newsreader',
    fontSize: 14,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  annexLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: PDF_COLORS.secondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  // Table column widths
  colPeriod: { flex: 2, paddingRight: 4 },
  colStart: { flex: 1.4, paddingRight: 4 },
  colEnd: { flex: 1.4, paddingRight: 4 },
  colDays: { flex: 0.7, textAlign: 'right', paddingRight: 4 },
  colRate: { flex: 0.9, textAlign: 'right', paddingRight: 4 },
  colBase: { flex: 1.8, textAlign: 'right', paddingRight: 4 },
  colInterest: { flex: 1.8, textAlign: 'right' },

  footnoteSection: {
    marginTop: 16,
  },
  footnoteTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    color: PDF_COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  footnoteItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  footnoteNumber: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 7,
    color: PDF_COLORS.secondary,
    width: 16,
  },
  footnoteText: {
    fontSize: 7.5,
    color: PDF_COLORS.secondary,
    flex: 1,
    lineHeight: 1.4,
  },
  superscript: {
    fontSize: 5.5,
    color: PDF_COLORS.secondary,
  },

  sigSection: {
    marginTop: 28,
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: PDF_COLORS.border,
  },
  sigLabel: {
    fontSize: 8.5,
    color: PDF_COLORS.secondary,
    marginBottom: 26,
  },
  sigLine: {
    borderTopWidth: 0.5,
    borderTopColor: PDF_COLORS.primary,
    width: 220,
    marginBottom: 4,
  },
  sigName: {
    fontSize: 9,
    fontWeight: 700,
    color: PDF_COLORS.primary,
  },
  sigTitle: {
    fontSize: 8.5,
    color: PDF_COLORS.secondary,
    marginTop: 1,
  },
  sigPRC: {
    fontSize: 8,
    color: PDF_COLORS.muted,
    marginTop: 1,
  },
  certParagraph: {
    fontSize: 8.5,
    color: PDF_COLORS.primary,
    lineHeight: 1.5,
    marginBottom: 10,
    textAlign: 'justify',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 7,
    backgroundColor: PDF_COLORS.primary,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: PDF_COLORS.white,
  },
  totalValue: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 9,
    fontWeight: 600,
    color: PDF_COLORS.white,
  },
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

// Collect unique citations and assign footnote numbers
function buildFootnoteMap(result: ComputationResult): Map<string, number> {
  const seen = new Map<string, number>();
  let n = 1;

  const add = (c: string) => {
    if (!seen.has(c)) seen.set(c, n++);
  };

  result.periods.forEach((p) => add(p.legalCitation));
  result.postFinality?.forEach((p) => add(p.legalCitation));
  if (result.art2212) add(result.art2212.legalCitation);
  add(CITATIONS.NACAR);

  return seen;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CourtFilingHeader({
  annexLabel,
  caseNumber,
  court,
  parties,
}: {
  annexLabel: string;
  caseNumber?: string;
  court?: string;
  parties?: string;
}) {
  return (
    <View>
      <Text style={styles.docTitle}>Computation of Legal Interest</Text>
      <Text style={styles.annexLabel}>{annexLabel}</Text>
      {(caseNumber || court || parties) && (
        <View style={styles.captionBox}>
          {court && <Text style={styles.captionCourt}>{court}</Text>}
          {caseNumber && <Text style={styles.captionCaseNo}>Case No. {caseNumber}</Text>}
          {parties && <Text style={styles.captionParties}>{parties}</Text>}
        </View>
      )}
    </View>
  );
}

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

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------
export interface CourtFilingProps {
  result: ComputationResult;
  annexLabel?: string; // e.g. "ANNEX A", "ANNEX B-1"
  caseNumber?: string;
  court?: string;
  parties?: string; // e.g. "Plaintiff v. Defendant"
  preparerName?: string;
  preparerTitle?: string;
  preparerPRC?: string;
}

export function CourtFilingPdf({
  result,
  annexLabel = 'ANNEX A',
  caseNumber,
  court,
  parties,
  preparerName,
  preparerTitle,
  preparerPRC,
}: CourtFilingProps) {
  const allPeriods = [...(result.periods ?? []), ...(result.postFinality ?? [])];
  const footnoteMap = buildFootnoteMap(result);

  return (
    <Document
      title="Computation of Legal Interest"
      author="Legal Interest Engine"
      subject={caseNumber ? `Case No. ${caseNumber}` : 'Interest Computation'}
    >
      <Page size="A4" style={sharedStyles.page}>
        <CourtFilingHeader
          annexLabel={annexLabel}
          caseNumber={caseNumber}
          court={court}
          parties={parties}
        />

        {/* Main computation table */}
        <View style={sharedStyles.section}>
          <View style={sharedStyles.table}>
            {/* Header */}
            <View style={sharedStyles.tableHeader}>
              <Text style={[sharedStyles.tableHeaderCell, styles.colPeriod]}>Period</Text>
              <Text style={[sharedStyles.tableHeaderCell, styles.colStart]}>Start Date</Text>
              <Text style={[sharedStyles.tableHeaderCell, styles.colEnd]}>End Date</Text>
              <Text style={[sharedStyles.tableHeaderCell, styles.colDays]}>Days</Text>
              <Text style={[sharedStyles.tableHeaderCell, styles.colRate]}>Rate</Text>
              <Text style={[sharedStyles.tableHeaderCell, styles.colBase]}>Base Amount</Text>
              <Text style={[sharedStyles.tableHeaderCell, styles.colInterest]}>Interest</Text>
            </View>

            {allPeriods.map((period, i) => {
              const fn = footnoteMap.get(period.legalCitation);
              return (
                <View key={i} style={i % 2 === 0 ? sharedStyles.tableRow : sharedStyles.tableRowAlt}>
                  <View style={[styles.colPeriod, { flexDirection: 'row' }]}>
                    <Text style={sharedStyles.tableCell}>{period.label}</Text>
                    {fn && <Text style={styles.superscript}> [{fn}]</Text>}
                  </View>
                  <Text style={[sharedStyles.tableCell, styles.colStart]}>{fmtDateShort(period.startDate)}</Text>
                  <Text style={[sharedStyles.tableCell, styles.colEnd]}>{fmtDateShort(period.endDate)}</Text>
                  <Text style={[sharedStyles.tableCellMono, styles.colDays]}>{period.days}</Text>
                  <Text style={[sharedStyles.tableCellMono, styles.colRate]}>{fmtRateBps(period.rateBps)}</Text>
                  <Text style={[sharedStyles.tableCellMono, styles.colBase]}>{formatPeso(period.baseAmount)}</Text>
                  <Text style={[sharedStyles.tableCellMono, styles.colInterest]}>{formatPeso(period.interest)}</Text>
                </View>
              );
            })}
          </View>

          {/* Art. 2212 row if applicable */}
          {result.art2212 && (
            <View style={sharedStyles.tableRow}>
              <View style={[styles.colPeriod, { flexDirection: 'row' }]}>
                <Text style={sharedStyles.tableCell}>Interest on stipulated interest (Art. 2212)</Text>
                <Text style={styles.superscript}> [{footnoteMap.get(result.art2212.legalCitation)}]</Text>
              </View>
              <Text style={[sharedStyles.tableCell, styles.colStart]}>{fmtDateShort(result.art2212.startDate)}</Text>
              <Text style={[sharedStyles.tableCell, styles.colEnd]}>{fmtDateShort(result.art2212.endDate)}</Text>
              <Text style={[sharedStyles.tableCellMono, styles.colDays]}>{result.art2212.days}</Text>
              <Text style={[sharedStyles.tableCellMono, styles.colRate]}>{fmtRateBps(result.art2212.rateBps)}</Text>
              <Text style={[sharedStyles.tableCellMono, styles.colBase]}>{formatPeso(result.art2212.accruedStipulatedInterest)}</Text>
              <Text style={[sharedStyles.tableCellMono, styles.colInterest]}>{formatPeso(result.art2212.interest)}</Text>
            </View>
          )}

          {/* Grand total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT (Principal + Interest)</Text>
            <Text style={styles.totalValue}>{formatPeso(result.grandTotal)}</Text>
          </View>
        </View>

        {/* Footnotes */}
        <View style={styles.footnoteSection}>
          <Text style={styles.footnoteTitle}>Notes & Legal Authority</Text>
          {Array.from(footnoteMap.entries()).map(([citation, num]) => (
            <View key={num} style={styles.footnoteItem}>
              <Text style={styles.footnoteNumber}>[{num}]</Text>
              <Text style={styles.footnoteText}>{citation}</Text>
            </View>
          ))}
        </View>

        {/* Certification & Signature */}
        <View style={styles.sigSection}>
          <Text style={styles.certParagraph}>
            I hereby certify that the foregoing computation of legal interest is accurate and
            in accordance with the applicable rulings of the Supreme Court of the Philippines,
            particularly <Text style={{ fontStyle: 'italic' }}>Nacar v. Gallery Frames</Text>
            {' '}(G.R. No. 189871, August 13, 2013) and BSP-MB Circular No. 799, Series of 2013.
            The computation was prepared on {todayLong()} with a target date of{' '}
            {fmtDateShort(result.input.targetDate)}.
          </Text>

          <Text style={styles.sigLabel}>Prepared by:</Text>
          <View style={styles.sigLine} />
          {preparerName
            ? <Text style={styles.sigName}>{preparerName}</Text>
            : <Text style={styles.sigName}>________________________________</Text>
          }
          {preparerTitle && <Text style={styles.sigTitle}>{preparerTitle}</Text>}
          {preparerPRC && <Text style={styles.sigPRC}>PRC Lic. No. {preparerPRC}</Text>}
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
