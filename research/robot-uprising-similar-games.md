# Robot Uprising — 5 Most Similar Games

**Date:** 2026-03-14 (v2 — corrected framing)
**Context:** Competitive landscape research. Robot Uprising is NOT a programming game. It's an auto battler where you configure autonomous units through constrained primitives (skills, rules, hooks, context config) with fixed-size attention buffers. Discrete time steps. Sealed execution. No code, no open-ended input — just configuration within tight constraints.

**Core design pillars to match against:**
1. Configure units, then watch them fight (auto battler feel)
2. Discrete time steps (tick-based), not real-time
3. No programming — only constrained composable primitives
4. Context window / attention buffer as the core constraint (a bot can only take so much)
5. Sealed execution → debrief → iterate loop

---

## 1. Armored Core: Formula Front (FromSoftware, 2004 — PSP)

**The closest existing game. Auto battler with AI configuration, not programming.**

- You're an "Architect" who builds mechs and **configures their AI** using sliders and operation chips — not code
- **Sealed auto-battle:** your mechs fight autonomously in tournaments. You watch. Direct control exists but is explicitly discouraged (called "Naked" mode — notoriously hard)
- **Constrained configuration:** base character traits (sliders for aggression, range preference, movement style) + operations chips that give specific orders for each 30-second block of battle
- **Configuration IS the game:** "A well-designed AC with poorly programmed AI will be easily defeated"
- Hardware customization (480 parts) determines what behaviors are even possible — chassis constrains tactics
- Tournament structure with iterative improvement between rounds

**What it shares with Robot Uprising:** Architect role (you configure, not control). Sealed execution. AI behavior as the primary strategic axis. Constrained configuration space. Iterate after watching.

**What it lacks:** No attention buffer / context window mechanic. Configuration is sliders + chips, not composable primitives. No structured debrief tooling. No discrete tick system — battles are real-time (you just can't intervene). No emergent behavior from primitive interactions.

---

## 2. Final Fantasy XII — Gambit System (Square Enix, 2006)

**The original "limited slots of behavior rules" game.**

- Party members are configured with **Gambits**: ordered if/then rules (condition → action) that execute top-down each tick
- **Slot-limited:** you start with few gambit slots and unlock more. The constraint on how much behavior you can specify IS the challenge
- Rules are composable: "Ally HP < 50% → Cure" above "Foe: nearest → Attack" creates prioritized autonomous behavior
- Gambits must be acquired (purchased/found) — you can't use rules you haven't unlocked
- You watch your party execute their gambit chains autonomously — intervening manually is possible but the game rewards good gambit design
- Discrete evaluation: gambits are checked each action cycle in priority order

**What it shares with Robot Uprising:** Limited configuration slots (context window parallel). Composable condition-action rules as the building block. Priority-ordered evaluation. Autonomous execution you watch. The constraint on *how much* you can configure drives the strategy.

**What it lacks:** Not an auto battler — it's an RPG. Manual override always available (not sealed). No attention/information pressure. No debrief. Rules are simple if/then, not the four-primitive system. No emergent combos from system interactions.

---

## 3. Mechabellum (Paradox Arc / Game River, 2024)

**The modern robot auto battler — configure armies, watch them fight.**

- Auto battler with massive robot armies: you place units, assign tech upgrades, then watch battles play out
- **Sealed rounds:** once battle starts, no intervention. Iterate between rounds
- **Constrained builds:** unit positioning is locked after first placement. You fix mistakes with new units, not repositioning
- Counter-based strategy: composition decisions (which units, which upgrades, which positions) are the entire game
- Discrete rounds with configuration phases between them
- Competitive PvP with ranking system

**What it shares with Robot Uprising:** Robot theme. Auto battler structure (configure → watch → iterate). Sealed execution per round. Constrained configuration. Competitive multiplayer.

**What it lacks:** No AI behavior configuration at all — units have fixed behavior. The strategy is composition and positioning, not how units think. No attention/buffer mechanic. No composable behavior primitives. No debrief tooling beyond watching replays. Units don't make decisions you designed — they just fight with built-in AI.

---

## 4. Dragon Age: Origins — Tactics System (BioWare, 2009)

**Slot-limited behavior configuration for autonomous party members.**

- Configure party AI with **condition-action pairs** in limited slots (up to ~12)
- Conditions: "enemy is stunned", "ally HP < 25%", "self surrounded by 3+ enemies"
- Actions: specific abilities, movement, targeting priorities
- Slot limit forces hard prioritization — you can't cover every situation, so you choose what matters
- Party members then fight autonomously based on your tactics configuration
- Manual override available but good tactics reduce need for micromanagement

**What it shares with Robot Uprising:** Limited configuration slots (context window constraint). Condition-action rules as primitives. Autonomous execution. The strategy is in what you configure and what you leave unconfigured. Iterate after watching failures.

**What it lacks:** RPG combat, not auto battler. Manual control always available. No sealed execution. No attention buffer / information pressure. No hooks or inter-agent communication. No tick-based discrete steps. No debrief tooling.

---

## 5. Teamfight Tactics / Auto Chess (Riot / Valve, 2019+)

**The genre template: configure → watch → iterate.**

- The defining auto battler: draft units, equip items, set positions, watch rounds play out
- **Sealed rounds:** once combat starts, hands off
- **Constrained builds:** limited bench, limited board slots, limited gold — every choice has opportunity cost
- Synergy system: unit combinations create emergent bonuses (trait thresholds)
- Discrete rounds with economy management between them
- Iterate after each round based on what you saw fail
- Massive competitive scene

**What it shares with Robot Uprising:** The auto battler loop (configure → sealed execution → iterate). Constrained configuration space. Emergent properties from composition choices. Competitive multiplayer. Discrete rounds.

**What it lacks:** Zero behavior configuration — units fight with fixed AI. The game is drafting and economy, not attention design. No composable behavior primitives. No information/attention constraint. No debrief beyond "I lost, what comp do I pivot to?" Units are interchangeable pieces, not agents with designed cognition.

---

## The Gap

No existing game combines all of Robot Uprising's pillars:

| Feature | AC:FF | FF12 Gambits | Mechabellum | DA:O Tactics | TFT |
|---------|-------|-------------|-------------|-------------|-----|
| Auto battler feel | Partial | No | **Yes** | No | **Yes** |
| Sealed execution | **Yes** | No | **Yes** | No | **Yes** |
| Behavior configuration | **Yes** (sliders) | **Yes** (if/then) | No | **Yes** (if/then) | No |
| Constrained config slots | Partial | **Yes** | Partial | **Yes** | Partial |
| Attention / context buffer | No | No | No | No | No |
| Composable primitives | No | Partial | No | Partial | No |
| Discrete tick system | No | Partial | Partial | No | Partial |
| Debrief tooling | No | No | No | No | No |
| Emergent behavior from config | Partial | Partial | No | Partial | No |

**The unique thing Robot Uprising does that nobody else does:** The context window / attention buffer as the core constraint. Every other game constrains *what you can configure* (slot limits, part limits, gold limits). Robot Uprising constrains *what your units can perceive and remember*. That's a fundamentally different design axis — it's not about loadout optimization, it's about information architecture.
