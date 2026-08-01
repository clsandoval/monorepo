# Phase 19 — Baseline Measurements

Every number in this file was produced by a command run during plan `19-01`, on branch
`gsd/deletion-milestone`, before any source file in this phase was edited. Nothing here is carried
over from `19-RESEARCH.md`; where a figure disagrees with the research document that disagreement is
recorded rather than reconciled.

---

## 1. Call sites feeding useAutoSave

Command:

```
cd frontend && grep -rn "setAutoSaveInput(" src/ | wc -l; grep -rn "setAutoSaveInput(" src/; \
  grep -rln "useAutoSave" src/ | wc -l; \
  grep -n "onSubmit?:\|defaultValues?:\|onChange?:" src/components/wizard/WizardContainer.tsx; \
  grep -c "methods.watch((" src/components/wizard/WizardContainer.tsx
```

Output:

```
SETTER_SITES 2
src/routes/cases/$caseId.tsx:52:          setAutoSaveInput(input);
src/routes/cases/$caseId.tsx:60:          setAutoSaveInput(input);
CONTROL_USEAUTOSAVE_REFS 3
WIZARD_PROPS
102:  onSubmit?: (data: EngineInput) => void;
103:  defaultValues?: Partial<EngineInput>;
WATCH_SUBSCRIPTIONS 0
```

**`setAutoSaveInput` = 2 call sites, both at `frontend/src/routes/cases/$caseId.tsx` lines 52 and 60,
and both lie inside the `useEffect(..., [caseId])` load effect that opens at `$caseId.tsx:41` and
closes at `$caseId.tsx:76`** — line 52 is the `row.output_json` branch and line 60 is the
`row.input_json` branch of the same `fetchCase()` body. **Zero call sites lie outside that effect.**
This is the dead-code proof: the only value `useAutoSave` can ever observe is the value that was just
read out of the database.

Positive control: `CONTROL_USEAUTOSAVE_REFS` = 3 (≥ 3 required) — `src/hooks/useAutoSave.ts`,
`src/routes/cases/$caseId.tsx`, `src/hooks/__tests__/useAutoSave.test.tsx`. The search path is
correct, so `SETTER_SITES 2` is a fact about the product and not an artefact of a wrong path.

`WizardContainerProps` declares exactly two props — `onSubmit?` (line 102) and `defaultValues?`
(line 103). There is **no `onChange`**. `WATCH_SUBSCRIPTIONS` = 0: `WizardContainer.tsx` contains no
`methods.watch((` subscription at all.

**Targets.** Plan `19-03` adds the `onChange?` prop and one `methods.watch((` subscription, driving
`WATCH_SUBSCRIPTIONS` from 0 to 1. Plan `19-04` adds a `setAutoSaveInput` feed outside the load
effect, driving *call sites outside the `[caseId]` effect* from **0** above zero.

---

## 2. The committed unmount test, as it stands today

`frontend/src/hooks/__tests__/useAutoSave.test.tsx`, starting at **line 137**, verbatim:

```tsx
  it('cancels pending save on unmount', () => {
    const modifiedInput = { ...baseInput, net_distributable_estate: { centavos: 5000000 } };
    const { rerender, unmount } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: 'case-1', input: baseInput } },
    );

    rerender({ caseId: 'case-1', input: modifiedInput });
    unmount();
    vi.advanceTimersByTime(2000);

    expect(mockUpdateCaseInput).not.toHaveBeenCalled();
  });
```

ROADMAP Phase 19 success criterion 3, verbatim from `.planning/ROADMAP.md:609`:

> 3. Unmounting the wizard with a save pending **flushes** it instead of clearing it, proven by a test that unmounts inside the debounce window.

That criterion is the owner's written instruction that the behaviour asserted by the test above must
change; plan `19-02` therefore **renames** that test and **inverts** its assertion to the stronger
`toHaveBeenCalledWith` form, and does not delete it, skip it, or mark it `.todo`.

**Measurement discrepancy recorded, not reconciled.** The `19-01-PLAN.md` verify block greps for the
literal `flushes it instead of clearing it`, which prints `0`, because the roadmap writes the word
inside markdown bold: `flushes** it instead of clearing it`. Re-measured with the corrected pattern:

```
$ grep -c "flushes\*\* it instead of clearing it" .planning/ROADMAP.md
1
```

The criterion is genuinely in the roadmap at line 609. The `0` was a defect in the plan's grep
pattern, not evidence of a paraphrased quotation.

File case count and pass count:

```
IT_CASES 7
UNMOUNT_TEST_LINE 137:  it('cancels pending save on unmount', () => {

 ✓ src/hooks/__tests__/useAutoSave.test.tsx (7 tests) 27ms
 Test Files  1 passed (1)
      Tests  7 passed (7)
```

**7 `it(` cases, 7 passed, 0 failed.** Plan `19-02` may only move that count up.

---

## 3. Save behaviour of the unmodified hook

A throwaway Vitest probe at `frontend/src/hooks/__tests__/probe-19-01.test.tsx` mocked `@/lib/cases`
exactly as the committed test file does and measured three counts against the **current, unmodified**
`useAutoSave`. The probe was deleted in the same verify block that ran it; `git status --porcelain --
frontend/src` printed nothing afterwards.

```
OPEN_ONLY_SAVES=1
INPLACE_EDIT_SAVES=0
UNMOUNT_FLUSH_SAVES=0
 Tests  3 passed (3)
```

| Measurement | Observed today | Driven by | Target |
|---|---|---|---|
| `OPEN_ONLY_SAVES` — open a case, type nothing, advance 2000 ms | **1** | `19-02` | **0** |
| `INPLACE_EDIT_SAVES` — mutate the object in place, re-pass the same reference, advance 2000 ms | **0** | `19-02` | **≥ 1** |
| `UNMOUNT_FLUSH_SAVES` — change, advance 1400 ms, unmount, advance 2000 ms | **0** | `19-02` | **1** |

`OPEN_ONLY_SAVES=1` **confirms planning correction 1 and contradicts the vision audit's phrasing that
the debounce "never fires".** The reference guard is not inert: `prevInputRef` initialises to the
first render's `null`, so the first non-null value the hook observes reads as a change and performs
one save 1.5 s later whose payload is byte-identical to what was just read out of the database. The
hook therefore performs exactly one redundant write per case opened, and zero writes for any amount
of typing. `19-02` must make the first observation an *adoption* or that redundant write survives the
fix.

`INPLACE_EDIT_SAVES=0` is the defect this phase exists to remove: `useAutoSave.ts:40` reads
`if (prevInputRef.current === input) return;`, so a form library that mutates in place is invisible
to it.

`UNMOUNT_FLUSH_SAVES=0` is the data-loss behaviour: `useAutoSave.ts:46-48` clears the pending timer on
unmount, so up to 1.5 s of typing dies when the lawyer navigates away.

---

## 4. Test-count floor and gate order

```
 Test Files  8 failed | 87 passed (95)
      Tests  31 failed | 2078 passed (2109)
TEST COUNT DROPPED: ran 2109 tests, floor is 2119
  Tests were removed or failed to collect. Restore them.
GATE-SKIPS total=2109 skipped=0

MIN_TOTAL_TESTS 2119
KNOWN_FAILURES 31
GATE_COUNT 34
ORDER_14 G18
ORDER_15 G17
ORDER_16 G19
ORDER_17 G20
LOCKED 34
```

- Tests run: **2109**. Failed: **31**. Skipped: **0**.
- `min_total_tests` floor: **2119**.
- `known_failures` ledger size: **31** — equal to the failed count, so the whole failure set is
  ledgered debt and no failure is new.
- **The gap between the run count and the floor is exactly `10`.**

`frontend/scripts/check-test-baseline.mjs:186` compares with a **strict less-than** against
`min_total_tests`, so a run count *above* the floor passes; the gap can therefore be closed by adding
ten or more passing test cases, with no baseline edited. Plan `19-06` re-reads this number after this
phase's tests land and records whatever it finds. **No plan in this phase edits
`frontend/test-baseline.json`, and `min_total_tests` is not lowered under any circumstance.**

Gate set at the insertion point: **34 gates registered, 34 locked.** Orders 14–17 are
`G18`, `G17`, `G19`, `G20` — all four as the plan predicted, so the manifest has not moved under this
phase's feet. Plan `19-06` inserts `G35` at order 17, which shifts `G20` and everything after it down
by one; `order` must be provably the only field that moves on any pre-existing gate.

**Not claimed by this phase:** `bash scripts/ci-gates.sh` exiting 0. `G20` and `G21` are registered
blocking gates whose scripts commit `4ccf06270` deleted, and retiring a gate is owner action under
`CLAUDE.md` invariant 2. Clearing the test-count floor advances the halt from `G3` to `G20`; it does
not make the suite green.
