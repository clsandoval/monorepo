# 5.14c — Fidelity Threshold as Rule Condition

**Aspect:** 5.14c — Fidelity threshold as rule condition: rules that reference fidelity threshold as a variable; "IF signal fidelity < threshold AND source = relay-B → compress before processing"; the threshold becoming part of the rule language rather than just a config parameter
**Wave:** 5 (Onboarding & Campaign)
**Category:** Campaign / Rule Language Extension
**Parent:** 5.14a — Fidelity threshold as onboarding gate (global threshold slider)
**Related:** 5.14b (per-channel fidelity thresholds), 3.05 (rules language), 3.05a (conditional prefix primitive), 2.11 (signal fidelity degradation), 5.14e (enemy fidelity spoofing), 2.01 (fixed-slot buffer), 3.07 (rules UI)

---

## The Core Problem

The fidelity threshold (5.14a) is a config parameter — a slider in the Context Config section. It operates as a binary gate: signals above the threshold enter the context window; signals below it are rejected. The per-channel variant (5.14b) makes this gate per-source. Both are powerful. Both are blunt. Neither lets the player say: "Accept this low-fidelity signal, but treat it differently."

The current architecture creates a false binary. A signal at fidelity 0.38 is either IN the context window (below the threshold) or OUT. But real decision-making under uncertainty is not binary. A military commander does not discard uncertain intelligence — they act on it with reduced confidence, request confirmation, or route it to a specialist for analysis before committing forces. A software system does not drop requests below a confidence threshold — it retries, routes to a human reviewer, applies more conservative processing, or flags for manual inspection. The circuit breaker pattern does not permanently reject a failing service — it trips, waits, half-opens, probes, and re-evaluates.

Fidelity as a rule condition bridges this gap. Instead of the config slider deciding "in or out," the player's rules decide "in, and then what." The threshold stops being a gate and starts being a variable — a readable property of each signal in the context window that the rule engine can reference like any other metadata (source, age, signal type).

This is the leap from data filtering to data-quality-aware programming. The player is no longer configuring a filter; they are writing logic that adapts its behavior based on how much it trusts its own inputs. This is the circuit breaker pattern. This is confidence-based routing. This is the real-world skill the game exists to teach.

---

## The Mechanical Design

### What Changes

Currently, the rule condition vocabulary includes:

- `buffer_has [signal_type]` — is this signal type present?
- `signal_age [signal_type] < N` — how old is this signal?
- `signal_source [signal_type] = [unit/channel]` — where did it come from?
- `buffer_count [signal_type] > N` — how many signals of this type exist?
- `buffer_fill > N%` — how full is the context window?

Fidelity as a rule condition adds:

- `signal_fidelity [signal_type] < N` — how trustworthy is this signal?
- `signal_fidelity [slot] < N` — fidelity of a specific buffer slot
- `signal_fidelity ANY < N` — does any signal fall below this value?
- `signal_fidelity ALL > N` — are all signals above this value?

The condition operates on signals that are *already in the context window*. This is the critical distinction from the threshold slider. The slider decides what enters. The rule condition decides what to do with what entered. They work at different stages of the information pipeline: ingestion (slider) vs. processing (rule).

### The Interaction with the Threshold Slider

The threshold slider and fidelity rule conditions coexist. They are not alternatives — they are complementary tools operating at different pipeline stages.

**Stage 1 — Ingestion (Threshold Slider):** The slider rejects signals below the configured minimum. Signals that pass the slider enter the context window. This is the coarse filter. It prevents context flooding and removes obviously useless data.

**Stage 2 — Processing (Rule Conditions):** Rules evaluate the fidelity of signals that passed the ingestion filter. A signal at fidelity 0.55 that passed a 0.3 threshold is now in the context window — but the rules can treat it differently from a signal at 0.92. The player can write: "IF signal fidelity of threat_detected < 0.6 → request confirmation on recon-net" vs. "IF signal fidelity of threat_detected > 0.8 → engage immediately."

This two-stage architecture mirrors real-world systems exactly. A web application has a WAF (Web Application Firewall) that blocks obviously malicious requests at the edge, and then application-level logic that evaluates the confidence/validity of requests that passed the WAF. The WAF is the threshold slider. The application logic is the rule condition.

**Can the slider be replaced entirely by rules?** Technically yes — a player could set the slider to 0.0 (accept everything) and write rules that handle all quality filtering. But this would flood the context window with garbage, consuming buffer slots and creating rule-evaluation overhead. The slider exists because pre-filtering is cheaper than post-processing. This is the same reason WAFs exist even though application code could reject bad requests. Separation of concerns is a feature, not redundancy.

### Syntax in the Rule Editor

Using the Sentence Strip paradigm (3.07, Paradigm A), a fidelity condition renders as a new token type in the condition slot:

```
┌──────────────────────────────────────────────────────────────────────┐
│  ≡  │ WHEN  [signal_fidelity ▾] [threat_detected ▾] [< 0.60 ▾]     │
│     │   →  DO [send ▾] [confirm-request ▾] [on recon-net ▾]        │  ⓘ  🗑 │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  ≡  │ WHEN  [signal_fidelity ▾] [threat_detected ▾] [> 0.80 ▾]     │
│     │   →  DO [engage ▾] [nearest ▾]                                │  ⓘ  🗑 │
└──────────────────────────────────────────────────────────────────────┘
```

The `signal_fidelity` token appears in the condition radial menu alongside existing conditions. Its icon: a small signal-strength meter (three ascending bars) in amber — visually distinct from the existing signal-type icons (which represent content) because this token represents metadata about the signal, not the signal itself.

Selecting `signal_fidelity` reveals two sub-slots: a signal type selector (which signal are we checking?) and a comparator with threshold value (< or > plus a number from 0.0 to 1.0). The threshold value sub-slot uses a tiny inline slider — 60px wide — rather than a text field, matching the visual language of the config threshold slider. The slider has the same green-to-amber-to-red gradient, the same detent positions (0.0, 0.3, 0.5, 0.8, 1.0), creating visual consistency between the config parameter and the rule condition.

Using the Conditional Prefix paradigm (3.05a), fidelity conditions integrate naturally:

```
TEST signal_fidelity threat_detected < 0.60
+ SEND confirm-request ON recon-net
+ HOLD_POSITION
− ENGAGE nearest
```

Line 1 tests fidelity. Lines 2-3 fire if fidelity is low (the + prefix): request confirmation and hold position rather than acting on uncertain data. Line 4 fires if fidelity is high (the − prefix): trust the signal and engage. The prefix model handles fidelity conditions without any syntactic extension — `signal_fidelity` is just another TEST operand.

### Fidelity Value Semantics

For rule conditions, fidelity values follow the same semantics as the threshold slider:

| Fidelity Range | Meaning | Typical Source |
|---------------|---------|----------------|
| 0.90 – 1.00 | Direct observation, 0 hops | Unit's own perception |
| 0.70 – 0.89 | 1-hop relay, fresh data | Adjacent relay forward |
| 0.50 – 0.69 | 2-hop relay, moderate degradation | Mid-range relay chain |
| 0.30 – 0.49 | 3+ hop relay, significant degradation | Long relay chain, edge-of-network |
| 0.10 – 0.29 | Heavy degradation, possibly spoofed | Deep relay chain, enemy noise zone |
| 0.00 – 0.09 | Near-garbage, noise floor | Enemy flooding, extreme degradation |

Rules can reference these ranges to implement tiered response strategies. The player is not just deciding "trust or reject" but "how much trust, and what behavior follows."

---

## The Three Canonical Patterns

Fidelity as a rule condition enables three real-world patterns that the game can teach explicitly:

### Pattern 1: The Circuit Breaker

```
TEST signal_fidelity cmd_signal < 0.50
+ IGNORE cmd_signal                    ← trip the breaker: refuse to act on degraded commands
+ SEND breaker-tripped ON status-net   ← notify the network
+ HOLD_POSITION                        ← safe fallback behavior
− EXECUTE cmd_signal                   ← breaker closed: trust and execute
```

The circuit breaker pattern: when signal quality drops below a threshold, the unit stops acting on that signal type entirely and falls back to safe behavior. It also announces the trip to the network, allowing a Command unit to reroute or resend with higher fidelity. This is not the threshold slider — the signal is *in* the context window. The unit is choosing to ignore it based on a rule, not a filter.

The real-world parallel is exact. A microservice circuit breaker trips when error rates exceed a threshold, returns fallback responses, and periodically retests. The unit's circuit breaker trips when signal fidelity drops below the rule's threshold, executes fallback behavior, and continues monitoring incoming signals for improvement.

### Pattern 2: Confidence-Based Routing

```
TEST signal_fidelity recon_report > 0.70
+ ENGAGE nearest                        ← high confidence: act directly
+ JUMP end

TEST signal_fidelity recon_report > 0.40
+ SEND verify-request ON recon-net      ← medium confidence: request verification
+ PATROL cautious_path
+ JUMP end

· SEND amplify-request ON relay-net     ← low confidence: request signal boost
· HOLD_POSITION                         ← don't act on garbage
end:
```

Three tiers of response based on signal quality. High fidelity: act immediately. Medium fidelity: request verification and proceed cautiously. Low fidelity: request the relay network to amplify/rebroadcast and wait. This is confidence-based routing — the same pattern used in ML inference pipelines where high-confidence predictions are served immediately, medium-confidence ones go to a secondary model, and low-confidence ones are routed to human review.

### Pattern 3: Quality-Aware Compression

```
TEST signal_fidelity ANY < 0.40
+ COMPRESS low_fidelity_signals         ← compress degraded signals to save buffer space
+ DEPRIORITIZE low_fidelity_signals     ← push them to the bottom of the context window

TEST signal_fidelity ALL > 0.80
+ SEND all-clear ON status-net          ← all signals are high quality: report healthy network
```

The relay uses fidelity conditions to manage its own buffer intelligently. Low-fidelity signals get compressed (saving buffer slots for higher-quality data) and deprioritized (so eviction hits them first). When all signals are high quality, the relay reports network health. This pattern teaches the player that data quality informs not just decisions but memory management — a direct analogue to tiered storage in real systems (hot/warm/cold data).

---

## Player Journeys

#### Journey: Kenji, 31, Site Reliability Engineer

**Context:** Mission 9 ("Arms Race"). Kenji has been playing for a week, completing one mission per evening. He discovered per-channel thresholds in Mission 8 and used them to harden his command channel against spoofing. He has a strong mental model of the threshold slider as a filter. He has not yet written a rule that references fidelity, because the condition type was not available until this mission.

**Minute 0:00 — The Briefing**
The Mission 9 boot log types across the screen in its familiar monospace cascade. Kenji reads: `[SUBSYSTEM UPGRADE] Rule engine: signal metadata access EXPANDED. Rules may now evaluate signal fidelity as a condition variable. Previously: fidelity was an ingestion filter. Now: fidelity is a runtime variable.` A second line: `[INTELLIGENCE] Enemy forces in this sector employ adaptive fidelity spoofing. Spoofed signals will carry fidelity scores between 0.45 and 0.75 — within the range of legitimate degraded relay traffic. Static threshold filtering is insufficient.`

Kenji sits up. The enemy is spoofing in the *ambiguous zone* — signals that look like legitimate 2-hop relay data. His per-channel thresholds from Mission 8 cannot distinguish real degraded signals from sophisticated spoofs at the same fidelity level. He needs a new tool.

**Minute 1:30 — The Rule Editor Discovery**
Kenji opens his Relay blueprint's rule editor. He clicks the condition slot on a new rule strip and opens the radial menu. A new wedge has appeared: a signal-strength meter icon in amber, labeled `signal_fidelity`. He selects it. Two sub-slots appear: a signal type selector and a fidelity comparator with the familiar inline slider. He recognizes the slider — same gradient, same detent positions as the config threshold.

He writes his first fidelity rule:

```
WHEN signal_fidelity [cmd_signal] [< 0.60] → DO [send] [verify-request] [on cmd-verify-net]
```

The info tooltip (the small i icon on the rule strip) expands: "When a command signal in the context window has fidelity below 0.60, send a verification request on cmd-verify-net." Kenji reads it and nods — the natural language expansion confirms his intent.

**Minute 3:00 — Building the Circuit Breaker**
Kenji constructs a three-rule circuit breaker on his frontline Striker:

Rule 1: `WHEN signal_fidelity [cmd_signal] [< 0.50] → DO [hold_position]`
Rule 2: `WHEN signal_fidelity [cmd_signal] [> 0.50] AND [signal_source] [= cmd-net] → DO [execute] [cmd_signal]`
Rule 3: `WHEN [no_signal] → DO [patrol] [default_path]`

The Striker will hold position if it receives a command with low fidelity, execute commands only when both fidelity and source check out, and patrol if it has no commands at all. The priority ordering matters: the safety rule (hold on low fidelity) is at the top, so it fires first. The execute rule is below — it only fires if the safety rule did not match.

Kenji drags Rule 1 to the top of the list. The drag animation plays — the strip lifts slightly with a shadow effect, other strips slide apart smoothly to create a gap, and the blue insertion line glows at the top position. He drops it with a soft thunk.

**Minute 5:30 — The Sealed Watch**
EXECUTE. The battlefield loads — an urban grid map (Cebu province). Kenji's architecture deploys: Scouts forward, Relays mid-field, Strikers in staggered positions. During sealed watch, he watches the signal chains light up — colored dashed lines crisscrossing the board. At tick 4, enemy spoofing begins. His Striker's context bar twitches — a command signal arrives at fidelity 0.52. On the rule evaluation panel visible in the post-battle Inspector (but invisible now during sealed watch), Rule 2 would fire: fidelity above 0.50 and source is cmd-net. The Striker moves.

But at tick 7, a spoofed command arrives at fidelity 0.48. Rule 1 fires: the Striker holds position. On the board, the unit's tile emits a brief amber pulse — the visual language for "rule matched but did not produce movement." The Striker stands firm while the spoofed command tries to lure it into an ambush. Three ticks later, the enemy striker that was waiting at the lure position is flanked by Kenji's second Striker approaching from the opposite direction.

**Minute 8:00 — The Inspector Reveal**
Post-battle, Kenji opens the Inspector and clicks his frontline Striker at tick 7. The decision trace shows:

```
Rule 1: WHEN signal_fidelity cmd_signal < 0.50 → HOLD_POSITION
  ✓ MATCHED: cmd_signal in slot 3, fidelity 0.48
  → ACTION: hold_position
Rule 2: WHEN signal_fidelity cmd_signal > 0.50 AND source = cmd-net → EXECUTE
  ○ SKIPPED: Rule 1 matched first (priority)
```

Kenji sees the causal chain. The spoofed command was at 0.48 — just below his 0.50 fidelity condition. If he had set the condition at 0.45, it would have slipped through. The margin was two hundredths of a fidelity point. He adjusts the rule to 0.55 for the next run, widening the safety margin at the cost of occasionally delaying legitimate degraded commands.

**UI Annotations:**
- `signal_fidelity` condition token: amber signal-meter icon, new wedge in condition radial, position 7 o'clock
- Inline fidelity slider: 60px wide, same gradient as config slider, appears inside rule strip condition zone
- Decision trace: hierarchical indent, green check for matched rule, gray circle for skipped, fidelity value highlighted in the color corresponding to its position on the green-amber-red gradient
- Amber pulse on unit tile: 200ms pulse, 40% opacity amber overlay, triggered when a rule matches but produces hold/ignore behavior

---

#### Journey: Rina, 24, UX Design Student

**Context:** Mission 9. Rina has been playing slowly, spending most of her time in the Inspector studying how her configurations affect behavior. She used the global threshold in Missions 6-7 and briefly tried per-channel thresholds in Mission 8 but found the multiple sliders overwhelming. She set them back to global and solved Mission 8 by shortening her relay chains instead. She prefers architectural solutions over parameter tuning.

**Minute 0:00 — Reading the Boot Log**
Rina reads the upgrade notice about fidelity as a rule condition. She pauses at "fidelity is a runtime variable." She reads it twice. Her reaction: "Wait, so instead of filtering signals out, I can let them in and write rules about how good they are?" She opens the Blueprint Codex and finds the new entry for `signal_fidelity` under the Conditions category. The codex card shows a worked example:

```
Example: Confidence-based routing
IF signal_fidelity recon_report > 0.70 → engage immediately
IF signal_fidelity recon_report > 0.40 → request verification
ELSE → hold and wait for better data
```

Rina reads the example and immediately connects it to her UX coursework on progressive disclosure in search results — showing high-confidence results first, with low-confidence results available behind a "more results" click.

**Minute 2:00 — The Cautious Architecture**
Rina opens her Relay blueprint. She lowers the config threshold slider from 0.5 to 0.2 — she wants the Relay to accept more signals, including degraded ones, because the rules will handle the quality assessment. This is a deliberate trade-off: wider ingestion, smarter processing.

She writes two rules on the Relay:

Rule 1: `WHEN signal_fidelity [ANY] [< 0.40] → DO [compress] [low_fidelity]`
Rule 2: `WHEN signal_fidelity [recon_report] [> 0.60] → DO [forward] [recon_report] [on recon-net]`

The Relay now compresses low-fidelity signals (saving buffer space) and only forwards high-fidelity recon reports. Degraded recon at 0.45 stays in the Relay's buffer as compressed data — available if a Command unit queries the Relay directly, but not broadcast to the wider network.

**Minute 4:30 — The Discovery: Tiered Forwarding**
Rina realizes she can create a three-tier forwarding system. She adds a third rule between the existing two:

Rule 1: `WHEN signal_fidelity [ANY] [< 0.30] → DO [compress]` (garbage compression)
Rule 2: `WHEN signal_fidelity [recon_report] [> 0.30] [< 0.60] → DO [forward] [on low-priority-net]` (uncertain reports on a secondary channel)
Rule 3: `WHEN signal_fidelity [recon_report] [> 0.60] → DO [forward] [on recon-net]` (confident reports on the primary channel)

She has invented confidence-based routing without knowing the term. Her Relay now operates as a quality-aware router: garbage gets compressed, uncertain data gets forwarded on a secondary channel (where units can choose whether to listen), and confident data goes on the primary channel. She drags the rules into priority order — garbage compression first (defensive), then the two forwarding tiers.

On the board's ghost preview, the Relay's channel output visualization changes: two outgoing channel lines instead of one, with different colors. The primary recon-net line is bright green; the low-priority-net line is dim amber. The visual tells the story: two tiers of output, two levels of trust.

**Minute 7:00 — Sealed Watch**
EXECUTE. During sealed watch, Rina watches her Relay at the center of the board. Signal lines arrive from Scouts — some bright (high fidelity), some dim (degraded). The Relay processes them visibly: bright signals produce green outgoing flashes on recon-net. Dim signals produce amber outgoing flashes on low-priority-net. The dimmest signals produce no outgoing flash — they are compressed internally, visible only as a brief contraction of the Relay's context bar (the bar momentarily shrinks as the compressed signal replaces the raw one with a smaller footprint).

Her frontline Striker, listening on recon-net, acts on confident recon. Her backline Command, listening on both recon-net and low-priority-net, builds a fuller picture — it has the uncertain data too, but in a separate channel that its own rules treat with appropriate skepticism.

**Minute 9:30 — The Inspector Deep Dive**
After victory, Rina opens the Inspector and clicks her Relay at tick 6. The context window shows 8 entries: three at fidelity 0.7+, two at 0.45-0.55, three at 0.15-0.28. The decision trace for that tick:

```
Rule 1: WHEN signal_fidelity ANY < 0.30 → COMPRESS
  ✓ MATCHED: slots 6, 7, 8 (fidelity 0.15, 0.22, 0.28)
  → ACTION: compressed 3 signals → 1 summary entry
Rule 2: WHEN signal_fidelity recon_report > 0.30 < 0.60 → FORWARD on low-priority-net
  ✓ MATCHED: slots 4, 5 (fidelity 0.45, 0.52)
  → ACTION: forwarded 2 signals on low-priority-net
Rule 3: WHEN signal_fidelity recon_report > 0.60 → FORWARD on recon-net
  ✓ MATCHED: slots 1, 2, 3 (fidelity 0.88, 0.74, 0.71)
  → ACTION: forwarded 3 signals on recon-net
```

Three rules, three tiers, eight signals sorted. Rina screenshots the decision trace — she is going to use this in her UX portfolio to explain confidence-based information architecture.

**UI Annotations:**
- Low-priority-net channel: auto-created when Rina typed the name in the hook config, appears on the channel map panel as a new amber line
- Compressed signal visual: context bar momentary contraction (150ms shrink, 100ms expand to new size), brief amber particle burst at the Relay's tile edge
- Tiered forwarding on ghost preview: two outgoing channel lines from Relay, green (primary) and amber (secondary), thickness proportional to expected signal volume
- Decision trace: three-rule cascade with slot references, fidelity values color-coded on the green-amber-red gradient

---

#### Journey: Ade, 17, Competitive Gladiabots Player

**Context:** Mission 9, second attempt. Ade cleared Mission 8 on his first try using aggressive per-channel thresholds. He failed Mission 9's first attempt because the enemy's adaptive spoofing adjusted to his static thresholds — spoofed signals were calibrated to sit just above his per-channel threshold on cmd-net. He needs dynamic quality assessment, not static filtering.

**Minute 0:00 — The Problem Analysis**
Ade opens the Inspector from his failed run. He clicks his Striker at the moment it executed a spoofed command. The decision trace shows the spoofed signal at fidelity 0.72 — just above his cmd-net per-channel threshold of 0.70. His static threshold let it through. The signal's source trace reveals it originated from an enemy Relay, not his Command unit. But the source check rule was below the execute rule in priority, so it never fired.

Ade's competitive instincts kick in. He needs rules that check fidelity AND source simultaneously. Neither the threshold slider nor per-channel thresholds support compound conditions. Only rule-level fidelity conditions, combined with existing source conditions, can express what he needs.

**Minute 1:30 — The Compound Condition**
Using the conditional prefix model (he switched to it after Mission 5 because it felt more like programming), Ade writes:

```
TEST signal_fidelity cmd_signal < 0.85
+ TEST signal_source cmd_signal != command-alpha
  + IGNORE cmd_signal                 ← low fidelity AND wrong source = definitely spoofed
  + SEND spoof-alert ON status-net   ← alert the network
+ TEST signal_source cmd_signal = command-alpha
  + SEND verify-request ON cmd-verify ← low fidelity but right source = degraded, verify
  + HOLD_POSITION

TEST signal_fidelity cmd_signal > 0.85
+ EXECUTE cmd_signal                  ← high fidelity = trust
```

This is a nested conditional prefix chain. The first TEST checks fidelity. If low (+ prefix), a second TEST checks source. If the source is wrong, the signal is spoofed — ignore it and alert. If the source is correct, the signal is legitimately degraded — request verification and wait. If fidelity is high, trust and execute.

Ade has constructed a two-dimensional decision matrix: fidelity on one axis, source identity on the other. Four quadrants: (high fidelity, right source) = execute; (high fidelity, wrong source) = execute (high fidelity spoofs are rare and expensive for the enemy); (low fidelity, right source) = verify; (low fidelity, wrong source) = reject.

**Minute 3:30 — The Honeypot Refinement**
Ade adds a dedicated Relay listening on all channels with threshold 0.0 — his honeypot from Mission 8, now upgraded. The honeypot's rules:

```
TEST signal_fidelity ANY < 0.30
+ LOG suspicious_signal              ← track all low-fidelity noise
+ TEST signal_source ANY != allied
  + SEND confirmed-spoof ON alert-net ← low fidelity + enemy source = confirmed spoof
```

The honeypot accepts everything, analyzes it by fidelity and source, and broadcasts confirmed spoof alerts. Other units can write rules that listen for spoof-alert signals and react accordingly — a network-wide immune response triggered by a sentinel node.

**Minute 5:00 — The Optimized Architecture**
EXECUTE. During sealed watch, Ade's architecture performs a layered defense. The honeypot Relay absorbs all incoming signals. When a spoofed command arrives at fidelity 0.65 from an enemy source, the honeypot fires a spoof-alert. His frontline Striker receives both the spoofed command and the spoof-alert in the same tick. The Striker's rules check: "IF spoof-alert in buffer AND cmd_signal fidelity < 0.85 → IGNORE cmd_signal." The compound condition catches the spoof. The Striker holds position.

At tick 11, a legitimate command from his Command unit arrives at fidelity 0.78 (degraded by two relay hops). The Striker's rule checks fidelity (0.78 < 0.85) and source (command-alpha — correct). The verify pathway activates. A verification request goes out. Two ticks later, the Command resends at amplified fidelity (0.93). The Striker executes. The delay cost two ticks, but the Striker is alive.

**Minute 7:30 — The Score Optimization**
Ade clears the mission and immediately replays for score optimization. He tightens his fidelity thresholds: the rule condition on the Striker drops from 0.85 to 0.80 (accepting more commands without verification, gaining speed at the cost of spoof risk). He runs statistical analysis in the Inspector: across the full run, 23 commands arrived, 4 were spoofs (all below 0.72), 19 were legitimate (lowest at 0.68). He sets the fidelity condition to 0.75 — the exact midpoint between the highest spoof and lowest legitimate signal. Maximum speed, zero false positives for this particular enemy configuration.

He knows this optimal threshold is mission-specific. A different enemy pattern would require different tuning. This is the competitive depth: finding the optimal fidelity boundary for each enemy configuration, like finding the optimal build order in StarCraft.

**UI Annotations:**
- Conditional prefix nesting: indented lines in the rule editor, each + or − prefix renders with a small chevron showing its dependency on the parent TEST
- Honeypot Relay: uses the 0.0 threshold on all channels, context bar permanently red (full), but rules manage the flow
- Spoof-alert signal: custom signal type created by the LOG + SEND combination, appears in the signal taxonomy as a player-defined alert
- Inspector statistical view: Ade accesses a histogram overlay showing fidelity distribution of all received signals across the run, with spoofed vs. legitimate signals color-coded (red vs. green). Available from the Inspector's channel metrics panel

---

## Strengths

1. **Expressiveness leap.** The threshold slider is a single number. Per-channel thresholds are N numbers. Fidelity as a rule condition is a *function* — it composes with other conditions, operates at arbitrary granularity, and produces different behaviors for different fidelity ranges. The expressiveness increase is not linear but categorical: from configuration to programming.

2. **Teaches the circuit breaker pattern.** The circuit breaker is one of the most important patterns in distributed systems engineering. Fidelity-conditional rules are a direct, tactile analogue. The player who builds a fidelity-based circuit breaker in Robot Uprising has learned the pattern for production software — not as an abstraction but as a lived experience of watching their unit survive because it refused to act on bad data.

3. **Teaches confidence-based routing.** Rina's three-tier forwarding system is exactly how ML inference pipelines work: high-confidence results served directly, medium-confidence routed to secondary models, low-confidence escalated to humans. The game teaches this without ever saying the words "machine learning" or "inference pipeline."

4. **Natural extension of existing systems.** Fidelity is already a visible metadata field in the context window. The rule language already supports metadata conditions (source, age). Adding fidelity as a condition variable is a natural vocabulary extension, not a new system. The vocabulary density cost (5.04b) is minimal: one new condition type using existing UI paradigms.

5. **Creates adaptive architectures.** Static thresholds produce static behavior. Fidelity-conditional rules produce units that adapt to the information environment in real-time — trusting when trust is warranted, verifying when uncertain, refusing when suspicious. This is the difference between a firewall and an immune system.

6. **Enables compound anti-spoofing.** Neither the threshold slider nor per-channel thresholds can express "low fidelity AND wrong source." Only rule-level conditions support compound checking. This makes fidelity conditions the counter-tool to the enemy's escalating spoofing sophistication — the arms race driver for Missions 9-10.

---

## Weaknesses

1. **Rule complexity escalation.** Fidelity conditions add a new axis to every rule. A player who previously wrote 4-6 rules per unit might now write 8-12, with fidelity branches doubling the rule count for every behavior that needs quality-aware variants. The rule editor UI (3.07) must scale to handle this — scrollable rule lists, collapsible rule groups, and the vertical space cost on the workbench all become more pressing.

2. **Debugging depth.** When a fidelity condition causes unexpected behavior, the Inspector must show not just "which rule matched" but "what was the fidelity of the signal that the rule evaluated, and was that fidelity accurate or spoofed?" The causal chain grows: action ← rule match ← fidelity check ← signal fidelity value ← relay hop count ← source observation quality. Each link is a potential point of confusion.

3. **False precision trap (escalated).** The per-channel threshold already risks over-tuning (5.14b weakness 5). Fidelity in rules amplifies this: a player might write rules with fidelity thresholds at 0.47, 0.53, and 0.61, micro-optimizing for a specific enemy pattern. When the enemy changes behavior, all the tuned thresholds become wrong simultaneously. The game should discourage hyper-specific fidelity values through visual cues — the rule editor could show a "brittleness warning" when fidelity conditions are within 0.10 of each other.

4. **Threshold slider confusion.** With fidelity available in both the config slider and the rule language, players may be confused about which tool to use, or may set contradictory policies (slider at 0.6, rules checking for fidelity below 0.4 — which will never match because the slider already rejected those signals). The game must clearly communicate the pipeline stages: "the slider decides what enters; the rules decide what to do with what entered." The Inspector should visualize this pipeline during replay.

5. **Late introduction timing.** Fidelity conditions require understanding of the threshold slider (Mission 6-7), per-channel thresholds (Mission 8), the rule language (Mission 4+), and compound conditions. This puts the earliest viable introduction at Mission 9. With only two missions remaining (9-10), there is limited campaign time to teach the mechanic and test mastery. The mechanic may feel rushed unless Mission 9 is specifically designed around it.

6. **Interaction opacity with buffer pressure.** A rule that compresses low-fidelity signals (Pattern 3) changes the buffer composition, which affects subsequent rule evaluations in the same tick. If three low-fidelity signals are compressed into one summary, the buffer now has two extra slots — which might allow new signals to enter, which might have their own fidelity values that trigger other rules. The cascading interaction between fidelity-conditional compression and buffer fill is non-obvious and hard to debug.

---

## Interaction Effects

### With Per-Channel Thresholds (5.14b)

Per-channel thresholds and fidelity rule conditions operate at different pipeline stages, but the player must understand both simultaneously. A channel with a per-channel threshold of 0.3 admits signals with fidelity 0.3-1.0. Rules then evaluate those signals against finer-grained fidelity conditions. The compound effect: the per-channel threshold sets a floor per source, and the rules implement tiered behavior above that floor.

The risk: the player sets a per-channel threshold of 0.5 on recon-net and writes a rule "IF signal_fidelity recon_report < 0.40 → compress." That rule will never fire — signals below 0.5 were already rejected by the per-channel threshold. The Inspector should detect this contradiction and surface it as a diagnostic: "Rule 3 on RELAY-B references fidelity < 0.40, but recon-net threshold is 0.50 — this rule can never match."

The positive interaction: together, they create a two-stage quality pipeline. The threshold slider is the bouncer at the door (cheap, fast, coarse). The rule condition is the internal security team (expensive, precise, nuanced). The architecture mirrors real-world defense-in-depth: edge filtering + application-level validation.

### With Fidelity Spoofing (Enemy Tactic, 5.14e)

Fidelity conditions are the designed counter-escalation to fidelity spoofing. Mission 8 introduced spoofing; Mission 9 provides the tool to fight it. The arms race:

- **Mission 6-7:** Player learns threshold slider. Enemy floods with low-fidelity noise. Slider blocks it.
- **Mission 8:** Enemy spoofs at medium fidelity (0.45-0.65). Per-channel thresholds help but cannot distinguish legitimate degraded signals from spoofs in the same fidelity range.
- **Mission 9:** Enemy spoofs at adaptive fidelity (calibrated to the player's threshold). Fidelity rule conditions enable compound checks (fidelity + source) that the slider cannot express.
- **Mission 10:** Enemy employs source-spoofed high-fidelity signals (the most sophisticated attack). The player must combine fidelity conditions with signal chain verification — checking not just fidelity and source but the *path* the signal traveled.

Each escalation motivates the next defensive tool. The teaching arc is driven by adversarial pressure, not tutorial popups.

### With Buffer Pressure

Fidelity conditions interact with buffer pressure in two directions:

**Defensive:** Rules that compress or deprioritize low-fidelity signals reduce buffer pressure, preventing context overload. This is the quality-aware buffer management pattern (Pattern 3).

**Offensive (by the enemy):** An enemy that knows the player uses fidelity conditions can craft signals at exactly the fidelity level that triggers the most expensive rule path. A signal at fidelity 0.51 (just above the "verify" threshold) forces the player's unit to send a verification request, consuming a hook slot and a tick of latency. The enemy wastes the player's processing budget without triggering the "reject" path. This is the equivalent of a slowloris attack — not overwhelming the system but exhausting its resources through legitimate-looking requests.

### With the Teaching Arc

The fidelity-condition teaching arc follows the game's established pattern of problem → tool → mastery:

| Mission | Problem | Tool | Pattern Taught |
|---------|---------|------|---------------|
| 6-7 | Signal flooding | Threshold slider | Basic filtering |
| 8 | Heterogeneous channels | Per-channel thresholds | Trust-per-source |
| 9 | Adaptive spoofing | Fidelity rule conditions | Circuit breaker, confidence routing |
| 10 | Full adversarial | All tools combined | Defense-in-depth |

Mission 9 is the pivot point where the player transitions from "configuring filters" to "programming quality-aware behavior." This is the moment the game reveals its deepest real-world parallel: the difference between setting a spam threshold and writing rules that understand why something might be spam.

---

## Comparable Games

### Gladiabots — Conditional Logic on Signal Properties

Gladiabots' visual programming language lets players write conditions that reference enemy distance, ally count, health level, and shield status. These are the same conceptual category as fidelity conditions — metadata about the game state that drives behavioral branching. Gladiabots' key lesson: conditions on continuous variables (distance, health) create richer behavior than conditions on discrete states (enemy_present / enemy_absent). Robot Uprising's fidelity is a continuous variable (0.0-1.0), and making it a rule condition follows the same expressiveness pattern. Gladiabots' weakness: the visual programming interface becomes unwieldy with 15+ conditions per bot. Robot Uprising must learn from this — the sentence strip and conditional prefix approaches keep rule lists linear and scannable even at scale.

### Screeps — Code-Level Confidence Checks

Screeps players write JavaScript that checks creep memory, room threat levels, and source reliability before committing to actions. Common patterns include:

```javascript
if (source.confidence > 0.7) { harvest(source); }
else { scout(source.room); }
```

This is exactly fidelity-conditional routing written in code. Screeps teaches the pattern through programming literacy; Robot Uprising teaches it through visual rule composition. The advantage of the visual approach: the pattern is visible, inspectable, and debuggable without reading code. The disadvantage: the visual approach caps expressiveness where Screeps' JavaScript is unbounded.

### Factorio — Circuit Network Conditions

Factorio's circuit network allows per-entity conditions: "enable this inserter IF iron-plate signal > 100." The condition references a signal value — analogous to referencing fidelity. Factorio's progressive disclosure is instructive: circuit conditions are invisible until the player connects a wire. The first wire reveals the condition panel. Similarly, Robot Uprising's fidelity condition should be invisible in the rule radial menu until the player has experienced the threshold slider — the condition type unlocks after the prerequisite mechanic is learned.

Factorio's circuit conditions can reference any signal type with any comparator (>, <, =, !=). Robot Uprising's fidelity conditions should follow the same model: `signal_fidelity [type] [comparator] [value]`. The grammar is identical; the domain is different (logistics vs. information warfare).

### Real-World: Feature Flags and Confidence-Based Routing

Production ML systems implement exactly this pattern. A model serving pipeline checks prediction confidence:
- Confidence > 0.9: serve directly
- Confidence 0.5-0.9: route to ensemble model for second opinion
- Confidence < 0.5: route to human reviewer

The fidelity rule condition is this pipeline expressed as game rules. Players who learn the pattern in Robot Uprising will recognize it immediately when they encounter feature flag systems (LaunchDarkly), circuit breakers (Hystrix/Resilience4j), or ML confidence routing in professional contexts. The game vocabulary — `signal_fidelity`, comparator, tiered action — maps 1:1 to the professional vocabulary: `prediction_confidence`, threshold, routing tier.

---

## Sensory Description

### The Fidelity Condition Token in the Rule Editor

When the player selects `signal_fidelity` from the condition radial menu, the new token slots materialize with a brief crystallization animation — pixels assembling from scattered particles into the token shape over 200ms, as though the condition is constructing itself from raw data. The signal type sub-slot renders as a colored pill matching the signal taxonomy (amber for threat, green for recon, purple for command). The comparator sub-slot shows a tiny inline slider with the fidelity gradient — green at left, amber in the middle, red at right. As the player drags the comparator slider, the token's background subtly shifts color to match the fidelity range being tested: a rule checking `< 0.30` has a faintly reddish background tint; a rule checking `> 0.80` has a faintly greenish background tint. This color-coding makes fidelity rules scannable at a glance — a rule list with multiple fidelity conditions shows a visual gradient from "cautious red rules" at the top to "confident green rules" at the bottom.

### Fidelity Evaluation During Sealed Watch

During sealed watch, fidelity-conditional rules produce a distinctive visual cue when they evaluate. The standard rule-match flash (a brief cyan pulse on the unit tile) is modified for fidelity conditions: the pulse color matches the fidelity value of the signal being tested. A rule matching a 0.85-fidelity signal produces a green-tinted pulse. A rule matching a 0.35-fidelity signal produces a red-tinted pulse. A rule matching a 0.55-fidelity signal produces an amber pulse. The player cannot see which specific rule fired during sealed watch, but they can see the *quality of information* driving each decision by the pulse color.

At the fleet level, this creates a battlefield-wide heatmap effect. Units processing high-fidelity data pulse green. Units processing degraded data pulse amber. Units receiving spoofed or garbage data pulse red. The player watches their network's trust landscape in real-time — a healthy architecture shows a gradient from green (near the Scouts) through amber (at the Relays) to green again (at the Strikers receiving compressed, quality-filtered signals). A failing architecture shows red pulses spreading from the enemy's spoofing zone.

### Audio Cues

- **Fidelity condition match (high fidelity):** A clean, bright click — like a camera shutter confirming a focused shot. Short, confident, crisp.
- **Fidelity condition match (medium fidelity):** A softer, slightly dampened click — the same camera shutter but recorded through fabric. Something is slightly off. Not alarming, but not crisp.
- **Fidelity condition match (low fidelity):** A grainy buzz-click — the camera shutter mixed with a brief burst of static. The player hears "this unit is acting on dubious data" before they see the consequences.
- **Circuit breaker trip (hold_position triggered by low fidelity):** A two-tone descending chime — F4 to C4 on a muted vibraphone — followed by a soft electronic hum. The hum persists for the tick duration, subtly audible beneath other sounds, signaling "this unit is in safe mode." The hum ceases when the next tick starts and the unit re-evaluates.
- **Spoof-alert broadcast:** A sharp, metallic ping — like tapping a small bell once — followed by a quick three-note ascending sequence (C4-E4-G4 on a synthetic whistle). The ascending sequence suggests "heads up" — an alert propagating through the network. It is brief (400ms total) and cuts through the ambient battlefield sound.

### The Inspector: Fidelity Condition Trace

When the player clicks a unit in the Inspector and expands the decision trace for a tick where a fidelity condition fired, the trace panel shows the fidelity check as a visual inline element. The signal's fidelity value is rendered as a horizontal bar — the same green-amber-red gradient — with a small arrow marker at the tested threshold position and the signal's actual fidelity position marked with a diamond. If the signal passed the condition, the bar segment between the threshold marker and the signal diamond is highlighted in green. If it failed, the segment is highlighted in red. This miniature bar chart is embedded directly in the decision trace text, inline with the rule description — so the player reads "Rule 1: WHEN signal_fidelity cmd_signal < 0.50 [▰▰▰▰▰◆▰▰▰▰] → HOLD_POSITION" and the bar shows the fidelity value's position relative to the threshold at a glance.

The diamond marker on the bar pulses once when the player hovers over it, and a tooltip shows: "Signal fidelity: 0.48 | Threshold: 0.50 | Margin: 0.02 below." The margin display is critical for tuning — the player immediately sees how close the signal was to passing and can adjust their rule's threshold value with precision.

---

## The TikTok Clip

**15-second clip:** A Striker receives a command. Its tile flashes — but the flash is amber, not green. The unit holds position. Text overlay: **"It doesn't trust the order."** Cut to the Inspector: the decision trace zooms in, showing `fidelity: 0.48 < threshold: 0.50 → HOLD`. Cut back to the battlefield: the position where the command would have sent the Striker explodes — enemy ambush. The Striker is still standing. Text overlay: **"Teach your robots to doubt."** Final shot: the player adjusting the fidelity slider in a rule strip, the inline gradient bar shifting from red toward green. **"Fidelity is a variable, not a setting."**
