# BUILD-SPEC — Milestone H1: Hardening Loop (2026-08-10)

The contract for an unattended multi-week hardening loop. Set up via the e2e-loop skill at the
owner's explicit request ("do the e2e loop skill and set up loop so that i can leave it running
for a few weeks unattended and when i come back it's just done"). The owner left before an
interview was possible; every decision below not quoted from him is an ASSUMPTION, posted to
Telegram, correctable by a Telegram message at any time.

## Verbatim directive

> "it doesn't like scope creep … featurewise i kind of want to lock it down. what i really want
> is just to iron down what we already have: make sure that no regressions, reliable, responsive,
> quick loading, correctness. and if possible even do like a visual qa design pass to make sure
> that on mobile on desktop the design identity of the website is cohesive … a little bit like
> steve jobs … restraint … quiet … really just focused and minimal."

## Scope

**Feature-locked. No new features, no new routes, no new dependencies, no schema changes.**
The five axes, in priority order:

1. **Correctness** — engine outputs, money units, PDF parity. Wrong-but-confident is worse
   than nothing (CLAUDE.md constraint); anything contested legally stays BLOCKED per invariant 6.
2. **No regressions** — the frozen 38-gate suite is the regression harness. It may only get greener.
3. **Reliability** — error states render, WASM panics don't blank the page, autosave survives,
   share links work anonymously.
4. **Quick loading** — the shipped JS bundle is 1.6 MB in one chunk; route-level code splitting
   and WASM lazy-init are IN scope (perf work, not feature work). Budget: landing page usable
   < 2s on Fast 3G-class throttling, main bundle < 500 KB gz on the landing path.
5. **Responsive + cohesive visual QA** — 390 / 768 / 1280 on every entry-point route; one
   identity, consistently applied. Bar: restraint, minimal, quiet (owner's words).

**Terminal user action:** a lawyer signs up on prod, completes intake → wizard → results →
estate tax → exports the PDF, and every peso figure on the PDF matches the screen.

## UI revamp — explicitly staged, not started

The owner is choosing a new site identity from gpt-image-2 mockups over Telegram. Until a
direction is LOCKED by his reply, the loop hardens the CURRENT design only. When locked, the
identity is applied as a restrained style pass (palette/typography tokens, one-variable diffs —
colour-swap rule, never reinterpretation), then visual baselines are re-approved once.

## Authority boundaries (unchanged from CLAUDE.md — the loop may NOT)

- Retire/weaken any gate (G5 enforces). G20/G21 registered-but-deleted → owner decision,
  requested via Telegram, loop continues past them only if the owner replies "retire".
- Decide any point of Philippine law. Lawyer-blocked requirements stay blocked and are NOT
  ship-blocking for H1.
- Commit with broad staging — every commit via `bash apps/inheritance/scripts/safe-commit.sh`
  with explicit paths, apps/inheritance paths only (G7).

**Delegated by this contract** (because "when i come back it's just done"): the loop MAY approve
journey reference baselines (the 15 steps Phases 16–19 withheld for human review) when the
rendered screen is correct under the current design — every approved baseline is posted to
Telegram with the screenshot, owner veto reopens it.

## Gates for H1 (mechanical, additive to the frozen 38)

| id | check | command/threshold |
|---|---|---|
| H1-G1 | Full frozen suite green | `bash apps/inheritance/scripts/ci-gates.sh` exit 0 (modulo G20/G21 pending owner ruling) |
| H1-G2 | Perf budget | landing route JS ≤ 500 KB gz; route chunks lazy; measured, recorded in gate-results |
| H1-G3 | Responsive sweep | Playwright screenshots 390/768/1280 on all entry-point routes, zero horizontal scroll, zero clipped controls |
| H1-G4 | Live P0 | signup → intake → wizard → results → tax → PDF driven on prod; PDF figures == screen figures |
| H1-G5 | Visual cohesion | one palette, one heading face, one body face across routes — mechanical token scan + 3-lens review panel |

## Loop mechanics

- Runs in this Claude Code session, self-paced (/loop dynamic). Each cycle: run gates → take the
  reddest thing → scout inline → fix via ultracode Workflow (builders with disjoint files +
  adversarial verifiers) → dogfood as the lawyer persona → commit → report.
- Deploys to inheritance-frontend.fly.dev only when H1-G1..G3 are green and local P0 passed;
  every deploy reported to Telegram with the live URL.
- Push to the working branch allowed; no PRs, no merges to main unattended.
- If the session dies, resume = read this file + RESUME.md; both are kept current every cycle.

## Findings deferred to the identity style pass (do not fix twice)

From the 2026-08-10 cohesion review — these are consolidation work the owner's chosen identity
will restyle anyway; fixing them now under the current identity would be churn:

- Four different progress-indicator designs (GuidedIntakeForm, WizardContainer, EstateTaxWizard,
  onboarding dots) with conflicting active/completed colors (navy / solid gold / gold-tint / green).
- Page-title typography drift: canonical `text-xl font-bold tracking-tight font-serif` vs sans
  variants in intake, estate-tax and results headers; hardcoded hexes (`#1e3a5f`, `#c5a44e`) in
  EstateTaxWizard instead of theme tokens.
- Heir table at 390 scrolls inside its container with no visible affordance (fade/scrollbar hint).
- Family tree does not fit-to-screen on mount at narrow widths (pan/zoom exists; default framing).
- Estate-tax header title truncates over-eagerly at 768 (`truncate` fires with free space nearby).
- **Family-tree visualizer completeness** (dogfound 2026-08-10, presentation not data — table/narrative/deed
  are all correct): the tree omits surviving-spouse and ascendant heir nodes entirely (a spouse-only or
  parents-only estate renders the decedent with zero heir nodes despite full distribution); the rightmost
  child clips off-canvas in wide families on the default (non-fit) view; the pie legend paints both parents
  the same orange. All live in `components/results/visualizer/` — restyle candidates for the identity pass.

## Spend

`spend-ledger.json` in this directory. Cap: **$40 USD external provider spend** (OpenAI images
etc.; agent tokens are subscription and paced, not dollar-billed). At cap: stop + report.

## Reporting

Telegram (existing bot, `TELEGRAM_CHAT_ID` in monorepo `.env`): per-milestone summary, immediate
message on any blocker/owner decision, baseline approvals with screenshots, deploy notices.
Mid-loop owner messages are polled each cycle via `tg.py get_updates` and folded in as tasks.

## Wake-me list (the only interrupts worth the owner's attention)

1. G20/G21 retire-or-restore ruling.
2. Identity mockup direction lock (drives the style pass).
3. Spend cap reached, or a gate that cannot go green within budget (stop + exact blocker).
4. Anything requiring a push to main, a paid service change, or a legal call.

## Stop conditions

(a) H1-G1..G5 green AND live P0 passed → final report, then drop to a daily regression cadence;
(b) spend cap; (c) unresolvable red gate; (d) owner says stop. On every stop: ledger,
gate-results, RESUME.md and Telegram are current.
