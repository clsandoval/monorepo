# Visual Weight Interpolation Animation When Switching Presets

**Aspect:** 4.91 — Visual weight interpolation animation when switching presets: when the player selects a different named preset, the three slider thumbs animate to their new positions over 500ms in sequence (pivot first, recency second, volatility third); the results list reshuffles during the animation; tactile preset switching that makes weight-change legible as motion; memory aid for what each preset "feels like"

**Parent:** 4.63 — Player-configurable pre-ranking weights
**Siblings:** 4.88 — Adaptive weight suggestion from divergence history; 4.89 — Weight import/export as config string; 4.90 — Weight configuration persistence across campaign chapters; 4.92 — Per-mission-type weight performance heatmap
**Prerequisites:** Player must have unlocked configurable weights (4.63 unlock gate — 3+ divergence events) and saved at least two named presets (otherwise there is nothing to animate between).
**Related:** 4.58 — Pre-ranking transparency panel; 4.64 — Pre-ranking accuracy as displayed stat; 6.02 — Audio design (kulintang-based sonic vocabulary); 8.08 — Real-language vocabulary claim ("tuning a heuristic"); 4.61 — QUICK vs. THOROUGH explainer

---

## The Core Concept

Preset switching without animation is a teleport. The sliders snap to new values, the results list rearranges, and the player sees "before" and "after" with no in-between. The transition is instantaneous and illegible — the player cannot see *which weights moved* or *how far they moved*. They see a different results order and must reconstruct what changed by reading numbers. This is the equivalent of a hard cut in film: effective but emotionally flat, and it obscures the relationship between the two states.

**The interpolation animation turns a hard cut into a dissolve.** When the player selects a different preset from the dropdown, each slider thumb travels from its current position to its new position at a human-readable pace. The three thumbs move in sequence — pivot-activity first, then recency, then volatility — with a slight overlap. The results list reshuffles continuously during the animation, not after it. The player watches the rank order shift as each weight dimension changes, and they can see which weight change caused which reordering.

This is not decoration. It is a **legibility mechanism**. A player who switches from "Stable Config" (PA:70, R:0, V:30) to "Active Iteration" (PA:40, R:50, V:10) sees: the pivot-activity thumb slides left (from 70 to 40), and the results list begins to shift — candidates with high pivot-activity scores drop. Then the recency thumb slides right (from 0 to 50), a dramatic motion, and the list reshuffles more violently — candidates with high recency scores jump upward. Finally the volatility thumb slides left (from 30 to 10), a smaller motion, and the list settles into its final order with minor adjustments.

The player doesn't need to read the numbers. They *see* the motion. They *feel* which weight changed the most (recency — the biggest thumb displacement). They *watch* the results respond to each weight in isolation before the next weight begins its transition. The animation decomposes the preset switch into three legible sub-operations.

**Why this matters for learning:** The weight sliders teach that pre-ranking is a configurable belief system (4.63). But switching presets by snapping values teaches nothing — it says "here's a different belief system" without showing the journey between them. The interpolation animation shows the journey. The player sees their belief system *transform* from one configuration to another, and the consequences of each intermediate state play out on the results list in real time. This is the difference between reading a recipe and watching someone cook.

---

## Animation Specification

### Timing and Curve

**Total duration:** 500ms for the full three-slider sequence.

**Per-slider timing:**
- Pivot-activity: begins at 0ms, ends at 250ms (250ms travel time)
- Recency: begins at 120ms, ends at 370ms (250ms travel time)
- Volatility: begins at 240ms, ends at 490ms (250ms travel time)

The overlap is deliberate — each slider begins before the previous one has fully settled, creating a cascading waterfall effect rather than three discrete steps. The 120ms stagger is long enough for the player to perceive each slider beginning its motion independently, short enough that the full sequence feels like one fluid gesture.

**Easing curve:** Critically-damped spring with a natural frequency of ~12 Hz and a damping ratio of 1.0. This produces motion that accelerates quickly off the starting position (the thumb "leaves" with urgency), decelerates smoothly into the target (no overshoot, no oscillation), and arrives with a sense of precision. Spring physics were chosen over cubic bezier easing because the arrival feel matters: a cubic ease-out can feel like the thumb is "gliding to a stop" — pleasant but vague. A critically-damped spring feels like the thumb is being *placed* at the exact target value — precise, mechanical, calibrated. The pre-ranking weight panel is a control surface, not a toy. The motion should feel like adjusting a well-engineered instrument, not dragging a browser scrollbar.

**Why not underdamped spring (with overshoot)?** An underdamped spring would make the thumb bounce past the target and settle back — playful, juicy, the kind of motion you see in iOS toggle switches. But overshoot on a numerical slider is misleading. If the target is PA:40 and the thumb briefly passes through PA:35 before settling at 40, the results list would momentarily reflect a PA:35 state that isn't the intended destination. The player would see a results order that doesn't correspond to either the source or destination preset. Overshoot creates phantom intermediate states. Critically-damped avoids this.

**Why not linear interpolation?** Linear motion (constant velocity) feels robotic and cheap. It has no acceleration, no deceleration — the thumb moves at the same speed from start to finish and then stops abruptly. Linear interpolation is the motion equivalent of a system beep: functional, characterless, forgettable.

### Sequence Order: Pivot, Recency, Volatility

The order is not alphabetical. It is pedagogical.

**Pivot-activity moves first** because it is the most architecturally fundamental signal — it answers "what was active when the match turned?" This is the first question in any diagnostic process. Seeing it move first reinforces its primacy. Players who have internalized the diagnostic arc (8.09) expect pivot-activity to be the first consideration.

**Recency moves second** because it is the most volatile weight in practice — players adjust recency more than any other weight (per the design in 4.63, the most common first adjustment is zeroing recency when the player hasn't changed configs recently). Placing recency second means it moves during the "middle" of the animation, when the player's attention is most engaged. The largest visual displacement typically occurs here (recency swings the widest between presets), making the most dramatic motion happen at the moment of peak attention.

**Volatility moves last** because it is the subtlest signal and typically has the smallest weight delta between presets. It serves as a settling gesture — the animation's final motion is small, gentle, and the results list makes its last minor adjustments. The sequence ends on a quiet note, like a musical phrase resolving.

### Results List Behavior During Animation

**Option A: Real-Time Continuous Reshuffle**

The results list reranks continuously as the slider values change frame-by-frame during the animation. Cards slide vertically to their intermediate positions at each animation frame (~16ms intervals at 60fps). The rank numbers on each card update in real time. Score chips show intermediate values.

This option is maximally legible — the player sees *exactly* how each weight change affects the ranking at every moment. But it is also visually busy. With 20+ candidates visible, the continuous motion creates a "waterfall" of moving cards that can be overwhelming, especially on the first encounter.

**Option B: Fade-and-Replace**

The results list fades to 30% opacity at the start of the animation and fades back to 100% at the end, with the new order in place. The animation of the sliders is the primary visual event; the results list defers to a single clean transition.

This option is visually clean but pedagogically weak — the player sees the sliders move but doesn't see the *consequence* of each slider's motion on the results. The causal link between "pivot-activity decreased" and "candidate X dropped two ranks" is severed.

**Option C (Recommended): Staged Reshuffle with Damping**

The results list reshuffles at three discrete moments — once at the end of each slider's travel — not continuously. When the pivot-activity slider reaches its target (250ms), the results list performs a single reshuffle animation (cards ease to new positions over 120ms). When recency reaches its target (370ms), a second reshuffle. When volatility settles (490ms), a final minor reshuffle.

This produces three legible reshuffle events, each causally linked to a specific weight change. The player sees: "pivot-activity changed → these candidates moved. Recency changed → these candidates moved more. Volatility changed → minor adjustments." Three cause-effect pairs instead of continuous blur.

The card motion during each reshuffle uses the same critically-damped spring curve as the slider thumbs. Cards that move a large distance (jumping from rank #8 to rank #2) travel faster than cards that move one position. This creates a visual hierarchy: dramatic rank changes are visually dramatic. Minor rank changes are subtle.

Rank number chips (the small "01", "02", "03" in the upper-left corner of each card) use a number-roll animation — the old number counts to the new number over 80ms, like a mechanical counter. Score chips (e.g., "0.84") similarly count to their new values. The counting animation is synchronized with the card's vertical motion.

### Interruptibility

**Can the player click another preset mid-animation?** Yes. The animation is interruptible. If the player selects "Noise Hunter" while the sliders are still traveling from "Stable Config" to "Active Iteration," the animation seamlessly redirects: each slider's target changes to the Noise Hunter values, and the spring dynamics recalculate from the slider's current intermediate position. There is no "reset and restart" — the thumb curves toward the new destination from wherever it currently is. This creates a smooth redirect that feels like changing your mind mid-sentence, not like canceling and starting over.

The results list responds to the most recently completed slider positions. If the pivot-activity slider has already reached its Active Iteration target but recency is mid-transit when the player switches to Noise Hunter, the next reshuffle reflects the completed pivot-activity value and the redirected recency value. No phantom states.

**Can the player grab a slider thumb during the animation?** Yes. Touching a slider thumb during its animated travel immediately cancels the animation on that slider only — the other sliders continue their animated travel. The grabbed thumb becomes manually controlled. This means the player can "hijack" the animation mid-stream, creating a hybrid configuration: the preset's pivot-activity and volatility values, but a manually chosen recency value. The preset name in the dropdown changes to "Custom (modified)" to reflect that the player diverged from the preset.

---

## Player Journeys

#### Journey: Tomás, 34, Backend Engineer

**Minute 0:00 — First Preset Switch**

Tomás has two saved presets: "Stable Config" (PA:70, R:0, V:30) and "Active Iteration" (PA:40, R:50, V:10). He's been using Stable Config for three sessions. Tonight, he modified his config heavily between sessions and wants to switch to Active Iteration before running QUICK mode.

He clicks the preset dropdown above the Run Analysis button. The dropdown opens — two presets listed. He clicks "Active Iteration."

The first slider begins to move. The pivot-activity thumb — the amber diamond — slides leftward from 70 to 40. It accelerates quickly, decelerates precisely, and arrives at 40. The percentage label counts down: 70, 65, 58, 50, 44, 41, 40. The fill on the amber rail dims as the thumb retreats. Tomás watches this and absorbs: "pivot-activity is going down."

Before the pivot thumb has fully settled, the recency thumb — the teal clock — begins its motion. From 0 to 50. This is the big move. The thumb accelerates across the full width of the track, the teal rail lighting up behind it like a runway. The percentage label counts up: 0, 8, 17, 28, 36, 43, 48, 50. The results list reshuffles after the pivot thumb settles — cards slide vertically, SCOUT-B rises from #3 to #1, RELAY-C drops from #1 to #4. Tomás sees the reshuffle happen and knows: the pivot-activity decrease caused it.

Then the recency thumb arrives at 50, and the list reshuffles again — more dramatically. SCOUT-B, which was recently modified, leaps to a commanding #1 with a gap over #2. Candidates that haven't been touched in weeks plummet. Tomás sees this second reshuffle and connects it: "recency just became the dominant signal."

The volatility thumb slides from 30 to 10, a small leftward motion. The list barely moves — one card trades places with its neighbor. The animation settles.

Total elapsed time: half a second. But Tomás absorbed three distinct events. He knows what Active Iteration "looks like" — it de-emphasizes pivot-activity, heavily promotes recency, and barely considers volatility. He didn't read those numbers off a panel. He watched them happen.

**Minute 1:30 — Building Muscle Memory**

Three sessions later, Tomás switches between his two presets before every QUICK mode run. He's developed a habit: if he changed configs recently, Active Iteration. If he hasn't, Stable Config. Each time he switches, the animation plays.

He no longer watches the animation consciously. But he has developed an instinct for what each preset "feels like" in motion. Switching to Stable Config feels like the recency thumb *retreating* — a leftward motion on the teal track that he perceives peripherally as "recency going quiet." Switching to Active Iteration feels like the recency thumb *advancing* — a rightward motion, teal lighting up, the list reshuffling hard.

The animation has become a kinesthetic signature for each preset. Tomás doesn't think "PA:70, R:0, V:30" — he thinks "the one where recency goes dark." The motion replaced the numbers as the mental model.

**Minute 4:00 — Using Animation to Compare**

Tomás creates a third preset: "Balanced" (PA:33, R:33, V:33). He wants to see how the three presets produce different results on the same mission. He clicks through the presets rapidly: Stable Config → Active Iteration → Balanced → Stable Config.

Each switch plays the animation. The rapid switching creates a visual flicker of slider positions, but the results list is the real show — he can see the rank-1 candidate change with each preset. Stable Config surfaces RELAY-C. Active Iteration surfaces SCOUT-B. Balanced surfaces STRIKER-A (a candidate that scores moderately on all three signals). Three different #1 results from three different diagnostic philosophies, and the animations show *why* — which sliders moved the most to get each result.

He lingers on this discovery. The pre-ranking isn't finding "the answer." It's finding an answer that depends on what you believe matters. Three presets, three answers, three animations showing three different belief journeys.

**UI Annotations:**
- Preset dropdown position: compact pill-shaped selector above Run Analysis button, showing current preset name
- Animation total duration: 500ms, interruptible
- Slider thumb shapes: amber diamond (pivot), teal clock (recency), violet waveform (volatility)
- Results list reshuffle: three staged events at 250ms, 370ms, 490ms, cards ease with spring physics
- Rank chip animation: number-roll over 80ms per reshuffle event
- Score chip animation: number count-to-target over 80ms

---

#### Journey: Priya, 28, Competitive Player, Gauntlet Prep

**Minute 0:00 — Rapid Preset Comparison Under Time Pressure**

Priya has six presets saved. She's 90 seconds from a Gauntlet match and wants to pick the right diagnostic strategy for a relay-heavy mission. She needs to compare presets quickly.

She clicks through four presets in rapid succession: "Pivot-First" → "Relay Chain" → "Noise Hunter" → "Churn-First." Each click fires the animation, but since she's clicking faster than the 500ms animation duration, the sliders are constantly being redirected mid-travel. The pivot thumb begins moving toward Pivot-First's value, then curves toward Relay Chain's value before arriving at the first target. The motion is fluid — the spring dynamics handle the redirection gracefully — but the results list is in constant flux. Cards are shuffling, settling, then shuffling again before they've fully arrived.

She feels the friction. The animation, designed for legibility at single-switch pace, becomes a hindrance at competitive speed. She wants instant transitions — click preset, see result, click next preset, see result.

**Minute 0:20 — The Speed Toggle**

She hits Shift+Click on the next preset. The animation skips — sliders snap to their new positions, results list performs a single instant reshuffle. She found the bypass. (The Shift modifier is documented in the tooltip that appears when hovering the preset dropdown: "Shift+click for instant switch.")

She rapid-fires through the remaining presets with Shift+Click. "Relay Chain" puts DISPATCH-OMEGA at rank #6. "Noise Hunter" puts it at #4. "Pivot-First" puts it at #11. She picks Noise Hunter for this match.

**Minute 1:30 — Post-Match Slow Comparison**

After the Gauntlet match (she won), Priya returns to the pre-ranking panel in a reflective mode. She wants to understand *why* Noise Hunter surfaced DISPATCH-OMEGA higher than the other presets. She switches between Noise Hunter and Pivot-First slowly, watching the animation play at full speed.

The animation reveals it: switching from Pivot-First (PA:85, R:10, V:5) to Noise Hunter (PA:15, R:15, V:70), the volatility thumb makes the dramatic rightward journey — from 5 to 70, nearly the full track width. The results list reshuffle after the volatility thumb settles is the one that pushes DISPATCH-OMEGA upward. DISPATCH-OMEGA has moderate volatility (0.44) but very low pivot-activity (0.21). Under Pivot-First, its low pivot score buries it. Under Noise Hunter, the pivot score barely matters and the volatility score carries it to rank #4.

Priya sees the volatility thumb's dramatic rightward sweep and thinks: "that movement IS the reason DISPATCH-OMEGA surfaced. The volatility signal is doing all the work." The animation made the causal mechanism visible.

**UI Annotations:**
- Shift+Click bypass: instant preset switch, no animation, documented in dropdown tooltip
- Redirect behavior during rapid switching: spring dynamics recalculate from current position, no snap-to-start
- Competitive players expected to discover and use Shift+Click within first 3 rapid-comparison sessions
- Animation serves learning; bypass serves speed; both are valid interaction modes

---

#### Journey: Marcus, 45, Casual Gamer, Evening Play

**Minute 0:00 — Accidental Discovery**

Marcus has two presets but has never switched between them in the same session. He's been using "Balanced" exclusively. Tonight, he accidentally clicks "Pivot-First" in the dropdown while trying to click Run Analysis (the dropdown and the button are vertically adjacent).

The sliders begin to move. Marcus watches, surprised. The amber diamond slides rightward (pivot-activity increasing from 33 to 80). The teal clock slides leftward (recency decreasing from 33 to 15). The violet waveform slides leftward (volatility decreasing from 33 to 5).

He didn't intend this, but the motion catches his eye. The results list reshuffles after the pivot thumb settles — candidates active at the pivot tick rise, others fall. He notices the rank-1 candidate changed.

**Minute 0:15 — The "Oh" Moment**

Marcus clicks back to "Balanced." The animation plays in reverse — the amber diamond retreats, the teal clock advances, the violet waveform returns. The results list reshuffles back to approximately its original order. (Not exactly — the staged reshuffle introduces rounding effects, but the top-3 candidates are the same.)

He switches to Pivot-First again. The animation replays. Same motions: amber forward, teal backward, violet backward. Same results reshuffle. The same #1 candidate surfaces.

Marcus is doing something he hasn't done before: he's *experimenting with the pre-ranking*. The animation made the switch reversible and legible. He can toggle between presets and watch the results respond. He's not reading weight values or understanding the math. He's watching motion and connecting it to consequences.

**Minute 1:00 — Naming the Feel**

Marcus doesn't think in terms of PA:80. He thinks: "the preset where the amber one goes way to the right." The animation gave him a spatial-kinesthetic handle for the preset. When he tells his friend about it later, he says: "there's this mode where the orange slider goes all the way over and it changes which fix comes up first." His mental model is the motion, not the numbers.

**Minute 2:00 — Resolution**

He runs QUICK mode with Pivot-First selected. Gets a different candidate than usual. Applies it. Pass rate improves by 4 points more than his typical result. He's intrigued but doesn't investigate further tonight.

The animation served as an on-ramp. Marcus was not ready to engage with weight configuration through numbers and percentages (as shown in his 4.63 journey, where he was flustered by slider manipulation). But watching the animation of a preset switch gave him a non-numerical way to understand that presets do different things. The motion was the lesson.

**UI Annotations:**
- Dropdown proximity to Run Analysis button: close enough for accidental activation, which becomes a discovery vector
- Reverse animation on preset-switch-back: same spring physics, same sequence order, reverse direction
- Casual players internalize presets as motion patterns, not numerical configurations
- No tooltip or tutorial needed — the animation itself is the tutorial

---

## Strengths

**Makes weight changes perceptible as physical motion.** Without animation, a preset switch is an abstract operation — three numbers change simultaneously and a list reorders. With animation, each weight change is a visible, traceable event. The player can point at the recency thumb and say "that one moved the most" — they have identified the dominant weight difference between two presets without doing subtraction.

**Creates kinesthetic memory for presets.** After several switches, players associate presets with motion patterns rather than numerical values. "Stable Config is the one where recency goes dark" is a more durable memory than "Stable Config is PA:70, R:0, V:30." Motion patterns survive context switches and sleep; exact numbers do not. This is the same reason people remember melodies but not frequencies.

**Decomposes a compound operation into sequential causes.** The staged reshuffle (Option C) creates three visible cause-effect pairs per preset switch. Each weight change produces a visible list reorder. This decomposition teaches what each weight actually does — not in the abstract ("pivot-activity weights candidates active at the pivot tick") but in the concrete ("when pivot-activity increased, RELAY-C jumped from #4 to #1"). The animation is a live demonstration of the weight formula.

**Rewards slow, deliberate comparison.** The 500ms animation encourages the player to switch presets and watch, rather than click rapidly. This is appropriate for the Inspector's analytical mode — the animation's pace matches the emotional register of forensic investigation. The player who takes time to watch three preset switches learns more than the player who rapid-fires.

**Delightful on first encounter.** The sequential slider animation is inherently satisfying — a cascade of precise, purposeful motions. It transforms a utilitarian UI operation (select from dropdown) into a small moment of visual craft. This is the kind of polish that signals "this game was made by people who care about how things feel."

---

## Weaknesses

**500ms is too slow for competitive rapid comparison.** Priya's journey illustrates the core tension. A player who wants to compare six presets needs 3 seconds of animation to see all six — and the animations overlap and redirect, creating visual noise rather than clarity. The Shift+Click bypass mitigates this, but the existence of a bypass means the animation has failed to serve all use cases. A feature that experienced players routinely skip is either in the wrong place or at the wrong pace.

**Sequential slider motion implies a causal ordering that doesn't exist.** The pivot-recency-volatility sequence is pedagogically motivated, but the actual pre-ranking formula applies all three weights simultaneously. The animation suggests that pivot-activity is "applied first" and volatility is "applied last" — an implication that could mislead players into thinking the weight order matters. It doesn't. The result is the same regardless of whether you set pivot-activity first or volatility first. The animation's narrative (sequential application) diverges from the formula's reality (simultaneous weighting).

**Results list motion during animation can be nauseating.** Three reshuffles in 500ms means cards are sliding vertically every ~120ms. Players with vestibular sensitivity or motion sickness may find the cascading card motion uncomfortable. An accessibility setting to disable animation (or reduce it to a single instant reshuffle) is mandatory. This is not an edge case — macOS and iOS both provide a "Reduce Motion" system preference, and ~10% of users enable it.

**Adds implementation complexity for marginal learning gain.** The animation requires spring physics calculations per frame, interruptibility logic, redirect handling, staged reshuffle synchronization, and accessibility alternatives. This is a non-trivial engineering investment. The learning gain — "players associate presets with motion patterns" — is real but marginal compared to the learning already provided by the sliders themselves (4.63). A player who has understood the sliders through manual manipulation has already grasped the weight system; the animation adds polish, not fundamental understanding.

**First encounter may not be self-explanatory.** When sliders begin moving on their own after a preset selection, a player who has only ever manually dragged sliders may be confused. "Why are the sliders moving? Did I break something?" The animation's meaning — "the sliders are transitioning to the preset's values" — is only obvious if the player understands that presets encode slider values. Marcus's accidental-click journey relies on the animation being visually clear enough that the player connects "I clicked a preset name" with "the sliders moved to that preset's values." This connection may not be immediate for all players.

---

## Interaction Effects

**With 4.89 (Weight preset import/export):** When a player imports a preset via config string (`RU:1|PA:15,R:15,V:70|NoiseHunter`), the import could play the interpolation animation from the current slider positions to the imported values. This transforms the import from a cold data operation into a warm "receiving someone else's configuration" experience. The player watches their sliders move to Tomás's recommended values, sees the results reshuffle, and evaluates the imported preset through its motion profile before committing to it. The animation bridges the gap between "I pasted a string" and "I understand what this string does." Alternatively, import could skip the animation entirely (the player hasn't selected a preset from a dropdown — they pasted text, which implies a more technical interaction mode). The design should probably default to animated import with a "skip" option.

**With 4.88 (Adaptive weight suggestion):** When the game surfaces a weight recommendation ("your accuracy improves 23% when recency is below 20%"), the player can accept the suggestion. Acceptance should animate the sliders from current values to recommended values, using the same interpolation animation. This creates a satisfying moment: the game suggests a configuration, the player clicks "Apply," and the sliders move to the recommended positions as if the game is gently adjusting the controls on the player's behalf. The motion reinforces the suggestion's authority — the game isn't just telling you to change your weights, it's showing you the change happening. The staged reshuffle during the animation shows the consequence before the player runs QUICK mode.

**With 4.92 (Per-mission-type weight performance heatmap):** The heatmap shows which weight configurations perform best for each mission type. If the player clicks a cell in the heatmap (e.g., "Noise Hunter preset on relay missions: 88% accuracy"), the weight panel could animate to that configuration, showing the player what the optimal configuration looks like in motion. The heatmap becomes an interactive launcher for preset comparison, with each cell click triggering a slider animation. This turns a static data visualization into an interactive exploration tool.

**With animation speed and iteration pace:** The animation imposes a 500ms minimum transition time between preset states. For a player who switches presets 10 times per Inspector session (testing different diagnostic strategies), that's 5 seconds of animation. Not prohibitive, but noticeable. The Shift+Click bypass is essential, but its existence creates a two-tier interaction: new players watch animations and learn; experienced players bypass animations and operate at speed. This bifurcation is acceptable — it mirrors the way every animation-heavy UI works (macOS window minimization is animated for new users, bypassed via Cmd+H by power users). The key is that the bypass must not feel like a hack. It should be as discoverable as the animation itself.

**With the results list reshuffle from 4.63 (manual slider dragging):** The manual slider drag (from the parent aspect) already produces real-time results list reshuffling. The animation's staged reshuffle (Option C) is a different motion vocabulary — three discrete reshuffles instead of continuous flow. This means the results list behaves differently during manual drag (continuous) vs. preset switch (staged). The design should be consistent: either both use continuous reshuffle, or both use staged. Recommendation: manual drag stays continuous (the player is actively controlling the slider and expects immediate feedback), while preset switch uses staged (the player has delegated control to the animation and benefits from legible decomposition). Two different interaction modes justify two different visual treatments.

---

## Comparable Games and Media

**iOS Settings toggle animations:** When toggling a setting in iOS (e.g., switching from "Wi-Fi: Known Networks" to "Wi-Fi: Ask to Join"), associated sub-settings animate in or out — sliding, fading, expanding. The animation communicates the consequence of the toggle: "this setting controls whether these sub-settings exist." Robot Uprising's slider animation communicates the same thing at a finer grain: "this preset controls where each slider lives." The iOS precedent validates that settings-panel animations are not frivolous — they are a legibility tool for configuration UIs.

**Audio mixing console fader movements (motorized faders):** Professional audio mixing consoles (SSL, Neve, Avid S6) have motorized faders that physically move when the engineer recalls a saved mix scene. You press "Scene 4" and twenty faders slide to their stored positions — some traveling the full throw, some barely moving. The engineer watches the faders and immediately knows: "the vocal fader moved a lot, the drums barely changed — Scene 4 is a vocal-heavy mix." Robot Uprising's slider animation is a digital version of motorized fader recall. The same visual vocabulary applies: watch which slider moved the most to understand the preset's character. Audio engineers have relied on this visual-kinesthetic feedback for decades. It works.

**Ableton Live macro knob animation:** In Ableton Live, a macro knob controls multiple parameters simultaneously. When the user maps a macro and sweeps it, multiple parameters change at different rates — one might go from 0% to 100% while another goes from 80% to 60%. The visual motion of the parameter indicators communicates the mapping. Robot Uprising's sequential slider animation is a constrained version: three parameters change in sequence, not simultaneously, but the principle is the same — watch the parameter motion to understand the configuration.

**Fighting game character select transitions:** In games like Guilty Gear Strive or Street Fighter 6, switching character selection plays a transition animation — the current character slides out, the new character slides in, stats update. The transition is fast (~400ms) but deliberate — it gives the player a moment to register "I'm switching from this to that." The animation is interruptible (you can keep scrolling). Robot Uprising's preset switch animation follows the same pattern: deliberate transition, fast enough not to block, interruptible, and designed to make the switch legible rather than instant.

**CSS transition-property in web design:** Web developers routinely animate property changes rather than snapping them. A color change on hover fades over 200ms. A layout shift eases over 300ms. The web design community has extensively studied why animated transitions feel better than instant changes: they preserve object constancy (the user tracks the same element through the transition), they communicate causation (the hover caused the color change), and they reduce cognitive load (the user doesn't need to compare before and after — they saw the change happen). Robot Uprising's slider animation applies all three principles: the thumb is the tracked object, the preset click is the cause, and the motion eliminates the need to compare numbers.

---

## Sensory Description

**The moment the preset is selected:**

The dropdown closes with a soft click — a dry, short sound, like a latching mechanism engaging. The preset name in the pill-shaped selector updates immediately (no animation on the text — the name change is instant, establishing the destination before the journey begins). A faint pulse of color runs through the slider section's background — not a flash, a gentle brightening, like a control panel powering up. This pulse lasts 100ms and is barely conscious. It signals: something is about to move.

**The pivot-activity thumb begins its travel:**

The amber diamond lifts off its current position with a tiny visual cue — a 1px shadow appears beneath it, as if the thumb has been picked up by an invisible hand. The thumb accelerates along the amber rail. The rail's fill brightens or dims proportionally — if the thumb is traveling rightward (increasing weight), the amber fill extends behind it like a spreading warmth. If traveling leftward (decreasing weight), the fill retreats, the rail dimming to its 20%-opacity background color. The percentage label to the right of the track counts at the same pace as the thumb's motion: the number and the position are synchronized, so the player can watch either one.

**The sound — a soft tonal slide:**

Each slider's motion produces a quiet, continuous tone that pitch-shifts with the thumb's position. The pivot-activity slider's tone is based on the kulintang amber-register — a warm, metallic resonance in the 400-600Hz range. Moving the thumb rightward (increasing weight) raises the pitch slightly. Moving leftward lowers it. The tone is quiet — 30% of the kulintang melodic volume during Plan phase — and blends into the Inspector's ambient drone. It is not a notification sound. It is a texture change, like the hum of a machine adjusting its operating frequency.

When the recency slider begins (120ms later), its teal-register tone enters — cooler, thinner, in the 600-900Hz range, derived from the babendil ping stretched into a continuous glide. The two tones overlap for 130ms (during the stagger window), creating a brief two-note chord that resolves when the pivot thumb arrives at its target and its tone fades.

The volatility slider's tone is deepest — violet-register, 200-400Hz, derived from the agung's resonance. It enters last, overlaps briefly with the fading recency tone, and settles into silence as the animation completes.

The three tones, heard in sequence with overlapping tails, create a descending melodic contour: warm-bright-deep. This three-note phrase becomes the sonic signature of a preset switch — a tiny melody that the player hears every time they change presets. Over time, the player associates the phrase with "diagnostic reconfiguration." The melody is too short to be memorable as music but long enough to be recognizable as a sound event. It is the auditory equivalent of the motorized fader whir on a mixing console — a sound that means "the configuration is changing."

**The results list during reshuffle:**

Each staged reshuffle (at 250ms, 370ms, 490ms) produces a brief, quiet sound — a soft shuffle, like cards being rearranged on a felt surface. The volume of the shuffle is proportional to the magnitude of the reordering. A reshuffle where the top-3 candidates change positions produces a louder shuffle than one where only #7 and #8 swap. The player hears the dramatic reshuffles and barely hears the minor ones — audio reinforcing the visual hierarchy of motion.

Cards that rise in rank (moving upward on screen) have a faint ascending tone — a 50ms blip, barely above threshold, in the teal register. Cards that fall have a faint descending blip. These blips are not individually audible — they form a collective texture, a brief rising or falling chorus that the player perceives as "the list went up" or "the list went down" without hearing individual card tones. The texture lasts for the 120ms reshuffle duration and then silence returns.

**The settling moment:**

When the final slider (volatility) arrives at its target and the last reshuffle completes, a single soft tone sounds — a clean, resolved note in the amber register, 200ms duration, no vibrato. This is the "arrival" tone. It means: the preset is now fully active. The slider section's background dims back to its resting state. The shadows beneath the thumbs disappear — the thumbs have been "placed" and are no longer in transit.

The silence after the arrival tone is the most important sensory element. The 500ms of motion and sound resolves into stillness. The player is looking at a new configuration. The journey is over. The results are here.

**The emotional texture of the full animation:**

The animation feels like a well-machined mechanism completing a cycle. Not playful — precise. Not flashy — purposeful. Each slider moves with the authority of an instrument that knows exactly where it's going. The sequential motion has the cadence of a lock tumbler clicking into position: one, two, three, done. The arrival tone is the latch closing. The player has configured a diagnostic belief system, and the animation confirmed that the configuration was received, processed, and applied.

In the broader emotional arc of the Inspector phase — forensic calm, analytical attention, deliberate decision-making — the preset switch animation fits as a moment of controlled transformation. The player is not passively watching; they initiated this. They chose a different diagnostic lens. The animation acknowledges the significance of that choice by making it visible, audible, and temporally distinct. A half-second of choreographed motion that says: your beliefs have changed, and here is what that means for the evidence.

---

## Discovered New Aspects

1. **4.93 — Reduced-motion accessibility mode for weight animations**: A settings toggle that replaces all interpolation animations with instant transitions; respects OS-level "Reduce Motion" preferences; mandatory for vestibular accessibility; the preset switch shows a brief opacity crossfade (100ms) instead of slider travel and staged reshuffle.

2. **4.94 — Animation speed preference (deliberate vs. rapid)**: A user-configurable animation speed multiplier (0.5x, 1x, 2x) for weight interpolation; competitive players set 0.5x (250ms total) or disable entirely; learning-mode players keep 1x; replaces the binary Shift+Click bypass with a graduated control.

3. **4.95 — Preset comparison overlay via held modifier**: Holding Alt while hovering a preset in the dropdown shows a ghost overlay — semi-transparent slider thumbs at the hovered preset's positions overlaid on the current slider positions, without triggering the animation; allows visual comparison before committing; the delta between current and hovered positions is shown as colored arcs between the two thumb positions on each track.

4. **4.96 — Animation replay on demand**: A small "replay transition" button (↻) that appears next to the preset name after a switch; clicking it replays the interpolation animation from the previous preset's values to the current; allows the player to re-watch the transition for study purposes; useful when the player switched too quickly and wants to see the motion again.

5. **4.97 — Preset morph mode (continuous interpolation between two presets)**: A slider or knob that continuously interpolates between two selected presets (e.g., "blend Stable Config 70% with Noise Hunter 30%"); the three weight sliders show intermediate positions; creates a continuous preset space rather than discrete named configurations; interaction with the ternary plot view from 4.63 Option B.
