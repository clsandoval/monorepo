import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { ComplianceResult } from "@/engine/compute";
import { PDFTimeline } from "./pdf-timeline";

interface ComplianceReportProps {
  orgName: string;
  orgLogoUrl: string | null;
  corpName: string;
  corpType: string;
  registrationDate: string;
  result: ComplianceResult;
  generatedAt: string;
  filedReports: Array<{ reportType: string; year: number; status: string }>;
  incorporationYear: number;
}

const CHARCOAL = "#1C1C1E";
const SEC_BLUE = "#1B4F72";
const CRIMSON = "#A63232";
const LIGHT_GRAY = "#f3f4f6";
const BORDER_GRAY = "#e5e7eb";
const MID_GRAY = "#6b7280";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    color: CHARCOAL,
    backgroundColor: "#ffffff",
    paddingHorizontal: 48,
    paddingVertical: 48,
  },

  // Cover page
  coverPage: {
    fontFamily: "Helvetica",
    color: CHARCOAL,
    backgroundColor: "#ffffff",
    paddingHorizontal: 60,
    paddingVertical: 80,
    justifyContent: "space-between",
  },
  coverTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
  },
  coverLogo: {
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  coverOrgName: {
    fontSize: 13,
    color: MID_GRAY,
    fontFamily: "Helvetica",
  },
  coverCenter: {
    flex: 1,
    justifyContent: "center",
  },
  coverCorpName: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: CHARCOAL,
    marginBottom: 10,
  },
  coverReportTitle: {
    fontSize: 16,
    fontFamily: "Helvetica",
    color: SEC_BLUE,
    marginBottom: 6,
  },
  coverCorpType: {
    fontSize: 11,
    color: MID_GRAY,
    marginBottom: 4,
  },
  coverDate: {
    fontSize: 10,
    color: MID_GRAY,
  },
  coverAccentBar: {
    height: 4,
    backgroundColor: SEC_BLUE,
    marginBottom: 40,
    borderRadius: 2,
  },
  coverBottom: {
    fontSize: 9,
    color: MID_GRAY,
  },

  // Content page
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: SEC_BLUE,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GRAY,
  },
  section: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: CHARCOAL,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 9,
    lineHeight: 1.6,
    color: CHARCOAL,
  },

  // Status badge area
  statusRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },

  // Tables
  table: {
    width: "100%",
    marginTop: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: SEC_BLUE,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GRAY,
  },
  tableRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  tableCell: {
    fontSize: 8,
    color: CHARCOAL,
    flex: 1,
  },
  tableCellRight: {
    fontSize: 8,
    color: CHARCOAL,
    flex: 1,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: CHARCOAL,
  },
  totalLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    flex: 5,
  },
  totalAmount: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    flex: 1,
    textAlign: "right",
  },

  // Reinstatement box
  reinstatementBox: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    borderRadius: 4,
    padding: 12,
    marginTop: 6,
    backgroundColor: LIGHT_GRAY,
  },
  reinstatementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reinstatementLabel: {
    fontSize: 9,
    color: CHARCOAL,
  },
  reinstatementValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: CHARCOAL,
  },
  reinstatementTotal: {
    borderTopWidth: 1,
    borderTopColor: BORDER_GRAY,
    marginTop: 6,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reinstatementTotalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: CHARCOAL,
  },
  reinstatementTotalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: CRIMSON,
  },

  // Next steps
  stepItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  stepNumber: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: SEC_BLUE,
    width: 14,
  },
  stepText: {
    fontSize: 9,
    color: CHARCOAL,
    flex: 1,
    lineHeight: 1.5,
  },

  // Disclaimer
  disclaimer: {
    fontSize: 7.5,
    color: MID_GRAY,
    lineHeight: 1.5,
    marginTop: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    borderRadius: 3,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: BORDER_GRAY,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7.5,
    color: MID_GRAY,
  },
});

function formatPeso(amount: number): string {
  return "₱" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
}

function statusColor(status: string): string {
  switch (status) {
    case "active": return "#16a34a";
    case "delinquent": return "#d97706";
    case "suspended": return "#ea580c";
    case "revoked": return CRIMSON;
    default: return MID_GRAY;
  }
}

function riskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "none": return "#16a34a";
    case "low": return "#2563eb";
    case "medium": return "#d97706";
    case "high": return CRIMSON;
    default: return MID_GRAY;
  }
}

function getNextSteps(status: string, riskLevel: string): string[] {
  const steps: string[] = [];

  switch (status) {
    case "revoked":
      steps.push("File a verified petition for revival of corporate existence with the SEC.");
      steps.push("Settle all outstanding penalties, surcharges, and arrearages.");
      steps.push("Submit all delinquent GIS and AFS reports as attachments to the petition.");
      steps.push("Publish notice of application for revival in a newspaper of general circulation.");
      steps.push("Engage a corporate attorney to handle SEC proceedings and compliance submissions.");
      break;
    case "suspended":
      steps.push("File a petition for lifting of suspension order with the SEC Corporate Governance and Finance Department.");
      steps.push("Pay all assessed penalties and submit proof of payment.");
      steps.push("Bring all GIS and AFS filings up to date.");
      steps.push("Consult legal counsel regarding the suspension order and remediation steps.");
      break;
    case "delinquent":
      steps.push("File all overdue General Information Sheets (GIS) as soon as possible.");
      steps.push("File all overdue Audited Financial Statements (AFS) as soon as possible.");
      steps.push("Pay the corresponding penalties and surcharges per filing.");
      steps.push("Monitor your corporation's status in the SEC's online verification system.");
      if (riskLevel === "high") {
        steps.push("Seek legal advice immediately — revocation proceedings may be pending.");
      }
      break;
    case "active":
    default:
      if (riskLevel === "none") {
        steps.push("Maintain your filing schedule — submit GIS by May 31 and AFS by April 30 each year.");
        steps.push("Ensure your BO registration remains current if required.");
        steps.push("Review corporate records annually for accuracy.");
      } else {
        steps.push("File overdue reports promptly to avoid escalation to delinquent status.");
        steps.push("Pay any assessed penalties and obtain official receipts from the SEC.");
        steps.push("Set calendar reminders for next year's GIS and AFS filing deadlines.");
      }
      break;
  }

  return steps;
}

export function ComplianceReport({
  orgName,
  orgLogoUrl,
  corpName,
  corpType,
  registrationDate,
  result,
  generatedAt,
  filedReports,
  incorporationYear,
}: ComplianceReportProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - incorporationYear + 1 }, (_, i) => incorporationYear + i);

  // Build timeline cells from filedReports + compute missing as not_filed
  type FilingStatus = "filed_on_time" | "filed_late" | "not_filed" | "not_required";
  const timelineCells = filedReports.map((r) => ({
    year: r.year,
    reportType: r.reportType as "GIS" | "AFS" | "BO",
    status: (r.status === "filed" ? "filed_on_time" : r.status) as FilingStatus,
  }));

  const nextSteps = getNextSteps(result.status, result.riskLevel);
  const generatedFormatted = formatDate(generatedAt);
  const corpTypeLabel = corpType === "stock" ? "Stock Corporation" : corpType === "non_stock" ? "Non-Stock Corporation" : "One Person Corporation (OPC)";

  return (
    <Document title={`Compliance Report — ${corpName}`} author="SEC Compliance Navigator">
      {/* ── Page 1: Cover ─────────────────────────────────────── */}
      <Page size="A4" style={styles.coverPage}>
        {/* Top: org branding */}
        <View style={styles.coverTop}>
          {orgLogoUrl && (
            <Image src={orgLogoUrl} style={styles.coverLogo} />
          )}
          <Text style={styles.coverOrgName}>{orgName}</Text>
        </View>

        {/* Accent bar */}
        <View style={styles.coverAccentBar} />

        {/* Center: corp name + title */}
        <View style={styles.coverCenter}>
          <Text style={styles.coverCorpName}>{corpName}</Text>
          <Text style={styles.coverReportTitle}>Compliance Assessment Report</Text>
          <Text style={styles.coverCorpType}>{corpTypeLabel}</Text>
          {registrationDate && (
            <Text style={styles.coverCorpType}>
              Registered: {formatDate(registrationDate)}
            </Text>
          )}
          <Text style={{ ...styles.coverDate, marginTop: 16 }}>
            Generated: {generatedFormatted}
          </Text>
        </View>

        {/* Bottom footer line */}
        <Text style={styles.coverBottom}>
          Confidential — For internal use only. Generated by SEC Compliance Navigator.
        </Text>
      </Page>

      {/* ── Page 2+: Content ──────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        {/* 1. Compliance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance Summary</Text>

          <View style={styles.statusRow}>
            <View style={{ ...styles.badge, backgroundColor: statusColor(result.status) + "22" }}>
              <Text style={{ ...styles.badgeText, color: statusColor(result.status) }}>
                {result.status.toUpperCase()}
              </Text>
            </View>
            <View style={{ ...styles.badge, backgroundColor: riskColor(result.riskLevel) + "22" }}>
              <Text style={{ ...styles.badgeText, color: riskColor(result.riskLevel) }}>
                Risk: {result.riskLevel.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.paragraph}>{result.riskMessage}</Text>
        </View>

        {/* 2. Compliance Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filing Timeline</Text>
          <PDFTimeline cells={timelineCells} years={years} />
        </View>

        {/* 3. Penalty Breakdown — GIS/AFS */}
        {result.lineItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Penalty Breakdown</Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.tableHeaderCell, flex: 0.6 }}>Year</Text>
                <Text style={styles.tableHeaderCell}>Type</Text>
                <Text style={styles.tableHeaderCell}>Violation</Text>
                <Text style={{ ...styles.tableHeaderCell, flex: 0.6 }}>Offense #</Text>
                <Text style={{ ...styles.tableHeaderCell, textAlign: "right" }}>Base</Text>
                <Text style={{ ...styles.tableHeaderCell, textAlign: "right" }}>Surcharge</Text>
                <Text style={{ ...styles.tableHeaderCell, textAlign: "right" }}>Total</Text>
              </View>

              {result.lineItems.map((item, i) => (
                <View
                  key={`li-${i}`}
                  style={{ ...styles.tableRow, ...(i % 2 === 1 ? styles.tableRowAlt : {}) }}
                >
                  <Text style={{ ...styles.tableCell, flex: 0.6 }}>{item.year}</Text>
                  <Text style={styles.tableCell}>{item.reportType}</Text>
                  <Text style={styles.tableCell}>
                    {item.violationType === "non_filing" ? "Non-Filing" : "Late Filing"}
                  </Text>
                  <Text style={{ ...styles.tableCell, flex: 0.6, textAlign: "center" }}>
                    {item.offenseNumber}
                  </Text>
                  <Text style={styles.tableCellRight}>{formatPeso(item.basePenalty)}</Text>
                  <Text style={styles.tableCellRight}>
                    {item.surchargeMonths > 0
                      ? `${item.surchargeMonths}mo @ ${formatPeso(item.surchargeRate)}`
                      : "—"}
                  </Text>
                  <Text style={styles.tableCellRight}>{formatPeso(item.totalPenalty)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 4. BO Penalties */}
        {result.boPenalties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beneficial Ownership (BO) Penalties</Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Year</Text>
                <Text style={styles.tableHeaderCell}>Days Overdue</Text>
                <Text style={{ ...styles.tableHeaderCell, textAlign: "right" }}>Total Penalty</Text>
              </View>

              {result.boPenalties.map((item, i) => (
                <View
                  key={`bo-${i}`}
                  style={{ ...styles.tableRow, ...(i % 2 === 1 ? styles.tableRowAlt : {}) }}
                >
                  <Text style={styles.tableCell}>{item.year}</Text>
                  <Text style={styles.tableCell}>{item.daysOverdue} days</Text>
                  <Text style={styles.tableCellRight}>{formatPeso(item.totalPenalty)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 5. MC28 Penalty + Grand Total */}
        <View style={styles.section}>
          {result.mc28Penalty > 0 && (
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.subsectionTitle}>MC28 Non-Compliance Penalty</Text>
              <Text style={styles.paragraph}>
                Your corporation has not complied with Memorandum Circular 28 (MC28), resulting in an additional penalty of {formatPeso(result.mc28Penalty)}.
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total Penalty</Text>
            <Text style={styles.totalAmount}>{formatPeso(result.totalPenalty)}</Text>
          </View>
        </View>

        {/* 6. Reinstatement Cost Estimate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reinstatement Cost Estimate</Text>
          <Text style={{ ...styles.paragraph, marginBottom: 8 }}>
            The following is an estimate of total costs to bring the corporation back into good standing. Actual amounts may vary.
          </Text>

          <View style={styles.reinstatementBox}>
            <View style={styles.reinstatementRow}>
              <Text style={styles.reinstatementLabel}>Outstanding Penalties</Text>
              <Text style={styles.reinstatementValue}>{formatPeso(result.totalPenalty)}</Text>
            </View>
            <View style={styles.reinstatementRow}>
              <Text style={styles.reinstatementLabel}>SEC Petition Fee</Text>
              <Text style={styles.reinstatementValue}>{formatPeso(result.reinstatement.petitionFee)}</Text>
            </View>
            <View style={styles.reinstatementRow}>
              <Text style={styles.reinstatementLabel}>Publication (newspaper)</Text>
              <Text style={styles.reinstatementValue}>
                {formatPeso(result.reinstatement.publicationEstimate.min)} – {formatPeso(result.reinstatement.publicationEstimate.max)}
              </Text>
            </View>
            <View style={styles.reinstatementRow}>
              <Text style={styles.reinstatementLabel}>Professional Fees (lawyer/accountant)</Text>
              <Text style={styles.reinstatementValue}>
                {formatPeso(result.reinstatement.professionalFeesEstimate.min)} – {formatPeso(result.reinstatement.professionalFeesEstimate.max)}
              </Text>
            </View>

            <View style={styles.reinstatementTotal}>
              <Text style={styles.reinstatementTotalLabel}>Estimated Total Range</Text>
              <Text style={styles.reinstatementTotalValue}>
                {formatPeso(result.reinstatement.totalEstimate.min)} – {formatPeso(result.reinstatement.totalEstimate.max)}
              </Text>
            </View>
          </View>
        </View>

        {/* 7. Recommended Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
          {nextSteps.map((step, i) => (
            <View key={`step-${i}`} style={styles.stepItem}>
              <Text style={styles.stepNumber}>{i + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* 8. Legal Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Legal Disclaimer</Text>
          <Text style={styles.disclaimer}>
            This report is generated for informational purposes only and does not constitute legal advice. Penalty computations are based on SEC Memorandum Circulars and the Revised Corporation Code of the Philippines (R.A. 11232), but may not reflect the most current SEC rulings, amnesty programs, or case-specific circumstances. Consult a licensed attorney or certified public accountant for advice specific to your corporation's situation. SEC Compliance Navigator and its operators are not liable for decisions made on the basis of this report.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by SEC Compliance Navigator</Text>
          <Text style={styles.footerText}>{generatedFormatted}</Text>
        </View>
      </Page>
    </Document>
  );
}
