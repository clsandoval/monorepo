# M5 "The Map" — session handoff (2026-08-10 ~04:00 UTC)

Fresh-session pickup doc. Older context: `RESUME.md` (M1–M4, all shipped + live),
`BUILD-SPEC.md` (the contract — M5 section governs), `.claude/skills/e2e-loop/SKILL.md`
(the working method). Branch `rfp-webapp`, everything below is committed + pushed
through `dd6fa2d26`. Live app: https://rfp-finder-ph.fly.dev (M4.2 build — M5 NOT deployed yet).

## Where M5 stands

| Wave | State |
|---|---|
| W-A awards backfill | **DONE.** Detached overnight run self-stops ~09:24 UTC; nightly 900s step in daily.sh. |
| W-B/C supplier + entity pages | **SHIPPED LIVE + P0 passed** (2 real bugs caught on prod: pre-migration bundle db, ISO dates). |
| BetterGov import | **SHIPPED LIVE.** 5.08M awards (2013-2025) in awards.db; share bars/12-mo spend/buyer names real. See RESUME.md. |
| W-S spikes (abstracts access, PCAB AMO join) | not started — NEXT |
| PERF pass (Carlos 2026-08-10) | not started. Pages are slow: python spawn per SSR request over the 2.1GB db + scale-to-zero cold starts. Plan: precompute supplier/entity stats tables at bundle time, cache/ISR on dossier pages, resident query worker, min_machines_running=1. Also a responsiveness pass. |
| AI-mode attach bar | #id references + autocomplete SHIPPED; the fuller attach/reference bar beside messages is specced-by-voice-note only. |
| W-D Telegram alerts | not started |
| W-E nightly cron | **DONE.** daily.sh step 7 bundle_deploy + crontab 0 19 UTC + TG ping. First full run tonight — check nightly.log. |
| W-F knowledge-graph UI | specced (BUILD-SPEC), unblocked |

## RUNNING PROCESS (do not orphan-kill — see e2e-loop skill hard rules)
Detached award backfill: `python3 awards.py backfill --budget-seconds 21600`, started
03:24 UTC → self-stops ~09:24 UTC. Log: session scratchpad `backfill-overnight.log`.
Check progress: `sqlite3 apps/rfp/awards.db 'select count(*) from awards'` (~2.7K at
03:55, target ~15K). Restart anytime with the same command — the cursor resumes.
`pgrep -af "awards.py backfill"` before relaunching anything that touches awards.db.

## Immediate next steps (in order)
1. `cd apps/rfp/webapp/web && bunx playwright test` (fresh server, port free first:
   `kill -9 $(ss -ltnp | grep 3980 | grep -oP 'pid=\K[0-9]+')`; rm -rf .sessions-e2e).
   Expect 31 tests, 1 skip-guarded (share bars — activates when awards↔corpus joins exist).
2. Deploy: `fly deploy --remote-only --strategy immediate` from webapp/web (bundle already
   holds fresh corpus + map_query.py). Live P0: drive /supplier/... and /entity/... on prod,
   screenshot, send via `../qa-tg.sh`, update gate-results.json + spend-ledger.json + RESUME.md.
3. **BetterGov import (NEW, from the team brief — biggest data unlock):** 5.5M historical
   award records, public-domain download w/ open-source code. Bulk-import into awards.db
   (map columns onto the existing schema; keep `source` distinct e.g. 'bettergov'; winner_norm
   migration runs idempotently). This dwarfs the API backfill for history; the API sweep
   remains the freshness path. THEN: supplier profiles are day-one rich, share-bars test
   un-skips, contestability gets real denominators.
4. W-S spikes → W-D alerts → W-E cron → W-F graph (specs in BUILD-SPEC).

## Verifier findings already fixed this session (do not re-break)
- `map_query.py` LIMITED modes now include bare "small value procurement" (mPhilGEPS form);
  evidence lines were factually false before ("SLSU 0% vs 87% actual"). Bundle copy synced.
- `winPct()` in `web/src/lib/notice.ts` — band-safe %-formatter (0.995 and ≥0.9995 used to
  render "100%"). Used by notice + supplier pages. Unit bands in detail-unit.ts.

## Known minor follow-ups (from pages-track verifier, non-blocking)
- Entity "n of TOTAL" denominator sums only returned top-10 winners — add `award_count` to
  map_query entity JSON for exactness.
- Supplier `entities` chips lack a kind flag; buyers only seen past win #50 render unlinked
  (safe direction).
- Real firms named "SHELL ..." exist — the banned-terms gate polices GENERATED language only;
  verbatim data echoes are exempt by design.

## Budget
`spend-ledger.json`: $10.00 through M4.2. M5 workflows so far ≈ $6 est high-side (W-A
workflow interrupted mid-run ~230K tokens + W-B/C 397K + this orchestration) — ledger entry
pending; add with next deploy commit. Cap $30 total (Carlos authorized the remaining ~$20
for M5). Luna spend in M5 ≈ $0.01.

## Team-brief alignment (Carlos pasted the full brief 2026-08-10)
Tonight's build = brief features 1 (supplier profiles), 2 (feed — partial, W-B scope),
3 (dossiers v0), 4 (winnability = contestability v0); W-S spikes = features 5/6 groundwork;
enrich + `apps/rfp/brief.py` (2-page firm PDFs, already exists!) = feature 7's embryo;
W-D = feature 8. Brief's libel section == the evidence-only gate (BUILD-SPEC M5).
Deltas adopted: BetterGov import (step 3 above). Noted, not yet planned: officials/election
layer (FOI mayors/governors directory), NPC checklist (officials' official info only —
current contacts feature already complies), PS-DBM blessing email (Carlos-level decision),
standard anti-corruption indicator formulas for the score (adopt when abstracts land:
single-bidder rate needs them). Their "sample dossier for the field trip" next step maps
exactly onto /e2e-loop + brief.py — good first ask for a fresh session.
