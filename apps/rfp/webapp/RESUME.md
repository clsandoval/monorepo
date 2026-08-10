# RFP Finder webapp — where things stand

**Live:** https://rfp-finder-ph.fly.dev · branch `rfp-webapp` · spend ledger `spend-ledger.json` ($30 cap)

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
