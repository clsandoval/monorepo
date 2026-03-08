# Spec Gaps

## Stage 008 — Enums Migration

- Stage file says "28 enums" but spec (`data-model/schema.md`) only defines 21 enum types.
- Stage file lists `deployment_phase` as one of the enums, but no `CREATE TYPE deployment_phase` exists anywhere in the spec. Skipped — will add when spec defines it.
- Proceeded with all 21 enums actually defined in the spec.

## Stage 016 — Financial Tables

- Stage specifies `cc_terminals.status` values as `ordered, received, configured, deployed, returned`, but `00001_enums.sql` defines `cc_terminal_status` with different values (`not_ordered, ordered, delivered, installed`). Created new type `cc_terminal_stage_status` with the stage-specified values.
- Stage specifies `replay_signs.status` values as `ordered, produced, shipped, installed`, but `00001_enums.sql` defines `sign_status` with values `staged, shipped, delivered, installed`. Created new type `replay_sign_stage_status` with the stage-specified values.
- `invoice_type` enum (`deposit, final, change_order`) not defined in `00001_enums.sql` — created inline in migration 00005.

## Stage 018 — Hardware Catalog Seed

- Stage file says "50 hardware catalog items" but `seed-data.md` defines exactly 47 items across 8 categories. Inserted 47 items as per spec.
- `seed-data.md` INSERT uses `model` and `notes` columns not present in `hardware_catalog` table schema. `notes` mapped to `description`, `model` omitted.
