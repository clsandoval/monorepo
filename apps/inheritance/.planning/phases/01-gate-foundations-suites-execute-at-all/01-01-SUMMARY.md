---
phase: 01-gate-foundations-suites-execute-at-all
plan: 01
wave: 1
requirements: [GATE-03]
status: complete
commit: a89d58b615ef4ff6dc5cc361d633d85e9a696d76
---

# 01-01 Summary — Single reproducible WASM build command

## What was built

- `engine/build-wasm.sh` (executable, 71 lines) — the single documented command that builds
  `frontend/src/wasm/pkg/inheritance_engine_bg.wasm`. Self-verifying: after `wasm-pack build
  --target web --out-dir ../frontend/src/wasm/pkg` it enforces three post-build checks, each
  exiting 1 with a distinct message — `WASM ARTIFACT MISSING`, `WASM ARTIFACT TOO SMALL`
  (100,000-byte floor), `WASM ARTIFACT NOT A WEBASSEMBLY BINARY` (`0061736d` magic number).
  Prints `WASM BUILD OK` with path and byte size on success.
- `frontend/package.json` — one added line: `"build:wasm": "bash ../engine/build-wasm.sh"`.
  `git diff --numstat` = `1  0`. The actual `wasm-pack` invocation lives in exactly one place.
- `frontend/.gitignore` — removed the dead rule `src/wasm/pkg/inheritance_engine_bg.js`.
  `--target web` emits `inheritance_engine.js`, never a `_bg.js` file, so that rule matched
  nothing. `src/wasm/pkg/*.wasm` retained — the binary remains an untracked build artifact.

## Measured results

| Check | Result |
|---|---|
| `rm -f ...bg.wasm && bash engine/build-wasm.sh` | exit 0, `WASM BUILD OK` |
| Artifact size | **533,807 bytes** |
| `npm run build:wasm` from `frontend/` after deleting the artifact | exit 0, artifact regenerated, same 533,807 bytes |
| `npx vitest run src/wasm/__tests__/` | exit 0 — **`Test Files 5 passed (5)`**, **`Tests 119 passed (119)`** |
| `cargo test` (engine) | exit 0 — 411 + 0 + 1 + 30 + 0 = **442 passed, 0 failed** |
| `git diff --stat` on `inheritance_engine.js` / `.d.ts` | empty — bindings regenerate byte-identically |
| `git diff --stat` on `Cargo.lock` / `Cargo.toml` | empty — never touched |
| `grep -c inheritance_engine_bg.js frontend/.gitignore` | 0 |

Per-file WASM test counts: `bridge.test.ts` 53, `wasm-real.test.ts` 31, `scenario-coverage.test.ts` 14,
`conformance.test.ts` 14, `wasm-live.test.ts` 7 — matching the planned expectation exactly.

## Failure paths observed, not assumed

The size and magic-number checks were exercised against a deliberately corrupted 7-byte artifact
(restored immediately afterward): both fired, reporting `7 bytes` and `0x6e6f7477` respectively.

## Notes

- No wasm-bindgen version mismatch arose. wasm-pack 0.15.0 resolved `0.2.114` from the committed
  `Cargo.lock` on its own, as RESEARCH.md §4 predicted. `Cargo.lock` was not edited.
- No test, assertion, engine source file, or Cargo manifest was modified.
- Commit `a89d58b6` names exactly three paths.
