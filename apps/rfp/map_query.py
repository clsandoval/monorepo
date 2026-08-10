#!/usr/bin/env python3
"""Read-only JSON queries behind the M5 "Map" pages (/supplier, /entity).

    python3 map_query.py supplier --norm "ZAFIRE DISTRIBUTORS"
    python3 map_query.py entity --agency "CITY OF QUEZON"
    python3 map_query.py suppliers --min-awards 2

Every subcommand prints one JSON document on stdout and never writes anything:
connections are opened file:...?mode=ro (the backfill owns the write path). A
missing db or an unknown key degrades to {} / [] so callers can null-check.

EVIDENCE-ONLY (ship-blocking, BUILD-SPEC M5): every string this emits is either
a value copied from a row or a computed number with its arithmetic shown in the
evidence line. Descriptors speak about MARKETS, never entities, and the
vocabulary is locked to exactly: concentrated | mixed | open.

awards.db is being backfilled live (~36 rows/min) -- all queries run against
the current file every call; nothing is cached and no count is assumed.
"""
import argparse, json, os, sqlite3, statistics, sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

HERE = Path(__file__).parent
AWARDS_DB = os.environ.get("RFP_AWARDS_DB", str(HERE / "awards.db"))
CORPUS_DB = os.environ.get("RFP_CORPUS_DB", str(HERE / "corpus.db"))


def ro(path):
    """Read-only connection, or None when the file is missing/unreadable."""
    if not Path(path).is_file():
        return None
    try:
        db = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
        db.row_factory = sqlite3.Row
        return db
    except sqlite3.Error:
        return None


def iso(d):
    """'04-Sep-2024' (awards.db award_date format) -> '2024-09-04', else None."""
    try:
        return datetime.strptime(d, "%d-%b-%Y").date().isoformat()
    except (TypeError, ValueError):
        return None


def manila_now():
    """corpus closing_at is naive Manila local time; mirror search.ts manilaNow()."""
    return (datetime.now(timezone.utc) + timedelta(hours=8)).strftime("%Y-%m-%dT%H:%M:%S")


def mode_of(values):
    """Most common non-empty value, or None."""
    c = Counter(v for v in values if v)
    return c.most_common(1)[0][0] if c else None


def med(ratios):
    rs = [r for r in ratios if isinstance(r, (int, float)) and r > 0]
    return round(statistics.median(rs), 4) if rs else None


def buyer_of(row, agency_by_ref):
    """(name, kind): the recorded procuring entity (buyer_org, e.g. bettergov rows),
    else the corpus agency when ref_id joins, else the recording officer. created_by
    is buyer-side staff -- a real person at the procuring office -- so it is labelled
    'recorded_by', never presented as the office itself."""
    if row["buyer_org"]:
        return row["buyer_org"], "agency"
    # bettergov ref_ids can be non-numeric ("2016-03--010") and never join corpus
    if row["ref_id"] and str(row["ref_id"]).isdigit():
        ag = agency_by_ref.get(int(row["ref_id"]))
        if ag:
            return ag, "agency"
    if row["created_by"]:
        return row["created_by"], "recorded_by"
    return None, None


# ---------------------------------------------------------------- supplier
def supplier(norm):
    aw = ro(AWARDS_DB)
    if not aw:
        return {}
    rows = aw.execute("select * from awards where winner_norm = ?", (norm,)).fetchall()
    if not rows:
        return {}

    agency_by_ref = {}
    refs = sorted({int(r["ref_id"]) for r in rows
                   if r["ref_id"] and str(r["ref_id"]).isdigit()})
    co = ro(CORPUS_DB)
    if co and refs:
        qm = ",".join("?" * len(refs))
        agency_by_ref = {r["id"]: r["agency"] for r in co.execute(
            f"select id, agency from corpus where id in ({qm})", refs) if r["agency"]}

    wins = []
    ent = {}   # buyer name -> [n, value]
    for r in rows:
        name, kind = buyer_of(r, agency_by_ref)
        # ref_id is emitted only when it joins a corpus notice — it drives in-app
        # /notice/<id> links, and bettergov's historic refs would 404 there.
        joins = (r["ref_id"] and str(r["ref_id"]).isdigit()
                 and int(r["ref_id"]) in agency_by_ref)
        wins.append(dict(
            award_date_iso=iso(r["award_date"]), title=r["title"],
            contract_amount=r["contract_amount"], abc=r["abc"], win_ratio=r["win_ratio"],
            buyer=name, buyer_kind=kind, classification=r["classification"],
            ref_id=r["ref_id"] if joins else None))
        if name:
            e = ent.setdefault(name, [0, 0.0])
            e[0] += 1
            e[1] += r["contract_amount"] or 0.0
    wins.sort(key=lambda w: w["award_date_iso"] or "", reverse=True)

    # category comes from GetNotice (listing rows only); unspsc_desc covers the rest
    cats = Counter(r["category"] or r["unspsc_desc"] for r in rows
                   if r["category"] or r["unspsc_desc"])
    return dict(
        winner=mode_of(r["winner"] for r in rows) or norm,
        province=mode_of(r["winner_province"] for r in rows),
        totals=dict(
            won_value=round(sum(r["contract_amount"] or 0.0 for r in rows), 2),
            contracts=len(rows),
            entities=len(ent),
            median_win_ratio=med([r["win_ratio"] for r in rows])),
        wins=wins[:50],
        categories=[dict(name=k, n=n) for k, n in cats.most_common()],
        entities=[dict(name=k, n=n, value=round(v, 2)) for k, (n, v) in
                  sorted(ent.items(), key=lambda kv: -kv[1][1])])


# ---------------------------------------------------------------- entity
# Contestability v0 -- computable signals ONLY (BUILD-SPEC W-C; avg-bidders deferred):
#   top_share      share of ref_id-joined award VALUE won by the top supplier
#                  (computed only when >= 3 joined awards exist)
#   price_median   median contract/ABC of joined awards (only when >= 3 have ratios)
#   failed_share   share of this agency's notices whose mode is negotiation after
#                  two failed biddings
#   limited_share  share of notices under limited-competition modes (negotiated /
#                  shopping / direct / limited source), i.e. not open public bidding
# Descriptor cutoffs (simple, documented, market-language only -- describes the
# MARKET around this buyer, never the integrity of any party):
#   concentrated   top_share >= .60  or  failed_share >= .15  or  limited_share >= .75
#   open           (top_share < .35 or not computable) and failed_share < .05
#                  and limited_share < .40
#   mixed          everything else, and the fallback when no mode data exists
# "small value" catches mphilgeps's BARE "small value procurement" mode_norm — legacy spells it
# "negotiated procurement - small value procurement (sec. 34)" (matched by "negotiated") but 29%
# of mphilgeps notices carry the bare form and were silently classed as open competition,
# emitting factually false evidence lines (verified: SLSU 0% shown vs 87% actual).
LIMITED = ("negotiated", "shopping", "direct", "limited source", "small value")


def _signals(modes, joined):
    sig, top_share, failed, limited = [], None, None, None
    total_v = sum(a["contract_amount"] or 0.0 for a in joined)
    if len(joined) >= 3 and total_v > 0:
        by = Counter()
        for a in joined:
            by[a["winner_norm"] or a["winner"] or "?"] += a["contract_amount"] or 0.0
        top_v = by.most_common(1)[0][1]
        top_n = sum(1 for a in joined if (a["winner_norm"] or a["winner"] or "?") == by.most_common(1)[0][0])
        top_share = top_v / total_v
        stat = f"{top_share:.0%}"
        sig.append(dict(key="top_share", stat=stat,
                        evidence=f"{stat} of recorded award value went to one supplier "
                                 f"({top_n} of {len(joined)} awarded contracts on record)"))
        m = med([a["win_ratio"] for a in joined])
        if m is not None:
            stat = f"{m:.0%}"
            sig.append(dict(key="price_median", stat=stat,
                            evidence=f"the median winning price was {stat} of the approved "
                                     f"budget across {len(joined)} recorded awards"))
    if modes:
        n = len(modes)
        k = sum(1 for m in modes if m and "two failed" in m)
        failed = k / n
        stat = f"{failed:.0%}"
        sig.append(dict(key="failed_share", stat=stat,
                        evidence=f"{k} of {n} notices ({stat}) reached negotiation "
                                 f"after two failed biddings"))
        k = sum(1 for m in modes if m and any(t in m for t in LIMITED))
        limited = k / n
        stat = f"{limited:.0%}"
        sig.append(dict(key="limited_share", stat=stat,
                        evidence=f"{k} of {n} notices ({stat}) used limited-competition "
                                 f"modes (negotiated incl. small-value, shopping, or direct)"))
    if (top_share or 0) >= .60 or (failed or 0) >= .15 or (limited or 0) >= .75:
        desc = "concentrated"
    elif failed is not None and limited is not None and failed < .05 and limited < .40 \
            and (top_share is None or top_share < .35):
        desc = "open"
    else:
        desc = "mixed"
    return sig, desc


def entity(agency):
    co = ro(CORPUS_DB)
    if not co:
        return {}
    notices = co.execute(
        "select nid, id, source, title, abc, status, closing_at, publish_at, mode_norm,"
        "       contact, contact_email, contact_phone"
        " from corpus where agency = ?", (agency,)).fetchall()
    if not notices:
        return {}

    nids = [n["nid"] for n in notices]
    qm = ",".join("?" * len(nids))
    province = mode_of(r["location_norm"] for r in co.execute(
        f"select location_norm from notice_location where nid in ({qm})", nids))

    # awards joined two ways: buyer_org = agency (bettergov bulk rows record the
    # procuring entity verbatim -- corpus agency strings match exactly), plus
    # ref_id -> corpus.id for listing-harvested API rows. One query, so a row
    # matching both paths counts once.
    joined = []
    aw = ro(AWARDS_DB)
    if aw:
        ids = sorted({n["id"] for n in notices})
        qm = ",".join("?" * len(ids))
        joined = aw.execute(
            f"select winner, winner_norm, contract_amount, win_ratio, award_date"
            f" from awards where buyer_org = ? or (ref_id is not null"
            f" and cast(ref_id as integer) in ({qm}))", [agency, *ids]).fetchall()

    cutoff = (datetime.now(timezone.utc) + timedelta(hours=8) - timedelta(days=365)).date().isoformat()
    recent = [a for a in joined if (iso(a["award_date"]) or "") >= cutoff]

    by = {}   # winner_norm -> [display Counter, n, value]
    for a in joined:
        key = a["winner_norm"] or a["winner"]
        if not key:
            continue
        e = by.setdefault(key, [Counter(), 0, 0.0])
        e[0][a["winner"] or key] += 1
        e[1] += 1
        e[2] += a["contract_amount"] or 0.0
    total_v = sum(v for _, _, v in by.values())
    winners = [dict(winner_norm=k, winner=c.most_common(1)[0][0], n=n, value=round(v, 2),
                    share=round(v / total_v, 4) if total_v else 0.0)
               for k, (c, n, v) in sorted(by.items(), key=lambda kv: -kv[1][2])][:10]

    signals, desc = _signals([n["mode_norm"] for n in notices], joined)

    now = manila_now()
    open_n = [n for n in notices
              if n["status"] == "Active" and (n["closing_at"] is None or n["closing_at"] >= now)]
    open_n.sort(key=lambda n: n["closing_at"] or "9999")   # nulls (no closing date) last
    open_notices = [dict(id=n["id"], title=n["title"], abc=n["abc"],
                         closing_at=n["closing_at"], source=n["source"]) for n in open_n[:20]]

    contact = None
    for n in sorted(notices, key=lambda n: n["publish_at"] or "", reverse=True):
        if n["contact"] or n["contact_email"] or n["contact_phone"]:
            contact = dict(raw=n["contact"], email=n["contact_email"], phone=n["contact_phone"])
            break

    return dict(
        agency=agency, province=province,
        spend_12mo=dict(value=round(sum(a["contract_amount"] or 0.0 for a in recent), 2),
                        contracts=len(recent)),
        award_count=len(joined),
        winners=winners,
        contestability=dict(signals=signals, descriptor=desc),
        open_notices=open_notices,
        contact=contact)


# ---------------------------------------------------------------- suppliers index
def suppliers(min_awards, limit=500):
    aw = ro(AWARDS_DB)
    if not aw:
        return []
    # SQL aggregate: the python Counter loop was fine at 4K rows, not at 5.5M —
    # and capped, since ~1M-supplier JSON dumps blow exec buffers downstream.
    # max(winner) as display casing is arbitrary-but-stable; this index feeds
    # internal linking/QA only, profile pages pick the modal casing themselves.
    return [dict(winner_norm=k, winner=w, n=n, value=round(v, 2))
            for k, w, n, v in aw.execute(
                "select winner_norm, max(winner), count(*),"
                " sum(coalesce(contract_amount, 0)) from awards"
                " where winner_norm is not null group by winner_norm"
                " having count(*) >= ? order by 4 desc limit ?", (min_awards, limit))]


def main():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("supplier").add_argument("--norm", required=True)
    sub.add_parser("entity").add_argument("--agency", required=True)
    sp = sub.add_parser("suppliers")
    sp.add_argument("--min-awards", type=int, default=2)
    sp.add_argument("--limit", type=int, default=500)
    a = p.parse_args()
    out = (supplier(a.norm) if a.cmd == "supplier"
           else entity(a.agency) if a.cmd == "entity"
           else suppliers(a.min_awards, a.limit))
    json.dump(out, sys.stdout)
    print()


if __name__ == "__main__":
    main()
