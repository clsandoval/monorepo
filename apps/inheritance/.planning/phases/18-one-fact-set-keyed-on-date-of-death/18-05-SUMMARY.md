---
phase: 18
plan: 18-05
status: complete
requirements: [FACT-01, FACT-02, FACT-03, FACT-04]
---

# 18-05 — The one-fact-set gate, observed red before it was registered

Committed `ce26a8c70` (`frontend/scripts/check-one-fact-set.ts` + three fixtures). **Not registered** —
`MANIFEST_TOUCHED 0`, still `MANIFEST OK — 33 gates, 33 locked`. Registration is `18-06`.

## The gate, green against the real tree

```
## Check 1 — SECOND DATE FIELD
  ok — 0 of 168 source files write the tax-side date
## Check 2 — FACT SET NOT SHARED
  ok — the route consults the fact set and reads no projected column
## Check 3 — DISAGREEMENT NOT REFUSED
  agree        -> ok
  disagree     -> disagreement
  missing-date -> missing-date
  refusal prints both dates -> true
## Check 4 — DATE NOT KEYED TO TAX
  2017-12-31 rules=PRE_TRAIN medical=40000000 tax_due=100500000
  2018-01-01 rules=TRAIN medical=0 tax_due=30000000
## Check 5 — ENGINE INPUT DATE MISMATCH
  fact set date=[2019-04-02] engine input date=[2019-04-02] heir_rows=4
  ok — one date reached both paths and the engine really computed

ONE FACT SET CHECK — 3 fixture row(s) examined
  SECOND DATE FIELD            ok
  FACT SET NOT SHARED          ok
  DISAGREEMENT NOT REFUSED     ok
  DATE NOT KEYED TO TAX        ok
  ENGINE INPUT DATE MISMATCH   ok
ONE FACT SET OK
EXIT=0
```

**Check 4's six values match `18-BASELINE.md` §2 exactly.** No tax figure moved during this phase.

## Observed red on three injected regressions

| Regression | Marker printed | Exit | After `git checkout --` |
|---|---|---|---|
| A — restored the deleted tax-side writer in `DecedentTab.tsx` | `SECOND DATE FIELD components/tax/tabs/DecedentTab.tsx writes the tax-side date` | `EXIT_A=1` | `EXIT_A_REVERTED=0` |
| B — replaced `assertOneFactSet(` with `noSuchCheck(` in the route | `FACT SET NOT SHARED — the route never calls assertOneFactSet(` | `EXIT_B=1` | `EXIT_B_REVERTED=0` |
| C — `--fixtures` pointed at an empty directory | `CORPUS EMPTY — 0 fixture rows examined` | `EXIT_C=1` | n/a |

A nonexistent fixtures directory also exits non-zero (`EXIT_D=1`). `git status --porcelain -- src`
prints nothing: both regressions were reverted.

A gate observed red before it is registered is a gate; one registered first is a hope.

## Design decisions worth naming

**A green run on zero rows is a failure by construction.** Three defences: zero fixture rows exits 1
with `CORPUS EMPTY`; a missing `.wasm` or unparseable fixture exits **2** with
`FACT SET CHECK CANNOT RUN:` (the project's distinct "could not run" code); and check 5 requires a
**positive** `per_heir_shares` length, so an engine returning an empty object fails rather than
passes. `heir_rows=4` is the evidence it computed.

**The gate restates no rule.** Every verdict comes from `src/lib/fact-set.ts` and every tax figure
from `src/lib/estate-tax-engine`. `frontend/tsconfig.json` includes only `src`, so this runner is not
typechecked by G4 — which is exactly why it holds no logic of its own.

**The succession engine's invariance is deliberately NOT asserted.** Asserting it would freeze
today's behaviour as a permanent expectation and turn the gate red the day `LAWYER-08` is answered
and RA 11642 retroactivity is implemented. A gate whose correct fix is "weaken me" is a gate that
gets weakened. The gate asserts the date **arrives** at the engine, never that it **changes** the
answer.

**The scan cannot match itself.** The scan root is derived from the script's own directory
(`SCAN_ROOT_BOUND 0` — the literal `frontend/scripts` is never hardcoded), and the search literal is
assembled at runtime rather than written out, so `grep -c "dateOfDeath: e.target.value"` over the
runner returns **0**.

## One acceptance criterion could not pass as written — reported, not worked around

The plan's criterion `WRITE_FLAGS` requires
`grep -cE "writeFileSync|appendFileSync|--write|--fix|--update|--accept|--waive"` to print `0`. It
prints **2**. Both matches are the substring `--fix` inside **`--fixtures`** — the plan's own
specified flag name:

```
7: *   cd frontend && npx tsx scripts/check-one-fact-set.ts --fixtures <dir> --src <dir>
84:const FIXTURES_DIR = flag('--fixtures') ?? path.resolve(HERE, 'fixtures');
```

This is a collision in the plan's verification command, not a write capability. Renaming `--fixtures`
to satisfy a grep would have deviated from the plan's own specification, so the flag name was kept
and the finding is reported. Measured with word boundaries instead:

```
REAL_WRITE_CALLS 0     (writeFileSync|appendFileSync|createWriteStream|rmSync|unlinkSync|mkdirSync)
REAL_WRITE_FLAGS 0     (--write|--fix|--update|--accept|--waive|--repair|--regenerate, \b-anchored)
ALL_FLAGS        flag('--fixtures'), flag('--src')
```

The script has **no write capability and no acceptance, waiver or update flag**. Its only two flags
are the read-only path overrides the plan specifies.

## Verification

`npx tsx scripts/check-one-fact-set.ts` exit 0. `MARKERS 50` (≥7 required). `SCAN_ROOT_BOUND 0`.
`MANIFEST_TOUCHED 0`. `node scripts/check-commit-discipline.mjs` exit 0.
`node scripts/check-gate-manifest.mjs` exit 0 — `MANIFEST OK — 33 gates, 33 locked`.
