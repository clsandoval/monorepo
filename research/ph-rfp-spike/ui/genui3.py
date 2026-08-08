import json, base64, urllib.request, concurrent.futures, pathlib

KEY = None
for line in open('/home/clsandoval/cs/monorepo/.env'):
    if line.startswith('OPENAI_API_KEY='):
        KEY = line.split('=', 1)[1].strip().strip('"').strip("'")
assert KEY

OUT = pathlib.Path('/tmp/claude-1000/-home-clsandoval-cs-monorepo/25f890af-9bef-4723-b00c-216b7c42cd92/scratchpad/ui')

CORE = (
    "A high-fidelity desktop web app UI screenshot, rendered crisply as a real product interface, not an "
    "illustration. Realistic legible UI text. No purple gradients, no generic AI-startup aesthetic, no phone "
    "mockup frame, no government seal, no laurel wreath, no stars. "
    "PRODUCT: finds Philippine government bid opportunities (RFPs) for construction contractors. "
    "PALETTE, LOCKED: background #F5F6F7, surfaces white, text near-black #111315, single accent teal #0E7490. "
    "No other hue anywhere. "
    "TYPE: a precise geometric neo-grotesque for text; ALL numerals, peso figures and reference codes set in a "
    "monospaced face with tabular figures. "
    "LAYOUT: a plain 'PH BIDS' wordmark top-left. A dense opportunities table occupying the centre and left "
    "majority of the screen. A chat panel docked on the RIGHT edge, roughly 380px wide. "
    "TABLE CONTENT: columns Ref, Project, Agency, Class, ABC (P), Closes. Monospaced refs like 25AGD0045, "
    "25BUT0007, 25CS0134. Real-sounding Philippine civil works: 'Construction of Communal Irrigation System, "
    "Brgy. San Roque, Prosperidad, Agusan del Sur', 'Rehabilitation of Farm-to-Market Road, Don Victoriano, "
    "Misamis Occidental', 'Construction of School Building (4-Classroom), Brgy. San Isidro, Surigao City'. "
    "Agencies: 'Agusan del Sur LGU', 'DPWH - Agusan del Norte 2nd DEO', 'DepEd - Surigao City Division'. "
    "ABC right-aligned like 8,750,000.00. Closes shows 'May 27, 2026  10:00 AM'. One row is selected. "
    "CHAT CONTENT: session tabs 'Irrigation MinDA' and 'School bldgs R-XIII' with a '+'. A user message "
    "'irrigation projects in Agusan I can actually bid on, PCAB C'. An assistant reply 'Filtered to 14 open. "
    "9 match your PCAB Category C ceiling. Sorted by closing date.' Then three one-line result chips, each a "
    "mono ref code, truncated title, and a teal countdown like '6d'. An input at the bottom reading "
    "'ask, or refine the table...'. The selected table row shares its ref code with the first chat chip. "
    "Small grey footnote somewhere: 'Data updated 08:15 AM - Source: PhilGEPS'. "
)

VARIANTS = [
    ("07-airy",
     CORE +
     "DESIGN ENERGY: Apple-like restraint through negative space. REMOVE the table grid entirely - no vertical "
     "rules, no row borders, no zebra striping. Columns are defined purely by strict alignment and generous "
     "gutters. Very tall row height with a lot of air between rows. Large clear type scale: project titles "
     "noticeably larger than agency text, ABC figures the largest thing in each row. The selected row is "
     "indicated only by a soft pale-teal rounded rectangle behind it, no border. Navigation is reduced to a "
     "single quiet top line - wordmark, three or four plain text links, and an avatar - with no left sidebar "
     "at all. Filter chips are small, pill-shaped, hairline-outlined. Enormous page margins. The chat panel is "
     "separated from the table by whitespace alone, not a rule. Calm, spacious, confident, almost editorial."),

    ("08-unified-surface",
     CORE +
     "DESIGN ENERGY: Apple-like single-material unity. The entire application sits on one continuous white "
     "surface with a large 20px corner radius, floating on the #F5F6F7 background with one very soft diffuse "
     "shadow. Inside that single surface, the table and the chat panel are separated only by generous padding "
     "and one hairline. Everything inside shares the same radius language: search field, filter chips, result "
     "chips and the selected row all use consistent rounded corners. A slim left icon-only rail (no labels) "
     "with a teal indicator on the active icon. Medium row density with light, comfortable spacing. "
     "The overall impression is one solid, beautifully machined object rather than a page of separate boxes."),

    ("09-typographic",
     CORE +
     "DESIGN ENERGY: striking through typography and restraint, near-monochrome. Teal appears exactly twice on "
     "the whole screen - the active session tab underline and the countdown chips - everything else is "
     "near-black on white and grey. Dramatic type hierarchy: a very large page title reading '1,248 open "
     "opportunities' set big and tight at the top left with a small grey subline '14 match your profile'. "
     "In the table, ABC peso figures are set noticeably larger and heavier than everything else so the money "
     "is what the eye lands on first; agency and class are small uppercase grey letterspaced labels. "
     "Only horizontal hairline rules, no verticals. Tight, precise, high-contrast, unfussy. "
     "Chat panel on the right is almost entirely plain text with no bubbles - only alignment and weight "
     "distinguish the user message from the assistant reply."),
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
    return name, f"OK {len(raw)//1024}KB"


with concurrent.futures.ThreadPoolExecutor(3) as ex:
    for name, msg in ex.map(gen, VARIANTS):
        print(name, msg, flush=True)
