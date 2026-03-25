# 1.14e — Friday Facts as Community-Building Pattern

**Aspect ID:** 1.14e
**Wave:** 1 (Competitive Analysis) / 7 (Multiplayer & Community)
**Category:** Competitive Analysis / Community Building
**Related aspects:** 1.14 (Factorio core analysis), 5.16c (terminal community sharing), 5.00d (field manual community artifact), 5.09b (impossible challenge community layer), 7.10 (config necropsy community artifact), 7.03e (cross-platform sharing infrastructure), 8.08a (translate your architecture), 8.08b (Blueprint Codex real-world parallels)

---

## The Precedent: Factorio's Friday Facts

Wube Software published 427 Friday Facts posts across eight years of early access, then continued into post-release and the Space Age expansion (now past FFF #430). Each post was 800-2000 words with screenshots, GIFs, performance graphs, and internal debate. The format was consistent: one or two topics from the current week's work, written by whatever developer actually did the work, published every Friday without exception. No marketing polish. No embargo timing. No community manager rewriting an engineer's prose. The developer who optimized belt rendering wrote about optimizing belt rendering, using the vocabulary of someone who just spent 40 hours staring at assembly output.

The result: Factorio sold 3.5 million copies before 1.0 launch. The subreddit grew to 500K+ members. The Steam review score sits at 97% positive -- one of the highest in the platform's history. And the Space Age expansion sold 400,000 copies in its first week, eight years after the game entered early access, driven substantially by a community that had been reading weekly dispatches for nearly a decade.

The lesson is not "write a blog and you'll sell millions." The lesson is that sustained, technically honest, cadence-driven transparency creates a specific kind of trust -- the trust that comes from watching someone solve hard problems in public. Factorio's community does not merely like the game. They trust the developers. They trust them because they watched them fail, debug, reconsider, and ship, 427 times, in writing.

---

## The Option: Robot Uprising's "Tick Report"

Robot Uprising's equivalent is the **Tick Report** -- a weekly development dispatch published under the game's diegetic framing. Not "dev blog." Not "dev diary." A Tick Report, because the game runs on ticks, and each report covers one tick of the game's development clock.

### Format

Each Tick Report is 800-1500 words (shorter than FFF -- solo dev constraint), published as a web page on `robotuprising.game/ticks/NNN` with cross-posted excerpts to the game's Discord, Reddit, and a mailing list. The format follows a three-section template:

**1. Signal Log** (300-500 words) -- What happened this week. Concrete work: "Implemented relay context eviction with LRU policy. Here's the before/after of a relay's buffer across 30 ticks." Screenshots, GIFs of in-game behavior, code snippets where the code IS the interesting part. This section mirrors FFF's core format -- show the work, explain the decision.

**2. Architecture Note** (200-400 words) -- A conceptual riff connecting this week's game development decision to a real agentic AI engineering concept. "The eviction policy I implemented for Relay units this week is the same LRU cache eviction used in every production system with bounded memory. Here's why I chose LRU over FIFO for the default, and how players will be able to configure this." This section does not exist in FFF. It is uniquely possible because Robot Uprising's game mechanics map 1:1 to real engineering concepts. Every week's development work is simultaneously a game design decision AND an AI systems design decision. The Architecture Note makes this dual nature explicit.

**3. Intercepted Transmission** (100-300 words) -- A short piece of in-fiction writing from the Predecessor characters (Captain Reyes, Unit 0). A fragment of lore, a mission briefing excerpt, a piece of the Philippine archipelago's cyberpunk world. Styled in the game's CRT terminal aesthetic -- amber monospace, scan-line texture. This section builds narrative anticipation and gives the blog a personality that pure technical writing lacks. Factorio never did this; Factorio's personality came from the developers' own voices. Robot Uprising's solo developer needs a fictional voice as a second register to prevent the blog from reading as one person talking to themselves for years.

### Cadence

Weekly, every Tuesday. Not Friday -- the Factorio association is too strong, and "Tick Tuesday" has alliterative pull for social media. Missing a week is explicitly allowed -- a skipped week gets a one-line placeholder: `TICK 47: [SIGNAL LOST] -- back next week.` The placeholder maintains cadence perception even when content is absent. Factorio never missed a week for years, but Factorio had a team of 20+. Solo developers need escape valves that do not feel like failure.

### Voice and Tone

First person, technically precise, emotionally honest. Not corporate ("we're excited to announce"). Not self-deprecating ("lol this code is trash"). The register is a competent person explaining their work to another competent person who happens to be interested. Factorio's kovarex wrote like an engineer explaining to engineers. Robot Uprising's Tick Reports are written like an AI engineer explaining to people who are becoming AI engineers by playing the game. The reader may not know what "context window eviction" means when they start reading -- but the post treats them as someone who will understand it by the end of the paragraph, because the game will teach them.

This is the critical differentiator from every other dev blog in the competitive set. Factorio's FFF taught you about belt optimization and inserter throughput -- interesting engineering, but domain-specific to Factorio. Robot Uprising's Tick Reports teach you about context windows, pub/sub architectures, attention allocation, and agent coordination -- concepts that exist outside the game, in production AI systems, in real engineering jobs. The dev blog is not just transparency about the game's development. It is an incidental education in agentic AI engineering, delivered weekly, for free, to anyone who subscribes.

### Platform

Primary: `robotuprising.game/ticks/` -- a static page in the game's CRT aesthetic (charcoal background, monospace body text, amber headings, scan-line shimmer on hover). Each post has a permanent URL. The Intercepted Transmission section renders in a distinct visual block -- darker background, amber text, subtle phosphor glow -- visually separated from the technical content above it.

Secondary: Discord `#tick-reports` channel (full text), Reddit `r/RobotUprising` (excerpt + link), email newsletter (full text + reply-enabled for direct feedback), Mastodon/Bluesky (excerpt + link, threaded for the Architecture Note section).

No YouTube. No podcast. Text is the medium because the game is about reading, parsing, and processing information. A dev blog about an attention-architecture game should respect the reader's attention by being text-first.

---

## Player Journeys

#### Journey: Mara, 28, UX Designer (The Lurker Who Becomes a Buyer)

**Tuesday 8:15 AM -- The Algorithm Delivers.** Mara is scrolling Mastodon over morning coffee. A boosted post from someone she follows -- a game developer she respects -- contains a link to Tick Report #31 with the comment: "This is the best explanation of LRU cache eviction I've ever read and it's a game dev blog???" She clicks. The page loads in dark charcoal with amber headings. It does not look like a dev blog. It looks like a terminal. She reads.

**Tuesday 8:22 AM -- The Architecture Note Hooks.** The Signal Log was fine -- some game she hasn't heard of, a relay unit's buffer visualization, a before/after GIF. She was about to close the tab. Then the Architecture Note begins: "The eviction policy I built this week is the same one your browser uses to decide which cached images to discard when memory gets tight. LRU -- Least Recently Used -- is the default because recency is usually the best proxy for relevance. But it's not always right..." She reads the entire section. She didn't know this about her browser. She bookmarks the page.

**Tuesday 8:28 AM -- The Intercepted Transmission Confuses Her.** Amber monospace text about a "Captain Reyes" and a mission on Mindanao. She skims it. Interesting aesthetic, but she doesn't have context. She closes the tab.

**Two Weeks Later, Tuesday 8:20 AM -- She Checks Directly.** She typed `robotuprising.game/ticks` into her browser. She didn't subscribe. She just remembered the URL. Tick Report #33 is about hook channel design -- "how units subscribe to information they need, and why broadcast-everything is the wrong default." The Architecture Note connects this to Slack channel design: "Every Slack workspace discovers the same thing Robot Uprising's players discover -- if every channel broadcasts to everyone, nobody reads anything. Attention is finite. Subscription is curation."

**Six Weeks Later -- She Buys the Game.** Not because of a trailer. Not because of a Steam sale. Because she read twelve Tick Reports and realized the game would teach her things she wanted to know in a format she already enjoyed. The dev blog was the demo.

**UI Annotations:**
- Mastodon post: plain text excerpt with `robotuprising.game/ticks/31` link, no embed card (text-first ethos)
- Tick Report page: charcoal background, amber monospace headings, body text in clean sans-serif (the CRT aesthetic frames the technical content without making it harder to read)
- Intercepted Transmission block: inset darker panel, amber text, faint scan-line CSS animation
- Archive page (`/ticks/`): reverse-chronological list, each entry showing Tick number, title, date, and first sentence of Signal Log

#### Journey: Dex, 34, Indie Game Developer and Modder (The Modder Who Gets Inspired)

**Saturday 2:00 PM -- Discord Deep Dive.** Dex bought Robot Uprising three weeks ago, cleared the campaign, and is now browsing the `#config-necropsies` Discord channel. Someone posts a link to Tick Report #22 in a thread about custom rule evaluation: "Carlos actually explains the rule priority engine internals here." Dex clicks.

**Saturday 2:08 PM -- The Signal Log Reveals Internals.** Tick Report #22's Signal Log contains a state machine diagram showing how rules evaluate: priority queue pop, condition check against current buffer state, action dispatch, buffer mutation, next rule evaluation. It is not documentation -- it is the developer explaining a decision he made that week about whether condition checks should be pure (read buffer without modifying it) or impure (condition check itself can evict a slot to make room for its own evaluation result). He chose pure checks. He explains why. Dex disagrees with the decision and starts composing a Discord reply.

**Saturday 2:15 PM -- Architecture Note Reframes.** The Architecture Note connects rule purity to a real debate in agent system design: should an agent's observation step be allowed to modify the world it's observing? The Heisenberg analogy is made and immediately retracted -- "That's a bad analogy because quantum observation genuinely changes the observed system; agent observation CAN be non-destructive if you design it that way. I designed it that way because..." Dex stops composing his disagreement. The Architecture Note anticipated his objection and addressed it.

**Saturday 2:30 PM -- Dex Opens the Modding Docs.** The Tick Report mentioned that rule evaluation order is configurable in the game's JSON config format. Dex realizes he can build a mod that allows impure condition checks -- rules that modify the buffer as a side effect of evaluating. He starts prototyping. Two weeks later, his "Side Effect Rules" mod is posted to the workshop with a credit: "Inspired by Tick Report #22's pure-vs-impure debate."

**Three Months Later -- Dex's Mod Is Featured.** Tick Report #47 mentions the Side Effect Rules mod in the Signal Log: "A community mod by @dex-builds explores impure rule evaluation -- the exact design I rejected in Tick #22. Players are reporting fascinating emergent behavior: rules that consume intelligence as a cost of evaluation, creating genuine resource-management tension in the rule priority queue. I was wrong to dismiss impure checks so quickly." Dex screenshots this paragraph and pins it in his Discord profile. The developer who made the game acknowledged his mod in the game's own dev blog. This is the trust loop completing.

**UI Annotations:**
- Tick Report #22: state machine diagram rendered as a monospace ASCII box-and-arrow diagram inside a code block, not an image (text-first, copy-pasteable, accessible)
- Discord link preview: OpenGraph card showing Tick number, title, and first sentence of Signal Log
- Modding docs cross-reference: Tick Reports that mention moddable systems include a sidebar link to the relevant modding documentation page

#### Journey: Priya, 31, ML Engineer at a Fintech Startup (The AI Engineer Who Discovers the Game)

**Wednesday 11:40 AM -- Hacker News Front Page.** A Tick Report hits the front page of Hacker News. The title is "Tick Report #38: Why My Game's Context Window Eviction Policy Matters More Than the Combat System." The HN submission title is the post's actual title -- no editorializing. It has 247 points and 83 comments. Priya clicks because she works on context window management for her company's agent pipeline and the phrase "context window eviction policy" in a game dev blog is incongruous enough to be interesting.

**Wednesday 11:45 AM -- Professional Recognition.** The Signal Log describes implementing configurable eviction: LRU, FIFO, priority-weighted, and a hybrid mode where the first two slots are pinned (never evicted) and the remaining slots use LRU. Priya's internal reaction: "This is exactly what we do. We pin system instructions in the first 2K tokens and LRU-evict the conversation history." The game mechanic is not a metaphor for what she does. It IS what she does, with different nouns.

**Wednesday 11:52 AM -- The Architecture Note Teaches Her Something.** The Architecture Note discusses priority-weighted eviction -- evicting the lowest-priority item regardless of recency. "In production agent systems, priority-weighted eviction is underexplored because most frameworks don't expose eviction policy as a configurable parameter. LangChain's ConversationBufferWindowMemory uses a fixed sliding window. AutoGen's memory uses recency. But priority-weighted eviction lets you say: 'this old message is more important than this recent message because it contains a threat assessment, and threat assessments should persist until resolved.' In Robot Uprising, players discover this when their relays evict a critical threat report because a newer, less important patrol ping arrived. The fix is priority-weighted eviction. The same fix applies to production agent memory management." Priya bookmarks this paragraph. She will reference it in an internal design doc next week.

**Wednesday 12:05 PM -- She Reads the HN Comments.** Half the comments are from game developers discussing eviction UI design. Half are from AI engineers discussing production memory management patterns. The two groups are talking to each other. An AI engineer asks: "Does the game actually let you configure eviction at this level of granularity?" A player responds: "Yes, per-unit. My relay uses priority-weighted and my scouts use FIFO. Here's my config." The HN thread is a convergence zone for two communities that normally never interact.

**Thursday -- She Buys the Game.** Her purchase motivation is research. She wants to see if playing with context window eviction in a game environment gives her intuitions she can bring back to her production agent system. It does. Three weeks later, she redesigns her company's agent memory architecture. In the design doc, she includes a screenshot from Robot Uprising's Inspector showing a relay's buffer eviction trace. Her tech lead asks what the screenshot is from. She says: "A game that taught me more about context window management than any paper I've read."

**UI Annotations:**
- Hacker News title: plain text, no emoji, no brackets -- just the Tick Report's own title
- HN comment thread: game players and AI engineers co-mingling, identifiable by vocabulary (players say "buffer slots," engineers say "token budget" -- the Tick Report bridges both)
- Inspector screenshot in design doc: the game's dark UI with amber signal lines and context bar visualization, visually distinctive enough to provoke "what is that?" in a corporate slide deck

---

## Strengths

**1. The Architecture Note is a moat nobody else has.** No other game dev blog can incidentally teach professional AI engineering concepts because no other game's mechanics are 1:1 mappings to real engineering systems. Factorio's FFF could teach you about belt optimization, but that knowledge was Factorio-specific. Robot Uprising's Tick Reports teach context window management, pub/sub architecture, attention allocation, and agent coordination -- knowledge that transfers directly to production work. This makes each Tick Report valuable to people who will never play the game, dramatically expanding the potential readership beyond the game's player base.

**2. Cadence builds habit, habit builds trust.** The FFF pattern works because weekly cadence becomes a reader's ritual. Every Tuesday, the Tick Report exists. The reader does not check whether it exists -- they assume it does. This assumption is the foundation of trust. The reader begins to feel ownership over the game's development trajectory because they have witnessed it, week by week, from early prototype to shipped product.

**3. The Intercepted Transmission builds narrative investment without requiring it.** Readers who skip the fiction lose nothing technical. Readers who follow it accumulate a serial narrative about Captain Reyes and Unit 0's operations in the Philippine archipelago -- context that enriches the campaign when they eventually play it. The fiction section also gives the blog a personality that pure engineering writing lacks. Solo dev blogs risk feeling monotonous because there is only one voice. The Predecessor characters are a second voice.

**4. Transparency as a pre-release acquisition funnel.** Every Tick Report is a free demo of the developer's thinking. Potential buyers are not evaluating screenshots and trailers -- they are evaluating the mind behind the game. This is asymmetrically powerful for a game about AI engineering, where the developer's technical credibility directly correlates with the game's educational credibility. A reader who trusts the developer's Architecture Notes will trust the game's Codex entries.

---

## Weaknesses

**1. Solo dev cadence fragility.** Wube had 20+ people. One person being sick, burned out, or deep in a debugging hole means a missed week. The `[SIGNAL LOST]` placeholder mitigates perception damage, but three consecutive placeholder weeks will erode trust faster than zero blog posts would. The cadence is both the moat and the vulnerability. A possible mitigation: bank 2-3 evergreen Architecture Notes (concept explanations that are not time-sensitive) and publish them during low-output weeks. The Signal Log can be skipped; the Architecture Note is the hook.

**2. Scope creep from community feedback.** FFF's comment sections routinely generated feature requests that the Factorio team had to actively resist. A solo developer reading Discord replies to Tick Reports will feel every suggestion as a personal obligation. The Architecture Note format exacerbates this -- when you explain WHY you made a decision, technically sophisticated readers will argue with you. Dex's journey (above) shows the positive case. The negative case: 47 Discord replies explaining why your eviction policy is wrong, each consuming 10 minutes of emotional energy to process. Mitigation: the Tick Report is a broadcast, not a conversation. Comments happen on Discord. The developer participates in Discord threads when they choose to, not as an obligation of publishing.

**3. The dual-audience problem.** The Architecture Note targets AI engineers. The Signal Log targets gamers. The Intercepted Transmission targets fiction readers. A post that serves all three audiences equally serves none perfectly. FFF avoided this because its audience was homogeneous: Factorio players who liked engineering. Robot Uprising's Tick Report tries to be a game dev blog AND an AI engineering blog AND a serialized fiction dispatch. The risk is that each section feels like an interruption to the reader who came for a different section. Mitigation: clear visual separation (distinct background colors for each section), a table of contents at the top of each post with anchor links, and the understanding that most readers will read one or two sections per post and skip the third.

**4. Premature transparency can constrain design.** When you explain a system's design in Tick Report #15, you create an implicit commitment. Changing that system in Tick Report #40 requires not just a code rewrite but a public retraction. Factorio handled this by being upfront about changes ("we're removing this feature, here's why"), and the community trusted them because of accumulated goodwill. A solo developer with less accumulated trust will feel more pressure to maintain consistency with past Tick Reports, potentially freezing design decisions too early. Mitigation: every Tick Report includes an explicit caveat in the footer -- `All systems described are in development and subject to change. Previous Tick Reports describe the game AS IT WAS, not as it will ship.`

---

## Interaction Effects

### With the Educational Mission (Codex + Real-World Parallels)

The Tick Report's Architecture Note and the Blueprint Codex's Real-World Parallel tab (8.08b) serve the same pedagogical function through different channels. The Codex teaches you inside the game, after you've mastered the mechanic. The Tick Report teaches you outside the game, before you've played it. Together they create a learning pincer: pre-game conceptual exposure (Tick Reports) and post-mastery conceptual validation (Codex). A reader who encountered "LRU eviction" in Tick Report #31 will recognize it when they configure their first relay's eviction policy. The Codex entry will feel like confirmation of something they already half-knew. This is the spacing effect in educational psychology -- encountering a concept in two different contexts, separated by time, dramatically improves retention.

### With Config-Sharing Culture

Tick Reports that discuss configuration decisions ("I chose LRU over FIFO for relays because...") provide canonical examples for the config-sharing community. When players post configs in `#config-necropsies`, they reference Tick Report reasoning: "I went with priority-weighted eviction on my relays because of what Carlos explained in Tick #31 about recency not always being the best proxy." The Tick Report becomes a shared reference text -- the engineering equivalent of citing a paper. This elevates the config-sharing discourse from "here's what I did" to "here's what I did and here's the theoretical basis for it."

### With Modding Potential

Tick Reports that reveal internal system architecture are implicit modding documentation. When the developer explains how rule evaluation works (Tick #22), modders learn the system's structure, constraints, and extension points. FFF did this organically -- Factorio's modding community grew partly because FFF posts revealed how systems worked internally. Robot Uprising's Tick Reports can do this deliberately: each post that describes an internal system includes a sidebar note about whether that system is moddable and where the relevant configuration file lives.

### With the "Translate Your Architecture" Bridge (8.08a)

The post-game bridge translates a player's Mission 10 configuration into a runnable Python agent system. Tick Reports that discuss the 1:1 mapping between game concepts and engineering concepts (the Architecture Note section) are pre-selling this bridge. A reader who has absorbed 20 Architecture Notes will arrive at the translation screen with full confidence that the bridge is legitimate -- not a gimmick, but a genuine demonstration that the game taught real engineering. The Tick Report builds the credibility that makes the bridge's emotional payload land.

---

## Comparable Games

**Factorio FFF (Wube Software):** The direct precedent. 427+ posts, weekly cadence, engineer-written, technically dense. Strength: consistency and team depth. Weakness: no educational mission beyond the game itself -- belt optimization knowledge is Factorio-specific. Robot Uprising's Architecture Note section is the innovation that FFF lacks.

**Dwarf Fortress Dev Logs (Bay 12 Games):** Tarn Adams's dev logs are legendary for their stream-of-consciousness depth and absurd timescale (20+ years of development updates). Strength: the developer's personality IS the content -- Tarn's fascination with simulation detail is infectious. Weakness: the logs are impenetrable to non-players. Robot Uprising's Tick Report must be accessible to people who have never launched the game (the Priya journey), which Dwarf Fortress dev logs are not.

**Caves of Qud Weekly Updates (Freehold Games):** Shorter than FFF, more focused on content additions and balance changes. Strength: strong community response because the game's emergent storytelling creates natural discussion points. Weakness: minimal technical depth -- the updates describe WHAT changed, not WHY. Robot Uprising's Signal Log + Architecture Note structure captures both.

**Stardew Valley's ConcernedApe Posts (Eric Barone):** The solo dev precedent. ConcernedApe's blog posts were infrequent but high-impact -- each one announced major content updates after months of silence. Strength: every post was an event. Weakness: no cadence, no habit, no trust-building through regularity. Robot Uprising must not follow this model. The weekly cadence is non-negotiable for the trust-building function to work.

**Hades / Supergiant Dev Commentary (Supergiant Games):** Supergiant's approach is retrospective -- developer commentary in-game, noclip documentary access, GDC talks after ship. Strength: the commentary is polished and insightful. Weakness: it is post-hoc, not real-time. You learn what they thought after the decisions were made and the risk was resolved. Robot Uprising's Tick Reports are written in the present tense of development, with outcomes unknown. The vulnerability is different. "I chose LRU and I think it's right" hits differently from "We chose LRU and it worked out."

---

## Sensory Description: What the Tick Report Feels Like to Read

You open `robotuprising.game/ticks/31` and the page loads in 400ms. Charcoal background, not black -- `#1a1d1a`, the same dark as the game's workbench. The header is amber monospace: `TICK REPORT #31 // 2027-03-11 // CONTEXT WINDOW EVICTION`. Below it, a thin amber line spans the page width.

The Signal Log begins. Clean sans-serif body text, high contrast against the dark background, generous line spacing. The paragraph widths are narrow -- 65 characters max, optimized for reading speed. A GIF is embedded inline: a relay unit's context bar, six colored pips representing buffer slots, one pip blinking red and then fading out as a new pip slides in from the right. The GIF loops every 4 seconds. You watch it three times before reading on. The eviction is VISIBLE -- you can SEE the old signal being discarded to make room for the new one. The developer's text below the GIF explains what you just saw: "The red pip is a 12-tick-old patrol report. The incoming pip is a fresh threat assessment. LRU says the patrol report goes. But was the patrol report still relevant? Maybe. LRU doesn't ask."

The Architecture Note starts after a thin horizontal rule. The heading shifts to a slightly different amber -- warmer, closer to gold. The text here is denser, more conceptual. A code snippet appears in a dark code block: four lines of Python showing a `ContextWindow` class with an `evict()` method. It is not game code. It is the real-world equivalent. The developer writes: "If you've used LangChain's ConversationBufferWindowMemory, you've used FIFO eviction without knowing you had a choice." You feel the same thing Priya felt -- professional recognition. This game developer is talking about your production stack.

The Intercepted Transmission drops below a second horizontal rule. The background darkens to near-black. The text switches to amber monospace, tighter spacing, a faint CSS scan-line overlay that shimmers when you scroll. Captain Reyes's voice:

```
> FIELD REPORT // CPT. M. REYES // SECTOR 7-NORTH // MINDANAO GRID
>
> Lost RELAY-4 today. Context overload. Too many scouts feeding
> her buffer, not enough eviction headroom. She froze at tick 22
> with six signals competing for four slots. The striker formation
> she was feeding went blind. Three units down before I could
> reassign the channel.
>
> The lesson: a relay that hears everything processes nothing.
> Configuring what to FORGET is as important as configuring
> what to HEAR.
>
> Reyes out.
```

The fiction says the same thing the Architecture Note said, but in the voice of someone who lost soldiers because of it. The technical concept -- eviction policy configuration -- arrives through two emotional registers in a single blog post: professional ("here's how LangChain does it") and narrative ("I lost RELAY-4 today"). The reader who feels both registers simultaneously is already playing the game in their head.

You scroll to the bottom. A footer in small gray text: `TICK REPORT is a weekly dispatch from the development of Robot Uprising. All systems described are in development and subject to change. Subscribe: [email] | Archive: /ticks/ | Next tick: Tuesday.`

You close the tab. It is Tuesday. Next Tuesday, you will be back.
