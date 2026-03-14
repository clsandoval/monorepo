# Allowlist Hygiene and Expiry

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i — When should allowlist entries be removed; stale allowlist entries suppressing future genuine phantoms; periodic audit of allowlist against current source; automated staleness detection

**Parent:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a — Phantom flag detection as bidirectional completeness check (established: Phase 1 grep + allowlist → Phase 2 declared template manifest; allowlist file `l10n/tier1.5-phantom-allowlist.json`; total enumeration with `internal: true` markers; three suppression strategies)

**The gap this closes:** The parent establishes the allowlist (`tier1.5-phantom-allowlist.json`) as Phase 1's false-positive suppression mechanism — a JSON file mapping flag names to reasons they appear in audit tool source but are not part of the command template. The parent's Dev journey (line 466) notes: "the allowlist is growing. Three entries for a 6-week-old check. At this rate, a year from now the allowlist will have 15 entries and nobody will remember which ones are still relevant." But the parent doesn't specify: when does an allowlist entry STOP being relevant? What if someone removes the docstring that referenced `--enumerate-args` but nobody removes the allowlist entry? Now the allowlist suppresses a flag that no longer appears in source at all — a harmless ghost — but worse, what if a NEW code path starts genuinely using `--enumerate-args` in the template? The stale allowlist entry would suppress a real phantom flag. The allowlist that was meant to reduce false positives now produces false negatives. This aspect is the full design of allowlist hygiene: staleness detection, expiry mechanisms, periodic audit, and the lifecycle of an allowlist entry from creation to retirement.

---

## The Stale Allowlist Problem

A **stale allowlist entry** is an entry in `tier1.5-phantom-allowlist.json` whose justification no longer holds — the source code it was suppressing has changed or been removed, but the allowlist entry persists.

### How Stale Entries Arise

There are exactly five scenarios:

**Scenario 1: Source removal.** Aarav added `--enumerate-args` to the allowlist because his docstring mentioned it. A month later, Margot refactors the docstring, removing the example that contained `--enumerate-args`. The allowlist entry remains — there's nothing in the refactor that reminds Margot to check the allowlist. The entry is now a benign ghost: it suppresses a flag that wouldn't trigger the check anyway (because grep no longer finds it in source). Harmless today, dangerous tomorrow.

**Scenario 2: Source moved.** The audit tool is refactored from a single file to a package. The docstring with `--verbose` in help text moves from `generate-audit.py` to `generate-audit/help.py`. The grep check may or may not still find it depending on the grep's target path. If the grep target is updated to include the new file structure, the allowlist entry is still valid. If the grep target is NOT updated, the flag silently disappears from grep results, the allowlist entry becomes stale, AND a real reference to `--verbose` is no longer being checked at all.

**Scenario 3: Reason change.** The allowlist says `"--verbose": "Referenced in help text string"`. A developer later adds `--verbose` to the actual command template (they want verbose output for debugging complex repairs). The allowlist entry now suppresses a REAL template flag — the allowlist's reason is wrong but its key matches, so the reverse check skips `--verbose`. This is the dangerous case: a stale entry actively hiding a real phantom (or in this case, hiding a legitimate template flag from the check — benign now, but creates false confidence in the check's completeness).

**Scenario 4: Phase 2 migration residue.** The team migrates to the declared template manifest (Option 3 from parent). The `flags_excluded` field in `--enumerate-template-flags` now formally handles the flags that the allowlist was suppressing. But nobody deletes the allowlist file. The Tier 1.5 script is updated to use the manifest, but still reads the allowlist "just in case." Two suppression lists, neither authoritative, drifting apart.

**Scenario 5: Accumulation creep.** Over 18 months, 14 different developers each add one entry to the allowlist. None are individually stale, but the aggregate set is never reviewed holistically. Some entries are functionally equivalent (`"--verbose": "in help text"` and `"--verbose": "in debug note"` — but duplicate keys can't exist, so the second developer silently overwrites the first reason). The allowlist becomes a historical document rather than an active suppression tool. When someone needs to add entry #15, they don't read the existing 14 — they just add theirs. The allowlist is maintained by accretion, never by curation.

### The Asymmetry of Harm

Stale allowlist entries are **asymmetrically dangerous**:

- **Benign stale entry (Scenarios 1, 2):** The flag no longer appears in source, so the allowlist entry never fires. Zero runtime impact. But it adds cognitive overhead ("why is this here?") and creates false confidence ("the allowlist is comprehensive").
- **Dangerous stale entry (Scenario 3):** The flag now appears in source for a DIFFERENT reason than the allowlist states. The allowlist suppresses a check that should now pass (or fail). Active harm.
- **Structural stale entry (Scenario 4):** The entire allowlist is superseded by a better mechanism. Its continued existence creates confusion about which mechanism is authoritative.

The asymmetry means **most stale entries are harmless** — which is exactly why they accumulate. Nobody has an incentive to clean up benign entries because they cause no visible problems. The dangerous entry that eventually slips through is invisible precisely because the benign entries trained the team to ignore the allowlist.

---

## Five Design Options for Allowlist Hygiene

### Option 1: Manual Periodic Review ("The Calendar Reminder")

A recurring task (monthly, quarterly) for the l10n maintainer to review every allowlist entry:

1. For each entry, grep the current audit source for the flag
2. If the flag no longer appears: remove the entry
3. If the flag still appears: verify the reason is still accurate
4. If the reason has changed: update the reason or escalate

**Implementation:**

```markdown
## Quarterly Allowlist Audit Checklist (Q2 2026)

- [ ] Open `l10n/tier1.5-phantom-allowlist.json`
- [ ] For each entry:
  - [ ] `grep -r "{flag}" scripts/generate-audit*` — still present?
  - [ ] If yes: does the stated reason match the actual usage?
  - [ ] If no: remove the entry
- [ ] Commit changes with message "chore(l10n): quarterly allowlist hygiene"
- [ ] Update audit log with findings
```

**Strengths:**
- Zero tooling investment. A checklist and a calendar event.
- Human judgment catches Scenario 3 (reason change) which automated tools struggle with.
- The quarterly review is an opportunity to assess whether the Phase 2 migration trigger has been hit.

**Weaknesses:**
- **Relies on human discipline.** The review happens when someone remembers. After three clean quarters with no findings, the review gets skipped. Then it gets de-prioritized. Then it's forgotten.
- **No PR-time feedback.** A developer adding an allowlist entry gets no signal about whether existing entries are stale. The staleness discovery happens weeks later, disconnected from the change that created it.
- **Doesn't scale.** Reviewing 5 entries is a 5-minute task. Reviewing 20 entries across a refactored multi-file audit tool is a 30-minute task that requires deep context.

**When to use:** As the minimum viable hygiene mechanism for teams with <5 allowlist entries. Should be replaced by automated detection before the allowlist reaches 10 entries.

### Option 2: CI Staleness Check ("The Automated Grep-Back")

A CI step that runs alongside the phantom flag check, verifying that each allowlist entry still corresponds to a grep match in the audit source:

```bash
#!/bin/bash
# tier1.5-allowlist-hygiene.sh
# Runs as part of Tier 1.5 CI on every PR

ALLOWLIST="l10n/tier1.5-phantom-allowlist.json"
AUDIT_SRC="scripts/generate-audit.py"
STALE_ENTRIES=()

for flag in $(jq -r '.allowed_non_template_flags | keys[]' "$ALLOWLIST"); do
  if ! grep -q -- "$flag" "$AUDIT_SRC"; then
    STALE_ENTRIES+=("$flag")
  fi
done

if [ ${#STALE_ENTRIES[@]} -gt 0 ]; then
  echo "⚠️ STALE ALLOWLIST ENTRIES DETECTED"
  echo "The following flags are in the allowlist but no longer appear in $AUDIT_SRC:"
  for flag in "${STALE_ENTRIES[@]}"; do
    REASON=$(jq -r ".allowed_non_template_flags[\"$flag\"]" "$ALLOWLIST")
    echo "  $flag — was: \"$REASON\""
  done
  echo ""
  echo "Remove stale entries from $ALLOWLIST or update their reasons."
  exit 1
fi

echo "✅ All allowlist entries still correspond to source references."
```

**Strengths:**
- **Catches Scenario 1 (source removal) automatically.** Every PR that touches the audit source triggers the check. If the source change removes a flag reference, the staleness check immediately flags the orphaned allowlist entry.
- **PR-time feedback.** The developer who removes the flag reference sees the staleness error in the same CI run. The fix is obvious: remove the allowlist entry. The cognitive load is minimal because the context is fresh.
- **No calendar dependency.** Runs on every relevant PR. No human must remember to schedule a review.
- **Cheap.** The script is 15 lines of bash. Runs in <1 second on any audit tool source file.

**Weaknesses:**
- **Doesn't catch Scenario 3 (reason change).** If `--verbose` still appears in source but the reason changed from "in help text" to "in actual template," the grep-back still finds the flag and marks the entry as valid. Automated grep can only check PRESENCE, not SEMANTIC CORRECTNESS.
- **Doesn't catch Scenario 2 (source moved) unless the grep target is updated.** If the audit tool is refactored to a package and the grep target is still `scripts/generate-audit.py`, a moved flag reference becomes invisible. Fix: grep the entire `scripts/` directory, not a single file.
- **False urgency on legitimate entries.** A developer temporarily removes a flag reference (during a refactor, before re-adding it in the next commit) triggers the staleness check on the intermediate state. Fix: only run on merge to main, not on every push.
- **Noise if the audit tool source is unstable.** During an active refactoring period, multiple entries may toggle between stale and non-stale across PRs. The check becomes a nuisance rather than a signal.

**When to use:** As the primary hygiene mechanism for teams with 3-15 allowlist entries. The most cost-effective option for Phase 1.

### Option 3: Allowlist Entries with Expiry Dates ("The TTL Pattern")

Each allowlist entry includes a mandatory `expires` field — an ISO date after which the entry is treated as expired and the CI check fails:

```json
{
  "explanation": "Flags in the audit tool source that are NOT in the template and should not trigger phantom detection",
  "allowed_non_template_flags": {
    "--verbose": {
      "reason": "Referenced in help text string",
      "added": "2026-02-01",
      "added_by": "aarav",
      "expires": "2026-05-01",
      "source_location": "generate-audit.py:47 (docstring)"
    },
    "--enumerate-args": {
      "reason": "Referenced in docstring note about debug flags",
      "added": "2026-03-10",
      "added_by": "aarav",
      "expires": "2026-06-10",
      "source_location": "generate-audit.py:52 (docstring)"
    }
  }
}
```

The CI check enforces:

```bash
#!/bin/bash
# tier1.5-allowlist-expiry.sh

ALLOWLIST="l10n/tier1.5-phantom-allowlist.json"
TODAY=$(date +%Y-%m-%d)
EXPIRED=()

for flag in $(jq -r '.allowed_non_template_flags | keys[]' "$ALLOWLIST"); do
  EXPIRES=$(jq -r ".allowed_non_template_flags[\"$flag\"].expires" "$ALLOWLIST")
  if [[ "$TODAY" > "$EXPIRES" ]]; then
    EXPIRED+=("$flag (expired: $EXPIRES)")
  fi
done

if [ ${#EXPIRED[@]} -gt 0 ]; then
  echo "⏰ EXPIRED ALLOWLIST ENTRIES"
  echo "The following allowlist entries have passed their expiry date:"
  for entry in "${EXPIRED[@]}"; do
    echo "  $entry"
  done
  echo ""
  echo "Either remove the entry (if the suppression is no longer needed)"
  echo "or extend the expiry date with a justification in the commit message."
  exit 1
fi
```

**Strengths:**
- **Forces periodic human review.** Every entry has a deadline. When it expires, someone must actively decide whether to renew (extend the date) or retire (remove the entry). This is a forcing function against the "accretion without curation" problem (Scenario 5).
- **Captures provenance.** The `added`, `added_by`, and `source_location` fields create an audit trail. When someone reviews an expired entry, they know who added it, when, and why. This reduces the "why is this here?" overhead.
- **The renewal decision is an active signal.** If a developer renews an entry for the third time, the pattern is visible in the git history: three commits extending the same flag's expiry. A reviewer can ask: "Why is `--verbose` permanently in the allowlist? Should this be handled differently?"
- **Works well with Option 2 (grep-back).** The TTL enforces periodic review even if the grep-back says the entry is still valid. An entry that's valid but has been renewed 4 times is a signal that the flag should be handled structurally (move to `flags_excluded` in Phase 2, refactor the source to avoid the reference, or accept it as permanent).

**Weaknesses:**
- **Expiry date selection is arbitrary.** What's the right TTL — 30 days? 90 days? 6 months? Too short and entries expire before anyone has time to address the underlying cause. Too long and the mechanism provides no value — it's just a calendar reminder with extra steps.
- **Renewal fatigue.** If the audit tool's source is stable (no refactoring planned), entries will be renewed automatically every quarter without thought. The renewal becomes a ritual, not a decision. The developer opens the file, bumps every date by 90 days, commits "extend allowlist expiry," and moves on. The forcing function stops forcing.
- **Schema complexity.** The allowlist grows from a simple `{flag: reason}` map to a `{flag: {reason, added, added_by, expires, source_location}}` object. This is more information to maintain, more fields to validate, more merge conflicts in multi-developer PRs.
- **Timezone and date comparison gotchas.** ISO date comparison in bash (`[[ "$TODAY" > "$EXPIRES" ]]`) works for YYYY-MM-DD format but fails silently for other formats. A developer who writes `"expires": "May 2026"` creates a date that bash compares lexicographically and incorrectly.

**When to use:** When the team has >5 allowlist entries, the Phase 2 migration is not imminent, and the manual review (Option 1) has already lapsed at least once. The TTL is a structural replacement for human discipline.

### Option 4: Source-Anchored Allowlist ("The Line Reference")

Instead of listing flag names, the allowlist references specific source locations. The CI check verifies that the flag still appears at the cited location:

```json
{
  "allowed_non_template_flags": [
    {
      "flag": "--verbose",
      "reason": "Referenced in help text string",
      "anchors": [
        {"file": "scripts/generate-audit.py", "line_pattern": "Use --verbose for detailed", "context": "help text constant"}
      ]
    },
    {
      "flag": "--enumerate-args",
      "reason": "Referenced in docstring note about debug flags",
      "anchors": [
        {"file": "scripts/generate-audit.py", "line_pattern": "--enumerate-args are debug flags", "context": "docstring"}
      ]
    }
  ]
}
```

The CI check validates each anchor:

```bash
for entry in $(jq -c '.allowed_non_template_flags[]' "$ALLOWLIST"); do
  FLAG=$(echo "$entry" | jq -r '.flag')
  for anchor in $(echo "$entry" | jq -c '.anchors[]'); do
    FILE=$(echo "$anchor" | jq -r '.file')
    PATTERN=$(echo "$anchor" | jq -r '.line_pattern')
    if ! grep -qF "$PATTERN" "$FILE"; then
      echo "❌ STALE ANCHOR: $FLAG — pattern '$PATTERN' not found in $FILE"
      exit 1
    fi
  done
done
```

**Strengths:**
- **Catches Scenario 1 (source removal) with precision.** Not just "does the flag appear somewhere in source?" but "does the flag appear in the SPECIFIC context that justified the allowlist entry?" If the docstring is removed but the flag appears in a new template line, the anchor check fails — correctly flagging that the original justification is gone, even though the flag still appears.
- **Catches Scenario 3 (reason change) partially.** If the line pattern changes (docstring reworded, help text restructured), the anchor breaks. The developer must update both the source and the allowlist anchor, creating an explicit connection between the two.
- **Self-documenting.** The `line_pattern` field tells a reviewer EXACTLY where to look in source to verify the entry. No grepping required during manual review.
- **Granular.** Multiple anchors per flag handle the case where a flag appears in multiple non-template contexts. If one anchor becomes stale but others remain valid, the entry can be updated (remove the stale anchor, keep the valid ones).

**Weaknesses:**
- **Extremely fragile.** Any edit to the line containing the pattern — even whitespace changes, punctuation, or word reordering — breaks the anchor. This creates a high false-positive rate during refactoring.
- **Line patterns as fuzzy anchors.** Using a substring of the line (not the full line) reduces fragility but introduces ambiguity — the pattern might match a different line after refactoring.
- **Maintenance burden inverted.** Instead of the allowlist being low-maintenance and the source being freely editable, the allowlist now constrains source editing. A developer who wants to improve a docstring must also update the allowlist anchor. This coupling is backwards — the source should be authoritative, not the allowlist.
- **Incompatible with Phase 2 migration.** The declared template manifest (Option 3 from parent) replaces the allowlist entirely. Investing in source-anchored allowlist infrastructure that will be thrown away when Phase 2 ships is poor ROI unless Phase 2 is far off.

**When to use:** When the allowlist contains entries whose reasons are critical to understand precisely (e.g., a flag that was added for security reasons and must not be removed without review). Not recommended as the default hygiene mechanism — too fragile for routine use.

### Option 5: Allowlist-as-Code with Inline Justification ("The Assertion Pattern")

Replace the JSON allowlist with executable assertions in the CI script itself. Each allowlist entry becomes a documented assertion:

```bash
#!/bin/bash
# tier1.5-allowlist-assertions.sh
# Each assertion is a documented allowlist entry. To add a new entry:
# 1. Add an assert_allowed_phantom call below
# 2. Include the reason, author, and date
# 3. The assertion verifies the flag still appears in non-template source

PHANTOM_LOG=()

assert_allowed_phantom() {
  local flag="$1"
  local reason="$2"
  local grep_pattern="$3"  # Pattern that distinguishes non-template from template usage
  local author="$4"
  local date="$5"

  if echo "$TEMPLATE_FLAGS" | grep -qx -- "$flag"; then
    # Flag is in the template — check if it's ALSO in non-template source
    if grep -qP "$grep_pattern" "$AUDIT_SRC"; then
      # Both template and non-template: log warning (Scenario 3 risk)
      echo "⚠️ DUAL-USE FLAG: $flag appears in both template and non-template context"
      echo "  Allowlist reason: $reason"
      echo "  Added by $author on $date"
      echo "  ➜ Verify the allowlist entry is still appropriate"
    fi
    # If only in template: allowlist entry is irrelevant (flag is a real template flag now)
  fi
}

# --- ALLOWLIST ENTRIES ---

# Aarav, 2026-02-01: --verbose appears in help text constant (line ~47)
# The help text says "Use --verbose for detailed output" but --verbose
# is never included in generated commands.
assert_allowed_phantom "--verbose" \
  "Help text string, not template" \
  'help.*--verbose|--verbose.*help' \
  "aarav" "2026-02-01"

# Aarav, 2026-03-10: --enumerate-args appears in docstring note
# The docstring explains debug flags are not included in commands.
assert_allowed_phantom "--enumerate-args" \
  "Docstring note about debug flags" \
  'debug.*--enumerate-args|--enumerate-args.*debug' \
  "aarav" "2026-03-10"
```

**Strengths:**
- **Executable documentation.** Each entry is a code block with comments, not a JSON blob. Developers read it like code, understand the logic, and can modify it with full IDE support (syntax highlighting, diff tools, blame).
- **Rich grep patterns.** Instead of matching just the flag name, each entry specifies a pattern that distinguishes non-template usage. `'help.*--verbose|--verbose.*help'` matches the help text but NOT a template line like `cmd += " --verbose"`. This narrows the match and reduces Scenario 3 risk.
- **Dual-use detection.** The assertion explicitly checks whether the flag appears in BOTH template and non-template contexts — the Scenario 3 early warning that Options 1-3 miss. If `--verbose` starts appearing in the template AND in help text, the assertion warns.
- **No schema migration.** Moving from JSON to bash requires no new tooling, no JSON schema validation, no jq parsing. The allowlist IS the CI script.
- **Grep-back is built in.** Each assertion's `grep_pattern` serves double duty: it's the allowlist entry AND the staleness check. If the pattern stops matching, the assertion silently allows the phantom check to run normally (the entry becomes a no-op, which is the correct behavior when the non-template reference is gone).

**Weaknesses:**
- **Not machine-readable.** Other tools can't programmatically query the allowlist. The Phase 2 migration tool can't read bash assertions to import entries into the declared manifest. Manual migration is required.
- **Merge conflict magnets.** Two developers adding allowlist entries in the same PR period will conflict on the bash file. JSON's flat key-value structure handles this better (each entry is independent).
- **Testing the assertions requires executing them.** A malformed assertion (typo in flag name, broken regex) only fails at CI runtime. JSON schemas can be validated statically.
- **Grep pattern authoring is a skill tax.** Asking developers to write regex patterns that distinguish template from non-template usage is a higher bar than "add a flag name and a reason string." Junior developers may write patterns that are too broad (matching everything) or too narrow (breaking on minor source changes).

**When to use:** In teams where developers are comfortable writing and reviewing bash/regex, and the allowlist is small enough (<10 entries) that a single script file is manageable. Not recommended for larger teams or allowlists — the merge conflict and regex authoring costs dominate.

---

## Recommendation: Option 2 (CI Staleness Check) + Option 3 (TTL) as Complementary Layers

**The Two-Layer Hygiene Model:**

**Layer 1 — Automated grep-back (Option 2).** Runs on every PR that touches the audit tool source directory. Catches Scenario 1 (source removal) and Scenario 2 (source moved, if grep target is broad enough) immediately, at PR time, with zero human effort. This is the fast, cheap check that prevents benign stale entries from accumulating.

**Layer 2 — TTL with quarterly expiry (Option 3).** Every allowlist entry has a 90-day expiry. When expired, CI fails. The developer must either renew (with justification in commit message) or retire the entry. This catches Scenario 3 (reason change) and Scenario 5 (accretion without curation) by forcing periodic human review of entries that the automated grep-back can't semantically evaluate.

**Why 90 days for the TTL:** Short enough to prevent multi-quarter accumulation without review. Long enough that entries added during a sprint aren't expired before the next sprint starts. Aligns with the quarterly review cadence that many teams already have.

**Combined schema:**

```json
{
  "schema_version": 1,
  "explanation": "Flags in the audit tool source that are NOT in the template and should not trigger phantom detection. CI verifies each entry is still valid (grep-back) and not expired (TTL check).",
  "allowed_non_template_flags": {
    "--verbose": {
      "reason": "Referenced in help text string (generate-audit.py help_text constant)",
      "added": "2026-02-01",
      "added_by": "aarav",
      "expires": "2026-05-01",
      "renewals": 0
    },
    "--enumerate-args": {
      "reason": "Referenced in docstring note about debug flags",
      "added": "2026-03-10",
      "added_by": "aarav",
      "expires": "2026-06-10",
      "renewals": 0
    }
  }
}
```

**Combined CI script:**

```bash
#!/bin/bash
# tier1.5-allowlist-hygiene.sh
# Layer 1: grep-back staleness check
# Layer 2: TTL expiry check

ALLOWLIST="l10n/tier1.5-phantom-allowlist.json"
AUDIT_SRC_DIR="scripts/"
TODAY=$(date +%Y-%m-%d)
ERRORS=()
WARNINGS=()

for flag in $(jq -r '.allowed_non_template_flags | keys[]' "$ALLOWLIST"); do
  ENTRY=$(jq -c ".allowed_non_template_flags[\"$flag\"]" "$ALLOWLIST")
  REASON=$(echo "$ENTRY" | jq -r '.reason')
  EXPIRES=$(echo "$ENTRY" | jq -r '.expires')
  RENEWALS=$(echo "$ENTRY" | jq -r '.renewals // 0')

  # Layer 1: grep-back — does the flag still appear in source?
  if ! grep -rq -- "$flag" "$AUDIT_SRC_DIR"; then
    ERRORS+=("STALE: $flag — no longer appears in $AUDIT_SRC_DIR (was: \"$REASON\")")
    continue
  fi

  # Layer 2: TTL — has the entry expired?
  if [[ "$TODAY" > "$EXPIRES" ]]; then
    ERRORS+=("EXPIRED: $flag — expired on $EXPIRES (renewals: $RENEWALS). Renew or remove.")
    continue
  fi

  # Advisory: high renewal count
  if [ "$RENEWALS" -ge 3 ]; then
    WARNINGS+=("HIGH RENEWALS: $flag has been renewed $RENEWALS times. Consider structural fix (move to flags_excluded in Phase 2) or permanent allowlist category.")
  fi
done

if [ ${#WARNINGS[@]} -gt 0 ]; then
  echo "⚠️ ALLOWLIST ADVISORIES:"
  for w in "${WARNINGS[@]}"; do echo "  $w"; done
  echo ""
fi

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo "❌ ALLOWLIST HYGIENE FAILURES:"
  for e in "${ERRORS[@]}"; do echo "  $e"; done
  exit 1
fi

echo "✅ All allowlist entries valid and current."
```

**The renewal counter as a migration signal:** The `renewals` field tracks how many times an entry has been extended past its original expiry. When a developer renews an entry, they increment `renewals`. When `renewals >= 3`, the CI script emits an advisory (not a failure): "consider structural fix." This advisory is the micro-signal that feeds into the macro Phase 2 migration trigger from the parent: not just "how many entries are in the allowlist" but "how many entries have been renewed so many times that they're effectively permanent." A permanent entry in a temporary mechanism is a design smell.

### The Phase 2 Absorption Path

When the team migrates to the declared template manifest (Option 3 from parent):

1. Each allowlist entry maps to a `flags_excluded` entry in `--enumerate-template-flags`
2. The `reason` field transfers directly to the exclusion reason
3. The `renewals` count determines migration priority: high-renewal entries are migrated first (they're the ones most in need of a structural home)
4. The allowlist file is deleted in the same PR that enables the manifest-based reverse check
5. The hygiene script (`tier1.5-allowlist-hygiene.sh`) is deleted simultaneously — its checks are absorbed into the three-way manifest comparison

**The deletion must be atomic.** If the allowlist file is deleted before the manifest is fully operational, phantom flags are unsuppressed. If the manifest is enabled before the allowlist is deleted, two suppression mechanisms coexist and can conflict. The migration PR must contain: manifest addition, hygiene script deletion, allowlist file deletion, and Tier 1.5 script update — all in one commit.

---

## The "Permanent Allowlist" Anti-Pattern

Some entries genuinely need to live forever. The `--enumerate-args` flag will always appear in the audit tool's source (it's how the audit tool reads the repair tool's schema). The `--verbose` flag may always appear in help text. These entries are renewed every quarter, the counter rises, but no structural fix is available because the flag really IS in source for a valid, permanent reason.

**Three responses to permanent entries:**

**Response A: Accept permanence with a `permanent: true` field.** Add a boolean field that exempts the entry from TTL expiry:

```json
"--enumerate-args": {
  "reason": "Referenced in audit tool's schema-reading logic and documentation",
  "added": "2026-03-10",
  "added_by": "aarav",
  "permanent": true,
  "permanent_justification": "The audit tool will always reference --enumerate-args because it invokes this flag to read the repair tool's schema. This is a structural dependency, not a documentation artifact.",
  "permanent_approved_by": "dev",
  "permanent_approved_date": "2026-06-15"
}
```

Permanent entries require explicit approval (a second developer) and a justification field. The CI script skips TTL checks but still runs the grep-back (to catch the case where even a permanent entry becomes stale due to source refactoring).

**Response B: Promote to `internal` flag category.** If `--enumerate-args` is permanently in the audit source because the audit tool actually invokes it, it's not a false positive — it's a REAL flag that the audit tool uses but doesn't include in generated commands. This is exactly what the `internal: true` marker in `--enumerate-args` was designed for (parent, line 396). The reverse check should skip `internal` flags by default: "flag is in source, flag is in known set, flag is marked internal → OK, this is expected."

**Response C: Refactor the source to isolate non-template code.** If the audit tool's source is structured so that grep only scans the template-generating code (not the schema-reading code, not the help text, not the tests), then `--enumerate-args` never appears in the grep target. The allowlist entry is unnecessary because the grep is precise enough to avoid the false positive.

**Recommendation: Response B where possible (flag is used by the audit tool), Response A where necessary (flag is in passive documentation), Response C as a long-term refactoring goal.**

---

## Player Journeys

### Journey: Aarav, 25, Junior Engineer — The First Expiry

**Context:** Aarav added two allowlist entries 90 days ago (the `--verbose` and `--enumerate-args` entries from the parent's Journey 1). He hasn't thought about them since. Today he opens a PR that touches an unrelated file in the `scripts/` directory. CI fails.

**Minute 0:00 — The Unexpected Red**

Aarav's PR updates `scripts/deploy-locales.sh` — nothing to do with the audit tool or phantom flags. He pushes, waits for CI. The GitHub Actions log loads. Green check on lint. Green check on tests. Red `❌` on Tier 1.5 phantom flag check.

What Aarav sees: a monospace log with a yellow `⏰` header: "EXPIRED ALLOWLIST ENTRIES." Below it, two lines:

```
  EXPIRED: --verbose — expired on 2026-05-01 (renewals: 0). Renew or remove.
  EXPIRED: --enumerate-args — expired on 2026-06-10 (renewals: 0). Renew or remove.
```

Aarav's first reaction: confusion. He didn't touch the allowlist or the audit tool. Why is this failing on HIS PR? He reads the script path in the workflow — `tier1.5-allowlist-hygiene.sh` — and remembers: the hygiene check runs on any PR touching `scripts/`. His deploy script change triggered the check.

**What Aarav sees on screen:** The GitHub Actions log, white background, the `⏰ EXPIRED ALLOWLIST ENTRIES` header in bold yellow, two entries each on its own line with the flag name in code font, the expiry date in parentheses, and the directive "Renew or remove" in plain text. Below, the script's final output: `exit 1`. The step is marked with a red `✗`.

**Minute 0:03 — Opening the Allowlist**

Aarav opens `l10n/tier1.5-phantom-allowlist.json` in his editor. He sees his two entries from 90 days ago. The `reason` fields bring the context back — "Referenced in help text string," "Referenced in docstring note about debug flags." He remembers the docstring PR. He checks: are these still accurate?

He opens `scripts/generate-audit.py`. Ctrl+F for `--verbose`. Still in the help text constant on line 47. Still a valid allowlist entry. He checks `--enumerate-args`. Still in the docstring on line 52. Also still valid.

**What Aarav feels:** Mild annoyance — the entries are clearly still valid, and he has to bump dates for something he doesn't own. But he also recognizes the forcing function: if nobody had checked, these entries would have sat unreviewed for a year.

**Minute 0:05 — The Renewal Decision**

Aarav updates both entries:

```json
"--verbose": {
  "reason": "Referenced in help text string (generate-audit.py:47, help_text constant)",
  "added": "2026-02-01",
  "added_by": "aarav",
  "expires": "2026-08-01",
  "renewals": 1
}
```

He increments `renewals` to 1 and sets `expires` to 90 days from today. He amends his PR with the allowlist update. Pushes. Green.

**What Aarav sees on screen:** His PR diff now has two files: the intended `deploy-locales.sh` change and the allowlist update. The allowlist diff shows two fields changed per entry (`expires` date and `renewals` count). The diff is 8 lines — small, non-threatening. His PR description says "Also: renew allowlist entries (quarterly expiry)."

**Minute 0:10 — The Reviewer's Perspective**

Margot reviews Aarav's PR. She sees the deploy script change (expected) and the allowlist update (unexpected). She clicks into the allowlist diff. She reads the `renewals: 1` field. She thinks: "first renewal, entries are still valid, fine." If this had been `renewals: 3`, she would have commented: "These have been renewed three times — should we promote `--enumerate-args` to the `internal` flag category instead of perpetually renewing?"

**UI Annotations:**
- The CI error message includes the `renewals` count, surfacing the entry's lifecycle history without requiring the reviewer to open the file.
- The expiry date format is ISO 8601 (`2026-05-01`), not human-friendly ("May 1st"). This is intentional — ISO dates sort correctly, compare correctly in bash, and avoid locale-dependent parsing.
- The error message says "Renew or remove" — a binary directive. It does not say "Renew, remove, or promote to permanent" because the `permanent` category is a team decision, not a CI suggestion. The CI guides action, not architecture.

---

### Journey: Dev, 24, Junior Engineer — The Stale Entry Discovery

**Context:** Dev is refactoring the audit tool's help system. She's moving all help text from inline constants to a dedicated `help.py` module. This changes where `--verbose` appears in source — it moves from `generate-audit.py` (where the grep targets) to `generate-audit/help.py` (a new file in a new directory structure).

**Minute 0:00 — The Refactor**

Dev creates `scripts/generate-audit/help.py` and moves the help text constant. The old `generate-audit.py` becomes `scripts/generate-audit/__init__.py` with imports. The help text no longer contains `--verbose` in the file that the grep-back checks.

She pushes. CI runs.

**Minute 0:02 — The Staleness Error**

```
❌ ALLOWLIST HYGIENE FAILURES:
  STALE: --verbose — no longer appears in scripts/ (was: "Referenced in help text string (generate-audit.py:47, help_text constant)")
```

Wait — the grep-back checks `scripts/` recursively. Why didn't it find `--verbose` in `scripts/generate-audit/help.py`?

Dev checks the hygiene script. The grep target is `scripts/` — recursive, good. She checks the new file location: `scripts/generate-audit/help.py`. She runs `grep -r -- "--verbose" scripts/` locally. Match found: `scripts/generate-audit/help.py:12`. The grep-back SHOULD have found it.

She re-reads the error: "no longer appears in scripts/". But it does! She looks at the CI logs more carefully. The file exists in her PR but... she checks git status. The new directory was added, but she forgot to `git add scripts/generate-audit/help.py`. The file isn't in the commit. CI is checking the committed state, not her working directory.

**What Dev sees on screen:** The CI log with the stale entry error. Her local terminal showing `git status` with `scripts/generate-audit/help.py` as an untracked file, highlighted in red. The gap between local reality and committed reality.

**Minute 0:05 — The Fix**

Dev stages the missing file, amends the commit, force-pushes. CI reruns. The grep-back finds `--verbose` in the newly committed `scripts/generate-audit/help.py`. Green.

**What Dev learned:** The grep-back check caught a genuine staging error, not a false positive. The allowlist hygiene mechanism served as an indirect completeness check on the refactor — if `--verbose` had truly been removed from ALL source files (not just unstaged), the stale entry error would have been correct and the entry should have been removed.

**Minute 0:08 — Updating the Source Location**

Dev realizes the allowlist entry's reason still says "generate-audit.py:47" but the reference is now at `generate-audit/help.py:12`. The grep-back passed (the flag is somewhere in `scripts/`), but the human-readable reason is stale. She updates:

```json
"--verbose": {
  "reason": "Referenced in help text module (generate-audit/help.py:12, HELP_TEXT constant)",
  ...
}
```

This is Scenario 2 awareness — the grep-back catches the hard case (file gone entirely), but the source location in the reason field requires manual maintenance. The hygiene script doesn't validate the reason field's location reference. That's a gap for future work — or for the source-anchored approach (Option 4) which handles this natively.

**UI Annotations:**
- The stale entry error message includes the ORIGINAL reason in quotes, making the discrepancy between stated location and actual location visible. A developer who reads "was: 'generate-audit.py:47'" and knows they moved that file to `help.py` immediately understands the connection.
- The grep-back's `grep -rq` flag means silent-mode: no output lines, just exit code. The staleness check reports "no longer appears in scripts/" without showing WHERE the grep looked. Adding `grep -r --include="*.py"` to limit to Python files would make the search more precise and the error message more helpful.

---

### Journey: Margot, 33, L10n Lead — The High-Renewal Audit

**Context:** It's Q4 2026. The allowlist has 8 entries. Three of them (`--verbose`, `--enumerate-args`, `--validate-only`) have been renewed 4 times each. The team has been planning Phase 2 migration for two sprints but it keeps getting deprioritized. Margot opens a PR that touches the audit tool and sees:

**Minute 0:00 — The Advisory**

```
⚠️ ALLOWLIST ADVISORIES:
  HIGH RENEWALS: --verbose has been renewed 4 times. Consider structural fix (move to flags_excluded in Phase 2) or permanent allowlist category.
  HIGH RENEWALS: --enumerate-args has been renewed 4 times. Consider structural fix.
  HIGH RENEWALS: --validate-only has been renewed 3 times. Consider structural fix.

✅ All allowlist entries valid and current.
```

The check passes (green) but the advisories are visible. Margot has seen these advisories before — they've appeared for the last two renewals. But today she's already touching the audit tool code. The marginal cost of addressing the advisories is low.

**What Margot sees on screen:** The GitHub Actions log. The yellow `⚠️ ALLOWLIST ADVISORIES` block sits ABOVE the green `✅ All allowlist entries valid and current` confirmation. Three advisory lines, each with the flag name, renewal count, and a suggestion. The advisories don't block the PR — the check passes. But they're visible to every reviewer who expands the CI log.

**Minute 0:03 — The Triage**

Margot opens the allowlist file. She assesses each high-renewal entry:

- `--verbose`: Appears in help text. The audit tool will always have help text. This is Response A (permanent) or Response B (promote to `internal`). Since `--verbose` is genuinely `internal: true` in the repair tool's schema, the right fix is to update the reverse check to skip `internal` flags, not to permanently allowlist them.
- `--enumerate-args`: The audit tool literally invokes `--enumerate-args` to read the repair tool's schema. This is structural. Response B — the flag is `internal: true` and the reverse check should skip it.
- `--validate-only`: This one's different. It used to be in the template, was removed 8 months ago, but still appears in a test fixture. The test fixture should probably be updated. This is a genuine stale entry masked by the allowlist.

**What Margot feels:** Vindication. The high-renewal advisory led her to look at three entries, and one of them (`--validate-only`) turned out to be a genuine suppressed problem. The advisory wasn't just noise — it surfaced a real issue hiding behind a legitimately-renewed entry.

**Minute 0:10 — The Three-Part Fix**

Margot's PR now includes:
1. Update the reverse check to skip flags marked `internal: true` in the repair tool's `--enumerate-args` output (fixes `--verbose` and `--enumerate-args` structurally)
2. Remove the `--verbose` and `--enumerate-args` entries from the allowlist (no longer needed)
3. Update the test fixture that references `--validate-only` to use the current flag name `--check-budget`, then remove the `--validate-only` allowlist entry

The allowlist shrinks from 8 entries to 5. Three entries resolved, two structurally (internal skip) and one by fixing the underlying stale reference.

**Minute 0:20 — The Phase 2 Reassessment**

With only 5 entries remaining and the `internal` skip mechanism in place, Margot messages the team: "The allowlist is now at 5 entries, down from 8. The `internal` flag skip eliminates the most-renewed entries. Phase 2 migration is less urgent — the remaining entries are genuinely temporary (recent false positives from refactoring). Recommend revisiting in Q1 2027."

The Phase 2 migration is deprioritized not because it was forgotten, but because the hygiene mechanisms reduced the pressure. This is the correct outcome — Phase 2 should ship when the allowlist's maintenance burden justifies the implementation cost, not on a fixed schedule.

**UI Annotations:**
- The advisory's suggestion text ("Consider structural fix (move to flags_excluded in Phase 2) or permanent allowlist category") names two specific actions. This is deliberate — the CI output should guide the developer toward the right solution, not just flag the problem.
- The renewal count is a NUMBER, not a category. "Renewed 4 times" is more informative than "frequently renewed." The threshold (3) that triggers the advisory is configurable in the hygiene script but defaulted to 3 — enough to filter out normal quarterly renewals (1-2) while surfacing persistent entries.
- The advisory does NOT suggest deleting the entry. "Consider structural fix" acknowledges that the entry is VALID — it's been renewed for a reason. The suggestion is to change HOW it's handled, not WHETHER it's needed.

---

## Interaction Effects

### With Phase 2 Migration (Parent Option 3)

The allowlist hygiene mechanism is explicitly designed to be temporary. Every design decision includes the Phase 2 absorption path:
- TTL entries map to `flags_excluded` entries in the manifest
- The `renewals` count determines migration priority
- The hygiene script is deleted atomically with the allowlist file
- The `internal: true` skip mechanism (from Journey 3) carries forward into Phase 2 as a permanent feature

### With Schema Drift Detector (4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i)

The allowlist schema itself (`schema_version: 1`) should be monitored by the drift detector. If the allowlist gains new fields (e.g., `permanent`, `permanent_justification`) without a version bump, the drift detector should flag it. The allowlist is a schema like any other.

### With Repair Command Version (4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A)

When the repair tool's schema version bumps, ALL allowlist entries should be re-validated — a version bump may add, remove, or rename flags, which changes which entries are stale. The hygiene script should accept an optional `--on-version-bump` flag that runs a comprehensive re-validation regardless of TTL status.

### With Profile Export (4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-vi-a-i)

The allowlist is a development artifact, not a player-facing artifact. It should NEVER appear in profile exports. But the `displayPrefs` export category (parent chain) establishes the principle that "configuration that affects how information is presented" travels with exports. The allowlist is purely CI infrastructure — it belongs to the repository, not to any player profile.

### With Bidirectional Completeness as General Pattern (4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-v)

If the bidirectional check is abstracted into a reusable library (sibling aspect), the allowlist mechanism should be abstracted alongside it. Every bidirectional check needs a false-positive suppression mechanism. The `allowlist + grep-back + TTL` pattern is generalizable: the specific flags are domain-dependent, but the hygiene model (automated staleness detection + periodic forced review + renewal counting + permanent category) is universal.

---

## Sensory Description

The allowlist hygiene check's output is designed to be scannable in a CI log — a wall of monospace text with color-coded prefixes:

- **`✅` green:** All entries valid. One line. The developer's eye hits green and moves on. This is the 95% case. The check is invisible when healthy.
- **`⚠️` yellow:** Advisory only. A block of yellow-prefixed lines between the check header and the green confirmation. The developer sees yellow and GREEN — advisory plus pass. The yellow draws attention without blocking. It's a sticky note on a passing report card.
- **`❌` red:** Failure. The red block replaces the green confirmation. No green visible — just red. The developer sees failure and reads the specific entries. Each entry is one line with three components: `TYPE: FLAG — DETAIL (METADATA)`. Stale entries say "no longer appears in [path]." Expired entries say "expired on [date] (renewals: N)."

The visual hierarchy is: check header → failure/advisory block → pass confirmation. A developer scanning CI logs top-to-bottom reads: "Allowlist hygiene: [result]" in under 2 seconds.

The allowlist file itself, when opened in an editor, reads as a manifest with clear provenance. Each entry has a name (the flag), a story (the reason), a timeline (added/expires dates), and a counter (renewals). It's a patient chart, not a data file — each entry has history and state.

---

## Comparable Systems

**npm `package-lock.json` audit:** npm's `audit` command flags outdated or vulnerable dependencies. The `npm audit --fix` command is the automated resolution. But `npm audit` also has an `overrides` mechanism for known-acceptable vulnerabilities — essentially an allowlist. The hygiene problem is identical: overrides accumulate, nobody reviews them, and a genuine vulnerability hides behind a stale override. npm's solution is... nothing. The overrides persist indefinitely. Our TTL approach is an explicit improvement over npm's model.

**`.eslintrc` ignore directives:** ESLint's `// eslint-disable-next-line` comments suppress specific warnings. These accumulate over time. Some tools (eslint-plugin-eslint-comments) can detect unused disable directives — stale suppressions where the underlying warning was fixed but the disable comment persists. This is Option 4's line-anchoring approach applied to lint suppressions. The eslint-plugin approach is closer to our Option 2 (automated staleness check) — it runs at lint time and flags unused directives.

**Kubernetes `PodDisruptionBudget` with TTL:** Kubernetes doesn't have native TTL on PDBs, but operators often add annotation-based expiry (`expires: 2026-05-01`) with a controller that deletes expired PDBs. The pattern is identical to our Option 3: a configuration entry with a time-to-live, enforced by an external controller. The Kubernetes community's experience is that annotation-based TTL works well for small clusters but becomes unmanageable at scale — supporting our recommendation to limit Option 3 to the Phase 1 period.

**Git `.gitignore` hygiene:** `.gitignore` entries for files that no longer exist are stale but harmless. Some tools (`git check-ignore --verbose`) can audit which entries match actual files. The asymmetry is identical to our Scenario 1: stale entries are benign but create false confidence.
