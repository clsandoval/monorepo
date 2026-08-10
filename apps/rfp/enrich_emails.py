#!/usr/bin/env python3
"""Resolve an email address for each shortlist company, via Claude + web search.

    uv run --with anthropic python enrich_emails.py test      # offline selfcheck
    uv run --with anthropic python enrich_emails.py one "ACME CONSTRUCTION"
    uv run --with anthropic python enrich_emails.py [limit]   # resumable batch

Google Places has no email field, PhilGEPS publishes none, and only 8 of the 153
shortlist firms have a website we trust -- so there is no structured source to query.
The channel has to be found the way a human would find it: search the open web, read
whatever page turns up (site, Facebook, DTI/PCAB listing, a bid bulletin), and pull the
address off it. That is a model-with-search job, not an API call.

SAME RULE AS THE PHONE PASS: a wrong email is worse than a blank one. Every hit must be
justified by a page that names the company, and the page's URL is stored next to the
address so a human can check it before sending anything. Anything the model can't ground
that way comes back `none` rather than a plausible guess.

Writes to awards.db `contacts` (adds email columns if absent). Resumable -- rows already
carrying an `email_checked_at` are skipped. Hard USD cap, checked before every call.
"""
import json, os, re, sqlite3, sys, threading, time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import anthropic

from enrich_contacts import city_of, shortlist
from save_emails import COLS, migrate

HERE = Path(__file__).parent
DB = HERE / "awards.db"
MODEL = "claude-opus-5"
CAP_USD = 50.0            # total for the whole run. Not negotiable in code.
# measured $0.24/company on the first probe (search results dominate input tokens),
# so the 153-firm shortlist lands near $37 and the cap is headroom, not a target.
WORKERS = 6
# opus-5 list price + web search at $10/1000 searches
PRICE = {"in": 5.0 / 1e6, "out": 25.0 / 1e6, "cache_read": 0.5 / 1e6, "search": 0.01}


PROMPT = """Find the business email address for this Philippine construction contractor.

Company: {company}
Address on its PhilGEPS award record: {address}
Province: {province}

Search the web for it. Look at its own website, its Facebook page, DTI/SEC/PCAB or LGU
listings, bid bulletins and award notices, industry directories -- whatever turns up.

Rules, in order of importance:
1. Only return an email you actually saw on a page that also names THIS company. Never
   construct one from a domain, never adapt one from a similarly-named firm in another
   province, never guess a pattern like info@<company>.com.
2. Philippine SME contractors often have no website. A free-provider address
   (gmail/yahoo) published on the company's own Facebook page or a government listing is
   the normal, correct answer -- prefer it over a corporate-looking address you inferred.
3. Same-surname firms repeat nationwide. If the page you found is for a company in a
   different province, that is a different company. Return none.
4. If you find nothing you can stand behind, return none. A blank is fine.

Reply with ONLY a JSON object, no other text:
{{"email": <string or null>,
  "source_url": <the page you read it off, string or null>,
  "confidence": "good" | "weak" | "none",
  "note": <one short sentence: what page this was, and why it is or isn't this company>}}

confidence: "good" = the page names this company AND places it in {province}.
"weak" = plausible but you could not confirm the province or the exact legal name.
"none" = no email found, or nothing you could tie to this company."""

TOOLS = [{"type": "web_search_20260209", "name": "web_search", "max_uses": 6}]


def cost(usage):
    """Dollars for one response, from the API's own usage block -- never an estimate."""
    st = getattr(usage, "server_tool_use", None)
    searches = getattr(st, "web_search_requests", 0) or 0
    return (usage.input_tokens * PRICE["in"]
            + usage.output_tokens * PRICE["out"]
            + (usage.cache_read_input_tokens or 0) * PRICE["cache_read"]
            + searches * PRICE["search"])


def parse(text):
    """The model is told to answer with bare JSON; tolerate a fence or stray prose anyway."""
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise ValueError(f"no JSON in reply: {text[:200]}")
    d = json.loads(m.group(0))
    email = (d.get("email") or "").strip().lower() or None
    # A malformed address is a wrong address. Drop it rather than store it.
    if email and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[a-z]{2,}", email):
        email, d["note"] = None, f"rejected malformed address {email!r}; {d.get('note','')}"
        d["confidence"] = "none"
    conf = d.get("confidence") if d.get("confidence") in ("good", "weak", "none") else "none"
    if not email:
        conf = "none"
    return email, (d.get("source_url") or None), conf, (d.get("note") or "")[:300]



def lookup(client, company, province, address):
    r = client.messages.create(
        model=MODEL,
        max_tokens=4000,
        output_config={"effort": "low"},
        tools=TOOLS,
        messages=[{"role": "user", "content": PROMPT.format(
            company=company, province=province or "unknown",
            address=city_of(address, province) or "unknown")}],
    )
    text = "".join(b.text for b in r.content if b.type == "text")
    return parse(text), cost(r.usage)


def main():
    limit = int(sys.argv[1]) if sys.argv[1:] and sys.argv[1].isdigit() else 10**9
    db = sqlite3.connect(DB, check_same_thread=False)
    migrate(db)
    done = {r[0] for r in db.execute(
        "select winner from contacts where email_checked_at is not null")}
    todo = [(w, p, a) for w, (p, a) in shortlist(db).items() if w not in done][:limit]
    print(f"resolving {len(todo)} companies (already done: {len(done)}), cap ${CAP_USD:.0f}")

    client = anthropic.Anthropic()
    lock = threading.Lock()
    spent, tally, failed = 0.0, {"good": 0, "weak": 0, "none": 0}, 0

    def work(row):
        nonlocal spent, failed
        w, prov, addr = row
        with lock:
            # Check the cap BEFORE paying, not after. Threads race, so re-check per call.
            if spent >= CAP_USD:
                return
        for attempt in range(3):
            try:
                (email, src, conf, note), c = lookup(client, w, prov, addr)
                break
            except Exception as e:
                if attempt == 2:
                    with lock:
                        failed += 1
                    print(f"  fail {w[:34]}: {e}", file=sys.stderr)
                    return
                time.sleep(3 + 5 * attempt)
        with lock:
            spent += c
            tally[conf] += 1
            db.execute(
                "insert into contacts (winner, email, email_source, email_confidence,"
                " email_note, email_checked_at) values (?,?,?,?,?,?)"
                " on conflict(winner) do update set email=excluded.email,"
                " email_source=excluded.email_source,"
                " email_confidence=excluded.email_confidence,"
                " email_note=excluded.email_note,"
                " email_checked_at=excluded.email_checked_at",
                (w, email, src, conf, note,
                 datetime.now(timezone.utc).isoformat(timespec="seconds")))
            db.commit()
            n = sum(tally.values())
            if n % 10 == 0 or email:
                print(f"  {n}/{len(todo)} ${spent:.2f}  {conf:4} {w[:34]:36} {email or ''}",
                      flush=True)

    with ThreadPoolExecutor(WORKERS) as pool:
        list(pool.map(work, todo))

    found = db.execute("select count(*) from contacts where email is not null").fetchone()[0]
    print(f"\n{tally}  failed: {failed}")
    print(f"emails on file: {found}   spent: ${spent:.2f} of ${CAP_USD:.0f}")
    if spent >= CAP_USD:
        print("CAP REACHED -- run again to continue", file=sys.stderr)
        sys.exit(3)


def one():
    company = sys.argv[2]
    db = sqlite3.connect(DB)
    row = db.execute("select winner_province, winner_address from awards"
                     " where winner=? limit 1", (company,)).fetchone() or (None, None)
    (email, src, conf, note), c = lookup(anthropic.Anthropic(), company, *row)
    print(json.dumps({"email": email, "source": src, "confidence": conf, "note": note,
                      "cost_usd": round(c, 4)}, indent=2))


def selfcheck():
    e, s, c, n = parse('{"email":"Info@ACME.PH ","source_url":"https://x","confidence":"good","note":"site"}')
    assert (e, c) == ("info@acme.ph", "good"), (e, c)
    # a malformed address must be dropped, not stored -- a wrong email burns the lead
    e, s, c, n = parse('{"email":"info at acme","source_url":null,"confidence":"good","note":""}')
    assert e is None and c == "none", (e, c)
    # no email means no confidence, whatever the model claimed
    e, s, c, n = parse('{"email":null,"source_url":null,"confidence":"good","note":"none found"}')
    assert e is None and c == "none", (e, c)
    e, s, c, n = parse('here you go:\n```json\n{"email":"a@b.co","confidence":"weak"}\n```')
    assert (e, c) == ("a@b.co", "weak"), (e, c)

    class U:  # usage block shape from the API
        input_tokens, output_tokens, cache_read_input_tokens = 20_000, 400, 0
        server_tool_use = type("S", (), {"web_search_requests": 3})()
    assert abs(cost(U()) - (0.10 + 0.01 + 0.03)) < 1e-9, cost(U())
    print("ok")


if __name__ == "__main__":
    cmd = sys.argv[1:2]
    selfcheck() if cmd == ["test"] else one() if cmd == ["one"] else main()
