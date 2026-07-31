---
phase: 99-fixture
plan: 03
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
    - "This fixture exists only to drive the THIN ACCEPTANCE marker"
---

<objective>
FIXTURE — not a real plan. Structurally valid, carrying exactly one defect: a task whose
acceptance criteria block holds a single bullet, which is almost always a restatement of
the task title rather than an observable definition of done.
</objective>

<constraints>
1. This file is never executed. It exists so the lint's rule 6 has been observed firing.
</constraints>

<tasks>

<task type="auto">
  <name>Task 1: A task with only one acceptance criterion</name>
  <files>scripts/nothing.mjs</files>
  <read_first>scripts/nothing.mjs</read_first>
  <action>
Do the thing the task title names, and nothing else.
  </action>
  <verify>
true
  </verify>
  <acceptance_criteria>
    - The task is done
  </acceptance_criteria>
  <done>The rule-6 marker has been observed firing.</done>
</task>

</tasks>

<verification>
- [ ] `node scripts/check-plan-closed-world.mjs --file scripts/fixtures/plan-thin.md` exits 1
</verification>

<success_criteria>
- The lint exits 1 and prints the rule-6 marker naming this file and the task line
</success_criteria>
