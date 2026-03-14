# Adversarial Counterfactual Mode

**Aspect:** 4.39 — Running the Minimum Fix Explorer on the opponent's config rather than the player's own — "what one change to the opponent's config would have beaten me more decisively?"; stress-testing player configs from the attacker's perspective; available only in Gauntlet mode after a match; teaches professional red-teaming mental model

**Parent:** 4.20 — Counterfactual Simulation as Advanced Debrief Feature; 4.36 — Multi-Scenario Minimum Fix Explorer
**Siblings:** 4.37 — Fork-and-Deploy Shortcut; 4.38 — Counterfactual History as Config Evolution Record; 4.40 — First-Viable-Fix vs. Minimum-Fix Toggle
**Related:** 1.06c — Asynchronous PvP as Design Constraint; 2.12 — Deception Signals; 7.10 — Config Necropsy Culture; 4.26 — False Pivot Gap as Standalone Metric

---

## The Core Concept

Every other counterfactual tool in the debrief asks the same question in slightly different ways: *"What should I change to win more?"*

Adversarial counterfactual mode flips the perspective entirely. After Act 2 completes on a Gauntlet match, the player can toggle from **self-diagnosis mode** to **red-team mode**: instead of asking what change to *their own* config would have improved their outcome, they ask what change to the *opponent's* config would have beaten them more decisively.

The shift is subtle in presentation but radical in mental model. You are now playing devil's advocate for your enemy. You are stress-testing your own architecture not by improving it directly, but by trying to break it.

This is the professional red-teaming move. Penetration testers don't just look at their own defenses — they actively build attacks to probe them. Military wargamers don't just improve their own plans — they assign officers to play the opposing side. The adversarial counterfactual mode teaches this exact cognitive operation as a natural part of the debrief.

**The Defender's Complacency Problem.** When you win a Gauntlet match — especially comfortably — there is no diagnostic pressure. EDT 0.22 means you won quickly and decisively. Pass/fail: pass. Standard diagnosis has nothing to work with. Adversarial mode specifically shines here: the absence of diagnostic signal in your match is not the absence of architectural risk. Your opponent may simply have failed to find the attack vector that would have destroyed you.

---

## The Objective Function Shift

In the standard Minimum Fix Explorer (4.20):
- **Input:** player's config, forked at EDT
- **Change space:** player's config fields
- **Objective:** find smallest change that **flips outcome to player winning**

In Adversarial Counterfactual Mode:
- **Input:** opponent's config, analyzed from opponent's EDT perspective
- **Change space:** opponent's config fields (readonly in normal mode — now explorable)
- **Objective:** find smallest change to the opponent's config that **flips outcome to opponent winning** (i.e., defeats the player)

The game runs the same enumeration engine. The difference is purely in which config is being mutated and which win condition is the target. Mechanically, it is the same computation. Pedagogically, it is a completely different cognitive experience.

### Three Possible Objective Variants

**Variant A: Minimum Flip** — Find the smallest change to the opponent's config that makes them win.
- Teaches: "how close was I to losing?"
- Best for: competitive players auditing tight matches

**Variant B: EDT Maximizer** — Find the change to the opponent's config that makes the outcome determined most decisively against the player (minimizes EDT ratio, makes it a stomp in the other direction).
- Teaches: "what's the hardest possible version of this threat?"
- Best for: builders who want to stress-test against optimal adversaries

**Variant C: Combined** — First find minimum flip (the closest attack), then show the most decisive version of that attack as a secondary result.
- Teaches: "here's the threshold attack, and here's what it looks like when it's fully optimized"
- Best for: the full threat model picture

**Recommendation: Variant C.** The minimum flip tells you the urgency (how close were you?); the most decisive variant tells you the depth (how bad could it get?). Both are necessary for a complete threat model. Display them as two rows in the results panel.

---

## The Two-Step Red Team / Blue Team Loop

The full adversarial workflow creates a beautiful closed loop within the debrief:

**Step 1 — Red Team:** Run adversarial mode. Find the attack vector. "The opponent could have beaten you by adding one buffer slot to their RELAY agent and changing their hook threshold from 3 to 5. Here's the match replay with the adversarial variant in grey."

**Step 2 — Blue Team:** The results panel shows a "Find My Counter" button. Clicking it opens a standard Minimum Fix Explorer on *your* config, with the adversarial variant as the opponent. The question becomes: "What's the smallest change to *your* config that defeats the adversarial version of your opponent?"

This is a mini arms-race within a single debrief session. Red team discovers the attack. Blue team finds the counter. The player has now simulated one iteration of the meta-evolution entirely within their own debrief window.

**Why the two steps matter:** The adversarial run alone can feel threatening or discouraging — you discover three ways you could have been beaten. The blue team counter step converts that anxiety into agency: now find the response. The design intention is that the player finishes this loop feeling more defended, not more vulnerable.

---

## The Ghost Overlay for Adversarial Mode

In standard counterfactual mode, the ghost overlay is intuitive: your forked simulation (potentially a win) plays in color; the original (a loss) plays in grey.

In adversarial mode, the visual semantics invert. The adversarial simulation — the one where the improved opponent beats you — plays in a **deep amber-red**, not grey. Your actual match plays in full color. The adversarial future is distinctly marked as the threat scenario, not a desirable outcome.

The timeline shows a **red split marker** instead of the blue split marker of standard forks. The moment the adversarial variant's improved configuration begins to diverge — when its relay fires that extra signal, when its hook threshold activates where it previously failed — the red split marker appears and the amber-red simulation blooms forward.

The player is watching a version of the match where they lose. This is intentionally uncomfortable. The discomfort is the teaching.

**The "attack window" visualization:** A thin red bracket appears on the timeline spanning from the adversarial EDT (when *the improved opponent* would have determined the outcome) to the actual match EDT (when *you* determined it in reality). This bracket is labeled **"Attack Window."** It represents the ticks during which the match was genuinely uncertain under the adversarial scenario — and during which your architecture was under real threat.

A small attack window means the adversarial opponent won quickly and decisively. A large attack window means even the improved opponent had to fight for it. This becomes another reading on your config's robustness: not just "did I win?" but "how contested would even the optimized attack have been?"

---

## Player Journeys

#### Journey: Marcus, 35, Software Architect, Commander Tier

**Context:** Marcus has been deploying configs in Gauntlet for six weeks. His current v4.1 is on a 7-match win streak with mostly comfortable EDTs (0.18–0.31 range — mostly early decisive outcomes). He's been iterating on his relay compression chain and is proud of how well it suppresses the high-fidelity signal flow he needs to activate his striker's burst rule. This match ended EDT 0.22 — his fastest win in recent memory. He's feeling confident.

**Minute 0:00 — Act 2 Opens, Nothing to Diagnose**
The debrief loads into Act 2 automatically. The EDT gold diamond sits at tick 26 of 120. The signal genealogy shows Marcus's relay firing compression at tick 8, forwarding to his striker at tick 12, striker activating burst rule at tick 14, opponent's frontline collapsing by tick 26. Textbook execution.

The standard Minimum Fix Explorer shows: **0 improvements found.** Not because Marcus's config is perfect — but because there's nothing to flip. He already won, and convincingly.

Marcus hovers over the red-team toggle button in the top-right of the debrief panel. A tooltip reads: **"Switch to Adversarial Mode — find what your opponent could have done to defeat you."** He's never used it before. He clicks.

**Minute 0:30 — The Perspective Flip**
The debrief panel header changes from "Your Architecture" to "Your Opponent's Architecture." The config tree on the left now shows the opponent's agents — their relay, their striker, their scout — in a slightly desaturated blue. These are readonly: Marcus can't edit them, but he can see them for the first time in full detail.

The adversarial explorer button now reads: **"Find attacks against my config."**

Marcus clicks. The progress bar runs. Three seconds. Five seconds. Eight seconds.

Results populate: **"2 single-element changes found that would have defeated you."**

**Minute 1:00 — Reading the Attack Vector**
Result 1 (minimum flip): *"Opponent's RELAY: increase buffer_size from 4 to 5. This allows one additional compressed signal to propagate before eviction, arriving at opponent's STRIKER-B at tick 21 rather than tick 27. Your striker's burst rule activates on your tick 14, but the additional delayed signal from STRIKER-B reaches the contested zone at tick 23, reversing the unit count and triggering your striker's eviction of a critical threat tag before its secondary burst fires."*

Result 2 (most decisive): *"Opponent's RELAY: increase hook threshold from fidelity ≥ 0.65 to fidelity ≥ 0.60. This allows a borderline-quality signal to propagate that was previously being filtered. Your relay's echo suppression rule was counting on that filter holding."*

Marcus stares at the second result. He didn't know his relay's echo suppression was depending on the *opponent's* fidelity filter to prevent an echo cascade. He'd built a defense that relied on the enemy's own failure to attack correctly. That's not a defense. That's a prayer.

**Minute 1:30 — The Blue Team Step**
He clicks **"Find My Counter."** The explorer now runs against his own config, using the adversarial variant (opponent's relay with buffer 5) as the opponent. In 12 seconds: **"1 single-element fix found."**

*"Your RELAY: add echo suppression source filter: exclude signals originating from opponent's STRIKER-B. This breaks the cascade chain at source."*

Marcus reads it twice. He opens the workbench in a side panel. He makes the change. He queues it as v4.2.

**Minute 2:00 — Resolution**
Marcus doesn't feel bad about the win. But he feels differently about the winning streak. He's been winning with a config that had a known-but-undiscovered attack vector. Now he's closed it. He schedules the adversarial mode run as a standard part of his post-win workflow — not just post-loss.

**UI Annotations:**
- **Red-team toggle:** Top-right of debrief panel. Disabled during Act 1, enabled after Act 2 loads. Label: "Red Team Mode." Icon: targeting reticle, not a magnifying glass.
- **Opponent config tree:** Left sidebar, readonly blue-tinted nodes. Same layout as own config tree. Clicking a node shows field values but no edit controls.
- **Results panel:** Same two-row format as MFE (minimum flip row, most decisive row). Row color: amber-red gradient instead of teal-green. Label prefix: "Attack vector" instead of "Fix."
- **Attack window bracket:** Thin red horizontal bracket on timeline, distinct from teal FPG bracket. Labeled "Attack Window: X ticks" in small text below timeline.
- **"Find My Counter" button:** Below results, teal, only appears after adversarial results load. Click transitions back to own-config mode with adversarial variant locked as the opponent.

---

#### Journey: Keiko, 28, Competitive Programmer, Commander Tier

**Context:** Keiko has been playing Robot Uprising since early access. She's at the top of the Commander tier, regularly appearing on the leaderboard's top 50. She runs adversarial mode as a mandatory step in her necropsy workflow — every match gets Act 2, adversarial scan, "Find My Counter" if needed, and a session note. She thinks of it as keeping her configs "battle-hardened."

This session she's reviewing a match she won three days ago but flagged for later analysis (a post-win review, rare for most players, standard for Keiko). EDT 0.61 — unusually close for her recent form. She suspects she just got lucky.

**Minute 0:00 — The Flagged Match**
She loads the match from her history. It's one she sealed — she watched Act 1 knowing only that the match ran long. Act 2 revealed a near-collapse: her scout evicted a threat tag at tick 74 (two ticks before her striker needed it), her striker fired defensively rather than offensively for the next 8 ticks, and she scraped through on presence score accumulation rather than force.

She doesn't bother with standard MFE. She goes straight to adversarial mode.

**Minute 0:30 — The Adversarial Scan**
Results: **"4 single-element changes found that would have defeated you."**

Keiko reads all four carefully. Two are obvious — her opponent failed to use their relay at full capacity. One is clever — adjusting a hook timing by 2 ticks would have synchronized two independent attack chains into a simultaneous burst that her buffer couldn't absorb. One is alarming: if the opponent had simply added one rule prioritizing the threat tag type she normally evicts, her standard eviction policy would have created a systematic hole that the opponent could exploit on every map with similar geometry.

She writes in her session note: *"Confirmed: EDT 0.61 was luck, not architecture. Attack vectors 1+3 are patchable. Attack vector 2 (hook synchronization) requires structural change to my relay compression timing. Attack vector 4 (systematic eviction policy hole — threat tag priority) is the most concerning: this applies to any opponent who discovers threat-tag targeting."*

**Minute 1:30 — The Blue Team Runs**
She runs "Find My Counter" on attack vectors 1 and 3 in sequence. Both return single-element fixes. She queues both.

For attack vector 2 (hook synchronization): she knows this requires more than a single-element fix. She notes it as a structural debt item — something to address in v4.3 after the season resets.

For attack vector 4 (systematic eviction policy hole): she runs "Find My Counter." The counter: *"Your RELAY: set eviction priority override: threat_class signals always evict terrain_class signals regardless of age."* Simple. She queues it.

She deploys v4.2 immediately.

**Minute 3:00 — The Meta-Level Thought**
While writing the session note, Keiko realizes she can see the adversarial variants in her counterfactual history (4.38). She's accumulated seven adversarial runs across her last fifteen matches. She can browse them. Two of them share a pattern: the most effective attacks always target her relay's buffer depth around tick 50-70 of long matches. Her relay is the structural weak point for late-game pressure.

She adds a session note: *"Relay buffer endurance is my systematic weakness for long-match opponents. Need to investigate 2.27 (buffer exhaustion as late-game mechanic) implications for my architecture."*

**UI Annotations:**
- **Adversarial history integration:** In the config history panel (4.38), adversarial forks appear with a red-reticle icon instead of blue fork icon. They're filterable: "Show only adversarial forks."
- **Multi-attack-vector workflow:** "Find My Counter" can be run once per adversarial result row. Each generates an independent fix. A batch-apply button queues all fixes at once if they don't conflict.
- **Structural debt indicator:** When "Find My Counter" returns 0 solutions for an adversarial vector, the vector row displays: "No single-element counter found — this may require architectural change." Accompanied by a small amber construction-hat icon.

---

#### Journey: Dev, 19, College Student, First Ranked Match

**Context:** Dev played the first six campaign missions and thought the Gauntlet mode sounded scary. His friend showed him a Twitch stream where someone ran adversarial mode on a convincing win — the streamer called it "the game trying to humble you." Dev thought that was funny and signed up for ranked just to try it.

He just won his first Gauntlet match by deploying the v1.0 config from his last campaign mission with almost no changes. EDT 0.71 — he barely won. The match lasted 118 of 120 ticks. He had no idea what he was doing for most of it.

**Minute 0:00 — Act 2 for the First Time**
Dev has never seen Act 2 before. The materialization animation plays — the grey seal dissolves, the analytical overlays bloom onto the battlefield replay, the EDT gold diamond appears at tick 85. He doesn't fully understand what he's looking at, but he knows that diamond means "this is when it was decided."

He reads the plain-language summary: **"Your match was contested for 85% of its length. You won on presence score accumulation after your opponent's relay fell silent at tick 91."**

He sees the red-team toggle. He remembers the stream. He clicks it.

**Minute 1:00 — The Adversarial Results**
Results: **"3 single-element changes found that would have defeated you."**

Dev reads them. The first two are opaque — they reference hook semantics and fidelity thresholds he doesn't understand yet. But the third one he can parse:

*"Opponent's RELAY: increase buffer_size from 3 to 4. This would have allowed one additional compressed signal to remain in the relay's buffer during the late-game pressure (ticks 80–91), sustaining their striker's threat awareness through tick 95 instead of tick 88. Your presence score lead was not sufficient to absorb the additional 7 ticks of contested combat."*

Buffer size. One slot. He checks his own relay in the workbench. His relay has a buffer size of 3 too.

He doesn't run "Find My Counter." He doesn't know what that would do. Instead he opens his config and changes his relay's buffer size from 3 to 4 — not as a counter, but because he now understands that this one number has implications he didn't think about.

**Minute 2:00 — The Realization**
Dev sits for a moment. He barely won this match. Three single-element changes to the opponent's config would have beaten him. He changed one number in his config based on understanding what the buffer slot *means* in a long match.

He doesn't feel embarrassed. He feels like he's been shown a secret about the game. The match wasn't just a win or a loss — it was a test, and the adversarial mode just showed him the test questions.

He queues his relay buffer change as v1.1 and deploys.

**UI Annotations:**
- **Plain-language result descriptions:** Adversarial results use the same plain-language generation as EDT panel summaries. Avoid jargon in the first result. Use jargon with tooltips in results 2 and 3.
- **"Find My Counter" button placement:** Below results, but with a label "Patch this weakness" for first-time users (tooltip: "Find the smallest change to your config that defeats this improved opponent"). Label reverts to "Find My Counter" after the player has used it once.
- **Gentle unlock:** Adversarial mode is accessible on first Gauntlet match, not gated. But the onboarding tooltip for it says: "This tool is more useful after you understand Act 2 fully. You can come back to it any time." Respects beginner tempo without locking the feature.

---

## Strengths

**Solves the complacency problem.** Winning without learning is one of the most common failure modes in skill development. Adversarial mode creates a learning signal even from decisive victories by inverting the question.

**Teaches transferable skills explicitly.** Red-teaming, adversarial simulation, threat modeling — these are professional practices in cybersecurity, strategy, and systems design. This mode names them and makes them tactile.

**Closes the gap between wins and losses.** Currently the debrief tooling heavily rewards loss analysis (there's something to diagnose). Adversarial mode gives wins equal analytical depth without artificial friction.

**Generates arms-race dynamics.** The "Find My Counter" step creates a micro-iteration of the meta-evolution within a single debrief session. Players who run this consistently will produce configs that have been tested against their own discovered attack vectors.

**High ceiling for expert players.** Keiko's pattern-recognition across multiple adversarial runs (identifying relay buffer endurance as a recurring weak point) is exactly the kind of meta-architectural insight that separates Commander from Overseer tier. The tool supports that journey.

---

## Weaknesses

**Cognitive cost is high.** Understanding adversarial mode requires: knowing what the standard MFE does, knowing how to read the opponent's config, and understanding what "defeat me more decisively" means as an objective. Beginners can use it with plain-language summaries but won't extract full value until they understand Act 2 deeply.

**False threat model risk.** The adversarial explorer only finds single-element changes. A sophisticated attack requiring coordinated multi-element changes is invisible to it. A player who exclusively uses adversarial mode might become confident they've closed all vulnerabilities when they've only closed the ones visible within the single-element search space.

**Opponent config exposure.** Showing the opponent's full config in Act 2 is already a significant information reveal. Adversarial mode extends this by making the opponent's config an editable simulation surface. This may feel invasive or uncompetitive to some players. Consider: does the opponent have visibility into the fact that you ran adversarial mode on their config? Should this be disclosed?

**Computational cost for "most decisive" variant.** The minimum flip is bounded (~50–150 candidates). Finding the "most decisive" variant (maximize win margin) is an optimization problem with a broader search space. May require additional constraints or approximations for responsive UI.

---

## Interaction Effects

**4.38 Counterfactual history:** Adversarial forks are stored in the same version-history graph as standard forks. The history now represents both "what I tried to fix" and "what could have beaten me." This creates a complete threat-model archive over time.

**7.10 Necropsy culture:** A community necropsy (shareable config analysis artifact) that includes adversarial runs is significantly richer. "Here are the three attacks I found against v3.3 and the counters I deployed in v3.4" is a complete thread of argument that teaches the community not just what changed but why.

**2.12 Deception signals / 2.16 Counter-intelligence:** If the opponent was running deception attacks (fidelity spoofing, injected hooks), the adversarial explorer can find "what if they'd optimized their deception pipeline?" — e.g., "increasing fidelity spoof accuracy by 15% would have caused your threshold filter to accept the injected signal." This is an attack vector audit specifically for counter-intelligence architectures.

**1.06c async PvP:** The reason adversarial mode is possible at all is that async PvP requires full deterministic config disclosure post-match. In a synchronous live game, you might not have access to the opponent's full config. Robot Uprising's async model makes the opponent's config a public artifact after the match resolves — which is what enables adversarial simulation.

**4.37 Fork-and-deploy:** The "Find My Counter" step produces a standard fix that can be applied via the same fork-and-deploy pipeline. The result is: adversarial run finds vulnerability → counter run finds fix → one-click apply queues it. Full loop without leaving the debrief.

**4.47 Autonomy dial:** On the "Guide me" setting, adversarial mode's result panel might include a plain-language narrative: "Your opponent was one small change away from defeating you. Here's what that would have looked like." On the "Apply immediately" setting, the "Find My Counter" fix can be auto-queued without confirmation. The autonomy dial governs how much friction is present in each step.

---

## Comparable Games/Media

**Professional red-teaming (cybersecurity):** Red teams are given adversarial mandates to find and exploit weaknesses in their own organization's defenses. The adversarial counterfactual mode is this exact practice formalized as a game mechanic. Robot Uprising is teaching real professional methodology.

**Military wargaming:** The OPFOR (opposing force) methodology in military exercises: dedicated units play the enemy to find weaknesses in friendly plans before they're deployed in real operations. Robot Uprising's adversarial mode is a one-player version of this — you are both the defender and the OPFOR.

**Chess engine adversarial analysis:** Modern chess engines allow players to analyze from either side's perspective. "Why was this move good for Black?" is the same inversion as "what change to the opponent's config would have beaten me?" Chess.com's "Blunder" detection applies to both colors simultaneously.

**Poker hand range analysis:** "What range is villain representing?" — a poker player doesn't just analyze their own play; they simulate the range of hands the opponent could hold given observed actions. Adversarial mode asks "what config could my opponent have built?" rather than "what config did they actually build."

**Into the Breach:** The game shows enemy intents before you act — you can see what the enemy *would* do. This is perfect-information adversarial planning in real time. Robot Uprising's adversarial mode brings that same "see the enemy's optimal play" clarity to the post-match debrief.

**Warhammer 40k list-building:** Competitive players build lists by asking "what armies currently beat my list, and what changes would they need to make?" This is exactly the adversarial mode mental model applied to miniature wargaming.

---

## Sensory Description

**The moment you activate red-team mode:** The debrief panel border shifts from a neutral cool grey to a deep crimson-amber. Not aggressive — measured. A single low tone, like a security door engaging. The opponent's config tree materializes on the left, rendered in cool blue against the warm red border. The contrast is intentional: blue/cold is the opponent's perspective, warm/red is the attack scenario.

**The adversarial explorer progress bar:** Same binary-cascade animation as the standard MFE, but running left-to-right in amber-red segments instead of teal-green. Each segment represents a candidate attack vector being tested. When a hit is found, the segment pulses once in bright red before fading back to amber.

**The results panel:** Each result row has a subtle red-tint background. The "attack vector" label appears in bold amber. The minimum flip row has a single targeting-reticle icon on the left. The most decisive row has a fully-drawn-out reticle on the left.

**The ghost overlay in adversarial mode:** Your real match plays in full color. The adversarial variant — the improved opponent, beating you — plays in deep amber-red with slight desaturation of your units. Watching the amber-red simulation "win" against the full-color you is uncomfortable in a productive way: it activates the exact defensive instinct you want the player to feel.

**The red split marker:** Where the standard fork shows a crisp blue vertical line on the timeline, the adversarial fork shows a red vertical line with a small downward-pointing triangle at the base. The triangle reads as "this is where the attack diverts." On hover, tooltip: "Attack divergence point: tick X — this is when the improved opponent's advantage first becomes visible."

**The "Find My Counter" transition:** Clicking the button triggers a soft thematic shift — the crimson border fades back to neutral grey, the opponent's config tree un-highlights, and your own config tree re-highlights in teal. The transition sound is a single two-note interval: the red-team alarm resolves to the workbench's familiar open-investigation tone. You're back on defense. Time to patch the hole.

---

## The TikTok Clip

The screen shows a match result screen. "WIN. EDT: 0.19" — crushing victory. The player clicks adversarial mode.

The progress bar runs. Three results appear. The player's reaction: visible pause. They hover over result 2.

**Cut to the ghost overlay.** The player's full-color units moving confidently. The amber-red adversarial opponent — slightly different config — maneuvering differently. The divergence happens at tick 12. By tick 30, it's clearly going the wrong way. The player loses in the adversarial simulation.

The player's reaction: **"oh no."** They click "Find My Counter." The fix loads in 8 seconds. One line.

Caption: **"i just won, and then the game showed me how i should have lost"**

---

## New Aspects Discovered

- **4.54 — Adversarial explorer exposure policy:** should the opponent be notified that you ran adversarial mode on their config? Opt-in mutual disclosure (both see each other's adversarial results) vs. private (neither knows) vs. public (full adversarial history visible on profiles); privacy norms in a competitive analysis context
- **4.55 — Cross-match adversarial aggregation:** after running adversarial mode on 5+ matches against different opponents, find recurring attack vectors that appear in ≥2 adversarial runs — "three different opponents independently discovered your relay's hook threshold is the exploit point"; the structural weakness that the community hasn't formally coordinated against but is independently discovering
- **4.56 — Adversarial mode for PvE missions:** apply the same logic to campaign missions — what change to the enemy config would have made this mission hardest for your specific architecture? The mission's adversarial variant as a "hard mode" generator; interaction with 2.19 variable scenario seeds
- **4.57 — The "threat model" report:** a single-page summary of all adversarial runs against a given config version — every attack vector found, every counter deployed, every structural debt item flagged — as a formal document analogous to a security penetration test report; the threat model as a shareable artifact (necropsy extension)
