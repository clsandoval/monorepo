# Jeepney Spotter Pipeline — V1 Cloud-Only Spec

**Date:** 2026-04-10
**Status:** Draft
**Base design:** `docs/superpowers/specs/2026-04-08-jeepney-spotter-design.md`
**Output location:** `projects/jeepney-spotter/`

---

## Problem

The `mm-transit-routes-reverse` loop produced 609 canonical jeepney routes for Metro Manila, but **587 (97%) lack polyline geometry**. They have names, endpoints, and fares — no route shapes. Every successful informal transit mapping project (Digital Matatus, WhereIsMyTransport, Trufi) required human riders with GPS phones. No automated system exists for extracting transit routes from video.

The existing design spec (`2026-04-08-jeepney-spotter-design.md`) describes a 5-stage pipeline that processes YouTube dashcam footage to detect jeepneys, read route placards, and geolocate frames — producing structured observations that can later be clustered into route polylines.

**This spec** refines that design into a concrete, fully cloud-executed V1 pipeline with zero local dependencies.

---

## Chosen Approach: Lean Cloud Pipeline

A single Python project (`projects/jeepney-spotter/`) that runs entirely on cloud compute. All ML inference via cloud APIs (Anthropic Claude, Google Gemini). Video/frame processing via standard tools (yt-dlp, ffmpeg) running inside a Docker container on the cloud.

### Why this approach

- **Cloud-only:** No local GPU, no local machine. Runs on GitHub Actions, a cloud VM, Fly.io, or any Docker host.
- **Lean:** Minimal infrastructure. No message queues, no serverless functions, no managed ML endpoints. One container, one CLI command.
- **Validation-first:** V1 exists to test viability thresholds. If VLM geolocation doesn't work, no amount of infra will help. Ship the experiment fast.

### What this is NOT

- Not a production pipeline (no autoscaling, no job queues, no monitoring)
- Not a real-time system
- Not a training pipeline (no model fine-tuning, no custom detectors)

---

## Pipeline Architecture

Five sequential stages. Each stage reads the previous stage's output. All stages are idempotent — re-running skips already-processed items.

```
┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ EXTRACT  │───▶│ GEOLOCATE │───▶│  DETECT  │───▶│   OCR    │───▶│ ASSEMBLE │
│ frames   │    │ VLM+maps  │    │ jeepneys │    │ placards │    │ observations│
└──────────┘    └───────────┘    └──────────┘    └──────────┘    └──────────┘
  yt-dlp +        Claude +         Claude +        Claude +        Python
  ffmpeg          Gemini           Gemini           Gemini         JSON merge
```

### Stage 1 — Frame Extraction

- Download video via `yt-dlp` (runs inside container)
- Extract frames via `ffmpeg` at configurable sample rate
- **V1 default:** 1 frame per 30 seconds (120 frames from 1 hour of footage)
- Output: `data/frames/{video_id}/{video_id}_f{timestamp_s}.png`
- Metadata sidecar: `data/frames/{video_id}/manifest.json` — maps frame filenames to timestamps, video metadata

**Design choice — 30s vs 60s sampling:**
The original spec used 1 frame/minute (60 frames). We use 30s to increase observation density while staying within reasonable API cost (~$4-8 per video). Configurable via `--sample-rate` flag.

### Stage 2 — Geolocation (VLM)

For each extracted frame, call vision model APIs to estimate geographic coordinates from visible clues.

**Prompt strategy:** Structured prompt asking the model to:
1. List all visible text (street signs, business names, building labels)
2. Identify visible landmarks or distinctive features
3. Estimate the cross-street or intersection
4. Return lat/lon estimate with confidence score (0.0–1.0)
5. Return a `reasoning` field explaining the geolocation logic

**Dual-model approach:** Send each frame to both Claude (Sonnet) and Gemini (Flash). Take the response with higher confidence. If both are confident (>0.6) and disagree by >500m, log as conflicting and take the one with more specific landmark references.

**Output:** `data/geo/{video_id}/geo_results.jsonl` — one line per frame with lat, lon, confidence, landmarks, reasoning.

**Cost envelope:** ~240 API calls for 120 frames (2 models × 120). At ~$0.01-0.02 per vision call, ~$2.40-4.80 per video.

### Stage 3 — Jeepney Detection (VLM)

For each frame, detect all jeepneys present and return bounding boxes.

**Prompt strategy:** Ask the vision model to identify all jeepneys in the frame, returning:
1. Count of jeepneys visible
2. For each: bounding box `[x1, y1, x2, y2]` in pixel coordinates
3. Approximate distance (near/mid/far) — far jeepneys won't have readable placards
4. Confidence score per detection

**Single-model approach (V1):** Use Claude Sonnet only. Gemini cross-reference not needed for detection — the task is simpler than geolocation.

**Output:** `data/detections/{video_id}/detections.jsonl` — one line per frame with list of detected jeepneys.

**Cost envelope:** ~120 API calls, ~$1.20-2.40 per video.

### Stage 4 — Route Identification (OCR)

For each detected jeepney with distance = "near" or "mid":
1. Crop the bounding box region from the source frame (using Pillow)
2. Send cropped image to vision API with prompt to read route placard text
3. Normalize raw text (uppercase, trim, standardize separators like `–`, `-`, `→`)
4. Fuzzy-match against the 609 canonical routes from `canonical-jeepney-routes.json`

**Fuzzy matching tiers:**
- Score ≥ 0.80 → auto-match (high confidence)
- Score 0.50–0.79 → candidate match (logged for review)
- Score < 0.50 → unmatched (logged separately)

**Route reference data:** Copy `loops/mm-transit-routes-reverse/raw/canonical-jeepney-routes.json` into `projects/jeepney-spotter/data/routes.json` as the matching dictionary. Extract just route names, origin/destination pairs, and aliases for the fuzzy matcher.

**Output:** `data/ocr/{video_id}/ocr_results.jsonl` — one line per cropped jeepney with raw text, clean text, matched route, match score.

**Cost envelope:** Variable — depends on detection count. Estimate 20-60 crops per video, ~$0.40-1.20.

### Stage 5 — Assembly

Pure Python. No API calls. Joins outputs from stages 2-4 into the final observation schema.

For each frame:
1. Load geo result (stage 2)
2. Load detections (stage 3)
3. For each detection, load OCR result (stage 4)
4. Join by `video_id + frame_timestamp_s + jeepney_idx`
5. Apply confidence filters: drop observations where geo_confidence < 0.3 OR detection_confidence < 0.3
6. Write to `data/output/{video_id}/observations.jsonl`

**Additional outputs:**
- `quality_report.json` — hit rates per stage, overall funnel metrics
- `unmatched_placards.json` — placard texts that didn't match any known route
- `high_confidence_observations.geojson` — GeoJSON of observations with geo_confidence > 0.5 AND match_confidence > 0.5 (for quick map visualization)

---

## Observation Schema

Each row is one jeepney sighting:

| Field | Type | Description |
|-------|------|-------------|
| `observation_id` | string | `{video_id}_{frame_ts}_{jeepney_idx}` |
| `source_video` | string | YouTube video ID |
| `frame_timestamp_s` | int | Seconds into video |
| `frame_path` | string | Relative path to extracted frame PNG |
| `lat` | float | Estimated latitude |
| `lon` | float | Estimated longitude |
| `geo_confidence` | float | 0.0–1.0 |
| `geo_model` | string | Which model provided the geo (claude/gemini) |
| `geo_landmarks` | string[] | Visible clues used for geolocation |
| `geo_reasoning` | string | Model's reasoning for the estimate |
| `placard_text_raw` | string | Raw OCR output from placard |
| `placard_text_clean` | string | Normalized (uppercase, trimmed) |
| `matched_route_id` | string | Route ID from canonical dataset, null if no match |
| `matched_route_name` | string | Human-readable route name |
| `match_confidence` | float | Fuzzy match score |
| `bbox` | int[4] | Bounding box `[x1, y1, x2, y2]` |
| `detection_confidence` | float | From detector model |
| `detection_distance` | string | near/mid/far |

---

## Project Structure

```
projects/jeepney-spotter/
├── README.md
├── pyproject.toml                 # uv project, Python 3.12+
├── Dockerfile                     # Bundles yt-dlp + ffmpeg + Python deps
├── src/
│   └── jeepney_spotter/
│       ├── __init__.py
│       ├── cli.py                 # CLI entry point (click or argparse)
│       ├── extract.py             # Stage 1: yt-dlp + ffmpeg
│       ├── geolocate.py           # Stage 2: dual-model VLM geolocation
│       ├── detect.py              # Stage 3: jeepney detection
│       ├── ocr.py                 # Stage 4: placard OCR + fuzzy matching
│       ├── assemble.py            # Stage 5: join + filter + output
│       ├── models.py              # Pydantic models for observation schema
│       ├── prompts.py             # All VLM prompt templates
│       ├── matching.py            # Fuzzy route matching logic
│       └── config.py              # Configuration (API keys, paths, thresholds)
├── tests/
│   ├── test_extract.py
│   ├── test_geolocate.py
│   ├── test_detect.py
│   ├── test_ocr.py
│   ├── test_assemble.py
│   └── test_matching.py
├── data/
│   ├── routes.json                # Copied from mm-transit-routes-reverse canonical
│   ├── frames/                    # Extracted PNGs (gitignored)
│   ├── geo/                       # Stage 2 output (gitignored)
│   ├── detections/                # Stage 3 output (gitignored)
│   ├── ocr/                       # Stage 4 output (gitignored)
│   └── output/                    # Final observations (gitignored)
└── v1/
    ├── input.txt                  # YouTube URL(s) for V1 validation run
    └── results/                   # V1 output committed for reference
```

---

## Dependencies

```
# Core
anthropic          # Claude vision API
google-genai       # Gemini vision API
Pillow             # Image cropping for bounding boxes
thefuzz[speedup]   # Fuzzy string matching (with python-Levenshtein)
pydantic           # Data models and validation

# Pipeline tools (in container)
# yt-dlp           # Installed via pip in Dockerfile
# ffmpeg           # Installed via apt in Dockerfile

# Dev/test
pytest
pytest-asyncio     # If using async API calls
```

No ML frameworks. No GPU. All inference is cloud API-based.

---

## Docker Container

```dockerfile
FROM python:3.12-slim
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
COPY . /app
WORKDIR /app
RUN pip install -e .
ENTRYPOINT ["python", "-m", "jeepney_spotter.cli"]
```

Runs on: GitHub Actions runner, Fly.io machine, any cloud VM with Docker, or locally.

---

## CLI Interface

```bash
# Full pipeline — single video
jeepney-spotter run --video "YOUTUBE_URL" --sample-rate 30 --output data/output/

# Individual stages (for debugging/reprocessing)
jeepney-spotter extract --video "YOUTUBE_URL" --sample-rate 30
jeepney-spotter geolocate --video-id "VIDEO_ID"
jeepney-spotter detect --video-id "VIDEO_ID"
jeepney-spotter ocr --video-id "VIDEO_ID"
jeepney-spotter assemble --video-id "VIDEO_ID"
```

All stages are idempotent — keyed by `video_id + frame_timestamp_s`. Re-running skips existing results.

---

## V1 Validation Scope

- **Input:** 1-3 YouTube dashcam videos of Metro Manila (1 hour each)
- **Processing:** ~120 frames per video at 30s sampling
- **API cost budget:** ~$5-10 per video, ~$15-30 total for V1
- **Output:** Observations JSONL, quality report, GeoJSON for map visualization

### V1 Success Criteria

| Stage | Metric | Viable (proceed) | Marginal (investigate) | Kill (rethink) |
|-------|--------|-------------------|------------------------|----------------|
| Geolocation | % frames with confident location (>0.5) | >40% | 20-40% | <20% |
| Detection | % frames with ≥1 jeepney detected | >30% | 15-30% | <15% |
| OCR | % detected jeepneys with readable placard | >25% | 10-25% | <10% |
| Matching | % readable placards matching a known route | >50% | 25-50% | <25% |

**End-to-end target:** 5-10 high-confidence observations per video that can be plotted on a map and visually verified against known route paths.

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Execution model | Single Docker container, sequential stages | Simplest thing that works for V1 validation |
| ML inference | Cloud APIs only (Claude + Gemini) | No GPU needed, pay-per-use, fast iteration on prompts |
| Geo approach | Dual-model (Claude + Gemini), take higher confidence | Cross-referencing reduces hallucination risk on geolocation |
| Detection model | Claude only | Detection is simpler than geo — single model sufficient |
| Frame rate | 30s default (vs 60s in original spec) | 2× more observations for marginal cost increase |
| Route matching | thefuzz against canonical-jeepney-routes.json | 609 routes already compiled with aliases — don't reinvent |
| Storage | Filesystem JSONL (not a database) | Simplest possible. Git-committed V1 results for reproducibility |
| Orchestration | CLI with per-video sequential stages | No job queue needed for 1-3 videos |

---

## Out of Scope (V1)

- Custom model training (SAM 3 distillation, YOLO detector)
- Dense video processing (1fps with interpolation)
- OSM road network snapping
- Route polyline reconstruction from observations
- Multi-video route clustering
- Web UI or visualization dashboard
- Production deployment or autoscaling
- GTFS shapes.txt generation (that's V2 after validation)

---

## Open Questions

1. **Video selection:** Which YouTube videos make the best V1 test cases? Need dashcam-style footage in Metro Manila with visible street signage. Commuter vlog compilations or driving POV videos along major corridors (EDSA, Commonwealth, Taft) would be ideal.
2. **Gemini model choice:** Gemini 2.0 Flash vs Gemini 2.5 Pro for geolocation. Flash is cheaper but Pro may be significantly better at landmark recognition.
3. **Rate limiting:** Both Anthropic and Google APIs have rate limits. May need to add simple backoff/retry logic. Not complex, but needs to be there.
