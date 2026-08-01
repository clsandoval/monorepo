# Requirements: Inheritance — Verification-First Foundation

**Defined:** 2026-07-27
**Core Value:** A change to this codebase must be cheap and safe to make — a passing gate set genuinely implies a working app, and a wrong legal number can never reach a lawyer silently.

**Sources:** `.planning/codebase/` (7 mapping documents), `.planning/research/LEGAL-CONFORMANCE.md` (29 adversarially-verified legal findings). Every requirement below traces to a measured observation, not a guess.

---

## v1 Requirements

### Gate Infrastructure

The precondition for everything else. Until these hold, any report of "tests pass" is unfounded.

- [x] **GATE-01**: `npm test` executes the frontend suite from a clean checkout and reports real pass/fail counts
- [x] **GATE-02**: `npx tsc -b` typechecks the frontend with zero errors
- [x] **GATE-03**: The WASM artifact builds reproducibly from `engine/` into `frontend/src/wasm/pkg/` via a single documented command
- [x] **GATE-04**: CI runs engine tests, WASM build, frontend tests, and typecheck on every push and pull request, and fails the build on any failure
- [x] **GATE-05**: A developer can bring up a working local environment (dependencies, WASM, local Supabase, seed data) from a clean checkout by following one documented sequence
- [x] **GATE-06**: `supabase/seed.sql` exists and seeds a known org, user, and case fixture that gates can rely on
- [x] **GATE-07**: The `firm-logos` storage bucket and any other runtime-required bucket are created by migration, not by hand
- [x] **GATE-08**: A gate run publishes machine-readable per-gate results that a status page can consume
- [x] **GATE-09**: Every gate reports which of its assertions were skipped, so a partially-loaded suite can never be read as a pass

### Engine Observability

Two hardcoded lines currently make every defect below invisible. Nothing else is verifiable until these are fixed.

- [x] **OBS-01**: Engine `warnings` reach output — `step10_finalize.rs:619` no longer hardcodes an empty array
- [x] **OBS-02**: All ten flag categories the spec defines are constructed and emitted, not the current six
- [x] **OBS-03**: `from_legitime`, `from_free_portion`, and `from_intestate` carry the values step 7 already computes, instead of being zeroed at `step10_finalize.rs:538-542`
- [x] **OBS-04**: `legitime_fraction` is populated, so a lawyer can see which pesos are protected legitime under Arts. 904–905
- [ ] **OBS-05**: A runtime conservation check asserts that per-heir shares sum exactly to the distributable estate, and rejects the output if not
- [ ] **OBS-06**: A runtime check rejects duplicate `heir_id` values in `per_heir_shares`
- [x] **OBS-07**: A malformed engine input produces a structured validation error at the WASM boundary rather than a trap or an unhandled rejection
- [x] **OBS-08**: Frontend errors are captured and reportable
- [x] **OBS-09**: The engine's per-step `computation_log` is retained and inspectable for any computation a lawyer questions

### Legal Conformance

Each item is a defect reproduced by running the engine, documented in `LEGAL-CONFORMANCE.md` §2. All currently fail silently.

- [x] **LAW-01**: Ascendants above the parent tier can inherit — fixes the `degree_from_decedent == 1` anchor filter at `step2_lines.rs:70`, root cause of LAW-01 through LAW-04
- [x] **LAW-02**: Collateral succession through predeceased siblings produces no duplicate heirs and conserves the estate (Arts. 972 ¶2, 974–975, 1005–1008)
- [x] **LAW-03**: Total repudiation by the nearest degree passes the estate to the next degree in their own right, not to the State (Art. 969)
- [x] **LAW-04**: Representation never operates in the ascending line (Art. 972 ¶1)
- [x] **LAW-05**: Preterition preserves devises and legacies insofar as they are not inofficious, and does not fire on an heir who received advances on their legitime (Art. 854, *Morales v. Olondriz*)
- [ ] **LAW-06**: A donation *inter vivos* never causes distributed shares to exceed the estate; an heir's excess entitlement is modelled as a reduction claim against a named donee (Arts. 771, 911)
- [ ] **LAW-07**: Art. 992's iron curtain is implemented for the collateral line, per the answer to LAWYER-04
- [x] **LAW-08**: The TRAIN-repealed ₱500,000 medical-expense deduction is not granted for deaths on or after 2018-01-01, and the spec's golden test TV-02 is corrected
- [x] **LAW-09**: The vanishing-deduction reduction ratio includes Transfers for Public Use in both the TRAIN and pre-TRAIN branches (NIRC Sec. 86(A)(5), RR 12-2018 Sec. 6(5))
- [x] **LAW-10**: `tax-bridge.ts` passes the correct distributable estate to the succession engine, not net taxable estate minus tax
- [x] **LAW-11**: Reserva troncal (Art. 891) either fails loudly with a flag or is expressly declared unsupported — never silently omitted while the spec advertises a flag for it
- [ ] **LAW-12**: The RA 11642 adoption regime is either implemented or made to refuse computation, replacing the currently inert `retroactive_ra_11642` flag and the repealed RA 8552 citations
- [x] **LAW-13**: The spec's four misstatements of law are corrected (Art. 992 pre-*Aquino* framing, Art. 900 ¶2 three-month trigger, Art. 972 ¶1 omission, vanishing-deduction paragraph list)
- [x] **LAW-14**: Every legal rule the engine implements is traceable to exactly one named test vector citing its article number
- [x] **LAW-15**: `engine/BUGS.md` reflects reality — BUG-001 closed as non-reproducing, re-filed against `step7_distribute.rs:313`

### Test Coverage Depth

The existing suite's failure is a generator problem, not an assertion-count problem.

- [x] **COV-01**: The property-test generator produces `NephewNiece` heirs, stranger donees, and donation/estate ratios above 1.0 — the shapes the current 100-case corpus cannot reach
- [x] **COV-02**: Each named invariant is individually identified in output, so a violation says which invariant broke
- [x] **COV-03**: Every legal test vector asserts the exact expected scenario code and exact per-heir centavo amounts, never a prefix or a range
- [x] **COV-04**: A coverage report shows, per engine module, which branches no test exercises
- [x] **COV-05**: The test suite fails if any test asserts nothing, or asserts only `toBeDefined`/`toBeTruthy` as its sole check
- [x] **COV-06**: RLS and org isolation are exercised against a real local Supabase: a user in org A cannot read, write, or enumerate org B's cases, PDFs, or shared links

### Journey Verification

Screenshot plus vision, per step, for the money path. `.planning/codebase/ARCHITECTURE.md` documents the seeding seams these depend on.

- [ ] **JRNY-01**: Any UI state can be seeded directly (DB row, `localStorage` draft, route param, context) without clicking through preceding steps, and the seams are documented
- [ ] **JRNY-02**: Signup, email verification, login, logout, and session persistence each produce a screenshot verified against an approved reference and a rubric
- [ ] **JRNY-03**: Org creation and invite acceptance are verified the same way
- [x] **JRNY-04**: Case intake, including the `localStorage` draft-recovery path, is verified step by step
- [ ] **JRNY-05**: Every step of the succession wizard is verified step by step *(five of six; `wizard-will` BLOCKED — see status table)*
- [x] **JRNY-06**: Every tab of the estate-tax wizard is verified tab by tab
- [x] **JRNY-07**: The results view and family-tree visualizer are verified, including that displayed peso figures match engine output exactly
- [x] **JRNY-08**: The public share-link view is verified, including that it exposes only what it should
- [ ] **JRNY-09**: A vision rubric is a fixed list of yes/no assertions returning structured output, never free-form judgment
- [ ] **JRNY-10**: A perceptual-diff failure is distinguishable from a rubric failure, and reference images have a documented re-approval flow
- [x] **JRNY-11**: Landing, blog, and SEO routes have a smoke gate: renders, no console error, no 404
- [ ] **JRNY-12**: Every gate failure emits the screenshot, the diff, and the failing assertion as durable artifacts

### PDF Verification

Most PDF breakage is structural and catchable without a model in the loop.

- [x] **PDF-01**: The PDF renders in CI and every required section is present in its extracted text
- [x] **PDF-02**: Every peso figure in the PDF matches the engine output exactly, asserted deterministically
- [x] **PDF-03**: Article citations and per-heir narratives appear for every heir
- [x] **PDF-04**: Rendered pages are perceptually diffed against approved references
- [x] **PDF-05**: Print layout is verified from rendered output, not by asserting on CSS source text

### Extendability

What makes it "functionally impossible to screw up."

- [x] **EXT-01**: Exactly one implementation of scenario classification exists — the engine — with the dead copy in `bridge.ts` and the live wrong copy in `ReviewStep.tsx:34-63` deleted
- [x] **EXT-02**: No legal rule is implemented in more than one place, enforced by a documented rule and a check
- [x] **EXT-03**: Money units are type-enforced so pesos cannot be assigned where centavos are expected, at every boundary
- [x] **EXT-04**: Dead code that could produce legally meaningless numbers if imported is deleted, including the `computeMock` path
- [x] **EXT-05**: `CLAUDE.md` states the invariants an implementing agent must not violate — unit conventions, single-source-of-truth rules, what requires a lawyer
- [x] **EXT-06**: Adding a new legal rule has a documented procedure: article, vector, implementation, gate
- [x] **EXT-07**: Planning docs and specs contain no stale claims contradicted by the code
- [x] **EXT-08**: A returning owner can determine current state, what is verified, and what is next from the planning directory alone

### Lawyer Readiness

- [x] **LAWYER-01**: The interpretive choice on Art. 996 vs the testate table for one child plus spouse is recorded (*Santillon v. Miranda*)
- [x] **LAWYER-02**: The spouse's legitime under Art. 892 ¶1 vs Art. 897 is recorded
- [x] **LAWYER-03**: Whether Art. 1006's blood ratio survives per-capita nephew succession is recorded, before the dead branch is enabled
- [x] **LAWYER-04**: The reach of *Aquino v. Aquino* into the collateral line is recorded — blocks LAW-07, and the highest-stakes item
- [x] **LAWYER-05**: Whether Art. 907 reduction self-executes or is disclosed as a claim the heir must assert is recorded
- [x] **LAWYER-06**: Whether an heir's donation-excess entitlement is modelled as estate pesos or as a claim against the donee is recorded — blocks LAW-06
- [x] **LAWYER-07**: The conjugal family-home deduction reading is recorded and the spec hedge removed
- [x] **LAWYER-08**: RA 11642 Sec. 41 retroactivity is recorded — blocks LAW-12
- [x] **LAWYER-09**: A recorded decision is machine-readable and linked from the rule it governs, so no agent re-decides it
- [x] **LAWYER-10**: A workflow exists for turning a lawyer's "this is wrong" into a named test vector, a failing gate, and a fix

### Loop Durability

Directly serves the constraint that the agent loop must not drift or narrow.

- [x] **LOOP-01**: Each plan is closed-world — an executing agent needs no decision the plan does not contain
- [x] **LOOP-02**: A plan whose gates cannot run halts and reports, rather than proceeding or redefining success
- [x] **LOOP-03**: The gate manifest is immutable to the executing agent; widening or weakening a gate requires owner action
- [x] **LOOP-04**: Progress is measured against the frozen gate manifest, so a narrowed scope is visible as reduced coverage
- [x] **LOOP-05**: Work is committed with scoped, explicit file lists — never `git add -A` — because a concurrent auto-committer on this monorepo will otherwise absorb staged changes into unrelated commits
- [x] **LOOP-06**: A stalled or repeatedly-failing loop surfaces without the owner having to poll

---

## Milestone v2.0 Requirements — Launch Readiness

**Defined:** 2026-08-01, from the vision audit. Owning phases 16–27. Every id below is stable and is
referenced by exactly one phase in `.planning/ROADMAP.md`.

### Deletion Milestone Stabilisation (Phase 16)

- [x] **CUT-01**: The guided intake contains no conflict-check, client-details or settlement-track step, and `frontend/src/lib/conflict-check.ts` plus the intake types those cuts orphaned do not exist
- [x] **CUT-02**: `frontend/src/test-setup.ts` supplies the missing jsdom globals — a `ResizeObserver` polyfill plus `scrollIntoView` and `hasPointerCapture` shims — and the failure count drop is measured before and after
- [x] **CUT-03**: Every failing journey reference is either passing or explicitly reported for human review; a reference is re-approved only when its diff is confined to the deleted sidebar navigation region, recorded `--by deletion-milestone-nav-change`
- [ ] **CUT-04**: `bash scripts/ci-gates.sh` exits 0 with nothing weakened, skipped or ledgered to get there

### Citation Integrity (Phase 17)

- [x] **CITE-01**: The engine is the single attribution authority — it emits the governing article per heir row and no other layer computes, maps or infers one
- [x] **CITE-02**: Narrative and table agree about the governing article for the same heirs on every committed corpus input
- [x] **CITE-03**: The citation pill resolves for every article the engine emits; the `Art. 996` / `Art.996` key mismatch in `frontend/src/data/ncc-articles.ts` is gone and an unresolvable key fails loudly
- [x] **CITE-04**: `predictScenario` and `computeMock` are deleted from `frontend/src/wasm/bridge.ts`, closing the duplicate legal rule named by CLAUDE.md invariant 5 and the reserved gate `G14` (also closes `EXT-02`)
- [x] **CITE-05**: A blocking gate fails when the table, the narrative, the citation pill and the PDF disagree about the article for the same heir

### One Fact Set (Phase 18)

- [x] **FACT-01**: Date of death is entered exactly once per case and neither engine offers a second independently-editable field for it
- [x] **FACT-02**: Both engines read the one shared date of death; the fact set crossing the boundary carries more than `decedent_name`
- [x] **FACT-03**: The rules the date drives — TRAIN versus pre-TRAIN, the repealed medical deduction, RA 11642 retroactivity — read the shared value
- [x] **FACT-04**: A case whose two fact sets disagree about the date of death fails a blocking check that prints both values, rather than computing

### Wizard Persistence (Phase 19)

- [x] **SAVE-01**: A `methods.watch()` subscription reaches `useAutoSave` through an `onChange` prop, so wizard edits schedule a save without pressing Compute
- [x] **SAVE-02**: The `prevInputRef` reference-equality guard is replaced by a value comparison, so the debounce fires on a changed value
- [x] **SAVE-03**: Unmounting the wizard flushes a pending save instead of clearing it
- [x] **SAVE-04**: Save status is visible to the lawyer, and a failed save is never rendered as success
- [x] **SAVE-05**: A nine-heir family tree survives a page reload, proven by a journey step against the live database

### NIRC §§248/249 Penalties (Phase 20)

- [ ] **PEN-01**: Surcharge is computed from the date of death per NIRC §248, replacing the hardcoded `surcharges: 0`
- [ ] **PEN-02**: Interest is computed from the date of death per NIRC §249, replacing the hardcoded `interest: 0`
- [ ] **PEN-03**: `total_amount_due` is the sum of estate tax, surcharge, interest and compromise penalty, and moves when the date of death moves
- [ ] **PEN-04**: Every penalty line cites the section that governs it
- [ ] **PEN-05**: Where the statute is ambiguous the engine refuses loudly and the question is recorded as a new `LAWYER-<NN>` entry with status `awaiting-answer`; no reading is adopted, defaulted or stubbed

### BIR Form 1801 Exit (Phase 21)

- [ ] **RET-01**: Every displayed deduction row equals the amount the computation applied — Item 35A no longer shows `0.00` against ₱5,000,000 applied
- [ ] **RET-02**: The return exports as a PDF
- [ ] **RET-03**: The return exports as a CSV carrying the same centavo integers
- [ ] **RET-04**: Every line of both exports carries the NIRC section or RR provision that governs it, read from the engine
- [ ] **RET-05**: A blocking gate compares displayed, PDF and CSV figures against a same-run engine computation, in both directions

### Deed Schedule of Shares (Phase 22)

- [ ] **DEED-01**: The schedule-of-shares clause is obtainable as pasteable text from a computed case
- [ ] **DEED-02**: The same clause is obtainable as DOCX
- [ ] **DEED-03**: Every heir line in the clause carries the Civil Code article the engine emitted for that heir
- [ ] **DEED-04**: Where a share cannot be expressed without a lawyer's judgement, the clause says so and names what must be decided, rather than inventing wording
- [ ] **DEED-05**: Every peso figure in the clause equals the engine's centavo value exactly, proven against a same-run computation

### The Instrument (Phase 23)

- [ ] **INST-01**: `ActionsBar` loads the firm profile and passes it to `downloadPDF`, so a configured letterhead renders in an obtainable PDF
- [ ] **INST-02**: The PDF carries an attorney attribution block — name, Roll number, IBP, PTR, MCLE
- [ ] **INST-03**: Every engine warning shown on screen is printed in the PDF
- [ ] **INST-04**: No raw markdown asterisk reaches the page and the duplicated `Art. 996: Art. 996` line renders once
- [ ] **INST-05**: Gate G24's perceptual references are re-approved deliberately, each diff inspected and each approval attributed

### Reproducibility (Phase 24)

- [ ] **REPRO-01**: Every computation is stamped immutably with engine version, ruleset-as-of date, input hash and timestamp
- [ ] **REPRO-02**: A computation is never overwritten in place; the previous record stays retrievable after a re-run
- [ ] **REPRO-03**: Re-running a stored input on the same engine version reproduces the same output hash, proven by a gate
- [ ] **REPRO-04**: The stamp appears in the PDF, the return exports and the deed clause, and no public verification portal or hash-addressable public route is built

### Loud Refusal (Phase 25)

- [ ] **REFUSE-01**: A fact pattern engaging Art. 992's iron curtain raises a manual-review flag and the engine declines to distribute — the refusal, not the rule (`LAW-07` stays open on `LAWYER-04`)
- [ ] **REFUSE-02**: A donation *inter vivos* exceeding the estate raises a manual-review flag and the engine declines to compute (`LAW-06` stays open on `LAWYER-06`)
- [ ] **REFUSE-03**: Each refusal names and quotes the open question it is waiting on
- [ ] **REFUSE-04**: The refusal is visible on every surface the computation would have reached — screen, PDF, deed clause and exported return

### Scope Lock (Phase 26)

- [ ] **SCOPE-01**: `scripts/check-scope.mjs` and a committed lock file pin route count, exported component count, runtime dependency count, migration count and public engine exports
- [ ] **SCOPE-02**: Growing any of the five fails a blocking gate registered in `gates.manifest.json`
- [ ] **SCOPE-03**: Adding to the lock is owner action; the check has no fix, update, accept, regenerate or waiver flag, and every failure path has been observed firing against a committed fixture

### Launch Readiness Closeout (Phase 27)

- [ ] **CLOSE-01**: `CLAUDE.md`'s invariants read as final truth, each naming the command and gate id that enforces it
- [ ] **CLOSE-02**: `.planning/STATE.md` and `.planning/ROADMAP.md` agree with the filesystem and the gate set, proven by gate G33
- [ ] **CLOSE-03**: `LAUNCH-READINESS.md` states what works end to end, what is blocked on the lawyer and on which question, and what a returning owner must do first
- [ ] **CLOSE-04**: If the product is not launchable `LAUNCH-READINESS.md` says so and says why; every claim is paired with the command that proves it or is explicitly labelled unmeasured

---

## v3 Requirements (deferred beyond Launch Readiness)

### Payments

- **PAY-01**: A payment provider is selected and integrated
- **PAY-02**: Checkout is verified against provider sandbox with test cards
- **PAY-03**: Webhook handling and entitlement grants are verified
- **PAY-04**: Paywall gating is enforced server-side, not only in the UI

### Deeper Legal Surface

- **LAW2-01**: Reserva troncal fully implemented, requiring an asset inventory with provenance in `EngineInput`
- **LAW2-02**: A legitimacy-of-link discriminator for collaterals and ascendants, enabling the finer Art. 992 distinctions
- **LAW2-03**: Devises summed into inofficiousness detection (`step6_validation.rs:512`, "skip for now")
- **LAW2-04**: RA 9858 legitimation audited for the full range of compulsory-heir qualification
- **LAW2-05**: A second primary legal source cross-checked once `chanrobles.com` or the SC e-library is reachable

### Operations

- **OPS-01**: Public status page with historical gate results
- **OPS-02**: Performance budgets on engine computation and PDF generation
- **OPS-03**: Structured audit log of every computation a lawyer runs
- **OPS-04**: Accessibility gates on the money path

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payment implementation | No provider exists in the codebase; friends-and-colleagues testing does not require collecting money. Deferred to v2, spec-only for now |
| Full-depth gates on SEO/blog routes | ~dozen routes where breakage is cosmetic; smoke gate only. Authoring cost not justified |
| Arts. 1012–1014 escheat procedure | Municipal assignment and the 5-year reclaim window are outside a share-computation engine's job; absence is not a defect |
| Art. 895 ¶2 ⅘ natural-child tier | Superseded by RA 9255. Not implementing it is **conformance** — an agent must not "fix" this |
| "Correcting" fractional-year vanishing deductions | The code is right and `estate-tax-engine-spec.md:148` is wrong. Fix the spec, not the code |
| Rewriting git history to purge `engine/target` | Already untracked from the index; a rewrite of ~437MB of pushed objects is disruptive and buys little |
| Mobile app | Web-first |
| Replacing the Rust engine or the stack | Established, and the arithmetic core is verified sound. Not up for revision |
| Deciding contested points of Philippine law without a lawyer | Explicit project constraint. Contested readings go to the LAWYER-\* agenda |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GATE-01 | Phase 1 | Complete |
| GATE-02 | Phase 1 | Complete |
| GATE-03 | Phase 1 | Complete |
| GATE-04 | Phase 1 | Complete |
| GATE-05 | Phase 3 | Complete |
| GATE-06 | Phase 3 | Complete |
| GATE-07 | Phase 3 | Complete |
| GATE-08 | Phase 3 | Complete |
| GATE-09 | Phase 3 | Complete |
| LOOP-01 | Phase 2 | Complete |
| LOOP-02 | Phase 2 | Complete |
| LOOP-03 | Phase 2 | Complete |
| LOOP-04 | Phase 2 | Complete |
| LOOP-05 | Phase 2 | Complete |
| LOOP-06 | Phase 2 | Complete |
| LAWYER-01 | Phase 4 | Complete |
| LAWYER-02 | Phase 4 | Complete |
| LAWYER-03 | Phase 4 | Complete |
| LAWYER-04 | Phase 4 | Complete |
| LAWYER-05 | Phase 4 | Complete |
| LAWYER-06 | Phase 4 | Complete |
| LAWYER-07 | Phase 4 | Complete |
| LAWYER-08 | Phase 4 | Complete |
| LAWYER-09 | Phase 4 | Complete |
| LAWYER-10 | Phase 4 | Complete |
| OBS-01 | Phase 5 | Complete |
| OBS-02 | Phase 5 | Complete |
| OBS-03 | Phase 5 | Complete |
| OBS-04 | Phase 5 | Complete |
| OBS-05 | Phase 5 | Blocked |
| OBS-06 | Phase 5 | Blocked |
| OBS-07 | Phase 5 | Complete |
| OBS-08 | Phase 5 | Complete |
| OBS-09 | Phase 5 | Complete |
| COV-01 | Phase 6 | Complete |
| COV-02 | Phase 6 | Complete |
| COV-03 | Phase 6 | Complete |
| COV-04 | Phase 6 | Complete |
| COV-05 | Phase 6 | Complete |
| LAW-01 | Phase 7 | Complete |
| LAW-02 | Phase 7 | Complete |
| LAW-03 | Phase 7 | Complete |
| LAW-04 | Phase 7 | Complete |
| LAW-05 | Phase 8 | Complete |
| LAW-08 | Phase 8 | Complete |
| LAW-09 | Phase 8 | Complete |
| LAW-10 | Phase 8 | Complete |
| LAW-11 | Phase 8 | Complete |
| EXT-01 | Phase 9 | Blocked (09-01 plan defect; see 09-01-SUMMARY.md). Its LIVE half is re-planned as Phase 12 plan 12-01, which backs the ReviewStep badge with the existing `compute()` bridge — no `classify_json` and no `succession_type` claim, so neither Phase 9 blocker applies |
| EXT-02 | Phase 9 + Phase 17 | Complete — one duplicate converter deleted by 09-05; the surviving `predictScenario`/`computeMock` duplicate deleted by 17-04, and the reserved gate `G14` is registered blocking at order 10 by 17-06 |
| EXT-03 | Phase 9 | Complete (09-03, 09-05) |
| EXT-04 | Phase 9 | Blocked (09-02 exposed an engine defect out of plan scope; 09-04 blocked on 09-01). Phase 12 plan 12-01 removes the live `ReviewStep.predictScenario`; the dead `bridge.ts` copies stay Phase 9's |
| JRNY-01 | Phase 10 | Planned (10-05) |
| JRNY-09 | Phase 10 | Planned (10-02) |
| JRNY-10 | Phase 10 | Planned (10-03) |
| JRNY-12 | Phase 10 | Planned (10-01, 10-04) |
| JRNY-02 | Phase 11 | PARTIAL (11-03, 11-05) — signup, both verification-route states, login and session persistence gated by G16/G17; **logout BLOCKED**, sign-out does not reach the sign-in card the rubric asserts and whether it should is an open product decision |
| JRNY-03 | Phase 11 | PARTIAL (11-02, 11-06) — invite acceptance and refusal gated by G16/G17; **org creation BLOCKED** on two product defects found by driving it (a 406 from `.single()` over an empty result, and a 400/23502 that makes `saveFirmProfile` silently discard the attorney profile) |
| JRNY-04 | Phase 11 | Complete (11-07) — eight steps gated by G16/G17 |
| COV-06 | Phase 11 | Complete (11-01, 11-04) — gated by G18, fourteen cases over four surfaces |
| JRNY-05 | Phase 12 | PARTIAL (12-01, 12-03, 12-09) — five of six succession-wizard screens gated by G16/G17, proved by `node journey/run.mjs --all` (steps `wizard-estate`, `wizard-decedent`, `wizard-family-tree`, `wizard-donations`, `wizard-review`); the review badge is pinned to the engine's `I2`. **`wizard-will` BLOCKED**: `?hasWill=1` never constructs the `will` object, so `WillStep.tsx:28` renders an empty div and `waitForSelector` times out |
| JRNY-06 | Phase 12 | Complete (12-04, 12-09) — all eight `TAB_NAMES` tabs gated by G16/G17, proved by `node journey/run.mjs --all` (steps `tax-tab-0` … `tax-tab-7`), each rubric pairing the selected tab with the panel it renders |
| JRNY-07 | Phase 12 | Complete (12-02, 12-06, 12-08, 12-09) — results view and family tree gated by G16/G17, proved by `node journey/run.mjs --all` (steps `results-view`, `results-family-tree`); every displayed peso figure proved equal to a same-run engine computation by G19, `node journey/money-parity.mjs` |
| JRNY-08 | Phase 12 | Complete (12-02, 12-07, 12-09) — three share states gated by G16/G17, proved by `node journey/run.mjs --all` (steps `share-populated`, `share-uncomputed`, `share-disabled`); the anonymous RPC's exact six-column set proved by G20, `node journey/share-exposure.mjs` |
| JRNY-11 | Phase 12 | Complete (12-05, 12-09) — fourteen public routes gated by G21, proved by `node journey/seo-smoke.mjs`: each renders a non-empty `h1`, logs no console error, and fetches nothing answering HTTP 400 or above |
| PDF-01 | Phase 13 | Complete (13-02, 13-03, 13-05, 13-07) — gates G22 and G23; the section list is derived from the engine output of the same run, so the two conditional sections are not asserted when the engine emits none |
| PDF-02 | Phase 13 | Complete (13-01, 13-05, 13-07) — gate G23; the PDF's currency token is first made representable by its own non-embedded WinAnsi fonts, then every printed amount is compared as an exact centavo integer in both directions |
| PDF-03 | Phase 13 | Complete (13-05, 13-07) — gate G23; every heir with a positive share must have a name, a matching `legal_basis` citation and a narrative in the document. Citations are asserted present and matching engine output, never asserted correct |
| PDF-04 | Phase 13 | Complete (13-06, 13-07) — gate G24; every page rasterised at 100 dots per inch and compared at `maxDiffPixels` 0 against a reference only `journey/pdf-approve.mjs` can write |
| PDF-05 | Phase 13 | Complete (13-04, 13-07) — gate G25; every claim read from computed style under print media or from the bytes `page.pdf` produced, and the check opens no stylesheet |
| LAW-06 | Phase 14 | **Blocked on LAWYER-06** — the recorded decision's status in `.planning/lawyer-decisions.json` is `awaiting-answer`. Recorded, with the lawyer's question quoted verbatim, in `.planning/BLOCKED-REQUIREMENTS.md`; gate G26 holds that record to the registry and raises `ANSWER ARRIVED` the moment the answer lands. No reading of Art. 771 or Art. 911 was adopted, implemented, defaulted or stubbed |
| LAW-07 | Phase 14 | **Blocked on LAWYER-04** — status `awaiting-answer`. Recorded in `.planning/BLOCKED-REQUIREMENTS.md` and gated by G26. `grep -rn "IronCurtain\|iron_curtain" engine/src` still returns zero hits; no reading of Art. 992 was adopted |
| LAW-12 | Phase 14 | **Blocked on LAWYER-08** — status `awaiting-answer`. Recorded in `.planning/BLOCKED-REQUIREMENTS.md` and gated by G26. `config.retroactive_ra_11642` remains inert and no RA 11642 Sec. 41 reading was adopted — including "refuse to compute", which is an available answer but not an agent's to select |
| LAW-13 | Phase 14 | Complete (14-04, 14-06) — gate G27; C1/C2/C3 corrected and C4 verified intact from Phase 8, checked as literal strings at 11 named anchors across 4 files. The collateral-line question is stated as open and attributed to `LAWYER-04`; no spec asserts an answer to it |
| LAW-14 | Phase 14 | Complete (14-01, 14-05, 14-06) — gate G28; 63 of 79 articles mapped to exactly one named passing test function carrying a `// LEGAL-VECTOR: Art. NNN` marker, 16 declared in the shrink-only `engine/legal-traceability.lock`. `implemented_in` is recomputed from source on every run |
| LAW-15 | Phase 14 | Complete (14-02, 14-06) — gate G29 plus `engine/tests/bugs_ledger.rs` under G1; BUG-001 closed as non-reproducing with measured numbers, BUG-002 filed against `engine/src/step7_distribute.rs:421` with a runnable reproduction. The line number moved from the audit's `:313` after the Phase 7 and 8 fixes |
| EXT-05 | Phase 15 | Complete — proven by G30, `node scripts/check-claude-invariants.mjs` |
| EXT-06 | Phase 15 | Complete — proven by G31, `node scripts/check-new-rule-procedure.mjs` |
| EXT-07 | Phase 15 | Complete — proven by G32, `node scripts/check-doc-claims.mjs` |
| EXT-08 | Phase 15 | Complete — proven by G33, `node scripts/check-planning-truth.mjs` |
| CUT-01 | Phase 16 | Complete |
| CUT-02 | Phase 16 | Complete (already satisfied since `181ae68c5`; closed by measurement, not by new code) |
| CUT-03 | Phase 16 | Complete (14 approved after per-pixel inspection; 10 refused and reported for human review) |
| CUT-04 | Phase 16 | **BLOCKED-ON-OWNER** — `ci-gates.sh` exits 1 at G3 (`ran 2073, floor 2119`); needs (A) the floor lowered and (B) G20/G21 retired, whose scripts `4ccf06270` deleted |
| CITE-01 | Phase 17 | Complete |
| CITE-02 | Phase 17 | Complete |
| CITE-03 | Phase 17 | Complete |
| CITE-04 | Phase 17 | Complete — supersedes the `EXT-02` remainder and closes the reserved gate `G14` |
| CITE-05 | Phase 17 | Complete |
| FACT-01 | Phase 18 | Complete |
| FACT-02 | Phase 18 | Complete |
| FACT-03 | Phase 18 | Complete |
| FACT-04 | Phase 18 | Complete |
| SAVE-01 | Phase 19 | Done — `WizardContainer` `onChange` prop + `methods.watch()`; proven by `WizardContainer.test.tsx` (25 cases) and gate G35 |
| SAVE-02 | Phase 19 | Done — `stableStringify` value comparison in `useAutoSave.ts`; proven by `useAutoSave.test.tsx` `saves when the same object is mutated in place` |
| SAVE-03 | Phase 19 | Done — unmount cleanup flushes; proven by `useAutoSave.test.tsx` `flushes pending save on unmount` and gate G35 marker `UNMOUNT LOST` |
| SAVE-04 | Phase 19 | Done — `SaveStatusBadge`; proven by `SaveStatusBadge.test.tsx` (6 cases, incl. success copy absent in error state) and G35 marker `STATUS NOT SHOWN` |
| SAVE-05 | Phase 19 | Done — gate G35 `frontend/journey/persistence.mjs`, observed `PERSISTENCE PASS heirs=9 checks=7` |
| PEN-01 | Phase 20 | Planned |
| PEN-02 | Phase 20 | Planned |
| PEN-03 | Phase 20 | Planned |
| PEN-04 | Phase 20 | Planned |
| PEN-05 | Phase 20 | Planned |
| RET-01 | Phase 21 | Planned |
| RET-02 | Phase 21 | Planned |
| RET-03 | Phase 21 | Planned |
| RET-04 | Phase 21 | Planned |
| RET-05 | Phase 21 | Planned |
| DEED-01 | Phase 22 | Planned |
| DEED-02 | Phase 22 | Planned |
| DEED-03 | Phase 22 | Planned |
| DEED-04 | Phase 22 | Planned |
| DEED-05 | Phase 22 | Planned |
| INST-01 | Phase 23 | Planned |
| INST-02 | Phase 23 | Planned |
| INST-03 | Phase 23 | Planned |
| INST-04 | Phase 23 | Planned |
| INST-05 | Phase 23 | Planned |
| REPRO-01 | Phase 24 | Planned |
| REPRO-02 | Phase 24 | Planned |
| REPRO-03 | Phase 24 | Planned |
| REPRO-04 | Phase 24 | Planned |
| REFUSE-01 | Phase 25 | Planned — the refusal only; `LAW-07` stays BLOCKED on `LAWYER-04` |
| REFUSE-02 | Phase 25 | Planned — the refusal only; `LAW-06` stays BLOCKED on `LAWYER-06` |
| REFUSE-03 | Phase 25 | Planned |
| REFUSE-04 | Phase 25 | Planned |
| SCOPE-01 | Phase 26 | Planned |
| SCOPE-02 | Phase 26 | Planned |
| SCOPE-03 | Phase 26 | Planned |
| CLOSE-01 | Phase 27 | Planned |
| CLOSE-02 | Phase 27 | Planned |
| CLOSE-03 | Phase 27 | Planned |
| CLOSE-04 | Phase 27 | Planned |

**Coverage:**
- v1 requirements: **80** total (GATE 9, OBS 9, LAW 15, COV 6, JRNY 12, PDF 5, EXT 8, LAWYER 10, LOOP 6)
- Mapped to phases: 80
- Unmapped: 0 ✓

**Known dependency edges for the roadmapper (resolved in ROADMAP.md):**
- GATE-01…04 (Phase 1) block every other gate — nothing is verifiable until the suites execute
- OBS-01…04 (Phase 5) block all LAW-\* verification — with `warnings: []` hardcoded, a legal fix cannot be observed. LAW phases (7, 8, 14) are sequenced after Phase 5.
- LAW-01 is the root cause of LAW-02, LAW-03, LAW-04 — one line, four defects — grouped together in Phase 7.
- LAWYER-04 blocks LAW-07; LAWYER-06 blocks LAW-06; LAWYER-08 blocks LAW-12 — LAWYER-\* recorded early in Phase 4; the three blocked LAW items deferred to Phase 14, late enough that a lawyer sitting the bar exam has weeks to answer without stalling the loop.
- JRNY-01 (Phase 10) blocks JRNY-02…08 (Phases 11-12) — per-step screenshots are unaffordable without state seeding.
- GATE-05…07 (Phase 3) block COV-06 and every DB-touching journey gate (Phase 11).
- EXT-01 (Phase 9) precedes JRNY-05 (Phase 12), so screenshot gates cannot certify a wrong "Predicted:" badge.

---
*Requirements defined: 2026-07-27*
*Last updated: 2026-08-01 — milestone v2.0 (Launch Readiness) requirements added, `CUT-*` through `CLOSE-*`, owning phases 16–27. The v1.0 rows below were last revised 2026-07-31 after Phase 8 and are known stale in both directions; see `.planning/STATE.md` "What the spot-check contradicted".*
*Previously updated: 2026-07-31 after Phase 8 execution and verification (LAW-05, LAW-08, LAW-09, LAW-10, LAW-11 Complete; preterition preserves non-inofficious legacies and yields to a collated donation, the TRAIN-repealed medical deduction is gone, transfers for public use enter the vanishing-deduction ratio, the tax bridge hands over the Art. 908 base, and reserva troncal is enterable and flagged)*
