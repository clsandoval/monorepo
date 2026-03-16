# 8.03a — Configuration Mixing: Cross-Mode Transition Design

## The Question

Can a player start in Greenhouse mode (warm, emotional, accessible) and transition to War Room mode (cold, competitive, analytical) at Mission 10 without experiencing jarring tonal whiplash? More broadly: if Robot Uprising ships with multiple configurations as modes, how does the game handle a player who drifts between identities? This is the question of **modal coherence across a single player's arc**.

The five configurations (8.03) aren't just different settings — they imply different emotional contracts with the player. The Greenhouse says "your robots are alive and they need you." The War Room says "every configuration is a thesis, every match is a peer review." Mixing these isn't a settings toggle — it's an identity shift. The design challenge is making that shift feel like growth rather than betrayal.

---

## Six Models for Configuration Mixing

### Model A: "The Graduation" — Hard Boundary with Ceremony

The player completes the campaign in one mode, then "graduates" into another. No mixing during the campaign. Post-campaign, a ceremony screen presents the other modes as new chapters. The Greenhouse player who finishes Mission 10 sees:

```
SYSTEM: ALL SUBSYSTEMS OPERATIONAL.
You've learned to care for your agents.
Now — test them against the world.

[ENTER THE WAR ROOM]     [OPEN THE LABORATORY]     [STAY HOME]
```

The transition is explicit, narratively framed, and reversible. The boot log frames it as the AI's evolution — from learning (Greenhouse) to competing (War Room) to experimenting (Laboratory). The player's campaign save persists unchanged; they're adding a new chapter, not modifying the old one.

**Tonal bridge mechanic:** The first ranked match preserves Greenhouse's named agents. Your scout "Talim" enters the ranked queue. But over your first 10 ranked matches, the character voice gradually fades — decision trace text shifts from "I saw the enemy at B5 but my memory was full" to "Rule 3: ON enemy_spotted → ENGAGE. Context: slot 1 = enemy(B5), slots 2-6 = stale." The personality evaporates as the player learns to read raw traces. This is experienced as growing fluency, not as loss — like moving from training wheels to a real bicycle.

**Visual transition:** The warm amber workbench panels gradually cool. Over the first 5 ranked sessions: Mission 1 amber saturation → 75% amber → 50% → 25% → Circuit Board dark navy. The kulintang thinning mirrors this: full ensemble → fewer instruments per tick → sparse → tick clock only. Each session is barely different from the last. The boiling frog principle — by session 5, the player is in War Room mode without ever feeling a sharp transition.

**Strengths:**
- Zero risk of tonal whiplash — the transition is designed, paced, and reversible
- Respects the emotional investment of the campaign (Talim was real)
- Each session feels natural; the cumulative shift is invisible

**Weaknesses:**
- Requires authoring two parallel UI states for the 5-session transition period
- Players who want immediate War Room access are gated behind campaign completion
- The "fading personality" could feel melancholy rather than empowering
- Doubles the content: campaign + graduation transitions for each mode pair

---

### Model B: "The Mood Ring" — Continuous Tonal Slider

No discrete modes. Instead, a continuous spectrum controlled by player behavior. The game reads how you play and adjusts its tone:

- **Inspect a lot?** Analytical overlays become more prominent. Decision traces default to raw format. The UI assumes you want data.
- **Retry the same mission 3+ times?** The ghost mentor activates. Encouraging text appears. The kulintang adds a sympathetic instrument.
- **Open the ranked queue?** UI cools. Named agents lose speech bubbles. Audio strips to essentials.
- **Spend time in sandbox?** The UI expands workbench panels. The board preview gains interactive placement tools. Audio becomes ambient-generative.

The slider has no visible control — it's implicit, emergent from play patterns. The player never "enters War Room mode." They just notice, eventually, that their UI feels different from their friend's.

**The crossfade system:** Every UI element exists on a warmth–coldness spectrum. The workbench background has 10 color steps from warm amber (#F5E6CC) to dark navy (#091833). The unit inspector has 10 text-voice steps from character-first ("Talim saw the enemy and panicked") to data-first ("Scout-1: enemy_spotted(B5), context utilization 83%"). The kulintang has 10 density steps from full ensemble to tick-clock-only. Each step is a tiny, imperceptible shift. The system tracks the player's "analytical index" (0.0–1.0) based on Inspector time, retry count, ranked play, and sandbox usage, and sets all UI elements accordingly.

**The "return to warmth" mechanic:** If a competitive player stops playing ranked for a week and returns to campaign missions, the system reads the behavior shift and gradually re-warms. Talim's personality text starts reappearing. The kulintang fills back in. The amber creeps back into the workbench borders. You can always go home.

**Strengths:**
- Seamless — no mode selection screen, no ceremony, no gates
- Adapts to the player's actual needs, not their self-image
- Creates unique per-player UI states (my game looks different from yours)
- "Return to warmth" prevents mode lock-in

**Weaknesses:**
- Extremely difficult to test and balance (combinatorial UI states)
- Players may never know other modes exist if they don't naturally drift
- Streaming/sharing is confusing: "Why does your game look different from mine?"
- Loss of intentionality — the player didn't choose coldness, the system imposed it
- A/B testing nightmare for onboarding optimization

---

### Model C: "The Wardrobe" — Explicit Mode Select with Preview

A clear mode selection screen accessible from the main menu. Each mode is presented as a distinct experience with a 10-second animated preview:

```
┌─────────────────────────────────────────────────┐
│              CHOOSE YOUR EXPERIENCE             │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │🌿        │  │⚔️        │  │🔬        │     │
│  │GREENHOUSE│  │WAR ROOM  │  │LABORATORY│     │
│  │          │  │          │  │          │     │
│  │ [10s     │  │ [10s     │  │ [10s     │     │
│  │ preview] │  │ preview] │  │ preview] │     │
│  │          │  │          │  │          │     │
│  │ Warm.    │  │ Sharp.   │  │ Free.    │     │
│  │ Learn    │  │ Compete. │  │ Create.  │     │
│  │ here.    │  │ Prove    │  │ Break    │     │
│  │          │  │ yourself.│  │ things.  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                 │
│  ┌──────────┐  ┌──────────┐                    │
│  │🇵🇭        │  │⚙️        │                    │
│  │ARCHIPELAGO│  │CLOCKWORK │                    │
│  │          │  │          │                    │
│  │ [10s     │  │ [10s     │                    │
│  │ preview] │  │ preview] │                    │
│  │          │  │          │                    │
│  │ Home.    │  │ Precise. │                    │
│  │ Filipino │  │ Perfect  │                    │
│  │ roots.   │  │ machines.│                    │
│  └──────────┘  └──────────┘                    │
│                                                 │
│  [WHAT'S THE DIFFERENCE?]  ← comparison table  │
└─────────────────────────────────────────────────┘
```

Each preview card loops a 10-second clip: Greenhouse shows a named scout with speech bubbles on a lush Palawan jungle board. War Room shows a ranked queue countdown on a dark Circuit Board aesthetic board. Laboratory shows sandbox fork-and-re-run. Archipelago shows the Philippine map with kulintang. Clockwork shows a deterministic Inspector trace.

**Cross-mode save system:** Blueprints are shared across all modes. A player who builds a scout configuration in Greenhouse can use it in War Room ranked. The ARCHITECTURE is portable. The PRESENTATION changes. "Talim" in Greenhouse becomes "Scout-1" in War Room — same rules, same hooks, same context config. The player's design skill is universal; the emotional framing is mode-specific.

**Mode-switch friction:** Switching modes mid-campaign requires confirming: "Your campaign progress is saved. Switching to War Room will start a new experience track. You can return anytime." No progress is lost. The game maintains parallel progress bars per mode.

**Strengths:**
- Maximum player agency — you choose your experience
- Clean development separation — each mode is a self-contained UX skin
- Easy to communicate in marketing ("5 ways to play")
- Easy to A/B test (mode selection data = natural segmentation)

**Weaknesses:**
- Choice paralysis for new players (which mode do I pick?)
- The "correct" first choice for a new player is Greenhouse — but presenting 5 options undermines the guardrails that make Greenhouse effective
- Each mode needs its own tutorial/onboarding
- Community fragmentation (Greenhouse players and War Room players play different games)
- Blueprint portability implies all modes share the same mechanical core — but some configs diverge (e.g., Laboratory's weighted buffer model)

---

### Model D: "The Seasons" — Time-Gated Mode Availability

The game has one mode at launch. Additional modes unlock over real-world time (like a live service game's seasonal content drops):

- **Launch (Month 0):** Greenhouse campaign only. Everyone shares the same warm, guided experience.
- **Month 2:** War Room ranked opens. Players who completed the campaign see a ranked queue button appear.
- **Month 4:** Laboratory sandbox opens. Full unlock, workshop, modding tools.
- **Month 6:** Archipelago cultural expansion. Filipino language pack, province-specific content, educational features.

Each mode launch is a community event — blog posts, patch notes, a new boot log sequence ("NEW SUBSYSTEM DETECTED: COMPETITIVE MATRIX ONLINE"). The community evolves together. No one experiences tonal whiplash because the modes arrive gradually and the community discourse contextualizes them.

**The "returning player" problem:** A player who joins at Month 6 sees all modes available. The Wardrobe problem re-emerges. Solution: the game always starts new players in Greenhouse regardless of which modes are available. Other modes unlock after campaign completion or explicit opt-in.

**Strengths:**
- Ensures universal shared experience at launch (strongest community bonding)
- Each mode gets its own marketing moment
- Prevents choice paralysis — the game is simple at first
- Natural live-service engagement model (give players a reason to return)

**Weaknesses:**
- Competitive players forced into Greenhouse at launch may bounce ("where's ranked?")
- Sandbox/creative players forced into linear campaign may bounce ("I just want to build")
- Live service development cadence creates ongoing cost
- Latecomers miss the shared community experience of mode unlocking

---

### Model E: "The Lens" — Single Mode, Multiple Overlays

There's only ONE mode (effectively Greenhouse's warm campaign), but players apply "lenses" that change how the same content is presented:

- **Analytical Lens:** Strips character voice, shows raw decision traces, adds counterfactual panel, cools color temperature. Same missions, same levels — different information layer.
- **Competitive Lens:** Adds ghost opponent overlay (async PvP), timer, ELO display. Same missions, but now you're racing someone else's replay.
- **Creative Lens:** Unlocks fork-and-re-run in Inspector, adds sandbox tile placement, enables scenario editor. Same missions, but you can break them open.
- **Cultural Lens:** Activates Filipino language toggle, province history panels, traditional instrument identification in audio.

Lenses are combinable. A player can have Analytical + Cultural active simultaneously (raw decision traces with Filipino terminology). Lenses are toggled via a panel accessible from any screen — a row of icons in the top-right corner, each with an on/off state.

**The key insight:** The underlying game is always the same 10-mission campaign + Gauntlet post-game. The "configurations" are just different ways of looking at it. This preserves community unity (everyone plays the same missions) while allowing radical personalization.

**Strengths:**
- Single canonical game — no community fragmentation
- Lenses are independently toggleable — mix and match
- Lowest development cost (one campaign, multiple UI overlays)
- Players discover lenses gradually without choice paralysis
- Easy to add new lenses post-launch

**Weaknesses:**
- Some configurations require mechanical changes (Laboratory's weighted buffers, War Room's sealed duel PvP) that can't be achieved through UI overlay alone
- "Everything is the same game" may feel dishonest if the lens changes are cosmetic
- Players who want a PURE War Room experience may find the warm undertone persistent (the missions were designed for Greenhouse)
- Lens interaction complexity (how do 4 toggleable lenses combine across 3 screens × 10 missions?)

---

### Model F: "The River Delta" — Branching Progression with Tonal Zones

The campaign starts as a single stream (Greenhouse tone) and branches into tonal tributaries after Mission 5. The Philippine archipelago map literalizes this — the northern islands (Luzon) are warm Greenhouse territory. The central Visayas fork into either cultural-deep (Archipelago tone) or analytical-deep (Clockwork tone). Mindanao offers a competitive gauntlet or creative sandbox. The map itself communicates the tonal geography:

```
LUZON (M1-5): GREENHOUSE
    │
    ├── VISAYAS EAST (M6-7): ARCHIPELAGO
    │       └── merge → M8
    │
    ├── VISAYAS WEST (M6-7): CLOCKWORK
    │       └── merge → M8
    │
    └── M8 (reunited)
        │
        ├── MINDANAO NORTH (M9): WAR ROOM GAUNTLET
        │       └── merge → M10
        │
        ├── MINDANAO SOUTH (M9): LABORATORY SANDBOX
        │       └── merge → M10
        │
        └── M10: TAAL (FINAL) — all tones blended
```

Mission 10 (Taal volcano) synthesizes all tonal elements — the warm named agents meet raw analytical overlays, the kulintang plays at competitive intensity, the sandbox fork-and-re-run appears in the Inspector. The final mission IS the configuration mixing, and it works because the player has traveled through the delta and understands that these tones are all facets of the same game.

**The "all paths lead to Taal" principle:** No matter which branches the player chose, Mission 10 includes everything. The player who went Clockwork and then War Room arrives at Taal with analytical fluency but discovers that their scout's name (which has been there all along, just small and greyed out) suddenly fills the Inspector sidebar: "Talim was with you the whole time. You just stopped reading her name." The player who went Archipelago and then Laboratory arrives at Taal and discovers that the sandbox tools they've been using are now under competitive pressure for the first time — a timed boss battle with fork-and-re-run as their lifeline.

**Strengths:**
- The mixing is narratively motivated by geography
- Players experience tonal diversity as exploration, not configuration
- The delta structure creates replay value (take different branches on replay)
- Mission 10 as synthesis teaches that the configurations aren't separate games

**Weaknesses:**
- Complex campaign design (10 missions × multiple branch variants = 14+ mission variants)
- Players who want War Room from the start must complete 8 missions of Greenhouse/mixed content
- The forced Greenhouse opening (M1-5) may alienate competitive-first players
- Branch content means each individual path has fewer missions (only 2 per branch)

---

## Interaction Effects Across Models

### The Universal Substrate Problem

All six models assume that blueprints, hooks, rules, and context config work identically across modes. But the five configurations diverge mechanically:

| Dimension | Greenhouse | War Room | Laboratory |
|-----------|-----------|----------|------------|
| Buffer model | Fixed-Slot FIFO | FIFO + Categorized for Command | Weighted |
| Hook chaining | No chaining (Filing Cabinet) | Delayed chaining (Relay Race) | Hot/cold toggle (Spark Gap) |
| Rules language | Sentence Builder tiles | Priority Queue + Prefix | Sentence Builder tiles |

These aren't cosmetic differences — they're mechanical. A blueprint built in Laboratory (using weighted buffer entries and hot-mode hooks) cannot port to War Room (FIFO buffers, delayed-only chaining). Models that assume blueprint portability (C: The Wardrobe, E: The Lens) must resolve this, either by:
1. **Standardizing mechanics** across all modes (losing the differentiation that makes configurations interesting)
2. **Auto-converting** blueprints during mode transitions (lossy, confusing)
3. **Maintaining separate blueprint libraries** per mode (defeating the portability promise)

**Recommendation:** Models that acknowledge this tension (A: Graduation, D: Seasons, F: River Delta) handle it more honestly than models that paper over it.

### The Onboarding Multiplication Problem

Every distinct mode needs its own onboarding experience. The Greenhouse teaches through emotional connection and ghost mentors. The War Room teaches through failure and certification. The Laboratory teaches through sandbox experimentation. If the game ships with 3+ accessible modes, each needs:
- Its own boot log variant
- Its own first-10-minutes experience
- Its own difficulty curve
- Its own help/hint system

This isn't UI skinning — it's tripling the pedagogical design. Models A (Graduation) and F (River Delta) minimize this by funneling everyone through Greenhouse first. Models C (Wardrobe) and D (Seasons, for late joiners) face the full multiplication.

### The Community Coherence Problem

When two players discuss "Mission 6," do they mean the same thing? In Models C, D, and F, potentially not — different modes or branches mean different experiences. In Model E (Lens), yes — the underlying mission is the same, even if the overlay differs. In Models A and B, it depends on timing.

Community coherence matters for:
- **Guides and wikis** — can a guide assume a specific mode?
- **Streaming** — does a viewer's game look like the streamer's?
- **Forum discussions** — "how do I beat Mission 7?" requires context about which mode
- **Matchmaking** — ranked mode needs a shared mechanical standard

---

## Comparable Games and Media

### Final Fantasy XIV: The Universal Theme Park

FFXIV ships with multiple "modes" — Main Scenario Quest (story), Savage raids (competitive), crafting/housing (creative), Gold Saucer (casual fun). All coexist in one game client. The transition between a heartfelt cutscene and a sweat-dripping 8-man raid is handled through **spatial separation** (different zones, different music, different UI density) and **player-initiated context switches** (you queue for a raid; the raid doesn't come to you). The "mode shock" is managed because the player physically walks from one zone to another. Robot Uprising could use the three-screen loop as spatial separation: the Plan screen could warm/cool based on the player's current context (campaign vs. ranked queue vs. sandbox) while the Inspector remains analytically consistent.

### Hades: Tonal Gradient Through Progression

Hades starts warm (Zagreus's family dynamics, encouraging NPCs) and becomes analytically competitive (optimizing builds for heat levels, speed-running). The tonal shift is gradual and happens WITHIN a single mode — higher heat runs naturally strip the narrative fat because the player is focused on mechanical optimization. The game doesn't change; the player does. This is closest to Model B (Mood Ring), but it's naturally emergent rather than system-driven. Robot Uprising could learn: let the campaign naturally cool as complexity increases. Mission 1-3 (warm, named agents, speech bubbles) → Mission 4-7 (named agents but decision traces dominate) → Mission 8-10 (raw traces, named agents as labels only). The graduation IS the campaign.

### Slay the Spire: Post-Campaign Mode Shift

Slay the Spire's campaign (Ascensions 0-20) and its daily challenges/modded runs represent a tonal shift from "learn the game" to "optimize the game." The shift is handled through a clean UI separation — the main menu shows Ascension progression on one side and daily challenges on another. The visual style doesn't change, but the emotional contract does (exploration → mastery). This is Model A (Graduation) with a shared aesthetic. StS never changes its visual temperature — the game always looks the same. Only the player's relationship to it changes.

### Factorio: One Mode, Infinite Expression

Factorio never offers modes. There's one game. Players who want a relaxed sandbox turn off enemies and play Peaceful. Players who want competition play Deathworld or speedrun community maps. The "mode" is encoded in the game settings and self-imposed constraints. This is Model E (Lens) taken to its logical extreme — the game doesn't change; the player's constraints do.

### Celeste: Accessibility as Tonal Overlay

Celeste's Assist Mode doesn't change the levels — it changes the player's relationship to them (slower game speed, infinite dashes). The warm narrative and pixel art remain constant. The "competitive" player turns off all assists; the "accessible" player uses them freely. Both experience the same story, the same music, the same visual journey. Only the difficulty and the pacing differ. This is Model E (Lens) applied to difficulty rather than tone.

---

## The Tonal Gradient Taxonomy

Not all mode transitions are equally jarring. Some dimension shifts are smooth; others are cliff-edges:

| Transition | Smoothness | Why |
|-----------|-----------|-----|
| Warm art → Cool art | **Gradual** — Color temperature can crossfade over sessions | Each session is barely different |
| Full kulintang → Minimal audio | **Gradual** — Instruments can fade one by one | Each removed instrument is barely noticed |
| Character voice → Raw traces | **Gradual** — The character voice text can progressively include more technical data | "Talim saw the enemy [Rule 3, slot 1]" → "Scout-1: enemy_spotted(B5)" |
| Sentence Builder tiles → Priority Queue + Prefix | **CLIFF** — Completely different input methods | The player's muscle memory is invalid. Must re-learn the core interaction. |
| No hook chaining → Hot/cold chaining | **CLIFF** — Fundamentally changes what architectures are possible | Everything the player learned about "what you can build" is now wrong. |
| FIFO buffer → Weighted buffer | **CLIFF** — Changes the core mental model of context windows | Slots behaving differently = the foundational metaphor shifts |
| Ghost mentor ON → No hints | **Smooth** — Just stop showing hints | Player may not notice |
| Campaign missions → Ranked PvP | **Moderate** — Same screens but the opponent context changes everything | The presence of a human opponent transforms the emotional experience even if the UI is identical |

**Key insight:** Aesthetic transitions are smooth. Mechanical transitions are cliff-edges. Configuration mixing works ONLY for aesthetic dimensions — art direction, audio, character voice, hint systems, UI color temperature. It does NOT work for mechanical dimensions — buffer models, hook architecture, rules language. Any model that mixes mechanical configurations must handle the cliff-edge explicitly (re-tutorial, grace period, dual-mode compatibility).

---

## Player Journeys

### Journey: Elena, 34, UX designer, completed Greenhouse campaign, entering War Room for the first time

**Context:** Elena played through all 10 Greenhouse missions over two weeks. She named her favorite scout "Talim" (auto-generated but she kept it). She's beaten the game, loved the Inspector, and wants to test herself against humans. She clicks "ENTER THE WAR ROOM" from the post-campaign screen.

**Minute 0:00 — The Graduation Ceremony**
The boot log scrolls, teal text on dark:

```
COMPETITIVE MATRIX: initializing.
You have learned to build. To wire. To debug.
Now — can your architecture survive another mind?

Talim is still here. But the battlefield has changed.
The warm lights are dimming.
Information is all that remains.
```

The screen crossfades. The warm amber workbench border cools by one step — barely perceptible, from #F5E6CC to #E8DAC0. The kulintang plays its full phrase one final time, then one instrument drops out. The background shifts from the lush Palawan jungle to a circuit-board grid — but with a faint tropical green undertone, like the jungle is still visible beneath the circuitry.

Elena's blueprint library appears: her 10-mission configs, all present. Her scout's portrait still shows Talim's blinking eye. But beneath the portrait, where the character voice used to say "I'll keep watch!" it now shows: `Template: Scout-Standard. 2 hooks, 6 slots.`

**Minute 1:30 — First Ranked Queue**
She enters the queue. The timer counts down. Her opponent's rank appears: Bronze II (she's unranked). The map is randomly selected: Cebu Urban. The workbench looks... almost familiar. Same sentence strip editor. Same skill toggles. But the color temperature is cooler. The ghost mentor is gone. The tooltip animations are faster (200ms instead of 300ms). Everything is the same game, running at a slightly higher clock speed.

She reviews her blueprint. Talim is still Talim — same hooks, same rules. But she notices a new section in the workbench sidebar: "Opponent Intel: No data." In Greenhouse, there was no opponent panel. Its presence changes the emotional register of the entire plan screen. She's not building for a mission — she's building AGAINST someone.

**Minute 3:00 — Sealed Watch as Competition**
The sealed watch begins. Same tick clock. Same isometric board. But: both player factories are visible. The opponent's units spawn simultaneously. Elena watches her familiar architecture execute — Talim patrols, spots an enemy scout, sends on "threat." The signal travels to the relay. All familiar.

But the opponent's architecture is unfamiliar. Three relays in a tight cluster. A Command agent she can see but can't inspect. Signal lines in colors she hasn't seen — the opponent's channels have their own palette (warm orange vs. her cool cyan). The board becomes a visual argument between two information architectures. She realizes she's seeing someone else's design philosophy for the first time.

Tick 14: her striker engages an enemy scout. One-shot. She exhales. But simultaneously, the opponent's striker has flanked her relay from the south — a direction her scouts weren't covering. One-shot. Her relay falls. The magenta compression line flickers and dies. Her strikers, dependent on relay intelligence, are suddenly operating on stale data.

She loses at tick 28.

**Minute 5:00 — The Inspector as Adversarial Tool**
The Inspector opens. Same scrubber, same click-to-inspect. But she's not debugging her own mistakes — she's studying her opponent. She clicks the opponent's Command agent at tick 12. The decision trace shows a skill she hasn't seen in campaign: the Command used `reroute` to redirect its striker's listen channel from general-intel to a new channel called "flank-south" — a single-purpose channel carrying one scout's observations about her exposed relay position.

She traces the kill chain: opponent's scout detected her relay at tick 8 (her relay has zero perception, so it was invisible to her but visible to the opponent's scout). The scout sent on a channel. The Command received it at tick 10. The Command issued a reroute at tick 11. The striker received the flank order at tick 12. 4 ticks from detection to strike. Her relay was dead in 6 ticks.

Elena stares at the trace. In Greenhouse, the decision trace would have said: "Their commander saw your relay was exposed and sent a striker to eliminate it. Your relay couldn't see it coming." In War Room, the trace says: `COMMAND-1 → reroute(STRIKER-2, listen: "flank-south"). Trigger: rule 4 (+scout_report_age < 3 AND target_type = RELAY → reroute nearest striker to direct channel).`

She reads it again. Rule 4. Conditional prefix (+). Target type check. Direct channel creation via reroute. This is a level of architectural sophistication she never encountered in the campaign. She opens her workbench and starts rebuilding her relay positioning.

**UI Annotations:**
- Workbench border: cooling from #E8DAC0 (post-Graduation step 1) to #DDD1B3 (step 2 after first ranked match)
- Opponent Intel panel: 180px wide sidebar, appears right of board preview, shows opponent rank + last 5 match results + architecture tag
- Talim's portrait: unchanged, but character voice text replaced by template classification
- Ghost mentor: absent — no hints, no suggestions, no amber highlights
- Audio: kulintang at 70% density — 3 instruments instead of 5. Tick clock slightly louder in the mix.

---

### Journey: Mateo, 17, competitive FPS player, wants War Room immediately

**Context:** Mateo heard about Robot Uprising from a Twitch streamer who was playing ranked. He downloaded the game specifically for PvP. He has zero interest in the campaign.

**Minute 0:00 — The Gate (Model A/F)**
If the game uses Model A (Graduation) or F (River Delta), Mateo hits a wall. The main menu shows "CAMPAIGN" as the only active option. "RANKED" is visible but greyed out, with text: "Complete Mission 5 to unlock." He's frustrated. He starts the campaign.

The boot log begins:
```
SYSTEM INITIALIZING...
CONTEXT_CORE: loading.
I can... remember things now.
```

Mateo taps rapidly to skip. The text speeds up to match his input — the boot log reads his impatience and truncates to essentials. By Mission 1's plan screen, he has 30 seconds of boot log instead of 90 seconds. The game adapted to his pace without breaking.

**Minute 2:00 — Speedrunning Greenhouse**
Mateo plays Mission 1 in 45 seconds. The post-mission screen shows stats: "Time: 0:45. Ticks used: 6/20." He presses NEXT immediately. Mission 2: 1:20 (hook wiring). Mission 3: 2:10 (rules). Mission 4: 3:00 (skills + context config). Mission 5: 4:30 (factory). Total: 12 minutes.

At Mission 5 completion, the ranked queue unlocks. The unlock ceremony plays — but Mateo's "analytical index" (from Model B's implicit tracking) is already at 0.7 from his speed-running behavior. The UI is already 70% War Room: cooler colors, sparser audio, no character voice (he skipped all boot logs, so the character framing never established). The ranked queue button glows. He taps it.

**Minute 12:30 — First Ranked Match (Undertrained)**
Mateo enters ranked with 12 minutes of total experience. He knows the basics (hooks, rules, context, factory) but has never seen a complex architecture. His blueprints are default templates from the speed-run.

His opponent: Bronze I, 8 hours of playtime, came through Greenhouse at a normal pace. The opponent's architecture has customized rules, non-default channel names, and a relay with compress + filter. Mateo's architecture is 100% template.

He loses badly. His templates were designed for PvE enemies — predictable patterns, no adaptive behavior. The opponent's customized relay chain processes information faster and more cleanly than Mateo's default pipeline.

**Minute 14:00 — The Catch-Up**
The post-match Inspector shows Mateo something he never bothered learning: his scout's context window was full of noise because he never configured context filters. In Greenhouse, the ghost mentor would have taught this in Mission 3. In his speed-run, he skipped the ghost mentor entirely.

The War Room has a catch-up mechanism: a "TACTICAL PRIMER" button appears in the post-match screen for players whose ranked win rate is below 30% in their first 5 matches. The primer is a compressed 3-minute tutorial — the Greenhouse boot log, stripped of personality, delivered as a tactical briefing. No warmth. Just: "YOUR CONTEXT FILTERS ARE UNCONFIGURED. Here's how filters work." A data-first onboarding for a data-first player.

Mateo completes the primer in 3 minutes. His next match, he wins.

**Minute 20:00 — Retrospective**
After 5 ranked matches (2-3 record), Mateo notices the campaign button on the main menu. He's curious — what did he miss in his speed-run? He replays Mission 3 at his own pace. The boot log plays in full. Talim's character voice appears for the first time. He reads the context window tutorial framed as the AI learning to remember. "Oh, that's what I was supposed to learn." He spends 10 minutes in Mission 3's Inspector, something he skipped entirely the first time.

He returns to ranked with a deeper understanding. His win rate climbs.

**UI Annotations:**
- Boot log speed adaptation: tracks tap frequency, truncates text to 30% at 3+ taps/second
- Ranked unlock: after Mission 5 completion, regardless of total time
- Tactical Primer: 3-minute compressed tutorial, appears only for <30% WR in first 5 ranked matches
- Analytical index: starts at 0.0 for new players, weighted by Inspector time (−), retry count (−), boot log skip rate (+), execution speed (+)
- Campaign replay: full Greenhouse experience available anytime, does not affect ranked progress

---

### Journey: Lola Carmen, 62, retired teacher from Manila, plays Greenhouse only

**Context:** Lola Carmen completed the Greenhouse campaign in 3 weeks, playing one mission per evening on her tablet. She loved naming her agents after her grandchildren. She has no interest in competition or sandbox modes. She wants to replay the campaign with different configurations.

**Minute 0:00 — The Replay Screen**
After completing Mission 10, Lola Carmen sees the post-campaign screen. Model A shows three options: WAR ROOM, LABORATORY, STAY HOME. She taps STAY HOME.

The boot log plays:

```
SYSTEM: fully operational.
All subsystems: green.
You chose to stay. Good.
The terraces are quiet. The agents are resting.
There's still more to learn from what you've built.
```

The game presents: "REPLAY CAMPAIGN with new challenges." Each of the 10 missions now has a "challenge variant" — the same mission structure but with a twist:
- Mission 2 replay: "Wire hooks using ONLY one channel name for all connections."
- Mission 5 replay: "Complete the mission using only 2 blueprints in the production queue."
- Mission 8 replay: "Your Command agent has only 8 context slots instead of 14."

These challenges are Greenhouse-toned — the ghost mentor is available, Talim still speaks, the kulintang plays in full. But the challenges teach War Room-level concepts (efficiency, constraint optimization) through the warm framing. Lola Carmen is getting competitive-depth gameplay without the cold aesthetics or human opponents.

**Minute 5:00 — The Gentle Push**
After completing 3 replay challenges, a subtle message appears:

```
Your agents have grown strong.
If you ever want to test them against other builders...
the door is open.

[Maybe someday.]
```

The "Maybe someday" button dismisses the message permanently. No pressure. No FOMO. The game respects that Lola Carmen's relationship to it is Greenhouse, and it always will be.

**UI Annotations:**
- STAY HOME option: always available, first position in the post-campaign options
- Replay challenges: 10 constraint variants, one per original mission, Greenhouse-toned
- "Maybe someday" dismissal: one-time prompt, never shown again after dismissal
- Agent names preserved: Lola Carmen's custom names from her first playthrough persist in replays
- Audio: full kulintang ensemble throughout replays, no cooling

---

### Journey: Two friends, Kai (12) and Priya (12), playing on the same couch

**Context:** Kai has been playing Greenhouse for a week. Priya is downloading the game for the first time because Kai showed her a screenshot of a battle. They want to compare their games.

**Minute 0:00 — The Divergent Aesthetic**
Kai's game (after 7 missions in Greenhouse) has warm amber borders, named agents, full kulintang. Priya downloads and starts her first mission. Her game looks identical to Kai's first mission.

Kai opens his tablet next to Priya's. Same game, same mission — but Kai's Mission 1 replay shows his customized agents with non-default names, 7 missions of accumulated experience reflected in his available replay challenges, and a richer audio palette (more instruments unlocked). The games look the same in structure but different in personality. The difference is earned through play, not selected from a menu.

**Minute 5:00 — The Co-Op Question (Model-Dependent)**
Kai: "Can we play together?"

- **In Model A/C/D:** Co-op is a separate mode. If both players haven't unlocked it, they can't access it.
- **In Model B/E:** Co-op is available as a lens/overlay. Both players can enter a shared session from any point.
- **In Model F:** Co-op unlocks at the delta fork (Mission 6), requiring both players to have reached that point.

The ideal: co-op should be available as early as possible, because social play is the most powerful retention mechanism for 12-year-olds. Model E (Lens) wins here — "add a friend" is a toggle on any mission, from Mission 1 onward.

**Minute 10:00 — The Aesthetic Mismatch**
Kai's game is at analytical index 0.3 (moderate Greenhouse). Priya's is at 0.0 (brand new). In a co-op session, whose aesthetic applies?

Solution: **the warmest player's aesthetic wins.** If Priya's game is fully warm and Kai's is cooling, the co-op session uses Priya's temperature. This prevents the cooler player from imposing an unfamiliar aesthetic on the newer player. Kai sees his own game at Priya's warmth level — and might notice things he'd forgotten (Talim's speech bubbles, the ghost mentor suggestions). The co-op session is a return to warmth.

---

## Recommendation: The Graduated Lens (Hybrid A+E)

The strongest model combines **Model A (Graduation)** for initial flow with **Model E (Lens)** for ongoing customization:

1. **Everyone starts in Greenhouse.** No mode selection. No choice paralysis. The game is warm, guided, and universal.
2. **After Mission 5**, the first lens unlocks: the **Analytical Lens** (raw decision traces available as toggle in Inspector). The boot log frames it: "You can now see the code beneath the words."
3. **After Mission 10 campaign completion**, three additional lenses unlock simultaneously: **Competitive** (ranked queue), **Creative** (sandbox tools), **Cultural** (Filipino language + province history). A Graduation ceremony presents them.
4. **Lenses are independently toggleable.** A player can run Competitive + Cultural simultaneously (ranked matches with Filipino terminology).
5. **Aesthetic tonal shift is continuous and reversible.** The game's warmth cools as more lenses are activated, and re-warms as they're deactivated. The crossfade follows Model B's gradient but is player-controlled rather than behavior-tracked.
6. **Mechanical differences are handled at the lens level.** The Competitive lens switches hook architecture from Filing Cabinet to Relay Race. The Creative lens adds weighted buffer option. These are clearly communicated: "Competitive Mode uses delayed chaining — your filing cabinet hooks will work, but chaining is now possible." A brief in-context tutorial introduces the mechanical delta.

**Why this works:**
- Greenhouse onboarding is universal (no choice paralysis, strongest pedagogical flow)
- Players unlock complexity at their own pace
- Tonal mixing is explicit and reversible
- Mechanical changes are small and clearly communicated
- Community coherence is high (everyone shares the same first 5 missions)
- The "Stay Home" player (Lola Carmen) never sees a mode they didn't ask for
- The "Give me ranked" player (Mateo) has a 12-minute speedrun path to ranked
- Co-op works at any point via lens activation

---

## Discovered Aspects

This analysis reveals several unexplored questions:

- **8.03a-i** — The "analytical index" as hidden player model: formal specification of how the game tracks player behavior to determine tonal temperature; which signals weight highest (Inspector time, skip rate, retry count); privacy implications; the "creepiness threshold" of a game that reads you
- **8.03a-ii** — Character voice fade-out writing: the specific text progression from character-first to data-first decision traces across 10 granularity levels; authoring 5 units × 10 levels = 50 voice variants; tone consistency across the fade
- **8.03a-iii** — Mechanical delta tutorials: how to teach the Filing Cabinet → Relay Race hook architecture shift in 60 seconds when the player activates Competitive lens; the "one-screen primer" design pattern for lens-specific mechanical changes
- **8.03a-iv** — Co-op thermal negotiation: detailed protocol for resolving aesthetic temperature mismatches in multiplayer; "warmest wins" vs. "host decides" vs. "per-player rendering" (each player sees their own temperature); bandwidth implications of per-player rendering
- **8.03a-v** — The "speedrun path" as parallel onboarding: designing Mission 1-5 to be completable in 12 minutes by a player who skips all narrative, while still teaching enough mechanical fundamentals for ranked play; the minimum viable tutorial for competitive players
