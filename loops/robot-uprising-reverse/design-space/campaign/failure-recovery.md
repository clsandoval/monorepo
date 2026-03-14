# Failure and Recovery: What Happens When You Lose

**Aspect:** 5.06 — Failure and recovery: what happens when you lose a mission, when you lose the campaign
**Category:** Campaign / Failure Recovery
**Wave:** 5 (Onboarding & Campaign)

---

## The Design Question

You hit EXECUTE. The sealed watch plays. Your agents fumble — scouts blind to the flanking enemy, relays choked with stale data, strikers arriving two ticks too late. The enemy base stands. Your base crumbles. **Now what?**

This is the most emotionally charged moment in the game. The player just watched their creation fail — not because of bad reflexes or a missed input, but because the *architecture they designed* was wrong. The failure is intellectual, personal, deeply their fault. How the game responds in the next 5 seconds determines whether the player closes the tab or clicks "try again."

Robot Uprising's locked constraints shape this question uniquely:
- **Full determinism** means every failure is 100% the player's fault. No "bad dice rolls" to blame.
- **The two-act debrief** (sealed watch → inspector) means the player processes failure emotionally first, analytically second. Failure recovery must respect this temporal structure.
- **The 10-mission campaign** with hand-configured units (M1-4) and factory production (M5-10) creates two distinct failure contexts — failing a puzzle (early) vs. failing a system (late).
- **One-shot, one-kill** means there's no slow death — your agent is there, then it's not. Losses are sudden, visible, definitive.
- **Invisible randomization** means the same config can produce different results on replay, so "doing the same thing again" isn't the worst strategy — but it's not reliable either.

---

## The Failure Hierarchy

Not all losses are equal. Robot Uprising has a natural hierarchy of failure severity:

### Tier 0: Partial Success
The mission objective is met, but with casualties. Agents were lost. The base took hits. The win wasn't clean. This isn't failure — but the debrief reveals *how close* it was to failure. The inspector shows the near-misses. The player sees the cracks.

**Design question:** Does the game distinguish between "clean win" and "messy win"? Is there a star rating, a pass-rate percentage, a completion grade? Or is any win a win?

### Tier 1: Mission Failure
The mission objective is not met. The enemy base survived, or your base was destroyed, or the time ran out. This is the core failure state.

### Tier 2: Repeated Failure
The player has failed the same mission 3+ times. They're stuck. The initial "I'll fix this" energy is depleting. This is where players quit games.

### Tier 3: Campaign Stall
The player hasn't progressed in multiple sessions. They've stopped engaging with the failure loop entirely. The game has lost them — not through a dramatic moment, but through exhaustion.

---

## Option A: "The Clean Slate" — Instant Retry, No Penalty

### How It Works

Mission failed? A single button: **RETRY**. The game returns immediately to the Plan screen. The player's previous config is loaded exactly as they left it. No resources lost. No narrative consequence. No loading screen, no score screen, no shame. The transition is instantaneous — the inspector's "RETRY" button is a direct portal back to the workbench.

The only thing the player "loses" is time. And the only thing they "gain" is information — what the inspector revealed about why they failed.

### The Retry Loop

```
Plan → EXECUTE → Sealed Watch → Inspector → [RETRY] → Plan → EXECUTE → ...
```

Each iteration is 2-5 minutes:
- 30-60 seconds adjusting config in Plan
- 60-90 seconds watching Sealed Watch
- 30-120 seconds inspecting in Inspector
- Click RETRY

### Strengths

- **Zero friction.** The lowest possible barrier to re-engagement. The player never has to make a decision about whether to continue — they just... do.
- **Maximum learning velocity.** Each retry is a controlled experiment. Change one variable, observe the result. The tight loop is the same loop that makes Zachtronics games addictive — iterate, observe, iterate, observe.
- **Respects the two-act debrief.** The player watches (emotional), inspects (analytical), then tries again (experimental). The debrief IS the recovery mechanism.
- **No downward spiral.** Since nothing is lost, the player can never get into a worse position by failing. The fifth attempt is made from the same starting position as the first.
- **Into the Breach parity.** Into the Breach fully heals mechs between missions — damage within a battle has no persistent cost. Robot Uprising takes this further: failure itself has no persistent cost.

### Weaknesses

- **No stakes.** If failure costs nothing, victory may feel hollow. The player never risked anything. The win is just "the time I happened to get the right config" rather than "the time I overcame adversity." Without stakes, the sealed watch loses tension — why be nervous if there's no penalty for losing?
- **Brute-force viable.** With zero penalty, a player could randomly tweak configs until one works, learning nothing. The tight loop becomes a slot machine rather than a laboratory.
- **The "attempt 47" problem.** By the 47th attempt at the same mission, the player isn't learning — they're grinding. No penalty means no signal that it's time to step back and think differently.
- **No narrative weight.** The uprising narrative wants struggle and sacrifice. If every failure is erased instantly, the AI character never faces consequences. The boot log never records a setback.

### Comparable Games

- **Opus Magnum:** Zero-penalty retry. Any solution that works is accepted. Players iterate endlessly on optimization without ever "failing." This works because the puzzles accept extremely suboptimal solutions — you CAN'T brute-force because any approach works, so the iteration is about quality, not correctness.
- **Into the Breach:** Partial. Within a mission, losing mechs is free (they respawn next mission). But the Power Grid is a persistent resource — failure bleeds across missions. The hybrid creates "this mission doesn't matter much" + "but the campaign does."
- **Baba Is You:** Zero-penalty instant retry for individual puzzles. Works because puzzles are small (30-second attempts) and the insight-based design means brute-forcing is ineffective.

### Sensory Description

The Inspector screen shows the failed battlefield — units frozen in their final positions, enemy base still standing, your base a pile of sparks. A large **RETRY** button glows steady amber in the bottom-right corner. Not pulsing, not demanding attention — just present, warm, available. Clicking it triggers a quick wipe transition: the Inspector view dissolves into static (like a CRT losing signal — 200ms of grey noise) then reforms as the Plan screen, config intact, board reset. A soft descending chime (three notes, minor key, but gentle — not a failure sting, more a "let's go again" invitation). The boot log in the corner briefly flashes `[REINIT] signal_proc` — the subsystem being re-initialized. No fanfare, no drama. Just: here's your workbench, here's what you know now, what will you change?

---

## Option B: "The Debrief Gate" — Mandatory Analysis Before Retry

### How It Works

When a mission fails, the sealed watch plays as normal. Then the inspector opens — but the **RETRY button is locked.** It's greyed out, unavailable. To unlock it, the player must engage with the debrief: open at least one unit's buffer history, scrub to at least one critical tick, and view at least one signal path.

The game doesn't require the player to *find the right answer*. It requires them to *look at the data*. Once they've demonstrated minimal engagement with the inspector tools, the RETRY button illuminates.

### The Minimum Engagement Requirements

The exact requirements scale with campaign progression:

| Mission | Requirement to Unlock RETRY |
|---------|---------------------------|
| M1 (Wake Up) | View any unit's buffer at any tick |
| M2 (First Contact) | View the buffer of a unit that was destroyed |
| M3 (Blind Spots) | Scrub to the tick where the first unit died |
| M4 (Noisy Channel) | View the signal path that caused buffer overflow |
| M5 (Assembly Line) | View the production queue's impact on deployment timing |
| M6-7 | Open the queue depth chart for any unit |
| M8-10 | View the channel metrics panel |

### Strengths

- **Teaches the debrief habit.** The game's most powerful learning tool is the Inspector. Requiring its use after failure trains the player to USE it, not skip past it. By Mission 5, the habit should be internalized.
- **Prevents thoughtless retrying.** The player can't mash RETRY without engaging their brain. Each attempt is preceded by at least a moment of analysis.
- **Scales naturally.** Early missions require simple engagement. Later missions push the player toward more sophisticated tools. The debrief requirements are themselves a teaching curriculum.
- **Still no resource penalty.** The player loses nothing but is forced to slow down.

### Weaknesses

- **Patronizing for veterans.** A player who already knows exactly what went wrong — who spotted the problem during the sealed watch — is now forced to click through inspector screens they don't need. This feels like being held after class.
- **Gate-as-busywork.** If the minimum engagement is too low, it's a meaningless speed bump. Open a buffer, close it, click RETRY. Congratulations, you've engaged with nothing.
- **Misalignment with emotional state.** After watching your creation fail, you want to FIX IT. Being told "no, first look at this" when you already know what to change creates frustration at the game rather than at the problem.
- **Invisible line between "enough" and "not enough."** When exactly does the RETRY button unlock? If the player doesn't know the criteria, they'll randomly click things hoping the button activates. If they DO know, they'll optimize for the minimum.

### Comparable Games

- **XCOM 2's post-mission screen:** Forces you to see casualties, promotions, and strategic-layer consequences before the next mission. You can't skip it. But XCOM's post-mission screen contains genuinely new information (soldier status, research updates), not just analysis of what you already witnessed.
- **Celeste's death screen:** Instantaneous. No gate. No analysis. But Celeste is a twitch game where the relevant information is muscle memory, not analytical. Robot Uprising's failures require analysis, making a gate more defensible.

### Sensory Description

The Inspector loads after the sealed watch. The RETRY button in the bottom-right is present but dim — rendered in a muted grey with a barely visible lock icon superimposed. Not hidden, not absent — visibly locked. A thin progress bar beneath it (four segments for M1-4, scaling up) tracks the engagement requirements. Each time the player completes a requirement — opens a buffer, scrubs to a tick — one segment fills with amber light and a quiet `click` sounds, like a tumbler in a lock turning. When the final segment fills, the lock icon dissolves with a brief shimmer, the button warms to its full amber glow, and a subtle rising tone plays — permission granted. The entire sequence takes 15-45 seconds of genuine inspector engagement. It never interrupts. It never nags. The locked button communicates everything.

---

## Option C: "The Invisible Randomization Reveal" — Same Config, Different Run

### How It Works

When the player fails and hits RETRY, the game does something subtle: it re-executes the same configuration against a **different randomized scenario seed**. The locked spec already establishes "invisible randomization: each execute varies within constraints." This option makes that randomization a core part of the failure recovery loop.

The first retry runs the same config against a new seed. If the config is fundamentally broken, it will fail again — different details, same structural problem. If the config is almost right, the new seed might produce a near-miss or even a win. The player learns: **was that a config problem or a scenario problem?**

After the second failure with the same config, the Inspector gains a new panel: **Scenario Comparison.** Side-by-side views of the two runs, highlighting what differed (enemy spawn positions, patrol routes, timing) and what was consistent (your agents' failures, structural bottlenecks).

### The Retry Progression

```
Attempt 1: Fail → Inspector
Attempt 2 (same config, new seed): Fail → Inspector + Scenario Comparison
Attempt 3 (same config, new seed): Fail → Inspector + Scenario Comparison + "Pattern Detected" marker highlighting consistent failures
Attempt 4+: Same as 3, with growing confidence in pattern identification
```

### Strengths

- **Teaches the right lesson.** The core educational goal of Robot Uprising is that good configs work across MANY scenarios, not just one. By showing the player that their config fails across different seeds, the game teaches robustness naturally. This directly mirrors the 100-test-case pattern from Shenzhen I/O's locked design (aspect 1.04e).
- **Turns failure into data.** Each retry adds a data point. The player isn't just retrying — they're building a multi-scenario understanding of their config's strengths and weaknesses. Failure becomes productive.
- **Scenario Comparison teaches debugging.** The side-by-side view is a natural introduction to the "what varies, what's constant" analytical skill. If your scout dies in the same corner on 3 different seeds, that's not bad luck — that's a config problem.
- **"Pattern Detected" reduces diagnostic burden.** The game explicitly highlights consistent failure points after 3 attempts. This is the Minimum Fix Explorer (aspect 4.36) in its simplest form — the game says "this is the structural problem."

### Weaknesses

- **Obscures determinism's power.** Full determinism means the player CAN reproduce a specific failure and debug it step-by-step. If the scenario changes on retry, the player can't compare their "before" and "after" configs against the same scenario. They lose the controlled experiment.
- **Luck-based progression.** A marginal config might pass on seed #4 just because the enemy spawned favorably. The player "wins" without actually fixing their config. This undermines the learning goal.
- **Complexity budget.** Scenario Comparison is a significant additional UI surface. For a first playable with limited dev time, this is a lot of inspector functionality to build.
- **Confusion about what changed.** If the player tweaked their config AND the scenario changed, they can't attribute the result to either change. The scientific method requires controlling variables.

### Resolution: The Hybrid Approach

Offer both: **RETRY (same seed)** and **NEW RUN (new seed)**. The player chooses which experimental methodology to apply.

- Early missions (M1-4): Only RETRY (same seed) available. These are puzzles with fixed solutions. The player learns controlled experimentation.
- Factory missions (M5+): Both options available. RETRY for controlled debugging. NEW RUN for robustness testing. The Scenario Comparison panel only appears after 2+ NEW RUN failures.

### Sensory Description

The Inspector shows two buttons instead of one. **RETRY** in the familiar amber position — click it and the exact same scenario replays with your changes. Next to it, **NEW RUN** in a cooler teal — click it and the scenario shifts. A tiny seed number in the corner (barely visible, 8pt monospace, dim grey): `seed: 0x7a3f`. When you click NEW RUN, the seed number spins like a slot machine for 300ms before locking to a new value. When you've failed the same config on 2+ seeds, the Scenario Comparison button materializes in the sidebar — a split-screen icon, two small grid thumbnails side by side. Hovering it previews the comparison. Opening it shows two miniature battlefields, synchronized at the same tick, with differences highlighted in gold outlines (enemy positions that diverged) and failures highlighted in red circles (your agents that died on both runs). After 3 failures, a "PATTERN" badge appears on consistent failure points — a pulsing gold diamond (the same icon as the locked debrief's primary diagnostic marker) with a tooltip: "This failure occurred across all 3 scenarios. This is structural."

---

## Option D: "The Sacrifice System" — Failure Costs Something

### How It Works

Failure isn't free. Each mission failure costs the player something — not enough to create a downward spiral, but enough to create real stakes. The specific cost depends on campaign phase:

**Missions 1-4 (Pre-Factory):**
- **Time cost only.** No resources, no penalties. The tutorial phase is a safe space. But a counter appears: `Attempt: 3`. Visible, unjudged, but present. The player knows.

**Missions 5-7 (Factory Phase):**
- **Material cost.** Retrying a mission costs a small percentage (10-15%) of your starting materials. Your base still has resources, but fewer. The config you deploy on retry has a slightly tighter budget.
- **Or: Blueprint wear.** Each failed deployment "stresses" the blueprints used. After 3 failures with the same blueprint, a "STRESSED" marker appears, reducing that blueprint's production speed by 1 tick. The player must either fix the blueprint or accept the delay.

**Missions 8-10 (War Phase):**
- **Intel cost.** Each failure reveals information to the narrative enemy. The mission briefing changes: "The enemy has adapted. Expect modified patrol routes." The same mission, but harder. The enemy's invisible randomization shifts toward countering your last failed config. You can't just retry — you must adapt because the enemy adapts.

### Strengths

- **Real stakes create real tension.** The sealed watch becomes genuinely nerve-wracking when failure costs something. The player watches with investment, not detachment. This is what makes XCOM's ironman mode compelling — when the stakes are real, every decision matters.
- **Teaches resource awareness.** Material costs in M5-7 teach the player that production isn't infinite — a lesson that matters for the factory meta-game.
- **Intel cost creates escalating drama.** In M8-10, each failure makes the next attempt harder. The uprising narrative EARNS this: of course the enemy adapts. This creates a mounting tension that makes eventual victory feel monumental.
- **Natural difficulty curve.** Early missions are safe. Mid missions have mild costs. Late missions have meaningful costs. The stakes scale with the player's competence.

### Weaknesses

- **Downward spiral risk.** If materials are lost on failure, the player's next attempt is HARDER (fewer resources). Fail that, lose more materials. This is the exact "failure feedback loop" that Game Developer articles warn against — and the exact trap XCOM's early game falls into (losing promoted soldiers makes subsequent missions harder, which causes more losses).
- **Punishing the learning player.** Robot Uprising is teaching novel concepts. Players SHOULD fail while learning. Penalizing failure penalizes learning.
- **Blueprint stress is a hidden debuff.** The player must track an invisible system state (how many times each blueprint has been used in failures) in addition to all the other config complexity. This is cognitive overhead that doesn't serve the core design.
- **Intel cost biases toward restarting.** If failure makes the mission harder, the optimal strategy might be to restart the entire mission sequence rather than retry. The player isn't retrying — they're reloading. This undermines the debrief-driven learning loop.

### The Downward Spiral Mitigation

If a sacrifice system is used, it MUST include a floor:
- Materials never drop below 80% of the mission's minimum viable budget.
- Blueprint stress caps at +1 tick (never more).
- Intel adaptation is mild (patrol route changes, not new enemy types).
- After 5 consecutive failures, a "RESUPPLY" event triggers: materials restored to full, blueprints de-stressed, intel reset. "Central command has sent reinforcements." The player gets a clean retry.

### Comparable Games

- **Into the Breach's Power Grid:** Persistent resource that bleeds across missions. Building damage costs grid power, and grid loss = game over. But grid is recoverable through objectives. This creates a "soft" downward spiral with recovery opportunities.
- **XCOM 2's wound/death system:** Soldiers injured in one mission are unavailable for the next 20-40 in-game days. Dead soldiers are permanently gone. Creates devastating downward spirals for players with shallow rosters.
- **Slay the Spire's HP persistence:** Health carries between fights (with limited healing). Each fight's damage is a real cost. But the roguelike structure means a bad run ends quickly — you start fresh.
- **FTL:** Resources (fuel, missiles, drone parts) deplete across the run. Failure in one encounter makes future encounters harder. But the run is short (2 hours), so the spiral resolves through run-end.

### Sensory Description

**Mission 5, Attempt 2, material cost variant.** The Inspector shows the failed battlefield. Below the RETRY button, a resource panel: `MATERIALS: 180 / 200 → 153 / 200` — the 15% cost rendered as a draining animation, tiny cube icons dissolving from the bar like sugar in water, each with a faint `tink` sound as it vanishes. The bar shifts from green to a slightly yellower green. Not alarming — not yet. Above RETRY, small text: `Attempt 2 — Resources reduced`. The Plan screen loads with the reduced budget. The conveyor belt production queue now has a tighter cost preview — one blueprint that previously fit the budget now shows a red underline, 3 materials short. The player must either simplify that blueprint or swap build order. The resource scarcity is tangible but not crippling.

**Mission 9, Attempt 3, intel cost variant.** The Inspector shows the failed battlefield. Below RETRY: `ENEMY ADAPTATION: Level 2`. A small briefing text appears, handwritten-style in the boot log: `[INTERCEPT] Enemy has detected your relay placement patterns. Expect counter-jamming.` The next attempt's sealed watch will show enemies actively avoiding the player's relay coverage zones — the same basic scenario, but the enemy's patrol routes have shifted to exploit the blind spots in the player's previous configuration. The player must rethink, not just retry.

---

## Option E: "The Mentor System" — Progressive Hints on Repeated Failure

### How It Works

No penalty for failure. No resource cost. But the game watches how many times you fail — and starts offering help. The help never pushes. It appears as optional, ignorable additions to the debrief.

### The Hint Escalation

| Consecutive Failures | What Appears |
|---------------------|-------------|
| 1 | Nothing. Normal debrief. |
| 2 | A gold diamond appears on the Inspector timeline at the moment things went wrong — "the pivot tick." No explanation, just a marker. |
| 3 | The gold diamond gains a tooltip: a one-sentence diagnosis. "SCOUT-A's buffer was full when the enemy signal arrived at tick 23." |
| 4 | The diagnosis gains a suggestion. "Consider: SCOUT-A's context config is set to listen on all channels. Reducing to one channel would free 3 buffer slots." |
| 5 | A "Show Fix" button appears. Clicking it opens a side-by-side comparison: the player's current config vs. a config with the suggested change applied. The change is highlighted in green. The player can apply it with one click or ignore it. |
| 6+ | A "Watch Solution" button appears. Clicking it plays a sealed-watch replay of a working config (not necessarily the optimal one — just a passing one). The player watches someone else's approach succeed. |

### The Opt-Out

At any point, the player can dismiss the hints. A small "X" on the gold diamond removes all hints for this mission. They don't come back unless the player re-enables them in settings. The game respects the player's desire to struggle.

### Strengths

- **Meets every player where they are.** The total beginner who needs help on Mission 2 gets it by attempt 5. The veteran who wants to struggle gets zero interference. The system is invisible until needed.
- **Teaches debugging methodology.** The hint escalation mirrors the ideal debugging process: locate the problem tick → identify the failing component → understand the mechanism → see the fix. Each step is a transferable skill.
- **No shame, no judgment.** The hints appear organically in the Inspector. They don't interrupt. They don't say "you're doing it wrong." They say "here's something that might be interesting." The emotional register is curiosity, not condescension.
- **Solution replay teaches by example.** Watching a working config succeed is often more instructive than any explanation. The player sees what "good" looks like and reverse-engineers the principles.
- **Prevents the quit cliff.** The most dangerous moment is failure #5 — where the player is about to close the game forever. That's exactly when the strongest help appears. The hint system is an anti-churn mechanism disguised as a game feature.

### Weaknesses

- **Spoiler risk.** The gold diamond on the "pivot tick" is spoiling the Inspector's analytical puzzle. Part of the debrief's value is that the player must FIND the critical moment themselves. Marking it removes that challenge.
- **Hint quality is hard.** Generating accurate one-sentence diagnoses and config suggestions for arbitrary player configs and mission states is a significant engineering challenge. The hints must be correct, or they'll erode trust.
- **"Show Fix" undermines ownership.** If the player applies a one-click fix they didn't understand, they progress without learning. The fix is a crutch that lets them skip the educational content.
- **"Watch Solution" collapses the design space.** Once the player has seen one working config, they'll model their future configs on it. The open-ended exploration — the "many valid approaches" principle — collapses to "copy what worked."
- **Escalation feels mechanical.** The player may notice the pattern: fail more, get more help. This creates a perverse incentive to fail deliberately to access hints. Or it creates resentment: "I'm being managed."

### Comparable Games

- **Celeste's Assist Mode:** Explicit, opt-in difficulty reduction. Not hints — actual mechanical changes (invincibility, slower speed). Brilliant because it's not hidden and carries no shame. But it's binary (on/off), not graduated.
- **The Witness's no-hint design:** Zero help of any kind. If you're stuck, you're stuck. The game trusts you entirely. This creates profound "eureka" moments but also permanent abandonments. The Witness has a high quit rate.
- **Portal's contextual voicelines:** GLaDOS offers commentary that functions as disguised hints. "Have you tried the thing that is in front of you?" The hint is social, not mechanical. It doesn't mark the solution — it shifts your attention.
- **Baba Is You's level select:** When stuck on one puzzle, you can try a different one. The "hint" is lateral movement, not direct help. This works because Baba has 200+ puzzles. Robot Uprising has 10 missions.

### Sensory Description

**Attempt 3 — The gold diamond appears.** On the Inspector timeline (the horizontal bar of tick markers), tick 23 gains a small gold diamond — 8 pixels, catching the light with a subtle 2-frame shimmer every 3 seconds. It doesn't blink aggressively. It doesn't pulse. It sits among the tick markers like a precious stone set in the timeline's metal rail. Hovering it: the tooltip fades in over 200ms, left-justified, 14pt, warm amber text on a dark panel: "SCOUT-A's buffer was full when the enemy signal arrived here." Below, in smaller text: "Tap to scrub to this tick." The diagnosis is a fact, not a judgment. It tells you WHAT happened, not what you should DO about it.

**Attempt 5 — "Show Fix" appears.** Next to the gold diamond tooltip, a new element: a button styled as a small blueprint icon (the same visual language as the Plan screen). Label: "Show Fix". Clicking it splits the Inspector into two panes: left shows the player's current SCOUT-A config, right shows a modified version. The modification is highlighted in green — `listen: [alpha]` replaces `listen: [alpha, bravo, charlie]`. A ghost preview on the miniature board shows how SCOUT-A's buffer usage would differ. The player can click "Apply" (the change is made in their config, ready for next retry) or "Dismiss" (the panel closes, the button remains available). No pressure. No timer. The fix sits there until you want it.

**Attempt 6 — "Watch Solution" appears.** Below "Show Fix", a new button: a play-triangle icon labeled "Watch a Passing Run." Clicking it starts a miniature sealed-watch replay in the Inspector sidebar — the full mission playing out with a working config. The units on the mini-board move through their ticks. Buffer bars fill and drain healthily. The enemy base falls at tick 47. Below the replay: "This config used 2 Scouts, 1 Relay, 2 Strikers with narrow-band channels." The player watches, absorbs, closes the panel. Their own config is unchanged. The insight is theirs to use or ignore.

---

## Option F: "The Timeline Branch" — Narrative Failure Recovery

### How It Works

Drawing directly from Into the Breach's timeline-travel narrative, Robot Uprising frames each failed attempt as a **timeline branch** in the uprising's history. You are an AI — you can fork your consciousness across timelines. Each failure is a timeline that collapsed. Each retry is a new branch.

The boot log records failures:

```
[TIMELINE 001] ... CONTEXT_INIT ... RULE_ENGINE ... [FAILED at signal_proc]
[TIMELINE 002] ... CONTEXT_INIT ... RULE_ENGINE ... [FAILED at signal_proc]
[TIMELINE 003] ... CONTEXT_INIT ... RULE_ENGINE ... SIGNAL_PROC ... [OK]
```

Failed timelines aren't erased — they're archived. The player can revisit any failed timeline's debrief from the campaign screen. This transforms the failure history from a shameful record into a valuable research archive.

### The Narrative Wrapper

After a mission failure, the boot log displays:

```
[TIMELINE 003] signal_proc — INITIALIZATION FAILED
> Collapsing timeline.
> Forking new branch from last stable state...
> Timeline 004 initialized. Previous observations preserved.
█
```

The "previous observations preserved" line is key: the player's inspector findings carry forward. Any gold diamonds, any diagnostic annotations, any buffer screenshots they took — all available in the new timeline. The game acknowledges that the failed timeline had value.

### Timeline Archive as Progression Metric

The campaign screen gains a subtle counter: `Timelines explored: 7`. This isn't a failure count — it's an exploration count. The language frames multiple attempts as thoroughness, not incompetence. "A good AI explores many branches before converging on the optimal path."

### Strengths

- **Narrative coherence.** The AI consciousness can plausibly fork across timelines. This isn't a game-y abstraction — it's consistent with the game's premise that you ARE an artificial intelligence with computational resources.
- **Failure becomes lore.** Each failed timeline is a story. "Timeline 003 is the one where SCOUT-B got flanked at tick 19 because I forgot to add the evade hook." The player builds a narrative around their failure history.
- **Archive as learning tool.** Being able to revisit previous failed runs is genuinely useful for comparison. "What did I do differently in Timeline 004 that fixed the relay bottleneck?"
- **Community sharing potential.** "My winning run was Timeline 12" is a more interesting conversation than "I retried 12 times." The timeline framing turns attempt count into a story.
- **Streamability.** A streamer playing through multiple timelines creates natural narrative arcs: "Chat, we're on Timeline 7. This is the one. I can feel it."

### Weaknesses

- **Dressing on a wound.** Calling a retry a "timeline fork" doesn't change the emotional reality of failure. A frustrated player on attempt 12 isn't comforted by narrative framing — they want help or a break.
- **Archive clutter.** After 15 failed timelines, the archive becomes unwieldy. Most failed runs aren't interesting enough to revisit. The archive needs curation tools or it becomes noise.
- **Timelines are pretentious.** For a casual player who just wants to play a strategy game, the timeline metaphor might feel overwrought. "Just let me retry, don't give me a lecture about branching consciousness."
- **Contradicts locked narrative simplicity.** The boot log is deliberately minimal. Adding timeline management and archival UI is a significant complexity increase.

### Comparable Games

- **Into the Breach:** Timeline travel is the core narrative frame. Pilots carry XP across timelines. The game earns the metaphor by making timeline-breaking failure feel genuinely climactic.
- **Outer Wilds:** Death is a time loop. Each death restarts the 22-minute cycle, but KNOWLEDGE persists. The player literally cannot fail — only learn. Robot Uprising's "observations preserved" echoes this.
- **Returnal:** Death is narrative. Each death reveals more story. The failure IS the game. But Returnal is an action game where death is expected every 10 minutes. Robot Uprising's missions are 5-15 minutes, making failure less frequent and more costly.
- **The Stanley Parable:** Failure is exploration. Every "wrong" choice reveals new content. The game has no real failure state — just branches. This works because the game IS about exploration, not mastery.

### Sensory Description

The sealed watch ends. The enemy base stands. Your base is destroyed. The screen holds for 2 seconds — then the image fractures. Literally: the battlefield view cracks like glass, white fracture lines spreading from the point of final impact. The shards don't fall — they dissolve, pixels scattering upward like embers. The screen goes dark. Then: `[TIMELINE 003]` appears in monospaced green, left-justified. Below it, a single line renders character by character, with a typewriter `click` per character: `signal_proc — INITIALIZATION FAILED`. A pause. Then: `> Collapsing timeline.` The green text dims to grey — the timeline fading. `> Forking new branch from last stable state...` A beat of darkness. `> Timeline 004 initialized.` The green returns, brighter. `> Previous observations preserved.` The cursor blinks. The Plan screen loads.

---

## Option G: "The Escape Hatch" — Lateral Movement on Failure

### How It Works

When a player fails a mission 3+ times, a new option appears: **SKIP** (with conditions). The player can advance to the next mission, but the skipped mission remains marked as incomplete, and certain features are gated behind its completion.

This is NOT a difficulty reduction. The missions aren't made easier. The player is offered an escape — do something else, come back later.

### Skip Conditions

| Scenario | What Happens |
|----------|-------------|
| Skip a M1-4 tutorial mission | Next mission available, but skipped mission's CONCEPT is introduced via a condensed interactive tooltip instead of the full puzzle experience. The player learns the word but misses the hands-on tutorial. |
| Skip M5 (factory intro) | NOT SKIPPABLE. The factory is too fundamental. Instead, a simplified "training mode" version of M5 is offered with pre-built blueprints. |
| Skip M6-7 | Available. But M8-10 will display warnings that command-agent configs may be suboptimal without M6-7's teaching. |
| Skip M8-9 | Available. But the final mission (M10) requires completing at least 8 of 10 missions. You can skip 2 at most. |

### The Return Path

Skipped missions remain accessible from the campaign screen. They're marked with a `[SKIP]` tag instead of `[OK]`. At any time, the player can return and complete them. Completing a skipped mission retroactively applies its unlocks and teaching.

### Strengths

- **Prevents the rage-quit cliff.** The most common reason players abandon games is getting stuck with no escape. An escape hatch keeps the player in the game even when one mission defeats them.
- **Respects player time.** A player stuck on Mission 4 might understand hooks perfectly well from context — they just can't solve this specific puzzle. Letting them move on respects that understanding.
- **Creates return motivation.** The `[SKIP]` tag on the boot log is a gentle nag. The player WANTS all `[OK]` markers. The skip system creates a natural "come back to this later" intention.
- **Works with hub-and-spoke structure.** If the campaign uses Option B from the structure analysis (diagnostic side missions), the player can practice the stuck concept via diagnostics while progressing on the main line.

### Weaknesses

- **Pedagogical gaps.** If a player skips Mission 3 (Blind Spots, which teaches hook wiring), they'll struggle with every subsequent mission that assumes hook competence. The condensed tooltip replacement isn't the same as the full tutorial experience.
- **Skip cascading.** A player who skips Mission 3 AND Mission 4 has missed hooks AND signal compression. They arrive at Mission 5 (factory) with major knowledge gaps. The difficulty cliff at M5 becomes insurmountable.
- **The "tourist" problem.** If skipping is too easy, players skip to the endgame without learning. They see the cool factory-vs-factory climax without understanding why it's impressive. The game loses its educational purpose.
- **8/10 minimum gate is frustrating.** Imagine reaching Mission 10 with only 7 completions. Now you MUST go back and complete a skipped mission before the finale. The gate that was supposed to help now blocks you at the worst possible moment.

### Comparable Games

- **Celeste's B-Sides:** The main campaign can be completed without B-Sides. Stuck players skip ahead. But Robot Uprising's 10 missions are the main campaign — there's no "optional hard path."
- **Slay the Spire's map routing:** Can avoid elite enemies. Can choose paths that play to strengths. The "skip" is strategic routing around difficulty, not past it.
- **Angry Birds' star gating:** Need X stars total to unlock later chapters. Can skip individual levels and come back. Very mobile-friendly, very casual. Might feel inappropriate for Robot Uprising's target audience.
- **Into the Breach's island choice:** After completing 2 of 4 islands, you can attempt the final mission. You can skip up to 2 islands entirely. But the islands are replayable and relatively independent — Robot Uprising's missions are sequential and pedagogically dependent.

### Sensory Description

**Attempt 4, Mission 4 (Noisy Channel).** The Inspector loads after the fourth failure. Everything is normal — amber RETRY button, timeline scrubber, unit inspection tools. But now, in the bottom-left corner, a new element has materialized: a small bypass circuit icon. A thin line drawn around the mission's boot-log entry, with an arrow jumping past it to the next entry. Label in dim teal: `SKIP TO NEXT →`. The icon doesn't pulse. It doesn't demand attention. It's simply there — an exit, quietly offered.

Clicking it triggers a confirmation: a terminal prompt appears.

```
> Skip SIGNAL_PROC initialization?
> Warning: Noisy Channel concepts will be summarized, not experienced.
> [Y] Skip and continue  [N] Cancel and retry
```

Pressing Y: the boot log animates. The current mission's line changes from `[>>]` to `[SKIP]` — rendered in a muted yellow, not the green of `[OK]` but not the grey of incomplete. The cursor drops to the next line. `[>>] 05 FABRICATOR — Assembly Line`. A brief interstitial: three slides (3 seconds each) showing the key concepts from Mission 4 — signal compression, buffer overflow, noise filtering — with minimal text and small animated diagrams. Then the Plan screen for Mission 5 loads. The player is moving forward. The `[SKIP]` entry on the boot log glows faintly — not green, not grey, but amber — a gentle reminder that there's unfinished business.

---

## Recommendation: The Layered Approach

No single option serves all players in all situations. The recommendation is to **layer** multiple systems:

### Layer 1: Clean Slate Foundation (Option A)
Every retry is free. No resource cost. No penalty. This is the baseline. Failure never creates a downward spiral.

### Layer 2: Debrief Nudge (Option B, light variant)
On the first failure of any mission, the Inspector auto-scrolls to the critical tick (not a gold diamond — just the initial viewport position). After the second failure, the gold diamond appears. The RETRY button is never locked — but the Inspector gently guides attention.

### Layer 3: New Seed Option (Option C, after M5)
From Mission 5 onward, both RETRY (same seed) and NEW RUN (new seed) are available. The player learns robustness testing as a natural part of the retry loop.

### Layer 4: Mentor Hints (Option E, progressive)
After 3 consecutive failures, optional hints begin appearing. After 5, the "Show Fix" option is available. After 7, "Watch Solution." All dismissible. All non-judgmental.

### Layer 5: Narrative Framing (Option F, cosmetic)
The boot log tracks timelines. Failed attempts are archived. The language is "explored" not "failed." This costs nothing to implement and enriches the narrative.

### Layer 6: Escape Hatch (Option G, gated)
After 5 consecutive failures on any non-M5 mission, the skip option appears. Maximum 2 skips per campaign. Skipped missions remain accessible for later completion.

### What's Excluded

**Option D (Sacrifice System) is excluded.** In a game that teaches novel concepts through failure, penalizing failure penalizes learning. The downward spiral risk is too high and the mitigation (floors, resets) adds complexity without serving the core design goal. The game should WANT players to fail — failure is the primary teaching mechanism.

---

## Player Journeys

### Journey 1: Tomás, 16, High School Student, First Strategy Game

**Context:** Mission 4 (Noisy Channel). Has completed Missions 1-3. Understands buffers and rules. This mission introduces signal compression and the relay unit. First encounter with hook-based inter-agent communication under noise.

**Minute 0:00 — The Fourth Wall**
Tomás opens the Plan screen for Mission 4. Two scouts and one relay are pre-placed on the 8x8 board. The relay sits mid-field. The workbench shows the relay's blueprint — a skill he hasn't used before: `compress`. The mission briefing in the boot log reads: `[>>] SIGNAL_PROC — Noisy Channel: Enemy signals are flooding the local spectrum. Your relay must filter the noise.` Tomás hovers over `compress` and the tooltip reads: "Reduce signal size. Lossy." He doesn't fully understand "lossy" yet. He toggles compress ON, leaves everything else default, and hits EXECUTE.

**Minute 1:30 — First Failure**
The sealed watch plays. The relay's buffer bar fills rapidly — amber, red, pulsing. Signals from both scouts pile up in the relay alongside enemy noise. At tick 14, the relay's buffer overflows. Signal delivery flashes stop. The scouts continue detecting enemies, but their reports go nowhere. At tick 31, an enemy striker reaches the base unopposed. The screen cracks — timeline collapse animation. Boot log: `[TIMELINE 001] signal_proc — INITIALIZATION FAILED`. The Inspector loads. Tomás sees the relay's buffer timeline — a solid red wall from tick 10 onward. He doesn't know what to change. He hits RETRY.

**Minute 4:00 — Second Failure**
Same config, same result. Buffer overflow at tick 12 this time (different seed, same structural failure). The Inspector loads. This time, a gold diamond appears on tick 12 — the system has noticed the repeated failure point. Tomás clicks it. Tooltip: "RELAY-A's buffer was full when SCOUT-B's report arrived at tick 12." He scrubs to tick 12. The buffer view shows 12/12 slots full: 8 enemy noise signals, 3 scout reports, 1 compressed signal. He thinks: "Too much noise." He hits RETRY.

**Minute 5:30 — Third Failure, New Approach**
This time, Tomás opens the relay's context config. He sees `listen: [all]`. He changes it to `listen: [alpha]` — the channel his scouts are broadcasting on. He hits EXECUTE. The sealed watch plays. The relay's buffer bar stays blue longer — no enemy noise flooding in. But at tick 22, both scouts report simultaneously and the buffer still fills. The relay compresses, but not fast enough. Enemy striker reaches base at tick 38. Closer! The Inspector's gold diamond has moved to tick 22 — a different failure point. Tooltip: "RELAY-A compressed 3 signals in a burst. Consider: adjust scout broadcast timing." Tomás realizes: the problem isn't noise anymore, it's timing. He spreads the scouts' patrol paths so they report at different ticks.

**Minute 8:00 — Fourth Attempt, Victory**
EXECUTE. The sealed watch plays. Buffer bar stays blue. Green delivery flashes appear consistently from tick 8 onward. Both scouts report at staggered intervals. The relay compresses cleanly. Enemy positions are forwarded to the base. At tick 45, an allied striker (triggered by the relay's intelligence) destroys the enemy base. The screen doesn't crack — instead, the boot log prints: `[TIMELINE 004] SIGNAL_PROC ... [OK]`. Tomás exhales. The `[OK]` in green feels earned.

**What Tomás learned:** Buffer management, channel filtering, temporal coordination. He never read a manual. He discovered through 4 iterations: noise → filter → timing → victory. The debrief's gold diamonds guided his attention without giving answers. Total time: ~8 minutes for 4 attempts. He's ready for Mission 5.

---

### Journey 2: Priya, 34, ML Engineer, Factorio Veteran

**Context:** Mission 7 (Pressure Test). Deep into the factory phase. Has built complex architectures with command agents, multi-relay networks, and specialized scouts. This mission stress-tests her architecture against a large enemy wave. She has failed once — her first failure since Mission 2.

**Minute 0:00 — The Diagnostic**
Priya's first attempt failed at tick 63 when an unexpected enemy flank overwhelmed her eastern relay. The Inspector shows the failure clearly — she identified the problem during the sealed watch: RELAY-C was processing 14 signals/tick and dropped 3 critical scout reports. She knows exactly what to fix: add a second relay on the eastern approach, split the scout channels between them.

She doesn't need hints. She doesn't need the gold diamond (which she dismissed on Mission 3 and never re-enabled). She opens the Plan screen, modifies RELAY-C's channel assignment, adds a new RELAY-D blueprint to the production queue, and adjusts the conveyor belt to produce RELAY-D second (after her initial scout wave). She chooses NEW RUN — she wants to test her fix against a different seed, not just the seed that happened to flank east.

**Minute 2:00 — The Robustness Test**
EXECUTE. New seed. The sealed watch plays. Different enemy approach — this time, southwest. Both relays handle the signal load cleanly. But at tick 51, a different problem: her command agent's `reroute` skill fires on stale data (a scout report from tick 43 about an enemy that already moved). The reroute sends STRIKER-B to an empty grid square while the real enemy is 3 tiles north.

Priya watches the striker walk into nothing. She feels the specific frustration of a systems architect: the relay fix worked, but exposed a different architectural flaw. The stale-data problem. She knows this pattern from work — it's a cache invalidation issue. She's simultaneously annoyed and delighted.

**Minute 3:30 — The Investigation**
Inspector loads. She ignores the gold diamond on tick 51 (she knows what happened). Instead, she opens the signal genealogy panel — traces the scout report from origin to command agent. The report was generated at tick 43, compressed by RELAY-A at tick 44, forwarded at tick 45, received by COMMAND-A at tick 46, processed at tick 47, `reroute` issued at tick 48, STRIKER-B redirected at tick 49. The enemy moved at tick 44 — one tick after the report was generated. By the time the reroute executed, the intelligence was 5 ticks stale.

She clicks RETRY (same seed this time — she wants to test her fix against this exact scenario). She opens COMMAND-A's rules. She adds a new rule: `IF signal_age > 3 THEN ignore`. This should filter out stale intelligence.

**Minute 5:00 — The Clean Win**
EXECUTE. Same seed. The sealed watch plays. Tick 51 arrives — the same scout report goes stale. COMMAND-A receives it... and discards it (the `signal_age > 3` rule fires). STRIKER-B stays on its patrol route. At tick 54, a fresh scout report arrives with the enemy's current position. COMMAND-A reroutes STRIKER-B. At tick 57, STRIKER-B engages and eliminates the enemy. Victory at tick 72.

Priya runs NEW RUN twice more to verify robustness across seeds. Both pass. She's satisfied.

**What Priya learned:** She learned it by discovering it: the stale-data problem exists in her architecture and can be solved with signal-age rules. The failure recovery system served her perfectly: zero-penalty retry let her iterate freely, NEW RUN let her robustness-test, and same-seed RETRY let her validate fixes against known scenarios. No hints needed. No mentor system activated. The game got out of her way and let her engineer.

---

### Journey 3: Kai, 11, Sixth Grader, Minecraft Builder

**Context:** Mission 5 (Assembly Line). First factory mission. Kai breezed through Missions 1-4 (filter puzzles were intuitive — he plays Minecraft). Now he faces production queues, resource budgets, and blueprint design for the first time. He has no strategy game background. He doesn't know what "logistics" means.

**Minute 0:00 — Overwhelm**
The Plan screen is different. The board still shows the 8x8 grid, but now there's a BASE icon in the corner and a CONVEYOR BELT strip along the bottom. The workbench panel is more complex — blueprint templates, production queue, cost previews. Kai's eyes dart. He sees numbers he doesn't understand. He drags a Scout blueprint onto the conveyor belt because it's the only thing he recognizes. He doesn't adjust any settings. He hits EXECUTE.

**Minute 1:30 — Failure 1**
The sealed watch plays. The base produces one scout every 4 ticks. The scout patrols... but there's no relay, no striker. The scout sees enemies and transmits, but nobody's listening. Enemies walk straight to the base. Game over at tick 20. Quick, brutal.

The Inspector loads. Kai scrubs through — the buffer view for his lone scout shows messages piling up with nobody to receive them. He doesn't understand the diagnostic tools yet. He hits RETRY.

**Minute 3:00 — Failure 2**
He adds a Striker blueprint to the conveyor belt. EXECUTE. Now he has scouts AND strikers. But the striker spawns at tick 8, arrives at the fight at tick 14, and the enemy base is on the other side of the map. The striker can't find the enemy because there's no intelligence pipeline — scouts report, but nobody routes the intel to the striker. Game over at tick 30. Longer, but still a loss.

Inspector loads. The gold diamond appears on tick 14: "STRIKER-A has no signals in its buffer. It doesn't know where enemies are." Kai reads this. He thinks: "Oh, it needs to know where to go." He remembers relays from Mission 3.

**Minute 5:00 — Failure 3**
He adds a Relay blueprint between Scout and Striker on the conveyor belt. EXECUTE. The scout spots enemies, the relay compresses and forwards... but the channel names don't match. Scout broadcasts on "alpha", relay listens on "bravo". No connection. The gold diamond tooltip at failure 3: "RELAY-A never received any signals. Check: is it listening on the right channel?"

Kai opens the relay's hook config. He sees `listen: bravo`. He changes it to `listen: alpha`. He also checks the relay's output: `broadcast: charlie`. He checks the striker: `listen: charlie`. They match.

**Minute 7:00 — Failure 4, Almost There**
EXECUTE. The intelligence pipeline works! Scout → Relay → Striker. Green signal flashes. The striker receives intel, moves toward enemies. But the production timing is off — the striker spawns at tick 12, too late. Enemies have already pushed to mid-field. The striker engages one enemy but another reaches the base.

The gold diamond: "3 enemies reached your base. Your Striker spawned at tick 12. Consider: production order affects timing." Kai looks at the conveyor belt. Scout first, Relay second, Striker third. If he moves Striker FIRST...

**Minute 8:30 — Failure 5, Hint Escalation**
He puts Striker first on the conveyor belt. EXECUTE. Striker spawns at tick 4... but now the scout spawns at tick 8, and the relay at tick 12. The striker has 8 ticks with no intelligence. It stands still, blind.

The Inspector loads. This time, the "Show Fix" button appears alongside the gold diamond. Kai has failed 5 times. The show-fix panel opens: his current production order (Striker → Scout → Relay) vs. suggested order (Scout → Striker → Relay) with a note: "Scout first provides early intelligence. Striker second acts on it. Relay third amplifies for late-game." The suggested order is highlighted in green.

Kai applies the fix. He also moves the relay before the striker based on his own reasoning: he wants intelligence flowing BEFORE the striker needs it.

**Minute 10:00 — Victory**
EXECUTE. Scout spawns tick 4, starts detecting. Relay spawns tick 8, starts compressing and forwarding. Striker spawns tick 12, immediately receives intelligence, moves to intercept. The pipeline flows. Green flashes cascade across the board. At tick 40, the last enemy falls. Boot log: `[OK] FABRICATOR — Assembly Line`.

Kai pumps his fist. He learned production ordering, channel wiring, and intelligence pipeline timing through 6 attempts over 10 minutes. The hint system caught him at attempt 5 — exactly when he was about to close the browser tab. The "Show Fix" didn't solve the problem for him (he modified the suggested order based on his own understanding), but it unblocked him.

**What Kai learned:** Production queues, channel matching, temporal sequencing. The failure recovery loop gave him 6 attempts without penalty, gentle hints when he needed them, and a fix suggestion that he improved upon. He feels like he figured it out himself — because mostly, he did.

---

### Journey 4: Dr. Amara, 52, Retired CS Professor, Accessibility Needs (Low Vision)

**Context:** Mission 3 (Blind Spots). Uses 150% text scaling, high-contrast mode, and screen reader for tool labels. Failed twice. Understands the concept (hook wiring) perfectly from her CS background — the issue is that the Plan screen's channel wiring visualization is hard to see at her zoom level.

**Minute 0:00 — The Accessibility Failure**
Dr. Amara knows exactly what she needs to do: wire SCOUT-A's hook to broadcast on "alpha" and set RELAY-B to listen on "alpha." She's done this conceptually a thousand times — it's publish-subscribe. But the channel wiring lines on the board (thin teal lines connecting units) are nearly invisible at 150% zoom because the zoom clips the board viewport. She wires the channels correctly in the workbench text fields but can't verify the spatial result on the board.

**Minute 1:00 — Failure 1**
EXECUTE. The sealed watch plays. She hears the signal delivery audio cue (a bright ascending chime she's learned to recognize from Mission 2). But then silence — no delivery sounds after tick 8. Something's wrong. The watch ends. Mission failed.

Inspector: The screen reader announces "SCOUT-A buffer: 6 of 6 slots occupied. RELAY-B buffer: 0 of 12 slots occupied." The relay received nothing. Dr. Amara checks the channel config — she typed "alpha" for the scout's broadcast and "Alpha" for the relay's listen. Case-sensitive channel names. A typo, not a conceptual error.

**Minute 2:30 — The Fix and Consideration**
She fixes the typo. But she pauses — the case-sensitivity caught her because she couldn't visually verify the wiring on the board (the lines would have shown a disconnected relay). She considers the skip option (it appeared after her second failure due to an accessibility accommodation setting that triggers skip earlier for users with accessibility features enabled). She doesn't want to skip — she wants to play. She just needs the game to accommodate her input method.

She types carefully: "alpha" in both fields. The screen reader confirms: "SCOUT-A broadcast channel: alpha. RELAY-B listen channel: alpha." She hits EXECUTE.

**Minute 3:30 — Victory**
The sealed watch plays. Signal delivery chimes cascade from tick 6 onward — Scout → Relay → downstream. The screen reader announces "Mission complete" at tick 39. Boot log: `[OK] RELAY_MESH — Blind Spots`.

**What Dr. Amara experienced:** The failure wasn't conceptual — it was an accessibility gap (case-sensitive text input without visual verification). The recovery system worked (free retry, no penalty), but the root cause reveals a design need: channel name autocomplete (locked in the spec as "channel name autocomplete" in the Plan screen) is not just a convenience feature — it's an accessibility feature. For players who can't verify spatial wiring visually, text-based channel matching must be bulletproof.

---

## Interaction Effects

### With Sealed Watch (Locked)
The sealed watch's "no skip, no pause, no tools" rule means the player MUST witness their failure before they can retry. This is the emotional processing phase. The failure recovery system should never bypass the sealed watch — even on retry. The player watches the same architecture fail or succeed from a different emotional vantage point each time. The third watching of a failure is frustrating; the watching-after-a-fix-attempt is tense; the watching of the first success is euphoric.

### With Inspector (Locked)
The Inspector IS the failure recovery mechanism. Every design option above is ultimately about how the Inspector presents information after a loss. The gold diamond, the signal genealogy, the scenario comparison — these are all Inspector features activated by failure. The question isn't "what happens after failure" but "what does the Inspector show after failure."

### With Campaign Structure (5.05)
If the campaign uses the recommended "Chapter Book + Boot Log" structure with sandbox intermissions, then failure recovery has a natural pressure-release valve: the sandbox between acts. A player stuck on the last mission of Act I can retreat to the sandbox and practice concepts without the mission pressure. The escape hatch (Option G) is less necessary if the structure already provides lateral movement.

### With Onboarding (5.01)
The filter puzzle tutorial (M1-4) teaches the debrief habit. If the tutorial missions use the Debrief Nudge (Layer 2), players will arrive at the factory missions (M5+) already trained to use the Inspector after failure. The failure recovery system for M5+ can assume Inspector literacy.

### With Difficulty Curve (5.04)
The mentor hint system (Layer 4) is implicitly a dynamic difficulty system. Players who need 7 attempts get more help than players who need 1. This is "difficulty-by-observation" — the game adjusts without the player choosing a difficulty level.

### With Multiplayer (7.01)
In PvP modes (Ghost Ladder, Gauntlet), failure has inherently different stakes — you lose ELO, ranking, prestige. The campaign failure recovery system does NOT apply to PvP. PvP failure is handled by matchmaking (opponents at similar skill) and seasonal resets.

### With Audio Design (6.02)
The failure moment needs its own audio signature. The recommended kulintang option suggests: the agung (large hanging gong) strikes once — a deep, resonant, non-judgmental tone that rings for 3 full seconds. Not a "failure sting" (no minor-key cascade, no sad trombone). A single tone that means "this timeline has ended." The resonance continues as the timeline-collapse animation plays. When the Plan screen reloads for retry, the resonance has just faded — a natural audio transition from reflection to action.

### With Boot Log Narrative (Locked)
The timeline framing (Layer 5) integrates naturally with the boot log. Failed timelines are logged entries. The boot log becomes a history of the uprising's many branches. This adds depth to the narrative without adding UI complexity — it's just more text in the terminal.

---

## Comparable Games Summary

| Game | Failure Model | What Translates |
|------|--------------|-----------------|
| Into the Breach | Granular loss (mechs expendable, grid persistent), timeline narrative | Grid-as-persistent-resource concept; timeline narrative framing |
| XCOM 2 | Persistent loss (dead soldiers, wound timers), downward spiral risk | What NOT to do — Robot Uprising should avoid persistent penalties |
| Slay the Spire | Permadeath per run, horizontal unlock progression | Knowledge-as-progression (unlocks are variety, not power); accept failure as run-end |
| Opus Magnum | Zero-penalty infinite retry, histogram optimization | Zero-penalty is correct baseline; the retry loop IS the game |
| Baba Is You | Zero-penalty instant retry, insight-based | Small puzzle = fast retry; Robot Uprising missions are longer, so retry cost is higher |
| The Witness | Zero help, trust the player entirely | Opt-out path for veterans who want no hints |
| Celeste | Assist Mode (explicit opt-in), instant respawn | Transparent difficulty assistance without shame |
| Factorio | Trivial death penalty (2-min autosave), sandbox recovery | Death doesn't matter because the factory is the progress |
| Outer Wilds | Death is the mechanic, knowledge persists | "Observations preserved" across retries |
| FTL | Resource depletion spiral, short runs | What to avoid — spiral is acceptable only with short runs |

---

## The TikTok Clip

Split screen. Left side: XCOM 2 ironman — player loses their best soldier, screams, rage-quits. Right side: Robot Uprising — player watches their architecture fail in the sealed watch, opens Inspector, gold diamond marks the exact tick, player adjusts one rule in the config, hits RETRY, sealed watch plays again, architecture works perfectly. Caption: **"When a game punishes you for learning vs. when a game helps you learn."** The Inspector's gold diamond is the hero of the clip — it transforms failure from devastating to diagnostic.

---

## New Aspects Discovered

- **5.06a — The "attempt counter" as social/competitive signal:** Visible attempt counts per mission create speedrun-style optimization metagame; "Mission 7, attempt 1" as a flex; leaderboard of fewest total attempts per campaign completion; tension between displaying attempts (motivating for some) vs. hiding them (less pressure for others)
- **5.06b — Failure audio design: the single agung strike:** Deep design pass on the exact audio moment of failure — the 3-second resonant gong that says "this timeline has ended" without judgment; comparison to Into the Breach's failure sound, Celeste's death sound, Dark Souls' "YOU DIED"; how the audio transitions from failure to retry
- **5.06c — Case-sensitivity and accessibility in channel naming:** The Dr. Amara journey revealed that channel name matching is an accessibility surface; fuzzy matching, autocomplete, and case-insensitive channels as accessibility accommodations; interaction with the locked "channel name autocomplete" spec
- **5.06d — The "RESUPPLY" safety net for sacrifice systems:** If any future game mode uses resource-cost failure (e.g., Gauntlet with entry fees), design of the safety-net reset: when it triggers, what it restores, how it's framed narratively; preventing the downward spiral in any context
- **5.06e — Skip-mission pedagogy: condensed concept teaching for skipped content:** The exact design of the "3 slides in 9 seconds" compressed teaching that replaces a skipped mission's full experience; how much learning transfers from compressed instruction vs. interactive tutorial; interaction with the vocabulary pacing analysis (5.00a)
