---
phase: 99-fixture
plan: 04
type: execute
wave: 1
depends_on: []
files_modified:
  - scripts/nothing.mjs
autonomous: true
requirements: [LOOP-99]
user_setup: []

must_haves:
  truths:
    - "This fixture exists only to drive the UNKNOWN REQUIREMENT marker"
---

<objective>
FIXTURE — not a real plan. Structurally valid, carrying exactly one defect: a requirement
id in the frontmatter that does not exist in .planning/REQUIREMENTS.md, so the plan claims
coverage it cannot possibly deliver.
</objective>

<constraints>
1. This file is never executed. It exists so the lint's rule 2 has been observed firing.
</constraints>

<tasks>

<task type="auto">
  <name>Task 1: A task under a requirement id that does not exist</name>
  <files>scripts/nothing.mjs</files>
  <read_first>scripts/nothing.mjs</read_first>
  <action>
Do nothing. The defect in this fixture is in the frontmatter, not in this task.
  </action>
  <verify>
true
  </verify>
  <acceptance_criteria>
    - The lint reports a violation on the frontmatter line
    - The lint exits 1
  </acceptance_criteria>
  <done>The rule-2 marker has been observed firing.</done>
</task>

</tasks>

<verification>
- [ ] `node scripts/check-plan-closed-world.mjs --file scripts/fixtures/plan-badreq.md` exits 1
</verification>

<success_criteria>
- The lint exits 1 and prints the rule-2 marker naming the unknown requirement id
</success_criteria>
