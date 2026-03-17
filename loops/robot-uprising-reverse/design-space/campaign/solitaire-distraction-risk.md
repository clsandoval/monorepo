# 5.11 — Solitaire Distraction Risk

## The Problem

When a secondary mechanic becomes more engaging than the core loop, players drift. They stop playing the game you designed and start playing the game they found inside it. The mini-game eats the main game alive.

This is the **Gwent Problem** — named for the card game inside The Witcher 3 that became so compelling that 68% of players engaged with it, many abandoning the main quest entirely to hunt down NPCs for card battles. CD Projekt Red eventually spun Gwent into a standalone product. The same pattern appears with Triple Triad in Final Fantasy VIII (players describe the RPG as "a 40+ hour minigame attached to Triple Triad"), Yakuza's arcade machines and karaoke, and Factorio's ratio calculator obsession where players spend hours computing optimal belt throughputs instead of actually launching the rocket.

For Robot Uprising, the risk surfaces in three specific secondary mechanics:

1. **The Inspector** — The analytical debrief tool with timeline scrubbing, signal genealogy, decision traces, context window charts. For a certain player archetype, the Inspector IS the game. Diagnosing why a relay compressed the wrong signal at tick 14 is more intellectually satisfying than designing the relay in the first place.

2. **The Sandbox/Practice Range** — Free-play spaces between campaign missions (5.03, 5.05b) where players experiment without stakes. The sandbox's zero-consequence environment removes the anxiety that makes the core loop feel risky. Some players will live there forever.

3. **The Fix Explorer** — The counterfactual simulation system (4.20, 4.36) that lets players explore "what if" scenarios. Searching for the minimum fix is a combinatorial puzzle — a game-within-a-game with its own difficulty curve, its own mastery arc, its own "one more run" hook.

Each of these is deliberately designed to be rich and engaging. The question isn't whether they'll distract — they will. The question is: **when does distraction become a design failure, and when is it a design feature?**

---

## The Distraction Taxonomy

### Class 1: "The Gwent" — Complete Loop Substitution

The secondary mechanic has its own complete gameplay loop (goal → action → feedback → iteration) that doesn't require the primary loop to function. Players can spend an entire session in the secondary mechanic without touching the core loop.

**Robot Uprising risk:** The Inspector + Fix Explorer combination. A player who loses a match can spend 30+ minutes in the debrief scrubbing timelines, running counterfactual simulations, tracing signal genealogy, and hunting for the minimum fix — without ever returning to the workbench to actually implement the fix they found.

**When it's healthy:** The player is learning. Each Inspector session deepens their understanding of the system, and the knowledge transfers to better workbench decisions next time.

**When it's pathological:** The player is **performing analysis as procrastination.** They understand the problem but keep running counterfactuals to avoid the cognitive effort of redesigning their blueprint. Analysis feels productive; design feels risky. The debrief is safe; the workbench is exposed.

### Class 2: "The Factorio Calculator" — Optimization Paralysis

The secondary mechanic provides analytical tools that make the player feel like they should optimize *before* acting. The tools are so powerful that the cost of analysis always feels lower than the cost of a suboptimal build.

**Robot Uprising risk:** The workbench itself. With ghost unit previews showing perception radii, channel wiring visualizations, the animated tooltip micro-scenarios (1.17a), and queue production cost previews — the Plan screen is rich enough to optimize indefinitely without ever hitting EXECUTE. The player never sees a sealed watch because they never stop planning.

**When it's healthy:** The player is building a mental model. Complex configurations genuinely need thinking time.

**When it's pathological:** The player is afraid of failure. They keep tweaking because hitting EXECUTE means surrendering control to the sealed watch's no-skip, no-pause, no-tools judgment. The Plan screen feels safe. The EXECUTE button feels like jumping off a cliff.

### Class 3: "The Sandbox Trap" — Zero-Consequence Comfort

The secondary mechanic removes the stakes that make the primary loop feel meaningful. Players retreat to the low-stress environment because it provides dopamine (experimentation, discovery) without cortisol (failure, judgment, progression pressure).

**Robot Uprising risk:** The practice range (5.05b, 5.03c) and the sandbox return mechanic. If players can freely experiment between missions without any pressure, the campaign's carefully designed difficulty curve becomes optional. "I'll do one more sandbox run" becomes "I spent 45 minutes in the practice range and now I'm tired."

**When it's healthy:** The player is genuinely practicing a specific technique they identified as weak.

**When it's pathological:** The player is avoiding the next mission because they're anxious about failure. The sandbox provides the *feeling* of progress (I'm getting better!) without the *evidence* of progress (I beat the mission).

---

## Five Design Responses

### Response A: "The Gwent Shrug" — Let It Happen

Accept that some players will spend most of their time in secondary mechanics. Design those mechanics to be genuinely excellent standalone experiences. If someone wants to spend 80% of their Robot Uprising time in the Inspector, celebrate that — they're still engaged with the game.

**Philosophy:** CD Projekt Red didn't fight Gwent addiction. They made it into a product. Triple Triad's designer would be horrified to learn players skipped Ultimecia's castle for card games — or maybe delighted. The player is having fun. Who are you to say it's the wrong kind of fun?

**Implementation:**
- Inspector is fully featured from the moment it unlocks
- Sandbox has no time limits, session caps, or progress-gating
- Fix Explorer has no compute budget restrictions
- Campaign progress is not blocked by time spent in secondary modes

**Strengths:**
- Maximum player autonomy
- Secondary mechanics become discovery tools for different player archetypes (the analyst, the experimentalist, the perfectionist)
- No artificial friction that feels punitive
- Community content creation thrives (Inspector replays, sandbox discoveries, Fix Explorer puzzles)

**Weaknesses:**
- Campaign completion rates plummet — players never finish the 10 missions because they're stuck optimizing Mission 3
- The late-game systems (Command agents, factory vs. factory) never get experienced
- The designed emotional arc (learn → master → prove) gets flattened into "analyze → analyze → analyze"
- For every Gwent success story, there are dozens of games where a distraction mechanic killed engagement with the core product

**Comparable:** The Witcher 3 + Gwent (accepted), Final Fantasy VIII + Triple Triad (accepted), Yakuza series (every game is 40% minigames by design)

### Response B: "The Leash" — Time-Gate Secondary Mechanics

Impose hard limits on how long players can spend in secondary mechanics per session or per mission attempt.

**Philosophy:** The game knows what's good for you better than you do. The designer's job is to create the optimal experience, and that means moving the player through the full loop — Plan → Execute → Watch → Inspect → Plan — at the designed pace.

**Implementation:**
- Inspector has a maximum 5-minute session timer per match (after which: "ANALYSIS COMPLETE. Return to workbench.")
- Sandbox between missions is limited to 3 attempts
- Fix Explorer compute budget (4.60) is genuine — when tokens run out, you must play another match to earn more
- Campaign progress checkpoints require returning to the core loop

**Strengths:**
- Players experience the full designed arc
- Time pressure creates urgency that mirrors real engineering deadlines
- Prevents perfectionism paralysis
- Matches Robot Uprising's "quality signal" philosophy — the sealed watch has no skip; the Inspector shouldn't be infinite either

**Weaknesses:**
- Feels punitive to analytical players who WANT more Inspector time
- Arbitrary time limits are universally hated in game design (one of the most common player complaints across all genres)
- The Inspector's value proposition IS deep analysis — limiting it undermines its purpose
- Creates "save my Inspector time" anxiety that poisons the analytical phase
- Community backlash: "Why did you build this incredible diagnostic tool and then limit how much I can use it?"

**Comparable:** Into the Breach has no dedicated analysis mode at all — the game IS the analysis. Slay the Spire's post-run recap is deliberately shallow (stats screen, no replay). XCOM's autopsy screen gives you a fixed amount of info and moves on.

### Response C: "The Breadcrumb" — Make Core Loop Progress Visible from Inside Secondary Mechanics

Instead of limiting time in secondary mechanics, make the *cost of staying there* visible. Show the player what they're missing by not returning to the core loop.

**Philosophy:** Players are rational. If they can see that their Inspector session has diminishing returns — that they've extracted 90% of the useful information and the last 10% would take 10x longer — they'll self-regulate. The problem isn't that players are in the Inspector too long; it's that they can't tell when they're done.

**Implementation:**
- **Inspector Insight Meter:** A subtle progress bar that fills as the player discovers new information (unique rule traces, unseen signal chains, novel failure modes). Starts filling fast, slows dramatically. When it plateaus, a gentle prompt: "You've reviewed 94% of unique events. Remaining events are variations of patterns already observed."
- **Workbench Breadcrumbs:** The Inspector surfaces "recommended workbench changes" as a persistent sidebar. Each breadcrumb is a specific, actionable change: "Rule 3 on RELAY-A never fired → consider removing or modifying." As the player reviews more, breadcrumbs accumulate. The sidebar becomes an implicit to-do list that pulls toward the workbench.
- **Sandbox Graduation Signal:** The practice range tracks which specific skills the player is practicing. When they've demonstrated competence (3+ successful applications of a technique), the game says: "Technique confirmed. Mission 6 is ready when you are."
- **Fix Explorer Confidence Score:** After each counterfactual run, show a confidence score: "This fix improves pass rate by ~15% with 78% confidence (based on 3 simulations). Run 2 more simulations for 90% confidence, or apply now." Makes the cost-benefit of continued analysis explicit.

**Strengths:**
- No hard limits — player retains full autonomy
- Diminishing returns become visceral rather than abstract
- Breadcrumbs create a natural transition point ("I have 4 changes to make — time to go to the workbench")
- Teaches the engineering skill of knowing when to stop analyzing and start building
- The Insight Meter IS a game mechanic itself — 100% insight becomes a completionist goal

**Weaknesses:**
- Hard to calibrate — if the meter fills too fast, it feels dismissive; too slow, it's ignored
- Some players will treat the meter as a challenge ("I won't leave until 100%")
- Breadcrumbs might feel like the game is telling you how to play
- Breaks the Inspector's purity as a pure analysis tool — it becomes part of the feedback loop

**Comparable:** WoWAnalyzer's "feed forward" approach (tells you what to do differently, not just what happened). Chess.com's post-game analysis that highlights "key moments" and doesn't show every move. Factorio's production statistics that show throughput trends, making overcapacity visible.

### Response D: "The Metabolism" — Secondary Mechanics Fuel the Core Loop

Design secondary mechanics so their output IS the input for the next core loop iteration. The Inspector doesn't just *show* you what happened — it produces artifacts that change the workbench. The sandbox doesn't just *let* you experiment — it produces configurations that enter the campaign.

**Philosophy:** There is no "distraction" if every mechanic feeds the same system. The Gwent Problem occurs when the secondary mechanic has no outputs that the primary loop consumes. If Gwent cards powered combat abilities (which, through FFVIII-style junctioning, Triple Triad actually did), the distraction becomes fuel.

**Implementation:**
- **Inspector → Workbench Direct Pipeline:** Every Inspector discovery generates a "Diagnostic Card" — a specific, testable hypothesis about the config. "RELAY-B's compress fired 2 ticks too late in 4/7 runs." The card persists in the workbench as a pinned reminder. The player doesn't just *learn* from the Inspector — they receive actionable artifacts.
- **Fix Explorer → Auto-Apply:** The fork-and-deploy shortcut (4.37) isn't optional — it's the primary output of the Fix Explorer. Finding a fix and NOT applying it requires deliberate action (dismiss button), making the default flow: analyze → find → apply → re-execute.
- **Sandbox → Campaign Carry-Over:** Sandbox experiments produce "tested configurations" that earn a ✓ badge. Using a tested configuration in a campaign mission gives a small bonus (e.g., the boot log acknowledges prior testing: "Configuration stress-tested. Deploying with confidence."). Not mechanically significant — emotionally significant.
- **Campaign Progress Unlocks Inspector Depth:** Inspector features unlock progressively (already in the locked design via 5.22's Gauntlet Inspector reward). This means the Inspector *improves* as you progress through the campaign, creating pull toward the core loop to unlock better analytical tools.

**Strengths:**
- Every minute in a secondary mechanic produces value for the primary loop
- The "distraction" IS the game — there's no wasted time
- Teaches the real engineering workflow: observe → diagnose → hypothesize → fix → verify
- Progressive Inspector unlock creates forward campaign pressure even for analyst players
- Diagnostic Cards are a shareable community artifact

**Weaknesses:**
- Auto-apply from Fix Explorer removes the learning step of "find the element in the config yourself" (already flagged in 4.37)
- Sandbox carry-over might trivialize early campaign missions
- If every mechanic is just "workbench input," the emotional variety collapses — everything feels like work
- Risk of "productive fun" replacing "pure fun" — players feel obligated to analyze instead of enjoying the sealed watch

**Comparable:** FFVIII Triple Triad → Card Mod → Junction (card game powers combat). Slay the Spire's card removal at shops (spending IS deck optimization). Factorio's research (science production IS factory building IS the game). XCOM's autopsies (narrative + mechanical rewards for engaging with research).

### Response E: "The Rhythm" — Design Pacing That Makes Distraction Impossible

Structure the game so that the transitions between mechanics are so tight, so rhythmic, that there's no *space* for distraction. The player flows from Plan → Execute → Watch → Inspect → Plan without a pause long enough to get lost.

**Philosophy:** Distraction is a pacing problem, not a content problem. Players drift into secondary mechanics when the core loop has dead time. If the transitions are seamless, the momentum carries them through.

**Implementation:**
- **The 90-Second Sealed Watch:** Campaign matches are short enough (50-70 ticks at 1 second/tick) that the sealed watch never overstays. No time to alt-tab.
- **Inspector Auto-Focus:** When the sealed watch ends, the Inspector opens *already scrubbed to the decisive moment.* The player doesn't have to search for the interesting tick — it's highlighted. 30 seconds of "here's what happened" before the "dig deeper?" prompt.
- **Workbench Continuity:** The workbench remembers cursor position, last-edited element, and scroll state. Returning from the Inspector feels like unpausing, not restarting.
- **Two-Tick Transition:** The visual transition from sealed watch → Inspector → workbench takes exactly 2 ticks (2 seconds). No loading screens, no menus, no mode selection. The camera pulls back, the timeline appears, the sidebar slides in.
- **The "Next Mission" Pulse:** After applying Inspector insights to the workbench, a gentle gold pulse on the EXECUTE button. Not a prompt — a visual heartbeat that says "I'm ready when you are." The pulse strengthens after 30 seconds of inactivity.

**Strengths:**
- The core loop becomes addictive by itself — "one more run" emerges naturally from the pacing
- No artificial limits needed because the flow prevents stagnation
- Matches the target feel: "managing smart autonomous systems" has a rhythm — deploy, observe, adjust, redeploy
- Short sealed watches mean low retry cost, which means more runs per session, which means faster learning
- The gold pulse is psychologically powerful without being aggressive

**Weaknesses:**
- Short matches may not showcase complex architectures (already addressed in 5.23 — campaign is 50-70 ticks, Gauntlet is 80-150)
- Auto-focused Inspector reduces serendipitous discovery — the player might miss a subtle pattern because they weren't scrubbing freely
- Tight pacing doesn't accommodate slow, contemplative players who need processing time
- The gold pulse could feel pressuring to anxious players
- "Design the pacing so distraction is impossible" is aspirational — players WILL find ways to drift

**Comparable:** Into the Breach's ~15-minute runs create exactly this flow. Slay the Spire's "one more floor" momentum. Celeste's instant respawn. Dead Cells' run cadence. The common thread: short cycles, fast transitions, immediate re-engagement.

---

## Interaction Effects

### × Sealed Watch Purity (Locked)
The sealed watch's "no skip, no pause, no tools" design is the game's most aggressive anti-distraction choice. During the watch, distraction is *impossible* — the player is locked in. The risk surfaces in the transitions *around* the watch: the Plan screen (optimization paralysis) and the Inspector (analysis procrastination). The sealed watch is actually the *solution* to distraction in its own phase.

### × Inspector Progressive Unlock (5.22)
The locked design already gates full Inspector access behind campaign completion (Gauntlet-only). This is Response D in action — the campaign pulls analyst players forward because the diagnostic tools they crave are behind the progression wall. The risk: frustration. An analyst player stuck on Mission 7 with limited Inspector tools feels punished for their preferred playstyle.

### × Fix Explorer Compute Budget (4.60)
If the compute budget is genuine (Response B), it limits Fix Explorer distraction but creates its own secondary game (budget management). If it's generous enough to feel unlimited, it fails as a distraction limiter. The calibration is critical.

### × Tutorial-as-Puzzle (5.01)
Tutorial filter puzzles are immune to the solitaire risk because they ARE the core loop. But once the sandbox unlocks (Mission 5), the clean filter-puzzle experience might become a comfort zone that players retreat to instead of facing factory complexity.

### × Campaign Match Length (5.23)
Short campaign matches (50-70 ticks) naturally implement Response E. Long Gauntlet matches (80-150 ticks) shift the balance — a 150-tick match produces a much richer Inspector session, increasing the pull toward deep analysis.

### × Streaming/Content Creation
Distraction mechanics are **features** for streamers. A streamer spending 20 minutes in the Inspector explaining signal traces is creating content. A streamer theory-crafting in the sandbox is creating community engagement. The "solitaire distraction" IS the stream format. Design responses shouldn't inadvertently kill this use case.

### × Search Budget as Resource (4.60)
The search budget creates a meta-game around diagnostic resource allocation that IS itself a solitaire-risk mechanic. Players might spend more time optimizing when to spend compute tokens than actually running diagnoses. This is the Factorio Calculator problem applied to the Fix Explorer.

---

## The Core Tension: Productive Distraction vs. Procrastination Masquerading as Progress

The fundamental insight is that Robot Uprising's secondary mechanics are **all productive.** Unlike Gwent (pure entertainment diversion) or Triple Triad (entertainment + marginal combat benefit), the Inspector, sandbox, and Fix Explorer produce genuine learning and diagnostic output. This makes the solitaire risk simultaneously less harmful and harder to detect.

A player spending 45 minutes in the Inspector IS learning. They're building the mental model that will make them a better architect. The question is whether they'd learn *faster* by spending 15 minutes in the Inspector and 30 minutes doing two more Plan-Execute-Watch cycles.

**The answer depends on the player.**

- **Analytical players** (ML engineers, SREs, system thinkers) genuinely benefit from deep Inspector sessions. Their learning is concept-driven — they need to understand *why* before they can design *what*.
- **Experimental players** (Factorio builders, tinkerers, Minecraft redstoners) learn by doing. Long Inspector sessions are procrastination for them — they need to build and break things.
- **Narrative players** (RPG fans, story-driven gamers) want the arc. Too much time in any analytical mode kills their momentum. They need the rhythm of Response E.
- **Competitive players** (ranked grinders, speedrunners) self-regulate naturally. Time in the Inspector that doesn't improve their ELO is time wasted. They'll leave as soon as they've extracted actionable info.

---

## Player Journeys

### Journey: Sofia, 15, Manila, first strategy game

**Context:** Mission 5, just unlocked the factory. Has beaten Missions 1-4 cleanly. The sandbox practice range just became available.

**Minute 0:00 — The Overwhelm**
Sofia opens Mission 5's Plan screen. The workbench has expanded — production queue, blueprint editor, channel map. She stares at it. The boot log scrolls: "FACTORY SUBSYSTEM ONLINE. You are no longer placing units. You are designing the machines that build them." She reads it twice. The EXECUTE button glows gold in the top-right corner. She doesn't touch it.

**Minute 1:30 — The Retreat**
She notices the "PRACTICE RANGE" button on the campaign map. Clicks it. The practice range loads with a simplified battlefield — 4×4, one enemy spawner, her factory. No pressure. No tick limit. She drags a scout blueprint to the production queue. The factory animates. A scout appears. She smiles. Drags a striker blueprint. Another unit appears. She spends five minutes just watching units spawn.

**Minute 7:00 — The Comfort Zone**
Sofia has been in the practice range for five and a half minutes. She's built four different production queues, watching each one play out. She understands the conveyor belt metaphor. She's not afraid of the factory anymore. But she's also not *learning* anything new — the last three configurations were minor variations of the first one. The practice range has no enemy pressure, so she's not discovering failure modes.

**Minute 8:30 — The Breadcrumb (Response C)**
A small indicator appears in the practice range sidebar: "Skills practiced: production queue (✓), blueprint editing (✓), channel assignment (—), context config (—)." Below it: "Mission 5 requires: production queue + channel assignment." Sofia realizes she hasn't tried channels yet. She drags a hook onto the scout blueprint, types "recon" as the channel name. The relay lights up. Something new happens. She leans forward.

**Minute 12:00 — The Return**
The sidebar updates: "Skills practiced: production queue (✓), blueprint editing (✓), channel assignment (✓), context config (—)." A gentle prompt: "Configuration stress-tested. Mission 5 is ready when you are." Sofia exits the practice range and opens Mission 5. She's been in the sandbox for 12 minutes — longer than Missions 1-4 combined. But she needed it. The factory was too much, too fast.

**UI Annotations:**
- Practice range sidebar: 160px right panel, grey background, skill checklist with ✓/— indicators, mission-requirement callout at bottom in amber text
- "Ready when you are" prompt: appears at bottom of sidebar with subtle pulsing border, no dismiss required, disappears on mission open
- Return to campaign: single click on campaign map icon in top-left, 400ms transition

---

### Journey: Marcus, 42, DevOps engineer, Factorio veteran

**Context:** Mission 8, Command agent unlocked. Has been playing for 6 hours total. Just lost a match where his command unit's REASSIGN skill triggered too late.

**Minute 0:00 — The Loss**
Sealed watch ends. Marcus's factory is destroyed at tick 58. He saw the moment — tick 31, the command unit received a threat signal but didn't reassign the idle striker for 4 ticks. By tick 35, the enemy had already breached the relay line. He's frustrated. The Inspector opens, already scrubbed to tick 31 (Response E's auto-focus).

**Minute 0:45 — The Rabbit Hole**
The Inspector shows the command unit's decision trace at tick 31. Rule 4: "IF threat_count > 2 AND idle_unit EXISTS → REASSIGN idle to threat." The trace shows: threat_count was 2 at tick 31 (not > 2), rose to 3 at tick 32, REASSIGN fired at tick 32, but signal latency meant the striker didn't receive the order until tick 34. Marcus changes the condition to "> 1" in his head. But wait — what if that causes false positives? He scrubs back to tick 15 to check the threat_count history.

**Minute 3:00 — Still in the Inspector**
Marcus has traced the threat_count signal chain through three relays. He's discovered that one relay's compress skill is smoothing the count — it receives "threat at E4" and "threat at E5" but compresses them to "threats in sector E." The command unit sees "1 threat" when there are actually 2. This is a relay configuration problem, not a rule problem. He's genuinely learning something important.

**Minute 6:00 — The Optimization Trap**
Marcus is now 6 minutes into the Inspector. He's mapping every relay's compress behavior across the full 58-tick timeline. He's found that the compress skill reduces threat fidelity by ~40% on average. He's considering whether to change compress parameters, add a second relay with filter instead, or modify the command unit's rules to account for compressed data. He opens the Fix Explorer.

**Minute 10:00 — The Factorio Calculator Moment**
Marcus has run 4 counterfactual simulations in the Fix Explorer. The "change threshold to > 1" fix improves pass rate by 12%. The "remove compress from RELAY-A" fix improves it by 18% but creates a buffer overflow at tick 44 in 3 of 7 simulations. The "add filter to RELAY-B" fix improves it by 22% but he hasn't tested interaction effects. He's comparing three columns of numbers. He hasn't touched the workbench.

**Minute 12:00 — The Breadcrumb Pull (Response C)**
The Inspector's Diagnostic Card sidebar shows three pinned cards:
1. "COMMAND-A: threat threshold too strict (> 2 → > 1)" — 78% confidence
2. "RELAY-A: compress reducing threat fidelity by ~40%" — 91% confidence
3. "RELAY-B: filter slot empty, available for threat deduplication" — suggested

The Insight Meter shows 87%. A subtle label: "Core failure pattern identified. 3 workbench changes queued." Marcus looks at the three cards. He knows what to do. He's known since minute 3. The last 9 minutes were interesting but not actionable. He clicks "Return to Workbench" and the three Diagnostic Cards appear as pinned items on the workbench sidebar.

**Minute 13:00 — The Apply**
Marcus adjusts the command threshold (30 seconds), removes compress from RELAY-A and adds filter to RELAY-B (2 minutes). Hits EXECUTE. The entire cycle from loss → analysis → fix → re-execute was 13 minutes. Without the Diagnostic Cards pulling him back, it would have been 25.

**UI Annotations:**
- Diagnostic Cards: 200px right sidebar in Inspector, amber cards with one-line summary + confidence %, persist to workbench view as pinned items
- Insight Meter: thin horizontal bar at top of Inspector, fills blue-to-green, percentage label at right end, slows visibly after ~80%
- "Return to Workbench" button: appears at bottom of Diagnostic Card sidebar when 3+ cards accumulated, soft cyan glow

---

### Journey: Kwame, 32, Twitch streamer, 14K followers

**Context:** Mission 9 of his first campaign playthrough, streaming live. Chat has 340 viewers. He just lost a dramatic match where his entire relay network went down in a chain failure.

**Minute 0:00 — The Content Goldmine**
Sealed watch ends. Kwame's face is visible in the corner cam. "Chat. CHAT. Did you see tick 22?! The whole relay line just — " He gestures an explosion. Chat is going wild. Clip requests flood in. The Inspector opens.

**Minute 0:30 — The Stream Format**
Kwame scrubs to tick 22. The signal genealogy shows a cascade: enemy striker eliminated RELAY-C at tick 20, all signals routed through RELAY-C were lost, RELAY-A and RELAY-B had no backup path, the command unit's context went dark, and every subordinate unit defaulted to patrol-in-place. "It's a single point of failure!" Kwame exclaims. "I built a daisy chain and they just... snipped the chain." Chat: "SPOF SPOF SPOF."

**Minute 3:00 — The Performance**
Kwame is now performing the Inspector session for his audience. He traces every lost signal, shows the command unit's empty context window at tick 23 ("look at this — NOTHING — the command unit is BLIND"), compares the pre-failure state to post-failure. This is compelling content. Chat is engaged. Kwame is teaching 340 people about redundant network topology through a game's debrief tool.

**Minute 8:00 — The Solitaire Risk**
Kwame opens the Fix Explorer. "Let's see what the minimum fix is, chat." He runs a counterfactual: add a backup channel from RELAY-A directly to COMMAND. Pass rate jumps from 20% to 68%. "ONE CHANNEL!" Chat: "ONE CHANNEL ONE CHANNEL." He runs another: add a second relay as redundant backup. Pass rate: 82%. He runs a third. A fourth. Chat is suggesting experiments. "Try removing RELAY-C entirely." "What if you encrypt the backup channel?" Kwame is having fun. The stream is thriving. But he hasn't returned to the workbench in 8 minutes.

**Minute 11:00 — Chat as Anti-Distraction**
A chatter types: "bro just go fix it, you've been in debrief for 10 minutes." Another: "EXECUTE." Kwame laughs. "You're right, you're right." He applies the backup channel fix from the Fix Explorer (Response D's auto-apply), returns to the workbench, and hits EXECUTE. The community, not the game's systems, provided the anti-distraction signal.

**Minute 12:30 — The Clip**
The new sealed watch plays. At tick 20, RELAY-C goes down again. But this time, the backup channel fires. COMMAND stays online. The strikers converge. Victory at tick 47. Kwame jumps out of his chair. "REDUNDANCY, BABY!" 12 clip requests. 23 new followers.

**UI Annotations:**
- Fix Explorer results: side-by-side counterfactual comparison cards, each showing pass rate delta and changed element
- Auto-apply button: "Deploy This Fix →" button on each counterfactual card, cyan, applies change and returns to workbench in one click

---

## Recommended Design Response: The Metabolic Rhythm (D + E Hybrid)

Neither pure time limits (Response B — players hate them) nor pure laissez-faire (Response A — campaign completion suffers) addresses the real problem. The recommended approach combines **Response D** (secondary mechanics produce artifacts that feed the core loop) with **Response E** (tight pacing makes distraction unnatural).

### Core Principles:

1. **Every secondary mechanic produces a tangible output.** Inspector produces Diagnostic Cards. Fix Explorer produces one-click deployable fixes. Sandbox produces "tested configuration" badges. The output isn't a reward — it's a transition point. Having the output means you're done analyzing. Not having it means you haven't finished.

2. **Transitions are instant and continuous.** No mode selection menus. The camera moves, the sidebar changes, the context updates — but the game state is continuous. Returning to the workbench from the Inspector takes 1.5 seconds and preserves every cursor position and scroll state.

3. **Diminishing returns are visible.** The Insight Meter shows when analysis is plateauing. The Sandbox skill checklist shows when practice has covered the relevant techniques. The Fix Explorer confidence score shows when more simulations have marginal value. The player is never told to stop — they can see when continuing has lower returns.

4. **The EXECUTE button is always beckoning.** A persistent gold pulse in the top-right corner of every secondary screen. Not a prompt, not a timer, not a popup. A heartbeat. It says: "The battlefield is waiting." The pulse strengthens after 60 seconds of no workbench changes.

5. **Campaign progress unlocks Inspector depth.** The analyst player's desire for richer tools creates natural pull through the campaign. Mission 5 unlocks signal genealogy. Mission 7 unlocks the Fix Explorer. Gauntlet unlocks cross-match analysis. The secondary mechanic's own progression is gated behind the primary loop.

### What This Looks Like:

A player loses Mission 7. The sealed watch ends (90 seconds). The Inspector opens auto-focused on the decisive tick (2 seconds of transition). The player scrubs, traces, discovers the failure cause (3-5 minutes). Two Diagnostic Cards appear in the sidebar. The Insight Meter hits 85%. The player clicks "Return to Workbench" (1.5 seconds). The Diagnostic Cards are pinned. The player makes two changes (2 minutes). The EXECUTE button pulses gold. They click. New sealed watch begins.

**Total cycle: 10-12 minutes.** Short enough for "one more run." Long enough for genuine learning. Tight enough that distraction never has space to take root.

---

## Comparable Games — The Distraction Spectrum

| Game | Secondary Mechanic | Relationship to Core | Distraction Level | Design Response |
|------|--------------------|---------------------|-------------------|-----------------|
| The Witcher 3 / Gwent | Card game | Nearly independent | Extreme — separate product | Accepted (spun off) |
| FFVIII / Triple Triad | Card game | Feeds combat via Card Mod | High — but productive | Integrated (junction system) |
| Factorio | Ratio calculators, external tools | Optimizes factory building | Medium — analysis paralysis | Community-accepted ("that IS the game") |
| Into the Breach | None (analysis IS the turn) | N/A | Zero — no secondary mechanics | Eliminated by design |
| Slay the Spire | Post-run stats | Shallow, no interaction | Low — 30 seconds max | Minimized (deliberate shallowness) |
| Celeste | Assist mode | Reduces difficulty | Low — orthogonal to core | Separated (accessibility, not engagement) |
| XCOM | Research/engineering | Unlocks new tools | Low — feeds core loop directly | Metabolized |
| Opus Magnum | GIF recording, histograms | Celebration of solution | Medium — "one more optimization" | Accepted (optimization IS the game) |

---

## Sensory Description of the Anti-Distraction Signals

**The Insight Meter:** A thin (4px) horizontal bar spanning the top of the Inspector screen. Starts empty (dark grey). Fills left-to-right in a gradient from deep blue (0%) through teal (50%) to bright green (100%). The fill animation is smooth when new discoveries are frequent, then visibly stutters and slows as diminishing returns set in — the bar's fill speed IS the signal. At 80%+, each new percentage point takes visibly longer. The number label ("87%") appears at the right end in the same gradient color. No sound. No celebration at 100% — just quiet completion.

**The Diagnostic Cards:** Appear one at a time in the right sidebar with a soft paper-unfold animation (200ms). Each card is 180px wide, 80px tall, with a warm amber background (#F5A623 at 15% opacity), a one-line finding in 13px monospace, and a confidence percentage in the top-right corner. High confidence (>80%) cards have a solid amber left border. Low confidence (<50%) cards have a dashed border. When 3+ cards accumulate, a "Return to Workbench →" button materializes below them with a gentle upward slide (300ms).

**The EXECUTE Pulse:** A radial glow animation on the EXECUTE button, pulsing from dim gold (#C8A84E at 20% opacity) to bright gold (#FFD700 at 60% opacity) over a 3-second cycle. The pulse is barely perceptible initially — the player notices it subconsciously before consciously. After 60 seconds of workbench inactivity following Inspector return, the pulse radius increases by 30% and the animation speed increases to 2-second cycles. Never accompanied by sound. Never blocks interaction. Never generates a tooltip. Just a patient, living invitation.

**The 2-Second Transition:** When switching from Inspector to Workbench, the timeline scrubber slides down and off-screen (200ms), the sidebar panels morph in place — Diagnostic Cards maintain position but their container changes from Inspector's dark background to Workbench's lighter one (400ms cross-fade). The board view doesn't change — it's the same 8×8 grid, just the surrounding UI shifts. The cursor reappears exactly where it was in the workbench. Total perceived transition time: 1.5-2 seconds. No loading indicator needed.

---

## The TikTok Clip

Split-screen. Left side: player in the Inspector, scrubbing timelines, running counterfactuals, 8 minutes deep, the Insight Meter stuck at 91%. Right side: the EXECUTE button pulsing gold, getting brighter. A Diagnostic Card pops up: "RELAY-B backup path missing — 92% confidence." The player glances at the pulse. Clicks "Return to Workbench." The transition is instant — same board, new sidebar, Diagnostic Cards pinned. Two quick edits. EXECUTE. Cut to the sealed watch: the backup relay fires at the critical moment. Victory. Text overlay: "the game knew I was done before I did."
