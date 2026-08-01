---
phase: 21
plan: 21-06
status: complete
requirements: [RET-02, RET-03]
---

# 21-06 — The return has two reachable exits

Committed `72d6a2bdd`, 4 files.

| Check | Result |
|---|---|
| `TESTIDS` | **3** |
| `WALL_CLOCK` in the bar | **0** |
| `TOASTS` / `FINALLY` | 2 / 2 |
| `NEW_PROPS` / `ROUTE_PASSES` | 3 / 2 |
| `TAX_SURFACE_HAS_PDF` | **1** — the audit's zero-hit grep across `src/components/tax/` is now non-zero |
| Component cases | **8 passed / 0 failed** |

Both dates come from the shared fact set: `dateOfDeath` is `factSet.dateOfDeath`, and `generatedOn` is
read from the clock **once**, in the route, via a lazy `useState` initialiser — the single clock read in
the whole export path, so a document is reproducible from its own parameters.

Case 6 is the load-bearing one: a rejected export surfaces a toast and the button re-enables, which is
what catches a missing `finally`.

## Control

`npx tsx scripts/check-one-fact-set.ts` — **ONE FACT SET OK**, all five checks. No second date of death
was introduced.
