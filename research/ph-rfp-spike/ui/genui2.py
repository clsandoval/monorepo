import os, json, base64, urllib.request, concurrent.futures, pathlib

KEY = None
for line in open('/home/clsandoval/cs/monorepo/.env'):
    if line.startswith('OPENAI_API_KEY='):
        KEY = line.split('=', 1)[1].strip().strip('"').strip("'")
assert KEY

OUT = pathlib.Path('/tmp/claude-1000/-home-clsandoval-cs-monorepo/25f890af-9bef-4723-b00c-216b7c42cd92/scratchpad/ui')
OUT.mkdir(exist_ok=True)

# Carry over direction 04's identity verbatim, then add the chat panel.
THEME = (
    "A high-fidelity desktop web app UI screenshot, rendered crisply as a real product interface, not an "
    "illustration. Realistic legible UI text. No purple gradients, no Inter or Roboto, no generic AI-startup "
    "aesthetic, no phone mockup frame. The product finds Philippine government bid opportunities (RFPs) for "
    "contractors. "
    "STYLE, EXACTLY: light neutral grey-white background #F5F6F7, near-black text, teal accent #0E7490, "
    "monospaced typeface for ALL numerals and reference codes, very tight vertical rhythm, thin 1px grid lines, "
    "information-dense like a Bloomberg terminal but clean and calm. "
    "CHROME, EXACTLY: a top navigation bar with a small plain wordmark 'PH BIDS' on the left (a simple geometric "
    "wordmark, NOT a government seal, NOT a laurel wreath, NOT a neoclassical building, NOT stars) followed by "
    "tabs 'Opportunities, Monitor, Awards, Contracts, My Bid Board', and on the far right a notification bell "
    "with a badge and a company name 'BuildRight Construction Inc.'. A narrow left icon-and-label nav rail: "
    "Dashboard, Search, Opportunities, Bid Board, Alerts, Saved Searches, My Organization, Settings. "
    "At the very bottom of that left rail, small grey text reading 'Data updated 08:15 AM' and "
    "'Source: PhilGEPS'. "
    "THE TABLE, EXACTLY: a dense data table with columns Ref, Project, Agency, Class, ABC (P), Closes. "
    "Ref values are monospaced codes like 25CS0134, 25BUT0007, 25AGD0045. Projects are real-sounding Philippine "
    "civil works, e.g. 'Construction of Multi-Purpose Building (Barangay Hall), Barangay Poblacion, Bayugan City' "
    "and 'Rehabilitation of Farm-to-Market Road, Don Victoriano, Misamis Occidental'. Agencies like "
    "'Bayugan City LGU', 'DPWH - Misamis Occidental 2nd DEO', 'DepEd - Surigao City Division'. "
    "ABC figures right-aligned monospaced like 9,800,000.00. Closes column shows a date and time such as "
    "'May 28, 2026  10:00 AM'. Alternating row tint, one row highlighted in a pale teal tint. "
    "Above the table a row of small teal-outlined filter chips reading 'Civil Works x', 'Region XIII x', "
    "'under 10M x', then 'Clear all', with '1,248 opportunities' beneath on the left and a 'Sort by: Closing "
    "Date (Soonest)' control on the right. "
)

CHAT = (
    "THE CHAT PANEL: a persistent chat column about 380px wide, same palette, separated from the table by a "
    "single thin 1px vertical rule (no drop shadow, no floating card). At its top a compact row of session tabs "
    "reading 'Irrigation MinDA', 'School bldgs R-XIII', '+', with the first tab active and underlined in teal. "
    "Below that a conversation: a user message aligned right in a pale teal bubble reading 'irrigation projects "
    "in Agusan I can actually bid on, PCAB C', then an assistant reply in plain text on the background (no "
    "bubble) reading 'Filtered to 14 open. 9 match your PCAB Category C ceiling. Sorted by closing date.' "
    "followed by three ultra-compact result chips, each one line: a monospaced ref code, a truncated project "
    "title, and a teal countdown like '6d'. At the bottom of the panel a plain single-line input with the "
    "placeholder 'ask, or refine the table...' and a small teal send button. "
    "The chat panel and the table are visibly linked: the highlighted table row is the same ref code as the "
    "first result chip in the chat. "
)

VARIANTS = [
    ("05-dense-chat-left",
     THEME + CHAT +
     "LAYOUT: left icon nav rail, then the chat panel immediately to its right, then the dense table filling "
     "the remaining two-thirds of the screen on the right. The table is the largest element on screen."),
    ("06-dense-chat-right",
     THEME + CHAT +
     "LAYOUT: left icon nav rail, then the dense table filling the centre and majority of the screen, then the "
     "chat panel docked on the far right edge. The table is the largest element on screen."),
]


def gen(item):
    name, prompt = item
    body = json.dumps({"model": "gpt-image-2", "prompt": prompt, "size": "1536x1024"}).encode()
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
    raw = base64.b64decode(d["b64_json"]) if d.get("b64_json") else urllib.request.urlopen(d["url"], timeout=300).read()
    p = OUT / f"{name}.png"
    p.write_bytes(raw)
    return name, f"OK {len(raw)//1024}KB -> {p}"


with concurrent.futures.ThreadPoolExecutor(2) as ex:
    for name, msg in ex.map(gen, VARIANTS):
        print(name, msg, flush=True)
