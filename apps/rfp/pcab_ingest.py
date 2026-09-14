#!/usr/bin/env python3
"""Ingest a PCAB licensed-contractor list (PDF) into the ph_directory table.

    python3 pcab_ingest.py test                    # parser selfcheck, no network
    python3 pcab_ingest.py <url-or-path> [...]     # ingest one or more lists

PCAB is the Philippine Contractors Accreditation Board: every firm bidding public
infrastructure needs a licence, so its annual list is the closest thing to a census of
the exact population this project targets -- and unlike PhilGEPS, the list carries an
email column. One PDF yields ~1,200 addresses, against roughly one per two searches by
hand, which is why this is the third and best source tried.

Rows land in the SAME table as the scraped web directory so `match_directory.py` joins
both at once with the same name-and-province gate. Nothing here is written onto a
contractor directly.

PARSING IS POSITIONAL AND THE PDF LIES ABOUT IT. `pdftotext -layout` gives space-aligned
columns, but long names and addresses wrap onto continuation lines and some rows omit the
phone entirely, so counting fields from the left silently shifts the address by one. Both
anchors here are content-based instead: the licence number is the only bare 4-6 digit
field, and the province is matched against the provinces the corpus actually knows.
"""
import re, sqlite3, subprocess, sys, tempfile, urllib.request
from pathlib import Path

DB = Path(__file__).parent / "awards.db"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
LICENCE = re.compile(r"^\d{4,6}$")
# The licence number and the company name are separated by a SINGLE space, so the column
# splitter keeps them in one field: "34688 \"SIBELCON\" (SIBELIUS CONSTRUCTION)".
LIC_NAME = re.compile(r"^(\d{4,6})\s+(\S.*)$")
SPLIT = re.compile(r"\s{2,}")

SCHEMA = """
create table if not exists ph_directory (
  url text primary key, name text, address text, phone text, email text,
  category text, fetched_at text
);
"""


def provinces(db):
    """Match addresses against the provinces the corpus actually uses, longest first, so
    'Negros Occidental' wins over 'Negros' and 'Samar' never swallows 'Northern Samar'."""
    rows = {p for (p,) in db.execute(
        "select distinct winner_province from awards where winner_province is not null")}
    return sorted(rows, key=len, reverse=True)


def parse_line(line, provs):
    """One contractor per line, or None if the line isn't a record."""
    m = EMAIL.search(line)
    if not m:
        return None
    email = m.group(0).lower()
    fields = [f.strip() for f in SPLIT.split(line.strip()) if f.strip()]
    licence = name = None
    for i, f in enumerate(fields):
        if m2 := LIC_NAME.match(f):                       # "34688 SIBELCON ..."
            licence, name = m2.group(1), m2.group(2)
            break
        if LICENCE.fullmatch(f) and i + 1 < len(fields):  # licence alone in its column
            licence, name = f, fields[i + 1]
            break
    if not licence:
        return None
    # Trade names are quoted in the source: '"SIBELCON" (SIBELIUS CONSTRUCTION)'. Drop the
    # quotes wherever they fall so both halves survive as match tokens.
    name = re.sub(r"\s+", " ", name.replace('"', " ")).strip()
    if len(name) < 3:
        return None
    addr = next((f for f in fields if any(p.lower() in f.lower() for p in provs)), None)
    prov = None
    if addr:
        prov = next((p for p in provs if p.lower() in addr.lower()), None)
    phone = next((f for f in fields
                  if re.fullmatch(r"[\d()+\-/ .]{7,}", f) and not LICENCE.fullmatch(f)), None)
    return dict(licence=licence, name=name, address=addr, phone=phone,
                email=email, category=prov)


def load(src):
    if re.match(r"https?://", src):
        req = urllib.request.Request(src, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=120) as r, \
                tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            f.write(r.read())
            path = f.name
    else:
        path = src
    return subprocess.run(["pdftotext", "-layout", path, "-"],
                          capture_output=True, text=True, check=True).stdout


def main(sources):
    db = sqlite3.connect(DB)
    db.executescript(SCHEMA)
    provs = provinces(db)
    total = 0
    for src in sources:
        rows, seen = [], set()
        for line in load(src).splitlines():
            rec = parse_line(line, provs)
            # One licence can appear on several pages; first sighting wins.
            if rec and rec["licence"] not in seen:
                seen.add(rec["licence"])
                rows.append((f"{src}#{rec['licence']}", rec["name"], rec["address"],
                             rec["phone"], rec["email"], rec["category"]))
        db.executemany("insert or replace into ph_directory"
                       " values (?,?,?,?,?,?,datetime('now'))", rows)
        db.commit()
        total += len(rows)
        print(f"{len(rows):5} contractors with an email from {src}")
    tot, mail = db.execute("select count(*), count(email) from ph_directory").fetchone()
    print(f"\ningested {total}; directory now holds {tot} companies, {mail} with an email")


FIXTURE = [
    '5       34688 "SIBELCON" (SIBELIUS CONSTRUCTION)   Trade   Trade   Jr.   Slide, Tuding Itogon Benguet   09209095896   gtslbellus@yahoo.com',
    '7       34459 1-6-8 CONSTRUCTION AND SUPPLY   General Building   D   Horian Iza Celis Lim   01 Solana Street, Barangay 4, (Pob.) San Jose Antique   036-5408318   chinolim09@gmail.com',
    # no phone column at all -- the address must not slide into the phone slot
    '9       34999 NO PHONE BUILDERS   General Building   D   Juan Cruz   Poblacion, Tupi South Cotabato   nophone@yahoo.com',
    '                                     Chris Sharon                                      chrizja_jesef@yahoo.co',  # continuation
    'Page 3 of 210',
]


def selfcheck():
    provs = ["Negros Occidental", "South Cotabato", "Benguet", "Antique", "Samar"]
    a = parse_line(FIXTURE[0], provs)
    assert a["name"] == "SIBELCON (SIBELIUS CONSTRUCTION)" and a["email"] == "gtslbellus@yahoo.com", a
    assert a["category"] == "Benguet" and a["phone"] == "09209095896", a
    b = parse_line(FIXTURE[1], provs)
    assert b["name"] == "1-6-8 CONSTRUCTION AND SUPPLY" and b["category"] == "Antique", b
    c = parse_line(FIXTURE[2], provs)
    assert c["category"] == "South Cotabato" and c["phone"] is None, c
    assert "Tupi" in c["address"], c
    # a continuation line has an email but no licence -- it must not become a contractor
    assert parse_line(FIXTURE[3], provs) is None
    assert parse_line(FIXTURE[4], provs) is None
    # longest-first province matching: 'Samar' must not win inside 'Negros Occidental'
    d = parse_line('1  30001 X BUILDERS  GB  D  Y  Bacolod Negros Occidental  1  x@y.ph', provs)
    assert d["category"] == "Negros Occidental", d
    print("ok")


if __name__ == "__main__":
    args = sys.argv[1:]
    selfcheck() if args[:1] == ["test"] else main(args or sys.exit(__doc__))
