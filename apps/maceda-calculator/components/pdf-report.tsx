import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { MacedaResult } from "@/lib/engine/types";

const ACCENT = "#C4571A";
const TEXT_PRIMARY = "#2C2418";
const TEXT_SECONDARY = "#7A7062";
const TEXT_TERTIARY = "#A89E90";
const BG = "#F5F0E8";
const BORDER = "#E2DCD2";
const SUCCESS = "#5A8A50";

function formatPeso(centavos: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(centavos / 100);
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingTop: 48,
    paddingBottom: 48,
    paddingLeft: 52,
    paddingRight: 52,
    fontFamily: "Helvetica",
  },
  // Header
  header: {
    marginBottom: 28,
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
    paddingBottom: 16,
  },
  headerLabel: {
    fontSize: 8,
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    color: TEXT_PRIMARY,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  headerMeta: {
    fontSize: 8.5,
    color: TEXT_SECONDARY,
  },
  disclaimer: {
    fontSize: 8,
    color: TEXT_TERTIARY,
    fontStyle: "italic",
    marginTop: 4,
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 8,
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 14,
    backgroundColor: "#FDFBF7",
  },
  // Two-column row
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  rowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    flex: 1,
  },
  rowValue: {
    fontSize: 9,
    color: TEXT_PRIMARY,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginVertical: 8,
  },
  // Hero CSV
  csvHero: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    backgroundColor: "#FDFBF7",
    borderTopWidth: 3,
    borderTopColor: ACCENT,
    padding: 18,
    alignItems: "center",
    marginBottom: 10,
  },
  csvLabel: {
    fontSize: 8,
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  csvAmount: {
    fontSize: 32,
    color: TEXT_PRIMARY,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  csvSubtext: {
    fontSize: 9,
    color: TEXT_SECONDARY,
  },
  csvBadge: {
    marginTop: 8,
    backgroundColor: "#E8F0E6",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  csvBadgeText: {
    fontSize: 8,
    color: SUCCESS,
    fontFamily: "Helvetica-Bold",
  },
  // Section 4 notice
  section4Card: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 14,
    backgroundColor: "#FDFBF7",
    marginBottom: 10,
  },
  section4Title: {
    fontSize: 8,
    color: TEXT_TERTIARY,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  section4Text: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    lineHeight: 1.6,
  },
  section4Accent: {
    fontSize: 9,
    color: ACCENT,
    fontFamily: "Helvetica-Bold",
  },
  // Grace period
  graceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  graceLabel: {
    fontSize: 9,
    color: TEXT_SECONDARY,
  },
  graceSublabel: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  graceValue: {
    fontSize: 16,
    color: SUCCESS,
    fontFamily: "Helvetica-Bold",
  },
  graceNote: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    fontSize: 8,
    color: TEXT_SECONDARY,
  },
  // Legal
  legalCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 14,
    backgroundColor: "#FDFBF7",
  },
  legalCitation: {
    marginBottom: 10,
  },
  legalCitationTitle: {
    fontSize: 9,
    color: TEXT_PRIMARY,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  legalCitationText: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    lineHeight: 1.6,
    fontStyle: "italic",
  },
  legalSource: {
    fontSize: 8,
    color: TEXT_TERTIARY,
    fontStyle: "italic",
    marginTop: 6,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 52,
    right: 52,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLeft: {
    fontSize: 7.5,
    color: TEXT_TERTIARY,
  },
  footerRight: {
    fontSize: 7.5,
    color: TEXT_TERTIARY,
    fontStyle: "italic",
  },
});

export interface InputSummary {
  contractPrice: string;
  downPayment: string;
  monthlyInstallment: string;
  contractStartDate: string;
}

interface MacedaReportProps {
  result: MacedaResult;
  inputSummary: InputSummary;
}

export function MacedaReport({ result, inputSummary }: MacedaReportProps) {
  const generatedDate = new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document
      title="Maceda Law (RA 6552) — Computation Report"
      author="Maceda Calculator"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Computation Report</Text>
          <Text style={styles.headerTitle}>Maceda Law (RA 6552)</Text>
          <Text style={styles.headerMeta}>Generated {generatedDate}</Text>
          <Text style={styles.disclaimer}>
            This is an estimate only — not legal advice.
          </Text>
        </View>

        {/* Section 1: Contract Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Contract Summary</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Contract Price</Text>
              <Text style={styles.rowValue}>{inputSummary.contractPrice}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Down Payment</Text>
              <Text style={styles.rowValue}>{inputSummary.downPayment}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Monthly Installment</Text>
              <Text style={styles.rowValue}>
                {inputSummary.monthlyInstallment}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Contract Start Date</Text>
              <Text style={styles.rowValue}>
                {inputSummary.contractStartDate}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Total Payments Made</Text>
              <Text style={styles.rowValue}>
                {formatPeso(result.totalPayments)}
              </Text>
            </View>
            <View style={styles.rowLast}>
              <Text style={styles.rowLabel}>Years of Installments Paid</Text>
              <Text style={styles.rowValue}>
                {result.yearsPaid} year{result.yearsPaid !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2: CSV or Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. Cash Surrender Value (CSV)
          </Text>

          {result.eligible ? (
            <>
              <View style={styles.csvHero}>
                <Text style={styles.csvLabel}>Cash Surrender Value</Text>
                <Text style={styles.csvAmount}>
                  {formatPeso(result.csvAmount)}
                </Text>
                <Text style={styles.csvSubtext}>
                  {(result.csvPercentage * 100).toFixed(1)}% of{" "}
                  {formatPeso(result.totalPayments)} in total payments
                </Text>
                <View style={styles.csvBadge}>
                  <Text style={styles.csvBadgeText}>
                    Eligible for CSV Refund
                  </Text>
                </View>
              </View>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Base CSV (50%)</Text>
                  <Text style={styles.rowValue}>
                    {formatPeso(result.totalPayments * 0.5)}
                  </Text>
                </View>
                {result.csvPercentage > 0.5 && (
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>
                      Bonus ({((result.csvPercentage - 0.5) * 100).toFixed(0)}%
                      — 5% per year after 5 years)
                    </Text>
                    <Text style={styles.rowValue}>
                      +
                      {formatPeso(
                        result.totalPayments *
                          (result.csvPercentage - 0.5)
                      )}
                    </Text>
                  </View>
                )}
                <View style={styles.divider} />
                <View style={styles.rowLast}>
                  <Text style={styles.rowLabel}>
                    Total CSV ({(result.csvPercentage * 100).toFixed(1)}%)
                  </Text>
                  <Text style={styles.rowValue}>
                    {formatPeso(result.csvAmount)}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.section4Card}>
              <Text style={styles.section4Title}>Section 4 — Under 2 Years</Text>
              <Text style={styles.section4Text}>
                You have not yet reached the 2-year payment threshold for a
                Cash Surrender Value refund. Under Section 4 of RA 6552, you
                are entitled to a{" "}
                <Text style={styles.section4Accent}>60-day grace period</Text>{" "}
                from the date of default to catch up on missed payments without
                additional interest.{"\n\n"}
                Progress: {result.yearsPaid} of 2 years paid (
                {Math.max(0, 24 - result.yearsPaid * 12)} more months needed).
              </Text>
            </View>
          )}
        </View>

        {/* Section 3: Grace Period */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Grace Period</Text>
          <View style={styles.card}>
            {result.eligible ? (
              <>
                <View style={styles.graceRow}>
                  <View>
                    <Text style={styles.graceLabel}>
                      Grace Period Entitlement
                    </Text>
                    <Text style={styles.graceSublabel}>
                      1 month per year of paid installments
                    </Text>
                  </View>
                  <Text style={styles.graceValue}>
                    {result.gracePeriod.months} mo
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.rowLast}>
                  <Text style={styles.rowLabel}>Can be exercised now?</Text>
                  <Text style={styles.rowValue}>
                    {result.gracePeriod.canExercise ? "Yes" : "No"}
                  </Text>
                </View>
                {!result.gracePeriod.canExercise &&
                  result.gracePeriod.nextEligibleDate && (
                    <Text style={styles.graceNote}>
                      Grace period was previously exercised. Next eligible
                      date: {result.gracePeriod.nextEligibleDate}
                    </Text>
                  )}
              </>
            ) : (
              <>
                <View style={styles.graceRow}>
                  <View>
                    <Text style={styles.graceLabel}>
                      Section 4 Grace Period
                    </Text>
                    <Text style={styles.graceSublabel}>
                      Applies when less than 2 years of payments
                    </Text>
                  </View>
                  <Text style={styles.graceValue}>60 days</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.rowLast}>
                  <Text style={styles.rowLabel}>
                    Additional interest during grace period?
                  </Text>
                  <Text style={styles.rowValue}>None</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Section 4: Legal Basis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Legal Basis</Text>
          <View style={styles.legalCard}>
            {result.eligible ? (
              <>
                <View style={styles.legalCitation}>
                  <Text style={styles.legalCitationTitle}>
                    Section 3, RA 6552
                  </Text>
                  <Text style={styles.legalCitationText}>
                    "…the actual cash surrender value of the payments on the
                    property equivalent to fifty percent of the total payments
                    made…"
                  </Text>
                </View>
                <View style={styles.legalCitation}>
                  <Text style={styles.legalCitationTitle}>
                    Section 3(b), RA 6552
                  </Text>
                  <Text style={styles.legalCitationText}>
                    "…an additional five percent every year but not to exceed
                    ninety percent of the total payments made…"
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.legalCitation}>
                <Text style={styles.legalCitationTitle}>
                  Section 4, RA 6552
                </Text>
                <Text style={styles.legalCitationText}>
                  "In case where less than two years of installments were paid,
                  the seller shall give the buyer a grace period of not less
                  than sixty days from the date the installment became due."
                </Text>
              </View>
            )}
            <Text style={styles.legalSource}>
              Republic Act No. 6552, "An Act to Provide Protection to Buyers of
              Real Estate on Installment Payments" (1972)
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>Generated by Maceda Calculator</Text>
          <Text style={styles.footerRight}>
            Consult a licensed attorney for guidance on your specific situation.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
