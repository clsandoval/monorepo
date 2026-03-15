# 6.09 — GIF/Clip Export as Primary Viral Mechanic

## The Design Question

How does Robot Uprising turn every play session into potential viral distribution? Not as an afterthought export button, but as a **designed mechanic** — where the game's visual language, temporal structure, and sharing pipeline are built from the ground up to produce clips that sell the game to strangers without explanation.

The Opus Magnum lesson: Zach Barth said "instead of an elevator pitch for Opus Magnum, I would say just look at the gifs." The GIF *was* the pitch. Robot Uprising needs the same — except its clips are richer (temporal, dramatic, multi-agent) rather than purely mechanical (looping clockwork). The question is how to capture that richness in 5-15 seconds.

---

## The Clip Taxonomy (What Gets Shared)

Seven clip types have been identified (see 6.04), but they decompose into two fundamentally different **export modes** with different technical and design requirements:

### Mode A: "The Replay Clip" — Sealed Watch Footage

A segment of Sealed Watch gameplay. The camera is fixed (isometric 8x8 board), units snap between tiles, signals flash along channel lines, buffer bars pulse. The drama is emergent — the player didn't control what happened, they *designed* what happened beforehand.

**What makes it clip-worthy:** The "Chain Reaction" (scout detects → relay compresses → striker flanks), the "Buffer Meltdown" (unit by unit going red then stunned), the "EM Betrayal" (deep architecture broadcasting its location). These are 5-15 second sequences where visible causality creates a "did you see that?" moment.

**Technical requirement:** Re-render a tick range from the deterministic game state, not screen-capture. This means pixel-perfect reproduction at any resolution, no UI artifacts from the player's session, and the ability to crop, zoom, or annotate after the fact.

### Mode B: "The Architecture Shot" — Plan Screen Freeze

A still image or slow animation of a blueprint configuration. Channel wiring diagrams, rule stacks, hook topology. The beauty is structural — like a circuit diagram or a well-organized Factorio blueprint.

**What makes it clip-worthy:** Complexity that's visually legible. The "Spaghetti Wiring" (impossibly tangled hook network that somehow works), the "Minimal Machine" (three units, two channels, perfect efficiency), the "Meta-Level" (Command agent whose rules reference other agents' rules).

**Technical requirement:** High-resolution render of the workbench state with optional UI chrome removal. SVG-like vector clarity for channel wiring. Optional animation showing signal flow through the architecture (particles moving along channel lines at 1x speed).

### Mode C: "The Inspector Reveal" — Debrief Forensics

A scrubbed segment from the Inspector showing a specific unit's decision trace. "At tick 14, the striker chose to engage because rule 3 matched because slot 4 had stale data because the relay was stunned." The crime scene investigation clip.

**What makes it clip-worthy:** The "aha moment" — the causal chain that explains what went wrong (or right). Educational and dramatic simultaneously. Appeals to the Zachtronics/engineering audience.

**Technical requirement:** Inspector view at a specific tick with highlighted decision trace, context window state visible, optional annotation overlays.

---

## Six Design Options for the Export Pipeline

### Option A: "The Opus Magnum Button" — One-Click GIF After Every Match

**How it works:** After every Sealed Watch ends (before Inspector), a "Save Clip" button appears in the transition screen. One tap exports the entire Sealed Watch as a GIF (or the last 30 seconds if the match exceeds 60 ticks). The GIF loops. A second button offers "Save as MP4" for higher quality. No trimming, no editing — the whole point is zero friction.

**Visual treatment:** The export button is a small cyan film-strip icon that pulses gently once, then settles. Pressing it triggers a brief "encoding..." progress ring (< 2 seconds for a 60-tick match at 1x speed = 60 frames). The exported file lands in a `~/RobotUprising/clips/` directory (or equivalent web download) with a filename like `mission-3-tick-47-victory.gif`.

**Strengths:**
- Minimum friction = maximum export rate. Every player becomes a potential distributor.
- The sealed watch's fixed camera + tick-based snapping produces naturally loopable, visually clean GIFs.
- GIF format is universally embeddable (Discord, Reddit, Twitter, iMessage) without requiring a video player.

**Weaknesses:**
- Full-match GIFs are too long for viral clips (60+ seconds). The interesting part might be 5 seconds buried in a 90-second file.
- No curation = low average quality. Most GIFs shared will be unremarkable.
- GIF format has severe limitations: 256 colors, large file sizes, no audio. Robot Uprising's audio design (kulintang gong strikes marking tick events) is a major part of the experience.

**Comparable:** Opus Magnum's GIF button (one-click, post-puzzle, looping). The direct ancestor. Opus Magnum worked because solutions are inherently looping (repeating clockwork) and visually simple (hex grid, few colors). Robot Uprising's matches don't loop and are visually denser.

---

### Option B: "The Highlight Reel" — Auto-Detected Key Moments

**How it works:** The game's deterministic tick engine identifies "peak moments" — ticks where the most state changes occur (units eliminated, signals cascading, buffer overloads, base damage). After Sealed Watch, the system presents 2-4 auto-detected highlights as thumbnail strips in the transition screen. The player taps one to export it as a 3-8 second clip (MP4 with audio, or GIF without).

Peak detection heuristic:
- **Kill tick:** Any tick where a unit is eliminated (attacker and defender identified)
- **Cascade tick:** Any tick where 3+ signals fire simultaneously across different channels
- **Overload tick:** Any tick where 2+ units enter context overload (the "brain-fried" moment)
- **Pivot tick:** The tick identified by EDT analysis (see 4.18) as the effective outcome timestamp — where the match's fate was sealed

**Visual treatment:** Highlight thumbnails are rendered as small 3-frame filmstrip previews — the tick before, the tick itself, and the tick after. A golden border highlights the system's top pick. Each thumbnail shows a mini heat-map: red squares for combat, green for signals, amber for overloads. Tapping one expands it to a preview player (3-8 seconds, looping) with "Export" and "Trim" buttons.

**Strengths:**
- Curated clips are dramatically better than raw full-match exports. The system finds the "money shot."
- 3-8 seconds is the ideal length for TikTok/Reels/Twitter autoplay.
- Peak detection is computationally trivial in a deterministic tick engine — just scan the event log.
- Multiple highlights per match let the player choose their narrative (the dramatic kill vs. the elegant cascade vs. the catastrophic failure).

**Weaknesses:**
- Auto-detection misses "slow burn" moments — a 10-tick relay chain that gradually routes intelligence isn't a single-tick peak but is deeply satisfying to watch.
- Players may disagree with the system's picks, creating frustration ("that wasn't the cool part!").
- The 4-highlight limit forces curation; some matches have 8+ peak moments.

**Comparable:** Steam Game Recording's timeline markers (developer API marks key events for easy clip finding). Medal.tv's AI auto-capture (detects kills/wins/deaths automatically). The innovation here is that the game's deterministic engine makes detection perfect rather than heuristic — every event is known, not guessed.

---

### Option C: "The Scrubber Clip" — Inspector-Integrated Export

**How it works:** The Inspector's timeline scrubber doubles as a clip selection tool. The player scrubs to find the moment they want, then holds Shift and drags across a tick range to highlight it. A "Clip" button appears, offering export as GIF, MP4, or WebP. The clip captures exactly the Inspector's current view state — if they've clicked a unit, the clip includes the unit's context window panel. If they've toggled channel visualization, it's in the clip.

**Visual treatment:** The selected tick range highlights in cyan on the timeline scrubber bar. Dragging the edges adjusts the selection. A framerate dropdown (1x, 0.5x, 2x) controls playback speed in the export. A "Clean View" toggle strips the Inspector UI and shows only the battlefield (for sharing with non-players who'd be confused by the sidebar). A "Annotated View" toggle adds the player's unit-click state and decision trace as overlay text.

**Strengths:**
- Maximum creative control. The player is the editor, choosing exactly what matters.
- Inspector's analytical tools (decision trace, context window state, channel metrics) can be included or excluded, letting clips target different audiences (casual viewer vs. engineering community).
- "Clean View" vs. "Annotated View" toggle is the single most important feature — it determines whether clips are viral (clean) or educational (annotated).
- Integrates naturally into the Inspector workflow; the player is already scrubbing through ticks looking for insights.

**Weaknesses:**
- Higher friction than Options A or B. Requires the player to actively curate.
- Inspector is the analytical screen — many players (especially casual) may never reach it deeply enough to discover the clip tool.
- The "two-act" debrief structure (Sealed Watch emotional → Inspector analytical) means clip creation happens in the analytical phase, potentially losing the emotional charge.

**Comparable:** Factorio's screenshot system (command-line accessible, scriptable, but requires knowledge). Into the Breach has no export at all (cautionary gap — the community created external tools). The Scrubber Clip is closer to video editing software (DaVinci Resolve's timeline selection) adapted for a game's tick-based structure.

---

### Option D: "The Social Card" — Auto-Generated Shareable Image

**How it works:** After every match, the game generates a "match card" — a designed image (16:9 or 1:1 aspect ratio) summarizing the result. The card contains: mission name, tick count, unit composition icons, a mini-heatmap of the 8x8 board showing signal traffic density, the outcome (victory/defeat), and the player's blueprint name. The card is designed to be visually striking on its own — a shareable artifact even without gameplay footage.

**Visual treatment:** The card uses the game's SE Asian cyberpunk aesthetic as a background — the mission's terrain (rice terraces, Siquijor bioluminescence, Manila neon) rendered as a stylized backdrop. Unit icons arranged across the bottom in the production queue order. The heatmap overlay uses the locked color language (green for signals, red for combat, amber for overload) rendered as a ghostly layer over the terrain. The mission title is rendered in the game's font with a subtle circuit-board pattern. The player's factory name (customizable) appears in small text at the bottom.

A QR code in the corner links to the match replay (if web-hosted) or the game's store page (if replay hosting isn't available).

**Strengths:**
- Zero friction — generated automatically, no player action required.
- Images share everywhere (every platform, every chat app, no video player needed).
- The card is a **complete artifact** — it tells a story by itself. "Mission 5, 47 ticks, 3 scouts 2 relays 1 striker, victory" is a readable miniature narrative.
- The QR code creates a viral loop: see card → scan → watch replay or download game.
- Scales to low-bandwidth contexts (WhatsApp groups, email, printed).

**Weaknesses:**
- Static images lack the visceral drama of video clips. The "did you see that" moment requires motion.
- Cards are formulaic — after seeing 10, they blur together. No card captures the *feeling* of watching your relay chain execute.
- The QR code-to-replay pipeline requires backend infrastructure (replay hosting) that conflicts with the "no backend" constraint.

**Comparable:** Slay the Spire's run summary screen (frequently screenshot-shared on Reddit — shows relics, deck size, floor reached). Balatro's score screen (the "number go up" screenshot that dominated Reddit in 2024). Into the Breach's victory screen. The innovation is treating the summary as a *designed shareable artifact* rather than an internal results screen that happens to be screenshot-able.

---

### Option E: "The Replay Link" — Deterministic State Sharing

**How it works:** Because the game engine is deterministic, an entire match can be encoded as a seed + initial configuration. The "Share Replay" button generates a compact URL (or config code string like `RU-M5-v2-3a8f`) that, when opened in any browser running the game, reconstructs and plays the exact match. The viewer sees the Sealed Watch from tick 0, with full Inspector access afterward.

**Visual treatment:** The Share button produces a compact string displayed in a copyable text field with a "Copy" button and a QR code. The string format: `RU-{mission}-{seed}-{config_hash}` — short enough to paste in a tweet, long enough to be unambiguous. When someone clicks a shared link, the game loads directly into Sealed Watch for that match. A banner at the top says "Watching [PlayerName]'s Mission 5 — tap anywhere to pause" with the player's factory name and blueprint summary.

**Strengths:**
- The most faithful sharing possible. The viewer sees *exactly* what happened, with full analytical tools.
- Essentially zero bandwidth — a 30-character string encodes a complete match. No video hosting needed.
- The viewer can use the Inspector afterward, enabling community analysis and teaching ("scrub to tick 23, look at the relay's buffer — see the stale data?").
- Config codes are already a locked design element (see 7.03a). Replay links extend the same pattern.
- Fulfills the "no backend" constraint — the code is self-contained, the viewer's browser runs the simulation.

**Weaknesses:**
- Requires the viewer to have the game installed (or a web demo running). Not a "casual scroll past on Twitter" viral vector.
- The match plays from tick 0 — there's no way to deep-link to "the cool part at tick 47" without additional metadata (though a `?t=47` parameter could handle this).
- The compact string is opaque — `RU-M5-v2-3a8f` doesn't visually convey anything. Needs to be paired with a screenshot or card (Option D) for social media context.
- The viewer has no emotional investment — watching someone else's Sealed Watch without having designed the architecture lacks the tension of watching your own.

**Comparable:** Into the Breach's seed sharing (a seed number reproduces the same island layout for challenge runs). Balatro's seed sharing (the "PENIS seed" went viral on Reddit). Factorio's save-file replay system (give save to friend, they watch your game). Chess.com's game links (compact URL → full game replay with analysis board). The key difference is that Robot Uprising's deterministic engine + web-based tech stack makes this trivially implementable — every match is already a deterministic function of its inputs.

---

### Option F: "The Director's Cut" — Full Clip Studio

**How it works:** A dedicated fourth screen (accessible from Inspector) that functions as a minimal video editor. The player selects tick ranges, chooses camera angles (full board, unit-follow, zone zoom), adds text annotations, selects audio tracks (in-game SFX, muted, music-only), and renders to MP4/GIF/WebP. Presets for common social platforms (TikTok vertical 9:16, Twitter 16:9, Discord 1:1) handle aspect ratio and duration constraints automatically.

**Visual treatment:** The Director's Cut screen has a dark editing-suite aesthetic. A timeline at the bottom shows the full match as a waveform (signal density over ticks). Above: a large preview window showing the current frame. Left sidebar: camera controls (zoom, pan, unit-follow target). Right sidebar: overlay toggles (channel lines, buffer bars, decision traces, grid labels, unit names). Top bar: export format selection with platform-specific presets. A "Watermark" toggle adds the game's logo in the corner.

The rendering process shows a progress bar with the Robot Uprising logo pulsing. Renders take 2-10 seconds depending on clip length and resolution. The final file opens in the OS's default preview application or copies to clipboard.

**Strengths:**
- Maximum quality output. Content creators can produce professional-grade clips.
- Platform presets eliminate the guesswork of "what dimensions does TikTok need?"
- Camera controls (unit-follow, zone zoom) produce clips that are impossible to create with screen recording — they showcase the game's visual design at its best.
- The Director's Cut itself is a feature worth marketing: "Robot Uprising has a built-in replay editor."
- Watermarking is automatic viral distribution — every shared clip advertises the game.

**Weaknesses:**
- Significant development investment. A clip editor is a product unto itself.
- Most players will never use it. This is a tool for content creators (1-5% of the player base).
- The Inspector is already the game's most complex screen. Adding a sub-screen within it risks overwhelming the UI.
- Camera controls (zoom, pan, follow) conflict with the locked isometric perspective and 8x8 board. The board is small enough that zooming in loses context and zooming out wastes space.

**Comparable:** Halo 3's Theater Mode (the gold standard — full camera control, saved films, file sharing; directly responsible for countless viral Halo clips and the birth of machinima culture). Fortnite's Replay Mode (third-person camera, drone mode, focal length control). Rocket League's replay editor (angle, speed, focus controls). The innovation for Robot Uprising is that the tick-based discrete system makes editing *dramatically* simpler than continuous-time games — every "frame" is a clean game state, not an interpolation.

---

## Recommended Hybrid: "The Cascade Pipeline"

The six options aren't mutually exclusive. They form a pipeline from zero-effort to maximum-effort, each serving a different player archetype:

| Layer | Tool | Effort | Output | Audience |
|-------|------|--------|--------|----------|
| 1 | **Match Card** (D) | Zero (auto-generated) | Static image + QR | Everyone — Reddit, chat, email |
| 2 | **Highlight Reel** (B) | One tap (pick a highlight) | 3-8s MP4/GIF with audio | Social media — TikTok, Twitter, Discord |
| 3 | **Replay Link** (E) | One tap (copy string) | Deterministic replay code | Community — forums, friends, teaching |
| 4 | **Scrubber Clip** (C) | 30 seconds (scrub + select) | Custom-range MP4/GIF | Engaged players — analysis, sharing |
| 5 | **Director's Cut** (F) | 2-5 minutes (full editing) | Platform-optimized video | Content creators — YouTube, Twitch |

Layer 1-3 should ship with the first playable. Layer 4 should ship with the Inspector. Layer 5 is post-launch or community-requested.

The **Match Card** is the viral workhorse — auto-generated, universally shareable, branded with the game's aesthetic. It's the thing that shows up in Discord servers and Reddit posts and WhatsApp groups. The **Highlight Reel** is the conversion tool — the 5-second clip that makes someone say "I need to play this." The **Replay Link** is the community glue — the thing that makes Reddit analysis posts, YouTube breakdowns, and Discord coaching sessions possible.

---

## Player Journeys

### Journey: Ria, 24, UX Designer, Casual Strategy Gamer

**Context:** Just completed Mission 3 (first hooks mission). Her scout-relay-striker chain executed a flanking maneuver she didn't explicitly design. She's grinning.

**Minute 0:00 — The Victory Screen**
The Sealed Watch ends. "VICTORY" pulses in gold across the board, then fades. Below the board, three auto-generated highlight thumbnails appear in a filmstrip row. The first shows a green cascade — three channel lines flashing simultaneously at tick 18. The second shows a red flash — the enemy striker eliminated at tick 31. The third shows the final tick — her striker adjacent to the enemy base, the base cracking open with cyan light.

To the right: a Match Card preview — a 1:1 square image showing the Siquijor terrain backdrop (bioluminescent purple-black), her three unit icons in a row, "MISSION 3 — SIQUIJOR" in the game's angular font, "47 TICKS" in small text, a miniature heatmap overlay showing green signal paths and a single red burst.

**Minute 0:15 — The Share Impulse**
Ria taps the cascade highlight (tick 18). It expands into a looping 5-second preview: three green dashed lines flash in rapid succession from scout (👁) to relay (📡) to striker (⚔), the striker pivots to face the gap in the enemy formation, the relay's buffer bar pulses bright as it compresses the signal. A soft kulintang gong chimes three times, once per signal hop. Below the preview: "Export GIF" / "Export MP4" / "Copy Replay Link" buttons.

She taps "Export MP4." A progress ring fills in 1.5 seconds. The file saves. A toast notification: "Clip saved — open or share?" She taps "Share" — her OS share sheet appears (Messages, Discord, Twitter, etc.). She sends it to her friend group chat on Discord.

**Minute 0:30 — The Card Share**
Back on the results screen, she long-presses the Match Card. It expands to full-screen preview. She screenshots it (habit), then notices "Copy to clipboard" — taps it. Opens Reddit, goes to r/RobotUprising, starts a new post. Pastes the card image. Titles it "My first hook chain actually WORKED." The card's visual design — the bioluminescent Siquijor backdrop, the clean unit icons, the heatmap overlay — makes the post visually distinct from typical game screenshots.

**Minute 1:00 — Moving On**
She dismisses the share screen and enters the Inspector. She's already shared two artifacts (the MP4 clip and the card image) without having to open any external recording software, trim any video, or think about formats. Total time spent on sharing: 45 seconds.

**What she's thinking:** "That was so easy. I didn't even plan to share — the highlights were just *there*." She's now a marketing channel for the game without feeling like one.

**UI Annotations:**
- Highlight thumbnails: 120×68px filmstrip frames, golden border on system-top-pick, 3-frame scrub on hover
- Match Card: 1080×1080px auto-generated, game font + terrain backdrop + heatmap overlay + unit icons
- Export buttons: "GIF" (green outline, ~2MB), "MP4" (cyan outline, ~1MB, includes audio), "Copy Replay Link" (magenta outline)
- Progress ring: 40px circular indicator, fills clockwise, cyan to gold on completion
- Share sheet: OS-native (Web Share API on web, system share on native)

---

### Journey: Kwame, 32, Twitch Streamer, 2,400 Followers, Factorio/Zachtronics Veteran

**Context:** Mission 8, deep campaign. His stream has been running for 2 hours. He just designed a complex 4-unit relay mesh with a Command agent that dynamically reassigns hook priorities. Chat is engaged — 340 concurrent viewers.

**Minute 0:00 — The Plan Screen Beauty Shot**
Before hitting EXECUTE, Kwame wants to show chat his architecture. He presses F12 (hotkey: "Architecture Screenshot"). The Plan screen strips all UI chrome — the workbench panels fade, the EXECUTE button vanishes — leaving only the 8x8 board with ghost unit previews, perception radii as translucent cones, and channel wiring as colored dashed lines connecting unit positions. The background dims to deep charcoal. The wiring diagram looks like a circuit schematic — five channel lines in cyan, magenta, gold, green, and amber, converging on the Relay at D4 and fanning out to Strikers at B2 and G6.

A subtle animation plays: signal particles flow along each channel line at 0.5x speed, showing the intended data flow. The game's logo watermark sits in the bottom-right corner, semi-transparent.

Kwame screen-captures this (OBS is running). Chat explodes: "that wiring is CLEAN," "why is there no channel from Command to Scout?", "I see a bottleneck at D4." The architecture screenshot is already doing double duty — showing off his work AND generating community analysis.

**Minute 0:30 — The Sealed Watch (Streamer Mode)**
He hits EXECUTE. The Sealed Watch begins. Because he enabled "Streamer Overlay" in settings, the channel lines are rendered 2px thicker than default, buffer bars are 150% size, and unit icons have thin white outlines for video compression clarity. The color palette shifts slightly — pure blacks replaced with dark charcoal (#1a1a1a) to avoid compression artifacts in dark areas.

Chat watches the match unfold. At tick 22, the Command agent's `reassign` skill fires — it reroutes Striker-A's hook from `assault-channel` to `flank-channel` because the Relay's compress output detected an opening on the eastern flank. The channel line from Command to Striker-A blinks rapidly (reroute animation), then changes color from cyan to gold. Striker-A pivots east. Chat: "THE REROUTE! 🔥", "it's thinking for itself", "COMMAND DIFF."

**Minute 1:30 — The Highlight Reel + Director's Cut**
Match ends in victory at tick 61. The highlight reel shows four peaks: the reroute at tick 22, a double kill at tick 38, a near-overload at tick 45, and the base breach at tick 59. Kwame taps the reroute highlight and exports it as a 6-second MP4 — but this is for Twitter later. For his stream, he wants the full Director's Cut.

He enters the Inspector, then opens the Director's Cut sub-panel (hotkey: Ctrl+D). The timeline shows the full 61-tick match as a density waveform — tall spikes at tick 22 (reroute), 38 (kills), 45 (overload scare). He selects ticks 19-26 (the reroute sequence). In the camera panel, he selects "Unit Follow: COMMAND-A" — the preview zooms to center on the Command unit, keeping it in frame while showing the channel line change. He toggles on "Decision Trace Overlay" — text annotations appear showing the rule that fired ("Rule 3: IF flank-channel has OPENING signal AND assault-stalled > 2 ticks THEN reassign Striker-A to flank-channel"). He selects "Twitter 16:9" preset, "Include Audio" toggle on, "Watermark" on.

Renders in 3 seconds. He'll post it after stream with the caption "My Command agent saw the opening before I did."

**Minute 3:00 — The Replay Link for Chat**
Before moving to the Inspector deep-dive, he copies the Replay Link (`RU-M8-v4-7c2e`) and pastes it in his stream's Discord channel. "If you want to scrub through the match yourself, here's the code." Three viewers immediately load it in their own games and start Inspector analysis. One finds that the Relay at D4 was at 11/12 buffer on tick 21 — one more signal would have caused overload and the reroute would never have happened. They post this finding back in Discord. Kwame reads it on stream: "ELEVEN OUT OF TWELVE. We were one signal away from disaster."

This becomes a clip on its own — the moment of discovery, not the moment of gameplay.

**What he's thinking:** "The game gives me content at every layer. The architecture shot is a thumbnail. The auto-highlights are Twitter posts. The Director's Cut is a YouTube Short. The replay code is community engagement. I don't need OBS for any of the game-native exports — they're better quality than screen capture because they're rendered from game state."

**UI Annotations:**
- Architecture Screenshot (F12): strips UI, dims background to charcoal, renders wiring + perception radii + ghost units + signal particle animation + watermark
- Streamer Overlay: 2px channel lines (default 1px), 150% buffer bars, white unit outlines, dark charcoal blacks (#1a1a1a)
- Director's Cut panel: timeline waveform, camera selector (full board / unit-follow / zone zoom), overlay toggles (decision trace, channel lines, buffer bars, grid), platform presets, audio toggle, watermark toggle
- Replay Link: 20-character alphanumeric code, copyable text field, QR code, "Copy" button

---

### Journey: Tomás, 14, First-Time Strategy Player, Received the Game as a Birthday Gift

**Context:** Just failed Mission 2 for the third time. His scout's buffer overloaded because he subscribed to too many observation channels. He's frustrated but determined.

**Minute 0:00 — The Defeat Card**
The Sealed Watch ends in defeat. "DEFEATED" appears in crimson, then fades to a muted grey. The Match Card auto-generates — same layout as a victory card, but the terrain backdrop is desaturated, the unit icons show his scout with a red X overlay (eliminated), and the heatmap is dominated by amber (overload) rather than green (signals). "MISSION 2 — IFUGAO" / "23 TICKS" / "DEFEATED."

Below the card, the highlight reel shows two moments: the tick his scout's buffer bar went red (tick 11), and the tick the scout was eliminated while stunned (tick 12). A soft, low-pitched tone plays instead of the triumphant gong — melancholy, not punishing.

**Minute 0:15 — The "I Need Help" Share**
Tomás doesn't want to share his defeat on social media. But he does want help. He taps the Replay Link button. A compact code appears: `RU-M2-v1-a3f1`. He copies it and pastes it into the game's community Discord (the #help channel). "can someone tell me what i did wrong? replay: RU-M2-v1-a3f1"

Within 5 minutes, a more experienced player loads his replay, scrubs to tick 11, inspects his scout's buffer, and replies: "Your scout is listening on both recon-channel AND ambient-noise. Ambient-noise fills 3 of your 6 slots every tick. Toggle ambient-noise off in your context config." Tomás gets precise, actionable feedback from a stranger — enabled by the replay link containing the complete game state.

**Minute 0:30 — The Accidental Viral Moment**
Two weeks later, Tomás has progressed to Mission 6. He's gotten good. His relay compression chain is efficient and his hook architecture is clean. He defeats Mission 6 on his first attempt. The highlight reel shows a moment he didn't even notice during the Sealed Watch: at tick 34, his three strikers converge simultaneously on the enemy base from three different directions — a triple pincer that he didn't design explicitly but emerged from his hook topology.

He exports the 5-second highlight as a GIF. Posts it on TikTok with the caption "I programmed robots and they did THIS." The triple-pincer GIF — three red flashes on three sides of the enemy base in the same tick, channel lines converging like a spider web — gets 47,000 views. He didn't know he was marketing the game. The game knew.

**What he's thinking:** After the failure: "At least I can get help without having to explain everything." After the success: "I made that happen. The robots did it, but I made the robots."

**UI Annotations:**
- Defeat card: desaturated terrain, red X on eliminated units, amber-dominant heatmap, muted grey text
- Replay Link in defeat: identical to victory — no shame barrier, same one-tap copy
- Help flow: copy replay code → paste in Discord/Reddit → someone else loads it → full Inspector access → precise feedback
- Auto-highlight in victory: system detected the simultaneous triple-convergence as a peak moment (3 combat events in 1 tick)

---

### Journey: Dr. Amara, 41, ML Researcher, Accessibility User (Low Vision, 200% UI Scale)

**Context:** Mission 7, uses 200% UI scale and high-contrast mode. Just executed a complex specialist-relay extraction chain. Wants to share her architecture with a colleague who's also playing.

**Minute 0:00 — The Accessible Export**
The highlight reel thumbnails render at 200% scale — larger, clearer, but only 2 fit on screen instead of 4. She navigates with keyboard (Tab cycles highlights, Enter previews, Shift+Enter exports). The preview player has visible transport controls (play/pause/step) that are keyboard-accessible. Screen reader announces: "Highlight 1 of 2. Tick 29. Events: specialist extraction succeeded, relay forwarded to command channel. Duration: 4 seconds."

She selects Highlight 1 and exports as MP4. The exported clip respects her high-contrast mode — the same visual treatment she plays with is what gets shared. This is intentional: the high-contrast aesthetic (shape-first design, thick outlines, reduced visual noise) actually produces *better* clips for social media because it's cleaner and more legible at small sizes.

**Minute 0:30 — The Architecture Share for Teaching**
She opens the Architecture Screenshot mode. At 200% scale, the board fills more of the screen, but the wiring diagram is crisper — thicker lines, larger unit icons, more readable channel labels. She exports it and emails it to her colleague with the replay link: "Load RU-M7-v3-b2c4 and scrub to tick 29. Watch the specialist's extraction → relay compress → command reassignment chain. This is basically a RAG pipeline."

Her colleague, also an ML researcher, loads the replay. They both use the Inspector to trace the information flow. The next day, they present the replay in a lab meeting as an analogy for their actual agent architecture. Robot Uprising has become a communication tool for their real engineering work.

**What she's thinking:** "The accessibility settings don't make the exports look 'different' or 'lesser.' They make them look *cleaner*. The high-contrast mode is just good design."

**UI Annotations:**
- 200% scale: 2 highlights visible (vs. 4 at 100%), larger transport controls, keyboard-navigable
- Screen reader: announces highlight metadata (tick number, events, duration) for non-visual navigation
- High-contrast export: exported clips inherit the player's visual settings — thick outlines, shape-first design, reduced visual noise
- Architecture Screenshot at 200%: same clean-view render, but channel labels are readable at export resolution

---

## Interaction Effects

### With Sealed Watch (Locked)
The "no skip, no pause, no tools" rule during Sealed Watch means the player's first experience of the match is emotional, not analytical. The export pipeline sits in the gap *between* Sealed Watch and Inspector — the player is still emotionally charged when they see the highlight reel. This is the optimal moment for sharing: peak emotion, minimal friction.

### With Inspector (Locked)
The Inspector's scrubber timeline is the natural home for the Scrubber Clip (Option C) and Director's Cut (Option F). The Inspector already has unit-click inspection, decision traces, and context window visualization. Adding clip selection to the scrubber is an incremental feature, not a new system.

### With Deterministic Engine (Locked)
The deterministic tick scheduler is the foundation of Options B (auto-detected highlights) and E (replay links). Every event is known, every state is reproducible. This makes highlight detection trivial (scan event log, rank by density) and replay sharing zero-bandwidth (encode inputs, not outputs).

### With Audio Design (6.02)
MP4 clips with audio are dramatically more shareable than silent GIFs. The kulintang gong strikes (one per tick) create a rhythmic pulse that makes clips *sound* good even out of context. The audio design should consider "clip-optimized mixing" — the most dramatic sounds (signal cascade chime, buffer overload alarm, unit elimination crunch) should be mixed louder relative to ambient audio so they punch through Twitter's auto-playing muted-then-unmuted viewer behavior.

### With Streamer Overlay (6.04d)
The Streamer Overlay mode (thicker lines, larger bars, compression-friendly palette) should apply to exported clips as well as live gameplay. A toggle in export settings: "Export with Streamer Overlay" produces clips optimized for social media compression (where thin lines and subtle colors are destroyed by lossy encoding).

### With Mobile (6.07)
On mobile, the share pipeline integrates with the OS Share Sheet (Web Share API). Highlights can be shared directly to WhatsApp, iMessage, or Instagram Stories without saving to the camera roll first. The Match Card's 1:1 aspect ratio is Instagram-native. The vertical 9:16 preset in the Director's Cut targets TikTok/Reels/Shorts.

### With Blueprint Codex (Locked)
The Codex is a natural source of sharable content — "here's my unlocked collection" screenshots parallel Slay the Spire's run summary and Pokemon card collection screenshots.

### With Community Features (7.03)
The replay link (Option E) is the backbone of community features. Config necropsy posts (7.10) need replay links. The Workshop (7.03d) should accept replay links as "proof of concept" for shared blueprints. Bounty challenges (7.03) are replay-link-verified.

---

## Comparable Games Deep Dive

### Opus Magnum — The Gold Standard
Zach Barth: "Our marketing was making the game shit out GIFs that everyone would put on Twitter." The one-click GIF export after every puzzle was the game's primary marketing channel. Key insight: the GIF wasn't an afterthought — the game's visual design (hexagonal grid, clockwork movement, looping solutions) was *designed to look good as a GIF*. Robot Uprising's sealed watch (isometric grid, snapping units, flashing signals) has similar GIF-native qualities but adds temporal drama (non-looping matches with outcomes).

### Halo 3 Theater Mode — The Content Creator's Tool
Theater Mode let players rewind, fast-forward, detach the camera, and save clips from any perspective. It launched machinima as a genre and produced some of the most iconic gaming clips ever (the Recon helmet snipe). Key lesson: giving players camera control turns them into cinematographers. Robot Uprising's fixed isometric camera is more constrained, but the Inspector's unit-follow and zoom options provide a lighter version of the same creative agency.

### Steam Game Recording — The Platform Layer
Valve's 2024 launch of built-in game recording with developer timeline markers is the new baseline expectation. Robot Uprising can leverage the Steam Game Recording API to mark key events (kills, overloads, reroutes, base damage) as timeline markers, giving players Steam-native clip creation *in addition to* the game's built-in tools. This is additive, not competitive — Steam Recording catches everything; the game's built-in tools produce curated, higher-quality output.

### Balatro — The Screenshot Economy
Balatro's viral success on Reddit was driven almost entirely by screenshots — score screens showing absurd numbers, seed shares producing reproducible runs, meme edits of card combinations. No built-in clip export, just inherently screenshot-worthy UI design. Key lesson: the *design of the results screen* matters as much as dedicated export tooling. Robot Uprising's Match Card (Option D) applies this lesson explicitly.

### Slay the Spire — The Run Summary
The end-of-run screen (showing relics collected, cards in deck, floor reached) is the most screenshot-shared artifact in the deckbuilder community. Players share it to show off powerful synergies, mourn close losses, and seek advice. Key lesson: summary screens should be *designed for sharing* — high contrast, clear typography, minimal chrome, recognizable at thumbnail size.

---

## Sensory Description: The Export Moment

When the Sealed Watch ends and the highlight reel appears:

**Visual:** The board holds its final state for 1.5 seconds — the last tick frozen in place, channel lines still glowing faintly. Then the board gently scales down (95% → 85% over 0.5 seconds) and slides left. From the right, the highlight filmstrip slides in — three rectangular thumbnails with rounded corners, each showing a 3-frame micro-animation (before/during/after). The system's top pick has a thin gold border that pulses once. Below the filmstrip, the Match Card fades in as a smaller preview (40% width). The background behind the card is the mission's terrain, softly blurred and dimmed to 30% brightness.

**Audio:** As the highlights appear, a soft ascending chime plays — three notes, each slightly higher, one per highlight thumbnail. The sound is warm but brief — a musical bookend to the match, not a fanfare. When the player hovers over a highlight, the audio from that tick plays as a preview — the specific gong strike, signal chime, or elimination crunch from that moment.

**Feel:** The transition from Sealed Watch tension to the highlight reel is a release — the emotional equivalent of a deep breath. The filmstrip thumbnails are *gifts* — "here are the cool parts of what you just experienced, ready to share." The Match Card is a *trophy* — "here's a designed artifact commemorating your match." The whole interface says: "your match mattered, and here are the tools to show everyone."

---

## The TikTok Clip Test

For each export mode, what's the 15-second clip that makes someone download the game?

**Highlight Reel clip:** Five units on an isometric board. Three green dashed lines flash in cascade — scout to relay to striker — in perfect sequence. The striker pivots. The enemy unit doesn't see it coming. Red flash. Elimination. The kulintang gong strikes three times, once per signal hop, then a deep boom on the kill. Total: 4 seconds. Caption: "I didn't control any of them. I just designed how they think." Loop it.

**Architecture Screenshot clip:** A still image of a wiring diagram — five colored lines converging on a central relay node, fanning out to three strikers. Signal particles flow along the lines like data through a network. A hand cursor drags one channel connection from the relay to a different unit. The entire pattern shifts. New particles flow. Caption: "This is an AI attention system. The game is designing these." 8 seconds. Hold on the final frame.

**Inspector Reveal clip:** The Inspector timeline scrubs backward from tick 60 to tick 14. At tick 14, a unit's context window panel highlights — one slot glowing amber. The decision trace annotation appears: "Rule 3 matched on STALE DATA (age: 12 ticks)." The camera zooms to show the relay that sent the stale signal — its buffer bar was full, it was compressing old data because new data couldn't fit. Caption: "I found the bug in my robot's brain. It was thinking about something that happened 12 ticks ago." 10 seconds.

---

## New Aspects Discovered

- **6.09a — Clip audio mixing for social media:** How to mix the game's audio so clips sound good when auto-played (muted → unmuted behavior on Twitter/TikTok/Instagram); loudness normalization; the "first 0.5 seconds must have visual hook because audio is muted" principle
- **6.09b — Match Card template system:** Customizable card layouts (terrain backdrop selection, unit arrangement, stat emphasis); community-created card templates as Workshop items; seasonal card designs
- **6.09c — Replay link deep-linking with tick parameter:** `RU-M5-v2-3a8f?t=47` format that jumps the viewer directly to the interesting tick; "timestamp sharing" culture like YouTube's `?t=` parameter; interaction with community analysis posts
- **6.09d — Export analytics as game health signal:** Tracking which moments get exported most frequently across the player base reveals what the game does well; if 80% of exports are buffer overloads, the game's drama is working; if 0% are architecture screenshots, the Plan screen needs visual design work; anonymous aggregate export heuristics as playtesting data
- **6.09e — "Before/After" comparison clip mode:** Side-by-side export showing the same mission with two different configurations; the most powerful teaching artifact; requires same-seed replay (see 6.04a); "Left: my first attempt (defeated at tick 23). Right: after fixing the relay (victory at tick 58)." Split-screen export with shared timeline scrubber
