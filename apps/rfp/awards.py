#!/usr/bin/env python3
"""Legacy PhilGEPS award notices -> awards.db, plus the two metrics from issue #141.

    python3 awards.py listing            # rolling-100 listing: refID+orgID (needed for AreaOfDelivery)
    python3 awards.py enumerate N        # random sample of N awardIDs across the id space
    python3 awards.py blocks K M         # K contiguous blocks of M ids (for repeat-winner)
    python3 awards.py metrics
    python3 awards.py test

Why two ingest modes (see NOTES-awards.md):
  refID is IGNORED by GetAwardedSupplier and arbitrary awardIDs resolve, so winner + price + ABC
  are enumerable with no listing at all. But GetNotice validates refID, so AreaOfDelivery (the
  delivery province) is ONLY available for awards harvested from the listing. Outsider-win-rate
  therefore runs on the listing subset; win-ratio and repeat-winner run on the enumerated sample.
"""
import json, os, random, re, sqlite3, sys, time, urllib.parse, urllib.request
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


def call(method, **params):
    url = SVC + method + "?" + urllib.parse.urlencode(params)
    for n in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=45) as r:
                return json.load(r)["d"].get("Value") or []
        except Exception:
            time.sleep(2 + 3 * n)
    return None


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
        winner=s.get("OrgName"), winner_address=addr, winner_contact=s.get("ContactPerson"),
        winner_province=province(addr),
        area_of_delivery=n.get("AreaOfDelivery"),
        procurement_mode=n.get("ProcurementMode"), classification=n.get("Classification"),
        category=n.get("Category"), buyer_org=n.get("CreatedBy"),
        source="listing" if ref_id else "enumerated",
        fetched_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
    )


def save(db, rows):
    rows = [r for r in rows if r]
    if not rows:
        return 0
    cols = list(rows[0])
    db.executemany(
        f"insert or replace into awards({','.join(cols)}) values ({','.join('?' * len(cols))})",
        [[r[c] for c in cols] for r in rows])
    db.commit()
    return len(rows)


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
    cmd = sys.argv[1] if len(sys.argv) > 1 else "metrics"
    if cmd == "listing":
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
