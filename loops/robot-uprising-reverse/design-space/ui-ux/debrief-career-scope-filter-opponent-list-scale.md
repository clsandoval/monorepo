# Opponent List Sorting and Search at Scale

**Aspect:** 4.69e-i-b — Opponent list sorting and search at scale: when a player has faced 50+ opponents, how does the By Opponent list scale? Sort by match count / alphabetical / adversarial signal strength / most recent match; search box; grouping tagged adversarial at top.

**Parent:** 4.69e-i — Match-scope filter UI design (debrief-career-analysis-scope-filter.md)
**Grandparent:** 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.69e-i-a (Sample size warning threshold); 4.69e-i-c (Filtered analysis data points in season health trend graph); 4.69e-i-d (Scope summary legibility in exports); 4.69e-i-e (Auto-filter suggestion engine)
**Related:** 4.69e-ii (Known adversarial opponent tagging); 4.69e-iii (Per-opponent threshold override); 4.68 (coverage % as season health); 4.69l (threshold recommendation engine)

---

## The Problem Being Solved

The career analysis scope filter's By Opponent section was designed with a modest opponent pool in mind — the ASCII diagram in the parent aspect shows 5-6 opponents in a fixed-height scrollable box. This works at the start of a career. It breaks down by mid-season.

**The scaling problem has three dimensions:**

1. **List length**: A dedicated ranked player might face 30+ distinct opponents per season. A long-term player across multiple seasons could accumulate 100-200+ distinct opponents in their career history. A static scrollable checklist of 150 names is not usable.

2. **Cognitive overhead**: At 12 opponents, the player can scan the list and identify the 1-2 they want to exclude. At 60 opponents, scanning is impossible. The player must *search* or *sort* to find what they need. Without affordances for this, the feature becomes unreachable for its most important users — long-term competitive players who need it most.

3. **Decision context**: At small scale, the player can hold every opponent's context in working memory ("Ravenhorn — that's the one I suspect, VoidEater — that's the one from the tournament"). At large scale, the player may not even remember which opponents they've flagged as adversarial without an explicit reminder in the list. The UI must surface relevant context at the point of decision.

**This aspect designs the solutions to all three dimensions.** It explores five distinct approaches to organizing the opponent list at scale, with detailed player journeys showing how each approach performs under realistic usage conditions.

---

## Background: When Does Scale Become a Problem?

Let's be specific about thresholds:

| Opponent Count | List Behavior | User Experience |
|---|---|---|
| 1-10 | Static scrollable list | Fine — glanceable |
| 11-20 | Longer scroll, still manageable | Slightly tedious, still usable |
| 21-40 | Scanning becomes laborious | Players start feeling friction |
| 41-60 | Scanning is impractical | Feature effectively broken without sorting |
| 61+ | Flat list is completely unusable | Feature unreachable without search |

The feature degrades well before it breaks. A player with 30 opponents and 5 adversarial suspects is already frustrated scrolling past 25 untagged names to find the ones they want to exclude. **The design must anticipate scale from day one, even if most players never reach it.** The affordances (sort controls, search box, grouping) should be present but unobtrusive at small scale, and essential at large scale.

---

## The Core Design Space: Five Approaches

### Approach A: "The Smart Default Sort" — Adversarial Signal Strength First

The list always sorts by a computed threat-relevance score. At the top: opponents whose matches most heavily influence the player's current cluster flags. At the bottom: opponents whose matches are low-influence.

**The default sort order:**
1. **Tagged adversarial** opponents (☠️ first, ⚠️ second)
2. **Untagged opponents sorted by adversarial signal strength** — highest cluster contribution percentage first
3. **Zero-contribution opponents** — alphabetical within this group, at the bottom

```
BY OPPONENT  [Sort: Threat Relevance ▾]  [🔍 Search]

☠️ VoidEater_Prime      8 matches   AS: 61%   [✓]
⚠️ Ravenhorn           12 matches   AS: 44%   [✓]
   Gx_Mako             5 matches   AS: 31%   [ ]
   Synthetix_7         9 matches   AS: 18%   [✓]
   ──────── below 5% contribution ────────
   PlayerXR99          3 matches   AS: 2%    [✓]
   blueshift_tactical  7 matches   AS: 1%    [✓]
   Koraxus             2 matches   AS: 0%    [✓]
   ... 47 more opponents (all <1% contribution)
```

**"AS"** = Adversarial Signal Strength percentage (how much of the top cluster candidate's coverage score comes from this opponent's matches).

**The separator line** divides high-signal from low-signal opponents. Below the separator is a collapsed section: "47 more opponents (all <1% contribution)." These opponents are included in the analysis by default (all checkboxes on) and can be toggled as a group: `[Exclude all low-signal opponents]`.

**Why this sort is the smart default:** The player investigating a cluster flag is almost always asking "which opponents are most responsible for this?" The threat-relevance sort answers that question before the player has to ask it. The high-signal opponents rise to the top; the player can focus attention there. The low-signal block can be dealt with as a unit rather than individually.

**Weakness:** The sort order is dynamic — it changes as the player adjusts checkboxes (removing an opponent from the active set shifts the adversarial signal strength of the remaining opponents). This means the list could reorder itself as the player interacts with it, which is disorienting. **Solution:** Sort locks to the initial state when the filter shelf opens. A "Refresh sort" button appears if the current filter differs significantly from the state at open time.

---

### Approach B: "The Priority Pinning Model" — Sticky Sections with Sort Controls

The list is divided into explicit sections, each section independently sortable:

```
BY OPPONENT  [Sort within section: Match count ▾]  [🔍 Search]

ADVERSARIAL (2)
  ☠️ VoidEater_Prime      8 matches   [ ]   ⊕
  ⚠️ Ravenhorn           12 matches   [ ]   ⊕

────────────────────────────────────────────────

ALL OTHERS (61)
  Gx_Mako              5 matches   [✓]   ⊕
  Synthetix_7          9 matches   [✓]   ⊕
  blueshift_tactical   7 matches   [✓]   ⊕
  PlayerXR99           3 matches   [✓]   ⊕
  Koraxus              2 matches   [✓]   ⊕
  ... [Show 56 more]
```

**Key behaviors:**
- The "ADVERSARIAL" section always pins to the top, regardless of sort order. This section is never collapsed — the player always sees who they've flagged.
- "ALL OTHERS" is initially collapsed to show the first 5 by the current sort. `[Show 56 more]` expands the full list.
- The sort control applies only within "ALL OTHERS" — adversarial opponents don't move.
- Batch controls: `[Uncheck all adversarial]` and `[Check all others]` are buttons in the section headers.

**Sort options for "ALL OTHERS":**
- **Match count (default):** Most-played opponents at top. Practical: the player has the most intuition about these opponents.
- **Adversarial signal strength:** High-influence opponents first. For investigation mode.
- **Most recent match:** Opponents you've played recently at top. For "current meta" analysis.
- **Alphabetical:** For players who know what they're looking for and just want to find it fast.
- **Win rate (ascending):** Opponents you lose to most often at top. For "diagnose my hardest opponents" use.

**Why this works:** Sections give the player a mental model of the list's structure before they've read a single name. "Tagged adversarial" and "everyone else" is a clean binary. The expand-to-show-more pattern is familiar from product UIs everywhere (GitHub file trees, email threads). The batch controls at section level mean the player can execute the common case ("exclude all adversarial, keep everyone else") in 2 clicks.

**Weakness:** Two-section structure may not cover all cases. What about "suspects but not confirmed"? The ⚠️ soft-tag and ☠️ hard-tag both live in "ADVERSARIAL," which conflates "might be poisoning" with "definitely poisoning." At large scales, a player might have 15 ⚠️ suspects and only 2 ☠️ confirmed — treating them identically at the section level may mislead.

**Variant B2: Three-Section Model**
```
CONFIRMED ADVERSARIAL (2)   ← ☠️ only
SUSPECTED (8)               ← ⚠️ only
ALL OTHERS (53)             ← untagged
```

Three sections adds decision clarity at the cost of visual complexity. Worth testing: at what suspect count does the two-section conflation become a real problem?

---

### Approach C: "The Search-First Model" — Live Search with Smart Defaults

Instead of organizing a long list, this approach makes the primary interaction **search**, with sorting as secondary.

```
BY OPPONENT  [🔍 Search opponents...]

No filter active — showing top matches by influence:
  ☠️ VoidEater_Prime   8M  61%AS   [ ]
  ⚠️ Ravenhorn        12M  44%AS   [✓]
     Gx_Mako           5M  31%AS   [ ]
     Synthetix_7       9M  18%AS   [✓]
  ... 59 more · [Show all]

Type to filter by opponent name ↑
```

When idle (no search query), the list shows the top 4-5 opponents by adversarial signal strength, with a "59 more" count. This is the **discovery view**: enough to catch the most important opponents without overwhelming the player.

When the player types, the list filters live:
```
BY OPPONENT  [🔍 void                  ✕]

  ☠️ VoidEater_Prime   8M  61%AS   [ ]
  VoidLance_9          2M   0%AS   [✓]
```

Fuzzy matching: typing "void" surfaces any opponent whose name contains "void" (case-insensitive). The match is highlighted: **Void**EaterPrime.

**Why search-first works at extreme scale:** At 150+ opponents, most of the list is irrelevant noise. The player almost always knows *which* opponent they're targeting — they have a name in mind, or a partial name. Search reduces a 150-item scanning problem to a 2-keystroke interaction. The idle state (top N by influence) covers the discovery case — "show me who's most influencing my analysis right now."

**Weakness:** Search-first assumes the player knows or can guess the name they're looking for. For a player who thinks "I want to exclude the opponent I played last Tuesday" — they may not remember the username. The "most recent match" sort order fills this gap, but it requires the player to know to switch to that sort.

**Critical detail — checkbox state persistence during search:** When the player types to filter the list, the checkboxes of all non-displayed opponents must retain their state. If the player unchecks VoidEater_Prime, then searches for "raven" and unchecks Ravenhorn, then clears the search — both unchecks must persist. The match counter at the bottom of the filter shelf reflects the combined effect of all unchecks, including ones made while other opponents were filtered out of view.

```
[🔍 raven                  ✕]       147/247 matches
(89 more opponents not shown — 2 checked items hidden by search)
```

The "(2 checked items hidden by search)" note is essential — it tells the player "your current search is hiding some items that affect the match count."

---

### Approach D: "The Faceted Filter Chips" — Tag-Based Multi-Select Filtering

Rather than a sorted list, the opponent selection becomes a chip-based multi-select tag interface:

```
BY OPPONENT
┌──────────────────────────────────────────────────────────┐
│ Excluding: [☠️ VoidEater_Prime ✕] [⚠️ Ravenhorn ✕]       │
│                                         [+ Add exclusion] │
└──────────────────────────────────────────────────────────┘
```

**Default state:** "All opponents included" with no chips. The box is mostly empty.
**Adding an exclusion:** Click `[+ Add exclusion]` → a dropdown appears, searchable, listing all opponents. The player selects one → a chip appears in the box.
**Removing an exclusion:** Click the `✕` on a chip → opponent is re-included.

**Batch chip actions:**
- `[Exclude all ☠️]` → auto-creates chips for all confirmed adversarial opponents
- `[Exclude all ⚠️]` → auto-creates chips for all suspected adversarial opponents
- `[Exclude all adversarial]` → both of the above in one click

**Why this approach works for the power case:** Chips are visually compact — 10 chips fit in a box that would need 10 rows as a checklist. The chip representation makes the *current exclusion set* immediately legible without requiring the player to scan a long list looking for unchecked boxes. The exclusion state is the first-class information; inclusion is the default and implicit.

**Why this approach is problematic for discovery:** A player who doesn't know who to exclude can't use this interface to discover candidates — they'd have to open the dropdown and scan an unsorted list to identify opponents with high adversarial signal strength. The chip model works when the player knows their targets; it fails when they're investigating.

**Hybrid D2: Chips + Companion Panel**

The chip interface is combined with a small companion panel:

```
BY OPPONENT
┌──────────────────────────────────────────────────────────┐
│ Excluding: [☠️ VoidEater_Prime ✕] [⚠️ Ravenhorn ✕]       │
│                                         [+ Add exclusion] │
└──────────────────────────────────────────────────────────┘

TOP INFLUENCE (for discovery):
  Gx_Mako   5M  31%AS   [+ Exclude]
  Synthetix  9M  18%AS   [+ Exclude]
```

The companion panel shows the top 3-4 non-excluded opponents by adversarial signal strength. If the player wants to investigate further, `[+ Exclude]` adds a chip. This is the best of both worlds: chips for the known case, companion panel for discovery.

---

### Approach E: "The Inline Sort Matrix" — Spreadsheet-Style Sortable Columns

The opponent list becomes a mini-spreadsheet with sortable columns:

```
BY OPPONENT  [🔍 Search]                         [Batch ▾]

NAME ▲               MATCHES   AS%    WIN%   LAST     ☑
──────────────────────────────────────────────────────────
☠️ VoidEater_Prime      8      61%    25%   3d ago    □
⚠️ Ravenhorn           12      44%    42%   1w ago    □
   Gx_Mako              5      31%    60%   2w ago    ✓
   Synthetix_7          9      18%    44%   5d ago    ✓
   blueshift_tactical   7       1%    57%   3w ago    ✓
   PlayerXR99           3       0%    33%   1mo ago   ✓
```

Column headers are clickable sort controls:
- **NAME**: alphabetical A-Z / Z-A
- **MATCHES**: match count descending / ascending
- **AS%**: adversarial signal strength descending / ascending
- **WIN%**: win rate ascending (best diagnostic: sort by most-losing opponents)
- **LAST**: most recent match first / least recent first

The rightmost column is the checkbox (include/exclude). **The checkboxes are the last column** — the player scans left-to-right, reads all context, then makes the include/exclude decision at the right edge.

**Why this approach is powerful:** It exposes the most information per row of any approach. A veteran player can sort by AS%, see which opponents are driving their cluster flags, sort by WIN% to cross-reference (maybe the high-AS% opponents are also the ones they lose to — structural weakness vs. adversarial targeting disambiguation), sort by LAST to see if recent opponents are skewing results.

**Why this approach is dangerous for new players:** A spreadsheet-style interface with 4 sortable columns looks like an enterprise dashboard. New players who open the filter shelf for the first time should see checkboxes, not a data grid. The cognitive overhead of "what is AS%?" before the player even starts filtering is a friction point.

**Mitigation:** Default column set is NAME + MATCHES + ☑ only. The AS%, WIN%, and LAST columns are hidden by default and must be added via `[Columns +]` button. Players discover them when they're ready.

---

## The Recommended Hybrid: "Layered Complexity"

No single approach is optimal for all player types and all scales. The recommended design layers complexity:

### Layer 1: Default Appearance (≤20 opponents)

The By Opponent box looks like the original parent design — a simple sorted-by-match-count scrollable checklist with `⊕ details` available on each row. No sort controls visible. No search box visible (the list is short enough that scanning is fast). Adversarial-tagged opponents have their icons (☠️/⚠️) but are not separated into a distinct section.

**Why:** At low opponent count, complexity controls add visual noise without adding value. The simple checklist is legible and fast.

### Layer 2: Sort Controls Appear (21-40 opponents)

When the player's opponent count crosses 20, the sort control `[Sort: Match count ▾]` appears at the top of the box. The search box also appears. The list now shows:
1. Tagged adversarial opponents (sticky pinned at top, always visible)
2. Remaining opponents sorted by the active sort

The section separation between "adversarial" and "others" is added automatically — it's present even if there are no tagged opponents, but the "ADVERSARIAL (0)" section header is omitted if the section is empty.

**Why:** 21+ opponents is the inflection point where scanning becomes noticeably tedious. Sort controls solve the "I know what I'm looking for but can't find it" problem. Pinned adversarial section solves the "I always want to see my suspects first" use case without requiring configuration.

### Layer 3: Collapsed "Tail" Appears (41-60 opponents)

When opponent count crosses 40, the bottom of the list gains a collapsed "tail" section:

```
   PlayerXR99          3 matches   AS: 2%    [✓]
   blueshift_tactical  7 matches   AS: 1%    [✓]
   ─────────────────────────────────────────────
   [+ Show 22 more opponents (all ≤1% adversarial signal)]
```

The tail is collapsed by default and batch-checked (all included). The player almost never needs to interact with opponents in the tail — they have negligible influence on the analysis. Collapsing them reduces visual noise without hiding anything important.

Expanding the tail shows the full list with reduced visual weight — slightly smaller text, slightly reduced row height.

**Why:** The tail is the "everything else" category. Most players' careers include dozens of opponents they've played once or twice in a training match or low-stakes round. These opponents are analytically irrelevant but clutter the list. The tail collapse removes the clutter while preserving access.

### Layer 4: Search Box Activates Auto-Suggest (61+ opponents)

At 60+ opponents, the search box activates a **name auto-suggest** feature:

```
[🔍 void               ]
  Suggestions:
    ☠️ VoidEater_Prime  8 matches  61%AS
       VoidLance_9     2 matches   0%AS
```

Suggestions include match count and AS% — enough context to identify the right opponent without requiring the player to expand the `⊕ details` panel. The suggestions are sorted by AS% (most influential first), not alphabetically.

**Why:** At 60+ opponents, search is now the primary navigation pattern. Auto-suggest with match count and AS% accelerates the workflow from "type-select-check" to a fluid two-keystroke interaction.

---

## Virtualization: The Technical Prerequisite

At 100+ opponents, the list must use **virtual scrolling** — rendering only the visible rows in the DOM and recycling them as the player scrolls. Without virtualization, mounting 150 checkboxes with their `⊕ details` sub-panels will cause noticeable lag on first open.

**Implementation note:** The opponent list is inside the filter shelf which animates open. Virtualization must initialize correctly during the slide-down animation — the rendered list height must be correct before the animation starts, so the filter shelf animates to the right final height even though most rows aren't mounted yet.

**Practical threshold:** React virtual scrolling libraries (react-window, react-virtual) can handle lists of 10,000+ items trivially. The concern is not performance but correctness: checkbox states, expanded sub-panels, and scroll position must all be preserved correctly across virtualized render cycles.

---

## Player Journeys

### Journey: Olyander, 31, Deep Season Veteran, 89 Opponents in Career

**Context:** Olyander has been playing Robot Uprising competitively for 18 months across 6 seasons. They have 89 distinct opponents in their career history, 4 confirmed adversarial (☠️) and 11 suspected (⚠️). They're opening career analysis after a bad week — RELAY-C cluster is back and they want to investigate.

**Minute 0:00 — Opening the Filter Shelf**
Olyander opens career analysis. RELAY-C cluster flag is active at 58% combined coverage. They've been here before. They click the filter shelf toggle. The shelf slides down, but this time it's different from months ago — they have 89 opponents and the list is organized into three distinct sections: "CONFIRMED ADVERSARIAL (4)" at top, "SUSPECTED (11)" below, then "ALL OTHERS" collapsed to a `[Show 74 more]` row at the bottom.

The CONFIRMED ADVERSARIAL section is pre-unchecked — their saved default filter excludes all confirmed adversarial opponents. Olyander glances at the match counter: `814/1,147 matches`. The default exclusion is already reducing the corpus by 29%.

**Minute 0:20 — Checking the Suspect Section**
The cluster came back this week. Olyander looks at the SUSPECTED section. Two names there have AS% values they don't remember seeing so high: `⚠️ NullTerminator_X  9 matches  38%AS`. That number wasn't 38% last week — NullTerminator_X has played them 4 times in the last week, all targeting RELAY-C.

Olyander opens the `⊕ details` on NullTerminator_X. The sub-panel shows: "Recent: 4 of 9 matches in last 7 days. Adversarial signal strength: 38% (up from 12% last week)." A new button appears: `[Upgrade to ☠️ Confirmed]`.

**Minute 0:35 — Upgrading the Tag and Re-running**
Olyander clicks `[Upgrade to ☠️ Confirmed]`. NullTerminator_X moves from the SUSPECTED section to CONFIRMED ADVERSARIAL, and the auto-saved "Excluding all adversarial" filter updates to include them. Match counter ticks: `814 → 768 matches`. They click `[Run Analysis]`. Result: RELAY-C cluster collapses from 58% to 22% — now in "directional concern" territory, not "critical." STRIKER-A emerges as the real top candidate at 19%.

**Minute 1:00 — Post-Investigation**
Olyander looks at the SUSPECTED section — 10 remaining. They sort it by AS%: the top remaining suspect has 14%AS. Nothing alarming. The investigation is done: the cluster was real adversarial targeting by NullTerminator_X who figured out their weak point after enough matches.

Olyander adds a note in the `⊕ details` sub-panel: "Week of March 14 — confirmed adversarial, 4x targeted RELAY-C hook threshold." They close the filter shelf. The amber header band remains on the result — a persistent reminder that what they're looking at excludes 5 opponents.

**UI Annotations:**
- Section headers: pill-style labels (dark background, medium font-weight) pinned to the top of each section. "CONFIRMED ADVERSARIAL" uses a red-tinged dark background. "SUSPECTED" uses an amber-tinged dark background. "ALL OTHERS" uses the default dark background.
- AS% column: appears only when opponent count exceeds 20. Shows as a numeric column right-aligned next to match count. No color coding at this level — just a number.
- `[Upgrade to ☠️ Confirmed]` button: appears in the `⊕ details` sub-panel only for ⚠️-tagged opponents. For untagged opponents the sub-panel shows `[Mark as suspect ⚠️]` and `[Mark as confirmed ☠️]` as separate buttons.
- Note field in `⊕ details`: a small free-text textarea, plain text, 200-character max. Persists to localStorage keyed on opponent identifier. Appears in the history log when that opponent is mentioned.

---

### Journey: Tessara, 22, Three-Season Player, 43 Opponents, First Time Experiencing Sorting

**Context:** Tessara is in their third season with 43 opponents accumulated. They've never used the filter shelf for anything beyond "exclude my one known adversarial opponent." Tonight they're trying to understand if their config performance differs against fast-aggro players vs. methodical players — they want to group opponents manually and see the segmented analysis.

**Minute 0:00 — Noticing the Sort Control for the First Time**
Tessara opens the filter shelf. They notice for the first time that there's a sort dropdown they've never clicked. The list defaults to "Sort: Match count ▾" and shows their 43 opponents split into: 1 confirmed adversarial (pre-excluded by saved default), 3 suspected (included but flagged), 39 others.

Tessara is trying to answer "who are my fast-aggro opponents?" They scroll through the ALL OTHERS section. There's no "playstyle" tag — the game doesn't know if an opponent is fast-aggro, it knows their match history. Tessara thinks for a moment, then clicks the sort dropdown.

**Minute 0:20 — Exploring Sort Options**
Sort options: Match count (active), Adversarial Signal Strength, Most Recent Match, Win Rate (ascending), Alphabetical.

Tessara tries "Win Rate ascending" — opponents they lose to most appear at top. Interesting but not exactly what they want. They try "Most Recent Match" — opponents from this week appear at top. They recognize the names: the fast-aggro players they've been matched against in the past 10 days are all clustered at the top of this sort. That's usable.

Tessara manually selects the 6 opponents they remember as fast-aggro style by unchecking all the slow/methodical ones. This is tedious — 37 manual unchecks. They realize there's a faster way: batch controls.

**Minute 0:50 — Discovering Batch Controls**
In the ALL OTHERS section header, there's a small `[Batch ▾]` button Tessara hasn't noticed before. Clicking it opens a small menu:
- Check all in this section
- Uncheck all in this section
- Invert selection in this section

Tessara clicks "Uncheck all in this section." All 39 "OTHER" opponents are now excluded. Match counter: `523/1,247 matches → 86 matches`. Now Tessara re-checks the 6 fast-aggro opponents they want. Match counter climbs back to `152 matches`. Good enough.

**Minute 1:15 — Running the Segmented Analysis**
Tessara runs the analysis on just those 6 opponents. Result saved as "Fast-aggro opponents only." Then unchecks those 6, re-checks a different 8 methodical players, runs again, saves as "Methodical opponents." Side-by-side comparison shows completely different top candidates — STRIKER-A for fast-aggro, SCOUT-B for methodical.

[Tessara realizes their career analysis has been averaging together two completely different meta-styles. The filter tool just told them they have two different config problems, not one.]

**UI Annotations:**
- `[Batch ▾]` button: appears in section headers only at 21+ opponents. Icon is a stacked checklist icon. Small button, right-aligned in the section header row.
- "Invert selection" batch option: available only in the ALL OTHERS section (inverting adversarial sections would create confusion). Inverts ALL checkboxes in the section, not just visible ones.
- Saved filter modal: when the opponent count is non-round (e.g., exactly 6 opponents selected), the auto-populated save name includes the actual opponent count: "6 opponents, filtered." Player can rename to "Fast-aggro opponents only."
- Match counter animation: when batch operations change many checkboxes simultaneously, the counter animates as a number roll through intermediate values at 4x speed — making the magnitude of the batch operation visceral.

---

### Journey: Mireya, 16, New Player, 8 Opponents, Layer 1 Experience

**Context:** Mireya is a new player in their first competitive season. They have 8 opponents in their career history. One of them — a player named Axiom_Strike — has been confusing them because their career analysis keeps flagging RELAY-C as a cluster even though they feel like RELAY-C works fine in most matches. They've never used the filter shelf before.

**Minute 0:00 — Opening the Filter Shelf**
Mireya opens career analysis. Cluster warning on RELAY-C. They've heard from a community guide that the filter shelf can help investigate. They click the filter shelf toggle. The shelf slides down.

The By Opponent list looks simple: 8 checkboxes, names, and match counts. No section headers (not enough opponents). No sort controls. No search box. Just a clean list.

```
[✓] CrimsonTide          7 matches   ⊕
[✓] Axiom_Strike         6 matches   ⊕
[✓] grayfield_nine       4 matches   ⊕
[✓] techno_siege         3 matches   ⊕
[✓] Volkov_87            2 matches   ⊕
[✓] the_real_null        2 matches   ⊕
[✓] orbit_disruptor      1 match     ⊕
[✓] Xen_Paradox          1 match     ⊕
```

Mireya sees 8 names. They look for Axiom_Strike — second on the list (6 matches). They click `⊕` on Axiom_Strike.

**Minute 0:30 — Sub-Panel for Axiom_Strike**
Sub-panel: "6 matches · 1 win / 5 losses · Adversarial signal strength: 67%."

The AS% tooltip says: "Above 60% — high probability that this opponent's matches are specifically stressing one element of your config. Running career analysis without this opponent's matches will show a more accurate picture of your structural health."

There's no "upgrade to confirmed" button (no ⚠️ tag exists yet) — just `[Mark as suspect ⚠️]` and `[Mark as confirmed adversarial ☠️]` and `[Exclude from this analysis]`.

Mireya clicks `[Exclude from this analysis]`. The checkbox unchecks. Match counter: `26 → 20 matches` (they've only played 26 total). A sample size warning appears: "20 matches — Directional zone (unreliable for cluster detection)."

Mireya runs the analysis anyway. RELAY-C cluster disappears. Top candidate is STRIKER-A at 14% coverage — low and not critical.

[Mireya has discovered that Axiom_Strike's targeting was a distraction. The config is fine. But they also notice the "Directional zone" warning — they know the result isn't definitive. They make a note to play more matches before drawing conclusions.]

**UI Annotations:**
- No sort controls at 8 opponents: the component renders in its "compact mode." The sort dropdown is hidden in the component's configuration object — it activates automatically when `opponentCount > 20`.
- `[Exclude from this analysis]` button in sub-panel: a temporary alternative to the full tagging system. Adds the opponent to the "for this session only" exclusion list without persisting any tag. Useful for quick investigation without committing to a tag.
- AS% tooltip at small pool: when opponent count is below 20, the AS% threshold tooltips use more cautious language: "With fewer than 20 opponents, adversarial signal strength is less reliable. Consider this number as a starting point for investigation."
- Interface progression: Mireya's experience at 8 opponents is the clean, simple version of the interface. The complexity is hidden. As their career grows, the complexity will reveal itself incrementally — they will never face a "complexity cliff" where the interface suddenly seems unfamiliar.

---

## Strengths and Weaknesses of the Layered Hybrid

### Strengths

**Zero-configuration at small scale.** Players with 8 opponents see a simple checklist. Players with 40 opponents see a sort dropdown and section headers. Players with 100 opponents see search and a collapsed tail. The interface self-organizes based on data density — the player never has to learn a complex system all at once.

**Sort by adversarial signal strength is the power feature.** Most filter UIs sort alphabetically because that's what product managers reach for. Sorting by "which opponent is most influencing my current cluster flag" is specific to this game's use case and genuinely valuable. It surfaces the most actionable information without requiring the player to already know who to look for.

**Batch controls save the "manual segmentation" use case.** Tessara's journey — "uncheck all, recheck a subset" — is an important advanced use case that becomes unusable at 40+ opponents without batch controls. Providing them in the section headers means they're discoverable but not prominent.

**Tags are the sticky anchor.** Across all approaches, the common thread is: tagged opponents (☠️/⚠️) are always visible first. Tags are the player's own annotations of which opponents matter. Pinning tagged opponents means that as the list grows, the player's prior knowledge is always in view without requiring them to search for it.

### Weaknesses

**Search by name requires the player to know the name.** The search-first model breaks down for "I want to find that opponent from last Tuesday whose username I can't remember." Sort by "Most Recent Match" is the partial fix, but this case reveals a gap: there's no "search by recent match date" or "search by win rate" — only by name.

**AS% is computed relative to the full-scope analysis, not the active filter state.** When the player is already filtering (e.g., Quick assault only), the AS% shown on each opponent is computed against the full career, not the filtered set. This can mislead: an opponent who only ever played Standard scenarios has 0% contribution to Quick-assault-filtered analyses, but their AS% shows their full-career contribution. A "contextual AS%" — computed against the current filter state — would be more accurate but expensive to compute live.

**Collapsed tail creates false security.** Hiding 74 opponents in a "Show 74 more" collapsed section communicates "these are safe to ignore." But the tail is collapsed based on AS% in the current active cluster — if the player is investigating a different element than RELAY-C, the AS% ordering changes and different opponents belong in the tail. The tail is element-specific, not player-specific.

**Tag system is pre-requisite.** The "ADVERSARIAL CONFIRMED / SUSPECTED / OTHERS" three-section design assumes the player has already engaged with the tagging system (4.69e-ii). New players with no tags see a flat list with no sections — the organizing principle doesn't exist yet. The UI must degrade gracefully when the tag system hasn't been used.

---

## Interaction Effects

**4.69e-ii (Known adversarial opponent tagging):** This aspect defines what the tags mean and how they're created; 4.69e-i-b defines how tagged opponents are displayed and organized in the filter shelf. The two are tightly coupled: the three-section model in this design requires the ☠️/⚠️ tagging system to exist and be populated. If tagging is never used, the section structure collapses to a flat sorted list.

**4.69e-i-a (Sample size warning threshold):** The collapsed tail ("74 more opponents, all ≤1% AS") essentially batch-includes a large number of opponents. When the tail is expanded and the player unchecks some of those tail opponents, the match counter drops and may trigger the sample size warning. The tail collapse must not obscure the sample size implications of including/excluding bulk opponents.

**4.69e-iii (Per-opponent threshold override):** If the player has set a custom multi-cluster threshold for a specific opponent, that fact should be surfaced in the `⊕ details` sub-panel. Something like "Custom threshold: RELAY-C cluster fires at N=2 for this opponent (global: N=3)." This creates a richer per-opponent detail view.

**4.69e-i-c (Filtered analysis data points in season health graph):** The opponent sort by "most recent match" is complementary to the season health trend graph — both are about time-based views of career analysis. A player sorting by "most recent" in the filter shelf and noticing a cluster of recent opponents with high AS% is the investigation that precedes filtering to "last 30 days only" in the season health graph.

**4.69l (Threshold recommendation engine):** The recommendation engine analyzes dismissal patterns across career analyses. An enhanced version could also analyze *filter patterns* — "you always exclude the same 4 opponents when investigating cluster flags; consider permanently tagging them as adversarial." This turns the filter shelf's usage history into a signal for the recommendation engine.

**4.69g (Agent cluster as a unit of analysis in career stats):** The opponent list in the filter shelf currently shows AS% relative to the *top cluster candidate*. If the player is navigating from the agent cluster career stats view, the AS% shown should be relative to the specific agent whose stats they were examining — contextual AS% rather than generic AS%. This requires the filter shelf to know the "currently investigated agent" context when it opens.

---

## Comparable Systems

**Riot Games' League of Legends match history filter**: LoL's match history allows filtering by champion, position, queue type, and date range. At 500+ games, the game uses server-side filtering — typing a champion name triggers a search request. The autocomplete returns champion names fuzzy-matched with match counts ("AATROX — 12 games"). The Robot Uprising filter shelf operates on local data (career is smaller than LoL seasons), so client-side filtering is feasible, but the LoL model shows how the UX should feel: instant, local, contextual result counts.

**Steam's friend list search**: Steam's friend search — a text input that filters a potentially-large list of friends live as you type — is the canonical example of search-first at scale for a list of named entities. The implementation is trivial but the UX convention is universal: everyone knows how to type in a search box to narrow a list. No tutorial required.

**Slay the Spire's relic filter in modded play**: In heavily modded Slay the Spire, the relic and card pool grows to hundreds of items. The community-standard ModTheSpire UI adds a search box to the relic reward screen. The game's base UI has no search and becomes unusable with large mod sets — a cautionary tale about list UIs designed for bounded sets that get unbounded by power users. Robot Uprising's opponent pool could grow similarly if seasons are long.

**Fantasy sports "player picker" UI**: Fantasy sports apps — DraftKings, FanDuel, Yahoo Fantasy — have the most-refined "pick from a large named list" UIs in consumer apps. The standard pattern: search box at top, sort controls as column headers, filters as chips above the list, the active sort column highlighted, rows selectable with a single click. The full spreadsheet model (Approach E) is essentially the fantasy sports player picker adapted to opponents. Players who use fantasy apps will find this paradigm instantly familiar.

**Anki deck browser**: Anki's card browser for large decks uses a combination of search (live-filter as you type), sort (click column headers), and batch operations (select all, tag selected, suspend selected). The batch operation paradigm — select a subset, perform an action on all of them — is directly applicable to the batch-include/batch-exclude pattern in the opponent list.

---

## Sensory Description

At 8 opponents, the By Opponent list is **intimate** — you can see everyone at once. The checkboxes are large, responsive, satisfying to toggle (a tactile tick sound, a brief flash of the row when state changes). It feels like reviewing a small roster.

At 43 opponents, the list gains **structure**. The section headers appear — "CONFIRMED ADVERSARIAL" glows faint red-amber, "SUSPECTED" glows faint amber, "ALL OTHERS" is dark neutral. The sections feel like labeled drawers in a filing cabinet. The sort dropdown adds a subtle shelf-organization metaphor — you can feel the list reorganizing when you change the sort, rows smoothly reordering in a 300ms stagger animation (each row slides to its new position in sequence, with a slight elastic overshoot).

At 89 opponents, the list feels like **intelligence work**. The search box at top has a slightly cooler visual treatment — a thin blue outline when focused, suggesting "you're querying a database now, not scanning a list." The collapsed tail at the bottom communicates depth: there's a lot down there, but it's below the level of concern. The `[Show 74 more]` row has a subtle downward-pointing gradient before it, like the beginning of a depth cue.

The sort transition animation: when the player changes sort order, rows glide to their new positions. The row moving the most distance (from the bottom of the list to the top, because it was low by match count but high by AS%) travels the longest — a smooth arc, a bright flash of amber on arrival. "This is the one the new sort says matters most." The animation is the data made visceral.

The batch "Uncheck all" operation: all checkboxes deactivate simultaneously with a brief desaturating ripple across the list (each row flickers to a lighter, inactive state in a 50ms rolling wave). The match counter drops to zero in a quick roll animation. Then as the player re-checks individual opponents, each re-check produces a brightening flash on the row and a small increment of the match counter. The interface gives the sense of selecting from a dark background.

**The TikTok clip:** A player opens career analysis on a 100+ opponent career. The cluster flag is screaming. They open the filter shelf, and instead of a long scrollable checklist, the first thing visible is: "☠️ CONFIRMED ADVERSARIAL (3)" — three opponents, pre-excluded by their saved default. They click the sort dropdown, switch to "Adversarial Signal Strength." One opponent at the top of the SUSPECTED section has 71% AS%. They weren't in the confirmed list yet. The player opens their sub-panel: "4 of 4 this week. Every single match targeting RELAY-C." They click `[Upgrade to ☠️ Confirmed]`. The cluster flag collapses. "They were targeting me the whole time and I didn't see it."

---

## Newly Discovered Aspects

Designing the opponent list at scale surfaces several design sub-questions:

- **4.69e-i-b-i — Cross-filter AS% computation**: adversarial signal strength shown in the opponent list is currently computed against the full-scope analysis. When the player has an active scenario-type filter (e.g., Quick assault only), AS% should ideally be computed against the filtered set. But this requires computing AS% live as filter axes change, which has performance implications. Design options: (1) always full-scope AS%, labeled as such; (2) compute contextual AS% with a loading state; (3) show both.

- **4.69e-i-b-ii — Opponent disambiguation for repeated usernames**: competitive games often have players who change usernames, or different players with similar names. The career analysis history is keyed on some opponent identifier (UID?). What happens when a player appears in the list with a name the player doesn't recognize because they renamed? Design of the display name vs. historical name vs. UID in the opponent list.

- **4.69e-i-b-iii — Bulk re-tag from the opponent list**: a player who wants to tag all opponents with AS% > 30% as "suspected adversarial" can't do this from the filter shelf — they'd have to open each `⊕ details` sub-panel and tag individually. A "Tag all above threshold" batch operation in the sort/batch controls would accelerate this workflow. Design of the batch tagging affordance and the threshold input.

- **4.69e-i-b-iv — Opponent notes in the filter shelf list view**: the `⊕ details` sub-panel includes a note field. If a player has written a note ("Week of March 14 — deliberate RELAY-C targeting"), should a truncated version of this note appear inline in the list row? A one-line note preview would give context without opening the sub-panel. Design of the note preview in the compact list row.

- **4.69e-i-b-v — History of opponent AS% over time**: the `⊕ details` sub-panel shows current AS%. But an opponent's adversarial contribution might have spiked recently (new targeting strategy) or declined (they moved on). A small sparkline in the sub-panel showing AS% trend over the last 4 weeks — "this number was 8% three weeks ago, 38% now" — would distinguish sustained adversarial targeting from an anomalous week.
