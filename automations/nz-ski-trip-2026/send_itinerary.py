"""Send the Hintertux hypothetical itinerary to Telegram."""
import sys
import uuid
import mimetypes
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
ITINERARY = ROOT / "hintertux-itinerary.md"


def load_env(path: Path) -> dict:
    out = {}
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def send_message(token: str, chat_id: str, text: str, parse_mode: str = "Markdown") -> dict:
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = urllib.parse.urlencode({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": "true",
    }).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return {"status": resp.status, "body": resp.read().decode()[:200]}


def send_document(token: str, chat_id: str, file_path: Path, caption: str) -> dict:
    url = f"https://api.telegram.org/bot{token}/sendDocument"
    boundary = uuid.uuid4().hex
    body_parts = []

    def add_field(name: str, value: str):
        body_parts.append(f"--{boundary}\r\n".encode())
        body_parts.append(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        body_parts.append(value.encode("utf-8"))
        body_parts.append(b"\r\n")

    def add_file(name: str, fp: Path):
        mime = mimetypes.guess_type(fp.name)[0] or "text/markdown"
        body_parts.append(f"--{boundary}\r\n".encode())
        body_parts.append(
            f'Content-Disposition: form-data; name="{name}"; filename="{fp.name}"\r\n'.encode()
        )
        body_parts.append(f"Content-Type: {mime}\r\n\r\n".encode())
        body_parts.append(fp.read_bytes())
        body_parts.append(b"\r\n")

    add_field("chat_id", chat_id)
    add_field("caption", caption)
    add_file("document", file_path)
    body_parts.append(f"--{boundary}--\r\n".encode())
    body = b"".join(body_parts)
    req = urllib.request.Request(
        url, data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return {"status": resp.status, "body": resp.read().decode()[:200]}


def main():
    import urllib.parse
    globals()['urllib'].parse = urllib.parse  # ensure parse available
    env_path = Path(__file__).parent.parent.parent / ".env"
    env = load_env(env_path)
    token = env.get("TELEGRAM_BOT_TOKEN")
    chat_id = env.get("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        print("Missing Telegram creds", file=sys.stderr)
        sys.exit(1)

    summary = (
        "*HINTERTUX HYPOTHETICAL TRIP — 20 Jun → 2 Jul 2026*\n\n"
        "*Total:* ~€2,476 / ~PHP 156,000 (incl. flight, hotel, lift pass, insurance, visa, food)\n"
        "*Solo, own gear, no rental car, all public transport*\n\n"
        "*Highlights:*\n"
        "• Fly MNL → VIE (1-stop Qatar/Emirates)\n"
        "• Train VIE → Jenbach (Railjet, 4h) → Mayrhofen (Zillertalbahn, 50m) → Bus 4104 to Hintertux (free w/ guest card)\n"
        "• 10 nights at *Haus Windegg* — 400ft from Hintertux glacier funicular (€56/n)\n"
        "• *7 ski sessions × ~5h = 35h on snow* on the year-round Tuxer Ferner glacier\n"
        "• 2 rest days: Mayrhofen + Innsbruck day trips\n"
        "• Activities: Eisgletscher ice cave tour, Spannagelhöhle marble cave, Nordkette urban-to-alpine cable car\n\n"
        "Full hour-by-hour itinerary attached as ITINERARY.md below."
    )
    print("Sending summary message...")
    r = send_message(token, chat_id, summary)
    print(f"  -> {r['status']}")

    print("Sending itinerary document...")
    r = send_document(
        token, chat_id, ITINERARY,
        "Hintertux 2026 — full hour-by-hour itinerary"
    )
    print(f"  -> {r['status']}")


if __name__ == "__main__":
    import urllib.parse  # also import for top-level access
    main()
