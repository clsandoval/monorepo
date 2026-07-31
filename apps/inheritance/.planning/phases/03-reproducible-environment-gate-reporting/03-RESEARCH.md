# Phase 3 Research — Reproducible Environment & Gate Reporting

**Phase goal**: A developer (or agent) can stand up a complete working environment from a clean
checkout in one documented pass, and every gate run produces machine-readable, skip-aware results.

**Requirements**: GATE-05, GATE-06, GATE-07, GATE-08, GATE-09
**Depends on**: Phase 1 (the gate runner and the four product gates), Phase 2 (the frozen manifest,
the three-valued exit contract, the run record)

---

## 0. What this phase is, and what it is not

This phase finishes the *infrastructure* that later DB-touching phases stand on. It adds no legal
rule, changes no engine code, and asserts nothing about a peso figure.

It is explicitly **not**:

- The place where journey gates get written. Phase 10 builds the seeding and rubric seams; Phases 11
  and 12 write the gates. This phase only guarantees that a local Supabase with known fixture rows
  exists for them to run against.
- The place where `check-env-ready.mjs` becomes a blocking gate. Registering a gate that requires a
  running Docker daemon and a running Supabase stack would turn the GitHub Actions check red, since
  no Supabase runs there. That registration belongs to Phase 11, where the DB-touching gates that
  need it are written. Section 6 states this decision and its consequence.
- The place where the `firm-logos` path-versus-URL defect is fixed. Section 4.3 records the defect
  because the bucket work surfaced it; repairing it is product behavior and is left to the journey
  phases.

---

## 1. Measured starting state

Every figure below was measured in this tree on 2026-07-31, not assumed.

### 1.1 Supabase toolchain

| Fact | Measured value |
|---|---|
| `which supabase` | not installed |
| `docker --version` | `Docker version 29.1.3` — daemon reachable, `docker ps` exits 0 |
| Latest Supabase CLI release | `v2.110.0` (`api.github.com/repos/supabase/cli/releases/latest` returned 200) |
| Linux asset available | `supabase_linux_amd64.tar.gz` — no root and no package manager required |
| Last CLI version this project saw | `v2.78.1`, recorded in `frontend/supabase/.temp/cli-latest` |
| Project linked to a remote? | No. `frontend/supabase/.temp/` contains only `cli-latest`; there is no `project-ref` file |

The absence of a `project-ref` matters for a concrete reason: the CLI names its containers
`supabase_<service>_<project_id>` when a project is unlinked, and `supabase_<service>_<remote-ref>`
when it is linked. Unlinked means the container names are derivable from `config.toml` alone, so
every verification command in this phase can name a container deterministically.

### 1.2 A port collision that already exists

`apps/inheritance/frontend/supabase/config.toml` requests ports 54321 (api), 54322 (db), 54323
(studio), 54324 (inbucket), 54327 (analytics), 54320 (shadow), 54329 (pooler).

Four of those are **occupied right now** by a different Supabase stack belonging to another app in
this monorepo:

```text
54320 free   54321 BUSY   54322 BUSY   54323 BUSY   54324 BUSY   54327 free   54329 free
```

```text
supabase_db_cumbebvamlhqvphrkevb        0.0.0.0:54322->5432/tcp
supabase_kong_cumbebvamlhqvphrkevb      0.0.0.0:54321->8000/tcp
supabase_studio_cumbebvamlhqvphrkevb    0.0.0.0:54323->3000/tcp
supabase_inbucket_cumbebvamlhqvphrkevb  0.0.0.0:54324->8025/tcp
```

This is not a transient accident. Five sibling apps declare port 54321 in their own
`supabase/config.toml`:

| Config | `project_id` | api port |
|---|---|---|
| `apps/daimon-provisioner/supabase/config.toml` | `daimon-provisioner` | 54421 |
| `apps/sec-compliance/supabase/config.toml` | `sec-compliance` | 54321 |
| `apps/taxklaro/supabase/config.toml` | `taxklaro` | 54321 |
| `apps/daimon-saas/supabase/config.toml` | `daimon-saas` | 54321 |
| `apps/taxklaro/frontend/supabase/config.toml` | `frontend` | 54321 |
| `apps/inheritance/frontend/supabase/config.toml` | `app` | 54321 |

A bring-up sequence that says `supabase start` and stops there does not produce a working
environment on this machine — it produces a port-bind failure whose cause is another app. Since
GATE-05 is precisely the claim "following one documented sequence yields a working local
environment", the sequence has to be collision-proof rather than merely correct in isolation.

The block **55320–55329 was measured entirely free**, and no sibling config claims it.

`project_id = "app"` is also a hazard rather than a name: it produces containers called
`supabase_db_app`, which says nothing about which app, and it invites exactly the collision above.

### 1.3 Storage

Exactly **one** storage bucket is referenced by runtime code:

```text
frontend/src/lib/firm-profile.ts:23   export const LOGO_BUCKET = 'firm-logos';
frontend/src/lib/firm-profile.ts:140  const bucket = supabase.storage.from(LOGO_BUCKET);
frontend/src/lib/firm-profile.ts:163  const bucket = supabase.storage.from(LOGO_BUCKET);
```

`grep -rn "storage\.from(" frontend/src` returns those two call sites and nothing else.
`grep -rn "createBucket" frontend/src` returns **0** — no code path creates a bucket at runtime, so
a bucket that is not in a migration simply does not exist.

No migration creates it. `grep -l "storage.buckets" frontend/supabase/migrations/*.sql` matches
nothing across all nine migrations. `012_pdf_storage.sql` creates a `case_pdfs` table with a
`storage_key` column, but `grep -rn "case_pdfs\|storage_key" frontend/src` returns **0 hits** — no
code reads or writes that table, so it implies no second runtime bucket.

Conclusion, measured rather than inferred: GATE-07's "every runtime-required storage bucket" is a set
of exactly one, `firm-logos`, and the count is checkable rather than asserted.

Constants that fix the bucket's parameters, all from `frontend/src/lib/firm-profile.ts`:

```text
MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024        (2097152)
ALLOWED_LOGO_TYPES  = ['image/png', 'image/jpeg', 'image/svg+xml']
uploadLogo path     = `${userId}/logo.${ext}`   (firm-profile.ts:152)
```

### 1.4 Seed data

`frontend/supabase/seed.sql` **does not exist**. The config already expects it:

```toml
[db.seed]
enabled = true
sql_paths = ["./seed.sql"]
```

So `supabase db reset` will apply it the moment the file lands — no config change is required for
GATE-06, only the file.

Table shapes needed by a fixture, from `frontend/supabase/migrations/001_initial_schema.sql`:
`organizations` (id, name, slug matching `^[a-z0-9\-]{3,60}$`, plan in solo/team/firm, seat_limit),
`organization_members` (org_id, user_id, role), `user_profiles` (id references `auth.users`, email),
`clients` (org_id, full_name), `cases` (org_id, user_id, client_id, title, status, `input_json`,
`share_token`, `share_enabled`).

### 1.5 Gate reporting

The run record `.gate-runs/latest.json` exists at `schema: 1` and carries, per gate,
`{id, status, exit_code, started_at, ended_at}`. It is **gitignored** (`.gitignore` names
`.gate-runs/` and explains that per-run detail is deliberately not committed). Nothing is published
for a status page to read. Phase 2's own STATE.md carries the note: *"Phase 3 (GATE-08) extends
`.gate-runs/latest.json` into the published gate-results format a status page consumes. Phase 2
builds the precursor only."*

Skip accounting today, measured across every mechanism by which one of the seven gates could pass
while silently checking less:

| Mechanism | Command | Measured |
|---|---|---|
| Rust ignored tests | `grep -rn "#\[ignore" engine/src engine/tests \| wc -l` | **0** |
| Vitest skip/only/todo | `grep -rnE "\.(skip\|only\|todo)\(\|\bxit\(\|\bxdescribe\(" frontend/src \| wc -l` | **0** |
| TypeScript suppressions | `grep -rn "@ts-nocheck\|@ts-ignore\|@ts-expect-error" frontend/src \| wc -l` | **0** |
| `skipLibCheck` | `grep -n "skipLibCheck" frontend/tsconfig*.json` | **1 hit** — `frontend/tsconfig.json:7: "skipLibCheck": true` |

So the skip baseline is **one declared skip and zero undeclared skips**. That is the ideal starting
point for a shrink-only ledger: the ledger opens with exactly one entry and can only get smaller.

Gate G3 already fails on any runtime skip — `frontend/scripts/check-test-baseline.mjs` line 173
treats `numPendingTests > 0 || numTodoTests > 0 || skippedNames.length > 0` as a hard failure with
marker `SKIPPED TESTS`. What is missing is not enforcement inside G3; it is **accounting across all
gates, published in the run record**, which is what GATE-09 asks for.

---

## 2. Design decision: a dedicated port block and a real project id

**Decision.** `frontend/supabase/config.toml` moves to the measured-free 55320–55329 block and
renames `project_id` from `app` to `inheritance`.

| Setting | Old | New |
|---|---|---|
| `project_id` | `app` | `inheritance` |
| `[api] port` | 54321 | 55321 |
| `[db] port` | 54322 | 55322 |
| `[db] shadow_port` | 54320 | 55320 |
| `[db.pooler] port` | 54329 | 55329 |
| `[studio] port` | 54323 | 55323 |
| `[inbucket] port` | 54324 | 55324 |
| `[analytics] port` | 54327 | 55327 |

**Why a block move rather than stopping the other stack.** The bring-up sequence must work while a
sibling app's stack is running, because that is the observed state of this machine and because
telling a developer to stop another team's database is not a documented sequence, it is a conflict.
Moving one app's ports is a one-line-per-service change that removes the collision permanently.

**Why the rename.** Container names become `supabase_db_inheritance`, `supabase_kong_inheritance`,
and so on. Every verification command in this phase can then name its container literally, which is
what lets a plan say `docker exec supabase_db_inheritance psql ...` instead of asking the executor to
discover a name. `psql` is **not installed on the host** (`which psql` → not found), so container
execution is the only route to the database, and a deterministic container name is a prerequisite
rather than a nicety.

**Consequence for the frontend.** `frontend/.env.local.example` currently points at
`http://localhost:54321`, which after this change points at a *different app's database*. Silently
reading another product's Postgres is precisely the class of failure this project ranks worst, so the
example file moves to `http://127.0.0.1:55321` in the same plan, not a later one.

---

## 3. Design decision: one script is the documented sequence

**Decision.** `scripts/setup-env.sh` is the single documented bring-up command, and
`scripts/check-env-ready.mjs` is the separate, read-only verdict on whether the environment is up.

Two artifacts rather than one, for the same reason Phase 1 split `build-wasm.sh` from the gate that
checks its output: **a script that both performs an action and judges it can always report success
for work it did not do.** `setup-env.sh` installs and starts; `check-env-ready.mjs` only observes and
never installs, starts, or writes. It has no `--fix`, `--install`, or `--start` flag, by the same
rule that forbids an update flag on the manifest check.

**The CLI is version-pinned.** `setup-env.sh` installs Supabase CLI **2.110.0** from
`https://github.com/supabase/cli/releases/download/v2.110.0/supabase_linux_amd64.tar.gz` into
`$HOME/.local/bin/supabase`. Pinning matters here more than usual: the CLI decides the Postgres
image, the storage-service version, and the auth-service version, so an unpinned CLI silently
changes what "the local environment" means between two runs of the same documented sequence.

**Docker is a precondition, not something the script installs.** `docker --version` exists on this
machine; installing a container runtime is a system-administration act outside a repo script's
authority. A missing or unreachable Docker daemon is a `cannot run` condition, reported as such.

---

## 4. Design decision: the bucket is created by migration, with locked parameters

**Decision.** `frontend/supabase/migrations/013_storage_buckets.sql` inserts the `firm-logos` bucket
and its `storage.objects` policies. Every parameter is copied from a constant that already exists in
the codebase, so none of them is invented here.

### 4.1 The three parameters and where each comes from

| Parameter | Value | Source |
|---|---|---|
| `id` / `name` | `firm-logos` | `LOGO_BUCKET`, `firm-profile.ts:23` |
| `file_size_limit` | `2097152` | `MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024`, `firm-profile.ts:21` |
| `allowed_mime_types` | `image/png`, `image/jpeg`, `image/svg+xml` | `ALLOWED_LOGO_TYPES`, `firm-profile.ts:22` |

### 4.2 The one parameter that is a decision: `public = true`

This is the only bucket property with no existing constant to copy, so the plan locks it explicitly
rather than leaving it to the executor.

**Decision: `public = true`.** The grounds are three observations, not preference:

1. `frontend/src/components/settings/LogoUpload.tsx:43-44` renders the stored value directly as
   `<img src={currentLogoUrl}>`. A private bucket makes that element unable to load without a signed
   URL, and no code anywhere calls `createSignedUrl`.
2. `frontend/src/lib/__tests__/firm-profile.test.ts:23` mocks `getPublicUrl` on the storage client,
   which is an API that only returns a usable URL for a public bucket.
3. A firm logo is branding that the product prints onto PDFs handed to third parties. It is not case
   data, and no per-case or per-client information is stored in this bucket.

The write path stays restricted regardless: policies allow `INSERT`, `UPDATE` and `DELETE` only when
`(storage.foldername(name))[1] = auth.uid()::text`, which is exactly the `${userId}/logo.${ext}`
layout `uploadLogo` writes at `firm-profile.ts:152`. Public therefore means public *read* of logo
images only.

### 4.3 A defect this work surfaced, deliberately not fixed here

`uploadLogo` returns `data.path` — a storage path such as `user-1/logo.png` — and `settings/index.tsx`
stores that value in `logo_url`, which `LogoUpload.tsx` then feeds to `<img src>`. A path is not a
URL, so the image element points at a route inside the SPA rather than at the object.

This is a genuine product defect and it is **out of scope for Phase 3**. Fixing it changes runtime
behavior in a route that Phase 11 is scheduled to gate. It is recorded here so the Phase 11 author
sees it before writing a screenshot gate that would otherwise certify a broken image as expected.

### 4.4 The check is static parity, so it runs in CI

`scripts/check-storage-buckets.mjs` compares two sets that both live in the repo:

- **referenced** — bucket names appearing in `supabase.storage.from('...')` calls and in exported
  bucket-name constants under `frontend/src`, excluding `__tests__` directories;
- **migrated** — bucket ids appearing in `INSERT INTO storage.buckets` statements under
  `frontend/supabase/migrations`.

It needs no database, so it can run as a blocking gate on GitHub Actions where no Supabase exists.
A live assertion against a running stack also happens, but as a plan verification step rather than as
a CI gate — the same split Phase 1 used for the WASM binary.

---

## 5. Design decision: the seed is two orgs, and its family tree is copied, never authored

**Decision.** `frontend/supabase/seed.sql` seeds **two** organizations, each with its own user,
client, and case, and `frontend/supabase/fixtures.json` publishes the fixed UUIDs.

**Why two orgs when GATE-06 says "a known org, user, and case".** ROADMAP Phase 11 success criterion
4 reads: *"A test run against a real local Supabase proves a user in org A cannot read, write, or
enumerate org B's cases, PDFs, or shared links."* A single-org fixture cannot express that test, so
Phase 11 would have to extend the seed — and extending a seed that later gates already reference by
ID is exactly the churn a fixture exists to prevent. Two orgs is a transcription of a roadmap
criterion, not a scope increase.

**Why fixed UUIDs in a separate JSON file.** Later gates must reference rows by ID. If the IDs live
only inside SQL, every consumer re-parses SQL or hardcodes a literal. `fixtures.json` makes the
contract machine-readable, and `scripts/check-seed-fixture.mjs` fails when the two files disagree, so
the registry cannot rot.

**Why the case `input_json` is copied verbatim.** A seeded case needs a valid `EngineInput`.
Authoring one means choosing a family structure, which is choosing which succession rules the fixture
exercises — the beginning of a legal judgment, which no agent in this project may make. The seed
therefore copies `engine/examples/cases/02-married-3lc.json` byte-for-byte: a committed fixture
(surviving spouse plus three legitimate children, ₱6,000,000 net distributable estate) that already
ships with the engine and is already exercised by its test suite. Copying it introduces no new legal
content whatsoever.

**Auth rows.** Password sign-in against local GoTrue needs a row in `auth.users` **and** a matching
row in `auth.identities` with `provider = 'email'` and `provider_id` set to the user id. Seeding only
`auth.users` produces a user who exists but cannot sign in — a failure that surfaces later, in
Phase 11, as a login gate that fails for an environmental reason. The plan seeds both tables and
verifies sign-in works through the running API rather than by reading rows back.

---

## 6. Design decision: skip accounting is per gate, published, and shrink-only

**Decision.** A new gate **G8** (`node scripts/check-gate-skips.mjs`) accounts for skipped
assertions across every gate, and `gate-skips.lock` is a **shrink-only** ledger of declared skips
seeded with exactly one entry.

### 6.1 The constraint that shapes the whole design

`gates.manifest.lock` freezes each gate's exact `command` string, and
`scripts/check-gate-manifest.mjs` exits 1 with `GATE COMMAND CHANGED` when one differs. An executing
agent may not change a locked command. So the obvious approach — wrap `cd engine && cargo test` in a
reporting wrapper — is **prohibited**, not merely inelegant.

What is permitted: the manifest may **grow** (append a gate to both manifest and lock together), and
`scripts/ci-gates.sh` itself is not locked. The design follows from that:

- `ci-gates.sh` tees each gate's combined output to `.gate-runs/logs/<GATE_ID>.log`, stamping the run
  id on the first line. No gate command changes.
- `scripts/check-gate-skips.mjs` reads those logs with a fixed per-gate parser table and reads the
  static skip sources that produce no log output.
- G8 is appended to `gates.manifest.json` and `gates.manifest.lock` together, which is the legal
  growth path already documented in GATES.md section 1.

### 6.2 The parser table, fixed per gate

| Gate | Command (unchanged) | How a skip is counted |
|---|---|---|
| G5 | `node scripts/check-gate-manifest.mjs` | Gate count minus checked count, from the `MANIFEST OK` summary line |
| G6 | `node scripts/check-plan-closed-world.mjs` | Plan files found minus plan files linted |
| G7 | `node scripts/check-commit-discipline.mjs` | Commits in range minus commits audited |
| G1 | `cd engine && cargo test` | Sum of the `N ignored` and `N filtered out` fields on every `test result:` line |
| G2 | `bash engine/build-wasm.sh` | Post-build checks declared minus post-build checks run (existence, size floor, magic number) |
| G3 | `cd frontend && npm run test:gate` | `numPendingTests + numTodoTests + skippedAssertions`, already computed by `check-test-baseline.mjs` |
| G4 | `cd frontend && npx tsc -b --force` | Static: `skipLibCheck` / `skipDefaultLibCheck` in `frontend/tsconfig.json`, plus the count of `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error` under `frontend/src` |

G2, G5, G6 and G7 are Node or Bash scripts this project owns, so they emit their own accounting line.
Their **file contents** are not frozen — only the command strings that invoke them — so adding an
output line is legal and changes no locked value.

G1 and G4 belong to external toolchains and cannot be asked to emit anything, so their accounting is
derived: G1 from `cargo test`'s own summary line, G4 from static configuration. This is the honest
split, and section 8 of GATES.md will say so rather than implying uniform treatment.

### 6.3 Why the ledger shrinks rather than grows

`gate-skips.lock` opens with exactly one entry, matching the measurement in section 1.5:

```text
G4 · tsconfig.skipLibCheck · TypeScript does not type-check .d.ts files of dependencies
```

`check-gate-skips.mjs` fails with `UNDECLARED SKIP` on any observed skip absent from the lock, and
with `STALE SKIP DECLARATION` on any lock entry no longer observed. The second marker is what forces
the ledger down: the day `skipLibCheck` is turned off, the lock must lose its entry or the gate goes
red. This mirrors `frontend/test-baseline.json` (shrink-only) and inverts `gates.manifest.lock`
(growth-only), and both directions point the same way — toward more verification over time.

There is no update flag, for the reason already established in GATES.md section 1: a check that can
rewrite its own baseline is not a check.

### 6.4 Staleness

A log left over from a previous run would let a gate report yesterday's skip count as today's. Each
log's first line carries the current run's `started_at`, and `check-gate-skips.mjs` exits 1 with
`SKIP REPORT MISSING` when a required log is absent, unreadable, or stamped with a different run id.
A missing report is a failure, never a silent zero.

---

## 7. Design decision: published results are a separate artifact from the run record

**Decision.** `scripts/publish-gate-results.mjs` writes **`gate-results.json`** at the app root, and
a new gate **G9** (`node scripts/check-gate-results.mjs`) validates it.

### 7.1 Why not simply un-gitignore `.gate-runs/latest.json`

`.gate-runs/latest.json` is a *runner-internal* record: it carries no gate name, no `proves` text, no
requirement mapping, and its comment in `.gitignore` explains that per-run detail is deliberately
uncommitted. `loop-status.mjs` line 170 even notes the absence of a gate name as a known limitation.
A status page needs the joined view — the manifest's descriptive fields married to the run's
observations — which is a different artifact with a different lifetime, not the same file with the
ignore rule deleted.

Precedent for committing a regenerated file already exists in this repo: `LOOP-STATUS.md` and
`loop-history.jsonl` are both committed and both rewritten on every full run.

### 7.2 The shape

`gate-results.json`, schema 1, four top-level keys:

- `schema`, `generated_at`
- `run` — `{started_at, ended_at, outcome, failure_signature, manifest_version, gates_total, gates_run}`
- `gates[]` — per gate: `id`, `name`, `order`, `blocking`, `proves`, `requirements` (joined from the
  manifest) plus `status`, `exit_code`, `started_at`, `ended_at`, `duration_seconds`,
  `skipped_assertions`, `declared_skips[]` (joined from the run and the skip report)
- `requirements[]` — the roll-up a status page actually renders: `{id, gates[], status}` where status
  is `pass` only when every gate carrying that requirement id passed

`status` per gate uses the run record's four values verbatim — `pass`, `fail`, `cannot-run`,
`not-run` — so "skipped" can never be collapsed into "passed". That distinction is GATE-09's whole
point, and encoding it in the published schema is what makes it survive the trip to a status page.

### 7.3 Publishing on every exit path, including the bad ones

A results file written only after a green run describes exactly the situation nobody needs to
investigate. `ci-gates.sh` therefore calls the publisher **after each gate's result is recorded** and
again **from the EXIT trap**, alongside `write_run_record`. The trap already runs on success, gate
failure, and halt alike, and it already carries the rule that the recorder must never change the exit
code — the publisher inherits both properties.

Publishing incrementally also resolves G9's ordering problem: G9 runs last, so by the time it
executes, `gate-results.json` already reflects every gate before it in the current run. G9 allows
exactly one gate to be `not-run` at inspection time — itself — and fails `RESULTS INCOMPLETE` on any
other.

### 7.4 Markers

`RESULTS MISSING`, `RESULTS UNREADABLE`, `RESULTS STALE` (the file's `run.started_at` differs from
the current run's), `RESULTS INCOMPLETE` (a manifest gate is absent, or a gate other than G9 is
`not-run`), and `RESULTS OK` on success.

---

## 8. Wave plan and why it is ordered this way

Five plans, five waves, strictly sequential. Nothing here runs in parallel, for two distinct reasons
that each cover part of the chain.

| Wave | Plan | Delivers | Blocked by, and why |
|---:|---|---|---|
| 1 | `03-01` | Pinned CLI, port block, `setup-env.sh`, `check-env-ready.mjs` | Nothing |
| 2 | `03-02` | `013_storage_buckets.sql`, `check-storage-buckets.mjs` | Wave 1 — the live half of its verification needs a running stack |
| 3 | `03-03` | `seed.sql`, `fixtures.json`, `check-seed-fixture.mjs` | Wave 2 — both run `supabase db reset` against the same database, and its own verification asserts the bucket from wave 2 survives a reset |
| 4 | `03-04` | Per-gate skip accounting, `gate-skips.lock`, gate G8 | Waves 1–3 — edits `scripts/ci-gates.sh`, `gates.manifest.json`, `gates.manifest.lock`, `GATES.md` |
| 5 | `03-05` | `publish-gate-results.mjs`, `gate-results.json`, gate G9, README sequence | Wave 4 — edits the same four files, and consumes the skip report wave 4 produces |

**Waves 2 and 3 are sequential because they share a database.** Two plans that each run
`supabase db reset` in parallel would truncate each other's work mid-verification, and the resulting
failure would look like a defect in the seed rather than a scheduling artifact.

**Waves 4 and 5 are sequential because they share four files.** Phase 2 hit the same shape and
resolved it the same way: its waves 2, 3 and 4 each edited `scripts/ci-gates.sh` in turn.

---

## 9. Implementation constraints inherited from Phases 1 and 2

Every plan in this phase carries these. They are not restated as discoveries in the plans; they are
transcribed as constraints.

1. **Explicit commit paths only.** `git add -A`, `git add .`, and `git commit -a` are prohibited —
   a concurrent auto-committer runs on this monorepo. Use
   `bash scripts/safe-commit.sh -m "<message>" <path> ...`.
2. **No test, assertion, or gate may be weakened.** A gate that cannot legitimately pass is reported
   BLOCKED with pasted command output, per `.planning/PLAN-STANDARD.md` section 3.
3. **The gate set may only grow.** Appending G8 and G9 requires updating `gates.manifest.json` and
   `gates.manifest.lock` in the same commit. No locked `command` string may change.
4. **No check may rewrite its own input.** No `--update`, `--fix`, `--accept`, `--regenerate`, or
   waiver flag on any artifact in this phase.
5. **Every failure path must be observed firing against a committed fixture.** A gate nobody has seen
   fail is not known to be a gate.
6. **Dependency-free checks.** Every new check is Node ESM using only `node:` builtins, or Bash. No
   `package.json` is created at the app root and no dependency is installed into it.
7. **`npx tsc -b --force`, never bare `tsc -b`.** A committed `tsconfig.tsbuildinfo` can otherwise
   mask errors.
8. **No point of Philippine law arises in this phase.** If one appears, halt and report BLOCKED
   rather than deciding it.

---

## 10. Validation Architecture

**Framework.** None at `apps/inheritance/` root. Every artifact in this phase is a command-line check
whose entire observable contract is `(exit code, marker string on stdout)`, plus two SQL files whose
contract is "the database contains these rows after `supabase db reset`". Phases 1 and 2 established
this pattern; it carries forward unchanged.

**Feedback signals, fastest to slowest:**

| Signal | Command | Latency |
|---|---|---|
| Static checks | `node scripts/check-storage-buckets.mjs && node scripts/check-seed-fixture.mjs` | ~2 s |
| Environment verdict | `node scripts/check-env-ready.mjs` | ~5 s |
| Database reset and reseed | `cd frontend && supabase db reset` | ~40 s |
| Full gate run | `bash scripts/ci-gates.sh` | ~300 s |

**Sampling rate.** Each task's `<verify>` block after that task; each plan's full `<verification>`
checklist after that plan, including every fixture-driven failure path; `bash scripts/ci-gates.sh`
after each wave with the exit code expected at that point.

**Ground truth for each requirement:**

| Requirement | Ground truth, and how it is observed |
|---|---|
| GATE-05 | `scripts/setup-env.sh` run end to end on a machine where the sibling stack is up, followed by `node scripts/check-env-ready.mjs` exiting 0 with `ENV READY` |
| GATE-06 | `supabase db reset` followed by a row-count query through `docker exec supabase_db_inheritance psql`, plus a real password sign-in through the API on port 55321 |
| GATE-07 | `select id, public, file_size_limit from storage.buckets` returning exactly one `firm-logos` row after a reset, plus `check-storage-buckets.mjs` exiting 1 on a fixture whose code references an unmigrated bucket |
| GATE-08 | `gate-results.json` present and valid after a passing run, after a failing run, and after a halt — all three observed by injecting failures with the existing `GATES_INJECT_*` variables |
| GATE-09 | `check-gate-skips.mjs` exiting 1 with `UNDECLARED SKIP` against a fixture log carrying `1 ignored`, and with `STALE SKIP DECLARATION` against a lock entry no longer observed |

**Nyquist note.** The riskiest artifact in this phase is `scripts/ci-gates.sh`, edited by two
consecutive waves. It is sampled after every task that touches it, not only at plan end, because a
runner that stops running gates correctly invalidates every other measurement in the project.

---

## 11. Open items deliberately left to later phases

- **`check-env-ready.mjs` is not registered as a blocking gate.** It requires Docker and a running
  stack; GitHub Actions has neither. Phase 11 owns that registration, alongside the DB-touching
  journey gates that actually need it.
- **The `logo_url`-holds-a-path defect** (section 4.3) is recorded, not fixed. Phase 11 or 12 owns it.
- **Seed growth for journey gates.** Phase 10's seeding seams may need additional fixture rows
  (invitations, deadlines, PDFs). `fixtures.json` is designed to be appended to; this phase seeds
  only what GATE-06 and Phase 11's RLS criterion require.
- **`frontend/supabase/_MIGRATION_NOTES.md`** records that migrations 002, 003 and 008 were never
  written and 006 is a no-op. Migration `013` continues the existing numbering; renumbering history
  is not attempted.

---

## 12. Points of Philippine law arising in this phase

**None.**

The one place where a legal question could have entered is the seeded case's `input_json`, since
authoring a family tree means choosing which succession rules the fixture exercises. Section 5
removes that risk entirely by copying `engine/examples/cases/02-married-3lc.json` verbatim rather
than authoring anything.

Nothing is appended to `.planning/LAWYER-AGENDA.md` from this phase.
