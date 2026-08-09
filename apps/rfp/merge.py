#!/usr/bin/env python3
"""merge.py — build corpus.db (the single read surface) from tenders.db + legacy.db.

    python3 merge.py build [--out corpus.db] [--ref YYYY-MM-DD]
    python3 merge.py stats [--db corpus.db] [--ref YYYY-MM-DD]
    python3 merge.py demo  [--db corpus.db] [--ref YYYY-MM-DD]
    python3 merge.py test                      # assert-based selfcheck, no DB needed

Inputs are opened READ-ONLY (`file:...?mode=ro`, uri=True) and never written. Output is
rebuilt from scratch every time, so there is no incremental-merge state to corrupt and no
FTS trigger machinery: re-run `build` after a re-scrape.

Design: docs/plans/2026-08-08-ph-rfp-search-design.md (§Architecture, §Operational
correctness). Decisions taken here that the design left to the implementor:

* **Row identity.** The two ingests both use `id integer primary key` from their own site
  (mPhilGEPS notice id 2208–55594, legacy refID 12535432–13184679). Measured: zero overlap.
  `corpus` therefore keeps the native `id` so `rfp show 55912` works, but the primary key is
  a separate stable `nid` (needed as FTS `content_rowid` — a plain rowid can be renumbered
  by VACUUM). `unique(source,id)` plus `unique(id)` means a future cross-system id collision
  aborts the build loudly instead of silently double-counting; `notice_key` ('legacy:12535432')
  is the citable form.
* **Nothing is dropped and nothing is deleted.** Every column of both inputs appears in
  `corpus` (verified against sqlite_master at build time — an unmapped source column is a
  hard error). The 12 mPhilGEPS zombie notices (permanent HTTP 500s, `enriched_at is null`,
  no closing date) are kept and flagged, not filtered.
* **`mode_norm` is a plain column here.** It is GENERATED in ingest.py and plain in
  ingest_legacy.py; a generated column cannot be inserted into, so corpus stores it and the
  build asserts `mode_norm == lower(trim(mode))` on both sides. Legal modes stay distinct
  strings ('public bidding' != 'competitive bidding'), only casing collapses.
* **Timestamps.** `closing_at` / `publish_at` / `updated_at` are normalised to exactly
  'YYYY-MM-DDTHH:MM:SS' so string and julianday comparisons work across sources — mPhilGEPS
  stores minute precision (16 chars) and legacy second precision (19), which would never
  compare equal. Date-only values become T00:00:00 (legacy already did this to `publish_at`).
  Raw display strings (`closing`, `publish`, `updated`, `last_updated`) are preserved as-is.
  PhilGEPS times are Asia/Manila (UTC+8, no DST); SQL that needs "now" uses
  `datetime('now','+8 hours')`, which is machine-timezone independent.
* **Expiry is a query, never a delete.** `closing_at` + generated `closing_day`, and the
  reference date is a *parameter*:

      select nid, title, abc, closing_at,
             case when closing_at is null then 'no_closing'
                  when closing_at < :ref then 'expired' else 'open' end as state,
             round(julianday(closing_at) - julianday(:ref), 2) as days_left
      from corpus where ...

  The `corpus_state` view hardcodes :ref = PH-now for convenience only; anything that cares
  (stats, search, evals over a past date) passes its own :ref. See `state_sql()`.
* **dupe_key flags, it never merges.** sha1(norm(PE)|closing_at|norm(title)[:80]|abc), the
  same function ingest_legacy.py used — the build verifies it reproduces all 17,780 stored
  legacy keys byte-for-byte. Collisions land in the `dupe_review` table. They are not
  merged, because they cannot be: nine MUNICIPALITY OF LIBON notices are all "Purchase of
  Various Goods", all P199,990, all closing 2026-08-11 10:00, and are genuinely distinct.
* **FTS5 is external-content** over `corpus` (`content='corpus', content_rowid='nid'`), so
  the text is stored once and snippet()/highlight() still work for the evidence lines in
  `rfp search`. Indexed: title, description, items_text, category, agency. `items_text` is
  `items` with the table header lines removed — all 4,288 enriched mPhilGEPS notices carry
  the literal 'Item No. / UNSPSC / Lot Name / Lot Description / Quantity / Unit of Measure',
  which otherwise matches every query. Tokenizer is porter+unicode61: recall is the metric
  that matters (design §Evaluation), so 'services' should find 'service'.
* **Location is a join table, not a LIKE.** `location` is comma-multi-valued on 103 rows
  (71 mPhilGEPS + 32 legacy) and empty on 8.8% of legacy / 12.4% of mPhilGEPS. So
  `notice_location` holds one row per (notice, location), and one row with
  `location is null` for notices that have none — nulls stay addressable by a join rather
  than being invisible to it. `location_norm` upper-cases, collapses punctuation, and
  resolves the handful of measured cross-system spelling splits (LOC_ALIAS); the raw value
  is kept alongside. Full LGU normalisation is deferred (design §Deferred #3).
* **Cross-system duplicates are real, and the content hash under-counts them.** The design
  and DECISIONS both record "zero cross-system duplicates found". Measured here: 10 pairs
  collide on the content hash across sources, and they are the same notice — description
  similarity 0.89-0.99, and mPhilGEPS `control` is legacy `solicitation_no` with the
  punctuation stripped ('ITB 26-229' -> '26229', 'PB-2026-02-INFRA' -> '202602'). They were
  invisible before because `closing_at` was 16 chars on one side and 19 on the other, so
  cross-source keys could never match; normalising the timestamps is what exposed them.
  This is exactly the PE-cutover window the design predicted, so it is a confirmation, not
  a contradiction of the model. A second, weaker signal — same agency, same digits of the
  reference number — finds **3 more** the content hash misses ('Textbooks' vs 'Texbooks';
  a legacy title prefixed with its own 'PEO-2026-052 - '; an amended closing time) and one
  false positive (two unrelated DPWH refs whose digits coincide). So `dupe_review` carries a
  `signal` column: `content_hash` (the specified key, all collisions) and `ref_no`
  (cross-source only — intra-source it degenerates, largest group 49 rows, because a PE
  reuses one reference across many postings). Still review-only. Still never merged.
* **Tag columns exist but are empty.** `rfp tag` owns them. Not backfilled from tags.db: the
  pilot's 337 rows have visibly broken keywords ('f e a s i b l t y u d h g w n r v o c' —
  letters, not words), which would poison the index. Adding keywords to FTS needs a rebuild.
"""

import hashlib
import os
import re
import sqlite3
import sys
import time
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
MPH_DB = os.path.join(HERE, "tenders.db")
LEG_DB = os.path.join(HERE, "legacy.db")
OUT_DB = os.path.join(HERE, "corpus.db")

PH_TZ = timezone(timedelta(hours=8))


def ph_today():
    return datetime.now(PH_TZ).strftime("%Y-%m-%d")


def ro(path):
    return sqlite3.connect("file:%s?mode=ro" % path, uri=True)


# --- pure helpers (all covered by selfcheck) ---------------------------------

def norm_key(s):
    """Normalisation used inside dupe_key. Must stay byte-identical to ingest_legacy.py."""
    return re.sub(r"[^A-Z0-9 ]", "", (s or "").upper())


def dupe_key(agency, closing_at, title, abc):
    parts = (norm_key(agency), closing_at or "", norm_key(title)[:80], "%.2f" % (abc or 0))
    return hashlib.sha1("|".join(parts).encode()).hexdigest()


def iso_ts(s):
    """Normalise an ingest ISO string to exactly 'YYYY-MM-DDTHH:MM:SS'.

    mPhilGEPS closing_at is 16 chars ('2026-08-09T05:00') and publish_at is 10
    ('2024-06-14'); legacy is 19 everywhere. Unequal lengths break both string comparison
    and BETWEEN, so pad. Date-only gains T00:00:00 (a fabricated time, same convention
    legacy's own publish_at already uses) — the raw display string is kept separately.
    """
    if s is None:
        return None
    s = s.strip()
    if not s:
        return None
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s):
        return s + "T00:00:00"
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}", s):
        return s.replace(" ", "T") + ":00"
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}", s):
        return s.replace(" ", "T")
    return s  # unrecognised: keep verbatim rather than invent, and let stats show it


def iso_from_display(s):
    """'05-Aug-2026 02:20 PM' -> '2026-08-05T14:20:00' (mPhilGEPS `updated`)."""
    if not s or not s.strip():
        return None
    for fmt in ("%d-%b-%Y %I:%M %p", "%d-%b-%Y %I:%M%p", "%d-%b-%Y"):
        try:
            return datetime.strptime(s.strip(), fmt).strftime("%Y-%m-%dT%H:%M:%S")
        except ValueError:
            pass
    return None


# The literal header of the mPhilGEPS line-items table. Present on 4,288 of 4,288 enriched
# notices (measured), and repeated mid-body on 1. Dropped line-wise rather than as a fixed
# prefix so the repeat is caught too. Kept deliberately narrow: 'Lot' alone is a real unit
# of measure and must survive.
ITEM_HEADER_LINES = {
    "item no.", "item no", "unspsc", "lot name", "lot description",
    "quantity", "unit of measure",
}


def strip_items_header(items):
    """Remove the items-table header lines. Returns None/'' unchanged."""
    if not items:
        return items
    keep = [ln for ln in items.split("\n")
            if ln.strip().lower().rstrip(":") not in ITEM_HEADER_LINES]
    return "\n".join(keep)


# Measured cross-system spelling splits in `location` (mPhilGEPS vs legacy vocabularies,
# 89 vs 87 distinct values). Deliberately tiny and explicit; the real LGU registry is
# deferred. Keys and values are already in normalised form.
LOC_ALIAS = {
    "DINAGAT ISLAND": "DINAGAT ISLANDS",
    "DAVAO DE ORO COMPOS VALLEY": "DAVAO DE ORO",
    "COMPOSTELA VALLEY": "DAVAO DE ORO",
    "NORTH COTABATO": "COTABATO",
    "COTABATO NORTH": "COTABATO",
    "NCR": "METRO MANILA",
}


def norm_location(s):
    if s is None:
        return None
    n = re.sub(r"[^A-Z0-9 ]", " ", s.upper())
    n = re.sub(r"\s+", " ", n).strip()
    if not n:
        return None
    return LOC_ALIAS.get(n, n)


def split_locations(loc):
    """-> [(raw, norm), ...]; always at least one row. Missing location yields (None, None)
    so a null-location notice is still reachable through the join table."""
    if loc is None or not loc.strip():
        return [(None, None)]
    out, seen = [], set()
    for part in loc.split(","):
        raw = part.strip()
        n = norm_location(raw)
        if n is None or n in seen:
            continue
        seen.add(n)
        out.append((raw, n))
    return out or [(None, None)]


def ref_digits(s):
    """Digits of a solicitation/control number, or None if too short to be a signal.

    mPhilGEPS `control` is legacy `solicitation_no` with the punctuation removed, so the
    digit string is the one field the two systems share verbatim. Runs under 5 digits are
    dropped: 476 notices carry a bare year, which would group a PE's whole year of postings.
    Measured: the >=5 threshold keeps all 12 cross-source groups that >=4 finds, and >=6
    loses one — so 5.
    """
    d = re.sub(r"\D", "", s or "")
    return d if len(d) >= 5 else None


def state_of(closing_at, ref):
    """Expiry as a function of a *reference instant*, not of today."""
    if not closing_at:
        return "no_closing"
    return "expired" if closing_at < ref else "open"


def ref_instant(ref):
    """'2026-08-08' -> '2026-08-08T00:00:00'; passes through a full timestamp."""
    return iso_ts(ref) or ref


def state_sql(ref_param=":ref"):
    """The parameterised expiry expression. Callers bind :ref; nothing hardcodes today."""
    return ("case when closing_at is null then 'no_closing' "
            "when closing_at < {r} then 'expired' else 'open' end as state, "
            "round(julianday(closing_at) - julianday({r}), 2) as days_left").format(r=ref_param)


# --- column reconciliation ---------------------------------------------------
# Explicit, so that a new column on either side is a build error, not a silent drop.

SHARED = ["title", "mode", "mode_norm", "classification", "category", "agency", "location",
          "abc", "status", "contact", "description", "publish", "closing", "publish_at",
          "closing_at", "seen_at", "enriched_at", "fetch_errors"]

MPH_ONLY = ["abc_lot_min", "abc_lot_max", "control", "funding", "lot_type", "client_agency",
            "delivery_days", "closing_detail", "updated", "downloads", "items"]

LEG_ONLY = ["solicitation_no", "trade_agreement", "delivery_period", "contact_email",
            "contact_phone", "bid_supplements", "doc_req_list", "last_updated",
            "last_updated_at"]

# Source columns consumed as identity/derived rather than copied straight across.
MPH_CONSUMED = ["id"]
LEG_CONSUMED = ["id", "source", "dupe_key"]

DERIVED = ["nid", "source", "id", "notice_key", "items_text", "updated_at", "dupe_key",
           "closing_day", "publish_day", "ref_no", "ref_digits"]

TAG_COLS = ["work_type", "needs_pcab", "eligibility", "scope", "keywords", "tag_model",
            "tagged_at"]

SCHEMA = """
create table corpus (
  nid          integer primary key,      -- stable; FTS content_rowid. Not a site id.
  source       text not null,            -- 'mphilgeps' | 'legacy'
  id           integer not null,         -- native notice id / legacy refID
  notice_key   text generated always as (source || ':' || id) virtual,

  -- shared by both systems
  title text, mode text, mode_norm text, classification text, category text,
  agency text, location text, abc real, status text, contact text, description text,
  publish text, closing text,            -- raw display strings, as scraped
  publish_at text, closing_at text,      -- normalised 'YYYY-MM-DDTHH:MM:SS'
  closing_day  text generated always as (substr(closing_at, 1, 10)) virtual,
  publish_day  text generated always as (substr(publish_at, 1, 10)) virtual,
  updated_at   text,                     -- unified freshness: mPhilGEPS `updated` parsed,
                                         -- legacy `last_updated_at`
  ref_no       text,                     -- unified reference: mPhilGEPS `control` /
                                         -- legacy `solicitation_no`, raw
  ref_digits   text,                     -- its digits (>=5), the one field both systems
                                         -- share verbatim; cross-source dupe signal
  seen_at text, enriched_at text, fetch_errors integer,

  -- mPhilGEPS only (null on legacy rows)
  abc_lot_min real, abc_lot_max real,    -- a bidder bids a lot, not a notice
  control text, funding text, lot_type text, client_agency text, delivery_days text,
  closing_detail text, updated text, downloads text,
  items text,                            -- raw, header row included
  items_text text,                       -- header stripped; this is what FTS indexes

  -- legacy only (null on mPhilGEPS rows)
  solicitation_no text, trade_agreement text, delivery_period text,
  contact_email text, contact_phone text,
  bid_supplements integer, doc_req_list integer,
  last_updated text, last_updated_at text,

  dupe_key text not null,                -- review candidate generator, never a merge key

  -- written later by `rfp tag`; empty at build time
  work_type text, needs_pcab integer, eligibility text, scope text, keywords text,
  tag_model text, tagged_at text,

  unique(source, id),
  unique(id)                             -- fails loudly if the id spaces ever collide
);

create index corpus_source     on corpus(source);
create index corpus_closing_at on corpus(closing_at);
create index corpus_abc        on corpus(abc);
create index corpus_mode_norm  on corpus(mode_norm);
create index corpus_class      on corpus(classification);
create index corpus_agency     on corpus(agency);
create index corpus_dupe       on corpus(dupe_key);
create index corpus_work_type  on corpus(work_type);
create index corpus_ref_digits on corpus(ref_digits);

create table notice_location (
  nid       integer not null references corpus(nid),
  source    text not null,
  id        integer not null,
  ord       integer not null,   -- position in the comma list; 0 for the no-location row
  location  text,               -- as scraped (trimmed); null when the notice states none
  location_norm text            -- upper/collapsed/alias-resolved; null when location null
);
create index notice_location_norm on notice_location(location_norm);
create index notice_location_nid  on notice_location(nid);

-- Review queue, never a merge. Two candidate generators, distinguished by `signal`:
--   'content_hash' = the specified sha1(norm(PE)|closing|norm(title)[:80]|abc), every collision
--   'ref_no'       = same agency + same digits of the reference number, CROSS-SOURCE ONLY
-- A human (or a later model pass) decides; nine LIBON notices prove no key can.
create table dupe_review (
  signal       text not null,
  group_key    text not null,     -- the dupe_key, or 'agency|refdigits'
  group_size   integer not null,
  cross_source integer not null,  -- 1 if the group spans mphilgeps and legacy
  nid integer not null, source text, id integer,
  agency text, title text, abc real, closing_at text, location text, ref_no text,
  primary key (signal, group_key, nid)
);
create index dupe_review_group on dupe_review(group_key);
create index dupe_review_nid on dupe_review(nid);

create table build_meta (key text primary key, value text);

-- Convenience only: :ref pinned to PH-now. Anything that cares passes its own reference
-- date (see state_sql()); expiry is a query, so nothing is ever deleted for being old.
--
-- strftime, NOT datetime, for the string comparison: `closing_at` is normalised to
-- 'YYYY-MM-DDTHH:MM:SS' but datetime() returns 'YYYY-MM-DD HH:MM:SS', and 'T' (0x54) sorts
-- above ' ' (0x20). Comparing the two forms makes every notice closing *today* read as open
-- no matter the hour, so the view leaked up to a day of expired notices while days_left --
-- which goes through julianday() and parses both forms -- correctly reported them negative.
-- days_left keeps julianday(); only the string comparison needs the separator to match.
create view corpus_state as
select nid, notice_key, source, id, title, agency, location, classification, mode_norm,
       abc, abc_lot_min, abc_lot_max, closing_at, work_type,
       case when closing_at is null then 'no_closing'
            when closing_at < strftime('%Y-%m-%dT%H:%M:%S', 'now', '+8 hours') then 'expired'
            else 'open' end as state,
       round(julianday(closing_at) - julianday('now', '+8 hours'), 2) as days_left
from corpus;
"""

FTS_SCHEMA = """
create virtual table corpus_fts using fts5(
  title, description, items_text, category, agency,
  content='corpus', content_rowid='nid',
  tokenize="porter unicode61 remove_diacritics 2"
);
"""


def src_columns(db, table="tenders"):
    # table_xinfo, not table_info: ingest.py declares mode_norm GENERATED ... VIRTUAL, and
    # table_info hides generated columns — which would read as "column absent" here.
    return [r[1] for r in db.execute("pragma table_xinfo(%s)" % table)]


def check_coverage(mph, leg):
    """An unmapped source column is a hard error — 'do not silently drop a column'."""
    mcols, lcols = set(src_columns(mph)), set(src_columns(leg))
    m_expect = set(SHARED) | set(MPH_ONLY) | set(MPH_CONSUMED)
    l_expect = set(SHARED) | set(LEG_ONLY) | set(LEG_CONSUMED)
    missing_m, missing_l = mcols - m_expect, lcols - l_expect
    if missing_m or missing_l:
        raise SystemExit("unmapped source columns — refusing to drop them: "
                         "tenders.db=%s legacy.db=%s" % (sorted(missing_m), sorted(missing_l)))
    gone_m, gone_l = m_expect - mcols, l_expect - lcols
    if gone_m or gone_l:
        raise SystemExit("mapped columns absent from source: tenders.db=%s legacy.db=%s"
                         % (sorted(gone_m), sorted(gone_l)))
    return sorted(mcols), sorted(lcols)


# --- build -------------------------------------------------------------------

INSERT_COLS = (["source", "id"] + SHARED + ["updated_at", "ref_no", "ref_digits"]
               + MPH_ONLY + ["items_text"] + LEG_ONLY + ["dupe_key"])


def build(out_path=OUT_DB, ref=None, quiet=False):
    ref = ref or ph_today()
    say = (lambda *a: None) if quiet else (lambda *a: print(*a))
    mph, leg = ro(MPH_DB), ro(LEG_DB)
    mph.row_factory = leg.row_factory = sqlite3.Row
    mcols, lcols = check_coverage(mph, leg)
    say("sources: tenders.db %d cols, legacy.db %d cols — all mapped" % (len(mcols), len(lcols)))

    for suffix in ("", "-wal", "-shm", "-journal"):
        p = out_path + suffix
        if os.path.exists(p):
            os.remove(p)
    db = sqlite3.connect(out_path)
    db.executescript(SCHEMA)

    stmt = "insert into corpus (%s) values (%s)" % (
        ",".join(INSERT_COLS), ",".join(":" + c for c in INSERT_COLS))

    counts, mode_norm_bad, legacy_key_bad = {}, 0, 0

    def emit(source, rows, extra):
        nonlocal mode_norm_bad, legacy_key_bad
        n = 0
        for r in rows:
            row = {c: None for c in INSERT_COLS}
            row["source"] = source
            row["id"] = r["id"]
            for c in SHARED:
                if c in r.keys():
                    row[c] = r[c]
            row["mode_norm"] = (r["mode"] or "").strip().lower() or None
            if "mode_norm" in r.keys() and (r["mode_norm"] or None) != row["mode_norm"]:
                mode_norm_bad += 1
            row["publish_at"] = iso_ts(r["publish_at"])
            row["closing_at"] = iso_ts(r["closing_at"])
            extra(r, row)
            row["dupe_key"] = dupe_key(row["agency"], row["closing_at"], row["title"], row["abc"])
            if source == "legacy" and row["closing_at"] == r["closing_at"] \
                    and row["dupe_key"] != r["dupe_key"]:
                legacy_key_bad += 1
            db.execute(stmt, row)
            n += 1
        counts[source] = n
        say("  %-10s %6d rows" % (source, n))

    def mph_extra(r, row):
        for c in MPH_ONLY:
            row[c] = r[c]
        row["items_text"] = strip_items_header(r["items"])
        row["updated_at"] = iso_from_display(r["updated"])
        row["ref_no"] = r["control"]
        row["ref_digits"] = ref_digits(r["control"])

    def leg_extra(r, row):
        for c in LEG_ONLY:
            row[c] = r[c]
        row["updated_at"] = iso_ts(r["last_updated_at"])
        row["ref_no"] = r["solicitation_no"]
        row["ref_digits"] = ref_digits(r["solicitation_no"])

    say("inserting:")
    emit("mphilgeps", mph.execute("select * from tenders order by id"), mph_extra)
    emit("legacy", leg.execute("select * from tenders order by id"), leg_extra)
    db.commit()

    if mode_norm_bad:
        raise SystemExit("mode_norm != lower(trim(mode)) on %d rows" % mode_norm_bad)
    if legacy_key_bad:
        raise SystemExit("dupe_key does not reproduce %d stored legacy keys" % legacy_key_bad)
    say("verified: mode_norm consistent on all rows; dupe_key reproduces every stored "
        "legacy key (%d)" % counts["legacy"])

    # location join table
    nloc = 0
    for nid, source, id_, loc in db.execute("select nid, source, id, location from corpus"):
        for i, (raw, n) in enumerate(split_locations(loc)):
            db.execute("insert into notice_location values (?,?,?,?,?,?)",
                       (nid, source, id_, i, raw, n))
            nloc += 1
    db.commit()
    say("notice_location: %d rows for %d notices" % (nloc, sum(counts.values())))

    # dupe review (flag only — never a merge), signal 1: the specified content hash
    db.execute("""
      insert into dupe_review
      select 'content_hash', c.dupe_key, g.n, g.srcs > 1, c.nid, c.source, c.id,
             c.agency, c.title, c.abc, c.closing_at, c.location, c.ref_no
      from corpus c join (select dupe_key, count(*) n, count(distinct source) srcs
                          from corpus group by dupe_key having count(*) > 1) g
        using (dupe_key)
      order by g.n desc, c.dupe_key, c.source, c.id
    """)
    # signal 2: same agency + same reference-number digits, CROSS-SOURCE ONLY. Intra-source
    # it degenerates (406 groups, largest 49 rows — one PE reference spans many postings),
    # so it is deliberately not emitted there; the content hash covers intra-source.
    groups = {}
    for nid, src, id_, ag, ti, abc, ca, loc, rn, rd in db.execute(
            """select nid, source, id, agency, title, abc, closing_at, location, ref_no,
                      ref_digits from corpus where ref_digits is not null"""):
        groups.setdefault((norm_key(ag), rd), []).append(
            (nid, src, id_, ag, ti, abc, ca, loc, rn))
    n_ref = 0
    for (ag_n, rd), members in groups.items():
        if len({m[1] for m in members}) < 2:
            continue
        for m in members:
            db.execute("insert into dupe_review values ('ref_no',?,?,1,?,?,?,?,?,?,?,?,?)",
                       (ag_n[:40] + "|" + rd, len(members)) + m)
        n_ref += 1
    db.commit()
    say("dupe_review: %d content_hash rows in %d groups; %d cross-source ref_no groups"
        % (q1(db, "select count(*) from dupe_review where signal='content_hash'"),
           q1(db, "select count(distinct group_key) from dupe_review where signal='content_hash'"),
           n_ref))

    # FTS5, external content over corpus
    t0 = time.perf_counter()
    db.executescript(FTS_SCHEMA)
    db.execute("""insert into corpus_fts (rowid, title, description, items_text, category, agency)
                  select nid, title, description, items_text, category, agency from corpus""")
    db.commit()
    db.execute("insert into corpus_fts(corpus_fts) values('optimize')")
    db.commit()
    say("corpus_fts built and optimized in %.1fs" % (time.perf_counter() - t0))

    meta = {
        "built_at": datetime.now(PH_TZ).isoformat(timespec="seconds"),
        "ref_date": ref_instant(ref),
        "src_mphilgeps_rows": counts["mphilgeps"],
        "src_legacy_rows": counts["legacy"],
        "src_mphilgeps_columns": ",".join(mcols),
        "src_legacy_columns": ",".join(lcols),
        "merge_version": "1",
        "fts_tokenizer": "porter unicode61 remove_diacritics 2",
    }
    db.executemany("insert into build_meta values (?,?)", sorted(meta.items()))
    db.commit()
    db.execute("vacuum")
    db.execute("analyze")
    db.commit()
    verify(db, ref)
    n_rows, n_cmp = verify_fidelity(db, mph, leg)
    say("fidelity: %d rows / %d field comparisons against the source DBs, 0 mismatches"
        % (n_rows, n_cmp))
    db.close()
    mph.close()
    leg.close()
    check_readonly(out_path)
    say("verify: all asserts passed; corpus.db refuses writes when opened mode=ro")
    return out_path


def verify_fidelity(db, mph, leg):
    """Every mapped column of every source row must survive verbatim into corpus.

    Not sampled — all 22,080 rows against all ~30 columns each, ~1s. The only permitted
    differences are the documented transformations: publish_at/closing_at padded to 19 chars
    and mode_norm recomputed. `items` is compared raw (items_text is the derived copy).
    """
    db.row_factory = mph.row_factory = leg.row_factory = sqlite3.Row
    skip = {"publish_at", "closing_at", "mode_norm"}
    n_rows = n_cmp = 0
    for src, sdb, only in (("mphilgeps", mph, MPH_ONLY), ("legacy", leg, LEG_ONLY)):
        cols = [c for c in SHARED + only if c not in skip]
        corp = {r["id"]: r for r in db.execute("select * from corpus where source=?", (src,))}
        for r in sdb.execute("select * from tenders"):
            cr = corp.get(r["id"])
            assert cr is not None, "%s row %s missing from corpus" % (src, r["id"])
            n_rows += 1
            for c in cols:
                assert r[c] == cr[c], "%s %s.%s: %r != %r" % (src, r["id"], c, r[c], cr[c])
            assert iso_ts(r["publish_at"]) == cr["publish_at"]
            assert iso_ts(r["closing_at"]) == cr["closing_at"]
            n_cmp += len(cols) + 2
    db.row_factory = None
    return n_rows, n_cmp


def check_readonly(path):
    """The `rfp sql` guarantee at the DB layer: mode=ro must reject a write outright."""
    db = ro(path)
    try:
        db.execute("update corpus set title='x' where nid=1")
        raise SystemExit("corpus.db accepted a write through mode=ro")
    except sqlite3.OperationalError as e:
        assert "readonly" in str(e), e
    finally:
        db.close()


# --- verification ------------------------------------------------------------

def q1(db, sql, args=()):
    return db.execute(sql, args).fetchone()[0]


def verify(db, ref):
    ref = ref_instant(ref)
    src_m = int(q1(db, "select value from build_meta where key='src_mphilgeps_rows'"))
    src_l = int(q1(db, "select value from build_meta where key='src_legacy_rows'"))
    total = src_m + src_l

    assert q1(db, "select count(*) from corpus") == total, "row count != sum of sources"
    assert q1(db, "select count(*) from corpus where source='mphilgeps'") == src_m
    assert q1(db, "select count(*) from corpus where source='legacy'") == src_l
    assert q1(db, "select count(distinct source) from corpus") == 2
    assert q1(db, "select count(*) from corpus where dupe_key is null") == 0
    assert q1(db, "select count(distinct id) from corpus") == total, "native ids collide"
    assert q1(db, "select count(*) from corpus where notice_key is null") == 0

    # timestamps uniform => comparisons and BETWEEN are meaningful across sources
    assert q1(db, "select count(*) from corpus where closing_at is not null "
                  "and length(closing_at) != 19") == 0
    assert q1(db, "select count(*) from corpus where publish_at is not null "
                  "and length(publish_at) != 19") == 0
    assert q1(db, "select count(*) from corpus where closing_at is not null "
                  "and closing_day != substr(closing_at,1,10)") == 0

    # every notice reachable through the location join, nulls included
    assert q1(db, "select count(distinct nid) from notice_location") == total, \
        "notices missing from notice_location"
    assert q1(db, "select count(*) from notice_location l left join corpus c using (nid) "
                  "where c.nid is null") == 0
    assert q1(db, "select count(*) from notice_location where location is not null "
                  "and location_norm is null") == 0
    # A null-location row is only legitimate when the scraped value carries no alphanumeric
    # content at all. Measured: exactly one legacy notice (13173435) has location = ','
    # — a bare separator, i.e. genuinely no location, and it must land in the null bucket
    # rather than produce an empty-string location value.
    assert q1(db, """select count(*) from corpus c
                      where exists (select 1 from notice_location l
                                    where l.nid = c.nid and l.location is null)
                        and c.location glob '*[A-Za-z0-9]*'""") == 0
    # no empty-string locations leaked into the join table
    assert q1(db, "select count(*) from notice_location where trim(coalesce(location,'x'))=''") == 0

    # The items header must not be searchable — it is on 4,288 of 4,288 enriched mPhilGEPS
    # notices, so an unstripped header matches every query. Two checks, because the two
    # failure modes differ:
    #  (a) no *line* of items_text is a header label (the exact invariant);
    #  (b) the two multi-word labels match nothing through FTS. 'Item No' is deliberately
    #      NOT asserted to zero: 10 notices use it as real data ('ITEM NO. 1 - DROPLIGHT'),
    #      which is exactly why stripping is line-wise and not a substring blacklist.
    for (txt,) in db.execute("select items_text from corpus where items_text is not null"):
        for ln in txt.split("\n"):
            assert ln.strip().lower().rstrip(":") not in ITEM_HEADER_LINES, \
                "header line survived: %r" % ln
    for phrase in ('"unit of measure"', '"lot description"'):
        n = q1(db, "select count(*) from corpus_fts where corpus_fts match ?",
               ("items_text:" + phrase,))
        assert n == 0, "items header still indexed: %s -> %d hits" % (phrase, n)
    assert q1(db, "select count(*) from corpus where items is not null "
                  "and items_text like '%Unit of Measure%'") == 0
    # and the raw column is still intact, so nothing was destroyed by stripping
    assert q1(db, "select count(*) from corpus where items like '%Unit of Measure%'") == \
        q1(db, "select count(*) from corpus where items is not null")

    # FTS external content is aligned with corpus (wrong content_rowid is silent otherwise)
    assert q1(db, "select count(*) from corpus_fts") == total
    nid, title = db.execute("select nid, title from corpus where title is not null "
                            "and length(title) > 30 limit 1").fetchone()
    got = q1(db, "select title from corpus_fts where rowid=?", (nid,))
    assert got == title, "FTS content_rowid misaligned"

    # dupe_review holds only real collisions, and only as review rows
    grp = q1(db, "select count(distinct group_key) from dupe_review where signal='content_hash'")
    rows = q1(db, "select count(*) from dupe_review where signal='content_hash'")
    assert rows == q1(db, """select count(*) from corpus where dupe_key in
                             (select dupe_key from corpus group by dupe_key
                              having count(*) > 1)"""), "dupe_review incomplete"
    assert q1(db, "select coalesce(min(group_size),2) from dupe_review") >= 2
    assert grp * 2 <= rows
    # nothing was merged away: every review row still exists as its own notice
    assert q1(db, """select count(*) from dupe_review d left join corpus c using (nid)
                     where c.nid is null""") == 0
    assert q1(db, "select count(distinct nid) from corpus") == total
    # the ref_no signal is cross-source by construction
    assert q1(db, """select count(*) from dupe_review where signal='ref_no'
                     and cross_source=0""") == 0
    for gk, in db.execute("select distinct group_key from dupe_review where signal='ref_no'"):
        srcs = q1(db, """select count(distinct source) from dupe_review
                         where signal='ref_no' and group_key=?""", (gk,))
        assert srcs == 2, "ref_no group %s spans %d sources" % (gk, srcs)
    assert q1(db, "select count(*) from corpus where ref_digits is not null "
                  "and length(ref_digits) < 5") == 0

    # expiry is a parameterised query, not a stored verdict
    a = q1(db, "select count(*) from corpus where closing_at < ?", (ref,))
    b = q1(db, "select count(*) from corpus where closing_at < ?",
           ((datetime.fromisoformat(ref) - timedelta(days=30)).isoformat(),))
    assert a >= b, "expired count not monotonic in the reference date"
    assert q1(db, "select count(*) from corpus_state") == total
    assert q1(db, "select count(*) from corpus_state where state='no_closing'") == \
        q1(db, "select count(*) from corpus where closing_at is null")

    # porter stemming is on, which is the recall bet in design §Evaluation: inflections must
    # hit the same rows or 'services' silently misses 'service'.
    for a, b in (("rehabilitation", "rehabilitations"), ("service", "services"),
                 ("building", "buildings")):
        na = q1(db, "select count(*) from corpus_fts where corpus_fts match ?", (a,))
        nb = q1(db, "select count(*) from corpus_fts where corpus_fts match ?", (b,))
        assert na == nb and na > 0, "tokenizer not stemming: %s=%d %s=%d" % (a, na, b, nb)


# --- stats -------------------------------------------------------------------

def fts_bytes(db):
    try:
        n = q1(db, "select sum(pgsize) from dbstat where name like 'corpus_fts%'")
        if n:
            return int(n), "dbstat"
    except sqlite3.Error:
        pass
    n = 0
    for t, col in (("corpus_fts_data", "block"), ("corpus_fts_idx", "term"),
                   ("corpus_fts_docsize", "sz")):
        try:
            n += int(q1(db, "select coalesce(sum(length(%s)),0) from %s" % (col, t)) or 0)
        except sqlite3.Error:
            pass
    return n, "content-length"


def mb(n):
    return "%.1f MB" % (n / 1048576.0)


def stats(path=OUT_DB, ref=None):
    ref = ref_instant(ref or ph_today())
    db = ro(path)
    p = print
    p("corpus.db  %s   file %s" % (path, mb(os.path.getsize(path))))
    p("built_at %s   merge_version %s" % (
        q1(db, "select value from build_meta where key='built_at'"),
        q1(db, "select value from build_meta where key='merge_version'")))
    p("reference instant for expiry: %s  (parameter, not baked in)" % ref)
    p("")
    total = q1(db, "select count(*) from corpus")
    p("rows                      %6d" % total)
    for src, n, enr, exp in db.execute("""
            select source, count(*), sum(enriched_at is not null),
                   sum(closing_at is not null and closing_at < ?)
            from corpus group by source order by source""", (ref,)):
        p("  %-22s %6d   enriched %6d   expired %5d" % (src, n, enr or 0, exp or 0))
    p("  %-22s %6d   (of %d rows)" % ("enriched total",
                                      q1(db, "select count(*) from corpus where enriched_at is not null"),
                                      total))
    p("")
    p("expiry state (as a query against :ref)")
    for st, n, val in db.execute("""
            select case when closing_at is null then 'no_closing'
                        when closing_at < ? then 'expired' else 'open' end st,
                   count(*), coalesce(sum(abc),0)
            from corpus group by st order by 2 desc""", (ref,)):
        p("  %-10s %6d   P%s" % (st, n, "{:,.0f}".format(val)))
    p("  open value        P%s" % "{:,.0f}".format(q1(
        db, "select coalesce(sum(abc),0) from corpus where closing_at >= ?", (ref,))))
    p("")
    p("nulls / hazards")
    for label, sql in (
            ("closing_at null", "closing_at is null"),
            ("abc null", "abc is null"),
            ("location empty", "location is null or trim(location)=''"),
            ("location multi-valued", "location like '%,%'"),
            ("not enriched (zombies)", "enriched_at is null"),
            ("items null", "items is null"),
            ("description null/empty", "description is null or trim(description)=''")):
        n = q1(db, "select count(*) from corpus where " + sql)
        p("  %-24s %6d  %5.1f%%   (mph %d / legacy %d)" % (
            label, n, 100.0 * n / total,
            q1(db, "select count(*) from corpus where source='mphilgeps' and " + sql),
            q1(db, "select count(*) from corpus where source='legacy' and " + sql)))
    p("")
    p("dupe_key — REVIEW ONLY, never merged")
    ch = "from dupe_review where signal='content_hash'"
    grp = q1(db, "select count(distinct group_key) " + ch)
    rows = q1(db, "select count(*) " + ch)
    p("  distinct dupe_key      %6d of %d rows" % (
        q1(db, "select count(distinct dupe_key) from corpus"), total))
    p("  colliding rows         %6d in %d groups" % (rows, grp))
    xg = q1(db, "select count(distinct group_key) " + ch + " and cross_source=1")
    p("  cross-source groups    %6d   (design/DECISIONS said zero — see docstring)" % xg)
    for label, extra in (("intra-legacy", "and cross_source=0 and source='legacy'"),
                         ("intra-mphilgeps", "and cross_source=0 and source='mphilgeps'"),
                         ("cross-source", "and cross_source=1")):
        p("    %-18s %6d rows in %6d groups" % (
            label, q1(db, "select count(*) " + ch + " " + extra),
            q1(db, "select count(distinct group_key) " + ch + " " + extra)))
    p("  ref_no signal (agency + >=5 digits of solicitation/control no, cross-source only)")
    rg = q1(db, "select count(distinct group_key) from dupe_review where signal='ref_no'")
    p("    %-18s %6d rows in %6d groups" % (
        "cross-source", q1(db, "select count(*) from dupe_review where signal='ref_no'"), rg))
    p("    %-18s %6d groups the content hash does not flag" % ("new candidates", q1(db, """
        select count(*) from (select group_key from dupe_review where signal='ref_no'
          group by group_key
          having sum(nid in (select nid from dupe_review where signal='content_hash'
                                                          and cross_source=1)) = 0)""")))
    p("  ref_digits usable      %6d of %d rows" % (
        q1(db, "select count(*) from corpus where ref_digits is not null"), total))
    p("  largest content_hash group (no field-based key can split these):")
    k = db.execute("select group_key " + ch + " order by group_size desc limit 1").fetchone()
    if k:
        for r in db.execute("""select id, agency, title, abc, closing_at from dupe_review
                               where signal='content_hash' and group_key=? order by id""", (k[0],)):
            p("    %-10s %-42s %-34s P%-12s %s" % (
                r[0], (r[1] or "")[:42], (r[2] or "")[:34], "{:,.0f}".format(r[3] or 0), r[4]))
    p("")
    p("location (join table, not LIKE)")
    p("  notice_location rows   %6d" % q1(db, "select count(*) from notice_location"))
    p("  distinct location_norm %6d" % q1(
        db, "select count(distinct location_norm) from notice_location"))
    p("  notices with no location %4d  (addressable: location_norm is null)" % q1(
        db, "select count(*) from notice_location where location_norm is null"))
    p("  notices with >1 location %4d" % q1(
        db, "select count(*) from (select nid from notice_location group by nid having count(*)>1)"))
    p("  top: " + ", ".join("%s %d" % (r[0], r[1]) for r in db.execute(
        """select location_norm, count(*) from notice_location
           where location_norm is not null group by 1 order by 2 desc limit 8""")))
    p("")
    n, how = fts_bytes(db)
    p("FTS5 (external content, %s)" % q1(db, "select value from build_meta where key='fts_tokenizer'"))
    p("  indexed rows           %6d" % q1(db, "select count(*) from corpus_fts"))
    p("  index size             %s  (%d bytes, via %s)" % (mb(n), n, how))
    p("  indexed text           %s" % mb(q1(db, """select sum(
           length(coalesce(title,''))+length(coalesce(description,''))
          +length(coalesce(items_text,''))+length(coalesce(category,''))
          +length(coalesce(agency,''))) from corpus""")))
    for phrase in ('items_text:"unit of measure"', 'items_text:"lot description"',
                   'items_text:unspsc'):
        p("  header check %-34s %d hits" % (
            phrase, q1(db, "select count(*) from corpus_fts where corpus_fts match ?", (phrase,))))
    p("  tagged rows            %6d  (rfp tag writes work_type/scope/keywords)" % q1(
        db, "select count(*) from corpus where work_type is not null"))
    db.close()


# --- demo --------------------------------------------------------------------

# Every demo binds :ref — the reference instant is a parameter everywhere, including here.
# :q is the FTS match expression where one is used.
DEMOS = [
    ("journey 0: civil works in Cavite, P1-5M, >=7 days to prepare",
     """select c.id, c.abc, c.closing_at, c.agency,
                 snippet(corpus_fts, -1, '[', ']', '..', 8)
          from corpus_fts
          join corpus c on c.nid = corpus_fts.rowid
          join notice_location l on l.nid = c.nid
         where corpus_fts match :q
           and l.location_norm = 'CAVITE'
           and c.abc between 1000000 and 5000000
           and c.closing_at >= datetime(:ref, '+7 days')
         order by bm25(corpus_fts) limit 20""",
     'road OR concrete OR drainage OR "civil works" OR pavement'),
    ("multi-lot decomposition: notice outside a P100K band, a lot inside it",
     """select id, abc, abc_lot_min, abc_lot_max, closing_at, substr(title,1,44) from corpus
         where abc > 100000 and abc_lot_max <= 100000 and closing_at >= :ref
         order by abc desc limit 20""", None),
    ("tight-deadline triage: still open, closing inside 48h, both sources",
     """select source, count(*), coalesce(sum(abc),0) from corpus
         where closing_at between :ref and datetime(:ref, '+2 days') group by source""", None),
    ("facets: classification x ABC band over an FTS query (orientation, cheap)",
     """select c.classification,
                 case when c.abc is null then 'not stated'
                      when c.abc < 1000000 then '<1M' when c.abc < 15000000 then '1-15M'
                      else '15M+' end band,
                 count(*)
          from corpus_fts join corpus c on c.nid = corpus_fts.rowid
         where corpus_fts match :q and c.closing_at >= :ref
         group by 1, 2 order by 3 desc limit 12""",
     'generator OR transformer OR electrical'),
    ("null-tolerant geography: open notices whose location is unknown",
     """select count(*), coalesce(sum(c.abc),0) from corpus c
          join notice_location l on l.nid = c.nid
         where l.location_norm is null and c.closing_at >= :ref""", None),
    ("expired is a query, not a delete: same shape, :ref moved back 30 days",
     """select count(*) from corpus
         where closing_at >= datetime(:ref, '-30 days') and closing_at < :ref""", None),
    ("state_sql(): the state/days_left expression the search layer should reuse",
     """select source, id, abc, """ + state_sql() + """ from corpus
         where abc > 15000000 order by days_left limit 20""", None),
]


def demo(path=OUT_DB, ref=None):
    ref = ref_instant(ref or ph_today())
    db = ro(path)
    print("demonstration queries, :ref = %s  (cold connection, per-query wall time)\n" % ref)
    for label, sql, match in DEMOS:
        params = {"ref": ref}
        if match is not None:
            params["q"] = match
        t0 = time.perf_counter()
        rows = db.execute(sql, params).fetchall()
        ms = (time.perf_counter() - t0) * 1000
        print("%-70s %7.1f ms  %d rows" % (label, ms, len(rows)))
        if match:
            print("    match: %s" % match)
        for r in rows[:4]:
            print("   ", " | ".join(("%s" % (x,))[:58] for x in r))
        print("")
    db.close()


# --- selfcheck ---------------------------------------------------------------

def selfcheck():
    # dupe_key against a real legacy row (id 12535432) and its stored key. This is the
    # regression that proves norm()/format compatibility with ingest_legacy.py.
    assert dupe_key("BARANGAY SALVACION, CARMEN, DAVAO DEL NORTE", "2026-08-14T14:00:00",
                    "IMPROVEMENT OF BARANGAY ROADS", 108000.0) == \
        "f348e7d2df586e5bb408a3dad638ffed8c68a678"
    assert norm_key("Municipality of Libón (1st District)") == "MUNICIPALITY OF LIBN 1ST DISTRICT"
    assert norm_key(None) == ""
    # abc of None and 0 must hash the same as ingest_legacy.py's "%.2f" % (abc or 0)
    assert dupe_key("A", "x", "t", None) == dupe_key("A", "x", "t", 0)
    # differing only in refID => same key. This is the LIBON case: 9 distinct notices,
    # one key. Flag, never merge.
    assert dupe_key("MUNICIPALITY OF LIBON", "2026-08-11T10:00:00", "Purchase of Various Goods",
                    199990.0) == dupe_key("MUNICIPALITY OF LIBON", "2026-08-11T10:00:00",
                                          "Purchase of Various Goods", 199990.0)
    # title is truncated at 80 chars post-normalisation
    long_a, long_b = "X" * 80 + "AAA", "X" * 80 + "BBB"
    assert dupe_key("A", "x", long_a, 1) == dupe_key("A", "x", long_b, 1)

    # timestamp normalisation: the cross-source comparability fix
    assert iso_ts("2026-08-09T05:00") == "2026-08-09T05:00:00"
    assert iso_ts("2026-08-14T14:00:00") == "2026-08-14T14:00:00"
    assert iso_ts("2024-06-14") == "2024-06-14T00:00:00"
    assert iso_ts("2026-08-09 05:00") == "2026-08-09T05:00:00"
    assert iso_ts(None) is None and iso_ts("") is None and iso_ts("   ") is None
    assert iso_ts("garbage") == "garbage"          # kept verbatim, never invented
    assert len(iso_ts("2026-08-09T05:00")) == len(iso_ts("2026-08-14T14:00:00")) == 19
    # the bug this prevents: unequal lengths compare wrong for the same instant
    assert "2026-08-09T05:00" < "2026-08-09T05:00:00"
    assert iso_from_display("05-Aug-2026 02:20 PM") == "2026-08-05T14:20:00"
    assert iso_from_display("05-Aug-2026 12:05 AM") == "2026-08-05T00:05:00"
    assert iso_from_display("") is None and iso_from_display(None) is None
    assert iso_from_display("not a date") is None

    # reference number: the one field both systems share verbatim, once punctuation goes
    assert ref_digits("ITB 26-229") == ref_digits("26229") == "26229"
    assert ref_digits("PB-2026-02-INFRA") == ref_digits("202602") == "202602"
    assert ref_digits("RO4-RBAC-GOODS-2026-16") == "4202616"    # note: the 4 in RO4 counts
    assert ref_digits("2026") is None and ref_digits("") is None and ref_digits(None) is None
    assert ref_digits("G-17") is None                            # too short to discriminate

    # items header stripping — every enriched mPhilGEPS notice carries this header
    raw = ("Item No.\nUNSPSC\nLot Name\nLot Description\nQuantity\nUnit of Measure\n"
           "1\n72140000\nHeavy construction services\nRoadway Lighting along Iloilo-Capiz Rd\n"
           "1\nLot")
    got = strip_items_header(raw)
    for bad in ("Lot Description", "Unit of Measure", "UNSPSC", "Item No."):
        assert bad not in got, bad
    assert "Heavy construction services" in got and "72140000" in got
    assert got.strip().endswith("Lot"), "unit of measure 'Lot' must survive as data"
    # header repeated mid-body (measured on 1 notice) is also removed
    assert "UNSPSC" not in strip_items_header(raw + "\n" + raw)
    assert strip_items_header(None) is None and strip_items_header("") == ""
    assert strip_items_header("Quantity:") == ""       # trailing colon variant
    assert strip_items_header("1\n2") == "1\n2"

    # location: comma multi-valued, nulls addressable, cross-system aliases
    assert split_locations("Batangas,Laguna,Quezon,Rizal") == [
        ("Batangas", "BATANGAS"), ("Laguna", "LAGUNA"), ("Quezon", "QUEZON"),
        ("Rizal", "RIZAL")]
    assert split_locations(" Metro Manila , Cebu ") == [
        ("Metro Manila", "METRO MANILA"), ("Cebu", "CEBU")]
    assert split_locations(None) == [(None, None)]
    assert split_locations("") == [(None, None)]
    assert split_locations("   ") == [(None, None)]
    assert split_locations(",,") == [(None, None)]
    assert split_locations("Cebu,Cebu") == [("Cebu", "CEBU")]      # deduped
    assert norm_location("Dinagat Island") == norm_location("Dinagat Islands")
    assert norm_location("Davao de Oro (Compos. Valley)") == norm_location("Davao de Oro")
    assert norm_location("NCR") == "METRO MANILA"
    assert norm_location("north cotabato") == norm_location("Cotabato")
    assert norm_location(None) is None

    # expiry is a function of a reference instant, never of today
    assert state_of("2026-08-01T10:00:00", "2026-08-08T00:00:00") == "expired"
    assert state_of("2026-08-09T10:00:00", "2026-08-08T00:00:00") == "open"
    assert state_of("2026-08-01T10:00:00", "2026-07-01T00:00:00") == "open"   # ref moved
    assert state_of(None, "2026-08-08T00:00:00") == "no_closing"
    assert ref_instant("2026-08-08") == "2026-08-08T00:00:00"
    assert ":ref" in state_sql() and "now" not in state_sql()

    # ...and the corpus_state view must agree with state_of() at the boundary that actually
    # bites: a notice closing EARLIER TODAY. The view compares strings, so its PH-now has to
    # carry the same 'T' separator closing_at does -- datetime() does not, and the mismatch
    # silently kept same-day expired notices in the open set.
    v = sqlite3.connect(":memory:")
    v.executescript(SCHEMA)
    now_ph = v.execute("select strftime('%Y-%m-%dT%H:%M:%S','now','+8 hours')").fetchone()[0]
    for label, offset in (("closed an hour ago", "-1 hour"), ("closes in an hour", "+1 hour")):
        ts = v.execute("select strftime('%Y-%m-%dT%H:%M:%S','now','+8 hours',?)",
                       (offset,)).fetchone()[0]
        # notice_key/closing_day are generated; source, id and dupe_key are the not-null set
        v.execute("insert into corpus (source, id, dupe_key, closing_at) values (?,?,?,?)",
                  ("mph", label, label, ts))
    v.commit()
    got = dict(v.execute("select id, state from corpus_state"))
    assert got["closed an hour ago"] == "expired", (got, now_ph)
    assert got["closes in an hour"] == "open", (got, now_ph)
    # and the two fields must never disagree about the sign
    assert not v.execute("select 1 from corpus_state"
                         " where state='open' and days_left < 0").fetchall()
    v.close()

    # column reconciliation: no overlap between the per-source column sets, and the
    # documented union is what the DDL actually declares.
    assert not (set(MPH_ONLY) & set(LEG_ONLY))
    assert not (set(SHARED) & set(MPH_ONLY)) and not (set(SHARED) & set(LEG_ONLY))
    assert "mode_norm" in SHARED, "generated in ingest.py, plain here"
    probe = sqlite3.connect(":memory:")
    probe.executescript(SCHEMA)
    # table_xinfo, not table_info: the latter hides VIRTUAL generated columns
    declared = {r[1] for r in probe.execute("pragma table_xinfo(corpus)")}
    probe.close()
    for c in set(SHARED) | set(MPH_ONLY) | set(LEG_ONLY) | set(DERIVED) | set(TAG_COLS):
        assert c in declared, "column %s missing from corpus DDL" % c
    assert set(INSERT_COLS) <= declared
    assert len(INSERT_COLS) == len(set(INSERT_COLS))

    # a live FTS/expiry round-trip on a tiny in-memory corpus: proves the schema works,
    # the header is unsearchable, and the location join finds a multi-province notice.
    db = sqlite3.connect(":memory:")
    db.executescript(SCHEMA)
    db.executescript(FTS_SCHEMA)
    rows = [("mphilgeps", 1, "Supply of backhoe parts", 500000.0, "2026-08-20T10:00:00",
             "Batangas,Laguna", raw),
            ("legacy", 12535432, "Improvement of barangay roads", 108000.0,
             "2026-08-01T10:00:00", None, None)]
    for src, id_, title, abc, closing, loc, items in rows:
        db.execute("""insert into corpus (source,id,title,abc,closing_at,location,items,
                                          items_text,dupe_key)
                      values (?,?,?,?,?,?,?,?,?)""",
                   (src, id_, title, abc, closing, loc, items, strip_items_header(items),
                    dupe_key(None, closing, title, abc)))
    for nid, src, id_, loc in db.execute("select nid,source,id,location from corpus"):
        for i, (r_, n_) in enumerate(split_locations(loc)):
            db.execute("insert into notice_location values (?,?,?,?,?,?)", (nid, src, id_, i, r_, n_))
    db.execute("""insert into corpus_fts (rowid,title,description,items_text,category,agency)
                  select nid,title,description,items_text,category,agency from corpus""")
    assert q1(db, "select count(*) from corpus_fts where corpus_fts match 'backhoe'") == 1
    assert q1(db, "select count(*) from corpus_fts where corpus_fts match ?",
              ('items_text:"unit of measure"',)) == 0
    assert q1(db, "select count(*) from corpus_fts where corpus_fts match 'roadway'") == 1
    assert q1(db, """select count(*) from corpus c join notice_location l on l.nid=c.nid
                     where l.location_norm='LAGUNA'""") == 1
    assert q1(db, "select count(*) from notice_location where location_norm is null") == 1
    ref = "2026-08-08T00:00:00"
    assert q1(db, "select count(*) from corpus where closing_at < ?", (ref,)) == 1
    assert q1(db, "select count(*) from corpus where closing_at >= ?", (ref,)) == 1
    assert q1(db, "select count(*) from corpus where closing_at < ?",
              ("2026-07-01T00:00:00",)) == 0, "expiry must follow :ref"
    assert q1(db, "select notice_key from corpus where source='legacy'") == "legacy:12535432"
    assert q1(db, "select closing_day from corpus where id=1") == "2026-08-20"
    # the id space is globally unique: inserting a legacy id under mphilgeps must fail
    try:
        db.execute("insert into corpus (source,id,dupe_key) values ('mphilgeps',12535432,'x')")
        raise AssertionError("unique(id) did not fire on a cross-source id collision")
    except sqlite3.IntegrityError:
        pass
    db.close()
    n = sum(1 for ln in open(__file__) if re.match(r"\s+assert\b", ln))
    print("selfcheck: ok (%d assert statements over pure helpers + an in-memory corpus)" % n)


# --- cli ---------------------------------------------------------------------

def main():
    argv = sys.argv[1:]
    cmd = argv[0] if argv else "build"
    opt = {}
    for i, a in enumerate(argv):
        if a in ("--out", "--db", "--ref") and i + 1 < len(argv):
            opt[a.lstrip("-")] = argv[i + 1]
    path = opt.get("out") or opt.get("db") or OUT_DB
    ref = opt.get("ref")
    if cmd == "test":
        selfcheck()
    elif cmd == "build":
        t0 = time.perf_counter()
        build(path, ref)
        print("built %s in %.1fs" % (path, time.perf_counter() - t0))
        print("")
        stats(path, ref)
        print("")
        demo(path, ref)
    elif cmd == "stats":
        stats(path, ref)
    elif cmd == "demo":
        demo(path, ref)
    elif cmd == "verify":
        db = ro(path)
        verify(db, ref or ph_today())
        print("verify: all asserts passed")
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
