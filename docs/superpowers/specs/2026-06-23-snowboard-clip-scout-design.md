# Snowboard Clip Scout — Design

**Date:** 2026-06-23
**Status:** Design — pending spike validation
**Branch:** tt-venue-feasibility-spike (will move to its own branch)

## Purpose

A Claude Code skill that ingests Insta360 X5 `.insv` 360° footage from a drive and
produces a **markdown storyboard** of proposed clips. Each proposed clip carries **when**
(in/out timecode) and **where** (reframe yaw/pitch/FOV in the 360 sphere), so it's
directly actionable in Insta360 Studio.

### v1 interaction model — divergent ideation around a peg

The runtime input is a **creative brief**, not a narrow filter. Typical v1 call:
*"Here's today's footage — give me every permutation of cool, striking, high-design-value
clips, with X as the peg."* The peg X is an anchor the spread orbits around (a rider, a
trick, a visual motif, a mood).

Claude's job is **divergent and generative**: scramble to propose many *distinct* clip
concepts, not merely list matching moments. Because the footage is 360, **the same moment
can spawn several clips** — different reframes, framings, and treatments are themselves the
permutations. Reframe is a creative axis, not just a "point at the action" step. The
storyboard is therefore a brainstorm of concepts (often multiple per moment), each with its
own reframe and rationale — the user cherry-picks from a wide spread.

The footage is raw, continuous, flowy — whole runs down a mountain with **no hard cuts**.
So this is not an edit-detector. It's a way for Claude to *navigate continuous 360 footage
like a person scrubbing a timeline*, recognize semantic moments, and write them up.

## Core principle: scripts are arms and legs, Claude is the brain

The scripts decide **nothing**. They are pure mechanical primitives — Claude's hands for
touching footage. All judgment (what's interesting, where to look, what to propose, how to
reframe) lives in Claude. This keeps the heuristics out of code (where they'd be brittle
on flowy footage) and in the agent (where context and intent live).

## Feasibility (researched 2026-06-23, see deep-research run wf_4513733c-49a)

Confirmed feasible on Linux, no Insta360 Studio, no proprietary SDK:

- `.insv` is a standard MP4/MOV container + dual-fisheye H.265 + AAC, with an Insta360
  metadata trailer appended at the end. **Rename `.insv` → `.mp4` and ffmpeg/ffprobe
  demux it directly.** No encryption.
- X5 (like X4) stores the two lenses as **two video streams** (`-map 0:v:0` / `0:v:1`).
- Dual-fisheye → equirectangular via ffmpeg's `v360` filter:
  `v360=dfisheye:e:ih_fov=<tuned>:yaw=-90:roll=180`. Visible seam, proxy-quality —
  exactly what scene-scouting needs.
- `ih_fov` is **per-camera and tuned empirically** (X4 documented at 189.1; X5 to be
  eyeballed on the spike). This is the one calibration knob — not hardcoded.
- Insta360 embeds a low-res `.lrv` proxy stream we can decode for near-free overview passes.
- Bonus (not used in v1): gyro/IMU + per-frame exposure live in the trailer, extractable
  via `exiftool -ee` or telemetry-parser if we later want stabilization or motion direction.

## Architecture

Three stages. Stage 0 tools are dumb; Stage 1 is Claude driving them; Stage 2 is output.

### Stage 0 — Tools (pure ffmpeg, no LLM, no decisions)

Four CLI primitives. Each is independently runnable and testable. Proxies/thumbnails are
cached on disk, git-ignored, regenerable.

| Tool | Input | Output |
|------|-------|--------|
| `proxy` | `.insv` path | cached low-res equirect proxy `.mp4` (rename→mp4, `v360 dfisheye:e`, tuned `ih_fov`). Prefers embedded `.lrv` for speed. |
| `timeline` | proxy, interval N (default ~15s) | contact-sheet thumbnails across the whole file + a `change.csv` of `scdet` visual-change score over time (the navigation hint) |
| `montage` | proxy, start, end, interval | finer contact sheet of one window Claude chose to zoom into |
| `frame` | proxy, timestamp, yaw, pitch, fov | one rectilinear reframed still — lets Claude confirm *where* the action sits in the sphere and read off reframe params |

`change.csv` is a **hint, not a gate** — nothing is thresholded away. Every part of every
file remains reachable; the curve only orders Claude's attention so 10–20h is tractable.

### Stage 0 → Stage 1 contract

The filesystem is the interface: per source file, a cached proxy, a set of timeline
thumbnails, and `change.csv`. No bespoke index format beyond what the tools emit on disk;
Claude reads the directory. (If this proves clumsy in the spike, add a thin `manifest.json`
listing proxies + thumbnail paths — deferred until shown necessary.)

### Stage 1 — Claude drives (the skill)

The skill (`SKILL.md`) runs the loop, given a creative brief (peg X + the kind of clips wanted):

1. Ensure proxies + timelines exist for the target footage (invoke Stage 0 tools).
2. Scan the timeline contact sheets for an overview of each file.
3. Use `change.csv` to prioritize where to look first.
4. Drill into promising windows with `montage`; use `frame` to explore *multiple* reframes
   of a moment — different yaw/pitch/FOV give different clips.
5. Ideate divergently against the brief: generate many distinct clip concepts, orbiting the
   peg. Same moment may yield several treatments. Nothing is auto-included or auto-excluded
   by code — Claude is the editorial brain.
6. Write the storyboard as a spread of concepts.

Vision cost scales with how much Claude chooses to drill, not raw hours — the overview is
coarse, the drilling is selective.

### Stage 2 — Storyboard output

A markdown doc written into the repo — a spread of clip concepts orbiting the peg, often
several treatments of the same moment. Per proposed clip:

- concept title + the peg it serves
- source file
- in/out timecode
- suggested reframe (yaw / pitch / FOV)
- a thumbnail (reframed still from `frame`)
- one-line description
- why it's striking / high design value for the brief

You review, cherry-pick, and do the real reframe export in Insta360 Studio. (Auto-export
of finished reframed clips via ffmpeg is a possible v2 — deferred.)

## Layout

```
projects/clip-scout/
├── SKILL.md            # the agent loop (Stage 1 + 2)
├── tools/              # proxy, timeline, montage, frame (Stage 0)
├── cache/              # proxies + thumbnails (git-ignored)
└── storyboards/        # generated markdown output
```

Footage stays on the drive. Only the storyboard markdown is meant to live in git;
`cache/` is regenerable and ignored.

## Deliberately NOT building (YAGNI)

- **No custom `.insv` parser** — rename + ffmpeg.
- **No Insta360 MediaSDK** — gated behind approval, overkill for proxy quality.
- **No scene-cut detection** — footage is continuous; cut detection finds nothing.
- **No ML motion model** — `scdet`'s raw score is a good-enough navigation hint.
- **No motion thresholding/auto-selection** — Claude judges; code doesn't filter.
- **No auto reframe-export in v1** — Insta360 Studio does the final reframe.
- **No IMU/gyro pipeline in v1** — available later if reframe-direction needs it.

## Feasibility spike (gate before building the skill)

Run on **one real X5 `.insv`** before committing to the full build:

1. `ffprobe` it — confirm the two-track dual-fisheye layout and codecs.
2. Rename → `.mp4`, run `v360=dfisheye:e`, **tune `ih_fov`** until one frame looks right;
   produce a watchable low-res equirect proxy.
3. Generate a timeline contact sheet + `change.csv` over the file.
4. Eyeball: are the equirect thumbnails good enough for Claude to judge what's happening
   and roughly where in the sphere?
5. Use `frame` to pull a reframed still at a guessed yaw/pitch — confirm reframe control works.

**Pass:** thumbnails are judge-able and reframe control works → build the skill.
**Fail:** stitch/thumbnails unusable → fall back to equirect-when-only (propose timestamps,
you reframe in Studio), or you export flat proxies from Studio and we treat them as normal
video.

## Open questions (resolve during spike/build)

- Correct `ih_fov` for X5 (start ~190, tune).
- Timeline interval N — coarse enough to be cheap, fine enough not to miss a 2s trick.
  Likely 10–15s for overview, with `montage` at 1–2s for drilling.
- Whether the filesystem-as-contract is enough or a `manifest.json` is warranted.
