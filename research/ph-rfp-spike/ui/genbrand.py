"""Five brand palette boards for the PH RFP finder -- deliberately divergent directions.

Board 01 is the palette locked in DECISIONS.md #3 (teal on near-white), rendered as a board so it
can be compared against four alternatives it has never been tested against. The other four move
the whole system, not just the accent: paper temperature, neutral ramp and type voice all shift.

Same no-emblem constraint as genlanding.py -- a private product must not wear a state seal.
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
    "A brand identity palette board, presented as a flat crisp designer's style guide artboard "
    "photographed straight on -- not an illustration, not a moodboard collage, not a photograph of "
    "paper on a desk. Clean grid layout with generous margins. Realistic legible correct-spelled "
    "text and accurate hex codes rendered in small monospaced type beneath every colour swatch. "
    "LAYOUT, in this order top to bottom: "
    "(1) a small letterspaced all-caps label in the top left reading 'BRAND SYSTEM' and, top right, "
    f"the lowercase wordmark '{BRAND}' set in the palette's own accent colour; "
    "(2) a row of large rectangular colour swatches, each labelled underneath with its role name in "
    "small caps and its hex code in monospace; "
    "(3) a neutral ramp: a horizontal strip of five tonal steps from lightest to darkest with hex "
    "codes beneath; "
    "(4) a typography specimen block: the heading typeface name, a large sample line reading "
    "'Stop missing bids you would have won', and beneath it a monospaced tabular figure line "
    "reading 'PHP 24,800,000.00   03d 12h   ref 55594'; "
    "(5) a small applied-UI strip showing the palette in use: three pill chips, one solid accent "
    "button reading 'Start free', and two tight table rows with a right-aligned peso figure. "
    "STRICTLY NO government seal, no coat of arms, no laurel wreath, no neoclassical building, no "
    "stars-and-sun insignia, no national flag, no map of the Philippines, no stock-photo people, no "
    "3D blobs, no gradient mesh. "
)

# Round-2 guardrail: the two rejected directions were the loud-industrial pole and the dark pole.
NO2 = (
    "ADDITIONAL CONSTRAINTS: the board ground must be LIGHT -- no dark or black background anywhere. "
    "No safety orange, no hazard yellow, no diagonal hazard stripes, no neon or glowing colour, no "
    "heavy condensed all-caps display type, no industrial or construction-signage styling. "
)

DIRECTIONS = [
    ("brand-01-civic-slate", BASE +
     "DIRECTION 1 -- 'CIVIC SLATE', cool, restrained, Swiss, the default of a serious data tool. "
     "Board background near-white #F5F6F7. Swatches: paper #F5F6F7, surface #FFFFFF, ink #111315, "
     "muted grey #6B7280, hairline #E3E5E8, and ONE single accent teal #0E7490 with a pale teal "
     "tint #E0F2F5. No other hue anywhere on the board. Neutral ramp #FFFFFF #F5F6F7 #E3E5E8 "
     "#6B7280 #111315. TYPE: a clean geometric grotesque for headings, a monospaced typeface with "
     "tabular figures for all numerals. STYLE: airy, hairline rules, no shadows, maximum "
     "restraint -- the palette of a tool that wants to disappear behind its data."),

    ("brand-02-ledger-green", BASE +
     "DIRECTION 2 -- 'LEDGER GREEN', warm, financial, engraved, the colour of money and record-"
     "keeping. Board background warm paper cream #F4EFE4. Swatches: paper #F4EFE4, surface #FBF8F1, "
     "deep forest green #14532D, ink brown-black #1C1917, brass ochre accent #B4832E, and a soft "
     "sage tint #DCE6D8. Neutral ramp #FBF8F1 #F4EFE4 #DDD5C4 #6B6357 #1C1917. TYPE: a high-"
     "contrast serif with fine hairlines for headings, a slab monospace for figures. Include a very "
     "faint engraved guilloche line texture in the green swatch only, like banknote intaglio. "
     "STYLE: warm, printed, ledger-paper, institutional in the bank sense not the government sense."),

    ("brand-03-site-orange", BASE +
     "DIRECTION 3 -- 'SITE ORANGE', industrial, high-visibility, the colour language of a "
     "construction site and its signage. Board background cool concrete grey #E7E5E4. Swatches: "
     "concrete #E7E5E4, surface #FAFAF9, steel blue-black #1F2933, safety orange #EA580C, hazard "
     "amber #F59E0B, and a hard white #FFFFFF. Neutral ramp #FFFFFF #E7E5E4 #A8A29E #4B5563 "
     "#1F2933. TYPE: a heavy condensed grotesque with tight tracking for headings, all-caps "
     "letterspaced labels, a wide utilitarian monospace for figures. Include one short diagonal "
     "orange-and-black hazard-stripe rule as a divider element. STYLE: blunt, high contrast, "
     "structural, loud where it matters -- built for someone who reads it in daylight on a job site."),

    ("brand-04-night-terminal", BASE +
     "DIRECTION 4 -- 'NIGHT TERMINAL', dark-first, dense, a financial terminal for public money. "
     "Board background very dark blue-black #0B0F14. Swatches: base #0B0F14, panel #131A22, "
     "hairline #1F2A35, off-white text #E6EDF3, electric cyan accent #22D3EE, and an alert amber "
     "#FBBF24 reserved strictly for closing deadlines. Neutral ramp #0B0F14 #131A22 #1F2A35 "
     "#7D8B99 #E6EDF3. TYPE: a tight neo-grotesque for headings, and a true terminal monospace for "
     "every numeral, reference and countdown. All swatch labels and hex codes in light monospace on "
     "the dark ground. STYLE: dense, low-light, glowing accents used sparingly, the palette of "
     "something you leave open all day."),

    ("brand-05-manila-editorial", BASE +
     "DIRECTION 5 -- 'MANILA EDITORIAL', warm, journalistic, the palette of a weekly briefing "
     "printed on newsprint. Board background warm off-white #FAF7F2. Swatches: newsprint #FAF7F2, "
     "surface #FFFFFF, ink near-black #171410, oxblood red accent #7F1D1D, muted "
     "sand #D6C7AE, and a deep teal-slate secondary #2F4858. Neutral ramp #FFFFFF #FAF7F2 #D6C7AE "
     "#6B6156 #171410. TYPE: a strong editorial serif for headings with a large drop-cap sample, "
     "small-caps letterspaced kickers, and an old-style-figure monospace for peso amounts. Include "
     "one thick oxblood rule and one thin one, as a masthead would use. STYLE: warm, printed, "
     "opinionated, a Friday brief rather than a live feed. Warm Philippine paper tones with no flag "
     "colours and no national symbolism whatsoever."),

    # Round 2, 2026-08-09. 03 (site orange) and 04 (night terminal) were rejected outright, so this
    # batch drops both poles they represent: nothing loud/industrial, nothing dark-first. All five
    # stay light-ground and printed, and differ on paper temperature and accent family instead.
    ("brand-06-blueprint-indigo", BASE + NO2 +
     "DIRECTION 6 -- 'BLUEPRINT INDIGO', cool, technical, the drafting set rather than the job "
     "site. Board background pale blue-grey #EEF1F5. Swatches: drafting paper #EEF1F5, surface "
     "#FFFFFF, deep indigo ink #1E2A5A, drafting blue accent #3B5BDB, pale wash #DDE3F0, and a "
     "graphite grey #565F73. Neutral ramp #FFFFFF #EEF1F5 #DDE3F0 #565F73 #1E2A5A. TYPE: a precise "
     "neo-grotesque for headings, small letterspaced all-caps labels, a fine engineering monospace "
     "for figures. Include a very faint pale-blue technical grid and two thin dimension rules with "
     "tick marks as structural elements. STYLE: precise, measured, drawn -- quiet technical "
     "authority, no heaviness anywhere."),

    ("brand-07-bond-navy", BASE + NO2 +
     "DIRECTION 7 -- 'BOND NAVY', crisp, civic, trustworthy, the visual language of a treasury "
     "prospectus. Board background pure white #FFFFFF. Swatches: white #FFFFFF, cool paper #F7F9FB, "
     "deep navy #10284A, mid slate #44607F, pale sky tint #E4EDF6, and one restrained muted gold "
     "#9A7B3F used ONLY as a hairline rule and never as a fill. Neutral ramp #FFFFFF #F7F9FB "
     "#E4EDF6 #44607F #10284A. TYPE: a transitional serif for headings with generous leading, "
     "small caps for labels, a clean tabular monospace for peso figures. Include one thin gold rule "
     "beneath the wordmark. STYLE: formal, calm, high trust, plenty of white -- credible enough to "
     "email to a procurement officer, with no state emblem doing that work."),

    ("brand-08-warm-clay", BASE + NO2 +
     "DIRECTION 8 -- 'WARM CLAY', soft, human, approachable, earth tones rather than institutions. "
     "Board background oatmeal #F2EDE6. Swatches: oatmeal #F2EDE6, surface #FBF9F6, terracotta "
     "accent #C4653C, deep brown-black #2B241E, muted olive secondary #6F7A52, and a soft clay tint "
     "#EBDBD0. Neutral ramp #FBF9F6 #F2EDE6 #DED4C8 #7A6E63 #2B241E. TYPE: a warm humanist sans "
     "with slightly rounded terminals for headings, a friendly rounded monospace for figures. "
     "Generous corner radii on every chip, button and swatch. STYLE: warm, soft-edged, low "
     "contrast, unintimidating -- the palette of a product a small contractor feels welcome in "
     "rather than audited by."),

    ("brand-09-archive-plum", BASE + NO2 +
     "DIRECTION 9 -- 'ARCHIVE PLUM', quiet, unexpected, the reading room of a records office. "
     "Board background soft grey-lilac #F0EEF2. Swatches: grey-lilac #F0EEF2, surface #FFFFFF, deep "
     "aubergine #3E2A45, muted rose accent #A0526B, pale mauve tint #E6DDE8, and a cool grey "
     "#6D6873. Neutral ramp #FFFFFF #F0EEF2 #E6DDE8 #6D6873 #3E2A45. TYPE: an elegant low-contrast "
     "serif for headings, small letterspaced caps for labels, a refined monospace for figures. "
     "STYLE: hushed, considered, slightly unusual for the category, no drop shadows, thin rules "
     "only -- distinctive without ever raising its voice."),

    ("brand-10-fieldnote-manila", BASE + NO2 +
     "DIRECTION 10 -- 'FIELDNOTE MANILA', tactile, documentary, the manila folder and the surveyor's "
     "notebook. Board background manila-folder tan #EFE3C8. Swatches: folder tan #EFE3C8, surface "
     "#FBF7EC, deep olive #4A5233, ink black #22201B, a single thread-red accent #B3402F used "
     "sparingly for deadlines only, and a faded kraft #DCCBA6. Neutral ramp #FBF7EC #EFE3C8 "
     "#DCCBA6 #6E6553 #22201B. TYPE: a sturdy grotesque for headings, typewriter-flavoured monospace "
     "for every numeral, reference and countdown. Include one thin red rule and a faint horizontal "
     "ruled-notebook line texture behind the typography block only. STYLE: papery, worked-in, "
     "documentary -- the palette of the actual bid folder, not of software about bid folders."),
]

# Round 3, 2026-08-09. All ten prior boards read as "AI style-guide template": same rigid
# five-section checklist, muddy colours, no composition. This round changes the *prompt shape*,
# not just the palettes -- art direction over specification. Fewer swatches, stronger tension,
# named design lineages, asymmetric editorial layout.
BASE3 = (
    "A brand identity board designed by a world-class identity studio -- the standard of Pentagram, "
    "Collins, or Studio Dumbar. Flat graphic artboard, straight-on, printed poster quality, not a "
    "photo of objects and not a moodboard collage. "
    "COMPOSITION: asymmetric editorial layout on a strict grid with one deliberate break in it. "
    "Generous whitespace -- at least a third of the board is empty ground. Colour is shown as a few "
    "large confident fields, not a row of small equal chips; each field carries its hex code in "
    "tiny monospace. One oversized typographic specimen dominates the board, reading "
    "'Stop missing bids you would have won', with a second line in small monospace reading "
    "'PHP 24,800,000.00   03d 12h   ref 55594'. A small lowercase wordmark 'bidkita' sits quietly "
    "in one corner in the accent colour. A single small applied element -- one button or one table "
    "row -- proves the palette in use; nothing more. "
    "Every piece of text legible and correctly spelled. Hex codes accurate to the palette given. "
    "STRICTLY NO: government seal, coat of arms, laurel wreath, flag, map of the Philippines, "
    "3D renders, gradient mesh, drop shadows, dark background, safety orange, hazard stripes, "
    "condensed display caps, stock photos, decorative icons. "
)

DIRECTIONS3 = [
    ("brand-11-signal-red", BASE3 +
     "LINEAGE: Massimo Vignelli's transit work -- white, black, one perfect red. "
     "PALETTE: warm white ground #FCFBF8, near-black ink #16130F, one signal red #D93025, and a "
     "single warm grey #8E8A82 for secondary text. Nothing else. The red appears exactly twice on "
     "the whole board: the wordmark and one thin rule under the headline. "
     "TYPE: a masterful neo-grotesque set tight, enormous headline filling two-thirds of the board "
     "width, ragged right. Monospace figures small and precise. "
     "MOOD: total confidence. The restraint IS the brand."),

    ("brand-12-delft-ultramarine", BASE3 +
     "LINEAGE: contemporary Dutch graphic design -- Studio Dumbar's precision, Total Design's "
     "grids. PALETTE: cool paper #F6F5F1, one deep ultramarine #1D35C4 doing all the work, ink "
     "#14141A, and a bare whisper of pale blue #E9EBF7 as a single tint field. "
     "The ultramarine is used generously -- one large solid field bleeding off the board's edge "
     "with the type specimen reversed out of it in white. "
     "TYPE: a sharp grotesque with real personality in the terminals; figures in a crisp mono. "
     "MOOD: intellectual, exact, slightly electric -- the one saturated colour earns its place by "
     "being alone."),

    ("brand-13-hanko-vermilion", BASE3 +
     "LINEAGE: Japanese public-information design -- rail timetables, MUJI's restraint, the hanko "
     "seal's single red mark on grey paper. "
     "PALETTE: soft warm grey #EDEBE6, sumi ink #201E1A, vermilion #C73E2D used as one small "
     "stamped square element only, and a mid stone grey #A6A199. "
     "The vermilion square sits near the wordmark like a chop mark, at a slight rotation -- a "
     "plain solid square, no characters or symbols inside it. Everything else is ink on grey. "
     "TYPE: a quiet grotesque with wide tracking on small labels, the big specimen set with "
     "unusual care in spacing; tabular mono for figures. "
     "MOOD: hushed precision. The board feels hand-registered, printed in two passes."),

    ("brand-14-bottle-cream", BASE3 +
     "LINEAGE: European luxury-pragmatic -- a private bank's annual report, Aesop's typography "
     "discipline. PALETTE: cream #F7F3EA, deep bottle green #1B3A2D as the dominant colour field "
     "covering nearly half the board with cream type reversed out of it, a pale celadon #DCE5DB, "
     "and warm ink #221F1A. "
     "TYPE: an elegant serif with sharp brackets for the big specimen, paired against a plain "
     "grotesque for labels; peso figures in a refined mono with hairline table rules. "
     "MOOD: quietly expensive. Green as depth and calm, never as 'eco'."),

    ("brand-15-overprint-duotone", BASE3 +
     "LINEAGE: risograph print culture and mid-century book covers -- two inks, one paper, "
     "overlap as the third colour. "
     "PALETTE: warm newsprint #F8F4EB, ink blue #2B3F8C, warm red-orange #D4522E, and where the "
     "two inks visually overlap, a deep plum-brown #5B2B3C shown as a third small field labelled "
     "'OVERPRINT'. The two ink colours appear as large offset overlapping rectangles behind part "
     "of the headline, printed slightly out of register on purpose. "
     "TYPE: a sturdy editorial grotesque, big specimen partly sitting on the overlap; typewriter "
     "mono for figures. "
     "MOOD: printed, human, collectible -- a brand that looks pulled off a press, not exported "
     "from software."),

    # 08 (warm clay) was the one round-2 board the user liked -- same palette family, re-composed
    # through the round-3 art direction instead of the checklist template.
    ("brand-16-clay-refined", BASE3 +
     "LINEAGE: contemporary craft-forward identity -- the warmth of a ceramics studio brand held "
     "to editorial discipline. "
     "PALETTE: oatmeal ground #F2EDE6, terracotta #C4653C as one large confident colour field with "
     "type reversed out of it in oatmeal, deep brown-black ink #2B241E, and muted olive #6F7A52 "
     "appearing only once as a small element. "
     "TYPE: a warm humanist grotesque for the big specimen -- friendly terminals but set tight and "
     "large, nothing rounded or soft about the composition -- and a clean tabular mono for "
     "figures. Generous radii only on the single applied button. "
     "MOOD: warm and human but composed -- the earlier softness kept in the colour, the slack "
     "taken out of the layout."),
]

# Round 4, 2026-08-09. 15 (overprint duotone) won on vibe -- printed, tactile, pulled-off-a-press.
# Five more at that level: same press-culture materiality, five different print traditions.
PRESS = (
    "MATERIALITY: the whole board reads as genuinely printed -- visible paper grain, slightly "
    "uneven ink coverage, colours sit IN the paper rather than on it. Any overlap or "
    "misregistration is deliberate and beautiful, never sloppy. Still a designed artboard, not a "
    "photograph of paper. "
)

DIRECTIONS4 = [
    ("brand-17-riso-pink-peacock", BASE3 + PRESS +
     "PRINT TRADITION: classic two-drum risograph -- fluorescent pink and peacock teal, the "
     "best-loved ink pairing in riso culture. "
     "PALETTE: warm off-white stock #F9F5EC, riso fluorescent pink #F05A7E, peacock teal #157A6E, "
     "and their overlap a deep ink-violet #4A2D52 shown where the two fields cross. Ink black "
     "#1E1B16 for the specimen text only. "
     "The pink and teal appear as two large soft-edged ink fields crossing behind the headline at "
     "different angles. TYPE: sturdy editorial grotesque, big; typewriter mono for figures. "
     "MOOD: energetic but sophisticated -- the pairing is playful, the setting is dead serious."),

    ("brand-18-cyanotype", BASE3 + PRESS +
     "PRINT TRADITION: the cyanotype -- a single deep Prussian blue laid down by sunlight, "
     "everything else knocked out to paper white. "
     "PALETTE: one deep Prussian blue #1B3B6F covering most of the board as a rich slightly "
     "mottled sun-printed field, paper white #F7F4ED for all type reversed out of it, and one "
     "narrow strip of the paper left unprinted along the bottom carrying the hex codes and the "
     "applied table row in blue ink. No third colour anywhere. "
     "TYPE: a grotesque with real presence reversed out white, enormous; fine white mono for "
     "figures. The blue field's edges are soft like an exposure, not hard vector edges. "
     "MOOD: singular, photographic, unmistakable -- the brand IS the blue."),

    ("brand-19-received-stamp", BASE3 + PRESS +
     "PRINT TRADITION: the rubber stamp and the bond-paper document -- the actual visual culture "
     "of Philippine procurement paperwork, elevated. "
     "PALETTE: white bond paper #FAF8F3, blue-black fountain ink #232B3A for all text, stamp-pad "
     "red #C0392B appearing only as stamped elements, and a pale file-folder grey #E6E2D8. "
     "The headline is set in crisp type and stays fully legible. A large slightly-rotated red "
     "rubber-stamp impression reading 'RECEIVED' with uneven ink coverage sits in the clear space "
     "BESIDE the headline, overlapping nothing -- the stamp and the type never touch. A second "
     "smaller stamp near the applied table row reads '03d 12h'. Stamps are plain text in rounded "
     "rectangles -- no seals, no emblems, no eagles. "
     "TYPE: typewriter roman for the mono lines, a plain strong grotesque for the headline. "
     "MOOD: documentary wit -- the bureaucracy's own tools turned into the brand, affectionate "
     "not mocking."),

    ("brand-20-letterpress-kraft", BASE3 + PRESS +
     "PRINT TRADITION: letterpress on kraft board -- heavy impression, opaque ink, one blind "
     "deboss. "
     "PALETTE: warm kraft brown #C9AE8C as the board itself, opaque cream ink #F4EDDD for the "
     "large specimen type pressed into the kraft, deep bottle-ink green #223528 as one heavy "
     "solid printed panel, and a thread of brick red #A6392E used once as a thin rule. "
     "Part of the wordmark appears as a blind impression -- inkless, visible only as pressed "
     "relief in the kraft. TYPE: a robust grotesque with slightly soft edges where ink meets "
     "paper; mono figures printed small in green. "
     "MOOD: physical, honest, built -- craftsmanship a contractor recognises in their hands."),

    ("brand-21-municipal-twopass", BASE3 + PRESS +
     "PRINT TRADITION: mid-century municipal print shop -- the two-pass spot-colour posters and "
     "forms that city print offices produced in the 1960s. "
     "PALETTE: aged cream stock #F5EFDF, spot green #2E5D3F and spot vermilion #C94F32 as the two "
     "ink passes, ink brown-black #26211A for text. The two spot colours appear as flat "
     "geometric panels and thick bars organising the board -- a vermilion circle overlapping a "
     "green rectangle behind the headline, their overlap going a deep pine #1F3A2A. "
     "One row of the board set like an official form: thin ruled lines with the mono figures "
     "sitting on them. TYPE: a warm mid-century grotesque, tightly set; typewriter mono. "
     "MOOD: civic nostalgia with graphic bite -- Olivetti-era public design, not vintage kitsch."),
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
    want = sys.argv[1:]  # e.g. `python3 genbrand.py 03` to re-roll one direction
    todo = [d for d in DIRECTIONS + DIRECTIONS3 + DIRECTIONS4 if not want or any(w in d[0] for w in want)]
    with concurrent.futures.ThreadPoolExecutor(3) as ex:
        for name, msg in ex.map(gen, todo):
            print(name, msg, flush=True)
