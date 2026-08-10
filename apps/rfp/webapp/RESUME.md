# RFP Finder webapp — where things stand

**Live:** https://rfp-finder-ph.fly.dev · branch `rfp-webapp` · spend ledger `spend-ledger.json` ($30 cap)

## M5 W-B/C (2026-08-10 ~04:00 UTC) — supplier profiles + entity dossiers, shipped LIVE

- **`/supplier/[slug]` SSR**: winner_norm-keyed profile — total won, contracts, awarding
  entities, median % of budget (band-safe `winPct()`), recent wins w/ % of budget, category +
  buyer chips. **`/entity/[slug]` SSR**: procuring-entity dossier — contestability signals
  (evidence-only vocabulary, every line carries digits), winner share bars (activate as
  awards↔corpus joins land), open notices, BAC contact.
- Suite: 31 tests (30 pass, 1 skip-guarded on share bars). Slugs picked at RUNTIME from the db.
- **Live P0 caught a real red**: first deploy's bundle awards.db predated the winner_norm
  migration → supplier pages 500'd on prod while local e2e was green (local db ≠ bundle db).
  Fixed with `sqlite3 .backup` snapshot of the migrated db + redeploy. **Deploy rule: refresh
  bundle awards.db from apps/rfp/awards.db at every deploy** (it's live-backfilled).
- W-A backfill running detached through ~09:24 UTC (resumable; `pgrep -af "awards.py backfill"`
  before touching awards.db).

## M5 BetterGov import (2026-08-10 ~04:30 UTC) — 5.08M historical awards, shipped LIVE

- `bettergov_import.py`: streams `bettergov/philgeps.parquet` (CC0,
  huggingface.co/datasets/bettergovph/philgeps-data, 2013–2025) into awards.db as
  `source='bettergov'` — full-row DISTINCT (the dump explodes an award into identical
  per-line-item rows; summing them fabricates supplier totals), future-dated typo rows
  dropped, winner_norm at insert. Re-runnable (wipes + re-imports its source).
- Entity dossiers join `buyer_org = agency` (bettergov records procuring entities verbatim,
  exact-match vs corpus agency strings) → real share bars, exact `award_count` denominators,
  real top_share/price signals. Supplier buyer chips show real entity names. Historic
  ref_ids never render as in-app /notice links (would 404).
- awards.db now 2.1GB / 5.08M rows; bundle ships it whole. `suppliers` index is SQL,
  capped 500. Entity worst case (CITY OF QUEZON, 23.7K awards) = 1.4s warm on prod;
  map.ts exec timeout 30s because a cold cache after machine swap can exceed 15s.
- **Deploy rule** (also above): refresh `rfp-bundle/awards.db` via `sqlite3 .backup` from
  apps/rfp/awards.db at every deploy — and re-run `bunx playwright test` after any db swap.
- Suite: 31/31 green — share-bars test un-skipped itself with the real data.
## M5 W-E nightly ops (2026-08-10) — daily ingest hooked up for everything

- `daily.sh` step 7 `bundle_deploy`: snapshots corpus/tags/awards dbs via `sqlite3 .backup`
  into `webapp/web/rfp-bundle/`, copies the python/CLI helpers (bundle is fully derived
  nightly — code changes in apps/rfp reach prod without a manual bundle step), then
  `fly deploy --remote-only --strategy immediate`. A deploy failure marks the run red.
- End-of-run Telegram one-liner (rc + open notices + award count) via `webapp/qa-tg.sh` —
  a silent cron death is visible by absence, a red run by content.
- Crontab: `0 19 * * *` (03:00 Manila) → `daily.sh >> nightly.log`. fly CLI on PATH inside
  the script; auth from ~/.fly. NOTE: nightly swaps data without re-running playwright —
  known ceiling; the suite runs on this machine whenever code changes ship.
- Next per HANDOFF.md: W-S spikes (abstracts, PCAB), W-D Telegram alerts, W-F graph UI.

## M4 (2026-08-09 evening) — notice detail + enrich, shipped

Derived from a contractor walk of the live site ("what stops me from hitting submit?").

- **`/notice/[id]` SSR** (the SEO wedge): huge ABC, countdown, scope, **BOQ table** parsed from
  the description behind an 8-guard reject-when-unsure gate (wrong-but-confident quantities are
  worse than prose — guards tuned empirically on 300-notice scans; 8 measured garbage shapes
  reject in `qa/detail-unit.ts`), statutory requirements checklist by mode (static table, never
  the model), **similar recent awards** (awards.db; ABC 0.3–3× hard filter, province-ranked,
  winner + "won at N% of budget"), contact card, "Open on PhilGEPS to bid ↗" CTA.
- **Enrich** (`POST /api/notice/[id]/enrich`): `enrich_fetch.py` live-fetches the notice page
  (both systems), downloads + pdftotext/OCRs mPhilGEPS attachments (poppler+tesseract in the
  image) → one Luna pass under **quotes-or-omits + mechanical substring verification** (0
  fabricated quotes across adversarial re-checks) → deliverables/qualifications/key dates/bid
  security/red flags, cached at `/data/enrich`. Legacy = honest "from notice text" variant
  (attachments login-gated). ~$0.004/enrich.
- Rows/cards link in-app; ↗ affordance keeps the PhilGEPS deep link. ← Results restores rows +
  scroll via sessionStorage (bfcache-independent, non-vacuous E2E test).

## M3 (2026-08-09 overnight) — results-first UI, shipped

Google-pegged restructure per Carlos's directive: the default surface is a **long scrolling
results list**, chat is an **AI Mode tab**.

- **Landing = the board**: open notices, closing-soonest, pure SQL, ₱0. Search box on top.
- **Search = one Luna plan-call** (`/api/search`): freeform words → `SearchPlan` (terms/province/
  abc band/days) → proven `rfp search --json --no-profile` executes → ranked rows, stateless
  pagination (client echoes plan+offset). Greeting/gibberish → board fallback. ~$0.0002/search.
  In-province rows partitioned first (the 200-row over-fetch blows the CLI's null-location quota
  — see search.ts comment).
- **AI Mode tab** = the M2 chat (sessions, streaming, present-tool cards) unchanged, seeded with
  the current query (prefill, never auto-send). Both panes stay mounted; state survives tabs.
- **Style 11 "signal blue"** applied: `bidkita` wordmark, `#1550D8` as `--primary`/`--ring`
  (the ONLY hue — swap this one token to flip red), blue header rule / active tab / urgent
  (≤4d) chips / search button. Visual gate asserts blue-family-only saturated colors.

Gates (all green, `gate-results.json`): search-eval 7/7 · units 19+28 · chat eval 8/8 ·
E2E 16/16 (re-run on the blue build) · palette gate · tsc/eslint/build.

## Files
`web/src/lib/search.ts` + `web/src/app/api/search/route.ts` (plan+execute) ·
`web/src/lib/search-types.ts` (frozen contract) · `web/src/components/search-shell.tsx`
(header/tabs/board) · `result-row.tsx` · `workspace.tsx` (AI pane) ·
QA: `web/qa/search-eval.ts`, `web/qa/e2e/results.spec.ts`, `web/qa/record-live.ts` (new flow) ·
`qa-tg.sh` (Telegram send).

## Known ceilings
- Results list caps at top-200 ranked hits per plan (end line says so; refine or AI Mode).
- Corpus ships in the image (`web/rfp-bundle/`, built 2026-08-09 14:24); nightly ingest does NOT
  update prod — redeploy or wire the volume to refresh data.
- `docs.db` (attachment FTS) not in the bundle; CLI degrades gracefully.
