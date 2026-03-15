# 6.05a — The Vim/Command-Palette as Power-User Interface

## Overview

The command palette is a free-form text input overlay (invoked by a single keystroke) that gives the player immediate access to every action in the game without navigating menus or remembering dozens of keyboard shortcuts. It's the bridge between "I know this tool exists" and "I use it instantly." In Robot Uprising, where the workbench IS the game, the command palette transforms the Plan screen from a GUI you click through into a **command-line instrument you play**.

The design question is not *whether* to include a command palette — it's **how deep does the command vocabulary go**, **what is the interaction model** (VS Code search-and-execute vs. Vim modal grammar vs. hybrid), and **how does this interact with the game's teaching philosophy** (boot log, progressive unlock, Blueprint Codex)?

---

## The Design Space: Six Paradigms

### Option A: "The Spotlight" — Pure Search-and-Execute

**Model:** VS Code's `Ctrl+Shift+P` / Superhuman's `Cmd+K`. One keystroke opens an overlay. Type anything. Fuzzy-matched results appear. Select and execute.

**How it works mechanically:**
- Press `:` (colon) anywhere on the Plan screen. A translucent overlay appears dead-center, slightly above the vertical midpoint — a single-line text input with a blinking cyan cursor, monospaced font (JetBrains Mono or Fira Code), dark semi-transparent backdrop blurring the workbench behind it.
- As the player types, a dropdown of fuzzy-matched commands appears below the input. Each result shows: command name (bold), shortcut hint (dimmed right-aligned), and a one-line description.
- Results are ranked by: (1) frequency of use by this player, (2) recency of use, (3) context-awareness (commands relevant to the currently selected element rank higher), (4) fuzzy match quality.
- Press `Enter` to execute the top result. Arrow keys or `Ctrl+J`/`Ctrl+K` to navigate the list. `Escape` to dismiss.
- The palette shows the keyboard shortcut for every command — this is how players discover shortcuts organically. After executing via palette 3+ times, a subtle hint appears: "Tip: You can press `H` directly next time."

**Command vocabulary (exhaustive):**

| Category | Example Commands |
|----------|-----------------|
| **Blueprint** | `New Blueprint`, `Duplicate Blueprint`, `Delete Blueprint`, `Rename Blueprint`, `Import Blueprint`, `Export Blueprint` |
| **Skills** | `Toggle Patrol`, `Toggle Compress`, `Equip Skill: [name]`, `Unequip All Skills` |
| **Rules** | `Add Rule`, `Delete Rule [n]`, `Move Rule Up`, `Move Rule Down`, `Edit Rule [n]`, `Duplicate Rule` |
| **Hooks** | `Add Hook`, `Wire Hook to [channel]`, `Clear Hook [n]`, `List Active Hooks` |
| **Context Config** | `Set Buffer Size [n]`, `Toggle Listen: [channel]`, `Set Eviction: [policy]`, `Show Context Config` |
| **Production** | `Queue [blueprint]`, `Remove from Queue [n]`, `Move Queue Position [from] [to]`, `Clear Queue` |
| **Navigation** | `Go to Skills Panel`, `Go to Rules Panel`, `Go to Hooks Panel`, `Go to Context Config`, `Go to Production Queue`, `Go to Channel Map`, `Focus Board` |
| **Selection** | `Select Scout`, `Select Relay`, `Select Blueprint [name]`, `Select Unit at [A3]` |
| **View** | `Toggle Channel Map`, `Toggle Ghost Preview`, `Zoom Board [level]`, `Show Perception Radii`, `Show EM Overlay` |
| **System** | `EXECUTE`, `Undo`, `Redo`, `Save`, `Open Codex`, `Settings`, `Fullscreen` |
| **Inspector** (post-battle) | `Go to Tick [n]`, `Select Unit [name]`, `Show Decision Trace`, `Show Context Chart`, `Show Event Log`, `Export Replay` |

**Sensory description:**
The overlay materializes with a 150ms fade-in. The backdrop blurs to 8px gaussian — the workbench is visible but unreadable, focusing attention entirely on the input. The text cursor pulses at 1Hz, a slow heartbeat. As the player types, each character produces a soft mechanical key-click sound (optional, togglable) — a typewriter-on-glass feel. Results slide in from below with 80ms stagger, each row a thin horizontal bar with rounded corners and a subtle left-edge color accent (blue for blueprint, green for skills, amber for rules, cyan for hooks, grey for navigation). The selected result has a brighter background and a thin animated underline that slides to match the selected row. Executing a command plays a brief confirmation chirp — a rising two-note tone (C5→E5, 60ms total) — and the overlay dissolves outward in a 100ms radial fade.

**Strengths:**
- Zero learning curve for anyone who's used VS Code, Figma, Notion, Slack, or any modern productivity tool
- Self-documenting: shows shortcuts inline, teaches the keyboard layout passively
- Infinitely extensible: adding new commands requires no new UI, just a new registry entry
- Context-aware ranking means the most useful command is usually the first result
- Accessible: screen readers can announce the result list; keyboard-only players can reach every action

**Weaknesses:**
- No composability: each command is atomic. "Add a rule that triggers on signal_detected and fires compress" requires multiple commands
- Typing is slower than direct shortcuts once the player knows them — the palette becomes a stepping stone, not a destination
- Risk of becoming a crutch that delays shortcut learning
- No visual grammar: the palette doesn't teach how commands relate to each other

---

### Option B: "The Vim Grammar" — Modal Composition

**Model:** Vim's verb-object grammar. Not a search overlay — a **modal input system** where keystrokes compose into commands through a consistent grammar.

**How it works mechanically:**
The Plan screen has two modes: **Normal mode** (default) and **Command mode** (entered by pressing `:`). But unlike Option A, this system has a composable grammar even in Normal mode:

**Normal mode verbs:**
- `a` — **add** (create new)
- `d` — **delete** (remove)
- `e` — **edit** (modify in place)
- `m` — **move** (reorder / reposition)
- `y` — **yank** (copy to clipboard)
- `p` — **put** (paste from clipboard)
- `w` — **wire** (connect hook to channel)
- `s` — **select** (focus on element)
- `t` — **toggle** (flip boolean state)

**Normal mode objects:**
- `r` — **rule**
- `h` — **hook**
- `k` — **skill** (s was taken by select)
- `b` — **blueprint**
- `q` — **queue item**
- `c` — **channel**
- `u` — **unit on board**

**Composition examples:**
- `ar` — add rule (opens rule creation inline)
- `dr` — delete rule (enters "which rule?" prompt — type number or click)
- `d3r` — delete rule 3 (direct, no prompt)
- `mr` — move rule (enters move mode — arrow keys to reorder, Enter to confirm)
- `m2r` — move rule 2 (start moving rule 2 immediately)
- `ah` — add hook (opens hook creation)
- `wh` — wire hook (enters wiring mode — next keystroke selects channel)
- `yb` — yank blueprint (copy current blueprint to clipboard)
- `pb` — put blueprint (paste blueprint into new slot)
- `tk` — toggle skill (enters "which skill?" prompt)
- `t3k` — toggle skill slot 3
- `su` — select unit (enters unit selection on board — HJKL to navigate grid)
- `sA3` — select unit at A3 (direct grid coordinate)
- `eb` — edit blueprint (focus workbench on current blueprint)

**The status line:** A thin bar at the very bottom of the Plan screen (like Vim's status line) shows the current input state. When the player presses `d`, the status line shows `d_` with a blinking cursor, waiting for the object. This gives immediate visual feedback for the composing keystroke sequence. If the player pauses for 1.5 seconds mid-sequence, a context tooltip appears showing valid completions:

```
d_ — Delete...
  r  rule          h  hook
  k  skill         b  blueprint
  q  queue item    c  channel
  u  unit
```

**Command mode (`:`):** For longer, less frequent operations that don't fit the verb-object grammar:
- `:execute` — launch battle (also `Enter` in Normal mode)
- `:rename Scout-Alpha` — rename current blueprint
- `:queue relay 3` — add relay blueprint to queue position 3
- `:set eviction lru` — set eviction policy to LRU
- `:export` — export current config
- `:help compress` — open Codex entry for compress skill

**Sensory description:**
The status line lives at the absolute bottom of the Plan screen — a 24px-tall dark bar spanning the full width, monospaced text left-aligned. In Normal mode it shows `-- NORMAL --` in dim grey. When the player starts a verb, the bar text shifts to bright cyan and shows the accumulating sequence: `d` → `d_` with the underscore blinking. When the full command is recognized (e.g., `d3r`), the bar flashes green for 200ms and the action executes. Invalid sequences flash red for 300ms and reset. The transition from Normal to Command mode (pressing `:`) shifts the bar color from dark grey to a deep navy blue, the colon appears left-aligned, and a cursor blinks after it — identical to Vim's feel. The whole bar has a subtle CRT scanline texture, reinforcing the "you are an AI operating through a terminal" diegetic frame.

When a verb-object command executes, the affected element on the workbench briefly flashes with the verb's color — green for add, red for delete, blue for edit, amber for move. The flash is a 200ms pulse with a 400ms fade-out. Deletion plays a descending two-note tone (E4→C4, 80ms). Addition plays an ascending tone (C4→E4, 80ms). Toggle plays a single click.

**Strengths:**
- Composable: the grammar scales linearly. Learning 9 verbs + 7 objects = 63 commands from 16 keystrokes
- Muscle memory builds faster because the grammar is consistent — `d` always means delete, `r` always means rule
- Expert speed is unmatched: `d3r` (delete rule 3) is 3 keystrokes. Via mouse: right-click → Delete → confirm = 3 actions + pointer travel
- Transfers real Vim skills bidirectionally — players who learn this can navigate Vim, Vim users feel instantly at home
- The status line provides continuous feedback, making the modal system feel responsive and predictable
- Deeply diegetic: "You are an AI. Of course you have a command line."

**Weaknesses:**
- Modal interfaces are notoriously hostile to new users. "Why isn't my keyboard working?" is the #1 Vim complaint
- Requires learning an abstract grammar before becoming productive — high initial investment
- The verb-object grammar doesn't map cleanly to every action (renaming, complex configurations)
- Risk of accidental deletions in Normal mode (pressing `d` when you meant to type in a text field)
- Controller/touch adaptation is extremely difficult — this is PC-only
- The status line takes vertical space in an already-dense layout

---

### Option C: "The Hybrid Ladder" — Spotlight with Vim Graduation

**Model:** Start with Option A (Spotlight search) for everyone. After demonstrable mastery (N commands executed), unlock Option B (Vim grammar) as an optional Advanced Mode. The player graduates from search-and-execute to modal composition.

**How it works mechanically:**
- **Layer 1 (default):** Press `:` to open the Spotlight palette. Fuzzy search, execute, done. Identical to Option A.
- **Layer 2 (unlockable):** After executing 50+ palette commands across 5+ sessions, the boot log announces: `SUBSYSTEM: COMMAND_INTERFACE — EFFICIENCY MODULE DETECTED. Activate direct-input mode? [Y/N]`. Accepting unlocks the Vim grammar in Normal mode. The `:` key now has dual behavior: quick-press opens Spotlight, hold-for-400ms enters Command mode.
- **Layer 3 (togglable):** Settings → Input → Command Mode: `Spotlight Only` / `Vim + Spotlight` / `Vim Only`. Power users can disable Spotlight entirely.

**The graduation moment:** When the player first activates Vim mode, the Plan screen status bar appears for the first time with a brief animation — it slides up from below the screen edge over 300ms, like a new subsystem coming online. The boot log entry reads:

```
[EFFICIENCY MODULE v1.0]
> Direct input mode active.
> Grammar: {verb}{count?}{object}
> Verbs: a(dd) d(elete) e(dit) m(ove) y(ank) p(ut) w(ire) s(elect) t(oggle)
> Objects: r(ule) h(ook) k(skill) b(lueprint) q(ueue) c(hannel) u(nit)
> Press : for extended commands. Press ? for help.
> This is who you are now.
```

The last line — "This is who you are now" — is a diegetic acknowledgment that the AI has evolved. The player hasn't just unlocked a feature; the AI character has become more efficient. This is the same emotional beat as the boot log's initial awakening, but for a power-user milestone.

**Strengths:**
- No intimidation: new players never see modal input
- Natural progression: the game teaches the palette first, then offers the grammar as a reward
- Diegetic unlock: the AI evolving feels earned, not arbitrary
- Players self-select: those who want Vim get it, those who don't aren't burdened
- The unlock threshold (50 commands) ensures the player has enough vocabulary to benefit from composition

**Weaknesses:**
- Two input systems to maintain, test, and document
- The 400ms hold-to-enter-command-mode distinction is subtle and error-prone
- Players who already know Vim must grind through 50 Spotlight uses first (unless there's a Setting to skip)
- The unlock animation interrupts flow — some players will find the boot log intrusive at this point

---

### Option D: "The Natural Language Bar" — Conversational Commands

**Model:** Instead of fuzzy-matching command names, the palette accepts natural-language-ish input and interprets intent. "add a hook that fires on signal_detected to recon-net" → creates the hook with those parameters.

**How it works mechanically:**
- Press `:` to open the bar. Type in natural language fragments: "delete rule 3", "wire scout hook to alert channel", "show all relays", "queue two strikers after the relay".
- The system parses intent using a lightweight grammar (not an LLM — deterministic parser with synonym tables). Recognized tokens highlight in color as the player types: verbs in green, objects in blue, parameters in amber.
- Ambiguous input shows a disambiguation dropdown: "Did you mean: (1) Delete Rule 3 from SCOUT-A, (2) Delete Rule 3 from RELAY-B?"
- Unrecognized input shows "I don't understand '[input]'. Try: [closest valid command]"

**Command examples:**
```
: add rule to scout → opens rule creation on scout blueprint
: move relay to queue position 1 → reorders production queue
: what does compress do → opens Codex entry for compress
: show all hooks on alert-net → highlights all hooks wired to alert-net
: why did scout die → opens Inspector at scout's last tick (post-battle only)
```

**Sensory description:**
The input bar is wider than the Spotlight overlay — it spans 70% of the screen width, positioned at the top third (like a browser address bar in presentation mode). As the player types, recognized tokens morph from plain text to colored capsules — "delete" becomes a red capsule, "rule 3" becomes a blue capsule with "Rule 3" in small caps, "scout" becomes a capsule with the scout icon. Unrecognized words remain as plain grey text. The capsule formation happens character-by-character with a 50ms ripple effect — it feels like the AI is parsing your intent in real-time, understanding you word by word. A soft chime plays when the parser achieves full recognition — all tokens are capsules, and the result preview appears below.

**Strengths:**
- Most intuitive for players with zero gaming vocabulary — "delete the third rule" is human language
- Self-teaches game vocabulary: the capsule coloring shows which words the system recognizes
- Query capability ("what does compress do", "why did scout die") makes it a unified search + command + help interface
- Maps directly to chatbot/LLM interaction patterns that players increasingly expect
- Natural language fragments are inherently composable — "add a rule that fires compress when buffer is above 80%"

**Weaknesses:**
- Deterministic NL parsing without an LLM is fragile — synonym tables can't cover everything
- Slow for experts: typing "delete rule 3" is slower than `d3r`
- Localization nightmare: every synonym table needs translation and cultural adaptation
- The "AI understands natural language" framing creates expectations the deterministic parser can't meet
- Capsule rendering adds visual complexity to what should be a fast interaction

---

### Option E: "The REPL" — Live Evaluation Console

**Model:** A persistent console panel (togglable, not overlay) that accepts a scripting language for direct manipulation of game state. More Screeps than VS Code.

**How it works mechanically:**
- Press `` ` `` (backtick) to toggle the console panel — a horizontal panel that slides up from the bottom of the Plan screen, taking 30% of the vertical space. It has a scrollable history and a single-line input at the bottom.
- The language is a simplified DSL (domain-specific language) with consistent syntax:

```
> blueprint.scout.rules.add({ when: "signal_detected", do: "compress" })
> blueprint.scout.hooks[0].channel = "recon-net"
> queue.push("relay", { position: 1 })
> board.unit("A3").select()
> query.hooks({ channel: "recon-net" })  // returns list of all hooks on recon-net
> config.eviction = "lru"
```

- The REPL provides tab completion for every property and method.
- Results are printed inline with syntax highlighting. Errors appear in red with suggestions.
- The REPL history persists across sessions. Players can scroll up to see (and re-execute) previous commands.
- The REPL panel has a "pin" button that keeps it visible during execution — it becomes a live telemetry feed during Sealed Watch, printing signal events and context changes as they happen.

**Sensory description:**
The console panel has a dark background (#0D1117 — GitHub dark theme territory) with a subtle green-tinted scanline overlay (2px lines at 20% opacity, scrolling upward at 0.5px/sec). Input text is bright green (the classic terminal green #00FF41, desaturated to #4ADE80 for readability). Property names are cyan. String values are amber. Numbers are magenta. The cursor is a solid block that blinks at 530ms (faster than the Spotlight cursor — this console is impatient, efficient). When a command executes successfully, a thin green line flashes across the output. Errors produce a brief red flash. The panel's top edge has a drag handle for resizing, and a collapse chevron that slides the panel down with a spring animation (200ms ease-out with a 10% overshoot bounce).

During Sealed Watch with the console pinned, the panel becomes a live event stream:
```
[T12] SCOUT-A → recon-net: SENT {type: "threat_detected", pos: "D5", confidence: 0.8}
[T13] RELAY-B → recon-net: RECEIVED, compressed → strike-net: FORWARDED
[T14] STRIKER-C → strike-net: RECEIVED, rule 2 matched → ENGAGE D5
[T14] STRIKER-C eliminated ENEMY-1 at D5
```
Each line fades in with a typewriter effect, green text on dark background, timestamps in dim grey. The effect is watching your architecture execute in real-time through a terminal — the experience Robot Uprising is literally about.

**Strengths:**
- Maximum expressiveness: anything the GUI can do, the REPL can do in one line
- Persistent history acts as a command journal — players can review what they've configured
- The live telemetry mode during Sealed Watch IS the game's fantasy: watching your system run
- Direct transfer to real programming — this is JavaScript-adjacent object notation
- Composable: commands can reference results of previous commands
- The console is a natural home for advanced queries ("show all blueprints where buffer > 10")

**Weaknesses:**
- The learning curve is the steepest of all options — this is programming
- Takes 30% of screen real estate when open — in an already dense layout
- The DSL needs careful design to avoid becoming a second game (debugging your console commands instead of your agents)
- Risk of bypassing the workbench entirely — some players may never learn the GUI
- Accessibility concerns: screen readers need special handling for REPL output
- Console-during-sealed-watch may violate the "no tools during sealed watch" locked decision (needs resolution — is a read-only telemetry stream a "tool"?)

---

### Option F: "The Shortcut Discoverer" — Progressive Shortcut Revelation

**Model:** No command palette at all. Instead, the game aggressively surfaces keyboard shortcuts through contextual hints, and every mouse action shows its keyboard equivalent in a persistent hint bar.

**How it works mechanically:**
- Every time the player performs a mouse action, a brief toast appears near the action point: "Tip: Press `A` to add a rule" (200ms fade-in, 2s visible, 300ms fade-out).
- A persistent "shortcut hint bar" at the bottom of the Plan screen shows the 4 most relevant shortcuts for the current context. If a blueprint is selected and the Rules panel is active, it shows: `[A] Add Rule  [D] Delete  [↑↓] Reorder  [Enter] Edit`
- The hint bar updates in real-time as context changes. Select a hook → the bar shows hook-relevant shortcuts. Select a unit on the board → board shortcuts appear.
- After the player uses a shortcut 5 times, the toast for that shortcut stops appearing. The hint bar entry dims but remains visible until the shortcut is used 20 times, then it disappears — the player has mastered it.
- A "Shortcuts" overlay (press `?`) shows all available shortcuts organized by context, with usage counts and "mastered" badges.

**Sensory description:**
The shortcut hint bar is a semi-transparent strip (40% opacity dark background) at the screen's bottom edge, 28px tall. Each shortcut is a capsule: a rounded rectangle with the key in a slightly brighter background (like a physical keycap rendered on screen) and the action name beside it. As the player's context changes (selecting different panels, units, elements), the capsules crossfade — outgoing capsules slide left and fade, incoming capsules slide in from the right and brighten. The transition takes 200ms and feels like a deck of cards being shuffled. When the player actually presses a shown shortcut, the corresponding capsule briefly enlarges (110% scale, 100ms) and flashes — positive reinforcement.

The mastery progression is visualized on the `?` overlay: each shortcut has a tiny progress ring (like an XP bar) showing how close the player is to "mastering" it. Mastered shortcuts show a small cyan checkmark. The overlay is organized as a grid of keycap illustrations with their actions, reminiscent of a keyboard cheat sheet poster — but alive, tracking the player's actual behavior.

**Strengths:**
- Zero additional UI surface — works entirely within the existing workbench
- Teaches shortcuts at exactly the moment they're relevant (contextual, not front-loaded)
- The mastery system gamifies learning the keyboard layout
- No mode switching, no overlay, no command parsing — pure direct manipulation
- Accessible: the hint bar works for any input method including screen readers
- Comparable to Into the Breach's contextual hover hints — proven effective

**Weaknesses:**
- No way to discover commands you don't know exist — only shortcuts for actions you already perform via mouse
- No composability: each shortcut is a single atomic action
- Toast fatigue: early sessions will have constant "Tip:" notifications
- Doesn't scale: when there are 50+ shortcuts, the hint bar can only show 4 at a time
- Power users who want to DO something new (not shortcut something they already do) have no text-based path
- No query capability: can't ask "what does compress do?" through this system

---

## Recommended Design: "The Evolving Console" (C + E Hybrid)

**Phase 1 (Missions 1-4):** The Shortcut Discoverer (Option F) — contextual hints teach the first 15-20 essential shortcuts. No command palette exists yet. The player learns by doing.

**Phase 2 (Mission 5, factory introduction):** The Spotlight palette (Option A) unlocks. Boot log reads:
```
[INTERFACE EXTENSION: COMMAND PALETTE]
> Complexity threshold detected. Subsystem count exceeds manual navigation efficiency.
> Activating search interface. Press : to find any action.
> You don't need to remember. You need to find.
```
The `:` key opens a fuzzy-search overlay. All commands available. Shortcuts shown inline.

**Phase 3 (Post-campaign / Gauntlet):** The Vim Grammar (Option B) unlocks as an optional mode in Settings, or via a diegetic boot log event after 50+ palette uses:
```
[EFFICIENCY MODULE v2.0]
> Pattern detected: you search for the same 12 commands repeatedly.
> Direct input grammar available. Press : to search. Press any verb to compose.
> Grammar: {verb}{count?}{object}
> This is faster. This is who you are becoming.
```

**Phase 4 (Optional, Settings-only):** The REPL console (Option E) is available for players who enable Developer Mode in Settings. It's never surfaced through the game's normal progression — it's a hidden power tool for the deepest enthusiasts. The live telemetry mode during Sealed Watch is separately available as "Event Stream" in Settings → Sealed Watch → Show Event Stream (this doesn't violate "no tools" because it's read-only — the player cannot act on it during sealed watch).

---

## Player Journeys

### Journey 1: Elara, 26, ML Engineer — The Palette Graduate

**Context:** Mission 6. She's beaten the campaign through Mission 5 (factory introduction). She knows the basic shortcuts (1-5 for units, Tab for panel cycling, A for add rule). She's hitting friction: configuring a Command agent with 6 hook slots and 14-slot context window requires navigating between 4 workbench panels repeatedly.

**Minute 0:00 — The Friction**
Elara opens the Plan screen for Mission 6. The board shows Cebu's urban cyberpunk grid — neon-lit tiles with fiber optic tracery. She has three blueprints to configure: SCOUT-A, RELAY-B, and her first COMMAND-C. She clicks on COMMAND-C in the production queue. The workbench loads the Command blueprint — Skills panel shows 3 slots (reassign, reroute, prioritize), Rules panel shows space for more rules than she's ever had, and the Hooks panel has 6 slots — six! She's only ever wired 2 before.

She clicks on Hook Slot 1. Opens the hook editor. Types "recon-net" as the channel name. Clicks the trigger dropdown. Selects ON_RECEIVE. Clicks save. That was 5 clicks for one hook. She has 5 more to go.

**Minute 1:30 — The Discovery**
She reaches for the keyboard out of habit. Presses `:`. The Spotlight palette materializes — the dark overlay, the blinking cyan cursor, the blurred workbench behind it. She's never used this before. The boot log unlocked it at Mission 5, but she ignored it.

She types "add hook". The first result highlights: **Add Hook to COMMAND-C** — the palette already knows which blueprint is selected. She presses Enter. The hook editor opens inline, cursor already in the channel name field. She types "recon-net", presses Tab (moves to trigger), presses Enter (ON_RECEIVE is the default — the palette learned from her last hook configuration). Done. 4 keystrokes instead of 5 clicks.

**Minute 2:00 — The Acceleration**
She presses `:` again. Types "wire". The palette shows: **Wire Hook 2 to Channel**, **Wire Hook 3 to Channel**, **Show All Wiring**. She selects Hook 2, types "strike-net", Enter. The wiring appears on the board preview — a cyan subway line connecting the Command unit's ghost position to the Striker's. She presses `:`, types "wire 3 alert-net", Enter. Three hooks wired in under 30 seconds.

The shortcut hint bar at the bottom updates: `[H] Quick Hook  [:] Command Palette  [Tab] Next Panel  [Enter] EXECUTE`. She notices the `[H]` hint but the palette feels faster right now — she doesn't have to remember which key does what.

**Minute 4:00 — The Channel Map Moment**
She presses `:`, types "channels". Two results: **Show Channel Map** and **List All Channels**. She picks List All Channels. A compact list appears in the palette results area: `recon-net (2 publishers, 1 subscriber)`, `strike-net (1 publisher, 2 subscribers)`, `alert-net (1 publisher, 3 subscribers)`. She sees immediately that alert-net has 3 subscribers but only 1 publisher — her SCOUT-A. If the scout dies, the entire alert system goes dark. She presses Escape, opens RELAY-B, and adds a backup hook to alert-net.

**Minute 6:00 — The Shortcut Tip**
She presses `:`, types "add rule" for the 4th time this session. The palette executes the command, but after the overlay dissolves, a subtle toast appears near the Rules panel: `Shortcut discovered: Press A to add a rule directly`. She blinks, presses Escape, then presses `A`. The rule creation interface opens. Same result, zero palette overhead. She grins.

**Minute 8:00 — EXECUTE**
She presses `:`, types "exec"— the palette shows **EXECUTE — Launch Battle** as the first result, with `[Enter]` shown as the shortcut. She presses Enter twice (once to select, once to confirm). The overlay dissolves. The Plan screen fades. The tick clock appears.

**What she learned:** The palette is a stepping stone. It taught her the shortcuts she'll use directly next time. The channel listing query saved her from a critical single-point-of-failure. The palette isn't just a command interface — it's a diagnostic tool.

**UI Annotations:**
- Command palette: centered overlay, 460px wide, dark backdrop with 8px gaussian blur
- Result list: max 8 visible results, scrollable, context-aware ranking
- Shortcut hints: right-aligned in each result row, dimmed monospace
- Toast tip: 200ms fade-in, positioned 8px above the relevant panel header, 2s visible

---

### Journey 2: Darius, 42, IT Infrastructure Manager — The Vim Convert

**Context:** Post-campaign. He's beaten all 10 missions and is tuning configs for the Gauntlet. He enabled Vim mode 3 sessions ago after the boot log offered it. He uses Vim daily at work (NeoVim with 47 custom keybindings). His fingers know `hjkl` like breathing.

**Minute 0:00 — The Status Line**
Darius opens the Plan screen. The board shows the Gauntlet arena — a procedurally selected map. His status line reads `-- NORMAL --` in dim grey at the bottom of the screen. He doesn't even see it anymore; it's as natural as Vim's mode indicator.

He presses `sb` — select blueprint. The status line flashes `sb` in cyan for 200ms, then the blueprint selector highlights, awaiting his choice. He presses `2` — RELAY-B is blueprint #2 in his production queue. The workbench loads RELAY-B's config. Total time: 400ms, 3 keystrokes.

**Minute 0:15 — The Edit Chain**
He's noticed from the last Gauntlet match that RELAY-B's Rule 2 (compress when buffer > 80%) fires too late — by the time the buffer hits 80%, the relay is already drowning in signals. He needs to change the threshold to 60%.

He presses `e2r` — edit rule 2. The Rules panel scrolls to Rule 2 and opens the inline editor, cursor on the condition field. The status line shows `-- EDIT RULE 2 --` in green. He navigates to the threshold value (Tab to jump between fields), changes 80 to 60, presses Escape to exit edit mode. The status line returns to `-- NORMAL --`. The workbench shows Rule 2 updated with a brief amber flash on the modified field. 6 keystrokes, no mouse.

**Minute 0:40 — The Yank-Put**
He wants to duplicate this rule to SCOUT-A (same buffer threshold logic, different action). He presses `y2r` — yank rule 2. The status line shows `Yanked: Rule 2 (compress when buffer > 60%)` for 1 second. He presses `sb1` — select blueprint 1 (SCOUT-A). The workbench swaps to SCOUT-A. He presses `pr` — put rule. The yanked rule appears at the bottom of SCOUT-A's rule list. He presses `m5r` then the up arrow twice — move rule to position 3 in the priority order. Enter to confirm.

The status line trace: `y2r` → `sb1` → `pr` → `m5r↑↑↵`. Eleven keystrokes to duplicate and reposition a rule across blueprints. Via mouse: right-click Rule 2 → Copy → click SCOUT-A in queue → right-click Rules → Paste → drag to reorder = ~8 actions + 4 pointer movements + precision drag. The mouse path is actually similar in action count but substantially slower in execution time for a touch typist.

**Minute 1:30 — The Command Mode Query**
He presses `:` (entering command mode — the status line turns navy blue). Types `query hooks channel=recon-net` and presses Enter. A compact output appears in a transient tooltip near the status line:

```
recon-net: 3 hooks
  SCOUT-A hook[0]: ON_DETECT → recon-net (trigger: entity_spotted)
  RELAY-B hook[1]: ON_RECEIVE(recon-net) → strike-net (compress)
  COMMAND-C hook[0]: ON_RECEIVE(recon-net) → [internal] (prioritize)
```

He sees the full signal chain in plain text. This is the same information the Channel Map panel shows visually, but in a format his IT-infrastructure brain processes faster — it looks like a network topology dump. He notices COMMAND-C is listening on recon-net directly. That's unnecessary bandwidth — the Command agent should listen to strike-net (the compressed version), not recon-net (the raw version). He presses `:` again, types `set COMMAND-C.hooks[0].listen = strike-net`, Enter. Fixed in one line.

**Minute 3:00 — The Macro**
Darius discovers something not officially documented: the `:` command mode accepts semicolons as command separators. He types:
```
:sb3; d1r; d1r; ah recon-net ON_TICK; ar when:tick_count%5==0 do:compress
```
Select blueprint 3, delete rules 1 and 2 (now-obsolete), add a hook on the periodic tick channel, add a rule that compresses every 5 ticks. Five operations in one line. The status line shows each sub-command executing in sequence with a rapid staccato of green flashes.

He screenshots the command and posts it to the Robot Uprising Discord's `#config-wizards` channel. Someone replies: "Dude just wrote a cron job for his relay." He saves the command to his personal macro library (`:macro save relay-cleanup`).

**Minute 5:00 — EXECUTE**
He presses `:execute` — one word, Enter. Or he could just press Enter in Normal mode. He does both sometimes. The Plan screen transitions to the Sealed Watch.

During the battle, the Event Stream panel (he enabled it in Settings) prints signal events in real-time at the bottom of the screen. It looks like his production logs at work. RELAY-B's compress fires every 5 ticks exactly as he configured. The relay's buffer never exceeds 62% fill. He designed a cron job for a robot.

**What he learned:** The Vim grammar lets him work at the speed of thought. The query system bridges the visual channel map with his text-native mental model. The macro discovery (semicolon chaining) gives him a composability layer the game didn't explicitly teach. He'll share this with the community, and it'll become known as "Vim macros."

**UI Annotations:**
- Status line: 24px, bottom edge, full width, mode-colored background (grey=normal, green=edit, navy=command, red=error)
- Verb-object feedback: cyan text in status line during composition, green flash on execution
- Query output: transient tooltip anchored to status line, auto-dismisses on next keystroke, monospace
- Macro save: persists to localStorage, accessible via `:macro list`

---

### Journey 3: Sofia, 15, First-Time Strategy Player — The Shortcut Discoverer

**Context:** Mission 2. She's never played a strategy game. She got Robot Uprising because her older brother said it's about AI. She clicks everything with the mouse. She doesn't know what `:` does.

**Minute 0:00 — The Hint Bar**
Sofia opens the Plan screen for Mission 2. The board shows Siquijor's bioluminescent terrain — purple-green tiles that pulse softly. She has one pre-placed SCOUT unit on the board. The workbench shows the Scout blueprint with its simple config. At the bottom of the screen, the shortcut hint bar shows:

`[Click unit] Select  [Tab] Next Panel  [1-5] Unit Type  [?] All Shortcuts`

She doesn't read it. She clicks on the Scout. The workbench highlights. She clicks on the Rules panel.

**Minute 0:30 — The First Toast**
She drags Rule 1 to reorder it (moving "evade when threatened" above "patrol always"). As she drops it, a toast appears near the rule: `Tip: Press ↑ to move rules up`. It's small, unobtrusive, and fades after 2 seconds. She doesn't process it consciously. But the next time she wants to reorder, she hesitates over the mouse — she saw a number, an arrow? She tries pressing `↑` with the rule selected. The rule moves up. She gasps slightly. The toast didn't appear this time (she's now used the shortcut).

**Minute 1:00 — The Contextual Bar Shift**
She clicks on the Hooks panel (her first time). The shortcut hint bar updates smoothly — the old capsules slide left and fade, new ones slide in: `[H] Add Hook  [W] Wire to Channel  [Click slot] Edit  [Esc] Back to Rules`. She doesn't use any of these yet, but the bar is passively teaching her that different panels have different shortcuts.

**Minute 3:00 — The Accidental Colon**
Her finger slips and hits `:` while reaching for the Shift key. The Spotlight overlay appears. She panics — what is this? — and presses Escape immediately. It vanishes. She goes back to clicking. But the overlay's brief appearance planted a seed: there's a search bar.

**Minute 5:00 — The Intentional Search**
She wants to do something but doesn't know what it's called. The mission briefed her to "configure the scout's perception" but she can't find a "perception" button anywhere. She remembers the search overlay. She presses `:`. Types "perception". The palette shows: **Go to Context Config** (with description: "Configure what the unit perceives and remembers"). She presses Enter. The workbench scrolls to the Context Config section. She never would have found this through clicking — the label says "Context Config," not "Perception."

This is the palette's greatest pedagogical moment: it bridges the player's vocabulary ("perception") to the game's vocabulary ("Context Config") through fuzzy matching. The palette is a vocabulary translator.

**Minute 7:00 — The Second Mission End**
She clicks EXECUTE (she doesn't know about Enter). The battle plays. She watches. In the debrief, she notices the Inspector shortcut hint bar shows different shortcuts: `[←→] Tick Step  [Click unit] Inspect  [B] Buffer Chart  [E] Event Log`. She presses `←` to step back a tick. The timeline scrubber moves. She's never used a keyboard shortcut to control a timeline before. It feels powerful.

**What she learned:** The keyboard exists. The search bar finds things she can't name. Different screens have different shortcuts. Moving rules with arrow keys is faster than dragging. She used 4 keyboard shortcuts total this session (↑, :, Enter to execute palette command, ←). She'll use 8 next session. By Mission 6, she'll use 20.

**UI Annotations:**
- Toast tips: 14px text, semi-transparent background, positioned 8px above the triggering element, 2s visible
- Hint bar: 4 capsules max, smooth crossfade transitions on context change, 28px tall
- Palette fuzzy matching: "perception" matches "Context Config" via description search, not just title
- Mastery tracking: invisible to player, stored in localStorage, affects toast frequency and hint bar visibility

---

### Journey 4: Kwame, 32, Twitch Streamer — The Content Machine

**Context:** Mission 8, streaming to 400 viewers. He's in Vim mode because his chat told him to try it. He's not a Vim user — he uses VS Code — but the chat peer-pressured him after he complained about clicking too much.

**Minute 0:00 — The Performance**
Kwame's overlay shows his keystrokes in the bottom-left corner (a stream extension captures his keyboard input). Chat can see everything he types. He presses `sb1` — select blueprint 1. Chat sees `s` `b` `1` appear in quick succession. "He's going full hacker mode" — a subscriber comment.

**Minute 0:30 — The Mistake**
He presses `dr` — intending to edit (he forgot `e` is edit, `d` is delete). The status line shows `d_` waiting for an object. He presses `r` — delete rule. A confirmation prompt appears: "Delete which rule? (1-5, or Esc to cancel)". He sees the red flash on the status line. "WAIT NO" he says out loud. Presses Escape. Chat spams "SAVED" emojis.

The confirmation prompt for destructive verbs (`d`) is a critical safety net. Unlike Vim's `u` undo, the game uses an explicit confirmation for deletions because an agent config deletion in a competitive context is much higher-stakes than deleting a line of text.

**Minute 1:00 — The Flex**
He recovers. Presses `e3r` (edit rule 3), makes the change, Escape. Then `yb` (yank blueprint), `sb4` (select blueprint 4 — a new empty slot), `pb` (put blueprint), then rapid-fire `e1r`, `e2r`, `e3r` editing three rules. His keystroke overlay shows a continuous stream of letters and numbers. Chat says "he's writing code" — he's not, he's composing a robot's attention system through a grammar, but it LOOKS like coding. A subscriber clips the 15-second sequence. It gets 8,000 views.

**Minute 2:00 — The Chat Command**
A viewer asks: "What channels does RELAY-B listen to?" Kwame presses `:`, types `query hooks RELAY-B`, reads the output on stream. Chat can see the topology dump. Someone types: "That's literally a network diagram." Kwame: "Yeah, this game is just DevOps."

**Minute 3:00 — The EXECUTE**
He presses Enter in Normal mode. The status line shows a brief `EXECUTE` confirmation. The screen transitions. His Event Stream panel (bottom 15% of the screen) starts printing signal events. Chat watches the real-time log alongside the battlefield animation. Two information streams — visual (board) and textual (console) — running in parallel. A viewer says: "This is the cyberpunk hacker fantasy I've been waiting for."

**What the stream demonstrated:** The Vim grammar is inherently streamable. The keystroke overlay makes the player's intent visible to viewers. The query system becomes a real-time Q&A tool for chat. The Event Stream during Sealed Watch turns the battle into a dual-media experience — animation + terminal. This is the TikTok clip: a 15-second sequence of rapid keystrokes building a robot army's communication network, followed by watching the terminal confirm the system works.

**UI Annotations:**
- Keystroke visibility: each key press briefly highlights the corresponding keycap illustration in the `?` overlay (if enabled for streaming)
- Destructive verb confirmation: red-tinted prompt, requires explicit number input or Escape, no accidental Enter
- Event Stream: bottom panel, dark background, monospace, auto-scrolling, configurable height (10-30% of screen)

---

## Interaction Effects

### With Building Blocks
- **Rules language:** The Vim grammar's `e{n}r` (edit rule N) maps cleanly to priority-queue rules. If the rules language were a behavior tree (nested conditionals), the grammar would need tree-navigation verbs (enter/exit/sibling) — much harder.
- **Hook visualization:** The `:query hooks` command provides a text-native alternative to the visual channel map. Players who think in text (programmers) may prefer the query; players who think spatially may prefer the visual. Both should exist.
- **Skill UI:** `tk` (toggle skill) works naturally with the Toggle Panel paradigm. If skills used the Tuning Bench (slider parameters), the Vim grammar would need `e{n}k` (edit skill N) with sub-field navigation.

### With Onboarding
- **Boot log:** The command palette unlock IS a boot log event. The diegetic framing ("your efficiency module came online") makes the unlock feel earned rather than arbitrary.
- **Vocabulary pacing:** The palette's fuzzy search bridges player vocabulary to game vocabulary. This is a critical accessibility tool: a player who searches "memory" finds "Context Config." A player who searches "attack" finds "Engage skill."
- **Tutorial missions:** The palette should NOT be available in Missions 1-4. The first 4 missions teach through direct manipulation. Introducing a search overlay before the player knows what to search for is anti-pedagogical.

### With Sealed Watch & Inspector
- **Sealed Watch:** The Event Stream (REPL telemetry) is the only command-palette-adjacent feature that touches the sealed watch, and it's read-only. The sealed watch MUST remain tool-free — the palette does not exist during sealed watch.
- **Inspector:** The command palette in Inspector mode supports tick navigation (`:goto tick 42`), unit selection (`:select RELAY-B`), and query (`:why did SCOUT-A die` → jumps to the tick where SCOUT-A was eliminated and opens the decision trace). Inspector palette commands are diagnostic, not creative.

### With Multiplayer/Competitive
- **Gauntlet:** In competitive play, the command palette gives no strategic advantage — it accesses the same actions as the GUI. But the speed advantage of Vim mode in timed formats (if any are introduced) would create input-method disparity. This argues for async-only competitive formats.
- **Streaming:** The Vim grammar is a spectator feature. The keystroke overlay makes the player's cognitive process visible. This is a content creation advantage that no other game offers: viewers can literally read the player's intention as they compose it.

### With Platform
- **Console/controller:** The command palette is PC-only. Console players get the Shortcut Discoverer (Option F) adapted for controller buttons, but no text input. This is acceptable — the command palette is a power-user feature, and power users are on PC.
- **Mobile:** Touch players get the Spotlight palette (Option A) with an on-screen keyboard, but not Vim mode. The fuzzy search works well on touch because tap-to-select is the natural input.
- **Steam Deck:** The Steam Deck's touchscreen can activate the Spotlight palette. Vim mode requires the physical keyboard attachment (or Steam Input virtual keyboard, which is too slow to be practical).

---

## Comparable Games & Software

| Reference | What It Does | What Robot Uprising Learns |
|-----------|-------------|---------------------------|
| **VS Code** (`Ctrl+Shift+P`) | Fuzzy-search command palette with shortcut hints | The gold standard for "search anything, learn shortcuts passively." Robot Uprising's Spotlight mode should feel identical. |
| **Superhuman** (`Cmd+K`) | Context-aware command palette for email | Context-awareness is key: the palette should know what's selected, what screen you're on, what you did last. |
| **Vim** (modal grammar) | Verb-object composition with persistent mode indicator | The composable grammar scales better than flat command lists. The status line is essential for feedback. Confirmations for destructive verbs prevent catastrophic mistakes. |
| **Factorio** (console) | In-game Lua REPL for debugging and configuration | The REPL/console is a power tool for the deepest enthusiasts. Factorio's console disables achievements — Robot Uprising's REPL should NOT disable anything (it accesses the same actions as the GUI). |
| **Screeps** (JavaScript API) | Full programming language as the game interface | The REPL endpoint of the spectrum. Robot Uprising should stop short of this — the workbench is the primary interface, the REPL is a complement. |
| **Sublime Text** (`Ctrl+P`) | The original command palette (2011) that started the pattern | File switching + command execution in one interface. Robot Uprising's palette should also support `:open [blueprint-name]` navigation. |
| **Figma** (`Ctrl+/`) | Design tool command palette with action search | Figma's palette includes recently used commands at the top (before typing). Robot Uprising should do the same. |
| **Dwarf Fortress** (keyboard UI) | Deeply modal keyboard interface for everything | Proof that gamers will learn a complex keyboard system if the game is worth it. Also proof that it needs MUCH better onboarding than DF provides. |
| **Blender** (search menu, F3) | 3D tool command search across 2000+ commands | At scale, fuzzy search beats hierarchical menus. Robot Uprising won't have 2000 commands, but the principle holds: search > navigation. |
| **Linear** (`Cmd+K`) | Project management command palette with entity search | Linear searches across entities (issues, projects, people) and commands in one interface. Robot Uprising's palette should search across blueprints, rules, hooks, channels, AND commands. |

---

## The TikTok Clip

**The 15-second clip:** A split-screen. Left side: a player's hands on a mechanical keyboard, fingers flying. Right side: the Robot Uprising Plan screen. The player types `sb2; y3r; sb4; pr; wh recon-net; ah ON_RECEIVE strike-net; :execute` — a rapid sequence that copies a rule from one blueprint to another, wires two hooks, and launches the battle. The status line flashes green-green-green-green-green with each sub-command. The keystroke overlay shows the grammar in real-time. The transition to Sealed Watch plays. The Event Stream prints: `[T1] RELAY-B ONLINE. [T2] Signal received. [T3] Compressed. Forwarded.` The player leans back.

Caption: "I didn't write code. I designed a nervous system."

The clip works because the Vim grammar LOOKS like programming but IS game design. The audience (developers, engineers, tech workers) recognizes the keyboard fluency and the terminal aesthetic. The non-technical audience sees "hacker movie but real." Both demographics share the clip.

---

## New Aspects Discovered

1. **6.05a-i — Command palette as vocabulary translator:** The fuzzy search that maps player vocabulary ("attack", "memory", "perception") to game vocabulary ("engage", "context window", "context config") is itself a pedagogical tool. Full design of the synonym mapping, localization implications, and how the mapping evolves as the player learns game terms.

2. **6.05a-ii — Macro system and command chaining:** The semicolon-chaining discovery (typing multiple commands separated by `;`) and the `:macro save/load/list` system. Full design of macro recording, editing, sharing (Config Code-compatible macro strings), and community macro libraries. Interaction with competitive integrity (are macros allowed in Gauntlet?).

3. **6.05a-iii — Event Stream as read-only sealed watch companion:** The REPL telemetry panel during Sealed Watch — design of which events are logged, formatting, scrollback depth, filtering, and whether it constitutes a "tool" under the locked "no tools during sealed watch" rule. The dual-media (visual + textual) experience as a content creation feature.

4. **6.05a-iv — Command palette accessibility and screen reader integration:** How the palette's results, the Vim grammar's status line, and the REPL's output are announced by screen readers. ARIA labels for palette results. Audio cues for mode transitions. The challenge of making a visual grammar accessible to blind players.

5. **6.05a-v — Cross-player command history as community meta-analysis:** Aggregated (anonymized) command palette usage data revealing which commands are most used at each skill level, which queries indicate confusion ("perception" searches spike at Mission 5), and how the vocabulary translator's synonym map should evolve based on real player language. The command palette as a telemetry instrument for game design iteration.
