#!/usr/bin/env python3
"""Similar-awards query for the M4 notice detail page. CLI contract is FROZEN in
webapp/web/src/lib/enrich-types.ts:

    python3 awards_similar.py --classification "Civil Works" --province "Cavite" --abc 3900000
    -> JSON array of SimilarAward, best-first, max 5. [] when nothing matches or no db.

Ranking: same classification (case-insensitive) is the filter; province match
(winner_province OR area_of_delivery) outranks non-match; within a tier, awards whose
budget sits in 0.3-3x of --abc outrank the rest; newest award_date last tiebreak.
stdlib only.
"""
import argparse
import json
import os
import sqlite3
import sys
from datetime import datetime

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "awards.db")
MAX = 5


def parse_date(s):
    try:
        return datetime.strptime((s or "").strip(), "%d-%b-%Y").timestamp()
    except ValueError:
        return 0.0


def similar(classification, province=None, abc=None, db=DB):
    if not classification or not os.path.exists(db):
        return []
    con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    rows = con.execute(
        "select winner, winner_province, title, contract_amount, abc, win_ratio, award_date,"
        # the explicit not-null term is REQUIRED: awards_class is a partial index and
        # SQLite won't infer the predicate from the expression comparison alone --
        # without it this is a 5M-row scan per notice-page view (~15s warm on prod)
        " area_of_delivery from awards where classification is not null"
        " and lower(trim(classification)) = ?"
        " and winner is not null and trim(winner) != '' and contract_amount is not null",
        (classification.strip().lower(),)).fetchall()
    con.close()
    prov = (province or "").strip().lower()

    def in_band(r):
        # HARD filter, not a ranking tier: a P3.2M "similar" award on a P4.6K notice is junk.
        if not abc:
            return True
        budget = r[4] if r[4] else r[3]           # award-side abc, else contract amount
        return bool(budget) and 0.3 * abc <= budget <= 3 * abc

    def key(r):
        winner_prov = (r[1] or "").strip().lower()
        area = (r[7] or "").strip().lower()
        prov_match = bool(prov) and (prov == winner_prov or (area and prov in area))
        return (not prov_match, -parse_date(r[6]))

    return [
        {"winner": r[0].strip(), "winner_province": (r[1] or "").strip() or None,
         "title": (r[2] or "").strip(), "contract_amount": r[3], "abc": r[4],
         "win_ratio": r[5], "award_date": (r[6] or "").strip()}
        for r in sorted(filter(in_band, rows), key=key)[:MAX]
    ]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--classification", default="")
    ap.add_argument("--province", default=None)
    ap.add_argument("--abc", type=float, default=None)
    ap.add_argument("--db", default=DB)
    a = ap.parse_args()
    try:
        print(json.dumps(similar(a.classification, a.province, a.abc, a.db)))
    except sqlite3.Error as e:
        print(f"awards_similar: {e}", file=sys.stderr)
        print("[]")


if __name__ == "__main__":
    main()
