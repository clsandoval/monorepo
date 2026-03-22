"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface PenaltyLineItem {
  year: number;
  reportType: string;
  violationType: string;
  totalPenalty: number;
}

interface ComputationResult {
  status?: string;
  lineItems?: PenaltyLineItem[];
  boPenalties?: Array<{ year: number; totalPenalty: number }>;
  mc28Penalty?: number;
  totalPenalty?: number;
  corporationName?: string;
  secRegistrationNumber?: string;
}

interface PetitionGeneratorProps {
  computationResult: ComputationResult;
}

function buildPetitionHtml(result: ComputationResult): string {
  const corpName = result.corporationName ?? "[CORPORATION NAME]";
  const secRegNo = result.secRegistrationNumber ?? "[SEC REGISTRATION NUMBER]";
  const totalPenalty = result.totalPenalty ?? 0;
  const lineItems = result.lineItems ?? [];
  const boPenalties = result.boPenalties ?? [];
  const mc28Penalty = result.mc28Penalty ?? 0;

  const today = new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const unfiledRows = lineItems
    .filter((item) => item.violationType === "non_filing" || item.violationType === "late_filing")
    .map(
      (item) =>
        `<tr>
          <td style="padding: 6px 12px; border: 1px solid #ddd;">${item.year}</td>
          <td style="padding: 6px 12px; border: 1px solid #ddd;">${item.reportType}</td>
          <td style="padding: 6px 12px; border: 1px solid #ddd;">${item.violationType === "late_filing" ? "Late Filing" : "Non-Filing"}</td>
          <td style="padding: 6px 12px; border: 1px solid #ddd; text-align: right;">₱${item.totalPenalty.toLocaleString("en-PH")}</td>
        </tr>`
    )
    .join("");

  const boRows = boPenalties
    .map(
      (item) =>
        `<tr>
          <td style="padding: 6px 12px; border: 1px solid #ddd;">${item.year}</td>
          <td style="padding: 6px 12px; border: 1px solid #ddd;">Beneficial Ownership Report</td>
          <td style="padding: 6px 12px; border: 1px solid #ddd;">Non-Filing</td>
          <td style="padding: 6px 12px; border: 1px solid #ddd; text-align: right;">₱${item.totalPenalty.toLocaleString("en-PH")}</td>
        </tr>`
    )
    .join("");

  const mc28Row =
    mc28Penalty > 0
      ? `<tr>
          <td style="padding: 6px 12px; border: 1px solid #ddd;">—</td>
          <td style="padding: 6px 12px; border: 1px solid #ddd;">MC 28 Compliance</td>
          <td style="padding: 6px 12px; border: 1px solid #ddd;">Non-Compliance</td>
          <td style="padding: 6px 12px; border: 1px solid #ddd; text-align: right;">₱${mc28Penalty.toLocaleString("en-PH")}</td>
        </tr>`
      : "";

  const allRows = unfiledRows + boRows + mc28Row;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Petition Cover Letter — ${corpName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
      padding: 0;
    }

    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 72px 72px;
    }

    h1 {
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 4px;
    }

    h2 {
      font-size: 12pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 24px;
    }

    .date-block {
      text-align: right;
      margin-bottom: 24px;
    }

    .address-block {
      margin-bottom: 24px;
    }

    .salutation {
      margin-bottom: 16px;
    }

    p {
      margin-bottom: 14px;
      text-align: justify;
    }

    .penalty-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 11pt;
    }

    .penalty-table th {
      background: #f0f0f0;
      padding: 8px 12px;
      border: 1px solid #ddd;
      text-align: left;
      font-weight: bold;
    }

    .penalty-table .total-row td {
      font-weight: bold;
      background: #f9f9f9;
    }

    .signature-block {
      margin-top: 48px;
    }

    .signature-line {
      margin-top: 48px;
      border-top: 1px solid #333;
      width: 240px;
      padding-top: 4px;
    }

    .draft-watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 80pt;
      color: rgba(0,0,0,0.05);
      font-family: Arial, sans-serif;
      font-weight: bold;
      pointer-events: none;
      white-space: nowrap;
      z-index: 0;
    }

    .disclaimer {
      margin-top: 32px;
      padding: 12px;
      background: #fff8e1;
      border: 1px solid #f0d000;
      font-size: 10pt;
      font-family: Arial, sans-serif;
    }

    @media print {
      body { padding: 0; }
      .page { padding: 0; max-width: 100%; }
      .draft-watermark { display: none; }
      .disclaimer { display: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="draft-watermark">DRAFT</div>

  <div class="page">
    <div class="disclaimer no-print">
      <strong>Template Notice:</strong> This is a computer-generated draft for reference only.
      Review and customize all bracketed placeholders before filing. This is not legal advice.
      Have a lawyer or corporate secretary review before submission.
    </div>

    <br />

    <h1>PETITION FOR [REVIVAL / LIFTING OF SUSPENSION]</h1>
    <h2>OF ${corpName.toUpperCase()}</h2>

    <div class="date-block">${today}</div>

    <div class="address-block">
      <p><strong>The Director General</strong><br />
      Securities and Exchange Commission<br />
      Secretariat Building, PICC Complex<br />
      Roxas Boulevard, Pasay City 1307</p>
    </div>

    <p class="salutation">Dear Director General,</p>

    <p>
      <strong>${corpName}</strong> (hereinafter referred to as the "Corporation"), a corporation
      duly registered with the Securities and Exchange Commission (SEC) under SEC Registration
      No. <strong>${secRegNo}</strong>, respectfully files this Petition for
      [Revival / Lifting of Suspension] pursuant to the Revised Corporation Code of the
      Philippines (Republic Act No. 11232) and applicable SEC rules and regulations.
    </p>

    <p>
      The Corporation acknowledges that it has incurred deficiencies in its annual reportorial
      obligations, resulting in the accumulation of penalties as reflected in the table below.
      The Corporation has since taken steps to remediate these deficiencies and is now in the
      process of completing all backlog filings and settling all outstanding penalties.
    </p>

    <p><strong>Summary of Accumulated Penalties:</strong></p>

    <table class="penalty-table">
      <thead>
        <tr>
          <th>Year</th>
          <th>Report / Obligation</th>
          <th>Violation Type</th>
          <th style="text-align: right;">Penalty Amount</th>
        </tr>
      </thead>
      <tbody>
        ${allRows || '<tr><td colspan="4" style="padding: 8px 12px; border: 1px solid #ddd; text-align: center; font-style: italic;">No penalty line items found.</td></tr>'}
        <tr class="total-row">
          <td colspan="3" style="padding: 8px 12px; border: 1px solid #ddd; text-align: right;">Total Estimated Penalties</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd; text-align: right;">₱${totalPenalty.toLocaleString("en-PH")}</td>
        </tr>
      </tbody>
    </table>

    <p>
      The Corporation has paid / is concurrently paying the foregoing penalties in full at the
      SEC cashier, as evidenced by the official receipts attached hereto as
      <strong>Annex "A."</strong>
    </p>

    <p>
      In support of this Petition, the Corporation has prepared and is submitting all required
      backlog filings (GIS, AFS, and Beneficial Ownership reports) for the relevant years,
      together with the requisite documentary requirements prescribed by the SEC.
    </p>

    <p>
      The Corporation likewise commits to maintain full compliance with all SEC reportorial
      obligations going forward and to file all required reports within the prescribed
      deadlines.
    </p>

    <p>
      WHEREFORE, premises considered, the Corporation respectfully prays that this Honorable
      Commission GRANT this Petition and issue an Order:
    </p>

    <ol style="margin: 0 0 14px 24px;">
      <li style="margin-bottom: 8px;">
        Reviving / Lifting the suspension of the corporate existence of
        ${corpName}; and
      </li>
      <li style="margin-bottom: 8px;">
        Restoring the Corporation to active status in the SEC's records.
      </li>
    </ol>

    <p>Other reliefs just and equitable under the premises are likewise prayed for.</p>

    <p>Respectfully submitted,</p>

    <div class="signature-block">
      <p>[NAME OF AUTHORIZED OFFICER]<br />
      [Title / Position]<br />
      ${corpName}</p>

      <div class="signature-line">
        Signature over Printed Name
      </div>
    </div>

    <br /><br />

    <p style="font-size: 11pt;"><strong>VERIFICATION AND CERTIFICATION</strong></p>

    <p>
      I, [NAME OF AUTHORIZED OFFICER], of legal age, Filipino, and with office address at
      [REGISTERED ADDRESS], after being duly sworn, depose and state that: I am the
      [Title / Position] of ${corpName}; I caused the preparation of the foregoing Petition;
      I have read and understood the contents thereof; and the same are true and correct of
      my own personal knowledge and based on authentic records.
    </p>

    <div class="signature-block">
      <div class="signature-line">
        Affiant
      </div>
    </div>

    <br />

    <p style="font-size: 11pt;">
      SUBSCRIBED AND SWORN to before me this _____ day of _________, 20____ in the City of
      _____________.
    </p>

    <br />

    <p style="font-size: 11pt;">
      Doc. No. ______;<br />
      Page No. ______;<br />
      Book No. ______;<br />
      Series of 20____.
    </p>
  </div>
</body>
</html>`;
}

export function PetitionGenerator({ computationResult }: PetitionGeneratorProps) {
  function handleGenerate() {
    const html = buildPetitionHtml(computationResult);
    const win = window.open("", "_blank");
    if (!win) {
      alert("Pop-up was blocked. Please allow pop-ups for this site and try again.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold text-charcoal">
          Generate Petition Cover Letter
        </h2>
        <p className="font-body text-sm text-gray-secondary mt-1">
          Generate a pre-filled petition template based on your computation results. Opens in a
          new tab — use your browser&apos;s Print function (Ctrl+P / Cmd+P) to save as PDF.
        </p>
      </div>

      <div className="rounded-lg border border-divider bg-gray-50 px-5 py-4 space-y-3">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 text-gray-muted mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <div className="space-y-1">
            <p className="font-body text-sm font-medium text-charcoal">What&apos;s included</p>
            <ul className="font-body text-sm text-gray-secondary space-y-0.5 list-disc list-inside">
              <li>Standard SEC petition cover letter structure</li>
              <li>Your penalty breakdown table (pre-filled)</li>
              <li>Verification and notarization block</li>
              <li>Bracketed placeholders for information you&apos;ll need to complete</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p className="font-body text-sm text-gray-secondary">
            This template requires review by a lawyer or corporate secretary before filing. It is
            not a substitute for legal advice.
          </p>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        className="bg-sec-blue text-white hover:bg-sec-blue/90 font-body"
      >
        Generate Petition Cover Letter
      </Button>
    </div>
  );
}
