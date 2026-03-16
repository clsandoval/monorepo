# 2.03 — Decay Buffer: Entries Fade Over Time Rather Than Being Evicted Discretely

## The Option

Instead of Robot Uprising's locked fixed-slot model (where entries either fully exist or are gone), the **decay buffer** introduces a **freshness gradient**: every entry in a unit's context window has a **decay value** that decreases each tick. Information doesn't vanish in a binary moment — it **fades**, becoming progressively less reliable, less vivid, less actionable, until it crosses a threshold and dissolves entirely.

This is the memory model that maps most directly to how biological systems (and many real AI architectures) handle temporal information. A scout's observation from 2 ticks ago is more trustworthy than one from 12 ticks ago. A relay's forwarded signal from last tick is fresher than a compressed summary from 8 ticks ago. The decay buffer makes this temporal quality **visible and mechanically consequential**.

### Mechanical Specification

**Freshness as first-class property:**
- Every buffer entry has a `freshness` value: a float from 1.0 (just arrived) to 0.0 (completely decayed)
- Each tick, every entry's freshness decreases by its **decay rate** (default: 0.1 per tick for observations, 0.15 per tick for hook messages, 0.05 per tick for compressed data)
- When freshness drops below the **dissolution threshold** (default: 0.1), the entry is removed from the buffer entirely, freeing the slot
- Buffer capacity still exists (Scout: 6, Relay: 12, etc.) — decay doesn't replace slot limits, it adds a temporal dimension on top

**Decay rates vary by information type:**

| Entry Type | Decay Rate/Tick | Half-Life (ticks) | Rationale |
|-----------|----------------|-------------------|-----------|
| Direct observation | 0.10 | ~7 | You saw it with your own sensors — fades at moderate speed |
| Hook message (raw) | 0.15 | ~5 | Secondhand info degrades faster |
| Compressed signal | 0.05 | ~14 | Compression = distillation = longer shelf life |
| Tagged target data | 0.08 | ~9 | Tags persist but degrade as target may have moved |
| Command directive | 0.03 | ~23 | Orders from command linger longest |
| Self-generated note | 0.07 | ~10 | Internal state, moderate persistence |

**Freshness affects rule evaluation:**
- Rules can reference freshness in conditions: `IF threat_nearby AND freshness > 0.5 → engage` (only act on fresh intelligence)
- Rules without freshness conditions treat all entries equally (backward-compatible with fixed-slot mental model)
- A rule condition `IF enemy_position` that matches a 0.2-freshness entry technically fires — but the player can add `AND freshness > 0.6` to require recent data
- **The teaching moment:** Players who don't use freshness conditions discover their units acting on stale data. The Inspector shows the faded entry that triggered the bad decision. The fix is adding a freshness threshold — the game teaches information quality evaluation.

**Visual representation — The Fade:**
- Each buffer slot in the context bar renders as a **colored rectangle** whose **opacity maps to freshness**
- A fresh entry (1.0) is fully saturated and bright — vivid cyan for observations, warm gold for messages, cool green for compressed data
- A half-decayed entry (0.5) is translucent, washed out, slightly desaturated — the visual equivalent of a fading memory
- A nearly-dissolved entry (0.15) is barely visible — a ghost of color, flickering slightly, like an old CRT pixel dying
- The dissolution moment: entry blinks twice, contracts to a bright point, and vanishes with a soft digital exhale sound — `psshht` — like air escaping a seal
- **Context bar as decay gradient:** From left (oldest, most faded) to right (newest, vivid), the bar becomes a visual timeline of information health. A healthy buffer looks like a sunrise gradient. A stale buffer looks like a row of ghosts.

**The Freshness Thermometer (Plan Screen):**
- In the blueprint editor, a vertical thermometer beside each unit's context config shows the **predicted average freshness** based on the configured listen channels, perception radius, and expected input rate
- Green zone (avg freshness > 0.6): information architecture is fresh — unit acts on recent data
- Amber zone (0.3–0.6): architecture is getting stale — unit may act on old information
- Red zone (< 0.3): dangerously stale — most decisions will be based on faded memories
- This is a **pre-execution diagnostic** — the player can see "this striker will probably be acting on old data" before hitting EXECUTE

### What the Player Configures (Plan Phase)

Beyond the standard blueprint editor sections, the decay buffer adds:

1. **Freshness threshold per rule** — a small slider (or typed value) next to each rule's condition block: "Only fire this rule if the matching entry's freshness is above X." Default: 0.0 (accept any freshness). The slider is a horizontal bar from 0 to 1, with a draggable pip.

2. **Decay rate modifier per channel** — in the context config section, each listened channel has a decay modifier: ×0.5 (slow decay — trust this channel), ×1.0 (normal), ×2.0 (fast decay — this channel's info goes stale quickly). This lets the player say "trust command directives longer than scout reports."

3. **The "Preserve" hook action** — a new hook action type: when a hook fires, instead of transmitting data, it can **refresh** a specific entry in the buffer, resetting its freshness to 1.0. This is the active-maintenance mechanic: a relay can periodically "ping" to keep critical intelligence alive in a striker's buffer.

4. **Dissolution threshold** — a per-blueprint setting (default 0.1) controlling when faded entries are removed. Lower threshold = entries linger longer as ghosts. Higher threshold = aggressive cleanup, more free slots.

### The Core Tension: Freshness vs. Coverage

The fixed-slot buffer's central tension is **capacity** — you can't hold everything, so you choose what to listen to. The decay buffer preserves this tension but adds a second axis: **temporal quality**. You might have a full buffer of 8 entries, but if 6 of them are faded to 0.2 freshness, your unit is making decisions on ghost data.

This creates three failure modes instead of one:
1. **Overflow** (same as fixed-slot): too many inputs, entries evicted before they can be read
2. **Staleness**: entries survive but decay into unreliability — unit acts on old intelligence, makes bad decisions
3. **Freshness addiction**: player over-tunes freshness thresholds so high that units ignore useful-but-slightly-old data, becoming paralyzed when no fresh data arrives

The third failure mode is unique to the decay buffer and deeply educational. It maps directly to the real-world problem of setting confidence thresholds too high in ML systems — rejecting all uncertain data until the system has nothing to act on.

## Strengths

**1. The metaphor is viscerally legible.**
Every human understands "memories fade." The visual of a context bar going from vivid to ghostly is immediately readable without explanation. The boot log can say: *"TEMPORAL COHERENCE MODULE: Observations decay. Recent data is reliable. Old data is... less so. Configure your confidence thresholds."* One sentence teaches the entire system.

**2. Richer debugging in the Inspector.**
When the player clicks a unit in the Inspector and scrubs to the tick where it made a bad decision, the decay buffer shows not just WHAT was in the buffer but HOW FRESH each entry was. "The striker engaged because it had an enemy_position entry — but look, freshness was 0.18. It was acting on a ghost. The enemy moved 3 ticks ago." The fix is obvious: add a freshness threshold to the engage rule. This is a more nuanced debugging story than "the entry was evicted" — it's "the entry was there but shouldn't have been trusted."

**3. Natural difficulty progression.**
Early missions can use slow decay rates (everything stays fresh for 20+ ticks) so players barely notice the mechanic. Mission 5+ can introduce faster decay, terrain-modified decay (jungle accelerates decay, city preserves data), and enemy tactics that exploit stale buffers. The mechanic scales from invisible to central.

**4. Compress skill gains depth.**
In the fixed-slot model, compress saves space. In the decay model, compress ALSO extends shelf life — compressed data decays at 0.05/tick vs. raw data at 0.10-0.15/tick. The relay's compress skill becomes dual-purpose: space optimization AND temporal preservation. This makes the relay feel more like a real data infrastructure component.

**5. Maps to real AI architecture patterns.**
TTL (Time To Live) on cached data, confidence decay in Bayesian filters, token aging in context windows, cache invalidation strategies — the decay buffer teaches all of these through gameplay. A player who masters freshness thresholds has internalized cache invalidation, famously "one of the two hard problems in computer science."

## Weaknesses

**1. Cognitive load increase is substantial.**
The fixed-slot buffer is already the game's most complex concept. Adding freshness as a per-entry, per-tick, per-type dimension with configurable thresholds and decay modifiers could push the system past the complexity budget for a 10-mission campaign. The player must now understand: slot count, entry types, eviction, AND freshness values, decay rates, dissolution thresholds, freshness conditions in rules, decay modifiers per channel, and the preserve hook action. That's 4-5 more concepts than the fixed-slot model.

**2. Visual noise in the context bar.**
The locked context bar design shows "tiny colored pips" at the bottom of each unit tile during sealed watch. Adding opacity variation to pips that are already 4-6 pixels wide may be illegible at game scale. The gradient effect that looks beautiful in a mockup may compress to "everything looks the same shade of grey" on a real 8x8 board. The freshness information may only be readable in the Inspector's detailed view, not during the emotional sealed watch — undermining the "viscerally legible" promise.

**3. Freshness threshold tuning is a trap.**
Optimal freshness thresholds depend on the specific mission, enemy behavior, terrain layout, and relay positioning — variables the player can't fully predict. This creates a tuning treadmill where the "right" threshold changes every mission. Worse, a threshold that's 0.01 too high can cause a unit to ignore critical data. The skill expression is high (good) but the failure mode is invisible until the Inspector reveals it (frustrating).

**4. The "ghost data" problem.**
A near-dissolved entry (freshness 0.12) still occupies a slot. In the fixed-slot model, that slot would have been freed by FIFO eviction, making room for fresh data. In the decay model, ghost entries can clog the buffer — they're too faded to be useful but haven't dissolved yet. The player must either lower the dissolution threshold (aggressive cleanup) or accept that ghost data wastes capacity. This interaction between slot capacity and temporal quality is interesting for veterans but confusing for beginners.

**5. Breaks the "one-shot, one-kill" simplicity ethos.**
The locked design philosophy emphasizes: no HP, no damage math, the game is about information architecture. But freshness is essentially HP for information — a continuous value that degrades over time, requiring management. It adds a quantitative dimension to a game that's otherwise qualitative (entry exists or doesn't, rule matches or doesn't, unit alive or dead). There's a philosophical tension between "no HP" for combat and "HP for memories."

## Interaction Effects

### With Fixed-Slot Buffer (2.01)
The decay buffer is a **superset** of fixed-slot. If all decay rates are set to 0 and dissolution threshold is 0, it reduces to the fixed-slot model exactly. This means the game could start with fixed-slot (missions 1-4) and introduce decay as a Mission 5 mechanic when the factory arrives — "your units are now operating at greater distances from your factory, and intelligence degrades over distance and time."

### With Weighted Buffer (2.02)
Decay and weight are **complementary dimensions**. A 3-weight entry could have 0.8 freshness — it's large AND moderately stale. The interaction creates a 2D optimization space: weight × freshness. The compress skill reduces weight AND improves freshness (compressed data decays slower). This is rich but possibly too many simultaneous variables.

### With Eviction Policies (2.06–2.09)
Decay transforms eviction from a crisis event into a **continuous process**. Instead of "buffer full → oldest evicted → crisis," it's "entries gradually fade → stale entries dissolve naturally → buffer self-cleans." This REDUCES the drama of eviction (bad for sealed watch spectacle) but INCREASES the strategic depth of context management (good for plan phase). Player-configured eviction (2.06) could interact: "evict the STALEST entry first" vs. "evict the OLDEST entry first" are now different policies. Stalest-first keeps slot count high; oldest-first keeps average freshness high.

### With Signal Latency (Locked: 1 tick/hop)
Multi-hop signals arrive with built-in staleness. A signal that traverses Scout→Relay→Striker takes 2 ticks — it arrives at the Striker with a freshness of ~0.80 (already 20% decayed during transit). A 4-hop chain delivers data at ~0.60 freshness. This makes relay chain length a freshness trade-off: longer chains = more coverage but staler data. The player can see this in the Plan screen freshness thermometer.

### With Context Overload (Locked: 1 tick stunned)
Overload triggers when the buffer is FULL and new entries arrive. In the decay model, ghost entries (freshness < 0.2) still occupy slots — meaning overload can be caused by a buffer full of useless faded data that hasn't dissolved yet. This creates a perverse incentive to set high dissolution thresholds to prevent ghost-data-induced overload. The "context overload → 1 tick stunned" mechanic gains a new cause: not just too much information, but too much *old* information.

### With the Preserve Hook Action
The preserve action creates a **memory maintenance economy**. A relay can use a hook slot to periodically refresh critical data in a striker's buffer. But the preserve action itself consumes a hook slot, and the refresh signal uses channel bandwidth. Maintaining fresh data has a cost — just like real cache refresh strategies. The player discovers that it's sometimes better to let data decay and re-observe than to maintain it artificially.

### With EM Emissions (Locked)
Preserve hooks emit EM noise — the maintenance traffic is detectable. An architecture that aggressively refreshes data is LOUDER than one that accepts decay. This creates a stealth trade-off: accept stale data to stay quiet, or maintain fresh data and risk detection. Maps directly to the real-world trade-off between data freshness and network traffic in surveillance systems.

### With Enemy Tactics
Enemy "noise flood" tactics interact differently with decay: instead of just filling the buffer (fixed-slot threat), noise entries can also be designed to decay SLOWLY, occupying slots as long-lived ghost data that crowds out fresh observations. Enemy-injected entries with 0.02 decay rate would persist for ~50 ticks — effectively "sticky" disinformation. This opens a design space for "fast noise" (floods buffer, decays quickly) vs. "slow poison" (fewer entries but they linger).

## Comparable Games/Media

### Oxygen Not Included — Stress and Decaying Buffs
Duplicants in ONI have temporary buffs (morale bonuses from food, decor, recreation) that decay over time on different schedules. Players learn to maintain buff freshness through scheduling — the quality of a meal decays into hunger, the quality of recreation decays into boredom. The planning challenge is keeping all buffs above their thresholds simultaneously, which maps to Robot Uprising's challenge of keeping all buffer entries above freshness thresholds.

### Darkest Dungeon — Stress as Decaying Resource
Stress accumulates (inverse of freshness) and must be actively managed through stress-healing activities. The "stress meter" is a continuous value that everyone understands intuitively. Darkest Dungeon proves that players can manage continuous degradation metrics without losing engagement — but it also shows that managing degradation is inherently more stressful than managing discrete states.

### Real-Time Strategy Games — Fog of War Decay
Many RTS games (StarCraft, Age of Empires) show last-known enemy positions that become unreliable over time. The player sees "there was a base here 2 minutes ago" but doesn't know if it's still there. This is conceptually identical to the decay buffer — the scouting information has decayed in freshness. Robot Uprising makes this implicit mental model explicit and mechanically consequential.

### Redis / Cache Systems — TTL as Game Mechanic
Redis keys with TTL (Time To Live) are the direct software engineering analog. The player configuring decay rates and dissolution thresholds is literally configuring cache TTLs. The "preserve" hook is a cache refresh. The dissolution event is cache eviction. Players who master this system will have an intuitive understanding of cache invalidation strategies — the "one of two hard things in CS" teaching moment.

### Slay the Spire — Temporary Powers
Temporary powers (those with turn counters) decay each turn. Players must plan around "this power will expire in 3 turns" — the decay creates temporal urgency. Robot Uprising's decay buffer creates the same urgency: "this intelligence will be useless in 7 ticks, act now or lose it."

## Sensory Description

### Plan Phase — The Freshness Thermometer
A slender vertical bar, 8px wide, on the right edge of each unit's blueprint panel in the workbench. Subdivided into three zones: **forest green** (top third, > 0.6), **amber honey** (middle third, 0.3–0.6), **dried-blood red** (bottom third, < 0.3). A small white triangle marker indicates the predicted average freshness. As the player adds more listen channels (increasing input rate), the marker rises — more data coming in means fresher average state. As they remove channels, it falls. The thermometer breathes gently — expanding 1px and contracting — to communicate that it's a living prediction, not a static number.

When the player hovers over the thermometer, a tooltip expands showing per-entry-type predicted freshness:
```
Observations: ████████░░ 0.82
Hook messages: █████░░░░░ 0.51  ⚠ stale
Compressed:   █████████░ 0.94
```
The "stale" warning appears in amber when any category drops below 0.5.

### Sealed Watch — The Fading Pips
Each unit's context bar (the "tiny colored pips at bottom of tile" from the locked spec) now has **opacity variation**. Fresh entries are vivid and bright. Stale entries are washed out, almost transparent. The bar reads as a gradient from ghost to vivid, left to right.

When an entry dissolves (freshness hits threshold), the pip does a micro-animation: it **contracts to a point**, flashes white for 1 frame, and vanishes. Sound: a tiny `tsss` — like a match being struck in reverse, so quiet it's felt more than heard. On a busy board with many units, these dissolution events create a subtle **rainfall of tiny flashes** across the army — information dying everywhere, constantly, like stars going out.

When a unit acts on a stale entry (freshness < 0.3), the action flash is **dimmer and slightly yellow-shifted** compared to the normal bright green. The player subconsciously registers: that unit's action looked weak, uncertain. In the Inspector later, they can see exactly why.

### Inspector — The Freshness Timeline
The Inspector's context window chart (locked as "sparkline of context fill over all ticks") gains a **second line**: average freshness, rendered as a thin gold line overlaid on the green fill line. The fill line shows how many slots are occupied. The gold line shows how FRESH those slots are on average.

**The diagnostic moment:** The fill line is high (buffer looks full, healthy). But the gold freshness line is LOW (the buffer is full of ghost data). The player realizes: "Full doesn't mean healthy. My unit had a full context window of stale garbage." This is the "aha" moment that teaches cache invalidation.

Clicking an individual entry in the buffer detail panel shows its **freshness history** — a tiny sparkline showing freshness declining from 1.0 at entry to its current value. If a preserve action refreshed it, there's a sharp spike back to 1.0 mid-decline. The sparkline tells the story of that piece of information's life in the buffer.

### Audio
- **Entry arrival:** Bright ping (existing) — no change
- **Entry at 50% freshness:** No sound (continuous process, no event to mark)
- **Entry dissolution:** `tsss` — high-frequency breath, 200ms, barely audible individually but collectively creates a textured hiss during intense moments
- **Unit acting on stale data (freshness < 0.3):** The action's normal sound effect is **low-pass filtered** and **time-stretched by 20%** — the action sounds sluggish, hesitant, like a machine running on bad fuel
- **Preserve hook firing:** A brief ascending `doo-deep` — like a pulse of life, the audio equivalent of watering a plant
- **Mass dissolution (3+ entries dissolving same tick):** The individual `tsss` sounds layer into a collective **static crackle** — radio static, the sound of a mind going blank. This is the audio signature of information collapse.

---

## Player Journeys

### Journey 1: Mira, 23, Biology Student (First Encounter with Decay)

**Context:** Mission 5 — Cebu urban battlefield. First mission with the factory and full blueprint configuration. Mira has played missions 1-4 with fixed-slot buffers and understands basic context management. She's configured scouts with patrol and hook transmissions. This is her first time seeing freshness values.

**Minute 0:00 — The Boot Log Introduction**
The boot log scrolls on the left panel as Mission 5 loads:
```
TEMPORAL COHERENCE MODULE v2.1 initialized.
NOTE: Intelligence degrades over time. Recent observations
are reliable. Older observations are... approximations.
Your units now have FRESHNESS values on every context entry.
Configure your trust thresholds accordingly.
> Observation decay: 0.10/tick
> Signal decay: 0.15/tick
> Compressed decay: 0.05/tick
```
Mira reads this and thinks: "Oh, like how my mice forget maze routes after a few days." The biological metaphor clicks instantly. She's seen decay curves in her neuroscience electives.

**Minute 0:30 — Discovering the Freshness Thermometer**
She opens a Scout blueprint and notices the new vertical bar on the right side of the context config panel. It's showing green — the thermometer marker is at 0.78. She hovers over it and sees the per-type breakdown. "Observations 0.82, hook messages 0.51..." She notes the amber warning on hook messages and thinks: "Signals from other units go stale faster than what I see myself? That makes sense — it's secondhand info."

She toggles off one of the Scout's listen channels. The thermometer barely moves. She toggles off two more. The marker drops slightly. She understands: fewer inputs = less frequently refreshed buffer = lower average freshness. "It's like... if I stop checking my phone, my knowledge of what my friends are doing decays." The social media metaphor bridges.

**Minute 1:30 — First Sealed Watch with Visible Decay**
She hits EXECUTE. The sealed watch begins. On the 8x8 Cebu cityscape, her scouts patrol while strikers hold position. She watches the context bars under each unit. Something's different from missions 1-4: the bars aren't just solid colored blocks anymore. The leftmost pips in each bar are **faded, translucent** — and as she watches, they fade further, then flash and vanish.

"Wait — those are disappearing on their own!" She leans forward. The rightmost pips are vivid cyan (fresh observations), but entries from 5-6 ticks ago are washed out, ghostly. A tiny `tsss` sounds as one dissolves. Then another. The context bars have a constant subtle shimmer of entries arriving bright and fading left.

On tick 8, her lead striker engages an enemy. The action flash is slightly **dimmer and yellower** than she remembers from training missions. She frowns: "That looked... weak?"

**Minute 2:30 — The Inspector Reveal**
Sealed watch ends. She enters the Inspector and clicks the striker. Scrubbing to tick 8, she sees:

```
Context Window at T8:
[0] enemy_position  src: SCOUT-A  age: 7  freshness: 0.23  ← USED BY RULE
[1] terrain_clear   src: self     age: 4  freshness: 0.60
[2] patrol_waypoint  src: hook    age: 6  freshness: 0.10  ⚠ DISSOLVING
...
```

The enemy position entry has a freshness of **0.23** — and the rule that fired (`IF enemy_position → engage`) has no freshness threshold. The striker charged at where the enemy WAS 7 ticks ago. The enemy had moved. The engage whiffed.

"Oh! It was using old data! The enemy moved but the striker still thought it was there!" She clicks the rule in the blueprint editor and sees the freshness threshold slider at 0.0. She drags it to 0.5. A tooltip appears: "Only engage when enemy position freshness > 50%."

**Minute 3:30 — The Fix and Second Run**
She hits EXECUTE again. This time, at tick 8, the striker has the same faded enemy_position entry — but the rule **doesn't fire** because freshness is below 0.5. The striker falls through to its next rule: `IF no_fresh_threat → patrol`. It patrols instead of charging at a ghost. On tick 10, a fresh observation arrives (freshness 1.0) — the enemy is now 2 tiles east. The engage rule fires on fresh data. Clean kill.

Mira pumps her fist. "That's like... don't prescribe medication based on week-old blood tests." The medical metaphor bridges to her biology training. She spends the next 3 minutes tuning freshness thresholds for each rule, checking the thermometer, and feeling like she's calibrating a research instrument.

**UI Annotations:**
- Freshness thermometer: 8px vertical bar, right edge of blueprint panel, three-zone coloring, hover tooltip with per-type breakdown
- Context bar opacity: freshness maps linearly to pip opacity (1.0 = full, 0.0 = transparent)
- Dissolution animation: 300ms (contract→flash→vanish), `tsss` audio
- Freshness threshold slider: horizontal bar in rule condition block, 0–1 range, draggable pip, tooltip shows current value
- Stale-action indicator: action flash is 30% dimmer and hue-shifted 15° toward yellow when acting on entry with freshness < 0.3

---

### Journey 2: Kwame, 32, DevOps Engineer and Twitch Streamer (Mastering the Preserve Economy)

**Context:** Mission 7 — Mindanao jungle battlefield. Kwame has beaten missions 1-6 and understands the factory system, command agents, and basic decay management. His stream has 400 viewers. He's trying to build a long-range intelligence network with relays, but signals decay too much in transit.

**Minute 0:00 — The Latency-Freshness Problem**
Kwame's architecture: Scout (north) → Relay-A → Relay-B → Command → Striker team (south). The Scout detects an enemy flanking from the northeast. The signal travels: Scout (tick 1) → Relay-A (tick 2) → Relay-B (tick 3) → Command (tick 4) → Striker-1 (tick 5). By the time the striker gets the intelligence, it's 4 ticks old. Freshness at arrival: 1.0 × (1 - 0.15)^4 = **0.52**.

His striker's engage rule has a freshness threshold of 0.6 (set during Mission 6 when he learned about stale data). The signal arrives at 0.52 — **below threshold**. The striker ignores the flanking report. The enemy scout reaches his base.

"Chat, the signal is too stale by the time it arrives! Four hops is killing my freshness!" He opens the Inspector and traces the signal: vivid cyan at the scout, fading through each relay hop, arriving as a washed-out ghost at the striker.

**Minute 1:00 — Discovering Preserve**
Kwame opens the Relay-B blueprint. In the hook actions dropdown, he notices a new option he hasn't used: **PRESERVE**. He hovers for the tooltip: *"Refresh a specific entry type in a target unit's buffer. Resets freshness to 1.0. Costs 1 hook slot."*

"Wait. I can REFRESH entries in other units' buffers?" He drags the PRESERVE action into Relay-B's second hook slot, configuring it: "On receive enemy_position → PRESERVE enemy_position in STRIKER-1 on channel cmd-refresh."

His chat explodes: "CACHE INVALIDATION STREAM LET'S GO" / "he's basically building Redis" / "this is literally a TTL refresh"

**Minute 2:00 — The Preserve Economy**
He hits EXECUTE. The signal chain fires: Scout detects enemy (tick 1). Signal propagates through relays (ticks 2-3). At tick 3, Relay-B both forwards the signal AND fires a PRESERVE hook to the striker's cmd-refresh channel. At tick 4, Command processes. At tick 5, the striker receives both: the forwarded signal (freshness 0.52) AND the preserve action, which refreshes the enemy_position entry back to 1.0.

On screen, the striker's context bar shows a faded pip suddenly **flash back to full brightness** — a vivid cyan pulse. The `doo-deep` sound plays. The engage rule fires on fresh data. Clean engagement.

"LETS GOOO! Chat, I just built a cache refresh pipeline!" He pulls up the Inspector to show the freshness sparkline: the entry's gold line drops steadily, then spikes back to 1.0 when the preserve fires.

But then he notices: the PRESERVE hook transmitted on cmd-refresh — which emitted EM noise. The enemy scout detected the emission and adjusted its route.

**Minute 3:30 — The Freshness-Stealth Tradeoff**
"Oh no. The cache refresh is LOUD. Every time I preserve, I'm broadcasting my position." He checks the EM overlay in the Inspector: Relay-B's preserve action is a bright red pulse on the emission map.

Chat: "CACHE REFRESH VS STEALTH — THE ETERNAL DEVOPS PROBLEM" / "this is why we don't poll in production"

Kwame spends the next 5 minutes redesigning: instead of preserving every tick, he configures Relay-B to preserve only when the entry freshness drops below 0.4 — a conditional refresh that fires less often, emitting less noise. The freshness sparkline now shows a sawtooth pattern: decay to 0.4, spike to 1.0, decay to 0.4, spike again. Like a heartbeat.

"Chat, I just implemented conditional cache refresh with a configurable threshold. In a game. On stream. What is happening."

**Minute 7:00 — The Content Clip**
He replays the mission with the Inspector's signal overlay, showing the preserve pulse traveling from relay to striker, the freshness spike, the engagement. He narrates: "The signal was dying. It had 3 ticks to live. Then the relay refreshed it — like hitting ctrl+R on a stale webpage. The striker got fresh data and closed the kill. Cache invalidation won the battle."

The clip gets 12K views on TikTok with the caption: "When your game teaches you more about distributed systems than your CS degree."

**UI Annotations:**
- PRESERVE action: new entry in hook action dropdown, configurable target unit, target entry type, and channel
- Preserve visual: target entry flashes from current opacity to full opacity over 200ms, accompanied by `doo-deep` ascending audio
- Freshness sparkline in Inspector: gold line overlaid on fill sparkline, sawtooth pattern visible when preserve is active
- EM emission overlay: preserve hooks show as pulsing concentric circles from the transmitting unit, same as other hook emissions but colored differently (cyan for preserve vs. green for standard)
- Conditional preserve: hook condition field accepts freshness comparison operators (`target.freshness < 0.4 → PRESERVE`)

---

### Journey 3: Abuela Rosa, 64, Retired Teacher from Batangas (The Ghost Data Crisis)

**Context:** Mission 6 — first factory mission with full system complexity. Rosa plays on "Standard" cognitive complexity mode. She's a careful, methodical player who reads every tooltip. She's been playing for 3 weeks, one mission per sitting. Her grandson set it up on her tablet.

**Minute 0:00 — A Buffer Full of Ghosts**
Rosa's architecture is conservative: 2 scouts, 2 strikers, 1 relay. She's configured her relay to listen on all channels — she doesn't want to miss anything. The factory produces units every 4 ticks.

Sealed watch begins. Things look good for the first 15 ticks. Then something strange happens: her relay's context bar is **full** — all 12 slots occupied — but the bar looks **washed out**. Most of the pips are translucent, ghostly. Only 2-3 at the right end are vivid.

On tick 18, a new scout report arrives at the relay. The relay's buffer is full — but most entries are ghosts (freshness 0.1-0.2). The new entry would need a slot. The system evicts the stalest entry (freshness 0.11) to make room. But the relay's rules try to fire on the buffer contents — and the first matching rule triggers on a ghost entry (freshness 0.15), an enemy position from 12 ticks ago.

The relay amplifies and forwards the stale report. The striker receives it and engages... at an empty tile. The enemy is long gone.

Rosa sees the striker charge to an empty spot and frowns. "Ay, he went to the wrong place."

**Minute 1:30 — The Inspector Diagnosis**
In the Inspector, Rosa clicks the relay. The buffer state at tick 18 shows:

```
Slot 0: [terrain] age:14 fresh:0.08 ⚠ GHOST
Slot 1: [terrain] age:13 fresh:0.11 ⚠ GHOST
Slot 2: [enemy_pos] age:12 fresh:0.15 ⚠ GHOST  ← RULE MATCHED
Slot 3: [allied_pos] age:11 fresh:0.19 ⚠ GHOST
...
Slot 10: [enemy_pos] age:2 fresh:0.82
Slot 11: [scout_report] age:1 fresh:0.93
```

The buffer is 12/12 — but 8 entries are ghosts. The relay's rule `IF enemy_pos → amplify` matched slot 2 (ghost) instead of slot 10 (fresh) because the rule evaluator scans from slot 0 and matches the first hit.

Rosa narrows her eyes. She's been a teacher for 40 years; she knows a diagnostic when she sees one. "He matched the OLD one, not the new one. Why? Because it's listed first."

**Minute 2:30 — The Freshness Threshold Fix**
Rosa opens the relay blueprint. She finds the amplify rule and sees the freshness threshold slider at 0.0 — "accept any freshness." She thinks about it like grading homework: "I wouldn't accept a paper turned in two weeks late. Why should my relay accept data that old?"

She drags the slider to 0.5. Now the rule reads: `IF enemy_pos AND freshness > 0.5 → amplify`. The ghost entries at 0.15 won't match. Only the fresh entry at 0.82 will.

**Minute 3:00 — The Dissolution Threshold Discovery**
But she's not done. "Why are those ghost entries still taking up space? They should be thrown away!" She finds the dissolution threshold setting in the context config: currently 0.1. She raises it to 0.3. Now entries dissolve when freshness drops below 0.3 — clearing ghost data faster and freeing slots.

She hits EXECUTE. This time, the relay's buffer stays cleaner — ghost entries dissolve before they accumulate. The buffer is rarely more than 8/12 full. When the stale enemy report arrives, the relay has headroom. The fresh enemy position gets amplified correctly. The striker engages at the right tile.

"There," Rosa says with teacher's satisfaction. "No more accepting late homework."

**Minute 5:00 — Teaching Her Grandson**
When her grandson visits, she shows him the replay. "See these faded ones? That's old information. My relay was using old information to make decisions. I had to teach it to only trust fresh data." Her grandson, a computer science student, stares. "Abuela... you just described cache invalidation." "I described common sense, mijo."

**UI Annotations:**
- Ghost entries: opacity below 0.3, "⚠ GHOST" label in Inspector detail view
- Dissolution threshold: slider in Context Config section, range 0.0–0.5, default 0.1
- Buffer fullness vs. freshness: context bar can look "full" (all slots occupied) but visually unhealthy (mostly transparent pips)
- Rule evaluation order indicator: in Inspector, the matched slot is highlighted with a gold border; skipped slots (those that matched the condition type but failed freshness threshold) show a dimmed amber border
- Freshness threshold tooltip: "Only match entries with freshness above this value. Higher = stricter, more reliable. Lower = more permissive, may use stale data."

---

### Journey 4: Dex, 19, Competitive Gamer and Speedrunner (Exploiting Decay Asymmetry)

**Context:** Mission 9, deep campaign. Dex has been speedrunning the campaign and has discovered that decay rates differ by entry type. He's in the Gauntlet practicing against other players' ghost configurations. He wants to exploit enemy freshness thresholds.

**Minute 0:00 — The Decay Rate Exploit**
Dex has studied the decay rate table. Compressed data decays at 0.05/tick (half-life: 14 ticks) while raw hook messages decay at 0.15/tick (half-life: 5 ticks). His strategy: build a relay architecture that ONLY transmits compressed data — paying the relay processing cost but getting signals that live twice as long in target buffers.

His architecture: 3 scouts → 2 relays (both with compress + amplify) → command → 3 strikers. Every signal passes through compression before reaching decision-makers. The strikers' buffers are full of long-lived compressed intelligence.

"Standard architectures have strikers acting on 5-tick-old data with 0.5 freshness. MY strikers have 5-tick-old COMPRESSED data with 0.75 freshness. Huge advantage."

**Minute 1:00 — Counter-Exploit: The Slow Poison**
His opponent's ghost config (from a Diamond-rank player) does something unexpected. The enemy floods a channel with crafted messages designed with artificially low decay — they persist in Dex's relay buffers for 20+ ticks, crowding out real observations. These aren't standard noise floods (which decay fast). They're **slow poison** — low-throughput but high-persistence disinformation.

Dex's relay buffers fill with enemy-injected ghost data. Even with his dissolution threshold at 0.25, the poison entries decay so slowly they persist for 15+ ticks. Real scout reports arrive but can't find slots — evicted immediately.

"What the— how are these entries lasting so long?" He checks the Inspector. The enemy scout has a special hook that transmits with a `decay_modifier: 0.3` flag — the signal arrives with inherently slow decay. "Oh. They're sending STICKY signals. This is cache poisoning!"

**Minute 2:30 — The Counter-Counter**
Dex redesigns: he adds a freshness threshold to the relay's LISTEN configuration — not just to rules, but to the channel input itself. "Only accept entries on recon-net if they have standard decay rate." This filters out the slow-poison signals at the door.

But wait — he can't check decay rate at reception time in the current system. He needs a different approach. He configures his relay's dissolution threshold HIGHER — 0.4 — so entries dissolve faster across the board. This means his own compressed data (0.05 decay) also dissolves sooner, but it clears the poison faster.

It's a tradeoff: faster global decay vs. longer-lived intelligence. He compensates by increasing preserve hook frequency, creating a system that aggressively cleans AND aggressively refreshes critical data.

"Chat, I just built an immune system. White blood cells killing foreign data. Refresh cells keeping the important stuff alive. This game is insane."

**Minute 5:00 — The Clip**
TikTok: split-screen replay showing his striker's freshness sparkline. On the left, the original run — flat low freshness, stale data, missed engagements. On the right, the preserve+dissolution run — sawtooth freshness pattern, crisp engagements, clean victory. Caption: "cache poisoning countered by aggressive TTL + conditional refresh. This game taught me more about cybersecurity than my COMP SCI 401 class."

**UI Annotations:**
- Decay modifier on hook transmissions: visible in Inspector as a colored badge on the entry (standard = no badge, slow = amber tortoise icon, fast = green hare icon)
- Dissolution threshold as defensive tool: raising threshold cleans ghost data AND poison data, but also reduces legitimate data lifespan
- Preserve frequency as sawtooth pattern: visible in freshness sparkline as regular spikes, frequency = maintenance cost
- Competitive viability: decay asymmetry creates meta-game of exploiting decay rate differences between entry types and between self-generated vs. opponent-generated data

---

## The TikTok Clip

**"The Memory Fades"** — 15-second clip, starts on a striker's context bar during sealed watch. Six vivid cyan pips. Over 3 seconds, they visibly fade — translucent, ghostly, flickering. The leftmost pip contracts to a point and vanishes: `tsss`. Then another. Then three dissolve simultaneously with a static crackle. The striker has 2 faded entries and 1 fresh one. It acts on the fresh entry — clean kill. Cut to the Inspector: the freshness sparkline showing the dramatic decline and the single surviving fresh entry that won the battle. Text overlay: "Your agents are only as good as their freshest memory." Audio: the `tsss` dissolution sounds layered into a rhythmic pattern, almost musical.

---

## New Aspects Discovered

1. **2.03a — Freshness-aware rule evaluation order:** When multiple buffer entries match a rule's condition, should the rule match the FIRST (lowest index, oldest/stalest) or the FRESHEST? First-match-wins is simpler but creates the "ghost data" problem Rosa encountered. Freshest-match-wins is smarter but less predictable. Player-configurable match strategy (first/freshest/highest-priority) as an advanced setting.

2. **2.03b — Terrain-modified decay rates:** Jungle tiles accelerate decay (humid, unstable environment — data rots faster); city tiles decelerate decay (stable infrastructure preserves signals); Taal volcanic tiles have variable decay (stable when calm, rapid when erupting). Terrain as information infrastructure, not just movement. Interaction with 2.14e terrain-as-mission-identity and 6.01a-ii biome-specific signal propagation.

3. **2.03c — Decay as difficulty axis:** Instead of a fixed decay rate table, decay rates could be a per-mission parameter. Tutorial missions: near-zero decay (everything stays fresh forever, effectively fixed-slot). Mid-campaign: moderate decay. Late campaign: aggressive decay. Final mission: asymmetric decay (your data decays fast, enemy data decays slow). Interaction with 2.19 variable scenario seeds.

4. **2.03d — The "memory palace" Specialist skill:** A Specialist skill that creates a protected sub-buffer of 2-3 entries with zero decay — "pinned" memories that never fade. But pinned entries are permanent, consuming slots that can't be freed. The tension between reliable memory and buffer capacity. Maps to Redis PERSIST (removing TTL). Interaction with 2.09 sticky memories.

5. **2.03e — Visual decay language across the three screens:** Detailed specification of how freshness is rendered at each zoom level and screen context — Plan (thermometer prediction), Sealed Watch (opacity gradient in tiny pips, readable?), Inspector (sparkline + per-entry detail). The critical question: can opacity variation be legible at sealed-watch scale, or does decay information belong exclusively in the Inspector? Interaction with 6.01b-v sprite readability at zoom levels.
