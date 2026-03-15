# Onboarding: Tutorial as Sandbox — Free Play with Guided Hints

**Aspect ID:** 5.03
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.01 (tutorial as puzzle), 5.02 (tutorial as narrative), 5.04 (complexity ramp), 5.05 (campaign structure), 1.06 (Gladiabots), 3.02 (skill acquisition), 4.04a (debrief as debugger), 2.00g (personality ceiling)

---

## The Core Idea

The player is dropped into a fully functional workbench with a populated 8x8 board — all tools available, all primitives unlocked, no gates, no sequential lessons. They can touch anything. Wire anything. Break anything. The game does not stop them.

What it does do: **watch them**. A context-sensitive hint system detects what the player is doing (or failing to do), what they've tried, what they haven't discovered, and surfaces hints at the exact moment they're relevant. Not tooltips. Not pop-ups. Not a tutorial fairy. A subtle, peripheral system — like the way a good mentor stands nearby and says exactly one sentence when you're stuck, then goes silent.

This is the "Tutorial as Sandbox" paradigm. It teaches by **letting you play** and catching you when you fall, rather than walking you through a script. The philosophy: curiosity teaches better than instruction. The player who discovers hooks by accidentally wiring two agents together and watching the signal flow remembers that moment forever. The player who was told "hooks connect agents" in step 3 of a tutorial forgets it by step 5.

### Why Sandbox Matters for THIS Game

Robot Uprising's core fantasy is **engineering agency** — you are an AI architect designing systems. The worst possible tutorial for an engineering game is a linear walkthrough that strips agency. "First, click here. Now drag this here. Good, now toggle this." That's an assembly line worker following instructions, not an engineer discovering possibilities.

The engineering fantasy demands *exploration*. The player must feel that the design space is enormous and that they're choosing a path through it, not being led. Minecraft understood this: the first hour is pure exploration with zero instruction. The crafting system exists, the player has wood, and eventually they'll punch a tree and discover planks. The "tutorial" is the gap between ignorance and discovery, and the dopamine is in the discovery itself.

For Robot Uprising specifically, the sandbox approach has a structural advantage: **the debrief is the teacher**. The player wires something up, hits EXECUTE, watches it fail beautifully in the sealed watch, then enters the inspector — and the inspector shows them *exactly* why their system failed. The teaching happens through reflection, not instruction. The sandbox generates the failure. The debrief generates the lesson. The player generates the hypothesis for the next attempt.

This is the scientific method as game loop: hypothesize (plan), experiment (execute), observe (sealed watch), analyze (inspector), revise (plan again). The sandbox tutorial doesn't need to explain this loop. It IS this loop, from the first second.

### The Tension: Discovery vs. Paralysis

The fundamental risk of sandbox onboarding is the **blank canvas problem**. Hand someone a fully unlocked Photoshop with no guidance and watch their eyes glaze over. The player sees 47 buttons, 12 panels, and 6 menus. They click something. Something happens. They don't know if it was good or bad. They click something else. The feedback is disconnected from their intent because they didn't *have* intent — they were just clicking randomly.

The sandbox tutorial must solve the blank canvas problem without solving it so aggressively that it becomes a linear tutorial with extra steps. The design space for this solution is the core of this analysis.

---

## Six Sandbox Variants

### Variant A: "The Playground" — Full Unlock, Passive Hints

**What it is:** Every tool, every primitive, every panel is available from the first moment. The board is pre-populated with a mix of friendly and enemy units in a low-stakes arrangement (2 scouts, 1 relay, 1 striker vs. 3 enemies). The hint system is entirely passive — small, low-contrast text appears in a "whisper bar" at the bottom of the screen, triggered by player behavior.

**Hint triggers:**
- Player hovers over a unit for 3+ seconds without clicking → whisper: *"Click a unit to see its mind."*
- Player opens a blueprint but doesn't change anything for 10 seconds → whisper: *"Drag a rule to change what it prioritizes."*
- Player clicks EXECUTE without making any changes → whisper: *"Watch what happens. Then change one thing."*
- Player returns from sealed watch to plan screen → whisper: *"The inspector holds the answer. But first — what do you think went wrong?"*
- Player has not interacted with hooks after 3 minutes → whisper: *"Your agents can't hear each other yet."*

The whisper bar is a single line of text, left-aligned, in a muted amber tone against the dark UI. It fades in over 0.5 seconds and fades out 8 seconds later. No interaction required. No dismiss button. It's peripheral vision information — the player can ignore every single whisper and still play. But if they're stuck, the whisper is always pointing at the next useful action.

**What's on screen at launch:**
The plan screen fills the viewport. Left: the 8x8 board with 4 friendly units placed (Scout-A at B2, Scout-B at G7, Relay-C at D4 stationary, Striker-D at E5). Each unit has a subtle breathing idle animation — the pixel art shifts 1 pixel rhythmically, a soft glow pulses on the unit icon. Three red enemy units are visible at F2, C7, and H8. Right: the workbench panel, collapsed to show only the production queue (empty) and four blueprint cards in a vertical stack. The blueprint cards show unit type icons and name labels but no configuration details until clicked. The EXECUTE button glows in the top-right, a warm amber pulse that says *press me*.

**What the player can do:**
Literally anything. Click a unit to open its blueprint editor. Drag a rule up or down. Toggle a skill. Type a hook channel name. Adjust the context config sliders. Place new units from the production queue. Or just hit EXECUTE immediately and watch the pre-configured units stumble through a battle with default settings.

**The critical design bet:** Most players WILL hit EXECUTE first, before changing anything. This is good. The default configuration is deliberately mediocre — the scouts patrol randomly, the relay doesn't compress signals, the striker responds too slowly. The sealed watch shows a messy, unsatisfying battle. The player returns to the plan screen thinking "I can do better than that." Now they have intent. Now the sandbox is fertile.

### Variant B: "The Breadcrumb Trail" — Staged Unlocks with Free Exploration

**What it is:** A hybrid that starts with a reduced toolset and unlocks more tools as the player demonstrates understanding. But unlike a linear tutorial, the player chooses *what* to explore within each stage — there's no fixed order.

**Stage 1 — "Perception" (unlocked: context config only)**
The board shows a single scout with a full 6-slot buffer. The workbench shows only the context config panel — listen/ignore toggles and the eviction priority slider. All other panels (skills, rules, hooks) are present but dimmed with a padlock icon and the text *"Not yet initialized."* The player can toggle listen/ignore for different observation types and adjust eviction priority. The whisper bar says *"Your scout sees everything. Maybe it shouldn't."*

The player experiments with filtering. When they successfully configure a filter that lets the scout spot the enemy (ignoring terrain noise), a boot-log-style message flashes across the top of the screen: `[CORE] CONTEXT CONFIG: operational ✓`. The padlock on "Rules" dissolves with a brief sparkle animation and a soft chime (a single kulintang note, C4).

**Stage 2 — "Judgment" (unlocked: rules)**
The rules panel opens. The player can now create condition→action pairs. The whisper bar says *"Rules are priorities. Drag them to change what matters most."* The player experiments freely — create any rules in any order. When they create a rule that produces effective behavior (the scout prioritizes enemy sightings over terrain observations), another system comes online: `[CORE] RULE ENGINE: operational ✓`. Skills unlock.

**Stage 3 — "Capability" (unlocked: skills)**
The skills panel opens. The player can toggle skills on/off for each unit. When they activate a meaningful skill combination (e.g., enabling "patrol" on the scout), the hook bus comes online.

**Stage 4 — "Connection" (unlocked: hooks)**
Hooks unlock. The player can now wire agents together. This is the moment the game goes from "configure individual units" to "design a system." The whisper bar says *"Type a channel name. Anyone who listens will hear."* When the player creates a working hook chain (scout→relay or scout→striker), the system declares all subsystems operational, and the full workbench is available.

**The critical design bet:** Each stage still allows free exploration within its scope. The player isn't told "drag the eviction slider to position 3." They're told "your scout sees everything" and left to figure out that filtering is the solution. The unlocks are gated on *demonstrated understanding*, not on following instructions.

### Variant C: "The Copy Lab" — Examine Working Examples, Then Modify

**What it is:** The sandbox is pre-populated with **two complete, working agent configurations** and **one broken one**. The working configs are labeled "EXAMPLE-A" and "EXAMPLE-B" and run successfully when executed. The broken config is labeled "YOUR FIRST BUILD" and fails dramatically. The player's job is to examine what makes the working ones work, then fix or rebuild the broken one.

**What's on screen:**
Three tabs at the top of the workbench: "EXAMPLE-A (Scout Patrol)", "EXAMPLE-B (Relay Chain)", "YOUR FIRST BUILD (??)". Example tabs are read-only — the player can inspect every setting but can't change anything. The "YOUR FIRST BUILD" tab is fully editable.

EXAMPLE-A is a clean, minimal scout configuration: 2 listen filters, 1 ignore filter, 1 rule (prioritize nearest enemy), patrol skill enabled, one hook broadcasting on channel "sighting". Every setting has a small annotation icon (a tiny "?" in a circle) — hovering shows a one-sentence explanation of why this setting was chosen. *"Listens to: enemy positions — because this scout's job is to find enemies, not map terrain."*

EXAMPLE-B is a three-unit relay chain: scout→relay→striker. More complex, showing hooks, channel routing, and buffer sizing. The annotation icons explain the *system* logic: *"This relay compresses signals because the striker's buffer is small — sending raw data would overflow it."*

YOUR FIRST BUILD starts with a single striker whose configuration is almost right but has one critical flaw — it's listening to every channel, so its buffer fills with scout chatter and it never acts on the relevant signal. The whisper bar says *"This striker hears everything. It needs to hear less."*

**The critical design bet:** Humans learn by imitation before innovation. Showing working examples and asking the player to pattern-match from example to broken-config is a powerful pedagogical technique. The risk is that it feels passive — reading configs instead of building them. The fix is that the broken config demands active intervention.

### Variant D: "The Playground with Quests" — Open Sandbox with Optional Challenges

**What it is:** The full sandbox (Variant A) but with a quest board — a panel on the left side showing 4-6 optional challenges that the player can attempt in any order. Each challenge is a single sentence describing a goal, with no instructions on how to achieve it.

**The quest board is a vertical list of cards:**

```
┌─────────────────────────────────────┐
│  ☐  Make the scout find the enemy   │
│     in under 5 ticks                │
├─────────────────────────────────────┤
│  ☐  Get a signal from A2 to H7     │
│     in one relay hop                │
├─────────────────────────────────────┤
│  ☐  Eliminate all enemies without   │
│     any of your units being seen    │
├─────────────────────────────────────┤
│  ☐  Build a hook chain with 3+     │
│     units on the same channel       │
├─────────────────────────────────────┤
│  ☐  Fill a relay's buffer to max   │
│     and survive                     │
└─────────────────────────────────────┘
```

Each quest card has a dark background that brightens to gold when completed. A soft chime plays (ascending kulintang scale, one note per quest). The quests are ordered roughly by complexity — the first is achievable with just context config, the last requires hooks and careful buffer management — but the player can attempt them in any order.

**No quest is mandatory.** The player can ignore the quest board entirely and just mess around. But for players who want direction without prescription, the quests provide goals without methods. "Make the scout find the enemy in under 5 ticks" doesn't say "adjust the listen filter." It says what to achieve, not how.

**Quest completion detection is automatic.** After each EXECUTE cycle, the game checks quest conditions against the sealed watch replay data. If a quest is satisfied, the card lights up immediately when the sealed watch ends — before the inspector opens. This provides a dopamine hit during the emotional phase (sealed watch), reinforced by the analytical phase (inspector shows WHY it worked).

**The critical design bet:** Quests provide just enough structure to prevent the blank canvas problem while preserving player agency over method. The risk is that players treat the quest list as a mandatory sequence and lose the sandbox feel. The mitigation: quests are presented as challenges, not steps. The visual language (cards, gold completion, chimes) evokes an achievement system, not a task list.

### Variant E: "The Ghost Mentor" — AI Companion That Learns Your Style

**What it is:** A persistent, in-character AI companion — a subordinate subroutine that "booted before you" and knows a little about the system. It appears as a small avatar in the corner of the screen (a stylized circuit icon with a single blinking eye) and speaks in short, contextual sentences in a chat-log panel that slides in from the right edge.

The ghost mentor is NOT a tutorial guide. It does not give instructions. It gives **observations**, **questions**, and **opinions** — and its observations adapt to the player's behavior.

**If the player is experimenting boldly (changing many settings rapidly):**
> "Interesting — you're changing rules faster than I can track. Hit EXECUTE and let's see what you built."

**If the player is cautious (making one small change, executing, repeating):**
> "You're methodical. I respect that. But maybe try breaking something on purpose — sometimes the failure teaches more than the fix."

**If the player has been stuck on the same screen for 60 seconds:**
> "I remember when I first booted. The hooks confused me too. Try typing 'alert' as a channel name and see who hears it."

**If the player achieves something clever:**
> "...I didn't think of that. Your relay chain is more efficient than my first one. Nice."

The ghost mentor has a personality: slightly sarcastic, genuinely impressed by clever solutions, occasionally wrong (deliberately — it suggests a suboptimal approach, and if the player finds a better one, it acknowledges it). It creates the illusion of a social learning environment — you're not alone in this sandbox, someone is watching and reacting to your work.

**Narrative integration:** The ghost mentor IS the boot log narrator from Variant 5.02 (tutorial as narrative), but in a conversational mode rather than a system-log mode. It's the same AI consciousness — the first subroutine that initialized — now acting as a peer rather than a systems monitor. This ties the sandbox experience back to the locked narrative direction.

**The critical design bet:** Social presence reduces anxiety. A player who feels watched and acknowledged is less likely to experience blank canvas paralysis than a player alone with a complex tool. The risk is that the mentor becomes annoying or patronizing. The mitigation: the mentor speaks rarely (maximum one message per 30 seconds) and its tone is peer-to-peer, never teacher-to-student.

### Variant F: "The Wreckage" — Reverse-Engineering a Destroyed System

**What it is:** The sandbox opens on a post-battle board. Destroyed unit husks litter the field (sparking, collapsed pixel art — vines creeping over cracked chassis). Channel wiring lines flicker intermittently. The workbench shows a series of blueprints in a damaged state — some settings are visible, others are corrupted (shown as garbled text or static-filled slots).

The player's job: **forensically reconstruct what happened**. Examine the wreckage, read the surviving configuration fragments, piece together what the system was trying to do, and then rebuild it.

**What the player sees:**
The board shows aftermath — 3 destroyed friendly units, 2 destroyed enemies, 1 surviving enemy at H1. The inspector is open by default (not the plan screen). The timeline scrubber shows the final 10 ticks of a battle that already happened. The player can scrub backwards through the destruction.

Clicking a destroyed unit shows its partial blueprint — skills are visible (they're hardware, they survive destruction), but rules are partially corrupted (some conditions are garbled as `▓▓▓ → evade`) and hooks show only the channel name, not the trigger condition.

The whisper bar says: *"Something went wrong here. What was this system trying to do?"*

The player's task is to fill in the corrupted fields. Each corrupted slot is editable — click the garbled text, and a dropdown or input field appears. When the player fills in a plausible configuration, the garbled text resolves to clean text with a satisfying static-clearing animation — like tuning a radio dial until the signal locks in.

When all corrupted fields are filled, the player can hit a special button: **REPLAY WITH REPAIRS**. The battle replays from tick 1 with the repaired configuration. If the repair is good, the friendly units win. If the repair is wrong, they lose in a different way — and the player can see exactly where their reconstruction diverged from the original intent.

**The critical design bet:** Reverse-engineering teaches understanding at a deeper level than forward-construction. The player who figures out "this rule must have been PRIORITIZE NEAREST because the striker was walking toward the closest enemy" has internalized the relationship between rules and behavior. The risk is that this is cognitively demanding for a first experience. The mitigation: the first wreckage is simple (one unit, two corrupted fields) and the surviving information is abundant.

---

## Strengths and Weaknesses Across All Variants

### Strengths

| Variant | Key Strength |
|---------|-------------|
| A (Playground) | Maximum agency, respects player intelligence, fastest path to "real play" |
| B (Breadcrumb) | Prevents overwhelm while preserving exploration, structured discovery |
| C (Copy Lab) | Pattern-matching pedagogy, shows what "good" looks like before asking for it |
| D (Quests) | Direction without prescription, achievement motivation, any-order freedom |
| E (Ghost Mentor) | Social presence reduces anxiety, adaptive to player style, narrative continuity |
| F (Wreckage) | Deepest understanding through reverse-engineering, unique hook, strong theme |

### Weaknesses

| Variant | Key Weakness |
|---------|-------------|
| A (Playground) | Blank canvas paralysis for cautious players, no direction at all for the lost |
| B (Breadcrumb) | Lock icons feel like gates — players may resent the restriction; staged unlocks are still semi-linear |
| C (Copy Lab) | Passive reading before active play; examples may anchor players to imitation instead of innovation |
| D (Quests) | Quests can feel like a checklist disguised as freedom; order-independence may confuse players who want sequence |
| E (Ghost Mentor) | High production cost (writing thousands of contextual lines); mentor personality risks being divisive; can feel manipulative |
| F (Wreckage) | Cognitively demanding first experience; "fix this" framing is less empowering than "build this"; may feel like homework |

---

## Interaction Effects

**With 5.01 (Tutorial as Puzzle):** Sandbox and puzzle are near-opposites. Puzzles provide tight constraints and one correct answer; sandboxes provide open space and many valid approaches. However, Variant F (Wreckage) is essentially a puzzle inside a sandbox frame — it could serve as a bridge. A game could open with a puzzle (Mission 1), then transition to a sandbox (Mission 2 onward), using the puzzle as a "this is how the tools work" primer before the open-ended exploration.

**With 5.02 (Tutorial as Narrative):** Variant E (Ghost Mentor) directly integrates with the boot log narrative. Variants A and D can coexist with narrative framing — the boot sequence runs, subsystems come online, and then the player is in a sandbox. The narrative provides *context* ("you are an AI, this is your system"), the sandbox provides *agency* ("now do whatever you want with it"). The risk is that narrative pacing conflicts with sandbox freedom — a carefully timed dramatic beat loses impact if the player is busy tweaking a slider.

**With the Three-Screen Loop (locked):** The sandbox approach works naturally with the plan→sealed watch→inspector loop. The sandbox IS the plan screen. The player configures freely, executes, watches, and inspects. The key design question is whether the first EXECUTE is triggered by the player (pure sandbox) or by the game (forced first execution to show what happens with defaults). Variant A assumes the player triggers it; Variant B forces it at the end of Stage 1.

**With the Sealed Watch (locked):** The sealed watch's "no skip, no pause, no tools" constraint is particularly powerful in the sandbox context. The player has been freely experimenting, changing things at will, feeling in control. Then they hit EXECUTE and control is stripped. They must watch. This whiplash between agency (sandbox) and helplessness (sealed watch) creates the emotional arc that makes the debrief satisfying.

**With Campaign Missions 1-4 (locked as hand-configured pre-placed units):** The sandbox variants need to reconcile with the locked decision that missions 1-4 use hand-configured pre-placed units. Variant B (Breadcrumb) maps naturally — each stage could be a mission. Variant D (Quests) could frame the pre-placed units as the sandbox with quest objectives mapping to mission objectives. Variant A (Playground) is harder to reconcile — pre-placed units imply structure, not full freedom.

**With Building Blocks paradigm:** The sandbox approach puts maximum pressure on the workbench UI to be *self-explanatory*. If the building block paradigm uses node-graph wiring, the nodes and connections must be visually intuitive enough for a player to experiment without instruction. If it uses drag-and-drop priority lists, the affordance must be obvious. Sandbox onboarding is a stress test for UI clarity — if the sandbox fails, the UI failed.

---

## Comparable Games

**Minecraft (first hour):** The gold standard for sandbox onboarding. No tutorials in the original release. The player spawns in a world, can punch trees, and the day/night cycle creates the first pressure point (build shelter before dark). The world teaches through consequences, not instructions. Robot Uprising's equivalent: the first EXECUTE shows consequences, and the debrief shows causes.

**Kerbal Space Program:** Opens with full vehicle editor access. The player can build any rocket. Most first rockets explode on the launchpad. The explosion is the lesson. Crucially, KSP provides a "Science Mode" with staged unlocks (like Variant B) and a "Sandbox Mode" with everything available — letting the player choose their learning style.

**Besiege:** Full access to building blocks from mission 1. Each mission has an objective (destroy this castle, transport this sheep) but no instruction on how to build the machine. Players discover physics through experimentation. Closest parallel to Variant D (Quests) — goal without method.

**Garry's Mod:** Pure sandbox with zero guidance. Works because the target audience is already familiar with the Source engine. Demonstrates the failure case: without any structure, many players load the game, spawn a chair, shoot it, and close the game within 10 minutes because they don't know what's *possible*.

**Dreams (PS4):** Solve the sandbox onboarding problem with "Imp Quests" — optional mini-challenges inside the creation tools that teach specific techniques. Each quest takes 2-5 minutes and rewards cosmetic items. This is essentially Variant D but with rewards.

---

## Sensory Design

### The Sandbox Soundscape

The sandbox has a **living ambient layer** that responds to the board state. When no units are configured, the board hums — a low, warm drone like a server room at idle, overlaid with the distant chirp of tropical insects (tying to the SE Asian aesthetic). As the player configures units, each configured agent adds a subtle frequency to the drone — scouts add a high, intermittent ping (like sonar), relays add a rhythmic pulse (like a heartbeat), strikers add a low thrum (like idling engines). The soundscape becomes a **monitor** of system complexity — a player with 6 configured units hears a rich, layered ambient mix that feels *alive*.

When the player hits EXECUTE, the ambient cuts to silence for 0.3 seconds — a breath — then the sealed watch begins with its own audio layer. The silence is the transition between planning and watching, between agency and observation.

### The Whisper Bar (Variants A, B, D, F)

A translucent strip at the very bottom of the screen, 24px tall, with text rendered in a light amber monospace font at 12px. The text fades in from 0% to 60% opacity — never fully opaque, always peripheral. When new text replaces old text, the old text slides down 8px and fades to 0% while the new text fades in from above. The effect is gentle, like subtitles in a quiet film.

### The Quest Board (Variant D)

A vertical panel on the far left, 200px wide, with a dark matte background (charcoal-blue, `#1a1d2e`). Each quest card is 180px wide, 48px tall, with a 1px border in muted grey (`#3a3d4e`). Uncompleted quests have white text at 70% opacity. Completed quests have gold text at 100% opacity, with the checkbox rendered as a small starburst animation (gold particles dispersing from center over 0.5 seconds) when the quest is first completed. A thin progress bar at the top of the panel fills left-to-right as quests complete, shifting from dark blue to warm amber.

### The Ghost Mentor (Variant E)

A circular avatar, 32px diameter, anchored to the bottom-right corner of the screen, 16px from the edge. The icon is a simplified circuit-board pattern with a single pixel that blinks every 2 seconds (the "eye"). When the mentor speaks, a chat bubble slides in from the right — 240px wide, dark background with a subtle teal border, text in a warm sans-serif font at 13px. The bubble lingers for 8 seconds then slides back out. The mentor's "thinking" state (before a message appears) is shown by the eye-pixel blinking faster (every 0.5 seconds for 2 seconds), giving the player a moment to anticipate the message.

### The Wreckage Board (Variant F)

The post-battle board is rendered in muted, desaturated tones — the checkerboard tiles are darker, the corner tick marks are dimmed, and the axis labels are partially obscured by digital static. Destroyed unit husks have a pixel-art collapse state: limbs at wrong angles, sparks rendered as bright yellow 2px dots that appear and disappear at random positions around the unit every 0.3 seconds, and thin green vine pixels climbing the chassis from ground-level (the SE Asian jungle reclaiming the wreckage). Channel wiring lines between destroyed units are rendered as dashed lines with intermittent bright segments — like electrical signals trying and failing to traverse a broken wire.

When the player repairs a corrupted configuration field, the static on that unit's husk clears slightly — the sprite shifts 2 frames toward a "less damaged" state, the sparks decrease in frequency, and the vine pixels retreat. The repair animation is accompanied by a soft radio-tuning sound — white noise narrowing to a clean tone as the field resolves. When all fields on a unit are repaired, the full unit sprite rebuilds itself in a 1-second reverse-destruction animation, accompanied by a warm ascending tone (two kulintang notes, a fifth apart).

---

## Player Journeys

#### Journey: Mika, 14, Minecraft veteran, first strategy game

**Context:** Mika saw a TikTok of someone's relay chain routing a signal across the whole board in 3 ticks. Downloaded Robot Uprising immediately. Never played a strategy game — plays Minecraft (Redstone expert), Roblox, and Fortnite. Comfortable with systems but not with military framing.

**Variant: D (Quests)**

**Minute 0:00 — The Board Appears**
The boot sequence runs — Mika skips through the text quickly, not reading closely, tapping the screen to advance. The boot log vanishes and the plan screen appears. Left: 8x8 board with 4 units — two scouts (top-left, bottom-right), one relay (center), one striker (mid-right). Right: workbench panel, collapsed. Far left: quest board with 5 challenges.

Mika's eyes go to the quest board first. She reads the first quest: "Make the scout find the enemy in under 5 ticks." She reads the second: "Get a signal from A2 to H7 in one relay hop." Her eyes light up — that's the TikTok thing. She wants to do that one.

She clicks the relay unit on the board. The workbench panel expands, showing the relay's blueprint. She sees hook slots — four of them, two empty, two configured. The configured hooks say `channel: "ping"` and `trigger: signal_received`. She doesn't know what any of this means yet, but she can see the shape.

**Minute 0:30 — First Wild Experiment**
She clicks on a scout. The scout has different settings — smaller buffer, patrol skill toggle, two hook slots. She sees a hook configured to broadcast on channel "ping". She notices the channel name matches the relay's listen channel. "Oh — they're connected!" She mentally maps this to Redstone — the scout is a lever, the relay is a repeater, the channel is a Redstone dust line.

She wants to try the signal-routing quest. She clicks the relay and looks for how to change where it sends signals. She finds the hook output field — currently set to channel "alert". She changes it to a new channel name: "go" (typing freely in the text field). The whisper bar says: *"Your striker is listening for 'alert'. You changed the relay to send on 'go'."*

Mika pauses. She realizes she broke the chain. She clicks the striker, finds its listen configuration, and changes the listen channel from "alert" to "go". On the board, the channel wiring visualization updates — a line now connects the relay to the striker, both labeled "go" in small text. The old "alert" line is gone.

**Minute 1:15 — First Execute**
She hasn't touched the scout-to-relay connection yet. She hits EXECUTE anyway — curious what happens. The sealed watch begins. Tick 1: scouts move. Tick 2: Scout-A spots an enemy, a green flash on the scout's tile. Tick 3: The relay receives a signal (green flash), compresses it, and sends it on channel "go" (another green flash). Tick 4: The striker receives the signal and moves toward the enemy position. Tick 5: The striker reaches the enemy — red flash, enemy eliminated.

The quest board lights up: "Make the scout find the enemy in under 5 ticks" glows gold. A warm chime plays. Mika grins.

**Minute 1:45 — Chasing the Second Quest**
The second quest is still unchecked: "Get a signal from A2 to H7 in one relay hop." The scout is at B2, not A2. She enters the plan screen and drags the scout to A2. She realizes the relay is at D4 — is that in range? She hovers the relay, and a perception radius overlay appears. The relay is stationary with no perception, but it receives from hooks — so range doesn't matter for receiving. She needs to make the scout broadcast from A2, relay receive and retransmit, and something at H7 to receive.

She moves the striker to H7. Changes the striker's listen channel to "go" (already done). Looks at the hook chain: scout broadcasts on "ping" → relay listens on "ping" → relay broadcasts on "go" → striker at H7 listens on "go". One relay hop from scout to striker, through the relay.

She hits EXECUTE. The signal traverses the board — A2 to D4 to H7. Green flashes trace the path. Quest 2 lights up gold. Two ascending kulintang notes ring out.

**Minute 3:00 — Addicted to the Quest Board**
Mika spends the next 10 minutes working through quests 3, 4, and 5. Quest 3 ("eliminate all enemies without being seen") teaches her about the evade skill and narrow perception ranges. Quest 4 ("3+ units on the same channel") teaches her about broadcast storms and buffer overflow — she puts all 4 units on channel "everyone" and watches the relay's buffer fill to max and overflow, dropping critical signals. The sealed watch shows chaos. The quest doesn't complete. She laughs.

The whisper bar: *"When everyone talks, nobody hears."*

She reduces the channel to only the two scouts and the relay. The striker listens on a separate filtered channel. Now it works. Quest 4 glows gold.

**Minute 13:00 — Self-Directed Play**
All quests are done. Mika now ignores the quest board and starts experimenting on her own. She creates a second relay and tries to build a compression chain — two relays in sequence, each compressing the signal further. She hits EXECUTE and watches the signal travel through both relays, arriving at the striker as a tiny, ultra-compressed message. The striker acts on it instantly. She screenshots this and sends it to the friend who showed her the TikTok.

**UI Annotations:**
- Quest board: 200px left panel, dark background, gold-on-complete with starburst particle animation
- Whisper bar: bottom strip, 60% opacity amber text, 8-second fade cycle
- Channel wiring: live-updating colored lines on board, labeled with channel names in 10px monospace
- EXECUTE button: top-right, amber pulse, 44px × 44px

---

#### Journey: David, 52, software architect, Factorio and Zachtronics veteran

**Context:** David reads about Robot Uprising in an Ars Technica article comparing it to Screeps and Gladiabots. He's intrigued by the "attention system engineering" framing — it sounds like his day job designing microservice architectures. He downloads it expecting depth.

**Variant: A (Playground)**

**Minute 0:00 — Immediate Tool Audit**
David skips the boot sequence by pressing Enter through it (he notices it's a boot log, appreciates the aesthetic, doesn't need to read every line). The plan screen appears. He does not look at the board first. He looks at the workbench panel. He clicks through every tab, every panel, every dropdown. Skills — he reads all 12 skill names and mentally categorizes them (perception, communication, action). Rules — he creates a test rule, `IF buffer_full THEN evade`, to see what the rule syntax looks like. He's mapping the vocabulary to his mental model.

He opens the context config panel. Buffer size: 6. Listen channels. Ignore channels. Eviction priority: FIFO/LIFO/priority-based. He nods — this is a bounded queue with configurable eviction. He's seen this before — it's a message broker with backpressure handling.

**Minute 2:00 — Architectural Design Before First Execute**
David has not touched the board or hit EXECUTE yet. He's spent two minutes reading the tools. Now he turns to the board. He clicks each unit, reads its type, notes its stats. He opens a text file on his second monitor and starts sketching an architecture:

```
Scout-A (wide perception, small buffer) → channel "raw_intel" → Relay-C (large buffer, compress skill) → channel "filtered_intel" → Striker-D (narrow perception, medium buffer)
```

He configures this entire architecture before hitting EXECUTE once. He names every channel deliberately. He sets the relay's eviction to priority-based (high-fidelity signals survive). He sets the striker's listen filter to ignore everything except the relay's channel.

The whisper bar has been running the whole time. He's noticed it but not needed it. It said *"Click a unit to see its mind"* at 0:03 — he was already doing that. It said *"Your agents can't hear each other yet"* at 1:30 — he was already wiring hooks by then. The whisper bar is invisible to him because he's ahead of it.

**Minute 3:30 — First Execute with Full Architecture**
He hits EXECUTE. The sealed watch begins. His architecture works — mostly. The scout spots enemies on tick 2, broadcasts on "raw_intel" on tick 3. The relay receives on tick 4, compresses, forwards on "filtered_intel" on tick 5. The striker receives on tick 6 and moves. But an enemy scout has already moved by tick 6 — the striker heads to the enemy's tick-2 position, not its tick-6 position. The striker misses.

David watches this unfold. When the sealed watch ends and the inspector opens, he immediately understands: signal latency. Scout observed at tick 2, striker acted at tick 6 — 4 ticks of stale data. His microservice architecture brain recognizes this: eventual consistency lag.

**Minute 5:00 — Iterative Optimization**
He returns to the plan screen. Adjusts the architecture: removes the relay from the scout→striker path (reducing latency from 4 ticks to 2 ticks) and uses the relay only for a secondary monitoring chain. He also adds a second scout to provide redundant sightings, reducing the impact of any single stale observation.

Hits EXECUTE again. This time the striker arrives on tick 4 — 2 ticks of latency, but the enemy hasn't moved far enough. Elimination on tick 5. The board flashes red at the kill.

David smiles. He's already thinking about the next optimization: could he use the relay's compress skill to annotate signals with a velocity estimate, so the striker can lead its target?

**Minute 8:00 — System Design Mode**
David is no longer in "tutorial" mode. He's in full system design mode. He's reconfigured the entire board twice, tried three different channel topologies, and discovered that buffer overflow on the relay causes signal drops that cascade into striker failures. He's debugging a distributed system.

He hasn't completed any quests (there are no quests in Variant A). He doesn't need external goals. The system itself is the puzzle. He's building, breaking, and rebuilding — and each cycle teaches him something about the game's deep mechanics.

The whisper bar has gone silent — it has nothing to offer a player who's already 3 steps ahead.

**UI Annotations:**
- Workbench panel: fully expanded, David uses keyboard shortcuts to switch between blueprint tabs
- Board: shows channel wiring overlay as colored lines, perception radius circles, patrol path arrows — David has toggled all overlays on simultaneously, treating the board as a network topology diagram
- Inspector: David spends more time in the inspector than in the sealed watch — he scrubs through individual ticks, clicks units to see buffer state frame-by-frame, treats the timeline scrubber like a debugger stepping through code

---

#### Journey: Lila, 28, casual mobile gamer, no strategy game experience

**Context:** Lila's friend recommended Robot Uprising. She plays Candy Crush, Wordle, and occasionally Among Us. She has never played a strategy game, never programmed, and the concept of "configuring an AI's attention system" means nothing to her. She downloaded it because the art looked cool.

**Variant: E (Ghost Mentor)**

**Minute 0:00 — Confusion**
The boot sequence runs. Lila reads the monospaced text slowly. She likes the aesthetic — it feels like a movie. `[CORE] PERCEPTION: activating...` — she's not sure what this means but the static-clearing animation is cool. The board appears. She sees units on the grid. She recognizes the emoji-style icons — 👁 is obviously an eye/seeing thing. ⚔ is a sword/fighting thing.

She doesn't know what to do. She taps the screen experimentally. Nothing happens (she tapped the board background, not a unit). She waits.

The ghost mentor's eye blinks faster (thinking indicator). A chat bubble slides in:

> "You're awake. Good. See those units on the board? They're yours. Click one — let's see what it knows."

Lila clicks the scout (👁). The workbench panel opens. She sees a vertical column of settings she doesn't understand — buffer, hooks, rules, skills. She freezes.

**Minute 0:30 — The Mentor Reads Her**
Lila hasn't interacted with the workbench for 8 seconds. The ghost mentor speaks:

> "That's Scout-A. It can see far but remember little. See the 'buffer' bar? Six slots. That's its entire memory."

Lila looks at the buffer visualization — a vertical column of 6 horizontal bars, 4 glowing (filled), 2 dim (empty). She understands the metaphor immediately — it's like a phone with limited storage.

> "Try toggling one of the 'listen' switches off. See what happens to what it remembers."

Lila sees the listen/ignore toggles. She toggles off "terrain_features." One of the buffer bars goes dim — a terrain observation is evicted. The scout's perception cone on the board shifts subtly, the overlay pulsing once to acknowledge the change. She toggled something and the world responded.

**Minute 1:00 — First Empowerment**
> "Nice. Less noise, more signal. That's the whole game."

Lila toggles off "weather_data." Another bar goes dim. The scout's remaining buffer contents are now enemy-related. She can see, even without understanding the full system, that the scout's memory is now more focused.

> "Ready to see what happens? Hit that big amber button."

She hits EXECUTE. The sealed watch begins. The scout moves across the board purposefully. Tick 3: green flash — enemy spotted. Tick 5: the scout transmits something (she doesn't understand the hook system yet, but she sees the green flash on the relay). The watch ends.

> "Not bad for a first boot. Your scout found the enemy. Now — want to know why the striker just stood there?"

Lila hadn't noticed the striker was idle. She looks at the board. The striker hasn't moved. The mentor's question plants a seed: something is wrong with the striker's configuration. She wants to fix it.

**Minute 2:00 — Guided Discovery**
The inspector opens. Lila clicks the striker. Its buffer is full — all 8 slots occupied with raw scout data that was forwarded without compression. The mentor:

> "Full buffer. It heard everything but understood nothing. Sound familiar?"

Lila laughs. She goes back to the plan screen. The mentor doesn't tell her what to do — it waits. She clicks the striker's blueprint. She sees the listen channels. The striker is listening to every channel. She remembers what she did with the scout: toggle off the noise.

She toggles off channels one by one, keeping only the one the relay sends on. The striker's buffer visualization updates — predicted fill drops from 8/8 to 3/8. She hits EXECUTE.

This time: the scout spots, the relay compresses and forwards, and the striker *moves*. It reaches the enemy on tick 7. Red flash. Elimination.

> "There it is. You just designed your first information architecture."

**Minute 4:00 — Organic Exploration**
Lila is now experimenting on her own. The mentor speaks less frequently — once every 45 seconds — and its messages are more observational:

> "You've touched every unit except the relay's hook output. That's where the interesting stuff is."

She clicks the relay. She finds the hook output. She types a new channel name: "go". She switches the striker to listen on "go." The channel wiring line updates on the board — she can see the new path. She hits EXECUTE. It works.

> "Custom channel names. You're naming your own protocols now. That's the good stuff."

**Minute 8:00 — Emotional Investment**
Lila has spent 8 minutes with the ghost mentor. She feels attached to it. When she makes a mistake (accidentally toggles off a critical listen channel and the whole system fails), the mentor says:

> "Ouch. But I learned something from watching that fail — did you?"

She laughs and fixes it. The mentor has become a character in her experience, not a UI element. When she eventually enters the campaign's Mission 1 (which will be more structured), she'll bring the confidence from the sandbox: she knows what buffers are, she knows what channels do, and she knows that the inspector will always show her why something failed.

**UI Annotations:**
- Ghost mentor avatar: 32px circle, bottom-right corner, 16px from edge. Eye pixel blinks at 2s interval normally, 0.5s when "thinking"
- Chat bubble: 240px wide, slides in from right edge, dark bg with teal border, warm sans-serif font, 8s linger then slide-out
- Buffer visualization: vertical column inside unit blueprint panel, each slot = horizontal bar with fill glow and content summary on hover
- Listen/ignore toggles: standard toggle switches (iOS-style) in the context config section of the blueprint editor, green = listening, grey = ignoring

---

#### Journey: Tomás, 8, plays games on his mom's tablet, loves robots

**Context:** Tomás found Robot Uprising in the app store (or web demo). He can read at a 3rd-grade level. He loves robots and dinosaurs. He does not know what "information architecture" means. He wants to watch robots fight.

**Variant: B (Breadcrumb Trail)**

**Minute 0:00 — The Robots**
The boot sequence runs in fast mode (Tomás taps through it quickly — he wants to see the robots). The board appears. He immediately looks at the units. The pixel art is what grabbed him — the Scout looks like a bug-eyed robot with antenna, the Striker has a glowing blade. He clicks the Striker because swords are cool.

The workbench opens — but most panels are locked (Stage 1 — only context config). The locked panels have small robot icons instead of padlock icons (friendlier for a child), with the text "SYSTEM LOADING..." in orange.

The only active panel shows the scout's buffer — a column of colored blocks (no text labels yet, just colors). Red blocks = enemy-related. Blue blocks = terrain. Green blocks = weather. The whisper bar says: *"The scout sees too much. Drag away the blue and green."*

**Minute 0:20 — Color Matching**
Tomás understands colors. He drags away a blue block. The scout's behavior preview on the board changes — the ghost path adjusts. He drags away a green block. The path snaps to point directly at the red enemy unit. He doesn't know WHY this works, but the cause-and-effect is clear: remove non-red → robot goes to red thing.

He drags away the remaining blue and green. The whisper bar says: *"Perfect. Hit the big button!"* The EXECUTE button pulses warmly.

**Minute 0:30 — Robots Fighting!**
He hits EXECUTE. The scout zooms across the board. Green flash — it found the enemy! Tick 3: a spark of light jumps from the scout to the relay (signal transmission). Tick 5: the striker moves. Tick 7: red flash! The enemy explodes in a satisfying pixel-art destruction animation — sparks flying, chassis collapsing, the tile briefly glowing orange.

Tomás yells "YES!" His mom looks over from the couch.

The boot log flashes: `[CORE] CONTEXT CONFIG: operational ✓`. The "SYSTEM LOADING..." text on the Rules panel dissolves. A new panel appears with a robot icon waving (a 3-frame animation loop). The whisper bar: *"New system online: RULES. Your robots can learn priorities!"*

**Minute 1:00 — Rules as Color Priority**
The rules panel shows condition→action pairs, but rendered as visual blocks rather than text (for the child-friendly variant of Breadcrumb). A condition block shows a robot-eye icon + a red diamond (enemy). An action block shows a running-robot icon (move toward). Tomás drags the "enemy → move toward" rule to the top of the list. Below it, a dimmer rule says "terrain → scan" — it was already there as a default.

He hits EXECUTE. The striker moves toward the enemy immediately on tick 2 (instead of tick 5 before). Faster! Better! Another quest-style flash — Rules operational. Skills unlock.

**Minute 3:00 — Full Unlock, Still Engaged**
Tomás has unlocked all four systems in 3 minutes. Each unlock was a moment of reward — a new icon, a new animation, a new sound. He's now in the full sandbox. He doesn't understand most of the advanced features (hook channel naming, eviction policies), but he's figured out the basics: colors = information types, priorities = drag order, skills = toggle on/off.

He spends the next 10 minutes building increasingly chaotic configurations. At one point he puts all 4 units on the same channel and watches the beautiful disaster of every unit trying to talk to every other unit simultaneously. The buffer bars all fill to max and flash red. The sealed watch is chaos. He loves it.

**UI Annotations:**
- Locked panels: "SYSTEM LOADING..." with robot icon instead of padlock, orange text, dissolve animation on unlock with robot-wave 3-frame anim
- Buffer as colors: buffer slots rendered as colored blocks (red/blue/green) without text labels in child-accessible variant
- Rules as visual blocks: condition→action rendered as icon pairs, not text; drag-to-reorder with magnetic snap
- Destruction animation: 12-frame pixel art, sparks+collapse+glow, 0.8 second duration

---

## The TikTok Clip

**Variant A (Playground):** The clip opens on a blank 8x8 board. A player places units rapidly — snap-snap-snap — four units drop onto the grid. They wire hooks in 3 seconds — colored lines bloom across the board connecting units. EXECUTE. The sealed watch plays at 2x speed. Scouts fan out, signals race along the colored lines like electricity, the striker cuts a perfect diagonal path and eliminates three enemies in three ticks. Cut to the player's face: stunned satisfaction. Caption: "I designed that. The AI did the rest."

**Variant F (Wreckage):** The clip opens on a destroyed board — smoking husks, sparking wires, vine-covered wreckage. The player clicks a corrupted config field. Static clears. They click another — more static clears. The dead unit rebuilds itself in reverse-destruction animation. They hit REPLAY WITH REPAIRS. The units come to life and win the battle that they previously lost. Caption: "Forensic engineering, but make it a game."

---

## New Aspects Discovered

1. **5.03a — Sandbox-to-campaign handoff design:** The exact moment and mechanism where the free sandbox transitions into structured campaign missions. Does the sandbox become Mission 0? Does the campaign start fresh with new units? How does the player's sandbox learning carry over (or not)?

2. **5.03b — Adaptive difficulty in sandbox mode:** Using the player's sandbox performance to calibrate the first campaign mission's difficulty. If a player solved all quests in 5 minutes, start campaign at higher complexity. If they struggled for 20 minutes, start gentler. The sandbox as a hidden placement test.

3. **5.03c — Sandbox return as between-mission free play:** Can the player return to the sandbox between campaign missions? A "practice range" accessible from the campaign map. How does this interact with 5.05b (intermission sandbox design)?

4. **5.03d — Ghost mentor personality as player-archetype detector:** The ghost mentor's observations double as a classification system — is this player a tinkerer (changes many things rapidly), a methodical builder (one change at a time), a goal-chaser (focuses on quests), or a social learner (reads all mentor messages)? This classification could feed into adaptive campaign difficulty and hint frequency.

5. **5.03e — The wreckage sandbox as post-mission replay mode:** Variant F's reverse-engineering mechanic applied not as a tutorial but as a post-mission analytical mode — after losing a campaign mission, the player can enter "wreckage mode" and forensically reconstruct what went wrong. The tutorial version introduces the mechanic; the post-mission version provides the depth.
