"""Palette 11 (signal) with the red swapped for a signal blue #1550D8, across all eight screens.

Style 11 is Vignelli restraint: warm white, near-black, ONE accent used two or three times on a
whole screen. That is the opposite of 17, where two inks colour half the page -- so these prompts
are not the 17 prompts with the colours substituted. Every place 17 said "pink button, teal chip"
this says grey chip, black rule, and spends the single accent somewhere it earns.

    11b-01-landing          the wedge -- free, no login, SEO
    11b-02-board            the product: table dominant, chat docked right
    11b-03-notice           "can I actually win this" -- drawer over the board
    11b-04-profile          first run; one input, not a wizard
    11b-05-brief            the Friday brief on screen -- the cold-email landing target
    11b-06-preferences      the DPA opt-out promised in the brief footer; works with no login
    11b-07-state-widened    60% of archetypes have ONE open notice; this is the churn state
    11b-08-state-nodocs     legacy is auth-gated, so requirements are often unavailable

Refs, agencies, ABCs and closing times are lifted from the 2026-08-09 snapshot.

    python3 gen11b.py             # all eight
    python3 gen11b.py 02 07       # just those
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
    "stock-photo people, 3D renders, gradient mesh, browser chrome, phone-mockup frame, and NO "
    "red or orange anywhere on the page. Every piece of text legible and correctly spelled. "
)

# style 11's structure, with the signal red replaced by a signal blue of the same weight
B11 = (
    "BRAND DIRECTION: PALETTE: warm white ground #FCFBF8, near-black ink #16130F, one signal "
    "blue #1550D8, warm grey #8E8A82 for secondary text and hairlines -- nothing else, and "
    "absolutely no second accent colour. The blue is severely rationed: the wordmark, one thin "
    "rule, and at most one small accent element per screen. Everything else is black, warm grey "
    "or white. "
    "TYPE: masterful tight neo-grotesque headlines, precise small monospace for all figures, "
    "generous letterspacing on small all-caps labels. "
    "VOICE: Vignelli restraint -- white space, rules and hierarchy do all the work. Total "
    "confidence, zero decoration. No soft shapes, no textures, no gradients: flat colour, "
    "hairline rules, hard edges only. "
)

WEB = ("A high-fidelity desktop web page for a real SaaS product, rendered crisply as an actual "
       "web page, full-bleed browser-width composition. " + NO)
APP = ("A high-fidelity desktop web-app interface screenshot of a real data product, rendered "
       "crisply, full-bleed, no browser chrome. " + NO)

# the working surface, described once -- 02, 03, 07 and 08 are all the same app
SURFACE = (
    "STRUCTURE: one large white content surface with hard square corners sitting on the warm "
    "white ground, separated from it by a single hairline rule -- no drop shadow, no rounded "
    "corners. A narrow icon-only left rail in white, divided from the content by one hairline, "
    "its icons drawn as thin black line icons. Inside the surface TWO panes separated by one "
    "hairline: LEFT AND DOMINANT (about 70 percent) a dense data table ruled with hairlines like "
    "a printed timetable, RIGHT (about 30 percent) a chat panel titled 'Ask' with a square input "
    "at the bottom. All numerals, refs and peso amounts in tabular monospace. "
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
    ("11b-01-landing", WEB +
     f"A thin top nav divided from the page by one hairline rule: lowercase wordmark '{BRAND}' at "
     "far left in signal blue, black text links 'Product', 'Coverage', 'Pricing', 'Blog', then "
     "'Log in' and one small square-cornered solid blue button 'Start free'. "
     "HERO, left-aligned on a strict grid with enormous white space around it: a small "
     "letterspaced all-caps grey eyebrow 'EVERY GOVERNMENT BID IN THE PHILIPPINES, IN ONE "
     "PLACE'. A very large tight two-line black headline, first line 'Stop missing bids', second "
     "line 'you would have won'. A two-line grey subheading: '22,324 open opportunities across "
     "both PhilGEPS systems. Tell it what you build and it returns the ones you can actually "
     "win.' Below, one wide square-cornered input outlined in a black hairline with placeholder "
     "'Ask for road concreting work in Camarines Norte under 10 million', a small monospace grey "
     "line 'Reading 22,324 open notices - updated 08:15 AM', and one small solid blue square "
     "submit button with an up-arrow. Under it three small square-cornered chips outlined in "
     "grey hairlines with black monospace text: 'Civil works in Region V', 'Under 1M, closing "
     "next week', 'PCAB Class C jobs near me'. One single thin blue rule runs the full width of "
     "the page under the hero and is the only other blue on the page. The page ends in open "
     "white ground -- no logo strip, no second section, no illustration of any kind."),

    ("11b-02-board", APP + SURFACE + ROWS +
     "The table is headed 'Open opportunities' in tight black type with a search field, a grey "
     "monospace count label '22,324 results', and filter chips 'Camarines Norte', 'Civil works', "
     "'Under P10M' drawn as grey-outlined squares each with a small x. Columns: Ref, Project, "
     "Agency, ABC, Closes, their headers small letterspaced grey all-caps over one black "
     "hairline. About twelve tight rows separated by grey hairlines. Refs are set in blue as the "
     "only links. The Closes column holds right-aligned monospace countdowns like '09d 04h' in "
     "black; the single nearest deadline is the one blue accent in the table. One row is "
     "selected, marked only by a thin blue bar down its left edge and a very pale grey fill. "
     "RIGHT PANE: one short user message 'buildings in Camarines Norte around 5 million' in a "
     "pale grey square bubble, one assistant reply listing two matches with their refs and peso "
     "amounts, and a square input at the bottom with a small blue send arrow."),

    ("11b-03-notice", APP + SURFACE +
     "A wide detail panel occupies the right two-thirds of the surface, divided from the table "
     "by one black hairline, the table still visible and undimmed at the left. Panel title in "
     "large tight black type 'Construction of Multi-Purpose Building, Brgy. Taba-taba, Basud'. "
     "Under it a grey monospace meta row 'ITB-2026-071 - PHP 4,983,586.00 - closes Tue 18 Aug "
     "14:00 - 09d 04h left' and one small blue text link 'Verify on PhilGEPS'. Then three blocks "
     "stacked, each opened by a small letterspaced grey all-caps label over a hairline: "
     "'ELIGIBILITY' listing 'PCAB licence required', 'Similar contract within 10 years', 'At "
     "least 75% Filipino ownership'; 'BID DOCUMENTS' listing four file rows with names like "
     "'Invitation to Bid.pdf', 'Bill of Quantities.xlsx', 'Technical Specifications.pdf', each "
     "with a monospace file size and a thin black download icon; 'WHO WON WORK LIKE THIS' with "
     "two past awards showing company names, peso amounts and bid ratios such as '97.0% of "
     "ABC'. One small square solid blue button at the bottom right reading 'Add to my week' -- "
     "the only filled element on the screen."),

    ("11b-04-profile", WEB +
     f"A first-run page, strictly left-aligned on a wide grid with vast white space, small "
     f"lowercase '{BRAND}' wordmark in blue at the top left and nothing else in the header. One "
     "very large tight black headline 'What do you build?'. Below it a single wide input marked "
     "only by one black hairline underneath it, already filled in black with the sentence "
     "'Buildings and covered courts in Camarines Norte, around 5 to 10 million pesos'. Under it "
     "a small grey helper line: 'One sentence is enough. You can change it any time.' Below "
     "that, three small square chips outlined in grey hairlines with black monospace text, each "
     "with a tiny x: 'Civil works - buildings', 'Camarines Norte', 'PHP 2M - 10M'. At the bottom "
     "left, aligned to the same grid line as everything else, one small solid blue square button "
     "'See my week'. No illustration, no card, no shadow, no rounded corners anywhere."),

    ("11b-05-brief", WEB +
     "An on-screen version of a printed two-page brief, shown as a tall white document page on "
     "the warm white ground, its edge marked by one hairline rule rather than a shadow. At the "
     "top a small blue lowercase wordmark 'bidkita' and a small letterspaced grey all-caps line "
     "'WEEKLY BID BRIEF - CAMARINES NORTE - 9 AUGUST 2026', divided from the body by one thick "
     "black rule. A very large tight three-line black headline set flush left reading 'PHP "
     "58,749,058 closes in Camarines Norte in the next 16 days.' and a small grey monospace "
     "strap under it '10 NOTICES - 8 CLOSE MON-TUE - 3 BIGGER THAN YOUR LAST WIN'. Below, a "
     "section opened by the small blue label '01 - YOUR RECORD' showing a table with EXACTLY ONE "
     "row: 'Construction of Multi-Purpose Building (Covered Court), Agapito Racelis Elementary "
     "School  PHP 9,602,575.00  PHP 9,899,995.00  97.0%  24-Jul-2026'. Under that row one small "
     "grey line reading '1 award record in our sample. This is a sample, not your full history.' "
     "Then a section opened by the small blue label '02 - OPEN RIGHT NOW, MATCHED TO YOU' with "
     "five hairline-ruled rows, each carrying a small square tag reading either 'MATCH' in solid "
     "blue or 'WIDENED' outlined in grey. " + ROWS +
     "Absolutely no win rate, no percentage won, no totals won and no averages anywhere on the "
     "page. At the top right one small blue text link 'Download PDF'."),

    ("11b-06-preferences", WEB +
     f"A short plain honest preferences page on warm white with enormous margins; small blue "
     f"'{BRAND}' wordmark top left, no navigation at all. Large tight black headline 'Your brief "
     "settings'. A grey line: 'Sent to arnol@example.com. No account, no password -- this link "
     "is your settings.' Then three rows separated by hairline rules, each with a small square "
     "checkbox at the left, the first two ticked in blue: 'Friday brief - every Friday, 7:00 AM "
     "Manila', 'Deadline warning - the evening before anything closes', 'Weekly digest of new "
     "agencies'. Below a thick black rule, a small block opened by a letterspaced grey all-caps "
     "label 'STOP EVERYTHING' with one black line 'We will not contact you again. First request, "
     "no questions.' and one small square button outlined in a black hairline reading "
     "'Unsubscribe'. Nothing else on the page."),

    ("11b-07-state-widened", APP + SURFACE +
     "This is the deliberately-widened state. The table is headed 'Open opportunities'. Directly "
     "under the header sits one full-width strip bounded above and below by thin blue hairline "
     "rules, holding black text: 'Only 1 notice matches buildings in Camarines Norte this week. "
     "We widened to 4 more.' Below it exactly five hairline-ruled rows. The first row carries a "
     "small solid blue square tag 'MATCH'; the next four carry small grey-outlined square tags "
     "'WIDENED', and each of those four has a small grey reason line beneath the project name "
     "reading things like 'adjacent work type - slope protection', 'adjacent work type - "
     "farm-to-market road', 'Camarines Sur, 48km away', 'Camarines Sur, 62km away'. Closing "
     "times are right-aligned monospace countdowns like '09d 04h'. Under the last row one small "
     "centred blue text link 'Widen further - 12 more within 100km'. The right chat pane shows "
     "one assistant message explaining the widening in a single sentence. The table must read as "
     "deliberately curated and generous, never as broken or empty."),

    ("11b-08-state-nodocs", APP + SURFACE +
     "The same detail panel as the notice screen, for 'Construction of Farm-to-Market Road "
     "(Barangay Aguit-it)', with a grey monospace meta row 'VINBAC 0067-2026 - PHP "
     "10,000,000.00 - closes Tue 18 Aug 14:00 - 09d 04h left'. Under the small grey all-caps "
     "label 'ELIGIBILITY' there is only one line, 'PCAB licence required', followed by a grey "
     "italic line 'Everything else is stated inside the bid documents.' Where the documents list "
     "would be there is an honest empty state instead: a square panel outlined in one black "
     "hairline containing a short black heading 'Documents are behind the PhilGEPS supplier "
     "login', two lines of grey text 'This notice is published on the legacy board, which "
     "requires a supplier account to download attachments. We show you the notice, the deadline "
     "and the reference so you can pull them yourself.', and one small square solid blue button "
     "'Open on PhilGEPS'. Nothing on this screen pretends to have data it does not have."),
]


def gen(item):
    name, prompt = item
    body = json.dumps({"model": "gpt-image-2", "prompt": prompt + B11,
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
