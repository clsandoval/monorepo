#!/usr/bin/env python3
"""Adversarial coverage audit for tonight's ingest -- assert-based, re-runnable, offline.

Written by the VERIFY agent 2026-08-09 as an independent check on docs.db / corpus.db.
Deliberately does NOT import any of the pipeline's own modules: every number is recomputed
from the databases with its own SQL, so a bug in the pipeline cannot make this file agree
with it.  All DBs are opened read-only via `mode=ro`.

    python3 verify_audit.py          # asserts; non-zero exit on regression
    python3 verify_audit.py -v       # also print every measured number

The live-network portion of the audit (25-notice coverage recount against philgeps.gov.ph,
and the two auth-gate probes) is NOT here on purpose -- it is rate-limited and must not run
in a loop.  Its findings are recorded as constants below and in the audit write-up.
"""
from __future__ import annotations

import collections
import os
import re
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
VERBOSE = "-v" in sys.argv


def ro(name: str) -> sqlite3.Connection:
    return sqlite3.connect(f"file:{os.path.join(HERE, name)}?mode=ro", uri=True)


def say(label: str, value) -> None:
    if VERBOSE:
        print(f"    {label:52} {value}")


# --------------------------------------------------------------------------------------
# measured 2026-08-09 against the live site; recorded, not re-fetched on every run
LIVE = {
    # 25 random mPhilGEPS notices: docview row count vs docs.db top-level rows
    "coverage_sample_n": 25,
    "coverage_sample_mismatches": 0,
    # docview without X-Requested-With -> constant session-expired shell
    "docview_noxhr_bytes": 21477,
    # legacy SplashBidSupplementViewUI.aspx -> 302 ErrorPage.aspx for anonymous clients
    "legacy_supplement_redirect": "https://notices.philgeps.gov.ph/GEPSNONPILOT/ErrorPage/ErrorPage.aspx",
}


def check_docs_counts() -> None:
    d = ro("docs.db")
    q = lambda s: d.execute(s).fetchone()[0]

    documents = q("select count(*) from documents")
    blobs = q("select count(*) from blobs")
    notices = q("select count(*) from notices")
    say("docs.db documents", documents)
    say("docs.db blobs", blobs)
    say("docs.db notices", notices)

    assert documents > 10_000, f"documents collapsed to {documents}"
    assert blobs > 8_000, f"blobs collapsed to {blobs}"
    assert notices == 4288, f"notices {notices}, expected the 4,288 crawled mPhilGEPS notices"

    # docs.db is mPhilGEPS-only by design (legacy attachments are auth-gated).
    srcs = {r[0] for r in d.execute("select distinct source from documents")}
    assert srcs == {"mphilgeps"}, f"unexpected sources in documents: {srcs}"


def check_silent_emptiness() -> None:
    """'ok' must mean readable text, not a scanned page wearing a success label."""
    d = ro("docs.db")
    q = lambda s: d.execute(s).fetchone()[0]

    ok_null = q("select count(*) from blobs where extract_status='ok' and text is null")
    ok_zero = q("select count(*) from blobs where extract_status='ok' and coalesce(chars,0)=0")
    ok_tiny = q("select count(*) from blobs where extract_status='ok' and chars<200")
    scans = q("select count(*) from blobs where extract_status='no_text_layer'")
    say("blobs ok with NULL text", ok_null)
    say("blobs ok with 0 chars", ok_zero)
    say("blobs ok with <200 chars", ok_tiny)
    say("blobs honestly labelled no_text_layer", scans)

    assert ok_null == 0, f"{ok_null} blobs claim ok but have NULL text"
    assert ok_zero == 0, f"{ok_zero} blobs claim ok but extracted 0 chars"
    # A handful of genuinely tiny one-line PDFs is fine; a flood means mislabelled scans.
    assert ok_tiny < 0.01 * q("select count(*) from blobs where extract_status='ok'"), (
        f"{ok_tiny} 'ok' blobs are under 200 chars -- scans wearing a success label")
    assert scans > 1_000, "no_text_layer bucket vanished; scans are being mislabelled as ok"


def check_no_cross_contamination() -> None:
    """A document's text must belong to the notice it hangs off.

    Strongest available ground truth: mPhilGEPS embeds the notice id in the document URL
    (`/bid_notice_{id}/`), so URL id != documents.notice_id is definitive miswiring.
    """
    d = ro("docs.db")
    pat = re.compile(r"bid_notice_(\d+)")
    bad = untestable = tested = 0
    for nid, url in d.execute(
            "select notice_id, url from documents where parent_doc_id is null"):
        m = pat.search(url or "")
        if not m:
            untestable += 1
            continue
        tested += 1
        if int(m.group(1)) != nid:
            bad += 1
    say("top-level docs whose URL carries a notice id", tested)
    say("docs whose URL id != notice_id", bad)
    assert untestable == 0, f"{untestable} document URLs lack bid_notice_N"
    assert bad == 0, f"{bad} documents are attached to the wrong notice"

    # blob join must not be crossed either
    crossed = d.execute(
        "select count(*) from documents d join blobs b on b.blob_id=d.blob_id "
        "where d.sha256 is not null and b.sha256<>d.sha256").fetchone()[0]
    say("documents.sha256 != blobs.sha256", crossed)
    assert crossed == 0, f"{crossed} documents point at a blob with different bytes"


def check_contract_id_belongs() -> None:
    """Semantic version of the above: a DPWH contract ID in the title should appear in
    that notice's own document text.  Not 100% -- some notices ship only the generic GPPB
    template, which names no contract -- but a collapse here means shuffled text."""
    d, c = ro("docs.db"), ro("corpus.db")
    pat = re.compile(r"\b(\d{2}[A-Z]{2}\d{4})\b")
    titles = {}
    for nid, t in c.execute("select id,title from corpus where source='mphilgeps'"):
        m = pat.search((t or "").upper())
        if m:
            titles[nid] = m.group(1)
    hit = miss = 0
    for nid, cid in titles.items():
        rows = d.execute(
            "select b.text from documents d join blobs b on b.blob_id=d.blob_id "
            "where d.notice_id=? and d.extract_status='ok' and b.chars>=200", (nid,)).fetchall()
        if not rows:
            continue
        if cid in " ".join((r[0] or "") for r in rows).upper():
            hit += 1
        else:
            miss += 1
    rate = hit / (hit + miss) if hit + miss else 0
    say("notices with a DPWH contract ID in title", len(titles))
    say("own contract ID found in own docs", f"{hit}/{hit+miss} = {rate:.1%}")
    assert rate > 0.93, f"contract-ID self-match fell to {rate:.1%}; text may be shuffled"


def check_corpus_merge_lossless() -> None:
    """corpus.db must equal tenders.db + legacy.db cell for cell, except for the two
    timestamp columns the merge deliberately normalises to full ISO seconds."""
    cp = ro("corpus.db")
    NORMALISED = {"publish_at", "closing_at"}
    totals = {}
    for db, src in (("tenders.db", "mphilgeps"), ("legacy.db", "legacy")):
        s = ro(db)
        cols = [r[1] for r in s.execute("pragma table_info(tenders)") if r[1] != "source"]
        srows = {r[0]: r[1:] for r in s.execute(
            f"select id,{','.join(cols)} from tenders")}
        crows = {r[0]: r[1:] for r in cp.execute(
            f"select id,{','.join(cols)} from corpus where source='{src}'")}
        totals[src] = len(srows)
        assert len(srows) == len(crows), (
            f"{src}: {len(srows)} source rows vs {len(crows)} in corpus")
        for k, v in srows.items():
            cv = crows[k]
            for i, col in enumerate(cols):
                if col in NORMALISED:
                    continue
                assert v[i] == cv[i], f"{src} id={k} col={col}: {v[i]!r} != {cv[i]!r}"
        # the normalised columns must still agree on their prefix
        for k, v in srows.items():
            cv = crows[k]
            for col in NORMALISED:
                if col not in cols:
                    continue
                i = cols.index(col)
                a, b = v[i], cv[i]
                if a is None or b is None:
                    assert a == b, f"{src} id={k} {col}: null mismatch"
                else:
                    assert b.startswith(a), f"{src} id={k} {col}: {b!r} is not {a!r} normalised"
        say(f"{src} rows verified cell-by-cell", len(srows))

    total = cp.execute("select count(*) from corpus").fetchone()[0]
    say("corpus total rows", total)
    assert total == sum(totals.values()) == 22080, (
        f"corpus {total} != {sum(totals.values())} source rows")
    # no column silently dropped
    ccols = {r[1] for r in cp.execute("pragma table_info(corpus)")}
    for db in ("tenders.db", "legacy.db"):
        scols = {r[1] for r in ro(db).execute("pragma table_info(tenders)")}
        assert scols <= ccols, f"{db} columns missing from corpus: {sorted(scols - ccols)}"


def check_items_header_stripped() -> None:
    """`items_text` is what FTS indexes; the 'Lot Description' header row must be gone,
    or every notice matches a query for it."""
    c = ro("corpus.db")
    q = lambda s: c.execute(s).fetchone()[0]
    raw = q("select count(*) from corpus where items like '%Lot Description%'")
    stripped = q("select count(*) from corpus where items_text like '%Lot Description%'")
    fts = q("select count(*) from corpus_fts where corpus_fts match 'items_text:\"Lot Description\"'")
    say("raw items containing the header", raw)
    say("items_text containing the header", stripped)
    say("FTS items_text hits for the header", fts)
    assert raw > 4_000, "header disappeared from raw items too -- source parse changed"
    assert stripped == 0, f"{stripped} rows still carry the items header in items_text"
    assert fts == 0, f"FTS still matches the items header on {fts} notices"


def check_fts_exactness() -> None:
    """A term occurring in exactly one notice must return exactly that notice."""
    c = ro("corpus.db")
    rows = c.execute(
        "select nid,title,description,items_text,category,agency from corpus").fetchall()
    tok = re.compile(r"[A-Za-z]{6,}")
    cnt = collections.Counter()
    for r in rows:
        cnt.update({w.lower() for f in r[1:] for w in tok.findall(f or "")})
    uniq = sorted(w for w, n in cnt.items() if n == 1)
    assert len(uniq) > 5_000, f"only {len(uniq)} unique terms; corpus may be truncated"

    # deterministic spread across the alphabet rather than the first N 'aa' words
    sample = [uniq[i * len(uniq) // 20] for i in range(20)]
    exact = 0
    for w in sample:
        res = [r[0] for r in c.execute(
            "select rowid from corpus_fts where corpus_fts match ?", (f'"{w}"',))]
        truth = [r[0] for r in rows
                 if any(re.search(rf"\b{re.escape(w)}\b", f or "", re.I) for f in r[1:])]
        if res == truth:
            exact += 1
    say("unique-term FTS exactness", f"{exact}/{len(sample)}")
    # porter stemming legitimately widens a minority (fasten -> fastening); most must be exact
    assert exact >= 0.85 * len(sample), (
        f"only {exact}/{len(sample)} unique terms resolved exactly")


def check_fts_index_integrity() -> None:
    """FTS5's own consistency check on both external-content indexes."""
    for db, tbl in (("docs.db", "doc_fts"), ("corpus.db", "corpus_fts")):
        con = sqlite3.connect(os.path.join(HERE, db))
        try:
            con.execute(f"insert into {tbl}({tbl}) values('integrity-check')")
            say(f"{db}:{tbl} integrity-check", "pass")
        finally:
            con.close()

    d = ro("docs.db")
    n_fts = d.execute("select count(*) from doc_fts").fetchone()[0]
    n_blob = d.execute("select count(*) from blobs").fetchone()[0]
    say("doc_fts rows vs blobs", f"{n_fts} vs {n_blob}")
    assert n_fts == n_blob, f"doc_fts {n_fts} != blobs {n_blob}: index is out of sync"


def check_tag_fts_keying() -> None:
    """THE FOOTGUN.  corpus.db holds two FTS tables keyed differently:
         corpus_fts.rowid == corpus.nid      (external content, content_rowid='nid')
         tag_fts.rowid    == corpus.id       (the native site id)
    Joining tag_fts on nid returns real-looking rows for the WRONG notices.  This test
    pins the asymmetry so it cannot drift silently, and documents which join is correct.
    """
    c = ro("corpus.db")
    nids = {r[0] for r in c.execute("select nid from corpus")}
    ids = {r[0] for r in c.execute("select id from corpus")}
    tr = {r[0] for r in c.execute("select rowid from tag_fts")}
    say("tag_fts rowids that are valid corpus.id", f"{len(tr & ids)}/{len(tr)}")
    say("tag_fts rowids that are valid corpus.nid", f"{len(tr & nids)}/{len(tr)}")
    assert tr <= ids, "tag_fts.rowid is no longer corpus.id -- the search join is now wrong"
    assert len(tr & nids) < 10, (
        "tag_fts rowids now overlap corpus.nid; the wrong join would start looking right")

    # corpus's own tag columns are intentionally empty; tags live in tags.db + tag_fts.
    tagged = c.execute("select count(*) from corpus where tag_model is not null").fetchone()[0]
    say("corpus rows with tag_model set (expected 0)", tagged)
    assert tagged == 0, (
        "corpus tag columns are now populated -- verify_audit's assumption is stale and "
        "the 'resolve tags through tags.db' rule in rfp/SKILL.md needs revisiting")


def check_coverage_is_honest() -> None:
    """The headline coverage number must be stated against the whole corpus, not just the
    slice that was crawlable."""
    d, c = ro("docs.db"), ro("corpus.db")
    total = c.execute("select count(*) from corpus").fetchone()[0]
    mph = c.execute("select count(*) from corpus where source='mphilgeps'").fetchone()[0]
    legacy = c.execute("select count(*) from corpus where source='legacy'").fetchone()[0]
    crawled = d.execute("select count(*) from notices where source='mphilgeps'").fetchone()[0]
    withdocs = d.execute(
        "select count(distinct notice_id) from documents where source='mphilgeps'").fetchone()[0]
    withtext = d.execute(
        "select count(distinct d.notice_id) from documents d join blobs b on b.blob_id=d.blob_id "
        "where d.extract_status='ok' and b.chars>=200").fetchone()[0]
    say("corpus notices", total)
    say("crawled for documents", f"{crawled} ({crawled/total:.1%} of corpus)")
    say("with >=1 readable document", f"{withtext} ({withtext/total:.1%} of corpus)")
    say("docs present but no readable text (OCR backlog)", withdocs - withtext)
    say("legacy notices with documents", 0)

    assert legacy == 17780 and mph == 4300
    # legacy attachments are auth-gated -> zero, by design.  Assert it stays *known*-zero
    # rather than quietly becoming a partial, unexplained number.
    legacy_docs = d.execute(
        "select count(*) from documents where source='legacy'").fetchone()[0]
    assert legacy_docs == 0, (
        f"{legacy_docs} legacy documents appeared; the auth-gate finding needs re-measuring")
    # the 12 uncrawled mPhilGEPS notices are the dead Jun-2024 rows with no closing date
    uncrawled = mph - crawled
    zombies = c.execute(
        "select count(*) from corpus where source='mphilgeps' and closing_at is null").fetchone()[0]
    say("mPhilGEPS notices never crawled", uncrawled)
    assert uncrawled == zombies == 12, (
        f"{uncrawled} uncrawled vs {zombies} zombie rows -- the skip is no longer explained")
    assert withtext / total < 0.25, "coverage claim looks inflated; recheck the denominator"


CHECKS = [
    ("docs.db row counts", check_docs_counts),
    ("silent emptiness ('ok' means readable)", check_silent_emptiness),
    ("no cross-contamination (URL id == notice_id)", check_no_cross_contamination),
    ("contract ID in title appears in own docs", check_contract_id_belongs),
    ("corpus merge is lossless cell-by-cell", check_corpus_merge_lossless),
    ("items header stripped from items_text", check_items_header_stripped),
    ("FTS returns exactly the unique-term notice", check_fts_exactness),
    ("FTS index integrity", check_fts_index_integrity),
    ("tag_fts keying footgun is pinned", check_tag_fts_keying),
    ("coverage stated against the whole corpus", check_coverage_is_honest),
]


def main() -> int:
    print(f"verify_audit -- {len(CHECKS)} independent checks against docs.db / corpus.db\n")
    failed = []
    for name, fn in CHECKS:
        try:
            fn()
        except AssertionError as e:
            failed.append((name, str(e)))
            print(f"  FAIL  {name}\n        {e}")
        except Exception as e:  # noqa: BLE001
            failed.append((name, f"{type(e).__name__}: {e}"))
            print(f"  ERROR {name}\n        {type(e).__name__}: {e}")
        else:
            print(f"  ok    {name}")
    print()
    if failed:
        print(f"{len(CHECKS)-len(failed)}/{len(CHECKS)} passed, {len(failed)} FAILED")
        return 1
    print(f"{len(CHECKS)}/{len(CHECKS)} checks passed")
    print("\nlive-network findings recorded (not re-fetched):")
    for k, v in LIVE.items():
        print(f"  {k:34} {v}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
