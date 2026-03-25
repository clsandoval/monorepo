# Weight Configuration Review Prompt on Campaign Chapter Transitions

**Aspect:** 4.90 — Weight configuration review prompt on campaign chapter transitions: when entering a new chapter, an optional prompt asks "your pre-ranking weights were saved in Chapter 2 — mission patterns have changed, do you want to review your diagnostic priors?"; temporal configuration hygiene as a campaign mechanic; prevents stale priors silently degrading performance

**Parent:** 4.63 — Player-configurable pre-ranking weights
**Siblings:** 4.88 — Adaptive weight suggestion from divergence history; 4.89 — Weight preset import/export as config string; 4.91 — Visual weight interpolation animation; 4.92 — Per-mission-type weight performance heatmap
**Prerequisites:** Player must have unlocked configurable weights (4.63 unlock gate — 3+ divergence events) and completed at least one chapter boundary (Mission 4 to Mission 5, or Mission 7 to Mission 8).
**Related:** 4.64 — Pre-ranking accuracy as displayed stat; 4.58 — Pre-ranking transparency panel; 4.88 — Adaptive weight suggestion; 4.89 — Weight preset import/export; 8.08 — Real-language vocabulary claim; 8.09 — Diagnostic layer as teaching arc

---

## The Core Concept

The campaign has three chapters with distinct mission character. Chapter 1 (Missions 1-4) is the tutorial arc: hand-configured, pre-placed units learning context, rules, hooks, and skills one concept at a time. Chapter 2 (Missions 5-7) introduces the factory, blueprints, channels, command agents, and production tuning. Chapter 3 (Missions 8-10) is full-system warfare: factory-versus-factory, cascading emergent complexity, everything live at once.

A player who carefully tunes their pre-ranking weights during Chapter 1 has optimized for a specific problem shape: small unit counts, isolated mechanic demonstrations, predictable enemy patterns. Those weights encode assumptions about the diagnostic landscape. When they cross into Chapter 2 and suddenly face factory production, channel wiring, and resource management, the diagnostic landscape shifts fundamentally. Pivot-activity patterns change because there are more moving parts. Recency signals change because factory missions run longer with more configuration churn. Volatility patterns change because command agents introduce cascading state changes that were impossible in the tutorial.

If the player does nothing, their Chapter 1 weights silently apply to Chapter 2 problems. Pre-ranking accuracy may degrade and the player may not understand why their QUICK mode is suddenly less reliable. They might blame the diagnostic system itself rather than recognizing that their configuration assumptions drifted out of alignment with the environment.

This is the exact failure mode that configuration review gates prevent in professional engineering. When a deployment moves from dev to staging, the infrastructure is different: different resource limits, different network topology, different failure modes. Environment variables set for development (verbose logging, relaxed timeouts, local database URLs) will not merely underperform in staging — they may cause silent correctness failures. The deployment checklist that asks "have you reviewed your configuration for this environment?" exists because configuration drift across environment boundaries is one of the most common sources of production incidents.

Robot Uprising's chapter transition prompt teaches this discipline explicitly. The prompt does not force the player to change anything. It asks them to *look*. The act of reviewing is the lesson, not the act of adjusting.

---

## The Prompt Design

### When It Appears

The prompt triggers at two specific moments:

1. **Chapter 1 to Chapter 2 boundary** — After completing Mission 4, before loading Mission 5. The factory is about to be introduced. Mission patterns are about to shift from isolated-mechanic tutorials to integrated-system challenges.
2. **Chapter 2 to Chapter 3 boundary** — After completing Mission 7, before loading Mission 8. Full-system warfare begins. Everything the player has learned is now simultaneously active.

The prompt does NOT appear on every mission boundary — only on chapter boundaries. This is deliberate. Mission-to-mission transitions within a chapter represent incremental complexity increases, not fundamental environment shifts. Prompting on every mission would train the player to dismiss the prompt reflexively (the "are you sure?" fatigue problem). Restricting it to chapter boundaries preserves the signal: when this prompt appears, something genuinely changed.

### What It Shows

The prompt appears as a modal overlay on the campaign map, positioned centrally, with the Philippine archipelago visible but dimmed behind it. It is styled as a system diagnostic notice — not a warning, not an error, but a maintenance advisory.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ◈ CONFIGURATION REVIEW — ENVIRONMENT CHANGE DETECTED                │
│                                                                      │
│  Your pre-ranking weights were last configured during Chapter 1.     │
│  Mission patterns have changed. Key differences:                     │
│                                                                      │
│  ▸ Factory production introduces sustained config churn (recency     │
│    signals will fire more frequently)                                │
│  ▸ Multi-agent coordination increases pivot-activity noise            │
│  ▸ Command-layer decisions create new volatility patterns             │
│                                                                      │
│  Current weights: PA:55  R:30  V:15                                  │
│  Chapter 1 accuracy: 78%                                             │
│                                                                      │
│  Do you want to review your diagnostic priors?                       │
│                                                                      │
│  [Review Weights]           [Keep Current Config]                    │
│                                                                      │
│  ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈  │
│  This prompt appears at chapter boundaries when mission              │
│  patterns shift. You can always adjust weights in the                │
│  Inspector during any mission.                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Critical Design Details

**The bullet points are specific, not generic.** The prompt does not say "things have changed." It tells the player *what* changed and *why it matters for their weights*. Each bullet maps a game-mechanical change to a weight axis consequence. This is the difference between a useful deployment checklist ("PostgreSQL connection pooling limits are 20 in staging, not unlimited") and a useless one ("please review your database settings").

**Current weights are displayed inline.** The player sees their actual numbers without having to remember or navigate elsewhere. This is the "current state" half of a diff — you cannot review configuration without seeing what it currently is.

**Chapter accuracy is displayed.** The player's pre-ranking accuracy across the chapter they just completed provides context. If accuracy was 90%, the player has reason to keep their config. If accuracy was 55%, the prompt's suggestion to review feels timely and warranted.

**The footer explains recurrence.** The small text at the bottom educates the player that this is a chapter-boundary event, not a random interruption, and that manual adjustment is always available. This manages expectations and prevents the player from feeling locked out of configuration changes between prompts.

### What Happens on Each Choice

**Review Weights:** The modal fades and the pre-ranking weight panel opens (the same transparency drawer from 4.63/4.58), pre-scrolled to the weight sliders. The player adjusts or inspects at their leisure. When they close the panel, Mission 5 (or 8) loads normally. No additional prompt. The review happened.

**Keep Current Config:** The modal fades with a brief confirmation: "Current configuration retained. You can review weights anytime in the Inspector." Mission 5 (or 8) loads immediately. The player's weights are untouched. A small "Configuration unchanged since Chapter 1" indicator appears in the weight panel for the remainder of the chapter — a passive reminder, not an interruption, visible only when the player opens the panel themselves.

**If the player has not yet unlocked configurable weights (fewer than 3 divergence events by Mission 4 completion):** The prompt does not appear. The player is still using default weights and has not earned the configuration literacy that makes this prompt meaningful. The system silently carries defaults forward. This is correct — prompting an unconfigured player to review configuration they have never touched is meaningless noise.

---

## Player Journeys

#### Journey: Dana, 31, DevOps Engineer

Dana has been meticulous about pre-ranking weights since unlocking them in Mission 2. She tuned pivot-activity high (70) and recency low (10) because tutorial missions have stable configs and the most diagnostic signal comes from which components are actively involved in failures. She finished Chapter 1 with 85% pre-ranking accuracy. She is proud of this number.

**Minute 0:00 — Campaign Map, Mission 4 Complete**
Dana clicks the next mission marker on Cebu. The campaign map dims. The configuration review modal slides in from the bottom with a subtle mechanical whir sound — a servo engaging, not an alarm. She reads the header: "CONFIGURATION REVIEW — ENVIRONMENT CHANGE DETECTED."

**Minute 0:15 — Reading the Diff**
Her eyes track the bullet points. "Factory production introduces sustained config churn (recency signals will fire more frequently)" — she pauses. Her recency weight is 10. That was deliberate: in the tutorial, configs barely changed between sessions, so recency was noise. But if factory missions involve ongoing production tuning, configs will change constantly. Recency goes from noise to signal.

**Minute 0:30 — The Review**
She clicks "Review Weights." The transparency drawer opens. She sees PA:70, R:10, V:20. She drags recency from 10 to 35, watching the weight normalization redistribute. PA drops to 52, V stays proportionally at 13. She pauses, considers, decides to see how it feels. Closes the panel.

**Minute 0:45 — Mission 5 Begins**
Mission 5 loads. The factory is introduced. Dana's adjusted weights catch recency-relevant diagnostic candidates that her old configuration would have buried. Her first QUICK analysis in the new chapter ranks correctly. She feels the prompt earned its interruption.

**UI Annotations:**
- Modal entrance: 400ms slide-up from bottom edge, background dims to 30% opacity
- Servo-engage sound: mechanical, brief, non-alarming — the sound of a system checkpoint, not an error
- "Review Weights" button: primary style (filled, orange-dark), left-positioned to be the default read path
- "Keep Current Config" button: secondary style (outlined, neutral), right-positioned as the opt-out
- Weight panel opens with the Chapter 1 accuracy stat highlighted in amber at the top: "Your accuracy across Chapter 1: 85%"

---

#### Journey: Marcus, 24, History Student

Marcus has been playing casually. He unlocked weight configuration but only fiddled with the sliders briefly, leaving them near defaults (PA:33, R:33, V:33). His Chapter 1 accuracy was 62% — he was not paying close attention to diagnostic tuning. He found the tutorial chapters interesting for the narrative and tactical puzzles, not the diagnostic meta-layer.

**Minute 0:00 — Campaign Map, Mission 4 Complete**
The review modal appears. Marcus reads the header. "Configuration Review." He glances at the bullet points — factory production, multi-agent coordination, volatility patterns. The words register conceptually but he does not have a strong mental model of why his current weights would be wrong. His accuracy was 62%, which he did not know was low.

**Minute 0:08 — Dismissal**
He clicks "Keep Current Config." The modal fades. "Current configuration retained." Mission 5 loads. He does not think about this moment again.

**Minute 12:00 — Mission 5, Second Attempt**
Marcus has failed Mission 5 once. On his second attempt, during the Inspector phase, he notices his QUICK mode pre-ranking is consistently wrong — the candidate it ranks #1 is never the one THOROUGH identifies as the minimum fix. He opens the weight panel and sees the small indicator: "Configuration unchanged since Chapter 1." The phrase clicks. He remembers the prompt. He realizes the prompt was trying to tell him something specific: the environment changed, and his configuration did not change with it.

**Minute 13:00 — Belated Review**
He adjusts recency upward, reduces pivot-activity. His next QUICK analysis is more accurate. The prompt's pedagogical payload delivered late, but it delivered. The "Configuration unchanged since Chapter 1" indicator was the slow-burn reminder that converted dismissal into learning.

**UI Annotations:**
- "Configuration unchanged since Chapter 1" indicator: small, muted text below the weight sliders in the transparency drawer — gray, not amber, not red. It is informational, not scolding. Font size 12px, italic.
- The indicator disappears permanently once the player makes any weight adjustment in Chapter 2
- No "I told you so" moment — the game never references the dismissed prompt. The indicator speaks for itself.

---

#### Journey: Priya, 28, ML Engineer

Priya has deep intuition for hyperparameter tuning from her professional work. She configured weights aggressively in Chapter 1: PA:80, R:5, V:15. She reasoned that tutorial missions with pre-placed units have almost no config churn, so recency is irrelevant, and pivot-activity dominates because the tutorial isolates one mechanic at a time — the active component is almost always the diagnostic focus. Her Chapter 1 accuracy was 92%. She knows exactly why her weights work.

**Minute 0:00 — Campaign Map, Mission 4 Complete**
The review modal appears. Priya reads it carefully. She has done this before — reviewing hyperparameters when the data distribution shifts. The bullet points describe a distribution shift: more churn, more noise on the pivot-activity axis, new volatility patterns from command agents. She understands the implications immediately.

**Minute 0:20 — Deliberate Retention**
She clicks "Keep Current Config." This is not Marcus's casual dismissal. This is a deliberate bet. She wants to see *how much* her accuracy degrades with Chapter 1 weights in a Chapter 2 environment. She is running an experiment. She knows she can adjust after Mission 5 with real data instead of theoretical predictions about what the environment shift will do.

**Minute 8:00 — Mission 5, Inspector Phase**
Her QUICK accuracy drops to 71%. She expected this. She opens the weight panel, sees "Configuration unchanged since Chapter 1," and adjusts: PA:45, R:35, V:20. The recency bump reflects the factory's sustained config churn. The pivot-activity reduction accounts for multi-agent noise on that axis. She saves this as a preset: "FactoryTuned" and exports the config string `RU:1|PA:45,R:35,V:20|FactoryTuned` to share in her gaming Discord.

**Minute 8:30 — Validation**
Mission 6 runs with the new weights. QUICK accuracy climbs to 84%. She has empirically validated the chapter transition hypothesis. The prompt did not change her behavior in the moment — but it framed the question she was already asking herself, which is the prompt's real job.

**UI Annotations:**
- Export string (4.89 interaction): the config string includes weight values but not chapter context. A player importing Priya's `FactoryTuned` preset does not know it was tuned for Chapter 2. This is a design feature, not a bug — the preset name carries the intent, the string carries the values. The recipient must evaluate whether the intent applies to their context. This mirrors how dotfile configs work: you import someone's `.vimrc` and adapt it, not adopt it blindly.
- Career stats (interaction): Priya's accuracy-over-time graph in career stats will show a visible dip at the Chapter 1/Chapter 2 boundary, followed by recovery. This is the "distribution shift" pattern that ML engineers recognize. The game visualizes it without labeling it.

---

## Strengths and Weaknesses

### Strengths

**Teaches environment-transition configuration hygiene.** The single most transferable lesson in this aspect. Every deployment pipeline, every ML training run, every infrastructure migration has a moment where you should ask "does my configuration still match my environment?" Most junior engineers learn this after a production incident. The prompt teaches it before the incident.

**Respects player agency completely.** The prompt is skippable. It does not force adjustment. It does not penalize dismissal. It does not even track whether the player reviewed. It asks a question and accepts any answer. This is the correct posture for a configuration review gate — coercive reviews breed resentment and checkbox-checking, not actual review.

**Provides specific, actionable context.** The bullet points explain *what changed* and *why it matters for weights*, not just "things changed." This is the difference between a deployment checklist that says "review database settings" and one that says "connection pool limits differ between environments, verify your pool size."

**Two chapter boundaries, not ten mission boundaries.** The prompt fires twice in the entire campaign. This is surgical restraint. It preserves the signal value of the prompt — when it appears, it means something genuinely shifted.

### Weaknesses

**Interruption at a high-momentum moment.** The player just completed a chapter. They are excited to see what comes next. A modal overlay asking them to think about configuration is a momentum break. The prompt is asking the player to shift from "achievement celebration" mode to "maintenance review" mode. Some players will resent this tonal shift regardless of the prompt's content.

**Two occurrences may not be enough to build a habit.** The prompt appears exactly twice. Behavioral research suggests that habits require more repetition than that. The player may learn the lesson intellectually without internalizing the practice. Counter-argument: the prompt is not trying to build an in-game habit. It is planting a seed for a real-world practice. Two well-timed, high-context prompts may be more effective than ten rote ones.

**The bullet points assume the player understands weight semantics.** If the player unlocked weights but never developed a mental model of what pivot-activity, recency, and volatility mean, the bullet points are jargon. "Recency signals will fire more frequently" means nothing to a player who does not know what recency signals are. This is partially mitigated by the prerequisite gate (3+ divergence events), but divergence events do not guarantee comprehension.

**No before/after preview.** The prompt shows current weights and chapter accuracy, but it does not show what the weights *should* be for the new chapter. It cannot — the correct weights for Chapter 2 depend on the player's diagnostic strategy, which is personal. But the absence of a recommendation may leave some players feeling the prompt identified a problem without offering a solution. The adaptive suggestion system (4.88) partially addresses this, but 4.88 requires 10+ divergence events and may not have triggered yet at the Chapter 1/Chapter 2 boundary.

---

## Interaction Effects

### With Adaptive Suggestions (4.88)

If the player has accumulated 10+ divergence events by the Chapter 1/Chapter 2 boundary (possible for thorough players who replay missions), the review prompt and the adaptive suggestion may co-occur. The review prompt opens the weight panel; the adaptive suggestion card is already waiting inside it. This is a powerful combination: the prompt says "your environment changed, review your config," and the suggestion says "here is a data-driven recommendation for what to change." The prompt provides the *why* (environment shift), the suggestion provides the *what* (specific slider adjustment). Together they model the full configuration review workflow: detect the need, then act on data.

If the player has fewer than 10 divergence events (more common), the review prompt stands alone. The player must rely on the bullet-point context and their own judgment. This is appropriate — not every config review comes with an automated recommendation. Sometimes you review the checklist and decide based on experience.

### With Preset Import/Export (4.89)

The chapter transition is a natural moment for preset management. A player who has saved a Chapter 1 preset might create a new preset for Chapter 2 after reviewing. The export string (4.89) then carries implicit chapter context in its name: `RU:1|PA:45,R:35,V:20|FactoryTuned`. Community discussions can organize presets by chapter: "here are my Chapter 2 weights" becomes a recognizable sharing pattern.

The review prompt also creates a natural import moment. A player entering Chapter 2 for the first time might search community channels for "Chapter 2 weight presets" and import one. The prompt's bullet points give them the vocabulary to evaluate imported presets: "this preset has high recency, which makes sense because the prompt said factory missions have more config churn."

### With Career Stats

Career stats track pre-ranking accuracy over time. The chapter transition creates a visible inflection point in the accuracy timeline. Players who adjusted weights at the boundary will show smooth accuracy across the transition. Players who dismissed the prompt will show a dip-then-recovery pattern (if they adjust later) or a sustained decline (if they never adjust). The career stats graph becomes a retrospective artifact of the chapter transition decision — visual proof that configuration review matters at environment boundaries.

### With the Teaching Arc (8.09)

The chapter transition prompt is a capstone moment in the teaching arc for diagnostic configuration. The arc progresses: unlock weights (4.63) -> see accuracy (4.64) -> adjust based on experience -> receive chapter transition prompt -> internalize that configuration is not set-and-forget but environment-dependent. The prompt is where the teaching arc shifts from "how to configure" to "when to reconfigure." This is the operational maturity layer — the difference between knowing how to use a tool and knowing when to reassess your use of it.

---

## Comparable Games and Real-World Parallels

**Civilization's era transitions.** When advancing to a new era in Civilization, the game does not ask "have you reviewed your government policies?" — but it probably should. Era transitions often make existing policies suboptimal (e.g., early-game militaristic policies becoming wasteful in a peaceful mid-game). Civilization players learn this the hard way. Robot Uprising's prompt makes the lesson explicit rather than leaving it to painful discovery.

**RPG "rest and resupply" moments.** Final Fantasy games place save points and shops before boss fights. This is not just generosity — it is a configuration review gate. "You are about to enter a new challenge context. Have you reviewed your equipment, abilities, and item loadout?" The chapter transition prompt serves the same function for diagnostic configuration. The difference is that RPG shops offer purchases (new options), while the weight review prompt offers reflection (re-evaluation of existing options).

**"Are you sure?" anti-patterns.** The most common failure mode in review prompts is the "are you sure?" dialog that appears so frequently it becomes invisible. Windows UAC prompts, cookie consent banners, email unsubscribe confirmations — all trained users to click "yes" reflexively. Robot Uprising's prompt avoids this by (a) appearing only twice, (b) containing novel, specific information each time, and (c) not being a confirmation of a destructive action but an invitation to reflect.

**PR review gates.** In software engineering, pull request reviews are mandatory configuration review gates: before code (configuration of system behavior) deploys to a new environment (the main branch), a human reviews the diff. The chapter transition prompt is a self-review gate — the player is both the author and the reviewer of their own configuration. The prompt provides the diff context (what changed in the environment) that makes self-review possible.

**ML hyperparameter review on distribution shift.** When training data distribution shifts (concept drift, covariate shift), ML practitioners must review and potentially retune hyperparameters. Learning rates, regularization strengths, and batch sizes optimized for one distribution may be suboptimal or harmful for another. The chapter transition prompt teaches this practice: your "hyperparameters" (weights) were tuned for one "distribution" (Chapter 1 mission patterns), and the "distribution" is about to shift (Chapter 2 mission patterns).

**Deployment environment checklists.** The most direct parallel. Production deployment checklists at companies like Google, Stripe, and Amazon include explicit "configuration review" sections: verify environment variables, review feature flags, check connection strings, validate resource limits. The chapter transition prompt is Robot Uprising's deployment checklist, condensed to a single focused question about the configuration most likely to drift.

---

## Sensory Description

### Visual Treatment

The modal appears over the campaign map, which dims to 30% opacity. The modal itself uses the game's system-diagnostic visual language: dark background (#1a1d1a), thin border in a cool blue-gray (#5a7a8a) — not orange (action), not red (danger), not amber (warning). The color says "system notice" — informational, not urgent. The header icon (a small diamond, the same glyph used in the pre-ranking transparency panel) establishes visual continuity with the weight configuration UI the player already knows.

The bullet points use a subtle indented format with small triangular markers. Each bullet fades in sequentially (200ms stagger) rather than appearing all at once, creating a brief reading rhythm that encourages the player to actually read each point rather than scanning past a wall of text.

The current weights are displayed in a monospaced font — the same font used in config strings (4.89) — reinforcing the visual association between weights and configuration artifacts.

### Animation

The modal slides up from the bottom of the screen over 400ms with a slight deceleration curve (ease-out). This is slower and more deliberate than a standard dialog pop-in. The slowness is intentional — it says "this is not a reflex prompt, this is a considered moment." The background dim happens simultaneously.

When the player clicks "Review Weights," the modal does not disappear instantly. It slides down and the weight panel slides in from the right in an overlapping 300ms transition, creating visual continuity between "the prompt told you to review" and "here are the weights to review."

When the player clicks "Keep Current Config," a small checkmark appears next to the button for 200ms, then the modal fades out over 300ms. The checkmark confirms the choice was registered — important for a prompt where "dismiss" is a valid answer, not a mistake.

### Sound

The modal's entrance is accompanied by a brief mechanical sound — a servo engaging, a latch clicking into place. Two notes, maybe three: a low tone followed by a slightly higher one. The sound communicates "system checkpoint" without communicating "alarm" or "error." It is the sound of a machine pausing its own process to verify state before continuing.

No sound on dismiss. No sound on "Review Weights." The entrance sound is the only audio cue — it marks the moment of interruption, not the moment of decision. The decision is the player's, and the game does not editorialize on it with audio feedback.

### Screen Position

Center-screen, vertically offset slightly above true center (40% from top rather than 50%). This positions the modal in the natural first-read zone for a screen the player is actively watching. The campaign map's next mission marker is visible below the modal, dimmed but present — a visual reminder of what comes next, grounding the prompt's relevance. The player can see where they are going and understand why the prompt is asking them to pause.

The modal is approximately 60% of screen width and 55% of screen height — large enough to contain all information without scrolling, small enough to not feel like a full-screen takeover. It is a waypoint, not a destination.
