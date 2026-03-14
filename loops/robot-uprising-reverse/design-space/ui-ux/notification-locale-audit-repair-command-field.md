# `repair_command` Field in Audit JSON Output

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i — Pre-formed repair command string embedded in each unevaluable suppression entry in `make l10n-suppression-audit --output-format=json`; when command can be pre-formed vs. left blank (no match, decompose, multiple equal-distance matches)

**Parent:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a — `make repair-suppression-ref` CLI tool (established: full argument schema, JSON output format, CI non-interactive mode, exit code taxonomy, decompose case handling)

**The gap this closes:** In the parent's Journey 3 (Aarav, CI Automation Engineer), Aarav's batch repair pipeline has to independently look up `surface-rename-log.json` to find the replacement surface for each unevaluable condition. This is a three-step dance: (1) read audit output, (2) look up rename log, (3) call repair command. If the audit output itself contained the pre-formed repair command, step 2 disappears entirely and the script shrinks from 40 lines to 12. The question is: when CAN the audit produce a confident command, when SHOULD it leave the field blank, and what does the field contain when the answer is ambiguous?

---

## The Design Decision

The `repair_command` field is a string containing a ready-to-paste (or ready-to-exec) shell command that would fix the unevaluable suppression entry. It appears in the JSON output of `make l10n-suppression-audit --output-format=json`, nested inside each suppression object whose status is `"unevaluable"`.

### The Field in Context

```json
{
  "suppressions": [
    {
      "key": "shared.error.bufferFull.toast",
      "status": "unevaluable",
      "condition": {
        "type": "budget_below",
        "surface": "toast.legacy",
        "threshold": 15
      },
      "closest_matches": [
        { "name": "notification.toast", "edit_distance": 2 },
        { "name": "notification.toast.compact", "edit_distance": 8 }
      ],
      "rename_log_match": {
        "from": "toast.legacy",
        "to": "notification.toast",
        "date": "2025-11-18",
        "pr": "PR #412"
      },
      "repair_command": "make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast",
      "repair_confidence": "high",
      "repair_confidence_reason": "Rename log entry matches stale surface exactly"
    },
    {
      "key": "shared.label.configVersion",
      "status": "unevaluable",
      "condition": {
        "type": "budget_below",
        "surface": "modal.confirm",
        "threshold": 20
      },
      "closest_matches": [
        { "name": "modal.confirm.small", "edit_distance": 6 },
        { "name": "modal.confirm.large", "edit_distance": 6 }
      ],
      "rename_log_match": {
        "from": "modal.confirm",
        "to": null,
        "decomposed_into": ["modal.confirm.small", "modal.confirm.large"],
        "date": "2025-12-03",
        "pr": "PR #489"
      },
      "repair_command": null,
      "repair_confidence": "none",
      "repair_confidence_reason": "Surface decomposed into 2 sub-surfaces; human selection required"
    }
  ]
}
```

### The Three-Field Pattern

A single `repair_command` string is insufficient. The consuming script needs to know HOW confident the audit is in the suggestion. The design uses three fields:

| Field | Type | Purpose |
|-------|------|---------|
| `repair_command` | `string \| null` | The shell command to run, or null if not producible |
| `repair_confidence` | `"high" \| "medium" \| "low" \| "none"` | How confident the audit is in the suggestion |
| `repair_confidence_reason` | `string` | Human-readable explanation of the confidence level |

This mirrors the pattern in package managers (npm audit's `fix` field) and security scanners (Snyk's `remediation` object) — the tool suggests a fix, labels its confidence, and explains why.

---

## Confidence Classification: The Six Cases

### Case 1: Exact Rename Log Match — `high`

**Condition:** The stale surface appears exactly as a `from` entry in `surface-rename-log.json`, and the `to` entry is a single surface (not a decomposition) that exists in `budget.json`.

```json
{
  "repair_command": "make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast",
  "repair_confidence": "high",
  "repair_confidence_reason": "Rename log entry matches stale surface exactly (PR #412, 2025-11-18)"
}
```

**Why high:** The rename log is the authoritative record. An exact match means someone ran `make rename-surface` (or manually recorded the rename) and the suppression was missed. The repair is mechanical.

**Automation policy:** CI batch scripts SHOULD auto-apply high-confidence repairs without human review.

### Case 2: Close Fuzzy Match (edit distance ≤ 2), No Rename Log — `medium`

**Condition:** No rename log entry exists, but the closest match in `budget.json` has edit distance ≤ 2 AND it is the only match at that distance (no ties).

```json
{
  "repair_command": "make repair-suppression-ref KEY=shared.nav.tooltipDelay.label SURFACE=sidebar.panel",
  "repair_confidence": "medium",
  "repair_confidence_reason": "No rename log entry; closest match 'sidebar.panel' at edit distance 1 (case normalization); no competing matches"
}
```

**Why medium (not high):** Without the rename log, we're guessing. Edit distance 1 with no competitors is a strong guess, but it could be a coincidence — especially for short surface names where many surfaces are within edit distance 2 of each other.

**Automation policy:** CI batch scripts SHOULD present medium-confidence repairs for human review. The pre-formed command is there to reduce friction, not to bypass judgment.

### Case 3: Multiple Equally-Close Matches — `low`

**Condition:** Two or more surfaces in `budget.json` share the same minimum edit distance from the stale surface. Or: the rename log entry maps to a single surface but the edit distance between the `from` and the `to` exceeds 5 (suggesting the rename was substantial enough to warrant verification).

```json
{
  "repair_command": null,
  "repair_confidence": "low",
  "repair_confidence_reason": "Two equally-close matches: 'notification.toast' and 'notification.toast.compact' both at edit distance 2; human selection required",
  "repair_candidates": [
    {
      "surface": "notification.toast",
      "edit_distance": 2,
      "command": "make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast"
    },
    {
      "surface": "notification.toast.compact",
      "edit_distance": 2,
      "command": "make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast.compact"
    }
  ]
}
```

**The `repair_candidates` array:** When the audit cannot pick a single command, it provides all viable candidates as an array. Each candidate has its own pre-formed command. The consuming script can present these as options in a PR comment or Slack message.

**Why `repair_command` is null here:** The audit refuses to pick one. Picking the wrong surface silently would be worse than not picking at all — a wrong repair passes Tier 1 checks (the reference is now valid) but the condition monitors the wrong surface, which means the fork advisory fires at the wrong time or never fires at all.

**Automation policy:** CI SHOULD create a GitHub issue or PR comment with all candidates and wait for human selection.

### Case 4: Decompose — `none`

**Condition:** The rename log records a decomposition (1 → N surfaces).

```json
{
  "repair_command": null,
  "repair_confidence": "none",
  "repair_confidence_reason": "Surface decomposed into 2 sub-surfaces; human selection required",
  "repair_candidates": [
    {
      "surface": "modal.confirm.small",
      "edit_distance": 6,
      "budget": 80,
      "command": "make repair-suppression-ref KEY=shared.label.configVersion SURFACE=modal.confirm.small"
    },
    {
      "surface": "modal.confirm.large",
      "edit_distance": 6,
      "budget": 240,
      "command": "make repair-suppression-ref KEY=shared.label.configVersion SURFACE=modal.confirm.large"
    }
  ]
}
```

**Why none (not low):** Decomposition is categorically different from fuzzy matching. The audit KNOWS the surface was decomposed — it has the rename log entry. The human must decide which sub-surface this string actually renders on. This is a semantic decision, not a distance calculation.

**The `budget` field in candidates:** For decompose cases, the audit adds each candidate's current character budget. This helps the human decide: if the suppression condition is `budget_below(20)` and `modal.confirm.small` has budget 80 while `modal.confirm.large` has budget 240, neither is near the threshold — but the small surface is closer, which is more likely to trigger, which is more likely to be the one that matters.

**Automation policy:** CI MUST escalate to human. Exit code 3 from the repair command (if attempted) already enforces this.

### Case 5: No Matches At All — `none`

**Condition:** No rename log entry, and no surface in `budget.json` has edit distance ≤ 5 from the stale surface.

```json
{
  "repair_command": null,
  "repair_confidence": "none",
  "repair_confidence_reason": "No rename log entry and no budget.json surface within edit distance 5 of 'completely.deleted.surface'",
  "repair_candidates": []
}
```

**Why this happens:** The surface was deleted entirely without a rename, or the stale reference was a typo from the beginning. There IS no repair — the suppression condition needs to be rewritten from scratch.

**Automation policy:** CI creates a high-priority issue. This condition has been permanently unevaluable since the surface disappeared.

### Case 6: Rename Log Match But Target Deleted — `none`

**Condition:** The rename log maps `old → new`, but `new` no longer exists in `budget.json` either (a double-rename or deletion after rename).

```json
{
  "repair_command": null,
  "repair_confidence": "none",
  "repair_confidence_reason": "Rename log maps 'toast.legacy' → 'notification.toast', but 'notification.toast' no longer exists in budget.json; possible double-rename or deletion",
  "rename_log_chain": [
    { "from": "toast.legacy", "to": "notification.toast", "date": "2025-11-18" }
  ],
  "repair_candidates": []
}
```

**This is where `--auto-lookup` (aspect 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-ii) becomes relevant:** A multi-hop chain-following feature could resolve `toast.legacy → notification.toast → notification.v2.toast` by walking the rename log. But the audit itself only looks up ONE hop. The `rename_log_chain` field exposes what the audit found, letting scripts or humans trace the chain manually.

**Automation policy:** CI creates a high-priority issue with the partial chain attached.

---

## The Confidence Threshold: Which Cases Are Auto-Applicable?

The critical design decision: should ANY confidence level be auto-applied by CI without human review?

### Option A: Only `high` Is Auto-Applicable ("Conservative")

Only exact rename-log matches get auto-applied. Everything else requires a human.

**Strengths:**
- Zero risk of wrong surface assignment
- Rename log is the canonical record; trusting it absolutely is justified
- Batch scripts are simple: `if confidence == "high": exec(repair_command)`

**Weaknesses:**
- Most unevaluable conditions in practice arise when someone forgot to use `make rename-surface` — meaning there IS no rename log entry. Only `medium`/`low` confidence is available.
- The audit adds a pre-formed command that nobody ever auto-applies, defeating the purpose.

### Option B: `high` and `medium` Are Auto-Applicable ("Moderate")

Exact rename-log matches AND close fuzzy matches (edit distance ≤ 2, no ties) get auto-applied.

**Strengths:**
- Covers the common case: case normalization, typo correction, small renames
- Still conservative: edit distance ≤ 2 with no ties is very unlikely to be wrong
- Makes the `repair_command` field genuinely useful for automation

**Weaknesses:**
- Surface names are often structurally similar (`sidebar.panel`, `sidebar.settings`, `sidebar.history`) — edit distance 2 could match the wrong sibling
- A wrong auto-repair silently passes Tier 1 and only manifests when the fork advisory fires at the wrong time (months later)

### Option C: Nothing Is Auto-Applicable ("Strict Human Gate")

The `repair_command` field is a convenience for copy-paste, never for `eval`. All confidence levels require human review.

**Strengths:**
- Maximum safety
- The field is still useful: it saves the human from typing the command
- CI scripts use the field to populate PR comments with ready-to-click suggestions

**Weaknesses:**
- In a project with 40+ suppressions, quarterly audits could surface 5-8 unevaluable conditions. Making a human review each one is 20 minutes of work that could be 0 seconds.

### Recommendation: Option A as Default, Option B as Opt-In

The audit output includes a top-level `auto_repair_policy` field that the consuming script reads:

```json
{
  "auto_repair_policy": "high_only",
  "suppressions": [...]
}
```

The policy is set in `l10n/config.json`:

```json
{
  "auto_repair_confidence_threshold": "high"
}
```

Teams that want more aggressive automation set `"medium"`. Teams that want no automation set `"none"` (equivalent to Option C). The default is `"high"` — conservative, safe, but still useful.

**Why this is the right default:** The first time a wrong auto-repair silently corrupts a suppression condition, the team loses trust in the entire toolchain. Starting conservative and letting teams opt into more automation is the standard escalation path (see: Dependabot auto-merge, which defaults to disabled).

---

## The `repair_command` String Format

### Shell-Safe Quoting

The command string must be safe to pass to `eval` or `sh -c`. This means keys and surfaces with special characters must be properly quoted:

```json
{
  "repair_command": "make repair-suppression-ref KEY='shared.error.buffer Full.toast' SURFACE='notification.toast (v2)'"
}
```

Quoting rules:
- If KEY or SURFACE contain only `[a-zA-Z0-9._-]`, no quoting needed
- If either contains spaces, parentheses, or shell metacharacters, single-quote the value
- If either contains single quotes, use `$'...'` ANSI-C quoting

### Flag Inclusion Policy

The `repair_command` never includes optional flags like `--dry-run`, `--no-stage`, or `--output-format`. It is the minimal command needed to apply the fix. The consuming script adds its own flags:

```bash
# CI script adds its own flags
REPAIR_CMD=$(echo $ENTRY | jq -r '.repair_command')
eval "$REPAIR_CMD --output-format=json --non-interactive"
```

**Exception:** If the audit detects that the stale surface still exists in `budget.json` (Case 3 variant where the surface is valid but a different one is intended), the command includes `--confirm-surface=<current>`:

```json
{
  "repair_command": "make repair-suppression-ref KEY=shared.label.configVersion SURFACE=tooltip.workbench --confirm-surface=tooltip.workbench-header"
}
```

This ensures that eval-ing the command doesn't hit the "surface not stale" guard and fail.

### No `--non-interactive` in the Command

The `repair_command` is meant for both human copy-paste and CI eval. Including `--non-interactive` would confuse a human who copies it into their terminal (they'd get JSON output instead of colored text). The CI script adds the flag itself.

---

## Interaction with Other Audit JSON Fields

### `closest_matches` vs. `repair_candidates`

These are different arrays with different purposes:

| Field | Present when | Contents | Purpose |
|-------|-------------|----------|---------|
| `closest_matches` | Always, for unevaluable entries | All budget.json surfaces sorted by edit distance (top 5) | Informational — what's NEAR the stale name in edit-distance space |
| `repair_candidates` | Only when `repair_command` is null and `repair_confidence` is `"low"` or `"none"` | Only surfaces that are viable repair targets, each with its own pre-formed command | Actionable — which surfaces COULD be the right fix |

A surface can appear in `closest_matches` but NOT in `repair_candidates` if it's close in edit distance but implausible as a fix (e.g., a surface in a completely different UI domain).

### `rename_log_match` as Primary Evidence

When a rename log entry exists, it takes precedence over fuzzy matching for confidence classification. A rename log match at edit distance 15 is `high` confidence. A fuzzy match at edit distance 1 without a rename log is only `medium`.

The `rename_log_match` field is present when relevant:

```json
{
  "rename_log_match": {
    "from": "toast.legacy",
    "to": "notification.toast",
    "date": "2025-11-18",
    "pr": "PR #412"
  }
}
```

Or null when no rename log entry exists. The consuming script can use the `pr` field to link back to the PR that created the stale reference — useful for GitHub issue context.

---

## The Blank Command Problem

The field is null in Cases 3-6. But "null" is a weak signal — it doesn't tell the consumer WHY the command is missing. The `repair_confidence_reason` field carries this, but for machine consumption, a structured `repair_blocked_reason` enum is cleaner:

```json
{
  "repair_command": null,
  "repair_blocked_reason": "decomposed",
  "repair_confidence": "none"
}
```

Enum values:

| Value | Meaning | Expected resolution |
|-------|---------|---------------------|
| `"tied_matches"` | Multiple equally-close surfaces | Human picks from `repair_candidates` |
| `"decomposed"` | Surface decomposed into N sub-surfaces | Human picks sub-surface from `repair_candidates` |
| `"no_match"` | No surface within edit distance 5 | Human rewrites the condition manually |
| `"target_deleted"` | Rename log target no longer exists | Human traces the chain or rewrites |
| `"multi_hop"` | Rename log exists but requires chain-following (future `--auto-lookup`) | Human or `--auto-lookup` resolves |

This enum becomes the branching point in CI scripts:

```bash
case $(echo $ENTRY | jq -r '.repair_blocked_reason') in
  "tied_matches")   create_review_issue_with_candidates "$ENTRY" ;;
  "decomposed")     create_decompose_issue "$ENTRY" ;;
  "no_match")       create_high_priority_issue "$ENTRY" ;;
  "target_deleted") create_chain_trace_issue "$ENTRY" ;;
  *)                echo "Unexpected blocked reason" ;;
esac
```

---

## Comparable Systems

### npm audit fix --dry-run

npm's `audit` command outputs vulnerability information, and `audit fix --dry-run` shows what changes would be applied. The key parallel: npm doesn't provide a pre-formed `npm install <package>@<version>` command in its JSON output — it provides the vulnerability data and expects the consumer to derive the fix. This is the Option C approach (human gate).

**What Robot Uprising learns:** npm's lack of a pre-formed command creates friction for automation tools like Renovate and Dependabot, which must independently derive the fix. The `repair_command` field avoids this — the audit IS the oracle.

### Snyk's `remediation` Object

Snyk's JSON output includes a `remediation` object with `upgrade` and `patch` paths:

```json
{
  "remediation": {
    "upgrade": { "lodash@4.17.20": { "upgradeTo": "lodash@4.17.21" } },
    "pin": {},
    "patch": {}
  }
}
```

**What Robot Uprising learns:** Snyk separates the "what to do" (`upgrade`) from the "how to do it" (the `snyk wizard` command). The `repair_command` field collapses this — it IS the how. This is more convenient but also more opinionated: it assumes the repair command's argument schema is stable.

### ESLint's `fix` Object

ESLint's `--format=json` output includes a `fix` object per fixable violation:

```json
{
  "fix": {
    "range": [10, 15],
    "text": "const "
  }
}
```

**What Robot Uprising learns:** ESLint provides the raw edit (byte range + replacement text), not a command. This is lower-level — the consumer applies the edit directly. The `repair_command` approach is higher-level (a shell command), which is appropriate because the repair involves validation, staging, and condition evaluation beyond a simple text replacement.

### GitHub Dependabot Security Alerts

Dependabot alert JSON includes `security_advisory.vulnerabilities[].first_patched_version.identifier` — a version string the consumer can use to construct an upgrade command. But the alert doesn't include the command itself.

**What Robot Uprising learns:** Even sophisticated systems often stop short of pre-forming the command. The `repair_command` field is more developer-friendly than the industry norm.

---

## Player Journeys

### Journey: Priya, 38, L10n Maintainer — The Quarterly Batch Repair With Pre-Formed Commands

**Context:** Same mission 7 team from the parent analysis. But now the audit output includes `repair_command`. Priya's workflow is fundamentally different from the parent journey.

**Minute 0:00 — Audit Reveals Three Problems, Each With a Suggested Fix**

Priya runs `make l10n-suppression-audit --output-format=json | jq '.suppressions[] | select(.status == "unevaluable")'`:

```json
[
  {
    "key": "shared.error.bufferFull.toast",
    "status": "unevaluable",
    "repair_command": "make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast",
    "repair_confidence": "high",
    "repair_confidence_reason": "Rename log entry matches stale surface exactly (PR #412, 2025-11-18)"
  },
  {
    "key": "shared.nav.tooltipDelay.label",
    "status": "unevaluable",
    "repair_command": "make repair-suppression-ref KEY=shared.nav.tooltipDelay.label SURFACE=sidebar.panel",
    "repair_confidence": "medium",
    "repair_confidence_reason": "No rename log entry; closest match 'sidebar.panel' at edit distance 1 (case normalization); no competing matches"
  },
  {
    "key": "shared.ui.missionAbort.confirm",
    "status": "unevaluable",
    "repair_command": null,
    "repair_confidence": "none",
    "repair_blocked_reason": "decomposed",
    "repair_confidence_reason": "Surface decomposed into 2 sub-surfaces; human selection required",
    "repair_candidates": [
      { "surface": "modal.abort.small", "budget": 60, "command": "make repair-suppression-ref KEY=shared.ui.missionAbort.confirm SURFACE=modal.abort.small" },
      { "surface": "modal.abort.large", "budget": 180, "command": "make repair-suppression-ref KEY=shared.ui.missionAbort.confirm SURFACE=modal.abort.large" }
    ]
  }
]
```

Priya scans the three entries. The first has a green signal (`"high"`). The second is amber (`"medium"`). The third is red (`"none"` — decompose).

**Minute 0:15 — First Repair: Zero-Thought Copy-Paste**

She copies the first `repair_command` directly from the JSON output, pastes it:

```bash
make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast
```

Done in 5 seconds. She didn't need to look up the rename log, didn't need to check the surface name, didn't need to run `--validate-only`. The audit already did the work.

**Minute 0:30 — Second Repair: Quick Verification of Medium Confidence**

The medium-confidence command is a case normalization (`sidebar.Panel` → `sidebar.panel`). Priya reads the `repair_confidence_reason`: "edit distance 1 (case normalization)." She glances at the terminal and thinks: "case normalization is obviously correct." She copies the command and runs it.

If the confidence reason had said something like "edit distance 2; possible sibling match: sidebar.settings also at distance 2" she would have paused. But "case normalization, no competing matches" is enough to trust.

**Minute 1:00 — Third Repair: Decompose Requires Judgment**

The third entry has `repair_command: null`. She reads `repair_candidates`. The string is `shared.ui.missionAbort.confirm` — a confirmation message in the mission abort dialog. She knows the abort dialog was split into small (mobile) and large (desktop) variants. The confirmation message appears in both, but the budget constraint matters more for the small variant (60 chars vs 180 chars). She runs:

```bash
make repair-suppression-ref KEY=shared.ui.missionAbort.confirm SURFACE=modal.abort.small
```

Post-repair check: condition is `budget_below(20)`, current budget is 60. Not triggered. Good.

**Minute 1:30 — Clean Audit, Commit**

Re-run audit: zero unevaluable. Total time: 90 seconds for three repairs. The parent journey took 4 minutes. The `repair_command` field eliminated the rename-log lookup step and the `--dry-run` verification step for the confident matches.

**UI Annotations:**
- `repair_confidence: "high"`: in human-mode audit output, the suggested command is printed in bright green with a `✓ Auto-repairable` badge
- `repair_confidence: "medium"`: the command is printed in amber with a `⚠ Review suggested` badge
- `repair_confidence: "none"`: no command printed; instead, candidates are listed with `? Select one:` prompt
- The confidence reason is printed as a dim sub-line below the command, never requiring the developer to check the JSON structure

---

### Journey: Aarav, 28, CI Automation Engineer — The Batch Script, Simplified

**Context:** Same Wave 5 project as the parent analysis. But now the audit provides `repair_command`, and Aarav's script is dramatically simpler.

**Minute 0:00 — The New Script**

Aarav rewrites his batch repair pipeline. The old version was 40 lines with rename-log lookup, fuzzy-match verification, and surface existence checks. The new version:

```bash
#!/bin/bash
# batch-repair-stale-refs.sh (v2 — using repair_command field)

AUDIT_JSON=$(make l10n-suppression-audit --output-format=json)

echo "$AUDIT_JSON" | jq -c '.suppressions[] | select(.status == "unevaluable")' | while read ENTRY; do
  KEY=$(echo "$ENTRY" | jq -r '.key')
  CONFIDENCE=$(echo "$ENTRY" | jq -r '.repair_confidence')
  COMMAND=$(echo "$ENTRY" | jq -r '.repair_command // empty')

  if [ "$CONFIDENCE" = "high" ] && [ -n "$COMMAND" ]; then
    echo "AUTO-REPAIRING: $KEY (confidence: high)"
    eval "$COMMAND --output-format=json --non-interactive" > "/tmp/repair-$KEY.json"
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 2 ]; then
      echo "  ⚠ Immediate trigger — creating follow-up issue"
      # ... create issue from /tmp/repair-$KEY.json
    fi
  else
    echo "SKIP: $KEY (confidence: $CONFIDENCE) — requires human review"
    BLOCKED_REASON=$(echo "$ENTRY" | jq -r '.repair_blocked_reason // "unknown"')
    # ... create PR comment with candidates if available
  fi
done
```

15 lines of core logic. No rename-log lookup. No fuzzy matching. No surface existence validation. The audit did all of that.

**Minute 1:00 — Testing the Script**

Aarav runs the script against a test repo with 5 unevaluable conditions: 3 high-confidence, 1 medium, 1 decompose.

```
AUTO-REPAIRING: shared.error.bufferFull.toast (confidence: high)
AUTO-REPAIRING: shared.nav.tooltipDelay.label (confidence: high)
AUTO-REPAIRING: shared.label.configVersion (confidence: high)
SKIP: shared.ui.missionAbort.confirm (confidence: none) — requires human review
SKIP: shared.stat.matchDuration.label (confidence: medium) — requires human review
```

Three repaired automatically, two escalated. He checks the repair JSON outputs — all exit code 0, no immediate triggers. Clean.

**Minute 2:00 — Adding the Policy Check**

Aarav realizes his script hardcodes `"high"` as the auto-apply threshold. He reads the audit's `auto_repair_policy` field:

```bash
POLICY=$(echo "$AUDIT_JSON" | jq -r '.auto_repair_policy')
# "high_only" → only auto-apply "high"
# "high_and_medium" → also auto-apply "medium"
# "none" → never auto-apply, always escalate
```

He replaces the hardcoded check:

```bash
case "$POLICY" in
  "high_only")        AUTO_THRESHOLD="high" ;;
  "high_and_medium")  AUTO_THRESHOLD="high|medium" ;;
  "none")             AUTO_THRESHOLD="^$" ;; # match nothing
esac

if echo "$CONFIDENCE" | grep -qE "$AUTO_THRESHOLD" && [ -n "$COMMAND" ]; then
  # auto-apply
fi
```

Now the script respects the team's configured policy. Priya (the l10n maintainer) controls the threshold in `l10n/config.json`, and Aarav's CI script follows it.

**Minute 3:00 — Running in Production CI**

The script runs as a nightly job. First night: 2 high-confidence repairs auto-applied, 1 medium escalated as a PR comment with the pre-formed command ready to approve. The PR comment reads:

> **L10n Audit: 1 suppression repair requires review**
>
> `shared.stat.matchDuration.label` — confidence: medium
> Reason: No rename log entry; closest match 'stats.match.duration' at edit distance 2; no competing matches
>
> Suggested fix:
> ```
> make repair-suppression-ref KEY=shared.stat.matchDuration.label SURFACE=stats.match.duration
> ```
> React with 👍 to auto-apply, or run the command manually.

**UI Annotations:**
- The PR comment's code block is copy-pasteable — the command is the exact `repair_command` from the audit JSON, unchanged
- The 👍 reaction trigger is a GitHub Actions workflow that reads the PR comment, extracts the command from the code block, and runs it — the `repair_command` field enables this because the command is always syntactically complete
- Nightly batch results are posted as a single Slack summary: "3 suppressions repaired (2 auto, 1 reviewed). 0 unevaluable remaining."

---

### Journey: Margot, 34, New L10n Contributor — Reading the Audit for the First Time

**Context:** Mission 3 equivalent — Margot joined the team two weeks ago. She runs the suppression audit for the first time as part of onboarding. She sees the `repair_command` field and needs to understand what it means before trusting it.

**Minute 0:00 — First Audit Run (Human Mode)**

Margot runs `make l10n-suppression-audit` (human mode, not JSON). The terminal shows a table:

```
SUPPRESSION AUDIT — 2026-03-14
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

12 active suppressions | 1 triggered | 2 unevaluable | 0 expiring within 30 days

UNEVALUABLE (2):
──────────────────────────────────────────────────────────────────

  shared.error.bufferFull.toast
  Condition: budget_below("toast.legacy", 15)
  Problem:   "toast.legacy" not found in budget.json

  ✓ Auto-repairable (high confidence)
    Rename log: toast.legacy → notification.toast (PR #412, 2025-11-18)
    Run: make repair-suppression-ref KEY=shared.error.bufferFull.toast SURFACE=notification.toast

──────────────────────────────────────────────────────────────────

  shared.ui.missionAbort.confirm
  Condition: budget_below("modal.confirm", 20)
  Problem:   "modal.confirm" decomposed into modal.confirm.small + modal.confirm.large

  ✗ Human selection required
    Candidates:
      (1) modal.confirm.small  [budget: 60 chars]
          make repair-suppression-ref KEY=shared.ui.missionAbort.confirm SURFACE=modal.confirm.small
      (2) modal.confirm.large  [budget: 180 chars]
          make repair-suppression-ref KEY=shared.ui.missionAbort.confirm SURFACE=modal.confirm.large

──────────────────────────────────────────────────────────────────
```

Margot reads this. The `✓ Auto-repairable` badge on the first entry tells her: this is safe. The `✗ Human selection required` on the second tells her: this needs thought. The repair commands are right there — she doesn't need to construct them from parts.

**Minute 0:30 — Understanding the Confidence System**

Margot asks Priya: "What does 'high confidence' actually mean?" Priya explains: "It means the rename log has an exact entry. Someone did the rename properly but missed updating this one suppression condition. The command is definitely correct."

Margot asks: "So I can just run it?" Priya: "Yes. The high-confidence ones, always. The medium ones, glance at the reason first. The no-confidence ones, you need to understand what happened."

**Minute 1:00 — Running the High-Confidence Repair**

Margot copies the command from the terminal, pastes, runs. Output scrolls: stale surface, new surface, checkmarks, condition check. She reads the output carefully (first time) and understands: the command changed one field in one file, and the suppression condition now references a valid surface.

**Minute 1:30 — Investigating the Decompose Case**

For the second entry, she looks at the two candidates. She doesn't know whether `modal.confirm.small` or `modal.confirm.large` is correct. She asks Priya: "This string is the mission abort confirmation. Which modal does it appear in?"

Priya: "Both, but the budget constraint only matters for the small one. Pick `modal.confirm.small`."

Margot runs the command for candidate (1). Clean.

**Minute 2:00 — Mental Model Formed**

Margot now understands:
1. The audit tells you what's broken
2. For most broken things, it also tells you how to fix them
3. For some broken things, it can't decide — you have to pick
4. The commands in the audit output are ready to run, not pseudocode

She bookmarks the audit command in her shell history.

**UI Annotations:**
- Human-mode `✓ Auto-repairable` badge: bright green text, bold, left-aligned with the key name. Immediately scannable in a long audit table — your eye finds the green checks first, then reads only the entries that lack them.
- Human-mode candidate list with numbered `(1)` `(2)`: the numbers are decorative (you still copy-paste the full command), but they provide a verbal shorthand for team discussions: "pick candidate 2" in Slack.
- Human-mode `Run:` prefix before each command: sets the command apart from the diagnostic text. The colon signals "this is actionable, not informational."
- The `[budget: 60 chars]` annotation on decompose candidates: dim grey, parenthetical, but present. It's the only clue that helps a newcomer make the selection without asking someone else.

---

## Sensory Description

### The `repair_command` in Human Mode Output

The command appears in the audit table as a distinct visual element: a monospace line, indented two spaces deeper than the diagnostic text above it, prefixed by `Run:` in the same green (high) or amber (medium) color as the confidence badge. The command itself is rendered in the terminal's default foreground — white on dark terminals, black on light — making it visually "pop" against the colored context above it.

When the confidence is `"none"`, the `Run:` prefix is replaced by `Candidates:`, and each candidate command is printed on its own indented line with a numbered prefix. The number is in dim grey. The command is in default foreground. The budget annotation is in dim grey parentheses to the right, separated by two spaces.

The overall rhythm of the audit table is: colored header → diagnostic prose → actionable command → separator line. This rhythm repeats for each entry. A developer scanning the table can ignore the prose and just read the commands if they're in a hurry.

### The `repair_command` in JSON Mode

In JSON mode, the `repair_command` is just a string. But its presence or absence creates a binary signal in the consuming script: `if command != null: simple path; else: complex path`. This binary is the most important property of the field — it turns a five-way decision tree (check confidence, check blocked reason, check candidates, decide action, construct command) into a two-way branch.

The JSON output, when pretty-printed, shows the `repair_command` field right after `repair_confidence`. The visual flow is: confidence → command → reason. A human reading the JSON sees the decision before the evidence, which matches how they process it: "Can I fix this? Yes/no. How? This command. Why? This reason."

### The TikTok Clip

A CI bot comment on a PR, two lines:

> **L10n Bot:** 3 stale references auto-repaired in 0.4s.
> 1 remaining requires your input — [see candidates →]

The linked "candidates" view shows two pre-formed commands with a single "approve" button next to each. The developer clicks one button. Done.

The clip: "The CI bot already knows how to fix it. It just needs you to pick which one."

---

## Strengths

1. **Eliminates the lookup step.** The single biggest friction point in the parent's batch repair workflow was looking up the correct surface. The `repair_command` field makes the audit self-contained — it knows the problem AND the fix.

2. **Enables copy-paste culture.** Developers don't need to understand the repair command's argument schema. They copy from the audit, paste into terminal, done. The command is syntax-correct by construction.

3. **Creates a machine-consumable fix protocol.** CI scripts can branch on `repair_command != null` instead of reimplementing the audit's logic. This is the same pattern as LSP code actions: the diagnostic INCLUDES the fix.

4. **Confidence levels create a trust gradient.** Not all fixes are equal. The confidence system lets both humans and machines calibrate their trust — auto-apply the confident ones, review the uncertain ones, escalate the impossible ones.

5. **The `repair_candidates` array handles ambiguity gracefully.** Instead of refusing to help when the answer is uncertain, the audit provides all viable options with commands. The human selects; the machine doesn't have to guess.

## Weaknesses

1. **Schema coupling.** The `repair_command` string encodes the repair command's argument schema. If `make repair-suppression-ref` changes its argument format, all cached audit outputs contain invalid commands. Mitigation: include a `repair_command_version` field to detect stale outputs.

2. **False confidence.** A `"high"` confidence rating doesn't mean the repair is semantically correct — it means the rename log says it's correct. If the rename log itself has an error (someone recorded the wrong mapping), the `repair_command` propagates the error with high confidence. Mitigation: the post-repair condition check catches some of these (immediate trigger = something might be wrong).

3. **Eval injection surface.** If `repair_command` is passed to `eval` in a script, and a malicious surface name in `budget.json` contains shell metacharacters, the eval could execute arbitrary commands. Mitigation: the shell-safe quoting rules above, plus a recommendation to use `sh -c "$COMMAND"` rather than `eval` for sandboxing.

4. **Cognitive load for new developers.** A new developer seeing `repair_command: null` with `repair_candidates: [...]` has to understand why the audit couldn't pick one. The `repair_confidence_reason` field helps, but the overall JSON structure (command vs. candidates vs. blocked reason vs. confidence) is complex for a first encounter.

## Interaction Effects

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-ii (`--auto-lookup`):** When `--auto-lookup` is implemented, the audit could resolve multi-hop chains and produce `repair_command` for Case 6 (target deleted) entries. The confidence would be `"medium"` (chain-following adds uncertainty). The `repair_confidence_reason` would include the chain: "Resolved via rename chain: A → B → C."

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-iii (Multi-hop rename chain):** Chain-following directly extends the confidence classification. A chain of length 1 (direct rename log) = `"high"`. A chain of length 2 = `"medium"`. A chain of length 3+ = `"low"`. This reflects the increasing probability of error with each hop.

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-iv (Batch repair rollback):** The `repair_command` field simplifies rollback design — the audit output becomes the manifest of what was applied, and each command can be inverted (write the old value back) using the same JSON structure.

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-v (IDE extension):** The `repair_command` field can be surfaced as a VSCode code action: "Apply suggested repair: notification.toast" → runs the command. The confidence level maps to code action kind: `"high"` → `quickfix.preferred`, `"medium"` → `quickfix`, `"low"/"none"` → not offered as code action.

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-b (Closest-match algorithm):** The fuzzy-match algorithm used for `closest_matches` directly determines the `repair_confidence` for cases without a rename log. If the algorithm changes (e.g., switching from Levenshtein to Jaro-Winkler), the confidence boundaries change too.

---

## New Aspects Discovered

1. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A — `repair_command_version` field for schema compatibility:** versioning the repair command format so cached audit outputs can be detected as stale after a `repair-suppression-ref` argument schema change; semantic versioning of CLI argument schemas as a general pattern

2. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-B — Eval injection hardening for `repair_command`:** security model for the `repair_command` string; shell-safe quoting validation; whether the field should be a structured object (key + surface + flags array) instead of a string to avoid eval entirely; JSON-as-command-template vs. string-as-command debate

3. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-C — PR comment rendering of `repair_candidates`:** GitHub Actions workflow design for posting audit results as formatted PR comments with approve-by-reaction; markdown rendering of candidate commands with inline approve buttons; the 👍-to-approve UX pattern

4. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-D — Confidence calibration from historical accuracy:** tracking how often each confidence level's suggested command was actually applied (vs. overridden by human); recalibrating confidence thresholds based on historical hit rate; "the audit suggested notification.toast 12 times with high confidence, and all 12 were correct" as trust-building data

5. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-E — `auto_repair_policy` governance and team override model:** who can change the auto-repair confidence threshold; should it require team approval (analogous to branch protection rules); escalation path when a wrong auto-repair is discovered; the "revoke auto-repair" incident response procedure
