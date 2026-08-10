#!/usr/bin/env python3
"""Drive attachments.py over the whole mPhilGEPS corpus in DESCENDING-ABC order.

Why this exists instead of `python3 attachments.py run`
-------------------------------------------------------
`attachments.notice_ids()` shuffles its todo list with a fixed seed.  That was the right
call for the pilot -- an unbiased sample is what lets 200 notices *check* the census
instead of echoing it -- and it is the wrong call for the full run.  If the run stops
early, a random tenth of the corpus carries roughly a tenth of the peso value; the top
tenth by ABC carries most of it (measured: ABC >= P15M is 9.7% of notices and 79.6% of
value).  So this driver computes the priority order itself and hands
`attachments.discover()` explicit id batches.

Order (see `order_ids`):
  1. abc descending                -- value first; nulls last, they are unrankable
  2. closing_at descending         -- furthest-out deadline first.  A bid document for a
                                      notice that closed this morning is worthless.
  3. id descending                 -- newest, as a stable tiebreak

Batching: discover -> download -> extract, per batch of N notices.  Peak blob disk then
stays near one batch (~1 GB at the measured 4.31 MB/notice) instead of the ~17.8 GB a
download-the-world pass would hold against attachments.DISK_MAX (20 GiB).  Extract deletes
every blob it could read text out of; only `no_text_layer` bytes are retained, for a
future vision pass.

Resumable: `done` is recomputed from docs.db before every batch, using the same predicate
as `attachments.notice_ids()`, so ^C and rerun picks up where it left off.

Commands
    python3 docs_run.py run [--batch=200] [--notices=N] [--workers=6]
    python3 docs_run.py retry        # requeue blobs whose extraction failed transiently
    python3 docs_run.py plan [--notices=20]      # print the head of the priority order
    python3 docs_run.py test         # assert-based selfcheck, no network, no db writes
"""
import os
import sqlite3
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import attachments as A                                                  # noqa: E402

# blobs whose extraction failed in a way that *might* be transient (a truncated download, a
# subprocess that got killed, a missing file).  `no_text_layer` is NOT here: it is a real
# finding about a scanned document, not a failure.  Neither is `too_large`/`skipped_cap`:
# those are caps, and requeueing them would just re-trip the cap.
RETRYABLE_EXTRACT = ("corrupt", "empty", "unknown")


# ------------------------------------------------------------------------------- ordering

def order_ids(rows, done=frozenset()):
    """rows: iterable of (id, abc, closing_at).  -> ids in descending-value order.

    Implemented as three stable sorts rather than one composite key because `closing_at`
    is an ISO *string*: you cannot negate it for a reverse sub-key, and mixing
    reverse=True with a numeric negation in one key function is how off-by-one ordering
    bugs get written.  Sorting least-significant key first, stably, is equivalent and
    obviously correct.
    """
    rows = [r for r in rows if r[0] not in done]
    rows.sort(key=lambda r: r[0], reverse=True)                      # 3. id desc
    rows.sort(key=lambda r: (r[2] or ""), reverse=True)              # 2. closing desc, null last
    rows.sort(key=lambda r: (r[1] is None, -(r[1] or 0.0)))          # 1. abc desc, null last
    return [r[0] for r in rows]


def done_ids(con):
    """Notices discovery is finished with -- identical predicate to attachments.notice_ids."""
    return {r[0] for r in con.execute(
        "select notice_id from notices where source='mphilgeps'"
        " and (status not in ('http_error','gated','ref_mismatch')"
        f"      or fetch_errors >= {A.MAX_FETCH_ERRORS})")}


def priority_rows(path=None):
    ro = sqlite3.connect(f"file:{path or A.TENDERS}?mode=ro", uri=True)   # uri=True required
    try:
        return ro.execute("select id, abc, closing_at from tenders"
                          " where enriched_at is not null").fetchall()
    finally:
        ro.close()


# ------------------------------------------------------------------------------------ run

def run(con, batch=200, notices=None, workers=A.WORKERS, keep_blobs=False):
    rows = priority_rows()
    t0 = time.time()
    n_batches = attempted = 0
    while True:
        todo = order_ids(rows, done_ids(con))
        if notices is not None:
            todo = todo[:max(0, notices - attempted)]
        if not todo:
            break
        chunk = todo[:batch]
        n_batches += 1
        attempted += len(chunk)
        abcs = {i: a for i, a, _ in rows}
        lo, hi = abcs.get(chunk[-1]), abcs.get(chunk[0])
        print(f"\n{'='*88}\n== batch {n_batches}: {len(chunk)} notices, "
              f"ABC {hi if hi is None else f'{hi:,.0f}'} -> "
              f"{lo if lo is None else f'{lo:,.0f}'} "
              f"| {attempted} attempted, {len(todo)-len(chunk)} left "
              f"| disk {A.disk_used(con)/1024**3:.2f} GiB "
              f"| t+{(time.time()-t0)/60:.0f}m\n{'='*88}", flush=True)
        A.discover(con, ids=chunk, workers=workers)
        A.download(con, None, workers, keep_blobs)
        A.extract(con, keep_blobs=keep_blobs)
    print(f"\nrun: {n_batches} batches, {attempted} notices attempted, "
          f"{(time.time()-t0)/60:.1f} min", flush=True)
    A.stats(con)


def repair(con):
    """Backfill document rows left at 'pending' by a dedup hit against an already-extracted
    blob.  See the comment in attachments.download() -- fixed at the source, this repairs the
    rows the first full run already wrote."""
    n = con.execute(
        "select count(*) from documents d join blobs b using(blob_id)"
        " where d.parent_doc_id is null and d.extract_status='pending'"
        " and b.extract_status != 'pending'").fetchone()[0]
    con.execute(
        "update documents set extract_status = (select b.extract_status from blobs b"
        "                                        where b.blob_id = documents.blob_id),"
        "                     fmt            = (select b.fmt from blobs b"
        "                                        where b.blob_id = documents.blob_id)"
        " where parent_doc_id is null and extract_status='pending' and blob_id is not null"
        "   and (select b.extract_status from blobs b where b.blob_id=documents.blob_id)"
        "       != 'pending'")
    con.commit()
    print(f"repair: {n} document rows had a stale 'pending' status over an extracted blob")
    return n


def verify(con):
    """Assert docs.db's cross-table invariants.  Runnable; raises on the first violation."""
    bad = con.execute(
        "select count(*) from documents d join blobs b using(blob_id)"
        " where d.parent_doc_id is null and d.extract_status != b.extract_status").fetchone()[0]
    assert bad == 0, f"{bad} top-level documents disagree with their blob's extract_status"

    orphan = con.execute(
        "select count(*) from documents where parent_doc_id is null"
        " and extract_status='pending' and blob_id is not null").fetchone()[0]
    assert orphan == 0, f"{orphan} documents are 'pending' but already have a blob"

    nofetch = con.execute(
        "select count(*) from documents where parent_doc_id is null and blob_id is null"
        f" and extract_status='pending' and fetch_errors < {A.MAX_FETCH_ERRORS}").fetchone()[0]
    assert nofetch == 0, f"{nofetch} documents were never downloaded and are not retired"

    dangling = con.execute(
        "select count(*) from documents where blob_id is not null"
        " and blob_id not in (select blob_id from blobs)").fetchone()[0]
    assert dangling == 0, f"{dangling} documents point at a blob_id that does not exist"

    unindexed = con.execute(
        "select (select count(*) from blobs where text is not null and text != '')"
        "     - (select count(*) from doc_fts where doc_fts match 'the')").fetchone()[0]
    # every blob with text should be reachable by FTS; 'the' is a loose lower bound, so this
    # only catches a wholesale index/content divergence, not a single missing row.
    assert unindexed < 0.15 * con.execute(
        "select count(*) from blobs where text is not null").fetchone()[0], \
        f"FTS index looks detached from blobs.text (gap {unindexed})"

    n_notices = con.execute("select count(*) from notices where source='mphilgeps'").fetchone()[0]
    print(f"verify OK: {n_notices} notices, "
          f"{con.execute('select count(*) from documents').fetchone()[0]} document rows, "
          f"{con.execute('select count(*) from blobs').fetchone()[0]} blobs, "
          "all cross-table invariants hold")
    return 0


def retry(con):
    """Requeue transient extract failures: reset the blob, and its document rows, to pending
    so the next download refetches the bytes and the next extract has another go."""
    marks = ",".join("?" * len(RETRYABLE_EXTRACT))
    bad = con.execute(f"select blob_id, sha256, extract_status, extract_note from blobs"
                      f" where extract_status in ({marks})", RETRYABLE_EXTRACT).fetchall()
    docs = con.execute(
        "select doc_id from documents where parent_doc_id is null"
        f" and extract_status = 'fetch_failed' and fetch_errors < {A.MAX_FETCH_ERRORS}"
    ).fetchall()
    print(f"retry: {len(bad)} blobs with a retryable extract_status, "
          f"{len(docs)} documents with a non-retired fetch failure")
    for blob_id, sha, st, note in bad:
        print(f"  blob {blob_id} {sha[:12]} {st}: {note}")
        con.execute("update documents set blob_id=null, sha256=null, extract_status='pending',"
                    " extract_note=null, fetch_errors=0 where blob_id=?", (blob_id,))
        con.execute("delete from blobs where blob_id=?", (blob_id,))
    for (doc_id,) in docs:
        con.execute("update documents set extract_status='pending' where doc_id=?", (doc_id,))
    con.commit()
    if bad or docs:
        A.download(con, None, A.WORKERS, False)
        A.extract(con)
    return len(bad) + len(docs)


# ------------------------------------------------------------------------------ selfcheck

def selfcheck():
    # 1. abc descending dominates everything else
    rows = [(1, 100.0, "2026-01-01"), (2, 900.0, "2026-01-01"), (3, 500.0, "2026-12-31")]
    assert order_ids(rows) == [2, 3, 1], order_ids(rows)

    # 2. within an equal abc, the furthest-out closing date wins
    rows = [(1, 5.0, "2026-08-10"), (2, 5.0, "2026-09-30"), (3, 5.0, "2026-08-20")]
    assert order_ids(rows) == [2, 3, 1], order_ids(rows)

    # 3. null abc sorts after every ranked notice, however small
    rows = [(1, None, "2026-12-31"), (2, 0.01, "2026-08-09")]
    assert order_ids(rows) == [2, 1], order_ids(rows)

    # 4. null closing sorts after a dated one at the same abc (a closed/zombie notice is
    #    the least useful thing to spend a fetch on)
    rows = [(1, 5.0, None), (2, 5.0, "2026-08-09")]
    assert order_ids(rows) == [2, 1], order_ids(rows)

    # 5. id descending is the tiebreak when abc and closing are both equal
    rows = [(7, 5.0, "2026-08-09"), (9, 5.0, "2026-08-09"), (8, 5.0, "2026-08-09")]
    assert order_ids(rows) == [9, 8, 7], order_ids(rows)

    # 6. `done` is excluded, and does not perturb the order of what is left
    rows = [(1, 300.0, "2026-01-01"), (2, 200.0, "2026-01-01"), (3, 100.0, "2026-01-01")]
    assert order_ids(rows, {2}) == [1, 3], order_ids(rows, {2})
    assert order_ids(rows, {1, 2, 3}) == []

    # 7. total order is stable: sorting an already-sorted list is a no-op (so resuming
    #    mid-run cannot reshuffle the tail and re-fetch notices in a different order)
    rows = [(i, float(i % 7) * 1000, f"2026-08-{1 + i % 28:02d}") for i in range(1, 200)]
    once = order_ids(rows)
    twice = order_ids([(i, dict((r[0], r[1]) for r in rows)[i],
                        dict((r[0], r[2]) for r in rows)[i]) for i in once])
    assert once == twice, "ordering is not idempotent"
    assert len(once) == len(rows) == len(set(once)), "ordering dropped or duplicated ids"

    # 8. the real corpus orders without exception, is complete, and starts with the biggest
    #    contract on the board
    if os.path.exists(A.TENDERS):
        rows = priority_rows()
        ids = order_ids(rows)
        assert len(ids) == len(rows) == 4288, (len(ids), len(rows))
        abcs = dict((r[0], r[1]) for r in rows)
        ranked = [abcs[i] for i in ids if abcs[i] is not None]
        assert ranked == sorted(ranked, reverse=True), "real corpus not in descending ABC"
        assert len(ranked) == 4261, len(ranked)
        head = [abcs[i] for i in ids[:3]]
        print(f"  corpus: {len(ids)} notices, top-3 ABC {[f'{a:,.0f}' for a in head]}, "
              f"{len(rows)-len(ranked)} null-abc sorted last")

    # 9. retryable set does not contain a real finding or a cap (requeueing those would
    #    either destroy evidence or spin forever)
    for s in ("no_text_layer", "too_large", "skipped_cap", "ok", "pending"):
        assert s not in RETRYABLE_EXTRACT, s

    print("docs_run selfcheck OK")
    return 0


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    flags = {a.split("=")[0]: (a.split("=")[1] if "=" in a else True)
             for a in argv if a.startswith("--")}
    cmd = args[0] if args else "plan"
    if cmd == "test":
        return selfcheck()
    if cmd == "plan":
        n = int(flags.get("--notices", 20))
        rows = priority_rows()
        con = A.db()
        ids = order_ids(rows, done_ids(con))
        con.close()
        meta = {r[0]: r for r in rows}
        print(f"{len(ids)} notices still to do; head of the priority order:")
        for i in ids[:n]:
            _, abc, closing = meta[i]
            print(f"  {i:>6}  ABC {('' if abc is None else f'{abc:>18,.2f}'):>18}  "
                  f"closes {closing}")
        return 0
    con = A.db()
    try:
        if cmd == "run":
            run(con, int(flags.get("--batch", 200)),
                int(flags["--notices"]) if "--notices" in flags else None,
                int(flags.get("--workers", A.WORKERS)),
                bool(flags.get("--keep-blobs")))
        elif cmd == "retry":
            retry(con)
        elif cmd == "repair":
            repair(con)
        elif cmd == "verify":
            verify(con)
        else:
            sys.exit(f"unknown command {cmd!r}; see the docstring")
    finally:
        con.close()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
