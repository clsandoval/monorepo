# Commit-msg Hook Enforcement Strategy

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-i — Warn vs. block on missing trailers; warn-first adoption period vs. immediate enforcement; hook bypass (`--no-verify`) auditing; interaction with pre-existing commit-msg hooks in the l10n pipeline

**Parent:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a — Renewal justification as commit message convention (established: Option 2 structured git trailers as Phase 1 convention; `Allowlist-Entry`, `Allowlist-Renewals`, `Allowlist-Expires`, `Allowlist-Verdict`, `Allowlist-Ticket`, `Allowlist-Source` as required trailer fields; Phase 2 CLI tool `make renew-allowlist` generates these automatically)

**The gap this closes:** The parent recommends "a commit-msg hook that warns (not blocks) when a commit touching the allowlist file lacks `Allowlist-Entry` trailers" — but that's a single sentence about a system with at least six design decisions embedded in it. WHEN does the hook fire (which files trigger it)? WHAT does it check (all trailers or just `Allowlist-Entry`)? HOW does it communicate failure (stderr message, colored output, exit code)? What happens during the adoption period when half the team doesn't know the convention? What happens when someone uses `--no-verify` to bypass the hook — is that silent escape acceptable, or does it leave an auditable gap? And critically: the l10n pipeline already has CI checks (Tier 1 PR-blocking lint from 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-A, budget validation from 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-1-a-i, schema drift detection from 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i) — how does a commit-msg hook layer with these without creating a whack-a-mole enforcement landscape where developers get blocked at three different points in their workflow for overlapping reasons?

---

## The Enforcement Spectrum

Commit-msg hooks live in a unique enforcement position: they fire BEFORE the commit is recorded but AFTER the developer has written their message and mentally "finished" the task. This timing creates a specific emotional context — the developer has done the work, written the description, and is ready to move on. An enforcement failure at this point feels like the system snatching back a completed task.

The spectrum runs from **invisible advisory** (no exit code, message to stderr) through **visible warning** (yellow banner, exit 0) through **soft block** (exit 1 with an override instruction printed) to **hard block** (exit 1, no documented override except `--no-verify`).

Each position on the spectrum trades enforcement completeness against developer friction. The further toward "hard block," the fewer non-conforming commits enter the history — but the more developers learn to reflexively bypass the hook.

---

## Six Design Options

### Option A: Pure Warning ("The Yellow Banner")

The hook prints a warning to stderr but always exits 0. The commit proceeds regardless.

```
⚠️  l10n/tier1.5-phantom-allowlist.json was modified but this commit
    has no Allowlist-Entry trailer.

    Expected format:
      Allowlist-Entry: --flag-name
      Allowlist-Renewals: N
      Allowlist-Expires: YYYY-MM-DD
      Allowlist-Verdict: renew|promote|permanent|remove|defer
      Allowlist-Ticket: TICKET-ID|none

    See: docs/l10n/renewal-convention.md

    This is an advisory — commit will proceed.
```

The warning renders as a block of text BELOW the normal `[main abc1234] commit message` output line — meaning the developer sees success first, then the warning. The warning is yellow-highlighted using ANSI escape codes (degrading gracefully to plain text in terminals without color support).

**Strengths:**
- **Zero friction.** Never blocks anyone. Never provokes `--no-verify` reflexes.
- **Gradual adoption.** The team discovers the convention organically through warnings. Early adopters start writing trailers; laggards see the warning and eventually ask "what's this about?"
- **No false positive rage.** If the hook has a bug (wrong file detection, trailer parsing error), it's a confusing warning, not a workflow-blocker.
- **CI as true enforcement.** The Tier 1 PR-time lint (established by the parent chain) is the real gate. The hook is a courtesy pre-notification.

**Weaknesses:**
- **Warning fatigue.** Developers who see the same yellow block on every commit touching the file learn to stop reading it. After 20 commits, the warning is wallpaper.
- **No compliance signal.** The team lead has no way to know whether the convention is being followed without manually auditing git log. There's no metric for "% of allowlist commits with trailers."
- **Split enforcement.** The developer sees a warning at commit time, then gets blocked by Tier 1 at PR time. The warning said "advisory" — the PR block says "required." This inconsistency erodes trust in both systems.

**When to use:** First 2 weeks of convention rollout. Pure warning is the adoption ramp — it should be time-limited, not permanent.

### Option B: Warn-Then-Block ("The Adoption Timer")

The hook starts in warning mode (Option A) and transitions to blocking mode after a configured date. The date is stored in a file the hook reads:

```bash
# .l10n-hooks/commit-msg-enforcement.conf
ENFORCEMENT_MODE=warn     # warn | block
ENFORCEMENT_DATE=2026-04-15   # date when mode transitions to block
TRANSITION_WARNING_DAYS=7     # start counting down N days before
```

During the warn phase, the output matches Option A. Seven days before the enforcement date, the warning adds a countdown:

```
⚠️  l10n allowlist commit convention will be ENFORCED in 5 days (2026-04-15).
    This commit would be BLOCKED after that date.
    Missing trailers: Allowlist-Entry, Allowlist-Verdict
```

After the enforcement date, the hook exits 1:

```
❌  l10n/tier1.5-phantom-allowlist.json was modified but this commit
    has no required Allowlist-Entry trailers.

    Missing: Allowlist-Entry, Allowlist-Renewals, Allowlist-Expires,
             Allowlist-Verdict, Allowlist-Ticket

    To generate correct trailers, run:
      make renew-allowlist FLAG=<your-flag>

    To bypass (NOT recommended):
      git commit --no-verify -m "..."

    ⚠️  Bypassed commits will be flagged in CI.
```

**Strengths:**
- **Predictable transition.** The team knows exactly when enforcement starts. No surprise blocks.
- **Countdown creates urgency.** The "5 days until enforcement" message motivates adoption without blocking anyone.
- **Single configuration.** One file controls the mode. The team lead flips `ENFORCEMENT_MODE=block` and the transition is complete.
- **Documents its own lifecycle.** The date and mode are visible to anyone who reads the config file.

**Weaknesses:**
- **Config file management.** The enforcement config must be committed, distributed, and kept in sync across developer machines. If a developer's hook reads a stale config, they're in the wrong mode.
- **Cliff edge.** The transition from "all warnings" to "all blocks" is abrupt. A developer who was on vacation during the countdown returns to a blocking hook with no context.
- **Two modes means two code paths.** The hook has conditional logic that must be tested in both modes. A bug in the block path may not be discovered until enforcement day.

**When to use:** Teams with a formal convention rollout process and a designated enforcement date. The countdown mechanism works well with sprint-boundary rollouts ("enforcement starts next sprint").

### Option C: Soft Block with Inline Override ("The Speed Bump")

The hook always exits 1 when trailers are missing — but prints a command that generates a magic override token, allowing the commit to proceed with an explicit acknowledgment:

```
❌  l10n/tier1.5-phantom-allowlist.json was modified without required
    Allowlist-Entry trailers.

    If this is intentional (e.g., whitespace change, comment edit):
      L10N_SKIP_TRAILER_CHECK=1 git commit -m "..."

    If this is a renewal, run:
      make renew-allowlist FLAG=<your-flag>
```

The override is an environment variable, not `--no-verify`. This is critical: `--no-verify` disables ALL hooks, while the env var disables only this specific check. The developer's other commit-msg hooks (conventional commit linting, DCO sign-off, etc.) continue to fire.

When the env var override is used, the hook prints a different message:

```
⚠️  Allowlist trailer check SKIPPED (L10N_SKIP_TRAILER_CHECK=1).
    This commit will be flagged in CI.
```

**Strengths:**
- **Granular bypass.** Disables only the allowlist check, not all hooks. This is the key advantage over `--no-verify`.
- **Documented intent.** The env var in the developer's shell history records that they consciously chose to skip the check. This is auditable.
- **Immediate enforcement.** No adoption period needed — the override provides the escape hatch.
- **Teaches the right tool.** The error message surfaces `make renew-allowlist` at the exact moment the developer needs it.

**Weaknesses:**
- **Friction for legitimate non-renewal edits.** Reformatting the allowlist JSON, fixing a typo in a `reason` field, or updating `source_location` without changing `expires` triggers the block. The developer must either add trailers (which don't apply to formatting changes) or use the env var override.
- **Env var is ugly.** `L10N_SKIP_TRAILER_CHECK=1 git commit -m "..."` is a mouthful. Developers will alias it, and the alias hides the intent.
- **Override creep.** If the env var becomes a reflex ("oh, the allowlist thing — just set the env var"), it's no better than warning fatigue. Worse, because it adds typing.

**When to use:** Teams that want immediate enforcement with a surgical bypass. Best combined with a CI audit that counts env-var overrides per developer per quarter.

### Option D: Hard Block, No Override ("The Iron Gate")

The hook exits 1 when trailers are missing. No documented override. The only escape is `--no-verify`, which the hook does not mention.

```
❌  l10n/tier1.5-phantom-allowlist.json was modified without required
    Allowlist-Entry trailers.

    Required trailers:
      Allowlist-Entry: <flag name>
      Allowlist-Renewals: <integer>
      Allowlist-Expires: <YYYY-MM-DD>
      Allowlist-Verdict: renew|promote|permanent|remove|defer
      Allowlist-Ticket: <ticket ID or "none">

    To generate correct trailers automatically:
      make renew-allowlist FLAG=<your-flag>

    Documentation: docs/l10n/renewal-convention.md
```

**Strengths:**
- **Maximum compliance.** Every allowlist-modifying commit either has trailers or was explicitly bypassed via `--no-verify` (which is discoverable in CI via the absence of hook-generated metadata).
- **Simplest logic.** No conditional modes, no env vars, no date checks. The hook is 30 lines of bash.
- **Strongest teaching signal.** The developer MUST engage with the trailer convention to proceed. No "I'll fix it later" path.

**Weaknesses:**
- **`--no-verify` escape is opaque.** Developers who know about `--no-verify` will use it. Developers who don't will be stuck. This creates a knowledge-asymmetry problem where senior developers bypass freely while junior developers are blocked.
- **Collateral damage.** `--no-verify` disables ALL hooks, including unrelated ones (conventional commit lint, DCO sign-off, secret detection). A developer who `--no-verify`s to skip the allowlist check also skips the secret scanner.
- **Hostility at the margins.** A developer making a trivial JSON formatting fix is blocked by a system demanding renewal metadata they don't have. This breeds resentment.

**When to use:** Small teams (<5) with uniform git proficiency where `--no-verify` is a known and acceptable escape valve. Not recommended for teams with mixed experience levels.

### Option E: Tiered Check with Differential Requirements ("The Smart Gate")

The hook analyzes the DIFF, not just the file presence, and applies different requirements based on what changed:

| Change type | Detected by | Requirement |
|------------|-------------|-------------|
| `expires` field changed | JSON diff parse | Full trailer set (all 6 fields) |
| `renewals` field changed | JSON diff parse | Full trailer set |
| `reason` field changed | JSON diff parse | `Allowlist-Entry` + `Allowlist-Verdict` minimum |
| `source_location` changed | JSON diff parse | `Allowlist-Entry` minimum |
| New entry added | Key not in HEAD version | Full trailer set |
| Entry removed | Key in HEAD, not in staged | `Allowlist-Entry` + `Allowlist-Verdict: remove` |
| Whitespace/formatting only | No semantic JSON diff | No trailers required |
| `schema_version` changed | Field diff | No trailers required (schema migration, not renewal) |

The hook runs `git diff --cached -- l10n/tier1.5-phantom-allowlist.json`, parses the JSON before and after, and determines which category the change falls into.

```
ℹ️  Detected: expires and renewals changed for --enumerate-args
    → Full trailer set required.

❌  Missing trailers: Allowlist-Entry, Allowlist-Renewals, Allowlist-Expires,
    Allowlist-Verdict, Allowlist-Ticket

    Run: make renew-allowlist FLAG=--enumerate-args
```

Or for a formatting-only change:

```
ℹ️  Detected: whitespace-only changes to allowlist file.
    → No Allowlist trailers required.
    ✅ Commit will proceed.
```

**Strengths:**
- **Surgical enforcement.** Only blocks when trailers are semantically relevant. Formatting fixes, source_location updates, and schema migrations pass without friction.
- **Self-documenting.** The "Detected:" line tells the developer exactly what the hook saw and why it's requiring (or not requiring) trailers. No guesswork.
- **Eliminates the primary override case.** Option C's env var override exists mainly for non-renewal edits. Option E makes the override unnecessary by recognizing non-renewal edits automatically.
- **Teaches the schema.** The different requirement levels implicitly teach which fields matter most (expires/renewals = core renewal action = full trailers) vs. which are supplementary.

**Weaknesses:**
- **Complexity.** The hook must parse JSON, compute a semantic diff, and map changes to categories. This is a 200+ line script, not a 30-line bash check. Bugs in the diff parser create bizarre enforcement behavior.
- **Edge cases.** What if a developer changes BOTH `expires` (renewal) and `source_location` (non-renewal) in the same commit? The hook must take the STRICTEST requirement across all detected changes. What if the JSON is malformed in the staged version? The hook must handle parse errors gracefully.
- **JSON parsing in a git hook.** The hook runs on every commit. JSON parsing (even with `jq`) adds latency. On a large allowlist file, this could add 200-500ms to every commit — not just allowlist-modifying commits, because the hook must first check whether the allowlist file is in the staged set.
- **Maintenance burden.** The category table must be updated when new allowlist fields are added. The hook's behavior is complex enough to need its own test suite.

**When to use:** Teams with 10+ allowlist entries and frequent non-renewal edits (formatting, source_location updates, schema migrations). The complexity is justified when developers regularly touch the file for reasons other than renewal.

### Option F: CI-Only Enforcement, No Local Hook ("The Remote Gate")

No commit-msg hook at all. All trailer enforcement happens in the Tier 1 PR-time lint:

```yaml
# In CI lint config
- name: allowlist-trailer-check
  when: files_changed includes "l10n/tier1.5-phantom-allowlist.json"
  require:
    - at least one commit in PR has Allowlist-Entry trailer
    - trailer Allowlist-Verdict is in [renew, promote, permanent, remove, defer]
    - if expires changed: full trailer set required
  block: true
  message: |
    PR modifies phantom allowlist but no commit has required Allowlist-Entry trailers.
    See docs/l10n/renewal-convention.md for format.
    Run `make renew-allowlist FLAG=<flag>` to generate a conforming commit.
```

**Strengths:**
- **Zero local setup.** No hook installation, no config files, no env vars. Works for every developer on every machine from day one.
- **Single enforcement point.** Developers learn to check ONE place for l10n feedback: the CI lint on their PR. No split enforcement between local hook warnings and CI blocks.
- **Handles squash-merge.** If the team uses squash merge, individual commit trailers are lost — but CI can check the PR description or the squash commit message. A local hook can't adapt to the merge strategy.
- **No `--no-verify` problem.** There's nothing to bypass locally. The CI check is the enforcement, and it can't be skipped without admin override.

**Weaknesses:**
- **Late feedback.** Developer writes 3 commits, pushes, opens PR, waits for CI, sees failure, fixes, pushes again. The feedback loop is 5-10 minutes instead of instant.
- **No teaching moment.** The local hook surfaces `make renew-allowlist` at the exact moment the developer is committing. CI surfaces it minutes later when they've context-switched.
- **Batch problem.** A PR with 5 commits modifying the allowlist — which commit should have the trailers? All of them? Just the last one? The CI check must define this policy.

**When to use:** Teams that have already invested in a comprehensive CI lint pipeline (which Robot Uprising has, via Tier 1) and want to avoid the maintenance cost of local hooks. Especially suitable for teams with diverse development environments (Windows, Mac, Linux, Codespaces) where hook installation is unreliable.

---

## Recommendation: Option B (Adoption Timer) transitioning to Option E (Smart Gate), with Option F (CI-Only) as backstop

**Phase 1 (Weeks 1-2): Option A — Pure Warning.**
Introduce the hook in advisory mode. The warning message includes a link to the convention doc and a countdown to enforcement.

**Phase 2 (Weeks 3+): Transition to Option E — Smart Gate.**
After the adoption date, the hook blocks on missing trailers for renewal-type changes but passes formatting and non-renewal edits automatically. Option C's env var (`L10N_SKIP_TRAILER_CHECK=1`) is available as emergency bypass for edge cases the Smart Gate doesn't handle.

**Always: Option F as backstop.**
The Tier 1 CI lint checks trailers regardless of whether the local hook ran. This catches `--no-verify` bypasses, env var overrides, and developers whose hooks aren't installed.

**The layered model:**
1. **Local hook (Smart Gate):** Fast feedback, surgical enforcement, teaches the convention at commit time
2. **CI lint (Remote Gate):** Catches everything the local hook missed, handles squash-merge, provides team-wide compliance metrics
3. **`make renew-allowlist` (CLI tool):** Generates conforming commits automatically, surfaced in both hook and CI error messages

---

## The `--no-verify` Auditing Problem

`--no-verify` is git's universal hook bypass. Any developer can skip any hook by passing it. The question is: should the system care?

### Three Positions on `--no-verify`

**Position 1: Ignore It ("Trust the CI")**

If the developer uses `--no-verify`, the local hook doesn't fire, the commit goes through without trailers, and CI catches it at PR time. No special handling needed. The CI lint is the enforcement layer; the local hook is a convenience.

*Advantage:* Simplest. No additional tooling.
*Disadvantage:* No signal about WHY the developer bypassed. Was it a conscious choice or a habit?

**Position 2: Audit It ("The Bypass Log")**

A separate git hook (post-commit, which fires even after `--no-verify`) checks whether the commit modified the allowlist file and whether it has trailers. If it modified the file without trailers, it logs the event to a local file:

```
# .l10n-hooks/bypass-log.jsonl
{"timestamp":"2026-04-20T14:32:00Z","commit":"abc1234","file":"l10n/tier1.5-phantom-allowlist.json","trailers_present":false,"no_verify_suspected":true}
```

The bypass log is gitignored (it's local-only). A weekly `make l10n-audit-local` command summarizes bypass frequency. The CI version doesn't need this — it simply checks the commit directly.

*Advantage:* Developers can self-audit their bypass habits. Team leads can ask "how often are you bypassing?" without building surveillance.
*Disadvantage:* Post-commit hooks are also skippable (though `--no-verify` is documented as only affecting pre-commit and commit-msg hooks — post-commit fires regardless in most git versions). Also: logging locally without reporting is self-surveillance, which may not change behavior.

**Position 3: Make It Unnecessary ("The Golden Path")**

Instead of auditing bypass, make the hook so low-friction that `--no-verify` is never needed. This means:
- Option E's smart diff parsing handles all non-renewal edits automatically
- The env var override handles the remaining edge cases
- The `make renew-allowlist` tool makes conforming commits easier than non-conforming ones
- The hook runs in <200ms so it doesn't slow down rapid commits

If the only reason to `--no-verify` is "the hook is annoying," fix the hook.

*Advantage:* Addresses root cause rather than symptom.
*Disadvantage:* The hook will never cover 100% of edge cases. There will always be SOME reason to bypass.

**Recommendation:** Position 3 as primary strategy, Position 1 as acceptance of reality. Build the hook to be fast, smart, and low-friction. Accept that some developers will `--no-verify`. Let CI catch those commits. Don't build surveillance infrastructure for a problem that's better solved by making the right path easier than the wrong one.

---

## Interaction with Pre-existing Hooks

The l10n pipeline already has (or will have) several commit-adjacent checks:

| Check | Location | Fires when |
|-------|----------|-----------|
| Tier 1 naming convention lint | CI (PR-time) | Any commit in PR modifies l10n files |
| Budget validation | CI (PR-time) | String files or budget.json modified |
| Schema drift detector | CI (nightly) | Repair tool argument schema changes |
| Allowlist trailer check (this aspect) | Local commit-msg hook + CI | Allowlist JSON modified |

### The Hook Stacking Problem

If the developer has MULTIPLE commit-msg hooks (conventional commit linter, DCO sign-off, secret scanner, AND the allowlist trailer check), the hooks execute sequentially. A failure in ANY hook blocks the commit. The developer sees the first failure, fixes it, re-commits, sees the SECOND failure, fixes it, re-commits...

This whack-a-mole pattern is the #1 reason developers reach for `--no-verify`.

**Solution: Hook Compositor**

Instead of multiple independent commit-msg hooks, use a single dispatcher hook that runs all checks and reports ALL failures at once:

```bash
#!/bin/bash
# .git/hooks/commit-msg (compositor)

FAILURES=0
OUTPUT=""

# Check 1: Conventional commit format
result=$(check_conventional_commit "$1" 2>&1)
if [ $? -ne 0 ]; then
    OUTPUT+="$result\n\n"
    FAILURES=$((FAILURES + 1))
fi

# Check 2: Allowlist trailer check
result=$(check_allowlist_trailers "$1" 2>&1)
if [ $? -ne 0 ]; then
    OUTPUT+="$result\n\n"
    FAILURES=$((FAILURES + 1))
fi

# Check 3: Secret detection
result=$(check_secrets "$1" 2>&1)
if [ $? -ne 0 ]; then
    OUTPUT+="$result\n\n"
    FAILURES=$((FAILURES + 1))
fi

if [ $FAILURES -gt 0 ]; then
    echo -e "\n━━━ Commit blocked: $FAILURES issue(s) found ━━━\n"
    echo -e "$OUTPUT"
    exit 1
fi
```

The developer sees ALL problems at once and fixes them in one pass. The compositor pattern eliminates the whack-a-mole loop entirely.

**Installation:** The compositor is installed via `make setup-hooks` (or Husky/lefthook for Node projects). Each check is a separate script in `.l10n-hooks/checks/` that the compositor discovers and executes.

### Husky/Lefthook Integration

If the project uses Husky (common in Node/React projects — and Robot Uprising uses React + Vite), the allowlist check integrates as one entry in `.husky/commit-msg`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx commitlint --edit $1
.l10n-hooks/checks/allowlist-trailers.sh $1
```

Husky handles hook installation automatically via `prepare` script. No manual `.git/hooks/` management. This solves the "hooks not installed on new machine" problem.

---

## Player Journeys

### Journey: Aarav, 28, Platform Engineer, Third Allowlist Renewal

**Context:** Aarav has been maintaining the l10n pipeline for 4 months. The allowlist trailer convention was introduced 6 weeks ago. He's in the Smart Gate (Option E) enforcement phase. He's renewing `--enumerate-args` for the third time. He's already run `make renew-allowlist` twice before and knows the flow.

**Minute 0:00 — The Renewal**
Aarav's terminal shows a CI advisory from last week's nightly run: "1 allowlist entry expires in 8 days: `--enumerate-args` (expires 2026-06-12)." He opens the terminal in his IDE. The bottom status bar shows the project root. He types `make renew-allowlist FLAG=--enumerate-args`. The tool's output appears line by line: the magnifying glass emoji, the "Checking --enumerate-args..." line, the grep result showing `scripts/generate-audit.py:47`. The amber warning triangle appears: "⚠️ RENEWAL #3: Consider promoting to internal skip or permanent entry."

**Minute 0:30 — The Questionnaire**
The questionnaire prompts appear one by one. Aarav types `Y` for "still at expected location," `N` for "reason changed," types `INTL-847` for the ticket (tab-completing from his clipboard — the ticket hasn't changed since last renewal). At the verdict prompt he pauses. The amber warning is still visible three lines above. He types `renew` — then backspaces and types `defer`. He adds a note: "Q3 refactor deprioritized again. Escalating to team lead next standup." The tool stages the JSON, generates the commit message with all six trailers plus `Allowlist-Verdict: defer`, and shows the preview.

**Minute 1:15 — The Commit**
Aarav reviews the generated commit message. The trailers are correct. The body captures his frustration about the deferred refactor. He presses `Y` to commit. The commit-msg hook fires — he sees the brief green checkmark: "✅ Allowlist trailers validated (6/6 present)." The commit completes. He pushes and opens a PR.

**Minute 2:00 — CI Validation**
The PR triggers Tier 1 lint. The allowlist trailer check passes (trailers present and valid). But a NEW advisory appears: "⚠️ `--enumerate-args` has verdict `defer` — renewal count 3 with consecutive `renew` → `renew` → `defer` pattern suggests unresolved dependency. Consider promoting or escalating." Aarav screenshots this and drops it in the team Slack with "told you we need to prioritize INTL-847."

**UI Annotations:**
- Terminal output: monospace, ANSI-colored. Emojis render as text in most terminals.
- `make renew-allowlist` questionnaire: one question per line, default answer in brackets, tab completion for known values (flag names, ticket IDs).
- Commit-msg hook green checkmark: appears inline after `[main abc1234] chore(l10n): defer allowlist --enumerate-args (3/∞)`.
- CI advisory: rendered as a yellow block in the PR checks panel, expandable for full text.

---

### Journey: Priya, 24, Junior Frontend Developer, First Encounter with the Hook

**Context:** Priya is 3 weeks into the project. She's been building a React component for the workbench panel. She's never touched the l10n pipeline. Today she's fixing a typo in the allowlist JSON — someone wrote `"Referecned"` instead of `"Referenced"` in a `reason` field. She doesn't know the trailer convention exists.

**Minute 0:00 — The Edit**
Priya opens `l10n/tier1.5-phantom-allowlist.json` in VS Code. She finds the typo on line 8, fixes it, saves. She runs `git add l10n/tier1.5-phantom-allowlist.json && git commit -m "fix: typo in allowlist reason field"`. Her terminal shows the familiar Husky output — the conventional commit linter passes (the `fix:` prefix is valid). Then a new block appears.

**Minute 0:15 — The Smart Gate**
The Smart Gate hook fires. It parses the JSON diff, sees that only the `reason` field text changed (no `expires`, no `renewals`, no new entries, no removals). The output reads:

```
ℹ️  Detected: text change in reason field for --enumerate-args
    → Minimum trailers required: Allowlist-Entry, Allowlist-Verdict

⚠️  Missing trailers: Allowlist-Entry, Allowlist-Verdict

    This looks like a metadata correction, not a renewal.
    Add these trailers to your commit message:
      Allowlist-Entry: --enumerate-args
      Allowlist-Verdict: renew

    Or to skip this check:
      L10N_SKIP_TRAILER_CHECK=1 git commit -m "..."

    Documentation: docs/l10n/renewal-convention.md
```

Priya reads the message. She doesn't understand what "trailers" means but sees the two lines she needs to add. She's mildly annoyed — she's fixing a typo, not doing a "renewal."

**Minute 0:45 — The Override**
Priya considers her options. She could add the trailers (but `Allowlist-Verdict: renew` feels wrong for a typo fix), or she could use the env var override. She types `L10N_SKIP_TRAILER_CHECK=1 git commit -m "fix: typo in allowlist reason field"`. The hook prints the yellow warning: "⚠️ Allowlist trailer check SKIPPED." The commit goes through.

**Minute 1:00 — The PR**
Priya pushes and opens a PR. The CI lint runs. The allowlist trailer check flags: "⚠️ Commit `abc1234` modifies allowlist without trailers (override detected)." But because the Smart Gate's diff analysis is replicated in CI, the CI also shows: "ℹ️ Change classified as: text correction (reason field only). Advisory, not blocking." The PR passes.

**Minute 1:30 — The Learning**
Aarav reviews Priya's PR. He leaves a comment: "Good catch on the typo! FYI the env var override was fine here — for a pure text fix you could also have added just `Allowlist-Entry: --enumerate-args` and `Allowlist-Verdict: renew` to the commit message. The hook checks for those." Priya bookmarks the doc link for next time.

**UI Annotations:**
- Hook output: the `ℹ️ Detected:` line is cyan (informational), the `⚠️ Missing:` line is yellow (warning), the `❌` block would be red (error — not shown here because it's a soft block).
- VS Code terminal: Husky runs hooks in sequence. Conventional commit lint output appears first, then the allowlist check.
- CI PR panel: advisory messages render as collapsible yellow banners below the green "all checks passed" status.

---

### Journey: Dev, 35, Staff Engineer, Debugging a Hook Conflict

**Context:** Dev maintains the CI pipeline. A new developer reported that ALL their commits are being blocked — not just allowlist commits. Dev suspects a hook interaction problem. The project uses Husky with three commit-msg checks: conventional commit lint, allowlist trailer check, and a secret scanner.

**Minute 0:00 — Reproduction**
Dev creates a test branch. She makes a trivial change to `README.md` (not an allowlist file) and commits. The commit goes through — no hook problems. She modifies `src/components/Workbench.tsx` and commits. Goes through. She modifies `l10n/tier1.5-phantom-allowlist.json` (formatting only) and commits with `chore(l10n): format allowlist json`. The Smart Gate fires: "ℹ️ Detected: whitespace-only changes → No Allowlist trailers required. ✅ Commit will proceed." No block.

**Minute 1:00 — The Real Bug**
Dev asks the new developer to share their exact error. The developer pastes:

```
❌  Secret detected in commit message!
    Pattern: /[A-Za-z0-9+/=]{40,}/
    Match: "Allowlist-Expires: 2026-09-10Allowlist-Verdict: renew"

    Remove the secret before committing.
```

Dev sees the problem immediately: the secret scanner is pattern-matching on the Allowlist trailers concatenated without newlines. The developer's commit message had the trailers on one line (missing newlines between them), and the 40+ character string triggered the base64 secret detector.

**Minute 2:00 — The Fix**
The issue is that the secret scanner runs AFTER the allowlist check. The allowlist check validated the trailers (they were all present), but the malformed formatting (no newlines) created a long string that looks like a base64 secret. Dev has two fixes:

1. **Short-term:** Add an exclusion pattern to the secret scanner for `Allowlist-*:` trailer lines.
2. **Long-term:** The `make renew-allowlist` tool should format trailers with guaranteed newlines, and the commit-msg hook should ALSO validate trailer formatting (not just presence).

Dev implements both. She adds a test case to the hook's test suite: "malformed trailers (missing newlines) should warn about formatting." She updates the secret scanner's allowlist. She documents the interaction in `docs/l10n/hook-interactions.md`.

**Minute 5:00 — The Compositor**
While fixing the bug, Dev realizes the three hooks run independently and can't share context. The secret scanner doesn't know that the string it flagged is a legitimate trailer. She implements the hook compositor pattern (described above) — a single dispatcher that runs all checks and can pass context between them. The allowlist check can now mark trailer regions in the commit message as "known l10n content," and the secret scanner can skip those regions.

**UI Annotations:**
- Secret scanner error: bright red `❌` with the matched pattern highlighted. The "Pattern:" line shows the regex. The "Match:" line shows the matched string (truncated to 80 chars).
- Hook compositor output: all failures grouped under a `━━━ Commit blocked: N issue(s) found ━━━` header with numbered sections. Each section is color-coded by severity (red for blockers, yellow for warnings).

---

## Sensory Description

**The warning flash.** When the commit-msg hook fires in warning mode, the terminal gets a brief moment of visual tension — a blank line appears, then the yellow `⚠️` prefix materializes, then the indented body text fills in line by line (though of course terminals render this instantaneously — the "filling in" is the developer's scanning eye movement, top to bottom, processing the information hierarchically: emoji severity → bold heading → indented detail → action item). The yellow is not a pale cream-yellow — it's `\033[33m`, the terminal's standard yellow, which on most dark themes renders as a warm amber-gold that stands out from the default grey-white of normal output without the alarm of red.

**The block wall.** When the hook blocks (Option E enforcement), the `❌` hits differently. The developer typed their commit command and expected a `[main abc1234]` success line. Instead they get a wall of red-prefixed text. The emotional texture is not anger — it's interruption. The "To generate correct trailers, run:" line offers the escape immediately, like a toll booth showing the payment terminal next to the lowered gate. The developer's eyes jump from the red ❌ to the `make renew-allowlist` line, which is the actual action item. The explanation between them is read only if the developer doesn't already know what trailers are.

**The green pass.** When trailers are present and valid, the hook's output is minimal — a single line: `✅ Allowlist trailers validated (6/6 present)`. This appears BELOW the normal `[main abc1234] commit message` success line. The green is `\033[32m`. The brevity is deliberate: passing checks should be invisible. The developer's eye skips right over it. The only time they notice it is when it's NOT there (they forgot the trailers), creating a subtle negative-space signal — "I didn't see the green line, something's wrong."

**The countdown.** During Option B's adoption-timer phase, the countdown line injects temporal urgency into what's normally a timeless tool output. "ENFORCED in 5 days" has a specificity that feels different from static warnings. The date in parentheses anchors it to the calendar, connecting the abstract terminal world to the developer's sprint schedule. The countdown number decreasing daily creates a gentle ratchet effect — each commit makes the transition feel more real.

---

## Comparable Systems

**ESLint's `--fix` with pre-commit hooks (lint-staged):** The pattern of "hook detects problem, hook suggests fix command" is identical to the allowlist check suggesting `make renew-allowlist`. ESLint goes further by offering `--fix` to auto-correct — the allowlist equivalent would be the CLI tool auto-generating trailers.

**Conventional Commits + commitlint:** The closest analogue to structured trailer enforcement. Commitlint checks commit message format (type, scope, description) and blocks non-conforming commits. The allowlist trailer check is structurally identical — just checking for different fields. Teams using both should use a compositor to avoid double-blocking.

**Chromium's commit message requirements:** Chromium requires `Bug:` and `Change-Id:` trailers on every commit. Enforcement is via `commit-msg` hook (Gerrit's) that adds `Change-Id` automatically and warns about missing `Bug:` references. The pattern of auto-generating some trailers (Change-Id) while requiring human input for others (Bug:) maps directly to the allowlist case: `Allowlist-Entry` and `Allowlist-Renewals` can be auto-populated, while `Allowlist-Verdict` requires human judgment.

**GitHub's required status checks:** The CI-only enforcement (Option F) mirrors GitHub's model where branch protection rules enforce status checks, not local hooks. The local hook is a developer convenience; the required check is the enforcement.

**Terraform's `terraform plan` before `terraform apply`:** The tiered check (Option E) mirrors Terraform's approach of analyzing the change before deciding what to enforce. Both systems parse the diff to understand intent before applying rules.

---

## Interaction Effects

**With Tier 1 PR-time lint (4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-A):** The local hook and CI lint MUST agree on what constitutes a valid trailer set. If the hook accepts 4 trailers but CI requires 6, the developer gets a false sense of security from the local pass, then a surprise CI failure. The validation logic should be extracted to a shared script that both the hook and CI call.

**With `make renew-allowlist` CLI tool (parent Option 5):** The CLI tool is the "golden path" that makes the hook irrelevant — if the developer uses the tool, the commit message is guaranteed conforming. The hook's primary audience is developers who DON'T use the tool (direct JSON editors, quick fixes, formatting changes). The hook should detect tool-generated commits (via a marker trailer like `Allowlist-Tool: make-renew-allowlist/1.2`) and skip re-validation.

**With squash-merge workflows (sibling aspect 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-ii):** If the team squash-merges, individual commit trailers are lost. The local hook validates per-commit, but the squash commit needs its own trailer strategy. Options: (a) the squash commit message aggregates all `Allowlist-Entry` values from the branch, (b) the PR description is the canonical location, (c) squash is forbidden for allowlist PRs. This is the sibling aspect's territory but directly shapes whether the local hook's enforcement has lasting value.

**With `defer` verdict anti-pattern (sibling aspect 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-iii):** The hook should emit a special warning when `Allowlist-Verdict: defer` is detected: "⚠️ `defer` verdict used. Consecutive defers trigger shorter TTL (30 days). See renewal policy." This makes the hook a teaching surface for the verdict taxonomy, not just a format checker.

**With cross-tool trailer namespace (sibling aspect 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-iv):** If multiple l10n tools adopt structured trailers (`Allowlist-*`, `Migration-*`, `Budget-*`), the commit-msg hook must decide whether to validate ALL trailer namespaces or just `Allowlist-*`. A compositor-style hook that discovers check modules by namespace would scale better than a monolithic checker.

**With CI auto-renewal `--non-interactive` mode (sibling aspect 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-v):** CI auto-renewal bypasses the local hook entirely (CI doesn't run commit-msg hooks in most configurations). The CI-generated renewal commit needs the same trailers but generated by the `--non-interactive` flag rather than validated by the hook. The hook and the CLI tool share a trailer format but live in different enforcement contexts.

---

## Discovered Sub-Aspects

1. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-i-a** — Hook compositor architecture for multi-check commit-msg hooks: the dispatcher pattern, context sharing between checks (e.g., secret scanner aware of trailer regions), check discovery and ordering, performance budget (all checks must complete in <500ms), error aggregation display format

2. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-i-b** — Smart Gate JSON diff parser design: how to parse before/after JSON in a git hook, handling malformed JSON, jq dependency vs. pure bash parsing, semantic diff categories, edge cases (simultaneous renewal + formatting), performance on large allowlist files

3. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-i-c** — Hook installation and distribution: Husky vs. lefthook vs. manual `.git/hooks/` vs. core.hooksPath; ensuring all developers have hooks installed; "hook not installed" detection in CI; first-time setup experience for new contributors

4. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-i-d** — Shared validation library between local hook and CI lint: extracting trailer validation logic to a reusable script; version pinning to prevent hook/CI divergence; testing the shared library; schema for valid trailer values

5. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-i-e** — `Allowlist-Tool` provenance trailer: marker indicating which tool generated the commit (manual, `make renew-allowlist`, CI auto-renewal); hook skip-validation for tool-generated commits; provenance as audit signal in renewal history
