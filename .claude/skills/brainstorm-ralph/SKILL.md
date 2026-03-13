---
name: brainstorm-ralph
description: |
  Brainstorm a tangential idea into a reverse or forward ralph loop. Explores the idea through
  collaborative dialogue, then generates PROMPT.md, frontier/aspects.md, and loop.sh
  ready for autonomous CI execution. Use when the user wants to set up a new ralph loop
  for an idea. Triggers: "brainstorm ralph", "new ralph loop", "set up a loop for",
  "reverse ralph this idea", "cook this idea", "forward loop".
---

# Brainstorm Ralph — Idea to Autonomous Loop

Turn an idea into a fully configured ralph loop (reverse or forward) that runs autonomously in CI.

<HARD-GATE>
Do NOT generate loop artifacts until you have explored the idea through dialogue and the user has approved the approach. Every idea goes through the full brainstorming process regardless of perceived simplicity.
</HARD-GATE>

## Checklist

1. **Determine loop type** — reverse (research/spec) or forward (build from spec)?
2. **Search for prior art** — read [references/prior-art-checklist.md](references/prior-art-checklist.md), search `apps/`, `loops/`, `.github/workflows/` for existing patterns with matching tech stacks
3. **Read anti-patterns** — read [references/anti-patterns.md](references/anti-patterns.md) before proposing any stage/aspect structure
4. **Explore context** — read `loops/_registry.yaml` for existing loops, check for overlaps
5. **Ask clarifying questions** — one at a time, understand goal/tools/convergence
6. **Propose 2-3 frontier structures** — different decompositions with your recommendation
7. **Draft PROMPT.md** — present section by section for approval. Key Sources table MUST include prior art discovered in step 2
8. **Draft frontier/aspects.md** — present initial aspects for approval
9. **Generate loop artifacts** — write all files to `loops/<idea-name>/`
10. **Update registry** — add entry to `loops/_registry.yaml`
11. **Commit and open PR**

## Loop Types

### Reverse Loops (research/spec)

Produce a `final-mega-spec/` directory. Template: `loops/_template/PROMPT.md.example`

- Waves decompose research into source gathering → extraction → design → synthesis → gap audit
- Each aspect = one unit of research, writes to spec files
- Convergence = every spec file complete, no TODOs/TBDs, cross-references valid
- **Must include a Key Sources table** listing every codebase path, URL, or prior loop the agent should reference

### Forward Loops (build from spec)

Build working code from a converged reverse loop spec. Template: `loops/_template/PROMPT-forward.md.example`

- Stages decompose build into scaffold → test → implement → verify
- Each stage = one unit of code, max 3 files touched
- **Stage count guidelines** (from anti-patterns doc):
  - Full-stack SaaS app: **80-150 stages** (not 20-30)
  - Content/marketing site: 30-60 stages
  - CLI tool / library: 15-30 stages
  - QA fix loop: 3x open findings
- **Mandatory stages**: local dev setup, Playwright verification, discovery stages (last 3-5), convergence gate
- **Must include a local dev setup stage** — `supabase start` or equivalent, seed data, zero manual setup
- **Must include Playwright screenshot stages** — every route, every state, desktop + mobile

## Key Questions to Answer

Before generating artifacts:

1. **Goal**: What does convergence produce? (spec, working app, dataset)
2. **Type**: Reverse or forward? If forward, where's the spec?
3. **Domain**: What tools/methods needed? (web research, code analysis, APIs)
4. **Prior art**: What existing loops/apps in the repo use similar patterns?
5. **Decomposition**: How many aspects/stages? (Use anti-patterns doc for sizing)
6. **Convergence**: How do we know it's done? (Must be extrospective for forward loops)

## Generating Artifacts

After user approves, generate:

### Directory Structure

```
loops/<idea-name>/
├── PROMPT.md               # Customized from template
├── loop.sh                 # Copy from loops/_template/loop.sh
├── frontier/
│   ├── aspects.md          # Initial frontier with statistics
│   └── analysis-log.md     # Empty log table
├── analysis/               # (empty, reverse only)
├── status/                 # (empty)
└── raw/                    # (empty, reverse only)
```

For forward loops, also include `frontier/current-stage.md`.

### Registry Entry

Add to `loops/_registry.yaml`:

```yaml
  <idea-name>:
    description: "<one-line description>"
    type: reverse  # or forward
    schedule: "*/30 * * * *"  # reverse default
    max_iterations: 60        # adjust per anti-patterns sizing guide
    timeout_minutes: 30
    status: active
    created: <today's date>
```

### Commit and PR

```bash
git checkout -b ralph/<idea-name>
git add loops/<idea-name>/ loops/_registry.yaml
git commit -m "loop(<idea-name>): scaffold <type> ralph loop"
git push -u origin ralph/<idea-name>
gh pr create --title "loop: <idea-name>" --body "..."
```

## Rules

- ONE question at a time during brainstorming
- Multiple choice preferred
- The PROMPT.md is the most critical artifact — must be specific enough for autonomous operation
- Aspects/stages must be concrete and actionable, not vague
- Do NOT invoke writing-plans or any implementation skill — the loop IS the implementation
- **Always search for prior art** — if the repo has a solved pattern, reference it
- **Always read anti-patterns** before proposing stage counts or convergence criteria
- **Forward loops: enumerate, don't compress** — if a stage touches >3 files, split it
- **Forward loops: Playwright is non-negotiable** — no convergence without browser verification
