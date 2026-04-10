# Jeepney Spotter Serverless Pipeline — Implementation Plan

**Spec:** `docs/autopilot/jeepney-spotter-serverless-pipeline-spec.md`
**Target Directory:** `projects/jeepney-spotter/`

## Prerequisites

- AWS account with CDK bootstrapped (`cdk bootstrap`)
- Python 3.12 installed locally
- AWS CLI configured with appropriate credentials
- Anthropic API key and Google API key available

## Project Structure (final state)

```
projects/jeepney-spotter/
├── README.md                          # Setup, deploy, usage instructions
├── pyproject.toml                     # uv project — shared deps + dev tooling
│
├── infra/                             # CDK infrastructure
│   ├── app.py                         # CDK app entry point
│   ├── cdk.json                       # CDK config
│   ├── requirements.txt               # CDK Python deps
│   └── stacks/
│       └── jeepney_spotter_stack.py   # Single stack: all resources
│
├── lambdas/                           # Lambda function code
│   ├── extract/
│   │   ├── handler.py                 # Stage 1: yt-dlp + ffmpeg → S3
│   │   └── requirements.txt
│   ├── geolocate/
│   │   ├── handler.py                 # Stage 2: VLM geolocation
│   │   └── requirements.txt
│   ├── detect/
│   │   ├── handler.py                 # Stage 3: jeepney bounding boxes
│   │   └── requirements.txt
│   ├── flatten/
│   │   ├── handler.py                 # Utility: flatten detections array
│   │   └── requirements.txt
│   ├── ocr/
│   │   ├── handler.py                 # Stage 4: placard OCR + route match
│   │   └── requirements.txt
│   └── assemble/
│       ├── handler.py                 # Stage 5: combine → observations.jsonl
│       └── requirements.txt
│
├── layers/                            # Lambda layer build scripts
│   ├── ffmpeg-ytdlp/
│   │   └── build.sh                   # Downloads static binaries for AL2023 arm64
│   └── pillow-thefuzz/
│       └── build.sh                   # pip install into layer structure
│
├── state_machine/
│   └── definition.asl.json            # Step Functions ASL (Amazon States Language)
│
├── data/
│   └── canonical-routes.json          # Copied from mm-transit-routes-reverse for S3 upload
│
└── tests/
    ├── unit/
    │   ├── test_extract.py
    │   ├── test_geolocate.py
    │   ├── test_detect.py
    │   ├── test_flatten.py
    │   ├── test_ocr.py
    │   └── test_assemble.py
    └── integration/
        └── test_state_machine.py      # Local Step Functions testing with mocked Lambdas
```

---

## Implementation Tasks

Tasks are ordered by dependency. Each task is self-contained and committable.

---

### Task 1: Project scaffolding

Create the directory structure, `pyproject.toml`, and `README.md`.

**Files to create:**
- `projects/jeepney-spotter/pyproject.toml` — Python 3.12, dev deps (pytest, moto, boto3)
- `projects/jeepney-spotter/README.md` — Project overview, links to spec, setup instructions placeholder
- All empty `__init__.py` and directory stubs per the structure above

**Details:**
- `pyproject.toml` uses `uv` as the project manager (matching repo conventions)
- Dev dependencies: `pytest`, `moto[s3,stepfunctions,lambda,secretsmanager]`, `boto3-stubs`
- No runtime dependencies at project root — each Lambda has its own `requirements.txt`

**Commit:** `autopilot: scaffold jeepney-spotter project structure`

---

### Task 2: Canonical routes data file

Copy and transform the route data from the existing loop into the format needed for fuzzy matching.

**Input:** `loops/mm-transit-routes-reverse/raw/canonical-jeepney-routes.json`

**Output:** `projects/jeepney-spotter/data/canonical-routes.json`

**Transform:** Extract only the fields needed for matching:
```json
[
  {
    "route_id": "DOTR:R_SAKAY_PUJ_1607",
    "route_name": "Baclaran-Divisoria via Taft",
    "origin": "Baclaran",
    "destination": "Divisoria",
    "aliases": ["Baclaran-Divisoria", "Divisoria-Baclaran"]
  }
]
```

Generate aliases by:
1. Full route_name as-is
2. Origin-Destination (no "via" suffix)
3. Destination-Origin (reversed)
4. Any common abbreviations found in the data (e.g., "QC" for "Quezon City")

This is a one-time data prep script, not a Lambda — can be a simple Python script in `data/prepare_routes.py`.

**Commit:** `autopilot: add canonical routes data for fuzzy matching`

---

### Task 3: Extract Lambda handler

Implement the frame extraction Lambda.

**File:** `lambdas/extract/handler.py`

**Input event:**
```json
{
  "youtube_url": "https://www.youtube.com/watch?v=...",
  "sample_rate_s": 60,
  "execution_id": "arn:aws:states:...",
  "bucket": "jeepney-spotter-data-123456789"
}
```

**Logic:**
1. Parse input, derive `video_id` from URL
2. Build S3 prefix: `runs/{execution_id}/frames/`
3. Run `yt-dlp` via subprocess to download video to `/tmp/video.mp4`
   - Format: `bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]`
   - Output: `/tmp/{video_id}.mp4`
4. Get video duration via `ffprobe`
5. Run `ffmpeg` to extract frames:
   - `-vf "fps=1/{sample_rate_s}"` — one frame every N seconds
   - Output: `/tmp/frames/{video_id}_f{timestamp:04d}.png`
6. Upload all frames to S3 using `boto3` multipart upload
7. Return `{ "video_id": "...", "s3_prefix": "runs/.../frames/", "frame_keys": ["runs/.../frames/vid_f0000.png", ...], "frame_count": 60, "video_duration_s": 3600 }`

**Error handling:**
- `yt-dlp` failure (private video, geo-blocked): raise with descriptive error message
- `/tmp` space exhaustion: pre-check video file size estimate from `yt-dlp --dump-json`
- `ffmpeg` failure: raise with stderr output

**File:** `lambdas/extract/requirements.txt` — `boto3` (only — yt-dlp and ffmpeg are in the layer)

**Commit:** `autopilot: implement extract Lambda handler`

---

### Task 4: Extract Lambda unit tests

**File:** `tests/unit/test_extract.py`

**Tests:**
1. `test_parse_video_id` — extracts video ID from various YouTube URL formats (watch, short, embed)
2. `test_build_s3_prefix` — correct prefix construction from execution_id
3. `test_frame_filename_format` — verifies `{video_id}_f{timestamp:04d}.png` naming
4. `test_handler_uploads_frames` — mock subprocess calls (yt-dlp, ffmpeg), mock S3 (moto), verify frames uploaded to correct keys
5. `test_handler_rejects_invalid_url` — non-YouTube URL raises ValueError
6. `test_handler_format_selection` — verify yt-dlp is called with height<=480 format

**Commit:** `autopilot: add extract Lambda tests`

---

### Task 5: Geolocate Lambda handler

**File:** `lambdas/geolocate/handler.py`

**Input event (from Map state — one frame):**
```json
{
  "frame_key": "runs/{exec_id}/frames/{video_id}_f0060.png",
  "execution_id": "...",
  "bucket": "..."
}
```

**Logic:**
1. Download frame from S3 to memory (bytes)
2. Base64-encode frame for API calls
3. Call Claude Vision API:
   - Model: `claude-sonnet-4-20250514` (best price/performance for vision)
   - System prompt: geolocation specialist for Metro Manila dashcam footage
   - User prompt: "Identify visible landmarks, street signs, business names, and road features. Estimate latitude and longitude. Return JSON: `{ lat, lon, confidence, landmarks: string[], reasoning: string }`"
   - Parse structured JSON from response
4. Call Gemini Vision API:
   - Model: `gemini-2.0-flash`
   - Same prompt strategy
   - Parse structured JSON
5. Merge results:
   - If both confidence > 0.7 and within 500m: average lat/lon, max confidence
   - If one confidence > other by 0.3+: take the higher
   - Otherwise: take the higher confidence result as-is
6. Write result to `s3://bucket/runs/{exec_id}/geo/{frame_basename}.json`
7. Return summary: `{ frame_key, lat, lon, confidence, source: "claude|gemini|averaged" }`

**API key retrieval:**
- Module-level `_secrets_cache = None`
- On first invocation, fetch from Secrets Manager, parse JSON, cache in global
- Subsequent invocations (warm Lambda) reuse cache

**File:** `lambdas/geolocate/requirements.txt` — `boto3`, `anthropic`, `google-genai`

**Commit:** `autopilot: implement geolocate Lambda handler`

---

### Task 6: Geolocate Lambda unit tests

**File:** `tests/unit/test_geolocate.py`

**Tests:**
1. `test_merge_results_both_confident` — both >0.7, within 500m → averaged
2. `test_merge_results_one_dominant` — one much higher confidence → takes that one
3. `test_merge_results_one_failed` — one returns error → takes the other
4. `test_secrets_caching` — verify Secrets Manager called only once across invocations
5. `test_handler_writes_to_correct_s3_key` — mock APIs, verify S3 output path
6. `test_low_confidence_frame` — both models return <0.3 → result still written but marked low confidence

**Commit:** `autopilot: add geolocate Lambda tests`

---

### Task 7: Detect Lambda handler

**File:** `lambdas/detect/handler.py`

**Input event (from Map state — one frame):**
```json
{
  "frame_key": "runs/{exec_id}/frames/{video_id}_f0060.png",
  "execution_id": "...",
  "bucket": "..."
}
```

**Logic:**
1. Download frame from S3
2. Call Claude Vision API:
   - Prompt: "This is a dashcam frame from Metro Manila. Identify all jeepneys visible in the image. For each jeepney, return its bounding box as [x1, y1, x2, y2] in pixel coordinates and a confidence score 0-1. Return JSON: `{ detections: [{ bbox: [x1,y1,x2,y2], confidence: float }] }`. If no jeepneys are visible, return `{ detections: [] }`."
3. Write to `s3://bucket/runs/{exec_id}/detections/{frame_basename}.json`:
   ```json
   {
     "frame_key": "...",
     "detections": [
       { "bbox": [100, 200, 400, 500], "confidence": 0.85, "detection_idx": 0 },
       { "bbox": [600, 180, 900, 480], "confidence": 0.72, "detection_idx": 1 }
     ]
   }
   ```
4. Return: `{ frame_key, detection_count, detections: [{bbox, confidence, detection_idx}] }`

**Commit:** `autopilot: implement detect Lambda handler`

---

### Task 8: Detect Lambda unit tests

**File:** `tests/unit/test_detect.py`

**Tests:**
1. `test_handler_no_jeepneys` — model returns empty detections → writes `{ detections: [] }`
2. `test_handler_multiple_jeepneys` — model returns 3 detections → all written with correct indices
3. `test_detection_idx_assignment` — indices are sequential starting from 0
4. `test_bbox_format_validation` — bbox must be 4 integers, x2>x1, y2>y1
5. `test_s3_output_path` — correct key construction

**Commit:** `autopilot: add detect Lambda tests`

---

### Task 9: Flatten Lambda handler

**File:** `lambdas/flatten/handler.py`

**Input event:**
```json
{
  "detect_results": [
    { "frame_key": "f0000.png", "detection_count": 2, "detections": [{...}, {...}] },
    { "frame_key": "f0060.png", "detection_count": 0, "detections": [] },
    { "frame_key": "f0120.png", "detection_count": 1, "detections": [{...}] }
  ],
  "execution_id": "...",
  "bucket": "..."
}
```

**Logic:**
1. Iterate through detect_results
2. For each frame with detections > 0, emit one item per detection:
   ```json
   {
     "frame_key": "runs/.../frames/vid_f0000.png",
     "detection_idx": 0,
     "bbox": [100, 200, 400, 500],
     "execution_id": "...",
     "bucket": "..."
   }
   ```
3. Return `{ "all_detections": [...], "total_detections": N }`

**This is a pure data transformation — no S3 reads, no API calls.** It exists solely to reshape the Map state output into a flat array for the OCR Map state.

**File:** `lambdas/flatten/requirements.txt` — empty (only stdlib needed)

**Commit:** `autopilot: implement flatten Lambda handler`

---

### Task 10: Flatten Lambda unit tests

**File:** `tests/unit/test_flatten.py`

**Tests:**
1. `test_flatten_multiple_frames` — 3 frames with [2, 0, 1] detections → 3 items
2. `test_flatten_all_empty` — all frames have 0 detections → empty list
3. `test_flatten_preserves_metadata` — each item carries frame_key, bbox, detection_idx, execution_id, bucket
4. `test_flatten_single_frame_many_detections` — 1 frame with 5 detections → 5 items

**Commit:** `autopilot: add flatten Lambda tests`

---

### Task 11: OCR Lambda handler

**File:** `lambdas/ocr/handler.py`

**Input event (from Map state — one detection):**
```json
{
  "frame_key": "runs/{exec_id}/frames/{video_id}_f0060.png",
  "detection_idx": 0,
  "bbox": [100, 200, 400, 500],
  "execution_id": "...",
  "bucket": "..."
}
```

**Logic:**
1. Download frame from S3
2. Open with Pillow, crop to bbox region: `img.crop((x1, y1, x2, y2))`
3. Encode cropped image as base64 PNG
4. Call Claude Vision API:
   - Prompt: "This is a cropped image of a jeepney in Metro Manila. Read the route placard text — typically displayed on the windshield or side of the vehicle, showing the route as origin-destination (e.g., 'CUBAO - DIVISORIA'). Return JSON: `{ placard_text_raw: string|null, readable: bool, reasoning: string }`. If no placard is visible or readable, set readable to false and placard_text_raw to null."
5. If readable:
   a. Normalize: uppercase, strip whitespace, normalize separators ("–", "—", "-" → " - ")
   b. Load canonical routes from S3 (cached in module-level global, loaded once per cold start)
   c. Fuzzy match using `thefuzz.process.extractOne()` against all route names + aliases
   d. Apply thresholds: ≥0.80 = match, 0.50-0.79 = candidate, <0.50 = unmatched
6. Write to `s3://bucket/runs/{exec_id}/ocr/{frame_basename}_d{detection_idx}.json`:
   ```json
   {
     "frame_key": "...",
     "detection_idx": 0,
     "bbox": [100, 200, 400, 500],
     "placard_text_raw": "CUBAO-DIVISORIA",
     "placard_text_clean": "CUBAO - DIVISORIA",
     "matched_route_id": "DOTR:R_SAKAY_PUJ_1234",
     "matched_route_name": "Cubao-Divisoria via Aurora Blvd",
     "match_confidence": 0.92,
     "match_tier": "match",
     "readable": true
   }
   ```
7. Return summary

**File:** `lambdas/ocr/requirements.txt` — `boto3`, `anthropic`, `Pillow`, `thefuzz[speedup]`

**Commit:** `autopilot: implement OCR Lambda handler`

---

### Task 12: OCR Lambda unit tests

**File:** `tests/unit/test_ocr.py`

**Tests:**
1. `test_normalize_placard_text` — various separator styles all normalize to " - "
2. `test_fuzzy_match_exact` — "CUBAO - DIVISORIA" matches with high score
3. `test_fuzzy_match_partial` — "CUBAO DIVISO" matches with medium score
4. `test_fuzzy_match_reversed` — "DIVISORIA - CUBAO" matches the same route
5. `test_match_threshold_tiers` — verify match/candidate/unmatched tier assignment
6. `test_unreadable_placard` — model returns readable=false → no matching attempted
7. `test_crop_bbox` — verify Pillow crop coordinates are correct
8. `test_canonical_routes_caching` — S3 read only on cold start

**Commit:** `autopilot: add OCR Lambda tests`

---

### Task 13: Assemble Lambda handler

**File:** `lambdas/assemble/handler.py`

**Input event:**
```json
{
  "execution_id": "...",
  "bucket": "...",
  "video_id": "...",
  "extract": { "frame_count": 60, "video_duration_s": 3600 },
  "geo_results": [...],
  "ocr_results": [...]
}
```

**Logic:**
1. List all files under `runs/{exec_id}/geo/`, `runs/{exec_id}/detections/`, `runs/{exec_id}/ocr/` from S3
2. Load all JSON files into memory (at V1 scale: ~60 geo + ~60 detection + ~N OCR files, all small)
3. Build observations by joining:
   - For each OCR result (= one jeepney sighting):
     - Find the geo result for the same frame → attach lat/lon/confidence
     - Find the detection result → attach bbox/detection_confidence
     - Build full observation record per the schema in the parent spec
4. Apply filters:
   - Skip observations where `geo_confidence < 0.3` (can't place on map)
   - Skip observations where `detection_confidence < 0.3` (likely false positive)
5. Write outputs to `s3://bucket/runs/{exec_id}/output/`:
   - `observations.jsonl` — one JSON line per observation, all fields
   - `quality_report.json`:
     ```json
     {
       "video_id": "...",
       "execution_id": "...",
       "frames_total": 60,
       "frames_geolocated": 35,
       "frames_with_jeepneys": 22,
       "total_detections": 41,
       "placards_readable": 18,
       "placards_matched": 12,
       "placards_candidate": 3,
       "placards_unmatched": 3,
       "observations_total": 12,
       "unique_routes_observed": 8,
       "stage_hit_rates": {
         "geolocation": 0.58,
         "detection": 0.37,
         "ocr_readable": 0.44,
         "route_match": 0.67
       }
     }
     ```
   - `unmatched_placards.json` — list of `{ placard_text_raw, placard_text_clean, frame_key, bbox }` for manual review
6. Return the quality report as the Lambda output (visible in Step Functions execution)

**File:** `lambdas/assemble/requirements.txt` — `boto3`

**Commit:** `autopilot: implement assemble Lambda handler`

---

### Task 14: Assemble Lambda unit tests

**File:** `tests/unit/test_assemble.py`

**Tests:**
1. `test_join_geo_detection_ocr` — correctly joins data from 3 stages by frame_key
2. `test_filter_low_geo_confidence` — observations with geo_confidence < 0.3 excluded
3. `test_filter_low_detection_confidence` — observations with detection_confidence < 0.3 excluded
4. `test_quality_report_stats` — correct hit rate calculations
5. `test_unmatched_placards_collection` — unmatched OCR results collected into separate file
6. `test_observations_jsonl_format` — each line is valid JSON, all fields present
7. `test_empty_pipeline` — no detections, no OCR results → empty observations, quality report shows zeros

**Commit:** `autopilot: add assemble Lambda tests`

---

### Task 15: Step Functions state machine definition (ASL)

**File:** `state_machine/definition.asl.json`

Write the complete Amazon States Language definition for the pipeline. This is the central orchestration artifact.

**States:**
1. `Extract` — Task state invoking extract Lambda, 900s timeout
2. `Geolocate` — Map state over `$.extract.frame_keys`, MaxConcurrency 10
3. `Detect` — Map state over `$.extract.frame_keys`, MaxConcurrency 10
4. `FlattenDetections` — Task state invoking flatten Lambda
5. `OCR` — Map state over `$.all_detections`, MaxConcurrency 10
6. `Assemble` — Task state invoking assemble Lambda, 300s timeout
7. `PipelineSucceeded` — Succeed state
8. `PipelineFailed` — Fail state

**Each Task state includes:**
- `Retry` block: `Lambda.ServiceException`, `Lambda.TooManyRequestsException` — MaxAttempts 2, BackoffRate 2.0
- `Catch` block: `States.ALL` → `PipelineFailed`

**Data flow:**
- Extract output goes to `$.extract`
- Each Map state passes `$.extract.bucket` and `$.extract.execution_id` into each iteration via `Parameters`
- Geolocate results go to `$.geo_results` (informational — actual data is in S3)
- Detect results go to `$.detect_results`
- FlattenDetections reads `$.detect_results`, writes to `$.all_detections`
- OCR results go to `$.ocr_results`
- Assemble reads from S3 (not from Step Functions payload) and writes final output

**Payload size management:**
- Map state results can be large (60 items). Use `ResultSelector` to trim each Map iteration's output to only the fields needed downstream (frame_key, counts, etc.) — not the full API responses.
- Full data always goes to S3; Step Functions payload carries only metadata and S3 pointers.

**Commit:** `autopilot: add Step Functions state machine definition`

---

### Task 16: CDK stack — S3 bucket + Secrets Manager

**File:** `infra/stacks/jeepney_spotter_stack.py` (partial — bucket + secrets)

Create the CDK stack with:
- S3 bucket: `jeepney-spotter-data-{account}` (or auto-generated name)
  - Lifecycle rule: delete objects under `runs/` prefix after 30 days
  - Block public access
  - Versioning disabled (frames are ephemeral)
- Secrets Manager secret: `jeepney-spotter/api-keys`
  - Created empty, populated manually after deploy
  - Description: "Anthropic and Google API keys for Jeepney Spotter pipeline"

Also create:
- `infra/app.py` — CDK app entry point
- `infra/cdk.json` — CDK config
- `infra/requirements.txt` — `aws-cdk-lib`, `constructs`

**Commit:** `autopilot: add CDK stack — S3 bucket and secrets`

---

### Task 17: CDK stack — Lambda layers

Add to the CDK stack:
- `ffmpeg-ytdlp` layer: reference a pre-built layer ARN (community `ffmpeg` layer) + bundled `yt-dlp` binary
- `pillow-thefuzz` layer: built from requirements via `aws_lambda_python_alpha.PythonLayerVersion` (CDK's built-in Docker-based layer builder)

Create layer build scripts:
- `layers/ffmpeg-ytdlp/build.sh` — downloads `yt-dlp` binary and `ffmpeg` static build for arm64 Linux, packages into layer zip structure (`bin/ffmpeg`, `bin/yt-dlp`)
- `layers/pillow-thefuzz/build.sh` — pip installs into `python/` directory structure for Lambda layer

**Commit:** `autopilot: add CDK Lambda layer definitions`

---

### Task 18: CDK stack — Lambda functions

Add all 6 Lambda functions to the CDK stack:

| Function | Memory | Timeout | Layers | Ephemeral Storage |
|----------|--------|---------|--------|-------------------|
| extract | 1024 MB | 15 min | ffmpeg-ytdlp | 4096 MB |
| geolocate | 256 MB | 2 min | — | default |
| detect | 256 MB | 2 min | — | default |
| flatten | 128 MB | 30 sec | — | default |
| ocr | 512 MB | 2 min | pillow-thefuzz | default |
| assemble | 512 MB | 5 min | — | default |

All Lambdas:
- Runtime: Python 3.12
- Architecture: arm64 (Graviton — cheaper, `yt-dlp`/`ffmpeg` static builds available)
- Environment variables: `BUCKET_NAME`, `SECRET_ARN` (non-sensitive config only)
- Code: bundled from `lambdas/{name}/` directory

Single shared IAM role with:
- `s3:GetObject`, `s3:PutObject`, `s3:ListBucket` on the data bucket
- `secretsmanager:GetSecretValue` on the API keys secret
- `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`

**Commit:** `autopilot: add CDK Lambda function definitions`

---

### Task 19: CDK stack — Step Functions state machine

Add the Step Functions state machine to the CDK stack:

- Import the ASL definition from `state_machine/definition.asl.json`
- Use `aws_stepfunctions.StateMachine` with `definitionBody` from file
- Substitute Lambda ARNs into the ASL using CDK's `definitionSubstitutions`
- State machine type: STANDARD
- IAM role: `lambda:InvokeFunction` on all 6 Lambda ARNs
- Logging: log level ALL to a CloudWatch log group

**Commit:** `autopilot: add CDK Step Functions state machine`

---

### Task 20: CDK stack — API Gateway

Add API Gateway to the CDK stack:

- REST API: `JeepneySpotterAPI`
- `POST /process-video`:
  - Integration: Step Functions `StartExecution` (AWS service integration)
  - Request body mapping: extract `youtube_url` and `sample_rate_s` from body, pass as state machine input
  - Response: return `{ execution_arn, execution_id }`
  - API key required: yes
- `GET /status/{executionId}`:
  - Integration: Step Functions `DescribeExecution` (AWS service integration)
  - Response: return execution status, start time, output (if complete)
  - API key required: yes
- Usage plan + API key created automatically
- CORS: enabled for `*` (V1 simplicity)

**Commit:** `autopilot: add CDK API Gateway`

---

### Task 21: CDK stack — final wiring and outputs

Final CDK stack additions:
- Stack outputs:
  - API Gateway URL
  - API key ID (retrieve value via AWS console)
  - S3 bucket name
  - State machine ARN
  - CloudWatch log group name
- Tags: `project: jeepney-spotter`, `environment: dev`
- Removal policy: DESTROY on all resources (V1 is ephemeral)

Review complete stack for circular dependencies, missing permissions, resource naming conflicts.

**Commit:** `autopilot: finalize CDK stack wiring and outputs`

---

### Task 22: Shared utilities — API client wrappers

**File:** `lambdas/shared/vision_api.py`

Shared module (copied into each Lambda that needs it, or symlinked at build time):
- `get_secrets(secret_arn)` — fetch + cache Secrets Manager value
- `call_claude_vision(image_bytes, prompt, model="claude-sonnet-4-20250514")` — wraps Anthropic SDK, returns parsed JSON
- `call_gemini_vision(image_bytes, prompt, model="gemini-2.0-flash")` — wraps Google GenAI SDK, returns parsed JSON
- Both include retry logic for 429/5xx (3 attempts, exponential backoff)
- Both enforce structured JSON output via system prompts

This avoids duplicating API calling logic across geolocate, detect, and ocr Lambdas.

**Commit:** `autopilot: add shared vision API client utilities`

---

### Task 23: Shared utilities unit tests

**File:** `tests/unit/test_vision_api.py`

**Tests:**
1. `test_get_secrets_caching` — called twice, Secrets Manager hit once
2. `test_call_claude_vision_success` — mock httpx, verify request format, parse response
3. `test_call_gemini_vision_success` — mock, verify, parse
4. `test_retry_on_429` — first call returns 429, second succeeds
5. `test_retry_exhausted` — 3x 429 → raises exception
6. `test_json_extraction_from_markdown` — model wraps JSON in ```json``` fences → still parsed

**Commit:** `autopilot: add shared utilities tests`

---

### Task 24: Integration test — state machine with mocked Lambdas

**File:** `tests/integration/test_state_machine.py`

Use `moto` to mock Step Functions execution, or more practically, test the data flow contract:
1. Create a fixture with sample outputs from each stage
2. Verify Extract output schema feeds correctly into Geolocate Map input
3. Verify Detect output + FlattenDetections produces correct OCR Map input
4. Verify Assemble can consume the combined outputs from all stages
5. Test the full data flow with fixture data end-to-end (no AWS calls)

This validates the "contract" between stages — if each stage's output schema matches the next stage's expected input.

**Commit:** `autopilot: add integration test for stage data contracts`

---

### Task 25: README and deployment guide

**File:** `projects/jeepney-spotter/README.md` (update from stub)

Sections:
1. **Overview** — what this does, link to spec
2. **Architecture diagram** — ASCII version of the Step Functions flow
3. **Prerequisites** — AWS account, CDK, Python 3.12, API keys
4. **Quick Start**:
   - `cd infra && pip install -r requirements.txt`
   - `cdk deploy`
   - Populate secrets: `aws secretsmanager put-secret-value ...`
   - Upload canonical routes: `aws s3 cp data/canonical-routes.json s3://bucket/routes/`
   - Trigger: `curl -X POST https://api-url/process-video -H "x-api-key: ..." -d '{"youtube_url": "...", "sample_rate_s": 60}'`
   - Check status: `curl https://api-url/status/{execution_id} -H "x-api-key: ..."`
   - Download results: `aws s3 cp s3://bucket/runs/{exec_id}/output/ ./results/ --recursive`
5. **Cost** — estimated per-run costs
6. **V2 Roadmap** — ECS extract, per-Lambda IAM, batch processing, WebSocket updates
7. **Troubleshooting** — common issues (Lambda timeout, API rate limits, yt-dlp failures)

**Commit:** `autopilot: update README with deployment guide`

---

## Task Dependency Graph

```
Task 1 (scaffold)
├── Task 2 (canonical routes data)
├── Task 22 (shared vision API utilities)
│   └── Task 23 (shared utilities tests)
├── Task 3 (extract handler)
│   └── Task 4 (extract tests)
├── Task 5 (geolocate handler)  ← depends on Task 22
│   └── Task 6 (geolocate tests)
├── Task 7 (detect handler)     ← depends on Task 22
│   └── Task 8 (detect tests)
├── Task 9 (flatten handler)
│   └── Task 10 (flatten tests)
├── Task 11 (OCR handler)       ← depends on Task 2, Task 22
│   └── Task 12 (OCR tests)
├── Task 13 (assemble handler)
│   └── Task 14 (assemble tests)
├── Task 15 (ASL definition)
├── Task 16 (CDK: S3 + secrets)
│   └── Task 17 (CDK: layers)
│       └── Task 18 (CDK: Lambdas) ← depends on Tasks 3,5,7,9,11,13
│           └── Task 19 (CDK: Step Functions) ← depends on Task 15
│               └── Task 20 (CDK: API Gateway)
│                   └── Task 21 (CDK: final wiring)
├── Task 24 (integration tests) ← depends on Tasks 3-14
└── Task 25 (README)            ← depends on Task 21
```

## Recommended Implementation Order

1. Task 1 — scaffold
2. Task 2 — canonical routes data
3. Task 22 — shared vision utilities
4. Task 23 — shared utilities tests
5. Tasks 3, 5, 7, 9, 11, 13 — all Lambda handlers (can parallelize)
6. Tasks 4, 6, 8, 10, 12, 14 — all Lambda tests (can parallelize)
7. Task 15 — ASL definition
8. Tasks 16 → 17 → 18 → 19 → 20 → 21 — CDK stack (sequential)
9. Task 24 — integration tests
10. Task 25 — README
