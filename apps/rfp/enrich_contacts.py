#!/usr/bin/env python3
"""Resolve phone / website for shortlist companies via Google Places.

    python3 enrich_contacts.py [limit]

PhilGEPS gives company + person + street address and NO email and NO phone, and its own Registered
Merchants directory publishes only membership status and certificate dates -- no contact fields
either. So there is no bulk source inside PhilGEPS and the channel has to come from outside.

Places Text Search is the cheap structured option: ~$0.017 a lookup, one call per company, and it
returns a phone and a website rather than a page to read. Results land in awards.db so the workbook
regenerates with them.

MATCHING IS THE RISK, not the API. "JAMI CONSTRUCTION" in Polomolok is not "Jami Construction" in
Cebu, and a wrong phone number in an outreach list is worse than a blank one -- you call a stranger
and burn the lead. Every hit is therefore scored on name overlap AND province agreement, and
anything below the bar is stored as `weak` for a human to look at rather than silently accepted.
"""
import json, os, re, sqlite3, sys, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).parent
DB = HERE / "awards.db"
URL = "https://places.googleapis.com/v1/places:searchText"
FIELDS = ("places.displayName,places.formattedAddress,places.nationalPhoneNumber,"
          "places.websiteUri,places.businessStatus,places.googleMapsUri")
STOP = {"construction", "supply", "supplies", "trading", "enterprises", "enterprise", "inc",
        "corporation", "corp", "company", "co", "services", "service", "builders", "and",
        "the", "general", "merchandise", "opc", "ltd", "development"}

SCHEMA = """
create table if not exists contacts (
  winner text primary key,
  query text, matched_name text, phone text, website text, maps_uri text,
  address text, status text, confidence text, score real, checked_at text
);
"""


def words(s):
    return {w for w in re.findall(r"[a-z0-9]+", (s or "").lower()) if w not in STOP and len(w) > 1}


def score(company, province, cand_name, cand_addr):
    """Name-token overlap, then a province check. Both matter: the distinctive part of a PH
    contractor's name is often a surname that repeats nationwide."""
    a, b = words(company), words(cand_name)
    overlap = len(a & b) / max(1, len(a))
    prov_ok = bool(province) and province.lower() in (cand_addr or "").lower()
    # The scalar ranks candidates; it must NOT decide confidence on its own. After stopwords,
    # "JAMI CONSTRUCTION AND SUPPLY" reduces to {jami}, so a "Jami Construction" in Cebu scores a
    # perfect 1.0 overlap against a South Cotabato firm. Province is therefore a GATE upstream,
    # not a bonus that a strong name can outvote.
    return round(overlap + (0.35 if prov_ok else 0.0), 3), overlap, prov_ok


def search(company, city_hint):
    body = json.dumps({"textQuery": f"{company} {city_hint}".strip(), "regionCode": "PH",
                       "maxResultCount": 5}).encode()
    req = urllib.request.Request(URL, data=body, headers={
        "Content-Type": "application/json",
        "X-Goog-Api-Key": os.environ["GOOGLE_MAPS_API_KEY"],
        "X-Goog-FieldMask": FIELDS})
    for n in range(3):
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.load(r).get("places", [])
        except Exception as e:
            if n == 2:
                print(f"  api fail {company[:30]}: {e}", file=sys.stderr)
                return []
            time.sleep(2 + 3 * n)


def shortlist(db):
    """Same filter as the workbook, but on ANY 2026 win rather than only the most recent -- a
    construction firm whose latest award happened to be a small materials order should not drop out."""
    INFRA = ("road", "canal", "drainage", "building", "pavement", "water", "bridge",
             "school", "concrete", "construction")
    out = {}
    for w, prov, addr, amt, ad, title in db.execute(
            "select winner, winner_province, winner_address, contract_amount, award_date, title"
            " from awards where winner is not null"):
        try:
            D = datetime.strptime(ad, "%d-%b-%Y")
        except Exception:
            continue
        if D < datetime(2026, 1, 1) or not amt or not (500_000 <= amt <= 15_000_000):
            continue
        if not any(k in (title or "").lower() for k in INFRA):
            continue
        out.setdefault(w, (prov, addr))
    return out


def city_of(addr, province):
    """Places does better with a city than with a purok-level street address."""
    if not addr:
        return province or ""
    a = re.sub(r",?\s*Philippines$", "", addr)
    parts = [p.strip() for p in re.split(r"[,\n]", a) if p.strip()]
    tail = " ".join(parts[-2:]) if len(parts) > 1 else a
    return re.sub(r"\s+", " ", tail)[:60]


def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 10**9
    db = sqlite3.connect(DB)
    db.executescript(SCHEMA)
    done = {r[0] for r in db.execute("select winner from contacts")}
    todo = [(w, p, a) for w, (p, a) in shortlist(db).items() if w not in done][:limit]
    print(f"resolving {len(todo)} companies (already done: {len(done)})")
    tally = {"good": 0, "weak": 0, "none": 0}
    for i, (w, prov, addr) in enumerate(todo, 1):
        hint = city_of(addr, prov)
        cands = search(w, hint) or []
        best, bs, bov, bpk = None, -1, 0.0, False
        for c in cands:
            s, ov, pk = score(w, prov, (c.get("displayName") or {}).get("text"),
                              c.get("formattedAddress"))
            if s > bs:
                best, bs, bov, bpk = c, s, ov, pk
        if not best or bov < 0.5:
            conf = "none"                       # the name does not match, whatever the province
        elif bov >= 0.7 and bpk:
            conf = "good"                       # name AND province agree
        else:
            conf = "weak"                       # plausible, but a human must confirm it
        tally[conf] += 1
        db.execute("insert or replace into contacts values (?,?,?,?,?,?,?,?,?,?,?)", (
            w, f"{w} {hint}",
            (best.get("displayName") or {}).get("text") if best else None,
            best.get("nationalPhoneNumber") if best else None,
            best.get("websiteUri") if best else None,
            best.get("googleMapsUri") if best else None,
            best.get("formattedAddress") if best else None,
            best.get("businessStatus") if best else None,
            conf, bs if best else None,
            datetime.now(timezone.utc).isoformat(timespec="seconds")))
        db.commit()
        if i % 20 == 0:
            print(f"  {i}/{len(todo)}  {tally}", flush=True)
        time.sleep(0.15)
    n_phone = db.execute("select count(*) from contacts where phone is not null"
                         " and confidence in ('good','weak')").fetchone()[0]
    n_web = db.execute("select count(*) from contacts where website is not null"
                       " and confidence in ('good','weak')").fetchone()[0]
    print(f"\n{tally}   phone: {n_phone}  website: {n_web}")
    print(f"cost ~${len(todo)*0.017:.2f} at Places Text Search rates")


def selfcheck():
    s, ov, pk = score("SILVER DRAGON CONSTRUCTION AND LUMBER AND GLASS SUPPLY, INC.",
                      "Negros Occidental",
                      "SILVER DRAGON CONSTRUCTION LUMBER & GLASS SUPPLY, INC.",
                      "Bakyas, Bacolod, 6100 Negros Occidental")
    assert s > 0.85 and pk, (s, ov, pk)
    # a same-surname firm in the wrong province must NOT clear the bar
    # same-surname firm in the WRONG province: strong name overlap, and it must still not pass
    s2, ov2, pk2 = score("JAMI CONSTRUCTION AND SUPPLY", "South Cotabato",
                         "Jami Construction", "Cebu City, Cebu")
    assert ov2 == 1.0 and not pk2, (s2, ov2, pk2)
    conf = "good" if (ov2 >= 0.7 and pk2) else ("weak" if ov2 >= 0.5 else "none")
    assert conf == "weak", "a province mismatch must never be scored 'good'"
    assert words("J. LEE CONSTRUCTION CORPORATION") == {"lee"}
    assert city_of("Villa, Sta. Teresita Cagayan Sta. Teresita Cagayan, Region II, Philippines",
                   "Cagayan").endswith("Region II")
    print("ok")


if __name__ == "__main__":
    selfcheck() if sys.argv[1:2] == ["test"] else main()
