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
- [ ] **GATE-05**: A developer can bring up a working local environment (dependencies, WASM, local Supabase, seed data) from a clean checkout by following one documented sequence
- [ ] **GATE-06**: `supabase/seed.sql` exists and seeds a known org, user, and case fixture that gates can rely on
- [ ] **GATE-07**: The `firm-logos` storage bucket and any other runtime-required bucket are created by migration, not by hand
- [ ] **GATE-08**: A gate run publishes machine-readable per-gate results that a status page can consume
- [ ] **GATE-09**: Every gate reports which of its assertions were skipped, so a partially-loaded suite can never be read as a pass

### Engine Observability

Two hardcoded lines currently make every defect below invisible. Nothing else is verifiable until these are fixed.

- [ ] **OBS-01**: Engine `warnings` reach output — `step10_finalize.rs:619` no longer hardcodes an empty array
- [ ] **OBS-02**: All ten flag categories the spec defines are constructed and emitted, not the current six
- [ ] **OBS-03**: `from_legitime`, `from_free_portion`, and `from_intestate` carry the values step 7 already computes, instead of being zeroed at `step10_finalize.rs:538-542`
- [ ] **OBS-04**: `legitime_fraction` is populated, so a lawyer can see which pesos are protected legitime under Arts. 904–905
- [ ] **OBS-05**: A runtime conservation check asserts that per-heir shares sum exactly to the distributable estate, and rejects the output if not
- [ ] **OBS-06**: A runtime check rejects duplicate `heir_id` values in `per_heir_shares`
- [ ] **OBS-07**: A malformed engine input produces a structured validation error at the WASM boundary rather than a trap or an unhandled rejection
- [ ] **OBS-08**: Frontend errors are captured and reportable
- [ ] **OBS-09**: The engine's per-step `computation_log` is retained and inspectable for any computation a lawyer questions

### Legal Conformance

Each item is a defect reproduced by running the engine, documented in `LEGAL-CONFORMANCE.md` §2. All currently fail silently.

- [ ] **LAW-01**: Ascendants above the parent tier can inherit — fixes the `degree_from_decedent == 1` anchor filter at `step2_lines.rs:70`, root cause of LAW-01 through LAW-04
- [ ] **LAW-02**: Collateral succession through predeceased siblings produces no duplicate heirs and conserves the estate (Arts. 972 ¶2, 974–975, 1005–1008)
- [ ] **LAW-03**: Total repudiation by the nearest degree passes the estate to the next degree in their own right, not to the State (Art. 969)
- [ ] **LAW-04**: Representation never operates in the ascending line (Art. 972 ¶1)
- [ ] **LAW-05**: Preterition preserves devises and legacies insofar as they are not inofficious, and does not fire on an heir who received advances on their legitime (Art. 854, *Morales v. Olondriz*)
- [ ] **LAW-06**: A donation *inter vivos* never causes distributed shares to exceed the estate; an heir's excess entitlement is modelled as a reduction claim against a named donee (Arts. 771, 911)
- [ ] **LAW-07**: Art. 992's iron curtain is implemented for the collateral line, per the answer to LAWYER-04
- [ ] **LAW-08**: The TRAIN-repealed ₱500,000 medical-expense deduction is not granted for deaths on or after 2018-01-01, and the spec's golden test TV-02 is corrected
- [ ] **LAW-09**: The vanishing-deduction reduction ratio includes Transfers for Public Use in both the TRAIN and pre-TRAIN branches (NIRC Sec. 86(A)(5), RR 12-2018 Sec. 6(5))
- [ ] **LAW-10**: `tax-bridge.ts` passes the correct distributable estate to the succession engine, not net taxable estate minus tax
- [ ] **LAW-11**: Reserva troncal (Art. 891) either fails loudly with a flag or is expressly declared unsupported — never silently omitted while the spec advertises a flag for it
- [ ] **LAW-12**: The RA 11642 adoption regime is either implemented or made to refuse computation, replacing the currently inert `retroactive_ra_11642` flag and the repealed RA 8552 citations
- [ ] **LAW-13**: The spec's four misstatements of law are corrected (Art. 992 pre-*Aquino* framing, Art. 900 ¶2 three-month trigger, Art. 972 ¶1 omission, vanishing-deduction paragraph list)
- [ ] **LAW-14**: Every legal rule the engine implements is traceable to exactly one named test vector citing its article number
- [ ] **LAW-15**: `engine/BUGS.md` reflects reality — BUG-001 closed as non-reproducing, re-filed against `step7_distribute.rs:313`

### Test Coverage Depth

The existing suite's failure is a generator problem, not an assertion-count problem.

- [ ] **COV-01**: The property-test generator produces `NephewNiece` heirs, stranger donees, and donation/estate ratios above 1.0 — the shapes the current 100-case corpus cannot reach
- [ ] **COV-02**: Each named invariant is individually identified in output, so a violation says which invariant broke
- [ ] **COV-03**: Every legal test vector asserts the exact expected scenario code and exact per-heir centavo amounts, never a prefix or a range
- [ ] **COV-04**: A coverage report shows, per engine module, which branches no test exercises
- [ ] **COV-05**: The test suite fails if any test asserts nothing, or asserts only `toBeDefined`/`toBeTruthy` as its sole check
- [ ] **COV-06**: RLS and org isolation are exercised against a real local Supabase: a user in org A cannot read, write, or enumerate org B's cases, PDFs, or shared links

### Journey Verification

Screenshot plus vision, per step, for the money path. `.planning/codebase/ARCHITECTURE.md` documents the seeding seams these depend on.

- [ ] **JRNY-01**: Any UI state can be seeded directly (DB row, `localStorage` draft, route param, context) without clicking through preceding steps, and the seams are documented
- [ ] **JRNY-02**: Signup, email verification, login, logout, and session persistence each produce a screenshot verified against an approved reference and a rubric
- [ ] **JRNY-03**: Org creation and invite acceptance are verified the same way
- [ ] **JRNY-04**: Case intake, including the `localStorage` draft-recovery path, is verified step by step
- [ ] **JRNY-05**: Every step of the succession wizard is verified step by step
- [ ] **JRNY-06**: Every tab of the estate-tax wizard is verified tab by tab
- [ ] **JRNY-07**: The results view and family-tree visualizer are verified, including that displayed peso figures match engine output exactly
- [ ] **JRNY-08**: The public share-link view is verified, including that it exposes only what it should
- [ ] **JRNY-09**: A vision rubric is a fixed list of yes/no assertions returning structured output, never free-form judgment
- [ ] **JRNY-10**: A perceptual-diff failure is distinguishable from a rubric failure, and reference images have a documented re-approval flow
- [ ] **JRNY-11**: Landing, blog, and SEO routes have a smoke gate: renders, no console error, no 404
- [ ] **JRNY-12**: Every gate failure emits the screenshot, the diff, and the failing assertion as durable artifacts

### PDF Verification

Most PDF breakage is structural and catchable without a model in the loop.

- [ ] **PDF-01**: The PDF renders in CI and every required section is present in its extracted text
- [ ] **PDF-02**: Every peso figure in the PDF matches the engine output exactly, asserted deterministically
- [ ] **PDF-03**: Article citations and per-heir narratives appear for every heir
- [ ] **PDF-04**: Rendered pages are perceptually diffed against approved references
- [ ] **PDF-05**: Print layout is verified from rendered output, not by asserting on CSS source text

### Extendability

What makes it "functionally impossible to screw up."

- [ ] **EXT-01**: Exactly one implementation of scenario classification exists — the engine — with the dead copy in `bridge.ts` and the live wrong copy in `ReviewStep.tsx:34-63` deleted
- [ ] **EXT-02**: No legal rule is implemented in more than one place, enforced by a documented rule and a check
- [ ] **EXT-03**: Money units are type-enforced so pesos cannot be assigned where centavos are expected, at every boundary
- [ ] **EXT-04**: Dead code that could produce legally meaningless numbers if imported is deleted, including the `computeMock` path
- [ ] **EXT-05**: `CLAUDE.md` states the invariants an implementing agent must not violate — unit conventions, single-source-of-truth rules, what requires a lawyer
- [ ] **EXT-06**: Adding a new legal rule has a documented procedure: article, vector, implementation, gate
- [ ] **EXT-07**: Planning docs and specs contain no stale claims contradicted by the code
- [ ] **EXT-08**: A returning owner can determine current state, what is verified, and what is next from the planning directory alone

### Lawyer Readiness

- [ ] **LAWYER-01**: The interpretive choice on Art. 996 vs the testate table for one child plus spouse is recorded (*Santillon v. Miranda*)
- [ ] **LAWYER-02**: The spouse's legitime under Art. 892 ¶1 vs Art. 897 is recorded
- [ ] **LAWYER-03**: Whether Art. 1006's blood ratio survives per-capita nephew succession is recorded, before the dead branch is enabled
- [ ] **LAWYER-04**: The reach of *Aquino v. Aquino* into the collateral line is recorded — blocks LAW-07, and the highest-stakes item
- [ ] **LAWYER-05**: Whether Art. 907 reduction self-executes or is disclosed as a claim the heir must assert is recorded
- [ ] **LAWYER-06**: Whether an heir's donation-excess entitlement is modelled as estate pesos or as a claim against the donee is recorded — blocks LAW-06
- [ ] **LAWYER-07**: The conjugal family-home deduction reading is recorded and the spec hedge removed
- [ ] **LAWYER-08**: RA 11642 Sec. 41 retroactivity is recorded — blocks LAW-12
- [ ] **LAWYER-09**: A recorded decision is machine-readable and linked from the rule it governs, so no agent re-decides it
- [ ] **LAWYER-10**: A workflow exists for turning a lawyer's "this is wrong" into a named test vector, a failing gate, and a fix

### Loop Durability

Directly serves the constraint that the agent loop must not drift or narrow.

- [ ] **LOOP-01**: Each plan is closed-world — an executing agent needs no decision the plan does not contain
- [ ] **LOOP-02**: A plan whose gates cannot run halts and reports, rather than proceeding or redefining success
- [ ] **LOOP-03**: The gate manifest is immutable to the executing agent; widening or weakening a gate requires owner action
- [ ] **LOOP-04**: Progress is measured against the frozen gate manifest, so a narrowed scope is visible as reduced coverage
- [ ] **LOOP-05**: Work is committed with scoped, explicit file lists — never `git add -A` — because a concurrent auto-committer on this monorepo will otherwise absorb staged changes into unrelated commits
- [ ] **LOOP-06**: A stalled or repeatedly-failing loop surfaces without the owner having to poll

---

## v2 Requirements

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
| GATE-05 | Phase 3 | Pending |
| GATE-06 | Phase 3 | Pending |
| GATE-07 | Phase 3 | Pending |
| GATE-08 | Phase 3 | Pending |
| GATE-09 | Phase 3 | Pending |
| LOOP-01 | Phase 2 | Planned |
| LOOP-02 | Phase 2 | Planned |
| LOOP-03 | Phase 2 | Planned |
| LOOP-04 | Phase 2 | Planned |
| LOOP-05 | Phase 2 | Planned |
| LOOP-06 | Phase 2 | Planned |
| LAWYER-01 | Phase 4 | Pending |
| LAWYER-02 | Phase 4 | Pending |
| LAWYER-03 | Phase 4 | Pending |
| LAWYER-04 | Phase 4 | Pending |
| LAWYER-05 | Phase 4 | Pending |
| LAWYER-06 | Phase 4 | Pending |
| LAWYER-07 | Phase 4 | Pending |
| LAWYER-08 | Phase 4 | Pending |
| LAWYER-09 | Phase 4 | Pending |
| LAWYER-10 | Phase 4 | Pending |
| OBS-01 | Phase 5 | Pending |
| OBS-02 | Phase 5 | Pending |
| OBS-03 | Phase 5 | Pending |
| OBS-04 | Phase 5 | Pending |
| OBS-05 | Phase 5 | Pending |
| OBS-06 | Phase 5 | Pending |
| OBS-07 | Phase 5 | Pending |
| OBS-08 | Phase 5 | Pending |
| OBS-09 | Phase 5 | Pending |
| COV-01 | Phase 6 | Pending |
| COV-02 | Phase 6 | Pending |
| COV-03 | Phase 6 | Pending |
| COV-04 | Phase 6 | Pending |
| COV-05 | Phase 6 | Pending |
| LAW-01 | Phase 7 | Pending |
| LAW-02 | Phase 7 | Pending |
| LAW-03 | Phase 7 | Pending |
| LAW-04 | Phase 7 | Pending |
| LAW-05 | Phase 8 | Pending |
| LAW-08 | Phase 8 | Pending |
| LAW-09 | Phase 8 | Pending |
| LAW-10 | Phase 8 | Pending |
| LAW-11 | Phase 8 | Pending |
| EXT-01 | Phase 9 | Pending |
| EXT-02 | Phase 9 | Pending |
| EXT-03 | Phase 9 | Pending |
| EXT-04 | Phase 9 | Pending |
| JRNY-01 | Phase 10 | Pending |
| JRNY-09 | Phase 10 | Pending |
| JRNY-10 | Phase 10 | Pending |
| JRNY-12 | Phase 10 | Pending |
| JRNY-02 | Phase 11 | Pending |
| JRNY-03 | Phase 11 | Pending |
| JRNY-04 | Phase 11 | Pending |
| COV-06 | Phase 11 | Pending |
| JRNY-05 | Phase 12 | Pending |
| JRNY-06 | Phase 12 | Pending |
| JRNY-07 | Phase 12 | Pending |
| JRNY-08 | Phase 12 | Pending |
| JRNY-11 | Phase 12 | Pending |
| PDF-01 | Phase 13 | Pending |
| PDF-02 | Phase 13 | Pending |
| PDF-03 | Phase 13 | Pending |
| PDF-04 | Phase 13 | Pending |
| PDF-05 | Phase 13 | Pending |
| LAW-06 | Phase 14 | Pending |
| LAW-07 | Phase 14 | Pending |
| LAW-12 | Phase 14 | Pending |
| LAW-13 | Phase 14 | Pending |
| LAW-14 | Phase 14 | Pending |
| LAW-15 | Phase 14 | Pending |
| EXT-05 | Phase 15 | Pending |
| EXT-06 | Phase 15 | Pending |
| EXT-07 | Phase 15 | Pending |
| EXT-08 | Phase 15 | Pending |

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
*Last updated: 2026-07-27 after roadmap creation (15 phases, 80/80 requirements mapped)*
