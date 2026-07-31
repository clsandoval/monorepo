# Phase 10 Research — Journey Gate Infrastructure

**Measured:** 2026-07-31, live in this tree. Every number below was produced by a command run during
planning, not recalled. Where a claim could not be measured it is labelled as unmeasured.

---

## 1. What this phase is, and what it is not

ROADMAP Phase 10 builds **seams**, not journeys. Phases 11 and 12 write the per-step gates for
account/org/case and for the two wizards. Phase 10's four requirements are the machinery those gates
call:

| Requirement | One-line obligation |
|---|---|
| JRNY-01 | Any UI state seedable directly — DB row, `localStorage` draft, route param, app context — with the seams documented |
| JRNY-09 | A rubric is a fixed list of yes/no assertions returning structured output, never free-form judgment |
| JRNY-10 | A perceptual-diff failure is distinguishable from a rubric failure; references have a documented re-approval flow |
| JRNY-12 | Every gate failure emits the screenshot, the diff, and the failing assertion as durable artifacts |

The phase therefore ends with a harness plus **one gate that tests the harness against fixtures** —
not a gate that screenshots the real app. That distinction is deliberate and is defended in §7.

---

## 2. Starting state, measured

### 2.1 There is no browser tooling at all

`frontend/package.json` has **no** Playwright, Puppeteer, Cypress, pixelmatch, pngjs or sharp
dependency. Confirmed on disk:

```
$ ls -d frontend/node_modules/playwright* frontend/node_modules/@playwright
(no matches)
$ ls -d frontend/node_modules/pixelmatch frontend/node_modules/pngjs frontend/node_modules/sharp
(none)
```

`.planning/codebase/TESTING.md:20` already records the one misleading hit: `@vitest/browser-playwright@4.0.18`
appears at `frontend/package-lock.json:12363` purely as vitest's own optional peer dependency. There
is no `test.browser` block in `frontend/vitest.config.ts` (read in full — it declares
`environment: 'jsdom'` and nothing else). **It is not wired up and does not mean browser testing exists.**

So Phase 10 introduces the first browser automation in this repo. That is a dependency addition, and
§3 measures whether it is actually installable here rather than assuming it.

### 2.2 The seeding seams are already *documented* — the executable half is missing

`.planning/codebase/ARCHITECTURE.md:288` holds a 15-row **State Boundaries and Seeding Seams** table
naming, for every piece of UI state, where it lives and how to seed it. JRNY-01 has two halves —
"can be seeded directly" and "the seams are documented". The documentation half is largely already
satisfied by that table; what does not exist is any code a gate can call.

Two seam facts were re-verified at their use sites rather than trusted from the table:

- `frontend/src/components/intake/GuidedIntakeForm.tsx:24` — `const INTAKE_STORAGE_KEY = 'inheritance-intake-draft'`,
  read at line 41, written at 51, cleared at 84 and 231.
- `frontend/src/components/quick-calc/QuickCalcWidget.tsx:14` — `const SESSION_KEY = 'quick-calc-used'`,
  read at 52, written at 69. It is `sessionStorage`, not `localStorage`.

### 2.3 The one real seeding gap: wizard step index is not addressable

This is the finding that shapes plan 10-05. Both wizards hold their position in local React state
with no URL encoding:

- `frontend/src/components/wizard/WizardContainer.tsx:76` — `const [currentStepIndex, setCurrentStepIndex] = useState(0)`
- `frontend/src/components/tax/EstateTaxWizard.tsx:51` — `const [activeTab, setActiveTab] = useState<TabIndex>(0)`

`ARCHITECTURE.md` states the consequence plainly: *"Not URL-encoded — cannot deep-link to 'step 3';
must click Next, or mount the component with custom test harness state."*

A React prop does not solve this. Phases 11 and 12 drive a **real browser**, which cannot pass props
into a component tree — it can only set a URL, a cookie, or web storage. ROADMAP Phase 10 success
criterion 1 names "a route param" explicitly. So the seam must be URL-borne, and plan 10-05 adds it.

Measured blast radius of the wizard change:

```
$ grep -c "currentStepIndex" frontend/src/components/wizard/WizardContainer.tsx
14
```

All fourteen uses are reads or the two existing setter calls at lines 96 and 102. Nothing outside the
component references the state, so an additional *initial value* source is additive.

### 2.4 Gate conventions this phase must obey

Read from `gates.manifest.json`, `gates.manifest.lock`, `GATES.md` §1 and `scripts/ci-gates.sh`:

- The manifest is the single source of truth; `ci-gates.sh` hardcodes no gate command and runs gates in `order`.
- `gates.manifest.lock` freezes `{id, command, blocking}` and may only **grow**. `order`, `name`,
  `proves` and `requirements` are deliberately unlocked — `GATES.md` §1 says so in as many words:
  *"`order` is deliberately not covered by the lock, so reordering is legal."*
- Every gate must print `GATE-SKIPS total=<n> skipped=<n>` on stdout. Measured across the existing
  scripts, nine do so (`check-gate-skips.mjs:418`, `check-lawyer-agenda.mjs:84`,
  `check-plan-closed-world.mjs:448`, `check-gate-results.mjs:279`, `check-commit-discipline.mjs:187`,
  `check-gate-manifest.mjs:231`, `check-observability.mjs:85`, `check-coverage.mjs:87`, and the
  runner's own accounting). A gate with no such line fails G8.
- `.gate-runs/` is gitignored; the root `.gitignore` explains it is per-run detail, regenerated on
  every exit path, and must not be committed because a concurrent auto-committer runs on this monorepo.

### 2.5 The gate ordering constraint, and which id is free

Current orders: G5=1, G6=2, G7=3, G12=4, G13=5, G1=6, G2=7, **G3=8**, G4=9, G10=10, G11=11, G8=12, G9=13.

`ci-gates.sh` still **halts at G3** on Phase 5's unresolved OBS-05/OBS-06 product decision. Any gate
ordered after 8 therefore never executes. Phases 6 and 9 both hit this and both resolved it the same
way — place the new static gate ahead of G3. This phase does the same.

`G14` is **not free**. Phase 9's plan `09-06-PLAN.md:59` reserves `G14` for
`scripts/check-single-source.mjs`, and its SUMMARY records the plan as *"Not started"* with
`requirements-blocked: [EXT-02]`. Confirmed the id is unused today:

```
$ grep -c '"G14"' gates.manifest.json gates.manifest.lock
gates.manifest.json:0
gates.manifest.lock:0
```

Reserved-but-unregistered is still reserved. **Phase 10's gate takes `G15`** so a later 09-06 replan
does not collide. `G9` stays last, per the constraint Phase 4 measured
(`check-gate-results.mjs` fails `RESULTS INCOMPLETE` on any gate it sees as `not-run`).

### 2.6 Environment

```
$ node -v && npm -v            → v20.19.5 / 10.8.2
$ supabase --version           → 2.110.0
$ docker info                  → reachable
$ ss -ltn | grep 55            → 55321 55322 55323 55324 55327 bound (this app's own stack, up now)
$ ss -ltn | grep -c :4173      → 0   (vite preview default port is free)
```

The local Supabase stack Phase 3 built is **running right now**. That matters for §7's scope decision.

---

## 3. Feasibility, probed end to end rather than assumed

The whole phase rests on "can this environment screenshot a page and diff two PNGs offline". That was
tested for real in a scratch directory, not reasoned about.

```
$ npm install playwright@1.56.1 pixelmatch@7.2.0 pngjs@7.0.0
added 4 packages, and audited 5 packages in 2s
found 0 vulnerabilities                                    (exit 0)

$ npx playwright install chromium
Chromium Headless Shell 141.0.7390.37 (playwright build v1194)
downloaded to /home/clsandoval/.cache/ms-playwright/chromium_headless_shell-1194   (exit 0)
```

Then a single script that launches chromium, screenshots, evaluates a DOM predicate, mutates the page,
screenshots again, and pixel-diffs the pair:

```
RUBRIC assertion spouse_share_is_1M = true
DIFF pixels = 69  diff.png bytes = 11448
PROBE_EXIT=0
```

Four things are now measured facts rather than hopes:

1. The npm registry is reachable from this machine (`npm view pixelmatch version` → `7.2.0`).
2. Playwright 1.56.1 installs and its chromium downloads (~104 MiB) and launches headless.
3. `pngjs` + `pixelmatch` read the emitted PNGs and produce a **diff image buffer**, which JRNY-12
   requires as a durable artifact.
4. A deterministic DOM predicate distinguishes `₱1,000,000.00` from `₱1,500,000.00` — precisely the
   case `PROJECT.md:111` says a perceptual diff cannot be trusted to catch.

Pinned versions for the plans: **playwright 1.56.1, pixelmatch 7.2.0, pngjs 7.0.0.** These are the
exact versions probed; no plan may resolve a range.

---

## 4. The decisions this phase must make

A closed-world plan names every decision the executor would otherwise invent
(`.planning/PLAN-STANDARD.md` §1). Five decisions are made here so no plan leaves them open.

### D-1. A rubric assertion is a deterministic predicate, not a model call

JRNY-09: *"a fixed list of yes/no assertions returning structured output, never free-form judgment."*

Two possible backends:

- **A model vision call.** Needs an API key, network, and money, and reintroduces the nondeterminism
  the requirement's own words exist to remove. GitHub Actions has no key configured in this repo
  (`.github/workflows/inheritance.yml` was read; it sets up Node and Rust and invokes
  `scripts/ci-gates.sh`, and declares no model secret).
- **A predicate evaluated against the live page.** Deterministic, free, offline, and yes/no by
  construction.

**Decision: predicates.** The rubric is a committed JSON document; each assertion names a `kind` from
a closed set, a `selector`, and an expected value. The evaluator rejects an unknown `kind` rather than
interpreting it — that rejection is what makes "never free-form judgment" mechanically true rather
than a promise.

This does not weaken the pairing `PROJECT.md:111` asks for. That entry justifies two mechanisms by
their blind spots: *"A diff cannot see that a spouse's share reads ₱1.5M instead of ₱1.0M; a rubric
cannot see a layout silently collapse."* The first blind spot is exactly what a text predicate covers,
and §3 measured it covering it. Both mechanisms survive; only the rubric's backend is pinned to
something reproducible. A model backend can be added later behind the identical structured schema
without touching a caller.

The closed `kind` set, fixed here so no plan invents one:

| `kind` | Passes when |
|---|---|
| `text_equals` | The selector's trimmed `innerText` equals `expect` exactly |
| `text_contains` | The selector's `innerText` contains `expect` as a substring |
| `text_absent` | No element matching the selector has `innerText` containing `expect` |
| `element_visible` | Exactly one element matches the selector and it is visible |
| `element_absent` | Zero elements match the selector |
| `element_count` | The number of matching elements equals the integer `expect` |
| `attribute_equals` | The selector's `attr` attribute equals `expect` |
| `no_console_error` | Zero `console.error` events and zero page errors were captured during the step |

Eight kinds. JRNY-11 (Phase 12) needs `no_console_error`, which is why it is in the set now.

### D-2. Failure kinds are named constants, and there are five

JRNY-10 needs a diff failure to be distinguishable from a rubric failure. Distinguishable by a human
reading a log is not enough for a gate; the runner must be able to branch on it. Fixed vocabulary:

| Marker | Meaning |
|---|---|
| `RUBRIC FAILURE` | At least one rubric assertion returned false |
| `DIFF FAILURE` | Pixel difference exceeded the reference's declared `maxDiffPixels` |
| `REFERENCE MISSING` | No approved reference exists for this step id |
| `REFERENCE SIZE MISMATCH` | Reference and actual differ in width or height, so no pixel comparison is meaningful |
| `STEP ERROR` | Navigation, seeding, or browser launch threw before any assertion could run |

A step that fails both a rubric assertion and the diff reports **both** markers. Collapsing them to
one would destroy the very distinction JRNY-10 asks for.

### D-3. References are per-step PNGs with a sidecar tolerance, and re-approval is an explicit command

Layout, fixed here:

```
frontend/journey/references/<stepId>.png       the approved image
frontend/journey/references/<stepId>.json       { "maxDiffPixels": <int>, "approvedOn": "<ISO date>", "approvedBy": "<string>" }
```

Default `maxDiffPixels` is **0**. Re-approval is `node journey/approve.mjs <stepId>`, which copies the
last run's `actual.png` over the reference and rewrites the sidecar. It refuses to run when no
artifact directory exists for that step, so approval can never invent an image.

Approval is deliberately a **separate command, never a flag on the gate**. A gate that can approve its
own reference is a gate that goes green by rewriting its own expectation — the exact silent-wrongness
this project ranks as worse than loud failure.

### D-4. The harness is plain `.mjs`, not TypeScript

Every existing gate script in `scripts/` is `.mjs`. More decisively: `frontend/tsconfig.json`'s
`include` covers `src` only, so anything under `frontend/journey/` would be invisible to `tsc -b`
anyway, and adding it to `include` would drag a new dependency's types into gate G4. Plain `.mjs`
keeps G4 untouched and matches the established convention.

### D-5. The harness lives under `frontend/`, and the gate command `cd`s there

`playwright` resolves from `frontend/node_modules`. A script at `apps/inheritance/scripts/*.mjs`
cannot `import 'playwright'` — Node would not resolve it. Gate G3 already establishes the pattern
(`cd frontend && npm run test:gate`), so:

- Harness: `frontend/journey/*.mjs`
- Gate command: `cd frontend && node journey/selftest.mjs`

---

## 5. The landmine: perceptual diffs are not portable across machines

Font rasterisation and antialiasing differ between a developer's Linux desktop and a CI container.
A golden PNG captured on one will not match byte-for-byte on the other, and a gate that fails for that
reason is noise that trains the loop to ignore it.

This was **not** measured — no CI run has happened (STATE.md records 25+ unpushed commits and a
workflow that has never executed). Treating it as solved would be exactly the unmeasured claim this
project forbids.

Two mitigations, both fixed into the plans:

1. **Determinism settings are mandatory at launch**, not optional: fixed viewport `1280×800`,
   `deviceScaleFactor: 1`, `reducedMotion: 'reduce'`, `forcedColors: 'none'`, and a CSS injection that
   sets `animation: none !important; transition: none !important; caret-color: transparent !important`.
   These remove blinking carets and in-flight animations, which are the largest avoidable source of
   run-to-run drift on the same machine.
2. **Phase 10 commits no golden image of the real app.** The self-test gate generates its reference at
   run time from a committed HTML fixture, so G15 tests the diff *mechanism* without inheriting the
   font-portability problem. Committing real references is Phases 11–12's work, and `approve.mjs` plus
   the documented flow is precisely the tool they will need.

Recorded for Phase 11: if CI and local references diverge, the resolution is a documented re-approval
run on the CI platform, not a widened tolerance. Raising `maxDiffPixels` to clear a red gate is
weakening a check.

---

## 6. Scope boundary — what Phase 10 does not build

- **No gate that screenshots the real application.** Phases 11 and 12 own those.
- **No golden reference of any real app screen.** §5.
- **No DB-touching blocking gate.** The seeding library talks to Supabase, but registering a gate that
  needs Docker follows Phase 3's precedent exactly: `scripts/check-env-ready.mjs` was built in Phase 3
  and deliberately **left out of the manifest** because GitHub Actions has neither Docker nor a
  Supabase stack. STATE.md's Pending Todos assigns that registration to Phase 11. Phase 10 adds no
  second unregisterable gate.
- **No change to any of the six ledgers.** `frontend/test-baseline.json`, `gate-skips.lock`,
  `engine/defect-baseline.json`, `assertion-baseline.json`, `coverage-zero.lock` and
  `gates.manifest.lock` are read-only here except for the single permitted **append** of G15 to the
  manifest and its lock.

---

## 7. Why the seeding library is proven by a live-DB smoke script, not by G15

The seeding library must really insert rows, or JRNY-01 is a claim rather than a capability. But a
blocking gate that needs Docker cannot run in CI (§6).

Resolution, split cleanly:

- The parts of seeding that need **no** database — `localStorage`, `sessionStorage`, route params,
  and search params — are exercised by **G15** against a committed HTML fixture. They run everywhere.
- The part that needs a database — inserting an org/case row and installing an auth session — is
  exercised by `frontend/journey/seed-smoke.mjs`, run **on demand** against the local stack that §2.6
  measured as currently up. Plan 10-05 requires the executor to run it and paste its output, so the
  capability is proven by observation during execution even though it is not a registered gate.

This mirrors Phase 3's handling of `check-env-ready.mjs` and needs no new precedent.

---

## 8. Validation Architecture

The phase's four requirements each get an independent observable, and each observable is checkable by
a command an executor runs and pastes.

| Requirement | Observable | Command that produces it |
|---|---|---|
| JRNY-01 | Web-storage, route-param and search-param seeding all take effect in a real browser; DB seeding inserts real rows; every seam has a documented entry | `cd frontend && node journey/selftest.mjs` and `cd frontend && node journey/seed-smoke.mjs` |
| JRNY-09 | A rubric with a passing and a failing assertion returns structured JSON naming each assertion id and its boolean; an unknown `kind` is rejected rather than interpreted | `cd frontend && node journey/selftest.mjs` |
| JRNY-10 | The same fixture yields `RUBRIC FAILURE` and `DIFF FAILURE` independently and both together; `REFERENCE MISSING` is distinct from both; `approve.mjs` turns a missing reference into a pass | `cd frontend && node journey/selftest.mjs` |
| JRNY-12 | A failing step leaves `actual.png`, `reference.png`, `diff.png`, `assertions.json` and `FAILURE.txt` on disk, all non-empty | `cd frontend && node journey/selftest.mjs` then `ls -la .journey-runs/*/` |

**Negative controls.** Three of the four are asserted in both directions, because a check that has
never been observed failing is not known to be a check:

- The rubric evaluator is run against a fixture that violates one assertion, and the failure must name
  that assertion's id.
- The diff is run against a mutated fixture, and must report a nonzero pixel count over tolerance.
- `approve.mjs` is run with no artifact directory present, and must refuse.

**Sampling adequacy.** Eight rubric kinds exist (D-1) and G15 exercises **all eight** — a harness that
tested two of them would leave six paths whose first real exercise is a Phase 12 gate, where a bug in
the harness would be misread as a bug in the app.

---

## 9. Open questions

**None blocking.** No point of Philippine law arises anywhere in this phase — every task installs a
dependency, writes a browser-driving helper, or registers a gate. Nothing is added to
`.planning/LAWYER-AGENDA.md`.

Two items are recorded, not decided:

1. Cross-platform reference portability is unmeasured until CI actually runs (§5). Phase 11 owns it.
2. `G14` remains reserved for a future 09-06 replan (§2.5). If that plan is revived it must take an
   `order` other than 6, which is now G15's.
