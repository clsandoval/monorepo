# 1.20b — Gradual Degradation vs. Binary Death: Context Window Damage

**Aspect:** 1.20b — Cogmind's part-by-part degradation creates a rich mid-state between functional and dead; should Robot Uprising explore a "damaged" state where units lose context slots?
**Category:** Competitive Analysis / Core Mechanic Boundary
**Dependencies:** 1.20 (Cogmind), 2.01 (Fixed-Slot Buffer), 2.09 (Sticky Memories), 2.11 (Signal Fidelity), One-Shot-One-Kill (Locked), Sealed Watch (Locked)

---

## The Core Tension

Robot Uprising has a locked design rule: **one-shot-one-kill.** An adjacent striker means instant elimination. No HP bars. No damage numbers. No healing. A unit exists or it does not. This creates the game's signature emotional sharpness — every positioning decision carries absolute stakes.

Cogmind inhabits the opposite end of the design spectrum. Your robot is a chassis assembled from parts: legs, weapons, sensors, reactors. Every attached part absorbs incoming damage. When a part is destroyed, it rips off the chassis — you lose the capability it provided, but you survive. Lose a leg, you slow down. Lose your sensor array, your detection radius shrinks. Lose both weapons, you cannot fight. You are alive but diminished, limping through corridors on half a thruster, assembling a new identity from whatever salvage you find. Cogmind's stat: **43.5% of all equipped parts are destroyed before the player voluntarily removes them.** Nearly half your build is taken from you by force. The game is not about holding a loadout — it is about rebuilding under pressure.

The question this aspect explores is whether there exists a **middle territory** between these two philosophies that Robot Uprising could occupy. Not HP bars — those are philosophically incompatible with the game's information-architecture identity. But **context window degradation**: a hit that does not kill the unit but shrinks its buffer. A Scout with 6 slots takes an EM pulse and drops to 4. It is alive. It is functional. But it is dumber — its working memory has contracted, its ability to hold observations and signals simultaneously has been amputated. It has been wounded in the only organ the game cares about: its mind.

---

## The Mechanical Option: Buffer Shrinkage

### What Causes Degradation

Three sources, each with distinct tactical identity:

**1. Near-Miss Attacks (Proximity Damage)**
When an enemy striker is adjacent but does not attack (because it targeted a different unit, or moved through an adjacent tile without stopping), units in the blast radius suffer a buffer shrink of 1 slot. The near-miss represents the electromagnetic shockwave of combat — not enough to kill, enough to rattle the circuitry. The striker's kill targets the primary unit; the near-miss degrades the neighbor. This creates a splash damage model that operates on cognition rather than health.

**2. EM Pulse Attacks (Dedicated Degradation Weapon)**
A new enemy type or enemy skill: the EM emitter. It does not kill. It cannot occupy a tile adjacent to your unit and trigger one-shot-one-kill. Instead, it pulses at range (2-3 tiles), shrinking every friendly unit's buffer within its radius by 2 slots per pulse. The EM emitter is a siege weapon against your information architecture — it does not destroy your army, it lobotomizes it. Units survive but forget. Rules that require 5 observations in the buffer to evaluate correctly start failing because the buffer can only hold 3. The army is standing but brain-damaged.

**3. Context Overload Aftershock (Self-Inflicted)**
When a unit hits context overload (buffer full, evicting every tick, the red eviction flash constant), it suffers a 1-slot shrink after 3 consecutive ticks of maximum eviction pressure. The overload does not kill — it scars. The unit's buffer literally contracts from sustained information stress, like a server throttling itself under load. This is the only self-inflicted degradation source and creates a consequence for poor information architecture design that is harsher than the current stun mechanic but less harsh than death.

### How Many Slots Can Be Lost

Each unit type has a **minimum viable buffer** — the smallest buffer at which the unit can still execute at least one rule per tick:

| Unit | Base Buffer | Min Viable | Max Shrinkable Slots |
|------|-------------|------------|---------------------|
| Scout | 6 | 3 | 3 |
| Striker | 8 | 4 | 4 |
| Specialist | 10 | 5 | 5 |
| Relay | 12 | 6 | 6 |
| Command | 14 | 7 | 7 |

At minimum viable buffer, the unit is a ghost of itself. A Scout with 3 slots can hold one observation, one hook message, and one processed signal — simultaneously — and nothing else. Every tick is a triage crisis. The Scout can still function, technically. It can perceive, signal, and move. But it cannot hold context across ticks. It is an amnesiac: reacting to the present with no memory of the past. Each tick is its first tick. It is Cogmind limping on one leg, except the leg is working memory.

### Recovery

Two models, each with different design implications:

**Model A: No Recovery.** Shrunk slots are gone for the rest of the battle. The degradation is a scar, not a wound. This aligns with one-shot-one-kill's philosophy of irreversibility — in a game where death is permanent, damage should be permanent too. The emotional weight is heavy: watching your Relay drop from 12 to 8 slots and knowing it will never recover creates the same "I'm losing my build" feeling as Cogmind's part destruction.

**Model B: Slow Recovery.** One slot regenerates every 5 ticks. A Relay hit for 2 slots (12 to 10) will recover fully in 10 ticks. This creates a temporary debuff window — the unit is impaired for a dangerous period, then returns to full capacity. This model softens the punishment and creates a temporal pressure: the enemy EM pulse creates a 10-tick window of vulnerability where your relay network is degraded. Survive those 10 ticks and you are back to full strength. The recovery is mechanical (circuitry self-repairs), not magical.

**Recommendation:** Model A for the base game, Model B as a late-game tech tree unlock ("Hardened Buffers" in the Counter-Intelligence branch). The no-recovery model preserves the one-shot-one-kill weight; the recovery model rewards defensive investment.

---

## Player Journeys

#### Journey: Dani, 26, Network Engineer, Plays Factorio and Cogmind

**Minute 0:00 — Mission 8 Plan Phase**
Dani opens the workbench. Mission 8 introduces EM emitter enemies for the first time — the briefing warns of "electromagnetic interference that degrades agent processing capacity." She has a Relay network: RELAY-NORTH (12 slots, 4 hooks, the backbone of her signal architecture) positioned at D6, compressing scout reports and forwarding to strikers. She also has 2 Scouts (6 slots each) and 2 Strikers (8 slots each). The enemy force includes 3 standard strikers and 1 EM emitter.

She reads the EM emitter's stat card: "Range 3. Pulse: shrinks buffer by 2 every 4 ticks. Cannot melee." Dani immediately recognizes the threat model. "It's not trying to kill my units. It's trying to make them stupid." She considers repositioning RELAY-NORTH deeper behind her lines, out of EM range, but that would increase signal latency by 1 hop. She decides to keep the relay forward and risk the EM exposure. "If the relay drops to 10 slots, it can still compress. If it drops to 8, I'm in trouble."

**Minute 1:15 — Tick 8, First EM Pulse**
The sealed watch is running. Her scouts have made contact with the standard enemy strikers on the east side. Signal chains are firing — green dashes from scout to relay, relay to striker. The architecture is humming. Then the EM emitter moves into range of RELAY-NORTH. Tick 8: a pulse. The screen does not flash red (that is death). Instead, a different visual: a purple-white ripple expands from the EM emitter across 3 tiles, like a stone dropped in electromagnetic water. Every unit in the radius — RELAY-NORTH and SCOUT-EAST — shudders. Not the stun jitter. A different animation: the unit sprite dims for 200ms, then stabilizes, but something is wrong.

Dani looks at RELAY-NORTH's buffer bar. It was 12 pips, green and blue, pulsing with data flow. Now it is 10 pips. The rightmost 2 pips did not empty — they vanished. The bar physically shortened. Where there were 12 segments, there are 10. The two missing segments leave a gap at the right edge of the bar, and in that gap: a faint static pattern, pixel noise where the segments used to be, a visual scar on the UI element itself.

SCOUT-EAST's buffer bar shrinks from 6 to 4. The scout still moves, still perceives. But Dani can see the difference immediately — the buffer bar is stubby, compressed, leaving more empty space below the unit sprite than before. The scout looks... diminished. Smaller. Not dead, not stunned. Reduced.

**Minute 1:45 — Tick 12, Second EM Pulse**
Another pulse. RELAY-NORTH drops to 8. The buffer bar is now visibly shorter than a Striker's — a Relay with the cognitive capacity of a Striker. Dani watches the relay attempt to compress three incoming signals. Normally it takes 3 inputs and produces 1 compressed output, consuming 4 buffer slots temporarily (3 inputs + 1 output). With 8 slots, it can still compress — but only if 4 of its 8 slots are free. They are not. Stale data from previous ticks still occupies 3 slots (the relay has not been evicting fast enough because the buffer was designed for 12, not 8). The compress fails. The relay forwards raw, uncompressed signals instead.

Downstream, STRIKER-WEST receives 3 uncompressed signals instead of 1 compressed signal. Its 8-slot buffer fills in one tick. The eviction flash fires. The striker loses the oldest observation — the enemy position report from tick 9. It is now acting on tick 12 data only, with no historical context. It jitters, uncertain, rules matching against incomplete information.

Dani mutters: "The EM didn't kill anything. It killed the architecture."

**Minute 2:30 — Inspector**
She opens the Inspector. Clicks RELAY-NORTH at tick 12. The buffer visualization shows 8 slots instead of 12, with the missing 4 rendered as a static-filled dead zone at the right edge. She scrubs backward to tick 7 — 12 healthy slots, green and blue pips flowing smoothly. She scrubs forward through tick 8 — the bar contracts with a subtle crunch animation. She can see the exact moment the architecture broke: tick 12, when the relay's compress skill needed 4 free slots and only had 2.

She scrubs STRIKER-WEST at tick 12. The decision trace shows: rule "IF enemy_position AND enemy_heading THEN intercept" evaluated against buffer contents. enemy_position present (from raw forwarded signal). enemy_heading: NOT FOUND (evicted at tick 11 to make room for the raw flood). Rule did not fire. Fallback rule fired instead: "IF enemy_nearby THEN hold_position." The striker stood still when it should have intercepted.

"The EM didn't hit the striker at all. It hit the relay. The relay's damage cascaded through the compressed signal, through the channel, into the striker's decision-making. The striker made a bad decision because its information supply degraded three hops upstream."

**UI Annotations:**
- EM pulse visual: purple-white expanding ripple, 3-tile radius, 300ms animation
- Buffer shrink: rightmost pips vanish with a 100ms dissolve, replaced by static-noise pattern in the dead zone
- Degraded unit sprite: 200ms dimming flash on pulse impact, then returns to normal brightness but buffer bar permanently shorter
- Inspector dead zone: hatched grey area at the right end of buffer visualization, labeled "EM DAMAGE -2" with tick number

---

#### Journey: Tomoko, 41, High School Teacher, Plays Into the Breach on Switch

**Minute 0:00 — Mission 7, First Encounter with Overload Degradation**
Tomoko has never seen buffer degradation before. Her SCOUT-ALPHA has been running at maximum eviction pressure for 4 consecutive ticks — the red eviction flash on the left edge of the buffer bar has been constant, a tiny angry heartbeat. She configured too many channels for this scout (listening on both "east-net" and "west-net" while also perceiving a crowded area). On tick 18, the overload aftershock triggers.

She watches the buffer bar contract from 6 to 5. No external attack. No EM pulse. The scout damaged itself — its own information overload burned out a circuit. The visual is subtler than an EM hit: no purple ripple, no dramatic flash. Instead, the rightmost pip on SCOUT-ALPHA's bar flickers rapidly for 500ms (like a dying lightbulb), then goes dark and vanishes. A tiny wisp of pixel smoke — 2 grey pixels rising from the buffer bar's right edge, dissipating over 1 second. Self-inflicted. The unit overheated.

Tomoko's immediate reaction: "Wait — it can hurt ITSELF?" She opens the Inspector after the battle. The decision trace for tick 18 shows: "CONTEXT OVERLOAD: 3 consecutive ticks at maximum eviction rate. Buffer integrity degraded: 6 -> 5." She traces back through ticks 15, 16, 17 — the red eviction flash on every single tick. Three ticks of hemorrhaging information, then the buffer physically contracts.

Her takeaway is visceral and immediate: "The red flashing wasn't just a warning. It was a countdown." She replays the mission with SCOUT-ALPHA listening on only one channel. The eviction pressure drops. The buffer holds at 6. No self-damage. She has learned buffer management through consequence, not tutorial text.

**UI Annotations:**
- Self-inflicted degradation visual: no external ripple. The damaged pip flickers at 10Hz for 500ms, then fades to black with a 2-pixel smoke wisp
- Inspector annotation: "OVERLOAD DAMAGE" label in amber (not red — amber for self-inflicted, red for enemy-inflicted)
- The 3-tick countdown is NOT displayed during sealed watch. The player discovers it in the Inspector. During the watch, they see only the eviction flash accelerating, then the pip dying. The connection is forensic, not telegraphed.

---

#### Journey: Renzo, 33, Competitive Gladiabots Player, Optimization Mindset

**Minute 0:00 — Mission 9, EM Emitter Positioning Puzzle**
Renzo has fully internalized degradation mechanics. He is now designing around them. Mission 9 features two EM emitters flanking a corridor, creating a "degradation zone" — any unit passing through the corridor will lose 4 buffer slots (2 per emitter). His objective requires sending scouts through the corridor to tag the enemy base.

He has a choice: send SCOUT-ALPHA (6 slots) through the corridor, knowing it will drop to 2 (below minimum viable — effectively stunned permanently), or send SPECIALIST-BRAVO (10 slots), which would drop to 6 (still functional, equivalent to a healthy scout). The Specialist costs more resources and is slower, but it survives the corridor with its mind intact.

But Renzo sees a third option. He has unlocked the "Hardened Buffers" tech (Counter-Intelligence branch). One of his units has the "EM Shield" passive: reduces EM degradation by 1 slot per pulse. SCOUT-ALPHA with EM Shield would drop from 6 to 4 (6 - 2 pulses of 2, reduced by 1 each = 6 - 2 = 4). Four slots. Tight, but viable. The Scout can still perceive, hold one observation, receive one signal, and have one slot free. It will be operating at the edge of cognitive collapse — but it will make it through.

He sends the shielded scout. During the sealed watch, he watches SCOUT-ALPHA enter the corridor at tick 10. First pulse — buffer shrinks from 6 to 5 (EM Shield absorbed 1 of the 2-slot hit). Second pulse at tick 14 — buffer shrinks from 5 to 4. The Scout's buffer bar is now four tiny pips, almost comically short beneath the unit sprite. The scout looks like it is thinking through a fog. Its perception radius is unchanged (that is hardware, not software), but when it observes 3 enemies simultaneously, 3 observations flood a 4-slot buffer. One observation evicts immediately. The Scout can see the battlefield but cannot remember all of it at once.

The scout reaches the enemy base. Tags it. Mission objective complete. On the debrief screen, SCOUT-ALPHA's stats: "Buffer integrity: 67% (4/6). Ticks at minimum capacity: 8. Observations lost to degradation-induced eviction: 14." Renzo reads this like a damage report on a fighter jet that made it home with one engine. The scout completed the mission. The scout is brain-damaged. The mission is a success. The cost is visible.

**UI Annotations:**
- EM Shield absorption: when EM pulse hits a shielded unit, the purple ripple visually splits — part of it bounces off the unit (reflected as a cyan flash, 100ms) and part penetrates (remaining purple). The buffer shrinks by the reduced amount.
- Degradation zone: the corridor tiles between two EM emitters have a subtle purple ambient glow — the overlapping EM fields create a visible "danger corridor" during the plan phase, telegraphing the threat.
- Post-mission stats: "Buffer Integrity" percentage shown next to each surviving unit. 100% = no degradation. Below 50% = amber warning color. Below 30% = red.

---

## Strengths

**1. Rich Mid-States Without HP Bars**
The most important strength. Degradation creates the Cogmind feeling — your creation is deteriorating under pressure, you are watching capability erode — without betraying the one-shot-one-kill identity. A degraded unit is not "at 60% HP." It is a fully functional agent whose mind has contracted. The mechanical consequence (fewer buffer slots) is qualitatively different from HP reduction because it changes *what the unit can think about*, not how many hits it can absorb. A Relay at 8/12 slots is not "a Relay with less health." It is a different cognitive entity — one that can no longer compress three signals simultaneously, one whose rules evaluate against a shallower information pool, one whose behavior changes because its capacity changed. Degradation creates new agents mid-battle.

**2. Cascade Failures Through Architecture**
EM damage to a relay does not just hurt the relay. It hurts every unit downstream. The relay's compress fails, raw signals flood the channel, downstream units overload, their buffers shrink from overload aftershock, their rules misfire — a single EM pulse at the right chokepoint can cascade through the entire signal architecture. This is the game's thesis made physical: information architecture matters, and attacking the architecture is more devastating than attacking individual units.

**3. Readable During Sealed Watch**
The buffer bar shrinkage is instantly legible. The bar gets shorter. The static-noise dead zone appears. The player does not need the Inspector to understand what happened — they can see it in real time. This passes the Into the Breach clarity test: the consequence is visible before, during, and after the event.

**4. New Enemy Design Space**
EM emitters are a fundamentally different threat from strikers. Strikers threaten death. EM emitters threaten capability. A striker adjacent to your relay destroys it — you need a new relay. An EM emitter at range 3 degrades it — you need to decide whether a degraded relay is better than no relay. The player's threat calculus expands from "will it die?" to "will it still be smart enough?"

**5. Deepens the Tech Tree**
The Counter-Intelligence branch (already planned: signal authentication, hardened buffers) gains mechanical teeth. EM Shield, buffer recovery, degradation resistance — these are no longer abstract upgrades. They protect against a specific, visceral threat the player has experienced.

---

## Weaknesses

**1. Complexity Creep Against a Clean System**
The current locked design is elegant: units are alive or dead, buffers are full-size or not, one-shot-one-kill resolves combat instantly. Degradation adds a third state (alive-but-damaged), a variable buffer size (not just full/empty but shrunk), and new damage sources (EM pulses, overload aftershock). Each of these individually is manageable. Together, they add cognitive load to a game that prizes Into the Breach-level clarity. The buffer bar was already communicating four things (slot count, data type via color, age via brightness, eviction via flash). Now it also communicates maximum capacity, lost capacity, and damage source. The bar is doing six jobs.

**2. Tension with "No HP" Philosophy**
Despite the framing as "cognitive damage, not health," buffer shrinkage IS functionally an HP system. A unit with 12 slots that can lose up to 6 has 7 discrete health states (12, 11, 10, 9, 8, 7, 6). Call it "buffer integrity" or "cognitive capacity" — the player is still tracking a number that decrements under attack. The philosophical distinction (it changes behavior, not just survivability) is real but subtle. Some players will simply see it as "HP with extra steps."

**3. Interaction with Sticky Memories (Pinned Slots)**
When buffer shrinkage destroys slots, which slots are destroyed? If degradation always removes from the right (newest end), pinned slots on the left are safe. But if degradation can hit pinned slots, the consequences are severe — a pinned directive that the player carefully authored is destroyed by an EM pulse, and the unit's personality changes mid-battle. This is either a brilliant emergent drama ("my scout forgot its standing orders under enemy fire") or a frustrating loss of control ("I spent 2 minutes writing that directive and a random EM pulse deleted it"). The design must choose: pinned slots are inviolable (degradation only shrinks the working buffer) or pinned slots are vulnerable (degradation can destroy standing orders). The first is safer. The second is more Cogmind.

**4. Inspector Complexity**
The Inspector already shows: buffer contents per tick, eviction history, decision traces, signal genealogy, channel metrics. Adding degradation history (when did each slot shrink, what caused it, how it affected downstream behavior) creates another layer of diagnostic information. The Inspector risks becoming a wall of data rather than a focused diagnostic tool.

**5. Sealed Watch Readability Under Combined Stress**
During a heavy battle, the sealed watch shows: unit movement, perception radii, channel wiring, signal flashes, combat flashes, eviction flashes, buffer bars, tile damage states, EM emission rings. Adding EM pulse ripples and buffer shrink animations to this visual budget increases the risk of sensory overload — the player cannot track everything simultaneously. The EM pulse visual must be distinctive enough to register but restrained enough not to dominate. The purple-white ripple must live in a visual frequency band not occupied by any other animation.

---

## Interaction Effects

### x Buffer Pressure (2.01)
Degradation intensifies buffer pressure exponentially, not linearly. A 12-slot relay with 6 incoming signals per tick is at 50% pressure. Shrink it to 8 slots: same 6 signals, now 75% pressure. Shrink to 6: 100% pressure, constant eviction. Every slot lost increases pressure on the remaining slots. A 2-slot shrink on a unit already at 70% pressure can push it over the edge into constant eviction, which triggers overload aftershock, which shrinks it further — a degradation death spiral. The player must design information architecture with degradation margins: do not run units at high buffer pressure, because degradation will push them past the cliff.

### x Eviction Policies (2.06, 2.07)
Weight-aware eviction becomes dramatically more important under degradation. A degraded relay with 8 slots MUST evict smartly — FIFO will discard critical tactical signals in favor of routine observations. Priority eviction (keep high-value signals, evict low-value ones) becomes the difference between a degraded-but-functional relay and a degraded-and-useless one. Degradation makes eviction policy configuration a survival skill rather than an optimization exercise.

### x Sticky Memories / Pinned Slots (2.09)
**Recommended interaction:** Pinned slots are inviolable. EM degradation shrinks the working buffer only, never the pinned zone. A Scout with 1 pin and 5 working slots, hit by a 2-slot EM pulse, drops to 1 pin and 3 working slots (total 4). The pin survives. The scout remembers its standing orders even as its working memory contracts around them. Visually: the thin white divider line between pinned and working buffer stays fixed; the working buffer contracts from the right. The pinned zone is an island of stability in a shrinking mind.

This creates a new strategic depth for pins: in EM-heavy missions, pins are not just personality tools — they are insurance against cognitive collapse. A degraded scout with a pinned directive still knows its mission. An unpinned scout at the same buffer size has more flexible capacity but risks losing coherence entirely.

### x Sealed Watch Readability
The EM pulse ripple must be **visually distinct** from: the red combat flash (death), the green signal flash (hook delivery), the cyan perception radius, the magenta EM emission rings (outgoing), and the tile damage residue effects. The purple-white ripple occupies a unique visual band. It is larger than the combat flash (3-tile radius vs. 1-tile), slower (300ms vs. 100ms), and cooler in color temperature (purple vs. red). The buffer shrink animation occurs simultaneously: the rightmost pips dissolving into static noise. The two animations together — expanding ripple + contracting bar — create a unique visual signature. Nothing else in the game looks like this.

### x Inspector Diagnostics
The Inspector gains a new diagnostic: **"Degradation Timeline."** A horizontal bar per unit showing buffer capacity over time. Full capacity is green. Each shrink event is a step-down, shaded amber (self-inflicted overload) or red (enemy EM). The timeline reads left to right, tick by tick. At a glance, the player sees: "RELAY-NORTH started at 12, dropped to 10 at tick 8, dropped to 8 at tick 12, held at 8 through tick 30." The shape of the degradation curve tells the story — a sharp early drop followed by a plateau says "the EM pulse hit early and my relay survived in a diminished state." A gradual staircase says "sustained pressure eroded the unit over the whole battle."

---

## Comparable Games

### Cogmind — Part-by-Part Degradation (Direct Ancestor)
The inspiration and benchmark. Cogmind's parts-as-ablative-armor creates a continuous degradation experience: you watch your carefully assembled build disintegrate under fire, one part at a time, each loss changing what you can do. The emotional resonance is acute — losing your sensor array does not kill you, but it makes you blind. Losing your cloaking device does not kill you, but it makes you visible. Each loss is a small death of capability. Robot Uprising's buffer shrinkage maps to this precisely: each lost slot is a small death of cognition. The key difference — Cogmind's degradation is physical (parts rip off visibly), Robot Uprising's is cognitive (the buffer bar contracts). Both create the same player feeling: "I am less than I was."

### FTL: Faster Than Light — System Damage
FTL's ship has discrete systems (weapons, shields, engines, medbay, doors, sensors, piloting) that take damage from enemy fire. A damaged weapons system charges slower. A damaged engine gives lower evasion. A destroyed sensors system removes enemy ship visibility — you cannot see their rooms, their crew, their systems. System damage creates mid-states: your ship is not destroyed, but it is degraded in specific, diagnosable ways. FTL's system damage teaches the same lesson as buffer shrinkage: the enemy is attacking your capability, not your health. The repair mechanic (crew members walk to the damaged system and fix it over time) maps to Model B recovery (slow slot regeneration).

### Into the Breach — No Degradation by Design
Into the Breach deliberately avoids degradation. Mechs have HP, but HP is a discrete resource (1-4 points) that does not affect capability. A mech at 1 HP fights identically to a mech at 4 HP. There is no "damaged" state. This is a principled design decision: degradation would add a variable the player must track per mech per turn, and Into the Breach's design philosophy is "sacrifice cool ideas for clarity every time." The lesson for Robot Uprising: if buffer degradation makes the sealed watch harder to read, Into the Breach says cut it. The bar for inclusion is not "is this interesting?" but "is this legible at a glance?"

### Darkest Dungeon — Stress as Cognitive Degradation
Darkest Dungeon's stress system is the closest analog to buffer shrinkage in an RPG context. Heroes accumulate stress from horror, darkness, critical hits, and bad events. At 100 stress, a hero "breaks" — gaining a negative affliction (Irrational, Fearful, Paranoid, Selfish, etc.) that changes their behavior unpredictably. The hero is not dead. The hero is cognitively compromised. An Irrational hero refuses healing. A Paranoid hero accuses allies of conspiring against them. The stress system transforms a functional party member into an unreliable agent whose behavior diverges from the player's intentions.

This is almost exactly what buffer degradation does to Robot Uprising agents. A degraded scout does not die — it becomes unreliable. Its rules evaluate against fewer buffer entries, leading to different (often worse) decisions. The scout's behavior diverges from the player's design because the design assumed a 6-slot buffer and the scout now has 4. Like Darkest Dungeon's stress break, the degradation does not remove the unit from play — it makes the unit act in ways the player did not intend. The drama is not death. The drama is watching your creation malfunction while still technically alive.

The critical difference: Darkest Dungeon's stress breaks are random (the specific affliction is unpredictable). Robot Uprising's buffer degradation is deterministic (the exact behavior change is traceable in the Inspector). This makes degradation feel fair — the player can diagnose exactly why the degraded relay failed and design around it. Darkest Dungeon's randomness creates helplessness. Robot Uprising's determinism creates accountability.

---

## Sensory Description: What Degradation Looks and Feels Like

**The moment of degradation:** A purple-white ripple expands from the EM source, traveling 1 tile per 100ms until it reaches 3-tile radius. Every unit within the ripple shudders — not the sharp jitter of stun, but a slower, heavier dimming. The unit sprite drops to 60% brightness for 200ms, as if the lights inside the robot flickered. The buffer bar at the bottom of the unit tile begins its contraction: the rightmost pips do not empty (that is eviction). They dissolve. The pixel data within each dying pip fragments — green or blue color breaks into grey-white static noise, like a television losing signal, over 150ms. The pip outline remains for another 100ms as a ghost, then fades entirely. The buffer bar is now physically shorter. The dead zone where the pips used to be fills with a faint static pattern — a 2x2 pixel noise texture at 20% opacity, barely visible, but present. A scar on the UI.

**A degraded unit at rest:** The unit sprite returns to normal brightness after the initial dimming. Nothing about the unit looks damaged from the sprite alone — this is not HP, there is no cracked chassis or sparking wire. The damage is visible only in the buffer bar, which is shorter than it should be. A healthy Relay has a buffer bar that spans the full width of the tile's lower edge — 12 segments in a neat row. A degraded Relay's bar stops short, with the static-noise dead zone filling the remaining space. The visual reads as "this unit's mind is smaller than it was designed to be." Players who have seen the degradation animation know what the dead zone means. Players who have not will notice the shorter bar and investigate in the Inspector.

**A unit at minimum viable buffer:** The buffer bar is barely visible — 3 pips on a Scout, 4 on a Striker. The dead zone dominates the bar's footprint. The static noise is denser at this extreme — no longer 20% opacity but 40%, a visible crackling at the edge of the unit's cognitive capacity. The unit functions. It moves, perceives, evaluates rules, fires hooks. But the buffer bar looks like a terminal patient's vital signs — short, compressed, barely registering. In the Inspector, the decision trace for a minimum-buffer unit reads like a person making decisions with no context: "IF enemy_visible THEN move_toward. Evaluated against buffer: [1 observation, 0 signals, 0 history]. Decision: move toward the only thing I know about." The unit is not stupid. It is amnesiac.

**The sound of degradation:** Not the sharp crack of the one-shot-one-kill death. A lower, softer sound: a descending digital tone (300Hz to 150Hz over 400ms) with a faint crackle overlay — the sound of a capacitor discharging, of a system losing voltage. The sound is quieter than the combat death sound and lower in pitch. It sits under the battle's audio rather than over it. The player does not consciously hear it on the first encounter, but by the third EM pulse, the descending tone is associated with "something got dumber." In a busy battle with multiple EM pulses, the overlapping descending tones create a chord that sinks lower and lower — a harmonic representation of your army's cognitive decline.

---

## The Fundamental Design Question

Should this be in the game?

The case for: one-shot-one-kill creates a binary world — alive/dead, functional/eliminated. Binary creates clarity but limits texture. Every battle is a sequence of presence/absence events: units appear, units die, the board empties. There is no slow deterioration, no fighting retreat, no last stand with wounded units. Degradation adds that texture without HP bars. A degraded army that fights through an EM assault and wins despite diminished cognition is a story that binary death cannot tell.

The case against: Robot Uprising's identity IS the binary. The game is about designing systems so robust that they do not need a mid-state between "working" and "destroyed." The one-shot-one-kill philosophy says: if your system fails, the unit dies. Design better. Adding degradation creates a comfort zone — "well, my relay got hit but it is still working at 67%" — that undermines the all-or-nothing design stakes. Into the Breach chose no degradation for this exact reason. Every mech fights at 100% capability until it dies. The clarity is the point.

The middle ground: degradation as a **late-game tech tree mechanic**, not a core system. Missions 1-7 are pure one-shot-one-kill. Mission 8 introduces EM emitters as a new enemy type. The Information Warfare tech tree branch unlocks degradation as a weapon you can use against the enemy's information architecture. Buffer degradation is opt-in complexity — available in the campaign's second half and in the Gauntlet mode, absent from the tutorial and early missions. Players who want the clean binary keep it. Players who want Cogmind-style texture find it.

This preserves both philosophies: the core game is binary and clear; the advanced game adds a rich mid-state for players who have already mastered the fundamentals. The degradation mechanic rewards players who understand buffer management deeply enough to design around variable capacity. It punishes no one who does not engage with it — until the campaign demands they do.

---

## New Aspects Discovered

- **1.20b-i — EM Emitter enemy type:** Full specification of the EM emitter as a non-lethal ranged threat. Stat block, AI behavior, counter-strategies, interaction with the stealth/emission tension (EM emitters must detect targets to pulse — cloaked units are immune).
- **1.20b-ii — Overload aftershock tuning:** The 3-tick threshold for self-inflicted degradation. Should it be 3 ticks? 5? Should the aftershock shrink 1 slot or scale with overload severity? Tuning pass with player journey impact analysis.
- **1.20b-iii — Degradation and the Gauntlet (async PvP):** In PvP Gauntlet matches, EM degradation becomes a player-usable weapon. Designing blueprints that carry EM pulse skills creates a new offensive axis: attack the opponent's cognition, not their units. The meta implications of "lobotomize don't kill" strategies.
- **1.20b-iv — Pinned slot vulnerability toggle:** A mission modifier or Ascension mutator: "Exposed Memory — EM pulses can destroy pinned slots." Dramatically increases stakes. A player's carefully authored directives become fragile. The unit's personality is at risk.
- **1.20b-v — Visual language for partial vs. full damage:** The buffer bar dead zone (static noise) needs a complete visual specification per biome. Does the static look different on a Siquijor unit vs. a Cebu unit? Does the degradation visual adapt to the biome's color palette?
