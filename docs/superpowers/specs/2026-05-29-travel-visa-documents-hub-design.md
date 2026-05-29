# Travel & Visa Documents Hub — Design

**Date:** 2026-05-29
**Status:** approved
**Owner:** Carlos

## Purpose

A reusable, one-stop hub for all travel/visa documents and application trackers. First use: the **New Zealand Visitor Visa** for the 2026 ski trip ([[2026-08-new-zealand-ski]]). Built so future applications (Schengen, etc.) reuse the same master document library instead of starting from zero — "airtight, every time."

## Key facts (researched 2026-05-29)

- A **Filipino passport holder needs a full Visitor Visa**, applied online at apply.immigration.govt.nz — **NOT** an NZeTA (NZeTA is visa-waiver countries only; PH is not one).
- **PH–NZ bilateral fee-waiver:** visa fee + immigration levy waived; only the **IVL ≈ NZD 100** is charged.
- **Funds threshold:** NZD 1,000/month, OR **NZD 400/month if accommodation is prepaid**. Both NZ hotels are prepaid → the 400/month bar applies (~2-week stay = very low bar).
- Approval rate for Filipinos ≈ 92%; processing ≈ 2–4 weeks.
- Already satisfied by the trip: return flights booked (onward travel ✅), both hotels prepaid (accommodation ✅).

## Document requirements (NZ Visitor Visa, Filipino applicant)

| Document | Source | Notes |
|---|---|---|
| Passport bio page | self | ≥6 months validity beyond departure |
| Digital photo | self | 900×1200–2250×3000 px, JPEG, 500KB–3MB, grey background |
| Bank Certificate | **bank** | Name, account no., current balance, on letterhead |
| Bank statements | **bank** | 3–6 months transaction history, steady balance |
| Certificate of Employment | **employer** | Position, salary, length of employment |
| Approved leave letter | **employer** | Proves a job to return to |
| ITR / payslips | employer/self | Income backup |
| Day-by-day itinerary | self | Genuine-visitor evidence |
| Cover letter | self | Trip purpose, addresses concerns |
| Return flights | self | ✅ booked (Qantas MNL↔ZQN) |
| Accommodation proof | self | ✅ Wyndham Wanaka + Holiday Inn Queenstown |
| IVL payment (~NZD 100) | self | Paid during online application |

Health/character certificates not required for a short tourist stay (only for 6+ month or 24+ month total stays).

## Architecture

A new top-level `documents/` hub. Actual document files **are committed** (private repo, user's explicit choice).

```
documents/
├── README.md                      # Hub index: library + active applications at a glance
├── library/                       # REUSABLE master documents — source of truth
│   ├── README.md                  # each doc: what it is, validity window, last updated, expiry
│   └── _files/                    # passport, photo, ITR, COE, bank cert scans (committed)
└── applications/
    └── 2026-nz-visitor-visa/
        ├── TRACKER.md             # per-requirement checklist: status, source, notes, expiry
        ├── requests/
        │   ├── bank-request.md         # ready-to-send email to bank
        │   └── employer-request.md     # ready-to-send request to PyMC Labs HR
        └── _files/                # the assembled PDFs uploaded to INZ (committed)
```

### Reuse engine

`library/` holds documents reusable across applications (passport, photo, ITR, payslips, COE). Each application gets `applications/<name>/` with its own TRACKER that pulls from the library + lists application-specific items. Next application = new folder, refresh stale library items, assemble.

### Staleness tracking

`library/README.md` records validity windows so the user knows what to refresh before any application: bank statements (≤3 mo), police certificate (≤6 mo), medical/X-ray (≤3 mo), photo currency, passport expiry.

### TRACKER.md

Table of every requirement: Document · Source · Status (☐ needed / ⧗ requested / ✅ have) · Notes · Expiry. Pre-populated with done items (flights, hotels) and outstanding items.

### Request drafts

`bank-request.md` and `employer-request.md` contain exact, copy-paste-ready wording matching INZ expectations.

### Cross-linking

- Add backlink from [[2026-08-new-zealand-ski]] to the NZ tracker.
- Fix that entity's "Next Actions": `Apply NZeTA + IVL` → `Apply Visitor Visa (+ IVL)`.

## Out of scope

- Automation/scraping of application status (manual for now).
- Dataview dashboard wiring (can come later if useful).
