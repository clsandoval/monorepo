# Compute Budget as Gauntlet Meta-Resource

**Aspect:** 4.77 — Compute budget as Gauntlet meta-resource: in competitive Gauntlet, both players have the same per-session compute budget; spending tokens on pre-match debrief analysis is visible to opponents post-season (analysis depth = dedication signal); creates a strategic meta-game where committing MSMFE to a target opponent is information; interaction with 4.54 adversarial exposure policy and 4.57 threat model report.

**Parent:** 4.60 — Search budget as a player resource
**Siblings:** 4.54 — Adversarial exposure policy; 4.57 — Threat model report
**Related:** 4.36 — Multi-Scenario Minimum Fix Explorer (MSMFE); 4.39 — Adversarial counterfactual mode; 4.60 — Search budget as a player resource; 7.01 — PvP attention vs. attention; 5.22 — Gauntlet as third act; 7.10 — Config necropsy culture

---

## The Core Problem

The search budget (4.60) in campaign mode is a pacing mechanic — it gates diagnostic depth to teach players the difference between QUICK hunches and THOROUGH certainty. In campaign, spending compute is a private decision with private consequences. You spend or you don't. Nobody cares.

Gauntlet changes everything. Two humans are competing. Both have the same per-session compute allocation. Both are burning tokens against the same shared clock. And here is the critical insight that transforms a pacing mechanic into a strategic weapon: **in a competitive context, spending compute on a specific opponent is itself an act with information content.**

If you spend 30 credits running MSMFE against your loss to xeno_architect, that expenditure communicates something: you consider xeno_architect a serious enough threat to warrant expensive analysis. If you run adversarial counterfactual mode (4.39) on your *win* against xeno_architect — spending compute to find how they *could have* beaten you — that communicates even more. You're not just preparing against them. You're studying them.

The question this aspect addresses: **should opponents be able to see how much compute you spent analyzing them, and if so, when?**

In most competitive games, preparation is invisible. A StarCraft player studies build orders on YouTube — their opponent never knows how many hours went into it. A chess grandmaster might prepare an opening novelty for months — their opponent sees only the move on the board. Robot Uprising has the opportunity to make preparation itself a visible, strategic dimension of play. Analysis depth becomes a dedication signal. Compute allocation becomes a meta-resource with social consequences.

This creates a meta-game that sits above the match itself: not just "what did you build?" but "how hard did you think about what I built?"

---

## The Design

### The Compute Ledger

Every Gauntlet player has a **compute ledger** — a complete, timestamped record of every diagnostic action they perform during a season. Each ledger entry records:

- **Target:** which opponent's match was analyzed
- **Tool:** QUICK (0 credits), THOROUGH (1 credit per session budget, or 10-15 credits per earned-budget model), MSMFE (3x THOROUGH cost), adversarial counterfactual (2x THOROUGH cost)
- **Timestamp:** when the analysis was run
- **Result category:** fix found / no fix found / adversarial vector found / no vector found (but NOT the specific fix or vector)

The ledger does **not** record what the player learned. It records that they spent compute looking. This is the critical design distinction: the act of analysis is disclosed; the content of analysis is private.

```
SEASON 4 — COMPUTE LEDGER (public post-season)
────────────────────────────────────────────────
Match vs. xeno_architect (W, EDT 0.31)
  QUICK .................. tick 0:04 — fix found
  THOROUGH ............... tick 0:38 — fix found (differs from QUICK)
  ADVERSARIAL ............ tick 1:12 — 2 vectors found

Match vs. signal_collapse (L, EDT 0.77)
  QUICK .................. tick 0:02 — fix found
  MSMFE .................. tick 2:41 — 14/22 scenarios resolved

Match vs. relay_ghost (W, EDT 0.19)
  (no analysis performed)
────────────────────────────────────────────────
Total season spend: 47 / 60 credits
```

### Visibility Rules: The Exposure Timeline

The compute ledger follows a **delayed disclosure** model with three phases:

**Phase 1 — Private (during season):** Your ledger is visible only to you. You can see exactly what you've spent, on whom, with what tools. Your opponents see nothing. This protects in-season strategic preparation — you can study an opponent without alerting them.

**Phase 2 — Aggregate disclosure (season end):** When the season concludes, each player's **total compute spend per opponent** becomes visible on their season profile. Not the individual tool uses — just the aggregate number. "Player spent 18 credits analyzing xeno_architect this season." This tells xeno_architect: I was being studied, seriously. But it doesn't reveal which tools were used or what was found.

**Phase 3 — Full ledger disclosure (post-season + 48 hours):** 48 hours after the season ends, the full ledger — every tool use, every timestamp, every result category — becomes public on the player's season profile. This is the threat model report (4.57) input data. Now xeno_architect can see not just that 18 credits were spent, but that the player ran adversarial counterfactual on a *winning* match. That's a very specific signal: this player was stress-testing their defense against xeno_architect's attack vectors, even when they were already winning.

### The Adversarial Exposure Policy (4.54) Integration

The adversarial exposure policy governs what opponents can see about your analysis. The player configures this at the start of each season, choosing one of three postures:

**OPEN BOOK:** Full ledger visible to opponents in real-time during the season. No delay. Your opponents can see you studying them as you do it. This is a dominance signal — "I'm not hiding my preparation because I don't need to." It also creates counter-play: if xeno_architect sees you running MSMFE on your loss to them, they know you're preparing a counter. They can pre-counter your counter. The mind games begin.

**SEALED (default):** Standard three-phase delayed disclosure. Private during season, aggregate at season end, full ledger 48 hours later. This is the balanced option — preparation is private, results are eventually public.

**REDACTED:** Only total season compute spend is disclosed. No per-opponent breakdown. No tool-level detail. The player sacrifices the "dedication signal" — opponents never see how much attention was paid to them individually — in exchange for total analytical privacy. However, REDACTED carries a visible tag on the player's season profile: `[REDACTED LEDGER]`. The tag itself is information. A player who redacts is signaling that their preparation strategy is worth hiding. In competitive communities, the redaction tag often draws *more* scrutiny than an open ledger.

```
EXPOSURE POLICY — Season 5
────────────────────────────
○ OPEN BOOK  — full ledger visible in real-time
● SEALED     — delayed three-phase disclosure (default)
○ REDACTED   — total spend only, [REDACTED] tag visible
────────────────────────────
[Set Policy]   Policy locks at first match of season.
```

Policy locks at first match. No changing mid-season. This prevents reactive disclosure manipulation — you can't switch to REDACTED after your opponent notices you studying them.

### The Dedication Signal Meta-Game

The core meta-game emerges from a simple truth: **compute is finite, and allocation reveals priorities.**

A player with 60 credits per season who spends 35 of them on one opponent is making a statement. That allocation pattern — visible post-season — tells the community who the player considers their primary rival. It tells the rival that they are being taken seriously. It tells everyone else that they are *not* being taken seriously enough to warrant expensive analysis.

This creates social dynamics that no other competitive game has:

**The Flattery Problem:** Being studied is flattering. A top-tier player who sees that six opponents each spent 15+ credits analyzing them knows they are the meta's center of gravity. This is a form of leaderboard that measures perceived threat rather than win rate.

**The Misdirection Play:** A sophisticated player might deliberately spend 20 credits running MSMFE on a mid-tier opponent they're already beating easily — knowing that the post-season ledger will show heavy investment in the wrong target. Meanwhile, the real preparation against their true rival was done with efficient QUICK runs that cost almost nothing. The ledger shows obsession with the decoy. The truth is in the QUICK results nobody can see.

**The Arms Race Spiral:** Two players who are both studying each other heavily enter a mutual-analysis spiral. Each sees the other's dedication. Each escalates. The compute budget becomes a proxy for psychological investment in the rivalry. This is inherently compelling — it makes inter-player rivalries legible and visible to the community.

### The Threat Model Report (4.57) as Season Summary

At season end, every player receives a **threat model report** — an auto-generated document summarizing who studied them, how deeply, and with what tools. This is the inverse of the compute ledger: the ledger shows what you spent; the threat model shows what was spent on you.

```
THREAT MODEL REPORT — Season 4
═══════════════════════════════════════════════
You were analyzed by 8 opponents this season.

HIGHEST DEDICATION:
  relay_ghost ........ 22 credits (MSMFE ×2, ADVERSARIAL ×3)
  signal_collapse .... 15 credits (THOROUGH ×6, ADVERSARIAL ×1)

MODERATE:
  xeno_architect ..... 8 credits (THOROUGH ×3)
  buffer_overflow .... 5 credits (THOROUGH ×2)

MINIMAL (QUICK only):
  clock_drift, phase_shift, null_pointer, echo_chamber

YOUR MOST-STUDIED MATCH:
  vs. relay_ghost (L, EDT 0.82, Week 3)
  — analyzed by relay_ghost: MSMFE + ADVERSARIAL
  — analyzed by signal_collapse: THOROUGH ×2
═══════════════════════════════════════════════
```

The threat model report tells the player: these are the people who considered you dangerous enough to invest in. The "most-studied match" section reveals which of your losses (or wins) drew the most analytical attention from the community — which is a proxy for which match was most architecturally interesting.

---

## Player Journeys

### Journey: Lena, 31, Data Engineer, Commander Tier, Season 4 Week 6

**Context:** Lena has been running a relay-compression architecture for three seasons. Her current v6.2 is a tuned variant of a design she's evolved since Season 2. She's 14-6 this season, solidly in Commander tier. She has 22 of her 60 season compute credits remaining. The season ends in 9 days. She just lost to relay_ghost for the second time — EDT 0.82, a slow grind where her relay's echo suppression was systematically dismantled.

**Minute 0:00 — The Budget Check**
Lena opens the debrief on her loss to relay_ghost. Before doing anything, she checks the compute budget display in the top-right corner of the debrief panel:

```
COMPUTE BUDGET   Season 4
██████████░░░░░░░░░░░░  22 / 60
```

Twenty-two credits. She mentally prices the options: QUICK is free. THOROUGH costs 10. MSMFE costs 30 — she can't afford it. Adversarial counterfactual costs 20. She can afford exactly one THOROUGH and one adversarial run, or one adversarial run and two QUICK runs, or two THOROUGH runs and two QUICK runs. Not enough for MSMFE.

She glances at her season ledger. She's already spent 12 credits on relay_ghost across three previous debriefs — two THOROUGH runs and one adversarial on a prior win. That's more than she's spent on any other opponent. She's aware that post-season, relay_ghost will see this allocation.

She thinks: *relay_ghost will know I've been studying them. Good. Let them know.*

**Minute 0:30 — The Strategic Spend**
Lena runs QUICK first. Free. Result in 4 seconds: "FIRST VIABLE FIX: RELAY-B — echo suppression threshold +2." She's seen this fix suggestion before from a prior loss. It's a band-aid.

She selects THOROUGH. The confirmation dialog shows her the budget impact:

```
THOROUGH ANALYSIS — 10 credits
Budget after: 12 / 60
Are you sure? [Confirm] [Cancel]
```

She confirms. The 28-second progress bar runs. The binary cascade animation plays in teal-green segments, each one representing a candidate mutation being tested against the replay. At second 19, a segment flashes brighter — a hit.

Result: "MINIMUM FIX: RELAY-B — add source filter: exclude signals from opponent STRIKER-C when buffer occupancy > 80%. Expected improvement: opponent's dismantling chain breaks at tick 61 instead of completing at tick 74."

This is different from the QUICK result. This is specific. This targets the exact dismantling chain relay_ghost used. Lena reads it twice.

**Minute 1:30 — The Allocation Decision**
She has 12 credits remaining. Adversarial mode costs 20 — she can't afford it. She has enough for one more THOROUGH on a future match, or she can save everything for the final week.

She decides to save. The fix from this THOROUGH run is enough to patch v6.2 into v6.3. She'll deploy v6.3 and see if relay_ghost's dismantling chain still works. If she loses again, she'll spend the remaining 12 on a THOROUGH post-mortem of the new loss.

She opens the fork-and-deploy panel (4.37), applies the source filter, and queues v6.3 for deployment.

**Minute 2:00 — The Ledger Awareness**
Before closing the debrief, Lena opens her compute ledger. She scrolls through her season expenditure:

```
relay_ghost:     34 credits (THOROUGH ×3, ADVERSARIAL ×1, QUICK ×4)
signal_collapse: 10 credits (THOROUGH ×1)
xeno_architect:   0 credits (QUICK ×2 only)
all others:       0 credits
```

Thirty-four credits on relay_ghost. More than half her season budget spent studying one opponent. She knows this will be visible post-season. She knows relay_ghost will see the number and understand: Lena considers them the threat.

She considers switching to REDACTED exposure policy — but it's locked. She chose SEALED at season start. The ledger will be visible 48 hours after season end. She's committed.

She closes the debrief. The compute display ticks down: `12 / 60`.

**UI Annotations:**
- **Budget display:** Top-right of debrief panel, horizontal bar with exact numbers. Color shifts from teal (>50%) to amber (20-50%) to red (<20%).
- **Spend confirmation:** Modal with budget-after preview. No confirmation for QUICK (free). Confirmation for all paid analyses.
- **Ledger button:** Small ledger icon next to budget display. Opens a slide-out panel showing per-opponent spend breakdown. Sortable by total spend, by opponent name, by most recent analysis.

---

### Journey: Tomasz, 24, Competitive Gamer, Overseer Tier, Season 4 Post-Season

**Context:** Tomasz finished Season 4 ranked 12th globally. He's in the 48-hour window after season end — full ledgers just became public. He's reading his threat model report for the first time.

**Minute 0:00 — The Threat Model Opens**
Tomasz navigates to his profile's Season 4 summary page. A new tab has appeared: **THREAT MODEL**. The tab has a small red badge: "8 analysts." He clicks.

The report loads with a slow vertical scroll animation — each section materializing like lines being printed on a terminal. The header shows his season record (19-5) and overall rating change (+127). Below it: the threat model body.

**HIGHEST DEDICATION:** Two names. relay_ghost spent 22 credits analyzing Tomasz — MSMFE twice, adversarial three times. signal_collapse spent 15 credits — six THOROUGH runs across five different matches.

Tomasz stares at relay_ghost's line. Twenty-two credits. MSMFE twice. He lost to relay_ghost once this season — a Week 3 match, EDT 0.82. relay_ghost spent more compute studying that single loss than most players spend in an entire season.

He clicks relay_ghost's name. The ledger detail expands:

```
relay_ghost's analysis of you — Season 4
────────────────────────────────────────
Week 3: vs. Tomasz (relay_ghost W, EDT 0.82)
  THOROUGH ........... tick 0:31 — fix found
  MSMFE .............. tick 3:12 — 18/22 scenarios resolved
  ADVERSARIAL ........ tick 5:44 — 3 vectors found

Week 5: vs. Tomasz (relay_ghost L, EDT 0.44)
  QUICK .............. tick 0:04 — fix found
  ADVERSARIAL ........ tick 1:18 — 1 vector found

Week 7: vs. Tomasz (relay_ghost W, EDT 0.71)
  MSMFE .............. tick 4:02 — 9/15 scenarios resolved
  ADVERSARIAL ........ tick 6:33 — 2 vectors found
────────────────────────────────────────
Total: 22 credits across 3 matches
```

Tomasz reads the timestamps. relay_ghost ran adversarial mode on a match they *lost* to Tomasz (Week 5, EDT 0.44). That means relay_ghost found one attack vector that could have flipped their loss into a win — and Tomasz doesn't know what it is. The ledger shows the result category ("1 vector found") but not the vector itself. relay_ghost knows Tomasz's vulnerability. Tomasz knows that relay_ghost knows. But Tomasz doesn't know the specifics.

**Minute 1:30 — The Counter-Analysis**
Tomasz navigates to his own ledger. He spent 4 credits total on relay_ghost this season — two QUICK runs. He didn't bother with THOROUGH or adversarial. He won 1, lost 2, and treated the losses as noise.

Now he sees the asymmetry: relay_ghost spent 22 credits studying him. He spent 4. relay_ghost has a threat model on his architecture. He has nothing.

He opens his Season 5 preparation notes and writes: "relay_ghost: primary threat. Budget 15-20 credits minimum for analysis. Run adversarial on every match regardless of outcome."

**Minute 2:30 — The Community Feed**
Tomasz checks the community necropsy feed (7.10). Three config necropsies have been posted referencing his architecture. One of them — posted by a player he doesn't recognize — includes a section titled "Tomasz's Relay Compression Weakness: An Analysis." The author cites their own adversarial runs as evidence.

The threat model report is not just a private document. It's also the raw material for community analysis. Players who study you publish their findings. The ledger confirms how much work went into those publications.

Tomasz feels a mix of flattery and vulnerability. He is the meta's subject. His architecture is being studied publicly. The compute ledger proves it wasn't casual — it was expensive, deliberate, sustained effort.

**UI Annotations:**
- **Threat model tab:** Appears on player profile 48 hours after season end. Red badge shows number of analysts. The tab pulses once when first available, then settles.
- **Analyst detail expansion:** Click an analyst's name to see their full per-match breakdown. Entries animate in sequentially — a slow reveal that builds tension.
- **"Result category" labels:** "fix found," "no fix found," "N vectors found," "N/M scenarios resolved." These communicate the *shape* of the analysis without revealing content. Font: monospaced, muted amber on dark background.
- **Asymmetry indicator:** When viewing an opponent's analysis of you, a small comparison appears: "They spent 22 credits analyzing you. You spent 4 analyzing them." The ratio is displayed as a thin horizontal bar — their spend on the left in amber, yours on the right in teal. An imbalanced bar makes the asymmetry visceral.

---

### Journey: Priya, 27, Game Designer, Strategist Tier, Mid-Season Misdirection Play

**Context:** Priya is a mid-tier Gauntlet player who reads every design article and community necropsy. She understands the compute ledger system intimately. She's running OPEN BOOK exposure policy — her opponents can see her analysis in real-time. This is deliberate. She has a plan.

**Minute 0:00 — The Setup**
Priya's actual rival is clock_drift — a player one tier above her who she's lost to three times. Her config v3.1 has a known weakness against clock_drift's hook-synchronization strategy. She's been working on a counter privately, using only QUICK runs (free, invisible in terms of credit spend).

But her compute ledger tells a different story. Over the past two weeks, Priya has spent 25 credits running THOROUGH and MSMFE against buffer_overflow — a mid-tier player she's already beating comfortably. She's run adversarial mode twice on matches she won against buffer_overflow. The analyses returned useful-but-unnecessary results.

Because she's running OPEN BOOK, clock_drift — and everyone else — can see this in real-time. Priya's ledger screams: "I'm obsessed with buffer_overflow."

**Minute 0:30 — The Misdirection's Purpose**
clock_drift checks the community ledger feed (a public timeline of OPEN BOOK players' analysis activity). They see Priya's heavy investment in buffer_overflow. They draw the intended conclusion: Priya is preparing a counter-strategy for buffer_overflow's architecture, not for clock_drift's.

clock_drift doesn't adjust their own architecture in response to Priya. Why would they? Priya isn't studying them. The ledger proves it.

**Minute 1:00 — The Deployment**
Priya deploys v3.2 — the counter she built using free QUICK runs against clock_drift. The config change is small: a hook-timing adjustment that breaks clock_drift's synchronization attack. She never ran THOROUGH on it. She never ran MSMFE. She arrived at the fix through six careful QUICK iterations across three sessions, costing zero credits.

Her compute ledger for clock_drift reads: `QUICK x6 — 0 credits.` Barely a footnote.

**Minute 3:00 — The Payoff**
Match result: Priya defeats clock_drift. EDT 0.38. The synchronization attack fires at tick 22 but her hook-timing adjustment deflects it cleanly. clock_drift's architecture, unchanged because they didn't see the threat coming, collapses by tick 45.

In the post-match community chat, clock_drift types: "where did that come from?" Priya links her compute ledger. Twenty-five credits on buffer_overflow. Zero on clock_drift. The community sees the misdirection for what it was: she spent real resources constructing a false signal in a public ledger to mask her true preparation vector.

The misdirection cost her 25 credits of real compute budget — credits she could have spent on genuine analysis. The OPEN BOOK policy ensured the false signal was visible. The QUICK-only preparation against her actual target was invisible to credit accounting but effective in practice.

**UI Annotations:**
- **OPEN BOOK real-time feed:** A community-visible timeline showing analysis activity from OPEN BOOK players. Each entry: player name, target opponent, tool used, result category. Updates within 30 seconds of analysis completion.
- **OPEN BOOK profile badge:** A small open-eye icon next to the player's name in all community views. Tooltip: "This player's compute ledger is visible in real-time."
- **Credit-cost column in ledger:** QUICK shows "0" in a muted grey. THOROUGH and above show their cost in amber. The visual distinction between free and paid analysis is immediate — a player scanning the ledger can instantly see where real budget was allocated.

---

## Strengths

**Creates a meta-game above the match.** The compute ledger adds a strategic layer that exists entirely outside the 8x8 grid. Allocation decisions, exposure policies, misdirection plays — these are strategic actions that occur between matches and across seasons. No other competitive game makes preparation effort itself a visible, contestable dimension.

**Rivalries become legible.** When two players spend heavy credits studying each other, the community can see the rivalry forming in the data. This makes competitive narratives emerge organically — not from tournament brackets or developer-curated storylines, but from raw analytical investment patterns.

**Budget scarcity forces triage.** Sixty credits per season means you cannot study everyone thoroughly. You must choose: which opponents deserve THOROUGH? Which warrant MSMFE? Which get only QUICK? These triage decisions reveal strategic priorities in a way that win-loss records alone cannot.

**The exposure policy creates genuine strategic choice.** OPEN BOOK, SEALED, and REDACTED are not cosmetic preferences — they are strategic postures with real consequences. Each carries information content even in its selection. A player choosing REDACTED is communicating something by refusing to communicate.

**Post-season threat model drives next-season preparation.** The threat model report closes the loop: your Season 4 report becomes your Season 5 preparation brief. You enter the new season knowing who studied you, how deeply, and through which tools. This creates a persistent, evolving meta-narrative across seasons.

---

## Weaknesses

**Rich-get-richer information asymmetry.** Top-tier players who are studied by many opponents receive rich threat model reports — they know who's preparing against them. Low-tier players whose ledgers draw no attention receive empty reports. The information value of the system concentrates at the top, potentially widening the competitive gap.

**Misdirection undermines trust in the signal.** If players learn that ledger data can be deliberately faked (Priya's journey), the dedication signal loses credibility. The community may discount ledger data entirely, collapsing the meta-game. Mitigation: misdirection is expensive (Priya burned 25 real credits), so it self-limits. But the meta-awareness that misdirection exists may be enough to devalue all signals.

**Cognitive overhead for casual competitors.** A casual Gauntlet player who just wants to play matches and improve their config now has to think about ledger visibility, exposure policies, and compute allocation strategy. This is a complexity tax on players who may not care about the meta-game.

**The REDACTED tag paradox.** REDACTED is designed to provide privacy, but the tag itself is information. In practice, REDACTED may draw more analysis from curious opponents than SEALED would — defeating its own purpose. This is a feature (the paradox is strategically interesting) or a bug (it punishes privacy-seeking players), depending on design intent.

**Delayed disclosure reduces in-season counter-play.** The SEALED default means most analysis is invisible during the season. The meta-game is mostly retrospective — you learn who studied you after the season is over, when you can no longer respond within that season's matches. The meta-game is a between-seasons phenomenon, not a within-season phenomenon (unless players choose OPEN BOOK).

---

## Interaction Effects

**4.60 Search budget:** The Gauntlet compute budget is a specialization of the search budget for competitive contexts. In campaign, budget governs access to THOROUGH vs. QUICK. In Gauntlet, the same budget takes on strategic meaning because expenditure becomes visible information. The mechanical resource (tokens spent) gains a social dimension (tokens spent on whom) that doesn't exist in single-player.

**4.54 Adversarial exposure policy:** The three exposure postures (OPEN BOOK, SEALED, REDACTED) are the control surface for this entire meta-game. Without configurable exposure, the compute ledger would be either always-visible (too much information) or always-hidden (no meta-game). The policy choice is the player's first strategic decision of the season — before any match is played.

**4.57 Threat model report:** The threat model report is the payoff document for the entire system. Without it, compute expenditure disappears into the void. The report makes the investment legible: here is who studied you, how seriously, through which tools. It converts raw budget data into actionable intelligence for the next season.

**4.36 MSMFE:** MSMFE is the most expensive analysis tool. In the compute-as-meta-resource frame, choosing to run MSMFE on a specific opponent is the strongest possible dedication signal — you spent 30 credits (half a season budget in some models) on one analysis pass. The MSMFE entry in a compute ledger is the equivalent of a declaration of intent.

**4.39 Adversarial counterfactual:** Running adversarial mode on a match you *won* is the most information-rich entry in a compute ledger. It signals: "I don't just want to beat you — I want to understand how you could beat me, even when you didn't." This is the ultimate dedication signal, and the most strategically revealing line item in any ledger.

**7.10 Config necropsy culture:** Community necropsies that cite compute ledger data — "I spent 40 credits across six matches studying this architecture" — carry more weight than pure theory posts. The ledger data serves as a credibility signal for analysis quality: expensive analysis is more likely to be thorough analysis.

---

## Comparable Games/Media

**Professional sports film study:** NFL teams spend hundreds of hours studying game film of upcoming opponents. The *amount* of film study is itself a signal — teams that break down every snap of an opponent's season are signaling preparation depth. Robot Uprising's compute ledger is the equivalent of a scouting report that your opponent eventually gets to read.

**Poker tracking software (PokerTracker, Hold'em Manager):** Online poker players use HUDs that display statistics about opponents: how often they raise preflop, how often they fold to 3-bets, how many hands are in the database. The sample size itself is information — 50,000 tracked hands on an opponent means you've been studying them for months. The compute ledger works the same way: the quantity of data gathered reveals the depth of study.

**Magic: The Gathering sideboard guides:** In competitive MTG, publishing a detailed sideboard guide for a specific matchup signals that you've tested it extensively. A player who writes "In vs. Mono-Red: bring in 4 Aether Gust, 2 Negate, cut 3 Bonecrusher" is revealing both their preparation and their strategic assessment. The compute ledger's post-season disclosure is a forced version of this — every player's sideboard notes become public.

**Cold War intelligence spending:** During the Cold War, the CIA and KGB could infer each other's priorities by analyzing where resources were allocated. A satellite repositioned over a specific military base was itself intelligence — it told the target that they were being watched. The compute ledger creates the same dynamic: analytical attention is detectable, and detection changes behavior.

**Strava (running/cycling app):** Strava's segment leaderboards show not just performance but *frequency* — how many times a runner has attempted a specific segment. An athlete who has run the same hill segment 200 times is revealing obsessive preparation. The compute ledger is Strava for competitive analysis: your repetition is visible, and repetition signals dedication.

---

## Sensory Description

**The compute budget display:** A horizontal bar in the top-right corner of every Gauntlet debrief panel. When full (60/60), the bar is solid teal — the familiar diagnostic color. As credits deplete, segments darken from right to left, each extinguished segment making a barely audible click, like a mechanical counter decrementing. At 50%, the remaining segments shift to warm amber. Below 20%, they shift to a deep rust-red. The numbers are displayed in a monospaced typeface to the right of the bar: `12 / 60`. When a THOROUGH or MSMFE analysis completes, the spent credits animate out — each consumed segment briefly flares white before darkening, accompanied by a soft electrical discharge sound, like a capacitor releasing.

**The compute ledger panel:** A slide-out panel from the right edge of the screen, triggered by clicking a small ledger icon (stylized as a columnar accounting book, spine visible). The panel background is a deep charcoal — darker than the main debrief panel — with entries rendered in amber monospaced text on a near-black field. Each opponent's name appears left-aligned; their total credit cost right-aligned. Between them, a faint dotted line connects name to number, evoking a financial ledger. Hovering over an opponent's row causes their entries to expand downward — each tool use appearing one by one, top to bottom, with a soft typewriter click for each line. The expansion animation takes 400ms per line. The rhythm is deliberate. You are reading a dossier.

**The exposure policy selector:** Presented during Season Setup, before the first match. Three large rectangular cards arranged horizontally, each with a distinct visual identity. OPEN BOOK: white card, open-eye icon, border glowing soft gold, subtitle "Your analysis is visible in real-time." SEALED: grey card, half-lidded eye icon, border in neutral silver, subtitle "Three-phase delayed disclosure." REDACTED: black card, crossed-out eye icon, border in deep crimson, subtitle "Total spend only. [REDACTED] tag visible." Selecting a card causes the other two to recede and desaturate. The selected card enlarges slightly and locks with a firm mechanical click — a deadbolt engaging. The sound communicates finality: this choice is for the season.

**The threat model report:** Opens with a slow terminal-style render. The header — "THREAT MODEL REPORT" — appears character by character in amber on black, accompanied by a low-frequency hum that builds as the title completes. Then silence. Then the first analyst name appears, left-aligned, with their credit total fading in right-aligned. A horizontal rule draws itself across the screen. The next section loads. The pacing is slower than any other panel in the game — intentionally. You are reading intelligence. The ambient audio shifts to a low, sustained drone — not musical, but present. A tension frequency. When the "HIGHEST DEDICATION" section appears, the analyst names glow slightly brighter than the others. The credit totals for high-dedication analysts pulse once — a single amber throb — before settling. The most-studied match section is bordered by a thin red line, evoking the adversarial counterfactual's attack-window bracket. The message is: this match attracted serious analytical attention. Someone spent real resources understanding how to defeat you here.

**The OPEN BOOK real-time feed:** A narrow ticker at the bottom of the Gauntlet lobby screen, visible only to OPEN BOOK players and those watching them. Each entry scrolls left-to-right: `[relay_ghost] THOROUGH on match vs. xeno_architect — fix found`. The text is rendered in a muted cyan on dark background, dimmer than the main UI, legible but not attention-grabbing. When a player you've recently matched against appears in the feed studying *your* match, the entry briefly highlights in amber and a soft notification chime sounds — two ascending notes, like a proximity alert. Someone is looking at your architecture. Right now.
