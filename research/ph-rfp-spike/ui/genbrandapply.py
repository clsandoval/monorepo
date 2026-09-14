"""Apply the six shortlisted brand directions (11, 12, 13, 15, 17, 21) to two mockups each:
the marketing landing page (structure from genlanding.py) and the app itself (the locked
'unified surface' direction from DECISIONS.md: table dominant, chat docked right).

12 images: apply-<nn>-landing.png / apply-<nn>-app.png.
"""
import base64, concurrent.futures, json, pathlib, urllib.request

KEY = None
for line in open('/home/clsandoval/cs/monorepo/.env'):
    if line.startswith('OPENAI_API_KEY='):
        KEY = line.split('=', 1)[1].strip().strip('"').strip("'")
assert KEY, "no OPENAI_API_KEY"

OUT = pathlib.Path(__file__).parent
BRAND = "bidkita"

NO = (
    "STRICTLY NO: government seal, coat of arms, laurel wreath, flag, map of the Philippines, "
    "stock-photo people, 3D renders, gradient mesh, browser chrome, phone-mockup frame. "
    "Every piece of text legible and correctly spelled. "
)

# Each brand: (slug, palette + voice + signature gesture, applied consistently to both mockups)
BRANDS = [
    ("11-signal-red",
     "PALETTE: warm white ground #FCFBF8, near-black ink #16130F, one signal red #D93025, warm "
     "grey #8E8A82 for secondary text -- nothing else. Red is rationed: the wordmark, one thin "
     "rule, and at most one small accent per screen. "
     "TYPE: masterful tight neo-grotesque headlines, precise small monospace for all figures. "
     "VOICE: Vignelli restraint -- white space and hierarchy do all the work, total confidence."),

    ("12-delft-ultramarine",
     "PALETTE: cool paper #F6F5F1, one deep ultramarine #1D35C4 doing all the work, ink #14141A, "
     "pale blue tint #E9EBF7 for selected/hover states. "
     "TYPE: sharp grotesque with personality, crisp monospace figures. "
     "VOICE: Dutch design precision, slightly electric. SIGNATURE: one large solid ultramarine "
     "field with type reversed out white -- the hero band on the landing page, the left rail and "
     "primary buttons in the app."),

    ("13-hanko-vermilion",
     "PALETTE: soft warm grey paper #EDEBE6, sumi ink #201E1A, vermilion #C73E2D used ONLY as one "
     "small stamped square mark and tiny accents, mid stone grey #A6A199 for secondary text. "
     "TYPE: quiet grotesque, wide tracking on small caps labels, tabular monospace figures set "
     "with unusual care. "
     "VOICE: Japanese public-information hush -- rail-timetable clarity. SIGNATURE: a small plain "
     "solid vermilion square sits beside the wordmark like a chop mark, slightly rotated; deadline "
     "chips are tiny vermilion-inked stamps."),

    ("15-overprint-duotone",
     "PALETTE: warm newsprint #F8F4EB, ink blue #2B3F8C, warm red-orange #D4522E, and their "
     "overprint plum-brown #5B2B3C where the two overlap. Ink sits IN the paper -- subtle grain, "
     "slight misregistration on decorative elements only, never on UI text. "
     "TYPE: sturdy editorial grotesque, typewriter-flavoured monospace figures. "
     "VOICE: pulled off a press, human and collectible. SIGNATURE: two offset overlapping "
     "rectangles of the two inks behind the hero headline; in the app the two inks split roles -- "
     "blue for structure and links, red-orange for deadlines and the primary action."),

    ("17-riso-pink-peacock",
     "PALETTE: warm off-white stock #F9F5EC, riso fluorescent pink #F05A7E, peacock teal #157A6E, "
     "overlap ink-violet #4A2D52, ink black #1E1B16 for text. Soft-edged ink-field textures on "
     "decorative shapes only, UI text stays crisp. "
     "TYPE: sturdy editorial grotesque, typewriter monospace figures. "
     "VOICE: energetic but sophisticated -- playful inks, dead-serious setting. SIGNATURE: two "
     "large soft-edged ink fields (pink, teal) crossing at angles behind the hero; in the app "
     "teal owns structure and links, pink is rationed to the primary action and new-item dots."),

    ("21-municipal-twopass",
     "PALETTE: aged cream stock #F5EFDF, spot green #2E5D3F, spot vermilion #C94F32, overlap deep "
     "pine #1F3A2A, ink brown-black #26211A. Flat geometric spot-colour panels and thick bars, "
     "faint paper grain. "
     "TYPE: warm mid-century grotesque set tight, typewriter monospace figures on thin ruled "
     "form lines. "
     "VOICE: 1960s municipal print office with graphic bite -- Olivetti-era civic design, zero "
     "kitsch. SIGNATURE: a vermilion circle overlapping a green rectangle as the one decorative "
     "gesture; tables ruled like official forms."),
]

LANDING = (
    "A high-fidelity desktop marketing landing page for a real SaaS product, rendered crisply as "
    "an actual web page, full-bleed browser-width composition. " + NO +
    f"STRUCTURE: thin top nav with lowercase wordmark '{BRAND}' at far left in the accent colour, "
    "text links 'Product', 'Coverage', 'Pricing', 'Blog', then 'Log in' and one solid accent pill "
    "button 'Start free' at far right. "
    "HERO: small letterspaced all-caps eyebrow reading 'EVERY GOVERNMENT BID IN THE PHILIPPINES, "
    "IN ONE PLACE'. A very large two-line headline: first line 'Stop missing bids', second line "
    "'you would have won' with the last three words treated in the brand's accent. A two-line "
    "grey subheading: '22,145 open opportunities across both PhilGEPS systems. Tell it what you "
    "build and it returns the ones you can actually win.' Below, a wide rounded prompt card with "
    "placeholder text 'Ask for road concreting work in Agusan under 5 million', a small status "
    "dot with label 'Reading 22,145 open notices - updated 08:15 AM', and a circular accent "
    "submit button with an up-arrow. Under it three small pill suggestion chips: 'Civil works in "
    "Region XIII', 'Under 1M, closing next week', 'PCAB Class C jobs near me'. "
    "The brand's SIGNATURE decorative gesture appears once, behind or beside the hero, and "
    "nowhere else. The page ends in open ground -- no logo strip, no second section. "
)

APPUI = (
    "A high-fidelity desktop web-app interface screenshot of a real data product, rendered "
    "crisply, full-bleed, no browser chrome. " + NO +
    "STRUCTURE: one large rounded content surface floating on the page ground, in the style of a "
    "polished macOS app. A narrow icon-only left rail. Inside the surface, TWO panes separated by "
    "one hairline: LEFT AND DOMINANT (about 70%), a dense data table headed 'Open opportunities' "
    "with a search field, a count label '22,145 results', filter chips 'Cavite', 'Under P5M', "
    "'Closing this week', and columns Ref, Project, Agency, ABC, Closes -- about twelve tight "
    "rows. Ref values are bare five-digit numbers like 55594, 55381, 54278. Project names read "
    "like 'Concreting of Barangay Road, Phase II' and 'Supply and Delivery of Office Equipment'. "
    "Agencies read like 'DPWH - Rizal 2nd DEO', 'LGU - Silang, Cavite', 'DepEd - Division of "
    "Cebu'. ABC values right-aligned monospace like PHP 4,850,000.00. Closes column holds small "
    "countdown chips like '03d 12h', '11d 02h' in the brand's deadline treatment; one row "
    "selected/highlighted in the brand's tint. "
    "RIGHT PANE (about 30%): a chat panel titled 'Ask', one short user message 'drainage works "
    "in Cavite under 3M', one assistant reply listing two matches with refs and peso amounts, "
    "and a rounded input at the bottom with a small accent send button. "
    "All numerals, refs and peso amounts in tabular monospace. The brand's decorative gestures "
    "stay OUT of the working surface -- the table area is disciplined; the brand shows in the "
    "palette, type, chips, buttons, and the ground around the surface. "
)


def gen(item):
    name, prompt = item
    body = json.dumps({"model": "gpt-image-2", "prompt": prompt, "size": "1536x1024"}).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations", data=body,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=900) as r:
            data = json.load(r)
    except urllib.error.HTTPError as e:
        return name, f"HTTP {e.code}: {e.read().decode()[:400]}"
    d = data["data"][0]
    raw = (base64.b64decode(d["b64_json"]) if d.get("b64_json")
           else urllib.request.urlopen(d["url"], timeout=300).read())
    p = OUT / f"{name}.png"
    p.write_bytes(raw)
    u = data.get("usage") or {}
    with open(OUT / "image-spend.jsonl", "a") as fh:
        fh.write(json.dumps({"name": name, "model": "gpt-image-2", "size": "1536x1024",
                             "usage": u}) + "\n")
    return name, f"OK {len(raw)//1024}KB {u or 'no usage reported'} -> {p}"


JOBS = []
for slug, style in BRANDS:
    JOBS.append((f"apply-{slug}-landing", LANDING + "BRAND DIRECTION: " + style))
    JOBS.append((f"apply-{slug}-app", APPUI + "BRAND DIRECTION: " + style))

if __name__ == "__main__":
    import sys
    want = sys.argv[1:]  # e.g. `python3 genbrandapply.py 13-hanko` or `13-hanko-app`
    todo = [j for j in JOBS if not want or any(w in j[0] for w in want)]
    with concurrent.futures.ThreadPoolExecutor(3) as ex:
        for name, msg in ex.map(gen, todo):
            print(name, msg, flush=True)
