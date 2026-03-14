# Gladiabots — Visual Query Model as Attention Language

**Aspect:** 1.06b — Gladiabots's target-type + filter + selector as declarative attention specification; how Robot Uprising extends with buffer-awareness, fidelity metadata, and signal age
**Source game:** Gladiabots (GFX47)
**Category:** Competitive Analysis → Core Mechanic Adaptation

---

## The Core Transformation

Gladiabots gives every agent a **declarative query model** for targeting: pick a target type, apply filters, choose a selector. The query runs against the **global world state** — the game knows everything and your query narrows who you act on. The player writes logic; the engine supplies the data.

```
Gladiabots Query:
ATTACK [Enemy] [class: Machine Gun] [at short range] → closest → act
                                 ↑
                         Queries the whole world.
                         Omniscient. Always fresh.
```

Robot Uprising inverts the data layer. Agents don't have access to the global world state. They have a **context buffer** — a fixed-size working memory of what they've sensed, received, and cached. The query model must change accordingly:

```
Robot Uprising Query:
ENGAGE [Enemy Striker] [fidelity > 0.7] [age < 4 ticks] [source: any] → freshest → act
                              ↑                  ↑              ↑
                     How certain is         How recent     Who told you?
                     the information?       is it?
```

This is the fundamental shift: **from targeting language to attention language**. Gladiabots asks "which entity in the world should I act on?" Robot Uprising asks "which knowledge in my buffer should I act on?"

An agent with an empty or stale buffer cannot engage — not because the enemy isn't there, but because the agent doesn't *know* the enemy is there. The player's job is no longer just to program behavior. It's to design the information architecture that makes behavior possible.

---

## The Three New Dimensions

### Dimension 1: Buffer-Awareness (Does the Knowledge Exist?)

In Gladiabots, a rule like "if enemy sniper in range, attack" either finds an enemy or it doesn't. The world provides the answer.

In Robot Uprising, the same structure first asks: **is there an entry of type `ENEMY_SNIPER` in this agent's buffer?** If the buffer has no such entry — because no scout reported one, because the relay chain was cut, because the buffer was evicted — the rule fails and falls through to the next rule. The agent doesn't know there's a sniper. It doesn't act against the sniper.

This creates the central design tension: **buffer contents determine behavioral range**. An agent with a buffer full of terrain data and no threat data will navigate correctly and engage nothing. The player configures the agent to care about the right signals.

**Buffer Miss Behavior:** When a rule's query finds no matching buffer entry, three design options:

- **Skip (Fall-through):** The rule doesn't fire; evaluation continues to the next rule. Standard Gladiabots semantics extended to buffer-miss.
- **Defensive default:** A configurable fallback action executes when the buffer is empty of a required type. "If I can't find THREAT data, patrol." This is a *buffer-miss handler* — explicit, player-configured.
- **Suspend:** The agent waits one tick before re-evaluating. Used when an agent expects a signal soon (relay incoming) and shouldn't act on stale data. Creates a "thinking pause" that can be diagnosed in debrief.

For the first playable (7-mission arc), **skip/fall-through** is the default — identical to Gladiabots's condition-not-met behavior. Defensive defaults unlock in Mission 3 as part of the robustness vocabulary.

---

### Dimension 2: Fidelity Threshold (How Certain Is the Knowledge?)

A signal's **fidelity** is a 0.0–1.0 score encoding how well-preserved the information is. Signals start at 1.0 when sensed. Relay-compress halves fidelity (taking X signals → X/2, randomly — as locked in the first playable design). A position reported directly has fidelity 1.0; a position compressed twice has fidelity ~0.25.

Fidelity is a **query filter dimension**: rules can specify a minimum fidelity to act on.

```
Rule A: ENGAGE [Enemy] [fidelity > 0.8] → precise strike
Rule B: ENGAGE [Enemy] [fidelity > 0.4] → area suppression
Rule C: ENGAGE [Enemy] [any fidelity]   → desperation shot
```

This creates a confidence-gated behavior cascade. A well-configured agent acts precisely on fresh intelligence and degrades gracefully on stale intelligence — rather than either acting perfectly or not acting at all.

**Fidelity as game mechanic:** Low fidelity doesn't just reduce accuracy — it changes *which actions are viable*. A BREACH skill requires fidelity > 0.7 (you need to know where you're breaching). A PATROL skill accepts any fidelity (you're just covering ground). Fidelity thresholds are effectively a prerequisite system baked into the query language.

**The fidelity attack surface:** Because high-fidelity signals are the ones agents *act on*, the enemy can specifically inject **high-fidelity false data** to subvert player behavior. A deception signal at fidelity 0.95 triggers the player's best-confidence rules on false information. Adding a **source filter** (`fidelity > 0.8 AND source IN [trusted-allies]`) is the counter-intelligence response — expressed entirely in the query model.

---

### Dimension 3: Signal Age (How Recent Is the Knowledge?)

Every buffer entry has an **age** counter: how many ticks since it was last updated. Age grows every tick. A position sensed 8 ticks ago in a fast-moving battle is very different from a position sensed 2 ticks ago.

Age is an independent filter from fidelity. A signal can be high-fidelity but old (compressed minimally but received long ago). A signal can be low-fidelity but fresh (just compressed by a relay this tick).

```
Rule: ENGAGE [Enemy Striker] [age < 3] [fidelity > 0.6]
→ "I act on enemies I know about precisely AND recently."
```

**Age in the query sentence:** The auto-generated sentence (Gladiabots's key accessibility win) extends naturally: *"Engage the nearest enemy Striker in buffer, confirmed within 3 ticks, fidelity above 60%."*

**The staleness gradient:** Agents acting on old data should feel different from agents acting on fresh data. This is the **asynchronous observation gap** (aspect 2.20) expressed in the query model. The debrief can annotate every action with the age of the buffer entry that triggered it — fresh actions glow bright, stale actions dim. Players learn to read their debrief like a freshness report.

**Predicted-position skills:** An advanced unlock: if an agent has the `EXTRAPOLATE` skill, it can query an old positional signal and the skill automatically adds estimated movement offset (last-known velocity × ticks-elapsed). The query can then run on a predicted position rather than a known position. This is the "last known position" mechanic formalized as a skill — not in the query language itself, but as a pre-processing step that updates the buffer entry before rules evaluate.

---

## The Four Query Paradigms

### Paradigm A: Strict Buffer Isolation (The Pure Version)

All rules query only the buffer. No live world access. To act on something, it must be in the buffer. This is the most faithful to the attention-architecture premise.

**Implication:** Buffer design is existential. An agent that never receives a THREAT signal can never engage. The player must trace the entire pipeline: How does threat data enter the system? Which scout senses it? Does the relay forward it? Does the striker's buffer have a slot reserved for threat entries?

**Teaching sequence:** Mission 1 ("Wake Up") works entirely on this paradigm. The agent has perception within radius — entries auto-fill the buffer from direct observation. No pipelines needed. The player experiences buffer management before learning about hooks.

### Paradigm B: Hybrid — Buffer-First with Live Fallback

Rules check the buffer first. On a buffer miss, the agent can execute a `SENSE` action as its tick — looking at the live world and filling a buffer slot. This costs an action (the agent did nothing else this tick) and emits a small EM signal.

**Implication:** Agents can self-recover from information starvation, but at cost. A poorly-designed architecture where agents frequently fall back to live sensing is both slow (wasted action ticks) and loud (emissions). Well-designed architectures use the pipeline; live sensing is an emergency fallback.

**Teaching sequence:** Introduced in Mission 2 ("First Contact") when the player's first hook chain is introduced — they see that a connected agent acts faster and quieter than an isolated one that live-senses every tick.

### Paradigm C: Confidence-Gated Actions

Each action in the workbench has a **minimum fidelity gate** — a threshold below which the action is locked. The player sets this per-action, not per-rule.

**Implication:** Actions have built-in quality requirements. BREACH requires 0.75+. ENGAGE requires 0.5+. PATROL requires 0. The fidelity gate prevents high-stakes actions on garbage data. Players who turn down the gate "play recklessly" (agents attack ghosts); players who turn it up "play cautiously" (agents become overly selective).

### Paradigm D: Freshness-Weighted Action Quality

Actions produce different results depending on the signal quality of the triggering buffer entry. High fidelity → precise. Low fidelity → approximate.

**Implication:** Agents continue acting even with stale/degraded data, but less precisely. A FLANK action on a 1.0-fidelity position executes a tight flanking arc; the same rule with 0.3-fidelity data executes a wide sweep. This is "graceful degradation" built into the action system — and it feels intelligent. The agent adapted to its uncertainty.

---

**Robot Uprising First Playable Recommendation:** **Paradigm A with Paradigm D's action-quality scaling.** Pure buffer queries (no live fallback) with graceful quality degradation. This maximizes the buffer-design tension (full buffer isolation) while preventing the frustration of total behavioral lockdown (agents continue acting with degraded output rather than freezing). Paradigm B (live fallback) is a mid-campaign unlock.

---

## The Query Builder UI

The workbench rule editor. A rule row looks like:

```
[WHEN: trigger] → IF [buffer query] → THEN [action]
```

The buffer query panel has four stacked sections, each with a distinct visual treatment:

**Section 1 — Signal Type** (light background, large icons)
Enemy / Ally / Terrain / Order / Status. Matches Gladiabots's target type row exactly. Same icon vocabulary.

**Section 2 — Content Filters** (light background, icon grid)
Constraints about the *underlying entity*: unit class, health estimate, estimated position range. Same visual treatment as Gladiabots's filter section — checkboxes, toggles, negatable.

**Section 3 — Buffer Filters** (slightly darker blue background, labeled "ABOUT WHAT YOU KNOW")
Three controls:
- **Fidelity slider**: 0.0 to 1.0. Visual: a horizontal gradient bar that fills from white to grey as threshold increases. Default: 0.5.
- **Age limit spinner**: "Sensed within N ticks." Spinner with +/- buttons. Default: unlimited (∞).
- **Source checkboxes**: Any / Allied scouts only / Relay chain only / Direct observation only. Default: Any.

The blue background of Section 3 is a deliberate visual signal: *this section is about the quality of your knowledge, not about the thing in the world*. New players can skip it entirely (all defaults work). Intermediate players learn it instinctively. Expert players tune every field.

**Section 4 — Selector** (bottom row, dropdown)
Extended from Gladiabots:
- Closest (position in signal)
- Furthest (position in signal)
- Freshest (lowest age)
- Highest fidelity
- Lowest fidelity (for "investigate uncertain leads")
- Highest estimated threat
- Any (random from matches)

**Auto-generated sentence:**
The same Gladiabots-style human-readable sentence generates below all four sections, stitching together all active filters:

> *"Engage the freshest-data enemy Striker in buffer, confirmed within 4 ticks, fidelity above 70%, reported by ally."*

> *"Patrol toward the nearest terrain landmark in buffer, any confidence."*

> *"Retreat if any enemy in buffer with age under 2 ticks and fidelity above 50%."*

Players who can read the sentence can understand the rule. Players who can't understand the sentence can fix the rule by reading why it says what it says.

---

## Player Journeys

#### Journey: Priya, 34, UX Designer, First Week Playing

**Context:** Mission 2 ("First Contact"). Has just connected a Scout → Striker chain via a channel named `strike-net`. The Scout is patrolling. The Striker is configured with one rule: `ENGAGE [Enemy] → freshest → act`. The mission fails — the Striker never attacks despite enemies being visible to the Scout.

**Minute 0:00 — The Silent Striker**
The debrief screen shows a timeline. The Scout fires 11 hook signals on `strike-net`. Priya clicks the Striker's buffer inspection panel. At tick 12 — the moment she expected the first engagement — the buffer is empty.
*Priya: "The signals were sent. Why didn't they land?"*

**Minute 1:30 — The Fidelity Discovery**
She scrolls back to tick 1 in the debrief. The buffer still shows empty. But the channel log for `strike-net` shows signals arriving at tick 2, tick 5, tick 8...
She clicks a signal in the channel log. A tooltip pops: "This signal arrived at the Striker's buffer but was filtered by the rule's fidelity threshold (0.5). Signal fidelity: 0.42 (degraded by RELAY-COMPRESS)."
*Priya: "Oh. I have a relay in the middle that compresses. The fidelity dropped below 0.5 and my rule ignored it."*

**Minute 2:30 — The Fix Choice**
She has two options, both shown in the rule editor's "why did this rule not fire?" diagnostic panel:
- Lower the fidelity threshold on the ENGAGE rule to 0.4
- Remove the relay and let the Scout signal the Striker directly (no compression, fidelity stays 1.0)

She tries option 1 first: lowers threshold to 0.4. The Striker engages. But its accuracy is lower — she watches a flank attempt arc wide, missing the target entirely.
*Priya: "Low fidelity = imprecise. So it fires but badly."*
She tries option 2: direct Scout-to-Striker channel, no relay. The Striker engages precisely. But she only has one Scout, and now it has both hook slots occupied (one for patrol, one for the Striker channel). It can't report to anyone else.
*Priya: "Oh. The relay wasn't just a middleman. It was the fan-out point that let the signal go to multiple Strikers at once."*

**Minute 8:00 — The Architecture Trade-off**
She settles on: keep relay (for fan-out), lower fidelity threshold on ENGAGE to 0.4, but add a second rule above ENGAGE: `IF ENEMY [fidelity > 0.8] → PRECISION_STRIKE`. The striker now prefers precision shots on fresh data but falls through to area suppression on compressed data.
Mission passes.
*Priya: "The fidelity filter isn't a bug. It's the thing I configure to tell the agent what quality of information it should trust for what kind of action."*

**UI Annotations:**
- **Buffer diagnostic panel**: Accessible from debrief. Shows per-rule "why did this not fire?" annotations. Lists matched entries (if any), failed filter reasons, selected entry (if rule did fire).
- **Channel log**: Timeline row in debrief per named channel. Click any entry to see the signal's fidelity, age, source agent, and destination arrival state (accepted / rejected by buffer filter).
- **Rule "why?" indicator**: In the debrief workbench panel, rules that never fired during the mission show a small amber circle. Click the circle to see a breakdown: "fired 0/23 ticks — fidelity filter blocked 23 signals."

---

#### Journey: Marcus, 27, Backend Engineer, Intermediate Player

**Context:** Mission 4 ("Noisy Channel"). Multiple enemy types in different sectors. Marcus has learned hook chains. He wants his Strikers to behave differently depending on information quality — precision engaging on fresh direct data, area suppression on relayed/compressed data, and patrolling when they have no information at all.

**Minute 0:00 — The Three-Tier Rule Stack**
Marcus opens a Striker blueprint in the workbench. He's building a three-rule stack from highest to lowest confidence:

```
Rule 1: ENGAGE [Enemy] [fidelity > 0.85] [age < 2] → precision-strike
Rule 2: ENGAGE [Enemy] [fidelity > 0.4] [age < 6] → area-suppress
Rule 3: PATROL → nearest-landmark (no buffer filter — fires when buffer has no enemy)
```

He reads the auto-sentences:
1. *"Precision-strike the freshest high-fidelity enemy confirmed within 2 ticks."*
2. *"Area-suppress any enemy in buffer confirmed within 6 ticks."*
3. *"Patrol to the nearest terrain landmark."*

*Marcus: "This is like an SLA degradation stack. Optimal → degraded → offline. Same pattern as an API fallback chain."*

**Minute 3:00 — The Cascade in Action**
He deploys and watches. His Scouts send direct-channel signals (fidelity 1.0, age 1). Rule 1 fires — precision strikes, high kill rate. Then a Relay node in the chain gets destroyed mid-battle. Scout signals now hit the Striker through a backup relay path (fidelity 0.5, age 3). Rule 1 stops firing. Rule 2 takes over — area suppression, lower accuracy, but the Striker stays aggressive.
Then the backup relay is jammed (enemy EMP on the channel). No signals reach the Striker. Rule 3 fires — the Striker patrols rather than standing idle.

*Marcus: "It degraded exactly the way I designed it. Rule 3 isn't a failure state — it's the worst-case fallback. The Striker is never idle."*

**Minute 7:00 — The Age Window Discovery**
One Striker is area-suppressing an enemy that actually retreated 5 ticks ago. The buffer still has a stale entry (age 4, fidelity 0.6 — both within threshold). The Striker is suppressing empty space.
He tightens Rule 2: `[fidelity > 0.4] [age < 4]`. Deploys again. The stale-targeting stops.
*Marcus: "Age isn't just a quality signal. It's a staleness cutoff. I'm setting expiry on my buffer entries, effectively."*

**Minute 12:00 — The Enemy-Signal Discovery**
Later in the same mission, he notices a Striker precision-striking in the wrong direction entirely — high fidelity, age 1, but pointing at an empty corner. He checks the signal source in the buffer inspector: the signal came from channel `strike-net` but the source agent ID is unrecognized.
*Marcus: "The enemy injected a false signal onto my channel. Fidelity was spoofed at 0.9."*
He adds a source filter to Rule 1: `source IN [scout-roster]`. Rule 1 now only precision-strikes on signals from his own Scouts. Enemy-injected signals get demoted to Rule 2 territory at best.
*Marcus: "The attention language is the attack surface. And the query model is also the defense."*

**UI Annotations:**
- **Rule stack ordering**: Rules are ordered vertically in the workbench. First rule that matches the buffer fires. Visual: numbered list with "priority" label. Drag to reorder. Rule N+1 only fires if rules 1–N all fail to match.
- **Buffer inspector source field**: Hoverable field in each buffer slot row showing `source: [agent-class]-[ID]`. Unknown source IDs highlighted in amber. Tooltip: "Source not in your allied roster."
- **Channel signal source audit**: In debrief, filter the channel log by source agent. "Show only signals from Scout-East on east-net" isolates your own pipeline from injected noise.

---

#### Journey: Zara, 30, Long-Time RTS Player, Expert Campaign Player

**Context:** Mission 7 ("The Warden"). The enemy has a full intelligence-injection architecture: a Specialist dedicated to pumping high-fidelity false positional signals into her main channels. Her Strikers are precision-striking phantom positions while the real enemy flanks unmolested.

**Minute 0:00 — The Deception Analysis**
She runs Mission 7 and watches the debrief. Her Strikers fired 14 PRECISION_STRIKE actions. 11 of them: no enemy was at the targeted position. The buffer inspector shows why: 11 signals with fidelity 0.95 and age 1 — perfect-looking intelligence — but source IDs she doesn't recognize.
*Zara: "They specifically injected high-fidelity signals because that's what my rules trust most. They targeted my confidence filters."*

**Minute 3:00 — The Source Authentication Layer**
She goes to the workbench. Her current Rule 1 is `ENGAGE [Enemy] [fidelity > 0.85] [age < 2] → precision-strike`. She adds a source filter:
- Opens the source checkboxes in Section 3 of the query builder
- Deselects "Any"
- Selects "Direct observation only" + "Scout-East roster" + "Scout-West roster"

New auto-sentence: *"Precision-strike an enemy confirmed by my own Scouts or by direct observation, fidelity above 85%, within 2 ticks."*

She deploys. Enemy-injected signals no longer trigger Rule 1 — they have an unrecognized source ID. The phantom-strikes stop. But now she's not acting on anything her Scouts haven't personally reported — and the enemy has a fast flanker that her Scouts haven't caught yet.

**Minute 6:00 — The Authorized Source Problem**
She watches the debrief again. The fast flanker evades both of her Scouts' patrol routes. But her Relay — which aggregates information from multiple Scouts — spotted it twice in the buffer. The Relay is trusted by her source filter? No: the source filter says "direct observation" and "Scout roster" but not "Relay." Her Relays don't appear in the source allowlist.
*Zara: "I'm so locked down that I'm ignoring my own relay chain."*
She adds `Relay roster` to the source filter. Now she trusts: direct observation, Scouts, and Relays. Not unknown sources.

**Minute 9:00 — The Honeypot Idea**
An idea: keep an old "any source" rule as a LOWER priority fallback that handles enemy-injected signals — but routes them to a decoy action rather than a real engagement. She adds Rule 4: `ENGAGE [Enemy] [fidelity > 0.8] [any source] → DECOY_FLANK`. The enemy's injected signals trigger a Striker flank toward the phantom position — but the flank is a known ghost-chase. She's routing the deception into an intentional feint.
*Zara: "I'm using their injected signals to choreograph a feint. The enemy's intelligence operation is my tactical misdirection tool."*
This is the counter-intelligence use case fully expressed in the attention language. The query model becomes an adversarial interface.

**UI Annotations:**
- **Source roster management**: In the workbench, under Settings → Trusted Sources, player can name each "ally" roster (Scouts, Relays, Specialists) and set whether each roster counts as "trusted" for source filters. New unit blueprints auto-added to their class roster.
- **Phantom annotation in debrief**: Precision-strike actions on positions where no enemy was found get a "PHANTOM" annotation in the debrief. Bright orange label. The annotation count per action type is shown in the blueprint stats dashboard ("Scout-Direct: 1 phantom / Relay-Chain: 4 phantoms / Unknown-Source: 11 phantoms").
- **Decoy actions**: A special action type available to Strikers at mid-campaign. Looks identical to ENGAGE externally (EM noise, same motion signature) but doesn't attempt to hit anything. Used specifically for feints. Costs same energy as real ENGAGE.

---

## Strengths

**The query language is the game.** Every decision the player makes about their attention architecture is expressed as a query. Buffer size determines which queries are possible. Relay chains determine what enters the buffer. Fidelity thresholds determine what gets acted on. The query language is the unifying vocabulary for all three mechanical layers.

**The auto-sentence scales naturally.** Adding buffer filter dimensions doesn't make the auto-sentence unintelligible — it extends naturally. *"Attack the weakest enemy"* becomes *"Precision-strike the highest-threat enemy I've confirmed within 3 ticks."* The sentence teaches the new vocabulary in context.

**Maps 1:1 to real AI engineering.** RAG systems have relevance thresholds (fidelity). Retrieval from vector databases uses recency filters (age). Memory systems in agents have trusted vs. untrusted sources. The attention language is not a metaphor for these patterns — it IS them.

**Deception becomes firsthand understandable.** A player who has spent 20 minutes configuring fidelity thresholds immediately understands why a high-fidelity injected signal is dangerous. The mechanic teaches adversarial thinking about information systems — not as an abstraction but as a direct gameplay threat.

**Graceful degradation feels intelligent.** Agents that act differently on different fidelity levels feel smarter than agents that either act perfectly or don't act at all. The three-tier rule stack pattern that Marcus builds in Journey 2 is the game at its most satisfying: a system that degrades gracefully under pressure.

---

## Weaknesses

**Buffer filter section is new cognitive load.** Players coming from Gladiabots know target type, content filters, and selector. Section 3 (buffer filters) is a new layer they may not touch or may not understand. If they leave all defaults, nothing breaks — but they miss the core mechanic.

**Resolution:** The first mission where fidelity matters should produce a clearly-diagnosable buffer-miss that the debrief explains. Not a tutorial popup — a debrief that says "your rule didn't fire because of this filter, here's what that means." Teach through failure, not front-loading.

**Source filtering is complex to manage.** Who counts as trusted? What about Relays in the middle of a chain? What about a Command agent? The roster management UI can become complicated.

**Resolution:** Default "any" is almost always fine for early game. Source filtering is a Mission 5+ mechanic. The workbench should show source filter complexity only after the player has unlocked Information Warfare skills (tech tree branch).

**Age filter interacts non-obviously with relay latency.** A signal takes 1 tick per hop. A signal that left a Scout 3 hops away arrived 3 ticks later. If the rule says `age < 3`, a freshly-sensed signal from a distant Scout arrives with age 3 — at the knife edge of the threshold. Players may not initially model hop-count as contributing to signal age.

**Resolution:** The debrief "why didn't this rule fire?" panel should show: "Age at arrival: 3 ticks (sensed at tick 12, arrived at tick 15, 3 hops). Your rule requires age < 3. Consider increasing threshold or reducing hop count."

---

## Interaction Effects

**Buffer models (2.01–2.05):** Every buffer model produces different query dynamics. Fixed-slot FIFO means query results depend on eviction ordering. Weighted buffers mean high-value signals are more likely to match queries because they persist longer. Categorized buffers enable queries that explicitly target a pool (ENGAGE [Enemy from THREAT pool]). The query model is the interface to whatever buffer model is chosen.

**Signal fidelity (2.11):** Fidelity degradation from relay-compress is the main source of sub-1.0 fidelity in the first playable. The fidelity filter dimension becomes important exactly when relays are involved — which is Mission 2. This is the right pacing for introducing the mechanic.

**Deception signals (2.12):** The source filter dimension of the query model is the primary defense against deception. Aspect 2.12 should explicitly reference the query language as the mechanism for counter-intelligence. The two aspects are two sides of the same coin.

**Hook semantics (1.04d):** If blocking rendezvous hooks are used, a signal that "arrives" after a blocked hop may have stale age by the time it's delivered. Blocked agents build up undelivered signals that arrive late — and arrive with age that reflects the blocking delay, not just the hop count. The query model's age filter interacts with blocking delays in ways the player must model.

**Rules UI (3.07):** The query builder IS the rules UI for condition matching. Aspects 3.05 (rules language) and the query model are not separate — they're the same system. The query builder defines when a rule's condition matches, and the action defines what fires. Rules language expressiveness = query language expressiveness.

**Debrief as debugger (4.04a, 4.04):** The query model produces rich debrief data. Every rule evaluation leaves a trace: which buffer entries were considered, which filters rejected them, which was selected, what action fired. The debrief "why didn't this rule fire?" panel (shown in Journey 1) depends entirely on capturing this trace data during execution. The design of the query model should be co-designed with the debrief's data capture requirements.

**Information warfare / counter-intelligence (tech tree branches):** The source filter dimension is a counter-intelligence mechanic that lives entirely in the query language. No separate UI needed. The player who has learned the query model already has the vocabulary for defense. Attacking the enemy's attention architecture means injecting signals that pass their source filters — which requires knowing their architecture.

---

## Comparable Games

| Game / System | Point of Comparison |
|------|---------------------|
| Gladiabots | Origin of the query model; same three-part structure, but omniscient world-state queries |
| Robocode | Radar model: bots must explicitly scan enemies to know their position (proto buffer-awareness) |
| StarCraft Brood War | Fog of war: units can only act on what's been scouted — the analog is that your "buffer" is the explored map |
| Invisible Inc. | Information as primary resource: operating on incomplete/degraded information is the core tension |
| XCOM | Probability and confidence: should you take the 60% shot? Fidelity threshold is the formalized version of this dilemma |
| RAG pipelines (real AI) | Retrieval with relevance thresholds, recency filters, and source weighting — the exact three buffer-filter dimensions |
| Memory-augmented agents (real AI) | Context window management, memory retrieval with quality metadata — direct conceptual mapping |

---

## Sensory Description

**The query builder panel** (Section 3: Buffer Filters) has a visual language distinct from the rest of the rule editor. Sections 1 and 2 use a light grey background with standard workbench typography. Section 3 has a deep midnight-blue background (#0d1429) — noticeably different, slightly recessed. A small label in the top-left corner reads "ABOUT WHAT YOU KNOW" in 9pt circuit-glyph font, colored the game's attention-orange (#ff9040). This color only appears in attention/buffer contexts elsewhere in the UI.

**The fidelity slider** is horizontal, 120px wide. The background of the slider track is a gradient: white on the left, grey in the middle, dark grey on the right. The thumb is a small bright circle. As you drag right (raising the threshold), a label updates: "Trust only: excellent data." Drag left: "Trust: any available data." The threshold value appears numerically as you drag and disappears when you release. Muscle memory for "higher = more selective."

**The age spinner** uses a spinner wheel with +/− buttons. Background tint: a very faint orange-to-grey gradient indicating "fresh to stale." The value label reads "within N ticks" and updates as you spin. At N=∞ (unlimited), the label reads "any age" in grey italic — visually distinct from a configured threshold.

**The auto-sentence**, when buffer filters are active, shows the buffer-filter words in the attention-orange color. The rest of the sentence is white. *"Engage the freshest-data enemy Striker in buffer, confirmed within 4 ticks, fidelity above 70%."* The orange words make it immediately clear which part of the rule is about knowledge quality vs. which part is about the target type.

**The buffer miss in execution:** When a rule's query finds no matching entry, the agent's diagnostic ring (from aspect 1.06a) shows a brief "pulse-and-dim" animation — the ring brightens slightly as if considering, then dims. A small downward triangle icon appears briefly near the rule indicator on the workbench overlay. No alarm, no error sound. Just a visible "tried this, no match" signal. The player who learns to notice it can read their army's informational state from across the battlefield.

**The confidence-gated action quality:** High-fidelity engagements produce a bright, tight beam from the agent to the target — precise, purposeful. Low-fidelity engagements produce a slightly wider, dimmer beam — the agent is "pointing at approximately where the enemy probably is." The beam width is a visual encoding of fidelity. Players learn to read beam quality as information quality. The TikTok clip writes itself: two simultaneous Striker actions, one tight beam, one diffuse sweep, same rule firing at different confidence levels.

---

## The TikTok Clip

A 5-agent squad deploys. All Strikers engage with tight, precise beams. Then a relay node goes silent — you see its hook connection lines dim to grey in the always-on HUD.

Over the next 4 ticks, Striker beams gradually widen. The auto-sentence in the workbench overlay updates in real time: from "precision-strike (fidelity: 0.97)" to "area-suppress (fidelity: 0.51)."

Two more ticks: the last relay path is jammed. All signals cut. Striker beams disappear entirely. The Strikers begin patrolling — looping through waypoints, covering ground.

Text overlay: "they don't know where the enemy is. so they're looking."

Cut to the debrief. Three neat rows: PRECISION_STRIKE (relay intact), AREA_SUPPRESS (degraded relay), PATROL (no signal). Bright → amber → grey.

Text overlay: "that's not a bug. that's the design."

---

## New Aspects Discovered

- **2.10 — Signal taxonomy deep dive:** What specific signal types exist in the game world? (Threat/Enemy, Terrain/Landmark, Order/Command, Status/Ally-report, Emissions/EM-noise) — the full vocabulary determines what buffer queries can target; needs a comprehensive catalog with examples of what each type encodes and how it flows through the pipeline

- **3.05b-related — Fidelity manipulation as attack primitive:** The enemy can not only inject false signals (2.12) but can specifically craft signals with spoofed-high fidelity to bypass player confidence filters; what does the workbench UI for "fidelity authentication" look like? (Checksumming? Source signature? A Counter-Intelligence skill that verifies signal provenance before it enters the buffer?)

- **2.24 — Buffer miss fallback behaviors as a design vocabulary:** When a rule's buffer query finds no matching entry, what does the agent do? Skip (fall-through), suspend (wait one tick), defensive default (configurable fallback action), or broadcast a "need data" request to its channel? The design of buffer miss behavior is as important as the query itself — it determines agent behavior in information-starved conditions

- **2.25 — The "last known position" prediction chain:** When a positional buffer entry is too old for direct action but not yet evicted, an agent could "dead-reckon" — estimate current position from last-known + elapsed ticks + last-known velocity. Options: built-in skill, query modifier, or a Specialist unit whose entire purpose is maintaining position predictions. Where does prediction live in the architecture?

- **5.14a — The fidelity threshold as onboarding gate:** Fidelity thresholds are the mechanic that teaches players to think about information quality, not just information presence. The first mission where this matters (Mission 2 or 3) should use it as the designed teaching moment — a mission where the default threshold fails, the debrief explains exactly why, and the fix is a single slider adjustment. A "first fidelity moment" design pass.

---

*Aspect 1.06b fully documented. ~3,200 words. 3 full player journeys. 5 new aspects discovered.*
