#!/usr/bin/env python3
"""Join the scraped directory onto award winners and record the emails it yields.

    python3 match_directory.py test      # assert-based selfcheck, no DB
    python3 match_directory.py --dry     # show what would be written
    python3 match_directory.py           # write matches into contacts

Runs over EVERY award winner, not just the 153-firm shortlist -- the directory is already
mirrored locally, so widening the join costs nothing and the `All winners` sheet benefits.

MATCHING IS THE RISK, NOT THE DATA. Both name sets must match, not just the winner's:
`enrich_contacts.score()` measures one-sided overlap because Google Places returns one
short candidate name, but joining two directories that way accepts anything sharing a
single generic word. "A AND E MARKETING" reduces to {marketing} after stopwords and so
scored a perfect 1.0 against every firm with "marketing" in its name -- the first draft
handed the same address to two unrelated companies. Jaccard both ways fixes that.

The rest of the gate is inherited from the phone pass: province is a GATE, not a
tiebreaker (after stopwords "JAMI CONSTRUCTION AND SUPPLY" is just {jami}, so a Cebu
"Jami Construction" is a perfect name match for a South Cotabato firm), and a name that
survives on ONE shared token has to match exactly and sit in the right province.
"""
import sqlite3, sys
from datetime import datetime, timezone
from pathlib import Path

from enrich_contacts import words
from save_emails import COLS, migrate

DB = Path(__file__).parent / "awards.db"
MIN_J = 0.6               # Jaccard floor on the distinctive tokens of both names


def province_of(category, address):
    """Directory category reads 'Bataan, Region 3'; fall back to the address text."""
    return f"{(category or '').split(',')[0].strip()} {address or ''}".strip()


def score(company, province, cand_name, cand_where):
    a, b = words(company), words(cand_name)
    shared = a & b
    j = len(shared) / max(1, len(a | b))
    prov_ok = bool(province) and province.lower() in (cand_where or "").lower()
    return j, len(shared), prov_ok


def band(j, shared, prov_ok):
    """good = safe to use. weak = a human checks the source URL first. none = drop it."""
    if j < MIN_J:
        return "none"
    # A single shared token is only ever enough if the two names are otherwise identical
    # AND the province agrees -- that is the {jami} case, and it is where wrong emails
    # come from.
    if shared < 2:
        return "good" if j == 1.0 and prov_ok else "none"
    return "good" if prov_ok else "weak"


def best(company, province, entries):
    """Highest-scoring directory entry for one company, with its confidence band."""
    top, top_j, top_sh, top_pk = None, -1.0, 0, False
    for e in entries:
        j, sh, pk = score(company, province, e["name"],
                          province_of(e["category"], e["address"]))
        # Prefer a province-confirmed match over a marginally better-scoring stranger.
        if (pk, j) > (top_pk, top_j):
            top, top_j, top_sh, top_pk = e, j, sh, pk
    conf = band(top_j, top_sh, top_pk) if top else "none"
    return (top if conf != "none" else None), conf, max(top_j, 0.0)


def candidates(entries):
    """Index by token so each company is scored against plausible rows, not all 1,186."""
    idx = {}
    for e in entries:
        for w in words(e["name"]):
            idx.setdefault(w, []).append(e)
    return idx


def main(dry=False):
    db = sqlite3.connect(DB)
    migrate(db)
    entries = [dict(name=n, address=a, email=m, category=c, url=u) for n, a, m, c, u
               in db.execute("select name, address, email, category, url from ph_directory"
                             " where email is not null")]
    idx = candidates(entries)
    print(f"{len(entries)} directory entries carry an email")

    winners = db.execute(
        "select winner, winner_province, count(*) from awards where winner is not null"
        " group by winner").fetchall()
    # Don't overwrite an address a previous pass already grounded on a real page.
    have = {r[0] for r in db.execute("select winner from contacts where email is not null")}

    rows, tally = [], {"good": 0, "weak": 0}
    for w, prov, _ in winners:
        if w in have:
            continue
        pool = {id(e): e for t in words(w) for e in idx.get(t, [])}.values()
        hit, conf, ov = best(w, prov, list(pool))
        if not hit or conf == "none":
            continue
        tally[conf] += 1
        rows.append((w, hit["email"], hit["url"], conf,
                     f"contactnumbersph directory: {hit['name']} — {hit['address'] or '?'}"
                     f" (name overlap {ov:.2f})",
                     datetime.now(timezone.utc).isoformat(timespec="seconds")))

    print(f"matched {len(rows)} winners  {tally}")
    for r in rows[:15]:
        print(f"  {r[3]:4} {r[0][:40]:42} {r[1]}")
    if dry:
        print("\n--dry: nothing written")
        return
    db.executemany(
        f"insert into contacts (winner, {', '.join(COLS)}) values (?,?,?,?,?,?)"
        " on conflict(winner) do update set "
        + ", ".join(f"{c}=excluded.{c}" for c in COLS), rows)
    db.commit()
    tot = db.execute("select count(*) from contacts where email is not null").fetchone()[0]
    print(f"\nemails on file: {tot}")


def selfcheck():
    E = [dict(name="SILVER DRAGON CONSTRUCTION LUMBER & GLASS SUPPLY, INC.",
              address="Bakyas, Bacolod", email="a@b.ph",
              category="Negros Occidental, Region 6", url="u1"),
         dict(name="Jami Construction", address="Cebu City", email="c@d.ph",
              category="Cebu, Region 7", url="u2")]
    hit, conf, ov = best("SILVER DRAGON CONSTRUCTION AND LUMBER AND GLASS SUPPLY, INC.",
                         "Negros Occidental", E)
    assert conf == "good" and hit["url"] == "u1", (conf, hit)
    # {jami} vs {jami} is a perfect name score in the WRONG province -- must be dropped,
    # not merely downgraded: one token is too thin to hand a stranger an email.
    assert best("JAMI CONSTRUCTION AND SUPPLY", "South Cotabato", E)[1] == "none"
    # ...and the same firm in the RIGHT province is fine.
    assert best("JAMI CONSTRUCTION AND SUPPLY", "Cebu", E)[1] == "good"
    # a company with no plausible entry gets nothing at all
    assert best("ZZZ WIDGETS", "Cebu", E)[1] == "none"
    # one generic shared token must never carry a match: this is the bug that gave two
    # unrelated companies the same address on the first run.
    G = [dict(name="AEROVENT FBM MANUFACTURING", address="Cavite", email="x@y.ph",
              category="Cavite, Region 4-A", url="u3")]
    assert best("ADA MANUFACTURING CORPORATION", "Cavite", G)[1] == "none"
    assert province_of("Bataan, Region 3", "Limay").startswith("Bataan")
    idx = candidates(E)
    assert "jami" in idx and "dragon" in idx, sorted(idx)
    print("ok")


if __name__ == "__main__":
    a = sys.argv[1:2]
    selfcheck() if a == ["test"] else main(dry=(a == ["--dry"]))
