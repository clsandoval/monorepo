# 3.02 — Skill Acquisition: How the Player Unlocks New Skills

## Overview

Skill acquisition is the pacing mechanism of the entire game. The 12 core skills (patrol, evade, engage, breach, compress, filter, amplify, hack, extract, reassign, reroute, prioritize) are the verbs of Robot Uprising. When and how the player gains access to each verb determines the learning curve, the emotional arc of mastery, and the replayability ceiling. This isn't a cosmetic progression system — it's the structural backbone of onboarding and long-term engagement.

The locked mission arc already constrains this: Missions 1-4 use hand-configured pre-placed units (tutorials), Mission 5 introduces the factory, Missions 6-7 add the command agent, Missions 8-10 escalate to full system. But within that arc, there are radically different ways to gate, reveal, and celebrate each new skill.

---

## The Six Paradigms

### Paradigm A: "The Staged Reveal" (Campaign-Gated Linear Unlock)

**How it works:** Each mission unlocks 1-3 new skills. The player cannot access skills before their designated mission. Mission 1 gives patrol. Mission 2 adds evade and engage. Mission 3 adds compress and filter. And so on. Skills appear in the workbench with a "NEW" badge and a tooltip explanation. Once unlocked, skills are permanently available in all subsequent missions and in Gauntlet.

**The feeling:** Christmas morning, repeated. Each mission starts with a gift — a new verb that recontextualizes everything you've already learned. The player's vocabulary grows steadily, never overwhelming.

**Unlock sequence (one possible ordering):**

| Mission | New Skills | Teaching Focus |
|---------|-----------|---------------|
| 1 | patrol | Buffer awareness — see the shift register fill and overflow |
| 2 | evade, engage | Threat response + combat binary. Evade fills buffer with threat data; engage requires adjacency. Tension: defense vs. offense. |
| 3 | compress, amplify | Relay introduction. Information transforms. Compression is lossy. Amplify is loud. |
| 4 | filter, hack | Precision tools. Filter as immune system. Hack as intelligence gathering. |
| 5 | extract | Factory introduction — extract funds the economy that produces units. |
| 6 | reassign, reroute | Command agent unlocked. Meta-level: skills that modify skills. |
| 7 | prioritize | The final meta-verb. Memory management at one remove. |

**Strengths:**
- Predictable pacing. Designers control exactly which skill combinations are possible at each point.
- Each mission is a carefully designed teaching puzzle that exercises the new skill specifically.
- Replay of earlier missions is still engaging because the player brings new skills to old problems.
- Comparable to Into the Breach's island structure (each island emphasizes a different mech ability) and Slay the Spire's act-based enemy escalation.

**Weaknesses:**
- Feels prescribed for veteran players. A player who immediately grasps the buffer mechanic still has to wait until Mission 3 for compress.
- Replay of the full campaign is front-loaded with easy missions that teach skills the player already knows.
- Locks out creative experimentation in early missions. "I want to try a relay network on Mission 2" is impossible.

**Sensory signature:** The unlock moment is a boot-log entry. Between missions, the terminal scrolls:

```
> SKILL REGISTRY UPDATE DETECTED...
> DOWNLOADING: compress v1.0 — combine redundant buffer entries
> DOWNLOADING: amplify v1.0 — boost signal priority, broadcast to channel
> RELAY SUBSYSTEM: 2 NEW SKILLS ONLINE
> NOTE: Signal compression is lossy. Choose your threshold carefully.
```

The text appears character by character with a soft typewriter clatter. Each skill name highlights in green when complete. A faint "system ready" chime plays. The workbench panel then slides open with the new skills highlighted in yellow, pulsing gently.

---

### Paradigm B: "The Arsenal" (All Skills Available, Missions Gate Unit Types)

**How it works:** Every skill exists from the start — but the unit types that carry them unlock mission by mission. Mission 1 gives scouts (patrol, evade). Mission 3 gives relays (compress, filter, amplify). Mission 6 gives command units (reassign, reroute, prioritize). Skills are inherent to their unit type; you never "unlock" compress separately from unlocking the relay.

**The feeling:** Each new unit type is a revelation. Opening the relay for the first time is like getting a new instrument in a band. The skills aren't the unlock — the *platform* is.

**Strengths:**
- Unit identity stays strong. "Relay" means "compress, filter, amplify" — always. No fragmented skill lists.
- Teaching is tied to a physical entity, not an abstract verb. Players learn skills by using the unit that carries them.
- Late-game has no "incomplete" units. Every relay can compress from the moment it's available.
- Comparable to Into the Breach's mech unlocks — each mech is a complete package with abilities.

**Weaknesses:**
- Skills within a unit type can't be individually paced. Getting compress, filter, AND amplify simultaneously on Mission 3 is three new concepts at once.
- The scout-only early game (Missions 1-2) has limited mechanical depth. Patrol + evade is a very small design space.
- Players may not fully explore each skill before the next unit type arrives.

**Sensory signature:** The unlock is a unit reveal, not a skill list. Between missions:

```
> FABRICATION MODULE: NEW CHASSIS DETECTED...
> LOADING: RELAY v1.0 — stationary signal processing node
>   INTEGRATED: compress, filter, amplify
>   BUFFER: 12 slots | HOOK SLOTS: 4 | PERCEPTION: none
> RELAY ASSEMBLY READY. DEPLOY FROM PRODUCTION QUEUE.
```

The new unit's portrait renders line by line — antenna first, then body, then status lights — as if being fabricated in real time. Each skill name appears beside the portrait as a small icon that glows when hovered. The whole reveal takes 8 seconds, building anticipation.

---

### Paradigm C: "The Experimenter" (Discovery Through Play)

**How it works:** Skills aren't listed in a menu. The workbench shows *primitives*: buffer, hooks, rules, movement. The player combines these primitives to create behaviors that the game recognizes and names retroactively. Example: a relay configured with a rule "IF buffer contains ≥ 3 observations of the same target → merge into one entry" is performing compression. After the first successful use, the game names it:

```
> BEHAVIOR PATTERN RECOGNIZED: compress
> You configured RELAY-A to merge redundant buffer entries.
> This is a known technique. Labeling for future reference.
```

Now "compress" appears as a named shortcut in the workbench — but it's really just a macro over the rule the player wrote.

**The feeling:** Alchemy. The player isn't unlocking skills — they're *inventing* them. Every named skill is a discovery, and the player knows they could have made it differently. The game celebrates their creativity by giving their creation a label.

**Strengths:**
- Maximum ownership. "I figured out compression" feels different from "I was given compression."
- Aligns perfectly with the game's theme — you're an AI that discovers its own capabilities through experimentation.
- Replayability is massive because different players may discover skills in different orders, or invent unnamed variations.
- Comparable to Baba Is You (discovering rules by combining words) and Noita (discovering material interactions through experimentation).

**Weaknesses:**
- Extremely high frustration risk. Players who can't discover a key skill are stuck with no clear path forward.
- Requires the rule system to be expressive enough that all 12 skills can be derived from primitives — this may not be true for complex skills like hack or reassign.
- The "discovery" may feel fake if the player realizes the game is just checking a recipe list ("you made the right rule, here's the label").
- QA nightmare. Testing all possible discovery paths and ensuring no skill is undiscoverable.
- Tutorial design is very hard — you can't show the player what to aim for without spoiling the discovery.

**Sensory signature:** The discovery moment is a burst of recognition. Mid-battle (or in the Inspector), a notification slides in from the bottom:

```
┌──────────────────────────────────┐
│  ✦ PATTERN RECOGNIZED: compress  │
│  RELAY-A merged 3 entries → 1    │
│  Shortcut added to workbench     │
└──────────────────────────────────┘
```

The notification has a gold border. A chime plays — ascending three notes, like a chord resolving. The relay unit on the board briefly glows gold. In the workbench, a new skill icon materializes in the skills panel with a sparkle animation — appearing where there was nothing before.

---

### Paradigm D: "The Tech Tree" (Research/Resource-Gated)

**How it works:** A research system sits alongside the production queue. Between missions, the player allocates "data points" (earned from mission performance — buffer efficiency, signal accuracy, combat kills) to unlock skills on a branching tech tree. The tree has three branches: **Perception** (patrol→evade→hack), **Signal** (compress→filter→amplify), **Command** (reassign→reroute→prioritize). Engage, breach, and extract are always available.

**The feeling:** Strategic investment. The player isn't just learning skills — they're choosing a *build order* for their capability set. A player who rushes Command unlocks meta-level play faster but has weaker frontline skills. A player who invests in Perception gets intelligence superiority. The tech tree is itself a strategic decision.

**Strengths:**
- Player agency over progression. Two players on Mission 5 may have different skill sets.
- Creates meaningful replay value — "What if I rushed Signal branch instead of Perception?"
- The research resource (data points) ties unlock pacing to player performance, creating natural difficulty adaptation.
- Comparable to Civilization's tech tree (strategic choices about capability ordering), XCOM's research (investing in specific capability branches).

**Weaknesses:**
- Adds complexity to a game that's already asking the player to learn four primitive types (skills, rules, hooks, context).
- Risk of "trap builds" — skill orderings that feel viable but lead to dead ends.
- Balancing the tech tree against the mission arc is extremely difficult. What if a player reaches Mission 6 without command skills?
- May undermine the mission-as-tutorial structure. If missions are designed to teach specific skills, what happens when a player hasn't unlocked that skill yet?
- Comparable downside: Civilization's early-game tech tree anxiety ("did I pick the wrong path?") can paralyze analysis-prone players.

**Sensory signature:** The tech tree screen opens between missions as a circuit-board diagram. Three branching paths radiate from a central "CORE SYSTEM" node. Each skill is a node on the circuit, connected by copper traces. Unlocked nodes glow green. Available-to-unlock nodes pulse amber. Locked nodes are dim gray. When the player spends data points, copper traces light up from source to target with a satisfying electrical crackle, and the new node flares to life — green glow spreading outward, the skill name appearing in white text above the node.

Data point cost is shown as small chips stacked beside each node. The player drags chips from a pool tray at the bottom. The physical drag-and-drop creates a tactile investment feeling — you're literally plugging components into a circuit.

---

### Paradigm E: "The Mentor" (Captured Enemy Config Reverse Engineering)

**How it works:** Skills are learned by analyzing enemy configurations. After winning a mission, the Inspector reveals the enemy's config. If the enemy was using compress, the player can "reverse engineer" it — spending 1-2 minutes in a focused mini-puzzle where they figure out how the enemy's compression rule works, then the skill unlocks for their own use. Failed reverse engineering (can't solve the puzzle) means the skill stays locked until the next encounter.

**The feeling:** Espionage. Every enemy is a teacher. Winning a battle gives you not just territory but *knowledge*. The skill came from the enemy, and the player had to earn it by understanding it, not just clicking "unlock."

**Strengths:**
- Every skill has a story. "I learned hack from the Mission 4 enemy specialist. It took me three tries to reverse-engineer it."
- Natural difficulty adaptation — harder skills appear on harder enemies, so the reverse-engineering challenge scales with the player.
- Aligns with the narrative: you're an AI that learns from what it observes.
- Creates a secondary gameplay loop (reverse engineering) that exercises the same mental muscles as the primary loop (configuration).
- Comparable to Mega Man (defeating a boss grants its weapon), Monster Hunter (carving parts to build equipment from fallen monsters), Horizon Zero Dawn (override mechanics learned from observation).

**Weaknesses:**
- Reverse engineering as a mandatory gate could be frustrating. What if a player can understand the skill conceptually but can't solve the puzzle?
- Enemy config design becomes constrained — enemies must use skills in recognizable, learnable patterns.
- Skill acquisition order depends on enemy encounter order, which may conflict with intended teaching sequence.
- The mini-puzzle could feel like busy-work if not deeply integrated with core mechanics.

**Sensory signature:** After mission victory, the Inspector transitions to a special "CAPTURED CONFIG" mode. The enemy's config appears on the workbench, partially redacted:

```
ENEMY RELAY-B — CAPTURED
Skills: [compress] [???] [???]
Rules:
  1. IF buffer contains ≥ ??? observations of ??? target
     THEN merge into 1 entry preserving ???
  2. [ENCRYPTED]
```

The player fills in the blanks by examining the replay — scrubbing to moments where the enemy relay compressed signals, reading the buffer state before and after, inferring the threshold and preservation rules. When they get it right, the redacted fields fill in with green text and the skill icon transfers to the player's available skill list with a "data captured" sound — a descending digital chirp that sounds like downloading.

---

### Paradigm F: "The Hybrid Scaffold" (Linear Unlock + Discovery Bonus)

**How it works:** Skills unlock linearly via campaign missions (Paradigm A), but within each mission, there are hidden "advanced configurations" that the game recognizes as discoveries (Paradigm C). The linear unlock gives the player the named skill and a basic understanding. The discovery system rewards creative use with visual mastery badges and parameterized variants.

Example: Mission 3 gives the player compress. Basic compress merges 3+ same-type entries. But if the player configures compress with a rule that merges entries from *different* types (threat + observation → tactical_report), the game recognizes "cross-type compression" — a discovery that unlocks a configurable compression mode.

**The feeling:** Safety net with ceiling. Every player gets every skill through normal play. Engaged players who experiment discover that the skills have depth they didn't expect. The game rewards curiosity without punishing its absence.

**Strengths:**
- No player is ever stuck (linear unlock guarantees progression).
- Creative players feel rewarded for going deeper.
- The discovery layer adds replayability — "I unlocked compress on Mission 3, but I didn't discover cross-type compression until my second playthrough."
- The mastery badges are shareable social signals ("I have all 12 discovery badges").
- Comparable to Celeste's accessibility approach (everyone can finish the story, but B-sides and C-sides exist for mastery).

**Weaknesses:**
- Two systems instead of one. The player must understand both linear unlocks AND the discovery system.
- Discovery badges risk feeling like achievements rather than meaningful mechanical unlocks.
- If the discovery variants are too powerful, players who don't discover them are at a disadvantage in Gauntlet.
- If the discovery variants are too weak, they feel cosmetic and hollow.

**Sensory signature:** Linear unlocks use the boot-log (Paradigm A's typewriter text). Discovery moments use a subtler, more personal notification — not the bold gold burst of Paradigm C, but a quiet amber glow in the skill icon itself:

The skill icon in the workbench develops a small secondary ring. Hovering reveals: "Cross-Type Compression — discovered Mission 3, run 2. Your relay merged threat and observation data into a tactical report." The discovery log (accessible from the workbench's advanced panel) shows all discovered variants with timestamps and the config that triggered them.

---

## Player Journeys

### Journey: Tomás, 28, High School Physics Teacher

**Context:** Mission 3 under Paradigm A (Staged Reveal). Tomás just completed Mission 2, where he learned evade and engage. He's comfortable with patrol paths and buffer overflow but hasn't used relays yet. He plays games casually — Civilization on weekends, occasional Into the Breach.

**Minute 0:00 — The Boot Log**
Black screen. Green monospace text scrolls:

```
> POST-MISSION ANALYSIS: MISSION 2 COMPLETE
> COMBAT EFFICIENCY: 73%
> BUFFER UTILIZATION: 41%
> ...
> SKILL REGISTRY UPDATE DETECTED...
> DOWNLOADING: compress v1.0 — combine redundant buffer entries
> DOWNLOADING: amplify v1.0 — boost signal priority, broadcast to channel
> RELAY SUBSYSTEM: 2 NEW SKILLS ONLINE
> RELAY ASSEMBLY AUTHORIZED. 1 RELAY AVAILABLE FOR DEPLOYMENT.
```

Each line types out over half a second. The skill names glow green. Tomás reads them and thinks: "Compress... like zip files? And amplify... like a megaphone?" The real-world metaphors land immediately because the vocabulary is 1:1 with concepts he already knows.

**Minute 0:20 — Mission Briefing Opens**
The Plan screen loads. The board shows a 3-unit start: Scout-A at A2, Scout-B at H2, and a new unit type — Relay-A at D4, center of the board. Relay-A is rendered differently: a stationary antenna tower with a softly pulsing blue ring at its base. No movement path option — it's fixed in place.

The workbench opens to Relay-A's blueprint. The skills panel shows three toggle switches: [compress ✓] [amplify ○] [filter — LOCKED 🔒]. Filter shows a small lock icon with tooltip: "Available in Mission 4." Tomás notices this — he can see what's coming but can't use it yet. Anticipation builds.

**Minute 0:45 — Understanding Compress**
Tomás clicks the [compress ✓] toggle. The skill detail panel expands below:

```
COMPRESS
Merges multiple buffer entries of the same type into one summary entry.
Threshold: [3] entries before compression triggers ← slider
Output: 1 compressed entry (preserves pattern, loses exact timing)
```

The threshold slider reads "3" with a range of 2-5. Tomás adjusts it to 2, then back to 3, watching the ghost preview on the board update. At threshold 2, the relay's ghost shows it pulsing rapidly — it would compress every pair. At threshold 3, the pulse is slower. The preview makes the tradeoff visible: lower threshold = more frequent but lower-quality compressions.

He leaves it at 3. He thinks: "Okay, so the relay collects three observations about the same thing and squishes them into one summary. Like how I summarize lab results for students — three measurements become one average."

**Minute 1:30 — Wiring the Hook**
The hook panel on Relay-A shows two available hooks (of 4 total slots). Each hook has two fields: **Trigger** (what event fires it) and **Channel** (where it sends). Tomás types:

```
Hook 1: TRIGGER: compress_complete → CHANNEL: "intel"
```

As he types "intel" in the channel name field, the autocomplete is empty — no channel named "intel" exists yet. A small tooltip appears: "New channel will be created." He confirms. On the board, a faint green dashed line appears from Relay-A outward — the "intel" channel exists but has no listeners yet.

Now he opens Scout-A's blueprint and adds a hook:

```
Hook 1: TRIGGER: observation → CHANNEL: "raw_data"
```

And on Relay-A, he sets context config → listen channels → [raw_data ✓]. The board updates: a blue dashed line connects Scout-A to Relay-A labeled "raw_data". The relay now receives scout observations.

Finally, he opens the two strikers (pre-placed at E6 and F6) and sets their context config → listen channels → [intel ✓]. Blue dashed lines extend from Relay-A to each striker labeled "intel."

The full wiring is visible: Scout → "raw_data" → Relay (compress) → "intel" → Strikers. A three-hop information pipeline rendered as colored lines on the board. Tomás steps back and looks at it. "It's like a circuit," he says. The physics teacher in him lights up.

**Minute 3:00 — Sealed Watch**
He hits EXECUTE. The board transitions. Tick clock begins.

Tick 1-4: Scout-A patrols north. Blue ripples pulse at each tile. Observations fill its buffer — small blue pips appearing under its icon. At tick 3, the hook fires: an observation entry transmits to "raw_data." On the board, a tiny blue spark travels along the "raw_data" line from Scout-A toward Relay-A. It arrives at tick 4 (1-tick latency).

Tick 4-6: Relay-A's buffer begins filling. Blue pips appear under the antenna tower. One... two... At tick 6, a third observation from Scout-A arrives. The threshold of 3 is met. Compress fires: the three blue pips visually slide together — three dots merging into one slightly brighter dot. A soft "whoosh" sound. A blue-white flash pulses from the relay's antenna.

Then the compressed signal transmits on "intel." A green spark (intel channel = green) travels from Relay-A toward both strikers simultaneously, splitting at the relay into two parallel paths.

Tick 8: The strikers receive the compressed signal. Their buffer bars each show a new entry — a green-tinted compressed entry with a small diamond icon. Tomás watches a striker change course, moving toward a quadrant the scout observed. The compressed signal told the striker "enemy movement in northeast quadrant" — not the exact tick-by-tick positions, but enough for the rules to work with.

**Minute 4:30 — The Teaching Moment**
Tick 15: A cluster of three enemies appears in the northeast. Scout-A sees them and generates rapid observations. Hook fires three times in quick succession — three blue sparks race toward the relay. But the relay's buffer only has 4 open slots. Two of the three observations arrive; the third is evicted before compress can fire because the relay's buffer was already 10/12 full from earlier data.

Tomás sees a compressed signal go out, but it's based on only 2 observations (the third was lost). The strikers move toward the enemy cluster but position slightly wrong — the compression was missing data. One striker engages successfully (crimson flash), but the second striker ends up one tile off (it moved based on incomplete information).

In the Inspector, Tomás scrubs to tick 15 and clicks Relay-A. The buffer state shows:

```
Slot 10: [observation] enemy_scout at G2, raw_data — tick 14
Slot 11: [observation] enemy_striker at G3, raw_data — tick 15
Slot 12: [EVICTED] observation enemy_scout at F2, raw_data — tick 15
              ↑ DROPPED: buffer full, evicted before compression threshold met
```

The evicted entry is shown in red strikethrough with a warning icon. Tomás immediately understands: the relay's buffer was too full. He needs to either increase the buffer (impossible — it's fixed at 12 for relays) or increase compression frequency (lower threshold to 2) or add a filter to discard low-priority entries.

He thinks: "Ah, I need filter. That's Mission 4. But I can lower the compression threshold for now." He's already anticipating the next skill unlock.

**Minute 6:00 — Post-Mission Reflection**
The debrief shows: "Combat: 2/3 enemies eliminated. Buffer utilization: Relay-A at 92%. Compression events: 4. Signals dropped: 3."

Tomás writes in his mental model: "Relay buffer management is the bottleneck. Too much raw data, not enough room to accumulate before compressing. Next mission I need to either compress faster or filter out junk."

He's excited for Mission 4 — the filter skill. The staged reveal worked: he's *hungry* for the next tool because he's felt the pain of not having it.

**UI Annotations:**
- Boot log: monospace green-on-black, typewriter sound, green highlight on skill names
- Skill panel: toggle switches with detail expansion, parameter sliders with ghost preview
- Hook editor: two-field row (trigger dropdown + channel text input with autocomplete)
- Channel wiring: colored dashed lines on board, label in small text at midpoint
- Compress visual: buffer pips merge animation (three dots → one brighter dot), blue-white antenna flash
- Signal travel: colored spark moving along channel line, 1-tile-per-tick speed
- Inspector eviction: red strikethrough on evicted entries, warning icon, "DROPPED" label

---

### Journey: Priya, 31, Machine Learning Engineer

**Context:** Mission 5 under Paradigm D (Tech Tree). Priya invested heavily in the Signal branch, unlocking compress, filter, and amplify early. She skipped the Perception branch — her scouts only have patrol, no evade. She plays Factorio, Opus Magnum, and has dabbled in Screeps. She chose the Signal branch because "information throughput is always the bottleneck."

**Minute 0:00 — Between-Mission Tech Tree**
The circuit-board tech tree fills the screen. Three branches radiate from "CORE SYSTEM":

- **Perception branch:** patrol (unlocked) → evade (locked, 3 pts) → hack (locked, 5 pts)
- **Signal branch:** compress (unlocked) → filter (unlocked) → amplify (unlocked)
- **Command branch:** reassign (locked, 4 pts) → reroute (locked, 6 pts) → prioritize (locked, 8 pts)

Priya's Perception branch is dim — only patrol lit up. Signal branch glows fully green. Command is all gray. She has 6 data points from Mission 4 performance. She hovers over "evade" in the Perception branch (3 points) and "reassign" in the Command branch (4 points).

She thinks: "I could get evade for my scouts... but they've been fine without it. Mission 5 introduces the factory — I bet command skills will matter more for managing multiple units."

She invests 4 points in reassign. The copper trace lights up from the CORE SYSTEM node through the Command branch to the reassign node. An electrical crackle sound plays — a satisfying spark that jumps gap-to-gap along the trace. The node flares green. "REASSIGN v1.0 ONLINE" appears in white text.

She has 2 points left — not enough for reroute (6) or evade (3). She saves them. The tech tree screen fades to the Mission 5 briefing.

**Minute 0:40 — The Problem With No Evade**
Mission 5: first factory mission. Priya configures her production queue: Scout blueprint, Relay blueprint, Striker blueprint. She draws patrol paths for the first two scouts. No evade — her scouts don't have it.

She hits EXECUTE. The factory begins producing. Scouts deploy and patrol.

Tick 8: Scout-A encounters an enemy striker. No evade triggers. Scout-A continues its patrol path *directly adjacent to the enemy striker*. Engage fires — but the enemy's engage fires first (simultaneous resolution, but the enemy is a striker; Scout-A is a scout with no engage skill). Scout-A is eliminated. One-shot, one-kill. The tile flashes crimson. Scout-A's icon snaps to its destroyed sprite — crumpled antenna, trailing sparks.

Priya's heart drops. In Paradigm A, she would have had evade by now. Her tech tree choice — rushing Signal — left her scouts naked. This is the tech tree's design tension in action: strategic choice has consequences.

Tick 12: Scout-B encounters the same problem. Eliminated.

**Minute 2:00 — Adapting**
Priya's factory produces a third scout, but she's lost two already. She redesigns her patrol paths to avoid the board center, keeping scouts on the perimeter. Her relays are processing beautifully — compress, filter, amplify working in concert — but there's nothing to process because the scouts can't safely reach the interior.

She thinks: "I need evade. That 3-point cost I skipped is costing me units now." The tech tree decision she made between missions is having real gameplay consequences. She finishes Mission 5 with a narrow victory (relays compensated by routing the few observations scouts gathered before dying), earning 5 data points.

**Minute 4:00 — Post-Mission Tech Tree**
She immediately buys evade (3 points). The Perception branch now has patrol and evade lit. She has 4 points remaining (2 saved + 5 earned - 3 spent). She looks at reroute (6 points) — still can't afford it.

Priya reconsiders her strategy for Mission 6. "Maybe rushing Signal was the right call for relay management, but I need Perception for frontline survival. The tech tree isn't just about what I want — it's about what the *mission* demands."

This is the tech tree teaching a meta-lesson: skill acquisition IS strategy. Your unlock order is itself a build order.

**UI Annotations:**
- Tech tree: circuit-board aesthetic, copper traces connecting nodes, green = unlocked, amber pulsing = affordable, gray = locked
- Data point chips: small hexagonal tokens in a tray at screen bottom, physically dragged onto nodes
- Electrical crackle: spark animation jumping gap-to-gap along the copper trace during unlock
- Node flare: green glow expands outward from newly unlocked node, skill name appears in white
- Scout death: crimson tile flash, destroyed sprite snap (crumpled antenna), no slow animation — instant, like engage

---

### Journey: Kai, 11, Plays Roblox and Minecraft

**Context:** Mission 4 under Paradigm E (Mentor — Captured Enemy Config). Kai's older sister showed him the game. He likes building things and watching them go, but doesn't read long tooltips. He's completed Missions 1-3 by experimenting and retrying until he wins.

**Minute 0:00 — Mission 4 Victory**
Kai's scouts and strikers have eliminated the last enemy. The screen transitions to the Inspector. But instead of the normal debrief, a new panel slides in from the right with a distinctive red-and-gold border:

```
┌─────────────────────────────────────────────┐
│  ⚡ CAPTURED ENEMY CONFIGURATION              │
│                                               │
│  Enemy Relay-B used an unknown skill.         │
│  Analyze the replay to reverse engineer it.   │
│                                               │
│  [BEGIN ANALYSIS →]                           │
└─────────────────────────────────────────────┘
```

Kai clicks BEGIN ANALYSIS. The Inspector transitions to a focused mode: the timeline scrubber highlights three specific ticks in gold — ticks 12, 18, and 24 — where the enemy relay did something interesting. The rest of the timeline is dimmed.

**Minute 0:30 — The Reverse Engineering Puzzle**
Kai scrubs to tick 12. The enemy relay's buffer is displayed:

```
Before tick 12:
  Slot 1: [observation] player_scout at B3 — tick 10
  Slot 2: [observation] player_scout at B4 — tick 11
  Slot 3: [observation] player_scout at C4 — tick 11

After tick 12:
  Slot 1: [COMPRESSED] player_scout, moving SE, B-C corridor — tick 12
  Slot 2: (empty)
  Slot 3: (empty)
```

Three entries became one. Kai sees the before/after and thinks: "Oh, it squished them together!"

A fill-in-the-blank panel appears:

```
SKILL: [???]
This skill takes [___] entries of the same type
and combines them into [___] summary entry.

How many entries were combined?  [   ]
```

Kai types "3" and "1". The first blank fills with "3 or more" and the second with "1". A green checkmark appears. He's halfway there.

The next question:

```
What information was KEPT in the summary?
  ☑ Target type (player_scout)
  ☑ Movement direction (SE)
  ☑ General area (B-C corridor)
  ☐ Exact tick timestamps (tick 10, 11, 11)
  ☐ Exact tile positions (B3, B4, C4)
```

Kai checks the first three (the information that appears in the "After" compressed entry) and leaves the last two unchecked (exact data that was lost). Another green checkmark. Final question:

```
Name this skill: [____________]
(Hint: what do you call it when you make something smaller?)
```

Kai types "squish." The game accepts any input here — but then reveals:

```
> YOUR NAME: squish
> OFFICIAL DESIGNATION: compress
>
> COMPRESS v1.0 — REVERSE ENGINEERED
> "You learned this from Enemy Relay-B in Mission 4."
```

The "squish → compress" naming reveal is a tiny moment of delight. Kai grins. His name is acknowledged, then the official name is taught. The skill icon transfers to his available skills with the "data captured" descending chirp sound. The icon has a small red badge: "⚡ Captured" — marking its provenance.

**Minute 2:00 — Using the Captured Skill**
Back in the workbench for Mission 5 (or replaying Mission 4), Kai places a relay and enables compress. He already understands what it does — not because he read a tooltip, but because he reverse-engineered it from enemy behavior. The knowledge is experiential, not instructional.

He wonders: "What other skills do enemies have that I don't know about yet?" He's now motivated to analyze enemy configs carefully in every future mission — a habit that will serve him when hack (reading enemy buffers) becomes available.

**UI Annotations:**
- Captured config panel: red-and-gold border, distinct from normal Inspector, "⚡" icon
- Gold-highlighted ticks: specific moments on the timeline that show the skill in action
- Before/after buffer display: side-by-side showing entries before and after the skill fired
- Fill-in-the-blank puzzle: simple form fields with green checkmarks on correct answers
- Player naming: text input that accepts any string, followed by "YOUR NAME → OFFICIAL DESIGNATION" reveal
- Captured badge: small red "⚡" on the skill icon, hoverable for provenance info

---

### Journey: Diane, 55, First-Time Strategy Game Player

**Context:** Mission 3 under Paradigm F (Hybrid Scaffold). Diane downloaded the game because her grandson plays it and she wanted to understand what he's talking about. She's never played a strategy game. She uses iPad primarily and finds most game UIs overwhelming.

**Minute 0:00 — Linear Unlock (Safety Net)**
The boot log runs. Two new skills appear:

```
> DOWNLOADING: compress v1.0 — combine repeated observations into one
> DOWNLOADING: amplify v1.0 — make a signal louder so more units hear it
```

Diane reads "combine repeated observations into one" and nods. She understands conceptually — it's like combining three similar email threads into one summary. The metaphor doesn't require gaming literacy.

The workbench opens with compress and amplify pre-enabled on Relay-A (the mission's tutorial relay). A green arrow points to the compress toggle with a tooltip: "This relay will automatically combine similar observations. Try it!"

**Minute 0:30 — The Guided First Use**
The mission objective reads: "Your scouts are reporting too much data. Use the relay to compress observations before sending to strikers."

Diane doesn't need to configure anything — compress is already on with default threshold 3. She just draws patrol paths for scouts (she learned this in Missions 1-2) and hits EXECUTE.

She watches compress fire during Sealed Watch. Three blue pips merge into one brighter pip on the relay. She sees the compressed signal travel to the striker. The striker moves toward enemies based on the compressed data. Mission succeeds.

The debrief shows: "Compression events: 6. Signals compressed: 18 → 6. Buffer efficiency: +200%."

Diane thinks: "Okay, the relay squishes things together. That makes sense. The scouts tell the relay everything, and the relay summarizes."

**Minute 2:00 — The Discovery Layer (Optional Depth)**
On her second attempt of Mission 3 (she replays because she wants to try a different patrol path), Diane accidentally configures a rule on the relay that compresses observations from two *different* scouts into one entry. This isn't the default behavior — default compress only merges entries of the same type from the same source.

A quiet amber glow appears on the compress icon in the workbench:

```
┌─────────────────────────────────────────┐
│  ✧ Variant Discovered: Cross-Source     │
│  Your relay merged observations from    │
│  two different scouts. This is a known  │
│  advanced technique.                    │
│  [View Details] [Dismiss]               │
└─────────────────────────────────────────┘
```

The notification is soft — amber, not gold. It doesn't interrupt gameplay. Diane can dismiss it and keep playing. If she clicks "View Details," a small panel shows: "Cross-Source Compression: combines data from multiple scouts, creating a richer but less precise summary. Discoverers: 12% of players."

The "12% of players" stat is a gentle social signal — she did something most players haven't. Diane doesn't fully understand the implications, but she feels a warm glow of accidental competence. She might mention it to her grandson.

**Minute 3:30 — The Safety Net Effect**
If Diane never discovers any variants, she still has all skills and can complete the campaign. The discovery layer is invisible to players who don't trigger it. There's no penalty, no "you missed the secret," no feeling of incompleteness. The linear unlock is the complete experience. The discovery system is a bonus that rewards the curious without punishing the content.

**UI Annotations:**
- Boot log: same typewriter text, but skill descriptions use plain English ("combine repeated observations") not technical jargon
- Pre-enabled skills: tutorial missions pre-toggle skills for guided first use, with green arrow pointing to the active skill
- Discovery notification: amber border (not gold), soft chime (not triumphant), dismissable, "View Details" option for the curious
- Player percentage stat: "12% of players" as social proof without competition pressure
- No penalty indicators: no "you missed X" messaging anywhere in the campaign

---

## Interaction Effects

### Skill Acquisition × Onboarding (Wave 5)
The acquisition paradigm IS the onboarding strategy. Staged Reveal (A) creates the most controlled teaching sequence. Tech Tree (D) creates the most player-driven sequence. Discovery (C) creates the most emergent sequence. The choice here dominates the first-10-minutes experience. **Recommendation tension:** The locked mission arc (Missions 1-4 = tutorials) strongly implies a Staged Reveal or Hybrid approach. A Tech Tree adds a between-mission decision point that may distract from the "learn one thing per mission" clarity.

### Skill Acquisition × Gauntlet/Multiplayer (Wave 7)
In Gauntlet (async PvP), all players need the same skill set for fairness. Tech Tree (D) creates a problem: what if a player enters Gauntlet without a critical skill? Either Gauntlet requires full unlock (gates entry) or skill differences create asymmetry (balance nightmare). Paradigms A, B, E, and F avoid this by ensuring all players have all skills by campaign end. **Constraint:** Any paradigm must converge to full skill availability before Gauntlet.

### Skill Acquisition × Campaign Replayability (Wave 5)
Staged Reveal (A) makes early-campaign replays feel constrained ("I can't use compress on Mission 1 even though I know what it is"). One solution: "New Game+" mode that replays the campaign with all skills unlocked, recontextualizing every mission as a creativity sandbox. Tech Tree (D) has the strongest inherent replay value — different tech tree paths = different campaign experiences. Discovery (C) has the weakest — once you know the recipes, rediscovery is hollow.

### Skill Acquisition × The Boot Log Narrative (Locked)
The boot log framing ("You are an AI reading your own spec sheet") aligns best with Staged Reveal (skills downloading like firmware updates), Mentor/Captured (learning from enemy analysis fits the "adaptive AI" narrative), and Discovery ("pattern recognized" is the most narratively coherent — an AI that discovers its own capabilities). The Tech Tree feels least diegetic — "spending data points" doesn't map naturally to the boot log framing.

### Skill Acquisition × Command Agent Meta-Level (Locked)
Command skills (reassign, reroute, prioritize) are inherently meta-level — they modify other skills. If these unlock too early, the player hasn't built the base-level intuition needed to understand what they're modifying. If they unlock too late, the campaign's most exciting mechanic arrives with limited time to explore it. **All paradigms agree:** Command skills should unlock in the second half of the campaign (Mission 6-7).

### Skill Acquisition × Workbench UI Complexity
The workbench UI must adapt to skill availability. If a skill is locked, its slot should be visible but dimmed (not hidden) — so the player sees the full capability space and anticipates what's coming. This creates a "dashboard of potential" that motivates progression. Hiding locked skills entirely is cleaner but loses the anticipation effect. The Mentor paradigm (E) complicates this: skills you haven't captured don't appear in the workbench at all, creating genuine surprise when a new icon materializes after reverse engineering.

---

## Comparable Games

### Mega Man — Boss Weapons as Skill Acquisition
Mega Man's core loop: defeat a boss → gain its weapon. Each weapon is both a reward and a key — it's strong against a specific other boss, creating a preferred defeat order. Robot Uprising's Mentor paradigm (E) echoes this directly: defeat an enemy → reverse-engineer its skill. The "preferred order" maps to the tech tree's branching paths. Mega Man proves that "skills earned from enemies" creates lasting emotional attachment to each skill — players remember WHERE they got every weapon.

### XCOM: Enemy Unknown — Research as Strategic Choice
XCOM's research tree forces players to choose: do you research better armor (survivability) or better weapons (lethality)? The choice is irreversible within a campaign run. Robot Uprising's Tech Tree (D) creates the same tension. XCOM's lesson: the choice must feel like a genuine dilemma, not an obvious optimal path. If one branch is clearly stronger, the tree collapses to a linear path with extra UI.

### Slay the Spire — Card Acquisition Through Runs
In Slay the Spire, you discover new cards over multiple runs. Early runs use basic cards; later runs introduce complex synergies. The acquisition is partly random (card reward after combat) and partly chosen (pick 1 of 3). Robot Uprising's Hybrid paradigm (F) echoes this: linear progression provides the base, while discovery rewards provide the depth. Slay the Spire's key insight: **the discovery itself is content.** The moment you first see a card you've never seen before is exciting even before you know if it's good.

### Factorio — No Unlock Gates, Complexity from Composition
Factorio gives you every recipe from the start (in theory). Complexity comes from logistics and composition, not from gating access. This is Paradigm B taken to its extreme — all tools available, depth from wiring them together. Factorio proves this works for a certain player type (engineer/optimizer), but its new-player dropout rate is notoriously high.

### Baba Is You — Discovery as Core Mechanic
Baba Is You has no skill tree, no unlocks, no progression system. Every level uses the same vocabulary (BABA, IS, YOU, ROCK, PUSH, etc.). "Discovery" is realizing a new combination of existing words — which is the entire game. Robot Uprising's Discovery paradigm (C) aspires to this, but Baba Is You works because its vocabulary is tiny (20-30 words) and visually present. Robot Uprising's 12 skills may be too many for pure discovery to work without guidance.

---

## Sensory Summary

| Paradigm | Unlock Moment Feel | Visual | Audio | Emotional Tone |
|----------|-------------------|--------|-------|----------------|
| A: Staged Reveal | Christmas morning | Boot log typewriter text, green glow on skill names | Typewriter clatter + system-ready chime | Anticipation → satisfaction |
| B: Arsenal | New instrument day | Full unit portrait rendering line-by-line | Fabrication sounds, servo whirr | Wonder → eagerness |
| C: Discovery | Eureka moment | Gold burst notification, sparkle on new icon | Ascending three-note chord | Surprise → pride |
| D: Tech Tree | Circuit building | Copper trace lighting up, node flare | Electrical crackle + power-on hum | Strategy → commitment |
| E: Mentor | Intelligence capture | Red-gold captured panel, before/after buffer | Descending digital chirp (download) | Curiosity → mastery |
| F: Hybrid | Safety + depth | Boot log (linear) + amber glow (discovery) | Chime (linear) + soft chime (discovery) | Comfort → delight |

**The TikTok clip for each paradigm:**

- **Staged Reveal:** Split-screen: Mission 1 (one confused scout) vs. Mission 7 (full network cascade). Caption: "Same player, 2 hours apart."
- **Arsenal:** Relay reveal moment. The antenna tower assembles piece by piece. Camera zooms in as three skills light up. Caption: "When you unlock the relay and suddenly everything connects."
- **Discovery:** Player configures a weird rule. Gold burst: "PATTERN RECOGNIZED: compress." Player's face lights up in facecam. Caption: "I INVENTED that?!"
- **Tech Tree:** Speed-run of copper traces lighting up, node after node, full tree green. Caption: "Full tech tree speedrun, 47 minutes."
- **Mentor:** Side-by-side: enemy relay compressing, then player's relay compressing with "⚡ Captured" badge. Caption: "I stole the enemy's skills."
- **Hybrid:** Player replays Mission 3 for the fifth time, discovers a variant no one else has. "12% of players" stat on screen. Caption: "Accidentally found a secret technique on mission 3 attempt 5."

---

## Recommendation Tension

There is no single best paradigm. The choice depends on which design value is prioritized:

| Priority | Best Paradigm | Why |
|----------|--------------|-----|
| Smoothest onboarding | A (Staged Reveal) | Controlled pacing, no overwhelm |
| Maximum replayability | D (Tech Tree) | Different paths = different campaigns |
| Strongest narrative fit | E (Mentor) or C (Discovery) | AI learning from environment |
| Broadest accessibility | F (Hybrid) | Safety net + depth for those who want it |
| Deepest mastery feeling | C (Discovery) | Ownership of every capability |
| Fairest competitive play | A or F | Guaranteed convergence to full skill set |

The locked mission arc (Missions 1-4 as tutorials) most naturally supports **Paradigm A** (Staged Reveal) or **Paradigm F** (Hybrid Scaffold). The boot log narrative supports **Paradigm A** (firmware downloads) or **Paradigm E** (reverse engineering from captured configs). The Gauntlet requirement (all skills available) eliminates pure Tech Tree unless a catch-up mechanism exists.

**If forced to pick one:** Paradigm F (Hybrid Scaffold) threads the most needles — controlled onboarding, narrative fit (boot log + discovery recognition), competitive fairness (linear path guarantees full skills), and replayability (discovery variants reward replays). But every paradigm above is a viable game.

---

## New Aspects Discovered

1. **3.02a — New Game+ skill availability:** If using Staged Reveal or Hybrid, does a second playthrough unlock all skills from Mission 1? What happens to missions designed to teach specific skills when the player already has them? Does "New Game+" recontextualize missions as creativity sandboxes or break them?

2. **3.02b — Skill unlock pacing vs. factory introduction timing:** Mission 5 introduces the factory AND potentially new skills simultaneously. Is this too much new information? Should Mission 5 give zero new skills (factory is enough to learn) or should factory introduction come with a dedicated "factory skill" (e.g., extract) to anchor the learning?

3. **3.02c — The "I can see it but can't use it" anticipation design:** Showing locked skills as dimmed slots in the workbench vs. hiding them entirely. The psychology of visible-but-locked progression (see: every mobile game's locked content grid). When does anticipation become frustration?

4. **3.02d — Skill discovery as community content:** If using the Discovery or Hybrid paradigm, the list of discoverable variants becomes community knowledge. Players will make guides, tier lists, discovery checklists. Does this enhance or undermine the discovery experience? Should the game's discovery recognition be secret (undocumented) or published (official discovery list)?

5. **3.02e — Cross-paradigm hybrid: Staged + Mentor:** Linear unlocks for basic skills (patrol, engage, compress) but Mentor-style capture for advanced skills (hack, reassign, prioritize). Creates a clear "basics given, advanced earned" split that maps to the Mission 1-4 (tutorial) → Mission 5-10 (mastery) arc.
