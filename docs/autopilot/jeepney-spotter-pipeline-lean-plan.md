# Jeepney Spotter V1 — Implementation Plan

**Spec:** `docs/autopilot/jeepney-spotter-pipeline-lean-spec.md`
**Parent design:** `docs/superpowers/specs/2026-04-08-jeepney-spotter-design.md`

---

## Prerequisites

- GitHub repo secrets: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` (must be set manually before first run)
- `GH_PAT` already exists (used by existing workflows)

---

## Task 1: Scaffold project and dependencies

**Files:**
- Create: `projects/jeepney-spotter/pyproject.toml`
- Create: `projects/jeepney-spotter/README.md`
- Create: `projects/jeepney-spotter/src/jeepney_spotter/__init__.py`
- Create: `projects/jeepney-spotter/.gitignore`

**What to do:**
- [ ] Create `pyproject.toml` with uv build-system, Python ≥3.12, dependencies: `anthropic>=0.45`, `google-genai>=1.0`, `thefuzz[speedup]>=0.22`, `pillow>=11.0`, `pydantic>=2.0`. Dev deps: `pytest>=8.0`, `pytest-asyncio`.
- [ ] Create `src/jeepney_spotter/__init__.py` — empty, just makes it a package.
- [ ] Create `README.md` — one-paragraph description, link to spec, CLI usage (`python -m jeepney_spotter.pipeline --video URL`).
- [ ] Create `.gitignore` — ignore `data/frames/`, `data/output/`, `__pycache__/`, `.venv/`, `*.pyc`.
- [ ] Create `projects/jeepney-spotter/data/` directory with a `.gitkeep`.
- [ ] Copy the canonical routes JSON: `cp loops/mm-transit-routes-reverse/raw/canonical-jeepney-routes.json projects/jeepney-spotter/data/routes.json`.
- [ ] Verify: `cd projects/jeepney-spotter && uv sync` installs cleanly.

---

## Task 2: Pydantic models for observation schema and stage outputs

**Files:**
- Create: `projects/jeepney-spotter/src/jeepney_spotter/models.py`
- Create: `projects/jeepney-spotter/tests/test_models.py`

**What to do:**
- [ ] Write tests first (`tests/test_models.py`):
  - Test `FrameInfo` model: `video_id`, `frame_timestamp_s`, `frame_path` fields.
  - Test `GeoResult` model: `lat`, `lon`, `confidence` (0-1 range), `landmarks` list. Test validation rejects confidence outside 0-1.
  - Test `Detection` model: `bbox` (4-element list), `confidence` float.
  - Test `PlacarReading` model: `placard_text_raw`, `placard_text_clean`, `matched_route` (optional), `match_confidence` float.
  - Test `Observation` model: full schema from spec. Test `observation_id` generation from components.
  - Test `QualityReport` model: stage hit rates, API call counts, total cost.
- [ ] Implement `models.py`:
  - `FrameInfo` — extracted frame metadata.
  - `GeoResult` — VLM geolocation output.
  - `Detection` — single jeepney bounding box.
  - `PlacardReading` — OCR result + fuzzy match.
  - `Observation` — full observation row (all fields from spec data model).
  - `QualityReport` — aggregate metrics per stage.
- [ ] Verify: all tests pass.

---

## Task 3: VLM prompt templates

**Files:**
- Create: `projects/jeepney-spotter/src/jeepney_spotter/prompts.py`
- Create: `projects/jeepney-spotter/tests/test_prompts.py`

**What to do:**
- [ ] Write tests first (`tests/test_prompts.py`):
  - Test `geolocate_prompt()` returns a string containing "Metro Manila", "latitude", "longitude", "confidence".
  - Test `detect_prompt()` returns a string containing "jeepney", "bounding box".
  - Test `ocr_prompt()` returns a string containing "placard", "route".
  - Test each prompt function accepts optional parameters (e.g., `geolocate_prompt(include_examples=True)`).
- [ ] Implement `prompts.py`:
  - `geolocate_prompt()` — System + user prompt for Stage 2. Instructs VLM to identify visible landmarks, street signs, business names in a Metro Manila dashcam frame and return structured JSON with `{lat, lon, confidence, landmarks}`.
  - `detect_prompt()` — Prompt for Stage 3. Instructs VLM to find all jeepneys in the frame and return bounding boxes as `{jeepneys: [{bbox: [x1,y1,x2,y2], confidence}]}`.
  - `ocr_prompt()` — Prompt for Stage 4. Given a cropped jeepney image, read the route placard and return `{placard_text_raw, placard_text_clean}`.
  - Each prompt requests structured JSON output matching the corresponding Pydantic model.
- [ ] Verify: all tests pass.

---

## Task 4: Stage 1 — Frame extraction

**Files:**
- Create: `projects/jeepney-spotter/src/jeepney_spotter/extract.py`
- Create: `projects/jeepney-spotter/tests/test_extract.py`

**What to do:**
- [ ] Write tests first (`tests/test_extract.py`):
  - Test `download_video(url, output_dir)` — mock `subprocess.run` for yt-dlp call. Assert correct arguments: `-f bestvideo[height<=1080]+bestaudio/best[height<=1080]`, output template, etc.
  - Test `extract_frames(video_path, output_dir, sample_rate=60)` — mock `subprocess.run` for ffmpeg call. Assert ffmpeg command includes `-vf fps=1/{sample_rate}` and correct output pattern.
  - Test `get_video_id(url)` — extract YouTube video ID from various URL formats (watch?v=, youtu.be/, shorts/).
  - Test `run_extraction(url, output_dir, sample_rate)` → returns list of `FrameInfo` objects.
- [ ] Implement `extract.py`:
  - `get_video_id(url: str) -> str` — regex extract YouTube video ID.
  - `download_video(url: str, output_dir: Path) -> Path` — shell out to yt-dlp, return path to downloaded video file.
  - `extract_frames(video_path: Path, output_dir: Path, sample_rate: int = 60) -> list[FrameInfo]` — shell out to ffmpeg, extract frames at interval, return list of `FrameInfo`.
  - `run_extraction(url: str, output_dir: Path, sample_rate: int = 60) -> list[FrameInfo]` — orchestrates download + extract. Cleans up video file after frame extraction.
- [ ] Verify: all tests pass (unit tests with mocked subprocess).

---

## Task 5: Stage 2 — VLM geolocation

**Files:**
- Create: `projects/jeepney-spotter/src/jeepney_spotter/geolocate.py`
- Create: `projects/jeepney-spotter/tests/test_geolocate.py`
- Create: `projects/jeepney-spotter/tests/fixtures/geo_response_claude.json`
- Create: `projects/jeepney-spotter/tests/fixtures/geo_response_gemini.json`

**What to do:**
- [ ] Write tests first (`tests/test_geolocate.py`):
  - Test `geolocate_frame_claude(frame_path)` — mock Anthropic client. Load fixture response. Assert returns `GeoResult` with lat/lon/confidence/landmarks.
  - Test `geolocate_frame_gemini(frame_path)` — mock Gemini client. Load fixture response. Assert returns `GeoResult`.
  - Test `geolocate_frame(frame_path, provider="both")` — when `both`, calls both APIs, returns the result with higher confidence.
  - Test confidence threshold filtering: frames with confidence < 0.3 return `None`.
  - Test malformed API response handling: returns `None` with a warning log instead of crashing.
- [ ] Create fixture files with realistic sample API responses:
  - `geo_response_claude.json` — Claude response identifying a Manila intersection (e.g., Quiapo Church visible, lat 14.5974, lon 120.9817, confidence 0.82).
  - `geo_response_gemini.json` — Gemini response for the same scenario.
- [ ] Implement `geolocate.py`:
  - `_call_claude(image_bytes: bytes) -> GeoResult | None` — send image to Claude vision API with geolocate prompt, parse structured response into `GeoResult`.
  - `_call_gemini(image_bytes: bytes) -> GeoResult | None` — same for Gemini.
  - `geolocate_frame(frame_path: Path, provider: str = "both", min_confidence: float = 0.3) -> GeoResult | None` — orchestrates API calls. If `both`, calls concurrently with `asyncio.gather` (or sequentially for simplicity in V1). Returns higher-confidence result. Returns `None` if below threshold.
  - `geolocate_batch(frames: list[FrameInfo], provider: str = "both") -> dict[str, GeoResult]` — processes all frames, returns mapping of `frame_path → GeoResult`. Includes rate limiting (1 req/sec per provider).
- [ ] Verify: all tests pass.

---

## Task 6: Stage 3 — Jeepney detection

**Files:**
- Create: `projects/jeepney-spotter/src/jeepney_spotter/detect.py`
- Create: `projects/jeepney-spotter/tests/test_detect.py`
- Create: `projects/jeepney-spotter/tests/fixtures/detect_response.json`

**What to do:**
- [ ] Write tests first (`tests/test_detect.py`):
  - Test `detect_jeepneys(frame_path)` — mock API client. Load fixture. Assert returns list of `Detection` objects with bbox and confidence.
  - Test zero-detection frame — API returns empty jeepneys list. Function returns empty list.
  - Test multiple jeepneys in one frame — returns list of 3 detections.
  - Test bbox validation — rejects invalid bounding boxes (negative coords, x2 < x1, etc).
- [ ] Create fixture: `detect_response.json` — realistic API response with 2 jeepneys detected (one near, one far) with bounding boxes.
- [ ] Implement `detect.py`:
  - `detect_jeepneys(frame_path: Path, provider: str = "claude") -> list[Detection]` — send frame to vision API with detect prompt, parse into `Detection` list. Validate bounding boxes.
  - `detect_batch(frames: list[FrameInfo], provider: str = "claude") -> dict[str, list[Detection]]` — process all frames, return mapping of `frame_path → [Detection]`. Skip frames with no geo result (optional optimization).
- [ ] Verify: all tests pass.

---

## Task 7: Stage 4 — Placard OCR and route matching

**Files:**
- Create: `projects/jeepney-spotter/src/jeepney_spotter/ocr.py`
- Create: `projects/jeepney-spotter/tests/test_ocr.py`
- Create: `projects/jeepney-spotter/tests/fixtures/ocr_response.json`

**What to do:**
- [ ] Write tests first (`tests/test_ocr.py`):
  - Test `read_placard(cropped_image_bytes)` — mock API. Returns `PlacardReading` with raw and cleaned text.
  - Test `clean_placard_text(raw)` — normalizes: uppercase, strips whitespace, standardizes separators ("—", "-", "–" all become " - ").
  - Test `match_route(clean_text, routes)` — fuzzy match against canonical route list:
    - "CUBAO - DIVISORIA" → matches a route with score > 0.80.
    - "CUBAO DIVISOR" (partial) → matches with score 0.50-0.79 (candidate).
    - "XYZZY RANDOM" → no match (score < 0.50).
  - Test match thresholds: ≥0.80 = auto-match, 0.50-0.79 = candidate, <0.50 = unmatched.
  - Test `crop_jeepney(frame_path, bbox)` — crops image to bounding box region using Pillow.
- [ ] Create fixture: `ocr_response.json` — API response reading "CUBAO - DIVISORIA" from a placard.
- [ ] Implement `ocr.py`:
  - `crop_jeepney(frame_path: Path, bbox: list[int]) -> bytes` — open image with Pillow, crop to bbox, return PNG bytes.
  - `read_placard(image_bytes: bytes, provider: str = "claude") -> PlacardReading | None` — send cropped image to VLM with OCR prompt. Parse response.
  - `clean_placard_text(raw: str) -> str` — normalize text.
  - `load_canonical_routes(routes_path: Path) -> list[dict]` — load the 609 routes from `data/routes.json`.
  - `match_route(clean_text: str, routes: list[dict]) -> tuple[str | None, float]` — fuzzy match using `thefuzz.fuzz.token_sort_ratio`. Returns `(route_id, score)` or `(None, score)`.
  - `ocr_batch(frames: list[FrameInfo], detections: dict, routes: list[dict]) -> dict[str, list[PlacardReading]]` — for each frame's detections, crop + OCR + match. Returns mapping.
- [ ] Verify: all tests pass.

---

## Task 8: Stage 5 — Assembly and reporting

**Files:**
- Create: `projects/jeepney-spotter/src/jeepney_spotter/assemble.py`
- Create: `projects/jeepney-spotter/tests/test_assemble.py`

**What to do:**
- [ ] Write tests first (`tests/test_assemble.py`):
  - Test `assemble_observations(frames, geo_results, detections, ocr_results)` — given sample data for 3 frames (one with 2 jeepneys, one with 1, one with 0), returns correct list of `Observation` objects. Assert observation_id format is correct.
  - Test `generate_quality_report(frames, observations)` — computes correct hit rates. Given 10 frames, 6 geolocated, 4 with detections, 3 with placard readings, 2 matched routes → assert percentages are correct.
  - Test `write_outputs(observations, report, unmatched, output_dir)` — writes three files to output_dir. Verify JSONL format for observations.
  - Test filtering: observations with geo_confidence < threshold or detection_confidence < threshold are excluded.
- [ ] Implement `assemble.py`:
  - `assemble_observations(frames, geo_results, detections, ocr_results, min_geo_confidence=0.3, min_detect_confidence=0.3) -> list[Observation]` — join all stage outputs. Generate `observation_id` as `{video_id}_{frame_ts}_{jeepney_idx}`. Filter by thresholds.
  - `generate_quality_report(frames, geo_results, detections, ocr_results, observations) -> QualityReport` — compute per-stage hit rates, API call counts.
  - `collect_unmatched_placards(ocr_results) -> list[dict]` — extract placard readings with no route match or match_confidence < 0.50.
  - `write_outputs(observations, report, unmatched, output_dir: Path)` — write `observations.jsonl` (one JSON object per line), `quality_report.json`, `unmatched_placards.json`.
- [ ] Verify: all tests pass.

---

## Task 9: Pipeline orchestrator

**Files:**
- Create: `projects/jeepney-spotter/src/jeepney_spotter/pipeline.py`
- Create: `projects/jeepney-spotter/tests/test_pipeline.py`

**What to do:**
- [ ] Write tests first (`tests/test_pipeline.py`):
  - Test `run_pipeline(video_url, output_dir, sample_rate, geo_provider)` — mock all stage functions. Assert stages are called in order with correct arguments. Assert outputs are written.
  - Test pipeline handles stage failures gracefully: if geolocate fails for a frame, it's skipped in later stages but doesn't crash the pipeline.
  - Test CLI argument parsing: `--video`, `--output`, `--sample-rate`, `--geo-provider`.
- [ ] Implement `pipeline.py`:
  - `run_pipeline(video_url: str, output_dir: Path, sample_rate: int = 60, geo_provider: str = "both") -> QualityReport`:
    1. Call `extract.run_extraction()` → `frames`
    2. Load canonical routes from `data/routes.json`
    3. Call `geolocate.geolocate_batch()` → `geo_results`
    4. Call `detect.detect_batch()` → `detections` (only for geolocated frames)
    5. Call `ocr.ocr_batch()` → `ocr_results` (only for frames with detections)
    6. Call `assemble.assemble_observations()` → `observations`
    7. Call `assemble.generate_quality_report()` → `report`
    8. Call `assemble.collect_unmatched_placards()` → `unmatched`
    9. Call `assemble.write_outputs()` → write files
    10. Return `report`
  - `main()` — CLI entrypoint using `argparse`. Parse args, call `run_pipeline`, print report summary to stdout.
  - `if __name__ == "__main__": main()` — enables `python -m jeepney_spotter.pipeline`.
- [ ] Add `__main__.py` to package so `python -m jeepney_spotter` works.
- [ ] Verify: all tests pass.

---

## Task 10: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/jeepney-spotter.yml`

**What to do:**
- [ ] Write the workflow YAML:
  ```yaml
  name: Jeepney Spotter Pipeline
  on:
    workflow_dispatch:
      inputs:
        video_url:
          description: "YouTube video URL"
          required: true
        sample_rate:
          description: "Seconds between frame samples"
          default: "60"
        geo_provider:
          description: "VLM provider (claude, gemini, both)"
          default: "both"
  jobs:
    run-pipeline:
      runs-on: ubuntu-latest
      timeout-minutes: 60
      steps:
        - uses: actions/checkout@v4
          with:
            token: ${{ secrets.GH_PAT }}
        - name: Setup Python
          uses: actions/setup-python@v5
          with:
            python-version: "3.12"
        - name: Install system deps
          run: |
            sudo apt-get update && sudo apt-get install -y ffmpeg
            pip install yt-dlp
        - name: Install project
          run: |
            cd projects/jeepney-spotter
            pip install -e ".[dev]"
        - name: Run pipeline
          env:
            ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
            GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          run: |
            cd projects/jeepney-spotter
            python -m jeepney_spotter.pipeline \
              --video "${{ github.event.inputs.video_url }}" \
              --output v1/results/ \
              --sample-rate ${{ github.event.inputs.sample_rate }} \
              --geo-provider ${{ github.event.inputs.geo_provider }}
        - name: Commit results
          run: |
            cd projects/jeepney-spotter
            git config user.name "jeepney-spotter[bot]"
            git config user.email "jeepney-spotter[bot]@users.noreply.github.com"
            git add v1/results/
            git diff --cached --quiet || git commit -m "jeepney-spotter: V1 run $(date +%Y-%m-%d) — ${{ github.event.inputs.video_url }}"
            git push
  ```
- [ ] Verify: workflow YAML is valid (can check with `actionlint` if available, or manual review).

---

## Task 11: Integration test with fixture data

**Files:**
- Create: `projects/jeepney-spotter/tests/test_integration.py`
- Update: `projects/jeepney-spotter/tests/fixtures/` (add end-to-end fixture data)

**What to do:**
- [ ] Create end-to-end fixture data:
  - `fixtures/sample_frame_info.json` — 3 fake `FrameInfo` entries.
  - `fixtures/sample_geo_results.json` — geo results for the 3 frames (2 successful, 1 low-confidence).
  - `fixtures/sample_detections.json` — detections for 2 geolocated frames (3 total jeepneys).
  - `fixtures/sample_ocr_results.json` — OCR readings for the 3 detected jeepneys (2 matched, 1 unmatched).
- [ ] Write integration test:
  - Mock only the external calls (API clients, yt-dlp, ffmpeg).
  - Run `pipeline.run_pipeline()` with mocked dependencies.
  - Assert: correct number of observations written, quality report has expected hit rates, unmatched placards file exists.
- [ ] Verify: integration test passes.

---

## Task 12: Local test run and documentation

**Files:**
- Update: `projects/jeepney-spotter/README.md` (expand with setup instructions)

**What to do:**
- [ ] Run full test suite: `cd projects/jeepney-spotter && uv run pytest -v`.
- [ ] Fix any failures.
- [ ] Update README with:
  - How to run tests locally.
  - How to trigger the GitHub Actions workflow.
  - Link to the V1 spec and success criteria.
  - Example output format (sample observation JSON).
- [ ] Final commit with all files.

---

## Dependency Graph

```
Task 1 (scaffold)
  └──▶ Task 2 (models)
         └──▶ Task 3 (prompts)
         │      └──▶ Task 5 (geolocate) ──▶ Task 6 (detect) ──▶ Task 7 (OCR)
         │                                                           │
         └──▶ Task 4 (extract)                                      │
                    │                                                │
                    ▼                                                ▼
              Task 8 (assemble) ◀────────────────────────────────────┘
                    │
                    ▼
              Task 9 (pipeline orchestrator)
                    │
                    ├──▶ Task 10 (GitHub Actions workflow)
                    └──▶ Task 11 (integration test)
                              │
                              ▼
                        Task 12 (docs + final test)
```

Tasks 4-7 (individual stages) can be worked in parallel once Tasks 2-3 are done, since they only depend on models and prompts. The critical serial path is: scaffold → models → stages → assemble → pipeline → workflow.
