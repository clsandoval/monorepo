# 1.07 — Bitburner: Incremental Hacking Sim, Real JavaScript, Idle-Game Progression

## Overview

**Bitburner** (Fulcrum Games / Hydroflame, Steam release December 2021, free-to-play, open-source) is a programming-based incremental RPG set in a dystopian cyberpunk 2077. The player writes real JavaScript ("Netscript") to hack servers, automate income, manage gangs, run corporations, and eventually break out of nested simulated realities called BitNodes. It holds a 95% positive rating on Steam (~7,000+ reviews, "Overwhelmingly Positive"), maintains ~450-900 concurrent players, and was built by 250+ open-source contributors over five years. Inspired by Hacknet, Uplink, Else Heart.break(), and Deus Ex.

**Why it matters for Robot Uprising:** Bitburner is the closest existing game to the *feeling* Robot Uprising wants to produce — managing autonomous systems that work when you're not looking. But where Bitburner's medium is freeform JavaScript and its loop is idle accumulation, Robot Uprising uses a visual workbench and its loop is tactical execution. Bitburner proves that real programming concepts (API design, resource constraints, multi-agent orchestration, automation cascades) can drive a game with mass appeal. It also demonstrates every pitfall of making "write code" the core verb — and why Robot Uprising deliberately chose visual configuration instead.

---

## Core Loop

### The 30-Second Loop
Open the terminal. `scan` to see connected servers. `hack` a target to steal money. Watch the progress bar fill. Money arrives. Check your stats. Look for the next server to crack.

In the early game, this is manual. You type commands. You wait. You learn what `hack`, `grow`, and `weaken` do. The game is deliberately tedious at first — the discomfort of manual repetition is the *engine* that motivates learning to automate.

### The 5-Minute Loop
Write a script. A simple one: `while(true) { await ns.hack('foodnstuff'); }`. Deploy it with `run hack.js`. Watch it run in the background. Feel the dopamine hit of passive income. Then realize you need more RAM to run more scripts. Buy a server. Deploy the script there too. Now you have two agents hacking independently. This is the "aha" moment — the player transitions from operator to architect.

### The Session Loop
Crack new servers (each has a required hacking level to `nuke`). Distribute scripts across every server you own and every server you've rooted. Optimize: which targets yield the most money? Write a script that calculates optimal targets. Write a script that automatically deploys hacking scripts to all available servers. Write a script that buys and upgrades servers when you can afford them. Now your scripts are managing your infrastructure. You check in every few hours, see your net worth climbing, and tweak the automation.

### The Meta Loop (BitNodes)
After reaching hacking level 3000+ and joining the Daedalus faction, you obtain the "Red Pill" augmentation and hack the `w0r1d_d43m0n` server — destroying the simulation. You enter a new BitNode: a parallel reality with different rules. BitNode 2 unlocks gangs. BitNode 4 unlocks the Singularity API (automating the GUI actions themselves). BitNode 10 unlocks sleeves (clone agents). Each BitNode resets progress but grants permanent Source Files — powerful persistent upgrades.

This is Bitburner's prestige system, and it's brilliant: each reset *changes the game*, not just the numbers. BitNode 4 transforms the game from "automation within the hacking system" to "automation of the game itself" — your scripts can join factions, install augmentations, and navigate menus. The meta-game is building a script that plays the entire game from scratch with zero human input.

---

## Information Management Mechanics

### RAM as Context Window
Every server has a fixed RAM capacity. Every script has a static RAM cost, calculated at compile time by analyzing which NS API functions are referenced. A script calling `ns.hack()` costs 1.7GB base. Add `ns.grow()`, it's still 1.7GB (same base). But add `ns.getServer()`, and the cost jumps because that function costs additional RAM.

**Critical parallel to Robot Uprising:** RAM IS the context window. A server with 16GB RAM can run a 1.7GB script on 9 threads, or a 4GB script on 4 threads, or one 16GB mega-script. The player constantly makes trade-offs about what fits in the box. This is exactly the tension Robot Uprising creates with the 6-14 slot context window — what information can this unit hold at once?

The key difference: Bitburner's RAM is a static constraint (fixed at compile time), while Robot Uprising's context window is dynamic (fills and evicts during execution). Bitburner doesn't have the overload/stun mechanic — if a script doesn't fit, it simply won't run.

### The ~300-Function API as Skill Library
Bitburner's NS API is a ~300-function library organized into namespaces: core functions (hack, grow, weaken), server management, hacknet, gang, corporation, sleeve, bladeburner, codingcontract, singularity. Each namespace has its own RAM cost — accessing `ns.hacknet` incurs a flat 4GB cost regardless of how many functions you use from it.

**Translation to Robot Uprising:** The API namespaces map to Robot Uprising's skill system. A Scout with `patrol` and `evade` skills is like a script that imports `ns.scan()` and `ns.hack()` — limited capability set, low resource cost. A Command unit with `reassign`, `reroute`, `prioritize` is like a script importing the Singularity API — powerful but expensive. The "skill slots" constraint in Robot Uprising is an elegant visual abstraction of what Bitburner accomplishes through RAM budgets.

### Multi-Server Distribution as Multi-Agent Architecture
Advanced Bitburner play involves distributing scripts across 25+ servers, each running specialized tasks: some servers run hack scripts, some run grow scripts, some run weaken scripts, timed to land simultaneously on the same target (the "batch" or "HWGW" attack pattern). One orchestrator script coordinates the timing.

**Translation to Robot Uprising:** This IS Robot Uprising's hook/channel system. The Bitburner player building a batch attack — hack script finishes at tick T, grow script finishes at T+1, weaken at T+2, all targeting the same server — is doing exactly what a Robot Uprising player does when wiring Scout→Relay→Striker via hooks on a named channel. The coordination timing, the signal latency (Bitburner calls it "sleep delay"), the information routing — it's the same design problem expressed in code vs. visual configuration.

---

## How Complexity Is Introduced Over Time

### Phase 1: Terminal Cowboy (0-2 hours)
Manual hacking via terminal commands. Learn `scan`, `connect`, `hack`, `analyze`. The game is a text adventure. No scripting required yet. The player builds a mental model of the network topology.

### Phase 2: First Script (2-5 hours)
The nano editor opens. Write your first `while(true) { await ns.hack('foodnstuff'); }`. Deploy it. Watch it work. Feel the transition from manual labor to automation. This is the foundational emotional beat — the first time the machine works without you.

### Phase 3: Multi-Agent (5-15 hours)
Buy servers. Distribute scripts. Write a deployment script that copies your hack script to all servers and runs it. Now you have a fleet. But each server has different RAM, so you need to calculate thread counts. Your deployment script grows more sophisticated.

### Phase 4: Optimization (15-50 hours)
Discover that hack/grow/weaken interact — hacking lowers security, weakening reduces it, growing increases money. Optimal play requires batch scripts that coordinate all three operations with precise timing. Write the HWGW batch controller. Implement formulas for calculating optimal thread counts. Your scripts now include math.

### Phase 5: Metagame Automation (50-200 hours)
Enter new BitNodes. Get Source File 4 (Singularity API). Now write scripts that automate faction joining, augmentation purchasing, and even the augmentation installation reset. Write a script that plays the entire game. The game becomes a meta-programming challenge: how quickly can your scripts reach the end state from a fresh reset?

### Phase 6: Total Automation (200+ hours)
Alainbryden's `autopilot.js` runs everything from a single entry point. The game plays itself. The player watches, tweaks, optimizes. The satisfaction isn't playing — it's *having built a system that plays*.

---

## UI/UX for Planning/Building Phase

### The Terminal
Bitburner's primary interface is a Unix-style terminal with commands like `run`, `kill`, `ps`, `scan`, `connect`. It's deliberately austere — black background, green text, monospace font. The terminal teaches command-line fluency as a side effect.

### The Script Editor (Monaco)
A full VS Code-style editor with syntax highlighting, autocomplete, and error checking. Players write real JavaScript with access to the NS API. The editor supports multiple tabs, file management, and even external IDE integration via a remote API.

**What this means for Robot Uprising:** Bitburner proves that players WILL learn complex tools if motivated. The Monaco editor is intimidating — but the game's progression makes players *want* to use it. However, the dropout rate at the scripting threshold is significant. Many reviews say "I loved the first few hours but hit a wall when I needed to code." Robot Uprising's visual workbench is the design answer to this wall — making the complexity accessible without requiring programming literacy.

### No Visual Programming
Bitburner has zero visual representations of code flow, data flow, or agent relationships. Everything is text. There's no node graph, no flowchart, no visual debugger. When players want to understand their multi-script architecture, they draw diagrams on paper or in external tools.

**Translation:** This is Robot Uprising's biggest opportunity. Bitburner players *want* to see their systems visually — the game just doesn't provide it. Robot Uprising's workbench, channel map, and Inspector fill exactly this gap. The Inspector's decision trace — "unit did X because rule Y matched because signal Z arrived from unit W" — is what every Bitburner player wishes they had when debugging a misfiring batch script.

---

## What Creates "One More Turn" / Replayability

### 1. The Prestige Loop (BitNodes)
Each BitNode reset adds a new game system (gangs, sleeves, bladeburner, corporations) while keeping persistent upgrades. Players report 500+ hours across multiple BitNode runs. The question "what does BitNode N unlock?" drives progression.

### 2. The Optimization Spiral
There's always a faster way. Players share scripts on GitHub, compare income rates, optimize thread allocation, race through BitNode completions. The Zachtronics histogram impulse exists here, but informally — through community sharing rather than built-in leaderboards.

### 3. The 3 AM Debugging Session
Bitburner's most addictive quality is the real programming challenge. When a batch script misfires and you can't figure out why, you enter the same flow state as real software debugging. Players report losing entire nights to "just one more fix."

### 4. Idle Accumulation
The game runs while you're away (at a reduced rate). Coming back to find your net worth has tripled overnight is a powerful pull. The idle-game dopamine loop works.

---

## Community Reception

### What Players Love
- **"It taught me to code."** Many reviews credit Bitburner for sparking a programming career. The game's educational value is its strongest legacy.
- **"The feeling of watching your scripts work."** The autonomous-system satisfaction. "I watched my script buy all the servers, crack them, deploy hacking scripts, and start earning money — all while I was eating lunch."
- **"The BitNode system."** Multiple resets that each change the game fundamentally. "Every BitNode feels like a new game."
- **"The community."** Active Discord, extensive GitHub contributions, helpful beginner guides. The community fills gaps the game leaves (no built-in tutorials past the basics).

### What Players Complain About
- **"I hit a wall when I needed to actually code."** The biggest accessibility complaint. Manual gameplay can only carry you so far — eventually you MUST write scripts. Players with no programming background bounce here.
- **"RAM management early game is punishing."** Starting with 8GB of home server RAM means a single 4GB script leaves almost no room. The first RAM upgrade costs $1M — a significant early-game grind.
- **"BitNode progression scaling is broken."** BitNode 1 requires hacking level 3000, BitNode 2 requires 15000. The Source File rewards don't proportionally offset the difficulty increase. Mid-game progression feels grindy.
- **"The UI is confusing."** Too many tabs, too many systems, insufficient tutorials for advanced mechanics (corporations, gang management, bladeburner). Players resort to external wikis and community guides.
- **"No visual feedback."** The game is almost entirely text and numbers. No visual representation of your network, your script architecture, your server fleet. Players who aren't already comfortable with terminal interfaces feel lost.

---

## Sales/Reception Data

| Metric | Value |
|--------|-------|
| Steam Rating | 95% Positive (~7,000 reviews) |
| Price | Free to Play |
| Concurrent Players | ~450-900 (as of early 2026) |
| Peak Concurrent | ~926 (Oct 2025) |
| Contributors | 250+ (open-source) |
| Platform | Steam, Web (github.io) |
| Release | December 2021 (Steam) |

---

## Specific Mechanics That Translate to Robot Uprising

### 1. RAM Budget → Context Window Slots
Bitburner's static RAM analysis (each API function adds to cost, total must fit server capacity) directly maps to Robot Uprising's context window (each observation/signal fills a slot, total must fit the unit's buffer). The key design improvement: Robot Uprising makes the constraint *dynamic* (slots fill and evict during play) rather than static (fixed at compile time), adding the temporal dimension that makes the constraint feel alive.

### 2. Batch Script Coordination → Hook/Channel Timing
The HWGW batch pattern (four scripts timed to land sequentially on a target) is a pure code version of Robot Uprising's hook chains. Scout emits on "threat-detected" channel at T=5, Relay compresses at T=6, Striker receives at T=7 and engages at T=8. Same coordination problem, visual instead of code.

### 3. Thread Count Optimization → Production Queue Tuning
"How many threads of hack.js should I run on each server?" maps to "how many Scouts vs. Relays vs. Strikers should my factory produce?" Both are resource allocation problems where the optimal ratio depends on the specific challenge.

### 4. Source Files (Persistent Upgrades) → Blueprint Codex Unlocks
BitNode completion grants permanent Source Files that unlock new capabilities. Robot Uprising's mission progression unlocks new skills, hooks, and unit types in the Blueprint Codex. Both provide the prestige-loop motivation of "beat this challenge to permanently expand your toolkit."

### 5. The Singularity API → Command Agent Meta-Level
Source File 4 unlocks the Singularity API, which lets scripts automate the game's GUI actions — joining factions, buying augmentations, traveling between cities. This is the meta-level: scripts that manage the game, not just the hacking. Robot Uprising's Command agent (whose skills include `reassign`, `reroute`, `prioritize` — managing other agents) is the visual equivalent. The player who builds a Command agent that reconfigures Scouts mid-battle is doing what a Bitburner player does when writing a Singularity script that resets and rebuilds from scratch.

### 6. The "3 AM Debugging" Flow State → Inspector Phase
Bitburner's deepest engagement happens when scripts misbehave and the player must trace through logic to find the bug. Robot Uprising's Inspector — with its decision trace, context window state, and event log — is a designed, guided version of this experience. Instead of `console.log` debugging in a text terminal, the player clicks a unit and sees exactly what rule matched, what context it evaluated, and what signal caused the unexpected behavior. Same intellectual satisfaction, dramatically better UX.

### 7. Open-Source Community → Modding Potential
Bitburner's 250+ contributors and thriving script-sharing ecosystem prove that programming-game communities will create content endlessly. Robot Uprising's equivalent: a blueprint sharing system where players upload and download agent configurations (see community aspects 7.03, 7.05). The difference — Robot Uprising configs are visual, not code — makes sharing more accessible.

---

## What Bitburner Gets Wrong (And Robot Uprising Must Avoid)

### 1. The Code Wall
The transition from manual play to scripting is a cliff, not a ramp. Players who can't write JavaScript are locked out of 90% of the game's depth. Robot Uprising's loadout-style workbench — where you toggle skills, drag rules, and wire hooks without writing a single line of code — is the direct design response. The workbench must feel like equipping gear, not writing software.

### 2. No Visual Mental Model
Bitburner offers no visual representation of the player's system architecture. When a player has 25 servers running different scripts with complex timing dependencies, the only way to understand the system is to read the code. Robot Uprising's channel map (auto-generated, read-only) and hook wiring (visible colored lines during battle) exist precisely because Bitburner proved players need to *see* their systems.

### 3. Idle-Game Pacing vs. Tactical Tension
Bitburner's idle loop means the player often has nothing to do but wait. The game's core emotional arc — "watch numbers go up while I'm away" — is inherently low-tension. Robot Uprising's sealed watch — "I can't pause, I can't intervene, I have to watch my agents execute and live with the results" — is the opposite. The emotional peak is watching your system in real-time under pressure, not checking your phone after lunch.

### 4. Unbounded Complexity
Bitburner's JavaScript API is ~300 functions. The possibility space is infinite. This is exciting for experienced programmers but paralyzing for newcomers. Robot Uprising's hard slot limits (3 skill slots, 2 hook slots, limited rule count) impose creative constraints that make the design problem tractable. The constraint IS the game — choosing what to leave out of a Scout's loadout.

### 5. Text-Only Feedback
Hacking a server in Bitburner yields a `console.log` message and a number change. There's no visual celebration, no animation, no sound effect. Robot Uprising's combat — cell flashes, signal chain visualizations, context bar color shifts, one-shot-one-kill snap animations — must make every tick of execution visually legible and emotionally resonant.

---

## The TikTok Clip

**Bitburner's clip:** A 4x speed timelapse of a terminal filling with script output as the player's net worth counter rockets from $1,000 to $1,000,000,000 — overlaid with "I wrote 50 lines of JavaScript and became a trillionaire." The appeal is power fantasy through code.

**What Robot Uprising steals from this:** The same power fantasy — "I designed this system and it's working perfectly" — but expressed visually. The TikTok clip is the isometric battlefield, three Scouts moving in coordinated patterns, signal lines flashing between them and a Relay, a Striker receives the compressed intel and snaps to the enemy position for a one-shot kill. The player's hand isn't on any controls. The system they designed is executing. Same dopamine hit, no code required.

---

## Detailed Player Journeys

### Journey: Marcus, 28, Junior Web Developer

**Context:** Marcus has been playing Bitburner for 3 days. He's hacked about 10 servers manually and just wrote his first hack script. He's thinking about how to scale up but feeling the RAM wall.

**Minute 0:00 — The Terminal**
Marcus opens Bitburner. The terminal fills his screen — dark background, green monospace text, a blinking cursor. His net worth shows $2.3M. His home server has 16GB RAM. He types `ps` and sees his basic hack script running on 4 threads against `joesguns`, earning about $15K per cycle. A sidebar shows his hacking level (127), available servers, and current scripts.

**Minute 0:30 — The Bottleneck Realization**
He checks `scan-analyze 3` to see the network. There are servers he can't crack yet — they need higher hacking level or more port-opening programs. He realizes he needs $200K for the BruteSSH program from the dark web. His hack script earns too slowly. He opens the script editor.

**Minute 1:30 — The Second Script**
He writes a deployment script: loop through all cracked servers, copy his hack script to each, run it with as many threads as the server's RAM allows. He's learning the API — `ns.scp()`, `ns.exec()`, `ns.getServerMaxRam()`. Each new function call adds to the script's RAM cost. He runs it. It fails — the script itself costs 5.4GB and his home server is already running the hack script. He kills the hack script, runs the deployer, then restarts the hack script. Clunky but it works.

**Minute 4:00 — The Fleet**
Now he has 10 servers running hack scripts against `joesguns`. His income jumps from $15K/cycle to $80K/cycle. He watches the log outputs cascade across multiple terminals. The feeling is powerful — ten machines working simultaneously, all because of 20 lines of JavaScript he wrote.

**Minute 6:00 — The Meta-Realization**
He thinks: "What if my deploy script also figured out the best target automatically?" He opens the editor again. An hour later, he has a script that scans all servers, calculates which one has the most money and lowest security, and targets the whole fleet at it. The optimization spiral has begun.

**What Marcus learned:** The transition from single-agent to multi-agent. The feeling of scaling up through architecture, not effort.

**What Robot Uprising translates:** Marcus's journey from "one hack script" to "fleet deployment script" maps to Mission 5 in Robot Uprising — the factory introduction. Pre-placed units (manual hacking) give way to blueprint-based production (scripted deployment). The same "aha" moment: I don't control individual units, I design systems that produce and coordinate them.

---

### Journey: Priya, 35, Data Scientist (Non-Gamer)

**Context:** Priya saw Bitburner recommended on a Python subreddit. She knows Python well but has barely touched JavaScript. She's installed the game curious about the "learn JS by playing" pitch.

**Minute 0:00 — Terminal Confusion**
The game opens to a terminal. No main menu. No graphics. No tutorial popup. Just a cursor. Priya types `help` and gets a wall of commands. She tries `scan` and sees server names. She tries `connect foodnstuff` and she's on a new server. She types `hack` and a progress bar appears. She earns $400. She's mildly intrigued but also slightly lost.

**Minute 3:00 — The Tutorial Hints**
She notices the sidebar has a "Tutorial" section. It walks her through basic terminal commands, then introduces scripts. She opens the editor and types the example: `export async function main(ns) { ns.tprint("Hello World"); }`. She runs it. "Hello World" appears in the terminal. She smiles — this is familiar territory (just Python with curly braces).

**Minute 8:00 — The JavaScript Wall**
She tries to write a loop. In Python it's `while True:`. In JavaScript it's `while(true) { }`. She forgets `await` before `ns.hack()` and the game freezes. She force-refreshes. She adds `await`. It works. The syntactic friction is annoying but manageable. The NS API is well-documented in-game — she checks `ns.hack()` in the docs panel and sees parameters, return values, RAM cost. This feels like reading Python docstrings. She's in.

**Minute 15:00 — The Conversion**
Priya has a hack script running. She realizes she can use `ns.getServerMoneyAvailable()` in a conditional, just like she'd use a Pandas column filter. The mapping clicks: NS API functions are just library calls. The game is essentially "write a Python program but in JavaScript." She's hooked.

**What Priya experienced:** A data scientist mapping a new programming language to familiar patterns. The NS API is the bridge — it's just function calls, same as any library.

**What Robot Uprising must beat:** Priya's first 3 minutes were confusing. No visual context, no spatial orientation, just text. Robot Uprising's Plan screen — an isometric board with visible units, a blueprint editor with labeled slots — provides immediate spatial grounding. A data scientist should look at the workbench and think "ah, this is a configuration dashboard" within 10 seconds, not spend 3 minutes typing `help` into a void.

---

### Journey: Diego, 16, High School Student

**Context:** Diego saw a TikTok about Bitburner ("this game teaches you to hack"). He's never written code but plays a lot of Minecraft and factorio-style games. He's excited about the hacking fantasy.

**Minute 0:00 — "Where's the Game?"**
Diego opens Bitburner expecting a hacking interface with cool visualizations — maybe something like the movie Swordfish. Instead: a black terminal with a blinking cursor. He types random things. `hack` doesn't work (he's not connected to a server). He's immediately confused. There are no graphics, no tutorial popup, no hint about what to do. He almost closes the game.

**Minute 2:00 — The Tutorial Lifeline**
He notices the sidebar tutorial link. He follows it mechanically — `scan`, `connect foodnstuff`, `hack`. The progress bar fills. He earns $400. "Cool, I guess." He does it a few more times. The money number goes up but there's nothing to spend it on yet and no visual reward. He's bored.

**Minute 5:00 — The Script Barrier**
The tutorial says "now write a script." Diego has never written code. The editor opens. He sees `export async function main(ns) {` and his eyes glaze. He copies the tutorial example character by character, missing a semicolon. The script fails with a cryptic error. He copies it again more carefully. It works. But he doesn't understand *why* it works.

**Minute 10:00 — Bounce**
Diego alt-tabs to YouTube. He'll come back later, maybe. He tells his friend "it's cool but you have to know coding." He doesn't come back.

**What Diego experienced:** The total newcomer bounce. The game assumed baseline programming knowledge it explicitly said wasn't required. The gap between "you don't need to know code" and "now write `export async function main(ns)`" is a chasm.

**What Robot Uprising MUST solve:** Diego IS the target audience — someone who's never written code but loves building systems. Robot Uprising's Mission 1 (pre-placed units, just configure context rules) must give Diego the hacking-fantasy power feeling within 60 seconds. No code. No syntax. Toggle a rule ON, see the Scout change behavior on the board immediately. Drag rules to reorder priority, watch the unit's decision-making shift in real-time preview. The workbench must feel like equipping Minecraft enchantments, not writing JavaScript functions.

---

## Sensory Description: What Bitburner Feels Like

**Visual:** A void. Dark background. Green and white monospace text scrolling endlessly. Numbers incrementing. Tab panels with dense text — server lists, script editors, faction pages, stats screens. The only "graphics" are ASCII art in some terminals and the occasional colored text. It looks like a 1990s IRC client crossed with a Linux terminal. Deliberately ugly in a way that reads as "authentic hacker aesthetic" to its audience.

**Audio:** Silent by default. No soundtrack. No sound effects. The silence is intentional — it communicates "this is serious, this is a tool, not a toy." Some players report adding their own cyberpunk playlists.

**Haptic:** The keyboard. Bitburner is a keyboard-first game. The satisfying clack of typing `run autopilot.js` and watching the terminal explode with output. The only mouse interaction is navigating sidebar tabs and clicking in the editor.

**Emotional texture:** Quiet satisfaction. Bitburner's emotional peak isn't explosive — it's the slow-burn realization that your script is working perfectly while you eat dinner. The "I built this and it runs itself" glow. Occasionally punctuated by the sharp frustration of a misbehaving script and the detective-thriller tension of debugging it.

**What Robot Uprising must change:** Every sensory dimension. Isometric pixel art replaces the void. Tick-clock percussion replaces silence. One-shot-one-kill snap animations replace incrementing numbers. Signal chain visualizations replace terminal output. The sealed watch phase must feel like watching a heist unfold — tense, visual, time-pressured. The satisfaction of "my system works" must be delivered through the spectacle of coordinated robot combat, not a number going up in a terminal.

---

## Interaction Effects with Other Design Space Options

### With Building-Block Paradigms (Wave 3)
Bitburner's freeform JavaScript proves that unlimited expression is powerful but inaccessible. Any building-block paradigm for Robot Uprising must be *more constrained* than code — slot limits, visual wiring, drag-and-drop rules — while still producing emergent complexity. The mixing-board paradigm (sliders and dials) would feel too shallow after studying Bitburner; the node-graph paradigm risks recreating the complexity wall in visual form. The locked loadout-style blueprint editor is the right middle ground — constrained enough for Diego, expressive enough for Marcus.

### With Onboarding (Wave 5)
Bitburner's biggest lesson: the onboarding cliff. Diego's bounce at minute 5 is the scenario Robot Uprising must prevent at all costs. The boot-log tutorial must never require the player to write or understand code. The first three missions must teach context windows, rules, and hooks through pure visual interaction — toggle, drag, wire — before any abstract concept is named.

### With Competitive/Community (Wave 7)
Bitburner's script-sharing community (GitHub repos, Discord channels, Reddit guides) proves that programming-game players will create and share content endlessly. Robot Uprising's blueprint sharing system needs to capture this energy while being accessible to non-coders. Sharing a blueprint (visual config) is more accessible than sharing a script (code file) — the "recipe" can be understood at a glance.

### With Platform (Wave 6)
Bitburner runs in a browser — same target as Robot Uprising. It proves that a web-based game with deep systems can sustain long-term engagement. The Monaco editor integration proves that complex tools work in the browser. Robot Uprising's Pixi.js + React stack can deliver far more visual richness than Bitburner's terminal while maintaining the same platform accessibility.
