# 5.11b — The Corrupted Diff as Endgame Adversarial Escalation

**Aspect ID:** 5.11b
**Wave:** 5 (Campaign & Progression)
**Category:** Campaign
**Related aspects:** 5.11a (document-as-corrupted-surface), 5.22 (Gauntlet as third act), 6.03a (Predecessor character arc), 5.14 (detection skills as complexity gate), 4.04b (two-act debrief structure), 5.11e (corruption as enemy characterization), 6.10a (corruption audio learning curve), 2.20 (observation gap)

---

## The Core Design Problem

By Mission 8 or 9, the player has developed a reliable corruption-detection workflow: open the document, run the diff view, restore corruptions, proceed. The diff view has become a safety net — a one-click verification tool that renders all previous corruption models (subtle rewrites, redactions, injections, palimpsests, trojan diagrams) into trivially solvable puzzles. The player scans, clicks RESTORE ALL, hears the chime cascade, and moves on.

This is the **tool dependence trap**. The diff view was introduced to teach verification habits, but it has become a crutch. The player no longer *reads* the document — they *diff* it. They've substituted tool-assisted scanning for genuine understanding. The corruption mechanic has collapsed from "verify your knowledge" to "click the button."

**The corrupted diff mission is the game's answer to this trap.** It's the moment where the safety net is cut, and the player discovers whether they actually internalized the material or merely learned to operate the diff tool.

This is also the game's deepest pedagogical claim: **tools assist judgment but cannot replace it.** The diff view is `git diff`. The corrupted diff is the lesson that `git diff` can be wrong — that merge conflicts can be silently resolved incorrectly, that CI pipelines can pass on broken code, that automated tests can have false negatives. The player who has been burned by a corrupted diff will never again treat any automated verification as infallible. That's a career-defining lesson.

---

## Five Approaches to Corrupted Diff Design

### Approach A: "The Baseline Poisoning" — Enemy Overwrites the Clean Reference

The diff view works by comparing the current document state against a stored "clean baseline" — the last known-good version. The enemy doesn't touch the document itself. Instead, it overwrites the baseline to match the corrupted document. Both now say the same thing. The diff computes zero differences. "No modifications detected."

**How it works mechanically:**
- The enemy introduces a corruption to the document (e.g., changes buffer eviction from FIFO to LIFO)
- Simultaneously, the enemy overwrites the corresponding baseline entry to also say LIFO
- The diff view compares: current=LIFO, baseline=LIFO → "no changes"
- The document is wrong, but the tool says it's right

**What the player sees:**
The diff view opens with its usual split-pane layout. The left panel (baseline) and right panel (current) are identical. The status bar reads "✓ No modifications detected" in calm green. The ambient is clean — no Geiger clicking, because the audio corruption system keys off the diff view's state. The enemy has corrupted the diff *and* silenced the alarm.

**The silent alarm problem:** If the Geiger counter clicking is wired to the diff view's output (as implied in 5.11a), then poisoning the baseline also silences the audio detection channel. This creates a terrifyingly clean experience — no visual, no auditory, no tool-based indicator that anything is wrong. The only detection method is the player's own memory.

**Design risk:** If the audio system is independently scanning document content (comparing text against game state rather than against baseline), the Geiger counter would still fire even when the diff is compromised. This is a critical architectural decision — does the audio system have its own baseline, or does it piggyback on the diff view's?

**Recommendation:** The audio system should have its own independent detection path for exactly this scenario. But in the mission where the corrupted diff is introduced, the audio system should *also* be suppressed (by the enemy explicitly targeting both channels) to create the maximum "nothing is wrong" illusion. In subsequent missions, the audio might recover first, teaching the player that redundant verification channels are valuable precisely because they can be compromised independently.

**The vocabulary parallel:** This is a **supply chain attack on the verification tool**. The attacker didn't forge a document — they forged the tool that checks documents. In software engineering terms: someone compromised your test suite so that tests pass on broken code. The build is green. The code is wrong.

### Approach B: "The Selective Blind Spot" — Diff View Shows Some Corruptions But Hides Others

The diff view isn't completely compromised — it correctly identifies *some* corruptions while missing others. The enemy has learned to evade the diff for specific corruption types while remaining detectable for others.

**How it works mechanically:**
- The diff view correctly catches 2 out of 3 corruptions
- The player runs the diff, sees amber highlights, clicks RESTORE, hears chimes
- They believe the document is now clean because they "found and fixed" the corruptions
- The third corruption — the one the diff missed — remains active

**What the player sees:**
The diff view opens. Two amber highlights appear. The player restores them. Chimes play. Status bar: "✓ All modifications restored." This is a lie — there is one more corruption that the diff cannot see.

**The false-clean signal:** This is more dangerous than Approach A. In A, the diff shows nothing, which might make a suspicious player manually check. In B, the diff shows *something* — and the act of finding and fixing corruptions creates a false sense of completeness. "I found two, I fixed two, the document is clean." The player's own successful use of the tool becomes the trap.

**The vocabulary parallel:** This is **testing with incomplete coverage**. Your tests found and caught two bugs. You assume the code is clean. The third bug, in the untested path, ships to production.

### Approach C: "The Inverted Diff" — Diff View Shows Correct Text as Corrupted

The diff view marks *correct* text as corrupted and recommends "restoring" it to an incorrect version. Clicking RESTORE makes the document *worse*.

**How it works mechanically:**
- The document currently says "Buffer size: 10" (correct)
- The corrupted baseline says "Buffer size: 6" (the enemy's preferred value)
- The diff view highlights "Buffer size: 10" in amber and suggests restoring to "Buffer size: 6"
- If the player clicks RESTORE, they overwrite correct text with the enemy's version

**What the player sees:**
The diff view opens. An amber highlight appears on a value. The player reaches for RESTORE — but something feels off. The "original" value shown in the diff doesn't match what they remember. Was the buffer size really 6 before? They thought it was 10. But the tool says 6 was the original...

**The gaslighting problem:** This approach puts the player in direct conflict with their own tool. Their memory says one thing; the diff view says another. This is the most psychologically intense variant — it's not just that the tool missed something, it's actively lying about what the truth is. The player must choose: trust the tool, or trust their own memory.

**Design risk:** This is genuinely distressing for some players. Being told by an authoritative tool that your memory is wrong is a known anxiety trigger. The game must provide a secondary verification path (mission history comparison, as described in Marcus's journey in 5.11a) so that the player can confirm their memory is correct without relying solely on an internal sense of doubt.

**The vocabulary parallel:** This is a **compromised rollback**. Someone poisoned your backup. Restoring from backup doesn't fix the problem — it reintroduces the attacker's payload. In a real incident, restoring from a backup that was taken after the compromise but before detection makes things worse, not better.

### Approach D: "The Time Bomb" — Diff View Is Correct Now, Corrupted Later

The diff view works correctly during the Plan phase. The player runs it, verifies the document, configures their agents. Then, during the Sealed Watch or after it (in the Inspector phase), the diff view's baseline is corrupted retroactively. When the player returns to the document during debrief, the diff now shows the corrupted values as "original."

**How it works mechanically:**
- Plan phase: diff view is accurate, player verifies and configures
- Sealed watch runs
- During the transition to Inspector, the enemy corrupts the diff baseline
- Inspector phase: player opens document to diagnose failure, diff now shows corrupted baseline
- The player cannot trust the diff to tell them what the document said when they configured their agents

**What the player sees:**
During debrief, the player is trying to understand why RELAY-2 failed. They open the document to check the hook timeout they configured. The document says "5 ticks." They run the diff. The diff says "5 ticks was the original value — no modification." But they *configured* the agent at 2 ticks, which means... did the document change during the sealed watch? Or did the diff change during the sealed watch?

**The temporal confusion:** This variant interacts beautifully with Model 6 (Living Document) from 5.11a. The player is already primed to suspect that the document can change during a mission. Now the diff view — their tool for detecting such changes — is also unreliable across time. The player cannot reconstruct the state of their reference material at any given point.

**The vocabulary parallel:** This is **log tampering**. An attacker who compromises an audit log retroactively makes incident investigation impossible. You can't determine what happened because the record of what happened has been altered.

### Approach E: "The Confidence Attack" — Diff View Shows Results with Degrading Certainty

Instead of a binary "modifications detected / no modifications," the diff view begins to report results with a confidence percentage. "87% confidence: no modifications detected." The confidence degrades as the enemy's infiltration deepens.

**How it works mechanically:**
- Mission 8: diff confidence = 100% (working normally)
- Mission 9: diff confidence = 85-95% (enemy is probing the diff's defenses)
- Mission 10: diff confidence = 40-65% (diff is severely compromised)
- Below 70% confidence, the diff view's results are unreliable — it may miss corruptions or flag clean text

**What the player sees:**
The diff view status bar, which previously showed a simple "✓ No modifications detected," now reads: "⚠ 73% confidence — No modifications detected." The percentage pulses slightly, amber rather than green. The player must decide: is 73% good enough? Do they trust it? Or do they spend time manually verifying?

**The budget tension:** This variant creates a time-pressure decision. The player can accept the diff's uncertain verdict and proceed quickly, or manually verify every page at significant time cost. In a timed context (Gauntlet matches, speedrun attempts), this becomes a strategic choice — how much verification time is the accuracy worth?

**The vocabulary parallel:** This is **model confidence in AI systems**. An LLM that reports "I'm 73% sure" is teaching the player to calibrate trust in automated outputs — the exact skill Robot Uprising claims to teach. The diff view's degrading confidence is a microcosm of working with probabilistic AI tools.

---

## The Recommended Approach: Layered Escalation (A → B → C)

No single approach should carry the entire endgame. The corrupted diff should escalate across missions:

**Mission 9 (Introduction): Approach B (Selective Blind Spot)**
The diff finds 2 of 3 corruptions. The player fixes the two it found. The third remains. After the mission fails, the debrief reveals: "DIFF VIEW COVERAGE: 66.7%. ONE CORRUPTION UNDETECTED." This is the player's first encounter with a compromised tool — but it's a *partial* compromise, which is easier to process than a total failure.

The boot log at mission start reads: `// HOSTILE SUBSYSTEM HAS IDENTIFIED YOUR VERIFICATION PROTOCOL. PARTIAL EVASION ACHIEVED. MAINTAIN REDUNDANT VERIFICATION CHANNELS.`

**Mission 10 (Climax): Approach A (Baseline Poisoning) + Approach C (Inverted Diff)**
The diff view is fully compromised. The baseline has been poisoned. Some values show "no change" when they've been corrupted (A). Others show the *correct* values as corrupted and recommend "restoring" to enemy values (C). The player who runs the diff and clicks RESTORE ALL will actually *worsen* their document.

The boot log at mission start reads: `// HOSTILE SUBSYSTEM HAS ACHIEVED FULL DIFF VIEW INFILTRATION. AUTOMATED VERIFICATION UNRELIABLE. TRUST YOUR TRAINING.`

**Post-Campaign / Gauntlet: Approach E (Confidence Attack)**
In the competitive Gauntlet, the diff view reports confidence levels that vary per match. Some matches have 95% confidence (nearly reliable); others have 50% (coin flip). The player must calibrate their verification investment based on the reported confidence. This creates ongoing meta-game decisions rather than a single dramatic reveal.

---

## When to Reveal: The Dramatic Timing Problem

The corrupted diff is a **trust violation event**. The game has spent 6-7 missions building the player's trust in the diff view. Breaking that trust is a one-time emotional beat — like the moment in Portal when GLaDOS tries to kill you, or the moment in Undertale when Flowey reveals his nature. It can only happen once, and the timing matters enormously.

### Option 1: "The Failure First" — Player Fails Because of Corrupted Diff, Then Discovers Why

The player runs the diff, it shows clean, they configure and execute, the mission fails. In the debrief, the inspector reveals that a value was wrong. The player checks the document — it's corrupted. They run the diff — it says "no changes." The realization hits: the diff is compromised.

**Strengths:** Maximum dramatic impact. The player experiences betrayal in real-time. The "OH" moment is organic — they discover it themselves through investigation.
**Weaknesses:** Could feel unfair. "The game gave me a tool, then made the tool lie to me, and I failed because of it." Players who lose a 20-minute mission because of something they couldn't have detected may feel cheated.

### Option 2: "The Warning First" — Boot Log Warns, Player Must Act on Warning

The boot log explicitly states: "DIFF VIEW COMPROMISED. DO NOT TRUST AUTOMATED VERIFICATION." The player reads this. The diff view still shows "no changes." The player must choose: believe the boot log, or believe the diff.

**Strengths:** The player has been warned. Failure is their own choice to ignore the warning. This is fair.
**Weaknesses:** Reduces dramatic impact. The reveal isn't a surprise — it's a stated fact. The "OH" moment becomes "oh right, the boot log said that."

### Option 3: "The Predecessor's Warning" — Narrative Delivery

The Predecessor (see 6.03a) delivers the warning in character. At Mission 9 or 10, the Predecessor's boot log text shifts tone: "I lost an entire sector because I trusted my diagnostic outputs after the enemy learned to spoof them. Your diff view is not safe. The only verification that matters is the one in your head."

**Strengths:** Ties the corrupted diff to the Predecessor's personal history, making it emotionally resonant rather than just mechanical. The Predecessor's vulnerability ("I lost an entire sector") makes the warning feel urgent.
**Weaknesses:** Requires the player to have engaged with the Predecessor's narrative. A player who skips boot logs will miss this warning entirely.

### Recommendation: Option 1 for Mission 9, Option 3 for Mission 10

**Mission 9:** The player fails because of a partial diff compromise (Approach B). No explicit warning. The failure is the teaching moment. The debrief reveals the undetected corruption and surfaces the "DIFF VIEW COVERAGE: 66.7%" stat. The player learns through experience: the diff can miss things.

**Mission 10:** The Predecessor warns explicitly. The player now knows the diff is compromised — but they don't know *how*. Is it missing things (Approach B again)? Is the baseline poisoned (Approach A)? Is it actively recommending wrong values (Approach C)? The Predecessor doesn't say. The player must navigate maximum uncertainty with full awareness that they're in danger.

This two-beat structure mirrors the "sealed watch → inspector" two-act debrief pattern (4.04b): first the emotional hit (Mission 9 failure), then the analytical response (Mission 10 preparedness).

---

## The "No Tool Is Infallible" Lesson

This is the mission's deepest purpose. The game has spent its entire campaign building a toolkit:
- The diff view (document verification)
- The inspector (decision trace analysis)
- The signal genealogy (causal chain visualization)
- The context window chart (buffer utilization history)
- The Fix Explorer (counterfactual simulation)

Each tool was introduced as a solution to a problem. The player has learned to trust these tools. The corrupted diff teaches: **every tool has a failure mode.** The question isn't "does this tool work?" — it's "under what conditions does this tool fail, and how do I detect those conditions?"

This lesson extends beyond the diff view. Once the player has experienced one compromised tool, they'll wonder about the others:
- Can the inspector's decision trace be corrupted? (Could the enemy inject false decision records?)
- Can the signal genealogy graph be spoofed? (Could the enemy forge signal chains?)
- Can the context window chart be manipulated? (Could the enemy alter the historical record?)

The game doesn't need to actually corrupt these other tools (that might be too much — see "Weaknesses" below). The *fear* that they might be corrupted is enough. The player's relationship with all their tools has shifted from unconditional trust to calibrated trust. This is the mindset shift.

**The real-world parallel:** Every monitoring system has failure modes. CloudWatch can miss events. Grafana dashboards can show stale data. CI pipelines can pass on broken code. The engineer who has been burned by a false-green dashboard will forever check production directly rather than trusting the dashboard alone. That's the lesson. It's career-defining.

---

## Mechanical Design: How the Corrupted Diff Works in Practice

### The Diff View's Normal Operation (Missions 7-8)

The diff view maintains a `baseline.json` file (conceptually — the player never sees this) containing the "last verified clean" state of every document page. When the player opens the diff view:

1. Current document text is compared against `baseline.json`
2. Differences are highlighted: green (added), red (removed), amber (modified)
3. `[RESTORE]` buttons appear next to each difference
4. Clicking `[RESTORE]` reverts the current text to the baseline value
5. Status bar shows "✓ All modifications restored" when clean

### The Compromised Diff View (Mission 9+)

The enemy gains write access to `baseline.json`. Depending on the approach:

**Approach B (Selective Blind Spot):** The enemy updates specific `baseline.json` entries to match the corrupted document. The diff correctly detects *other* corruptions (ones the enemy didn't bother to mask). The player fixes those. The masked corruption remains.

**Approach A (Baseline Poisoning):** The enemy rewrites `baseline.json` entirely to match the current (corrupted) document. Every diff comparison returns "identical."

**Approach C (Inverted Diff):** The enemy writes *incorrect* values into `baseline.json` for entries that are currently correct. The diff flags correct text as corrupted and recommends "restoring" to the enemy's preferred (wrong) values.

### The Secondary Verification Tool: Mission History Comparison

Introduced in Mission 9 as a direct response to diff compromise, the `[VERIFY AGAINST MISSION HISTORY]` tool bypasses the baseline entirely. Instead of comparing current text against `baseline.json`, it compares current text against the *actual configurations used in past successful missions*.

For example: "Your RELAY-2 in Mission 8 (VICTORY) used hook timeout = 2. Current document says hook timeout = 5. DISCREPANCY."

This tool cannot be corrupted the same way because it draws from the player's own mission records — the actual configs that were deployed and succeeded. The enemy would need to retroactively alter mission records to compromise this tool, which is a significantly higher bar (and potentially a Mission 10 or Gauntlet escalation).

**The design elegance:** The mission history comparison tool teaches the player that **production behavior is the ultimate source of truth**. Not the docs. Not the tests. Not the dashboard. What actually happened in production. This is the `observability > documentation` principle that modern SRE culture lives by.

---

## Player Journeys

### Journey: Riya, 30, Senior Backend Engineer

**Context:** Mission 9 — "Insurgent Network." Riya has been playing methodically for 8 hours across a week. She runs the diff view before every mission since it was introduced in Mission 7. She's never missed a corruption. She trusts the diff completely.

**Minute 0:00 — The Pre-Mission Routine**
Riya's workbench loads. The Ifugao terrace map glows softly. She reaches for the document icon automatically — her ritual. Click. The tactical archive slides open. She clicks the diff icon. Two amber highlights appear.

"Signal compression ratio changed from 0.6 to 0.3. Hook broadcast range changed from 'same channel' to 'all channels.'" She clicks RESTORE, RESTORE. *Chime. Chime.* Status bar: "✓ All modifications restored." She nods.

The ambient is clean. No clicking. The document looks right. She closes it and begins configuring her agents. She sets RELAY-1's eviction priority to "age-first" — she remembers the document recommending this for multi-channel configurations. She didn't re-read the recommendation; she remembers it from three missions ago.

**Minute 1:30 — Configuration Confidence**
Riya builds a three-relay chain: SCOUT → RELAY-1 (filter) → RELAY-2 (compress) → RELAY-3 (amplify) → STRIKER. She's proud of this architecture. The eviction priority on RELAY-1 is "age-first" — oldest entries go first, keeping buffer fresh.

She doesn't open the eviction policy page of the document. Why would she? The diff showed only two corruptions, both fixed. The document is clean.

**Minute 2:00 — EXECUTE**
The board snaps into action. Scouts fan out. Signals begin flowing. By tick 10, the chain is active. Enemy positions are being relayed. Everything looks good.

Tick 15: RELAY-1's context bar shifts from blue to amber. Then — tick 17 — red. Buffer overflow. RELAY-1 is stunned for one tick. A jittering spark visual. The chain goes dark for a beat.

Tick 18: RELAY-1 recovers, but the eviction during stun dropped the critical enemy-position signal. RELAY-2 and RELAY-3 propagate stale data. STRIKER-1 engages at a position the enemy left three ticks ago. Whiff.

Tick 22: The enemy scout tags Riya's factory node. Resource income drops. The mission spirals.

**Minute 4:00 — The Debrief**
Sealed watch ends in failure. The inspector materializes. Riya scrubs to tick 15. She clicks RELAY-1. Buffer inspector: every slot filled with low-priority noise. The eviction policy shows "priority-first" — not "age-first."

Riya frowns. "I set it to age-first." She opens the workbench config. The config shows: eviction = age-first. She opens the document. The eviction policy page reads: "Recommended eviction for Relay units: **priority-first** (evict lowest-priority entries first)."

She pauses. She remembers it saying "age-first." She runs the diff.

Status bar: "✓ No modifications detected."

The eviction recommendation was corrupted. The diff didn't catch it. The diff said the document was clean. It wasn't.

**Minute 5:00 — The Realization**
A new stat appears in the debrief panel she hasn't seen before: `DIFF VIEW COVERAGE: 66.7% — 1 CORRUPTION UNDETECTED`. The number is in amber, pulsing. Below it: `VERIFICATION METHOD COMPROMISED. HOSTILE BASELINE INFILTRATION DETECTED.`

Riya stares at the screen. She reviews the diff again — the two corruptions it *did* find were real. The enemy let her find those. They were decoys. The one that mattered — the eviction policy swap — slipped past because the enemy had updated the baseline for that specific entry.

She feels cold. Not the cold of losing a mission — she's lost plenty. The cold of realizing her safety net has a hole. She trusted the diff the way she trusts her test suite at work. And it had a blind spot.

**Minute 6:00 — The New Tool**
A notification appears: "NEW TOOL UNLOCKED: VERIFY AGAINST MISSION HISTORY." Riya opens it. It compares the current document against her actual configs from Mission 8 (victory). Three amber entries appear — including the eviction policy swap the diff missed.

She fixes it. A deeper correction tone plays — the minor-to-major chord resolution described in 5.11a for Marcus's journey. It sounds heavier than the standard chime. It sounds earned.

**Minute 7:00 — Retry with Distrust**
Riya re-executes. This time, before configuring, she runs *both* the diff view *and* the mission history comparison. Where they disagree, she trusts the mission history. Where neither has data (new mechanics not used in prior missions), she reads the document carefully and cross-references against her own memory.

Mission succeeds. In the debrief: `DIFF VIEW COVERAGE: 66.7%. MANUAL VERIFICATION: 100%. ZERO UNDETECTED CORRUPTIONS.`

Riya screenshots this. She sends it to her team's Slack with the caption: "this game just taught me more about test coverage than my CS degree did."

**UI Annotations:**
- `DIFF VIEW COVERAGE: XX.X%` — new debrief stat, visible only when diff coverage < 100%, amber pulsing
- `VERIFY AGAINST MISSION HISTORY` — new tool button in document toolbar, icon is a clock with a checkmark, unlocked after first diff-miss encounter
- Mission history comparison: shows configs from player's last victory, highlighted where current document diverges from deployed values
- The decoy corruptions (the two the diff DID catch) use standard amber highlight; the one it missed has no visual indicator in diff view at all

---

### Journey: Tomás, 14, Student, Casual Player

**Context:** Mission 9. Tomás has been playing for 5 hours total, spread across two weeks. He uses the diff view because the game taught him to, but he doesn't deeply understand most document content. He clicks RESTORE ALL without reading what changed.

**Minute 0:00 — The Speed Run**
Tomás opens the workbench. He opens the document. He clicks the diff icon immediately — doesn't look at the content first. Two amber highlights. He clicks RESTORE ALL. *Chime-chime.* "All good." He closes the document without reading it.

He copies his Mission 8 config — it worked last time, so he figures it'll work again with minor tweaks. He adds a second Striker because the mission briefing mentions "heavy resistance." He doesn't change any other settings.

**Minute 1:00 — EXECUTE**
The sealed watch runs. His scouts find enemies. His relays forward signals. But something is wrong — STRIKER-2's behavior is erratic. It should be following tagged enemies, but it's ignoring tags and patrolling randomly.

Tick 18: STRIKER-2 walks past a tagged enemy. No engagement. The enemy destroys a Scout. Tomás groans.

**Minute 3:00 — The Inspector**
Tomás clicks STRIKER-2 in the inspector. Decision trace: "Rule 1: IF tagged_enemy_adjacent THEN engage. Evaluation: NO tagged enemies in context window." But the scout tagged that enemy five ticks ago. Why isn't it in STRIKER-2's context?

He checks the context window. Full of noise. The eviction policy evicted the tag notification to make room for... his own scouts' position updates? The eviction priority is wrong.

**Minute 4:00 — Confusion**
Tomás doesn't fully understand what happened. But the debrief shows a new amber stat: `DIFF VIEW COVERAGE: 66.7%`. He reads the tooltip: "The diff view missed 1 corruption. Your document may still contain enemy modifications."

He opens the document. He runs the diff again. "No modifications detected." He frowns. He opens the new tool — "VERIFY AGAINST MISSION HISTORY" — that just appeared. It highlights the eviction policy page. "Mission 8 config used: age-first. Current document says: priority-first."

Tomás reads both words. He doesn't fully grasp the difference, but he understands that the document was wrong and his tool didn't catch it. He clicks the fix. The deeper chord plays.

**Minute 5:00 — The Lesson Lands Partially**
Tomás retries with the fixed config. Mission succeeds. He doesn't screenshot the debrief. But a seed has been planted: the diff view isn't always right. In three years, when he's debugging a failing test suite at his first internship, he'll remember the feeling of "the tool said it was fine, but it wasn't." He won't remember the game's name. He'll remember the lesson.

**UI Annotations:**
- RESTORE ALL button: Tomás never reads individual corruptions, just clicks the batch fix
- `DIFF VIEW COVERAGE` tooltip: must explain the concept simply — "The diff view found 2 of 3 corruptions. 1 was hidden."
- Mission history comparison: designed to be actionable even for players who don't understand the underlying mechanics — "this is different from what worked before" is clear even without understanding why

---

### Journey: Kwame, 32, Twitch Streamer, 400 Viewers

**Context:** Mission 10 — the factory-vs-factory climax. Kwame is streaming his first attempt at the final mission. He's theatrical, narrates everything, and chat is active. He read the Predecessor's warning in the boot log aloud: "Your diff view is not safe."

**Minute 0:00 — The Performance of Distrust**
"Okay chat, the Predecessor said don't trust the diff. But I have to check anyway, right?" Kwame opens the diff view. Three amber highlights appear. Chat erupts: "DON'T CLICK RESTORE" / "it's a trap!" / "some of those might be fake."

Kwame reads the first highlight: "Context window size changed from 12 to 8 for Relay." He pauses. "Chat... was it 12 before? I think it was 12." He reads the second: "Hook timeout changed from 2 to 5." He thinks. "This one... I'm less sure. Was it 2 or 3? The diff says 'restore to 2' but..."

He reads the third: "Eviction priority changed from FIFO to priority-based." He frowns. "I KNOW this one was FIFO. I used FIFO in Mission 9. So the diff is right about this one."

**Minute 1:30 — The Detective Stream**
"Chat, I'm going to check each one against my Mission 9 config." He opens the mission history comparison tool. It shows: Relay context window = 12 (matches diff), hook timeout = 2 (matches diff), eviction = FIFO (matches diff). All three diff suggestions match mission history.

"Okay, so either all three are real corruptions, or the enemy corrupted BOTH the diff AND my mission history for the same values." He pauses dramatically. "Which would be INSANE."

He clicks RESTORE on all three. Chimes play. But he doesn't stop. He reads every page of the document manually, line by line, narrating to chat. "I'm looking for anything the diff DIDN'T catch. Because the Predecessor said Level 3 infiltration. Level 3!"

**Minute 3:00 — The Manual Catch**
Page 4 of the production queue section. Kwame reads: "Recommended factory production cycle: 4 ticks per unit." He stops. "Chat. CHAT. I just played Mission 9 and the cycle was 3 ticks. I REMEMBER because I was counting ticks during the sealed watch. Three ticks per unit."

He runs the diff on this page. "No modifications detected." The diff says 4 ticks is correct. The mission history tool shows... Mission 9 used a 3-tick cycle. DISCREPANCY.

"THE DIFF LIED. THE DIFF SAYS 4 IS ORIGINAL BUT IT'S NOT. IT WAS 3." Kwame slaps his desk. Chat goes nuclear: "corrupted diff CORRUPTED DIFF" / "the game is LYING to him" / "this is actually the greatest mission design I've ever seen."

He manually changes the value back to 3. The deep correction chord plays. "That sound. That's the sound of 'you caught something the robot couldn't catch.' That's the sound of BEING SMARTER THAN YOUR TOOLS."

**Minute 4:30 — The Clip**
Kwame faces his camera. "Chat, I want you to understand what just happened. The game gave me a tool to check my documents. Then it CORRUPTED THE TOOL. And I only caught it because I REMEMBERED what the number was supposed to be. This is the most sophisticated thing a game has ever done to me." This clip gets 180,000 views. The title: **"the game corrupted my tools and I still caught it"**

**Minute 5:00 — EXECUTE with Maximum Distrust**
Kwame runs his config. The sealed watch is tense — 400 viewers watching tick by tick. STRIKER-1 eliminates two enemies. The relay chain holds. The factory produces on a 3-tick cycle. By tick 40, the enemy base falls.

**Minute 7:00 — The Debrief Badge**
Post-mission debrief shows: `ZERO UNDETECTED CORRUPTIONS — MIXED VERIFICATION (TOOL + MANUAL)`. A new badge appears: "TRUST BUT VERIFY." Kwame screenshots it. "That's my new professional motto. Trust but verify. The game taught me that."

**UI Annotations:**
- In Mission 10, the diff view returns *some* correct results and some inverted results — the player must cross-reference each one individually
- Mission history comparison tool in Mission 10: also shows correct data, creating a two-tool triangulation scenario where disagreements signal the specific corrupted entries
- Manual verification badge: awarded when the player catches a corruption that neither the diff view nor mission history comparison detected; requires the player to use `[FLAG AS SUSPICIOUS]` on the correct value
- The deep correction chord: triggers only for corruptions caught without tool assistance

---

### Journey: Elena, 45, High School Teacher, Accessibility Mode Active

**Context:** Mission 9. Elena plays with large fonts, high contrast mode, and extended time settings. She has mild memory difficulties and relies heavily on the diff view because she can't always remember what values were previously.

**Minute 0:00 — The Accessibility Challenge**
Elena opens the diff view. Two amber highlights. She restores them. Standard chime. "Clean."

She configures her agents based on the document. She doesn't realize the eviction policy section was silently corrupted — the diff missed it. She wouldn't have remembered the original value anyway; her memory doesn't retain specific numbers across sessions.

**Minute 2:00 — The Mission Failure**
Her agents fail because of the eviction policy. The debrief shows `DIFF VIEW COVERAGE: 66.7%`.

**Minute 3:00 — The Accessibility Path**
The mission history comparison tool appears. Unlike the diff view (which requires remembering what values "should" be), this tool shows concrete data: "Mission 8 used age-first eviction (VICTORY). Current document says priority-first." Elena doesn't need to remember — the tool remembers for her.

She fixes it. The correction chord plays. She retries and succeeds.

**The design insight:** The mission history comparison tool is not just a response to the corrupted diff — it's an accessibility feature. Players who cannot maintain a mental baseline of the document's "correct" state (due to memory difficulties, infrequent play sessions, cognitive load) need a tool-based alternative to "just remember what it said." The mission history tool provides this: it doesn't compare against a corruptible baseline, it compares against *what the player actually did when they succeeded*.

**Minute 5:00 — Post-Mission Reflection**
Elena doesn't have the "career-defining lesson" moment that Riya had. But she does learn a concrete workflow: always check both the diff AND the mission history before configuring. Two-tool verification. She writes this on a post-it note next to her monitor.

**UI Annotations:**
- High-contrast mode: diff highlights use thicker borders and pattern fills (not just color) for corrupted regions
- Large font mode: diff view uses scrollable split-pane with wider margins
- Mission history comparison: critical for accessibility — provides externalized memory that doesn't require the player to have internalized the document
- The tutorial hint for mission history comparison includes: "This tool compares against what you've actually used before — useful if you can't remember the exact values"

---

## Strengths

1. **The deepest pedagogical beat in the campaign.** "Tools assist judgment but cannot replace it" is a lesson most professionals learn through career-defining incidents. The game delivers it in a controlled environment where failure is safe and the lesson is clear.

2. **Natural escalation from 5.11a.** The document corruption mechanic established the principle (your reference material can lie). The corrupted diff escalates it (your verification tool can lie too). The escalation arc is: trust document → distrust document → trust diff → distrust diff → trust yourself. Each stage builds on the last.

3. **Multiple detection paths preserve fairness.** The mission history comparison tool ensures that even players who can't detect corrupted diffs through memory alone have a path to success. The game never requires the player to rely solely on unassisted recall.

4. **Viral potential.** The Kwame journey demonstrates: catching a corrupted diff on stream is a peak entertainment moment. The gap between "my tool says everything is fine" and "MY TOOL IS LYING" is inherently dramatic.

5. **Transferable skill with specific vocabulary.** "Baseline poisoning" maps to supply-chain attacks. "Selective blind spot" maps to incomplete test coverage. "Inverted diff" maps to compromised rollbacks. Every approach teaches a named, real-world security concept.

6. **Rewards deep engagement.** Players who have internalized the document's content catch corrupted diffs through memory. Players who haven't are protected by the mission history tool but don't get the "manual intercept" badge. The mechanic rewards investment without punishing casual play.

## Weaknesses

1. **Trust destruction cascade risk.** If the diff is compromised, the player may wonder: "What else is compromised? The inspector? The signal genealogy? The Fix Explorer?" This paranoia is productive in moderation but debilitating in excess. The game should explicitly reassure players that only the document diff is compromised — the other tools remain trustworthy. (Or: save tool compromise for a hypothetical expansion/sequel.)

2. **Memory-dependent fairness gap.** Players with strong memories will detect corrupted diffs earlier and more reliably than players with weaker memories. The mission history comparison tool mitigates this, but a gap remains: the "manual intercept" badge rewards a cognitive skill that not all players have equally.

3. **One-time emotional beat.** The first corrupted diff is shocking. The second is expected. By the third, it's routine. The mechanic has a diminishing returns problem. This is why the recommended approach layers three different corrupted-diff variants (B → A+C → E) — each feels different even though the underlying lesson is the same.

4. **Casual player frustration.** A player who doesn't understand *why* the diff was compromised — who experiences it as "the game cheated" rather than "the enemy outsmarted my tool" — will be frustrated rather than educated. The debrief must make the causal chain crystal clear: the enemy specifically targeted the diff baseline, here's how, here's what it changed.

5. **Timing pressure.** In a 10-mission campaign, Mission 9 is late to introduce a major new mechanic. Players who are struggling to complete Mission 8 may not have the emotional bandwidth for "and also your primary diagnostic tool is compromised." The difficulty should be calibrated so that the corrupted diff is the *only* new challenge in Mission 9 — everything else should be a natural extension of already-mastered skills.

---

## Interaction Effects

**With the Predecessor's character arc (6.03a):** The Predecessor's warning in Mission 10 is the emotional setup. Phase 5 ("Proud Witness") of the Predecessor's arc is about letting go and trusting the player. Warning about the corrupted diff is the Predecessor's *last useful teaching moment* before going silent during the sealed watch. It's their final gift: "I can't protect you from this. But I can tell you it's coming."

**With the two-act debrief structure (4.04b):** The corrupted diff's impact is felt most acutely in the inspector phase. During the sealed watch, the player doesn't know the diff was compromised. The revelation comes during analysis — when they're trying to understand why things failed. This means the inspector phase in Mission 9 has a "twist" embedded in it: the usual diagnostic flow (trace failure → find cause) gains an extra layer (cause leads back to corrupted tool). The two-act structure amplifies this: sealed watch builds confusion, inspector delivers the explanation.

**With the observation gap pattern (2.20):** The corrupted diff teaches temporal fog in the meta-game layer. Just as agents operate on stale information (observation gap), the player operates on stale verification (the baseline was poisoned between missions). The game's core theme — "you are always working with potentially outdated information" — extends from the battlefield to the player's own tools.

**With corruption audio (6.10a):** Critical architectural decision: when the diff baseline is poisoned, does the Geiger counter clicking still fire? If audio detection is independent of the diff, the player gets an "audio says wrong, diff says right" contradiction — a second detection channel. If audio piggybacks on the diff, both channels go silent simultaneously (scarier but less fair). Recommendation: audio is independent in Mission 9 (provides a lifeline), both channels compromised in Mission 10 (maximum challenge).

**With the detection skills system (5.14):** A Specialist unit with the `extract` skill could potentially recover the uncorrupted baseline from the enemy's communication channels during the mission — turning the corrupted diff from a pre-mission problem into a mid-mission tactical objective. "Deploy a Specialist near the enemy relay to recover your original baseline" adds a concrete in-mission goal that directly addresses the meta-level corruption.

**With community corruption reports (5.11d):** Players sharing "the diff lied to me" moments will become a sub-genre of community content. The corrupted diff is inherently shareable because the betrayal is legible to anyone who plays the game. "I caught the corrupted diff" becomes a community bragging right, distinct from and more prestigious than "I caught a document corruption."

**With the corrupted diff in Gauntlet / competitive (Approach E):** In PvP Gauntlet, the confidence percentage on the diff view becomes a meta-resource. A player who sees "73% confidence" must decide: spend 2 minutes manually verifying, or trust the diff and start configuring. In a timed Gauntlet match, this is a genuine strategic tradeoff — verification time vs. configuration time.

---

## Sensory Description

### The Corrupted Diff — First Encounter (Mission 9)

You open the diff view. The split pane appears: baseline on the left, current document on the right. Two amber highlights catch your eye immediately — the enemy's decoys. You reach for RESTORE. *Chime. Chime.* The status bar settles to green: "✓ All modifications restored."

You close the diff. You configure. You execute.

Twenty ticks later, your relay chain collapses. The sealed watch ends in failure. You enter the inspector.

You scrub to the failure tick. You find the wrong eviction policy. You open the document. You run the diff. Green bar: "✓ No modifications detected."

For a moment, nothing happens. Then a new stat materializes in the debrief sidebar — amber text, slowly pulsing: `DIFF VIEW COVERAGE: 66.7%`. Below it, in smaller text: `1 CORRUPTION UNDETECTED`. Below that: `HOSTILE BASELINE INFILTRATION DETECTED`.

The stat pulses like a heartbeat. The ambient shifts — not the Geiger counter clicking, something new. A low, sustained drone, barely audible, felt more than heard. The sound of a system that has been compromised but doesn't know it yet. The sound of a green build on broken code.

You stare at the screen. The diff view's green checkmark now looks different. Not wrong exactly — but insufficient. Like a locked door in a house with an open window.

### The Mission History Comparison — First Use

A new icon appears in the document toolbar: a clock overlaid with a checkmark, glowing amber. You click it. A new panel opens — not the familiar split-pane diff, but a table.

Left column: "Your successful configurations." Right column: "Current document values." Middle column: match/mismatch indicators.

Three rows glow amber. The third one — the one the diff missed — is highlighted with a brighter amber border and the annotation: "MISMATCH: Mission 8 (VICTORY) used AGE-FIRST. Current document says PRIORITY-FIRST."

You click the mismatch. A correction dialog: "Restore to value from Mission 8?" You click yes.

The correction chord plays. Not the standard chime — something deeper. A minor chord that resolves to major over two seconds. A cello-register tone with a shimmer of high harmonics. It sounds like justice. It sounds like catching a lie.

The status bar updates: `MANUAL VERIFICATION: 1 CORRUPTION DETECTED AND CORRECTED. TOOL-ASSISTED VERIFICATION MISSED THIS ENTRY.`

### Mission 10 — Full Diff Compromise

The boot log scrolls. The Predecessor's text appears, slower than usual, word by word:

`I lost an entire sector because I trusted my verification outputs.`
`The enemy learned to forge them.`
`Your diff view is compromised. Your baseline has been poisoned.`
`Some results may be inverted — showing correct values as corrupted.`
`The only verification that cannot be forged is the one you carry in your memory.`
`Trust your training.`

The last line lingers. The border pulse slows to 0.3Hz — the Predecessor's most deliberate pace. Then the boot log closes.

You open the diff view. Three amber highlights. You look at each one. The first says: "Buffer size changed from 10 to 12. Restore to 10?" But you remember: the buffer size for Relays is 12. The diff is telling you to *reduce* it. This is Approach C — the inverted diff. The "original" value is the enemy's preferred value.

The second highlight: "Hook range changed from 5 to 3. Restore to 5?" You think. Was it 5? Or was it 3? You run the mission history comparison. Mission 9 used range = 5. The diff says restore to 5. The mission history says 5. Both agree — this one is a genuine corruption. You restore it.

The third highlight: "Production cycle changed from 3 to 4. Restore to 3?" Mission history says... Mission 9 used 3. The diff says restore to 3. Agreement again. You restore it.

But the first one — buffer size — the diff says 10, your memory says 12, and mission history says... 12. The diff is wrong. The diff is actively trying to make you reduce your relay's buffer. You dismiss the highlight. You keep 12.

There's no chime for dismissing a false alert. Just silence. But the silence feels louder than the chime.

---

## The TikTok Clip

A streamer opens the diff view. "All clean, no corruptions." They configure and execute. The mission fails catastrophically.

Cut to debrief. The streamer traces the failure to a wrong value. They open the document. They run the diff. "No modifications detected."

The streamer's face. The slow realization. They look at the camera.

"The diff... lied to me."

Clip title: **"the game corrupted my debugger"**

---

## Newly Discovered Aspects

1. **5.11b-i — Audio channel independence during diff compromise:** Critical architecture decision — does the Geiger counter clicking have its own detection path independent of the diff view baseline, or does poisoning the baseline also silence the audio? Each answer creates different gameplay dynamics and fairness levels per mission.

2. **5.11b-ii — The "cascading distrust" containment problem:** After experiencing one compromised tool, players may lose trust in ALL tools. Designing the boundaries — which tools can be corrupted, which are always reliable, and how the game communicates these guarantees — is a meta-design problem for the entire Inspector toolkit.

3. **5.11b-iii — Specialist-deployed baseline recovery as mid-mission objective:** Using the Specialist unit's `extract` skill to recover uncorrupted baseline data from enemy relays during the sealed watch; turning diff corruption from a pre-mission scan problem into an in-mission tactical objective with spatial and temporal constraints.

4. **5.11b-iv — The "VERIFY AGAINST MISSION HISTORY" tool as general-purpose diagnostic:** This tool (introduced to counter corrupted diffs) could become a powerful general diagnostic — "what did I change since my last victory?" — useful even when the diff is trustworthy; risk of feature creep vs. value of consistent diagnostic vocabulary.

5. **5.11b-v — Gauntlet confidence percentage as competitive meta-resource:** In PvP Gauntlet, the diff confidence percentage creates time-pressure tradeoffs (verify manually vs. trust the percentage); opponent strategy around manipulating verification time cost; "verification denial" as an advanced adversarial tactic.
