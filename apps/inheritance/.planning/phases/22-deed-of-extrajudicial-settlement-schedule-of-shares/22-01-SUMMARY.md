# 22-01 — Deterministic stored-ZIP writer

**Status:** complete. Commit `b855b9b83`.

## What shipped

- `frontend/src/lib/deed/zip.ts` (211 lines) — `crc32`, `buildStoredZip`, `ZipEntry`. Imports nothing.
- `frontend/src/lib/deed/__tests__/zip.test.ts` — 22 passing tests.

## Measured

```
cd frontend && npx tsc -b --force            -> exit 0
cd frontend && npx vitest run src/lib/deed/__tests__/zip.test.ts
  Test Files  1 passed (1)
       Tests  22 passed (22)                 -> exit 0
grep -c "^import" zip.ts                     -> 0
grep -c "new Date()|Date.now()|performance.now()" zip.ts -> 0
grep -ci "deflate|inflate|zlib" zip.ts       -> 0
git diff -- frontend/package.json frontend/package-lock.json -> empty
```

## Deviations

- The plan's action text asked the doc comment to say "there is no deflate path", while its own
  acceptance criterion required `grep -c "deflate"` to print 0. The comment was reworded to
  "no compression path" so both could hold. Same claim, no forbidden literal.
- The plan's action said the same about `new Date()`; the comment now says "no wall-clock API of
  any kind", for the same reason.
- `buildStoredZip`'s return type was narrowed to `Uint8Array<ArrayBuffer>` in plan 22-05, because
  `BlobPart` does not accept `Uint8Array<ArrayBufferLike>` under TS 5.9. No cast was introduced.
