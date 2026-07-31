# Known Bugs

This file is held to reality by two independent checks, and neither one can rewrite it.

`node scripts/check-bugs-ledger.mjs` validates the **document's shape** — that every entry has the
headings its status requires, that no status is invented, that an open entry carries a runnable
reproduction, and that no legal claim appears without an attribution.

`engine/tests/bugs_ledger.rs` validates the **numbers** — it re-runs every entry's committed JSON
through the current engine and fails when a recorded figure drifts by even one centavo, and it
re-proves that every closed entry still conserves the estate. A regression that revives a closed bug
turns the suite red instead of leaving a stale closure sitting here.

Every centavo figure below was produced by a command that was actually run. Every legal proposition
below is an attributed quotation; nothing here states a fresh reading of Philippine law.

## BUG-001: Multiple disinheritances produce incorrect distribution (sum > estate)

**Severity:** High
**Status:** Closed — does not reproduce
**Found:** 2026-02-24
**Closed:** 2026-07-31
**Location:** engine/src/step7_distribute.rs

### Description

When a will disinherits **2 or more** compulsory heirs simultaneously, the engine produces incorrect distributions where the sum of `net_from_estate` across all heirs exceeds the actual estate value (roughly doubles it).

The existing test suite (TV-08) only tests **single** disinheritance, which works correctly. The bug surfaces when multiple disinheritances are present.

### Reproduction

```json
{
  "net_distributable_estate": {"centavos": 3000000000},
  "decedent": {"id":"d","name":"Roberto","date_of_death":"2026-01-15","is_married":true,
    "date_of_marriage":"2000-01-01","marriage_solemnized_in_articulo_mortis":false,
    "was_ill_at_marriage":false,"illness_caused_death":false,
    "years_of_cohabitation":0,"has_legal_separation":false,"is_illegitimate":false},
  "family_tree": [
    {"id":"lc1","name":"Sandra","is_alive_at_succession":true,"relationship_to_decedent":"LegitimateChild","degree":1,"line":null,"children":[],"filiation_proved":true,"filiation_proof_type":null,"is_guilty_party_in_legal_separation":false,"adoption":null,"is_unworthy":false,"unworthiness_condoned":false,"has_renounced":false,"blood_type":null},
    {"id":"lc2","name":"Tomas","is_alive_at_succession":true,"relationship_to_decedent":"LegitimateChild","degree":1,"line":null,"children":[],"filiation_proved":true,"filiation_proof_type":null,"is_guilty_party_in_legal_separation":false,"adoption":null,"is_unworthy":false,"unworthiness_condoned":false,"has_renounced":false,"blood_type":null},
    {"id":"lc3","name":"Ursela","is_alive_at_succession":true,"relationship_to_decedent":"LegitimateChild","degree":1,"line":null,"children":[],"filiation_proved":true,"filiation_proof_type":null,"is_guilty_party_in_legal_separation":false,"adoption":null,"is_unworthy":false,"unworthiness_condoned":false,"has_renounced":false,"blood_type":null},
    {"id":"sp","name":"Victor","is_alive_at_succession":true,"relationship_to_decedent":"SurvivingSpouse","degree":1,"line":null,"children":[],"filiation_proved":true,"filiation_proof_type":null,"is_guilty_party_in_legal_separation":false,"adoption":null,"is_unworthy":false,"unworthiness_condoned":false,"has_renounced":false,"blood_type":null}
  ],
  "will": {
    "institutions": [
      {"id":"i1","heir":{"person_id":"lc1","name":"Sandra","is_collective":false,"class_designation":null},"share":"EntireFreePort","conditions":[],"substitutes":[],"is_residuary":false}
    ],
    "legacies": [], "devises": [],
    "disinheritances": [
      {"heir_reference":{"person_id":"lc2","name":"Tomas","is_collective":false,"class_designation":null},"cause_code":"ChildAttemptOnLife","cause_specified_in_will":true,"cause_proven":true,"reconciliation_occurred":false},
      {"heir_reference":{"person_id":"lc3","name":"Ursela","is_collective":false,"class_designation":null},"cause_code":"ChildGroundlessAccusation","cause_specified_in_will":true,"cause_proven":true,"reconciliation_occurred":false}
    ],
    "date_executed": "2025-06-01"
  },
  "donations": [],
  "config": {"retroactive_ra_11642":false,"max_pipeline_restarts":10}
}
```

### Actual

Measured 2026-07-31 by running the JSON block above through `engine/target/release/inheritance-engine`
on the engine as it stands. Scenario `T2`, succession type `Mixed`, exit code 0 (the runtime
conservation check accepted the output).

- lc1 = 1928571429
- sp = 1071428571
- lc2 = 0
- lc3 = 0

The sum is 3000000000 centavos, which equals the estate exactly, and both disinherited children
receive zero.

### Why it was closed

The behaviour this entry describes — two simultaneous disinheritances making the distributed shares
sum to roughly twice the estate — does not reproduce. The run above conserves the estate to the
centavo and gives Tomas and Ursela ₱0 each, which is what the entry's own `### Expected` section
asked for. The entry is closed as non-reproducing rather than as fixed, because the commit that
changed the behaviour was not identified and this file records only what was measured.

The per-heir split in that same case is a different matter, and it is now BUG-002: an institution of
the entire free portion is still reduced by the instituted heir's legitime, which moves free-portion
pesos to heirs the testator declined to favour without ever breaking the sum.

## BUG-002: An institution of the entire free portion is reduced by the heir's legitime

**Severity:** High
**Status:** Open
**Found:** 2026-07-31
**Location:** engine/src/step7_distribute.rs:421

### Description

At `engine/src/step7_distribute.rs:421` the engine computes

```rust
let excess = &inst_value - &heir_legitime;
```

**unconditionally** — the instituted heir's legitime is subtracted from the value of the institution
whatever the institution's `ShareSpec` is, and `ShareSpec::EntireFreePort` reaches that subtraction
along with every other variant. A compulsory child's legitime is at least as large as the free
portion, so `excess` clamps to zero, `remaining_fp` is left untouched, and the free portion the
testator expressly gave away is instead redistributed intestate.

The defect is invisible to every conservation check in the tree, because the total always still
equals the estate. Only the per-heir split moves. Its observable signature is a nonzero
`from_intestate` on an heir the will did not institute.

### Reproduction

```json
{
  "net_distributable_estate": {"centavos": 3000000000},
  "decedent": {
    "id": "d",
    "name": "Roberto",
    "date_of_death": "2026-01-15",
    "is_married": false,
    "date_of_marriage": null,
    "marriage_solemnized_in_articulo_mortis": false,
    "was_ill_at_marriage": false,
    "illness_caused_death": false,
    "years_of_cohabitation": 0,
    "has_legal_separation": false,
    "is_illegitimate": false
  },
  "family_tree": [
    {"id": "lc1", "name": "Ana", "is_alive_at_succession": true, "relationship_to_decedent": "LegitimateChild", "degree": 1, "line": null, "children": [], "filiation_proved": true, "filiation_proof_type": null, "is_guilty_party_in_legal_separation": false, "adoption": null, "is_unworthy": false, "unworthiness_condoned": false, "has_renounced": false, "blood_type": null},
    {"id": "lc2", "name": "Ben", "is_alive_at_succession": true, "relationship_to_decedent": "LegitimateChild", "degree": 1, "line": null, "children": ["gc1"], "filiation_proved": true, "filiation_proof_type": null, "is_guilty_party_in_legal_separation": false, "adoption": null, "is_unworthy": false, "unworthiness_condoned": false, "has_renounced": false, "blood_type": null},
    {"id": "gc1", "name": "Cora", "is_alive_at_succession": true, "relationship_to_decedent": "LegitimateChild", "degree": 2, "line": null, "children": [], "filiation_proved": true, "filiation_proof_type": null, "is_guilty_party_in_legal_separation": false, "adoption": null, "is_unworthy": false, "unworthiness_condoned": false, "has_renounced": false, "blood_type": null}
  ],
  "will": {
    "institutions": [
      {"id": "i1", "heir": {"person_id": "lc1", "name": "Ana", "is_collective": false, "class_designation": null}, "share": "EntireFreePort", "conditions": [], "substitutes": [], "is_residuary": false}
    ],
    "legacies": [],
    "devises": [],
    "disinheritances": [
      {"heir_reference": {"person_id": "lc2", "name": "Ben", "is_collective": false, "class_designation": null}, "cause_code": "ChildMaltreatment", "cause_specified_in_will": true, "cause_proven": true, "reconciliation_occurred": false}
    ],
    "date_executed": "2025-06-01"
  },
  "donations": [],
  "config": {"retroactive_ra_11642": false, "max_pipeline_restarts": 10}
}
```

### Expected

Quoted from .planning/research/LEGAL-CONFORMANCE.md section 2a, the row citing Arts. 842 ¶2, 888 and
914:

> Art. 914: "The testator may devise and bequeath the **free portion** as he may deem fit." The
> legitime is what he cannot dispose of (Art. 886), so the two are disjoint and additive.

That report's own worked figure for this fact pattern, quoted from the same row:

> ₱30M, Ana instituted to the entire free portion, Ben validly disinherited with a child Cora → Ana
> ₱18,750,000 / Cora ₱11,250,000; correct is ₱22,500,000 / ₱7,500,000.

This entry asserts no independent legal conclusion of its own. The quotations above are the
attributed source; whether they are right is a question for the lawyer, not for this file.

### Actual

Measured 2026-07-31 by running the JSON block above through `engine/target/release/inheritance-engine`
on the engine as it stands. Scenario `T1`, succession type `Mixed`, exit code 0.

- lc1 = 1875000000
- lc2 = 0
- gc1 = 1125000000

Sum 3000000000 centavos, equal to the estate. The per-component split of those rows, which is where
the defect is visible:

| heir | net_from_estate | from_legitime | from_free_portion | from_intestate |
|---|---|---|---|---|
| lc1 (Ana, instituted to the entire free portion) | 1875000000 | 750000000 | 750000000 | 375000000 |
| lc2 (Ben, validly disinherited) | 0 | 0 | 0 | 0 |
| gc1 (Cora, Ben's child, not instituted) | 1125000000 | 750000000 | 0 | 375000000 |

₱3,750,000 of the free portion emerges as `from_intestate` on gc1, an heir the will never instituted.
That row is the signature.

### Owning requirement

**No requirement in `.planning/REQUIREMENTS.md` currently owns this fix.** It is documented here, not
scheduled. `LAW-06`, `LAW-07` and `LAW-12` are the phase-14 legal requirements and none of them covers
`ShareSpec::EntireFreePort`; the three are additionally blocked on lawyer answers recorded in
`.planning/BLOCKED-REQUIREMENTS.md`. Filing this entry is deliberately not the same as inventing a
requirement to close it.
