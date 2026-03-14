# Suppression Condition Reference Integrity

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I — Suppression condition reference integrity: when a surface name in `review_trigger.surface` is renamed, the condition silently becomes unevaluable; CI lint for stale surface references in suppression conditions; tooling to update them on surface rename

**Parent:** 4.69e-i-a-i-f-i-α-i-A-α-i-1 — Fork suppression expiry and `review_trigger` evaluation (established: typed condition registry; Option B predefined types for Phase 1; `"triggered"` sentinel state; unevaluable condition = suppression stays active + warning emitted within 14-day fix window)

**The gap this closes:** The parent analysis introduced the unevaluable surface-name problem in two paragraphs, designated it an "edge case," and noted the desired behavior: warn loudly, leave suppression active rather than false-trigger, require fix within 14 days. This analysis designs the detection architecture, the resolution tooling, and the proactive rename propagation system in full.

---

## The Core Problem

A `review_trigger` condition of type `budget_below` or `budget_ratio_exceeds` names a surface:

```json
{
  "review_trigger": {
    "type": "budget_below",
    "surface": "tooltip.workbench-header",
    "threshold": 20
  }
}
```

The string `"tooltip.workbench-header"` is a reference into `surfaces.json` (and by extension, into `budget.json`). It is a pointer. Like all pointers, it can become dangling.

Surface names change for legitimate reasons:
- A responsive design pass restructures component taxonomy: `tooltip.workbench-header` → `tooltip.workbench`
- A design system rename standardizes casing: `sidebar.Panel` → `sidebar.panel`
- A component is decomposed: `modal.confirm` → `modal.confirm.small` + `modal.confirm.large`
- A component is deprecated and replaced: `toast` → `notification.toast`

When any of these happen, `surfaces.json` and `budget.json` update. The `review_trigger` conditions scattered through `string-surface-map.json` do not. They still reference the old name.

The parent analysis called this "silent" unevaluability: the evaluation engine cannot find the surface, the condition cannot fire, and the suppression remains active indefinitely — providing no warning signal when the condition that would have triggered it is genuinely met on the new surface.

**The dual failure mode:**

1. **Silent false-inactive:** The old surface `tooltip.workbench-header` no longer exists; the new surface `tooltip.workbench` has 19 chars. The condition `budget_below(tooltip.workbench-header, 20)` cannot find its target, stays unevaluable, suppression stays active. But the condition *would* have triggered on the new surface. The developer never gets notified.

2. **Ghost trigger risk:** If CI treated unevaluable as triggered (opposite design choice), every surface rename would cause a cascade of false advisory firings — every `review_trigger` referencing any renamed surface would trigger simultaneously, flooding the developer with irrelevant re-evaluation requests. The parent analysis correctly chose: unevaluable = suppression active + warning. But "warning" must be loud enough to actually get fixed.

**What "silent" means in practice:**

A surface rename happens in a layout refactor PR. The PR changes `surfaces.json`, regenerates `budget.json`, and updates all component references. The PR author does not think to check `string-surface-map.json` for `review_trigger` conditions — they are not a l10n developer, they are a frontend developer doing a responsive design pass. The PR passes Tier 1 validation (because the condition reference integrity check is not part of the Tier 1 suite yet). The nightly build next morning emits a warning. The warning is in the nightly build output. No one reads nightly build output unless something red.

The warning dies in a log file. Six months later, the budget on `tooltip.workbench` drops to 17 chars. The condition that would have fired the advisory cannot find the surface. The developer never revisits the fork decision.

---

## The Four Problem Sub-Dimensions

Before exploring options, the problem decomposes into four sub-problems with distinct design choices:

**Sub-problem 1: Detection cadence.** When does CI check for stale references? On every PR? On every nightly? On surface rename only? The timing determines how quickly the feedback arrives and how much noise it generates.

**Sub-problem 2: Detection visibility.** Where does the warning appear? Build log (low visibility), PR check (moderate visibility), PR comment (high visibility), inline lint in the IDE (highest visibility). The detection is only useful if the right person sees it at the right time.

**Sub-problem 3: Resolution path.** When a stale reference is detected, what does the developer do? Manual edit (find and fix), automated lint suggestion ("did you mean `tooltip.workbench`?"), or tooling command (`make repair-suppression-refs`). The friction of the resolution path determines whether it actually gets done.

**Sub-problem 4: Proactive propagation.** When a surface IS renamed, can the rename command propagate the update to all `review_trigger` conditions atomically, so the reference never goes stale in the first place? This is the "fix before break" approach.

The options below differ primarily on which sub-problems they solve and at what layer.

---

## Option A: Post-Hoc Detection Only — "Best Effort CI Warning"

**Design:**

The CI evaluation engine, when it cannot find a surface in `budget.json`, emits a warning to the build log and the nightly suppression audit report. No PR-time detection. No automated suggestion. Developer must manually find and fix the stale reference.

This is what the parent analysis described implicitly. This option makes the implicit behavior explicit.

**Detection:**
- Nightly build evaluates all `review_trigger` conditions against current `budget.json`
- Unevaluable conditions emit: `SUPPRESSION WARNING — stale surface reference: 'tooltip.workbench-header' not found`
- Suppression audit report (`make l10n-suppression-audit`) lists unevaluable conditions under `⚠ UNEVALUABLE`
- No PR-time detection

**Resolution path:**
Developer opens the suppression audit, finds the unevaluable entry, opens `string-surface-map.json`, manually corrects the surface name. Manual effort: 5-10 minutes per stale reference.

**Strengths:**
- Zero additional tooling beyond what the parent analysis established
- No risk of over-intervention: the system warns, humans fix
- Compatible with the existing Tier 1 / nightly two-tier validation model

**Weaknesses:**
- Warning lives in nightly build output — lowest-visibility delivery channel in the developer toolchain
- Surface rename → unevaluable condition gap can be weeks or months if no one runs the audit
- No fuzzy-match suggestion: developer must manually identify the new surface name
- The 14-day fix window established by the parent analysis requires someone to read the nightly output within 14 days. Who is responsible for monitoring nightly l10n warnings?

**Verdict:** Necessary baseline but insufficient as the only mechanism. The "14-day fix window" is only enforceable if the warning is loud. This option's warning is not loud. Supplement required.

---

## Option B: PR-Time Ref Check on Surface Rename PRs — "Rename-Triggered Audit"

**Design:**

The Tier 1 PR validation is augmented: when a PR modifies `surfaces.json` (specifically, removes or renames a surface entry), the CI checks `string-surface-map.json` for all `review_trigger` conditions that reference the removed/renamed surface and emits a Tier 1 **error** (PR-blocking) for each stale reference found.

The surface rename PR must resolve all stale references before merging. This is analogous to how TypeScript prevents renaming an exported identifier without updating all import sites.

**Detection:**
```
PR modifies surfaces.json →
  CI diff extracts removed/renamed surface names →
  CI scans string-surface-map.json for review_trigger.surface matching removed names →
  Tier 1 error: "Surface 'tooltip.workbench-header' removed in this PR;
                  review_trigger condition in shared.label.configVersion still references it.
                  Update before merging."
```

**Resolution path:**
The PR author fixes the stale reference in the same PR. Fuzzy-match suggestion: "Did you mean `tooltip.workbench`? (1 match in current surfaces.json)" — reduces fix effort to confirming the suggestion.

**What happens to Option A warnings:**
Option B catches stale references at rename time. Option A's nightly audit catches residual cases (e.g., a surface removed without a PR that modifies `surfaces.json` directly — unusual but possible via script). Both mechanisms run in parallel.

**Strengths:**
- Stale references are caught at the moment they are created — the rename PR cannot merge until all references are fixed
- The fuzzy-match suggestion ("Did you mean X?") makes resolution a 30-second confirmation, not a manual investigation
- PR author has the context: they know the rename mapping, they can verify the fix is correct
- No gap between rename and fix — the reference is never stale in the main branch

**Weaknesses:**
- Requires robust diff analysis of `surfaces.json` — the CI must detect "surface X was renamed to Y" vs. "surface X was deleted" vs. "surface X was restructured into X.small and X.large"; these cases need different handling
- False positives: if `surfaces.json` is restructured without an actual semantic rename (e.g., adding a new surface changes the file), the diff analysis might flag false renames
- Does not handle surface renames that happen outside of `surfaces.json` edits — e.g., if a component is deleted entirely and the surface vanishes from `budget.json` without an explicit `surfaces.json` change

**Key design detail: Rename vs. Delete vs. Decompose**

Three rename patterns produce different fix suggestions:

| Pattern | Example | Correct fix |
|---------|---------|-------------|
| Simple rename | `tooltip.workbench-header` → `tooltip.workbench` | Update to new name |
| Delete (surface removed entirely) | `toast.legacy` removed | Remove `review_trigger` or change condition type |
| Decompose (1 → N) | `modal.confirm` → `modal.confirm.small`, `modal.confirm.large` | Choose which sub-surface to reference; possibly use strictest-budget |

The CI error message must distinguish these three patterns with different suggested actions.

**Verdict:** High value for the most common case (simple rename). Pair with Option A for completeness. Recommended as the primary detection mechanism.

---

## Option C: Proactive Rename Propagation Command — "The Rename-And-Repair Pattern"

**Design:**

Instead of detecting stale references after the fact, a `make rename-surface` command performs the rename atomically — updating `surfaces.json`, regenerating `budget.json`, AND updating all `review_trigger` conditions in `string-surface-map.json` in the same operation.

```bash
make rename-surface FROM=tooltip.workbench-header TO=tooltip.workbench
```

Output:
```
Renaming surface: tooltip.workbench-header → tooltip.workbench

  Updating surfaces.json .............. ✓
  Regenerating budget.json ............ ✓
  Scanning string-surface-map.json .... found 3 review_trigger references
  Updating review_trigger conditions .. ✓ (3 entries)
  Updating review_trigger_note text ... ✓ (2 entries contained the old name in free text)
  Scanning component files ............ found 12 useSurface() call sites
  Updating call sites ................. ✓ (12 files)

  Changes staged in: l10n/rename-surface-2026-03-14.patch
  Review with: git diff --staged
  Commit with: git commit -m "l10n(surface-rename): tooltip.workbench-header → tooltip.workbench"
```

The command is a codemod. It makes the rename a first-class operation rather than a manual multi-file edit.

**Scope of updates:**
1. `surfaces.json`: rename entry
2. `budget.json`: regenerate (derived file)
3. `string-surface-map.json`: update `review_trigger.surface` where value matches old name; also scan `review_trigger_note` free text for mentions of the old name and highlight them (but not auto-update — free text changes need human review)
4. Component files: update `useSurface('tooltip.workbench-header')` call sites
5. `l10n-suppression-audit.md` (if it exists as a committed artifact): annotate as stale (rename event recorded, re-run audit to refresh)

**Partial rename (decompose case):**
When 1 surface decomposes to N:
```bash
make rename-surface FROM=modal.confirm TO=modal.confirm.small,modal.confirm.large
```
Output flags all `review_trigger.surface` references to `modal.confirm` as requiring human decision:
```
  REVIEW REQUIRED: shared.label.configVersion uses review_trigger.surface = "modal.confirm"
  This surface decomposed into: [modal.confirm.small, modal.confirm.large]
  Choose which sub-surface to reference in the trigger condition:
  > (1) modal.confirm.small  (budget: 80 chars)
  > (2) modal.confirm.large  (budget: 240 chars)
  > (3) strictest (auto-select strictest each evaluation)
```
Interactive selection replaces the old reference.

**Strengths:**
- The reference never goes stale in the main branch when `make rename-surface` is used
- Atomic: the rename and all dependent updates are in one commit, one review
- The free-text `review_trigger_note` scanning catches mentions of old surface names even in non-structured fields
- Explicitly records the rename mapping in a `l10n/surface-rename-log.json` (analogous to `l10n/tm-migrations.json` in the parent analysis)

**Weaknesses:**
- Only prevents stale references when developers USE the command. A developer who manually edits `surfaces.json` bypasses the propagation entirely.
- Requires a working codemod environment — some teams run surface renaming in CI pipelines that don't have interactive access
- Interactive selection for decompose case doesn't work in non-interactive CI contexts

**Guard against bypass:**
The CI check (Option B) catches the bypass case: if `surfaces.json` is modified directly (not via `make rename-surface`), Tier 1 still scans for stale `review_trigger` conditions. The command is the "fast path"; the CI check is the safety net.

**Verdict:** High value as the primary developer workflow. Options B and C are complementary: C prevents the problem when the workflow is followed; B catches it when it isn't.

---

## Option D: Stable Surface IDs with Display-Name Aliases — "Stable Pointer Architecture"

**Design:**

Instead of using display names as references (the current model), `surfaces.json` assigns each surface a **stable UUID-style ID** alongside a display name. `review_trigger` conditions reference the stable ID, not the display name. Display names can change without breaking references.

```json
// surfaces.json
{
  "id": "surf_042a",
  "name": "tooltip.workbench-header",
  "description": "Workbench panel tooltip header",
  "deprecated": false
}

// string-surface-map.json review_trigger
{
  "type": "budget_below",
  "surface_id": "surf_042a",
  "threshold": 20
}
```

When `tooltip.workbench-header` is renamed to `tooltip.workbench`, `surfaces.json` updates the `name` field for `surf_042a`. The `review_trigger` condition still references `surf_042a`. The evaluation engine resolves the ID to the current name. No reference ever goes stale.

**Display in tooling:**
The audit report resolves IDs to names for display:
```
Condition: budget_below(tooltip.workbench [surf_042a], 20)
```
If the ID references a deprecated surface, the display shows: `budget_below(tooltip.workbench-header [surf_042a — DEPRECATED], 20)`.

**Strengths:**
- Eliminates the entire class of stale-reference bugs from display-name changes
- Display names become documentation, not load-bearing identifiers
- Surface deprecation is clean: `deprecated: true` on the surface entry triggers a warning, but references to deprecated surfaces are not broken — they evaluate against the deprecated budget until the surface is removed

**Weaknesses:**
- Significant schema change from the current model (name-based references throughout the codebase)
- IDs are opaque in code review: `"surface_id": "surf_042a"` is harder to review than `"surface": "tooltip.workbench-header"`. Code reviewers lose the ability to spot incorrect surface names at a glance.
- Tooling must resolve IDs to names everywhere — the developer experience degrades unless all tooling displays the human-readable name alongside the ID at all times
- Does not solve the decompose case: if `surf_042a` is decomposed into `surf_043a` and `surf_044a`, the old reference to `surf_042a` is still broken
- Migration cost: all existing `review_trigger` conditions must be migrated to use IDs. A migration script handles this, but it adds project overhead.

**Verdict:** Architecturally elegant but operationally costly for the problem at hand. The stale-reference class of bugs is real but not so common that a full stable-ID architecture is warranted. The rename-propagation command (Option C) + PR-time detection (Option B) solves 95% of cases at 10% of the migration cost. Recommend Option D only for teams that make surface renames frequently (>2/month) or that have accumulated significant suppression technical debt.

---

## Recommendation: Options B + C as Complementary Layers

**Phase 1:**

1. **Option C (`make rename-surface`)** as the primary developer workflow for surface renaming. Rename is atomic, propagates to all dependent files, records the mapping.

2. **Option B (Tier 1 PR-time ref check on `surfaces.json` modifications)** as the safety net. Catches manual `surfaces.json` edits that bypass the command. PR-blocking error with fuzzy-match suggestion.

3. **Option A (nightly unevaluable warning)** continues as-is. Catches edge cases that neither B nor C catches.

**The three-tier coverage:**

| Scenario | Detection mechanism | Latency |
|----------|--------------------|---------|
| Developer uses `make rename-surface` | Option C: atomic propagation | 0 (never goes stale) |
| Developer manually edits `surfaces.json` | Option B: Tier 1 PR check | At PR time |
| Surface removed via script/pipeline | Option A: nightly warning | Next nightly build |

**New lint rule for Tier 1:**

The Tier 1 budget lint gains a new check:
```
If PR modifies surfaces.json:
  Extract removed/renamed surface names from diff
  Scan string-surface-map.json for matching review_trigger.surface values
  If any found: emit Tier 1 error with fix suggestion
```

The fix suggestion format:
```
❌ TIER 1 ERROR: Stale surface reference in review_trigger condition
   Key: shared.label.configVersion
   Condition: budget_below("tooltip.workbench-header", 20)
   Problem: "tooltip.workbench-header" was renamed in this PR → "tooltip.workbench"

   Suggested fix: update review_trigger.surface to "tooltip.workbench"
   (1 match found in current surfaces.json)

   Alternatively: change condition type to days_elapsed if budget changes
   are no longer the right trigger for this suppression.
```

---

## Developer Journeys

### Journey: Nadia, 31, Frontend Developer — The Surface Rename That Breaks Nothing

**Context:** Nadia is doing a responsive design audit of the workbench panel. She needs to rename `tooltip.workbench-header` to `tooltip.workbench` as part of a component taxonomy cleanup. She has never thought about `string-surface-map.json` — that's a l10n concern.

**Minute 0:00 — Running the Rename Command**

Nadia types:
```bash
make rename-surface FROM=tooltip.workbench-header TO=tooltip.workbench
```

The terminal runs. She watches:
```
Renaming surface: tooltip.workbench-header → tooltip.workbench

  Updating surfaces.json .............. ✓
  Regenerating budget.json ............ ✓
  Scanning string-surface-map.json .... found 1 review_trigger reference
  Updating review_trigger conditions .. ✓
    shared.label.configVersion: "tooltip.workbench-header" → "tooltip.workbench"
  Scanning component files ............ found 4 useSurface() call sites
  Updating call sites ................. ✓ (4 files)

  1 review_trigger_note mentions "workbench-header" in free text:
    shared.label.configVersion: "Currently 28 chars — safe. If tooltip.workbench-header drops..."
    ⚠  Free text not auto-updated. Review manually (search: review_trigger_note in map entry)

  Changes staged. Review with: git diff --staged
```

**Minute 0:30 — Reviewing the Diff**

Nadia runs `git diff --staged`. She sees:
- `surfaces.json`: the name change
- `string-surface-map.json`: `"tooltip.workbench-header"` → `"tooltip.workbench"` in one condition
- A free-text `review_trigger_note` that still mentions the old name

She opens the note and updates it: `"tooltip.workbench"` replaces `"tooltip.workbench-header"` in the free text. She amends the staged changes.

**Minute 1:00 — Committing**

```bash
git commit -m "l10n(surface-rename): tooltip.workbench-header → tooltip.workbench"
```

The Tier 1 check runs. No stale reference errors — the condition was already updated. PR passes.

**Minute 1:30 — Resolution**

The `review_trigger` condition for `shared.label.configVersion` now correctly reads `"tooltip.workbench"`. The budget evaluation engine, next time it runs, evaluates the condition against the correct surface. Nadia never knew she was saving the l10n team from a silent bug.

**UI Annotations:**
- `make rename-surface` output: color-coded — green checkmarks for automatic fixes, yellow `⚠` for items needing human review, red `✗` for blocked operations
- Free-text mention detection: regex scan for the old surface name in `review_trigger_note` values; highlighted in output with the relevant key name and snippet
- Git diff review: the changed `review_trigger` entry shows in context with 3 surrounding lines, making it easy to verify the update is correct

---

### Journey: Priya, 38, L10n Maintainer — Discovering Two Unevaluable Conditions in the Audit

**Context:** Priya runs the quarterly suppression audit. A developer did a surface taxonomy refactor three weeks ago and manually edited `surfaces.json` — bypassing `make rename-surface`. Two conditions are now unevaluable.

**Minute 0:00 — Running the Audit**

```bash
make l10n-suppression-audit
```

Output:
```
FORK ADVISORY SUPPRESSION AUDIT (2026-03-14)
18 active suppressions | 0 triggered | 2 unevaluable | 1 expiring within 30 days

UNEVALUABLE CONDITIONS (2)
  ─────────────────────────────────────────────────────────────────────
  shared.error.bufferFull.toast
    Condition: budget_below("toast.legacy", 15)
    Error: "toast.legacy" not found in budget.json
    Closest match: "notification.toast" (edit distance: 2)
    Suppressed: 2025-09-04 by priya (YOU) — 191 days ago

  shared.nav.backButton.label
    Condition: budget_below("sidebar.Panel", 40)
    Error: "sidebar.Panel" not found in budget.json — case mismatch?
    Closest match: "sidebar.panel" (exact match, case-insensitive)
    Suppressed: 2025-11-22 by aarav — 112 days ago
```

**Minute 1:00 — Fixing the First Condition**

Priya recognizes `shared.error.bufferFull.toast` — she added that suppression herself. The surface was renamed from `toast.legacy` to `notification.toast` in the October refactor. The closest-match suggestion is correct.

She opens `string-surface-map.json` and updates:
```json
"surface": "notification.toast"
```

Alternatively, she can run:
```bash
make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast
```

Which applies the single-field update and validates the new reference against `budget.json` in one step.

**Minute 1:30 — Fixing the Second Condition**

`shared.nav.backButton.label`: the surface `sidebar.Panel` (capital P) doesn't exist. The closest match is `sidebar.panel`. This is a case normalization issue — whoever wrote the original suppression used the wrong casing. The fix is trivial: lowercase the P.

```bash
make repair-suppression-ref KEY=shared.nav.backButton.label SURFACE=sidebar.panel
```

**Minute 2:00 — Confirming the Fixes**

Priya re-runs the audit:
```
18 active suppressions | 0 triggered | 0 unevaluable | 1 expiring within 30 days
```

Both conditions are now evaluable. The next nightly build will evaluate them correctly.

**Minute 2:30 — Reflection**

Priya checks the git log: the October refactor that broke these references was committed as a direct `surfaces.json` edit with the message "design(surfaces): normalize surface taxonomy." The committer didn't know to run `make rename-surface`.

She files a task: update the contributing guide to document `make rename-surface` as the required command for surface renames. She also notes that the Tier 1 PR check would have caught this — but the October refactor didn't modify `surfaces.json` through a standard PR (it went through a deploy script). She files a second task: add the stale-reference check to the deploy pipeline.

**UI Annotations:**
- Closest match in audit output: computed using Levenshtein distance; displayed only when edit distance ≤ 3 or when case-insensitive match exists; "closest match" not shown when the surface was deleted entirely
- `make repair-suppression-ref` command: a targeted surgical tool distinct from `make rename-surface` (which is for doing the rename) and `make l10n-suppression-audit` (which is for reading the state); the three commands cover: audit, bulk-rename, single-repair
- Re-run audit output: "0 unevaluable" shown in green; resolution delta implied by the clean result

---

### Journey: Dev, 26, New Developer — Manual `surfaces.json` Edit Caught by Tier 1

**Context:** Dev is fixing a typo in `surfaces.json` — the surface `tooltip.blueprintEditor-header` should be `tooltip.blueprint-editor-header` (hyphenation). He edits the file directly. He doesn't know about `make rename-surface`.

**Minute 0:00 — Making the Edit**

Dev opens `surfaces.json`, fixes the hyphenation, saves. Runs `git add surfaces.json && git push`. Opens a PR.

**Minute 0:30 — PR Check Fires**

The Tier 1 check runs. The diff analysis detects: `tooltip.blueprintEditor-header` was removed; `tooltip.blueprint-editor-header` was added.

```
❌ TIER 1 ERROR: Stale surface reference in review_trigger condition
   ─────────────────────────────────────────────────────────────────────
   1 review_trigger condition references the removed surface name:

   Key: shared.label.blueprintName
   Condition: budget_below("tooltip.blueprintEditor-header", 25)
   This surface was renamed in this PR → "tooltip.blueprint-editor-header"

   Suggested fix (apply automatically?):
   > make repair-suppression-ref KEY=shared.label.blueprintName SURFACE=tooltip.blueprint-editor-header

   Or edit string-surface-map.json manually:
   Change: "surface": "tooltip.blueprintEditor-header"
     To:   "surface": "tooltip.blueprint-editor-header"

   ──
   NOTE: For future surface renames, use:
   make rename-surface FROM=tooltip.blueprintEditor-header TO=tooltip.blueprint-editor-header
   This propagates the rename to all dependent files atomically.
```

**Minute 1:00 — Applying the Fix**

Dev reads the error. He didn't know about `review_trigger` conditions. The suggested fix is clear. He runs:
```bash
make repair-suppression-ref KEY=shared.label.blueprintName SURFACE=tooltip.blueprint-editor-header
git add string-surface-map.json
git push
```

**Minute 1:30 — PR Passes**

The updated PR passes Tier 1. The error is gone. The `review_trigger_note` mentions the old name in free text — but that's a warning, not an error. Dev notes the warning and updates the note as well.

**Minute 2:00 — Learning the Right Way**

The error message included the note: "For future surface renames, use `make rename-surface`..." Dev bookmarks the command. Next surface rename, he uses it. The Tier 1 check becomes unnecessary for him — the command catches it at the source.

**UI Annotations:**
- Tier 1 error format: `❌` prefix, descriptive title, key + condition quoted in full, clean suggested fix with the exact command to run; the "or manually" path for developers who prefer text editing
- "Apply automatically?" CTA: the Tier 1 check cannot apply the fix automatically (it runs in CI, not on the dev's machine), but the prompt makes the manual command feel like a one-click operation — it's a copy-pasteable string, not a description of what to do
- `make rename-surface` in the error: surfaces the right tool at the moment of failure; the developer learns the command by encountering the consequence of not using it

---

## Interaction Effects

**With string-surface-map.json validation as a PR requirement (4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A):**

The Tier 1 validation suite for `string-surface-map.json` gains a new check: when `surfaces.json` changes, scan `review_trigger.surface` fields. This check runs in the same phase as the surface existence check and key completeness check. The surface rename diff analysis must be robust: it needs to understand `surfaces.json` schema evolution, not just string diffs.

**With budget table maintenance (4.69e-i-a-i-f-i-α-i-A-i-1-a-i):**

The `surfaces.json` governance (which ensures `budget.json` is regenerated when layout changes) is the write path for surface name changes. The `make rename-surface` command fits naturally into this governance: the rename is a type of layout change, and the command ensures all derived files (budget.json, string-surface-map.json) are updated in the same operation.

**With multi-surface string forking policy (4.69e-i-a-i-f-i-α-i-A-α-i):**

When `make rename-surface` decomposes a surface (1 → N), `review_trigger` conditions referencing the old surface require human selection of the replacement. The interactive prompt in the command produces the right fix, but in CI contexts (where interactive selection is unavailable), the decompose case must be flagged as a PR-blocking error requiring manual resolution.

**With fork suppression expiry evaluation (4.69e-i-a-i-f-i-α-i-A-α-i-1):**

A repaired stale reference may immediately trigger: if the condition `budget_below("tooltip.workbench", 20)` is newly evaluable and the surface's current budget is 18 chars, the condition is immediately true. The repair command should check for this: after updating the reference, evaluate the condition against current `budget.json`. If immediately true, emit: "⚠ Condition is currently met after repair. Suppression will trigger on next nightly build. Consider reviewing the fork decision now."

**With `make fork-string` and post-fork orphan detection (4.69e-i-a-i-f-i-α-i-A-α-i-4):**

The post-fork orphan detector scans for stale call sites after a fork. It should also scan for stale `review_trigger` conditions: after `shared.foo` is forked into `toast.foo` and `modal.foo`, any `review_trigger.surface` referencing a surface that was specifically associated with `shared.foo` may need updating. The fork operation changes the set of surfaces the key is associated with, which may make the old condition irrelevant.

**With suppression audit as a first-class quarterly artifact (4.69e-i-a-i-f-i-α-i-A-α-i-1-II):**

The quarterly audit report should include a section on suppression reference integrity: how many conditions were unevaluable at any point during the quarter, how quickly they were repaired, what caused the reference to go stale. This section serves as a signal for whether the `make rename-surface` adoption is improving over time.

---

## Sensory Description

The Tier 1 stale-reference error renders like a broken link in a modern IDE — that red underline feeling, but in a terminal. The surface name is quoted in full, highlighted in amber (not red — it's not a compilation failure, it's a reference integrity failure), and the closest match suggestion appears immediately below in cool blue text. The eye goes to the suggestion automatically: "Did you mean `tooltip.workbench`?" rendered like a gentle autocorrect prompt, not a stern compiler error. The copy-pasteable fix command is indented, monospace, easy to select.

The `make rename-surface` output scrolls like a deployment script — each component in sequence, a checkmark appearing as each step completes. The yellow `⚠` for "free text mentions of the old name" is the only non-green element, and it feels like a post-it note rather than an alarm: "you might want to look at this, but it won't break anything."

The audit report row for an unevaluable condition has a faint pulsing quality to it — the amber `⚠ UNEVALUABLE` text in the terminal, rendered with a `⚠` character that (in a rich terminal) displays slightly wider than its neighboring text. The "closest match" suggestion has a calm, confident color: this is a diagnosis, not a question. The system knows what happened; it just needs the human to confirm.

The `make repair-suppression-ref` command, when it runs, produces two lines: the update applied and the immediate condition evaluation ("current budget: 22 chars — condition NOT met; suppression remains active"). Two lines, clean, done. The developer closes the terminal with the feeling of having prevented a small silent failure, even if they'll never know exactly what that failure would have been.

---

## Comparable Systems

**TypeScript strict null checks and type narrowing:** TypeScript's `--strictNullChecks` mode requires explicit handling when a property might not exist. The `review_trigger.surface` reference problem is analogous: the system allows a string that might not point to anything, and the reference is only checked at evaluation time (runtime) rather than at write time (compile time). The TypeScript lesson: move validity checks as early as possible in the toolchain. Option B (PR-time detection) is the TypeScript approach: fail at "compile time" (PR merge), not "runtime" (nightly evaluation).

**CSS custom property references:** When a CSS custom property (variable) is renamed, all `var(--old-name)` references in stylesheets silently fall back to the initial value. The failure is silent and hard to detect without visual testing. The pattern of using a rename command that propagates references (like a CSS variable refactor in a design token tool) is the same principle as `make rename-surface`.

**Database foreign key constraints:** A foreign key constraint in a relational database prevents renaming/deleting a referenced row without updating or cascading the dependent rows. The `review_trigger.surface` reference is an unenforceable foreign key — it's a string in a JSON file, not a database column. Options B and C provide the equivalent of a database constraint: Option C is "cascading update," Option B is "blocked rename until references are repaired."

**Webpack module federation and package renames:** When an npm package is renamed (e.g., `babel-jest` → `@jest/transform`), all `import` statements in dependent projects break. The ecosystem solution is deprecation with alias (the old package re-exports from the new one for a migration window). This is the spirit of Option D's stable-ID architecture: stable identifiers that alias to current names, allowing rename without breakage. The npm ecosystem eventually found that alias-based migration at the registry level is preferable to tooling-based propagation.

---

## The TikTok Clip

The clip: a developer runs `make rename-surface FROM=tooltip.workbench-header TO=tooltip.workbench`. The terminal scrolls. Green checkmarks for each file. Then: `⚠ 1 review_trigger condition updated: shared.label.configVersion`. The developer pauses — they didn't know this file existed. They open `string-surface-map.json` and see a condition that, without this command, would have silently broken the expiry logic for a fork advisory suppression they've never heard of. The clip ends with the developer looking at the terminal: "The rename command just fixed a bug I didn't know I was about to create." The caption: "Infrastructure that prevents the quiet failures."

---

## New Aspects Discovered

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a — `make repair-suppression-ref` as a CLI tool:** full design of the surgical repair command — argument schema (`KEY`, `SURFACE`, `--dry-run`, `--validate`), output format, interaction with the CI system when running in non-interactive mode; how it differs from `make rename-surface` (batch rename vs. single-key repair)

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-b — Closest-match suggestion algorithm:** the fuzzy-match display in audit output and Tier 1 errors; choice of distance metric (Levenshtein vs. Jaro-Winkler vs. token-based for hierarchical names like `tooltip.workbench-header`); threshold for showing vs. suppressing the suggestion; handling the case where multiple matches have equal distance

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-c — Surface rename log as a first-class artifact:** `l10n/surface-rename-log.json` as a versioned record of all surface renames (from, to, date, PR); used by `make repair-suppression-ref` to suggest fixes for suppressions that pre-date the current audit; a surface rename 6 months ago that no one remembers can be traced from the log

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-d — Decompose case interactive selection in CI:** when a surface decomposes into N sub-surfaces and a `review_trigger` references the old surface, the repair requires human selection — but CI is non-interactive; design of the "awaiting human input" PR state: a PR is created with a comment enumerating the sub-surfaces and asking the developer to reply with their choice; the CI then applies the selection and commits

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-e — `review_trigger_note` free-text scanning scope:** the rename command scans `review_trigger_note` for mentions of the old surface name, but free text may mention surface names in many forms ("the workbench header tooltip", "header tooltip of the workbench panel") that aren't caught by a literal name match; design of the scan heuristic; whether false-positive rate is acceptable or whether the scan should be opt-in
