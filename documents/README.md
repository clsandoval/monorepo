# Travel & Visa Documents Hub

One-stop shop for all travel/visa documents and application trackers. The goal: assemble an **airtight** application once, keep the reusable pieces in `library/`, and never start from zero again.

## How this works

- **`library/`** — your reusable master documents (passport, photo, ITR, payslips, Certificate of Employment, bank certificate). These get reused across every application. `library/README.md` tracks each doc's validity window so you know what to refresh.
- **`applications/<name>/`** — one folder per visa application. Each has a `TRACKER.md` checklist that pulls from the library + lists application-specific items, plus ready-to-send `requests/` for your bank and employer.
- Actual document files live in the `_files/` subfolders and **are committed** (private repo).

## Active applications

| Application | For | Status | Tracker |
|---|---|---|---|
| NZ Visitor Visa | [[2026-08-new-zealand-ski]] (Jul 30–Aug 14 2026) | 🟡 gathering docs | [TRACKER](applications/2026-nz-visitor-visa/TRACKER.md) |

## Starting a new application

1. Create `applications/<year>-<country>-<type>/`.
2. Copy a `TRACKER.md` from an existing application as a template.
3. Check `library/README.md` — refresh anything stale (statements >3mo, photo, etc.).
4. Draft `requests/bank-request.md` and `requests/employer-request.md` if you need fresh letters.
5. Add a row to the table above.
