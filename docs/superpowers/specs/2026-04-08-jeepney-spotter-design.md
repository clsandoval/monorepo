# Jeepney Spotter — Video-Based Jeepney Route Reconstruction

**Date:** 2026-04-08
**Status:** Draft
**Project:** `projects/jeepney-spotter/`

## Problem

The `mm-transit-routes-reverse` loop compiled 604 jeepney routes into a GTFS feed, but 97% lack polyline geometry — they have names, endpoints, and fares but no route shapes. Every successful informal transit mapping project globally (Digital Matatus, WhereIsMyTransport, Trufi) required human riders with GPS phones. No automated system exists for extracting transit routes from video.

## Idea

Process YouTube dashcam and street-level footage of Metro Manila to detect jeepneys, read their route placards, and geolocate the frames — building a dataset of structured observations that can be clustered into full route polylines.

## Architecture

### Pipeline Overview

Five sequential stages per video:

```
EXTRACT → GEOLOCATE → DETECT → IDENTIFY → ASSEMBLE
frames     VLM anchor   jeepneys   OCR route    observations
from video frames       in frame   placards     into dataset
```

### Stage 1 — Frame Extraction

- Download video via `yt-dlp`
- Extract frames with `ffmpeg` at configurable sample rate
- V1: 1 frame per minute (60 frames from 1 hour of footage)
- Output: PNG frames named `{video_id}_f{timestamp_s}.png`
- Runs on any machine, no GPU needed

### Stage 2 — Geolocation (VLM)

For each frame, call a vision model API to identify location from visual clues.

**Prompt strategy:** Ask the model to identify visible landmarks, street signs, business names, and road features in a Metro Manila dashcam frame, then estimate lat/lon with confidence score.

**V1 approach:** Send each frame to both Claude and Gemini vision APIs. Take the higher-confidence result, or average if both are confident. ~120 API calls for 60 frames.

**Expected hit rate:** 40-60% of frames will have enough visual clues for a usable geolocation. Frames of blank roads, tunnels, or dense traffic with no signage return low confidence and are skipped.

**V2 approach (Approach 3 — Sparse Anchoring):** For dense video (1fps), geolocate only anchor frames every 10-15 seconds. Interpolate intermediate positions along the OSM road network graph between anchors. Far fewer VLM calls, more accurate continuous trajectories.

### Stage 3 — Jeepney Detection

Detect all jeepneys present in each frame.

**V1 approach:** Use a vision API (Claude or Gemini) to identify and return bounding boxes of all jeepneys. ~60 API calls.

**V2 approach:** Use SAM 3 on cloud GPU (RunPod, Replicate) with text prompt "jeepney" to generate high-quality segmentation masks on a training subset (~5,000 frames). Distill into a lightweight YOLO-class detector. Deploy the small model on a cheap cloud endpoint for scale processing.

### Stage 4 — Route Identification (OCR)

For each detected jeepney bounding box:

1. Crop the jeepney region from the frame
2. Send cropped image to vision API: read the route placard text (the windshield/side sign showing route name, e.g., "CUBAO - DIVISORIA")
3. Normalize the raw text (uppercase, trim whitespace, standardize separators)
4. Fuzzy-match against the 604 known routes from the existing `mm-transit-routes-reverse` GTFS dataset

**Scope:** Placard text only. LTFRB body numbers and T-series codes are too small and side-mounted to read reliably from dashcam-distance footage.

**Unmatched placards** are logged separately — they may represent routes not in the existing database and are valuable for expanding route coverage.

### Stage 5 — Assembly

Combine outputs from stages 2-4 into the observation schema. Filter out entries below confidence thresholds. Write to JSONL dataset file and generate a quality report.

## Data Model

### Observation Schema

Each row is one jeepney sighting:

| Field | Type | Description |
|-------|------|-------------|
| `observation_id` | string | `{video_id}_{frame_ts}_{jeepney_idx}` |
| `source_video` | string | YouTube video ID |
| `frame_timestamp_s` | int | Seconds into video |
| `frame_path` | string | Path to extracted frame PNG |
| `lat` | float | Estimated latitude |
| `lon` | float | Estimated longitude |
| `geo_confidence` | float | 0-1, from VLM |
| `geo_landmarks` | string[] | Clues used for geolocation |
| `placard_text_raw` | string | Raw OCR output from placard |
| `placard_text_clean` | string | Normalized (uppercase, trimmed) |
| `matched_route` | string | Matched route from GTFS dataset, null if no match |
| `match_confidence` | float | Fuzzy match score |
| `bbox` | int[4] | Bounding box in frame `[x1, y1, x2, y2]` |
| `detection_confidence` | float | From detector |

### Route Matching

The fuzzy matcher draws from existing `mm-transit-routes-reverse` data:

- 604 jeepney route names with origin-destination pairs
- LTFRB T-series codes where known
- Common aliases (e.g., "QUIAPO" vs "STA. CRUZ" for overlapping terminal areas)

Match thresholds: score ≥0.80 = auto-match, 0.50-0.79 = candidate (logged for review), <0.50 = unmatched. Unmatched placards are flagged in `unmatched_placards.json` for manual review and potential database expansion.

## Project Structure

```
projects/jeepney-spotter/
├── README.md
├── pyproject.toml              # uv project, Python 3.12+
├── src/
│   ├── extract.py              # Stage 1: yt-dlp + ffmpeg frame extraction
│   ├── geolocate.py            # Stage 2: VLM geolocation API calls
│   ├── detect.py               # Stage 3: jeepney detection (vision API or SAM 3)
│   ├── ocr.py                  # Stage 4: placard OCR + fuzzy route matching
│   ├── assemble.py             # Stage 5: combine into observations.jsonl
│   └── pipeline.py             # Orchestrator: runs stages 1-5 sequentially
├── data/
│   ├── frames/                 # Extracted PNGs (gitignored)
│   ├── routes.json             # Copied from mm-transit-routes-reverse for matching
│   └── output/                 # observations.jsonl, quality_report.json (gitignored)
└── v1/
    ├── input.txt               # YouTube URL(s) for V1 run
    └── results/                # V1 output committed to repo for reference
```

## Dependencies

- `yt-dlp` — video download
- `ffmpeg-python` — frame extraction
- `anthropic` — Claude vision API (geolocation + OCR)
- `google-genai` — Gemini vision API (cross-reference geolocation)
- `thefuzz` — fuzzy string matching for route placards
- `Pillow` — image cropping for jeepney bounding boxes

No ML frameworks for V1. All model inference is cloud API-based.

## Compute & Infrastructure

All inference runs in the cloud — no local GPU.

**V1:** Pure API calls. ~200-260 vision API calls total. Estimated cost: $2-5.

**V2:** Cloud GPU (RunPod, Replicate, or similar) for SAM 3 labeling and lightweight model training. Deployed model endpoint for scale inference.

## CLI Interface

```
python -m src.pipeline --video "YOUTUBE_URL" --sample-rate 60 --output data/output/
```

Runs all 5 stages sequentially. Each stage reads the previous stage's output. Stages are idempotent — re-running skips already-processed frames (keyed by `observation_id`).

## V1 Scope

- **Input:** 1 YouTube video (user-supplied), 1 hour of dashcam footage from Metro Manila
- **Processing:** 60 frames (1 per minute), each run independently through all stages
- **Output:**
  - `observations.jsonl` — all jeepney sightings with geolocation, placard reading, route match
  - `quality_report.json` — hit rates per stage
  - `unmatched_placards.json` — placard readings that didn't match a known route

### V1 Success Criteria

| Stage | Metric | Viable (proceed) | Marginal (investigate) | Kill (rethink) |
|-------|--------|-------------------|------------------------|----------------|
| Geolocation | % frames with confident location (>0.5) | >40% | 20-40% | <20% |
| Detection | % frames with ≥1 jeepney detected | >30% | 15-30% | <15% |
| OCR | % detected jeepneys with readable placard | >25% | 10-25% | <10% |
| Matching | % readable placards matching a known route | >50% | 25-50% | <25% |

**End-to-end success:** At least 5-10 high-confidence observations — geolocated, detected, placard read, route matched — that can be plotted on a map and visually verified against known route paths.

## V2 Roadmap (contingent on V1 viability)

1. **Dense video processing** — 1fps sampling, implement sparse anchoring + OSM road network interpolation (Approach 3)
2. **SAM 3 distillation** — label ~5,000 frames with SAM 3 on cloud GPU → train YOLO-based jeepney detector → deploy on cheap endpoint
3. **Route reconstruction** — cluster observations by matched route, snap to OSM road network, produce polyline geometries
4. **GTFS export** — generate `shapes.txt` entries for the 604 jeepney routes in the existing `mm-transit-routes-reverse` feed
5. **Visualization** — heatmap web app showing observation density and reconstructed routes

## Prior Art

No existing system extracts transit routes from video. All successful informal transit mapping (Digital Matatus/Nairobi, WhereIsMyTransport/Cape Town, Trufi Association) required human riders with GPS phones.

SAM 3 (Nov 2025) enables text-prompted vehicle segmentation and tracking. VLMs (Claude, Gemini) can geolocate street-level imagery from visible landmarks. This pipeline combines both capabilities in a novel way.

Existing datasets with the geometry gap:
- Sakay.ph GTFS (GitHub): 296-349 routes, frozen since 2020
- TUMI Datahub Manila GTFS: same data, frozen July 2020
- OSM: only 23 of 400+ jeepney routes have geometric relations
- LTFRB franchise database: not publicly downloadable
