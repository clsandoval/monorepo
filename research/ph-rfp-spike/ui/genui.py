import os, json, base64, urllib.request, concurrent.futures, pathlib, re

KEY = None
for line in open('/home/clsandoval/cs/monorepo/.env'):
    if line.startswith('OPENAI_API_KEY='):
        KEY = line.split('=', 1)[1].strip().strip('"').strip("'")
assert KEY, "no OPENAI_API_KEY"

OUT = pathlib.Path('/tmp/claude-1000/-home-clsandoval-cs-monorepo/25f890af-9bef-4723-b00c-216b7c42cd92/scratchpad/ui')
OUT.mkdir(exist_ok=True)

BASE = ("A high-fidelity desktop web app UI screenshot, rendered crisply as a real product interface, "
        "not an illustration. Realistic legible UI text. No purple gradients, no Inter or Roboto, "
        "no generic AI-startup aesthetic, no stock-photo people, no phone mockup frame. "
        "The product finds Philippine government bid opportunities (RFPs) for contractors. ")

DIRECTIONS = [
    ("01-thread",
     BASE + "DIRECTION: classic chat, results as cards inside the conversation. "
     "Left sidebar 260px wide listing past chat sessions with short titles like 'Drainage works Agusan', "
     "'DepEd ICT supply', 'Road repair Bohol'. Center column is a chat thread: a user message bubble reading "
     "'road concreting projects in Agusan del Norte under 5 million', then an assistant reply followed by three "
     "stacked result cards. Each card shows a project title in bold, the procuring agency in smaller caps "
     "(MUNICIPALITY OF MAGALLANES AGUSAN DEL NORTE), a peso budget figure like PHP 4,850,000 in large tabular "
     "numerals, and a red pill badge reading 'Closes in 6 days'. A chat input bar pinned at the bottom. "
     "STYLE: warm paper off-white background #FAF7F2, deep forest green primary #14532D, "
     "a serif display typeface for headings and a clean grotesque for body text, generous whitespace, "
     "soft 1px hairline borders, no drop shadows."),

    ("02-split",
     BASE + "DIRECTION: split view. Left third is a chat conversation, right two-thirds is a persistent "
     "results panel that accumulates matches as a scrollable list. A thin far-left rail of session icons. "
     "The results panel has a compact header reading '14 matches - 4,300 open nationwide' and rows each showing "
     "project title, agency, a peso amount right-aligned in tabular numerals, and a small countdown chip. "
     "One row is selected and highlighted. STYLE: dark mode, near-black background #0F1115, "
     "elevated panel #171A20, warm amber accent #F0A93B for selected state and countdown chips, "
     "a condensed sans for headings, monospaced numerals for peso figures, subtle 1px borders."),

    ("03-feed",
     BASE + "DIRECTION: feed-first. No empty chat box - the default screen is today's matched opportunities. "
     "A large editorial headline at top reading 'Today for Alpha Builders Inc.' with a subline "
     "'6 new - 2 closing this week'. Below it a vertical feed of opportunity cards, each with the project title "
     "as a headline, agency and province as a byline, a peso budget, and a deadline. "
     "A single slim refinement input floating at the bottom center with placeholder text "
     "'refine - try: only civil works in Region X'. Left sidebar lists saved searches, not chat sessions. "
     "STYLE: crisp white background, deep maroon accent #7B1E1E, a high-contrast editorial serif for headlines, "
     "newspaper-like column rhythm, thin rules between cards, restrained and print-inspired."),

    ("04-dense",
     BASE + "DIRECTION: dense professional table for contractors who bid daily. Main area is a compact data "
     "table with columns: Ref, Project, Agency, Class, ABC (peso, right-aligned tabular numerals), Closes. "
     "About twelve tight rows visible, alternating row tint, one row hovered. Above the table a row of small "
     "filter chips reading 'Civil Works', 'Region XIII', 'under 10M'. A command-palette overlay floats over the "
     "center, semi-transparent, with a text input reading 'find me irrigation projects I can bid on' and three "
     "suggestion lines beneath it. STYLE: light neutral grey-white #F5F6F7, near-black text, "
     "teal accent #0E7490, monospaced typeface for all numerals and reference codes, "
     "very tight vertical rhythm, thin grid lines, information-dense like a Bloomberg terminal but clean."),
]


def gen(item):
    name, prompt = item
    body = json.dumps({
        "model": "gpt-image-2",
        "prompt": prompt,
        "size": "1536x1024",
    }).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=body,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            data = json.load(r)
    except urllib.error.HTTPError as e:
        return name, f"HTTP {e.code}: {e.read().decode()[:400]}"
    d = data["data"][0]
    if d.get("b64_json"):
        raw = base64.b64decode(d["b64_json"])
    else:
        raw = urllib.request.urlopen(d["url"], timeout=300).read()
    p = OUT / f"{name}.png"
    p.write_bytes(raw)
    return name, f"OK {len(raw)//1024}KB -> {p}"


with concurrent.futures.ThreadPoolExecutor(4) as ex:
    for name, msg in ex.map(gen, DIRECTIONS):
        print(name, msg, flush=True)
