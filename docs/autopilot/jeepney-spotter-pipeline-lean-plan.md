# Jeepney Spotter Pipeline — V1 Implementation Plan

**Spec:** `docs/autopilot/jeepney-spotter-pipeline-lean-spec.md`
**Target:** `projects/jeepney-spotter/`
**Branch:** `autopilot/jeepney-spotter-pipeline-lean`

---

## Task Dependency Graph

```
T01 → T02 → T03 ─────────────────────────────────────────┐
                                                           │
T04 → T05 → T06 → T07 (prompts.py)                       │
       │                                                   │
       └──→ T08 (matching.py) ──────────────────────┐     │
                                                     │     │
T09 (extract.py) ───────────────────────────────┐   │     │
                                                 │   │     │
T10 (geolocate.py) ────────────────────────┐    │   │     │
                                            │    │   │     │
T11 (detect.py) ──────────────────────┐    │    │   │     │
                                       │    │    │   │     │
T12 (ocr.py) ────────────────────┐    │    │    │   │     │
                                  │    │    │    │   │     │
T13 (assemble.py) ◀──────────────┴────┴────┴────┴───┘     │
                                                           │
T14 (cli.py) ◀────────────────────────────────────────────┘
                                                           
T15 (Dockerfile) ◀─ T14                                    
T16 (routes.json copy + input.txt) ◀─ T08                  
T17 (integration test — dry run) ◀─ T14, T15, T16         
T18 (README.md) ◀─ all                                     
```

---

## Tasks

### T01 — Project scaffolding

Create the project skeleton with `pyproject.toml`, directory structure, and `.gitignore`.

**Files to create:**

`projects/jeepney-spotter/pyproject.toml`:
```toml
[project]
name = "jeepney-spotter"
version = "0.1.0"
description = "Vision-based jeepney route observation pipeline"
requires-python = ">=3.12"
dependencies = [
    "anthropic>=0.42.0",
    "google-genai>=1.0.0",
    "Pillow>=11.0.0",
    "thefuzz[speedup]>=0.22.0",
    "pydantic>=2.0.0",
    "yt-dlp>=2024.0.0",
    "click>=8.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.24.0",
]

[project.scripts]
jeepney-spotter = "jeepney_spotter.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/jeepney_spotter"]
```

`projects/jeepney-spotter/.gitignore`:
```
data/frames/
data/geo/
data/detections/
data/ocr/
data/output/
__pycache__/
*.egg-info/
.venv/
```

Create empty directories with `.gitkeep`:
- `src/jeepney_spotter/`
- `tests/`
- `data/`
- `v1/results/`

**Test:** `ls projects/jeepney-spotter/pyproject.toml` returns 0.

---

### T02 — Pydantic models (`models.py`)

Define the data models for the entire pipeline. This is the schema contract between stages.

**File:** `src/jeepney_spotter/models.py`

**Models to define:**

```python
class FrameInfo(BaseModel):
    """Output of Stage 1 — one extracted frame."""
    video_id: str
    frame_timestamp_s: int
    frame_path: str  # relative path to PNG
    frame_width: int
    frame_height: int

class GeoResult(BaseModel):
    """Output of Stage 2 — geolocation for one frame."""
    video_id: str
    frame_timestamp_s: int
    lat: float | None
    lon: float | None
    confidence: float  # 0.0-1.0
    model_used: str  # "claude" | "gemini"
    landmarks: list[str]
    reasoning: str
    raw_response_claude: str | None = None
    raw_response_gemini: str | None = None

class BBox(BaseModel):
    """Bounding box in pixel coordinates."""
    x1: int
    y1: int
    x2: int
    y2: int

class JeepneyDetection(BaseModel):
    """One detected jeepney within a frame."""
    jeepney_idx: int
    bbox: BBox
    confidence: float
    distance: str  # "near" | "mid" | "far"

class FrameDetections(BaseModel):
    """Output of Stage 3 — all detections for one frame."""
    video_id: str
    frame_timestamp_s: int
    jeepney_count: int
    detections: list[JeepneyDetection]

class OcrResult(BaseModel):
    """Output of Stage 4 — OCR for one cropped jeepney."""
    video_id: str
    frame_timestamp_s: int
    jeepney_idx: int
    placard_text_raw: str
    placard_text_clean: str
    matched_route_id: str | None
    matched_route_name: str | None
    match_confidence: float

class Observation(BaseModel):
    """Final assembled observation — one jeepney sighting."""
    observation_id: str  # {video_id}_{frame_ts}_{jeepney_idx}
    source_video: str
    frame_timestamp_s: int
    frame_path: str
    lat: float | None
    lon: float | None
    geo_confidence: float
    geo_model: str
    geo_landmarks: list[str]
    geo_reasoning: str
    placard_text_raw: str
    placard_text_clean: str
    matched_route_id: str | None
    matched_route_name: str | None
    match_confidence: float
    bbox: BBox
    detection_confidence: float
    detection_distance: str

class QualityReport(BaseModel):
    """Per-video quality metrics."""
    video_id: str
    total_frames: int
    geo_confident_frames: int  # confidence > 0.5
    frames_with_detections: int  # at least 1 jeepney
    total_detections: int
    detections_with_ocr: int  # readable placard
    matched_placards: int  # route matched
    high_confidence_observations: int  # geo>0.5 AND match>0.5
```

**Test:** `tests/test_models.py` — instantiate each model with sample data, verify validation works, verify JSON round-trip.

---

### T03 — Config module (`config.py`)

Centralized configuration: API keys (from env vars), file paths, thresholds.

**File:** `src/jeepney_spotter/config.py`

```python
class PipelineConfig(BaseModel):
    """Pipeline configuration, loaded from environment + defaults."""
    # API keys (required — from env vars)
    anthropic_api_key: str
    google_api_key: str

    # Paths
    data_dir: Path = Path("data")
    routes_file: Path = Path("data/routes.json")

    # Stage 1 — extraction
    sample_rate_seconds: int = 30

    # Stage 2 — geolocation
    geo_confidence_threshold: float = 0.3  # minimum to keep
    claude_model: str = "claude-sonnet-4-20250514"
    gemini_model: str = "gemini-2.0-flash"

    # Stage 3 — detection
    detection_confidence_threshold: float = 0.3

    # Stage 4 — OCR
    match_auto_threshold: float = 0.80
    match_candidate_threshold: float = 0.50

    # Stage 5 — assembly
    min_geo_confidence: float = 0.3
    min_detection_confidence: float = 0.3
```

Plus a `load_config()` function that reads `ANTHROPIC_API_KEY` and `GOOGLE_API_KEY` from env, with clear error messages if missing.

**Test:** `tests/test_config.py` — test loading from env vars, test defaults, test missing key raises.

---

### T04 — Route reference data preparation

Copy and transform `loops/mm-transit-routes-reverse/raw/canonical-jeepney-routes.json` into a slim lookup format for the fuzzy matcher.

**Script (one-time):** Read the 609-route canonical file, extract:
- `route_id`
- `route_name`
- `origin`
- `destination`
- Generate search aliases: `"{origin}-{destination}"`, `"{destination}-{origin}"`, `"{route_name}"` uppercased

**Output:** `projects/jeepney-spotter/data/routes.json` — array of objects with `route_id`, `route_name`, `origin`, `destination`, `aliases: string[]`

**Test:** Verify the output has 609 routes, each with at least 2 aliases.

---

### T05 — Fuzzy matching module (`matching.py`)

The fuzzy matching engine that matches OCR placard text to known routes.

**File:** `src/jeepney_spotter/matching.py`

**Key functions:**

```python
def load_route_dictionary(routes_file: Path) -> list[RouteEntry]:
    """Load routes.json into a list of RouteEntry objects."""

def normalize_placard_text(raw: str) -> str:
    """Uppercase, strip, normalize separators (–→- all become ' - '),
    remove common noise words."""

def match_placard_to_route(
    clean_text: str,
    routes: list[RouteEntry],
    auto_threshold: float = 0.80,
    candidate_threshold: float = 0.50,
) -> tuple[str | None, str | None, float]:
    """Return (route_id, route_name, score).

    Matches clean_text against all route aliases using thefuzz.
    Returns best match above candidate_threshold, or (None, None, 0.0).
    """
```

**Matching strategy:**
1. Compare `clean_text` against every alias of every route using `thefuzz.fuzz.token_sort_ratio`
2. Also try `thefuzz.fuzz.partial_ratio` for cases where placard shows only part of the route name
3. Take the maximum score across all comparisons
4. Return the best-matching route if score ≥ `candidate_threshold`

**Test:** `tests/test_matching.py`
- "CUBAO - DIVISORIA" matches "Cubao-Divisoria" route with score > 0.90
- "QUIAPO DIVISORIA" matches with partial ratio
- "FAIRVIEW" partial matches routes containing Fairview
- Total gibberish returns (None, None, 0.0)
- Test `normalize_placard_text` with various separator styles

---

### T06 — VLM prompt templates (`prompts.py`)

All prompt strings for Claude and Gemini API calls, isolated in one file for easy iteration.

**File:** `src/jeepney_spotter/prompts.py`

**Prompts to define:**

1. **`GEOLOCATE_PROMPT`** — Given a dashcam frame from Metro Manila, identify location.
   - Instruct model to look for: street signs, business names, building labels, road markers, landmarks
   - Return structured JSON: `{lat, lon, confidence, landmarks: [], reasoning: ""}`
   - Explicitly state: "This is Metro Manila, Philippines (lat ~14.4-14.8, lon ~120.9-121.1)"
   - Confidence guide: 0.9+ = exact intersection visible, 0.7-0.9 = landmark within 200m, 0.5-0.7 = general area, <0.5 = low certainty

2. **`DETECT_JEEPNEYS_PROMPT`** — Given a dashcam frame, find all jeepneys.
   - Describe what a jeepney looks like (extended chassis, chrome bumpers, colored bodywork, route placard on windshield)
   - Return structured JSON: `{count, detections: [{bbox: [x1,y1,x2,y2], confidence, distance: "near"|"mid"|"far"}]}`
   - Note: "near" = occupies >15% of frame width, "mid" = 5-15%, "far" = <5%

3. **`READ_PLACARD_PROMPT`** — Given a cropped jeepney image, read the route placard.
   - Instruct: "Read the text on the route sign/placard visible on or near the windshield of this jeepney"
   - Return structured JSON: `{text_raw, confidence}`
   - Note: placards typically show origin-destination format (e.g., "CUBAO - DIVISORIA")

**Test:** `tests/test_prompts.py` — verify each prompt is a non-empty string, contains key instructions (e.g., "Metro Manila" in geo prompt, "jeepney" in detect prompt).

---

### T07 — Prompt response parsers

Add JSON parsing helpers to `prompts.py` (or a separate `parsers.py`) that extract structured data from VLM responses.

**Functions:**

```python
def parse_geo_response(raw_text: str) -> dict:
    """Extract {lat, lon, confidence, landmarks, reasoning} from VLM response.
    Handles both clean JSON and JSON embedded in markdown code blocks."""

def parse_detection_response(raw_text: str) -> dict:
    """Extract {count, detections: [{bbox, confidence, distance}]} from VLM response."""

def parse_ocr_response(raw_text: str) -> dict:
    """Extract {text_raw, confidence} from VLM response."""
```

Each parser:
1. Tries `json.loads(raw_text)` first
2. Falls back to regex extraction of JSON block from markdown (` ```json ... ``` `)
3. Validates required fields are present
4. Returns a dict (not a model — the caller constructs the model)

**Test:** `tests/test_parsers.py`
- Test with clean JSON input
- Test with markdown-wrapped JSON
- Test with malformed input → raises/returns sensible default
- Test with edge cases (no jeepneys found, empty placard)

---

### T08 — Stage 1: Frame extraction (`extract.py`)

Download video and extract frames at the configured sample rate.

**File:** `src/jeepney_spotter/extract.py`

**Key function:**

```python
def extract_frames(
    video_url: str,
    config: PipelineConfig,
) -> list[FrameInfo]:
    """Download video, extract frames, return list of FrameInfo.

    1. Parse video_url to get video_id (YouTube ID extraction)
    2. Create output dir: data/frames/{video_id}/
    3. Download video via yt-dlp to a temp file
    4. Probe video duration via ffprobe
    5. Extract frames at sample_rate_seconds intervals via ffmpeg
    6. Build FrameInfo objects for each extracted frame
    7. Write manifest.json to data/frames/{video_id}/
    8. Return list of FrameInfo
    """
```

**Implementation details:**
- Use `subprocess.run` for yt-dlp and ffmpeg (not ffmpeg-python — fewer deps)
- yt-dlp command: `yt-dlp -f "bestvideo[height<=720]" -o {temp_path} {url}`
  - Cap at 720p — higher res wastes bandwidth, VLMs don't need 4K
- ffmpeg command: `ffmpeg -i {video} -vf "fps=1/{sample_rate}" -q:v 2 {output_pattern}`
- Idempotency: if `data/frames/{video_id}/manifest.json` exists and frame count matches, skip

**Test:** `tests/test_extract.py`
- Test YouTube URL parsing (extract video ID from various URL formats)
- Test that the function skips if manifest already exists (mock subprocess)
- Test frame info generation from a mock directory of PNGs

---

### T09 — Stage 2: Geolocation (`geolocate.py`)

Send each frame to Claude and Gemini vision APIs, return best geolocation.

**File:** `src/jeepney_spotter/geolocate.py`

**Key function:**

```python
def geolocate_frames(
    frames: list[FrameInfo],
    config: PipelineConfig,
) -> list[GeoResult]:
    """Geolocate each frame using dual-model approach.

    For each frame:
    1. Read the PNG from disk
    2. Send to Claude Sonnet with GEOLOCATE_PROMPT → parse response
    3. Send to Gemini Flash with GEOLOCATE_PROMPT → parse response
    4. Pick the result with higher confidence
    5. If both > 0.6 and disagree by > 500m, log conflict, pick one with more landmarks
    6. Build GeoResult with winning model's data + both raw responses
    7. Write result to data/geo/{video_id}/geo_results.jsonl (append)
    """
```

**API call helpers (private functions):**

```python
def _call_claude_vision(image_bytes: bytes, prompt: str, config: PipelineConfig) -> str:
    """Send image to Claude Sonnet, return raw text response."""

def _call_gemini_vision(image_bytes: bytes, prompt: str, config: PipelineConfig) -> str:
    """Send image to Gemini Flash, return raw text response."""
```

Both helpers include:
- Retry with exponential backoff (3 retries, 2s/4s/8s) for rate limit errors
- Timeout of 30s per call
- Return raw text (parsing is done by callers using `prompts.py` parsers)

**Idempotency:** Check if `data/geo/{video_id}/geo_results.jsonl` already contains a line for this frame_timestamp_s. Skip if present.

**Test:** `tests/test_geolocate.py`
- Mock both API clients
- Test dual-model selection logic (higher confidence wins)
- Test conflict resolution (>500m disagreement)
- Test idempotency (skips already-processed frames)
- Test retry on rate limit

---

### T10 — Stage 3: Jeepney detection (`detect.py`)

Detect jeepneys in each frame.

**File:** `src/jeepney_spotter/detect.py`

**Key function:**

```python
def detect_jeepneys(
    frames: list[FrameInfo],
    config: PipelineConfig,
) -> list[FrameDetections]:
    """Detect jeepneys in each frame using Claude vision.

    For each frame:
    1. Read the PNG
    2. Send to Claude with DETECT_JEEPNEYS_PROMPT
    3. Parse response into FrameDetections
    4. Write to data/detections/{video_id}/detections.jsonl (append)
    """
```

**V1 simplification:** Claude-only (no dual model). Detection is a more constrained task than geolocation — single model is sufficient.

**Test:** `tests/test_detect.py`
- Mock Claude API
- Test parsing of detection response with 0, 1, and multiple jeepneys
- Test idempotency

---

### T11 — Stage 4: OCR + matching (`ocr.py`)

Crop detected jeepneys, read placards, match to routes.

**File:** `src/jeepney_spotter/ocr.py`

**Key function:**

```python
def read_placards(
    frames: list[FrameInfo],
    detections: list[FrameDetections],
    routes: list[RouteEntry],
    config: PipelineConfig,
) -> list[OcrResult]:
    """Read route placards from detected jeepneys.

    For each frame's detections:
    1. Filter to distance == "near" or "mid" (skip "far")
    2. Crop bounding box from source frame (Pillow)
    3. Send cropped image to Claude with READ_PLACARD_PROMPT
    4. Parse raw text, normalize via normalize_placard_text()
    5. Fuzzy match via match_placard_to_route()
    6. Build OcrResult
    7. Write to data/ocr/{video_id}/ocr_results.jsonl (append)
    """
```

**Image cropping:**
- Use `PIL.Image.open(frame_path).crop((x1, y1, x2, y2))`
- Save to temp bytes buffer, send to API (don't write crop to disk)

**Test:** `tests/test_ocr.py`
- Mock Claude API with sample placard responses
- Test cropping logic with a test image
- Test integration with matching module
- Test that "far" detections are skipped

---

### T12 — Stage 5: Assembly (`assemble.py`)

Join all stage outputs into final observations.

**File:** `src/jeepney_spotter/assemble.py`

**Key function:**

```python
def assemble_observations(
    frames: list[FrameInfo],
    geo_results: list[GeoResult],
    detections: list[FrameDetections],
    ocr_results: list[OcrResult],
    config: PipelineConfig,
) -> tuple[list[Observation], QualityReport]:
    """Join stage outputs into final observations.

    1. Index geo_results by (video_id, frame_timestamp_s)
    2. Index ocr_results by (video_id, frame_timestamp_s, jeepney_idx)
    3. For each detection in each frame:
       a. Look up geo result for that frame
       b. Look up OCR result for that detection
       c. Build Observation (skip if geo missing)
    4. Filter by confidence thresholds
    5. Write data/output/{video_id}/observations.jsonl
    6. Write data/output/{video_id}/quality_report.json
    7. Write data/output/{video_id}/unmatched_placards.json
    8. Write data/output/{video_id}/observations.geojson (high-confidence only)
    9. Return (observations, quality_report)
    """
```

**GeoJSON output:** Simple FeatureCollection with Point features for each high-confidence observation. Properties include route name, placard text, confidence scores. Can be dropped directly into geojson.io or kepler.gl for visual verification.

**Test:** `tests/test_assemble.py`
- Build sample data for all stages
- Test join logic
- Test confidence filtering
- Test quality report calculation
- Test GeoJSON output format

---

### T13 — CLI entry point (`cli.py`)

Click-based CLI that orchestrates the full pipeline and individual stages.

**File:** `src/jeepney_spotter/cli.py`

**Commands:**

```python
@click.group()
def main():
    """Jeepney Spotter — vision-based route observation pipeline."""

@main.command()
@click.option("--video", required=True, help="YouTube URL")
@click.option("--sample-rate", default=30, help="Seconds between frames")
@click.option("--output", default="data/output/", help="Output directory")
def run(video, sample_rate, output):
    """Run the full pipeline for a single video."""
    config = load_config()
    config.sample_rate_seconds = sample_rate

    # Stage 1
    click.echo("Stage 1: Extracting frames...")
    frames = extract_frames(video, config)
    click.echo(f"  → {len(frames)} frames extracted")

    # Stage 2
    click.echo("Stage 2: Geolocating frames...")
    geo_results = geolocate_frames(frames, config)
    confident = sum(1 for g in geo_results if g.confidence > 0.5)
    click.echo(f"  → {confident}/{len(geo_results)} frames geolocated (>0.5 confidence)")

    # Stage 3
    click.echo("Stage 3: Detecting jeepneys...")
    detections = detect_jeepneys(frames, config)
    total_jeeps = sum(d.jeepney_count for d in detections)
    click.echo(f"  → {total_jeeps} jeepneys detected across {len(detections)} frames")

    # Stage 4
    click.echo("Stage 4: Reading placards...")
    routes = load_route_dictionary(config.routes_file)
    ocr_results = read_placards(frames, detections, routes, config)
    matched = sum(1 for o in ocr_results if o.matched_route_id is not None)
    click.echo(f"  → {matched}/{len(ocr_results)} placards matched to known routes")

    # Stage 5
    click.echo("Stage 5: Assembling observations...")
    observations, report = assemble_observations(
        frames, geo_results, detections, ocr_results, config
    )
    click.echo(f"  → {report.high_confidence_observations} high-confidence observations")
    click.echo(f"  → Output: {output}")

# Individual stage commands: extract, geolocate, detect, ocr, assemble
# (same pattern — load config, load previous stage's output from JSONL, run)
```

**Test:** `tests/test_cli.py`
- Test that CLI group is importable
- Test `--help` doesn't crash
- Integration test with all stages mocked

---

### T14 — Dockerfile

**File:** `projects/jeepney-spotter/Dockerfile`

```dockerfile
FROM python:3.12-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY pyproject.toml .
COPY src/ src/
COPY data/routes.json data/routes.json

RUN pip install --no-cache-dir -e .

ENTRYPOINT ["jeepney-spotter"]
CMD ["--help"]
```

**Test:** `docker build -t jeepney-spotter .` succeeds (in CI or locally).

---

### T15 — Route data preparation (one-time task)

Prepare `data/routes.json` from the canonical jeepney routes.

**Script:** `scripts/prepare_routes.py` (run once, output committed)

1. Read `loops/mm-transit-routes-reverse/raw/canonical-jeepney-routes.json`
2. For each of the 609 routes, extract:
   - `route_id`
   - `route_name`
   - `origin`
   - `destination`
   - `aliases`: list of normalized search strings
     - `route_name` uppercased
     - `"{ORIGIN} - {DESTINATION}"` uppercased
     - `"{DESTINATION} - {ORIGIN}"` uppercased
     - Any known aliases from `key_stops` (first + last)
3. Write to `projects/jeepney-spotter/data/routes.json`

**Test:** Output file has 609 entries, each with `route_id`, `route_name`, and ≥2 aliases.

---

### T16 — V1 input list

**File:** `projects/jeepney-spotter/v1/input.txt`

Curate 2-3 YouTube video URLs for V1 validation. Selection criteria:
- Dashcam or POV driving footage in Metro Manila
- At least 30 minutes of continuous driving
- Visible street signage and landmarks
- Passes through corridors with known jeepney routes (EDSA, Taft, Commonwealth, Aurora)
- Published within the last 2 years (current street conditions)

Include a comment for each URL explaining why it was selected and which corridors it covers.

---

### T17 — Integration test (dry run)

Write an integration test that exercises the full pipeline with mocked API responses.

**File:** `tests/test_integration.py`

1. Create 3 fake frame PNGs (solid color images, 1280×720)
2. Mock Claude API to return:
   - Geo: `{lat: 14.55, lon: 121.03, confidence: 0.8, landmarks: ["SM Megamall"], reasoning: "..."}`
   - Detection: `{count: 1, detections: [{bbox: [100,200,400,500], confidence: 0.9, distance: "near"}]}`
   - OCR: `{text_raw: "CUBAO - DIVISORIA", confidence: 0.85}`
3. Mock Gemini API to return:
   - Geo: `{lat: 14.56, lon: 121.02, confidence: 0.6, landmarks: ["Ortigas"], reasoning: "..."}`
4. Run the full pipeline (stages 2-5, skip stage 1 download)
5. Assert:
   - Observations JSONL has 3 entries (one per frame)
   - Quality report shows 3/3 geolocated, 3/3 detected, 3/3 OCR'd
   - GeoJSON output is valid
   - Unmatched placards file exists

This validates the entire data flow without real API calls or video downloads.

---

### T18 — README and project documentation

**File:** `projects/jeepney-spotter/README.md`

Contents:
1. One-paragraph description of what this does
2. Quick start: Docker build + run command
3. Environment variables needed (`ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`)
4. CLI usage (full pipeline + individual stages)
5. V1 scope and success criteria (copied from spec)
6. Output file descriptions
7. Link to design spec and plan

---

## Implementation Order (suggested)

The tasks can be parallelized where dependencies allow, but the recommended serial order for a single implementer is:

1. **T01** — Project scaffolding
2. **T02** — Pydantic models
3. **T03** — Config module
4. **T04** — Route data preparation
5. **T05** — Fuzzy matching module
6. **T06** — VLM prompt templates
7. **T07** — Prompt response parsers
8. **T08** — Stage 1: Frame extraction
9. **T09** — Stage 2: Geolocation
10. **T10** — Stage 3: Detection
11. **T11** — Stage 4: OCR + matching
12. **T12** — Stage 5: Assembly
13. **T13** — CLI entry point
14. **T14** — Dockerfile
15. **T15** — V1 input list (video curation)
16. **T16** — Integration test
17. **T17** — README

Each task should be committed individually with message `autopilot: T{XX} — {description}`.

---

## Cost Estimate (V1 run)

| Stage | Calls per video | Cost per call | Total per video |
|-------|----------------|---------------|-----------------|
| Geo (Claude) | 120 | ~$0.015 | $1.80 |
| Geo (Gemini) | 120 | ~$0.005 | $0.60 |
| Detect (Claude) | 120 | ~$0.015 | $1.80 |
| OCR (Claude) | ~30 (estimated) | ~$0.010 | $0.30 |
| **Total per video** | | | **~$4.50** |
| **V1 total (3 videos)** | | | **~$13.50** |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| VLM geolocation accuracy too low | Medium | High (pipeline useless) | V1 success criteria define kill threshold (<20%) |
| Jeepney placard text unreadable from dashcam | Medium | High | Filter to "near" detections only; test with multiple video angles |
| API rate limiting delays V1 run | Low | Low | Built-in retry with backoff; sequential processing acceptable |
| yt-dlp breaks with YouTube changes | Low | Low | Pin yt-dlp version; can substitute manual video download |
| Canonical route names don't match placard text | Medium | Medium | Fuzzy matching with aliases + partial matching + log unmatched |
