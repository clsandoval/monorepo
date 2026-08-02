---
phase: 23
slug: the-instrument-letterhead-attribution-warnings-in-the-pdf
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-01
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `23-RESEARCH.md` §12 (Validation Architecture).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.0.18 (`frontend/vitest.config.ts`, jsdom, setup `src/test-setup.ts`) |
| **Config file** | `frontend/vitest.config.ts` |
| **Quick run command** | `cd frontend && npx vitest run src/components/pdf src/lib/__tests__/warnings-lines.test.ts` |
| **Full suite command** | `cd frontend && npm run test` |
| **Gate suite command** | `cd frontend && npm run test:gate` |
| **Type check** | `cd frontend && npx tsc -b --force` |
| **Estimated runtime** | quick ~8 s · type ~40 s · full ~240 s · G39 ~180 s · G24 ~180 s |

No new framework is installed. No new npm dependency is added. No watch-mode flag appears in any
task command.

---

## Sampling Rate

- **After every task:** the task's own `<verify>` command.
- **After every wave:** `cd frontend && npx tsc -b --force`.
- **After the last wave:** `cd frontend && npm run test` and `cd frontend && npm run test:gate`.
- **Before the phase is written up:** `node scripts/check-plan-closed-world.mjs`,
  `node scripts/check-gate-manifest.mjs`, `node scripts/check-citation-integrity.mjs`,
  `node scripts/check-planning-truth.mjs`, `node scripts/check-doc-claims.mjs`,
  `node scripts/check-lawyer-agenda.mjs`.
- **Max feedback latency:** 40 seconds for every task whose verify is a unit or type command;
  ~180 seconds for the three live gates, which are unavoidably browser-driven.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Test Type | Automated Command |
|---------|------|------|-------------|------------|-----------|-------------------|
| 23-01-01 | 01 | 1 | INST-02 | T-23-01a | migration + SQL | `cd frontend && supabase db reset` then a `psql` column query |
| 23-01-02 | 01 | 1 | INST-02 | T-23-01b | unit | `cd frontend && npx vitest run src/lib/__tests__/firm-profile.test.ts` |
| 23-01-03 | 01 | 1 | INST-02 | — | unit | `cd frontend && npx vitest run src/components/settings` |
| 23-02-01 | 02 | 1 | INST-03 | — | unit | `cd frontend && npx vitest run src/lib/__tests__/warnings-lines.test.ts` |
| 23-02-02 | 02 | 1 | INST-03 | — | unit | `cd frontend && npx vitest run src/components/results/__tests__/utils.test.ts` |
| 23-03-01 | 03 | 1 | INST-04 | — | unit | `cd frontend && npx vitest run src/components/pdf/__tests__/pdf-text.test.ts` |
| 23-03-02 | 03 | 1 | INST-04 | — | unit + static | `cd frontend && npx vitest run src/components/pdf` and `node scripts/check-citation-integrity.mjs` |
| 23-04-01 | 04 | 2 | INST-02 | T-23-04a | unit | `cd frontend && npx vitest run src/components/pdf/__tests__/attribution.test.tsx` |
| 23-04-02 | 04 | 2 | INST-02 | — | unit | `cd frontend && npx vitest run src/components/pdf/__tests__/pdf.test.tsx` |
| 23-05-01 | 05 | 2 | INST-01 | T-23-05a | unit | `cd frontend && npx vitest run src/lib/__tests__/firm-profile.test.ts` |
| 23-05-02 | 05 | 2 | INST-01 | — | unit | `cd frontend && npx vitest run src/components/results/__tests__/ActionsBar.test.tsx` |
| 23-06-01 | 06 | 3 | INST-03 | — | unit | `cd frontend && npx vitest run src/components/pdf/__tests__/warnings-section.test.tsx` |
| 23-06-02 | 06 | 3 | INST-03 | — | unit | `cd frontend && npx vitest run src/components/results/__tests__/WarningsPanel.test.tsx` |
| 23-06-03 | 06 | 3 | INST-03 | — | live | `cd frontend && node journey/pdf-structure.mjs` |
| 23-07-01 | 07 | 4 | INST-01, INST-02, INST-03, INST-04 | T-23-07a | fixture + capture hook | `cd frontend && node journey/pdf-structure.mjs` (unchanged behaviour) |
| 23-07-02 | 07 | 4 | INST-01, INST-02, INST-03, INST-04 | T-23-07b | live gate | `cd frontend && node journey/instrument-parity.mjs` |
| 23-07-03 | 07 | 4 | INST-01, INST-02, INST-03, INST-04 | — | injection proof | four injected regressions, each observed red, each reverted |
| 23-08-01 | 08 | 5 | INST-05 | T-23-08a | unit + CLI | `node journey/pdf-approve.mjs` with no `--by` exits 1 |
| 23-08-02 | 08 | 5 | INST-05 | — | live gate | `cd frontend && node journey/pdf-visual.mjs` exits 0 |
| 23-08-03 | 08 | 5 | INST-05 | — | static | `node scripts/check-gate-manifest.mjs`, `node scripts/check-planning-truth.mjs` |

Sampling continuity: no three consecutive tasks lack an automated verify. Every task in the table
has one.

---

## Wave 0 Requirements

Existing infrastructure covers every phase requirement. The three test files that do not yet exist
are created by the tasks that need them, inside the same plan, before that plan's verify runs:

- `frontend/src/lib/__tests__/warnings-lines.test.ts` — created by 23-02
- `frontend/src/components/pdf/__tests__/attribution.test.tsx` — created by 23-04
- `frontend/src/components/pdf/__tests__/warnings-section.test.tsx` — created by 23-06

No task carries a `MISSING` automated reference.

---

## The gate that must be observed failing before it is registered

`G39` (`cd frontend && node journey/instrument-parity.mjs`) is registered only after it has been
observed red on four injected regressions, each reverted immediately. A gate nobody has seen fail
is not known to be a gate. The four injections and their required markers are written into plan
23-07 task 3:

| Injection | Required marker |
|---|---|
| Restore the literal `null` third argument in `ActionsBar.tsx` | `LETTERHEAD MISSING` |
| Delete one of the five lines from `AttributionSection.tsx` | `ATTRIBUTION LINE MISSING` |
| Make `WarningsSection` render nothing | `WARNING NOT PRINTED` |
| Remove `stripMarkdownBold` from `NarrativesSection.tsx` | `MARKDOWN ASTERISK IN PDF` |

A fifth path, `CITATION ARTICLE REPEATED`, is proven by pointing the gate at the pre-change
rendering in the same task.

A run that examines zero warnings, zero attribution lines or zero citations exits 1 with
`INSTRUMENT CORPUS EMPTY`. A gate that passes vacuously is the failure the whole PDF gate family
was written to prevent.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| The two re-approved G24 page images are the intended document | INST-05 | Promoting a pixel reference is a recording of a human-visible change; no program may decide it | Plan 23-08 requires the executor to open each `.journey-runs/<stamp>/pdf/page-<n>.png` and each existing `journey/pdf-references/page-<n>.png` with the image reader and to write the observed differences into the summary before running `journey/pdf-approve.mjs --by phase-23-instrument`. The *content* of those differences is separately certified by G39, which passes before any image is approved. |

---

## Validation Sign-Off

- [ ] Every task has an automated `<verify>`
- [ ] Sampling continuity holds: no 3 consecutive tasks without automated verify
- [ ] No Wave 0 gap — every referenced test file is created by the plan that runs it
- [ ] No watch-mode flags anywhere
- [ ] Feedback latency < 40 s for unit and type layers
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
</content>
