# Codebase Concerns

**Analysis Date:** 2026-07-27

**Scope:** `apps/inheritance/` — Rust succession engine (`engine/src/`), React 19 frontend (`frontend/src/`), Supabase multi-tenant backend (`frontend/supabase/migrations/`). Cross-checked against monorepo-root `.github/workflows/` and `apps/inheritance/loops/` for the autonomous "ralph loop" agents that write to this app.

**Legend:** Each finding is labeled **VERIFIED** (read the code and/or executed it and confirmed the claim directly) or **SUSPECTED** (strong circumstantial evidence, not independently executed/confirmed). Ranked by real-world consequence for a lawyer relying on this app's output.

---

## Tier 1 — Silently wrong or misleading legal output

### 1. Per-heir legal breakdown fields are always zero, despite being correctly computed upstream

**VERIFIED by code read + execution.**

`engine/src/step10_finalize.rs:538-542` hardcodes the final output fields to empty/zero for every heir:

```rust
from_legitime: Money::new(0), // TODO: round sub-components
from_free_portion: Money::new(0),
from_intestate: Money::new(0),
...
legitime_fraction: String::new(),
```

But the upstream pipeline (`engine/src/step7_distribute.rs:32` `HeirDistribution` struct, populated in `engine/src/step8_collation.rs:390-405` and `engine/src/step9_vacancy.rs:290-292,448-463`) already computes real fractional values for `from_legitime`, `from_free_portion`, `from_intestate` per heir. `step10_finalize` receives these via `input.final_distributions` (same `HeirDistribution` type) but never reads `d.from_legitime` / `d.from_free_portion` / `d.from_intestate` when building the output — it discards them and writes zero. Only `total` / `net_from_estate` / `gross_entitlement` carry the real number.

**Confirmed by running the engine** (`cargo run --bin inheritance-engine` against the BUG-001 repro JSON, see finding #7 below):

```
Sandra total= 1928571429  from_legitime= 0  from_fp= 0  from_intestate= 0  legitime_fraction= ''
Victor total= 1071428571  from_legitime= 0  from_fp= 0  from_intestate= 0  legitime_fraction= ''
```

Sandra clearly has a nonzero legitime, yet the breakdown reports zero across the board.

**Downstream impact:** `frontend/src/components/results/ShareBreakdownSection.tsx:75,82,89` and `frontend/src/components/pdf/PerHeirBreakdownSection.tsx:64-70` only render the "From Legitime / From Free Portion / From Intestate" lines when the value is `> 0`. Because the value is always `0`, these lines simply never appear — in the app UI **and in the generated legal PDF**. The bottom-line total is correct, but the legal justification (which Civil Code mechanism produced the number — Art. 887 legitime vs. free portion vs. intestate succession) is silently absent from every case, with no error, warning, or visual gap to alert anyone. This is exactly the kind of thing a QA gate must catch: nothing crashes, nothing looks visibly wrong, but a legally material breakdown a lawyer would cite in a pleading is missing.

**Fix approach:** In `step10_finalize.rs`, round `d.from_legitime`, `d.from_free_portion`, `d.from_intestate` (the `Frac` values already on `input.final_distributions[i]`) into `Money` using the same `allocate_with_rounding` mechanism already used for `net_shares` (line 484), instead of hardcoding zero. Also populate `legitime_fraction` from the heir's legitime share fraction.

**Test-catalog implication:** any conformance/output-shape test must assert `from_legitime + from_free_portion + from_intestate ≈ total` per heir (not just that per-heir totals sum to the estate) — the current test suite (411 Rust tests, all passing) does not catch this because it doesn't appear to assert this invariant.

---

### 2. Three independent scenario classifiers exist and disagree with each other

**VERIFIED by code read.**

The "scenario code" (T1-T15 testate / I1-I15 intestate) drives which legal rules apply. It is implemented **three separate times**:

1. **Ground truth:** `engine/src/step3_scenario.rs` (1089 lines) — the Rust engine, backed by 411 passing unit tests.
2. **`frontend/src/wasm/bridge.ts:86-209`** `predictScenario()` — a hand-rolled TypeScript mirror, used only inside `computeMock()` (see finding #3; not wired into any live UI path).
3. **`frontend/src/components/wizard/ReviewStep.tsx:34-63`** `predictScenario()` — a *second*, differently-coded TypeScript mirror, used **live** to render the "Predicted: `<code>`" badge shown to the lawyer before they click "Compute Distribution" (`ReviewStep.tsx:285-291`).

These three implementations do not agree. Concretely, for "legitimate children present, no illegitimate children, spouse present" (a common case):
- Rust engine / bridge.ts's own copy: `T2` if one legitimate child, `T3` if more than one (`bridge.ts:137-141`, mirrors `step3_scenario.rs`).
- `ReviewStep.tsx`: the same fact pattern (`hasLC && hasSS`) always returns `T1` (`ReviewStep.tsx:52`) — a code that `step3_scenario.rs`/`bridge.ts` reserve for legitimate children **with no spouse at all**.

The two TS classifiers also disagree with each other on definitions of `T1`/`T2`/etc. — they are not even copies of the same mapping, they're independently invented.

**Test coverage gap (verified):** `frontend/src/components/wizard/__tests__/ReviewStep.test.tsx:270-296` only asserts the scenario code has the right `T`/`I` *prefix*, never the actual code — so this divergence is invisible to the existing test suite.

**Consequence:** the "Predicted:" badge is explicitly labeled as a prediction and a real "Compute Distribution" button exists, so this is not (yet) directly displayed as a final legal number. But it is a second, wrong classifier confidently shown to the lawyer pre-compute, and it establishes a pattern (hand-rolled reimplementation of engine logic in the UI layer) that is one accidental refactor away from being trusted as ground truth.

**Fix approach:** delete both TS reimplementations; call the real WASM engine (or a purpose-built cheap WASM-backed "classify only" export) for the preview badge, or remove the pre-compute badge entirely.

---

### 3. `computeMock()` is dead code that produces legally meaningless numbers, still exported

**VERIFIED by code read.**

`frontend/src/wasm/bridge.ts:219-311` exports `computeMock()`, which validates input, predicts a scenario via its own divergent classifier (finding #2), then builds "synthetic output — equal split among all heirs" (`bridge.ts:236-287`, comment at line 217: *"Currently a mock — validates input, predicts scenario, returns synthetic output"*). This has nothing to do with Philippine succession law — it is a naive `estate / heir_count` split.

Grep confirms `computeMock` is not imported anywhere except its own definition file (`grep -rn "computeMock" src/ | grep -v wasm/bridge.ts` → no results). The live `compute()` export (`bridge.ts:351-353`) delegates only to `computeWasm()`. So today it is inert.

**Why it's still dangerous:** it is exported from the same module as the real `compute()`/`computeWasm()`, with a similar name and shape, and its doc comment is stale relative to the code around it (the module header at `bridge.ts:1-10` says "Falls back to computeMock() if WASM is not available" — but `compute()` has no such fallback logic; it will throw if WASM fails to init). A future autonomous loop agent grepping for "compute" and finding this function is one `import { computeMock as compute }` away from silently wiring naive equal-split numbers into a real case.

**Fix approach:** delete `computeMock` and its docstring's false claim about the fallback, or gate it behind a `test`-only export path.

---

## Tier 2 — Build / verification integrity (things that could ship broken with nothing catching it)

### 4. The real WASM binary is not in the repo, and nothing in CI ever builds it

**VERIFIED by code + config read.**

- `frontend/.gitignore:4-5` explicitly excludes `src/wasm/pkg/*.wasm` and `src/wasm/pkg/inheritance_engine_bg.js`.
- A filesystem search (`find . -iname "*.wasm"`) across the entire `apps/inheritance` tree finds **zero** `.wasm` files. `frontend/src/wasm/pkg/` on disk contains only `inheritance_engine.d.ts` and `inheritance_engine.js` (checked into git) — the `.js` file itself imports `./inheritance_engine_bg.js` (`inheritance_engine.js:48`), which also does not exist on disk.
- `frontend/package.json` has no `build:wasm` / `wasm-pack` script anywhere in `scripts`. `frontend/Dockerfile` just does `COPY dist /usr/share/nginx/html` — it assumes a pre-built `dist/` exists; it never runs `wasm-pack build` or `npm run build` itself.
- `grep -rn "on:" .github/workflows/*.yml` shows **every** workflow in the monorepo (`inheritance.yml`, `taxklaro.yml`, `ralph-loops.yml`, `daimon-forward.yml`, `podplay-ops.yml`) is triggered only by `workflow_dispatch`. None run on `push` or `pull_request`. `wasm-pack` is installed only inside the `apps/inheritance/loops/*` ralph-loop job steps (`.github/workflows/inheritance.yml:71-72`), as a side effect of an autonomous coding loop, not as a build/deploy pipeline.
- The only evidence `wasm-pack build` has ever actually succeeded against the current pkg layout is `apps/inheritance/loops/forward/wasm/status/stage-2-complete.txt`, timestamped `2026-02-28T16:26:19+08:00` — **five months and many commits before this analysis**. Nothing has re-run it since.

**Consequence:** `frontend/src/wasm/__tests__/conformance.test.ts:29-33`, `scenario-coverage.test.ts:26-30`, `wasm-real.test.ts`, and `wasm-live.test.ts` all call `readFileSync(resolve(__dirname, "../pkg/inheritance_engine_bg.wasm"))` inside `beforeAll`. On a fresh clone (verified: this checkout), this file does not exist — these four test suites cannot execute at all without a human or agent first manually running `wasm-pack build` (or `apps/inheritance/loops/forward/wasm/build-wasm.sh`). There is no way to distinguish "these tests pass" from "these tests were never run" by looking at CI, because there is no CI that runs them automatically.

**Fix approach:** add a `pull_request`/`push`-triggered workflow that installs `wasm-pack`, runs `wasm-pack build --target web --out-dir src/wasm/pkg` in `engine/`, then runs `npm test` and `npm run build` in `frontend/`. This is the single highest-leverage gate for the downstream verification project — right now there is *no* mechanical proof that the shipped frontend even talks to a working WASM engine.

### 5. No CI gate exists on push/PR anywhere in this app

**VERIFIED.** Confirmed by finding #4's workflow audit: all triggers are `workflow_dispatch`. Nothing runs `cargo test`, `cargo build`, `npm test`, `npm run build`, or any linter automatically when code lands on `main`. The only thing that runs unattended is the ralph-loop agents themselves (opt-in, dispatched manually or on a cron for specific loops per `apps/inheritance/loops/_registry.yaml`), and their own convergence criteria are whatever each loop's `PROMPT.md` defines — not an independent gate.

**Fix approach:** this is the gap the downstream verification-first project should close first; every other finding in this document is easier to catch once a basic build+test gate exists.

### 6. `engine/target/` (698 files, ~437MB) is committed to git

**VERIFIED.**

```
$ git ls-files apps/inheritance/engine/target | wc -l
698
$ git ls-files -s apps/inheritance/engine/target | ... | git cat-file -s ... | sum
436.731 MB
```

The monorepo root `.gitignore:14` lists `target/`, but these 698 files were already tracked before that rule existed (or were force-added), and `.gitignore` does not retroactively untrack files. A commit titled `7bfdf1946 chore: monorepo cleanup — remove junk PNGs, stale worktrees, tracked build artifacts, dead projects` ran `git rm --cached` on other projects' `node_modules`/build output but **did not touch `apps/inheritance/engine/target/`** — verified via `git show 7bfdf1946 --stat`, which shows only unrelated `@babel/*` node_modules paths removed. `apps/inheritance/engine/` is 792MB on disk; more than half of that is git-tracked build output that should never have been committed.

**Fix approach:** `git rm -r --cached apps/inheritance/engine/target` in a dedicated commit; confirm root `.gitignore`'s `target/` rule then keeps it out permanently.

---

## Tier 2b — Stale documentation

### 7. `engine/BUGS.md` BUG-001 is marked "Status: Open" but does not reproduce at HEAD

**VERIFIED by execution, with a caveat.**

`engine/BUGS.md:1-68` documents "BUG-001: Multiple disinheritances produce incorrect distribution (sum > estate)," dated `2026-02-24`, status `Open`, with a full JSON repro and documented buggy output (sum = ₱60,000,000, double the ₱30,000,000 estate).

I built and ran the current engine (`cargo run --bin inheritance-engine`) against the exact repro JSON from `BUGS.md`. Current output:

```
Sandra 1928571429
Victor 1071428571
Tomas  0
Ursela 0
SUM    3000000000   (== net_distributable_estate.centavos, exactly)
```

The sum equals the estate exactly; Tomas and Ursela (the two disinherited heirs) correctly receive `P0`. **The documented bug does not reproduce with the documented repro case.**

This is reported as a **documentation-staleness** concern, not a "bug is fixed, celebrate" note, for two reasons: (a) I could not find any commit history explaining the fix — `git log -- apps/inheritance/engine/src/step7_distribute.rs` shows only a single squashed `move:` commit, so there's no way to confirm *when or how* this changed; (b) I only tested the exact 2-disinheritance, no-representation case from `BUGS.md` — I did not exhaustively test 3+ disinheritances or disinherited heirs with surviving children (representation). A stale "Open" bug doc is itself a hazard: a future dev or ralph-loop agent reading `BUGS.md` may (a) avoid testing/exercising a feature that actually works, skipping a regression test that should now be added and kept green, or (b) waste time re-fixing something already fixed, or (c) trust the "Workaround: use only one disinheritance per will" advice long after it stopped being necessary, constraining the product for no reason.

**Fix approach:** re-verify BUG-001 with the exact repro plus 2-3 variants (3 disinheritances; disinherited child with living children) as part of closing this doc, then either mark it Fixed with a regression test added at `engine/tests/` and the fixing commit noted, or narrow the "Open" claim to the specific untested variant that still fails.

---

## Tier 3 — Security / multi-tenancy (Supabase, `frontend/supabase/migrations/`)

Read in order: `001_initial_schema.sql`, `004_shared_case_rpc.sql`, `005_case_deadlines.sql`, `006_case_documents.sql` (no-op), `007_conflict_check.sql`, `009_cases_intake_data.sql`, `010_rls_org_scope.sql`, `011_create_org_rpc.sql`, `012_pdf_storage.sql`. (Numbers 002, 003, 008 do not exist in this checkout — gap, not investigated further; likely squashed/renumbered during the app's extraction into its own sub-monorepo.)

### 8. Two overloaded `get_shared_case` RPCs coexist with different grants and different return shapes

**VERIFIED by reading; NOT verified at runtime** (no local Supabase instance was provisioned for this pass).

- `004_shared_case_rpc.sql:11-29` creates `get_shared_case(p_token UUID)`, `SECURITY DEFINER`, and explicitly `GRANT EXECUTE ... TO anon` (line 29) — correct pattern for an intentionally public, unauthenticated share-link lookup.
- `011_create_org_rpc.sql:39-64` creates a **second overload**, `get_shared_case(p_token TEXT)`, also `SECURITY DEFINER SET search_path = public`, returning **more columns** than the first (`tax_output_json`, `comparison_output_json` in addition to the original fields) — but with **no explicit `GRANT`/`REVOKE`** statement anywhere in that migration. Neither migration drops the other's version, so both persist as overloads of the same function name.
- The frontend calls `supabase.rpc('get_shared_case', { p_token: token })` (`frontend/src/lib/share.ts:31-33`) where `token` is a plain JS `string` — it does not disambiguate which overload PostgREST should resolve to.

By default, PostgreSQL grants `EXECUTE` on newly created functions to the `PUBLIC` pseudo-role (which `anon`/`authenticated` inherit) unless explicitly revoked; migration `011` never revokes it. So in the likely-default case, `get_shared_case(TEXT)` is *also* callable anonymously, exposing tax/comparison output through a second, less-reviewed code path than the one that was deliberately hardened in `004`. It is also plausible PostgREST raises a "function name is not unique" ambiguity error, breaking sharing outright — either way this is an unreviewed hazard sitting on the one endpoint in this schema deliberately designed for anonymous access. This needs to be checked against an actual running Supabase instance to know which behavior is real.

**Fix approach:** drop one of the two overloads (keep the UUID-typed one, matching the actual `cases.share_token UUID` column type; `TEXT` param requires an implicit cast on every call), and explicitly `REVOKE ALL ... FROM PUBLIC` at the top of migrations creating `SECURITY DEFINER` functions, then `GRANT` only to the specific roles intended.

### 9. Share links never expire

**VERIFIED by reading.** `cases.share_token` (`001_initial_schema.sql:185`) is a `UUID UNIQUE DEFAULT gen_random_uuid()` — this part is fine, it is a proper 128-bit random token, not guessable. But `share_enabled` (`001_initial_schema.sql:186`) is a plain boolean with **no expiry column** and no cron/trigger to auto-expire it. Contrast with `organization_invitations.expires_at` (`001_initial_schema.sql:77`, defaults to `NOW() + INTERVAL '7 days'`), which shows the schema author knows how to model expiry — it just wasn't applied to case share links. Any link ever enabled for a case remains valid indefinitely (including after the underlying case's contents changed) until someone remembers to manually disable it.

**Fix approach:** add `share_expires_at TIMESTAMPTZ` to `cases`, check it in `get_shared_case`'s `WHERE` clause, and expose a "link expires in N days" control in `frontend/src/lib/share.ts` / the sharing UI.

### 10. No `storage.objects` RLS policies exist anywhere in the tracked migrations

**VERIFIED (absence).** `grep` across all of `frontend/supabase/migrations/*.sql` for `storage.objects` or `bucket` returns nothing. `frontend/src/lib/firm-profile.ts:138-156` uploads/deletes firm-logo files to a Supabase Storage bucket (`LOGO_BUCKET`) keyed by `userId`-scoped folder paths, and `012_pdf_storage.sql` creates a `case_pdfs` tracking table (with a correct org-scoped RLS policy) but there is no corresponding storage-bucket migration for whatever bucket case PDFs actually land in. Whatever access-control exists for these buckets today lives only in the (unversioned) Supabase dashboard/project config — it cannot be reviewed, diffed, or regression-tested from this repository. This is an audit gap, not a confirmed leak.

**Fix approach:** commit explicit `CREATE POLICY` statements on `storage.objects` (scoped by folder-name = `auth.uid()` for logos, by org membership via `case_pdfs.storage_key` lookup for case PDFs) so bucket ACLs are reviewable the same way table RLS is.

### 11. `cases` INSERT policy doesn't pin `user_id` to the inserting user

**VERIFIED by reading.** `001_initial_schema.sql:201-206`, policy `cases_org_member`, checks only `org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid())` for both `USING` and `WITH CHECK` — it never constrains `user_id = auth.uid()`. Any member of an org can insert (or, since this is `FOR ALL`, update) a case row with an arbitrary `user_id` value as long as `org_id` matches their own membership. This is misattribution risk (a case could be attributed to a colleague who didn't create it) within a tenant, not a cross-tenant data leak — lower severity, but worth tightening given how much downstream logic (deadlines, documents, notes) keys off `cases.user_id`.

### 12. Multi-tenancy model was retrofitted; older `_own`-style policies are still visible as copy-paste bait

**VERIFIED by reading.** `001_initial_schema.sql` originally scoped `case_deadlines` (`:281-282`), `case_documents` (`:312-313`), and `conflict_check_log` (`:340-341`) by `auth.uid() = user_id` only — meaning teammates in the same org/firm could not see each other's deadlines, document checklists, or conflict-check history. `010_rls_org_scope.sql` correctly `DROP POLICY IF EXISTS` + recreates all three as org-scoped (via a new `user_org_ids()` `SECURITY DEFINER` helper, properly pinned with `SET search_path = public`). The current *effective* state is correct. The concern is forward-looking: `001_initial_schema.sql` is still the file most likely to be read/copied as "the schema pattern" (it's the biggest, most complete-looking migration), and it contains three examples of the wrong (`user_id`-only) scoping pattern sitting right next to the org-scoped `clients`/`cases` tables. Any new table added by a future agent that copies the nearest example uncritically has a good chance of reintroducing single-user scoping in a multi-seat firm product.

**Fix approach:** either add a short comment in `001_initial_schema.sql` at each superseded policy noting "superseded by 010_rls_org_scope.sql — do not copy this pattern," or (cleaner) squash the superseded policies out of `001` in a reviewed migration-history rewrite if this project ever resets its migration baseline.

---

## Tier 4 — Money-unit integrity (pesos vs. centavos)

### 13. Two divergent money-storage conventions coexist across the two wizards

**VERIFIED by reading.**

- **Succession wizard:** `frontend/src/components/shared/MoneyInput.tsx` converts user-typed pesos to centavos on every keystroke and on blur (`pesosToCentavos()` at lines 67 and 85) and stores **centavos** directly in React Hook Form field state. Display re-derives pesos via `centavosToPesos()` for rendering.
- **Estate-tax wizard:** tab components (e.g. `frontend/src/components/tax/tabs/RealPropertiesTab.tsx:36-48`) use plain `<Input type="number">` bound directly to raw peso fields (`fmvTaxDec: 0`, etc.) — **pesos** are stored in RHF state throughout the entire wizard, and centavos conversion happens exactly once, at the very end, in `frontend/src/lib/estate-tax-engine/pipeline.ts`'s `wizardStateToEngineInput()` (`toCentavos()` helper defined at `pipeline.ts:113`, applied to every monetary field from line ~118 through line ~300).

I read the full current `pipeline.ts` adapter and did not find any remaining unconverted monetary field (every `amount`/`fmv`/`FMV` field flows through `toCentavos()`). This matches a real, already-fixed bug: commit `27a114a6d` ("fix(estate-tax): convert wizard peso values to centavos in adapter") shows a diff where roughly a dozen fields (`unpaidMortgages`, `unpaidTaxes`, `casualtyLosses`, `vanishingDeductionProperties`, `publicUseTransfers`, `funeralExpenses`, `judicialAdminExpenses`, `medicalExpenses`, `ra4917Benefits`, `foreignTaxCreditClaims`) were **not** converted before that fix, and commit `c2fc918c4` updated tests to match.

**Standing hazard (not a currently-active bug):** the fact that one wizard stores centavos-from-first-keystroke and the other stores pesos-until-the-adapter is itself a footgun for the next change. A dev/agent who reuses `MoneyInput` inside the estate-tax wizard (natural thing to do — same app, same look) would cause **double conversion** the next time `wizardStateToEngineInput` runs `toCentavos()` on an already-centavos value. Equally, copying a tax-wizard-style raw-number `<Input>` into the succession wizard would under-convert (pesos submitted directly as "centavos" to the Rust engine, off by 100x). Neither has happened yet as far as I can tell from the current code, but there is no type-level guard (e.g. a branded `Pesos` vs `Centavos` TS type) preventing it — both are plain `number`.

**Fix approach:** introduce distinct nominal types (e.g. `type Pesos = number & { __brand: 'pesos' }`) for the two money representations so a compile error catches a `Pesos` value flowing into a field typed `Centavos` (or vice versa), rather than relying on convention + code review.

---

## Tier 5 — Fragile areas / structural risk for an autonomous implementing agent

### 14. Rust engine: large, high-blast-radius files, but strong test coverage (positive finding)

**VERIFIED.** `cargo test` in `engine/` passes cleanly: **411 tests, 0 failed**. This is a real strength — the succession engine is the one part of this codebase with a credible ground-truth test suite. But the files are large and tightly coupled to the 10-stage pipeline (each stage depends on exact struct shapes from the previous one):

| File | Lines |
|---|---|
| `engine/src/step7_distribute.rs` | 2173 |
| `engine/src/step6_validation.rs` | 2026 |
| `engine/src/step5_legitimes.rs` | 1745 |
| `engine/src/step9_vacancy.rs` | 1636 |
| `engine/src/step8_collation.rs` | 1382 |
| `engine/src/step10_finalize.rs` | 1230 |
| `engine/src/step3_scenario.rs` | 1089 |
| `engine/src/step2_lines.rs` | 1044 |
| `engine/src/step1_classify.rs` | 1015 |

An autonomous agent asked to "add a field to the output" or "fix a distribution edge case" is likely to touch one of these files without full context of the other nine pipeline stages — finding #1 (the zeroed breakdown fields) is a concrete example of exactly this failure mode: a `TODO` was left in step10 and nobody closed the loop with the data step7-9 already computed.

### 15. Estate-tax computation is a single, un-cross-checked TypeScript implementation

**VERIFIED.** `frontend/src/lib/estate-tax-engine/` (12 non-test modules, ~4700 lines: `pipeline.ts` 638, `ordinary-deductions.ts` 459, `types.ts` 412, `advisor.ts` 341, `special-deductions.ts` 163, `regime-detection.ts` 251, `explainer.ts` 245, `sensitivity.ts` 266, plus `gross-estate.ts`, `spouse-share.ts`, `tax-rate.ts`, `foreign-tax-credit.ts`, `amnesty.ts`, `nra-proportional.ts`, `sec87-exclusions.ts`, `validation.ts` not separately measured here) implements BIR Form 1801 / TRAIN law / estate-tax-amnesty computation entirely in the browser, with no Rust/WASM equivalent and no independent engine to diff against. It has substantial unit test coverage of its own (10 `__tests__/*.test.ts` files under this directory), which is good, but unlike succession (Rust ground truth + TS reimplementations that can at least be *compared*), there is nothing to compare estate-tax output against except the tests the same team wrote for the same implementation. Money-unit bugs here (finding #13) went undetected until manually found and fixed, because there was no second engine to disagree with.

### 16. `ReviewStep.tsx`'s live scenario prediction is untested against ground truth

**VERIFIED**, restated from finding #2 for the fragile-area lens: this file (392 lines) mixes presentational logic, a hand-rolled classifier, and an 8-rule ad hoc warnings engine (`computeWarnings()`, `ReviewStep.tsx:65-193`) — all untested against the Rust engine's actual behavior. Any future change to `step3_scenario.rs`'s classification rules will not automatically surface as a test failure here; the two will just silently drift further apart.

---

## Summary — what could ship broken without anything catching it

1. **No CI gate exists at all** (findings #4, #5) — this is the root cause that lets everything else below go unnoticed.
2. **The frontend cannot even build/test against a real WASM engine without a manual step** (#4) that nothing automates or re-verifies.
3. **The legal breakdown shown to lawyers (legitime vs. free portion vs. intestate) is silently empty in every case** (#1) — verified by actually running the engine.
4. **Three scenario classifiers disagree** (#2), one of which is user-facing (#2) and one of which is dead but exported and dangerous if wired in (#3).
5. **A documented "Open" bug does not reproduce** (#7) — meaning the doc itself cannot be trusted as a source of "what's still broken," which is exactly the failure mode a verification-first project must not inherit.
6. **Sharing/multi-tenancy has two overlapping RPC surfaces and non-expiring tokens** (#8, #9) that have never been exercised against a real Supabase instance in this analysis pass.

---

*Concerns audit: 2026-07-27*
