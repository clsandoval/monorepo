---
phase: 99-fixture
plan: 01
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
    - "This fixture exists only to drive the OPEN WORLD PHRASE marker"
---

<objective>
FIXTURE — not a real plan. Structurally valid, carrying exactly one defect: a hedge
phrase in task prose that hands a decision to the executing agent.
</objective>

<constraints>
1. This file is never executed. It exists so the lint's rule 7 has been observed firing.
</constraints>

<tasks>

<task type="auto">
  <name>Task 1: A task whose action leaves a decision open</name>
  <files>scripts/nothing.mjs</files>
  <read_first>scripts/nothing.mjs</read_first>
  <action>
Configure the retry count as appropriate for the environment.
  </action>
  <verify>
true
  </verify>
  <acceptance_criteria>
    - The lint reports a violation on the action line
    - The lint exits 1
  </acceptance_criteria>
  <done>The rule-7 marker has been observed firing.</done>
</task>

</tasks>

<verification>
- [ ] `node scripts/check-plan-closed-world.mjs --file scripts/fixtures/plan-openworld.md` exits 1
</verification>

<success_criteria>
- The lint exits 1 and prints the rule-7 marker naming this file and the action line
</success_criteria>
