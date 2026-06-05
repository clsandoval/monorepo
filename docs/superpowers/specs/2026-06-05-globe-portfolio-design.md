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
| Layers | **Two: Earth (outer/lit) + Mind (inner/dark)**, toggled |
| Globe treatment | **Dot-matrix** (chosen over wireframe / inked) — dots are the kinetic material |
| Timeline role | **Passive ambient playback** (scrubber DROPPED). Movement auto-plays on a slow loop; nav is spatial (rotate + click) |
| Aesthetic | **NieR: Automata × Nous Research** — diegetic instrument, esoteric-technical, authored |
| Voice / philosophy | **Ambient fragments** — sparse aphorisms in margins / as system messages, no manifesto page |
| Data freshness | **Static build-time snapshot** from monorepo `entities/` → JSON (nightly auto-rebuild later) |

## The Two Layers, One Material

- **EARTH (outer / lit)** — dot-matrix globe on bone paper. ~979 geo-located places
  rendered as dots; denser dots form land; visited places glow brighter. Travel arcs
  drawn between trip nodes.
- **MIND (inner / dark)** — the same dots recompose into a force-directed knowledge-graph
  constellation: projects, ideas, people, philosophy as nodes. Going inward darkens the
  scene.
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

## Data Model (build-time snapshot)

Build step crawls `entities/` and emits clean JSON:
- **places** — `coordinates`, `visits[]`, `visitCount`, `category`, `name` (979 files, 970 with dates, 2024–2026)
- **trips** — `dates`, `countries`, `locations`, flight routes → travel arcs (22 files)
- **activities** — stat-rich logs (e.g. skiing Niigata 2025: 22 sessions, 307.5 km)
- **projects / ideas / people** — entity nodes + `[[wikilink]]` relationships → Mind graph

Source of truth: `/home/clsandoval/cs/monorepo/entities/`. Sibling repos in `~/cs/`
(daimon, cheerful, lakbai, neo4j-graphrag, podplay-data) are the project subjects.

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
- [ ] What exactly is the **cloud design/build target**? (affects final artifact format)
- [ ] Tech stack recommendation (likely three.js / react-three-fiber for the dot globe).
- [ ] Content/copy checklist — the ambient fragments + any credo text are Carlos-authored;
      need a list of what to write.
- [ ] Per-place / per-node panel content depth (photos? sourced from where?).
- [ ] How "real-time up until a month ago" maps to rebuild cadence.

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
