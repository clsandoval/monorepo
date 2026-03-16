# 6.01a-iii-a — Damage State Persistence Across Retries

## The Question: Should the Board Remember Your Failures?

When a player retries the same mission, does the 8×8 grid start pristine — fresh canopy, clean neon, untouched obsidian — or does it carry scars from the previous attempt? This is the question of **cross-attempt persistence**: whether the battlefield becomes a palimpsest of failures, each retry layered over the ghosts of what came before.

The parent analysis (6.01a-iii) established five damage state options within a single battle. This analysis explores the temporal axis: what happens to those scars when the player hits EXECUTE again. It's a question that touches narrative identity ("you are an AI that remembers"), tutorial psychology (does visible failure help or hurt learning?), and aesthetic philosophy (is beauty in the pristine or the weathered?).

The answer isn't just about tiles. It's about what kind of relationship the player has with failure.

---

## The Design Spectrum: Five Persistence Models

### Option A: "Clean Slate" — Full Reset Every Retry

The board starts pristine every time. Tiles return to their undamaged state. The canopy regrows. The neon heals. The obsidian seals over. Each EXECUTE is a fresh beginning with zero visual history of what came before.

**The philosophy:** Each attempt is independent. The game respects the player's fresh start. No shame, no ghosts, no baggage.

**Comparable:** **Into the Breach** resets the grid completely between battles. The buildings repair. The terrain is clean. Each island is a fresh puzzle. The game never shows you the corpses of your previous timeline — narratively they exist (you time-traveled away from a dead world), but visually you never see them. **Celeste** similarly resets each screen to pristine on death — the game encourages perseverance, not rumination. The death counter exists in a menu, but the world itself never judges you.

**Strengths:**
- Maximum readability. Every retry starts from the same visual baseline. No "wait, was that crack already there or did I just cause it?"
- Zero cognitive overhead. The player only needs to read THIS battle's damage.
- Emotionally clean. No shame spiral. No evidence of previous failures staring you in the face.
- Simplest to implement — no cross-attempt state tracking.
- Matches Into the Breach's proven approach to tactical clarity.

**Weaknesses:**
- Misses a powerful narrative opportunity. Robot Uprising's diegetic conceit is that YOU are an AI — AIs remember. A board that forgets contradicts the player's identity.
- The sealed watch's emotional drama is diminished if the world resets. That devastating jungle deforestation from the previous attempt? Gone. The player can't mourn what the board doesn't remember.
- Loses the "haunted battlefield" aesthetic — the eerie beauty of old scars beneath new ones.
- No visual teaching feedback. A player who keeps fighting in the same corner won't SEE the pattern across retries.

---

### Option B: "Haunted Tiles" — Full Scar Persistence

Every scar from every previous attempt accumulates permanently. The board becomes a geological record of failure. Retry 1 leaves three cracked tiles. Retry 2 adds five more. By retry 7, the board is a devastated landscape of overlapping damage — torn canopy, shattered neon, exposed lava — and the player's fresh units walk onto a battlefield that looks like it's been through a war. Because it has.

**The philosophy:** The AI remembers everything. Every failure is data. The board is a physical memory palace where spatial patterns of defeat are written into the terrain itself.

**Comparable:** **Returnal** makes cross-death persistence a core narrative device. Selene finds her own corpses scattered across the planet — each one a monument to a previous failure. "These corpses also have messages for [Selene] left from other versions of her that have died, maybe thousands of times, or tens of times," explains narrative director Greg Louden. The corpses aren't just visual — they contain audio logs from alternate selves, some of whom have "evolved into something she doesn't want to become." The planet remembers EVERYTHING. **Dark Souls' bloodstains** show you (and other players) where death happened — red pools mark the floor, and touching them replays the final moments of the fallen player as a ghostly silhouette. The world is annotated by collective failure.

**Strengths:**
- Maximum narrative power. The AI remembers. The board IS the AI's memory. Walking onto a battle-scarred board on retry 5 FEELS like being an intelligence that has processed four failed strategies and is about to try a fifth.
- Emergent spatial analysis. If you keep losing scouts in the northeast corner across three retries, the northeast corner will be heavily scarred — a visible "danger zone" that teaches you to reconfigure without any explicit tutorial text.
- Incredible aesthetic potential. A Taal volcanic board after 6 retries: lava seeping through a web of cracks, the entire obsidian surface fractured, steam vents everywhere — the volcano OPENED because you kept fighting on it. A Palawan jungle board after 4 retries: the canopy is mostly gone, sunlight floods the forest floor, what was once a dense green tile set is now a bright clearing with charred stumps and fallen bamboo.
- TikTok goldmine. "My board after 12 retries" is an instantly shareable image. The accumulated devastation IS the content.
- Inspector time-lapse across retries: scrub through not just this battle but ALL battles on this board. A meta-timeline.

**Weaknesses:**
- **Readability catastrophe.** After 5+ retries with heavy combat, the board becomes unreadable. Which scars are from THIS attempt? Which are ghosts? A new player who retries Mission 2 ten times might face a board that looks like Mission 9's devastated aftermath, completely obscuring the simple tactical situation.
- **Shame amplification.** For anxious or struggling players, a heavily scarred board is a constant visual reminder of failure. "I did this. I ruined this place." This directly contradicts Robot Uprising's accessibility goal ("must be accessible to someone who's never played a strategy game").
- **Progressive confusion.** Damage from previous attempts interacts with damage from the current attempt in confusing ways. If a tile was already at "Single Scar" from retry 1, and combat happens there in retry 3, does it escalate to "Heavy"? Does Option C's progressive scarring even make sense across retries?
- **Stacking ambiguity.** How many retries' worth of damage can a tile accumulate before it's at maximum devastation? Is there a cap? If so, the cap creates a uniform "maximally scarred" board after enough retries, losing the spatial information.

---

### Option C: "Ghost Scars" — Translucent Previous-Attempt Overlay

The board starts pristine for each retry, but a translucent overlay shows where damage occurred in the PREVIOUS attempt. Ghost scars: 30% opacity versions of the damage sprites, rendered beneath the current attempt's pristine surface. They're visible if you look for them, invisible if you're focused on gameplay. Only the most recent attempt's ghosts are shown — not a cumulative history.

**The philosophy:** The AI remembers one step back. Short-term memory, not long-term. Enough to learn from the immediate past, not enough to be haunted by distant failures.

**Comparable:** **Super Meat Boy's** instant replay system shows ALL previous attempts simultaneously on level completion — dozens of Meat Boys running the same course, falling away one by one until only the successful run survives. The ghosts don't affect the current attempt, but they create a powerful visual of accumulated learning. Team Meat's Tommy Refenes described the inspiration: a modded SNES emulator called "Quantum Mario" that overlaid every attempt. He coded the feature in a weekend. The key insight: death replays were "constant positive feedback, and even death became something to enjoy when you knew that upon completing the level you would be rewarded with an epic showing of all your past deaths." Robot Uprising's ghost scars apply this principle to the STARTING state rather than the ending replay.

**Strengths:**
- Learning tool without punishment. "Last time, combat was heaviest here" is visible but not overwhelming.
- Clean readability for THIS attempt — ghost scars are always beneath current-attempt data.
- Narratively coherent: the AI has short-term context, not perfect recall. This mirrors the context window mechanic itself — limited memory, recent entries most vivid.
- Beautiful aesthetic: translucent damage beneath a pristine surface creates a layered, palimpsest look. A Siquijor tile where bioluminescence died in the previous attempt now shows a faint dark shadow beneath the restored glow — like a bruise beneath skin.
- Only one extra render layer (previous attempt's damage map at 30% opacity).

**Weaknesses:**
- Only one attempt back. A player who failed five times can only see the LAST failure's pattern, not the recurring pattern across all five.
- The 30% opacity ghost might be too subtle for casual players to notice, making the feature invisible.
- Or the opposite: attentive players might misread ghost scars as current-attempt damage, especially in fast sealed-watch moments.
- Doesn't scale to the "12 retries" scenario where the cumulative pattern is what matters.

---

### Option D: "The Super Meat Boy" — Post-Battle Multi-Attempt Overlay

The board starts pristine every retry. No ghosts, no scars during gameplay. But in the **Inspector** (post-battle debrief), a new tool appears after the second retry: "Attempt Overlay." Toggle it on, and translucent damage maps from ALL previous attempts layer over the current battle's timeline. Each attempt in a different opacity band (most recent = 80%, second = 50%, third = 30%, fourth+ = 15%). The Inspector becomes an archaeological tool for your own failure history.

**The philosophy:** Clean gameplay, rich analysis. Separate the emotional experience (sealed watch) from the analytical experience (Inspector). Let the player choose when to look at the ghosts.

**Comparable:** This takes **Super Meat Boy's** "all attempts replay" concept and applies it to spatial analysis rather than temporal replay. Where Super Meat Boy shows all attempts running simultaneously as a celebration of persistence, Robot Uprising would show all damage maps overlaid as a diagnostic tool. The key difference: Super Meat Boy's replay is a reward (you already succeeded), while Robot Uprising's overlay is a tool (you're still trying to succeed). This shifts the emotional valence from celebration to investigation.

**Strengths:**
- Zero readability impact during gameplay. Every attempt is clean.
- Maximum analytical power in the Inspector. Cross-attempt patterns become visible: "I keep losing scouts in the northeast across all four attempts — my scout config doesn't handle the enemy spawn pattern from that corner."
- Opt-in complexity. New players never see it. Veterans use it as a power tool.
- Emotional separation: sealed watch remains clean/emotional, Inspector becomes the analytical space for cross-attempt archaeology.
- Scales perfectly: 2 attempts or 20, the opacity gradient adapts.

**Weaknesses:**
- Completely misses the AESTHETIC opportunity. The board never LOOKS battle-worn. The "haunted tiles" visual — the eerie beauty of ghosts beneath the surface — only exists in the Inspector's overlay mode, not in the lived experience of the game.
- Higher implementation cost: storing N damage maps (one per attempt) and rendering them as composited overlays in the Inspector.
- The Inspector already has a lot of tools. Adding "Attempt Overlay" risks overwhelm. How many sidebar toggles is too many?
- No diegetic coherence: the AI supposedly remembers, but the battlefield shows no evidence of memory during active play.

---

### Option E: "The Fading Memory" — Decaying Cross-Attempt Persistence (RECOMMENDED)

The board carries scars from previous attempts, but those scars **fade** with each retry. The most recent attempt's scars are at full intensity. The attempt before that fades to 60%. Two attempts back fades to 30%. Three or more attempts back disappears entirely. The board has a **3-attempt rolling memory** — a short-term context window for battlefield damage.

On each retry, the current board state is: pristine + 30% ghosts from attempt N-2 + 60% ghosts from attempt N-1. Then new damage from THIS attempt renders at full intensity on top.

**The fading timeline:**

| Attempt | Damage from Attempt 1 | Damage from Attempt 2 | Damage from Attempt 3 | Damage from Attempt 4 |
|---------|----------------------|----------------------|----------------------|----------------------|
| Retry 1 | — | — | — | — |
| Retry 2 | 60% ghost | 100% current | — | — |
| Retry 3 | 30% ghost | 60% ghost | 100% current | — |
| Retry 4 | gone | 30% ghost | 60% ghost | 100% current |
| Retry 5 | gone | gone | 30% ghost | 60% ghost |

**The philosophy:** The AI has a context window for memory, just like its units. Recent experiences are vivid. Older ones fade. Eventually, they're evicted. The battlefield IS a context window — damage entries arrive, persist briefly, and are evicted by time. **The mechanic mirrors the game's core concept.**

**Per-biome fading aesthetic:**

| Biome | Full Damage (100%) | Fading (60%) | Ghost (30%) | Gone (0%) |
|-------|-------------------|-------------|------------|----------|
| **Ifugao Terraces** | Cracked stone, amber data-lights, drained water | Crack partially healed — thin scar visible. Water returns but slightly dimmer. Data-light back to green but pulse slightly irregular. | The faintest hairline in the stone — you have to look for it. Water fully restored. Data-lights normal except one pulses 5% slower than its neighbors. | Pristine. No trace. The terrace rebuilt itself. |
| **Siquijor Mystic** | Dead bioluminescence, cracked volcanic rock, grey coral | Bioluminescence returns but dimmer than neighbors — recovering, not recovered. Crack sealed but visible as a darker line. Coral has color but less shimmer. | A single bioluminescent organism pulses out of phase with its neighbors — not dead, just traumatized. Coral fully restored. Rock shows no crack. | Pristine. The island healed itself. Mystic energy restored. |
| **Palawan Jungle** | Canopy torn, bamboo broken, orchid gone, light shaft | Canopy growing back — the gap is smaller, new leaf growth (lighter green pixels) fills 40% of the hole. Bamboo stalk has a visible knot where it mended. Orchid hasn't returned yet. Light shaft narrower. | A patch of slightly lighter green where the canopy regrew — new growth, not old growth. Bamboo fully restored. A tiny bud where the orchid will eventually return — a warm pixel that's slightly different from the surrounding green. | Pristine. Full canopy. The jungle reclaimed everything. |
| **Cebu/Manila City** | Shattered neon, cracked concrete, exposed wiring, sparks | Neon repaired but with a visible splice — the line is continuous again but has a 1px bright point at the repair joint (like a soldered connection). Concrete crack filled but the fill is slightly lighter than surrounding concrete (like fresh patch). No sparks. Wiring covered. | The neon splice point is barely visible — a slightly brighter pixel in an otherwise smooth line. Concrete shows no fill. Everything looks normal unless you zoom in. | Pristine. Infrastructure fully rebuilt. Night market back to business. |
| **Taal Volcanic** | Lava seeping through cracks, steam vents, fractured obsidian | Obsidian reforming — the crack is narrower, lava glow reduced to a dim orange line (cooling). Steam vent still active but weaker (smaller white pixel, longer interval). | A slight discoloration in the obsidian where the crack was — darker than surrounding surface, like a vein of different mineral. No lava visible. No steam. | Pristine. The volcano surface is cold and smooth. |

**The regrowth animations matter.** When a retry begins and the board loads with fading scars, the tiles don't just APPEAR in their faded state — there's a brief (1.5 second) "board settling" animation where fresh damage from the previous attempt FADES before the player's eyes. Canopy gaps shrink. Neon splices themselves shut. Lava cools and obsidian re-seals. This animation IS the game telling you: "I remember what happened, but the world is healing."

**Strengths:**
- **The core mechanic IS the aesthetic.** Damage entries in a context window with limited capacity and temporal decay — that's literally the game's central concept applied to the board itself. The board's memory works like a unit's context window. The metaphor is perfectly self-referential.
- **Maximum beauty.** Fading scars are visually stunning. A jungle tile with three layers — 30% ghost light shaft beneath 60% regrowing canopy beneath 100% current pristine surface — looks like a forest with geological memory. An archaeological cross-section of conflict.
- **Self-limiting readability cost.** The 3-attempt rolling window means even a 20-retry mission never accumulates more than 3 layers of damage. The worst case is pristine + 30% ghosts + 60% ghosts + 100% current = 4 layers, heavily weighted toward the present.
- **Emotional arc.** Early retries: clean board, fresh start. After 3 retries: the board starts showing wear. The fading scars create a subtle pressure — "I've been here before, the terrain knows it" — without the shame of full persistence. The healing animations on board load are a tiny moment of hope: the world is forgiving you.
- **Diegetic coherence.** The boot log narrative ("you are an AI reading your own spec sheet") implies memory. An AI that forgets its failures completely (Option A) is lobotomized. An AI that remembers everything forever (Option B) is traumatized. An AI with a fading rolling context window? That's HEALTHY. That's the game telling you: memory is a design choice, and the right amount of memory is enough to learn but not enough to drown.
- **Inspector integration.** The Attempt Overlay tool from Option D still works here — the Inspector shows the full damage map history. But the BOARD itself also carries fading memory, so there's a visual bridge between the lived experience and the analytical tool.
- **Teaching through spatial memory.** If you lose scouts in the northeast corner three times running, that corner will have the heaviest scar accumulation (3 layers, all in the same area). The spatial pattern teaches you to reconfigure without explicit feedback.

**Weaknesses:**
- Most complex implementation. Three damage maps stored and composited: current + previous + two-back. Per-tile state tracking across attempts. Fading animation on board load.
- The fading aesthetic requires additional tile sprites: not just "damaged" and "pristine" but "60% recovered" and "30% recovered" per biome. That's 5 biomes × 3 fade levels = 15 intermediate sprites (though many can be generated by alpha-blending the damaged sprite with the pristine sprite).
- The regrowth animation on board load adds 1.5 seconds to the retry flow. For a player who's failed 10 times and is impatient, 1.5 seconds of "watching the board heal" before each attempt might feel like delay. **Mitigation:** Make the animation skippable with any key press, snapping instantly to the final faded state.
- New players might not understand what the faint ghosts are. "Why does this tile look slightly different?" First-time-encountering tooltip needed.

---

## Interaction Effects

### With the Inspector (4.xx)

The Inspector should display a **"Retry History"** panel when analyzing a mission the player has attempted multiple times:

- **Attempt selector:** A row of numbered attempt icons (1, 2, 3...) in the sidebar. Click one to scrub through THAT attempt's battle. The current attempt is highlighted gold. Previous attempts are progressively dimmer.
- **Damage accumulation view:** Toggle that composites all attempts' damage maps with the same opacity gradient as the board itself. Shows where fighting is CONSISTENTLY dense across retries — the "hot zones" that persist regardless of configuration changes.
- **Configuration diff:** Between attempt selectors, show a small diff indicator — what the player changed between attempts. "Attempt 2 → 3: added filter to Scout-A, changed channel from recon-net to priority-alert." This connects spatial patterns (damage moved from northeast to center) with configuration changes (because you redirected your scouts).

### With the Sealed Watch

During the sealed watch, fading ghost scars from previous attempts are visible but suppressed during active moments:
- **At tick 0:** Ghost scars most visible (the board is calm, no new damage yet). The player has a moment to read the history before action starts.
- **During combat:** Ghost scars dim further (to 15% / 10%) so current-attempt damage is unambiguous.
- **Post-combat settling:** Ghost scars return to normal opacity as the board calms between engagements.

This "breathing" opacity creates a subtle temporal rhythm: history surfaces in quiet moments, submerges during active play.

### With the Campaign Map

If the campaign map shows mission status (completed, available, locked), missions that took many retries could show a subtle visual indicator — the province on the archipelago map has faint scar marks proportional to retry count. Ifugao province, which took you 8 retries, has visible battle scars on its map icon. Palawan, which you aced first try, is pristine. The campaign map becomes a meta-level damage persistence display — a map of your struggles across the entire archipelago.

### With the Boot Log Narrative

The boot log for a retried mission could acknowledge the fading memory:

```
> LOADING BATTLEFIELD: IFUGAO TERRACES
> ...detecting terrain anomalies.
> ...3 tiles show sub-surface damage consistent with prior engagement(s).
> CLASSIFICATION: residual combat scarring. Within acceptable parameters.
> RECOMMENDATION: terrain stable for re-engagement. Historical data available.
> EXECUTE when ready.
```

This diegetic acknowledgment — the AI noticing its own battlefield scars — reinforces the memory metaphor without breaking the fourth wall.

### With the "Invisible Randomization" System

Each EXECUTE varies within constraints (locked decision). Fading scars from previous attempts interact interestingly with this: the board looks slightly different each retry (ghost scars from previous combat in different positions due to randomized unit behavior), which visually communicates that "this isn't the same battle" even though the mission parameters are identical. The ghosts are in different places because the previous attempt played out differently.

---

## Player Journeys

### Journey: Sofia, 28, UX Designer, First Strategy Game

**Context:** Mission 3 (Siquijor Mystic Island). Sofia has failed this mission twice. Her scout keeps getting eliminated by an enemy striker that approaches from the east. She's about to retry for the third time with a modified hook configuration.

**Minute 0:00 — The Board Loads**
Sofia hits EXECUTE. The 8×8 Siquijor board materializes. Volcanic rock, bioluminescent organisms, coral accents. But it's not pristine — not quite. She notices it immediately: tile F6, where her scout died last attempt, has a single bioluminescent organism that pulses out of rhythm with its neighbors. Not dead — just... off. And at D5, where her scout died TWO attempts ago, there's a patch of rock that's slightly darker than the rest — a vein of different mineral, barely visible, like a healed wound.

The board loaded with a 1.5-second settling animation: she saw the coral on F6 shimmer back to full color, the crack in the volcanic rock seal itself shut, the bioluminescence flicker back to life. But the ghost remains: one organism still out of rhythm. The board healed, but not completely.

Sofia's thought: "That's where it keeps happening." She hasn't opened any analytical tools. She hasn't read any debrief stats. The TILE told her.

**Minute 0:10 — Playing Over Ghosts**
Tick 1. Her scout spawns at B3 and begins patrolling eastward. It crosses D5 — the tile with the faint dark vein from two attempts ago. Sofia feels a tiny pang: "that's where I lost one before." The scout moves on. The ghost scar is beneath it, irrelevant to gameplay, but emotionally present.

Tick 4. The scout reaches E6, one tile west of last attempt's fatal F6. Sofia watches the context bar carefully. The ghost scar on F6 is visible in her peripheral vision — the out-of-rhythm bioluminescence is a subtle beacon saying "danger was HERE." This time, her modified hook fires: the scout broadcasts "threat-alert" before moving to F6. Her striker, configured with a new rule, begins moving east.

**Minute 0:25 — New Damage Over Old**
Tick 7. Combat at F6 — but this time, it's Sofia's striker eliminating the enemy. The red flash fires. The tile damages. But here's the layered moment: the NEW damage (full intensity — dead bioluminescence, cracked rock) lands on a tile that ALREADY had a ghost scar (one out-of-rhythm organism from the previous attempt). The ghost scar is obliterated by the new, full-intensity damage. The old wound is buried beneath the new mark.

Sofia doesn't consciously process this, but she FEELS it: this tile has been fought over before. She won this time. The new scar overwrites the ghost.

**Minute 0:45 — Victory and the Inspector**
Sofia wins. In the Inspector, she scrubs back to tick 0 and enables the "Retry History" overlay. Three attempts visualized: attempt 1's damage map (very faint, 30%) concentrated at D4-D5. Attempt 2's damage map (60%) concentrated at E5-F6. Attempt 3's damage map (100%, current) concentrated at F6-G6 — but this time, it's HER kills, not the enemy's. The damage pattern MIGRATED eastward across three attempts as she improved her configuration. She can SEE her learning arc in the spatial pattern of scars.

**What she learned:** The ghost scars gave her free spatial information — "danger zone is east" — without any text, overlay, or tutorial. The fading memory felt natural, like the island was alive and healing. She never felt ashamed of the ghosts; they were data, not judgment.

**UI Annotations:**
- Ghost scar (30%): single darker pixel vein in volcanic rock, barely visible at normal zoom
- Ghost scar (60%): one bioluminescent organism pulsing 15% slower than neighbors, plus faint rock discoloration
- Board settling animation: 1.5s of coral re-shimmering, cracks sealing, bioluminescence restoring
- Retry History overlay in Inspector: numbered attempt selector (1, 2, 3), opacity-weighted damage composites
- Configuration diff between attempts: small text label "Changed: hook on Scout-A (recon-net → threat-alert)"

---

### Journey: Marcus, 34, Software Engineer, Factorio Veteran (800 hours)

**Context:** Mission 7 (Cebu Urban). Marcus has failed this mission 6 times. He's been iterating on his Command agent's prioritize/reroute configuration. This is attempt 7.

**Minute 0:00 — Reading the Palimpsest**
The Cebu city board loads. Marcus watches the settling animation with practiced eyes. He's failed this mission enough times that he knows what to look for. The board shows:

- **Attempt 5 ghosts (30%):** A faint neon splice at B7. A barely visible concrete patch at C8. Almost invisible — Marcus wouldn't see them if he didn't know to look.
- **Attempt 6 ghosts (60%):** Clearer damage. Neon at D4 and E4 has visible splice points — the lines are continuous but bright at the repair joints. The concrete at D5 shows a lighter patch. Sparks long gone, wiring covered, but the REPAIRS are visible.

Marcus reads this instantly: "Attempt 5, I was fighting in the northwest. Attempt 6, I was fighting in the center. Neither worked." He's been iterating his signal routing. The ghost scars tell him his defense keeps collapsing in different places depending on his configuration — the problem isn't WHERE the fighting happens, it's that his architecture doesn't adapt to WHERE the enemy pushes.

This is a Factorio insight. In Factorio, when your factory keeps backing up at different points, the problem isn't any specific belt — it's the ratio. Marcus thinks: "I need to fix the ratio, not the location." He opens his Command agent's config and adjusts the reroute priorities to be REACTIVE rather than positional.

**Minute 0:20 — The Clean Center**
Tick 10. Something different happens this attempt: his adaptive reroute works. The enemy pushes from the east, and his Command agent reroutes two strikers to meet them. Combat at G4 and G5 — new territory. These tiles have NO ghost scars. They're pristine city tiles taking their first damage. The contrast is stark: the center of the board (D4-E5) has fading ghost scars from attempt 6 but no new damage. The east edge (G4-G5) has fresh damage but no ghosts.

Marcus reads it: "My defense adapted. The center didn't collapse this time. The fighting moved to where I sent reinforcements." The ghost scars are a BASELINE that makes new damage patterns meaningful by contrast.

**Minute 0:50 — Victory**
Marcus wins on attempt 7. In the Inspector, he enables Retry History and scrubs through all 7 attempts. The damage patterns tell a story:

- Attempts 1-2: Damage concentrated at his base (A1-B2). He was losing before his factory even produced anything. Ghost scars LONG GONE — more than 3 attempts back.
- Attempts 3-4: Damage shifts to the center. He fixed production but his routing was static. Also gone from the board but visible in the Inspector.
- Attempts 5-6: Damage more distributed but still center-heavy. The ghost scars still visible on the current board.
- Attempt 7: Damage at the ENEMY's position (G4-G5). He brought the fight to them.

The seven-attempt damage migration IS a learning arc rendered in spatial data. Marcus screenshots the Inspector overlay and posts it to Discord with the caption: "6 failed configs → adaptive rerouting. The scars tell the story."

**What he learned:** The 3-attempt rolling window was the perfect memory depth for his iterative debugging process. It showed him "what changed recently" without overwhelming him with ancient history. The Inspector's full history filled in the rest when he wanted to reflect.

**UI Annotations:**
- 30% ghost neon splice: 1px bright point at repair joint, only visible against dark concrete
- 60% ghost concrete patch: 2px area of slightly lighter grey (#4A4A4A vs. surrounding #3A3A3A)
- Board settling animation: neon splice lines sliding shut (1.5s), concrete patches smoothing
- Inspector Retry History: 7 attempt selectors, attempts 1-4 very faint (all beyond 3-attempt window), 5-7 progressively brighter
- Configuration diff labels: "Attempt 6→7: Changed reroute from STATIC to ADAPTIVE-EAST, added reactive priority rule #3"

---

### Journey: Kai, 16, Twitch Streamer, Into the Breach Fan

**Context:** Mission 9 (Mindanao Jungle). Kai has been streaming this mission for 45 minutes. He's on attempt 4. His chat has been helping him iterate. The jungle has been through three wars.

**Minute 0:00 — "Chat, Look at This Board"**
The Mindanao jungle loads. Kai immediately pans the camera to the center of the board and zooms in. "Chat, LOOK." The board is beautiful and haunted:

Tiles D4-E5 (center) show 60% ghost scars from attempt 3 — canopy regrowing but still thin, with lighter green new-growth patches filling gaps. The bamboo has mended but you can see the knots. The orchid buds are there but haven't bloomed yet.

Tiles B6-C7 (northwest) show 30% ghost scars from attempt 2 — a barely perceptible patch of lighter canopy. The jungle has almost fully healed. Almost.

And BEHIND the 60% scars on D4, if you look very carefully, there's a shadow of 30% scars from attempt 2 (which ALSO had combat at D4). Two layers of ghosts, offset by time. The tile at D4 has been a battlefield three times. It shows: a faint scar (attempt 2), a recovering wound (attempt 3), and fresh, pristine canopy on top (ready for attempt 4's new damage).

Chat: "D4 has PTSD" / "that tile has seen things" / "poor tree 😢" / "THE JUNGLE REMEMBERS"

**Minute 0:15 — Healing in Real Time**
The board settling animation plays. Kai's viewers watch the canopy regrow in fast-forward: gap edges creep inward, lighter green pixels fill the wounds, bamboo knots form as stalks mend. "It's like a nature documentary in reverse," Kai says. "The jungle is healing from my failures. That's kinda beautiful."

One viewer: "the game treats your losses like natural disasters and the biome recovers like after a typhoon 🌀"

Kai lets the animation complete. The board is scarred but hopeful. New growth over old wounds.

**Minute 0:30 — Choosing Where to Fight**
Tick 5. Kai makes a deliberate tactical choice informed by the ghost scars: he routes his scouts AWAY from the center (D4-E5, heavily scarred from previous attempts) and toward the south (B2-C3, pristine). "Chat, I'm not fighting in the PTSD zone this time. Fresh tiles only."

This is ghost scars actively influencing strategy. Not through any gameplay mechanic — the scars are purely visual — but through PSYCHOLOGY. Kai associates the scarred area with failure and avoids it. His new configuration routes units south, and the enemy meets them on pristine jungle tiles. New damage on fresh ground.

Chat: "AVOIDANCE BEHAVIOR" / "the tiles trained him" / "Pavlov's gamer"

**Minute 1:00 — The Comparison Clip**
Kai wins. He immediately opens the Inspector and toggles Retry History. Four damage maps overlay. He slow-pans across the board with increasing opacity:

Attempt 1: heavy damage at his base (southeast). Attempt 2: damage migrated northwest. Attempt 3: damage concentrated center. Attempt 4: damage at the south edge — clean, efficient, no center engagement.

He records a 15-second clip: the four damage maps fading in one by one, showing the SPATIAL EVOLUTION of his strategy across four attempts. "Every attempt, I fought in a different place. The BOARD shows you where you got smarter." The clip goes on TikTok with the caption "this game's map remembers your failures and grows back 🌿"

**What he learned:** The ghost scars became CONTENT. His viewers could follow his learning arc through the visual state of the board. The healing animation was a moment of shared beauty. The fading memory gave him just enough history to learn from without making the board unplayable.

**UI Annotations:**
- 60% jungle ghost: lighter green new-growth pixels (#6FCF97 vs. normal #52B788), bamboo knot (1px darker ring at stalk midpoint), orchid bud (0.5px warm pixel, smaller than full orchid)
- 30% jungle ghost: barely perceptible canopy shade difference, only visible when directly compared to fully pristine adjacent tile
- Board settling animation for jungle: canopy gaps closing (edges creep inward 1px/0.3s), leaf clusters expanding, bamboo knot forming (dark ring appears and lightens), orchid bud emerging (warm pixel fades in)
- Inspector 4-attempt overlay: four damage maps with opacity gradient (15%, 30%, 60%, 100%), slow-crossfade between attempts using attempt selector

---

### Journey: Amara, 55, Retired Teacher, Accessibility Needs (Low Vision)

**Context:** Mission 2 (Ifugao Terraces). Amara plays at 150% zoom with high-contrast mode enabled. She's retrying for the second time.

**Minute 0:00 — Can She See the Ghosts?**
The board loads. At 150% zoom, each tile fills significantly more screen space. The ghost scars from attempt 1 are visible at this zoom level — the amber data-light at E5 is clear, and the hairline crack in the terrace stone is readable.

But what about in high-contrast mode? In high-contrast mode, tile damage uses **shape markers** in addition to color changes (established in 6.01a-v accessibility tile variants): a small diamond overlay marker (◇) appears on tiles with ghost scars. The marker is 30% opacity for ghost scars and 100% for current-attempt damage. Amara can distinguish "this tile was damaged before" (faint diamond) from "this tile was just damaged" (bright diamond) without reading any subtle pixel-level detail.

**Minute 0:10 — Ghost Scar Tooltip**
Amara hovers over the faint diamond at E5. A tooltip appears (300ms delay, large text at her accessibility setting): "Previous attempt: combat occurred here (Tick 6). Unit lost: Scout-A." The tooltip connects the ghost scar to specific information. For Amara, who can't reliably read the subtle pixel differences, the tooltip IS the ghost scar system.

**Minute 0:40 — The Healing Is Audible**
When the board settled at load time, the healing animation was accompanied by a soft audio cue — a gentle ascending chime (matching the terrace biome's water/kulintang palette) that plays as damaged tiles restore. For Amara, this audio is how she knows the board has ghost scars: the chime plays. If the board were pristine, silence. The sound of healing tells her that damage existed and was partially repaired.

**What she learned:** The ghost scar system is accessible through three channels: visual (diamond markers at adjustable opacity), informational (hover tooltips with specific data), and auditory (healing chime on board load). Low-vision players get the same strategic information as full-vision players, just through different channels.

**UI Annotations:**
- High-contrast ghost scar marker: ◇ diamond, 4px, white outline, 30% opacity for ghost/60% for fading/100% for current
- Ghost scar tooltip: "Previous attempt: combat occurred here (Tick N). Unit lost: [name]." 14pt minimum at accessibility setting.
- Board settling audio: ascending kulintang chime (one note per healing tile, spread over 1.5s), biome-specific timbre
- Screen reader announcement on board load: "Board loaded with 2 ghost scars from previous attempts at tiles E5 and D4."

---

## The TikTok Clip

**The clip that sells this feature:** Split-screen time-lapse. Left side: a Palawan jungle board across 5 retries. The board starts pristine, accumulates damage, heals, accumulates again, heals, accumulates again. Each retry is a 2-second compressed visualization. The jungle tears and regrows, tears and regrows — a breathing cycle of destruction and renewal. By retry 5, the board is mostly healed but carries the faintest shadows of four previous wars — barely visible new-growth patches, a bamboo knot here, a missing orchid there. Right side: the player's final configuration — the one that won. The visual message: "five attempts to get this right, and the jungle remembers all of them." Caption: "this game's battlefield heals between your failures 🌿💀🌿"

---

## Recommendation

**Option E: "The Fading Memory"** is the strongest choice for Robot Uprising because it's the only option that **IS the game's core mechanic applied to the game's visual layer.** The context window metaphor — fixed capacity, temporal decay, eviction of old entries — maps perfectly to the 3-attempt rolling memory of battlefield damage. The board doesn't just SHOW the player what happened; it MODELS the same information architecture the player is learning to design.

This self-referential coherence is rare in game design. When the board heals from your previous failures using the same decay logic your agents use for their context windows, the game is teaching you its own mechanics through its aesthetics. It's the deepest possible integration of theme, mechanic, and art direction.

For implementation priority:
1. **Ship with Option A (Clean Slate)** for the first playable — zero implementation cost.
2. **Upgrade to Option E (Fading Memory)** as a post-first-playable polish feature.
3. **Add Option D (Super Meat Boy Inspector overlay)** as an Inspector enhancement in the same pass.

---

## New Aspects Discovered

- **6.01a-iii-a-i — Ghost scar visual vocabulary per biome:** Full pixel-level specification of 60% and 30% recovery states for all five biomes — the intermediate sprites between "damaged" and "pristine" that show partial healing (regrown canopy, sealed cracks, recovering bioluminescence).
- **6.01a-iii-a-ii — Board settling animation as micro-narrative:** The 1.5-second healing animation on retry. Per-biome regrowth choreography: what heals first, what heals last, what the audio accompaniment sounds like. The animation as a designed emotional beat — "the world forgives you."
- **6.01a-iii-a-iii — Campaign map meta-persistence:** Should the campaign map's province icons show damage proportional to retry count? Ifugao (8 retries) showing battle scars vs. Palawan (first try) pristine. The archipelago as a meta-damage map of the player's entire campaign struggle.
- **6.01a-iii-a-iv — Ghost scar interaction with invisible randomization:** Since each EXECUTE varies within constraints, ghost scars from the previous attempt are positioned where combat happened in THAT specific run. The ghost pattern doesn't match the new run's enemy behavior. How does the player process "damage was HERE last time but the enemy came from THERE this time"? The ghosts as misleading vs. useful data.
- **6.01a-iii-a-v — "Memory depth" as player-configurable setting:** Should the player be able to control how many attempts the board remembers (0 = clean slate, 1 = most recent only, 3 = default, ∞ = full persistence)? Context window depth as a meta-setting for the board itself. Interaction with the accessibility system.
