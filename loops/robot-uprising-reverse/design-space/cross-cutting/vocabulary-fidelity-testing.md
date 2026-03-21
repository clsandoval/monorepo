# 8.08d — Vocabulary Fidelity Testing Across Player Archetypes

## The Mechanic

Robot Uprising's central claim — that its vocabulary maps 1:1 to real agentic AI engineering — can be validated through internal stress-testing (8.08), lived player experience (8.08b Codex parallels), and code export fidelity (8.08a Translate Your Architecture). But none of those test the claim that actually matters: **does playing Robot Uprising change what a person can do in the real world?**

This document designs the research methodology for answering that question. The study is an A/B test: Robot Uprising players versus a control group, both assessed on real agentic AI tasks. The study measures not just vocabulary recognition (can you define "pub/sub"?) but concept application (can you design a multi-agent system?) and architecture quality (is your design any good?). It segments results by player archetype — casual, competitive, creative — to identify which play styles produce the strongest transfer.

The stakes are not academic. If the study shows positive transfer, Robot Uprising can partner with CS education programs and make a defensible claim on marketing materials. If the study shows no transfer, or transfer only for competitive players, that is equally valuable — it identifies where the game's pedagogy fails and where it needs intervention.

### Study Design: The Protocol

**Population:** 180 participants, recruited in three cohorts of 60. Each cohort splits into 30 treatment (play Robot Uprising through Mission 10) and 30 control (play a comparable strategy game — Into the Breach — for the same number of hours). Participants must have no prior professional experience with agentic AI systems, multi-agent architectures, or LLM tool orchestration. Light programming experience is acceptable; production distributed systems experience is disqualifying.

**Treatment duration:** 6 weeks. Treatment group plays Robot Uprising at their own pace, with a minimum of 8 hours total play time and completion of at least Mission 7 (the point at which all five unit types, hooks, context windows, and rule conflicts have been introduced). Control group plays Into the Breach for 8 hours minimum — a strategy game with comparable complexity that teaches tactics but not distributed systems vocabulary.

**Pre-test:** Both groups complete a 45-minute baseline assessment before any play begins. The assessment measures:

1. **Vocabulary recognition** (20 items) — multiple-choice: "Which best describes a pub/sub topic?" with four plausible options. Covers all 33 Codex terms. Scored as percentage correct.
2. **Concept application** (5 scenarios) — short-answer: "A customer support bot needs to check three data sources and synthesize answers. Sketch the agent topology." Scored by two independent raters on a 1-5 rubric (communication clarity, architectural soundness, vocabulary precision).
3. **Architecture design** (1 task) — 30-minute open-ended design challenge: "Design a multi-agent system for monitoring social media sentiment across three platforms, summarizing findings, and escalating anomalies to a human operator." Scored on a 12-point rubric: topology correctness (3), communication design (3), context management (3), failure handling (3).

**Post-test:** Identical structure, different scenarios. Post-test administered within 48 hours of completing the play period. A third delayed post-test at 3 months measures retention.

**Archetype classification:** After completing play, treatment group participants are classified into archetypes based on telemetry:

- **Casual** — completed Missions 1-7, fewer than 12 total hours, minimal Inspector usage (fewer than 30 seconds per debrief on average), no Gauntlet play.
- **Competitive** — completed all 10 missions, significant Inspector usage (more than 90 seconds per debrief), entered Gauntlet at least once, viewed histogram comparisons.
- **Creative** — completed at least Mission 8, high configuration experimentation (more than 3 distinct topology changes per mission on average), explored non-optimal solutions, Blueprint Codex engagement above 70th percentile.

These archetypes are not self-reported. They emerge from behavioral telemetry. A player who says they are competitive but never opened the Inspector is classified as casual. The data decides.

### Metrics and Scoring

**Primary outcome:** Change in architecture design score (pre to post), comparing treatment vs. control. This is the study's headline number. A statistically significant improvement in the treatment group's architecture design quality — the open-ended, hardest-to-game measure — validates that Robot Uprising teaches transferable design thinking, not just vocabulary memorization.

**Secondary outcomes:**

- Vocabulary recognition gain by archetype
- Concept application gain by archetype
- Vocabulary precision in free-text responses (do participants spontaneously use terms like "context window," "pub/sub," "eviction policy" in their architecture descriptions?)
- Delayed retention at 3 months (does the knowledge stick?)
- Transfer specificity: do players perform better on agentic AI tasks specifically, or do they show general improvement on any systems design task? (A third assessment using non-AI distributed systems scenarios — microservice design, database replication — tests whether transfer is vocabulary-specific or concept-general.)

**Scoring protocol:** All free-text responses are scored by two independent raters (graduate students in CS education) who are blind to group assignment and archetype. Inter-rater reliability must exceed Cohen's kappa of 0.7. Disagreements resolved by a third rater.

### The Archetype Hypothesis

The study's most interesting prediction is differential transfer by archetype:

**Competitive players** are expected to show the strongest vocabulary recognition gains. They engage deeply with the Inspector, study histograms, and optimize configurations. They learn the terms because the terms are the tools of optimization. But their architecture design scores may plateau — competitive play optimizes within known constraints rather than exploring novel topologies.

**Creative players** are expected to show the strongest architecture design gains. They experiment with unusual topologies, build non-optimal configurations to see what happens, and engage with the Codex. Their designs in the post-test should show higher novelty and broader vocabulary usage. But their vocabulary recognition may be spottier — they learn concepts through exploration rather than systematic study, so they may understand "eviction policy" intuitively without being able to pick the correct multiple-choice definition.

**Casual players** are the critical test case. If casual players — those who played through the campaign without deeply engaging diagnostic tools — still show significant gains over the control group, then Robot Uprising's core loop (configure, watch, debrief, reconfigure) is sufficient for transfer without Inspector deep-dives. If casual players show no gain, then the game's transfer mechanism lives in the diagnostic layer, not the gameplay layer, and the onboarding pipeline needs redesign to push more players toward Inspector engagement.

### CS Education Partnership Model

The study requires institutional partnership. Target: a mid-tier university CS program with an existing "Introduction to Distributed Systems" or "Software Architecture" course. The partnership provides:

**From the university:** IRB approval and oversight, participant recruitment from intro CS courses (students who know programming but not distributed systems), two graduate RA raters, classroom time for pre/post assessments, academic credibility for publication.

**From Robot Uprising:** Free game licenses for all participants, telemetry pipeline delivering anonymized play data (archetype classification, session duration, Inspector engagement, Codex access patterns), the assessment instruments (developed collaboratively with the course instructor), and funding for RA stipends.

**Publication target:** ACM SIGCSE (Technical Symposium on Computer Science Education) or CHI (Conference on Human Factors in Computing Systems). The paper's contribution is methodological — a rigorous framework for testing game-to-real transfer in technical domains — not just the Robot Uprising-specific results.

**Long-term partnership model:** If results are positive, the course adopts Robot Uprising as a supplementary tool. Students play Missions 1-7 as homework before the distributed systems unit begins. The instructor uses the Codex Real-World Parallels (8.08b) as lecture slide prompts. Post-course surveys track whether students who played the game self-report higher confidence in systems design interviews. This longitudinal data becomes a second paper.

---

## Player Journeys

#### Journey: Priya, 22, Study Participant (Treatment Group, Creative Archetype)

**Context:** Priya is a third-year CS student at a state university. She has taken data structures and algorithms but has not yet taken the distributed systems elective. She signed up for the study because the recruiting email mentioned a free game and a $50 Amazon gift card for completion. She has no idea what "agentic AI" means. She plays games casually — Stardew Valley, Splatoon — but has never touched a Zachtronics title. She is assigned to the treatment group.

**Week 0 — The Pre-Test**

The testing room smells like whiteboard markers and old carpet. Thirty students sit at university-issued laptops, the screens' blue-white glow harsh under fluorescent ceiling panels. Priya reads the first vocabulary question: "Which best describes a pub/sub topic?" She stares at the four options. Publish/subscribe. Public subscription. Publication subject. None of these phrases mean anything to her. She picks C — "A named channel where messages are broadcast to all listeners" — because "broadcast" sounds vaguely right. She guesses on 17 of 20 vocabulary items. Her pre-test vocabulary score: 25% (chance level).

The architecture design task is worse. "Design a multi-agent system for monitoring social media sentiment." She writes three sentences about a Python script that checks Twitter every hour. No topology, no communication design, no context management. She draws a single box labeled "bot" with an arrow to "Twitter API." Her architecture score: 2 out of 12.

**Week 3 — The Topology Epiphany**

Priya is on Mission 6. She has been playing for nine hours across three weeks, mostly on her phone during bus rides. Tonight she is on her laptop, cross-legged on her dorm bed, the room lit only by the screen's glow and a string of warm fairy lights taped to the ceiling. Her roommate's white noise machine hums in the background.

She has just lost Mission 6 for the third time. Her Strikers keep engaging the wrong targets — they fire at damaged enemies instead of the fresh wave flanking from the east. She opens the Inspector for the first time with genuine curiosity rather than obligation. The timeline scrubs backward. She watches Tick 14: her Scout on the east flank detects the new wave, broadcasts on "recon-net," but the signal arrives at the Striker on Tick 17 — three hops through two Relays. By Tick 17, the Striker has already committed to the damaged target based on stale information from Tick 12.

The latency is visible. Three hops. Three ticks. Three colored dots marching across the timeline, each one a tick too late. She drags the scrubber back and forth, watching the signal crawl. The Inspector's timeline emits a soft tick-tick-tick as she scrubs — a clock counting the delay.

She creates a direct channel from the east Scout to the Striker. One hop. One tick. The signal arrives at Tick 15 instead of 17. She runs the mission. The Striker pivots to the new wave in time. Mission passed.

She does not know the word "latency." She has never heard of "fan-in aggregation" or "hub-and-spoke topology." But she has just redesigned a communication topology to reduce propagation delay, and she did it by reading a timeline, diagnosing a three-hop bottleneck, and creating a direct subscription channel. She did systems engineering. She just doesn't have the vocabulary for it yet.

**Week 6 — The Post-Test**

Same testing room. Same fluorescent lights. Same whiteboard-marker smell. Priya reads the architecture design task: "Design a multi-agent system for processing customer feedback from email, chat, and phone, routing urgent issues to a human operator."

She draws three boxes — one for each source. "These are like Scouts," she writes, then crosses it out and writes "monitoring agents." Each one connects to a central processing agent — "like a Relay" crossed out, replaced with "a summarizer that compresses the input." The summarizer connects to a routing agent that checks urgency. Urgent items route to the human operator; non-urgent items route to a response generator.

She labels the connections: "These are channels. The monitoring agents publish to 'raw-feedback.' The summarizer subscribes to 'raw-feedback' and publishes to 'triaged-feedback.' The router subscribes to 'triaged-feedback.'" She adds a note: "The summarizer needs to handle all three sources without its context getting overwhelmed — maybe limit how many messages it holds at once and drop the oldest ones when it's full."

She has just described a pub/sub topology with a fan-in aggregation layer, a context window size constraint, and a FIFO eviction policy. Her architecture score: 9 out of 12. She lost points on failure handling (no redundancy for the summarizer) and did not name specific technologies. But the topology is sound, the communication design is explicit, and the context management is thoughtful.

Her vocabulary recognition score rose from 25% to 68%. She still misses some formal terms — she picked "message bus" over "pub/sub topic" because "bus" felt more concrete — but she correctly identified context windows, eviction policies, polling loops, and lossy compression. She is classified as a Creative archetype: 4.2 distinct topology changes per mission on average, 78th percentile Codex engagement, no Gauntlet play.

#### Journey: Dr. Anand Mehta, 48, Associate Professor of Computer Science

**Context:** Dr. Mehta teaches CS 451: Distributed Systems at a mid-tier state university. Enrollment has dropped 15% over three years because students perceive the course as abstract and disconnected from their career goals (they want ML, not consensus algorithms). He saw the Robot Uprising study recruitment and volunteered his course as a partnership site, hoping a game-based supplementary tool might re-energize enrollment. He is not a study participant — he is a study collaborator.

**Month 1 — The Skepticism**

Dr. Mehta sits in his office — bookshelves overflowing with Tanenbaum and Kleppmann, a whiteboard covered in half-erased Paxos diagrams, a mug of cold chai on a stack of ungraded midterms. The game's promotional materials claim students will learn "pub/sub, context windows, eviction policies, and multi-agent orchestration through gameplay." He has heard similar claims from Minecraft Education Edition, CodeCombat, and three other "gamified learning" tools. None survived contact with his syllabus.

He installs Robot Uprising on his personal laptop. He plays through Mission 3 in one sitting. The rules editor — drag to reorder priority, conditions evaluated top-to-bottom, dead rules flagged in red — maps cleanly to the priority queue lecture he gives in Week 4. The hook channel naming — type a string, it exists, any unit can subscribe — is pub/sub without Kafka's configuration overhead. He opens the Inspector after Mission 3's debrief and scrubs the timeline. He watches a signal propagate through three relay hops, each hop adding one tick of latency. He has drawn this exact diagram on the whiteboard — boxes, arrows, "t+1, t+2, t+3" labels — every semester for twelve years.

The game drew it for him. And the student understood it without the whiteboard.

He opens the Blueprint Codex. The "Real-World Parallel" entries cite Shannon, mention Kafka by name, reference LRU cache eviction. The tone is respectful — not dumbed down, not hyperbolically gamer-branded. He reads the entry for context window overflow and nods: "When your unit stuns from buffer overflow, it's the same failure mode as an LLM that's consumed its entire context window." He would say it differently — "unbounded message queues under back-pressure" — but the concept is correct.

**Month 4 — The Integration**

Dr. Mehta assigns Missions 1-7 as pre-work before the distributed systems unit. Twenty-three students play the game. Fourteen complete Mission 7. He opens his Week 4 lecture with: "How many of you had a unit stun from context overload?" Eleven hands go up. "That's buffer overflow under back-pressure. Let's formalize what you already experienced." The lecture hall — tiered seating, slightly too cold from over-aggressive HVAC, the projector's fan whirring — shifts. Students are nodding before he finishes the sentence. They have felt the failure. Now they learn the name.

He uses the study's assessment instruments as a quiz. Students who completed Mission 7 score 40% higher on the architecture design question than students who did not play. The sample size is too small for publication, but large enough for his own conviction. He emails the Robot Uprising team: "I'm in. Let's design the full study."

#### Journey: Tomoko Hasegawa, 39, Engineering Hiring Manager at a Series B AI Startup

**Context:** Tomoko manages a team of eight engineers building an agentic AI platform for enterprise document processing. She interviews 5-10 candidates per month for junior and mid-level agent engineering roles. Her biggest hiring frustration: candidates who can write Python but cannot think architecturally about multi-agent systems. They cannot answer "How would you design a three-agent pipeline for document classification, extraction, and summarization?" without defaulting to "one big script." She heard about the Robot Uprising study from Dr. Mehta at a PyCon talk and requested access to the study's assessment instruments.

**The Interview Redesign**

Tomoko sits at her standing desk — dual monitors, a fidget cube she clicks during calls, a window overlooking the company's parking lot where someone has planted lavender bushes that fill the office with a faint herbal scent when the windows are cracked. She reads the study's architecture design rubric: topology correctness, communication design, context management, failure handling. She has been scoring candidates intuitively on these same dimensions without a framework.

She adapts the study's 30-minute architecture design task into a 20-minute interview exercise. "Design a multi-agent system for processing incoming customer support emails: classify urgency, extract key entities, draft a response, and escalate critical issues to a human." She scores candidates on the 12-point rubric.

**Month 2 — The Signal**

After two months, she has scored 14 candidates. Three mentioned Robot Uprising unprompted during the interview — they had played the game recreationally or encountered it through the university partnership. All three scored in the top quartile on architecture design. Two used the term "context window" correctly in a non-LLM context (describing information capacity of an agent's working memory). One drew a topology diagram on the whiteboard that looked, she later realized, exactly like a Mission 8 relay network.

The sample is too small to be conclusive, but the pattern is suggestive. She bookmarks the study's eventual publication for her hiring process documentation. If the published results show that Robot Uprising players outperform non-players on architecture design tasks, she will add "Robot Uprising experience" to her job descriptions as a "nice to have" — not as a gimmick, but as a genuine signal that the candidate has practiced architectural thinking in a low-stakes environment.

---

## Strengths of the Research Approach

**Ecological validity of the architecture task.** The open-ended design challenge mirrors real engineering work — there is no single correct answer, multiple topologies can score well, and the rubric rewards thinking process as much as final output. This avoids the trap of vocabulary tests that measure memorization without understanding.

**Behavioral archetype classification.** Using telemetry data rather than self-report for archetype classification eliminates social desirability bias. A player who claims to be competitive but skipped the Inspector is classified by what they did, not what they say. This produces actionable design recommendations: if casual players don't transfer, the game needs to make Inspector engagement more accessible, not optional.

**Active control group.** Using Into the Breach rather than "no game" as the control condition isolates the effect of Robot Uprising's specific vocabulary mapping from the general cognitive benefits of playing any strategy game. If the treatment group outperforms Into the Breach players, the advantage is attributable to the distributed systems content, not to "playing games makes you smarter."

**Delayed retention test.** The 3-month follow-up separates durable learning from short-term priming. Many game-based learning studies show strong immediate post-test gains that evaporate within weeks. If Robot Uprising's transfer persists at 3 months, the learning is structural — the concepts are integrated into the participant's mental model, not temporarily activated.

## Weaknesses of the Research Approach

**Self-selection bias in recruitment.** Participants who volunteer for a "study involving a strategy game" are likely more game-friendly and possibly more technically curious than the general CS student population. The results may not generalize to students who dislike games or prefer passive learning.

**Dosage confound.** Treatment group participants play Robot Uprising for 8+ hours; control group plays Into the Breach for 8+ hours. But Robot Uprising has 10 missions with explicit vocabulary introduction, while Into the Breach has no distributed systems content. The treatment group receives both gameplay AND content exposure. Disentangling "did the game teach them?" from "did 8 hours of exposure to distributed systems terminology teach them?" requires a second control condition — perhaps reading the Codex entries without playing the game — which triples the study cost.

**Archetype classification timing.** Archetypes are classified after play, not before. This means we cannot randomly assign participants to archetypes — we can only observe which archetype they naturally became. Differential transfer by archetype could reflect pre-existing personality traits (curious people explore more AND design better architectures) rather than play-style-caused learning differences. A pre-test personality inventory (Big Five, Need for Cognition scale) could partially control for this, but cannot fully eliminate the confound.

**Rubric subjectivity.** Despite inter-rater reliability checks, the architecture design rubric involves judgment calls. "Topology correctness" for an open-ended design task requires raters to agree on what constitutes a correct topology when multiple answers are valid. Extensive rater training and calibration sessions mitigate this, but do not eliminate it.

**Platform effects.** Robot Uprising's transfer may depend on platform-specific features (Inspector timeline, Blueprint Codex, histogram comparisons) that are not present in other games. Positive results would validate Robot Uprising specifically, not "games that teach distributed systems" generally. The study cannot separate the game's content from its specific pedagogical instruments.

---

## Interaction Effects

### With 8.08b — Codex Real-World Parallels

The Codex entries are the game's explicit transfer mechanism — the moment where the game says "what you just learned has a real name." The study can test whether Codex engagement correlates with transfer strength. If Creative archetype players (high Codex engagement) show stronger transfer than Competitive players (low Codex engagement, high Inspector engagement), the Codex may be the critical pedagogical bridge. If Competitive players transfer better despite low Codex usage, then the Inspector's diagnostic tools may be doing the teaching, and the Codex is confirmatory rather than primary.

Telemetry data can track which specific Codex entries each participant viewed, how long they spent on each entry, and whether they viewed the Real-World Parallel tab (8.08b) or only the game-mechanics front. This granularity allows post-hoc analysis: "Participants who viewed 10+ Real-World Parallel entries scored X points higher on vocabulary recognition than participants who viewed 0-3."

### With 8.08a — Translate Your Architecture

Participants who reach Mission 10 and use the Translate Your Architecture bridge see their game configuration rendered as Python code. This is the most direct transfer experience the game offers — the player's in-game work becomes runnable code. The study can compare post-test architecture design scores between participants who used the bridge and those who completed Mission 10 without using it.

The prediction: bridge users show a vocabulary precision boost (they use more exact professional terms in free-text responses) but not necessarily an architecture quality boost (the bridge shows how to translate, not how to design). The bridge validates vocabulary; the gameplay teaches architecture.

### With Community

Community engagement introduces an uncontrolled variable. Participants who share configurations on Discord, read strategy guides, or watch streams receive supplementary instruction outside the game. The study protocol should ask participants to log external Robot Uprising resources consumed during the study period. High community engagement could inflate treatment group scores through social learning rather than game-based learning. Conversely, community discussion may be an essential part of the game's transfer mechanism — the vocabulary becomes real when you use it to talk to other people.

---

## Comparable Research

**Kerbal Space Program and orbital mechanics.** Researchers at the University of Colorado tested whether KSP players demonstrated better intuitive understanding of orbital mechanics than non-players. Results: KSP players could predict orbital trajectory changes more accurately and used correct terminology (periapsis, delta-v) spontaneously. But the study struggled to separate "KSP taught them" from "people interested in orbital mechanics gravitate toward KSP." The self-selection problem is identical to Robot Uprising's recruitment challenge. KSP's study used a physics concept inventory (validated instrument) as the assessment — Robot Uprising needs an equivalent "distributed systems concept inventory," which does not yet exist and would need to be developed as part of the partnership.

**Minecraft Education Edition.** Microsoft commissioned multiple studies on Minecraft's educational efficacy. Results were mixed: students showed improved spatial reasoning and collaboration skills, but subject-specific learning (chemistry, history) depended heavily on instructor scaffolding. Minecraft's sandbox nature means learning is emergent and unstructured; students who built elaborate castles learned architecture aesthetics, not chemistry. Robot Uprising has a tighter pedagogical loop — the campaign introduces concepts in sequence, the debrief reinforces them, the Inspector makes them visible — but the Minecraft research warns that player-driven exploration can diverge from intended learning outcomes. The archetype segmentation directly addresses this: casual players who explore freely may diverge from the intended learning path.

**Chess and cognitive transfer.** Decades of research on whether chess improves general intelligence produced a definitive meta-analysis (Sala & Gobet, 2016): chess improves chess performance but shows minimal transfer to mathematics, reading, or general cognitive ability. The transfer is domain-specific. This is both a warning and a comfort for Robot Uprising. Warning: "playing a game that involves systems thinking" may not transfer to "doing real systems thinking." Comfort: Robot Uprising's vocabulary is not a metaphor — it is the literal professional vocabulary. Chess pieces do not map to real military units; Robot Uprising's hooks map to real pub/sub channels. The transfer mechanism is not analogical reasoning (chess tactics are like math tactics); it is direct vocabulary and concept reuse (hooks ARE pub/sub channels). The chess research suggests that Robot Uprising should measure domain-specific transfer (agentic AI tasks) rather than general cognitive transfer, which the current study design correctly does.

**Screeps and programming education.** Screeps, a JavaScript-based MMO where players program AI for game units, has been used in several university programming courses. Anecdotal reports suggest students who played Screeps wrote better asynchronous code, but no controlled study has been published. The absence of rigorous Screeps research is itself a data point: game developers rarely invest in controlled studies because the results might be negative. Robot Uprising's willingness to fund and publish a controlled study — regardless of outcome — is itself a differentiator.

---

## Sensory Descriptions

**The pre-test room.** Fluorescent tubes buzz at 60Hz, a frequency just below conscious perception but present enough to make the air feel pressurized. Thirty university-issued Dell laptops open in three rows, their screens casting overlapping pools of blue-white light on the laminate desks. The assessment loads in a plain web form — black text on white, no game aesthetics, no branding. The room smells like dry-erase markers and the vaguely metallic scent of recycled air from ceiling vents. Participants shift in plastic chairs that squeak against linoleum. The proctor reads instructions from a printed sheet. A clock on the wall ticks audibly between questions. This is not a game. This is a test, and it feels like one.

**The play period.** Six weeks of varied sensory environments. Priya plays on her phone during a bus ride — the game's dark navy UI visible between thumbs, the bus's diesel rumble vibrating through her seat, her earbuds playing the game's ambient corruption static mixed with the muffled conversation of other passengers. Dr. Mehta plays on his office laptop during lunch — the cursor clicks of the Blueprint Codex mixing with the clink of a fork against a Pyrex container of leftover dal. A participant named Marcus plays at 1 AM in his apartment, the only light the monitor's glow, the Inspector timeline scrubbing sound (tick-tick-tick) the only noise in the room, his cat asleep on the desk beside the keyboard.

**The post-test room.** Same fluorescent lights. Same plastic chairs. Same web form. But the participants in the treatment group approach the architecture design task differently. Where the pre-test produced hesitant single-box diagrams drawn in Microsoft Paint, the post-test produces multi-box topologies with labeled connections. Pens scratch on paper (some participants sketch before typing). The sound of confident typing — faster, more rhythmic than the pre-test's halting hunt-and-peck through unfamiliar terms. One participant mutters "context window" under her breath while sizing the central processing agent. The proctor notices but does not record it. The clock ticks. The assessment ends. The data goes to the raters.

**The scoring room.** Two graduate RAs sit in a shared office — mismatched desks, a dying succulent on the windowsill, a whiteboard covered in rubric calibration notes. They score independently on separate laptops, noise-canceling headphones isolating each into their own assessment bubble. One RA highlights a participant's description: "The summarizer subscribes to raw-feedback and publishes to triaged-feedback." She checks the rubric: communication design, explicit channel naming, correct pub/sub semantics. She scores it a 3 out of 3. The other RA, scoring the same response on his own screen, pauses at the same sentence. He also scores it 3. Cohen's kappa for this item: 1.0. They do not know they agree until the reconciliation meeting next week.
