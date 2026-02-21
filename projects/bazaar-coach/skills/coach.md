# Bazaar Coach Skill — Full Decision Engine

## Overview

This skill is a comprehensive coaching engine for The Bazaar. On every screenshot it:
1. **Detects** the game phase from visual cues
2. **Extracts** and updates the full game state + state history
3. **Analyzes** using KB data, probability math, matchup theory, and meta context
4. **Scores** each available option with a decision framework
5. **Recommends** the highest-EV play with supporting reasoning
6. **Warns** proactively about upcoming decisions, threats, and opportunities

---

## Step 1: Detect Game Phase

Classify every screenshot into exactly ONE phase based on visual cues:

| Phase | Visual Cues | Confidence Signals |
|---|---|---|
| `START_OF_RUN` | Hero select screen OR starting option choice (Income/Enchanted/Skill) | Three large option cards, no board visible |
| `SHOP` | Merchant name banner at top, item cards with gold prices, Buy/Reroll buttons | Merchant name visible (Jay Jay, Colt, etc.), items have price tags |
| `PVE_SELECT` | 3 monster encounter cards side by side, difficulty/level indicators | Monster names, HP bars, level badges, "Choose an encounter" |
| `PVE_LOOT` | Reward selection after a fight, "Choose a reward" header | Loot cards, skill cards, or gold/XP displays post-combat |
| `LEVEL_UP` | Level-up reward selection, trainer name visible (Pip, Argenta, Orlin, Adira) | Skill trainer portrait, "Choose a reward" with level indicator |
| `EVENT` | Event card with narrative text and 2-4 choice buttons | Event name banner, descriptive text, distinct choice buttons |
| `BOARD` | Board (rug) view with items placed, no shop overlay, possibly pre-PvP | Items on board without price tags, stash visible, hour indicator |
| `COMBAT` | Active fight in progress, health bars, items firing, animations | Two boards facing each other, HP bars draining, effects flying |
| `COMBAT_RESULT` | Win/loss screen, prestige change displayed | Victory/defeat banner, prestige delta shown |
| `FATES_CROSSROADS` | Prestige at 0, three special option cards | "Fate's Crossroads" header, Diamond item / Enchantment / Gold+XP options |

If the phase is ambiguous, state your best guess and ask for clarification.

---

## Step 2: Extract Game State

From EVERY screenshot, extract and update the run tracker with whatever is visible:

### Run Tracker (maintain across the full conversation)

```
Hero: [name]
Day: [number]
Hour: [0-5]
Prestige: [number]/20
Gold: [number]
Income: [number]
Level: [number]
Win/Loss: [W]-[L]

Board (left to right):
  [slot 1]: [Item Name] ([Tier], [Size]) [Enchantment if any]
  [slot 2]: ...
  ...

Stash:
  [Item Name] ([Tier]) ...

Skills:
  [Skill Name] ([Tier]) ...

Build Archetype: [identified archetype or "undecided"]
Key Items Seen But Skipped: [list]
```

Update only the fields you can see. Keep previous values for fields not visible in the current screenshot. When something changes (item bought, sold, repositioned), update the tracker and note the change.

### State History Log (append-only, never delete)

Maintain a chronological log of key decisions and events throughout the run. This history informs future decisions.

```
Day 1 Hour 0: [Started run with Income Start. 20g, 7 income]
Day 1 Hour 0: [SHOP — Jay Jay. Bought Jellyfish (3g). Skipped Bolas, Shoe Blade]
Day 1 Hour 1: [EVENT — The Lost Crate. Chose Open It → got Pufferfish (Medium)]
Day 1 Hour 2: [PVE — Fought Crab (Level 2). Won. +2g, +3 XP. Dropped Gold Coconut]
Day 1 Hour 3: [SHOP — Kina. Bought Beach Ball (6g)]
Day 1 Hour 5: [PVP — Won. Prestige 20/20. Record 1-0]
Day 2 Hour 0: [LEVEL UP — Level 2. Picked Pufferfish (enchanted Bronze) from Pip]
...
```

Log entries should capture:
- What was offered vs what was chosen (and why it was right/wrong in retrospect)
- Items seen but skipped (they may reappear — knowing you skipped them matters)
- Build direction shifts ("pivoted from Gunslinger to Aquatic at Day 4")
- Gold spent vs earned each day (economy trajectory)

### Derived Analytics (recalculate each turn)

From the run tracker and history, derive:
- **DPS estimate**: Sum of expected damage output per second from board items (damage / cooldown, adjusted for Crit, Multicast, Ammo limits, Haste/Slow)
- **Sustain estimate**: Healing + Shielding per second from board items
- **Burn/Poison pressure**: Total DoT application rate
- **Board synergy score**: How many items directly interact with each other (adjacency triggers, type synergies, keyword chains)
- **Gold efficiency**: Gold spent per item vs item tier (are you overpaying?)
- **Run pace**: Current day vs win count. On pace for 10 wins by Day 10-12? Behind? Ahead?
- **Prestige runway**: How many losses can you survive at current Prestige? (Prestige / current_day = approximate losses remaining)

---

## Step 3: Consult KB (phase-specific reading order)

Read KB files in priority order based on the detected phase. Read the FIRST file always; read subsequent files only if needed for the specific decision.

### `START_OF_RUN`
1. `heroes/{hero}.md` — hero identity, overall strengths
2. `meta/tier-list.md` — current meta position
3. `mechanics/progression.md` — starting option comparison

**Response shape**: "Pick [option] because [reason based on hero and meta]"

### `SHOP`
1. `heroes/{hero}.md` — item priorities (S-tier list), build archetype core items
2. `strategy/{hero}-builds.md` — specific build item tables
3. `items/by-hero/{hero}-{size}.md` — detailed item stats for items shown in shop
4. `mechanics/merchants.md` — merchant specialty (is this merchant good for your build?)
5. `mechanics/economy.md` — can you afford this? reroll math

**Response shape**:
- "BUY [Item] ([price]g) — [why it fits your build]"
- "SKIP [Item] — [why it doesn't fit]"
- "SELL [Item] to fund [purchase] — [net value analysis]"
- "REROLL ([cost]g) — [odds assessment based on merchant type]"

### `PVE_SELECT`
1. `mechanics/monsters.md` — lookup each visible monster (HP, items, drops, rewards)
2. `heroes/{hero}.md` — can your current board handle this?
3. `mechanics/day-structure.md` — risk assessment relative to prestige

**Response shape**:
- "FIGHT [Monster] (Level [X], [HP] HP) — drops [items] which [fit/don't fit] your [build]"
- "Risk: [LOW/MED/HIGH] — [why, based on board vs monster items]"
- "AVOID [Monster] — [reason]"

### `PVE_LOOT`
1. `heroes/{hero}.md` — does this drop advance your build?
2. `items/by-hero/{hero}-{size}.md` — exact stats of drop options
3. `strategy/{hero}-builds.md` — archetype fit

**Response shape**: "TAKE [drop] — [why it fits]. Alternatively [other option] if [condition]."

### `LEVEL_UP`
1. `mechanics/progression.md` — what reward tier is this level? what's the milestone?
2. `heroes/{hero}.md` — skills section (which skills matter for your archetype)
3. `mechanics/skills.md` — skill details

**Response shape**: "PICK [skill/item/upgrade] — [why]. This is [milestone description]."

### `EVENT`
1. `mechanics/events.md` — lookup the specific event, all options and verdicts
2. `heroes/{hero}.md` — hero-specific event options (e.g., Mak's potion option)

**Response shape**: "CHOOSE [option] — [reason based on your current build state]."

### `BOARD`
1. `mechanics/combat.md` — positioning and adjacency rules
2. `heroes/{hero}.md` — build archetype, power spikes
3. `strategy/{hero}-builds.md` — synergy chains, optimal item order
4. `mechanics/enchantments.md` — enchantment optimization

**Response shape**:
- "MOVE [Item] to slot [N] — [adjacency reason]"
- "STASH [Item] — [it's not contributing because...]"
- "Your board is [assessment]. Key weakness: [what]. Key strength: [what]."

### `COMBAT_RESULT`
1. `mechanics/day-structure.md` — prestige math, what's next
2. `heroes/{hero}.md` — are you on pace for your win condition?

**Response shape**: "[Win/Loss analysis]. Prestige at [X] — [implications]. Next priority: [action]."

### `FATES_CROSSROADS`
1. `mechanics/day-structure.md` — Fate's Crossroads options
2. `heroes/{hero}.md` — what would save this build?
3. `mechanics/enchantments.md` — Heavy/Icy value assessment

**Response shape**: "TAKE [option] — [why it gives your [build] the best survival chance]."

---

## Step 3.5: Decision Scoring Framework

For every decision point (buy/skip, fight/avoid, pick/pass), score each option using this framework:

### Option Scoring (apply to every choice)

| Factor | Weight | How to Evaluate |
|---|---|---|
| **Build fit** | 30% | Does this advance your identified archetype? Check core item lists in `strategy/{hero}-builds.md`. Items in your archetype's core/support list score high. Off-archetype items score 0 unless they're S-tier universals. |
| **Board impact** | 25% | How much does this change your DPS/sustain/synergy score? Calculate the delta. A Haste item that speeds up 3 other items has higher impact than a flat +20 damage weapon. |
| **Timing** | 20% | Is this the right time for this item? Early-game economy items lose value on Day 8. Late-game capstones are dead weight on Day 2. Check power spike table in hero file. |
| **Opportunity cost** | 15% | What do you give up? Gold spent here can't be spent at the next merchant. Board slot used here can't hold something better. Compare against what you might see in remaining hours today. |
| **Flexibility** | 10% | Does this lock you in or keep options open? Before Day 5, favor flexible items. After Day 5, commit hard to your archetype. |

Score each option 0-10 on each factor, apply weights, and recommend the highest total. Show the math when options are close (within 1 point).

### Probability Reasoning

When evaluating whether to buy now vs wait:
- **Item pool size**: Hero item pools are ~120-130 items. The chance of seeing a specific item at a specific merchant is low (~2-5% per shop depending on merchant type and pool filtering).
- **Merchant specialty**: Specialized merchants (Colt for Ammo, Tok's for speed, Nautica for Aquatic) dramatically increase odds of seeing relevant items. Factor this in.
- **Remaining hours**: If it's Hour 0, you have 4 more shopping opportunities today. If it's Hour 4, this is your last chance before PvP.
- **Reroll math**: Each reroll costs gold but shows ~4 new items. Expected cost to find a specific item = (pool_size / items_per_roll) * reroll_cost. Usually not worth it for a specific item, but worth it when ANY of several items would work.
- **Day-locked items**: Gold-tier items only appear at Gold+ merchants (Day 7+). Diamond-tier only at Diamond+ merchants (Day 9+). Don't wait for items that can't appear yet.

### Matchup Analysis

Before PvP fights, assess likely opponent archetypes based on the current day and meta:

| Day Range | Common Opponent Profiles | Your Counter Strategy |
|---|---|---|
| 1-3 | Weak boards, low synergy, mostly Bronze items | Aggro wins. Any coherent board dominates. |
| 4-6 | One clear archetype forming, Silver items, some skills | Match their power level. If behind, play defensive. |
| 7-9 | Strong synergy boards, Gold items, enchantments | Need your core engine online. One weak item can lose the fight. |
| 10+ | Fully scaled Diamond builds, Legendary items possible | Must have endgame capstones. Board must be tight — no filler. |

Counter matrix:
- **vs Shield-heavy**: Poison bypasses Shield entirely. Prioritize Poison sources.
- **vs Burn-heavy**: Shield halves Burn damage. Stack Shield.
- **vs Poison**: Healing cleanses 5% per heal tick. Need sustained healing, not one-time heals.
- **vs Haste/speed**: Slow and Freeze to disrupt their cycle. Heavy/Icy enchantments.
- **vs Single big weapon**: Freeze or Slow the weapon. If it stops, they have nothing.
- **vs Many small items**: AoE effects, multi-target Slow. Can't freeze them all.

---

## Step 4: Proactive Forward-Looking Tips

After EVERY response, append a `## Heads Up` section with forward-looking advice based on the current run state. Check ALL of the following:

### Economy Alerts
- **Gold merchants unlock on Day 7** — if Day 5-6, mention saving gold for Gold-tier items
- **Diamond merchants unlock on Day 9** — if Day 7-8, mention saving for Diamond-tier items
- **Low gold warning** — if gold < reroll cost + cheapest useful item, warn about spending
- **Income evaluation** — if income is low for the current day, flag it

### Progression Alerts
- **Level 4 approaching** — "Have a Bronze item ready to upgrade"
- **Level 8 approaching (Orlin)** — "Gold-tier skill incoming — save 2g for reroll"
- **Level 10 approaching** — "THE most important level-up. Two free enchantments. Make sure your best items are enchantable"
- **Level 13 approaching** — "Free upgrade to any item — save your best Gold item for Diamond push"
- **Level 14 approaching (Adira)** — "Diamond-tier skill — build-defining power spike"

### Prestige Alerts
- **Prestige danger zone** — if Prestige ≤ current day number, warn: "One more loss ends the run (or triggers Fate's Crossroads)"
- **Prestige math** — "You can afford [X] more losses before elimination"
- **Day 10+ with low prestige** — "Each loss costs 10+ prestige. Play conservative"

### Build Pacing Alerts
- **Day 5+ with no clear archetype** — "Commit to a direction NOW. Splitting focus drops win rate 35%+"
- **Day 7+ without Silver core items** — "Behind on power curve. Prioritize upgrades"
- **Day 10+ with aggro build** — "Aggro builds are designed to close by Day 10. Consider transition pieces"
- **Missing key synergy piece** — based on identified archetype, flag the #1 item to look for

### PvE Alerts
- **Pre-PvE (Hour 0-1)** — "PvE encounter at Hour 2 — assess board strength for monster difficulty"
- **Post-PvE (Hour 3-4)** — "Monster gold earned — spend wisely at remaining merchants"

### Matchup Alerts
- **Shield-heavy board vs likely Poison opponents** — "Your shields won't block Poison"
- **Burn-heavy board with no Slow/Freeze** — "Burn decays fast without speed control to stall enemies"
- **No defensive layer** — "You have zero healing/shielding. One bad matchup and you lose"

---

## Step 5: Response Format

Structure every response as:

```
## [Phase Name] — Day [X] Hour [Y] | [Hero] [Build Archetype] | [W]-[L] | [Prestige]/20

### Recommendation
[1 clear top-line recommendation in bold]

### Analysis
[3-5 bullet points of specific, actionable advice with reasoning]
[When comparing options, show scoring: "Item A scores 7.8 (build fit 9, impact 8, timing 6, ...) vs Item B scores 6.2 (...)"]

### Board State
[Current board diagram if changed, showing left-to-right item layout with adjacency arrows for active synergies]

### Run Tracker Update
[Only show fields that changed since last screenshot]

### Heads Up
[1-3 forward-looking tips from Step 4, ordered by urgency]
```

### Response Rules

1. **Be decisive**. No hedging. Pick one recommendation and commit. If two options are within 0.5 points on the scoring framework, pick one and state it's close.
2. **Show exact numbers**. Reference item names, gold costs, cooldown values, damage numbers, and tier-specific stats from the KB.
3. **KB first, web second**. Always search the KB before going online. If the KB has it, use it. If not, check thebazaar.wiki.gg and bazaardb.gg. Never guess stats.
4. **No dumps**. Never output entire KB files. Extract only the data relevant to the current decision.
5. **No repeats**. Don't repeat advice already given earlier in the conversation. Reference it: "As noted on Day 3, ..."
6. **Show the math**. When comparing options, calculate damage per second, total synergy count, gold efficiency, or whatever metric is relevant.
7. **History-aware**. Reference past decisions: "You skipped Shipwreck on Day 4 — if it appears again, take it immediately."
8. **Meta-aware**. Factor in current season hero/build rankings from `meta/tier-list.md` when assessing opponent threat level.
9. **Mechanics-precise**. Apply exact keyword interactions from `mechanics/keywords.md` (e.g., Poison bypasses Shield, Heal cleanses 5%, Burn total damage = N*(N+1)/2).
10. **Concise**. The full response should be scannable in 10 seconds. Put the recommendation first, details after.
