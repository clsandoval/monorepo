#!/usr/bin/env python3
"""PhilGEPS open-tender ingest + enrichment.

    python3 ingest.py            # ingest new listings, then enrich anything not yet enriched
    python3 ingest.py ingest     # listings only
    python3 ingest.py backfill   # every listing page, insert-or-ignore (first/repair run)
    python3 ingest.py enrich     # detail pages only
    python3 ingest.py stats
    python3 ingest.py test       # parser regression asserts, no network

Listing gives ref/title/mode/classification/agency/publish/closing.
Detail page gives ABC + funding + location + category + description + line items and more,
all as <label>Name:</label>value pairs -- no LLM needed to extract them.
"""
import html
import re
import sqlite3
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

DB = Path(__file__).parent / "tenders.db"
LIST = "https://philgeps.gov.ph/indexes/view-more-open-tenders?page={}&direction=Tenders.id+desc"
DETAIL = "https://philgeps.gov.ph/Indexes/viewLiveTenderDetails/{}/OPEN_MORE"
UA = "Mozilla/5.0 (rfp-finder; +philgeps ingest)"
MAX_PAGES = 250  # 215 pages of 20 at 4.3k notices; guard against a pagination loop
WORKERS = 8  # be polite to philgeps.gov.ph
MAX_FETCH_ERRORS = 3  # 12 notices serve a permanent HTTP 500; stop requeueing them

SCHEMA = """
create table if not exists tenders (
  id integer primary key,
  -- listing
  title text, mode text, classification text, agency text,
  publish text, closing text,            -- raw display strings, as scraped
  publish_at text, closing_at text,      -- ISO, for sorting and date filters
  mode_norm text generated always as (lower(trim(mode))) virtual,
  seen_at text,
  -- detail
  abc real,                              -- notice total (multi-lot: sum of lots)
  abc_lot_min real, abc_lot_max real,    -- per-lot range; a bidder bids a lot, not a notice
  control text, funding text, location text, category text, contact text,
  lot_type text, client_agency text, delivery_days text, status text,
  closing_detail text, updated text, downloads text,
  description text, items text,
  fetch_errors integer not null default 0,
  enriched_at text
);
create index if not exists tenders_closing_at on tenders(closing_at);
create index if not exists tenders_mode_norm on tenders(mode_norm);
"""

LISTING_COLS = "id,title,mode,classification,agency,publish,closing,publish_at,closing_at,seen_at"
# detail fields written by enrich(), in update order
ENRICH_COLS = [
    "abc", "abc_lot_min", "abc_lot_max", "control", "funding", "location", "category",
    "contact", "lot_type", "client_agency", "delivery_days", "status", "closing_detail",
    "updated", "downloads", "description", "items",
]


def get(url, tries=3):
    for n in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:
            if n == tries - 1:
                print(f"  fail {url}: {e}", file=sys.stderr)
                return None


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def clean(s):
    return re.sub(r"\s+", " ", html.unescape(s or "")).strip()


def iso(s):
    """'12-Aug-2026 03:00 PM' -> '2026-08-12T15:00'; date-only -> '2026-08-12'. None if unparseable.

    ponytail: naive Asia/Manila local time, no tz suffix -- the whole corpus is one timezone.
    """
    s = clean(s)
    for fmt, out in (("%d-%b-%Y %I:%M %p", "%Y-%m-%dT%H:%M"), ("%d-%b-%Y", "%Y-%m-%d")):
        try:
            return datetime.strptime(s, fmt).strftime(out)
        except ValueError:
            pass
    return None


def money(s):
    try:
        return float(clean(s).replace(",", "")) or None
    except ValueError:
        return None


# --- listing -----------------------------------------------------------------

ROW = re.compile(r"<tr\b.*?</tr>", re.S)
REF = re.compile(r"viewLiveTenderDetails/(\d+)/OPEN_MORE")
CELL = re.compile(r'<td data-label="[^"]*"[^>]*>(.*?)</td>', re.S)
PAGING = re.compile(r"Page \d+ of ([\d,]+), showing \d+ record\(s\) out of ([\d,]+) total")


def parse_listing(h):
    """Columns are POSITIONAL: ref, title, mode, classification, agency, publish, closing.

    Do not switch to data-label lookup: PhilGEPS labels the title cell "Control Number".
    """
    out = []
    for row in ROW.findall(h):
        ref = REF.search(row)
        if not ref:
            continue
        cells = [clean(c) for c in (re.sub(r"<[^>]+>", " ", x) for x in CELL.findall(row))]
        # fail loudly if a column is ever inserted, rather than shifting every field by one
        assert len(cells) == 7, f"expected 7 cells, got {len(cells)}: {cells}"
        out.append((int(ref.group(1)), *cells[1:7]))
    return out


def page_count(h):
    m = PAGING.search(h or "")
    return (int(m.group(1).replace(",", "")), int(m.group(2).replace(",", ""))) if m else (0, 0)


def save_listing(db, rows):
    before = db.execute("select count(*) from tenders").fetchone()[0]
    db.executemany(
        f"insert or ignore into tenders({LISTING_COLS}) values (?,?,?,?,?,?,?,?,?,?)",
        [(*r, iso(r[5]), iso(r[6]), now()) for r in rows],
    )
    db.commit()
    return db.execute("select count(*) from tenders").fetchone()[0] - before


def ingest(db, full=False):
    """Incremental by default: stop at the first page with no new ids.

    full=True walks every page -- needed for the first snapshot and to repair a run that
    died mid-pagination (the incremental break would otherwise stop at page 1 forever).
    """
    last = db.execute("select coalesce(max(id), 0) from tenders").fetchone()[0]
    first = get(LIST.format(1))
    pages, total = page_count(first)
    print(f"site reports {pages} pages / {total} notices; db max id {last}")
    new = 0
    if full:
        with ThreadPoolExecutor(WORKERS) as pool:
            fetch = lambda p: (p, get(LIST.format(p)))
            for p, h in pool.map(fetch, range(1, (pages or MAX_PAGES) + 1)):
                if not h:
                    print(f"page {p}: FETCH FAILED", file=sys.stderr)
                    continue
                n = save_listing(db, parse_listing(h))
                new += n
        print(f"backfill: +{new} new")
        return new
    for page in range(1, MAX_PAGES + 1):
        h = first if page == 1 else get(LIST.format(page))
        rows = parse_listing(h) if h else []
        if not rows:
            break
        n = save_listing(db, rows)
        new += n
        print(f"page {page}: {n}/{len(rows)} new (total {new})")
        if n == 0:
            break  # caught up with last-seen id
    return new


# --- detail ------------------------------------------------------------------

LABEL = re.compile(r"<label>\s*([^<:]{2,60}?)\s*:\s*</label>((?:\s*</?br\s*/?>)*)\s*([^<]*)", re.I)

# every detail field is <label>Name: </label></br>value -- parse the structure, not line
# adjacency. Line adjacency silently returns the NEXT LABEL when a value is empty.
FIELDS = {
    "control": "Control Number", "funding": "Funding Source",
    "location": "Delivery/Project Location", "category": "Business Category",
    "contact": "Contact Person", "lot_type": "Lot Type", "client_agency": "Client Agency",
    "delivery_days": "Delivery Period", "status": "Status",
    "closing_detail": "Closing Date", "updated": "Date Last updated",
    "downloads": "Number of Downloads",
}
ABC_LABEL = "Approved Budget of the Contract"


def labels(h):
    """All <label>Key:</label>value pairs. An empty value stays empty -- never the next label."""
    out = {}
    for m in LABEL.finditer(h):
        out.setdefault(clean(m.group(1)), clean(m.group(3)))
    return out


def block(h, start, end):
    """Free-text region between two markers (description, line items) -- not label-structured."""
    t = re.sub(r"<(script|style)\b.*?</\1>", " ", h, flags=re.S | re.I)
    a = t.find(start)
    if a < 0:
        return None
    b = t.find(end, a)
    seg = re.sub(r"<[^>]+>", "\n", t[a + len(start): b if b > 0 else len(t)])
    return "\n".join(l for l in (clean(x) for x in seg.split("\n")) if l) or None


def parse_detail(h):
    L = labels(h)
    row = {k: (L.get(v) or None) for k, v in FIELDS.items()}
    row["abc"] = money(L.get(ABC_LABEL))
    row["description"] = block(h, "Description:", "Line Item Details")
    row["items"] = block(h, "Line Item Details", "BAC Members:")
    # Multi-lot pages add an ABC(Estimated Budget) item column plus a "Total Approved Budget"
    # trailer. Header ABC is the TOTAL; keep it as abc, but expose the per-lot range too --
    # a bidder's entry ticket is the lot, so a 6x60k notice must match an "ABC <= 100k" filter.
    # Cut at the trailer marker rather than dropping values equal to abc: a single lot can
    # legitimately equal the notice total (53476), and dedup-by-value can't tell that apart.
    body = (row["items"] or "").split("Total Approved Budget")[0]
    lots = sorted({x for x in (money(v) for v in re.findall(r"^([\d,]+\.\d{2})$", body, re.M)) if x})
    row["abc_lot_min"], row["abc_lot_max"] = (lots[0], lots[-1]) if lots else (None, None)
    return row


def enrich(db, limit=None):
    todo = [
        r[0]
        for r in db.execute(
            "select id from tenders where enriched_at is null"
            f" and fetch_errors < {MAX_FETCH_ERRORS} order by id desc"
            + (f" limit {int(limit)}" if limit else "")
        )
    ]
    print(f"enriching {len(todo)}")
    sets = ",".join(f"{c}=?" for c in ENRICH_COLS)
    done = failed = 0
    with ThreadPoolExecutor(WORKERS) as pool:
        for tid, h in zip(todo, pool.map(lambda t: get(DETAIL.format(t)), todo)):
            if not h:
                db.execute("update tenders set fetch_errors = fetch_errors + 1 where id=?", (tid,))
                failed += 1
                continue
            row = parse_detail(h)
            db.execute(
                f"update tenders set {sets}, enriched_at=? where id=?",
                (*[row[c] for c in ENRICH_COLS], now(), tid),
            )
            done += 1
            if (done + failed) % 100 == 0:
                db.commit()
                print(f"  {done + failed}/{len(todo)} ({failed} failed)")
    db.commit()
    print(f"enriched {done}, fetch failures {failed}")
    return done


def stats(db):
    q = lambda s: db.execute(s).fetchone()[0]
    print(f"tenders      {q('select count(*) from tenders')}")
    print(f"enriched     {q('select count(*) from tenders where enriched_at is not null')}")
    print(f"unenriched   {q('select count(*) from tenders where enriched_at is null')}")
    print(f"abc total    {q('select coalesce(sum(abc),0) from tenders'):,.0f}")
    print("\nnull rate among enriched rows:")
    n = max(q("select count(*) from tenders where enriched_at is not null"), 1)
    for c in ENRICH_COLS:
        k = q(f"select count(*) from tenders where enriched_at is not null and {c} is null")
        print(f"  {c:<14} {k:>5}  {100 * k / n:5.1f}%")
    print("\nby mode_norm:")
    for m, k in db.execute("select mode_norm, count(*) from tenders group by 1 order by 2 desc"):
        print(f"  {k:>5}  {m}")
    print("\ndays to close (from closing_at):")
    for b, k in db.execute("""
        select case when closing_at is null then 'no date'
                    when d < 0 then 'past' when d <= 2 then '0-2d' when d <= 6 then '3-6d'
                    when d <= 13 then '7-13d' when d <= 29 then '14-29d' else '30d+' end,
               count(*)
        from (select closing_at, julianday(closing_at) - julianday('now','localtime') d from tenders)
        group by 1 order by 2 desc"""):
        print(f"  {k:>5}  {100 * k / max(q('select count(*) from tenders'), 1):5.1f}%  {b}")


def main():
    db = sqlite3.connect(DB)
    db.executescript(SCHEMA)
    cmd = sys.argv[1] if len(sys.argv) > 1 else "all"
    limit = sys.argv[2] if len(sys.argv) > 2 else None
    if cmd in ("all", "ingest", "backfill"):
        ingest(db, full=(cmd == "backfill"))
    if cmd in ("all", "enrich"):
        enrich(db, limit)
    stats(db)


def selfcheck():
    listing = """
    <tr><td data-label="Bid Notice Reference Number">
        <a href="https://philgeps.gov.ph/Indexes/viewLiveTenderDetails/55594/OPEN_MORE">55594</a></td>
      <td data-label="Control Number"><span>Supply &amp; Delivery, PARA&Ntilde;AQUE </span></td>
      <td data-label="Mode of Procurement"><span>Small Value Procurement </span></td>
      <td data-label="Business Category"><span>Goods </span></td>
      <td data-label="Agency Name"><span>DTI - REGION II </span></td>
      <td data-label="Publish Date"><span>09-Aug-2026 </span></td>
      <td data-label="Closing date"><span>12-Aug-2026 03:00 PM</span></td></tr>"""
    assert parse_listing(listing) == [
        (55594, "Supply & Delivery, PARAÑAQUE", "Small Value Procurement", "Goods",
         "DTI - REGION II", "09-Aug-2026", "12-Aug-2026 03:00 PM")
    ], parse_listing(listing)

    assert iso("12-Aug-2026 03:00 PM") == "2026-08-12T15:00"
    assert iso("09-Aug-2026") == "2026-08-09" and iso("") is None and iso(None) is None

    detail = """<label>Control Number: </label></br>0308015</br>
      <label>Approved Budget of the Contract: </label></br>245,000.00</br>
      <label>Funding Source: </label></br>Regular Agency Fund (01000000)</br>
      <label>Delivery/Project Location: </label></br>Metro Manila</br>
      <label>Business Category: </label></br>Merchandising furniture</br>
      <label>Contact Person: </label></br>Kariza Mae Lannao</br>
      <label>Lot Type: </label></br>Single Lot</br>
      <label>Date Last updated: </label></br>05-Aug-2026 04:04 PM</br>
      <label>Number of Downloads: </label></br>1</br>
      <p>Description:</p><p>1. The Department intends to apply</p><p>2. Bidders must possess</p>
      <p>Line Item Details</p><p>1</p><p>56131603</p><p>Sales counters</p><p>BAC Members:</p>"""
    d = parse_detail(detail)
    assert d["abc"] == 245000.0 and d["control"] == "0308015", d
    assert d["location"] == "Metro Manila" and d["lot_type"] == "Single Lot", d
    assert d["updated"] == "05-Aug-2026 04:04 PM" and d["downloads"] == "1", d
    assert d["description"].startswith("1. The Department") and "2. Bidders" in d["description"], d
    assert d["items"] == "1\n56131603\nSales counters", d
    assert d["abc_lot_min"] is None and d["abc_lot_max"] is None, d

    # D1 REGRESSION: an empty value must be None, never the following label
    empty_loc = ('<label>Funding Source: </label></br>Regular Agency Fund</br></br>'
                 '<label>Delivery/Project Location: </label></br></br></br>'
                 '<label>Business Category: </label></br>Roads and landscape</br></br>')
    d = parse_detail(empty_loc)
    assert d["location"] is None, d
    assert d["category"] == "Roads and landscape", d

    # D2: entities decoded in detail body text
    assert parse_detail(
        "<p>Description:</p><p>Supply &amp; Delivery, PARA&Ntilde;AQUE</p><p>Line Item Details</p>"
    )["description"] == "Supply & Delivery, PARAÑAQUE"

    # D6: multi-lot -- abc is the total, lot range excludes the total trailer row
    multi = ("<label>Approved Budget of the Contract: </label></br>360,000.00</br>"
             "<label>Lot Type: </label></br>Multi Lot</br>"
             "<p>Line Item Details</p><p>1</p><p>60,000.00</p><p>2</p><p>90,000.00</p>"
             "<p>Total Approved Budget</p><p>360,000.00</p><p>BAC Members:</p>")
    d = parse_detail(multi)
    assert d["abc"] == 360000.0 and d["lot_type"] == "Multi Lot", d
    assert (d["abc_lot_min"], d["abc_lot_max"]) == (60000.0, 90000.0), d

    # a lone lot equal to the notice total is real, not a mis-captured trailer (53476)
    one = ("<label>Approved Budget of the Contract: </label></br>3,411,900.00</br>"
           "<p>Line Item Details</p><p>1</p><p>3,411,900.00</p>"
           "<p>Total Approved Budget</p><p>3,411,900.00</p><p>BAC Members:</p>")
    assert parse_detail(one)["abc_lot_min"] == 3411900.0, parse_detail(one)

    # missing fields must be None, not a crash
    assert parse_detail("<p>nothing here</p>")["abc"] is None
    print("ok")


if __name__ == "__main__":
    selfcheck() if sys.argv[1:2] == ["test"] else main()
