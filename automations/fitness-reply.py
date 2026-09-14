#!/usr/bin/env python3
"""Fitness reply handler: when Carlos replies (on Telegram) to a fitness-reminder message, or to
anything in that reply chain, hand the reply to Claude Code (Haiku) here in the monorepo. Haiku
logs it in projects/fitness/log.md, commits, and answers back in the same Telegram thread.

Only replies inside a reminder's chain trigger it. Ordinary messages to the bot are ignored.

Usage:
    fitness-reply.py record --slot SLOT --message-id N --text TEXT   # called by fitness-reminder.sh
    fitness-reply.py poll                                            # cron, every minute (flock'd)

State lives in ~/.local/state/fitness-reply/state.json:
    last_update_id  high-water mark (polling is NON-destructive: no offset= is sent, so the
                    telegram skill's get_updates and bidkita's link-by-getUpdates keep working)
    threads         message_id -> root message_id (root = the reminder message)
    roots           root message_id -> {slot, date, reminder, session_id, ts}
Each root gets one Claude session; later replies in the same chain --resume it.
"""

import argparse
import json
import os
import subprocess
import sys
import time
import uuid
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

REPO = Path.home() / "cs" / "monorepo"
ENV_FILE = REPO / ".env"
STATE_DIR = Path.home() / ".local" / "state" / "fitness-reply"
STATE_FILE = STATE_DIR / "state.json"
PHOTO_DIR = Path("/tmp/fitness-reply")
CLAUDE = Path.home() / ".nvm/versions/node/v20.19.5/bin/claude"
SKILL = REPO / ".claude/skills/fitness/SKILL.md"
THREAD_TTL = 3 * 86400          # forget chains after 3 days
CLAUDE_TIMEOUT = 420            # seconds


def load_env():
    env = {}
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    return env["TELEGRAM_BOT_TOKEN"], str(env["TELEGRAM_CHAT_ID"])


def api(token, method, data=None):
    url = f"https://api.telegram.org/bot{token}/{method}"
    if data is None:
        req = Request(url)
    else:
        req = Request(url, data=json.dumps(data).encode(), method="POST")
        req.add_header("Content-Type", "application/json")
    try:
        with urlopen(req, timeout=60) as resp:
            return json.loads(resp.read())
    except HTTPError as e:
        return json.loads(e.read())


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"last_update_id": None, "threads": {}, "roots": {}}


def save_state(state):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    tmp = STATE_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2))
    tmp.replace(STATE_FILE)


def prune(state):
    cutoff = time.time() - THREAD_TTL
    dead = {r for r, meta in state["roots"].items() if meta.get("ts", 0) < cutoff}
    for r in dead:
        del state["roots"][r]
    state["threads"] = {m: r for m, r in state["threads"].items() if r not in dead}


def log(msg):
    print(time.strftime("%Y-%m-%d %H:%M:%S ") + msg, flush=True)


# ---------------------------------------------------------------- record

def cmd_record(args):
    state = load_state()
    mid = str(args.message_id)
    state["roots"][mid] = {
        "slot": args.slot,
        "date": time.strftime("%Y-%m-%d", time.gmtime(time.time() + 8 * 3600)),  # Manila
        "reminder": args.text,
        "session_id": None,
        "ts": time.time(),
    }
    state["threads"][mid] = mid
    prune(state)
    save_state(state)
    log(f"recorded reminder message {mid} ({args.slot})")


# ---------------------------------------------------------------- poll

def download_photo(token, msg):
    """Largest size of a photo message -> /tmp path, or None."""
    photo = msg.get("photo")
    if not photo:
        return None
    file_id = photo[-1]["file_id"]
    info = api(token, f"getFile?file_id={file_id}")
    if not info.get("ok"):
        return None
    fp = info["result"]["file_path"]
    PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    out = PHOTO_DIR / f"{msg['message_id']}{Path(fp).suffix or '.jpg'}"
    try:
        with urlopen(f"https://api.telegram.org/file/bot{token}/{fp}", timeout=120) as r:
            out.write_bytes(r.read())
    except (HTTPError, URLError) as e:
        log(f"photo download failed: {e}")
        return None
    return out


SYSTEM = """You are Carlos's fitness coach bot, running headless inside his monorepo. He replied on
Telegram to one of your check-in messages; the reply is the user turn. Do exactly what
.claude/skills/fitness/SKILL.md says (read it, then projects/fitness/profile.md Rules v2 and the
top of projects/fitness/log.md). Coach mode: you decide, he reports.

- Log what he sent into today's entry in projects/fitness/log.md (create the day if missing,
  newest at top, the file's format). Weight, food with estimated macros, training with loads.
- If a photo path is given, Read it (it is a food or scale photo) and estimate from it.
- Commit right after editing: git add projects/fitness/log.md projects/fitness/profile.md && git commit -m "fitness log"
- If it is a question, answer it per Rules v2 and still log any food/weight/training he mentioned.

Your final output is sent back to him on Telegram verbatim. Make it ONE short message: max 6 lines,
plain text, no markdown, no headers, 1-2 emoji max. Lead with the verdict / where the day stands
(cals and protein so far vs 2200 / 150, what is left), then the next move. Directive first, one
line of why at most. No arithmetic essays. Never invent food he did not send. Output only the
message text, nothing else."""


def run_claude(root_meta, root_id, user_text, photo_path, when):
    session_id = root_meta.get("session_id")
    resume = session_id is not None
    if not resume:
        session_id = str(uuid.uuid4())

    prompt = (f"[{when} Manila] Reply to your {root_meta['slot']} check-in"
              + ("" if resume else f", which said:\n\"\"\"\n{root_meta['reminder']}\n\"\"\"")
              + f"\n\nCarlos's reply:\n{user_text or '(no text)'}")
    if photo_path:
        prompt += f"\n\nHe attached a photo: {photo_path}  (Read it.)"

    base = [str(CLAUDE), "-p", "--model", "haiku", "--dangerously-skip-permissions",
            "--output-format", "text", "--append-system-prompt", SYSTEM,
            "--allowedTools", "Read", "Edit", "Write", "Grep", "Glob", "Skill",
            "Bash(git add:*)", "Bash(git commit:*)", "Bash(git status:*)", "Bash(git diff:*)", "Bash(date:*)"]
    cmd = base + (["--resume", session_id] if resume else ["--session-id", session_id])

    err_log = open("/tmp/fitness-reply.err", "a")
    try:
        r = subprocess.run(cmd, input=prompt, capture_output=True, text=True,
                           cwd=REPO, timeout=CLAUDE_TIMEOUT)
    except subprocess.TimeoutExpired:
        err_log.write(f"{time.ctime()} claude timed out (root {root_id})\n")
        return None, session_id if resume else None
    err_log.write(r.stderr)
    out = r.stdout.strip()
    if r.returncode != 0 or not out or "Not logged in" in out:
        err_log.write(f"{time.ctime()} claude rc={r.returncode} root={root_id} out={out[:200]!r}\n")
        if resume:
            # session may be gone; next reply starts fresh
            return None, None
        return None, None
    return out, session_id


def cmd_poll(args):
    token, chat_id = load_env()
    state = load_state()
    prune(state)

    res = api(token, "getUpdates?limit=100&allowed_updates=%5B%22message%22%5D")
    if not res.get("ok"):
        log(f"getUpdates failed: {res}")
        return
    updates = res["result"]
    if not updates:
        return

    hwm = state.get("last_update_id")
    if hwm is None:
        # first run: don't replay history
        state["last_update_id"] = max(u["update_id"] for u in updates)
        save_state(state)
        log(f"initialised high-water mark at {state['last_update_id']}")
        return

    for u in sorted(updates, key=lambda x: x["update_id"]):
        uid = u["update_id"]
        if uid <= hwm:
            continue
        state["last_update_id"] = uid
        save_state(state)

        msg = u.get("message") or {}
        if str(msg.get("chat", {}).get("id")) != chat_id:
            continue
        if msg.get("from", {}).get("is_bot"):
            continue
        parent = msg.get("reply_to_message", {}).get("message_id")
        if parent is None or str(parent) not in state["threads"]:
            continue

        root_id = state["threads"][str(parent)]
        root = state["roots"].get(root_id)
        if not root:
            continue

        mid = str(msg["message_id"])
        state["threads"][mid] = root_id
        text = msg.get("text") or msg.get("caption") or ""
        photo = download_photo(token, msg)
        when = time.strftime("%a %H:%M", time.gmtime(msg.get("date", time.time()) + 8 * 3600))
        log(f"reply {mid} -> root {root_id} ({root['slot']}): {text[:80]!r}{' +photo' if photo else ''}")

        reply, session_id = run_claude(root, root_id, text, photo, when)
        root["session_id"] = session_id
        if not reply:
            reply = ("⚠️ Coach bot couldn't process that reply (see /tmp/fitness-reply.err). "
                     "Log it in a Claude session: /fitness log today.")

        sent = api(token, "sendMessage", {"chat_id": chat_id, "text": reply,
                                          "reply_parameters": {"message_id": int(mid)}})
        if sent.get("ok"):
            bot_mid = str(sent["result"]["message_id"])
            state["threads"][bot_mid] = root_id
            log(f"answered as {bot_mid}")
        else:
            log(f"sendMessage failed: {sent}")
        save_state(state)


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("record")
    r.add_argument("--slot", required=True)
    r.add_argument("--message-id", required=True, type=int)
    r.add_argument("--text", default="")
    sub.add_parser("poll")
    args = p.parse_args()
    {"record": cmd_record, "poll": cmd_poll}[args.cmd](args)


if __name__ == "__main__":
    main()
