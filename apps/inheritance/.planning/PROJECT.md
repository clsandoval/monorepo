# Inheritance — Verification-First Foundation

## What This Is

A Philippine inheritance and estate-tax computation product for lawyers: a Rust succession engine (Civil Code Book III) compiled to WASM, a TypeScript NIRC estate-tax engine, and a React web app that walks a lawyer from family facts to per-heir peso amounts with citable narratives and a printable PDF.

This project is not about adding features to that product. It is about building the **verification foundation** underneath it — QA gates, test-case catalogs, screenshot-plus-vision checks, observability, and documentation — precise enough that a cheap model can grind against the plans for a month without supervision and land a working app. The trigger for doing it now: the owner has abundant time now and scarce recurring time later, and a lawyer collaborator (currently sitting the bar) is expected to join later in the year to drive real-world testing with friends and colleagues.

## Core Value

**A change to this codebase must be cheap and safe to make** — meaning a passing gate set genuinely implies a working app, and a wrong legal number can never reach a lawyer silently.

Note the ordering this implies: correctness is not the top-line goal, *low cost of change* is. The owner explicitly does not expect everything to be correct by the time the collaborator arrives. He expects everything to be easy — observable, tested, documented, extendable. A correct app with no gates is worth less here than a partly-wrong app whose wrongness is loud and whose fixes are one plan away.

## Requirements

### Validated

Inferred from the codebase map (`.planning/codebase/`) and verified by running code, not by reading it:

- ✓ Rust succession engine, 10-step pipeline, ~18k LOC — **442 tests passing** (411 lib + 30 integration + 1 fuzz) — existing
- ✓ Exact rational arithmetic (`engine/src/fraction.rs`, `Money` in centavos, banker's rounding at step 10) — existing
- ✓ Legitime fraction table conforming to Arts. 888–903 — **verified against primary sources, every row at every arity tested** — existing
- ✓ Correct distinction between all four vacancy causes (predecease / repudiation / incapacity / disinheritance) — the classic severe bug in this domain, verified absent — existing
- ✓ TypeScript NIRC estate-tax engine: flat 6%, ₱5M standard deduction, ₱10M family-home cap, vanishing-deduction sliding scale, spouse share — verified against RR 12-2018 — existing
- ✓ Property-based invariant harness (`engine/tests/fuzz_invariants.rs`) that panics on violation over 100 committed cases — existing, **but corpus is blind to the shapes that break the engine** (see Context)
- ✓ React 19 + TanStack Router app, 24 routes, two wizards, results visualizer, PDF export, share links — existing, **unverified**
- ✓ Supabase multi-tenant schema with RLS and org scoping, 12 migrations — existing, **unverified**

### Active

**Make the gates real (nothing else can be trusted until this is true)**
- [ ] Frontend build and test suites can actually execute — toolchain, WASM artifact, dependencies
- [ ] CI runs tests, build, and typecheck on push and pull request
- [ ] A conservation invariant and a duplicate-heir check are enforced at runtime, not just documented
- [ ] The property-test generator can reach the heir shapes that currently break the engine

**Turn observability back on**
- [ ] Engine warnings and manual-review flags reach output instead of being discarded
- [ ] The legitime / free-portion split survives serialization
- [ ] Error tracking exists for the frontend
- [ ] A status page reports per-gate pass/fail

**Fix the silent legal defects**
- [ ] The nine critical conformance defects in `.planning/research/LEGAL-CONFORMANCE.md` §2
- [ ] Every legal rule traceable to one named test vector citing its article
- [ ] Rules the engine cannot express (reserva troncal) fail loudly rather than silently

**Verify the app end to end**
- [ ] Every step of every money-path journey has a screenshot gate: perceptual diff plus vision rubric
- [ ] Deterministic structural gates on PDF output (text and figures, matched against engine output)
- [ ] UI states can be seeded directly rather than clicked through
- [ ] Auth, org, and RLS isolation are exercised by tests against a real local Supabase

**Make it extendable**
- [ ] Exactly one authoritative implementation of each legal rule
- [ ] Money units are type-enforced at every boundary
- [ ] Reproducible environment from a clean checkout
- [ ] `CLAUDE.md` guidelines that prevent the regressions no test would catch
- [ ] Documentation a returning owner or a new collaborator can act on

**Prepare for the lawyer**
- [ ] The eight interpretive choices in `LEGAL-CONFORMANCE.md` §3 are answered and recorded
- [ ] A workflow exists for turning a lawyer's "this is wrong" into a test vector and a fix

### Out of Scope

- **Payment / billing implementation** — no provider exists in the codebase; verification is spec-only for now. Real-user testing among friends and colleagues does not require collecting money.
- **Full-depth gates on SEO landing pages and the blog** (~dozen routes) — thin smoke gate only (renders, no console error, no 404). Breakage there is cosmetic; the authoring cost is not.
- **Arts. 1012–1014 escheat procedure** (municipal assignment, 5-year reclaim window) — out of scope for a share-computation engine; absence is not a defect.
- **The ⅘ acknowledged-natural-child legitime tier (Art. 895 ¶2)** — superseded by RA 9255. Not implementing it is conformance; do not "fix" it.
- **Rewriting git history to purge `engine/target` blobs** — untracked from the index is sufficient; a history rewrite is disruptive for ~437MB of already-pushed objects.
- **Mobile app** — web-first.

## Context

**Why this project exists at all.** Much of this codebase was written by autonomous "ralph loop" agents. Those loops committed continuously with no gate: the only CI workflow touching this app is `workflow_dispatch`-only and runs no test, build, or lint. The result is a codebase that looks well-tested and is not.

**The measured baseline** (from `.planning/codebase/` and `.planning/research/LEGAL-CONFORMANCE.md`):

- 110 frontend test files, **35,293 lines of test code, none of which can execute** — no `node_modules`, and the WASM binary is unbuilt, so WASM-dependent suites fail at module init rather than at assertion.
- **Nine critical legal-conformance defects**, each reproduced by running the engine, each failing **silently**. One hardcoded line (`step2_lines.rs:70`, a `degree_from_decedent == 1` filter) is the root cause of four of them. Grandparents cannot inherit; collateral succession duplicates heirs and loses 40% of the estate; a total repudiation escheats an estate that has living grandchildren; a donation *inter vivos* can distribute ₱30M from a ₱10M estate; Art. 992's iron curtain is absent entirely; TRAIN's repealed medical deduction is still granted; and `tax-bridge.ts` understates every heir's share by ~75%.
- **Observability is switched off at two lines.** `step10_finalize.rs:619` hardcodes `warnings: vec![]`, so the spec's entire human-in-the-loop mechanism is unreachable — all 29 audit findings reproduced with an empty warnings array. `step10_finalize.rs:538-542` hard-zeroes `from_legitime` / `from_free_portion` / `legitime_fraction`: nonzero on **0 of 512** heir rows across all 130 committed examples.
- **The property-test corpus cannot reach the bugs.** `fuzz_invariants.rs` asserts correctly and panics on violation, but its 100 cases contain **zero `NephewNiece` heirs, zero stranger donees, and a maximum donation/estate ratio of 0.55** — below the threshold where either breach mechanism fires. Coverage is a property of the generator, not the assertion count. This is the single most important lesson for gate design here.
- **No runtime conservation check and no duplicate-`heir_id` check.** Either one alone would have caught three of the nine criticals.
- **Three disagreeing scenario classifiers.** `engine/src/step3_scenario.rs` is ground truth; `frontend/src/wasm/bridge.ts:86-209` is a dead second copy; `frontend/src/components/wizard/ReviewStep.tsx:34-63` is a live third copy shown to the lawyer as a "Predicted:" badge, and it disagrees with the engine.
- **Divergent money conventions.** The succession wizard stores centavos, the estate-tax wizard stores pesos, with no branded type preventing confusion. One real instance of this bug was already fixed in `27a114a6d`.
- **Half-built environment seams.** The `firm-logos` storage bucket is referenced in code but created by no migration; `case_pdfs.storage_key` exists but nothing writes it; `supabase/config.toml` references a `seed.sql` that does not exist. Gates touching storage will fail for environmental reasons rather than real ones.
- **A concurrent auto-committer runs on this monorepo.** Three unrelated `fitness log` commits landed during the session that created this document, one of which absorbed a staged deletion. Any change left staged or unstaged can be swept into an unrelated commit — a real hazard for a long-running autonomous loop.
- **No end-to-end tooling of any kind** — no Playwright/Cypress/Puppeteer, no visual regression, no test exercising real auth, payment, PDF output, or RLS.

**What is genuinely trustworthy.** The arithmetic core. The legitime table, the four vacancy causes, Art. 1006's blood ratio, and the TRAIN estate-tax computation were all verified against primary legal sources by running the code. The failures are concentrated in **heir selection, vacancy handling, and the boundaries between modules** — not in the math.

**Legal-source caveat.** The conformance audit could reach only one primary repository (`lawphil.net`); `chanrobles.com`, `elibrary.judiciary.gov.ph`, and `officialgazette.gov.ph` all refused access. Currency claims rest on absence-of-amendment plus null searches, not an official consolidated source. Notably, lawphil's *HTML* page for RA 386 is silently truncated before Book III — a plausible mechanism for how a model-authored engine acquired unverified succession rules. The audit is a review agenda for a lawyer, not a substitute for one.

## Constraints

- **Timeline**: Roughly the rest of 2026 (from 2026-07-27), paced by scarce recurring owner attention. A month of slow autonomous implementation is acceptable; a stalled loop is not.
- **Executor model**: Implementation is delegated to a deliberately cheap model whose only job is to follow plans. Plans must therefore be closed-world — no step may require legal judgment, design taste, or a decision the plan does not already contain.
- **Loop durability**: The agent loop must not suffer context drift or scope narrowing over a long horizon. This is a first-class design constraint, not a nice-to-have, and it is what motivates fine phase granularity and per-phase verification.
- **Legal authority**: No agent may decide a contested point of Philippine law. Contested readings go to the lawyer review agenda; the engine records a decision rather than guessing.
- **Correctness domain**: Wrong output means a lawyer files a wrong pleading. Silent wrongness is categorically worse than loud failure, and this ranking governs every tradeoff.
- **Tech stack**: Rust + wasm-pack + WASM engine; React 19, TanStack Router, Vite, vitest, Tailwind; Supabase (Postgres, auth, RLS, storage). Established and not up for revision.
- **Repo**: Lives inside the `monorepo` worktree alongside an active auto-committer; planning files track to the outer repo.

## Current Milestone: v2.0 Launch Readiness

**Started:** 2026-08-01. Twelve phases, 16–27, in `.planning/ROADMAP.md`. Requirements `CUT-*`
through `CLOSE-*` in `.planning/REQUIREMENTS.md`.

**Goal:** Give the product an output tray. Milestone v1.0 built the verification foundation and the
deletion milestone cut roughly 28% of the surface; the vision audit's finding is that the engines are
excellent and the product abandons the lawyer at the two moments their name goes on something — the
schedule of shares inside the Deed of Extrajudicial Settlement, and BIR Form 1801.

**The product identity every phase serves:**

> Inheritance produces the estate computation of record: from one fact set — date of death, family,
> asset schedule — a per-heir schedule of shares and a BIR Form 1801, every line carrying the Civil
> Code article or NIRC section that governs it, defensible enough to paste into the Deed of
> Extrajudicial Settlement and to file.

**Target features (in the audit's dependency order, which is the execution order):**
- Stabilise the deletion milestone; `ci-gates.sh` back to exit 0 (Phase 16)
- One attribution authority — the engine emits the article, nothing else derives one (Phase 17)
- One fact set, keyed on date of death, with a blocking equality check (Phase 18)
- Wizard persistence that actually persists (Phase 19)
- NIRC §§248/249 surcharge and interest (Phase 20)
- A BIR Form 1801 exit — reconciled rows, PDF and CSV (Phase 21)
- The Deed's schedule-of-shares clause as text and DOCX (Phase 22)
- Letterhead, attorney attribution and engine warnings in the PDF (Phase 23)
- Signed, reproducible computation identity (Phase 24)
- Loud refusal where the lawyer has not ruled (Phase 25)
- Scope lock so the deleted 28% cannot grow back (Phase 26)
- An honest `LAUNCH-READINESS.md` (Phase 27)

**Key constraint carried into this milestone:** three points of Philippine law are open and none may
be decided by an agent — Q4 / `LAWYER-04` (Art. 992), Q6 / `LAWYER-06` (donation exceeding the
estate), Q8 / `LAWYER-08` (RA 11642). Phase 25 implements the **refusal**, never the rule.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Design phases and implementation phases in one roadmap | The month of cheap-model execution is the point; putting it in a separate project makes the handoff an untested act of faith | — Pending |
| Screenshot gates use perceptual diff **and** vision rubric | A diff cannot see that a spouse's share reads ₱1.5M instead of ₱1.0M; a rubric cannot see a layout silently collapse. "Passing implies working" needs both | — Pending |
| Money path gated at full depth; SEO/blog routes smoke-only | Smallest catalog that still means "the product works"; cosmetic breakage is not worth the authoring cost | — Pending |
| Legal correctness is its own gate axis, signed off by a lawyer on **test vectors** rather than code | A lawyer can read and sign a named vector citing an article; nobody can sign 18k lines of Rust | — Pending |
| Payment is spec-only for now | No provider exists in the codebase; friends-and-colleagues testing does not need it | — Pending |
| Fine phase granularity (8–12 phases) | Small phases are the primary structural defense against the context drift the owner is worried about | — Pending |
| Fix the nine silent legal defects before building new verification surface | Gates built on top of a silently wrong engine would certify wrongness — the exact failure mode this project exists to prevent | — Pending |
| Turn observability on **first**, before the legal fixes | With `warnings: []` hardcoded, no legal fix is verifiable; every other fix is unobservable until this is done | — Pending |
| Deduplicate rather than gate the three scenario classifiers | No quantity of tests fixes a second implementation; deletion does. Subtraction over addition | — Pending |
| Untrack `engine/target` rather than rewrite history | 880MB on disk stops dirtying the tree on every `cargo test`; a history rewrite is disruptive and buys little | ✓ Good |
| v2.0 orders phases by the audit's dependency ranking, not by visible value | Citation integrity and the shared fact set come before anything that prints a document: a product whose claim is defensibility cannot ship an instrument while its own layers contradict each other about which article governs a heir | — Pending |
| Phase 25 implements refusal, not the rule | Art. 992, the over-estate donation and RA 11642 are all blocked on a lawyer who is unreachable. Refusing to compute is a product decision; reading the statute is not an agent's to make | — Pending |
| No public verification portal in Phase 24 | Reproducibility is what a lawyer buys; the primary consumer of independent re-runnability is an adversary | — Pending |
| Phase 22 ships only the schedule-of-shares clause, not the deed | The clause is the part the engine can defend line by line. The rest of the deed is drafting, and drafting is what the lawyer sells | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-01 — milestone v2.0 (Launch Readiness) recorded; twelve phases roadmapped, none planned or executed*
