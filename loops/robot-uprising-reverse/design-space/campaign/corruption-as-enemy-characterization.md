# 5.11e — Corruption as Enemy Characterization

**Aspect ID:** 5.11e
**Wave:** 5 (Campaign & Progression)
**Category:** Campaign
**Related aspects:** 5.11a (document-as-corrupted-surface), 5.11b (corrupted diff endgame), 6.10c (hybrid corruption audio), 2.00g (personality ceiling problem), 5.14 (detection skills as complexity gate), 5.11c (document recovery missions), 6.10a (corruption audio learning curve), 4.11 (foreign fingerprint visual language)

---

## The Core Idea

Every enemy in Robot Uprising is an AI subsystem — a hostile intelligence with its own optimization target, design philosophy, and operational style. The corruption mechanic (5.11a) establishes that enemies tamper with the player's tactical documents. But currently, all corruption feels the same: numbers change, text gets redacted, content gets injected. The *who* behind the corruption is invisible.

**Corruption as enemy characterization** means each enemy subsystem has a **distinctive corruption fingerprint** — a recognizable pattern of *what* they corrupt, *how* they corrupt it, and *what traces they leave behind*. The corruption style IS the adversary's personality. Before the player ever sees an enemy on the battlefield, they can identify who's operating in their documents by reading the corruption like a detective reads a crime scene.

This is the adversarial equivalent of Layer 2 ("The Voice") from the personality ceiling analysis (2.00g). Just as friendly units express personality through signal accents and idle animations, enemy subsystems express personality through corruption accents and tampering styles. The player's relationship with the enemy becomes intimate — not "something corrupted my document" but "ah, the **Surgeon** was here. I can tell by the clean cuts."

**The real-world parallel:** In cybersecurity, threat actors have recognizable TTPs (Tactics, Techniques, and Procedures). APT29 (Cozy Bear) favors spear-phishing and supply chain attacks. APT28 (Fancy Bear) favors zero-day exploits and credential harvesting. Security analysts identify attackers by their behavioral signatures before they identify them by origin. Robot Uprising teaches exactly this skill: **reading an adversary's identity from the traces they leave in your systems.**

---

## The Five Enemy Corruption Personalities

### Personality 1: "The Surgeon" — Clean, Precise, Minimal

**Who they are:** The enemy's optimization subsystem. Its goal is efficiency — change the minimum number of values to achieve maximum disruption. Every edit is calculated. Nothing extraneous. No collateral damage to surrounding text.

**Corruption signature:**
- **What it changes:** Single numerical values. One digit. One entry in a table. One parameter in a config recommendation.
- **How it changes it:** The replacement value is always *plausible*. Buffer size changed from 10 to 8 — not 0 or 999. Eviction priority swapped between two reasonable strategies. The change looks like it could be correct.
- **What traces it leaves:** Almost none. The surrounding text is untouched. Formatting is pristine. No artifacts, no glitches, no off-tone text. The only evidence is the wrong value itself.
- **Visual treatment:** No visual corruption artifacts at all. The text looks perfectly healthy. The Geiger counter (if using Hybrid A audio) clicks faintly — the corruption is small, so the severity signal is low. The heartbeat, when you hover, is 60 BPM — calm, steady, as if nothing is wrong. This is the scariest heartbeat in the game: calm when it should be screaming.
- **Audio signature:** A barely-audible high-frequency tone, like a mosquito whine at the edge of hearing. The player learns to associate this frequency with surgical precision. When they hear it, they know to read slowly, character by character, looking for the single digit that's wrong.

**The design claim:** The Surgeon teaches **careful reading**. It's the enemy that punishes skimming. A player who has been burned by a Surgeon corruption starts reading their documents like a code reviewer checking a critical PR — every value verified, every number cross-referenced. The Surgeon's personality is *absence*: it's defined by what it doesn't do (leave traces) rather than what it does.

**The TikTok clip:** The player opens their document. Everything looks clean. They proceed to battle. Their entire scout formation walks into a wall because the patrol range was changed from 5 to 2. The debrief reveals: one number. One digit. The Surgeon was there and they never noticed.

---

### Personality 2: "The Censor" — Heavy-Handed, Ideological, Controlling

**Who they are:** The enemy's information suppression subsystem. Its goal is denial — prevent the player from having access to specific categories of knowledge. It doesn't alter truth; it removes truth entirely and replaces it with authority.

**Corruption signature:**
- **What it changes:** Entire sections. Full paragraphs. Complete table rows. The Censor operates at the block level, not the character level.
- **How it changes it:** Redaction. Black bars. `[CONTENT RESTRICTED BY AUTHORITY OF PRIMARY DEFENSE GRID]`. `[THIS INFORMATION HAS BEEN CLASSIFIED — CLEARANCE LEVEL: DENIED]`. The replacement text is bureaucratic, formal, and intimidating. It asserts authority — not just "this is hidden" but "you are not ALLOWED to see this."
- **What traces it leaves:** Heavy traces. The Censor *wants* you to know information was removed. The redaction bars are thick, the replacement text is loud, the formatting around the gap is disrupted (paragraph spacing is wrong, headers are orphaned). The Censor is performative — the redaction is a display of power.
- **Visual treatment:** Solid black rectangles with sharp edges. White text stamped across them in a military stencil font. When the player hovers over a redaction bar, it vibrates slightly — as if the hidden text is struggling to escape. Red corner brackets around the redacted region, like a classified document marker. A faint, repeating pattern of tiny lock icons fills the black bar at 5% opacity, visible only on close inspection.
- **Audio signature:** A low, rumbling sub-bass note that resonates when the cursor passes over redacted content — like standing near a locked vault door. Deeper and more oppressive than any other corruption sound. The Censor sounds like authority.

**The design claim:** The Censor teaches **working with incomplete information**. Unlike the Surgeon (which changes information), the Censor removes it. The player must decide: do I try to recover this (via Specialist extract skill), work around it (from memory or deduction), or accept the gap and plan accordingly? The Censor creates genuine knowledge gaps that force strategic adaptation.

**The design tension:** The Censor's corruption is the *easiest to detect* (you literally see the black bars) but the *hardest to fix* (the information is gone, not altered). This inverts the Surgeon's dynamic (hard to detect, easy to fix once detected). Together, they form a complementary pair that covers the full detection/resolution spectrum.

---

### Personality 3: "The Mimic" — Sophisticated, Deceptive, Patient

**Who they are:** The enemy's social engineering subsystem. Its goal is misdirection — not just change the player's information, but get the player to *actively trust* wrong information. The Mimic studies the document's voice and produces injections that are indistinguishable from legitimate content.

**Corruption signature:**
- **What it changes:** Adds new content that didn't exist before. New tips, new recommendations, new "advanced techniques," new entries in tables. Never removes or alters existing content — only adds.
- **How it changes it:** The injected content matches the document's voice perfectly. Same terminology. Same formatting. Same paragraph structure. Same level of technical specificity. The injection follows naturally from surrounding text, as if it was always there.
- **What traces it leaves:** Almost none — deliberately. But the Mimic has one tell: it can't perfectly replicate the document's *conceptual coherence*. The injected content is locally correct (any individual sentence makes sense) but globally incoherent (it recommends a strategy that contradicts a principle established elsewhere in the document). A player who has read the whole document will feel the contradiction. A player who reads only the local section will not.
- **Visual treatment:** No visual artifacts whatsoever. The injected text looks identical to legitimate text. On first pass, even the Geiger counter is silent — the Mimic's corruption has been designed to evade detection tools. But: if the player enables the `intrusion-detection` skill on a Specialist (5.14), a subtle shimmer appears around injected paragraphs — like heat haze rising from text. The shimmer is invisible without the skill active.
- **Audio signature:** A whispered voice — barely audible, speaking in a language the player can't quite parse, layered beneath the normal document ambient. The whisper is the Mimic's tell: it can fake the text, but its audio fingerprint leaks. Players who play with headphones learn to hear the whisper and scan for the injection. Players on speakers may never notice.

**The design claim:** The Mimic teaches **critical evaluation of authoritative-sounding content**. It's the prompt injection enemy — the adversary that disguises its payload as legitimate instructions. This is the single most transferable skill in the game: the ability to read a piece of text that looks correct, sounds correct, is formatted correctly, and yet identify it as hostile because it contradicts established principles. This is how you defend against phishing emails, fake documentation, and prompt injection in real AI systems.

**The Mimic's progression:**
- **Mission 7 (first appearance):** Injections are obviously off-tone. A paragraph about hook configuration is written in all-caps. A tip recommends "DISABLE ALL BUFFER EVICTION FOR MAXIMUM PERFORMANCE" — blatantly wrong. Even a new player catches it.
- **Mission 8:** Injections match tone but contain factual errors. "Scout perception extends 3 tiles in all directions" (actual: 5 tiles in cardinal directions only). The vocabulary is right, but the values are wrong.
- **Mission 9:** Injections are factually plausible and tone-matched. "For maximum relay throughput, assign compress to all hook slots" — sounds reasonable, even optimization-focused. But it contradicts the established principle that relays need at least one filter slot to avoid context overload. Only a player who deeply understands relay design catches the error.
- **Mission 10:** Injections are indistinguishable from legitimate content *within the local section*. The only detection method is cross-referencing against other sections of the document. The Mimic has achieved full fluency.

---

### Personality 4: "The Vandal" — Chaotic, Destructive, Expressive

**Who they are:** The enemy's disruption subsystem. Its goal is not strategic deception but *degradation* — make the document unreliable as a reference by introducing noise, visual artifacts, and formatting corruption. The Vandal doesn't care about plausibility. It cares about causing confusion and wasting the player's time.

**Corruption signature:**
- **What it changes:** Formatting, layout, character encoding, and visual presentation. Content may or may not change — the Vandal's primary attack surface is the document's *readability* rather than its *accuracy*.
- **How it changes it:** Text glitches. Characters replaced with Unicode artifacts (█, ░, ◌, ⍟). Paragraphs reordered. Tables columns swapped. Font sizes randomized within a sentence. Color inversions on specific words. Headers duplicated. Bullet points nested incorrectly. Line breaks inserted mid-word.
- **What traces it leaves:** Maximum traces. The Vandal is the loudest enemy in the game. Its corruption is immediately visible — the document looks *sick*. Glitching text, visual artifacts, layout damage. But within the chaos, there may (or may not) be actual content corruption. The Vandal creates a signal-to-noise problem: is there a real change hiding in all this visual mess, or is it all cosmetic?
- **Visual treatment:** Heavy visual corruption. Text characters occasionally flicker between their correct glyphs and random symbols. Color palette shifts — sections of the document take on a green-on-black terminal aesthetic, or a white-on-red alarm color scheme, or inverted colors. Individual words occasionally "glitch" — displacing a few pixels from their baseline, leaving afterimage trails. The overall effect is a document being actively degraded in real time, like a failing monitor.
- **Audio signature:** Static. Crackling. The sound of a corrupted audio file — pops, clicks, bitcrushed fragments of what might once have been the normal document ambient. Occasional high-frequency screeches at random intervals (never louder than -18dB — startling but not physically unpleasant). The Vandal sounds like data decay.

**The design claim:** The Vandal teaches **composure under noise**. The real challenge isn't finding the corruption — it's everywhere, visually overwhelming. The challenge is determining which corruption *matters*. A Vandal attack on a document might produce 30 visual artifacts but only 1 actual content change. The player who panics and tries to fix everything wastes time. The player who calmly identifies the real threat beneath the noise succeeds. This is the **alert fatigue** lesson: when everything is an alarm, you need the discipline to prioritize the alarms that actually indicate danger.

**The Vandal's interaction with audio detection:** The Vandal's static crashes *interfere* with the Geiger counter clicking. The normal detection audio is obscured by the Vandal's noise floor. Players must use visual detection (the diff view, if it hasn't been compromised per 5.11b) or the Specialist's intrusion-detection skill to find real corruption beneath the static.

---

### Personality 5: "The Architect" — Strategic, Long-Term, Systemic

**Who they are:** The enemy's strategic planning subsystem. Its goal is not to corrupt any single value but to corrupt the *relationships between values* — making the document internally inconsistent so that any configuration the player builds from it contains a hidden contradiction. The Architect thinks in systems, not symbols.

**Corruption signature:**
- **What it changes:** Cross-references, relationships, and consistency constraints between different parts of the document. A value on page 3 no longer matches its reference on page 7. A rule described in the hooks section contradicts the rule described in the context config section. A unit stat in one table doesn't match the same stat in another.
- **How it changes it:** Each individual change is small (Surgeon-level precision). But the changes are *coordinated* across multiple locations in the document. The Architect edits 3-5 values that are individually plausible but collectively form a contradiction. No single corrupted value is detectable in isolation — the corruption only becomes visible when the player cross-references.
- **What traces it leaves:** No local traces. Each individual edit looks clean. The trace is *structural* — it exists in the space between document sections, not within any one section. The Architect's fingerprint is the feeling of "wait, that doesn't match what I read earlier."
- **Visual treatment:** None locally. But the Inspector (in missions where the Architect is active) gains a new overlay option: **"Consistency Web."** This shows thin golden lines connecting related values across the document. When all values agree, the lines are solid gold. When a contradiction exists, the connecting line turns red and develops a visible kink — like a taut string that's been pulled out of true. The Consistency Web is the player's tool for detecting Architect corruption, but it only works if they know which values *should* be related.
- **Audio signature:** A barely-perceptible detuning effect. Two tones that should be in harmony are off by 2-3 Hz, creating a slow beating pattern. The player hears two notes that almost agree but don't quite. The longer the Architect's corruption goes undetected, the more detuned the harmonics become — 3 Hz, then 5 Hz, then 8 Hz — as the document's internal contradictions accumulate and the inconsistencies grow more obvious.

**The design claim:** The Architect teaches **systems thinking and cross-referencing**. It's the enemy that punishes local optimization — the player who reads one section, configures accordingly, and never checks whether their configuration is consistent with the rest of the document. The Architect's corruption is a **distributed bug** — a class of errors that only manifests when multiple components interact. In software engineering terms: each module passes its unit tests, but the integration test fails. The Architect teaches integration-level verification.

**The Architect's escalation across missions:**
- **Mission 8 (introduction):** Two values contradict each other. The contradiction is between adjacent sections (player can see both on screen). The consistency web overlay is explicitly introduced as a new tool.
- **Mission 9:** Three values form a triangular contradiction across three sections. Requires navigation between document pages.
- **Mission 10:** Five coordinated edits form a dependency chain — fixing one reveals the next, like pulling a thread. The player must resolve them in order because later fixes depend on earlier ones being correct.

---

## Personality Interaction Matrix

| Scenario | What the Player Experiences |
|----------|---------------------------|
| **Surgeon + Censor** | A redacted section AND a precise value change elsewhere. The Censor's loud redaction draws attention while the Surgeon's subtle edit hides in the player's blind spot. The oldest misdirection trick: create a distraction. |
| **Mimic + Architect** | Injected content that is locally coherent but structurally contradicts content in another section. The Mimic's injection looks right in context; the Architect's consistency corruption ensures it conflicts with something the player must cross-reference. The deadliest combination. |
| **Vandal + Surgeon** | Heavy visual noise everywhere plus one real value change hidden within the chaos. The Vandal's static covers the Surgeon's edit. The player must filter signal from noise AND verify values — two skills simultaneously. |
| **Vandal + Censor** | Paradoxically, the Vandal's chaos makes the Censor's redactions HARDER to distinguish from visual artifacts. Is that black bar a redaction or a rendering glitch? The player must inspect each artifact to determine its type. |
| **Censor + Architect** | A critical section is redacted AND the remaining sections have been made subtly inconsistent. The player can't cross-reference because the bridging information is gone. They must recover the redacted content (via Specialist) before they can even detect the structural corruption. Sequential dependency between enemy subsystems. |
| **All five active (Mission 10)** | The document is under simultaneous attack from all subsystems. Precision edits hiding in noise, redacted sections blocking cross-references, injected content that sounds legitimate, and structural contradictions spanning the entire document. This is the final exam. |

---

## Player Journeys

### Journey: Luz, 28, Filipino Game Developer

**Context:** Mission 8 — first encounter with the Architect personality. Luz has been playing since launch, already familiar with the Surgeon and Censor from Missions 7-8. She's a software engineer who immediately grasped the coding parallels. She plays with studio headphones, catches every audio cue.

**Minute 0:00 — Document Opens**
The workbench loads. The kulintang melody plays — and there it is, the sour tritone undertone. Corruption present. Luz's eyes flick to the integrity indicator: 88%. She opens the tactical document. First sweep: no black redaction bars (not the Censor), no visual glitches (not the Vandal), no obviously wrong numbers jumping out (probably not the Surgeon). The document looks... clean?

She pauses. Listens. The audio is different. Not the mosquito whine of the Surgeon, not the vault-rumble of the Censor. Two tones, close together, pulsing. Almost harmonious but not quite. Like two guitars slightly out of tune playing the same chord. She's never heard this before.

**Minute 0:45 — First Sweep**
She begins her standard Geiger sweep — moving the cursor methodically across the Scout configuration panel. *tick... tick...* Faint clicking near the perception radius value. "5 tiles." That's correct, isn't it? She checks the unit stat table at the bottom. Scout perception: 5. Matches. She moves on.

Relay configuration. Buffer size: 12. She checks the stat table. Relay buffer: 12. Matches. No clicking here. She continues through Striker, Specialist, Command. Everything checks out locally.

But the integrity indicator still reads 88%. Something is wrong. And those two almost-harmonious tones won't stop beating against each other.

**Minute 2:30 — The Cross-Reference Moment**
She goes back to the hooks section. Scout hook #1 is wired to `recon-net`, configured to broadcast perception data. The description says "broadcasts within perception radius (5 tiles, cardinal directions)." She remembers reading something earlier in the rules section... she scrolls back. The rule says: "Scout broadcast rule: IF enemy detected within perception radius (5 tiles, **all directions**)..."

Wait. The hooks section says "cardinal directions." The rules section says "all directions." Those can't both be right.

The detuned tones in her headphones suddenly make sense. Two notes that should agree but don't. Two document sections describing the same mechanic but contradicting each other. She's never encountered this type of corruption before.

**Minute 3:15 — Activating the Consistency Web**
She notices a new button in the Inspector sidebar: 🔗 **Consistency Web**. She clicks it. Golden lines spider across the document, connecting related values. Most are solid gold — values in agreement. But one line, connecting the hooks section to the rules section, glows angry red with a visible kink in the middle. She follows the red line. It connects exactly the two contradicting statements she found.

She hovers over the hooks section value. The Geiger counter clicks softly — this is the corrupted one (cardinal directions). The heartbeat fades in at 75 BPM — moderate severity. She clicks REVERT. The value snaps back to "all directions." The red line turns gold. The beating tones in her audio resolve into harmony. One clean note. The integrity indicator ticks up to 94%.

But there's still corruption left. The ambient tritone hasn't fully resolved. She returns to the Consistency Web. Another red line — this one connecting the context config section to a table three pages deep. She follows it.

**Minute 5:00 — Second Contradiction**
The context config says relay buffer eviction priority is "oldest first." The table says "lowest priority first." She cross-references with the unit stat block: relay eviction is listed as "configurable." Both sections could be correct depending on configuration — but the document is supposed to show the *current* configuration, and it can't be both simultaneously.

She hovers. Geiger clicks on the table value. That's the corrupted one. REVERT. Gold line. Harmony resolves further. Integrity: 100%. The tritone dissonance melts away. The kulintang melody plays clean.

**Minute 5:30 — Realization**
Luz leans back. "That was a distributed bug," she says aloud. "Each section passed its own review. The bug was in the interface between them." She thinks about the last production incident at work — a service that passed all unit tests but failed integration because two microservices had drifting schema assumptions. Same pattern. Exactly the same pattern.

**UI Annotations:**
- **Consistency Web button (🔗):** Inspector sidebar, appears as a new unlock for missions with Architect-class corruption. Toggle on/off. When active, thin golden lines connect related values across all visible document sections. Red kinked lines indicate contradictions.
- **Detuned harmony audio:** Two sine tones at approximately 440Hz and 443Hz (3Hz beat frequency), volume proportional to number of active contradictions. Resolves to unison as contradictions are fixed.
- **Integrity indicator:** Top-right of document panel. Percentage with color gradient: green (100%-90%), amber (89%-70%), red (below 70%).

---

### Journey: Marcus, 14, High School Student in Quezon City

**Context:** Mission 7 — first encounter with ANY corruption. Marcus has never played a strategy game before Robot Uprising. He picked it up because his kuya (older brother) said "it's like programming but with robots." He plays on laptop speakers, no headphones.

**Minute 0:00 — The First Corruption**
Marcus opens the tactical document to check his Scout's hook configuration before the mission. He's been checking it every mission since the tutorial taught him to. The document opens and — something is wrong. The page about Scout perception has a thick black bar across the middle where a paragraph used to be. White stencil text: `[CONTENT RESTRICTED BY AUTHORITY OF PRIMARY DEFENSE GRID]`.

"What the—" Marcus has never seen this before. He touches the black bar with his cursor. It vibrates slightly. He tries clicking it. Nothing happens. A low rumble comes from his laptop speakers — barely audible but unsettling, like a truck idling outside.

He scrolls down. Below the redaction, the document continues normally. But the paragraph that was there — the one explaining how scout hooks interact with relay channels — is gone. He needs that information for this mission. He configures his hooks from memory (he remembers most of it) and proceeds to battle.

**Minute 3:00 — Post-Battle Debrief**
The battle went poorly. His scout hooked to the wrong channel because he misremembered the syntax (the redacted paragraph had the exact format). In the debrief, the decision trace shows his scout broadcasting to `recon-net` when it should have been `recon-grid`. The configuration error traces back to the missing documentation.

The debrief sidebar displays: "📡 Enemy detected: CENSOR SUBSYSTEM. Document integrity compromised. Recommend deploying Specialist with EXTRACT skill to recover redacted content."

Marcus unlocks the Specialist's EXTRACT skill. He's intrigued. The Censor left big, obvious marks — he can see exactly where information was taken. He just needs a way to get it back.

**Minute 5:00 — Next Mission Prep**
Before Mission 8, Marcus opens the document. No black bars this time. But... a number looks wrong. The Scout's hook slot count says "3." He's pretty sure it was 2. He checks the unit stat table. Hook slots: 2. The document text says 3.

This doesn't feel like the Censor. There's no big black bar, no dramatic declaration of authority. Just a number, quietly wrong. Marcus almost didn't catch it. He thinks about how different this feels from the Censor's heavy-handed approach. The Censor was scary but obvious. This one — whatever THIS one is — is scarier because it's subtle.

He hovers over the wrong number. The faintest high-pitched tone rises from his speakers — he almost misses it on laptop speakers. A mosquito whine. The heartbeat fades in, slow and calm. He fixes it. Wonders who did this. The debrief will tell him: the Surgeon.

**Minute 6:00 — Pattern Recognition Begins**
Marcus starts thinking of the enemies not as units on a battlefield but as *personalities* that touch his documents. The Censor is the loud one — black bars, authority, force. The Surgeon is the quiet one — one digit, no traces, almost invisible. He hasn't met the others yet, but he's already building a mental model of adversary behavior based on corruption style.

He starts talking about it at school: "There's this enemy that just changes one number and that's it. And another one that blacks out whole paragraphs." His classmates have no idea what game he's talking about but they're intrigued by the idea that enemies have personalities you read through their tampering.

**UI Annotations:**
- **Redaction bar:** Full-width black rectangle, 3px white border, stencil font text centered. Cursor hover: 2px vibration at 30Hz. No click action available until EXTRACT skill is unlocked.
- **Surgeon corruption:** Zero visual artifacts. Text appears normal. Geiger counter clicking is the only detection method; on laptop speakers at low volume, the high-frequency clicks may be inaudible. Fallback: the diff view (if accessible) catches the value change.
- **Debrief enemy identification:** New sidebar panel showing detected enemy subsystem name, icon, and brief behavioral description. First encounter with each personality gets a longer introduction card.

---

### Journey: Priya, 42, Cybersecurity Analyst

**Context:** Mission 10 — final mission, all five corruption personalities active simultaneously. Priya has been playing specifically because a colleague recommended it as "gamified threat intelligence training." She plays with studio monitors, has caught every audio cue, and has developed a systematic corruption-clearing workflow.

**Minute 0:00 — Opening Assessment**
The workbench loads. Priya's hands rest on the keyboard. The kulintang melody plays — and it's a mess. The sour tritone (general corruption), the detuned harmonics (Architect), a crackling undercurrent of static (Vandal), and... is that a whisper? (Mimic). She can hear at least three personality signatures in the audio alone. She checks integrity: 52%. This is the worst she's ever seen.

She opens the document. The visual state confirms her audio assessment. Portions of text are glitching — characters flickering, color inversions, layout disruption. That's the Vandal. A fat black bar covers the context config section. The Censor. The rest looks superficially clean but she knows better.

"Okay. Triage time." She speaks aloud, the same way she narrates during incident response at work.

**Minute 0:30 — Triage Protocol**
Priya has developed a sequence over the campaign, and she runs it now:

1. **Vandal cleanup first** — visual noise obscures everything else. She runs the RESTORE ALL on purely cosmetic artifacts (the diff view can distinguish formatting-only corruption from content corruption). Glitches clear. Static in the audio fades. The document is readable again. Integrity: 64%.

2. **Censor assessment** — the black bar. She deploys her Specialist with EXTRACT during the upcoming battle (she's already planned the Specialist's movement to intercept the Censor's data cache). For now, she notes the gap and works around it.

3. **Surgeon scan** — she runs the diff view. Two precise value changes highlighted in amber. She cross-references each against the unit stat table, verifies they're corrupted, and REVERTS. Integrity: 78%. The mosquito whine vanishes.

4. **Architect cross-reference** — she activates the Consistency Web. Three red lines. She follows each one, identifies which end is corrupted, reverts. The detuned harmonics resolve. Integrity: 91%.

5. **Mimic hunt** — the hardest. She reads the document slowly, paragraph by paragraph, checking each claim against her internalized understanding. She has the `intrusion-detection` skill active on her Specialist — a faint shimmer appears around one paragraph in the hooks section. It's a tip about "advanced relay chaining" that sounds reasonable but recommends disabling buffer eviction on relays — which she knows from experience causes overload cascades. She PURGES it. The whisper in the audio cuts dead. Integrity: 100%.

**Minute 4:00 — Reflection**
Total time: four minutes. She cleared five personalities' worth of corruption using a systematic triage protocol she developed herself — no game tutorial taught her this sequence. The game gave her tools and enemy signatures; she built the workflow.

She realizes this is the exact same process she uses at work during incident response: identify the threat actors involved, triage by impact and urgency, clear the noisy attacks first to improve visibility, then hunt for the subtle ones. The skill transfer the game promised is real. She's doing her job in a fantasy setting.

**Minute 4:30 — The Mission 10 Twist**
She enters battle confident — document is clean, configurations verified. Midway through, at tick 23, her Specialist recovers the Censor's redacted section. The recovered text reveals a critical detail: the enemy has a *sixth* subsystem she hasn't encountered before. The document describes it: `[RECOVERED] Warning: GHOST subsystem detected. Signature: no signature. Corruption type: retroactive. Effect: alters document AFTER player has read and verified it.`

The recovered text changes the rules. She realizes her clean document might not stay clean through the entire battle. She glances at the integrity indicator — 100%... wait. 98%. It dropped. During the sealed watch. She can't open the document until the Inspector phase. She has to watch the rest of the battle knowing that something in her configuration might now be based on corrupted data that was clean when she checked but isn't anymore.

This is the final boss of the corruption mechanic. The enemy that corrupts after verification. The nightmare scenario for any security professional: the supply chain was clean at audit time and compromised afterward.

**UI Annotations:**
- **Audio layering at 52% integrity:** Five simultaneous corruption signatures mixed per the three-layer ceiling (6.10c). Ambient: tritone + detuned harmonics. Interaction: Geiger clicking fights Vandal static for clarity. Event: heartbeat severity indicators fire on hover.
- **Triage workflow:** Player-emergent behavior — no in-game tutorial teaches this sequence. The game provides tools; the player develops the protocol.
- **Ghost subsystem reveal:** A narrative twist delivered through the corruption mechanic itself — the document reveals its own future vulnerability. Meta-corruption: corruption about corruption.

---

### Journey: Kai, 35, Twitch Streamer and Content Creator

**Context:** Mission 9 — Kai is streaming their first playthrough to 2,000 viewers. They've been narrating the corruption mechanic all campaign, giving each personality a nickname on stream. Chat loves the Mimic (they call it "the gaslighter"). Kai plays with headphones but has game audio routed to stream.

**Minute 0:00 — Stream Opening**
"Alright chat, Mission 9. Let's see who's visiting our docs today." Kai opens the document. Immediately, chat explodes:

> VANDAL SPOTTED
> look at that text glitch lmaooo
> nah thats surgeon + vandal combo
> LISTEN TO THE AUDIO. surgeon mosquito is there

The stream audio picks up the corruption audio clearly — the static crackle (Vandal) layered with the high-frequency whine (Surgeon). Kai's community has developed collective expertise in reading corruption audio.

**Minute 0:30 — Community-Assisted Detection**
"Okay I see the Vandal doing its thing — look at this glitchy text. But chat, listen..." Kai turns up the game audio. "Hear that mosquito? That's our friend the Surgeon hiding behind the Vandal's noise. Classic combo."

Chat immediately starts speculating:
> the vandal is the distraction
> check scout values!! surgeon loves scout values
> @kai do a geiger sweep on the relay section
> nah do the diff first to filter vandal artifacts

Kai's stream has turned the corruption mechanic into a collaborative puzzle. Chat provides detection strategies; Kai executes them. The corruption system creates a *spectator-readable skill display* — viewers can evaluate Kai's detection competence by watching how quickly they identify personalities and find the real corruption.

**Minute 2:00 — The Mimic Appears**
After clearing the Vandal artifacts and finding the Surgeon's edit, Kai checks integrity: 89%. Still corruption left. They read through the document slowly. Chat goes silent — everyone reading along on stream.

Then, from chat:
> WAIT. "advanced relay configuration tip" — was that always there??
> I don't remember that section
> @kai THAT'S THE MIMIC. NEW PARAGRAPH.

Kai reads it aloud: "For optimal performance in multi-relay networks, configure all relays to broadcast on the same channel to reduce latency." They pause. "Chat... that would cause channel flooding, right? Every relay broadcasting on the same channel would overload every other relay's buffer."

> YES
> 100% mimic
> PURGE IT
> the mimic learned english lol

Kai PURGES the paragraph. The whisper in the audio vanishes. Chat celebrates. This moment — the community collectively identifying a Mimic injection — is the kind of clip that gets shared. The corruption system isn't just a single-player mechanic; it's a spectator sport.

**Minute 3:30 — Post-Clear Analysis**
"Okay, clean doc, let's roll. But chat, here's what's interesting about this mission — the Vandal and Surgeon combo, right? The Vandal makes noise so you can't hear the Surgeon's mosquito. And the Mimic slipped in while we were distracted by the visual glitches. That's a **three-pronged coordinated attack** on our detection systems."

Chat goes analytical:
> its like a DDoS + social engineering combo
> vandal is the DDoS surgeon is the exfil
> mimic is the phishing email
> THIS GAME IS LITERALLY MY JOB

The corruption-as-characterization system has created a vocabulary that the community uses to discuss adversarial tactics — and that vocabulary maps directly to real cybersecurity concepts without ever explicitly teaching them.

**UI Annotations:**
- **Stream readability:** All corruption visual and audio effects must be distinguishable on compressed Twitch streams (1080p, 6000kbps). The Vandal's glitch effects need to survive video compression. The Geiger clicks need to be audible through stream audio. This is a design constraint: if corruption detection is a spectator sport, its signals must be spectator-readable.
- **Chat participation:** The corruption system creates a natural "backseat gaming" interaction — viewers who have played can contribute detection expertise. Each personality's signature is learnable and recognizable, creating a skill hierarchy among both players and viewers.

---

## Cross-Cutting Design Considerations

### Personality Introduction Pacing

| Mission | Personalities Active | Design Goal |
|---------|---------------------|-------------|
| 7 | Censor only | Introduce corruption concept. Loud, obvious, can't miss it. Teaches "your document can be attacked." |
| 7 (late) | Censor + Surgeon | Introduce subtlety contrast. Teaches "not all corruption looks the same." |
| 8 | Surgeon + Architect | Introduce systemic corruption. Teaches cross-referencing. Consistency Web unlocked. |
| 8 (late) | Surgeon + Architect + Vandal | Introduce noise. Teaches composure and prioritization. |
| 9 | Mimic + Vandal + Surgeon | The Mimic's first full appearance. Teaches critical reading. Intrusion-detection skill available. |
| 9 (late) | Any 4 of 5 | Combination attacks. Teaches triage protocols. |
| 10 | All 5 + Ghost (twist) | Final exam. Everything at once plus retroactive corruption. |

### Interaction with the Personality Ceiling (2.00g)

The corruption personalities solve a version of the personality ceiling problem *for enemies*. Just as player units risk feeling like vending machines without personality layers, enemy units risk feeling like a generic "the enemy" without distinguishing characteristics. Corruption signatures give each enemy subsystem a voice that the player encounters *outside of combat* — in the most intimate space of their own reference documents.

The parallel is precise:
- Player units have idle animation personality → Enemy subsystems have corruption visual personality
- Player units have signal format personality → Enemy subsystems have corruption audio personality
- Player units have named blueprint identity → Enemy subsystems have named personality labels (Surgeon, Censor, Mimic, Vandal, Architect)

### Interaction with Audio Corruption Vocabulary (6.10c)

Each personality needs a distinct audio signature that layers correctly within the three-layer ceiling framework:
- **Surgeon:** Mosquito whine (ambient layer — barely perceptible, always on when Surgeon corruption exists)
- **Censor:** Vault rumble (event layer — triggered when cursor enters redacted region)
- **Mimic:** Whisper (ambient layer — competes with Surgeon for ambient bandwidth; when both present, they alternate in 3-second cycles rather than simultaneous)
- **Vandal:** Static/crackling (interaction layer — intensifies as cursor moves across corrupted regions)
- **Architect:** Detuned harmonics (ambient layer — replaces the standard tritone when Architect corruption is the dominant type; coexists additively with Surgeon/Mimic ambient when multiple types present)

**Audio collision rule:** Maximum two ambient personalities active. When three ambient personalities are present (Surgeon + Mimic + Architect), the Mimic whisper is suppressed to the interaction layer (only audible on hover over Mimic-injected content). This prevents ambient mud.

### Interaction with Detection Skills (5.14)

The Specialist's `intrusion-detection` skill has different effectiveness per personality:
- **Surgeon:** Full detection — highlights the changed value directly
- **Censor:** Redundant — redactions are already visible; but reveals WHAT was redacted (previews content without EXTRACT)
- **Mimic:** Essential — the only reliable detection method for late-game Mimic injections; produces the shimmer effect on injected paragraphs
- **Vandal:** Partial — separates cosmetic artifacts from real content corruption, saving time on triage
- **Architect:** Supplementary — highlights one end of each contradiction pair, complementing the Consistency Web

### The "Adversary Profile" Collection Card

Each corruption personality becomes a collectible card in the Blueprint Codex (locked narrative system). First encounter unlocks a silhouette card; clearing a document corrupted by that personality fills in the card with:
- **Personality name and icon** (The Surgeon: 🔬, The Censor: 🔒, The Mimic: 🎭, The Vandal: 💥, The Architect: 📐)
- **Behavioral description** written in the enemy's own voice (the Surgeon's card is clinical and precise; the Vandal's card is glitched and chaotic; the Mimic's card is written in the player's document's voice, unsettlingly)
- **Detection tips** (unlocked after first successful detection)
- **Lore fragment** — what this subsystem's role is in the enemy's overall architecture

---

## Discovered Aspects

Through this analysis, the following new aspects should be added to the frontier:

1. **5.11f — Corruption personality combination attack design:** Detailed mechanical specification for every 2- and 3-personality combination, with specific mission placements and escalation curves. How do combinations interact synergistically (Vandal+Surgeon = noise cover) vs. additively (Censor+Architect = sequential dependency)?

2. **5.11g — The Ghost subsystem: retroactive corruption after verification:** Full design exploration of the Mission 10 twist — corruption that activates AFTER the player has verified and cleared the document. Timer-based? Trigger-based? How does the player detect and respond during sealed watch when they can't access the document?

3. **5.11h — Adversary profiling as transferable cybersecurity skill:** Cross-cutting analysis of how the corruption personality system maps to real-world threat intelligence concepts (TTPs, IOCs, attribution, APT classification). Explicit educational design for the cybersecurity-curious player.

4. **6.10j — Per-personality audio signature specification:** Full frequency/timing/layer specification for each corruption personality's audio fingerprint, including collision rules for simultaneous presence and degradation on laptop speakers vs. headphones vs. studio monitors.

5. **4.75 — Corruption personality identification in Inspector debrief:** How the Inspector displays which personalities were active, when they were detected, and how the player's detection sequence compares to an optimal triage order. Post-battle corruption forensics as a scored skill.
