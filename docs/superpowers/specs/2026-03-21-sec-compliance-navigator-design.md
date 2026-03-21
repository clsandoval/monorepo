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

### Three User States

The app has three user states, not two:

1. **Anonymous** — no account. Can use the wizard and see full penalty computation.
2. **Signed-in (free)** — free signup. Unlocks remediation content (ECIP comparison, guides, checklists, basic doc gen). This is the MVP conversion moment.
3. **Pro (paid, post-MVP)** — subscription. Multi-corp dashboard, branded PDF reports, batch upload, credits system.

### Anonymous → Signed-in Free Flow (Small Business Owner)

1. Land on homepage → "Is your corporation in trouble with the SEC?"
2. Start wizard (no signup required):
   - Corporate type (stock / non-stock / OPC)
   - Date of incorporation
   - Which annual reports have you filed? (GIS, AFS, BO — checklist per year, pre-populated from incorporation date to present)
   - Have you received a suspension or revocation order?
3. Results page (anonymous):
   - Compliance status badge (Active / Delinquent / Suspended / Revoked)
   - Itemized penalty table by year and report type
   - Total penalties owed
4. CTA: "Want to know how to fix this?" → **free signup gate** (email + password or Google OAuth)
5. Post-signup (free tier) — remediation flow:
   - ECIP vs. reinstatement comparison with cost breakdown
   - Step-by-step remediation guide (static content per compliance status — not dynamically generated)
   - Required documents checklist
   - Basic document generation (ECIP application, cover letter — simple template fill, HTML/PDF output)

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

**Penalty schedule schema** (to be populated from SEC MC-019-2016 and RA 11232 Sec. 162 during implementation):

```
penalty_schedule:
  - corp_type: "stock" | "non_stock" | "opc"
    report_type: "GIS" | "AFS" | "BO"
    year_of_delinquency: number  # years overdue (e.g., missed 2020 GIS in 2026 = 6)
    penalty_amount: number       # in PHP
    effective_from: date         # when this rate took effect (for regime changes)
    effective_until: date | null # null = current
    notes: string | null         # e.g., "per SEC MC-019-2016 Sec. 3(a)"
```

**Note:** Actual penalty amounts must be extracted from SEC circulars as a research task before implementation. The schema above defines the shape; the data population is a prerequisite to building the engine.

### ECIP Eligibility & Availability

ECIP (Early Compliance Incentive Program) is a **periodic SEC amnesty program** — it is not always open. The tool must handle this:

- **ECIP availability** is a configurable flag with date range (`ecip_active_from`, `ecip_active_until`). When ECIP is not active, the tool still shows full penalty computation but the ECIP comparison section says "No amnesty program is currently active" instead of showing a comparison.
- **ECIP eligibility rules** (to be confirmed from SEC circulars during implementation): generally, suspended corporations that have not been revoked are eligible. Revoked corporations must petition for revival first. The eligibility logic should be a configurable rule set, not hardcoded, since SEC may change criteria per program cycle.

### Pre-2019 Corporations

Corporations incorporated before RA 11232 (effective Feb 23, 2019) were governed by BP 68 (old Corporation Code). The penalty regime may differ for years of delinquency that fall before vs. after the transition. The penalty schedule data table handles this via `effective_from`/`effective_until` date ranges — the computation engine applies the penalty rate that was in effect for each year of delinquency.

### Legal Disclaimer

All computation results pages must display a prominent disclaimer: **"This is an estimate based on publicly available SEC penalty schedules. It is not legal advice. Consult a lawyer or corporate secretary for your specific situation."** This affects results page UI layout — the disclaimer must be visible without scrolling, not buried in a footer.

### BO Report Applicability

Beneficial Ownership reports are required from 2022 onward per SEC MC-028-2020. All corporation types (stock, non-stock, OPC) must file. The expected-filings generator includes BO reports starting from the later of: incorporation year or 2022.

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

### Feature Split by Tier

| Feature | Anonymous | Free (signed in) | Pro (paid, post-MVP) |
|---|---|---|---|
| Wizard + penalty computation | ✅ | ✅ | ✅ |
| Compliance status | ✅ | ✅ | ✅ |
| Itemized penalty breakdown | ✅ | ✅ | ✅ |
| ECIP vs. reinstatement comparison | ❌ | ✅ | ✅ |
| Remediation guide + checklist | ❌ | ✅ | ✅ |
| Basic document generation (template fill) | ❌ | ✅ | ✅ |
| Multi-corporation dashboard | ❌ | ❌ | ✅ |
| Branded client-facing PDF reports | ❌ | ❌ | ✅ (credits) |
| Batch CSV upload | ❌ | ❌ | ✅ |
| Document upload pre-fill | ❌ | ❌ | ✅ |

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
- **Database:** Postgres (see Data Model below)
- **File storage:** S3-compatible for uploaded documents (deferred)
- **OCR:** Google Cloud Vision or similar with LLM parsing layer (deferred)
- **PDF generation:** MVP uses simple HTML-to-PDF for basic doc gen (ECIP application, cover letter). Branded puppeteer-based PDF reports are deferred to Pro tier.
- **Deployment:** Vercel or similar for Next.js frontend, separate API service for computation + PDF gen

### API Boundary

For MVP, the computation engine is an **in-process module** called from Next.js API routes / server actions. No separate service. The engine is structured as a pure-function library so it can be extracted into a standalone service later when Pro tier needs it, but at MVP there's no reason to add deployment complexity.

### Data Model

```
users
  - id, email, name, auth_provider, created_at

corporations
  - id, user_id (nullable — see anonymous persistence note below)
  - corp_type (stock | non_stock | opc)
  - registration_date, sec_registration_number (optional)
  - suspension_date (nullable), revocation_date (nullable)

filing_records
  - id, corporation_id
  - report_type (GIS | AFS | BO)
  - year
  - filed (boolean)

computations
  - id, corporation_id, computed_at
  - result_json (full penalty breakdown, status, ECIP comparison)
  - One corporation can have multiple computations (recompute after updating filings).

Anonymous Persistence: Anonymous computations are **ephemeral** — computed on-the-fly,
held in client state (React state / URL params), not persisted to DB. When an anonymous
user signs up at the remediation gate, the current computation inputs are saved to their
new account and the computation is persisted. No tokens, no local storage, no DB rows
for anonymous users.

penalty_schedule (config table)
  - id, corp_type, report_type, year_of_delinquency
  - penalty_amount, effective_from, effective_until, notes

ecip_config
  - id, active_from, active_until, eligibility_rules_json, fee_schedule_json
```

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
