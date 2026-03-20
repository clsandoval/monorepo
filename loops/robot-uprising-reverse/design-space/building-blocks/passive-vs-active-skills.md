# 3.01b — Passive vs. Active Skill Distinction: The Automatic-Manual Spectrum

## Overview

Some skills fire without the player (or the unit's rules) telling them to. Evade triggers automatically when a threat enters perception range. Engage fires automatically when an enemy is adjacent. These are **reflexes** — they happen because the situation demands it, not because a rule evaluated conditions and chose an action.

Other skills require explicit triggering. Compress fires when the relay's rules decide it's time. Reassign fires when the command unit's rules detect a condition worth overriding. These are **deliberate actions** — they consume a tick and require a decision.

The question: should this distinction between "reflexive" and "deliberate" skills be formalized in the UI? Should the player SEE that evade is automatic while compress is rule-triggered? What does formalizing this do to the mental model, the workbench layout, and the mastery progression?

---

## The Current Implicit State

In the locked design, the passive/active distinction is not formalized. All 12 skills appear in the same skill section of the workbench. The player discovers through play that some skills fire on their own and others need rules to trigger them. This discovery is part of the learning curve — and a source of confusion.

**The implicit classification:**

| Category | Skills | Trigger |
|----------|--------|---------|
| Reflexive (auto-fire) | patrol, evade, engage, extract | Fires every tick if conditions met (adjacency, perception, position) |
| Deliberate (rule-triggered) | compress, filter, amplify, hack, breach, reassign, reroute, prioritize | Fires only when a rule's condition evaluates true |

But this classification isn't clean. Patrol auto-fires (follow waypoints every tick) but can be interrupted by rules. Filter auto-fires (discard matching entries on arrival) but the filter criteria are rule-defined. Hack requires adjacency (reflexive trigger) AND a rule decision (deliberate). The boundary is fuzzy.

---

## Design Options

### Option A: "The Unmarked" — No Formalization

Keep the current state. All skills appear identically in the workbench. Players discover the passive/active distinction through experimentation. Some skills "just work" when toggled on; others do nothing until wired to rules.

**The discovery path:** Player toggles on compress for their relay. Hits EXECUTE. Watches the sealed watch. The relay... does nothing with compress. Player opens Inspector. "Why didn't compress fire?" Decision trace shows: "No rule matched for compress action." The player realizes: compress needs a rule to trigger it. They go back to the workbench, add a rule: "IF buffer_fill > 6 THEN compress." Execute again. Now compress fires. The moment the rule kicks in and the relay starts compressing — that's the aha moment.

**Strengths:** Maximum discovery satisfaction. The "why didn't it work?" moment teaches more than any label could. Consistent UI — no visual categories to learn. Every skill looks the same because, architecturally, every skill IS the same (a behavior that fires under conditions).

**Weaknesses:** The confusion window is real. A player who toggles on compress, hack, and reassign without rules gets three skills that appear broken. They might assume the game is buggy. The "why doesn't this work?" experience can be frustrating rather than educational if the player doesn't know to check Inspector. Mission 3-4 introduce deliberate skills — that's potentially 30-60 minutes of play before the player encounters the distinction.

### Option B: "The Two Columns" — Explicit Visual Separation

The workbench skill section is divided into two labeled zones: **REFLEXES** (left, pale blue background) and **ACTIONS** (right, warm amber background). Reflexive skills live on the left and show a ⚡ icon. Action skills live on the right and show a ⚙ icon. A thin dividing line separates them.

**The visual language:** Reflexes have a lightning bolt watermark behind them — they fire fast, automatically, like a reflex arc. Actions have a gear watermark — they need machinery (rules) to drive them. The workbench section header reads "REFLEXES | ACTIONS" with a vertical pipe separator.

When the player hovers over a reflex skill: "Fires automatically when conditions are met. No rule needed." When hovering over an action skill: "Requires a rule to trigger. Add a condition→action rule in the Rules section."

**Strengths:** Zero confusion. A player who has never played a strategy game can look at the two columns and understand that some things happen automatically and some need rules. The hover text provides immediate guidance. The color distinction (blue/amber) is visible at a glance even at small sizes. The mental model maps to real-world categories: reflexes (involuntary) vs. actions (deliberate).

**Weaknesses:** The classification is a lie. Patrol is "reflexive" but its waypoint path is player-defined. Evade is "reflexive" but can be overridden by rules. Filter is "active" but auto-fires on entry. The two-column model oversimplifies a spectrum into a binary. Players who internalize the binary may be confused when they discover that reflexes can be overridden and actions can be chained into automatic cascades. The UI creates a mental model that the game eventually contradicts.

### Option C: "The Spectrum Bar" — Automation Gradient

Each skill shows a small automation indicator — a horizontal bar that ranges from "fully automatic" (left, blue) to "fully manual" (right, amber). Skills are positioned on this bar based on how much rule involvement they need.

| Skill | Position | Meaning |
|-------|----------|---------|
| patrol | 90% auto | Follows waypoints automatically; rules can interrupt |
| evade | 85% auto | Fires on threat automatically; rules can override |
| engage | 80% auto | Fires on adjacency; rules control when to seek adjacency |
| filter | 70% auto | Auto-discards matching entries; criteria are rule-defined |
| extract | 65% auto | Auto-extracts when adjacent; rules control positioning |
| compress | 40% auto | Needs rule to trigger; but fires predictably once triggered |
| amplify | 35% auto | Needs rule; amplification target is rule-dependent |
| hack | 30% auto | Needs adjacency + rule; timing is critical |
| breach | 25% auto | Needs adjacency + rule + 2-tick commitment |
| reassign | 15% auto | Fully deliberate; target, timing, and content are rule-defined |
| reroute | 10% auto | Fully deliberate; network surgery |
| prioritize | 10% auto | Fully deliberate; buffer policy changes |

**The visual treatment:** A 60px wide gradient bar beneath each skill, filled from left (blue = auto) to right (amber = manual) to the skill's position. No numeric label — just the visual proportion. Hover reveals a tooltip: "This skill fires 40% automatically. You control the other 60% through rules."

**Strengths:** Honest representation of the spectrum. Players learn that automation isn't binary — every skill has some automatic and some manual components. This maps perfectly to real agentic engineering, where every component has default behaviors that can be overridden. The spectrum bar invites curiosity: "What does 40% automatic mean for compress?"

**Weaknesses:** The percentages are misleading. What does "40% automatic" mean mechanically? The spectrum is a conceptual metaphor, not a precise measurement. A player might think they can make compress "more automatic" by tuning something — but the percentage is fixed. The bar takes up 60px per skill, which is significant screen real estate for an ambient indicator. The concept may be too abstract for new players.

### Option D: "The Gear Indicator" — Rule-Dependency Badge (RECOMMENDED)

Each skill shows a small badge indicating its rule dependency:

- **⚡ AUTO** — Fires every tick if its spatial condition is met (adjacency, perception range, waypoint). No rules needed. Rules can OVERRIDE.
- **⚙ RULE** — Fires only when a matching rule triggers it. Toggle on just activates the CAPABILITY; the TRIGGER lives in Rules.
- **🔄 HYBRID** — Has automatic behavior AND rule-triggerable modes. (Filter: auto-discards on arrival by default, but rules can trigger manual discard of specific entries.)

**The visual treatment:** A tiny 16x16px badge in the top-right corner of the skill toggle, color-coded: ⚡ = teal, ⚙ = amber, 🔄 = half-teal/half-amber split. On hover, a one-sentence explanation: "AUTO: Evade fires automatically when enemies enter perception range." or "RULE: Compress fires when one of your rules triggers it. Add a rule in the Rules section below."

**The classification:**

| Badge | Skills |
|-------|--------|
| ⚡ AUTO | patrol, evade, engage, extract |
| ⚙ RULE | compress, amplify, hack, breach, reassign, reroute, prioritize |
| 🔄 HYBRID | filter |

**The teaching sequence:**
- M1-2: Player sees ⚡ AUTO on patrol and evade. They toggle them on and they work. Natural.
- M3: Compress introduced with ⚙ RULE badge. The badge is a gentle warning: "this one needs a rule." If the player toggles it on without a rule, the workbench shows a subtle amber dotted outline on the skill — "capability active, no trigger configured." This is not an error — it's a state indicator.
- M4-5: More ⚙ RULE skills unlock. The pattern is established.
- M7+: Filter's 🔄 HYBRID badge introduces the spectrum concept for players ready for nuance.

**Strengths:** Minimal screen real estate (16x16px per skill). Clear enough to prevent the "why doesn't compress work?" confusion. Simple enough to not overwhelm. The three-category model (auto/rule/hybrid) is close to honest without being a full spectrum. The "capability active, no trigger configured" state for untriggered ⚙ skills is a gentle nudge rather than an error.

**Weaknesses:** The hybrid category is a complexity escape hatch that could grow if more skills are added. The ⚡/⚙ distinction might make players think AUTO skills can't be rule-controlled (they can — rules override auto behavior). The badge is small enough that some players may never notice it.

---

## Player Journeys

### Journey: Kai, 11, Minecraft Veteran (Option D, Mission 3)

**Context:** Kai has completed Missions 1-2 using only scout patrol (⚡ AUTO) and evade (⚡ AUTO). He's comfortable with skills that "just work." Mission 3 introduces the relay with compress (⚙ RULE).

**Minute 0:00 — First Encounter with ⚙**
The boot log introduces the relay: "RELAY UNIT ONLINE. Available skills: COMPRESS, FILTER, AMPLIFY." The workbench shows three new skills. Kai notices the amber ⚙ badge on COMPRESS and the teal ⚡ badge on his scout's patrol. He doesn't know what ⚙ means yet. He toggles COMPRESS ON. The skill lights up — but a thin amber dotted border appears around it. No error message, no popup. Just a visual state: active capability, no trigger.

**Minute 0:20 — The Hover Moment**
Kai hovers over the amber dotted border. A tooltip appears: "Compress is ready, but no rule triggers it yet. Add a condition-action rule below." He looks at the Rules section. It's empty for the relay. He's not sure what to do, so he hits EXECUTE anyway.

**Minute 0:45 — The Sealed Watch Confusion**
During the sealed watch, the relay sits on the board. Scout observations flow in via hooks — the relay's buffer fills up. But compress never fires. The relay just... accumulates. Its buffer bar turns amber, then red. Context overload. The relay stuns for 1 tick — sparking, jittering. Kai frowns. "It didn't compress!"

**Minute 1:15 — Inspector Diagnosis**
Inspector opens. Kai clicks the relay. Decision trace: "Tick 8: No rule matched. Tick 9: No rule matched. Tick 10: Context overload — stunned." The trace is clear: compress was active (capability ready) but no rule told it WHEN to fire. Kai looks at the ⚙ badge again. Now he understands: ⚙ means "you need to tell it when."

**Minute 1:45 — The First Rule**
Back in the workbench. Kai opens the Rules section for the relay. He adds: "IF buffer_fill > 8 THEN compress." The rule strip lights up — amber condition pill, cyan action pill. The amber dotted border on COMPRESS dissolves, replaced by a solid border. State change: "capability active, trigger configured." Kai hits EXECUTE.

**Minute 2:30 — The Fix**
The relay now compresses when its buffer passes 8 entries. The buffer bar breathes — fills toward red, compress fires, slots merge, bar drops to green, fills again. Rhythmic. Healthy. Kai pumps his fist. The ⚙ badge makes sense now: it's a gear because YOU have to build the mechanism.

**UI Annotations:**
- **⚙ badge**: 16x16px amber gear icon, top-right corner of skill toggle. Subtle but visible against the dark workbench background.
- **Amber dotted border**: 2px dotted amber line around the skill panel when ⚙ skill is ON but no rule references it. Not an error — just a state. Tooltip on hover.
- **Solid border transition**: When a rule is added that targets the skill, the dotted border morphs to solid (300ms animation). A soft "click" sound — the gear engaging.
- **Rules section visual link**: When hovering a ⚙ skill, the Rules section below pulses with a soft amber glow — "look here."

---

### Journey: Amara, 34, Backend Engineer (Option D, Mission 7)

**Context:** Amara understands the ⚡/⚙ distinction well. She's building a Command unit for Mission 7 — her first command agent. All three command skills (reassign, reroute, prioritize) show ⚙ RULE badges. She's also encountering filter's 🔄 HYBRID badge for the first time on a relay she's optimizing.

**Minute 0:00 — The Hybrid Discovery**
Amara opens Relay-B's skill section. Filter shows a half-teal/half-amber badge: 🔄 HYBRID. She hovers. Tooltip: "Filter has automatic behavior (discards entries matching your criteria on arrival) AND can be manually triggered by rules (discard specific entries on command)." She thinks: "So it's like middleware with both passive rejection and active purging." She appreciates that the game named the middle ground instead of forcing a binary.

**Minute 0:30 — Designing the Hybrid**
She configures filter's auto-discard criteria: type = "noise" (a channel she's labeled as enemy spam). This handles 80% of filtering passively. Then she adds a rule: "IF buffer_fill > 10 AND contains type:stale THEN filter(type: stale)." The rule handles active purging of aged-out entries that the auto-filter didn't catch. The 🔄 badge now shows both a blue and amber segment — both behaviors are configured. She's built a two-tier filter: passive rejection + active cleanup.

**Minute 1:30 — Command Skill Chaining**
The Command unit's three skills are all ⚙ RULE. She writes three rules, each targeting a different command skill:
1. "IF intelligence contains flanking_pattern THEN reroute(scouts → flank_channel)"
2. "IF unit_count(striker) < 2 THEN reassign(specialist → extract)"
3. "IF buffer_fill(command) > 12 THEN prioritize(preserve: intelligence, evict: stale)"

All three amber dotted borders dissolve to solid. The Command unit's skill section transforms from "three dormant capabilities" to "three loaded triggers." The visual state change — three simultaneous amber-to-solid transitions — feels like loading a weapon. She hits EXECUTE.

**Minute 3:00 — The Cascade in Sealed Watch**
During the sealed watch, she sees the Command unit's skills fire in sequence. Tick 31: reroute fires (channel wires physically move on the board). Tick 32: reassign fires (specialist changes role, skill icon shifts). Tick 33: prioritize fires (buffer bar on a subordinate subtly reorders). Three yellow arrows pulse from the Command unit in three ticks — a command cascade. She whispers: "That's a PagerDuty runbook executing itself."

**UI Annotations:**
- **🔄 HYBRID badge**: 16x16px, split diagonally — teal top-left, amber bottom-right. Distinctive enough to notice as "different from both ⚡ and ⚙."
- **Hybrid configuration state**: Badge fill reflects what's configured. Only auto-criteria set → mostly teal. Only rules set → mostly amber. Both → balanced split. Live visual feedback on configuration completeness.
- **Multi-skill solid-border cascade**: When rules are added to multiple ⚙ skills simultaneously, the dotted→solid transitions stagger by 100ms per skill (left to right), creating a "loading" sequence rather than a single flash. Subtle but satisfying for players configuring multiple skills at once.

---

### Journey: Tomás, 16, First Strategy Game (Option A — No Formalization, for comparison)

**Context:** Same scenario as Kai above, but with Option A — no badges, no visual distinction between auto and rule-triggered skills. Tomás is at Mission 3, encountering compress for the first time.

**Minute 0:00 — Toggle and Go**
The boot log introduces the relay. Tomás sees three new skills: COMPRESS, FILTER, AMPLIFY. They look exactly like PATROL and EVADE did — same toggle switches, same styling. He toggles all three ON. No amber dotted border. No badge. No visual indication that anything is different.

**Minute 0:30 — The Confused Sealed Watch**
The relay sits on the board. Scout observations arrive via hooks. The buffer fills. Nothing happens. The relay overloads and stuns. Tomás is confused: "I turned on compress! Why didn't it work?" He checks if the toggle is still on. It is. He re-executes. Same result.

**Minute 1:30 — The Guessing Phase**
Tomás thinks: "Maybe compress needs more data?" He adds another scout. Re-executes. Same result — more data arrives, but compress still doesn't fire. He thinks: "Maybe the relay is broken?" He makes a new relay blueprint. Same result. He's now 3 minutes into debugging with no progress and no direction.

**Minute 3:00 — The Inspector Lifeline**
He opens Inspector (if he remembers it exists). Clicks the relay. "No rule matched." He reads this but doesn't immediately connect "no rule matched" with "compress needs a rule." After another minute, he notices the Rules section is empty and wonders: "Do I need a rule FOR compress?" He tries adding one. It works.

**Total confusion time:** 4+ minutes (vs. Kai's 1.5 minutes with Option D).

**The key difference:** Without the ⚙ badge and the amber dotted border, Tomás had no directional signal for his debugging. He cycled through wrong hypotheses (more data, new blueprint, broken game) before stumbling on the right one. The badge would have collapsed 4 minutes of confusion into 30 seconds of "oh, this one needs a rule."

**UI Annotations:**
- **Option A has no distinguishing annotations.** All skills look identical. The only hint is in the Inspector's "no rule matched" message, which requires the player to (a) open Inspector, (b) click the right unit, (c) read the decision trace, and (d) connect "no rule" to "needs a rule." Each step is a potential dropout point.

---

## Interaction Effects with Locked Decisions

**With the boot log narrative:** The passive/active distinction maps perfectly to the diegetic narrative. Auto skills are "instincts" — hardwired behaviors the AI doesn't need to think about. Rule skills are "deliberate actions" — capabilities that require conscious decision-making. The boot log can frame this: "PERCEPTION SUBSYSTEM: instinctive responses online. PROCESSING SUBSYSTEM: deliberate capabilities loaded — awaiting behavioral programming."

**With the Inspector:** Auto skills show "triggered by: spatial condition (adjacency)" in the decision trace. Rule skills show "triggered by: Rule 3 (IF buffer_fill > 8)." The trigger source is always visible, reinforcing the auto/rule distinction even if the player never noticed the badge.

**With context overload:** Rule-triggered skills that don't fire (because no rule is configured) are the #1 cause of preventable context overload. A relay with compress ON but no compression rule will inevitably overload. The ⚙ badge and amber dotted border are, in practice, an overload prevention system.

**With the command agent:** All three command skills are ⚙ RULE. This means the command agent is entirely inert without rules — it's a pure logic unit. The ⚙⚙⚙ triple badge on the command's skill section visually communicates: "This unit does NOTHING unless you program it." This is the correct mental model for the meta-level agent.

**With the mission arc:** Missions 1-2 use only ⚡ AUTO skills. Mission 3-4 introduce ⚙ RULE skills. Mission 7 introduces 🔄 HYBRID. This progression matches the locked mission arc's teaching goals.

---

## Comparable Games

**Factorio inserter behavior:** Inserters are "passive" in that they always try to move items from input to output. But their behavior is modified by filters, circuit network conditions, and stack size settings. Factorio never labels this — players learn through experimentation. The result: years of forum posts titled "why isn't my inserter working?" Robot Uprising can learn from this: a small label prevents thousands of confusion cycles.

**Into the Breach passive abilities:** Into the Breach distinguishes between "weapon" (active, player-chosen) and "passive" (automatic, always-on). The UI clearly separates them — weapons have activation squares, passives have a permanent glow. This simple distinction eliminates an entire category of confusion. It's Option B executed at its cleanest.

**Slay the Spire power cards:** Powers play once and persist — they're "passive" effects that trigger automatically each turn. They're visually distinct from attacks and skills (green border, different card back). The visual distinction helps players immediately categorize new cards without reading the text. This is the badge approach (Option D) executed through visual design rather than explicit labels.

**Gladiabots behavior tree actions:** Gladiabots makes no distinction between actions that are always available (move, shoot) and actions that depend on conditions. All are behavior tree leaves. The tree structure itself determines when actions fire. This is Option A — and it works because the behavior tree is inherently a conditional structure. In Robot Uprising, where skills and rules are separate subsystems, the absence of a distinction is more confusing.

**Screeps creep methods:** Screeps has methods that always succeed (moveTo, say) and methods that can fail based on state (harvest, transfer, build). The return codes tell the programmer whether the action fired. Robot Uprising's Inspector serves a similar role — the decision trace is the return code. But the Inspector is post-hoc; the badge is pre-hoc.

---

## Sensory Description

**⚡ AUTO badge:** Teal lightning bolt on a dark chip background. The bolt has a subtle 2-second pulse animation — brighter-dimmer-brighter — like a heartbeat. Communicates "alive, always running." When the skill fires during sealed watch, the badge flashes white for 100ms.

**⚙ RULE badge:** Amber gear icon on a dark chip background. The gear rotates slowly (one revolution per 4 seconds) when a rule is configured. When no rule is configured, the gear is static — visually "stopped." The rotation communicates: "mechanism engaged" vs. "mechanism waiting."

**🔄 HYBRID badge:** Split icon — teal lightning bolt on the left, amber gear on the right, divided by a diagonal line. Both sides animate independently: the bolt pulses when auto-behavior fires, the gear rotates when rule-behavior fires. During a busy battle where both behaviors fire, the badge becomes visually active — both halves animated simultaneously.

**The amber dotted border:** 2px dotted line in the same amber as the ⚙ badge. The dots have a slow clockwise rotation animation (one revolution per 8 seconds) — like a loading indicator. The message: "waiting for configuration." When a rule is added, the dots solidify into a continuous line with a 300ms animation — each dot stretches and merges into its neighbor. A soft mechanical "click" sound plays. The transformation from dotted to solid is one of the game's most satisfying micro-interactions.

**The rules-section glow:** When hovering a ⚙ skill, the Rules section below receives a soft amber wash (15% opacity overlay, 200ms fade-in). The wash disappears when the hover ends. This directional hint says "look down here" without text. If the Rules section is collapsed, the collapse handle pulses amber briefly — "expand me."
