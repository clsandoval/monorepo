# 1.09a — The "Drawback as Fuel" Cross-Agent Pattern

## Overview

The "drawback as fuel" pattern is one of the oldest and most generative design patterns in combinatorial games: a component's explicit downside becomes the trigger, resource, or activation condition for another component. Slay the Spire's Wild Strike + Evolve is the canonical deckbuilder example, but the pattern runs through Magic: The Gathering (self-discard + Madness), Balatro (negative effects + specialized Jokers), Oxygen Not Included (polluted water as superior coolant), and Factorio (pollution attracting biters as a deliberate evolution-control lever). In Robot Uprising, this pattern maps directly onto the multi-agent architecture: a hook's EM emissions, a skill's buffer pollution, a relay's processing delay — each of these drawbacks can be *designed* to become triggers or resources for other agents in the player's network.

The combinatorial space here is enormous. With 5 unit types, each carrying skills with distinct drawbacks, the number of "my weakness is your strength" pairings grows quadratically. This analysis explores the pattern's mechanics, its precedents, and how Robot Uprising players will discover and exploit it.

## The Pattern in Existing Games

### Slay the Spire: The Ironclad Status Engine

The Ironclad's "status pollution" archetype is the clearest template. The key cards:

- **Wild Strike** — 12 damage for 1 energy, but shuffles a Wound (unplayable dead card) into the draw pile. Taken alone, Wild Strike is a card with a real cost: every Wound you add dilutes future draws, eventually clogging your hand with unplayable garbage.
- **Power Through** — Gain 15 Block, but add 2 Wounds to your hand. Even worse at first glance: the Wounds are immediate, not future.
- **Evolve** (Power) — Whenever you draw a Status card, draw an additional card. Suddenly, every Wound drawn becomes a free card draw. Wild Strike's downside becomes card advantage.
- **Fire Breathing** (Power) — Deal 6 damage to ALL enemies whenever you draw a Status or Curse card. Now Wounds are not just neutral — they are damage sources. Each Wound drawn deals 6 to every enemy on the board.
- **Fiend Fire** — Deal 7 damage for each card in your hand, then Exhaust your entire hand. A hand full of "useless" Wounds becomes a hand full of ammunition.
- **Medical Kit** (Relic) — Status cards become playable (playing them Exhausts them). The final piece: Wounds can now be played to clear them, triggering Exhaust synergies.

The genius is that no single card is broken. Wild Strike without Evolve is a mediocre card with a real downside. Evolve without status generators is a Power that does nothing. Fire Breathing without a polluted deck is 0 damage per turn. The *system* is powerful; the *components* are individually fair or even weak.

**The discovery arc matters.** A new Slay the Spire player avoids Wild Strike because Wounds are scary. A mid-level player drafts it when they already have Evolve. An expert player drafts Wild Strike *speculatively*, knowing that Evolve, Fire Breathing, or Medical Kit might appear later — and that the downside is manageable even without them if the raw 12 damage solves their immediate problem.

### Magic: The Gathering — Madness and Dredge

Magic has explored "drawback as fuel" across dozens of mechanics:

- **Madness** — Cards with Madness have an alternate, usually cheaper cost that can only be paid when the card is discarded. Cards that force you to discard (normally a pure downside) become enablers. Vampire aristocrats decks discard Fiery Temper (normally 3 mana for 3 damage) to cast it for 1 mana. The "discard a card" cost on your enablers becomes "cast a spell for cheap."
- **Dredge** — Cards with Dredge replace your draw step by milling cards from your library to your graveyard. Normally, milling yourself is suicide (you lose when your library is empty). But graveyard-matters cards like Narcomoeba (enters the battlefield when milled) and Bridge from Below (creates Zombie tokens when creatures die while it is in your graveyard) turn self-mill into an army-generation engine. The Dredge deck in Legacy literally *wants* to destroy its own library.
- **Self-Discard** — Black decks built around reanimation deliberately discard expensive creatures (Griselbrand, Archon of Cruelty) to cheat them into play with Reanimate or Exhume. The "drawback" of having a 15-mana creature stuck in your hand becomes the *setup* for a turn-2 kill.

The consistent lesson: the strongest "drawback as fuel" patterns create a **phase transition**. Below a critical mass of synergy pieces, the drawbacks are genuinely painful. Above that threshold, the drawbacks become the primary engine. The transition point is where the excitement lives.

### Balatro — Negative Effects as Build-Around

Balatro takes this further with deliberate architectural support for "bad thing = good thing" strategies:

- **Rental Sticker** makes a Joker cost $3 per round (normally pure downside). But a Joker that gains power based on debt turns Rental into an accelerant.
- **Perishable Sticker** makes a Joker expire after 5 rounds. But a Joker that triggers when other Jokers are destroyed turns Perishable into a countdown timer for a powerful effect.
- **Crimson Heart blind** randomly disables one Joker per hand played. Normally devastating. But a Joker that creates new Jokers when others are disabled turns the Crimson Heart from a crippling debuff into a Joker-generation engine.

Balatro's lesson for Robot Uprising: the *environment* can impose drawbacks that skilled players convert to advantages. Enemy actions that flood your agents' context windows (normally crippling) could fuel agents specifically designed to harvest noise.

### Oxygen Not Included — Waste Streams as Resources

ONI's entire mid-to-late game is built on "drawback as fuel." Polluted water — the primary waste product of almost every system — turns out to be a *better coolant* than clean water (wider temperature range, higher specific heat capacity). Duplicant excretions, machine heat exhaust, carbon dioxide output — every waste stream has a conversion path that makes it valuable. The player who treats polluted water as garbage builds a water sieve and wastes power purifying it. The player who understands "drawback as fuel" routes polluted water through their industrial cooling loop, irrigates Thimble Reed farms for plastic, and feeds the remainder to a Fertilizer Synthesizer whose natural gas byproduct powers a generator.

**Robot Uprising parallel:** EM emissions from hook transmissions are the game's "pollution." Deeper communication architectures are smarter but louder. A naive player minimizes emissions by using fewer hooks. An expert player designs a decoy agent whose *purpose* is to emit loudly on a sacrificial channel, drawing enemy attention while the real signal chain operates on a different frequency. The emission waste becomes a tactical asset.

### Factorio — Pollution as Evolution Pressure

Factorio's pollution mechanic is the macro-scale version. Every machine produces pollution. Pollution attracts and strengthens biters. The naive response is to minimize pollution (efficiency modules, solar power). The expert response is more nuanced: some players deliberately *accept* pollution in specific sectors to funnel biter attacks toward prepared kill zones, farming the biters for evolution-gated resources. The pollution isn't minimized — it is *shaped*.

## How It Maps to Robot Uprising

### The Drawback Vocabulary

Robot Uprising's locked design gives us specific drawbacks tied to agent capabilities:

| Drawback | Source | Why It Hurts |
|----------|--------|-------------|
| **EM emissions** | Hook transmissions | Alerts enemies to agent positions; deeper architectures are louder |
| **Buffer pollution** | Incoming signals, observations | Fills context window slots with low-value data; can cause context overload (1-tick stun) |
| **Processing delay** | Signal latency (1 tick/hop) | Multi-hop chains arrive too late; scout intel is stale by the time striker receives it |
| **Context overload stun** | Buffer reaching capacity | Agent loses 1 tick entirely — potentially fatal in one-shot-one-kill |
| **Wound injection** (status cards in deck) | Certain skills that add noise entries | Pollutes other agents' context windows via shared channels |

### The Fuel Vocabulary

Each drawback has natural consumers:

| Drawback | Fuel For | Mechanism |
|----------|----------|-----------|
| EM emissions | **Decoy/bait agents** | An agent whose purpose is to emit loudly, drawing enemy strikers away from the real squad |
| EM emissions | **Counter-intelligence detection** | A specialist with a hook that triggers on EM spikes, identifying enemy agent positions by their transmissions |
| Buffer pollution | **Compress skill value** | A relay's compress skill is worthless with clean buffers; it becomes essential when buffers are flooded |
| Buffer pollution | **Fire Breathing equivalent** | A hypothetical "noise harvester" skill that converts noise entries to damage/action triggers |
| Processing delay | **Predictive positioning** | A command agent that accounts for signal latency by issuing orders N ticks ahead, turning delay into a planning advantage |
| Context overload stun | **Trap bait** | Deliberately overloading an *enemy* agent's buffer to stun it for 1 tick, creating a kill window |
| Context overload stun | **Post-stun compaction trigger** | After a stun, the agent's buffer has been compacted (low-priority entries evicted). A hook that triggers on "buffer compacted" could fire a burst action with a freshly cleaned context |

### The Combinatorial Space

With 5 unit types and multiple skills/hooks each, the pairings multiply:

- **Scout (patrol + evade) drawback:** Wide perception radius fills buffer fast with observations. Emits on hooks when reporting. *Fuel for:* Relay compress skill (needs noisy input to be valuable), Specialist extract skill (more observations = more intel to extract).
- **Relay (compress + filter + amplify) drawback:** Stationary, no perception, high buffer means it *collects* noise from every channel it listens to. *Fuel for:* Its own compress skill (self-feeding loop), Command agent's prioritize skill (needs a noisy relay to demonstrate value of prioritization).
- **Striker (engage + breach) drawback:** Narrow perception means it operates blind without external intel. Must rely on signals, which arrive with latency. *Fuel for:* The latency itself rewards pre-positioning; a command agent that routes striker toward predicted enemy positions (not current ones) turns the latency into anticipatory movement.
- **Specialist (hack + extract) drawback:** Medium perception and cost. Hack skill might inject noise into enemy channels (but also pollutes your own if channels overlap). *Fuel for:* Counter-intelligence — the noise the specialist injects into enemy channels can carry a detectable signature that your own scout picks up as "confirmed enemy presence."
- **Command (reassign + reroute + prioritize) drawback:** Highest cost (10m, 4e/tick), stationary, no perception. 6 hook slots means maximum EM emission. *Fuel for:* The command agent IS the decoy. Its loud EM signature draws enemy attention while mobile agents operate radio-silent.

## Player Journeys

### Journey: Priya, 29, Software Engineer (Plays Factorio, new to Robot Uprising)

**Context:** Mission 6. Priya has unlocked the Command agent and is learning factory production. She has been running a basic Scout-Relay-Striker chain that works but keeps getting ambushed — enemies seem to find her relay.

**Minute 0:00 — The Emission Problem**
Priya opens the Plan screen. The workbench shows her three blueprints: Scout-Alpha (patrol, evade, hooks on "recon-net"), Relay-Core (compress, filter, hooks on "recon-net" and "strike-orders"), Striker-One (engage, hooks listening on "strike-orders"). The small tactical map preview in the corner shows enemy spawner positions in the northeast. She notices a new overlay toggle in the bottom-left: "Emission Preview" — a heatmap showing predicted EM output per tile based on her hook wiring. She toggles it on. The relay's position glows angry orange. Two hooks broadcasting every tick. She mouse-hovers the relay tile and a tooltip reads: "Estimated EM: 4.2 units/tick. Enemy detection range: 3 tiles." Her relay is a beacon.

**Minute 1:30 — The Failed Fix**
Her first instinct: reduce hooks. She opens Relay-Core's blueprint and removes the "recon-net" listener hook. The emission preview dims to yellow (2.1 units/tick). But now the relay doesn't receive scout data at all. She runs a battle. The scout spots enemies at T4, broadcasts on "recon-net" — and nothing happens. The relay never compresses the signal. The striker never moves. Enemies overrun the position by T9. The sealed watch is a disaster. Priya watches her scout frantically broadcasting while the striker stands idle two tiles away.

**Minute 4:00 — The Inspector Revelation**
In the inspector, Priya clicks the dead relay. The decision trace shows: "T4: No hook triggered. 'recon-net' channel: not listening." She scrubs to T6 and clicks the enemy striker that killed her relay. Its decision trace shows: "T3: Detected EM signature at [D,4]. Moving toward source." She stares. The enemy *followed the emissions.* She clicks her scout — it also has EM output (1.8 units/tick from its own hooks). But the relay was louder. The enemy prioritized the loudest source.

**Minute 6:00 — The Aha Moment**
Priya has a Factorio instinct: pollution funneling. If the enemy follows EM emissions, she can *shape* the emission profile to draw enemies where she wants them. She creates a new blueprint: "Decoy-Beacon." It is a Relay with no compress skill, no filter — just 4 hook slots all broadcasting dummy signals on a channel called "noise." Its only purpose is to be loud. She positions the decoy far from her real relay, near a chokepoint where her striker patrols. The emission preview shows the decoy blazing red (8.4 units/tick) while her real relay, now with a single carefully-filtered hook, glows dim blue (1.0 units/tick).

**Minute 8:30 — The Payoff**
She hits EXECUTE. The sealed watch unfolds: T1-T5, enemies spawn and begin moving. By T7, three enemy units converge on the decoy beacon's position — right into the chokepoint where Striker-One patrols. T8: Striker-One eliminates the first enemy. T9: The second. The decoy relay is destroyed at T10, but by then the enemy force is shredded. Her real relay, silent and safe, continues routing compressed intel to Striker-Two on the other flank. Priya grins. She didn't reduce the noise — she *weaponized* it.

**Minute 10:00 — Resolution**
The mission succeeds. In the inspector, Priya traces the emission heatmap replay: a bright red dot on the decoy drawing every enemy pathfinding line, while the real network operates in cool blue silence behind it. She takes a screenshot. She wants to tell someone about this. The decoy cost 5 minerals and lasted 10 ticks — the cheapest, most effective unit she has ever built.

**UI Annotations:**
- **Emission Preview heatmap:** Toggle button bottom-left of tactical map. Red = high EM, blue = low. Per-tile resolution. Hover for exact unit/tick numbers.
- **Decision trace "Detected EM" entry:** Shows in enemy unit inspector. Reveals that enemies pathfind toward emission sources.
- **Decoy-Beacon blueprint:** Relay body, 4 hook slots filled with broadcast-only hooks on "noise" channel. No skills equipped. Cost: 5m, 2e/tick.

---

### Journey: Marcus, 34, Card Game Veteran (2000+ hours in Slay the Spire, recognized the pattern instantly)

**Context:** Mission 8. Marcus has been playing aggressively, building deep communication chains. He is now facing factory-vs-factory battles where the enemy also produces units. His current problem: his scouts keep getting context-overloaded by enemy noise flooding.

**Minute 0:00 — The Noise Problem**
The plan screen shows Marcus's setup. He has a sophisticated 4-unit chain: Scout-Recon → Relay-Hub → Relay-Filter → Striker-Squad. But the inspector from last mission showed something ugly: enemy specialists are broadcasting garbage on common channel names, flooding his scout's context window. His Scout-Recon has a 6-slot buffer. By T6 last mission, all 6 slots were full of enemy noise. T7: context overload. 1-tick stun. T8: enemy striker moved adjacent. T9: scout eliminated. The cascade failure took out his entire intel chain.

**Minute 1:00 — The Slay the Spire Pattern Recognition**
Marcus stares at the problem. Six buffer slots, filling with noise — dead entries that do nothing. His mind flashes to Wild Strike + Evolve. The Wounds were dead cards until Evolve turned them into draw. The noise entries are dead context until... what? He opens the Skill catalog in the Blueprint Codex. He scrolls past compress, filter, amplify. He stops on a skill he has never used: **"extract"** — the Specialist's skill. Description: "Analyze context window contents. For each foreign signal detected, generate an intel report on the signal's origin." He reads it twice. Foreign signals — that is the enemy noise. The enemy is *telling him where they are* by flooding his channels.

**Minute 3:00 — Building the Trap**
Marcus redesigns his scout. Scout-Recon keeps patrol and evade. But he removes the "recon-net" broadcast hook and replaces it with a hook that triggers on context overload: "ON_OVERLOAD → broadcast on 'noise-harvest'." He creates a new Specialist blueprint: "Intel-Fisher." Its extract skill is configured to analyze the contents of "noise-harvest" signals. For every piece of enemy noise the scout received, the specialist generates a location ping for the enemy agent that sent it. The specialist then broadcasts these pings on "confirmed-targets" — which the Striker-Squad listens to.

**Minute 5:30 — The Elegance**
Marcus looks at what he has built. The enemy floods his scout with noise → scout overloads and is stunned for 1 tick → the overload event fires the "noise-harvest" hook → the specialist receives the noise dump → extract skill converts each noise entry into an enemy position → striker receives confirmed target coordinates. The enemy's attack (noise flooding) has become Marcus's targeting system. He adds one more refinement: the scout's context config sets eviction priority to "oldest first," meaning the noise entries that survive longest are the *most recent* enemy transmissions — the freshest targeting data.

**Minute 7:00 — The Sealed Watch**
EXECUTE. The battle is chaotic. T1-T4: Marcus's scout patrols the center, buffer slowly filling. T5-T6: enemy specialists begin noise flooding on the scout's channel. The scout's context bars fill rapidly — blue to amber to red. T7: overload. The scout sparks and jitters, stunned for one tick. But the "ON_OVERLOAD" hook fires. A burst of data blasts to "noise-harvest." T8: the Specialist-Intel-Fisher receives the noise dump. Extract processes it. Three enemy position pings go out on "confirmed-targets." T9: Striker-Squad has three targets locked. It moves toward the nearest. T10: first enemy specialist eliminated — the one that was flooding the channel.

Marcus leans back. The scout lost 1 tick to overload. But the overload *was the trigger* for the entire kill chain. If the enemy hadn't flooded the channel, Marcus's system wouldn't have identified the enemy specialists at all. The attack was the fuel.

**Minute 9:00 — Resolution**
Mission won. In the inspector, Marcus traces the full chain: enemy noise → scout overload → hook fire → specialist extraction → striker targeting → elimination. He counts the entries in the specialist's context window at T8: three foreign signal analyses, each with a grid coordinate. The specialist's decision trace shows: "T8: extract skill activated. Processed 5 noise entries. Generated 3 unique position reports (2 entries were duplicate origin)." Marcus screenshots the decision trace. This is his favorite moment in the game so far.

**UI Annotations:**
- **ON_OVERLOAD hook trigger:** Special hook type that fires when a unit's context window reaches capacity. Configurable in hook editor.
- **Extract skill output:** Generates structured intel reports from raw context data. Each report includes: signal origin grid coordinate, signal type, confidence rating.
- **Context overload animation:** Unit sprite jitters with cyan spark particles for 1 tick. Context bar flashes red then resets to green as low-priority entries are evicted.

---

### Journey: Alex, 22, College Student (First strategy game, discovered the pattern by accident)

**Context:** Mission 5. Alex just unlocked the factory system. They are overwhelmed by the blueprint editor and have been randomly assigning skills and hooks without a clear plan. They have no background in card games or programming.

**Minute 0:00 — The Messy Setup**
Alex's plan screen is a mess. They have three blueprints, all slightly wrong. Scout-1 has patrol and a hook broadcasting on "alert" — but also has compress equipped (a relay skill that does nothing on a scout, wasting a skill slot). Relay-1 has filter and amplify, listening on "alert" and broadcasting on "orders." Striker-1 listens on "orders" with engage skill. The production queue has Scout-1 first, then Striker-1, then Relay-1. Alex does not realize the relay will be built last, meaning the scout and striker will be operating without a relay for the first several ticks.

**Minute 1:30 — The Accidental Overload**
EXECUTE. T1: Scout-1 spawns. T3: Striker-1 spawns. T5: Relay-1 spawns. But by T5, Scout-1 has been broadcasting on "alert" for 4 ticks. The relay spawns and immediately receives 4 ticks of backlogged signals. Its 12-slot buffer fills with stale scout observations from T1, T2, T3, and T4. The relay's amplify skill fires on every signal — amplifying stale data. The striker receives a blast of 4 amplified signals at once. Its 8-slot buffer fills instantly: context overload. Striker-1 is stunned at T6.

**Minute 3:00 — The Inspector Confusion**
After losing (the stunned striker was eliminated at T7), Alex enters the inspector. They click the striker. The context window visualization shows 8 slots, all full at T6 — every slot contains an "alert" signal from the relay, each one a different tick's scout observation. The sparkline chart shows the buffer going from empty to full in a single tick. Alex reads the decision trace: "T6: Context overload. All slots occupied. Entering recovery state." They click the relay. Its amplify skill processed every buffered signal and broadcast them all at once to "orders." Alex realizes the amplify skill did exactly what it was supposed to — it just did too much of it at once.

**Minute 5:00 — The Filter Discovery**
Alex notices the relay also has the filter skill equipped. They hover over it in the codex. Description: "Suppress signals matching configured criteria. Filtered signals are discarded before entering context window." They wonder: what if the filter was set to discard signals older than 2 ticks? They go back to the plan screen. They open Relay-1's blueprint. In the filter skill config, they see a dropdown: "Discard signals older than: [___] ticks." They type "2." Now the relay will trash any scout signal more than 2 ticks old before amplifying it.

**Minute 6:30 — The Accidental Genius**
Alex re-runs the mission. This time, when Relay-1 spawns at T5, it receives the 4 backlogged signals — but the filter discards T1 and T2's signals (older than 2 ticks). Only T3 and T4's observations pass through. Amplify fires on 2 signals instead of 4. The striker receives 2 amplified signals — well within its 8-slot buffer. No overload. The striker acts on the T4 scout data (1 tick stale, acceptable) and moves to intercept the enemy. Mission succeeds.

**Minute 8:00 — The Deeper Realization**
In the inspector, Alex traces the chain again. They notice something: the *discarded* signals from T1 and T2 actually contained useful information — an enemy unit that moved through the scout's perception at T1 and was gone by T3. The filter threw away the only sighting of that enemy. Alex thinks: the filter solved the overload problem but lost intel. What if instead of discarding old signals, there was a way to *compress* them? They look at the Relay skills again: compress. "Merge multiple signals about the same subject into a single summary signal." If the relay had compress instead of amplify, the 4 signals might have been merged into 1 signal containing all unique observations. No overload, no lost data.

Alex drags the compress skill into the relay blueprint, replacing amplify. They have just independently discovered that buffer pollution (too many signals) is not solved by *removing* the pollution but by *processing* it — the relay's compress skill turns noisy, redundant buffer contents into clean, dense intel. The drawback (signal backlog flooding the relay) became the fuel for a skill that is worthless without noisy input.

**Minute 10:00 — Resolution**
Alex does not have the vocabulary for what they learned. They would not say "drawback as fuel pattern." But they *felt* it: the moment when "too many signals" stopped being a problem and started being an opportunity. They now understand that the relay is not just a passthrough — it is a refinery. Noise goes in, signal comes out. The more noise, the more valuable the refinery. They want to build a second relay.

**UI Annotations:**
- **Filter skill config:** Dropdown with age threshold in ticks. Discarded signals show briefly as grayed-out entries before vanishing from the relay's buffer visualization.
- **Compress skill output:** Multiple entries with matching subject tags collapse into a single bright-outlined entry. The compressed entry shows a small "x3" or "x5" badge indicating how many raw signals were merged.
- **Buffer fill sparkline:** Visible in inspector sidebar. Green when under 50%, amber at 75%, red pulse at 100%. The spike from empty-to-full is visually alarming — a tall vertical line in the sparkline that screams "something went wrong."

---

## Strengths of the Pattern

1. **Emergent depth without mechanical complexity.** The drawback-as-fuel pattern does not require new rules. It emerges from existing interactions between skills, hooks, and context windows. The game does not need a "synergy system" — synergy IS the system.

2. **Discovery reward curve.** The pattern rewards observation and experimentation. Players who pay attention to *why* they lost (context overload, emissions detection) discover *what to do about it* (harvest the overload, shape the emissions). Each loss contains the seeds of the next win.

3. **Anti-degenerate design.** Because every powerful strategy has a drawback, and every drawback can be converted to fuel, there is no stable "best build." An opponent who floods your channels expecting to cripple you is feeding your intel-extraction engine. An opponent who goes radio-silent to avoid emissions detection also cuts off their own coordination. The meta rotates.

4. **Teaches real agentic engineering.** In production AI systems, failures and noise are genuine signals. Error logs, timeout events, retry cascades — these are all "drawbacks" that observability systems convert to actionable intelligence. The pattern is not metaphorical; it is the literal discipline the game teaches.

## Weaknesses and Risks

1. **Discoverability cliff.** If the game does not surface the drawback-fuel relationship, most players will never find it. The emission preview heatmap, context overload animations, and inspector decision traces must make the causal chain *visible*. Without these affordances, the pattern is hidden behind opaque systems.

2. **Cognitive overload.** Tracking which drawbacks feed which skills across a 4-5 agent network is mentally taxing. The game needs visualization tools (channel flow diagrams, emission overlays, buffer pressure maps) to keep the combinatorial space legible.

3. **Turtling risk.** If decoy/emission-shaping becomes too effective, players may optimize for "do nothing but bait" strategies. The factory resource cost and tick clock should pressure toward action, but this needs careful tuning.

4. **Explanation debt.** The pattern is hard to explain in text. Tutorials must *show* it through play, not tell it through tooltips. Mission 3-4 should engineer a scenario where the player's first context overload naturally leads to discovering the compress or filter skill as the solution.

## Interaction Effects

- **Ties to emissions model (locked):** The EM emissions mechanic is the primary source of "drawback as fuel" opportunities. Without emissions, half the pattern disappears.
- **Context overload as stun (locked):** The 1-tick stun on context overload is the cost that makes buffer pollution genuinely threatening — and therefore genuinely valuable when converted.
- **Signal latency (locked):** 1 tick per hop means multi-hop chains have inherent delay. This delay can be "fuel" for predictive command agents that account for latency in their orders.
- **One-shot-one-kill (locked):** The lethality model makes 1-tick stun potentially fatal, raising the stakes of both the drawback and its conversion.
- **Inspector tool (locked):** The decision trace and context window inspector are essential for players to *see* the drawback-fuel chain. Without them, the pattern is invisible.

## Comparable Games Summary

| Game | Drawback | Fuel Conversion | Lesson for Robot Uprising |
|------|----------|----------------|--------------------------|
| Slay the Spire | Wild Strike → Wounds in deck | Evolve draws on Status; Fire Breathing deals damage on Status | Individual pieces must be fair; combos must be discovered |
| Magic: The Gathering | Self-discard, self-mill | Madness casts from discard; Dredge generates from graveyard | Phase transitions create excitement — below threshold it hurts, above it wins |
| Balatro | Rental costs, Perishable timers, disabled Jokers | Debt-scaling Jokers, destruction-triggered Jokers | The environment can impose drawbacks that experts convert |
| Oxygen Not Included | Polluted water, heat, CO2 | Superior coolant, steam power, plant growth | Waste streams should have multiple conversion paths |
| Factorio | Pollution attracts biters | Kill-zone funneling, evolution control | Drawbacks can be shaped spatially, not just eliminated |

## Sensory Description

**The moment of conversion.** When a scout overloads and the noise-harvest hook fires, the visual should be unmistakable: the scout's context bar flashes red, cyan spark particles burst from the unit sprite, and then — instead of the usual stun-jitter — a bright data stream arcs from the scout to the specialist, colored the same angry red as the overload but shifting to cool cyan as it travels. The specialist's context bar fills with structured entries (each rendered as a crisp horizontal line with a target icon). The sound: a high-pitched alarm tone (the overload) that pitch-shifts downward into a deep, satisfying bass thrum (the conversion). The feeling is alchemical — dross becoming gold, in real-time, on the battlefield.

**The emission heatmap.** On the plan screen, toggling the emission preview overlays a translucent heatmap on the tactical map. High-emission tiles glow furnace-orange with animated heat shimmer. Low-emission tiles are cool blue, almost invisible. The player's decoy beacon blazes like a bonfire. The real relay is a cold shadow. The visual metaphor is thermal — hot draws attention, cold hides. When the player drags a hook into a blueprint slot, the heatmap updates in real-time, the tile brightening as the hook is added, dimming as it is removed. The correlation between "wiring complexity" and "emission loudness" is felt before it is understood.

**The TikTok clip.** Fifteen seconds: a scout surrounded by enemies, context bar full red, sparking — overload. Cut to: a burst of data arcing across the battlefield to a specialist. Cut to: three target pings appearing on the striker's context window. Cut to: the striker snapping to the nearest enemy. Elimination flash. Cut to: the second enemy. Elimination flash. Cut to: the scout, stunned but alive, buffer compacted, ready for the next cycle. Text overlay: "The enemy tried to blind me. I made it my targeting system." The clip sells the fantasy of outsmarting an opponent by turning their own attack against them.
