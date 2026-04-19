# Autopilot Three-Gate Dispatch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the `autopilot` skill so every remote dispatch passes three non-negotiable gates (credentials, outcome checklist, behavior/process), with per-dispatch brief directories and per-skill manifests.

**Architecture:** Each `remote-skills/*.md` file declares its own `credentials:`, `interview:`, and `payload:` in frontmatter. A new `scripts/dispatch-gate.py` validator enforces the gates deterministically. Each dispatch writes to `autopilot/briefs/YYYY-MM-DD-<slug>/` (gitignored). `intake.md` / `status.md` are replaced by `dispatch.md` / `poll.md`. The local `.claude/skills/podcast/` skill adopts a lighter outcome-checklist step to stay conceptually in sync.

**Tech Stack:** Bash, Python 3, YAML frontmatter (parsed with `python-frontmatter` or manual split), markdown. The autopilot skill lives at `~/.claude/skills/autopilot/` (separate git repo). The local podcast skill lives at `.claude/skills/podcast/` in the monorepo.

**Spec:** `docs/superpowers/specs/2026-04-19-autopilot-three-gate-dispatch-design.md`

**Repository note:** `~/.claude/skills/autopilot/` is its own git repo (see memory note: always commit+push skill-repo changes). Tasks 1–11 operate in that repo. Task 12 operates in the monorepo.

## File Structure

**Autopilot skill repo (`~/.claude/skills/autopilot/`):**
- Create: `scripts/dispatch-gate.py` — validator for manifest, brief, payload, credentials
- Create: `scripts/test_dispatch_gate.py` — pytest for the validator
- Create: `dispatch.md` — new three-gate dispatch flow doc (replaces `intake.md`)
- Create: `poll.md` — status polling doc (replaces `status.md`, content largely preserved)
- Create: `briefs/.gitkeep` — placeholder so directory exists
- Modify: `.gitignore` — add `briefs/*` but keep `!briefs/.gitkeep`
- Modify: `SKILL.md` — rewrite routing to point at `dispatch.md` / `poll.md` and document the three-gate flow
- Modify: `remote-skills/podcast.md` — add `credentials:`, `interview:`, `payload:` frontmatter
- Modify: `remote-skills/podcast-pimsleur.md` — add the same three sections
- Modify: `remote-skills/investigate.md` — add the same three sections
- Delete: `intake.md`
- Delete: `status.md`

**Monorepo (`/home/clsandoval/cs/monorepo`):**
- Modify: `.claude/skills/podcast/SKILL.md` — add outcome-checklist step before generation

---

## Task 1: Scaffold `dispatch-gate.py` with failing test for manifest parsing

**Files:**
- Create: `~/.claude/skills/autopilot/scripts/dispatch-gate.py`
- Create: `~/.claude/skills/autopilot/scripts/test_dispatch_gate.py`

- [ ] **Step 1: Write the failing test**

Create `~/.claude/skills/autopilot/scripts/test_dispatch_gate.py`:

```python
"""Tests for dispatch-gate.py — the three-gate validator."""
import os
import subprocess
import tempfile
import textwrap
from pathlib import Path

SCRIPT = Path(__file__).parent / "dispatch-gate.py"


def run_gate(*args, env=None):
    """Run dispatch-gate.py with args; return CompletedProcess."""
    return subprocess.run(
        ["python3", str(SCRIPT), *args],
        capture_output=True,
        text=True,
        env={**os.environ, **(env or {})},
    )


def write(path: Path, content: str) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(textwrap.dedent(content).lstrip("\n"))
    return path


def test_parse_manifest_extracts_three_sections(tmp_path):
    skill = write(tmp_path / "skill.md", """
        ---
        name: example
        credentials:
          - name: FOO
            check: env
            required: true
        interview:
          - id: topic
            prompt: "What's the topic?"
        payload:
          - path: scripts/tool.sh
            required: true
        ---

        # Skill body
        """)
    result = run_gate("parse-manifest", str(skill))
    assert result.returncode == 0, result.stderr
    assert "FOO" in result.stdout
    assert "topic" in result.stdout
    assert "scripts/tool.sh" in result.stdout
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ~/.claude/skills/autopilot && python3 -m pytest scripts/test_dispatch_gate.py::test_parse_manifest_extracts_three_sections -v`
Expected: FAIL — `dispatch-gate.py` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `~/.claude/skills/autopilot/scripts/dispatch-gate.py`:

```python
#!/usr/bin/env python3
"""Validate the three autopilot dispatch gates.

Subcommands:
  parse-manifest <skill.md>         Print credentials/interview/payload from frontmatter
  check-brief <brief-dir>           Validate outcome.md and behavior.md non-empty
  check-payload <skill.md> <brief-dir>   Validate every payload file exists (skill payload + context)
  check-credentials <skill.md>      Run every credentials check; print pass/fail table
  all <skill.md> <brief-dir>        Run all checks; exit non-zero on any hard failure
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path


def parse_frontmatter(path: Path) -> dict:
    text = path.read_text()
    m = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not m:
        return {}
    # Lazy YAML: use pyyaml if available, fall back to json-ish parse.
    import yaml
    return yaml.safe_load(m.group(1)) or {}


def cmd_parse_manifest(args) -> int:
    fm = parse_frontmatter(Path(args.skill))
    print(json.dumps({
        "credentials": fm.get("credentials", []),
        "interview": fm.get("interview", []),
        "payload": fm.get("payload", []),
    }, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("parse-manifest")
    p.add_argument("skill")
    p.set_defaults(func=cmd_parse_manifest)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
```

Make executable: `chmod +x ~/.claude/skills/autopilot/scripts/dispatch-gate.py`

- [ ] **Step 4: Run test to verify it passes**

Run: `cd ~/.claude/skills/autopilot && python3 -m pytest scripts/test_dispatch_gate.py::test_parse_manifest_extracts_three_sections -v`
Expected: PASS.

If `pyyaml` missing: `pip install pyyaml` (or `apt-get install python3-yaml`).

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills/autopilot
git add scripts/dispatch-gate.py scripts/test_dispatch_gate.py
git commit -m "feat(autopilot): scaffold dispatch-gate.py with manifest parser"
```

---

## Task 2: Add brief validation (`check-brief`)

**Files:**
- Modify: `~/.claude/skills/autopilot/scripts/dispatch-gate.py`
- Modify: `~/.claude/skills/autopilot/scripts/test_dispatch_gate.py`

- [ ] **Step 1: Write the failing tests**

Append to `test_dispatch_gate.py`:

```python
def test_check_brief_passes_with_both_files_non_empty(tmp_path):
    brief = tmp_path / "brief"
    write(brief / "outcome.md", "- [ ] Ship it\n")
    write(brief / "behavior.md", "Explore first, then commit.\n")
    result = run_gate("check-brief", str(brief))
    assert result.returncode == 0, result.stderr
    assert "PASS" in result.stdout


def test_check_brief_fails_if_outcome_missing(tmp_path):
    brief = tmp_path / "brief"
    write(brief / "behavior.md", "Something.\n")
    result = run_gate("check-brief", str(brief))
    assert result.returncode != 0
    assert "outcome.md" in result.stdout + result.stderr


def test_check_brief_fails_if_behavior_empty(tmp_path):
    brief = tmp_path / "brief"
    write(brief / "outcome.md", "- [ ] Ship\n")
    write(brief / "behavior.md", "\n   \n")
    result = run_gate("check-brief", str(brief))
    assert result.returncode != 0
    assert "behavior.md" in result.stdout + result.stderr
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/.claude/skills/autopilot && python3 -m pytest scripts/test_dispatch_gate.py -v -k check_brief`
Expected: FAIL — `check-brief` subcommand does not exist.

- [ ] **Step 3: Implement `check-brief`**

Edit `dispatch-gate.py` — add above `main()`:

```python
def cmd_check_brief(args) -> int:
    brief_dir = Path(args.brief_dir)
    required = ["outcome.md", "behavior.md"]
    failures = []
    for name in required:
        p = brief_dir / name
        if not p.exists():
            failures.append(f"{name}: MISSING")
            continue
        if not p.read_text().strip():
            failures.append(f"{name}: EMPTY")
    if failures:
        for f in failures:
            print(f"FAIL: {f}")
        return 1
    print("PASS: outcome.md and behavior.md present and non-empty")
    return 0
```

Register in `main()`:

```python
    p = sub.add_parser("check-brief")
    p.add_argument("brief_dir")
    p.set_defaults(func=cmd_check_brief)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/.claude/skills/autopilot && python3 -m pytest scripts/test_dispatch_gate.py -v -k check_brief`
Expected: 3 PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills/autopilot
git add scripts/dispatch-gate.py scripts/test_dispatch_gate.py
git commit -m "feat(autopilot): add check-brief gate (outcome+behavior non-empty)"
```

---

## Task 3: Add payload validation (`check-payload`)

**Files:**
- Modify: `~/.claude/skills/autopilot/scripts/dispatch-gate.py`
- Modify: `~/.claude/skills/autopilot/scripts/test_dispatch_gate.py`

- [ ] **Step 1: Write the failing tests**

Append to `test_dispatch_gate.py`:

```python
def test_check_payload_passes_when_all_files_exist(tmp_path):
    (tmp_path / "scripts").mkdir()
    (tmp_path / "scripts" / "tool.sh").write_text("#!/bin/sh\n")
    skill = write(tmp_path / "skill.md", """
        ---
        name: x
        payload:
          - path: scripts/tool.sh
            required: true
        ---
        """)
    brief = tmp_path / "brief"
    # payload.json written by the dispatch flow — here we simulate "no extra context paths"
    write(brief / "payload.json", '{"extra": []}')
    result = run_gate(
        "check-payload", str(skill), str(brief),
        env={"AUTOPILOT_SKILL_ROOT": str(tmp_path)},
    )
    assert result.returncode == 0, result.stderr
    assert "PASS" in result.stdout


def test_check_payload_fails_on_missing_required(tmp_path):
    skill = write(tmp_path / "skill.md", """
        ---
        name: x
        payload:
          - path: scripts/missing.sh
            required: true
        ---
        """)
    brief = tmp_path / "brief"
    write(brief / "payload.json", '{"extra": []}')
    result = run_gate(
        "check-payload", str(skill), str(brief),
        env={"AUTOPILOT_SKILL_ROOT": str(tmp_path)},
    )
    assert result.returncode != 0
    assert "missing.sh" in result.stdout + result.stderr


def test_check_payload_includes_extra_paths_from_payload_json(tmp_path):
    skill = write(tmp_path / "skill.md", """
        ---
        name: x
        payload: []
        ---
        """)
    doc = tmp_path / "some_doc.md"
    doc.write_text("hi")
    brief = tmp_path / "brief"
    write(brief / "payload.json", json.dumps({"extra": [str(doc)]}))
    result = run_gate(
        "check-payload", str(skill), str(brief),
        env={"AUTOPILOT_SKILL_ROOT": str(tmp_path)},
    )
    assert result.returncode == 0
```

Add `import json` to the top of the test file if not already present.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/.claude/skills/autopilot && python3 -m pytest scripts/test_dispatch_gate.py -v -k check_payload`
Expected: FAIL — `check-payload` not implemented.

- [ ] **Step 3: Implement `check-payload`**

Edit `dispatch-gate.py`:

```python
def cmd_check_payload(args) -> int:
    skill_path = Path(args.skill).resolve()
    fm = parse_frontmatter(skill_path)
    skill_root = Path(os.environ.get("AUTOPILOT_SKILL_ROOT", skill_path.parent))
    brief_dir = Path(args.brief_dir)

    failures = []
    checked = []

    # Skill-declared payload — paths relative to skill root
    for entry in fm.get("payload", []) or []:
        rel = entry.get("path")
        required = bool(entry.get("required", True))
        full = skill_root / rel
        checked.append(str(full))
        if not full.exists() and required:
            failures.append(f"skill payload missing: {rel}")

    # User-curated extras from payload.json
    payload_json = brief_dir / "payload.json"
    if payload_json.exists():
        data = json.loads(payload_json.read_text())
        for extra in data.get("extra", []) or []:
            checked.append(extra)
            if not Path(extra).exists():
                failures.append(f"extra payload missing: {extra}")

    if failures:
        for f in failures:
            print(f"FAIL: {f}")
        return 1
    print(f"PASS: {len(checked)} payload file(s) resolvable")
    for c in checked:
        print(f"  - {c}")
    return 0
```

Add `import json` at top. Register subcommand in `main()`:

```python
    p = sub.add_parser("check-payload")
    p.add_argument("skill")
    p.add_argument("brief_dir")
    p.set_defaults(func=cmd_check_payload)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/.claude/skills/autopilot && python3 -m pytest scripts/test_dispatch_gate.py -v -k check_payload`
Expected: 3 PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills/autopilot
git add scripts/dispatch-gate.py scripts/test_dispatch_gate.py
git commit -m "feat(autopilot): add check-payload gate (skill + user-curated files exist)"
```

---

## Task 4: Add credentials validation (`check-credentials`)

**Files:**
- Modify: `~/.claude/skills/autopilot/scripts/dispatch-gate.py`
- Modify: `~/.claude/skills/autopilot/scripts/test_dispatch_gate.py`

- [ ] **Step 1: Write the failing tests**

Append to `test_dispatch_gate.py`:

```python
def test_check_credentials_env_pass(tmp_path):
    skill = write(tmp_path / "skill.md", """
        ---
        name: x
        credentials:
          - name: FAKE_KEY
            check: env
            required: true
        ---
        """)
    result = run_gate("check-credentials", str(skill), env={"FAKE_KEY": "yes"})
    assert result.returncode == 0, result.stderr
    assert "FAKE_KEY" in result.stdout
    assert "PASS" in result.stdout


def test_check_credentials_env_fail(tmp_path):
    skill = write(tmp_path / "skill.md", """
        ---
        name: x
        credentials:
          - name: MISSING_KEY_XYZ
            check: env
            required: true
        ---
        """)
    # Ensure it's really not set
    clean = {k: v for k, v in os.environ.items() if k != "MISSING_KEY_XYZ"}
    result = subprocess.run(
        ["python3", str(SCRIPT), "check-credentials", str(skill)],
        capture_output=True, text=True, env=clean,
    )
    assert result.returncode != 0
    assert "MISSING_KEY_XYZ" in result.stdout + result.stderr


def test_check_credentials_file_pass(tmp_path):
    f = tmp_path / "thing.txt"
    f.write_text("x")
    skill = write(tmp_path / "skill.md", f"""
        ---
        name: x
        credentials:
          - name: {f}
            check: file
            required: true
        ---
        """)
    result = run_gate("check-credentials", str(skill))
    assert result.returncode == 0
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/.claude/skills/autopilot && python3 -m pytest scripts/test_dispatch_gate.py -v -k check_credentials`
Expected: FAIL.

- [ ] **Step 3: Implement `check-credentials`**

Edit `dispatch-gate.py`:

```python
def cmd_check_credentials(args) -> int:
    fm = parse_frontmatter(Path(args.skill))
    rows = []
    hard_fail = False
    for entry in fm.get("credentials", []) or []:
        name = entry.get("name")
        check = entry.get("check", "env")
        required = bool(entry.get("required", True))
        if check == "env":
            ok = bool(os.environ.get(name))
            reason = "" if ok else "env var not set"
        elif check == "file":
            ok = Path(name).exists()
            reason = "" if ok else "file not found"
        elif check == "remote-secret":
            # Out of scope for offline gate; mark as manual.
            ok = True
            reason = "manual (remote-secret — verify in remote env)"
        else:
            ok = False
            reason = f"unknown check type: {check}"
        rows.append((name, check, "PASS" if ok else "FAIL", reason, required))
        if not ok and required:
            hard_fail = True

    # Print table
    width = max((len(r[0]) for r in rows), default=10)
    print(f"{'name'.ljust(width)}  check          status  note")
    for name, check, status, reason, req in rows:
        print(f"{name.ljust(width)}  {check.ljust(14)} {status}    {reason}")
    return 1 if hard_fail else 0
```

Register in `main()`:

```python
    p = sub.add_parser("check-credentials")
    p.add_argument("skill")
    p.set_defaults(func=cmd_check_credentials)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/.claude/skills/autopilot && python3 -m pytest scripts/test_dispatch_gate.py -v -k check_credentials`
Expected: 3 PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills/autopilot
git add scripts/dispatch-gate.py scripts/test_dispatch_gate.py
git commit -m "feat(autopilot): add check-credentials gate (env+file checks)"
```

---

## Task 5: Add `all` subcommand that runs every gate

**Files:**
- Modify: `~/.claude/skills/autopilot/scripts/dispatch-gate.py`
- Modify: `~/.claude/skills/autopilot/scripts/test_dispatch_gate.py`

- [ ] **Step 1: Write the failing test**

Append to `test_dispatch_gate.py`:

```python
def test_all_passes_when_every_gate_passes(tmp_path):
    (tmp_path / "scripts").mkdir()
    (tmp_path / "scripts" / "tool.sh").write_text("#!/bin/sh\n")
    skill = write(tmp_path / "skill.md", """
        ---
        name: x
        credentials:
          - name: OK_VAR
            check: env
            required: true
        interview:
          - id: t
            prompt: "?"
        payload:
          - path: scripts/tool.sh
            required: true
        ---
        """)
    brief = tmp_path / "brief"
    write(brief / "outcome.md", "- [ ] done\n")
    write(brief / "behavior.md", "explore\n")
    write(brief / "payload.json", '{"extra": []}')
    result = run_gate(
        "all", str(skill), str(brief),
        env={"OK_VAR": "1", "AUTOPILOT_SKILL_ROOT": str(tmp_path)},
    )
    assert result.returncode == 0, result.stderr


def test_all_fails_when_any_gate_fails(tmp_path):
    skill = write(tmp_path / "skill.md", """
        ---
        name: x
        credentials:
          - name: NOT_SET_ABC
            check: env
            required: true
        ---
        """)
    brief = tmp_path / "brief"
    write(brief / "outcome.md", "- [ ] done\n")
    write(brief / "behavior.md", "explore\n")
    write(brief / "payload.json", '{"extra": []}')
    clean = {k: v for k, v in os.environ.items() if k != "NOT_SET_ABC"}
    clean["AUTOPILOT_SKILL_ROOT"] = str(tmp_path)
    result = subprocess.run(
        ["python3", str(SCRIPT), "all", str(skill), str(brief)],
        capture_output=True, text=True, env=clean,
    )
    assert result.returncode != 0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ~/.claude/skills/autopilot && python3 -m pytest scripts/test_dispatch_gate.py -v -k test_all`
Expected: FAIL.

- [ ] **Step 3: Implement `all`**

Edit `dispatch-gate.py`:

```python
def cmd_all(args) -> int:
    class A:
        pass
    a = A()
    a.brief_dir = args.brief_dir
    a.skill = args.skill
    rc = 0
    print("=== Gate: brief ===")
    rc |= cmd_check_brief(a)
    print("\n=== Gate: payload ===")
    rc |= cmd_check_payload(a)
    print("\n=== Gate: credentials ===")
    rc |= cmd_check_credentials(a)
    print("\n=== Overall ===")
    print("PASS" if rc == 0 else "FAIL")
    return rc
```

Register:

```python
    p = sub.add_parser("all")
    p.add_argument("skill")
    p.add_argument("brief_dir")
    p.set_defaults(func=cmd_all)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/.claude/skills/autopilot && python3 -m pytest scripts/test_dispatch_gate.py -v`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills/autopilot
git add scripts/dispatch-gate.py scripts/test_dispatch_gate.py
git commit -m "feat(autopilot): add 'all' subcommand aggregating three gates"
```

---

## Task 6: Create `briefs/` directory and update `.gitignore`

**Files:**
- Create: `~/.claude/skills/autopilot/briefs/.gitkeep`
- Modify: `~/.claude/skills/autopilot/.gitignore`

- [ ] **Step 1: Create directory and placeholder**

```bash
mkdir -p ~/.claude/skills/autopilot/briefs
touch ~/.claude/skills/autopilot/briefs/.gitkeep
```

- [ ] **Step 2: Update `.gitignore`**

Current contents (per `git status`):

```gitignore
# Python bytecode
__pycache__/
*.pyc
*.pyo
*.egg-info/
dist/
.eggs/
```

Append:

```gitignore

# Per-dispatch brief directories (personal working state)
briefs/*
!briefs/.gitkeep
```

- [ ] **Step 3: Verify gitignore behaves**

```bash
cd ~/.claude/skills/autopilot
mkdir -p briefs/2026-04-19-test
echo test > briefs/2026-04-19-test/outcome.md
git status --short
```

Expected: `briefs/2026-04-19-test/` does NOT appear in status (ignored). `.gitkeep` is tracked.

Clean up:

```bash
rm -rf ~/.claude/skills/autopilot/briefs/2026-04-19-test
```

- [ ] **Step 4: Commit**

```bash
cd ~/.claude/skills/autopilot
git add .gitignore briefs/.gitkeep
git commit -m "feat(autopilot): add briefs/ dir, gitignore per-dispatch contents"
```

---

## Task 7: Add manifest frontmatter to `remote-skills/podcast.md`

**Files:**
- Modify: `~/.claude/skills/autopilot/remote-skills/podcast.md`

- [ ] **Step 1: Update frontmatter**

Current frontmatter:

```yaml
---
name: remote-podcast
description: Use when generating a two-speaker podcast episode from mounted source material in a Managed Agent container. Pimsleur bilingual Japanese immersion activates via `[PIMSLEUR]` marker in the brief.
---
```

Replace with:

```yaml
---
name: remote-podcast
description: Use when generating a two-speaker podcast episode from mounted source material in a Managed Agent container. Pimsleur bilingual Japanese immersion activates via `[PIMSLEUR]` marker in the brief.
credentials:
  - name: ANTHROPIC_API_KEY
    check: env
    required: true
  - name: GEMINI_API_KEY
    check: env
    required: true
  - name: TELEGRAM_BOT_TOKEN
    check: env
    required: true
  - name: TELEGRAM_CHAT_ID
    check: env
    required: true
interview:
  - id: source_artifact
    prompt: "Path to the source artifact (spec, plan, doc) OR a topic brief?"
  - id: episode_name
    prompt: "Episode name / slug?"
  - id: duration
    prompt: "Target duration (e.g., '30 min', '60 min')?"
  - id: angle
    prompt: "One non-obvious thread or claim this episode should make?"
payload:
  - path: scripts/generate.sh
    required: true
  - path: scripts/verify-dialogue.py
    required: true
---
```

- [ ] **Step 2: Verify manifest parses**

```bash
cd ~/.claude/skills/autopilot
python3 scripts/dispatch-gate.py parse-manifest remote-skills/podcast.md
```

Expected: JSON output with all three sections populated.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/skills/autopilot
git add remote-skills/podcast.md
git commit -m "feat(autopilot): add credentials+interview+payload manifest to podcast skill"
```

---

## Task 8: Add manifest frontmatter to `remote-skills/podcast-pimsleur.md`

**Files:**
- Modify: `~/.claude/skills/autopilot/remote-skills/podcast-pimsleur.md`

- [ ] **Step 1: Update frontmatter**

The current file has no YAML frontmatter — it starts with `# Pimsleur Mode — reference`. Prepend this block at the very top:

```yaml
---
name: remote-podcast-pimsleur
description: Pimsleur bilingual Japanese immersion variant of remote-podcast. Triggered by [PIMSLEUR] marker in the brief. Loaded as a reference by remote-podcast.md.
credentials:
  - name: ANTHROPIC_API_KEY
    check: env
    required: true
  - name: GEMINI_API_KEY
    check: env
    required: true
  - name: TELEGRAM_BOT_TOKEN
    check: env
    required: true
  - name: TELEGRAM_CHAT_ID
    check: env
    required: true
interview:
  - id: episode_number
    prompt: "Episode number? (auto-read from profile.yaml if blank)"
  - id: ratio_override
    prompt: "Override japanese_ratio from schedule.yaml? (leave blank to use scheduled)"
  - id: topic_vehicle
    prompt: "Topic used as the vehicle for vocab (trip planning, daily life, etc.)?"
payload:
  - path: scripts/generate.sh
    required: true
  - path: scripts/verify-dialogue.py
    required: true
  - path: remote-skills/podcast-pimsleur.md
    required: true
---

```

Keep the existing `# Pimsleur Mode — reference` heading and the full body that follows — do not modify any existing content below the frontmatter.

- [ ] **Step 2: Verify manifest parses**

```bash
cd ~/.claude/skills/autopilot
python3 scripts/dispatch-gate.py parse-manifest remote-skills/podcast-pimsleur.md
```

Expected: JSON with all three sections.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/skills/autopilot
git add remote-skills/podcast-pimsleur.md
git commit -m "feat(autopilot): add credentials+interview+payload manifest to pimsleur skill"
```

---

## Task 9: Add manifest frontmatter to `remote-skills/investigate.md`

**Files:**
- Modify: `~/.claude/skills/autopilot/remote-skills/investigate.md`

- [ ] **Step 1: Update frontmatter**

The current file has no YAML frontmatter — it starts with `# Remote Investigate — ...`. Prepend:

```yaml
---
name: remote-investigate
description: Execute a spec's testable steps inside a Managed Agent container, collect real results, generate a data-grounded podcast, deliver via Telegram.
credentials:
  - name: ANTHROPIC_API_KEY
    check: env
    required: true
  - name: GEMINI_API_KEY
    check: env
    required: true
  - name: TELEGRAM_BOT_TOKEN
    check: env
    required: true
  - name: TELEGRAM_CHAT_ID
    check: env
    required: true
interview:
  - id: spec_path
    prompt: "Path to the spec/brief to execute?"
  - id: needs_repo
    prompt: "Does the investigation need a GitHub repo mounted? (y/n)"
  - id: cost_ceiling
    prompt: "Max spend for the investigation? (e.g., '$5')"
payload:
  - path: scripts/generate.sh
    required: true
---

```

Keep the existing `# Remote Investigate — Spec-to-Execution-to-Audio (Managed Agent Version)` heading and body unmodified below the frontmatter.

- [ ] **Step 2: Verify manifest parses**

```bash
cd ~/.claude/skills/autopilot
python3 scripts/dispatch-gate.py parse-manifest remote-skills/investigate.md
```

Expected: JSON with all three sections.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/skills/autopilot
git add remote-skills/investigate.md
git commit -m "feat(autopilot): add credentials+interview+payload manifest to investigate skill"
```

---

## Task 10: Create `dispatch.md` (replaces `intake.md`) and delete old file

**Files:**
- Create: `~/.claude/skills/autopilot/dispatch.md`
- Delete: `~/.claude/skills/autopilot/intake.md`

- [ ] **Step 1: Create `dispatch.md`**

Write the following to `~/.claude/skills/autopilot/dispatch.md`:

```markdown
# Autopilot Dispatch — Three-Gate Flow

Every dispatch passes three non-negotiable gates:

1. **Credentials** — pre-launch check, hard block on missing required creds
2. **Outcome checklist** — done-criteria the remote can self-verify against
3. **Behavior / process** — free-form path to outcome (exploration → exploitation)

Gates 2+3 together form **the brief**. Nothing launches unless all three pass.

## Directory Layout

Every dispatch writes to `briefs/YYYY-MM-DD-<slug>/` containing:

- `outcome.md` — checklist
- `behavior.md` — free-form process
- `context.md` — user-curated pointers to local state (plan files, commits, notes)
- `payload.json` — resolved file list mounted into the remote session
- `credentials.json` — pass/fail record of the credentials check
- `dispatch.log` — launch record (timestamp, session ID, exit)

`briefs/` is gitignored. It's the permanent local record of dispatches.

## Step-by-Step

### Step 1 — Select remote skill

List `remote-skills/*.md` and prompt the user to pick one. The selected file provides the `credentials:`, `interview:`, and `payload:` manifest used for this dispatch.

### Step 2 — Interview

Read the selected skill's `interview:` list and ask each `prompt` one at a time. Collect free-form answers.

### Step 3 — Draft brief

Synthesize the interview answers into two files under the new brief directory:

- `outcome.md` — turn answers into a concrete checklist of done-criteria
- `behavior.md` — free-form process/heuristics the remote should follow

Show both files to the user for edit/approval. Do NOT advance until the user approves.

### Step 4 — Context pointers

Prompt: "Paste any local artifact paths the remote should read (plan files, specs, recent notes). One per line." Write the answer to `context.md`.

### Step 5 — Payload manifest

Resolve the skill's declared `payload:` entries + every line in `context.md` into a concrete file list. Write to `payload.json`:

```json
{
  "skill_declared": ["scripts/generate.sh", "scripts/verify-dialogue.py"],
  "extra": ["docs/superpowers/specs/2026-04-19-foo.md"]
}
```

Show the combined list to the user. Confirm or edit.

### Step 6 — User approval

Display `outcome.md`, `behavior.md`, `context.md`, and the payload list together. Wait for explicit approval. If the user edits any file, re-display and re-confirm.

### Step 7 — Credentials gate (hard block)

Run:

```bash
python3 scripts/dispatch-gate.py all remote-skills/<skill>.md briefs/<dispatch>/
```

If exit code is non-zero: print the failure rows, refuse to launch, and tell the user exactly what's missing. Do NOT proceed.

On success, write the check results to `credentials.json` in the brief directory.

### Step 8 — Launch

Use the same curl flows previously in `intake.md` (Phase 3: Create Agent, Phase 4: Create Session & Dispatch) with these adjustments:

- The agent's skills array includes the uploaded remote skill + brainstorming
- The session `resources` array includes every file in `payload.json` (skill-declared + user extras), each mounted at a sensible path under `/workspace/`
- The brief sent as the first `user.message` is the concatenation of `outcome.md` + `behavior.md` + `context.md` with clear section headers

Append the launch record to `briefs/<dispatch>/dispatch.log`:

```
{timestamp} session_id={SESSION_ID} agent_id={AGENT_ID} exit=launched
```

### Step 9 — Post-launch

Print the session ID and URL. Append the session to `.superpowers/autopilot-sessions.json`. The brief directory remains as the permanent dispatch record.

## Skipping a Gate

The skill refuses shortcuts. If a user says "just dispatch it," explain which gate they're trying to skip and require them to supply the missing piece. The only exception: `check: remote-secret` entries report as manual-verify rather than hard-block (autopilot can't check the remote env from outside).

## Legacy API Call Reference

All managed-agents API curls from the previous `intake.md` are preserved structurally — only the orchestration above them changes. Key references for the launch step:

- Upload custom skill: `POST /v1/skills` with `anthropic-beta: skills-2025-10-02`
- Upload file: `POST /v1/files` with `anthropic-beta: files-api-2025-04-14`
- Create agent: `POST /v1/agents` with `anthropic-beta: managed-agents-2026-04-01`
- Create session: `POST /v1/sessions`
- Send event: `POST /v1/sessions/{id}/events`

Required header on all: `x-api-key: $ANTHROPIC_API_KEY`, `anthropic-version: 2023-06-01`.
```

- [ ] **Step 2: Delete `intake.md`**

```bash
cd ~/.claude/skills/autopilot
git rm intake.md
```

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/skills/autopilot
git add dispatch.md
git commit -m "refactor(autopilot): replace intake.md with dispatch.md (three-gate flow)"
```

---

## Task 11: Create `poll.md` (renamed from `status.md`) and rewrite `SKILL.md`

**Files:**
- Create: `~/.claude/skills/autopilot/poll.md`
- Delete: `~/.claude/skills/autopilot/status.md`
- Modify: `~/.claude/skills/autopilot/SKILL.md`

- [ ] **Step 1: Copy `status.md` content to `poll.md` with title update**

```bash
cd ~/.claude/skills/autopilot
cp status.md poll.md
```

Then edit `poll.md` — change the top heading from `# Autopilot Status Check` to `# Autopilot Poll — Session Status Flow` and leave the body unchanged (the status-polling curl logic is still correct).

- [ ] **Step 2: Delete `status.md`**

```bash
cd ~/.claude/skills/autopilot
git rm status.md
```

- [ ] **Step 3: Rewrite `SKILL.md`**

Replace the entire file with the content below. The key changes:

- "Routing" section points at `dispatch.md` and `poll.md`
- The "Two Modes of Operation" block is deleted (the three-gate flow replaces it — no more fast/slow choice; every dispatch is disciplined)
- Top-level description notes the three gates explicitly

```markdown
---
name: autopilot
description: |
  Dispatch autonomous work to Claude Managed Agents through a three-gate pipeline (credentials + outcome checklist + behavior brief). Also generates podcasts and investigations locally.
  Triggers: "autopilot", "dispatch", "autopilot status", "autopilot list", "autopilot podcast", "autopilot investigate"
  Local skills /podcast and /investigate are registered separately via skills/ directory.
---

# Autopilot — Managed Agent Command Center

Dispatch autonomous work to Claude Managed Agents through a disciplined three-gate pipeline. One plugin, two execution modes:

- **Remote** (`/autopilot`) — work runs on Anthropic's infrastructure, gated by credentials + brief
- **Local** (`/podcast`, `/investigate`) — work runs in your Claude Code session

**Announce at start:** "I'm using the autopilot skill to [dispatch new work / generate a podcast / check status / list sessions]."

## The Three Gates (for every remote dispatch)

1. **Credentials** — pre-launch check; missing required cred = hard block
2. **Outcome checklist** — concrete done-criteria the remote can self-verify against
3. **Behavior / process** — free-form path: exploration vs. exploitation, heuristics, stop conditions

Gates 2+3 together form **the brief**, written as `outcome.md` + `behavior.md` in `briefs/YYYY-MM-DD-<slug>/`. Credentials are verified by `scripts/dispatch-gate.py`. No shortcuts — the skill refuses to launch with any gate unfilled.

See `dispatch.md` for the full step-by-step flow.

## Subcommands

| Invocation | Where | Action |
|---|---|---|
| `/autopilot` | Remote | New dispatch — runs the three-gate flow (see `dispatch.md`) |
| `/autopilot podcast <brief>` | Remote | Three-gate dispatch using `remote-skills/podcast.md` |
| `/autopilot podcast pimsleur <brief>` | Remote | Three-gate dispatch using `remote-skills/podcast-pimsleur.md` (episode numbering + curriculum logic runs during the interview step) |
| `/autopilot investigate <brief>` | Remote | Three-gate dispatch using `remote-skills/investigate.md` |
| `/autopilot status` | Local (polls remote) | See `poll.md` |
| `/autopilot list` | Local (polls remote) | Show all tracked sessions |
| `/podcast <file>` | Local | Narrate a doc into podcast audio (registered via skills/podcast/) |
| `/investigate <file>` | Local | Execute a spec, collect results, podcast findings (registered via skills/investigate/) |

## Routing

**On `/autopilot` (with or without a skill name):**

1. Read `setup.md` — ensure `environment_id` exists in `.superpowers/autopilot-config.json`
2. Read `dispatch.md` — run the three-gate dispatch flow

**On `/autopilot status`:**

1. Read `poll.md` — run the session status flow
2. Critical: check `stop_reason` on `session.status_idle` events. `requires_action` = blocked waiting for input.

**On `/autopilot list`:** (unchanged)

1. Read `.superpowers/autopilot-sessions.json`
2. For each session, fetch current status via `GET /v1/sessions/{id}`
3. Display table (see `poll.md` for format).

**On `/podcast <file>` or `/investigate <file>`:** local skills handle these, no managed agents involved.

## Pimsleur Episode Numbering

When dispatching `podcast-pimsleur`, the interview step (see `dispatch.md`) runs the episode-numbering logic that used to live in `intake.md`:

- Read `monorepo/data/japanese/profile.yaml` → `episodes_completed` → next episode number is +1
- Read `monorepo/data/japanese/schedule.yaml` → find `episode_<N>` slot, use its `vocab`, `grammar`, `japanese_ratio` verbatim
- Check comprehension gating (average `exposures` of episode N-2 items ≥ 8 to allow ratio bump)
- Build review list from `vocabulary.yaml` + `grammar.yaml` (status new/learning)
- Mark slot `dispatched` in `schedule.yaml`, increment `profile.yaml`, commit
- Bundle curriculum files into the payload (mount at `/workspace/japanese/`)

Write the resolved episode number, ratio, vocab, grammar, and review items into `outcome.md` so the agent self-verifies against them.

## API Conventions

All Managed Agents API calls use `curl` via Bash with these headers:

```bash
curl -sS https://api.anthropic.com/v1/{endpoint} \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json"
```

For skills upload, also include: `-H "anthropic-beta: skills-2025-10-02"`.

The `ANTHROPIC_API_KEY` environment variable must be set (source from `.env` if needed).

## Local State Files

- `.superpowers/autopilot-config.json` — one-time setup results (environment ID, vault ID)
- `.superpowers/autopilot-sessions.json` — active/historical session tracking
- `briefs/YYYY-MM-DD-<slug>/` — per-dispatch permanent record (gitignored)

## Networking Limitations

The managed agent container routes all outbound traffic through an HTTP proxy:

- **No direct TCP connections** — `psql`, `mysql`, `redis-cli`, raw sockets will fail
- **HTTP/HTTPS only** — `curl`, `wget` work fine (via proxy)
- **For database access**, use REST APIs:
  - Supabase: PostgREST via `curl` with service role key
  - Other DBs: use any HTTP-based query API
- **Do NOT include `psql` connection strings in briefs** — wastes agent time

When the brief needs DB access, provide HTTP credentials (API URLs + tokens), not connection strings.

## Key Principles

- **Three gates, every time** — No dispatch skips credentials, outcome, or behavior. The skill refuses shortcuts.
- **Agent created per-job** — Each dispatch creates a fresh agent with skills tailored to the task.
- **`ask_user` is the interactive bridge** — Agent calls it, session goes idle with `stop_reason: requires_action`, `/autopilot status` surfaces the question.
- **Skills are the agent's expertise** — Upload relevant skills (custom or Anthropic pre-built) based on the task.
- **Git is the persistence layer** — The agent commits to `autopilot/<slug>` branches as it works.
- **PRs are created by the orchestrator** — `gh` CLI does not work inside the container; PRs are created locally via `/autopilot status` (or via GitHub MCP if a vault credential is configured).
- **Always check `stop_reason`** — `end_turn` = done, `requires_action` = blocked waiting for input.
- **Agent updates require versioning** — `POST /v1/agents/:id` requires a `version` field (optimistic concurrency).
- **`agent.thinking` events exist** — Filter these out when displaying messages.
```

- [ ] **Step 4: Verify no dangling references**

```bash
cd ~/.claude/skills/autopilot
grep -rn "intake.md\|status.md" --include="*.md" .
```

Expected: no matches (besides potentially the deleted files themselves, which git has already removed).

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills/autopilot
git add SKILL.md poll.md
git commit -m "refactor(autopilot): rewrite SKILL.md, rename status.md->poll.md, wire three-gate flow"
```

---

## Task 12: Push autopilot skill repo changes

**Files:** (no file changes — git operation only)

- [ ] **Step 1: Verify working tree clean and test suite passes**

```bash
cd ~/.claude/skills/autopilot
git status
python3 -m pytest scripts/test_dispatch_gate.py -v
```

Expected: clean working tree; all gate tests PASS.

- [ ] **Step 2: Push**

```bash
cd ~/.claude/skills/autopilot
git push origin HEAD
```

Expected: commits land on the remote. (Memory note: always push skill-repo changes.)

---

## Task 13: Update local podcast skill with outcome checklist

**Files:**
- Modify: `/home/clsandoval/cs/monorepo/.claude/skills/podcast/SKILL.md`

- [ ] **Step 1: Add outcome-checklist step**

Edit `.claude/skills/podcast/SKILL.md`. Find the line that starts the `## Workflow` section:

```markdown
## Workflow

1. Read the artifact at the given filepath
```

Replace ONLY that `## Workflow` heading line with the following block (leave the original numbered list `1. Read the artifact...` through `7. Report to the user...` completely unchanged directly below):

```markdown
## Workflow

### Outcome checklist (gate before generation)

Before running the numbered workflow below, produce a short outcome checklist inline and show it to the user:

- [ ] Source artifact: `<filepath>`
- [ ] Episode name / slug: `<derived-from-filename>`
- [ ] Target duration: `<minutes>` (from the length guidelines below)
- [ ] One non-obvious thread the episode will make (fill in after reading)
- [ ] Done criteria: transcript saved, MP3 generated, duration within ±20% of target

Wait for user approval (or inline edits) before proceeding to step 1. This keeps the local podcast flow conceptually aligned with the three-gate remote flow (`autopilot/dispatch.md`) — same outcome-first discipline, minus the credentials and payload gates.

### Numbered steps
```

The existing `1. Read the artifact at the given filepath` line and all following numbered items (2-7) stay exactly as they were — they now live under the `### Numbered steps` subheading. Do not renumber anything. Do not delete or reorder any existing content.

- [ ] **Step 2: Verify the file still parses**

```bash
cd /home/clsandoval/cs/monorepo
head -60 .claude/skills/podcast/SKILL.md
```

Expected: frontmatter intact, `### Outcome checklist (gate before generation)` subsection present before `### Numbered steps`, and `1. Read the artifact...` still begins the numbered list unchanged.

- [ ] **Step 3: Commit**

```bash
cd /home/clsandoval/cs/monorepo
git add .claude/skills/podcast/SKILL.md
git commit -m "feat(podcast): add outcome-checklist gate before generation (sync with autopilot three-gate model)"
```

---

## Task 14: Dry-run the full flow against `podcast` skill manifest

**Files:** (no file changes — verification only)

- [ ] **Step 1: Create a throwaway brief and run all gates**

```bash
cd ~/.claude/skills/autopilot
export TMPBRIEF=$(mktemp -d)
cat > $TMPBRIEF/outcome.md <<'EOF'
- [ ] Episode about "three-gate dispatch" generated
- [ ] Transcript saved
- [ ] MP3 sent via Telegram
EOF
cat > $TMPBRIEF/behavior.md <<'EOF'
Lead with the non-obvious claim: gates are non-negotiable. Dry humor. ~30 min.
EOF
echo '{"extra": []}' > $TMPBRIEF/payload.json
python3 scripts/dispatch-gate.py all remote-skills/podcast.md $TMPBRIEF
```

Expected behavior:
- If all 4 credentials (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) are set in your env AND `scripts/generate.sh` + `scripts/verify-dialogue.py` exist, exit 0 with all gates PASS.
- If any credential is missing, exit non-zero and name the missing cred.

Either outcome is acceptable — the point is confirming the script drives end-to-end without crashing. If it crashes, debug before continuing.

- [ ] **Step 2: Clean up**

```bash
rm -rf $TMPBRIEF
unset TMPBRIEF
```

- [ ] **Step 3: Repeat for investigate and pimsleur**

```bash
export TMPBRIEF=$(mktemp -d)
echo "- [ ] done" > $TMPBRIEF/outcome.md
echo "explore then commit" > $TMPBRIEF/behavior.md
echo '{"extra": []}' > $TMPBRIEF/payload.json

python3 scripts/dispatch-gate.py all remote-skills/investigate.md $TMPBRIEF
python3 scripts/dispatch-gate.py all remote-skills/podcast-pimsleur.md $TMPBRIEF

rm -rf $TMPBRIEF
unset TMPBRIEF
```

Expected: both runs either PASS cleanly or fail with a clear, actionable message.

- [ ] **Step 4: No commit needed** — dry-run is verification only.

---

## Self-Review Checklist (do this before marking the plan complete)

1. **Spec coverage** — every section of the spec maps to a task:
   - Three gates → Tasks 1-5 (validator) + Task 10 (dispatch flow doc)
   - Per-dispatch brief dir → Task 6 (briefs/ + gitignore), Task 10 (layout)
   - Manifest per remote skill → Tasks 7-9
   - SKILL.md rewrite → Task 11
   - Delete intake.md / status.md → Tasks 10 + 11
   - Local podcast alignment → Task 13
   - Push to remote → Task 12

2. **Placeholder scan** — no TBD/TODO/"similar to Task N" references. Every step contains concrete content.

3. **Type consistency** — manifest field names (`credentials`, `interview`, `payload`, `name`, `check`, `required`, `path`, `prompt`, `id`) are used uniformly across all 3 remote skill manifests and the validator.

4. **Verification before completion** — Task 14 is a dry-run of the whole pipeline before declaring victory.
