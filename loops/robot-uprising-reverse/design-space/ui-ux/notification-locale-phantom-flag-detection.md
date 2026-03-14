# Phantom Flag Detection as Bidirectional Completeness Check

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a — Reverse template check (audit → repair direction); `--enumerate-args` as known-flags source of truth; flag alias handling; false positive suppression for test-only flags

**Parent:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i — Automated schema change detection: the schema drift detector (established: Tier 1 `--enumerate-args` manifest diff + Tier 1.5 template completeness + Tier 2 nightly round-trip; Recommendation: Option D+E two-tier check; co-location principle; auto-classification)

**The gap this closes:** The parent's Tier 1.5 originally checks only the FORWARD direction: "does the audit template include all flags the repair tool REQUIRES?" Dev's player journey (parent, line 687) revealed the blind spot: the check does NOT verify the REVERSE direction — "does the audit template include ONLY flags the repair tool ACCEPTS?" When a flag is removed from the repair tool but left in the audit template, Tier 1 passes (manifest updated, version bumped) and Tier 1.5 passes (forward check: all required flags present), but generated commands contain a phantom flag the repair tool rejects. This aspect is the full design of the bidirectional completeness check that closes this blind spot.

---

## The Phantom Flag Problem

A **phantom flag** is a flag present in the audit tool's command template that the repair tool no longer accepts. It's a specific instance of a broader class: **stale positive references** — code that refers to an entity that used to exist but has been removed.

### How Phantom Flags Arise

There are exactly four scenarios:

**Scenario 1: Flag removal.** The repair tool removes `--validate-budget` (moved to pre-commit hook). The developer bumps the version, updates the enumeration, updates the manifest. But the audit tool's `generate_repair_command()` still includes `--validate-budget` in its template string. Tier 1 passes (schema and version in sync). Tier 1.5 forward check passes (all currently-required flags are present). Generated commands contain `--validate-budget` → repair tool rejects with "unknown flag."

**Scenario 2: Flag rename.** `--validate-budget` becomes `--check-budget`. The developer updates all three artifacts in the repair tool (parser, enumeration, version). The audit template still references the old name. Forward check passes (the new `--check-budget`, if required, might also be missing — but if it's optional, forward doesn't catch it). Generated commands contain `--validate-budget` which no longer exists.

**Scenario 3: Flag merge.** Two flags (`--dry-run` and `--preview`) are consolidated into one (`--dry-run`, with `--preview` removed as redundant alias). If the audit template references `--preview`, it becomes a phantom after the merge — the flag literally no longer exists in the parser.

**Scenario 4: Flag split.** `--output-format=human|json|quiet` is split into `--output-format=human|json` and `--quiet` (a standalone boolean). If the audit template still passes `--output-format=quiet`, the repair tool rejects it — `quiet` is no longer a valid value for `--output-format`. This is a semantic phantom: the flag name exists but the value is invalid.

### Why Forward-Only Checks Miss This

The forward check asks: "For each required flag in the repair tool, is it in the audit template?" This is a subset check: `repair.required ⊆ audit.template`. The reverse check asks: "For each flag in the audit template, is it in the repair tool?" This is the inverse subset check: `audit.template ⊆ repair.known`. Together they form a bidirectional completeness check:

```
Forward:   repair.required ⊆ audit.template    (nothing missing)
Reverse:   audit.template ⊆ repair.known       (nothing extra)
```

The forward check guarantees **completeness** (commands include everything needed). The reverse check guarantees **precision** (commands include nothing extraneous). Both are needed for command **correctness**.

---

## Five Design Options for the Reverse Check

### Option 1: The Simple Grep Reverse ("Dev's Original Fix")

Dev's fix from the parent journey: grep all `--flag` patterns from the audit template source, compare against `--enumerate-args` output, fail if any audit flag isn't in the known set.

```bash
# Bidirectional completeness check (Tier 1.5)
KNOWN_FLAGS=$(make repair-suppression-ref --enumerate-args | jq -r '.flags | keys[]')
TEMPLATE_FLAGS=$(grep -oP '--[\w-]+' scripts/generate-audit.py | sort -u)

# Forward: all required flags in template
REQUIRED=$(make repair-suppression-ref --enumerate-args | jq -r '.flags | to_entries[] | select(.value.required) | .key')
for flag in $REQUIRED; do
  if ! echo "$TEMPLATE_FLAGS" | grep -qx "$flag"; then
    echo "❌ MISSING REQUIRED FLAG: audit template doesn't include $flag"
    exit 1
  fi
done

# Reverse: all template flags are known
for flag in $TEMPLATE_FLAGS; do
  if ! echo "$KNOWN_FLAGS" | grep -qx "$flag"; then
    echo "❌ PHANTOM FLAG: audit template includes $flag but repair tool doesn't accept it"
    exit 1
  fi
done
```

**Strengths:**
- Minimal implementation. Six lines added to the existing Tier 1.5 script.
- Zero new dependencies. Same `grep` + `jq` toolchain.
- Immediately actionable error message. "Phantom flag: `--validate-budget`" tells the developer exactly what to remove.

**Weaknesses:**
- **Grep fragility.** `grep -oP '--[\w-]+'` matches any `--word` pattern in the source, including:
  - Comments: `# TODO: remove --validate-budget after migration`
  - Strings used for other purposes: `help_text = "Use --verbose for detailed output"`
  - Test fixtures: `test_cmd = "make repair-suppression-ref --dry-run"`
  - Conditional branches: `if format == 'json': cmd += ' --output-format=json'` (grep sees `--output-format` but misses the conditional)
- **Flag alias blindness.** If the repair tool accepts both `--dry-run` and `-n`, and the audit template uses `-n`, the reverse check sees `-n` and tries to match it against `--dry-run` in the known set — false positive.
- **No semantic checking.** Catches phantom flag names but not phantom flag values (Scenario 4: `--output-format=quiet` where `quiet` is no longer valid).

**When to use:** As a quick patch to stop the immediate bleeding (Dev's situation). Replace with a more robust option when capacity allows.

### Option 2: AST-Extracted Template Flags ("The Parser Watcher's Cousin")

Instead of grepping the audit tool's source for flag patterns, parse the audit tool's AST to find the specific function that generates repair commands, and extract flags from the string-building logic.

```python
# scripts/extract-audit-template-flags.py
import ast
import sys

with open("scripts/generate-audit.py") as f:
    tree = ast.parse(f.read())

# Find the generate_repair_command function
for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef) and node.name == "generate_repair_command":
        # Extract all string literals containing '--'
        flags = set()
        for child in ast.walk(node):
            if isinstance(child, ast.Constant) and isinstance(child.value, str):
                import re
                for match in re.finditer(r'--[\w-]+', child.value):
                    flags.add(match.group())
        print('\n'.join(sorted(flags)))
        break
```

**Strengths:**
- Scoped to the function that matters. Won't pick up `--flags` from comments, imports, test helpers, or unrelated functions.
- Deterministic extraction. Same AST, same flags, every time.
- Can also extract flag VALUES by analyzing f-string patterns: `f"--output-format={format_var}"` → flag is `--output-format`, value is variable (not checked by this tool, but flagged for manual review).

**Weaknesses:**
- Language-dependent. Only works if the audit tool is Python. If it's bash, TypeScript, or mixed, needs different parsers.
- Fragile to dynamic construction. `flag_name = "--output" + "-format"` → AST sees two string literals, neither containing a full flag name.
- Maintenance burden. The extraction script must be updated when the audit tool is refactored (renamed functions, moved to a different module, split across files).
- Over-engineering for the current scope. The audit tool's `generate_repair_command()` is probably <30 lines. Grep works fine at that scale.

**When to use:** When the audit tool grows complex enough that grep produces >3 false positives per quarter.

### Option 3: Declared Template Manifest ("The Audit Tool's Own `--enumerate-flags`")

Add an `--enumerate-template-flags` introspection flag to the audit tool itself, mirroring the repair tool's `--enumerate-args`. The audit tool declares which flags it will include in generated commands.

```bash
# In generate-audit.sh or generate-audit.py
if [ "$1" = "--enumerate-template-flags" ]; then
  cat <<'EOF'
{
  "template_version": 1,
  "flags_included": [
    "--dry-run",
    "--validate-only",
    "--output-format",
    "--no-stage",
    "--confirm-surface"
  ],
  "flags_conditional": {
    "--strategy": "included when repair_command_version >= 3"
  },
  "flags_excluded": {
    "--verbose": "debugging flag, never included in auto-generated commands",
    "--no-immediate-check": "only used in CI batch mode"
  }
}
EOF
  exit 0
fi
```

The Tier 1.5 check becomes a three-way comparison:

```bash
REPAIR_KNOWN=$(make repair-suppression-ref --enumerate-args | jq -r '.flags | keys[]' | sort)
AUDIT_INCLUDED=$(make l10n-suppression-audit --enumerate-template-flags | jq -r '.flags_included[]' | sort)
AUDIT_EXCLUDED=$(make l10n-suppression-audit --enumerate-template-flags | jq -r '.flags_excluded | keys[]' | sort)

# Forward: all required repair flags are in audit included set
# Reverse: all audit included flags are in repair known set
# Verification: included ∪ excluded ∪ conditional = repair known (no orphans)
```

**Strengths:**
- **Declarative and reviewable.** The audit tool explicitly states what it includes and WHY it excludes certain flags. A reviewer seeing `"--verbose": "debugging flag, never included"` understands the design intent.
- **Eliminates grep fragility entirely.** No source parsing. The audit tool describes itself.
- **Supports conditional inclusion.** The `flags_conditional` field handles version-gated flags, feature-gated flags, and mode-dependent flags — none of which grep or AST extraction can reason about.
- **The `flags_excluded` field is the false-positive suppression list.** Test-only flags, debug-only flags, and CI-only flags are explicitly documented as intentionally absent. The reverse check skips these. This directly solves the "test-only flags" sub-problem in the aspect description.
- **Closes the orphan gap.** By verifying `included ∪ excluded ∪ conditional = known`, the check catches flags that exist in the repair tool but aren't accounted for in ANY category — the "unclassified flag" that nobody decided to include or exclude.

**Weaknesses:**
- **Same human-maintenance problem, now in two tools.** The developer must update `--enumerate-template-flags` in the audit tool when they change the template. Same forgetting risk as `--enumerate-args` in the repair tool.
- **Redundancy.** The audit tool now has two parallel declarations: the actual code that builds the command, and the `--enumerate-template-flags` output that describes what the code builds. These can drift.
- **Complexity.** Three categories (included/conditional/excluded) with verification rules across all three creates a non-trivial mental model for a junior developer encountering the system for the first time.

**When to use:** When the audit tool has non-trivial logic (conditional flags, version-gated inclusions) and grep-based extraction produces false positives. This is the "right" answer for a mature system.

### Option 4: Repair Tool Validates Its Own Commands ("The Self-Test")

Instead of checking the audit template at all, add a `--validate-command` flag to the repair tool that takes a command string and returns whether it would be accepted.

```bash
# In repair-suppression-ref.sh
if [ "$1" = "--validate-command" ]; then
  shift
  # Parse the remaining args exactly as if executing, but don't execute
  parse_args "$@"
  if [ $? -eq 0 ]; then
    echo '{"valid": true, "parsed_args": {...}}'
  else
    echo '{"valid": false, "rejected": "unknown flag: --validate-budget"}'
  fi
  exit 0
fi
```

The Tier 1.5 check generates sample commands from the audit tool and validates them:

```bash
# Generate a set of representative commands
COMMANDS=$(make l10n-suppression-audit --dry-run --sample-commands 2>/dev/null)

for cmd in $COMMANDS; do
  RESULT=$(make repair-suppression-ref --validate-command $cmd)
  if ! echo "$RESULT" | jq -e '.valid' >/dev/null; then
    REJECTED=$(echo "$RESULT" | jq -r '.rejected')
    echo "❌ PHANTOM FLAG DETECTED via command validation"
    echo "  Command: $cmd"
    echo "  Rejected: $REJECTED"
    exit 1
  fi
done
```

**Strengths:**
- **Catches ALL phantom flag types.** Flag removals, renames, merges, and semantic phantoms (bad values) are all caught because the repair tool's actual parser validates the command.
- **No template parsing.** Doesn't matter how the audit tool builds its commands — string concatenation, f-strings, templates, conditional logic. The test is behavioral, not structural.
- **Catches semantic issues.** `--output-format=quiet` would be caught if the repair tool validates values, not just flag names.

**Weaknesses:**
- **Requires `--sample-commands` in the audit tool.** The audit tool must be able to generate representative commands without a real audit input. This is a non-trivial addition — the sample must exercise all code paths that include conditional flags.
- **Slow.** Generating N sample commands and validating each is O(N) subprocess invocations. Even at N=10, this adds 5-10 seconds to CI. Better suited for Tier 2 (nightly) than Tier 1.5 (PR-blocking).
- **The round-trip test (existing Tier 2) already does this.** The parent's Option E is functionally equivalent — it generates a command from the audit tool and executes it against the repair tool. Adding `--validate-command` as a separate mechanism is redundant unless it's significantly faster than a full round-trip.

**When to use:** When you want to replace the existing Tier 2 round-trip test with something more targeted and faster. Not recommended as a Tier 1.5 addition — too slow and overlaps with Tier 2.

### Option 5: Co-Generated Template from Enumeration ("The Derived Template")

The audit tool doesn't maintain its own template at all. Instead, it reads the repair tool's `--enumerate-args` output at runtime and generates commands from it — automatically including all required flags and excluding unknown flags.

```python
# In generate-audit.py
import subprocess
import json

def generate_repair_command(key, surface, **overrides):
    # Read the repair tool's current schema
    result = subprocess.run(
        ["make", "repair-suppression-ref", "--enumerate-args"],
        capture_output=True, text=True
    )
    schema = json.loads(result.stdout)

    cmd = f"make repair-suppression-ref KEY={quote(key)} SURFACE={quote(surface)}"

    for flag, config in schema["flags"].items():
        if config["required"]:
            # Use override if provided, else default
            if flag in overrides:
                if config["takes_value"]:
                    cmd += f" {flag}={overrides[flag]}"
                else:
                    cmd += f" {flag}"
            else:
                if config["takes_value"]:
                    cmd += f" {flag}={config.get('default', 'conservative')}"
                else:
                    cmd += f" {flag}"

    return cmd
```

**Strengths:**
- **Phantom flags are structurally impossible.** The template doesn't exist as a separate artifact. It's derived from the repair tool's own declaration. Remove a flag from the repair tool → the audit tool stops including it, automatically.
- **Eliminates the entire Tier 1.5 check.** There's nothing to compare — the audit tool and repair tool are in sync by construction.
- **This is Option C (schema-first) from the parent, but applied only to the audit tool's command generation.** Less invasive than converting the repair tool itself to schema-first.

**Weaknesses:**
- **Runtime dependency.** The audit tool must invoke the repair tool to generate commands. If the repair tool is unavailable (different machine, broken, slow), the audit tool can't generate commands.
- **Loss of audit-time customization.** If the audit tool wants to include an OPTIONAL flag based on the suppression's context (e.g., `--strategy=aggressive` for high-confidence repairs), it needs to know which optional flags exist and what their valid values are. The enumeration provides flag names but not value spaces.
- **Startup cost.** Every audit run invokes a subprocess to read the schema. Can be mitigated by caching the schema once per audit run.
- **No excluded/conditional reasoning.** The audit tool may intentionally NOT include certain flags (e.g., `--verbose` is debugging-only). Without a manifest declaring exclusions, the audit tool would need to hardcode "skip these flags" — reintroducing a maintenance burden, just in a different location.

**When to use:** When the goal is to eliminate phantom flags structurally. Best paired with Option 3's `flags_excluded` concept to handle intentional omissions.

---

## Recommendation: Option 3 (Declared Template Manifest) + Option 1 (Grep Reverse) as Two-Phase Implementation

**Phase 1 (immediate): Option 1.** Add the six-line reverse grep check to Tier 1.5. This catches the acute phantom flag problem (Scenario 1: flag removal) within one PR cycle. Known false-positive sources (comments, test fixtures) are managed with a small allowlist file:

```json
// l10n/tier1.5-phantom-allowlist.json
{
  "explanation": "Flags in the audit tool source that are NOT in the template and should not trigger phantom detection",
  "allowed_non_template_flags": {
    "--verbose": "Referenced in help text string, not in template",
    "--enumerate-args": "Referenced in debug logging"
  }
}
```

**Phase 2 (when false positives exceed 3/quarter): Option 3.** Add `--enumerate-template-flags` to the audit tool with included/excluded/conditional categories. Replace the grep-based reverse check with a declarative three-way comparison. The `flags_excluded` field formally absorbs the allowlist from Phase 1.

**Why not Option 2:** AST extraction is language-dependent and doesn't add enough precision over grep for the current audit tool's complexity level.

**Why not Option 4:** Overlaps with existing Tier 2 round-trip test. Adding it as a separate tier creates four checks where three suffice.

**Why not Option 5:** Elegant in theory but introduces a runtime dependency between tools and loses the ability to audit the template as a reviewable artifact. The declared manifest (Option 3) achieves the same coverage while keeping the tools independently deployable.

### The Flag Alias Problem

When the repair tool accepts both `--dry-run` and `-n` (short alias), and the audit template uses `--dry-run`, the reverse check must recognize that `-n` in the known set and `--dry-run` in the template refer to the same flag.

The `--enumerate-args` output should include aliases:

```json
{
  "flags": {
    "--dry-run": {"required": false, "takes_value": false, "aliases": ["-n"]},
    "--output-format": {"required": false, "takes_value": true, "aliases": ["-f"]},
    "--verbose": {"required": false, "takes_value": false, "aliases": ["-v"]}
  }
}
```

The reverse check expands the known set to include all aliases:

```bash
# Build expanded known set (flags + all aliases)
KNOWN_EXPANDED=$(make repair-suppression-ref --enumerate-args | \
  jq -r '.flags | to_entries[] | ([.key] + (.value.aliases // [])) | .[]' | sort -u)

for flag in $TEMPLATE_FLAGS; do
  if ! echo "$KNOWN_EXPANDED" | grep -qx "$flag"; then
    echo "❌ PHANTOM FLAG: $flag not recognized (checked aliases)"
    exit 1
  fi
done
```

This handles the common case where the audit template uses the long form and the repair tool primarily exposes the long form. Edge case: the audit template uses the SHORT form (`-n`) which appears in the expanded set. Both directions work.

**Alias collision edge case:** Two different flags with overlapping aliases. `--dry-run` has alias `-n`, and a new `--no-stage` has alias `-n`. The `--enumerate-args` output should refuse to enumerate at all in this case — flag alias collision is a bug in the repair tool, not a problem for the reverse check to handle.

### The Test-Only Flag Suppression

Some flags in the audit tool's source aren't part of the command template at all — they're in test fixtures, documentation strings, or conditional logic that only fires in CI mode. The reverse check's grep picks them up as phantom flags.

**Three suppression strategies:**

**Strategy A: Allowlist file (Phase 1).** A JSON file (`l10n/tier1.5-phantom-allowlist.json`) lists flags known to appear in the source but NOT in generated commands. The reverse check skips these. Simple, requires manual maintenance.

**Strategy B: Code annotation (Phase 1 alternative).** Special comments in the audit tool's source mark regions that should be excluded from grep:

```python
# tier1.5-ignore-start
test_command = f"make repair-suppression-ref --dry-run --verbose KEY=test SURFACE=test"
# tier1.5-ignore-end
```

The grep command is modified to exclude lines between these markers. This is more precise than an allowlist (scoped to specific lines, not flags) but requires modifying the source code.

**Strategy C: Declared exclusions (Phase 2 — Option 3).** The `flags_excluded` category in `--enumerate-template-flags` formally declares which flags the audit tool intentionally does NOT include in generated commands and why. The reverse check uses this as the suppression source instead of a separate allowlist.

**Recommendation:** Strategy A for Phase 1 (minimal ceremony), migrating to Strategy C when Phase 2 ships. Strategy B is avoided because code annotations are a maintenance smell — they couple CI behavior to inline comments, which is the kind of invisible dependency that causes confusion during refactors.

---

## The `--enumerate-args` as Source of Truth

The reverse check elevates `--enumerate-args` from "a CI comparison input" to "the canonical definition of what the repair tool accepts." This has implications:

**Completeness obligation.** If `--enumerate-args` is the source of truth for what flags exist, it MUST include EVERY flag — including internal/debug/test-only flags. If `--verbose` exists in the parser but not in the enumeration, the reverse check sees `--verbose` in the audit template, checks the known set, finds it missing, and reports a phantom. But `--verbose` isn't a phantom — it's a real flag that wasn't enumerated.

**Two solutions to the completeness obligation:**

1. **Total enumeration.** `--enumerate-args` lists every flag, including debug/internal ones. A separate field (`"internal": true`) marks flags not intended for external use. The reverse check sees `--verbose` in the known set and passes.

2. **Selective enumeration with escape hatch.** `--enumerate-args` lists only "public" flags. The reverse check consults the allowlist for flags present in the audit source but not in the enumeration. This is Phase 1's Strategy A — the allowlist IS the escape hatch for non-enumerated flags.

**Recommendation: Total enumeration.** The enumeration should be exhaustive. The `internal` marker keeps the "what should the audit tool include?" question separate from "what does the repair tool accept?" These are different questions with different answers, and mixing them in a single incomplete enumeration creates ambiguity.

Updated `--enumerate-args` schema:

```json
{
  "schema_version": 3,
  "positional_keywords": ["KEY", "SURFACE"],
  "flags": {
    "--dry-run": {
      "required": false, "takes_value": false,
      "aliases": ["-n"],
      "internal": false,
      "description": "Show what would be repaired"
    },
    "--verbose": {
      "required": false, "takes_value": false,
      "aliases": ["-v"],
      "internal": true,
      "description": "Enable debug logging (not for external use)"
    },
    "--enumerate-args": {
      "required": false, "takes_value": false,
      "aliases": [],
      "internal": true,
      "description": "Dump accepted arguments as JSON"
    }
  }
}
```

Now the reverse check can distinguish:
- Flag in template AND in known set → OK
- Flag in template AND in known set but marked `internal` → Warning: "audit template references internal flag `--verbose`; generated commands include a debug flag"
- Flag in template AND NOT in known set → Error: phantom flag
- Flag NOT in template AND in known set → OK (flag exists, audit chose not to include it)
- Flag NOT in template AND in known set AND required → Error (forward check already catches this)

---

## Player Journeys

### Journey: Dev, 24, Junior Engineer — Six Weeks After The Original Fix

**Context:** Dev shipped the original reverse grep check (Option 1) six weeks ago. The check has caught two genuine phantom flags in PRs. But today it fires on Aarav's PR that adds documentation to the audit tool, and the false positive burns 20 minutes of Aarav's time.

**Minute 0:00 — The False Positive**

Aarav opens PR #947: "Add help text and usage examples to generate-audit.py." No changes to the actual command generation logic. He added a docstring:

```python
def generate_repair_command(key, surface, **kwargs):
    """Generate a repair command for the given suppression.

    Example:
        >>> generate_repair_command("toast.dismiss", "settings_modal")
        'make repair-suppression-ref KEY=toast.dismiss SURFACE=settings_modal --validate-budget'

    Note: --verbose and --enumerate-args are debug flags — never
    include them in generated commands.
    """
```

CI fires: `❌ PHANTOM FLAG: audit template includes --enumerate-args but repair tool doesn't accept it`. The grep picked up `--enumerate-args` from the docstring's prose. Aarav stares at the error. He KNOWS he didn't change the template. He reads the Tier 1.5 script, sees the grep, understands the false positive.

**What Aarav sees on screen:** The GitHub Actions log, monospace on a white background. The red `❌` sits at the top of the Tier 1.5 section. Below it: `PHANTOM FLAG: --enumerate-args`. Aarav's eye tracks to the right — no file/line reference because grep matched across the whole source. He opens `generate-audit.py`, Ctrl+F for `--enumerate-args`, finds it in the docstring. He exhales — frustration, not confusion. He knows the system and knows this is a false positive.

**Minute 0:05 — The Allowlist Fix**

Aarav opens `l10n/tier1.5-phantom-allowlist.json`:

```json
{
  "allowed_non_template_flags": {
    "--verbose": "Referenced in help text string",
    "--validate-budget": "Referenced in docstring example (historical)"
  }
}
```

He adds `--enumerate-args`:

```json
{
  "allowed_non_template_flags": {
    "--verbose": "Referenced in help text string",
    "--validate-budget": "Referenced in docstring example (historical)",
    "--enumerate-args": "Referenced in docstring note about debug flags"
  }
}
```

Pushes. Green. But Aarav feels the weight of it — the allowlist is growing. Three entries for a 6-week-old check. At this rate, a year from now the allowlist will have 15 entries and nobody will remember which ones are still relevant.

**Minute 0:15 — The Conversation With Dev**

Aarav messages Dev: "The phantom check is good but grep is too noisy. We should move to the declared manifest approach (Option 3). I don't want to maintain a growing allowlist."

Dev checks the original design doc. Reads the Phase 1 → Phase 2 migration trigger: "when false positives exceed 3/quarter." They're at 3 in 6 weeks. The trigger is hit.

**Minute 0:20 — Planning the Migration**

Dev files a ticket: "Migrate Tier 1.5 reverse check from grep + allowlist to `--enumerate-template-flags` manifest." The ticket references this aspect and the design doc. Estimated work: 2 hours for the flag, 1 hour for the three-way comparison script, 1 hour for tests. Ship target: next sprint.

Aarav's PR merges with the allowlist update. The false positive is suppressed. The systemic fix is planned.

**UI Annotations:**
- The allowlist file appears in PR diffs as a small JSON change. Reviewers see "oh, another entry" and pattern-match that the allowlist is growing. This visibility is intentional — the allowlist's growth IS the signal that Phase 2 is needed.
- The `PHANTOM FLAG` error message does NOT include the line number where grep matched. This is a deliberate omission in the original fix (Dev was solving for speed, not ergonomics). Adding source location to the error message is an improvement for Phase 2.
- The conversation between Aarav and Dev happens in Slack, not in the PR comments. The decision to migrate is an architectural decision, not a code review comment. It lives in the ticket tracker, not the PR.

---

### Journey: Margot, 33, L10n Lead — The Conditional Flag Discovery

**Context:** Margot is implementing version-gated repair commands. When the repair tool's `schema_version` is ≥ 3, generated commands should include `--strategy=conservative`. When < 3, they should not. This is a new code path in the audit tool that conditionally includes a flag.

**Minute 0:00 — Writing the Conditional Logic**

Margot adds to `generate_repair_command()`:

```python
def generate_repair_command(key, surface, schema_version, **kwargs):
    cmd = f"make repair-suppression-ref KEY={quote(key)} SURFACE={quote(surface)}"
    if schema_version >= 3:
        cmd += " --strategy=conservative"
    cmd += " --validate-only"
    return cmd
```

She runs the existing Tier 1.5 check locally. The forward check passes (`--strategy` is optional, not required, so its absence from the template for schema_version < 3 is fine). The reverse check — the grep — scans the source, finds `--strategy`, checks the known set, finds it. Pass.

But Margot realizes: the reverse check just verified that `--strategy` EXISTS in the repair tool. It didn't verify that the VERSION GATE is correct. If she'd written `if schema_version >= 2` instead of `>= 3`, the check wouldn't catch it. The condition is wrong, but the flag is real. This is a semantic correctness issue that no static flag check can catch — it requires the round-trip test (Tier 2).

**Minute 0:10 — Writing the Round-Trip Fixture**

Margot adds a new fixture to the nightly round-trip test:

```json
{
  "name": "version-gated strategy flag",
  "suppression": {"key": "test.versioned", "review_trigger": {"surface": "old.name"}},
  "scenarios": [
    {"schema_version": 2, "expected_command_excludes": ["--strategy"]},
    {"schema_version": 3, "expected_command_includes": ["--strategy=conservative"]}
  ]
}
```

The nightly test now generates commands for both schema versions and validates that `--strategy` appears only in the v3 command.

**Minute 0:20 — The `flags_conditional` Realization**

Margot reads the Option 3 design for `--enumerate-template-flags`. The `flags_conditional` field is exactly what she needs:

```json
"flags_conditional": {
  "--strategy": "included when repair_command_version >= 3"
}
```

Without this field, the declared manifest can only say "yes" or "no" — is this flag in the template? The conditional field says "sometimes, under these conditions." This is the difference between a binary set and a predicated set.

She adds a note to Dev's migration ticket: "The `flags_conditional` field is now a real need, not a hypothetical. My version-gated strategy flag is the first use case."

**What Margot sees on screen:** Her terminal, split vertically. Left: the audit tool source with the conditional. Right: the nightly test fixture in JSON. The two artifacts must agree on the condition (`schema_version >= 3`). There is no automated check that they agree — this is a review-dependent correctness guarantee. She adds a comment in both files: `// Gate: schema_version >= 3 (must match test fixture scenario)`.

**Minute 0:30 — PR Opens, CI Passes**

All tiers pass. The forward check sees all required flags present. The reverse check sees `--strategy` in the known set (it's a real flag). The round-trip test hasn't run yet (nightly). Margot's PR merges.

That night, the round-trip test passes both scenarios. The system is correct.

**UI Annotations:**
- The comment `// Gate: schema_version >= 3 (must match test fixture scenario)` is a maintenance risk — comments rot. But Margot knows that no automated check can verify the condition, so the comment is the best available option. The Phase 2 `flags_conditional` field will eventually replace this with a machine-readable declaration.
- The round-trip test output for versioned scenarios shows:
  ```
  ✅ test.versioned @ schema_version=2: command excludes --strategy
  ✅ test.versioned @ schema_version=3: command includes --strategy=conservative
  ```
  Both lines appear in the nightly log. A developer scanning for failures sees green checks and moves on. A developer investigating the strategy flag specifically can search for "strategy" in the log.

---

### Journey: Priya, 38, L10n Maintainer — The `-f` Alias That Broke The Check

**Context:** A month after Dev shipped the Phase 1 reverse check. Priya uses the short alias `-f json` instead of `--output-format=json` in a one-off audit command she runs locally. She wonders: would the reverse check catch it if the audit template used `-f`?

**Minute 0:00 — The Experiment**

Priya temporarily changes the audit tool's template to use `-f json` instead of `--output-format=json`. She runs the Tier 1.5 check locally:

```
❌ PHANTOM FLAG: audit template includes -f but repair tool doesn't accept it
```

False positive. `-f` is a valid alias for `--output-format`, but the reverse check doesn't know about aliases. It sees `-f` in the template, checks the known set (`--output-format`, `--dry-run`, `--verbose`, ...), doesn't find `-f`, reports phantom.

**Minute 0:05 — Reading the Design Doc**

Priya opens this design doc. Reads the "Flag Alias Problem" section. The fix is clear: the `--enumerate-args` output needs an `aliases` field, and the reverse check needs to expand the known set to include aliases.

She checks the current `--enumerate-args` output:

```json
{
  "schema_version": 2,
  "flags": {
    "--output-format": {"required": false, "takes_value": true}
  }
}
```

No `aliases` field. She adds it:

```json
{
  "schema_version": 2,
  "flags": {
    "--output-format": {"required": false, "takes_value": true, "aliases": ["-f"]},
    "--dry-run": {"required": false, "takes_value": false, "aliases": ["-n"]},
    "--verbose": {"required": false, "takes_value": false, "aliases": ["-v"]}
  }
}
```

She updates the reverse check to expand the known set:

```bash
KNOWN_EXPANDED=$(make repair-suppression-ref --enumerate-args | \
  jq -r '.flags | to_entries[] | ([.key] + (.value.aliases // [])) | .[]' | sort -u)
```

Re-runs. The check passes — `-f` is now in the expanded known set.

**What Priya sees on screen:** Her terminal in iTerm2, dark Solarized theme. The `❌ PHANTOM FLAG` message is red on dark blue. She types the `jq` pipeline, sees the expanded set print out: `--dry-run`, `--output-format`, `--verbose`, `-f`, `-n`, `-v`. The aliases are interleaved alphabetically with the long forms. She nods — the expanded set is comprehensive.

**Minute 0:15 — The Schema Version Question**

Wait — she added `aliases` to the `--enumerate-args` output. That's a schema change to the ENUMERATION ITSELF. Does she need to bump the repair tool's `SCHEMA_VERSION`? She checks the parent's version bump protocol:

> New optional field in enumeration output → Non-breaking. The field is additive; consumers that don't read `aliases` continue to work.

No version bump needed. She updates the committed manifest to include the aliases. The Tier 1 manifest diff fires:

```
ℹ SCHEMA CHANGE DETECTED (NON-BREAKING)

  Changes:
    ~ --output-format: added "aliases": ["-f"]
    ~ --dry-run: added "aliases": ["-n"]
    ~ --verbose: added "aliases": ["-v"]

  Classification: NON-BREAKING (additive field)
  No version bump required.
```

**Minute 0:20 — PR Merges**

Priya opens a PR with three changes: (1) aliases in `--enumerate-args`, (2) expanded known set in Tier 1.5 reverse check, (3) updated manifest. The PR description links to this aspect. All checks green. Merges.

She reverts her local template change (back to `--output-format=json`). The experiment is over; the fix is permanent.

**UI Annotations:**
- The manifest diff showing `~ --output-format: added "aliases": ["-f"]` uses `~` (modified) instead of `+` (added) because the flag entry itself isn't new — a field within it was added. This three-symbol vocabulary (`+` added, `-` removed, `~` modified) appears throughout the drift detector's output.
- The Tier 1 `ℹ` note is the ONLY CI output for this PR. Tier 1.5 passes silently. Tier 2 (nightly) will pass later. The CI log for a clean PR is a single info box — minimal visual weight, maximum signal-to-noise.

---

## Sensory Description

### The Bidirectional Check CI Output

When the reverse check fires on a phantom flag, the GitHub Actions log adds a new section below the existing forward check:

```
──── Tier 1.5: Template Completeness ────

  Forward check (required flags):
    ✅ --validate-only     present in template
    ✅ --no-stage          present in template

  Reverse check (phantom flags):
    ✅ --dry-run            known (--dry-run)
    ✅ --validate-only      known (--validate-only)
    ✅ --output-format      known (--output-format)
    ❌ --validate-budget    NOT KNOWN — phantom flag

  ❌ PHANTOM FLAG DETECTED

    The audit tool's command template includes --validate-budget,
    but the repair tool does not accept this flag.

    Generated commands will be rejected with:
      error: unknown flag '--validate-budget'

    To fix:
      1. Remove --validate-budget from scripts/generate-audit.py
         (search for: generate_repair_command)
      2. If this flag was intentionally kept, add it to
         l10n/tier1.5-phantom-allowlist.json with a reason
```

The visual structure: two sub-sections (Forward / Reverse), each with per-flag status lines. The forward section shows green checks for each required flag found. The reverse section shows green checks for each template flag matched to a known flag, with the matched name in parentheses — `known (--dry-run)` tells the developer which repair-tool flag matched. The red `❌` breaks the pattern of green lines. The developer's eye goes straight to the red entry.

The parenthetical `known (--dry-run)` serves a second purpose: when aliases are in play, it shows the resolution. If the template uses `-n` and the known flag is `--dry-run`, the line reads: `✅ -n    known (--dry-run, alias)`. The word "alias" in parentheses tells the developer the match was via alias, not direct name.

### The Allowlist in PR Review

When a developer adds an entry to the allowlist, the PR diff shows:

```diff
  {
    "allowed_non_template_flags": {
      "--verbose": "Referenced in help text string",
-     "--validate-budget": "Referenced in docstring example (historical)"
+     "--validate-budget": "Referenced in docstring example (historical)",
+     "--enumerate-args": "Referenced in docstring note about debug flags"
    }
  }
```

The diff is small — a comma on one line, a new entry on the next. But reviewers pattern-match the growing file. Three entries after six weeks feels manageable. Eight entries after three months triggers the "this is getting long" instinct. The allowlist's growth rate IS the migration signal. It's a thermometer, not just a list.

### The Three-Way Comparison (Phase 2)

When Phase 2 ships and the `--enumerate-template-flags` manifest is live, the Tier 1.5 output becomes richer:

```
──── Tier 1.5: Template Completeness ────

  Repair tool known flags: 8
  Audit template declared: 5 included, 2 excluded, 1 conditional
  Coverage: 8/8 (all flags accounted for)

  Included:   --dry-run, --validate-only, --output-format, --no-stage, --confirm-surface
  Excluded:   --verbose (debug), --enumerate-args (introspection)
  Conditional: --strategy (when schema_version >= 3)

  Forward:  ✅ all required flags included
  Reverse:  ✅ no phantom flags
  Orphans:  ✅ all known flags categorized
```

The "Coverage: 8/8" line is the key innovation. It tells the developer that every flag in the repair tool is accounted for — either included, excluded, or conditional. An "orphan" is a flag that exists in the repair tool but appears in none of the three categories. Orphans are the new phantom: flags that nobody decided about.

The visual hierarchy: coverage number at top (summary), three category lists in the middle (detail), three pass/fail checks at bottom (verdict). Top-down reading: "coverage is complete, here's how, and here are the results." The developer can stop at the first line if all is well.

### The TikTok Clip

Split screen. Left: a developer removes a flag from a repair tool. Commits. Left panel shows `✅ Tier 1: Schema OK`. Right panel: the audit tool generates a command with the removed flag. Terminal shows `error: unknown flag`. Red flash.

Cut to: same scenario WITH the phantom check. The developer removes the flag. Commits. `✅ Tier 1` appears. Then `❌ Tier 1.5: PHANTOM FLAG`. The developer reads the message, removes the flag from the template, pushes. `✅ Tier 1.5`. Green flash.

Caption: "Bidirectional > unidirectional."

---

## Strengths

1. **Closes the specific blind spot identified in the parent.** Dev's journey revealed the phantom flag problem; this aspect is the complete solution. The problem is well-understood, the fix is targeted.

2. **Phased implementation reduces risk.** Phase 1 (grep + allowlist) ships in one PR. Phase 2 (declared manifest) ships when the allowlist grows too large. Each phase is independently valuable.

3. **Alias handling prevents a class of false positives.** By expanding the known set to include aliases, the check handles both long-form and short-form flag usage in the template. This is a real-world concern (developers use short forms for convenience).

4. **The `internal` flag marker solves the completeness obligation.** Total enumeration with an `internal` marker means the known set is exhaustive, and the reverse check can distinguish "phantom" (truly unknown) from "internal" (known but not for external use).

5. **The allowlist's growth rate is itself a signal.** The allowlist isn't just a suppression mechanism — its size over time tells the team when to invest in the Phase 2 migration. The maintenance burden IS the trigger.

## Weaknesses

1. **Phase 1 grep is inherently fragile.** String-matching flag patterns in source code will always produce false positives for comments, docstrings, test fixtures, and dynamically constructed flags. The allowlist is a band-aid, not a fix.

2. **Phase 2 doubles the human-maintenance surface.** The audit tool now has TWO things to maintain: the actual command template AND the `--enumerate-template-flags` declaration. These can drift, recreating the problem at a different level.

3. **Conditional flags are hard to verify statically.** `"--strategy": "included when schema_version >= 3"` is a human-readable string, not a machine-evaluable condition. The reverse check can verify the flag exists, but not that the condition is correct. Only the round-trip test (Tier 2) catches wrong conditions.

4. **The completeness obligation requires cultural buy-in.** Every new flag must be added to `--enumerate-args` AND categorized in `--enumerate-template-flags`. If a developer adds a flag to the parser but not to either enumeration, both the forward and reverse checks are blind to it. Co-location mitigates but doesn't eliminate this risk.

5. **The three-way comparison (Phase 2) is conceptually dense.** Forward check, reverse check, orphan check, included/excluded/conditional categories, alias expansion, internal markers — a new developer encountering this system for the first time faces a significant learning curve. The system is correct but not simple.

---

## Interaction Effects

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-b (Enumeration-to-parser consistency lint):** The phantom flag check assumes `--enumerate-args` is accurate. Aspect b verifies this assumption by checking that the enumeration matches the actual parser. Together, b provides the foundation (enumeration is correct) and a builds on it (template only references things in the correct enumeration). b is the inner consistency check; a is the cross-tool consistency check.

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-c (Round-trip test fixture versioning):** The round-trip test catches semantic phantoms that the static reverse check misses (wrong flag values, wrong version gates). Aspect c ensures the fixtures stay valid. The reverse check and the round-trip test are complementary — the reverse check is fast/static/name-level, the round-trip is slow/dynamic/semantic.

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-d (Drift detector for other tools):** The `--enumerate-template-flags` pattern (Option 3) generalizes to any tool that generates commands for another tool. `make fork-string` generates commands that `make repair-suppression-ref` might consume. `make rename-surface` generates commands that propagate to multiple tools. Each consumer-producer pair could benefit from a bidirectional completeness check.

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-e (CI tier ordering and skip logic):** The reverse check runs as part of Tier 1.5. If Tier 1 fails (manifest drift), should the reverse check still run? Argument for: the reverse check might find a phantom INDEPENDENTLY of the manifest drift, and the developer needs to fix both. Argument against: if the schema is in flux (Tier 1 failed), the reverse check's results are unreliable because the known set may be stale. Recommendation: skip reverse check if Tier 1 fails, run if Tier 1 passes. This is consistent with the parent's sequential model.

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-B (Eval injection hardening):** If `repair_command` becomes a structured object (per B's recommendation), the audit template no longer contains raw `--flag` strings — it contains structured `{"flag": "--validate-budget", "value": null}` entries. The grep-based reverse check (Phase 1) breaks completely on structured commands. Phase 2's declared manifest still works because it's metadata about the template, not parsing of the template. This interaction strengthens the case for Phase 2 migration.

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-C (PR comment rendering):** The bidirectional check results can be included in the PR comment. The "Forward: ✅ / Reverse: ✅ / Orphans: ✅" summary is compact enough for a PR comment. On failure, the specific phantom flag is highlighted in the comment with a code suggestion to remove it.

---

## Comparable Systems

### TypeScript's `strict` and `noUnusedLocals`

TypeScript's `--strict` enables all strictness checks. But `--noUnusedLocals` can flag variables that ARE used — by code in a different file that imports them. The false positive isn't about the flag being phantom; it's about the check's scope being too narrow. Similarly, the phantom flag check's scope (grep over source) is too narrow — it sees flags in comments and docstrings that aren't in the template. The fix in both cases is the same: narrower extraction (TypeScript: type-aware unused detection; Robot Uprising: AST or declared manifest).

### ESLint's `--no-eslintrc` + `--config`

ESLint has `--no-eslintrc` (ignore config files) and `--config` (use specific config). These flags interact: using `--config` without `--no-eslintrc` means BOTH the specified config AND the discovered config are applied. A user who thinks `--config` replaces the default is surprised. This is a semantic interaction that no flag-level check catches. The parallel: Robot Uprising's `--strategy=conservative` and `--dry-run` might interact semantically (does dry-run simulate the conservative strategy or skip strategy entirely?). Flag-level checks verify existence; round-trip tests verify behavior.

### Docker Compose's Service Reference Validation

Docker Compose validates that `depends_on: [service_name]` references an actually defined service. If `service_name` is removed from the compose file, Compose fails with "service not found." This is exactly the phantom reference problem — a reference to something that was removed. The Compose validator doesn't need an allowlist; it has the complete set of services from the file itself. Option 3's `--enumerate-template-flags` achieves the same: the complete set of flags from the repair tool, making phantom detection definitive.

### Terraform's `terraform validate` for Resource References

Terraform's `validate` command checks that all resource references point to defined resources. A `data.aws_vpc.main` reference in a module that no longer defines `aws_vpc.main` fails validation. Like Docker Compose, this is structural: the validator has the full graph. Unlike grep-based phantom detection, it can distinguish "reference in comment" from "reference in code." The AST-based approach (Option 2) mirrors Terraform's structural validation.

### npm's `peerDependencies` Completeness Check

npm warns when a package declares a `peerDependency` that the consuming package doesn't install. This is the forward check: "does the consumer have everything the package needs?" The reverse — "does the consumer install packages the package doesn't need?" — is NOT checked by npm. Unused dependencies are a different tool's job (`depcheck`). Robot Uprising's bidirectional check is equivalent to running BOTH npm's peer-dep check AND depcheck in a single pass.

---

## New Aspects Discovered

1. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i — Allowlist hygiene and expiry: when should allowlist entries be removed? A flag referenced in a docstring today might be removed from the docstring tomorrow, leaving a stale allowlist entry that suppresses future genuine phantoms; periodic audit of allowlist against current source; automated staleness detection**

2. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-ii — Semantic phantom detection beyond flag names: phantom flag VALUES (e.g., `--output-format=quiet` where `quiet` is no longer valid); extending the reverse check to validate not just flag existence but value validity; interaction with `--enumerate-args` value schemas; requires adding `valid_values` field to enumeration**

3. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-iii — `--enumerate-template-flags` version tracking: the audit tool's declared manifest needs its own version number (separate from the repair tool's schema version); version bump protocol for template manifest changes; who bumps when a flag moves from "included" to "excluded"?**

4. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-iv — Orphan flag as onboarding signal: when a new flag is added to the repair tool but not categorized in the audit's manifest, the "orphan" check fires; this is actually a GOOD onboarding moment — it forces the developer to make an explicit include/exclude/conditional decision about the flag for the audit context; the orphan check as mandatory design decision point**

5. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-v — Bidirectional completeness as a general pattern for tool-to-tool interfaces: abstracting the forward+reverse+orphan check into a reusable library for any pair of tools where one generates commands for the other; the `tool-interface-check` as a CI primitive; applicable beyond l10n to any CLI tool ecosystem**
