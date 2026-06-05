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
| Layers | **Two projections of ONE knowledge graph** — Earth (geographic/lit) + Mind (relational/dark), toggled |
| Graph build | **GraphRAG / neo4j at build time** over *everything* (repos, docs, travel, places, Maps data, activities, people) → export nodes+edges to static JSON. neo4j is an offline extraction engine, not a runtime server. |
| Globe treatment | **Dot-matrix** (chosen over wireframe / inked) — dots are the kinetic material |
| Timeline role | **Passive ambient playback** (scrubber DROPPED). Movement auto-plays on a slow loop; nav is spatial (rotate + click) |
| Aesthetic | **NieR: Automata × Nous Research** — diegetic instrument, esoteric-technical, authored |
| Voice / philosophy | **Ambient fragments** — sparse aphorisms in margins / as system messages, no manifesto page |
| Data freshness | **Static build-time snapshot** from monorepo `entities/` → JSON (nightly auto-rebuild later) |

## One Knowledge Graph, Two Projections

The site is built on a **single unified knowledge graph**, extracted at build time via
GraphRAG / neo4j over *everything* (see Data Model). The two layers are two ways of
projecting that one graph — the toggle literally re-projects the same nodes.

- **EARTH (geographic projection / lit)** — dot-matrix globe on bone paper. Graph nodes
  that have coordinates (~979 places) are placed on the globe; denser dots form land;
  visited places glow. Travel arcs drawn between trip nodes. This is where *individual
  places* get their detail.
- **MIND (relational projection / dark)** — the same nodes recompose into a force-directed
  graph in full-screen night. **Projects are the labeled hubs**; everything else (trips,
  places, people, tech, concepts) hangs off them as clustered fine dots — the dandelion
  look. GraphRAG is what discovers the cross-links (e.g. a restaurant cluster lighting up
  around the project you were building while you ate there).
  - **Render rule:** do NOT label all ~979 places individually in Mind — that's noise.
    Labeled = projects (the hubs). The long tail is unlabeled clustered dots, revealed on
    hover/click. Per-place detail lives on Earth, not Mind.
  - **RULE (locked):** the Mind layer is **full-screen night** — the *entire* instrument
    inverts to a warm near-black (`#1c1a17`), frame/margins/labels redrawn in bone/cream.
    It is NEVER a dark panel sitting inside the bone-paper frame (that reads disjoint —
    two palettes fighting). The graph is **purely abstract**: no world map, no continents,
    no Earth silhouette behind it. The toggle is therefore a full paper→night crossfade,
    not a box opening.
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
- [ ] Confirm the Mind render rule (projects = labeled hubs; ~979 places unlabeled in Mind).
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
| 02 | `mind-constellation.png` | Mind base layer — **full-bleed dark**, abstract graph (locked) |
| 03 | `toggle-transition.png` | signature toggle — globe dissolving into graph |
| 06 | `06-boot-invocation.png` | entry/boot screen, globe forming, opening epigraph |
| 07 | `07-earth-ambient.png` | Earth in **ambient mode** — arcs breathing, NO scrubber, faint margin date (locked) |
| — | `07-play-my-life-scrubber-rejected.png` | earlier scrubber version (rejected — scrubber dropped) |
| 08 | `08-place-detail-panel.png` | slim diegetic place side-panel |
| 09 | `09-activity-readout.png` | activity telemetry (real Niigata ski log: 22 sessions / 307.5 km) |
| 10 | `10-mind-node-fragment.png` | **CHOSEN (10c)** — Mind node selected, dense dandelion-cluster graph, full-bleed dark. Card/fragment text in render is gibberish image-gen noise; real copy will be clean. |
| 10alt | `10-mind-node-fragment-altB.png` | alt (10b) — cleaner/sparser graph, readable card. Kept as reference. |
| — | `*-disjoint-rejected.png` | earlier Mind comps with the dark-panel-on-paper flaw (rejected) |

## Reference Anchors

- **NieR: Automata** UI — diegetic system-menus, warm bone/khaki, oil-black, single
  custom typeface, melancholic, decaying elegance.
- **Nous Research** (Hermes models) — eggshell/paper, black monospace, esoteric-technical,
  zine-like, anti-corporate.
