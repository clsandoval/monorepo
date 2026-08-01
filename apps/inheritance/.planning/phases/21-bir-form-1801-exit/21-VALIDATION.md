---
phase: 21
slug: bir-form-1801-exit
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-01
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

Phase 21 adds no legal rule and computes no new peso figure. Every amount it prints was already
computed by the estate-tax engine before this phase started; the phase's whole subject is whether the
amount **survives the trip to paper**. That makes the regression surface unusually easy to state — one
narrowed type widened, one new pure module, one rewritten display, two export writers, two buttons,
one gate — and it makes the Rust engine a clean null control: if `cargo test` moves at all during this
phase, something happened that no plan intended.

The property has a treacherous shape: **agreement is trivially satisfiable by an empty surface.** A
table with no rows disagrees with nothing. Every equality assertion in this phase is therefore paired
with a set-identity assertion on the item ids, and every reconciliation assertion is run against a
fact set whose expected special-deduction total is asserted **non-zero** first. `21-RESEARCH.md`
§ *Validation Architecture* tabulates the pairs; this document is the sampling and failure-path
contract.

Two results in this phase may legitimately end red. They are named here so a red result is not
mistaken for an execution failure:

1. `bash scripts/ci-gates.sh` is **not claimed to reach exit 0**. The suite halts at `G17` with 15
   journey steps withheld for human review since Phase 16, and `G20`/`G21` are registered blocking
   gates whose scripts commit `4ccf06270` deleted. Retiring or repairing any of those is owner action
   under `CLAUDE.md` invariant 2, enforced by `G5`. This phase appends one gate at order 34 and touches
   no other gate.
2. `journey/return-parity.ts` requires a running local Supabase stack and poppler `pdftotext`. Absent
   either, it exits **2** with `RETURN PARITY CANNOT RUN:` — an environment verdict, not a failure, and
   not a pass. An executor that sees exit 2 reports it as exit 2 and does not "fix" it.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4 (frontend unit/component), `tsc -b` (typecheck), `cargo test` (engine null control), `npx tsx` (gate runner) |
| **Config files** | `gates.manifest.json` / `gates.manifest.lock`; `frontend/tsconfig.json`; `frontend/vitest.config.ts` |
| **Typecheck command** | `cd frontend && npx tsc -b --force` |
| **Scoped unit run** | `cd frontend && npx vitest run src/lib/estate-tax-engine/__tests__/form1801-lines.test.ts src/lib/__tests__/form1801-csv.test.ts src/components/tax/__tests__/Form1801View.test.tsx src/components/pdf/__tests__/form1801-pdf.test.tsx` |
| **Engine null control** | `cd engine && cargo test` — expected `546 passed; 0 failed` |
| **New gate command** | `cd frontend && npx tsx journey/return-parity.ts` |
| **Citation null control** | `node scripts/check-citation-integrity.mjs` — expected exit 0 |
| **Fact-set null control** | `cd frontend && npx tsx scripts/check-one-fact-set.ts` — expected exit 0 |
| **Lawyer registry null control** | `node scripts/check-lawyer-agenda.mjs` — expected exit 0 |
| **Test-count gate** | `cd frontend && npm run test:gate` |
| **Full suite command** | `bash scripts/ci-gates.sh` |

## Sampling plan — what is measured, how often, against what prior

| Signal | Command | Prior it is read against | Plans |
|---|---|---|---|
| `standardDeduction` readable from `EstateTaxFullOutput` | `npx tsc -b --force` after a typed read | compile error today → exit 0 after `21-01` | 21-01 |
| Special-deduction shortfall | `form1801-lines.test.ts` reconciliation case | `500000000` centavos today → `0` after `21-02` | 21-02 |
| Rows rendered by `Form1801View` | `grep -c "form-line-" src/components/tax/results/Form1801View.tsx` | rows built inline today → built from `buildForm1801Lines` after `21-03` | 21-03 |
| A section literal authored in a renderer | `grep -cE "NIRC Sec\.\|Sec\. 86\(" src/components/tax/results/Form1801View.tsx src/lib/form1801-csv.ts src/components/pdf/Form1801PDF.tsx` | must be `0` at every point after `21-02` | 21-03, 21-04, 21-05 |
| A second money formatter in an export layer | `grep -c "toLocaleString" src/lib/form1801-csv.ts src/components/pdf/Form1801PDF.tsx` | must be `0` — both read the shared formatters | 21-04, 21-05 |
| Export controls on the tax surface | `grep -rc "export-form1801-pdf\|export-form1801-csv" src/components/tax/` | `0` today → `2` after `21-06` | 21-06 |
| `react-pdf` reachable from the tax surface | `grep -rc "react-pdf\|generateForm1801Pdf" src/components/tax/` | `0` today (audit's grep) → non-zero after `21-06` | 21-06 |
| Gate observed failing | four injections, `21-07` | new — each must exit 1 with its own marker, and exit 0 after restore | 21-07 |
| Gate count stated in docs | `grep "The gate set holds" .planning/ORIENTATION.md` | `35` → `36` | 21-08 |
| Registered gate count | `node scripts/check-gate-manifest.mjs` | exit 0 at 35 → exit 0 at 36 | 21-08 |
| Engine regression (null control) | `cd engine && cargo test` | `546 passed; 0 failed` | 21-08 |

## Nyquist compliance — why each property is sampled at the rate it is

| Property | Levels sampled | Why one level is not enough |
|---|---|---|
| Item 37A carries the ₱5,000,000 standard deduction (RET-01) | type (`tsc`), unit (`buildForm1801Lines`), component (rendered row text), gate (real browser) | The defect was simultaneously invisible at the type level and at the unit level: the value existed at runtime while the type forbade reading it, so any single level would have reported health. |
| Displayed rows reconcile to the engine totals (RET-01) | unit, per column (exclusive, conjugal, total) **and** in both directions | A total-only check passes a row assigned to the wrong column. A one-directional check passes a surface that invented a row. |
| The PDF carries the same centavo integers (RET-02) | component with the mocked renderer **and** gate with real `pdftotext` over real download bytes | The mock proves composition; only real extraction catches the WinAnsi peso corruption `pdf-text.ts` measured, which silently mangles the first digit of every amount. |
| The CSV carries the same centavo integers (RET-03) | unit (escaping table, including a comma inside a property location) **and** gate (real download) | The escaping rule is only testable at the unit level; that the browser actually emitted the file is only testable at the gate level. |
| Every line carries its governing section (RET-04) | unit (no line has an empty `authority`) **and** source (`grep` proves no renderer authors a section literal) **and** gate | The presence test and the no-derivation test are different properties. Passing the first while failing the second is exactly how a display becomes a second attribution authority. |
| The gate can distinguish right from wrong (RET-05) | four observed injections, one per surface plus one for a dropped row | An unfalsified gate is decoration. The dropped-row injection is the only one that reproduces the class of defect this phase removes. |

## Every failure path is observed before it is trusted

No gate in this project is registered until it has been seen failing. `21-07` observes
`frontend/journey/return-parity.ts` exit 1 on four separately injected regressions, restoring the
source between each and confirming the gate returns to exit 0:

1. Add `1` centavo to one row's `total` inside `Form1801View`'s render path → expect `DISPLAY DISAGREES`.
2. Subtract `1` centavo from one row's amount in `Form1801PDF` → expect `PDF DISAGREES`.
3. Add `1` centavo to the centavo column in `form1801-csv.ts` → expect `CSV DISAGREES`.
4. Filter the Item 37A line out of `buildForm1801Lines` → expect `LINE SET MISMATCH`.

Injections 1 and 3 are in opposite directions on purpose: roadmap criterion 5 requires the gate to be
observed failing on a one-centavo injection **in each direction**.

Injection 4 is the load-bearing one. The first three catch arithmetic drift. Only the fourth catches
the failure this phase exists to remove — a row that is simply not there, which is what Item 37A has
been since the engine was written.

## Null controls

| Control | Expectation | Owner |
|---|---|---|
| `cd engine && cargo test` | `546 passed; 0 failed` — this phase edits no Rust | 21-08 |
| `node scripts/check-citation-integrity.mjs` | exit 0 — no Civil Code article moves | 21-03, 21-08 |
| `cd frontend && npx tsx scripts/check-one-fact-set.ts` | exit 0 — no second date field is introduced | 21-08 |
| `node scripts/check-lawyer-agenda.mjs` | exit 0 — no legal question is opened, answered or ticked | 21-08 |
| `grep -c "\[x\]" .planning/LAWYER-AGENDA.md` | `0` before and after | 21-08 |
| `frontend/test-baseline.json`, `assertion-baseline.json`, `gate-skips.lock` | unmodified by every commit in this phase, proven by `git log --name-only` | 21-08 |
| `frontend/journey/references/` | zero files touched — no journey step renders `Form1801View`, measured in `21-RESEARCH.md` §2 | every plan |
| `engine/legal-rules.json`, `engine/legal-traceability.lock` | untouched — no Civil Code article is implemented here | 21-08 |
| `package.json` dependency count | unchanged — `@react-pdf/renderer` is already present and the CSV writer adds nothing | 21-04, 21-05 |

## What a BLOCKED report looks like in this phase

Per `.planning/PLAN-STANDARD.md` §3: stop, paste the real command output, change nothing to make it
green. The five situations most likely to produce one here:

- **A task appears to require deciding which BIR line a value belongs on, or inventing a NIRC section
  for a line that has none.** Report BLOCKED naming `RET-04` and the task. The authority table in
  `21-RESEARCH.md` §4.1 is exhaustive for every line this phase renders; a line not in it is a line
  the plan did not anticipate, and a section is never invented to fill the gap. Funeral (5G) and
  judicial/administrative (5H) legitimately carry a spec reference rather than a NIRC section, and
  that is the answer, not a gap.
- **Widening `SpecialDeductionsResult` breaks more sites than `21-01` enumerates.** Fix every site the
  compiler names and record the true count. Do **not** make the new fields optional to silence it: an
  optional `standardDeduction` restores the exact silence this phase removes.
- **`npx tsx journey/return-parity.ts` exits 2.** That is a cannot-run verdict — a stopped Supabase
  stack, a missing `pdftotext`, a download that never arrived, or bytes that do not begin `%PDF-`.
  Report it as exit 2 with the pasted stderr line. Do not soften an environment check into a pass, and
  do not add a fallback that renders the PDF inside the harness: a harness-rendered PDF proves the
  harness can call `@react-pdf/renderer`, not that the product's lazy import and blob download work.
- **`npm run test:gate` reports a failure outside the 31-entry ledger.** Report it red with the pasted
  line. Do **not** append to `frontend/test-baseline.json`; that ledger may only shrink.
- **`node scripts/check-gate-manifest.mjs` fails after `21-08`.** Paste the marker. The fix is the
  manifest entry or the lock append — never a deletion from the lock, and never a change to an existing
  gate's command string.
