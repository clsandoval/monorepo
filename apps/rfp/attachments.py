#!/usr/bin/env python3
"""mPhilGEPS bid-document downloader + text extractor.  Owns `docs.db` and `blobs/`.

    python3 attachments.py test                  # assert-based selfcheck, no network
    python3 attachments.py discover [N] [SEED]   # enumerate doc URLs for N notices (metadata only)
    python3 attachments.py download [--limit N]  # fetch pending files, content-addressed by sha256
    python3 attachments.py extract  [--limit N]  # pdftotext/OOXML/zip -> text, then drop the blob
    python3 attachments.py stats
    python3 attachments.py pilot N [SEED]        # discover+download+extract N notices, then report
    python3 attachments.py run [--batch 400]     # download/extract alternating, bounded peak disk
    python3 attachments.py report                # the pilot report against the current db

Flags: --keep-blobs (never delete a downloaded file), --workers K (<=6 for fetch), --seed S.

------------------------------------------------------------------------------------------
PILOT, MEASURED 2026-08-08: 200 mPhilGEPS notices, random seed 2026 (deliberately NOT
docs_census's seed 11, so this is an independent check of that census rather than an echo).
Every number is a count out of docs.db.

  200/200 notices discovered, 0 gated shells, 0 ref mismatches, 0 zero-document notices
  506 documents discovered (2.53/notice; median 1, p90 5, max 29)
  506/506 downloaded, 0 fetch failures, 0 caps tripped, 862.9 MB in 148.6 s
      = 5.81 MB/s and 3.41 files/s at concurrency 6.  Zero 429s, zero 5xx.
  482 distinct sha256 -> DEDUP 4.7% (24 of 506 fetches were bytes already stored).  The most
      reused file is "Sworn Affidavit of Eligibility and Beneficial Ownership.pdf", 0.91 MB,
      attached to 4 different notices; 20 shas are shared across notices.
  482/482 extracted in 35.4 s at 4 workers (73 ms/blob) -> 28.51 M chars
  extract_status: ok 338, no_text_layer 144.  Nothing else -- no partial, corrupt, encrypted,
      too_large or unsupported in 482 files.  (Per document row: ok 345, no_text_layer 161.)
  formats: pdf 461, docx 15, zip 3, jpg 2, xlsx 1.  19 archive members, all docx, all ok.
  15,506 PDF pages: 13,221 text, 1,805 image-only (11.6%), 480 blank dividers.
  142 of 461 PDFs (30.8%) have NO text layer at all.
  NOTICE level, which is what ranking cares about: 174/200 notices (87%) have >=1
      text-extractable document; 26 (13%) are unreadable without OCR/vision.  Median
      171,969 chars per notice (~43K tokens) -- whole-attachment-in-prompt does not scale.
  51/200 notices (25.5%) carry a post-posting upload (123 of 506 files): a free "this notice
      changed after publication" signal.

  Corrections this pilot makes to earlier recon:
  - notice-level OCR need is 13%, not 37% (n=200 vs n=30).  File-level is 30.8%, not 38-46%.
  - bytes/notice mean 4.31 MB, not 4.74 (median 1.65, p95 19.88, max 48.40) -> the projection
    lands at 18.5 GB, inside the census's 17.0-24.2 GB bootstrap CI.
  - JPEG needed handling extract_lib does not have; see sniff_image().  Without it a CamScanner
    photo of a purchase request is filed `not_a_document` and its blob DELETED -- losing exactly
    the pages a future vision pass would want.

  EXTRAPOLATION to all 4,288 mPhilGEPS notices (x21.44): ~10,849 documents, 18.5 GB fetched,
  611 M chars -> docs.db ~0.8 GB, ~7.0 GB of retained scanned blobs, steady state ~7.8 GB.
  1.3 hours wall clock at concurrency 6 (0.21 h discover + 0.88 h download + 0.21 h extract).
  Under both the 40 GB and 10 h thresholds, so no prioritised subset is required.  But peak
  blob disk is 17.8 GB against the 20 GB cap if you download everything before extracting --
  use `run --batch 400`, which extracts as it goes and keeps the peak near 1 GB.

------------------------------------------------------------------------------------------
WHICH SYSTEM THIS COVERS, AND WHY THE OTHER ONE IS NOT BUILT

mPhilGEPS (philgeps.gov.ph)  -> BUILT.  Documents are fully public static files: 963/963
  HEADs returned 200 + Content-Length with no cookie.  The only "gate" is a request header:
  GET /Tenders/tender_doc_view/{id}/{id} WITHOUT `X-Requested-With: XMLHttpRequest` returns a
  constant 21,484-byte CakePHP layout shell containing "Your session has been expired, please
  login in again to continue." for EVERY id -- 200, zero rows.  With the header it returns the
  real 1.2-4.7 KB partial.  A crawler that read the bare response as auth would conclude the
  whole corpus is paywalled.  `parse_docview()` therefore treats that string as a FETCH ERROR,
  never as "this notice has no documents" (see `selfcheck`).

legacy PhilGEPS 1.5 (notices.philgeps.gov.ph) -> BLOCKED, recorded, not attempted.  Documents
  are not URLs: `SplashBidSupplementViewUI.aspx` renders the document grid inside an HTML
  comment, and every document name is a `javascript:__doPostBack('dgDocs$ctl02$ctl01','')`
  target with no file href anywhere in the served markup (measured in `legacy_docs_probe.py`;
  `lbtnOrder` is likewise a postback and the abstract page's "Order" link is
  `javascript:showAlert('')`).  Retrieval requires a supplier session, which is out of bounds.
  What IS public and already harvested there is metadata: assoc-component count, supplement
  title/type/published date, and per-document name/type/content-class/paper-format.  So legacy
  attachments are a `source='legacy'` hole in this DB by design; partial coverage is accepted.
  4,288 of 22,068 notices (19.4%) are therefore in scope for text extraction.

------------------------------------------------------------------------------------------
SCHEMA DEVIATION FROM NOTES-extract.md §5, DELIBERATE

NOTES puts text and fetch state in one `documents` table with
`create unique index doc_sha on documents(sha256) where parent_doc_id is null`.  That index
makes cross-notice duplication *unrepresentable*: BAC offices reuse the same eligibility
forms, checklists and PBD boilerplate endlessly, so the same bytes arrive under two notices at
two URLs -- and the second insert would be rejected rather than deduped.  Split in two:

  blobs      one row per distinct sha256: bytes, fmt, page classification, text.  Extracted ONCE.
  documents  one row per (source, notice_id, url, member_path) edge -> blob_id.  Fetch state.

FTS5 external-content lives on `blobs` (text indexed once per distinct file, not once per
notice that attached it).  `notice_docs` view preserves the per-notice rollup NOTES specifies.
Everything else is NOTES verbatim: `porter unicode61 remove_diacritics 2`, no `tokenchars`
(measured: `tokenchars '-_/.'` loses 38% of `"bill of quantities"` matches), external content
(1.24x text vs 2.24x for default fts5), per-page text/scan/blank counts rather than a boolean.

Archive members get metadata-only rows (fmt, bytes, status, chars) with `blob_id is null`.
Their text is already inside the container blob's text, `--- name` delimited, so a member row
carrying its own copy would double both the text column and the FTS index for zero recall.
------------------------------------------------------------------------------------------
"""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
import random
import re
import shutil
import sqlite3
import statistics
import sys
import time
import urllib.error
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor

import docs_census as census          # parse_docview / norm_url / human_name: measured, selfchecked
import extract_lib as ex              # sniff/pdftotext/ooxml/zip primitives: measured, selfchecked

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, "docs.db")
BLOBS = os.path.join(HERE, "blobs")
TENDERS = os.path.join(HERE, "tenders.db")           # READ-ONLY input, never written
BASE = "https://philgeps.gov.ph"
DOCVIEW = BASE + "/Tenders/tender_doc_view/{0}/{0}"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0 Safari/537.36")

# --- politeness / guardrails.  Every value is justified in NOTES-extract.md §6. -------------
WORKERS = 6                  # global budget: never above 6 concurrent requests to philgeps
EXTRACT_WORKERS = 4          # local subprocesses, no network
MAX_FETCH_ERRORS = 3         # retire, exactly as ingest.py does for the 12 permanent HTTP 500s
BACKOFF = (5, 12, 30)        # seconds on 429/5xx, by attempt
FILE_BYTES_MAX = ex.FILE_BYTES_MAX          # 25 MB = 2.5x PhilGEPS's own 10 MB uploader ceiling
NOTICE_DOC_MAX = 40         # top-level documents downloaded per notice.  NOTES says the platform
                            # rule is "1 file per notice", but the measurement contradicts it:
                            # median 2, p90 4, max 21 over 1,200 notices (supplements/corrigenda
                            # get their own uploads).  40 is ~2x the observed max.
                             # hard stop on docs.db + retained blobs, checked before each batch.
                             # This is a RUNAWAY DETECTOR, not a storage budget -- tripping it
                             # marks documents `skipped_cap`, which truncates the tail of the
                             # corpus.  20 GiB was sized against a random 200-notice sample
                             # (8.6 GB retained projected).  A descending-ABC full run front-loads
                             # the scan-heavy big-ticket notices (measured: 24.5 MB retained per
                             # notice in the ABC>=P200M band vs 0.70 MB in the <P1M band), so the
                             # projection's error bars matter.  Override to keep the cap a detector
                             # instead of a silent truncator:  RFP_DISK_MAX_GIB=60 python3 ...
DISK_MAX = int(os.environ.get("RFP_DISK_MAX_GIB", "60")) * 1024**3
# Raised 20 -> 60 GiB 2026-08-09. The host has 329 GB free, so 20 GiB was not a storage
# constraint, it was a sample-derived guess that would have switched the component off in ~18 days.
# The cap stays a runaway detector; it is just set above the real projection now.

# Retention. 96% of retained bytes are scanned engineering drawings -- 26 MB plan sheets at 72-150
# ppi that carry no text layer, cannot OCR (tesseract needs ~300 ppi) and contribute nothing to
# search. Keeping them was for "a future vision pass" that has no owner and no date. Keep the small
# documents where the eligibility signal actually lives (Terms of Reference, Bills of Quantities)
# and drop the big rasters after their text is out. Set 0 to retain nothing.
RETAIN_MAX_BYTES = int(os.environ.get("RFP_RETAIN_MAX_MB", "4")) * 1024**2
HTTP_TIMEOUT = 180

# extract_status: extract_lib's closed vocabulary plus three states that only exist once there
# is a database and a network in front of it.  A cap that trips must be VISIBLE -- a silently
# truncated corpus reads as "we got everything".
DOC_STATUSES = ex.STATUSES | {
    "pending",       # discovered (or downloaded), not yet extracted
    "fetch_failed",  # HTTP fetch failed; fetch_errors incremented, retired at MAX_FETCH_ERRORS
    "skipped_cap",   # a guardrail refused it.  extract_note carries which cap and its value.
}

SCHEMA = """
pragma journal_mode = wal;

-- content-addressed store: one row per distinct sha256, extracted exactly once
create table if not exists blobs (
  blob_id integer primary key,
  sha256 text not null unique,   -- of the fetched bytes
  bytes integer,
  fmt text,                      -- pdf docx xlsx zip rar rtf ole txt html unknown
  pages integer,
  text_pages integer,            -- >= 100 non-space chars
  scan_pages integer,            -- image-only: the OCR-would-be-needed count
  blank_pages integer,           -- section dividers; benign, tracked so they aren't scans
  sheets integer,
  extract_status text not null,
  extract_note text,
  chars integer,
  text text,
  names text,                    -- distinct human filenames seen for these bytes (FTS column)
  blob_path text,                -- retained file on disk; null once deleted after extraction
  first_seen text,
  extracted_at text
);

-- one row per notice<->document edge.  N notices can point at one blob.
create table if not exists documents (
  doc_id integer primary key,
  notice_id integer not null,
  source text not null check (source in ('mphilgeps','legacy')),
  url text not null,
  filename text,                 -- basename as served (carries the upload-epoch prefix)
  human_name text,               -- prefix stripped
  seq integer,                   -- Sr.No. in the doc_view listing
  uploaded text,                 -- upload date as displayed
  is_supplement integer,         -- 1 = uploaded after original posting (8-hex filename prefix)
  parent_doc_id integer references documents(doc_id),   -- archive member -> its container
  member_path text,              -- path inside the archive; null at top level
  blob_id integer references blobs(blob_id),
  sha256 text,
  bytes integer,
  chars integer,                 -- members only; top level reads blobs.chars
  fmt text,
  extract_status text not null default 'pending',
  extract_note text,
  fetch_status integer,
  fetch_errors integer not null default 0,
  fetched_at text,
  discovered_at text
);

-- table-level UNIQUE cannot hold an expression, so idempotency is an index
create unique index if not exists doc_ident
  on documents(source, notice_id, url, coalesce(member_path,''));
create index if not exists doc_notice on documents(source, notice_id);
create index if not exists doc_status on documents(extract_status);
create index if not exists doc_blob   on documents(blob_id);

-- discovery state per notice, so `discover` is resumable and a gated shell is retried, not
-- recorded as "zero documents"
create table if not exists notices (
  source text not null,
  notice_id integer not null,
  n_docs integer,
  status text,                   -- ok | gated | http_error | ref_mismatch | empty
  http_status integer,
  fetch_errors integer not null default 0,
  discovered_at text,
  primary key (source, notice_id)
);

create table if not exists skips (       -- every cap trip, permanently, with its reason
  at text, source text, notice_id integer, url text, cap text, detail text
);

create virtual table if not exists doc_fts using fts5(
  text, names,
  content='blobs', content_rowid='blob_id',
  tokenize="porter unicode61 remove_diacritics 2"
);

create trigger if not exists blob_ai after insert on blobs begin
  insert into doc_fts(rowid, text, names) values (new.blob_id, new.text, new.names);
end;
create trigger if not exists blob_ad after delete on blobs begin
  insert into doc_fts(doc_fts, rowid, text, names)
    values('delete', old.blob_id, old.text, old.names);
end;
create trigger if not exists blob_au after update on blobs begin
  insert into doc_fts(doc_fts, rowid, text, names)
    values('delete', old.blob_id, old.text, old.names);
  insert into doc_fts(rowid, text, names) values (new.blob_id, new.text, new.names);
end;

-- per-notice rollup so the ranking layer never aggregates document rows itself
create view if not exists notice_docs as
select d.source, d.notice_id,
       count(*)                                     as n_docs,
       sum(coalesce(b.bytes, d.bytes))              as bytes,
       sum(coalesce(b.chars, d.chars))              as chars,
       sum(b.pages)                                 as pages,
       sum(b.text_pages)                            as text_pages,
       sum(b.scan_pages)                            as scan_pages,
       sum(case when d.extract_status='ok' then 1 else 0 end) as n_ok,
       max(d.is_supplement)                         as has_supplement,
       group_concat(distinct d.extract_status)      as statuses
from documents d left join blobs b using (blob_id)
where d.parent_doc_id is null
group by d.source, d.notice_id;
"""


def db(path=DB):
    con = sqlite3.connect(path, timeout=60)
    con.executescript(SCHEMA)
    return con


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())


# ---------------------------------------------------------------------------------- parsers
# Small additions to what docs_census already selfchecks.  Both are asserted below.

REFNO = re.compile(r"Notice Reference Number:\s*</b>\s*(\d+)", re.I)
SUPPLEMENT = re.compile(r"^\d{9,12}_[0-9a-f]{8}_")


def parse_ref(html: str):
    """The notice id the partial actually rendered, or None.

    Paid for on the legacy pager: a response that looks like data but came from another
    request is the worst failure class, because every row is individually plausible.  The
    doc_view partial states its own notice number, so verify it against the id requested and
    treat a mismatch as an error rather than as that notice's documents.
    """
    m = REFNO.search(html or "")
    return int(m.group(1)) if m else None


def is_supplement(filename: str) -> bool:
    """A `<unixts>_<8 hex>_` prefix means the file was uploaded AFTER original posting -- bid
    bulletins, pre-bid minutes, revised plans.  26.5% of notices carry at least one, which is a
    free "this notice changed after publication" signal."""
    return bool(SUPPLEMENT.match(os.path.basename(filename or "")))


def basename_of(url: str) -> str:
    return os.path.basename(urllib.parse.urlsplit(url).path) if url else ""


# Only the formats a document scanner actually emits.  Deliberately NOT bmp/gif: their magic
# is 2-4 printable bytes and would misfile plain text, and neither is in PhilGEPS's allowed
# upload list.
IMAGE_MAGIC = ((b"\xff\xd8\xff", "jpg"), (b"\x89PNG\r\n\x1a\n", "png"),
               (b"II*\x00", "tiff"), (b"MM\x00*", "tiff"))


def sniff_image(head: bytes):
    """extract_lib.sniff() has no image branch, so a phone photo of a purchase request comes
    back fmt='unknown' -> status='not_a_document' -> blob deleted as garbage.  MEASURED in the
    200-notice pilot: 2 of 506 files (0.4%) are CamScanner JPEGs, and they are precisely the
    population NOTES-extract.md §2 says to RETAIN for a future vision pass.  An image file is a
    scan with no text layer -- a finding.  It is not "not a document"."""
    for magic, fmt in IMAGE_MAGIC:
        if head.startswith(magic):
            return fmt
    return None


# ------------------------------------------------------------------------------------- http

def _req(url, method="GET", xhr=True):
    h = {"User-Agent": UA, "Accept": "*/*"}
    if xhr:
        # THE gate.  Not a cookie, not a referer.  See the module docstring.
        h["X-Requested-With"] = "XMLHttpRequest"
    return urllib.request.Request(url, method=method, headers=h)


def _retryable(code):
    return code in (429, 500, 502, 503, 504)


def fetch_text(url, tries=3):
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(_req(url), timeout=HTTP_TIMEOUT) as r:
                return r.status, r.read().decode("utf-8", "replace"), ""
        except urllib.error.HTTPError as e:
            if _retryable(e.code) and attempt < tries - 1:
                time.sleep(BACKOFF[attempt] + random.random())
                continue
            return e.code, "", f"HTTP {e.code}"
        except Exception as e:                                        # noqa: BLE001
            if attempt < tries - 1:
                time.sleep(BACKOFF[attempt] + random.random())
                continue
            return -1, "", f"{type(e).__name__}: {e}"[:200]


def fetch_file(url, dest, cap=FILE_BYTES_MAX, tries=3):
    """Stream to `dest`, hashing as we go.  -> (http_status, nbytes, sha256, verdict, note).

    Refuses oversize on the Content-Length header BEFORE reading a body, and again while
    streaming for responses that omit it.
    """
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(_req(url), timeout=HTTP_TIMEOUT) as r:
                cl = r.headers.get("Content-Length")
                if cl and cl.isdigit() and int(cl) > cap:
                    return r.status, int(cl), None, "too_large", \
                        f"Content-Length {int(cl)} > per-file cap {cap}"
                h, n, over = hashlib.sha256(), 0, False
                with open(dest, "wb") as fh:
                    while True:
                        chunk = r.read(1 << 16)
                        if not chunk:
                            break
                        n += len(chunk)
                        if n > cap:
                            over = True
                            break
                        h.update(chunk)
                        fh.write(chunk)
                if over:
                    os.unlink(dest)
                    return r.status, n, None, "too_large", f"body exceeded per-file cap {cap}"
                return r.status, n, h.hexdigest(), "ok", ""
        except urllib.error.HTTPError as e:
            if _retryable(e.code) and attempt < tries - 1:
                time.sleep(BACKOFF[attempt] + random.random())
                continue
            return e.code, 0, None, "fetch_failed", f"HTTP {e.code}"
        except Exception as e:                                        # noqa: BLE001
            if attempt < tries - 1:
                time.sleep(BACKOFF[attempt] + random.random())
                continue
            return -1, 0, None, "fetch_failed", f"{type(e).__name__}: {e}"[:200]


import urllib.parse  # noqa: E402  (kept next to basename_of, its only use)


# --------------------------------------------------------------------------------- discover

def notice_ids(con, n=None, seed=2026, ids=None):
    """Notices still needing discovery, newest-first by ABC when prioritising.

    Sampling is a fresh seed (2026) rather than docs_census's seed 11 on purpose: an
    independent sample lets the pilot CHECK the census's 4.74 MB/notice mean instead of
    inheriting it.
    """
    if ids:
        return list(ids)
    ro = sqlite3.connect(f"file:{TENDERS}?mode=ro", uri=True)   # READ-ONLY, uri=True required
    all_ids = [r[0] for r in ro.execute(
        "select id from tenders where enriched_at is not null")]
    ro.close()
    done = {r[0] for r in con.execute(
        "select notice_id from notices where source='mphilgeps'"
        f" and (status not in ('http_error','gated','ref_mismatch') or fetch_errors >= {MAX_FETCH_ERRORS})")}
    todo = [i for i in all_ids if i not in done]
    random.Random(seed).shuffle(todo)
    return todo[:n] if n else todo


def discover(con, n=200, seed=2026, ids=None, workers=WORKERS):
    todo = notice_ids(con, n, seed, ids)
    print(f"discover: {len(todo)} notices (concurrency {min(workers, WORKERS)})", flush=True)
    if not todo:
        return 0

    def one(i):
        st, body, err = fetch_text(DOCVIEW.format(i))
        docs, gated = census.parse_docview(body)
        ref = parse_ref(body)
        if st != 200:
            return i, "http_error", st, [], err
        if gated and not docs:
            # the 21,484-byte layout shell.  NOT zero documents -- retry it.
            return i, "gated", st, [], f"session-expired shell, {len(body)} bytes"
        if ref is not None and ref != i:
            return i, "ref_mismatch", st, [], f"partial rendered notice {ref}, requested {i}"
        return i, ("ok" if docs else "empty"), st, docs, ""

    found = ndocs = 0
    with ThreadPoolExecutor(min(workers, WORKERS)) as pool:
        for k, (i, status, st, docs, note) in enumerate(pool.map(one, todo), 1):
            if status in ("http_error", "gated", "ref_mismatch"):
                con.execute(
                    "insert into notices(source,notice_id,status,http_status,fetch_errors,"
                    "discovered_at) values('mphilgeps',?,?,?,1,?)"
                    " on conflict(source,notice_id) do update set"
                    " status=excluded.status, http_status=excluded.http_status,"
                    " fetch_errors=fetch_errors+1, discovered_at=excluded.discovered_at",
                    (i, status, st, now()))
                print(f"  notice {i}: {status} ({note})", file=sys.stderr)
            else:
                con.execute(
                    "insert into notices(source,notice_id,n_docs,status,http_status,discovered_at)"
                    " values('mphilgeps',?,?,?,?,?)"
                    " on conflict(source,notice_id) do update set"
                    " n_docs=excluded.n_docs, status=excluded.status,"
                    " http_status=excluded.http_status, discovered_at=excluded.discovered_at",
                    (i, len(docs), status, st, now()))
                for d in docs:
                    fn = basename_of(d["url"]) or d["name"]
                    con.execute(
                        "insert or ignore into documents(notice_id,source,url,filename,human_name,"
                        "seq,uploaded,is_supplement,discovered_at,extract_status)"
                        " values(?,'mphilgeps',?,?,?,?,?,?,?, 'pending')",
                        (i, d["url"], fn, census.human_name(fn), d["seq"], d["date"],
                         int(is_supplement(fn)), now()))
                found += 1
                ndocs += len(docs)
            if k % 25 == 0:
                con.commit()
                print(f"  {k}/{len(todo)} notices, {ndocs} docs", flush=True)
    con.commit()
    print(f"discover: {found} notices ok, {ndocs} documents recorded")
    return ndocs


# --------------------------------------------------------------------------------- download

def disk_used(con):
    """Retained blob files + the database itself."""
    b = con.execute(
        "select coalesce(sum(bytes),0) from blobs where blob_path is not null").fetchone()[0]
    for suffix in ("", "-wal"):
        p = DB + suffix
        if os.path.exists(p):
            b += os.path.getsize(p)
    return b


def blob_path(sha):
    d = os.path.join(BLOBS, sha[:2], sha[2:4])
    os.makedirs(d, exist_ok=True)
    return os.path.join(d, sha + ".bin")


def log_skip(con, nid, url, cap, detail):
    con.execute("insert into skips(at,source,notice_id,url,cap,detail) values(?,'mphilgeps',?,?,?,?)",
                (now(), nid, url, cap, detail))
    print(f"  SKIP {cap}: notice {nid} {basename_of(url)[:60]} -- {detail}", file=sys.stderr)


CAP_TRIPPED = []     # a guardrail refused work: main() must exit non-zero, see alert_and_exit()


def alert(subject, detail):
    """Fire a Telegram message. Best-effort: a broken alerter must never mask the thing it warns
    about, so failure here is printed and swallowed rather than raised."""
    msg = f"rfp attachments: {subject}\n{detail}"
    print(f"ALERT {subject}: {detail}", file=sys.stderr)
    tg = os.path.expanduser("~/.claude/skills/telegram/scripts/tg.py")
    if not os.path.exists(tg):
        return
    try:
        subprocess.run([sys.executable, tg, "send_message", msg],
                       capture_output=True, timeout=60)
    except Exception as e:
        print(f"  (alert delivery failed: {e})", file=sys.stderr)


def alert_and_exit(con):
    """The whole point of this module's guardrails.

    A cap used to trip with `break` and then exit 0, so cron read 'success' while the component had
    silently stopped fetching. That is not a hypothetical: competitors.md records
    chloebellee/philgeps-scraper failing 44 consecutive scheduled runs while exiting cleanly, and
    throwing away two months of data, because nothing was watching. A guardrail that stops work
    MUST be louder than a guardrail that never fires.
    """
    if not CAP_TRIPPED:
        return 0
    used = disk_used(con) / 1024**3
    detail = "; ".join(sorted(set(CAP_TRIPPED)))
    alert("CAP TRIPPED - ingest stopped early",
          f"{detail}\ndisk in use {used:.1f} GiB of {DISK_MAX/1024**3:.0f} GiB cap\n"
          f"Documents are now INCOMPLETE and will stay incomplete until this is cleared.")
    return 3


def apply_notice_cap(con):
    """Mark documents beyond NOTICE_DOC_MAX per notice as skipped, loudly.  Discovery keeps the
    full metadata (filenames are the cheap win and cost no fetch); only the download is capped."""
    rows = con.execute(
        "select notice_id, count(*) from documents where source='mphilgeps'"
        " and parent_doc_id is null group by 1 having count(*) > ?", (NOTICE_DOC_MAX,)).fetchall()
    n = 0
    for nid, cnt in rows:
        keep = [r[0] for r in con.execute(
            "select doc_id from documents where source='mphilgeps' and notice_id=?"
            " and parent_doc_id is null order by seq, doc_id limit ?", (nid, NOTICE_DOC_MAX))]
        for doc_id, url in con.execute(
                "select doc_id, url from documents where source='mphilgeps' and notice_id=?"
                " and parent_doc_id is null and extract_status='pending'", (nid,)).fetchall():
            if doc_id in keep:
                continue
            detail = f"notice has {cnt} documents, per-notice cap {NOTICE_DOC_MAX}"
            con.execute("update documents set extract_status='skipped_cap', extract_note=?"
                        " where doc_id=?", (detail, doc_id))
            log_skip(con, nid, url, "per_notice_doc_count", detail)
            n += 1
    con.commit()
    return n


def download(con, limit=None, workers=WORKERS, keep_blobs=False):
    apply_notice_cap(con)
    # PREFLIGHT. Trip on being over cap, not merely on refusing a specific file. Otherwise a run
    # that happens to have nothing pending exits 0 while the component is in fact switched off --
    # the same silent success, one step earlier in the pipeline.
    if disk_used(con) > DISK_MAX:
        detail = (f"already over cap before starting: {disk_used(con)/1024**3:.1f} GiB > "
                  f"{DISK_MAX/1024**3:.0f} GiB")
        CAP_TRIPPED.append(detail)
        print(f"  SKIP total_disk: {detail}", file=sys.stderr)
        return {}
    todo = con.execute(
        "select doc_id, notice_id, url, human_name from documents"
        " where source='mphilgeps' and parent_doc_id is null and blob_id is null"
        f" and extract_status='pending' and fetch_errors < {MAX_FETCH_ERRORS}"
        " order by notice_id, seq" + (f" limit {int(limit)}" if limit else "")).fetchall()
    print(f"download: {len(todo)} files pending, disk in use {disk_used(con)/1024**3:.2f} GiB",
          flush=True)
    if not todo:
        return {}

    os.makedirs(os.path.join(BLOBS, "tmp"), exist_ok=True)
    tally = Counter()
    fetched_bytes = 0
    t0 = time.time()

    def one(job):
        doc_id, nid, url, name = job
        tmp = os.path.join(BLOBS, "tmp", f"{doc_id}.part")
        st, n, sha, verdict, note = fetch_file(url, tmp)
        return job, st, n, sha, verdict, note, tmp

    batch = min(workers, WORKERS)
    with ThreadPoolExecutor(batch) as pool:
        for k, (job, st, n, sha, verdict, note, tmp) in enumerate(pool.map(one, todo), 1):
            doc_id, nid, url, name = job
            # total-disk guard, checked as each batch lands (NOTES §6: a runaway detector)
            if disk_used(con) > DISK_MAX:
                detail = f"total disk {disk_used(con)/1024**3:.1f} GiB > cap {DISK_MAX/1024**3:.0f} GiB"
                con.execute("update documents set extract_status='skipped_cap', extract_note=?"
                            " where doc_id=?", (detail, doc_id))
                log_skip(con, nid, url, "total_disk", detail)
                if os.path.exists(tmp):
                    os.unlink(tmp)
                tally["skipped_cap"] += 1
                CAP_TRIPPED.append(f"total disk cap: {detail}")
                con.commit()
                break
            if verdict == "too_large":
                con.execute("update documents set extract_status='too_large', extract_note=?,"
                            " fetch_status=?, bytes=?, fetched_at=? where doc_id=?",
                            (note, st, n, now(), doc_id))
                log_skip(con, nid, url, "per_file_bytes", note)
                tally["too_large"] += 1
            elif verdict != "ok":
                con.execute("update documents set fetch_errors=fetch_errors+1, fetch_status=?,"
                            " extract_note=?, extract_status=case when fetch_errors+1 >= ?"
                            " then 'fetch_failed' else 'pending' end where doc_id=?",
                            (st, note, MAX_FETCH_ERRORS, doc_id))
                tally["fetch_failed"] += 1
                print(f"  fetch fail notice {nid} {name[:50]}: {note}", file=sys.stderr)
                if os.path.exists(tmp):
                    os.unlink(tmp)
            else:
                fetched_bytes += n
                row = con.execute("select blob_id, blob_path, extract_status, names from blobs"
                                  " where sha256=?", (sha,)).fetchone()
                if row:
                    tally["dedup"] += 1
                    blob_id, bpath, bstatus, names = row
                    if bpath and os.path.exists(bpath):
                        os.unlink(tmp)                    # identical bytes already on disk
                    elif bstatus == "pending":
                        shutil.move(tmp, blob_path(sha))   # still needs extracting
                        con.execute("update blobs set blob_path=? where blob_id=?",
                                    (blob_path(sha), blob_id))
                    else:
                        os.unlink(tmp)                     # already extracted; bytes not needed
                    hn = census.human_name(basename_of(url))
                    if hn and hn not in (names or ""):
                        con.execute("update blobs set names=? where blob_id=?",
                                    (((names + " | ") if names else "") + hn, blob_id))
                else:
                    tally["new"] += 1
                    dest = blob_path(sha)
                    shutil.move(tmp, dest)
                    con.execute(
                        "insert into blobs(sha256,bytes,extract_status,names,blob_path,first_seen)"
                        " values(?,?,'pending',?,?,?)",
                        (sha, n, census.human_name(basename_of(url)), dest, now()))
                    blob_id = con.execute("select blob_id from blobs where sha256=?",
                                          (sha,)).fetchone()[0]
                con.execute("update documents set blob_id=?, sha256=?, bytes=?, fetch_status=?,"
                            " fetched_at=? where doc_id=?", (blob_id, sha, n, st, now(), doc_id))
                # A dedup hit against a blob that was extracted in an EARLIER batch is never
                # revisited by extract() -- that only walks blobs still 'pending' -- so this
                # document row would keep extract_status='pending' forever even though its text
                # is already in the database.  Invisible in a single-pass pilot, where every
                # dedup target was still pending in the same run; real as soon as download and
                # extract alternate in batches (`run --batch`, docs_run.py).  Measured on the
                # first full run before this fix: 1,187 of 8,873 top-level rows = 13.4%, which
                # silently undercounts notice_docs.n_ok and breaks
                # `where extract_status='ok'`.  Propagate the blob's verdict now.
                bst, bfmt = con.execute(
                    "select extract_status, fmt from blobs where blob_id=?", (blob_id,)).fetchone()
                if bst != "pending":
                    con.execute("update documents set extract_status=?, fmt=? where doc_id=?",
                                (bst, bfmt, doc_id))
                tally["ok"] += 1
            if k % 25 == 0:
                con.commit()
                print(f"  {k}/{len(todo)} files, {fetched_bytes/1e6:.0f} MB, "
                      f"{tally['dedup']} dedup hits", flush=True)
    con.commit()
    dt = time.time() - t0
    tally["bytes"] = fetched_bytes
    tally["seconds"] = round(dt, 1)
    print(f"download: {dict(tally)} in {dt:.0f}s "
          f"({fetched_bytes/1e6/max(dt,1e-9):.2f} MB/s at concurrency {batch})")
    return tally


# ---------------------------------------------------------------------------------- extract

def extract(con, limit=None, workers=EXTRACT_WORKERS, keep_blobs=False):
    todo = con.execute(
        "select blob_id, sha256, blob_path, bytes from blobs where extract_status='pending'"
        " and blob_path is not null"
        + (f" limit {int(limit)}" if limit else "")).fetchall()
    print(f"extract: {len(todo)} blobs pending", flush=True)
    if not todo:
        return {}

    def one(row):
        blob_id, sha, path, nbytes = row
        if not os.path.exists(path):
            return blob_id, sha, path, None
        try:
            with open(path, "rb") as fh:
                img = sniff_image(fh.read(16))
            if img:
                return blob_id, sha, path, ex.Extracted(
                    img, "no_text_layer", pages=1, scan_pages=1,
                    note="image file: no text layer, retained for a vision pass")
            return blob_id, sha, path, ex.extract(path)
        except Exception as e:                                        # noqa: BLE001
            return blob_id, sha, path, ex.Extracted(
                "unknown", "corrupt", note=f"{type(e).__name__}: {e}"[:200])

    tally, chars, t0 = Counter(), 0, time.time()
    with ThreadPoolExecutor(workers) as pool:
        for k, (blob_id, sha, path, e) in enumerate(pool.map(one, todo), 1):
            if e is None:
                con.execute("update blobs set extract_status='empty',"
                            " extract_note='blob file missing', blob_path=null,"
                            " extracted_at=? where blob_id=?", (now(), blob_id))
                tally["missing"] += 1
                continue
            sheets = e.text.count("\n# ") + 1 if e.fmt == "xlsx" and e.text else None
            assert e.status in DOC_STATUSES, (sha, e.status)
            con.execute(
                "update blobs set fmt=?, pages=?, text_pages=?, scan_pages=?, blank_pages=?,"
                " sheets=?, extract_status=?, extract_note=?, chars=?, text=?, extracted_at=?"
                " where blob_id=?",
                (e.fmt, e.pages, e.text_pages, e.scan_pages, e.blank_pages, sheets,
                 e.status, (e.note or None), len(e.text), e.text or None, now(), blob_id))
            con.execute("update documents set extract_status=?, fmt=? where blob_id=?",
                        (e.status, e.fmt, blob_id))
            # archive members: metadata rows only.  Their text is already in the container's
            # text column (`--- name` delimited), so a copy here would double text and index.
            for m in e.members:
                for doc_id, nid, url in con.execute(
                        "select doc_id, notice_id, url from documents where blob_id=?"
                        " and parent_doc_id is null", (blob_id,)).fetchall():
                    con.execute(
                        "insert or ignore into documents(notice_id,source,url,filename,human_name,"
                        "parent_doc_id,member_path,bytes,chars,fmt,extract_status,extract_note,"
                        "discovered_at) values(?,'mphilgeps',?,?,?,?,?,?,?,?,?,?,?)",
                        (nid, url, os.path.basename(m.name), census.human_name(
                            os.path.basename(m.name)), doc_id, m.name, m.bytes, len(m.text),
                         m.fmt, m.status, (m.note or None), now()))
                    tally["members"] += 1
            tally[e.status] += 1
            chars += len(e.text)
            # Retain only what is small enough to be worth keeping. A no-text-layer blob under
            # the threshold is still worth holding for a future vision pass; a 26 MB plan sheet is
            # not, and those are what fill the disk.
            sz = os.path.getsize(path) if os.path.exists(path) else 0
            keep = keep_blobs or (e.status == "no_text_layer"
                                  and 0 < sz <= RETAIN_MAX_BYTES)
            if not keep and os.path.exists(path):
                os.unlink(path)
                con.execute("update blobs set blob_path=null where blob_id=?", (blob_id,))
            if k % 25 == 0:
                con.commit()
                print(f"  {k}/{len(todo)} blobs, {chars/1e6:.1f} M chars", flush=True)
    con.commit()
    dt = time.time() - t0
    tally["chars"] = chars
    tally["seconds"] = round(dt, 1)
    print(f"extract: {dict(tally)} in {dt:.0f}s ({1000*dt/max(len(todo),1):.0f} ms/blob "
          f"at {workers} workers)")
    return tally


# ------------------------------------------------------------------------------------ stats

def q1(con, sql, *a):
    r = con.execute(sql, a).fetchone()
    return r[0] if r else None


def pct(xs, p):
    xs = sorted(xs)
    if not xs:
        return 0
    k = (len(xs) - 1) * p / 100
    lo, hi = int(k), min(int(k) + 1, len(xs) - 1)
    return xs[lo] + (xs[hi] - xs[lo]) * (k - lo)


def stats(con):
    print("== notices")
    for status, n in con.execute("select status, count(*) from notices group by 1 order by 2 desc"):
        print(f"  {n:>6}  {status}")
    print(f"  {q1(con, 'select count(*) from notices'):>6}  TOTAL discovered")
    print("\n== documents (top level)")
    print(f"  {q1(con, 'select count(*) from documents where parent_doc_id is null'):>6}  rows")
    print(f"  {q1(con, 'select count(*) from documents where parent_doc_id is not null'):>6}"
          "  archive members")
    for status, n in con.execute(
            "select extract_status, count(*) from documents where parent_doc_id is null"
            " group by 1 order by 2 desc"):
        print(f"  {n:>6}  {status}")
    print("\n== blobs (distinct sha256)")
    nb = q1(con, "select count(*) from blobs") or 0
    linked = q1(con, "select count(*) from documents where blob_id is not null") or 0
    print(f"  {nb:>6}  distinct blobs")
    print(f"  {linked:>6}  document rows linked to a blob")
    if linked:
        print(f"  dedup: {linked - nb} of {linked} fetches were bytes already stored"
              f" = {100*(linked-nb)/linked:.1f}%")
    print(f"  bytes fetched (distinct): {(q1(con,'select coalesce(sum(bytes),0) from blobs') or 0)/1e9:.3f} GB")
    print(f"  text extracted:           {(q1(con,'select coalesce(sum(chars),0) from blobs') or 0)/1e6:.1f} M chars")
    print(f"  blobs retained on disk:   {q1(con,'select count(*) from blobs where blob_path is not null')}")
    print(f"  disk in use:              {disk_used(con)/1024**3:.3f} GiB (cap {DISK_MAX/1024**3:.0f} GiB)")
    print("\n  by extract_status:")
    for status, n, ch, pg, sp in con.execute(
            "select extract_status, count(*), coalesce(sum(chars),0), coalesce(sum(pages),0),"
            " coalesce(sum(scan_pages),0) from blobs group by 1 order by 2 desc"):
        print(f"    {n:>6}  {status:<15} {ch/1e6:8.2f} M chars  {pg:>6} pages  {sp:>6} scan pages")
    print("\n  by fmt:")
    for fmt, n, b in con.execute(
            "select coalesce(fmt,'(unextracted)'), count(*), coalesce(sum(bytes),0)"
            " from blobs group by 1 order by 2 desc"):
        print(f"    {n:>6}  {fmt:<14} {b/1e6:8.1f} MB")
    pdfs = con.execute("select pages, text_pages, scan_pages from blobs where fmt='pdf'"
                       " and pages > 0").fetchall()
    if pdfs:
        notext = sum(1 for p, t, s in pdfs if t == 0)
        pg = sum(p for p, _, _ in pdfs)
        sc = sum(s for _, _, s in pdfs)
        print(f"\n  PDFs: {len(pdfs)}, pages {pg}")
        print(f"    no text layer at all: {notext} = {100*notext/len(pdfs):.1f}% of PDFs")
        print(f"    image-only pages:     {sc} = {100*sc/max(pg,1):.1f}% of pages")
    ns = con.execute("select count(*) from skips").fetchone()[0]
    if ns:
        print(f"\n== skips ({ns})")
        for cap, n in con.execute("select cap, count(*) from skips group by 1 order by 2 desc"):
            print(f"  {n:>6}  {cap}")


def report(con, corpus=4288):
    """Pilot report + extrapolation.  Every line is a count out of docs.db."""
    out = {}
    nn = q1(con, "select count(*) from notices where status in ('ok','empty')") or 0
    out["notices_discovered"] = nn
    out["notices_zero_docs"] = q1(con, "select count(*) from notices where status='empty'")
    out["notices_failed"] = q1(con,
                               "select count(*) from notices where status not in ('ok','empty')")
    out["docs_discovered"] = q1(
        con, "select count(*) from documents where parent_doc_id is null")
    out["docs_downloaded"] = q1(
        con, "select count(*) from documents where blob_id is not null")
    out["archive_members"] = q1(
        con, "select count(*) from documents where parent_doc_id is not null")
    out["blobs_distinct"] = q1(con, "select count(*) from blobs")
    out["blobs_extracted"] = q1(
        con, "select count(*) from blobs where extracted_at is not null")
    out["bytes_distinct"] = q1(con, "select coalesce(sum(bytes),0) from blobs")
    out["bytes_with_dupes"] = q1(
        con, "select coalesce(sum(bytes),0) from documents where parent_doc_id is null")
    out["chars"] = q1(con, "select coalesce(sum(chars),0) from blobs")
    if out["docs_downloaded"]:
        out["dedup_rate"] = round(
            100 * (out["docs_downloaded"] - out["blobs_distinct"]) / out["docs_downloaded"], 1)
    out["extract_status"] = dict(con.execute(
        "select extract_status, count(*) from blobs group by 1 order by 2 desc"))
    out["doc_status"] = dict(con.execute(
        "select extract_status, count(*) from documents where parent_doc_id is null"
        " group by 1 order by 2 desc"))
    pdfs = con.execute("select pages, text_pages, scan_pages from blobs"
                       " where fmt='pdf' and pages > 0").fetchall()
    out["pdfs"] = len(pdfs)
    out["pdfs_no_text_layer"] = sum(1 for p, t, s in pdfs if t == 0)
    out["pdf_pages"] = sum(p for p, _, _ in pdfs)
    out["pdf_scan_pages"] = sum(s for _, _, s in pdfs)
    per = [r[0] for r in con.execute(
        "select coalesce(sum(coalesce(b.bytes,d.bytes)),0) from notices n"
        " left join documents d on d.source=n.source and d.notice_id=n.notice_id"
        " and d.parent_doc_id is null left join blobs b using (blob_id)"
        " where n.status in ('ok','empty') group by n.notice_id")]
    if per:
        out["bytes_per_notice"] = {
            "median_mb": round(statistics.median(per) / 1e6, 2),
            "mean_mb": round(statistics.mean(per) / 1e6, 2),
            "p95_mb": round(pct(per, 95) / 1e6, 2),
            "max_mb": round(max(per) / 1e6, 2)}
    print(json.dumps(out, indent=1))
    return out


# -------------------------------------------------------------------------------- selfcheck

def selfcheck():
    # --- the gate that is a header, not auth.  This is THE trap on this route. -------------
    shell = ("<div class='modal'>Your session has been expired, please login in again to "
             "continue.</div>")
    docs, gated = census.parse_docview(shell)
    assert docs == [] and gated is True, "the bare shell must be flagged, not read as 0 docs"

    partial = """
    <h4 class="modal-title">Bid Notice Documents </h4>
    <tr><td colspan="3"><b>Notice Reference Number: </b>55594</td></tr>
    <tr><th>Sr.No.</th><th>Document Name</th><th>Date</th></tr>
    <tr><td>1</td><td><a href="https://philgeps.gov.ph/portal_documents/bid_notice_documents/bid_notice_55594/bid_notice_document/1786202844_RFQ_SMEDD_PR_07_141.pdf">1786202844_RFQ_SMEDD_PR_07_141.pdf</a></td><td>08-Aug-2026 11:27 PM</td></tr>
    <tr><td>2</td><td><a href="https://philgeps.gov.ph//portal_documents/bid_notice_documents/bid_notice_55594/bid_notice_document//1785398103_c0c327b6_10_SUPPLEMENTAL_PBD.pdf">1785398103_c0c327b6_10_SUPPLEMENTAL_PBD.pdf</a></td><td>28-Jul-2026 09:03 AM</td></tr>
    """
    docs, gated = census.parse_docview(partial)
    assert not gated and len(docs) == 2, docs

    # --- parse_ref: a response that rendered another notice is not this notice's documents --
    assert parse_ref(partial) == 55594, parse_ref(partial)
    assert parse_ref("<html>no refno</html>") is None, "unknown must be None, not 0"
    assert parse_ref(shell) is None

    # --- supplement detection: the free "changed after publication" signal ------------------
    assert is_supplement("1785398103_c0c327b6_10_SUPPLEMENTAL_PBD.pdf") is True
    assert is_supplement("1786202844_RFQ_SMEDD_PR_07_141.pdf") is False, "plain epoch != supplement"
    assert is_supplement("plain.pdf") is False
    assert is_supplement("") is False
    # a hex-looking WORD after the epoch is not an 8-hex hash
    assert is_supplement("1786202844_deadbeefs_x.pdf") is False
    assert is_supplement(
        "https://x/y/1785398103_c0c327b6_10_SUPPLEMENTAL_PBD.pdf") is True, "basename first"

    assert basename_of("https://h/a/b/1786202844_RFQ.pdf") == "1786202844_RFQ.pdf"
    assert basename_of("") == ""

    # --- image sniffing: a scanner photo is a scan, not "not a document" --------------------
    assert sniff_image(b"\xff\xd8\xff\xe0\x00\x10JFIF") == "jpg"
    assert sniff_image(b"\x89PNG\r\n\x1a\n\x00") == "png"
    assert sniff_image(b"II*\x00\x08") == "tiff" and sniff_image(b"MM\x00*\x00") == "tiff"
    assert sniff_image(b"%PDF-1.4") is None, "PDFs go down the poppler path, not here"
    assert sniff_image(b"BMxxxx") is None, "2-byte magic would misfile plain text"
    assert sniff_image(b"") is None
    assert ex.sniff(b"\xff\xd8\xff\xe0\x00\x10JFIF") == "unknown", (
        "this is why sniff_image exists: extract_lib has no image branch")
    assert census.human_name(basename_of(docs[1]["url"])) == "10 SUPPLEMENTAL PBD.pdf"

    # --- status vocabulary is closed and a strict superset of extract_lib's -----------------
    assert ex.STATUSES <= DOC_STATUSES
    assert {"pending", "fetch_failed", "skipped_cap"} <= DOC_STATUSES
    assert "gated" not in DOC_STATUSES, "a gated shell is a notice-level fetch error, not a status"

    # --- schema, dedupe, FTS, caps: exercised end to end on a temp db ----------------------
    import tempfile
    tmp = tempfile.mkdtemp(prefix="rfp-attach-")
    global DB, BLOBS
    real_db, real_blobs = DB, BLOBS
    DB, BLOBS = os.path.join(tmp, "docs.db"), os.path.join(tmp, "blobs")
    try:
        con = db(DB)
        # two notices attaching the SAME bytes under different URLs -- the case NOTES's
        # `unique(sha256)` on documents could not represent at all
        sha = "a" * 64
        con.execute("insert into blobs(sha256,bytes,extract_status,names,first_seen)"
                    " values(?,10,'pending','Eligibility Checklist.pdf',?)", (sha, now()))
        bid = con.execute("select blob_id from blobs where sha256=?", (sha,)).fetchone()[0]
        for nid, url in ((1, "https://x/n1/eligibility.pdf"), (2, "https://x/n2/eligibility.pdf")):
            con.execute("insert into documents(notice_id,source,url,filename,blob_id,sha256,"
                        "bytes,extract_status,discovered_at) values(?,'mphilgeps',?,?,?,?,10,"
                        "'pending',?)", (nid, url, "eligibility.pdf", bid, sha, now()))
        con.commit()
        assert q1(con, "select count(*) from documents where sha256=?", sha) == 2, \
            "two notices must be able to share one blob"
        assert q1(con, "select count(*) from blobs") == 1, "identical bytes stored once"

        # idempotency: rediscovering the same (notice,url) must not duplicate the row
        con.execute("insert or ignore into documents(notice_id,source,url,filename,"
                    "extract_status,discovered_at) values(1,'mphilgeps',"
                    "'https://x/n1/eligibility.pdf','eligibility.pdf','pending',?)", (now(),))
        con.commit()
        assert q1(con, "select count(*) from documents") == 2, "doc_ident must reject the redo"
        # ... while a distinct archive member of the same url is a different row
        con.execute("insert into documents(notice_id,source,url,member_path,parent_doc_id,"
                    "extract_status,discovered_at) values(1,'mphilgeps',"
                    "'https://x/n1/eligibility.pdf','inner/a.pdf',1,'ok',?)", (now(),))
        con.commit()
        assert q1(con, "select count(*) from documents") == 3

        # FTS5 external content over blobs: insert-then-update is the real lifecycle
        # (download inserts with text NULL, extract fills it in)
        con.execute("update blobs set text=?, chars=?, fmt='pdf', pages=2, text_pages=2,"
                    " scan_pages=0, extract_status='ok', extracted_at=? where blob_id=?",
                    ("Bill of Quantities: ITEM 804(1)b Embankment from borrow", 54, now(), bid))
        con.commit()
        assert q1(con, "select count(*) from doc_fts where doc_fts match ?",
                  '"bill of quantities"') == 1, "phrase query must work after the update trigger"
        assert q1(con, "select count(*) from doc_fts where doc_fts match 'embankment'") == 1
        assert q1(con, "select count(*) from doc_fts where doc_fts match 'checklist'") == 1, \
            "the names column is indexed too"
        # porter stemming, the free recall win NOTES measured
        assert q1(con, "select count(*) from doc_fts where doc_fts match 'quantity'") == 1
        # a code with punctuation matches as a quoted phrase (SKILL.md note)
        assert q1(con, "select count(*) from doc_fts where doc_fts match ?", '"804(1)b"') == 1

        # rollup view reaches through the join, and status propagation is visible per notice
        con.execute("update documents set extract_status='ok', fmt='pdf' where blob_id=?", (bid,))
        con.commit()
        rows = dict((r[1], r) for r in con.execute(
            "select source, notice_id, n_docs, bytes, chars, scan_pages, n_ok, statuses"
            " from notice_docs"))
        assert rows[1][2] == 1 and rows[2][2] == 1, rows
        assert rows[1][4] == 54, "chars must come through the blob join"
        assert rows[1][6] == 1 and rows[1][7] == "ok", rows[1]

        # deleting a blob must clear its FTS row (no orphan index entries)
        con.execute("delete from blobs where blob_id=?", (bid,))
        con.commit()
        assert q1(con, "select count(*) from doc_fts where doc_fts match 'embankment'") == 0

        # per-notice document cap trips, is recorded as skipped_cap, and is LOGGED
        con.execute("delete from documents")
        for i in range(NOTICE_DOC_MAX + 3):
            con.execute("insert into documents(notice_id,source,url,filename,seq,extract_status,"
                        "discovered_at) values(9,'mphilgeps',?,?,?,'pending',?)",
                        (f"https://x/9/f{i}.pdf", f"f{i}.pdf", i, now()))
        con.commit()
        n = apply_notice_cap(con)
        assert n == 3, n
        assert q1(con, "select count(*) from documents where extract_status='skipped_cap'") == 3
        assert q1(con, "select count(*) from skips where cap='per_notice_doc_count'") == 3, \
            "a silent truncation reads as 'we got everything'"
        assert q1(con, "select detail from skips limit 1").startswith("notice has 43 documents")
        assert apply_notice_cap(con) == 0, "rerunning must not re-skip or double-log"

        # read-only mode refuses a write, as the search layer will open it
        ro = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
        try:
            ro.execute("delete from documents")
            raise AssertionError("mode=ro must refuse a write")
        except sqlite3.OperationalError:
            pass
        ro.close()

        # per-file size cap: refused on the Content-Length header, before a body is read
        big = os.path.join(tmp, "big.bin")
        with open(big, "wb") as fh:
            fh.write(b"P" * 5000)
        dest = os.path.join(tmp, "out.bin")
        st, n, sha2, verdict, note = fetch_file("file://" + big, dest, cap=1000)
        assert verdict == "too_large" and sha2 is None, (verdict, note)
        assert "5000" in note and not os.path.exists(dest), (note, "no body may be written")
        # ... and under the cap it streams, hashes, and reports the true length
        st, n, sha2, verdict, note = fetch_file("file://" + big, dest, cap=1_000_000)
        assert verdict == "ok" and n == 5000, (verdict, n, note)
        assert sha2 == hashlib.sha256(b"P" * 5000).hexdigest(), "sha256 is of the fetched bytes"
        assert os.path.getsize(dest) == 5000

        # the real extractor still agrees with us about a scanned PDF: rc=0, zero chars,
        # status no_text_layer.  A clean exit code proves nothing.
        scan = os.path.join(tmp, "scan.pdf")
        ex._min_pdf_image_only(scan)
        e = ex.extract(scan)
        assert e.status == "no_text_layer" and e.text_pages == 0 and e.scan_pages == 1, e
        assert e.status in DOC_STATUSES
        con.close()
    finally:
        DB, BLOBS = real_db, real_blobs
        shutil.rmtree(tmp, ignore_errors=True)

    print("attachments selfcheck OK")
    return True


# ------------------------------------------------------------------------------------- main


def retain(con, dry=False):
    """Drop retained blob files above RETAIN_MAX_BYTES; keep the extracted text.

    Only `no_text_layer` blobs are ever retained in the first place, and above a few MB those are
    scanned engineering drawings: 72-150 ppi rasters against tesseract's ~300 ppi floor, so they
    cannot be OCR'd, and the pages that do carry text carry universal boilerplate. They were held
    for "a future vision pass" with no owner and no date, while being 96% of the bytes on disk.

    Text already lives in blobs.text, so this is not data loss for search -- it forfeits only the
    ability to re-process the original raster locally. The URL is still recorded, so any blob can
    be re-fetched on demand.
    """
    rows = con.execute(
        "select blob_id, blob_path, bytes from blobs where blob_path is not null and bytes > ?",
        (RETAIN_MAX_BYTES,)).fetchall()
    freed = gone = 0
    for blob_id, path, nbytes in rows:
        if dry:
            freed += nbytes
            continue
        if path and os.path.exists(path):
            try:
                os.unlink(path)
            except OSError as e:
                print(f"  could not unlink {path}: {e}", file=sys.stderr)
                continue
        con.execute("update blobs set blob_path=null where blob_id=?", (blob_id,))
        freed += nbytes
        gone += 1
    if not dry:
        con.commit()
    print(f"retain: {'would free' if dry else 'freed'} {freed/1e9:.2f} GB across "
          f"{len(rows) if dry else gone} blobs over {RETAIN_MAX_BYTES/1024**2:.0f} MB; "
          f"disk now {disk_used(con)/1024**3:.2f} GiB of {DISK_MAX/1024**3:.0f} GiB cap")
    return {"freed": freed, "blobs": gone}


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    flags = {a.split("=")[0]: (a.split("=")[1] if "=" in a else True)
             for a in argv if a.startswith("--")}
    cmd = args[0] if args else "stats"
    keep = bool(flags.get("--keep-blobs"))
    workers = int(flags.get("--workers", WORKERS))
    limit = int(flags["--limit"]) if "--limit" in flags else None
    seed = int(flags.get("--seed", args[2] if len(args) > 2 else 2026))

    if cmd == "test":
        return selfcheck()
    con = db()
    if cmd == "discover":
        discover(con, int(args[1]) if len(args) > 1 else 200, seed, workers=workers)
    elif cmd == "download":
        download(con, limit, workers, keep)
        return alert_and_exit(con)
    elif cmd == "extract":
        extract(con, limit, keep_blobs=keep)
    elif cmd == "pilot":
        n = int(args[1]) if len(args) > 1 else 200
        t0 = time.time()
        discover(con, n, seed, workers=workers)
        d = download(con, limit, workers, keep)
        x = extract(con, keep_blobs=keep)
        print(f"\npilot wall clock {time.time()-t0:.0f}s "
              f"(download {d.get('seconds')}s, extract {x.get('seconds')}s)")
        report(con)
        return alert_and_exit(con)
    elif cmd == "run":
        # Alternate download/extract in batches so peak disk stays bounded.  The full-corpus
        # projection is 17.8 GB of blobs against a 20 GB cap, so "download everything then
        # extract" would trip the cap; extracting as you go keeps steady state at ~8 GB.
        batch = int(flags.get("--batch", 400))
        while True:
            d = download(con, batch, workers, keep)
            extract(con, keep_blobs=keep)
            if not d.get("ok") and not d.get("dedup"):
                break
            if CAP_TRIPPED:      # stop the loop too: it cannot make progress past a cap
                break
        stats(con)
        return alert_and_exit(con)
    elif cmd == "retain":
        retain(con, dry=bool(flags.get("--dry-run")))
    elif cmd == "report":
        report(con)
    else:
        stats(con)
    con.close()


if __name__ == "__main__":
    # main() returns 3 when a guardrail stopped work. Propagate it: the entire point is that cron
    # must NOT read a truncated run as success.
    sys.exit(main(sys.argv[1:]) or 0)
