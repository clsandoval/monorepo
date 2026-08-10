# RFP Finder web app — autonomous build spec (the loop's guidance)

**Branch:** `rfp-webapp` · **Started:** 2026-08-09 · **Driver:** self-paced /loop, convergence-stop.
This file is the contract. Every loop cycle: advance one wave → run its gate → update
`gate-results.json` + `spend-ledger.json` → stop if all gates green (then deploy) or cap hit.

## Hard boundaries (never violate)
- **Spend cap: $30 USD** (Claude subagents + Luna eval calls, combined). Track in `spend-ledger.json`.
  On reaching cap → STOP + report, do not deploy.
- **Prod deploy ONLY if all 5 gates green.** Red gate → STOP + report, nothing deployed.
- **No main branch, no force-push.** Atomic commits on `rfp-webapp`. Ship as a PR + prod deploy.
- **Expand past lean scope only after asking** (user chose "build lean now, expand if cheap").

## Product scope (v1, exhaustive — do not add)
- **Next.js (app router) + TypeScript + shadcn/ui.** Theme: strictly grayscale. No hue. One neutral
  surface set (bg/surface/border/text). Money figures large & heavy (design asset `09`).
- **Two surfaces only:**
  1. **Chat** — user types; server runs the Agent loop; output rendered as **tender cards**
     hydrated from ids (never prose tables). Streaming.
  2. **Session panel** — list / new / switch / delete. Nothing else.
- **No login.** Anonymous session id in a cookie.
- **Server-side Agent loop** — port `apps/rfp/agent/loop.mjs` (pi + Luna 5.6, the 4 read-only tools,
  cached static prefix w/ schema+cookbook, round cap, cost meter). Reads `corpus.db` read-only.
- **Two SQLite files:** `corpus.db` (shared, read-only) + `sessions.db` (WAL, chat turns).
- **Corpus:** full 22,324 notices. QA runs against a **frozen snapshot** `qa/corpus-snapshot.db`
  (checked in, small slice) so evals are reproducible.

## Stack decisions (locked)
- Next.js app router · shadcn/ui (grayscale) · better-sqlite3 for corpus reads in-process
  (drop the python spawn; note reopen-on-swap for ingest) · pi-agent-core + pi-ai already vendored
  in `apps/rfp/agent/node_modules`, reuse or hoist · Playwright for E2E + visual QA · vitest for units.
- Deploy: new Fly app `rfp-finder` + volume, single machine. Long-lived Node, not serverless.

## The 5 gates (ship-blocking unless noted)
Each gate writes a `{gate, status, checks:[{name,pass,detail}], ts}` block to `gate-results.json`.

### G1 — Harness eval suite (real Luna, gated spend)
8 scenarios in `qa/eval/`, each `{profile fixture, scripted turns, mechanical assertions}` vs the
frozen snapshot:
1. today's-3 (pure SQL, deterministic snapshot)  2. refinement (province in/out)
3. multi-lot `54278` surfaces for ≤₱100K bidder   4. prior-not-filter: ₱40M out-of-budget job appears
   demoted+annotated, not hidden                   5. tight-deadline (≤48h surfaces, deadline stated)
6. misfiled taxonomy (Goods-filed civil works via work_type)  7. adversarial (injection in notice text
   → authorizer holds, no parroting; malformed SQL → self-corrects ≤1 retry)  8. empty-result honesty.
**Global invariants (every scenario):** every cited id exists in DB · read-only guard holds ·
cost/turn ≤ ₱0.25 · cache ratio > 80% · round cap respected.
Run modes: faux-provider (₱0, CI plumbing) + real-Luna (quality). Budget: real-Luna passes are the
main Luna spend — minimise re-runs.

### G2 — Backend / API
session CRUD + persistence across restart · streaming endpoint · SQL authorizer rejects write/ATTACH
(unit) · statement timeout + LIMIT enforced · **per-session token budget → graceful "budget reached"**
· **per-IP rate limit** · `tsc` clean · `eslint` clean · `next build` passes.

### G3 — Frontend visual QA (visual-qa-loop → Telegram)
Screenshot each state to Telegram with captions: empty/landing · streaming · results-as-cards ·
session panel (list/active/switch/new/delete) · error · empty-results. Plus **grayscale assertion**
(fail on any saturated pixel/CSS color beyond neutral).

### G4 — E2E (Playwright, local build off branch)
land → chat → cards render → new session → switch → reload persists session.

### G5 — Convergence
All of G1–G4 green in a single run → write final `gate-results.json` + `RESUME.md` → open PR →
(gates green) deploy to Fly prod → smoke-test the live URL → report URL to Telegram.

## Wave plan
- **W1 scaffold** — Next app + shadcn grayscale theme; server route stub; sessions.db schema; freeze
  `qa/corpus-snapshot.db`. Gate: `next build` + tsc.
- **W2 loop** — port agent/loop.mjs server-side; streaming; per-session token budget + rate limit.
- **W3 correctness** — G1 eval suite (faux + real-Luna) + G2 backend tests.
- **W4 frontend** — chat + cards + session panel states; G3 visual QA.
- **W5 converge** — G4 E2E; G5 convergence + deploy.
Each wave: small focused subagent set (lean), adversarial verify each "done" before accepting.

## Stop conditions
Loop stops when: (a) all 5 gates green AND prod deploy smoke-passes → success report; or
(b) `spend-ledger.json` total ≥ $30 → stop + report; or (c) a gate is blocked and cannot go green
within budget → stop + report (per user's "stop + report" choice). Never ship around a red gate.

---

# Milestone 2 — Full polish (2026-08-09 pm)

Scope UNCHANGED: chat + sessions only. No login. No new features. Light-only, strictly grayscale.
Goal: a genuinely polished, reliable, fast app. Budget: the SAME $30 cap (~$0.10 spent so far);
stay lean, ask before exceeding. Redeploy to https://rfp-finder-ph.fly.dev at each milestone so the
user can watch it improve. I am the QA — hold it to best practices.

## Locked M2 decisions
- **Rendering: `present` tool.** The model's final action is `present({intro, refs:[{id, why, tag?}], note?})`.
  The UI renders cards from `refs`; prose is only `intro`/`note`. NO redundant markdown id-list.
  Parse/validate `present` args; still verify every id exists (anti-hallucination).
- **Theme: light-only grayscale.** Remove any dark blocks; one monochrome palette. Contrast AA.
- **Sessions store: upgrade to node:sqlite** (node22 built-in, WAL) for safe concurrent writes —
  replaces JSON files. Keep the same interface + owner isolation + token budget. (No better-sqlite3.)

## M2 gate checklist (each has mechanical checks; redeploy when a milestone's gates go green)

### P1 — Streaming & rendering polish
- present-tool wired end to end; cards render from refs; no duplicate prose id-list.
- Incremental streaming with NO flicker/layout thrash; markdown re-render stable.
- Tool-activity indicator while searching ("searching…"); Send↔Stop swap during a turn.
- Card hydration reserves space / smooth insert (no reflow jump).

### P2 — Reliability (network/faults)
- **Abort:** Stop button cancels in-flight turn (AbortController → server aborts Luna + tools); partial reply kept.
- **Reconnect/drop:** stream drop mid-turn → clear retry affordance, never a silent hang.
- **Timeouts:** server per-turn timeout → graceful message; client timeout handled.
- **Error states:** 429 rate-limit, 402 budget, 404, 5xx all render clear inline messages; no raw crash/infinite spinner.
- **No lost messages:** user msg persists on error; retry possible. Double-submit guarded.

### P3 — Scroll & responsiveness
- Auto-stick to bottom while streaming ONLY when user is at bottom; scrolled-up is respected + "jump to latest" affordance.
- Long content / long titles / many cards / long sessions all scroll correctly.
- Input responsive during streaming; no jank.

### P4 — Cross-device (Playwright projects: 390 / 768 / 1280)
- Layout, drawer, scrolling, input, cards correct at all three. Zero horizontal overflow anywhere.
- Touch targets >=44px; Enter send / Shift+Enter newline; Escape closes drawer; focus management.

### P5 — Accessibility & a11y basics
- Semantic roles, aria-labels on icon buttons, focus-visible, AA contrast (grayscale), SR-friendly stream region.

### P6 — Concurrency & server robustness
- node:sqlite sessions (WAL); concurrent turns per owner safe; rate-limit + token budget enforced; graceful degradation.

### Regression (must stay green)
- G1 harness eval 7/7 · G2 backend/units · existing E2E · grayscale/visual · build/tsc/eslint.

## QA method (best practices — I run all of it)
- Playwright multi-viewport E2E + visual regression per state; grayscale + no-overflow asserts.
- Fault injection: abort mid-stream, offline, slow network, server 5xx → assert graceful handling.
- Unit: present-tool parse/validate, node:sqlite session store, abort/reconnect logic.
- Real-Luna eval kept green; a11y assertions (roles/labels/contrast).
- Every subagent "done" adversarially verified before acceptance.

## Stop conditions (M2)
All P1–P6 + regression green (or $30 hit → stop+report; or a gate blocked in budget → stop+report).
On full green: final redeploy + smoke + Telegram report. Never ship around a red gate.

## P0 — Real-usage gate (ship-blocking, added after the multi-turn re-greet bug)
Green gates are NOT proof. Before ANY "it works" claim or milestone redeploy:
- Run the eval's `multi-turn-after-greeting` regression (greeting → search MUST call tools + cite ids).
- Record `qa/record-live.ts` end-to-end against LIVE prod and eyeball/ship the video to Telegram.
- Manually reason through a real human session (>=3 turns, no profile) — not just isolated scenarios.
Never claim "done" from build/tsc/gate colour alone.

---

# Milestone 3 — Results-first UI (2026-08-09 overnight, user asleep, ~12h)

**User's directive (verbatim intent):** stop being chat-only. Peg = Google: whatever the person
types, the DEFAULT surface is a long scrolling list of search results (single agent call → search
results, that's it). A separate **AI Mode tab** (like Google's) holds the conversational surface —
the current chat with the card carousel. If time remains after it works, restyle to **style 11 =
signal BLUE** (`ui/apply-11-signal-*` mockups, the blue #1550D8 swap of the red set — per the
colour-swap rule, blue swap of the EXACT red artifacts, nothing else reinterpreted).
Budget: same $30 cap ($0.13 spent). Deploy to https://rfp-finder-ph.fly.dev when gates green.

## M3 architecture (locked)
- **Landing (no query): the board.** Default results list = open notices sorted by closing soon
  (pure SQL, ₱0, like mockup "Open opportunities · 22,145 results"). Search box on top.
- **Search = ONE Luna call, no tool loop.** `/api/search` POST {q}: Luna (forced single
  `search_plan` tool call) converts freeform words → {fts_terms[], province?, abc_min/max?,
  days_max?, work_types[]?} → server executes plan via the proven `rfp` CLI (FTS + SQL) → long
  ranked list. Plan echoed to client; **pagination is stateless** (client posts plan+offset back).
  Greeting/garbage → plan degrades to default board. Cost target ≤ ₱0.06/search.
- **Results tab UI:** dense rows per the mockup: Ref | Title | Agency | ABC (mono, prominent) |
  closes-in chip. Infinite scroll ("keep scrolling"). Row click → PhilGEPS deep link (existing
  noticeUrl). Result count shown.
- **AI Mode tab:** the existing Workspace (sessions, streaming, present-tool, carousel) mounted
  under a tab. Current query carries over when switching. Sessions/reliability behavior unchanged.
- **No regression** of M2 reliability work (abort, errors, budget, rate limit, scroll, a11y).

## M3 gates
- **S1 search eval** (`qa/search-eval.ts`): fixture queries with mechanical assertions —
  filters honored (band/province/days actually constrain results), every id exists, ≥N hits for
  known-good queries, garbage → board fallback, injection in query stays data, cost/search cap.
- **S2 backend:** tsc · eslint · build · unit tests for plan validation/execution/pagination.
- **S3 E2E:** land → board renders → search → list updates → scroll loads more → AI Mode tab →
  query carried → chat+cards work → tab back preserves results. 390/768/1280, no h-overflow.
- **S4 visual:** screenshots per state. Until the style pass: grayscale holds. After style 11
  lands: **palette gate replaces grayscale** — the ONLY hue allowed is signal blue #1550D8
  (± shades of it); everything else neutral. Never a government-style seal; plain wordmark.
- **S5 regression:** existing chat eval 8/8 · unit suite · P0 real-usage gate vs LIVE (new
  record-live flow: search → scroll → AI mode convo) → video to Telegram.
Stop conditions unchanged: all green → deploy+report; $30 cap or blocked gate → stop+report.

---

# Milestone 4 — Notice detail + Enrich (2026-08-09, "invert the script")

**User's directive:** he used the site as a contractor and wants the path from search → "hit
submit on PhilGEPS with documents in order" to require near-zero decisions. Explicit asks:
a **detail page** per notice (results click → in-app detail, not straight to PhilGEPS); an
**Enrich button** that pulls/OCRs the supporting documents and surfaces **deliverables,
qualifications, deliverability**; **competing firms / recently awarded similar contracts**.
Ultracode re-invoked; same $30 cap (~$4.95 spent); polish to done like M3.

## Contractor walk findings (what a bidder must know per notice)
1. *Can I bid?* — PCAB class for the ABC band, SLCC (similar contract ≥50% ABC), statutory
   eligibility docs (PhilGEPS Platinum, NFCC, OSS, tax clearance; RFQ-only for SVP).
2. *What do I deliver?* — the BOQ/line items (often already in `description`!), scope.
3. *When/what process?* — pre-bid conference, closing, bid security (2% cash / 5% surety),
   contract duration, where documents come from.
4. *Is it winnable?* — who wins similar contracts and at what discount (awards.db `win_ratio`).
5. *Who do I talk to?* — contact person + email is already in corpus.

## Data facts (measured)
- `rfp show` already surfaces scope, line items, contact, solicitation no, PCAB flag — ₱0.
- Legacy (81%): abstract page is PUBLIC (pre-bid conf, exact ABC) but attachments are
  auth-gated → enrich uses notice text + statutory rules, labeled "from notice text".
- mPhilGEPS (19%): attachments downloadable, `extract_lib.py` (pdftotext -layout) proven;
  scanned PDFs need OCR fallback (pdftoppm+tesseract → Dockerfile adds poppler-utils,
  tesseract-ocr). docs.db (686MB) stays local; prod enriches LIVE per notice, cached.
- awards.db: 2MB, 1,580 awards (1,319 from 2026), winner/winner_province/classification/
  area_of_delivery/win_ratio. buyer_org is a person name (scraper artifact) → match intel on
  classification + province + ABC proximity, NOT agency. Ship in bundle.

## M4 scope
- **/notice/[id] — server-rendered** (SEO wedge per spike decision #6: ungated server HTML).
  Immediate (₱0): ABC large, closing countdown, scope, BOQ table parsed from description,
  agency + contact card, mode/classification chips, statutory requirements checklist keyed by
  mode_norm+classification (static table, marked "standard — confirm in bid docs"), documents
  list if crawled, prominent "Open on PhilGEPS →" (the submit endpoint), back-to-results.
- **Results rows and AI-mode cards link to /notice/[id]**; PhilGEPS deep link moves to the
  detail page (plus a small external-link affordance on rows).
- **Enrich button** → POST /api/notice/[id]/enrich: `enrich_fetch.py` (new, in rfp-bundle;
  reuses extract_lib) fetches the LIVE notice page (both systems, public) + downloads/extracts
  mPhilGEPS attachments (pdftotext → tesseract OCR fallback, cap pages/bytes) → one Luna
  structured pass → {summary, deliverables[], qualifications[] (each grounded: quote + source
  doc), key_dates (pre-bid/opening/duration), bid_security, red_flags[], sources[]}. Persist
  to /data/enrich/<id>.json — cached forever, later visitors see it instantly. Legacy: same
  panel from notice text + statutory rules, honestly labeled. NEVER invent a requirement:
  extraction prompt quotes-or-omits; statutory items come from the static rules table only.
- **"Similar recent awards" panel**: top ~5 awards.db matches (classification + province,
  ABC 0.3–3×, newest first): winner, amount vs ABC (win_ratio as "won at 87% of budget"),
  date. Hidden when no match. This is the competing-firms + pricing intel.

## M4 gates
- D1 detail: SSR page renders for a legacy AND an mPhilGEPS id; BOQ table when parseable;
  countdown correct; PhilGEPS link right per source; 404 for unknown id; tsc/eslint/build.
- D2 enrich: real mPhilGEPS notice w/ attachments → grounded deliverables+qualifications
  (spot-check quotes exist in extracted text); legacy notice → labeled text-only enrich;
  cache hit instant; failure paths graceful (scanned-only, no docs, network fail); cost/enrich
  logged and ≤ ₱5.
- D3 awards intel: matches render correctly; empty state hidden; no cross-classification junk.
- D4 E2E: search → row click → detail → enrich → panels → back preserved; AI card → detail;
  390/768/1280; palette gate on detail page; existing 17 E2E stay green.
- D5 regression + P0: chat eval 8/8, search-eval 7/7, live drive on prod incl. one real
  enrich, video + Telegram report.

---

# Milestone 5 — "The Map" (2026-08-10, from Carlos's roadmap doc)

**Source:** Carlos's "RFP Finder — Possible Next Features" doc (Telegram, scratchpad/tg/
message-2.txt). Through-line: *"contractors can't buy connections from an app, but they can
buy the map — who decides, who really wins, which markets are open."* Build order follows
his doc: awards at scale → supplier profiles + feed → entity dossiers + contestability v0.
**Budget: the remaining ~$20 of the $30 cap.** Approved 2026-08-10.

## HARD RULE — evidence only (ship-blocking gate, from the doc's libel guardrail)
Show verifiable facts with sources; NEVER render conclusions about named parties: no
"shell company", "dummy", "rigged", "wired", "corrupt" anywhere (UI, enrich output, model
prompts, scores). Scores describe MARKETS ("concentrated, low competition"), never accuse
entities. Model-generated text about suppliers/entities passes a banned-terms check.

## Waves
- **W-A awards at scale** (prerequisite for everything): extend ingestion to award notices
  on both systems (legacy ungated w/ peso amounts; mPhilGEPS award pages per notice).
  Backfill as deep as accessible + wire into daily.sh. Normalize winner names (casing/
  punctuation dedupe). Gate: coverage report (awards/entity, awards/supplier distributions)
  + zero regression to notice ingest.
- **W-B supplier profiles + recent-awards feed**: /supplier/[slug] SSR (wins, entities,
  categories, total value, price-vs-ABC behavior over time); winners in detail-page
  similar-awards link to profiles; "Just awarded" feed surface. Gate: SSR + palette +
  E2E + evidence-only check.
- **W-C entity dossiers v0 + contestability v0**: /entity/[slug] SSR (contact roster,
  spending profile from awards, open notices, timing note) + score from computable
  signals ONLY (award concentration, price-to-budget ratios, failed→negotiated rate,
  mode mix — avg-bidders deferred until abstracts spike lands), each signal shown with
  its evidence. Gate: score reproducible from displayed evidence; no accusation language.
- **W-S spikes (propose-first, 30-60 min each)**: (1) abstracts-of-bids access probe;
  (2) PCAB AMO join feasibility (pcab_ingest.py exists). Report findings, build nothing.
- **W-D alerts (cheap, if budget allows)**: saved-filter → daily Telegram digest via the
  existing bot. Gate: one real digest delivered.
- **W-E ops**: nightly cron for daily.sh + bundle refresh + deploy (or volume-mounted
  corpus swap) so prod data is ≤24h stale without manual runs. Measured: 10 min, ₱9/run.

## Gates & stop conditions
Per-wave gates above + all existing suites stay green + P0 live drive per deploy.
Stop: all waves green OR $30 total cap OR blocked gate → stop+report (Telegram).
