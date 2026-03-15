# The Mission 5 Wall: Five Approaches to Factory Introduction Pacing

**Aspect ID:** 5.04a
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.04 (complexity ramp), 5.00a (vocabulary pacing), 5.01d (filter-to-blueprint bridge), 5.00 (external documentation anti-pattern), 3.02 (skill acquisition), 5.02 (tutorial as narrative), 1.17 (Into the Breach), 1.03 (Opus Magnum)

---

## The Problem

Mission 5 is the hardest transition in Robot Uprising's 10-mission campaign. For four missions, the player has been configuring **pre-placed** units — agents that already exist on the board, with their positions fixed by the mission designer. The player's job was *tuning*: adjusting context filters, writing rules, wiring hooks, and managing relay compression. The board was a given; the player shaped behavior.

Mission 5 shatters this. The player must now **create** units. Not just configure them — conjure them into existence through a production system. This requires understanding:

1. **Blueprints** — a saved configuration template that the factory can reproduce
2. **Production queue** — the ordered sequence of blueprints the factory will build
3. **Resources** — materials (lump sum per mission) and energy (per-tick drain per unit)
4. **Build cycle** — the factory produces one unit every N ticks
5. **Spawn position** — units appear at the factory, not where you want them

That's five interlocking concepts arriving simultaneously. The locked spec says Missions 1–4 use pre-placed units and Mission 5 introduces the factory. There is no Mission 4.5. The cliff is structural.

**Why this matters:** The factory is where Robot Uprising stops being a puzzle game and becomes an *engineering* game. Configuring pre-placed units is a constrained optimization problem (tune these 3 units to beat this scenario). Building an army from blueprints is an open-ended *design* problem (what should I build, in what order, with what budget). The cognitive mode shift — from **answering questions** to **asking questions** — is as significant as the mechanical shift.

Every approach below must solve three sub-problems:
- **Mechanical legibility:** The player understands what each UI element does
- **Strategic motivation:** The player understands *why* they're building an army, not just how
- **Emotional transition:** The player feels empowered, not overwhelmed, by the new power

---

## Approach 1: "The Pre-Teach" — Seed Factory Concepts Before Mission 5

### How It Works

Missions 3 and 4 introduce factory sub-concepts *in non-factory contexts*, so that by Mission 5, the player has encountered each idea individually. The factory merely assembles familiar pieces.

**Mission 3 plants the seed — Templates:**
After the player configures Scout-A's hooks for Mission 3 (Blind Spots), the debrief surfaces a new button: **"Save as Template."** A tooltip explains: "Save this configuration so you can apply it to other units." The player saves their scout config as "My Alert Scout." In the next attempt (if needed), the template appears in the workbench as a loadable preset. The player has now experienced the concept of a **reusable configuration** — the precursor to "blueprint."

**Mission 4 plants the second seed — Build Order Thinking:**
Mission 4 (Noisy Channel) pre-places 5 units but asks the player to decide **activation order** — which units come online first. A horizontal strip at the bottom of the Plan screen shows 5 unit icons in a row, draggable to reorder. A tooltip: "Units activate left to right. Early units act first but face enemies alone. Late units have support but less time." The player has now experienced a **sequential ordering UI** — the precursor to "production queue."

**Mission 5 — The Payoff:**
When Mission 5 introduces the factory, the player recognizes both pieces. "Oh — blueprints are like templates, but the factory builds them. The production queue is like the activation order, but for creation." The vocabulary mapping is explicit: the boot log prints `[>>] TEMPLATES → UPGRADED → BLUEPRINTS` and `[>>] ACTIVATION_ORDER → UPGRADED → PRODUCTION_QUEUE`. Resources and build cycle are the only truly new concepts.

### Sensory Description

**The template save moment (Mission 3 debrief):** After the player's first successful hook configuration, the Inspector screen shows a green "MISSION COMPLETE" banner. Below the unit's configuration summary, a new button pulses with a soft amber glow — a square icon containing a floppy disk silhouette (retro-futuristic, on-brand). The button label reads "SAVE AS TEMPLATE →". When clicked, a drawer slides out from the right: a text field for the template name (cursor blinking, placeholder text "Name this configuration..."), a miniature summary card showing the skills/rules/hooks in compact icon form, and a cyan "SAVE" button at the bottom. On save, the card animates — it shrinks, flips like a playing card, and slides into a new "TEMPLATES" section in the workbench with a satisfying magnetic snap sound. The template section didn't exist before this moment. It materializes from nothing, growing from a single pixel-wide line to its full panel width in 400ms, accompanied by a boot log whisper: `[OK] TEMPLATE_STORAGE: INITIALIZED`.

**The activation order strip (Mission 4):** The Plan screen gains a new horizontal element between the board and the workbench — a narrow conveyor-belt-styled strip showing 5 unit icons in draggable order. The strip has a subtle animation: tiny chevrons moving left-to-right beneath the icons, like a conveyor in motion. Each icon sits on a "platform" that lifts slightly when hovered (2px vertical shift, shadow deepens). Dragging an icon produces a smooth slide animation with the other icons compressing to make room — the same physics as iOS home screen icon reordering. A number label (1, 2, 3, 4, 5) updates in real-time as icons move. Below each icon, a thin bar shows the unit's estimated energy cost, creating a visual "budget preview" that foreshadows resource management.

**Mission 5 vocabulary upgrade:** The boot log text animates differently for the upgrade lines. Instead of the usual `[>>] SYSTEM: ONLINE` format, the upgrade lines use a morphing animation: the word "TEMPLATES" appears, then each letter dissolves and reforms as "BLUEPRINTS" over 1.5 seconds, left to right. The player watches the familiar word *become* the new word. Same for ACTIVATION_ORDER → PRODUCTION_QUEUE. The metaphor is literal: this isn't a new thing, it's an evolution of something you already know.

### Strengths

- **Lowest cognitive load at Mission 5.** Only 2 truly new concepts (resources, build cycle) instead of 5. The vocabulary upgrade framing makes blueprints and queue feel like depth-2 encounters, not depth-1.
- **Leverages existing learning.** The template save mechanic in Mission 3 is useful on its own (players can load saved configs on retry). It's not a throwaway tutorial hook — it has genuine utility.
- **The upgrade animation teaches transferable thinking.** In real engineering, new systems are often refinements of existing patterns. "A Kubernetes deployment is a template for pods" maps directly to "a blueprint is a template for units."
- **Respects the locked mission arc.** No new missions needed. Missions 3 and 4 gain small features that serve both their own mission goals and the Mission 5 pre-teach.

### Weaknesses

- **Adds complexity to Missions 3 and 4.** These missions already have their own teaching goals (hooks, relay skills). Adding template saves and activation ordering means each mission teaches 2 things instead of 1. This partially undermines Option A's "single concept per mission" purity.
- **The pre-taught concepts are approximations, not exact matches.** Templates are passive (you load them manually). Blueprints are active (the factory builds them automatically). The analogy can mislead — a player who thinks "blueprints are just templates" might not understand the factory's autonomous production cycle.
- **Veterans get two extra features they don't need.** The template system and activation order strip are pure tutorial scaffolding. A veteran who skips Missions 1–4 never encounters them. If they're genuinely useful features, they should exist post-tutorial too. If they only exist as pre-teaching, they're wasted code.

### Interaction Effects

- **With 5.00a vocabulary pacing:** Reduces Mission 5's term load from 5 to 2, bringing it within the 4±1 comfort zone. But increases Missions 3 and 4 term load by 1 each.
- **With 3.02 skill acquisition:** If skills are unlocked via campaign progression (Staged Reveal), the template system could store skill loadouts too, making it a persistent feature rather than tutorial scaffolding.
- **With 5.01e expert fast-track:** A veteran who solves Missions 1–4 quickly might skip the template and activation order features entirely, arriving at Mission 5 without the pre-teaching. The factory introduction must still work without pre-teaching as a fallback.

### Comparable Games

- **Factorio's progression philosophy:** Factorio never formally introduces concepts. Belts exist from minute one, but the player doesn't need them until manual hauling becomes tedious. The *need* precedes the *tool*. Pre-teaching works the same way: the player feels the need for reusable configs (retrying Mission 3 with manual reconfiguration) before templates exist.
- **XCOM 2's Armory → Squad Select pipeline:** Individual soldier customization (analogous to unit configuration) precedes squad composition (analogous to blueprint production). But XCOM doesn't explicitly teach the mapping — it's assumed. Robot Uprising's upgrade animation is more explicit.
- **Slay the Spire's card draft → deck composition:** Each card choice (draft) maps to later deck synergy (composition). The player learns parts before the whole. But Slay the Spire's parts ARE the whole — there's no mode shift. Robot Uprising's pre-placed → factory shift is qualitatively different.

---

## Approach 2: "The Split" — Break Mission 5 into 5A and 5B

### How It Works

Mission 5 becomes two half-missions, each teaching one half of the factory system.

**Mission 5A — "The Blueprint" (Design):**
The player base is visible on the board. A single empty blueprint slot is highlighted in the workbench. The mission objective: "Design a scout blueprint and save it." No production queue. No resources. No build cycle. The player uses the familiar workbench to configure a scout (skills, rules, hooks, context config) and clicks "SAVE BLUEPRINT." One scout materializes at the base position after a 3-second build animation. The player watches their blueprint become a real unit. Mission complete when the unit survives for 10 ticks against a single weak enemy.

**Mission 5B — "The Assembly Line" (Production):**
Now the player has their saved blueprint. Mission 5B introduces the production queue: a conveyor strip where the player can place multiple copies of their blueprint (or design a second blueprint — a striker). Resources are introduced: `Materials: 20` and `Energy: 3/tick` are visible. The player must design a build order that produces enough units to defeat a wave of enemies arriving from the east. The factory's build cycle (one unit every 5 ticks) creates time pressure.

**Session structure:** 5A takes 3–5 minutes. 5B takes 8–12 minutes. Combined, they're the length of one normal mission but with a natural breathing point between halves. The campaign map can show them as two stops on the same island (e.g., Cebu Province: two pins labeled "5A: The Design Lab" and "5B: The Assembly Line").

### Sensory Description

**Mission 5A — The first blueprint save:** The workbench shows a single empty blueprint frame — a dashed rectangular outline with a faint "+" icon in the center, glowing amber. Below it, a label: "DESIGN YOUR FIRST BLUEPRINT." The player clicks the frame. The familiar unit configuration panel appears — identical to Missions 1–4, same skills/rules/hooks/context sections. The only difference: a "UNIT TYPE" selector at the top (Scout/Striker/Relay — only three available at this point). The player configures a scout. When they click "SAVE," the dashed outline solidifies into a full card with a miniature unit portrait, skill icons, and a cyan border flash. A 3D printer–style build animation plays on the board: the factory's conveyor belt activates, layers of the unit sprite stack from bottom to top over 3 seconds like a 3D print materializing layer by layer, accompanied by a rising-pitch electronic hum that resolves into a clear bell tone when the unit is complete. The unit stands on the factory tile, turns to face the board, and its context bars initialize (empty blue pips appear one by one). The boot log prints: `[>>] FIRST_UNIT_FABRICATED — BLUEPRINT: [player's name for the blueprint]`.

**Mission 5B — The conveyor belt activates:** The production queue strip appears along the bottom of the Plan screen. It's styled as a literal conveyor belt — a horizontal track with evenly spaced "slots" (dashed rectangles). The player's saved blueprint from 5A is already in slot 1. A tooltip points to the empty slots: "Drag blueprints here to set your build order." A resource counter appears in the top-left corner for the first time: two readouts styled like industrial gauges — `MAT: 20/20` (a filling bar) and `NRG: 0/8 per tick` (a rate meter). When the player drags a second blueprint to slot 2, the MAT gauge decreases and the NRG rate meter increases. The visual is immediate: building costs stuff.

When the player hits EXECUTE, the sealed watch shows the factory in action for the first time: every 5 ticks, the conveyor belt advances (the leftmost blueprint icon slides into the factory building, a brief glow, and a new unit appears at the factory door). The factory has a rhythmic, mechanical heartbeat — five ticks of quiet, then a KA-CHUNK production sound and a unit appears. This rhythm becomes the game's metronome. Players will learn to time their strategies around the factory's pulse.

### Strengths

- **The purest pacing solution.** Each half-mission introduces exactly one conceptual cluster: 5A = blueprints (what to build), 5B = production (when and how to build it). No concept shares a mission with an unrelated concept.
- **The blueprint save in 5A mirrors Missions 1–4.** The workbench is identical. The player does what they've done before (configure a unit) with one twist (save as blueprint). The cognitive load is minimal.
- **5B's resource introduction is contextualized.** Resources matter because the player is already invested in their blueprint from 5A. "This costs materials" means something because "this" is a unit they designed. Abstract resource management becomes concrete.
- **Provides a natural breathing point.** The 5A completion screen offers a moment to reflect before 5B escalates. Players who need a break can stop between halves without losing momentum.

### Weaknesses

- **Adds a mission to the campaign.** The locked spec says 10 missions. 5A/5B makes it 11 (or makes two half-missions that feel like one-and-a-half). The campaign map must accommodate this — two pins on one island, or a "sub-mission" visual treatment.
- **5A might feel trivial.** "Design a scout and watch it build one unit" is a 3-minute mission for anyone who understood Missions 1–4. The mission doesn't have enough challenge to feel like a real mission. It's an interactive cutscene.
- **The separation is artificial for veterans.** A player who grasps blueprints instantly wants to immediately use the production queue. Forcing them through a 3-minute 5A before they can access 5B feels like pacing for pacing's sake.
- **Two debrief cycles for one conceptual cluster.** Each half-mission has its own sealed watch → Inspector flow. The debrief for 5A has very little to inspect (one unit, one enemy, ten ticks). It may feel like a waste of the Inspector's power.

### Interaction Effects

- **With 5.01e expert fast-track:** The adaptive skip system should detect if the player saves a valid blueprint in under 30 seconds and offer to merge 5A into 5B. "You've got this — jump to the full Assembly Line?" This converts the split mission into a single mission for veterans.
- **With narrative (5.02):** The boot log's `[>>] FABRICATOR: ONLINE` line can play at the START of 5A, and a second line `[>>] PRODUCTION_QUEUE: ONLINE` at the start of 5B. The subsystem initialization narrative maps perfectly to the two-phase introduction.
- **With the campaign map:** Two pins on Cebu Province (locked setting for Mission 5) could be styled as "East Cebu: Design Lab" and "West Cebu: Assembly Line," connected by a short glowing data cable. This makes the split feel intentional rather than arbitrary.

### Comparable Games

- **Into the Breach's island structure:** Each island is a set of missions with a boss. Individual missions within an island are shorter than a full play session. Mission 5A/5B maps to two fights on the same island — each short, together forming one challenge.
- **Portal's "test chambers" philosophy:** Portal never introduces two mechanics in the same chamber. Portals are one chamber. Cubes are another. Together, they're a third. The split mirrors this — blueprint is one chamber, production is another, full factory gameplay is the chambers that follow.
- **Mega Man's weapon-get → weapon-use cycle:** Beat a boss, get their weapon (5A = design a blueprint). Next stage, use that weapon in a new context (5B = deploy the blueprint through production). The reward from one stage is the tool for the next.

---

## Approach 3: "The Sandbox" — Free-Play Factory Before the Real Mission

### How It Works

Mission 5 opens with a dedicated sandbox phase — a 3-8 minute free-play period on a safe board where the player experiments with every factory feature without consequences. No enemies. No failure condition. Full factory UI available. Ghost-hand tutorials guide initial interactions. When the player has demonstrated minimum competence (created at least one blueprint, placed it in the queue, produced at least one unit), the "BEGIN MISSION" button activates.

**The sandbox board:**
The 8x8 grid shows the player's factory in the southwest corner. The rest of the board is empty — no enemies, no objectives, just open terrain (Mission 5's Cebu city biome: neon-lit streets, exposed fiber optic cables, a data center built into a colonial-era arch). A floating banner reads `SIMULATION MODE — DESIGN YOUR FACTORY` in muted white text. The board has the faintly desaturated, blue-grey holographic treatment from Option D (5.04 complexity ramp).

**Guided discovery sequence:**
1. Ghost hand highlights the BLUEPRINTS tab. "Click here to design your first unit."
2. Player opens the blueprint editor. Familiar workbench layout. Ghost hand shows: "Choose a unit type, configure it, and save."
3. Player saves a blueprint. Ghost hand highlights the production queue. "Drag your blueprint here to queue it for production."
4. Player drags. Ghost hand shows: "Hit EXECUTE to watch your factory build."
5. Player hits EXECUTE. The factory builds one unit. The sandbox sealed watch runs for 10 ticks — just long enough to watch the unit spawn and move. No enemies.
6. The resource counter is visible. A tooltip explains: "Materials are spent when units are built. Energy drains each tick per active unit."
7. "BEGIN MISSION" button activates with a green pulse.

**The real mission:**
After the sandbox, the full Mission 5 challenge begins. Enemies appear. The resource constraint is real. The player must design an army that can defeat a wave attack using limited materials. The sandbox's consequence-free experimentation has given them the mechanical vocabulary; now they apply it under pressure.

### Sensory Description

**Entering the sandbox:** Mission 5 loads. The boot log prints `[>>] FABRICATOR: ONLINE` — but instead of the usual bright green, the text renders in holographic blue, signaling simulation mode. The board fades in with the desaturated overlay — Cebu's neon signs still glow, but at 40% brightness, like a city before dawn. The factory building is fully rendered (a data center with jeepney-styled loading docks and sari-sari store facades hiding compute racks) but with wireframe edges — not-yet-real. A low ambient hum, pitched lower than the normal game ambience, establishes a "practice space" sonic identity.

**The first factory production in sandbox:** When the player hits EXECUTE for the first time in the sandbox, the sealed watch begins — but the tick clock has a blue tint (simulation mode indicator). The factory's conveyor belt activates. The player watches: tick 1... tick 2... tick 3... tick 4... tick 5 — KA-CHUNK. A unit materializes at the factory door. But since there are no enemies, the unit just... walks. It patrols according to its rules, scans its empty perception cone, finds nothing, and stands still. The player watches their creation exist. There's a peculiar calm to it — a unit moving through an empty city with no danger. The ambient hum shifts slightly warmer. The player smiles. They made something.

**Transition to real mission:** The player clicks BEGIN MISSION. The desaturation peels away — Cebu's neon signs flare to full brightness, left to right, 1.5 seconds. The wireframe edges on the factory solidify. The ambient hum rises in pitch and gains a rhythmic pulse. Enemy icons fade in from the east edge of the board: three red units, then five more behind them. A `PROXIMITY ALERT` tone plays. The banner dissolves. The boot log prints in green: `SIMULATION COMPLETE. LIVE FABRICATION ENGAGED.` The player's heart rate rises. This is real now.

### Strengths

- **Zero-stakes exploration eliminates fear.** The sandbox lets the player make every possible mistake (empty queue, wrong unit type, overspending resources) without penalty. By the time the real mission starts, they've already recovered from their first three factory errors — in private, with no one watching, no score tracking, no "attempt counter" incrementing.
- **Self-paced timing.** A fast learner spends 90 seconds in the sandbox. A slow learner spends 8 minutes. The game gates only on demonstrated competence (one produced unit), not on time.
- **The dry run teaches the factory's rhythm.** Watching the factory produce units in an empty sandbox teaches the build cycle timing (5 ticks between units) through observation, not description. The player learns "the factory is slow" by feeling the wait, not reading about it.
- **Preserves the emotional arc.** Sandbox (calm, experimental) → Transition (dramatic, tension-building) → Real mission (high-stakes, applying what you learned). The three-beat structure creates a natural narrative arc within a single mission.

### Weaknesses

- **Session length.** Mission 5 with a sandbox + real mission could run 15–20 minutes. If the player fails the real mission and retries, do they replay the sandbox? (Almost certainly no — it should be one-time.) But the first attempt is long.
- **The sandbox doesn't teach pressure.** In the sandbox, resources are infinite (or generous). In the real mission, resources are scarce. The player's sandbox army might be a luxury fleet that can't be afforded under real constraints. The gap between sandbox abundance and mission scarcity can be jarring.
- **Ghost-hand dependency risk.** If the ghost hand guides every action, the player learns to follow instructions, not to think. If it's too subtle, the player might not discover the queue dragging interaction. Calibrating ghost hand assertiveness is a design micro-problem.
- **The empty-board sandbox lacks strategic context.** In the sandbox, the player designs a blueprint without knowing what enemies they'll face. They can't make strategic choices (more scouts for recon? more strikers for killing?) because they don't know the threat. The sandbox teaches *how* to use the factory, not *what* to build with it.

### Approach 3 Design Variation: "The Scouted Sandbox"

A hybrid that fixes the "no strategic context" weakness: the sandbox board isn't empty. It shows ghostly enemy projections — translucent red silhouettes of the enemies the player will face in the real mission, positioned where they'll spawn but non-interactive. The player can see: "I'll face 8 enemies approaching from the east, including 2 that are faster than the rest." Now their sandbox experimentation has strategic direction: they can design blueprints that address the visible threat profile. The ghosts don't move or fight — they're just spatial information.

### Interaction Effects

- **With 5.02 tutorial as narrative:** The sandbox can be framed diegetically. The boot log prints: `[SIM] RUNNING FABRICATION SIMULATION... NO HOSTILE CONTACTS`. When the simulation ends: `[SIM] SIMULATION PARAMETERS NOMINAL. RECOMMEND LIVE DEPLOYMENT.` The AI is testing its factory before committing to battle — exactly what a real AI would do.
- **With sealed watch design:** The sandbox uses a simplified sealed watch (no combat, no signals, just movement). This trains the player to read the sealed watch in a low-information environment before the full chaos of combat.
- **With the Inspector:** The sandbox's 10-tick sealed watch produces an inspector-available replay. The player can scrub through their first factory output and examine unit behavior. This plants the habit of using the Inspector for factory-produced units, not just pre-placed ones.

### Comparable Games

- **Besiege's sandbox mode:** Besiege gives unlimited sandbox before any mission. Build whatever you want, test it, then tackle the objective. The sandbox is the game's entire identity.
- **Kerbal Space Program's Vehicle Assembly Building:** Build your rocket in a zero-gravity hangar, then launch it. The VAB is the sandbox; the launch is the real mission. The factory IS the VAB — a place to design and iterate before committing.
- **XCOM 2's base-building → deployment cycle:** You build facilities (factory), then deploy (mission). The build phase has no enemies. The deployment has all the enemies. The cycle is sandbox → stakes.

---

## Approach 4: "The Simplified Factory" — Depth 1 First, Full Factory Later

### How It Works

Mission 5 introduces the factory at reduced complexity. The player can design **one blueprint** and the factory produces copies of that single blueprint. No multi-blueprint queue management. No build order optimization. Resources are simplified (fixed materials per mission, energy cost displayed but manageable).

**What's available in Mission 5 (Depth 1):**
- Blueprint editor (one slot only)
- Factory with automatic production (one unit every 5 ticks)
- Resource display (materials counter, energy rate)
- The board with factory visible

**What's NOT available (unlocks in Mission 6):**
- Second+ blueprint slots
- Production queue reordering
- Build priority settings
- Resource allocation decisions between blueprint types

**The teaching through designed failure:**
The mission's enemy composition is deliberately heterogeneous: fast scouts from the north AND slow heavy strikers from the east. A single-blueprint army of scouts can handle the northern threat but gets destroyed by the eastern strikers. A single-blueprint army of strikers handles the east but can't catch the northern scouts. The player fails twice — once each way — and the debrief explicitly surfaces: "Your army had only one unit type. Different enemies require different responses."

After two failures (or player request), the second blueprint slot unlocks. The boot log: `[>>] BLUEPRINT_SLOT_2: AUTHORIZED — DIVERSIFY YOUR PRODUCTION`. Now the player designs both a scout AND a striker blueprint. The production queue (which was invisible at depth 1, since there's only one option) appears for the first time, showing two icons in sequence. The player experiences queue ordering as a natural consequence of having two blueprints.

### Sensory Description

**The one-blueprint factory:** The workbench shows a single blueprint frame — identical to Approach 2's 5A design. But below it, where additional blueprint slots will eventually appear, there's... nothing. No greyed-out slots. No "coming soon" hints. The player sees one frame and the factory. That's it. The UI is deliberately minimal. The production queue strip exists but shows only a single repeating icon: the player's blueprint, copied endlessly along the conveyor. The visual rhythm is monotonous by design — same icon, same icon, same icon — creating a subtle visual discomfort that the player will later recognize as "monoculture."

**The designed failure — scout army vs. strikers:** The player designs a scout-heavy blueprint (patrol, evade, hook to alert channel). The factory produces scouts. During the sealed watch, the scouts handle the northern threat beautifully — weaving between fast enemies, sending alert signals, staying alive. But from the east, heavy striker enemies advance. The scouts can see them (perception range 5) but can't kill them (no engage skill). The alert channel fires frantically. Green chevrons streak across the board. But there's nobody to receive them — the army is all scouts, all sending, nobody fighting. The buffer bars on every scout spike to red as they flood each other with useless alerts about a threat none of them can address. The enemy strikers reach the factory and destroy it with a single adjacent attack. The screen flashes red. The factory goes dark.

The debrief shows a heat map: the entire northern half of the board is green (threats handled), the entire eastern half is red (uncontested enemy advance). The asymmetry is visually unmistakable. The caption: "One blueprint. One response. The enemy had two strategies."

**The second slot unlock:** After two failures (one scout-only, one striker-only), the Mission 5 Plan screen reloads with a change. The single blueprint frame is still there, but now a second frame fades in to its right — emerging from nothing over 2 seconds with a crystallization animation (pixels coalescing from scattered dots into a solid dashed outline). A small "2" badge appears. The boot log: `[>>] BLUEPRINT_SLOT_2: AUTHORIZED`. The production queue strip updates: now it shows alternating icons — two different blueprints. The conveyor belt animation subtly changes rhythm, alternating between two distinct production sounds. The monoculture monotony breaks.

### Strengths

- **The failure teaches the WHY before the HOW.** The player doesn't learn "you have two blueprint slots" as an abstract feature. They learn it as the *solution to a problem they experienced*. "One unit type isn't enough" is felt, not told. This is Factorio's progression philosophy: the need precedes the tool.
- **Minimum viable factory.** A one-blueprint factory is conceptually equivalent to "an infinite copy machine for your best unit." That's one concept, not five. The player's mental model at depth 1 is simple: "The factory makes more of what I designed."
- **Failure isn't punishing.** The two designed failures are short (30–60 seconds of sealed watch each). The player sees clearly why they failed. The debrief is unambiguous. This isn't a "hit a wall and grind" experience — it's a "hit a wall and the wall shows you the door."
- **Natural progression to depth 2.** The second blueprint slot feels earned. The player wanted it before it arrived. When it appears, the satisfaction is: "Finally! Now I can have scouts AND strikers." The unlock is a reward, not a lecture.

### Weaknesses

- **Designed failure can feel manipulative.** If the player realizes "the game WANTED me to fail," they might feel patronized. "You could have given me two slots from the start." The design must feel like a natural constraint that relaxes as the player proves readiness, not a deliberate trap.
- **Veterans will see through it instantly.** A veteran on their first attempt will think: "Obviously one unit type isn't enough. Let me build a striker." When their striker army fails against scouts, they'll think: "I already know I need both. Give me the second slot." The designed-failure teaching cycle is wasted on them. The expert fast-track (5.01e) should detect this: if the player configures a combat-capable blueprint on attempt 1 AND switches to a different unit type on attempt 2, skip directly to the two-slot unlock.
- **The "no queue at depth 1" gap.** At depth 1, the production queue shows identical icons. The player doesn't learn queue mechanics (ordering, prioritization) until depth 2. If Mission 6 then introduces multi-blueprint queue management, Mission 6 has TWO new things to learn (command agent + queue management). The complexity doesn't disappear — it shifts downstream.
- **Two failures minimum = time cost.** Each failure requires a full Plan → Execute → Debrief cycle. Even short cycles take 2–3 minutes. The designed-failure path adds 5–6 minutes to Mission 5. For impatient players, this feels like wasted time.

### Interaction Effects

- **With the campaign map:** Mission 5 can show a "progress bar" on its Cebu pin — "Phase 1: Single Blueprint" → "Phase 2: Factory Unlocked" — making the within-mission progression visible on the map.
- **With 5.06 failure and recovery:** The designed failures in Mission 5 should be framed as "subsystem authorization levels" rather than player mistakes. The AI's factory starts at level 1 (one blueprint) and upgrades to level 2 (two blueprints) as the AI "proves its production capabilities." This reframes failure as progression.
- **With 5.00a vocabulary pacing:** The depth-1 factory introduces 2 new terms (blueprint, factory). Depth-2 introduces 3 more (production queue, build order, resource allocation). Spread across Missions 5 and 6, this keeps each mission within the 4±1 vocabulary budget.

### Comparable Games

- **Dark Souls' Asylum Demon:** The first boss is deliberately unbeatable (or very hard) on first encounter. The player dies, learns the game has no mercy, finds a weapon, and returns. The death IS the tutorial. Mission 5's designed failure follows the same pattern — die to monoculture, learn why, return with a second tool.
- **Into the Breach's first island:** The first island has simple enemy types. The player's starting squad handles them with basic tactics. Island 2 introduces enemies with new behaviors that demand new thinking. The complexity increase is gated by demonstrated competence (beating Island 1).
- **Factorio's "manual phase":** In Factorio, the player manually crafts items before discovering that automation is possible. The tedium of manual crafting IS the teaching — it creates the desire for automation. Mission 5's monoculture failure creates the desire for blueprint diversity.

---

## Approach 5: "The Optional Factory" — Factory as Reward, Not Requirement

### How It Works

Mission 5 can be completed WITHOUT the factory. The player starts with pre-placed units (like Missions 1–4) in defensive positions around their base. The enemies attack. With good configuration, the pre-placed units can survive and win. It's hard — the pre-placed army is deliberately small (3 units vs. 8 enemies) — but possible. Some players will beat it this way.

**The factory is presented as a tool, not a requirement.** A tooltip early in the Plan phase: "Your base has a FACTORY. You can design blueprints and produce new units to reinforce your defenses. Or, try to win with what you have." The workbench shows the familiar pre-placed unit configs AND a new FACTORY tab. The player can ignore the tab entirely.

**What happens if they use the factory:**
The mission becomes much easier. Blueprint-produced units supplement the pre-placed ones. The player can build scouts for intel, strikers for firepower, or relays for communication. The factory turns a desperate defense into a comfortable victory.

**What happens if they DON'T use the factory:**
The pre-placed units must be perfectly configured. Every rule must be optimal. Every hook must carry the right signal. The player is solving a hard version of a Mission 3-style puzzle. If they win, they get a special debrief annotation: "VICTORY WITHOUT FABRICATION — 3/3 units survived." A badge. Bragging rights. The debrief then shows: "Your base has an unused FACTORY. Try using it on the next mission — or try this mission again with it enabled."

**The inversion:** Traditional tutorials present the new mechanic as a hurdle. The Optional Factory presents it as a gift. "You don't HAVE to use this, but look how much easier it makes things." The player discovers the factory not because the game forces them to, but because they choose to. The choice creates ownership.

### Sensory Description

**The Plan screen with both options visible:** The board shows 3 pre-placed units (Scout-A, Striker-B, Relay-C) in defensive positions around the base. The workbench on the right shows their familiar configuration panels. But the workbench now has a **second tab** at the top: the current "UNITS" tab (highlighted, showing pre-placed unit configs) and a new "FACTORY" tab (not highlighted, glowing with a slow amber pulse, a "there's something here" invitation). The FACTORY tab has a "NEW" badge — the same visual language used for all concept introductions throughout the campaign. The tab is inviting but not insistent.

**The player who ignores the factory:** They configure their 3 pre-placed units with extreme care. Every rule is optimized. The hook wiring is tight. They hit EXECUTE. The sealed watch is tense — 3 units against 8 enemies is a knife fight. Every tick matters. Buffer bars spike and recover. Hook signals fire precisely. The 3 units use their configuration advantages (better rules, better hooks, pre-positioned for terrain) to overcome their numerical disadvantage. When the last enemy falls, the victory screen shows a unique animation: the 3 surviving units stand in the glow of the untouched factory, which has been idle the entire battle. The boot log: `[OK] MISSION_COMPLETE — FABRICATOR: STANDBY (UNUSED)`. A special badge appears: **"HANDCRAFTED VICTORY"** — a silver wrench icon.

**The player who embraces the factory:** They click the FACTORY tab. The workbench transforms: the pre-placed unit configs shrink to a sidebar, and the blueprint editor takes center stage. The player designs a blueprint, drags it to the queue, and EXECUTE produces an army. The sealed watch shows factory-produced units flooding the board, overwhelming the enemies with numbers. The victory is comfortable but unremarkable. The debrief shows: "8/8 enemies eliminated. 7 units deployed (3 pre-placed + 4 produced)." No special badge, but a smooth ride.

**The player who starts without and switches:** A common pattern. The player tries the hard way (pre-placed only), fails on attempt 2, and decides to try the factory. They click the FACTORY tab for the first time. The tab opens with a brief 5-second animation: the factory's doors open, the conveyor belt starts moving, and the boot log prints: `[>>] FABRICATOR: ACTIVATING — FIRST USE`. The player now has the full factory UI available. Their attempt 3 uses both pre-placed units AND factory production. The debrief shows the transition: "Attempt 1: pre-placed only (FAILED). Attempt 2: pre-placed only (FAILED). Attempt 3: factory activated (SUCCEEDED)." The player can see their own learning journey in the attempt log.

### Strengths

- **Maximum player agency.** The player decides when to engage with the factory. This respects both veterans (who might enjoy the hard pre-placed challenge) and newcomers (who can take the factory easy mode).
- **The factory sells itself.** A player who beats Mission 5 without the factory and then replays with it experiences a dramatic power difference. "Oh. THAT'S what the factory does." The teaching moment is self-generated, not designer-imposed.
- **Creates a community challenge.** "Can you beat Mission 5 without the factory?" becomes a speedrun/challenge category. The Handcrafted Victory badge creates social proof. Players share their 3-unit configurations. The factory's absence becomes content.
- **Gentlest possible introduction.** There is no moment where the game says "you MUST learn this new thing now." The new thing is offered. The player can accept on their own timeline.

### Weaknesses

- **Some players will NEVER use the factory.** If Mission 5 is beatable without it, a player who succeeds pre-placed might think: "I don't need the factory." Then Mission 6 REQUIRES the factory (enemies too numerous for pre-placed), and the player hits a harder wall — they skipped the gentle introduction and now face the factory + command agent simultaneously.
- **The "optional" framing undermines importance.** The factory is the game's central system from Mission 5 onward. Making its introduction optional signals "this is a side feature" rather than "this is the core of the game going forward." The framing must carefully distinguish "you can try without it HERE" from "you can play without it FOREVER."
- **Mission 6 becomes the real wall.** If Mission 5 is passable without the factory, Mission 6 is the first mandatory factory mission. All the cognitive load that Approach 5 avoids in Mission 5 lands in Mission 6 instead — plus Mission 6's own content (command agent). The wall doesn't disappear; it moves.
- **Pre-placed + factory UI is cluttered.** Having both a UNITS tab (pre-placed configs) and a FACTORY tab (blueprint editor) on the same screen is more UI than any previous mission. The player must understand two paradigms simultaneously, even if they only use one.

### Interaction Effects

- **With 5.06 failure and recovery:** The factory-as-optional creates a natural "difficulty ladder" within a single mission. Pre-placed only = hard mode. Pre-placed + factory = normal mode. This integrates difficulty selection into gameplay rather than a settings menu.
- **With 5.09 replayability:** Mission 5 has two fundamentally different play modes (pre-placed vs. factory), creating natural replay incentive. The Handcrafted Victory badge motivates a second attempt. This is rare for tutorial missions — they're usually one-and-done.
- **With the campaign progression:** If Mission 6 requires the factory, the game must detect whether the player used it in Mission 5. If not, Mission 6's boot log should include a brief factory tutorial: `[>>] FABRICATOR: INITIALIZING FIRST USE` with ghost-hand guidance. The optional introduction creates a conditional need for a fallback tutorial.

### Comparable Games

- **Celeste's Assist Mode:** The tools to make the game easier are always available. The player chooses when (if ever) to use them. No judgment. No locked content. The factory as optional tool follows this philosophy.
- **Breath of the Wild's "go anywhere" tutorial:** The Great Plateau teaches mechanics by offering them as tools for exploration, not as gated requirements. The player can reach the Plateau's end through multiple paths, using different combinations of tools. Mission 5's factory is one path to victory.
- **XCOM's optional objectives:** Each XCOM mission has a primary objective (mandatory) and secondary objectives (optional, but rewarding). The factory could be framed as Mission 5's "secondary objective" — not required for mission success, but required for the "FACTORY OPERATIONAL" bonus that unlocks additional content.

---

## Cross-Approach Comparison Matrix

| Dimension | Pre-Teach | Split | Sandbox | Simplified | Optional |
|-----------|-----------|-------|---------|------------|----------|
| **Cognitive load at Mission 5** | Low (2 new) | Low (2-3 per half) | Medium (5, but practiced) | Very low (2) | Varies (0-5) |
| **Minimum time for Mission 5** | 8 min | 12 min (5+7) | 12 min (5+7) | 10 min (3+7) | 7 min (without factory) |
| **Veteran experience** | Good (pre-seeds are useful) | Poor (5A trivial) | Fair (sandbox skip needed) | Poor (designed failure obvious) | Excellent (challenge mode) |
| **Newcomer experience** | Good (familiar building blocks) | Excellent (tiny steps) | Excellent (zero stakes) | Good (learn-by-failing) | Risky (might skip factory) |
| **Narrative integration** | Strong (upgrade metaphor) | Strong (two-phase subsystem) | Strong (simulation mode) | Medium (authorization levels) | Weak (optional feels unimportant) |
| **Downstream impact** | Clean (M6 starts at depth 2) | Clean (M6 gets queue at depth 2) | Clean (full factory available M6+) | Shifts load to M6 (queue + command) | Conditional (may need M6 tutorial) |
| **Community content** | Template sharing | Speed comparison | Sandbox experimentation clips | Failure compilation videos | "No factory" challenge runs |
| **Implementation complexity** | Medium (template + order UI in M3/M4) | Low (two shorter missions) | Medium (sandbox mode + transition) | Medium (progressive unlock logic) | High (two valid play modes per mission) |

---

## The Recommended Hybrid

The strongest Mission 5 likely combines elements from multiple approaches:

1. **Pre-Teach's template seed** (Missions 3-4): Plant the "reusable configuration" concept as templates. Don't teach build ordering — that's adding too much to earlier missions. Just templates.
2. **Sandbox's free-play opening** (Mission 5 start): Begin Mission 5 with a 3-5 minute sandbox using the Scouted Sandbox variant (ghost enemies visible for strategic context). The sandbox teaches the factory's mechanical interface.
3. **Simplified Factory's depth-1 constraint** (first real attempt): The sandbox ends and the real mission begins with ONE blueprint slot. The player's first real attempt is simplified.
4. **Simplified Factory's designed failure + unlock** (natural progression): After the player experiences monoculture failure, the second blueprint slot unlocks. Now they have the full depth-1 factory.
5. **Optional's Handcrafted Victory badge** (community reward): Pre-placed units exist on the board as an alternative path. The badge rewards players who find it. This doesn't change the primary teaching path — it adds a bonus for veterans.

This sequence: Template seed → Sandbox → Simplified depth 1 → Failure unlock → Badge bonus.

**Total Mission 5 duration estimate:** 12–18 minutes for newcomers (sandbox 5 min + two failures 4 min + success 5 min), 5–8 minutes for veterans (skip sandbox, beat simplified on first try or use pre-placed, move on).

---

## Player Journeys

### Journey: Lena, 14, High School Student, First Strategy Game

**Context:** Lena has played Missions 1-4 over two evenings. She saved a scout template in Mission 3 ("SpeedEye" — fast patrol with alert hooks) and ordered her activation sequence in Mission 4. She liked both features. She's about to start Mission 5, the Cebu Province mission.

**Minute 0:00 — The Boot Log**
The campaign map zooms into Cebu Province. The mission briefing loads. The boot log begins its startup sequence in the familiar teal monospace font. But this time, something new happens — the word `TEMPLATES` appears, then each letter dissolves and reforms: `TEMPLATES → BLUEPRINTS`. Lena watches the letters change. "Oh — my SpeedEye template is going to become something else?" A second line: `ACTIVATION_ORDER → PRODUCTION_QUEUE`. She doesn't fully understand yet, but the morphing text tells her: familiar things are evolving.

The boot log reaches the new line: `[>>] FABRICATOR: ONLINE`. A brief animation shows the factory building on the board — a data center with jeepney-styled loading docks, neon signs flickering in Cebu's cyberpunk cityscape. The factory's doors open. A conveyor belt starts moving. The boot log adds: `[SIM] RUNNING FABRICATION SIMULATION... NO HOSTILE CONTACTS`.

**Minute 0:30 — The Sandbox**
The Plan screen loads in simulation mode — desaturated board, wireframe factory, the "SIMULATION MODE" banner. Lena sees ghost enemies: translucent red silhouettes showing 8 enemies in two groups (3 fast from the north, 5 slow from the east). The ghosts don't move but their positions tell a story: two fronts, different speeds.

The FACTORY tab in the workbench pulses amber. A ghost hand guides her: "Click here to design your first blueprint." She clicks. The blueprint editor appears — identical to the unit config from Missions 1–4 but with a "BLUEPRINT NAME:" field and "UNIT TYPE:" selector. She's been here before. She selects Scout, names the blueprint "SpeedEye v2," and configures it with patrol + alert hooks. She saves. The blueprint card animates — shrink, flip, snap into the BLUEPRINTS panel.

A ghost hand guides her to the production queue: "Drag your blueprint here." She drags. The queue shows one icon. She hits EXECUTE. The sandbox sealed watch runs 10 ticks: the factory builds one scout. It walks into the empty city. No enemies. Lena watches her unit patrol alone. She feels... peaceful. Proud. She made this.

**Minute 3:00 — The Real Mission Begins**
Lena clicks BEGIN MISSION. The desaturation peels away. Cebu's neon signs ignite to full brightness. Enemy icons fade in — this time solid red, not ghostly. The PROXIMITY ALERT tone plays. Her heart jumps. She has one blueprint (SpeedEye v2) in her queue. The factory starts producing scouts.

**Minute 4:00 — The Monoculture Failure**
The sealed watch runs. Her scouts handle the northern fast enemies beautifully — dodging, alerting, surviving. But the eastern heavy enemies advance unopposed. Scouts can see them but can't fight them. Alert signals flood every unit's buffer. Buffer bars go red. The eastern enemies reach the factory. KA-CHUNK — the factory goes dark. Screen flashes red. Failure.

The debrief shows the asymmetric heatmap: green north, red east. Caption: "One blueprint. One response. The enemy had two strategies."

**Minute 6:00 — The Unlock**
Lena returns to the Plan screen. A new blueprint slot has materialized — the crystallization animation, pixels coalescing from scattered dots. The boot log: `[>>] BLUEPRINT_SLOT_2: AUTHORIZED — DIVERSIFY YOUR PRODUCTION`. Lena immediately designs a Striker blueprint ("Puncher") with engage skill and rule: IF enemy_adjacent → engage. She drags both SpeedEye v2 and Puncher to the queue. The conveyor belt now shows alternating icons — scout, striker, scout, striker. A rhythm.

**Minute 8:00 — The Diverse Army**
She hits EXECUTE. The factory alternates production. Scouts fan north. Strikers advance east. The scouts spot enemies and send alerts. The strikers receive alerts and move to intercept. Both fronts are covered. Buffer bars stay manageable — the right signals reach the right units. The eastern heavy enemies meet her strikers head-on. Adjacent attack. One-shot kills. The factory survives.

**Minute 10:00 — Victory**
Mission complete. Lena has learned blueprints, the production queue, resource management, build diversity, and the factory's build cycle. She learned each one through experience: sandbox for mechanics, failure for strategy, success for confidence. Total time: 10 minutes including sandbox. She doesn't feel like she was taught. She feels like she figured it out.

**UI Annotations:**
- **Template → Blueprint morphing text:** 1.5 seconds, left-to-right letter dissolution, teal monospace, plays once at boot log
- **Sandbox ghost enemies:** 40% opacity red silhouettes, static, showing spawn positions and approximate enemy count
- **Blueprint card save animation:** Card shrinks to 60%, flips 180° on Y-axis, slides right into BLUEPRINTS panel, magnetic snap sound
- **Monoculture heatmap:** Green (threats handled) / Red (uncontested) overlay on 8×8 grid during debrief, fades in over 2 seconds
- **Blueprint slot unlock crystallization:** 2-second animation, scattered pixels coalesce into dashed outline frame, "2" badge appears

---

### Journey: Kai, 34, Senior ML Engineer, Hardcore Strategy Gamer

**Context:** Kai used the adaptive fast-track to compress Missions 1–3. He played Mission 4 at full difficulty (no tooltips). He's built production ML pipelines. He knows what a blueprint is. He's about to start Mission 5.

**Minute 0:00 — Instant Recognition**
The boot log's TEMPLATES → BLUEPRINTS morph plays. Kai reads it and thinks: "Kubernetes deployment templates." The `[>>] FABRICATOR: ONLINE` line triggers the sandbox. The desaturated board loads with ghost enemies.

Kai glances at the ghost enemy positions. Two groups. Heterogeneous threats. He immediately identifies the monoculture trap: "They want me to build one unit type and fail, then unlock a second slot. But I know I need both scouts and strikers." He checks the workbench. One blueprint slot available. He pauses. "Ah. I see. Depth 1. One blueprint."

**Minute 0:30 — Playing Along (or Not)**
The sandbox offers guided discovery. Kai ignores the ghost hand. He clicks the FACTORY tab, designs a striker blueprint in 15 seconds (engage + IF enemy_adjacent → engage, IF buffer_full → move_toward_factory for resupply proximity), and drags it to the queue. He hits EXECUTE to test. The sandbox produces a striker. He watches it for 3 ticks. "Good enough."

He notices three pre-placed units on the board — Scout-A, Relay-B, and an empty position near the factory. "Wait. Pre-placed units AND a factory? Can I win with just the pre-placed units?" He tabs to UNITS. The three pre-placed units are configurable. He recognizes the Optional path.

**Minute 1:30 — The Handcrafted Challenge**
Kai configures the three pre-placed units with extreme precision. Scout-A: wide patrol + alert hook to "threat" channel + evade rule. Relay-B: compress skill + listen to "threat" + output to "filtered-threat" channel + position in center. He places the pre-placed units to cover both fronts. He ignores the factory entirely. He hits EXECUTE.

**Minute 2:30 — The Hard Win**
The sealed watch runs. 3 units vs. 8 enemies. It's a knife fight. Scout-A spots northern enemies. Alerts fire to Relay-B. Relay-B compresses and broadcasts on "filtered-threat." But there's no striker in range to receive. Scout-A has to solo the northern group using evade rule to stay alive while Relay-B's compressed threat reports reach... nobody useful. The factory sits idle. The pre-placed units are overwhelmed.

Kai fails. He adjusts. Attempt 2: he reconfigures the rules more aggressively. Scout-A's perception catches an eastern flanker early. Relay-B's compression timing is tuned to minimize latency. The three units perform a precise defensive dance. It takes him 3 attempts. On attempt 3, the last enemy falls at tick 47. The victory screen shows: **"HANDCRAFTED VICTORY"** — silver wrench badge. The boot log: `[OK] MISSION_COMPLETE — FABRICATOR: STANDBY (UNUSED)`.

**Minute 8:00 — The Replay**
Kai could move on to Mission 6. But he's curious. He replays Mission 5 with the factory. He designs two blueprints in 20 seconds. He builds an army. He wins at tick 22 — half the time, no stress. The debrief shows both runs: "Attempt 3: 3 units, tick 47. Attempt 4: 7 units, tick 22." The comparison is the teaching moment. The factory isn't a crutch — it's a multiplier.

Kai screenshots his Handcrafted Victory badge and posts it in his team's Slack channel. "Beat the factory mission without the factory." Three colleagues immediately download the game.

**UI Annotations:**
- **Pre-placed units alongside factory:** UNITS tab and FACTORY tab both visible, switchable
- **Handcrafted Victory badge:** Silver wrench icon, appears on debrief screen with "FABRICATOR: STANDBY (UNUSED)" log line
- **Two-attempt comparison:** Side-by-side debrief showing pre-placed-only run vs. factory run, tick count comparison

---

### Journey: Abuela Rosa, 62, Retired Teacher, Plays With Grandson

**Context:** Rosa plays Robot Uprising with her grandson Tomás (14). He handles the fast reactions; she handles the strategic thinking. They're at Mission 5. They play on a tablet propped up on the kitchen table in Manila. Tomás configured Missions 1–4 while Rosa told him what to do ("Put the alert thing on the scout, anak"). She saved a template in Mission 3 because Tomás said "Lola, click that save button." She doesn't remember why.

**Minute 0:00 — Confusion and Recovery**
The Mission 5 boot log plays. The TEMPLATES → BLUEPRINTS text morphs. Rosa watches. "Tomás, what does it mean?" Tomás: "I think our templates are turning into blueprints. It's like... instead of saving a recipe, we're going to cook from it." Rosa nods. She understands recipes.

The sandbox loads. Ghost enemies appear. Rosa points at the board: "There are two groups. North and east. The northern ones look fast — they're closer to the line." (She's reading spatial proximity as implied speed.) "The eastern ones look heavy." (She's reading the striker silhouette — broad, angular, heavier.) Tomás is impressed. "Lola, you can read the enemies without the game telling you."

**Minute 2:00 — Guided Discovery Together**
The ghost hand appears. Tomás follows it — clicks FACTORY, opens the blueprint editor. Rosa tells him what to put: "Make one like our SpeedEye from Mission 3. Patrol, alert, fast." Tomás configures a scout. Rosa: "Save it. Call it 'Mataan' — that means 'watchful.'" Tomás types the name.

The sandbox EXECUTE runs. The factory builds one scout. It walks through Cebu's empty streets. Rosa watches. "It's like a baby. It was born at the factory and now it's walking." Tomás drags the blueprint to the queue. They produce three more scouts. The sandbox board has four scouts patrolling. Rosa laughs: "A family of Mataan."

**Minute 5:00 — The Real Mission, First Attempt**
They BEGIN MISSION. The desaturation peels. Enemies appear. Tomás looks confident: "We have four scouts. We got this." Rosa: "But anak, scouts can't fight. Remember Mission 2 — scouts see, strikers hit." Tomás: "I know, but we only have one blueprint slot." The monoculture runs its course. Four scouts alerting each other about enemies they can't kill. Buffer overload. Factory destroyed.

Rosa points at the debrief heatmap: "Green where the scouts went, red where nobody went. We need someone on the red side." Tomás: "But I can only make one type!" Rosa: "Then we need a type that can handle both sides. Can scouts fight?" Tomás: "No, they only have patrol and evade." Rosa: "Then we need to try a fighter."

**Minute 8:00 — Second Attempt, Then Unlock**
Tomás redesigns the blueprint as a striker. "Malakas" — strong. The striker army advances but can't see enemies early enough. Buffer nearly empty (no incoming alerts from scouts). The strikers stumble into enemies without warning. Failure again, opposite reason.

The second blueprint slot unlocks. Rosa and Tomás both light up. Tomás: "NOW we can have both!" Rosa: "Make Mataan AND Malakas. Scouts to watch, strikers to fight." They design both blueprints. The production queue alternates. This time, the factory produces a mixed army. Scouts find enemies, alert Malakas strikers, strikers engage. Mission complete.

Rosa beams. "It's like a kitchen, anak. You need someone to prepare AND someone to cook. One person can't do both." Tomás will remember this metaphor for the rest of the campaign.

**Minute 14:00 — The Walk Home**
That evening, Tomás tells his classmate about the game: "My lola helped me beat Mission 5. She figured out we needed two types of robots before I did." The game has created a shared vocabulary between a 14-year-old and a 62-year-old that maps to both game mechanics and real-world systems thinking.

**UI Annotations:**
- **Tablet layout:** Board and workbench split 50/50, larger touch targets, blueprint card text at 18px minimum
- **Filipino naming in blueprint field:** Text field accepts unicode, "Mataan" and "Malakas" display correctly with no length truncation
- **Production queue alternation:** Visual alternation of two distinct blueprint icons on conveyor belt, audible rhythm change (two tones instead of one)

---

## New Aspects Discovered

1. **5.04a-i — The "template → blueprint" upgrade metaphor:** Exact design of the morphing text animation and the pedagogical mapping between pre-Mission 5 templates and post-Mission 5 blueprints; when does the metaphor help vs. mislead (templates are passive, blueprints are active); interaction with veteran fast-track (skip the metaphor if player demonstrates factory understanding)

2. **5.04a-ii — The Scouted Sandbox variant:** Ghost enemy projections in the sandbox as strategic context; should ghost enemies show exact types (scout vs. striker silhouettes) or just position/count; interaction with the locked "invisible randomization" spec (ghost enemies reveal information about a specific scenario seed)

3. **5.04a-iii — The Handcrafted Victory badge and pre-placed-alongside-factory design:** Full design of the "beat the factory mission without the factory" achievement path; when should pre-placed units coexist with factory production (Mission 5 only? Missions 5-7?); the community challenge layer that emerges from optional factory usage

4. **5.04a-iv — Production queue visual rhythm as teaching signal:** The conveyor belt's audible and visual rhythm (KA-CHUNK every 5 ticks) as the factory's heartbeat; monoculture monotony (same icon repeating) vs. diverse rhythm (alternating icons); the rhythm change as the moment the player "hears" that their army is diverse

5. **5.04a-v — The designed-failure detection heuristic for fast-track:** How the expert fast-track system detects that a player already understands the monoculture problem (e.g., switches unit type between attempt 1 and attempt 2 without prompting); when to skip the designed failure cycle and unlock the second blueprint slot immediately; preventing false positives (player switching unit type out of random experimentation vs. strategic understanding)

---

## Comparable Games Summary

| Game | Relevant Pattern | Application to Mission 5 |
|------|-----------------|--------------------------|
| **Factorio** | Need precedes tool — manual tedium creates desire for automation | Monoculture failure creates desire for blueprint diversity |
| **Into the Breach** | One new enemy type per island, interface constant | Factory changes the interface (new tabs, queue strip) — violates the ItB principle, must be managed carefully |
| **Portal** | One mechanic per chamber, no two-concept chambers | Split approach follows this strictly; others violate it |
| **Dark Souls** | Designed unwinnable first encounter teaches the game's core lesson | Monoculture failure teaches "diversity is survival" through death |
| **Celeste** | Assist Mode offers tools without judgment | Optional factory is available without stigma |
| **Besiege/KSP** | Build in sandbox, deploy for real | Sandbox approach directly mirrors this cycle |
| **Slay the Spire** | Card draft (individual) → deck synergy (system) | Blueprint design (individual) → production queue (system) |
| **XCOM 2** | Soldier customization → squad composition | Unit configuration → army production |

---

## The TikTok Clip

**The "Handcrafted Victory" clip (15 seconds):**
Tick 40. Three pre-placed units are surrounded. 8 enemies closing in. Buffer bars flickering between blue and amber. A scout evades between two enemies with a pixel-perfect dodge. A relay compresses three simultaneous threat reports into one surgical signal. The signal reaches the lone striker at tick 43. The striker pivots. Adjacent attack. One-shot kill. Then another. Then the final enemy. Victory. Camera pulls back to reveal the IDLE factory — untouched, doors closed, conveyor belt still. Text overlay: "Beat the factory mission. Without the factory." Badge flash: silver wrench.

Someone in the comments: "Wait, you're supposed to use the factory??"
