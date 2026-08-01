---
phase: 22
slug: deed-of-extrajudicial-settlement-schedule-of-shares
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-01
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `22-RESEARCH.md` §12 (Validation Architecture).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.0.18 (`frontend/vitest.config.ts`, jsdom, setup `src/test-setup.ts`) |
| **Config file** | `frontend/vitest.config.ts` |
| **Quick run command** | `cd frontend && npx vitest run src/lib/deed` |
| **Full suite command** | `cd frontend && npm run test` |
| **Type check** | `cd frontend && npx tsc -b --force` |
| **Estimated runtime** | quick ~5 s · type ~40 s · full ~240 s · G38 ~180 s |

No new framework is installed. No watch-mode flag appears in any task.

---

## Sampling Rate

- **After every task:** the task's own `<verify>` command, which is always one of the six
  layers in `22-RESEARCH.md` §12.
- **After every wave:** `cd frontend && npx tsc -b --force`.
- **After the last wave:** `cd frontend && npm run test` and
  `cd frontend && npm run test:gate`.
- **Before the phase is written up:** `node scripts/check-plan-closed-world.mjs`,
  `node scripts/check-gate-manifest.mjs`, `node scripts/check-lawyer-agenda.mjs`,
  `node scripts/check-citation-integrity.mjs`, `node scripts/check-planning-truth.mjs`,
  and `cd frontend && npx tsx journey/deed-parity.ts`.
- **Max feedback latency:** 40 seconds for every task except the two that own the live gate.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 22-01-01 | 22-01 | 1 | DEED-02 | T-22-01 | A crafted decedent name cannot inject a ZIP entry: entry names are three module constants, never user input | unit | `cd frontend && npx vitest run src/lib/deed/__tests__/zip.test.ts` | ❌ W0 | ⬜ pending |
| 22-01-02 | 22-01 | 1 | DEED-02 | T-22-01 | Archive bytes are identical across runs — no wall clock reaches the header | unit | `cd frontend && npx vitest run src/lib/deed/__tests__/zip.test.ts` | ❌ W0 | ⬜ pending |
| 22-02-01 | 22-02 | 1 | DEED-03, DEED-04 | T-22-02 | Article strings are copied from the engine, never authored | unit | `cd frontend && npx vitest run src/lib/deed/__tests__/schedule-lines.test.ts` | ❌ W0 | ⬜ pending |
| 22-02-02 | 22-02 | 1 | DEED-04 | T-22-02 | A flagged heir yields a refusal, never a peso figure | unit | `cd frontend && npx vitest run src/lib/deed/__tests__/schedule-lines.test.ts` | ❌ W0 | ⬜ pending |
| 22-02-03 | 22-02 | 1 | DEED-05 | T-22-02 | Money is BigInt end to end; no `Number()` coercion of centavos | unit | `cd frontend && npx vitest run src/lib/deed/__tests__/schedule-lines.test.ts` | ❌ W0 | ⬜ pending |
| 22-03-01 | 22-03 | 2 | DEED-01, DEED-03 | T-22-03 | Every stated line carries its article; no line is emitted without one | unit | `cd frontend && npx vitest run src/lib/deed/__tests__/clause-text.test.ts` | ❌ W0 | ⬜ pending |
| 22-03-02 | 22-03 | 2 | DEED-04 | T-22-03 | Document-level flags print above the lines and are never dropped | unit | `cd frontend && npx vitest run src/lib/deed/__tests__/clause-text.test.ts` | ❌ W0 | ⬜ pending |
| 22-04-01 | 22-04 | 3 | DEED-02 | T-22-04 | XML text nodes are escaped, so a decedent name containing `<` cannot break the part | unit | `cd frontend && npx vitest run src/lib/deed/__tests__/docx.test.ts` | ❌ W0 | ⬜ pending |
| 22-04-02 | 22-04 | 3 | DEED-02 | T-22-04 | The DOCX body re-extracts to the exact clause text | unit | `cd frontend && npx vitest run src/lib/deed/__tests__/docx.test.ts` | ❌ W0 | ⬜ pending |
| 22-05-01 | 22-05 | 4 | DEED-01, DEED-02 | T-22-05 | The rendered clause is the builder's output, not a second composition | unit | `cd frontend && npx vitest run src/components/results/__tests__/DeedClauseSection.test.tsx` | ❌ W0 | ⬜ pending |
| 22-05-02 | 22-05 | 4 | DEED-01, DEED-02 | T-22-05 | The object URL is revoked after the download, so blob memory is not retained | unit | `cd frontend && npx vitest run src/components/results/__tests__/DeedClauseSection.test.tsx` | ❌ W0 | ⬜ pending |
| 22-05-03 | 22-05 | 4 | DEED-01 | T-22-05 | The section is mounted inside `results-view` and the whole suite still passes | suite | `cd frontend && npm run test` | ✅ | ⬜ pending |
| 22-06-01 | 22-06 | 5 | DEED-04 | T-22-06 | An open legal question is recorded, never answered by an agent | meta | `node scripts/check-lawyer-agenda.mjs` | ✅ | ⬜ pending |
| 22-06-02 | 22-06 | 5 | DEED-03 | T-22-06 | No deed renderer may author an article literal | meta | `node scripts/check-citation-integrity.mjs` | ✅ | ⬜ pending |
| 22-07-01 | 22-07 | 5 | DEED-05 | T-22-07 | The gate reads the archive it was given and cannot write anything | integration | `cd frontend && npx tsx journey/deed-parity.ts` | ❌ W0 | ⬜ pending |
| 22-07-02 | 22-07 | 5 | DEED-05 | T-22-07 | Four injections observed red before the gate is trusted | integration | `cd frontend && npx tsx journey/deed-parity.ts` | ❌ W0 | ⬜ pending |
| 22-08-01 | 22-08 | 6 | DEED-05 | T-22-08 | The gate set grows and is never weakened | meta | `node scripts/check-gate-manifest.mjs` | ✅ | ⬜ pending |
| 22-08-02 | 22-08 | 6 | DEED-05 | T-22-08 | The planning directory agrees with the filesystem and the manifest | meta | `node scripts/check-planning-truth.mjs` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*"File Exists" is the state of the test file before the phase runs; every ❌ W0 file is created by the task that names it.*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. vitest, `tsx`, playwright, the
Supabase local stack, `journey/engine.mjs`, `journey/serve.mjs`, `journey/browser.mjs`,
`journey/seed.mjs`, `journey/session.mjs` and `journey/resets.mjs` are all present and are
the same seams gates G19 and G37 already use. Nothing is installed by this phase.

New test files created inside the phase (each by the plan that owns its subject):

- [ ] `frontend/src/lib/deed/__tests__/zip.test.ts` — DEED-02 (plan 22-01)
- [ ] `frontend/src/lib/deed/__tests__/schedule-lines.test.ts` — DEED-03, DEED-04, DEED-05 (plan 22-02)
- [ ] `frontend/src/lib/deed/__tests__/clause-text.test.ts` — DEED-01, DEED-03, DEED-04 (plan 22-03)
- [ ] `frontend/src/lib/deed/__tests__/docx.test.ts` — DEED-02 (plan 22-04)
- [ ] `frontend/src/components/results/__tests__/DeedClauseSection.test.tsx` — DEED-01, DEED-02 (plan 22-05)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| The generated `.docx` opens in Microsoft Word and in LibreOffice Writer without a repair prompt | DEED-02 | No OOXML consumer exists in this repository or in CI, and installing one to certify a three-part package would be a larger surface than the writer it certifies | Download the clause from a computed case, open the file in Word and in LibreOffice Writer, confirm no repair dialog appears and the paragraph text matches the on-screen clause line for line |
| The clause wording is acceptable to paste into a firm's Deed template | DEED-01, DEED-04 | This is the lawyer's judgement and `LAWYER-13` records the open question behind it | Put the generated clause in front of the collaborator once the bar is over; record the answer in `.planning/lawyer-decisions.json` under `LAWYER-13` per `.planning/LEGAL-CORRECTION-WORKFLOW.md` |
| `results-view` and `results-family-tree` perceptual references | — | These two steps have been failing and withheld for human review since Phase 16, and this phase changes the results screen again | A human inspects the diff. **No plan in this phase may approve either step.** |

The first row is the reason the gate asserts the archive **structurally** — three declared
parts located through the central directory, valid signatures, correct CRC per part — rather
than asserting only that some bytes were produced.

---

## Validation Sign-Off

- [x] All tasks have an automated `<verify>` command; no task depends on a Wave 0 install
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify
- [x] Wave 0 covers all MISSING references (nothing is missing; five test files are created in-phase)
- [x] No watch-mode flags anywhere in the phase
- [x] Feedback latency < 40 s for every task except 22-07's two, which own the live browser gate
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-01
