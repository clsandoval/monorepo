#!/usr/bin/env python3
"""Legacy PhilGEPS award notices -> awards.db, plus the two metrics from issue #141.

    python3 awards.py listing            # rolling-100 listing: refID+orgID (needed for AreaOfDelivery)
    python3 awards.py enumerate N        # random sample of N awardIDs across the id space
    python3 awards.py blocks K M         # K contiguous blocks of M ids (for repeat-winner)
    python3 awards.py backfill [--budget-seconds N] [--batch B]   # resumable newest-first sweep
    python3 awards.py coverage           # W-A gate artifact -> awards-coverage.json
    python3 awards.py metrics
    python3 awards.py test

Why two ingest modes (see NOTES-awards.md):
  refID is IGNORED by GetAwardedSupplier and arbitrary awardIDs resolve, so winner + price + ABC
  are enumerable with no listing at all. But GetNotice validates refID, so AreaOfDelivery (the
  delivery province) is ONLY available for awards harvested from the listing. Outsider-win-rate
  therefore runs on the listing subset; win-ratio and repeat-winner run on the enumerated sample.
"""
import json, os, random, re, sqlite3, sys, time, urllib.error, urllib.parse, urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

DB = Path(__file__).parent / "awards.db"
SVC = "https://notices.philgeps.gov.ph/p4_webservices/GEPSR3_AwardNotice.asmx/"
LIST = "https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/RecentAwardNoticeUI.aspx?menuIndex=3"
# The JSON content-type on a GET is the whole trick; without it every call returns a generic error.
H = {"Content-Type": "application/json; charset=utf-8", "User-Agent": "Mozilla/5.0 (rfp-finder)"}
# Polite defaults. Raise via env when nothing else is hitting this host -- a 403 appeared within
# a few requests when two scrapers ran concurrently, and recovered at ~3s spacing.
WORKERS = int(os.environ.get("RFP_AWARD_WORKERS", "3"))
PAUSE = float(os.environ.get("RFP_AWARD_PAUSE", "0.35"))
ID_LO, ID_HI = 5_000_000, 6_193_104   # verified live: Aug-2024 .. Jul-2026, dense and monotonic

SCHEMA = """
create table if not exists awards (
  award_id integer primary key,
  ref_id text, org_id text,            -- only known for listing-harvested rows
  contract_amount real, abc real,      -- abc from GetLineItem.Budget
  win_ratio real,
  award_date text, publish_date text, closing_date text,
  contract_no text, unspsc text, unspsc_desc text, doc_count integer, status_id integer,
  title text, description text,
  created_by text, approver text,      -- buyer-side staff: proxy for the procuring office
  winner text, winner_address text, winner_contact text,
  winner_province text,                -- parsed from winner_address
  area_of_delivery text,               -- needs ref_id, so listing rows only
  procurement_mode text, classification text, category text,
  buyer_org text,
  source text, fetched_at text
);
create index if not exists awards_winner on awards(winner);
create index if not exists awards_created_by on awards(created_by);
create table if not exists meta (k text primary key, v text);
"""

# 82 provinces + the NCR label PhilGEPS actually uses. Needed because winner_address is free text
# while area_of_delivery is a clean province string -- they must be compared on the same basis.
PROVINCES = [
    "Metro Manila", "Abra", "Agusan del Norte", "Agusan del Sur", "Aklan", "Albay", "Antique",
    "Apayao", "Aurora", "Basilan", "Bataan", "Batanes", "Batangas", "Benguet", "Biliran", "Bohol",
    "Bukidnon", "Bulacan", "Cagayan", "Camarines Norte", "Camarines Sur", "Camiguin", "Capiz",
    "Catanduanes", "Cavite", "Cebu", "Cotabato", "Davao de Oro", "Davao del Norte",
    "Davao del Sur", "Davao Occidental", "Davao Oriental", "Dinagat Islands", "Eastern Samar",
    "Guimaras", "Ifugao", "Ilocos Norte", "Ilocos Sur", "Iloilo", "Isabela", "Kalinga", "La Union",
    "Laguna", "Lanao del Norte", "Lanao del Sur", "Leyte", "Maguindanao", "Marinduque", "Masbate",
    "Misamis Occidental", "Misamis Oriental", "Mountain Province", "Negros Occidental",
    "Negros Oriental", "Northern Samar", "Nueva Ecija", "Nueva Vizcaya", "Occidental Mindoro",
    "Oriental Mindoro", "Palawan", "Pampanga", "Pangasinan", "Quezon", "Quirino", "Rizal",
    "Romblon", "Samar", "Sarangani", "Siquijor", "Sorsogon", "South Cotabato", "Southern Leyte",
    "Sultan Kudarat", "Sulu", "Surigao del Norte", "Surigao del Sur", "Tarlac", "Tawi-Tawi",
    "Zambales", "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay",
]
# longest first so "Davao del Norte" wins over "Davao", "Samar" doesn't eat "Northern Samar"
_PROV = sorted(PROVINCES, key=len, reverse=True)


def province(text):
    """Last province name appearing in a free-text address, or None."""
    if not text:
        return None
    t = text.lower()
    # Rank by where the match ENDS, then by length. Ranking by start index picks "Samar" out of
    # "Northern Samar", because the substring starts later than the full name does.
    hits = [(t.rfind(p.lower()) + len(p), len(p), p) for p in _PROV if p.lower() in t]
    return max(hits)[2] if hits else None


HTTP_ERRS = Counter()   # status code -> count; backfill reads this to back off on 403/5xx


def call(method, **params):
    url = SVC + method + "?" + urllib.parse.urlencode(params)
    for n in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=45) as r:
                return json.load(r)["d"].get("Value") or []
        except urllib.error.HTTPError as e:
            HTTP_ERRS[e.code] += 1
            time.sleep(2 + 3 * n)
        except Exception:
            time.sleep(2 + 3 * n)
    return None


# ---------------------------------------------------------------- winner normalization
# One canonical key per supplier. "DANILYN'S ENTERPRISES, INC.", "Danilyns Enterprises Inc" and
# "DANILYN'S ENTERPRISES INCORPORATED" are the same firm; profile pages and concentration metrics
# are wrong if they count as three. Apostrophes/periods are deleted (DANILYN'S -> DANILYNS), other
# punctuation becomes a space, whitespace collapses, and corporate-suffix tokens are stripped from
# the END only -- "CO" inside a name survives, a trailing "CO., LTD." does not.
_SUFFIX = {"INC", "INCORPORATED", "CORP", "CORPORATION", "CO", "COMPANY", "LTD", "LIMITED", "OPC"}


def norm_winner(name):
    if not name:
        return None
    s = re.sub(r"[^A-Z0-9 ]+", " ", re.sub(r"['’.]", "", name.upper()))
    toks = s.split()
    while len(toks) > 1 and toks[-1] in _SUFFIX:
        toks.pop()
    return " ".join(toks) or None


def migrate(db):
    """Idempotent: adds winner_norm + its index, backfills it for rows that lack it."""
    cols = {r[1] for r in db.execute("pragma table_info(awards)")}
    if "winner_norm" not in cols:
        db.execute("alter table awards add column winner_norm text")
    db.execute("create index if not exists awards_winner_norm on awards(winner_norm)")
    db.execute("create index if not exists awards_buyer_org on awards(buyer_org)")
    # expression index: entity dossiers join on cast(ref_id as integer), which
    # became a 5.5M-row scan after the bettergov bulk import
    db.execute("create index if not exists awards_ref_int"
               " on awards(cast(ref_id as integer)) where ref_id is not null")
    # similar-awards matches lower(trim(classification)) — a full 5M-row scan per
    # NOTICE PAGE VIEW on prod (~15s cold on shared CPU); only API rows carry it
    db.execute("create index if not exists awards_class"
               " on awards(lower(trim(classification))) where classification is not null")
    rows = db.execute("select award_id, winner from awards"
                      " where winner is not null and winner_norm is null").fetchall()
    if rows:
        db.executemany("update awards set winner_norm=? where award_id=?",
                       [(norm_winner(w), i) for i, w in rows])
        print(f"winner_norm: backfilled {len(rows)} rows")
    db.commit()


def one_award(award_id, ref_id=None, org_id=None):
    """Everything reachable for one award. ref_id unlocks area_of_delivery/mode/buyer."""
    an = call("AwardAbstract_GetAwardNotice", awardID=award_id)
    if not an:
        return None
    a = an[0]
    time.sleep(PAUSE)
    sup = call("AwardAbstract_GetAwardedSupplier", awardID=award_id, refID=ref_id or 0)
    s = sup[0] if sup else {}
    time.sleep(PAUSE)
    li = call("AwardAbstract_GetLineItem", awardID=award_id)
    abc = li[0].get("Budget") if li else None
    n = {}
    if ref_id:                      # GetNotice genuinely validates refID -- bogus returns []
        time.sleep(PAUSE)
        got = call("AwardAbstract_GetNotice", refID=ref_id, awardID=award_id)
        n = got[0] if got else {}
        if n.get("ApprovedBudget"):
            abc = n["ApprovedBudget"]
    amt = a.get("ContractAmount")
    addr = s.get("OrgAddress")
    return dict(
        award_id=int(award_id), ref_id=ref_id, org_id=org_id,
        contract_amount=amt, abc=abc,
        win_ratio=(amt / abc) if (amt and abc) else None,
        award_date=a.get("AwardDate"), publish_date=a.get("PublishDate"),
        closing_date=a.get("ClosingDate"), contract_no=a.get("ContractNo"),
        unspsc=str(a.get("UNSPSCCode")), unspsc_desc=a.get("UNSPSCDescription"),
        doc_count=a.get("DocumentCount"), status_id=a.get("AwardStatusID"),
        title=a.get("ContractTitle") or n.get("Title"),
        description=(li[0].get("Description") if li else None),
        created_by=a.get("CreatedBy"), approver=a.get("Approver"),
        winner=s.get("OrgName"), winner_norm=norm_winner(s.get("OrgName")),
        winner_address=addr, winner_contact=s.get("ContactPerson"),
        winner_province=province(addr),
        area_of_delivery=n.get("AreaOfDelivery"),
        procurement_mode=n.get("ProcurementMode"), classification=n.get("Classification"),
        category=n.get("Category"), buyer_org=n.get("CreatedBy"),
        source="listing" if ref_id else "enumerated",
        fetched_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
    )


def save(db, rows, ignore=False):
    rows = [r for r in rows if r]
    if not rows:
        return 0
    cols = list(rows[0])
    verb = "insert or ignore" if ignore else "insert or replace"
    cur = db.executemany(
        f"{verb} into awards({','.join(cols)}) values ({','.join('?' * len(cols))})",
        [[r[c] for c in cols] for r in rows])
    db.commit()
    return cur.rowcount if ignore else len(rows)


# ---------------------------------------------------------------- listing (gives ref_id)
ROW = re.compile(r'RefID=(\d+)&amp;LineItemID=(\d+)&amp;OrgID=(\d+)&amp;AwardID=(\d+)')


def _hidden(h, name):
    m = (re.search(r'name="' + re.escape(name) + r'"[^>]*value="([^"]*)"', h)
         or re.search(r'value="([^"]*)"[^>]*name="' + re.escape(name) + r'"', h))
    return __import__("html").unescape(m.group(1)) if m else ""


def listing_ids():
    """Walk all 5 pages of the rolling-100 listing via ASP.NET postbacks.

    area_of_delivery is only reachable with a real ref_id, and ref_ids only come from here, so
    every extra page directly buys sample size for the outsider-win-rate metric.
    """
    ua = {"User-Agent": H["User-Agent"]}
    with urllib.request.urlopen(urllib.request.Request(LIST, headers=ua), timeout=45) as r:
        h = r.read().decode("utf-8", "replace")
    out = [(a, ref, org) for ref, li, org, a in ROW.findall(h)]
    for page in range(2, 6):
        form = {"__EVENTTARGET": f"pgCtrlAwardNoticeSearch$numberPage_{page}", "__EVENTARGUMENT": "",
                "__VIEWSTATE": _hidden(h, "__VIEWSTATE"),
                "__VIEWSTATEGENERATOR": _hidden(h, "__VIEWSTATEGENERATOR"),
                "__EVENTVALIDATION": _hidden(h, "__EVENTVALIDATION")}
        req = urllib.request.Request(LIST, data=urllib.parse.urlencode(form).encode(),
                                     headers={**ua, "Content-Type": "application/x-www-form-urlencoded",
                                              "Referer": LIST})
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                h2 = r.read().decode("utf-8", "replace")
        except Exception as e:
            print(f"  page {page}: {e}"); break
        found = [(a, ref, org) for ref, li, org, a in ROW.findall(h2)]
        new = [t for t in found if t not in out]
        print(f"  page {page}: {len(found)} rows, {len(new)} new")
        if not new:
            break
        out += new
        h = h2               # VIEWSTATE rolls forward with each postback
        time.sleep(1.0)
    return out


def run_blocks(db, nblocks, size):
    """Sample CONTIGUOUS awardID blocks, not scattered ids.

    Repeat-winner concentration needs several awards from the SAME procuring office. Award ids are
    issued sequentially as offices post, so consecutive ids cluster by office; a random draw across
    1.19M ids would essentially never hit one office twice and the metric would read as 'no
    repetition' purely as an artefact of the sampling.
    """
    rnd = random.Random(20260809)
    starts = [rnd.randrange(ID_LO, ID_HI - size) for _ in range(nblocks)]
    ids = [s + i for s in starts for i in range(size)]
    seen = {r[0] for r in db.execute("select award_id from awards")}
    ids = [i for i in ids if i not in seen]
    print(f"blocks: {nblocks} x {size} consecutive ids = {len(ids)} to fetch")
    done = 0
    with ThreadPoolExecutor(WORKERS) as pool:
        for r in pool.map(one_award, ids):
            done += save(db, [r])
            if done % 50 == 0:
                print(f"  {done}/{len(ids)}")
    print(f"  saved {done}/{len(ids)}")


def run_listing(db):
    ids = listing_ids()
    print(f"listing: {len(ids)} awards with ref_id")
    with ThreadPoolExecutor(WORKERS) as pool:
        rows = list(pool.map(lambda t: one_award(t[0], t[1], t[2]), ids))
    n = save(db, rows)
    print(f"  saved {n}")


def run_enumerate(db, count):
    seen = {r[0] for r in db.execute("select award_id from awards")}
    ids = random.Random(20260809).sample(range(ID_LO, ID_HI), count * 2)
    ids = [i for i in ids if i not in seen][:count]
    print(f"enumerating {len(ids)} random awardIDs in [{ID_LO:,}, {ID_HI:,}]")
    done = 0
    with ThreadPoolExecutor(WORKERS) as pool:
        for r in pool.map(one_award, ids):
            done += save(db, [r])
            if done % 40 == 0:
                print(f"  {done}/{len(ids)}")
    print(f"  saved {done}/{len(ids)}")


# ---------------------------------------------------------------- backfill (M5 W-A)
def meta_get(db, k, default=None):
    r = db.execute("select v from meta where k=?", (k,)).fetchone()
    return r[0] if r else default


def meta_set(db, k, v):
    db.execute("insert or replace into meta(k, v) values (?, ?)", (k, str(v)))
    db.commit()


def _bad_http():
    return sum(n for c, n in HTTP_ERRS.items() if c == 403 or c >= 500)


def probe_hi(db):
    """Refresh the top of the awardID space -- awards keep growing (~50K/month).

    Expand upward from the best known max until a probe level misses, then binary-search the
    boundary. The frontier has stray gaps, so a 'miss' is three consecutive dead ids, not one.
    Misses are cheap (HTTP 200 with an empty Value, no retry loop). Precision to ~48 ids is
    plenty: the descending sweep pays one call per dead id and stores nothing.
    """
    base = db.execute("select max(award_id) from awards").fetchone()[0] or ID_HI
    base = max(base, int(meta_get(db, "id_hi", 0)), ID_HI)

    def alive(i):
        for j in (i, i + 1, i + 2):
            time.sleep(PAUSE)
            if call("AwardAbstract_GetAwardNotice", awardID=j):
                return True
        return False

    lo, step = base, 1024
    while step <= 262_144 and alive(lo + step):
        lo += step
        step *= 2
    hi = lo + step
    while hi - lo > 48:
        mid = (lo + hi) // 2
        if alive(mid):
            lo = mid
        else:
            hi = mid
    meta_set(db, "id_hi", hi)
    print(f"id_hi probe: frontier ~{hi:,} (base was {base:,})")
    return hi


def run_backfill(db, budget=3600, batch=500):
    """Sweep awardIDs DESCENDING from the frontier (newest first), resumable across runs.

    Two meta keys carry the state: backfill_cursor is the next id of the main descending sweep;
    backfill_top is the frontier that sweep has already covered up to, so ids minted since the
    last run (above backfill_top) are fetched FIRST, then the sweep continues downward. No
    GetNotice calls here -- ref_id is unknown during enumeration and GetNotice validates it, so
    every award costs exactly 3 calls (notice, supplier, line item), 1 if the id is dead.
    Misses are not stored; a run that dies mid-gap re-probes a few dead ids next time, one call
    each. Backs off on 403/5xx: sleep 60, halve workers. --budget-seconds stops cleanly.
    """
    deadline = time.time() + budget
    hi = probe_hi(db)
    seen = {r[0] for r in db.execute("select award_id from awards")}
    top = int(meta_get(db, "backfill_top", 0))
    cursor = int(meta_get(db, "backfill_cursor", 0))
    if not cursor:                                   # first ever run
        cursor = top = hi
        meta_set(db, "backfill_top", top)
        meta_set(db, "backfill_cursor", cursor)
    gap = [i for i in range(hi, top, -1) if i not in seen]
    print(f"backfill: frontier {hi:,}  cursor {cursor:,}  gap {len(gap)} new ids  budget {budget}s")

    workers = WORKERS
    done = miss = 0
    t0 = time.time()

    def grab(i):
        r = one_award(i)
        if r:
            r["source"] = "backfill"
        return r

    def process(ids, on_chunk=None):
        """Fetch ids in small chunks; False the moment the deadline fires."""
        nonlocal workers, done, miss
        k = 0
        while k < len(ids):
            if time.time() >= deadline:
                return False
            chunk = ids[k:k + max(1, min(batch, workers * 10))]
            bad0 = _bad_http()
            with ThreadPoolExecutor(workers) as pool:
                rows = list(pool.map(grab, chunk))
            got = save(db, rows, ignore=True)
            done += got
            miss += sum(1 for r in rows if not r)
            k += len(chunk)
            if on_chunk:
                on_chunk(chunk)
            rate = done / max(time.time() - t0, 1e-9) * 60
            print(f"  {time.strftime('%H:%M:%S')}  +{got}/{len(chunk)}  saved {done}  miss {miss}"
                  f"  {rate:.0f} rows/min  workers {workers}", flush=True)
            if _bad_http() > bad0:
                workers = max(1, workers // 2)
                print(f"  host sent 403/5xx -> sleep 60, workers now {workers}", flush=True)
                time.sleep(min(60, max(0, deadline - time.time())))
        return True

    ok = process(gap) if gap else True
    if ok:
        meta_set(db, "backfill_top", hi)             # gap fully swept (or empty)
        while cursor >= ID_LO and time.time() < deadline:
            window_lo = max(ID_LO - 1, cursor - 3000)
            ids = [i for i in range(cursor, window_lo, -1) if i not in seen]

            def bump(chunk):
                nonlocal cursor
                cursor = chunk[-1] - 1               # ids are descending; seen gaps are stored
                meta_set(db, "backfill_cursor", cursor)

            if ids and not process(ids, bump):
                break
            cursor = window_lo
            meta_set(db, "backfill_cursor", cursor)
    el = time.time() - t0
    print(f"backfill stop: saved {done}  miss {miss}  in {el:.0f}s"
          f"  ({done / max(el, 1) * 60:.0f} rows/min)  cursor {cursor:,}"
          f"  http_errs {dict(HTTP_ERRS) or '{}'}")


# ---------------------------------------------------------------- coverage (W-A gate artifact)
def coverage(db):
    q = lambda s, *a: db.execute(s, a).fetchall()
    per = [n for (n,) in q("select count(*) from awards where winner_norm is not null"
                           " group by winner_norm")]
    dist = Counter()
    for n in per:
        dist["1"] += n == 1
        dist["2"] += n == 2
        dist["3-5"] += 3 <= n <= 5
        dist["6-10"] += 6 <= n <= 10
        dist["11+"] += n >= 11
    joinable = 0
    cdb = Path(__file__).parent / "corpus.db"
    if cdb.exists():
        c = sqlite3.connect(f"file:{cdb}?mode=ro", uri=True)
        legacy = {r[0] for r in c.execute("select id from corpus where source='legacy'")}
        c.close()
        joinable = sum(1 for (r,) in q("select cast(ref_id as integer) from awards"
                                       " where ref_id is not null") if r in legacy)
    out = dict(
        generated_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        total_awards=q("select count(*) from awards")[0][0],
        by_year=dict(q("select substr(award_date, -4), count(*) from awards"
                       " where award_date is not null group by 1 order by 1")),
        by_source=dict(q("select source, count(*) from awards group by 1")),
        distinct_winner_norm=q("select count(distinct winner_norm) from awards"
                               " where winner_norm is not null")[0][0],
        top10_winners_by_value=[dict(winner_norm=w, awards=n, total_value=v)
                                for w, n, v in q("""
            select winner_norm, count(*), round(sum(contract_amount)) from awards
            where winner_norm is not null and contract_amount is not null
            group by 1 order by 3 desc limit 10""")],
        joinable_to_corpus_via_ref_id=joinable,
        awards_per_winner=dict(dist),
        with_abc=q("select count(*) from awards where abc is not null")[0][0],
        with_win_ratio=q("select count(*) from awards where win_ratio is not null")[0][0],
        id_hi=int(meta_get(db, "id_hi", ID_HI)),
        backfill_cursor=int(meta_get(db, "backfill_cursor", 0)),
    )
    text = json.dumps(out, indent=2)
    (Path(__file__).parent / "awards-coverage.json").write_text(text + "\n")
    print(text)


# ---------------------------------------------------------------- metrics
def metrics(db):
    q = lambda s, *a: db.execute(s, a).fetchall()
    tot = q("select count(*) from awards")[0][0]
    print(f"awards in db: {tot}\n")

    print("=== AwardStatusID (resolve before trusting anything else)")
    for sid, n in q("select status_id, count(*) from awards group by 1 order by 2 desc"):
        print(f"  status {sid}: {n}")

    print("\n=== 1. OUTSIDER WIN RATE  (needs area_of_delivery -> listing rows only)")
    rows = q("""select winner_province, area_of_delivery from awards
                where winner_province is not null and area_of_delivery is not null""")
    if rows:
        out = sum(1 for w, a in rows if province(a) != w)
        print(f"  n={len(rows)}  outsider={out} ({out/len(rows):.0%})  local={len(rows)-out}")
        for w, a in rows[:12]:
            print(f"    {'OUT' if province(a) != w else 'loc'}  winner {w:<18} delivery {a}")
    else:
        print("  no rows with both provinces -- run 'listing' first")
    miss = q("select count(*) from awards where winner_address is not null and winner_province is null")[0][0]
    print(f"  unparsed winner provinces: {miss}")

    print("\n=== 2. REPEAT-WINNER CONCENTRATION  (per DISTINCT PROCUREMENT, not per award row)")
    # One procurement is split across many award rows, one per line item -- 9 consecutive awards for
    # "GUINUYORAN CS MARCH 2026 SVP" (P25 to P21,825) are one shopping list, not nine competitions.
    # Counting award rows makes a single procurement look like total supplier capture. Collapse to
    # (officer, title, award_date) first. This matters most under contiguous-id sampling, which
    # deliberately draws neighbouring rows and therefore concentrates the artefact.
    for col, label in (("created_by", "procuring officer (proxy for office)"), ("buyer_org", "buyer org")):
        proc = q(f"""select {col}, title, award_date, winner, count(*) rows
                     from awards where {col} is not null and winner is not null
                     group by 1,2,3,4""")
        if not proc:
            print(f"  {label}: no data"); continue
        by, splits = {}, 0
        for k, title, date, w, rows in proc:
            by.setdefault(k, []).append(w)
            splits += rows - 1
        multi = {k: v for k, v in by.items() if len(v) >= 3}
        print(f"  {label}: {len(by)} entities, {len(multi)} with >=3 distinct procurements"
              f"  ({splits} award rows collapsed as line-item splits)")
        if multi:
            share = [Counter(v).most_common(1)[0][1] / len(v) for v in multi.values()]
            share.sort()
            print(f"    top-firm share of an entity's procurements: median {share[len(share)//2]:.0%}")
            for k, v in sorted(multi.items(), key=lambda kv: -len(kv[1]))[:6]:
                top, c = Counter(v).most_common(1)[0]
                print(f"      {str(k)[:32]:<32} {len(v)} procurements, top firm {c}/{len(v)}  {top[:24]}")
        else:
            print("    nobody in this sample has 3+ distinct procurements -- sample is too thin"
                  " to measure concentration; needs entity-targeted collection, not random ids")

    print("\n=== win ratio (ContractAmount / ABC)")
    rs = [r[0] for r in q("select win_ratio from awards where win_ratio between 0 and 2")]
    if rs:
        rs.sort()
        pct = lambda p: rs[int(p * (len(rs) - 1))]
        print(f"  n={len(rs)}  p10 {pct(.1):.1%}  median {pct(.5):.1%}  p90 {pct(.9):.1%}")
        print(f"  at exactly 100% of ABC: {sum(1 for r in rs if abs(r-1) < 1e-9)} ({sum(1 for r in rs if abs(r-1)<1e-9)/len(rs):.0%})")
        print(f"  above ABC (>100%): {sum(1 for r in rs if r > 1.0000001)}")

    print("\n=== winner geography (all rows)")
    for p, n in q("""select winner_province, count(*) from awards where winner_province is not null
                     group by 1 order by 2 desc limit 8"""):
        print(f"  {n:>5}  {p}")
    print("\n=== most frequent winning firms")
    for w, n in q("select winner, count(*) from awards where winner is not null group by 1 order by 2 desc limit 8"):
        print(f"  {n:>4}  {w[:52]}")


def selfcheck():
    assert province("Purok-5 Inamnan Pequeno Guinobatan Albay, Region V, Philippines") == "Albay"
    assert province("Blk 7 Lot 19 T.S. Cruz Las Pinas City Metro Manila, NCR, Philippines") == "Metro Manila"
    # longest-match: must not return "Samar" or "Davao"
    assert province("Brgy 1, Catarman, Northern Samar, Philippines") == "Northern Samar"
    assert province("Tagum City, Davao del Norte") == "Davao del Norte"
    assert province(None) is None and province("no province here") is None
    # winner_norm: one canonical key per supplier
    assert norm_winner("DANILYN'S ENTERPRISES, INC.") == "DANILYNS ENTERPRISES"
    assert norm_winner("Danilyns  Enterprises Incorporated") == "DANILYNS ENTERPRISES"
    assert norm_winner("F & Q ENTERPRISES") == "F Q ENTERPRISES"
    assert norm_winner("Acme Trading Co., Ltd.") == "ACME TRADING"
    assert norm_winner("ACME CORP") == norm_winner("Acme Corporation") == "ACME"
    # suffix stripped from the END only; never strip a name down to nothing
    assert norm_winner("CO CO") == "CO" and norm_winner("INC") == "INC"
    assert norm_winner(None) is None and norm_winner(" .,' ") is None
    print("ok")


def run_recent(db, count, span=120_000):
    """Sample the TOP of the awardID space: recently-awarded, i.e. currently-active bidders.

    Award ids are monotonic with date (~50K/month), so the last ~120K ids is roughly the trailing
    quarter. A firm that won three months ago is a live prospect; one that won in 2024 may not
    exist. Spread the sample rather than taking a contiguous block -- consecutive ids are line
    items of ONE procurement by ONE office, so a block would over-sample a handful of firms.
    """
    rnd = random.Random(20260809)
    lo = max(ID_LO, ID_HI - span)
    seen = {r[0] for r in db.execute("select award_id from awards")}
    ids = [i for i in rnd.sample(range(lo, ID_HI), min(count * 2, ID_HI - lo)) if i not in seen][:count]
    print(f"recent: {len(ids)} ids sampled from [{lo:,}, {ID_HI:,}] (~trailing quarter)")
    done = 0
    with ThreadPoolExecutor(WORKERS) as pool:
        for r in pool.map(one_award, ids):
            done += save(db, [r])
            if done % 50 == 0:
                print(f"  {done}/{len(ids)}", flush=True)
    print(f"  saved {done}/{len(ids)}")


def prospects(db, province=None, min_awards=1, limit=60):
    """Rank award winners as outreach targets.

    Ordering is by number of DISTINCT procurements won, not award rows -- one procurement is split
    across a row per line item, so counting rows would rank a firm that won one nine-item shopping
    list above a firm that won three separate competitions.

    NOTE, and it is the whole practical constraint: PhilGEPS publishes the winner's company name,
    a contact person and a street address. It publishes NO email and NO phone. This is a targeting
    list; reaching them needs a separate lookup.
    """
    rows = db.execute("""
        select winner, winner_province, winner_address, winner_contact,
               count(distinct coalesce(title,'') || '|' || coalesce(award_date,'')) procurements,
               count(*) award_rows,
               sum(contract_amount) total,
               max(award_date) last_win,
               sum(case when area_of_delivery is not null
                         and lower(area_of_delivery) <> lower(coalesce(winner_province,'~'))
                        then 1 else 0 end) out_of_province
        from awards where winner is not null
        group by winner
    """).fetchall()
    out = []
    for w, prov, addr, person, procs, arows, total, last, oop in rows:
        if province and (prov or "").lower() != province.lower():
            continue
        if procs < min_awards:
            continue
        out.append(dict(winner=w, province=prov, address=addr, contact=person,
                        procurements=procs, award_rows=arows, total=total or 0,
                        last_win=last, out_of_province=oop))
    out.sort(key=lambda d: (-d["procurements"], -d["total"]))
    return out[:limit]


def main():
    db = sqlite3.connect(DB)
    db.executescript(SCHEMA)
    migrate(db)
    cmd = sys.argv[1] if len(sys.argv) > 1 else "metrics"
    if cmd == "backfill":
        budget, batch, args = 3600, 500, sys.argv[2:]
        for i, a in enumerate(args):
            if a == "--budget-seconds":
                budget = int(args[i + 1])
            elif a == "--batch":
                batch = int(args[i + 1])
        run_backfill(db, budget, batch)
        return
    elif cmd == "coverage":
        coverage(db)
        return
    elif cmd == "listing":
        run_listing(db)
    elif cmd == "enumerate":
        run_enumerate(db, int(sys.argv[2]) if len(sys.argv) > 2 else 200)
    elif cmd == "recent":
        run_recent(db, int(sys.argv[2]) if len(sys.argv) > 2 else 400)
    elif cmd == "prospects":
        prov = sys.argv[2] if len(sys.argv) > 2 else None
        for i, p in enumerate(prospects(db, province=prov), 1):
            print(f"{i:>3}. {p['winner'][:44]:<44} {p['procurements']:>2} wins  "
                  f"P{p['total']:>12,.0f}  {str(p['province'])[:16]:<16} last {p['last_win']}")
            print(f"     {str(p['contact'])[:38]:<38} {str(p['address'])[:70]}")
        return
    elif cmd == "blocks":
        run_blocks(db, int(sys.argv[2]) if len(sys.argv) > 2 else 15,
                   int(sys.argv[3]) if len(sys.argv) > 3 else 20)
    metrics(db)


if __name__ == "__main__":
    selfcheck() if sys.argv[1:2] == ["test"] else main()
