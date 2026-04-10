# Jeepney Spotter V1 — Cloud-Only Pipeline Spec

**Date:** 2026-04-10
**Status:** Draft
**Parent spec:** `docs/superpowers/specs/2026-04-08-jeepney-spotter-design.md`
**Project home:** `projects/jeepney-spotter/`

---

## Problem

The `mm-transit-routes-reverse` loop compiled 609 canonical jeepney routes, but 96.4% (587 routes) lack polyline geometry. The parent design spec proposes a 5-stage video pipeline (EXTRACT → GEOLOCATE → DETECT → IDENTIFY → ASSEMBLE) to reconstruct route shapes from YouTube dashcam footage. That spec defines the stages and data model but leaves the execution environment open. This spec pins V1 to a concrete cloud-only implementation that requires zero local setup.

## Chosen Approach

**GitHub Actions workflow + ephemeral frame processing.** The entire pipeline runs as a `workflow_dispatch` job on a standard CI runner. Frames are extracted to the runner's temp filesystem, processed through VLM API calls, and discarded. Only the final observation dataset and quality report are committed back to the repo.

### Why This Approach

| Factor | GitHub Actions | Fly.io Machine | Cloud Functions |
|--------|---------------|----------------|-----------------|
| New infrastructure | None | New Dockerfile + service | New cloud account/project |
| Consistent with repo | Yes — 6 existing workflows, ralph-loops use same pattern | Partially — Fly.io used for web apps, not batch jobs | No — no existing GCP/AWS infra |
| V1 runtime | ~15-25 min (fits in 6hr limit) | ~15-25 min | ~15-25 min |
| Cost | Free (GitHub Actions minutes) | ~$0.01 per run (ephemeral machine) | Free tier likely covers |
| Complexity | Low — one workflow YAML + Python package | Medium — Dockerfile, deploy config, trigger mechanism | High — multiple functions, IAM, triggers, storage |
| Path to V2 | Extract Python package → run anywhere | Already containerized | Rewrite for scale |

The V1 workload is small (1 video, 60 frames, ~250 API calls). GitHub Actions is the leanest execution environment that requires zero new infrastructure while matching the repo's existing automation patterns.

## Architecture

### Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Actions Runner (ubuntu-latest)                          │
│                                                                 │
│  ┌──────────┐   ┌───────────┐   ┌──────────┐   ┌───────────┐  │
│  │ EXTRACT  │──▶│ GEOLOCATE │──▶│  DETECT  │──▶│    OCR    │  │
│  │ yt-dlp + │   │ Claude /  │   │ Claude / │   │ Claude /  │  │
│  │ ffmpeg   │   │ Gemini    │   │ Gemini   │   │ Gemini    │  │
│  └──────────┘   └───────────┘   └──────────┘   └───────────┘  │
│       │               │               │               │        │
│       ▼               ▼               ▼               ▼        │
│    /tmp/frames/   geo.jsonl      detect.jsonl     ocr.jsonl    │
│    (PNGs)         (per-frame)    (per-frame)     (per-jeepney) │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      ASSEMBLE                             │  │
│  │  Join geo + detect + ocr → observations.jsonl             │  │
│  │  Fuzzy-match placards against 609 canonical routes        │  │
│  │  Generate quality_report.json + unmatched_placards.json   │  │
│  └───────────────────────────────────────────────────────────┘  │
│       │                                                         │
│       ▼                                                         │
│  git commit + push results to repo                              │
└─────────────────────────────────────────────────────────────────┘
```

### Trigger

```yaml
on:
  workflow_dispatch:
    inputs:
      video_url:
        description: "YouTube video URL"
        required: true
      sample_rate:
        description: "Seconds between frame samples (default: 60)"
        default: "60"
      geo_provider:
        description: "VLM provider for geolocation"
        default: "both"
        type: choice
        options: [claude, gemini, both]
```

### Stage Details

All stages follow the parent design spec. Key V1 decisions:

**Stage 1 — Extract:** `yt-dlp` downloads to `/tmp`, `ffmpeg` extracts frames at `sample_rate` interval. Frames stored as `/tmp/frames/{video_id}_f{timestamp_s}.png`. Max resolution 1920x1080 (downscale if higher to reduce API costs).

**Stage 2 — Geolocate:** Each frame sent to Claude and/or Gemini vision API. Structured output: `{lat, lon, confidence, landmarks[]}`. When `geo_provider=both`, call both APIs concurrently and take the higher-confidence result. Frames with confidence < 0.3 are skipped for remaining stages.

**Stage 3 — Detect:** Each geolocated frame sent to vision API with prompt: identify all jeepneys, return bounding boxes. Structured output: `{jeepneys: [{bbox, confidence}]}`. Frames with zero detections are logged but not processed further.

**Stage 4 — OCR:** For each detected jeepney, crop the bounding box region from the frame and send the crop to vision API. Prompt: read the route placard text. Structured output: `{placard_text_raw, placard_text_clean}`. Then fuzzy-match against the 609 canonical routes from `loops/mm-transit-routes-reverse/raw/canonical-jeepney-routes.json`.

**Stage 5 — Assemble:** Join all stage outputs by frame into the observation schema (defined in parent spec). Filter by confidence thresholds. Write:
- `observations.jsonl` — all observations above threshold
- `quality_report.json` — hit rates per stage, API call counts, costs
- `unmatched_placards.json` — placard readings with no route match

### Combined VLM Calls (Optimization)

To reduce API call count and cost, stages 2-4 can be partially combined:

**Option A (sequential, parent spec):** 3 separate API calls per frame minimum. ~180-260 calls total.

**Option B (combined prompt):** Single API call per frame that returns geolocation + jeepney detections + placard readings in one structured response. ~60-120 calls total.

**V1 decision: Start with Option A (sequential).** Easier to debug, clearer per-stage metrics, and the cost difference is ~$2 vs ~$5 — negligible for V1. Option B is a V1.1 optimization if API latency becomes the bottleneck.

## Data Model

Unchanged from parent spec. The observation schema is:

| Field | Type | Source Stage |
|-------|------|-------------|
| `observation_id` | `{video_id}_{frame_ts}_{jeepney_idx}` | Assembly |
| `source_video` | YouTube video ID | Extract |
| `frame_timestamp_s` | int | Extract |
| `lat`, `lon` | float | Geolocate |
| `geo_confidence` | float 0-1 | Geolocate |
| `geo_landmarks` | string[] | Geolocate |
| `placard_text_raw` | string | OCR |
| `placard_text_clean` | string | OCR |
| `matched_route` | string (route_id from canonical list) | OCR/Assembly |
| `match_confidence` | float | OCR/Assembly |
| `bbox` | int[4] `[x1, y1, x2, y2]` | Detect |
| `detection_confidence` | float | Detect |

## Project Structure

```
projects/jeepney-spotter/
├── README.md
├── pyproject.toml                    # uv project, Python 3.12+
├── src/
│   └── jeepney_spotter/
│       ├── __init__.py
│       ├── extract.py                # Stage 1: yt-dlp + ffmpeg
│       ├── geolocate.py              # Stage 2: VLM geolocation
│       ├── detect.py                 # Stage 3: jeepney detection
│       ├── ocr.py                    # Stage 4: placard OCR + fuzzy match
│       ├── assemble.py               # Stage 5: join + filter + report
│       ├── pipeline.py               # Orchestrator: stages 1-5
│       ├── models.py                 # Pydantic models for observation schema
│       └── prompts.py                # VLM prompt templates
├── tests/
│   ├── test_extract.py
│   ├── test_geolocate.py
│   ├── test_detect.py
│   ├── test_ocr.py
│   ├── test_assemble.py
│   └── fixtures/                     # Sample API responses for testing
├── data/
│   └── routes.json                   # Symlink or copy of canonical-jeepney-routes.json
└── v1/
    └── results/                      # V1 run outputs committed here
```

```
.github/workflows/
└── jeepney-spotter.yml               # Workflow dispatch pipeline
```

## Dependencies

```toml
[project]
name = "jeepney-spotter"
requires-python = ">=3.12"
dependencies = [
    "anthropic>=0.45",       # Claude vision API
    "google-genai>=1.0",     # Gemini vision API
    "thefuzz[speedup]>=0.22",# Fuzzy string matching
    "pillow>=11.0",          # Image cropping for bounding boxes
    "pydantic>=2.0",         # Observation schema validation
]

[project.optional-dependencies]
dev = ["pytest>=8.0", "pytest-asyncio"]
```

System dependencies (installed in workflow): `yt-dlp`, `ffmpeg`.

## Secrets Required

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Claude vision API calls |
| `GEMINI_API_KEY` | Gemini vision API calls |
| `GH_PAT` | Push results back to repo (existing) |

## V1 Scope

- **Input:** 1 YouTube video (user-supplied via workflow dispatch), ~1 hour dashcam footage from Metro Manila
- **Processing:** 60 frames (1 per minute), sequential stages, ~250 API calls
- **Output:** `observations.jsonl`, `quality_report.json`, `unmatched_placards.json` committed to `projects/jeepney-spotter/v1/results/`
- **Runtime:** ~15-25 minutes on GitHub Actions
- **Cost:** ~$2-5 in API calls per run

### V1 Success Criteria

Same as parent spec:

| Stage | Metric | Viable (>proceed) | Marginal | Kill (<rethink) |
|-------|--------|--------------------|----------|------------------|
| Geolocation | % frames with confident location (>0.5) | >40% | 20-40% | <20% |
| Detection | % frames with ≥1 jeepney detected | >30% | 15-30% | <15% |
| OCR | % detected jeepneys with readable placard | >25% | 10-25% | <10% |
| Matching | % readable placards matching a known route | >50% | 25-50% | <25% |

**End-to-end:** At least 5-10 high-confidence observations that can be plotted on a map and verified against known route paths.

## Key Decisions

1. **GitHub Actions over Fly.io/Cloud Functions** — Zero new infra for a V1 that processes 60 frames. The Python package is portable; if V1 proves viable, it can be extracted to run on any cloud service.

2. **Ephemeral frames, no storage service** — Frames exist only during the workflow run. Only observations are persisted (committed to git). If frame re-inspection is needed, re-run the pipeline.

3. **Sequential stages over combined prompts** — Clearer per-stage metrics for V1 validation. The cost difference is negligible ($2 vs $5).

4. **Pydantic models for schema validation** — Catches malformed VLM responses early. Structured output from Claude/Gemini maps directly to Pydantic models.

5. **Route matching uses existing canonical dataset** — The 609 routes from `mm-transit-routes-reverse` are the ground truth. No new route research in V1.

## Out of Scope

- Dense video processing (1fps) — V2
- SAM 3 distillation / custom detector — V2
- OSM road network snapping / interpolation — V2
- Web visualization / heatmap — V2
- Multi-video batch processing — V2
- Frame persistence / cloud storage — V2
- Route polyline reconstruction from observations — V2 (V1 just proves observations are viable)

## Open Questions

1. **YouTube video selection:** Which specific video to use for V1? Needs to be a Metro Manila dashcam with visible jeepneys, route placards in frame, and identifiable street landmarks. A ~1 hour drive through Manila city proper (Divisoria–Quiapo–EDSA corridor) would maximize jeepney density.

2. **VLM structured output reliability:** Claude and Gemini may return inconsistent JSON. Need to test whether `response_format` / tool-use structured output is reliable enough, or if we need regex/JSON extraction fallbacks.
