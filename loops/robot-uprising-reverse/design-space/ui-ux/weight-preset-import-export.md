# Weight Preset Import/Export as Config String

**Aspect:** 4.89 — Weight preset import/export as config string: pre-ranking weight presets are serializable to a short config string (e.g., `PA:66,R:25,V:8`) that can be pasted in community channels; standardized sharing format for "optimal presets" for specific mission types; connects the in-game mechanic to real-world config-sharing culture (dotfiles, .eslintrc, etc.)

**Parent:** 4.63 — Player-configurable pre-ranking weights
**Siblings:** 4.88 — Adaptive weight suggestion from divergence history; 4.90 — Weight configuration persistence across campaign chapters; 4.91 — Visual weight interpolation animation; 4.92 — Per-mission-type weight performance heatmap
**Prerequisites:** Player must have unlocked configurable weights (4.63 unlock gate — 3+ divergence events) and saved at least one named preset.
**Related:** 7.10 — Config necropsy as community artifact; 7.05 — Leaderboards and optimization; 4.64 — Pre-ranking accuracy as displayed stat; 4.88 — Adaptive weight suggestion; 8.08 — Real-language vocabulary claim ("tuning a heuristic"); 4.37 — Fork-and-deploy shortcut

---

## The Core Concept

A player saves a pre-ranking weight preset — `Stable Config: PA:66, R:0, V:33`. It works beautifully for late-campaign missions with low config churn. They want to share it. Right now, they could screenshot the slider panel and post the numbers in Discord. But screenshots are lossy: the recipient has to read three numbers off an image and manually set their own sliders to match. Transcription errors. Rounding. Friction.

**The config string collapses the distance between "here's what works for me" to "paste this and run it."**

A serialized preset string is a tiny, self-contained artifact — a dozen characters that encode a complete diagnostic philosophy. It can be pasted into a Discord message, embedded in a Reddit guide, included in a Twitch stream overlay, or appended to a config necropsy changelog. The recipient pastes it into their game's import field, and the sliders snap to the author's exact configuration.

This is not a novel pattern. It is one of the oldest patterns in software engineering culture. Dotfiles repositories on GitHub — `.vimrc`, `.bashrc`, `.eslintrc` — are nothing more than serialized configuration preferences shared between practitioners. Terraform modules are infrastructure philosophies encoded as text. Kubernetes YAML manifests are deployment beliefs made portable. ESLint configs are code quality opinions serialized to JSON. The entire DevOps movement could be described as "what if we made configuration shareable, versionable, and importable?"

Robot Uprising's weight preset strings teach this directly. The player who exports `PA:66,R:0,V:33` and pastes it into a Discord thread is doing the same thing as the engineer who pushes their `.prettierrc` to a shared repository. The player who imports someone else's preset string and watches their Fix Explorer reshuffle is doing the same thing as the junior developer who clones a team's dotfiles and suddenly has a working development environment. The pedagogical payoff is not the preset itself — it is the act of sharing configuration as text, the realization that a complex system's behavior can be captured in a short string and transferred between contexts.

---

## Format Specification

### The String Format

The config string is designed to be human-readable, short enough for a chat message, and unambiguous enough for machine parsing:

```
RU:1|PA:66,R:25,V:8|StableConfig
```

**Anatomy:**
- `RU:1` — format header. `RU` identifies this as a Robot Uprising config string. `1` is the format version number. This enables future extensions without breaking old strings.
- `PA:66,R:25,V:8` — the weight payload. Three key-value pairs separated by commas. Keys are fixed abbreviations: `PA` (pivot-activity), `R` (recency), `V` (volatility). Values are integers 0–100 representing raw slider positions (not normalized percentages — the game handles normalization on import).
- `StableConfig` — optional preset name. CamelCase, no spaces, max 24 characters. Omitted if the player didn't name the preset.

**Why this format:** The string reads like a config file entry. `PA:66` is immediately legible to anyone who has used the weight panel — they know what PA means, they know 66 means "high." The pipe delimiters create visual structure without being heavy. The whole string fits in a tweet, a Discord message, a Reddit inline code block.

**Edge cases:**
- All zeros: `RU:1|PA:0,R:0,V:0|AllZero` — valid. The game normalizes to equal weights (33/33/33) on import, same as setting all sliders to zero in the UI.
- Maximum on one axis: `RU:1|PA:100,R:0,V:0|PurePivot` — valid. The game normalizes to 100/0/0.
- Missing name: `RU:1|PA:66,R:25,V:8` — valid. On import, the game prompts for a name or assigns "Imported Preset."
- Corrupted values (negative, >100, non-numeric): Import validation catches these and shows a clear error.

### Versioning

Format version `1` supports three weight axes. If a future update adds a fourth signal (e.g., `CA` for causal-adjacency), format version `2` would look like:

```
RU:2|PA:66,R:25,V:8,CA:40|CausalHunter
```

**Backward compatibility:** A version-2 client importing a version-1 string treats missing keys as defaults (the game's built-in default for any new axis). A version-1 client importing a version-2 string ignores unknown keys and shows a notice: "This preset was created in a newer version. Some weight axes were not imported." The preset still works — it just doesn't include the new axis. This is the same pattern as npm's `package.json` — new fields are silently ignored by older parsers.

### Validation on Import

When a player pastes a string into the import field, the game runs a validation sequence:

1. **Format check** — Does the string match the `RU:N|...|...` pattern? If not: "This doesn't look like a Robot Uprising preset string. Check the format."
2. **Version check** — Is the version number known? If higher than the current client: "This preset was created in a newer version. Importing with default values for unknown axes."
3. **Value range check** — Are all values integers between 0 and 100? If not: "Invalid weight value detected. All weights must be between 0 and 100."
4. **Key check** — Are the axis keys recognized? Unknown keys in a known version trigger: "Unrecognized weight axis. This may be from a modified client."
5. **Name sanitization** — Strip any characters outside `[A-Za-z0-9_-]` from the preset name.

If validation passes, the import preview appears (see Sensory Description below).

---

## The Design Space

### Option A: Clipboard-Only Export (The Dotfile Model)

**What happens:** The preset panel gains an "Export" button next to each saved preset. Clicking it copies the config string to the system clipboard. A small toast confirms: "Copied to clipboard." The player pastes wherever they want — Discord, Reddit, a text file, a personal note. Import works the same way: a text field in the preset panel accepts a pasted string.

**The bet:** The game doesn't need to build sharing infrastructure. The clipboard IS the sharing channel. Players already know how to copy-paste. The format string is small enough that it never breaks in transit (no URL encoding issues, no character limits, no platform-specific escaping). This is exactly how dotfiles work — you copy the contents of `.vimrc`, paste them into a new machine's `.vimrc`, done.

**Strengths:**
- Zero infrastructure. No server-side preset storage, no API endpoints, no community gallery to moderate.
- Platform-agnostic. Works in any text channel on any platform.
- Players develop literacy with the format itself. Seeing `PA:66,R:0,V:33` in a Discord message and knowing what it means without clicking anything is a form of engineering fluency.
- The string format becomes community vocabulary. "I use PA:80,R:10,V:10 for relay missions" is a sentence a player can type from memory.

**Weaknesses:**
- No attribution. A pasted string doesn't carry the author's name. "Who made this preset?" requires context.
- No performance data. The string encodes weights but not accuracy statistics. The recipient doesn't know if this preset has 90% accuracy or 30%.
- No discoverability. Players have to find presets in external channels. There is no in-game browse or search.

---

### Option B: QR Code + String (The Pokémon Rental Model)

**What happens:** In addition to the clipboard string, the game generates a QR code for each preset. The QR encodes the same string. Players can screenshot the QR and share it as an image. The game's import panel accepts either a pasted string or a QR scan (on mobile) or image upload (on desktop).

**The bet:** Visual sharing formats travel better in some channels. A QR code in a Twitch stream overlay or a YouTube thumbnail communicates "this is a shareable config" without the viewer needing to pause and transcribe a string.

**Strengths:**
- Visual artifact that signals shareability even before it is shared.
- QR scanning on mobile is frictionless — point camera, import preset.
- The QR code can be styled with the game's visual identity (amber border, circuit-board corner decorations), making it recognizable as a Robot Uprising artifact.

**Weaknesses:**
- QR codes are opaque — the viewer can't read the weights from the image. The string's human-readability is its greatest asset, and QR codes destroy it.
- Adds complexity to the import flow (image upload, camera permissions, QR parsing library).
- Pokémon Showdown abandoned QR rental teams in favor of plain-text paste. The community preferred readable formats.

---

### Option C: Shareable Link with Preview (The Blueprint.gg Model)

**What happens:** Exporting a preset generates a short URL that opens a web-based preset viewer: `robotuprising.gg/p/PA66R0V33`. The page shows the three sliders at their configured positions, the preset name, the author's in-game handle, and (if the author opted in) their accuracy stats with this preset over their last 30 sessions.

**The bet:** A link with a rich preview is more shareable than a raw string in communities where link previews are standard (Discord, Slack, Twitter). The preview page becomes a landing page that can also serve as an acquisition funnel for non-players.

**Strengths:**
- Rich context — the viewer sees weights, name, author, and performance data before importing.
- Attribution is built in. The author's handle is part of the artifact.
- Platform link previews (Discord embed, Twitter card) show the preset visually.

**Weaknesses:**
- Requires web infrastructure (hosting, database, link generation).
- Links can break. Servers go down. URLs expire. A string in a Discord message from 2027 will still be pasteable in 2030; a link might not resolve.
- Over-engineered for a 12-character payload. The string format's simplicity is a feature.

---

### Recommended Design: Option A as Primary, Option C as Enhancement

The clipboard string is the canonical sharing format. It works everywhere, costs nothing to implement, and teaches the dotfiles pattern directly. Option C's shareable link is an enhancement for players who want attribution and performance context — generated alongside the clipboard string, not instead of it.

The export panel shows both:

```
EXPORT PRESET — "StableConfig"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Config String:  RU:1|PA:66,R:0,V:33|StableConfig    [Copy]
Share Link:     robotuprising.gg/p/3xK9f             [Copy]

Accuracy with this preset: 81% over 24 sessions
```

---

## Player Journeys

#### Journey: Dani, 22, Computer Science Student

Dani is in her 6th week with the game. She has three saved presets and has been active in the game's subreddit. She just cleared a difficult relay-chain mission using a volatility-heavy preset she built after reading the adaptive suggestion (4.88) that told her high-volatility signals are more diagnostic in relay-dense missions.

**Minute 0:00 — The Export**

Dani opens her preset panel. Three presets listed vertically: "Balanced" (the default), "RecentFirst" (her early experiment), and "RelayNoise" — the one that just carried her through the mission. She hovers over "RelayNoise." A small export icon appears to the right of the preset name — a rectangle with an upward arrow, the universal "share" glyph. She clicks it.

A compact export panel slides open below the preset row. Two lines: the config string in a monospace font inside a pill-shaped container with a rounded border — `RU:1|PA:20,R:10,V:70|RelayNoise` — and a "Copy" button beside it. Below that, a share link. Below both, a dim stat line: "Accuracy: 78% over 16 sessions."

She clicks "Copy" on the config string. The button transforms: the text "Copy" is replaced by a checkmark icon that holds for 800ms, then fades back to "Copy." A micro-animation: the pill-shaped container around the string flashes with a brief cyan border pulse — the same cyan used for successful actions throughout the debrief UI. A tiny toast slides up from the bottom of the panel: "Copied to clipboard" in monospace, fading after 2 seconds.

**Minute 0:15 — The Reddit Post**

Dani switches to the game's subreddit. She writes a post:

> **Relay-chain missions: stop overweighting pivot-activity**
>
> I was stuck on Mission 14 (the triple-relay gauntlet) for five sessions. My pre-ranking kept surfacing the wrong candidate because my relays are so active at the pivot tick that pivot-activity drowns out everything else.
>
> Solution: crank volatility to 70%. Elements with unstable behavior patterns across the session are much better diagnostic targets in relay missions because relays amplify noise.
>
> `RU:1|PA:20,R:10,V:70|RelayNoise`
>
> Paste this into your preset import. 78% accuracy over 16 sessions for me.

The config string sits in a Reddit code block — monospaced, visually distinct from the prose around it. It looks like a terminal command. It looks like something you paste and execute.

**Minute 0:45 — The Community Response**

Three hours later, the post has 47 upvotes. Comments include:

- "Imported this and immediately got a different #1 candidate on Mission 14. Applying it now." — this player pasted the string, their sliders moved, their results reshuffled. Zero friction between reading the post and running the config.
- "I tried `RU:1|PA:10,R:5,V:85|RelayNoiseExtreme` and it's even better for me. The sweet spot for relay missions might be V:80+." — this player modified Dani's preset by hand, changing the numbers in the string directly before importing. They understood the format well enough to edit it as text. This is the dotfiles literacy moment.
- "Does this work for armor missions too? My accuracy with V:70 is worse than default for non-relay missions." — this player is discovering that presets are context-dependent, not universally optimal. The pedagogical payload: configuration is not global. Different contexts demand different priors.

**UI Annotations:**
- Export icon: 16x16 share glyph, appears on hover, positioned right of preset name
- Config string container: monospace font, pill-shaped with 1px border (dormant: grey-400; on copy: cyan pulse for 400ms)
- Copy button: transforms to checkmark for 800ms, no layout shift
- Toast: "Copied to clipboard" in monospace, slides up from bottom, fades after 2s
- Accuracy stat line: dim grey, below the string, shows session count as denominator

---

#### Journey: Marcus, 45, Casual Player

Marcus is the same Marcus from the configurable-weights journey (4.63). He never fully engaged with the sliders — he dragged one accidentally, got confused, hit reset. But he reads the game's Discord. He sees other players posting config strings and wants to try one.

**Minute 0:00 — Finding the String**

Marcus is scrolling the `#strategies` channel on Discord. A message from a player named `relay_kai`:

> For anyone stuck on wave 3: `RU:1|PA:80,R:10,V:10|PivotFirst`
> This preset crushes wave 3 missions. Pivot-activity is king when there's a single obvious failure moment.

Marcus copies the string. He doesn't fully understand what PA:80 means. He knows it has something to do with the sliders he accidentally touched once. But the social proof is compelling — 12 thumbs-up reactions on the message.

**Minute 0:20 — The Import**

He opens the game, navigates to the preset panel. At the bottom of the preset list, a text field with placeholder text: "Paste a config string to import..." in dim italic. He pastes.

The game validates the string. A preview panel materializes below the text field, showing what will change:

```
IMPORT PREVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Preset Name:    PivotFirst
Pivot Activity: ████████████████░░░░  80%
Recency:        ██░░░░░░░░░░░░░░░░░░  10%
Volatility:     ██░░░░░░░░░░░░░░░░░░  10%

Source: External (no author attribution)
                            [Import]  [Cancel]
```

The preview shows the three slider bars at their imported positions — static, not interactive. Marcus can see what he is about to import without it taking effect yet. The preview is a buffer between "I pasted something" and "my game changed." This is the safety moment that was missing when he accidentally dragged sliders.

He clicks "Import." The preset appears in his preset list as "PivotFirst" with a small import icon — a downward arrow in a circle — indicating it was imported, not created locally. He selects it. The sliders animate to their new positions (the 4.91 interpolation animation). The results list in his current Fix Explorer session reshuffles.

**Minute 1:00 — The Result**

He runs QUICK mode with the imported preset. The #1 candidate is different from what he usually sees. He applies it. Pass rate improves.

Marcus doesn't fully understand why PivotFirst works for wave 3. But he has a working config, and more importantly, he has a new mental model: "other people's settings can make my tool work better." This is the junior developer cloning dotfiles. The understanding comes later. The productivity comes now.

**Minute 2:00 — The Learning Trigger**

Three sessions later, Marcus tries PivotFirst on a wave 5 mission. It doesn't work — QUICK surfaces a clearly wrong candidate. He remembers that `relay_kai` said it was for wave 3. He opens the preset panel, looks at PivotFirst's values (80/10/10), and for the first time consciously reads the slider labels. He thinks: "pivot-activity is 80% — that means it mostly looks at what was active at the failure moment. Maybe wave 5 failures aren't about a single moment?"

He switches back to Balanced. QUICK gives a better result for wave 5.

Marcus has just learned that configuration is context-dependent. He learned it not from the slider tutorial, not from the transparency panel, but from importing someone else's config and hitting its limits. The import/export system created the learning moment that the sliders alone could not.

**UI Annotations:**
- Import text field: bottom of preset list, placeholder "Paste a config string to import..." in italic grey
- Import preview: appears below text field after paste + validation, shows static slider bars (not interactive), preset name, source attribution
- Import icon on imported presets: 12x12 downward arrow in circle, distinguishes imported from locally-created presets
- Validation error states: red border on text field, error message below in red-400 ("Invalid format — check the string and try again")

---

#### Journey: Seo-yun, 29, Competitive Gauntlet Player and Discord Moderator

Seo-yun runs the game's competitive Discord server. She has organized the `#preset-library` channel with pinned messages for each mission type. She treats preset strings the way a DevOps engineer treats Terraform modules — versioned, documented, purpose-specific.

**Minute 0:00 — The Meta-Game of Configuration**

Seo-yun maintains a personal spreadsheet of preset strings alongside their accuracy data. She has 14 presets. She has tested each one across at least 20 sessions of its target mission type. Her spreadsheet looks like a CI/CD dashboard:

| Preset | String | Mission Type | Accuracy | Sessions |
|--------|--------|-------------|----------|----------|
| PivotFirst | `RU:1\|PA:80,R:10,V:10` | Wave 3 single-relay | 87% | 31 |
| NoiseHunter | `RU:1\|PA:15,R:5,V:80` | Multi-relay wave 4+ | 74% | 22 |
| FreshDeploy | `RU:1\|PA:30,R:60,V:10` | Post-iteration | 82% | 18 |
| ColdStart | `RU:1\|PA:50,R:0,V:50` | First session new campaign | 69% | 25 |

She notices something: PivotFirst has the highest accuracy for single-relay missions, but NoiseHunter has higher accuracy when combined with the adaptive suggestion system (4.88). The adaptive suggestion recommended `V:75+` for relay-heavy missions three sessions ago. The system's data-driven recommendation aligned with her empirical testing.

**Minute 1:00 — The Pinned Message**

She writes a pinned message for `#preset-library`:

> **Wave 3 Recommended Presets (Season 4 meta)**
>
> Single-relay missions:
> `RU:1|PA:80,R:10,V:10|PivotFirst` — 87% accuracy (31 sessions, @seo-yun)
>
> Multi-relay missions:
> `RU:1|PA:15,R:5,V:80|NoiseHunter` — 74% accuracy (22 sessions, @seo-yun)
>
> Just changed your config and re-running:
> `RU:1|PA:30,R:60,V:10|FreshDeploy` — 82% accuracy (18 sessions, @seo-yun)
>
> **How to use:** Copy a string. Open preset panel. Paste into import field. Select preset before running QUICK.
>
> **Don't blindly copy.** These presets reflect MY diagnostic patterns. If your architecture is fundamentally different from mine (e.g., you use command-centric instead of relay-centric designs), your optimal weights will differ. Start with these, then track your own accuracy and adjust.

The pinned message is structured like a README in a dotfiles repository. It has the configs, the usage instructions, and the caveat about context-dependency. Seo-yun has internalized the infrastructure-as-code culture without having been explicitly taught it. She learned it by sharing preset strings.

**Minute 2:30 — The Meta Shift**

A new game patch adjusts how volatility is calculated (volatility now accounts for inter-tick variance, not just total variance). Seo-yun's NoiseHunter preset, which was tuned for the old volatility calculation, drops from 74% to 58% accuracy.

She updates the pinned message:

> **PATCH 2.3 NOTICE:** Volatility calculation changed. Old volatility-heavy presets may underperform. Re-testing in progress. Current recommendation: fall back to `RU:1|PA:50,R:25,V:25|PatchDayBalanced` until the meta settles.

This is a version migration notice. The same thing that happens when a major ESLint version drops and the community's shared configs break until maintainers update them. The same thing that happens when a Terraform provider releases a breaking change and every module that depends on it needs a patch. Seo-yun is living the infrastructure maintenance lifecycle through a game mechanic.

**Minute 4:00 — The Fork**

Another competitive player, `ghost_relay`, responds to Seo-yun's pinned message:

> I forked your NoiseHunter for the new volatility calc:
> `RU:1|PA:20,R:5,V:75|NoiseHunterV2`
> Accuracy is back to 72% on multi-relay wave 4. The trick is dropping PA slightly — the new volatility calc already captures some pivot-adjacent activity.

The word "forked" is not accidental. The player has absorbed version-control vocabulary through the act of modifying someone else's config string and resharing it. The preset import/export system has created a culture of forking, versioning, and attribution — the same culture that powers open-source software.

**UI Annotations:**
- Imported presets with known community source show attribution: "Forked from @seo-yun's NoiseHunter" if the share link was used
- Accuracy stats export alongside the string when the player opts in (toggled in export panel)
- Patch version number could optionally be embedded in the string: `RU:1.2.3|PA:20,R:5,V:75` — but this adds complexity; better to keep the format simple and let players note patch versions in their documentation

---

## Strengths

**Creates community infrastructure with zero server cost.** The config string is a client-side artifact. There is no preset database to maintain, no community gallery to moderate, no API to scale. Players use existing platforms (Discord, Reddit, forums, personal notes) as the distribution layer. The game provides the format; the community provides the infrastructure. This is exactly how dotfiles work — GitHub is the distribution layer, `.vimrc` is the format.

**Teaches the most transferable skill in the entire game.** Configuration-as-code is arguably the single most important pattern in modern software engineering. The player who learns to serialize a belief system into a short string, share it, import someone else's string, discover its limitations, fork it, and maintain it through version changes — that player has internalized the core loop of DevOps culture. No other mechanic in Robot Uprising has this direct a mapping to industry practice.

**The format itself is a teaching artifact.** `PA:66,R:0,V:33` is legible. A player who sees this string in a Discord message can read the weights without importing it. They develop fluency with the abbreviations (PA, R, V), the value semantics (0–100), and the structural grammar (key:value,key:value). This is the same fluency that lets an engineer glance at a Kubernetes label selector or an ESLint rule configuration and understand it without running it. The format's human-readability is not a convenience — it is the pedagogical mechanism.

**Bootstraps new players past the configuration learning curve.** Marcus's journey demonstrates this directly: a player who was intimidated by the sliders can import a working preset and experience the benefit of configuration before understanding the mechanism. This mirrors how junior developers clone a senior engineer's dotfiles and get a productive environment on day one, then gradually understand and customize each setting.

---

## Weaknesses

**Cargo-cult configuration without understanding.** The same bootstrapping that helps Marcus also risks creating permanent dependence. A player who always imports presets and never builds their own has a working tool but no diagnostic intuition. They are the developer who uses a linter config they don't understand — their code passes the checks, but they can't explain why a rule exists or when to disable it. The game teaches tool-use without tool-comprehension.

**Mitigation:** The career stats system (4.64) should track imported vs. locally-created presets separately. A player's "diagnostic autonomy" metric could show what percentage of their sessions used self-authored presets vs. imported ones. This doesn't block importing — it surfaces the dependency as visible data, letting the player decide whether to address it. The adaptive suggestion system (4.88) also helps: even if the player starts with an imported preset, the system's data-driven recommendations will eventually suggest modifications, pulling the player toward active configuration.

**Community convergence on "solved" presets kills experimentation.** If the community determines that `PA:80,R:10,V:10` is optimal for wave 3 and everyone imports it, the design space collapses. No one experiments with alternative configurations because the community has spoken. This is the `.eslintrc` monoculture problem — when `eslint-config-airbnb` dominates, alternative style choices atrophy.

**Mitigation:** The per-mission-type weight performance heatmap (4.92) shows that no preset is globally optimal. A preset that is 87% accurate for one player's architectural style might be 55% for another's. Making this data visible in the import preview — "Community average accuracy: 72%. Your predicted accuracy: unknown (import and test to see)" — reminds players that someone else's config is a starting point, not a solution.

**No provenance or trust signal.** A config string pasted in Discord carries no inherent trustworthiness. A malicious or trolling player could post `RU:1|PA:0,R:0,V:100|TrustMe` and claim it is optimal. The recipient has no way to verify without testing. This is a mild risk in a single-player context (the worst outcome is a few wasted QUICK runs) but becomes meaningful in competitive Gauntlet play where a bad preset in a ranked session costs Elo.

**Mitigation:** The share link (Option C) adds author attribution and accuracy data, providing a trust signal. But the clipboard string intentionally lacks this — simplicity over trust. The community will develop its own trust mechanisms: verified presets from known players, pinned messages from moderators, accuracy-tested preset libraries. This mirrors how the open-source community handles untrusted packages — reputation, community vetting, and personal testing.

---

## Interaction Effects

**With 4.63 (Configurable weights):** The import/export system is the social extension of configurable weights. Without 4.63, there is nothing to export. Without 4.89, weight configuration is a solitary activity. Together, they create a loop: configure → test → export → share → import others' → compare → reconfigure. This loop is the config-sharing culture loop that drives dotfiles, linter configs, and infrastructure modules.

**With 4.88 (Adaptive weight suggestion):** The adaptive system suggests weight changes based on empirical session data. An imported preset can serve as the starting point that the adaptive system then refines. "You imported PivotFirst (PA:80,R:10,V:10). Based on your last 12 sessions with this preset, accuracy improves 18% if you increase recency to 20%." The adaptive system personalizes imported presets — turning someone else's config into your own. This is the engineer who clones a dotfiles repo and then tweaks settings based on their own usage patterns.

**With 4.64 (Pre-ranking accuracy stat):** Accuracy data is the empirical grounding that prevents cargo-cult importing. If the accuracy stat panel shows "PivotFirst: 87% accuracy (imported from @relay_kai)" alongside "MyCustom: 91% accuracy (self-authored)," the player sees that their own preset outperforms the imported one. The data nudges them from consumer to creator.

**With 7.10 (Config necropsy):** Config necropsy changelogs (version history exports) and preset strings are complementary sharing formats. A necropsy shows how a config evolved over time. A preset string shows a single diagnostic philosophy frozen at a point. A complete community post might include both: "Here's my config evolution (changelog link) and here's the pre-ranking preset I settled on (string)." The two artifacts together tell the full story: what I built and how I diagnosed it.

**With 7.05 (Leaderboards):** If leaderboards track pre-ranking accuracy by mission type, players will want to know which presets the top-ranked players use. Export strings make this possible without any special leaderboard infrastructure — a top player can simply post their preset strings alongside their leaderboard position. This creates a "pro settings" culture similar to competitive FPS games where pro player mouse sensitivity and crosshair configs are shared and imitated.

**With career stats (imported vs. self-authored tracking):** Career stats should distinguish between sessions run with imported presets vs. self-authored ones. This creates a "diagnostic independence" metric: what percentage of a player's successful diagnoses used their own configs? A player with high accuracy but 100% imported presets has a different skill profile than one with high accuracy on self-authored presets. Both are valid. The distinction makes the dependency legible.

---

## Comparable Games and Practices

**Factorio blueprint strings.** Factorio's blueprint system serializes an entire factory section into a base64-encoded string. Players copy the string, paste it in-game, and stamp down a working factory. The parallel is direct: a Factorio blueprint string is a serialized engineering artifact shared via clipboard. The key difference: Factorio blueprints encode a spatial layout (hundreds of entities with positions and connections), while Robot Uprising preset strings encode a belief system (three numbers). The simplicity of the Robot Uprising format is an advantage — the player can read and understand the entire config at a glance, while Factorio blueprints are opaque base64 blobs. This readability is what makes the dotfiles parallel work.

**Pokémon Showdown team exports.** Showdown serializes a complete competitive team into a plain-text format: species, ability, moves, EVs, IVs, nature, item. Players paste these into import fields to instantly load a team. The format is human-readable and has become a community standard — team reports on Smogon always include the Showdown paste. The parallel to Robot Uprising: the format BECOMES the community's shared language. "252 Atk / 252 Spe Adamant" is shorthand every competitive Pokémon player understands. `PA:80,R:10,V:10` should be shorthand every competitive Robot Uprising player understands.

**Fighting game notation (Numpad notation, Tekken notation).** The FGC developed standardized notation systems for communicating combos: `236P` (quarter-circle forward + punch), `d/f+2` (down-forward + right punch). These are serialized input sequences — config strings for human execution. The notation is community-invented, not game-provided. Robot Uprising can shortcut this process by providing the standard format from day one, preventing fragmentation.

**Minecraft /give commands and datapacks.** Minecraft's `/give` command is a config string that conjures an item with specific attributes: `/give @s diamond_sword{Enchantments:[{id:"sharpness",lvl:5}]}`. Players share these in forums. The command IS the artifact — you paste it, you get the item. Robot Uprising's preset string is the same pattern: you paste it, you get the config.

**Real dotfiles culture.** The deepest parallel. Dotfiles repositories on GitHub (github.com/username/dotfiles) contain serialized configuration for development tools: `.vimrc`, `.tmux.conf`, `.gitconfig`, `.eslintrc`, `.prettierrc`. Engineers share these to bootstrap new environments, learn from each other's workflows, and maintain consistency across teams. The culture has specific norms: attribution (forked from @username), documentation (comments explaining non-obvious settings), versioning (git history), and contextualization (different configs for different projects). Robot Uprising's preset sharing will develop the same norms naturally if the format supports them. The string format's human-readability and the optional share link's attribution metadata provide the minimum viable infrastructure for this culture to emerge.

**Terraform modules and Helm charts.** In infrastructure-as-code, engineers share reusable configuration packages. A Terraform module for "standard VPC setup" encodes an infrastructure opinion. A Helm chart for "production Redis deployment" encodes an operational philosophy. These are not raw config files — they are curated, documented, versioned belief systems about how infrastructure should behave. A Robot Uprising preset string like `RU:1|PA:80,R:10,V:10|PivotFirst` is a diagnostic Helm chart: a curated, named, shareable belief about how the pre-ranking should behave for a specific class of mission.

---

## Sensory Description

**The config string as visual artifact.** The string `RU:1|PA:66,R:0,V:33|StableConfig` appears in a monospace font throughout the game — in the export panel, in the import preview, in the preset list's detail view. The font choice is deliberate: monospace signals "this is code, this is configuration, this is something you paste." The string sits inside a pill-shaped container with a thin border — normally a muted grey, but on hover, the border brightens to the same amber used for EDT annotations. The pipe delimiters (`|`) are rendered in a slightly dimmer shade than the key-value pairs, creating visual grouping: the header, the payload, and the name are distinguishable at a glance.

**The copy-to-clipboard animation.** When the player clicks "Copy," three things happen in sequence over 600ms total. First (0–200ms): the pill container's border flashes cyan — a single bright pulse that radiates outward like a ripple, using a CSS box-shadow animation. Second (200–400ms): the string text inside the container briefly becomes bold, each character gaining weight as if the string is being "stamped" — the visual metaphor is an imprint being pressed. Third (400–600ms): the copy button's label transforms from "Copy" to a checkmark icon with a micro-scale animation (0.8 → 1.0 scale over 200ms), and a small toast slides up from the bottom edge of the panel: "Copied" in monospace, with a thin cyan underline. The toast holds for 1.5 seconds, then fades with a 300ms opacity transition.

The entire sequence communicates: the string has been captured, impressed, confirmed. It feels like sealing a letter.

**The paste-and-validate moment.** The import field is a single-line text input at the bottom of the preset list. It has a subtle dashed border — the dashed line suggests "paste something here," distinct from the solid borders used for interactive elements. When the player pastes a string, the field's dashed border resolves into a solid line over 200ms — the uncertainty of "what goes here?" becomes the certainty of "something is here." The validation runs instantly (sub-100ms). If valid, the border turns teal and the import preview panel slides down from the field with a 250ms ease-out animation. If invalid, the border turns red-400 and an error message materializes below the field with a gentle shake animation (3px horizontal oscillation, 2 cycles, 200ms).

**The import preview.** The preview panel is a self-contained card showing three static slider bars (not interactive — you are previewing, not configuring). Each bar is rendered at the imported weight position with the same color coding as the live sliders: amber for pivot-activity, teal for recency, violet for volatility. The bars are at 60% scale compared to the live sliders — smaller, subordinate, a preview not a control. Below the bars, the preset name in the game's heading font, and a source line: "External import — no author data" (for clipboard imports) or "From @username — 81% accuracy over 24 sessions" (for share-link imports). The "Import" button is teal, the "Cancel" button is a dim grey text link.

Clicking "Import" triggers a closing animation on the preview card — it collapses upward into the text field over 200ms — and simultaneously, the new preset row appears in the preset list with a brief highlight flash (amber background for 500ms, then fading to the standard row color). The imported preset has a small badge icon: a downward arrow inside a circle, rendered in teal, distinguishing it from locally-created presets which have no badge. The badge is a permanent marker — this config came from outside. It is the `fork` badge in a git log.

**The string in the wild.** In a Discord message, `RU:1|PA:66,R:0,V:33|StableConfig` sits inside a code block — Reddit and Discord both render inline code in monospace with a faint background. The string looks like a terminal command. It looks like something you execute. This visual framing is not an accident of platform formatting — it is the format's intentional design. The string should look like code because it IS code. It is a configuration directive that changes a system's behavior when applied. Players who see it in a code block are being primed to think of it as they would think of a shell command or a config file entry: something precise, executable, and consequential.

---

## Discovered New Aspects

1. **4.93 — Preset diff view for comparing two imported configs**: Side-by-side visual comparison of two preset strings showing which axes differ and by how much; "PivotFirst vs. NoiseHunter: PA differs by 65 points, V differs by 70 points"; helps players understand the design space between two community-recommended configs rather than blindly choosing one.

2. **4.94 — Preset provenance chain (fork history)**: When a player imports a preset, modifies it, and re-exports, the new string carries a provenance header linking back to the source: `RU:1|PA:20,R:5,V:75|NoiseHunterV2|fork:3xK9f`; enables community genealogy of presets — who forked whom, how configs evolved across players; mirrors git commit parents and npm package dependency trees.

3. **4.95 — Preset A/B testing mode**: Import two presets and run both on the same session — the game runs QUICK with preset A, then QUICK with preset B, showing which one surfaced the correct candidate; structured comparison rather than anecdotal testing; teaches controlled experimentation methodology and mirrors production A/B testing infrastructure.
