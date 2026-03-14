# Scope Summary Legibility in Exports and Shared Artifacts

**Aspect:** 4.69e-i-d — When a filtered analysis PNG is shared to Discord or included in a threat model report, does the scope summary contain enough for a reader who didn't run the filter to understand what they're looking at; design of the export footer.

**Parent:** 4.69e-i — Career analysis scope filter UI design
**Siblings:** 4.69e-i-a (sample size warning threshold); 4.69e-i-b (opponent list sorting at scale); 4.69e-i-c (filtered analysis data points in trend graph); 4.69e-i-e (auto-filter suggestion engine)
**Related:** 4.57 (threat model report); 4.69e (adversarial multi-cluster poisoning); 4.69e-ii (known adversarial opponent tagging); 7.10 (config necropsy culture)

---

## The Design Problem

A filtered analysis produces a result that is, by definition, **context-dependent**. A top-candidate coverage score of 18% means something very different when computed over 89 matches (excluding adversarial opponents) vs. 247 matches (full scope). The number alone is misleading without the denominator — and the denominator requires understanding the filter.

When the analysis lives inside the game, this context is always present: the amber "Filtered" pill, the scope shelf, the match count, the opponent checkboxes. The game holds the player's hand. But the game's primary social artifact is the **exported PNG** — the screenshot shared in Discord, embedded in the threat model report, dropped into a team chat. Here, the UI chrome is gone. What remains is the analysis panel frozen in amber, floating free from context.

**The reader's problem**: Someone in Discord sees: "RELAY-C: 18% coverage, top candidate." They don't know:
- Is 18% good or bad? (Answer: very good — 52% was the pre-fix baseline)
- Is this the player's actual career health? (Answer: no — it's adversarial-excluded)
- Should the reader trust this number when advising on config changes? (Answer: only if they understand what's excluded and why)
- What is this a picture of, exactly?

A deceptive export is worse than no export. If the community gives advice based on a misread filtered analysis, the player acts on bad advice. If a teammate in a tournament context misreads a threat model section as full-scope when it's adversarially-excluded, they may underestimate actual threats.

**The secondary problem**: Export design is not just about the reader — it's about player behavior. If exporting a filtered analysis feels risky (readers might misunderstand), players will avoid sharing their diagnostic work, which undermines the game's aspiration to be a community analytical tool. The footer must make exporting feel *safe* — not just readable, but *trustworthy*.

---

## The Export Context Spectrum

Before designing the footer, establish what contexts an exported analysis might land in:

| Context | Audience | Attention | Prior knowledge | What they need |
|---------|----------|-----------|-----------------|----------------|
| Discord message | Spectators, teammates, strangers | 3-5 seconds | None or low | Immediate legibility at a glance |
| Team strategy chat | 2-5 trusted teammates | 30-60 seconds | Medium (know the game, maybe your config) | Enough to give valid advice |
| Threat model report | Tournament team or self-reference | 2-10 minutes | High (have read the rest of the report) | Precise, dense, cross-referenceable |
| Reddit/forum post | Public, varied expertise | 5-30 seconds | Low to medium | Hook + sufficient context to engage |
| Personal archive / journal | Self, later | 30+ seconds | High (you made it) | Enough to remember why you ran it |

These contexts need different things. The Discord reader wants a six-word caption. The threat model reader wants a structured filter receipt. The archive reader wants a timestamped record. A single footer design cannot serve all equally — but it can serve all *adequately* while excelling at the most common case.

---

## Option Space

### Option A: The Minimal Stamp

**What it is:** A small amber pill badge in the top-right corner of the exported image reading only `FILTERED · 89/247`. No other context. Nothing about what was filtered. Just: this is filtered, and here's the match count.

**What it looks like:**
```
┌──────────────────────────────────────────┐
│ ░░░░░░░░░░░ CAREER ANALYSIS ░░░░░░░░░░░ │  ← amber header band (from in-game)
│ [FILTERED · 89/247]                       │  ← amber pill, top right
│                                            │
│  RELAY-C          18%  ████░░░░░░  #1      │
│  SCOUT-HOOK       12%  ███░░░░░░░  #2      │
│  BUFFER-X          9%  ██░░░░░░░░  #3      │
│                                            │
│ ⚠ 2 multi-cluster flags                   │
└──────────────────────────────────────────┘
```

The amber color signals to anyone who has played the game: "this isn't full-scope." To everyone else: "something is different here."

**The 15-second clip:** A Discord message lands in a Robot Uprising community server. Someone scrolls by, sees the amber panel, sees "FILTERED · 89/247" in the corner. They stop. "Oh, they excluded some matches." They comment: "what did you filter out?" — exactly the right question. The minimal stamp *invites* context rather than trying to provide it.

**Strengths:**
- Minimal visual footprint — the analysis content remains primary
- Amber color creates an immediate "this is special" signal without requiring literacy
- The ratio (89/247) gives a statistical legibility signal: more than a third of matches excluded is significant; less than 5% is negligible
- Avoids over-explaining to players who already understand filtered analyses
- Works at Discord thumbnail size (the stamp is readable even at 200px wide)

**Weaknesses:**
- Zero descriptive power — what was filtered? Why? What were they looking for?
- The number "89/247" is meaningless without knowing what the 158 excluded matches have in common
- Readers unfamiliar with the filter system see an arbitrary-seeming match count restriction with no explanation
- A player who filtered by config version (matches with v3.0+) looks identical to a player who filtered out adversarial opponents — same stamp, completely different analytical question

**Failure mode:** A player shares this PNG in a tournament discord. An opponent sees it. They don't know what's filtered. They see RELAY-C at 18% and underestimate the threat. The filtered analysis made the config look stronger than the full-scope analysis would. The minimal stamp has zero adversarial-poisoning disclosure — which is the entire *reason* the filtered analysis exists.

---

### Option B: The Filter Receipt

**What it is:** A dedicated footer zone at the bottom of the exported image, styled like a store receipt — a structured, left-aligned list of what was included and excluded. Amber background, monospace font, small text.

**What it looks like:**
```
┌──────────────────────────────────────────┐
│ ░░░░░ CAREER ANALYSIS — FILTERED ░░░░░░ │
│                                            │
│  RELAY-C          18%  ████░░░░░░  #1      │
│  ...                                       │
│                                            │
╠════════════════════════════════════════════╣
│ SCOPE FILTER  ┊  89 of 247 matches         │
│ EXCLUDED OPPONENTS: VoidEater_Prime (7m),  │
│   ghost_protocol (4m)                      │
│ INCLUDED SCENARIOS: All                    │
│ CONFIG RANGE: v3.0 – current               │
│ RUN: 2026-03-14  ┊  Config v4.1            │
└──────────────────────────────────────────┘
```

The separator line is a visual "break" between the analysis content (which exists in-game and out-of-game) and the scope metadata (which is export-specific context).

The opponent names are abbreviated to their in-game handles. Match counts appear in parentheses: `(7m)` = 7 matches excluded. Config version and run date round out the record.

**The 15-second clip:** A tournament player drops this PNG into the team's strategy doc. Teammate opens it, reads the footer in 10 seconds: "excluded VoidEater_Prime (7 matches) and ghost_protocol (4 matches). RELAY-C at 18% after that exclusion. They've been cleaning up the architecture." No questions needed. The footer answered them.

**Strengths:**
- Complete factual record — a reader can reconstruct exactly what data the analysis is based on
- Opponent names are the most human-legible unit of exclusion — more legible than match IDs, more personal than anonymized labels
- Structured layout survives compression and resizing better than prose
- The pattern (excluded opponents + scenario filter + config range + timestamp) covers every plausible filter type
- Fulfills the "threat model report" use case well — can be read as a structured data block in a document

**Weaknesses:**
- Visual clutter — the footer can become as large as the analysis content itself when many opponents are excluded
- The player's in-game `☠️ confirmed adversarial` and `⚠️ suspected adversarial` tags are NOT visible in this format — the reader sees opponent names but not the reason for exclusion
- Reads clinical and cold — no interpretive layer ("why was this filtered?")
- In Discord's image preview, the footer may be cropped or scaled to unreadable sizes

**Overflow problem:** A player who excluded 12 opponents across a large career generates a footer with 12 names. The receipt wraps to 4 lines. The analysis content shrinks. The footer dominates. Some form of truncation is required — but truncation introduces ambiguity.

---

### Option C: The Named Filter Caption

**What it is:** If the player has named their saved filter, the export footer uses that name as the primary legibility shortcut. A single line: `Scope: "Adversarial Excluded" · 89/247 matches · 2026-03-14`.

**The key insight:** The most legible unit of filter description is the *intent*, not the criteria. "Adversarial Excluded" tells the reader more about what the analysis means than a list of opponent handles. The name is the player's own interpretive frame for the filter — and that frame is the context the reader needs.

**What it looks like:**
```
┌──────────────────────────────────────────┐
│ ░░░░░ CAREER ANALYSIS — FILTERED ░░░░░░ │
│                                            │
│  RELAY-C          18%  ████░░░░░░  #1      │
│  ...                                       │
│                                            │
│ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ │
│ Scope: "Adversarial Excluded"              │
│ 89/247 matches · Config v4.1 · 2026-03-14 │
└──────────────────────────────────────────┘
```

For *unnamed* filters (ad-hoc, not saved), the footer falls back to the filter receipt format (Option B) or the minimal stamp (Option A).

**Incentive effect:** This design creates a strong behavioral incentive: name your filter, get a clean export. Don't name it, get a clinical receipt or a cryptic stamp. This gently pressures players toward the habit of naming saved filters — which has cascading benefits for the game's entire filtered-analysis system (easier recall, better history log, better threat model report structure).

**The 15-second clip:** Someone in Discord posts a filtered analysis. The footer reads: `Scope: "Against Fast-Aggro Only" · 67/247 matches`. The community immediately understands what they're looking at. No questions. Comments begin: "RELAY-C is strong in standard modes but look at these numbers against fast-aggro — that's where the gap is."

**Strengths:**
- Maximum legibility when the filter has a meaningful name
- Names carry interpretation, not just data
- Compact footer (single line) when named — doesn't crowd the analysis
- Creates behavioral incentive for the valuable habit of naming filters
- Differentiates "this was a deliberate named analysis" from "this was an ad-hoc exclusion" — useful information in itself

**Weaknesses:**
- Entirely dependent on the player having named the filter well. A filter named "filter1" or "march" is useless to a reader.
- The criteria are invisible — a reader who wants to validate the numbers can't check what "Adversarial Excluded" actually means
- The fallback for unnamed filters degrades to a different design paradigm, creating inconsistency

---

### Option D: The Interpretive Caption

**What it is:** Before exporting, the player is prompted with an optional text field: "Add a note for readers (optional)." Up to 80 characters. The note appears in the footer alongside the filter receipt.

```
┌──────────────────────────────────────────┐
│  RELAY-C          18%  ████░░░░░░  #1      │
│  ...                                       │
│ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ │
│ "Excluded VoidEater_Prime — adversarial    │
│  targeting confirmed in cluster log"       │
│ Scope: 89/247 matches · Config v4.1        │
└──────────────────────────────────────────┘
```

The note is optional but surfaces directly in the prompt-to-export flow, making it easy to add when exporting intentionally (for Discord sharing) and easy to skip when exporting quickly (for personal archive).

**Strengths:**
- Full interpretive power — the player can explain any reasoning in natural language
- Qualifies the data in ways no automated system can (e.g., "I've seen RELAY-C at 18% consistently after the hook rewrite — this isn't a fluke")
- Makes shared analyses feel like a human wrote them, not a tool output
- The note is a commitment signal: if the player writes an explanation, they have thought about the analysis

**Weaknesses:**
- Friction at export time: prompting for a note adds one interaction step. Most players will skip it.
- The optional note is the most powerful element in the footer but statistically will be blank most of the time — making it a luxury feature
- No note = no interpretive layer = reader still lacks context

---

### Option E: The Layered Footer (Recommended Hybrid)

**What it is:** The footer has three layers, with the first two always present and the third optional.

**Layer 1 — Always present (the amber badge):**
Embedded in the analysis panel itself (not a footer). A small amber pill in the top-right of the panel reading `FILTERED` with a match count badge: `89/247`. This is the in-game amber color, preserved in the export. Even at Discord thumbnail compression, this badge is visible.

**Layer 2 — Always present (the scope line):**
A single-line footer beneath the panel, always present in exports, containing:
- Filter name (if named): `"Adversarial Excluded"` in quotation marks
- OR filter summary (if unnamed): `Custom scope · Excluded: 2 opponents`
- Match count: `89/247 matches`
- Timestamp and config version: `2026-03-14 · v4.1`

**Layer 3 — Optional (the annotation):**
If the player added a note during export, it appears as a second footer line in italic text above the scope line.

**Full example with all layers:**
```
┌──────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░ CAREER ANALYSIS — AGENT AUDIT ░░░░░░░░░░░░ [FILTERED]│
│                                                        89/247    │
│                                                                    │
│  RELAY-C          18%   ████░░░░░░░░░   #1  Cluster: 3 matches  │
│  SCOUT-HOOK       12%   ███░░░░░░░░░░   #2                       │
│  BUFFER-X          9%   ██░░░░░░░░░░░   #3                       │
│  ...                                                              │
│                                                                    │
│ ⚠ 2 multi-cluster flags detected                                 │
├──────────────────────────────────────────────────────────────────┤
│ ╎ Excluded VoidEater_Prime — adversarial targeting confirmed     │  ← Layer 3 (optional)
│   Scope: "Adversarial Excluded" · 89/247 matches · v4.1 · 2026-03-14 │  ← Layer 2 (always)
└──────────────────────────────────────────────────────────────────┘
```

**Minimal example (no note, no saved filter name):**
```
│   Scope: Custom · Excluded: VoidEater_Prime, ghost_protocol · 89/247 · v4.1 · 2026-03-14 │
```

**The footer line is the key unit.** It must survive:
- Discord's image resize (readable at 400px wide)
- Screenshot cropping (visible at bottom edge)
- PDF embedding (legible at 72dpi)
- Light and dark backgrounds (amber text on near-black bar or near-white bar)

**Visual design:** The footer sits below a thin 1px separator line. Amber text. Monospace for the scope data. Italic for the player annotation. Font size: 10-11px in a 1280px-wide export (scaling proportionally). The separator and amber text color create a visual break between "the analysis" and "the context for the analysis" — they are two different layers of artifact.

---

## Sensory Description

**What it looks like:** The analysis panel is dark — near-black background, cool blues and ambers for the coverage bars. The filtered analysis header band glows amber, a slightly warmer amber than the full-scope panel's cool blue header. The `[FILTERED]` badge in the top right is a small pill, the same amber but with a thin white border — it reads as a *warning label*, not a feature flag. The match count `89/247` appears in small white text inside the badge, barely legible at thumbnail scale but clearly readable at full resolution.

The footer below the separator is a darker bar — near-black, slightly lighter than the panel body. The scope line renders in amber monospace, the same amber as the header but at 60% brightness — muted, secondary, informational. The player annotation (when present) is italic, slightly warmer white, and visually reads like a handwritten note stapled to a printout.

**What it sounds like:** Exporting the analysis plays a brief high-pitched `click-chunk` — the sound of a camera shutter and a folder closing at the same time. A small amber "✓ Exported" toast appears briefly in the bottom-left. The sound communicates: *this is now an artifact, it exists outside the game*.

**What it feels like to share:** Dragging the exported PNG into Discord feels like handing someone a page from your lab notebook. The footer is the citation at the bottom of the page. The amber color signals: "I have done careful work, I have noted my methodology, here is what I found."

---

## Player Journeys

### Journey: Vesper, 28, Competitive Mid-Tier Player

**Context:** Vesper has been fighting a suspicious opponent, VoidEater_Prime, for 3 weeks. Their career analysis keeps showing RELAY-C at 52% — a number that makes no sense given their recent hook rewrites. They finally discover the scope filter, exclude VoidEater_Prime, and the number drops to 18%. They want to share this discovery to their Discord community (100+ active Robot Uprising players) and ask if anyone else has had similar experiences.

**Minute 0:00 — The Export Decision**
Vesper's career analysis panel is open, filtered, showing 18% RELAY-C. The amber header glows. They find the `[Export PNG]` button — a small camera icon in the amber header bar, positioned to the right of the "Run Analysis" button. They click it.

A small modal opens. Title: `Export Filtered Analysis`. Below it: a text field reading `Add a note for readers (optional)`. Vesper pauses. They type: `Excluded VoidEater_Prime (7m) — suspected adversarial targeting, same 3 elements every match`. The note counter reads `81/80` — one character too long. They trim to `Excluded VoidEater_Prime — suspected adversarial, same 3 elements every match`. The counter goes green: `79/80`. Below the text field: a dropdown `Scope label: "Adversarial Excluded" (saved filter)` — pre-populated from their named filter. Below that: `[Export · 89/247 matches]`.

They click Export. A short `click-chunk` sound plays. An amber toast: `✓ Saved to Desktop/robot-uprising-exports/2026-03-14_adversarial-excluded.png`. The modal closes.

**Minute 0:30 — Sharing to Discord**
Vesper drags the PNG into the Robot Uprising community Discord, channel `#config-analysis`. As they type their question — "Has anyone else dealt with adversarial match poisoning? Look at the difference when I exclude VoidEater_Prime" — the image preview renders in Discord at about 500px wide. At this size:
- The `[FILTERED]` badge is visible in the top right.
- The `89/247` count is legible as a tiny label.
- The analysis content (RELAY-C 18%, coverage bars) is fully readable.
- The footer line is smaller — readable if zoomed, barely legible at thumbnail — but Discord's image expansion works fine.

**Minute 1:00 — The Community Response**
Three responses come within 5 minutes. All three immediately understand the analysis because of the footer. One writes: "Yeah, `Adversarial Excluded · 89/247` — smart. What's your full-scope number?" Vesper replies: 52%. The community immediately grasps the delta. Discussion begins.

One community member zooms in on the PNG to read the footer annotation: "Excluded VoidEater_Prime — suspected adversarial, same 3 elements every match." They reply: "This is an adversarial poisoning case. You should hard-tag them in the system. I wrote a guide about this." The annotation — written by Vesper in 30 seconds — became the thread's inciting document.

**Resolution:** Vesper gets valid advice because readers understood the filter. The footer annotation was the key. Without it, they might have gotten advice based on the false premise that 18% is Vesper's true architecture score.

**UI Annotations:**
- Export modal: appears as a bottom-sheet overlay on mobile, standard modal on desktop; text field is single-line with character counter; scope label is read-only (shows active filter name or "Custom scope")
- `[FILTERED]` badge: amber pill, top-right of image, 10px inset from edge; white text `FILTERED` + match count on separate line in badge
- Footer annotation: italic amber-white text; 11px font; appears above scope line; separated by no visible divider (they form one visual block)
- Footer scope line: monospace, amber at 60% brightness, 10px font; timestamp is ISO date format; config version uses the game's canonical `v4.1` short form

---

### Journey: Korbin, 34, Tournament Data Analyst

**Context:** Korbin plays in a semi-professional Robot Uprising league. They maintain a detailed threat model report before every tournament — a multi-page document with config vulnerability assessments, opponent scout reports, and season-health trend analysis. They are adding a new section: "Quick Assault Vulnerability (Filtered)," using an analysis excluding holdout/extraction scenarios to isolate fast-aggro weaknesses. This will be shared with their three-person team.

**Minute 0:00 — Building the Section**
Korbin runs a filtered analysis: `Quick Assault Only · 34/247 matches`. The top candidate comes back: RELAY-C at 31%. Notably higher than full-scope (18%). This confirms their hypothesis: RELAY-C's architecture is actually well-suited to most scenario types, but breaks specifically against fast-aggro opponents who can overwhelm the buffer before hooks fire.

They click export. The export modal opens. Korbin does NOT add a note — the threat model report has its own explanatory prose. They just export. The scope line will read: `Scope: "Quick Assault Only" · 34/247 matches · Config v4.1 · 2026-03-14`.

**Minute 1:00 — Embedding in the Report**
Korbin pastes the PNG into their Google Docs threat model report. The image lands in the section. Below it, Korbin types in the document: "Note: this analysis covers 34 quick-assault matches only. Full-scope analysis (247 matches) shows RELAY-C at 18%. The 31% vs. 18% delta is the vulnerability profile: RELAY-C is architecturally acceptable in most contexts but exposed specifically to fast-aggro timing windows."

The PNG footer and the document prose work as redundant context. Even a reader who skips Korbin's prose can read the footer. Even a reader who can't read the footer (too small in the PDF) gets the context from the prose.

**Minute 3:00 — Teammate Review**
Teammate opens the doc, scrolls to the section. They see the amber-filtered PNG, the analysis, and the footer. They read: `Scope: "Quick Assault Only" · 34/247`. They parse it instantly. They don't need to ask: "is this your real score or a filtered score?" The answer is in the image. They move on to analyzing the implication.

**Resolution:** The threat model report works precisely because the exported PNGs are self-describing. Korbin's teammates can verify the analytical methodology from the image alone, without having to trust Korbin's in-document prose. The scope line functions as a citation.

**UI Annotations:**
- Named filter in export: the `Scope:` label auto-populates with the active saved filter's name; if the player renames the filter later, exported PNGs retain the name as it was at export time — not retroactively updated
- Match count in footer: `34/247` — both numbers matter; `34` is the statistical base; `247` is the career total; readers can compute `34/247 = 14%` as a "how narrow is this slice?" signal
- Timestamp: always export date, not analysis-run date; if re-exporting a cached analysis run on a different day, timestamp is the export date with an asterisk: `2026-03-15 *cached 2026-03-14`

---

### Journey: Naledi, 22, Beginner Player — Receives a Filtered Analysis PNG

**Context:** Naledi started Robot Uprising two weeks ago. They're in a Discord community for new players. An experienced player, Dax, drops a filtered analysis PNG into the chat with: "Here's what I see when I clean out the junk data — my RELAY-C is actually much healthier than the career analysis kept telling me." Naledi wants to understand what they're looking at.

**Minute 0:00 — First Contact with the Export**
Naledi clicks the image to expand it. They see:
- A dark panel labeled `CAREER ANALYSIS — AGENT AUDIT`
- An amber header with `[FILTERED]` in the top right with `89/247` beneath it
- A list of elements with coverage percentages and colored bars
- A footer reading: `Scope: "Adversarial Excluded" · 89/247 matches · Config v4.1 · 2026-03-14`

Naledi doesn't know what "filtered" means yet. They don't know what "adversarial excluded" means. But they know:
- "89 of 247 matches" — some matches are excluded
- "Adversarial Excluded" — the reason for exclusion has to do with "adversarial" something
- The amber color signals: this is non-standard

**Minute 0:30 — The Question**
Naledi replies: "What does `Adversarial Excluded` mean? Why are only 89 of 247 matches included?" This is the right question. The footer generated the right question. Dax explains: "Some opponents deliberately stress specific parts of your config every game to make your career analysis think that part is a structural weakness. I exclude those opponents when I want to see my real architectural health." Naledi replies: "Oh — your own diagnostic tool can be hacked." Dax: "Exactly."

**Minute 2:00 — Understanding Deepens**
Naledi looks at the image again. The footer is now legible in a richer way: "Adversarial Excluded" means the analysis has been cleaned of deliberately bad data. The 89/247 means Dax excluded about 64% of matches — a substantial fraction. The `Config v4.1` is the version of Dax's current agent setup. The date says when this was run.

Naledi doesn't need all of this to understand the image. But the footer has given them enough hooks to ask the right questions and receive the right explanations. Without the footer, they would have seen "RELAY-C 18%" and had no idea whether that was good or bad, real or filtered, representative or cherry-picked.

**Resolution:** The export footer served an onboarding function — not just context for the immediate image, but an introduction to game mechanics the new player hasn't yet encountered. "Adversarial Excluded" as a footer label is more legible than a list of opponent names would have been, precisely because Dax named their filter with intent.

**UI Annotations:**
- The `[FILTERED]` badge is legible at Discord expansion size even for new players — it signals "something unusual is happening here" even before they understand what filtered means
- "Adversarial Excluded" as a named filter is doing double pedagogical work: telling the reader what was excluded AND implying why it needed to be excluded
- The footer's amber color ties it visually to the amber header — both amber elements are "the same category of different-ness"

---

## Overflow Design: When the Footer Gets Long

### The Complex Filter Problem

A player who filtered by 5 opponents + 2 scenario types + a config version range generates a raw scope line that overflows:

```
Scope: "Custom" · Excluded: VoidEater_Prime, ghost_protocol, NEON_TEETH, Ravenhorn, xX_destruct ·
        Scenarios: Quick Assault, Holdout excluded · v2.0–v3.9 only · 89/247 · 2026-03-14
```

This is 3 wrapped lines in the footer. At Discord compression, unreadable. The footer has broken the analysis.

### Truncation Patterns

**Pattern 1 — Named Filter Saves Everything:**
If the player named the filter, the footer collapses to a single line regardless of complexity: `Scope: "Late Season Quick Assault" · 89/247 · v4.1 · 2026-03-14`. No overflow.

This is a strong mechanical argument for naming filters. Players who name their filters get compact exports. Players who don't get cluttered exports. The incentive is direct.

**Pattern 2 — Truncation with Disclosure:**
For unnamed complex filters, truncate and add a disclosure marker:
```
Scope: Custom · Excluded: VoidEater_Prime, ghost_protocol (+3 more) · 89/247 · 2026-03-14
```
The `(+3 more)` tells the reader the footer is incomplete but that more criteria exist. This prevents false confidence that the displayed criteria are the complete picture.

**Pattern 3 — Tier Compression:**
Summarize by filter type rather than listing items:
```
Scope: Custom · Excluded: 5 opponents, 2 scenario types · v2.0–v3.9 · 89/247 · 2026-03-14
```
This compresses the opponent list to a count and the scenario list to a count. Less legible for identifying the specific excluded items, but immediately clear about the *nature and extent* of filtering.

The recommended default for overflow: **Named filter → single line. Unnamed filter with ≤2 exclusions → full receipt. Unnamed filter with 3+ exclusions → Tier Compression.** The truncation modes are chosen automatically based on complexity.

---

## Interaction Effects

**4.69e-i-c (Filtered analysis data points in trend graph):** When a filtered analysis is displayed in the trend graph as an amber diamond, the graph's tooltip on hover shows the same footer scope line: `"Adversarial Excluded" · 89/247 · 2026-03-14`. The scope summary legibility design feeds back into the graph annotation design — the footer text *is* the tooltip text, at different sizes.

**4.57 (Threat model report):** The threat model report PDF auto-generates section headers using the filter name. A filtered analysis named "Quick Assault Only" appears in the threat model as a section labeled `QUICK ASSAULT ONLY — FILTERED ANALYSIS`. The footer scope line appears verbatim as the section subtitle. The report's visual language matches the export's visual language.

**4.69e-ii (Known adversarial opponent tagging):** When the export includes an excluded opponent who is tagged `☠️ confirmed adversarial` in the player's system, the footer can optionally show the tag: `Excluded: VoidEater_Prime ☠️ (+1 unconfirmed)`. This is an opt-in behavior controlled in export settings — some players want to broadcast their adversarial assessments; others want to keep it private (not publicly marking opponents as adversarial before confirmation).

**4.69k (Cluster flag history):** The export footer date and scope line together form a unique identifier for a specific analysis run. The cluster flag history log can cross-reference to specific exports: "2026-03-14 · Adversarial Excluded · 89/247" as a link in the history log that opens the cached analysis or regenerates it.

**7.10 (Config necropsy culture):** Community necropsy sessions where experienced players review others' configs benefit enormously from export legibility. A well-labeled filtered analysis export is a primary artifact in necropsy culture — it tells the reviewing player exactly what question was being asked ("what's my architecture health excluding this adversarial opponent?") and what evidence was used to answer it.

---

## Comparable Media

**Scientific paper figure captions:** Every figure in a scientific paper has a caption that explains what the figure shows, including its conditions ("n=89 samples, excluding outliers above 3σ"). The caption is part of the figure — inseparable from it in most publishing formats. The Robot Uprising footer is the figure caption.

**Chess game notation with annotations:** Published chess game scores include annotations — `?!` (dubious move), `!` (excellent move) — that are inseparable from the score. A filtered analysis with a player annotation in the footer is a similar artifact: the score + the annotator's judgment, combined.

**Grafana/Datadog dashboard exports:** Analytics dashboards exported to PNGs or PDFs always include the time range, data source, and filter conditions in a footer or header bar. Operations teams rely on this for runbook documentation — a dashboard PNG without its time range label is useless during incident review. The Robot Uprising export footer is this label.

**Twitter/X labeled media:** Twitter began adding labels to misleading content to provide context without removing it. The design challenge is identical: a reader is seeing the content without the context in which it was created. A label is added to bridge the gap. The `[FILTERED]` badge is a softer version of this — not a warning that the content is misleading, but a disclosure that the content is conditional.

**Slay the Spire run history:** The STS run history export (via third-party tools like Spirelogs) includes the character, ascension level, seed, deck size, and final floor — all context needed to evaluate whether a particular run's performance means anything. Without the ascension level, comparing two run scores is meaningless. The Robot Uprising scope line is the ascension level equivalent for career analysis exports.

---

## New Aspects Discovered

- **4.69e-i-d-i — Overflow truncation design for complex unnamed filters:** Exactly how overflow is triggered (character limit? element count?), which truncation pattern is applied automatically vs. user-selected, and how the "full criteria accessible here" affordance works in a static PNG (where interactive disclosure is unavailable).

- **4.69e-i-d-ii — Threat model report section header design:** The section format for filtered analyses in the threat model PDF: how the scope line appears as a section subtitle, whether a mini-version of the filtered analysis panel appears as a sidebar, and how multiple filtered-analysis sections for different scopes are structured relative to the full-scope master section.

- **4.69e-i-d-iii — Saved filter name as the primary legibility shortcut:** Full exploration of the incentive design around filter naming — how the export UX surfaces the "name this filter" prompt, how the export quality visibly degrades for unnamed complex filters, and whether the game teaches filter naming as an explicit skill in the tutorial sequence.

- **4.69e-i-d-iv — Adversarial tag disclosure in exports:** Whether the player's `☠️ confirmed adversarial` tags appear in the exported footer when excluded opponents are listed; the opt-in export settings for including or hiding adversarial tags; potential consequences of tagging an opponent adversarially in a shared public artifact (metagame politics, dispute resolution).

- **4.69e-i-f — Comparative export: side-by-side full-scope + filtered in one PNG:** A dual-panel export format showing the full-scope analysis alongside the filtered analysis in a single image; designed specifically for the "the divergence is the story" use case; layout design, scaling, caption structure for the dual format; optimal Discord sharing aspect ratio.

---

## Summary

The export footer is a small design element with outsized consequences. Its job: make a filtered analysis legible to a reader who wasn't in the room when the filter was configured. The recommended design — the Layered Footer (Option E) — accomplishes this through three orthogonal mechanisms: the amber `[FILTERED]` badge for immediate signal, the scope line for factual record, and the optional player annotation for interpretive context. The critical insight is that named filters are the single most legible unit of filter description, and the export design should actively incentivize naming by rewarding it with compact, clean footer lines. Complex unnamed filters fall back to structured truncation. The footer is a figure caption, a citation, and a disclosure — all in one line.
