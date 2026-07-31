# 03-01 SUMMARY — Pinned Supabase CLI, dedicated port block, one-command bring-up

**Requirement:** GATE-05 (partial — bring-up half; README sequence lands in 03-05)
**Commit:** `aec3f2a0c812d5fb34334d8a31034faa2963f183`
**Status:** Complete. All 5 tasks executed and verified.

## Values consumed by later plans

| Value | Setting |
|---|---|
| API port | `55321` |
| DB port | `55322` |
| DB container name | `supabase_db_inheritance` |
| Supabase CLI version | `2.110.0` |
| DB connection (host) | `postgresql://postgres:postgres@127.0.0.1:55322/postgres` |

`psql` is not installed on this host, so plans 03-02 and 03-03 reach the database
via `docker exec supabase_db_inheritance psql -U postgres`.

## Config changes (10 scalar values, `frontend/supabase/config.toml`)

| Key | Section | Old | New |
|---|---|---|---|
| `project_id` | top level | `"app"` | `"inheritance"` |
| `port` | `[api]` | 54321 | 55321 |
| `port` | `[db]` | 54322 | 55322 |
| `shadow_port` | `[db]` | 54320 | 55320 |
| `port` | `[db.pooler]` | 54329 | 55329 |
| `port` | `[studio]` | 54323 | 55323 |
| `port` | `[inbucket]` | 54324 | 55324 |
| `port` | `[analytics]` | 54327 | 55327 |
| `site_url` | `[auth]` | `http://127.0.0.1:3000` | `http://127.0.0.1:5173` |
| `additional_redirect_urls` | `[auth]` | `["https://127.0.0.1:3000"]` | `["http://127.0.0.1:5173", "http://localhost:5173"]` |

`git diff --stat` reported 10 insertions / 10 deletions — no collateral edits.
`[db.seed]` still reads `enabled = true`, `sql_paths = ["./seed.sql"]`, unchanged.
`grep -cE "^port = 5432[0-9]|^shadow_port = 5432[0-9]"` → `0`.

## Installed CLI version (observed, not assumed)

```
$ supabase --version
2.110.0
```

## Both stacks coexist — constraint 5 satisfied

`docker ps --filter name=supabase_ --format '{{.Names}}' | sort` after bring-up:

```
supabase_analytics_inheritance
supabase_auth_cumbebvamlhqvphrkevb
supabase_auth_inheritance
supabase_db_cumbebvamlhqvphrkevb
supabase_db_inheritance
supabase_edge_runtime_inheritance
supabase_inbucket_cumbebvamlhqvphrkevb
supabase_inbucket_inheritance
supabase_kong_cumbebvamlhqvphrkevb
supabase_kong_inheritance
supabase_pg_meta_cumbebvamlhqvphrkevb
supabase_pg_meta_inheritance
supabase_realtime_inheritance
supabase_rest_inheritance
supabase_storage_cumbebvamlhqvphrkevb
supabase_storage_inheritance
supabase_studio_cumbebvamlhqvphrkevb
supabase_studio_inheritance
supabase_vector_inheritance
```

All **seven** `_cumbebvamlhqvphrkevb` containers that were running before this plan
are still running after it. No foreign container was stopped, restarted or reset.

## Success line

```
ENV READY — api 55321, db 55322, container supabase_db_inheritance
```

## Failure paths observed firing (not merely coded)

Run before bring-up, with no stack and no CLI:

| Invocation | Exit | Markers printed |
|---|---|---|
| `node scripts/check-env-ready.mjs` | 1 | `CLI MISSING`, `STACK DOWN`, `PORT CLOSED` (api 55321), `PORT CLOSED` (db 55322), `ENV FILE MISSING` |
| `node scripts/check-env-ready.mjs --api-port 1` | 1 | same set, with `PORT CLOSED — api port 1` substituted |
| `node scripts/check-env-ready.mjs --config /tmp/definitely-not-a-file.toml` | 1 | `CONFIG MISSING` |
| `node scripts/check-env-ready.mjs` (after bring-up) | 0 | `ENV READY` |

The checker collects every violation rather than returning on the first, so one
run names every unmet precondition.

## Read-only guarantee, verified by grep

```
$ grep -cE "writeFileSync|appendFileSync|--fix|--install|--start|--repair|--update" scripts/check-env-ready.mjs
0
$ grep -nE "^import" scripts/check-env-ready.mjs
47:import { existsSync, readFileSync } from 'node:fs';
48:import path from 'node:path';
49:import net from 'node:net';
50:import { spawnSync } from 'node:child_process';
```

`node:` builtins only. No `package.json` created at the app root; no dependency installed.

## Gate run

```
ALL GATES PASSED (7/7)
```

Exit 0. This plan registers no gate, so the count stays 7 — `check-env-ready.mjs`
is deliberately NOT in the manifest, because GitHub Actions has neither Docker nor
a Supabase stack. Phase 11 owns that registration.

## Deviations from plan

1. **`safe-commit.sh` path form.** Task 5 listed app-relative paths
   (`frontend/supabase/config.toml`). The wrapper resolves to the git root and
   allowlists `apps/inheritance/*`, so app-relative paths are refused. Committed
   with root-relative paths instead. No change to which five files were staged.
2. **`grep -c "db reset"` → 0.** The header comment originally said the script
   "never runs `supabase db reset`", which made the acceptance grep return 1.
   Reworded to "never resets the database" — same meaning, criterion satisfied
   literally. The script still contains no reset invocation.

## Notes

- `supabase start` printed `WARN: no files matched pattern: supabase/seed.sql`.
  Expected: plan 03-03 creates `seed.sql`. `[db.seed]` already points at it.
- `supabase start` also printed `WARN: config section [inbucket] is deprecated.
  Please use [local_smtp] instead.` Not acted on — the plan authorises exactly
  ten scalar edits to this file and no section rename.
- `frontend/.env.local` was generated and is ignored;
  `git status --porcelain apps/inheritance/frontend/.env.local` produces no output.
  The service-role key is deliberately excluded from it.
- No point of Philippine law arose. Nothing added to the lawyer review agenda.
