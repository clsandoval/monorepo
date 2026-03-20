# 3.01e — Skill Visual Language Consistency

## Overview

Twelve skills. Five unit types. An 8x8 isometric battlefield viewed at 1-second tick intervals during Sealed Watch. The question: when a player sees a blue ripple, a red flash, a green ring, a thin green line, an amber glow, and a yellow arrow all happening simultaneously on a crowded mid-game board — can they immediately identify which skills fired on which units? Or does the battlefield devolve into a Christmas tree of unintelligible effects?

This is the **visual grammar** problem. Each skill's battlefield animation is a word in a visual language. For that language to be learnable, it needs consistent rules: a syntax of color, shape, duration, and intensity that lets the player read the board like reading a sentence. "Blue ripple = perception. Red flash = killing. Green ring = broadcasting. Amber glow = sustained action. Yellow arrow = command." If the grammar is consistent, a player who has seen 4 skills can predict what the 5th will look like. If it is ad hoc, every new skill is a new arbitrary visual to memorize.

---

## The Current Visual Vocabulary (from Skills Catalog 3.01)

| Skill | Unit | Color | Shape | Duration | Sound |
|-------|------|-------|-------|----------|-------|
| Patrol | Scout | Cyan | Ripple (circle) | 1 tick per tile | Soft pulse |
| Evade | Scout | Red | Afterimage snap | Instant | Sharp snap |
| Engage | Striker | Crimson | Full-tile flash | 2 ticks fade | Metallic clang |
| Breach | Striker | Amber | Sustained pulse | 2 ticks hold | Grinding hum |
| Compress | Relay | Blue-white | Slots merging | 1 tick | Subtle pulse |
| Filter | Relay | Grey | Ghost dissolve | Instant | Bubble pop |
| Amplify | Relay | Green | Concentric rings | 1 tick spread | Radar ping |
| Hack | Specialist | Green | Thin data line | 1 tick hold | Terminal cascade |
| Extract | Specialist | Amber | Steady pulse + floater | Sustained | Steady pulse |
| Reassign | Command | Yellow | Downward arrow | 1 tick | — |
| Reroute | Command | Channel color | Line movement | 1 tick | Click |
| Prioritize | Command | — | Buffer rearrange | 1 tick | — |

---

## Grammar Analysis: What Patterns Emerge?

### Color Coding — The Verb Categories

Looking at the table, a partial grammar emerges:

- **Cyan/Blue** = Perception/Processing (patrol, compress) — "I am gathering or transforming information"
- **Red/Crimson** = Violence/Reaction (evade, engage) — "Something dangerous happened"
- **Green** = Communication/Network (amplify, hack) — "I am sending or stealing signals"
- **Amber** = Sustained/Economic (breach, extract) — "I am committed to a multi-tick action"
- **Yellow** = Command (reassign) — "I am ordering another unit"
- **Grey** = Filtering/Rejection (filter) — "I am discarding data"

This is promising. Four of five colors map to consistent categories. The problem cases:

1. **Green collision:** Amplify (green rings from relay) and Hack (green line from specialist) share a color but do *opposite* things — one broadcasts to friendlies, the other steals from enemies. A player seeing green on the board cannot distinguish "relay helping" from "specialist stealing" by color alone.

2. **Amber collision:** Breach (amber pulse on enemy structure) and Extract (amber pulse on resource node) share color AND shape. Both are sustained multi-tick actions. The difference is target type (enemy structure vs. resource node), not visual treatment.

3. **Red confusion:** Evade (red afterimage = scout fleeing) and Engage (crimson flash = striker killing). Both are red-spectrum and both involve combat proximity. But evade means "I survived" while engage means "I killed." Same emotional register, opposite outcomes.

4. **Missing visuals:** Prioritize has no battlefield visual — it is a pure buffer manipulation. Reroute uses channel colors, which vary per-channel. These skills are invisible or inconsistent on the battlefield view.

### Shape Grammar — The Action Type

- **Circles/Rings** = Area effects (patrol ripple, amplify rings) — "This affects a zone"
- **Lines** = Point-to-point (hack data siphon, reroute cable, reassign arrow) — "This connects two specific things"
- **Flashes** = Instantaneous events (engage flash, evade afterimage) — "This happened in a moment"
- **Sustained glows** = Multi-tick actions (breach pulse, extract pulse) — "This is ongoing"
- **Slot animations** = Buffer operations (compress merge, filter dissolve) — "This happens inside the unit, not on the board"

Shape grammar is stronger than color grammar. A player can reliably identify "area vs. point-to-point vs. instant vs. sustained vs. internal" from shape alone. The challenge: shape requires more visual literacy than color. Color is pre-attentive (you see it instantly). Shape requires a moment of parsing.

### Duration Grammar — The Commitment Level

- **Instant (< 1 tick visual):** Evade, engage, filter — reactive, automatic
- **One tick:** Patrol, compress, amplify, hack, reassign, reroute — deliberate, single-step
- **Multi-tick (2+ ticks):** Breach, extract — committed, vulnerable

Duration maps perfectly to risk level. Longer visual = more commitment = more vulnerability. This is the strongest axis of the grammar.

---

## Six Design Approaches to Visual Consistency

### Approach A: "The Color Code" (Fix Colors, Accept Collisions)

Assign strict color families:
- **Blue** = All perception (patrol perception radius, hack data visualization)
- **Red** = All combat (engage, evade, breach)
- **Green** = All communication (amplify, filter acceptance indicator)
- **Amber** = All economic/sustained (extract, breach secondary)
- **Yellow** = All command (reassign, reroute, prioritize)
- **Grey** = All rejection/null (filter discard)

**Problem:** Hack must switch from green to blue (it is perception, not communication). Breach gets dual-coded (red for combat + amber for sustained). This creates compound colors that muddy the palette. Players who memorized "green = relay skills" now see blue on a specialist and must relearn.

### Approach B: "The Unit Silhouette" (Color Per Unit Type, Shape Per Skill)

Each unit type owns a color:
- **Scout** = Cyan (all scout effects are cyan)
- **Striker** = Red (all striker effects are red)
- **Relay** = Green (all relay effects are green)
- **Specialist** = Purple (all specialist effects are purple)
- **Command** = Gold (all command effects are gold)

Shape and animation pattern differentiate skills within each unit. Scout patrol = cyan ripple, scout evade = cyan snap. Striker engage = red flash, striker breach = red sustained glow.

**Strengths:** Instantly answers "which unit did this?" from color alone. Five colors, five units, clean mapping.
**Weaknesses:** Cannot distinguish skill type from color. A cyan ripple (patrol) and a cyan snap (evade) are both "scout did something." The player must read shape to know what. Also, relay green and "signal delivery green" (from the locked spec's cell flash mechanic) collide.

### Approach C: "The Semantic Palette" (Color = Intent, Shape = Mechanism)

A two-axis grammar where color encodes *why* and shape encodes *how*:

**Color = Intent:**
- Cyan = "I am perceiving" (patrol, hack)
- Red = "Something is being destroyed" (engage, breach completion)
- Green = "Information is moving" (amplify, signal delivery, hook transmission)
- Amber = "I am working on something" (breach in progress, extract, compress)
- Gold = "A command was issued" (reassign, reroute, prioritize)
- Grey = "Something was rejected" (filter)

**Shape = Mechanism:**
- Ripple/pulse = area of effect
- Line/arrow = directed at specific target
- Flash = instant resolution
- Glow = sustained commitment
- Particle dissolve = data operation

This resolves the green collision: hack becomes cyan (perception intent) with a line shape (directed mechanism). Amplify stays green (communication intent) with rings (area mechanism). Breach starts amber (working) and flashes red on completion (destruction).

### Approach D: "The Intensity Ramp" (Skill Level = Visual Intensity)

All skills share a neutral base visual, and intensity/saturation increases based on the skill's impact. Patrol (low impact, continuous) = barely visible cyan wash. Engage (high impact, instant) = maximum-saturation crimson flash filling both tiles. This creates a "reading the board by brightness" pattern — the brightest things are the most important. Quiet boards are dim. Active boards are vivid. Crisis moments are blinding.

**Strengths:** Creates natural visual hierarchy. Players look at the brightest thing first.
**Weaknesses:** Low-intensity skills become invisible on busy boards. A relay compressing signals (dim blue) next to a striker engaging (bright red) means the compression is functionally invisible. The most strategically important operations (compression, filtering) are the least visible.

### Approach E: "The Glyph System" (Icon Overlay Per Skill)

Every skill activation overlays a small glyph icon on the acting unit for 1-2 ticks: an eye for patrol, a lightning bolt for engage, a gear for compress, a funnel for filter, a megaphone for amplify, a lock for hack, a pickaxe for extract, a crown for reassign, a plug for reroute, a stack for prioritize, a shield for evade, a ram for breach. Glyphs are 16x16px, white with colored backing matching unit type (Approach B).

**Strengths:** Unambiguous identification. Each skill has a unique icon. No color collision possible.
**Weaknesses:** 16x16 glyphs on an 8x8 isometric grid tile (maybe 64x64px rendered) are tiny. Multiple glyphs on adjacent tiles create visual clutter. Glyphs require learning 12 arbitrary icon-to-skill mappings — a memorization task, not a grammar task.

### Approach F: "The Progressive Visual Grammar" (Recommended)

A layered system that builds visual literacy across the campaign:

**Layer 1 — Color Intent (Always Active):**
- Cyan = perception
- Red/crimson = destruction
- Green = communication
- Amber = sustained work
- Gold = command
- Grey = rejection

**Layer 2 — Shape Mechanism (Emerges M3+):**
- Rings/ripples = area
- Lines/arrows = directed
- Flashes = instant
- Glows = sustained
- Particles = data operations

**Layer 3 — Intensity Drama (Always Active):**
- Low intensity = background operations (patrol, filter)
- Medium intensity = standard actions (compress, amplify, hack)
- High intensity = critical moments (engage, breach completion, evade)

**Layer 4 — Glyph Assist (Toggleable M5+):**
- Small skill icons appear on units for players who want explicit identification
- Toggled via Settings > "Show skill icons on battlefield"
- Default ON for first playthrough, default OFF for replays

This creates a **four-channel visual language**: color tells you *why*, shape tells you *how*, intensity tells you *how much*, and optional glyphs tell you *exactly what*. Expert players read color+shape+intensity and never need glyphs. Beginners lean on glyphs until the grammar internalizes.

---

## Player Journeys

#### Journey: Tomás, 16, First-Timer (Manila)

**Context:** Mission 3. Tomás has seen four skills so far: patrol (cyan ripple), evade (red snap), engage (crimson flash), and filter (grey dissolve). Mission 3 introduces compress and amplify on his first relay.

**Minute 0:00 — The Unfamiliar Relay**
Tomás places his new relay at position D4. He has configured it with compress and amplify active, listening on channel "recon." He does not yet know what these skills look like on the battlefield.

**Minute 1:00 — EXECUTE**
Sealed Watch begins. His scouts patrol (cyan ripples — familiar). An enemy scout appears; his scout evades (red snap — familiar). At tick 8, his relay receives three scout observations. The relay's compress skill fires: Tomás sees a brief amber glow centered on the relay — three small bright dots slide toward each other and merge into one brighter dot. The merge happens inside the relay's context bar (visible as tiny colored pips at the bottom of the relay's tile). The color is amber — "sustained work." The shape is particle convergence — "data operation." Tomás thinks: "It's... combining things? Like compressing files?"

At tick 9, the relay's amplify fires: green concentric rings emanate outward from the relay, reaching the striker two tiles away. Green = communication. Rings = area effect. Tomás watches the green ring wash over his striker's tile, and the striker's context bar shows a new bright entry appear.

**Minute 2:00 — The Grammar Click**
Tomás has now seen six skills. He pauses on the "Mission Complete" screen and mentally sorts them:
- Cyan ripple = "looking around" (perception, area)
- Red snap = "dodging" (danger, instant)
- Crimson flash = "killing" (destruction, instant, HIGH intensity)
- Grey dissolve = "throwing away" (rejection, particles)
- Amber merge = "combining data" (work, particles)
- Green rings = "broadcasting" (communication, area)

He hasn't been told this grammar. No boot log explained "cyan means perception." But the consistency is doing the teaching. When Mission 4 introduces hack (cyan line to enemy — "perception, directed, medium intensity"), Tomás correctly predicts its category before the boot log names it: "It's another cyan thing — so it's some kind of seeing? But it's a line, not a ripple, so it's aimed at one specific thing..."

**UI Annotations:**
- Compress: amber glow (200ms), three bright dots converge to one (400ms), merge pulse (200ms)
- Amplify: green rings emanate (3 rings, 100ms apart, expanding 2 tiles/ring)
- Skill glyph overlay: 16x16 white icon with unit-color backing, bottom-right of unit tile, 1.5s display

---

#### Journey: Priya, 28, Data Engineer (Bangalore)

**Context:** Mission 7. Priya has seen all 12 skills. She is watching a complex engagement involving 8 units — 2 scouts, 2 relays, 2 strikers, 1 specialist, 1 command. The board is active.

**Minute 0:00 — The Crowded Board**
EXECUTE. Sealed Watch. Tick 12 is chaos. On a single tick, she sees:

- Two cyan ripples (scouts patrolling — perception, area, low intensity)
- One green ring set (relay amplifying — communication, area, medium intensity)
- One amber glow (specialist extracting — work, sustained, low intensity)
- One crimson flash (striker engaging — destruction, instant, HIGH intensity)
- One gold downward arrow (command reassigning — command, directed, medium intensity)
- One thin cyan line (specialist hacking — perception, directed, medium intensity)

Wait — the specialist is both extracting (amber) AND hacking (cyan)? Priya scrubs back. No — the specialist extracted on tick 11 (amber, sustained, shown as a fading afterglow) and hacked on tick 12 (cyan line, fresh). The lingering amber from extract overlaps temporally with the fresh cyan of hack. The grammar still works: different colors, different actions, separated by one tick.

But the real test: can she tell which UNIT is doing what from the board alone? She looks at the crimson flash at tile E5. Who engaged? Two strikers are nearby. She traces the crimson flash to its center — it radiates from F5, not E5. The striker at F5 engaged the enemy at E5. The other striker at D6 did nothing this tick — no visual emanation. The grammar's intensity layer (engage = maximum brightness, centered on the actor) disambiguates.

**Minute 1:30 — The Grammar Fails**
Tick 18. Priya sees two green events: a green ring from Relay-A at C4 (amplify) and a green cell flash at E6 (signal delivery to Striker-B). Both green, both area-shaped. Is the cell flash a relay skill or just a received signal? The locked spec says "Cell flashes for signal delivery (green)" — but amplify is also green rings. The difference: amplify emanates FROM the relay outward (rings expand). Signal delivery flashes ON the receiver (single tile glow). Origin vs. destination. But at tick speed, both read as "green stuff."

Priya opens Settings and enables "Show signal flow lines" — the colored dashed lines showing active channel communications. Now she can trace the green ring from Relay-A to the green flash at Striker-B. The amplify ring and the delivery flash are connected by a dashed line. The relationship is visible. Without the signal lines, the two green events are ambiguous.

**Minute 3:00 — The Expert Reading**
By tick 30, Priya has stopped parsing individual effects. She reads the board holistically: "The left flank is cyan-heavy (scouts perceiving), the center is green-heavy (relays communicating), and the right flank just went crimson (striker engaged). My architecture is working — perception → communication → action, left to right across the board." The grammar has become a gestalt. She reads the board like reading a sentence: subject (cyan) → verb (green) → object (crimson).

**UI Annotations:**
- Signal flow lines: channel-colored dashed lines between units, toggleable via Settings
- Skill glyph overlay: toggled OFF by Priya (expert mode, board reading via color/shape only)
- Effect stacking: when 3+ effects occur on adjacent tiles same tick, effects are rendered with 50ms stagger to prevent overlap blindness
- Intensity hierarchy: engage flash renders ON TOP of all other effects (highest z-index)

---

#### Journey: Kai, 11, Accessibility Tester with Deuteranopia (Red-Green Colorblindness)

**Context:** Mission 5. Kai has deuteranopia — red and green are near-identical. The entire color axis of the grammar is compromised for him.

**Minute 0:00 — The Collision**
Kai executes Mission 5. His relay amplifies (green rings). His striker engages (crimson flash). To Kai, both events are yellowish-brown. The rings and the flash are different shapes, but the color channel — the fastest pre-attentive channel — gives him no information. He must rely entirely on shape and intensity.

He navigates to Settings > Accessibility > Colorblind Mode. Three options: Deuteranopia, Protanopia, Tritanopia. He selects Deuteranopia. The palette shifts:

- Perception: **Blue** (was cyan — similar enough)
- Destruction: **Orange** (was red/crimson)
- Communication: **Yellow** (was green)
- Sustained: **Purple** (was amber)
- Command: **White** (was gold)
- Rejection: **Dark grey** (was grey)

Now amplify is yellow rings. Engage is orange flash. Clearly distinct. Hack is blue line. Extract is purple glow. Every pair that was ambiguous under deuteranopia is now separated by a minimum of 90 degrees on the accessible color wheel.

**Minute 1:30 — Shape Carries the Load**
Even with the palette shift, Kai finds himself relying on shape more than color. "Rings mean broadcasting. Lines mean targeting. Flashes mean instant. Glows mean waiting." He has skill glyphs enabled (default for first playthrough) and they give him a secondary confirmation channel. The gear icon on his relay during compress, the megaphone during amplify — these are shape cues he never learned to rely on as a sighted player, but they now anchor his battlefield reading.

**Minute 3:00 — The Screen Reader Experiment**
Kai switches to "Full Accessibility" mode. Every skill activation now generates a brief screen reader announcement: "Relay-A compresses at C4." "Striker-B engages enemy at E5." The announcements are queued and read in priority order (engage > evade > command > communication > perception). On busy ticks, low-priority announcements are batched: "2 scouts patrolling." This gives Kai a third channel: audio narration in addition to colorblind-adjusted palette and glyph overlays.

**UI Annotations:**
- Colorblind palette: 6 presets (3 dichromacy types, high contrast, desaturated, custom)
- Glyph overlay: default ON, 16x16 icons with thick 2px outline for visibility
- Screen reader: skill activation announcements in priority order, batched for busy ticks
- Shape reinforcement: all effects have consistent shape regardless of palette mode (rings always rings, lines always lines)

---

## Strengths

1. **The recommended grammar (Approach F) is truly learnable.** Four channels (color/shape/intensity/glyph) mean that losing any one channel (colorblindness, small screen, fast speed) still leaves three channels of information. Redundancy enables accessibility without compromising aesthetics.

2. **The grammar predicts new skills.** A player who has learned "cyan = perception, line = directed" can correctly categorize hack (cyan line) before being told what it does. This predictive power is the mark of a real visual language, not a collection of arbitrary effects.

3. **Intensity creates natural visual hierarchy.** Engage (maximum brightness) always dominates the board. Filter (minimum brightness) never distracts. The most important events are the most visible without any explicit "importance" system — the grammar does it through physics.

4. **Expert board reading is genuinely satisfying.** Reading a busy board holistically — "cyan left, green center, crimson right" = "perceiving, communicating, killing" — feels like literacy. It is the same satisfaction as reading a network dashboard or an air traffic control screen. The grammar creates competence.

## Weaknesses

1. **Green collision persists even in the recommended grammar.** Amplify (green rings from relay) and signal delivery (green cell flash on receiver) share a color intent category. The shape distinction (expanding rings vs. single-tile flash) is subtle at tick speed. Signal flow lines help but require a toggle.

2. **12 skills is a lot of visual vocabulary.** Even with grammatical structure, players must eventually learn 12 distinct visual signatures. The progressive unlock helps (4 skills visible by Mission 3, all 12 by Mission 7), but the workload is real.

3. **Prioritize is invisible.** The prioritize skill (command agent reordering subordinate buffer eviction) has no natural battlefield visual. It is a pure data operation with no spatial manifestation. The glyph overlay helps, but without a glyph, prioritize is unreadable from the battlefield. This may be acceptable — prioritize is strategically important but not tactically dramatic.

4. **Multi-skill simultaneity on one unit.** A relay that compresses AND amplifies on the same tick shows amber (compress) overlapping with green (amplify). Two distinct visuals compete for the same tile. The 50ms stagger helps but creates a brief flash sequence that reads as a single composite event, not two distinct actions.

---

## Interaction Effects

- **Animated Tooltip Pattern (1.17a):** The micro-scenario tooltips in the workbench must use the SAME visual grammar as the Sealed Watch battlefield. If a skill's tooltip shows a different animation than its battlefield rendering, the grammar breaks. Tooltips are the teaching surface; the battlefield is the test surface.

- **Inspector:** The timeline scrubber should render skill effects at reduced speed (0.25x) in the replay, allowing players to parse individual skill activations that were too fast to read at 1x. The Inspector is where the grammar is learned; the Sealed Watch is where it is applied.

- **Signal Latency Legibility (3.10b):** Signal delivery flashes (green cell glow on receiver) must be visually distinct from amplify rings (green expanding from relay). The latency system's traveling signal dots on channel wires help disambiguate — the dot travels ALONG the wire, then the cell flashes on arrival. The wire animation provides context that the flash alone lacks.

- **Context Overload Stun:** A stunned unit shows "sparking/jittering visual" per the locked spec. This stun visual must NOT share grammar with any skill activation. Recommendation: stun uses white electrical crackle, no color tinting, unique to overload state.

- **Colorblind Modes:** The full grammar must work in all three dichromacy modes. The recommended six-color palette must be verified against all three confusion matrices. Particular risk: protanopia may confuse the accessible "orange" (was crimson) with the accessible "yellow" (was green). The shape grammar must be strong enough to carry disambiguation alone.

---

## Comparable Games

- **Into the Breach:** Master class in visual clarity. Every weapon has a unique attack pattern (line, area, push, pull) shown as colored overlays before execution. The grammar is spatial (attack pattern shape) rather than color-based. Robot Uprising can learn: shape and spatial pattern are more legible than color at small scale.

- **Slay the Spire:** Card effects have no consistent visual grammar — different particle effects per card. Players learn individual effects through repetition, not grammar. This works because the card name is always visible. Robot Uprising cannot rely on this approach — skill names are not visible on the battlefield during Sealed Watch.

- **Factorio:** No visual grammar for machine operations. Players read factory state from item flow (belt contents visible) rather than machine animations. The "data in transit" approach is instructive — Robot Uprising's signal flow lines serve the same function as Factorio's belt contents.

- **StarCraft:** Unit abilities have unique visual effects but no systematic grammar. A Terran Siege Tank's blue shockwave vs. a Protoss Colossus's red beam are individually memorable but follow no pattern. StarCraft relies on hundreds of hours of exposure, not grammatical learning. Robot Uprising targets faster literacy.

- **Diablo / Path of Exile:** Skill effects have a loose color grammar (fire = red, cold = blue, lightning = yellow, chaos = purple). Players learn the grammar through genre convention rather than explicit teaching. This works because the categories are culturally universal. Robot Uprising's categories (perception, communication, command) lack cultural color conventions, so the grammar must be taught through play.

---

## Sensory Description

**A fully active board at tick 25 of a late-game mission.** Two scouts patrol the northern edge — twin cyan ripples expanding and fading like radar pings, low intensity, background rhythm. A relay at center-board compresses incoming data — amber particles converge inward, three becoming one, a brief brightening at the merge point. The relay then amplifies the compressed signal — green concentric rings expand outward, each ring slightly dimmer than the last, reaching two tiles before dissolving. A specialist at the eastern edge holds a thin cyan line connected to an adjacent enemy relay — a data siphon, cyan because it is perception, a line because it is directed, medium intensity because it is neither passive nor explosive. The Command unit at the rear sends a gold downward arrow toward a striker — reassignment order, gold because it is command, an arrow because it is directed at a specific subordinate. The striker receives the order (gold flash on receive) and moves into position. Next tick: the striker is adjacent to an enemy scout. CRIMSON FLASH — maximum intensity, both tiles ignited, the metallic clang audible above the ambient soundscape, the destroyed enemy snapping to a broken sprite. The flash is the loudest visual on the board. Everyone watching knows what happened. The grammar screams it.

**The TikTok clip:** Time-lapse of a full mission compressed to 15 seconds. The board starts dark. Cyan ripples begin (scouts). Green rings appear (relays come online). The board develops a rhythm — cyan pulse, green ring, cyan pulse, green ring. Then CRIMSON FLASH. Pause. Another CRIMSON FLASH. Pause. A gold arrow fires. Three crimson flashes simultaneously across three tiles. Board goes dark. "MISSION COMPLETE." The color grammar tells the whole story without a single word: "We looked. We talked. We killed."
