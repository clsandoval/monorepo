"""Palette 17 (riso pink + peacock) applied to every screen a user can reach.

Six screens plus the two composed states that decide whether the product feels alive or empty:

    17-01-landing          the wedge -- free, no login, SEO
    17-02-board            the product: table dominant, chat docked right
    17-03-notice           "can I actually win this" -- drawer over the board
    17-04-profile          first run; one input, not a wizard
    17-05-brief            the Friday brief on screen -- the cold-email landing target
    17-06-preferences      the DPA opt-out promised in the brief footer; works with no login
    17-07-state-widened    60% of archetypes have ONE open notice; this is the churn state
    17-08-state-nodocs     legacy is auth-gated, so requirements are often unavailable

Strings that appear on screen are real: refs, agencies, ABCs and closing times are lifted from
the 2026-08-09 snapshot so the model spells them correctly instead of inventing them.

    python3 gen17.py              # all eight
    python3 gen17.py 02 07        # just those
"""
import base64
import concurrent.futures
import json
import pathlib
import urllib.error
import urllib.request

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

# verbatim from genbrandapply.py so this set is continuous with brand-17 / apply-17
B17 = (
    "BRAND DIRECTION: PALETTE: warm off-white stock #F9F5EC, riso fluorescent pink #F05A7E, "
    "peacock teal #157A6E, overlap ink-violet #4A2D52, ink black #1E1B16 for text. Soft-edged "
    "ink-field textures on decorative shapes only, UI text stays crisp. "
    "TYPE: sturdy editorial grotesque, typewriter monospace figures. "
    "VOICE: energetic but sophisticated -- playful inks, dead-serious setting. SIGNATURE: two "
    "large soft-edged ink fields (pink, teal) crossing at angles behind the hero; in the app "
    "teal owns structure and links, pink is rationed to the primary action and new-item dots. "
)

WEB = ("A high-fidelity desktop web page for a real SaaS product, rendered crisply as an actual "
       "web page, full-bleed browser-width composition. " + NO)
APP = ("A high-fidelity desktop web-app interface screenshot of a real data product, rendered "
       "crisply, full-bleed, no browser chrome. " + NO)

# the working surface, described once -- 02, 03, 07 and 08 are all the same app
SURFACE = (
    "STRUCTURE: one large rounded content surface floating on the page ground, in the style of a "
    "polished macOS app. A narrow icon-only left rail in teal. Inside the surface, TWO panes "
    "separated by one hairline: LEFT AND DOMINANT (about 70 percent) a dense data table, RIGHT "
    "(about 30 percent) a chat panel titled 'Ask' with a rounded input at the bottom and a small "
    "pink circular send button. All numerals, refs and peso amounts in tabular monospace. The "
    "brand's decorative ink fields stay OUT of the working surface -- the table area is "
    "disciplined; the brand shows in the palette, type, chips and buttons. "
)

# real rows, 2026-08-09 snapshot
ROWS = (
    "Table rows read exactly: "
    "'ITB-2026-071  Construction of Multi-Purpose Building, Brgy. Taba-taba, Basud  Provincial "
    "Government of Camarines Norte  PHP 4,983,586.00  09d 04h'; "
    "'VINBAC 0067-2026  Construction of Farm-to-Market Road (Barangay Aguit-it)  Municipality of "
    "Vinzons, Camarines Norte  PHP 10,000,000.00  09d 04h'; "
    "'ITB-2026-072  Construction of Slope Protection, Brgy. Pamorangon, Daet  Provincial "
    "Government of Camarines Norte  PHP 9,987,701.00  09d 04h'; "
    "'401-26-07-0877-A  Rehabilitation of Health Station, Brgy. Hamoraon, Mercedes  Municipality "
    "of Mercedes, Camarines Norte  PHP 2,800,000.00  08d 21h'; "
    "'ITB-2026-066  Construction of Barangay Hall, Brgy. Laniton, San Lorenzo Ruiz  Provincial "
    "Government of Camarines Norte  PHP 4,997,803.00  16d 04h'. "
)

SCREENS = [
    ("17-01-landing", WEB +
     f"Thin top nav, lowercase wordmark '{BRAND}' at far left in pink, text links 'Product', "
     "'Coverage', 'Pricing', 'Blog', then 'Log in' and one solid pink pill button 'Start free'. "
     "HERO: small letterspaced all-caps eyebrow 'EVERY GOVERNMENT BID IN THE PHILIPPINES, IN ONE "
     "PLACE'. A very large two-line headline, first line 'Stop missing bids', second line 'you "
     "would have won'. Two-line grey subheading: '22,324 open opportunities across both PhilGEPS "
     "systems. Tell it what you build and it returns the ones you can actually win.' Below, a "
     "wide rounded prompt card with placeholder 'Ask for road concreting work in Camarines Norte "
     "under 10 million', a small teal status dot labelled 'Reading 22,324 open notices - updated "
     "08:15 AM', and a circular pink submit button with an up-arrow. Under it three small pill "
     "chips: 'Civil works in Region V', 'Under 1M, closing next week', 'PCAB Class C jobs near "
     "me'. The two crossing ink fields appear once, behind the hero, and nowhere else. The page "
     "ends in open ground -- no logo strip, no second section."),

    ("17-02-board", APP + SURFACE + ROWS +
     "The table is headed 'Open opportunities' with a search field, a count label '22,324 "
     "results', and filter chips 'Camarines Norte', 'Civil works', 'Under P10M'. Columns: Ref, "
     "Project, Agency, ABC, Closes. About twelve tight rows. The Closes column holds small "
     "countdown chips; the two nearest deadlines are pink, the rest teal-outlined. One row is "
     "selected in a pale pink tint. RIGHT PANE: one short user message 'buildings in Camarines "
     "Norte around 5 million', one assistant reply listing two matches with their refs and peso "
     "amounts."),

    ("17-03-notice", APP + SURFACE +
     "A wide detail drawer slides over the right two-thirds of the table, the table dimmed "
     "behind it. Drawer title 'Construction of Multi-Purpose Building, Brgy. Taba-taba, Basud'. "
     "Under it a monospace meta row 'ITB-2026-071 - PHP 4,983,586.00 - closes Tue 18 Aug 14:00 - "
     "09d 04h left' and a small teal outlined link 'Verify on PhilGEPS'. Then three labelled "
     "blocks stacked: 'ELIGIBILITY' listing 'PCAB licence required', 'Similar contract within 10 "
     "years', 'At least 75% Filipino ownership'; 'BID DOCUMENTS' listing four file rows with "
     "names like 'Invitation to Bid.pdf', 'Bill of Quantities.xlsx', 'Technical "
     "Specifications.pdf', each with a size and a small download icon; 'WHO WON WORK LIKE THIS' "
     "showing two past awards with company names, peso amounts and bid ratios such as '97.0% of "
     "ABC'. One solid pink button at the bottom right reading 'Add to my week'."),

    ("17-04-profile", WEB +
     f"A calm centred first-run page on the open ground, lowercase '{BRAND}' wordmark small at "
     "the top in pink. One large headline 'What do you build?'. Below it a single wide rounded "
     "input, already filled with the sentence 'Buildings and covered courts in Camarines Norte, "
     "around 5 to 10 million pesos'. Under the input a helper line in grey: 'One sentence is "
     "enough. You can change it any time.' Below that, three small teal-outlined chips that the "
     "sentence has been parsed into, each with a tiny x: 'Civil works - buildings', 'Camarines "
     "Norte', 'PHP 2M - 10M'. At the bottom right a solid pink pill button 'See my week'. Lots "
     "of open space; the crossing ink fields appear once, small, in the lower left corner."),

    ("17-05-brief", WEB +
     "An on-screen version of a printed two-page brief, shown as a long scrolling document page "
     "on the open ground with a subtle paper shadow. At the top a small pink wordmark 'bidkita' "
     "and a letterspaced all-caps line 'WEEKLY BID BRIEF - CAMARINES NORTE - 9 AUGUST 2026'. A "
     "hero band where the pink and teal ink fields cross at angles on the right, with a very "
     "large three-line headline set on the paper at the left reading 'PHP 58,749,058 closes in "
     "Camarines Norte in the next 16 days.' and a small monospace strap under it '10 NOTICES - 8 "
     "CLOSE MON-TUE - 3 BIGGER THAN YOUR LAST WIN'. Below, a section labelled '01 - YOUR RECORD' "
     "with a one-row table, and a section labelled '02 - OPEN RIGHT NOW, MATCHED TO YOU' with "
     "five rows, each row carrying a small tag reading either 'MATCH' filled pink or 'WIDENED' "
     "outlined teal. " + ROWS +
     "At the very top right of the document a small teal outlined button 'Download PDF'."),

    ("17-06-preferences", WEB +
     f"A short, plain, honest preferences page on the open ground; small pink '{BRAND}' wordmark "
     "top left, no navigation at all. Headline 'Your brief settings'. A line of grey text: "
     "'Sent to arnol@example.com. No account, no password -- this link is your settings.' Then "
     "three simple rows with toggle switches, the first two on in teal: 'Friday brief - every "
     "Friday, 7:00 AM Manila', 'Deadline warning - the evening before anything closes', 'Weekly "
     "digest of new agencies'. Below a thin divider, a small block headed 'STOP EVERYTHING' with "
     "one line 'We will not contact you again. First request, no questions.' and one outlined "
     "pink button 'Unsubscribe'. Very generous white space; no decorative ink fields anywhere on "
     "this page."),

    ("17-07-state-widened", APP + SURFACE +
     "This is the deliberately-widened state. The table is headed 'Open opportunities' and "
     "shows a prominent full-width notice strip directly under the header, tinted pale teal, "
     "reading: 'Only 1 notice matches buildings in Camarines Norte this week. We widened to 4 "
     "more.' Below it exactly five rows. The first row carries a filled pink tag 'MATCH'; the "
     "next four carry teal outlined tags 'WIDENED' and each has a small grey reason line beneath "
     "the project name reading things like 'adjacent work type - slope protection', 'adjacent "
     "work type - farm-to-market road', 'Camarines Sur, 48km away'. Under the last row a small "
     "centred teal text link 'Widen further - 12 more within 100km'. The right chat pane shows "
     "one assistant message explaining the widening in one sentence. The table must look "
     "deliberately curated and generous, never broken or empty."),

    ("17-08-state-nodocs", APP + SURFACE +
     "The same detail drawer as the notice screen, for 'Construction of Farm-to-Market Road "
     "(Barangay Aguit-it)', monospace meta row 'VINBAC 0067-2026 - PHP 10,000,000.00 - closes "
     "Tue 18 Aug 14:00 - 09d 04h left'. The 'ELIGIBILITY' block shows only one line, 'PCAB "
     "licence required', followed by a grey italic line 'Everything else is stated inside the "
     "bid documents.' The 'BID DOCUMENTS' block is replaced by an honest empty state: a small "
     "teal outlined panel with a short heading 'Documents are behind the PhilGEPS supplier "
     "login' and two lines of grey text 'This notice is published on the legacy board, which "
     "requires a supplier account to download attachments. We show you the notice, the deadline "
     "and the reference so you can pull them yourself.' with one solid teal button 'Open on "
     "PhilGEPS' beside it. Nothing on this screen pretends to have data it does not have."),
]


def gen(item):
    name, prompt = item
    body = json.dumps({"model": "gpt-image-2", "prompt": prompt + B17,
                       "size": "1536x1024"}).encode()
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
    # the key here lacks api.usage.read, so the dashboard cannot be queried after the fact --
    # log what the response reports and append it, or the spend stays unmeasurable
    u = data.get("usage") or {}
    with open(OUT / "image-spend.jsonl", "a") as fh:
        fh.write(json.dumps({"name": name, "model": "gpt-image-2", "size": "1536x1024",
                             "usage": u}) + "\n")
    return name, f"OK {len(raw) // 1024}KB {u or 'no usage reported'} -> {p}"


if __name__ == "__main__":
    import sys
    want = sys.argv[1:]
    todo = [s for s in SCREENS if not want or any(w in s[0] for w in want)]
    with concurrent.futures.ThreadPoolExecutor(3) as ex:
        for name, msg in ex.map(gen, todo):
            print(name, msg, flush=True)
