# Onboarding: Search-by-Player-Vocabulary — The Dual-Index Problem

**Aspect ID:** 5.00b
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.00 (external-documentation anti-pattern), 5.00a (vocabulary pacing bottleneck), 5.00a-iii (extension vs. new concepts), 5.15 (voice candidates), 3.08 (hook taxonomy), 3.12 (context config UI), 5.00d (field manual as community artifact)

---

## The Problem

By Mission 7, a player has created dozens of player-authored names: channel names like "threat-north", "relay-backup", "flanker-go"; blueprint names like "Scout Alpha", "Relay Hub v3", "Striker Fast"; and rule annotations like "panic mode" or "stealth check." When they open the boot terminal (the game's built-in reference system) and search for help, they think in *their own vocabulary*, not the game's. They type "threat-north" wanting to understand why signals on that channel arrive late, but the reference system only indexes game terms like "channel," "signal," "latency."

The gap between **player vocabulary** (the names they've invented) and **game vocabulary** (the canonical terms defined by the boot log and Blueprint Codex) is a search failure that feels like the game doesn't understand them. Every failed search is a micro-abandonment risk: the player leaves the in-game reference and opens a browser tab.

---

## The Dual Index Architecture

### Layer 1: Game Vocabulary Index

The boot terminal's primary index covers every canonical game term from the 30-term curriculum. Each entry is keyed by:
- **Canonical name** ("context window", "hook", "eviction", "compress")
- **Aliases** ("buffer" maps to "context window"; "trigger" maps to "hook"; "remove" maps to "eviction")
- **Category tags** (memory, communication, behavior, production, meta)
- **Mission of introduction** (M1 through M10)

This is the standard glossary every game has. It's necessary but insufficient.

### Layer 2: Player Vocabulary Index

The second index is dynamically built from the player's own configuration:
- **Channel names** the player has created ("threat-north", "scout-report", "flank-go")
- **Blueprint names** ("Scout Alpha", "Relay Hub v3", "Striker Fast")
- **Rule annotations** (if players can label rules: "panic mode", "stealth check")
- **Named presets** (saved configurations, weight presets)

Each player-authored name is mapped to the game concepts it touches:
- "threat-north" → linked to: channel, hook, signal, the specific hook configurations that use this channel
- "Scout Alpha" → linked to: blueprint, scout, the specific skills/rules/hooks equipped
- "Relay Hub v3" → linked to: blueprint, relay, compress, filter, the specific context config

### The Search Flow

When the player types a query:

1. **Exact match against game vocabulary** → show the canonical reference entry
2. **Exact match against player vocabulary** → show a bridge page: "threat-north is a channel you created in Mission 5. Channels are part of the hook system. [See: Hooks] [See: Channels] [See: your hook configs using threat-north]"
3. **Fuzzy match** → show ranked suggestions from both indexes with provenance labels: `[GAME TERM]` or `[YOUR NAME]`
4. **No match** → show "Did you mean...?" suggestions based on edit distance, plus the three most recently viewed reference pages

---

## Misspelling Handling: "The Forgiving Terminal"

Players misspell constantly. The terminal must handle:

### Edit Distance Matching
- **Levenshtein distance ≤ 2** triggers a suggestion: typing "contxt" shows "Did you mean: context window?"
- **Prefix matching**: "con" shows "context window, condition, compress, cost" — sorted by frequency of the player's actual usage
- **Phonetic matching**: "evikshun" → "eviction" (Soundex or Metaphone)

### Common Misspelling Patterns
| Player Types | Should Match | Pattern |
|---|---|---|
| "buffer" | context window | Legacy synonym (code term for player-facing concept) |
| "trigger" | hook | Conceptual synonym |
| "memory" | context window | Metaphor synonym |
| "wire" / "connection" | channel / hook | Spatial metaphor |
| "AI" / "bot" | command agent | Generic synonym |
| "queue" | production queue / context window | Ambiguous — show both |
| "latancy" | latency | Typo |
| "perceptin" | perception radius | Typo |
| "rule prioritty" | priority (rules) | Typo + compound query |

### Compound Query Decomposition
When a player types "why is my scout not attacking", the terminal should:
1. Extract nouns: "scout", "attacking"
2. Map "scout" → Scout unit type, the player's scout blueprints
3. Map "attacking" → engage skill, strike action, rules containing attack actions
4. Show: "Possible topics: Scout rules | Engage skill | Rule priority | Your Scout Alpha blueprint's rules"

This is NOT natural language processing in the LLM sense — it's keyword extraction and index lookup. The terminal is a search engine, not a chatbot.

---

## Five Design Variations

### Variation A: "The Dumb Terminal" (Exact Match Only)

The terminal searches canonical terms only. No fuzzy matching, no player vocabulary, no compound decomposition. Type "hook" and get the hook reference page. Type "threat-north" and get "No results found."

**Strength:** Zero implementation complexity. No confusing AI-generated suggestions.
**Weakness:** Fails the moment a player thinks in their own vocabulary. Guarantees browser-tab abandonment.

### Variation B: "The Smart Lookup" (Dual Index + Fuzzy)

Full dual-index architecture as described above. Game vocabulary + player vocabulary, fuzzy matching, compound decomposition. Every player-created name is a first-class search target that bridges to game concepts.

**Strength:** Meets players where they are. "I know what I called it" always works.
**Weakness:** Requires maintaining a real-time index of all player-created names. Index updates on every config change. Potential performance concern with large config libraries.

### Variation C: "The Contextual Terminal" (Location-Aware Search)

Like Variation B, but the terminal also knows *where* the player is in the UI. If they opened the terminal from a hook config panel, "threat-north" is immediately prioritized because it's a channel name visible in the current context. If they opened from the Inspector at tick 12, the search results are filtered to concepts active at that tick.

**Strength:** Dramatically reduces ambiguity. "Queue" from the production panel means "production queue." "Queue" from the buffer panel means "context window entry ordering."
**Weakness:** Players may not understand why results change depending on where they opened the terminal. Could feel inconsistent.

### Variation D: "The Living Index" (Community-Enriched)

Variation B plus a crowdsourced synonym layer. When 100+ players search for "wire" and then navigate to "channel," the system learns that "wire" → "channel" is a common mapping. These community-derived synonyms are added to the alias table automatically.

**Strength:** The search improves over time without developer intervention. Captures vocabulary that designers couldn't predict.
**Weakness:** Requires server-side analytics. Privacy considerations. Risk of adversarial/nonsense mappings. Robot Uprising is spec'd as no-backend, so this requires architectural compromise.

### Variation E: "The Annotated Search" (RECOMMENDED)

Variation B + C hybrid. Dual index with fuzzy matching AND context awareness. But with one addition: every search result shows a **provenance trail** — exactly how the search matched:

```
Search: "threat-north"
┌─────────────────────────────────────────────┐
│ 📡 threat-north                    [YOUR NAME] │
│ A channel you created in Mission 5.           │
│ Used by: Scout Alpha (hook 1), Striker B (listen) │
│ ───────────────────────────────────────────── │
│ Related game concepts:                        │
│ → Channel (hook communication medium)         │
│ → Hook (reactive trigger system)              │
│ → Signal latency (1 tick per hop)             │
└─────────────────────────────────────────────┘
```

The provenance trail teaches vocabulary mapping: "the thing I called 'threat-north' is an instance of the game concept 'channel.'" Every search is a vocabulary lesson.

---

## Three Player Journeys

### Journey: Sofia, 15, First Strategy Game

**Context:** Mission 6. She has named her channels "alpha-team" and "backup-signal" and her blueprints "Speedy Scout" and "Big Relay." She's stuck: her Speedy Scout isn't receiving signals from Big Relay.

**Minute 0:00 — The Search Impulse**
Sofia is on the Plan screen. Her Speedy Scout blueprint is open in the workbench. The context config panel shows "Listen: alpha-team, backup-signal." But during the last sealed watch, the scout didn't react to relay transmissions. She taps the `?` icon in the top-right corner of the workbench. The boot terminal slides in from the right — a dark panel with a teal-bordered search field, monospace text, and a blinking cursor. The ambient audio dips 30%, replaced by a faint electronic hum. The terminal header reads `> SEARCH SYSTEMS DATABASE_`.

**Minute 0:10 — Searching Her Own Words**
She types "backup-signal". The dual index fires. Results appear in 150ms, no loading spinner:

```
> backup-signal

📡 backup-signal                            [YOUR CHANNEL]
  Created: Mission 5
  Transmitters: Big Relay (hook 2: ON_SIGNAL_RECEIVED → forward to backup-signal)
  Listeners: Speedy Scout (context config: listen = [alpha-team, backup-signal])

  Related concepts:
  → Channel (?): named communication pipe between units
  → Listen/Ignore Filter (?): controls which channels a unit hears
  → Signal Latency: 1 tick per hop (Big Relay → Speedy Scout = 2 ticks)
```

The `(?)` links are clickable, expanding inline to the full reference entry. Sofia clicks "Listen/Ignore Filter" and reads: "Each unit's context config has a listen list. Only signals from listed channels enter the context window. Channels NOT in the listen list are silently ignored."

**Minute 0:30 — The Diagnostic Insight**
Sofia notices the transmitter entry: "Big Relay (hook 2: ON_SIGNAL_RECEIVED → forward to backup-signal)." The hook trigger is ON_SIGNAL_RECEIVED — the relay forwards signals it *receives*, not signals it *generates*. She checks: Big Relay's listen list includes "alpha-team" but NOT the original scout report channel. The relay can't forward what it never heard. The search result — by mapping her channel name to the game's hook/listen architecture — led her to the bug without her needing to know the word "listen" first. She knew "backup-signal." The terminal bridged to the game concept.

**Minute 1:00 — The Fix**
She clicks "Big Relay" in the search result, which opens that blueprint in the workbench. She adds the missing channel to Big Relay's listen list. The terminal remembers her search — a small "Recent: backup-signal" entry appears at the top next time she opens it.

**UI Annotations:**
- **Terminal slide-in**: 300ms ease-out from right edge, 360px wide dark panel, 60% opacity backdrop
- **Search field**: Teal border, monospace placeholder "search game terms or your names...", auto-focus on open
- **Result card**: Dark card with left-edge colored stripe (teal for player names, amber for game terms), 14px body text
- **Inline expansion**: `(?)` links expand 200ms accordion-style within the card, adding the full reference text indented below
- **Blueprint link**: Clicking a blueprint name in results closes the terminal and opens that blueprint in the workbench with a 200ms crossfade

---

### Journey: Marcus, 38, Software Architect

**Context:** Mission 8. He has a complex 5-blueprint setup with 8 named channels. He types a misspelled query.

**Minute 0:00 — The Typo**
Marcus opens the terminal and types "compres" (missing the second 's' in "compress"). The fuzzy matcher activates. Results appear in 200ms:

```
> compres

Did you mean:
  ⚡ compress                              [GAME SKILL]
     Relay skill. Reduces signal payload size,
     freeing context window slots on receivers.
     Used by: Relay Hub v3 (skill slot 1)

  📡 comp-relay                            [YOUR CHANNEL]
     Created: Mission 7
     Transmitters: Relay Hub v3 (hook 1)
     Listeners: Command Core (context config)
```

The fuzzy matcher found both a game term (Levenshtein distance 1 from "compress") and a player-created channel name (prefix match on "comp"). Both are shown with clear provenance labels. Marcus clicks "compress" — the reference entry expands showing the full skill description, interaction effects, and a link to his blueprint that uses it.

**Minute 0:20 — Compound Query**
He clears and types "why is relay slow". The compound decomposer extracts "relay" and "slow":
- "relay" → Relay unit type, his "Relay Hub v3" blueprint
- "slow" → maps to: signal latency (signals are "slow"), tick speed, processing delay

```
> why is relay slow

Possible topics:
  📡 Signal Latency — signals take 1 tick per hop
  🔧 Relay Hub v3 — your relay blueprint
  ⚙️ Compress skill — reduces payload (may reduce processing)
  📊 Context Window — full windows cause 1-tick stun (overload)

Common issue: If your relay's context window is full,
it stunlocks for 1 tick before processing. Check context
config → eviction priority.
```

The "Common issue" footer appears because the system detects that "relay" + "slow" matches a known diagnostic pattern (relay overload). This isn't AI — it's a hand-authored pattern table: `{relay + slow/delay/stuck} → suggest checking overload`.

**Minute 0:40 — Resolution**
Marcus clicks the "Context Window" result, reads about overload, checks his Relay Hub v3's context config, and discovers the buffer is set to 12 slots but the listen list includes 6 channels — flooding the relay with data. He reduces the listen list to the 3 essential channels. The search taught him the vocabulary mapping: "slow" in his intuition = "context overload" in game terms.

**UI Annotations:**
- **Fuzzy match header**: "Did you mean:" in 12px amber italic, separating exact matches from fuzzy suggestions
- **Provenance badge**: `[GAME SKILL]` in teal pill, `[YOUR CHANNEL]` in amber pill, right-aligned on result card
- **Common issue footer**: Dashed amber border, 12px italic text, only appears for known diagnostic patterns
- **Pattern table**: ~20 hand-authored `{keyword combination → diagnostic suggestion}` entries, not ML

---

### Journey: Dayo, 17, Returning After a Week

**Context:** Mission 6, resuming after a 7-day break. He's forgotten some game terms but remembers his channel names.

**Minute 0:00 — The Vocabulary Gap**
Dayo opens Robot Uprising after a week. The campaign map loads — Cebu province glowing gold, his current mission. He enters the Plan screen. His workbench shows his blueprint configs from last session. He vaguely remembers setting up channels but can't remember what "eviction" means. He sees the eviction dropdown on his relay's context config and thinks "what does this do again?"

**Minute 0:10 — Searching What He Remembers**
He opens the terminal and types "scout-eyes" — one of his channel names. He remembers naming it. He does NOT remember the game term "channel."

```
> scout-eyes

📡 scout-eyes                              [YOUR CHANNEL]
  Created: Mission 3
  Transmitters: Quick Scout (hook 1: ON_ENEMY_SPOTTED → scout-eyes)
  Listeners: Relay One (context config), Striker Mk2 (context config)

  Related concepts:
  → Channel: named communication pipe between units
  → Hook: reactive trigger (Quick Scout fires on ON_ENEMY_SPOTTED)
  → Signal: data sent through channels (contains: enemy position, type)
  → Latency: Quick Scout → Relay One = 2 ticks, Quick Scout → Striker Mk2 = 2 ticks

  💡 You haven't searched in 7 days. Tap any (?) for a refresher.
```

The "7 days" notice is subtle — a small footer noting the gap. Each game concept link has the `(?)` inline expansion. Dayo taps "Hook (?)" and re-reads the 3-sentence summary. The vocabulary comes back. He didn't need to search "hook" — he searched "scout-eyes" and the bridge page rebuilt his vocabulary map.

**Minute 0:40 — The Cascade Effect**
He taps "eviction (?)" from the related concepts of another search. Reads: "When a unit's context window is full, the entry with lowest priority is removed. You set eviction priority in context config." He nods — it comes back. He checks his relay's eviction policy, adjusts it, and resumes play. Total re-onboarding time: 2 minutes, achieved entirely through the player-vocabulary bridge.

**UI Annotations:**
- **Session gap notice**: `💡 You haven't searched in 7 days.` in 11px amber, bottom of first result card, only shown if gap > 3 days
- **Inline refresh**: `(?)` expansion includes a "last viewed: Mission 3" timestamp showing when the player last read this entry
- **Vocabulary heat**: recently searched terms glow brighter in result lists; terms not searched in 5+ days show a faint amber dot suggesting "you might want to review this"

---

## Strengths

**1. Meets Players Where They Are.** The terminal speaks the player's language first, then bridges to game language. This is the opposite of most game glossaries, which demand players already know the canonical term.

**2. Every Search Teaches.** The provenance trail ("scout-eyes is a channel you created") is a vocabulary lesson embedded in utility. Players learn game terminology through usage, not study.

**3. Returning Player Support.** Player-created names are more memorable than game terms after a break. The dual index makes session-resumption natural: search what you remember, get reminded of what you forgot.

**4. No Backend Required.** The player vocabulary index is built entirely from local save data — blueprint names, channel names, rule annotations. No server needed. Compatible with the locked no-backend tech stack.

---

## Weaknesses

**1. Index Maintenance Complexity.** Every config change (rename a channel, delete a blueprint) must update the player vocabulary index. Orphaned entries (deleted channels still in search history) need cleanup logic.

**2. Ambiguous Player Names.** A player who names a channel "hook" creates a collision with the game term. The dual provenance label (`[YOUR CHANNEL]` vs `[GAME TERM]`) mitigates this but may confuse beginners.

**3. Compound Query Brittleness.** "Why is my relay slow" requires hand-authored pattern matching. The pattern table must be curated by designers and will inevitably miss queries. Players who get good compound results once will expect the terminal to understand everything — and be disappointed when it doesn't.

**4. Search as Crutch.** If the terminal is too good, players may skip the experiential learning layer entirely and search-first for every concept. The "hands before head" principle (5.00) is undermined by a terminal that answers before the player has felt the question.

---

## Interaction Effects with Locked Decisions

**Boot Log.** The boot log introduces game vocabulary through narrative. The terminal indexes the same vocabulary for lookup. The two systems must share a vocabulary database — terms introduced in the boot log are immediately searchable in the terminal. Pre-introduction, searching a term shows "??? — You haven't encountered this system yet. [Continue the campaign to unlock.]" with a locked-silhouette icon matching the Blueprint Codex's locked card aesthetic.

**Blueprint Codex.** The Codex is a collection-style card browser. The terminal is a search engine. They serve different discovery patterns: Codex for browsing ("what do I have?"), terminal for searching ("what is this?"). Cross-linking is essential: terminal results include "View in Codex →" links, and Codex cards include "Search related →" links that open the terminal with a pre-filled query.

**Inspector.** The Inspector shows decision traces with game vocabulary ("Rule 2 matched, context entry from channel recon-net evicted"). Clicking any term in the Inspector trace should open the terminal with that term pre-searched. The Inspector is the *source* of vocabulary questions; the terminal is the *answer*.

**10-Mission Arc.** Player vocabulary grows with the campaign. By Mission 10, a player might have 20+ channel names, 8+ blueprint names, and dozens of rule annotations. The index must handle this scale without performance degradation. With the locked 10-mission scope, the maximum index size is bounded and manageable.

---

## Comparable Games

**Factorio.** Factorio's in-game search (introduced in 1.1) searches item names, recipe names, and technology names. It does NOT search player-created names (blueprint names, train station names). Players frequently complain about not being able to search their own blueprints by custom name. Robot Uprising should learn from this gap.

**Screeps.** Screeps has an in-game documentation system that mirrors the API docs. It searches code identifiers and API method names. It does NOT search player-created variable names or function names. The gap between "what I called it" and "what the API calls it" is a major friction source for new Screeps players.

**VS Code.** VS Code's Command Palette (Ctrl+Shift+P) searches *everything* — commands, settings, files, and recently used items. The "recently used" prioritization is a key design insight: what you searched recently is probably what you'll search again. Robot Uprising's terminal should similarly boost recent searches.

**Obsidian.** Obsidian's search indexes both note titles (canonical) and aliases (user-defined). Searching "meeting notes" finds a note titled "2026-03-15 Standup with Dev Team" if the user added "meeting notes" as an alias. The dual-index pattern is proven in knowledge management tools.

---

## Sensory Design

**Terminal Appearance:** Dark background (#1a1a2e), teal monospace text (#2ee8bb), amber accent for player-vocabulary results (#d4a843). The terminal has a subtle scanline effect — horizontal lines at 2px spacing, 5% opacity — giving it a CRT monitor feel. A blinking block cursor pulses at 500ms intervals in the search field.

**Search Feedback:** Typing produces a faint mechanical keystroke sound per character (soft, not clacky). Results appear with a 150ms slide-down animation, each card staggering 50ms after the previous. Fuzzy match suggestions have a slightly different slide — a 200ms ease-in-out that feels like the terminal is "thinking."

**Provenance Badges:** `[GAME TERM]` badges are teal pill-shaped, matching the boot log's color. `[YOUR NAME]` badges are amber pill-shaped, matching the workbench's configuration accent color. The color coding teaches the player to distinguish "things the game defined" from "things I defined" at a glance.

**No-Results State:** Instead of a blank screen, the terminal shows a faint grid of all indexed terms in 8px gray type — a subliminal reminder of what's searchable. The query text turns amber with a gentle pulse. A single suggestion appears: "Try: [most recently viewed term] or [most common search by other players in this mission]." The last suggestion requires analytics (tension with no-backend), so the fallback is "Try: [random game term from current mission's vocabulary]."

---

## The TikTok Clip

Side-by-side: left screen shows a player typing "threat-north" into a generic game glossary and getting "No results found." Right screen shows the same query in Robot Uprising's terminal — instant bridge page showing "threat-north is YOUR channel, here's how it connects to the hook system, here's why your signals are late." The right-side player's face lights up. Caption: "When the game actually speaks your language." The bridge page's amber and teal color-coding is visually distinctive enough to be recognizable in a 15-second clip.
