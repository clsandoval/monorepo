# Reputation Economy Design: Circuit Tokens, Contributor Badges, Featured Creators, and Parallel Social Currencies

**Aspect:** 7.03c — Reputation economy design: circuit tokens, contributor badges, featured-creator program, reputation decay, and how reputation interacts with Gauntlet rating as parallel social currencies

**Category:** multiplayer/community
**Wave:** 7 — Cross-Cutting Synthesis / Community

---

## The Core Design Problem

Every community platform faces the same question: how do you make contribution visible, rewarded, and trustworthy without turning the reward system into the point? Stack Overflow built a reputation economy so successful that "SO reputation" became a hiring signal — but also created perverse incentives where users race to answer easy questions first, edit-farm for badges, and gatekeep to protect their position. Reddit karma is trivially gameable and carries no trust weight. Steam Workshop ratings collapse into binary thumbs-up/thumbs-down with no distinction between "uploaded one joke mod" and "maintained the most-used overhaul for three years." GitHub's contribution graph rewards commit frequency over commit quality, creating a culture of green-square farming.

Robot Uprising's community layer — config sharing, necropsies, sound packs, terminal annotations, tournament participation — needs a reputation system that solves three problems simultaneously:

1. **Signal quality.** When a player browses the Workshop and sees a config with 200 upvotes, that tells them almost nothing. When they see the creator has a Diamond Gauntlet rating, a "Necropsy Author ×12" badge, and 4,800 circuit tokens, that tells them something real: this person understands the game deeply, contributes analytical content regularly, and has been doing so long enough to accumulate meaningful reputation.

2. **Reward contribution type, not just volume.** A player who uploads 50 meme configs and a player who writes 3 deeply researched necropsies with annotated replays are contributing in fundamentally different ways. The system must distinguish between them without privileging one contribution type over another.

3. **Separate reputation from competitive skill.** A Silver-tier player who writes the best necropsies on the platform is contributing more to the community than a Grandmaster who never shares anything. Gauntlet Elo measures competitive ability. Reputation measures community citizenship. These are parallel currencies — correlated but independent, and the system must make that independence legible.

The fundamental design question: **how does Robot Uprising build a reputation economy that rewards the behaviors that make the community valuable — sharing, teaching, analyzing, creating — without creating the pathologies that plague every existing reputation system?**

---

## The Two Currencies: Circuit Tokens and Gauntlet Elo

### Circuit Tokens (Community Currency)

Circuit tokens are the fungible reputation unit. They are **earned** through community contributions and **spent** on nothing — they are purely a signal of cumulative contribution, not a currency with purchasing power. Making tokens spendable creates extraction incentives; making them purely accretive creates a clean signal.

**Earning rates by activity:**

| Activity | Tokens | Rationale |
|----------|--------|-----------|
| Upload a config to Workshop | 5 | Low bar — encourages sharing, but upload-spam yields diminishing reputation |
| Config receives 10 unique imports | 10 | Demand-validated — other players found it useful enough to import |
| Config receives 50 unique imports | 25 | Scaling reward for genuinely popular configs |
| Publish a necropsy (Changelog or Annotated Replay) | 20 | Higher bar — necropsies require analysis, not just sharing |
| Necropsy receives 10 bookmarks | 15 | Community validation of analytical quality |
| Upload a sound pack (6.10g) | 15 | Creative contribution — sound packs require audio work beyond gameplay |
| Sound pack reaches 100 active users | 30 | Sustained adoption, not just novelty downloads |
| Share a terminal annotation link (5.16c) | 8 | Knowledge sharing — explaining a game mechanic interaction for others |
| Terminal annotation receives 20 opens | 12 | Others found the explanation useful |
| Participate in a community tournament | 10 | Showing up matters — tournaments need bodies |
| Place top 8 in a tournament | 20 | Competitive achievement within community context |
| Win a tournament | 35 | Peak competitive-social performance |
| Config fork chain reaches depth 3 | 15 | Your config inspired iterations — the highest form of contribution |

**Daily earning cap:** 50 tokens. This prevents grind-farming and ensures that high-token players accumulated reputation over months, not weekends. The cap is soft — tournament prizes and viral config milestones can exceed it, but routine activity (uploads, annotations) stops yielding tokens after 50/day.

**Token display:** A single number on the player's profile, rendered as a small circuit-board icon followed by the count in the game's monospace font. The icon is a tiny PCB trace in warm copper — not gold, not silver, copper. Copper says "functional component" rather than "premium currency." At milestone thresholds (100, 500, 1000, 5000, 10000), the icon gains additional trace complexity: a single trace at 100, a branching pair at 500, a small IC chip at 1000, a full mini-board at 5000, a glowing board with active traces at 10000.

### Gauntlet Elo (Competitive Currency)

Gauntlet Elo measures one thing: how good your config is at winning matches against other players' configs. It is a standard Elo rating with seasonal resets, visible as a number and a tier badge (Bronze through Grandmaster). Elo is **not** reputation. A Grandmaster who never shares anything has high Elo and zero circuit tokens. A Silver player who writes brilliant necropsies has low Elo and thousands of tokens.

**The parallel display:** On every profile, Workshop listing, and community post, both numbers appear side by side — Elo tier badge on the left, circuit token count on the right, separated by a thin vertical divider. The visual weight is equal. Neither is "above" the other. This spatial parity communicates the design intent: these are orthogonal measures of different kinds of value.

**Where they interact:** A player's Workshop uploads show both their Elo and their token count. A config shared by a Diamond player with 8,000 tokens carries different weight than a config shared by a Diamond player with 12 tokens (skilled but uninvolved in community) or a Bronze player with 6,000 tokens (deeply engaged contributor still climbing competitively). The two numbers together tell a story that neither tells alone.

---

## Contributor Badges

Badges are non-fungible achievement markers that signal **type** of contribution rather than volume. Unlike tokens, which accumulate indistinguishably, badges tell you what kind of contributor someone is.

**Badge taxonomy (4 tracks, 3 tiers each):**

| Track | Tier 1 (Bronze) | Tier 2 (Silver) | Tier 3 (Gold) |
|-------|-----------------|-----------------|---------------|
| **Architect** (config sharing) | 5 configs imported by others | 25 configs imported, 3 with 50+ imports | 100 configs imported, 1 with 500+ imports, 5 fork chains |
| **Analyst** (necropsies) | 3 published necropsies | 12 necropsies, 5 with 10+ bookmarks | 30 necropsies, community "Essential Reading" tag on 3+ |
| **Artisan** (sound packs / creative) | 1 sound pack with 50+ users | 3 sound packs, 1 with 500+ users | Featured sound pack, total 2000+ active users across packs |
| **Scholar** (terminal annotations / teaching) | 10 shared terminal annotations | 30 annotations, 10 with 20+ opens | 50 annotations, community reference status on 5+, cited in 10+ necropsies |

**Badge display:** Small icons that appear below the player's name on profiles and community posts. Each track has a distinct shape: Architect is a small blueprint schematic, Analyst is a magnifying glass over a waveform, Artisan is a speaker cone with sound waves, Scholar is an open book with circuit traces on the pages. Bronze tier icons are monochrome (dark gray on light). Silver adds a subtle metallic sheen — the icon catches light as the page scrolls, a parallax micro-animation. Gold icons have a faint animated glow — not garish, not pulsing, just a warm amber luminescence like a component under low voltage, barely perceptible until you notice it and then impossible to unsee.

Players can display up to 3 badges on their profile. The choice of which badges to display is itself a social signal — a player with Gold Analyst and Bronze Architect is telling you they specialize in necropsies.

---

## Reputation Decay: The "Dark Capacitor" Model

Static reputation systems accumulate zombies — accounts with high reputation from years-ago contributions that no longer reflect current engagement. Stack Overflow has users with 100k+ reputation who haven't posted in years. Their reputation persists as a monument to past activity, which pollutes the signal.

Robot Uprising uses **capacitor decay**: reputation is a charge that slowly drains without active contribution. The metaphor is electrical — a capacitor stores energy but leaks over time unless refreshed.

**Decay mechanics:**
- Tokens decay at 2% per month after 60 days of zero earning activity
- Decay is capped — tokens never drop below 50% of peak lifetime value (the "permanent trace")
- Any earning activity in a month resets the decay timer completely
- Badges never decay — they represent achieved milestones, not current engagement

**What decay looks like visually:** A player's circuit token icon shows decay state. At full charge, the copper traces glow warmly. After 30 days of inactivity, the glow dims slightly — imperceptible unless you knew to look. After 60 days, decay begins: the traces darken to a cooler tone, and a faint patina texture appears over the icon, like oxidized copper. The number itself gains a small downward arrow indicator during active decay. When the player earns tokens again, the patina dissolves with a brief warm flash — the capacitor recharging.

**Why this works:** Decay ensures that high-token players are currently active contributors. A returning player sees their decayed tokens and understands instantly: "I used to be engaged, I've been away, and the community has moved on." The 50% floor preserves historical contribution recognition while making current engagement visible.

---

## The Featured Creator Program

The top tier of community recognition. Featured Creators are players whose sustained, high-quality contributions make them community pillars. This is not an algorithm — it is a curated editorial selection, refreshed monthly.

**Selection criteria (all must be met):**
- Gold badge in at least one track
- 2,000+ circuit tokens (non-decayed)
- Active contribution in the past 30 days
- No active moderation strikes

**What Featured Creators get:**
- A small star icon next to their name (amber, not gold — consistent with the game's "active trace" color language)
- Their Workshop uploads appear in a "Featured Creators" carousel on the Workshop landing page
- Early access to new game builds for beta testing configs
- A private channel with the development team for feedback (not a "council" — no governance power, just a communication line)

**What Featured Creators do NOT get:**
- Moderation power (moderation is a separate track — see 7.03b)
- Exclusive cosmetics or gameplay advantages
- Permanent status — Featured Creator status is re-evaluated monthly

**Sensory design of the Featured Creator carousel:** The Workshop landing page has a horizontal strip at the top labeled "Featured Creators This Month." Each creator gets a card: their avatar (small pixel portrait), name, Elo tier badge, circuit token count, top badge, and their most-imported config as a thumbnail blueprint preview. The cards sit on a dark charcoal rail with subtle copper trace patterns running between them — as if the featured creators are nodes in a circuit. Hovering a card brightens the traces connected to it and reveals a one-line bio written by the creator: "I break relay chains and write about it." The strip auto-scrolls slowly — one card width every 8 seconds — with a smooth ease-in-out that mimics a conveyor belt in the game's factory aesthetic.

---

## Player Journeys

#### Journey: Dalisay, 27, Former Competitive Pokémon VGC Player

**Context:** Dalisay placed top 16 at Philippine nationals in VGC 2024. She's used to writing team reports — post-tournament documents explaining her team composition, EV spreads, and matchup reasoning. She's been playing Robot Uprising for 6 weeks, reached Platinum in Gauntlet, and just experienced her first major config breakthrough: a relay-chain architecture that uses compressed threat data to coordinate a three-unit pincer.

**Week 1 of community engagement:** Dalisay uploads her pincer config to the Workshop. She earns 5 tokens. The next day, she checks and sees 3 imports — people are trying it. She writes a quick description: "Relay compresses threat data, two scouts flank based on compressed signal, specialist hacks the relay target. Works against defensive configs." 10 tokens when imports hit the threshold. Her profile shows 15 tokens and the bare copper trace icon.

**Week 3:** Dalisay loses a Gauntlet match badly — a scout-rush config dismantled her relay before compression could kick in. She spends 40 minutes in the Inspector studying the replay, drops annotation pins at the three critical ticks, and publishes her first necropsy: "The Relay Timing Problem: Why Compression Needs 4 Ticks and Scout-Rush Gives You 2." Twenty tokens for the necropsy. She shares it on Discord. Within a day, 14 bookmarks — other relay-chain players had the same problem and didn't know how to diagnose it. Fifteen more tokens. Her profile now reads 50 tokens, and the Analyst badge (Bronze) appears: her third necropsy.

**Week 8:** Dalisay has published 8 necropsies. Her token count is 340. She notices something familiar — the necropsy culture feels exactly like VGC team reports, but with richer artifacts. In VGC, a team report is text and screenshots. Here, a necropsy includes importable config versions, annotated replays with pin commentary, and visual diffs. She starts cross-referencing her necropsies with terminal annotation links (5.16c), explaining the game mechanics behind her diagnostic reasoning. Each annotation earns 8 tokens; when other players open them from her necropsies, she earns more. Her Scholar badge (Bronze) appears alongside her Analyst badge. She displays both.

**Week 16:** Dalisay is Diamond in Gauntlet and has 1,400 circuit tokens. Her profile shows two badges: Analyst (Silver) and Scholar (Bronze). She's become the go-to necropsy author for relay-chain architectures. New relay players import her configs and read her necropsies as a learning curriculum. She notices a Featured Creator she follows — @signal_weaver — has a Gold Analyst badge and 6,000 tokens. She sees the path: keep writing, keep analyzing, keep teaching. The system rewards exactly the behavior that made VGC community valuable.

#### Journey: Tomás, 16, First-Time Strategy Game Player from Cebu

**Context:** Tomás found Robot Uprising through a Twitch streamer. He's in Silver tier, still learning how hooks and channels work. He doesn't think of himself as someone who "creates content." He just plays the game.

**Week 1:** Tomás finishes a Gauntlet match where his config accidentally did something cool — his scout looped through an enemy relay's blind spot three times, gathering intel without being detected. He doesn't know why it worked. He clicks "Share Replay" and posts it to Discord with: "my scout did something weird lol." A more experienced player responds with an annotated version explaining the blind spot mechanic. Tomás doesn't earn any tokens for the raw replay share — it wasn't a config upload or necropsy — but he learns something.

**Week 3:** Tomás uploads his first config to the Workshop. Five tokens. He sees the copper trace icon appear on his profile and feels a small satisfaction — not from the number, but from the visual change. His profile went from blank to having a thing on it. Two days later, someone imports his config. He gets a notification: "@kai_architect imported your config 'lucky-scout-v1'." He clicks Kai's profile and sees: Diamond Elo, 2,800 tokens, Gold Architect badge. The profile is dense with earned markers. Tomás doesn't feel intimidated — the system shows him the distance without implying he's failing. The gap between 5 tokens and 2,800 is just time and contribution.

**Week 6:** Tomás discovers that someone forked his lucky-scout config, modified the channel routing, and published a necropsy about why the blind-spot loop worked: "The scout's channel was named 'recon-general' — the enemy's interception rule was filtering for 'scout' channels specifically." Tomás earns 15 tokens from the fork chain. He reads the necropsy and understands his own config better than before. He writes his first terminal annotation link explaining channel naming to other Silver players: "if you name your channels something the enemy isn't looking for, their interception rules miss you." Eight tokens. He's at 28 total.

**Week 12:** Tomás has 180 tokens and an Architect (Bronze) badge from his configs being imported. He's Gold tier now. His profile displays one badge and a token count that says "I've been here, I've contributed, I'm learning." He doesn't have any Analyst badges — he hasn't written necropsies. The badge system doesn't punish this; it simply reflects that his contribution path is through sharing configs rather than analyzing them.

#### Journey: Reina, 38, UX Designer and Sound Artist

**Context:** Reina doesn't care about competitive Gauntlet. She's Bronze tier and content to stay there. She downloaded Robot Uprising because she loved the corruption audio design (6.10g) and wanted to create custom sound packs. She's a professional sound designer who works on mobile games by day.

**Week 1:** Reina opens the sound pack editor and spends three hours crafting a "Deep Ocean" corruption vocabulary — buffer overflows sound like whale song distortion, relay degradation is a submarine sonar ping decaying into static, EM emissions are bioluminescent crackle. She uploads it to the Workshop. Fifteen tokens. She tags it "atmospheric, horror-adjacent, organic."

**Week 2:** The sound pack gets traction. Streamers discover it. The whale-song buffer overflow becomes a meme on Discord — people clip the sound and post it out of context. At 50 active users, then 100 — 30 tokens. Reina's Artisan badge (Bronze) appears. She's at 45 tokens total and has barely played Gauntlet. Her profile shows Bronze Elo and 45 circuit tokens. The mismatch is the point: here is someone who contributes enormously to the community experience without being a competitive player. The two-currency system makes her contribution visible.

**Week 6:** Reina has published 4 sound packs. "Deep Ocean" has 600+ active users. Her Artisan badge is Silver. She has 380 tokens. She starts collaborating with necropsy authors — they embed her sound packs into annotated replays so viewers experience the corruption audio the way the author intended. This creates a new community practice: "authored replays" with curated audiovisual presentation. Reina doesn't earn tokens directly from this collaboration, but her sound pack active user counts climb, which yields milestone tokens.

**Week 14:** Reina is selected as a Featured Creator. The amber star appears next to her name. Her "Deep Ocean" pack is the third most-used sound pack in the game. She has 1,200 tokens, Silver Artisan and Bronze Scholar (from terminal annotations explaining her audio design choices). She gets access to the dev feedback channel and immediately posts a detailed request for more modding hooks in the audio system — she wants per-unit corruption audio so different unit types can have different degradation sounds. The development team adds it to the backlog. Reina's Gauntlet rating is still Bronze. Nobody cares. Her community contribution is visible, valued, and completely independent of competitive skill.

---

## Strengths and Weaknesses

### Strengths

- **Orthogonal currencies prevent single-axis optimization.** Players cannot game both Elo and tokens simultaneously — they require different activities (winning matches vs. sharing and analyzing). This creates genuine diversity in player profiles.
- **Badge tracks reward specialization.** The four tracks (Architect, Analyst, Artisan, Scholar) mean that players with different contribution styles all have visible recognition paths. A sound designer and a necropsy author are both legible contributors with distinct badges.
- **Capacitor decay keeps the signal fresh.** Unlike Stack Overflow's permanent reputation, decaying tokens ensure that high-token profiles represent currently active contributors. Returning players see their patina and understand the message without needing it explained.
- **The 50% decay floor preserves history.** Decay doesn't erase contributions — it dims them. A player who contributed heavily two years ago still shows half their peak tokens. Their Gold badges remain forever. The system remembers without pretending they're still active.
- **Featured Creator is editorial, not algorithmic.** Curated selection prevents gaming. You can't grind your way to Featured — you need sustained quality that catches editorial attention. This preserves the signal's value.

### Weaknesses

- **Token earning rates are arbitrary.** Why is a necropsy worth 20 tokens and a config upload worth 5? These numbers require extensive tuning against real player behavior. Set them wrong and the incentives distort — too many tokens for sound packs and everyone uploads low-effort audio, too few for necropsies and analytical content dries up.
- **Daily cap creates "wasted" effort.** A player who uploads 3 configs, writes a necropsy, and shares 5 terminal annotations in one day hits the 50-token cap and feels the rest of their effort was unrewarded. The cap is necessary for anti-farming but punishes burst contributors.
- **Decay is emotionally punishing for returning players.** A player who takes 6 months off and returns to see their tokens at 50% of peak may feel betrayed rather than motivated. The patina visual metaphor helps, but the number going down is inherently negative. Mitigation: a "Welcome Back" recharge bonus — returning players earn 2x tokens for their first week back.
- **Badge thresholds are cliff effects.** A player with 4 necropsies (one short of Bronze Analyst at 5 threshold... wait, Bronze is 3) — a player with 11 necropsies feels no different from one with 4 until they hit 12 for Silver. Progress bars within badge tiers would help: "7/12 necropsies toward Silver Analyst."
- **Featured Creator program creates an inner circle.** Even without governance power, Featured Creators with dev channel access become a perceived elite. The program must be transparent about selection criteria and rotate frequently enough that it doesn't calcify.

---

## Interaction Effects

### With Gauntlet Rating (7.01)

Gauntlet Elo and circuit tokens are displayed side by side everywhere — profiles, Workshop listings, community posts, tournament brackets. This parallel display creates four legible player archetypes: High Elo / High Tokens (competitive community leader), High Elo / Low Tokens (skilled loner), Low Elo / High Tokens (community pillar still climbing), Low Elo / Low Tokens (new player). Each archetype is immediately readable from the two-number display. The system avoids collapsing these into a single "player score" — the tension between them IS the information.

### With Config Necropsy Culture (7.10)

Necropsies are the highest-token community activity (20 per publish, plus bookmark bonuses). This deliberately weights the token economy toward analytical contribution. The Analyst badge track exists specifically because necropsy culture is Robot Uprising's core community differentiator — the system should over-invest in rewarding it. A Gold Analyst badge is the most prestigious community marker in the game, more respected than high Elo in many community contexts, because it represents sustained deep analysis shared publicly.

### With Sound Pack Modding (6.10g)

The Artisan badge track ensures that creative contributors — sound designers, audio modders — have equal visibility in the reputation system. Without it, the system would implicitly privilege gameplay-adjacent contributions (configs, necropsies) over aesthetic contributions (sound packs). The Artisan track says: the community experience includes how the game sounds, and the people who shape that experience deserve equal recognition.

### With Terminal Sharing (5.16c)

Terminal annotation links are the knowledge infrastructure of the community. When a necropsy author links to a terminal annotation explaining "here's how EM emission detection works," they're building on the Scholar track contributor's work. The token economy rewards both: the necropsy author gets necropsy tokens, the annotation author gets open-count tokens when readers follow the link. This creates a citation economy — knowledge builds on knowledge, and both the synthesizer and the source are rewarded.

### With Workshop Search and Discovery (7.03d)

Reputation signals feed directly into Workshop sorting and filtering. Players can filter Workshop results by creator token count, badge tier, and Elo. A "High Reputation" filter surfaces configs from players with 1000+ tokens. A "Rising Creator" filter surfaces configs from players with rapid recent token growth (earning rate above 80th percentile in the past 30 days). These filters use reputation as a quality signal without making it the only signal — new configs from unknown creators still appear in "Recent" and "Trending."

### With Community Moderation (7.03b)

Trust levels from the moderation system (7.03b) interact with but remain separate from reputation. A high-token player who receives a moderation strike loses Featured Creator eligibility but keeps their tokens and badges. Moderation history is visible to moderators but not to the community — reputation reflects contribution quality, not behavior compliance. The two systems run in parallel: you can be a high-reputation contributor who occasionally gets heated in comments, or a perfectly-behaved player with zero contribution reputation.

---

## Comparable Systems

**Stack Overflow Reputation:** The closest analog. SO reputation is earned through upvotes on questions and answers, with different rates for different activity types (10 per answer upvote, 5 per question upvote, 2 per edit). Reputation unlocks privileges (comment at 50, edit at 2000, close-vote at 3000). Robot Uprising deliberately avoids privilege-gating — tokens are signal, not power. SO's system creates perverse incentives (fastest-gun-in-the-west for easy questions, edit-farming). Robot Uprising's daily cap and badge tracks mitigate this by spreading incentives across contribution types rather than concentrating them on a single activity.

**Reddit Karma:** A cautionary tale. Karma is trivially gameable (repost popular content), carries no trust signal (a 100k-karma account may be a karma farmer), and conflates "entertaining" with "useful." Robot Uprising avoids karma's problems by tying tokens to specific community-valuable activities rather than to generic upvotes. You cannot earn tokens by being funny in comments. You earn tokens by sharing configs, writing necropsies, creating sound packs, and explaining game mechanics.

**Steam Workshop Ratings:** Binary thumbs-up/thumbs-down with no creator reputation system. A creator who maintains 50 high-quality mods looks identical to one who uploaded a single texture pack. Robot Uprising's badge system solves this — the Architect Gold badge tells you "this person has a sustained track record of sharing configs that other players find valuable."

**GitHub Contribution Graphs:** The green-square visualization creates a "streak" incentive that rewards daily commits over meaningful commits. Robot Uprising's daily cap is the inverse design — it prevents streak-farming by capping daily earning, ensuring that high token counts represent sustained contribution over months rather than intense activity over days.

**Opus Magnum Community Metrics (via MechA culture):** The Opus Magnum tournament community developed informal reputation through sustained competitive participation and metric innovation. Players like biggiemac42 earned community recognition not through any in-game system but through consistent, high-quality contributions to tournament infrastructure and novel metric design. Robot Uprising's Featured Creator program formalizes what Opus Magnum's community did informally — recognizing the players who make the community valuable.

---

## Sensory Design of Reputation UI Elements

**The Profile Card:** When hovering a player's name anywhere in the community — Workshop listing, necropsy author byline, tournament bracket — a card slides out from the name with a 0.2s ease-out animation. Dark charcoal background with a single copper trace running along the bottom edge. Left side: avatar (16x16 pixel portrait in the game's isometric style), name in the monospace display font, Elo tier badge (colored shield icon). Right side: circuit token icon with count, up to 3 selected badges below it. The copper trace along the bottom glows warmer for higher-token players — barely perceptible at 100 tokens, a clear warm amber at 5000+. If the player is a Featured Creator, the amber star sits in the top-right corner of the card, and the copper trace gains a faint pulse animation — like current flowing through the circuit.

**The Token Counter Animation:** When a player earns tokens, the counter on their profile doesn't simply increment. The old number dissolves into individual digits that scatter like components falling off a board, and the new number assembles from below — digits rising into place with a soft click sound, like components being soldered onto a PCB. The copper trace icon flashes warm for 0.5 seconds. The animation is fast (0.8s total) and satisfying without being interruptive.

**The Badge Unlock Moment:** When a player achieves a new badge tier, the badge icon materializes at the center of the screen with a radial expansion animation — traces extending outward from a central point, forming the badge shape over 1.2 seconds. A low, resonant hum accompanies it — not triumphant, not fanfare, but the sound of a system powering on. A capacitor charging. The badge settles into its position on the profile with a final click. Below it, a single line of text: "Analyst — Bronze. Your necropsies are being read." The text is specific to the badge and tier, always framed as community impact rather than personal achievement.

**The Decay Patina:** A player returning after 90 days of inactivity sees their profile's copper traces have darkened. The warm amber glow is gone, replaced by a cool verdigris tint — the color of oxidized copper. The token count number is slightly dimmer. When they earn their first token back, the patina cracks and flakes away with a satisfying dissolution animation — warm copper blooming through the oxidation from the point of the earning activity outward, like current finding a path through corroded traces. The metaphor is literal: electricity flowing through a circuit that's been dormant, burning off the oxide, restoring conductivity. The sound is a rising electrical hum, low to mid frequency, resolving in a clean tone when the patina fully clears.

**The Featured Creator Carousel:** On the Workshop landing page, a horizontal rail of creator cards scrolls at the pace of a slow conveyor belt. Each card is 200x120px with the dark charcoal background. Copper traces connect the cards along the rail — when a card is hovered, the traces to its neighbors brighten, creating a localized "powered" segment of the circuit. The amber star on each card has a micro-rotation — it turns 1 degree every 2 seconds, so slowly that you only notice it if you stare. This is the "is it moving?" effect that draws attention without demanding it.

---

## New Aspects Discovered

- **7.03c-i — Token earning rate tuning methodology:** How to calibrate token values across activity types using player behavior data; A/B testing framework for earning rates; detecting and correcting incentive distortions post-launch
- **7.03c-ii — Reputation-gated Workshop features:** Which Workshop features (if any) should require minimum reputation; "verified creator" status for configs that appear in search recommendations; trust-but-verify pipeline for new creators
- **7.03c-iii — Cross-game reputation portability:** If Robot Uprising has sequels or expansions, how does reputation carry forward; the "legacy token" problem; seasonal reputation vs. lifetime reputation
- **7.03c-iv — Reputation analytics dashboard for creators:** What data do contributors see about their own reputation trajectory; contribution heatmaps, earning breakdowns, badge progress bars, audience demographics of who imports their configs
