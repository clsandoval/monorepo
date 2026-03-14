# `make repair-suppression-ref` as a CLI Tool

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a — Full design of the surgical repair command: argument schema, output format, interaction with CI in non-interactive mode; how it differs from `make rename-surface`

**Parent:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I — Suppression condition reference integrity (established: Options B+C as complementary layers — `make rename-surface` for proactive propagation + Tier 1 PR-time ref check on `surfaces.json` modifications; `make repair-suppression-ref` mentioned in Priya and Dev journeys as a single-key surgical fix)

**The gap this closes:** The parent analysis named `make repair-suppression-ref` three times in developer journeys and the sensory description, but never designed it. It was used in example commands and described in one sentence: "a targeted surgical tool distinct from `make rename-surface` (which is for doing the rename) and `make l10n-suppression-audit` (which is for reading the state)." This analysis designs the command completely: every argument, every output state, every edge case, every CI interaction model.

---

## The Problem This Command Solves

Three commands live in the suppression reference integrity toolchain:

| Command | When to use | What it does |
|---------|-------------|--------------|
| `make rename-surface` | You are renaming a surface right now | Batch operation: updates surfaces.json, regenerates budget.json, updates ALL review_trigger references atomically |
| `make l10n-suppression-audit` | You want to read the current state | Read-only report: lists all suppressions, their conditions, their health |
| `make repair-suppression-ref` | A stale reference already exists | Surgical fix: updates ONE review_trigger.surface field in one map entry, validates the fix |

The scenario that creates the need for `make repair-suppression-ref` is: a surface was renamed in the past (without using `make rename-surface`), the reference went stale, and now you need to fix it. The fix is surgical — you know exactly which key is broken, you know the new surface name (possibly suggested by the audit output), and you want to apply the fix with validation and no side effects.

`make rename-surface` is the wrong tool here for two reasons:

1. **It does too much.** `rename-surface` updates all 12 component call sites, all 3 suppression conditions, and free-text notes in a batch operation. When you're repairing a stale reference discovered weeks or months after the rename, you only want to fix the suppression condition. You don't want to accidentally re-run the component updates (which may have already been done, or may produce incorrect output against the current codebase state).

2. **It does the wrong thing.** `rename-surface` assumes you are currently performing a rename. `repair-suppression-ref` assumes the rename already happened and you're cleaning up the aftermath. The semantic intent is different, the safety model is different, and the output should reflect that.

---

## Argument Schema

### Required Arguments

**`KEY=<string>`** — The full string key whose `review_trigger.surface` field needs repair.

```bash
make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast
```

Must match a key in `string-surface-map.json`. If the key does not exist, the command exits with an error.

**`SURFACE=<string>`** — The new surface name to write into `review_trigger.surface`.

Must exist in the current `budget.json`. If the surface does not exist, the command exits with an error and shows the closest matches (same fuzzy-match algorithm as the audit report).

### Optional Arguments

**`--dry-run`** — Show what would happen without writing anything. Outputs the same text as a real run but prefixes every change line with `[DRY RUN]` and does not modify any file. Does not stage any files. Does not evaluate the condition against current budget.

```bash
make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast --dry-run
```

Use case: a developer wants to preview the change before committing, or wants to verify that the suggested surface is the right one before applying.

**`--validate-only`** — Check whether the specified KEY has a stale reference and whether the specified SURFACE exists in budget.json, without writing. Exits 0 if the surface exists and would fix a stale condition; exits 1 with an explanation if not.

```bash
make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast --validate-only
```

Use case: CI pre-validation step where the orchestration layer wants to check feasibility before running the repair in a subsequent step.

**`--no-immediate-check`** — Skip the post-repair immediate condition evaluation. By default, after writing the fix, the command evaluates the repaired condition against the current `budget.json` to check if it would immediately trigger. `--no-immediate-check` disables this step.

Use case: batch repair scripts that want consistent output format without the evaluation output.

**`--output-format=<format>`** — Controls output format. Values: `human` (default, colored terminal output), `json` (machine-readable JSON to stdout), `quiet` (exit code only — 0 for success, 1 for failure, no output).

Use case: `--output-format=json` for CI scripts that parse the output; `--output-format=quiet` for Makefiles that chain repair commands without verbose output.

**`--no-stage`** — Apply the file change but do not run `git add` on the modified file. By default, the command stages the changed file for convenience.

Use case: when the developer wants to batch multiple repairs before a single `git add -A`.

**`--confirm-surface=<name>`** — When the current `review_trigger.surface` value still exists in `budget.json` (i.e., the reference is not actually stale, but the developer wants to change it), require an explicit confirmation that the current surface is intentionally being replaced. Without this flag, the command exits with an informational message: "Surface 'old.surface' is valid in budget.json. Did you mean to use `make rename-surface`? Re-run with --confirm-surface=old.surface if this is intentional."

Use case: prevents accidental surface reassignment when the developer confused which surface was stale.

### Full Argument Reference

```
make repair-suppression-ref KEY=<key> SURFACE=<surface> [OPTIONS]

Required:
  KEY=<key>               String key in string-surface-map.json
  SURFACE=<surface>       New surface name to write into review_trigger.surface

Options:
  --dry-run               Preview changes without writing
  --validate-only         Check feasibility without writing; exits 0/1
  --no-immediate-check    Skip post-repair condition evaluation
  --output-format=<fmt>   human (default) | json | quiet
  --no-stage              Don't git add after writing
  --confirm-surface=<s>   Required when current surface is not stale
```

---

## Output Format: Human Mode (Default)

### Success Path — Stale Reference Fixed

```
make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast

Repairing stale review_trigger reference in string-surface-map.json

  Key:              shared.error.bufferFull.toast
  Stale surface:    "toast.legacy"  [not found in budget.json]
  New surface:      "notification.toast"  [✓ exists in budget.json]

  Writing update ...............................................  ✓
    string-surface-map.json: review_trigger.surface
      was: "toast.legacy"
      now: "notification.toast"
  Staging change ...............................................  ✓

  Post-repair condition check:
    Condition: budget_below("notification.toast", 15)
    Current budget: 22 chars  →  condition NOT met (7 chars above threshold)
    Suppression remains active.

Done.
  Modified: string-surface-map.json
  Commit message: l10n(repair-ref): shared.error.bufferFull.toast → notification.toast
```

The commit message suggestion is copy-pasteable. It follows the established `l10n(...)` commit prefix convention.

---

### Post-Repair Condition Immediately True

```
make repair-suppression-ref KEY=shared.label.configVersion SURFACE=tooltip.workbench

Repairing stale review_trigger reference in string-surface-map.json

  Key:              shared.label.configVersion
  Stale surface:    "tooltip.workbench-header"  [not found in budget.json]
  New surface:      "tooltip.workbench"  [✓ exists in budget.json]

  Writing update ...............................................  ✓
    string-surface-map.json: review_trigger.surface
      was: "tooltip.workbench-header"
      now: "tooltip.workbench"
  Staging change ...............................................  ✓

  Post-repair condition check:
    Condition: budget_below("tooltip.workbench", 20)
    Current budget: 17 chars  →  ⚠ CONDITION IS CURRENTLY MET

  The repaired condition is immediately true at current values.
  On the next nightly build, this suppression will trigger and re-fire the fork advisory.

  Options:
    (A) Accept: commit as-is; fork advisory will fire on next nightly
    (B) Adjust threshold: edit review_trigger.threshold to a value > 17 in string-surface-map.json
    (C) Fork now: make fork-string KEY=shared.label.configVersion --dry-run
    (D) Re-suppress with new reason: update fork_advisory_suppressed and fork_advisory_reason

  The change has been staged. Add and commit to proceed, or edit threshold first.
```

The "immediately true" case is an important edge: the repair was technically correct (the reference is now valid) but the condition it references is currently satisfied, meaning the suppression will trigger on next nightly. The command does not block — the file is written and staged — but it surfaces the options clearly so the developer can make a conscious decision.

---

### Error: KEY Not Found

```
make repair-suppression-ref KEY=shared.foo.nonexistent SURFACE=tooltip.workbench

Error: Key not found
  "shared.foo.nonexistent" does not exist in string-surface-map.json

  Did you mean one of:
    shared.foo.barLabel  (review_trigger: budget_below, surface: tooltip.workbench)
    shared.foo.bazTitle  (review_trigger: none)

  Run 'make l10n-suppression-audit' to view all suppressed keys.
  Exit code: 1
```

Fuzzy-match suggestions for the key as well as the surface. The suggestions show whether each candidate has a `review_trigger` already — reducing the lookup the developer has to do to verify they have the right key.

---

### Error: SURFACE Not Found in budget.json

```
make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toasty

Error: Surface not found in budget.json
  "notification.toasty" does not exist in the current budget table

  Closest matches:
    notification.toast          (edit distance: 1)
    notification.toast.compact  (edit distance: 2)
    notification.toast.expanded (edit distance: 2)

  View all surfaces with: make l10n-list-surfaces [--filter=notification]
  Exit code: 1
```

---

### Error: No review_trigger on Key

```
make repair-suppression-ref KEY=shared.nav.backButton.label SURFACE=sidebar.panel

Error: No review_trigger condition to repair
  "shared.nav.backButton.label" has fork_advisory_suppressed: true but no review_trigger field

  This suppression has no evaluable condition. To add one:
    Edit string-surface-map.json and add a review_trigger to this entry.
    Condition types: budget_below, budget_ratio_exceeds, surface_count_exceeds, days_elapsed, never

  To view the suppression details: make l10n-suppression-audit --key=shared.nav.backButton.label
  Exit code: 1
```

---

### Error: review_trigger Has No Surface Field (Non-Budget Condition)

```
make repair-suppression-ref KEY=shared.ui.executeButton.label SURFACE=tooltip.action

Error: review_trigger condition type does not use a surface field
  Key:       shared.ui.executeButton.label
  Condition: days_elapsed(180)

  The "days_elapsed" condition type has no "surface" field.
  Surface reference repair is only applicable to conditions of type:
    budget_below, budget_ratio_exceeds (when using explicit surface)

  No changes made.
  Exit code: 1
```

---

### Dry-Run Output

```
make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast --dry-run

[DRY RUN] Repairing stale review_trigger reference in string-surface-map.json

  Key:              shared.error.bufferFull.toast
  Stale surface:    "toast.legacy"  [not found in budget.json]
  New surface:      "notification.toast"  [✓ exists in budget.json]

[DRY RUN] Writing update ........................  (not applied)
  string-surface-map.json: review_trigger.surface
    would change: "toast.legacy" → "notification.toast"

[DRY RUN] Staging ..............................  (not applied)

  Post-repair condition check:
    Condition: budget_below("notification.toast", 15)
    Current budget: 22 chars  →  condition NOT met (7 chars above threshold)
    Suppression would remain active.

[DRY RUN] No changes were made.
```

The dry-run output is identical in structure to the real output. This makes it easy to review before committing — you can compare the dry-run output to the real output to verify nothing unexpected happened.

---

## Output Format: JSON Mode

The `--output-format=json` mode writes a single JSON object to stdout on completion. This is the primary format for CI scripts and orchestration layers that need to parse results.

### Success

```json
{
  "status": "success",
  "key": "shared.error.bufferFull.toast",
  "stale_surface": "toast.legacy",
  "new_surface": "notification.toast",
  "files_modified": ["l10n/string-surface-map.json"],
  "staged": true,
  "immediate_trigger": false,
  "condition": {
    "type": "budget_below",
    "surface": "notification.toast",
    "threshold": 15,
    "current_budget": 22,
    "triggered": false
  },
  "suggested_commit_message": "l10n(repair-ref): shared.error.bufferFull.toast → notification.toast"
}
```

### Immediate Trigger

```json
{
  "status": "success_with_warning",
  "key": "shared.label.configVersion",
  "stale_surface": "tooltip.workbench-header",
  "new_surface": "tooltip.workbench",
  "files_modified": ["l10n/string-surface-map.json"],
  "staged": true,
  "immediate_trigger": true,
  "condition": {
    "type": "budget_below",
    "surface": "tooltip.workbench",
    "threshold": 20,
    "current_budget": 17,
    "triggered": true
  },
  "warning": "condition_immediately_met",
  "suggested_commit_message": "l10n(repair-ref): shared.label.configVersion → tooltip.workbench [immediate trigger]"
}
```

The `immediate_trigger: true` field allows the CI orchestration layer to decide what to do: it might create a PR, emit a Slack alert, or open a JIRA ticket, depending on the team's configured escalation path.

### Error

```json
{
  "status": "error",
  "error_code": "surface_not_found",
  "key": "shared.error.bufferFull.toast",
  "surface_requested": "notification.toasty",
  "closest_matches": [
    { "name": "notification.toast", "edit_distance": 1 },
    { "name": "notification.toast.compact", "edit_distance": 2 }
  ],
  "message": "Surface 'notification.toasty' not found in budget.json"
}
```

### Error Codes

| Code | Meaning |
|------|---------|
| `key_not_found` | KEY does not exist in string-surface-map.json |
| `surface_not_found` | SURFACE does not exist in budget.json |
| `no_review_trigger` | The key has no review_trigger field |
| `condition_no_surface` | The review_trigger type does not use a surface field |
| `surface_not_stale` | The current surface IS valid (not stale); use --confirm-surface |
| `file_write_error` | Could not write to string-surface-map.json (permissions, lock) |
| `git_stage_error` | Could not git add the file (not in a git repo, unstaged conflicts) |

---

## Non-Interactive CI Mode

The command must work correctly in non-interactive CI contexts. This is not a trivial concern: several of the command's behaviors involve presenting options (the "immediately true" case lists Options A/B/C/D) that assume a human is reading and responding. In CI, no human is present.

### The CI Detection Heuristic

The command detects non-interactive mode via:

```bash
# Check 1: TTY detection
if [ ! -t 0 ] || [ ! -t 1 ]; then NON_INTERACTIVE=1; fi

# Check 2: Explicit environment variable
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then NON_INTERACTIVE=1; fi

# Check 3: Make flag
if make repair-suppression-ref ... --non-interactive; then ...
```

When `NON_INTERACTIVE=1`, the command changes its behavior in three ways:

**1. No interactive prompts.** The "immediately true" case does not pause to present options. It completes the repair, stages the file, emits the `status: "success_with_warning"` JSON, and exits. The orchestration layer handles the escalation.

**2. Forced JSON output.** Non-interactive mode always uses `--output-format=json` unless `--output-format=quiet` is explicitly set. Human-readable output with color codes is useless in CI logs.

**3. Strict exit codes.** In human mode, the "immediately true" case exits 0 (success with warning). In CI non-interactive mode, it exits 2 (partial success — the repair succeeded but requires follow-up). This allows CI Makefiles to treat `exit 0` as clean and `exit 2` as "succeeded but needs human review."

### Exit Code Table for CI

| Situation | Human mode | CI non-interactive mode |
|-----------|------------|------------------------|
| Success, condition not triggered | 0 | 0 |
| Success, condition immediately triggered | 0 (with warning text) | 2 (partial success) |
| Error: key not found | 1 | 1 |
| Error: surface not found | 1 | 1 |
| Error: surface not stale | 1 (with instructions) | 1 |
| File write error | 1 | 1 |
| Dry-run completed | 0 | 0 |

### CI Usage Pattern

The typical CI usage (triggered by the Tier 1 stale-reference check recommending a fix):

```yaml
# .github/workflows/l10n-repair.yml
- name: Repair stale suppression reference
  run: |
    make repair-suppression-ref \
      KEY="${{ github.event.inputs.key }}" \
      SURFACE="${{ github.event.inputs.surface }}" \
      --output-format=json \
      --non-interactive \
    > /tmp/repair-output.json

    EXIT_CODE=$?

    if [ $EXIT_CODE -eq 2 ]; then
      # Repair succeeded but condition immediately triggered
      # Create a follow-up issue
      gh issue create \
        --title "l10n: suppression condition immediately triggered after repair" \
        --body "$(cat /tmp/repair-output.json | jq -r '.key') needs fork review"
    fi

    exit $EXIT_CODE
```

The CI workflow reads the JSON output to extract context for the follow-up issue. The exit code tells it whether to escalate.

### The Decompose Case in Non-Interactive Mode

When a surface was decomposed (1 → N), the repair cannot proceed without human selection of the replacement sub-surface. In human mode, this prompts the user interactively. In CI non-interactive mode:

```json
{
  "status": "error",
  "error_code": "surface_decomposed",
  "key": "shared.label.configVersion",
  "stale_surface": "modal.confirm",
  "decomposed_into": [
    { "name": "modal.confirm.small", "budget": 80 },
    { "name": "modal.confirm.large", "budget": 240 }
  ],
  "message": "Surface 'modal.confirm' was decomposed into multiple sub-surfaces. Human selection required. Re-run with SURFACE=<selected> to apply repair."
}
```

Exit code: 3 (human selection required). The CI workflow checks for exit code 3 and creates a GitHub PR comment or issue asking the responsible developer to re-run with an explicit SURFACE argument.

---

## How It Differs from `make rename-surface`

This is the most important design distinction in the toolchain. The two commands are superficially similar — both modify `review_trigger.surface` values in `string-surface-map.json` — but they operate at completely different levels of abstraction.

| Dimension | `make rename-surface` | `make repair-suppression-ref` |
|-----------|----------------------|-------------------------------|
| **Semantic intent** | "I am renaming a surface right now" | "A surface was renamed in the past; I am cleaning up a stale reference" |
| **Timing** | Before or during the rename | After the rename, when stale ref discovered |
| **Scope** | All affected files (surfaces.json, budget.json, all review_trigger conditions, all useSurface() call sites, free-text notes) | Single review_trigger.surface field in a single map entry |
| **Primary input** | `FROM=old-name TO=new-name` | `KEY=string-key SURFACE=new-surface` |
| **Side effects** | Massive: regenerates budget.json, updates component files, scans free-text notes, records rename in surface-rename-log.json | Minimal: one field update in string-surface-map.json |
| **Surface-rename-log** | Yes — records the rename mapping | No — does not record anything; the rename already happened |
| **CI safety** | Should not be run by CI (it's a developer workflow command) | Designed to be run by CI with --non-interactive flag |
| **Idempotency** | Dangerous if run twice: a second rename inverts the first | Safe if run twice: writing the same value is a no-op |
| **When to use** | You are the developer doing the rename, before committing | You are fixing a stale reference discovered by audit or Tier 1 |
| **Error if current value is valid** | Not an error (it's doing the rename) | Yes — emits "surface not stale" error to prevent accidental reassignment |

**The key mental model:** `rename-surface` is a codemod. It transforms the codebase the way a TypeScript rename refactoring transforms TypeScript source. It should feel like running a refactoring tool. `repair-suppression-ref` is a targeted surgical fix. It should feel like running `sed -i 's/old/new/' one-file.json` with validation.

**Why the "surface not stale" guard matters:** Without it, a developer could accidentally run:

```bash
make repair-suppression-ref KEY=shared.label.configVersion SURFACE=tooltip.workbench
```

...when the current `review_trigger.surface` is already `tooltip.workbench-header` (which IS a valid surface in budget.json, just not the one the developer intended). This would be a surface reassignment, not a repair. The `--confirm-surface` guard forces the developer to acknowledge that they're changing a non-stale reference.

---

## Player Journeys

### Journey: Priya, 38, L10n Maintainer — Running Repairs from the Quarterly Audit

**Context:** Mission 7 equivalent — a team that has been playing the game for 18 months. Priya runs the quarterly suppression audit and discovers three unevaluable conditions. The repair command is her primary tool for fixing them efficiently.

**Minute 0:00 — Audit Reveals Three Problems**

Priya runs `make l10n-suppression-audit`. The terminal fills with a table. Most rows are green. Three rows show `✗ UNEVALUABLE` in red:

```
shared.error.bufferFull.toast    budget_below("toast.legacy", 15)      ✗ UNEVALUABLE
shared.nav.tooltipDelay.label    budget_below("sidebar.Panel", 40)     ✗ UNEVALUABLE
shared.ui.missionAbort.confirm   budget_below("modal.abort-legacy", 20) ✗ UNEVALUABLE
```

Each row has a "Closest match" entry below it:
- `toast.legacy` → `notification.toast` (edit distance 2)
- `sidebar.Panel` → `sidebar.panel` (edit distance 0, case-insensitive match)
- `modal.abort-legacy` → `modal.abort` (edit distance 7, possible deletion)

**Minute 0:30 — First Repair: Confident Match**

The first one is easy. `notification.toast` is clearly the renamed version of `toast.legacy`. Priya runs:

```bash
make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast
```

The terminal scrolls:
```
  Stale surface:    "toast.legacy"  [not found in budget.json]
  New surface:      "notification.toast"  [✓ exists in budget.json]
  Writing update ..............................................  ✓
  Staging change ..............................................  ✓
  Post-repair condition check:
    Condition: budget_below("notification.toast", 15)
    Current budget: 22 chars  →  condition NOT met
    Suppression remains active.
Done.
```

Green checkmarks all the way. 10 seconds.

**Minute 1:00 — Second Repair: Case Normalization**

`sidebar.Panel` → `sidebar.panel` is a casing fix. Before running the repair, Priya runs with `--dry-run` to confirm:

```bash
make repair-suppression-ref KEY=shared.nav.tooltipDelay.label SURFACE=sidebar.panel --dry-run
```

Dry-run shows the change. Priya notices: the current `review_trigger.surface` is `sidebar.Panel` (capital P), but `budget.json` has `sidebar.panel`. The closest-match algorithm detected the case-insensitive match. The `--dry-run` output reads:

```
[DRY RUN] would change: "sidebar.Panel" → "sidebar.panel"
```

She removes `--dry-run` and runs the repair. Clean.

**Minute 1:30 — Third Repair: Uncertain Match**

`modal.abort-legacy` → `modal.abort` has an edit distance of 7. That's high enough to give Priya pause. Before running the repair, she checks the surface rename log:

```bash
cat l10n/surface-rename-log.json | jq '.[] | select(.from | contains("abort"))'
```

```json
{
  "from": "modal.abort-legacy",
  "to": "modal.abort",
  "date": "2025-11-18",
  "pr": "PR #412"
}
```

Confirmed. `modal.abort` is the correct replacement. She runs the repair.

```bash
make repair-suppression-ref KEY=shared.ui.missionAbort.confirm SURFACE=modal.abort
```

This one triggers the post-repair check:

```
  Post-repair condition check:
    Condition: budget_below("modal.abort", 20)
    Current budget: 18 chars  →  ⚠ CONDITION IS CURRENTLY MET

  The repaired condition is immediately true at current values.
  On the next nightly build, this suppression will trigger and re-fire the fork advisory.

  Options:
    (A) Accept: commit as-is; fork advisory will fire on next nightly
    (B) Adjust threshold: edit review_trigger.threshold to a value > 18
    (C) Fork now: make fork-string KEY=shared.ui.missionAbort.confirm --dry-run
    (D) Re-suppress with new reason
```

Priya looks at the key. `shared.ui.missionAbort.confirm` — the mission abort confirmation dialog. Budget of 18 chars on `modal.abort` means translations are tight. She runs the dry-run fork:

```bash
make fork-string KEY=shared.ui.missionAbort.confirm --dry-run
```

The output shows 2 call sites, 0 translatable divergence needed (both surfaces use the same text already). Forking is the right call. She runs the fork for real.

**Minute 3:00 — Confirming Clean State**

After repairs and the fork, Priya re-runs the audit:

```
3 active suppressions | 0 triggered | 0 unevaluable | 0 expiring within 30 days
```

Clean. She commits all three changes in a single commit:

```bash
git commit -m "l10n(repair-refs): fix 3 stale review_trigger surface references from Q4 refactor"
```

**Minute 4:00 — Reflection**

The three repairs took less than 5 minutes of actual work time. The surface rename log was essential for the uncertain match. She files a task: add a check to the deploy pipeline that runs `make l10n-suppression-audit` and notifies the l10n channel if any unevaluable conditions appear (rather than waiting for quarterly reviews to catch them).

**UI Annotations:**
- Audit table `✗ UNEVALUABLE` rows: red text, closest-match suggestion indented below in amber, edit distance in parentheses; sorted to top of table by default ("needs attention" tier)
- `repair-suppression-ref` on confident match: 3 green checkmarks in sequence, fast scrolling; feels like a health check that passed
- `repair-suppression-ref` on immediate trigger: the options list is indented and separated by a blank line from the success block; the change is staged but the terminal is clearly "waiting for you to read this"
- Dry-run prefix `[DRY RUN]` rendered in dim grey before each action line; makes the real run feel conclusive by contrast

---

### Journey: Dev, 26, Frontend Developer — Running Repair After Tier 1 Suggests It

**Context:** Mission 4 equivalent — a newer developer who has not used the l10n toolchain before. He makes a manual `surfaces.json` edit, his PR is blocked by Tier 1, and the error message suggests running `make repair-suppression-ref`. This is his first time running the command.

**Minute 0:00 — PR Blocked by Tier 1**

Dev pushes a PR with a surface rename. The Tier 1 check fires:

```
❌ TIER 1 ERROR: Stale surface reference in review_trigger condition
   Key: shared.label.blueprintName
   Condition: budget_below("tooltip.blueprintEditor-header", 25)
   Problem: "tooltip.blueprintEditor-header" was renamed in this PR → "tooltip.blueprint-editor-header"

   Suggested fix:
   > make repair-suppression-ref KEY=shared.label.blueprintName SURFACE=tooltip.blueprint-editor-header
```

Dev copies the command.

**Minute 0:30 — Running the Repair**

He pastes the command into his terminal:

```bash
make repair-suppression-ref KEY=shared.label.blueprintName SURFACE=tooltip.blueprint-editor-header
```

The terminal shows:

```
  Stale surface:    "tooltip.blueprintEditor-header"  [not found in budget.json]
  New surface:      "tooltip.blueprint-editor-header"  [✓ exists in budget.json]
  Writing update ...............................................  ✓
    review_trigger.surface: "tooltip.blueprintEditor-header" → "tooltip.blueprint-editor-header"
  Staging change ...............................................  ✓
  Post-repair condition check:
    Condition: budget_below("tooltip.blueprint-editor-header", 25)
    Current budget: 31 chars  →  condition NOT met (6 chars above threshold)
    Suppression remains active.
Done.
```

Dev reads the output. He didn't know what `review_trigger` was before this. The output tells him: there's a condition that monitors whether the tooltip budget drops below 25 chars; it's not triggered yet. The suppression is still active.

**Minute 1:00 — Adding the Fix to the PR**

Dev runs `git add string-surface-map.json` (already staged by the repair command — he just confirms it) and `git push`. The PR updates. Tier 1 re-runs.

This time: no error for the stale reference. The PR passes.

**Minute 1:30 — Learning Moment**

Dev looks at the PR diff. Three files changed: `surfaces.json` (his original change), `string-surface-map.json` (the repair command's change). He notices the `review_trigger` entry and reads it for the first time. He understands: there's a system that auto-re-fires fork advisories when budgets drop. The repair command updated one reference in that system.

He reads the Tier 1 error message suggestion at the bottom: "For future surface renames, use `make rename-surface`..." He bookmarks it.

**Minute 2:00 — Resolution**

The PR merges. The `review_trigger` condition for `shared.label.blueprintName` now correctly references `tooltip.blueprint-editor-header`. Dev never had to understand the full l10n toolchain — the error message told him exactly what to run, the repair command told him exactly what it did, and the system handled the rest.

**UI Annotations:**
- The Tier 1 error message: the suggested repair command is in a distinct block — indented, monospace, prefixed with `>` — visually separated from the explanation text; looks like a code block in a documentation page, not just part of the error prose
- Repair command output for a first-time user: the "condition NOT met" line with the "6 chars above threshold" annotation gives Dev just enough context to understand what the condition does without requiring him to read the documentation
- `git add` already staged: the repair command's default staging is a deliberate UX choice to reduce friction; the developer sees the change ready to push, not another step to complete

---

### Journey: Aarav, 28, CI Automation Engineer — Building a Batch Repair Script

**Context:** Wave 5 equivalent — a large project with 40+ active suppressions. Aarav wants to build a batch repair script that reads the suppression audit output, identifies unevaluable conditions, looks up the correct surface from the surface rename log, and applies repairs automatically. He needs the `--output-format=json` mode and the `--validate-only` flag to build a reliable pipeline.

**Minute 0:00 — Designing the Pipeline**

Aarav's approach:

1. Run `make l10n-suppression-audit --output-format=json` to get all unevaluable conditions
2. For each unevaluable condition, look up the stale surface in `surface-rename-log.json` to find its replacement
3. If a confident match exists (single entry in rename log), run `make repair-suppression-ref --validate-only` first to confirm feasibility
4. If validation passes, run the repair with `--output-format=json --non-interactive`
5. Collect all exit codes; commit changes if any exits were 0; create issues for any exit-2 (immediate trigger) or exit-3 (decompose) cases

**Minute 1:00 — Building the Script**

```bash
#!/bin/bash
# batch-repair-stale-refs.sh

AUDIT=$(make l10n-suppression-audit --output-format=json)
UNEVALUABLE=$(echo $AUDIT | jq '.suppressions[] | select(.status == "unevaluable")')

for ENTRY in $(echo $UNEVALUABLE | jq -r '. | @base64'); do
  KEY=$(echo $ENTRY | base64 -d | jq -r '.key')
  STALE_SURFACE=$(echo $ENTRY | base64 -d | jq -r '.stale_surface')

  # Look up rename log
  NEW_SURFACE=$(cat l10n/surface-rename-log.json | jq -r \
    ".[] | select(.from == \"$STALE_SURFACE\") | .to" | head -1)

  if [ -z "$NEW_SURFACE" ]; then
    echo "SKIP: No rename log entry for $STALE_SURFACE (key: $KEY)"
    continue
  fi

  # Validate before applying
  VALIDATE=$(make repair-suppression-ref \
    KEY="$KEY" SURFACE="$NEW_SURFACE" --validate-only --output-format=json)

  if [ $? -ne 0 ]; then
    echo "VALIDATION FAILED: $KEY → $NEW_SURFACE"
    echo $VALIDATE | jq '.'
    continue
  fi

  # Apply repair
  RESULT=$(make repair-suppression-ref \
    KEY="$KEY" SURFACE="$NEW_SURFACE" \
    --output-format=json --non-interactive --no-stage)

  EXIT=$?

  if [ $EXIT -eq 0 ]; then
    echo "REPAIRED: $KEY → $NEW_SURFACE"
  elif [ $EXIT -eq 2 ]; then
    echo "IMMEDIATE TRIGGER: $KEY — condition met after repair"
    # Create GitHub issue for human review
    gh issue create \
      --title "l10n: $KEY condition immediately triggered after repair" \
      --body "$(echo $RESULT | jq -r '.key') repair succeeded but requires fork review"
  fi
done

# Stage and commit all repaired files
git add l10n/string-surface-map.json
git commit -m "l10n(batch-repair): fix stale review_trigger references from surface-rename-log"
```

**Minute 3:00 — Testing the Pipeline**

Aarav runs the script in dry-run mode on a test branch. Three of the five unevaluable conditions have clean rename log entries; the fourth was decomposed (exit 3); the fifth has no rename log entry (the surface was deleted, not renamed — no repair possible without human review).

The script correctly:
- Repairs 3 cleanly
- Opens 1 GitHub issue for the immediate-trigger case
- Skips 1 with a "SKIP: No rename log entry" message
- Does not touch the decompose case (exit 3)

**Minute 4:30 — The `--validate-only` Value**

Aarav realizes the `--validate-only` step is critical for one edge case: when the surface rename log has an entry but the new surface was *also* subsequently renamed. Without `--validate-only`, the repair would fail with `surface_not_found` after all the script setup work was done. With `--validate-only`, the failure is detected before any changes are made, and the script can emit a clean skip message.

He adds logic: when `--validate-only` returns `surface_not_found`, follow the chain — look up the suggested new surface in `surface-rename-log.json` again (second-level lookup). If a second-level entry exists, use that. Log the chain: `toast.legacy → notification.toast → notification.message` (surface renamed twice).

**Minute 5:30 — Resolution**

The pipeline runs successfully in CI. Every quarter, when the suppression audit detects unevaluable conditions, the batch script runs automatically and repairs the ones that can be confidently resolved from the rename log. Human review issues are created for the rest.

The monthly suppression audit health metric shows: "3 unevaluable conditions auto-repaired by pipeline; 0 human-required decompose cases; 1 orphaned surface (manual review needed)."

**UI Annotations:**
- `--validate-only` exit codes: 0 = can repair, 1 = cannot repair (with error code in JSON explaining why); precise enough for conditional logic
- `--no-stage` flag: when the script manages git operations itself, it doesn't want the repair command staging files independently; the flag decouples the repair (file write) from the git operation
- JSON output structure: every field that a CI script would need is top-level in the object; no digging through nested structures for `status`, `key`, `immediate_trigger`, and `error_code`

---

## Interaction Effects

**With `make l10n-suppression-audit` (4.69e-i-a-i-f-i-α-i-A-α-i-1-II):**

The audit is the primary discovery mechanism for `repair-suppression-ref` targets. The audit output in `--output-format=json` mode should include the `repair_command` field for each unevaluable condition — a pre-formed command string the developer can copy-paste or execute directly:

```json
{
  "status": "unevaluable",
  "key": "shared.error.bufferFull.toast",
  "stale_surface": "toast.legacy",
  "closest_match": "notification.toast",
  "repair_command": "make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast"
}
```

The human-mode audit output shows the repair command at the end of the unevaluable section: "Run to repair: make repair-suppression-ref KEY=... SURFACE=..." — making the repair a copy-paste operation from the audit output.

**With surface rename log (4.69e-i-a-i-f-i-α-i-A-α-i-1-I-c):**

The repair command uses the surface rename log as a hint source when no SURFACE argument is provided. A future design option: `make repair-suppression-ref KEY=... --auto-lookup` which looks up the stale surface in the rename log and applies the repair automatically if a single unambiguous match exists. This reduces the repair to a single command with no arguments beyond the key.

**With Tier 1 PR-time ref check (parent: 4.69e-i-a-i-f-i-α-i-A-α-i-1-I):**

The Tier 1 error message format should include the exact repair command as a copy-pasteable string. The error-to-repair workflow should be achievable in under 2 minutes: read error, copy command, run command, push. The Tier 1 check should detect if the same stale reference is re-introduced in a subsequent PR (i.e., the repair was applied but the developer didn't commit it) and emit the same error again.

**With fork suppression expiry lifecycle (4.69e-i-a-i-f-i-α-i-A-α-i-1):**

After repair, an immediately-triggered suppression enters the `"triggered"` state on the next nightly build. The repair command's immediate-trigger warning pre-informs the developer of this. The design question: should the repair command offer a shortcut to immediately trigger the state (write `fork_advisory_suppressed: "triggered"` in the same operation) rather than waiting for the nightly build? Answer: no. The `"triggered"` state should only be set by the CI evaluation engine, not by a repair command. The repair command's job is reference integrity, not condition evaluation.

**With closest-match suggestion algorithm (4.69e-i-a-i-f-i-α-i-A-α-i-1-I-b):**

The repair command uses the same fuzzy-match algorithm as the audit report for closest-match suggestions on invalid SURFACE arguments. The algorithm and threshold should be a shared library function so both the audit and the repair command behave consistently. When the audit shows "Closest match: notification.toast (edit distance 1)", running the repair with SURFACE=notification.toast should succeed cleanly without the developer needing to verify the name independently.

**With `make fork-string` (4.69e-i-a-i-f-i-α-i-A-α-i — parent forking policy):**

When the immediate-trigger case presents Option C ("Fork now"), the repair command outputs the exact `make fork-string` command to run. The repair → immediate-trigger → fork path should be achievable in sequence without leaving the terminal: repair, read the trigger warning, run the fork command, commit. Three commands, one session.

---

## Sensory Description

The `make repair-suppression-ref` command has the feel of a precision tool — not a heavy-handed codemod like `rename-surface` that opens several files and scrolls through dozens of lines, but a small, targeted instrument that makes one incision and closes cleanly.

The output loads fast. Two lines of setup (stale surface confirmed not-found, new surface confirmed-found), then a single "Writing update" line with the checkmark, then the staging checkmark. Then the post-repair check — either clean (green "condition NOT met," two lines, done) or amber (the immediately-true case with its options list). The terminal reads like a short medical report: "Found the problem. Applied the fix. Current status stable." Or: "Found the problem. Applied the fix. Immediate attention required."

The dry-run output has a distinct visual rhythm: every action line is preceded by `[DRY RUN]` in dim grey, like seeing a document with "DRAFT" watermarked across every page. When you remove `--dry-run` and run for real, the absence of `[DRY RUN]` makes the actual execution feel conclusive.

The JSON output mode is deliberately terse — a single object, no nesting more than two levels deep, every field short-named and obvious. It reads like a health check API response: `{"status": "success", "key": "...", "immediate_trigger": false}`. A CI script parsing this should be able to write the condition check in one line.

The error cases each have a distinct shape. `surface_not_found` is the softest error — the system tried, didn't find it, here are the closest guesses. `surface_not_stale` is the most instructive — you used the wrong tool; here's what to use instead. `no_review_trigger` is neutral — there's nothing to repair because there's nothing to reference. `file_write_error` is the only error that feels like an actual failure — the system couldn't do what was asked, no workaround, check permissions.

---

## Comparable Systems

**`git cherry-pick` vs. `git rebase`:** Cherry-pick is surgical — apply exactly this one commit to the current branch. Rebase is broader — replay all commits from a base. The `repair-suppression-ref` / `rename-surface` distinction is the same: one is surgical and targeted, the other is a broader replay. The mental model "when to use cherry-pick vs. rebase" translates directly.

**`kubectl patch` vs. `kubectl apply`:** `kubectl patch` applies a targeted JSON patch to a specific Kubernetes resource field. `kubectl apply` re-declares the full desired state of a resource. Repair-suppression-ref is the `kubectl patch` of the l10n toolchain — you're patching one field, not re-declaring the whole config.

**`npm dedupe` vs. `npm install`:** `npm dedupe` is a repair tool that fixes a specific structural problem (duplicate packages) in an existing node_modules state. It doesn't rebuild from scratch — it makes a surgical change to an existing state. The conceptual framing is the same: a repair command knows the system is in a wrong state and makes the minimal change to fix it.

**Database `UPDATE WHERE` vs. schema migration:** A targeted SQL `UPDATE` changes specific rows. A migration script changes the schema broadly. Using `make rename-surface` for a stale reference repair is like running a full migration to fix a single row. `make repair-suppression-ref` is the targeted UPDATE.

---

## The TikTok Clip

The clip: a developer runs `make l10n-suppression-audit` and sees two red `✗ UNEVALUABLE` rows. She sees the "Closest match" suggestion on the first row and copies the repair command from the audit output. Pastes it. Terminal runs — three green checkmarks. Done. She copies the second repair command from the audit output. Pastes it. Three green checkmarks. She re-runs the audit: all green. She pushes. The clip cuts to the Tier 1 PR check: all green. The caption: "The audit tells you what's broken, the repair command fixes it, the CI confirms it worked. l10n toolchain as continuous diagnostic."

---

## New Aspects Discovered

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i — `repair_command` field in audit JSON output:** the pre-formed repair command string embedded in each unevaluable suppression entry in `make l10n-suppression-audit --output-format=json`; design of when the command can be pre-formed (single unambiguous closest match) vs. when it must be left blank (no match, decompose case, multiple equal-distance matches); interaction with the `--auto-lookup` future design option

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-ii — `--auto-lookup` flag: rename-log-driven automated surface resolution:** when SURFACE argument is omitted, the command looks up the stale surface in `surface-rename-log.json` and applies the repair automatically if a single unambiguous entry exists; design of the disambiguation case (multiple rename log entries for the same surface), the confidence threshold, and the user confirmation UX

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-iii — Multi-hop rename chain detection:** when the surface was renamed twice (A → B → C), the first repair attempt with SURFACE=B would succeed but leave the condition pointing at an intermediate surface that may also have been renamed; design of the chain-following logic in `--auto-lookup` mode; whether to warn when applying a non-terminal rename

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-iv — Batch repair rollback design:** when a batch repair script fails mid-run (successfully repaired 3 of 5, then file write error on the 4th), how rollback works; whether `--no-stage` mode makes partial-commit rollback easier; the case where a repaired condition immediately triggers mid-batch and an issue is created but the remaining repairs should still proceed

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-v — Repair command in IDE extension context:** if the l10n toolchain has a VSCode extension (a natural extension of the string-surface-map validation infrastructure), `repair-suppression-ref` should be invocable as a code action on the flagged `review_trigger.surface` field — "Apply suggested repair: notification.toast" as a right-click action on the stale string; design of the IDE extension integration for this specific command
