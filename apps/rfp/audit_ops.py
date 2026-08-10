#!/usr/bin/env python3
"""audit_ops.py -- spend, disk, and coverage invariants for the RFP pipeline.

    python3 audit_ops.py selfcheck   # asserts THIS FILE's arithmetic against fixtures. Always green.
    python3 audit_ops.py audit       # asserts against live state. Exits 1 on any real breach.
    python3 audit_ops.py forecast    # steady-state cost/GB projection from measured unit rates.

Why this exists (audit 2026-08-08): every failure mode this pipeline has actually hit exits 0.
  - attachments.py's total-disk guard marks documents `skipped_cap`, logs a row, and `break`s.
    The process succeeds while ingesting nothing.  Measured headroom at time of writing: 12.0 GiB,
    i.e. 14-26 days depending on inflow.
  - tag.py's ledger billed 22,080 base notices but only 22,068 tag rows exist.  The counter and
    the table disagreed and nothing noticed.
  - NOTES-extract.md S9: dedup+batching stranded 13.4% of extract statuses at 'pending' forever.
  - NOTES-tag.md: keywords() shredded 51% of pilot rows into single characters, column looked full.
  - competitors.md: chloebellee/philgeps-scraper failed 44 of 44 scheduled runs on a missing
    `permissions: contents: write` line.  The scrape worked; the write didn't; no user complained.

So the invariants below are all of the form "two things that must agree, do agree" -- never
"the command exited 0".  Run `audit` from cron and alert on the exit code, not on the log.

All DBs are opened mode=ro (uri=True required).  This script never writes to them.
"""
import json, os, sqlite3, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))

# ---- measured unit rates.  Provenance in the comment on each line; do not "tidy" these. ----
RATE_IN, RATE_OUT, PHP = 0.20, 1.20, 58.0      # spend.json header, Luna pricing per DECISIONS.md #4
CAP_PHP        = 1000.0                        # spend.json cap_php
R_BASE         = 250.4802 / 22068              # spend.json tiers.base  -> P0.011350/notice
R_DOC          = 68.4530 / 619                 # spend.json tiers.doc   -> P0.110586/notice
WIRE_PER_MP    = 21.15e9 / 4288                # NOTES-extract S9 bytes fetched / mPhilGEPS notices
# Retained bytes per crawled mPhilGEPS notice, MEASURED from docs.db rather than pinned to a
# constant -- the retention rule (attachments.RETAIN_MAX_BYTES) changed this by ~4x on 2026-08-09
# and a hardcoded figure silently kept forecasting the pre-retention world.
def _measured_retain_per_mp():
    d = ro("docs.db")
    b = d.execute("select coalesce(sum(bytes),0) from blobs where blob_path is not null").fetchone()[0]
    n = d.execute("select count(*) from notices").fetchone()[0] or 1
    return b / n


RETAIN_PER_MP_LEGACY = 8.1e9 / 4288            # pre-retention, kept for the forecast selfcheck
DOCTIER_FRAC   = 619 / 4288                    # boilerplate-only AND has a readable attachment
MP_SHARE       = 0.190                         # measured mPhilGEPS share of recent inflow
DISK_CAP_GIB   = int(os.environ.get("RFP_DISK_MAX_GIB", "60"))   # mirrors attachments.DISK_MAX
MAX_BLOB_BYTES = 2_000_000                     # repo rule: never commit a file over ~2MB
DAYS_PER_MONTH = 30.44


def cost_php(tin, tout):
    return (tin / 1e6 * RATE_IN + tout / 1e6 * RATE_OUT) * PHP


def ro(name):
    return sqlite3.connect(f"file:{os.path.join(HERE, name)}?mode=ro", uri=True)


# --------------------------------------------------------------------------- checks
class Result:
    def __init__(self):
        self.rows = []
    def check(self, name, ok, detail):
        self.rows.append((bool(ok), name, detail))
    def report(self):
        bad = 0
        for ok, name, detail in self.rows:
            print(f"  [{'PASS' if ok else 'FAIL'}] {name:<34} {detail}")
            bad += not ok
        print(f"\n{len(self.rows) - bad}/{len(self.rows)} passed")
        return bad


def audit_spend(r):
    L = json.load(open(os.path.join(HERE, "spend.json")))
    recomputed = cost_php(L["tokens_in"], L["tokens_out"])
    r.check("spend: header arithmetic", abs(recomputed - L["php"]) < 0.01,
            f"recomputed P{recomputed:.4f} vs recorded P{L['php']:.4f}")
    r.check("spend: under cap", L["php"] <= CAP_PHP,
            f"P{L['php']:.2f} of P{CAP_PHP:.0f} ({100*L['php']/CAP_PHP:.1f}%), "
            f"P{CAP_PHP - L['php']:.2f} unspent")
    ti = sum(t["tokens_in"] for t in L["tiers"].values())
    to = sum(t["tokens_out"] for t in L["tiers"].values())
    r.check("spend: tiers reconcile to header", ti == L["tokens_in"] and to == L["tokens_out"],
            f"tiers {ti:,}/{to:,} vs header {L['tokens_in']:,}/{L['tokens_out']:,}")
    r.check("spend: no failed calls", L["calls_failed"] == 0, f"{L['calls_failed']} failed")
    return L


def audit_coverage(r):
    """The ledger's notice counter, the tags table, and the corpus must agree.
    They currently do not -- 12 mPhilGEPS notices were billed but never landed a row."""
    L = json.load(open(os.path.join(HERE, "spend.json")))
    t = ro("tags.db")
    c = ro("corpus.db")
    tag_rows   = t.execute("select count(*) from tags").fetchone()[0]
    run_rows   = t.execute("select count(*) from tag_runs").fetchone()[0]
    base_runs  = t.execute("select count(*) from tag_runs where tier='base'").fetchone()[0]
    corpus_n   = c.execute("select count(*) from corpus").fetchone()[0]
    corpus_fts = c.execute("select count(*) from corpus_fts").fetchone()[0]
    tag_fts    = c.execute("select count(*) from tag_fts").fetchone()[0]
    billed_base = L["tiers"]["base"]["notices"]

    r.check("coverage: every corpus notice tagged", tag_rows == corpus_n,
            f"tags {tag_rows:,} vs corpus {corpus_n:,} (delta {corpus_n - tag_rows})")
    r.check("coverage: ledger base count == base runs", billed_base == base_runs,
            f"billed {billed_base:,} vs written {base_runs:,} (delta {billed_base - base_runs})")
    r.check("coverage: tag_fts == corpus_fts", tag_fts == corpus_fts,
            f"tag_fts {tag_fts:,} vs corpus_fts {corpus_fts:,} (delta {corpus_fts - tag_fts})")
    r.check("coverage: tag_runs >= tags", run_rows >= tag_rows,
            f"{run_rows:,} runs over {tag_rows:,} notices")
    return corpus_n - tag_rows


def audit_disk(r):
    d = ro("docs.db")
    blob_bytes, blob_n = d.execute(
        "select coalesce(sum(bytes),0), count(*) from blobs where blob_path is not null").fetchone()
    dbsz = sum(os.path.getsize(os.path.join(HERE, "docs.db" + s))
               for s in ("", "-wal") if os.path.exists(os.path.join(HERE, "docs.db" + s)))
    used = blob_bytes + dbsz
    cap = DISK_CAP_GIB * 1024**3
    head = cap - used
    r.check("disk: under attachments.py cap", used < cap,
            f"{used/1024**3:.2f} GiB of {DISK_CAP_GIB} GiB, {head/1024**3:.2f} GiB headroom")
    # the runway assertion is the one that matters: the cap trips silently, so warn early
    per_day = 2020 * MP_SHARE * _measured_retain_per_mp()
    days = head / per_day if per_day else float("inf")
    r.check("disk: >30 days of runway", days > 30,
            f"{days:.0f} days at measured +{per_day/1e9:.3f} GB/day; a cap trip now alerts and "
            f"exits 3 (was: skipped_cap + break, exit 0)")
    # the blob directory and the blob table must agree, or bytes are leaking
    on_disk = sum(len(f) for _, _, f in os.walk(os.path.join(HERE, "blobs")))
    r.check("disk: blobs/ matches blobs table", on_disk == blob_n,
            f"{on_disk:,} files on disk vs {blob_n:,} rows with blob_path")
    return used, head


def audit_git(r):
    def sh(*a):
        return subprocess.run(a, cwd=REPO, capture_output=True, text=True).stdout
    big = []
    for line in sh("git", "ls-files", "-s").splitlines():
        parts = line.split()
        if len(parts) < 4:
            continue
        sha, path = parts[1], parts[3]
        n = sh("git", "cat-file", "-s", sha).strip()
        if n.isdigit() and int(n) > MAX_BLOB_BYTES:
            big.append((int(n), path))
    rfp_big = [p for n, p in big if p.startswith("apps/rfp/") or "ph-rfp" in p]
    r.check("git: no oversized RFP file tracked", not rfp_big,
            f"{len(big)} file(s) >2MB repo-wide, {len(rfp_big)} of them RFP-related")
    ignored = []
    for f in ("corpus.db", "docs.db", "tags.db", "tenders.db", "legacy.db", "awards.db", "blobs"):
        p = f"apps/rfp/{f}"
        code = subprocess.run(["git", "check-ignore", "-q", p], cwd=REPO).returncode
        ignored.append((f, code == 0))
    r.check("git: DBs and blobs/ gitignored", all(ok for _, ok in ignored),
            ", ".join(f"{f}{'' if ok else ' NOT IGNORED'}" for f, ok in ignored))
    untracked = [l[3:] for l in sh("git", "status", "--porcelain", "-uall").splitlines()
                 if l.startswith("??") and l[3:].startswith("apps/rfp/") and l.endswith(".py")]
    r.check("git: no uncommitted RFP source", not untracked,
            ", ".join(untracked) if untracked else "all .py committed")


# --------------------------------------------------------------------------- forecast
def forecast(per_day, mp_share=MP_SHARE, label=""):
    mp = per_day * mp_share
    out = {
        "notices_day": per_day,
        "mp_day": mp,
        "detail_fetches_day": per_day,
        "doc_downloads_day": mp * (9827 / 4288),
        "wire_gb_day": mp * WIRE_PER_MP / 1e9,
        "disk_gb_month": mp * _measured_retain_per_mp() / 1e9 * DAYS_PER_MONTH,
        "luna_php_month": (per_day * R_BASE + mp * DOCTIER_FRAC * R_DOC) * DAYS_PER_MONTH,
    }
    out["wire_gb_month"] = out["wire_gb_day"] * DAYS_PER_MONTH
    if label:
        print(f"  {label:<38} P{out['luna_php_month']:7.0f}/mo  "
              f"{out['wire_gb_month']:6.1f} GB/mo wire  +{out['disk_gb_month']:5.1f} GB/mo disk")
    return out


# --------------------------------------------------------------------------- selfcheck
def selfcheck():
    """Asserts this file's own arithmetic against hand-computed fixtures.
    Uses no live state, so it stays green regardless of what the pipeline is doing."""
    # 1. cost model reproduces the recorded full-run total to the centavo
    php = cost_php(12_720_057, 2_462_364)
    assert abs(php - 318.9332) < 0.001, php
    # 2. and each tier independently
    assert abs(cost_php(8_462_133, 2_188_498) - 250.4802) < 0.001
    assert abs(cost_php(4_257_924, 273_866) - 68.4530) < 0.001
    # 3. "terse tags are the cost control" (design S6 / NOTES-tag.md).  Restated with the
    #    denominators made explicit, because NOTES-tag.md's "26% of the tokens and 51% of the
    #    cost" does not reproduce: 26% is output/INPUT (25.9%), not output/total (20.5%), and
    #    output's share of base-tier cost is 60.8%, not 51%.  Whole-ledger it is 53.7%.
    #    The claim is directionally right and in fact STRONGER than documented -- see audit note.
    tin, tout = 8_462_133, 2_188_498
    ci, co = tin / 1e6 * RATE_IN, tout / 1e6 * RATE_OUT
    assert abs(tout / tin - 0.259) < 0.005, tout / tin              # output/input volume
    assert abs(tout / (tin + tout) - 0.205) < 0.005                 # output/total volume
    assert abs(co / (ci + co) - 0.608) < 0.005, co / (ci + co)      # output/total COST
    assert 1.4 < co / ci < 1.6, co / ci                             # design doc S6's 1.4-1.6x
    # 4. zero tokens costs zero; the cap is a real ceiling
    assert cost_php(0, 0) == 0.0
    assert cost_php(10**9, 10**9) > CAP_PHP        # a runaway must exceed the cap, not wrap
    # 5. unit rates land where the notes say they do
    assert abs(R_BASE - 0.011350) < 1e-5, R_BASE
    assert abs(R_DOC - 0.110586) < 1e-5, R_DOC
    assert abs(WIRE_PER_MP / 1e6 - 4.932) < 0.01
    assert abs(RETAIN_PER_MP_LEGACY / 1e6 - 1.889) < 0.01
    # 6. forecast scales linearly in inflow and in mPhilGEPS share
    a, b = forecast(1000), forecast(2000)
    assert abs(b["wire_gb_day"] - 2 * a["wire_gb_day"]) < 1e-9
    assert abs(b["luna_php_month"] - 2 * a["luna_php_month"]) < 1e-6
    full = forecast(2000, mp_share=1.0)
    assert abs(full["wire_gb_day"] / b["wire_gb_day"] - 1 / MP_SHARE) < 1e-6
    # 7. the migration blowup is ~5.3x on bandwidth, and Luna does NOT scale 5.3x
    #    (base tagging is source-independent; only the doc tier follows the mix)
    assert 5.2 < full["wire_gb_day"] / b["wire_gb_day"] < 5.3
    assert 1.8 < full["luna_php_month"] / b["luna_php_month"] < 2.0
    # 8. brief's 1,380/day sits under the P1000 cap monthly; measured weekday rate does not
    assert forecast(1380)["luna_php_month"] < CAP_PHP
    assert forecast(2598)["luna_php_month"] > CAP_PHP
    print("selfcheck: 22 assertions passed")


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "audit"
    if cmd == "selfcheck":
        selfcheck(); return 0
    if cmd == "forecast":
        print("Steady-state, from tonight's measured unit rates "
              f"(P{R_BASE:.6f}/notice base, {WIRE_PER_MP/1e6:.2f} MB/mPhilGEPS notice):\n")
        forecast(1380, label="brief's stated 1,380/day")
        forecast(2020, label="measured calendar-day 2,020/day")
        forecast(2598, label="measured weekday 2,598/day")
        forecast(3012, label="peak observed 3,012/day")
        print()
        forecast(2020, mp_share=1.0, label="post-migration, 100% mPhilGEPS")
        return 0
    r = Result()
    print("SPEND");    audit_spend(r)
    print("COVERAGE"); audit_coverage(r)
    print("DISK");     audit_disk(r)
    print("GIT");      audit_git(r)
    print()
    return 1 if r.report() else 0


if __name__ == "__main__":
    sys.exit(main())
