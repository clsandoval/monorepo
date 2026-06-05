# The Globe — Interactive Portfolio (Design Draft v2)

> **STATUS: DRAFT — converged on a consolidated direction 2026-06-05.**
> Earlier exploration (two-layer Earth/Mind toggle, a separate knowledge-graph layer,
> a timeline scrubber) was explored and **dropped** in favor of the single bare-UI
> surface described below. Rejected/superseded mockups are kept in `assets/` with
> `-rejected` / `-superseded` / `-dark` / `-mapghost` suffixes for provenance.
>
> **Deliverable is NOT code.** This session produces a *design artifact bundle*
> (this spec + mockups) to hand off to a cloud design/build tool.

## Premise

A personal portfolio that is a single interactive instrument, not a set of pages. The
visitor lands on a dot-matrix globe that *is* Carlos — the places he returns to and the
work he's built, rendered as **terrain**. It mirrors the through-line of his work
(Daimon, Lakbai, neo4j-graphrag): convergent systems that turn messy information into
something navigable. Here the move is pointed at himself, and the result is deliberately
**bare** — no chrome, no menus, just the field and what rises from it.

## The Whole Site in One Paragraph

You arrive; the dots briefly assemble into a word, then settle into a **dot-matrix globe
on warm bone paper** (the "terrain on the curve" look — see `HERO-terrain-on-curve.png`).
Scattered across its surface are **peaks**: your projects (taller, labeled) and your
frequent places (soft swells). You **drift freely** — drag to rotate, scroll to zoom.
As you approach a peak its dots **rise and assemble** (the Memory Field); hovering resolves
a quiet in-world card. There is no other UI. Your philosophy surfaces occasionally as a
sparse ambient fragment. That's the entire site.

## Decisions Locked

| Decision | Choice |
|----------|--------|
| Structure | **Single bare-UI globe.** No pages, no menus, no chrome. The globe is everything. |
| Canonical look | **"Terrain on the curve"** (P2 / `HERO-terrain-on-curve.png`) — M1-style dots, soft peaks, globe curvature. |
| What's on it | **Peaks at real locations** — projects (taller, labeled) + frequent places (soft swells). |
| Significance | **The Memory Field** — encoded as *gravity/height*, never loud labels. Height ∝ `visitCount` (places) / weight (projects). Dots rise + assemble on approach; hover → quiet card. |
| Movement | **Free drift** — drag to rotate/pan, scroll to zoom. No buttons. ("No navigation" = no chrome.) |
| Entry | **Dots → words moment.** On load, dots assemble into a name/epigraph, disperse, settle into the globe. One flourish, then bare. |
| Aesthetic | **NieR: Automata × Nous Research** — bone/off-white palette, diegetic margin marks only, grain. |
| Voice | **Ambient fragments** — sparse aphorisms, no manifesto page. |
| Data | **Static build-time snapshot** from `entities/` + `cs/` repos. |
| DROPPED | the two-layer Earth/Mind toggle; the separate knowledge-graph layer; the timeline scrubber. |

## The Surface

- **Material:** a dot-matrix globe. Dots are oil-black (`#2b2823`) on bone paper
  (`#c9c1ad`); faint sepia-gold glow only at focal points. The globe shows its
  **curvature** (P2), not a flat patch.
- **Peaks = content.** Everything meaningful rises out of the plane:
  - **Projects** — taller peaks at the location they were built, with a small monospace
    label (CHEERFUL, POD PLAY SEA, DAIMON, LAKBAI, NEO4J-GRAPHRAG…).
  - **Frequent places** — soft swells, unlabeled at rest, height ∝ `visitCount`.
  - **One-off places** — flat background dots.
- **Bare UI:** the only persistent interface is the diegetic frame — bracket corner marks
  and small monospace coordinates/labels in the margins. No nav, no buttons, no panels at
  rest.

## The Memory Field (the core interaction)

Significance is **gravity, not labels** ("no HEY I LIKE THIS CAFE"). The metaphor is
memory/recall: signal assembles out of noise as you reach for it — *"it's not how much you
store, it's what assembles when you attend to it."* Three states, all **subtle** (a little
touch, never dots flying everywhere):

1. **Resting** — faint ambient life across the field; nothing marked.
2. **Approach** — as you drift near a point, its dots **gravitate inward and rise** into a
   soft peak (the depth/wave effect). Triggered by proximity. See `memoryfield-peak.png`,
   `memoryfield-relief.png` (shows real height), `memoryfield-assemble.png` (gathering),
   `memoryfield-wave.png` (ripple).
3. **Hover / focus** — the peak resolves and a slim **in-world card** appears on the same
   bone paper (thin bracket frame, NOT a dark box): name + one quiet personal line + small
   mono metadata (visit count / dates / category for places; a line + stats for projects).
   See `memoryfield-hover.png`, `project-focus-card.png`.

**Significance model = HYBRID:** auto height from `visitCount` (range 1 → 152, already in
data) for every place; a curated subset of places + the projects carry a hand-written
one-line `note:`.

## Entry: Dots → Words

On load, the particle system assembles the dots into a word (Carlos's name, or an
opening epigraph in his voice), holds, disperses, and resolves into the globe. The single
authored flourish. The same particle system powers the Memory-Field rises — one material,
used for entry and for terrain.

## Aesthetic

- **Palette:** bone/off-white `#c9c1ad`, oil-black dots `#2b2823`, faded sepia accents
  (`#6b5e44`). One palette only — no dark mode (the dark-Mind idea was reversed).
- **Type:** monospace + a distinctive serif; wide tracking; raw coordinates as data.
- **Frame:** diegetic instrument — bracket corners, margin coordinates. Minimal.
- **Texture:** film grain, faint scanlines, worn/authored feel.
- **Reference anchors:** NieR: Automata UI (diegetic menus, bone/khaki, melancholic);
  Nous Research / Hermes (eggshell paper, monospace, esoteric-technical, anti-corporate).

## Data Model (static build-time snapshot)

A build step reads source and emits clean JSON the site bakes in (no runtime server):

- **Places** — `coordinates`, `visits[]`, `visitCount`, `category`, `name`
  (979 files, 970 with dates, 2024–2026). `visitCount` → peak height / Memory-Field gravity.
- **Curated `note:`** — new optional field on a hand-picked subset of places (and on
  projects) carrying the one-line personal text surfaced on hover.
- **Projects** — name + a **geographic anchor** (where it was built) + a short line + stats.
  Source: `entities/projects/` + the `cs/` repos (daimon, cheerful, lakbai, neo4j-graphrag,
  podplay-data). NOTE: most projects lack an explicit location today — assigning each a
  geographic anchor is an open task (see below).
- **Trips / activities** — available for context/stats (e.g. Niigata ski: 22 sessions,
  307.5 km) but secondary now that the graph layer is gone.

> GraphRAG / neo4j is now **optional**, not core — it was the engine for the dropped
> knowledge-graph layer. It could still be used at build time to *auto-place* projects
> (centroid of places visited during a project's active window), but a manual anchor per
> project is simpler and sufficient.

## Open / Undecided (resume here)

- [ ] **Project geographic anchors** — assign each project a point on the globe (most have
      no location in frontmatter). Manual list, or GraphRAG auto-placement?
- [ ] **Cloud design/build target** — which tool? (affects final artifact format)
- [ ] **Frontend tech** — likely three.js / react-three-fiber for the particle globe +
      peaks + Memory-Field motion.
- [ ] **Motion tuning** — the Memory-Field subtlety (how many dots rise, how far, easing)
      can only be proven in a motion prototype; stills only hint.
- [ ] **Peak shape** — soften the cones in `projects-as-peaks.png` toward the rounded swells
      of the HERO/`memoryfield-peak.png`.
- [ ] **Curated `note:` copy** — pick the places/projects that get a line, and write them.
- [ ] **Entry word/epigraph** — what the dots spell on load.
- [ ] **Rebuild cadence** — how "alive / real-time-ish" maps to snapshot frequency.

## Mockups (current bundle)

Living set in `assets/2026-06-05-globe-portfolio/`. Garbled small text in renders is
image-gen noise, not intended copy.

| File | Role |
|------|------|
| `HERO-terrain-on-curve.png` | **CANONICAL look** (P2) — bare globe, peaks on the curve |
| `memoryfield-peak.png` | M1 — the core gravity-rise (chosen depth style) |
| `memoryfield-relief.png` | side-angle proving the dots have height (+4.2mm) |
| `memoryfield-assemble.png` | approach state — dots gathering inward |
| `memoryfield-hover.png` | hover card layout (name / line / metadata) |
| `memoryfield-wave.png` | subtle ripple / breathing state |
| `projects-as-peaks.png` | projects at different points, labeled (peaks need softening) |
| `project-focus-card.png` | one project in focus + in-world card |
| `earth-dotmatrix.png` | original dot-matrix globe study |
| `06-boot-invocation.png` | entry/epigraph mood (feeds the dots→words moment) |
| `09-activity-readout.png` | activity telemetry style (real Niigata ski stats) |
| `*-rejected / *-superseded / *-dark / *-mapghost` | provenance of dropped directions (two-layer toggle, dark Mind, knowledge-graph, scrubber) |
