---
phase: 99-fixture
plan: 02
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
    - "This fixture exists only to drive the LEGAL JUDGMENT IN PLAN marker"
---

<objective>
FIXTURE — not a real plan. Structurally valid, carrying exactly one defect: task prose
that asks the executing agent to decide a point of Philippine law, which PROJECT.md
forbids any agent from doing.
</objective>

<constraints>
1. This file is never executed. It exists so the lint's rule 8 has been observed firing.
</constraints>

<tasks>

<task type="auto">
  <name>Task 1: A task that asks the executor to decide law</name>
  <files>scripts/nothing.mjs</files>
  <read_first>scripts/nothing.mjs</read_first>
  <action>
Read the article and decide whether Art. 992 bars the half-sibling.
  </action>
  <verify>
true
  </verify>
  <acceptance_criteria>
    - The lint reports a violation on the action line
    - The lint exits 1
  </acceptance_criteria>
  <done>The rule-8 marker has been observed firing.</done>
</task>

</tasks>

<verification>
- [ ] `node scripts/check-plan-closed-world.mjs --file scripts/fixtures/plan-legal.md` exits 1
</verification>

<success_criteria>
- The lint exits 1 and prints the rule-8 marker naming this file and the action line
</success_criteria>
