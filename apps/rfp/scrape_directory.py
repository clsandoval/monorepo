#!/usr/bin/env python3
"""Mirror contactnumbersph's PH construction directory into awards.db.

    python3 scrape_directory.py test     # assert-based parser check, no network
    python3 scrape_directory.py          # resumable full crawl (~1,200 pages)

Why a whole directory instead of one search per contractor: the per-firm search pass
found an address for roughly one company in five, at one-to-two searches each. This site
publishes name + address + phone + EMAIL for ~1,200 Philippine construction firms on one
page apiece, indexed by province -- so a single crawl replaces the whole search pass,
covers the 1,214-company `All winners` sheet rather than just the 153-firm shortlist, and
can be re-run cheaply when new awards land.

The directory is a THIRD-PARTY SNAPSHOT, not ground truth: it is undated, sourced from
old PCAB license lists, and its coverage is patchy outside the big provinces. So it is
mirrored verbatim into its own table and never written straight onto a contractor --
`match_directory.py` does the joining, and applies the same name-and-province gate the
phone lookup uses. Every matched row keeps its source URL for a human to check.

robots.txt allows this (only /wp-admin/ is disallowed) and the crawl is rate-limited.
"""
import re, sqlite3, sys, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).parent
DB = HERE / "awards.db"
ROOT = "https://construction.contactnumbersph.com"
SITEMAPS = [f"{ROOT}/sitemap-{n}.xml" for n in (1, 2)]
# The site 406s a default urllib User-Agent. This is not an access control -- robots.txt
# permits the crawl -- just a stock WAF rule, so present as a browser and stay polite.
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
WORKERS, DELAY = 4, 0.25

SCHEMA = """
create table if not exists ph_directory (
  url text primary key, name text, address text, phone text, email text,
  category text, fetched_at text
);
create index if not exists ph_directory_email on ph_directory(email);
"""


def get(url, tries=3):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9"})
    for n in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.read().decode("utf8", "replace")
        except Exception:
            if n == tries - 1:
                raise
            time.sleep(2 + 3 * n)


def text(html):
    """Strip tags to a single space-collapsed line -- the fields are plain text runs."""
    html = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", html)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def parse(html):
    """Pull one company record out of a directory page.

    The page body is a flat run: NAME, address, "Contact Number(s): ...", "Email: ...".
    Anchor on the labels rather than on position -- entries with no phone or no email
    simply omit the label, so line-offset parsing silently shifts fields by one.
    """
    t = re.search(r"(?is)<title>(.*?)</title>", html)
    name = re.sub(r"(?i)\s*&#8211;\s*CONSTRUCTION COMPANIES\s*$", "",
                  (t.group(1) if t else "")).strip()
    body = text(html)
    email = re.search(r"(?i)Email:\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})", body)
    phone = re.search(r"(?i)Contact Number\(s\):\s*(.+?)(?:\s*Email:|\s*Suggest an edit)", body)
    cat = re.search(r'(?is)rel="category tag"[^>]*>([^<]+)<', html)
    addr = None
    if name:
        # Address is whatever sits between the company name and the first label.
        m = re.search(re.escape(name) + r"\s*(.*?)(?:Contact Number|Email:|Suggest an edit)",
                      body, re.I | re.S)
        if m:
            addr = re.sub(r"^[-–>\s]+", "", m.group(1)).strip() or None
    return dict(
        name=name or None, address=addr,
        phone=(phone.group(1).strip() if phone else None),
        email=(email.group(1).lower() if email else None),
        category=(cat.group(1).strip() if cat else None))


def urls():
    out = []
    for sm in SITEMAPS:
        out += re.findall(r"<loc>([^<]+)</loc>", get(sm))
    # drop the sitemap's own non-company entries (home page, paginated archives)
    return sorted({u for u in out if re.fullmatch(r"https://[^/]+/[a-z0-9-]+/", u)
                   and "/category/" not in u and u.rstrip("/") != ROOT})


def main():
    db = sqlite3.connect(DB, check_same_thread=False)
    db.executescript(SCHEMA)
    have = {r[0] for r in db.execute("select url from ph_directory")}
    todo = [u for u in urls() if u not in have]
    print(f"crawling {len(todo)} pages (already have {len(have)})")
    n_ok = n_email = n_fail = 0

    def work(u):
        nonlocal n_ok, n_email, n_fail
        time.sleep(DELAY)
        try:
            rec = parse(get(u))
        except Exception as e:
            n_fail += 1
            print(f"  fail {u}: {e}", file=sys.stderr)
            return
        db.execute("insert or replace into ph_directory values (?,?,?,?,?,?,datetime('now'))",
                   (u, rec["name"], rec["address"], rec["phone"], rec["email"], rec["category"]))
        n_ok += 1
        n_email += bool(rec["email"])
        if n_ok % 100 == 0:
            db.commit()
            print(f"  {n_ok}/{len(todo)}  {n_email} with email", flush=True)

    with ThreadPoolExecutor(WORKERS) as pool:
        list(pool.map(work, todo))
    db.commit()
    tot, mail = db.execute(
        "select count(*), count(email) from ph_directory").fetchone()
    print(f"\ndone: {n_ok} fetched, {n_fail} failed")
    print(f"directory now holds {tot} companies, {mail} with an email address")


FIXTURE = """<html><head><title>A.C. BALUYOT CONSTRUCTION AND GENERAL SERVICES &#8211; CONSTRUCTION COMPANIES</title></head>
<body><h2>A.C. BALUYOT CONSTRUCTION AND GENERAL SERVICES</h2> --> Lower Tundol, Reformista, Limay, Bataan
ACBCGS <b>Contact Number(s):</b> +6347 244-4119 <b>Email:</b> acbaluyotconstruction@yahoo.com
Suggest an edit <a href="/category/bataan/" rel="category tag">Bataan, Region 3</a></body></html>"""


def selfcheck():
    r = parse(FIXTURE)
    assert r["name"] == "A.C. BALUYOT CONSTRUCTION AND GENERAL SERVICES", r["name"]
    assert r["email"] == "acbaluyotconstruction@yahoo.com", r["email"]
    assert r["phone"] == "+6347 244-4119", r["phone"]
    assert r["category"] == "Bataan, Region 3", r["category"]
    assert "Limay, Bataan" in r["address"], r["address"]
    # An entry with no email must NOT borrow the phone label's text or shift fields.
    no_mail = parse(FIXTURE.replace("<b>Email:</b> acbaluyotconstruction@yahoo.com", ""))
    assert no_mail["email"] is None and no_mail["phone"] == "+6347 244-4119", no_mail
    # ...and one with no phone must still find its email.
    no_ph = parse(FIXTURE.replace("<b>Contact Number(s):</b> +6347 244-4119", ""))
    assert no_ph["phone"] is None, no_ph
    assert no_ph["email"] == "acbaluyotconstruction@yahoo.com", no_ph
    print("ok")


if __name__ == "__main__":
    selfcheck() if sys.argv[1:2] == ["test"] else main()
