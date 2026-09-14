#!/usr/bin/env python3
"""Bulk-import BetterGov's PhilGEPS award dump (bettergov/philgeps.parquet, ~5.5M rows,
CC0, https://huggingface.co/datasets/bettergovph/philgeps-data) into awards.db.

- SELECT DISTINCT over all data columns: the dump explodes one award into identical
  rows per line item (e.g. "Furniture" x832 at the same amount) — summing those would
  fabricate supplier totals, so identical rows collapse to one.
- source='bettergov'; the API sweep (awards.py) remains the 2026+ freshness path.
- Idempotent: wipes source='bettergov' and re-imports.
- Short transactions (10K rows) so a concurrently running `awards.py backfill`
  (default 5s sqlite busy timeout) never starves.
"""
import sqlite3, sys, time
from datetime import date
import duckdb
from awards import norm_winner

DB = "awards.db"
PARQUET = "bettergov/philgeps.parquet"
BATCH = 10_000

def main():
    dk = duckdb.connect()
    # award_date > today = source typos (2033/2034); they'd top every "recent wins" list.
    cur = dk.execute(f"""
        select distinct reference_id, contract_no, award_title, awardee_name,
               organization_name, area_of_delivery, business_category,
               contract_amount, strftime(award_date, '%Y-%m-%d')
        from '{PARQUET}'
        where award_date is null or award_date <= date '{date.today().isoformat()}'
    """)
    db = sqlite3.connect(DB, timeout=30)
    db.execute("delete from awards where source='bettergov'")
    db.commit()
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    total = 0
    while True:
        rows = cur.fetchmany(BATCH)
        if not rows:
            break
        db.executemany(
            "insert into awards (ref_id, contract_no, title, winner, buyer_org,"
            " area_of_delivery, category, contract_amount, award_date, winner_norm,"
            " source, fetched_at) values (?,?,?,?,?,?,?,?,?,?, 'bettergov', ?)",
            [(*r, norm_winner(r[3]), now) for r in rows])
        db.commit()
        total += len(rows)
        if total % 500_000 == 0:
            print(f"{total:,} rows", flush=True)
    print(f"done: {total:,} bettergov rows imported")
    n, = db.execute("select count(*) from awards where source='bettergov'").fetchone()
    assert n == total, (n, total)
    # self-check: no identical-row inflation survived
    dup, = db.execute("""select count(*) from (select 1 from awards where source='bettergov'
        group by ref_id, contract_no, title, winner, buyer_org, area_of_delivery,
        category, contract_amount, award_date having count(*) > 1)""").fetchone()
    assert dup == 0, f"{dup} duplicate groups"
    db.close()

if __name__ == "__main__":
    sys.exit(main())
