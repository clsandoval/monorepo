# "This Is Why QUICK Was Wrong" — Divergence Replay Export as Pedagogical Artifact

**Aspect:** 4.79 — Exporting a divergence event (QUICK result, THOROUGH result, animated causal trace) as a shareable clip or static screenshot; "this is why QUICK was wrong this time" as a standardized community artifact; extends necropsy culture (7.10) to the explainer layer; interaction with 4.23 replay annotated export.

**Related:** 4.61 — QUICK vs. THOROUGH explainer (the source content being exported); 7.10 — Config necropsy culture (the community practice this feeds into); 4.23 — Replay annotated export (the existing export format this extends); 4.82 — Divergence type distribution (the taxonomy embedded in each exported artifact)

---

## The Core Design Problem

The QUICK vs. THOROUGH explainer (4.61) teaches players to reason about diagnostic heuristics. The animated causal trace shows why the pre-ranking surfaced one element while exhaustive search found another. The side-by-side cards quantify the gap. The narrative explanation classifies the scenario type — Symptom-Before-Cause, Recency Bias, Volatility False Signal, Magnitude Gap. This content is some of the richest pedagogical material the game produces.

But it is ephemeral. It lives in the debrief panel of a single session. The player sees it, maybe absorbs it, moves on. It is never seen again unless the player re-runs the same analysis on the same config version — which almost never happens, because configs evolve.

Meanwhile, necropsy culture (7.10) has created robust community infrastructure for sharing config evolution, match replays, and failure analysis. Players post Changelogs, Annotated Replays, Diff Reports, Evolution Trees, and Matchup Matrices. The replay annotated export format (4.23) defines what debrief content is shareable — Act 1 timestamp annotations, Act 2 notes, gold diamond location, false pivot markers.

But neither system currently captures the divergence explainer. The most precise diagnostic content the game produces — the moment where two search algorithms disagree and the game explains exactly why — cannot be shared, discussed, or archived. A player who encounters a beautiful Symptom-Before-Cause divergence on Mission 12 has no way to show it to their Discord server, embed it in a forum post, or reference it six months later when someone asks "what does a volatility false signal look like?"

**The design question:** How does the divergence event become a first-class community artifact? What does the export contain? What format does it take? How does it interact with existing export infrastructure? And what happens when divergence exports become a genre of community content — when players share them not as curiosity but as teaching material?

---

## What a Divergence Export Contains

A divergence event has five distinct layers, each with its own export requirements:

**Layer 1 — The QUICK Result Card.** The element name, the proposed fix, the expected pass rate improvement, the pre-ranking signals that surfaced it (pivot-activity score, recency score, volatility score). This is compact structured data.

**Layer 2 — The THOROUGH Result Card.** The element name, the minimum fix, the expected pass rate improvement, the number of scenarios fixed, the fix magnitude. Also compact structured data.

**Layer 3 — The Divergence Classification.** The scenario type (Symptom-Before-Cause, Recency Bias, Volatility False Signal, Magnitude Gap), the confidence score, the narrative explanation text. Semi-structured: a classification tag plus a prose paragraph.

**Layer 4 — The Animated Causal Trace.** A 8-12 second animation showing the pivot tick, the THOROUGH element highlighted in violet, the causal arrow tracing forward to the QUICK element in amber, the dotted connection line, the final caption. This is temporal visual content — fundamentally different from static data.

**Layer 5 — The Heuristic Autopsy (if unlocked).** The pre-ranking input signal table, the post-simulation results table, the per-signal accuracy stats from the player's history. Dense tabular data, meaningful only to advanced players.

The export must handle all five layers, but not all exports need all five. A casual share to Discord needs Layers 1-3 as a static image. A pedagogical post needs Layer 4 as an animated clip. A deep-dive community analysis needs all five layers in an interactive format.

---

## Design: Three Export Formats

### Format A: "The Divergence Card" — Static Screenshot

A single image, designed for embedding anywhere — Discord, Reddit, Twitter, forum posts. The card is 1200x675 pixels (16:9, optimized for social media link previews).

**What it looks like:**

The card has a dark background matching the debrief panel's palette — deep charcoal with a faint grid pattern from the 8x8 battlefield. Two columns dominate the center:

Left column: the QUICK result, rendered as a compact card with the lightning bolt icon in teal. Element name in the game's monospace font. Fix description beneath. Expected pass rate improvement in a large numeral: "+9%". Below that, three small horizontal bars showing the pre-ranking signal strengths (pivot-activity, recency, volatility), each bar filled proportionally and labeled.

Right column: the THOROUGH result, rendered with the crosshair icon in violet. Same layout. Expected pass rate: "+14%". Below that, the scenarios-fixed count: "32 of 47 failing scenarios."

Between the two columns, a vertical divider with an arrow — a stylized divergence glyph that visually says "these are not the same." The arrow points from QUICK to THOROUGH, tracing the diagnostic journey.

Below both columns, a banner: the divergence classification. "SYMPTOM-BEFORE-CAUSE" in uppercase, teal on dark, with a one-line summary: "QUICK found the downstream reaction. THOROUGH found the upstream source." A confidence badge: "78% confidence."

Bottom strip: the player's username, the mission name, the date, and a small QR code linking to the full interactive export (if the player opted in to web hosting). The strip has the same "classified document" border treatment used in necropsy Diff Reports — a thin amber rule with corner brackets, reinforcing the diegetic fiction that this is an official diagnostic artifact.

**Sensory design:** The card has weight. The dark background isn't flat — it has a barely-visible noise texture, like brushed metal under low light. The lightning bolt icon has a slight glow — not animated, but a soft radial gradient suggesting residual energy. The crosshair icon has a sharper, colder glow — precise, clinical. The divergence arrow between them is rendered in a gradient from teal (QUICK's color) to violet (THOROUGH's color), the transition happening at the midpoint. The classification banner at the bottom has a subtle embossed effect — the text is raised a pixel above the background, catching imaginary light from above. The QR code is rendered in the game's teal, not standard black, integrating it into the aesthetic rather than treating it as a foreign element.

### Format B: "The Divergence Clip" — Animated Export

A 10-18 second video (MP4 with audio, or GIF without) capturing the animated causal trace plus the side-by-side result reveal. This is the pedagogical artifact — the content that teaches viewers who weren't present during the session.

**Structure of the clip:**

**Seconds 0-3: The Setup.** The battlefield at the pivot tick. Units in position. A subtle ambient hum — the battlefield's baseline audio. A small overlay in the top-left: "DIVERGENCE // MISSION 12 // TICK 52". The board is slightly dimmed, establishing that this is a replay, not live action.

**Seconds 3-6: The THOROUGH Reveal.** RELAY-C illuminates with the violet ring. A low, resonant tone — a single sustained note, like a cello harmonic. The label materializes: "MINIMUM FIX." The ring pulses once, then steadies. Everything else on the board dims further.

**Seconds 6-9: The Causal Trace.** From RELAY-C, an amber signal arc traces forward — a dotted line that draws itself tick by tick, showing the path the failed signal would have taken. The arc curves across two tiles and arrives at SCOUT-B. SCOUT-B lights up amber. A higher, thinner tone joins the cello — a violin harmonic, dissonant by a semitone, creating a tense interval. Label: "PRE-RANKING FOUND THIS."

**Seconds 9-12: The Connection.** A dotted line draws between RELAY-C and SCOUT-B. The line is the teal-to-violet gradient. A caption fades in at the bottom of the frame: the one-line divergence summary. "QUICK found the downstream reaction. THOROUGH found the upstream source." The two tones resolve — the violin adjusts a semitone to create a perfect fifth with the cello. The resolution is subtle but physically satisfying.

**Seconds 12-16: The Cards.** The battlefield slides to the left half of the frame. The right half fills with the two result cards — QUICK above, THOROUGH below. Pass rate improvements visible. The divergence type badge between them: "SYMPTOM-BEFORE-CAUSE." A soft percussive hit — the kulintang gong sound from the Inspector's gold diamond reveal — marks the card materialization.

**Seconds 16-18: The Watermark.** A small game logo fades in at the bottom-right. The player's username appears below the logo. The clip holds for 2 seconds, then fades to black.

**Audio design:** The clip's audio is critical. The cello-violin tension-and-resolution motif is the divergence's sonic identity — a two-note phrase that becomes recognizable to the community. When a veteran hears it in someone else's clip, they know instantly: "that's a divergence export." The kulintang gong anchors the clip to the broader Inspector audio vocabulary. The ambient battlefield hum provides spatial grounding — this happened on a real board, not in an abstract analysis screen.

### Format C: "The Divergence Dossier" — Interactive Web Export

A hosted web page (or in-game viewer) containing all five layers in an explorable format. This is the deep-dive artifact for serious community analysis — the equivalent of a detailed incident report with live data.

The dossier opens with the Divergence Card (Format A) as a hero image. Below it, the animated causal trace plays inline (auto-paused, click to play). Below that, expandable sections:

- **Pre-Ranking Analysis:** The signal breakdown table — pivot-activity, recency, volatility scores for the top 5 candidates. Sortable columns. The viewer can see exactly why the pre-ranking ranked SCOUT-B first and RELAY-C fourth.
- **Simulation Results:** The THOROUGH evaluation table — all candidates that were tested, their fix magnitudes, their scenarios-fixed counts. The viewer can see the full search space.
- **Replay Context:** An embedded mini-replay centered on the pivot tick, showing 10 ticks before and 10 ticks after. The viewer can scrub within this window. RELAY-C and SCOUT-B are permanently highlighted.
- **Player's Session Notes:** If the player wrote session notes during the debrief, they appear here. Their interpretation of the divergence, in their own words.
- **Heuristic Autopsy (if unlocked):** The per-signal accuracy table from the player's career history. How often pivot-activity correctly predicted the minimum fix. How often recency misled. This section is gated — only visible if the exporting player has unlocked the autopsy tier.

The dossier is linkable, embeddable, and archivable. It has a permanent URL. It can be referenced in necropsy Diff Reports, Annotated Replays, and Evolution Tree annotations. It becomes a node in the community's knowledge graph of diagnostic events.

---

## Player Journeys

### Journey 1: Tomas, 19, Computer Science Student, Week 4, First Divergence Export

**Context:** Tomas encountered his first QUICK/THOROUGH divergence two sessions ago and was fascinated — the animated causal trace showed him a Symptom-Before-Cause pattern that reminded him of a debugging exercise in his data structures class. He's been waiting for another divergence so he can share it with his study group.

FADE IN:

INT. TOMAS'S DORM ROOM - EVENING

Laptop screen. The debrief panel. Mission 14 — "Distributed Relay Grid." Tomas has just run THOROUGH after QUICK suggested modifying STRIKER-A's engagement range.

The side-by-side cards appear. QUICK: STRIKER-A, engagement range -1. Expected +7%. THOROUGH: RELAY-D, compression priority reorder. Expected +18%.

TOMAS
(leaning forward)
There it is. That's a big gap.

He clicks "Why different?" The animated causal trace begins. RELAY-D lights violet. The signal arc traces forward through two intermediate relays, arriving at STRIKER-A in amber. The caption reads: "RELAY-D's compression dropped a priority signal. STRIKER-A engaged the wrong target because it never received the updated threat assessment."

TOMAS
(reaching for his phone, opening Discord)
This is exactly what happened in the hash table lab. You fix the collision at the probe point and you miss the resize trigger upstream.

He looks at the debrief panel. Below the divergence explanation, a new button he hasn't noticed before: an upward arrow icon with a small film-strip badge. He hovers. Tooltip: "Export divergence."

He clicks. A modal appears: three format options arranged horizontally. Left: a static card preview — the Divergence Card, thumbnail-sized. Center: a play-button triangle over a film-strip — the Divergence Clip. Right: a document icon with expandable sections — the Divergence Dossier.

Tomas clicks the Divergence Clip. A 3-second encoding progress ring. The clip saves to his downloads folder: `divergence-mission14-tick38-symptom-cause.mp4`.

He drags the file into his study group's Discord channel. Types: "Real-time example of symptom vs root cause from Robot Uprising. The game found the downstream effect first, then the exhaustive search found the upstream fix. Sound on — the audio resolution at 0:11 is chef's kiss."

Three replies within ten minutes. One classmate: "Wait, this is from a game? This is better than the textbook diagram." Another: "The violet/amber color coding is genius — I can literally see which element is root cause and which is symptom." A third: "Can you send the interactive version? I want to see the signal tables."

Tomas re-exports as a Divergence Dossier. A hosted URL generates. He pastes it. His classmate opens it, expands the Pre-Ranking Analysis section, and starts comparing signal scores. Ten minutes later, the classmate posts a screenshot of the signal table with a red circle around the recency score: "Look — the recency signal gave STRIKER-A a 0.82 because you modified it last session. That's a textbook false positive. Your recent change was coincidental."

Tomas didn't catch that detail. His classmate, approaching the data fresh, spotted it immediately.

FADE OUT.

### Journey 2: Mei, 34, Staff Engineer, Week 8, Curating a Teaching Collection

**Context:** Mei has been playing Robot Uprising since launch. She runs a #learning-resources channel in the game's Discord server. She has been collecting divergence exports — her own and others' — and organizing them by divergence type. She wants to build a "divergence library" that new players can browse when they encounter their first disagreement between QUICK and THOROUGH.

FADE IN:

INT. MEI'S HOME OFFICE - SATURDAY MORNING

Mei's screen shows a Discord thread titled "Divergence Library v2 — Organized by Type." Four sub-threads, each pinned:

- Symptom-Before-Cause (14 examples)
- Recency Bias (9 examples)
- Volatility False Signal (6 examples)
- Magnitude Gap (11 examples)

She's reviewing a new submission — a Divergence Dossier from a Gold-tier player named @river_arch. She opens the link.

The dossier loads. Hero image: the Divergence Card. QUICK found SCOUT-C, Recency Bias pattern. THOROUGH found COMMAND-A, a unit that hasn't been modified in 12 sessions. The gap: +4% vs. +19%.

MEI
(scrolling to the Pre-Ranking Analysis)
Beautiful example. The recency signal is at 0.91 for SCOUT-C — almost maxed — and 0.03 for COMMAND-A. COMMAND-A was invisible to the heuristic because the player hadn't touched it in weeks.

She expands the Replay Context section. The mini-replay shows COMMAND-A issuing a flawed coordination directive at tick 29. The directive sends two strikers to the same quadrant, leaving the east flank exposed. SCOUT-C, which was recently modified, happens to be on the east flank and gets destroyed — the visible failure. But COMMAND-A's directive is the actual cause.

MEI
(right-clicking the dossier URL, copying)
This goes in Recency Bias. It's the cleanest example I've seen — the recently-modified element is literally the victim, not the perpetrator. COMMAND-A was the silent architect.

She pastes the link into the Recency Bias sub-thread with an annotation: "Tier 1 example. Recently-modified SCOUT-C was destroyed because of an untouched COMMAND-A's bad directive. Pre-ranking blamed the victim. Dossier has full signal tables — look at the 0.91 vs. 0.03 recency gap."

She then opens her own session from last night. A Volatility False Signal divergence — her rarest type. She exports it as a Divergence Clip, watches the 16-second animation to verify it's clear, and posts it in the Volatility False Signal sub-thread: "Only my second VFS. RELAY-B had 24 distinct states — all of them were correct adaptive responses to a chaotic scenario distribution. High volatility from working correctly, not from malfunction."

A new player replies to the library's top-level post: "I just got my first divergence and I was confused. I came here and watched three Symptom-Before-Cause clips. Now I get it. The animation makes it obvious — you can literally see the signal flowing from root cause to symptom. Thank you for organizing these."

Mei pins the reply.

FADE OUT.

### Journey 3: Kwame, 41, Retired Military Analyst, Week 12, Streaming a Live Divergence

**Context:** Kwame streams Robot Uprising three times a week to a small but dedicated audience of 80-120 viewers. His stream format is analytical — he narrates his diagnostic reasoning in real time, often pausing to explain concepts to chat. He treats divergence events as "show segments" — he's learned that his chat engagement spikes when QUICK and THOROUGH disagree.

FADE IN:

INT. KWAME'S STREAMING SETUP - LATE EVENING

OBS is running. Facecam in the bottom-right. The debrief panel fills the screen. Kwame has just run QUICK on a Gauntlet match loss. QUICK says: RELAY-B, buffer size +2.

KWAME
(to chat)
Alright. QUICK says RELAY-B, buffer expansion. That's a reasonable hypothesis — RELAY-B was at 100% buffer utilization during the pivot window. But I have tokens left and this is a close match. Let's see what THOROUGH thinks.

He clicks THOROUGH. The ghost cards begin branching. Chat messages scroll: "here we go," "divergence incoming," "I bet it's the command agent."

THOROUGH completes. Two cards materialize. QUICK: RELAY-B, buffer +2, +6%. THOROUGH: SCOUT-A, detection range -1, +11%.

KWAME
(eyebrows up)
Chat. That's a divergence. And it's not what any of us expected. THOROUGH says SCOUT-A — reduce detection range. That's counterintuitive. Why would making your scout see LESS improve your pass rate?

He clicks "Why different?" The animated causal trace plays. SCOUT-A lights violet. The causal arc shows: SCOUT-A was detecting threats at maximum range, flooding RELAY-B's buffer with early-warning signals. RELAY-B overflowed because SCOUT-A was generating too much input — too many observations, too far away, most of which were irrelevant by the time RELAY-B processed them. Reducing SCOUT-A's detection range means fewer, more relevant observations, which means RELAY-B's buffer doesn't overflow.

KWAME
(pausing, turning to facecam)
Did you see that? The root cause of the relay buffer overflow was the SCOUT generating too much data. The fix isn't "bigger buffer." The fix is "less noise at the source." This is — chat, this is literally the observability problem. More logs doesn't help if your aggregator can't keep up. You reduce the cardinality of your telemetry.

Chat explodes. "clip it," "this needs to go in the divergence library," "KWAME CLIP KWAME CLIP."

Kwame clicks the export button. Selects Divergence Clip. The 16-second animation renders. He also exports the Divergence Card as a static image for his Twitter.

KWAME
(posting the clip to his community Discord)
Gauntlet Season 4, Match 37. "Less data, better decisions." The divergence that taught me to stop brute-forcing buffer capacity. Clip attached.

He posts the Divergence Card to Twitter with the caption: "Robot Uprising just taught me more about observability design than three years of Datadog dashboards. The fix for a buffer overflow wasn't a bigger buffer. It was less noise at the source. 16-second clip in thread."

The tweet gets 400 retweets. Forty of them are from engineers who don't play the game but recognize the observability pattern. Twelve people reply with their own divergence clips showing different manifestations of the same principle — information overload masquerading as capacity problems.

FADE OUT.

---

## Strengths

**Extends necropsy culture to the diagnostic layer.** Config necropsies (7.10) share what the player built and how it evolved. Divergence exports share what the player *learned about debugging itself*. This is a different layer of knowledge — meta-diagnostic rather than architectural — and it has no equivalent in any existing game community format.

**Creates a taxonomized library of diagnostic errors.** Because every divergence export carries a classification tag (Symptom-Before-Cause, Recency Bias, Volatility False Signal, Magnitude Gap), community collections self-organize by error type. Players can browse "all Recency Bias examples" the way a medical student browses case studies by diagnosis. The taxonomy becomes shared vocabulary.

**The animated clip is inherently viral.** A 16-second clip with tension-resolution audio, violet-amber color contrast, and a one-line caption that explains a real engineering concept — this is optimized for Twitter/TikTok/Discord embedding without modification. The clip doesn't require game context to be interesting; the causal trace animation is visually comprehensible to non-players.

**Three export formats serve three audiences.** The Divergence Card (static) serves quick sharing and forum embedding. The Divergence Clip (animated) serves streaming, social media, and teaching. The Divergence Dossier (interactive) serves deep community analysis and archival reference. No single format can serve all three; the trifecta covers the full range.

**Transforms ephemeral insight into persistent knowledge.** Without export, a divergence event is experienced once and forgotten. With export, it becomes reference material. A player who encounters a confusing Volatility False Signal in Month 6 can search the community library, find three annotated examples, and understand the pattern in minutes. The export system converts individual learning moments into community knowledge infrastructure.

---

## Weaknesses

**"This is why QUICK was wrong" framing is reductive.** QUICK wasn't wrong — it found a valid fix using a fast heuristic. The export format risks creating a community narrative that QUICK mode is inferior, discouraging players from using it. The framing must consistently position QUICK as "fast approximation" rather than "incorrect answer," but community shorthand will compress this nuance. Shared clips will be captioned "QUICK was wrong again lol" regardless of careful in-game framing.

**Divergence classification confidence varies.** The export embeds a scenario type label (e.g., "Symptom-Before-Cause, 78% confidence"). In community circulation, the confidence qualifier will be cropped, ignored, or forgotten. A misclassified divergence — labeled "Recency Bias" when it was actually a Volatility False Signal — becomes authoritative misinformation if it enters a community library without scrutiny. The static card format is especially vulnerable: no room for caveats.

**Export volume may overwhelm community channels.** If divergence events occur in roughly 25% of Fix Explorer sessions, and the export button is frictionless, community channels will be flooded with divergence posts. Most will be unremarkable — Magnitude Gap divergences where QUICK found a +3 fix and THOROUGH found a +1 fix on the same element. The community needs curation mechanisms (voting, minimum-gap thresholds for "interesting" divergences) that the game itself cannot enforce.

**The Divergence Dossier requires hosting infrastructure.** The interactive format with embedded mini-replays, sortable tables, and expandable sections is a web application, not a file. Hosting, serving, and maintaining these dossiers at scale is a nontrivial infrastructure commitment. Dead links to dossiers that no longer exist would undermine the archival value. The static card and animated clip avoid this problem entirely — they're self-contained files.

**Privacy surface.** The Heuristic Autopsy layer contains the player's career-long per-signal accuracy stats. Some players may not want to expose their diagnostic accuracy profile publicly. The export must default to excluding the autopsy layer, with an explicit opt-in. But even Layers 1-3 reveal the player's config element names, fix magnitudes, and pass rates — information that a competitive opponent could use to reverse-engineer their architecture.

---

## Interaction Effects

**With 7.10 — Config necropsy culture.** Divergence exports become a sub-genre of necropsy content. A Changelog necropsy shows config evolution across versions; a divergence export shows the diagnostic reasoning at a single version transition. The two formats are complementary — a necropsy annotation might reference a divergence dossier: "Between v5 and v6, I applied the THOROUGH fix from this divergence [link]. The divergence was Symptom-Before-Cause — my QUICK fix would have addressed the scout, but the relay was the actual problem." This cross-linking creates a richer narrative than either format alone.

**With 4.23 — Replay annotated export.** The replay annotated export (4.23) already defines what debrief content is shareable. The divergence export extends this format with three new data fields: QUICK result, THOROUGH result, and divergence classification. The mini-replay embedded in the Divergence Dossier should use the same replay format and viewer as 4.23 exports — same controls, same annotation pin rendering, same scrubber behavior. Players should not encounter two different replay viewer UIs.

**With 4.61 — QUICK vs. THOROUGH explainer.** The explainer is the source content; the export is the distribution mechanism. Design changes to the explainer (new divergence types, revised causal trace animation, updated narrative templates) automatically propagate to new exports but not to old ones. Old dossiers will show outdated explainer formats — acceptable for archival purposes, but the community library should version-tag exports so viewers know which explainer version generated them.

**With 4.82 — Divergence type distribution.** Community-aggregated divergence exports create a natural dataset for analyzing which divergence types are most common. If 60% of shared divergences are Symptom-Before-Cause and only 5% are Volatility False Signal, the community learns something about the pre-ranking's failure modes — and so does the development team. Divergence export data, anonymized and aggregated, is a free telemetry channel for tuning the pre-ranking heuristic.

---

## Comparable Games and Media

**Opus Magnum GIF culture.** Opus Magnum's one-click GIF export created a viral sharing ecosystem on Reddit and Twitter. The key insight: the export showed the *solution*, which was inherently interesting because it was the player's creative expression. Divergence exports show the *diagnostic process*, which is a harder sell — but targets a different audience (engineers, analysts, systems thinkers) who find diagnostic reasoning inherently fascinating. The Opus Magnum lesson to preserve: zero-friction export. The lesson to adapt: divergence clips need narrative structure (setup, tension, resolution) that Opus Magnum's looping clockwork GIFs didn't require.

**Google SRE postmortem sharing.** Google's SRE team publishes selected incident postmortems externally. Each postmortem follows a standard template: summary, impact, root cause, timeline, lessons learned. The divergence dossier's structure directly parallels this — and the community practice of collecting and browsing divergences by type mirrors how engineering organizations categorize incidents by failure mode. The pedagogical mechanism is identical: reading other people's failure analyses teaches you to recognize patterns in your own work.

**Chess engine analysis sharing.** After a chess game, players run engine analysis (Stockfish, Leela) and share annotated games where the engine's suggested move differs from the player's choice. The divergence icon (engine's move vs. played move) is visually highlighted in chess viewers. Robot Uprising's QUICK/THOROUGH divergence is structurally similar — two "engines" (heuristic vs. exhaustive) disagreeing — except the game explicitly explains WHY they disagree, which chess engines do not. The divergence export makes this explanation shareable in a way that chess annotation has never achieved for engine disagreements.

**Medical case report format.** Medical journals publish standardized case reports: presentation, diagnosis, differential diagnosis, treatment, outcome. The Divergence Dossier's structure (QUICK result, THOROUGH result, classification, causal trace, outcome) mirrors the case report format. Medical education relies heavily on case report libraries organized by diagnosis — exactly the community library pattern that Mei's journey describes. The parallel is precise: divergence types are diagnoses, divergence exports are case reports, the community library is a teaching hospital's case archive.

---

## Sensory Description: The Export Button Moment

The player has just watched the animated causal trace. The violet ring around the upstream element. The amber arc tracing to the downstream symptom. The caption settling: "QUICK found the reaction. THOROUGH found the source." The two tones resolving into a perfect fifth.

A moment of stillness. Then, in the bottom-right corner of the divergence explanation panel, a new element fades in — not suddenly, but with a 0.6-second opacity ramp, as if materializing from the same substrate as the causal trace itself. An upward-pointing arrow icon, rendered in the teal-to-violet gradient. A small film-strip badge in the corner. The icon has a barely perceptible breathing animation — a 0.5px expansion and contraction on a 4-second cycle. It is alive but patient. It does not demand attention. It waits.

The player hovers. The icon steadies — the breathing stops, replaced by a soft glow. A tooltip materializes with the paper-unfold animation used throughout the Inspector: two triangles folding open from the icon's anchor point. Text in the game's monospace font: "Export this divergence."

The player clicks. A modal slides up from the bottom of the screen — not a pop-up that blocks the view, but a drawer that pushes the divergence explanation upward. Three format cards, arranged horizontally on the dark background:

Left card: the Divergence Card preview. A miniature version of the static image — the two result columns, the divergence arrow, the classification banner. All visible at thumbnail scale. Below the preview: "Static image — for Discord, forums, social media." A file-size indicator: "~340 KB."

Center card: the Divergence Clip preview. A small play button over a frozen frame of the causal trace animation — RELAY-C in violet, the amber arc mid-trace. Below: "Animated clip — 16 seconds with audio." Format toggles: "MP4" (selected by default, with a small speaker icon indicating audio) and "GIF" (with a muted-speaker icon and a note: "no audio, larger file"). File-size indicator: "~2.1 MB (MP4) / ~4.8 MB (GIF)."

Right card: the Divergence Dossier preview. A document icon with expandable section lines suggesting the layered structure within. Below: "Interactive dossier — full analysis, replay context, signal tables." A toggle: "Include heuristic autopsy?" (default off, with a small lock icon if not yet unlocked). Below: "Hosted link — shareable URL."

The player selects the Divergence Clip. Clicks "Export." A progress ring appears in the center card — cyan, spinning for 2-3 seconds as the deterministic replay engine re-renders the causal trace at export resolution. The ring completes. A checkmark replaces it — a single, clean stroke that draws itself in 0.3 seconds. Below: the file path where the clip was saved, and two buttons: "Copy to clipboard" and "Open folder."

The export drawer lingers for 2 seconds, then begins to slide back down. The divergence explanation panel settles back to its original position. The export icon in the bottom-right now has a small green dot — a persistent indicator that this divergence has been exported. If the player exports again, the dot pulses once: "already exported; export again?"

The file sits in the downloads folder. Sixteen seconds of violet and amber. A signal arcing across two tiles. Two tones resolving. A caption that a viewer who has never played the game can read and understand: "The fast search found the symptom. The thorough search found the source."

The next time someone in a Discord server asks "what does a divergence look like?", there is an answer. Not a description. Not a screenshot of the debrief panel. A designed artifact — color-coded, audio-scored, captioned, and filed under SYMPTOM-BEFORE-CAUSE in a growing library of moments where two algorithms disagreed and the game taught someone why.
