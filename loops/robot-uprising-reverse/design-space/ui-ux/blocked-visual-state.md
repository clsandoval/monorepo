# 4.07a — "Blocked" Visual State: Distinguishing Waiting from Executing

## The Locked Context

Units resolve simultaneously each tick. Skills, rules, hooks, and context config govern behavior. Some units are stationary (relays, command), while others move. Hooks are fire-and-forget triggers wired to named channels. Signal latency is 1 tick per hop. The game uses one-shot-one-kill — no HP, no damage math. Context bars show fill as colored pips. The sealed watch has no pause, no skip, no tools.

The design space question: **How does the game visually distinguish a unit that is waiting for input (blocked on an empty channel, waiting for a signal that hasn't arrived) from a unit that is actively executing (processing data, making decisions, acting)?** In TIS-100, one of the most common player frustrations is not knowing whether a node is idle because it has nothing to do or deadlocked because it's waiting for input that will never arrive. Robot Uprising must solve this at battlefield scale — a player watching 8-12 units on an 8x8 grid must instantly distinguish "healthy idle," "waiting for input," and "actively processing" at 1-second tick speed.

---

## The Three Operational States

Every unit, every tick, is in one of these states:

1. **Active**: The unit evaluated its rules, found a match, and performed an action (moved, sent a signal, compressed data, engaged a target). The unit DID something.
2. **Idle**: The unit evaluated its rules, found no match, and fell through to its default behavior (patrol, or simply stand still). The unit COULD act but had no reason to. Its context window may be partially or completely empty.
3. **Blocked**: The unit has a rule or hook that references a signal it hasn't received yet. It's waiting for data. It WANTS to act but CAN'T because the input hasn't arrived. This is functionally equivalent to a thread blocked on an empty channel, or an `await` on a promise that hasn't resolved.

The critical distinction is between Idle and Blocked. Both look the same in a naive visualization — the unit does nothing. But they mean completely different things diagnostically:
- **Idle** = "my architecture doesn't have work for this unit right now" (possibly fine, possibly a wasted resource)
- **Blocked** = "my architecture has a dependency that isn't being satisfied" (almost always a bug or design flaw)

---

## Approach A: "The Breathing Cadence" — Rhythm Differentiates State

### The Mechanic

Each state has a distinct animation rhythm applied to the unit sprite on the board, visible at battlefield scale without clicking or hovering.

**Active (doing something):**
The unit sprite has a crisp, sharp presentation. On the tick it acts, a brief white edge-flash outlines the sprite for 150ms — like a camera flash. The sprite is fully opaque (100%). If the unit moved, a cyan afterimage trails at 25% opacity at its previous position for one tick. If it sent a signal, a tiny cyan pulse radiates outward from the unit (a 12px circle expanding to 24px over 200ms, then fading). Active units are visually "loud" — they announce their presence.

**Idle (nothing to do):**
The unit sprite dims to 85% opacity. No animation. No pulse. No flash. The unit simply exists, static. The context bar at the bottom of the tile is visible but dim. The unit looks like a parked car — present, functional, but not running. In an army of 8 units, the idle ones recede visually while active ones pop. The player's eye naturally skips over idle units during the sealed watch.

**Blocked (waiting for input):**
The unit sprite maintains full 100% opacity but enters a **slow pulse** — a sinusoidal brightness oscillation cycling between 80% and 100% over 1200ms (slightly longer than one tick). This is the "breathing" cadence. The sprite appears to inhale and exhale. Critically, the pulse is SLOWER than any other animation in the game — the overload tremor (200ms), the signal flash (150ms), and the active edge-flash (150ms) are all fast. The blocked pulse is languid, patient, waiting.

Additionally, a small icon appears above the unit: a hollow circle with a horizontal line through it — the "pause" symbol from media players, rendered in cool lavender (#B4A7D6) at 16x16px. This icon gently bobs up and down (2px, 1600ms cycle) above the unit sprite. The icon is small enough not to clutter the board but distinctive enough that a player who learns to look for it can spot blocked units instantly.

**Audio signature:** A faint, low chime plays once when a unit ENTERS the blocked state — a single note, like a gentle notification bell. During sustained blocking (multiple consecutive ticks), a nearly subliminal pulse sits under the soundtrack — a bass note at 60Hz that cycles with the sprite's breathing rhythm. It's not consciously audible over the kulintang, but it adds a sense of tension and anticipation to the scene.

### Why Rhythm Works

The human visual system is extraordinarily sensitive to rhythm and motion cadence. We evolved to detect predators by their movement patterns — a bush swaying in the wind (rhythmic, safe) versus a bush being pushed aside (arrhythmic, danger). The blocked state's slow pulse leverages this: it reads as "alive but waiting," distinct from the static idle ("not running") and the sharp active flash ("doing things").

At battlefield scale with 8-12 units, the player's peripheral vision detects the pulsing even when focused on a different part of the board. A blocked relay in the corner of the grid gently breathes in and out while the player watches a striker engaging — the peripheral pulse nags at attention, prompting investigation.

---

## Approach B: "The Dependency Wire" — Show What's Missing

### The Mechanic

When a unit is blocked, the game draws a **dashed line** from the unit toward the expected signal source — the unit it's waiting for data from. The line is drawn in a desaturated lavender (#B4A7D6), dashed (4px dash, 4px gap), and animates with a "marching ants" effect (the dash pattern shifts 2px per frame, creating an apparent motion flowing FROM the expected source TOWARD the blocked unit). This creates a visual "pull" — the blocked unit is reaching out for data that isn't coming.

If the expected source is another unit on the board, the line connects them. If the source is destroyed or hasn't spawned yet, the line extends from the blocked unit toward the edge of the board and fades — a dangling wire with no terminus. The dangling wire is the most alarming variant: it means the blocked unit is waiting for something that will never arrive. This is the visual equivalent of a deadlock.

The line is thin (1px) and low-saturation, sitting visually beneath the bright signal flow lines (green dashes for active channels). A board with healthy signal flow has bright green lines between communicating units. A board with blocked units has faint lavender dashes alongside — a "shadow network" of unmet dependencies.

The dependency wire is ONLY visible during the sealed watch if the player has unlocked the "signal overlay" capability (available from mission 5 onward). Before that, only the sprite breathing pulse indicates blocking. This prevents information overload in early missions while providing powerful diagnostic visualization for experienced players.

**Combined with Approach A:** The sprite still breathes at the slow cadence, but the dependency wire adds spatial information — you know not just THAT a unit is blocked but WHERE it's waiting for input FROM.

---

## Approach C: "The Thought Bubble" — Diegetic State Communication

### The Mechanic

When a unit enters the blocked state, a small thought bubble appears above it — like a comic-book speech bubble, but with an ellipsis ("...") rendered in a monospace font inside. The bubble is pixel-art styled, 24x16px, semi-transparent (70% opacity), floating 4px above the unit sprite. It gently bobs (1px vertical, 2000ms cycle).

The ellipsis animates: each dot appears sequentially (dot 1 at 0ms, dot 2 at 300ms, dot 3 at 600ms), then all three fade over 400ms, then the cycle repeats. This is the universal "loading" or "thinking" animation — instantly readable across cultures without explanation.

When a signal finally arrives and the unit transitions from blocked to active, the thought bubble pops with a brief starburst (8px, 100ms) and is replaced by the action flash. The transition from "..." to action is satisfying — the unit was waiting, and now it has what it needs.

**Variant for different wait durations:**
- **1-3 ticks blocked**: Standard ellipsis bubble. Neutral.
- **4-7 ticks blocked**: The ellipsis changes to a question mark ("?"). The bubble develops a faint yellow tint. The unit is getting impatient.
- **8+ ticks blocked**: The ellipsis becomes an exclamation mark ("!"). The bubble tints amber. The unit has been waiting too long — this is likely a configuration error, not a temporary delay.

The escalating icons (... → ? → !) teach the player that long blocks are abnormal. A unit blocked for 1-2 ticks might be normal latency (scout signal takes 2 ticks to reach via relay). A unit blocked for 8+ ticks means the data source is gone or the channel is misconfigured.

---

## Recommended Hybrid: A + C (Breathing + Thought Bubble)

The breathing cadence (Approach A) provides ambient battlefield-scale readability — the player's peripheral vision catches the slow pulse. The thought bubble (Approach C) provides immediate, diegetic communication of the wait state — the ellipsis is universally understood. The dependency wire (Approach B) is reserved for the Inspector's diagnostic mode, where precise channel-level information is appropriate.

During the sealed watch: breathing pulse + thought bubble with escalating icons.
During the Inspector: breathing pulse + thought bubble + dependency wires + full channel diagnostics.

---

## Player Journeys

### Journey 1: Soren, 17, High School Student — First Encounter with Blocking

**Context:** Mission 3, the hooks tutorial. Soren has a scout, a relay, and a striker. He configured a hook on the scout to send on channel "alert" when enemies are spotted. He configured the striker with a rule "if threat reported → engage." But he forgot to add the relay to the signal chain — the relay isn't set to listen on "alert" or forward anything.

**Minute 0:00 — The Sealed Watch Begins**
Tick 1. The scout spawns at A1, the relay at D4, the striker at H8. The scout immediately begins patrolling — its sprite is sharp, active, with a brief white edge-flash as it moves. The relay stands still — fully opaque, no animation. It's idle, not blocked. The striker... breathes. Its sprite slowly pulses, 80% to 100% brightness, over a 1200ms cycle. Above it, a tiny thought bubble with "..." appears. The ellipsis dots animate one by one.

Soren doesn't notice the breathing at first. He's watching the scout.

**Minute 0:15 — The Scout Finds Enemies**
Tick 5. The scout detects enemies at C3. A hook fires — a cyan pulse radiates from the scout. On the board, a faint green dashed line appears from the scout toward... where? The line extends toward the relay, but the relay has no "alert" listener. The line deflects past the relay and fades at the board edge. The relay doesn't react.

The striker is still breathing. Still "...". Tick 6, 7, 8. The thought bubble changes: the ellipsis becomes a question mark ("?"). The bubble tints faintly yellow. The breathing continues.

**Minute 0:30 — The Contrast**
Tick 10. The scout is sharp and active — moving, flashing, sending signals. The relay is dim and idle — present but inert. The striker is pulsing and questioning — alive, waiting, increasingly confused. Three units, three visual states. Soren can SEE that the striker wants to do something but can't. The "?" is nagging. Why is it waiting?

**Minute 0:45 — The Escalation**
Tick 15. The thought bubble now shows "!" in amber. The striker has been blocked for 15 ticks. Enemies are approaching the base. The striker is pulsing, exclaiming, and doing nothing. Soren feels the frustration — his unit is shouting for input while enemies walk past it.

The mission fails. In the Inspector, Soren clicks the striker and sees: "BLOCKED: waiting for signal on channel 'alert'. No signals received. Source channel active: SCOUT-A sends on 'alert'. No listeners forwarding to STRIKER-A." The dependency wire draws from striker to scout with a broken segment at the relay — the relay is the missing link. Soren opens the Plan screen and adds "alert" to the relay's listen channels and configures a forward hook.

**UI Annotations:**
- **Breathing pulse**: 80-100% brightness, 1200ms cycle, sinusoidal — slower than all other animations
- **Thought bubble**: 24x16px, pixel-art comic bubble, "..." → "?" (4-7 ticks) → "!" (8+ ticks)
- **Escalation tinting**: neutral → faint yellow → amber as block duration increases
- **Idle vs. blocked contrast**: idle at 85% opacity (static), blocked at 80-100% opacity (pulsing) — blocked is MORE visible than idle

---

### Journey 2: Dr. Amara, 38, Diamond Tier Veteran — Reading Blocking at Speed

**Context:** Mission 9, factory-vs-factory late game. Dr. Amara has a 10-unit army on the board. She's watching the sealed watch at 2x speed (0.5 seconds per tick). At this speed, she needs to read the board state in half a second per tick.

**Minute 0:00 — The Battle Is Healthy**
Ticks fly by. Scouts flash and move. Relays glow steadily. Strikers edge-flash as they engage. The board is a coordinated machine — sharp sprites, cyan signal pulses, green channel lines. No breathing units. No thought bubbles. The entire army is active or appropriately idle.

**Minute 0:20 — A Relay Goes Down**
Tick 24. RELAY-B is eliminated by an enemy striker that flanked through a gap. The relay sprite shatters (destruction animation). Immediately — within one tick — Dr. Amara sees TWO units start breathing. STRIKER-A and SPECIALIST-C, both downstream of RELAY-B, enter the blocked state. Their thought bubbles appear simultaneously: "..." on both. Their sprites begin the slow pulse.

At 2x speed, the breathing pulse is still readable — its 1200ms cycle means each pulse spans ~2.4 ticks at 2x speed. The contrast between the sharp, flashing active units and the slow, pulsing blocked units is amplified by speed. The blocked units look like they're moving in slow motion relative to the battle.

**Minute 0:25 — Cascade Assessment**
Dr. Amara counts: 2 blocked, 1 destroyed, 7 active. She watches whether the blocked units recover. Tick 26: STRIKER-A's thought bubble still shows "...". The command agent has a failover hook — it should reroute signals through RELAY-A. Tick 27: SPECIALIST-C's bubble changes to "?" — it's been blocked for 3 ticks now. Tick 28: STRIKER-A suddenly flashes white — the edge-flash of action. The thought bubble pops with a starburst. The failover kicked in. STRIKER-A is back in the fight.

SPECIALIST-C is still blocked at tick 30. Its bubble shows "!". The failover didn't cover the specialist's channel. Dr. Amara notes this for her debrief — the failover hook only reroutes the "attack" channel, not the "intel" channel the specialist depends on.

**Minute 0:40 — The Information**
Dr. Amara learned three things from the blocked state visualization without pausing or using any tools:
1. RELAY-B's destruction caused two downstream blocks (visible instantly)
2. The failover hook recovered STRIKER-A but not SPECIALIST-C (visible from bubble pop vs. escalation)
3. The "intel" channel has no failover redundancy (visible from sustained blocking)

All of this at 2x speed, from visual state alone. No Inspector needed. The blocked state visualization IS the real-time diagnostic.

**UI Annotations:**
- **2x speed readability**: 1200ms pulse still spans 2+ ticks at 2x, distinguishable from 150ms action flashes
- **Simultaneous blocking**: two units entering blocked state on the same tick is visually alarming — two pulses starting in sync
- **Bubble pop**: starburst on recovery provides closure — "this unit is back"
- **Escalation difference**: STRIKER-A recovers at "..." stage, SPECIALIST-C reaches "!" — the different escalation states tell different stories

---

### Journey 3: Tomás, 16, Mobile Player — Blocked State on Small Screens

**Context:** Mission 6, playing on an iPad in portrait mode. The board is compressed to fit the narrow screen. Unit sprites are smaller (24x24px instead of 32x32px). Tomás is watching his first factory-produced army.

**Minute 0:00 — Small Screen Challenges**
On the iPad, the thought bubbles would be too small to read at 24x24px sprite scale. The game adapts: instead of thought bubbles, blocked units get a **colored ring** — a 2px lavender ring pulsing around the tile border at the breathing cadence. The ring is visible even at small scale because it's on the tile edge, not overlapping the tiny sprite. The ellipsis/question/exclamation escalation is replaced by ring color: lavender (1-3 ticks) → yellow (4-7 ticks) → amber (8+ ticks).

Tomás sees his relay spawn. It's idle — dim sprite, no ring. His striker spawns. It has a lavender ring pulsing gently. It's blocked. The ring is distinct from the context bar (bottom of tile) and signal lines (between units) because it's ON the tile border itself.

**Minute 0:15 — Touch to Inspect**
On mobile, tapping a blocked unit during the sealed watch does nothing (no tools during sealed watch). But the pulsing ring communicates the state. After the sealed watch, in the Inspector, tapping a blocked unit shows the full diagnostic with dependency wires.

Tomás taps STRIKER-A in the Inspector. The dependency wire draws on the compressed board — a lavender dashed line from STRIKER-A toward the relay, with a broken segment. On the small screen, the wire is thinner (0.5px) but still visible against the dark board background. A floating tooltip at the wire's break point reads: "Channel 'alert' — no forwarding configured."

**UI Annotations:**
- **Mobile adaptation**: thought bubbles → tile border rings (scales to any sprite size)
- **Ring color escalation**: lavender → yellow → amber (3 states, color only, no text needed)
- **Touch target**: full tile is tappable, generous for fingers
- **Dependency wire on mobile**: thinner line, floating tooltip at break point for small-screen readability

---

## Animations and Transitions

| Trigger | Animation | Duration | Purpose |
|---------|-----------|----------|---------|
| Enter blocked state | Sprite begins slow pulse; thought bubble fades in from 0% to 70% opacity | Pulse: 1200ms cycle; Bubble fade-in: 300ms | Gentle entrance, not jarring |
| Sustained blocking (4+ ticks) | Bubble icon transitions "..." → "?" with 200ms cross-fade; bubble tints yellow | 200ms cross-fade | Escalation communicates urgency |
| Sustained blocking (8+ ticks) | Bubble icon transitions "?" → "!" with 200ms cross-fade; bubble tints amber | 200ms cross-fade | Strong signal: this is likely broken |
| Exit blocked (signal received) | Bubble pops (starburst 8px, 100ms); sprite flashes white (action flash); pulse stops | 100ms starburst + 150ms flash | Satisfying resolution of tension |
| Enter idle state | Sprite dims to 85% opacity over 200ms | 200ms fade | Gentle, non-alarming transition |
| Blocked unit destroyed | Bubble pops with red tint; destruction animation plays | 100ms pop + standard destruction | Death while waiting — emotionally resonant |

---

## Accessibility Considerations

- **Color-independent state recognition**: Active = sharp + flash (motion cue). Idle = dim + static (reduced presence). Blocked = pulse + bubble icon (rhythm + symbol). All three states are distinguishable without color: brightness (high/low/oscillating), animation (flash/none/pulse), and icon (none/none/bubble).
- **Reduced motion mode**: The breathing pulse is replaced by a static lavender border on the tile (2px solid, no animation). The thought bubble appears without bobbing. The escalation still works via icon change ("..." → "?" → "!") without motion.
- **Screen reader mode**: Blocked units are announced: "STRIKER-A: blocked, waiting for signal on channel 'alert', blocked for 5 ticks." This announcement fires once when blocking begins and again at escalation thresholds.
- **High contrast mode**: The lavender (#B4A7D6) blocked indicator shifts to bright magenta (#FF00FF) for maximum contrast against the dark board. The thought bubble gets a solid black border.

---

## Comparable Games

**TIS-100's Deadlock Problem**: In TIS-100, nodes that are blocked on a read (`MOV ACC, LEFT` when LEFT has nothing to send) simply stop executing. The visual indication is subtle — the node's instruction pointer stays on the same line. Players must manually check each node to find the deadlock. Robot Uprising's breathing + thought bubble makes blocking VISIBLE at battlefield scale without inspection. This is the key improvement over TIS-100: blocking is ambient information, not detective work.

**Factorio's Inserter Idle State**: Factorio inserters that have nothing to pick up simply don't move. Experienced players read this instantly — a row of still inserters means the belt is empty. Robot Uprising's idle state (dim, static) mirrors this. But Factorio doesn't distinguish "inserter with nothing to pick up" from "inserter blocked by a full chest" — both look idle. Robot Uprising's blocked/idle distinction is the missing diagnostic.

**StarCraft's Idle Worker Indicator**: StarCraft shows an idle worker count in the UI corner. When workers are idle, you click the number to cycle through them. Robot Uprising's blocked units are the equivalent of idle workers, but the game communicates this ON the battlefield rather than in a counter — the player sees WHERE the blocking is happening, not just that it exists.

**Into the Breach's Threat Preview**: Into the Breach shows enemy attack indicators on the board — arrows pointing at targets, damage numbers on tiles. These are ambient, always-visible, and spatially located. Robot Uprising's blocked indicators follow the same principle: state information presented ON the board, AT the unit, requiring no interaction to read.

---

## Sensory Description

Tick 22. The board is alive. Three scouts dart across the left flank — sharp sprites, cyan pulses firing with each detection, quick white edge-flashes marking every action. Two strikers advance toward the enemy base, their heavy sprites snapping from tile to tile with mechanical precision. RELAY-A at D4 glows steadily, fully opaque but still — it's idle, a quiet hub in a busy network.

And then there's STRIKER-B at G7. It breathes. Its sprite swells from 80% to 100% brightness and back, a slow inhale-exhale rhythm that is conspicuously slower than everything else on the board. Above it, a tiny pixel-art thought bubble hovers — three dots appearing one by one, then fading, then reappearing. Dot. Dot. Dot. Fade. Dot. Dot. Dot. The universal sign of waiting.

The rest of the board operates at battle tempo. Flashes, pulses, snaps. STRIKER-B operates at rest tempo. Breathe. Wait. Breathe. Wait. The contrast is almost peaceful — except for the context. This striker should be engaging. Its rules say "if threat reported → engage." But no threat has been reported to its context window. The bubble says "...". The striker says "I'm here. I'm ready. Where's my data?"

Tick 26. The bubble changes. A brief cross-fade, 200ms: the three dots dissolve into a single question mark. The bubble tints faintly yellow, like the first hint of dawn. "?" Four ticks of waiting. The scout at A3 has been sending threat reports for six ticks. RELAY-A has been compressing them. But STRIKER-B's listen channel is set to "command-net," not "alert-net." The data exists. The striker can't hear it.

Tick 30. The question mark dissolves into an exclamation point. The bubble is amber now, warm and insistent. "!" The breathing hasn't changed — same slow pulse, same languid rhythm — but the amber exclamation transforms it from patience into alarm. The striker has been waiting for eight ticks. In a one-shot-one-kill game, eight ticks is an eternity. Two enemies have already passed through its engagement range. It couldn't see them.

Tick 31. A signal arrives. The command agent, twelve tiles away, finally issues a reroute — forwarding the threat data on "command-net." The signal hits STRIKER-B's context window. The thought bubble pops: a tiny starburst, white pixels spraying outward for 100ms, then gone. The breathing stops. The sprite snaps to full brightness. A white edge-flash fires. STRIKER-B moves — E5, toward the last reported threat position. The "!" is replaced by action. The waiting is over.

But the damage is done. The enemies that passed through G7 are now at the base perimeter. The eight ticks of blocking cost two defensive positions. In the Inspector, the player will trace this chain and find the misconfigured listen channel. But right now, in the sealed watch, they felt it: the slow breath of a unit that wanted to fight and couldn't hear the order.
