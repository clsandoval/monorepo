#!/usr/bin/env python3
"""Record email lookups into awards.db contacts. Reads a JSON list on stdin.

    echo '[{"winner":"ACME","email":"a@b.ph","source":"https://...",
            "confidence":"good","note":"FB page"}]' | python3 save_emails.py

Companion to enrich_emails.py -- same columns, same rules -- for lookups done by hand or
by an agent with its own search tools rather than through the paid API path. `email` may
be null: recording a confirmed blank is what makes the pass resumable, so a firm nobody
can find an address for is never searched twice.
"""
import json, re, sqlite3, sys
from datetime import datetime, timezone
from pathlib import Path

DB = Path(__file__).parent / "awards.db"
ADDR = re.compile(r"[^@\s]+@[^@\s]+\.[a-z]{2,}")
# Owned here, not in enrich_emails: that module imports the anthropic SDK, and this one
# must stay runnable without it.
COLS = ("email", "email_source", "email_confidence", "email_note", "email_checked_at")


def migrate(db):
    have = {r[1] for r in db.execute("pragma table_info(contacts)")}
    for c in COLS:
        if c not in have:
            db.execute(f"alter table contacts add column {c} text")
    db.commit()


def clean(rec):
    email = (rec.get("email") or "").strip().lower() or None
    if email and not ADDR.fullmatch(email):
        raise ValueError(f"{rec['winner']}: malformed address {email!r}")
    conf = rec.get("confidence", "none")
    if conf not in ("good", "weak", "none"):
        raise ValueError(f"{rec['winner']}: bad confidence {conf!r}")
    # No address means no confidence, whatever was passed in.
    return (rec["winner"], email, rec.get("source") or None,
            conf if email else "none", (rec.get("note") or "")[:300],
            datetime.now(timezone.utc).isoformat(timespec="seconds"))


def main():
    rows = [clean(r) for r in json.load(sys.stdin)]   # validate all before writing any
    db = sqlite3.connect(DB)
    migrate(db)
    db.executemany(
        f"insert into contacts (winner, {', '.join(COLS)}) values (?,?,?,?,?,?)"
        " on conflict(winner) do update set "
        + ", ".join(f"{c}=excluded.{c}" for c in COLS), rows)
    db.commit()
    n = db.execute("select count(*) from contacts where email is not null").fetchone()[0]
    left = db.execute("select count(*) from contacts where email_checked_at is null").fetchone()[0]
    print(f"wrote {len(rows)}  ({sum(1 for r in rows if r[1])} with an address)"
          f"   total on file: {n}")


def selfcheck():
    assert clean({"winner": "X", "email": " A@B.PH ", "confidence": "good"})[1:4] \
        == ("a@b.ph", None, "good")
    # a blank is a legitimate, recordable result -- and it can never be "good"
    assert clean({"winner": "X", "email": None, "confidence": "good"})[1:4] == (None, None, "none")
    for bad in ({"winner": "X", "email": "not an email"}, {"winner": "X", "confidence": "yes"}):
        try:
            clean(bad)
            raise AssertionError(f"should have rejected {bad}")
        except ValueError:
            pass
    print("ok")


if __name__ == "__main__":
    selfcheck() if sys.argv[1:2] == ["test"] else main()
