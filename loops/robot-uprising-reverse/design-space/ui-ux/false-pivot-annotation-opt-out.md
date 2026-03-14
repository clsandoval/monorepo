# False Pivot Annotation Opt-Out for Streamers

**Aspect:** 4.19 — A per-session toggle hiding the gold diamond and grey false-pivot markers; for streamers who want to provide commentary before the annotation appears, or for community events where "find the pivot" is a collective viewer challenge; the annotation as a game show format

**Parent:** 1.06c-ext-A-ii — The False Pivot Anti-Pattern
**Siblings:** 4.18 — Effective Outcome Timestamp; 4.04b — Two-Act Debrief Structure; 4.20 — Counterfactual Simulation
**Related:** 1.06c-ext-A — Sealed Replay as Tension Mechanic; 7.10 — Config Necropsy as Community Artifact; 6.04 — The TikTok Clip

---

## The Problem Being Solved

The three-layer false pivot annotation system (gold diamond + grey markers + tutorial mission) was designed for *players* iterating on their own architectures. It assumes the person watching the debrief is the same person who deployed the config and wants to improve it.

Streamers are not that person.

A streamer watching their own match is being watched by hundreds or thousands of people who did not design the config and may never play Robot Uprising. For that audience, the debrief is not a diagnostic tool — it is a **spectacle**. The streamer's job is to commentate: to react, to theorize, to be wrong, to discover live. The gold diamond appearing automatically on the timeline and immediately pointing to "tick 22, buffer miss" *destroys* the commentary arc. It answers the question before the streamer can ask it.

There's a secondary audience: **community tournament events** where a sealed replay is screened for a live audience, and the game show is "who in the crowd can identify the genuine pivot first?" If the gold diamond appears at seal-break for everyone in the audience, the game show is over before it started.

And a third context: **competitive players doing their own live-streaming who want to perform their diagnostic process publicly** — players like Keiko who have deliberately disabled the diamond for their own play and want to demonstrate that skill on stream.

All three contexts require the same mechanism: a way to **delay or suppress the pivot annotation** past the default appearance point.

---

## The Annotation Lifecycle (Default Behavior)

Before exploring variations, the exact default behavior:

1. **During sealed watch:** No annotations. No hint of where the pivot is. The timeline bar shows ticks without any markers.
2. **Seal breaks (outcome revealed):** Crimson or amber wave dissolves the seal bar. Outcome text appears. The ambient tone resolves.
3. **Diamond materialization (0.5 seconds after seal):** The gold diamond assembles on the timeline at the EDT window. Grey circles appear at false pivot windows. The "MATCH ANALYSIS READY" text fades in, showing EDT stats.
4. **Full debrief mode:** Scrubber active. Diamond and circles are clickable. Signal genealogy and buffer overlays available.

The streamer opt-out modifies step 3. Specifically: the diamond and grey circles do **not** automatically assemble. The outcome is revealed normally (step 2). The player enters full debrief mode (step 4) — but the timeline is clean. The annotations exist computationally but are hidden.

---

## The Six Implementation Options

### Option A — The Setting Toggle (Persistent, Per-Player)

A single setting in the options menu: **"Automatically show pivot annotation after match reveals."** Default ON. Streamers and competitive players can disable it permanently.

When disabled: the debrief timeline is always clean after seal-break. To reveal the diamond, the player manually clicks a **"Show Analysis"** button tucked in the bottom-right of the debrief panel. The button is understated — a small magnifying glass icon, no label, no pulsing attention-grab.

**The streamer flow with this setting:**
1. Start stream. Before opening the debrief, go to settings and toggle off (30 seconds of setup, done once).
2. Watch sealed replays with full annotation suppression.
3. After each reveal: commentate freely on what they think the pivot was. Scrub the timeline manually. Form theories live.
4. When ready to "reveal" the answer: click the magnifying glass. Diamond materializes.
5. The annotation reveal *becomes the stream moment* — not the seal break, but the "let's check our work" moment 5 minutes later.

**Failure mode:** Players who want the setting OFF but forget to set it up, or set it on a new machine without reconfiguring, miss the annotation. Given that the annotation is primarily a teaching tool (and streamers/competitive players already know to turn it off), this is acceptable.

**Strength:** Simple. One setting. No friction for the 95% of players who want default behavior. Clear opt-in path for the 5% who don't.

---

### Option B — The Session Mode Toggle (In-Match, Per-Session)

Rather than a settings menu option, a small toggle button appears in the debrief panel header when the debrief opens — visible only after the seal breaks. It reads: **"Annotation: ON / OFF"** and defaults to ON.

The streamer presses it before the diamond materializes (there's a deliberate 2-second gap between seal-break and diamond appearance, specifically to allow this interaction). If they press OFF in those 2 seconds, the diamond suppresses.

If they miss the window, the diamond has already appeared — but they can hide it retroactively by pressing OFF, which fades the markers to invisible without removing them. They can then re-enable to see the timeline markers again.

**The "cold read" format:**
This session toggle enables a specific stream format: the player watches the sealed match, the seal breaks, the streamer says "let's figure this out ourselves first" and hits the toggle. Then they commentate the debrief live — scrubbing, theorizing, checking signal genealogy manually. The reveal is self-directed: "Okay, I think it was tick 22. Let me check... [toggle ON] ...yes! Tick 22. Buffer miss on Scout_Alpha."

**Strength:** More visceral and interactive than a settings menu. The toggle is visible in the moment, making the opt-out a deliberate in-game action rather than pre-configuration. Creates a natural "cold read" stream format.

**Weakness:** The 2-second window to suppress is tight. Streamers distracted by chat reactions at seal-break might miss it.

---

### Option C — The "Commentary Mode" Named Feature

Rather than a toggle, a named **Commentary Mode** that the game explicitly presents as a feature for streamers and community events. Activated via a button in the debrief's share/export menu labeled "Commentary Mode" with a small stream-icon.

When Commentary Mode is active:
- Diamond and grey markers are hidden
- A subtle purple border appears around the debrief panel (only visible to the player/streamer, not in the OBS capture if the player uses the provided OBS overlay crop template)
- A small floating "?" button appears in the corner — clicking it shows where the annotation *would* be, but only after a 3-second "are you sure?" delay with the message "Revealing pivot annotation."

**Commentary Mode extras:**
- Adds a **"Viewer Challenge"** overlay option: a fullscreen template that says "WHERE WAS THE PIVOT? [timestamp field]" — a ready-made stream overlay for audience participation
- Exports a clean debrief timeline image (no annotations) suitable for Discord posting: "What do you think the pivot was?"
- Optionally reveals the annotation at a player-scheduled time — "Reveal in 5:00" countdown — so the streamer can say "we'll check our answer at the end of the segment"

**The game show format:**
Commentary Mode is designed to enable a specific content format: the streamer screens a match, the audience submits their pivot guesses in chat (using the "!" command that the game's built-in chat bot can parse), and after commentary, the streamer reveals. The game can tabulate: "37% of viewers guessed tick 52 (false pivot). 8% guessed tick 22 (correct)." This viewer stat display is the game show resolution screen.

**Strength:** Elevates the feature from "annoying annotation I had to turn off" to "designed content tool." Gives streamers something to promote: "Robot Uprising has a built-in commentary mode."

**Weakness:** Feature complexity. Viewer challenge integration requires backend infrastructure or third-party bot coordination. May be too complex for a v1 feature. More a 2.0 / community feature.

---

### Option D — Timed Annotation Delay (Universal, Per-Match)

Not a toggle at all — just a **default delay**. The gold diamond doesn't assemble at seal-break; it assembles after the player has had time to react. Default: **90 seconds after seal-break**.

During the 90-second window, the player sees the outcome (won/lost), can scrub the debrief freely, and can theorize. After 90 seconds, the diamond quietly materializes with a soft chime.

Players who want the annotation immediately: click "Show Analysis" to skip the delay. Players who want longer: the delay timer is adjustable (30 seconds to 10 minutes) in settings.

**The psychological argument:**
Most players' first reaction to a seal-break is emotional (relief or frustration). The 90-second delay means the annotation arrives when the emotional spike has passed and the player is in a more analytical headspace. This isn't just for streamers — it's better default design for everyone.

This aligns with 4.24 (hot take vs. cold analysis temporal gap) — the 90-second delay is a micro-version of the cold mode philosophy: give the player a moment before showing them the answer.

**Strength:** Improves the default experience for all players, not just streamers. Streamers get their 90 seconds of unguided commentary naturally.

**Weakness:** Slightly frustrating for players who just want to know what happened immediately. The "Skip delay" affordance is essential.

---

### Option E — Annotation Reveal as Social Mechanic (Community Event Edition)

For community tournament events, a completely separate **Event Mode** where a match is screened for a live audience and the gold diamond reveal is a scheduled event moment.

The tournament host has a **match key** that can project a sealed match in any Robot Uprising client without spoiling the outcome. Audience members join with their own clients or via a browser stream. The match plays sealed. The outcome reveals. And then — the host controls when the diamond appears. They hold it. The host says: "Chat, where do YOU think the pivot was?" The audience votes. After a segment of live commentary, the host hits "Reveal Analysis" and every connected client simultaneously shows the gold diamond materializing on their timeline.

**The simultaneous reveal moment:**
Every viewer's screen shows the diamond appearing at the same tick at the same time, with the same assembly animation. A shared gasp moment. People who got it right (or close) get a brief "✓ WITHIN 5 TICKS" notification in their client. This is designed for in-person tournament viewings and Discord watch parties.

**The "reveal culture":**
This social mechanic seeds a community behavior: the pivot reveal as a ceremony. Players start doing this with friends informally — "let's watch my match, we'll each guess before we look." It's a Robot Uprising analog to the "spoiler time" convention — a shared norm around not immediately checking the answer.

**Strength:** Creates community ritual. Transforms the debrief from a personal diagnostic tool into a social artifact.

**Weakness:** Significant infrastructure (synchronized clients, event hosting, cross-client state). Also requires teaching the community this mode exists — it doesn't happen organically.

---

### Option F — The Dedicated "Commentary Export" Format

Rather than modifying the live debrief, this option adds a separate **export format**: a shareable replay file that, when opened by another player, always starts in "clean debrief" mode with no annotations. The annotations are included in the file but are unlocked by clicking "Reveal Analysis."

This is for the community necropsy format: a player posts their match to Discord, says "watch this, tell me where you think the pivot was," and everyone who opens it gets the clean debrief experience. After discussion, someone (usually the poster) reveals the annotation in their own client, screenshots the diamond, and posts it.

The **commentary export** differs from a standard replay export in one key way: the annotation is hidden by default, and the file metadata includes a flag: `annotation_spoiler: hidden`. Client software respects this flag and suppresses the annotation until the user explicitly reveals it.

**Strength:** Minimal client complexity (just a file flag and a reveal button). Enables the config necropsy community practice. Easy to ship.

**Weakness:** Requires players to know to use this export format. Most will just share regular replays and the recipient's client will show annotations at default timing.

---

## Recommendation: A Two-Layer System

Ship **Option A** (persistent setting) and **Option F** (commentary export) together in v1. These are low-complexity and high-value:

- Option A solves the streamer setup problem with minimal friction
- Option F enables the community necropsy practice that builds viewer culture around the debrief annotation

Add **Option C** (Commentary Mode named feature with viewer challenge) as a post-launch community feature once the streamer base is established and their usage patterns are documented. The viewer challenge feature specifically needs to be built *for* the community that has already formed, not speculatively.

**Option D** (timed delay) is worth implementing as a quality-of-life improvement for all players regardless of streaming context — a 90-second default delay with skip affordance is just better design. Ship this with v1.

Do **not** ship Option E (tournament event mode) until there are active tournaments to design for. Tournament infrastructure before the tournament community is waste.

---

## The Annotation as a Game Show Format

The most important insight in 4.19 is not about streamers. It is about **the annotation as a format**, not just a tool.

The gold diamond was designed as a teaching mechanic: "here is where the outcome was determined." But once it exists, it is also an **answer** — and any time there is an answer, you can make a game show out of hiding the answer. The annotation opt-out isn't a concession to streamers who don't want spoilers. It is the recognition that the annotation reveal is a *distinct content moment* that deserves deliberate design.

The specific format: **the sealed watch → the unguided commentary window → the annotation reveal** is a three-act structure inside the debrief. Act 0 (sealed watch) is drama. Act 1 (unguided commentary) is theorizing. Act 2 (annotation reveal) is the answer — and for a streamer or community event, the answer is *better* when it arrives after collective investment in the question.

The annotation opt-out feature is what makes this three-act format possible. Without it, the reveal happens at the game's default timing (immediately at seal-break) and the theorizing act is skipped. With it, the streamer can insert an Act 1 of any length they choose, and the annotation becomes a deliberate dramatic reveal.

---

## Comparable Games and Media

### The Chess Annotation Model

Chess livestreams have an established convention around engine evaluation. When a grandmaster plays a live game, the streamer (and audience) can choose to:

- **Watch without engine:** Follow the human logic, theorize about moves, experience the game as the players do
- **Watch with engine:** See the computer evaluation bar in real time, which tells you who is winning with high confidence

Top chess streamers like Hikaru Nakamura and Magnus Carlsen's team have developed specific formats around this choice. "Viewer vs. engine" segments where chat predicts the best move before the engine reveals it. "Guess the eval" games. The engine evaluation is not a spoiler to be avoided — it is an *answer* to be revealed at the right moment.

Robot Uprising's gold diamond is the chess engine eval bar. The annotation opt-out is the broadcaster's choice about when to show the eval. The community already understands this format from chess streaming — Robot Uprising can import it directly.

**Specific import:** The chess annotation is always available but the streamer controls when to flip it on. This is Option B (session toggle) implemented in real-world chess broadcasting.

### The Poker Hole Card Reveal

Live poker broadcasts (WSOP, EPT) delay the hole card reveal by 30 minutes for regulatory reasons, but this has had the *accidental* effect of enabling commentary formats built around the unknowing commentators. The classic "poker sweat" is commentators watching a hand and genuinely not knowing what's about to happen — genuine speculation, genuine mistakes, genuine reactions.

Once hole cards appeared in real time, this format became impossible for in-person play and had to be designed back in by using hidden-hand formats or streaming-only restrictions.

Robot Uprising's annotation opt-out is the deliberate design equivalent: preserving the "didn't know yet" format that makes live commentary genuine rather than performative.

**What this teaches:** The unknown is a resource. The annotation opt-out preserves the unknown past the point where the game would normally dissolve it. Treat the unknown like a poker hole card — valuable exactly because it's hidden.

### The NFL Film Room (No Live Commentary)

NFL coaches do their film review work with commentary disabled. They watch the raw play. They form their own assessments. Then they check the analytics overlay — which yards of separation, what coverage coverage, where the gap was. The analytics don't replace their assessment; they validate or refute it.

The best football analysts are measured by how often their annotation-free assessment matches the analytics overlay. "I watched 50 plays and flagged 47 true pivots. My misses were on screens and scrambles where the snap count misled me." This is a professional skill.

Robot Uprising's annotation opt-out enables the same professional-skill-building arc. A player who deliberately disables the diamond and scrubs the debrief manually — then reveals the annotation to check their work — is training the same kind of diagnostic calibration that good coaches develop over years of film work.

**What this teaches:** The annotation reveal is also a *feedback loop* for annotation-free analysis. Competitive players who train without the diamond and check their work with it become better at pivot identification without needing the diamond at all. This is Keiko's process in explicit form.

### Escape Room Design: The "Check Your Work" Button

High-quality escape room design includes a "hint button" that exists visibly but is never pressed by teams who complete the room without it. The hint button's presence is part of the design — it reduces anxiety ("I can always ask for help if I'm stuck") without undermining agency ("I haven't needed it yet").

The magnifying glass in Option B (session toggle's reveal button) is this same design principle applied to the debrief. It exists visibly. Most players in analytical mode will want to press it immediately. But its presence means players who want to hold off — streamers, competitive diagnosticians — have a clear, legible affordance for the choice.

**What this teaches:** The opt-out mechanism should be *visible* even when not used. Hiding the reveal button (making the annotation-suppressed state invisible) removes the psychological safety of "the answer is there when I want it." Keep the magnifying glass visible even when the diamond is hidden.

### Bake-Off / Competition Show Judging Reveal

Baking competition shows (The Great British Bake Off, Nailed It) have a specific moment: the judges reveal their assessment after the competitor has explained what they thought they made. The competitor's explanation comes first; the judgment comes second. The *misalignment* between the competitor's self-assessment and the judges' assessment is comedy or tragedy — and always more interesting than if the judgment had come first.

Robot Uprising's streamer opt-out creates the same format: the streamer's self-assessment ("I think the pivot was tick 52, that cascade I built") followed by the annotation reveal ("tick 22, buffer miss"). The gap between the two assessments is the content. This gap is only possible if the annotation is held back.

---

## Sensory Design: The Manual Reveal

When the annotation opt-out is active and the player manually triggers the diamond reveal, the experience should feel different from the automatic assembly.

**Default assembly (automatic):** The diamond assembles from four triangular wedges, converging to center over 0.8 seconds. The sound is a precise four-part harmonic click — like a lock engaging. Clean, technical. Almost mechanical. It's the machine answering.

**Manual reveal (opt-out mode):** The same animation, but preceded by a 0.5-second "summoning" visual — a soft pulse at the timeline position where the diamond will appear, like something waiting to be called forward. The sound gains a reverb tail, as though the answer has been sitting in a room and the player just opened the door. The diamond arrives the same way, but the antechamber moment makes it feel *earned*.

The grey false-pivot circles appear slightly after the diamond in manual reveal mode — 0.3 seconds each, in chronological order from first to last in the match. They arrive like evidence being laid on a table. Each one lands with a small soft "tak" sound — not the mechanical click of the diamond, but quieter, like placing a pebble.

**The purple border (Commentary Mode):**
In Option C (Commentary Mode), the debrief panel has a subtle lavender border — barely visible, 2px, slightly luminescent. This is the "recording" indicator for the streamer's own awareness. It reads as: "This debrief is a commentary space, not a diagnostic space." In OBS captures, this border is inside the game's designated crop zone and does not appear in the streamed output unless the streamer deliberately includes it.

**The reveal countdown:**
If the streamer uses the "Reveal in 5:00" feature, a small countdown appears in the corner of the debrief panel: a progress arc around the magnifying glass icon, filling gold as the countdown approaches zero. When it completes, the magnifying glass pulses once and the diamond assembles automatically. The streamer can say "ten seconds to reveal, get your bets in" — the visual countdown is their production tool.

---

## Player Journeys

### Journey: Tomás, 28, Robot Uprising Twitch Streamer, 2,300 Followers

**Context:** Tomás has been streaming Robot Uprising for three months. He's at Operative tier, streams 5 hours/week, and his audience has developed a culture around watching his sealed reveals together. He hasn't heard of the annotation opt-out feature — he's been tolerating the gold diamond appearing immediately and having to quickly look away from the timeline before reading it.

**Minute 0:00 — The Problem**

Tomás opens his first match of the stream. SEALED bar pulses cyan. His audience is typing in chat: "LET'S GOOO" "sealed time" "i hope he wins this one." Tomás is already talking: "Okay, this is the Canyon Pass map, I deployed the relay-chain config I spent Thursday on—"

He opens the sealed replay. The match begins. He's commentating in real time, calling the action, reacting to his scouts' movements.

At tick 62, a massive hook cascade fires. Chat explodes.

The SEALED bar begins to dissolve. Crimson. He lost.

The gold diamond materializes at tick 22, immediately pointing to a scout query failure.

Tomás has about 1.2 seconds to look away from the timeline before he reads the answer. He doesn't make it. "Tick 22. Buffer miss. Scout_Alpha." His shoulders slump slightly. "Okay, game told me. Chat, we lost at tick 22, scout buffer miss."

Chat: "boooooo" "what happened at tick 22" "what does that mean"

Tomás goes to the debrief and explains tick 22 accurately but *without the discovery arc* that makes this interesting content. The explanation is correct but flat — he's reading the answer off the screen rather than finding it.

**Minute 8:00 — Discovery**

Three matches later, Tomás notices the Settings link at the bottom of the debrief panel. He's never clicked it during a stream before. He clicks it on a whim.

He sees: **"Automatically show pivot annotation after match reveals. [ON] [OFF]"**

"Wait. WAIT. This is a thing?" He reads the description: "When OFF, pivot annotations are hidden after reveal. Click 'Show Analysis' to reveal manually."

Chat: "OH" "that changes everything" "you didnt know this existed?"

**Minute 9:00 — First Commentary Mode Match**

Tomás toggles it off and deploys a new config immediately. 20 minutes later, the notification arrives. He opens the debrief with annotation suppressed.

The sealed watch plays. The seal breaks: amber gold. He won.

The timeline is clean. No diamond. The debrief scrubber is open.

"Okay, I won, but WHERE did I win? Let's figure this out live. Chat — everyone think about what they saw. What was the pivot?"

Chat is suddenly *active* in a different way. "I think it was the scout redirect at tick 38" "no way it was tick 62 when the opponent's buffer filled" "I think tick 15 when you got first contact before them"

Tomás scrubs the timeline manually. He checks the signal genealogy. He has a theory at tick 38 — the scout redirect. He explains why. Chat debates him.

After 4 minutes of live analysis, he's confident: tick 38. He clicks "Show Analysis."

The diamond assembles, with the reverb tail of the manual reveal. It lands at tick **34** — 4 ticks before his guess.

"Tick 34! I was close. Four ticks off. What happened at tick 34?" He clicks the diamond. Reads the annotation. "Oh — the scout redirect was *caused* by the tick 34 query returning fresh data. I was identifying the effect, not the cause. The actual pivot was when fresh data entered my relay — the redirect was a consequence."

Chat: "OH THAT'S INSANE" "so close" "you were basically right" "robot uprising is actually a philosophy lesson"

**Minute 30:00 — The Format Is Established**

By the end of the stream, Tomás has played 4 annotated-suppressed matches. The format has emerged organically: sealed watch (emotion) → "where was the pivot, chat?" → live analysis with audience → reveal. The reveal has become a *bit* — Tomás says "check our work in 3... 2... 1..." before clicking the magnifying glass.

His average concurrent viewers during the debrief segment went from 890 to 1,400. The segment where they're analyzing before the reveal generates more chat activity than the sealed watch itself.

**What he learns:** The annotation isn't a spoiler to be avoided — it's a reveal to be staged. The format lives in the gap between the seal-break and the diamond.

**What he wants next:** He wants the viewer challenge overlay from Option C so he can collect audience guesses with timestamps and show the distribution after the reveal.

**UI Annotations:**
- **Settings link in debrief:** Small text link, bottom-right of debrief panel, "⚙ Annotation settings." Never intrusive, but discoverable via the settings that engaged players naturally explore.
- **Reveal button location:** The magnifying glass appears in the same bottom-right area after the diamond is suppressed. It has a soft gold pulse — not frantic, just present. Tooltip on hover: "Show pivot annotation."
- **Chat-facing info:** The stream overlay (game's built-in OBS integration) shows a brief badge when annotation suppression is active: a small eye-with-slash icon. Audience who know the feature can see the streamer is running commentary mode.

---

### Journey: Keiko, 26, Commander-Tier Competitive Player, Performing Her Process

**Context:** Keiko (from the false-pivot journey) has recently started streaming her own play. She has 890 followers, almost all high-tier Robot Uprising players. She has always played with annotation suppressed (she uses Option A, the persistent settings toggle). She is about to run her diagnostic process live for the first time.

**Minute 0:00 — The Context Setting**

Keiko opens her stream. She immediately explains:

"Before I open this match — I have annotation suppression on. Always. When the seal breaks, the game won't show me the pivot. I find it myself. I'm going to do that live so you can see the process. If I'm wrong, I'm wrong on stream. Let's go."

Chat: "keiko is about to speedrun a postmortem" "love that she does it without cheating" "this is the kind of content i'm here for"

**Minute 2:00 — The Watch**

The match plays. Keiko watches with practiced calm. At tick 48, a spectacular cascade fires. Her voice stays level: "That's a false pivot candidate. Big visual event, but it's responding to data from tick 30. Watch."

Chat: "SHE CALLED IT" "she just called the false pivot in real time" "how"

The seal breaks: crimson. She lost.

Timeline: clean. No diamond.

**Minute 3:00 — The Diagnostic Process**

"Okay. I'm starting from the loss condition and working backward." She opens the signal genealogy overlay. The network graph of signal propagation fills the left panel.

"My relay failed to route the striker signal at tick 92. Why?" She scrubs to tick 92. The relay's buffer is at 97% full.

"Buffer eviction failure. What was evicting incorrectly? My eviction rule says... 'oldest first, but keep threat signals.' Let me see what was in the buffer at tick 88." She opens the buffer slot detail view, scrubs to tick 88.

"There — three terrain routing signals from tick 32, none evicted because they got re-tagged as threat signals when the flanking unit moved through them. They're occupying 9 slots and are 56 ticks stale. They should have been evicted at tick 60."

"So the problem is: terrain signals getting threat-tagged and becoming non-evictable. That's a rule conflict. Let me trace back to when this first happened."

She scrubs to tick 32.

"First terrain signal gets threat-tagged here. This is my genuine pivot candidate: tick 32, when the eviction rule malfunction first manifested." She marks it manually with the timeline scrubber pin tool.

**Minute 8:00 — The Reveal**

"Okay. I'm calling tick 32. Rule conflict in eviction priorities, terrain-signal ghost occupying buffer from that point forward. Let me check."

She clicks the magnifying glass. The diamond assembles with the reverb tail. It lands at **tick 31**.

Keiko is quiet for two seconds. Then: "31. One tick off. Terrain signal got tagged at tick 31 when the flanking unit was closer than I thought. Close enough."

Chat: "KEIKO" "ONE TICK OFF" "what is she" "this is insane"

"The fix is: add a staleness rule to the threat-tag exception. If a signal is threat-tagged but hasn't been referenced in 20 ticks, downgrade it to terrain category and allow eviction. That's a two-parameter rule change."

She makes the change live, in 40 seconds.

**The Performance as Teaching**

Keiko's stream is 60% high-tier players who already understand the mechanics. But 40% are aspiring mid-tier players watching to learn. This diagnostic process — traced out loud, step by step — is the equivalent of Keiko writing a blog post about her methodology. But it's live, and it's performative, and it has stakes.

The annotation opt-out makes this possible. With the diamond, the 8-minute diagnostic segment collapses to 30 seconds ("oh, tick 31, terrain signal issue, fix the staleness rule"). The *process* — the thing that teaches — is eliminated by the annotation.

**What she learns:** Nothing new. She already knows this. But her audience watches her fail to find it in the first 3 minutes, pursue a wrong hypothesis, correct it, and land within 1 tick. That failure-and-correction arc is the lesson.

**What she wants next:** A way to export her annotated scrubber session as a clip — showing where she marked her hypothesis and where the diamond actually landed — as a sharable artifact.

**UI Annotations:**
- **Manual scrubber pin:** A tool in the debrief toolbar — a pushpin icon — that lets the player mark any tick on the timeline as a hypothesis marker. Distinct from the gold diamond (player-placed pin is silver, unfilled; diamond is gold, filled). Used for "I think the pivot was here" before the reveal.
- **Reveal delta display:** After the diamond materializes, a small "+/- N ticks from your mark" stat appears briefly (3 seconds) in the debrief header. Keiko sees "+1 tick." This is gamified self-assessment — the player who marks before revealing gets a score. This could become a leaderboard sub-metric: "Pivot Accuracy: how close do you get before revealing?"

---

### Journey: Marcus, 32, Community Tournament Organizer, "Find the Pivot" Live Event

**Context:** Marcus is not competing in this scenario — he's running a Robot Uprising community tournament at a local gaming café. 40 people. A projector. He has managed to get the match organizer access that lets him screen matches in "Event Mode" (a simplified version of Option C). He's running a "Find the Pivot" challenge as the event's signature activity.

**The Setup**

Marcus has selected a match that Keiko played in the Gauntlet last week — a loss she posted publicly as a necropsy candidate. Keiko gave permission to screen it. The match has a gold diamond at tick 31 and two grey false-pivot markers at ticks 48 and 71.

Marcus has printed physical scorecards. Each attendee writes down their pivot guess (tick number) before the reveal.

**Minute 0:00 — The Screening**

The match plays on the projector. 40 people watching a sealed replay. The room is quiet and focused — like watching a film. At tick 48, the cascade fires. Multiple people in the room visibly react: "ooh" sounds. Someone says quietly, "is that it?"

The seal breaks: crimson. Keiko lost.

Marcus has Event Mode active. The timeline is clean. He holds the reveal.

"Okay. Before we look — write down your guess. What tick? What happened? 60 seconds."

The room fills with low conversation. 40 people discussing, debating. "I think that cascade at 48 was the problem." "No, I saw the buffer go to 90% earlier." "What about first contact timing?" A few people are nodding confidently; a few are writing and crossing out.

**Minute 3:00 — The Presentations**

Marcus picks three volunteers to share their guess before the reveal. First: a mid-tier player guesses tick 48 (the cascade). Second: a high-tier player guesses tick 31 (terrain signal issue). Third: a beginner guesses tick 62 (opponent's counter-move).

The room is now invested in three different answers.

**Minute 5:00 — The Reveal**

Marcus hits "Reveal Analysis" on his tournament host console. Every projector view (there are two screens, one on each side of the room) simultaneously shows the gold diamond assembling at tick 31.

Grey circles appear at 48 and 71.

Half the room reacts. The second person — who guessed tick 31 — stands up briefly, involuntarily. Applause from their table.

The first person (tick 48) looks at the grey circle now marking their guess: "So I was wrong — that was a false pivot?" Marcus reads the annotation aloud: "The cascade at tick 48 produced impressive coordination but struck empty space — the target had relocated 18 ticks earlier. This was a consequence of the tick 31 buffer issue, not the cause of the loss."

The first person: "Oh. I was seeing the consequence, not the cause."

**The Game Show Resolution**

Marcus tallies scorecards. Of 40 attendees: 22 guessed tick 48 (false pivot, grey-circled), 6 guessed tick 31 (correct, gold-diamonded), 4 guessed tick 62 (grey-circled), 8 guessed other ticks.

He calls the 6 correct guessers up. Each gets a Robot Uprising sticker. The tiebreaker for "closest guess" without being exact: the attendee who guessed tick 28 (3 ticks off) wins a t-shirt.

**What the Event Produces**

The room just learned about false pivots without being taught. The 22 people who guessed the cascade are now curious about their error. The 6 who guessed correctly are asked how they knew — three of them cite signal genealogy signals during the match, two cite buffer levels, one says they just guessed and then laughs.

The format teaches the concept more effectively than a tutorial because:
- The stakes (scorecard, tiebreaker prize) created investment in the question
- The revelation was a shared communal moment
- The error (22 of 40 wrong) is normalized and social — everyone sees their neighbors got it wrong too

**What Marcus wants next:** A way to host this format for online communities — a Discord-embeddable match viewer where participants submit guesses in a form before a scheduled reveal time.

**UI Annotations:**
- **Event mode on host console:** Simple interface — "Match: [Keiko vs. OpponentConfig_114]", "Reveal: [HOLD]", "[REVEAL NOW]". Clean, big buttons designed for stage use.
- **Simultaneous reveal on multiple screens:** The reveal animation is synchronized across all connected clients in event mode. There's a 0.5-second broadcast delay to ensure all screens show the diamond appearing at the same moment.
- **Aggregate guess display (optional):** If the host enables it, after the reveal a heat map of all participant guesses overlays the timeline: density visualization showing where the crowd thought the pivot was vs. where it was. Visualizes the false pivot clustering effect.

---

## Strengths

**Creates a new content format.** The annotation opt-out doesn't just remove a spoiler — it creates an *arc*. The three-act debrief (emotional watch → unguided theorizing → annotation reveal) is a format with natural appeal to streamers, communities, and educators. It transforms a diagnostic tool into a collaborative activity.

**Validates the gold diamond's value by contrast.** When streamers run commentary mode and then reveal the diamond, viewers see the diamond answering the question they spent 5 minutes on. The reveal's value is dramatically higher than if the diamond had just appeared automatically. The opt-out makes players appreciate what the annotation is actually doing.

**Enables competitive skill demonstration.** High-tier players who find the pivot without the annotation — and then reveal to check their work — are demonstrating a genuine skill. The opt-out makes this demonstration possible and natural. It enables "pivot accuracy" as a visible competitive dimension.

**Low engineering cost.** Options A and F are trivial to implement. The annotation already exists; suppressing it and adding a reveal button is hours of work. The community value is disproportionately high relative to implementation effort.

**Normalizes the "false pivot literacy" skill.** By designing a public format around "find the pivot before the reveal," the game implicitly tells players that pivot identification is something they should want to get good at. This is the pedagogy operating through game culture rather than through tutorial missions.

---

## Weaknesses

**Most players don't need or want this.** The settings toggle exists for a small percentage of players. If surfaced too prominently, it creates decision fatigue for the 95% who just want the default experience.

**Commentary mode annotation suppression is a spoiler risk in social settings.** If a player is watching someone else's stream and the host is running annotation suppression without telling their audience, viewers may not know the annotation is being withheld. Transparency about the mode is important. The eye-with-slash indicator in the stream overlay helps.

**The "find the pivot" game show can backfire with incorrect explanations.** In Marcus's journey, the 22 people who guessed tick 48 needed the explanation of why tick 48 was a false pivot — not just "it's marked grey." Without good annotation text, the correction is just "you're wrong" without explanation. The quality of annotation writing is load-bearing for this format.

**Timed reveal (Option D, 90-second default delay) might frustrate fast iterators.** Players who deploy, watch sealed, and want to immediately understand what happened before redeploying are now on a 90-second clock. The skip affordance is essential, but the default delay adds friction to the iteration loop that is the game's core engagement pattern.

---

## Interaction Effects

**With 4.04b — Two-Act Debrief Structure:** The opt-out inserts a new informal act into the two-act structure: Act 0 (sealed watch) → **Act 0.5 (unguided theorizing)** → Act 1 (seal breaks / annotation reveal) → Act 2 (full debrief). For streamers, Act 0.5 is where the content lives.

**With 1.06c-ext-A — Sealed Replay as Tension Mechanic:** The sealed watch ends at seal-break; the annotation opt-out extends the state of productive uncertainty past that point. It's a second, smaller seal — not on the outcome but on the explanation. The mechanic of "hiding the answer to create engagement" applies twice in a single match experience.

**With 7.10 — Config Necropsy as Community Artifact:** The commentary export format (Option F) directly enables config necropsies. A player posting "watch this and tell me where you think the pivot was before I reveal" is performing a necropsy as a community activity rather than a solo retrospective. The export format makes this low-friction.

**With 4.18 — Effective Outcome Timestamp:** The EDT is the answer that the annotation opt-out is hiding. The opt-out doesn't suppress the EDT statistic (which appears in the post-match panel) — it suppresses the *location* of the EDT on the timeline. A sophisticated player who sees "EDT: Tick 31" in the post-match stats but opens commentary mode still has the diamond hidden from the timeline. The stats panel and the timeline annotation are separate suppressible layers.

**With 6.04 — The TikTok Clip:** The best annotation opt-out content — a streamer theorizing for 4 minutes then having the diamond land 1 tick off their guess — is the best clip the game produces. This is the format that converts curious observers to players. "Wait, you can figure this out without the game telling you? How deep is this game?"

**With 5.22 — The Gauntlet as a Third Act:** Tournament play in the Gauntlet may eventually develop formal "annotation-suppressed analysis" as a competitive meta-skill. The difference between Operative and Commander tier might partly be: can you identify the pivot without the diamond? The opt-out creates room for this skill hierarchy.

**With 4.25 — EDT Trajectory as Career Progress Metric:** If "pivot accuracy" (how close your manual guess is to the diamond, when you reveal after) is tracked as a stat, the EDT trajectory and pivot accuracy trajectory together describe two dimensions of player development: "are your architectures producing more contested matches?" and "are you getting better at diagnosing them?" A player can improve one without the other.

---

## The TikTok Clip

**Version A (the discovery arc):**
Streamer opens a sealed replay. Annotates in real time. Cascade fires at tick 48. "That's the pivot." Seal breaks: loss. Timeline clean. "Wait — where's the annotation?" Realizes they have it suppressed. Pauses. "You know what, let's figure this out ourselves." Scrubs to tick 22. Finds empty buffer query. "Is that... is that it?" Hits reveal. Diamond lands at tick 22. Silence. "I found it. I actually found it. Without the hint." Hands in frame, visible trembling. Caption: "figured out my own mistake before the game could tell me"

**Version B (the community event):**
Wide shot: room full of people at tournament. Match on projector. Cascade fires, everyone reacts. Seal breaks. Host says "30 seconds, write your guess." Quick cuts of people writing. "3, 2, 1... reveal." Every screen simultaneously: gold diamond at tick 31. Half the room groans. Six people jump. Caption: "finding the pivot is now a game show"

**Version C (the 1-tick miss):**
Commander-tier player, no annotation. "Calling tick 38, terrain routing failure." Hits reveal. Diamond: tick 34. "34. I was four ticks off. The failure started four ticks before I thought." Scrubs to 34. "Oh — oh that's interesting. I was seeing the first symptom, not the cause. The cause was at 34, the symptom I found was at 38." Caption: "even when you're wrong you learn something"

---

## New Aspects Discovered

- **4.27 — Pivot accuracy as a displayed stat:** tracking how close a player's manual hypothesis (marked on the timeline before revealing) is to the gold diamond EDT; "pivot accuracy" as a skill metric showing up in player profiles; whether accuracy should be shown only when the player deliberately opts into manual-guess mode vs. always tracked; the "0 ticks off" achievement as a Keiko-tier diagnostic milestone

- **4.28 — Annotation reveal countdown as a designed segment format:** the "reveal in 5:00" countdown timer as a structured format tool — not just for streamers but for any player who wants to force themselves to think before checking; a "study mode" toggle that adds a mandatory 3-minute unguided-analysis window before reveal; applies the 4.24 (hot take vs. cold analysis) principle as a designed mechanic rather than an optional setting

- **7.13 — Community "find the pivot" tournament format:** a formal async tournament structure where a featured match is posted and all participants submit pivot guesses within a 24-hour window; the distribution of guesses (displayed after deadline) shows false pivot clustering; winner is closest guess; no debrief tools allowed during submission; the metagame of collective diagnostic calibration across a community

- **7.14 — Annotation accuracy leaderboard:** a global leaderboard tracking not win rate or EDT score but "annotation accuracy" — players who consistently mark within ±5 ticks of the diamond before revealing; the top annotators are the "diagnosticians" of the competitive community; their config necropsies are trusted because their manual pivot-identification is provably calibrated
