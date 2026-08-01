# Phase 22 — G38 `deed-parity` falsification record

Gate: `frontend/journey/deed-parity.ts`
Command: `cd frontend && npx tsx journey/deed-parity.ts`

Every observation below is a real run against the live local Supabase stack, driving a real Chromium
against a real production build, clicking the product's own controls and reading the bytes the
browser actually downloaded. Nothing here is reasoned; all output is pasted.

The fixture is the Alpha case's own committed `input_json`. No peso figure is committed anywhere:
the expectation is a `computeEngineOutput` run performed in the same process, immediately before the
browser is launched.

Baseline, before any injection:

```
GATE-SKIPS total=4 skipped=0
DEED PARITY PASS blocks=4 stated=4 refused=0 docxParagraphs=33
BASELINE_EXIT=0
```

All four injections were observed red on the first attempt. None initially passed, and the gate was
not modified between the baseline above and the final baseline at the bottom of this file.

---

## Injection 1 — plus one centavo, at the line model

**Edit** (`frontend/src/lib/deed/schedule-lines.ts`):

```diff
@@ -171,7 +171,7 @@ export function buildDeedSchedule(input: EngineInput, output: EngineOutput): Dee
       categoryLabel,
       kind: refused ? 'refused' : 'stated',
       amountCentavos: refused ? null : c.toString(),
-      displayAmount: refused ? null : formatDeedPesos(c),
+      displayAmount: refused ? null : formatDeedPesos(c + 1n),
       articles,
       refusalReasons,
     });
```

**Gate output**

```
GATE-SKIPS total=4 skipped=0
DEED AMOUNT MISMATCH: block 0 (Ana) prints 150000001 centavos but the engine returned 150000000; difference 1
DEED AMOUNT MISMATCH: block 1 (Ben) prints 150000001 centavos but the engine returned 150000000; difference 1
DEED AMOUNT MISMATCH: block 2 (Carlos) prints 150000001 centavos but the engine returned 150000000; difference 1
DEED AMOUNT MISMATCH: block 3 (Rosa) prints 150000001 centavos but the engine returned 150000000; difference 1
DEED PARITY FAIL blocks=4 shares=4 violations=4
INJ1_EXIT=1
```

**Reverted with** `git checkout -- apps/inheritance/frontend/src/lib/deed/schedule-lines.ts`, then
`git status --porcelain -- apps/inheritance/frontend/src` printed nothing.

---

## Injection 2 — minus one centavo, at the line model

The opposite direction of Injection 1, so the check is proven not to be a one-sided inequality.

**Edit** (`frontend/src/lib/deed/schedule-lines.ts`):

```diff
-      displayAmount: refused ? null : formatDeedPesos(c),
+      displayAmount: refused ? null : formatDeedPesos(c - 1n),
```

**Gate output**

```
GATE-SKIPS total=4 skipped=0
DEED AMOUNT MISMATCH: block 0 (Ana) prints 149999999 centavos but the engine returned 150000000; difference -1
DEED AMOUNT MISMATCH: block 1 (Ben) prints 149999999 centavos but the engine returned 150000000; difference -1
DEED AMOUNT MISMATCH: block 2 (Carlos) prints 149999999 centavos but the engine returned 150000000; difference -1
DEED AMOUNT MISMATCH: block 3 (Rosa) prints 149999999 centavos but the engine returned 150000000; difference -1
DEED PARITY FAIL blocks=4 shares=4 violations=4
INJ2_EXIT=1
```

**Reverted with** `git checkout -- apps/inheritance/frontend/src/lib/deed/schedule-lines.ts`, then
`git status --porcelain -- apps/inheritance/frontend/src` printed nothing.

---

## Injection 3 — a heir dropped from the clause

**Edit** (`frontend/src/lib/deed/clause-text.ts`):

```diff
-    for (let k = 0; k < schedule.lines.length; k += 1) {
-      const line = schedule.lines[k]!;
+    const injected = schedule.lines.slice(0, -1);
+    for (let k = 0; k < injected.length; k += 1) {
+      const line = injected[k]!;
```

**Gate output**

```
GATE-SKIPS total=3 skipped=0
HEIR LINE MISSING: the clause prints 3 block(s) but the engine returned 4 heir share(s)
DEED PARITY FAIL blocks=3 shares=4 violations=1
INJ3_EXIT=1
```

Note the `GATE-SKIPS total=3` line: the gate reports the number of blocks it actually compared, so a
shrinking clause is visible in the log even before the marker is read.

**Reverted with** `git checkout -- apps/inheritance/frontend/src/lib/deed/clause-text.ts`, then
`git status --porcelain -- apps/inheritance/frontend/src` printed nothing.

---

## Injection 4 — an article dropped from the clause

The attribution check. A renderer that silently drops the engine's citation is exactly the failure a
citation-first product cannot survive.

**Edit** (`frontend/src/lib/deed/clause-text.ts`):

```diff
-        lines.push(`${ARTICLES_FIELD}${line.articles.join('; ')}`);
+        lines.push(`${ARTICLES_FIELD}${line.articles.slice(1).join('; ')}`);
```

**Gate output**

```
GATE-SKIPS total=4 skipped=0
DEED AUTHORITY MISMATCH: block 0 (Ana) prints [""] but the engine emitted ["Art. 996"]
DEED AUTHORITY MISMATCH: block 1 (Ben) prints [""] but the engine emitted ["Art. 996"]
DEED AUTHORITY MISMATCH: block 2 (Carlos) prints [""] but the engine emitted ["Art. 996"]
DEED AUTHORITY MISMATCH: block 3 (Rosa) prints [""] but the engine emitted ["Art. 996"]
DEED PARITY FAIL blocks=4 shares=4 violations=4
INJ4_EXIT=1
```

**Reverted with** `git checkout -- apps/inheritance/frontend/src/lib/deed/clause-text.ts`, then
`git status --porcelain -- apps/inheritance/frontend/src` printed nothing.

---

## Final baseline, after the last revert

```
GATE-SKIPS total=4 skipped=0
DEED PARITY PASS blocks=4 stated=4 refused=0 docxParagraphs=33
BASELINE_EXIT=0
```

---

## What this gate still does not prove

- **It does not prove the DOCX opens in Microsoft Word.** No OOXML consumer exists anywhere in this
  repository, so nothing here can open the archive the way Word does. The gate proves the package is
  a well-formed stored ZIP holding exactly the three declared parts, and that `word/document.xml`
  re-extracts to the clause character for character. Opening the file in Word is a manual-only
  verification — see `22-VALIDATION.md`, *Manual-Only Verifications*.
- **It does not prove the engine's figures are legally correct.** It proves three surfaces — the
  line model, the on-screen clause and the DOCX body — reproduce ONE engine run faithfully. Whether
  that run states the right shares under the Civil Code is the succession engine's own test suite's
  job, and, where a rule is contested, the lawyer's.
- **The Alpha fixture exercises no refusal.** The baseline run reports `refused=0`, so the
  `REFUSAL SET MISMATCH` and `REFUSED LINE CARRIES AMOUNT` checks are structurally present but were
  not driven red by any of the four injections above. The refusal rules themselves are proven by the
  unit tests in `frontend/src/lib/deed/__tests__/schedule-lines.test.ts` and
  `clause-text.test.ts`, and the refusal rendering by
  `frontend/src/components/results/__tests__/DeedClauseSection.test.tsx`. A fixture whose engine run
  raises a manual-review flag would be the way to drive those two markers red in a browser, and no
  such fixture exists today.
