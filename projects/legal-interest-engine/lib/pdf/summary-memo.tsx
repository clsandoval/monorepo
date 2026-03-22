/**
 * Summary Memo PDF Template
 *
 * Plain-language summary of the interest computation for non-lawyer readers.
 * No legal jargon, no citations in body — just clear explanations of what
 * is owed and why.
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ComputationResult } from '@/lib/engine/types';
import { formatPeso } from '@/lib/engine/format';
import { sharedStyles, PDF_COLORS, DISCLAIMER_TEXT } from './shared-styles';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  heroBox: {
    backgroundColor: PDF_COLORS.primary,
    padding: 16,
    marginBottom: 18,
    borderRadius: 2,
  },
  heroTitle: {
    fontFamily: 'Newsreader',
    fontSize: 13,
    fontWeight: 700,
    color: PDF_COLORS.white,
    marginBottom: 6,
  },
  heroSentence: {
    fontSize: 9.5,
    color: '#c8dac8',
    lineHeight: 1.5,
  },
  heroAmount: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 20,
    fontWeight: 600,
    color: PDF_COLORS.white,
    marginTop: 10,
  },
  heroAmountLabel: {
    fontSize: 8,
    color: '#a0c0a0',
    marginTop: 2,
  },

  stepBox: {
    marginBottom: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: PDF_COLORS.accent,
    backgroundColor: '#f8faf8',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 8.5,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    flex: 3,
  },
  stepAmount: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 8.5,
    fontWeight: 600,
    color: PDF_COLORS.primary,
    flex: 1,
    textAlign: 'right',
  },
  stepDescription: {
    fontSize: 8.5,
    color: PDF_COLORS.secondary,
    lineHeight: 1.5,
  },
  stepNote: {
    fontSize: 7.5,
    color: PDF_COLORS.muted,
    fontStyle: 'italic',
    marginTop: 3,
  },

  totalBreakdown: {
    marginTop: 14,
    marginBottom: 6,
  },
  totalBreakdownTitle: {
    fontFamily: 'Newsreader',
    fontSize: 10,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.3,
    borderBottomColor: PDF_COLORS.border,
  },
  breakdownRowAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.3,
    borderBottomColor: PDF_COLORS.border,
    backgroundColor: PDF_COLORS.tableAltRowBg,
  },
  breakdownLabel: {
    fontSize: 8.5,
    color: PDF_COLORS.secondary,
  },
  breakdownValue: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 8,
    color: PDF_COLORS.primary,
  },
  breakdownTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: PDF_COLORS.tableHeaderBg,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.primary,
  },
  breakdownTotalLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: PDF_COLORS.primary,
  },
  breakdownTotalValue: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 9,
    fontWeight: 600,
    color: PDF_COLORS.primary,
  },

  whatNextBox: {
    marginTop: 16,
    padding: 10,
    borderWidth: 0.5,
    borderColor: PDF_COLORS.border,
    backgroundColor: '#fffdf8',
  },
  whatNextTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    marginBottom: 6,
  },
  whatNextItem: {
    fontSize: 8.5,
    color: PDF_COLORS.secondary,
    marginBottom: 4,
    lineHeight: 1.4,
  },
  whatNextBullet: {
    fontWeight: 700,
    color: PDF_COLORS.primary,
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtDateLong(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtRateBps(bps: number): string {
  return `${bps / 100}%`;
}

function todayLong(): string {
  return new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function periodPlainExplanation(
  period: { label: string; startDate: string; endDate: string; rateBps: number; baseAmount: number; interest: number; days: number }
): string {
  return (
    `From ${fmtDateLong(period.startDate)} to ${fmtDateLong(period.endDate)}, ` +
    `interest of ${fmtRateBps(period.rateBps)} per year was applied to ` +
    `${formatPeso(period.baseAmount)} over ${period.days} days, ` +
    `resulting in ${formatPeso(period.interest)} in interest.`
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HeroSection({ result }: { result: ComputationResult }) {
  const isLoan = result.input.obligationType === 'loan_forbearance';
  return (
    <View style={styles.heroBox}>
      <Text style={styles.heroTitle}>You are owed:</Text>
      <Text style={styles.heroAmount}>{formatPeso(result.grandTotal)}</Text>
      <Text style={styles.heroAmountLabel}>Total as of {fmtDateLong(result.input.targetDate)}</Text>
      <Text style={[styles.heroSentence, { marginTop: 10 }]}>
        This is the amount {isLoan ? 'owed on a loan or forbearance obligation' : 'owed on a monetary claim'},
        including the original amount and all interest that has built up over time.
        The interest was calculated under Philippine law.
      </Text>
    </View>
  );
}

function PeriodSteps({ result }: { result: ComputationResult }) {
  const allPeriods = [...(result.periods ?? []), ...(result.postFinality ?? [])];
  return (
    <View style={sharedStyles.section}>
      <Text style={sharedStyles.sectionTitle}>How the Interest Was Calculated</Text>
      <Text style={[sharedStyles.paragraph, { marginBottom: 10 }]}>
        Interest was applied in separate periods, because Philippine law changed the interest rate
        in 2013. Here is a plain explanation of each period:
      </Text>

      {allPeriods.map((period, i) => (
        <View key={i} style={styles.stepBox}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepLabel}>{period.label}</Text>
            <Text style={styles.stepAmount}>{formatPeso(period.interest)}</Text>
          </View>
          <Text style={styles.stepDescription}>{periodPlainExplanation(period)}</Text>
        </View>
      ))}

      {result.art2212 && (
        <View style={styles.stepBox}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepLabel}>Interest on accrued interest (special rule)</Text>
            <Text style={styles.stepAmount}>{formatPeso(result.art2212.interest)}</Text>
          </View>
          <Text style={styles.stepDescription}>
            Philippine law allows interest to accrue on top of already-accrued stipulated interest
            once legal proceedings start. This adds {formatPeso(result.art2212.interest)} to the total.
          </Text>
        </View>
      )}
    </View>
  );
}

function TotalBreakdown({ result }: { result: ComputationResult }) {
  return (
    <View style={styles.totalBreakdown}>
      <Text style={styles.totalBreakdownTitle}>Where does the total come from?</Text>

      <View style={styles.breakdownRow}>
        <Text style={styles.breakdownLabel}>Original amount owed (principal)</Text>
        <Text style={styles.breakdownValue}>{formatPeso(result.totalPrincipal)}</Text>
      </View>
      <View style={styles.breakdownRowAlt}>
        <Text style={styles.breakdownLabel}>Interest that has built up</Text>
        <Text style={styles.breakdownValue}>{formatPeso(result.totalInterest)}</Text>
      </View>
      {result.totalAdditionalAwards > 0 && (
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Additional amounts awarded (damages, fees)</Text>
          <Text style={styles.breakdownValue}>{formatPeso(result.totalAdditionalAwards)}</Text>
        </View>
      )}
      {result.totalAdditionalAwardsInterest > 0 && (
        <View style={styles.breakdownRowAlt}>
          <Text style={styles.breakdownLabel}>Interest on those additional amounts</Text>
          <Text style={styles.breakdownValue}>{formatPeso(result.totalAdditionalAwardsInterest)}</Text>
        </View>
      )}
      <View style={styles.breakdownTotalRow}>
        <Text style={styles.breakdownTotalLabel}>Total you are owed</Text>
        <Text style={styles.breakdownTotalValue}>{formatPeso(result.grandTotal)}</Text>
      </View>
    </View>
  );
}

function WhatNextBox() {
  return (
    <View style={styles.whatNextBox}>
      <Text style={styles.whatNextTitle}>What should you do with this document?</Text>
      <Text style={styles.whatNextItem}>
        <Text style={styles.whatNextBullet}>• Keep it on file.</Text>
        {' '}This memo summarizes your computation as of today. The interest continues to grow until it is paid.
      </Text>
      <Text style={styles.whatNextItem}>
        <Text style={styles.whatNextBullet}>• Share it with your lawyer.</Text>
        {' '}A licensed attorney can verify the computation and help you collect what you are owed.
      </Text>
      <Text style={styles.whatNextItem}>
        <Text style={styles.whatNextBullet}>• Do not use this alone in court.</Text>
        {' '}A more detailed legal worksheet (Annex format) is required for court filings.
      </Text>
    </View>
  );
}

function PdfFooter() {
  return (
    <View style={sharedStyles.footer} fixed>
      <Text style={sharedStyles.footerText}>
        Legal Interest Engine • Generated {todayLong()}
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
interface SummaryMemoProps {
  result: ComputationResult;
  caseLabel?: string;
}

export function SummaryMemoPdf({ result, caseLabel }: SummaryMemoProps) {
  return (
    <Document
      title="Summary of Interest Computation"
      author="Legal Interest Engine"
      subject={caseLabel ?? 'Interest Summary'}
    >
      <Page size="A4" style={sharedStyles.page}>
        {/* Header */}
        <View style={[sharedStyles.headerSection, { borderBottomWidth: 1 }]}>
          <Text style={sharedStyles.headerTitle}>Summary of Interest Computation</Text>
          {caseLabel && <Text style={sharedStyles.headerSubtitle}>{caseLabel}</Text>}
          <View style={sharedStyles.headerMeta}>
            <Text style={sharedStyles.headerMetaText}>Prepared: {todayLong()}</Text>
            <Text style={sharedStyles.headerMetaText}>As of: {fmtDateLong(result.input.targetDate)}</Text>
          </View>
        </View>

        <HeroSection result={result} />
        <TotalBreakdown result={result} />
        <PeriodSteps result={result} />
        <WhatNextBox />

        {/* Disclaimer */}
        <View style={[sharedStyles.citationBlock, { marginTop: 16 }]}>
          <Text style={sharedStyles.citationTitle}>Important Note</Text>
          <Text style={sharedStyles.disclaimerText}>{DISCLAIMER_TEXT}</Text>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
