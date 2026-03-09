# PodPlay Ops QA Forward Loop — Design

**Date**: 2026-03-09
**Status**: Approved
**Scope**: 9 open QA findings from passes 1–2

## Context

The PodPlay Ops forward loop (185 stages) converged on 2026-03-09. Two QA passes identified 13 findings, 4 were fixed inline. The remaining 9 need a second forward loop.

## Approach

Single consolidated spec at `loops/podplay-ops-qa-forward/spec/qa-fixes-spec.md` consumed by a standard Ralph forward loop. Same loop.sh mechanics as the original (40 max iterations, 1800s timeout, one stage per iteration).

## Scope

| ID | Category | Summary | Complexity |
|----|----------|---------|------------|
| F01 | MISSING | Settings > Installers CRUD + seed | Medium |
| F03 | QOL | ISP provider dropdown (curated PH ISPs) | Light |
| F04 | WIRING | Wizard step persistence + status-based routing | Medium |
| F06 | DATA | Inventory seed (47 rows, qty=0) | Light |
| F07 | MISSING | Inventory adjustment modal + movements | Medium |
| F08 | QOL | Reusable SearchableSelect combobox | Medium |
| F09 | DATA | Team contacts seed (6 core members) | Light |
| F11 | MISSING | Settings > Vendors CRUD + seed | Medium |
| F12 | MISSING | Recurring fees table + Financials tab + global view | Heavy |

## Schema Changes

6 new migrations (00013–00018):
- Installer seed data
- `wizard_step` column on projects
- Inventory seed (47 rows)
- Team contacts replacement (7 → 6)
- `vendors` table + seed
- `fee_frequency` enum + `recurring_fees` table

No FK changes to existing tables (vendors stays TEXT on hardware_catalog).

## New Routes

- `/settings/installers` — Installer CRUD
- `/settings/vendors` — Vendor CRUD

## New Components

- `SearchableSelect` — Reusable combobox (ui/)
- `InstallerSettings` — Installer CRUD (settings/)
- `VendorSettings` — Vendor CRUD (settings/)
- `AdjustmentModal` — Inventory adjustment (inventory/)
- `RecurringFeesTab` — Recurring fees CRUD (wizard/financials/)

## Estimated Stage Count

~35-45 stages:
- 6 migration stages
- ~20 component/route stages
- ~4 SearchableSelect integration stages
- ~8 Playwright verification stages
- 3 discovery + convergence stages
