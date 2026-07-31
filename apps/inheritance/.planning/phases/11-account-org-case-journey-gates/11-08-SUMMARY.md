---
phase: 11-account-org-case-journey-gates
plan: 08
subsystem: gates
tags: [gates, manifest, ci, journey]
requires: ["11-04", "11-05", "11-06", "11-07"]
provides:
  - "G16 journey registry integrity, static, order 7"
  - "G18 tenant isolation, order 12"
  - "G17 live journey run, order 13"
  - "GATES.md section 13"
  - "CI provisioning for the Supabase CLI, the local stack and chromium"
affects:
  - scripts/check-journey-registry.mjs
  - gates.manifest.json
  - gates.manifest.lock
  - GATES.md
  - .github/workflows/inheritance-ci.yml
tech-stack:
  added: []
  patterns:
    - "A static half of a live gate, importing the closed sets rather than re-typing them"
key-files:
  created:
    - scripts/check-journey-registry.mjs
  modified:
    - gates.manifest.json
    - gates.manifest.lock
    - GATES.md
    - gate-results.json
    - .github/workflows/inheritance-ci.yml
key-decisions:
  - "G17 and G18 are separate gates so a red run says whether a screen or a tenant boundary regressed"
  - "The GATES.md section-1 table and the 'now fourteen' paragraph were corrected too, not only the run count, so the document matches the manifest"
requirements-completed: [JRNY-04, COV-06]
duration: 22 min
completed: 2026-07-31
---

# Phase 11 Plan 08: Gate Registration Summary

Three gates registered — G16 static registry integrity at order 7, G18 tenant isolation at 12, G17
the live journey run at 13 — plus `GATES.md` section 13 and the CI steps the two live gates need.
`bash scripts/ci-gates.sh` now exits 0 with **`ALL GATES PASSED (17/17)`**.

- Tasks: 6 · Two commits: `1c7daac02` (app) and `a591b3e4a` (workflow)

## Verification (real output)

### Task 1 — the static gate, and its failure path observed

```
$ node scripts/check-journey-registry.mjs
GATE-SKIPS total=210 skipped=0
JOURNEY REGISTRY ok steps=15 references=15
REGISTRY_EXIT=0
$ grep -c "child_process|fetch(|playwright" scripts/check-journey-registry.mjs
0
$ node scripts/check-journey-registry.mjs | grep -c "GATE-SKIPS"
1
```

Red on a removed reference, green on restore — observed, not assumed:

```
$ mv frontend/journey/references/auth-signup.png <elsewhere>
$ node scripts/check-journey-registry.mjs
GATE-SKIPS total=209 skipped=0
REFERENCE MISSING — step 'auth-signup' has no approved reference at journey/references/auth-signup.png
REGISTRY_EXIT_BROKEN=1
$ mv <back> && node scripts/check-journey-registry.mjs
GATE-SKIPS total=210 skipped=0
JOURNEY REGISTRY ok steps=15 references=15
REGISTRY_EXIT_RESTORED=0
```

### Task 2 — the manifest and the lock

```
$ node scripts/check-gate-manifest.mjs
MANIFEST OK — 17 gates, 17 locked
GATE-SKIPS total=17 skipped=0
MANIFEST_EXIT=0

$ node -e "…order listing…"
GATES 17
1:G5 2:G6 3:G7 4:G12 5:G13 6:G15 7:G16 8:G1 9:G2 10:G3 11:G4 12:G18 13:G17 14:G10 15:G11 16:G8 17:G9

$ node -e "…lock…"          -> LOCK 17
$ git diff gates.manifest.lock | grep -c '^-'   -> 1
$ git diff gates.manifest.lock | grep '^-'
--- a/apps/inheritance/gates.manifest.lock
```

The single `^-` line is the diff header itself; no content line was removed, so the lock only grew.
`G9` is still last and `G14` is still unused, reserved for Phase 9's `09-06`.

### Task 4 — CI

```
$ python3 -c "…parse the workflow…"
STEPS 9
<uses:actions/checkout@v4>
Install Rust toolchain
Install wasm-pack
Install Node
Install frontend dependencies
Install Supabase CLI
Start local Supabase stack
Install Playwright chromium
Run all gates
TIMEOUT 45
$ grep -c "continue-on-error" …  -> 0
$ grep -c "|| true" …            -> 0
```

The comment block above the new steps records, in the file itself, that this project's CI has never
executed (Phase 1's GATE-04 finding), so whether `supabase start` succeeds on a GitHub-hosted runner
is **unmeasured** and is written down as a risk rather than asserted as working.

### Task 5 — the whole gate run, pasted in full

```
  id   ord  blk  name                        status               exit
  --------------------------------------------------------------------
  G5   1    yes  gate manifest integrity     pass                 0
  G6   2    yes  plan closed-world lint      pass                 0
  G7   3    yes  commit discipline audit     pass                 0
  G12  4    yes  engine coverage report      pass                 0
  G13  5    yes  assertion discipline        pass                 0
  G15  6    yes  journey harness self-test   pass                 0
  G16  7    yes  journey registry integrity  pass                 0
  G1   8    yes  engine tests                pass                 0
  G2   9    yes  wasm build                  pass                 0
  G3   10   yes  frontend suite vs ledger    pass                 0
  G4   11   yes  typecheck                   pass                 0
  G18  12   yes  tenant isolation            pass                 0
  G17  13   yes  live journey run            pass                 0
  G10  14   yes  lawyer decision registry    pass                 0
  G11  15   yes  engine observability        pass                 0
  G8   16   yes  gate skip accounting        pass                 0
  G9   17   yes  published gate results      pass                 0

GATE COVERAGE 17/17

REQUIREMENT COVERAGE (informational — never fails the build)
  COV-04 -> G12
  COV-05 -> G13
  COV-06 -> G18
  GATE-01 -> G3
  GATE-02 -> G4
  GATE-03 -> G2
  GATE-08 -> G9
  GATE-09 -> G8
  JRNY-01 -> G15
  JRNY-02 -> G16,G17
  JRNY-03 -> G16,G17
  JRNY-04 -> G16,G17
  JRNY-09 -> G15
  JRNY-10 -> G15
  JRNY-12 -> G15
  LAWYER-09 -> G10
  LOOP-01 -> G6
  LOOP-03 -> G5
  LOOP-05 -> G7
  OBS-01 -> G11
  OBS-02 -> G11
  OBS-03 -> G11
  OBS-04 -> G11
  OBS-05 -> G11
  OBS-06 -> G11
  OBS-07 -> G11
  every other requirement id is UNGATED, which is the roadmap's remaining work, not a defect.

REQUIREMENT COVERAGE 26/94 gated

COVERAGE OK

ALL GATES PASSED (17/17)
LOOP STATUS GREEN — recorded pass (59/200 records)
GATES_EXIT=0

$ node -e "…gate-results…"
G5=pass G6=pass G7=pass G12=pass G13=pass G15=pass G16=pass G1=pass G2=pass G3=pass G4=pass
G18=pass G17=pass G10=pass G11=pass G8=pass G9=pass
NOT_RUN=0
```

Requirement coverage rose 22/94 → 26/94: `COV-06`, `JRNY-02`, `JRNY-03` and `JRNY-04` are now gated.

### Task 6 — two commits, scopes unmixed

```
$ git log --oneline -2
a591b3e4a ci(11-08): provision Supabase and chromium for the journey gates
1c7daac02 feat(11-08): register G16, G17 and G18 and document them in GATES.md section 13
$ git show --stat --name-only HEAD
.github/workflows/inheritance-ci.yml
$ git show --stat --name-only HEAD~1
apps/inheritance/GATES.md
apps/inheritance/gate-results.json
apps/inheritance/gates.manifest.json
apps/inheritance/gates.manifest.lock
apps/inheritance/scripts/check-journey-registry.mjs
$ node apps/inheritance/scripts/check-commit-discipline.mjs
COMMIT DISCIPLINE OK — 159 commit(s) audited, 130 touching apps/inheritance/, 0 mixed
DISCIPLINE_EXIT=0
```

## Deviations from Plan

**[expected consequence] `steps=15 references=15`, not 19** — the plan's task-1 criterion expects
`JOURNEY REGISTRY ok steps=19 references=19`. The registry holds **15** steps because plan 11-05
withheld `auth-signed-out` and plan 11-06 withheld the three onboarding steps, both on documented
product blockers. G16 asserts the registry is internally consistent, which it is: 15 steps, 15
rubrics named and valid, 15 reference pairs, zero orphans. The gate would fail if a withheld step
had been left declared without a reference — which is precisely why those steps were withheld rather
than left half-registered.

**[Rule 2 — missing critical] `GATES.md`'s gate table and its "now fourteen" paragraph were stale
too** — Found during: Task 3. The plan's task-3 acceptance only checks the whole-run count, but
section 1's table still listed every gate at its pre-Phase-11 `order` (G1 at 7, G9 at 14) and the
prose still read "The gate set is now fourteen". Leaving them would have left the owner-facing
document contradicting the manifest it documents. Fix: added the G16, G18 and G17 rows, renumbered
the eight shifted rows to match the manifest exactly, and rewrote the paragraph to say seventeen and
to explain the two placement groups (static checks ahead of G1; the two stack-dependent gates after
the typecheck). No gate field was changed — this is documentation catching up to `gates.manifest.json`.
Verification: the table's orders now read `1:G5 … 7:G16 … 12:G18 13:G17 … 17:G9`, identical to the
manifest listing. Commit: `1c7daac02`.

**Total deviations:** 1 auto-fixed (Rule 2) plus one inherited count difference. **Impact:** the
document now matches the manifest; no gate was weakened.

## Issues Encountered

`node -e "require('./gates.manifest.lock')"` from the plan's verify block cannot work — the file has
no `.json` extension, so `require` parses it as JavaScript and throws `SyntaxError: Unexpected token
':'`. Used `JSON.parse(readFileSync(...))` instead and got `LOCK 17`. This is a defect in the plan's
verification command, not in the lock file.

No point of Philippine law arose; nothing was added to `.planning/LAWYER-AGENDA.md`.

## Self-Check: PASSED

All six tasks' acceptance criteria re-run. Plan-level `<verification>`:
`node scripts/check-journey-registry.mjs` exits 0, `node scripts/check-gate-manifest.mjs` exits 0,
`bash scripts/ci-gates.sh` exits 0 printing `ALL GATES PASSED (17/17)`, and
`node scripts/check-commit-discipline.mjs` exits 0.

Phase 11 gate registration complete.
