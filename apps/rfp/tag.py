#!/usr/bin/env python3
"""Approach C: precompute per-notice judgment with Luna, once, into columns.

    python3 tag.py test              # assert-based selfcheck, no network, no framework
    python3 tag.py plan              # what a full run would cost, from measured payload sizes
    python3 tag.py base 200          # tier 1 pilot: stratified sample over BOTH systems
    python3 tag.py base all          # tier 1: the whole corpus, resumable
    python3 tag.py doc [n]           # tier 2: re-tag high-ABC boilerplate notices from attachments
    python3 tag.py report            # work_type distribution + ledger, no spend

Reads tenders.db and legacy.db READ-ONLY (other jobs own them), writes tags.db and spend.json.
`rfp build` joins tags.db by `id` -- ids are disjoint between the two systems (mPhilGEPS
2208-55594, legacy 12535432+) and corpus.db asserts `unique(id)`, so one flat key is safe.

Why this exists: keyword search can't find "software work hiding inside Goods". A model reading
the notice once at ingest turns that into a column, paid once per notice ever instead of once
per search.

TWO TIERS, because they have different economics:
  base  ~P0.012/notice  listing + detail description.  Runs over everything.
  doc   ~P0.4 /notice   the attachment text, which is where the real scope lives.  Runs only
                        where the description is boilerplate-only AND the money is big, i.e.
                        exactly where a model reading the document beats FTS5 over the notice.

HARD SPEND CAP: CAP_PHP. Checked against the ledger before every batch, and the batch is shrunk
or refused rather than allowed to breach it. Costs come from the API's own `usage` block -- never
an estimate, because an estimate that drifts 30% low is how a P1000 cap becomes P1300.
"""
import fcntl, json, os, random, re, sqlite3, sys, threading, time
import urllib.error, urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).parent
SRC = {"mphilgeps": HERE / "tenders.db", "legacy": HERE / "legacy.db"}
DOCS = HERE / "docs.db"
OUT = HERE / "tags.db"
LEDGER = HERE / "spend.json"
MODEL = "gpt-5.6-luna"
IN_RATE, OUT_RATE, PHP = 0.20 / 1e6, 1.20 / 1e6, 58.0  # $/token, P/$
CAP_PHP = 1000.0          # total, both tiers, for the whole night. Not negotiable in code.
BATCH, WORKERS = 10, 6    # 10 was piloted twice; 6 is the concurrency ceiling for the night
DOC_BATCH = 1             # one notice per call: attachment text is 10-600k chars
DOC_CHARS = 44000         # ~11k tokens of attachment text per notice -> ~P0.16 in
API = "https://api.openai.com/v1/chat/completions"

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

FIELDS = f"""- id: the notice id, unchanged
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
  "fire truck repair", never "fire_truck","truck_repair"."""

PROMPT = f"""You tag Philippine government procurement notices so contractors can find work they can bid on.

For each notice return an object with EXACTLY these keys:
{FIELDS}

Be terse. Output tokens cost 6x input here.
Reply with json only: {{"notices": [ ...one object per input notice... ]}}"""

# Tier 2. The notice's own description was measured to be boilerplate-only, so everything below
# comes from the attached bid documents. Ask for MORE than the base pass -- that is the whole
# reason to pay for the document -- but stay terse: output is still 6x the price of input.
DOC_PROMPT = f"""You read the ACTUAL BID DOCUMENTS for one Philippine government procurement notice.
The notice's own description was boilerplate, so the attachment text is the only real scope signal.

Return one object with EXACTLY these keys:
{FIELDS}
- scope may use up to 240 chars here since you have the real documents.
- keywords: 5-12 words, drawn from the DOCUMENT (specific equipment, materials, systems,
  standards, locations), not from the boilerplate. This is the whole value of reading it.
- deliverables: array of at most 6 SHORT noun phrases -- the concrete things being bought
  (e.g. "300mm PVC pipe", "3-storey school building", "12-month software support").
- doc_note: max 100 chars. Anything a bidder would want flagged (site location, phased
  delivery, unusual warranty, PCAB class named in the document). "" if nothing.

The text may be truncated mid-document, may include tables mangled into prose, and may include
one document appended after another. Ignore the standard eligibility recitals.
Reply with json only, one object: {{"notices": [ {{...}} ]}}"""


# --- normalisation: in CODE, not in the prompt -------------------------------------------------

def keywords(kw):
    """Flatten to space-separated words for FTS5.

    Three failure modes, all measured, all fixed here rather than by asking the prompt again --
    code always wins, prompts only mostly win:

    1. The model echoes the work_type enum as keyword #1 ("ict_hardware ats console"), and an
       underscored token matches nothing a human types into full-text search.
    2. It sometimes returns keywords as a STRING instead of an array. `" ".join("feasibility")`
       then joins CHARACTERS: the first pilot shredded 173 of 337 rows into
       'f e a s i b l t y u d h g w n r v o c' before anyone looked at the column. Silent, and
       it would have poisoned half the FTS keywords index.
    3. Single letters are never keywords, however they arrived.
    """
    if isinstance(kw, str):
        kw = [kw]
    elif not isinstance(kw, (list, tuple)):
        kw = []
    flat = []
    for k in kw:                        # nested lists happen too
        flat += k if isinstance(k, (list, tuple)) else [str(k)]
    words = " ".join(flat).lower().replace("_", " ").replace("-", " ")
    words = [w for w in re.sub(r"[^a-z0-9 ]", " ", words).split() if len(w) > 1]
    return " ".join(dict.fromkeys(words))  # dedupe, keep order


def elig(e):
    """eligibility -> json array of short strings. Same string-instead-of-array hazard."""
    if isinstance(e, str):
        e = [e] if e.strip() else []
    if not isinstance(e, (list, tuple)):
        e = []
    out = [re.sub(r"\s+", " ", str(x)).strip()[:120] for x in e]
    return json.dumps([x for x in out if x][:3], ensure_ascii=False)


def one_line(s, cap):
    return re.sub(r"\s+", " ", str(s or "")).strip()[:cap] or None


def work_type(w):
    w = (w or "").strip().lower().replace(" ", "_")
    return w if w in WORK_TYPES else "other"


# --- boilerplate stripping --------------------------------------------------------------------
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


def doc_text(text, cap=DOC_CHARS):
    """Attachment text: collapse the whitespace deserts PDF extraction leaves behind.

    Measured on real extracts: form-feed pages, runs of 40+ spaces from table columns, and
    dotted leaders from tables of contents. Collapsing them is pure margin -- it buys ~25% more
    real document inside the same token cap.
    """
    t = re.sub(r"\.{4,}", " ", str(text or ""))
    t = re.sub(r"[ \t\x0c]+", " ", t)
    t = re.sub(r"[ \t]*\n\s*", "\n", t)
    return t.strip()[:cap]


def doc_clean(text, common):
    """Strip cross-document boilerplate by document frequency, and per-page repeats.

    A PhilGEPS bid document is a Philippine Bidding Document: ~30 pages of standard-form
    Instructions to Bidders and General Conditions of Contract that are byte-identical across
    thousands of notices, wrapped around a few pages of actual scope. Measured: exact-line df at
    an 8% cutoff removes 67% of the characters. Intra-notice line dedupe removes the running
    headers and footers that repeat once per page.
    """
    out, seen = [], set()
    for line in doc_text(text, cap=10 ** 9).split("\n"):
        if len(line) < 3:
            continue
        n = norm(line)
        if n in common:
            continue
        if len(n) > 12:
            if n in seen:
                continue
            seen.add(n)
        out.append(line)
    return "\n".join(out)


# What a bidder needs off the page, and what they don't. df stripping kills the identical
# boilerplate; these score what SURVIVES, because the PBD preface line-wraps differently in every
# document and so escapes an exact-line filter while carrying no more signal than the ToC did.
ANCHORS = ("scope of work", "technical specification", "bill of quantities", "terms of reference",
           "description of works", "project location", "contract duration", "statement of work",
           "delivery schedule", "item description", "unit cost", "specifications", "brand",
           "quantity", "unit price", "location of", "project description")
LEGALESE = ("shall", "bidder", "procuring entity", "ra 12009", "gppb", "irr", "philgeps",
            "bidding documents", "eligibility", "sworn", "notary", "affidavit", "annex",
            "pursuant", "herein", "thereof", "bid security", "performance security",
            # the PBD glossary: line-wrapped differently in every document, so exact-line df
            # never catches it, and it was the largest surviving noise block by eye on 50936.
            "refers to", "as used in", "means the", "definitions", "hereinafter")
UNITS = ("sqm", "sq.m", "cu.m", "cum", "lot", "pcs", "unit", "kg", "mm", "meters", "lm",
         "bags", "liters", "set", "pax", "l.s.", "each")


def block_score(b):
    """Higher = more likely to be the pages that say what is actually being bought."""
    low = b.lower()
    digits = sum(c.isdigit() for c in b) / max(len(b), 1)
    return (6 * sum(low.count(a) for a in ANCHORS)
            + 3 * sum(low.count(u) for u in UNITS)
            + 60 * digits
            - 2 * sum(low.count(w) for w in LEGALESE))


def doc_window(text, common, cap=DOC_CHARS, block=2000):
    """Pick the highest-scoring blocks of a cleaned document, in original reading order.

    Position-based truncation ("first 44k chars") spends the whole window on the PBD preface --
    verified by eye on notice 41731, where 111k chars survived df stripping and the first 1,400
    of them were the GPPB's model-document foreword. Selecting by score instead is the difference
    between paying for scope and paying for legalese.
    """
    t = doc_clean(text, common)
    if len(t) <= cap:
        return t
    blocks = [t[i:i + block] for i in range(0, len(t), block)]
    ranked = sorted(range(len(blocks)), key=lambda i: -block_score(blocks[i]))
    keep = sorted(ranked[:max(1, cap // block)])
    return "\n…\n".join(blocks[i] for i in keep)[:cap]


def doc_common(con, cutoff=0.08, sample_n=200, seed=0):
    """df over a random sample of extracted blobs. 200 documents is plenty to spot text that
    appears in 8% of them, and it keeps this a seconds-long pass over ~25MB instead of ~200MB."""
    ids = [r[0] for r in con.execute(
        "select blob_id from blobs where extract_status='ok' and chars > 2000")]
    ids = random.Random(seed).sample(ids, min(sample_n, len(ids)))
    df = Counter()
    for b in ids:
        t = con.execute("select text from blobs where blob_id=?", (b,)).fetchone()[0] or ""
        df.update({norm(l) for l in t.split("\n") if len(norm(l)) > 12})
    return {k for k, n in df.items() if n > cutoff * max(len(ids), 1)}


# --- the ledger -------------------------------------------------------------------------------
# Written after every batch, read before every batch. The cap is enforced against THIS file, not
# against a variable in memory, so a crash-and-resume can't spend the budget twice.

_lock = threading.Lock()


class _flock:
    """Cross-PROCESS lock around the ledger's read-modify-write.

    A threading.Lock is not enough: the cap is enforced against the file, and two tag.py
    processes (a base pass still running while a doc pass starts) would each read P240, each add
    their batch, and each write back -- losing one batch's spend from the total. A lost batch is
    an under-count, and an under-counted ledger is a cap that silently doesn't hold.
    """

    def __enter__(self):
        self.f = open(str(LEDGER) + ".lock", "a+")
        fcntl.flock(self.f, fcntl.LOCK_EX)
        return self

    def __exit__(self, *e):
        fcntl.flock(self.f, fcntl.LOCK_UN)
        self.f.close()


def ledger_read():
    if LEDGER.exists():
        return json.loads(LEDGER.read_text())
    return {"cap_php": CAP_PHP, "model": MODEL, "rate_in_usd_per_mtok": 0.20,
            "rate_out_usd_per_mtok": 1.20, "php_per_usd": PHP,
            "batches": 0, "calls_failed": 0, "notices": 0,
            "tokens_in": 0, "tokens_out": 0, "usd": 0.0, "php": 0.0,
            "tiers": {}, "history": []}


def cost(tin, tout):
    return tin * IN_RATE + tout * OUT_RATE


def ledger_add(tier, tin, tout, n, failed=0, note=None):
    """Record ACTUAL usage. Returns the new cumulative pesos."""
    with _lock, _flock():
        L = ledger_read()
        L["batches"] += 1
        L["calls_failed"] += failed
        L["notices"] += n
        L["tokens_in"] += tin
        L["tokens_out"] += tout
        L["usd"] = round(L["tokens_in"] * IN_RATE + L["tokens_out"] * OUT_RATE, 6)
        L["php"] = round(L["usd"] * PHP, 4)
        t = L["tiers"].setdefault(tier, {"batches": 0, "notices": 0, "tokens_in": 0,
                                         "tokens_out": 0, "php": 0.0})
        t["batches"] += 1
        t["notices"] += n
        t["tokens_in"] += tin
        t["tokens_out"] += tout
        t["php"] = round(cost(t["tokens_in"], t["tokens_out"]) * PHP, 4)
        L["updated_at"] = now()
        L["history"].append({"at": now(), "tier": tier, "notices": n,
                             "tokens_in": tin, "tokens_out": tout,
                             "php_batch": round(cost(tin, tout) * PHP, 4),
                             "php_cum": L["php"], **({"note": note} if note else {})})
        L["history"] = L["history"][-400:]   # keep the file small; totals are cumulative
        tmp = LEDGER.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(L, indent=1))
        tmp.replace(LEDGER)
        return L["php"]


def headroom():
    return CAP_PHP - ledger_read()["php"]


def tier_mean(tier, fallback):
    """Measured pesos per notice for ONE tier. The tiers differ ~40x in cost per notice, so a
    blended mean is not a projection, it's a licence to overspend."""
    t = ledger_read().get("tiers", {}).get(tier)
    if t and t["notices"]:
        return cost(t["tokens_in"], t["tokens_out"]) * PHP / t["notices"]
    return fallback


# --- reading the two source DBs ---------------------------------------------------------------

def ro(path):
    con = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    return con


COLS = ("id,title,mode,classification,category,agency,location,abc,description")


def rows_for(source):
    """Both systems, one shape. mPhilGEPS carries `items`; legacy does not."""
    con = ro(SRC[source])
    extra = ",items" if source == "mphilgeps" else ""
    q = f"select {COLS}{extra} from tenders where enriched_at is not null"
    out = [dict(r, source=source) for r in con.execute(q)]
    con.close()
    for r in out:
        r.setdefault("items", None)
    return out


def all_rows():
    return rows_for("mphilgeps") + rows_for("legacy")


def payload(r, common):
    p = {"id": r["id"], "title": r["title"], "mode": r["mode"],
         "classification": r["classification"], "agency": r["agency"],
         "location": r["location"], "abc": r["abc"],
         "detail": strip(r["description"], common)}
    it = items_text(r["items"])
    if it:
        p["items"] = it
    return {k: v for k, v in p.items() if v not in (None, "")} | {"id": r["id"]}


# --- tags.db ----------------------------------------------------------------------------------
# `tags` is the table `rfp build` joins by id: it holds the BEST tag per notice, and a doc-tier
# tag supersedes a base-tier one. `tag_runs` keeps every tier's raw output so the two can be
# diffed -- "did paying for the document actually change the answer" is the question that decides
# whether tier 2 is worth running again, and it is unanswerable if doc overwrites base in place.

def db_out():
    db = sqlite3.connect(OUT, timeout=60)
    db.execute("pragma journal_mode=wal")
    db.execute("""create table if not exists tags (
      id integer primary key, work_type text, needs_pcab int, eligibility text,
      scope text, keywords text, model text, tagged_at text)""")
    have = {c[1] for c in db.execute("pragma table_info(tags)")}
    for col, decl in [("source", "text"), ("tier", "text"), ("deliverables", "text"),
                      ("doc_note", "text"), ("doc_chars", "integer")]:
        if col not in have:
            db.execute(f"alter table tags add column {col} {decl}")
    db.execute("""create table if not exists tag_runs (
      id integer not null, tier text not null, source text, work_type text, needs_pcab int,
      eligibility text, scope text, keywords text, deliverables text, doc_note text,
      doc_chars integer, model text, tagged_at text, primary key (id, tier))""")
    db.commit()
    return db


ORDER = ["work_type", "needs_pcab", "eligibility", "scope", "keywords", "deliverables",
         "doc_note", "doc_chars", "source", "tier", "model", "tagged_at"]


def record(db, tier, source, t, doc_chars=None):
    """One model object -> tag_runs + (if it wins) tags. Returns the id, or None if unusable."""
    try:
        nid = int(t["id"])
    except (KeyError, TypeError, ValueError):
        return None
    row = {
        "work_type": work_type(t.get("work_type")),
        "needs_pcab": None if t.get("needs_pcab") is None else int(bool(t["needs_pcab"])),
        "eligibility": elig(t.get("eligibility")),
        "scope": one_line(t.get("scope"), 240 if tier == "doc" else 160),
        "keywords": keywords(t.get("keywords")) or None,
        "deliverables": elig(t.get("deliverables")) if tier == "doc" else None,
        "doc_note": one_line(t.get("doc_note"), 100) if tier == "doc" else None,
        "doc_chars": doc_chars, "source": source, "tier": tier, "model": MODEL,
        "tagged_at": now(),
    }
    vals = [row[c] for c in ORDER]
    db.execute(f"insert or replace into tag_runs (id,tier,{','.join(c for c in ORDER if c != 'tier')})"
               f" values (?,?,{','.join('?' * (len(ORDER) - 1))})",
               [nid, tier] + [row[c] for c in ORDER if c != "tier"])
    # base never overwrites doc: the document-informed tag is strictly better informed.
    cur = db.execute("select tier from tags where id=?", (nid,)).fetchone()
    if not (tier == "base" and cur and cur[0] == "doc"):
        db.execute(f"insert or replace into tags (id,{','.join(ORDER)})"
                   f" values (?,{','.join('?' * len(ORDER))})", [nid] + vals)
    return nid


def done_ids(tier):
    if not OUT.exists():
        return set()
    db = ro(OUT)
    try:
        return {r[0] for r in db.execute(
            "select id from tag_runs where tier=? and work_type is not null", (tier,))}
    except sqlite3.OperationalError:
        return set()
    finally:
        db.close()


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# --- the call ---------------------------------------------------------------------------------

def api_key():
    k = os.environ.get("OPENAI_API_KEY")
    if k:
        return k
    for line in (HERE.parent.parent / ".env").read_text().splitlines():
        if line.startswith("OPENAI_API_KEY="):
            return line.split("=", 1)[1].strip().strip("'\"")
    sys.exit("no OPENAI_API_KEY")


KEY = None


def call(batch, prompt=PROMPT, tries=4):
    """One request. Returns (notices, tokens_in, tokens_out, err).

    Backs off on 429/5xx instead of hammering. Tokens are returned even on a JSON-parse failure,
    because a 200 that answered gibberish was still billed and the ledger must know.
    """
    global KEY
    KEY = KEY or api_key()
    body = json.dumps({
        "model": MODEL,
        "response_format": {"type": "json_object"},
        "messages": [{"role": "system", "content": prompt},
                     {"role": "user", "content": json.dumps(batch, ensure_ascii=False)}],
    }).encode()
    for attempt in range(tries):
        req = urllib.request.Request(API, data=body, headers={
            "Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                d = json.load(r)
        except urllib.error.HTTPError as e:
            detail = e.read().decode()[:200]
            if e.code in (408, 409, 429, 500, 502, 503, 504) and attempt < tries - 1:
                time.sleep(min(60, 5 * 3 ** attempt) + random.random() * 3)
                continue
            return [], 0, 0, f"HTTP {e.code} {detail}"
        except Exception as e:                      # timeouts, resets
            if attempt < tries - 1:
                time.sleep(min(60, 5 * 3 ** attempt) + random.random() * 3)
                continue
            return [], 0, 0, f"{type(e).__name__}: {e}"
        u = d.get("usage") or {}
        tin, tout = u.get("prompt_tokens", 0), u.get("completion_tokens", 0)
        try:
            got = json.loads(d["choices"][0]["message"]["content"])
        except Exception as e:
            return [], tin, tout, f"unparseable json: {e}"
        ns = got.get("notices") if isinstance(got, dict) else got
        if isinstance(ns, dict):
            ns = [ns]
        if not isinstance(ns, list):
            return [], tin, tout, f"no notices array: {str(got)[:120]}"
        return ns, tin, tout, None
    return [], 0, 0, "retries exhausted"


# --- the run loop -----------------------------------------------------------------------------

def run(jobs, tier, prompt, src_map, workers=WORKERS, per_notice_guess=0.013):
    """jobs = [(list_of_payloads, meta), ...]; src_map = {id: 'mphilgeps'|'legacy'}.
    Ledger-gated, resumable, cap-enforced.

    The cap check is per batch and uses the MEASURED mean cost per notice once any batch has
    landed. It refuses to start a batch it cannot afford rather than truncating one mid-flight,
    because a batch that runs out of budget halfway is billed in full and stored not at all.
    """
    db = db_out()
    got, failed, stopped = 0, 0, None
    t0 = time.time()
    # Per-TIER mean, never the blended one: after 22k base notices the blended mean is P0.012
    # and would wave through a doc batch that actually costs P0.50 -- which is how a cap gets
    # breached by a projection that was technically "measured".
    mean = tier_mean(tier, per_notice_guess)
    queue = list(jobs)
    with ThreadPoolExecutor(workers) as pool:
        pending, i = {}, 0
        while (i < len(queue) or pending) and not stopped:
            while i < len(queue) and len(pending) < workers:
                js, meta = queue[i]
                proj = mean * len(js)
                if headroom() < proj:
                    stopped = f"cap: headroom P{headroom():.2f} < projected P{proj:.2f}"
                    break
                pending[pool.submit(call, js, prompt)] = (js, meta)
                i += 1
            if not pending:
                break
            for f in list(pending):
                if not f.done():
                    continue
                js, meta = pending.pop(f)
                ns, tin, tout, err = f.result()
                ids = {p["id"] for p in js}
                n_ok = 0
                for t in ns:
                    if not isinstance(t, dict):
                        continue
                    try:
                        if int(t.get("id", -1)) not in ids:
                            continue          # never store a tag for a notice we didn't send
                    except (TypeError, ValueError):
                        continue
                    if record(db, tier, src_map.get(int(t["id"])), t, meta.get("doc_chars")):
                        n_ok += 1
                db.commit()
                got += n_ok
                if err or n_ok == 0:
                    failed += 1
                php = ledger_add(tier, tin, tout, n_ok, failed=1 if err else 0,
                                 note=(err or ("empty" if n_ok == 0 else None)))
                if err:
                    print(f"  batch failed ({len(js)} notices): {err}", file=sys.stderr)
                mean = tier_mean(tier, per_notice_guess)
                if got % 200 < BATCH or tier == "doc":
                    rate = got / max(time.time() - t0, 1e-9)
                    left = (sum(len(j) for j, _ in queue[i:]) + len(pending) * BATCH)
                    print(f"  {got:>6}/{sum(len(j) for j, _ in queue)}  P{php:.2f}"
                          f"  P{mean:.4f}/notice  {rate*60:.0f}/min"
                          f"  eta {left/max(rate,1e-9)/60:.0f}m", flush=True)
            if pending and all(not f.done() for f in pending):
                time.sleep(0.4)
    db.close()
    if stopped:
        print(f"STOPPED -- {stopped}", file=sys.stderr)
    return got, failed, stopped


# --- sampling ---------------------------------------------------------------------------------

def sample(rows, n):
    """Stratified by source x classification: Consulting is ~1% of the corpus, so a flat random
    sample would show ~2 of them and tell us nothing about whether tagging works there."""
    buckets = {}
    for r in rows:
        buckets.setdefault((r["source"], r["classification"]), []).append(r)
    keys = sorted(buckets, key=lambda k: -len(buckets[k]))
    per, out = max(1, n // max(len(keys), 1)), []
    rnd = random.Random(0)
    for k in keys:
        out += rnd.sample(buckets[k], min(per, len(buckets[k])))
    big = buckets[keys[0]]
    have = {r["id"] for r in out}
    for r in rnd.sample(big, len(big)):
        if len(out) >= n:
            break
        if r["id"] not in have:
            out.append(r)
    return out[:n]


# --- tier 1 -----------------------------------------------------------------------------------

def cmd_base(arg="200"):
    rows = all_rows()
    common = boilerplate([r["description"] for r in rows])
    print(f"boilerplate: {len(common)} repeated lines dropped (>2% of {len(rows)} notices)")
    if arg != "all":
        rows = sample(rows, int(arg))
    done = done_ids("base")
    todo = [r for r in rows if r["id"] not in done]
    print(f"corpus {len(rows)}  already tagged {len(rows) - len(todo)}  to do {len(todo)}")
    if not todo:
        return
    pays = [payload(r, common) for r in todo]
    ch = sum(len(json.dumps(p, ensure_ascii=False)) for p in pays) / len(pays)
    est = (ch / 3.7 + 50) * IN_RATE + 105 * OUT_RATE
    print(f"payload {ch:.0f} chars/notice -> projected P{est*PHP*len(todo):,.0f} "
          f"(P{est*PHP:.4f}/notice); headroom P{headroom():.2f}")
    jobs = [(pays[i:i + BATCH], {}) for i in range(0, len(pays), BATCH)]
    got, failed, _ = run(jobs, "base", PROMPT, {r["id"]: r["source"] for r in todo})
    print(f"\nbase: tagged {got}/{len(todo)}, {failed} batches failed")
    report()


# --- tier 2: the attachment pass --------------------------------------------------------------

def doc_targets(limit=None, min_abc=5e6, max_kept=300):
    """The population where paying to read the document actually beats FTS5 over the notice.

    Both conditions matter and neither alone is enough:
      ABC >= min_abc     -- value is brutally concentrated (9.7% of notices, 79.6% of pesos), so
                            this is where a better tag is worth money.
      boilerplate-only   -- if the description already states the scope, FTS5 finds it for free
                            and a doc pass buys nothing. Measured as: what survives boilerplate
                            stripping, plus the line items, is under max_kept chars.
      has extracted text -- docs.db is filled by another job, highest-ABC-first. Poll it.
    """
    if not DOCS.exists():
        return []
    rows = {(r["source"], r["id"]): r for r in all_rows()}
    common = boilerplate([r["description"] for r in rows.values()])
    # Which notices qualify on the notice side -- decided BEFORE reading any document text, so
    # the expensive read only happens for notices that will actually be tagged.
    want = {}
    for key, r in rows.items():
        if (r["abc"] or 0) < min_abc:
            continue
        kept = len(strip(r["description"], common, cap=10 ** 9)) \
            + len(items_text(r["items"], 10 ** 9))
        if kept < max_kept:
            want[key] = r
    d = ro(DOCS)
    have = {(r["source"], r["notice_id"]) for r in d.execute(
        "select source, notice_id from documents where extract_status='ok'")}
    todo = [k for k in want if k in have]
    if not todo:
        d.close()
        return []
    dcommon = doc_common(d)
    out = []
    for key in todo:
        texts = [r[0] for r in d.execute(
            """select b.text from documents dd join blobs b using (blob_id)
               where dd.source=? and dd.notice_id=? and dd.extract_status='ok'
                 and b.text is not null order by dd.seq""", key) if r[0]]
        if not texts:
            continue
        win = doc_window("\n---\n".join(texts), dcommon)
        if len(win) < 400:            # nothing survived: a plans-only or scanned attachment set
            continue
        out.append((want[key], win))
    d.close()
    out.sort(key=lambda rt: -(rt[0]["abc"] or 0))     # highest ABC first: spend where value is
    return out[:limit] if limit else out


def cmd_doc(limit=None, min_abc=5e6, max_kept=300):
    """limit/min_abc/max_kept are the spend dial. Widen min_abc DOWN only with headroom to spare:
    value is concentrated (9.7% of notices carry 79.6% of the pesos), so P5M+ is where a better
    tag is worth the most, and everything below it is a second helping."""
    tg = doc_targets(int(limit) if limit else None, float(min_abc), int(max_kept))
    done = done_ids("doc")
    tg = [(r, t) for r, t in tg if r["id"] not in done]
    if not tg:
        print("doc tier: no eligible notices with extracted attachment text yet")
        return 0
    ch = sum(len(t) for _, t in tg) / len(tg)
    est = (ch / 3.7 + 300) * IN_RATE + 260 * OUT_RATE
    print(f"doc tier: {len(tg)} targets, {ch:,.0f} doc chars each -> "
          f"projected P{est*PHP*len(tg):,.1f} (P{est*PHP:.3f}/notice); headroom P{headroom():.2f}")
    jobs = [([{"id": r["id"], "title": r["title"], "agency": r["agency"], "abc": r["abc"],
               "location": r["location"], "classification": r["classification"],
               "document_text": t}], {"doc_chars": len(t)}) for r, t in tg]
    got, failed, _ = run(jobs, "doc", DOC_PROMPT, {r["id"]: r["source"] for r, _ in tg},
                         workers=min(WORKERS, 4), per_notice_guess=est * PHP)
    print(f"doc: tagged {got}/{len(tg)}, {failed} failed")
    return got


# --- reporting --------------------------------------------------------------------------------

def report():
    if not OUT.exists():
        return print("no tags.db")
    db = ro(OUT)
    L = ledger_read()
    print(f"\nspend: P{L['php']:.2f} of P{CAP_PHP:.0f}  "
          f"({L['tokens_in']:,} in / {L['tokens_out']:,} out over {L['batches']} batches)")
    for tier, t in L.get("tiers", {}).items():
        print(f"  {tier:<5} P{t['php']:.2f}  {t['notices']:,} notices  "
              f"P{t['php']/max(t['notices'],1):.4f}/notice")
    for tier, n in db.execute("select tier,count(*) from tag_runs group by 1 order by 2 desc"):
        print(f"  tag_runs {tier}: {n:,}")
    tot = db.execute("select count(*) from tags").fetchone()[0]
    print(f"\ntags rows {tot:,}   work_type:")
    for wt, c, src in db.execute(
            "select work_type,count(*),group_concat(distinct source) from tags"
            " group by 1 order by 2 desc"):
        print(f"  {c:>6} {100*c/max(tot,1):>5.1f}%  {wt:<20} {src}")
    bad = db.execute("select count(*) from tags where keywords is null or keywords=''").fetchone()[0]
    shred = db.execute("select count(*) from tags where keywords like '_ _ _ _ %'").fetchone()[0]
    print(f"\nkeywords empty {bad}  shredded-looking {shred}")
    db.close()


def cmd_spot(n=10, tier="base", seed="7"):
    """Print each tag next to the notice it was made from, so a human can render a verdict.

    The tags are the ONE part of this pipeline nothing else can check: a parser is wrong in ways
    that crash, a tag is wrong in ways that look fine. Costs nothing and is the only evidence the
    tag pass worked.
    """
    n = int(n)
    db = ro(OUT)
    ids = [r[0] for r in db.execute(
        "select id from tag_runs where tier=? order by id", (tier,))]
    if not ids:
        return print(f"no {tier}-tier tags")
    pick = set(random.Random(int(seed)).sample(ids, min(n, len(ids))))
    rows = {r["id"]: r for r in all_rows() if r["id"] in pick}
    common = boilerplate([r["description"] for r in all_rows()])
    for i, nid in enumerate(sorted(pick), 1):
        t = db.execute("select * from tag_runs where id=? and tier=?", (nid, tier)).fetchone()
        r = rows.get(nid)
        print(f"\n{'='*100}\n[{i}] {nid}  {r['source']}  ABC {peso_str(r['abc'])}  "
              f"{r['classification']} / {r['mode']}  {r['location']}")
        print(f"  TITLE  {one_line(r['title'], 300)}")
        print(f"  AGENCY {one_line(r['agency'], 120)}")
        body = one_line(strip(r["description"], common, cap=10 ** 9), 700)
        print(f"  DESC   {body}")
        if r["items"]:
            print(f"  ITEMS  {one_line(items_text(r['items'], 10**9), 400)}")
        print(f"  --> work_type={t['work_type']}  needs_pcab={t['needs_pcab']}")
        print(f"  --> scope: {t['scope']}")
        print(f"  --> keywords: {t['keywords']}")
        print(f"  --> eligibility: {t['eligibility']}")
        if tier == "doc":
            print(f"  --> deliverables: {t['deliverables']}")
            print(f"  --> doc_note: {t['doc_note']}   (from {t['doc_chars']:,} doc chars)")
    db.close()


def peso_str(v):
    if v is None:
        return "not stated"
    return f"P{v/1e6:.2f}M" if v >= 1e6 else f"P{v:,.0f}"


def cmd_plan():
    rows = all_rows()
    common = boilerplate([r["description"] for r in rows])
    pays = [payload(r, common) for r in rows]
    by = {}
    for r, p in zip(rows, pays):
        by.setdefault(r["source"], []).append(len(json.dumps(p, ensure_ascii=False)))
    for s, ls in by.items():
        est = (sum(ls) / len(ls) / 3.7 + 50) * IN_RATE + 105 * OUT_RATE
        print(f"{s:<10} {len(ls):>6} notices  {sum(ls)/len(ls):>6.0f} chars/notice  "
              f"P{est*PHP:.4f}/notice  -> P{est*PHP*len(ls):,.0f}")
    print(f"doc-tier eligible now: {len(doc_targets())}")


# --- selfcheck ---------------------------------------------------------------------------------

def selfcheck():
    common = boilerplate(["a) Valid Mayors Permit\nSupply of laptops",
                          "a) Valid Mayors Permit\nRepair of bridge",
                          "a) Valid Mayors Permit\nCatering services"], cutoff=0.5)
    assert "a valid mayors permit" in common, common
    assert strip("a) Valid Mayors Permit\nSupply of laptops", common) == "Supply of laptops"
    assert strip("", common) == ""
    assert items_text("Item No.\nUNSPSC\n1\n80141605\nT-SHIRT") == "1 · 80141605 · T-SHIRT"
    assert items_text(None) == ""

    # keyword normalisation -- the three measured failure modes
    assert keywords(["fire_truck", "truck-repair", "Ford FMC"]) == "fire truck repair ford fmc"
    assert keywords(None) == ""
    # (2) string instead of array must NOT shred into characters -- it did, on 173/337 pilot rows
    assert keywords("feasibility study") == "feasibility study", keywords("feasibility study")
    assert keywords(["feasibility study, road"]) == "feasibility study road"
    assert keywords([["backhoe", "loader"], "dump truck"]) == "backhoe loader dump truck"
    assert keywords(["a", "b", "cd"]) == "cd"          # single letters are never keywords
    assert keywords(["300mm PVC", "pvc"]) == "300mm pvc"   # digits kept, dupes dropped

    assert json.loads(elig(["PCAB C", "", "x" * 200]))[1] == "x" * 120
    assert elig("PCAB Licence C") == '["PCAB Licence C"]'
    assert elig(None) == "[]" and elig("") == "[]"
    assert len(json.loads(elig(["a", "b", "c", "d"]))) == 3
    assert work_type("Civil Works") == "civil_works" and work_type("nonsense") == "other"
    assert work_type(None) == "other"
    assert one_line("  a\n\nb  ", 10) == "a b" and one_line(None, 5) is None

    assert doc_text("a....b\n\n\n  c   d\x0c") == "a b\nc d"
    assert len(doc_text("x" * 99999)) == DOC_CHARS

    # attachment cleaning: df boilerplate out, per-page repeats out, real scope kept
    dc = {"section i invitation to bid", "instructions to bidders"}
    got = doc_clean("Section I. Invitation to Bid\nSupply of 300mm PVC pipe\n"
                    "Page 1 of 9 header line here\nInstructions to Bidders\n"
                    "Page 1 of 9 header line here\nSupply of 300mm PVC pipe\n7\nxyz", dc)
    # '7' is a page number, not a line: sub-3-char lines are dropped
    assert got == "Supply of 300mm PVC pipe\nPage 1 of 9 header line here\nxyz", repr(got)
    # a scope-bearing block must outrank an equal-length block of bidding legalese
    scope = "Item 1 300mm PVC pipe 250 lm unit price 1,250.00 quantity 40 sqm " * 8
    legal = "The bidder shall submit a bid security pursuant to the IRR of RA 12009 herein " * 8
    assert block_score(scope) > block_score(legal), (block_score(scope), block_score(legal))
    # ...and doc_window must pick it out of a document where legalese comes first and is bigger
    win = doc_window(legal * 12 + "\n" + scope, set(), cap=2000, block=500)
    assert "300mm PVC pipe" in win, win[:200]
    assert len(win) <= 2000 + 4
    assert doc_window("short doc", set()) == "short doc"

    # cost arithmetic, against the pilot's measured numbers: 200 notices at ~425 in / ~105 out
    php = cost(425 * 200, 105 * 200) * PHP
    assert 2.2 < php < 2.7, php          # pilots measured P2.35 and P2.52
    assert abs(cost(1e6, 0) - 0.20) < 1e-9 and abs(cost(0, 1e6) - 1.20) < 1e-9

    # the ledger: monotone, atomic, and the cap is read from the file not from memory
    global LEDGER
    keep = LEDGER
    try:
        LEDGER = HERE / "_selfcheck_spend.json"
        if LEDGER.exists():
            LEDGER.unlink()
        assert abs(headroom() - CAP_PHP) < 1e-6
        p1 = ledger_add("base", 1_000_000, 1_000_000, 10)
        assert abs(p1 - 1.40 * PHP) < 1e-3, p1
        p2 = ledger_add("doc", 0, 1_000_000, 1, note="x")
        L = json.loads(LEDGER.read_text())
        assert L["batches"] == 2 and L["notices"] == 11 and L["calls_failed"] == 0
        assert abs(L["tiers"]["base"]["php"] - 1.40 * PHP) < 1e-3
        assert abs(headroom() - (CAP_PHP - p2)) < 1e-3
        assert L["history"][-1]["note"] == "x"
        # per-tier mean, not blended: base 10 notices for $1.40, doc 1 notice for $1.20
        assert abs(tier_mean("base", 0) - 1.40 * PHP / 10) < 1e-6, tier_mean("base", 0)
        assert abs(tier_mean("doc", 0) - 1.20 * PHP) < 1e-6, tier_mean("doc", 0)
        assert tier_mean("nosuchtier", 0.5) == 0.5
    finally:
        for f in (LEDGER, Path(str(LEDGER) + ".lock")):
            if f.exists():
                f.unlink()
        LEDGER = keep

    # record(): doc supersedes base in `tags`, both survive in `tag_runs`, unknown enum coerced
    global OUT
    keep_out = OUT
    try:
        OUT = HERE / "_selfcheck_tags.db"
        if OUT.exists():
            OUT.unlink()
        db = db_out()
        assert record(db, "base", "legacy", {"id": 7, "work_type": "civil_works",
                                             "keywords": "road repair", "scope": "x"}) == 7
        assert record(db, "doc", "legacy", {"id": 7, "work_type": "software",
                                            "keywords": ["ict"], "deliverables": "server"},
                      doc_chars=99) == 7
        assert record(db, "base", "legacy", {"id": 7, "work_type": "civil_works"}) == 7
        assert record(db, "base", "legacy", {"no_id": 1}) is None
        db.commit()
        assert db.execute("select work_type,tier,doc_chars,source from tags where id=7"
                          ).fetchone() == ("software", "doc", 99, "legacy"), \
            "doc tag must not be overwritten by a later base tag"
        assert db.execute("select count(*) from tag_runs where id=7").fetchone()[0] == 2
        # tag_runs keeps one row per tier, latest wins within a tier (a re-tag is a correction)
        assert db.execute("select work_type,keywords from tag_runs where id=7 and tier='base'"
                          ).fetchone() == ("civil_works", None)
        assert done_ids("doc") == {7} and done_ids("base") == {7}
        db.close()
    finally:
        if OUT.exists():
            OUT.unlink()
        for s in ("-wal", "-shm"):
            p = Path(str(OUT) + s)
            if p.exists():
                p.unlink()
        OUT = keep_out

    print("ok")


CMDS = {"test": selfcheck, "plan": cmd_plan, "base": cmd_base, "doc": cmd_doc,
        "spot": cmd_spot, "report": report}

if __name__ == "__main__":
    a = sys.argv[1:] or ["report"]
    if a[0] not in CMDS:
        sys.exit(__doc__)
    CMDS[a[0]](*a[1:])
