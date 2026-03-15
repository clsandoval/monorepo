# 2.00c — Hybrid Intelligence: Deterministic Core with Optional LLM Enhancement

## The Option

Robot Uprising ships with a **fully deterministic core** (identical to 2.00a) — same tick resolution, same rule stacks, same buffer model, same signal latency. Every mission, every campaign battle, every Gauntlet match runs on pure deterministic logic. No API key required. No internet connection required. The game works offline, forever.

But for players who *want* it, there's an optional **LLM Enhancement Layer** — a set of AI-powered features that augment the planning, debugging, and creative phases of the game without ever touching the deterministic execution model. The LLM never moves a unit. It never fires a hook. It never resolves combat. It reads the same state the player reads and offers *suggestions*, *explanations*, *what-if analyses*, and *natural language config authoring* — all of which the player must still translate into the four deterministic primitives (skills, rules, hooks, context config) before hitting EXECUTE.

**The core thesis: the LLM is a design assistant, not an execution engine.** It's Copilot for your robot army. It helps you think, not play.

### The Two-Tier Architecture

```
┌─────────────────────────────────────────────────────┐
│  EXECUTION LAYER (deterministic, always present)     │
│  ─────────────────────────────────────────────────   │
│  Tick scheduler → Rule evaluation → Hook delivery    │
│  → Buffer management → Combat resolution             │
│  → World state update                                │
│  Same inputs → same outputs. Always.                 │
└─────────────────────────────────────────────────────┘
         ↑ reads state        ↓ writes configs
┌─────────────────────────────────────────────────────┐
│  ENHANCEMENT LAYER (LLM-powered, opt-in)             │
│  ─────────────────────────────────────────────────   │
│  Natural language blueprint authoring                │
│  Post-battle debrief analysis & suggestions          │
│  "What if" scenario exploration                      │
│  Configuration explanation in plain English          │
│  Architecture review ("your scout can't see the      │
│    relay — they're 6 tiles apart, perception is 5")  │
│  Enemy behavior prediction                           │
│  Combo discovery hints                               │
└─────────────────────────────────────────────────────┘
```

The enhancement layer has **read access to game state** and **write access to the workbench editor** (via suggested edits the player must accept). It never bypasses the player's decision loop. It's a tool, not a co-pilot that takes the wheel.

### What the LLM Can Do (Six Enhancement Modules)

#### Module 1: Natural Language Blueprint Authoring ("Describe and Deploy")

The player types or speaks: *"I want a scout that patrols the eastern edge, reports enemies on the 'threat-east' channel, and runs away if anything gets within 2 tiles."*

The LLM generates a complete blueprint config:
- **Skills:** patrol (ON), evade (ON)
- **Rules:** (1) IF buffer contains ENEMY_SPOTTED AND distance ≤ 2 → EVADE; (2) IF buffer contains ENEMY_SPOTTED → FIRE hook on 'threat-east'; (3) DEFAULT → PATROL waypoints [E1, E4, E8]
- **Hooks:** ON_ENEMY_SPOTTED → channel 'threat-east', payload: location + unit type
- **Context config:** Listen: terrain, enemies. Ignore: allies. Buffer: 6 slots. Evict: oldest non-threat first.

The config appears in the workbench editor as a **proposed diff** — green highlights on new/changed fields, with an ACCEPT / EDIT / REJECT bar at the top. The player can accept wholesale, tweak individual fields, or reject and write it manually.

**Critical constraint:** The LLM can only generate configs that the deterministic engine can execute. It cannot invent new skills, new hook trigger types, or buffer models that don't exist. It's constrained to the same vocabulary the player uses manually. This is what makes it a *translation layer* rather than an *execution layer*.

#### Module 2: Post-Battle Debrief Analyst ("What Went Wrong")

After the sealed watch and manual inspector phase, the player can activate the LLM analyst. It reads the full tick log and generates a **narrative debrief**:

> *"Your RELAY-C was the bottleneck. It received 14 signals between ticks 8-12, but its 12-slot buffer was already 80% full from terrain data. By tick 10, it started evicting compressed intel reports — the exact reports your STRIKER-A needed to engage the enemy flanking from the west. STRIKER-A never received the 'strike-west' signal because RELAY-C's buffer was full of stale terrain. Consider: (1) shrinking RELAY-C's terrain listen window, (2) adding a 'priority: combat > terrain' eviction rule, or (3) splitting the relay into two — one for terrain, one for combat signals."*

This reads like a post-incident review. It doesn't tell the player the answer — it tells the player where to look and what trade-offs to consider.

#### Module 3: What-If Scenario Explorer ("Hypothetical Engine")

The player selects a configuration change in the workbench and asks: *"What would happen if I changed RELAY-C's eviction priority to newest-first instead of oldest-first?"*

The LLM doesn't simulate the battle (that's the deterministic engine's job). Instead, it **reasons about the structural implications**:

> *"With newest-first eviction, RELAY-C would keep its oldest data — terrain snapshots from tick 1 — and discard incoming combat signals during overload. This is the opposite of what you want in a fast-changing battlefield. Your scouts' real-time intel would be the first to go. Oldest-first (your current setting) keeps the freshest data, which is better for combat relay. But consider: if RELAY-C also serves as a terrain memory node for pathfinding, you might want a WEIGHTED eviction instead — 'evict oldest terrain, keep newest combat.'"*

#### Module 4: Configuration Explainer ("Explain Like I'm New")

The player clicks any config element and asks "why?" The LLM explains the current config in context:

> *Hovering over the 'evade' skill on SCOUT-B:* "SCOUT-B will flee when its top-priority rule fires an EVADE action. Right now, that happens when an enemy is within 2 tiles (Rule #1). Without evade, SCOUT-B would just stand there and get eliminated — scouts have no combat ability. The evade skill costs 1 energy/tick to keep enabled, so there's a production trade-off: every scout with evade costs slightly more than a 'disposable' scout without it."

#### Module 5: Architecture Reviewer ("Sanity Check")

Before hitting EXECUTE, the player can request an architecture review. The LLM scans all blueprints and channel wiring and flags issues:

> **⚠ Dead channel:** 'intel-north' has no listeners. SCOUT-A sends on it, but no unit listens.
> **⚠ Perception gap:** RELAY-C at position D4 can't receive signals from SCOUT-B at position H7 — they're 5 tiles apart, and relays have 0 perception range. They need to communicate via channel, not adjacency.
> **⚠ Buffer risk:** COMMAND-A listens on 4 channels with a 14-slot buffer. At current signal rates, it will overflow by tick 6. Consider adding a filter rule or reducing listen channels.
> **✓ Hook chain verified:** SCOUT-A → 'threat-east' → RELAY-C → 'compressed-threat' → STRIKER-A. Latency: 4 ticks.

#### Module 6: Enemy Behavior Predictor ("Intelligence Briefing")

For missions with visible enemy configs (later in the campaign), the LLM can analyze enemy blueprints and predict behavior:

> *"The enemy has two scouts on wide patrol with fast-trigger hooks. They'll detect your units within 2 ticks of deployment. Their relay at C5 compresses and forwards — expect enemy strikers to converge on your detected units by tick 8-10. Recommendation: deploy decoy scouts on the east flank to absorb their attention budget while your main force approaches from the west."*

### The Cost Model: Four Approaches

The hybrid model must answer: **who pays for the LLM calls?**

#### Approach A: "The Subscription Tier" (AI Dungeon Model)

Free players get the full deterministic game. $5-10/month unlocks the Enhancement Layer with a monthly token budget. Heavy users can buy additional tokens.

**Pros:** Predictable revenue. Clear value proposition. Players who don't want AI never see it.
**Cons:** Creates a two-tier community. "Pay-to-think" perception. Competitive integrity concerns in Gauntlet mode.

**AI Dungeon lesson:** Latitude learned that being too focused on monetization metrics "never brought AI Dungeon to what we wanted it to be." They ultimately pivoted to delivering player value first. Robot Uprising should internalize this — if the LLM features feel like a paywall rather than a bonus, they'll poison the community.

#### Approach B: "The Token Resource" (In-Game Currency)

LLM calls cost in-game "Compute Tokens" — a new resource earned through gameplay (completing missions, winning Gauntlet matches, tagging territory). Tokens are spent to activate any enhancement module. Players who earn more tokens can use more AI assistance.

**Pros:** No real-money barrier. LLM access becomes a game reward. Creates interesting resource management decisions. Aligns with the game's theme (you're an AI managing compute resources).
**Cons:** Tokens must be backed by actual API costs — someone still pays. If tokens are farmable, costs spiral. If tokens are scarce, enhancement layer feels inaccessible.

**The thematic resonance is strong:** Robot Uprising is about managing limited context buffers and attention budgets. Making LLM access itself a limited resource is *diegetic* — you're literally allocating compute to your own analytical capabilities as an AI commander.

#### Approach C: "BYOK — Bring Your Own Key" (Screeps Model)

Players enter their own API key (OpenAI, Anthropic, local Ollama endpoint). The game makes LLM calls on the player's behalf using their key. Zero cost to the developer.

**Pros:** No cost to studio. No token budgeting needed. Power users can use the best models. Local model users can run offline. No community resentment over paywalls.
**Cons:** Horrible onboarding ("go get an API key" is an immediate 90% dropout). Inconsistent experience (GPT-4 gives better suggestions than GPT-3.5-turbo). Competitive fairness nightmare (rich players use Claude Opus, free players use nothing). Support burden for N different model providers.

**The Screeps parallel:** Screeps doesn't integrate LLMs, but its community built bots (Overmind, KasamiBot, TooAngel) that represent different AI architecture philosophies. The game's ecosystem proves that **the programming IS the game** — external tools are welcome but optional. Robot Uprising could position the LLM layer similarly: it's a tool in your workshop, like an IDE extension, not a core mechanic.

#### Approach D: "The Local Model" (Offline-First)

Ship the game with a small, fine-tuned local model (3B-8B parameters) that runs on the player's hardware. No API calls, no internet, no cost. The model is trained specifically on Robot Uprising's vocabulary and config patterns. It won't match Claude Opus for debrief analysis quality, but it can handle config generation, basic architecture review, and simple explanations.

**Pros:** Works offline. Zero ongoing cost. Consistent experience. No fairness concerns. No privacy concerns.
**Cons:** Requires decent hardware (8GB+ VRAM for quality). Quality ceiling is lower. Model must be fine-tuned and maintained. Binary size increases significantly (~4-8GB for a quantized model). Some platforms (mobile, web demo) can't run it.

**Emerging possibility (2026):** WebGPU-accelerated local inference is maturing. A quantized 3B model running in the browser via WebGPU could power the enhancement layer for the web demo without any server infrastructure. This aligns with the locked tech stack (web-based, no backend).

### The Fairness Problem: "Pay-to-Think"

The deepest design question in the hybrid model isn't technical — it's **social**. If LLM-enhanced players get better at the game faster, is that fair?

#### The Argument For Fairness

The LLM doesn't play for you. It doesn't move units, fire hooks, or manage buffers. It offers *suggestions* — the player still has to understand them, evaluate them, and implement them through the deterministic workbench. A mediocre player with Claude Opus won't beat a skilled player without it, because the skilled player understands the system deeply enough to make better architectural decisions than any suggestion the LLM can offer.

This is analogous to chess: you can study openings with Stockfish at home, read strategy books, watch GM analysis videos — but when you sit down at the board, it's your brain against theirs. The preparation tools don't play for you. Robot Uprising's LLM layer is preparation tooling, not in-game assistance.

**Critical constraint for fairness: the LLM is ONLY available in the Plan screen and Inspector screen. It is NEVER available during sealed watch.** The sealed watch is sacred — pure observation, no tools. And in Gauntlet mode (competitive), LLM access could be:
- **Unrestricted:** Available during planning. Fair because both players can use it.
- **Disabled:** Competitive mode is pure skill. No LLM assistance.
- **Transparent:** LLM usage is flagged on the player's profile ("LLM-assisted" badge). Separate leaderboards for assisted and unassisted play.

#### The Argument Against Fairness

The enhancement layer doesn't just give information — it gives *structured analysis*. A debrief that says "RELAY-C was the bottleneck" saves the player 10 minutes of manual inspector work. Over hundreds of sessions, LLM-assisted players develop faster intuition because the LLM accelerates their learning feedback loop.

This is the same argument against pay-to-win: even if the advantage is "just convenience," convenience compounds. Players who can afford better tools learn faster, climb faster, and dominate communities faster.

**AI Dungeon's lesson applies here:** the #1 complaint was that AI "forgot" things, but the real issue was that context management was opaque. When Latitude added the context inspector — letting players see what the AI remembered — satisfaction jumped. The key isn't giving players better AI. It's giving players **better visibility into the system.** Robot Uprising already has this with the Inspector screen. The LLM enhancement layer should *augment* the inspector, not replace it.

### The Learning Paradox

The most surprising risk of the hybrid model: **the LLM might teach too well.**

Robot Uprising's core magic is the gap between "I understand every piece" and "I didn't predict the whole." The player designs agents, watches them fail in unexpected ways, and learns by debugging. The journey from confusion to understanding IS the game.

If the LLM tells you exactly what went wrong and exactly how to fix it, that journey collapses. You never develop the deep intuition that makes the game sticky. You never have the 2am "oh THAT'S why it failed" epiphany because the LLM gave you the answer at 10pm.

**The Zachtronics precedent:** Zach Barth has spoken about why Zachtronics games don't have built-in solution guides. The struggle IS the product. Shortcutting the struggle shortcuts the satisfaction.

**Mitigation: The Socratic Module.** Instead of giving answers, the LLM asks questions:

> Instead of: *"RELAY-C was the bottleneck. Shrink its terrain listen window."*
> Socratic: *"Look at RELAY-C's buffer between ticks 8-12. What's filling it up? Is all of that information still relevant by tick 12?"*

The Socratic mode points the player toward the right part of the system and lets them discover the answer themselves. It's the difference between a teacher who gives answers and a teacher who asks the right questions.

### Mechanical Specification: Integration Points

#### Plan Screen Integration

- **"Ask AI" button** in the workbench toolbar (sparkle icon, subtle). Disabled if LLM not configured.
- **Natural language input bar** at the bottom of the workbench panel. Type a description → receive a proposed config diff.
- **Architecture review button** next to the EXECUTE button. One-click sanity check before deployment.
- **Inline "explain" tooltips** on every config field (? icon). Click → contextual explanation.

**Visual treatment:** All LLM-generated content is rendered in a distinct style — slightly different background color (soft indigo tint), italic text, with a small sparkle icon watermark. The player always knows what came from the AI vs. what they wrote themselves. This is non-negotiable for trust and learning.

#### Inspector Screen Integration

- **"Analyze" button** in the debrief sidebar. Generates narrative debrief after manual exploration.
- **"What if" input** in the timeline scrubber. Select a tick, ask a hypothetical.
- **Signal trace narrator** — click a signal path, get a natural-language story of what happened.

**Visual treatment:** Same indigo-tint + sparkle watermark. LLM analysis appears in a collapsible panel so it doesn't overwhelm the player's own analysis space.

#### What the LLM CANNOT Access

- **Sealed watch screen.** Zero LLM interaction during execution. The emotional beat is sacred.
- **Production queue.** The LLM can suggest blueprints but cannot modify build order. Resource allocation is a human decision.
- **Opponent configs in Gauntlet.** The LLM cannot analyze the opponent's blueprints during competitive play (it can analyze known enemy configs in campaign missions).

### Interaction Effects

**With 2.00a (Fully Deterministic):** The hybrid model is a strict superset — it adds optional features on top of the deterministic core without changing any mechanical rules. If the LLM server goes down, the game is unaffected. This is the strongest architectural property of the hybrid approach: degradation is graceful and total.

**With 2.00b (Simulated Intelligence):** The personality layer (callsigns, micro-animations, personality archetypes) combines beautifully with LLM debrief narration. The LLM can reference agents by callsign ("Kestrel was overwhelmed") and the personality layer makes those references feel like discussing team members rather than debugging variables.

**With 5.xx (Onboarding):** The LLM could serve as the Ghost Mentor (5.03e) — the adaptive AI companion that speaks in contextual observations. But this creates dependency: if the best onboarding experience requires the LLM, free players get a worse tutorial. The onboarding must be excellent WITHOUT the LLM, with the LLM being a bonus layer for players who want more hand-holding or deeper explanation.

**With 7.xx (Multiplayer/Competitive):** The fairness question becomes acute. Three competitive integrity models: (1) LLM unrestricted (both players have access), (2) LLM banned in ranked play, (3) separate leaderboards. Model (3) is most likely viable — it's the "engine-assisted" vs. "correspondence" distinction in chess.

**With 4.xx (UI/UX):** The workbench must accommodate LLM UI elements without cluttering the base experience. Progressive disclosure: LLM features are hidden until enabled in settings. No "upgrade to unlock" prompts in the UI — this isn't a mobile game.

### Comparable Games and Systems

| Game/System | What It Does | What Robot Uprising Can Learn |
|-------------|-------------|-------------------------------|
| **AI Dungeon** | LLM as core mechanic. Tiered subscription for context window size. | The cost model lesson: over-monetizing AI access poisons the community. Also: the context inspector (showing players what the AI "remembers") was more impactful than the AI itself. |
| **GitHub Copilot** | AI code completion in the IDE. Suggests, human accepts/rejects. | The interaction model: suggested diffs with accept/reject. The LLM writes; the human decides. Also: Copilot doesn't run the code — same boundary as Robot Uprising's LLM not running the simulation. |
| **Chess.com Analysis** | Post-game engine analysis (Stockfish) as premium feature. | The debrief model: play the game with your brain, analyze afterward with the engine. Free players get limited analysis; premium get full depth. Community accepts this because analysis is clearly post-hoc, not in-game. |
| **Factorio** | No AI assistance, but a rich modding ecosystem. Players build external tools (calculators, planners) that help with design but don't modify execution. | The external tool model: the best Factorio players use external calculators and blueprint libraries. The game doesn't integrate these — they're community tools. Robot Uprising could position the LLM as an "official external tool" that happens to be built in. |
| **Inworld AI / Convai** | AI NPC dialogue platforms for game developers. | The middleware model: standardized APIs for LLM integration. Robot Uprising could build its enhancement layer as a middleware layer that supports multiple providers (OpenAI, Anthropic, local Ollama). |
| **Screeps Overmind** | Community-built AI bot with automatic, semi-automatic, and manual modes. | The autonomy spectrum: Overmind proves players want to choose their level of AI assistance. Some want full manual control; some want the AI to handle tedious parts. The hybrid model should offer the same spectrum. |

### Sensory Description

**The "Ask AI" moment:** You're staring at a blank blueprint in the workbench. The 8x8 board on the left shows ghost outlines where your units will deploy. You click the sparkle icon in the toolbar — a soft indigo glow expands from the button, and a text input field slides down from the top of the workbench panel with a gentle *whoosh* and a faint electronic hum, like a subsystem powering up. The cursor blinks in the field. You type: "aggressive scout that reports everything it sees." As you type, the workbench panel subtly shifts — the background behind the config fields takes on a barely-perceptible indigo tint, signaling the AI is active. You hit Enter.

**The suggestion arrives:** A shimmer animation ripples down the config panel — each field that the AI wants to modify glows briefly with an indigo pulse, then reveals the proposed value. Green highlight on new entries, amber on modifications. At the top of the panel, an ACCEPT ALL / REVIEW EACH / REJECT bar appears with a soft *ding* — a single note on a kulintang, the same instrument used throughout the UI. Below the bar, a small italic line reads: *"Configured for maximum awareness. Consider: high hook frequency = high EM noise. Enemies will detect this scout quickly."* The warning text pulses amber once, then settles.

**Accepting the suggestion:** You click ACCEPT ALL. The indigo tint fades to the normal workbench background. The config fields snap to their new values with a satisfying *click-click-click* staccato — each field locking in like a physical switch being thrown. On the board, the ghost unit updates: its perception cone widens, hook wiring lines appear connecting it to the 'intel-feed' channel, and a faint amber glow around the unit signals high EM emission. You're back in control. The AI is gone. The config is yours now.

**The debrief analysis:** After a rough battle, you're in the Inspector. You've scrubbed through the timeline, but you can't figure out why STRIKER-A never engaged. You click ANALYZE in the sidebar. The panel darkens slightly — a processing spinner appears, styled as a rotating buffer ring (the same circular buffer visualization used for unit context). Three seconds later, text flows in like a terminal printout, character by character, in slightly smaller italic monospace:

> *"STRIKER-A received zero signals on 'strike-west' between ticks 4-18. Tracing upstream: RELAY-C was supposed to forward compressed intel from SCOUT-A on this channel. RELAY-C received 8 raw signals from SCOUT-A, but its buffer was full by tick 6 — terrain data from ticks 1-3 occupied 9 of 12 slots because terrain is set as high-priority in eviction rules. RELAY-C evicted the combat signals instead of the terrain data. The fix is in RELAY-C's eviction config: combat signals need higher retention priority than terrain."*

Each entity name (STRIKER-A, RELAY-C, SCOUT-A) is colored in the unit's assigned color and is clickable — tapping jumps the inspector to that unit at the relevant tick. The channel name 'strike-west' is rendered as a wiring diagram glyph. The whole analysis sits in an indigo-tinted panel that can be collapsed with a single tap, returning to the raw inspector view.

---

## Player Journeys

### Journey: Sofia, 29, Backend Engineer (First LLM encounter)

**Context:** Mission 5 (factory just introduced). Sofia has played Missions 1-4 without LLM features. She enabled the Enhancement Layer in settings after reading about it in the boot terminal's "Subsystem Manifest" entry. She uses a Claude API key she already has from work.

**Minute 0:00 — The Blank Factory**
Sofia stares at the Plan screen. The board shows her base at A1, enemy base at H8, and four resource nodes scattered across the grid. The workbench is empty — no blueprints configured. The production queue conveyor belt at the bottom is blank. She needs to design an entire army from scratch for the first time. Previous missions had pre-placed units.

She clicks the sparkle icon. The indigo input bar slides down. She types: *"I need a basic army — a couple scouts to find enemies, a relay to coordinate, and a striker to kill things."*

**Minute 0:30 — The First Suggestion**
Three blueprint cards appear in the workbench, each with indigo-tinted config. SCOUT-A: patrol wide arc, report on 'intel', evade when threatened. RELAY-B: listen to 'intel', compress, forward on 'strike-orders'. STRIKER-C: listen to 'strike-orders', engage nearest target.

Sofia reads each config. She doesn't understand why RELAY-B has "compress" enabled. She clicks the "?" tooltip next to the compress skill. An italic explanation appears: *"Compress shrinks two signal entries into one, freeing buffer space. Without it, RELAY-B's 12-slot buffer will fill in 6 ticks if both scouts report frequently."*

"Oh," she says. "It's like a message queue with deduplication." The professional analogy clicks instantly. She accepts the three blueprints and drags them into the production queue.

**Minute 1:30 — The Sanity Check**
Before hitting EXECUTE, Sofia clicks the architecture review button. A list appears:

> **⚠ Single relay:** If RELAY-B is eliminated, your scouts and strikers lose coordination entirely. Consider a backup relay or direct scout→striker hooks.
> **✓ Channel chain verified:** SCOUT-A → 'intel' → RELAY-B → 'strike-orders' → STRIKER-C. Latency: 4 ticks.
> **⚠ No evade on STRIKER-C.** If the striker encounters multiple enemies simultaneously, it cannot retreat. One-shot-one-kill means this is fatal.

Sofia considers the warnings. She decides to accept the single-relay risk ("I'll learn from it if it fails") but adds an evade skill to the striker. She modifies the config manually — no LLM needed for that small change. She hits EXECUTE.

**Minute 3:00 — Sealed Watch**
The battle plays out. No LLM available. Sofia watches RELAY-B get flanked by an enemy scout that snuck through the south. Her intel pipeline collapses. STRIKER-C stands idle because it stopped receiving orders. Her army falls apart.

**Minute 5:00 — The Debrief**
In the Inspector, Sofia scrubs to tick 12 where RELAY-B was eliminated. She sees the enemy scout's approach path. She clicks ANALYZE.

The LLM narrative appears: *"RELAY-B was eliminated at tick 12 by ENEMY-SCOUT-2 approaching from the south. Your scout perception covered the north and east but left a blind spot at tiles B3-D3. RELAY-B had no self-protection — stationary, no evade, no hooks triggering on proximity threat. Two options: (1) adjust SCOUT-A's patrol to cover the southern approach, or (2) add a hook on RELAY-B: ON_ENEMY_PROXIMITY → fire 'relay-under-attack' → listened by STRIKER-C."*

Sofia reads this and immediately opens the workbench. She doesn't use the LLM to implement the fix — she drags a new hook onto RELAY-B's config: ON_ENEMY_SPOTTED → channel 'mayday'. Then she adds a rule to STRIKER-C: IF buffer contains 'mayday' → MOVE toward RELAY-B position. She figured out the implementation herself; the LLM just pointed her at the right problem.

**Minute 7:00 — The Aha**
She hits EXECUTE again. This time, when the enemy scout approaches from the south, RELAY-B fires the 'mayday' hook. STRIKER-C pivots from its patrol and intercepts the enemy scout two tiles from RELAY-B. The relay survives. The intel chain stays alive. The army functions.

Sofia didn't need the LLM to build the fix. She needed it to identify the failure point in a complex system. That's the hybrid model working exactly as intended: the machine helps you see; you decide what to do about it.

**UI Annotations:**
- Sparkle icon: Top-right of workbench toolbar, 24x24px, subtle animation (slow rotate) when LLM is configured. No animation when unconfigured.
- Indigo tint: Background-color shift from workbench-grey (#1a1a2e) to workbench-indigo (#1a1a3e). Subtle enough to register subconsciously.
- "?" tooltips: 16x16px circle with question mark, right-aligned on each config field. Appear only when Enhancement Layer is enabled.

---

### Journey: Marcus, 45, Product Manager, No Programming Background

**Context:** Mission 3 (learning hooks). Marcus has never played a strategy game. He enabled the Enhancement Layer during initial setup because the boot log mentioned it: *"SUBSYSTEM: ADVISORY CORTEX... status: AVAILABLE. This subsystem provides analytical support for your command decisions."* He's using the free tier (5 AI queries per mission).

**Minute 0:00 — Overwhelmed**
The workbench shows a pre-placed scout and relay. Marcus needs to wire a hook so the scout tells the relay when it spots an enemy. He understands the concept ("the scout should radio the relay") but the config panel is intimidating: trigger dropdown, channel name field, payload options, listen/ignore toggles.

He clicks the sparkle icon and types: *"How do I make the scout tell the relay when it sees an enemy?"*

**Minute 0:20 — The Socratic Response**
The LLM doesn't just fill in the config. It's in Socratic mode (the default for Missions 1-4):

> *"Good instinct — you want the scout to communicate. Look at the scout's config panel. Under 'Hooks', there's an empty slot. The trigger dropdown lists events the scout can react to. Which event sounds like 'seeing an enemy'?"*

Marcus scans the dropdown: ON_TICK, ON_ENEMY_SPOTTED, ON_BUFFER_FULL, ON_DAMAGE, ON_ALLY_ELIMINATED. He selects ON_ENEMY_SPOTTED.

> *"That's the one. Now it needs a channel name — think of it like a radio frequency. Type any name. The relay will tune to this same channel to listen."*

Marcus types 'enemy-alert'. On the board, a dotted line appears from the scout to the relay, labeled 'enemy-alert'. The relay's config panel blinks softly — a prompt to add 'enemy-alert' to its Listen list.

**Minute 1:00 — The Connection Moment**
Marcus clicks on the relay and sees the Listen toggle for 'enemy-alert' is off. He turns it on. The dotted line on the board becomes solid. A soft confirmation chime plays. The channel is live.

He used one of his 5 AI queries to get the Socratic nudge, but he configured everything himself. The LLM never touched the config — it just asked the right questions to guide him to the right fields.

**Minute 2:00 — Testing Understanding**
For the next hook (relay forwarding to striker), Marcus doesn't use the AI. He knows the pattern now: event → channel → listener. He wires it himself in 30 seconds.

**UI Annotations:**
- Query counter: Small "4 remaining" text below the sparkle icon after each use. Amber when ≤2 remaining. No counter in paid tier.
- Socratic responses: Same indigo tint, but formatted as questions (bold question marks, lighter italic). Visually distinct from direct suggestions.

---

### Journey: Zara, 24, Competitive Gauntlet Player, LLM Disabled

**Context:** Gauntlet Season 3 finals. Zara has been playing for 6 months with LLM features disabled by choice. She's ranked #47 globally. She considers LLM assistance "training wheels."

**Minute 0:00 — The Config Sprint**
Zara opens the Plan screen. Her opponent's last three matches are visible (public replays). She has 3 minutes of planning time before the simultaneous EXECUTE. No LLM. No sparkle icon. The workbench is her raw tool.

She speed-configures: three blueprints in 90 seconds, production queue optimized for a tick-8 first strike, hooks wired on channels she's used for months ('alpha-net', 'bravo-kill', 'overwatch'). Her fingers move through the config panel like a pianist — she doesn't read the fields anymore, she knows them by position.

**Minute 1:30 — The Manual Review**
Where an LLM-assisted player would click "Architecture Review," Zara does it visually. She hovers over each unit's ghost on the board, reading perception cones and channel wiring lines. She spots a gap: her northern scout's patrol arc doesn't overlap with the relay's listen range for two ticks out of eight. She adjusts the patrol waypoints manually, watching the ghost prediction update in real-time.

**Minute 3:00 — EXECUTE**
She hits EXECUTE. The sealed watch plays. She watches with the focus of a chess player watching a clock — reading buffer bars on each unit, tracking signal delivery flashes, mentally counting ticks until her strike chain activates.

**Minute 5:00 — The Debrief Gap**
After winning 2-1, Zara opens the Inspector. No LLM analysis. She scrubs through the losing game manually, clicking unit after unit, reading buffer states, tracing signal paths. It takes her 8 minutes to find the failure point (her relay's buffer eviction priority was wrong for that specific opponent layout). An LLM-assisted player would have found it in 30 seconds.

But Zara found something the LLM wouldn't have flagged: a subtle timing window where her scout's hook fires 1 tick before the relay's buffer has room, causing a 2-tick delay cascade. This micro-optimization — invisible to the debrief analyst — is worth 3% more wins against fast-aggro opponents. The deep manual analysis gave her an insight the LLM abstraction layer would have smoothed over.

**The competitive thesis:** At the highest skill levels, the LLM becomes a *ceiling*, not a floor. It gives good-enough answers that prevent the player from discovering great answers through deep manual investigation. The best players will reject it — not because they can't afford it, but because it makes them worse.

**UI Annotations:**
- When LLM is disabled: sparkle icon absent entirely (not greyed out — absent). No "you could enable..." prompts. The workbench is clean.
- Gauntlet mode: Optional "LLM-assisted" tag on player profiles. Separate stat tracking. Not separate leaderboards by default — community can vote on this.

---

### Journey: Kai, 11, Minecraft Builder, Curious About AI

**Context:** Mission 2. Kai's parents set up the game with the free Enhancement Layer (5 queries per mission, no API key — uses a bundled lightweight model). Kai doesn't know what an LLM is. He just sees a sparkle button.

**Minute 0:00 — The Magic Button**
Kai clicks the sparkle icon because it sparkles. The input bar appears. He types: *"make the scout go to the enemy"*

**Minute 0:10 — Translation**
The LLM translates his natural language into config: patrol waypoint set to enemy base coordinates, no hooks, no evade. It generates a simple but incomplete config — deliberately imperfect, because Socratic mode for Missions 1-4 doesn't solve the puzzle for you.

A note appears: *"This scout will walk straight toward the enemy base. But it doesn't know how to avoid enemies along the way, and it won't tell your other units what it finds. Want to add those?"*

Kai reads "won't tell your other units." He thinks about Minecraft — he uses signs and redstone lamps to signal his friends in multiplayer. "Yeah, I want it to tell them."

**Minute 0:30 — The Redstone Analogy**
Kai types: *"yeah make it tell the other robots when it sees bad guys"*

> *"Got it. I added a hook: when the scout sees an enemy, it sends a signal on a channel called 'danger'. Your other units can listen on 'danger' to know when enemies are nearby. It's like a redstone wire — the scout is the lever, 'danger' is the wire, and your other units are the pistons that react."*

The redstone analogy isn't hardcoded — the LLM detected "robots" and the conversational style of a young player and adapted its explanation. (If the game ships with a fine-tuned local model, this calibration would be trained in; with a general API model, it would come from the system prompt.)

Kai gets it immediately. Levers, wires, pistons. He accepts the config and watches the sealed phase with wide eyes.

**UI Annotations:**
- Free tier queries: Powered by bundled local model (if hardware supports) or rate-limited cloud API with no account required.
- Natural language input: Accepts casual/incomplete sentences. No syntax requirements.
- Adaptive tone: LLM response vocabulary adjusts based on conversation history within the session.

---

## Strengths

1. **Graceful degradation.** LLM goes down? Game works perfectly. Player offline? Game works perfectly. This is the strongest architectural property — no single point of failure.

2. **Broadens accessibility WITHOUT dumbing down.** Non-programmers can use natural language to get started; veterans can ignore the LLM entirely. The skill ceiling is unaffected. The skill floor drops significantly.

3. **Thematic coherence.** You're an AI managing other AIs. Having an analytical subsystem that helps you think is diegetic — it fits the fiction perfectly. The "Advisory Cortex" subsystem reads like another module in your own boot log.

4. **Revenue potential without toxicity.** If positioned correctly (Chess.com analysis model, not mobile game paywall model), the subscription tier funds ongoing development without creating a pay-to-win stigma.

5. **Learning acceleration with Socratic guardrails.** The LLM can point players at the right part of the problem without solving it. This is better than no help (frustration quit) AND better than full help (spoiled discovery).

## Weaknesses

1. **The two-tier community risk.** Even with careful positioning, "LLM-assisted" vs. "unassisted" creates an identity split. Chess handles this with "engine analysis is for learning, not for playing." Robot Uprising needs the same cultural framing, and cultural framing is notoriously hard to control.

2. **Quality consistency.** If players use different LLM providers (BYOK model) or if the bundled model is weaker than cloud models, the experience diverges. A player who gets bad advice from a weak model might conclude the feature is useless and disable it forever.

3. **The learning paradox (crutch risk).** Players who lean on the LLM for every debrief never develop deep system intuition. The Socratic mode mitigates this, but some players will find ways to extract direct answers ("just tell me what to change"). The game can't prevent this without feeling adversarial.

4. **Development and maintenance cost.** The enhancement layer requires ongoing prompt engineering, model fine-tuning (for local model), API cost management, and testing across multiple LLM providers. This is a significant engineering and operational burden for an indie game studio.

5. **Latency.** Cloud LLM calls take 2-5 seconds. During the planning phase, this is acceptable. But if a player clicks "Analyze" in the Inspector expecting instant response and gets a 3-second spinner, it breaks flow. Local models are faster but lower quality.

## New Aspects Discovered

- **2.00c-i — The Socratic calibration curve:** How should the LLM's directness scale across the 10-mission campaign? Missions 1-4: pure questions, never answers. Missions 5-7: questions + one structural hint. Missions 8-10: direct analysis available. Gauntlet: full analysis. The curve should match the player's growing expertise — scaffolding that removes itself.

- **2.00c-ii — LLM-as-opponent-coach:** Instead of the enhancement layer helping the player, what if the LLM coaches the ENEMY? An "adversarial AI" that designs enemy configs to specifically counter the player's architecture. The player fights deterministic enemies, but the enemy *designer* is an LLM that studies the player's patterns. This flips the hybrid model — the LLM is the opponent, not the assistant.

- **2.00c-iii — Replay narration as spectator feature:** The LLM narrates replays in real-time like a sports commentator. "Kestrel just spotted the enemy flanking from the south — but look at RELAY-C's buffer, it's already full! This signal is going to get dropped! The whole west defense depends on..." Streamers and content creators would love this. It makes replays watchable for non-players.

- **2.00c-iv — Config diff explanation:** When comparing two config versions (before and after a change), the LLM explains the *behavioral implications* of the diff. "You widened SCOUT-A's patrol from 4 tiles to 6 tiles. This means it takes 2 more ticks to complete a patrol cycle, but covers 50% more area. The trade-off: enemies in the narrow zone will be detected 2 ticks later than before." This is the "git diff but for robot behavior" — a tool that translates structural changes into behavioral predictions.

- **2.00c-v — Community knowledge distillation:** The LLM has access to aggregated (anonymized) community strategy data — popular blueprints, common failure patterns, meta shifts. When a player asks for advice, the LLM can say "72% of players in missions 5-7 use a dual-relay setup for this map layout." This turns the LLM into a community wisdom aggregator, not just a rules engine. Privacy and competitive integrity implications are significant.
