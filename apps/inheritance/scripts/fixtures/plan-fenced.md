---
phase: 99-fixture
plan: 05
type: execute
wave: 1
depends_on: []
files_modified:
  - scripts/nothing.mjs
autonomous: true
requirements: [LOOP-01]
user_setup: []

must_haves:
  truths:
    - "This fixture is the regression test for the scanning-region rule and must exit 0"
---

<objective>
FIXTURE — not a real plan, and deliberately defect-free. It contains a prohibited hedge
phrase twice, once inside a fenced code block and once inside an inline code span, and
nowhere in prose. It must exit 0.

Without this fixture, a later refactor could quietly widen the scanning region to include
code, which would turn every plan that documents a prohibited token red — including
.planning/PLAN-STANDARD.md's own rule 7, which has to write the blacklist down.
</objective>

<constraints>
1. This file is never executed. It exists so the scanning-region exemption has been observed holding.
</constraints>

<tasks>

<task type="auto">
  <name>Task 1: Quote a prohibited phrase as literal data, twice</name>
  <files>scripts/nothing.mjs</files>
  <read_first>scripts/nothing.mjs</read_first>
  <action>
The phrase below appears inside a fenced code block, where it is data rather than an
instruction:

```text
as appropriate
```

And here it is again inside an inline code span: `as appropriate`. Neither occurrence may
be treated as a violation, because neither one delegates a decision to anybody.
  </action>
  <verify>
true
  </verify>
  <acceptance_criteria>
    - The lint exits 0 on this file
    - The lint prints its success marker rather than any violation marker
  </acceptance_criteria>
  <done>The scanning-region exemption has been observed accepting a compliant plan.</done>
</task>

</tasks>

<verification>
- [ ] `node scripts/check-plan-closed-world.mjs --file scripts/fixtures/plan-fenced.md` exits 0
</verification>

<success_criteria>
- The lint exits 0, proving fenced blocks and inline code spans are excluded from prose scanning
</success_criteria>
