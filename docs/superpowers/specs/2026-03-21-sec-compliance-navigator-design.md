# SEC Compliance Navigator — Design Spec

**Date:** 2026-03-21
**Status:** Approved
**Domain:** E1 — SEC Compliance Navigator & Penalty Engine
**Score:** 4.75 (ranked #1 in ph-compliance-moats-reverse)

---

## Problem

117,885+ Philippine corporations were suspended in a single SEC batch order (Feb 2024). 100K-200K are in various stages of non-compliance at any time. These companies pay ₱50K-₱300K to law firms just to figure out where they stand and how to fix it. The computation is purely mechanical — SEC MC No. 6, Series of 2024 specifies the penalty schedule — but zero self-service tools exist.

## Product

A standalone web app that tells Philippine corporations their SEC compliance status and accumulated penalties, then guides them through remediation.

**Separate product from TaxKlaro (freelance tax) and Inheritance (estate tax).** Own domain, own brand, own deploy.

---

## User Flows

### Three User States

1. **Anonymous** — no account. Can use the wizard and see full penalty computation.
2. **Signed-in (free)** — free signup. Unlocks remediation content (reinstatement comparison, guides, checklists, basic doc gen). This is the MVP conversion moment.
3. **Pro (paid, post-MVP)** — subscription. Multi-corp dashboard, branded PDF reports, batch upload, credits system.

### Anonymous → Signed-in Free Flow (Small Business Owner)

1. Land on homepage → "Is your corporation in trouble with the SEC?"
2. Start wizard (no signup required):
   - Corporation domicile (domestic / foreign)
   - Corporate type (stock / non-stock / OPC — OPC only for domestic)
   - Date of incorporation
   - Retained earnings / fund balance bracket (7 tiers — see penalty schedule below)
   - Which annual reports have you filed? (GIS, AFS, BO — checklist per year, pre-populated from incorporation date to present)
   - Have you received a suspension or revocation order?
3. Results page (anonymous):
   - Compliance status badge (Active / Delinquent / Suspended / Revoked)
   - Itemized penalty table by year and report type, with offense number escalation
   - Monthly surcharge accumulation
   - Total penalties owed
   - Delinquency/revocation risk flag (3 missed filings in 5 years = delinquent; 6th offense = revocation)
4. CTA: "Want to know how to fix this?" → **free signup gate** (email + password or Google OAuth)
5. Post-signup (free tier) — remediation flow:
   - Reinstatement cost estimate (petition fee ₱3,060 + accumulated penalties + publication cost + estimated professional fees ₱30K-100K+)
   - Amnesty program comparison (if any active — currently none as of 2026)
   - Step-by-step remediation guide (static content per compliance status)
   - Required documents checklist
   - Basic document generation (petition cover letter — simple template fill, HTML/PDF output)

### Pro Tier — Corporate Secretaries / Law Firms (Post-MVP)

1. Sign up → multi-corporation dashboard
2. Add corporations via wizard or batch CSV upload
3. Dashboard: all corps sorted by severity, upcoming deadlines, penalty totals
4. Per-corporation: full penalty breakdown + generate branded client-facing PDF report
5. Hybrid billing: base subscription + credits for additional corps/reports above threshold

---

## Computation Engine

### Inputs
- Corporation domicile (domestic / foreign)
- Corporate type (stock / non-stock / OPC)
- SEC registration date
- Retained earnings bracket (or fund balance bracket for non-stock)
- List of filed reports per year (GIS, AFS, BO)
- Suspension/revocation order date (if any)

### Computation Steps
1. Generate expected filing timeline — from incorporation year to present:
   - GIS: annually, all corp types, all years
   - AFS: annually, all corp types, all years
   - BO: from 2019 onward (MC No. 17, s. 2018 first required BO in GIS; current regime: MC No. 15, s. 2025 effective Jan 1, 2026). All corp types.
2. Diff expected vs. actual filings → list of missed filings
3. Per missed filing, determine:
   - **Late filing vs. non-filing**: late = submitted after deadline but within 1 year; non-filing = beyond 1 year
   - **Offense number**: count of prior offenses for the same report type (1st through 5th)
   - **Base penalty**: lookup from penalty schedule using (domicile, corp_type, report_type, late_or_nonfiling, RE_bracket, offense_number)
   - **Monthly surcharge**: ₱1,000/month (or ₱500/month for negative RE/fund balance and capital deficiency) for continuing violations beyond deadline
4. Accumulate total penalties across all missed filings
5. Add BO-specific penalties if applicable (₱1,000/day late under MC 10 s. 2022, capped at ₱2,000,000)
6. Determine compliance status:
   - **Active**: all reports filed
   - **Delinquent**: 3+ missed filings (consecutive or intermittent) within 5 years (RA 11232 Sec. 177)
   - **Suspended**: SEC suspension order received
   - **Revoked**: SEC revocation order received (6th offense = grounds for revocation + 100% surcharge)
7. If any amnesty program is active (configurable): compute amnesty settlement amount
8. Compute reinstatement cost estimate:
   - Petition fee: ₱3,060
   - Accumulated penalties (from step 4)
   - Newspaper publication: ₱3,000-₱5,000 estimate
   - Professional fees estimate: ₱30,000-₱100,000+ (shown as range)

### Outputs
- Compliance status with explanation and risk level
- Table: year × report type → filed/missed → late or non-filing → offense number → penalty amount + surcharge
- Total accumulated penalties
- Delinquency/revocation risk assessment
- Amnesty program comparison (if any active — gated behind signup)
- Reinstatement cost estimate (gated behind signup)
- Remediation checklist with generated documents (gated behind signup)

### Penalty Schedule Data

**Source:** SEC MC No. 6, Series of 2024 (effective April 1, 2024) — first update in 22 years.

Penalties depend on 4 dimensions: domicile+corp_type, report type (late vs. non-filing), retained earnings/fund balance bracket, and offense number. Plus a monthly continuing violation surcharge.

#### Domestic Stock & OPC — Late Filing (GIS/AFS)

| Retained Earnings | 1st | 2nd | 3rd | 4th | 5th | Monthly Surcharge |
|---|---|---|---|---|---|---|
| Capital Deficiency | ₱5,000 | ₱6,000 | ₱7,000 | ₱8,000 | ₱9,000 | — |
| Negative RE | ₱5,000 | ₱6,000 | ₱7,000 | ₱8,000 | ₱9,000 | +₱500/mo |
| ₱0-₱100K | ₱5,000 | ₱6,000 | ₱7,000 | ₱8,000 | ₱9,000 | +₱1,000/mo |
| ₱100K-₱500K | ₱10,000 | ₱12,000 | ₱14,000 | ₱16,000 | ₱18,000 | +₱1,000/mo |
| ₱500K-₱5M | ₱15,000 | ₱18,000 | ₱21,000 | ₱24,000 | ₱27,000 | +₱1,000/mo |
| ₱5M-₱10M | ₱20,000 | ₱24,000 | ₱28,000 | ₱32,000 | ₱36,000 | +₱1,000/mo |
| Above ₱10M | ₱25,000 | ₱30,000 | ₱35,000 | ₱40,000 | ₱45,000 | +₱1,000/mo |

#### Domestic Stock & OPC — Non-Filing (GIS/AFS, beyond 1 year)

| Retained Earnings | 1st | 2nd | 3rd | 4th | 5th | Monthly Surcharge |
|---|---|---|---|---|---|---|
| Capital Deficiency | ₱10,000 | ₱12,000 | ₱14,000 | ₱16,000 | ₱18,000 | — |
| Negative RE | ₱10,000 | ₱12,000 | ₱14,000 | ₱16,000 | ₱18,000 | +₱500/mo |
| ₱0-₱100K | ₱10,000 | ₱12,000 | ₱14,000 | ₱16,000 | ₱18,000 | +₱1,000/mo |
| ₱100K-₱500K | ₱15,000 | ₱18,000 | ₱21,000 | ₱24,000 | ₱27,000 | +₱1,000/mo |
| ₱500K-₱5M | ₱20,000 | ₱24,000 | ₱28,000 | ₱32,000 | ₱36,000 | +₱1,000/mo |
| ₱5M-₱10M | ₱25,000 | ₱30,000 | ₱35,000 | ₱40,000 | ₱45,000 | +₱1,000/mo |
| Above ₱10M | ₱30,000 | ₱36,000 | ₱42,000 | ₱48,000 | ₱54,000 | +₱1,000/mo |

#### Domestic Non-Stock — Late Filing (GIS/AFS)

| Fund Balance | 1st | 2nd | 3rd | 4th | 5th | Monthly Surcharge |
|---|---|---|---|---|---|---|
| Negative | ₱5,000 | ₱6,000 | ₱7,000 | ₱8,000 | ₱9,000 | +₱500/mo |
| ₱0-₱100K | ₱5,000 | ₱6,000 | ₱7,000 | ₱8,000 | ₱9,000 | +₱1,000/mo |
| ₱100K-₱500K | ₱7,500 | ₱9,000 | ₱10,500 | ₱12,000 | ₱13,500 | +₱1,000/mo |
| ₱500K-₱5M | ₱10,000 | ₱12,000 | ₱14,000 | ₱16,000 | ₱18,000 | +₱1,000/mo |
| ₱5M-₱10M | ₱12,500 | ₱15,000 | ₱17,500 | ₱20,000 | ₱22,500 | +₱1,000/mo |
| Above ₱10M | ₱15,000 | ₱18,000 | ₱21,000 | ₱24,000 | ₱27,000 | +₱1,000/mo |

#### Domestic Non-Stock — Non-Filing (GIS/AFS, beyond 1 year)

| Fund Balance | 1st | 2nd | 3rd | 4th | 5th | Monthly Surcharge |
|---|---|---|---|---|---|---|
| Negative | ₱10,000 | ₱12,000 | ₱14,000 | ₱16,000 | ₱18,000 | +₱500/mo |
| ₱0-₱100K | ₱10,000 | ₱12,000 | ₱14,000 | ₱16,000 | ₱18,000 | +₱1,000/mo |
| ₱100K-₱500K | ₱12,500 | ₱15,000 | ₱17,500 | ₱20,000 | ₱22,500 | +₱1,000/mo |
| ₱500K-₱5M | ₱15,000 | ₱18,000 | ₱21,000 | ₱24,000 | ₱27,000 | +₱1,000/mo |
| ₱5M-₱10M | ₱17,500 | ₱21,000 | ₱24,500 | ₱28,000 | ₱31,500 | +₱1,000/mo |
| Above ₱10M | ₱20,000 | ₱24,000 | ₱28,000 | ₱32,000 | ₱36,000 | +₱1,000/mo |

#### Foreign Corporations

Foreign stock and non-stock corporations have **higher penalty rates** (₱10,000-₱90,000 range). Full tables to be extracted from MC No. 6 s. 2024 during implementation — same schema, different amounts.

#### MC 28 Non-Compliance (Contact Registration)

Flat ₱20,000 penalty for non-compliance with SEC MC No. 28, s. 2020 (email/contact registration).

#### BO-Specific Penalties (MC No. 10, s. 2022 / MC No. 15, s. 2025)

- Late submission of BO declaration: ₱1,000/day, capped at ₱2,000,000
- False BO declaration by corporation: ₱2,000,000 + involuntary dissolution
- False BO declaration by directors/officers: ₱200,000 + 5-year disqualification
- Under 2026 rules (MC 15, s. 2025): ₱50,000-₱1,000,000 depending on frequency

#### 6th Offense / Revocation

A 6th offense = grounds for revocation of Certificate of Registration. Monetary fine = 5th offense penalty + **100% surcharge** on total assessed fines.

#### Old Regime (pre-April 1, 2024)

For penalties assessed before April 1, 2024, the old rates under the previous scale of fines apply:
- Stock: ₱1,000-₱10,000 per report per year
- Non-stock: ₱500-₱5,000 per report per year

The penalty schedule data table handles this via `effective_from`/`effective_until` date ranges.

### Penalty Schedule Schema

```
penalty_schedule:
  - domicile: "domestic" | "foreign"
    corp_type: "stock" | "non_stock" | "opc"
    report_type: "GIS" | "AFS"
    violation_type: "late_filing" | "non_filing"
    re_bracket: "capital_deficiency" | "negative" | "0_100k" | "100k_500k" | "500k_5m" | "5m_10m" | "above_10m"
    offense_number: 1-5
    penalty_amount: number       # in PHP
    monthly_surcharge: number    # in PHP (0, 500, or 1000)
    effective_from: date         # 2024-04-01 for current regime
    effective_until: date | null # null = current

bo_penalty_schedule:
  - violation_type: "late_submission" | "false_declaration_corp" | "false_declaration_officer"
    daily_penalty: number | null    # ₱1,000/day for late submission
    cap: number | null              # ₱2,000,000
    flat_penalty: number | null     # for false declarations
    effective_from: date
    effective_until: date | null

mc28_penalty:
  - penalty_amount: 20000
    effective_from: 2024-04-01
    effective_until: null
```

### ECIP / Amnesty Programs

ECIP (Enhanced Compliance Incentive Plan) ran **September 2 - December 31, 2024 only** (SEC MC No. 13 and 17, Series of 2024). It is **not currently active**.

**ECIP fees when it was active:**
- Non-compliant/delinquent corporations: flat ₱20,000 to settle all unassessed/unpaid fines
- Suspended/revoked corporations: 50% of assessed fines + ₱3,060 petition fee

**ECIP eligibility (when active):**
- Eligible: all domestic stock and non-stock corporations that are non-compliant, delinquent, suspended, or revoked
- Excluded: PSE-listed companies, public companies, corporations with intra-corporate disputes, disputed GIS, expired corporate terms, entities under SRC Sec. 17.2

**Tool behavior:**
- Amnesty program availability is a configurable record with date range (`active_from`, `active_until`), fees, and eligibility rules
- When no amnesty is active: remediation flow shows only the standard reinstatement path
- When an amnesty is active: show side-by-side comparison (amnesty cost vs. standard reinstatement cost)

### Reinstatement Cost Estimate (Standard Path)

When no amnesty is active, the remediation flow shows:

| Cost Component | Amount |
|---|---|
| Petition to Lift Suspension/Revocation | ₱3,060 |
| Accumulated penalties (computed) | Varies (see penalty tables) |
| Newspaper publication | ₱3,000-₱5,000 (estimate) |
| BIR tax clearance | Varies |
| Professional fees (lawyer/corp sec) | ₱30,000-₱100,000+ (estimate range) |
| **Total estimate** | **Sum of above** |

**Required documents for reinstatement:**
- Verified Petition to Lift Order of Suspension/Revocation
- Secretary's Certificate (board resolution authorizing petition)
- Certificate of Incorporation
- All backlog GIS filings
- All backlog AFS filings
- MC 28 compliance (email/contact registration)
- Affidavit of non-operation or justification
- BIR tax clearance
- Proof of newspaper publication
- Certification of no intra-corporate controversy

### Pre-2019 Corporations

Corporations incorporated under BP 68 (old Corporation Code, before RA 11232 effective Feb 23, 2019) have the same filing requirements. The penalty difference is only in the rates: pre-April 2024 penalties were ₱1,000-₱10,000 (stock) or ₱500-₱5,000 (non-stock). The penalty schedule handles this via `effective_from`/`effective_until` date ranges.

Key difference from RA 11232: BP 68 Sec. 144 allowed **imprisonment** (30 days to 5 years) for violations. RA 11232 eliminated imprisonment — fines only. This is informational only; the computation engine deals with administrative fines, not criminal penalties.

### BO Report Timeline

BO disclosure requirements evolved through multiple circulars:
- **2019**: MC No. 17, s. 2018 first required BO info in GIS (effective July 31, 2019)
- **2020**: MC No. 30, s. 2020 extended to foreign corporations
- **2021**: MC No. 01, s. 2021 broadened scope
- **2023**: MC No. 10, s. 2022 added specific penalty amounts (effective 2023)
- **2026**: MC No. 15, s. 2025 — current rules ("Beneficial Ownership Disclosure Rules of 2026", effective Jan 1, 2026). Filing through HARBOR system.

All corporation types must file. No exemptions. Changes in BO must be reported within 7 days.

The expected-filings generator includes BO reports starting from the later of: incorporation year or 2019.

### Legal Disclaimer

All computation results pages must display a prominent disclaimer: **"This is an estimate based on publicly available SEC penalty schedules. It is not legal advice. Consult a lawyer or corporate secretary for your specific situation."** This affects results page UI layout — the disclaimer must be visible without scrolling, not buried in a footer.

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
| Delinquency/revocation risk flag | ✅ | ✅ | ✅ |
| Reinstatement cost estimate | ❌ | ✅ | ✅ |
| Amnesty comparison (when active) | ❌ | ✅ | ✅ |
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
- **PDF generation:** MVP uses simple HTML-to-PDF for basic doc gen (petition cover letter). Branded puppeteer-based PDF reports are deferred to Pro tier.
- **Deployment:** Vercel or similar for Next.js frontend, separate API service for computation + PDF gen

### API Boundary

For MVP, the computation engine is an **in-process module** called from Next.js API routes / server actions. No separate service. The engine is structured as a pure-function library so it can be extracted into a standalone service later when Pro tier needs it, but at MVP there's no reason to add deployment complexity.

### Data Model

```
users
  - id, email, name, auth_provider, created_at

corporations
  - id, user_id (nullable — see anonymous persistence note below)
  - domicile (domestic | foreign)
  - corp_type (stock | non_stock | opc)
  - re_bracket (retained earnings / fund balance bracket)
  - registration_date, sec_registration_number (optional)
  - suspension_date (nullable), revocation_date (nullable)

filing_records
  - id, corporation_id
  - report_type (GIS | AFS | BO)
  - year
  - filed (boolean)

computations
  - id, corporation_id, computed_at
  - result_json (full penalty breakdown, status, reinstatement estimate)
  - total_penalty (numeric — for easy querying/sorting in Pro dashboard)
  - One corporation can have multiple computations (recompute after updating filings).

Anonymous Persistence: Anonymous computations are **ephemeral** — computed on-the-fly,
held in client state (React state / URL params), not persisted to DB. When an anonymous
user signs up at the remediation gate, the current computation inputs are saved to their
new account and the computation is persisted. No tokens, no local storage, no DB rows
for anonymous users.

penalty_schedule (config table)
  - id, domicile, corp_type, report_type, violation_type
  - re_bracket, offense_number
  - penalty_amount, monthly_surcharge
  - effective_from, effective_until, notes

bo_penalty_schedule (config table)
  - id, violation_type, daily_penalty, cap, flat_penalty
  - effective_from, effective_until

mc28_penalty (config table)
  - id, penalty_amount, effective_from, effective_until

amnesty_config
  - id, program_name, active_from, active_until
  - eligibility_rules_json, fee_schedule_json
  - excluded_categories (text array: "pse_listed", "public_company", "intra_corporate_dispute", etc.)
```

---

## MVP Scope

### In
- Wizard flow (no signup required): domicile, corp type, incorporation date, RE bracket, filing checklist, suspension status → penalty computation + compliance status
- Signup gate at remediation step
- Remediation: reinstatement cost estimate, step-by-step guide, required documents checklist
- Basic document generation (petition cover letter — template fill)
- Penalty schedule as configurable data table (pre-populated with MC 6 s. 2024 rates)
- Amnesty program config (currently empty — no active program)

### Deferred
- Document upload / OCR pre-fill
- Pro tier dashboard (multi-corp)
- Branded PDF reports
- Batch CSV upload
- Concierge/referral marketplace
- Subscription billing infrastructure
- Foreign corporation penalty tables (domestic first)

---

## Governing Law & References

### Primary (Penalty Computation)
- **SEC MC No. 6, Series of 2024** — Current penalty schedule for late/non-filing of AFS, GIS, MC 28 non-compliance. Effective April 1, 2024. First update in 22 years. ([SEC](https://www.sec.gov.ph/mc-2024/sec-mc-no-06-series-of-2024updated-fines-and-penalties-on-the-late-and-non-submission-of-audited-financial-statements-afs-general-information-sheet/))
- **RA 11232** — Revised Corporation Code. Sec. 177: delinquent status (3 missed filings in 5 years). Sec. 179(o)(p): SEC's penalty-setting authority. Title XVI (Secs. 159-170): criminal fines for substantive offenses. ([LawPhil](https://lawphil.net/statutes/repacts/ra2019/ra_11232_2019.html))

### Beneficial Ownership
- **SEC MC No. 15, Series of 2025** — "Beneficial Ownership Disclosure Rules of 2026." Current BO rules, effective Jan 1, 2026. Supersedes all prior BO circulars.
- **SEC MC No. 10, Series of 2022** — BO penalty amounts (₱1,000/day late, ₱2M cap, ₱2M for false declaration + dissolution)
- **SEC MC No. 17, Series of 2018** — First required BO info in GIS (effective July 2019)

### ECIP (Expired)
- **SEC MC No. 13, Series of 2024** — Established ECIP (Sep 2-Nov 30, 2024)
- **SEC MC No. 17, Series of 2024** — Extended ECIP to Dec 31, 2024

### Reinstatement
- **SEC MC No. 19, Series of 2023** — Guidelines on delinquent status declaration and revocation under Secs. 21 and 177 of RCC
- **SEC MC No. 23, Series of 2019** — Guidelines on revival of expired corporations (Sec. 11 of RCC)
- **SEC MC No. 3, Series of 2017** — Consolidated schedule of fees (petition fee: ₱3,060)

### Contact Registration
- **SEC MC No. 28, Series of 2020** — Requires all registered entities to submit official email/mobile to SEC. Non-compliance penalty: ₱20,000.

### Old Regime (for historical penalty computation)
- **BP 68** — Old Corporation Code. Sec. 144: catch-all penalty ₱1,000-₱10,000 + 30 days-5 years imprisonment. Superseded by RA 11232.

---

## Future: Concierge / Referral Layer

Post-launch, once free tier traffic validates demand:
- Connect users with vetted corporate secretaries and law firms
- Referral fee model
- Start with curated directory, not open marketplace
