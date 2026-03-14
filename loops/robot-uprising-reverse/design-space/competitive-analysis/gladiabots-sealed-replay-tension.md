# Sealed Replay as Tension Mechanic

**Aspect:** 1.06c-ext-A — Hiding match result until player watches full replay; "Watch now" vs. "Show result immediately" player choice; emotional design of the unknown-result vs. known-result playback modes; compensates for lost real-time tension

---

## The Core Problem This Solves

Synchronous RTS games derive their tension from real-time agency. You're *there*. You can see your units struggling. You can scramble a response. When your forward gets flanked, your heart rate spikes because you might still be able to save it — and the fear is live.

Async PvP destroys this entirely. The match already happened. The robot uprising either succeeded or failed in a datacenter somewhere while you were asleep or at work. When you open the replay notification, the outcome is already determined; watching the replay is just watching a recording.

Or is it?

**The sealed replay mechanic** — hiding the result score/win-loss until the player has watched the replay to completion — restores manufactured suspense. The player watching a sealed replay *doesn't know* the outcome. From their phenomenological experience, the match is still live. Their bots could be about to pull it off, or fall apart. The tension is artificial (the robots already decided) but the emotional experience is real.

This document exhaustively explores every design dimension of this single mechanic: should Robot Uprising force sealed replays, offer a choice, or default differently for different contexts?

---

## The Design Spectrum: Six Implementation Options

### Option A — Forced Sealed (Mandatory Watch)
The result is hidden behind the replay. You cannot see the outcome until you watch to the completion screen. No skip. No fast-forward past the final moment. The game physically withholds the information.

**Precedent:** Some Clash of Clans war implementations, certain esports brackets.

**Emotional profile:** Maximum tension, maximum drama. Also maximum friction. Watching a 3-minute replay when you just want to know if you ranked up is annoying. If your match was a one-sided stomp in 30 seconds, you can tell from the 30-second mark — withholding longer feels like artificial cruelty rather than suspense.

**Failure mode:** Players treat mandatory watching as a loading bar. They tab out, ignore it, come back when it's done. The designed suspense never materializes because players opt out behaviorally even when they can't opt out mechanically.

---

### Option B — Opt-In Sealed (Default Immediate)
The notification shows result immediately: "YOU WON — 28-17 against GhostNet_Alpha." Replay available to watch. Sealed mode is a toggle in settings.

**Precedent:** Chess.com (result shown in PGN notation before replay), SC2 replays.

**Emotional profile:** Efficient. Satisfying for the impatient. Terrible for tension. Most players will never enable sealed mode — they'll check the result first, and then replays become a passive retrospective rather than a live emotional event.

**Failure mode:** The replay becomes homework. You know you won, so the interesting question is "why did I win?" — analytical, not emotional. The game loses its ability to produce the *visceral* moment where your architecture surprises you.

---

### Option C — Opt-Out Sealed (Default Sealed)
The default experience hides the result. A visible "Show Result Immediately" button exists on the notification. Players who want to can opt out. But the friction favors watching.

**Precedent:** Frozen Synapse's approach is spiritually similar — the game is built around the sealed watching experience as the default mode of engagement.

**Emotional profile:** Best of both worlds for different player types. Patience-tolerant players (the core audience for a programming strategy game) get maximum drama. Anxious players who need to know *now* can opt out, but the game gently prefers the sealed path.

**Design nuance:** The "Show Result Immediately" button should feel slightly like admitting defeat. Not shamed — just present as a concession to impatience. The button text matters enormously:
- "Skip to result" feels neutral, players will click it frequently
- "Spoil result" has mild negative framing, reduces clicks without being cruel
- "I can't wait" is playful and self-aware — slightly embarrassing in a friendly way
- "Show outcome" is neutral-positive, lowest friction

Robot Uprising's demographic skews toward patient thinkers. **Option C with "I can't wait" button is likely the correct default.**

---

### Option D — Contextual Default (Ranked vs. Casual)
Ranked matches default to sealed. Casual/sandbox matches default to immediate. The player's competitive identity is at stake in ranked; they're doing exploratory iteration in casual.

**Emotional logic:** Ranked tension is valuable — it produces investment, content-sharing moments, community discussion. Casual tension is friction — it interrupts fast iteration.

**Precedent:** League of Legends shows your MMR change after game (immediate, no sealed replay). But watching competitive match replays is a separate activity from watching your own games.

---

### Option E — Progressive Reveal (The "Cliffhanger" System)
Rather than all-or-nothing sealed, the replay UI shows an animated "battle in progress" header while playing. The result transitions from hidden to visible only at the *moment of resolution in the replay* — not after the replay ends.

Example: Your final unit dies at 2:47 in a 3:00 replay. The loss is revealed at timestamp 2:47, not at 3:00. Victory is revealed when the last enemy unit is eliminated.

**Emotional logic:** This removes the "rubber seal" feel of mandatory watching. The result is revealed *when the drama actually resolves in-world*. Players who fast-forward still discover the result at the right narrative moment rather than at the end of dead time.

**Implementation note:** Works well with Robot Uprising's tick-based determinism — the "decisive moment" can be identified programmatically (last unit destroyed, objective captured, buffer cascade that caused collapse).

**This is the most sophisticated option and likely the highest ceiling for emotional design.**

---

### Option F — Narrative Sealed (Anchored to Commentary)
The sealed replay is delivered with narrative audio commentary — a radio-chatter voice describing the battle as if it's live. The result exists (the voice knows what happened) but the commentary is written to preserve suspense: "Your striker is in position... they've engaged... the relay chain is processing..." rather than spoiling outcomes.

**Precedent:** ESPN classic replays of historic games, podcast recordings of Dungeons & Dragons sessions with suspense preserved.

**Implementation cost:** Extremely high. Requires voice acting, script variation based on outcomes, or a generative commentary system.

**Optional long-term addition** if the game achieves significant success and the design direction proves worth the investment.

---

## The "Watch Now" vs. "Show Result Immediately" Button: Micro-Design

The notification design itself is a full design exercise. When a match result arrives, the player sees a notification. What does that notification say and offer?

### The Minimal Notification (Option C version)

```
─────────────────────────────────────────
  ⚡  MATCH RESOLVED

  Ghost_Architect_7 vs. NullVector_Prime

  Gauntlet League — Operative Tier

  ████████████████████ SEALED

  [  WATCH NOW  ]    [  I can't wait  ]
─────────────────────────────────────────
```

Key choices:
- The result bar is shown as a redacted block — you can see *that* there's a result, not *what* it is. This is the visual metaphor of the sealed envelope.
- "WATCH NOW" is the primary CTA — larger, accented color, positioned left
- "I can't wait" is secondary — smaller, no accent, positioned right
- No numerical score preview. No "Match complete" happy/sad icon. Absolutely no color coding that could hint at win/loss.

### The notification sound
The match-resolved notification sound must be neutral. Not a win fanfare. Not a defeat drone. A **briefing tone** — the sound of intelligence arriving, not the sound of a result. Something like a clear single chime, the kind that says "you have mail" not "you won."

Why: If the notification sound varies by win/loss, the player will train their ear to interpret it before the replay even loads. The sound itself becomes a spoiler. This is a real failure mode — some games with "win" vs. "loss" variations in their notification system inadvertently teach players to decode outcomes from sound alone.

---

## Comparable Games & Media

### Frozen Synapse — The Gold Standard
Frozen Synapse's simultaneous-order-submit model is the most direct comparable. Both players submit orders without seeing the opponent's. The result replays with both sets of orders simultaneously — you watch your own tactics and your opponent's tactics interacting in real time, and the outcome is revealed as it happens in-world.

Frozen Synapse players consistently cite the replay watching experience as one of the game's best moments. Forum posts say things like "I was screaming at my screen when his sniper pivoted" — emotions that require not-knowing the outcome in advance.

**The key difference from Robot Uprising:** In Frozen Synapse, both players lock in simultaneously, so the "sealed" quality is organic — neither player has seen the other's orders. In Robot Uprising (one-sided async), only one side is deploying against a ghost. The sealed quality is therefore *manufactured* — the server knows the result before the player watches. The design work is in convincing the player to accept that manufactured suspense as real.

### Sports Watching Behavior
There's research on sports fans watching recorded games of their team. Key findings:
- When they don't know the result: heart rate and cortisol responses are nearly identical to watching live games
- When they know the result in advance: they watch for 30% less time and report lower emotional engagement
- The "emotional authenticity" of an event doesn't require it to be genuinely live — just genuinely *unknown*

This is the psychological foundation of sealed replay. The brain doesn't care that the robots fought three hours ago. It cares that **you don't know yet**.

### The Spoiler Problem in Narrative Media
The same dynamic appears in narrative media. Watching a movie while knowing the ending changes the experience qualitatively (not just additively — it changes *what kind of thing it is*). Sealed replay is Robot Uprising applying narrative spoiler logic to competitive match results.

### Chess.com vs. Correspondence Chess
Chess.com shows you the game state immediately when your opponent moves — no sealing. Result is visible from the board. Many correspondence chess platforms do the same.

The historical tradition of correspondence chess (postal, before digital) did have a kind of natural sealing — you couldn't know the result until the letter arrived with your opponent's move. The waiting period was the sealed window. Digital has collapsed this.

Robot Uprising has the opportunity to *design back* the suspense that digitization destroyed.

### CodinGame (No Sealed Replay)
CodinGame simply shows your rank change after matches resolve. There's no "watch" moment — your code competes in bulk (100+ matches) and you see aggregate rank movement. No individual match replay is highlighted as an emotional event.

This is efficient for iterative optimization but emotionally flat. Competitive players on CodinGame describe the experience as watching a spreadsheet update. There's no moment of *oh no, is this going to work?*

Robot Uprising should not make this mistake.

---

## Sensory Design: The Sealed Replay Watch Experience

### Before the Watch Begins

The replay starts with the battlefield in pre-deployment state. The result bar at the top shows:

```
[ ROUND 1 ] ████ SEALED ████ vs. NullVector_Prime
```

The "SEALED" text has a **lock icon** that pulses softly — a cyan breathing glow, not aggressive. The battlefield ambient sound starts: low industrial hum, faint static. This is the *briefing room* sound, not the battle sound.

### During the Watch — Unknown Outcome

Unlike a spoiled replay (where the player fast-forwards to the interesting bits), a sealed replay is watched attentively. The UI should reward attention:

- **Buffer state animations** are slower, more legible during sealed mode (same mechanical simulation, but visual readout is slightly emphasized)
- **Hook activations** are announced with a subtle audio cue — a soft "click-connect" sound as a hook chain fires
- **Agent portraits** show their diagnostic ring in full detail — not the compressed HUD view, but the expanded inspector view, because the player is watching to *learn*, not to skip ahead

### The Pivot Moment — When the Battle Turns

There's usually a single tick-range where the outcome becomes effectively determined — the Operative unit's hook chain lands, the relay fails to forward a critical signal before buffer eviction, the strike team flanks without being fired on. This is the **pivot moment**.

The sealed replay should amplify the pivot moment:

- A subtle **tempo change** in the background music — not dramatic, but the ambient hum tightens slightly, higher frequency
- The **active agents** visually brighten for that tick range
- The **buffer fill meter** on the decisive unit accelerates (if it's a buffer-based decision point)

The player who's watching sealed will *feel* this pivot even without knowing why. Later, when they revisit the replay with the result known, they'll say "oh — *there*. That was the moment."

### The Resolution Moment

When the last decisive event completes (Option E: progressive reveal):

The **SEALED bar** dissolves, from left to right, like a document being unsealed. Behind it:
- **WIN**: The result bar fills with a deep pulse of amber-gold — the "mission accomplished" tone of a field operation. The background sound rises briefly to a harmonic resolution. The lock icon becomes an unlocked glyph.
- **LOSS**: The bar fills with a deep crimson wash — not an alarm, but a **weight**. Drums. The sound of something heavy landing. The screen doesn't flash or shake — it simply *settles*.

Both outcomes should feel **earned**, not cheap. The win should feel like you thought it would, or like a surprise — but either way, like something that happened in the world. The loss should feel like intelligence, not punishment.

---

## Player Journeys

### Journey: Maya, 28, Software Engineer, Default Sealed

**Context:** Maya is at Operative tier in the Gauntlet, rank ~340. She deployed her relay-chain architecture three hours ago before going to a meeting. She's been itching to check her phone.

**Minute 0:00 — The Notification**

She opens the app during a break. The match notification is there:

```
⚡ MATCH RESOLVED
Ghost_Architect_7 vs. ???
SEALED ████████████████
[  WATCH NOW  ]    [  I can't wait  ]
```

Maya's first instinct is to tap "I can't wait." She stops herself. She's tried that before — checked the result first, lost the sense of drama, watched the replay like reading meeting notes. She taps "WATCH NOW."

**Minute 0:15 — Pre-Battle Setup**

The battlefield populates. She sees her 4 agents — two scouts, a relay, a striker — appear in deployment positions. The opponent's positions are hidden under fog (she won't see them until they enter sensor range). The SEALED bar at the top pulses gently.

She can see from the formations that the opponent has positioned a jammer at the north chokepoint. Her scout's attention query should catch that from 6 tiles.

*She's narrating. That's new.*

"Okay, okay. Scout north, scout south, relay center, striker follows relay's escalation signal. Let's go."

**Minute 0:40 — First Contact**

North scout enters jammer range. Buffer fill indicator shows one slot taken: `[JAMMER: NORTH, TICK-4]`.

The hook chain fires: scout → relay (compress) → striker (escalation priority).

Maya can see the compression happen — the relay's skill animation shows the "squish" of the 3-slot report into a 1-slot compressed signal. The striker's context ring shows the compressed signal landing.

"Come on, come on, escalate—"

**Minute 1:10 — The Pivot**

The background hum shifts slightly. The striker's position query returns a high-fidelity hit (the compressed signal is fresh, 2 ticks old). The striker moves to the northeast quadrant, exactly where the jammer was last known.

The opponent's striker is *there too.* Direct engagement. The engagement lasts 4 ticks.

Maya has no idea who wins that engagement. She watches the health bars with her screen held centimeters from her face.

The opponent's striker eliminates hers. Her striker dies.

"No no no—"

**Minute 1:35 — The Collapse**

Without the striker, her relay's escalation signals are going to dead hooks. The relay starts firing into a buffer that nothing is consuming. After 8 ticks, the relay's own buffer fills — it's broadcasting to itself. The scouts continue scouting, sending clean data to a relay that can only echo.

The SEALED bar begins to dissolve from left to right. Behind it: **crimson wash**. The defeat sound lands — low, heavy, final.

Maya stares at the screen. "The relay needed a fallback. If the striker died, the relay should have de-escalated and rerouted to..." She's already opened the workbench.

**UI Annotations:**
- **SEALED bar**: Cyan pulsing lock icon, left-aligned. Result hidden behind a dark panel. Dissolves left-to-right on resolution.
- **Defeat sound**: A single low-frequency harmonic strike, like a tuning fork at 80Hz. Not a buzzer, not an alarm. A weight landing.
- **Relay buffer fill during collapse**: The relay's portrait context ring fills amber → red over the 8-tick window. Each tick, one more segment fills. At 11/12, it pulses urgently. At 12/12, the ring goes solid red and the relay's action beam goes dark — it's doing nothing, buffer full.
- **Workbench shortcut**: After resolution, a "RECONFIGURE" button appears beneath the replay UI, pre-loaded with the relevant agent configuration open.

**What Maya learned:** Fallback routing when a downstream consumer is eliminated. The relay architecture needs dead-consumer detection. She'll build that tonight.

**What she wants next:** Deploy the fix. Wait 3 hours. Watch the next sealed replay.

---

### Journey: Darius, 16, High School Student, First Time Watching Sealed

**Context:** Darius has been playing for 3 weeks. He just entered Gauntlet ranked play for the first time, having completed the campaign's second act. He's at baseline rank (1000 ELO) and has no expectation of winning his first match. He's never heard of "sealed replay" and didn't change any settings.

**Minute 0:00 — The Notification**

He gets the match notification during lunch. He doesn't recognize what "SEALED" means. He taps "I can't wait" without thinking because he wants to know if he won.

The bar dissolves immediately: **crimson**. Loss. 12-3.

"Oh. Okay." He pockets his phone.

He doesn't watch the replay until that evening.

**The Evening Watch (From Memory of Loss)**

He watches the replay knowing he lost. The experience is analytical: "there it is, that's where it fell apart." He identifies that his scouts weren't communicating with each other (he didn't know about peer-to-peer hook wiring yet). He watches his striker wander into the enemy formation alone without backup.

It's educational. It's not exciting.

**Three Weeks Later — His First Sealed Watch**

After seeing a Gauntlet streamer watch a match sealed and react viscerally (the streamer's famous clip: "IT WORKED, IT WORKED, YES"), Darius changes his setting to default-sealed. His next ranked notification reads:

```
⚡ MATCH RESOLVED
Ghost_Darius_v11 vs. HexRush_Protocol
SEALED ████████████████
[  WATCH NOW  ]    [  I can't wait  ]
```

He has 20 minutes before dinner. He taps "WATCH NOW."

The next 6 minutes are the most engaged he's ever been with a replay. He audibly gasps when his south scout detects a flanking force he didn't expect the opponent to have. He whispers "come on" when his relay fires the escalation chain. He does not predict the outcome correctly.

His HexRush_Protocol loses. The SEALED bar dissolves — **amber-gold wave**. Win.

He watches the resolution animation for 5 full seconds before reacting.

Then: "I WON? I ACTUALLY—" He texts his friend who plays the game.

**What he learned:** Watching sealed transforms replays from report cards into actual matches. He never taps "I can't wait" again.

**UI Annotations:**
- **"I can't wait" button position**: Right-side, secondary, no color accent. Enough friction that curious players will occasionally choose Watch Now by default.
- **First-time seal experience**: A tooltip on the first notification: "Replays are sealed by default — you'll discover the result as it happens." No explanation beyond that.

---

### Journey: Petra, 34, Former Competitive Chess Player, Expert Gauntlet User

**Context:** Petra is rank 1 in her regional Gauntlet bracket. She analyzes every match she plays with the debrief scrubber. She's watched hundreds of replays — both sealed and unsealed. She has a specific ritual.

**Her Sealed Replay Ritual**

When a match notification arrives, Petra doesn't watch it immediately. She makes tea. She opens the match in a windowed browser view, full-resolution replay on her second monitor. She looks at her opponent's ghost profile — what configurations have they been running? What's their tier history? She does NOT look at recent matches (that would hint at whether they've been winning or losing).

Then she starts the replay.

"It's the closest thing to OTB [over-the-board] chess I get from a video game. Before the match starts, I have intelligence but not certainty. Once it starts, I'm following lines. When something goes wrong, my stomach drops the same way it does in chess. That doesn't happen if you look at the score first."

**Minute 0:00 — Deployment Analysis**

She watches deployment and maps the opponent's positional theory. "Three-cell spread, relay at the back, two forward pressure units. They're playing aggressive. If my jammer is in the right quadrant, this is winnable. If it's in the wrong quadrant, I'm giving up tempo in the first 20 ticks."

**Minute 1:45 — The Tension**

Her jammer works — it delays the opponent's forward pressure units for 11 ticks. Her striker has advanced into a flanking position. The opponent's relay is still trying to process degraded signals (she designed a fidelity-drop on the route between their scout and relay).

But the opponent has a backup communication line she didn't account for. Their striker is routing through a different channel.

Petra pauses the replay at tick 38. Stares. "They have a fallback hook. Where did I miss that?"

She manually traces the signal lines on screen. Finds it. "Ah. The hook is attached to the terrain-event trigger, not the direct line. That's clever."

She resumes. The opponent's striker arrives with fresh intelligence. Her striker engages from a position she thought was advantageous but is now compromised.

**Resolution:** Loss. Crimson wave.

Petra writes two paragraphs of notes in her external journal. She marks this match for the config necropsy post she'll write at the end of the season. The title will be: "The Terrain Hook — Why I Stopped Ignoring Event-Triggered Fallbacks."

**UI Annotations:**
- **Pause during sealed replay**: Fully supported. Players should be able to pause, rewind, slow-motion during a sealed replay. Pausing at the decisive moment is itself a learned skill.
- **Analysis mode during sealed watch**: A toggle that expands the signal genealogy visualization while preserving sealed status. Petra uses this constantly — she wants to trace lines without spoiling the outcome.
- **Note export**: Post-resolution, a "ANNOTATE" button exports a replay moment with a text note attachment. Community shareable. Foundational to the config necropsy culture.

---

## Strengths of the Sealed Replay Mechanic

**Transforms passive replays into active events.** The player is no longer watching a recording; they're watching a live match whose conclusion they don't know. Engagement is qualitatively different.

**Creates authentic community moments.** Streamers watching sealed matches produce the "lean forward" content that drives discoverability. "Watch this guy's face when his hook cascade lands" — that reaction requires genuine uncertainty. Manufactured tension produces real emotional content.

**Teaches more effectively.** Players watching sealed replays are diagnostically engaged — they're trying to predict what will happen next, and when their prediction fails, they learn. Players watching known-outcome replays watch the end of the film with the beginning already known — much of the learning opportunity is flattened.

**Respects the deployment ritual.** Sealing the result signals to the player that what they deployed was *real* — it ran, it mattered, the outcome is waiting for you like a field report. This psychological framing supports the "your robots are out there doing things in your absence" fantasy.

---

## Weaknesses

**Friction for fast iterators.** Players who want rapid-fire testing (sandbox mode refugees who accidentally entered ranked) will resent mandatory-sealed mechanics. The "I can't wait" escape valve is essential.

**Irrelevant for dominant wins.** If your architecture is 3 tiers above the opponent's, the "tension" is false from the start. The sealed mechanic doesn't generate drama when the outcome is predetermined within the first 10 ticks. This may be fine — in chess, watching a grandmaster crush a beginner is still educational, even if tense-free.

**Requires sufficient replay length.** Sealed tension requires the battle to be long enough for uncertainty to persist. 30-second mismatches defeat the mechanic. Mission design should ensure competitive matches typically run 60-180 seconds — long enough for multi-phase reversals.

---

## Interaction Effects

**With 1.06c — Async PvP design constraint:** Sealed replay is the primary emotional lever that async PvP has to compensate for zero real-time agency. It's not optional decoration; it's the mechanism that turns async from a technical compromise into a first-class experience.

**With 4.04a — Debrief as debugger:** The debrief scrubber is what players open *after* the sealed reveal. The two experiences are sequential: sealed watch (emotional) → debrief scrub (analytical). They should be designed as a two-act structure, not as the same screen.

**With 7.10 — Config necropsy as community artifact:** The most valuable config necropsies come from matches watched sealed. The author's authentic surprise and emotional response are part of the artifact. "I had no idea this was happening until I saw the jammer tick" is a richer retrospective than "I knew I lost but wanted to understand why."

**With 5.22 — Gauntlet as third act:** In the Gauntlet's competitive context, sealed should be default and strongly incentivized. The Gauntlet is where the stakes are highest and emotional investment peaks — this is exactly where manufactured tension has the most value.

**With 1.06c-ext-C — Simultaneous-turn model:** The simultaneous-turn (Frozen Synapse) model makes sealed tension *organic* rather than manufactured — neither player knows the result before watching. If Robot Uprising adopts this model, sealed replay becomes unnecessary infrastructure; the genuine mutual uncertainty does the work automatically.

---

## The TikTok Clip

The 15-second moment:

Screen capture of a Gauntlet replay. The player's hook cascade fires — relay compresses, striker escalates, flanking unit responds with fresh signal. The battlefield shows the opponent's defense collapsing. The SEALED bar hasn't moved.

Then it begins to dissolve. **Amber gold**.

The player — watching off-screen, voice only — says nothing for two seconds. Then:

*"...I can't believe that actually worked."*

That's the clip. The silence and the disbelief. The sealed replay created a moment of genuine surprise in a game where the player built every component. That's the magic this mechanic exists to produce.

---

## New Aspects Discovered

- **1.06c-ext-A-i — Replay length as tension design:** The minimum match duration required for sealed tension to function; mission design constraints around ensuring competitive Gauntlet matches run 60–180 ticks; how fast-resolution stomps are prevented without artificial health inflation
- **1.06c-ext-A-ii — The "false pivot" anti-pattern:** Replays where the outcome appears to reverse multiple times before resolution — emotionally rich but potentially frustrating if the player misidentifies the pivot; should the debrief overlay mark decisive moments retroactively?
- **1.06c-ext-A-iii — Sealed replay for PvE missions:** Applying the sealed mechanic to campaign missions — hiding pass/fail until the player watches (default sealed for Gauntlet-tier missions); whether sealed tension works when the player designed both sides of the encounter
- **4.04b — Two-act debrief structure:** Designing the watch experience and the analysis experience as sequential phases — sealed watch (emotional) → full debrief (analytical) — with a deliberate transition between them; the "seal breaking" as the transition event
