# Fork Missions — Agree-to-Disagree as Mission Design Constraint

**Aspect:** 4.86 — "Fork Missions" as a mission archetype specifically designed to trigger agree-to-disagree divergence; the player's choice (Focused vs. Structural) determines which half of the mission they get credit for; teaches goal-dependent diagnosis as a first-class skill; interaction with mission-design-*.md.

**Parent:** 4.62 — Agree-to-disagree result
**Siblings:** 4.83 — Debt ledger; 5.08 — Mission variety taxonomy; 5.22a — Mission retry granularity
**Related:** 4.37 — Fork-and-deploy shortcut; 4.38 — Counterfactual history; 4.40 — First viable vs. minimum fix toggle; 4.59 — Career minimum fix; 4.60 — Search budget as resource; 5.08a — Phase-shift mission structure; 1.04e — 100-test-case robustness pattern

---

## The Core Problem

In the current design, agree-to-disagree divergence is an *emergent* event. It happens when QUICK and THOROUGH modes happen to find different fixes that address different failure mechanisms. The player encounters it, learns from it, moves on. But the game never *requires* the player to confront it. A player who always picks the higher pass-rate number — always choosing the Focused fix — can complete the entire campaign without ever engaging with the Structural alternative. They graduate from Robot Uprising having never made a deliberate, stakes-bearing choice between symptom suppression and root cause elimination.

This is a curriculum gap. Goal-dependent diagnosis is the single most transferable skill Robot Uprising teaches. In real agentic AI engineering, the question "should I patch this failure or refactor the underlying architecture?" is asked daily, and the answer is always "it depends on what you're optimizing for." A game that claims to teach this skill must force the player to practice it — not hope they stumble into it.

**Fork Missions close this gap.** They are a mission archetype where:

1. The player's config has been deliberately seeded with two genuine, independent failure mechanisms
2. The debrief's Fix Explorer will always surface an agree-to-disagree result
3. The player must choose Focused or Structural
4. The choice determines which *half* of the next mission segment they receive credit for
5. The unchosen half remains as visible, acknowledged debt — tracked on the debt ledger (4.83), available for retry (5.22a)

The mission doesn't punish either choice. It reveals the *consequences* of each choice by forking the player's immediate future into two different problem shapes. The player who patches the symptom gets a mission segment that tests whether their patched config can survive under pressure. The player who fixes the root cause gets a mission segment that tests whether the slower, smaller improvement was worth the lower immediate pass rate. Both segments are completable. Both award credit. But they are different missions, with different sensory textures, different failure modes, and different lessons.

**The philosophical claim:** Choosing what to fix is as important as knowing how to fix. Fork Missions are the game's mechanism for testing this.

---

## Mission Structure: The Three-Act Fork

### Act 1: The Setup (Shared)

Every Fork Mission begins with a standard mission segment — a problem the player must design an architecture to solve. This segment is 20-30 ticks of sealed watch. The architecture is intentionally tested against a scenario distribution that exposes two independent weaknesses simultaneously.

The critical design constraint: the seeded config (or the config the player builds using the mission's available primitives) must have **two genuine failure clusters** of roughly comparable severity. Not one big problem and one trivial problem. Two real weaknesses, each responsible for 15-30% of scenario failures, operating on different mechanisms.

**Example — Mission 7: "Dual Fault" (Batangas Province)**

The player deploys a 4-agent squad across an 8x8 coastal grid: two Scouts covering the northern and eastern approaches, one Relay hub in the center, one Striker defending an objective in the southwest corner. The scenario distribution randomizes enemy approach vector and wave timing.

Act 1 runs 100 robustness scenarios. The result:
- **62/100 pass rate** — 38 failures
- **Failure Cluster A (17 failures):** Scout-North's attention filter includes `DEBRIS` tags from wave 1 wreckage. In scenarios where wave 1 approaches from the north, Scout-North's buffer fills with debris signals, evicting live enemy detections. The Striker misses the wave 2 flankers because Scout-North was "looking at rubble." This is the *symptom* — the most visible failure, the one active at the failure tick.
- **Failure Cluster B (14 failures):** The Relay hub's context buffer is sized at 4 slots, handling two Scout feeds plus its own state. In scenarios with overlapping waves (wave 1 hasn't cleared when wave 2 arrives), both Scouts broadcast simultaneously. The Relay overflows, dropping the older signals — which happen to be the accurate threat assessment from Scout-East. The Striker acts on partial intelligence. This is the *structural issue* — a capacity constraint that only manifests under concurrent load.
- **7 compound failures:** Both mechanisms fire simultaneously. Neither fix alone resolves these.

The sealed watch ends. The debrief fires. The Fix Explorer runs both QUICK and THOROUGH.

### Act 2: The Fork (Divergent)

The Fix Explorer surfaces two cards:

```
┌─────────────────────────────────────────────────────────────────┐
│  BOTH FIXES ARE VALID  ·  Your choice determines what's next    │
│                                                                  │
│  ┌───────────────────────────┐  ┌───────────────────────────┐   │
│  │  FOCUSED FIX               │  │  STRUCTURAL FIX           │   │
│  │  Scout-North attention    │  │  Relay hub context        │   │
│  │  filter: –DEBRIS tag      │  │  buffer: 4 → 5 slots      │   │
│  │                           │  │                           │   │
│  │  Resolves: 17 failures    │  │  Resolves: 14 failures    │   │
│  │  + partial(7) compound    │  │  + partial(7) compound    │   │
│  │  New est. pass rate: ~80  │  │  New est. pass rate: ~76  │   │
│  │                           │  │                           │   │
│  │  Relay issue: UNCHANGED   │  │  Scout issue: UNCHANGED   │   │
│  │                           │  │                           │   │
│  │  Next: PRESSURE TEST      │  │  Next: ENDURANCE TEST     │   │
│  │  "Can your patched config │  │  "Can your cleaner arch   │   │
│  │   survive a stress wave?" │  │   hold over a long run?"  │   │
│  │                           │  │                           │   │
│  │  [ Choose Focused ]       │  │  [ Choose Structural ]    │   │
│  └───────────────────────────┘  └───────────────────────────┘   │
│                                                                  │
│  ⚖ The unchosen fix becomes DEBT — visible on your ledger,      │
│    available to address in a future session.                     │
└─────────────────────────────────────────────────────────────────┘
```

The key innovation: **the "Next:" preview.** Each fix card tells the player what kind of mission segment follows their choice. This is not arbitrary flavor text — the mission segment is mechanically designed to stress-test the *consequences* of the chosen fix path.

**Fork Path A: Focused Fix chosen → "Pressure Test" segment**

The player's fix removed `DEBRIS` from Scout-North's filter. Pass rate jumped to ~80. But the Relay's 4-slot buffer is still there. The Pressure Test segment runs a new scenario batch with **increased concurrent load** — three overlapping waves instead of two. The Relay weakness that the player left unaddressed is now under greater stress. If the ~80 pass rate holds under pressure, the player has validated that the symptom fix was sufficient for now. If the pass rate drops back down, the player watches their Relay crumble in real-time, learning viscerally that the structural issue they deferred is load-dependent and will get worse.

The Pressure Test sealed watch: 30 ticks, faster enemy spawn cadence, a third wave arriving at tick 18 while wave 2 is still active. The board is loud — signal chevrons everywhere, the Relay's buffer bar flickering amber, Scout-North cleanly filtering debris (the fix worked) but Scout-East's feed competing with Scout-North's feed for Relay attention. The player watches the Relay's buffer bar. It climbs. Amber. Orange. The chevrons arriving at the Relay slow down — the queue animation showing signals backed up. One dropped. A tiny red X. Then another. The Striker stands still for two ticks, deaf, while an enemy flanker passes through the gap.

**Fork Path B: Structural Fix chosen → "Endurance Test" segment**

The player expanded the Relay's buffer to 5 slots. Pass rate improved to ~76 — lower than Path A's ~80. But the architecture is structurally cleaner. The Endurance Test segment runs a **longer scenario** — 50 ticks instead of 30, with sustained medium-intensity pressure. The Scout-North debris issue is still present, meaning the player will see debris-related failures throughout. But the Relay never overflows. The information pipeline is robust. Failures happen, but they are *contained* — the debris issue affects Scout-North's cluster and only Scout-North's cluster. It doesn't cascade.

The Endurance Test sealed watch: 50 ticks, steady tempo, no spikes but no respite either. Scout-North occasionally goes amber — debris in the buffer, a detection missed — but the Relay hums green the entire time. Signal flow is consistent. When failures happen, they are local and legible: "Scout-North missed this because of debris." The Striker still acts on Scout-East's intelligence, which flows unimpeded through the properly-sized Relay. The player watches a flawed-but-stable system. It doesn't crash. It just has a known weakness.

### Act 3: The Accounting (Shared)

Both paths converge at the post-mission debrief. The results screen shows:

- **Mission credit:** Awarded for the chosen path's completion (pass/fail based on the path segment's pass rate)
- **Debt entry:** The unchosen fix appears as a named entry on the debt ledger (4.83): "Mission 7 — Relay buffer capacity (deferred)" or "Mission 7 — Scout-North debris filter (deferred)"
- **Composite score:** A mission-level score reflecting both the Act 1 pass rate and the Act 2 path segment pass rate, weighted toward the path the player chose

The debt ledger entry is not punitive. It is informational. It says: "You have a known weakness in your architecture. You chose not to address it this session. Here it is, with a name, so you can address it when you're ready." The debt ledger interacts with the Career Minimum Fix (4.59) — if the same structural weakness appears as a cross-match minimum fix, the ledger entry highlights gold, indicating the debt is now confirmed as systemic.

---

## Player Journeys

### Journey 1: The Pragmatist

```
FADE IN:

INT. MISSION 7 DEBRIEF — NIGHT

PLAYER stares at two fix cards. The cursor hovers over
FOCUSED FIX. Pass rate: +18. The Structural card reads +14.

                    PLAYER (V.O.)
          Four more wins. That's four more wins if
          I pick the focused fix. It's not even close.

Player clicks FOCUSED FIX. The DEBRIS tag vanishes from
Scout-North's filter with a soft pop. The filter panel
refreshes — one fewer entry, one cleaner agent.

The PRESSURE TEST segment loads. Three waves. The sealed
watch begins.

Tick 8. Wave 1 arrives north. Scout-North detects cleanly —
no debris noise. Pristine green buffer bar. Signal fires
to Relay. Relay forwards to Striker. Kill confirmed. A
satisfying mechanical thunk.

                    PLAYER (V.O.)
          See? Fixed.

Tick 18. Wave 3 arrives while wave 2 is still active. Both
Scouts broadcasting simultaneously. The Relay's buffer bar
climbs — 3/4, 4/4. Full. A signal from Scout-East arrives.
No room. Red X. Dropped.

                    PLAYER (V.O.)
          No, no, no—

The Striker stands motionless for two ticks. An enemy flanker
slips through. Objective takes damage. The pass rate counter
in the corner ticks down: 79... 77... 74...

Tick 25. The pressure subsides. Wave 2 clears. Wave 3 thins
out. The Relay recovers. Buffer drops to 2/4. Signals flow
again. The Striker re-engages. But the damage is done.

DEBRIEF — RESULTS SCREEN

Pass rate: 74/100 on the Pressure Test segment.

A new line appears on the DEBT LEDGER panel, bottom-right
of the debrief screen. Amber text:

     "MISSION 7 DEFERRED: Relay hub buffer capacity (4 slots)"
     "Exposed under concurrent load. 14 base failures + 3
      pressure-test overflow events."

                    PLAYER (V.O.)
          ...okay. I'll deal with that next time.

The player's hand moves toward the ledger. Hovers. Doesn't
click. Closes the debrief.

                                                    CUT TO:

INT. MISSION 9 DEBRIEF — THREE SESSIONS LATER

The Career Minimum Fix panel loads after a 5-minute
computation. The top result glows gold:

     "RELAY BUFFER CAPACITY appears as minimum fix in
      4 of your last 6 missions. This matches a deferred
      debt entry from Mission 7."

The player stares. The debt entry from Mission 7 pulses
gently in the ledger sidebar, gold-highlighted now instead
of amber. It has been waiting.

                    PLAYER (V.O.)
          ...I should have picked Structural.

Beat. The player opens the Relay config panel. Types "5"
into the buffer slot field. Hits apply.

                                                    FADE OUT.
```

### Journey 2: The Architect

```
FADE IN:

INT. MISSION 7 DEBRIEF — NIGHT

PLAYER reads both cards slowly. Cursor moves to STRUCTURAL
FIX. Pauses on the pass-rate number: +14. Moves to FOCUSED
FIX: +18. Back to STRUCTURAL. The tooltip reads:

     "This fix addresses a capacity constraint in your
      information pipeline. The Scout issue remains visible
      and containable."

                    PLAYER (V.O.)
          The Relay is the spine. If the spine breaks,
          everything downstream is noise. I can live with
          Scout-North being noisy. I can't live with the
          Relay dropping signals under load.

Player clicks STRUCTURAL FIX. The Relay buffer field
animates: 4 slots expanding to 5. A fifth slot materializes
in the buffer bar with a quiet crystalline chime — like a
new rail being welded onto the track.

The ENDURANCE TEST segment loads. Fifty ticks. Sustained
pressure. The sealed watch begins.

Tick 12. Scout-North picks up a DEBRIS signal. Buffer bar
goes from blue to amber on one slot. The debris signal sits
there, consuming space, while a real enemy passes below.
Scout-North's hook fires on the debris — wrong target. A
wasted cycle.

                    PLAYER (V.O.)
          Yeah, I know. That's the debris problem.
          It's contained. Watch the Relay.

Tick 12 continued. Scout-East detects the actual enemy.
Signal fires to Relay. The Relay's 5-slot buffer receives
it cleanly. Slot 1: Scout-East threat report. Slot 2:
Scout-North debris (noise, but it fits). Slot 3: empty.
Green. Calm. The signal forwards to Striker. Kill confirmed.

Tick 30. Both scouts broadcasting, sustained enemy
presence. Relay buffer at 4/5. Amber. Not red. Not
overflow. Just working. Slots cycling — oldest signal
evicted as new signal arrives, but the eviction priority
correctly drops stale data, not active threats. The
pipeline holds.

Tick 45. Scout-North has its third debris-related miss.
The pass rate counter shows it: these are real failures.
But they are predictable failures. The player can name
them. "Scout-North debris, tick 45." Like a known defect
in a code review — documented, prioritized, scheduled for
the next sprint.

DEBRIEF — RESULTS SCREEN

Pass rate: 76/100 on the Endurance Test segment.

The DEBT LEDGER shows:

     "MISSION 7 DEFERRED: Scout-North DEBRIS filter"
     "17 base failures attributable. Containable; does
      not cascade to other agents."

                    PLAYER (V.O.)
          Seventy-six. Not eighty. But the Relay held
          for fifty ticks under load. I'll take it.

The player opens Scout-North's filter config. Looks at
the DEBRIS tag. Considers removing it now. Decides not
to — that's for next session. Closes the debrief with
a clean ledger plan.

                                                    FADE OUT.
```

### Journey 3: The Researcher

```
FADE IN:

INT. MISSION 7 DEBRIEF — NIGHT

PLAYER has completed Mission 7 twice already. First time:
chose Focused. Second time (mission retry, 5.22a): chose
Structural. Both paths completed. Both debt entries resolved.
But the player is not done.

The player opens the COUNTERFACTUAL HISTORY panel (4.38).
Two timelines are visible:

     Timeline A: Focused → Pressure Test → 74% pass rate
     Timeline B: Structural → Endurance Test → 76% pass rate

The player clicks COMPARE. A side-by-side view renders:

     ┌────────────────────┬────────────────────┐
     │ TIMELINE A          │ TIMELINE B          │
     │ Focused Fix         │ Structural Fix      │
     │                     │                     │
     │ Act 1: 62%          │ Act 1: 62%          │
     │ Act 2: 74%          │ Act 2: 76%          │
     │ Debt: Relay buffer  │ Debt: Scout debris  │
     │                     │                     │
     │ Session 2: Relay    │ Session 2: Scout    │
     │ fix resolved debt   │ fix resolved debt   │
     │ Final: 88%          │ Final: 91%          │
     └────────────────────┴────────────────────┘

                    PLAYER (V.O.)
          Three percent. The Structural path ended at
          ninety-one. The Focused path at eighty-eight.
          Structural was better long-term. But Focused
          gave me more headroom in the short term —
          I was at eighty after Act 2, not seventy-six.
          If I'd needed to play a Gauntlet match that
          night, Focused was the right call.

The player screenshots the comparison. Opens a Discord
channel. Posts it with the caption:

     "Fork Mission 7 data: Focused gives you 4% more
      headroom immediately but Structural converges 3%
      higher after debt resolution. Your call depends
      on whether you have a match tonight."

Three replies within a minute.

     User_hooksAndLadders: "this is literally the
      tech debt conversation at my day job"

     User_relayMaximizer: "focused every time. you
      can always fix the relay later. you can't unfail
      a gauntlet match."

     User_root_cause_or_die: "structural. always.
      the debt compounds."

                    PLAYER (V.O.)
          The game didn't tell me which was right.
          It showed me what each one costs.

                                                    FADE OUT.
```

---

## Strengths

- **Forces engagement with the game's deepest pedagogical claim.** The agree-to-disagree moment moves from "cool emergent thing that might happen" to "guaranteed curriculum beat that every player encounters." No one graduates from the campaign without confronting goal-dependent diagnosis.

- **Both paths are genuinely completable and rewarding.** This is not a false choice or a trap. The Focused path and the Structural path are both designed missions with their own challenge profiles, their own sealed-watch spectacles, their own pass-rate distributions. Neither path is "the wrong answer you pick to learn a lesson."

- **The debt ledger integration creates long-term narrative.** The unchosen fix does not vanish. It persists on the ledger as a named, visible weakness. Sessions later, when the Career Minimum Fix surfaces it again, the player experiences the game's version of "I told you so" — not as punishment, but as confirmation that deferred decisions have durable consequences.

- **Natural replayability.** Fork Missions are the one mission type that genuinely benefits from being played twice. The first playthrough explores one path. The retry explores the other. The comparison between the two is itself a lesson. This is replayability driven by curiosity, not by grind.

- **Transfers directly to real engineering practice.** The "should I patch or refactor?" conversation happens in every engineering standup. Fork Missions give players a visceral, stakes-bearing version of this conversation before they encounter it professionally. The vocabulary — Focused Fix, Structural Fix, debt entry, debt resolution — maps 1:1 to industry terms.

- **TikTok-clip-ready spectacle.** The moment of choice — two cards side by side, the player hovering between them, the "Next:" previews promising different futures — is visually dramatic and emotionally legible in a 15-second clip.

---

## Weaknesses

- **Scenario construction is fragile.** The Fork Mission's entire premise depends on the seeded config having exactly two failure clusters of comparable severity. If one cluster dominates (25 failures vs. 6 failures), the "choice" is trivially obvious. The mission designer must carefully construct initial conditions, scenario distributions, and agent configs that reliably produce two balanced failure clusters across the full randomization space. This is significantly harder than designing a mission with one clear failure mode.

- **The "Next:" preview may bias the choice.** Players who prefer action-heavy gameplay will always pick Pressure Test. Players who prefer optimization will always pick Endurance Test. The mission type preference may override the diagnostic reasoning the Fork Mission is supposed to teach. Mitigation: vary the path-segment types across different Fork Missions so that Focused doesn't always map to Pressure Test.

- **Two parallel mission segments doubles content cost.** Each Fork Mission requires two fully designed, tested, and balanced Act 2 segments. For a 10-mission campaign, if 2-3 missions are Forks, that is 4-6 mission segments that must all function. This is a real production cost, though the segments can be shorter than full missions (15-20 ticks vs. 30).

- **The Focused Fix will almost always have a higher number.** Because the Focused Fix targets the most-active failure cluster (by definition, the one with more failures), its estimated pass-rate improvement will usually be larger. Players who fixate on the number will always pick Focused, never engaging with the Structural reasoning. The UI must do significant work to prevent "bigger number = obviously correct" reasoning — the "Next:" preview and the consequence note ("Relay issue: UNCHANGED") carry this burden.

- **Debt ledger fatigue.** If every Fork Mission adds a debt entry, players may accumulate a long list of deferred fixes and feel overwhelmed. Mitigation: limit Fork Missions to 2-3 per campaign, and ensure debt entries are resolvable within 1-2 sessions of the originating mission.

- **Risk of feeling "rigged."** Players who understand the mission was designed to produce an agree-to-disagree result may feel the dilemma is artificial. "The game made my config have two bugs so it could ask me a philosophy question." Mitigation: ensure the failure clusters arise naturally from the config-building decisions the player made in Act 1, not from pre-seeded weaknesses they had no role in creating. The best Fork Missions are ones where the player's own design choices produced the dual weakness.

---

## Interaction Effects

### With Mission Retry (5.22a)

Fork Missions create the most natural retry incentive in the campaign. A player who chose Focused in their first playthrough can retry the mission and choose Structural, exploring the other path. The retry is not "doing the same thing again hoping for better results" — it is a genuinely different mission segment. The counterfactual history (4.38) tracks both timelines, enabling the comparison shown in Journey 3. **Recommendation:** Fork Missions should always allow round-level checkpointing at the fork point — the player should be able to restart from the fork decision without replaying Act 1.

### With Debt Ledger (4.83)

The debt ledger is the Fork Mission's persistence mechanism. Without it, the unchosen fix is forgotten and the pedagogical arc is broken. The ledger entry must include: the fix description, the estimated failure count it would have resolved, the mission of origin, and a "RESOLVABLE" flag indicating whether the player can address it in their current config. When the player does address it (manually applying the fix between sessions), the ledger entry should transition to "RESOLVED" with a timestamp and the resulting pass-rate improvement.

### With Search Budget (4.60)

Fork Missions present a design tension with the search budget resource. The agree-to-disagree result requires both QUICK and THOROUGH to have been run — which costs compute budget. If Fork Missions are the curriculum's key pedagogical moments, they must not be gated behind a resource the player might have spent elsewhere. **Recommendation:** Fork Missions should auto-run both search modes at no compute cost, with a diegetic explanation: "This system has flagged a diagnostic fork. Both analyses have been run automatically." This preserves the search budget as a resource for optional, player-initiated analysis while ensuring Fork Missions always fire their pedagogical payload.

### With Campaign Mission Design (mission-design-*.md)

Fork Missions should appear at specific points in the 10-mission campaign arc:

- **Mission 4 or 5 (mid-campaign):** The player's first Fork Mission. Both failure clusters should involve primitives the player has already learned (context config, hooks). The choice is between a filter fix (Focused) and a routing fix (Structural). The stakes are low — both paths are short and forgiving. The purpose is to introduce the Fork vocabulary.

- **Mission 7 or 8 (late-campaign):** The player's second Fork Mission, now involving more complex primitives (production, command agent). The failure clusters are deeper — one involves a factory spawn timing issue (Focused) and the other involves a command agent priority queue design (Structural). The paths are longer and harder. The debt from the first Fork Mission may still be on the ledger, creating a compounding effect.

- **Mission 10 (finale, optional):** The final mission could include a Fork as its culminating decision, where the choice between Focused and Structural determines which of two final boss configurations the player faces. This is high-stakes and narratively resonant — "Your last diagnostic decision determines your last battle."

### With Phase-Shift Missions (5.08a)

Fork Missions and Phase-Shift Missions are complementary archetypes that should not overlap. A Phase-Shift Mission tests resilience under changing conditions within a single sealed watch. A Fork Mission tests diagnostic reasoning between sealed watches. Combining them would overload the player: "Your architecture must survive a mid-battle phase shift AND you must choose between two fixes at the debrief AND the unchosen fix becomes debt." Too many simultaneous lessons. Keep them in separate mission slots.

### With Robustness Scenarios (1.04e)

The 100-test-case robustness pattern is what makes Fork Missions possible. Without running 100 scenarios, the two failure clusters would not be statistically distinguishable — a 17-failure cluster and a 14-failure cluster could be noise with fewer test cases. The Fork Mission's Act 1 must use the full 100-scenario battery to produce reliable cluster separation. The scenario distribution must be designed so that the two failure mechanisms are triggered by different scenario parameters (e.g., Cluster A fires on north-approach scenarios, Cluster B fires on overlapping-wave scenarios) — if both clusters fire on the same scenarios, they are not truly independent and the Fork collapses into a single-problem mission.

---

## Comparable Games and Media

### The Witcher 3: Branching Quest Consequences

The Witcher 3's quest design frequently presents the player with two valid approaches to a problem — help the villagers or help the spirit, side with Roche or side with Iorveth — where neither is "correct" and the consequences play out over hours of subsequent gameplay. The Fork Mission borrows this structure but applies it to a diagnostic decision rather than a narrative one. The Witcher's strength: consequences feel organic, not telegraphed. The risk Robot Uprising must avoid: telegraphing consequences so clearly that the choice becomes a math problem rather than a judgment call.

### Papers, Please: Goal-Dependent Decision Under Pressure

Papers, Please asks the player to enforce immigration rules, but also presents humanitarian edge cases where following the rules conflicts with doing the right thing. The "correct" action depends entirely on the player's goal — maximize salary (follow rules) or help people (break rules). Fork Missions operate on the same axis: the "correct" fix depends entirely on the player's diagnostic goal. Papers, Please proves that this structure works even when one option has a clear numerical advantage.

### The Stanley Parable: The Fork as Thesis Statement

The Stanley Parable's entire design is a fork — left door or right door — where the choice reveals the game's thesis about player agency and narrative control. Fork Missions are smaller versions of this: the choice reveals the game's thesis about diagnostic reasoning and engineering tradeoffs. The Stanley Parable's lesson for Robot Uprising: the fork must feel like a genuine choice, not a test with a right answer.

### Factorio: Technical Debt as Gameplay

Factorio players accumulate "spaghetti" — messy, expedient factory designs that work now but become unmaintainable later. The game never tells players to refactor. It just makes the consequences of not refactoring increasingly painful. Fork Missions make this dynamic explicit: the debt ledger is the visible spaghetti, and the Structural Fix is the refactoring opportunity. Factorio's lesson: players will defer maintenance indefinitely unless the game creates a natural pressure point. The Fork Mission is that pressure point.

### Real Engineering: The Sprint Retro Debate

In any software engineering sprint retrospective, the team looks at the bug list and asks: "Do we patch the customer-facing symptom or fix the underlying service?" The answer depends on the release timeline, the severity of the symptom, the cost of the fix, and the team's appetite for risk. Fork Missions simulate this conversation as a single-player decision, with the sealed watch providing the "production environment" and the debt ledger providing the "backlog."

---

## Sensory Description: The Fork Moment

The Fix Explorer has finished its analysis. The screen splits — not a hard cut, but a slow horizontal fracture, like a geological fault line opening across the debrief panel. The left half dims to a warm amber. The right half dims to a cool steel-blue. Two cards rise from the fracture line, ascending in parallel, each trailing a faint glow in its respective color temperature.

**Audio:** A sustained chord — two notes, a major third apart, neither resolving. The left card's note is slightly warmer (analog synth, rounded wave). The right card's note is slightly cooler (digital sine, clean edge). The chord hangs, unresolved, as long as the player hovers between cards. It is deliberately uncomfortable — not dissonant, but incomplete. The ear wants it to resolve. The game waits.

When the player hovers over the left card (Focused Fix), the warm note swells slightly. The amber glow brightens. The "Next: PRESSURE TEST" preview text fades in below — a miniature board view showing dense enemy spawn points, the grid compressed and urgent. The right card recedes, its steel-blue dimming.

When the player hovers over the right card (Structural Fix), the cool note swells. The steel-blue brightens. The "Next: ENDURANCE TEST" preview fades in — a wider board view showing a long timeline bar, the grid expansive and steady. The left card recedes.

**The click.** The player commits. The unchosen card doesn't disappear — it folds in on itself, origami-style, collapsing into a small rectangular icon that drifts to the bottom-right corner of the screen and slots into the debt ledger with a soft metallic click, like a filing cabinet drawer closing. The chosen card expands to fill the panel, its color temperature washing over the entire debrief interface. The unresolved chord finally resolves — to a major key if Focused, to a minor key if Structural. Neither is "happy" or "sad." Both are complete. The tension releases.

The transition to Act 2's sealed watch begins: the expanded card dissolves into the mission loading screen, its color temperature carrying into the new segment's palette. The Pressure Test loads in amber-warm tones. The Endurance Test loads in steel-blue-cool tones. The player knows, from the color of the light on the grid, which choice they made. And when they see the other player's clip on TikTok — amber where theirs was blue — they know that player chose differently.

**The TikTok clip:** Split-screen. Left: a player's Pressure Test, amber light, three waves crashing, the Relay's buffer bar climbing to red, a signal dropped, an enemy slipping through. Right: another player's Endurance Test, blue light, fifty ticks of steady operation, Scout-North's amber flicker on the debris miss, the Relay humming green. Same mission. Same Act 1. Different choice. Different game. Caption: "which one are you." The comments section: two camps, arguing. Exactly as designed.
