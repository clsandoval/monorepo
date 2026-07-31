---
phase: 08-remaining-unblocked-legal-tax-bridge-defects
plan: 05
status: complete
requirements: [LAW-05]
commit: 6dde94c9f7ebafb66015ae6b5baabd6764e31e35
---

# 08-05: Named regression vectors for both halves of LAW-05

## The four vectors

All four passed on their **first** run with the exact centavo values stated in the plan — the values
were derived in `08-RESEARCH.md` before the fix, not read back out of the fixed engine.

| Vector | Asserts |
|---|---|
| `test_law05a_preterition_preserves_a_non_inofficious_legacy` | `IntestateByPreterition`; carlos=300000000, ana=1350000000, ben=1350000000; no `Kevin` row; a `preterition` flag |
| `test_law05a_inofficious_legacy_is_reduced_not_dropped` | carlos=1500000000, ana=750000000, ben=750000000 — each child at exactly the Art. 888 legitime; an `inofficiousness` flag |
| `test_law05b_collated_donation_defeats_preterition` | `Testate`; ben=1500000000, Kevin=1500000000; NO `preterition` flag |
| `test_law05b_exempt_donation_still_preterites_and_flags` | `IntestateByPreterition`; ben=3000000000; a `preterition_exempt_donation` flag naming `ben` |

The fourth vector's comment states in the source that 3000000000 is the **unchanged pre-fix
measurement**, asserted for that reason, and that the vector takes **no position** on LAWYER-09. Its
load-bearing assertion is the flag.

## Corpus re-measured against the fixed engine

`cargo build --release`, then all **173** committed inputs run through the CLI:

```
NONZERO 2 examples/defect-cases/02-heir-donation-above-estate.json
NONZERO 2 examples/defect-cases/03-stranger-donee.json
TOTAL_FILES=173
```

Exactly the two known LAW-06 entries in `engine/defect-baseline.json` exit 2. All 171 others exit 0.

The seven inputs `08-RESEARCH.md` §1.3 predicted would move, re-measured — every one now shows the
legatee row and conserves to the centavo:

| Input | estate (centavos) | rows | conserved |
|---|---|---|---|
| `testate-cases/08.json` | 1600000000 | lc1 750000000, sp 750000000, **Old Friend 100000000** | yes |
| `fuzz-cases/061` | 3317340000 | lc1/lc2/lc3/sp 552890000 each, **Nora Reyes 666505329, Ana Aquino 439274671** | yes |
| `fuzz-cases/062` | 5706930000 | lc1 1807840234, lc2/sp 1807840233, **Julia Ramos 283409300** | yes |
| `fuzz-cases/066` | 51520000 | lc1 40234100, **Ursela Aquino 11285900** | yes |
| `fuzz-cases/067` | 776860000 | lc1/lc2/lc3 129476667 each, **Tomas Ramos 181954068, Zenaida Ramos 105947731, Gabriel Torres 100528200** | yes |
| `fuzz-cases/068` | 9854180000 | lc1..lc4 1591232550 each, **Bruno Mendoza 609690800, Zenaida Aquino 1232620700, Rosa Garcia 1646938300** | yes |
| `fuzz-cases/069` | 35890000 | lc1/lc2 13237150 each, **Xavier Cruz 9415700** | yes |

## Verified, not claimed

```
cargo test                        542 passed, 0 failed  (from 538)
cargo test --test integration      43 passed, 0 failed; all four law05 vectors named in the output
cargo test --test fuzz_invariants  17 passed, 0 failed
cargo test --test observability     3 passed, 0 failed
cargo test --test defect_ledger      3 passed, 0 failed  no STALE DEFECT DECLARATION
node scripts/check-observability.mjs / check-lawyer-agenda.mjs / check-commit-discipline.mjs  exit 0
```

`git diff` is additions only — no pre-existing expected value was edited. Commit lists exactly 1 file.
`ALL GATES PASSED (13/13)` was not reached and is not claimed.
