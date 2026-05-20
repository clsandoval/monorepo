"""Send the rendered NZ ski trail maps to Telegram as documents (preserves resolution)."""
import os
import sys
from pathlib import Path
import urllib.request
import urllib.parse
import mimetypes
import uuid

MAPS_DIR = Path(__file__).parent / "maps"

MAPS = [
    ("treble_cone.png", "Treble Cone — Wanaka (550 ha, 700m vert — longest in Southern Lakes)"),
    ("cardrona.png", "Cardrona — Wanaka/Crown Range (615 ha, 600m vert — biggest in NZ)"),
    ("remarkables.png", "The Remarkables — Queenstown (385 ha, 468m vert)"),
    ("coronet_peak.png", "Coronet Peak — Queenstown (280 ha, 462m vert — closest to town)"),
]


def load_env(path: Path) -> dict:
    out = {}
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def send_document(token: str, chat_id: str, file_path: Path, caption: str) -> dict:
    """Send a file as a Telegram document via multipart/form-data."""
    url = f"https://api.telegram.org/bot{token}/sendDocument"
    boundary = uuid.uuid4().hex
    body_parts = []

    def add_field(name: str, value: str):
        body_parts.append(f"--{boundary}\r\n".encode())
        body_parts.append(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        body_parts.append(value.encode("utf-8"))
        body_parts.append(b"\r\n")

    def add_file(name: str, fp: Path):
        mime = mimetypes.guess_type(fp.name)[0] or "application/octet-stream"
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
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return {"status": resp.status, "body": resp.read().decode()[:200]}


def main():
    env_path = Path(__file__).parent.parent.parent / ".env"
    env = load_env(env_path)
    token = env.get("TELEGRAM_BOT_TOKEN")
    chat_id = env.get("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        print("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env", file=sys.stderr)
        sys.exit(1)

    for fname, caption in MAPS:
        fp = MAPS_DIR / fname
        if not fp.exists():
            print(f"SKIP missing {fp}")
            continue
        size_kb = fp.stat().st_size / 1024
        print(f"Sending {fname} ({size_kb:.0f} KB)...")
        try:
            r = send_document(token, chat_id, fp, caption)
            print(f"  -> {r['status']} {r['body'][:100]}")
        except Exception as e:
            print(f"  ERR {type(e).__name__}: {e}")


if __name__ == "__main__":
    main()
