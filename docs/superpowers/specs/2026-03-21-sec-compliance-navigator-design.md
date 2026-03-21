# SEC Compliance Navigator — Design Spec

**Date:** 2026-03-21
**Status:** Approved
**Domain:** E1 — SEC Compliance Navigator & Penalty Engine
**Score:** 4.75 (ranked #1 in ph-compliance-moats-reverse)

---

## Problem

117,885+ Philippine corporations were suspended in a single SEC batch order (Feb 2024). 100K-200K are in various stages of non-compliance at any time. These companies pay ₱50K-₱300K to law firms just to figure out where they stand and how to fix it. The computation is purely mechanical — RA 11232 Sec. 162 specifies the penalty schedule, SEC Memoranda specify ECIP fee structures — but zero self-service tools exist.

## Product

A standalone web app that tells Philippine corporations their SEC compliance status and accumulated penalties, then guides them through remediation.

**Separate product from TaxKlaro (freelance tax) and Inheritance (estate tax).** Own domain, own brand, own deploy.

---

## User Flows

### Free Tier — Small Business Owner

1. Land on homepage → "Is your corporation in trouble with the SEC?"
2. Start wizard (no signup required):
   - Corporate type (stock / non-stock / OPC)
   - Date of incorporation
   - Which annual reports have you filed? (GIS, AFS, BO — checklist per year, pre-populated from incorporation date to present)
   - Have you received a suspension or revocation order?
3. Results page:
   - Compliance status badge (Active / Delinquent / Suspended / Revoked)
   - Itemized penalty table by year and report type
   - Total penalties owed
4. CTA: "Want to know how to fix this?" → signup gate
5. Post-signup — remediation flow:
   - ECIP vs. reinstatement comparison with cost breakdown
   - Step-by-step remediation guide
   - Required documents checklist
   - Generated documents (ECIP application, cover letter)

### Pro Tier — Corporate Secretaries / Law Firms (Post-MVP)

1. Sign up → multi-corporation dashboard
2. Add corporations via wizard or batch CSV upload
3. Dashboard: all corps sorted by severity, upcoming deadlines, penalty totals
4. Per-corporation: full penalty breakdown + generate branded client-facing PDF report
5. Hybrid billing: base subscription + credits for additional corps/reports above threshold

---

## Computation Engine

### Inputs
- Corporate type (stock / non-stock / OPC)
- SEC registration date
- List of filed reports per year (GIS, AFS, BO report)
- Suspension/revocation order date (if any)

### Computation Steps
1. Generate expected filing timeline — from incorporation year to present, which reports were due each year (GIS annually, AFS annually, BO report from 2022 onward per SEC MC-028-2020)
2. Diff expected vs. actual filings → list of missed filings
3. Per missed filing, apply penalty schedule from SEC MC-019-2016 / RA 11232:
   - Stock corp: penalty per unfiled GIS, per unfiled AFS (amounts escalate by year of delinquency)
   - Non-stock: different schedule
   - OPC: different schedule
4. Accumulate total penalties
5. Determine compliance status: active (all filed), delinquent (missed but not suspended), suspended (SEC order), revoked (SEC order)
6. If eligible for ECIP: compute ECIP settlement amount (reduced penalty + compliance fee)
7. Compare: ECIP total vs. standard reinstatement petition cost (filing fees + penalties + legal fees estimate)

### Outputs
- Compliance status with explanation
- Table: year × report type → filed/missed → penalty amount
- Total accumulated penalties
- ECIP eligibility flag + ECIP settlement amount (if eligible)
- ECIP vs. reinstatement comparison (gated behind signup)
- Remediation checklist with generated documents (pro tier)

### Penalty Schedule as Data Table
The exact penalty amounts per report type per year are specified in SEC memorandum circulars and get updated. The penalty schedule lives in a **configurable data table, not hardcoded logic**. When SEC issues a new circular, update a config row, not application code.

---

## Document Upload & OCR Pre-fill (Deferred)

Supported documents:
- SEC Certificate of Incorporation → extracts: corp name, type, registration number, date of incorporation
- SEC Correspondence/Orders → extracts: compliance status, specific violations cited, dates
- GIS/AFS filing receipts → extracts: which reports were filed for which years

Flow: user drops PDF/photo → OCR extracts text → parsing pulls structured fields → pre-fills wizard → user reviews and corrects. Never trust OCR blindly; wizard is always source of truth. If extraction fails, show document alongside empty wizard for manual entry.

This is a convenience feature, not a core dependency.

---

## Monetization

### Free vs. Pro Feature Split

| Feature | Free | Pro |
|---|---|---|
| Wizard + penalty computation | ✅ | ✅ |
| Compliance status | ✅ | ✅ |
| Itemized penalty breakdown | ✅ | ✅ |
| ECIP vs. reinstatement comparison | ❌ | ✅ |
| Remediation guide + checklist | ❌ | ✅ |
| Document generation | ❌ | ✅ |
| Multi-corporation dashboard | ❌ | ✅ |
| Branded client-facing PDF reports | ❌ | ✅ (credits) |
| Batch CSV upload | ❌ | ✅ |
| Document upload pre-fill | ❌ | ✅ |

### Pricing Structure
- Base subscription: monthly fee for dashboard access + N included corporations + M included reports
- Overage: per-corp and per-report credits above threshold
- Exact price points TBD — start with early access / beta pricing
- No pricing page at MVP; pro tier gets "Contact us" / waitlist

---

## Architecture & Tech Stack

- **Frontend:** Next.js, standalone repo/deploy, own domain
- **Computation engine:** Standalone pure-function module. Takes inputs → returns penalty breakdown. Designed to be reusable as shared infrastructure for other compliance tools.
- **Auth:** Email + password, or Google OAuth
- **Database:** Postgres — users, corporations, filing history, computation results, subscription status
- **File storage:** S3-compatible for uploaded documents (deferred)
- **OCR:** Google Cloud Vision or similar with LLM parsing layer (deferred)
- **PDF generation:** Server-side (puppeteer or similar) for branded client reports (deferred)
- **Deployment:** Vercel or similar for Next.js frontend, separate API service for computation + PDF gen

---

## MVP Scope

### In
- Wizard flow (no signup required): corp type, incorporation date, filing checklist, suspension status → penalty computation + compliance status
- Signup gate at remediation step
- Remediation: ECIP vs. reinstatement comparison, step-by-step guide, required documents checklist
- Basic document generation (ECIP application, cover letter)
- Penalty schedule as configurable data table

### Deferred
- Document upload / OCR pre-fill
- Pro tier dashboard (multi-corp)
- Branded PDF reports
- Batch CSV upload
- Concierge/referral marketplace
- Subscription billing infrastructure

---

## Governing Law & References

- RA 11232 — Revised Corporation Code (Sec. 162: penalties)
- SEC MC-028-2020 — Beneficial ownership reporting requirements
- SEC MC-019-2016 — Penalty schedule for non-compliance
- SEC General Information Sheet Rules
- ECIP (Early Compliance Incentive Program) — SEC amnesty/reduced penalty program

---

## Future: Concierge / Referral Layer

Post-launch, once free tier traffic validates demand:
- Connect users with vetted corporate secretaries and law firms
- Referral fee model
- Start with curated directory, not open marketplace
