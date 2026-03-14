# Automated Schema Change Detection: The Schema Drift Detector

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i — CI check comparing the repair tool's argument parser against a recorded manifest; detects schema changes without a version bump; the "schema drift detector"

**Parent:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A — `repair_command_version` field for schema compatibility (established: Option A integer counter with SemVer migration path; version bump protocol defining what constitutes a breaking change; human-maintained version constant; Weakness #1 = developer can forget to bump; Weakness #4 = no automated detection)

**The gap this closes:** The parent's Weakness #1 is the central vulnerability: "The developer must remember to bump the version when making a breaking change. If they forget, the version field is wrong and consumers execute stale commands without warning." The parent's own mitigation suggestion: "a CI check that compares the argument parser's accepted arguments against a recorded manifest." This aspect IS that CI check — a machine that watches the human watching the machines.

---

## The Core Problem

The `repair_command_version` integer is a human-maintained assertion: "the current argument schema is version N." The schema itself — what arguments the tool accepts, their names, types, whether they're mandatory — lives in the argument parser code. The version number lives in a separate constant. Nothing connects them. A developer can:

1. Add a mandatory `--validate-budget` flag to the argument parser
2. Forget to bump `SCHEMA_VERSION` from 1 to 2
3. Commit, merge, deploy
4. Aarav's CI pipeline generates fresh audit JSON with `repair_command_version: "1"` (because the audit tool reads the unbumped constant)
5. The generated commands are missing `--validate-budget` (because the audit tool doesn't know the flag exists — it generates commands using the old template)
6. Consumers execute the stale commands → cryptic Make errors

Wait — step 5 reveals a subtlety. The schema drift isn't just about the version constant. The AUDIT TOOL also needs to be updated to include new flags in generated commands. So there are actually THREE things that must stay in sync:

- **The repair tool's argument parser** (what the tool accepts)
- **The audit tool's command template** (what commands the audit generates)
- **The version constant** (what version the audit stamps on those commands)

The drift detector must catch ALL three going out of sync, not just the version constant lagging behind the parser.

---

## The Five Design Options

### Option A: Help-Text Snapshot Diffing ("The --help Watcher")

The simplest approach: capture the repair tool's `--help` output as a committed snapshot file. A CI check runs `make repair-suppression-ref --help`, diffs it against the snapshot, and fails if they differ without a corresponding version bump.

**Implementation:**

```
l10n/
  repair-schema-manifest.txt    # committed snapshot of --help output
  repair-schema-version.txt     # committed copy of SCHEMA_VERSION constant
```

CI step:

```bash
#!/bin/bash
# .ci/check-schema-drift.sh

# Capture current --help output
CURRENT_HELP=$(make repair-suppression-ref --help 2>&1)
COMMITTED_HELP=$(cat l10n/repair-schema-manifest.txt)

# Capture current schema version
CURRENT_VERSION=$(make repair-suppression-ref --schema-version)
COMMITTED_VERSION=$(cat l10n/repair-schema-version.txt)

if [ "$CURRENT_HELP" != "$COMMITTED_HELP" ]; then
  if [ "$CURRENT_VERSION" = "$COMMITTED_VERSION" ]; then
    echo "❌ SCHEMA DRIFT DETECTED"
    echo ""
    echo "  The repair tool's --help output has changed, but SCHEMA_VERSION"
    echo "  is still at v$CURRENT_VERSION."
    echo ""
    echo "  Diff:"
    diff <(echo "$COMMITTED_HELP") <(echo "$CURRENT_HELP") --color=always
    echo ""
    echo "  If this is a breaking change:"
    echo "    1. Bump SCHEMA_VERSION in repair-suppression-ref.sh"
    echo "    2. Update l10n/repair-schema-manifest.txt:"
    echo "       make repair-suppression-ref --help > l10n/repair-schema-manifest.txt"
    echo "    3. Update l10n/repair-schema-version.txt:"
    echo "       make repair-suppression-ref --schema-version > l10n/repair-schema-version.txt"
    echo ""
    echo "  If this is NOT a breaking change (e.g., help text typo fix):"
    echo "    1. Update l10n/repair-schema-manifest.txt only (no version bump)"
    exit 1
  else
    # Version was bumped — check that the manifest was also updated
    if [ "$CURRENT_HELP" != "$(cat l10n/repair-schema-manifest.txt)" ]; then
      echo "⚠ Version bumped but manifest not updated."
      echo "  Run: make repair-suppression-ref --help > l10n/repair-schema-manifest.txt"
      exit 1
    fi
  fi
fi
```

**Strengths:**
- Zero dependencies. Uses `diff` and `cat`.
- Catches ANY change to the argument interface — new flags, renamed flags, removed flags, reordered flags, changed descriptions.
- The diff output tells the developer exactly what changed, not just that something changed.
- The snapshot file is human-readable and reviewable in PRs. A reviewer can see "oh, `--validate-budget` appeared in the manifest" and check whether the version was bumped.

**Weaknesses:**
- **Over-sensitive.** A typo fix in the help text ("suface" → "surface") triggers the check. The developer must update the manifest for non-breaking changes, which creates unnecessary noise.
- **Fragile to formatting.** If the help text generation library changes its whitespace or column width, the snapshot changes without any schema change. Word-wrapped help text is particularly unstable.
- **Doesn't distinguish breaking vs. non-breaking.** A new optional flag (non-breaking) looks the same as a renamed mandatory flag (breaking) in the diff. The developer must manually classify every detected change.
- **Doesn't catch audit tool drift.** If the repair tool adds `--validate-budget` and the version is bumped, but the audit tool's command template doesn't include the flag, this check passes — the schema and version are in sync, but the generated commands are wrong.

**When to use:** When the repair tool's `--help` output is stable, changes rarely, and the team prefers simplicity over precision.

### Option B: AST-Extracted Argument Manifest ("The Parser Watcher")

Parse the repair tool's source code to extract the argument definitions directly from the argument parser (argparse, getopt, custom parser). Compare the extracted definitions against a committed JSON manifest.

**Implementation:**

The extraction depends on the parser technology. For a bash script using getopt:

```python
# scripts/extract-repair-schema.py
import re
import json
import subprocess

# Run the tool with --help and parse structured output
# OR: parse the source code directly for getopt/getopts patterns

def extract_from_bash_source(filepath):
    """Extract argument schema from bash getopts/getopt calls."""
    with open(filepath) as f:
        source = f.read()

    schema = {"arguments": {}, "flags": {}}

    # Match KEY=value positional-keyword args
    for match in re.finditer(r'(\w+)="\$\{?\w+\}?"', source):
        arg_name = match.group(1)
        schema["arguments"][arg_name] = {"type": "keyword", "required": True}

    # Match --flag patterns in getopt string
    getopt_match = re.search(r'getopt.*?--\s*"([^"]+)"', source)
    if getopt_match:
        for flag in getopt_match.group(1).split(','):
            flag = flag.strip().rstrip(':')
            has_value = flag.endswith(':')
            schema["flags"][f"--{flag}"] = {
                "takes_value": has_value,
                "required": flag in source  # rough heuristic
            }

    return schema

schema = extract_from_bash_source("scripts/repair-suppression-ref.sh")
print(json.dumps(schema, indent=2))
```

The committed manifest:

```json
{
  "schema_version": 2,
  "extracted_at": "2026-03-14T10:00:00Z",
  "arguments": {
    "KEY": {"type": "keyword", "required": true},
    "SURFACE": {"type": "keyword", "required": true}
  },
  "flags": {
    "--confirm-surface": {"takes_value": true, "required": false},
    "--dry-run": {"takes_value": false, "required": false},
    "--validate-only": {"takes_value": false, "required": false},
    "--validate-budget": {"takes_value": false, "required": true},
    "--output-format": {"takes_value": true, "required": false},
    "--no-stage": {"takes_value": false, "required": false}
  }
}
```

CI step:

```bash
# Extract current schema from source
python3 scripts/extract-repair-schema.py > /tmp/current-schema.json

# Compare against committed manifest
CURRENT=$(jq -S . /tmp/current-schema.json)
COMMITTED=$(jq -S . l10n/repair-schema-manifest.json)

if [ "$CURRENT" != "$COMMITTED" ]; then
  CURRENT_VERSION=$(jq -r '.schema_version' /tmp/current-schema.json)
  COMMITTED_VERSION=$(jq -r '.schema_version' l10n/repair-schema-manifest.json)

  if [ "$CURRENT_VERSION" = "$COMMITTED_VERSION" ]; then
    echo "❌ SCHEMA DRIFT: arguments changed but schema_version unchanged"
    # Show structured diff
    diff <(echo "$COMMITTED") <(echo "$CURRENT") --color=always
    exit 1
  fi
fi
```

**Strengths:**
- **Semantic comparison.** Compares argument names, types, and required-ness — not help text formatting. A typo fix doesn't trigger the check.
- **Machine-readable diff.** The structured manifest lets CI identify EXACTLY what changed: "new flag `--validate-budget` (required)" vs. "renamed `SURFACE` to `TARGET_SURFACE`."
- **Can auto-classify breaking vs. non-breaking.** New optional flag = non-breaking (per the parent's version bump protocol). Renamed argument = breaking. The CI check can apply the classification rules automatically:

```python
def classify_change(old_manifest, new_manifest):
    added_required = [f for f in new_manifest["flags"]
                      if f not in old_manifest["flags"]
                      and new_manifest["flags"][f]["required"]]
    removed = [f for f in old_manifest["flags"]
               if f not in new_manifest["flags"]]
    renamed_args = [a for a in old_manifest["arguments"]
                    if a not in new_manifest["arguments"]]

    breaking = bool(added_required or removed or renamed_args)
    return {"breaking": breaking, "changes": {...}}
```

- **Extensible.** Can also check whether the audit tool's command template includes all required flags (closing the three-way sync gap).

**Weaknesses:**
- **Fragile extraction.** Parsing argument schemas from source code is notoriously unreliable. Bash getopts, Python argparse, and custom parsers all have different patterns. The extractor must be maintained alongside the parser.
- **Language-dependent.** If the repair tool is rewritten from bash to Python, the extractor breaks.
- **False sense of precision.** The extracted schema might miss dynamically-added arguments (e.g., plugins, conditional flags). The manifest looks complete but isn't.
- **More moving parts.** A Python extraction script, a JSON manifest, a comparison script, and classification rules — four artifacts to maintain instead of one snapshot file.

**When to use:** When the repair tool's argument parser is well-structured (argparse, Click, etc.) and the team has capacity to maintain the extraction script.

### Option C: Argument Manifest as Source of Truth ("The Schema-First Approach")

Invert the relationship: instead of extracting the schema FROM the parser, GENERATE the parser FROM the schema. The JSON manifest becomes the canonical definition, and the argument parser is derived from it.

**Implementation:**

```json
// l10n/repair-schema.json (THE source of truth)
{
  "schema_version": 2,
  "arguments": {
    "KEY": {"type": "string", "required": true, "help": "The string key to repair"},
    "SURFACE": {"type": "string", "required": true, "help": "The target surface name"}
  },
  "flags": {
    "--confirm-surface": {"type": "string", "required": false, "help": "Explicit surface confirmation"},
    "--dry-run": {"type": "boolean", "required": false, "help": "Show what would be repaired"},
    "--validate-budget": {"type": "boolean", "required": true, "help": "Validate budget after repair"}
  }
}
```

The repair tool reads this schema at startup and configures its argument parser:

```python
# repair-suppression-ref.py
import json
import argparse

with open("l10n/repair-schema.json") as f:
    schema = json.load(f)

parser = argparse.ArgumentParser(description="Repair stale suppression references")
for name, config in schema["arguments"].items():
    parser.add_argument(name, required=config["required"], help=config["help"])
for flag, config in schema["flags"].items():
    if config["type"] == "boolean":
        parser.add_argument(flag, action="store_true", help=config["help"])
    else:
        parser.add_argument(flag, required=config.get("required", False), help=config["help"])
```

The audit tool also reads this schema to generate commands:

```python
# audit-tool.py
with open("l10n/repair-schema.json") as f:
    schema = json.load(f)

def generate_repair_command(key, surface, **kwargs):
    cmd = f"make repair-suppression-ref KEY={quote(key)} SURFACE={quote(surface)}"
    for flag, config in schema["flags"].items():
        if config["required"]:
            cmd += f" {flag}"
    return cmd
```

Now the version constant, the argument parser, and the audit tool's command template ALL derive from the same JSON file. Schema drift is structurally impossible.

**Strengths:**
- **Drift-proof by construction.** The three-way sync problem vanishes because there's only one source. Changing the schema in the JSON file automatically changes the parser AND the generated commands AND the version.
- **No CI check needed.** The drift detector becomes unnecessary — you can't have drift if there's only one source. The CI check that was needed reduces to "does the schema file parse correctly?"
- **Self-documenting.** The schema file IS the documentation. `--help` is generated from it. The audit tool's command templates are generated from it. Everything is derived.

**Weaknesses:**
- **Architectural inversion.** This requires rewriting the repair tool to use schema-driven argument parsing instead of hand-coded parsing. That's a significant refactor.
- **Schema language limitations.** Complex argument validation (e.g., "SURFACE is required unless --auto-lookup is present") is hard to express in a flat JSON schema. The schema becomes a mini-DSL that itself needs documentation and tooling.
- **Startup cost.** The tool must parse JSON before parsing arguments. For a CLI tool that should start in <100ms, this adds latency. In practice JSON parsing is ~1ms, so this is negligible — but it's a philosophical shift toward "configuration over code."
- **Loss of IDE support.** Developers can't ctrl-click an argument definition to see its parser — the parser is generated at runtime. The indirection makes the tool harder to debug.

**When to use:** For greenfield tooling where the schema can be designed schema-first from the start. Not recommended as a retrofit.

### Option D: Runtime Argument Enumeration ("The --enumerate-args Flag")

Add a flag to the repair tool that dumps its accepted arguments in a structured format. The CI check calls this flag and compares the output against the committed manifest. No source parsing needed.

**Implementation:**

```bash
# In repair-suppression-ref.sh
if [ "$1" = "--enumerate-args" ]; then
  cat <<'EOF'
{
  "schema_version": 2,
  "positional_keywords": ["KEY", "SURFACE"],
  "flags": {
    "--confirm-surface": {"required": false, "takes_value": true},
    "--dry-run": {"required": false, "takes_value": false},
    "--validate-only": {"required": false, "takes_value": false},
    "--validate-budget": {"required": true, "takes_value": false},
    "--output-format": {"required": false, "takes_value": true},
    "--no-stage": {"required": false, "takes_value": false},
    "--no-immediate-check": {"required": false, "takes_value": false}
  }
}
EOF
  exit 0
fi
```

CI step:

```bash
# Capture runtime enumeration
make repair-suppression-ref --enumerate-args > /tmp/current-args.json

# Compare against committed manifest
if ! diff -q <(jq -S . /tmp/current-args.json) <(jq -S . l10n/repair-schema-manifest.json) >/dev/null; then
  # Schema changed — check version
  CURRENT_V=$(jq -r '.schema_version' /tmp/current-args.json)
  MANIFEST_V=$(jq -r '.schema_version' l10n/repair-schema-manifest.json)

  if [ "$CURRENT_V" = "$MANIFEST_V" ]; then
    echo "❌ SCHEMA DRIFT: --enumerate-args output changed but schema_version unchanged"
    echo ""
    echo "Changed fields:"
    diff <(jq -S . l10n/repair-schema-manifest.json) <(jq -S . /tmp/current-args.json) --color=always
    echo ""
    echo "If breaking: bump schema_version in the tool"
    echo "Then: make repair-suppression-ref --enumerate-args > l10n/repair-schema-manifest.json"
    exit 1
  else
    echo "✅ Schema changed and version bumped (v$MANIFEST_V → v$CURRENT_V)"
    echo "Update manifest: make repair-suppression-ref --enumerate-args > l10n/repair-schema-manifest.json"
    exit 1  # Still fail — manifest must be committed too
  fi
fi
```

**Strengths:**
- **Language-agnostic.** The `--enumerate-args` flag outputs JSON regardless of how the parser is implemented internally. Works with bash, Python, Go, anything.
- **Runtime-accurate.** The enumeration reflects the actual accepted arguments at runtime, including dynamic/conditional arguments that source-code parsing would miss.
- **No fragile parsing.** The developer maintains the `--enumerate-args` output alongside the parser — adding a flag means adding it to both the parser and the enumeration. But unlike Option A's --help, the output is structured JSON, not formatted text.
- **Separation of concerns.** The manifest is generated by the tool itself, not by an external extraction script. The tool owns its own schema declaration.

**Weaknesses:**
- **Same human-maintenance problem as the version.** The developer must update `--enumerate-args` output when they add a flag. If they forget, the drift detector doesn't fire (because the enumeration matches the manifest — both are stale). This is the same failure mode as forgetting to bump the version, just moved to a different location.
- **However**: the `--enumerate-args` output sits INSIDE the repair tool source, close to the argument parser code. A developer adding a flag to the parser is more likely to see and update the nearby enumeration than to bump a version constant 50 lines away. Proximity reduces forgetting.
- **Redundancy with --help.** The tool now has two self-describing flags: `--help` (human-readable) and `--enumerate-args` (machine-readable). They must stay in sync with each other AND with the parser.
- **Still doesn't catch audit tool drift.** If the repair tool adds a flag and updates its enumeration, but the audit tool's command template doesn't include the new flag, the generated commands are still wrong. Need a cross-tool check.

**When to use:** When the repair tool can accommodate an additional introspection flag and the team wants a language-agnostic, runtime-accurate check.

### Option E: Cross-Tool Integration Test ("The Round-Trip Verifier")

Instead of comparing schemas/manifests, run an integration test that exercises the full pipeline: generate a repair command via the audit tool, execute it against the repair tool, and verify it succeeds. If the audit tool generates a command that the repair tool rejects, the test fails.

**Implementation:**

```bash
# .ci/test-repair-roundtrip.sh

# Set up a test suppression with a known stale surface reference
echo '{"key": "test.roundtrip", "review_trigger": {"surface": "old.surface.name"}}' > /tmp/test-suppression.json

# Run audit tool to generate a repair command for this suppression
AUDIT_OUTPUT=$(make l10n-suppression-audit --input=/tmp/test-suppression.json --output-format=json)
REPAIR_CMD=$(echo "$AUDIT_OUTPUT" | jq -r '.suppressions[0].repair_command')

if [ -z "$REPAIR_CMD" ] || [ "$REPAIR_CMD" = "null" ]; then
  echo "⚠ Audit tool did not generate a repair command for test case"
  exit 1
fi

# Execute the repair command in dry-run mode
echo "Round-trip test: executing generated command in dry-run mode..."
eval "$REPAIR_CMD --dry-run" 2>/tmp/repair-stderr.txt
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "❌ ROUND-TRIP FAILURE"
  echo ""
  echo "  The audit tool generated a command that the repair tool rejected."
  echo ""
  echo "  Generated command: $REPAIR_CMD --dry-run"
  echo "  Exit code: $EXIT_CODE"
  echo "  Stderr:"
  cat /tmp/repair-stderr.txt
  echo ""
  echo "  Likely causes:"
  echo "    - Repair tool added/renamed a mandatory argument"
  echo "    - Audit tool's command template is out of date"
  echo "    - Schema version not bumped"
  exit 1
fi

echo "✅ Round-trip test passed: audit-generated command is valid"
```

**Strengths:**
- **Catches ALL three drift types.** Tests the actual pipeline, not a proxy. If the repair tool's parser changed, the command fails. If the audit tool's template is wrong, the command fails. If the version is wrong, the version check in the repair tool fails. One test, three coverage areas.
- **No manifests, no snapshots, no extraction scripts.** The round-trip test IS the specification — if the pipeline works end-to-end, the schema is in sync.
- **Catches semantic drift.** A flag might be syntactically accepted but semantically wrong (e.g., the audit tool passes `--validate-budget` but the repair tool now expects `--validate-budget=strict`). Source analysis misses this; round-trip testing catches it.
- **Minimal maintenance.** The test doesn't need to know what arguments exist. It just generates and executes. When arguments change, the test catches the breakage without being updated itself.

**Weaknesses:**
- **Requires test fixtures.** The audit tool needs a runnable test case (a synthetic suppression with a stale reference). Creating and maintaining this fixture is nontrivial.
- **Slow for CI.** The round-trip invokes two CLI tools and potentially touches the filesystem. Compared to a `diff` of two snapshot files (Option A, <100ms), this might take 5-10 seconds. Acceptable for nightly CI, heavy for PR checks.
- **Doesn't catch non-breaking drift.** If the repair tool adds an optional flag that the audit could include for better results but doesn't, the round-trip still passes — the command works, it's just suboptimal. The test proves correctness but not completeness.
- **Eval risk.** The test uses `eval` on a generated command string. In CI this is acceptable (the command comes from trusted code), but it echoes the eval-injection concern from sibling aspect 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-B.

**When to use:** As a complement to any of Options A–D. The round-trip test is the integration layer; the manifest check is the unit layer. Both are needed.

---

## Recommendation: Option D (Runtime Enumeration) + Option E (Round-Trip Verifier) as Two-Tier Check

**Tier 1 (PR-blocking, fast): Option D — `--enumerate-args` manifest comparison.**
The repair tool exposes `--enumerate-args` returning structured JSON. A committed manifest file records the last-known schema. CI diffs them. If they diverge without a version bump, the PR is blocked with a clear diff showing what changed and whether the change is breaking (new required flag / renamed arg) or non-breaking (new optional flag). Runtime: <500ms.

**Tier 2 (Nightly, thorough): Option E — round-trip integration test.**
A nightly CI job generates repair commands via the audit tool and executes them in dry-run mode against the repair tool. Catches the three-way sync failure (audit template out of date with repair tool) that Tier 1 misses. Runtime: 5-10 seconds.

**Why not Option A:** Help text is too unstable. Formatting changes cause false positives. Structured JSON (Option D) is more precise and more machine-friendly.

**Why not Option B:** AST extraction is fragile and language-dependent. Runtime enumeration (Option D) achieves the same result without parsing source code.

**Why not Option C:** Schema-first is the ideal end state but requires a significant refactor. Option D achieves 80% of the benefit with 10% of the effort. Migration to Option C is possible later.

**The proximity principle matters.** Option D's `--enumerate-args` output lives INSIDE the repair tool, adjacent to the argument parser. When a developer adds `--validate-budget` to the parser on line 47, they see the enumeration on line 12. The physical proximity reduces the chance of forgetting. The version constant (line 3) is even closer. Three things that must be in sync — parser, enumeration, version — all within the first 50 lines of the file. This is the real design insight: **co-location is a better drift mitigation than any automated check.**

### The Manifest Update Workflow

When the drift detector fires:

```
❌ SCHEMA DRIFT DETECTED

  --enumerate-args output changed, but manifest is stale.

  Changes detected:
    + --validate-budget  (required, no value)    ← NEW

  Classification: BREAKING (new required flag)
  Expected action: bump SCHEMA_VERSION

  To resolve:
    1. Bump SCHEMA_VERSION in repair-suppression-ref.sh
    2. Update manifest:
       make repair-suppression-ref --enumerate-args > l10n/repair-schema-manifest.json
    3. Update audit tool command template to include --validate-budget
    4. Re-run: make l10n-suppression-audit (regenerates cached commands)
```

The error message walks the developer through ALL four steps — not just "bump the version" but also "update the audit tool." This closes the three-way sync gap at the process level.

### Auto-Classification Rules

The Tier 1 check can automatically classify changes using the parent's version bump protocol:

| Change type | Classification | Version bump? |
|---|---|---|
| New required flag | BREAKING | YES |
| Renamed argument | BREAKING | YES |
| Removed argument | BREAKING | YES |
| New optional flag | Non-breaking | NO |
| Changed default of optional flag | Non-breaking | NO |
| Changed help text | Non-schema | NO |

The CI check applies these rules to the diff:

```python
def classify_schema_diff(old, new):
    changes = []

    # Check for new required flags
    for flag, config in new.get("flags", {}).items():
        if flag not in old.get("flags", {}) and config.get("required"):
            changes.append({"type": "BREAKING", "detail": f"New required flag: {flag}"})
        elif flag not in old.get("flags", {}):
            changes.append({"type": "NON_BREAKING", "detail": f"New optional flag: {flag}"})

    # Check for removed flags
    for flag in old.get("flags", {}):
        if flag not in new.get("flags", {}):
            changes.append({"type": "BREAKING", "detail": f"Removed flag: {flag}"})

    # Check for renamed/removed positional arguments
    for arg in old.get("positional_keywords", []):
        if arg not in new.get("positional_keywords", []):
            changes.append({"type": "BREAKING", "detail": f"Removed/renamed argument: {arg}"})

    is_breaking = any(c["type"] == "BREAKING" for c in changes)
    return {"breaking": is_breaking, "changes": changes}
```

If ALL changes are non-breaking AND the version wasn't bumped, the check PASSES (with an advisory note). If ANY change is breaking AND the version wasn't bumped, the check FAILS. This eliminates the parent's false-positive problem where non-breaking changes force unnecessary re-audits.

---

## The Audit Tool Template Check (Closing the Third Sync Gap)

The round-trip test (Tier 2) catches audit-tool-to-repair-tool drift at runtime. But we can also add a static check: compare the set of required flags in the repair tool's enumeration against the set of flags included in the audit tool's command template.

```bash
# .ci/check-audit-template-completeness.sh

# Get all required flags from repair tool
REQUIRED_FLAGS=$(make repair-suppression-ref --enumerate-args | \
  jq -r '.flags | to_entries[] | select(.value.required) | .key')

# Get all flags present in the audit tool's command template
# (Extracted from the audit tool's source — fragile but focused)
TEMPLATE_FLAGS=$(grep -oP '--[\w-]+' scripts/generate-audit.py | sort -u)

for flag in $REQUIRED_FLAGS; do
  if ! echo "$TEMPLATE_FLAGS" | grep -q "$flag"; then
    echo "❌ AUDIT TEMPLATE INCOMPLETE"
    echo "  Repair tool requires $flag, but audit tool's command template doesn't include it."
    echo "  Generated commands will be rejected by the repair tool."
    exit 1
  fi
done

echo "✅ Audit template includes all required flags"
```

This is a lightweight static check (Tier 1.5) that catches the specific failure mode where the repair tool is updated but the audit tool's template isn't. Combined with the manifest diff (Tier 1) and the round-trip test (Tier 2), all three sync gaps are covered:

| Gap | What can drift | Detected by |
|---|---|---|
| Version ↔ Parser | Version not bumped after schema change | Tier 1: manifest diff |
| Audit template ↔ Parser | Audit doesn't include new required flags | Tier 1.5: template completeness |
| Audit template ↔ Parser (semantic) | Audit includes flag but with wrong syntax | Tier 2: round-trip test |

---

## Player Journeys

### Journey: Aarav, 28, CI Automation Engineer — The Drift That Almost Shipped

**Context:** Two months after implementing the version check (parent Journey 1). A new team member, Jin, adds `--strategy=conservative|aggressive` as a mandatory flag to the repair tool. Jin bumps the version from 2 to 3. But Jin doesn't update the audit tool's command template — the generated commands don't include `--strategy`.

**Minute 0:00 — PR Opens**

Jin opens PR #891: "Add repair strategy selection." The PR modifies `repair-suppression-ref.sh` — new argument parser entry, new logic, bumped `SCHEMA_VERSION` to 3. Jin also updates the `--enumerate-args` output and the committed manifest. The Tier 1 manifest diff check passes: enumeration matches manifest, version bumped. Green check.

But the audit tool template check (Tier 1.5) fires:

```
❌ AUDIT TEMPLATE INCOMPLETE

  Repair tool requires --strategy, but audit tool's command template
  doesn't include it.

  Generated commands will be rejected by the repair tool.

  File to update: scripts/generate-audit.py
    Look for: generate_repair_command()
    Add: --strategy=conservative (or make it configurable)
```

Jin sees the red check. He opens the CI log. The error points him to exactly the right file and function. He adds `--strategy=conservative` to the audit tool's command template. Pushes. All checks green.

**Minute 1:30 — Understanding the Three-Layer Model**

Jin asks Aarav: "Why are there three separate checks?" Aarav draws on the whiteboard:

```
Tier 1:  Does the manifest match the tool?     (--enumerate-args diff)
Tier 1.5: Does the audit template cover the tool? (flag completeness)
Tier 2:  Does the full pipeline actually work?   (nightly round-trip)
```

"Tier 1 catches version drift. Tier 1.5 catches template drift. Tier 2 catches everything else — wrong syntax, wrong default values, semantic mismatches. They're fast/medium/slow and shallow/medium/deep. The fast ones block PRs; the slow one runs nightly."

Jin: "So if I'd only done Tier 1, my PR would have merged and the nightly would have caught it?"

Aarav: "Yes — but by then Priya's manual workflow would have generated broken commands for 12 hours. Tier 1.5 caught it before merge. That's the value of the three layers."

**Minute 2:00 — PR Merges**

The PR merges with all three artifacts updated: repair tool source, enumeration output, manifest file, and audit tool template. The nightly round-trip test passes that night, confirming end-to-end correctness.

**UI Annotations:**
- The `AUDIT TEMPLATE INCOMPLETE` error is red (not yellow) because this is a correctness issue, not a staleness issue. If merged, generated commands would fail.
- The error message includes the specific file and function to edit — `scripts/generate-audit.py: generate_repair_command()`. This is the "tell me what to do, not what went wrong" principle.
- The Tier 1.5 check runs AFTER Tier 1 (sequential, not parallel). If Tier 1 fails (manifest drift), Tier 1.5 is skipped — no point checking template completeness if the schema itself is in flux.

---

### Journey: Priya, 38, L10n Maintainer — A Non-Breaking Change That Doesn't Trigger

**Context:** Priya adds `--verbose` as an optional debugging flag to the repair tool. She does NOT bump the schema version (per the parent's protocol: new optional flag = NO BUMP).

**Minute 0:00 — Adding the Flag**

Priya adds `--verbose` to the parser and the `--enumerate-args` output. She updates the committed manifest. She does not bump `SCHEMA_VERSION`.

**Minute 0:15 — CI Check Runs**

Tier 1 (manifest diff) detects the change:

```
ℹ SCHEMA CHANGE DETECTED (NON-BREAKING)

  Changes:
    + --verbose  (optional, no value)

  Classification: NON-BREAKING (new optional flag)
  No version bump required.

  Manifest updated correctly. ✅
```

The check PASSES with an advisory note. The classification engine identified `--verbose` as a new optional flag and applied the "NO BUMP" rule. Priya doesn't need to do anything extra.

Tier 1.5 (template completeness) also passes — `--verbose` is not required, so its absence from the audit tool's template is correct. Generated commands work without it.

**Minute 0:30 — Review and Merge**

The reviewer sees the advisory note in CI: "schema change detected, non-breaking, no version bump needed." This is informational — the reviewer confirms the classification is correct (yes, `--verbose` is truly optional) and approves.

**Minute 1:00 — The Audit Tool Doesn't Change**

The audit tool continues generating commands without `--verbose`. The repair tool accepts these commands because `--verbose` is optional. No generated commands break. No stale audits. No pipeline failures. The non-breaking change flows through the system with zero friction — exactly as designed.

**UI Annotations:**
- The `ℹ` prefix (info) is cyan — distinct from `❌` (red, error) and `⚠` (yellow, warning). Three tiers: info for non-breaking detected changes, warning for stale manifests, error for breaking drift.
- The classification line `NON-BREAKING (new optional flag)` is bold white. This is the decision the developer needs to verify — "is CI's classification correct?" If the developer knows the flag should actually be required, they override by bumping the version.
- The `No version bump required.` line is dim grey — the conclusion, not the evidence. The evidence (the diff) comes first; the conclusion comes after.

---

### Journey: Dev, 24, Junior Engineer — First-Time Drift Fix After Nightly Failure

**Context:** Dev is on rotation when the nightly Tier 2 round-trip test fails. She's never debugged this system before.

**Minute 0:00 — Nightly Alert**

Slack at 3:12 AM: "🔴 l10n-nightly: round-trip test failed." Dev checks at 9 AM.

The CI log:

```
Round-trip test: generating repair command for test fixture...
  Generated: make repair-suppression-ref KEY=test.roundtrip SURFACE=old.surface.name --validate-budget

Round-trip test: executing in dry-run mode...
  Exit code: 1
  Stderr: error: unknown flag '--validate-budget'

❌ ROUND-TRIP FAILURE

  The audit tool generated a command that the repair tool rejected.

  Generated command: make repair-suppression-ref KEY=test.roundtrip SURFACE=old.surface.name --validate-budget
  Rejected flag: --validate-budget

  This usually means:
    1. The repair tool removed or renamed a flag
    2. The audit tool's command template is out of date
    3. The tools are from different branches

  Debug steps:
    make repair-suppression-ref --enumerate-args    # see current flags
    grep 'validate-budget' scripts/generate-audit.py  # find in audit template
```

**Minute 0:15 — Following the Debug Steps**

Dev runs `make repair-suppression-ref --enumerate-args`. The output doesn't include `--validate-budget`. She checks git log: someone removed the flag yesterday in PR #903 ("remove budget validation — moved to pre-commit hook"), bumped the schema version from 3 to 4, and updated the manifest. But the audit tool still includes `--validate-budget` in its template.

Wait — how did this pass Tier 1.5? Dev checks: the PR removed a REQUIRED flag. The template-completeness check only verifies that required flags ARE present — it doesn't verify that NON-EXISTENT flags are absent. The audit tool was including a flag the repair tool no longer accepts, and no Tier 1 or 1.5 check catches "template includes flag that tool doesn't accept."

**Minute 0:30 — Identifying the Gap**

Dev realizes: the template completeness check is one-directional. It checks `repair → audit` (does the audit include everything the repair needs?) but not `audit → repair` (does the audit include only things the repair accepts?). The reverse check catches a different class of drift: phantom flags in the template.

She files an issue: "Tier 1.5 should also check that the audit template doesn't include flags the repair tool doesn't accept (the phantom flag problem)."

**Minute 0:45 — The Immediate Fix**

Dev removes `--validate-budget` from the audit tool's command template. She also adds a reverse check to the Tier 1.5 script:

```bash
# Check for phantom flags (audit includes flags repair doesn't accept)
KNOWN_FLAGS=$(make repair-suppression-ref --enumerate-args | jq -r '.flags | keys[]')
TEMPLATE_FLAGS=$(grep -oP '--[\w-]+' scripts/generate-audit.py | sort -u)

for flag in $TEMPLATE_FLAGS; do
  if ! echo "$KNOWN_FLAGS" | grep -q "$flag"; then
    echo "❌ PHANTOM FLAG IN AUDIT TEMPLATE"
    echo "  Audit tool includes $flag but repair tool doesn't accept it."
    echo "  Generated commands will be rejected."
    exit 1
  fi
done
```

She opens a PR with both the template fix and the new reverse check. The nightly passes the next night.

**Minute 1:00 — Retro Note**

Dev adds to her onboarding doc: "The drift detector has three tiers. Tier 1.5 originally only checked forward direction (repair → audit). Now checks both directions. The phantom flag case was the blind spot."

**UI Annotations:**
- The round-trip failure log includes `Rejected flag: --validate-budget` — extracted from the stderr. This saves the developer from parsing the full stderr. The CI script does the parsing and surfaces the specific rejected element.
- The `Debug steps:` section is always included, even when the cause is obvious. For Dev encountering this for the first time, these steps are a guided investigation. For Aarav, they're ignorable.
- The Slack alert is `🔴` (red circle, severity: high) because the nightly is a correctness gate — if it fails, generated commands in the wild may be broken. Compare with Tier 1 drift detection in PRs, which is `⚠` (warning) because the bad commands haven't been generated yet.

---

## Sensory Description

### The Drift Detection CI Output

When Tier 1 fires on a PR, the GitHub Actions log renders with the Runner's default monospace font. The first thing you see:

```
❌ SCHEMA DRIFT DETECTED
```

The `❌` is rendered as a red emoji by GitHub's log viewer — a small crimson X in a circle, sitting on its own line. Below it, the diff section uses GitHub's native diff coloring: removed lines in soft red background, added lines in soft green background. The `+` and `-` prefixes anchor the eye.

The classification line stands out:

```
Classification: BREAKING (new required flag)
```

`BREAKING` is all-caps, no color (relies on the caps for emphasis in a monochrome log). The parenthetical is regular case, providing the reason. This two-part pattern — verdict then evidence — appears throughout the l10n tooling. It's the same structure as `repair_confidence: "high"` / `repair_confidence_reason: "..."` from the parent.

When Tier 1.5 fires, the output is visually similar but distinct:

```
❌ AUDIT TEMPLATE INCOMPLETE
```

Different noun phrase — "DRIFT" vs. "TEMPLATE INCOMPLETE" — tells the developer which tier fired without reading further. The remediation section below uses indented code blocks:

```
  File to update: scripts/generate-audit.py
    Look for: generate_repair_command()
    Add: --strategy=conservative
```

The indentation hierarchy (2 spaces → 4 spaces) creates a drill-down feeling: WHERE to look → WHAT to find → WHAT to do. Three levels, three pieces of information, progressively specific.

### The Advisory Note for Non-Breaking Changes

When an optional flag is added and no version bump is needed:

```
ℹ SCHEMA CHANGE DETECTED (NON-BREAKING)
```

The `ℹ` is a blue circle-i — GitHub renders it as a calm informational icon. The color contrast with `❌` red is immediate: blue = informational, red = action required. A developer scanning a CI log with multiple checks can distinguish these at a glance without reading the text.

The entire advisory block is lighter — no diff section, no remediation steps, no file paths. Just the change list and the classification. The visual weight communicates urgency: heavy block = something is wrong, light block = everything is fine but here's what happened.

### The Round-Trip Failure Alert

The nightly Slack message:

```
🔴 l10n-nightly: round-trip test failed

  audit → repair command rejected
  Flag: --validate-budget (not accepted)

  CI log: https://github.com/...
```

The `🔴` red circle sits at the start of the first line — in Slack's message list, it's the first thing visible without expanding. The body is three lines: WHAT happened, WHICH flag, WHERE to look. The brevity is deliberate — at 3 AM, the on-call engineer needs enough to triage severity (is this "pages people" or "fix tomorrow"), not enough to fix it.

### The TikTok Clip

A developer opens a PR. Three green checks appear: `✅ Tier 1: Schema manifest`, `✅ Tier 1.5: Template completeness`, `✅ Tests`. They look satisfied.

Cut to: same developer removes a flag from the repair tool but forgets to update the audit tool. `✅ Tier 1` appears. `❌ Tier 1.5: AUDIT TEMPLATE INCOMPLETE` — the second check catches what the first missed. Zoom in on the developer's face: impressed nod.

Caption: "Defense in depth isn't just for security."

---

## Strengths

1. **Catches the human failure mode.** The version constant is human-maintained; the drift detector is the machine checking the human's work. This is the same pattern as type-checking catching variable misuse — trust but verify.

2. **Three-tier architecture matches three failure modes.** Version drift (Tier 1), template drift (Tier 1.5), semantic drift (Tier 2). Each tier is the minimal check for its failure mode — no over-engineering within any tier.

3. **Fast path blocks PRs, slow path catches edge cases.** Tier 1 and 1.5 run in <1 second and block PRs. Tier 2 runs nightly and catches the exotic cases. The cost of each check is proportional to what it catches.

4. **Auto-classification reduces noise.** Non-breaking changes don't trigger false alarms. Only breaking changes that weren't versioned produce failures. This addresses the parent's Weakness #4 ("no automated detection") without creating a new problem (alert fatigue).

5. **Bi-directional template check.** After Dev's fix, Tier 1.5 catches both missing flags (forward check) and phantom flags (reverse check). This makes the template a verified projection of the schema, not just a subset.

## Weaknesses

1. **`--enumerate-args` is still human-maintained.** If the developer adds a flag to the parser but not to the enumeration, the drift detector doesn't fire (because it compares enumeration against manifest, not parser against manifest). The drift has just moved from "forget to bump version" to "forget to update enumeration." Mitigation: co-location (enumeration is near the parser in the source file); code review; linting that checks the parser and enumeration are in sync (but this recreates Option B's fragility).

2. **Tier 1.5 relies on grep.** Extracting flags from the audit tool's source via `grep -oP '--[\w-]+' scripts/generate-audit.py` is fragile. If the template uses string concatenation (`"--validate" + "-budget"`), grep misses it. A refactor that changes how flags are assembled in the template silently bypasses the check.

3. **Round-trip test fixture maintenance.** The test fixture (a synthetic suppression with a stale reference) must be kept valid as the suppression schema evolves. If the fixture becomes invalid for reasons unrelated to the repair schema, the nightly fails with a confusing error.

4. **Three tiers = three places to maintain.** Adding a new check means understanding which tier it belongs to, how it interacts with the other tiers, and what its failure mode looks like. The conceptual overhead scales with the number of tiers.

5. **The Dev journey revealed a blind spot that took days to detect.** The phantom flag case was only caught by the nightly round-trip (Tier 2), 12+ hours after merge. During that window, any manual audit runs generated broken commands. The reverse check (Dev's fix) closes this, but other blind spots may exist.

---

## Interaction Effects

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-ii (Version bump as team-affecting event):** The drift detector changes the version bump from a silent code change to a CI-visible event. Tier 1 shows the diff, the classification, and the remediation steps. This makes the version bump a "team announcement" — everyone who reviews the PR sees exactly what changed. The notification protocol from A-ii can hook into the Tier 1 output: "When Tier 1 detects a BREAKING change with a version bump, post to #l10n-tooling Slack channel."

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-iii (Schema version in IDE extension):** The IDE extension could run Tier 1 locally: extract `--enumerate-args`, compare against the workspace's committed manifest, and surface drift warnings inline. A developer changing the parser sees a yellow squiggle on the `SCHEMA_VERSION` constant: "enumeration changed but version unchanged."

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-iv (Cross-tool schema version alignment):** The drift detector concept generalizes to the audit tool's OWN output format. If the audit JSON envelope schema changes (new top-level field, renamed metadata key), consumers of the audit JSON need a version check too. A `audit_schema_version` field + a Tier 1 manifest check for the audit schema = the same pattern applied one level up.

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-v (Schema changelog as testable artifact):** The drift detector can ALSO verify that the changelog is updated when the schema changes. If Tier 1 detects a BREAKING change with a version bump, it can check that the changelog includes an entry for the new version. If the entry is missing: `⚠ Version bumped to 3 but no changelog entry for v3 found.`

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-B (Eval injection hardening):** If the `repair_command` field becomes a structured object instead of a string (per B's recommendation), the drift detector's Tier 1.5 template check must parse the structured object rather than grepping for flag strings. The structured format makes the check MORE reliable (no regex fragility) but requires a different extraction method.

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-C (PR comment rendering):** The Tier 1 manifest diff output could be rendered directly in the PR comment alongside the repair command suggestions. A PR reviewer sees: "this PR changes the repair schema (BREAKING, v2→v3), and here are the updated repair commands." The drift detector output becomes input to the PR comment renderer.

---

## Comparable Systems

### TypeScript Compiler's `--strict` Flag Evolution

TypeScript adds new strictness checks across versions. Each check has its own flag (`--strictNullChecks`, `--noImplicitAny`). The `--strict` meta-flag enables all current checks. But code written under TypeScript 4.7's `--strict` might not compile under 4.9's `--strict` because new checks were added. The TypeScript team manages this by documenting breaking changes per version. Robot Uprising's drift detector automates what TypeScript relies on documentation for: detecting when the contract has changed and classifying the change as breaking or non-breaking.

### Rust Compiler's `deny(warnings)` Pattern

Rust projects using `#[deny(warnings)]` break when the compiler adds new warnings in a new version. The Rust community considers this an anti-pattern — it couples build success to a specific compiler version. The drift detector avoids this anti-pattern by separating "what the tool accepts" (the enumeration) from "what we require" (the version). A new optional flag is like a new Rust warning: informational but not breaking.

### OpenAPI Schema Validation in CI

Many API teams run `openapi-diff` in CI to detect breaking changes between the committed OpenAPI spec and the current code. The tool compares the spec against the implementation and classifies changes as breaking (removed endpoint, changed parameter type) or non-breaking (added endpoint, added optional parameter). This is exactly Option B (AST extraction) applied to REST APIs. Robot Uprising's Option D (runtime enumeration) is simpler because the tool can describe itself — the equivalent of an API that can generate its own OpenAPI spec.

### Database Migration Version Checks

ORMs like Rails ActiveRecord and Alembic track schema migrations with sequential version numbers. Before running a migration, they check "is the database at version N-1?" If not, the migration refuses to run. The drift detector is the same pattern applied to CLI argument schemas: before executing a generated command, check "is the command's schema version compatible with the tool?"

### Git Hook + Pre-commit Framework

Pre-commit hooks that lint staged files are the closest process analog. The drift detector is a pre-commit check for schema consistency: before the PR merges (pre-merge, not pre-commit), verify that all schema-adjacent artifacts are in sync. The three-tier model mirrors pre-commit's fast-lint / slow-test separation.

---

## New Aspects Discovered

1. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a — Phantom flag detection as a bidirectional completeness check:** full design of the reverse template check (audit → repair direction); the `--enumerate-args` output as the "known flags" source of truth; handling flag aliases (`--verbose` / `-v`) in the reverse check; false positive suppression for test-only flags

2. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-b — Enumeration-to-parser consistency lint:** a source-level check that the `--enumerate-args` output matches the actual getopt/argparse definitions in the same file; the "inner drift" problem where enumeration and parser diverge within the repair tool itself; AST-based vs. test-based approaches

3. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-c — Round-trip test fixture versioning:** the test fixture (synthetic suppression with stale reference) must evolve alongside the suppression schema; a fixture manifest that tracks which schema version the fixture targets; auto-regeneration of fixtures when the suppression schema changes

4. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-d — Drift detector for other l10n CLI tools:** generalizing the three-tier drift detection pattern to `make fork-string`, `make rename-surface`, and `make l10n-suppression-audit` itself; a shared `check-schema-drift.sh` library that any tool can plug into with a `--enumerate-args` flag

5. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-e — CI tier ordering and skip logic:** formal specification of when each tier runs, under what conditions a tier is skipped (e.g., skip Tier 1.5 if Tier 1 fails), and how tier results aggregate into a single pass/fail; the "tier dependency graph" as a meta-design for multi-layer CI checks
