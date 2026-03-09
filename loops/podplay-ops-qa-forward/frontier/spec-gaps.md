# Spec Gaps

## Stage 007 — Pre-existing build failure

`npm run build` fails with `TS2688: Cannot find type definition file for 'vite/client'` and `node`.
This error pre-exists my changes (reproduced on clean HEAD). `tsc --noEmit` passes.
The build verify step is blocked by a missing `node_modules` install for the app.

---

## Stage 004 — F09 team_contacts seed

The spec INSERT omits the `slug` column, but `team_contacts.slug` is `NOT NULL UNIQUE`.
Resolution: derived slugs from lowercase first name (niko, chad, andy, ernesto, carlos, marco).
