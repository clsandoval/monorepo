# The Globe — Interactive Portfolio (Design Draft)

> **STATUS: DRAFT — paused mid-brainstorm 2026-06-05.** Design synthesis approved in
> conversation but not yet finalized. Resume by reviewing "Open / Undecided" below.
>
> **Deliverable is NOT code.** This session produces a *design artifact bundle*
> (this spec + mockups + data schema + content checklist) to be handed off to a
> cloud design/build tool. No site implementation happens in the brainstorm repo.

## Premise

A personal portfolio that is a single interactive instrument, not a set of pages.
The visitor operates a dot-matrix Earth that *is* Carlos — where he's been, what he's
built, how he thinks. It mirrors the through-line of his work (Daimon, Lakbai,
neo4j-graphrag): convergent systems that turn messy information into navigable
knowledge. The site is that same move pointed at himself — a living proof of the
philosophy, not a description of it.

## Decisions Locked

| Decision | Choice |
|----------|--------|
| Core structure | **Globe IS the whole site** — no traditional pages; the globe is the navigation |
| Layers | **Two projections of ONE knowledge graph** — Earth (geographic) + Mind (relational). **Both on the bone/off-white palette** (dark-Mind reversed 2026-06-05). |
| Graph build | **GraphRAG / neo4j at build time** over *everything* (repos, docs, travel, places, Maps data, activities, people) → export nodes+edges to static JSON. neo4j is an offline extraction engine, not a runtime server. |
| Globe treatment | **Dot-matrix** (chosen over wireframe / inked) — dots are the kinetic material |
| Timeline role | **Passive ambient playback** (scrubber DROPPED). Movement auto-plays on a slow loop; nav is spatial (rotate + click) |
| Aesthetic | **NieR: Automata × Nous Research** — diegetic instrument, esoteric-technical, authored |
| Voice / philosophy | **Ambient fragments** — sparse aphorisms in margins / as system messages, no manifesto page |
| Place significance | **The Memory Field** — significance encoded as *gravity*, not labels. Gravity ∝ `visitCount` (auto) + curated one-line notes on a hand-picked few (hybrid). See section. |
| Data freshness | **Static build-time snapshot** from monorepo `entities/` → JSON (nightly auto-rebuild later) |

## One Knowledge Graph, Two Projections

The site is built on a **single unified knowledge graph**, extracted at build time via
GraphRAG / neo4j over *everything* (see Data Model). The two layers are two ways of
projecting that one graph — the toggle literally re-projects the same nodes.

- **EARTH (geographic projection / lit)** — dot-matrix globe on bone paper. Graph nodes
  that have coordinates (~979 places) are placed on the globe; denser dots form land;
  visited places glow. Travel arcs drawn between trip nodes. This is where *individual
  places* get their detail.
- **MIND (relational projection / bone palette)** — the same nodes recompose into a
  force-directed graph **on the same off-white paper** (not dark). **Projects are the
  labeled hubs**; everything else (trips, places, people, tech, concepts) hangs off them as
  clustered fine dots — the dandelion look. GraphRAG is what discovers the cross-links
  (e.g. a restaurant cluster lighting up around the project you were building while you ate
  there). Real structure (from `entities/` + `cs/` repos): an **AI-tools** cluster
  (Daimon, Cheerful, Lakbai, neo4j-graphrag), a **Ventures** cluster (Pod Play SEA, Kosmas,
  Magpie, Digital Wallet, Ping Pod), a **Life** cluster (scuba, snowboard, jiu-jitsu,
  travel), with **Carlos** bridging.
  - **Render rule:** do NOT label all ~979 places individually in Mind — that's noise.
    Labeled = projects (the hubs). The long tail is unlabeled clustered dots, revealed on
    hover/click. Per-place detail lives on Earth, not Mind.
  - **RULE (locked, revised 2026-06-05):** the Mind layer stays on the **bone/off-white
    palette** (`#c9c1ad` bg, oil-black `#2b2823` nodes/edges, faint sepia-gold hub glow) —
    NOT a dark/black background. Earth and Mind share one palette; the toggle is a
    re-layout of nodes, not a color inversion. (Earlier full-screen-night version reversed.)
  - **RULE (locked):** the graph is **purely abstract** — NO world-map silhouette, no
    continents behind it. Several mockups drifted into a map-ghost because a globe image
    was used as the gen reference; avoid that. Layout is force-directed, projects = labeled
    hubs, long tail = unlabeled dot clusters.
- **TOGGLE** — particle-dissolve animation: continents fly apart and reform as the graph.
  The signature moment of the site (one material, two states).

## Time Is Ambient, Not a Tool (Earth layer)

**The scrubber is dropped.** Time is atmosphere, not navigation. Your movement across
2024→2026 quietly auto-plays on a slow loop in the background — arcs drawing, pins
igniting on arrival — so the globe feels alive/breathing without any controls. The only
nod to time is an optional faint, **non-interactive** date stamp in a margin corner.

Primary navigation is **spatial**: rotate the globe, click places. The "alive /
real-time-ish" quality is preserved through the ambient loop + static-snapshot rebuilds,
not through a user-driven timeline.

## The Memory Field (Earth — zoomed interaction)

The signature interaction of the Earth layer. **Significance is encoded as gravity, never
as labels or loud pins** ("no HEY I LIKE THIS CAFE"). The dots are the material; their
*behavior* carries meaning. The metaphor is memory/recall: signal assembles out of noise as
you reach for it — "it's not how much you store, it's what assembles when you attend to it."

**Three states (must be SUBTLE — a little touch, not dots flying everywhere):**
1. **Resting** — the whole dot field has faint ambient life. Nothing shouts. Noteworthy
   spots are not visibly marked at rest.
2. **Approach** — as the camera/cursor nears a significant point, the dots there
   **gravitate inward and rise**, assembling into a soft peak (the depth/wave effect). A
   handful of dots cohering — restrained. Triggered by *proximity*, not constant motion.
3. **Hover / focus** — the cluster resolves to a point and information surfaces quietly.

**Gravity weight = `visitCount`** (already in place frontmatter; range 1 → 152). The cafe
visited 53× pulls harder than the one seen once. The field's behavior IS the real
life-data; no manual tagging needed for the *behavior*.

**Significance model: HYBRID**
- **Auto:** every place participates; gravity/assembly strength scales with `visitCount`.
  Frequents naturally rise; one-offs stay quiet background.
- **Curated:** a hand-picked subset carries a personal **one-line note** (a new optional
  `note:` field on those place entities) — the only copy Carlos writes.

**Hover content (restrained — ~"7 little things"):**
- Place name (primary).
- One quiet personal line (the curated `note`) — only on curated places.
- Small mono metadata: visit count, date range, category.
- No reviews, no ratings-shouting, no photos-by-default.

This **replaces the old `#08` side-panel** as the place-detail mechanism: hover-surfaced,
in-world, minimal — not a docked panel.

## Aesthetic Spec

- **Palette:** bone/khaki paper `#c9c1ad`, oil-black `#2b2823`, faded sepia accents
  (`#6b5e44`). Earth is lit; Mind is night. No glossy NASA earth, no blue, no neon.
- **Type:** monospace + a distinctive serif; wide tracking; technical labels; raw
  coordinates shown as data.
- **Frame:** diegetic instrument — bracket corners, margin coordinates, system-style
  labels (NieR menu DNA).
- **Texture:** film grain, faint scanlines, soft noise, worn/authored feel.

## Voice

Ambient fragments — short lines of Carlos's thinking surface diegetically in the frame
and on interaction, like system epigraphs. Sparse, poetic. Felt, never lectured.

## Data Model — GraphRAG over everything → static snapshot

The build pipeline produces ONE knowledge graph from *all* available signal, then exports
it to static JSON. Two stages:

**Stage 1 — Extraction (build time, offline, neo4j/GraphRAG):**
Ingest everything and resolve entities + relationships into a single graph:
- **Project source** — repos + docs (daimon, cheerful, lakbai, neo4j-graphrag,
  podplay-data) → README/CLAUDE.md/docs, surfacing tech, orgs, people, concepts.
- **Monorepo entities** — `entities/` projects/people/places/trips/activities + their
  `[[wikilink]]` relationships (reliable backbone).
- **Travel history / Google Maps / timeline data** — the raw movement + place visits that
  produced the 979 places (coordinates, visit dates, categories).
- **Activities** — stat-rich logs (e.g. skiing Niigata 2025: 22 sessions, 307.5 km).
- **`visitCount`** per place drives Memory-Field gravity (no new data needed). A new
  optional **`note:`** field on a curated subset carries the one-line personal text.
- GraphRAG discovers the *soft* cross-links the frontmatter doesn't encode (a place
  cluster ↔ the project being built during those visits; shared tech across projects).

**Stage 2 — Export:** flatten the graph to static JSON (nodes with type/coords/label/stats,
edges with type/weight). Site bakes it in. **neo4j is a build-time engine, never queried at
runtime.** Graduates to scheduled auto-rebuild later.

Source of truth: `/home/clsandoval/cs/monorepo/` + sibling repos in `~/cs/`.

> **Node types:** a node may have coordinates (→ appears on Earth), be relational-only
> (→ Mind), or both. The toggle re-projects the same node set between the two views.

## Proposed (made a call — confirm on resume)

- **Activities** (scuba, snowboard ~8yr, jujitsu ~1.5–2yr): placed on **Earth at real
  locations** with stat readouts from logs, AND as nodes in Mind. They're *somewhere*, so
  they earn pins.
- **Click behavior:** selecting a place/node opens a slim diegetic side-panel (mono,
  framed) — not a modal — with detail, stats, linked entities, photos. Stay "in the
  instrument."
- **Scope / phasing:** large build. Spec to carry full vision + a buildable **Phase-1
  slice**: Earth + dot-globe + timeline play + place panels, *before* the Mind layer +
  transition.

## Open / Undecided (resume here)

- [ ] Confirm the three "Proposed" calls above (activities placement, side-panel, phasing).
      [Note: side-panel #08 superseded by the Memory-Field hover.]
- [ ] Memory Field: tune the SUBTLETY (how many dots rise, how far, how fast) — needs a
      motion prototype; static mockups can only hint at it.
- [ ] Memory Field: which places get curated `note:` lines, and write them (Carlos).
- [ ] Confirm the Mind render rule (projects = labeled hubs; ~979 places unlabeled in Mind).
- [ ] Need a good **node-selected detail card on the bone palette** (the light attempt G5
      drifted off-brief; no clean light "card" comp exists yet).
- [ ] Pick the canonical Mind layout: overview (G1) vs domain-regions (G6) — or support both.
- [ ] What exactly is the **cloud design/build target**? (affects final artifact format)
- [ ] **Frontend** tech stack (likely three.js / react-three-fiber for the dot globe).
      [Graph extraction tech is decided: GraphRAG/neo4j at build time → static JSON.]
- [ ] **Raw travel data:** do we have the original Google Maps/timeline export, or only the
      derived `entities/places/` files? Affects how rich Stage-1 extraction can be.
- [ ] Content/copy checklist — the ambient fragments are Carlos-authored; need a list.
- [ ] Per-place / per-node panel content depth (photos? sourced from where?).
- [ ] How "real-time up until a month ago" maps to rebuild cadence (more load-bearing now
      that the scrubber is gone — aliveness rests on rebuild frequency).

## Mockups

Generated via nano-banana, pushed to Telegram 2026-06-05. (Garbled label text in images
is image-gen noise, not intended copy.)

Full 10-piece set spanning the whole concept (all in `assets/2026-06-05-globe-portfolio/`):

| # | File | Shows |
|---|------|-------|
| 01 | `earth-dotmatrix.png` | **CHOSEN** Earth treatment — dot-matrix globe |
| 01a | `earth-wireframe-rejected.png` | alt treatment (rejected) |
| 01b | `earth-inked-rejected.png` | alt treatment (rejected) |
| 02 | `mind-graph-overview.png` | **CHOSEN** Mind base (G1) — bone palette, real project hubs, Carlos bridging clusters |
| 02b | `mind-graph-domains.png` | strong alt (G6) — AI TOOLS / VENTURES / LIFE regions, most legible |
| 02c | `mind-graph-travel-work.png` | concept (G4) — project hubs ringed by cities visited while building them |
| 02d | `mind-graph-ventures.png` | detail (G3) — Pod Play SEA business web (people/places/orgs) |
| 03 | `toggle-transition.png` | signature toggle — globe re-laying-out into the graph |
| 06 | `06-boot-invocation.png` | entry/boot screen, globe forming, opening epigraph |
| 07 | `07-earth-ambient.png` | Earth in **ambient mode** — arcs breathing, NO scrubber, faint margin date (locked) |
| — | `07-play-my-life-scrubber-rejected.png` | earlier scrubber version (rejected — scrubber dropped) |
| 08 | `08-place-detail-panel.png` | slim diegetic place side-panel |
| 09 | `09-activity-readout.png` | activity telemetry (real Niigata ski log: 22 sessions / 307.5 km) |
| — | `mind-graph-*-mapghost.png` | atmospheric refs (G2/G7) — drifted to a world-map silhouette; off-rule, kept for mood |
| — | `*-dark-superseded.png` | the full-bleed-dark Mind comps — superseded by the off-white decision |
| — | `*-disjoint-rejected.png` | earliest Mind comps with the dark-panel-on-paper flaw (rejected) |

## Reference Anchors

- **NieR: Automata** UI — diegetic system-menus, warm bone/khaki, oil-black, single
  custom typeface, melancholic, decaying elegance.
- **Nous Research** (Hermes models) — eggshell/paper, black monospace, esoteric-technical,
  zine-like, anti-corporate.
