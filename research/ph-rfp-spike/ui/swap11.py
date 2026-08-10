"""The original 11 images, red swapped for blue. Nothing else touched.

Editing the pixels beats re-prompting: layout, type, spacing and copy are guaranteed identical,
so the only variable is the ink. Re-prompting drifts the whole design and that is what went wrong
the first time this was asked for.

    python3 swap11.py
"""
import base64, json, mimetypes, pathlib, urllib.request

KEY = next(l.split('=', 1)[1].strip().strip('"').strip("'")
           for l in open('/home/clsandoval/cs/monorepo/.env') if l.startswith('OPENAI_API_KEY='))
OUT = pathlib.Path(__file__).parent
SRC = ["brand-11-signal-red", "apply-11-signal-red-landing", "apply-11-signal-red-app"]
PROMPT = ("Recolour only. Change every red element to the blue #1550D8 -- the wordmark, the rule, "
          "the buttons, the deadline chips, the swatch, every red pixel. Keep absolutely "
          "everything else identical: same layout, same composition, same typography, same "
          "spacing, same wording, same greys, same white ground. Do not redraw, reflow or "
          "restyle anything. If a hex code is written on the image as text, change #D93025 to "
          "#1550D8.")


def post(name):
    src = OUT / f"{name}.png"
    b, mime = src.read_bytes(), mimetypes.guess_type(str(src))[0]
    bnd = "----swap11"
    body = b""
    for k, v in (("model", "gpt-image-2"), ("prompt", PROMPT), ("size", "1536x1024")):
        body += (f"--{bnd}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n").encode()
    body += (f"--{bnd}\r\nContent-Disposition: form-data; name=\"image\"; "
             f"filename=\"{src.name}\"\r\nContent-Type: {mime}\r\n\r\n").encode() + b + b"\r\n"
    body += f"--{bnd}--\r\n".encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/edits", data=body,
        headers={"Authorization": f"Bearer {KEY}",
                 "Content-Type": f"multipart/form-data; boundary={bnd}"})
    with urllib.request.urlopen(req, timeout=900) as r:
        data = json.load(r)
    d = data["data"][0]
    raw = (base64.b64decode(d["b64_json"]) if d.get("b64_json")
           else urllib.request.urlopen(d["url"], timeout=300).read())
    p = OUT / f"{name.replace('signal-red', 'signal-blue')}.png"
    p.write_bytes(raw)
    with open(OUT / "image-spend.jsonl", "a") as fh:
        fh.write(json.dumps({"name": p.stem, "op": "edit", "model": "gpt-image-2",
                             "usage": data.get("usage") or {}}) + "\n")
    return f"{p.name}  {len(raw)//1024}KB  {data.get('usage') or 'no usage reported'}"


if __name__ == "__main__":
    for n in SRC:
        try:
            print(post(n), flush=True)
        except urllib.error.HTTPError as e:
            print(n, "HTTP", e.code, e.read().decode()[:300], flush=True)
