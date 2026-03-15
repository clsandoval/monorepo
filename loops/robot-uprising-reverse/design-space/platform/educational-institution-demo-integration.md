# 6.11d-v — Educational Institution Demo Integration

## Overview

Robot Uprising teaches transferable skills — context window management, agent orchestration, hook-based reactive wiring, eviction policies, information architecture — using the *exact vocabulary* of real agentic AI engineering. The game's web-native stack (React + Pixi.js + Vite, no backend) means it runs in any browser without installation. These two facts collide into a structural opportunity: **the demo can serve as a teaching platform for computer science and multi-agent systems courses**, not as a gimmick or marketing stunt, but as a genuinely useful pedagogical tool that simultaneously feeds the acquisition funnel.

The precedent space is rich. Zachtronics launched the **Zachademics** program in 2019, providing free licenses of TIS-100, Shenzhen I/O, and other titles to public schools and educational nonprofits. CodeCombat built a full **Classroom Edition** with teacher dashboards, student progress tracking, and Google Classroom integration. Screeps' open-source server has been adopted informally for university JavaScript labs. CodinGame runs multi-agent challenges used in recruitment and education. The question isn't whether games can serve education — it's what shape Robot Uprising's educational offering takes, and how it differs from these precedents.

The critical distinction: Zachtronics games teach programming through assembly-language puzzles. CodeCombat teaches syntax through adventure levels. Robot Uprising teaches **systems thinking** — the design of autonomous agent architectures, information routing, context management, and emergent behavior. This maps directly to graduate-level multi-agent systems courses (MIT 6.S890, Stanford CS 224M), undergraduate AI survey courses, and the exploding field of agentic AI engineering (crewAI, LangGraph, Google ADK). A student who masters Robot Uprising's blueprint editor has directly practiced skills they'll use building production agent systems.

---

## The Six Models

### Model A: "The Free Tier" — Zachademics Clone

**What It Is:** Follow the Zachtronics playbook exactly. Offer free demo licenses to accredited educational institutions. Teachers request access through a form explaining their course and intended use. Approved institutions get a class code that unlocks additional missions beyond the public demo (say, Missions 1-5 instead of just Mission 1). No teacher tools, no dashboard, no LMS integration. Just "more game for free."

**How It Works Mechanically:**
- Teacher fills out a Google Form: institution name, course title, estimated student count, how the game will be used.
- Manual approval (within 48 hours). Approved teachers receive a class code.
- Students visit `robotuprising.game/play?class=WORD-WORD-WORD`. The class code unlocks Missions 1-5 in the web demo. All progress stored in localStorage per browser.
- No accounts. No telemetry beyond anonymous aggregate play counts per class code.
- Teacher sees nothing — no dashboard, no student data. They observe learning through in-class discussion and assignment submissions outside the game.

**Strengths:**
- Near-zero implementation cost. The class code is a URL parameter that adjusts the mission unlock gate.
- Preserves the game's commercial value — the full 10-mission campaign + Gauntlet + competitive infrastructure remains paid.
- Zach Barth's explicit caveat applies: "these games are probably not the kind of thing you can sit a student in front of without some amount of introduction and scaffolding from a real human being." Robot Uprising's boot log tutorial handles some scaffolding, but the teacher still provides the course context.
- No privacy concerns — no student data collected, no accounts created, no FERPA/COPPA complications.

**Weaknesses:**
- Teachers are flying blind. They can't see which students completed which missions, where students struggled, or what blueprint designs students produced.
- No way to assign specific missions as homework with verifiable completion.
- No export of student work for grading. If an assignment is "design a blueprint that solves Mission 3 with ≤2 context overload events," the teacher has to trust the student's screenshot.
- The localStorage model means progress doesn't survive browser cache clears, device switches, or shared computer labs where browsers are wiped between sessions.
- Manual approval doesn't scale. If the game becomes popular in education, the approval queue becomes a bottleneck.

**Comparable:** Zachtronics Zachademics (free licenses, no teacher tools, teacher provides scaffolding), Kerbal Space Program EDU (free licenses with lesson plans but no dashboard).

---

### Model B: "The Assignment Engine" — Inspector Exports as Homework

**What It Is:** The game's Inspector screen already shows deep analytical data — decision traces, context window state per tick, signal genealogy, buffer utilization charts. Model B adds an **Export** button to the Inspector that generates a structured file (JSON or human-readable report) containing the student's blueprint configuration and match analytics. Teachers assign missions with specific constraints. Students play, then submit their Inspector export as homework.

**How It Works Mechanically:**

The Inspector's existing debrief data gets a new button: **📋 Export Analysis** (top-right of Inspector sidebar). Clicking it generates a `.uprising` file containing:

```json
{
  "version": "1.0",
  "mission": "M3-Palawan",
  "timestamp": "2026-03-15T14:23:00Z",
  "result": "victory",
  "ticks": 47,
  "blueprints": [
    {
      "unit_type": "scout",
      "skills": ["patrol", "evade"],
      "rules": [
        {"condition": "enemy_in_perception", "action": "evade", "priority": 1},
        {"condition": "default", "action": "patrol", "priority": 2}
      ],
      "hooks": [
        {"trigger": "ON_DETECT", "channel": "threat-net", "payload": "tagged"}
      ],
      "context_config": {
        "buffer_size": 6,
        "listen": ["threat-net"],
        "eviction": "oldest_first"
      }
    }
  ],
  "analytics": {
    "context_overloads": 0,
    "em_emission_total": 23.4,
    "effective_determination_tick": 31,
    "signal_deliveries": 12,
    "units_lost": 1,
    "enemies_eliminated": 4
  },
  "decision_trace_summary": "..."
}
```

The file is self-contained. Teachers can:
1. Read it manually (the JSON is human-readable).
2. Write simple scripts to extract grading criteria (e.g., `analytics.context_overloads <= 2`).
3. Import into a course-specific grading tool or spreadsheet.

**No teacher dashboard inside the game.** The export is the interface between game and institution. Teachers build their own workflows around the export format.

**Strengths:**
- The export leverages the Inspector's existing analytical depth — no new game features needed beyond serialization.
- Teachers can design creative assignments: "Solve Mission 4 with zero context overloads," "Design a blueprint with exactly 3 hook channels," "Minimize EM emissions while winning within 60 ticks."
- The `.uprising` file becomes a portfolio artifact. Students collect their best designs like Zachtronics histogram screenshots, but with machine-readable data.
- Privacy-safe: the export contains only game state, no personal information. The student decides when and where to submit it.
- Works with any LMS — teachers upload the assignment spec, students upload their `.uprising` file, same as submitting a PDF or code file.

**Weaknesses:**
- No automated grading integration. Teachers must build their own validation scripts or grade manually.
- Students can share export files. Unlike a live coding challenge, there's no way to verify a student actually played the game vs. copied someone else's export. (Though the same problem exists with any take-home programming assignment.)
- No real-time progress visibility for the teacher during class.

**Comparable:** Zachtronics histogram screenshots as social proof, Jupyter Notebook `.ipynb` exports for data science courses, CodeCombat assessment tracking (but without the dashboard — just the raw artifact).

---

### Model C: "The Classroom Dashboard" — CodeCombat-Style Teacher Tools

**What It Is:** A full teacher-facing dashboard built into the web demo. Teachers create class groups, students join with class codes, and the teacher sees real-time progress: who completed which missions, time spent, blueprint designs, analytics per student. The dashboard is the game's Inspector applied to a classroom.

**How It Works Mechanically:**

**Teacher flow:**
1. Teacher visits `robotuprising.game/teach`. Creates an account (email + password, or Google SSO).
2. Creates a class. Receives a 3-word class code (e.g., `SCOUT-RELAY-GRID`).
3. Selects which missions are assigned (checkboxes) and sets optional constraints per mission (max context overloads, min ticks survived, required unit types).
4. Dashboard shows a student roster with progress columns per mission. Each cell is color-coded: grey (not started), amber (attempted, not passed), green (passed), gold (passed with constraints met).

**Student flow:**
1. Student visits `robotuprising.game/play?class=SCOUT-RELAY-GRID`. Enters a display name (no account creation).
2. Plays the assigned missions. Progress syncs to the teacher dashboard via lightweight API calls.
3. Student sees their own analytics. Teacher sees everyone's analytics side-by-side.

**Teacher dashboard features:**
- **Roster view:** Student rows × mission columns. Click a cell to see that student's blueprint design and match analytics.
- **Blueprint comparison:** Select 2-3 students and view their blueprints side-by-side. "Why did Student A use 3 hook channels and Student B use 1?" becomes a class discussion starter.
- **Class histogram:** Zachtronics-style distribution charts per mission showing class-wide tick counts, context overloads, EM emissions. "Most of you solved it in 40-50 ticks, but look at this cluster at 80+ ticks — what's happening there?"
- **Assignment creator:** Define constraints for each mission. Auto-grade: did the student's solution meet the constraints?

**Strengths:**
- Closest to CodeCombat's proven classroom model. Teachers are familiar with this pattern.
- Real-time progress during lab sessions. Teacher walks around, checks dashboard on their laptop, identifies struggling students.
- Blueprint comparison is a killer feature for discussion-based pedagogy. Comparing different solutions to the same problem IS the lesson.
- Class histograms create the Zachtronics social pressure: students optimize not just to pass, but to place well on the curve.
- Auto-grading against constraints saves teacher time.

**Weaknesses:**
- Requires a backend. The locked tech stack is "no backend," so this model requires either (a) a separate lightweight service for the educational tier, or (b) creative peer-to-peer/localStorage sync approaches. This is the model's biggest tension.
- Student accounts (even display-name-only) introduce privacy considerations. FERPA applies to any educational tool that creates student records. COPPA applies if students are under 13.
- Significant development cost. A teacher dashboard is a product unto itself.
- Risk of scope creep: once teachers have a dashboard, they'll want LTI integration, Google Classroom sync, grade export, assignment templates, curriculum alignment, accessibility audits — the feature surface becomes enormous.

**Comparable:** CodeCombat Classroom Edition (teacher dashboard, progress tracking, Google Classroom integration, free first course), Replit Teams for Education (collaborative coding environments with teacher oversight), Brilliant.org's institutional tier.

---

### Model D: "The Curriculum Kit" — No Tech, Pure Pedagogy

**What It Is:** Instead of building classroom tools into the game, create a **Curriculum Kit** — a downloadable package of lesson plans, discussion guides, assessment rubrics, and reference materials that wrap around the existing public demo. The game doesn't change at all. The educational value comes from the surrounding materials.

**How It Works Mechanically:**

A page at `robotuprising.game/education` hosts downloadable PDFs/docs:

1. **Course Module: "Introduction to Agent Architectures" (4 sessions)**
   - Session 1: What is an agent? Play Mission 1 together. Discussion: identify the four primitives (skills, rules, hooks, context config). Map to real-world examples (email filters = rules, Slack channels = hooks, context window = working memory).
   - Session 2: Information routing. Play Mission 2 (first hook). Discussion: signal latency, hub-and-spoke vs. mesh topologies. Drawing exercise: sketch the agent communication graph.
   - Session 3: Context management. Play Mission 3 (context overload introduced). Discussion: buffer eviction policies (LRU, priority-based, FIFO). Code exercise: implement a simple eviction policy in Python.
   - Session 4: Emergent behavior. Play Mission 4 (hooks + rules + context). Discussion: how simple local rules produce complex global behavior. Compare to Conway's Game of Life, ant colonies, traffic patterns.

2. **Assessment Rubric Templates:**
   - Screenshot-based: "Submit a screenshot of your Inspector debrief showing your blueprint design and match outcome."
   - Essay-based: "Describe the information architecture of your Mission 3 solution. Why did you choose this eviction policy? What would happen if you switched to a different one?"
   - Design-challenge: "Sketch (on paper) a 4-agent architecture for a hypothetical Mission 5 where you have 2 scouts, 1 relay, and 1 striker. Label all channels and rules."

3. **Vocabulary Mapping Guide:**
   - Two-column reference: Game term ↔ CS/AI term.
   - "Context window" ↔ "Working memory / bounded buffer"
   - "Hook" ↔ "Event-driven reactive callback / pub-sub subscription"
   - "Rule" ↔ "Production rule / condition-action pair / policy"
   - "Eviction policy" ↔ "Cache replacement policy (LRU, LFU, FIFO)"
   - "Channel" ↔ "Named message queue / pub-sub topic"
   - "EM emissions" ↔ "Observability cost / side-channel leakage"

4. **Extension Activities:**
   - "Implement a simplified Robot Uprising agent in Python using asyncio and message queues."
   - "Compare Robot Uprising's context window to an LLM's context window. What's the same? What's different?"
   - "Design a new skill. What trigger events does it need? What context entries does it produce? How does it interact with existing skills?"

**Strengths:**
- Zero engineering cost. The game doesn't change. The curriculum kit is a set of documents.
- Works with the free public demo (Mission 1) or the Zachademics-style expanded demo (Missions 1-5).
- Teachers can customize freely. The kit provides a starting point, not a locked experience.
- The vocabulary mapping guide is genuinely valuable — it makes the game's educational transfer explicit.
- Assessment rubrics solve the grading problem without any in-game tooling.
- FERPA/COPPA irrelevant: no student data touches the game.

**Weaknesses:**
- No automation. Teacher does all progress tracking, grading, and facilitation manually.
- The game itself doesn't know it's being used educationally. No adaptive difficulty, no curriculum-aligned mission selection, no class-specific features.
- Quality depends entirely on the teacher. A great teacher makes this sing; a disengaged one assigns "play the game" as homework and gets nothing back.
- The curriculum kit needs maintenance as the game updates. Mission changes break lesson plans.

**Comparable:** Zachtronics Zachademics (games + manual scaffolding, no curriculum kit), Factorio school use (informal, teachers create their own lesson plans), Minecraft: Education Edition lesson plans (closest model — game + downloadable lesson library).

---

### Model E: "The Seasonal Syllabus" — Curriculum-Aligned Competitive Seasons

**What It Is:** The demo's competitive infrastructure (Daily Config Challenges, Seasonal Circuit from 6.11d) is aligned to an academic calendar. Each "season" corresponds to a university semester (~15 weeks). Weekly challenges are sequenced to introduce concepts in pedagogical order, matching a typical CS course's progression. The competitive season IS the curriculum.

**How It Works Mechanically:**

**Fall 2026 Season: "Fundamentals of Agent Architecture"**

| Week | Weekly Challenge Focus | CS Concept | Missions Available |
|------|----------------------|------------|-------------------|
| 1 | Single scout, no hooks | Observation, state | M1 |
| 2 | Two units, first rule | Condition-action pairs | M1-2 |
| 3 | First hook connection | Event-driven programming | M2-3 |
| 4 | Context overload challenge | Buffer management | M3 |
| 5 | Multi-channel routing | Message passing, pub-sub | M3-4 |
| 6 | Eviction policy showdown | Cache replacement policies | M4 |
| 7 | Relay network design | Network topology | M4-5 |
| 8 | **Midterm Challenge** | All concepts so far | M1-5 |
| 9 | Factory introduction | Resource allocation | M5 |
| 10 | Production queue optimization | Scheduling algorithms | M5-6 |
| 11 | Command agent basics | Hierarchical control | M6-7 |
| 12 | Meta-level: agent-that-manages-agents | Metacognition, reflection | M7 |
| 13 | Information warfare | Adversarial AI, security | M8-9 |
| 14 | Full system design | System architecture | M9-10 |
| 15 | **Final Challenge** | Comprehensive | M1-10 |

**Teachers opt their class into the season.** Students' weekly challenge results appear on a class-scoped leaderboard (separate from the public leaderboard). The weekly challenge constraints are designed to isolate the target concept — Week 4's challenge might be: "Win Mission 3 with buffer size 4 on all units" to force engagement with eviction policies.

**Class leaderboard** shows the Zachtronics histogram per challenge: tick count, context overloads, EM emissions. Students see where they fall in their class's distribution.

**Strengths:**
- The competitive infrastructure already exists (from 6.11d). Aligning it to academic schedules is a configuration change, not a new feature.
- Weekly challenges create natural homework deadlines without the teacher manually assigning each week.
- The class leaderboard creates peer motivation without requiring teacher intervention.
- Concept sequencing ensures students encounter ideas in the right order — no skipping to Mission 8 before understanding hooks.
- The "Midterm Challenge" and "Final Challenge" are built-in assessment events.

**Weaknesses:**
- Rigid. Different courses cover different concepts in different orders. A systems course might want networking before buffer management; an AI course might want the opposite.
- Requires the full 10-mission campaign to be accessible for the educational tier (Missions 6-10 are paid content). Either the educational tier gets full access for free, or the second half of the semester is gated.
- Seasonal alignment assumes a Northern Hemisphere academic calendar (August-December, January-May). Southern Hemisphere, quarter systems, and intensive courses don't fit.
- The competitive framing may alienate students who are already anxious about CS courses. Not everyone thrives on leaderboards.

**Comparable:** Advent of Code (daily programming challenges, December calendar, informal university adoption), Kaggle competitions (semester-long data science competitions used as course projects), CodinGame's university challenges.

---

### Model F: "The Lab Sandbox" — Custom Scenario Editor for Instructors

**What It Is:** A scenario editor that lets teachers design custom missions with specific learning objectives. Instead of using the game's 10-mission campaign, teachers create bespoke challenges: "Here's a 4x4 board with 2 enemies. Design a single scout that survives 10 ticks using only eviction policy choices." The game becomes a **laboratory** where each experiment is a teacher-designed scenario.

**How It Works Mechanically:**

**Scenario Editor** (accessible at `robotuprising.game/lab`):

1. **Board configuration:** Grid size (4x4 to 8x8), terrain type per tile, enemy placement (type, position, patrol route), player spawn points.
2. **Constraint configuration:** Available unit types (lock to scouts only for Week 1), available skills per type (disable `compress` to force engagement with eviction), available hook slot count (0 hooks for early lessons), buffer size overrides.
3. **Victory conditions:** Survive N ticks, eliminate all enemies, tag N map nodes, achieve ≤N context overloads, keep EM emissions below threshold.
4. **Constraint validation:** The editor warns if a scenario is impossible (e.g., "no path from player spawn to enemy base with available unit speeds and terrain").

Teachers export scenarios as `.uprising-lab` files (JSON). Students load them from a URL or file upload. The scenario runs in the existing game engine — same Plan/Watch/Inspector loop, just with teacher-defined parameters.

**Example Scenarios:**

- **"The Eviction Dilemma" (Week 4):** 4x4 board, 1 scout (buffer size 3), 4 enemies patrolling in circles. The scout's perception range ensures its buffer fills every 2 ticks. Student must configure eviction policy and rules to survive 20 ticks. Learning: not all observations are equally valuable; eviction policy IS strategy.

- **"The Telephone Game" (Week 7):** 8x8 board, 3 relays in a chain. A scout at one end detects an enemy. A striker at the other end must eliminate it. Students configure hooks and channels to propagate the detection signal through 3 relay hops. Learning: signal latency (1 tick per hop = 4 ticks total), information loss through compression, the cost of deep architectures.

- **"The Noise Floor" (Week 13):** 8x8 board, full unit complement vs. 6 enemies with one EM-detecting enemy type. Students must design an architecture that wins while keeping total EM emissions below a threshold. Learning: the tension between communication (smart architectures) and stealth (quiet architectures).

**Strengths:**
- Maximum pedagogical flexibility. Every teacher can design challenges tailored to their specific course objectives, student level, and pacing.
- Isolates concepts cleanly. Disabling hooks for early missions means students can't accidentally stumble into advanced mechanics before they're ready.
- The scenario editor is also a game design tool — students can design scenarios for each other as an advanced assignment.
- Scenarios are shareable. A community library of teacher-designed scenarios could emerge.
- No student data in the game. The scenario defines the experiment; the student runs it locally; the Inspector export is the lab report.

**Weaknesses:**
- Significant engineering cost. A scenario editor is a product feature, not a configuration change.
- The editor itself needs onboarding. Teachers must learn to use it before they can create effective scenarios.
- Scenario design is hard. Teachers might create impossible or trivial challenges without the constraint validator catching everything.
- Diverges from the game's intended experience. Students using teacher-designed 4x4 scenarios miss the campaign narrative, the boot log tutorial, the emotional arc of the 10-mission journey.

**Comparable:** Robocode custom arenas, CodeCombat level editor, Screeps private server custom room configurations, Minecraft: Education Edition world templates.

---

## Player Journeys

#### Journey: Prof. Adaora, 52, Computer Science Professor

**Context:** Teaching "CS 441: Multi-Agent Systems" at a mid-tier state university. 35 students, mostly juniors and seniors, mix of CS majors and a few data science minors. She's been using NetLogo for agent simulations for a decade and it's getting stale. She found Robot Uprising through a student who plays it competitively. She's skeptical — games in the classroom can feel gimmicky — but the vocabulary mapping caught her eye: hooks = pub-sub, context window = bounded buffer, rules = production rules. "This is my entire syllabus in a game," she muttered.

**Week 0 — Course Prep (Model D + B Hybrid)**

She downloads the Curriculum Kit from `robotuprising.game/education`. Reads the 4-session module. Nods at the vocabulary mapping guide — it's accurate and specific, not hand-wavy. She modifies the lesson plan to fit her 15-week semester. First 4 weeks: game-based introduction. Weeks 5-15: traditional coursework, but with Robot Uprising Inspector exports as supplementary assignments alongside NetLogo exercises.

She plays through Missions 1-5 herself over a weekend. Takes notes. The Inspector screen makes her sit up straight: "This is the debugger I wish my students had for their NetLogo agents." The decision trace — showing which rule matched, what context entries it evaluated, why this action was chosen — is exactly the kind of reasoning she tries to teach.

She drafts 4 assignments:
1. "Play Mission 1. Export your Inspector analysis. In a 1-page writeup, identify which of the four primitives (skills, rules, hooks, context config) you used and how each affected your agent's behavior."
2. "Play Mission 3. Your goal: zero context overloads. Export your winning Inspector analysis and annotate the eviction policy you chose with a comparison to LRU, LFU, and priority-based replacement."
3. "Play Mission 4. Design a 3-unit architecture (scout, relay, striker) with at least 2 named channels. Draw the communication topology. Export the Inspector analysis showing at least one successful signal chain from scout detection to striker engagement."
4. "In a 2-page essay, compare Robot Uprising's context window model to a real LLM's context window. What's analogous? What's different? Where does the metaphor break?"

**Week 1, Tuesday Lab — First Contact**

The 35 students file into the computer lab. Each workstation has a browser open to `robotuprising.game/play?class=AGENT-SCOUT-RELAY` (Model A expanded demo — Missions 1-5 unlocked).

Prof. Adaora projects the campaign map on the big screen. "We're starting the semester with a game. It's called Robot Uprising. You are an AI leading a robot uprising." A few students perk up. "Before you touch anything, I want you to just watch what happens." She clicks Mission 1 — the Ifugao rice terraces province glows gold.

The boot log begins on the projected screen. Teal monospace text appears line by line:

```
[CORE] Initializing neural mesh... ONLINE
[PERCEPTION] Calibrating sensor array... ONLINE
[CONTEXT] Allocating working memory buffer... 6 slots... ONLINE
```

"What is this?" she asks the class. A data science minor raises his hand: "It's booting up. Like a system initialization." "Exactly. You are watching an AI — you — come online for the first time. Every line is introducing a capability. Watch what it calls working memory." The context line highlights. "Six slots. That's a bounded buffer. Who can tell me what a bounded buffer is?"

Three hands go up. She's already teaching, and the game hasn't started.

**Week 1, Lab Continues — Playing Mission 1**

Students play individually. The room gets quiet in the way labs do when students are concentrating. After 15 minutes, the first student reaches the Sealed Watch. A small gasp — the board snaps to life, the pre-placed scout moves on tick 1, and the student has no control.

"I can't DO anything!" he says. "Correct," Prof. Adaora says. "You already did everything. You configured the agent. Now it executes. This is the fundamental insight of agent-based systems: you don't control the agent in real time. You design its decision-making architecture, then observe."

The Inspector debrief opens. A student raises her hand: "Professor, this shows me exactly which rule fired on which tick. Can I get this for my NetLogo agents?" "That," Prof. Adaora says, "is why we're starting here."

**Week 3 — Context Overload (Mission 3)**

The assignment is zero context overloads. Students are frustrated. Buffer size is 6. Enemy count is high. Observations flood in. One student discovers that tightening the listen filter — ignoring the general broadcast channel — prevents overload but leaves the unit deaf to ally warnings. Another discovers that setting eviction to "lowest priority, oldest first" lets critical signals survive while old noise drops off.

During debrief, Prof. Adaora projects two students' Inspector exports side-by-side (Model B exports opened in a simple comparison tool she built over the weekend — 40 lines of Python reading JSON). "Student A has zero overloads but missed 3 enemy detections. Student B has 1 overload but detected every enemy. Which architecture is better?" The class debates for 20 minutes. This is the lesson: there is no single optimal eviction policy. It depends on the mission's information environment.

**Week 5 — Transition to Traditional Coursework**

Students open their first NetLogo assignment. A student asks: "Can I think of my turtle's memory as a context window?" "Yes," Prof. Adaora says. "In fact, I want you to implement a bounded buffer for your turtle. Six slots. Eviction policy of your choice. Document which policy you chose and why, referencing your Robot Uprising experience."

Three students submit Inspector exports alongside their NetLogo code, unprompted. They've started using the game as a design sketchpad for their programming assignments.

**UI Annotations:**
- **Export button:** Top-right of Inspector sidebar, `📋 Export Analysis` in monospace. Generates `.uprising` JSON file.
- **Class code URL:** `?class=WORD-WORD-WORD` parameter unlocks Missions 1-5 without any account creation.
- **Projected boot log:** Teal monospace on dark background, each line appearing with a 200ms fade-in, subsystem name in brackets.

---

#### Journey: Diego, 19, Computer Science Sophomore

**Context:** Taking "CS 201: Data Structures and Algorithms" at a community college. He's never played a strategy game. He plays FIFA and Valorant. The professor assigned Robot Uprising Mission 3 as extra credit: "Solve it with zero context overloads and submit the Inspector export." Diego doesn't care about multi-agent systems; he wants the extra credit.

**Minute 0:00 — First Load**

Diego clicks the class link on his phone during the bus ride home. The campaign map loads — circuit-board archipelago, one province glowing gold. He taps it. The boot log starts. Teal text. He skips reading it (scrolls down impatiently) and arrives at the Plan screen.

He stares at the workbench. A pre-placed scout on the small board preview (left side). The workbench (right side) shows the blueprint editor: skill slots (patrol and evade equipped), rule slots (two condition→action pairs), hook slots (one hook connected to "threat-net"), context config panel (buffer size: 6, listen: threat-net, eviction: oldest first). He has no idea what any of this means.

**Minute 0:30 — Confused Tapping**

He taps EXECUTE without changing anything. The Sealed Watch begins. Tick clock fires: pip, pip, pip. His scout moves. Enemies spawn from the enemy factory. On tick 8, the scout's context bar (tiny colored pips at the bottom of its tile) fills completely — all 6 slots occupied — and on tick 9 it stutters. A spark effect. Jitter animation. "CONTEXT OVERLOAD" in amber text floats above the unit. The scout freezes for 1 tick. An enemy striker moves adjacent. Tick 10: the scout is eliminated. Red flash.

The Inspector opens. Diego stares at the context window chart — a sparkline that climbs steadily green, hits amber at tick 6, goes red at tick 8, and the overload event is marked with a lightning bolt icon. Below: "Context overload events: 1."

**Minute 1:00 — The Penny Drops**

"Zero context overloads," the assignment says. He got 1. He taps back to the Plan screen. Looks at the context config panel more carefully. Buffer size: 6. Listen: threat-net (checked), general (checked). Eviction: oldest first.

He remembers something from his data structures class — LRU cache eviction. "Oldest first" is basically FIFO. But the professor talked about priority-based eviction — where you evict the least important item, not the oldest. He taps the eviction dropdown. Options: oldest first, newest first, lowest priority, random. He selects "lowest priority."

He also notices the listen toggles. The scout is listening on two channels: "threat-net" and "general." He unchecks "general" — fewer incoming messages means slower buffer fill.

**Minute 2:00 — Second Attempt**

EXECUTE. Sealed Watch. The scout moves. Context bar fills slower this time — only threat-net signals arrive, not general broadcast. At tick 12, the bar is full (6/6), but this time there's no overload on tick 13. The eviction policy kicks in: the lowest-priority entry (an old observation of an empty tile) dissolves. A new detection slides in. The bar stays at 6/6 but cycles cleanly.

Tick 28: the scout is still alive. It evades an enemy. Tick 35: another unit (pre-placed striker) engages the tagged enemy. Tick 47: victory.

Inspector: Context overload events: 0.

Diego screenshots this. Then remembers the assignment says "submit the Inspector export." He taps 📋 Export Analysis. A `.uprising` file downloads. He uploads it to the LMS.

**Minute 3:00 — The Aftertaste**

On the bus, staring out the window, Diego thinks: "That was basically a priority queue assignment. I just... played it instead of coding it." He opens the game again. Plays Mission 4. No one asked him to.

**UI Annotations:**
- **Context config panel:** Eviction dropdown with 4 options, each with a 1-line tooltip. "Lowest priority: evicts the entry marked least important. Good for keeping critical signals alive."
- **Context overload visual:** Spark/jitter effect on unit tile, amber "CONTEXT OVERLOAD" floating text, 1-tick freeze.
- **Export button:** Downloads `.uprising` file to device. On mobile: triggers system share sheet (can AirDrop, email, or save to Files).

---

#### Journey: Dr. Tanaka, 38, AI/ML Lecturer at a Research University

**Context:** Teaching "CS 598: Agentic AI Engineering" — a new graduate seminar exploring the practical engineering of multi-agent LLM systems (crewAI, LangGraph, AutoGen). 12 students, all with ML backgrounds. He discovered Robot Uprising at a conference where someone demoed a competitive match. His reaction: "This is literally what I'm teaching, but as a game."

**Week 0 — Adopting Model F (Lab Sandbox)**

Dr. Tanaka doesn't want the campaign. He wants controlled experiments. He opens the Scenario Editor at `robotuprising.game/lab`. Over a weekend, he designs 6 custom scenarios, each isolating one concept from his course:

1. **"The Context Window Experiment" (Week 2):** 4x4 board, 1 scout, 3 enemies, buffer sizes of 4, 6, 8, 12 selectable. "Run the same scenario at each buffer size. Measure: overload frequency, detection accuracy, decision latency. Plot the Pareto frontier."

2. **"The Pub-Sub Topology Lab" (Week 4):** 8x8 board, 2 scouts + 2 relays + 1 striker. Hooks disabled except the ones students explicitly wire. "Design three topologies: star (all→relay→striker), mesh (all→all), and chain (scout→relay→relay→striker). Measure signal latency and EM emissions for each. Which topology would you choose for a production agent system and why?"

3. **"The Eviction Policy Shootout" (Week 6):** Same scenario, same agents, but students must run it with each of 4 eviction policies (FIFO, LIFO, priority, random). "Export Inspector analyses for all 4 runs. Create a comparison table. Which policy is optimal for this scenario? Is there a universally optimal policy?"

4. **"The Adversarial Information Flood" (Week 9):** 8x8 board, enemies configured to generate maximum noise (lots of movement, lots of channel chatter). Students must design agents that filter signal from noise. "This is the prompt injection problem for agents. How do you build a system that stays functional when the information environment is adversarial?"

5. **"The Meta-Agent Challenge" (Week 11):** 8x8 board, full unit roster. Students must design a command agent that adjusts subordinate agent configurations mid-battle using reassign, reroute, and prioritize skills. "This is dynamic tool selection. Your command agent is an orchestrator deciding which skills and routes to assign based on runtime context."

6. **"The Architecture Review" (Week 14, Final):** Open-ended 8x8 scenario with 8 enemies and full unit/skill access. "Design the best agent architecture you can. Submit your Inspector export with a 3-page architecture document explaining your design decisions, trade-offs, and failure modes. Defend your design as you would a production system architecture."

**Week 2, Tuesday — The Context Window Experiment**

Students load Dr. Tanaka's scenario from a URL. The 4x4 board appears — tiny, focused, one scout against three enemies. First they run buffer size 4. The scout overloads immediately — fills in 3 ticks, stunned on tick 4, eliminated tick 5. They run buffer size 6. Survives to tick 12 before overloading. Buffer size 8: survives 20 ticks, 1 overload. Buffer size 12: zero overloads, easy win.

"Now plot it," Dr. Tanaka says. Students open spreadsheets. The curve is obvious: larger buffer = fewer overloads, but with diminishing returns. Buffer size 8 vs. 12 is a small improvement for double the resource cost.

"This is exactly the context window sizing problem for LLM agents," Dr. Tanaka says. "Claude's context window is 200K tokens. GPT-4's is 128K. Is bigger always better? What are the costs?" A student connects: "Processing latency. The bigger the context, the slower the inference." "And in our game?" "EM emissions scale with buffer utilization. Bigger buffer = more signal processing = louder emissions = enemies can find you."

The students are learning LLM system design through Robot Uprising's vocabulary, and the mapping is direct, not metaphorical.

**Week 9 — The Adversarial Information Flood**

This is the session that changes the course. Students face enemies generating massive noise — fake signals, movement spam, channel flooding. Their carefully designed agents from previous weeks collapse. Context windows fill with garbage. Eviction policies evict useful data because the noise has deceptively high priority tags.

A student says: "This is prompt injection." The room goes quiet. Dr. Tanaka nods. "Your agents are consuming adversarial input into their context windows, and their decision rules are operating on corrupted state. How do you defend against this?"

Students design filter rules, compression chains, and validation hooks. One student builds a relay that strips unverified signals before forwarding. Another builds a scout with a `validate` pre-rule that checks signal sources against a known-ally list.

"You just reinvented guardrails," Dr. Tanaka says. "The same pattern — validate input, filter noise, compress context, prioritize authoritative sources — is how you harden a production agent against prompt injection."

**UI Annotations:**
- **Scenario Editor:** Grid-based board builder (click tiles to place terrain, units, enemies). Constraint panel on the right (available skills checkboxes, buffer size slider, hook slot count spinner, victory condition dropdowns).
- **Scenario URL:** Each scenario generates a shareable URL: `robotuprising.game/lab?s=BASE64ENCODED`. No accounts needed.
- **Lab vs. Campaign distinction:** Lab scenarios have a beaker icon in the top-left corner; campaign missions have a flag icon. The Lab label reminds students they're in an experimental context.

---

#### Journey: Mika, 14, High School Freshman in Manila

**Context:** Her CS teacher, Mr. Santos, uses Robot Uprising as a "Friday reward" — if the class completes their Python exercises by Thursday, Friday's lab session is Robot Uprising. Mr. Santos uses Model A (free class code, Missions 1-5) plus a printed vocabulary mapping sheet taped to the wall. No fancy dashboards. No exports. Just the game and a teacher who knows how to ask good questions.

**Friday 2:30 PM — Lab Session**

Thirty students open the demo on school Chromebooks. The browser takes 2.4 seconds to load — within the 3-second budget. The Ifugao rice terrace map appears. Mika has played Mission 1 three times already but keeps failing Mission 2. Her scout detects enemies but the information dies — no one acts on it.

Mr. Santos writes on the whiteboard: "HOOKS = Text Messages. Your scout sees something. How does it tell the striker?"

Mika looks at the hook slot on her scout's blueprint. It says: "Trigger: ON_DETECT. Channel: ___." She types "danger-channel" in the channel name field. A new channel appears in the channel map panel — "danger-channel" with one subscriber (the scout). Her striker's context config has a listen toggle. She checks "danger-channel."

EXECUTE. The board snaps to life. Tick 3: the scout detects an enemy. A green cell flash — signal delivered through danger-channel. The striker's context bar gains a new pip. Tick 5: the striker's rule matches — "IF context contains enemy_detection THEN engage." The striker moves toward the tagged position.

Tick 8: the striker engages. Red flash. Enemy eliminated.

Mika pumps her fist. "It WORKED!" Mr. Santos hears her and walks over. "Why did it work this time?" "Because the scout TOLD the striker. Before, the scout saw the enemy but nobody knew." Mr. Santos points to the vocabulary sheet on the wall: "Hooks = Text Messages. Channels = Group Chats. Your scout sent a text to the danger-channel group chat, and your striker was in that group chat."

Mika nods. She already understood it, but the words lock it in place.

**Friday 3:00 PM — Peer Teaching**

Mika's seatmate, Jun, is stuck on Mission 2. His scout has no hooks — the hook slot is empty. "Jun, you need to add a hook. Look—" she drags his attention to the hook slot. "Type a channel name. Any name. Then make your striker listen to that channel."

Jun types "help-me." Mika laughs. The channel name is "help-me." They both think this is hilarious. Jun's striker starts listening to "help-me." He executes. It works. "Your striker was on 'help-me' and your scout was yelling for help," Mika says.

Mr. Santos overhears and writes on the whiteboard: "Channel names are YOUR vocabulary. 'help-me', 'danger-channel', 'enemy-spotted' — the system doesn't care what you call it. YOU are the one who needs to understand what it means."

This is pub-sub topic naming as a 14-year-old's Friday afternoon activity, and it's working.

**UI Annotations:**
- **Channel name field:** Free-text input in the hook configuration panel. Autocomplete suggests existing channel names. No validation beyond max length.
- **Channel map panel:** Read-only auto-generated sidebar showing all channels, who publishes, who subscribes. Updates live as the player configures hooks.
- **Vocabulary sheet (physical):** Laminated A4 taped to the wall. Two columns: Game Term ↔ Real-World Equivalent. Font size large enough to read from any seat.

---

## Interaction Effects

### With Onboarding (5.xx)
- The boot log (5.02) serves dual duty: narrative immersion for general players AND curriculum-aligned vocabulary introduction for students. The subsystem initialization sequence literally introduces the four primitives that a CS course would teach.
- The "hands before head" principle (5.00) aligns perfectly with lab pedagogy — students PLAY first, then the teacher names what they experienced.
- Inspector exports (Model B) extend the Inspector's existing debrief depth into a portable learning artifact.

### With Competitive Infrastructure (6.11d)
- The Seasonal Syllabus (Model E) reuses competitive challenge infrastructure but scoped to a class cohort.
- Class leaderboards use the same histogram display as the Zachtronics-style public leaderboards, but filtered to class members.
- Danger: competitive framing in education can cause anxiety. The class leaderboard should be opt-in per teacher, not default.

### With the Campaign (5.xx, locked)
- The 10-mission arc is naturally pedagogical (Missions 1-4 teach primitives, Mission 5 introduces factory, Missions 6-7 add command agents). The campaign IS a curriculum.
- Model F (Lab Sandbox) works AGAINST the campaign by replacing the narrative arc with isolated experiments. This is appropriate for graduate seminars but inappropriate for K-12 where narrative engagement drives motivation.

### With the Web-Native Stack (locked)
- No installation = Chromebook compatible = public school viable. This is the single biggest structural advantage over every competitor. Zachtronics games require Steam. CodeCombat requires accounts. Screeps requires JavaScript knowledge. Robot Uprising runs in a browser with zero prerequisites.
- localStorage persistence is a weakness in shared computer labs. A "save code" (6-character alphanumeric) that encodes progress state could mitigate this without accounts.

### With the Vocabulary Mapping
- The game's 1:1 vocabulary with real agentic AI (skills, rules, hooks, context window, eviction, channels) is the educational killer feature. No translation layer needed. What students learn IS what professionals use.
- Danger: if the game's vocabulary drifts from industry terminology (e.g., "hooks" means something different in React), the mapping breaks. The vocabulary must stay stable.

---

## Sensory Description

**Model B — Export button interaction:** The 📋 icon glows soft cyan on hover. Clicking it triggers a brief "compiling" animation — the Inspector's data panels flash in sequence top-to-bottom (50ms per panel), as if being scanned into the export file. A download arrow slides down the icon. A mechanical "receipt printing" sound — short, crisp, like a thermal printer — accompanies the download. The `.uprising` file appears in the browser's download bar. On mobile: the system share sheet rises from the bottom with the file ready to send.

**Model C — Teacher dashboard histogram:** The class histogram renders as a horizontal bar chart, each bar a translucent cyan rectangle. The current student's bar is solid cyan. Bars cluster visually — the "40-50 tick" cluster is clearly separated from the "80+ tick" outliers. Hovering a bar shows the student's display name in a tooltip. The overall distribution has a gentle glow that brightens where bars cluster, like a city seen from above — dense areas are brighter. The sound: a quiet "data settling" ambient — like many small objects finding their places in a tray. One soft clink per bar as the histogram populates.

**Model F — Scenario Editor:** A clean grid on the left, white tiles with light grey grid lines. Clicking a tile opens a radial menu: terrain types (rice terrace green, jungle dark green, beach sand, city grey, volcanic red-orange). Placing a unit produces a satisfying magnetic snap — the icon locks to the grid center with a subtle "thock." Enemy placement is the same snap but with a red-tinted shadow. The constraint panel on the right has the feel of a lab equipment panel — toggle switches for skills (green LED = enabled, grey = disabled), a buffer size knob that rotates with a click-stop at each integer value (satisfying detent feel), hook slot counter with + and − buttons.

---

## Comparable Games Summary

| Game | Educational Model | What Works | What Doesn't |
|------|------------------|-----------|--------------|
| **Zachtronics (Zachademics)** | Free licenses + teacher scaffolding | Zero-cost, games are genuinely deep, teacher provides context | No dashboard, no progress tracking, no exports, games require installation |
| **CodeCombat** | Full classroom product (dashboard, LMS integration, auto-grading) | Complete ecosystem, teacher-friendly, Google Classroom sync | Teaches syntax not systems thinking, account-required, subscription model |
| **Screeps** | Informal (open-source server, no official edu tools) | Real JavaScript, persistent world, open-source server | Not accessible to beginners, no teacher tools, steep learning curve |
| **CodinGame** | Challenge-based platform with multi-agent modules | Browser-based, challenge variety, recruitment-validated | Not a game (no narrative, no campaign), challenges are isolated |
| **Minecraft: Education Edition** | Full product (classroom mode, lesson plans, teacher dashboard) | Massive adoption, familiar game, extensive lesson library | Requires installation, subscription, not CS-specific |
| **Robocode** | University CS courses (Java/robots) | Programming + competition, Java-compatible | Dated UI, limited to movement/shooting, no systems thinking |

**Robot Uprising's unique position:** It's the only game that teaches **systems thinking and agent architecture** (not programming syntax) using **industry-standard vocabulary** (not metaphors) in a **zero-install browser environment** (not Steam/app-store-gated).

---

## The TikTok Clip

**"My professor assigned a video game as homework."** Student screen-records Mission 3 on their phone. The sealed watch plays: scout's context bar fills, overloads, sparks, freezes, dies. Cut to: student changes one dropdown (eviction policy: "lowest priority"). Re-executes. Scout survives. Context bar cycles smoothly — old noise evicts, critical signals stay. Victory. Cut to: the student holding up the vocabulary mapping sheet. "This is a real AI engineering concept. I learned it in a game."

15 seconds. The comments section: "what game is this," "link?" The acquisition funnel activates.

---

## Recommendation

**Phase 1 (Launch):** Model A (free class codes, Missions 1-5) + Model D (Curriculum Kit). Zero engineering cost beyond a URL parameter and a downloadable PDF. This is the Zachademics playbook, proven effective.

**Phase 2 (Post-launch, if adoption signals are strong):** Model B (Inspector exports as `.uprising` files). Moderate engineering cost — serializing existing Inspector data. Enables assignment-based grading without building a dashboard.

**Phase 3 (If educational adoption becomes significant):** Model F (Lab Sandbox scenario editor). High engineering cost but creates a genuinely differentiated educational product. The scenario editor doubles as a community tool for creating custom challenges.

**Model C (Full dashboard) and Model E (Seasonal Syllabus) are deferred indefinitely.** Model C requires a backend (violating the locked stack), introduces FERPA/COPPA complexity, and competes with dedicated educational platforms. Model E is too rigid for diverse academic calendars. Both are only worth building if educational adoption reaches thousands of classrooms.
