# Spec Gaps

## Stage 008 — Enums Migration

- Stage file says "28 enums" but spec (`data-model/schema.md`) only defines 21 enum types.
- Stage file lists `deployment_phase` as one of the enums, but no `CREATE TYPE deployment_phase` exists anywhere in the spec. Skipped — will add when spec defines it.
- Proceeded with all 21 enums actually defined in the spec.
