# Fixture — a reinstated stale claim

This document exists only to drive `STALE CLAIM` in `scripts/check-doc-claims.mjs`. It deliberately
reinstates the claim that claim C1 records as corrected, and names none of the strings any claim
requires, so the same run also drives `CLAIM UNSUPPORTED`.

| Artifact | Requires | Observed state |
|---|---|---|
| Rust engine WASM binary | wasm-pack | **NOT built.** No `.wasm` binary file exists in that directory. |
