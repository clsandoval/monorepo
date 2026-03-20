# 3.01a — Skill Parameterization Depth: The Tuning Knob Spectrum

## Overview

Every skill in Robot Uprising does something — patrol moves, compress merges, hack reads. But *how much*, *how fast*, *under what thresholds*? The parameterization depth of skills determines whether the workbench is a light switch (binary on/off) or a mixing console (continuous behavior curves). This is not a small decision. It defines the mastery ceiling, the tutorial slope, the workbench screen real estate, and whether a veteran player's relay feels meaningfully different from a beginner's relay running the same skill set.

The locked design gives each unit type a fixed skill roster. The open question: once a skill is equipped, how much can the player tune it?

---

## Design Options

### Option A: "The Light Switch" — Binary On/Off

Skills are either active or inactive. No parameters. Patrol patrols at one speed along the defined waypoint path. Compress fires at a fixed threshold. Amplify always boosts to the same priority level. The workbench skill section is a row of toggle switches.

**Mechanical definition:** Each skill has exactly one behavior. `patrol: ON` means the scout follows its waypoint loop at full speed, observing everything in its 5-tile radius. `compress: ON` means the relay compresses every 3 matching entries (fixed). No sliders, no thresholds, no curves.

**Where depth lives:** Since skills can't be tuned, ALL behavioral nuance must come from rules, hooks, and context config. Want compress to fire at 2 instead of 3? Write a rule that manually triggers compression by sending a special signal. Want patrol to slow down near enemy territory? You can't — but you can write a rule that switches the scout to evade-only when threat density is high.

**Strengths:** Absolute minimum workbench complexity. A new player sees 2-3 toggles and understands immediately. Zero parameter-related bugs. The skill section fits in 80px of vertical space. The game feels decisive — you're choosing WHAT, never fiddling with HOW MUCH.

**Weaknesses:** Ceiling is lower than it needs to be. Veteran players feel constrained. The relay skill chain (compress, filter, amplify) has no internal tuning — every relay with the same skills behaves identically. The game pushes ALL complexity into rules, which may overload that subsystem. The "same blueprint, different behavior" promise of the workbench is partially broken.

### Option B: "The Tuning Bench" — 1-3 Slider Parameters Per Skill

Each skill has a small number of named parameters with bounded ranges. Patrol has a `speed` slider (1-3 tiles/tick) and a `coverage_mode` toggle (loop vs. ping-pong). Compress has a `threshold` slider (2-5 entries) and a `fidelity` toggle (lossy vs. lossless). Each parameter has a visible default that works out of the box.

**Mechanical definition for all 12 skills:**

| Skill | Param 1 | Param 2 | Param 3 |
|-------|---------|---------|---------|
| patrol | speed (1-3 tiles/tick) | coverage (loop/ping-pong) | — |
| evade | distance (1-2 tiles) | cooldown (0-2 ticks) | — |
| engage | priority (nearest/weakest/tagged) | — | — |
| breach | commit_duration (2-4 ticks) | — | — |
| compress | threshold (2-5 entries) | fidelity (lossy/lossless) | — |
| filter | strictness (exact/fuzzy match) | — | — |
| amplify | boost_level (1-3 priority tiers) | range (local/global) | — |
| hack | duration (1-2 ticks) | depth (buffer-only/buffer+rules) | — |
| extract | rate (1x-3x) | — | — |
| reassign | scope (single/group) | — | — |
| reroute | delay (0-1 ticks) | — | — |
| prioritize | eviction_mode (oldest/lowest-pri/random) | — | — |

**Where depth lives:** Parameters create meaningful tradeoffs within each skill. A scout with `speed: 3, coverage: loop` burns through its patrol fast but generates sparse observations. A scout with `speed: 1, coverage: ping-pong` covers less ground but sees the same area repeatedly, generating richer temporal data. Combined with rules and hooks, these parameters create a much wider behavior space.

**Strengths:** Each parameter teaches a real engineering concept (batch size, polling frequency, priority levels). The tuning bench invites experimentation. Two relays with the same skills but different compress thresholds produce visibly different signal chains. The workbench feels like calibrating instruments, which reinforces the "engineering workbench" fantasy.

**Weaknesses:** 1-3 parameters per skill across 3-5 equipped skills means 5-15 sliders per blueprint. The workbench skill section expands from 80px to 200-300px. New players may be intimidated by parameters they don't understand. Default values must be carefully chosen so uninstructed players still get functional behavior.

### Option C: "The Behavior Curve" — Fully Configurable Response Functions

Each skill has a response curve — a visual function editor where the player draws how the skill's intensity varies with context. Patrol speed as a function of nearby enemy count. Compress threshold as a function of buffer fill percentage. Amplify boost as a function of signal age.

**Mechanical definition:** Each skill parameter is not a single value but a piecewise-linear function. The workbench shows a small coordinate grid (64x64px per curve) where the X-axis is the input variable (buffer fill, enemy count, signal age) and the Y-axis is the output parameter. The player drags control points to shape the response. Default is a flat line at the default value.

**Where depth lives:** Everywhere. A patrol skill with speed that increases as buffer fill drops (scout speeds up when it has room for new data) creates an adaptive information gatherer. A compress skill with threshold that decreases under buffer pressure (compress more aggressively when the relay is overloaded) creates graceful degradation. Every skill becomes a tiny control system.

**Strengths:** Maximum mastery ceiling. Veteran players can encode sophisticated adaptive behavior directly into skills without writing complex rules. The curves are visually distinctive — you can screenshot a relay's compress curve and another player immediately understands your compression strategy. The Zachtronics histogram community (sharing optimization curves) translates directly.

**Weaknesses:** Catastrophic complexity cliff. A new player seeing a function editor for "patrol speed vs. nearby enemy count" has no frame of reference. The workbench skill section becomes enormous (64px × N curves per skill × 3-5 skills = 400-600px of just skill configuration). Mobile/controller adaptation is nearly impossible. The interaction between curves and rules becomes extraordinarily hard to debug — did the behavior come from the curve shape or the rule priority?

### Option D: "The Growing Dial" — Progressive Parameterization (RECOMMENDED)

Skills start as binary toggles (Mission 1-4). Parameters unlock as the campaign progresses — one slider at a time, introduced with a diegetic boot-log moment ("SUBSYSTEM UPDATE: compression threshold now adjustable. Previous fixed value: 3. Recommended range: 2-5."). By Mission 8-10, each skill has its full 1-3 parameters. Behavior curves are never exposed in the base game — they exist as a hidden "Advanced Mode" toggle for post-campaign Gauntlet players.

**The unlock sequence:**

| Mission | Unlock | Teaching Moment |
|---------|--------|-----------------|
| M1-2 | Binary only | "Skills are verbs. Turn them on." |
| M3 | Evade distance (1-2) | "Your scout evaded into a corner. What if it could jump farther?" |
| M4 | Compress threshold (2-5) | "Your relay compressed too soon. Wait for more data." |
| M5 | Engage priority, Amplify range | Factory introduces multi-unit. Targeting and broadcast range matter. |
| M6 | Patrol speed, Hack depth | "Your scout is too slow for this map." "Surface-level hack isn't enough." |
| M7-8 | Remaining params | Full tuning bench available. |
| M9-10 | All params + optional advanced mode | Behavior curves for Gauntlet prep. |

**Strengths:** No complexity cliff at any point. Each parameter is introduced when the player has the context to understand it. The workbench physically grows — the skill section at Mission 1 is 80px tall, at Mission 5 it's 180px, at Mission 10 it's 280px. This growth is visible progress. The advanced curve mode gives Zachtronics veterans their depth without imposing it on casual players.

**Weaknesses:** Implementation complexity — the workbench must support multiple rendering states per skill. Players who replay early missions with unlocked parameters may trivialize them (acceptable — they've earned it). The unlock sequence must be carefully designed so each new parameter is immediately useful on the mission that introduces it.

---

## Player Journeys

### Journey: Sofia, 15, First Strategy Game (Option D, Mission 4)

**Context:** Sofia has played Missions 1-3 with binary skill toggles. She understands skills as "things units do." Her relay has compress ON and filter ON. She just failed Mission 4 because her relay compressed scout reports too early — two-entry compressions created low-quality summaries that her striker couldn't act on.

**Minute 0:00 — The Boot Log Unlock**
The screen shows the boot log terminal, teal monospace text scrolling upward against a dark background. "RELAY SUBSYSTEM v1.2 — DIAGNOSTIC COMPLETE." A new line appears, each character printing with a soft typewriter tick: "COMPRESSION MODULE: threshold parameter now operator-adjustable." Then: "Previous: FIXED at 3 entries. Adjustable range: 2 through 5." A final line: "Higher threshold = higher fidelity. Lower threshold = lower latency." The boot log fades. Sofia's workbench reappears. On the relay blueprint, beneath the COMPRESS toggle (which is already ON), a new element has appeared: a horizontal slider labeled "THRESHOLD" with tick marks at 2, 3, 4, 5. It's set to 3 (the previous default) and glows with a soft gold "new" shimmer.

**Minute 0:15 — First Slider Interaction**
Sofia hovers over the slider. A tooltip appears: "Entries needed before compression fires. 2 = fast, rough summaries. 5 = slow, precise summaries." She remembers: last mission, two-entry compressions were useless. She drags the slider to 5. The number changes with a satisfying mechanical click at each detent. The relay's buffer preview (the tiny thermometer sidebar) updates — a faint annotation appears showing "compress fires here" at the 5-entry mark. She can SEE where in the buffer the skill will activate.

**Minute 0:45 — The Aha Moment**
Sofia drags the slider to 2, then back to 5, watching the "compress fires here" line move on the buffer preview. At 2, it fires near the bottom — almost immediately. At 5, it fires near the top — the buffer must be nearly full before compression kicks in. She thinks: "If my buffer is only 12 slots, and I need 5 entries of the same type before compressing... what if there are 3 different enemy types? I'd need 15 entries but only have 12 slots." She's discovered the batch-size vs. buffer-capacity tension without anyone explaining it.

**Minute 1:30 — Tuning and Testing**
She sets compress threshold to 4 — a compromise. Hits EXECUTE. During the sealed watch, she notices the relay behaving differently. It holds entries longer before compressing. When the four-entry compression fires, the resulting summary is visibly richer in the buffer bar — a wider, brighter pip than the old two-entry compressions. Her striker moves more decisively. She wins.

**UI Annotations:**
- **Threshold slider**: 120px wide horizontal slider, 4 detent positions (2/3/4/5), tick marks with numeric labels. Filled portion uses skill's signature color (blue-white for compress). Each drag step produces a tactile click sound (different pitch per value).
- **Buffer preview annotation**: A thin horizontal line across the thermometer sidebar at the threshold position. Label: "fires here →". Updates live as slider moves.
- **New element shimmer**: Gold glow on slider border for first 30 seconds after unlock. Fades to standard styling after first interaction.

---

### Journey: Marcus, 38, Factorio Veteran (Option D, Mission 8)

**Context:** Marcus has all parameters unlocked. He's building a three-relay intelligence pipeline for Mission 8 — a dense urban Manila map where enemies spawn from multiple factories. He has 6 scouts, 3 relays in a chain, 4 strikers, 1 command unit. He wants each relay to serve a different compression/amplification role.

**Minute 0:00 — The Parameter Differentiation**
Marcus opens Relay-A's blueprint. The skill section shows three active skills: COMPRESS (threshold: 4, fidelity: lossy), FILTER (strictness: exact), AMPLIFY (boost: 2, range: local). He changes compress to threshold: 2, fidelity: lossy — this relay is the "fast and dirty" front-line aggregator. Relay-B gets threshold: 5, fidelity: lossy — the "patient curator" that waits for rich data. Relay-C gets threshold: 3 with amplify boost: 3, range: global — the "broadcaster" that amplifies Relay-B's output to the entire network.

**Minute 1:00 — The Differentiation Payoff**
Three relays with identical skill sets but different parameters create a three-stage signal processing pipeline. Raw scout data hits Relay-A (fast, rough summaries). Relay-A's output feeds Relay-B (patient, waits for patterns across summaries). Relay-B's refined intelligence feeds Relay-C (broadcasts globally at max priority). Marcus has built a data pipeline. He grins — this is Factorio belts, but for information.

**Minute 2:30 — Inspector Validation**
After the sealed watch, Marcus opens Inspector. He scrubs to tick 22 where his striker made an unusual move. Clicking the striker reveals its decision trace: "Rule 3 matched: buffer contains [compressed, priority_3, source: relay-C]." He clicks the signal — it traces back through Relay-C (amplified tick 21) → Relay-B (compressed tick 19) → Relay-A (compressed tick 17) → Scout-2 (observed tick 15-16). Seven ticks of latency, but the signal that arrived was clean, precise, and high-priority. His pipeline worked. The Inspector shows each relay's parameter values at each stage — threshold 2 at Relay-A, threshold 5 at Relay-B, boost 3 at Relay-C. He screenshots it for his Discord.

**UI Annotations:**
- **Parameter comparison across blueprints**: When Marcus has multiple relay blueprints open (via split-mode drawer), identical skill names align horizontally. Different parameter values are highlighted with amber outlines — visual diff.
- **Signal provenance in Inspector**: Each buffer entry in the decision trace shows a small chain icon. Clicking it reveals the full processing chain with parameter values at each hop. Each relay node in the chain shows its active parameters as small labels.
- **Pipeline visualization**: In the hook visualization overlay, relay chain connections show signal processing annotations — "→ compress@2 → filter@exact → amplify@3 →" rendered as tiny labels on the dashed connection lines.

---

### Journey: Dr. Priya, 42, ML Researcher (Option C Advanced Mode, Post-Campaign Gauntlet)

**Context:** Priya has completed the campaign and is deep into Gauntlet competitive play. She's unlocked the Advanced Mode toggle (available post-campaign) which reveals behavior curves for each parameter. She's tuning a scout patrol for a Gauntlet map where enemy density varies dramatically between map quadrants.

**Minute 0:00 — Entering Curve Mode**
Priya clicks the tiny "⚙" icon next to the patrol SPEED slider. A 128x128px curve editor expands below the slider. X-axis: "nearby enemy count (0-6)." Y-axis: "tiles per tick (1-3)." The current flat line at speed=2 is rendered as a horizontal gray line. She clicks to add a control point at (0, 3) and another at (4, 1). The curve now shows: speed 3 when no enemies nearby, dropping to speed 1 when 4+ enemies are in range. The scout will sprint through empty zones and creep through contested areas.

**Minute 0:30 — Curve-Aware Preview**
The tactical board preview updates. The scout's planned patrol path now has variable thickness — thick/bright segments where the curve predicts high speed (empty zones), thin/dim segments where it predicts low speed (near known enemy spawners). Priya can see the expected behavior before executing. She adjusts the curve: at enemy count 2, she wants speed 2 (not the interpolated 2.33). She drags the midpoint down. The path preview updates in real time.

**Minute 1:30 — The Curve vs. Rule Tension**
Priya realizes she also has a rule: "IF threat_detected AND distance < 3 THEN evade." The rule fires at a fixed threshold regardless of her speed curve. At speed 3 (empty zone), the scout covers so much ground per tick that it enters and exits enemy perception radii faster — evade triggers less often. At speed 1 (contested zone), the scout lingers, and evade fires constantly. The interaction between the speed curve and the evade rule creates an emergent behavioral pattern: sprint-observe-evade-creep-sprint. She didn't design this behavior explicitly — it emerged from the curve-rule interaction. She names the scout blueprint "The Hummingbird."

**Minute 3:00 — Inspector Curve Overlay**
After execution, the Inspector shows her scout's actual speed over time as a sparkline overlaid on the curve editor. The predicted curve (gray) and actual curve (cyan) mostly match, but at tick 34 the actual speed dropped to 1 even though enemy count was 0. Why? Inspector reveals: the scout's buffer was full (context overload approaching), and the evade rule preempted the patrol action. The speed curve was correct, but the rule took priority. Priya adds a note: "Rule > Curve. Always."

**UI Annotations:**
- **Curve editor**: 128x128px expandable panel below the parameter slider. Dark background with grid lines. Control points are draggable circles with snap-to-grid. The curve renders as a smooth interpolated line in the skill's signature color. X-axis labels show the input variable name and range. Y-axis shows the output parameter range.
- **Curve-aware patrol preview**: Scout patrol path on the tactical board varies line thickness and brightness based on curve-predicted speed. Thick/bright = fast, thin/dim = slow. Updates live as curve is edited.
- **Inspector curve overlay**: Post-execution, the curve editor shows both the designed curve (gray) and actual behavior (cyan) as overlaid sparklines. Divergences are highlighted with amber segments.
- **Advanced Mode toggle**: Small gear icon per parameter, only visible post-campaign. Tooltip: "Advanced: behavior curves. Design how this parameter responds to battlefield conditions."

---

## Interaction Effects with Locked Decisions

**With rules:** Parameters and rules interact in complex ways. A high compress threshold (5) interacts with a rule "IF buffer_fill > 10 THEN compress" — the rule fires first if the buffer fills before the threshold is reached, creating an emergency compression. Parameters set the default behavior; rules handle exceptions. The player must understand both layers.

**With hooks:** Amplify's `range: local/global` parameter directly affects hook reach. Local amplification only boosts signals within the relay's hook network; global broadcasts to all units regardless of channel subscription. This interacts with the locked EM emissions model — global amplification generates maximum noise.

**With context config:** Skill parameters and context config's eviction policy interact at the buffer level. A scout with `patrol speed: 3` generates observations faster, filling the buffer faster, which triggers eviction faster. The patrol speed parameter indirectly affects which information survives.

**With the sealed watch:** More parameters = more behavioral variation = more surprising sealed watch moments. A relay chain where each relay has different compress thresholds produces signal processing that looks organic rather than mechanical. The sealed watch becomes more interesting to watch.

**With the Inspector:** Every parameter value is visible in the Inspector's decision trace. "Compress fired at threshold 4" is a concrete diagnostic statement. Parameters make the Inspector more useful because they give the player specific knobs to turn in response to diagnostic findings.

---

## Comparable Games

**Factorio inserter configuration:** Inserters start simple (pick up, put down) but have configurable stack sizes, filter conditions, and circuit-network-controlled behavior. The progression from "it moves items" to "it moves exactly 3 iron plates when the circuit signal on the green wire exceeds 50" mirrors Option D's progressive parameterization. Factorio proves that industrial parameter tuning is deeply satisfying for the right audience.

**Slay the Spire card upgrades:** Each card has exactly one upgrade — Bash goes from 8 damage to 10 damage. Simple, visible, meaningful. This is closer to Option B: each skill has a small number of tunable values. The lesson: even minimal parameterization (one number change) can transform a card's role in a deck.

**Gladiabots behavior actions:** Skills in Gladiabots are fixed behaviors (move, shoot, shield). All nuance comes from the behavior tree, not from skill parameters. This is Option A — and it works, but Gladiabots veterans consistently request "I wish I could tune how aggressively my bot aims." The absence of parameters shifts ALL complexity into the rule system.

**Into the Breach weapon upgrades:** Weapons have 1-2 upgrade options that change a single parameter (damage, push direction, area). The upgrade UI is crystal clear: "Before → After" with the changed number highlighted. This is the gold standard for Option B's presentation — show exactly what changed.

**Screeps creep body composition:** Body parts (WORK, MOVE, CARRY, etc.) are purchased in discrete units but combined freely. A creep with 5 WORK parts mines faster than one with 2. This is parameterization through composition rather than sliders — the "how much" is expressed by how many modules you equip. Robot Uprising could learn from this: what if skill parameterization was expressed through skill slot allocation (equip compress twice = threshold 2, equip it once = threshold 3)?

---

## Sensory Description

**Option A (Binary):** The skill section is a row of chunky industrial toggle switches, each 40x40px. ON position: switch handle UP, skill icon glows in its signature color, soft hum. OFF position: switch handle DOWN, icon grayed, silence. Toggling produces a satisfying mechanical clunk — a physical switch being thrown. The whole section fits in one horizontal row. Clean. Sparse. Decisive.

**Option B (Sliders):** Below each toggle, a horizontal slider appears when the skill is ON. The slider track is rendered as a machined metal groove with the skill's color as fill. The thumb is a knurled metal knob (3D shadow) that produces a tactile detent click at each valid position. Numeric value displays above the knob in monospace white text. The section has the feel of a precision instrument panel — an oscilloscope or signal generator. Ambient audio: a low electronic hum that subtly changes pitch as sliders move.

**Option C (Curves):** Each curve editor is a dark coordinate grid with phosphor-green lines — oscilloscope aesthetic. Control points are bright circles that leave ghost trails when dragged. The curve interpolation animates smoothly as points move, like a rubber band stretching. When the player releases a control point, the curve "settles" with a tiny bounce animation. The section feels like a laboratory — precise, clinical, powerful.

**Option D (Progressive):** The skill section starts as a simple toggle row (Option A aesthetic). When the first parameter unlocks, the toggle grows downward with a 300ms expansion animation — like a mechanical panel sliding open to reveal hidden controls. The boot log text appears as an annotation: "NEW: threshold adjustable" in gold text that fades after 5 seconds. Each subsequent unlock adds another mechanical expansion. By Mission 8, the section has the full industrial panel feel of Option B, but the player remembers when it was simple. The growth itself tells a story.

---

## The TikTok Clip

Split screen. Left: a beginner's relay with compress ON (binary toggle, default behavior). Right: a veteran's relay with compress at threshold 5, fidelity lossy, feeding another relay with amplify boost 3, range global. Same scout input. Left relay produces choppy, frequent, low-quality summaries that overwhelm the striker's buffer. Right relay produces rare, precise, high-priority intelligence that the striker acts on decisively. The striker on the right flanks perfectly. The striker on the left wanders confused. Caption: "Same skills. Different parameters." 15 seconds. The slider tuning is the entire difference.
