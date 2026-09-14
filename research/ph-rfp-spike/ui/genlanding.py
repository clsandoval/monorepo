"""Marketing landing page mockups — cheerful.ai's hero structure, our palette and copy.

Structure lifted from cheerful.ai (screenshotted 2026-08-08): faint dotted grid, letterspaced
small-caps eyebrow, huge two-line headline with the second line in the accent colour, two-line
grey subhead, big rounded prompt card with a status dot and circular submit, three pill chips,
"prefer a walkthrough" link, then a strip beneath.

Two deliberate departures:
  - accent is our locked teal #0E7490, not cheerful's pink/purple gradient
  - the logo strip becomes a STAT strip. A row of government agency logos on a private product
    scraping a government portal implies official endorsement -- the same trap that made three of
    the first four app mockups invent a neoclassical seal. See DECISIONS.md.
"""
import base64, concurrent.futures, json, pathlib, urllib.request

KEY = None
for line in open('/home/clsandoval/cs/monorepo/.env'):
    if line.startswith('OPENAI_API_KEY='):
        KEY = line.split('=', 1)[1].strip().strip('"').strip("'")
assert KEY, "no OPENAI_API_KEY"

OUT = pathlib.Path(__file__).parent
BRAND = "bidkita"  # placeholder wordmark, not a chosen name

BASE = (
    "A high-fidelity desktop marketing landing page screenshot of a real SaaS website, rendered "
    "crisply as an actual rendered web page, not an illustration or a wireframe. Realistic legible "
    "UI text, correct spelling. Full-bleed browser-width composition, no browser chrome, no phone "
    "mockup frame, no stock-photo people, no 3D blobs, no purple gradient mesh, no generic "
    "AI-startup aesthetic. "
    "PALETTE: near-white background #F5F6F7 with a very faint dotted grid texture, white cards, "
    "near-black text #111315, one single accent colour teal #0E7490 and NO other hue anywhere. "
    "TYPE: clean geometric grotesque for headings, all peso figures and reference codes set in a "
    "monospaced typeface with tabular figures. "
    "CRITICAL: no government seal, no coat of arms, no laurel wreath, no neoclassical building, no "
    "stars-and-sun insignia, no flag. This is a private product, and any official-looking emblem "
    f"would falsely imply government endorsement. Plain lowercase wordmark '{BRAND}' only. "
)

HERO = (
    f"TOP NAV: thin, lowercase teal wordmark '{BRAND}' at far left, centered text links reading "
    "'Product', 'Coverage', 'Pricing', 'For contractors', 'Blog', then 'Log in' and a solid teal "
    "pill button reading 'Start free' at far right. "
    "HERO, centered, generous whitespace: a small letterspaced all-caps teal eyebrow line reading "
    "'EVERY GOVERNMENT BID IN THE PHILIPPINES, IN ONE PLACE'. Beneath it a very large two-line "
    "headline, first line near-black reading 'Stop missing bids', second line reading "
    "'you would have won' where the words 'would have won' are teal with a hand-drawn teal "
    "underline stroke beneath them. Beneath that a two-line grey subheading reading "
    "'22,145 open opportunities across both PhilGEPS systems. Tell it what you build and it "
    "returns the ones you can actually win.' "
)

CARD = (
    "Below the subheading a wide white rounded prompt card with a soft 1px border, containing grey "
    "placeholder text 'Ask for road concreting work in Agusan under 5 million' with a text cursor, "
    "a small teal dot and tiny grey label reading 'Reading 22,145 open notices - updated 08:15 AM' "
    "in the bottom left, and a circular teal submit button with a white up-arrow in the bottom "
    "right. Under the card a row of three small white pill-shaped suggestion chips with thin "
    "borders reading 'Civil works in Region XIII', 'Under 1M, closing next week', and "
    "'PCAB Class C jobs near me'. Under those a small centred grey line reading "
    "'Prefer a walkthrough? See today's matches for a sample firm' with the last part underlined. "
)

DIRECTIONS = [
    ("landing-01-stat-strip", BASE + HERO + CARD +
     "BOTTOM STRIP: instead of a customer logo row, a horizontal band of four statistics separated "
     "by thin vertical rules, each a large monospaced tabular numeral above a small grey caps label: "
     "'4,300' over 'MPHILGEPS NOTICES', '17,845' over 'LEGACY PHILGEPS NOTICES', '08:15 AM' over "
     "'LAST UPDATED', 'FREE' over 'NO LOGIN REQUIRED'. "
     "STYLE: airy and restrained, lots of vertical breathing room, thin hairline borders, no drop "
     "shadows, the kind of page a serious data product ships."),

    # 01 without the stat band -- hero only, chosen direction
    ("landing-04-hero-only", BASE + HERO + CARD +
     "NOTHING BELOW the walkthrough line: no statistics band, no customer logo row, no second "
     "section, no footer, no horizontal divider. The hero simply ends and the near-white background "
     "with its faint dotted grid continues to the bottom edge of the frame as open space. "
     "Recompose the hero to sit comfortably in the full frame with that empty lower third, "
     "vertically centred as a whole rather than pushed to the top. "
     "STYLE: airy and restrained, lots of vertical breathing room, thin hairline borders, no drop "
     "shadows, the kind of page a serious data product ships."),

    ("landing-02-money-first", BASE + HERO + CARD +
     "BOTTOM SECTION: instead of a logo row, three real result cards previewed side by side, each "
     "showing a very large heavy monospaced peso figure as the dominant element - 'P4,850,000', "
     "'P860,000', 'P12,400,000' - with, beneath each, a small teal countdown chip reading "
     "'closes in 11 days', 'closes in 4 days', 'closes in 21 days', a two-line project title in "
     "medium weight, and a small grey all-caps procuring agency line such as "
     "'MUNICIPALITY OF MAGALLANES, AGUSAN DEL NORTE'. "
     "STYLE: money is the loudest thing on the page and the eye hits the peso figures first, "
     "because a contractor scans how big and when does it close, in that order. Tight, confident, "
     "editorial."),

    # hybrid: 03's asymmetric split, but the left column ends in 01's prompt card instead of
    # a button pair. Also fixes two fidelity misses from the first round -- real peso glyph, and
    # PhilGEPS reference numbers are bare numeric ids, not invented dated codes.
    ("landing-05-hybrid", BASE +
     f"TOP NAV: thin, lowercase teal wordmark '{BRAND}' at far left, centered text links reading "
     "'Product', 'Coverage', 'Pricing', 'For contractors', 'Blog', then 'Log in' and a solid teal "
     "pill button reading 'Start free' at far right. "
     "ASYMMETRIC HERO, split roughly 45/55. "
     "LEFT COLUMN, all left-aligned, vertically centred: a small letterspaced all-caps teal eyebrow "
     "reading 'EVERY GOVERNMENT BID IN THE PHILIPPINES, IN ONE PLACE'. Below it a large two-line "
     "headline, first line near-black 'Stop missing bids', second line 'you would have won' with "
     "'would have won' in teal and a hand-drawn teal underline stroke beneath it. Below that a "
     "two-line grey subheading reading '22,145 open opportunities across both PhilGEPS systems. "
     "Tell it what you build and it returns the ones you can actually win.' "
     "Below the subheading, INSTEAD OF ANY BUTTONS, a white rounded prompt card with a soft 1px "
     "border spanning the left column's width, containing grey placeholder text 'Ask for road "
     "concreting work in Agusan under 5 million' with a text cursor, a small teal dot with tiny grey "
     "label 'Reading 22,145 open notices - updated 08:15 AM' in its bottom left, and a circular teal "
     "submit button with a white up-arrow in its bottom right. Under the card two small white "
     "pill-shaped suggestion chips with thin borders reading 'Civil works in Region XIII' and "
     "'Under 1M, closing next week'. No 'Start free' or 'See coverage' buttons anywhere in the hero "
     "body -- the prompt card is the only call to action. "
     "RIGHT COLUMN: a realistic product screenshot tilted at a slight angle, bleeding off the right "
     "edge of the frame: a dense data table headed 'Open opportunities' with a small '22,145 results' "
     "label and a Filters control, columns Ref, Project, Agency, ABC, Closes, about ten tight rows. "
     "Ref values are bare five-digit numbers like 55594, 55381, 54278. ABC values are right-aligned "
     "monospaced tabular figures using the actual peso sign, like PHP24,800,000.00 rendered with the "
     "peso glyph. Closes column holds small teal countdown chips like '03d 12h'. One row is "
     "highlighted in pale teal. Agencies read like 'DPWH - Rizal 2nd DEO', 'LGU - San Juan, "
     "Batangas', 'DepEd - Division of Cebu Province'. "
     "BOTTOM: a thin full-width teal band with small white monospaced text reading 'Both PhilGEPS "
     "systems - national agencies and 1,600 LGUs - updated every morning'. "
     "STYLE: asymmetric, product-forward, proof over promise, thin hairline borders, no drop shadows "
     "beyond one soft shadow under the tilted screenshot."),

    ("landing-03-split-proof", BASE + HERO +
     "Instead of a prompt card, the right half of the hero holds a realistic product screenshot at "
     "a slight angle: a dense data table with columns Ref, Project, Agency, ABC, Closes, about ten "
     "tight rows, peso figures right-aligned in monospaced tabular numerals, one teal-highlighted "
     "row, and small teal countdown chips in the last column. The headline and subheading sit in "
     "the left half, left-aligned rather than centered, with a solid teal pill button reading "
     "'Start free' and a ghost button reading 'See coverage' beneath them. "
     "BOTTOM: a thin full-width teal-tinted band with small white text reading "
     "'Both PhilGEPS systems - national agencies and 1,600 LGUs - updated every morning'. "
     "STYLE: asymmetric, product-forward, proof over promise."),
]


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
    return name, f"OK {len(raw)//1024}KB -> {p}"


if __name__ == "__main__":
    import sys
    want = sys.argv[1:]  # e.g. `python3 genlanding.py 04` to re-roll one direction
    todo = [d for d in DIRECTIONS if not want or any(w in d[0] for w in want)]
    with concurrent.futures.ThreadPoolExecutor(3) as ex:
        for name, msg in ex.map(gen, todo):
            print(name, msg, flush=True)
