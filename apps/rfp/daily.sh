#!/usr/bin/env bash
# One day's ingest. Run from anywhere; safe to re-run; safe to interrupt.
#
#   ./daily.sh              full run
#   ./daily.sh --no-docs    skip attachments (the slow, disk-hungry stage)
#   ./daily.sh --no-tag     skip Luna (skip when you don't want to spend)
#
# THERE IS NO EXPIRY STEP. `corpus_state` is a view that computes state from closing_at against
# `datetime('now','+8 hours')` (Manila), so notices expire on their own the moment their deadline
# passes. Nothing is ever deleted: an expired notice stays queryable, which is what makes
# "what closed last week and who won it" answerable later. Filter with `where state='open'`.
#
# Exit codes: 0 all good · 3 a guardrail stopped work (disk cap) · anything else, a stage failed.
set -uo pipefail
cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:$HOME/.fly/bin:$PATH"
C="$PWD"; while [ "$C" != "/" ]; do [ -f "$C/.env" ] && set -a && . "$C/.env" && set +a && break; C="$(dirname "$C")"; done

DOCS=1; TAG=1
for a in "$@"; do case "$a" in --no-docs) DOCS=0;; --no-tag) TAG=0;; esac; done

rc=0
step() {                       # step <name> <cmd...>
  local name="$1"; shift
  echo; echo "=== $name  $(date -u +%H:%M:%SZ)"
  # Capture the status DIRECTLY. Both `if ! cmd; then local code=$?` and `local code=$?` report 0
  # on failure -- `!` resets $?, and `local` is itself a command that overwrites it. That bug made
  # this runner print "exited 0" for a stage that had just crashed, which is precisely the
  # silent-success failure the rest of this pipeline exists to refuse.
  local code=0
  "$@" || code=$?
  if [ "$code" -ne 0 ]; then
    echo "!!! $name exited $code" >&2
    # 3 is a deliberate guardrail trip (already alerted); anything else is a real failure
    if [ "$code" -eq 3 ]; then rc=3; else rc=$code; fi
  fi
}

# 1. New notices. Both are incremental: they stop at the last id already stored.
step "mPhilGEPS listing + detail" python3 ingest.py
step "legacy listing + detail"    python3 ingest_legacy.py

# 2. Rebuild the search corpus from both DBs. Cheap, and it re-derives FTS + provinces.
step "merge -> corpus.db + FTS"   python3 merge.py build
step "tag index (tag_fts)"        python3 rfp reindex

# 3. Attachments (mPhilGEPS only; legacy is auth-gated). Exits 3 if the disk cap trips.
[ "$DOCS" = 1 ] && step "attachments"    python3 attachments.py run
[ "$DOCS" = 1 ] && step "retention sweep" python3 attachments.py retain

# 4. Tag only what is untagged. Resumable, and it refuses to breach the peso cap in spend.json.
[ "$TAG" = 1 ] && step "luna tags"       python3 tag.py base all

# 5. Health. This is the part that makes a silent failure loud -- read it, don't skip it.
step "ops audit" python3 audit_ops.py

# 6. Award backfill (M5 W-A): sweep the legacy awardID space newest-first, 15 min/night,
#    resuming from its own cursor in awards.db. Best-effort BY DESIGN: the host 403s under
#    pressure and the sweep loses nothing by stopping early, so the `|| true` swallows any
#    failure -- an award-side hiccup must never mark the whole nightly ingest red.
step "awards backfill" sh -c 'python3 awards.py backfill --budget-seconds 900 || true'

# 7. Ship fresh data to prod (M5 W-E). The bundle is fully derived here every night:
#    dbs via `.backup` (consistent even if a stray writer is up — a plain cp of a
#    mid-write sqlite file shipped a corrupt awards.db once conceptually, don't risk it)
#    and the python/CLI helpers copied from this directory, so a code change here
#    reaches prod on the next nightly without a manual bundle step.
bundle_deploy() {
  local W=webapp/web/rfp-bundle
  sqlite3 corpus.db ".backup '$W/corpus.db'" || return 1
  sqlite3 tags.db   ".backup '$W/tags.db'"   || return 1
  sqlite3 awards.db ".backup '$W/awards.db'" || return 1
  cp -f map_query.py awards_similar.py enrich_fetch.py extract_lib.py rfp profile.md "$W/" || return 1
  (cd webapp/web && fly deploy --remote-only --strategy immediate)
}
step "bundle + deploy" bundle_deploy

echo; echo "=== summary  $(date -u +%H:%M:%SZ)"
python3 - <<'PY'
import sqlite3
c = sqlite3.connect("file:corpus.db?mode=ro", uri=True)
q = lambda s: c.execute(s).fetchone()[0]
print(f"  corpus         {q('select count(*) from corpus'):,}")
for state, n in c.execute("select state, count(*) from corpus_state group by 1 order by 2 desc"):
    print(f"    {state:<12} {n:,}")
closing = "select count(*) from corpus where date(closing_at) = date('now','+8 hours')"
seen = "select count(*) from corpus where date(seen_at) = date('now')"
print(f"  closing today  {q(closing):,}")
print(f"  seen today     {q(seen):,}")
PY

# One line to Telegram so a silent cron death is visible by its absence and a red
# run is visible by its content. Never fails the run itself.
open_n=$(sqlite3 "file:corpus.db?mode=ro" "select count(*) from corpus_state where state='open'" 2>/dev/null || echo "?")
aw_n=$(sqlite3 "file:awards.db?mode=ro" "select count(*) from awards" 2>/dev/null || echo "?")
webapp/qa-tg.sh "rfp nightly: rc=$rc · $open_n open notices · $aw_n awards · deployed $(date -u +%H:%MZ)" || true

exit $rc
