# Onboarding: The Reagent-Placement-as-Choice Design Pattern

**Aspect ID:** 5.13
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 1.03 (Opus Magnum), 5.01 (tutorial as puzzle), 5.04 (complexity ramp), 5.04a (Mission 5 Wall), 3.05 (rules language), 3.11 (hooks UI), 5.10 (product as puzzle), 5.09 (replayability)

---

## The Core Insight: Hidden Degrees of Freedom

In Opus Magnum, reagent positions appear fixed. New players assume the silver mercury atoms *must* sit where the puzzle places them. They build their first machine around those positions — arms reaching for the reagent at hex (2,1), glyphs positioned relative to that fixed anchor. Then, sometimes on their third or tenth puzzle, they accidentally drag a reagent to a different hex. The reagent moves. It was never fixed. The entire workspace was theirs.

This is the **double reveal**: the player first discovers the *solution* (how to build a machine that works), then discovers the *solution space* (that the starting conditions themselves are variables). The second discovery is more powerful than the first. It transforms the game from "solve the puzzle" to "choose your own puzzle." It's the difference between finding the answer to a math problem and realizing you can change the question.

Zachtronics designer Zach Barth has spoken about this: the infinite hex grid and movable reagents are intentional design choices that distinguish Opus Magnum from SpaceChem (which had fixed, bounded workspaces). The removal of that one constraint — the grid boundary — transformed the experience from constrained optimization to open-ended engineering.

**Why this pattern matters for Robot Uprising:** The locked design has several elements that *look* fixed but could contain hidden choice surfaces. Discovering that these are variable would create the same "wait, I can move THAT?" revelation. In a game about information architecture — where the core lesson is "the configuration determines the outcome" — the double reveal teaches a meta-lesson: "even things you assumed were given are part of the configuration."

This is not just a tutorial technique. It's a **philosophy of game design as epistemology**. The player's relationship to the system evolves: from operator (following rules) to architect (designing within constraints) to meta-architect (questioning which constraints are real).

---

## What's "Fixed" in Robot Uprising That Could Be Variable

The locked design has several surfaces where the double-reveal pattern could apply. Each creates different gameplay implications and emotional beats.

### Surface 1: Hook Topology and Channel Naming

**The apparent constraint:** In early missions (M1-4), pre-placed units come with pre-configured hooks wired to named channels. The channels have names like "recon-net" or "strike-cmd." Players configure rules and context filters but don't touch the hook wiring.

**The hidden freedom:** Channel names are arbitrary strings. The player types them. "recon-net" is not a system keyword — it's just a name the pre-configuration chose. The player could rename it "bob" and it would still work. More importantly, the *topology* — which units listen to which channels — is entirely the player's choice. The pre-placed configuration suggests a star topology (scout → relay → striker), but a mesh, ring, or even a one-to-one private channel topology would work too.

**The double reveal moment:** Mission 5 introduces the factory and blueprints. The player must configure hooks from scratch for the first time. They see the channel name field — empty. They type a name. The channel appears in the channel map panel. They wire a second blueprint to the same channel. They realize: *this was always a choice.* The pre-configured channels in M1-4 were just one possible wiring. The topology was never fixed.

**Design implication:** The tutorial missions (M1-4) should use channel names that are descriptive enough to be helpful but distinctive enough to be obviously authored. "recon-alpha" or "scout-report" — names that a human clearly chose, not system defaults. When the player later creates their own channels, the naming act itself signals ownership. The channel was always yours to name.

### Surface 2: Production Queue Ordering

**The apparent constraint:** The conveyor belt shows blueprints in a fixed order. The player assumes the order was determined by the game (or by the order they created blueprints).

**The hidden freedom:** The production queue is drag-to-reorder. Build order determines which units arrive first. In a one-shot-one-kill game with 1-tick signal latency, getting a scout out 2 ticks before a striker vs. 2 ticks after changes everything.

**The double reveal moment:** A player loses a mission because their strikers spawned before their scouts. No reconnaissance data existed when the strikers entered the field. They were blind. In the debrief, the Inspector shows the empty striker context windows at tick 3, the scout data arriving at tick 7. The player goes back to the Plan screen, looks at the conveyor belt, and drags the scout blueprint left of the striker. The next attempt: scouts spawn first, striker buffers are pre-loaded when they arrive. Victory.

**Design implication:** This is the "reagent" of Robot Uprising's factory system. Unlike Opus Magnum (where the double reveal is accidental and unscripted), Robot Uprising can *design* the revelation. A mission where the default production order is deliberately suboptimal, where the debrief highlights the timing gap, and where the fix is a single drag.

### Surface 3: Context Config Eviction Priority

**The apparent constraint:** Early missions use default eviction (oldest-first). Players assume this is how buffers work. Eviction is a background system, not something they interact with.

**The hidden freedom:** Eviction priority is player-configurable per blueprint. Oldest-first, lowest-priority-first, source-based filtering, type-based retention — each creates radically different agent behavior from the same input stream.

**The double reveal moment:** A relay unit keeps forgetting the most recent scout report because it's prioritizing stale data. The player sees the relay's context window in the Inspector: old observation in slot 1 (bright, prominent), fresh scout report evicted (dimming, sliding out). "Wait — it's keeping the OLD one?" They go to context config, find the eviction dropdown. They've never touched it. They change it from "oldest preserved" to "oldest evicted." Same buffer, same input, completely different behavior. The relay becomes competent.

**Design implication:** Eviction priority is the subtlest and most powerful hidden variable. Unlike topology (which requires structural understanding) or queue order (which requires timing awareness), eviction priority requires understanding that *the same information can be valued differently by different policies*. This is the deepest lesson in information architecture: there is no "correct" eviction policy — only policies optimized for different objectives.

### Surface 4: Rule Ordering as Hidden Priority

**The apparent constraint:** Rules are listed in a panel. Players in M3-4 learn that rules are condition→action pairs. They add rules and watch agents follow them.

**The hidden freedom:** Rule ORDER determines priority. The first matching rule fires. Two rules that could both match — "IF enemy_nearby → engage" and "IF low_context → evade" — produce different behavior depending on which comes first. The player's drag-to-reorder action is, in effect, defining an agent's value system. "Is survival more important than aggression?" becomes a question answered by list position, not by explicit priority numbers.

**The double reveal moment:** A striker keeps engaging enemies even when its context window is dangerously full (one more observation would trigger overload stun). The player has both "IF enemy_nearby → engage" and "IF context_high → evade" rules. They notice the engage rule is above the evade rule. They drag evade above engage. Same rules. Same conditions. Different behavior. The agent now retreats when overloaded, fights when comfortable.

**Design implication:** This surface is already partially taught in M3-4 (rules introduction). But the *full* realization — that rule ordering is a complete priority system, that agents with identical rules in different orders have different "personalities" — can be a later double reveal. Especially powerful when the player realizes they can create the same agent archetype (aggressive vs. defensive) entirely through ordering, without changing any rule content.

### Surface 5: Blueprint Count as Strategic Choice

**The apparent constraint:** The player creates blueprints — one for scouts, one for strikers, one for relays. Three blueprints seems natural.

**The hidden freedom:** You can create multiple blueprints for the same unit type. A "scout-flanker" and a "scout-sentinel" can coexist in the production queue. Different context configs, different rules, same underlying unit. The army becomes heterogeneous not through unit diversity but through configuration diversity.

**The double reveal moment:** The player has been using one scout blueprint. All scouts behave identically. An enemy exploits this — baiting all scouts with the same stimulus. The player realizes: "I need scouts that respond to different things." They create a second scout blueprint with different rules and different channel subscriptions. Two configurations of the same hardware. The army gains behavioral diversity.

**Design implication:** This is the factory's deepest lesson and Robot Uprising's most distinctive strategic axis. Real agentic AI engineering rarely deploys identical agents — you deploy agents with different specializations configured through different prompts, tools, and context. The "multiple blueprints per unit type" revelation teaches this directly.

---

## The Revelation Cascade: Timing the Double Reveals

The five hidden-freedom surfaces above shouldn't all be revealed simultaneously. Each teaches a different lesson at a different abstraction level. The optimal cascade:

| Mission | Surface Revealed | Lesson | Cognitive Level |
|---------|-----------------|--------|-----------------|
| M3-4 | Rule ordering | Priority as position | Concrete (drag = value) |
| M5 | Production queue order | Timing determines information flow | Temporal (sequence matters) |
| M5-6 | Channel naming / topology | Architecture is a choice | Structural (wiring is design) |
| M6-7 | Eviction priority | Same data, different policies | Abstract (policy as value system) |
| M7-8 | Multiple blueprints per type | Configuration diversity | Meta (blueprint as design variable) |

Each revelation builds on the previous. You can't appreciate configuration diversity (M7-8) without understanding that topology is a choice (M5-6). You can't appreciate topology as a choice without understanding that order matters (M5). The cascade is pedagogically ordered from concrete to abstract.

### The Narrative Frame: "You Assumed That Was Fixed"

The boot log can acknowledge each double reveal diegetically:

> **SUBSYSTEM: ARCHITECTURE_ANALYSIS**
> Observation: Operator modified production sequence. Previous assumption: build order is fixed.
> Updated model: build order is a design parameter.
> Classification: ARCHITECTURE VARIABLE. Previously classified: CONSTANT.
> Note: This reclassification pattern will recur.

The last line is key: it primes the player to look for MORE hidden freedoms. It transforms accidental discovery into deliberate exploration. "What else did I assume was fixed?"

---

## Six Models for Implementing the Double Reveal

### Model A: "The Accidental Discovery" (Opus Magnum Pure)

No scripting. No prompts. The player simply encounters the freedom when they try to interact with something they assumed was static. The channel name field is editable. The production queue is draggable. The eviction dropdown exists.

**How it works mechanically:** All UI elements are interactive from their first appearance. Pre-configured units in M1-4 have editable fields, but nothing draws attention to them. The player's natural curiosity (or frustration) eventually leads them to click something "fixed."

**Strengths:**
- Maximum surprise. The discovery belongs entirely to the player.
- No patronizing tutorials. Respects player intelligence.
- Creates powerful "I figured this out" ownership moments.
- Community discussions: "Did you know you can rename channels?"

**Weaknesses:**
- Some players NEVER discover the freedom. They complete the campaign with default eviction and one blueprint per type.
- Inequitable — discovery depends on personality (tinkerers find it, goal-chasers don't).
- No pacing control — a tinkerer might discover all five surfaces in M2, ruining the cascade.
- Cannot guarantee the pedagogical ordering (concrete→abstract).

**Comparable:** Opus Magnum's movable reagents. Baba Is You's discoverability (but Baba IS the discovery — there's no fallback). The Witness's environmental puzzles (present but never pointed at).

### Model B: "The Designed Failure" (Into the Breach Inspired)

Each double reveal is triggered by a mission that is deliberately suboptimal with the default assumption. The player fails (or wins poorly), the debrief highlights the hidden variable, and the player returns to fix it.

**How it works mechanically:** Mission 5's default production order puts strikers before scouts. The player fails because strikers have no data. The Inspector shows empty context windows at tick 3 annotated: "No scout data available. Scouts spawn at tick 6." The annotation links to the production queue with a golden highlight: "Build order is configurable."

**Strengths:**
- Guarantees every player encounters the freedom.
- Maintains pedagogical ordering — each mission reveals one surface.
- The failure makes the lesson memorable ("I lost because I didn't know I could reorder!").
- Uses the Inspector (already a diagnostic tool) as the revelation vehicle.

**Weaknesses:**
- Forced failure can frustrate, especially if the player doesn't understand WHY they failed.
- Risks feeling scripted. "The game made me fail on purpose" can break trust.
- Reduces surprise — the debrief TELLS the player instead of letting them discover.
- Requires careful mission design to ensure the failure is clearly attributable to the hidden variable.

**Comparable:** Into the Breach's first missions (designed to teach push mechanics through failure). Shenzhen I/O's puzzle constraints that force exploration.

### Model C: "The Predecessor's Hint" (Narrative Discovery)

The diegetic voice (Predecessor / boot log) drops oblique hints about hidden freedoms. Not explicit instructions — cryptic observations that make sense in retrospect.

**How it works mechanically:** Boot log for Mission 5:

> **SUBSYSTEM: ARCHITECTURE_REVIEW**
> Historical note: Previous operator's relay network used sequential deployment.
> Annotation [☽]: *sequence matters more than you think.*
> End note.

The player might ignore this. But when they lose and return to the Plan screen, they remember: "sequence matters." They look at the production queue. They drag.

**Strengths:**
- Preserves discovery feeling while providing a safety net.
- Integrates with locked boot log and Predecessor narrative.
- Creates a "the hint was there all along" retrospective satisfaction.
- Hints can be increasingly explicit on retry (adaptive crypticness).

**Weaknesses:**
- Hints too cryptic → player ignores them. Hints too explicit → spoils discovery.
- Adds to vocabulary/reading load during boot sequence.
- Non-readers and low-literacy players miss text-based hints entirely.

**Comparable:** TUNIC's manual (contains everything but is encoded). Dark Souls item descriptions (lore as gameplay hint). The Witness's environmental audio logs.

### Model D: "The Community Discovery" (Social Double Reveal)

The game is designed so that discovering hidden freedoms creates shareable moments. Config Codes include topology information. The Blueprint Codex shows ALL configurable parameters, including ones the player hasn't touched.

**How it works mechanically:** A player downloads a shared Config Code from a friend. They import it. The friend's config has production queue in a different order, custom channel names, and non-default eviction. The player sees these differences and asks: "Wait, you changed the BUILD ORDER?"

**Strengths:**
- Leverages social learning — the most natural form of discovery.
- Creates conversation topics: "Check out my topology" becomes community vocabulary.
- Rewards exploration communities (Reddit/Discord) with real information advantages.
- Self-sustaining — no developer maintenance required.

**Weaknesses:**
- Solo players get no benefit.
- Relies on Config Code sharing infrastructure existing early enough.
- Cannot control timing or ordering of revelations.
- Players who avoid spoilers miss out.

**Comparable:** Screeps' code-sharing culture. Factorio blueprint sharing revealing advanced techniques. Slay the Spire's synergy discussions revealing card interactions.

### Model E: "The Inspector Breadcrumb" (Analytical Discovery)

The Inspector debrief subtly reveals hidden variables by showing them in the analytical view. The player sees that context fill was 100% for 12 straight ticks and the eviction policy was "oldest-preserved." They may not know what that means yet, but the information is there.

**How it works mechanically:** The Inspector's unit detail panel always shows ALL configurable parameters, even in M1-4 when most are using defaults. The eviction policy field reads "Oldest Preserved (default)." The "(default)" tag is the breadcrumb — it implies there are non-default options. The parameter is a clickable link that opens the Blueprint Codex entry.

**Strengths:**
- Available to every player after every mission.
- Self-paced — analytical players discover early, others discover when frustrated enough to look.
- Respects the two-act debrief (emotional sealed watch → analytical inspector).
- The "(default)" tag is a masterful nudge — four letters that imply an entire design space.

**Weaknesses:**
- Easily overlooked in the Inspector's information density.
- Requires reading and interpretation (disadvantages non-analytical players).
- No emotional trigger — discovery happens through curiosity, not crisis.

**Comparable:** Into the Breach's post-mission statistics (subtly revealing unused mechanics). Factorio's production statistics (revealing inefficiencies the player didn't know existed).

### Model F: "The Cascading Reveal" (RECOMMENDED Hybrid)

Combine Models B + C + E in a phased cascade:

1. **Inspector breadcrumbs** (E) are always present. Every configurable parameter shows its current value and a "(default)" tag when unmodified.
2. **Predecessor hints** (C) appear in boot logs for missions where a specific hidden freedom is relevant.
3. **Designed failures** (B) trigger for the 2-3 most critical surfaces (production order, eviction priority). Not every surface gets a designed failure — only the ones where missing the freedom creates the most dramatic gap.
4. **Accidental discovery** (A) covers the rest. Some players will discover blueprint diversity on their own. That's fine.

**The cascade for each surface:**

| Surface | Inspector Breadcrumb | Predecessor Hint | Designed Failure |
|---------|---------------------|-------------------|-----------------|
| Rule ordering | M3: "(position 1 of 3)" | M3 boot: "priority is implicit" | M4: rules in wrong order causes scout to ignore filtered data |
| Production order | M5: "Spawned at tick 4 (queue position 2)" | M5 boot: "sequence matters" | M5: strikers before scouts = blind army |
| Channel naming | M5: channel list shows player-authored names in italics vs system names in regular | M5 boot: "previous operator named every wire" | None (low-stakes, discovery is sufficient) |
| Eviction priority | M6: "Eviction: oldest preserved (default)" | M6 boot: "memory is not neutral" | M6: relay keeps stale data, evicts fresh intel |
| Multiple blueprints | M7: "Blueprint: Scout-α (1 of 1 scout blueprints)" | M7 boot: "one design for all scouts?" | None (discovery through enemy exploitation of monoculture) |

---

## Player Journeys

### Journey: Tomás, 16, First-Time Strategy Gamer, Manila

**Context:** Mission 5 — first factory mission. Has completed M1-4 using pre-placed units. Understands rules, hooks, and context filtering. Has never built a blueprint from scratch. Playing on phone during commute.

**Minute 0:00 — The New Screen**
The Plan screen loads with a different layout than M1-4. The left side shows the 8x8 board with a glowing cyan factory at the player's corner and a red enemy spawner at the opposite corner. The right side is the workbench — but instead of pre-configured unit panels, there are empty blueprint slots with dashed outlines: three skill slots, two hook slots, three rule slots, context config section. At the bottom, a horizontal conveyor belt strip with a single blueprint icon: "SCOUT-1."

Tomás taps the scout blueprint. The workbench populates with default configuration — patrol and evade skills equipped, two empty hook slots, two empty rule slots, default context config (buffer size 6, eviction: oldest preserved, listen: all channels).

*This is like M1 but I have to set it up myself.*

**Minute 1:30 — Building the First Blueprint**
He adds a hook: ON_ENEMY_SPOTTED → channel "danger." He types "danger" because that's what feels right. He doesn't know this is a creative choice — he assumes "danger" is a recognized keyword.

He creates a second blueprint — STRIKER-1. Equips engage and breach. Adds a hook: ON_RECEIVE("danger") → engage. Two blueprints connected through the "danger" channel. The channel map panel (read-only, auto-generated) shows a line from SCOUT-1 to STRIKER-1 labeled "danger."

*Cool. Like connecting them with a wire.*

**Minute 3:00 — The Conveyor Belt**
The conveyor belt shows: SCOUT-1 (left) → STRIKER-1 (right). Tomás doesn't think about the order. It's just the order he created them. He hits EXECUTE.

**Minute 3:30 — The Sealed Watch (Attempt 1)**
Tick 1: Factory glows. STRIKER-1 materializes at the factory tile.
Tick 2: STRIKER-1 stands still. No rules triggered. No context data. Its context bar is completely empty — six dim horizontal lines.
Tick 3: Enemy scout appears at far corner. STRIKER-1 doesn't react. Its perception range (2) doesn't reach.
Tick 5: SCOUT-1 finally materializes. Factory was building in queue order — striker first because it was right-most on the belt.
Tick 6: SCOUT-1 patrols. Spots enemy. Sends "danger" signal.
Tick 7: "danger" arrives at STRIKER-1 (1-tick latency). STRIKER-1 finally has context. Engage triggers. But the enemy striker has been advancing for 5 ticks. It's adjacent. One-shot-one-kill. Tomás's striker is destroyed before it acts.

The sealed watch ends. Mission failed. The red flash lingers.

**Minute 4:00 — The Inspector**
The Inspector materializes. Tomás taps on STRIKER-1's ghost on the timeline. The context window view shows: tick 1-6, ALL SIX SLOTS EMPTY. Tick 7: one entry — "danger from SCOUT-1." Then: destroyed.

The event log reads:
> T1 — STRIKER-1 spawned (queue position 1)
> T5 — SCOUT-1 spawned (queue position 2)
> T7 — STRIKER-1 received "danger" — engaged — DESTROYED by enemy striker

Below the timeline, a golden annotation glows:
> "SCOUT-1 spawned 4 ticks after STRIKER-1. Intel arrived after contact."

Tomás stares at this. *The striker had no information because the scout hadn't spawned yet.*

**Minute 5:00 — The Double Reveal**
He goes back to the Plan screen. Looks at the conveyor belt. SCOUT-1 → STRIKER-1 (left to right). He drags SCOUT-1 to the left. The conveyor belt reorders: SCOUT-1 → STRIKER-1. Wait — that's the same. He realizes he had it backwards. He looks more carefully: the production queue reads left-to-right as build order. STRIKER-1 was LEFT. SCOUT-1 was RIGHT. He swaps them.

Now: SCOUT-1 (left, built first) → STRIKER-1 (right, built second).

*I can change the ORDER? This was always dragable?*

He hits EXECUTE again.

**Minute 5:30 — Sealed Watch (Attempt 2)**
Tick 1: SCOUT-1 materializes. Immediately patrols.
Tick 3: SCOUT-1 spots enemy. "danger" sent.
Tick 4: "danger" arrives at the relay's... wait, there is no relay. The signal goes directly to...
Tick 4: STRIKER-1 materializes. "danger" is waiting in its context window from the channel. It has data immediately.
Tick 5: STRIKER-1 advances toward spotted enemy with full context.
Tick 8: Engagement. Kill. The cell flashes red. Mission progresses.

Tomás grins. *One drag. That's all it took.*

**Minute 6:00 — The Meta-Moment**
The boot log scrolls on the post-mission summary:

> **SUBSYSTEM: ARCHITECTURE_ANALYSIS**
> Note: Build order modified. Scout deployment advanced by 4 ticks.
> Intelligence window expanded by 4 ticks.
> Recommendation: Build order is an architecture variable. Previous classification: constant.

Tomás reads this twice. *An architecture variable. Previously classified: constant.* He looks at the rest of the Plan screen with new eyes. What else did he assume was fixed?

**UI Annotations:**
- **Conveyor belt**: Horizontal strip at bottom of Plan screen. Each blueprint icon sits in a rounded rectangle. Drag handles (three horizontal lines) appear on hover/touch-hold. Drop zones glow cyan when dragging. After reordering, the belt briefly pulses gold to confirm the change.
- **Inspector golden annotation**: 14pt serif text in warm gold (#C8A832), positioned below the context window chart. Links to the relevant Plan screen element via a golden tether line in the Inspector's board overlay.
- **Boot log variable reclassification**: Monospace text with "CONSTANT" struck through in amber and "VARIABLE" in cyan. The struck-through animation (line drawing left-to-right through the word) takes 400ms.

---

### Journey: Dr. Priya, 38, ML Infrastructure Lead, Bangalore

**Context:** Mission 7. Deep into the campaign. Has mastered rules, hooks, and basic factory management. Currently using one blueprint per unit type — one scout, one striker, one relay. Running into a problem: enemy exploits the homogeneity of her scout fleet.

**Minute 0:00 — The Monoculture Problem**
Priya's scout blueprint has: patrol skill, ON_ENEMY_SPOTTED → "intel" channel, rules prioritizing evasion over engagement. Buffer size 6, eviction oldest-first. All four scouts behave identically.

The enemy has figured this out. It deploys decoy units that trigger all four scouts simultaneously. All four send "intel" to the same relay. The relay's buffer fills with four copies of essentially the same report. Then the real attack comes from a different direction — but the relay's buffer is full of decoy reports, and the fresh attack data gets evicted (oldest-preserved means the decoy data stays, fresh data leaves).

Priya watches this happen in the sealed watch. All scouts flash green simultaneously. The relay's context bar fills to amber. Then red. Then the relay stunlocks for 1 tick. The real enemy striker walks through unchallenged.

*Same thing happened last time. They're exploiting my architecture.*

**Minute 2:00 — The Inspector Deep Dive**
She opens the Inspector. Clicks the relay. The context window chart shows: tick 8, all 6 slots filled with "intel" signals from four different scouts. Tick 9: new "intel" signal arrives from SCOUT-3 (the one that spotted the real attack). Eviction triggers. Policy: "oldest preserved." The tick-8 decoy data stays. The tick-9 real data gets evicted.

She stares at the eviction policy field: **"Oldest Preserved (default)"**

*(default)*

Priya has a systems background. She knows what "(default)" implies. She clicks it. The Blueprint Codex opens to the eviction policy entry:

> **Eviction Priority**
> Determines which context entries are removed when the context window is full and new data arrives.
> - **Oldest Preserved (default):** Retains oldest entries. Useful for maintaining historical context.
> - **Oldest Evicted:** Removes oldest entries first. Keeps context current. Scouts benefit most.
> - **Source-Based:** Retains one entry per source. Prevents any single source from dominating.
> - **Priority-Weighted:** Entries tagged with higher priority are preserved longer.

*Source-based. If I'd had source-based eviction, the relay would have kept ONE decoy report per scout instead of four identical ones. Space for the real report.*

She goes to the Plan screen. Opens the relay blueprint. Changes eviction from "oldest preserved" to "source-based." Hits EXECUTE.

**Minute 4:00 — The Fix**
The sealed watch replays. Same decoy attack. Same four scouts firing simultaneously. But now the relay's context window shows: 4 entries (one per scout, source-deduplicated), 2 empty slots. When SCOUT-3 spots the real attack at tick 9, the data arrives and fits cleanly into an empty slot. The relay forwards it. The striker responds.

Priya nods slowly.

*I've been treating eviction as a fixed parameter for seven missions. It's not. It's a policy choice. Like choosing a cache eviction strategy for a CDN.*

She immediately opens every blueprint and reviews eviction policies. The scout should be "oldest evicted" (always fresh data). The Command unit should be "priority-weighted" (keep critical signals). The striker should stay "oldest preserved" (maintain tactical context for multi-tick engagements).

**Minute 8:00 — The Cascade**
The boot log had said in Mission 6: "memory is not neutral — what you forget shapes what you do."

She hadn't understood that. Now she does. The eviction policy IS memory management. The same data, filtered through different policies, produces different agents. This is exactly like configuring LRU vs. LFU vs. TTL-based caching for different microservices. The relay is a cache. The eviction policy determines its behavior under load.

*Everything in this game has a real-world parallel.*

**UI Annotations:**
- **Eviction policy field**: Dropdown menu in the Context Config section of the blueprint editor. Current value displayed in a rounded capsule. "(default)" appears in 10pt grey italic next to the value. Clicking opens the Codex entry with a smooth flyout animation (300ms, easing-out).
- **Source-based eviction visualization**: In the Inspector, source-deduplicated entries show colored borders matching their source unit. Duplicate evictions are animated as "compressed" — the duplicate slides into the retained entry and merges.

---

### Journey: Kai, 11, Sixth Grader, First-Ever Strategy Game, Cebu

**Context:** Mission 7. Playing with his older cousin (16) watching over his shoulder. Has been using one scout blueprint and one striker blueprint since Mission 5. His cousin has told him "you can make different types of the same unit" but Kai hasn't tried it because he doesn't see why.

**Minute 0:00 — The Ambush**
The mission is in Cebu — urban cyberpunk terrain with neon-lit alleys and fiber optic cables visible in the tile art. Enemy spawns aggressive strikers from two directions.

Kai's four scouts all have the same configuration: patrol west. They all go the same direction. The eastern flank is completely unmonitored. Enemy strikers walk in from the east unopposed.

**Minute 1:30 — The Loss**
The sealed watch ends in disaster. Three units destroyed in 5 ticks. Kai groans.

His cousin says: "Your scouts all go the same way."

*Yeah, because that's how I set them up.*

"What if you had some going the other way?"

*How? I only have one scout blueprint.*

"Make another one."

**Minute 2:00 — The Discovery**
Kai goes to the Plan screen. He looks at the blueprint panel. There's a "+" button next to the existing blueprints. He's seen it before but assumed it was for adding a NEW unit type. He taps it.

A dropdown appears: Scout, Striker, Relay, Specialist, Command. He taps Scout.

A new blueprint appears: SCOUT-2, with empty configuration. Separate from SCOUT-1. He can configure it differently.

*Wait, I can have TWO scout setups?*

He configures SCOUT-2 with patrol EAST (reversing the patrol direction). Different hook: ON_ENEMY_SPOTTED → "east-danger" (a new channel, separate from SCOUT-1's "west-danger"). He wires a striker to listen on "east-danger."

The production queue now has: SCOUT-1, SCOUT-2, STRIKER-1, STRIKER-2. Two scouts covering different flanks, two strikers responding to different channels.

**Minute 4:00 — The Victory**
Sealed watch. The eastern scouts spot the eastern enemies. The western scouts spot the western feint. The strikers respond to their respective channels. No blind spots. Clean victory.

Kai turns to his cousin with wide eyes. *I didn't know you could have two of the same thing with different jobs!*

His cousin: "That's the whole game."

**Minute 5:00 — The Flood**
Now Kai creates three scout variants: SCOUT-NORTH, SCOUT-EAST, SCOUT-SOUTH. Three channel names. Three striker response groups. He's building coverage. The board's perception radius overlay — translucent circles showing each scout's detection range — turns from three overlapping western circles to a spread pattern covering 80% of the board.

The boot log at the end:

> **SUBSYSTEM: DIVERSITY_ANALYSIS**
> Fleet diversity index: 0.72 (up from 0.31)
> Observation: Multiple configurations of the same chassis type detected.
> Analysis: Configuration diversity increases resilience to adversarial exploitation.

Kai doesn't fully understand "adversarial exploitation" but he understands the number going from 0.31 to 0.72, and he understands that his army isn't getting blindsided anymore.

**UI Annotations:**
- **"+" button**: 24x24 circle with a thin cyan "+" icon, positioned to the right of the last blueprint tab. On tap, expands into a dropdown list of unit types with icons (👁 Scout, ⚔ Striker, 📡 Relay, etc.). New blueprint tab appears with a subtle slide-in animation and a soft "pop" audio cue.
- **Perception radius overlay**: Translucent circles on the board, one per scout, color-coded by blueprint. SCOUT-1's radius is blue, SCOUT-2's is green. Overlap zones are brighter (additive blending). Full coverage is celebrated with a faint golden sheen across covered tiles.
- **Diversity index**: Displayed in the boot log post-mission summary. A single number from 0.0 (monoculture) to 1.0 (maximally diverse). Green when above 0.6, amber 0.3-0.6, red below 0.3.

---

### Journey: Marcus, 42, Factorio Veteran, Portland

**Context:** Mission 6. Has been playing methodically. Currently investigating channel naming — noticed that different missions use different channel names and wondering if names have semantic meaning.

**Minute 0:00 — The Naming Experiment**
Marcus has been using descriptive channel names: "scout-report", "strike-command", "relay-forward." He wonders: does the name matter to the game engine? He creates a test: renames "scout-report" to "banana."

Updates the scout's hook: ON_ENEMY_SPOTTED → "banana."
Updates the relay's listen config: listen to "banana."
Updates the striker's hook: ON_RECEIVE("banana") → engage.

Everything still works. The channel name is arbitrary. "banana" carries intelligence just as well as "scout-report."

*So the names are for ME, not for the system. This is just a namespace.*

**Minute 2:00 — The Topology Experiment**
Now Marcus experiments with topology. Pre-placed missions used star topology: scouts → relay → strikers. What if he wires scouts directly to strikers? Removes the relay entirely.

Scouts ON_ENEMY_SPOTTED → "direct-strike."
Strikers ON_RECEIVE("direct-strike") → engage.

Signal path: 1 hop instead of 2. Latency: 1 tick instead of 2. But no compression (relay's compress skill was reducing context usage). The strikers' buffers fill faster without compression. Trade-off: faster response vs. higher overload risk.

*Oh. The relay isn't just forwarding. It's PROCESSING. Like a middleware layer. Removing it changes the system's behavior profile, not just its latency.*

**Minute 4:00 — The Architecture Portfolio**
Marcus starts sketching topologies on paper (his Factorio habit). Star, mesh, ring, hub-and-spoke, tree. Each has different latency, fault tolerance, and EM emission profiles. He realizes the game has an entire architecture design layer he's been ignoring by accepting the tutorial's star topology as default.

He creates a mesh network: every unit listens to every channel. Maximum information flow. Maximum EM noise. Maximum overload risk. It's the game's equivalent of a Factorio "spaghetti base" — it works, it's loud, and it'll collapse under load. But for now, on this mission, it's overkill and it works.

The Inspector post-mission shows the channel map: a dense web of connections. Every unit has a line to every other unit. The EM overlay shows his base radiating signal noise like a supernova.

*I built the loudest network possible. The enemy can probably detect me from the other corner. Next mission, I need a quieter architecture.*

**UI Annotations:**
- **Channel map panel**: Read-only panel in the Plan screen showing auto-generated topology diagram. Units as circles, channels as colored lines. Dense networks show overlapping lines with slight transparency. A small "EM Noise" indicator in the corner shows a bar graph of total emission level (green/amber/red).
- **EM overlay in Inspector**: Concentric circles radiating from transmitting units, pulsing outward at 1 ring per tick. Color matches channel. Dense networks produce overlapping rings that create a visual cacophony — the "supernova" effect.

---

## Strengths and Weaknesses

### Strengths
- **Teaches the game's deepest truth incrementally.** The core lesson — "everything is configurable" — is too abstract to teach directly. The double reveal makes it concrete, one surface at a time.
- **Creates natural replayability.** Each discovery makes previous missions solvable in new ways. "I should go back to M3 with what I know now about eviction policies."
- **Mirrors real engineering epistemology.** Professional software engineers have this experience constantly — discovering that a "default" they never questioned was always a choice. The game teaches this meta-skill explicitly.
- **Generates community content.** "Did you know you can..." posts are evergreen social media content. The double reveal creates a knowledge-sharing incentive.
- **Scales with player sophistication.** Casual players find 2-3 surfaces. Hardcore players find all 5. Speedrunners find interactions between surfaces. The depth is bottomless.

### Weaknesses
- **Accidental discovery is inequitable.** Without designed reveals, some players will never find some surfaces. The Cascading Reveal model (F) mitigates this but can't guarantee discovery of all surfaces.
- **Can create "I feel stupid" moments.** Learning that you've been playing suboptimally for 7 missions because you didn't know a dropdown existed can feel bad. The framing must emphasize "you gained new power" not "you've been doing it wrong."
- **Overwhelm risk at Mission 5.** The factory introduction is already the campaign's steepest cliff. Adding production-order-as-revelation to this mission compounds the cognitive load.
- **Eviction policy is invisible until it matters.** The most powerful hidden freedom (eviction) is the least visible. Players who don't read the Inspector carefully may never notice the "(default)" tag.
- **Boot log hints can be ignored.** Players who skip text miss narrative-framed revelations entirely. The designed failure (Model B) is the most reliable fallback.

---

## Interaction Effects

**With Tutorial as Puzzle (5.01):** Filter puzzles in M1-4 teach that buffer CONTENT matters. The double reveal extends this: not just content, but the POLICY governing content (eviction), the TIMING of content arrival (production order), and the ARCHITECTURE delivering content (topology). Same domain, deeper layers.

**With Complexity Ramp (5.04):** The revelation cascade must be coordinated with the concept introduction schedule. Rule ordering is already part of the rules introduction (M3-4). Production order aligns with factory introduction (M5). Eviction and topology can slot into M6-7. No new concepts are introduced — only new applications of existing concepts.

**With Replayability (5.09):** The double reveal is a powerful replay motivator. Players who complete the campaign and then discover a new hidden freedom will want to replay earlier missions with the new knowledge. This is the "New Game+" impulse without requiring a formal NG+ mode.

**With The Product as Puzzle (5.10):** The Hybrid Brief (5.10 recommended) can embed double-reveal hints in mission specifications. A spec that says "deploy scouts before strikers" is explicit. A spec that says "intelligence must be available before engagement" is implicit — the player must discover that production order is the mechanism.

**With the Inspector (locked):** The Inspector is the primary vehicle for breadcrumbs. The "(default)" tag, the timing annotations, the source labels on context entries — all are Inspector features that passively reveal hidden freedoms.

**With Gauntlet/PvP (5.22):** In competitive play, hidden freedoms become optimization axes. Players who understand production order timing, topology trade-offs, and eviction policy selection have a structural advantage. This creates a natural skill ceiling that rewards deep understanding of the game's design space.

**With Blueprint Codex (locked):** Every hidden freedom should have a corresponding Codex entry. The entry explains the options and their trade-offs, but the DISCOVERY that the option exists comes from gameplay, not from the Codex. The Codex is the reference, not the teacher.

---

## Comparable Games and Media

**Opus Magnum (Zachtronics):** The origin of the pattern. Movable reagents, infinite workspace, no explicit tutorial about spatial freedom. Players discover the solution space through play. The histogram amplifies the effect by showing that other players found different solutions — implying different starting conditions.

**Baba Is You (Hempuli):** Every level IS a double reveal. The rules are visible, movable, and modifiable. But the specific reveal — that rule words can be pushed, broken, and recombined — is discovered through play. The entire game is one long cascade of "wait, I can change THAT?"

**The Witness (Jonathan Blow):** Environmental puzzles reveal that the island itself is a puzzle surface. The double reveal: you first solve the panel puzzles, then discover that the environment contains puzzles too. The revelation transforms how you see the game world.

**Portal (Valve):** The double reveal happens with surfaces. Early levels establish that portals can be placed on white surfaces. Later levels reveal that white surfaces can be created (by breaking panels or finding hidden white patches). The "surface I can portal" space expands.

**Factorio (Wube Software):** The double reveal is about scale. New players think "I need 10 iron plates per minute." Then they realize furnace arrays can be parallelized. Then they realize parallelization can be parallelized (trains, logistics bots, blueprints). Each scale revelation shows the game's true depth.

**Chess:** New players learn piece movement. Intermediate players discover that opening theory — the SEQUENCE of first moves — is itself a studied discipline. The double reveal: "I thought the game started when pieces threatened each other. Actually, the game starts with the first pawn move, and the opening IS the game."

---

## Sensory Description

**The moment of discovery:** The player clicks something they assumed was static. It responds. A dropdown opens, or a drag handle appears, or a text field becomes editable. There's a soft *tink* — the sound of a lock opening that was never locked. A cyan highlight briefly pulses around the newly-discovered interactive element: "This was always here."

**The moment of reclassification:** The boot log types in monospace:
```
Previous classification: CONSTANT
```
Then a horizontal line draws through "CONSTANT" — amber ink, left to right, 400ms. Below it appears:
```
Updated classification: VARIABLE
```
In cyan. A soft two-note ascending chime plays — the same interval as the Codex unlock sound, but quieter. The implication: you gained knowledge.

**The production queue reorder:** The player drags a blueprint icon on the conveyor belt. The other icons slide apart to make room — smooth easing animation, 200ms. The blueprint drops into its new position with a satisfying *clunk* — the sound of a physical object slotting into a rail. The conveyor belt briefly animates left-to-right, confirming the new build sequence. A small gold "1st" / "2nd" / "3rd" label fades in below each icon.

**The eviction policy change:** The dropdown opens with a soft *click*. Policy names appear in a list with subtle color coding: oldest-preserved in cool grey, oldest-evicted in warm orange, source-based in blue, priority-weighted in gold. Selecting a new policy plays a brief context-window animation in the blueprint's preview panel: 6 slots fill and then evict in the new pattern. The player can SEE the policy before committing. The selected policy's color becomes the accent color on the context bar for that blueprint — a persistent visual reminder of the choice.

**The channel rename:** The player clicks the channel name field. It highlights with a text cursor blinking in cyan. They type a new name. As they type, the channel map panel updates in real-time — the label on the connecting line changes character by character. When they press Enter, the line briefly pulses the channel's color (hash-determined from the name string). A different name → a different color. The network diagram shifts hue.

---

## The TikTok Clip

**"The Build Order Flip" (15 seconds):**
- Seconds 0-3: Sealed watch. Strikers spawn into empty board. Stand dumbly. Context bars empty. Enemy approaches.
- Seconds 3-5: Mass casualty. Red flashes. Army destroyed.
- Seconds 5-8: Smash cut to Plan screen. Player grabs a blueprint on the conveyor belt. Drags it left. The *clunk* sound.
- Seconds 8-11: Sealed watch replays. Scouts spawn FIRST now. Signal chains light up across the board — green flashes cascading. Strikers spawn with full context. They move immediately.
- Seconds 11-14: Victory. Clean. Same army. Same blueprints. Different order.
- Second 15: Text overlay: "One drag changed everything."

The clip works because the CAUSE (one drag on the conveyor belt) is visible, the EFFECT (army transformation) is dramatic, and the GAP (the viewer realizes they would have made the same mistake) creates engagement.

---

## New Aspects Discovered

1. **5.13a — The "assumption audit" as post-campaign meta-game:** A post-campaign challenge mode that asks "how many hidden variables can you find?" — each previously-fixed parameter becomes a scored discovery; interaction with replayability (5.09) and Gauntlet (5.22)
2. **5.13b — Difficulty scaling through hidden variable count:** Easy missions lock more variables (pre-set eviction, fixed production order); hard missions unlock all variables; Gauntlet unlocks variables the player didn't know existed; difficulty as freedom, not constraint
3. **5.13c — The "(default)" tag as universal UI design pattern:** Every configurable parameter in the game shows "(default)" when unmodified; the tag is itself a teaching tool; interaction with accessibility (6.08) and Blueprint Codex design
4. **5.13d — Variable reclassification as narrative beat:** The boot log "CONSTANT → VARIABLE" animation as a recurring motif across the campaign; counting reclassifications as progression metric; the final reclassification at Mission 10 (what is it?)
5. **5.13e — Social discovery asymmetry in PvP:** Players who discover hidden variables earlier have structural advantages in Gauntlet; does this create unfair matchmaking? Should variable discovery be tracked per player for competitive bracketing?
