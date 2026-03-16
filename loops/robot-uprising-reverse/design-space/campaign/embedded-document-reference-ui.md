# Campaign: The Non-Alt-Tab Embedded Document UI

**Aspect ID:** 5.16
**Wave:** 5 (Campaign & Progression)
**Category:** Campaign / UI-UX crossover
**Related aspects:** 5.00 (external-documentation anti-pattern), 1.04b (diegetic tutorial documents), 3.14 (workbench layout), 1.17a (animated tooltip pattern), 3.07a (rules panel layout at scale), 3.04 (skill UI), 5.04b (vocabulary density curve)

---

## The Problem

The locked design specifies two reference systems:

1. **Boot log** — one-time diegetic narration per mission. Not re-readable mid-workbench. Gone after you've seen it.
2. **Blueprint Codex** — persistent collection-style card screen accessible anytime. Categories: Units, Skills, Rules, Hooks, Channels.

The Blueprint Codex is a **separate screen**. When a player is deep in the workbench — wiring hooks, configuring rules, tuning eviction priorities — and they need to look up "wait, does `compress` reduce slot count or signal fidelity?", they must:

1. Leave the workbench (navigate to Codex screen)
2. Find the card (browse/search)
3. Read the answer
4. Navigate back to the workbench
5. Remember the answer
6. Resume their configuration

This is four context switches. The information was 3 seconds away but the *flow interruption* was 15 seconds. In agentic AI terms: the player's own working memory got evicted by the navigation. They return to the workbench and have to re-orient: "Where was I? What was I configuring? What was the channel name I was about to type?"

**The question:** Can the reference live *inside* the workbench, so the player never leaves?

---

## The Design Space: Six Embedded Reference Models

### Model A: "The Sidebar Drawer" (Persistent Panel)

A collapsible panel on the right edge of the workbench. Always available. Click a tab or press `?` to slide it open. Click again to dismiss. The drawer contains the same content as the Blueprint Codex — unit cards, skill descriptions, hook documentation — but rendered inline as a scrollable reference panel.

**What it looks like:** The workbench occupies 100% width when the drawer is closed. A thin 4px cyan edge-glow on the right side hints at its presence. Press `?` or click the glow — the workbench compresses to ~65% width with a 200ms ease-out slide, and a 35%-width panel slides in from the right. The panel has a search bar at top, category tabs below (Units / Skills / Rules / Hooks / Channels / Glossary), and card-style entries in a scrollable list. Each card shows: icon, name, one-line description, expandable detail section. The panel casts a subtle drop shadow leftward onto the workbench, establishing visual hierarchy.

**Diegetic framing:** The drawer is styled as a terminal readout — monospace font, amber-on-dark-charcoal text, scan-line flicker on open, soft CRT hum. The header reads `> REFERENCE SUBSYSTEM v1.0 — QUERY:`. When the player types in the search bar, the text appears as if being typed into a command prompt. Results populate with a typewriter cascade (20ms per line). The aesthetic matches the boot log's self-documenting AI voice — the player is querying their own knowledge base.

**Interaction model:**
- `?` toggles drawer open/closed
- Typing immediately focuses the search bar (no click needed)
- Clicking any term in the workbench (skill name, hook label, rule condition) auto-opens the drawer to that term's entry
- Arrow keys navigate entries; `Enter` expands; `Escape` closes drawer
- The drawer remembers its last state (open/closed, scroll position, last search) across sessions

**Strengths:**
- Zero navigation. The reference is *in the room*, not down the hall.
- Contextual linking: clicking a workbench element opens its documentation instantly. The reference answers the question the player is currently asking.
- The 65/35 split is comfortable on 1080p+ screens. The workbench remains fully functional.
- Search-first interaction rewards the exact behavior the game wants to teach: precise queries, not browsing.

**Weaknesses:**
- 35% of screen width is substantial. On 1366×768 (still common on laptops), the workbench at 65% may be too cramped for complex Command agent configurations with 12+ rules.
- The drawer competes with the channel map panel (also on the right side in the locked spec — "Channel map panel is read-only auto-generated summary"). Two right-side panels creates spatial conflict.
- The persistent presence of a reference panel may discourage memorization. If the answer is always one keypress away, why internalize it?
- The CRT terminal aesthetic, while diegetic, may feel dated to players expecting modern search UX.

---

### Model B: "The Tooltip Upgrade" (Contextual Inline)

No separate panel. Instead, every interactive element in the workbench has a *rich* tooltip that appears on hover/long-press. The tooltip contains not just a label but the full Codex entry for that element — description, mechanical details, comparable examples, and a miniature animated demonstration (building on the animated tooltip pattern from 1.17a).

**What it looks like:** Hover over the `compress` skill slot in the blueprint editor. After 300ms, a floating card appears anchored to the skill slot. The card is ~280px wide, semi-transparent dark background with a soft blur behind it. Contents:

```
┌─────────────────────────────┐
│ 📦 COMPRESS                 │
│ ─────────────────────────── │
│ Reduces 2 context slots     │
│ into 1 summary slot.        │
│                              │
│ ▸ [3-tick micro-scenario]   │
│   Scout sends 4 signals →   │
│   Relay has 3 slots left →  │
│   Compress fires → 2 become │
│   1 → slot freed → signal   │
│   arrives safely             │
│                              │
│ ⚡ Cost: Uses 1 tick         │
│ 🔗 Works with: filter,      │
│    amplify                   │
│ 📖 First seen: Mission 3    │
│                              │
│ [Pin] [Codex →]             │
└─────────────────────────────┘
```

The micro-scenario plays automatically — a tiny 3×3 board preview in the card shows ghosts acting out the compress operation. The animation loops every 4 seconds.

**Diegetic framing:** The tooltip card has the same circuit-trace border as the boot log text. The "First seen: Mission 3" line grounds the information in the player's personal history. The micro-scenario uses the same holographic ghost rendering as the plan screen's unit preview.

**Interaction model:**
- Hover (desktop) or long-press (mobile) triggers the tooltip
- The tooltip stays visible as long as the cursor remains on the element or the tooltip itself
- `[Pin]` button pins the tooltip to the screen (floating, draggable). Pinned tooltips stay visible while the player configures other elements. Maximum 3 pinned tooltips at once.
- `[Codex →]` opens the full Blueprint Codex to that entry (for deep-divers who want more)
- Right-click any workbench element → context menu includes "What is this?" which opens the tooltip in pinned mode

**Strengths:**
- Zero screen real estate cost when not in use. The workbench is always 100% width.
- The reference appears *at the point of confusion* — where the player's eyes already are. No saccade to a sidebar, no refocusing.
- The pinning mechanic lets players create temporary reference layouts: pin `compress`, pin `filter`, pin `amplify`, then compare them side-by-side while configuring a relay.
- The micro-scenario (from 1.17a) does what text cannot: it *shows* the mechanic in 4 seconds. Into the Breach's weapon tooltips proved this is the gold standard.

**Weaknesses:**
- Tooltips are ephemeral. They vanish when you move the mouse. Even with pinning, the player must actively manage their reference state.
- Complex questions ("how does compress interact with eviction policy FIFO?") can't be answered by a single tooltip. The player needs to cross-reference multiple entries — which means pinning both, reading both, synthesizing. A sidebar with search can answer cross-cutting questions faster.
- Three pinned tooltips floating over the workbench can obscure the very elements the player is trying to configure. Spatial management becomes a mini-game.
- Mobile long-press conflicts with drag gestures. The tooltip trigger must be carefully disambiguated from "I'm trying to drag this skill to a slot."

---

### Model C: "The Command Palette" (Search-First Overlay)

No persistent panel, no enhanced tooltips. Instead, a command palette — a floating search bar — summonable from anywhere with `?` or `Ctrl+K`. Type a question or term, get instant results. Dismiss with `Escape`.

**What it looks like:** Press `?`. The screen dims to 70% brightness. A search bar appears centered, 600px wide, 48px tall, with a blinking cursor and the placeholder text `What do you need to know?`. As the player types, results appear below in a dropdown list — each result showing an icon, term name, and one-line description. Selecting a result (click or Enter) expands it into a floating card (same design as Model B's tooltip card, but anchored to the center of the screen, not to a workbench element).

**Diegetic framing:** The dimmed screen represents the AI's "internal query mode." The search bar header reads `> KNOWLEDGE QUERY`. Typing produces the same amber-on-charcoal terminal aesthetic. Results appear with a quiet `tik-tik-tik` like a Rolodex spinning. Selecting a result produces a soft `ka-chunk` — a file being pulled from the AI's memory banks.

**Interaction model:**
- `?` or `Ctrl+K` opens the palette
- Typing filters results in real-time (fuzzy matching on term names, descriptions, and aliases)
- Arrow keys navigate results
- Enter opens the selected result as a floating card
- Escape at any point dismisses everything
- The palette supports natural-language-ish queries: typing "what does compress do" matches the `compress` skill entry. Typing "relay skills" shows all skills available to Relay units.
- History: the palette remembers the last 10 queries, shown as suggestions when the palette opens empty

**Strengths:**
- The lightest-weight UI of all models. No persistent screen real estate. No panel management. Summon, query, dismiss.
- Search-first UX trains the exact behavior the game wants: formulating precise questions. The player who types "compress" is practicing the same query behavior they'd use with an LLM, a search engine, or a documentation site.
- The dimmed-screen overlay creates a clean separation between "configuring" and "researching" without a full screen transition. It's a *modal pause*, not a *screen change*.
- Works identically on desktop and mobile. On mobile, the palette rises from the bottom with the on-screen keyboard.
- Familiar pattern: VS Code's `Ctrl+Shift+P`, macOS Spotlight, Raycast, Alfred. Power users will adopt it instantly.

**Weaknesses:**
- Requires the player to know (or guess) what to search for. A player who doesn't know the word "eviction" can't search for it. Browsing-friendly interfaces (sidebar, Codex) let you discover what you don't know exists.
- The modal overlay blocks the workbench entirely while active. The player cannot simultaneously read a reference card AND configure a skill slot — they must read, dismiss, then configure from memory.
- No spatial anchoring. The result card floats in the center, disconnected from the workbench element the player was confused about. The player must hold the connection in their head: "I was looking at the relay's hook slot, and the answer says..."
- For players who reference frequently (new players in early missions), the summon→search→read→dismiss cycle every 30 seconds becomes friction. A persistent sidebar would be lower-ceremony.

---

### Model D: "The Split View" (Workbench + Reference, 50/50)

A dedicated mode where the screen splits evenly: workbench on the left, full Codex browser on the right. Toggled with a button or hotkey. When in split view, both sides are fully interactive — the player can browse the Codex, then immediately apply what they read in the workbench. Clicking a term in the Codex highlights the corresponding element in the workbench (and vice versa).

**What it looks like:** Press `Tab` or click the 📖 icon in the workbench toolbar. The workbench slides left to occupy 50% of the screen. The right 50% reveals the full Blueprint Codex — not a simplified sidebar, but the complete card collection with categories, search, and detail views. The split is adjustable (drag the divider). A golden tether line connects the Codex's current entry to its corresponding workbench element: if the Codex shows `compress`, a glowing golden line arcs from the Codex card to the relay's skill slot in the workbench, pulsing softly.

**Diegetic framing:** The split represents the AI running a "dual-process" mode — left hemisphere (configuration) and right hemisphere (knowledge retrieval) operating simultaneously. The divider bar has a circuit-trace texture. When split view activates, a soft `systems aligned` chime plays, and the boot-log-style header reads `> DUAL-PROCESS MODE: CONFIG | REFERENCE`.

**Interaction model:**
- `Tab` toggles split view on/off
- Drag the divider to adjust proportions (40/60, 50/50, 60/40)
- Click any term in the Codex → golden tether to workbench element
- Click any element in the workbench → Codex navigates to that entry
- Both sides scroll independently
- Hovering over a Codex entry still triggers the micro-scenario animation in the workbench's board preview

**Strengths:**
- Full reference + full workbench simultaneously. No compromise on either side. The player can read a detailed explanation of hook chaining while staring at their hook configuration.
- The golden tether creates a *spatial link* between knowledge and configuration. The player doesn't have to hold the connection in their head — it's drawn on screen.
- The Codex in split view has full browsing capability. Players who don't know what to search for can browse by category and discover terms they haven't encountered.
- The adjustable divider respects player preference: new players might want 40/60 (more Codex), veterans 70/30 (mostly workbench with a slim reference strip).

**Weaknesses:**
- 50% workbench width is often not enough. The blueprint editor with 4 sections (skills, rules, hooks, context config) is already dense. At 50% width, elements may need to stack vertically, changing the spatial layout the player has learned.
- The golden tether connecting Codex to workbench elements becomes visual noise when multiple connections exist. With 3+ skills visible, each with a potential tether, the screen becomes a cat's cradle.
- This is essentially the "Alt-Tab between two windows" pattern, except both windows are on the same screen. The cognitive split is the same — the player's attention is divided between two panels, neither of which has their full focus.
- On smaller screens (1366×768), the split is uncomfortable. Both sides are too narrow to be functional.

---

### Model E: "The Annotation Layer" (Knowledge-on-Demand Per Element)

No separate reference panel. Instead, every workbench element can be "annotated" — clicking an 💡 icon (or pressing `?` while focused on an element) expands that element in-place to show its full documentation. The workbench rearranges around the expanded element.

**What it looks like:** The player is configuring a relay's hooks. They see the hook slot labeled `ON_RECEIVE → east_flank`. They don't remember what `ON_RECEIVE` does. They click the small 💡 icon to the right of the hook trigger dropdown. The hook slot *expands vertically* — from a single 40px-tall row to a 200px-tall block. The expanded block contains:

```
┌─────────────────────────────────────────────┐
│ 📖 ON_RECEIVE                                │
│ ─────────────────────────────────────────── │
│ Fires when this unit receives a signal on   │
│ any listened channel.                        │
│                                              │
│ ▸ [Micro-scenario: signal arrives, hook      │
│    fires, payload forwarded]                 │
│                                              │
│ Condition fields: channel (optional filter), │
│ signal_type (optional filter)                │
│                                              │
│ 💡 Tip: ON_RECEIVE + compress = automatic   │
│    signal compaction on relay chains          │
│                                              │
│              [Collapse ▲]                    │
└─────────────────────────────────────────────┘
```

Other workbench elements push downward to make room. The expanded section has a slightly different background (darker, with the circuit-trace border) to distinguish documentation from configuration.

**Diegetic framing:** The expansion is styled as a "memory recall" — the AI accessing its knowledge about this specific subsystem. A brief shimmer effect (100ms) accompanies the expansion, like memory crystallizing. The circuit-trace border matches the boot log aesthetic.

**Interaction model:**
- 💡 icon appears on hover/focus for every configurable element
- Click 💡 → element expands in-place with documentation
- `[Collapse ▲]` or clicking 💡 again closes it
- Multiple elements can be expanded simultaneously (the workbench scrolls to accommodate)
- Expanded documentation includes "See also" links to related terms (clicking navigates to that element and expands it)

**Strengths:**
- The documentation is *literally attached to the thing it describes*. Zero spatial disconnect. The player reads about `ON_RECEIVE` while staring at their `ON_RECEIVE` configuration.
- No separate UI to manage. No sidebar, no overlay, no split view. The workbench IS the reference.
- The progressive expansion creates a natural reading flow: "I'm confused about this hook trigger" → expand → read → "oh, and it mentions compress" → navigate to compress skill → expand → read → collapse both → back to configuring.
- Mobile-friendly. Tap the 💡, section expands. No panel management.

**Weaknesses:**
- Expanding elements pushes other content off-screen. If the player expands a hook annotation near the top of the blueprint editor, the rules section below may scroll entirely out of view. The player may lose orientation: "Where did my rules go?"
- Multiple expanded annotations stacked vertically can make the workbench very tall. The player scrolls past walls of documentation to find their configuration elements. This is the "accordion from hell" problem.
- The documentation is fragmented — each element knows about itself but not about the system as a whole. Cross-cutting questions ("how do hooks and eviction policies interact?") can't be answered by any single element's annotation.
- The 💡 icons, even small, add visual noise to an already dense workbench. With 4 skill slots, 6 hook slots, 8 rule slots, and 5 context config toggles on a Command agent — that's 23 💡 icons.

---

### Model F: "The Diegetic Terminal" (In-World Query System) — RECOMMENDED

A hybrid of Models A and C. A retractable terminal panel at the bottom of the workbench — like a browser dev tools panel or VS Code's integrated terminal. The panel is context-aware: it automatically shows relevant documentation based on what the player is currently editing, but also supports free-text search for cross-cutting queries.

**What it looks like:** The bottom 20% of the workbench screen shows a thin collapsed bar with the text `> REFERENCE TERMINAL [?]` in dim amber monospace. The bar has a subtle upward-pointing chevron. Click it or press `?` — the bar expands upward to occupy the bottom 30% of the screen (adjustable via drag). The expanded terminal has three columns:

**Left column (30%):** "CONTEXT" — auto-populated based on the workbench element the player last clicked. If the player just clicked a hook slot, this column shows the hook trigger documentation. If they just clicked a skill toggle, it shows the skill documentation. Updates in real-time as the player navigates the workbench. The column header reads `> ACTIVE CONTEXT: {element_name}` and pulses softly cyan when content changes.

**Center column (40%):** "QUERY" — a search bar and results area. Type a term or question, get results. This is Model C's command palette, but persistent and anchored to the bottom of the screen. The search bar placeholder text: `query your knowledge base...`. Results show card-style entries with expandable details.

**Right column (30%):** "RELATED" — shows terms related to both the active context AND the last search query. If the active context is `compress` and the search query was "eviction," the related column shows: `buffer overflow`, `context overload`, `FIFO`, `LRU`, `signal loss`. This column is the "serendipity engine" — it surfaces connections the player didn't explicitly ask about. Each related term is clickable (populates the center column).

**The panel border** is a thin circuit-trace line that matches the boot log aesthetic. A faint scan-line animation scrolls upward every 3 seconds. The background is darker than the workbench (charcoal vs. dark grey), establishing visual layering.

**Audio:** Opening the terminal produces a soft mechanical `clack-hiss` (pneumatic panel sliding open). Context updates produce a quiet `pip`. Search results cascade with the Rolodex `tik-tik-tik`. Closing produces a `whoosh-click` (panel retracting).

**Diegetic framing:** The terminal IS the AI's knowledge retrieval subsystem. The boot log in Mission 1 introduces it: "REFERENCE SUBSYSTEM ONLINE. Your knowledge base grows as you learn. Press `?` to query it. I'll surface what's relevant to what you're currently configuring." The terminal has a version number that increments as new terms are unlocked — `v1.4` means 4 terms learned. By Mission 10, `v1.30` — the full vocabulary.

**Interaction model:**
- `?` toggles terminal open/closed
- Terminal auto-opens on first encounter with a new term (then user can dismiss)
- Clicking any workbench element updates the left context column
- Typing in the search bar filters the center column
- Related terms in the right column are clickable
- The terminal remembers its state (open/closed, height, last search) across sessions
- Drag the top edge to resize (20%-50% of screen height)
- Double-click the top edge to toggle between collapsed (bar only) and last-used height
- `Escape` collapses the terminal
- Micro-scenario animations play inline within the context column (same 3×3 ghost preview as 1.17a)

**Strengths:**
- The three-column layout answers three questions simultaneously: "What am I looking at?" (context), "What do I want to know?" (query), "What else should I know?" (related). No other model answers all three.
- The bottom position doesn't compete with the workbench's existing right-side panels (channel map, board preview). The workbench layout remains horizontally unmodified.
- Context-awareness reduces search friction to zero for common cases. The player clicks a confusing element and the answer is already showing in the left column. They only need to search when their question is cross-cutting.
- The "related" column creates learning connections the player didn't seek. Browsing related terms after resolving confusion is how vocabulary depth develops. The serendipity engine models real learning behavior — you look up one thing and discover three related things.
- The terminal aesthetic is deeply diegetic and consistent with the game's AI-self-documenting narrative. The player isn't using "the help system." They're querying their own memory subsystem. When the version number increments after learning a new term, the terminal is literally upgrading itself. This IS the game's metaphor.
- Adjustable height means the player controls the trade-off: more reference = less workbench, and vice versa. New players keep it at 40%. Veterans collapse it entirely and summon it only when needed.

**Weaknesses:**
- Bottom panels reduce vertical space for the workbench. The blueprint editor sections (skills, rules, hooks, context config) are vertically stacked. Losing 30% of vertical space may require the editor to scroll, reintroducing the very "content pushed off-screen" problem that Model E suffered.
- Three columns at 30/40/30 split at the bottom of the screen means each column is narrow. On 1080p, the center column is ~380px wide — enough for short entries but cramped for detailed mechanical descriptions.
- The auto-context feature may be too "smart" — changing the context column every time the player clicks something could feel disorienting. The player may think "I was just reading about compress, why did it change to eviction?" Mitigation: a "pin context" toggle that freezes the left column.
- The terminal version number (`v1.30`) is a cute detail but could create anxiety in completionists: "I'm at v1.18 but what are the 12 terms I'm missing?" Mitigation: the version number links to a progress view showing learned/unlearned terms.

---

## Cross-Model Comparison Matrix

| Dimension | Sidebar (A) | Tooltip (B) | Palette (C) | Split View (D) | Annotation (E) | Terminal (F) |
|-----------|:-----------:|:-----------:|:-----------:|:--------------:|:--------------:|:------------:|
| Zero-nav from confusion | ★★★★ | ★★★★★ | ★★★ | ★★★ | ★★★★★ | ★★★★ |
| Screen real estate cost | ★★ | ★★★★★ | ★★★★★ | ★ | ★★★★ | ★★★ |
| Cross-cutting queries | ★★★★ | ★★ | ★★★★ | ★★★★★ | ★ | ★★★★★ |
| Browsing/discovery | ★★★★ | ★ | ★★ | ★★★★★ | ★★ | ★★★ |
| Diegetic integration | ★★★ | ★★★★ | ★★★ | ★★ | ★★★★ | ★★★★★ |
| Mobile/controller | ★★ | ★★★ | ★★★★★ | ★ | ★★★★ | ★★★ |
| Veteran usability | ★★★ | ★★★★ | ★★★★★ | ★★★ | ★★★★ | ★★★★★ |
| New player usability | ★★★★ | ★★★★ | ★★ | ★★★★ | ★★★★ | ★★★★★ |
| Codex relationship | replaces | supplements | supplements | embeds | bypasses | supplements |
| Minimum screen width | 1280px | 800px | 800px | 1440px | 800px | 1024px |

---

## The Codex Question: Replace, Embed, or Supplement?

The locked design specifies the Blueprint Codex as a "persistent reference accessible anytime. Collection-style card screen." The embedded reference panel doesn't necessarily replace the Codex — it may supplement it.

**Option 1: Terminal replaces Codex.** The terminal IS the reference system. No separate Codex screen exists. Everything lives in the bottom panel. This is the cleanest design but loses the "collection-style card screen" feel — the terminal is utilitarian, not beautiful. The Codex's collectible quality (silhouettes for locked cards, growing collection) doesn't translate well to a terminal aesthetic.

**Option 2: Terminal supplements Codex.** Both exist. The terminal is the in-workbench quick reference. The Codex is the full collection screen (accessible from the campaign map, between missions). The terminal entries are abbreviated versions of Codex cards. Clicking `[Full Entry →]` in the terminal navigates to the Codex. The relationship: terminal is the field manual, Codex is the library.

**Option 3: Terminal IS the Codex, docked.** The Codex screen is literally the terminal panel, un-docked and full-screened. The same data, the same search, the same entries — but filling the entire screen with a gallery layout instead of the three-column panel layout. `?` opens it docked (in-workbench). A dedicated nav button opens it undocked (full-screen collection). Same data, two views.

**Recommendation: Option 2 — supplement.** The terminal and the Codex serve different emotional needs. The terminal serves *flow* — the player is configuring and needs an answer NOW. The Codex serves *collection* — the player is between missions and wants to browse what they've learned, admire their growing card collection, discover synergies they haven't tried. These are different moods. Collapsing them into one system loses the Codex's collectible joy. The terminal is utilitarian by design; the Codex should be beautiful.

---

## Player Journeys

### Journey: Mika, 14, Manila — First Strategy Game

**Context:** Mission 3 (Relay). Mika just completed Mission 2, where she learned about buffer eviction. Now she's configuring her first relay. She's seen the boot log introduction to hooks and channels but didn't fully absorb it — she was excited to start playing, not reading.

**Minute 0:00 — The Empty Hook Slot**
Mika is in the workbench. The blueprint editor shows her relay's configuration. She can see the skills section (compress and filter are toggleable), the rules section (two empty slots), and the hooks section. The hooks section has two slot outlines, dashed cyan, labeled `HOOK SLOT 1` and `HOOK SLOT 2`. She stares at them. She's supposed to wire something here. The boot log mentioned channels. She doesn't remember what a channel is.

She notices the bottom bar: `> REFERENCE TERMINAL [?]` in dim amber text. She presses `?`.

**Minute 0:15 — The Terminal Opens**
The bar expands upward with a soft `clack-hiss`. Three columns appear. The left column reads `> ACTIVE CONTEXT: Hook Slot (empty)` and shows a brief explanation: "Hooks are reactive triggers. When something happens, a hook fires and sends a signal on a channel." Below the text, a micro-scenario plays: a tiny ghost scout detects an enemy, its hook flashes, a green signal dot travels along a wire to a relay.

Mika watches the micro-scenario loop twice. "Oh. So the hook is like... a trip wire? And the channel is the string connecting it to someone else?"

The right column (RELATED) shows: `channel`, `signal`, `ON_DETECT`, `ON_RECEIVE`, `latency`. She doesn't know what most of these mean, but she clicks `channel`.

**Minute 0:35 — Following the Thread**
The center column now shows the `channel` entry: "A named pipe connecting agents. Type any name into a hook's channel field — the channel is created. All agents listening on that channel receive all signals." The micro-scenario shows two units, a typed channel name `east`, and signals flowing between them.

Mika thinks: "So I just type a name? Any name? And it connects things?" She collapses the terminal (`?` again — `whoosh-click`). Back in the workbench, she clicks Hook Slot 1. A trigger dropdown appears. She doesn't know which trigger to pick. She presses `?` again.

**Minute 0:55 — Context-Aware Help**
The terminal opens. The left column has auto-updated: `> ACTIVE CONTEXT: Hook Trigger Selection`. It shows the five available triggers with one-line descriptions: `ON_DETECT — fires when this unit perceives an enemy`, `ON_RECEIVE — fires when this unit receives a signal`, etc. Each has a micro-scenario thumbnail.

Mika reads them. "ON_DETECT. When I see an enemy, yell about it. That makes sense for a scout." She selects `ON_DETECT`, then types `east` in the channel field. The terminal's context updates to show the newly created channel. The right RELATED column now shows `ON_RECEIVE` with a nudge: "💡 Another agent will need ON_RECEIVE on this channel to hear the scout's signal."

**Minute 1:20 — The Nudge**
Mika reads the nudge. "Oh! The relay needs a hook too." She navigates to the relay's blueprint, adds a hook with `ON_RECEIVE` on channel `east`. The terminal's RELATED column updates: `compress`, `amplify`, `filter` — skills that process received signals. Mika sees `compress` and clicks it. "Reduces 2 context slots into 1 summary slot." She toggles compress on.

She's built a scout→relay pipeline in under two minutes, guided entirely by the terminal's contextual suggestions, without ever leaving the workbench.

**Minute 1:45 — Terminal Dismissed**
Mika collapses the terminal. She's back to 100% workbench, ready to configure rules. The terminal bar at the bottom reads `v1.8` — she's learned 8 terms this session. She doesn't consciously notice, but the number will be 12 by end of mission.

**UI Annotations:**
- Terminal bar: 40px height, full width, dark charcoal bg, amber monospace text, 4px cyan top-border glow
- Terminal expanded: 30% screen height, three columns (30/40/30), drag-resizable top edge
- Context column: auto-updates on workbench navigation, 100ms cyan pulse on content change
- Related column: clickable term pills with hover preview, "💡" prefix on nudges
- Micro-scenarios: 120×80px inline preview, loops every 4s, ghost rendering

---

### Journey: Derek, 31, Portland — Software Engineer (Mission 7, Command Agent)

**Context:** Mission 7. Derek has 25 learned terms. He's configuring a Command agent for the first time — the blueprint editor is dense, with 6 hook slots, 14-slot context config, and a rules section that accepts up to 12 ordered rules. He's comfortable with the game's basics but the Command agent has new skills he hasn't used: `reassign`, `reroute`, `prioritize`.

**Minute 0:00 — The Command Agent Workbench**
Derek sees the Command agent blueprint. The skill section shows three unfamiliar skills with silhouette icons (they'll render fully once he's used them in battle). He clicks `reassign`.

**Minute 0:05 — Terminal Context**
The terminal is already docked at his preferred 25% height from previous missions. The left CONTEXT column updates: `> ACTIVE CONTEXT: reassign (Command skill)`. Content: "Modifies a subordinate unit's active skill set during battle. Target: any unit within Command's managed group. Effect: swaps one skill for another on the target's loadout. Latency: applies next tick. Constraint: the replacement skill must be in the target blueprint's available (but unequipped) skill set."

Derek reads this carefully. "So it can only swap to skills the unit already *has* but didn't *equip*? That means the loadout decisions in the Plan phase still matter — reassign doesn't give infinite flexibility, it gives flexibility within the pre-planned space."

**Minute 0:25 — Cross-Cutting Query**
He types in the center QUERY column: `reassign + hooks`. Results: "Hook: ON_REASSIGN — fires when a subordinate's skill set is modified by a Command agent. Available on Command units." And: "Pattern: Command detects subordinate struggling (via ON_RECEIVE of distress signal) → reassign skill → ON_REASSIGN hook fires → other subordinates notified of the change."

The RELATED column shows: `reroute`, `prioritize`, `managed group`, `Command rules`. Derek clicks `managed group`. "The set of units whose blueprints designate this Command agent as their manager. Set in blueprint editor via Manager Assignment field. A unit can have at most one manager."

**Minute 0:50 — The Aha Moment**
Derek mutters: "This is literally Kubernetes. The Command agent is a controller. Managed group is a Deployment. Reassign is a rolling update. Reroute is changing service mesh routes. Prioritize is resource quotas." He grins. He types `reroute` in the query. "Modifies a subordinate's hook channel subscriptions during battle. Can add or remove channel listeners." He types `prioritize`. "Modifies a subordinate's context eviction priority during battle."

In three queries, without leaving the workbench, Derek has understood the complete Command skill vocabulary. Each query took 10 seconds. Total reference time: 50 seconds. He would have spent 2-3 minutes navigating the Codex for the same information.

**Minute 1:15 — Building the Controller**
Derek collapses the terminal to its bar and starts configuring. Rule 1: `IF received(distress, from:scout) THEN reassign(scout, patrol→evade)`. Rule 2: `IF received(contact, from:relay) THEN reroute(striker, add:channel=contact_zone)`. He's building a Kubernetes controller in 12 rules. The terminal bar reads `v1.27`.

**UI Annotations:**
- Query results: fuzzy matching on compound queries (`reassign + hooks` matches entries mentioning both)
- Pattern results: auto-synthesized from cross-referencing entries, formatted as `Pattern: trigger → action → consequence`
- Terminal height: user-persisted at 25% (Derek's preference, set during Mission 5)

---

### Journey: Rosa, 62, Cebu — Retired Nurse (Mission 5, Factory Introduction)

**Context:** Mission 5. Rosa has played Missions 1-4 comfortably, learning at her own pace. She likes the game but finds the vocabulary challenging. She keeps the terminal at 40% height (more reference, less workbench). She's just been introduced to the factory, blueprints, and production queue.

**Minute 0:00 — Too Many New Things**
The boot log just introduced three new concepts in rapid succession: blueprint, production queue, cost. Rosa feels overwhelmed. She stares at the workbench. The production queue is a horizontal conveyor belt strip she hasn't seen before. The blueprint editor now has a "COST: 5m, 2e/tick" label she doesn't understand.

She presses `?`. The terminal opens to 40%.

**Minute 0:10 — Guided Reading**
The left CONTEXT column shows `> ACTIVE CONTEXT: Production Queue (new)` with a yellow "NEW" badge. The content reads: "Think of this as a waiting list. You add blueprints to the queue. The factory builds them in order, from left to right. Each blueprint takes time and materials to build."

Rosa reads this twice. The micro-scenario shows a conveyor belt with three blueprint icons sliding left. A factory at the left end blinks, and a unit appears on the battlefield. "Okay. Like a hospital intake queue. First patient in, first patient treated."

She clicks the cost label. The context updates: "COST: 5m = 5 minerals to build. 2e/tick = 2 energy per tick to keep running. If you run out of energy, this unit shuts down." The micro-scenario shows a unit running out of energy — it flickers, dims, and a red ⚡ icon appears.

**Minute 0:40 — The Related Column Teaches**
The RELATED column shows: `mineral`, `energy`, `passive income`, `tagging`, `build time`. Rosa clicks `passive income`. "You receive minerals and energy automatically each tick. No need to build harvesters." She relaxes. "Oh good, I don't have to manage workers. It just gives me money."

She clicks `tagging`. "Units near map nodes 'tag' them, increasing your income. More nodes tagged = more resources per tick." Rosa thinks: "Scouts are cheap and fast. I should spread them out to tag nodes. Like sending nurses to different wards."

**Minute 1:20 — Building Confidence**
Rosa has read five entries in the terminal without leaving the workbench. She now understands the basic economy. She drags a scout blueprint to the production queue, then a relay, then a striker. The cost preview below the queue reads: `Total: 16m | Income: 3m/tick | Break-even: Tick 6`. She understands this because she read the `cost` and `passive income` entries 30 seconds ago.

She collapses the terminal to 30% (she's gaining confidence — needs slightly less reference). The bar reads `v1.19`.

**UI Annotations:**
- "NEW" yellow badge: appears on context entries for terms learned in the current mission, persists for the session
- Cost preview: auto-calculated below production queue, updates live as blueprints are added/removed/reordered
- Terminal at 40%: Rosa's persisted preference, taking more screen for reference at cost of workbench density

---

### Journey: Kwame, 28, Lagos — Diamond-Rank Streamer (Mission 9, Gauntlet Prep)

**Context:** Mission 9. Kwame has completed the campaign and is preparing for competitive Gauntlet play. He has all 30 terms. His terminal is collapsed to the bar — he rarely needs it. But he's about to discover a cross-cutting interaction he missed.

**Minute 0:00 — The Theory-Craft Session**
Kwame is building a "Dark Net" config: maximum intelligence with minimum EM emissions. He's using relays with `compress` to reduce signal volume and `filter` to block noise. His command agent has `reroute` to dynamically connect/disconnect subordinates from channels based on threat level.

He types in the terminal query (pressing `?` quickly, out of habit): `EM emission + compress`. The terminal opens just enough to show the center column. Result: "Compress reduces payload size but DOES NOT reduce EM emission count. Each hook firing produces one emission event regardless of payload size. To reduce EM, reduce hook firing frequency, not payload size."

**Minute 0:15 — The Stream Moment**
Kwame's eyes widen. "Chat. CHAT. I've been running compress thinking it made my network quieter. It doesn't. It makes messages smaller, but the ENEMY still hears every ping." He checks the RELATED column: `ON_SILENCE`, `dark network`, `cold chaining`, `emit count`. He clicks `dark network`. "A configuration pattern where agents minimize hook firing by using wider perception radii and local-only rules, reducing total EM emissions at the cost of slower coordination."

"That's what I need. Not compress — I need to fire FEWER hooks, not smaller hooks." He starts reconfiguring.

**Minute 0:40 — Teaching Chat**
He types `emit count formula`. The terminal shows: "EM emission count per tick = number of hook firings by all player units. Each firing adds 1 to the emission counter. Enemy detection radius for emissions: 3 tiles per emission point." Kwame reads this aloud to stream. "So if I have 8 units each firing 1 hook per tick, that's 8 emissions = detectable from 24 tiles. The ENTIRE BOARD is only 8 tiles across. They hear EVERYTHING."

He rapidly reconfigures: reduces hook slots from max to 1 per scout, switches scouts from active-reporting to perception-only patrol patterns, uses a single relay as the bottleneck (compress + filter here DOES reduce downstream hook count because fewer signals reach the relay's outbound hooks).

**Minute 1:30 — Terminal Closed**
Kwame collapses the terminal. He's built a fundamentally different architecture in 90 seconds, guided by one cross-cutting query that revealed a misconception. Chat is full of "I DIDN'T KNOW THAT EITHER" messages. He says: "The terminal just saved me from a Diamond demotion. Chat, always query your assumptions."

**UI Annotations:**
- Query `EM emission + compress`: cross-references two entries and synthesizes the interaction
- Expert-mode terminal usage: open, query, read, close in <10 seconds. The terminal is optimized for this fast-in-fast-out pattern.
- Stream overlay: terminal text is readable at 720p stream resolution due to monospace font and high contrast

---

## Interaction Effects

### × Animated Tooltip Pattern (1.17a)
The terminal's micro-scenarios use the SAME animation system as the workbench's hover tooltips. The player learns one visual language that works in two contexts: tooltips for instant comprehension, terminal for persistent reference. The tooltip is the fast path; the terminal is the deep path. Both use ghost units, 3×3 preview boards, and tick-counter pips.

### × External Documentation Anti-Pattern (5.00)
The terminal directly implements the "Position 3.5" identified in the anti-pattern analysis: an integrated reference that is context-sensitive (like tooltips) but persistent (like an encyclopedia) and diegetic (like the boot log). It resolves the tooltip-fatigue problem by moving detailed content OUT of ephemeral tooltips and INTO a persistent panel.

### × Vocabulary Density Curve (5.04b)
The terminal's version number (`v1.N`) creates a visible progress metric for vocabulary acquisition. This interacts with the density curve: missions with high term density will show rapid version increments (v1.8 → v1.14 in one mission), while consolidation missions show slow or zero increments. The player can feel the density curve through the terminal's version counter.

### × Blueprint Codex (locked)
The terminal supplements, not replaces, the Codex. The terminal is the field manual (in-flow reference during configuration). The Codex is the library (between-mission collection browsing, discovery, admiration). The terminal links to the Codex with `[Full Entry →]` buttons on each entry.

### × Workbench Layout (locked)
The bottom-panel position is critical. The locked workbench has: board preview (left), blueprint editor (right), production queue (bottom horizontal strip). The terminal sits BELOW the production queue or shares the bottom zone. If the production queue is visible simultaneously with the terminal, the bottom becomes crowded. Mitigation: the production queue collapses to a thin strip when the terminal is open, showing only blueprint icons without the cost preview.

### × Channel Map Panel (locked — right side)
No conflict. The terminal is at the bottom, the channel map is on the right. Both can be visible simultaneously. The terminal's RELATED column may show channel-related terms that link to the channel map — clicking a channel name in the terminal highlights it in the channel map.

### × Mobile/Touch (platform)
On mobile, the terminal becomes a slide-up sheet (iOS-style). Long-press any workbench element to open the terminal to that element's context. The three-column layout stacks vertically on phone (context on top, query in middle, related at bottom — each scrollable). On tablet, the three-column layout works in landscape. The terminal replaces the keyboard when not in search mode; opening the search bar raises the keyboard and collapses the terminal to query-only.

### × Inspector Phase
The terminal is available during Inspector as well — click any element in the replay (unit, signal, rule) to query it. This creates continuity between Plan and Inspector reference. The same terminal, same data, same aesthetic, but now grounded in post-battle analysis rather than pre-battle configuration. During Inspector, the terminal may also show "WHAT WENT WRONG" entries synthesized from the replay — "RELAY-C's compress skill fired at tick 8 but no downstream agent was listening on channel `compressed_data` at that tick."

---

## Comparable Systems

### VS Code Integrated Terminal / Panel
The closest analog. VS Code's bottom panel (Terminal, Problems, Output, Debug Console) is exactly the "persistent bottom reference" pattern. It's resizable, collapsible, and multi-tabbed. VS Code developers report that the integrated terminal fundamentally changed their workflow — no more alt-tabbing to a separate terminal window. The same flow improvement applies here.

### Factorio In-Game Tips
Factorio 1.1 added "Tips and Tricks" — an in-game interactive tutorial system that plays canned scenarios demonstrating mechanics. Players can access it from the menu but it's also triggered contextually ("You just placed your first inserter. Here's how inserters work."). The contextual triggering is exactly what the terminal's CONTEXT column does — but Factorio's system is modal (full-screen overlay), while the terminal is non-modal (bottom panel).

### Civilization VII Civilopedia
The Civilopedia is a sidebar that can be opened from any game screen. It's comprehensive but not context-sensitive — the player must search or browse to find what they need. The terminal improves on this by auto-populating context and by surfacing related terms.

### Slay the Spire Card Library
Accessible during runs, the card library shows all cards the player has seen. It's a full-screen overlay, not an embedded panel. The player must pause their run to browse. The terminal's advantage is non-modal access — the player reads and configures simultaneously.

### Into the Breach Tooltip System
Into the Breach has NO separate reference system. All information is communicated through in-context tooltips on hover. This works because Into the Breach has ~15 distinct mechanics. Robot Uprising has ~30 terms plus hundreds of combinations — pure tooltip coverage would create tooltip fatigue. The terminal is the scalability answer to Into the Breach's approach.

---

## Sensory Description

The terminal is a **quiet, persistent presence**. When collapsed, it's a thin amber line at the bottom of the screen — like the glow of a sleeping terminal cursor. The player forgets it's there until they need it.

**Opening:** A soft pneumatic `clack-hiss`, like a server rack panel sliding open. The panel rises smoothly (200ms ease-out). Ambient scan-lines begin scrolling upward at 1px/second — barely visible, creating a "live system" feel without being distracting. The three columns fade in sequentially (left → center → right, 100ms gaps), establishing visual reading order.

**In use:** The context column text has a subtle amber glow — each character is slightly brighter than the background, as if illuminated from behind. When content updates (player clicks a new workbench element), the old text dissolves in a 100ms wave (left-to-right character cascade) and new text types in (20ms per character). The transition creates a satisfying "recall" feeling — the AI is retrieving new information. The cyan pulse on the context header (`pip` sound) is the only attention-drawing element.

**Search:** Typing in the query bar produces faint keyclick sounds (optional, can be disabled). Results cascade in from the top with the Rolodex `tik-tik-tik`. Selecting a result produces a `ka-chunk` — a physical file retrieval. The selected result's card has a 1px cyan border that glows briefly (300ms) on selection.

**Related column:** Terms appear as rounded pill buttons on a darker background. Hovering a pill produces a soft glow and a `bip` (higher pitch than the context `pip`). Clicking produces a `click-whoosh` as the center column scrolls to the new entry.

**Closing:** `Escape` or `?` triggers a `whoosh-click` — the panel retracts downward (200ms ease-in). The scan-lines slow and stop. The collapsed bar's amber text dims to 30% opacity, becoming background furniture.

**The overall feeling:** A trusted instrument panel. Always there, never demanding. Like the instrument cluster in a car — you glance down when you need a number, then your eyes return to the road. The terminal is designed to be glanced at, not stared at. Its aesthetic says: "I'm your memory. Use me."

---

## The TikTok Clip

**"My AI Has a Search Engine Inside It"**

Split screen: left shows a player clicking hook slots in confusion, staring at labels, clearly lost. Right shows the same player 2 seconds later — presses `?`, terminal slides up, context column shows exactly what they need, micro-scenario plays. The player nods, collapses the terminal, and wires the hook correctly. Total elapsed: 8 seconds. Caption: "When the game teaches you without leaving the game 🤖"

The viral moment: the seamless flow from confusion → query → understanding → action, all without a single screen change. The terminal's `clack-hiss` open and `whoosh-click` close become ASMR-satisfying audio bookends.

---

## New Aspects Discovered

1. **5.16a — Terminal content authoring pipeline:** How are the ~30 term entries + cross-cutting interaction descriptions authored? Manual writing for 30 terms × N interactions = combinatorial explosion. Templated generation? Player-behavior-driven entry prioritization?
2. **5.16b — Terminal in Inspector mode:** Detailed design of how the terminal functions during the Inspector phase — does it show different content? Does the CONTEXT column reflect the scrubbed tick state? Can the player query "why did RELAY-C fire at tick 8?"
3. **5.16c — Terminal as community sharing surface:** Can terminal query results be shared as links? "Here's the interaction between compress and EM that blew my mind" as a shareable URL that opens the terminal to that entry.
4. **5.16d — Terminal progressive disclosure across campaign:** Which terminal features unlock when? M1: context column only. M3: query column. M5: related column. M7: cross-cutting interaction synthesis. M10: full system. The terminal ITSELF teaches over time.
5. **5.16e — Terminal accessibility:** Screen reader navigation of three-column layout, keyboard-only operation, high-contrast mode, reduced-motion scan-line removal, audio descriptions of micro-scenarios.
