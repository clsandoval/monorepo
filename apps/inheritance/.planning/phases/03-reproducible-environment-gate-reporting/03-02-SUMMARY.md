# 03-02 SUMMARY — `firm-logos` bucket by migration, plus code↔migration parity

**Requirement:** GATE-07
**Commits:** `9e43093a9645a4cf9bdc410636accea5262dd1ea` (plan work), `6b92837726024c8e9fdb53cea480639d0eaa558f` (setup-env.sh fix, see Deviations)
**Status:** Complete. All 5 tasks executed and verified.

## Measured fact later plans may rely on

**The runtime storage-bucket set has exactly one member: `firm-logos`.**
`grep -rn "storage.from(" frontend/src` returns two call sites, both through
`LOGO_BUCKET` in `frontend/src/lib/firm-profile.ts`; `grep -rn "createBucket"
frontend/src` returns nothing. Plan 03-04 and later phases may treat this count
as measured rather than re-deriving it.

## Bucket state after the FIRST `supabase db reset`

```
$ docker exec supabase_db_inheritance psql -U postgres -d postgres -tAc \
    "select id, public, file_size_limit, array_to_string(allowed_mime_types, ',') from storage.buckets order by id"
firm-logos|t|2097152|image/png,image/jpeg,image/svg+xml

$ ... "select count(*) from storage.buckets"
1
```

## Bucket state after the SECOND consecutive `supabase db reset`

```
firm-logos|t|2097152|image/png,image/jpeg,image/svg+xml

$ ... "select count(*) from storage.buckets"
1
$ ... "select count(*) from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'firm_logos%'"
4
```

Both resets exited 0. Identical single row both times. A bucket created once by
hand through the dashboard cannot survive a reset, and a non-idempotent migration
errors on the second apply — neither happened, so the bucket demonstrably comes
from `013_storage_buckets.sql`.

## Policies, as returned by `pg_policies`

```
firm_logos_owner_delete
firm_logos_owner_insert
firm_logos_owner_update
firm_logos_public_read
```

Read is public. INSERT, UPDATE and DELETE are each guarded by
`bucket_id = 'firm-logos' AND (storage.foldername(name))[1] = auth.uid()::text`,
transcribing the `${userId}/logo.${ext}` path `uploadLogo` writes
(`firm-profile.ts:141`, `:152`). Public means public read of logo images, not
public write.

Every column value is transcribed from a named constant: `id`/`name` from
`LOGO_BUCKET`, `file_size_limit` from `MAX_LOGO_SIZE_BYTES` (2 * 1024 * 1024 =
2097152), `allowed_mime_types` from `ALLOWED_LOGO_TYPES`. `public = true` cites
`03-RESEARCH.md` section 4.2 rather than restating the reasoning.

## Every verdict observed firing

| Run | Exit | Markers |
|---|---|---|
| real tree, no flags | 0 | `BUCKETS OK — 1 referenced, 1 migrated` |
| `--src …/buckets-unmigrated/src --migrations …/buckets-unmigrated/migrations` | 1 | `UNMIGRATED BUCKET` ('ghost-bucket'), `UNRESOLVED BUCKET REFERENCE` (`MISSING_CONST`) |
| `--src …/buckets-orphan/src --migrations …/buckets-orphan/migrations` | 1 | `ORPHAN BUCKET` ('stale-bucket'), `RUNTIME BUCKET CREATION` |
| `--src …/buckets-ok/src --migrations …/buckets-ok/migrations` | 0 | `BUCKETS OK — 1 referenced, 1 migrated` |
| `--src /tmp/definitely-not-a-directory-xyz` | 1 | `BUCKET SCAN UNREADABLE` |

The `buckets-ok` run matters on its own: it proves the pass verdict on a tree
other than the real one, so a green result is not an artifact of the real tree's
shape.

`grep -rn "createBucket" frontend/src` returns no matches — the real-tree
baseline for `RUNTIME BUCKET CREATION` is 0.

## Check properties, verified by grep

```
$ grep -cE "writeFileSync|appendFileSync|--fix|--update|--accept|--regenerate" scripts/check-storage-buckets.mjs
0
$ grep -cE "child_process|fetch\(|https?:" scripts/check-storage-buckets.mjs
0
$ grep -nE "^import" scripts/check-storage-buckets.mjs
45:import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
46:import path from 'node:path';
```

No database, no socket, no subprocess — so it runs wherever the other gates run,
including CI, which has neither Docker nor Postgres.

## Gate run

```
ALL GATES PASSED (7/7)
```

Exit 0. This plan registers no gate; 03-04 owns the next manifest edit.

## Deviations from plan

1. **Defect found and fixed in `scripts/setup-env.sh` (03-01's artifact).**
   The first `supabase db reset` failed:
   ```
   {"_tag":"Error","error":{"code":"LegacyDbBootstrapError","message":"Could not find the supabase-go binary required to bootstrap the local database."}}
   ```
   Cause: `supabase_linux_amd64.tar.gz` ships **two** binaries, `supabase` and
   `supabase-go`, and the installer moved only the first. `supabase start`
   tolerates this; `supabase db reset` does not. Anyone following the documented
   bring-up would have hit it. The installer now moves both and halts with
   `SETUP CANNOT RUN` if either is absent from the tarball. Committed separately
   as `6b92837`.

2. **Comment-stripping added to `check-storage-buckets.mjs`.** The first fixture
   run produced a false positive at `unresolved.ts:1` — the scanner matched
   `.storage.from(IDENT)` inside a `//` comment. A doc comment that merely
   mentions a call site would have failed the gate spuriously. Comment bodies
   are now blanked (preserving character positions, so reported line numbers
   stay accurate) in both the TS and SQL scans. Per the plan's instruction, the
   script was fixed, never the fixture; the genuine violation at
   `unresolved.ts:6` still fires.

## Notes

- No existing migration was modified; `001`–`012` are untouched applied history.
- No file under `frontend/src` was modified.
- No bucket was created through Studio, the storage API, or `createBucket`.
- All seven `_cumbebvamlhqvphrkevb` containers remained running throughout.
- The `logo_url`-holds-a-path defect (`uploadLogo` returns `data.path`, not a
  URL) is **not** fixed here — out of scope, recorded in `03-RESEARCH.md` §4.3
  and carried in STATE.md Pending Todos for Phase 11/12.
- No point of Philippine law arose. Nothing added to the lawyer review agenda.
