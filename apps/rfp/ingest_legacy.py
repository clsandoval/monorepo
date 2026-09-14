#!/usr/bin/env python3
"""Legacy PhilGEPS 1.5 (notices.philgeps.gov.ph) open-notice ingest.

    python3 ingest_legacy.py            # listing sweep, then fetch every detail page
    python3 ingest_legacy.py listing    # listing only
    python3 ingest_legacy.py detail     # detail pages only
    python3 ingest_legacy.py stats
    python3 ingest_legacy.py test       # parser selfcheck

Separate DB (legacy.db) from the mPhilGEPS side; column names are deliberately
parallel to `tenders` so the merge is a union, not a mapping exercise.

Two things make this side easier than mPhilGEPS:
  * every detail value sits in a <span id="lblDisplay*"> -- real key/value structure,
    so an empty field reads as empty, never as the next field's label.
  * one __VIEWSTATE serves every pager offset, so the listing sweep parallelises.
And one thing makes it harder: the listing Title cell glues title+category+PE+province,
so the detail fetch is mandatory for all ~17.8K rows, not an enrichment pass.
"""
import hashlib, html, re, sqlite3, sys, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

DB = Path(__file__).parent / "legacy.db"
BASE = "https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/"
LIST = BASE + "SplashOpportunitiesSearchUI.aspx?menuIndex=3&ClickFrom=OpenOpp&Result=3"
DETAIL = BASE + "SplashBidNoticeAbstractUI.aspx?refID={}"
UA = "Mozilla/5.0 (rfp-finder; +philgeps ingest)"
PAGE = 20
THREADS = 8
PAGER = "pgCtrlDetailedSearch$pageDropDownList"

SCHEMA = """
create table if not exists tenders (
  id integer primary key,
  source text default 'legacy',
  title text, mode text, mode_norm text, classification text, category text,
  agency text, location text, solicitation_no text, trade_agreement text,
  abc real, delivery_period text, status text,
  contact text, contact_email text, contact_phone text,
  description text, bid_supplements integer, doc_req_list integer,
  publish text, closing text, publish_at text, closing_at text,
  last_updated text, last_updated_at text,
  dupe_key text, seen_at text, enriched_at text, fetch_errors integer default 0
);
create index if not exists tenders_closing_at on tenders(closing_at);
create index if not exists tenders_dupe on tenders(dupe_key);
"""


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def fetch(url, data=None, tries=3):
    body = urllib.parse.urlencode(data).encode() if data else None
    hdrs = {"User-Agent": UA}
    if body:
        hdrs["Content-Type"] = "application/x-www-form-urlencoded"
    for n in range(tries):
        try:
            req = urllib.request.Request(url, data=body, headers=hdrs)
            with urllib.request.urlopen(req, timeout=90) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:
            if n == tries - 1:
                print(f"  fail {url[:80]}: {e}", file=sys.stderr)
                return None


def clean(s):
    """Tags out, entities decoded, whitespace collapsed. Empty -> None, never a fallback."""
    if s is None:
        return None
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s).replace("\xa0", " ")
    s = re.sub(r"[ \t\r\f\v]+", " ", s).strip()
    return s or None


def span(doc, sid):
    """Value of <span id="sid">. Missing span and empty span both -> None."""
    m = re.search(r'<span[^>]*\bid="%s"[^>]*>(.*?)</span>' % re.escape(sid), doc, re.S)
    return clean(m.group(1)) if m else None


def iso(s):
    """Legacy dates are DD/MM/YYYY, optionally + 'HH:MM AM'. Unparseable -> None."""
    if not s:
        return None
    for fmt in ("%d/%m/%Y %I:%M %p", "%d/%m/%Y %H:%M", "%d/%m/%Y"):
        try:
            return datetime.strptime(s.strip(), fmt).isoformat()
        except ValueError:
            pass
    return None


def money(s):
    if not s:
        return None
    s = re.sub(r"(?i)\bphp\b|[,\s₱]", "", s)
    try:
        return float(s)
    except ValueError:
        return None


def dupe_key(agency, closing_at, title, abc):
    norm = lambda s: re.sub(r"[^A-Z0-9 ]", "", (s or "").upper())
    parts = (norm(agency), closing_at or "", norm(title)[:80], f"{abc or 0:.2f}")
    return hashlib.sha1("|".join(parts).encode()).hexdigest()


# --- listing -----------------------------------------------------------------

TR = re.compile(r"<tr\b.*?</tr>", re.S)
REFID = re.compile(r"refID=(\d+)")
GRIDCELL = re.compile(r'<td class="GridItemTD"[^>]*>(.*?)</td>', re.S)


def viewstate(doc):
    grab = lambda n: (re.search(r'id="%s"[^>]*value="([^"]*)"' % n, doc) or [None, None])[1]
    return {
        k: v
        for k in ("__VIEWSTATE", "__VIEWSTATEGENERATOR", "__EVENTVALIDATION")
        if (v := grab(k)) is not None
    }


SELECT = re.compile(
    r'<select[^>]*name="%s".*?</select>' % re.escape(PAGER).replace(r"\$", r"\$"), re.S
)


def pager_offsets(doc):
    """Record offsets straight off the pager dropdown: 1, 21, 41, ... 17841.

    Do NOT walk offsets past the last option and wait for an empty page -- an
    out-of-range offset silently re-serves PAGE 1, so a rows-run-out loop never ends.
    The dropdown is the only honest bound; the "N opportunities found" label undercounts.
    """
    m = SELECT.search(doc)
    return [int(o) for o in re.findall(r'<option[^>]*value="(\d+)"', m.group(0))] if m else []


ROWNUM = re.compile(r'<td align="center" valign="middle" style="width:5%;">(\d+)</td>')


def listing_page(vs, offset, tries=3):
    """Fetch one pager offset, verifying the server actually served THAT offset.

    Concurrent POSTs share one __VIEWSTATE and the server occasionally answers with
    page 1 instead of the requested offset -- silently, with 20 valid-looking rows.
    First run lost ~180 notices that way (640 rows -> only 460 new in chunk 1).
    The rendered row numbers are the receipt, so check them.
    """
    for _ in range(tries):
        doc = fetch(LIST, {"__EVENTTARGET": PAGER, "__EVENTARGUMENT": "", PAGER: str(offset), **vs})
        if not doc:
            return []
        got = ROWNUM.search(doc)
        if got and int(got.group(1)) == offset:
            return parse_listing(doc)
    print(f"  offset {offset}: server kept serving row {got.group(1) if got else '?'}", file=sys.stderr)
    return []


def parse_listing(doc):
    """-> [(ref_id, publish, closing)]. Title comes from the detail page; the listing
    cell glues title+category+PE+province with commas and titles contain commas.
    Cells are read positionally (publish, closing, title) -- the row-number cell is
    not a GridItemTD, so index 0 is publish."""
    out = []
    for tr in TR.findall(doc):
        ref = REFID.search(tr)
        cells = GRIDCELL.findall(tr)
        if not ref or len(cells) < 2:
            continue
        out.append((int(ref.group(1)), clean(cells[0]), clean(cells[1])))
    return out


def listing(db):
    first = fetch(LIST)
    if not first:
        sys.exit("listing page 1 unreachable")
    vs = viewstate(first)
    if "__VIEWSTATE" not in vs:
        sys.exit("no __VIEWSTATE on listing page")
    offsets = pager_offsets(first)
    if not offsets:
        sys.exit("could not read pager offsets")
    print(f"listing sweep: {len(offsets)} pages x {PAGE}, {THREADS} threads")
    seen = 0
    with ThreadPoolExecutor(THREADS) as pool:
        for i in range(0, len(offsets), THREADS * 4):
            chunk = offsets[i : i + THREADS * 4]
            rows = [r for b in pool.map(lambda o: listing_page(vs, o), chunk) for r in b]
            before = db.execute("select count(*) from tenders").fetchone()[0]
            db.executemany(
                "insert or ignore into tenders(id,publish,closing,publish_at,closing_at,seen_at,source)"
                " values (?,?,?,?,?,?,'legacy')",
                [(i_, p, c, iso(p), iso(c), now()) for i_, p, c in rows],
            )
            db.commit()
            added = db.execute("select count(*) from tenders").fetchone()[0] - before
            seen += len(rows)
            print(f"  offset {chunk[0]}-{chunk[-1]}: {len(rows)} rows, +{added} new (seen {seen})")
    total = db.execute("select count(*) from tenders").fetchone()[0]
    print(f"listing done: {seen} rows fetched, {total} unique ids")
    return total


# --- detail ------------------------------------------------------------------

SPANS = {
    "title": "lblDisplayTitle",
    "agency": "lblDisplayProcuringEntity",
    "location": "lblDisplayAOD",
    "solicitation_no": "lblDisplaySolNumber",
    "trade_agreement": "lblDisplayTradeAgree",
    "mode": "lblDisplayProcureMode",
    "classification": "lblDisplayClass",
    "category": "lblDisplayCategory",
    "delivery_period": "lblDisplayPeriod",
    "status": "lblDisplayStatus",
    "contact": "lblDisplayContactPerson",
    "description": "lblAbstractText",
}


def parse_detail(doc):
    row = {k: span(doc, sid) for k, sid in SPANS.items()}
    row["abc"] = money(span(doc, "lblDisplayBudget"))
    row["publish"] = span(doc, "lblDisplayDatePublish")
    row["closing"] = span(doc, "lblDisplayCloseDateTime")
    row["last_updated"] = span(doc, "lblDisplayLastUpdateTime")
    for k in ("publish", "closing", "last_updated"):
        row[k + "_at"] = iso(row[k])
    for k, sid in (("bid_supplements", "lblDisplayBidSupplements"), ("doc_req_list", "lblDisplayDocReqList")):
        v = span(doc, sid)
        row[k] = int(v) if v and v.isdigit() else None
    blob = row["contact"] or ""
    row["contact_email"] = (re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", blob) or [None])[0]
    # anchor on a PH dialling prefix, else the postal code in the glued address blob
    # gets swallowed into the number ("7003 63-966-6777853")
    row["contact_phone"] = (re.search(r"(?:\+?63|\(0\d{2}\)|0)[\d\-() ]{7,}\d", blob) or [None])[0]
    row["mode_norm"] = row["mode"].strip().lower() if row["mode"] else None
    row["dupe_key"] = dupe_key(row["agency"], row["closing_at"], row["title"], row["abc"])
    return row


COLS = list(SPANS) + [
    "abc", "publish", "closing", "last_updated", "publish_at", "closing_at",
    "last_updated_at", "bid_supplements", "doc_req_list", "contact_email",
    "contact_phone", "mode_norm", "dupe_key",
]
UPDATE = (
    "update tenders set " + ",".join(f"{c}=?" for c in COLS) + ", enriched_at=? where id=?"
)


def detail(db, limit=None):
    todo = [
        r[0]
        for r in db.execute(
            "select id from tenders where enriched_at is null and coalesce(fetch_errors,0) < 3"
            " order by id desc" + (f" limit {int(limit)}" if limit else "")
        )
    ]
    print(f"detail fetches: {len(todo)}")
    done = fails = 0
    with ThreadPoolExecutor(THREADS) as pool:
        for tid, doc in zip(todo, pool.map(lambda t: fetch(DETAIL.format(t)), todo)):
            if not doc or "ErrorPage" in doc[:2000]:
                db.execute("update tenders set fetch_errors=coalesce(fetch_errors,0)+1 where id=?", (tid,))
                fails += 1
                continue
            row = parse_detail(doc)
            db.execute(UPDATE, (*[row[c] for c in COLS], now(), tid))
            done += 1
            if (done + fails) % 100 == 0:
                db.commit()
                print(f"  {done}+{fails}/{len(todo)}")
    db.commit()
    print(f"detail done: {done} parsed, {fails} failed")
    return done


def stats(db):
    q = lambda s: db.execute(s).fetchone()[0]
    print(f"rows        {q('select count(*) from tenders')}")
    print(f"enriched    {q('select count(*) from tenders where enriched_at is not null')}")
    print(f"errored     {q('select count(*) from tenders where coalesce(fetch_errors,0) > 0')}")
    print("\nnull rates (of enriched):")
    n = max(q("select count(*) from tenders where enriched_at is not null"), 1)
    for c in COLS:
        k = q(f"select count(*) from tenders where enriched_at is not null and {c} is null")
        if k:
            print(f"  {c:18} {k:>6}  {100*k/n:5.1f}%")
    print("\ntop provinces:")
    for loc, k in db.execute(
        "select location, count(*) from tenders where enriched_at is not null"
        " group by 1 order by 2 desc limit 12"
    ):
        print(f"  {k:>6}  {loc}")
    print("\ntop categories:")
    for cat, k in db.execute(
        "select category, count(*) from tenders where enriched_at is not null"
        " group by 1 order by 2 desc limit 12"
    ):
        print(f"  {k:>6}  {cat}")
    print("\ndays to close:")
    for bucket, k in db.execute(
        """select case when closing_at is null then 'unknown'
                      when julianday(closing_at) - julianday('now') < 0 then 'closed'
                      when julianday(closing_at) - julianday('now') <= 2 then '<=2d'
                      when julianday(closing_at) - julianday('now') <= 6 then '3-6d'
                      when julianday(closing_at) - julianday('now') <= 13 then '7-13d'
                      when julianday(closing_at) - julianday('now') <= 29 then '14-29d'
                      else '30d+' end b, count(*)
           from tenders where enriched_at is not null group by 1 order by 2 desc"""
    ):
        print(f"  {k:>6}  {bucket}")
    print("\nabc:")
    print(f"  with abc  {q('select count(*) from tenders where abc is not null')}")
    print(f"  sum       {q('select coalesce(sum(abc),0) from tenders'):,.0f}")
    print(f"  dupe_keys {q('select count(distinct dupe_key) from tenders where dupe_key is not null')}")


def selfcheck():
    doc = """<span id="lblDisplayReferenceNo">13171550</span>
    <span id="lblDisplayProcuringEntity">MUNICIPALITY OF TITAY, ZAMBOANGA SIBUGAY</span>
    <span id="lblDisplayTitle">Supply &amp; Delivery of Materials, PARA&Ntilde;AQUE</span>
    <span id="lblDisplayAOD">Zamboanga Sibugay</span>
    <span id="lblDisplaySolNumber">2026-07-701</span>
    <span id="lblDisplayTradeAgree">Implementing Rules and Regulations</span>
    <span id="lblDisplayProcureMode">Negotiated Procurement - SVP  (Sec. 34)</span>
    <span id="lblDisplayClass">Goods</span>
    <span id="lblDisplayCategory">Advertising Agency Services</span>
    <span id="lblDisplayBudget">PHP 100,000.00</span>
    <span id="lblDisplayPeriod">30 Day/s</span>
    <span id="lblDisplayClient"></span>
    <span id="lblDisplayContactPerson">Renato C. Eisma Poblacion Titay 7003 63-966-6777853 x@gmail.com</span>
    <span id="lblDisplayStatus">Active</span>
    <span id="lblDisplayBidSupplements">0</span>
    <span id="lblDisplayDocReqList">1</span>
    <span id="lblDisplayDatePublish">07/08/2026</span>
    <span id="lblDisplayLastUpdateTime">07/08/2026 12:00 AM</span>
    <span id="lblDisplayCloseDateTime">10/08/2026 10:00 AM</span>
    <span id="lblAbstractText">REQUEST FOR QUOTATION<br/>The Municipality invites suppliers</span>"""
    d = parse_detail(doc)
    assert d["abc"] == 100000.0, d["abc"]
    assert d["location"] == "Zamboanga Sibugay" and d["solicitation_no"] == "2026-07-701", d
    # entities decoded -- "Supply & Delivery" and "PARAÑAQUE" are filter terms
    assert d["title"] == "Supply & Delivery of Materials, PARAÑAQUE", d["title"]
    # DD/MM/YYYY, not MM/DD -- 07/08 is 7 August, and closing must sort after publish
    assert d["publish_at"] == "2026-08-07T00:00:00", d["publish_at"]
    assert d["closing_at"] == "2026-08-10T10:00:00", d["closing_at"]
    assert d["closing_at"] > d["publish_at"]
    assert d["mode_norm"] == "negotiated procurement - svp (sec. 34)", d["mode_norm"]
    assert d["contact_email"] == "x@gmail.com" and "966" in d["contact_phone"], d
    assert d["bid_supplements"] == 0 and d["doc_req_list"] == 1, d
    assert d["description"].startswith("REQUEST FOR QUOTATION"), d["description"]

    # THE bug this parser exists to avoid: an empty field must be None, never the
    # next field's label or value. lblDisplayClient is genuinely empty on live pages.
    assert span(doc, "lblDisplayClient") is None
    assert span(doc, "lblDisplayNoSuchField") is None
    empty = parse_detail('<span id="lblDisplayTitle"></span><span id="lblDisplayAOD">Cebu</span>')
    assert empty["title"] is None and empty["location"] == "Cebu", empty
    assert empty["abc"] is None and empty["closing_at"] is None and empty["mode_norm"] is None

    assert iso("31/12/2026") == "2026-12-31T00:00:00" and iso("") is None and iso("garbage") is None
    assert money("PHP 1,234.50") == 1234.5 and money("") is None and money("n/a") is None

    listing_html = """<tr class="GridItem"><td align="center" valign="middle" style="width:5%;">1</td>
      <td class="GridItemTD" align="center" valign="middle" style="width:5%;">08/08/2026</td>
      <td class="GridItemTD" align="center" valign="middle" style="width:10%;">11/08/2026 08:00 AM</td>
      <td class="GridItemTD"><a href="SplashBidNoticeAbstractUI.aspx?menuIndex=3&amp;refID=13141805&amp;Result=3">PURCHASE OF MEDICINE, AUGUST</a>
      <span>, Medical Supplies ,MUNICIPALITY OF MACO, COMPOSTELA VALLEY</span></td></tr>"""
    assert parse_listing(listing_html) == [(13141805, "08/08/2026", "11/08/2026 08:00 AM")], parse_listing(listing_html)
    assert parse_listing("<tr>nothing</tr>") == []

    pager = ('<select name="pgCtrlDetailedSearch$pageDropDownList" id="x">'
             '<option value="1">1</option><option value="21">2</option>'
             '<option selected value="17841">893</option></select>')
    assert pager_offsets(pager) == [1, 21, 17841], pager_offsets(pager)
    assert pager_offsets("<p>no pager</p>") == []
    print("ok")


def main():
    db = sqlite3.connect(DB)
    db.executescript(SCHEMA)
    cmd = sys.argv[1] if len(sys.argv) > 1 else "all"
    limit = sys.argv[2] if len(sys.argv) > 2 else None
    if cmd in ("all", "listing"):
        listing(db)
    if cmd in ("all", "detail"):
        detail(db, limit)
    stats(db)


if __name__ == "__main__":
    selfcheck() if sys.argv[1:2] == ["test"] else main()
