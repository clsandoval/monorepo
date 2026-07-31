<!-- GENERATED FILE — do not hand-edit. Rewritten by `node scripts/loop-status.mjs record` on every full gate run. -->
# LOOP STATUS: BLOCKED — NEEDS OWNER ATTENTION

Last run 2026-07-31T06:17:45Z — outcome `cannot-run`, signature `PREFLIGHT:cargo`, 0/7 gates reached.

| gate | name | status | exit |
|---|---|---|---|
| G5 | — | not-run | - |
| G6 | — | not-run | - |
| G7 | — | not-run | - |
| G1 | — | not-run | - |
| G2 | — | not-run | - |
| G3 | — | not-run | - |
| G4 | — | not-run | - |

**Consecutive non-pass runs: 2**, most recent signature `PREFLIGHT:cargo`.

The stall rule: 3 consecutive non-pass runs sharing one signature, or 5 consecutive non-pass runs regardless of signature.

## What to do

A gate COULD NOT RUN (runner exit code 2). This is a halt, not a failure to route
around. Report BLOCKED using the five-field template in
`.planning/PLAN-STANDARD.md` section 3, pasting the real command output. Editing a
gate, a precondition, the manifest or a test to clear the halt is prohibited.

---

History: `loop-history.jsonl`, 12 of a maximum 200 records (oldest are dropped beyond the cap).
For a scripted answer: `node scripts/loop-status.mjs check` — exit 1 when the state is STALLED.
