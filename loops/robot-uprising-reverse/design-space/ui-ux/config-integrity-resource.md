# Config Integrity as a Persistent Resource

**Aspect:** 4.10 — Config integrity as a persistent resource: the "integrity %" as a cross-mission resource; some missions degrade it more, repair actions restore it; trade-off between speed and thoroughness of pre-mission audits; does low integrity persist into next mission if unaddressed?

**Related:** 4.04 — Debrief Screen; 5.01 — Campaign Structure; 5.02 — Progression System; 4.01 — Plan Phase Layout; 2.01 — Context Window Model; 4.04b — Two-Act Debrief Structure

---

## The Core Design Problem

Most strategy games treat each mission as a clean slate. You bring your loadout, you fight, you win or lose, and the next mission starts fresh. The only persistence is what you've unlocked. Config integrity introduces a different kind of persistence — **entropy**. Your blueprints degrade. The wiring gets noisy. The rules drift. Every mission fought introduces micro-corruptions into your agent architectures, and unless you spend time (and potentially resources) auditing and repairing them between missions, you carry that damage forward.

This creates a fundamentally different campaign rhythm. Instead of "mission → reward → next mission," the loop becomes "mission → damage assessment → repair/audit decision → next mission." The player is now managing the health of their own engineering artifacts, not just the outcomes of battles. This is deeply resonant with real-world agentic engineering: production systems degrade, configs drift, technical debt accumulates. The question is whether this resonance translates into something that *feels good to play* or just feels like maintenance work.

The design challenge is making integrity management feel like a meaningful strategic choice rather than a tax. The player should sometimes *choose* to deploy a degraded architecture because the repair cost (time, resources, opportunity) isn't worth it. Other times, skipping the audit should feel like gambling — thrilling when it works, painful when a corrupted rule causes a scout to freeze at the wrong moment.

---

## Mechanical Model: "The Drift Engine"

### How Integrity Works

Each blueprint has an **integrity percentage** (0-100%). New blueprints start at 100%. Integrity degrades through:

1. **Combat stress** — Every mission fought reduces integrity of all deployed blueprints by 5-15%, scaled by mission intensity (number of ticks, enemy signal density, context overloads suffered). A clean sweep with no overloads might cost 5%. A brutal 80-tick slog with three overloaded units costs 15%.
2. **Hook strain** — Blueprints with more active hooks degrade faster. A scout with 2 hooks loses 2% more per mission than one with 1 hook. Relays with 4 hooks bleed integrity quickly. The more complex the wiring, the faster it frays.
3. **Context overload events** — Each time a unit running this blueprint gets stunned from context overload during a mission, the blueprint takes an additional 3% integrity hit. The metaphor: the system crashed and came back, but something's subtly wrong now.

### What Low Integrity Does

Integrity doesn't cause catastrophic failure — it introduces **noise**. At various thresholds:

- **90-100%**: No effect. Clean config.
- **75-89%**: "Drift zone." One randomly selected rule in the blueprint has its priority shifted by ±1 position at mission start. The player sees which rule drifted in the pre-mission briefing but can't fix it without an audit. A subtle yellow caution triangle appears on the blueprint icon.
- **50-74%**: "Degraded." Two rules may drift. One hook has a 20% chance of firing 1 tick late (added latency). Context eviction priority may not follow configured order. The blueprint icon shows an orange warning badge with the percentage.
- **25-49%**: "Critical." Three rules may drift. Hooks may fire late or miss entirely (30% failure rate). Context window effectively shrinks by 1 slot (permanent noise occupying a slot). The icon pulses red. An overlay on the unit tile during sealed watch shows static-like jitter.
- **0-24%**: "Corrupted." The blueprint is unreliable enough that it should be rebuilt from scratch. Rules fire in near-random order. Hooks are 50/50. Context window loses 2 slots. The portrait glitches visually — scan lines, color shifts, pixel displacement.

### Repair Mechanics

Between missions, the player has access to an **Audit Station** — a screen showing all blueprints in a horizontal row, each displayed as a card with its integrity bar. The player can:

1. **Quick Patch** (free, 1 click per blueprint): Restores 10% integrity. Takes no campaign time. Available once per blueprint per mission interval. The metaphor: restarting the service.
2. **Standard Audit** (costs resources, per blueprint): Restores integrity to 90%. Costs minerals proportional to blueprint complexity (hooks × 2 + rules × 1 + skills × 1). Takes 1 "campaign tick" — meaning the enemy also advances on the campaign map, potentially fortifying the next mission. The metaphor: running the test suite.
3. **Deep Audit** (expensive, per blueprint): Restores to 100%. Costs 2x the standard audit price. Takes 2 campaign ticks. The metaphor: full refactor with code review.
4. **Rebuild** (most expensive): Destroy the blueprint and recreate it from scratch at 100%. Loses any mission-specific tuning. Costs the original build cost. No campaign time. The metaphor: rewriting from scratch.

### The Strategic Tension

The cost structure creates a genuine dilemma:

- **Speed vs. thoroughness**: Quick patching is free but only buys time. Standard audits cost resources you could spend on new blueprints. Deep audits cost resources AND time, letting the enemy prepare.
- **Portfolio management**: With 3-5 blueprints in your army, you can't audit everything every mission. Which blueprints are worth maintaining? Maybe the relay that survived the whole match is fine at 82%, but the striker that got overloaded three times is at 55% and critical.
- **Acceptable degradation**: Some missions are easy enough that running degraded blueprints is fine. A drift in rule priority might not matter if you're stomping. But the next mission might be the one where that drifted rule causes your relay to broadcast before filtering, flooding your strikers with raw noise.
- **Rebuild calculus**: Is it cheaper to patch a 30% integrity blueprint three times or just rebuild it? The rebuild loses tuning. The patches cost cumulative resources. There's no obviously correct answer.

---

## Visual Design: The Audit Station

### Layout

The Audit Station appears between missions, inserted into the campaign flow after the debrief and before the next mission briefing. It's a full-screen panel with the campaign map dimly visible behind it through a frosted-glass effect.

**Top bar**: "SYSTEM INTEGRITY AUDIT" in the boot-log monospace font (Fira Code or similar), left-aligned. Right side shows available resources (minerals, energy) and campaign clock ("Enemy fortification: +1 per tick spent").

**Center**: A horizontal conveyor belt — the same visual metaphor as the production queue. Each blueprint sits on the belt as a card showing:
- Unit portrait (top half of card)
- Blueprint name (below portrait)
- Integrity bar (vertical thermometer on left edge of card)
- Integrity percentage in large numerals
- Condition label: "Clean" (cyan), "Drifting" (yellow), "Degraded" (orange), "Critical" (red pulse), "Corrupted" (red with static overlay)
- A small list of active drift effects: "Rule 2 shifted +1", "Hook 'recon-net' latency +1 tick"

**Bottom panel**: When a blueprint card is selected (click or arrow keys), the bottom panel expands to show repair options as three horizontal buttons:
- **[QUICK PATCH]** — "Restore 10% | Free | No time cost" — always available once per interval
- **[STANDARD AUDIT]** — "Restore to 90% | Cost: 8m | +1 enemy fortification" — greyed out if insufficient resources
- **[DEEP AUDIT]** — "Restore to 100% | Cost: 16m | +2 enemy fortification" — greyed out if insufficient resources
- **[REBUILD]** — "Destroy and recreate | Cost: 12m | No time cost | Loses tuning" — always available

**Right edge**: A "DEPLOY AS-IS" button that skips all auditing and proceeds to the next mission. Below it, a summary: "Fleet integrity: 73% average. 2 blueprints degraded. Estimated mission risk: MODERATE."

### Integrity Bar Visual Treatment

The integrity bar is a vertical thermometer rendered on the left edge of each blueprint card. It's 6px wide and spans the full height of the card.

- **100-90%**: Solid cyan, steady glow. The bar is nearly full. A thin bright line at the current level.
- **89-75%**: Yellow-green gradient. The empty portion above the fill level is dark with a faint dashed outline showing where 100% would be. The fill line pulses subtly — a gentle breathing rhythm, one cycle per 3 seconds.
- **74-50%**: Orange gradient. The bar flickers occasionally — a brief (100ms) brightness spike every 8-12 seconds, randomized, like an electrical fault. The empty portion shows a noise pattern — tiny horizontal lines at random heights, like static on an old TV.
- **49-25%**: Red, pulsing at 1 cycle per second. The bar itself has visual artifacts — glitch lines that occasionally shift the bar left or right by 1-2 pixels for a single frame. The unit portrait above it develops scan lines.
- **24-0%**: Deep red, heavily glitched. The bar jumps erratically. The portrait is barely recognizable through the corruption artifacts. A low-frequency hum becomes audible when this card is selected — a discordant drone at the edge of hearing.

### Repair Animations

- **Quick Patch**: The integrity bar fills by 10% over 500ms with a satisfying cyan liquid-fill animation. A single "ping" sound — clean, metallic, brief. The card shakes once (2px horizontal) like tapping a stuck gauge.
- **Standard Audit**: A progress bar sweeps across the card from left to right over 1.5 seconds. Behind it, the portrait clears up, the integrity bar fills to 90%, and drift effects disappear one by one with small "resolved" checkmarks. Sound: a series of ascending tones, like a system boot sequence completing. The resource counter in the top bar ticks down.
- **Deep Audit**: Same as standard but 3 seconds, and the final frame includes a brief gold flash around the card border — "certified clean." Sound: the ascending boot sequence plus a final deep chord, satisfying and complete. Campaign clock advances with a subtle "tick-tock" sound.
- **Rebuild**: The card shatters into pixel fragments (300ms), the fragments swirl into a vortex (500ms), and a new clean card materializes from the center outward (400ms). Sound: a glass-break crunch, a whooshing spiral, then the clean boot chord. The portrait is pristine but the name resets to the default blueprint name, losing any custom naming.

---

## Interaction Effects

### With the Plan Phase

The plan phase workbench must surface integrity information. Each blueprint in the editor shows its integrity bar alongside the slot layout. If a rule has drifted, the drifted rule shows in its shifted position with a yellow highlight and a small arrow indicating where it *should* be. The player can see the damage but cannot fix it here — they have to go back to the Audit Station (which costs a campaign action) or accept the drift.

This creates pressure during planning: "Do I redesign my architecture to work *with* the drift, or do I spend resources fixing it?" A drifted rule might accidentally create a better priority order. A player who notices this has discovered emergent gameplay from the integrity system.

### With the Sealed Watch

During battle, units running degraded blueprints show visual indicators:
- **Drifting (75-89%)**: A subtle yellow-green tint on the unit's context bar. Barely noticeable unless you're looking.
- **Degraded (50-74%)**: An orange flicker on the unit's tile border, once every 5-10 ticks. Visible enough to cause anxiety.
- **Critical (25-49%)**: Persistent jitter on the unit sprite — 1px random displacement each tick. The unit looks like it's vibrating, unstable. Context bar flashes red occasionally.
- **Corrupted (0-24%)**: Full scan-line distortion on the unit sprite. The unit looks like it's being received through a bad signal. Other players watching over your shoulder would say "that one looks broken."

During the sealed watch, when a degraded blueprint causes a visible malfunction — a hook fires late, a rule mismatch causes unexpected behavior — the moment is marked with a small orange diamond on the timeline. This gives the player a breadcrumb for the debrief: "something went wrong at tick 23 because of integrity issues."

### With the Campaign Map

On the campaign map, each completed province could show the integrity cost it inflicted. Hover over a completed province: "Ifugao — 8% average integrity cost." This retroactive information helps the player plan their route — if they can see that jungle missions are harder on integrity than urban missions, they might sequence their campaign differently.

Enemy fortification from audit time is visible on the campaign map. Uncompleted provinces glow brighter / show more enemy unit silhouettes as fortification increases. This makes the time cost of auditing viscerally legible: "I spent 3 ticks auditing, and now Manila has two more enemy strikers."

### With the Debrief

The inspector gains an "Integrity Impact" tab showing exactly how much integrity each blueprint lost this mission and why. A breakdown: "SCOUT-ALPHA: -12% total. Combat stress: -7%. Hook strain: -3%. Overload events (×1): -3%." This data informs the audit decision — if most damage came from overload events, maybe the fix is better context filtering, not an expensive audit.

---

## Player Journeys

#### Journey: Priya, 28, DevOps Engineer

**Context:** Mission 6. She's completed 5 missions and just unlocked the Command agent. Her scout blueprint "Whisper" is at 71% integrity after two missions without auditing. Her relay "Hub" is at 85%. Her striker "Fang" is at 92%.

**Minute 0:00 — The Audit Station**
The campaign map fades to a frosted blur behind the Audit Station panel. Three blueprint cards sit on the conveyor belt. Priya's eyes go straight to "Whisper" — the scout card is bathed in orange light, its integrity bar flickering with occasional glitch spikes. The percentage reads "71%" in large numerals. Below the portrait, two drift effects are listed: "Rule 2 (evade-if-adjacent) shifted to priority 4" and "Hook 'recon-net' latency +1 tick."

She clicks the card. The bottom panel slides open with the repair options. Standard Audit: 6m, +1 enemy fortification. She checks the top bar — 22 minerals available. She has enough, but she's planning to build a Command agent next mission (10m cost). The math is tight.

**Minute 0:45 — The Calculus**
She hovers over "DEPLOY AS-IS." The summary reads: "Fleet integrity: 83% average. 1 blueprint degraded. Estimated mission risk: MODERATE." She thinks about it. The rule drift moved her evade priority from 2 to 4 — that means Whisper will try to broadcast and patrol before evading. In the last mission, Whisper was never in danger, so maybe that's fine? But Mission 6 introduces the Command agent, and she doesn't know the map layout yet.

She clicks the mission briefing preview (a small "?" icon in the top-right). The briefing shows Manila — dense urban terrain, tight corridors, high enemy density. Whisper is going to be in danger constantly.

**Minute 1:15 — The Quick Patch Compromise**
She can't afford the standard audit without sacrificing her Command agent build. She clicks "QUICK PATCH" on Whisper. The bar fills from 71% to 81% with a cyan liquid animation and a satisfying ping. The condition label shifts from "Degraded" (orange) to "Drifting" (yellow). One of the two drift effects resolves — the hook latency is fixed — but the rule drift remains. She'll have to work around Rule 2 being at priority 4.

She clicks "DEPLOY AS-IS." The Audit Station slides away. She's heading into Manila with a drifting scout, a slightly worn relay, and a clean striker. She feels the weight of the gamble. It's the same feeling as deploying code on a Friday afternoon — probably fine, but if it's not fine, it's going to be really not fine.

**Minute 1:30 — Adaptation in Planning**
In the plan phase, she opens Whisper's blueprint. Rule 2 (evade-if-adjacent) sits at priority 4, highlighted in yellow with a small downward arrow. She considers reworking the rule order to accommodate the drift — but she can't. The game doesn't let her modify rule order for free when it's caused by integrity drift. She'd need to do a full audit. Instead, she adds a new hook: "if health-signal received → prioritize evade for 3 ticks." A creative workaround. The integrity system forced her to innovate rather than just fix.

**Minute 6:00 — The Consequence**
During the sealed watch, tick 31. Whisper is adjacent to an enemy striker. The rule priority should trigger evade, but it's at priority 4. Rules 1-3 fire first: patrol, broadcast, filter. Whisper broadcasts instead of evading. The enemy striker eliminates Whisper. The tile flashes red. Priya's stomach drops. She sees the orange diamond appear on the timeline at tick 31 — the integrity marker.

In the debrief, she clicks the orange diamond. The Decision Trace shows: "Rule 1 (patrol) — no match. Rule 2 (broadcast-if-data) — MATCH. Action: broadcast on recon-net. Rule 3 (filter) — skipped (action taken). Rule 4 (evade-if-adjacent) — SKIPPED." The yellow "DRIFTED" label sits next to Rule 4. She sees exactly how the integrity failure killed her scout.

**Minute 8:00 — Resolution**
She wins the mission anyway — the Command agent compensated — but Whisper's blueprint is now at 63%. She knows she can't skip the audit again. In the next Audit Station, she pays for the standard audit without hesitation. The ascending boot tones play as Whisper's card clears up. 6 minerals well spent.

**UI Annotations:**
- Integrity bar: 6px vertical thermometer on left edge of blueprint card. Orange flicker at 71%, cyan steady glow after quick patch to 81%.
- Drift effects list: Small monospace text below portrait, each effect on its own line. Yellow text.
- Quick Patch button: Leftmost of four horizontal buttons in bottom panel. Green border. "Restore 10% | Free | No time cost."
- Orange diamond on timeline: 8px diamond shape, appears at tick of integrity-caused malfunction. Click to jump to Decision Trace.
- Drifted rule in plan phase: Yellow highlight on rule row, small downward arrow icon showing original position.

---

#### Journey: Marco, 34, High School Teacher (Strategy Game Novice)

**Context:** Mission 4. This is his first encounter with integrity degradation. He's been running the same three pre-configured blueprints since Mission 1 without modification. The tutorial hasn't mentioned integrity yet — it's about to.

**Minute 0:00 — The First Warning**
After completing Mission 3's debrief, the campaign map appears. But instead of the usual "SELECT NEXT MISSION" prompt, a new screen slides in. The boot-log font types out across the top: "SYSTEM INTEGRITY AUDIT INITIALIZED..." line by line, each line appearing with a soft typewriter click. Then: "WARNING: Configuration drift detected in 2 subsystems."

Marco's blueprint cards appear on the conveyor. His scout "UNIT-S" shows 82% with a yellow caution triangle. His striker "UNIT-K" shows 78% with a yellow triangle. His relay "UNIT-R" is at 91% — still in the clear.

**Minute 0:30 — Learning the System**
A diegetic tutorial message appears — not a popup, but a boot-log-style text panel in the top-left: "ADVISORY: Unit configurations degrade under combat stress. Degraded configurations exhibit priority drift — rules may execute in unexpected order. Recommended action: perform system audit before next deployment."

Marco clicks UNIT-S. The bottom panel reveals the repair options. He reads each one carefully. Quick Patch is free — he clicks it immediately. The cyan fill animation plays, 82% rises to 92%. The caution triangle disappears. He feels relief, like clearing a notification.

He clicks UNIT-K at 78%. Quick Patch again — 78% to 88%. Still in the yellow zone but the triangle shrinks to a thin outline. He notices the Standard Audit option: "Restore to 90% | Cost: 6m." He has 15 minerals. He decides to save them — 88% seems fine, and the tutorial said 75% is when things start drifting.

**Minute 1:15 — The Safe Choice**
He clicks "DEPLOY AS-IS." The summary reads: "Fleet integrity: 90% average. 0 blueprints degraded. Estimated mission risk: LOW." He feels good. The system seems manageable — just click Quick Patch after every mission and you're fine.

**Minute 5:00 — The Lesson Deferred**
Mission 4 goes smoothly. In the post-mission Audit Station, all blueprints are between 80-87%. He Quick Patches everything. 90%+ across the board. He hasn't yet experienced what real degradation feels like, and that's intentional — the tutorial introduces the system gently, letting him build a Quick Patch habit before the later missions stress the system hard enough for it to matter.

**Minute 8:00 — Resolution**
Marco finishes Mission 4 feeling like he understands integrity: "It's like oil changes for your robots." He doesn't yet realize that Missions 5-6 will degrade blueprints much faster (factory production means more units, more hooks, more combat stress), and Quick Patching won't be enough. But the habit is established. When the crisis comes, he'll understand what went wrong and know where to find the fix.

**UI Annotations:**
- Boot-log initialization: Monospace text appearing line-by-line at top of screen. Each line takes 200ms to type out. Green text on dark background.
- Tutorial advisory: Left-aligned text panel, same boot-log font, bordered with a thin cyan line. Appears for 10 seconds, then fades to a small "i" icon that can be clicked to re-read.
- Quick Patch feedback: Card shake (2px horizontal, 100ms) followed by integrity bar fill animation (500ms). "Ping" sound: 800Hz to 1200Hz sweep, 200ms duration, clean sine wave.
- Mission risk summary: Bottom-right of Audit Station. Risk label color-coded: LOW (cyan), MODERATE (yellow), HIGH (orange), CRITICAL (red pulse).

---

#### Journey: Kai, 22, Computer Science Student and Factorio Veteran

**Context:** Mission 8. Deep into the factory-vs-factory arc. Kai runs 5 blueprints with complex hook networks. He's been aggressively skipping audits to rush through the campaign, spending all minerals on production. His fleet integrity is atrocious: Scout-A 45%, Scout-B 62%, Relay-Core 38%, Striker-X 71%, Command-Prime 55%.

**Minute 0:00 — The Reckoning**
The Audit Station opens and it's a wall of red. Three of five blueprint cards pulse with red integrity bars. Relay-Core at 38% has full scan-line distortion on its portrait — the unit image is barely recognizable through horizontal interference lines and pixel displacement. The condition label reads "CRITICAL" in red, pulsing once per second. Listed drift effects scroll past the card boundary — there are five of them, including "Context window -1 slot" and "Hook 'data-pipe' 30% failure rate."

Command-Prime at 55% shows the orange degraded state. Its four hooks are listed with latency warnings on two of them. The integrity bar flickers with irregular brightness spikes.

Kai's available resources: 41 minerals. He does the math in his head. Standard audit for all five would cost roughly 35m. He'd have 6m left — not enough to build replacement units if anything dies next mission. Deep audit for Relay-Core alone would cost 14m and 2 campaign ticks, letting the enemy fortify Taal (the final mission).

**Minute 0:45 — Triage**
He decides to play doctor. Relay-Core is the most critical — 38% means its 4-hook relay architecture is basically non-functional. 30% hook failure rate on the primary data pipe means his entire signal chain is unreliable. He clicks Relay-Core and selects "REBUILD." The card shatters into pixel fragments with a glass-break crunch. The fragments spiral into a vortex. A new clean card materializes — "RELAY (default)" at 100%, all four hook slots empty. The portrait is pristine, but it's a blank slate. He just lost all the custom hook wiring he spent three missions tuning.

Cost: 5m for the relay rebuild. 36m remaining.

**Minute 1:30 — The Rebuild**
He'll have to re-wire the relay from scratch in the plan phase. This is the hidden cost of letting integrity collapse — yes, a rebuild restores 100%, but you lose your configuration. And for a Relay with 4 hooks, the configuration IS the unit. An unconfigured relay is just a stationary box.

He Quick Patches the remaining four blueprints. Scout-A: 45% → 55%. Scout-B: 62% → 72%. Striker-X: 71% → 81%. Command-Prime: 55% → 65%. Not great. Scout-A and Command-Prime are still degraded. But he can't afford more.

**Minute 2:00 — The Gamble**
He checks the summary: "Fleet integrity: 75% average. 2 blueprints degraded. 1 blueprint unconfigured. Estimated mission risk: HIGH." The deploy button seems to dare him. He clicks it.

In the plan phase, he spends 4 minutes re-wiring the rebuilt relay. He can't remember the exact hook configuration he had before — was data-pipe the compress→forward chain, or was it the filter→amplify chain? He rebuilds it from memory, probably getting it 80% right. The integrity system just punished him for neglect by erasing institutional knowledge. It's the software engineering equivalent of losing your config files and recreating them from memory.

**Minute 8:00 — The Battle and Its Scars**
Mission 8 is brutal. Scout-A's degraded rules cause it to patrol into an enemy cluster instead of evading — eliminated on tick 15. Command-Prime's hook latency means its "reassign" command arrives 1 tick late, and a striker repositions into a kill zone. The rebuilt relay works perfectly at 100% integrity but with slightly wrong configuration — it amplifies signals it should be filtering, flooding the remaining striker with noise and causing a context overload stun on tick 22.

In the debrief, Kai counts the orange diamonds: five integrity-related malfunctions. His Decision Trace reads like a bug report: "Expected: evade. Actual: patrol. Cause: Rule drift (integrity 55%)." He's reading his own incident postmortem.

**Minute 12:00 — Resolution**
He barely wins. In the next Audit Station, he spends 28m on standard audits for everything. He leaves himself with just 8m for production. For the first time in the campaign, he treats integrity maintenance as a first-class expense, not an afterthought. The feeling is identical to the first time a junior developer sees a production outage caused by config drift and starts taking infrastructure maintenance seriously.

**UI Annotations:**
- Critical integrity card: Red pulsing border (1 cycle/sec). Portrait with horizontal scan lines (2px spacing, 50% opacity black lines scrolling slowly upward). Integrity bar jitters ±1px randomly each frame.
- Rebuild animation: (1) Card shatters into 12-16 pixel fragments (300ms, glass-break crunch sound). (2) Fragments spiral clockwise into center vortex (500ms, whooshing sound). (3) New card materializes from center outward as concentric rectangles expanding (400ms, clean boot chord). Total: 1.2 seconds.
- Drift effects overflow: When more than 3 drift effects exist, the list shows 3 with a "+2 more" collapsed label. Click to expand. Each effect is a single line in monospace: icon + description. Hook failures show a broken-chain icon. Rule drifts show a shuffle-arrows icon. Context loss shows a shrinking-window icon.
- HIGH risk label: Orange text, pulsing glow. The word "HIGH" is larger than "Estimated mission risk:" — emphasis on the danger.
- Orange diamonds in debrief: Clustered on timeline. When 3+ diamonds are within 5 ticks of each other, they merge into a larger orange bar segment on the timeline labeled "INTEGRITY CASCADE."

---

#### Journey: Amara, 40, Project Manager and Casual Gamer

**Context:** Mission 7. She plays methodically, auditing after every mission. Her fleet is always above 85%. She's about to learn that over-auditing has its own cost.

**Minute 0:00 — The Routine**
The Audit Station opens. All five blueprint cards glow in healthy cyan-to-yellow range: 88%, 91%, 85%, 93%, 87%. Amara does what she always does — standard audit on anything below 90%. Three blueprints qualify. Cost: 6m + 7m + 8m = 21 minerals. She has 30m.

She clicks through: Standard Audit on Scout (ascending tones, bar fills to 90%, drift effects clear). Standard Audit on Relay (ascending tones, bar fills to 90%). Standard Audit on Striker (ascending tones, bar fills to 90%). Each audit costs +1 enemy fortification. Three audits = 3 campaign ticks. The campaign clock advances three times with quiet tick-tock sounds.

**Minute 1:00 — The Cost Revealed**
She deploys and reaches the mission briefing. The mission description reads: "Cebu — Urban Warfare." But below the terrain description, a new line she hasn't seen before: "ENEMY FORTIFICATION: Level 3. +2 enemy strikers, +1 enemy relay." The enemy has been preparing while she's been auditing.

She's spent 21 minerals and given the enemy three preparation ticks. If she'd deployed at 85-88% integrity — well within the safe "drift zone" — she'd have 21 more minerals for production and face 3 fewer enemy units.

**Minute 3:00 — The Realization**
The mission is harder than expected. Not because her blueprints are degraded — they're pristine — but because she's outnumbered. The extra enemy relay is flooding her units with noise signals. The extra strikers are flanking positions her scout can't cover alone. She has 9 minerals for production; if she had 30, she could build two more strikers to match.

She loses. The defeat screen shows her army health graph cratering at tick 34 when the fortified enemy overwhelmed her positions.

**Minute 5:00 — The Debrief Lesson**
In the debrief, she pulls up the Integrity Impact tab. Her blueprints took modest damage: 6-9% each. She would have been at 76-82% even without auditing — firmly in the "drifting but functional" zone. The standard audits were unnecessary. She spent 21 minerals and 3 campaign ticks fixing a problem that wasn't a problem.

She retries Mission 7. This time, at the Audit Station, she Quick Patches everything (free, no time cost) and deploys immediately. 21 minerals in the bank. No enemy fortification. She wins with 8 minerals to spare.

**Minute 8:00 — Resolution**
Amara has learned the system's real lesson: integrity management is not "always fix everything." It's about acceptable risk. The 75-89% zone exists for a reason — it's the zone where drift is present but manageable, and the cost of fixing it may exceed the cost of living with it. She starts treating integrity like a budget line item, not a binary clean/dirty status. This is the project manager in her: risk management, not risk elimination.

**UI Annotations:**
- Enemy fortification counter: Displayed as a small shield icon with a number on the campaign map, next to each uncompleted province. Each +1 adds a red pip to the shield. Hovering shows: "Fortification Level 3: +2 Strikers, +1 Relay added to enemy forces."
- Campaign clock advance: When an audit costs campaign time, a clock icon in the top-right ticks forward. Each tick produces a "tock" sound and the enemy fortification counter on the next mission's province increments visibly. The connection between "I'm auditing" and "the enemy is preparing" is immediate and visceral.
- Retry comparison: On mission retry, the Audit Station re-appears with the same pre-retry integrity values. The player can make different audit choices on retry, testing the hypothesis that less auditing = better outcome.

---

## Strengths

1. **Teaches real engineering principles.** Config drift, technical debt, maintenance vs. feature velocity, acceptable risk — these are directly transferable concepts. A player who learns to manage integrity in Robot Uprising has internalized something about production system maintenance.

2. **Creates campaign-level strategic decisions.** Most strategy games have per-mission decisions. Integrity adds cross-mission decisions: "Do I invest in maintenance now or accept risk for speed?" This gives the campaign a through-line of cause and effect that pure level-to-level progression lacks.

3. **Punishes neglect without being punitive.** The degradation is gradual, visible, and repairable. Players get warnings before failures. The system doesn't randomly destroy your army — it introduces noise that makes your architecture less reliable. The metaphor is accurate: neglected systems don't explode, they drift.

4. **Creates emergent gameplay from failure.** A drifted rule might accidentally create a better priority order. A context window shrink might force a unit to be more selective, actually improving performance. These happy accidents reward players who pay attention.

5. **The TikTok clip.** A player deploys at 38% integrity. The relay portrait is glitching with scan lines. During the sealed watch, the relay's hooks misfire visibly — signals spark and fizzle, the unit jitters on its tile. The player's chat explodes. "IT'S SO COOKED." The visual degradation is inherently shareable — it looks dramatic and tells a story.

## Weaknesses

1. **Maintenance tax risk.** If integrity degrades too fast, auditing becomes mandatory busywork every mission. The system is only interesting when auditing is a genuine choice, not a requirement. Tuning the degradation rates is critical — too fast feels punitive, too slow feels irrelevant.

2. **Complexity for new players.** Integrity is another system to learn on top of rules, hooks, context, and production. The tutorial deferral (introduced Mission 4, consequences Mission 5+) helps, but the Audit Station is still another screen with another resource trade-off.

3. **Campaign time as a cost is novel and potentially confusing.** "The enemy fortifies while you audit" is a great mechanic but requires players to understand a strategic cost that has no immediate feedback. The consequence only becomes visible at mission start, which is temporally distant from the audit decision.

4. **Rebuild memory loss is harsh.** Losing all custom configuration on a rebuild punishes long-running blueprints disproportionately. A relay that took 5 minutes to wire perfectly is devastating to lose. This might feel unfair rather than strategic. Mitigation: offer a "blueprint snapshot" system that saves configurations for later restoration (at no integrity cost).

5. **Optimal strategy might be boring.** If Quick Patch after every mission keeps integrity above 75% reliably, the optimal play is "always Quick Patch, never think about it." The system must be tuned so that Quick Patching alone is insufficient for missions 6+ — forcing actual audit decisions.

---

## Comparable Games

**XCOM 2 — Soldier Wounds and Fatigue.** Soldiers who survive missions may be wounded, requiring recovery time in the barracks. During recovery, they're unavailable for missions. Players must manage a roster, rotating soldiers to avoid fielding exhausted/wounded teams. The parallel to integrity is direct: your "blueprints" (soldiers) degrade from use, and repair (recovery) costs time during which threats advance. XCOM's system works because recovery is deterministic and visible — you know exactly how long each soldier will be out. Robot Uprising's integrity system should maintain this transparency.

**FTL: Faster Than Light — Hull Damage.** Your ship carries hull damage between encounters. Repair costs scrap (the universal currency). The trade-off between repairing hull and buying new weapons is central to FTL's economy. FTL's lesson: the repair/upgrade tension is most interesting when both options are good. If repair is always correct, the choice disappears. If upgrading is always correct, repair feels like a waste.

**Darkest Dungeon — Stress and Afflictions.** Heroes accumulate stress across dungeon runs. At 100 stress, they gain an affliction (negative trait) that persists until treated in town. Treatment costs gold and time (the hero misses the next expedition). The parallel: afflictions are like drift effects — persistent negative modifications that accumulate from use. Darkest Dungeon's system is deliberately punishing, creating a revolving-door roster. Robot Uprising should be less punishing — integrity is a pressure, not a death sentence.

**Slay the Spire — Curse Cards.** Curses are negative cards permanently added to your deck. They dilute your draws and have bad effects. There's no way to remove them without specific rare events. The integrity system is like a version of curses that can be removed (for a cost). The lesson: persistent negative effects are interesting when the player can evaluate whether the cost of removal is worth it versus playing around the effect.

---

## Sensory Summary

The Audit Station's soundscape is a workshop hum — a low-frequency background tone like a data center's air conditioning, punctuated by the clean mechanical sounds of repair actions. The visual palette shifts from the campaign map's warm gold tones to a cooler blue-grey diagnostic aesthetic. Healthy blueprints glow in steady cyan; damaged ones flicker and pulse in escalating warmth from yellow through orange to angry red. The most degraded blueprints emit visual artifacts that bleed past their card boundaries — scan lines that cross into adjacent cards, pixel displacement that makes the whole row feel unstable. The overall feeling is a maintenance bay between sorties: the battle is over, the machines are cooling, and you're walking the line deciding what to fix before the next one.
