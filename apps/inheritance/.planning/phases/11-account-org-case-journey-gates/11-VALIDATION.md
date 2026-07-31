---
phase: 11
slug: account-org-case-journey-gates
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-31
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node 20 ESM scripts driving Playwright 1.56.1 headless chromium through `frontend/journey/browser.mjs`; assertions by `node:assert/strict` and by Phase 10's `evaluateRubric` / `compareToReference` |
| **Config file** | none — the journey harness is plain `.mjs` and `frontend/tsconfig.json` does not include `frontend/journey/` |
| **Quick run command** | `cd frontend && node journey/run.mjs --step <stepId>` |
| **Full suite command** | `bash scripts/ci-gates.sh` |
| **Estimated runtime** | single step ~15 s after a build; `--all` ~90 s; `npm run build` 17 s; full gate run ~8 min |

The journey harness deliberately does not run under vitest. `frontend/vitest.config.ts` declares
`environment: 'jsdom'`, and jsdom is exactly what these gates exist to escape — a jsdom screenshot is
not a screenshot. Changing that config would also change the environment gate G3's frozen ledger was
measured under.

---

## Sampling Rate

- **After every task commit:** `node scripts/check-journey-registry.mjs` and, for tasks that touch a
  step, `cd frontend && node journey/run.mjs --step <stepId>`
- **After every plan wave:** `cd frontend && node journey/run.mjs --all && node journey/rls-isolation.mjs`
- **Before phase verification:** `bash scripts/ci-gates.sh`
- **Max feedback latency:** 20 seconds for a single seeded step once `dist/` exists

Latency matters here because waves 3 and 4 author eighteen independent steps. A 20-second single-step
loop is what lets each step's rubric be driven to green in isolation before the whole-suite gate
composes them.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | COV-06 | T-11-01 | `anon` receives no table privilege; RLS remains the row filter | integration | `cd frontend && node journey/db-access-probe.mjs` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | COV-06 | T-11-02 | The share RPC resolves to one signature and honours `share_enabled` | integration | `cd frontend && node journey/db-access-probe.mjs` | ❌ W0 | ⬜ pending |
| 11-01-03 | 01 | 1 | COV-06 | — | N/A | integration | `node scripts/check-seed-fixture.mjs` | ✅ | ⬜ pending |
| 11-02-01 | 02 | 1 | JRNY-03 | T-11-03 | An organization is created with the firm name the user typed, not a user id | unit | `cd frontend && npx tsc -b --force` | ✅ | ⬜ pending |
| 11-02-02 | 02 | 1 | JRNY-03 | T-11-04 | A rejected invitation reports rejection instead of navigating as though accepted | unit | `cd frontend && npm run test:gate` | ✅ | ⬜ pending |
| 11-02-03 | 02 | 1 | JRNY-02, JRNY-03, JRNY-04 | — | N/A | unit | `cd frontend && npm run test:gate` | ✅ | ⬜ pending |
| 11-03-01 | 03 | 2 | JRNY-02 | T-11-05 | The service-role key is read at runtime and never written to a file | integration | `cd frontend && node journey/run.mjs --list` | ❌ W0 | ⬜ pending |
| 11-03-02 | 03 | 2 | JRNY-02 | — | N/A | integration | `cd frontend && node journey/run.mjs --step auth-signin` | ❌ W0 | ⬜ pending |
| 11-03-03 | 03 | 2 | JRNY-02 | T-11-06 | A run that cannot start exits 2 with `JOURNEY CANNOT RUN:` rather than reporting zero failures | integration | `cd frontend && node journey/run-probe.mjs` | ❌ W0 | ⬜ pending |
| 11-04-01 | 04 | 2 | COV-06 | T-11-07 | Org A reads zero of org B's cases, PDFs and share tokens | integration | `cd frontend && node journey/rls-isolation.mjs` | ❌ W0 | ⬜ pending |
| 11-04-02 | 04 | 2 | COV-06 | T-11-08 | Org A's write against org B's row changes zero rows rather than erroring ambiguously | integration | `cd frontend && node journey/rls-isolation.mjs` | ❌ W0 | ⬜ pending |
| 11-05-01 | 05 | 3 | JRNY-02 | — | N/A | integration | `cd frontend && node journey/run.mjs --step auth-signup` | ❌ W0 | ⬜ pending |
| 11-05-02 | 05 | 3 | JRNY-02 | — | N/A | integration | `cd frontend && node journey/run.mjs --step auth-session-persisted` | ❌ W0 | ⬜ pending |
| 11-05-03 | 05 | 3 | JRNY-02 | T-11-09 | Signing out clears the session so a reload does not restore it | integration | `cd frontend && node journey/run.mjs --step auth-signed-out` | ❌ W0 | ⬜ pending |
| 11-06-01 | 06 | 3 | JRNY-03 | — | N/A | integration | `cd frontend && node journey/run.mjs --step org-onboarding-firm` | ❌ W0 | ⬜ pending |
| 11-06-02 | 06 | 3 | JRNY-03 | T-11-10 | An invitation for another user's address is refused | integration | `cd frontend && node journey/run.mjs --step org-invite-rejected` | ❌ W0 | ⬜ pending |
| 11-07-01 | 07 | 3 | JRNY-04 | — | N/A | integration | `cd frontend && node journey/run.mjs --step intake-step-0` | ❌ W0 | ⬜ pending |
| 11-07-02 | 07 | 3 | JRNY-04 | T-11-11 | A recovered draft reaches the page before first paint, with no reload | integration | `cd frontend && node journey/run.mjs --step intake-draft-recovered` | ❌ W0 | ⬜ pending |
| 11-08-01 | 08 | 4 | JRNY-02, JRNY-03, JRNY-04, COV-06 | — | N/A | integration | `node scripts/check-journey-registry.mjs` | ❌ W0 | ⬜ pending |
| 11-08-02 | 08 | 4 | JRNY-02, JRNY-03, JRNY-04, COV-06 | T-11-12 | The gate set only grows; no locked command string changes | integration | `node scripts/check-gate-manifest.mjs` | ✅ | ⬜ pending |
| 11-08-03 | 08 | 4 | JRNY-02, JRNY-03, JRNY-04, COV-06 | — | N/A | integration | `bash scripts/ci-gates.sh` | ✅ | ⬜ pending |

---

## Threat Register

| Ref | Threat | Mitigation | Verified by |
|---|---|---|---|
| T-11-01 | A blanket `GRANT ALL … TO anon` would expose every table to unauthenticated callers, with RLS as the only defence | Per-table, per-verb grants to `authenticated` and `service_role` only; `anon` receives nothing | `journey/db-access-probe.mjs` asserts an anonymous REST read of `cases` returns 42501 |
| T-11-02 | A share link resolving to the wrong overload leaks or hides case data non-deterministically | Exactly one `get_shared_case` signature survives the migration | `journey/db-access-probe.mjs` asserts `pg_proc` holds one row and that a disabled token returns an empty result |
| T-11-03 | An organization named after a user id makes every firm-branded PDF wrong | Both call sites pass the firm name as the first argument | `tsc -b --force` plus the `org-onboarding-firm` rubric asserting the typed name |
| T-11-04 | A silently-accepted bad invitation lets a user believe they joined an org they did not join | The route branches on `result.success` | the `org-invite-rejected` rubric asserts the error text is on screen |
| T-11-05 | A service-role key written to disk by a journey script would be committed by the concurrent auto-committer | The key is read from `supabase status -o env` into a local variable and never written or printed | `grep -rn 'SERVICE_ROLE' frontend/journey/` shows no file write |
| T-11-06 | A journey gate that reports zero failures because it never started would certify nothing | Exit 2 plus the literal `JOURNEY CANNOT RUN:` line, asserted by a probe | `journey/run-probe.mjs` |
| T-11-07 | An isolation assertion over an empty table passes for the wrong reason | Both orgs get a seeded `case_pdfs` row, and the suite asserts the positive control first | `journey/rls-isolation.mjs` |
| T-11-08 | A cross-tenant write that errors rather than affecting zero rows would hide whether RLS or a grant blocked it | The suite asserts the affected-row count is zero and that the same write against the caller's own row succeeds | `journey/rls-isolation.mjs` |
| T-11-09 | A sign-out that leaves the session in storage means every later gate runs as a signed-in user | The step asserts the storage key is absent after sign-out | the `auth-signed-out` rubric plus a storage read |
| T-11-10 | An invitation acceptable by any signed-in user is a tenant boundary hole | `accept_invitation` matches on the caller's own email; the rejected step exercises a token that does not match | the `org-invite-rejected` step |
| T-11-11 | A draft read after mount would make the recovery path untestable and the gate meaningless | Storage is installed with `addInitScript`, never with a post-navigation `evaluate` | the `intake-draft-recovered` rubric asserts the value on first paint |
| T-11-12 | A gate registration that rewrites a locked command string would silently weaken the frozen set | `gates.manifest.lock` grows by exactly two entries and no existing entry changes | `node scripts/check-gate-manifest.mjs` |

---

## Wave 0 Note

Every file marked `❌ W0` does not exist yet and is created by the plan named in its row. No task in
this phase is verified by a command that does not exist at the moment the task completes.
