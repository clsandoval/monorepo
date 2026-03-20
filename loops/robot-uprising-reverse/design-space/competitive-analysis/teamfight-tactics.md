# Teamfight Tactics / Dota Underlords — Competitive Analysis

**Aspect:** 1.21 — Teamfight Tactics / Dota Underlords: plan then watch, positioning matters, synergy traits
**Wave:** 1
**Date:** 2026-03-20

---

## Overview

Teamfight Tactics (TFT) is Riot Games' auto-battler, launched in June 2019 as the genre-defining response to Dota Auto Chess. Dota Underlords was Valve's competing entry, launched the same month. Together they represent the purest commercial expression of the "plan then watch" game loop — the exact temporal structure Robot Uprising inherits through its sealed watch phase. TFT won the market decisively: 33 million monthly players as of 2024, robust esports scene ($4.9M in prize pools in 2024 alone), and continuous "Set" rotations that reinvent the game every few months. Underlords, by contrast, was effectively abandoned by Valve — a cautionary tale in how identical core loops can diverge based on content cadence and community investment.

**TFT:** Free-to-play, cosmetics-only monetization. 33M monthly players. South Korea generates 54.4% of revenue despite 13% of downloads.
**Dota Underlords:** Free-to-play. 1.5M mobile installs in first week, peaked at $1.3M first-week gross. Effectively abandoned by 2021.
**Platforms:** TFT on PC/Mobile; Underlords on PC/Mobile/Linux.

---

## Core Loop

### The 3-Second Loop (Combat Tick)
Units auto-attack, cast abilities, and die according to their stats, items, and positioning. The player has zero input. This is the sealed watch equivalent — the moment where your configuration either works or doesn't.

### The 30-Second Loop (Planning Phase)
Between combat rounds, you buy champions from a rotating shop, place them on a hex grid, equip items, and manage your economy. This is the workbench phase. The entire game's strategic depth lives here. You scout opponent boards (visible at all times), decide whether to "roll" gold for better champions or save for interest income, and reposition units based on who you'll face next.

### The 5-Minute Loop (Stage Progression)
Each stage contains several rounds including PvE "creep" rounds, a shared draft carousel, and PvP matchups. Augment selection happens at fixed stage intervals, offering run-defining choices. Stage transitions mark difficulty escalation as surviving players consolidate power.

### The 30-Minute Loop (Full Game)
Eight players compete in a free-for-all. Each loss depletes your HP pool. Last player standing wins. A full game runs 25-35 minutes. The game naturally creates an arc: scramble phase (early), power spike phase (mid), and composition-locked optimization phase (late).

---

## Information Management Mechanics

TFT is remarkably generous with information compared to Robot Uprising's design:

**Full Board Visibility.** You can scout every opponent's board at any time. This is the anti-fog-of-war — perfect spatial information. The information challenge isn't "what do they have?" but "what will they build toward?" This is inferred information, not observed information.

**Shared Champion Pool.** All eight players draw from the same finite pool of champions. If three players are building the same composition, each will find fewer copies. This creates a hidden resource competition that rewards scouting — you must track what others are buying to predict your own draw odds. This is information-as-competitive-advantage without any explicit fog.

**Economy Transparency.** Gold totals, level, and HP are visible for all players. You can see who is "saving" (high gold, low board strength) vs. "rolling" (low gold, strong board). This makes economic reads a skill — experienced players identify when opponents are about to power spike.

**Item Opacity.** Item components drop from PvE rounds with randomness. Completed items are visible on opponent units, but the exact combination path was partly luck-dependent. This is one of the few genuine information asymmetries in the game.

**Key Insight for Robot Uprising:** TFT proves that "plan then watch" works even with near-perfect information. The tension comes not from hidden state but from combinatorial complexity — there are too many possible compositions and counter-positions to compute optimally, so intuition and pattern recognition dominate. Robot Uprising's information scarcity (buffer staleness, EM fog, signal latency) adds a second layer of tension that TFT deliberately avoids.

---

## Complexity Ramp

TFT's onboarding is notoriously rough despite the simple core loop:

**Phase 1 (Games 1-5): Pure Confusion.** New players don't understand synergy traits, don't know which champions combine, don't manage economy. They buy the "strongest looking" units and lose. The game provides minimal tutorial — you learn by losing.

**Phase 2 (Games 5-20): Synergy Discovery.** Players start recognizing trait bonuses (e.g., "3 Marksmen gives attack speed"). They follow simple "play what the game gives you" heuristics. Still don't understand economy.

**Phase 3 (Games 20-50): Economy Awakening.** The interest system (earn 1 bonus gold per 10 saved, up to 5) clicks. Players start "econ-ing" — intentionally losing early rounds to save gold, then "rolling down" at key levels. This is the first genuine strategic layer.

**Phase 4 (Games 50-200): Composition Mastery.** Players learn 3-4 meta compositions and when to pivot between them based on what the shop offers. Positioning becomes deliberate (frontline tanks, backline carries, assassin counter-positioning).

**Phase 5 (Games 200+): Scouting and Adaptation.** Expert players scout every board every round, track champion pool depletion, predict opponent transitions, and position specifically for their next-round matchup.

**The Set Rotation Problem.** Every 3-4 months, Riot replaces all champions and traits. This resets knowledge but maintains mechanical skill. It's brilliant for retention (returning players get a "new game" feel) but punishing for intermittent players (your composition knowledge evaporates).

**Lesson for Robot Uprising:** TFT's complexity ramp is almost entirely self-directed — the game teaches almost nothing explicitly. Robot Uprising's boot-log tutorial and progressive workbench unlock are direct responses to this weakness in auto-battlers. But TFT proves that a 200-game mastery curve is commercially viable if each game is short enough (30 min) and the variance keeps early games entertaining.

---

## UI/UX

**The Board.** Hexagonal grid, 4 rows deep on each player's side. Units snap to hexes. Clean, readable at a glance. Color-coded trait indicators appear below each unit. This is excellent spatial UI — you can screenshot a board and an experienced player can evaluate it instantly.

**The Shop.** Five champion cards appear each round. One-click buy, one-click sell. Drag to board or bench. The shop is the game's most-interacted element and it's appropriately fast. Champion cards show trait icons, star level, and cost — information density without clutter.

**The Trait Panel.** Active synergy traits listed on the left side with progress indicators (e.g., "3/4 Marksman"). Bronze/silver/gold/prismatic borders indicate activation tier. This is the game's most important read-at-a-glance element.

**The Augment Selection.** Three augments presented as cards with descriptions. Selection is permanent and run-defining. This is the game's highest-stakes single decision, and the UI appropriately gives it full-screen focus with a timer.

**The Damage Recap.** Post-round damage breakdown shows which units performed. This is TFT's Inspector equivalent — limited but functional. It shows total damage dealt per unit but lacks the causal tracing Robot Uprising's Inspector provides.

**Key UI Lesson:** TFT proves that auto-battler UI must be optimized for the planning phase, not the combat phase. Combat is spectacle. Planning is gameplay. Robot Uprising's workbench-first design philosophy aligns with this.

---

## Replayability

TFT's replayability is extraordinary and stems from multiple systems:

1. **Set Rotation (every 3-4 months).** Complete champion/trait overhaul. Functionally a new game.
2. **Augment Variance.** Each game offers different augments, forcing different strategies.
3. **Shop Randomness.** What the shop offers dictates viable compositions — no two games play identically.
4. **Ranked Ladder.** Iron through Challenger tiers with visible LP. Climbing is the primary retention driver.
5. **8-Player Format.** More opponents = more variance in matchups and draft competition.

**Underlords' Replayability Failure.** Underlords had similar mechanical replayability but failed on content cadence. Without set rotations, the meta stagnated. Without ranked investment, climbing felt pointless. Without mobile-first polish, casual players churned. The lesson: replayability systems must be maintained, not just designed.

---

## Community Reception

**TFT:** Universally regarded as the definitive auto-battler. Praised for set rotation freshness, criticized for power creep within sets, augment balance, and the steep learning curve. The competitive community is large and healthy with active streaming culture. Mobile version praised for accessibility.

**Underlords:** Initially well-received, then community slowly abandoned it as Valve stopped updating. The "Valve doesn't care" narrative became self-fulfilling. Final player counts in the low hundreds on Steam.

---

## Mechanics Translatable to Robot Uprising

**1. The "Plan Then Watch" Temporal Split.** TFT validates that the entire game can live in the planning phase. Combat is entertainment, not gameplay. Robot Uprising's sealed watch is this principle taken further — you can't even intervene during execution.

**2. Synergy Traits as Composition Architecture.** TFT's trait system (units belonging to multiple categories, thresholds unlocking bonuses) maps to Robot Uprising's unit-type interactions. A TFT player who understands "2 Marksmen is OK, 4 Marksmen is a power spike" will intuitively understand "2 relays create a network, 4 relays with compress create an intelligence pipeline."

**3. Positioning as the Silent Skill.** In TFT, the difference between a Diamond and Challenger player is often positioning — moving a carry one hex to dodge an assassin jump, cornering to force single-target engagement. In Robot Uprising, root placement and unit positioning on the 8x8 grid serves the same function, but with the added dimension that positioning affects signal latency and EM coverage, not just combat targeting.

**4. Economy as Pacing Mechanism.** TFT's interest system forces a fundamental choice: spend now for immediate power or save for future power. Robot Uprising's production economy (factory queue, resource allocation) should create the same tension. The player who over-invests early gets crushed by the player who invested in information infrastructure.

**5. Scouting as Information Skill.** TFT players who scout opponent boards gain material advantage. Robot Uprising's Inspector debrief serves a similar function but post-hoc rather than real-time. The design space for pre-mission intelligence (scouting reports from 1.06f) maps directly to TFT's board-scouting meta.

**6. The Shared Pool Anti-Hoarding Mechanic.** In TFT, contest for shared champions creates emergent player interaction without direct combat. Robot Uprising's competitive mode could learn from this — shared resources or map features that create indirect competition before direct confrontation.

**7. Augments as Run-Defining Choices.** TFT augments create "this run's identity." Robot Uprising's doctrine system (3.17) and Gauntlet modifiers serve the same function — permanent choices that constrain and define strategy for the remainder of the session.

**The Core Inversion:** TFT gives you complete information about opponent state but overwhelming compositional complexity. Robot Uprising gives you manageable compositional complexity (12 skills, limited rules) but incomplete information about the battlefield. Both achieve "interesting decisions" through different scarcity: TFT through decision overload, Robot Uprising through information scarcity.
