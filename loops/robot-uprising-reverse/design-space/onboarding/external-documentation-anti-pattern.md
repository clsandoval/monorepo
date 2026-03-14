# Onboarding: The External-Documentation Anti-Pattern

**Aspect ID:** 5.00
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 1.01 (Shenzhen I/O), 1.04 (EXAPUNKS), 1.04b (diegetic tutorial documents), 5.01 (tutorial as puzzle), 5.02 (tutorial as narrative), 5.03 (tutorial as sandbox), 5.04 (complexity ramp), 3.14 (workbench layout)

---

## The Problem

Shenzhen I/O ships a 30-page PDF manual. The game does not explain itself. The manual is a separate file you open outside the game window — or print, three-hole-punch, and place in a binder beside your monitor. For a specific audience (engineers who enjoy the simulation of real technical work), this is a feature. For everyone else, it is the reason they bounced within 20 minutes.

The external-documentation anti-pattern occurs when a game's core vocabulary — the words, concepts, and mental models the player needs to make meaningful decisions — lives outside the game client. The player must alt-tab, print, Google, or watch a YouTube tutorial to understand what the game is asking them to do. The game's own interface is insufficient for learning.

Robot Uprising has **four primitives** (skills, rules, hooks, context config) and a **vocabulary of ~30 terms** (buffer, slot, eviction, channel, signal, latency, perception radius, hook slot, condition→action pair, listen/ignore filter, etc.). This vocabulary is deliberately 1:1 with real agentic AI engineering. The game's educational thesis depends on the player internalizing these terms as meaningful concepts, not memorizing button labels.

**The constraint:** All 30 terms must be learnable through play. No PDF. No external wiki. No "read the manual" requirement. The game must be its own teacher — but it must also avoid the opposite anti-pattern: tooltip hell, where every interaction is interrupted by a popup explaining what just happened.

---

## The Spectrum: From External Manual to Zero-Text

The design space for how a game teaches its vocabulary exists on a spectrum. Every comparable game sits somewhere on it. Understanding the spectrum is necessary before designing Robot Uprising's position.

### Position 1: The Full External Manual (Shenzhen I/O, TIS-100)

The game provides a separate document (PDF, physical booklet, in-game overlay of a document) that contains all vocabulary definitions, reference tables, and worked examples. The player is expected to read it before or during play.

**What it achieves:** Authority. Completeness. Reference-ability. The manual is always correct, always available, always comprehensive. There is no ambiguity about what `teq` does — it's on page 14.

**What it costs:** The player must leave the game to learn the game. Alt-tabbing breaks flow state. Players who don't read the manual are lost. Players who skim the manual miss critical details and blame the game. The manual creates a binary population: those who read it (who find the game elegant) and those who didn't (who find the game incomprehensible). Community reports for Shenzhen I/O suggest ~26 hours of solitaire played to avoid reading the PDF — players would rather brute-force patterns than engage with text.

**The Zachtronics defense:** The manual IS the game. Reading datasheets IS what an electronics engineer does. The manual simulates the work. This defense is valid for Shenzhen I/O's target audience (engineers who enjoy that simulation). It does not apply to Robot Uprising, whose target audience includes "someone who's never played a strategy game."

### Position 2: The Diegetic Document (EXAPUNKS, TUNIC)

The manual exists inside the game's fiction as an in-universe artifact. EXAPUNKS' Trash World News is a hacker zine. TUNIC's instruction manual is a collectible item with illustrations in an unreadable constructed language. The document teaches while worldbuilding.

**What it achieves:** The immersion multiplier. Reading the tutorial IS entering the fiction. The player cannot separate "learning mechanics" from "experiencing the world." EXAPUNKS players post photos of their printed zines on Reddit as a recurring community ritual. The tutorial becomes a community artifact.

**What it costs:** Still requires reading. Still requires leaving the immediate game flow to consult a document (even if the document is in-game, it's a different screen). TUNIC's manual is genuinely hard to parse — its constructed language is intentionally opaque, creating a meta-puzzle that delights some players and frustrates others. EXAPUNKS' TWN is "harder to reference than Shenzhen I/O's manual but far more fun to read" (PC Gamer).

**The TUNIC insight:** Andrew Shouldice designed TUNIC's manual so that "a full-screen tutorial popup feels deeply invasive and can ruin any sense of wonder, but getting to study a mysterious page feels like mystery-solving." Knowledge as the key mechanic — doors are locked not behind keys or abilities, but behind knowledge. The manual has "no mechanical power, only informational power." TUNIC proves that you can teach a complex game through a document IF the document itself is a game.

### Position 3: The Integrated Reference (Civilization, Stellaris)

The game has an in-game encyclopedia, Civilopedia-style, accessible from any screen via a hotkey or icon. It contains all vocabulary definitions and mechanical details. The player never leaves the game client but does leave the current game screen to look things up.

**What it achieves:** Zero alt-tab friction. The reference is always one click away. It can be context-sensitive (clicking a term anywhere opens its encyclopedia entry). It can be searchable. It updates as the game updates.

**What it costs:** Nobody reads encyclopedias for fun. The Civilopedia is a reference, not a tutorial. It answers "what does this do?" but not "why would I use this?" or "how does this combine with that?" Players consult it reactively (after confusion) rather than proactively (before experimentation). The reference exists but doesn't teach.

### Position 4: The Contextual Tooltip (Most modern games)

Hover over anything and a tooltip appears. First encounter with a mechanic triggers a brief popup. Loading screens contain tips. The game explains itself in micro-doses at the moment of relevance.

**What it achieves:** Zero-friction learning at the point of need. The player never has to go looking for information — it appears when relevant. Modern players expect this. Its absence feels like a bug.

**What it costs:** Tooltip fatigue. When everything has a tooltip, nothing is memorable. The player reads "Buffer: stores observations your agent has collected" and immediately forgets it because the knowledge has no experiential anchor. Tooltips teach definitions but not understanding. They answer "what" but not "why" or "when." At 30 terms, tooltip density becomes oppressive — every element of the workbench has a popup, and the player is drowning in text that all looks the same.

**The Burden of Knowledge problem (Zileas/Riot Games):** A mechanic creates gameplay only if the player understands it. When the understanding requires external research, you've created a "burden of knowledge" — a design anti-pattern where the victim of a mechanic has no way of knowing what's happening unless they read a wiki. Good "salesmanship" (particles, sound, visual feedback) reduces burden but doesn't eliminate it.

### Position 5: The Implicit Tutorial (Portal, Baba Is You, Into the Breach)

The game teaches through level design, environmental storytelling, and mechanical discovery. No text explains what a portal does — you walk through one and appear somewhere else. No text explains that rules in Baba Is You are pushable — you push one and the world changes. No text explains that Into the Breach enemies telegraph their attacks — you see the red squares and learn what they mean by watching what happens.

**What it achieves:** The deepest possible learning. Knowledge gained through action is retained better than knowledge gained through reading. The player understands portals not as a definition ("a spatial displacement device") but as a felt experience ("I went in here and came out there"). The learning is embodied, not verbal.

**What it costs:** The game must be designed so that EVERY concept can be discovered through interaction. This is possible for games with 3-5 core concepts (portal mechanics, push mechanics, attack telegraphing). It becomes exponentially harder as vocabulary grows. Robot Uprising has ~30 terms across 4 primitives — pure implicit teaching requires 30+ carefully sequenced discovery moments, each building on the last. The complexity ramp becomes a 10-mission campaign.

**Into the Breach's critical insight (Justin Ma):** "It was so complex to describe some of these weapons. We'd watch a playtester investigate a weapon and they'd just be like, 'What' after reading three sentences and still didn't get it. You could type out a hundred times, 'Damages a tile and pushes adjacent tiles,' but showing that little animation of them moving is a thousand times more effective." Showing beats telling. Always. Without exception.

### Position 6: The Zero-Text System (Journey, Hyper Light Drifter)

The game contains no readable text at all (or uses constructed/fictional scripts). All communication is visual, audio, and spatial. The player learns everything from what they see and what happens.

**What it achieves:** Universal accessibility (no language barrier). Pure immersion (no fiction-breaking text). The game becomes a visual language that anyone can read.

**What it costs:** Precision is impossible. You cannot communicate "buffer eviction priority: FIFO vs. LRU" through animation alone. Complex systems with configurable parameters require SOME text. Robot Uprising's workbench is fundamentally a configuration interface — the player sets values, names channels, writes condition→action rules. Some text is irreducible.

---

## Robot Uprising's Position: The "Hands Before Head" Principle

Robot Uprising cannot be Position 1 (external manual) because it must be accessible to someone who's never played a strategy game. It cannot be Position 6 (zero text) because the workbench requires precise configuration vocabulary. It sits between Position 4 and Position 5: **implicit discovery backed by contextual reference, with diegetic flavor on top.**

The design principle: **Hands before head.** The player always DOES something before they READ about it. Every concept in Robot Uprising's vocabulary is first experienced as a physical interaction with visible consequences, then optionally explained in text. The text confirms and names what the player already felt.

### The Three-Layer Teaching Architecture

**Layer 1: The Experiential Foundation (Position 5 — Implicit)**

Every new concept is introduced through a mission where the concept's ABSENCE causes visible failure, and the concept's PRESENCE causes visible success. The player doesn't read about buffers — they see an agent with a full buffer making bad decisions, drag noise out, and watch the agent snap to clarity. The player doesn't read about hooks — they see two agents that can't coordinate, wire a hook between them, and watch information flow. The player doesn't read about eviction policies — they watch a buffer overflow lose the critical signal, then change the eviction setting and watch it survive.

This is what the filter puzzle tutorial (5.01) already achieves for buffer concepts. The principle extends to ALL 30 terms. Every term has a "first encounter" mission moment where the concept is experienced before it is named.

**Layer 2: The Naming Moment (Position 4 — Contextual)**

After the player has experienced a concept, the game names it. Not before. Not during. After. The naming happens in one of three ways:

1. **Boot log narration** (locked narrative): The AI's self-documenting initialization log names the concept the player just used. "SUBSYSTEM ONLINE: Hook protocol initialized. Agents can now transmit signals to named channels. You already did this — you wired SCOUT-1 to RELAY-A on channel 'east_flank'. That's a hook." The boot log speaks in second person, acknowledging what the player did and giving it a name.

2. **Workbench label appearance**: The first time a concept is used, its label in the workbench UI fades in from transparent to opaque. Before the player has encountered hooks, the hook section of the blueprint editor is a dimmed, unlabeled region. After the mission where hooks are introduced, the label "HOOKS" materializes — a soft glow, a quiet ping, the text crystallizing from static into readable letters. The word appears because the player earned it.

3. **Inspector annotation**: In the post-mission debrief, the inspector annotates the replay with the new term. "Tick 12: SCOUT-1's **hook** fires on channel 'east_flank'. The signal arrives at RELAY-A's **buffer** on Tick 13 — that's the 1-tick **latency** from hook transmission." The annotation uses the term in context, grounded in the specific events the player just watched.

**Layer 3: The Living Reference (Position 3 — Integrated)**

After a concept has been experienced (Layer 1) and named (Layer 2), it enters the game's living reference — an in-game glossary that builds incrementally as the player progresses. This is not a Civilopedia available from mission 1. It is an accreting document (like Outer Wilds' Ship Log) that fills in as the player encounters concepts.

The glossary is accessible from any screen via a single keypress (Tab or F1). Each entry contains:
- The term name
- A one-sentence definition
- A "You first encountered this in Mission N" callback
- A mechanical reference (exact numbers, formulas, interactions)
- A visual thumbnail (the animation or icon associated with this concept)

The glossary entry for "Hook" doesn't appear until the player has used a hook. When it does appear, it contains a miniature replay clip of the exact moment the player first wired a hook — their own gameplay, captured as a personal teaching artifact.

### Why This Architecture Avoids the Anti-Pattern

The anti-pattern is: the player needs knowledge they don't have, and the game doesn't provide it through play. The three-layer architecture ensures:

1. **No concept is needed before it is experienced.** The campaign's mission arc (locked: Missions 1-4 teach context, rules, hooks, skills sequentially) guarantees that the player encounters each concept through play before needing to configure it.

2. **No text is needed before it is grounded.** Every tooltip, label, and glossary entry appears AFTER the player has physically interacted with the concept it describes. The text confirms, it doesn't introduce.

3. **No alt-tab is ever required.** The living reference is one keypress away, in-game, context-sensitive. The boot log is in-game narrative. The workbench labels are part of the interface. Nothing lives outside the client.

4. **The reference exists for those who want it.** Veterans and re-players can access full mechanical details without replaying tutorials. The glossary doesn't gate information — it just gates WHEN terms first appear. After a term appears, its entry is always available.

---

## The 30-Term Vocabulary Curriculum

Robot Uprising's full vocabulary, sequenced by first-encounter mission:

### Mission 1: Wake (Buffer Basics)
| Term | First Experience | Naming Moment |
|------|-----------------|---------------|
| **Buffer** | See agent's memory as a column of slots | Boot log: "MEMORY SUBSYSTEM ONLINE: Each agent has a buffer — a fixed-size working memory." |
| **Slot** | See individual cards in the buffer | Workbench label: numbered slot indicators materialize |
| **Observation** | Read buffer card contents (position reports, environment data) | Inspector annotation: "These are observations — what the agent has noticed." |
| **Noise** | Drag out irrelevant observations, watch agent improve | Boot log: "Not all observations are useful. Some are noise." |

### Mission 2: Focus (Buffer Depth)
| Term | First Experience | Naming Moment |
|------|-----------------|---------------|
| **Buffer size** | See that different agents have different slot counts | Workbench: buffer size number appears in blueprint editor |
| **Confidence** | See that some observations have stronger/weaker indicators | Inspector: "Observation confidence — how reliable this data point is." |
| **Staleness** | See that older observations have dimmer borders | Inspector: "Signal age — how many ticks since this was observed." |
| **Eviction** | Watch buffer overflow discard an observation | Boot log: "BUFFER FULL. Eviction policy determines what gets forgotten." |

### Mission 3: Relay (Inter-Agent Communication)
| Term | First Experience | Naming Moment |
|------|-----------------|---------------|
| **Hook** | Wire two agents together, watch signal flow | Boot log: "HOOK PROTOCOL ONLINE: Agents can transmit signals to each other." |
| **Channel** | Type a channel name to create a connection | Workbench: channel name field glows when first typed |
| **Signal** | See a transmitted observation arrive in another agent's buffer | Inspector: "A signal — an observation forwarded from one agent to another." |
| **Latency** | Notice the 1-tick delay between send and receive | Inspector: "Signal latency: 1 tick per hop. This signal took 2 ticks." |

### Mission 4: Chorus (Multi-Agent Systems)
| Term | First Experience | Naming Moment |
|------|-----------------|---------------|
| **Rule** | Set a condition→action pair, watch agent follow it | Boot log: "RULE ENGINE ONLINE: Agents follow ordered condition→action pairs." |
| **Condition** | Configure an IF (buffer contains X) trigger | Workbench: condition dropdown materializes |
| **Action** | Configure a THEN (do Y) response | Workbench: action dropdown materializes |
| **Priority** | Reorder rules, watch behavior change based on order | Inspector: "Rule priority — higher rules checked first." |
| **Perception radius** | See a scout's sensing range on the board | Board overlay: perception cone appears with range number |
| **Skill** | See the engage/patrol/evade options on a unit | Workbench: skill toggles materialize |

### Mission 5: Factory (Production)
| Term | First Experience | Naming Moment |
|------|-----------------|---------------|
| **Blueprint** | Create a reusable agent configuration | Boot log: "FABRICATION ONLINE: Blueprints define agent templates." |
| **Production queue** | Drag blueprints into build order | Workbench: conveyor belt strip appears |
| **Cost** | See material/energy prices on blueprints | Workbench: cost overlay materializes |
| **Tagging** | Move agents near map nodes, see income change | Board overlay: node glow when tagged |
| **Listen/Ignore filter** | Configure which channels a blueprint monitors | Workbench: channel filter section materializes |

### Mission 6-7: Command
| Term | First Experience | Naming Moment |
|------|-----------------|---------------|
| **Command agent** | Place a unit that modifies other units | Boot log: "COMMAND PROTOCOL ONLINE: Agents that manage agents." |
| **Reassign** | Watch a command agent swap a subordinate's skill | Inspector: "Reassign — changed SCOUT-3's active skill mid-battle." |
| **Reroute** | Watch a command agent redirect a channel | Inspector: "Reroute — redirected channel 'east_flank' to STRIKER-2." |
| **Prioritize** | Watch a command agent change eviction policy | Inspector: "Prioritize — changed RELAY-A's eviction to keep freshest signals." |
| **EM emission** | See hook transmissions create detectable noise | Board overlay: emission rings appear around transmitting agents |

### Mission 8-10: Full System
| Term | First Experience | Naming Moment |
|------|-----------------|---------------|
| **Compress** | Watch a relay condense multiple signals into one | Inspector: "Compress — 3 observations → 1 summary signal." |
| **Filter** | Watch a relay block certain signal types | Inspector: "Filter — dropped 'environmental' signals, forwarded 'threat' only." |
| **Amplify** | Watch a relay boost signal priority | Inspector: "Amplify — signal priority elevated, survives eviction longer." |

---

## Five Design Options for the Reference Layer

### Option A: "The Boot Terminal" (Accreting Diegetic Log)

The living reference is the boot log itself. After each mission, new entries append to the log — not as tutorial text, but as the AI's self-documenting initialization records. The player can scroll back through the log at any time. The boot log is the game's manual, written by the game's protagonist (the player-as-AI), about the game's own subsystems coming online.

**What it looks like:** A terminal window accessible from any screen. Green monospace text on dark background. Entries are timestamped with mission numbers. Technical subsystem headers in ALL CAPS. Explanatory text in the AI's analytical voice. A search bar at the top. Entries glow briefly when their associated concept is used in the current context.

**Sensory:** The terminal hums faintly when open — a low electrical drone, like a server room heard through a wall. Scrolling produces a soft character-by-character reveal sound, as if the text is being typed in real time even though it's historical. New entries appear with a brief CRT phosphor bloom effect, each character brightening then settling. The cursor blinks at the bottom of the log — alive, waiting, suggesting the AI is still writing itself.

**Strengths:** Perfect diegetic coherence with locked narrative ("You are an AI reading your own spec sheet as it writes itself"). Zero immersion break. The reference IS the story. Community potential — players share their boot logs, compare what they unlocked when.

**Weaknesses:** Linear text format is poor for reference lookup. Players looking for "what does eviction mean?" must scroll through narrative to find it. Search helps but breaks the diegetic spell. Terminal aesthetic may alienate non-technical players.

### Option B: "The Workbench Encyclopedia" (Context-Sensitive Panels)

Every element of the workbench has a "?" icon that expands into an inline explanation panel. The panel contains a definition, a mechanical reference, and a miniature replay clip from the player's own history showing the concept in action.

**What it looks like:** Click the "?" next to the hook configuration section. A panel slides out from the right edge, showing: the term "Hook" in the section header, a one-sentence definition ("A reactive trigger that transmits a signal to a named channel when a condition is met"), a numbered list of mechanical details (latency: 1 tick/hop, EM emission: yes, hook slot cost: 1 per hook), and a 3-second looping clip from Mission 3 where the player first wired a hook. Below the clip: "You created your first hook in Mission 3: Relay, connecting SCOUT-1 to RELAY-A on channel 'east_flank'."

**Sensory:** The panel slides in with a smooth mechanical sound — like a drawer opening in a precision instrument. The background behind the panel dims slightly, creating depth. The miniature replay clip plays at 2x speed, silent, with key moments highlighted by a subtle gold outline. Closing the panel produces a satisfying click, and the "?" icon pulses once to acknowledge it was read.

**Strengths:** Perfect context sensitivity — the help is exactly where the confusion is. Personal replay clips create emotional connection to the learning. Inline panels don't require screen transitions.

**Weaknesses:** 30 "?" icons on the workbench create visual clutter. Players who don't need help are penalized by the presence of help affordances. Personal replay clips require storage and retrieval infrastructure.

### Option C: "The Field Manual" (Collectible Diegetic Document)

An in-game document in the style of TUNIC's instruction manual — partially illustrated, partially annotated, gradually revealed. Pages are not printed or external — they're viewable in an in-game panel. Each page covers one concept with a hand-drawn illustration, a brief description in the game's voice, and annotated diagrams showing mechanical relationships.

**What it looks like:** A worn, creased digital page with hand-drawn illustrations in a technical sketch style. The illustration for "Buffer" shows a cross-section of an agent's head with six labeled slots, each containing a tiny observation card. Annotations in handwritten font point to slots: "newest entry," "oldest entry," "eviction candidate." The bottom of the page has a margin note in a different hand: "Relay buffers can hold 12. Don't waste them on noise." Pages have dog-eared corners, coffee stains, circled sections — evidence of previous use.

**Sensory:** Opening the field manual produces a soft paper-rustle sound. Pages turn with a satisfying swipe animation, each page landing with a light thwap. The illustrations are in a limited palette — dark blue ink on off-white paper, with occasional red annotations for warnings ("CAREFUL: full buffers evict from the bottom!"). The paper texture has subtle grain visible at zoom. Margin notes appear in a warmer brown ink, as if added later by a different analyst.

**Strengths:** TUNIC-proven pattern — collectible manual pages create exploration motivation. Hand-drawn illustrations are more memorable than text definitions. Margin notes create community feel (who wrote these? a previous AI? a captured enemy engineer?). The manual can be a discovery reward — pages found in missions, not just unlocked by progression.

**Weaknesses:** Requires significant illustration asset creation. Still requires reading. Manual page ordering may not match player's learning sequence. Risk of TUNIC's obscurity problem — if illustrations are too abstract, they teach nothing.

### Option D: "The Glossary Ghost" (Ambient Contextual Whispers)

No dedicated reference UI at all. Instead, the game's AI narrator (the player-as-AI's own subsystems) provides ambient audio annotations when the player hovers over or interacts with any concept for more than 2 seconds. A soft synthetic voice — not a voiceover, more like a system readback — speaks the term and a one-sentence description.

**What it looks like:** The player hovers over the hook configuration section. After 1.5 seconds, a subtle audio cue plays (a soft two-note ascending tone), and a small text overlay appears near the cursor: "Hook — transmits signal to channel when condition met." The text fades after 3 seconds. If the player hovers longer, additional detail materializes: "Latency: 1 tick per hop. EM emission: detectable." A whispered synthetic voice reads the initial description — not intrusive, more like a system status readback happening in the background.

**Sensory:** The two-note ascending tone is the "attention" chime — the AI noticing that the player is looking at something. The whisper voice is processed through a slight vocoder — clearly synthetic, clearly the AI speaking to itself, not to the player. The text overlay is translucent, floating above the workbench without obscuring it, in a monospace font matching the boot log aesthetic. It dissolves like mist when the cursor moves away.

**Strengths:** Zero UI footprint — no panels, no manual, no "?" icons. The game teaches by ambient presence. Completely non-intrusive for veterans (2-second hover threshold means fast players never trigger it). The AI-narrating-to-itself framing is perfect diegetic coherence.

**Weaknesses:** Audio annotations require voice assets (or high-quality TTS). Players with audio off lose the feature. Hover-based triggers don't work well on mobile/touch. 30 terms × 2+ sentences each = significant voice work. No way to browse all terms at once — you can only learn about what's on screen.

### Option E: "The Living Schematic" (RECOMMENDED — Hybrid)

The boot log terminal (Option A) serves as the persistent, browsable reference. The workbench context panels (Option B) serve as the inline, just-in-time reference. The field manual pages (Option C) serve as discoverable reward artifacts in missions. The three systems are interconnected: tapping any term in the boot log jumps to the relevant workbench context panel, finding a field manual page in a mission adds a margin-note annotation to the boot log entry, and the workbench "?" icons pulse once when a new field manual page is found that relates to them.

**The integration:** One vocabulary, three access patterns:
- **"I want to browse"** → Boot terminal (scrollable, searchable, narrative-flavored)
- **"I'm confused right now"** → Workbench "?" panel (inline, context-sensitive, replay-backed)
- **"I found something"** → Field manual page (collectible, illustrated, adds depth)

Each access pattern serves a different player state (exploration, confusion, discovery) and a different player type (lore reader, pragmatist, collector). None requires leaving the game. None requires reading before playing. All build on experiential foundations.

---

## Player Journeys

### Journey: Tomás, 16, High School Student, First Strategy Game

**Context:** Downloaded Robot Uprising because a TikTok showed a cascade flanking maneuver with the caption "I didn't program this." Has never played Factorio, Shenzhen I/O, or any programming game. Plays mostly Fortnite and Minecraft.

**Minute 0:00 — The Boot**
The screen is black. Green text begins appearing, character by character, CRT-style: "CORE INITIALIZATION... MEMORY SUBSYSTEM ONLINE..." Tomás watches, slightly confused. He doesn't read the text carefully — it's ambient. The text mentions "buffer" and "observation" but these are just words right now. The boot sequence ends with "FIRST CONTACT PROTOCOL: ENGAGE" and the screen transitions to Mission 1.

**Minute 0:30 — Mission 1: Wake**
An 8x8 grid appears on the left. A single scout unit sits at position D4. On the right, a column of colored cards — the scout's buffer. Tomás doesn't know what a buffer is. He doesn't need to. The cards are visually clear: some glow warmly (relevant observations), some are dim and staticky (noise). An enemy unit blinks red at H7.

The scout's ghost path — a translucent arrow — points at A1. Wrong direction. A subtle amber pulse on the dim cards suggests "these are the problem."

**Minute 0:45 — The First Drag**
Tomás drags one of the dim cards out of the column. It dissolves into pixel dust with a satisfying *tschk* sound. The ghost path twitches. He drags another. The path rotates, pointing more toward H7. He drags a third. The path snaps directly to the enemy. The perception cone — a faint blue wedge — brightens and points east.

Tomás hasn't read a single word of explanation. He has learned that removing bad information makes the agent smarter. This is the core lesson of the entire game, delivered in 15 seconds through a drag-and-release interaction.

**Minute 1:00 — EXECUTE**
He presses the big button. The sealed watch plays. The scout moves to E5, then F6, then G7 — each position snapping crisply with a soft *tok* sound. On Tick 4, the scout is adjacent to the enemy. The cell flashes green. "CONTACT CONFIRMED." Mission complete.

**Minute 1:15 — The Naming**
The boot log appends: "OBSERVATION: Agent SCOUT-1 completed first contact. **Buffer** cleared of noise. Clean buffer → correct behavior. This is the principle: what your agents know determines what they do."

Tomás half-reads this. The word "buffer" now has a physical referent — it's that column of cards he was dragging things out of. He doesn't memorize the definition. He doesn't need to. His hands already know what a buffer is.

**Minute 3:00 — Mission 2: Focus**
More cards. Harder to tell which are noise — confidence levels vary. Tomás removes a card that looked like noise. The ghost path veers off. A low bass hum warns him. He shakes his head, drags it back in (undo). Tries a different card. The path stabilizes. He's learning about observation quality without anyone telling him the word "confidence."

**Minute 8:00 — Mission 3: Relay**
Two agents now. A scout and a striker. The scout can see the enemy; the striker can't. Tomás tries EXECUTE — the striker stands still. Obviously it needs information from the scout. The workbench shows a dimmed section below the scout's skills labeled with faint dotted lines. Tomás clicks it. A field appears: channel name. He types "go" and presses enter.

The word "go" appears as a tiny label on a line connecting scout to striker on the board. He didn't read about hooks. He figured out that agents need to talk to each other, saw the field where you name the conversation, and typed something. The hook is wired.

He presses EXECUTE. The scout spots the enemy. On the next tick, a small green flash travels along the line from scout to striker. The striker turns and moves toward the target. Tomás pumps his fist. He invented inter-agent communication by needing it.

The boot log appends: "HOOK PROTOCOL ACTIVE: Agent-to-agent signal transmission operational. Channel 'go' established. SCOUT-1 → STRIKER-1. Latency: 1 tick." Tomás doesn't care about the word "hook" yet. He cares that his scout told his striker where to go, and it worked.

**Minute 15:00 — The Reference Check**
By Mission 4, Tomás is juggling 3 agents, 2 channels, and eviction priorities. He needs to check something — what happens when a buffer is full? He presses Tab. The boot terminal opens. He scrolls to the "MEMORY SUBSYSTEM" section and reads: "When buffer is full, oldest observation is evicted. Configure eviction policy in context config."

He finds the entry he needs in 5 seconds. Closes the terminal. Adjusts the eviction policy. Never left the game. Never Googled anything. Never read a PDF.

**UI Annotations:**
- Buffer column: right panel, 120px wide, card-based, warm glow on relevant cards, dim static on noise
- Ghost path: translucent directional arrow from unit, updates in real-time on card removal
- Channel label: small text on connection line between units, appears on board when hook is configured
- Boot terminal: Tab key opens overlay, monospace green-on-dark, searchable, scrollable
- Undo: Ctrl+Z or drag card back into buffer

---

### Journey: Dr. Amara Okafor, 41, ML Research Lead, Zachtronics Veteran

**Context:** Has completed every Zachtronics game including TIS-100 and Shenzhen I/O. Printed and binder-organized Shenzhen's manual. Downloaded Robot Uprising because of the "vocabulary is 1:1 with real agentic AI engineering" premise. Expects to need a manual. Is prepared to print one.

**Minute 0:00 — The Boot**
Amara reads the boot log carefully. She recognizes the vocabulary immediately — buffer, observation, signal, latency. These are words she uses at work. She nods. "Okay, so agents have context windows." She's already translating game vocabulary to her professional mental model.

**Minute 0:30 — Mission 1: Wake**
She solves Mission 1 in 12 seconds. Drag out the three dim cards, EXECUTE, done. She barely registers the filter puzzle as a tutorial — it's too simple for her. But the fast-track detection kicks in: after solving in under 15 seconds with 100% efficiency, a small prompt appears: "EFFICIENCY RATING: OPTIMAL. Skip to Mission 3: Relay? (Curriculum pace adjusted.)"

She hesitates. Then clicks "Continue to Mission 2" instead. She's a researcher — she wants to see the full curriculum, not skip it. She solves Mission 2 in 20 seconds. The confidence/staleness mechanic is interesting. She notes that staleness maps to "token age in a sliding context window." She's building her professional mapping.

**Minute 2:00 — Mission 3: Relay**
Amara sees the hook configuration field and immediately types a descriptive channel name: "east_threat_intel." She knows from Screeps and Pub/Sub systems that channel naming conventions matter at scale. She's already thinking about Mission 10 architecture.

She presses EXECUTE and watches the signal propagate. The 1-tick latency is immediately legible to her. "Ah, so this is like message queue latency. And the buffer is the consumer's backlog." She's not learning — she's mapping.

**Minute 4:00 — Looking for the Reference**
After Mission 3, Amara presses Tab to open the boot terminal. She scrolls through all current entries. Then she searches for "eviction" — not because she's confused, but because she wants to know the exact mechanics. The entry appears: "Eviction policy options: FIFO (oldest first), LRU (least recently used), Priority (lowest priority first)."

She makes a mental note: "Three eviction policies. FIFO is the default. LRU maps to LRU cache eviction in Redis. Priority maps to priority queues." She has the full mechanical detail she needs without a PDF.

**Minute 5:00 — The "?" Panel**
She notices the "?" icon next to the hook section. Clicks it. The inline panel shows mechanical details AND a replay clip of her own hook wiring from 2 minutes ago. She's impressed — the reference is personalized. "This is like Jupyter notebook cells with inline execution history."

**Minute 6:00 — The Field Manual Page**
In Mission 4, she finds a collectible field manual page tucked behind an optional objective. It shows a hand-drawn cross-section of a relay's internal architecture — buffer slots, hook receivers, emission antenna — with margin notes: "Relay buffers hold 12. Use compress to reduce signal volume before forwarding. — prev. analyst." The margin note adds to the boot terminal entry for "Compress" — a faint annotation appears: "[Field Manual Note] Compress before forwarding through relays."

Amara smiles. "So the manual exists, but it's found, not given. And it adds to the reference rather than being the reference." She would have been fine without it. But finding it feels like discovery, not homework.

**Minute 20:00 — Mission 5: Factory**
By now, Amara has never alt-tabbed. Never Googled. Never needed a PDF. The boot terminal has 15 entries, all grounded in her own play. The workbench's "?" panels gave her mechanical details at the point of need. The field manual pages added flavor and depth.

She opens a text file on her second monitor and starts writing architecture notes — not because the game requires external documentation, but because she's an engineer who documents her own systems. The game didn't force this. Her professional instincts did. The difference is everything.

**UI Annotations:**
- Fast-track prompt: appears center-screen after sub-15s 100% solve, optional skip offer, no penalty for declining
- Boot terminal search: type-ahead search bar at top of terminal, highlights matching entries
- "?" panel replay clip: 3-second loop, 2x speed, gold outline on key interaction, personal history
- Field manual page: discoverable reward in mission, adds margin note to boot terminal entry
- Channel name field: accepts any string, auto-suggests existing channel names, auto-completes on Tab

---

### Journey: Kai, 11, Sixth-Grader, Minecraft Builder, No Strategy Game Experience

**Context:** Kai's older cousin showed him Robot Uprising. He doesn't know what "agentic AI" means. He doesn't know what a buffer is. He plays Minecraft and Roblox. His reading level is grade-appropriate but he doesn't enjoy reading walls of text.

**Minute 0:00 — The Boot**
The green text scrolls. Kai reads "MEMORY SUBSYSTEM ONLINE" and doesn't understand it. He clicks through. He's waiting for the game to start. The boot log text is atmospheric to him — it looks like a hacker movie, which is cool — but it's not information yet.

**Minute 0:20 — Mission 1: Wake**
The grid appears. A little robot with an eye icon sits on the board. On the right, a stack of colored rectangles. Some glow. Some are grey and buzzy. Kai doesn't know these are "observations in a buffer." He sees: glowy things and grey things. The grey things look bad.

He pokes a grey one. Nothing happens (he tapped, not dragged). He tries dragging it. It lifts off the stack. He drags it to the side and releases. *Tschk* — pixel dust. The robot's arrow twitches.

Kai doesn't think "I'm removing noise from a context buffer." He thinks "I'm cleaning up the robot's brain." The metaphor is clean enough to work without any vocabulary at all. He drags out two more grey cards. The arrow snaps to the red enemy. He presses the big button.

**Minute 1:00 — The Watch**
The robot hops across the grid — *tok tok tok* — and reaches the enemy. Green flash. "Nice!" says Kai. He didn't read the mission objective. He didn't need to. Clean the brain, press the button, watch the robot win.

**Minute 1:30 — The Boot Log (Ignored)**
The boot log appends text about buffers. Kai doesn't read it. He taps "Next Mission." This is fine. The boot log is there for when he's ready. Right now, his hands-knowledge is sufficient.

**Minute 4:00 — Mission 2: The First Mistake**
Harder cards. Kai drags out a card that was slightly glowy. The arrow veers. A low bass hum warns. "Ohhh, that was a good one." He drags it back. The arrow resets. He's learned about observation quality through a sound cue and a visual consequence. No text involved.

**Minute 8:00 — Mission 3: His First Word**
Two robots. The scout robot sees the enemy but the sword robot doesn't move. Kai is stuck. He tries pressing EXECUTE repeatedly — the sword robot stands still every time. He looks at the workbench panel. There's a section with a text field and a dotted line. He doesn't know what "hook" means, but the dotted line on the board connects the two robots, and the text field has a blinking cursor.

He types "help" and presses enter. The dotted line on the board becomes solid. He presses EXECUTE. The scout spots the enemy. Next tick: a green flash travels along the line to the sword robot. The sword robot turns and attacks.

"YOOO!" Kai shouts. He doesn't know the word "hook." He doesn't know the word "channel." He named his channel "help" and it worked. The concept is physical: a line between two robots that lets one tell the other what it saw. The word will come later. The understanding is already here.

**Minute 12:00 — Kai Reads Something Voluntarily**
In Mission 4, Kai's three robots keep failing. He's frustrated. He presses Tab — he discovered this by accident earlier. The boot terminal opens. He searches for "robot" (not "agent" — he doesn't know that word). No results. He tries "help" — the channel name he used. The entry for hooks appears, because the game's search indexes channel names the player has used. "Hook: transmits signal between agents on a named channel. Your channel 'help' connects SCOUT-1 → STRIKER-1."

Kai reads this. "Oh, 'hook' is what makes the line." He has a word now. Not because the game forced him to read, but because he needed an answer and the search found it using his own vocabulary.

**UI Annotations:**
- Card glow intensity: warm amber for relevant, cold grey-static for noise, intermediate for uncertain
- Bass hum warning: plays immediately when a relevant observation is removed, increases in intensity with error severity
- Channel text field: blinking cursor, accepts any string, no validation or suggestion for first encounter
- Search: indexes player-created names (channel names, blueprint names) alongside game vocabulary
- Tab key: opens boot terminal from any screen, cursor starts in search bar

---

### Journey: Priya, 35, Accessibility Tester, Low Vision

**Context:** Priya uses a screen magnifier at 200% zoom and high-contrast mode. She evaluates games for accessibility compliance. She has played Into the Breach (excellent accessibility) and tried Shenzhen I/O (abandoned due to external PDF being impossible to use at high magnification alongside the game window).

**Minute 0:00 — The Boot**
The boot log's monospace text renders crisply at 200% zoom — monospace fonts are inherently zoom-friendly. The high-contrast mode shifts the terminal from green-on-dark to white-on-black with yellow highlights. Priya approves: "Clean. Readable. No decorative fonts."

**Minute 0:30 — Mission 1: Wake**
At 200% zoom, the 8x8 board fills most of the screen. The buffer column is off-screen to the right. Priya scrolls right. The cards are large enough at zoom to read — each card has a bold icon and a 12pt label. She drags a noise card out. The *tschk* sound confirms the action. The arrow on the board (which she scrolls back to see) has moved.

**Minute 1:00 — The Problem**
At 200% zoom, Priya cannot see the board and the buffer simultaneously. She needs split-screen but her magnifier doesn't support it. She presses F1 (the help shortcut). A panel appears listing keyboard shortcuts. "B: Toggle buffer overlay on board." She presses B. The buffer cards appear as a compact overlay on the agent's tile — smaller, but visible alongside the board without scrolling.

**Minute 1:30 — The "?" Panel Test**
Priya clicks the "?" next to the hook section. The inline panel expands. She checks: does it respect her zoom level? Yes — the text reflows at 200%. Does the replay clip have alt text? Yes — "Replay: SCOUT-1 transmits on channel 'east_flank' to RELAY-A, tick 12 to tick 13, 1 hop latency." The alt text is generated from the replay metadata, not hand-written.

**Minute 3:00 — The Boot Terminal Test**
She opens the boot terminal and tests with a screen reader (NVDA). The terminal's text is standard DOM content (React renders it as `<pre>` with `<span>` per line), so NVDA reads it sequentially. Each entry has an ARIA label: "Boot log entry: Buffer. Your agents have a fixed-size working memory called a buffer." The search bar is a standard `<input>` with placeholder text "Search vocabulary."

**Minute 5:00 — The Verdict**
Priya notes in her assessment: "No external documentation required. All vocabulary learnable through play. Reference system is fully accessible — boot terminal is DOM-rendered, searchable, screen-reader-compatible. Workbench panels reflow at zoom. Buffer overlay mode enables single-viewport play. Significantly more accessible than Shenzhen I/O's PDF model. Comparable to Into the Breach's clarity-first design. The key difference: Into the Breach has ~10 concepts; Robot Uprising has ~30. The three-layer system (experience → naming → reference) scales to this higher vocabulary count without sacrificing accessibility."

**UI Annotations:**
- High-contrast mode: white-on-black terminal, yellow highlights, no gradient or transparency
- Buffer overlay mode (B key): compact card display on unit tile, readable at 200% zoom
- Screen reader: all boot terminal entries have ARIA labels, all workbench "?" panels use semantic HTML
- Replay clip alt text: auto-generated from replay event metadata (agent names, tick numbers, channel names)
- Search: standard `<input>` element, type-ahead, results announced via ARIA live region

---

## Interaction Effects

### With Building Blocks (3.*)
The workbench's physical affordances — where things are, what they look like, how they respond to interaction — are the primary teaching surface for Layer 1 (experiential). The building-block paradigm choice (node graph vs. card deck vs. mixing board) fundamentally determines HOW concepts are experienced before they're named. If the paradigm is a node graph, "hook" is experienced as dragging a wire. If it's a card deck, "hook" is experienced as placing a card. The teaching architecture adapts to the paradigm, not the reverse.

### With Onboarding: Tutorial as Puzzle (5.01)
The filter puzzle IS Layer 1 for buffer concepts. The tutorial-as-puzzle aspect already designs the experiential foundation for Missions 1-4. This aspect (5.00) adds Layers 2 and 3 on top: the naming moment (boot log, workbench labels) and the living reference (terminal, panels, field manual). The two aspects are complementary, not competing.

### With Onboarding: Diegetic Tutorial Documents (1.04b)
The field manual (Option C) is an instance of the diegetic document pattern. The boot log (Option A) is an instance of Type B (accreting log) from the diegetic document taxonomy. This aspect integrates both into a three-layer system where diegetic documents serve specific roles (persistent reference, discoverable depth) rather than being the sole teaching mechanism.

### With Campaign Structure (5.05)
The 10-mission arc IS the vocabulary curriculum. The locked mission sequence (context → rules → hooks → skills → production → command → full system) determines which terms the player encounters when. Any change to mission ordering directly affects the vocabulary curriculum. The boot log's accreting entries are paced by mission completion — they cannot appear out of sequence.

### With Platform: Mobile/Touch (6.05)
The boot terminal works on mobile with standard scroll/search. The "?" panels work with long-press instead of hover. The field manual pages work with swipe navigation. The Glossary Ghost (Option D) does NOT work on mobile — hover-triggered annotations have no mobile equivalent. This rules out Option D as a standalone solution and strengthens Option E (hybrid) as the recommended approach.

### With Competitive Analysis: Shenzhen I/O (1.01)
The entire point of this aspect is to avoid Shenzhen I/O's approach while preserving its strength (comprehensive, authoritative reference). The boot terminal provides Shenzhen's completeness without the PDF. The "?" panels provide Shenzhen's precision without the alt-tab. The field manual provides Shenzhen's worldbuilding without the reading requirement.

### With Aesthetics: Audio Design (6.02)
The naming moment audio cues — the *tschk* of card removal, the bass hum of error, the two-note chime of the Glossary Ghost, the CRT phosphor bloom of new boot log entries — are part of the audio vocabulary designed in 6.02. The teaching architecture requires these sounds to be learned cues, not decorative. Each sound must reliably map to one concept: *tschk* always means removal, bass hum always means error. The audio must be as learnable as the vocabulary it teaches.

---

## Comparable Games / Reference Points

| Game | Position | What It Does | Lesson for Robot Uprising |
|------|----------|-------------|--------------------------|
| **Shenzhen I/O** | 1 (external PDF) | 30-page spec manual, printed binder, reference tables | Anti-pattern to avoid. Completeness is necessary but must be in-game. |
| **EXAPUNKS** | 2 (diegetic zine) | Trash World News: hacker zine with in-character tutorials | Boot log inherits this spirit. But TWN still requires reading before playing. Robot Uprising names AFTER doing. |
| **TUNIC** | 2 (diegetic manual) | Collectible instruction pages in constructed language | Field manual pages. Knowledge as discovery reward. "No mechanical power, only informational power." |
| **Outer Wilds** | 2 (accreting log) | Ship Log fills as player discovers | Boot terminal fills as player progresses. The shape of gaps implies what you don't know yet. |
| **Portal** | 5 (implicit) | Level design teaches portal mechanics with zero text | The gold standard. But Portal has ~5 concepts. Robot Uprising has ~30. Pure implicit can't scale. |
| **Baba Is You** | 5 (implicit) | Rules are pushable objects — the mechanic IS the tutorial | Filter puzzles: the noise IS the problem, the removal IS the lesson. Same principle, different mechanic. |
| **Into the Breach** | 5 (implicit) | Enemy attack previews teach weapon mechanics via animation | "Showing that little animation of them moving is a thousand times more effective." Ghost paths > tooltips. |
| **Civilization** | 3 (Civilopedia) | In-game encyclopedia accessible from any screen | Boot terminal is the Civilopedia, but accreting (entries appear as you progress) and diegetic (written by the AI). |
| **Disco Elysium** | 5+text (mechanics as characters) | 24 skill-characters speak in first person, narrating their own mechanics | The AI's boot log narrates its own subsystems. "HOOK PROTOCOL ONLINE" is a subsystem announcing itself. |

---

## The TikTok Clip

**15-second clip:** Split screen. Left: Shenzhen I/O player with a printed PDF manual, flipping pages, alt-tabbing between game and PDF, pausing to read. Right: Robot Uprising player dragging noise out of a buffer, watching the ghost path snap, pressing EXECUTE, watching the scout find its target. No text read. No manual consulted. Same depth of understanding. Caption: "Same complexity. No manual."

**Alternative clip:** Time-lapse of the boot terminal filling in over 10 missions. Starts empty. Each mission adds entries. By Mission 10, the terminal has 30+ entries — a full reference system that wrote itself as the player played. Caption: "The manual writes itself."

---

## Discovered Aspects

1. **5.00a — The vocabulary pacing bottleneck:** 30 terms across 10 missions = 3 terms per mission average. Some missions (Mission 3: Relay) introduce 4 new terms. Is this too many? What's the maximum new-term density before cognitive overload? Should some terms be withheld until the debrief rather than introduced during play? Interaction with difficulty curve (5.04).

2. **5.00b — Search-by-player-vocabulary:** The boot terminal search indexes player-created names (channel names, blueprint names) alongside game vocabulary. When Kai searches "help" (his channel name), the hook entry appears. This is a non-trivial search design: the game must maintain a mapping from player vocabulary to game vocabulary. How does this scale to hundreds of player-created names? What about misspellings?

3. **5.00c — The veteran fast-path:** Players who already know the vocabulary (ML engineers, Screeps players, Zachtronics veterans) need a way to skip or compress the experiential layer without missing mechanical details. The fast-track detection (solve Mission 1 in <15s → offer skip) is one option. Others: a "technical mode" toggle that shows all vocabulary immediately, a difficulty selector at game start that adjusts pacing.

4. **5.00d — The field manual as community artifact:** If field manual pages are discoverable rewards, speedrunners will optimize for finding all pages. Community wikis will map page locations. Players will trade page screenshots. The field manual becomes a meta-game. How does this interact with the boot terminal (which has all the same information without the discovery)? Is the field manual redundant or complementary?

5. **5.00e — The naming moment as designed beat:** The exact timing of when a concept gets its name is a design decision. Too early (before experience) = meaningless label. Too late (after the player has already built a mental model) = annoying interruption of understanding they already have. The naming moment should arrive at the "tip of the tongue" moment — when the player knows the concept but doesn't have a word for it yet. How do you detect this moment programmatically?
