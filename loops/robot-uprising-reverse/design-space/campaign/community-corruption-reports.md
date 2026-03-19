# 5.11d — Community Corruption Reports

**Aspect ID:** 5.11d
**Wave:** 5 (Campaign & Progression)
**Category:** Campaign
**Related aspects:** 5.11a (document-as-corrupted-surface), 5.11b (corrupted diff endgame), 5.11c (document recovery missions), 5.11e (corruption as enemy characterization), 6.10a (corruption audio learning curve), 4.11 (foreign fingerprint visual language), 7.03e (config codes), 5.22 (Gauntlet as third act)

---

## The Core Idea

Robot Uprising's corruption mechanic (5.11a-e) creates a unique artifact that no other game produces: **the corrupted document itself is interesting to look at**. A Surgeon's single-digit edit hidden in an otherwise clean page. The Censor's black bars stamped with bureaucratic authority. The Mimic's eerily plausible injections that took three re-reads to catch. These are visual objects with stories embedded in them — stories about deception, detection, near-misses, and the moment of realization.

**Community corruption reports** is the social layer that turns private detection moments into shared cultural artifacts. When a player catches a Surgeon edit that almost killed their entire scout formation, the screenshot they take is a natural social object — it contains a puzzle (can you spot it?), a story (I almost didn't), and a demonstration of skill (I caught it in time). The corruption mechanic generates content that is **inherently shareable** without any design effort, but deliberate design can amplify this into a core community identity loop.

The real-world parallel is the cybersecurity community's culture of sharing threat intelligence reports, CVE disclosures, and incident post-mortems. Security researchers post teardowns of malware they found. Bug bounty hunters share (sanitized) reports of vulnerabilities they discovered. The Robot Uprising community would develop the same culture — except instead of real malware, they're sharing screenshots of fictional AI corruption they detected in a game's tactical documents. The skill transfer is direct: the habit of documenting, sharing, and collectively analyzing adversarial artifacts.

**The design claim:** Corruption detection is already a compelling single-player mechanic. Making it social transforms it from a puzzle into an identity — "I'm the person who found this." The community becomes a distributed corruption detection network, collectively developing expertise that exceeds any individual player's, exactly mirroring how real threat intelligence communities operate.

---

## The Social Loop: "The Corruption Beat"

The core social loop has five stages, each feeding the next:

1. **Detection** — The player encounters corruption in their tactical document. They catch it (or don't catch it and lose the mission, then catch it in debrief).
2. **Documentation** — The player takes a screenshot, annotates it, captures the moment. The game provides tools to make this easy and visually compelling.
3. **Sharing** — The player posts their corruption report to a community space (Discord, Reddit, in-game gallery, social media).
4. **Recognition** — Other players react: validate the difficulty of the catch, share their own near-miss stories, analyze the corruption personality responsible.
5. **Education** — The shared report teaches other players what to look for. The community's collective detection literacy rises. Players enter their next mission slightly better at spotting the Surgeon's single-digit edits.

This is identical to the loop that drives r/MalwareAnalysis, CTF writeup communities, and bug bounty leaderboards. The key insight: **the content being shared is educational by nature**. A corruption screenshot is simultaneously entertainment ("look what I found"), a puzzle ("can you spot it?"), and a lesson ("here's what the Mimic does to table headers"). The social loop IS the learning loop.

---

## Six Design Approaches

### Approach A: "The Trophy Case" — In-Game Screenshot Gallery

The game includes a built-in corruption gallery accessible from the campaign map. Every corruption the player detects is automatically logged with a timestamp, mission number, corruption personality, and a snapshot of the document state at the moment of detection.

**How it works:**
- When a player uses the diff view or manually marks a corruption, the game captures a "corruption card" — a formatted screenshot showing the corrupted text with the corruption highlighted in amber, the clean version in cyan below it, and metadata (mission, tick detected, personality, severity)
- Cards accumulate in a personal gallery organized by corruption personality (Surgeon shelf, Censor shelf, Mimic shelf, etc.)
- Each card has a "Share" button that exports a formatted image with the game's visual identity — circuit-board border, corruption type icon, player name, mission province
- A "Rarest Catches" section highlights corruptions that required multiple re-reads or that the player initially missed

**Strengths:** Zero friction. The gallery populates automatically. The share format is consistent and branded — every shared screenshot looks like it belongs to Robot Uprising. The personality-organized shelves teach players to categorize threats.

**Weaknesses:** Passive. The gallery exists but doesn't incentivize sharing. Players who don't already share screenshots won't start just because there's a gallery. No social feedback loop within the game itself.

---

### Approach B: "The Bulletin Board" — Community-Curated Weekly Showcase

A meta-game layer where the community votes on the most interesting corruption encounters each week. "Corruption of the Week" becomes a recurring event that gives the community a shared rhythm.

**How it works:**
- Players submit corruption cards (from Approach A) to a community board — either in-game or via Discord/Reddit integration
- Each submission includes the corruption card image plus a short player-written description ("Almost walked my whole scout formation off a cliff because the Surgeon changed patrol radius from 5 to 2")
- The community votes (upvotes, reactions, emoji responses)
- Weekly winners get featured on a rotating "Bulletin Board" visible on the campaign map — a small noticeboard texture pinned to the side of the archipelago, showing the top 3 corruption reports of the week with player names
- Monthly compilations create "threat intelligence digests" — community-authored documents about emerging corruption patterns

**The name: "The Dead Letter Drop."** The bulletin board is themed as an intelligence dead drop — a corkboard with push-pinned reports, red string connecting related corruptions, coffee stains, margin annotations. The aesthetic is spy thriller meets cybersecurity war room.

**Strengths:** Creates a recurring social event. Gives community members recognition. The voting mechanic surfaces the most educational and entertaining reports. The "threat intelligence digest" format directly mirrors real-world cybersecurity community practices.

**Weaknesses:** Requires an active community of sufficient size. The first weeks before critical mass will feel empty. Moderation burden. Potential for low-quality submissions drowning out genuine catches.

---

### Approach C: "The Spotter's Badge" — Achievement-Driven Detection Sharing

Detection achievements that unlock cosmetic rewards and are visible to other players. The act of finding corruption earns badges that signal expertise.

**How it works:**
- Tiered detection achievements: "First Catch" (detect any corruption), "Surgeon's Rival" (detect 5 Surgeon corruptions), "The Auditor" (detect every corruption in a single mission), "Ghost Hunter" (detect a Ghost-subsystem retroactive corruption), "Perfect Read" (complete a mission with zero missed corruptions across all document pages)
- Each badge is a small icon displayed on the player's profile and next to their name in community spaces
- Badges have a "story" attached — clicking shows the specific corruption card that earned it
- The rarest badge, "The Paranoid" (detect a corruption that was designed to be undetectable by the diff view, purely through manual reading), is displayed in gold

**Strengths:** Directly incentivizes detection skill improvement. Badges are social signals — they communicate expertise without requiring the player to write anything. The "story" attachment means every badge is a corruption report by default.

**Weaknesses:** Achievements can reduce intrinsic motivation. Players might hunt corruptions for badges rather than for the detection skill itself. The rarity system might make common corruptions feel unrewarding.

---

### Approach D: "The Field Report" — Structured Post-Battle Corruption Debrief

The Inspector phase (post-battle) includes a dedicated "Corruption Debrief" panel that formats the player's detection performance into a shareable report card.

**How it works:**
- After the sealed watch and standard Inspector debrief, a third tab appears: "Field Report"
- The Field Report shows: number of corruptions present in the pre-battle document, number detected before execution, number missed, and for each corruption — the personality responsible, the specific change made, and whether the player's configuration would have been affected
- A "Near Miss Index" (NMI) score calculates how close each missed corruption came to causing a unit loss. An NMI of 0.95 means "this corruption was one tick away from killing your scout"
- The Field Report is formatted as a single shareable image with the game's visual identity
- A "Compare" button shows how your detection rate compares to the community average for that mission

**The name: "The After-Action Report" (AAR).** Directly borrowed from military and cybersecurity terminology. The report format mirrors real incident response post-mortems.

**Strengths:** Structured data makes comparisons meaningful. The NMI score creates dramatic near-miss stories ("I missed a Surgeon edit with an NMI of 0.98 — my striker was literally one tile away from walking into an ambush"). The community comparison normalizes detection difficulty — "oh, 70% of players missed this one too, I don't feel so bad."

**Weaknesses:** The third-tab placement might mean many players never see it. The NMI calculation requires the game to simulate counterfactuals (what would have happened if the corruption went undetected), which adds computational complexity.

---

### Approach E: "The Corruption Atlas" — Community-Aggregated Pattern Database

A persistent, evolving database of all corruption patterns encountered across the entire player base, organized by personality, mission, and detection method.

**How it works:**
- Every detected corruption is anonymously aggregated into a shared database
- The Atlas is browseable by corruption personality, mission number, affected document section, and detection method (diff view, manual reading, audio cue, comparison to memory)
- Heat maps show which corruptions are caught most and least frequently
- "Detection rate" per corruption instance shows the percentage of players who caught it vs. missed it — creating a difficulty rating for each corruption
- The Atlas is accessible from the Blueprint Codex as a new section: "Threat Intelligence"

**The name: "The MITRE ATT&CK Board."** Named after the real-world MITRE ATT&CK framework that catalogs adversary techniques. The in-game version catalogs enemy corruption techniques with the same taxonomic rigor. The visual treatment is a grid matrix with corruption personalities as rows and techniques as columns, cells colored by detection rate (green = most players catch it, amber = 50/50, red = most players miss it).

**Strengths:** The most educational approach. Players who browse the Atlas before a mission are pre-loading their detection awareness. The detection-rate coloring creates natural difficulty signals. The MITRE ATT&CK parallel is a direct cybersecurity skill transfer — players who encounter the real MITRE ATT&CK framework later will immediately recognize the organizational structure.

**Weaknesses:** Spoiler risk. A player who reads the Atlas for Mission 9 before playing Mission 9 has lost the surprise of discovering those corruptions naturally. The Atlas works best as a post-clear reference, not a pre-mission cheat sheet. Gating by mission completion solves this but reduces the community education benefit.

---

### Approach F: "The Whisper Network" — Recommended Hybrid

Combine the strongest elements of A through E into a progressive system that grows with the community:

**Phase 1 (Launch):** Trophy Case (A) + Field Report (D). Every player gets automatic corruption cards and After-Action Reports. Sharing is one button away but not required. The infrastructure exists before the community does.

**Phase 2 (Community Formation):** Bulletin Board (B). Once enough players are sharing, introduce "Corruption of the Week" as a community event. The Dead Letter Drop appears on the campaign map. Weekly featured reports rotate.

**Phase 3 (Maturity):** Corruption Atlas (E). Once the aggregate data is meaningful, open the MITRE ATT&CK Board. Gate each mission's Atlas entries behind mission completion to prevent spoilers. The Atlas becomes the community's collective memory.

**Badges (C)** layer across all phases as persistent progression markers.

**The name for the whole system: "The Whisper Network."** In-universe, it's the player AI's collective intelligence network — every AI in the uprising sharing threat intelligence about enemy corruption patterns. The name captures both the social (whisper = sharing secrets) and the adversarial (network = organized resistance) dimensions.

---

## Player Journeys

### Journey: Sofia, 15, High School Student, Casual Gamer

**Context:** Mission 8, second playthrough. Sofia lost her first attempt because a Surgeon corruption changed her relay's listen filter from "threat" to "resource" — all threat signals were silently ignored, and her formation walked into an ambush. She caught the corruption in the Inspector debrief. Now she's replaying with heightened awareness.

**Minute 0:00 — The Document Review**
Sofia opens her tactical document for Mission 8. The Zambales volcanic coast province glows gold on the campaign map behind the document overlay. She remembers the Surgeon from last time and starts reading slowly, checking every number. The document is three pages: unit configuration reference, enemy patrol patterns, and terrain interaction tables. She reads page one. Everything looks clean. No diff view yet — she's trained herself to read first, diff second.

**Minute 1:30 — The Catch**
Page two. Enemy patrol patterns table. Row three: "Scout patrol cycle: 4 ticks." Sofia pauses. She remembers from Mission 7 that scout patrol cycles were 3 ticks. She hovers over the number. No visual corruption artifact — the Surgeon never leaves traces. But the number feels wrong. She opens the diff view. The split pane appears: left panel shows "3 ticks" in the baseline, right panel shows "4 ticks" in current. Amber highlight. The Geiger counter clicks softly — one quiet tick, almost gentle. She clicks RESTORE. The 4 dissolves into golden particles that reform as 3. A clear ascending chime. The Surgeon's work, undone.

**Minute 2:00 — The Trophy Case Moment**
A notification slides in from the bottom-right corner of the screen: a small corruption card — formatted with the circuit-board border, showing the corrupted text ("4 ticks") crossed out in amber and the clean text ("3 ticks") in cyan below it. The card reads: "SURGEON CORRUPTION DETECTED — Mission 8, Zambales. Patrol cycle parameter. Detected via manual reading before diff confirmation." A small gold star icon appears on the card — "Manual Catch" bonus, awarded because Sofia spotted it before running the diff. She taps the card. It flips to show a "Share" button and an "Add to Gallery" button. She taps Share.

**Minute 2:30 — The Share**
The share dialog offers format options: image (for Discord/Reddit), clipboard (for chat), or direct-to-gallery (in-game Whisper Network). Sofia picks image. The game generates a formatted PNG: her corruption card centered on a dark background with circuit-board traces, the Robot Uprising logo in the corner, her player name, and a small Philippine archipelago silhouette with Zambales highlighted in amber. She saves the image and alt-tabs to her school's gaming Discord. She posts it in #robot-uprising with the caption: "almost fell for the same Surgeon trick TWICE. check your patrol numbers people."

**Minute 3:00 — The Social Feedback**
Three classmates react within minutes. One replies: "wait the patrol was 3?? I thought it was 4 this whole time. I've been playing Mission 8 with wrong patrol data." Another posts their own corruption card from the same mission — a different Surgeon edit on a different parameter. A third replies with a screenshot of their After-Action Report showing an NMI of 0.91 on a corruption they missed. A conversation about Surgeon detection strategies unfolds. Sofia learns that one classmate always checks numerical values against a handwritten cheat sheet they keep on paper beside their laptop — a habit they developed from playing the game, which is exactly how real security analysts maintain out-of-band verification records.

**Minute 8:00 — Back to the Game**
Sofia returns to her document. She now checks the remaining pages with even more care, cross-referencing every number against her memory of Mission 7. She finds no more corruptions — or at least, none she can detect. She proceeds to the workbench with slightly higher confidence, knowing the patrol cycle is 3, not 4. Her scout formation survives. In the After-Action Report, she scores 100% detection rate for this mission. The Field Report card shows: "1/1 corruptions detected. 1 Manual Catch. NMI avoided: 0.87."

**UI Annotations:**
- **Corruption card notification:** Bottom-right slide-in, 48x64px card preview, circuit-board border in dark teal, 3-second auto-dismiss with "hold to expand" behavior
- **Share dialog:** Modal overlay, three format buttons (Image / Clipboard / Gallery), preview pane showing the generated share image at actual size
- **Share image format:** 1200x630px (Twitter/Discord optimized), dark #1a1a2e background, circuit-board trace pattern at 8% opacity, corruption card centered, game logo bottom-left, player name bottom-right, province silhouette top-right with amber highlight
- **Gallery shelf:** Horizontal scrollable row of corruption cards per personality type, newest on left, gold star overlay on manual catches, tap to expand to full After-Action context

---

### Journey: Marcus, 42, DevOps Engineer, Hardcore Strategy Player

**Context:** Mission 10, Taal Volcano — final mission. Marcus has completed every previous mission with 100% corruption detection. He maintains a personal spreadsheet of every corruption he's encountered, organized by personality. He's been posting his corruption analyses to the game's subreddit for weeks, earning a reputation as the community's de facto corruption taxonomist. He has the "Paranoid" badge — the rarest detection achievement, earned for catching a diff-invisible corruption in Mission 9 through manual reading alone.

**Minute 0:00 — The Pre-Mission Ritual**
Marcus opens the tactical document for Mission 10. Before reading a single word, he opens the Corruption Atlas — the MITRE ATT&CK Board — in a second tab. He reviews the community detection rates for Mission 9: the hardest corruption (a Mimic injection in the terrain interaction table) was caught by only 12% of players on first read. He wrote the analysis post that helped push that number from 8% to 12%. He scrolls to Mission 10's section — locked behind a "Complete Mission 10" gate, showing only the text "Intel unavailable — mission incomplete." He closes the Atlas. No help here. He's going in blind.

**Minute 1:00 — The Deep Read**
Marcus reads the document page by page, line by line. He has his personal detection protocol: (1) read for content, (2) read for tone inconsistencies, (3) read for numerical plausibility, (4) check formatting and spacing anomalies, (5) run the diff view last. This is his fourth pass through the game's corruption system, and his protocol has evolved through community discussion — three of the five steps were suggested by other players' posts on the subreddit.

He finds three corruptions in the first four minutes: a Censor redaction (obvious — thick black bar), a Surgeon numerical edit (patrol timing changed from 2 to 3), and a Mimic injection (an extra paragraph in the relay configuration section that reads plausibly but recommends a suboptimal listen filter). He catalogs each mentally, noting the personality signatures. The Censor is new — Mission 10 usually doesn't feature Censor corruptions, according to the community's running pattern analysis. Is this a new enemy configuration, or is his community data wrong?

**Minute 5:00 — The Post That Writes Itself**
Marcus pauses the document review. He opens a text file on his desktop and starts drafting a corruption report — not for sharing yet, but for his own records. He writes: "M10 Taal — Surgeon on patrol timing (expected), Mimic on relay config (expected), Censor redaction on... what section was redacted? The terrain interaction table for volcanic tiles. This is unusual. Censor typically operates on skill descriptions and hook configurations. Terrain data is new territory (pun intended). Possible new enemy subsystem deployment pattern? Or randomization variance?"

He returns to the game, completes his document review, finds two more corruptions (both Surgeon — precision edits on context window sizes), and runs the diff view for confirmation. The diff catches four of the five corruptions he identified. The fifth — the Mimic injection — doesn't show in the diff because the Mimic's content was injected as an addition, not a modification. The diff only compares existing content, not new content. Marcus nods. He expected this. He marks the injection manually, watches the amber highlight dissolve into golden particles as the injected paragraph lifts off the page and disintegrates, each word fragmenting into individual characters that scatter like ash.

**Minute 8:00 — The After-Action Masterclass**
After the mission (which he wins on first attempt), the After-Action Report shows 5/5 corruptions detected, 2 Manual Catches, and a community comparison placing him in the top 3% of Mission 10 detection rates. He screenshots the entire Field Report. He also takes individual corruption card screenshots for each of the five corruptions, paying special attention to the Censor redaction — the anomalous one.

He posts to the subreddit: "M10 Corruption Report — Anomalous Censor Deployment on Terrain Data (Full AAR)" with a gallery of six images (five corruption cards + the full Field Report). The post body includes his analysis of why the Censor operating on terrain data is unusual, a theory about whether this indicates a new enemy subsystem configuration in Mission 10, and an invitation for other players to share whether they also encountered a Censor on terrain data or whether the randomization system produced different corruption placements for different players.

The post gets 847 upvotes and 134 comments. A subthread develops where three players compare their Mission 10 corruption placements and discover that the corruptions are partially randomized — the personalities are fixed (always a Surgeon, always a Mimic, always a Censor) but the target parameters vary between playthroughs. This finding gets crossposted to the game's wiki. Marcus is credited in the wiki edit. The community has produced a genuine piece of collective intelligence about the game's corruption system — intelligence that no single player could have generated alone.

**UI Annotations:**
- **Corruption Atlas (MITRE ATT&CK Board):** Grid matrix, corruption personalities as rows (Surgeon/Censor/Mimic/Architect/Vandal/Ghost), technique categories as columns (numerical edit, section redaction, content injection, structural modification, formatting disruption, retroactive activation). Cells colored by community detection rate: green (>80%), amber (40-80%), red (<40%), grey (no data / locked). Hover shows sample corruption card
- **After-Action Report community comparison:** Horizontal bar showing player's detection percentile. Segmented by: overall, per-personality, manual-vs-diff detection. Tappable segments expand to show distribution curves
- **"Paranoid" badge:** Gold circuit-board hexagon with a single open eye in the center, subtle pulse animation, tooltip reads "Detected a diff-invisible corruption through manual reading — Mission 9"

---

### Journey: StreamerChef_TTV, 28, Twitch Streamer, Content Creator

**Context:** Regular Robot Uprising streamer with 2,400 average viewers. Running a weekly "Corruption Challenge" stream where viewers submit corruption screenshots and the chat tries to identify the personality before StreamerChef reveals the answer. This is the 11th episode of the series.

**Minute 0:00 — The Show Open**
StreamerChef opens the stream with a custom overlay: the Dead Letter Drop aesthetic — a corkboard filling the left third of the screen, with the game running in the remaining two-thirds. Pinned to the corkboard are the previous 10 weeks' winning corruption cards, each connected by red string to a personality label. The stream title reads: "CORRUPTION CHALLENGE #11 — Can Chat Spot the Surgeon? | !corrupt to submit"

Chat is already active. A viewer types "!corrupt" and a bot posts a formatted corruption card image from their own playthrough — a screenshot of a Mission 9 document page with no visible corruption artifacts. StreamerChef pulls the image onto screen. "Alright chat, we've got a submission from GlitchWitch_99. Mission 9, Bohol hills. The document looks clean. What personality are we looking for?"

**Minute 0:45 — The Community Detection Game**
Chat explodes. "SURGEON" "surgeon 100%" "mimic maybe??" "check the numbers" "zoom on the buffer sizes." StreamerChef zooms in on the document text, reading aloud. "Context window size... 12 slots for relay. That's correct, right?" StreamerChef pulls up a reference card from their own notes — a cheat sheet they built from previous corruption analyses posted by the community. "Relay is 12. Scout is 6. Striker is 8. These all check out."

A viewer donates with the message: "Look at the eviction priority column. Row 4." StreamerChef scrolls. Row 4 of the eviction priority table reads "LIFO" where it should read "FIFO." StreamerChef's eyes widen. "THERE IT IS. Chat, that's a Surgeon edit. One word. LIFO instead of FIFO. GlitchWitch, if you missed that, your relay was evicting the freshest signals instead of the oldest — your whole relay network was backwards." Chat erupts with "SURGEON CALLED IT" and "I missed that live" and a cascade of the game's custom emotes.

**Minute 2:00 — The Reveal and Education**
StreamerChef reveals GlitchWitch_99's After-Action Report: NMI of 0.94 — the LIFO eviction nearly caused a full communication breakdown during the sealed watch. GlitchWitch lost one scout because the relay was evicting the most recent threat signal instead of the oldest environmental noise. "Point nine four NMI, chat. That's a near-death experience from a four-letter word."

StreamerChef pulls up the community Corruption Atlas and navigates to the Surgeon row, eviction-policy column. "Detection rate: 34%. Two thirds of players miss this. And look — if I click into the community notes..." They expand the cell. A community-written note reads: "Surgeon frequently targets FIFO/LIFO and FILO variants. Always verify eviction policy against the Blueprint Codex default." StreamerChef reads this aloud. "That's from the community wiki, written by someone who got burned by exactly this. This is how we learn, chat."

**Minute 4:00 — The Clip Moment**
StreamerChef moves to their own live playthrough of Mission 10. They open the document. Chat immediately starts scanning — hundreds of viewers reading the same document simultaneously, typing suspicious values into chat. "Patrol cycle says 3 — isn't it 2?" "That paragraph about relay placement looks weird, check tone." "THE SPACING IS OFF ON PAGE 3." StreamerChef has effectively turned their stream into a distributed corruption detection network — 2,400 viewers functioning as parallel analysis agents, each with their own detection specialization.

StreamerChef finds a Mimic injection that chat missed — an added sentence about hook configuration that uses the right terminology but recommends a channel name that doesn't exist in the mission. "Chat, this sentence is a Mimic. Read it again. It says to wire hooks to 'alert-grid.' There is no 'alert-grid' channel in this mission. The Mimic made up a channel name." Chat reaction: "NO WAY" "I read that three times and believed it" "mimic is cracked." This 15-second sequence — StreamerChef reading a plausible-sounding sentence, then revealing the single wrong detail that exposes it as a fabrication — gets clipped. The clip hits 18K views on TikTok in 48 hours, tagged #RobotUprising #CorruptionChallenge #SpotTheMimic.

**Minute 8:00 — The Community Artifact**
At stream end, StreamerChef compiles the episode's corruption cards into a "Threat Intelligence Digest" — a formatted image combining all submissions, sorted by personality, with detection rates from chat polls. They post it to the subreddit and Discord. The digest joins the previous 10 in a community-maintained archive. Viewers who missed the stream can browse the digest and test their own detection skills against chat's performance.

The Corruption Challenge has become the game's signature community event — not because the developers built it, but because the corruption mechanic naturally produces shareable, educational, puzzle-like artifacts. StreamerChef's weekly series is effectively a continuing education course in threat intelligence analysis, disguised as entertainment.

**UI Annotations:**
- **Corruption card export format:** Optimized for stream overlay — 16:9 aspect ratio option for direct OBS integration, transparent background option for custom overlays, personality icon in corner (scalpel for Surgeon, black bar for Censor, mask for Mimic)
- **Dead Letter Drop corkboard:** Community-suggested stream overlay template included in the game's press kit / community resources. Cork texture background, push-pin PNGs, red string SVGs connecting corruption cards to personality labels, coffee-ring stain decorative elements
- **Corruption Atlas deep link:** Each corruption cell has a shareable URL that opens directly to that cell in the Atlas. Streamers can link viewers to specific entries. Format: `robotuprising.gg/atlas/surgeon/eviction-policy`
- **Chat integration potential:** A Twitch extension that displays the current document alongside the stream, allowing viewers to highlight suspicious text and submit "corruption reports" in real time. The streamer sees aggregated viewer highlights as a heat map overlaid on the document

---

## Strengths

1. **The content creates itself.** Unlike community challenges that require developer curation (daily challenges, weekly events), corruption reports are player-generated from natural gameplay. Every mission produces new corruption artifacts. The social content pipeline requires zero developer maintenance after the initial tools are built.

2. **Sharing IS learning.** Every shared corruption report is inherently educational. A player who browses community corruption cards is passively training their detection skills. The social loop and the skill-development loop are the same loop. This is rare in game communities — most social sharing (highlight reels, memes) is entertaining but not instructive.

3. **The skill transfers directly.** The habit of documenting, sharing, and collectively analyzing adversarial artifacts is exactly what happens in professional cybersecurity communities. Players who develop the "corruption report" habit are building real threat intelligence sharing practices. The MITRE ATT&CK Board parallel makes this transfer explicit.

4. **Natural difficulty signaling.** Community detection rates per corruption instance create an organic difficulty rating system. A new player can browse the Atlas and see: "Surgeon edits on patrol timing are caught by 78% of players, but Surgeon edits on eviction policy are caught by only 34%." This tells them where to focus their attention. No developer-assigned difficulty labels needed.

5. **Streamer gold.** The corruption mechanic produces natural "can you spot it?" content that works perfectly for interactive streaming. The Corruption Challenge format (viewer submissions + chat detection game) is a content format that essentially invents itself. The 15-second clip of catching a Mimic injection is exactly the kind of content that drives game discovery on TikTok.

---

## Weaknesses

1. **The spoiler problem.** Corruption reports for later missions spoil the detection challenge for players who haven't reached those missions yet. The Atlas's mission-completion gate helps, but community platforms (Reddit, Discord, TikTok) don't have spoiler gates. A player scrolling their feed might see a Mission 10 corruption card that reveals a Mimic injection they haven't encountered yet. Mitigation: mission number is prominently displayed on every corruption card, enabling spoiler-tag discipline.

2. **Cold start problem.** The social features (Bulletin Board, Atlas, community detection rates) require critical mass. The first 1,000 players won't have meaningful aggregate data. The Atlas will be sparse. The "Corruption of the Week" will have few submissions. Mitigation: seed the Atlas with developer-authored corruption analysis entries that get replaced as community data accumulates.

3. **Detection homogenization risk.** As the community collectively documents all corruption patterns, detection becomes less surprising for engaged community members. A player who reads every corruption report knows exactly what to look for — the Surgeon always targets numbers, the Censor always redacts blocks, the Mimic always injects paragraphs. The surprise of first encounter is lost for community-active players. Mitigation: the invisible randomization system (locked design decision) varies corruption targets between playthroughs, so community knowledge tells you *what personality* to expect but not *which specific parameter* is corrupted.

4. **Accessibility asymmetry.** Players who engage with the community have significantly better detection skills than solo players. This creates a knowledge gap that might make certain missions trivially easy for community-engaged players while remaining appropriately challenging for solo players. The game is single-player, so this doesn't create competitive unfairness, but it does affect difficulty calibration.

5. **Moderation burden.** An in-game community gallery requires content moderation — players might submit inappropriate images disguised as corruption cards, or flood the submission system with low-quality entries. External platforms (Discord, Reddit) have their own moderation, but in-game features need developer-maintained moderation systems.

---

## Interaction Effects

- **Corruption as enemy characterization (5.11e):** The personality system IS the sharing vocabulary. Without distinct personalities, corruption reports would be generic ("I found a corruption"). With personalities, every report tells a story about a specific adversary. The community develops personality-specific expertise: some players become Surgeon specialists, others become Mimic detectors. Division of labor emerges naturally.

- **Corrupted diff endgame (5.11b):** The Mission 9 corrupted-diff revelation will be the single most shared moment in the game's community. The screenshot of a diff view showing "No modifications detected" when the document is visibly corrupted — or worse, showing green checkmarks next to values the community knows are wrong — will become an iconic community image. "The diff lied" becomes a meme that transcends the game.

- **Config codes (7.03e):** If players can share blueprint configurations via codes, they can also share the configurations that were affected by corruption. "My config code is X7R-2M4. If you run this, the Surgeon edit on eviction policy will cause a scout chain failure at tick 14." Corruption reports become config-specific, enabling precise reproduction of failure conditions.

- **Gauntlet mode (5.22):** Competitive Gauntlet play will generate the highest-stakes corruption reports. A player who loses a ranked match because they missed a Surgeon edit has a deeply compelling story to share. "I lost Diamond rank because of a four-letter word." The emotional stakes of ranked play amplify the social sharing impulse.

- **Document recovery missions (5.11c):** Recovery missions produce a unique type of corruption report: the before-and-after of a recovered document section. "Here's what the Censor redacted, and here's what I recovered underneath." These reports have narrative drama built in — the hidden content is revealed like a mystery solved.

---

## Comparable Games

**Wordle (viral sharing format).** Wordle's colored grid share format became a global cultural phenomenon because it was simultaneously a result (how you did), a puzzle (can you figure out the word from the grid), and a social signal (I played today). Robot Uprising's corruption cards have the same triple function: result (I caught it), puzzle (can you spot it), signal (I'm playing and I'm skilled). The share format must be as instantly recognizable and compact as Wordle's grid.

**Pokemon Snap (photography as gameplay).** Players were rewarded for capturing the perfect shot of a rare Pokemon. The framing, timing, and composition mattered. Corruption detection has a similar "photography" quality — the player is capturing the perfect evidence of an adversarial artifact. The corruption card is the photograph. The "Manual Catch" gold star is the composition bonus.

**Dark Souls community (shared suffering and knowledge).** The Dark Souls community is built on sharing encounters with difficult enemies and boss strategies. "You Died" became a meme. Robot Uprising's equivalent is the corruption report — "You Missed It" or "The Surgeon Got Me." The community bonding comes from shared adversarial experience. Crucially, the Dark Souls community produces strategy guides as a byproduct of social sharing — the same pattern this design exploits.

**CTF competitions (Capture the Flag in cybersecurity).** Cybersecurity CTF events involve finding hidden vulnerabilities in deliberately weakened systems. Teams share writeups after the event, documenting how they found each flag. Robot Uprising's corruption system is essentially a single-player CTF embedded in a strategy game. The community sharing pattern directly mirrors CTF writeup culture. The Atlas is the community's collective CTF writeup repository.

**Baba Is You (community puzzle sharing).** The Baba Is You community shares solutions to particularly elegant or difficult puzzles — not just "I solved it" but "look at HOW I solved it." The method is as interesting as the result. Similarly, corruption reports gain value from the detection method: "I caught the Mimic because the paragraph used the word 'optimal' and the Predecessor never uses that word" is more interesting than "I found a corruption."

---

## Sensory Description

**The corruption card** is a small rectangle (roughly playing-card proportions) with a dark navy background (#0d1117) and circuit-board trace patterns at 8% opacity. The corrupted text appears in the center, struck through with a thin amber line (#f0a040). Below it, the clean text glows in cool cyan (#00d4aa). A personality icon sits in the top-right corner — a tiny scalpel for the Surgeon, a solid black rectangle for the Censor, a theatrical mask for the Mimic, a blueprint grid for the Architect, a spray-paint splatter for the Vandal. The bottom strip shows mission province name, tick of detection, and detection method ("Manual" in gold, "Diff" in silver, "Audio" in bronze). When the card is first captured, it materializes with a camera-shutter animation — the screen briefly flashes white at 20% opacity, a satisfying mechanical *ka-chik* sound plays, and the card slides in from the right edge with a slight rotation that settles to level, as if being pinned to a corkboard.

**The Dead Letter Drop** on the campaign map is a weathered corkboard texture wedged between two provinces, connected to the archipelago by a thin data cable rendered as a glowing cyan line. Three corruption cards are pinned to it at slight angles, each with a push-pin rendered as a tiny colored dot matching the corruption personality. Red string connects cards that share a personality type. A small coffee-ring stain sits in the corner — a warm amber circle at 5% opacity, purely decorative, grounding the spy-thriller aesthetic. The board updates weekly with a subtle animation: old cards unpin themselves and drift downward, fading as they fall, while new cards slide in from the top and pin themselves with a satisfying *thunk*.

**The MITRE ATT&CK Board** is a grid of soft-edged rectangles organized in rows (personalities) and columns (technique categories). Each cell glows according to its community detection rate — a gentle green pulse for well-detected corruptions, a steady amber glow for moderate difficulty, and a slow red throb for corruptions that most players miss. Empty cells are dark grey with a "?" watermark. Hovering over a cell expands it with a 200ms ease-out animation, revealing the sample corruption card inside like opening a drawer. The whole board hums with a low electronic ambience — a barely-audible drone that shifts pitch as the cursor moves across detection-rate zones, rising in frequency over green cells and dropping into sub-bass over red cells. The sound communicates the community's collective anxiety: the red cells sound worried because *most people can't see what's there*.

---

## The TikTok Clip

Split screen. Left: a document that looks perfectly clean. Right: the player's face, calm, reading. They reach a paragraph. Their eyes narrow. They lean forward. Their finger traces a sentence. They grab the corruption — a single word that doesn't fit the document's voice. They pull it out. The word lifts off the page in amber particles. Underneath, the real word resolves in cyan. The player exhales. The corruption card materializes: "MIMIC DETECTED — Manual Catch." Cut to the sealed watch — their scout formation executes perfectly because the bad instruction was caught. Text overlay: "She read one wrong word and saved the whole mission." 12 seconds. #SpotTheCorruption #RobotUprising.
