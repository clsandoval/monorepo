# Spec Gaps

## Stage 004 — F09 team_contacts seed

The spec INSERT omits the `slug` column, but `team_contacts.slug` is `NOT NULL UNIQUE`.
Resolution: derived slugs from lowercase first name (niko, chad, andy, ernesto, carlos, marco).
