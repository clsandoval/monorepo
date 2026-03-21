# 4.14 — The Scenario Parameter Panel

## The Option

Before the player hits EXECUTE, the game runs their configuration against 100 randomized test cases internally. But right now, those 100 scenarios are a black box — the player doesn't know what varies. The **Scenario Parameter Panel** is a pre-execution UI element that reveals the parameters of randomization: enemy spawn timing ranges, patrol route distributions, resource node placement variance, initial positioning jitter. It answers the question: "What am I being tested against?"

This transforms EXECUTE from a leap of faith into a calculated risk. The player can look at the parameter panel and think: "Enemy spawn timing varies from tick 3 to tick 12 — my relay doesn't come online until tick 8, so in 40% of cases I have no comms when the first wave hits. I need a fallback." The panel turns randomization from frustrating variance into a puzzle surface.

### Mechanical Rules

Each mission defines a **scenario parameter set** — the variables that randomize across the 100 test cases:

| Parameter | Example Range | Distribution |
|-----------|--------------|-------------|
| Enemy spawn tick | 3–12 | Uniform |
| Enemy patrol seed | 1–256 | Uniform (determines patrol routes) |
| Resource node positions | 3 possible layouts | Equal probability |
| Weather/interference | Clear / Light fog / Dense fog | 30% / 50% / 20% |
| Enemy count wave 1 | 2–4 | Weighted toward 3 |
| Terrain hazard activation | Tick 10–20 | Normal, μ=15 |

The panel displays these as visual distributions — not raw numbers, but shapes the player can read at a glance. A uniform distribution is a flat bar. A normal distribution is a bell curve. A weighted distribution shows thicker bars where outcomes cluster.

### The Gating Question: Always Visible vs. Unlockable

**Option A — Always Visible ("Open Book"):**
The parameter panel is always accessible from the Plan screen. A collapsible drawer on the left edge, labeled "SCENARIO VARIANCE" in monospaced cyan text. Players can open it anytime. Beginner-friendly — no hidden information. But risks overwhelming new players with statistical noise they don't understand yet.

**Option B — Unlocked via "Tactical Briefing" Skill ("Intel Earned"):**
The panel is locked behind a skill called **Tactical Briefing** that can be equipped on a Command or Specialist unit. The skill costs a slot — so seeing the parameters requires sacrificing another capability. This creates a meaningful trade-off: do you want to know what you're facing, or do you want another combat skill? This mirrors real agentic AI engineering where observability tooling competes with feature development for resources.

**Option C — Progressive Reveal ("Fog Lifting"):**
Missions 1–4 show no parameters (tutorial, fixed scenarios). Mission 5 introduces the panel with 2–3 simple parameters. Each subsequent mission adds parameters. By Mission 8, the full panel is visible. No skill cost — it's a campaign progression reward. The player earns legibility by advancing.

**Recommended: Option C with Option B as a veteran modifier.** Progressive reveal teaches players to read parameters gradually. In late-game missions (8–10), a Tactical Briefing skill could reveal *additional* hidden parameters or show exact percentiles instead of ranges — rewarding the investment.

---

## Player Journeys

#### Journey: Mika, 22, Computer Science Student

**Context:** Mission 6, first factory mission with full production. Has been burned twice by early enemy rushes in scenarios where spawns happened at tick 3 instead of the expected tick 8. Just unlocked the Relay unit. Wants to build a robust architecture.

**Minute 0:00 — Opening the Workbench**
Mika lands on the Plan screen. The 8x8 board sits left with the Cebu urban tileset — neon-lit grid squares, a player factory in the bottom-left glowing cyan, enemy spawner top-right pulsing red. The workbench dominates the right side: blueprint editor tabs for Scout, Striker, Relay. The production queue conveyor stretches along the bottom.

On the left edge of the board, a thin vertical tab reads "SCENARIO" in small monospaced text, with a subtle animated chevron pulsing outward — a gentle "hey, open me" invitation. The tab is rendered in a muted teal, not demanding attention but visible.

Mika clicks the tab. A drawer slides out from the left, overlaying the board preview slightly. The drawer header reads: **"MISSION VARIANCE — What changes across 100 runs"** in DM Sans, weight 600, teal on dark.

**Minute 0:15 — Reading the Parameters**
The drawer shows five parameter rows, each with a label, a visual distribution bar, and the range:

- **Enemy Wave 1 Timing**: A flat horizontal bar (uniform distribution) spanning tick 3 to tick 12. The bar is segmented into 10 columns of equal height, colored in a gradient from cool cyan (early, manageable) to warm orange (late, you've had time to prepare). Below: "First enemies appear between T3 and T12."
- **Enemy Count (Wave 1)**: Three columns — "2" (short, 20%), "3" (tall, 50%), "4" (medium, 30%). A weighted histogram. The "4" column has a faint warning pip — four enemies in wave 1 is a stress test.
- **Patrol Seed**: A single icon showing a shuffled deck of cards. Label: "256 possible patrol routes." No distribution shown — it's opaque randomness. A small "?" tooltip reads: "Enemy movement patterns vary. Your scouts will observe different routes each run."
- **Resource Layout**: Three tiny board thumbnails (8x8 grids with highlighted resource nodes in gold), each labeled "A," "B," "C" with "33% each" below. Mika can hover each thumbnail to see it overlaid on the main board preview.
- **Interference**: Three horizontal segments in a single bar — "Clear" (30%, bright), "Light Fog" (50%, medium), "Dense Fog" (20%, dim with a static-noise texture). The fog segments have a tiny radar icon overlaid.

Mika's eyes widen. She didn't realize enemy timing could be as early as tick 3. Her current build queues the Relay first (5 ticks to produce), meaning in ~30% of runs, enemies arrive before she has any comms infrastructure.

**Minute 0:45 — Reasoning About Robustness**
Mika closes the parameter drawer and starts redesigning. She swaps the production queue: Scout first (3 ticks), then Relay (5 ticks). The Scout can survive independently with its evade skill until the Relay comes online. She configures the Scout's hooks to broadcast on "early-warning" channel, and gives the Relay a rule: "If channel early-warning has signal AND tick < 10, compress and amplify to striker-net." This handles the early-spawn cases.

For the Dense Fog scenarios (20% of runs), she adds a rule to her Striker blueprint: "If context window has no entries from early-warning for 3 consecutive ticks, patrol toward last known enemy position." This fallback handles signal blackout — if fog blocks the Scout's transmissions, the Striker doesn't just sit idle.

**Minute 1:30 — Confidence and Execute**
Mika opens the parameter drawer one more time. She mentally walks through: early spawn + dense fog = worst case, ~6% of runs. Her fallback patrol rule handles it. Late spawn + clear weather = best case, ~9% of runs. Her standard architecture dominates. She feels confident she's covered the edges. She hits EXECUTE.

The parameter drawer auto-collapses with a smooth slide animation as the screen transitions to sealed watch. The drawer's teal accent color briefly flashes across the EXECUTE button before the battle begins.

**Minute 3:00 — Debrief Callback**
In the Inspector, the debrief shows her win rate across the 100 runs: 87/100. She clicks "Show failures" and sees a scatter plot — the 13 failures cluster in "Wave 1 at T3-T5" AND "Dense Fog" AND "4 enemies." The parameter panel's distributions are echoed here as marginal histograms on the scatter axes. She can see exactly which parameter combinations she still can't handle.

**UI Annotations:**
- **Scenario tab**: 24px wide, left edge of board, teal (#2dd4bf) with pulsing chevron animation (0.5s ease-in-out, 50% opacity pulse)
- **Parameter drawer**: 280px wide when open, slides from left over 300ms cubic-bezier. Dark background (#1a1a2e) with 1px teal border.
- **Distribution bars**: 200px wide, 32px tall per parameter. Uniform = flat segments. Weighted = variable-height columns. Each segment is individually hoverable.
- **Resource layout thumbnails**: 48x48px each, 1px border, hover → 200x200px overlay on board with 200ms fade-in.
- **Fog segments**: Static noise texture (CSS noise pattern, 3px grain) on Dense Fog bar to viscerally communicate disruption.

---

#### Journey: Tatay Jun, 58, Retired Electrician

**Context:** Mission 4, pre-factory tutorial. Jun has been playing slowly and carefully, reading every boot log entry. He just learned about hooks in Mission 3. The scenario parameter panel is NOT yet visible — Mission 4 is still in the progressive reveal window (Missions 1-4 show no parameters, fixed scenarios).

**Minute 0:00 — No Panel, Fixed Scenario**
Jun opens the Plan screen for Mission 4 (Batanes highlands). The board shows a compact 8x8 grid with highland terrain — elevated tiles in the corners, a narrow pass through the center. Three pre-placed units: Scout at B2, Striker at E5, Relay at D3. No factory yet. No production queue.

The left edge of the board is clean — no scenario tab. The mission is deterministic: same enemy spawns, same patrol routes, same timing every time. Jun doesn't know this explicitly, but he notices that when he retries (he's retried twice), the enemies do the same things. "Ah, like rewinding a tape," he thinks.

**Minute 0:30 — Learning Without the Panel**
Jun's third attempt. He's memorized that enemies appear at tick 6 from the top-right. His Scout patrols the right side. He configures a hook: "When Scout sees enemy → broadcast on 'alert'." The Striker has a rule: "If alert signal in context → move toward signal source."

He hits EXECUTE. The Striker responds to the Scout's alert at tick 8 (2-tick latency: Scout sees at T6, broadcasts, Striker receives at T7, acts at T8). The Striker eliminates the first enemy. Jun pumps his fist.

**Minute 2:00 — The Absence Teaches**
Jun wins Mission 4. The debrief shows a clean timeline. But there's a new element in the debrief footer — a small note: "This mission used a fixed scenario. Starting Mission 5, each EXECUTE runs 100 varied scenarios." Below it, a preview: a tiny histogram labeled "COMING NEXT: Scenario Variance" with placeholder parameter shapes. It's a teaser — planting the seed before Mission 5 introduces the full panel.

Jun reads it carefully. "One hundred? So it's not the same every time anymore?" He re-reads the boot log from Mission 4's intro, which mentioned "deterministic training grounds" — now he understands why. The tutorial was training wheels. The real game tests robustness.

**Minute 3:00 — Mission 5 Reveal**
Jun enters Mission 5. The Plan screen loads — and for the first time, the teal "SCENARIO" tab appears on the left edge. It has a gentle glow animation, and a one-time tooltip floats next to it: "NEW: Tap to see what varies across your 100 test runs."

Jun taps it. The drawer slides open. Only three parameters are shown (simplified for the first reveal):
- **Enemy Spawn Tick**: 5–10 (flat bar). "Enemies arrive between tick 5 and 10."
- **Enemy Count**: 2 or 3 (two columns, 50/50). "You'll face 2 or 3 enemies."
- **Resource Layout**: 2 variants (two tiny thumbnails).

The parameters are annotated with plain-language explanations. No statistical jargon. No "uniform distribution" — just "equal chance of any value in the range." Jun reads each one. He nods. He understands that his architecture needs to handle both 2-enemy and 3-enemy cases. He adds an extra Striker to his production queue.

**UI Annotations:**
- **First-time tooltip**: Rounded rectangle, white text on teal background, positioned 8px right of the tab, arrow pointing left. Auto-dismisses after 8 seconds or on click. Never reappears.
- **Plain-language labels**: Every parameter has a one-sentence explanation in 14px DM Sans, weight 400, #9ca3af (muted gray). No numbers without context.
- **Mission 4 debrief teaser**: Bottom of debrief panel, 12px text, teal accent, with a miniature histogram icon (decorative, not interactive). Separated from main debrief by a thin dashed line.
- **Progressive complexity**: Mission 5 = 3 parameters. Mission 6 = 5. Mission 7 = 6. Mission 8+ = full panel (8-10 parameters).

---

#### Journey: Ava, 30, Senior ML Engineer

**Context:** Mission 9, deep in the factory-vs-factory arc. Ava has been min-maxing her architectures. She's won Mission 8 with a 94/100 win rate and wants to push for 100/100 on Mission 9. She has the Tactical Briefing skill unlocked on her Command unit.

**Minute 0:00 — The Full Parameter Panel**
Ava opens the Plan screen for Mission 9 (Bohol hills). She immediately opens the scenario drawer — it's a reflex now, always her first move. The standard panel shows eight parameters with their distributions.

But Ava has something extra. Her Command unit has the **Tactical Briefing** skill equipped (costing one of its six precious skill slots). At the bottom of the parameter panel, below the standard parameters, a section glows with a gold border: **"TACTICAL BRIEFING — Enhanced Intel"**. This section shows three additional parameters that other players don't see:

- **Enemy Adaptation Rate**: A bell curve centered at 1.2x, ranging from 0.8x to 1.6x. "Enemy blueprints mutate between waves. Higher = faster adaptation." Ava notes the tail — 5% of runs have enemies adapting at 1.5x+, meaning by wave 3 the enemy has near-optimal counter-configurations.
- **Signal Interference Zones**: A heatmap overlay on the board preview, showing probability clouds where interference might spawn. Three hotspots glow orange — the central pass, the eastern ridge, the relay-optimal position at D4. "In 40% of runs, signal interference blocks D4."
- **Enemy Priority Seed**: A small table showing three enemy targeting priority archetypes — "Rush" (30%), "Siege" (40%), "Assassin" (30%) — with a one-line description of each. Rush targets the factory. Siege controls resource nodes. Assassin hunts relays.

Ava exhales. D4 is where she always places her primary relay. 40% interference there means she needs a backup relay position. And the Assassin archetype — 30% of runs have enemies specifically hunting relays. She needs relay-protection rules on her Strikers.

**Minute 0:30 — Statistical Reasoning**
Ava pulls out mental combinatorics. Worst case: Assassin priority (30%) × D4 interference (40%) × high adaptation rate (5%) = 0.6% of runs. But the compounding is what kills her — Assassin + D4 interference alone is 12% of runs, and those are the ones where her relay network collapses. She needs a relay configuration that survives both.

She redesigns: two relays instead of one, at D4 and F2. Each listens to the other's channel. If one goes dark (context window receives no signals for 2 ticks from the partner relay), the surviving relay switches to high-power broadcast mode (amplify skill). The redundancy costs 10 minerals — she'll produce one fewer Striker. But it covers the 12% failure mode.

**Minute 1:00 — The Percentile View**
Ava hovers over the Enemy Spawn Tick parameter. Because she has Tactical Briefing, she sees an enhanced tooltip: the exact percentile breakdown. "P10: tick 4. P25: tick 5. P50: tick 7. P75: tick 9. P90: tick 11." She's designing for P10 — the worst-case early spawn. Her production queue starts with Scout (available by T3, before the P10 spawn at T4).

She also notices a subtle visual: each parameter row has a tiny sparkline in the right margin showing her *historical win rate* against that parameter's values. Her win rate drops sharply when Enemy Count hits 5+ (the tail of the distribution). The sparkline is a thin line chart, 60px wide, green for >80% win rate, amber for 50-80%, red for <50%. The "5 enemies" region is amber. That's where she's bleeding wins.

**Minute 2:00 — Execute with Full Confidence**
Ava hits EXECUTE. She's not nervous — she's calculated her coverage. The parameter panel collapses, and a brief flash shows a summary stat: "Estimated coverage: 96% of scenario space addressed." This is a Tactical Briefing bonus — a pre-execution confidence metric based on how many parameter combinations her architecture has explicit handling for (rules, hooks, fallbacks that reference the parameter-sensitive conditions).

**Minute 4:00 — Debrief Correlation**
Post-battle, the Inspector's debrief includes a **parameter correlation matrix** (Tactical Briefing bonus). A small heatmap shows which parameter combinations correlated with losses. The matrix lights up in red at the intersection of "Assassin priority" and "High adaptation rate" — 3 of her 4 losses were that combo. The Assassin found and killed her backup relay before the adaptation rate made her Strikers' rules obsolete. She needs a third-generation fallback.

**UI Annotations:**
- **Tactical Briefing section**: Gold (#fbbf24) 1px border, bottom of parameter drawer, with a small skill icon (Command unit portrait, 16x16) in the header. Faint gold glow (box-shadow: 0 0 8px rgba(251,191,36,0.3)).
- **Interference heatmap**: Semi-transparent orange probability clouds overlaid on board preview. Each cloud is a radial gradient, opacity proportional to interference probability. Animated: clouds pulse slowly (2s cycle) to suggest instability.
- **Historical win-rate sparklines**: 60px × 16px, right-aligned in each parameter row. Green (#22c55e) above 80%, amber (#f59e0b) 50-80%, red (#ef4444) below 50%. Only visible after Mission 7 (need enough data).
- **Estimated coverage stat**: Appears on EXECUTE button hover, 12px monospaced text, fades in over 200ms. Format: "Coverage: 96%" in teal. Tactical Briefing only.
- **Correlation matrix**: 120x120px heatmap in debrief sidebar, cells colored white (no correlation) to red (strong loss correlation). Hoverable — each cell shows "X + Y → Z% loss rate."

---

## Strengths and Weaknesses

### Strengths

- **Transforms randomization from frustrating to strategic.** Without the panel, players experience variance as noise. With it, variance becomes a puzzle dimension — "design for the distribution." This is the core insight of robust systems engineering made tangible.
- **Teaches transferable skills.** Reading distributions, reasoning about edge cases, designing for worst-case scenarios — these are real agentic AI engineering skills. The panel is a literal observability dashboard.
- **Creates a natural difficulty ramp.** Progressive reveal means new players aren't overwhelmed. By Mission 8, reading the parameter panel is second nature.
- **Rewards system-level thinking.** The panel pushes players from "build a thing that works" to "build a thing that works across 100 variations." This is the jump from scripting to engineering.
- **The Tactical Briefing skill creates meaningful trade-offs.** Spending a Command slot on intel vs. another operational skill mirrors real-world observability-vs-features decisions.

### Weaknesses

- **Analysis paralysis risk.** Players who over-study the panel may spend minutes optimizing for edge cases that represent 2% of runs. The panel must avoid becoming a spreadsheet.
  - **Mitigation:** Keep distributions visual and gestalt-readable. No raw data tables. Shapes over numbers.
- **The "solved game" problem.** If parameters are fully visible, expert players may find deterministic optimal solutions that cover 100% of the parameter space, eliminating all variance. The game becomes a math problem.
  - **Mitigation:** Patrol Seed (256 variants) stays opaque. Some parameters are intentionally unreadable — you know the *range* but not the *interaction effects*. Emergent enemy behavior from parameter combinations can't be pre-computed by the player.
- **Clutter on the Plan screen.** The Plan screen already has the blueprint editor, production queue, channel map, and board preview. Adding a parameter drawer adds visual weight.
  - **Mitigation:** Collapsible drawer, off by default. Players open it when they want it.
- **Balancing the Tactical Briefing skill.** If the enhanced intel is too powerful, every player equips it and it stops being a choice. If too weak, no one bothers.
  - **Mitigation:** Enhanced parameters should provide insight into *enemy behavior* (which varies) rather than *map state* (which is visible on the board). The intel helps you design better rules but doesn't give you unfair positional advantage.

---

## Interaction Effects

- **Inspector debrief (4.13, latency visualization):** The parameter panel's distributions can be echoed in the debrief as marginal histograms on failure scatter plots. When a player sees their losses clustered in "early spawn + dense fog," the parameter panel's visual language (the same bar shapes, the same colors) creates instant recognition: "I saw this distribution before I hit EXECUTE — I should have designed for it."
- **Config integrity (4.10):** A player with low config integrity who opens the parameter panel should feel the tension: "I'm about to face 100 varied scenarios and my config has been tampered with." The parameter panel could show a small warning icon when config integrity is below a threshold — "Variance + compromised config = high failure risk."
- **Blueprint editor (Plan screen locked design):** The parameter panel must not compete with the blueprint editor for screen space. The collapsible drawer on the left edge of the board preview (not the workbench) keeps them spatially separated. Blueprint editing happens right-side; scenario reasoning happens left-side.
- **Sealed watch (no tools):** The parameter panel is NOT available during sealed watch. You committed to your architecture; now you watch. The absence of the panel during execution reinforces the "sealed" feeling.
- **Boot log narrative:** Mission 5's boot log should narratively introduce the concept: "SUBSYSTEM ONLINE: Scenario variance engine initialized. Your previous missions ran fixed parameters. Real-world conditions are never fixed. Initializing 100-scenario test harness..." The parameter panel is a diegetic subsystem.

---

## Comparable Games

### Into the Breach — Enemy Intent Telegraphing
Into the Breach shows you exactly what enemies will do next turn — their targets, attack patterns, damage. This is "parameter visibility" in miniature: you know the inputs, you reason about your response. The scenario parameter panel extends this from "what will happen this turn" to "what might happen across 100 runs." Into the Breach proves that showing the player more information creates MORE tension, not less — because now you can't blame luck, only your own reasoning.

### XCOM 2 — Hit Percentages
XCOM shows hit probability on every shot. Players learn to never take a 65% shot when they can engineer a 95% shot. The parameter panel works the same way: showing distributions teaches players to engineer high-coverage architectures rather than gambling on favorable scenarios. XCOM's most frustrated players are those who take bad odds and lose; the parameter panel aims to make "bad odds" visible and avoidable.

### Slay the Spire — Event Distribution Knowledge
Expert Slay the Spire players memorize which events can appear on each floor. They know the probability of encountering a rest site, a shop, an elite. This meta-knowledge informs every decision — "I can afford to take damage here because I know a rest site is likely in the next 3 rooms." The parameter panel makes this implicit meta-knowledge explicit and in-game.

### Factorio — Production Statistics Panel
Factorio has a production statistics panel showing throughput, consumption rates, and bottleneck visualization. Most new players ignore it. Veterans live in it. It's always accessible but never forced. This is the model for the scenario parameter panel: an optional depth tool that rewards engagement but doesn't punish ignorance.

---

## Sensory Description

The parameter drawer slides out from the board's left edge like a medical chart being pulled from a rack — smooth, mechanical, purposeful. The background is deep navy (#1a1a2e), one shade darker than the Plan screen's charcoal, creating a subtle "recess" effect as if you're looking into the machine's planning core.

Each parameter row is a horizontal stripe, 48px tall, separated by 1px lines of dark teal (#134e4a). The parameter label sits left-aligned in monospaced Fira Code, 13px, teal (#2dd4bf). The distribution visualization occupies the center — and these are the panel's visual signature. Uniform distributions are flat bars, each segment the same height, colored in a gradient from cool blue (favorable values) to warm amber (stress-test values). The gradient is not decorative — it encodes player-relevant meaning. Weighted distributions use variable-height columns, taller bars for more likely outcomes, with the tallest column casting a faint glow downward (box-shadow) to draw the eye to the mode.

The sound design is subtle. Opening the drawer plays a quiet mechanical slide (think filing cabinet), and a faint hum underlies the panel while open — the scenario engine "running" in the background. Hovering a parameter row plays a soft click (typewriter key). Closing the drawer plays the reverse slide.

When the Tactical Briefing section appears, the gold border animates in — a line drawing itself around the section over 400ms, starting from the top-left corner and racing clockwise. The enhanced parameters fade in 200ms after the border completes. The gold glow is warm against the cool teal of the standard parameters, creating a visual "VIP section" feeling.

The interference heatmap overlay on the board preview uses a translucent orange (#f97316 at 20% opacity) with animated noise grain — a subtle CSS animation that shifts the noise pattern every 500ms, creating a "static on a radar screen" effect. When interference zones overlap with the player's relay positions, the overlap region pulses red briefly (200ms flash, 2s interval) as a spatial warning.

### The TikTok Clip

A player opens the scenario panel, sees "Enemy spawn: tick 3–12" visualized as a flat bar. Cut to: they redesign their production queue, moving Scout before Relay. Cut to: sealed watch — a tick-3 spawn hits, Scout spots it, broadcasts, Striker intercepts. Text overlay: "I saw the worst case before it happened." The panel is the moment the player stops being reactive and starts being an engineer.
