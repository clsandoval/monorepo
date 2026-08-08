#!/usr/bin/env python3
"""Approach C: precompute per-notice judgment with Luna, once, into columns.

    python3 tag.py 200        # pilot: stratified sample, prints real cost + samples
    python3 tag.py all

Reads tenders.db READ-ONLY (another job owns it), writes tags.db.
Why this exists: keyword search can't find "software work hiding inside Goods".
A model reading the notice once at ingest turns that into a column.
"""
import json, os, re, sqlite3, sys, urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).parent
SRC = f"file:{HERE/'tenders.db'}?mode=ro"
OUT = HERE / "tags.db"
MODEL = "gpt-5.6-luna"
IN_RATE, OUT_RATE, PHP = 0.20 / 1e6, 1.20 / 1e6, 58.0  # $/token, ₱/$
BATCH, WORKERS = 10, 6
CORPUS = 22145  # 4,300 mPhilGEPS + 17,845 legacy -- for extrapolating pilot cost

WORK_TYPES = [
    "software", "ict_hardware", "civil_works", "consulting", "medical_supplies",
    "lab_equipment", "office_supplies", "furniture", "vehicles_parts", "food_catering",
    "printing_promo", "security_janitorial", "training_events", "repair_maintenance",
    "utilities_fuel",
    # added after the first 200-notice pilot put 10% in "other": freight/handling charges,
    # tractor-and-land-prep farm work, and "various supplies" grab-bag notices each showed
    # up repeatedly with no home.
    "logistics_freight", "agriculture", "mixed_supplies", "outsourced_services",
    "other",
]

PROMPT = f"""You tag Philippine government procurement notices so contractors can find work they can bid on.

For each notice return an object with EXACTLY these keys:
- id: the notice id, unchanged
- work_type: one of {WORK_TYPES}  (what kind of firm bids on this, not the official category)
- needs_pcab: true/false/null  (PCAB licence required? civil works needs one; null if unclear)
- eligibility: array of at most 3 SHORT strings, only requirements beyond the universal
  ones. Every PH notice needs Mayor's Permit + PhilGEPS registration + BIR 2303 + Omnibus
  Sworn Statement -- NEVER list those. Empty array if nothing special.
- scope: one sentence, max 140 chars, what is actually being bought. No boilerplate.
- keywords: 3-8 lowercase terms a bidder would type to find this. Include the domain word
  even if absent from the title (a notice for laptops gets "laptop","computer","ict").
  PLAIN WORDS ONLY, space separated. No underscores, no hyphens joining words, no
  camelCase -- these go into a full-text index and must match what a human types:
  "fire truck repair", never "fire_truck","truck_repair".

Be terse. Output tokens cost 6x input here.
Reply with json only: {{"notices": [ ...one object per input notice... ]}}"""


def keywords(kw):
    """Flatten to space-separated words for FTS5.

    The model echoes the work_type enum as keyword #1 ("ict_hardware ats console"), and an
    underscored token matches nothing a human types. Fix deterministically here rather than
    asking the prompt again -- code always wins, prompts only mostly win.
    """
    words = " ".join(kw or []).lower().replace("_", " ").replace("-", " ").split()
    return " ".join(dict.fromkeys(words))  # dedupe, keep order


def db_out():
    db = sqlite3.connect(OUT)
    db.execute("""create table if not exists tags (
      id integer primary key, work_type text, needs_pcab int, eligibility text,
      scope text, keywords text, model text, tagged_at text)""")
    return db


# --- boilerplate stripping ---------------------------------------------------
# The RA-12009 recitals and "submit these 8 documents" blocks repeat near-verbatim across
# thousands of notices and carry zero signal. Don't hand-maintain a regex list: measure
# which lines are common and drop those. ponytail: document frequency, not a blocklist.

def norm(line):
    return re.sub(r"[^a-z ]", "", line.lower())[:90].strip()


def boilerplate(descs, cutoff=0.02):
    # ponytail: exact-line df only catches ~18% of the boilerplate -- the standard clauses
    # embed agency names and peso amounts so identical clauses hash differently. Phrase
    # shingling would catch most of the rest; it saves ~P100 once, so it isn't written.
    df = Counter()
    for d in descs:
        df.update({norm(l) for l in (d or "").split("\n") if len(norm(l)) > 12})
    return {k for k, n in df.items() if n > cutoff * len(descs)}


def strip(desc, common, cap=1500):
    keep = [l.strip() for l in (desc or "").split("\n")
            if l.strip() and norm(l) not in common]
    return "\n".join(keep)[:cap]


def items_text(items, cap=400):
    """Drop the repeated header row; keep the actual line-item words."""
    ls = (items or "").split("\n")
    head = ["Item No.", "UNSPSC", "Lot Name", "Lot Description", "Quantity", "Unit of Measure"]
    return " · ".join(l for l in ls if l.strip() and l.strip() not in head)[:cap]


# --- sampling ----------------------------------------------------------------

def sample(src, n):
    """Stratified by classification: Consulting is 1% of the corpus, so a flat random
    sample would show ~2 of them and tell us nothing about whether tagging works there."""
    classes = [r[0] for r in src.execute(
        "select classification from tenders where enriched_at is not null"
        " group by 1 order by count(*) desc")]
    per, rows = max(1, n // len(classes)), []
    for c in classes:
        rows += src.execute(
            "select id,title,mode,classification,agency,location,abc,description,items"
            " from tenders where enriched_at is not null and classification=?"
            " order by random() limit ?", (c, per)).fetchall()
    if len(rows) < n:  # top up from the biggest class
        have = {r[0] for r in rows}
        for r in src.execute(
            "select id,title,mode,classification,agency,location,abc,description,items"
            " from tenders where enriched_at is not null and classification=?"
            " order by random() limit ?", (classes[0], n)):
            if r[0] not in have and len(rows) < n:
                rows.append(r)
    return rows


def payload(r, common):
    id, title, mode, cls, agency, loc, abc, desc, items = r
    return {
        "id": id, "title": title, "mode": mode, "classification": cls,
        "agency": agency, "location": loc, "abc": abc,
        "items": items_text(items), "detail": strip(desc, common),
    }


# --- the call ----------------------------------------------------------------

def call(batch):
    body = json.dumps({
        "model": MODEL,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": PROMPT},
            {"role": "user", "content": json.dumps(batch, ensure_ascii=False)},
        ],
    }).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions", data=body,
        headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
                 "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            d = json.load(r)
        return json.loads(d["choices"][0]["message"]["content"]).get("notices", []), d["usage"]
    except Exception as e:
        detail = e.read().decode()[:300] if hasattr(e, "read") else ""
        print(f"  batch failed: {e} {detail}", file=sys.stderr)
        return [], None


def main():
    n = sys.argv[1] if len(sys.argv) > 1 else "200"
    src = sqlite3.connect(SRC, uri=True)
    descs = [r[0] for r in src.execute(
        "select description from tenders where description is not null")]
    common = boilerplate(descs)
    print(f"boilerplate: {len(common)} repeated lines dropped (>2% of {len(descs)} notices)")

    rows = (src.execute("select id,title,mode,classification,agency,location,abc,"
                        "description,items from tenders where enriched_at is not null").fetchall()
            if n == "all" else sample(src, int(n)))
    print(f"tagging {len(rows)} notices, {BATCH}/call")

    raw = sum(len(json.dumps({"detail": r[7], "items": r[8]})) for r in rows)
    kept = sum(len(json.dumps(payload(r, common))) for r in rows)
    print(f"payload: {raw/len(rows):.0f} -> {kept/len(rows):.0f} chars/notice after strip")

    batches = [[payload(r, common) for r in rows[i:i + BATCH]]
               for i in range(0, len(rows), BATCH)]
    db, tin, tout, got = db_out(), 0, 0, 0
    with ThreadPoolExecutor(WORKERS) as pool:
        for notices, usage in pool.map(call, batches):
            if usage:
                tin += usage["prompt_tokens"]; tout += usage["completion_tokens"]
            for t in notices:
                db.execute("insert or replace into tags values (?,?,?,?,?,?,?,?)", (
                    t.get("id"), t.get("work_type"),
                    None if t.get("needs_pcab") is None else int(bool(t["needs_pcab"])),
                    json.dumps(t.get("eligibility") or []), t.get("scope"),
                    keywords(t.get("keywords")), MODEL,
                    datetime.now(timezone.utc).isoformat(timespec="seconds")))
                got += 1
            db.commit()

    cost = tin * IN_RATE + tout * OUT_RATE
    print(f"\ntagged {got}/{len(rows)}")
    print(f"tokens  in {tin:,} ({tin/max(got,1):.0f}/notice)  out {tout:,} ({tout/max(got,1):.0f}/notice)")
    print(f"cost    ${cost:.4f} = P{cost*PHP:.2f}   ->  full {CORPUS:,} corpus: "
          f"P{cost*PHP/max(got,1)*CORPUS:,.0f}")
    print(f"out/in cost ratio {tout*OUT_RATE/max(tin*IN_RATE,1e-9):.2f}"
          "  (>1 means output dominates -- keep tags terse)\n")
    for wt, c in db.execute("select work_type,count(*) from tags group by 1 order by 2 desc"):
        print(f"  {c:>4}  {wt}")


def selfcheck():
    common = boilerplate(["a) Valid Mayors Permit\nSupply of laptops",
                          "a) Valid Mayors Permit\nRepair of bridge",
                          "a) Valid Mayors Permit\nCatering services"], cutoff=0.5)
    assert "a valid mayors permit" in common, common
    assert strip("a) Valid Mayors Permit\nSupply of laptops", common) == "Supply of laptops"
    assert strip("", common) == ""
    assert items_text("Item No.\nUNSPSC\n1\n80141605\nT-SHIRT") == "1 · 80141605 · T-SHIRT"
    assert items_text(None) == ""
    assert keywords(["fire_truck", "truck-repair", "Ford FMC"]) == "fire truck repair ford fmc"
    assert keywords(None) == ""
    print("ok")


if __name__ == "__main__":
    selfcheck() if sys.argv[1:2] == ["test"] else main()
