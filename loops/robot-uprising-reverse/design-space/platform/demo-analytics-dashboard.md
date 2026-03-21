# 6.11b — Demo-Specific Analytics Dashboard

**Aspect:** Funnel visualization, drop-off points, retry rates per mission, Inspector engagement heatmap, conversion attribution — developers applying the game's Inspector philosophy to business metrics
**Category:** Platform (Web Demo)
**Related:** 6.11 (Web Demo Acquisition Funnel), 8.04c (Inspector Engagement Metrics), 8.04e (MVG as Web Demo), 6.11a (Save Migration), 6.11c (Embeddable Widget), 6.11d (Competitive Infrastructure), 4.25 (EDT Trajectory), 6.09 (GIF/Clip Export)

---

## The Mechanic

The irony is too good to ignore. Robot Uprising is a game about building analytical tools — the Inspector screen lets players scrub through timelines, examine decision traces, interrogate why their agents behaved the way they did. The developers building this game need to do the exact same thing with their demo players. The demo analytics dashboard is the Inspector, pointed outward. Every analytical philosophy the game teaches — decompose behavior into ticks, trace causality, find the moment things diverged from expectation — applies directly to understanding why Player #4,827 quit halfway through Mission 2.

The dashboard tracks the full funnel from first URL load to Steam wishlist click, with per-mission granularity that no off-the-shelf analytics tool provides out of the box. The demo is a web app (React + Pixi.js + Vite) with no backend, so all telemetry is client-side event emission to a lightweight analytics endpoint — the only server-side component in the entire Robot Uprising infrastructure. The dashboard itself is a separate internal tool, not shipped to players.

### The Funnel

The primary funnel has seven stages, each with a timestamp and a set of contextual properties:

```
Landing Page → Demo Start → M1 Complete → M2 Complete → M3 Complete → Wishlist Click → Purchase
   (URL hit)    (boot log     (first        (rules         (hooks +       (Steam         (Steam
                 begins)       Sealed        intro)         factory)        widget)        store)
                               Watch)
```

Every session gets a UUID stored in localStorage. No accounts, no login, no PII. The session ID persists across page refreshes but not across browser data clears. Each funnel stage emits an event with timestamp, session duration at that point, device type, referral source (UTM parameters or `document.referrer`), and screen resolution.

**Drop-off rates by stage** are the headline metric. Industry benchmarks for browser game demos suggest:

| Transition | Target | Alarm Threshold |
|-----------|--------|-----------------|
| Landing → Start | >65% | <40% |
| Start → M1 Complete | >50% | <30% |
| M1 → M2 Complete | >60% | <35% |
| M2 → M3 Complete | >55% | <30% |
| M3 → Wishlist | >15% | <5% |
| Wishlist → Purchase | >25% | <10% |

The funnel visualization renders as a horizontal Sankey diagram — wide entry on the left, narrowing rightward. Each stage is a vertical bar whose height represents player count. The gaps between bars are where players fell. Hovering over a gap shows the median session duration at dropout, the most common last-interacted UI element, and the device breakdown. The Sankey flows are colored by referral source — TikTok traffic in pink, Reddit in orange, Discord in purple, direct in grey, press embeds in teal — so the developer can see at a glance which acquisition channel produces the deepest funnel penetration.

### Per-Mission Drop-Off Heatmaps

Each mission gets a tick-level heatmap showing when players quit. The x-axis is the match tick (1 through ~60), and the y-axis is the mission phase (Plan, Sealed Watch, Inspector). Color intensity maps to dropout density. A bright band at tick 35 of Mission 2's Sealed Watch means players are watching their units fail and closing the tab instead of reaching the Inspector.

The heatmap answers the most important question in demo design: **where does the game lose people, and is it losing them during a frustration moment or a confusion moment?** Frustration dropouts cluster during Sealed Watch (they saw their agents fail and gave up). Confusion dropouts cluster during Plan (they couldn't figure out what to configure). The distinction determines whether the fix is difficulty tuning or UX clarity.

Each heatmap cell is clickable. Clicking opens a "representative session" panel — an anonymized reconstruction of what a typical dropout player did in the 30 seconds before quitting. Which UI elements they clicked, how long they hovered on the workbench, whether they ever opened a tooltip. This is the Inspector debrief, but for demo sessions instead of agent behavior.

### Retry Rates

Every mission tracks how many times a player attempted it before succeeding or abandoning. The retry distribution is a histogram — Zachtronics-style, naturally — showing the percentage of players who completed Mission N in 1 attempt, 2 attempts, 3 attempts, and so on, with an "abandoned after N attempts" tail.

Retry rates reveal difficulty calibration problems invisible to playtesting. If 40% of demo players retry Mission 2 three or more times, the rules-introduction mission is too hard for cold audiences. If 90% of players complete Mission 1 on the first attempt, the opening might be too easy to generate the "I need to understand WHY" curiosity that drives Inspector engagement.

The retry panel also shows **retry-to-conversion correlation**: among players who retried Mission 2 exactly twice, what percentage eventually wishlisted? This answers whether friction is productive (builds investment) or destructive (builds resentment). The hypothesis: one retry is the sweet spot — the player failed, learned something in the Inspector, redesigned their agents, and succeeded. Zero retries means the mission was trivially easy. Three or more retries means the learning loop isn't working.

### Inspector Engagement in the Demo

This is where the meta-irony crystallizes. The Inspector Engagement Profile (IEP) from aspect 8.04c — dwell time, unit click count, scrubber coverage, decision trace opens, buffer chart interaction — is tracked for every demo session. But now it serves a dual purpose: it measures player engagement AND it predicts conversion.

The dashboard shows a scatter plot: Inspector Depth score (0-100, the composite from 8.04c) on the x-axis, conversion probability on the y-axis. The hypothesis is that the scatter shows a strong positive correlation — players who actually use the Inspector are dramatically more likely to wishlist. If this holds, it validates the game's entire design thesis: the Inspector is not just a debrief tool, it IS the hook. The moment a player scrubs through a timeline and says "oh, THAT'S why my scout turned left" is the moment they become a buyer.

The Inspector engagement heatmap overlays on the per-mission view. Each mission shows not just dropout timing but Inspector depth at each retry. A player who ghost-passes the Inspector after Mission 1 (depth <15) but deep-dives after Mission 2 (depth >60) just had their aha moment. The dashboard highlights these "awakening" transitions with a gold indicator.

### Time-Per-Screen

Every screen transition is timestamped: Plan entry, EXECUTE press, Sealed Watch start, Sealed Watch end, Inspector entry, Inspector exit, next-mission click. The dashboard computes:

- **Plan dwell**: Time spent configuring before pressing EXECUTE. Long Plan times in M1 may indicate confusion. Short Plan times in M3 may indicate confidence or impatience.
- **Sealed Watch attention**: Whether the player stayed on the Sealed Watch tab or alt-tabbed. Focus loss during Sealed Watch suggests the battle pacing is too slow or the player doesn't understand what they're watching.
- **Inspector-to-Plan ratio**: Time spent analyzing vs. time spent designing. A healthy ratio is roughly 1:1. If players spend 3 minutes in Plan and 5 seconds in Inspector, they're treating Robot Uprising as a trial-and-error game rather than an analytical one. The demo has failed to teach its core value.

### Conversion Attribution

The dashboard tracks which specific UI element preceded the wishlist click. Was it the "Mission 4 Locked" modal? The histogram comparison after Mission 3? The predecessor's note? The match card with the Steam QR code? Attribution is last-touch by default, with a multi-touch view showing every conversion surface the player encountered.

Attribution data feeds directly back into demo design. If 70% of conversions come from the histogram ("Your efficiency: 47th percentile — unlock the Gauntlet to climb"), then the histogram is the conversion engine and should be made more prominent. If the predecessor's note converts at 2%, it's narratively beautiful but commercially inert — keep it for flavor, but don't rely on it.

### The Meta-Irony: Inspector Philosophy Applied

The dashboard UI itself is designed to echo the in-game Inspector. The funnel view uses the same amber-on-dark color scheme. The scrubber for time-series data uses the same horizontal timeline widget. The decision-trace equivalent is the "session reconstruction" panel — click a dropout point, and you see the sequence of actions that led to it, just as the in-game Inspector shows the sequence of perceptions that led to an agent's decision. The developers practice what the game preaches.

This creates a secondary marketing asset: screenshots of the analytics dashboard, showing the game's own visual language applied to business metrics, become compelling content for developer-audience platforms (GDC talks, indie dev blogs, Hacker News). "We built our analytics dashboard using the same design language as our game's Inspector tool" is a story that resonates with the developer-gamer overlap audience.

---

## Player Journeys

#### Journey: Kira, 31, Lead Developer

**Context:** Kira is the technical lead on Robot Uprising. It's two weeks after demo launch. The demo has been live on `robotuprising.game/play` for 14 days. She opens the analytics dashboard on her second monitor — a dark panel with amber gridlines, the funnel Sankey glowing left to right.

**8:30 AM — The Morning Check**
The Sankey loads. 11,400 landing page visits in the last 7 days. The first bar is tall — good reach. But the flow narrows sharply between "Demo Start" and "M1 Complete." She hovers over the gap. A tooltip appears in amber monospace: "4,218 sessions dropped. Median time at dropout: 47 seconds. Top last-interaction: boot log text (68%)." Her stomach drops. Players are quitting during the boot log. They're not even reaching the Plan screen. She clicks into the boot log dropout cohort.

The session reconstruction panel opens. Anonymized session #7,203: player loaded the page, watched boot log text scroll for 22 seconds, scrolled down (looking for a skip button), found nothing, closed the tab. Session #7,891: player tapped the screen 6 times during boot log (mobile user, trying to skip), no response, left after 31 seconds. The pattern is clear. The boot log — the diegetic tutorial the team spent weeks perfecting — is a dropout cliff for cold traffic.

Kira drags the time-series scrubber. The boot log dropout rate was 28% in week one. It climbed to 37% in week two. Word-of-mouth referrals tolerate it (they know what they're getting into), but TikTok traffic drops at 44%. She opens the referral-source overlay. The Sankey branches by color: Discord traffic (purple) flows smoothly past the boot log — 91% retention. TikTok (pink) hemorrhages — 56% gone before Plan. The fix is obvious: the boot log needs a skip option for impatient traffic, or an accelerated mode that compresses it to 8 seconds.

She files the issue, tags it "demo-critical," and moves to the retry panel for Mission 2. The histogram shows a fat tail — 23% of players who reach M2 retry it three or more times. She cross-references with Inspector depth. Players who ghost-pass the Inspector between retries (depth <15) have an 8% M2 completion rate. Players who study the Inspector (depth >40) have a 71% completion rate. The Inspector isn't decorative. It's the difference between learning and flailing. She adds a nudge: if a player fails M2 and ghost-passes the Inspector, the game gently highlights one unit's decision trace with a pulsing border on the next attempt's Inspector screen.

**9:15 AM — The Conversion Puzzle**
The conversion attribution panel shows something unexpected. The "Mission 4 Locked" modal converts at 12%. The histogram ("Your architecture scored in the 43rd percentile") converts at 19%. But the highest converter is one Kira didn't expect: the match card auto-export. Players who share their match card to clipboard — the social card with terrain screenshot, unit icons, and the QR code linking to the Steam page — wishlist at 31%. The act of sharing creates commitment. Kira bumps the match card prompt from "subtle" to "prominent" in the post-M3 flow.

#### Journey: Dev, 27, Backend Engineer and Demo Player

**Context:** Dev saw a Hacker News post titled "Robot Uprising: a browser game where you design agent architectures (robotuprising.game)." He clicked.

**Minute 0:00 — Landing**
The page loads in 1.8 seconds. Dark background, Philippine archipelago, circuit lines pulsing. He clicks the glowing province. The analytics system records: `event: demo_start, referrer: news.ycombinator.com, device: desktop, resolution: 2560x1440, utm_source: null, session: uuid-8f3a...`.

**Minute 0:20 — Boot Log**
Amber text scrolls. Dev reads every word — he's a backend engineer, he recognizes the language. "Subsystem: hook router... ONLINE. Channel subscription table: empty." He leans forward. The analytics system records continuous focus — no alt-tabs, no scroll attempts. Dwell time on boot log: 68 seconds. He's in the 94th percentile for boot log engagement.

**Minute 2:30 — Plan Screen, Mission 1**
He configures the Scout's context window, toggling perception inputs. He hovers over every tooltip. The analytics system captures 14 hover events on the workbench panel in 90 seconds — an unusually high interaction density that flags him as an "explorer" persona. He presses EXECUTE.

**Minute 3:15 — Sealed Watch**
The Scout navigates the rice terrace grid. Dev watches every tick. His eyes track the context bar filling. When the Scout encounters an enemy and its context window overflows, dropping an older observation, Dev whispers "LRU eviction." The analytics system records zero focus-loss events during Sealed Watch.

**Minute 4:00 — Inspector**
Dev clicks every unit (all one of them). He drags the scrubber to the overflow tick. He opens the decision trace. He spends 2 minutes and 40 seconds in the Inspector. Inspector Depth: 78. The analytics system records this as a "deep dive" session — top 8% of all demo players. The conversion prediction model assigns him a 73% wishlist probability.

**Minute 8:00 — Mission 2**
He fails on the first attempt. His two Scouts collide into the same enemy. He enters the Inspector. This time he scrubs to the collision tick, opens both units' decision traces side by side, and sees that they both perceived the same enemy at the same tick and both fired the same rule. He says "oh, they need different rules" out loud. Inspector Depth on this debrief: 82. He redesigns and succeeds.

**Minute 14:00 — Mission 3, Post-Completion**
After Mission 3, the histogram appears. His architecture efficiency: 62nd percentile. He stares at the bell curve. He wants to be higher. The "Full game unlocks the Gauntlet — optimize endlessly" text appears beside a Steam wishlist button. He clicks it. The analytics system records: `event: wishlist_click, attribution_surface: histogram, session_duration: 841s, inspector_avg_depth: 74, retry_count_m2: 1`.

#### Journey: Amara, 34, Marketing Manager

**Context:** Amara handles marketing for the indie studio. She doesn't play the game — she reads the dashboard. She needs to justify the $2,400/month ad spend on TikTok demo traffic and prepare a report for the studio's next investor update.

**Monday Morning — The Weekly Report**
Amara opens the dashboard and switches to the "Attribution" tab. The view shows a table: referral source, sessions, M1 completers, M3 completers, wishlists, cost per wishlist. TikTok: 6,200 sessions, 1,860 M1 completers, 744 M3 completers, 89 wishlists, $26.97 per wishlist. Reddit: 2,100 sessions, 1,155 M1 completers, 578 M3 completers, 52 wishlists, $0 (organic). Discord: 890 sessions, 712 M1 completers, 498 M3 completers, 87 wishlists, $0 (organic).

The numbers tell a story. TikTok drives volume but converts poorly — high top-of-funnel, steep dropoff at the boot log, low Inspector engagement (median depth: 22). Discord drives the highest quality traffic — these players already know what Robot Uprising is, they read the boot log, they use the Inspector, they convert at 9.8%. Reddit sits in the middle.

Amara clicks the TikTok cohort. The per-mission heatmap shows the damage: 44% of TikTok users drop during the boot log, another 18% drop during Mission 1's Plan screen. The ones who survive to Mission 2 actually convert well — their funnel from M2 onward matches Discord's quality. The problem is purely the first 90 seconds. TikTok users arrive expecting instant gameplay. The boot log, however beautiful, is a wall.

She drafts a recommendation: add a "Quick Start" option that compresses the boot log to 8 seconds for users arriving from social media ads (detectable via UTM parameters). Preserve the full boot log for organic and direct traffic. She pulls the Inspector engagement scatter plot into her investor deck — the strong positive correlation between Inspector Depth and conversion probability is the most compelling data point. It proves the game's core mechanic IS the business model: the analytical tool that makes the game unique is also the tool that converts players into buyers.

**Wednesday — The A/B Test**
Kira implemented the Quick Start boot log. Amara set up the A/B test: 50% of TikTok traffic gets the full boot log, 50% gets the 8-second compressed version. After 72 hours, the dashboard's A/B panel shows the results. Quick Start cohort: boot log dropout fell from 44% to 12%. But M1-to-M2 conversion dropped from 71% to 58%. The compressed boot log got players to the Plan screen faster, but they were less prepared — they didn't know what context windows were, so they mashed buttons and failed Mission 1 without understanding why. The Inspector engagement for the Quick Start cohort averaged 18 (ghost-pass territory).

The full boot log is a filter. It loses impatient players but produces better-educated ones. Amara adjusts: instead of compressing the boot log, the TikTok landing page gets a 15-second gameplay preview video that auto-plays above the demo embed. Players who click "Play Now" after watching the preview retain at 78% through the boot log. The preview primes them. Cost per wishlist from TikTok drops from $26.97 to $14.20.

---

## Strengths

- **Self-referential coherence.** The analytics dashboard uses the same philosophy as the game's Inspector — decompose behavior into discrete events, trace causality, find divergence points. This isn't a bolted-on analytics layer; it's a natural extension of the game's design thesis. Developers who build the Inspector are already trained to build this dashboard.
- **No-backend compatibility.** Client-side event emission to a lightweight analytics endpoint (a single CloudFlare Worker or Vercel Edge Function that writes to a time-series store) preserves the "no backend" constraint. The demo remains a static web app; the analytics pipeline is infrastructure, not application architecture.
- **Actionable granularity.** Per-mission, per-tick, per-UI-element tracking goes far beyond page-level analytics. The developer doesn't just know "30% of users bounced" — they know "30% of users bounced during tick 35 of Mission 2's Sealed Watch, 80% of whom had never opened an Inspector decision trace."
- **Conversion science.** The Inspector Depth to conversion correlation is potentially the single most valuable business insight. If it holds, it means the game's quality and its commercial viability are the same thing — improving the Inspector improves revenue.
- **Marketing ammunition.** The dashboard produces investor-ready visualizations. The Sankey funnel, the Inspector-conversion scatter plot, the cohort comparison tables — these are the materials that justify ad spend, secure funding, and tell the story of product-market fit.

## Weaknesses

- **Privacy minefield.** Even without PII, granular behavioral tracking raises GDPR/CCPA concerns. Session reconstruction — seeing the exact sequence of clicks a player made before quitting — is powerful but borders on surveillance. A cookie consent banner on the demo page adds friction to the zero-friction funnel. The game must decide: full telemetry with consent gate, or reduced telemetry without one.
- **Analysis paralysis.** The dashboard produces enormous amounts of data. A small indie team (2-4 people) can drown in metrics. Every heatmap cell is a rabbit hole. The risk is spending more time analyzing the dashboard than improving the game. The dashboard needs a "headlines" view — three numbers that matter today — with drill-down available but not mandatory.
- **Sample size fragility.** With 10K sessions per week, per-mission per-tick heatmaps may have cells with single-digit observations. Statistical significance is hard to achieve for fine-grained questions. The A/B test Amara ran needed 72 hours just for directional confidence. Indie-scale traffic doesn't support enterprise-scale experimentation.
- **Goodhart's Law.** If the team optimizes for funnel metrics, they may erode the game's identity. Shortening the boot log to improve retention undermines the diegetic tutorial. Simplifying Mission 2 to reduce retries removes the productive failure that drives Inspector engagement. The dashboard measures what's measurable, not necessarily what matters.
- **Build cost.** A custom analytics dashboard is a significant engineering investment for an indie studio. Every hour spent on the dashboard is an hour not spent on the game itself. The temptation to use Mixpanel or Amplitude is strong — they provide 70% of this functionality out of the box, with the remaining 30% (per-tick heatmaps, Inspector Depth correlation) requiring custom events but not custom UI.

---

## Interaction Effects

### With Demo Design (6.11)
The dashboard and the demo are co-dependent. The demo's six models (vertical slice, extended tutorial, sandbox, etc.) each produce different funnel shapes. The "First Three Missions" model produces a clean linear funnel. The "Persistent Playground" model produces a branching funnel where players may skip to Mission 3 and return to Mission 1. The dashboard must handle non-linear progression paths without breaking the Sankey visualization. Configuration: each demo model gets its own funnel definition, and the dashboard switches views based on the active model.

### With the Web Platform
The demo runs in a browser with no backend. Telemetry events must be fire-and-forget — a failed analytics request must never block gameplay. The implementation uses `navigator.sendBeacon()` for unload events and `fetch()` with `keepalive: true` for mid-session events. Both are resilient to tab closure. The analytics endpoint is a single edge function (Cloudflare Workers or Vercel Edge) that appends events to a time-series database (ClickHouse, TimescaleDB, or even a simple append-only S3 bucket with Athena queries for the truly budget-conscious).

### With Privacy
The game collects no PII. No names, no emails, no IP addresses stored in the analytics database (the edge function strips IP before storage). Session IDs are random UUIDs with no cross-session linking. Device fingerprinting is explicitly avoided. But GDPR's definition of personal data includes "online identifiers" — a localStorage UUID that persists across sessions could qualify. The safest approach: a non-intrusive analytics disclosure ("This demo collects anonymous gameplay data to improve the experience") with an opt-out toggle in the demo's settings menu. No modal. No consent wall. Respect the player's time.

### With A/B Testing
The dashboard supports A/B testing via URL parameter routing. Players arriving at `robotuprising.game/play?variant=B` see the experimental version. The dashboard splits all metrics by variant. Key constraint: A/B tests on a no-backend demo require client-side variant assignment, which means the variant logic ships in the demo bundle. Variants must be defined at build time (environment variable) or at edge-function routing time (URL rewrite), not at runtime. This limits the experiment velocity to one deploy per variant change, which is fine for indie-scale iteration (one experiment per week, not per hour).

---

## Comparable

### Steam Demo Analytics (Steamworks)
Steam provides basic demo-to-purchase conversion data: demo downloads, wishlist additions from demo players, median demo playtime, and a "demo funnel" showing the percentage of demo players who purchased within 30/60/90 days. Steamworks analytics are aggregate only — no per-player session reconstruction, no per-mission granularity, no Inspector engagement correlation. Robot Uprising's dashboard supplements Steam's macro view with the micro view that Steamworks cannot provide for a browser demo that lives outside Steam's ecosystem entirely.

### Mobile Game Funnel Tools (GameAnalytics, deltaDNA)
Mobile game analytics platforms track level-completion funnels, retry rates, session length distributions, and monetization events. GameAnalytics provides free tier level-flow visualizations that show the exact dropout point per level — structurally identical to Robot Uprising's per-mission heatmap. deltaDNA (now Unity Analytics) pioneered real-time A/B testing with server-side variant assignment. The key difference: mobile analytics platforms assume a backend server handling user accounts. Robot Uprising's no-backend constraint means the dashboard must achieve similar granularity with client-side-only telemetry, which limits cohort analysis (no cross-device tracking) but preserves the privacy-first design.

### Mixpanel / Amplitude Game Dashboards
General-purpose product analytics tools (Mixpanel, Amplitude, PostHog) can track custom events from web games. Amplitude's "Journeys" feature visualizes user paths as Sankey diagrams — essentially the same funnel view described here. Mixpanel's "Impact" feature correlates specific actions with retention, which maps to the Inspector Depth vs. conversion scatter plot. The case for a custom dashboard rests on two features these tools lack: per-tick temporal resolution within a mission (Mixpanel events are timestamped but not tick-indexed), and the Inspector Depth composite score (a domain-specific metric that requires custom computation). A pragmatic hybrid: use PostHog (open-source, self-hostable) for event ingestion and basic funnels, build custom views for per-tick heatmaps and Inspector correlation on top of the raw event data.

### Zachtronics Histograms
Zachtronics games (TIS-100, Opus Magnum, Shenzhen I/O) display player-facing histograms showing how your solution compares to the global population on multiple axes (cycles, cost, lines of code). These are player-facing analytics — the game tells YOU where you stand. Robot Uprising already has this (the post-mission histogram). The dashboard inverts it: the DEVELOPER sees where each histogram bucket correlates with conversion. If 62nd-percentile players convert at 22% but 85th-percentile players convert at 8% (they already mastered the demo and don't feel the pull of the full game), that's a critical insight that only the developer dashboard reveals.

---

## Sensory Description of the Dashboard UI

The dashboard opens to a dark background — not black, but the deep charcoal (#1a1a2e) of the game's boot log screen. Amber gridlines (#d4a849) divide the viewport into panels. The main Sankey funnel stretches across the top third of the screen, left to right. Each funnel stage is a vertical bar rendered in the game's unit-type colors: landing page in neutral grey, demo start in scout cyan, M1 in a slightly brighter teal, M2 in striker amber, M3 in relay green, wishlist in gold, purchase in bright white. The flows between bars are translucent ribbons — you can see through them, layered like the game's channel wiring visualization on the Plan screen board. Hovering over a ribbon thickens it and displays a tooltip in amber monospace: session count, median duration, top dropout reason.

Below the Sankey, the per-mission heatmap occupies the left half of the screen. It looks like a spectrogram — a rectangular grid where columns are ticks and rows are session phases (Plan, Watch, Inspector). Cold cells are deep blue-black. Warm cells glow amber. Hot cells — dropout clusters — burn bright orange, the same orange as the game's "context overflow" warning. A horizontal scrubber bar sits beneath the heatmap, identical in design to the in-game Inspector timeline scrubber: a thin amber line with a draggable diamond handle. Dragging it filters the heatmap to a specific date range. The scrubber emits a soft tick sound on each day boundary — the same metronome tick from the Sealed Watch, repurposed as temporal navigation feedback.

The right half holds the Inspector Depth scatter plot. Each dot represents a session — thousands of them, rendered as semi-transparent amber circles. The cluster is dense in the bottom-left (low depth, no conversion) and sparse in the top-right (high depth, conversion). A regression line cuts diagonally through the cloud in dashed gold. Below the scatter plot, a small histogram shows the retry distribution for the currently selected mission, rendered in the same style as the in-game Zachtronics-inspired player histogram — same bar widths, same percentile markers, same font.

The whole dashboard feels like a classified briefing interface. No rounded corners. No gradient shadows. No playful illustrations. Just data, gridlines, and amber light on dark ground. The font is the same monospace used in the game's boot log. Column headers use the same all-caps tracking as the game's UI labels. When a new session event arrives (the dashboard streams live during peak traffic), a tiny amber dot slides into the Sankey from the left edge with a soft blip — the same sound as a new signal arriving in an agent's context window during Sealed Watch. The developers are watching their players the same way their players watch their agents. The Inspector watches everything.

---

## New Aspects Discovered

- **6.11b-i** — Privacy-preserving telemetry architecture: designing a GDPR/CCPA-compliant analytics pipeline for a no-backend web game, including session identity without PII, consent-free minimal tracking vs. opt-in granular tracking tiers, edge-function event ingestion, IP stripping, data retention policies
- **6.11b-ii** — Inspector Depth as leading conversion indicator: formal statistical analysis of the correlation between Inspector engagement metrics and purchase behavior, causal vs. correlational disentangling, implications for game design (improving Inspector = improving revenue)
- **6.11b-iii** — Boot log as conversion filter: the tension between diegetic onboarding and cold-traffic retention, adaptive boot log pacing by referral source, the "filter" hypothesis (losing impatient players early is net positive for conversion quality)
- **6.11b-iv** — Developer dashboard as marketing content: using the analytics dashboard's Inspector-echo aesthetic as GDC talk material, indie dev blog content, and developer-audience conversion tool
- **6.11b-v** — A/B testing infrastructure for static web games: client-side variant assignment, edge-function routing, build-time vs. runtime experimentation, sample size constraints at indie scale, when to use off-the-shelf tools vs. custom builds
