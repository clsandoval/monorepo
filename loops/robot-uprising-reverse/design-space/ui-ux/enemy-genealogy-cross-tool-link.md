# Know Thy Enemy's Wiring

**Aspect:** 4.106 — Signal genealogy cross-tool link for enemy agents: extending the pre-ranking drawer's genealogy link (4.66) to work for the adversarial debrief view (4.39) — when adversarial analysis identifies a high-pivot-activity enemy element, clicking it opens the genealogy showing the enemy signal network at that tick; teaches that the pre-ranking heuristic applies symmetrically to player and enemy architectures; interaction with 4.39 adversarial counterfactual and 4.65 pre-ranking adversarial surface.

**Parent:** 4.66 — Signal genealogy as pre-ranking source (cross-tool linking); 4.39 — Adversarial counterfactual mode
**Siblings:** 4.65 — Pre-ranking adversarial surface; 4.67 — Probe hook suggestion from transparency panel; 4.58 — Pre-ranking transparency panel
**Related:** 4.16 — Signal genealogy visualization; 4.60 — Search budget as resource; 4.63 — Player-configurable pre-ranking weights; 7.10 — Config necropsy culture; 2.12 — Deception signals; 8.09 — Diagnostic layer as teaching arc; 4.55 — Cross-match adversarial aggregation; 4.57 — Threat model report

---

## The Core Concept

Aspect 4.66 built the wire between two diagnostic tools: the pre-ranking drawer says "RELAY-C was active at tick 52," the player clicks the phrase, and the signal genealogy opens to that exact moment, highlighting that exact node. One click turns an assertion into evidence. The link works beautifully — for the player's own architecture.

In adversarial counterfactual mode (4.39), the same pre-ranking heuristic runs on the opponent's config. The drawer says "Opponent's RELAY-PHANTOM was active at tick 38 — the pivot tick. Volatility: 0.84. Recency: 3 sessions." The same three signals. The same ranked candidate list. The same diagnostic prose. But the link is dead. "Active at tick 38" is static text. The player cannot click through to see what RELAY-PHANTOM was actually doing at tick 38, because the signal genealogy currently only renders the player's own signal network.

**4.106 is the second wire.** It extends the cross-tool link so that when the adversarial pre-ranking drawer references an enemy element at a specific tick, clicking that reference opens the signal genealogy — but now rendering the **enemy's** signal network. The enemy's agents as swim lanes. The enemy's signals as colored arcs. The enemy's routing topology at the exact tick the pre-ranking flagged as suspicious.

The player is now reading the enemy's wiring diagram with the same tool they use to read their own.

### The Symmetry Principle

This is the deepest pedagogical move in the entire adversarial diagnostic suite. When the player clicks "active at tick 38" on their own RELAY-C and sees their own genealogy, they learn one thing: how their architecture communicates. When they click "active at tick 38" on the opponent's RELAY-PHANTOM and see the enemy's genealogy rendered in the exact same visual language — same swim lanes, same colored arcs, same temporal scrubber, same node highlighting — they learn something more fundamental: **the analytical framework is architecture-agnostic.** The pre-ranking heuristic does not care whose config it is examining. The signal genealogy does not care whose signals it is rendering. The diagnostic vocabulary is universal.

This is the moment the game stops teaching the player to diagnose *their* architecture and starts teaching them to diagnose *any* architecture. The shift is quiet — same tool, same interface, same interaction — but the cognitive implication is enormous. A player who has internalized the symmetry principle does not look at an unfamiliar config and feel lost. They look at it and reach for the same tools.

In real-world terms, this is the difference between a developer who can debug their own code and a developer who can debug anyone's code. The tools are the same. The mental model is the same. The only thing that changes is whose system is under the lens.

### What the Enemy Genealogy Reveals

When the adversarial pre-ranking drawer flags an enemy element with high pivot-activity, the genealogy link lets the player answer a chain of questions that the drawer alone cannot:

1. **What was the enemy element actually doing at the pivot tick?** The drawer says "active." The genealogy shows *how* — receiving signals from which agents, forwarding to whom, with what fidelity, at what buffer occupancy. The player can see whether the enemy's relay was the central routing hub at the critical moment or a peripheral node that happened to be noisy.

2. **Is this element causally connected to the match outcome?** The drawer's pre-ranking heuristic is based on correlative signals (activity, volatility, recency). The genealogy shows causal structure — the actual signal chains that propagated from this element toward the agents that determined the match. A decoy element (see 4.65) will show up in the genealogy as a busy node whose output signals terminate in dead-end chains. A genuine vulnerability will show signal paths that reach the decisive agents.

3. **How does the enemy's network topology compare to the player's own?** With both genealogies available in the same visual format, the player can compare: "My relay chain is three hops deep and converges on my striker. Their relay chain is two hops but fans out to three independent strikers. Their architecture is wider; mine is deeper." This structural comparison is invisible without the genealogy — the pre-ranking drawer treats each element as an independent candidate, stripping away the network context.

4. **Where are the signal bottlenecks in the enemy's architecture?** The genealogy's "dam" visual — signals piling up on one side of a node that cannot process them fast enough — is legible in the enemy's network just as it is in the player's. A buffer-full relay that is dropping incoming signals is visible as severed arcs in the swim-lane view. The player can identify the enemy's chokepoints and design configs that apply pressure specifically at those chokepoints.

---

## The Implementation Surface

### The View Toggle

In adversarial mode (4.39), the signal genealogy panel gains a **perspective toggle** — a small two-state switch in the panel's toolbar, labeled "My Network" and "Their Network." The default view shows the player's own signal network (the existing 4.16 behavior). Clicking "Their Network" re-renders the genealogy with the enemy's agents as swim lanes, the enemy's signals as arcs, and the enemy's topology as the network graph.

The toggle uses a visual language shift to make the perspective unambiguous:

- **Player's network:** Swim lanes in the established warm palette — teal nodes, amber signal arcs, the familiar "Signal River" color scheme.
- **Enemy's network:** Swim lanes in a cool desaturated blue palette — steel-blue nodes, slate-grey signal arcs, with a subtle crimson tint on the panel border matching the adversarial mode's red-team visual language from 4.39.

The perspective toggle is only visible when the debrief is in adversarial mode. In standard debrief, the genealogy shows only the player's network, and the toggle does not appear.

### The Cross-Link Handshake

When the adversarial pre-ranking drawer contains a clickable reference — "[RELAY-PHANTOM] was active at [tick 38]" — the click performs a two-step handshake:

1. **Switch perspective:** If the genealogy is currently showing the player's network, it transitions to the enemy's network. The swim lanes fade, rearrange, and re-render with the enemy's agent set. The transition animation is a slow dissolve (400ms) — lanes sliding and reforming — not a hard cut. The player should feel that they are *looking through* to the other side, not jumping to a different screen.

2. **Navigate and highlight:** The genealogy scrolls to tick 38. RELAY-PHANTOM's swim lane pulses with a warm amber ring (the same highlight style as 4.66's player-side link, maintaining visual consistency). The edges connecting to RELAY-PHANTOM glow: incoming signals from enemy scouts, outgoing signals to enemy strikers, dropped or evicted signals rendered with the established severed-arc visual.

The drawer stays open in split-view. Drawer on the left, enemy genealogy on the right. The player reads the pre-ranking's assertion on the left and verifies it against the actual signal network on the right. Same layout as 4.66. Same interaction. Different architecture under the lens.

### The Comparison Mode

An advanced interaction unlocked by having both networks available: **side-by-side genealogy.** The player can pin the enemy's genealogy at tick 38 on the right panel and open their own genealogy at tick 38 on a left panel (or vice versa). Both networks at the same tick, rendered in the same visual language, showing how both architectures were behaving at the moment the match turned.

This is the "mirror" view — two signal rivers flowing side by side. The player can see that their relay was idle at tick 38 while the enemy's relay was routing three simultaneous signals. Or that both relays were saturated at tick 38, and the match was decided by which one recovered first. The comparison mode makes the symmetry principle viscerally literal: two architectures, same moment, same tools, same diagnostic language.

The comparison mode is not the default. It activates when the player drags the perspective toggle to the center position (between "My Network" and "Their Network"), splitting the panel horizontally. This is a power-user gesture — discoverable but not thrust upon beginners.

---

## Player Journeys

#### Journey: Marisol, 31, Network Engineer, Commander Tier

**Context:** Marisol works for a telecom company in Cebu and plays Robot Uprising on her commute. She is four weeks into Commander tier and has been running adversarial mode after every Gauntlet match since she learned about it from a config necropsy posted on the community forum. Her current config (v5.2) features a deep relay compression chain — three relays in series that progressively compress signals before they reach her pair of strikers. She just lost a match she expected to win. EDT 0.34 for her opponent — a fast, decisive loss. She wants to understand why.

**Minute 0:00 — The Adversarial Pre-Ranking**
The debrief opens to Act 2. The standard diagnosis runs first: her own pre-ranking surfaces RELAY-B (the middle relay in her chain) as the top candidate — it was active at tick 41, the pivot tick, and has high volatility (0.77). She clicks the "[tick 41]" link in her own pre-ranking drawer. The genealogy opens to her own network at tick 41: RELAY-B was receiving from RELAY-A and forwarding to RELAY-C, but the arc from RELAY-B to RELAY-C is severed — RELAY-C's buffer was full. Her compression chain broke at the second link. She notes this.

Now she switches to adversarial mode. The red-team toggle activates. The adversarial pre-ranking runs on the opponent's config. Results populate: "Opponent's DISPATCH-KESTREL was active at tick 41. Volatility: 0.91. Recency: 1 session."

The text reads: "[DISPATCH-KESTREL] was active at [tick 41] — the pivot tick. This element produced [27 distinct states] during the match."

Every bracketed phrase is a live anchor. Marisol clicks "[tick 41]."

**Minute 0:45 — The Enemy's Wiring Diagram**
The genealogy panel transitions. Her warm-toned swim lanes dissolve. Cool steel-blue lanes materialize in their place — the crimson tint appears on the panel border. She is looking at the enemy's signal network at tick 41.

DISPATCH-KESTREL is highlighted with the amber ring. It sits at the center of the enemy's topology — six incoming arcs from scouts and relays, four outgoing arcs to strikers and a secondary relay. At tick 41, DISPATCH-KESTREL is routing signals to all four strikers simultaneously. The arcs are thick — high signal volume. None are severed. Every signal arrives.

Marisol's eyes move between her own broken compression chain (RELAY-B to RELAY-C, severed at tick 41) and the enemy's fully saturated dispatch hub (DISPATCH-KESTREL, six inputs, four outputs, zero drops). She activates comparison mode — drags the perspective toggle to center. Both networks at tick 41, side by side. Her deep-and-narrow chain on the left, broken at the second link. The enemy's wide-and-flat dispatch on the right, fully operational.

She sees the architectural lesson immediately. Her chain is fragile: one full buffer anywhere in the series breaks the entire downstream flow. The enemy's hub is redundant: even if one output path fails, the other three still deliver.

**Minute 1:30 — Tracing the Decoy Question**
Marisol remembers 4.65 — pre-ranking poisoning. She checks: is DISPATCH-KESTREL a decoy? She follows DISPATCH-KESTREL's outgoing arcs in the genealogy. Signal S-114 reaches STRIKER-ZULU at tick 43. STRIKER-ZULU fires its burst rule at tick 44. STRIKER-ZULU's attack resolves the contested tile at tick 46. The causal chain from DISPATCH-KESTREL to the match outcome is unbroken. This is not a canary. This is the real thing.

If the genealogy link had not been available — if she had only the drawer's static text saying "active at tick 41, volatility 0.91" — she would have had no way to distinguish DISPATCH-KESTREL from a well-designed decoy. The genealogy is the verification layer.

**Minute 2:15 — The Counter-Design Session**
She runs "Find My Counter" against the adversarial result. The fix: add one buffer slot to RELAY-C (her third relay). This prevents the buffer-full drop at tick 41, allowing the compression chain to complete. She queues v5.3.

But the comparison mode gave her a second insight. She opens the workbench and begins sketching a v6.0 concept — replacing her three-relay serial chain with a two-relay hub-and-spoke topology, inspired by the enemy's DISPATCH-KESTREL pattern. The enemy's architecture taught her something about her own design philosophy.

**UI Annotations:**
- **Perspective toggle:** Two-state switch in genealogy toolbar. "My Network" (warm teal) / "Their Network" (cool steel-blue). Only visible in adversarial mode.
- **Transition animation:** 400ms dissolve. Swim lanes slide and reform. Panel border gains crimson tint during enemy view.
- **Comparison mode:** Drag toggle to center position. Panel splits horizontally. Both networks rendered at same tick. Power-user gesture, not default.
- **Anchor links in adversarial drawer:** Same teal hyperlink style as player-side drawer (4.66). Bracketed text, underline on hover. Click triggers perspective switch + navigate + highlight.

---

#### Journey: Joaquin, 22, CS Student, Pilot Tier

**Context:** Joaquin is in his final year at UP Diliman and picked up Robot Uprising three weeks ago. He has cleared the first eight campaign missions and just entered Gauntlet for the second time. His config (v1.3) is a lightly modified version of the campaign tutorial config — two scouts, one relay, one striker. Simple. He won his second Gauntlet match at EDT 0.58 — a contested win that felt closer than the numbers suggest. He has used adversarial mode once before (his first match) but didn't understand most of what it showed him. He remembers the red-team toggle, though. He remembers the feeling of the game showing him how he almost lost.

**Minute 0:00 — Entering Adversarial Mode**
Joaquin opens Act 2 after watching the sealed replay. The EDT gold diamond sits at tick 70 of 120. He reads the plain-language summary: "Your opponent's striker was eliminated at tick 74, ending the contested phase. Your relay's forwarded signal at tick 68 enabled your striker's targeting decision."

He toggles to adversarial mode. The panel border shifts to crimson-amber. The adversarial pre-ranking runs. Top candidate: "Opponent's RELAY-DAGGER was active at [tick 70]. Volatility: 0.62."

Joaquin reads the text. He sees "[tick 70]" is underlined — the teal hyperlink color. He has seen this before on his own pre-ranking drawer. He clicks it.

**Minute 0:30 — First Contact with the Enemy Genealogy**
The genealogy panel transitions. Joaquin has seen the Signal River view before — he used it twice during campaign to trace why his relay was dropping signals. He recognizes the swim lanes and the colored arcs. But now the lanes are steel-blue, the arcs are slate-grey, and the agents have unfamiliar names: SCOUT-ECHO, RELAY-DAGGER, STRIKER-FANG, SCOUT-WHISPER.

RELAY-DAGGER is highlighted at tick 70. It has two incoming arcs (from SCOUT-ECHO and SCOUT-WHISPER) and one outgoing arc (to STRIKER-FANG). The outgoing arc is severed — STRIKER-FANG was destroyed at tick 69, one tick before RELAY-DAGGER tried to send it the targeting signal. The signal had nowhere to go.

Joaquin reads this and understands something he did not understand before: the enemy's relay was still trying to route signals to a dead striker. The enemy's config had no fallback for striker destruction. He looks at his own config — his relay has the same single-output setup. If his striker had been destroyed, his relay would have done the same thing: sent a signal into the void.

He does not run "Find My Counter." He does not need to. The enemy's genealogy just showed him a fragility in the enemy's design that also exists in his own design. He opens the workbench and adds a secondary output path from his relay to his second scout — a fallback that was not in the tutorial config. He queues v1.4.

**Minute 1:15 — The Symmetry Realization**
Joaquin sits in the MRT on the way back to campus, staring at the split view. His relay on the left (warm teal). The enemy's relay on the right (steel-blue). Both relays have one output path. Both relays would fail identically if their target was destroyed. The two configs were built by completely different people, and they have the same weakness.

He does not articulate the symmetry principle consciously. He doesn't think "the analytical framework is architecture-agnostic." What he thinks is: *"Their relay has the same problem as my relay. The game showed me their relay to teach me about my relay."*

This is the pedagogical payoff. The enemy's genealogy is not just intelligence about the enemy. It is a mirror.

**UI Annotations:**
- **Plain-language tooltip on perspective switch:** First time the genealogy transitions to enemy view, a small tooltip appears: "You are now viewing the opponent's signal network. The same diagnostic tools apply to both sides." Appears once, does not repeat.
- **Agent name labels:** Enemy agent names appear in the enemy's genealogy with a small targeting-reticle icon prefix, distinguishing them from player agent names (which have a wrench icon prefix). This prevents confusion when both genealogies are visible.
- **Severed arc visual:** Same as player-side genealogy. A dashed line with a small "X" terminus where the signal was dropped. Color: desaturated crimson in enemy view (matching the adversarial palette) vs. desaturated amber in player view.

---

#### Journey: Sofia, 40, UX Researcher, Overseer Tier

**Context:** Sofia has been playing since early access and is one of the top 20 players on the Overseer leaderboard. She runs a systematic post-match analysis workflow: Act 2 standard diagnosis, adversarial mode, adversarial genealogy deep-dive, session note, config update queue. She has identified pre-ranking poisoning (4.65) in three separate opponents' configs over the past two seasons. She is currently investigating a player named "kalibutan_ng_bakal" whose configs consistently produce adversarial pre-ranking results that do not translate into effective attack vectors — the classic canary fingerprint.

This match is her fifth against kalibutan_ng_bakal. She won at EDT 0.29 — comfortable, but she is not here to celebrate. She is here to map the enemy's deception architecture.

**Minute 0:00 — The Systematic Audit**
Sofia opens adversarial mode immediately, skipping standard diagnosis (she will run it later — the adversarial analysis is the priority). The adversarial pre-ranking surfaces the usual suspect: "Opponent's SENTRY-BAYANI was active at [tick 35]. Volatility: 0.88. Recency: 1 session."

SENTRY-BAYANI. Again. This is the fourth consecutive match where the adversarial pre-ranking's top candidate is SENTRY-BAYANI. Sofia's session notes from the previous three matches read: "SENTRY-BAYANI QUICK result: +1 buffer. Adversarial variant EDT improvement: 0.03. Negligible. This is the canary."

She does not run "Find My Counter" on the QUICK result. Instead, she clicks "[tick 35]" — the genealogy link.

**Minute 0:30 — Mapping the Canary's Network**
The enemy genealogy materializes. SENTRY-BAYANI is highlighted at tick 35. Sofia has seen this node four times now. She knows its topology by heart: three incoming arcs from scouts, two outgoing arcs — one to a relay, one to a secondary striker. High traffic. Many state changes. The volatility score is real — SENTRY-BAYANI genuinely cycles through many states. The pivot-tick activity is real — it is genuinely processing at the critical moment.

But she follows the outgoing arcs. The arc to the relay terminates at RELAY-AGOS, which forwards to STRIKER-TIGRE. STRIKER-TIGRE's attack resolves at tick 37 — two ticks after the pivot — but the resolved damage is on a tile that is already uncontested. The signal chain from SENTRY-BAYANI reaches its terminus, but the terminus does not matter. The chain is real but strategically irrelevant. A beautiful canary.

Sofia opens her session note and types: *"Match 5 vs kalibutan_ng_bakal. SENTRY-BAYANI canary confirmed via genealogy trace. Signal chain terminates at uncontested tile (tick 37). Real vulnerability is elsewhere."*

**Minute 1:00 — The Deep Dive**
She runs THOROUGH mode on the adversarial explorer, spending compute budget from 4.60. Fifteen seconds. The THOROUGH result surfaces a different element entirely: "Opponent's DISPATCH-LAWIN: reduce hook threshold from 0.70 to 0.65. This allows a borderline signal to propagate, reaching STRIKER-ALON at tick 32, reversing tile control at tick 34."

Sofia clicks "[tick 32]" in the THOROUGH result. The genealogy navigates to tick 32. DISPATCH-LAWIN is highlighted — a small, quiet node in the upper-right of the enemy's topology. One incoming arc. One outgoing arc. Low volatility (0.23). Low pivot-tick activity (it fires once at tick 32, then goes silent). Low recency (unmodified for six sessions). The pre-ranking scored it near the bottom of the candidate list. QUICK mode never reached it.

This is the real vulnerability. And it was hidden in plain sight — a quiet node that fires once at the right moment and sends a single signal down the right path.

**Minute 1:45 — The Pattern Emerges**
Sofia opens comparison mode. SENTRY-BAYANI at tick 35 on the left: six arcs, high traffic, busy busy busy. DISPATCH-LAWIN at tick 32 on the right: two arcs, one signal, silence before and after. The visual contrast is extreme. The canary is a storm of activity. The real vulnerability is a whisper.

She writes: *"kalibutan_ng_bakal's deception architecture confirmed across 5 matches. SENTRY-BAYANI: persistent canary, high-volatility, high-activity, strategically irrelevant signal chain. DISPATCH-LAWIN: real vulnerability, low on all three pre-ranking signals, single-fire at critical tick. Without enemy genealogy link, the canary is indistinguishable from a genuine root cause in the pre-ranking drawer alone. The genealogy trace is the discriminating tool — it reveals whether the flagged element's signal chain reaches the match outcome or terminates in irrelevance."*

She runs "Find My Counter" against the THOROUGH result. The fix: increase her relay's fidelity filter from 0.68 to 0.72, blocking the borderline signal that DISPATCH-LAWIN would have propagated. She queues v8.7.

Then she opens the community forum and begins drafting a necropsy post titled "Anatomy of a Five-Match Canary" — complete with genealogy screenshots showing the decoy's busy-but-irrelevant signal chain alongside the real vulnerability's quiet-but-lethal single arc.

**UI Annotations:**
- **THOROUGH mode results in adversarial drawer:** Same layout as QUICK results but with a purple-tinted badge: "THOROUGH — exhaustive search." Results that differ from QUICK results are flagged: "This candidate was not surfaced by QUICK mode."
- **Genealogy navigation from THOROUGH results:** Same click-to-navigate behavior as QUICK results. The genealogy link works identically regardless of which search mode produced the result.
- **Session note integration:** A small "Add to session note" icon appears next to each genealogy-linked result. Clicking it appends a structured entry to the player's session note: "Match 5 — DISPATCH-LAWIN at tick 32 — THOROUGH result — signal chain to STRIKER-ALON."
- **Necropsy export from genealogy:** A "Capture for necropsy" button in the genealogy toolbar saves a snapshot of the current view (specific tick, specific highlighted node, specific perspective) as a shareable image with metadata. Used in community necropsy posts.

---

## Strengths

**Completes the adversarial diagnostic loop.** Before 4.106, adversarial mode could tell you *which* enemy element was suspicious and *what* change would exploit it — but not *how* the enemy element was actually behaving in the signal network at the critical moment. The genealogy link fills the gap between identification and understanding.

**Teaches the symmetry principle through interaction, not exposition.** The game never says "the diagnostic tools work on both sides." It simply makes the same click, the same animation, and the same visual language work on the enemy's architecture. The player discovers the symmetry by using it. This is the strongest form of pedagogical design — learning by doing, not by reading.

**Discriminates canaries from genuine vulnerabilities.** This is 4.106's most strategically significant contribution. The pre-ranking drawer cannot distinguish a well-designed decoy (4.65) from a genuine root cause — both score high on the same three signals. The genealogy trace is the only tool that reveals whether the flagged element's signal chain reaches the match outcome. Without the cross-link, the player must manually open the genealogy, find the enemy's element, trace its connections — a multi-step process that breaks diagnostic flow. With the cross-link, one click answers the question.

**Creates a natural difficulty ramp for genealogy literacy.** Players who first learn the genealogy on their own architecture (4.66) have already built the visual vocabulary — swim lanes, arcs, severed edges, buffer overlays. When the enemy genealogy activates for the first time, they are not learning a new tool. They are applying a familiar tool to a new dataset. The cognitive load is vocabulary recognition, not vocabulary acquisition.

**Supports the necropsy culture.** Community necropsies (7.10) that include enemy genealogy traces are dramatically richer than those with only pre-ranking drawer text. "SENTRY-BAYANI scored 0.88 volatility" is a data point. A genealogy screenshot showing SENTRY-BAYANI's six arcs terminating in an uncontested tile is a narrative. The cross-link makes these screenshots natural to produce — the player is already looking at the genealogy as part of their diagnostic flow.

---

## Weaknesses

**Information asymmetry concerns deepen.** The adversarial mode (4.39) already exposes the opponent's config fields in the pre-ranking drawer. The enemy genealogy extends this exposure to the opponent's full signal network topology — who talked to whom, when, with what routing structure. This is a significantly deeper level of architectural disclosure than field values alone. Players who are protective of their config designs may feel this crosses a line from "post-match analysis" into "architectural espionage."

**Canary arms race acceleration.** By making canary detection easier (the genealogy trace reveals dead-end signal chains), 4.106 accelerates the meta-game around pre-ranking poisoning (4.65). Canary designers will need to build more sophisticated decoys — canaries whose signal chains terminate in strategically plausible (but ultimately non-decisive) outcomes, rather than obviously irrelevant tiles. This raises the skill floor for effective deception, which is good for competitive depth but bad for accessibility.

**Cognitive overload risk in comparison mode.** Two signal networks rendered side-by-side at the same tick — each with 5-15 agents, each with multiple active signal arcs — produces a dense visual field. Players who are still building genealogy fluency may find the comparison mode overwhelming. The power-user gesture (drag toggle to center) mitigates this by keeping comparison mode opt-in, but players who activate it prematurely may bounce off the complexity.

**Enemy genealogy data fidelity.** The player's own genealogy is rendered from complete match data — every signal, every buffer state, every eviction is logged. The enemy's genealogy is reconstructed from the same match log, but the player has never seen the enemy's architecture before. Agent names, signal labels, and channel semantics are unfamiliar. The genealogy is legible as a network diagram, but the semantic meaning of each node requires the player to read the enemy's config tree (available in adversarial mode's readonly sidebar) to understand what each agent does. This creates a prerequisite step — "read the enemy's config first" — that 4.66 does not have for the player's own architecture.

**Computational cost of enemy genealogy rendering.** The player's own genealogy is pre-computed during match resolution and cached for debrief display. The enemy's genealogy, being a perspective-shifted view of the same data, should theoretically share the same precomputation. But the layout algorithm (swim-lane positioning, arc routing, topology clustering) must run independently for the enemy's agent set, which may have a different number of agents, different connectivity density, and different temporal activity patterns. This is a one-time computation on first access, but for matches with 15+ agents on each side, it may take 1-2 seconds to render — a perceptible pause that should be masked with a loading animation.

---

## Interaction Effects

**4.65 Pre-ranking adversarial surface:** The enemy genealogy link is the primary counter-tool for detecting pre-ranking poisoning. A canary element that scores high on all three pre-ranking signals is indistinguishable from a genuine vulnerability in the drawer text alone. The genealogy trace reveals the truth: does the flagged element's signal chain reach the match outcome? Without 4.106, canary detection requires manual navigation. With 4.106, it requires one click. This shifts the poisoning meta-game: canary designers must now build decoys that survive genealogy inspection, not just pre-ranking scoring.

**4.39 Adversarial counterfactual mode:** The genealogy link enriches adversarial mode's entire analytical surface. Currently, adversarial results present attack vectors as text descriptions ("increase buffer_size from 4 to 5"). With the enemy genealogy available, those results can include signal-network context: "increase buffer_size from 4 to 5 — [see the buffer-full drop at tick 38 →]." The genealogy makes attack vectors spatially legible, not just textually described.

**4.55 Cross-match adversarial aggregation:** When the player accumulates enemy genealogy traces across multiple matches against the same opponent, they can detect persistent topological patterns — "this opponent always routes through a central dispatch hub" or "this opponent's relay chain is always three hops deep." The genealogy traces become an intelligence archive, not just single-match diagnostics.

**4.57 Threat model report:** The threat model report can now include genealogy snapshots alongside pre-ranking scores and adversarial variant descriptions. A threat model entry that reads "DISPATCH-LAWIN: low pre-ranking score, high THOROUGH impact, single-fire signal chain at tick 32 [genealogy snapshot attached]" is a complete intelligence brief. The genealogy snapshot is the evidence; the pre-ranking score and adversarial variant are the analysis.

**4.60 Search budget as resource:** The genealogy link does not consume search budget — it is a visualization, not a computation. However, the strategic value of the genealogy link (canary detection, topology mapping) may reduce the need for THOROUGH mode searches in some cases. A player who can distinguish canaries from genuine vulnerabilities via genealogy inspection may spend less compute budget on exhaustive searches, saving it for matches where genealogy inspection is ambiguous.

**7.10 Config necropsy culture:** Enemy genealogy screenshots become a new class of necropsy artifact. Community necropsies can now include annotated enemy topology diagrams alongside config field analysis. "Here is kalibutan_ng_bakal's deception architecture across five matches, with genealogy traces showing the canary's dead-end chain and the real vulnerability's single-fire path" is a community post that teaches pre-ranking poisoning detection to every reader. The cross-link makes these screenshots a natural byproduct of the diagnostic workflow, not a separate artifact-creation step.

**8.09 Diagnostic layer as teaching arc:** The progression from 4.66 (player genealogy link) to 4.106 (enemy genealogy link) is a deliberate pedagogical sequence. The player learns the genealogy on their own architecture first, in a context where they already understand the agent names, signal semantics, and design intent. Then they apply the same tool to the enemy's architecture, in a context where everything is unfamiliar except the diagnostic framework itself. The teaching arc is: familiar tool on familiar data, then familiar tool on unfamiliar data. The tool is the constant; the data is the variable. This is how expertise generalizes.

---

## Comparable Games and Media

**Wireshark on someone else's network.** Network security analysts routinely use Wireshark to capture and analyze traffic on networks they did not build. The tool is the same whether you are diagnosing your own server's packet loss or investigating a compromised third-party system. The analyst's skill transfers because the protocol layers, the visual language of flow graphs, and the diagnostic mental model are architecture-agnostic. 4.106 teaches this exact transferability: the Signal River view is Wireshark, and the enemy's network is the third-party system you are investigating.

**Chess engine analysis from opponent's perspective.** Lichess and Chess.com allow players to request engine evaluation from either side's perspective. After a game, you can ask: "What was Black's best move at move 23?" The engine does not care which side you played. The evaluation function is symmetric. The player who habitually checks both sides' best moves develops a stronger positional sense than the player who only checks their own. 4.106 is the same principle applied to signal-network analysis rather than positional evaluation.

**Forensic accounting — following the money through someone else's books.** A forensic accountant examining a company's financial records uses the same double-entry bookkeeping framework regardless of whose books they are reading. Debits must equal credits. Cash flows must balance. The framework is universal; the specific accounts and transactions are unique to each entity. The enemy genealogy is the forensic accountant reading an unfamiliar company's ledger using the same accounting principles they use on their own.

**Into the Breach — enemy intent display.** Into the Breach shows enemy intents before the player acts — you can see exactly what each enemy unit will do on its turn. This is full architectural transparency applied in real time. Robot Uprising's enemy genealogy provides the same transparency, but retrospectively and with deeper structural detail: not just "what will the enemy do next tick" but "how did the enemy's entire communication network behave across the full match."

**StarCraft replay analysis with opponent vision.** StarCraft II replays allow players to toggle between player perspectives, seeing the fog of war from either side. Watching the replay from the opponent's perspective reveals information the player did not have during the match — "they knew I was expanding at 5:00, which is why they pushed at 5:30." The perspective toggle in 4.106's genealogy is a structural analog: toggling between "My Network" and "Their Network" reveals the enemy's communication patterns that were invisible during gameplay.

**Autopsy reports in forensic pathology.** A pathologist performing an autopsy uses the same anatomical framework regardless of whose body is on the table. Organ systems, tissue types, cause-of-death determination — the vocabulary is universal. The enemy genealogy cross-link teaches the same universality for signal-network analysis: the diagnostic vocabulary (swim lanes, arcs, severed edges, buffer overlays) does not change when the architecture under examination changes.

---

## Sensory Description

**The perspective transition.** The player clicks "[tick 38]" in the adversarial pre-ranking drawer. The genealogy panel — currently showing the player's own warm-toned Signal River — begins to shift. The swim lanes do not disappear; they cool. The teal nodes fade to steel-blue over 400 milliseconds, like metal quenching in water. The amber signal arcs drain to slate-grey. The panel border, already tinted crimson from adversarial mode, deepens slightly — a confirmation that the red-team perspective now extends to the genealogy. The lane labels dissolve and reform with unfamiliar names: SCOUT-ECHO, RELAY-DAGGER, DISPATCH-KESTREL. The font is the same. The layout is the same. The color is different. The player is looking through the same lens at a different machine.

**The enemy node highlight.** RELAY-DAGGER pulses with the warm amber ring — the same ring that highlights player nodes in 4.66. The amber is deliberately the same warmth in both contexts. The diagnostic highlight does not take sides. It says: "this is the node under investigation." The amber ring against the steel-blue swim lane creates a visual focal point — warm-on-cool, a single point of heat in a cold network.

**The severed arc in enemy context.** In the player's genealogy, a dropped signal renders as a dashed amber line terminating in a small "X." In the enemy's genealogy, the same visual uses the adversarial palette: a dashed crimson line, darker than the panel border, terminating in the same "X." The "X" is universal — a signal that did not arrive. But the color communicates perspective: amber means "my signal was dropped" (a problem to fix). Crimson means "their signal was dropped" (a weakness to exploit). The same visual grammar, different emotional valence.

**The comparison mode split.** The player drags the perspective toggle to center. A thin dividing line appears vertically in the genealogy panel — not a hard border, but a faint luminous seam, like the edge of a mirror. The player's warm-toned network occupies the left half. The enemy's cool-toned network occupies the right half. Both are synchronized to the same tick. Both scroll together. The seam glows faintly when both networks have active signals at the same tick — a visual whisper that says "both architectures were talking at this moment." The Manila Bay haze of the game's atmospheric palette — the warm humidity that sits over every battlefield in the Philippine archipelago — is absent from the enemy's side. The enemy's network feels sterile, clinical, like examining a machine on an operating table under fluorescent light. The player's side retains the warmth. The contrast is the point: your architecture is home. Theirs is the subject of investigation.

**The audio layer.** When the genealogy transitions to enemy view, the ambient soundscape shifts. The player's genealogy has a gentle background hum — the sound of their own machine operating, a warm electrical murmur. The enemy's genealogy replaces this with a cooler tone: a higher-pitched, slightly dissonant hum, like listening to an unfamiliar server room through a wall. The pitch difference is subtle — maybe 50 Hz higher — but perceptible. When the player switches back to their own view, the warm hum returns. The audio tells the player which perspective they are in even without looking at the visual cues. In comparison mode, both tones play simultaneously, creating a gentle interference pattern — two machines humming in the same room, slightly out of tune with each other.

---

## New Aspects Discovered

- **4.107 — Enemy genealogy annotation layer:** allow the player to place persistent annotations (text notes, flag icons, highlight colors) on nodes and arcs in the enemy's genealogy — "this is the canary," "this arc is the real vulnerability" — creating a marked-up intelligence map that persists across matches against the same opponent; interaction with 4.55 cross-match aggregation and 7.10 necropsy culture
- **4.108 — Genealogy diff between matches:** when the player has enemy genealogy traces from multiple matches against the same opponent, render a diff view showing which nodes and arcs are new, removed, or modified between matches — "their DISPATCH-LAWIN gained a second output arc since last match"; structural change detection in enemy architectures
- **4.109 — Canary confidence score:** a computed metric displayed alongside each adversarial pre-ranking result — based on genealogy trace analysis, how likely is this element to be a decoy? Factors: does the signal chain reach the match outcome? Does the element's strategic contribution match its diagnostic prominence? High canary-confidence elements are flagged with a warning icon; interaction with 4.65 pre-ranking adversarial surface
- **4.110 — Enemy genealogy as config design inspiration:** a "study this topology" mode that lets the player save an enemy's genealogy layout as a reference template in the workbench — not copying the config fields, but preserving the network topology (number of agents, connectivity pattern, hub-and-spoke vs. chain vs. mesh) as a structural blueprint for the player's own designs; interaction with 4.37 fork-and-deploy and the broader config-design workflow
