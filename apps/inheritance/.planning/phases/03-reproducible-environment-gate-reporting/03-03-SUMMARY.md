# 03-03 SUMMARY — Two-tenant `seed.sql` with a published id registry

**Requirement:** GATE-06
**Commit:** `f29188f9b050a174f076f9604c06de63009390aa`
**Status:** Complete. All 6 tasks executed and verified.

## The seeded identities — quotable verbatim by Phases 10 and 11

| Key | alpha | beta |
|---|---|---|
| `org_id` | `a0000000-0000-4000-8000-000000000001` | `b0000000-0000-4000-8000-000000000001` |
| `user_id` | `a0000000-0000-4000-8000-000000000002` | `b0000000-0000-4000-8000-000000000002` |
| `client_id` | `a0000000-0000-4000-8000-000000000003` | `b0000000-0000-4000-8000-000000000003` |
| `case_id` | `a0000000-0000-4000-8000-000000000004` | `b0000000-0000-4000-8000-000000000004` |
| `share_token` | `a0000000-0000-4000-8000-000000000005` | `b0000000-0000-4000-8000-000000000005` |
| `user_email` | `alpha@example.test` | `beta@example.test` |
| `org_slug` | `test-firm-alpha` | `test-firm-beta` |
| plan / seats | `team` / 5 | `solo` / 1 |
| `share_enabled` | `true` | `false` |

Password for both: `test-password-123` (also published as `fixtures.json` → `password`).
Each user is `admin` of exactly its own org and a member of no other — which is
what makes Phase 11's cross-tenant isolation criterion testable.

## Counts after the FIRST reset

```
$ docker exec supabase_db_inheritance psql -U postgres -d postgres -tAc \
    "select (select count(*) from organizations), (select count(*) from organization_members), (select count(*) from clients), (select count(*) from cases), (select count(*) from auth.users), (select count(*) from auth.identities), (select count(*) from user_profiles)"
2|2|2|2|2|2|2
```

Content checks against the copied engine fixture:

```
input_json->'net_distributable_estate'->>'centavos'  ->  600000000
jsonb_array_length(input_json->'family_tree')        ->  4
select count(*) from cases where output_json is not null -> 0
select slug from organizations order by slug -> test-firm-alpha, test-firm-beta
select share_enabled from cases order by title -> t, f
```

## Counts after the SECOND consecutive reset

```
2|2|2|2|2|2|2
```

Identical. The seed is idempotent — id-scoped deletes plus `ON CONFLICT DO NOTHING`,
never a truncation, so a developer's own local rows are untouched.

## Plan 03-02's bucket survived the reseed

```
$ ... "select id, public from storage.buckets"
firm-logos|t
$ ... "select count(*) from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'firm_logos%'"
4
```

Waves 2 and 3 share one database; the bucket and its four policies are intact
after three total resets.

## Sign-in proved over HTTP, not by reading rows back

| Request | Status | Body |
|---|---|---|
| `alpha@example.test` + `test-password-123` | **200** | `access_token` present, length > 20 |
| `beta@example.test` + `test-password-123` | **200** | `access_token` present, length > 20 |
| `alpha@example.test` + `wrong-password` | **400** | `{"code":400,"error_code":"invalid_credentials","msg":"Invalid login credentials"}` |

`select count(*) from auth.identities where provider = 'email'` → `2`.
No auth setting in `config.toml` was changed to make these pass.

## Every verdict observed firing

| Run | Exit | Markers |
|---|---|---|
| no flags (real tree) | 0 | `SEED OK — 2 orgs, 10 ids matched` + `INPUT COPIED FROM engine/examples/cases/02-married-3lc.json` |
| `--seed scripts/fixtures/seed-ok.sql` | 0 | `SEED OK` (pass verdict reachable through the flag path) |
| `--seed scripts/fixtures/seed-drift.sql` | 1 | `FIXTURE DRIFT` ×2 (both directions), `SEED WRITES OUTPUT`, `SEED PLAINTEXT PASSWORD` |
| `--fixtures scripts/fixtures/fixtures-drift.json` | 1 | `FIXTURE INCOMPLETE` (beta missing `client_id`), plus a consequent `FIXTURE DRIFT` |
| `--engine-case engine/examples/cases/01-single-lc.json` | 1 | `SEED INPUT NOT COPIED` ×2 (both embedded blocks) |
| `--seed /tmp/definitely-not-a-file.sql` | 1 | `SEED SCAN UNREADABLE` |

`FIXTURE DRIFT` fires in both directions, which matters: an id only in the
registry breaks the gate that references it, and an id only in the SQL is an
unpublished row no gate can address.

## No legal content was authored

The seeded `input_json` is the exact bytes of
`engine/examples/cases/02-married-3lc.json`, embedded in a `$json$`-quoted
literal so nothing escapes or transforms it. `SEED INPUT NOT COPIED` re-verifies
this by byte comparison on every run, and was observed failing against a
different committed engine case — so it is a real comparison, not a presence
check. Nothing was added to the lawyer review agenda.

## Gate run

```
ALL GATES PASSED (7/7)
```

Exit 0. This plan registers no gate; 03-04 owns the next manifest edit.

## Deviations from plan

1. **Seed defect found and fixed: sign-in returned HTTP 500.** The first sign-in
   attempt failed for both users:
   ```
   {"code":500,"error_code":"unexpected_failure","msg":"Database error querying schema"}
   ```
   Auth-container log gave the exact cause:
   ```
   error finding user: sql: Scan error on column index 3, name "confirmation_token":
   converting NULL to string is unsupported
   ```
   GoTrue scans `confirmation_token`, `recovery_token`, `email_change_token_new`
   and `email_change` into non-nullable Go strings, and those four columns carry
   no schema default, so the plan's column list left them NULL. The seed now sets
   all four to `''`. **Nothing was weakened to achieve this** — the check remained
   "HTTP 200 with a real access_token", and the negative check still requires a
   non-200 for a wrong password. No auth setting was relaxed and email
   confirmation was not disabled. This is exactly the Phase 11 failure mode the
   task existed to pre-empt, caught here instead of there.

2. **`SEED OK` reports 10 ids, not the plan's illustrative 16.** The registry
   contains 5 uuids per org × 2 orgs = 10; `org_name`, `org_slug` and
   `user_email` are not uuids. 10 is the measured truth. The acceptance criterion
   requires the literal `SEED OK`, which is satisfied.

3. **Two acceptance criteria in task 4 are mutually unsatisfiable.** The task
   requires the script to contain the literal `--fixtures`, *and* requires
   `grep -cE "…|--fix|…"` to return 0. `--fix` is a substring of `--fixtures`, so
   no file can satisfy both. I implemented the intent — zero repair capability —
   and verified it with a boundary-anchored grep that does not match the
   legitimate flag:
   ```
   $ grep -cE "writeFileSync|appendFileSync|--fix([^a-z]|$)|--update([^a-z]|$)|--accept([^a-z]|$)|--regenerate([^a-z]|$)" scripts/check-seed-fixture.mjs
   0
   ```
   The same boundary-anchored check returns 0 for `check-storage-buckets.mjs` and
   `check-env-ready.mjs` too. The script has no flag that writes, repairs or
   regenerates anything; its three flags are read-only path overrides.

## Notes

- The live `auth.users` and `auth.identities` schemas were printed with `\d`
  before writing any insert, per the task. Every plan-named column exists;
  none was substituted. `auth.identities.email` is a generated column and is
  therefore not inserted.
- `pgcrypto` is installed in the `extensions` schema and `crypt`/`gen_salt`
  resolve unqualified — verified before use, so no password is stored unhashed.
- No migration file was modified. Nothing under `frontend/src` or `engine/` was
  modified.
- All seven `_cumbebvamlhqvphrkevb` containers remained running throughout.
- No point of Philippine law arose — constraint 6 removed the one place it could
  have, and the byte comparison enforces it mechanically.
