# 6.11c — Embeddable Demo Widget for Gaming Press

## Overview

Most game coverage works like this: a journalist writes 2,000 words about a game's mechanics, the reader nods along, scrolls past embedded screenshots and trailers, and maybe — if sufficiently persuaded — clicks a Steam link. The reader never *touches* the game. The coverage is about the game, not of the game.

Robot Uprising can break this pattern. The game runs on React + Pixi.js + Vite — a fully web-native stack. There is no port to "make it work in a browser." It already works in a browser. This means the game can exist **inside** the article reviewing it. A Kotaku writer could say "try it yourself" and the reader could configure a Scout, hit EXECUTE, and watch three ticks of a battle — without leaving the article, without downloading anything, without creating an account. The article becomes a demo becomes a funnel.

This is "The NYT Interactive Journalism Question": can a game review become a game?

---

## The Technical Landscape

### What an Embed Actually Is

An embed is an `<iframe>` tag — a rectangular portal in an article that loads a separate web page. The article's CMS (WordPress, Ghost, custom React) renders the frame; the game's server delivers the content. The two communicate via `window.postMessage()` — a secure cross-origin messaging API.

```html
<iframe
  src="https://play.robotuprising.game/embed/mission-1"
  width="100%"
  height="480"
  style="border: none; border-radius: 8px;"
  loading="lazy"
  allow="autoplay"
  sandbox="allow-scripts allow-same-origin"
></iframe>
```

### The Performance Constraint

This is the hardest technical problem. Gaming press sites care about **Core Web Vitals** — Google's page performance metrics that directly affect search ranking. A standard YouTube embed loads 1.3–2.6 MB of JavaScript before the user presses play. A Pixi.js game could be worse.

The embed **must not** degrade the host page's performance. This means:

| Metric | Target | Why |
|--------|--------|-----|
| Initial payload | < 200 KB (gzipped) | Typical article image budget is ~500 KB; the embed can't double it |
| Time to interactive | < 2 seconds on 4G | Reader scrolls to embed, expects immediate response |
| Cumulative Layout Shift | 0 | The embed must reserve its space before loading |
| Main thread impact | < 50ms Long Task | Cannot block the article's scroll or input responsiveness |
| Idle memory | < 30 MB | Mobile browsers crash above ~150 MB total per tab |

### The Facade Pattern

The industry-standard solution for heavy embeds: show a lightweight **facade** (static image + interaction prompt) first, load the real content only when the user clicks.

**For Robot Uprising:** The facade is a screenshot of the 8x8 board with unit icons, overlaid with a translucent dark scrim and a centered call-to-action: **"PLAY MISSION 1"** in the boot-log's uppercase teal monospace. The screenshot is a single compressed PNG (~40 KB). The facade loads instantly. When the reader clicks, the full Pixi.js runtime loads (~180 KB gzipped for a stripped embed build), initializes the board, and the facade cross-fades to the live game over 400ms.

**Preconnect optimization:** On hover over the facade, the embed issues `<link rel="preconnect">` hints to the game's CDN, shaving ~100ms off the load when the user clicks.

---

## Six Embed Models

### Model A: "The Snapshot" — Static Board + One Click to Live

**What it is:** The lightest possible embed. A static image of a configured mission board (units positioned, terrain rendered, spawn points marked) with a single button: "EXECUTE AND WATCH." Clicking loads a minimal Pixi.js runtime that plays a pre-recorded 20-tick battle — no player configuration, just the sealed watch phase. The battle runs at 1 tick/second. After the final tick, a Steam widget slides in from the bottom.

**The embed is a movie, not a toy.** The reader sees what Robot Uprising *looks like* — the isometric battlefield, the tick-by-tick snapping, the context bars filling and overloading, the signal chains flashing green. But they don't touch the workbench. They watch.

**Payload budget:**
- Facade PNG: ~40 KB
- Pixi.js runtime (stripped): ~120 KB gzipped
- Sprite atlas (5 unit types + tiles): ~60 KB
- Pre-recorded tick data (20 ticks): ~5 KB JSON
- Total on-click: ~185 KB gzipped + 40 KB facade = ~225 KB

**Strengths:**
- Lightest payload. Fits comfortably in any article.
- Zero learning curve. Reader watches, doesn't learn.
- Deterministic. Every reader sees the same battle. Journalist can describe specific ticks ("at Tick 12, the Scout discovers the flanking Striker...").
- Safe for publisher. No user input = no exploits, no inappropriate content, no WebGL crash bugs.

**Weaknesses:**
- Passive. Reader watches a video, essentially. An animated GIF could do 80% of this.
- No "aha moment." The whole point of Robot Uprising is that YOU design the attention system. Watching someone else's design isn't the pitch.
- No conversion hook beyond "that looked cool."

**Comparable:**
- **Into the Breach's press kit GIFs** — animated battle sequences shared in reviews. Effective for visual communication but zero interactivity.
- **Steam Store page video autoplay** — the current standard for "show the game in the listing."

---

### Model B: "The Puzzle" — One Preconfigured Challenge

**What it is:** The embed loads a single micro-puzzle: a pre-placed board (Mission 1 scale — 3 friendly units, 2 enemies) with one unconfigured unit. The reader must set 1-2 rules on that unit and hit EXECUTE. If the rules are correct, the battle plays out successfully. If not, the units fail (context overload, missed scout data, striker walks into ambush).

The puzzle is solvable in under 60 seconds. The workbench shows only the rule panel for the one unconfigured unit — no skills, no hooks, no context config. Pure rules introduction. The rule interface uses the sentence strip paradigm (3.07 Option A) with pre-populated WHEN tokens and empty DO slots.

**The embed is a taste of the core loop.** Configure → execute → watch → understand.

**Payload budget:**
- Facade: ~40 KB
- Pixi.js + React rule panel: ~250 KB gzipped
- Sprite atlas: ~60 KB
- Mission data: ~3 KB
- Total on-click: ~313 KB gzipped + 40 KB facade = ~353 KB

**The emotional beat:**

The reader scrolls past the article's description of the rule system. Below, instead of a screenshot, they see the board — dim, inactive, with a teal border and the text "TRY IT: Configure this Scout's rules and hit EXECUTE." They click. The board brightens. On the right, a narrow workbench panel shows a single Scout blueprint with two empty rule slots: `WHEN [___] → DO [___]`. Below each slot, a small menu offers three WHEN conditions (ENEMY_ADJACENT, BUFFER_FULL, NOTHING_DETECTED) and three DO actions (EVADE, PATROL, SIGNAL). There's a prominent teal EXECUTE button.

The reader drags ENEMY_ADJACENT → EVADE into the first slot. Drags NOTHING_DETECTED → PATROL into the second. Hits EXECUTE.

The board plays. Tick 1: Scout patrols north. Tick 2: Scout detects enemy. Tick 3: Scout evades east. Tick 4: Striker (pre-configured, not player's) receives signal, moves to engage. Tick 5: Striker eliminates enemy. Green flash. "MISSION COMPLETE" fades in.

Below the board, two lines appear:
- "Your Scout survived because of Rule 1: ENEMY_ADJACENT → EVADE."
- "Want to see what happens with different rules? [Play the full demo →]"

**Strengths:**
- **The aha moment lives here.** The reader FEELS "I configured something, and it worked." This is the core pitch in 60 seconds.
- Journalist can reference specific rules: "I set my Scout to evade on contact, and watched the flanking maneuver emerge."
- Low enough payload for most publishers (~353 KB).
- Deterministic (fixed seed) — every reader who makes the same choices sees the same result.

**Weaknesses:**
- ~350 KB is pushing the budget for mobile-heavy publishers.
- Requires the React rule panel, which is more complex than pure Pixi.js.
- One puzzle = one experience. No replay value. Reader solves it or doesn't, then moves on.
- The "right answer" is guessable (it's a micro-puzzle with 9 combinations). Some readers will brute-force it.

**Comparable:**
- **NYT's embedded "Stupid Games" (2012)** — a playable game embedded directly in a magazine article about addictive games. The game let readers manipulate the article itself. Went viral because the interactivity surprised readers who expected a static article.
- **Wordle's early embeddable grid** — a minimal, self-contained puzzle that became its own marketing. The green/yellow grid shared on social media was technically an "embed" in the broad sense.
- **itch.io game embeds** — HTML5 games embedded via iframe, with customizable size and fullscreen button. The standard for indie browser game embedding.

---

### Model C: "The Workbench Slice" — Full Blueprint Editor for One Unit

**What it is:** A complete workbench experience for a single unit type. The reader sees the full blueprint editor — skills (toggles), rules (sentence strips), hooks (channel name input), context config (listen/ignore toggles). They configure one Scout blueprint, hit EXECUTE, and watch a 30-tick battle against 3 enemies on a small (4x4) board. After the battle, a mini-Inspector shows their Scout's context window over time (sparkline chart) and one highlighted decision moment.

This is **Mission 1 of the actual demo**, packaged in an iframe.

**Payload budget:**
- Facade: ~40 KB
- Full embed runtime: ~450 KB gzipped (React workbench + Pixi.js battlefield + Inspector sparkline)
- Sprite atlas: ~80 KB (4x4 board needs fewer tiles)
- Mission data: ~5 KB
- Total on-click: ~535 KB gzipped + 40 KB facade = ~575 KB

**Strengths:**
- The most honest representation of the game. Reader experiences actual gameplay, not a teaser.
- Inspector sparkline teaches the context window concept visually — the reader sees their unit's "memory" fill and evict.
- High conversion potential: reader who completes this and enjoys it is already playing the demo.

**Weaknesses:**
- ~575 KB is heavy. Many publishers will reject this for mobile performance reasons.
- Complex UI in a small iframe (480px height). The workbench needs 400px minimum width to be usable; on mobile portrait, this is the full screen.
- Higher bug surface. The full workbench has more interactive states = more things that can break in production across diverse browsers.
- Takes 3-5 minutes to complete. Most article readers won't invest this time mid-scroll.

**Comparable:**
- **Figma's embedded prototypes** — interactive design tools running in iframes within blog posts and documentation. Similar payload weight, similar "try it yourself" energy.
- **CodePen/CodeSandbox embeds** — full development environments in iframes. Commonly used in technical articles. Reader can edit and run code inline.

---

### Model D: "The Replay Theater" — Curated Battle Replays with Inspector

**What it is:** The embed plays a curated battle replay — not live simulation, but pre-recorded tick data from a hand-crafted scenario designed to demonstrate a specific mechanic. The reader can scrub the timeline (arrow keys or drag), click units to inspect their context window state, and see decision traces. No configuration, no execution — pure Inspector mode.

**The embed teaches the analytical half of the game.** Where Model B teaches "configure → execute," Model D teaches "observe → understand."

**Payload budget:**
- Facade: ~40 KB
- Pixi.js + Inspector UI: ~300 KB gzipped
- Replay data (30 ticks, 5 units): ~15 KB JSON
- Sprite atlas: ~60 KB
- Total on-click: ~375 KB gzipped + 40 KB facade = ~415 KB

**The emotional beat:**

The reader scrolls to the embed. The facade shows a frozen mid-battle board with the text "INSPECT THIS BATTLE — Click any unit to see its decisions." They click. The board loads. A timeline scrubber appears at the top — 30 tick pips, Tick 1 highlighted. The reader clicks the Scout. A side panel shows the Scout's context window at Tick 1: two slots filled (TERRAIN: jungle, SELF: idle), four empty. The reader taps the right arrow. Tick 2: the Scout has patrolled north. Context window gains OBSERVATION: enemy_south. Tick 3: a hook fires — the context window shows SIGNAL_SENT: recon-net. A dashed green line flashes from Scout to Relay.

The reader scrubs forward to Tick 12 — the decisive moment. The Striker's context window is full (8/8 slots), and a new signal arrives. Context overload — the Striker jitters, stunned for one tick. The context bars flash red. The reader can see exactly which slot was evicted (TERRAIN: cached_position) and which signal replaced it (THREAT: enemy_flanking). They understand: the Striker lost positional awareness because it was receiving too many signals. The architecture's weakness is legible.

Below the replay: "This Scout→Relay→Striker signal chain caused a context overload at Tick 12. How would you prevent it? [Try the full demo →]"

**Strengths:**
- Teaches the Inspector — the game's most unique screen — in context.
- The "why did this unit fail?" question is a natural hook. It creates an intellectual itch that the full demo can scratch.
- Moderate payload (~415 KB). Acceptable for most publishers.
- No user-generated content = no moderation concerns.
- Journalists can reference specific ticks and decisions in their articles with confidence that readers can verify them in the embed.

**Weaknesses:**
- Requires Inspector UI in the embed — more complex than pure battlefield rendering.
- Passive-adjacent. The reader observes but doesn't create. The conversion hook is intellectual curiosity, not creative satisfaction.
- Timeline scrubber needs careful mobile touch design (fat-finger-proof tick selection).

**Comparable:**
- **Chess.com embedded game replays** — interactive PGN viewers embedded in articles. The reader can step through each move, see engine evaluations, and explore variations. The gold standard for embedded analytical gameplay.
- **Lichess study embeds** — annotated chess games with commentary, embeddable via iframe. Teachers use these in educational articles.

---

### Model E: "The Configurator" — Widget that Generates Shareable Config Codes

**What it is:** Not a playable game at all — a standalone blueprint editor widget. The reader configures a unit blueprint (skills, rules, hooks, context config) in a clean, isolated editor. No battlefield, no execution. When they're done, the widget generates a Config Code (per 7.03a specification) — a shareable string they can paste into the full demo. The widget also shows a "blueprint score" — a synthetic evaluation of their config's viability (coverage of scenarios, EM footprint, context window utilization estimate).

**The embed is a character creator.** Like creating a D&D character before you play — the investment creates attachment.

**Payload budget:**
- Facade: ~40 KB
- React workbench only (no Pixi.js): ~200 KB gzipped
- No sprites needed (workbench is pure DOM)
- Total on-click: ~200 KB gzipped + 40 KB facade = ~240 KB

**Strengths:**
- Lightest interactive model (~240 KB). Pure React, no Pixi.js, no sprites.
- The Config Code creates a bridge between article and demo. Reader generates a code in the article, opens the demo, pastes the code, and sees their design in action. The article sends the reader to the demo **with cargo** — not empty-handed.
- Blueprint score creates social sharing: "My Scout scored 87/100 — what's yours?" Screenshots of high-score configs shared on social media.
- Publishers love low-payload widgets. This would be accepted by virtually any CMS.

**Weaknesses:**
- No battlefield. No battle. No drama. The reader configures a thing they can't see work.
- Blueprint scoring is synthetic — the number doesn't mean much without the context of actual battle. Risk of misleading players into optimizing for the score rather than actual gameplay.
- Disconnected experience. The magic of Robot Uprising is configure → execute → watch. This model only has configure.

**Comparable:**
- **D&D Beyond character builder** — embeddable character creation that generates shareable character sheets.
- **Pokémon Showdown team builder** — configure teams without battling, share via paste codes, test later.

---

### Model F: "The Layered Widget" — Progressive Disclosure Embed

**What it is:** A single embed URL that adapts to its context. The article author specifies a `mode` parameter in the iframe src:

```html
<!-- Minimal: just watch a battle -->
<iframe src="https://play.robotuprising.game/embed?mode=snapshot&mission=1"></iframe>

<!-- Interactive: solve a puzzle -->
<iframe src="https://play.robotuprising.game/embed?mode=puzzle&challenge=scout-rules"></iframe>

<!-- Full: complete Mission 1 experience -->
<iframe src="https://play.robotuprising.game/embed?mode=full&mission=1"></iframe>

<!-- Replay: inspect a curated battle -->
<iframe src="https://play.robotuprising.game/embed?mode=replay&scenario=overload-demo"></iframe>

<!-- Config: blueprint editor only -->
<iframe src="https://play.robotuprising.game/embed?mode=config&unit=scout"></iframe>
```

The embed loads only the code needed for the specified mode. A `postMessage` API lets the host page listen for events:

```javascript
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://play.robotuprising.game') return;
  const { type, data } = event.data;
  // type: 'mission_complete', 'config_exported', 'steam_click', 'embed_loaded'
  // data: { config_code, mission_id, ticks_survived, ... }
});
```

This API enables publishers to:
- Track conversion events (how many readers click the Steam link after completing the puzzle)
- Display contextual callouts ("Nice! You solved it in 3 tries" using the mission_complete event)
- Chain embeds: a puzzle embed at paragraph 3, a replay embed at paragraph 7, a full demo link at paragraph 12

**Strengths:**
- One codebase, multiple experiences. Maintenance of one embed system, not five.
- Publisher choice. A mobile-focused outlet picks `snapshot` (225 KB). A deep-dive publication picks `full` (575 KB). A technical blog picks `replay` (415 KB).
- The `postMessage` API turns the embed into a platform. Third-party developers could build interactive articles, educational modules, or tournament bracket pages using the embed events.
- Future-proof. New modes can be added without changing the iframe URL structure.

**Weaknesses:**
- More complex to develop (5 modes vs. 1).
- Documentation burden — publishers need to understand the mode options and API.
- Testing matrix: 5 modes × N browsers × mobile/desktop = significant QA surface.

---

## The `postMessage` API — Detailed Specification

The embed communicates with the host page via a structured message protocol. Messages are JSON objects with a `type` field and a `data` payload.

### Embed → Host Messages

| Type | Trigger | Data | Use Case |
|------|---------|------|----------|
| `embed_loaded` | Facade clicked, runtime initialized | `{ mode, version, loadTimeMs }` | Publisher analytics |
| `mission_complete` | Player wins/loses the embedded mission | `{ success, ticksSurvived, configCode, overloadCount }` | Contextual article callouts |
| `config_exported` | Player generates a Config Code in config mode | `{ configCode, unitType, skillCount, ruleCount }` | Social sharing integration |
| `steam_click` | Player clicks Steam wishlist/purchase link | `{ source: 'embed', articleUrl }` | Conversion attribution |
| `replay_scrub` | Player scrubs to a specific tick in replay mode | `{ tick, unitSelected, contextFill }` | Synchronized article annotations |
| `error` | Runtime error or crash | `{ errorType, message }` | Publisher error monitoring |

### Host → Embed Messages

| Type | Effect | Data |
|------|--------|------|
| `set_theme` | Adjusts embed color scheme | `{ theme: 'light' \| 'dark', accent: '#hex' }` |
| `set_locale` | Sets language | `{ locale: 'en' \| 'fil' \| 'ja' \| ... }` |
| `jump_to_tick` | In replay mode, scrubs to a tick | `{ tick: number }` |
| `pause` | Pauses execution in watch mode | `{}` |
| `resume` | Resumes execution | `{}` |

### Security

- All messages validated against `event.origin` whitelist (the game's own domain).
- `sandbox="allow-scripts allow-same-origin"` — no popups, no form submission, no top-level navigation from inside the iframe.
- No cookies set by the embed. No localStorage access (iframe sandboxing). Session state lives only in memory.
- Content Security Policy header on the embed page: `frame-ancestors *` (allow any domain to embed) with `script-src 'self'` (no injected scripts).

---

## Publisher Integration Guide — How a Journalist Embeds the Widget

### For WordPress (90% of gaming press)

A WordPress shortcode plugin:

```
[robot-uprising mode="puzzle" challenge="scout-rules" height="480"]
```

The plugin renders the iframe with correct attributes, lazy loading, aspect-ratio reservation (preventing CLS), and the facade preconnect hint. Publisher installs the plugin once; any author uses the shortcode.

### For Ghost / Custom CMS

Raw HTML embed block:

```html
<div style="position: relative; width: 100%; padding-bottom: 56.25%; overflow: hidden;">
  <iframe
    src="https://play.robotuprising.game/embed?mode=puzzle&challenge=scout-rules"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px;"
    loading="lazy"
    allow="autoplay"
    sandbox="allow-scripts allow-same-origin"
    title="Robot Uprising - Try Mission 1"
  ></iframe>
</div>
```

The `padding-bottom: 56.25%` creates a 16:9 aspect ratio container that reserves space before the iframe loads, preventing layout shift.

### For Discord / Social Media

A special `mode=card` generates an Open Graph-compatible preview: a static board image with unit positions, a "Play in Browser" badge, and a click-through to the full web demo. Discord auto-embeds the Open Graph card when someone pastes a `play.robotuprising.game/embed` link.

---

## Sensory Design

### The Facade (Pre-Click)

A 16:9 rectangle. Background: the isometric 8x8 board rendered as a high-quality PNG — rice terrace tiles glistening with moisture, tiny unit icons (👁 Scout, ⚔ Striker, 📡 Relay) positioned on the grid. The board is dimmed to 60% brightness. Overlaid: a dark translucent scrim (rgba(10, 15, 25, 0.7)) with a single element centered — a rounded rectangle (240×48px) with a 1px teal border (#00D4AA), containing "PLAY MISSION 1" in the boot-log's uppercase monospace font (14px, letter-spacing: 2px). The button pulses — its border opacity oscillates between 60% and 100% on a 3-second sinusoidal cycle. No animation on the board. No sound. Just the pulse.

On hover, the button fills with a subtle teal gradient (5% opacity). The cursor changes to pointer. A `<link rel="preconnect" href="https://play.robotuprising.game">` fires.

On click: the button expands to fill the rectangle (300ms ease-out). The text changes to "INITIALIZING..." in the same font. A thin horizontal progress bar (2px tall, teal) grows left-to-right across the bottom of the rectangle as the Pixi.js runtime loads. When loading completes, the rectangle contracts back to the button size (200ms), then the entire scrim fades out (400ms), revealing the live game underneath. A soft boot-chime plays (the same 440Hz→880Hz ascending tone from the game's boot log, but quieter — 40% volume, 200ms duration).

### The Embed Frame

A thin 1px border in muted teal (#00D4AA at 30% opacity) around the entire iframe. Bottom-right corner: a small Robot Uprising logo (16×16px) as a static watermark. Bottom-left: "robotuprising.game" in 10px muted text. These branding elements are non-interactive and use absolute positioning so they don't interfere with gameplay.

### The Steam Conversion Prompt (Post-Completion)

After the embedded experience completes (puzzle solved, replay finished, snapshot ended), the board dims to 40% brightness and a panel slides up from the bottom (300ms ease-out). The panel is 120px tall, matte dark background with a subtle top border (1px gradient from transparent to teal).

Content: Left side — two lines of boot-log text: "DEMO PROTOCOL COMPLETE" and "Full deployment available on Steam." Right side — two buttons side-by-side: "WISHLIST ON STEAM" (teal fill, white text, Steam logo icon) and "PLAY FULL DEMO →" (teal outline, teal text). Between the text and buttons, a vertical thin separator line.

The Steam button uses an `<a>` tag with `target="_blank"` and `rel="noopener"` — it opens the Steam store page in a new tab. The "PLAY FULL DEMO" button navigates to `robotuprising.game` in a new tab. Both clicks fire the `steam_click` postMessage event.

### Audio in Embeds

**Default: muted.** All embeds start with audio muted and a small speaker-off icon in the top-right corner. The reader clicks the icon to unmute. This follows the autoplay policy of all modern browsers (autoplay with sound is blocked) and respects the reading context — articles are often read in quiet environments or with other audio playing.

When unmuted: the embed plays the same audio as the full game but at 60% master volume. In puzzle mode, the rule-placement snap sounds play at 40% volume. In replay/snapshot mode, the tick-advance sounds and signal-delivery chimes play at 50%. No music — only SFX. The embed is too short for a musical arc to develop.

---

## Player Journeys

### Journey: Alex, 26, Casual Reader, Kotaku Subscriber

**Context:** Alex is reading a Kotaku review of Robot Uprising during their lunch break on an iPhone 14. They've never heard of the game. The review is titled "This Strategy Game Treats Your Brain Like a Context Window." Alex is a marketing analyst; they've heard of "context windows" from ChatGPT discourse but never played a strategy game. The article has an embedded puzzle widget (Model B) after the third paragraph.

**Minute 0:00 — The Scroll**
Alex scrolls through the article. The first two paragraphs describe the game's premise — you're an AI designing attention systems for robots. Alex thinks: "Okay, another indie RTS." Then they hit the embed. A dimmed isometric board — tiny pixel art robots on rice terrace tiles, wet green, mist in the corners. The teal "PLAY MISSION 1" button pulses gently in the center. The board looks different from anything Alex has seen in a Kotaku article. They stop scrolling.

**Minute 0:08 — The Click**
Alex taps the button. On their iPhone, the button expands, "INITIALIZING..." appears, the thin teal progress bar fills over 1.8 seconds (their 5G connection loads the ~350 KB payload quickly). The scrim fades. The board brightens — they see the full 8x8 grid (scaled to fit the phone's 393px width, tiles slightly smaller than desktop but readable). On the right third of the screen (landscape orientation prompted by the embed), a narrow panel shows a Scout blueprint with two empty rule slots.

The embed's title bar reads: "CONFIGURE THIS SCOUT — Set rules, then hit EXECUTE."

**Minute 0:20 — The Configuration**
Alex taps the first rule slot. A dropdown fans out: WHEN: [ENEMY_ADJACENT], [BUFFER_FULL], [NOTHING_DETECTED]. They tap ENEMY_ADJACENT. A second dropdown: DO: [EVADE], [PATROL], [SIGNAL]. They tap EVADE. A soft snap sound (barely audible — muted by default, but Alex unmuted after seeing the speaker icon). The rule slot fills: "WHEN ENEMY_ADJACENT → DO EVADE" in teal text on a dark strip.

Second rule slot: WHEN NOTHING_DETECTED → DO PATROL. Another snap.

**Minute 0:35 — The EXECUTE**
Alex taps the teal EXECUTE button. The workbench panel slides away (200ms). The board takes full width. A tick clock appears at the top — 15 horizontal pips. Tick 1 fires.

The Scout moves north (snap to grid — Into the Breach pacing). Context bar at the Scout's base: 2/6 slots filled (blue pips). Tick 2: Scout's perception cone detects an enemy. A green cell flash — signal sent. Context bar: 4/6. Tick 3: enemy moves adjacent. Scout evades east — the tile they just vacated flashes red (combat zone). Alex's breath catches slightly. The Scout survived because of Rule 1.

Ticks 4-8: the pre-configured Striker receives the Scout's signal, moves to engage, eliminates the enemy. Green flash. "MISSION COMPLETE" fades in over the board.

**Minute 1:05 — The Hook**
Below the board, a result panel slides up. Two lines: "Your Scout survived Tick 3 because of Rule 1: ENEMY_ADJACENT → EVADE." And: "What if the Scout had prioritized signaling over evading? [Play the full demo to find out →]"

Alex stares at the second line. "What if" — they want to try ENEMY_ADJACENT → SIGNAL instead of EVADE. They want to see the Scout die. They want to understand. They tap "Play the full demo." A new tab opens to `robotuprising.game`.

Alex never finished the Kotaku article.

**UI Annotations:**
- Mobile portrait: embed prompts "Rotate for best experience" but plays in portrait at reduced workbench width (2 rule slots stack vertically)
- Mobile landscape: 16:9 embed fills width, workbench panel is right 35%, board is left 65%
- Tap targets: minimum 44×44px per rule slot, per dropdown option
- Conversion link: "Play the full demo →" text link, not button, to feel editorial rather than promotional
- Embed height on mobile: 280px portrait, 220px landscape (aspect ratio maintained)

---

### Journey: Sarah, 34, Game Designer, Reading a GDC Vault Article

**Context:** Sarah is reading a post-GDC deep dive on Robot Uprising's design on Gamasutra (Game Developer Magazine). The article is by the game's lead designer, explaining the context window mechanic in detail. The article includes three embeds: a replay of a "context overload cascade" (Model D) at paragraph 5, a puzzle (Model B) at paragraph 12, and a config editor (Model E) at the end.

**Minute 0:00 — The First Embed (Replay)**
Sarah reads about how context overload works — when a unit's buffer fills and a new signal arrives, the unit is stunned for one tick. The article says "see for yourself" and Sarah hits the embed.

The replay loads (415 KB, 2.1 seconds on her office Wi-Fi). A 30-tick battle. 5 units on the board. Sarah immediately clicks the Relay (📡) — the one she reads is about to overload. The Inspector side panel shows the Relay's context window: 8/12 slots filled at Tick 1. She scrubs forward.

Tick 8: 10/12. Tick 10: 12/12. Tick 11: a new signal arrives from the Scout. Sarah sees the context bar flash red. The Relay jitters — stunned. In the Inspector panel, the evicted slot is highlighted amber: "OBSERVATION: terrain_cache (age: 9 ticks, priority: low)." The replacing signal is highlighted green: "SIGNAL: scout_alpha/threat_north (age: 0 ticks, priority: high)."

Sarah pauses. She reads the eviction decision: the oldest, lowest-priority entry was evicted. She scrolls the article to the paragraph about eviction policies. "Player-configured eviction priorities determine what the unit forgets." She looks at the embed again. She thinks: *What if eviction was by type instead of age? The Relay could have evicted the duplicate terrain entries instead of the positional data.*

She scrolls to the second embed — the puzzle — and spends 90 seconds configuring a Scout with different rules than the article suggested. Her version works. She screenshots the Config Code and shares it on Twitter with the article link: "My version of the GDC demo config. Try to beat my overload count."

**Minute 8:00 — The Third Embed (Config Editor)**
At the end of the article, the config editor widget (Model E). Sarah builds a full Relay blueprint — compress skill, filter enabled, two hook channels, eviction priority set to "type diversity" instead of the default "age-first." The widget generates a Config Code: `RU-SC-1-A3F7K2`. She copies it.

She opens `robotuprising.game`, pastes the code. Her Relay appears in the workbench. She runs Mission 3 with her Relay config designed entirely from a GDC article's embedded widget. The Relay doesn't overload. She grins.

**UI Annotations:**
- Desktop: replay embed at 720px width, full Inspector panel visible alongside board
- Tick scrubbing: arrow keys (left/right) advance one tick; click on timeline pip jumps to that tick
- Unit selection: click on any unit highlights it with a teal ring; Inspector panel updates to show that unit's context window
- Context window entries: each slot is a horizontal bar showing content type (color-coded), source unit, age in ticks, and priority level
- Config Code display: monospace, bordered, with a "COPY" button that triggers clipboard write + confirmation toast

---

### Journey: Tomás, 14, First-Time Strategy Player, Philippine Student

**Context:** Tomás finds a Robot Uprising article on a Filipino gaming blog (Level Up!) while browsing on his Android phone during jeepney ride home from school. The article is in Tagalog with English game terms. The blog embeds the snapshot mode (Model A) — the lightest option, because their audience is predominantly mobile on variable 4G connections.

**Minute 0:00 — The Discovery**
Tomás scrolls past an ad for Mobile Legends. Below, a section about "isang bagong strategy game mula sa Pilipinas" (a new strategy game from the Philippines). He sees the embed facade — an 8x8 board with rice terrace tiles. He recognizes the terraces — his lolo (grandfather) is from Ifugao. The unit icons are tiny but the terrain is unmistakable. He taps "PLAY MISSION 1."

**Minute 0:05 — The Load**
The snapshot loads in 1.4 seconds (~225 KB on his 4G connection). No configuration — just a pre-recorded battle. The board plays: 20 ticks, 1 second each. Scouts patrol through the rice terraces. Signals flash green between units. A Striker flanks an enemy through a narrow terrace passage. Combat flash — red. The enemy disappears. Tomás watches the whole thing. The isometric rice terraces with circuit-board data cables running through the paddies make him lean closer.

**Minute 0:25 — The Conversion**
The Steam panel slides up. But Tomás doesn't have Steam — he plays on mobile. The second button says "PLAY FULL DEMO →" — this opens `robotuprising.game` in his phone's browser. He taps it.

The full demo loads on his phone. Same rice terraces. Same unit icons. But now he can configure them. He spends 20 minutes on the jeepney playing Mission 1, naming his Scout "kuya" (older brother). He screenshots his first successful battle and sends it to his class group chat.

**UI Annotations:**
- Android Chrome: embed respects `prefers-reduced-data` media query — if the user has Data Saver enabled, the facade shows a 15 KB low-res JPEG instead of the 40 KB PNG
- 4G connection: facade loads in <500ms, full snapshot in <1.5 seconds on typical Philippine mobile bandwidth (~10 Mbps)
- Right-to-left text: not applicable for Filipino/English, but the embed supports RTL layout for Arabic press via `dir="rtl"` attribute
- Jeepney context: the embed auto-detects portrait orientation and renders the board slightly larger (no workbench panel in snapshot mode), filling the available width

---

### Journey: Dr. Reyes, 45, CS Professor, Embedding in Course Materials

**Context:** Dr. Reyes is writing a lecture page on his university's LMS (Canvas) about multi-agent systems. He wants to embed a Robot Uprising replay (Model D) to demonstrate how context windows work — it maps directly to his lecture on bounded memory in agent architectures. Canvas supports raw HTML embeds.

**Minute 0:00 — The Setup**
Dr. Reyes visits `robotuprising.game/press/embeds` — a dedicated page with embed codes organized by topic. He finds "Context Window Overload Demo" under "Educational Embeds." He clicks "Copy Embed Code." The code includes `mode=replay&scenario=overload-demo` and a `data-edu="true"` attribute that adds a vocabulary overlay to the embed — a small toggle labeled "CS Terms" that, when enabled, shows "bounded buffer" next to "context window" and "eviction policy" next to "what the unit forgets."

He pastes the HTML into his Canvas page. Canvas renders the iframe. He previews it. The facade loads. He clicks — the replay plays. The CS Terms overlay maps every game term to the formal concept he's teaching. He adds a paragraph below the embed: "Watch the Relay unit overload at Tick 11. Identify the eviction policy being used. What would change if the policy were LRU instead of priority-based?"

**Minute 0:15 — The Lecture**
In class, 30 students open the Canvas page on their laptops. They click the embed. Each student independently scrubs through the replay, clicking different units, discovering the overload event at different paces. One student notices that the Scout's context window at Tick 10 contains a 9-tick-old terrain entry — "Why doesn't it evict this first?" Dr. Reyes: "That's the question. The eviction policy is priority-based, not age-based. The terrain entry has high priority because the Scout's rules reference terrain data. Is that the right design?"

The classroom discussion emerges from the embed, not from a slide deck.

**UI Annotations:**
- Educational mode (`data-edu="true"`): adds CS terminology overlay, removes Steam conversion prompt, replaces with "Learn more at robotuprising.game/education"
- LMS compatibility: Canvas, Blackboard, and Moodle all support raw HTML iframe embeds; the embed uses no features that require popups or top-level navigation
- CS Terms toggle: persistent per session (stored in embed's sessionStorage, not localStorage — no data persists after tab close)
- The vocabulary overlay shows paired terms: "Context Window (bounded buffer)", "Overload (buffer overflow + stun)", "Eviction (cache replacement)", "Hook (event-driven message passing)", "Channel (named pipe / pub-sub topic)"

---

## Interaction Effects

- **6.11 (Web demo acquisition funnel):** The embed IS the top of the funnel. Every embed is a conversion surface — snapshot mode captures attention, puzzle mode captures intent, config mode captures investment. The full web demo is the next step for every embed mode.
- **7.03a (Config Code format):** Config Codes are the bridge between embed and demo. A config built in an article's embed widget travels via Config Code into the full game. The same serialization format, the same validation, the same import UI.
- **6.11b (Demo analytics):** Embed events (`mission_complete`, `steam_click`, `config_exported`) feed into the demo analytics dashboard. Which articles generate the most conversions? Which embed modes have the highest completion rate? Which publishers' audiences play longest?
- **6.11d (Demo as competitive infrastructure):** Could embeds surface leaderboard data? "The current top Config Code for this challenge: RU-SC-1-X7FK. Can you beat it?" The embed becomes a competitive surface.
- **5.00 (External documentation anti-pattern):** The educational mode embed (with CS Terms overlay) is Robot Uprising's entry into formal education. Dr. Reyes's use case — teaching multi-agent systems via a game embedded in course materials — is a dream scenario for organic reach. The game teaches CS concepts; the CS course drives game adoption.
- **6.11a (Save migration):** Config Codes generated in embeds should be importable into the full demo and the full game. The reader's 60-second puzzle config becomes a permanent blueprint.
- **1.17a (Animated tooltip pattern):** In puzzle mode, the workbench tooltips should work identically to the full game — the micro-scenario engine running on the embed's 4x4 board preview.
- **6.02 (Audio design):** Embed audio is a reduced subset — SFX only, no music, default muted. But the sounds that DO play must be the same sounds as the full game, building sonic familiarity.
- **Platform accessibility (6.05):** The embed must support reduced-motion (`prefers-reduced-motion`), high-contrast mode, and screen reader ARIA labels on all interactive elements. A visually-impaired reader using an article with a screen reader should hear "Robot Uprising interactive demo. Puzzle mode. Configure a Scout unit's rules, then execute a battle." Not silence.

---

## Comparable Games — Detailed

### itch.io Game Embeds

itch.io's embed system is the closest precedent for what Robot Uprising needs. Any HTML5 game hosted on itch.io can generate an iframe snippet: `<iframe src="https://itch.io/embed-upload/XXXXX" width="800" height="600"></iframe>`. The embed includes a fullscreen button and a link back to the game page. Many indie games use this in press kits, blog posts, and personal sites.

**What works:** Zero friction for the developer (itch.io hosts the files and generates the code). Responsive sizing. Fullscreen escape hatch for players who want a bigger view. **What doesn't:** No facade pattern (the game loads immediately, blocking the page). No `postMessage` API (no communication between embed and host). No mode selection (you get the whole game or nothing). No analytics integration. itch.io embeds are a good minimum viable product — Robot Uprising needs to go further.

### NYT Interactive Journalism (2012–present)

The New York Times has embedded playable games directly in articles since 2012. The most famous: Jon Huang's "Stupid Games" interactive for a Times Magazine cover story, where readers could literally destroy the article page using a playable game overlaid on the text. The game was the editorial message — the article about addictive games WAS an addictive game.

NYT also pioneered interactive quizzes embedded in articles ("How Y'all, Youse and You Guys Talk" became the third most popular content piece of 2014 — a quiz). These aren't games per se, but they prove the core thesis: interactivity embedded in editorial content dramatically increases engagement, sharing, and time-on-page.

**What translates:** The embed should feel like it belongs in the article — not an ad, not a sidebar, but part of the editorial experience. The Kotaku journalist should be able to say "configure the Scout below" the way a NYT journalist says "take the quiz below." The embed is content, not promotion.

### Chess.com / Lichess Embedded Analysis Boards

Chess analysis boards embedded in articles are the gold standard for Model D (replay mode). Chess.com's embed widget lets a journalist paste a PGN (game notation) and readers can step through each move, see engine evaluations, and explore alternative lines. Lichess's study embed adds annotations, commentary, and branching variations.

**What translates:** Robot Uprising's replay embed should have the same "step through decisions" feel. Click a unit, scrub the timeline, see why it did what it did. The chess model proves that analytical interactivity — not just playing a game, but dissecting one — is compelling content for articles.

### GameDistribution's Direct Game Integration (DGI)

GameDistribution offers a commercial embed platform: publishers add HTML5 games to their sites via iframe, and GameDistribution handles ad monetization, providing revenue share. The games are lightweight, optimized for mobile, and designed for short sessions (2-5 minutes).

**What translates:** The performance optimization lessons — lightweight initial load, lazy asset loading, mobile-first rendering. Also the lesson that embeddable games can be a monetization surface, not just a marketing tool. Robot Uprising's embed doesn't need to monetize directly (it's a conversion funnel), but the technical constraints are the same.

---

## Recommendation: The Layered Widget (Model F) with Puzzle as Default

**Ship Model F** — the parameterized embed system with multiple modes. But recommend **puzzle mode (Model B)** as the default for gaming press, because:

1. It's the only mode that delivers the game's core "configure → execute → watch" loop.
2. At ~353 KB, it's within the performance budget for most publishers.
3. The "aha moment" — watching your configured unit survive because of YOUR rules — is the strongest conversion hook.
4. It generates a natural article integration point: "Try configuring the Scout differently and see what happens."

**For educational publishers:** Default to replay mode (Model D) with the CS Terms overlay. The analytical tool is more valuable for teaching than the puzzle.

**For mobile-heavy publishers:** Default to snapshot mode (Model A). The lightest payload for the highest-latency connections.

**For developer-audience publications (Gamasutra, GDC Vault):** Default to config mode (Model E). The blueprint editor alone is interesting to people who design systems for a living.

### The One-Line Embed

For maximum adoption, provide a single-line embed that just works:

```html
<iframe src="https://play.robotuprising.game/embed" width="100%" height="480" loading="lazy"></iframe>
```

No mode parameter = smart default. The embed detects the viewport width and connection speed. Wide viewport + fast connection = puzzle mode. Narrow viewport + slow connection = snapshot mode. This adaptive behavior is transparent to the publisher — they paste one line and the embed picks the right experience.

---

## The TikTok Clip

A screen recording of the puzzle embed inside a Kotaku article. The reader scrolls past the article text, hits the embed, taps "PLAY MISSION 1." The board loads. They drag two rules into place — 4 seconds of interaction. Hit EXECUTE. The battle plays for 8 ticks — their Scout evades, the Striker flanks, the enemy is eliminated. "MISSION COMPLETE." The caption: "I just beat a boss battle inside a Kotaku article without leaving the page."

The virality is in the surprise — "wait, you can play games inside articles now?" — combined with the satisfaction of the 60-second configure-execute-win loop.

---

## New Aspects Discovered

- **6.11c-i — Embed performance profiling across 20 gaming press CMSes:** actual payload budget measurements on Kotaku, IGN, Polygon, Game Developer, Rock Paper Shotgun, etc.; which CMSes add overhead (WordPress plugins, ad scripts, consent banners); the embed must survive hostile host-page JavaScript environments
- **6.11c-ii — Embed A/B testing framework:** serving different embed modes to different readers and measuring conversion rate per mode; the embed as its own experimental platform; ethical considerations of A/B testing inside editorial content
- **6.11c-iii — Embed as press kit component:** the embed code packaged alongside screenshots, trailers, and fact sheets in the official press kit; Distribute.gg/PressKit.html integration; embargo-gated embed activation (embed code exists but returns "COMING SOON" facade until embargo lifts)
- **6.11c-iv — Embed localization for 10 target locales:** the puzzle mode's rule labels, result text, and Steam prompt must support all 10 locales; text expansion in de-DE and fr-FR within the narrow workbench panel; interaction with L1-L4 text expansion fallback strategies (4.69e-i-a-i-f-i-α-i-A-i-1-a)
- **6.11c-v — Embed accessibility audit across screen readers:** NVDA, JAWS, and VoiceOver behavior inside cross-origin iframes; ARIA label propagation; focus management when the reader tabs into and out of the embed; the "embed trap" anti-pattern where keyboard users get stuck inside the iframe
