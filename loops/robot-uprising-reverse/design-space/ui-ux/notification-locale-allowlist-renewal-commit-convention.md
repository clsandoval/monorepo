# Renewal Justification as Commit Message Convention

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a — When extending an allowlist entry's expiry, what metadata belongs in the commit message vs. in the JSON; structured commit message format for allowlist renewals; git log as audit trail for renewal decisions

**Parent:** 4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i — Allowlist hygiene and expiry (established: Option 2 CI grep-back + Option 3 TTL with 90-day default and renewals counter; combined schema with `expires`, `renewals`, and `reason` fields; renewals ≥ 3 triggers advisory)

**The gap this closes:** The parent establishes that allowlist entries expire after 90 days and must be renewed. The `renewals` counter tracks how many times an entry has been extended, and the `reason` field explains why the entry exists. But the parent doesn't specify: when Aarav renews `--enumerate-args` for the third time, where does he record WHY he's renewing? The JSON `reason` field captures why the entry exists ("referenced in docstring help text"), not why it's being kept alive THIS time ("still in docstring; docstring refactor planned for Q3; renewing because I don't want to block this unrelated PR"). The renewal justification — the per-renewal narrative of "I looked at this, here's what I found, here's why it should stay" — needs a home. If it goes in the JSON, the file bloats with temporal metadata that's only useful for archaeology. If it goes in the commit message, it's invisible to anyone who doesn't know to check git log. This aspect fully designs the renewal metadata architecture: what lives where, how commit messages are structured, how the audit trail is consumed, and how renewal justification feeds back into the Phase 2 migration decision.

---

## The Dual-Record Problem

A renewal event has two kinds of information:

**State information** — the current configuration of the allowlist entry:
- `expires`: new expiry date (90 days from now)
- `renewals`: incremented counter (was 2, now 3)
- `reason`: why the entry exists (unchanged unless the justification shifts)

**Narrative information** — the developer's assessment at renewal time:
- What they checked ("grepped scripts/generate-audit.py, flag still in help text on line 47")
- What they found ("flag is still there because the docstring hasn't been refactored yet")
- What their recommendation is ("keep for now; docstring refactor is on Q3 roadmap ticket INTL-847")
- Whether they considered alternatives ("could promote to internal skip, but flag may legitimately move to template in refactor")

State information belongs in the JSON. Narrative information belongs in the commit message. The question is: how to structure the commit message so that narrative information is **discoverable**, **parseable**, and **useful months later** when someone is reviewing the renewal history.

### Why This Matters: The Renewals ≥ 3 Advisory

The parent establishes that `renewals ≥ 3` triggers an advisory ("This entry has been renewed 3 times. Consider: promoting to internal flag category, refactoring source to isolate non-template code, or accepting as permanent with approval"). The advisory fires in CI, but the DECISION about what to do requires reading the renewal history — why was it renewed each time? If each renewal was "still in help text, refactor planned," that's a pattern suggesting the entry should be promoted to permanent or the refactor should be prioritized. If each renewal was for a DIFFERENT reason, that's a pattern suggesting the source is unstable and the entry might become stale soon.

Without structured renewal commit messages, the advisory fires but the decision-maker has no trail to follow except grepping git log for changes to the allowlist file and reading unstructured commit messages.

---

## Five Design Options for Renewal Commit Convention

### Option 1: Unstructured Conventional Commits ("The Status Quo")

Developers write whatever commit message they want:

```
chore(l10n): renew phantom allowlist entry for --enumerate-args
```

**Strengths:**
- Zero overhead. Developers already write commit messages.
- No tooling investment. No enforcement mechanism.
- Works with any git workflow.

**Weaknesses:**
- **Not parseable.** Tooling can't extract renewal justification from freeform text.
- **Not discoverable.** When the renewals ≥ 3 advisory fires, the developer must manually `git log --follow -p l10n/tier1.5-phantom-allowlist.json` and read through unstructured diffs.
- **Inconsistent.** One developer writes "renew allowlist," another writes "extend TTL for --verbose because still in help.py line 23 pending INTL-847 refactor." No guaranteed minimum information.
- **Invisible.** No one reads commit messages proactively. The narrative is technically there but practically lost.

**When to use:** Never as a deliberate design — this is what happens when no convention exists. It's the baseline to improve on.

### Option 2: Structured Commit Message with Trailer Fields ("The Git-Trailer Convention")

A commit message template enforced by commit-msg hook or PR template:

```
chore(l10n): renew allowlist entry --enumerate-args (renewal 3/∞)

Still present in scripts/generate-audit.py:47 (help text docstring).
Docstring refactor planned for Q3 (INTL-847). No change to allowlist
reason. Grep-back check passes.

Considered promoting to internal skip — deferred because flag may
legitimately move to command template during refactor.

Allowlist-Entry: --enumerate-args
Allowlist-Renewals: 3
Allowlist-Expires: 2026-06-12
Allowlist-Verdict: renew
Allowlist-Ticket: INTL-847
```

The structured trailers (`Allowlist-Entry`, `Allowlist-Renewals`, etc.) at the bottom are [git trailers](https://git-scm.com/docs/git-interpret-trailers) — key-value pairs that can be extracted programmatically with `git log --format='%(trailers:key=Allowlist-Entry)'`.

**Strengths:**
- **Machine-parseable.** `git log --format='%(trailers)'` extracts structured data without regex.
- **Human-readable.** The body is freeform narrative. The trailers are bonus metadata.
- **Discoverable.** When the advisory fires, tooling can display the full renewal history: `git log --all --format='%H %s%n%(trailers:key=Allowlist-Entry,key=Allowlist-Verdict,key=Allowlist-Ticket,separator=%x2c)' -- l10n/tier1.5-phantom-allowlist.json`.
- **Enforceable.** A commit-msg hook can require trailers when the allowlist file is modified.
- **Standard.** Git trailers are a well-known convention (used by Linux kernel, Chromium, many open-source projects).

**Weaknesses:**
- **Learning curve.** Developers unfamiliar with git trailers may find them confusing.
- **Duplication.** `Allowlist-Renewals: 3` in the commit duplicates `"renewals": 3` in the JSON. They can drift if someone edits one without the other.
- **Verbose.** A 7-line commit message for a one-field JSON change feels heavy.
- **Hook dependency.** Without the commit-msg hook, the convention degrades to Option 1.

**When to use:** Teams with >5 allowlist entries and a culture of structured commits. The trailers provide the best balance of human readability and machine parseability.

### Option 3: Renewal Log in the JSON File ("The Embedded Audit Trail")

Add a `renewal_log` array directly to each allowlist entry:

```json
{
  "allowed_non_template_flags": {
    "--enumerate-args": {
      "reason": "Referenced in help text docstring",
      "expires": "2026-06-12",
      "renewals": 3,
      "source_location": "scripts/generate-audit.py:47",
      "renewal_log": [
        {
          "date": "2026-01-15",
          "by": "aarav",
          "verdict": "renew",
          "note": "Initial entry. Flag in help text docstring.",
          "grep_match": "scripts/generate-audit.py:47"
        },
        {
          "date": "2026-04-15",
          "by": "margot",
          "verdict": "renew",
          "note": "Still in help text. Docstring refactor deferred to Q3.",
          "ticket": "INTL-847",
          "grep_match": "scripts/generate-audit.py:47"
        },
        {
          "date": "2026-07-12",
          "by": "aarav",
          "verdict": "renew",
          "note": "Q3 refactor deprioritized. Considering promote to internal.",
          "ticket": "INTL-847",
          "grep_match": "scripts/generate-audit.py:47"
        }
      ]
    }
  }
}
```

**Strengths:**
- **Self-contained.** The entire history of an entry is in one place. No git log archaeology needed.
- **Structured.** Every field is typed, every renewal is a complete record.
- **Portable.** If the allowlist file moves repos or changes VCS, the history moves with it.
- **Diff-visible.** Code review shows the new renewal_log entry alongside the expires/renewals changes.

**Weaknesses:**
- **File bloat.** After 6 renewals, the renewal_log dominates the entry. A 3-entry allowlist with 4 renewals each is 80+ lines of JSON dedicated to history.
- **JSON is not a journal.** The `note` field incentivizes brevity ("still there") rather than the thoughtful paragraph a commit message body allows.
- **Merge conflicts.** Two developers renewing different entries in the same sprint both append to their entry's renewal_log. JSON arrays are notoriously merge-unfriendly.
- **Schema complexity.** The allowlist schema is already non-trivial (parent added expires, renewals, source_location). Adding a nested array of objects with their own schema is a significant complexity jump.
- **Duplication with git.** The `date`, `by`, and implicit "what changed" are already in git log. The renewal_log reconstructs version control metadata inside the file.

**When to use:** Teams where git log is not a reliable audit trail (e.g., squash-merge workflows where individual commit messages are lost, or multi-repo setups where the allowlist is copied between repos).

### Option 4: Companion Changelog File ("The Sidecar Journal")

A separate file `l10n/tier1.5-phantom-allowlist.changelog.md` that records renewal decisions in human-readable prose:

```markdown
# Phantom Allowlist Changelog

## 2026-07-12 — Renewal #3: --enumerate-args (Aarav)

**Source check:** `grep -n "enumerate-args" scripts/generate-audit.py` → line 47 (help text)
**Still valid:** Yes, same location as previous renewal.
**Verdict:** Renew 90 days. Considered promoting to internal skip.
**Context:** Q3 docstring refactor (INTL-847) deprioritized due to mobile release freeze.
**Recommendation at renewal 4:** Promote to internal flag or escalate refactor priority.

## 2026-04-15 — Renewal #2: --enumerate-args (Margot)

**Source check:** `grep -n "enumerate-args" scripts/generate-audit.py` → line 47 (help text)
**Still valid:** Yes, unchanged since initial entry.
**Verdict:** Renew 90 days.
**Context:** Docstring refactor now on Q3 roadmap (INTL-847 created).

## 2026-01-15 — Initial entry: --enumerate-args (Aarav)

**Source:** Help text docstring in `scripts/generate-audit.py:47`
**Reason:** Flag appears in docstring example showing repair tool usage.
**Expected resolution:** Docstring refactor to remove inline CLI examples.
```

**Strengths:**
- **Rich narrative.** Markdown allows paragraphs, headers, code blocks. Developers can write thoughtfully about their assessment.
- **Readable.** Anyone can open the changelog and understand the full renewal history without tooling.
- **No schema bloat.** The JSON stays clean — state only. The changelog holds narrative.
- **Diff-friendly.** New entries prepend to the top. No merge conflicts with JSON arrays.
- **Natural advisory integration.** When renewals ≥ 3 fires, the advisory message can include: "See l10n/tier1.5-phantom-allowlist.changelog.md for renewal history."

**Weaknesses:**
- **Two files to maintain.** The developer must update BOTH the JSON and the changelog. Forgetting the changelog means the audit trail has gaps.
- **Not machine-parseable** (without a convention). The markdown is human-readable but can't be easily queried for "show me all entries renewed more than 3 times with verdict=renew."
- **Orphan risk.** If the JSON entry is deleted, the changelog entry persists as dead history. If the changelog is deleted, the JSON entry loses its audit trail.
- **File growth.** Over years, the changelog grows linearly. But it's append-only markdown — old entries can be archived to a `changelog-archive/` directory when the file exceeds a threshold.

**When to use:** Teams that value prose documentation and don't need machine-parseable renewal history. Works well when renewals are infrequent (<1/month across all entries) and each renewal is a meaningful decision worth documenting in paragraph form.

### Option 5: `make renew-allowlist` Command with Automatic Documentation ("The Tooling-First Approach")

A CLI command that handles both the JSON update AND the commit message:

```bash
$ make renew-allowlist FLAG=--enumerate-args

🔍 Checking --enumerate-args...
   Found in scripts/generate-audit.py:47 (help text docstring)
   Current reason: "Referenced in help text docstring"
   Renewals: 2 → 3
   ⚠️ RENEWAL #3: Consider promoting to internal skip or permanent entry.

📋 Renewal questionnaire:
   1. Is the flag still at the expected source location? [Y/n] Y
   2. Has the reason changed? [y/N] N
   3. Is there a ticket tracking resolution? [ticket/N] INTL-847
   4. Verdict? [renew/promote/permanent/remove] renew
   5. Additional notes: Q3 refactor deprioritized. Will reassess at renewal 4.

✅ Updated allowlist:
   - expires: 2026-06-12 → 2026-09-10
   - renewals: 2 → 3

📝 Staged files:
   - l10n/tier1.5-phantom-allowlist.json

💬 Generated commit message:
   chore(l10n): renew allowlist --enumerate-args (3/∞)

   Source: scripts/generate-audit.py:47 (unchanged)
   Reason: Referenced in help text docstring (unchanged)
   Verdict: renew
   Ticket: INTL-847
   Notes: Q3 refactor deprioritized. Will reassess at renewal 4.

   Allowlist-Entry: --enumerate-args
   Allowlist-Renewals: 3
   Allowlist-Expires: 2026-09-10
   Allowlist-Verdict: renew
   Allowlist-Ticket: INTL-847

   Proceed with commit? [Y/n] Y
```

**Strengths:**
- **Zero friction.** Developer runs one command. The tool asks the right questions, formats the output, generates the commit.
- **Enforced completeness.** The questionnaire ensures every renewal includes a source check, verdict, and justification. No empty "renew allowlist" commits.
- **Best of both worlds.** The JSON gets updated (state). The commit message gets structured trailers (Option 2) AND freeform notes. The tool does the formatting.
- **Advisory integration.** The tool surfaces the renewals ≥ 3 warning at exactly the right moment — during renewal, when the developer has context to act on it.
- **Consistency.** Every renewal commit follows the same format regardless of who runs it.

**Weaknesses:**
- **Tooling investment.** Building, testing, and maintaining the `make renew-allowlist` command. Including the interactive questionnaire, the JSON updater, the commit message formatter, the git staging, and the advisory logic.
- **Workflow rigidity.** Developers who prefer to edit JSON directly and write their own commits are forced through the tool's workflow. An escape hatch (`--no-interactive`) undermines the completeness guarantee.
- **Interactive prompts in CI.** If an expired entry needs renewal during a CI run, the interactive tool can't prompt. Needs a `--non-interactive --verdict=renew --notes="auto-renewed by CI"` mode, but auto-renewal defeats the purpose of forced human review.
- **Tool versioning.** The renewal tool itself needs maintenance — and introduces another tool in the l10n CLI ecosystem that needs schema drift detection, argument enumeration, and all the patterns the parent chain has been building.

**When to use:** Teams with 10+ allowlist entries where renewal is a frequent workflow. The tooling investment pays off when renewals happen more than once per sprint.

---

## Recommendation: Option 2 (Structured Trailers) + Option 5 (CLI Tool) as Progressive Layers

**Phase 1:** Establish Option 2 as the convention. Document the expected commit message format. Add a commit-msg hook that warns (not blocks) when a commit touching the allowlist file lacks `Allowlist-Entry` trailers. Low investment, immediate value.

**Phase 2:** When the team hits 5+ entries or 3+ renewals/quarter, build Option 5 (`make renew-allowlist`). The tool generates Option 2-formatted commits automatically. The convention is the same — the tool just automates it.

**Why not Option 3 (embedded log)?** File bloat and merge conflicts are not worth the self-containment benefit. Git IS the audit trail — we should lean into it, not reconstruct it inside JSON.

**Why not Option 4 (sidecar changelog)?** Two-file maintenance burden without machine parseability. The structured trailers in Option 2 give us both human readability (commit body) and machine parseability (trailers) in a single artifact.

### The Recommended Commit Message Schema

```
chore(l10n): {verdict} allowlist {flag} ({renewals}/∞)

{Freeform narrative: what was checked, what was found, what was decided, why}

Allowlist-Entry: {flag name, e.g., --enumerate-args}
Allowlist-Renewals: {integer, post-increment}
Allowlist-Expires: {YYYY-MM-DD}
Allowlist-Verdict: {renew|promote|permanent|remove|defer}
Allowlist-Ticket: {ticket ID or "none"}
Allowlist-Source: {file:line where flag was found by grep-back}
```

**Verdict taxonomy:**
- `renew` — Entry is still valid. Extend TTL.
- `promote` — Entry should be promoted to internal flag category in `--enumerate-args`. (Entry removed from allowlist, flag added to `internal: true` set.)
- `permanent` — Entry is permanent. Requires approval field in JSON.
- `remove` — Entry is stale. Remove from allowlist.
- `defer` — Decision deferred to next renewal. (Dangerous — should be time-limited.)

### Consuming the Audit Trail

The renewal history is consumed via git log queries:

```bash
# Full renewal history for a specific flag
git log --all --format='%H %ai %an%n%B' --grep='Allowlist-Entry: --enumerate-args' \
  -- l10n/tier1.5-phantom-allowlist.json

# All renewals in date range
git log --after='2026-01-01' --before='2026-07-01' \
  --format='%(trailers:key=Allowlist-Entry,key=Allowlist-Verdict,key=Allowlist-Renewals,separator=|)' \
  -- l10n/tier1.5-phantom-allowlist.json

# Entries that have been renewed more than 3 times (for advisory follow-up)
git log --all --format='%(trailers:key=Allowlist-Entry,key=Allowlist-Renewals)' \
  -- l10n/tier1.5-phantom-allowlist.json | grep 'Allowlist-Renewals: [4-9]'
```

The `make renew-allowlist` tool (Phase 2) could include a `--history` flag that runs these queries and formats the output:

```bash
$ make renew-allowlist FLAG=--enumerate-args --history

📜 Renewal history for --enumerate-args:
   #1  2026-01-15  aarav    renew     Initial entry. Help text docstring.
   #2  2026-04-15  margot   renew     Still in help text. INTL-847 created.
   #3  2026-07-12  aarav    renew     Q3 refactor deferred. Consider promote.
   ⚠️  3 renewals. Advisory: promote to internal or escalate refactor.
```

---

## Interaction Effects

### With TTL Expiry System (parent)

The commit convention is the narrative layer on top of the TTL's mechanical layer. The TTL forces the renewal event; the convention captures what happened during the event. Without the convention, the TTL fires but the renewal is a mindless counter increment. With the convention, each renewal is a documented decision point.

### With Renewals ≥ 3 Advisory (parent)

The advisory becomes dramatically more useful when it can display the renewal history. "This entry has been renewed 3 times" is informational. "This entry has been renewed 3 times — each time because the docstring refactor keeps getting deferred (INTL-847)" is actionable. The structured trailers make the latter possible.

### With Schema Drift Detector (4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i)

If the commit message schema changes (e.g., adding a new trailer field), existing git log queries break silently. The schema drift detector's principle of "schema versioning for tool-to-tool interfaces" applies here: the commit convention IS a schema, and consumers of the audit trail depend on it. A `.l10n-commit-schema-version` file or a trailer in the commit itself (`Allowlist-Schema: 1`) enables future-proofing.

### With CODEOWNERS Per-Entry Ownership (4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-b, sibling)

If entries have owners, the commit convention should include an `Allowlist-Owner` trailer. The renewal tool can pre-fill from the CODEOWNERS mapping. The owner is the person who SHOULD be making the renewal decision — if someone else renews, the commit documents the delegation.

### With High-Renewal Threshold Policy (4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-e, sibling)

The threshold (default 3) that triggers the advisory interacts with the verdict taxonomy. If the team's threshold is 5, the advisory fires later, and the renewal history is longer before intervention. The commit trail's value scales with the threshold: higher thresholds need more documented renewals to reconstruct the decision narrative.

### With Phase 2 Migration (parent's Phase 2 absorption path)

When the team migrates from allowlist to declared manifest (`--enumerate-template-flags`), the renewal commit history becomes a migration audit trail. Each entry's history shows whether it was frequently renewed (promote to internal skip) or rarely renewed (may already be stale). The `make renew-allowlist --history --all` output is the migration planning document.

---

## Comparable Systems

### Conventional Commits (widespread)
The structured commit message convention (`type(scope): description`) is the direct ancestor. Our convention extends it with domain-specific trailers. The learning: conventions without enforcement degrade. Tooling (commitlint, commit-msg hooks) is what makes conventional commits actually conventional.

### Kubernetes Annotation Conventions
Kubernetes uses annotations like `kubernetes.io/last-applied-configuration` to embed metadata in objects. This is analogous to Option 3 (embedded log) — and suffers the same bloat problem. The Kubernetes community's response was to move to server-side apply with managed fields, separating "what" from "who changed it" — exactly the separation we're recommending.

### RFC 822 Email Headers / HTTP Headers
Git trailers are syntactically similar to email headers. The convention of structured key-value metadata at the end of a message body is decades old and well-understood. Our trailer schema inherits the strengths (extensible, parseable, human-readable) and weaknesses (fragile to typos, no type system) of this format.

### Debian changelog format
`debian/changelog` is a structured changelog with entries containing package name, version, urgency, maintainer, date, and freeform description. It's the gold standard for "structured metadata + freeform narrative in one artifact." Our commit convention achieves the same within git's native data model rather than a sidecar file.

### Python `__version__` and `CHANGES.rst`
Python packages often maintain both a version constant and a human-readable changelog. The duplication between the two is a constant maintenance burden — changes listed in CHANGES.rst but version not bumped, or version bumped without a CHANGES.rst entry. Our recommendation to use git trailers (single source) avoids this duplication.

---

## Player Journeys

#### Journey: Aarav, 32, CI Platform Engineer

**Context:** Allowlist has 4 entries, 3 months in. Aarav originally created 2 of them. He's renewing `--enumerate-args` for the third time. The renewals ≥ 3 advisory is about to fire.

**Minute 0:00 — The Expiry Notification**
Aarav opens a PR that touches the l10n CI config (unrelated to the allowlist). CI runs. The phantom flag Tier 1.5 check passes, but a new check appears in the output:

```
⚠️ ALLOWLIST EXPIRY WARNING
  --enumerate-args expires in 3 days (2026-07-12)
  Renewals: 2 | Reason: Referenced in help text docstring
  Run `make renew-allowlist FLAG=--enumerate-args` to renew or resolve.
```

The warning is amber, not red. It doesn't block the PR. But it's visible in the CI summary, and Aarav knows from experience that expired entries DO block PRs.

**Minute 0:30 — Running the Renewal Tool**
Aarav opens a terminal. He runs:

```bash
$ make renew-allowlist FLAG=--enumerate-args
```

The tool greps the source, finds the flag at `scripts/generate-audit.py:47`, confirms the entry is still valid. It runs through the questionnaire. Aarav types "Q3 refactor deprioritized. Will reassess at renewal 4." as his note. The tool shows the draft commit message with trailers. Aarav reviews it — the `Allowlist-Renewals: 3` trailer catches his eye.

**Minute 1:00 — The Advisory**

```
⚠️ RENEWAL #3: This entry has been renewed 3 times.

   Renewal history:
   #1  2026-01-15  aarav    renew     Initial entry. Help text docstring.
   #2  2026-04-15  margot   renew     Still in help text. INTL-847 created.
   #3  2026-07-12  aarav    renew     Q3 refactor deprioritized.

   Consider:
   - Promoting to internal flag category (`--enumerate-args` → internal: true)
   - Escalating INTL-847 to current sprint
   - Marking as permanent (requires team lead approval)
```

Aarav reads the history. He can see the trajectory: three renewals, each for the same reason, with a ticket that keeps getting deferred. He decides to escalate INTL-847 rather than promote to permanent. He adds a note: "Escalating INTL-847 to Sprint 47. If not resolved by renewal 4, will promote to internal skip."

**Minute 1:30 — The Commit**
The tool generates the commit, including all trailers. Aarav reviews, confirms. The commit lands on his branch alongside the original CI config change. The PR diff now shows two changes: the CI config update and the allowlist renewal. The reviewer can see exactly what was renewed and why.

**What Aarav learned:** The renewal tool transforms a chore ("bump the date") into a decision point ("what are we going to do about this?"). The structured history makes the pattern visible — three renewals for the same reason means the underlying issue needs escalation, not another renewal.

#### Journey: Priya, 28, Junior L10n Engineer

**Context:** Priya is 2 weeks into the team. She's never seen the allowlist before. An expired entry blocks her first PR.

**Minute 0:00 — The Blocker**
Priya pushes her first PR — a translation fix for a Japanese locale file. CI fails with:

```
❌ ALLOWLIST ENTRY EXPIRED
  --verbose: expired 2026-07-01 (11 days ago)
  Renewals: 1 | Reason: Referenced in debug logging note
  This entry must be renewed or removed before CI will pass.
  Run `make renew-allowlist FLAG=--verbose` to renew.
  Run `make renew-allowlist FLAG=--verbose --history` to see renewal history.
```

Red. Blocking. Priya's translation fix has nothing to do with the allowlist, but the CI check runs on every PR that touches the l10n directory.

**Minute 0:20 — Learning the History**
Priya runs `--history` first, because she doesn't know what this entry is:

```
📜 Renewal history for --verbose:
   #1  2026-04-01  dev    renew     Added --verbose to debug note in generate-audit.py.
                                     Not part of command template. Temporary — debug
                                     note will be removed after INTL-802 is resolved.
```

One renewal, a clear note that it's temporary, and a ticket reference. Priya checks INTL-802 — it's been closed. The debug note was removed two sprints ago. The allowlist entry is genuinely stale.

**Minute 0:45 — Removing the Entry**
Priya runs:

```bash
$ make renew-allowlist FLAG=--verbose
```

The tool greps the source. No match found:

```
🔍 Checking --verbose...
   NOT FOUND in scripts/generate-audit.py
   ⚠️ This entry may be stale. The flag no longer appears in the audit source.

   Verdict? [renew/promote/permanent/remove] remove
```

Priya selects `remove`. The tool deletes the JSON entry, stages the file, generates a commit:

```
chore(l10n): remove stale allowlist --verbose

Flag no longer appears in scripts/generate-audit.py. INTL-802 (debug note)
was resolved in Sprint 44. Entry has been stale since debug note removal.

Allowlist-Entry: --verbose
Allowlist-Renewals: 1
Allowlist-Verdict: remove
Allowlist-Ticket: INTL-802
Allowlist-Source: not-found
```

**Minute 1:00 — Unblocked**
Priya commits, pushes, CI passes. Her translation fix lands alongside the allowlist cleanup. The commit trailers document that she verified the entry was stale, not just blindly removed.

**What Priya learned:** The structured convention made it safe for a newcomer to act on an expired entry. The history gave her context. The tool guided her through the decision. Without this, she would have asked Aarav what to do, waited for a response, and lost a day.

#### Journey: Margot, 41, L10n Team Lead

**Context:** Quarterly review. Margot wants to assess the overall health of the allowlist system. She has 7 entries, 3 of which have been renewed 3+ times.

**Minute 0:00 — The Audit Query**
Margot runs:

```bash
$ git log --all --format='%(trailers:key=Allowlist-Entry,key=Allowlist-Renewals,key=Allowlist-Verdict)' \
    -- l10n/tier1.5-phantom-allowlist.json | sort | uniq -c | sort -rn
```

The output shows every renewal event, sorted by frequency. Three entries jump out: `--enumerate-args` (3 renewals, all `renew`), `--strategy` (4 renewals, last was `defer`), and `--format` (3 renewals, mix of `renew` and `defer`).

**Minute 1:00 — Reading the Narratives**
For `--strategy` (4 renewals, last `defer`), Margot reads the full history:

```bash
$ git log --all --grep='Allowlist-Entry: --strategy' --format='%ai %an%n%B' \
    -- l10n/tier1.5-phantom-allowlist.json
```

The narrative emerges: renewal 1 said "temporary, being moved to template." Renewal 2 said "move postponed." Renewal 3 said "still postponed, consider permanent." Renewal 4 said "deferring decision to Margot at quarterly review." The developer explicitly punted to her.

**Minute 2:00 — The Decision**
Margot sees the pattern: `--strategy` has been in the allowlist for a year, renewed 4 times, with the original justification ("being moved to template") never actualized. She decides to promote it to `internal: true` in the `--enumerate-args` output. She runs:

```bash
$ make renew-allowlist FLAG=--strategy
```

And selects `promote`. The tool removes the allowlist entry AND adds `--strategy` to the repair tool's internal flag list. One commit, two files changed, full trailer documentation.

**Minute 3:00 — The Quarterly Summary**
Margot writes a brief summary in the team's documentation:

```markdown
## Q3 2026 Allowlist Review
- 7 entries → 6 entries (--strategy promoted to internal)
- 2 entries at renewal 3 (--enumerate-args, --format): escalating refactor tickets
- 1 entry removed by Priya (--verbose: stale since Sprint 44)
- Average renewal interval: 87 days (near the 90-day TTL)
- System health: GOOD — no dangerous stale entries detected
```

The structured trailers made this summary possible in 3 minutes instead of 30.

**What Margot learned:** The commit convention turns the allowlist into a legible system with trends, patterns, and decision points. Without structured metadata, quarterly review would mean reading raw git diffs and guessing at intent.

---

## Sensory Description

**The renewal tool's terminal output:** Monospace text on a dark terminal background. The flag name appears in bold cyan (`--enumerate-args`). The grep result shows the file path in dim gray with the line number in white (`scripts/generate-audit.py:47`). The renewals counter uses color progression: green for 1, amber for 2, red-orange for 3+. The advisory box at renewal 3 has a yellow left-border (4px, like a caution tape stripe) with the history in a monospace table — dates in gray, authors in green, verdicts in white, notes in dim italic. The questionnaire prompts appear one at a time, each preceded by a numbered emoji (📋 1., 📋 2., ...). The generated commit message appears in a bordered box (thin white border on dark background), with trailers highlighted in dim blue to distinguish them from the body text. The "Proceed with commit?" prompt pulses gently with a cursor blink.

**The CI warning (non-blocking):** Amber background strip in the CI output, like a highway construction sign. The flag name is bold. The expiry date is in red if past, amber if within 7 days. The `make renew-allowlist` command is rendered as a clickable link (in CI systems that support it) that copies the command to clipboard.

**The CI error (blocking):** Red background strip. A horizontal rule above and below to isolate it from other CI output. The error message uses the ❌ prefix (the only emoji in the system — reserved for blockers). The renewal history is NOT shown in the blocking error — just the command to view it. Keeps the error message actionable, not informational.

**The git log output for renewal history:** When viewed with `git log --format=...`, each renewal appears as a card-like block: date + author on the first line, verdict and ticket on the second, freeform note indented below. The visual rhythm of repeated entries creates a timeline feel — each block is a snapshot of a human making a decision about a piece of infrastructure.

---

## Discovered Sub-Aspects

1. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-i — Commit-msg hook enforcement strategy:** Should the hook warn or block on missing trailers? Warn-first adoption period vs. immediate enforcement? Hook bypass (`--no-verify`) as escape hatch — how to audit hook bypasses? Interaction with pre-existing commit-msg hooks in the l10n pipeline.

2. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-ii — Squash-merge trailer preservation:** In squash-merge workflows, individual commit trailers are lost in the squash commit. How to preserve allowlist renewal metadata across squash boundaries? Options: PR description as canonical location, post-merge hook that extracts trailers, or forbid squash on allowlist-touching PRs.

3. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-iii — Renewal verdict `defer` as anti-pattern detection:** The `defer` verdict is the most dangerous — it means "I'm not deciding now." How many consecutive defers before escalation? Should `defer` have its own shorter TTL (30 days instead of 90)? Interaction with the renewals ≥ 3 advisory.

4. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-iv — Cross-tool commit trailer namespace collision:** If multiple l10n tools adopt structured trailers (`Allowlist-*`, `Migration-*`, `Budget-*`), the trailer namespace grows. Conventions for avoiding collisions, standardizing prefixes, and discovering all trailer schemas in the project.

5. **4.69e-i-a-i-f-i-α-i-A-α-i-1-I-a-i-A-i-a-i-a-v — Renewal tool `--non-interactive` mode for CI auto-renewal policy:** Should CI be allowed to auto-renew entries with `--non-interactive --verdict=renew`? If so, under what constraints? Maximum auto-renewals before human required? Interaction with the forced-human-review principle of TTL.
