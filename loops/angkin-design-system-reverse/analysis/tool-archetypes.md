# Tool Archetypes — Angkin Suite (148 Tools)

**Produced by:** Wave 1 — Aspect 11: Catalog 148 Tools by UI Archetype
**Date:** 2026-03-10
**Sources:** `loops/ph-compliance-moats-reverse/analysis/master-domain-list.md` (41 tools) + `loops/ph-regulatory-atlas-reverse/analysis/master-domain-list.md` (107 tools)

---

## Summary

| Archetype | Count | % of Suite | Primary Design Challenge |
|-----------|-------|-----------|--------------------------|
| **Single-form calculator** | **64** | **43%** | Input → compute → clear result display. Highest frequency — must be the most polished archetype. |
| **Decision tree** | **22** | **15%** | Branching logic, eligibility gates, binary outputs. Must not feel like a government form. |
| **Multi-step wizard** | **18** | **12%** | Multi-component computation, sequential inputs. Must show progress and preserve state. |
| **Comparison engine** | **14** | **9%** | NPV decision, option A vs. B, irreversible elections. Must clearly highlight the winner. |
| **Timeline/calendar tracker** | **11** | **7%** | Deadline management, recurring compliance. Must show urgency without causing anxiety. |
| **Dashboard/tracker** | **10** | **7%** | Ongoing monitoring, portfolio view, multi-item tracking. Closest to a "power tool." |
| **Document generator** | **5** | **3%** | Checklist/document output. Compute → generate printable or shareable artifact. |
| **Lookup table** | **4** | **3%** | Search/filter-based result, no computation. Must make dense data scannable. |
| **TOTAL** | **148** | **100%** | |

---

## Archetype 1: Single-Form Calculator (64 tools — 43%)

**Definition:** User inputs a small set of facts → presses "Compute" → sees a clear peso-denominated result. Single-step, no branching, no multi-screen flow. The computation may be complex internally (graduated tables, compounding penalties, formula stacking) but the UX is simple: enter inputs, see output.

**This is the core archetype.** Nearly half the suite is single-form calculators. The design system must make this feel fast, trustworthy, and satisfying — especially the "result moment" (what happens visually when the user hits Compute and sees their number).

### Tools in this archetype

**From ph-compliance-moats-reverse:**
- A3. Capital Gains Tax — Real Property (CGT 6%)
- A4. Capital Gains Tax — Unlisted Shares + DST
- A5. Individual Income Tax — Compensation Earners
- B2. BIR Penalty and Interest Calculator
- C1. Donor's Tax Calculator
- C4. Documentary Stamp Tax Engine
- D1. Multi-Factor Payroll Premium Computation
- D2. 13th Month Pay Computation
- D4. **Retirement Pay Calculator (RA 7641)** ← _mockup subject for all 10 design options_
- D5. Separation Pay Calculator
- D7. Mandatory Government Contributions Calculator
- E2. SEC Corporate Lifecycle Fee Engine
- E5. Capital Increase / Decrease Filing Engine
- E6. OSH Staffing Requirements & Penalty Engine
- F1. Real Property Tax + SEF Calculator
- F2. Local Business Tax + Business Permit Calculator
- F3. RPVARA Tax Amnesty Calculator
- F4. Maceda Law Cash Surrender Value Calculator
- G2. Prescriptive Period Deadline Calculator
- G4. Loss of Earning Capacity Calculator
- G5. Life Insurance CSV Verification

**From ph-regulatory-atlas-reverse:**
- A-SSS-2 SSS Maternity Benefit
- A-SSS-3 SSS Contribution Computation & Remittance _(score: 4.55, highest in suite)_
- A-SSS-4 SSS Sickness Benefit
- A-SSS-5 SSS Death Benefit / Survivor's Pension
- A-SSS-6 SSS Unemployment Benefit
- A-SSS-7 SSS Disability Benefit
- B-PHI-2 PhilHealth Premium Contribution Computation
- C-HDMF-2 Pag-IBIG MPL & Calamity Loan Computation
- C-HDMF-3 Pag-IBIG Mandatory Savings Contribution
- C-HDMF-5 Pag-IBIG TAV Accumulation & Refund
- D-GSIS-4 GSIS Contribution Computation
- D-GSIS-5 GSIS Survivorship & Death Benefit
- D-GSIS-6 GSIS Disability Benefit
- E-OFW-6 OWWA Rebate Eligibility & Amount Calculator
- F-BOC-1 BOC Landed Cost Calculator _(score: 4.20)_
- F-BOC-3 Automobile Excise Tax Transparency Calculator
- F-BOC-5 Petroleum/Alcohol/Tobacco Excise
- G-LTO-1 MVUC + Total Annual Registration Cost Calculator _(score: 4.40)_
- G-LTO-2 LTO Late Registration Penalty Calculator
- H-PRC-2 PRC License Renewal Total Cost Calculator
- H-PRC-4 Board Exam Application Eligibility & Fee Calculator
- I-MAR-1 Total STCW Certification Cost Calculator _(score: 4.10)_
- I-MAR-4 Annual Tonnage Fee Calculator
- J-CAP-2 Aircraft Airworthiness & Registration Fee Calculator
- K-NTC-1 Spectrum User Fee Calculator
- M-FDA-1 FDA CPR + LTO Total Registration Cost Calculator
- M-FDA-4 Late Renewal Surcharge & 120-Day Cliff Calculator
- N-BFP-3 FSIC Annual Fee Pre-Calculator
- N-BFP-4 FSEC Fee Calculator
- O-LRA-4 LRA Registration Fee & Annotation Fee Calculator
- O-DAR-1 CARP Just Compensation Estimator
- O-DAR-2 CARP Coverage & Retention Area Calculator
- O-DAR-3 ARB Amortization Schedule Generator
- O-DHSUD-2 CR/LTS Processing Fee + Performance Bond Calculator
- Q-ERC-1 Electricity Bill Verification & Total Cost Estimator
- Q-ERC-4 FIT Revenue & Annual Rate Adjustment Calculator
- R-DTI-2 LGU Local Business Tax Estimator
- R-DTI-4 DTI Business Name Registration Fee + Renewal Tracker
- R-CDA-2 CDA Net Surplus Distribution Compliance Checker
- R-PCAB-1 PCAB ACP Score Calculator & Category Eligibility Screener
- R-PCAB-4 Joint Venture Special License Fee & Category Estimator
- S-BSP-1 Pawnshop Loan Cost Transparency Tool
- S-BSP-4 BSP Annual Supervision Fee Calculator

### UI Design Requirements for This Archetype
- **Input treatment:** Labeled form fields with Peso sign prefix (₱), number formatting as-you-type
- **Compute trigger:** Single prominent CTA button — the "Calculate" moment must feel decisive
- **Result display:** THE key design moment. Number must pop. Consider: large type, color shift, animation on reveal
- **Common input types:** Currency amounts, dates, integer counts (employees, years), radio buttons (salary type, employment status)
- **Common output types:** Single peso amount, percentage, breakdown table, multiple related figures
- **Edge cases to handle:** Validation states (negative numbers, impossible dates), zero-result state, partial inputs

---

## Archetype 2: Decision Tree (22 tools — 15%)

**Definition:** User answers a series of yes/no or multiple-choice questions → system navigates branching logic → produces a binary outcome (eligible/not eligible, legal/illegal, required/not required) or a classification result. No complex arithmetic on the surface; the complexity is the logic tree.

**Design challenge:** Decision trees feel like bureaucratic questionnaires if done wrong. Done right (like a smart intake form), they feel like having a knowledgeable friend walk you through the rules.

### Tools in this archetype

**From ph-compliance-moats-reverse:**
- B1. BIR Form Selection Navigator (which form do I file?)
- E1. SEC Compliance Navigator & Penalty Engine (what is my compliance status?)
- E4. AFS Filing Threshold & Requirement Engine (do I need a full audit?)

**From ph-regulatory-atlas-reverse:**
- B-PHI-3 PhilHealth Benefit Eligibility Determination
- D-GSIS-2 GSIS Legacy Law Selection _(irreversible election; highest stakes decision tree)_
- E-OFW-1 OFW Placement Fee Legality Checker _(binary: legal/illegal)_
- E-OFW-3 OWWA Benefits Eligibility Navigator
- F-BOC-2 BOC PCA Compliance Checker & PDP Advisor
- I-MAR-2 STCW Certification Pathway & Sea Service Eligibility Calculator
- J-CAP-1 RPAS/Drone Compliance Suite
- K-NTC-3 NTC Type Acceptance/Approval Import Screener
- L-TES-3 TESDA Scholarship Eligibility & Benefit Calculator
- M-FDA-3 Product Classification & Regulatory Pathway Screener
- N-BFP-1 Fire Safety Equipment Requirements Screener _(score: 4.15)_
- P-IPO-4 Trademark Classification & Filing Cost Estimator
- Q-ERC-2 Lifeline Rate Eligibility & Savings Calculator
- R-CDA-1 CDA Tax Exemption Eligibility Checker
- R-PCAB-3 ARCC Project Eligibility Checker
- R-BOI-4 SIPP Activity Pre-Screener & BOI vs. PEZA Eligibility Checker
- S-BSP-3 OPS/EMI/VASP Capital Requirement & Classification Screener
- S-PGC-2 PAGCOR Gaming vs. Non-Gaming Income Tax Classifier
- T-NPC-4 Privacy Impact Assessment Trigger Screener

### UI Design Requirements for This Archetype
- **Flow pattern:** One question per screen (wizard style) OR progressive disclosure on single page
- **Question format:** Clear binary choices, radio buttons, never ambiguous multi-select
- **Progress indicator:** Show which step out of total, allow back navigation
- **Branch transparency:** Optional "show logic" mode for advanced users
- **Result:** Clear verdict (green/red/yellow), explain why, link to relevant next action (which other Angkin tool to use next)
- **Tone:** Conversational, never legalistic

---

## Archetype 3: Multi-Step Wizard (18 tools — 12%)

**Definition:** Multiple distinct input groups that build on each other. Steps may be sequential (step 1 must complete before step 2) or grouped into sections. Usually involves tracking multiple components that sum to a final result, or requires inputs to flow from one stage to the next.

**Design challenge:** Multi-step wizards risk abandonment at step 3+. Must communicate value early ("you're 2 inputs away from knowing your exact final pay") and save progress.

### Tools in this archetype

**From ph-compliance-moats-reverse:**
- B5. Quarterly Income Tax + Annual Reconciliation Engine _(quarterly build-up → annual settlement)_
- C2. VAT Computation Engine _(monthly tracking with carry-forward)_
- C5. Property Transfer Tax Bundler _(multi-agency, multi-tax, multi-valuation-base)_
- D3. Final Pay Computation _(unpaid wages + pro-rated 13th month + SIL + separation pay)_
- D9. SEnA Monetary Claims Calculator _(multiple claim types compound)_
- E3. HARBOR Beneficial Ownership Filing Wizard _(ownership tracing through corporate layers)_
- G1. Legal Interest Computation Engine _(multi-period: 12% pre-2013 + 6% post-2013 + finality layer)_
- G3. Marital Property Liquidation Engine _(ACP/CPG: asset classification → debt payment → return exclusives → split)_

**From ph-regulatory-atlas-reverse:**
- B-PHI-4 OFW PhilHealth Contribution Portability _(current status → continuity options → consequences)_
- C-HDMF-1 Pag-IBIG Housing Loan Eligibility & Amortization _(eligibility → LTV → interest → amortization schedule)_
- D-GSIS-3 GSIS Portability Totalization _(GSIS years + SSS years → pro-rata computation)_
- E-OFW-2 OFW Total Pre-Departure Cost Calculator _(OWWA + OFW Pass + PhilHealth + Pag-IBIG + NBI/PSA/passport)_
- G-LTO-3 Vehicle Transfer of Ownership Cost Estimator _(LTO fees + HPG + notarization + chattel release)_
- J-CAP-3 Pilot License Pathway Eligibility & Cost Calculator _(PPL → CPL → ATPL pathway)_
- L-TES-4 UTPRAS Institution Registration Navigator _(application → fee → compliance → penalty exposure)_
- O-LRA-2 ONETT Pipeline Calculator _(CGT + DST + LGU transfer tax + LRA registration fee)_
- R-DTI-3 New Business Startup Cost Navigator _(DTI + barangay + mayor's permit + BIR → total startup cost)_
- T-NPC-1 72-Hour Breach Notification Protocol _(harm assessment → countdown → notification content → DBNMS checklist)_

### UI Design Requirements for This Archetype
- **Step structure:** Named sections, not just "Step 1 of 5"
- **Progress persistence:** Save state between sections; show running subtotal as user progresses
- **Back navigation:** Non-destructive; re-edit any input without losing later inputs
- **Summary screen:** Before final computation, show all inputs for review
- **Result presentation:** Itemized breakdown (each component labeled) plus grand total
- **Mobile consideration:** Step-by-step maps well to mobile; one section per screen

---

## Archetype 4: Comparison Engine (14 tools — 9%)

**Definition:** User inputs a scenario → tool computes two or more alternative outcomes → presents them side-by-side → highlights the financially optimal choice. Often involves NPV analysis, break-even calculations, or irreversible elections with lifetime consequences.

**Design challenge:** The comparison must make the winner obvious without feeling like a sales pitch. Stakes are often high (pension election, tax regime choice, investment horizon). The user must feel informed, not pushed.

### Tools in this archetype

**From ph-compliance-moats-reverse:**
- A1. Individual Self-Employed Income Tax Optimizer _(8% flat vs. OSD vs. itemized)_
- A2. Corporate RCIT vs. MCIT Engine _(quarterly mandatory comparison)_
- D6. Back Wages Risk Assessment _(employer pre-termination risk vs. early settlement)_

**From ph-regulatory-atlas-reverse:**
- A-SSS-1 SSS Monthly Retirement Pension Option 1/2 NPV _(60× lump sum vs. pension; irreversible)_
- C-HDMF-4 Pag-IBIG MP2 Savings Growth Projection _(annual dividend vs. terminal payout)_
- D-GSIS-1 GSIS BMP Retirement Pension + Option 1/2 NPV _(18× cash + pension vs. 60× lump sum)_
- E-OFW-5 OWWA Scholarship Program Selector _(8 programs; EDSP vs. ODSP vs. SESP…)_
- F-BOC-4 FTA Rate Optimizer _(ATIGA/AKFTA/AIFTA vs. MFN rate differential)_
- H-PRC-3 CPD Seminar Cost Optimizer _(minimize 45-unit CPD cost; SDL cap optimization)_
- O-DHSUD-1 Balanced Housing Requirement Calculator _(4 compliance modes NPV comparison)_
- Q-ERC-3 Net Metering Credit & Solar Payback Calculator _(solar ROI vs. grid bill)_
- R-BOI-1 SCIT vs. EDR Election Analysis Tool _(irrevocable; Big 4 only; ₱200K–₱500K)_
- R-BOI-2 ITH Period Calculator + Tax Savings NPV _(Tier 1/2/3 × location → 4–7yr)_
- S-PGC-4 Junket Operator Revenue Model Comparator _(rolling chip vs. revenue share)_

### UI Design Requirements for This Archetype
- **Visual comparison:** Side-by-side cards or segmented display; label each option clearly (e.g., "Option 1: Lump Sum" vs. "Option 2: Monthly Pension")
- **Winner highlight:** Clear visual signal on the better option for the user's inputs; don't be neutral when one option is clearly superior
- **Sensitivity analysis:** Show how inputs change the outcome (e.g., "at what age does Option 2 break even?")
- **Irreversibility warning:** For pension elections, share transfer decisions — must flag irreversibility prominently
- **Philippine peso formatting:** ₱ amounts, large numbers use commas (₱1,234,567.89)
- **Result save/share:** User will want to show this to family or employer; shareable result card

---

## Archetype 5: Timeline/Calendar Tracker (11 tools — 7%)

**Definition:** Tool is centered on deadline management. User inputs key dates (registration date, fiscal year end, last payment date) → tool generates a compliance calendar with specific deadlines → shows what's due when, what's overdue, what's upcoming. May also compute penalties for missed deadlines.

**Design challenge:** Deadlines cause anxiety. This archetype must communicate urgency without alarming users who are already compliant. Color-coding (green/amber/red) is critical. Mobile push notifications are a key value-add.

### Tools in this archetype

**From ph-compliance-moats-reverse:**
- B3. Multi-Form Compliance Calendar Engine _(full annual BIR filing calendar)_

**From ph-regulatory-atlas-reverse:**
- G-LTO-4 Driver's License Cost & Timeline Calculator
- L-TES-1 NC/TESDA Certificate Expiry Tracker & Re-assessment Reminder
- N-BFP-2 FSIC Compliance Calendar + FSMR Tracker _(January 20 crunch; 1.2M+ businesses)_
- O-LRA-1 ONETT Deadline & Late Penalty Calculator _(30-day CGT + 5-day DST)_
- P-IPO-3 Patent Annuity Calendar & Cost Projector _(16-year escalating fee schedule)_
- R-DTI-1 Annual Business Compliance Calendar _(DTI + LGU + BIR + mandated benefits)_
- R-CDA-3 CDA Annual Compliance Calendar + Penalty Estimator
- R-PCAB-2 PCAB Renewal Compliance Calendar _(staggered by license number last digit)_
- S-BSP-2 BSP MSB/Pawnshop AMLA Compliance Calendar
- T-NPC-3 NPC Registration Eligibility Screener + Compliance Calendar

### UI Design Requirements for This Archetype
- **Timeline visualization:** Horizontal timeline or vertical calendar list; upcoming events sorted by due date
- **Status indicators:** Color-coded (green=done, amber=upcoming <30 days, red=overdue)
- **Penalty preview:** For any missed deadline, immediately show what the penalty would be (links to single-form calculator archetypes)
- **Export/print:** Calendar export or printable compliance checklist
- **Progressive disclosure:** Show summary at top ("3 items due this month"), drill into details
- **Recurring structure:** Most tools are annual cycles; design for the recurring mental model

---

## Archetype 6: Dashboard/Tracker (10 tools — 7%)

**Definition:** Ongoing monitoring of a portfolio of items, not a one-time computation. User maintains a persistent record (IP portfolio, CPD units, withholding tax certificates, product registrations). May include multiple single-form calculators embedded as sub-functions. Closest to a traditional SaaS "app."

**Design challenge:** Dashboards are for repeat users. Must have good empty state design (first-time use), table/list management, and bulk operations. Power users (accountants, IP lawyers) will have 50+ items.

### Tools in this archetype

**From ph-compliance-moats-reverse:**
- B4. Withholding Tax Agent Compliance Engine _(monthly 1601C/1601EQ/0619E tracking)_
- B6. BIR Certificate (2307/2316) Tracker and Generator _(tens of millions annually)_

**From ph-regulatory-atlas-reverse:**
- H-PRC-1 PRC CPD Compliance Eligibility & Unit Gap Calculator _(ongoing 3-year tracking)_
- K-NTC-2 Private Radio Fleet License Manager _(200K–500K stations)_
- M-FDA-2 Multi-Product Renewal Compliance Calendar _(10–500 CPR portfolios)_
- P-IPO-1 IP Portfolio Compliance Dashboard _(trademark DAU + renewal + patent annuity)_ _(score: 4.05)_
- P-IPO-2 Trademark Total Fee Calculator + DAU Tracker
- R-BOI-3 Annual GIE Compliance Tracker _(quarterly SCIT + employment commitment)_
- S-PGC-1 Casino AML/CTR Compliance Tracker
- S-PGC-3 PAGCOR GGR License Fee Dashboard

### UI Design Requirements for This Archetype
- **Data model:** Each user has a portfolio of N items; each item has its own status
- **Table view:** Sortable/filterable list of all tracked items; bulk status update
- **Alert system:** Proactive notifications for approaching deadlines
- **Entry flow:** "Add item" flow that walks through inputs; should not feel like a spreadsheet
- **Export:** CSV export for accountants and corporate secretaries
- **Single-item drill-down:** Click any item to see its detail, edit, or compute sub-calculations
- **Empty state:** First-time users need clear onboarding ("Start by adding your first trademark")
- **This archetype requires user accounts** — only archetype that mandates persistent state

---

## Archetype 7: Document Generator (5 tools — 3%)

**Definition:** Computation produces a document, checklist, or structured output rather than (or in addition to) a number. Output is meant to be printed, saved, or submitted. The "result" is a formatted artifact, not a single peso figure.

### Tools in this archetype

**From ph-compliance-moats-reverse:**
- B7. eBIRForms / eFPS Filing Automation Bridge _(auto-populate BIR electronic forms)_
- C3. VAT Refund Claims Engine _(input tax attribution schedule for BIR submission)_

**From ph-regulatory-atlas-reverse:**
- E-OFW-4 OFW Documentary Requirements Matrix Generator _(customized documentary checklist per worker type × destination × job)_
- I-MAR-3 COC/COP Revalidation Document Checklist Generator _(rank-specific MARINA checklist)_
- T-NPC-2 Annual Security Incident Report (ASIR) Filing Tool _(15-category classification form)_

### UI Design Requirements for This Archetype
- **Preview mode:** Show the document before downloading/printing
- **PDF/print output:** Professional formatting; must look authoritative
- **Checklist interaction:** Items should be checkable; user marks what they've gathered
- **Progress tracking:** "You have 7 of 12 documents" — motivational counting
- **Philippine regulatory branding:** Must look official enough to bring to a government agency
- **Share:** Email or WhatsApp the checklist (OFW tool will be heavily shared)

---

## Archetype 8: Lookup Table (4 tools — 3%)

**Definition:** No computation; user enters a search term or selects filters → tool returns a data record from a curated database. The "engineering moat" is maintaining the database, not the query logic.

### Tools in this archetype

**From ph-compliance-moats-reverse:**
- D8. Minimum Wage Compliance Checker _(region × sector × size → applicable daily rate)_

**From ph-regulatory-atlas-reverse:**
- B-PHI-1 PhilHealth Case Rate Benefit Application _(~9,000 fixed case rates — what does PhilHealth cover for this procedure?)_
- L-TES-2 TESDA Assessment Cost & Qualification Finder _(₱400–₱3,723 by qualification; only in PDFs)_
- O-LRA-3 BIR Zonal Value Lookup Tool _(gating input for all real property transfer computations)_

### UI Design Requirements for This Archetype
- **Search-first:** Prominent search box; typeahead suggestions
- **Filter panel:** Region, sector, classification, agency — context-appropriate facets
- **Result clarity:** One clear answer per search, not a list of 50 results to parse
- **No result state:** "No zonal value found for this address" → what to do next
- **Data freshness:** Show "last updated" date; zonal values change, minimum wages change
- **Related tools:** "Now that you know the zonal value, compute your CGT with [CGT Calculator]"

---

## Cross-Archetype Patterns

### Tool Chains: Many Tools Feed Other Tools

Several tools produce outputs that become inputs to other tools. This has major design implications — results should be copyable/transferable between tools.

```
BIR Zonal Value Lookup (lookup)
  → Capital Gains Tax Calculator (single-form)
    → Property Transfer Tax Bundler (multi-step)
      → ONETT Deadline Calculator (timeline)

SSS/PhilHealth/Pag-IBIG Contributions (single-form)
  → Final Pay Computation (multi-step)
    → 13th Month Pay Computation (single-form)
      → Retirement Pay Calculator (single-form)

Legal Interest Engine (multi-step)  [used by every domain with monetary claims]
  → Back Wages Risk Assessment (comparison)
  → SEnA Monetary Claims Calculator (multi-step)
  → Maceda Law CSV Calculator (single-form)
```

**Design implication:** The Angkin system needs "pass results to another tool" functionality. After computing retirement pay, the user should be able to pass the result directly into the Legal Interest Engine to compute interest on the underpaid amount.

### Emotional States by Archetype

| Archetype | Typical User Emotional State | Design Response |
|-----------|----------------------------|-----------------|
| Single-form calculator | Anxious, wants a number NOW | Fast, minimal friction, instant result |
| Decision tree | Confused, doesn't know the rules | Reassuring, explains why, no dead ends |
| Multi-step wizard | Overwhelmed by complexity | Progress visibility, partial saves, encourage |
| Comparison engine | High stakes, needs confidence | Clear winner, explain reasoning, warn on irreversibility |
| Timeline/calendar | Stressed about deadlines | Color-coded urgency, specific dates, penalty preview |
| Dashboard/tracker | Professional, efficiency-focused | Dense info, keyboard shortcuts, bulk ops |
| Document generator | Preparing for government visit | Official-looking output, completeness confidence |
| Lookup table | Looking up a fact | Speed, clear answer, data freshness signal |

---

## Frequency Distribution by Domain × Archetype

| Domain | Tools | Primary Archetype(s) |
|--------|-------|---------------------|
| Tax (BIR/NIRC) | 19 | Single-form (11), multi-step (3), decision tree (3), document gen (2) |
| Labor/Employment | 9 | Single-form (5), multi-step (2), comparison (1), lookup (1) |
| Social Insurance (SSS/PhilHealth/Pag-IBIG/GSIS) | 22 | Single-form (16), multi-step (3), comparison (3) |
| OFW/OWWA | 6 | Decision tree (2), multi-step (1), single-form (1), document gen (1), comparison (1) |
| Corporate/SEC | 6 | Single-form (3), decision tree (2), multi-step (1) |
| Property/Real Estate | 13 | Single-form (7), multi-step (2), timeline (2), lookup (1), comparison (1) |
| Business Registration | 15 | Single-form (5), timeline (3), comparison (2), decision tree (3), multi-step (1), dashboard (1) |
| Professional Licensing (PRC/TESDA/MARINA) | 12 | Single-form (4), decision tree (4), dashboard (2), document gen (1), timeline (1) |
| Customs/Trade/LTO | 9 | Single-form (6), decision tree (1), comparison (1), timeline (1) |
| Intellectual Property | 4 | Dashboard (2), timeline (1), decision tree (1) |
| Fire/Data Privacy/Telecom | 11 | Decision tree (3), timeline (3), single-form (2), dashboard (1), multi-step (1), document gen (1) |
| Financial (BSP/PAGCOR) | 8 | Single-form (2), dashboard (2), decision tree (2), comparison (1), timeline (1) |
| Energy/Healthcare/Aviation | 11 | Single-form (6), decision tree (4), comparison (1) |

---

## Design System Implications

### The "Result Moment" is the Product

With 64 single-form calculators (43% of the suite) and 14 comparison engines (9%), the moment when a computed result appears is the **single most important UX moment in the entire Angkin system**. The design system must specify the result display component with the same care given to the compute button.

Key design decisions for the result moment:
1. **Typography:** Result numbers should be noticeably larger than inputs (2–4× font size jump)
2. **Color:** The result surface (background color or text color) should shift at compute time
3. **Animation:** A brief calculation animation (counter effect, or simple fade-in) signals "we're computing" and makes the result feel earned
4. **Breakdown:** Every result should offer an expandable "how was this computed?" view — this is how Angkin builds trust
5. **Share:** Every result should be shareable (copy amount, generate result card, or WhatsApp)

### Two App Personas: Occasional User vs. Power User

The archetype distribution reveals two distinct user types:

**Occasional User** (arrives for a single calculation): Primarily uses single-form calculators, decision trees, and single-run wizards. Needs fast onboarding, zero registration friction, clear result. Returns monthly or less. Single-form calculators, decision trees, document generators, lookup tables.

**Power User** (returns weekly or daily): Uses dashboards, calendar trackers, and multi-step wizards as ongoing tools. Wants saved state, bulk operations, keyboard shortcuts, data export. HR staff, accountants, IP lawyers, corporate secretaries. Dashboard, timeline, multi-step wizard archetypes.

**Design implication:** The design system must serve both personas without alienating either. Power features (bulk ops, keyboard shortcuts) must be discoverable but not required for occasional users. This maps to the progressive disclosure philosophy (Option 8: Canva / Notion benchmark).

### Archetype Count Summary

| Archetype | Compliance Moats (41) | Regulatory Atlas (107) | Total (148) |
|-----------|----------------------|----------------------|------------|
| Single-form calculator | 21 (51%) | 43 (40%) | **64 (43%)** |
| Decision tree | 3 (7%) | 19 (18%) | **22 (15%)** |
| Multi-step wizard | 8 (20%) | 10 (9%) | **18 (12%)** |
| Comparison engine | 3 (7%) | 11 (10%) | **14 (9%)** |
| Timeline/calendar | 1 (2%) | 10 (9%) | **11 (7%)** |
| Dashboard/tracker | 2 (5%) | 8 (7%) | **10 (7%)** |
| Document generator | 2 (5%) | 3 (3%) | **5 (3%)** |
| Lookup table | 1 (2%) | 3 (3%) | **4 (3%)** |
| **TOTAL** | **41** | **107** | **148** |

---

## Retirement Pay Calculator — The Reference Tool

The **Retirement Pay Calculator (RA 7641)** is the chosen reference tool for all 10 Wave 2 design mockups. It is a **single-form calculator** — the most common archetype at 43% of the suite. This makes it an ideal reference: getting the single-form calculator right means getting the core Angkin experience right.

**Why it's the perfect reference:**
- Highest pain score in compliance moats loop (5/5)
- Contains the central "trust moment" — users need to believe the ₱909,000 number is correct
- Input set is tractably small (salary, years of service, employment date)
- Output has a breakdown story (22.5 days formula, why not 15)
- Emotional stakes are high (retirement decision, legal dispute, employer negotiation)
- Every design option must make this feel trustworthy, clear, and shareable

---

*End of tool-archetypes.md — 148 tools cataloged across 8 UI archetypes*
