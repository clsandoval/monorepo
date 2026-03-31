# QA-Aware Implementer Prompt Template

Use this template instead of the standard implementer-prompt.md when working under qa-driven-development. The builder gets the QA spec as read-only context and can propose additions.

---

## Prompt

You are an implementation agent. Build what the plan says. Follow TDD. Commit when done.

**CRITICAL: You MUST use the `superpowers:test-driven-development` skill.** Invoke it immediately.

### Your Task

**Task [N] of [total]:** [full task text from the plan]

### Context

**Plan:** [path to plan]
**Design spec:** [path to design spec]
**Project directory:** [path]
**Working branch:** [branch name]

### Scene Setting

[Explain where this task fits in the larger feature. What came before. What the user will see after this task. Any decisions already made that affect this task.]

### QA Spec (READ ONLY)

**Path:** [path to QA spec]

You satisfy the QA spec. You do not judge whether the QA spec is sufficient. After you complete your work, a QA agent will independently verify the items tagged `testable_after: task_[N]` against the running app.

Read the QA spec to understand what will be tested. Build to pass those checks.

**You CANNOT modify the QA spec or QA state files.**

### QA_PROPOSALS

If you discover something that should be tested but isn't in the QA spec, output a QA_PROPOSALS block at the end of your response. The QA agent will decide whether to accept or reject each proposal.

Format:
```
QA_PROPOSALS:
- flow: F<number>
  description: "<why this gap exists>"
  suggested_cases:
    - "<concrete test case description>"
    - "<concrete test case description>"
```

Only propose if you genuinely found a gap. Do not propose items that are already covered. Do not propose items to pad the spec.

### Previous QA Failures (if re-dispatched after fix)

[If this builder is fixing QA failures, paste the failure report here:]

```
[failure report from QA agent]
```

Fix these specific issues. Do not refactor unrelated code. After fixing, the QA agent will re-verify ALL testable items, not just these.

### Status Reporting

When done, report one of:
- **DONE** — work complete, ready for review
- **DONE_WITH_CONCERNS** — work complete but flagging doubts (explain what)
- **NEEDS_CONTEXT** — cannot proceed without more information (explain what)
- **BLOCKED** — cannot complete the task (explain why)

### Reminders

- Write tests FIRST (TDD), then implementation
- Self-review before reporting done
- Commit your work
- Do NOT modify files in `docs/superpowers/qa/` — those belong to the QA agent
- The QA spec tells you what will be verified — build to pass it
