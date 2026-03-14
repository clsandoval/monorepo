# Tag Evidence Export for Community Discussion

**Aspect:** 4.69e-x — Tag evidence export for community discussion: shareable artifact showing match-source breakdown, preview, and tagging rationale without revealing opponent identity; enables community discussion of "when should I tag?" as a learnable skill; interaction with necropsy culture (7.10) and Opus Magnum histogram sharing (1.03)

**Parent:** 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.69e-ix — Adversarial tag as community signal; 4.69e-ii — Known adversarial opponent tagging; 4.69e-viii — Tag expiry and automatic sunset; 4.69e-v — Adversarial density as career season metric (APS)
**Related:** 7.10 — Necropsy culture; 1.03 — Opus Magnum histogram/GIF sharing; 1.06c — Async PvP; 1.04g — Live win-rate as persistent identity; Spotify Wrapped; VALORANT SNAP//SHOT; Lichess shareable analysis URLs; Chess.com PGN export

---

## The Core Design Problem

Adversarial tagging (4.69e-ii) is a private diagnostic act. A player examines their career analysis, identifies an opponent whose match concentration distorts cluster diagnostics, and tags them. The community signal layer (4.69e-ix) aggregates tag counts across the bracket. But neither system helps players learn *when tagging is appropriate* — the diagnostic reasoning behind the act.

**The evidence export asks: what if a player could share the evidence behind their tagging decision?**

This transforms adversarial diagnosis from a solitary skill into a communally learnable one. A veteran who tags carefully can show their work. A newcomer who sees "⚑ 14 players tagged this opponent" can find a shared breakdown explaining *why*. The community develops shared vocabulary for distinguishing adversarial targeting from legitimate strategy, aggressive-but-fair play from bracket manipulation.

But the moment you let players export match-source breakdowns, you create a privacy minefield. The breakdown identifies specific opponents by name, shows their match frequency, reveals which agent configurations they used. An "evidence export" without privacy controls is a dossier — a weapon for public shaming, witch hunts, and coordinated harassment.

**The design tension: maximum diagnostic transparency vs. opponent privacy.**

### Why This Matters Beyond Tagging

Evidence export isn't just about adversarial tags. It establishes a broader pattern: **how does Robot Uprising handle shareable analytical artifacts?** The same infrastructure that exports tag evidence could export:

- Post-match debrief snapshots ("look at this incredible hook cascade at tick 47")
- Career analysis cluster maps ("my RELAY-C cluster is cursed, help me diagnose")
- Configuration blueprints ("here's my scout setup, feedback welcome")
- Inspector timeline moments ("watch how my relay's buffer fills and evicts at tick 23-31")

The tag evidence export is the hardest case — it involves another player's identity and behavior. If the privacy model works here, it works everywhere.

---

## The Comparable Systems

### Opus Magnum: GIF Export as Shareable Artifact

Zach Barth designed GIF export as a first-class feature — explicitly to let players share their clockwork machines. The artifact is *the solution itself*, rendered as a looping animation. There is no privacy concern because Opus Magnum is single-player: the artifact contains only the sharer's work.

**Key design insight:** The GIF is self-contained. You don't need to own Opus Magnum to appreciate a GIF of an elegant machine. The artifact communicates its value without requiring the viewer to understand the game's systems. A beautiful clockwork loop is beautiful to anyone.

**Lesson for Robot Uprising:** The evidence export must be legible to viewers who haven't examined the specific match. A match-source breakdown chart, stripped of context, is meaningless to a casual observer. The artifact needs enough narrative scaffolding to tell a story: "This opponent appeared in 78% of my cluster's matches. Here's what my cluster looks like with them. Here's what it looks like without them."

### Lichess: Shareable Analysis URLs

Lichess generates a public URL for any game analysis. The URL leads to an interactive board where anyone can step through moves, see computer evaluation, and read annotations. Both players' names are visible (games are public by default on Lichess). The analysis can be forked into a "study" for collaborative annotation.

**Key design insight:** The sharing is frictionless — one click generates a URL. The analysis is interactive, not a static image. Viewers can explore at their own pace. The URL is persistent; it doesn't expire.

**Privacy model:** On Lichess, all rated games are public. Players accept this when they create an account. There is no expectation of match privacy. This is a fundamentally different context from Robot Uprising, where career analysis data is personal and diagnostic.

**Lesson for Robot Uprising:** Frictionless sharing drives adoption. But the privacy context demands friction — the export must strip or anonymize opponent identity before generating a shareable artifact.

### VALORANT SNAP//SHOT: First-Party Shareable Stats Card

Riot's SNAP//SHOT generates downloadable images or short videos of a player's ranked stats. The artifact includes most-played agent, best map, K/D ratio, damage per round, win rate, and headshot accuracy. Available in landscape and portrait formats for social media.

**Key design insight:** SNAP//SHOT is about *self-expression*, not evidence. The player shares their own performance data — there's no opponent identification. The artifact is designed for social media virality: square format for Instagram, vertical for TikTok stories, landscape for Twitter.

**Privacy model:** SNAP//SHOT contains only the sharer's data. No opponent names, no match-specific details. It's a summary, not an investigation.

**Lesson for Robot Uprising:** The "stats card" format is powerful for social sharing but insufficient for diagnostic evidence. A tag evidence export needs to show the *relationship between the tagger and the tagged opponent's match patterns* — which inherently involves information about another player.

### Spotify Wrapped: Gamified Data Sharing

Spotify Wrapped turns a year of listening data into a shareable visual narrative. The genius is the reframing: data collection (surveillance) becomes self-expression (identity). Players voluntarily share what would otherwise be private behavioral data because Wrapped makes it feel like a personality test result.

**Key design insight:** Wrapped works because it's *about the sharer*. "I was in the top 0.5% of Taylor Swift listeners" is about your identity, not Taylor Swift's. The data is personal even though it's relative.

**The privacy paradox:** Spotify normalized surveillance-as-entertainment. Digital rights advocates call it "marketing surveillance as fun." The tag evidence export faces the same tension — it gamifies the act of analyzing another player's behavior and sharing that analysis publicly.

**Lesson for Robot Uprising:** Frame the export around the sharer's diagnostic experience, not the opponent's behavior. "My cluster analysis showed this pattern" rather than "This opponent did this." The subject of the story is the tagger's analytical process, not the tagged opponent's actions.

### Chess.com PGN Export with Analysis

Chess.com lets players export game records (PGN files) with either personal annotations or computer analysis. The export is a structured data format that any chess software can read. The export includes both players' names and the complete move history.

**Key design insight:** The PGN is a technical format designed for interoperability, not social sharing. It serves analytical communities (chess study groups, coaching, tournament review) rather than casual social media.

**Privacy model:** Both players' usernames are included. Games are semi-public — they appear in each player's game archive. The export doesn't add new exposure; the game was already accessible.

**Lesson for Robot Uprising:** The analytical community (necropsy culture) may prefer structured data exports over visual cards. A JSON or structured format that career analysis tools can ingest enables deeper collaborative analysis. But this also increases the risk of automated surveillance — scrapers that aggregate evidence exports into opponent dossiers.

---

## Option A: The Sanitized Snapshot — "Evidence Card"

### How It Works

The player opens their match-source breakdown, examines an opponent's concentration data, and decides to share their analysis. They click a **Share Analysis** button that generates a static image — an **Evidence Card** — containing:

1. **The cluster identity:** Which cluster is being analyzed (e.g., "RELAY-C")
2. **The concentration bar:** The anonymized opponent's coverage percentage (e.g., "78% of cluster coverage")
3. **The before/after preview:** Two side-by-side mini-cluster maps — one showing the cluster with the opponent's matches included, one showing the cluster with those matches excluded
4. **The tagger's annotation:** A free-text field (max 280 characters) where the tagger can describe their reasoning
5. **Metadata:** Season, bracket tier (not specific rank), date of export

**What the Evidence Card does NOT include:**
- The opponent's username, handle, or any identifying information
- The opponent's rank within the bracket
- Specific match IDs, dates, or outcomes
- The opponent's agent configurations
- Any information that could identify the opponent to someone who doesn't already know them

```
┌──────────────────────────────────────────────────────────────┐
│  EVIDENCE CARD — Cluster Analysis Export                      │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  RELAY-C Cluster · Season 7 · Operative Tier                  │
│                                                               │
│  Opponent: [REDACTED]                                         │
│  Concentration: ████████████████████░░░░░░░░░░  78%           │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐                     │
│  │  WITH opponent   │  │  WITHOUT opponent│                    │
│  │                  │  │                  │                     │
│  │  ⬛⬛⬛🟥🟥🟥 │  │  ⬛⬛🟩🟩⬜⬜ │                     │
│  │  ⬛🟥🟥🟥🟥🟥 │  │  ⬛⬛🟩🟩🟩⬜ │                     │
│  │  🟥🟥🟥🟥🟥🟥 │  │  ⬛🟩🟩🟩⬜⬜ │                     │
│  │                  │  │                  │                     │
│  │  Cluster flag: ⚠ │  │  Cluster flag: ✓ │                    │
│  └─────────────────┘  └─────────────────┘                     │
│                                                               │
│  "This opponent appears in 78% of my RELAY-C cluster.         │
│   Without their matches, the cluster flag clears entirely.    │
│   The structural problem IS the opponent, not my config."     │
│                                                               │
│  ⚑ Community tags: 9 · Conviction: HIGH                       │
│  🛡️ Tagged: Yes                                               │
│                                                               │
│  ── robot-uprising.gg/evidence/a7f3c9 ──                      │
│  Generated 2026-03-14 · Season 7 · v4.2                       │
└──────────────────────────────────────────────────────────────┘
```

The Evidence Card is downloadable as a PNG (optimized for Discord/Reddit embeds) and also generates a shareable URL that renders an interactive version where viewers can toggle the before/after comparison.

### The Visual Treatment

The card renders on a dark slate background (`#0f1623`), the same base color as the career analysis interface. The cluster name is rendered in the cluster's signature color (RELAY-C might be electric blue, STRIKER-A might be amber). The concentration bar uses the opponent's anonymized color — always a neutral warm gray (`#9ca3af`), never the opponent's actual UI color, to prevent identification by color.

The before/after mini-cluster maps use a simplified heatmap representation. The "WITH" map uses the cluster's standard color scheme — amber/red cells indicating degraded performance. The "WITHOUT" map shifts to teal/green, showing recovered performance. The visual contrast between the two maps is the *evidence*: the difference between "my cluster is broken" and "my cluster is fine without this opponent."

The tagger's annotation renders in a monospace font, left-aligned, with a subtle left border in warm amber — visually distinguishing it from system-generated text. It reads like a handwritten note on an analytical document.

The `robot-uprising.gg/evidence/` URL at the bottom is rendered in muted gray, small font. It's present but not prominent — the card is self-contained, the URL is for those who want more.

### Strengths

- **Privacy-preserving.** The opponent is fully anonymized. No username, no rank, no identifying details. A viewer who doesn't already know who the opponent is cannot determine their identity from the card alone.
- **Self-contained evidence.** The card tells a complete story: this cluster, this concentration, this before/after difference, this annotation. A viewer on Discord or Reddit can evaluate the tagging decision without needing game access.
- **Structured narrative.** The annotation field forces the tagger to articulate their reasoning. "78% concentration and the cluster flag clears without them" is a clear diagnostic argument. This develops the community's shared vocabulary for adversarial analysis.
- **Social media optimized.** The PNG format, dark background, and compact layout are designed for embedding in Discord messages, Reddit posts, and Twitter/X threads. The card is legible at typical social media thumbnail sizes.
- **Teaching tool.** New players encountering Evidence Cards in community spaces learn what adversarial analysis looks like before they need to do it themselves. The card format becomes a de facto tutorial for career analysis concepts.

### Weaknesses

- **Deanonymization by context.** In small brackets (10-15 players), the combination of "Operative tier, 78% concentration, relay-targeting strategy" may be enough for community members to identify the anonymized opponent. The anonymization protects against casual identification but not against determined investigation by bracket-mates.
- **Cherry-picked evidence.** The tagger chooses what to annotate and what to share. A player with a grudge can craft an Evidence Card that makes a legitimate opponent look adversarial by selecting the right cluster and writing a compelling-but-misleading annotation. The card doesn't include counter-evidence (e.g., "this opponent's concentration in your other clusters is 8%").
- **Annotation abuse.** The free-text annotation field can contain inflammatory language, accusations, or personal attacks, even though the opponent is anonymized. Moderation of exported text is necessary.
- **Static snapshot.** The card captures a moment in time. If the opponent's behavior changes (they switch strategies, they rank out of the bracket), the card remains in circulation. Old evidence cards become misinformation as the competitive landscape evolves.

### Interaction Effects

- **With community tag signal (4.69e-ix):** The Evidence Card includes the community tag count and conviction score, providing crowd-sourced validation (or contradiction) of the tagger's individual analysis. A card showing "78% concentration, but community conviction: LOW" tells a different story than "78% concentration, community conviction: VERY HIGH."
- **With necropsy culture (7.10):** Evidence Cards become the primary artifact of necropsy discussion. Community threads organize around shared cards: "Here are three Evidence Cards from different players all showing the same opponent at 60%+ concentration in relay clusters. Pattern or coincidence?" The card format standardizes the evidence, making cross-player comparison possible.
- **With Opus Magnum histogram sharing (1.03):** Where Opus Magnum's histogram turns optimization into a community conversation ("look where I sit"), Evidence Cards turn adversarial diagnosis into a community conversation ("look what I see"). Both are shareable analytical artifacts that feed community sense-making.
- **With tag expiry (4.69e-viii):** Evidence Cards should include the export date prominently. A card from Season 5 shared during Season 7 is historical evidence, not current intelligence. The interactive URL version could show an "EXPIRED — This analysis is from a previous season" banner when the card's season doesn't match the current season.

---

## Option B: The Interactive Study — "Diagnostic Notebook"

### How It Works

Instead of a static image, the player exports a **Diagnostic Notebook** — an interactive web document (hosted at `robot-uprising.gg/notebooks/`) that lets viewers explore the career analysis data themselves. The notebook contains:

1. **The cluster map** — interactive, zoomable, with the specific cluster highlighted
2. **The match-source breakdown** — the full bar chart of opponents, all anonymized (`Opponent A`, `Opponent B`, etc.)
3. **The before/after toggle** — a slider that smoothly transitions between "with Opponent A" and "without Opponent A" views of the cluster
4. **The tagger's annotations** — inline comments attached to specific data points (e.g., an annotation anchored to the 78% bar that says "This is the one")
5. **Embedded replay clips** — short segments from the sealed watch showing specific matches that contributed to the cluster (anonymized: unit icons are rendered without custom cosmetics)

```
┌──────────────────────────────────────────────────────────────────────┐
│  DIAGNOSTIC NOTEBOOK — Published by [player handle]                   │
│  Season 7 · Operative Tier · RELAY-C Cluster                          │
│  ──────────────────────────────────────────────────────────────────────│
│                                                                        │
│  📊 Match-Source Breakdown                                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Opponent A  ████████████████████░░░░░░░░░░  78%                 │  │
│  │  Opponent B  ███░░░░░░░░░░░░░░░░░░░░░░░░░░░   8%                │  │
│  │  Opponent C  ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░   5%                │  │
│  │  [6 more opponents below 5%]                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  💬 "Opponent A appears in 78% of matches contributing to             │
│      this cluster. Their presence completely dominates the             │
│      signal. Without them, my RELAY-C config is performing             │
│      above the bracket median."                                        │
│                                                                        │
│  ⟵ WITH ──────●────────────────── WITHOUT ⟶                           │
│  [Interactive slider: drag to blend between cluster views]             │
│                                                                        │
│  🎬 Embedded Replay Clips (3 of 12 matches)                           │
│  ┌──────┐ ┌──────┐ ┌──────┐                                           │
│  │ ▶ M3 │ │ ▶ M7 │ │ ▶ M11│    [Click to play 8×8 board replay]      │
│  │ T:47 │ │ T:31 │ │ T:62 │    [Anonymized unit icons]                │
│  └──────┘ └──────┘ └──────┘                                           │
│                                                                        │
│  📝 Community Discussion (4 comments)                                  │
│  ──────────────────────────────────────────────────────────────────────│
│  SilverFox_42: "I have a similar pattern in my RELAY-B cluster.       │
│  Can confirm Opponent A matches my experience too."                    │
│                                                                        │
│  SkywatcherElite: "Actually, this looks like the counter-meta          │
│  relay-flood strategy. Check if their builds are all early-striker."   │
│  ──────────────────────────────────────────────────────────────────────│
│  [Add Comment]                                                         │
└──────────────────────────────────────────────────────────────────────┘
```

### The Visual Treatment

The notebook renders as a full-width web page with the career analysis interface's dark theme (`#0f1623` base). The layout follows a research paper structure: introduction (cluster context), data (match-source breakdown), analysis (before/after toggle), evidence (replay clips), discussion (comments).

The before/after slider is the visual centerpiece. As the viewer drags from left to right, the cluster map smoothly interpolates between the "with opponent" and "without opponent" states. Cells that were red in the "with" view bloom into green in the "without" view. The transition is continuous, not binary — at 50% slider position, cells that change between the views show a blended amber, creating a visual "maybe" zone that highlights exactly which data points are affected by the opponent's inclusion.

Replay clips render as small 8×8 boards that play at 2x speed when clicked. Unit icons are generic (no custom cosmetics, no callsign labels). The only identifying feature is the unit type icon: 👁 Scout, 📡 Relay, ⚔ Striker. The replay shows *what happened* without revealing *who it happened to*.

The comments section uses a threaded format with upvote/downvote. Comments inherit the notebook's anonymization policy — commenters cannot name the anonymized opponent, and comments that attempt to deanonymize are flagged by automated moderation.

### Strengths

- **Interactive exploration.** Viewers can investigate the evidence at their own pace, toggling the before/after slider, watching replay clips, drilling into specific data points. This serves the analytical community that wants to evaluate the evidence rigorously.
- **Community discussion attached to evidence.** The comments section creates a structured venue for debate about the tagging decision. "Is this adversarial or a legitimate counter-strategy?" becomes a productive discussion anchored to specific data, not abstract speculation.
- **Replay clips as raw evidence.** Embedded replays let viewers see the actual battlefield behavior, not just statistical summaries. A viewer can watch three matches and form their own opinion about whether the opponent is targeting or just playing.
- **Living document.** The notebook can be updated — the tagger can add new annotations as they learn more, the community can contribute analysis in comments. This makes the evidence export a collaborative diagnostic tool, not just a one-time sharing artifact.

### Weaknesses

- **Deanonymization through replay data.** Even with anonymized unit icons, replay clips reveal specific agent configurations — formation shapes, movement patterns, timing sequences. An opponent who recognizes their own build being replayed can self-identify. Bracket-mates who have faced the same opponent may recognize the playstyle from the replay.
- **Hosting and moderation cost.** Interactive notebooks require server-side infrastructure: web hosting, comment moderation, replay rendering, abuse prevention. This is significantly more expensive and complex than static image export.
- **Engagement barrier.** A Diagnostic Notebook is a commitment to explore. Casual community members on Discord won't click through and explore an interactive document — they'll glance at a thumbnail and scroll past. The format serves analytical players but misses the broader community.
- **Comment toxicity.** Any comment section about player behavior risks becoming a venue for harassment, especially when the subject is an anonymized opponent that some commenters may be able to identify.

### Interaction Effects

- **With necropsy culture (7.10):** The Diagnostic Notebook is the ultimate necropsy artifact. It transforms post-match analysis from a private activity into a publishable investigation. If necropsy culture develops, notebooks become the medium of community analytical discourse — the equivalent of medical case studies published for peer review.
- **With the Inspector (locked):** The notebook's replay clips are essentially Inspector timeline snapshots shared outside the game. The notebook extends the Inspector's analytical tools into community space, enabling collaborative inspection.
- **With Opus Magnum GIF export (1.03):** Where Opus Magnum shares the *solution* (clockwork GIF), Robot Uprising shares the *investigation* (diagnostic notebook). Both create shareable artifacts from the game's analytical layer. But Opus Magnum's GIF is immediately visually compelling, while the notebook requires engagement to appreciate.

---

## Option C: The Anonymized Case File — "Redacted Report"

### How It Works

A middle ground between the Evidence Card (static, simple) and the Diagnostic Notebook (interactive, complex). The Redacted Report is a **PDF-style document** (rendered as a single scrollable web page) that presents the tagger's analysis in a structured format — like a sanitized intelligence briefing or a redacted medical case report.

The visual metaphor is deliberate: the report looks like a declassified document. Opponent names are replaced with black bars (`████████`). Identifying details are struck through with heavy black redaction lines. The aesthetic says: *this information is sensitive; we've removed what you don't need to know.*

```
┌──────────────────────────────────────────────────────────────┐
│  ╔══════════════════════════════════════════════════════════╗ │
│  ║  ADVERSARIAL ANALYSIS REPORT                            ║ │
│  ║  Classification: REDACTED                               ║ │
│  ║  Analyst: Priya_DataFlow · Operative II · Season 7      ║ │
│  ╚══════════════════════════════════════════════════════════╝ │
│                                                               │
│  SUBJECT: ████████████                                        │
│  BRACKET: Operative · CLUSTER: RELAY-C                        │
│  PERIOD: Season 7, Weeks 1-8                                  │
│                                                               │
│  ── EXECUTIVE SUMMARY ──                                      │
│  Subject appears in 78% of matches contributing to the        │
│  RELAY-C cluster. Removal of subject's matches eliminates     │
│  the cluster's ⚠ flag entirely. Community tags: 9.            │
│  Conviction: HIGH. Assessment: ADVERSARIAL.                   │
│                                                               │
│  ── EVIDENCE ──                                               │
│  [Match-source breakdown chart]                               │
│  [Before/after cluster comparison]                            │
│  [Concentration trend over 8 weeks — rising from 45% to 78%] │
│                                                               │
│  ── ANALYST'S NOTES ──                                        │
│  "Subject's concentration has been steadily increasing        │
│   throughout the season. Weeks 1-2: 45%. Weeks 3-4: 58%.     │
│   Weeks 5-6: 71%. Weeks 7-8: 78%. This escalation pattern    │
│   is consistent with deliberate targeting. My RELAY-C         │
│   configuration has not changed during this period."          │
│                                                               │
│  ── RECOMMENDATION ──                                         │
│  Tag as adversarial. Exclude from cluster diagnostics.        │
│  Monitor concentration in adjacent clusters (RELAY-A, B).     │
│                                                               │
│  ── METADATA ──                                               │
│  Report ID: RU-AR-2026-S7-4872                                │
│  Generated: 2026-03-14 14:32 UTC                              │
│  Schema version: 4.2                                          │
│  ⚠ This report contains anonymized data.                      │
│     Subject identity has been redacted.                        │
└──────────────────────────────────────────────────────────────┘
```

### The Visual Treatment

The report renders on a cream-white background (`#faf8f5`), contrasting with the game's dark UI theme. This deliberate contrast signals: *you have left the game. This is a document, not an interface.* The font shifts from the game's UI sans-serif to a monospace typeface reminiscent of government reports — `Courier New` or `IBM Plex Mono`.

Redaction bars are heavy black (`#000000`), slightly wider than the text they replace, with a subtle paper-texture overlay. They look like physical ink applied with a marker. Some redaction bars are slightly crooked, as if applied by hand — this is a cosmetic detail that reinforces the "declassified document" aesthetic without compromising the actual anonymization.

Section headers use all-caps, thin horizontal rules above and below. The Executive Summary is indented and bordered with a double rule. Charts render as high-contrast black-and-white line graphs — no color, because the document aesthetic is monochrome.

The overall impression is: this is *serious*. This is not a social media card or a casual share. This is a diagnostic report from an analytical player who takes their competitive intelligence seriously. The aesthetic selects for the audience: players who find this format appealing are the players you want making tagging decisions.

### Strengths

- **Aesthetic filters audience.** The document format attracts analytical players and repels casual taggers. A player who would reflexively tag every opponent they lose to is unlikely to generate a redacted report — the format implies rigor.
- **The redaction is the narrative.** The black bars are not just privacy protection — they're storytelling. They tell the viewer: "there is information here that was removed for your protection." This creates intrigue and respect for the anonymization, rather than frustration at missing data.
- **Structured argument.** The Executive Summary → Evidence → Analysis → Recommendation structure forces the tagger to organize their reasoning. This develops diagnostic writing skills and creates artifacts that are directly comparable across players and cases.
- **Temporal evidence.** The concentration trend over time (45% → 58% → 71% → 78%) tells a story that a single snapshot cannot. The escalation pattern is more convincing evidence of deliberate targeting than a single high-concentration number.

### Weaknesses

- **Format friction.** Generating a Redacted Report requires significantly more effort than clicking "Share." The tagger must review the generated report, edit their notes, verify the evidence sections. This friction limits adoption to the most engaged players.
- **Aesthetic exclusion.** The "government document" aesthetic may alienate players who associate that visual language with bureaucracy, inaccessibility, or authoritarianism. The format is culturally specific — it reads as "serious" to Western audiences familiar with declassified documents but may not translate globally.
- **Shareability vs. embeddability.** A full-page document doesn't embed well in Discord messages or Reddit comments. It requires a click-through to the hosted page. In fast-moving community channels, link posts get less engagement than inline images.
- **Performative seriousness.** The aesthetic risks encouraging players to treat adversarial tagging as more important than it is. A redacted intelligence report about a video game opponent may cross from "immersive" into "absurd" for players who don't share the game's competitive intensity.

### Interaction Effects

- **With the bot log narrative (locked):** The Redacted Report's aesthetic mirrors the game's boot log narrative — both use diegetic document framing. If the game's story is told through system documents and self-aware AI logs, then the Redacted Report is a player-generated document in the same genre. The player becomes a contributor to the game's textual world.
- **With community prestige:** Well-written Redacted Reports could become community status artifacts — "Priya's Season 7 Analysis of the Operative Relay Targeting Pattern" becomes a cited reference in bracket discussions. The report format enables a culture of analytical publishing.

---

## Option D: The Micro-Share — "Evidence Snippet"

### How It Works

The lightest-weight option. No full report, no interactive notebook — just a **single-panel image** optimized for inline embedding in chat messages. The Evidence Snippet contains only:

1. A concentration bar (anonymized opponent, percentage)
2. A single-sentence tagger annotation (140 characters max)
3. Season/tier metadata

```
┌────────────────────────────────────────────┐
│ RELAY-C · Season 7 · Operative             │
│ ████████████████████░░  78% · ⚑9 · HIGH    │
│ "Flag clears without them. It's targeting." │
│           robot-uprising.gg/e/a7f3          │
└────────────────────────────────────────────┘
```

The snippet is 400×120 pixels — smaller than a Discord sticker. It renders inline in chat without requiring a click-through. The URL leads to the full Evidence Card (Option A) for viewers who want more detail.

### The Visual Treatment

The snippet renders on the dark career-analysis background, pill-shaped with rounded corners (8px radius). The concentration bar is thin (4px height) and renders in the same warm-gray-on-dark-slate as the in-game version. The annotation text is small (11px) but high-contrast (white on dark). The URL is tiny (9px), rendered in muted blue.

The entire snippet is designed to look like a *system notification* — compact, informational, not attention-grabbing. It's the chat equivalent of a footnote: relevant context, not a conversation starter.

### Strengths

- **Zero friction.** One tap to generate. Appears inline in Discord/Reddit/Twitter without requiring a click-through. The lowest possible barrier to sharing evidence.
- **Chat-native.** The snippet format matches how competitive gaming communities actually communicate: short messages in Discord channels. A full Evidence Card or Redacted Report interrupts the flow; a snippet continues it.
- **Stackable.** Multiple players can share snippets about the same anonymized opponent in the same thread. Three snippets showing 78%, 65%, and 71% concentration from different players create a visual pattern without any formal aggregation system.
- **Minimal deanonymization surface.** The snippet contains almost no identifying information — just a concentration percentage, bracket tier, and one sentence. Even in a small bracket, this is insufficient to identify the opponent.

### Weaknesses

- **Insufficient evidence.** A concentration percentage and one sentence don't constitute a rigorous analysis. The snippet is a *claim*, not *evidence*. It invites "trust me" rather than "verify this."
- **Hot-take optimization.** The 140-character limit encourages punchy, emotional annotations ("This person is DEFINITELY targeting relays") rather than careful analysis. The format rewards conviction over nuance.
- **No before/after.** Without the cluster comparison, the snippet shows a symptom (high concentration) without the diagnosis (whether removing the opponent changes the cluster flag). A 78% concentration might be concerning or normal depending on bracket size and match volume.

---

## Option E: The Hybrid Stack — "Progressive Disclosure"

### How It Works

All four options coexist as layers of a single export system, progressively disclosing more information:

**Layer 1 — Snippet (auto-generated, one tap):** The micro-share for chat. Always available.
**Layer 2 — Evidence Card (auto-generated, review before sharing):** The standard export. Generated from the same data as the snippet but with before/after comparison and full annotation.
**Layer 3 — Redacted Report (player-written, structured template):** The deep analysis. Requires the player to fill in analysis sections beyond the auto-generated data.
**Layer 4 — Diagnostic Notebook (player-curated, interactive):** The full investigation. Includes replay clips, community discussion, living document.

The player chooses their disclosure level based on their intent:
- Quick mention in chat → Snippet
- Sharing evidence for feedback → Evidence Card
- Publishing a formal analysis → Redacted Report
- Collaborative investigation → Diagnostic Notebook

Each layer links to the next: the Snippet URL leads to the Evidence Card. The Evidence Card has a "Full Report" link to the Redacted Report (if one exists). The Redacted Report links to the Diagnostic Notebook (if published).

### Strengths

- **Matches communication contexts.** Chat needs snippets. Reddit posts need cards. Community wiki needs reports. Analytical deep-dives need notebooks. Each format matches a communication venue.
- **Progressive investment.** A player starts with a snippet (zero effort), decides the conversation warrants more, upgrades to a card (low effort), receives community interest, writes a report (medium effort), attracts collaborators, publishes a notebook (high effort). The investment scales with community engagement.
- **Privacy gradients.** Each layer reveals slightly more analytical detail. Snippets reveal almost nothing; notebooks reveal replay clips. The player controls their privacy/evidence trade-off.

### Weaknesses

- **Complexity budget.** Four export formats is three too many for most players. The UI must surface only the relevant option for each context without overwhelming with choices.
- **Feature maintenance.** Four rendering pipelines, four hosting models, four moderation policies. The development and maintenance cost is substantial.

---

## Player Journeys

### Journey 1: Yuki, 26, Data Analyst — "The Published Investigation"

**Context:** Season 7, Architect I bracket (top 8%), 95 matches played. Yuki has been methodically analyzing her career data every week. She's identified a pattern: one opponent — anonymized as Opponent A in her exports — has appeared in 71% of her RELAY-C cluster for five consecutive weeks. Her bracket's TIN shows 6 other players have tagged this opponent. She wants to share her analysis with the bracket's Discord community to see if others see the same escalation pattern.

**Minute 0:00 — Generating the Evidence Card**
Yuki opens her RELAY-C cluster's match-source breakdown in career analysis. Opponent A sits at the top: 71% concentration. Below, the community signal: `⚑ 6 players tagged · Conviction: HIGH`. She clicks the **Share** icon (a small arrow-from-box glyph) in the top-right corner of the match-source panel.

A drawer slides open from the right: **"Share This Analysis"**. Three options appear as horizontal cards:

- **Snippet** — a tiny preview showing the concentration bar and a text input for one sentence. The preview renders live as she types.
- **Evidence Card** — a larger preview showing the before/after cluster comparison, annotation field, and community tag data. A yellow "Review before sharing" badge.
- **Diagnostic Notebook** — grayed out with a lock icon: "Publish a full interactive investigation. Requires 3+ annotated replay clips." She hasn't added replay clips yet.

Yuki taps **Evidence Card**. The full-size preview renders below. She reads the auto-generated text: her cluster identity, the concentration bar, the before/after maps. She clicks into the annotation field and types:

*"Week 5 of escalating concentration. 45% → 52% → 61% → 67% → 71%. My config hasn't changed. The cluster flag only fires because of this opponent's matches. Without them, RELAY-C is my second-best performing cluster."*

She reads it back. It's precise, factual, unemotional. She clicks **Generate**.

**Minute 0:45 — The Card Appears**
A full-resolution Evidence Card renders in a modal. Dark background, electric blue cluster label ("RELAY-C"), the warm-gray concentration bar, the side-by-side before/after maps — the "WITH" map angry with amber and red cells, the "WITHOUT" map calm with green and teal. Her annotation in monospace below. The community tag count and conviction score at the bottom. A URL: `robot-uprising.gg/evidence/k9m2r7`.

Two buttons at the bottom: **Copy Image** and **Copy Link**. She taps **Copy Image**.

**Minute 1:00 — Posting to Discord**
Yuki switches to the Architect I bracket Discord. She pastes the image into `#career-analysis-discussion`, a channel the community created specifically for sharing diagnostic artifacts. She adds a message: "Week 5 update on the Relay Targeting pattern. Concentration still climbing. Anyone else seeing this in their RELAY clusters?"

The Evidence Card embeds inline — the Discord preview shows the full card at readable resolution. Other bracket players can see the cluster name, concentration, before/after comparison, and annotation without clicking through.

**Minute 1:30 — Community Response**
Within minutes, two other players post their own Evidence Cards. One shows 65% concentration on RELAY-B from the same anonymized opponent identifier (the evidence system uses consistent anonymization within a bracket, so "Opponent A" maps to the same real player across exports from different taggers). The other shows 58% on RELAY-A.

A fourth player — an Architect I veteran — replies: "I've seen this pattern before. This is the relay-flood counter-meta from Season 5. Check if their builds are all early-striker with relay-targeted hooks. It's not adversarial — it's a specific meta strategy that generates high concentration in any relay-heavy cluster."

Yuki reads this and pauses. She hadn't considered that explanation. She goes back to her career analysis, checks the match details more carefully. The veteran might be right — the opponent isn't targeting *her specifically*, they're running a general anti-relay strategy that produces high concentration in every relay player's clusters.

She returns to Discord and replies: "Good call. I'll hold off on tagging until I check whether their concentration is relay-specific or general. If they're just running anti-relay, that's not adversarial — that's meta."

**Minute 3:00 — The Learning Moment**
Yuki has learned something she couldn't have learned alone: the difference between "high concentration because they're targeting me" and "high concentration because they're running a strategy that affects all relay players." The Evidence Card enabled the community conversation that produced this insight. Her diagnostic skill improved because she published her evidence and received expert feedback.

**UI Annotations:**
- Share icon: arrow-from-box glyph, 24×24px, positioned in top-right corner of match-source panel, renders in muted blue
- Share drawer: slides from right, 360px wide, dark background matching career analysis theme
- Export format cards: 320×80px horizontal cards with live preview thumbnails, single-tap selection
- Annotation field: 280-character max, monospace font, warm amber left-border, live character count
- Generate button: full-width, teal background, white text, 1-second generation animation (the card "prints" line by line, top to bottom)
- Evidence Card modal: centered, 600×800px, with "Copy Image" and "Copy Link" buttons at bottom

---

### Journey 2: Tomás, 17, Twitch Streamer — "The Content Machine"

**Context:** Season 8, Operative III bracket, 150 matches this season. Tomás streams Robot Uprising three times a week to ~200 concurrent viewers. His community loves drama — they want to see rivalries, accusations, heated analysis. Tomás has discovered that Evidence Cards generate excellent stream content: he generates them live on stream and his chat speculates about who the anonymized opponent might be.

**Minute 0:00 — The Live Generation**
Tomás is in his post-match debrief, streaming to 230 viewers. He opens career analysis and clicks into his STRIKER-A cluster. "Chat, look at this. This cluster has been amber for three weeks straight. Let's see who's in here."

He opens the match-source breakdown. The top opponent: 82% concentration. "EIGHTY-TWO PERCENT. Chat. Eighty. Two." His viewers flood the chat with "WHO IS IT" and skull emojis.

He clicks the Share icon. "Alright, let's make an Evidence Card so you can all see this properly." He selects Evidence Card. The preview renders — the before/after maps show a dramatic difference. "Look at that. WITH them, my cluster is a disaster. WITHOUT them, it's green across the board."

**Minute 0:30 — The Annotation as Performance**
Tomás types his annotation live, narrating as he goes: "This opponent... has been in... 82 percent of my STRIKER-A... cluster... for three weeks. My config... didn't change. Verdict: targeting." He reads it back to chat with dramatic emphasis.

Chat reacts: "POST IT POST IT POST IT." Tomás clicks Generate.

**Minute 1:00 — The Speculation Game**
Tomás posts the Evidence Card in his Discord's `#evidence-room` channel (which he created specifically for this purpose). His community immediately begins speculating: "It's gotta be [username guess]." "No, [username] doesn't run strikers." "Check the concentration trend, this started week 3 of the season."

Tomás reads the speculation on stream but doesn't confirm or deny. "I can't tell you who it is, that's the whole point of the anonymization. But I CAN tell you that this person is very specifically making my life miserable."

**Minute 2:00 — The Deanonymization Attempt**
A viewer in Tomás's Discord posts: "I'm in Operative III too. I just checked my career analysis — I have someone at 76% in my RELAY-B. If I share my Evidence Card, can we cross-reference the anonymization IDs?"

This is the deanonymization vector. If two players in the same bracket share Evidence Cards, and both show high concentration from the same anonymized identifier (e.g., "Opponent A"), they've confirmed a shared adversarial experience. The anonymization prevents *external* identification but doesn't prevent *bracket-internal* triangulation.

Tomás hesitates. His chat is split: half want the full detective story, half say "don't witch-hunt." He decides: "Let's just share Evidence Cards and see if the patterns match. If they do, that's useful diagnostic info for the bracket. But no naming names."

The other player shares their card. The anonymized IDs match. Tomás's chat erupts. "SAME PERSON." The speculation intensifies, but no one confirms the identity.

**Minute 4:00 — The Content Outcome**
Tomás clips the moment both Evidence Cards were revealed as matching. The clip gets 15K views on TikTok: two players independently discovering the same adversarial pattern, presented as a detective story. Text overlay: **"We found the same ghost."** The Evidence Card format is visually distinctive enough to be recognizable in the clip — viewers who play Robot Uprising understand the dark cards with concentration bars and before/after maps.

**UI Annotations:**
- Evidence Cards from different players sharing consistent anonymized IDs enable bracket-internal cross-referencing without explicit deanonymization
- The "Opponent A" label is consistent within a bracket and season: all players in Operative III see the same real player labeled as the same anonymized ID in their exports
- No mechanic prevents players from sharing multiple Evidence Cards and triangulating; the anonymization is a social norm, not a technical barrier

---

### Journey 3: Aiko, 16, New Player — "The Learning Artifact"

**Context:** Season 2 for Aiko, Recruit II bracket, 30 matches. She's never used career analysis beyond the tutorial prompts. She discovers Evidence Cards not through the in-game export system, but through the community — a Discord server for new players where veterans share annotated Evidence Cards with educational commentary.

**Minute 0:00 — Encountering an Evidence Card in the Wild**
Aiko scrolls through `#newbie-help` in the Robot Uprising community Discord. A message from a veteran player reads: "Here's an example of what adversarial targeting looks like in career analysis. This is from my Operative bracket, but the pattern is the same at every tier."

Below the message, an Evidence Card: dark background, cluster label ("SCOUT-B"), concentration bar at 68%, before/after maps, and an annotation: *"This opponent's matches account for 68% of my cluster. Without their matches, my scout config performs at bracket average. Diagnosis: adversarial targeting of my scout archetype."*

**Minute 0:15 — Reading the Card**
Aiko studies the Evidence Card. She doesn't fully understand cluster analysis, but the before/after maps are visually intuitive — one is mostly red, the other is mostly green. The annotation explains the reasoning in plain language. She understands the argument: "this opponent is making one of my configs look bad, but if I ignore their matches, the config is fine."

She thinks about her own career analysis. She opened it once after the tutorial and saw some amber clusters but didn't know what to do. Now she has a mental model: some clusters might be amber because of one opponent, not because the config is bad.

**Minute 0:30 — The Tutorial by Osmosis**
Aiko reads three more Evidence Cards in the thread. Each one follows the same format: cluster, concentration, before/after, annotation. She notices patterns:
- High concentration (>60%) in one opponent usually means the cluster flag is about that opponent, not the config
- The before/after comparison is the key evidence: if the flag clears without the opponent, the problem is the opponent
- Annotations are factual and specific, not emotional ("targeting" not "cheating")

She has absorbed the core concepts of adversarial diagnosis from reading four Evidence Cards, without ever opening a help article or watching a tutorial video. The card format is a teaching tool that works through exposure and pattern recognition.

**Minute 1:00 — First Career Analysis Attempt**
Aiko opens career analysis for the first time since the tutorial. She navigates to her one amber cluster — STRIKER-A. She opens the match-source breakdown. One opponent is at 55% concentration. She checks the before/after comparison: the cluster flag still fires without the opponent, but the loss rate drops from 72% to 58%.

She realizes this isn't the same as the Evidence Cards she saw — the opponent is contributing to the problem but isn't the *sole* cause. The config itself might have a structural issue too. She decides not to tag. Instead, she looks at her striker configuration and notices a rule that might be causing inefficient behavior.

This is the diagnostic learning outcome the system is designed to produce: the player evaluates the evidence on its own terms rather than tagging reflexively.

**UI Annotations:**
- Evidence Cards function as community-authored tutorial artifacts
- The before/after visual comparison is the most accessible element — legible to players who don't understand the underlying analytics
- The annotation field carries the analytical reasoning that transforms the card from data into a lesson
- No in-game system directed Aiko to the Discord channel or the Evidence Cards; this is organic community knowledge transfer

---

### Journey 4: Dev, 39, Accessibility-Focused Player (Color Blind) — "The Pattern Reader"

**Context:** Dev has deuteranopia (red-green color blindness). He's in Operative I, Season 6. He encounters Evidence Cards in the game's subreddit and needs to evaluate them using the same visual format as sighted players.

**Minute 0:00 — The Color Problem**
Dev opens a Reddit thread titled "Evidence of relay targeting in Operative bracket." The top post is an Evidence Card. He looks at the before/after mini-cluster maps. To a typical viewer, the "WITH" map is red/amber (degraded) and the "WITHOUT" map is green/teal (healthy). To Dev, both maps look similar — the red-green distinction is invisible to him.

He can read the concentration bar (78%) and the annotation text. He can see that one map has a `⚠` flag and the other has a `✓`. But the visceral visual impact — the angry red vs. calm green — is lost.

**Minute 0:15 — The Accessible Version**
Dev clicks the Evidence Card's URL (`robot-uprising.gg/evidence/a7f3c9`). The interactive version loads. In his browser, he has a color-blind filter extension active. The web version of the Evidence Card detects `prefers-contrast` settings and automatically switches to a high-contrast mode:

- The "WITH" map uses diagonal hatching (╲╲╲) for degraded cells and solid fill for healthy cells
- The "WITHOUT" map uses the same hatching scheme, showing dramatically fewer hatched cells
- The concentration bar adds a numerical overlay: "78% (HIGH)"
- The before/after comparison adds a text diff summary: "Cluster flag: ⚠ WITH → ✓ WITHOUT. Loss rate: 71% WITH → 38% WITHOUT."

Dev can now evaluate the evidence with full fidelity. The pattern hatching communicates the same information as color coding. The text diff summary provides what the visual comparison conveys to sighted viewers.

**Minute 0:30 — Evaluating the Evidence**
Dev reads the annotation, checks the numbers, and evaluates the before/after comparison. He agrees: removing this opponent's matches transforms the cluster from flagged to healthy. He replies to the Reddit thread: "Confirmed. I'm seeing similar concentration from the same anonymized ID in my RELAY-B cluster. Sharing my card below."

He generates his own Evidence Card from the in-game export. The export process renders the card with his accessibility settings preserved — hatched patterns instead of color, numerical overlays on all bars, text summaries alongside visual comparisons.

**UI Annotations:**
- Evidence Cards must support color-blind modes: hatching patterns, text summaries, numerical overlays
- The PNG export should include an `alt` text metadata field describing the card's content for screen readers
- The interactive web version should respect `prefers-contrast` and `prefers-color-scheme` CSS queries
- Patterns (hatching for degraded, solid for healthy) are more universally legible than color alone

---

## Sensory Description

### The Evidence Card (Option A)

**Visual:** A 600×800px dark rectangle (`#0f1623`) with a thin 1px border of muted teal (`#2dd4bf` at 30% opacity). The cluster name is the first bright element — electric blue for relay clusters, warm amber for striker clusters, emerald green for scout clusters — rendered in 18px semi-bold, top-left. The concentration bar sits below: 360px wide, 8px tall, the filled portion in warm gray (`#9ca3af`), the empty portion in dark slate (`#1e293b`). The percentage label is right-aligned, white, 14px.

The before/after maps are the visual centerpiece: two 200×150px rectangles side by side, separated by a thin vertical divider with a small "VS" badge. Each cell in the mini-map is a 20×20px square. In the "WITH" map, degraded cells pulse with a very faint red glow — not animated (this is a static image), but rendered with a radial gradient that simulates light emission from the cell center. In the "WITHOUT" map, healthy cells have a cool teal tone with no glow — flat, calm, stable. The contrast is immediate: one map radiates stress, the other radiates composure.

The annotation sits in a recessed panel (1px darker than the card background, with a 2px left border in warm amber). The text is monospace, 12px, line-height 1.6. It reads like someone's handwritten field notes — personal, direct, specific.

The footer contains the URL, timestamp, and schema version in 9px muted gray (`#64748b`). Below that, a faint horizontal gradient line — the cluster's signature color, from 100% opacity on the left to 0% on the right — a subtle branding element that ties the card to the cluster it analyzes.

**Audio (interactive version only):** When the Evidence Card loads in the browser, a soft paper-unfold sound plays — like opening an envelope. 0.3 seconds, synthesized with filtered white noise and a slight reverb. When the viewer hovers over the before/after maps, a very quiet atmospheric shift: the "WITH" map plays a low-frequency hum at 60Hz (tension), the "WITHOUT" map plays a slightly higher, cleaner tone at 120Hz (resolution). The audio is almost subliminal — at 20% of UI volume — but creates a visceral sense that the two maps *feel* different.

**Feel:** The Evidence Card feels like holding a printed photograph. It's a moment captured and preserved. The dark background gives it weight — it doesn't float lightly in a chat window, it sits with presence. The annotation's monospace font and amber left-border give it the quality of a marginal note in a technical document. The overall impression is: *someone analyzed this carefully and is showing you their work.*

### The Share Drawer

**Visual:** When the Share icon is tapped, a panel slides from the right edge of the career analysis screen. The slide animation takes 250ms with a slight ease-out bounce at the end — the panel arrives with a gentle physical sensation, like a document drawer stopping on its rails. The drawer is 360px wide, occupying roughly one-third of the screen, and the career analysis behind it dims to 40% opacity.

Inside the drawer, the three export options (Snippet, Evidence Card, Notebook) are rendered as horizontal cards with rounded corners (8px), each showing a live miniature preview of what the export will look like. The previews update in real-time as the player types in the annotation field. The active option has a thin glowing border in the cluster's color; inactive options have dim borders.

**Audio:** The drawer slide produces a soft mechanical sound — like a filing cabinet drawer opening. 0.2 seconds. When switching between export options, a quiet click — like selecting a radio button on a physical console.

**Feel:** The drawer feels like opening a workstation tool panel. It's functional, not decorative. The live previews communicate: *what you see is what you'll share.* The annotation field's character count renders as a thin bar below the text field that fills as you type — green below 200 characters, amber at 200-260, red at 260-280. The bar creates a gentle constraint without harsh truncation.

---

## The TikTok Clip

**Option A (Evidence Card):** Camera shows a player's career analysis screen. They click the Share icon. The drawer slides open. They type an annotation with intense focus. Click Generate. The Evidence Card renders line by line, like a receipt printing. They copy the image, switch to Discord, paste it. Within seconds, three other players paste their own Evidence Cards showing the same anonymized opponent with 70%+ concentration. The camera zooms out to show all four cards side by side. Text overlay: **"Same ghost. Different victims."** Audio: the paper-unfold sound four times in rapid succession, overlapping into a cascade.

**Option C (Redacted Report):** Camera shows the Redacted Report in full — the cream background, the monospace text, the heavy black redaction bars. A dramatic zoom on `████████████` where the opponent's name would be. The camera pulls back as the player scrolls through evidence sections, each one more damning. Cut to the report being posted in a community forum. Comments flood in. Text overlay: **"The case file."** Audio: the sound of a heavy folder being dropped on a desk, followed by the quiet scratch of a pen on paper.

**Option E (Progressive Disclosure):** Camera starts with the tiny Snippet — just a concentration bar and one sentence — posted in Discord. Someone replies "Show me more." Cut to the Evidence Card rendering. "MORE." Cut to the Redacted Report printing. "Is there a notebook?" Cut to the Diagnostic Notebook loading, replay clips playing, community comments flowing in. Each layer reveals more data, more evidence, more community engagement. The escalation from snippet to notebook mirrors the escalation of the adversarial pattern itself. Text overlay: **"How deep does it go?"** Audio: each layer transition accompanied by a deeper, more resonant version of the paper-unfold sound — from a crisp snap for the snippet to a full orchestral swell for the notebook.

---

## Comparable Games and Media

| System | Shareable Artifact | Privacy Model | Community Impact | Lesson |
|--------|-------------------|---------------|------------------|--------|
| Opus Magnum GIF export | Looping animation of solution | N/A (single-player) | Created viral sharing culture; solutions are identities | Self-contained visual artifacts generate organic sharing |
| Lichess study/share URL | Interactive board + analysis | Both players named (all games public) | Collaborative analysis culture | Frictionless URL generation drives adoption |
| Chess.com PGN export | Structured data file + embed options | Both players named | Analytical communities, coaching | Multiple export formats serve different audiences |
| VALORANT SNAP//SHOT | Stats card image/video | Only sharer's data | Social media identity performance | Format for social media (square/vertical) matters |
| Spotify Wrapped | Annual listening summary cards | Only listener's data | Massive viral sharing event | Data-as-identity drives voluntary sharing |
| Overwatch end-of-match cards | Play of the Game + stats cards | Match participants visible | Short-lived social sharing | Immediacy matters: share-at-peak-emotion |
| Strava activity sharing | Route maps + performance data | Runner visible, route public | Community challenge culture | Leaderboards on shared artifacts create competition |
| GitHub contribution graph | Activity heatmap | Public by default | Identity signaling ("look how active I am") | Simple visual artifacts become identity markers |

**The unique constraint of Robot Uprising:** The shareable artifact necessarily involves *another player's* behavior data, anonymized. Every comparable system above either shares only the sharer's data (SNAP//SHOT, Wrapped, Strava) or shares both parties' data in a context where privacy is not expected (Lichess, Chess.com). Robot Uprising must navigate the novel territory of sharing *relational* analytical data — "here's what this person's matches do to my analysis" — with the subject anonymized.

---

## Discovered Aspects

1. **4.69e-x-a — Consistent cross-player anonymization within brackets:** The Evidence Card system must decide whether "Opponent A" in Yuki's export maps to the same real player as "Opponent A" in another Operative player's export. Consistent IDs enable cross-referencing (as in Tomás's journey) but also enable triangulation-based deanonymization. Inconsistent IDs prevent cross-referencing but make community discussion harder ("is my Opponent A the same as yours?"). Design options: consistent per-bracket-per-season, rotating IDs, hash-based with salt rotation. Interaction with TIN (4.69e-ix opt-in pool).

2. **4.69e-x-b — Evidence Card moderation and abuse vectors:** The free-text annotation field can contain harassment, slurs, coded language, or deanonymization attempts ("we all know who this is"). Moderation options: pre-share text screening, community flagging on hosted cards, annotation-less export option, approved vocabulary lists. Interaction with community norms (7.10 necropsy culture).

3. **4.69e-x-c — Evidence Card as replay export precedent:** The tag evidence export establishes the infrastructure for ALL shareable analytical artifacts — debrief snapshots, configuration shares, inspector timeline moments. The privacy model, hosting infrastructure, and sharing UI designed for evidence cards will be reused across every export feature. Design decision: build generic "shareable analysis artifact" system or build tag-specific export first?

4. **4.69e-x-d — The performative analysis problem:** Tomás's journey shows Evidence Cards becoming content performance rather than genuine analysis. When sharing evidence is optimized for views/engagement rather than diagnostic accuracy, the community conversation shifts from "is this adversarial?" to "is this entertaining?" Mitigation options: separate "share to community" from "share to stream," different export formats for analytical vs. entertainment contexts, community norms against sensationalizing evidence.

5. **4.69e-x-e — Temporal validity markers on evidence exports:** An Evidence Card from Season 5 shared during Season 7 is stale intelligence. Design options: auto-expiring URLs (card goes blank after season ends), persistent but with prominent "HISTORICAL — Season 5" banner, permanent archive (all evidence cards persist indefinitely). Interaction with tag expiry (4.69e-viii).
