---
phase: 17
plan: 17-02
status: complete
requirements: [CITE-01, CITE-02]
---

# 17-02 — The engine is the single attribution authority

Committed `9265e227e` (`engine/src/types.rs`, `engine/src/step10_finalize.rs`,
`frontend/src/types/index.ts`).

## What changed

`HeirNarrative` gained `legal_basis: Vec<String>`, populated by `share.legal_basis.clone()` at both
construction sites — a clone cannot disagree with its source. Because the struct has no `Default`
derive, a missed site would have been a compile error, so a green `cargo test` is proof every site
was reached.

Eight article literals were removed from lawyer-facing prose: the CATEGORY sentence (`Art. 887`), the
REPRESENTATION sentence (`Art. 970`), and six `raw_label` arms (`RA 8552 Sec. 17`, `Art. 179`,
`Art. 176`, `Arts. 1003-1008`, `Art. 972`, `Arts. 1009-1010`).

## The G28 trap, defused as planned

Every removed literal survives **verbatim as a traceability comment** on the line above, because G28
recomputes `implemented_in` by scanning each file's production region — comments included. Naively
deleting them would have made `Art. 176` and `Art. 179` `REGISTERED ARTICLE ABSENT` and drifted
`Art. 887`/`Art. 972`. With the comments in place `engine/legal-rules.json` needed **no edit at all**:
`git diff engine/legal-rules.json engine/legal-traceability.lock` is empty and G28 exits 0.

The two range forms were written unchanged. Expanding `Arts. 1003-1008` would have introduced
`Art. 1003`, which is not registered.

## Assertions updated, none relaxed

Four assertions were updated to new **exact** expected strings — the three `raw_label` tests and the
`test_assemble_narrative_joins_with_spaces` fixture. Every one stayed an exact-equality check; none
became a substring, a `toBeDefined` or a skip. All three `LEGAL-VECTOR` markers are still present.

## Verification

`grep -c "of the Civil Code" engine/src/step10_finalize.rs` → `0`. `cargo test` exit 0 after each of
the three edit tasks. `bash engine/build-wasm.sh` exit 0 (616408 bytes). Re-measured through the
rebuilt artifact: **`ROWS 652 DISAGREEING_ROWS 0 NARRATIVE_SHARE_MISMATCH 0`**, against a baseline of
615. `npx tsc -b --force` exit 0. G1, G2, G28 each exit 0.

## Plan deviation, reported

`files_modified` named four `frontend/src/wasm/pkg/` files. They are **not** in the commit, correctly:
`pkg/.gitignore` is `*`, so the `.wasm` binary is untracked by design, and the two tracked glue files
(`inheritance_engine.js`, `.d.ts`) are byte-identical after the rebuild because the wasm-bindgen
export surface did not change — only the JSON payload shape inside the binary did. The artifact was
rebuilt before the measurement, which is what that acceptance criterion existed to protect.
