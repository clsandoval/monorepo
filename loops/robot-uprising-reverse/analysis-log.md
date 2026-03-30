# Robot Uprising — Analysis Log

## 2026-03-30 — Batch: Canary Rotation, Anti-Canary Heuristic, Fog of Canaries, Canary Notation, Honest Decoy, Genealogy Neighborhood, Counterfactual Overlay, Vocabulary Audit, Signal Dropped Panel, Enemy Genealogy Link

**Aspects analyzed:** 10
**Files written:** 10

| Aspect | File | Type | Words |
|--------|------|------|-------|
| 4.97 — Canary rotation as season meta-strategy | `ui-ux/canary-rotation-meta-strategy.md` | Design exploration | ~5000 |
| 4.98 — Anti-canary heuristic (4th pre-ranking signal) | `ui-ux/anti-canary-heuristic.md` | Design exploration | ~3000 |
| 4.99 — "Fog of canaries" architecture | `ui-ux/fog-of-canaries-architecture.md` | Design exploration | ~3000 |
| 4.100 — Canary-aware community notation | `multiplayer/canary-aware-community-notation.md` | Design exploration | ~3000 |
| 4.101 — The "honest decoy" variant | `ui-ux/honest-decoy-poisoning.md` | Design exploration | ~3000 |
| 4.102 — Genealogy neighborhood expansion | `ui-ux/genealogy-neighborhood-expansion.md` | Design exploration | ~3000 |
| 4.103 — Counterfactual genealogy overlay | `ui-ux/counterfactual-genealogy-overlay.md` | Design exploration | ~3000 |
| 4.104 — Signal vocabulary consistency audit | `core-mechanic/signal-vocabulary-consistency-audit.md` | Design exploration | ~3000 |
| 4.105 — "Why was this signal dropped?" sub-panel | `ui-ux/why-signal-dropped-subpanel.md` | Design exploration | ~3000 |
| 4.106 — Enemy genealogy cross-tool link | `ui-ux/enemy-genealogy-cross-tool-link.md` | Design exploration | ~3000 |

**Key findings:**
- The canary poisoning meta-game (4.97-4.101) forms a complete arms race: single canary → rotation to avoid detection → fog-of-canaries distributed noise → anti-canary heuristic (Bloodhound Signal) as counter → honest decoy as the pinnacle defense. Community notation (The Canary Lexicon) emerges organically to document this meta.
- The genealogy tool cluster (4.102-4.106) deepens the Inspector's diagnostic power: neighborhood expansion (The Spotlight Reveal) prevents information overload on first visit, counterfactual overlay (The Phantom Circuit) shows whether a proposed fix actually resolves the broken signal path, the signal-dropped sub-panel (The Coroner's Slab) provides the deepest forensic view of buffer-full silence, and the enemy genealogy link (Know Thy Enemy's Wiring) teaches that diagnostic tools apply symmetrically to both sides.
- The Rosetta Constraint (4.104) establishes a hard data-model requirement: all diagnostic surfaces must render from a single canonical data model to maintain vocabulary consistency — critical for the game's 1:1 real-AI-vocabulary claim.

**Stats after:** 382 analyzed / 513 total (74.5%)

## 2026-03-20 — Batch: Rimworld, Dwarf Fortress, Shared Buffer Tax, Stigmergy, Buffer Insertion Order

**Aspects analyzed:** 5
**Files written:** 5

| Aspect | File | Type | Words |
|--------|------|------|-------|
| 1.27 — Rimworld | `competitive-analysis/rimworld.md` | Competitive analysis | ~2500 |
| 1.28 — Dwarf Fortress | `competitive-analysis/dwarf-fortress.md` | Competitive analysis | ~2500 |
| 2.05a — Shared buffer pooling tax calibration | `core-mechanic/shared-buffer-pooling-tax.md` | Design exploration | ~2200 |
| 2.05e — Stigmergy-only variant | `core-mechanic/stigmergy-only-variant.md` | Design exploration | ~2300 |
| 2.01a — Buffer insertion order as hidden complexity | `core-mechanic/buffer-insertion-order.md` | Design exploration | ~2400 |

**Key findings:**
- RimWorld's Work tab (grid of 1-4 priority numbers per colonist per work type) is the closest existing precedent to Robot Uprising's blueprint workbench. The community's top mod category is "expanded work management," validating the demand for more expressive behavioral programming that Robot Uprising provides natively.
- Dwarf Fortress's tantrum spiral (emotional cascade through social graph) is the structural analog to Robot Uprising's context overload cascade (informational cascade through channel topology). Both are positive feedback loops where one failure makes subsequent failures more likely; both are the game's signature dramatic event.
- The tiered pooling tax (90/80/70/60% for 2/3/4/5-unit squads) is the recommended calibration for shared buffers. Four discrete breakpoints that are instantly memorizable, create a clear strategic gradient, and interact cleanly with compress skills, EM emissions, and factory economy. The tax IS the curriculum — each tier teaches a new lesson about coordination cost.
- Stigmergy-only mode (hooks disabled, communication through tile marks only) creates a fundamentally different game where information travels at movement speed, not signal speed. Recommended as a progressive integration: introduced in Mission 4, blackout phase in Mission 7, full Ant Colony doctrine in Gauntlet. Zero EM emissions make it the stealthiest coordination model.
- Buffer insertion order should follow a Progressive Reveal pattern: hidden Missions 1-4, Inspector-visible Missions 5-7, configurable via Input Priority panel Missions 8-10. Channel names must never affect ordering (eliminating the "aaa-threat" naming exploit). The FIFO-inversion insight (expendable data enters first, precious data enters last) becomes a mid-campaign learning moment teaching real queue theory.

**Stats after:** 250 analyzed / 513 total (48.7%)

## 2026-03-20 — Batch: Mindustry, XCOM, Idle vs. Sealed Watch, SpaceChem Dual-Agent, SpaceChem Flip-Flop

**Aspects analyzed:** 5
**Files written:** 5

| Aspect | File | Type | Words |
|--------|------|------|-------|
| 1.16 — Mindustry | `competitive-analysis/mindustry.md` | Competitive analysis | ~2000 |
| 1.19 — XCOM series | `competitive-analysis/xcom.md` | Competitive analysis | ~2000 |
| 1.07e — Idle accumulation vs. sealed watch tension | `competitive-analysis/idle-vs-sealed-watch.md` | Design exploration | ~1800 |
| 1.08a — The dual-agent spatial coordination model | `competitive-analysis/spacechem-dual-agent.md` | Design exploration | ~1800 |
| 1.08d — SpaceChem's Flip-Flop as late-game conditional | `competitive-analysis/spacechem-flip-flop.md` | Design exploration | ~1700 |

**Key findings:**
- Mindustry validates that factory-under-pressure creates the same cascade failure emotional pattern Robot Uprising targets. Its logic processor (mlog) community proves demand for agent programming but confirms the accessibility wall Robot Uprising's visual workbench must solve.
- XCOM's probability-based combat is the design foil Robot Uprising's deterministic execution was designed to avoid. XCOM's "I missed a 95% shot" frustration is structurally impossible in Robot Uprising — failures are always architectural, never stochastic.
- The idle-vs-sealed-watch tension resolves cleanly: idle accumulation for preparation (factory production during workbench time), sealed watch for execution (the match). The boundary must be architecturally enforced.
- SpaceChem's two-waldo system establishes the "minimize explicit coordination" principle: the best architectures use the fewest hooks/Syncs necessary. This should be a late-campaign teaching moment — removing hooks as optimization.
- SpaceChem's Flip-Flop is the strongest model for Robot Uprising's Mission 7 mechanic unlock. Recommendation: Decay Flag (flag with TTL) as the "Flip-Flop equivalent" — one primitive that transforms reactive architectures into stateful architectures.

**Stats after:** 218 analyzed / 513 total (42.5%)
