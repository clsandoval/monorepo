# Onboarding: Distractor Tokens as Comprehension Test

**Aspect ID:** 5.00a-ix
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.00a-ii (physical term placement as naming mechanic), 5.00a (vocabulary pacing bottleneck), 5.04b (vocabulary density curve), 5.00a-i (Mission 4 Wall), 5.00a-vi (frozen striker diagnostic template), 1.09 (Slay the Spire combo discovery), 3.05 (rules language)

---

## The Problem

The parent analysis (5.00a-ii) identified a critical weakness in the label placement mechanic: **process of elimination trivializes the final placements.** If Mission 3 has 4 tokens and 4 panel slots, the fourth placement is always trivially correct — no comprehension required. By Mission 4 with 6 tokens and 6 slots, the last 2 placements are both low-comprehension. The matching game degrades into a counting game.

Distractor tokens fix this. Add 1-2 tokens per mission that look like they belong to a panel but don't. They're real vocabulary — terms the game WILL use later — but they don't match any currently unlabeled panel. The player must recognize them as premature, set them aside, and place only the correct tokens. The process-of-elimination safety net is gone. Every placement now requires genuine matching comprehension, including the last one.

---

## The Mechanic in Detail

### What a Distractor Token Is

A distractor token is an amber word tile that sits in the mission's token tray alongside legitimate placement tokens. It uses the same visual treatment: amber monospace text, 2px bevel, subtle glow, icon beside the text. It is **indistinguishable from a real token by appearance alone.** The player must determine whether the concept it names matches any currently unlabeled panel — and recognize when it doesn't.

### What Happens When You Try to Place a Distractor

If the player drags a distractor token to any panel header, every slot rejects it. The standard rejection sound (dull *thud*) plays and the token bounces back to the tray. But unlike a real token placed on the wrong panel — where the rejection sound means "right token, wrong panel" — a distractor's rejection means "this concept doesn't belong here yet."

**The key design question:** How does the player distinguish "wrong panel" from "not yet relevant"?

### Six Design Variations for Distractor Handling

#### Variation 1: "The Shelf"

A dedicated "Not Yet" shelf appears at the bottom of the token tray — a horizontal strip with a dimmer background and a dashed border, labeled with a small `LATER →` indicator. When the player identifies a distractor, they drag it to the shelf. The token dims from amber to grey-silver and displays a tiny lock icon. The shelf persists across missions — shelved tokens from Mission 2 reappear in Mission 3's tray when their panels finally unlock.

**Shelf confirmation audio:** A soft descending two-note chime (E→C, the inverse of the ascending C→E placement chime). Not a failure sound — a "correct identification of irrelevance" sound. The distinction matters: the player made a RIGHT decision by NOT placing this token.

**Visual treatment:** The shelf token shrinks to 80% size, loses its glow, gains a frosted glass overlay. When the token's mission finally arrives (e.g., the "HOOK" token shelved in Mission 2 becomes placeable in Mission 3), the shelved token reawakens: frosted glass cracks, amber glow returns, a small starburst animation plays, and the token slides from the shelf back into the active tray. Audio: a glass-cracking *tink* followed by the warm harmonic hum of recognition.

#### Variation 2: "The Incinerator"

No shelf. The player must drag the distractor to a visible trash/recycle zone (a small circuit-board-textured bin icon at the bottom-right of the tray). The token dissolves with a brief electrical discharge animation — amber sparks cascading into dark particles. The boot log prints: `"SUBSYSTEM NOT RECOGNIZED: [term]. Filed for future analysis."` The term reappears in a later mission's tray as a regular placeable token.

**Why this might be better:** The trash gesture is more decisive than shelving. The player is making a judgment call: "I don't need this." The emotional weight of discarding creates a stronger memory trace than passive shelving.

**Why this might be worse:** Players may be afraid to discard tokens they're unsure about. Fear of permanent loss (even though the game recovers the token later) creates anxiety. The word "incinerator" or "trash" has negative connotations that clash with the "every term matters" philosophy.

#### Variation 3: "The Timeout"

Distractor tokens are never explicitly identified. The player simply can't place them anywhere. After all legitimate tokens are placed and the fanfare plays, the remaining tokens in the tray automatically dim and slide off-screen with a quiet whooshing sound. The boot log notes: `"Unrecognized subsystems archived. They may become relevant."` No player action required for the distractors themselves.

**Why this might be better:** Zero additional cognitive load. The distractor's job is done the moment the player tries and fails to place it — the failed attempt IS the comprehension test. Requiring additional interaction (shelving, trashing) adds friction without adding learning.

**Why this might be worse:** The player never explicitly identifies the distractor. The comprehension test is passive (I couldn't place it) rather than active (I chose not to place it). Active identification creates stronger learning. Also, this variation can't distinguish between a distractor the player tried and a distractor the player simply hasn't gotten to yet.

#### Variation 4: "The Questioning Mark"

When the player fails to place a distractor on any panel (2+ rejections from different panels), the token's amber glow shifts to a soft cyan pulse and a `?` icon appears on it. The boot log prints: `"UNKNOWN SUBSYSTEM DETECTED. Classification pending."` The token remains in the tray but is now visually distinct — the player can see it's "questioned." When all legitimate tokens are placed, questioned tokens auto-archive with a dedicated animation (fade to cyan outline, drift upward and off-screen like a thought bubble).

**Why this might be better:** Progressive feedback. The token transforms as the player interacts with it, teaching through state change rather than explicit instruction. The `?` marker connects to the uncertainty prefix mechanic (3.05a-i) — visual consistency across the game's vocabulary.

**Why this might be worse:** Requires 2+ failed placements to trigger, which means the player must invest effort into wrong guesses before the system helps. Penalizes players who recognize the distractor on first rejection.

#### Variation 5: "The Preview Card"

Distractor tokens, when double-clicked or long-pressed, flip over to reveal a preview card showing which FUTURE mission the concept appears in. The reverse side shows a blurred silhouette of the future panel with text: `"Available in Mission 5: CHORUS"` and a small locked padlock icon. This turns the distractor into a teaser — a glimpse of what's coming. The player can't place it now, but they can see where it's headed.

**Why this might be better:** Transforms the distractor from an obstacle into a reward. Curiosity about upcoming mechanics creates forward pull. "I can't wait to unlock hooks" is more motivating than "I don't know what hooks are yet."

**Why this might be worse:** Spoils upcoming mechanics. Part of the tutorial magic is surprise — discovering what "hooks" means through gameplay, not from a preview card. Also, mission names and numbers are meta-information that breaks the diegetic "you are an AI" framing.

#### Variation 6: "The Lure" (Recommended)

Distractor tokens have a subtle visual tell that distinguishes them from legitimate tokens — but the tell is designed to be discoverable, not obvious. A thin dotted border instead of solid. A slightly different icon style (outline instead of filled). A barely perceptible pulse rate difference (0.6Hz instead of 0.5Hz). Players who are paying close attention notice the difference; players who aren't still get the rejection feedback loop.

When all legitimate tokens are placed, remaining tray tokens display a brief "not yet" shimmer and slide to a compact shelf area. No explicit player action required for shelving (Variation 3's auto-archive), but the visual tell rewards observant players who spotted the difference early (Variation 1's active identification reward without Variation 1's required interaction).

**The shelf is automatic but the tell is learnable.** Mission 2 distractors have a more obvious tell (dotted border + different icon fill). Mission 4 distractors have a subtler tell (only the pulse rate). By Mission 6-7, the tells are gone — the player has learned to evaluate each token against available panels rather than relying on visual shortcuts.

**Why this is the recommendation:** It layers passive and active comprehension testing. Observant players are rewarded without penalizing less observant ones. The fading tells teach the real skill (evaluate the concept, not the appearance) while providing scaffolding during early missions.

---

## The Distractor Curriculum: What Appears When

### Mission 1: Wake (0 distractors)

No distractors. The player is learning the basic drag-and-place mechanic. Adding distractors to the first encounter would teach "some tokens are wrong" before the player learns "tokens go on panels." Sequence matters: establish the positive pattern first.

**Tokens:** `CONTEXT WINDOW`, `OBSERVATION`, `NOISE`, `SLOT` (4 tokens, 4 panels)

### Mission 2: Focus (1 distractor)

First distractor. The player has placed 4 tokens successfully in Mission 1 and expects the same clean mapping.

**Tokens:** `BUFFER SIZE`, `CONFIDENCE`, `STALENESS`, `EVICTION`, **`HOOK`** (5 tokens, 4 panels)

`HOOK` is the distractor. It's a real term — hooks are introduced in Mission 3 — but there's no hook panel yet. The player might try to place it on the filter panel (hooks and filters are both about routing information) or the context window panel (hooks deliver data to the buffer). Both attempts bounce. When the 4 legitimate tokens are placed, `HOOK` auto-shelves with the descending chime and boot log note: `"SIGNAL ROUTING: NOT YET INITIALIZED. Filed."`

**Teaching moment:** The first time a token doesn't belong. The player learns that the tray can contain more tokens than panels. They can no longer assume everything fits.

### Mission 3: Relay (1 distractor)

**Tokens:** `HOOK`, `CHANNEL`, `SIGNAL`, `LATENCY`, **`RULE`** (5 tokens, 4 panels)

`HOOK` returns from the shelf, now glowing with reawakened amber. `RULE` is the new distractor — rules are introduced in Mission 4. The player who shelved `HOOK` in Mission 2 now sees it return as a real token. This reinforces that shelved tokens DO come back. `RULE` might be mistaken for a hook-related panel (rules govern hook behavior) but nothing on the current workbench matches.

### Mission 4: Chorus (2 distractors)

The big mission. Six new terms PLUS two distractors.

**Tokens:** `RULE`, `CONDITION`, `ACTION`, `PRIORITY`, `PERCEPTION RADIUS`, `SKILL`, **`BLUEPRINT`**, **`PRODUCTION QUEUE`** (8 tokens, 6 panels)

`RULE` returns from the shelf. `BLUEPRINT` and `PRODUCTION QUEUE` are distractors — factory concepts from Mission 5. Eight tokens in the tray is the most the player has ever seen. The two distractors add genuine cognitive challenge: with 6 legitimate tokens and 6 panels, placing 5 leaves 3 tokens and 1 panel. Two of those 3 are distractors, but which two? The player must genuinely evaluate each remaining token against the last panel.

**Critical design:** Mission 4 is already the vocabulary wall (5.00a-i). Two distractors add to the cognitive load. This is acceptable because the distractors are self-identifying through rejection — the player doesn't need to evaluate them in advance. They only become a challenge at the end when 3 tokens remain for 1 panel. And even then, process of elimination gives 1/3 odds (vs. 1/1 certainty without distractors). The comprehension test is real but not punishing.

### Mission 5: Factory (2 distractors)

**Tokens:** `BLUEPRINT`, `PRODUCTION QUEUE`, `CONVEYOR`, `RESOURCE`, **`COMMAND`**, **`REROUTE`** (6 tokens, 4 panels)

`BLUEPRINT` and `PRODUCTION QUEUE` return from the shelf. `COMMAND` and `REROUTE` are distractors — Command agent concepts from Missions 6-7.

### Missions 6-10 (1-2 distractors each)

Each mission continues the pattern. Distractors preview vocabulary from 1-2 missions ahead. By Mission 8, the player has internalized that the tray always contains extras. The distractor mechanic is no longer surprising — it's an expected part of the mission boot sequence. The player evaluates each token against available panels as a natural reflex.

---

## Player Journeys

### Journey: Tomás, 16, Manila, plays League of Legends and Valorant, first strategy game

**Context:** Mission 2: Focus. Tomás blazed through Mission 1 in 90 seconds, placing all 4 tokens without a single wrong drop. He's confident. He texts his friends: "this is easy." Mission 2 opens.

**Minute 0:00 — The Fifth Token**
The boot log initializes. Token tray fills: `BUFFER SIZE` (ruler icon), `CONFIDENCE` (gradient bar), `STALENESS` (cobweb clock), `EVICTION` (exit arrow), and... `HOOK` (curved connector icon). Tomás counts: five tokens. He looks at the workbench — four unlabeled panels. His brow furrows. "Five and four. One extra?" He assumes he miscounted and starts placing.

**Minute 0:12 — Speed Run**
He places `BUFFER SIZE` on the size counter, `CONFIDENCE` on the brightness indicator, `STALENESS` on the timestamp display. Three tokens placed, three correct. He's in the zone. One panel left — the eviction configuration area. Two tokens remain: `EVICTION` and `HOOK`.

**Minute 0:20 — The Fork**
He grabs `HOOK`. The curved connector icon reminds him of the hook mechanic from a League item description. He drags it toward the eviction panel. Tooltip: "This panel manages what leaves a unit's memory when full." He drops. *Thud.* Bounced. He tries the already-labeled buffer size counter. *Thud.* Bounced. He tries the staleness timestamp. *Thud.* "What?"

**Minute 0:30 — The Revelation**
He pauses. Looks at the tray. `EVICTION` sits there with an exit arrow icon — an arrow pointing OUT of a box. The eviction panel is about things LEAVING the buffer. `HOOK` has a connector icon — connecting things. Nothing on this mission's workbench connects things. He drops `EVICTION` on the eviction panel. *Click.* Rising chime.

`HOOK` is alone in the tray. The fanfare plays. `HOOK` dims, develops a frosted overlay, and slides to a small shelf area with a descending E→C chime. Boot log: `"SIGNAL ROUTING: NOT YET INITIALIZED. Archived for later analysis."` Tomás stares at the shelf. "Oh. It's not for this level."

**Minute 0:45 — Recalibration**
He texts his friends: "ok this game is trickier than I thought. it gives you fake pieces." He examines the shelf. The `HOOK` token sits there, dimmed but visible. He wonders what it's for. He's already thinking about hooks before he's encountered them in gameplay. The distractor has planted a seed.

**UI Annotations:**
- Fifth token creates immediate visible mismatch: 5 items in tray, 4 `[???]` headers on workbench
- Failed placement on ALL panels (3+ rejections) triggers no special state — same thud each time
- Auto-shelving after final legitimate placement: 600ms delay, then dim→shrink→slide animation
- Shelf: 160×32px strip below main tray, 60% opacity background, dashed amber border, `LATER →` label in 9pt
- Descending shelving chime: E4→C4, 200ms each note, triangle wave, 30% reverb

---

### Journey: Dr. Priya, 35, Bangalore, ML engineer, plays Factorio and Civilization

**Context:** Mission 4: Chorus. Priya has shelved `HOOK` in Mission 2, seen it return as a real token in Mission 3, and shelved `RULE` in Mission 3. She understands the distractor pattern. Mission 4's tray appears.

**Minute 0:00 — The Eight-Token Tray**
Eight tokens. Priya immediately counts the workbench panels: six new unlabeled headers. She calculates: 8 - 6 = 2 distractors. She knows the pattern now. She starts scanning tokens for ones that don't match.

**Minute 0:10 — Active Distractor Hunting**
She reads each token's icon and name: `RULE` (returned from shelf, she knows this one), `CONDITION` (checkbox icon), `ACTION` (lightning bolt), `PRIORITY` (numbered list), `PERCEPTION RADIUS` (circle emanating from dot), `SKILL` (gear/wrench), `BLUEPRINT` (schematic icon — a miniature wireframe of a unit), `PRODUCTION QUEUE` (conveyor belt icon). She examines the workbench. No factory. No conveyor. No schematic viewer. `BLUEPRINT` and `PRODUCTION QUEUE` are obviously factory concepts. She's read enough game design to know the factory is coming but isn't here yet.

**Minute 0:20 — The Speed Placement**
She places `RULE` (returned, easy), `CONDITION` on the left half of the rule strip, `ACTION` on the right half, `PRIORITY` on the numbered indicators, `SKILL` on the skills sidebar, `PERCEPTION RADIUS` on the overlay toggle. Six tokens, six panels, zero wrong drops. She's never even touched `BLUEPRINT` or `PRODUCTION QUEUE`.

**Minute 0:35 — The Double Shelf**
The fanfare plays. Both distractor tokens dim simultaneously and slide to the shelf. The boot log prints: `"PRODUCTION SUBSYSTEM: NOT YET INITIALIZED. Two modules archived."` Priya notes the plural — the game noticed two distractors. She examines the shelved tokens. The `BLUEPRINT` token's schematic icon reminds her of Factorio's blueprint library. "So we'll be building templates. Factory mission next, probably." She's already theorizing about game systems two missions ahead, primed by the distractor's vocabulary.

**Minute 0:50 — Meta-Observation**
Priya opens her notebook (she's that kind of player) and writes: "M4: 8 tokens, 6 real. Distractor ratio increasing (M1: 0/4, M2: 1/5, M3: 1/5, M4: 2/8). Predicted M5: 2-3 distractors?" She's building a model of the distractor system itself — the kind of meta-learning the game wants to encourage. She's learning to evaluate information relevance, not just information content.

**UI Annotations:**
- Eight-token tray: 4×2 grid in sidebar, tokens slightly smaller (100×24px) to fit
- Double shelf: both tokens slide simultaneously with staggered timing (100ms offset)
- Boot log plural form: system detects >1 distractor and adjusts message grammar
- Shelf now shows 3 total tokens (HOOK from M2 returned in M3, RULE from M3 returned in M4, plus 2 new)
- Shelf history: small `×3 shelved, ×2 returned` counter in shelf header

---

### Journey: Kai, 11, Osaka, plays Minecraft and Fortnite, mild dyslexia

**Context:** Mission 2: Focus. Kai struggled with Mission 1 — it took him 3 minutes to place 4 tokens because he relied on icons rather than text. His older sister helped him. He's back for Mission 2 alone.

**Minute 0:00 — Counting**
Five tokens. Kai counts the `[???]` headers on the workbench. Four. He doesn't realize there's a mismatch — he just starts grabbing tokens.

**Minute 0:20 — Trial and Error**
He grabs `HOOK` first (curved connector icon catches his eye — it looks like a fishing hook, and he fishes in Minecraft). He drags it to the buffer panel. *Thud.* He drags it to the filter panel. *Thud.* He drags it to the size counter. *Thud.* He's confused. "Why doesn't this work anywhere?"

**Minute 0:40 — Asking for Help (Almost)**
He's about to call his sister when he notices the ruler icon on `BUFFER SIZE`. Oh — the ruler matches the "6/6" counter he's been looking at. He drops `BUFFER SIZE` on the counter. *Click.* Ascending chime. He smiles. Three more panels to go.

**Minute 1:10 — The Last Two**
He's placed `BUFFER SIZE`, `CONFIDENCE`, and `STALENESS`. One panel left (eviction config). Two tokens remain: `EVICTION` (exit arrow) and `HOOK` (curved connector). He grabs `HOOK` again. Drags it to the eviction panel. *Thud.* He grabs `EVICTION`. The exit arrow — something leaving a box. The eviction panel shows entries leaving the buffer. He drops. *Click.*

`HOOK` sits alone in the tray. The fanfare plays. The hook token dims and slides to the shelf with the descending chime. Boot log text appears, but Kai doesn't read it. He watches the token shrink and grey out. "Oh, it goes on the shelf. It wasn't for this one."

**Minute 1:30 — The Moment**
Kai has learned something important without reading a single word of explanation: **not everything in the tray is relevant right now.** In Minecraft terms, he had 5 items in his hotbar but only 4 crafting slots. One item was for a different recipe. He'll remember this. When Mission 3's tray loads with a different extra token, he'll spend less time trying to force it.

**Minute 1:35 — Building Confidence**
His sister walks by. "Did you get it?" Kai: "Yeah. One of the words was a trick one. It went on the shelf for later." His sister: "How'd you know which one was the trick?" Kai: "It didn't fit anywhere." He's articulating a comprehension strategy: try to place, and the panels tell you what fits.

**UI Annotations:**
- Icon-only identification path: Kai never reads token text, uses icons + panel visual matching
- 3+ rejections from different panels: no special feedback (Variation 6 design — auto-shelf at end)
- Rejection sounds identical for wrong-panel vs. distractor: by design — the system doesn't tell you WHY it bounced
- Shelf animation visible even without reading boot log: visual-only feedback path
- Descending chime as "correct non-placement" distinct from wrong-drop *thud*: different valence, same event type

---

### Journey: Lola, 68, Cebu, retired librarian, plays crossword puzzles on her tablet, first video game

**Context:** Mission 3: Relay. Lola's grandchildren set up the game for her. She completed Missions 1-2 with their help, and placed the distractor `HOOK` on the shelf in Mission 2 after several attempts. Mission 3 opens.

**Minute 0:00 — The Returned Token**
Five tokens in the tray. But one of them is glowing differently — `HOOK` has an amber starburst animation playing, its frosted shelf overlay cracking away. Boot log: `"SIGNAL ROUTING: NOW ONLINE. Previously archived module ready for deployment."` Lola recognizes the token. "Oh, the one from before! It's back!" The reawakening animation connects this moment to Mission 2's shelf event — temporal continuity across sessions.

**Minute 0:15 — The New Distractor**
She places `HOOK`, `CHANNEL`, `SIGNAL` on their panels (matching icons to panel features). One panel left, two tokens: `LATENCY` (hourglass icon) and `RULE` (numbered list icon). She examines the last panel — it shows delivery timing between units, with tick numbers. The hourglass fits. She places `LATENCY`. *Click.*

`RULE` auto-shelves. She watches it dim and slide away. Boot log: `"CONDITIONAL LOGIC: NOT YET INITIALIZED."` Lola nods. "Like shelving a book in the wrong section. It belongs somewhere, just not here."

**Minute 0:30 — The Librarian's Insight**
Lola has mapped the distractor mechanic to her professional expertise: cataloging. Some items don't belong in the current collection. You don't throw them away — you note them for the correct section. The shelf IS a catalog's "holds" shelf. The game mechanic mirrors a skill she's practiced for 40 years.

**UI Annotations:**
- Reawakened token animation: 800ms total (frost-crack 200ms → amber glow return 300ms → starburst 200ms → slide to active tray 100ms)
- Reawakened token has subtle "returning" glow for 3 seconds after arriving in active tray — visual distinction from new tokens
- Boot log reawakening message uses different verb than initial archive message: "ready for deployment" vs. "filed for analysis"
- Librarian metaphor unintentional but supported: the shelf IS a holds queue; the reawakening IS a hold being fulfilled

---

## Strengths

1. **Eliminates process-of-elimination trivially.** The core fix works. With N tokens and N-1 or N-2 panels, the final placements require genuine evaluation. The comprehension test is no longer solvable by counting.

2. **Teaches relevance evaluation.** A skill directly transferable to real agentic AI engineering: not every piece of information is relevant right now. Context windows have limited space. Knowing what to EXCLUDE is as important as knowing what to include. The distractor mechanic makes this lesson physical.

3. **Creates forward anticipation.** Distractors plant vocabulary seeds for upcoming missions. The player encounters "HOOK" in Mission 2, wonders about it, and arrives at Mission 3 primed. The shelf is a preview system disguised as a comprehension test.

4. **Reawakening moment is emotionally satisfying.** Seeing a shelved token return as a real, placeable concept feels like a promise kept. The game said "later" and delivered. This builds trust in the tutorial's pacing.

5. **Scales with player skill.** Observant players spot distractors immediately (icon mismatch, visual tells in Variation 6). Less observant players discover them through rejection feedback. Both paths lead to the same learning outcome, but the first path is faster and feels rewarding.

6. **No penalty for wrong identification.** Trying to place a distractor doesn't cost anything — the same thud, the same bounce-back. The player can safely explore. This preserves the low-stakes feel of the naming ritual.

---

## Weaknesses

1. **Cognitive load at the worst time.** Mission 4 already introduces 6 new terms (the vocabulary wall). Adding 2 distractors means 8 tokens in the tray — a 33% increase in sorting complexity during the hardest tutorial mission. For some players, the extra tokens tip them from "challenging" to "overwhelming." Mitigation: Mission 4's distractors should be obviously mismatched (factory concepts when there's no factory) to minimize evaluation cost.

2. **Undermines the "everything here is useful" trust.** Early tutorial design benefits from reliability — the player should trust that the game presents only relevant information. Distractors break this trust intentionally, which is pedagogically valuable for later gameplay (where context windows contain noise). But it may feel unfair during onboarding. The question: is "some things aren't for you right now" a lesson that belongs in Mission 2, or Mission 5?

3. **The shelf is additional UI surface area.** The token tray is already a secondary panel in the boot log sidebar. The shelf adds a third element. On mobile, where screen real estate is precious, the shelf competes with the workbench panels for space. Mitigation: shelf collapses to a count badge (`📦 1`) when not actively receiving tokens, expanding only during the shelving animation.

4. **Replay tedium amplified.** On replay, the naming ritual is already skippable (labels pre-placed). But if distractors persist on replay, the player must also deal with tokens they already know are distractors. Mitigation: on replay, the entire tray is pre-resolved — labels placed, distractors shelved. No interaction required.

5. **Players may game the visual tells.** If Variation 6's tells become common knowledge (dotted border = distractor), players skip the comprehension test entirely by pattern-matching the visual signal instead of evaluating the concept. This is why the tells fade across missions — by Mission 6, there are no visual hints. But early missions might produce superficial learning if the tells are too obvious.

---

## Interaction Effects

### With Vocabulary Density Curve (5.04b)
Distractors increase the effective vocabulary exposure per mission beyond what the density curve calculates. A mission with 4 legitimate tokens + 1 distractor exposes the player to 5 terms, even though only 4 are "active." The density curve analysis should account for distractor-introduced terms as passive exposure — they occupy working memory briefly during the evaluation phase but don't require the full comprehension-placement-retention cycle.

### With Physical Term Placement (5.00a-ii)
Distractors directly address weakness #4 identified in the parent analysis. The recommended hybrid ("The Experiential Stamp") gains an additional layer: the comprehension gate fires for legitimate tokens (you've experienced the concept → token appears), but distractor tokens appear WITHOUT a comprehension gate (they reference systems the player hasn't experienced yet). This creates an asymmetry that teaches the difference between "I understand this and can name it" and "I don't know what this is yet."

### With Mission 4 Wall (5.00a-i)
The double distractor in Mission 4 interacts with the already-high cognitive load. The parent Mission 4 analysis should be revisited: if the "frozen striker" opening is working correctly, the player enters Mission 4 having already recognized that SOMETHING is missing (rules). When `RULE` returns from the shelf, the emotional beat is: "I met this concept before it was mine. Now it's real." This frames the Mission 4 wall as a reunion rather than an assault.

### With Frozen Striker Diagnostic (5.00a-vi)
The frozen striker technique — stripping all rules to see raw observation data — has a parallel in the distractor mechanic. Both teach that absence has meaning. An empty rule set reveals what observations DO. A distractor token reveals what concepts DON'T apply yet. Both frame "nothing" as information.

### With Context Overload (Locked)
The context window overload mechanic works because units can't distinguish useful signals from noise — their buffer fills indiscriminately. The distractor mechanic trains the player in exactly this skill: evaluating whether a piece of information belongs in the current context. By Mission 5, when the player starts configuring context filters (listen/ignore toggles), they've already practiced the mental model through token sorting.

### With Boot Log Narrative (Locked)
Distractor tokens must be diegetically consistent. The boot log should acknowledge them: `"SUBSYSTEM DETECTED: [name]. Classification: DORMANT. Not yet integrated into current architecture."` The AI isn't confused by the extra tokens — it recognizes uninitialized subsystems and correctly files them. This maintains the "you are an AI self-documenting" framing.

### With Blueprint Codex (Locked)
Shelved distractor tokens should appear as locked silhouettes in the Blueprint Codex. The player sees the concept's card but can't read it yet — a visual breadcrumb that something is coming. This connects the distractor shelf to the collection metagame.

### With Controller/Touch (6.06, 6.07)
On controller: D-pad to cycle tokens, A to pick up, left stick to navigate panels, A to drop. If the token bounces from all panels, B to return to tray. The shelf appears as a selectable zone via D-pad down past the last panel.

On mobile/touch: long-press to pick up, drag to panel or shelf. The shelf is a fat touch target at the bottom of the screen (60×48pt minimum). Double-tap a distractor to preview (Variation 5's flip, if enabled).

---

## Comparable Games & Media

### Baba Is You — Red Herring Tiles
Baba Is You levels often contain word tiles that COULD form rules but shouldn't. "ROCK IS DEFEAT" is valid syntax but creates an unwinnable state. The player must evaluate which syntactically valid rules are strategically useful and which are traps. Robot Uprising's distractors are the vocabulary equivalent: syntactically valid tokens that don't apply to the current context.

### TUNIC — Pages You Can't Read Yet
TUNIC's instruction manual contains pages in an invented language. Players encounter these pages long before they can decode the language. The pages sit in the manual, visible but incomprehensible, until the player's growing understanding unlocks their meaning. Robot Uprising's shelved tokens work the same way — the word is visible, its meaning is pending.

### Slay the Spire — Card Removal as Skill
In Slay the Spire, the meta-skill of removing cards from your deck is more important than adding them. A lean 15-card deck that cycles quickly beats a bloated 30-card deck with individually strong cards. The distractor mechanic teaches the same principle: identifying what NOT to include is a skill. The shelf is a form of deck thinning for your vocabulary.

### The Witness — Misleading Panels
The Witness has environmental puzzles that look like they should be solvable but aren't (yet). They require knowledge from panels in other parts of the island. The player tries, fails, notes the location, and returns later with new understanding. Robot Uprising's distractors compress this arc into the token tray — try, fail, shelf, return later.

### Wordle — Process of Elimination as Core Loop
In Wordle, grey letters (not in the word) are as informative as green letters (correct position). The grey letter IS the signal — knowing what doesn't belong narrows the solution space. The distractor token's rejection *thud* is Robot Uprising's grey letter: information through negation.

### Montessori Control of Error
Montessori materials are designed with "control of error" — the material itself tells the child when they're wrong without an adult intervening. Puzzle pieces that don't fit, color gradients that reveal misorderings, number rods that don't sum. Robot Uprising's rejection-thud is a control of error. The distractor doesn't need a teacher to explain why it doesn't belong — the panel rejects it, and the child-player adjusts.

---

## Sensory Summary

**What it looks like:** The token tray holds 5-8 amber word-tiles, each with a small icon. The player doesn't know which are distractors until they interact. When a distractor bounces from every panel, it still glows amber — identical to legitimate tokens. Only when all legitimate tokens are placed does the distractor's transformation begin: its amber glow fades to grey-silver over 400ms, a frosted glass overlay sweeps across the surface from left to right, and the token shrinks to 80% size with a 200ms ease-out. It slides toward the shelf strip — a dimmer horizontal zone at the bottom of the sidebar with a dashed amber border and a tiny `LATER →` label. The token settles into the shelf with a soft magnetic snap, joining any previously shelved tokens in a neat row.

When a shelved token reawakens in a future mission: the frosted glass develops a web of bright amber cracks over 200ms. The cracks widen, light pours through, and the frost shatters outward in pixel fragments that dissolve into nothing. The token, now amber again, pulses with a bright starburst that fades over 300ms. It lifts from the shelf and floats upward into the active tray, landing with a gentle bounce.

**What it sounds like:** The distractor's rejection sounds identical to a wrong-panel placement — the same dull *thud* on every panel. No special "this is a distractor" audio cue. The distinction comes at the end: when all legitimate tokens are placed and the fanfare chord plays, the distractor's shelving produces a soft descending two-note chime (E4→C4, 200ms per note, sine wave, 40% reverb). This descending interval is the mirror image of the placement chime (C4→E4, ascending). The player's ear registers: "placement goes up, shelving goes down." Both are positive sounds — neither is a failure buzz.

The reawakening in a future mission: a glass-cracking *tink* (like tapping a wine glass), followed by a 500ms ascending harmonic swell that resolves into the standard warm recognition hum. The return-to-tray landing produces a soft *tok* (lighter than the placement *click*, heavier than the pickup *snick*).

**What it feels like:** On DualSense — the distractor's panel rejections produce the same short haptic tap as any wrong drop. No special trigger for "distractor detected." The shelving produces a long, slow, descending haptic wave — 600ms of gradually decreasing vibration, like something powering down. The reawakening produces the opposite: a gradually increasing buzz over 400ms culminating in a sharp *snap*, like a relay switching on. On mobile — standard haptic tap on rejection, long descending buzz on shelving, increasing buzz + double-tap on reawakening.

**The TikTok clip:** Split-screen, two players. Left: a first-timer in Mission 2, dragging `HOOK` to every panel, confused, four thuds in a row, then watching it shelf with a surprised "oh!" Right: the same player in Mission 3, `HOOK` reawakens from the shelf, they grab it immediately and place it on the hooks panel in under 2 seconds with a confident slam. Text overlay: "the game remembered what I couldn't." 11 seconds. The reawakening animation does all the visual work.

---

## Recommendation

**Variation 6 ("The Lure") as primary, with Variation 1's shelf as the destination.** Auto-shelf after legitimate completion (no explicit player action required for distractors), but with learnable visual tells that fade across missions. The shelf provides visual continuity across sessions (shelved tokens return), and the reawakening animation creates a satisfying narrative beat.

Key parameters:
- **Mission 1:** 0 distractors (establish positive pattern)
- **Missions 2-3:** 1 distractor each (gentle introduction)
- **Missions 4-5:** 2 distractors each (scaled with higher token counts)
- **Missions 6-10:** 1-2 distractors (maintained to prevent complacency, tokens preview late-game or multiplayer/meta concepts)
- **Visual tells:** Present in M2-4, fading by M5, absent by M7
- **Auto-shelf timing:** 600ms after final legitimate placement fanfare begins
- **Shelf display:** Collapsed to badge when not receiving; expands for animation; shows return count
- **Replay:** All tokens pre-resolved (labels placed, distractors shelved), zero interaction required

---

## Discovered Aspects

- **5.00a-ix-a — Distractor token selection criteria:** Which future terms make good distractors? A term must be recognizably "a game concept" but unmatchable to current panels. How close can a distractor's semantics be to a real panel before it becomes genuinely confusing rather than productively misleading? The "near miss" distractor (e.g., `RELAY` as distractor when the channel panel exists) vs. the "far miss" distractor (e.g., `PRODUCTION QUEUE` when there's no factory).
- **5.00a-ix-b — Distractor-to-real conversion pacing:** The tempo of shelved tokens returning as real tokens. Should every shelved token return within 1-2 missions, or can some linger on the shelf for 4-5 missions? Long shelf residence builds anticipation but risks forgetting. Short residence reinforces the promise cycle but limits the preview window.
