# First Playable Decisions — Brainstorm Output

**Date:** 2026-03-13
**Context:** These decisions were made during a brainstorming session about scoping the first playable demo. The reverse loop should treat these as locked preferences for the "minimum viable game" (aspect 8.04) and "full game configurations" (aspect 8.03) explorations.

**Full spec:** `docs/superpowers/specs/2026-03-13-robot-uprising-first-playable-design.md`

---

## Scope: Demo/Pitch Build (For Creator)

- **Audience:** Myself — I need to play it and feel the "managing smart autonomous systems" feeling
- **Intelligence model:** Fully deterministic (no LLMs, no RNG beyond compress)
- **Visual investment:** Battlefield-heavy (workbench functional but not fancy)
- **Narrative:** Light framing (1-2 terminal lines per mission, no cutscenes, no characters)
- **Mission count:** 7

---

## Tick System (Locked)

- **1 action per tick per agent.** Move, compress, filter, send signal, engage, patrol, hack, etc.
- **Receiving a signal is free.** Arrives in buffer, doesn't cost the agent's action.
- **1 tick per hop for signal travel.** Hook signals take 1 tick to travel per hop.

### Latency implications:
- Direct hook (Scout → Striker): 2 ticks total (1 hop + 1 act)
- Via relay, no processing: 4 ticks (1 hop + 1 forward + 1 hop + 1 act)
- Via relay with compress: 5 ticks (1 hop + 1 compress + 1 forward + 1 hop + 1 act)
- Via command agent: 7+ ticks

**Design implication:** Deeper architectures are smarter but slower. This is a real tradeoff.

---

## Compress Mechanic (Locked)

Lossy. Takes X signals, keeps X/2 chosen at random, discards the rest.

- **Cost 1:** Might randomly discard the critical signal
- **Cost 2:** Takes 1 tick (adds latency to the chain)
- **When to use:** When buffer overflow is worse than lossy data

---

## 7-Mission Arc

| # | Name | New Concept | Checkpoints |
|---|------|-------------|-------------|
| 1 | Wake Up | Context config (filters, buffer) | #1 Attention is subtraction |
| 2 | First Contact | Rules, Hooks | #2 Emergent combo, #3 Detective story |
| 3 | Growing Pains | Architecture scaling (split networks) | — |
| 4 | Noisy Channel | Skills (compress, filter) | — |
| 5 | Chain of Command | Command agent | #4 Designing systems |
| 6 | Breach | Full workbench, multi-objective | #5 Cascade failure |
| 7 | The Warden | Enemy architecture | #6 Show someone |

Each bridge mission (3, 4, 5) creates the problem that the next mission's new primitive solves.

---

## 6 Feeling Checkpoints

1. **Attention is subtraction** — drag noise to ignore, unit snaps from overloaded to focused
2. **Emergent combo** — scout → relay → striker chain fires, flanking emerges unscripted
3. **Detective story** — debrief traces failure through the signal chain
4. **Designing systems** — command agent adapts architecture mid-battle without player intervention
5. **Cascade failure** — simultaneous overloads chain through the architecture
6. **Show someone** — player's architecture dismantles enemy architecture (weaponized information overload)

---

## Unit Types (5 Total)

| Type | Buffer | Key Trait | Skills |
|------|--------|-----------|--------|
| Scout | 6 | Wide perception, fast, fragile | patrol, evade |
| Striker | 8 | Narrow perception, strong | engage, breach |
| Relay | 12 | Stationary signal amplifier | compress, filter, amplify |
| Specialist | 10 | Medium perception, hack/extract | hack, extract |
| Command | 14 | Stationary, manages other agents | reassign, reroute, prioritize |

---

## Open Questions (For Loop to Explore)

- **Workbench interaction design:** Dropdown-based (trigger → action → target) risks feeling like forms. What alternative UX makes configuration feel like *designing*?
- **Command agent detection:** How does it "know" about a new threat axis? Needs explicit rule/hook mechanics.
- **Amplify vs filter:** How do these differ in practice? Amplify boosts priority, filter drops below threshold — but when would you choose one over the other?
- **Turret mechanics:** Can't be engaged, only hacked. Needs range, detection, and behavior details.
