# Phase 16 Brief — Perpetual Verification Loop

**Status:** brief only. Do NOT plan or execute until Phase 15 is complete.
**Recorded:** 2026-07-31, from an owner conversation. This file is the input to
drafting Phase 16; it is not itself a phase.

## Intent

After the 15-phase verification foundation lands, the project shifts from
*building* verification to *running* it — indefinitely, unattended, until the
owner says stop. The loop hardens what exists. It does not grow the product.

Assumed scale: **50–200 lawyers** using the app with real client data.

## The governing rule

> A verification pass may only produce three things: a failing test, a fix for a
> failing test, or a report. Never a new capability.

For UI work specifically, which is where scope creep is most likely to enter,
the rule narrows further:

> A UX finding may fix a **broken or missing state on surface that already
> exists**. It may not add surface.

Fixing an empty state that renders nothing → fix. Making an overflowing table
scroll → fix. Adding a dashboard widget, a new filter, a redesigned nav →
scope creep.

## Deliverable 1: `scripts/check-scope.mjs` (build this FIRST)

Makes the rule structural rather than aspirational. A lock file pins the app's
surface area:

- route count (`frontend/src/routes/`)
- exported component count
- runtime dependency count (`package.json`, `Cargo.toml`)
- migration count (`supabase/migrations/`)
- public engine exports (`engine/src/wasm.rs`)

Growing any of these fails the gate. Adding to the lock is **owner action**,
exactly like `gates.manifest.json` under loop invariant 2. Register it in
`gates.manifest.json` as a blocking gate.

This is the piece that makes the rest safe to leave unattended. Nothing else in
Phase 16 should be planned before it exists.

## Deliverable 2: the pass rotation

One angle per scheduled run, cycling. Roughly **2:1 experience-to-correctness** —
the UI/UX surface is the product surface for a 24-route lawyer-facing app, and
it is the one area no unit test covers.

### Experience track — vision agents using the app via Playwright

Drive the **running app**: real auth, real seeded DB (Phase 3's two-tenant
fixture), real WASM. Not a component harness. Judge with a vision model against
a UX rubric — not a pixel diff, which only asks "did it change?" and will
happily certify a confusing screen forever.

| Pass | Scope |
|---|---|
| Full journey, eyes open | signup → onboard → intake → wizard → compute → results → PDF → share. Screenshot every step. Is the next action obvious? Anything unreadable, unlabeled, misaligned, truncated? |
| State matrix per route | empty, loading, error, partial, permission-denied, unauthenticated, expired share token — across all 24 routes. Surfaces the missing global error boundary (blank screen on uncaught throw). |
| Adversarial input, visually | 20 heirs, ₱900-trillion estates, 80-char Filipino names, zero heirs. Does layout survive? |
| Viewports | mobile / tablet / desktop. Lawyers work from phones. |
| Wizard comprehension | give a vision agent only a fact pattern, no instructions. Where it hesitates is where a real lawyer abandons. |

### Correctness track

| Pass | Why |
|---|---|
| Tenant isolation / RLS | **Highest stakes.** Authorization is entirely RLS; no app-layer checks beyond route redirects. Failure mode is one firm seeing another's clients. Worth two slots in the rotation. |
| Legal correctness | differential + property testing against new heir shapes |
| Money integrity | `centavos: number \| string` precision trap, pesos/centavos wizard boundary, tax bridge |
| Fuzz / crash | malformed input at every boundary — WASM, Zod, JSONB |
| Data integrity | JSONB columns have no Postgres constraints |
| Dependency CVEs | `npm audit` + `cargo audit` |

## Explicitly out of scope at this scale

Load testing, caching, horizontal scaling, perf profiling, bundle-size budgets.
A client-side SPA on managed Supabase does not notice 200 users. Leaving these
off the list *is* an anti-scope-creep measure — an idle loop will otherwise
optimize a render path nobody is waiting on.

## Reuse, do not rebuild

- `visual-qa-loop` skill — auths a test user, seeds state via DB, screenshots
  each state, reports actionable gaps
- Playwright MCP tools
- Phase 10's browser harness, rubric evaluator (closed kind set), perceptual diff
- Phase 3's two-tenant seed fixture and published id registry

The experience track is mostly **wiring what already exists** to a vision judge
with a UX rubric.

## What makes it "forever"

A background workflow dies with the Claude Code process — this happened twice
during the 15-phase run. Perpetual means **GitHub Actions on a `schedule:`
trigger**, which requires:

1. pushing the outstanding commits (owner action, outward-facing)
2. adding a `schedule:` block to `.github/workflows/inheritance.yml`, currently
   `workflow_dispatch` only

Those are the same two changes that would finally verify GATE-04, so they pay
for themselves twice.

Each scheduled run: pick the next angle → hunt → adversarially verify the
finding → fix or file → commit → update `LOOP-STATUS.md`. Converging to "found
nothing new" and idling cheap is the **correct** steady state, not a signal to
go find something to build.
