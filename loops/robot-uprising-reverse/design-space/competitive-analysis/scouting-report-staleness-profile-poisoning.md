# Scouting Report Staleness and Adversarial Profile Management

**Aspect:** 1.06f — When opponents change configs between matches, scouting data becomes stale; should the game surface confidence decay? Can players deliberately present misleading profiles in early matches to set up a counter in a later match? Profile poisoning as competitive tactic.

---

## The Staleness Problem: Intelligence Has a Half-Life

In any competitive game where you can observe an opponent's configuration, the data you gather decays the moment they change anything. In Robot Uprising's context — where the entire game is about information architecture — this decay isn't a nuisance. It's a *thematic mirror* of the game's core mechanic. Your scouting data about an opponent's blueprints has its own context window, its own eviction problem, its own signal-versus-noise tension.

Consider the situation: you face PlayerX in a Gauntlet match. You watch the sealed watch carefully. In the Inspector, you trace their signal chains — a two-relay deep architecture with scouts broadcasting on a channel called `sweep`, strikers listening on a compressed `threat` channel. You note the 3-tick latency, the single command agent with a reroute skill. You screenshot it. You build a counter-config.

Three days later, you face PlayerX again. But they've swapped their relay topology entirely. They're running a flat architecture — direct scout-to-striker hooks, no compression, faster but noisier. Your counter-config was optimized against deep relay chains. It's worse than useless — it's *miscalibrated*. You tuned your context filters to exploit compression artifacts that no longer exist.

This is the **Stale Intel Problem** — and every competitive game with any form of scouting faces it. The question is whether Robot Uprising should make this decay visible, hide it, or turn it into a weapon.

## Comparable Games: How Others Handle Intelligence Decay

**StarCraft: Brood War** — The fog of war is the canonical staleness system. You scout your opponent's base at 4 minutes, see two barracks. At 8 minutes, that information is ancient — they could have transitioned to starport tech, built a hidden expansion, or stayed on barracks and massed marines. The game shows you the last-known state of scouted areas but provides zero confidence indicators. The staleness is entirely in the player's head. Pro players develop intuition for "this intel is X minutes old, so they've probably done Y by now." The skill is temporal projection — mentally simulating what your opponent has done since you last looked.

**Gladiabots** — The async PvP ladder shows you opponents' match histories but not their current configurations. You can watch replays of their recent matches, but if they've updated their AI between those matches and your encounter, the replays are misleading. The community developed informal scouting — noting opponents' tendencies across multiple replays, building mental models of their style rather than their specific config. This style-over-specifics approach is more robust to config changes but less actionable.

**Poker (Texas Hold'em)** — The closest analog to profile poisoning. Players deliberately vary their play style to create misleading reads. A tight player will occasionally make loose calls to "balance their range." A bluffer will show a winning hand to establish credibility for future bluffs. This is *intentional signal management* — controlling what information your opponent collects about you. The metagame of managing your own scouting profile is deeper than the hand-by-hand decision making.

**Magic: The Gathering (competitive)** — Sideboard strategy is a form of inter-game profile management. In a best-of-three, you present Game 1 with your main deck. Your opponent sideboards against what they saw. But you can anticipate their sideboard choices and *counter-sideboard* — bringing in cards that beat their expected counter-strategy. The "transformative sideboard" archetype takes this further: presenting as an aggressive deck in Game 1, then transforming into a control deck for Games 2-3, invalidating everything the opponent prepared.

**Among Us / Social Deduction** — These games formalize profile poisoning as a core mechanic. The impostor's entire game is building a trustworthy profile (completing fake tasks, being visible, accusing others) while secretly working against the group. The "self-report" tactic — killing someone and then reporting the body — is pure profile poisoning: you present yourself as the discoverer rather than the perpetrator.

## Five Design Options for Robot Uprising

### Option A: "The Fog of Memory" — Passive Staleness Decay

The game tracks when you last observed an opponent's configuration and applies a visual decay to your scouting data. Inspector notes from a match 1 day ago appear crisp and bright. Notes from 3 days ago show faded text, slightly desaturated colors. Notes from a week ago are ghostly — still readable but visually communicating "this might be wrong." Notes older than 14 days show amber warning pips: `⚠ INTEL AGE: 14d`.

No mechanical effect — just visual communication. The player's scouting data still says "two relays on channel sweep," but the faded presentation whispers *are you sure?*

**Strength:** Low-complexity, thematically resonant (information decays like context window entries), doesn't punish players who don't engage with competitive scouting. **Weakness:** Purely cosmetic — sophisticated players ignore the visual decay and track config changes mentally anyway. Casual players might not understand what the fading means.

### Option B: "The Confidence Score" — Quantified Intel Reliability

Each piece of scouting data carries a numerical confidence score: 100% right after observation, decaying over time and opponent activity. If the opponent has played 5 matches since your last encounter, the confidence drops faster (they've had more opportunities to change). The game could track *which specific elements* changed: "Channel topology: 87% confidence. Unit composition: 62% confidence. Production order: 41% confidence."

A sidebar panel in the Inspector — "The Dossier" — would show opponent profiles with confidence heat-maps. Green cells for high confidence, amber for uncertain, red for stale. The Dossier updates automatically based on match recency and opponent activity.

**Strength:** Actionable data. Players can decide whether to trust their intel or scout fresh. Teaches real-world intelligence analysis concepts (confidence intervals, source freshness). **Weakness:** The confidence score is itself a guess — the game can't know whether the opponent *actually* changed their config, only how much time and activity has passed. False confidence (score says 90% but opponent changed everything) could feel unfair. Over-systematizing something that should be intuitive.

### Option C: "The Bluff Button" — Formalized Profile Poisoning

Players can designate specific matches as "exhibition" — running a deliberately non-standard configuration. Exhibition matches are ranked normally (you still gain/lose rating), but the player knows they're sacrificing short-term ELO to plant false intelligence. After the match, a private counter increments: "Poisoned profiles: 3."

The opponent's Dossier would show these matches indistinguishably from genuine ones. The only tell: a player who runs wildly different configs across matches might be poisoning — but they might also be genuinely experimenting.

**Strength:** Formalizes a fascinating metagame layer. Creates a "spy vs spy" dynamic where even your scouting data is adversarial. Rewards long-term strategic thinking over match-by-match optimization. **Weakness:** The "Bluff Button" itself is too explicit — real deception doesn't announce itself. Better to let the deception emerge naturally from config freedom. Also, sacrificing ELO for future advantage creates a pay-it-forward economy that casual players can't engage with.

### Option D: "The Smoke Screen" — Emergent Deception Through Config Freedom

No explicit deception mechanics. Instead, the game makes it trivially easy to swap configs between matches — one-click blueprint loadout switching, multiple saved configurations per slot. The deception emerges naturally from the freedom.

The key design choice: **do NOT show opponents which loadout you're running before the match.** The sealed watch begins, and the opponent discovers your configuration in real-time as they observe your units' behavior. This preserves the fog-of-war ethos. Any information the opponent gathered from previous matches might be accurate or might be outdated.

Combined with Option A's visual decay on scouting data, this creates a natural suspicion system. You *know* your intel might be wrong. The faded text reminds you. But you don't know *how* wrong, or whether the opponent changed deliberately to counter your counter.

**Strength:** Elegant. No new UI, no new mechanics, no explicit "deception mode." The complexity comes from config freedom + information uncertainty. Mirrors real-world competitive dynamics. **Weakness:** Invisible to new players. The metagame of deliberate misdirection requires competitive literacy that only emerges at higher ranks. Less interesting for casual play.

### Option E: "The Operator's Briefing" — Pre-Match Intel Summary

Before each competitive match, the game presents a one-screen briefing: your opponent's public profile, recent match count, rank, and a machine-generated "tendency report" — not their specific config, but behavioral patterns observed across their recent matches. "Favors deep relay architectures. High communication density. Moderate scout investment. Unusual: recent config variance is 3× their historical average."

That last line — "config variance" — is the staleness indicator. If someone has been running the same config for 20 matches and suddenly changes everything, the variance spike signals either genuine improvement or deliberate obfuscation. The briefing doesn't tell you which.

**Strength:** Gives all players access to meta-information without requiring Inspector archaeology. The "config variance" metric is a brilliant ambiguity — high variance could mean experimentation, improvement, OR deception. Players must interpret it. **Weakness:** Computing meaningful behavioral patterns from match data requires careful design to avoid being either too vague (useless) or too specific (removes the fog).

## The Design I'd Name: "The Unreliable Narrator"

The recommended approach combines Options A + D + E into a system called **"The Unreliable Narrator"** — a name that captures its essence. Your intelligence about opponents is always partially true, partially stale, and possibly deliberately misleading. The game acknowledges this uncertainty through visual design and behavioral statistics, but never resolves it for you.

**Components:**
1. **Visual decay** on all scouting data (faded text, amber pips for age)
2. **Free config switching** between matches with no visibility to opponents
3. **Pre-match Briefing** with behavioral tendency summaries and variance indicators
4. **No explicit deception mechanics** — all misdirection is emergent

The thematic resonance is perfect: in a game about managing information under uncertainty, your *own* intelligence gathering is subject to the same constraints. Your scouting data has its own context window, its own staleness, its own noise. You are the scout, and your opponent is the terrain.

---

## Player Journeys

### Journey: Reyna, 27, Competitive Gladiabots Veteran

**Context:** Gauntlet Silver II, Mission 8 completed. Has faced the same opponent — `ContextOverlord` — three times in the past week. Lost twice, won once. Has extensive Inspector notes from all three matches.

**Minute 0:00 — The Pre-Match Briefing**
The matchmaking screen resolves. Opponent: `ContextOverlord`. Reyna's stomach tightens — she knows this player. The Briefing panel slides in from the right: a dark slate card with amber header text reading `OPERATOR PROFILE: ContextOverlord`. Below, three sections. **Rank:** Gold I (one tier above Reyna). **Recent Activity:** 12 matches in past 48 hours. **Tendency Report:** four behavioral bars — *Communication Density: HIGH* (teal bar at 82%), *Architecture Depth: DEEP* (bar at 74%), *Scout Investment: MODERATE* (bar at 51%), *Config Variance: ELEVATED ⚠* (amber bar at 68%, pulsing gently). That amber pulse. Reyna's eyes lock on it. `ContextOverlord` has been changing things. The last time she faced them, they ran a textbook deep relay chain — two relays, compressed signals, command agent rerouting. But 68% variance means their recent matches look different from their historical pattern. Did they find something better, or are they setting a trap?

**Minute 0:45 — The Dossier Review**
Reyna opens her Dossier — the persistent scouting notebook. `ContextOverlord`'s entry shows three match records. The most recent (2 days ago) is slightly faded, text at 85% opacity. The oldest (6 days ago) is noticeably ghostly, text at 55% opacity, with a small amber pip: `⚠ 6d`. She reads her own notes from the most recent match: "Deep relay chain. sweep→compress→threat pipeline. 3-tick latency to striker response. Command agent reroutes at T8 when scout dies. VULNERABILITY: no redundancy — kill relay-1 and entire right flank goes dark." But the faded text whispers doubt. That was two days and potentially several config changes ago. The variance bar was 68%. She can't trust this.

**Minute 1:30 — The Gamble**
Reyna makes a decision. Instead of building a counter to the deep relay chain, she loads her "generalist" blueprint set — moderate communication, balanced scout/striker ratio, no specific counter-strategy. Her reasoning: if `ContextOverlord` changed their config, a targeted counter could backfire worse than a balanced approach. She's playing the uncertainty, not the last-known state. She drags her generalist loadout onto the conveyor belt. The EXECUTE button pulses in the top right.

**Minute 2:15 — The Sealed Watch**
Tick 1. Units spawn. Reyna watches `ContextOverlord`'s side of the board. Two scouts, one relay, two strikers. Same composition as before — but composition doesn't tell you wiring. By Tick 4, she sees the first signal chain: a scout broadcasts, but the signal goes *directly to a striker*. No relay compression. No deep chain. `ContextOverlord` switched to a flat architecture — fast, noisy, aggressive. Reyna's generalist build is adequate but not optimized. She watches the rest of the match with the specific tension of someone who made a reasonable bet and is waiting to see if it pays off.

**Minute 5:40 — The Inspector Debrief**
Match over — narrow victory for Reyna. In the Inspector, she scrubs to Tick 4 and clicks the enemy scout. The decision trace shows direct hook output to `attack-now` channel. No compression. No relay. She updates her Dossier notes: "T-2d: switched to FLAT architecture. Direct scout→striker hooks. Fast response but high EM noise. No relay compression. VARIANCE CONFIRMED — intel from T-6d is FULLY STALE." She marks the older entries with a personal tag: `[STALE-CONFIRMED]`. Her hands are slightly shaky — the win felt earned not through superior configuration but through superior uncertainty management.

**UI Annotations:**
- **Briefing panel:** 320px wide right-side card, dark slate (#1a2332) background, amber (#FFC107) header, teal tendency bars, amber pulsing variance indicator
- **Dossier:** Notebook-style panel with match entries at varying opacity (100%→55% over 7 days), amber age pips for entries older than 5 days
- **Variance bar:** Unique among tendency bars — uses amber instead of teal, gentle 2-second pulse animation when above 50%

---

### Journey: Tomás, 16, Mobile-First Casual Player

**Context:** Gauntlet Bronze III, Mission 6 recently completed. Plays 2-3 matches per day on his phone during commute. Has never opened the Dossier. Doesn't know profile poisoning is a concept.

**Minute 0:00 — The Accidental Discovery**
Tomás taps "Find Match." The matchmaking spinner resolves: opponent `Sp4rkPlug`. The Briefing card appears. Tomás usually skips this — he taps through to the Plan screen. But today the card has something new he hasn't seen before: an amber pulsing bar labeled "Config Variance: VERY HIGH ⚠⚠" at 91%. He pauses. Two amber pips, pulsing. The tooltip (long-press on mobile) reads: "This operator's recent configurations differ significantly from their historical patterns. Scouting data may be unreliable."

Tomás doesn't have scouting data. He's never taken notes on an opponent. But the warning makes him curious. He taps the opponent's name, which opens a minimal public profile: rank, recent win rate, match count. Nothing about their configuration. He shrugs and proceeds to Plan.

**Minute 1:00 — The Match**
The match plays out normally. `Sp4rkPlug` runs an unusual configuration — four scouts, one striker, no relays. The scouts flood the board with reconnaissance, tagging everything. The single striker is a precision instrument, guided by overwhelming information. Tomás's balanced team gets systematically dismantled — every unit is spotted and tracked before the striker arrives. He loses in 18 ticks.

**Minute 3:30 — The Second Match**
Tomás re-queues. Gets `Sp4rkPlug` again (Bronze III has a small population). This time, the Briefing shows the same high variance. Tomás thinks: "they did something weird last time — lots of scouts." He adjusts: adds a second striker, reduces scouts, configures his remaining scout to broadcast on a noise-heavy channel (hoping to overload the enemy scouts' context windows with junk). Basic counter-strategy, but it's the first time Tomás has adjusted his config *in response to opponent information*. He's scouting without knowing he's scouting.

**Minute 5:15 — The Reversal**
`Sp4rkPlug` runs the same four-scout build. But Tomás's noise-channel gambit works — enemy scouts start receiving junk signals from his scout's broadcast, their context bars climbing toward red. Two enemy scouts get stunned (context overload) on Tick 9. Tomás's strikers advance through the gap. He wins.

**Minute 7:00 — The Lesson**
Post-match, Tomás doesn't open the Inspector. But he remembers the amber bars. He thinks: "that pulsing warning thing told me they were doing something different." He doesn't articulate it as "scouting report staleness" or "config variance." He just knows that the amber bars mean "watch out, this person is unpredictable." The system taught competitive awareness without any tutorial, without any explicit instruction. The visual language did the work.

**UI Annotations:**
- **Mobile Briefing card:** Full-width card below matchmaking header, tendency bars are touch-target sized (48px height), long-press tooltip for variance explanation
- **Variance double-pip:** Two amber warning pips (⚠⚠) for values above 80%, with synchronized pulse animation
- **Config adjustment:** Tomás uses the mobile workbench — drag-to-reorder blueprint queue, tap-to-toggle channel listen/ignore on scout's context config

---

### Journey: StreamerChef_TTV, 28, Diamond-Rank Streamer, 200+ Concurrent Viewers

**Context:** Gauntlet Diamond I, deep into a rivalry with `NullPointer_404`. They've faced each other 11 times in the past month. Chef has extensive Dossier notes. Chat knows the rivalry. Today Chef is going to deliberately poison their own profile.

**Minute 0:00 — The Setup (Off-Stream Prep)**
Before going live, Chef queues three matches with a radically different configuration from their usual style. Their standard build is a deep relay architecture — three relays forming a signal processing pipeline, compressed intelligence feeding a precision striker pair. For these three "poison" matches, Chef runs the opposite: a flat rush build. Direct hooks from scouts to strikers, no relays, no compression. Maximum aggression, minimum intelligence. Chef loses two of the three matches. ELO drops 15 points. The Dossier entries these opponents now have show a flat, aggressive, relay-less Chef.

Chef knows that `NullPointer_404` watches replays of Chef's recent matches before they queue. (Diamond-rank players do this.) When NullPointer reviews Chef's last three matches, they'll see the flat rush build and prepare a counter — probably increased context filtering and anti-rush scout placement. But Chef's actual build for today's stream match will be the deep relay architecture. The counter-to-a-rush is weak against a slow, compressed, relay-heavy approach.

**Minute 0:00 (Stream) — Going Live**
Chef opens the stream. "Chat, today we're running the long con against NullPointer. You saw me lose those three matches earlier today? Those were bait. *Deliberately* bad. We fed them false intel." Chat erupts: `PROFILE POISONING` `GALAXY BRAIN` `this is so extra lmao` `the absolute disrespect`. Chef opens the Briefing screen, waiting for matchmaking. "Watch the variance bar. If NullPointer checked my recent matches, they think I've switched to rush. But we're going back to the deep relay chain. The one they haven't seen in four days."

**Minute 1:30 — The Briefing**
Opponent found: `NullPointer_404`. The Briefing card appears. Chef reads it aloud for chat. "Okay, NullPointer's tendency report. Communication Density: HIGH. Architecture Depth: DEEP. Config Variance... 23%. Low. They haven't changed much." Chef grins. "They're running their standard setup. Which means they probably adjusted *just* their anti-rush measures. Their config variance is low because they only tweaked, didn't overhaul. But their tweaks are designed to counter a rush that isn't coming." Chat: `5D CHESS` `they don't know PepeLaugh`.

**Minute 2:30 — The Plan**
Chef loads the deep relay architecture — the *real* build. Three relays forming a signal compression chain, scouts on wide patrol broadcasting to `raw-sweep`, relays compressing and forwarding to `processed-threat`, strikers listening only to the compressed channel. Command agent with reroute capability. The chat overlay shows the blueprint editor. Chef narrates every slot choice. "We're running full compression because NullPointer probably loosened their context filters to handle rush noise. That means they're *more* vulnerable to compressed, high-quality signals — their units will trust our fake signals alongside real ones because their filters are wide open."

**Minute 4:00 — The Sealed Watch**
Tick 1. Both sides spawn. Chef goes silent — sealed watch discipline. Chat watches the board. NullPointer's scouts are positioned forward — anti-rush positioning, exactly as Chef predicted. But Chef's scouts aren't rushing. They're patrolling wide, gathering intelligence, feeding the relay chain. By Tick 6, Chef's relay pipeline is fully operational — compressed threat data flowing to strikers with 4-tick latency but high signal quality. NullPointer's forward-positioned scouts are exposed, too far from their own striker support. Chef's scouts tag them. The strikers receive compressed, filtered coordinates. Two precision eliminations at Tick 8 and 9.

NullPointer scrambles to reposition. But their anti-rush configuration — wide context filters, forward scouts, reactive defensive posture — is poorly suited to countering a slow, methodical, information-superiority approach. By Tick 14, Chef's signal chain has mapped the entire right half of the board. The strikers advance with perfect intelligence. Match ends at Tick 21. Chef wins decisively.

**Minute 7:00 — The Debrief**
Chef opens the Inspector. "Chat, let's do the autopsy." She clicks NullPointer's lead scout at Tick 3. The decision trace shows the scout running a wide patrol — anti-rush pattern, checking for early aggressive units. "See? They were looking for the rush. The rush that we *told* them was coming." She scrubs to Tick 8, clicks her own relay. The context window shows compressed threat data — clean, filtered, high-confidence location data. "This is what deep relay does. And NullPointer's filters were wide open because they expected noise. They got surgical precision instead."

Chat explodes: `PROFILE POISONING IS REAL` `the metagame is insane` `she lost on PURPOSE to win THIS match` `clip it clip it clip it`. The clip — Chef's relay context window showing clean compressed data while NullPointer's scouts die on-screen — gets 23K views on TikTok with the caption "she lost 3 games on purpose so her opponent would prepare for the wrong strategy."

**UI Annotations:**
- **Dossier (Chef's view of NullPointer):** 11 match entries spanning 30 days, most recent at full opacity, oldest entries at ~40% with amber age pips, personal tags on entries (`[STANDARD BUILD]`, `[MINOR VARIANT]`)
- **Variance bar (NullPointer):** Low at 23%, rendered in steady teal — no pulse, no amber, signaling consistency
- **Inspector relay click:** Context window panel shows 12 slots, each with source label, age counter, compression indicator (cyan `[C]` badge for compressed entries), and decision-weight highlight

---

## Strengths

- **Thematic perfection.** A game about managing information under uncertainty makes *your intelligence about opponents* subject to the same uncertainty. The staleness mechanic IS the game's core mechanic applied to the meta-layer.
- **Emergent depth.** Profile poisoning doesn't need to be designed as a feature — it emerges naturally from config freedom and information decay. The game just needs to *not prevent* it.
- **Spectator gold.** "She lost on purpose to set up a false read" is an incredible narrative for streams, clips, and tournament commentary. It's the poker bluff translated to strategy gaming.
- **Skill expression.** Uncertainty management — knowing when to trust your intel, when to scout fresh, when to play safe against unknown configurations — is a genuine competitive skill that rewards experience.
- **Accessibility gradient.** Casual players see amber bars and learn to be cautious. Competitive players maintain Dossiers and track config patterns. Experts poison profiles. Same system, three depths.

## Weaknesses

- **ELO sacrifice cost.** Deliberate profile poisoning requires losing matches on purpose. In a ranked system, this creates perverse incentives — is the system rewarding bad play? The ELO cost acts as a natural brake, but it also means profile poisoning is only viable for players who can absorb rating loss.
- **Small population problems.** In low-population brackets, you face the same opponents repeatedly. Staleness decay is more meaningful here (you *need* fresh intel) but profile poisoning is also more obvious (everyone knows you changed your build specifically before facing them).
- **Information asymmetry at different ranks.** Bronze players don't check Dossiers. Diamond players study every replay. The system's value is heavily skewed toward competitive players. Is that acceptable, or should the Briefing be more proactive for casual players?
- **Confidence score accuracy.** If the game shows confidence percentages, players will treat them as ground truth. A 90% confidence score on stale data that happens to be accurate creates false trust; a 30% score on data that's actually still valid creates false doubt. The Fog of Memory approach (visual decay, no numbers) might be more honest.

## Interaction Effects

- **Inspector (locked):** The Inspector is where scouting happens. Every piece of opponent intelligence comes from clicking through their units' decision traces post-match. The staleness system decorates this data with temporal metadata — age, confidence, variance.
- **Config Codes / Blueprint Sharing (7.03e):** If players can share configs via Config Codes, profile poisoning gets more interesting — you can share your "bait" config publicly while running your real config in matches, creating community-level misdirection.
- **Sealed Watch (locked):** The no-skip, no-pause rule means you must discover your opponent's actual configuration through live observation. Even with stale scouting data, the sealed watch forces real-time assessment. This is the *correction mechanism* for bad intel — you always get ground truth during the match itself.
- **Gauntlet / Ranked System:** Profile poisoning is only meaningful in persistent competitive contexts where you face the same opponents repeatedly. The Gauntlet's ranking system is the substrate that makes staleness matter.
- **The Meta-Visibility Gap (1.06d):** Staleness compounds the visibility gap. Not only can you not see the non-transitive meta relationships, but the data you do have about specific opponents may be outdated or deliberately misleading.
- **Anthropomorphization (1.06e):** Players who name their bots and narrate personalities may feel betrayed when an opponent's "character" changes between matches. "That's not the same NullPointer I fought last week!" This emotional response to config changes adds narrative texture to the staleness problem.

## Sensory Description

The Briefing card materializes with a soft *thunk* — a dossier hitting a desk. Dark slate background (#1a2332), warm amber header text. Tendency bars fill left-to-right with a liquid teal (#00BCD4) pour animation, each bar taking 0.3 seconds. The variance bar fills last and, if above 50%, shifts from teal to amber (#FFC107) mid-pour, the color change propagating from left to right like a warning spreading through a system. Above 80%, double amber pips appear with a synchronized pulse — a slow heartbeat rhythm, 2-second cycle, the brightness oscillating between 60% and 100%. The pulse is not alarming — it's watchful. A low hum, like a signal receiver scanning frequencies, plays under the variance bar animation.

In the Dossier, old entries don't just fade — they develop a subtle noise texture, as if the data is degrading. The text remains readable but gains a faint static grain, pixel-level visual entropy increasing with age. Hovering over a faded entry plays a soft crackle — the sound of an old recording. Fresh entries are crisp, high-contrast, silent on hover. The transition from fresh to stale is continuous, never stepped — you can almost *feel* the information losing fidelity as the days pass, like watching a photograph yellow in fast-forward.

## The TikTok Clip

Split screen. Left: a player losing three matches in a row with a rush build, visible frustration, rating dropping. Right: the same player, one hour later, facing the same opponent. The Briefing card shows low opponent variance — they didn't change. The player loads a completely different configuration — deep relay chain. Match plays. Surgical precision. Dominant win. Text overlay: "she lost on purpose." The clip ends on the Inspector showing the opponent's scouts positioned for anti-rush — the wrong defense against the wrong threat. Comment section: "this game has a METAGAME metagame."
