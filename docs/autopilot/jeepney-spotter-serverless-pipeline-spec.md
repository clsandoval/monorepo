# Jeepney Spotter — Serverless AWS Pipeline Design

**Date:** 2026-04-10
**Status:** Draft
**Parent Spec:** `docs/superpowers/specs/2026-04-08-jeepney-spotter-design.md`
**Repository:** `projects/jeepney-spotter/` (new)

## Problem Statement

The `mm-transit-routes-reverse` loop compiled 609 canonical jeepney routes into a GTFS feed, but **zero** have polyline geometry — the `shapes.txt` file contains 246 shapes, all for bus and rail modes. The existing design spec describes a 5-stage video processing pipeline (Extract → Geolocate → Detect → OCR → Assemble) to reconstruct route shapes from YouTube dashcam footage. That spec assumes a local CLI tool. This spec designs the **serverless AWS deployment** of that pipeline.

## Chosen Approach: AWS Step Functions Orchestrator

**Architecture:** API Gateway → Step Functions state machine → Lambdas + S3

Each pipeline stage becomes a Lambda function. S3 is the data bus — each stage reads its inputs from S3 and writes outputs to S3. Step Functions orchestrates the stages sequentially, with Map states fanning out per-frame for parallel processing in stages 2-4.

### Why Step Functions (not SQS/EventBridge, not ECS pipeline, not plain Lambda chaining)

| Option | Pros | Cons |
|--------|------|------|
| **Step Functions** (chosen) | Visual workflow, built-in Map state for fan-out, native retry/error handling, execution history for debugging, integrates with Lambda/S3/ECS natively | Step Functions Express costs can add up at scale; Standard mode has 25k event limit |
| SQS + Lambda triggers | Simpler per-stage, natural backpressure | No orchestration visibility, error handling is DIY, harder to track end-to-end execution |
| ECS pipeline | No timeout limits, arbitrary compute | Overkill for V1 (~200 API calls), cold start is slow, more expensive at low scale |
| Lambda chaining (async invoke) | Simplest | No visibility, lost executions on failure, no fan-out/fan-in |

**Step Functions mode: Standard** (not Express). Standard provides execution history, visual debugging, and supports long-running workflows (up to 1 year). The extract stage alone may take 5-10 minutes. Express mode's 5-minute limit is too tight, and we only run ~1 execution per session at V1 scale — cost is negligible.

## Architecture

### High-Level Flow

```
┌────────────────────────────────────────────────────────────────┐
│  API Gateway (POST /process-video)                             │
│  Body: { "youtube_url": "...", "sample_rate_s": 60 }          │
└──────────────┬─────────────────────────────────────────────────┘
               │ StartExecution
               ▼
┌────────────────────────────────────────────────────────────────┐
│  Step Functions State Machine: JeepneySpotterPipeline          │
│                                                                │
│  ┌──────────────────────────────────────────┐                  │
│  │ 1. Extract (Lambda — 15 min timeout)     │                  │
│  │    Input: youtube_url, sample_rate_s      │                  │
│  │    Output: s3_prefix, frame_keys[]        │                  │
│  └──────────────┬───────────────────────────┘                  │
│                 │                                               │
│  ┌──────────────▼───────────────────────────┐                  │
│  │ 2. Geolocate (Map state — fan-out)       │                  │
│  │    Items: frame_keys[]                    │                  │
│  │    MaxConcurrency: 10                     │                  │
│  │    Each: Lambda calls Claude + Gemini     │                  │
│  │    Output: geo_results[]                  │                  │
│  └──────────────┬───────────────────────────┘                  │
│                 │                                               │
│  ┌──────────────▼───────────────────────────┐                  │
│  │ 3. Detect (Map state — fan-out)          │                  │
│  │    Items: frame_keys[]                    │                  │
│  │    MaxConcurrency: 10                     │                  │
│  │    Each: Lambda calls Claude/Gemini       │                  │
│  │    Output: detections[]                   │                  │
│  └──────────────┬───────────────────────────┘                  │
│                 │                                               │
│  ┌──────────────▼───────────────────────────┐                  │
│  │ 4. OCR (Map state — fan-out)             │                  │
│  │    Items: all_detections[] (flattened)    │                  │
│  │    MaxConcurrency: 10                     │                  │
│  │    Each: Lambda crops bbox, reads placard │                  │
│  │          + fuzzy match against 604 routes │                  │
│  │    Output: ocr_results[]                  │                  │
│  └──────────────┬───────────────────────────┘                  │
│                 │                                               │
│  ┌──────────────▼───────────────────────────┐                  │
│  │ 5. Assemble (Lambda)                     │                  │
│  │    Reads all S3 outputs from stages 2-4   │                  │
│  │    Writes: observations.jsonl             │                  │
│  │            quality_report.json            │                  │
│  │            unmatched_placards.json         │                  │
│  └──────────────────────────────────────────┘                  │
└────────────────────────────────────────────────────────────────┘
```

### S3 Bucket Structure

Single bucket: `jeepney-spotter-data-{account_id}`

```
s3://jeepney-spotter-data-{account_id}/
├── runs/
│   └── {execution_id}/              # One prefix per Step Functions execution
│       ├── input.json               # Original request payload
│       ├── frames/                  # Stage 1 output
│       │   ├── {video_id}_f0000.png
│       │   ├── {video_id}_f0060.png
│       │   └── ...
│       ├── geo/                     # Stage 2 output
│       │   ├── {video_id}_f0000.json
│       │   └── ...
│       ├── detections/              # Stage 3 output
│       │   ├── {video_id}_f0000.json
│       │   └── ...
│       ├── ocr/                     # Stage 4 output
│       │   ├── {video_id}_f0000_d0.json
│       │   └── ...
│       └── output/                  # Stage 5 output
│           ├── observations.jsonl
│           ├── quality_report.json
│           └── unmatched_placards.json
└── routes/
    └── canonical-routes.json        # 604 routes for fuzzy matching (static, uploaded once)
```

Using `{execution_id}` as the partition key ensures complete isolation between runs and makes cleanup trivial (delete prefix). The execution ID comes from Step Functions, not generated by user code.

### Lambda Functions

#### 1. Extract (`jeepney-extract`)

- **Runtime:** Python 3.12
- **Memory:** 1024 MB (ffmpeg needs headroom)
- **Timeout:** 15 minutes (Lambda max)
- **Ephemeral storage:** 4096 MB (configurable up to 10240 MB)
- **Lambda Layer:** `yt-dlp` + `ffmpeg` static binaries
- **Logic:**
  1. Parse youtube_url and sample_rate_s from input
  2. Run `yt-dlp` to download video (360p, mp4 — smallest viable quality for landmark/text recognition)
  3. Run `ffmpeg` to extract frames at sample_rate_s interval
  4. Upload all frames to `s3://bucket/runs/{exec_id}/frames/`
  5. Return list of frame S3 keys
- **Timeout risk:** A 1-hour 360p video is ~200-400 MB. Download + extract + upload should fit in 15 minutes on Lambda's network. If it doesn't, the CDK stack includes a flag to swap this stage for an ECS Fargate task (same container image, no timeout limit).
- **yt-dlp format selection:** `--format "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]"` — caps at 480p to keep file size manageable while retaining text readability.

#### 2. Geolocate (`jeepney-geolocate`)

- **Runtime:** Python 3.12
- **Memory:** 256 MB
- **Timeout:** 2 minutes
- **Logic (per frame):**
  1. Download frame from S3
  2. Call Claude Vision API: "This is a dashcam frame from Metro Manila. Identify visible landmarks, street signs, business names, and road features. Estimate latitude and longitude with a confidence score 0-1."
  3. Call Gemini Vision API with same prompt
  4. Take higher-confidence result (or average if both >0.7)
  5. Write result JSON to `s3://bucket/runs/{exec_id}/geo/{frame_key}.json`
  6. Return geo result summary
- **API keys:** Stored in AWS Secrets Manager, fetched once per Lambda cold start and cached in memory.

#### 3. Detect (`jeepney-detect`)

- **Runtime:** Python 3.12
- **Memory:** 256 MB
- **Timeout:** 2 minutes
- **Logic (per frame):**
  1. Download frame from S3
  2. Call vision API: "Identify all jeepneys visible in this Metro Manila street scene. For each jeepney, return a bounding box [x1, y1, x2, y2] in pixel coordinates and a confidence score."
  3. Write detections JSON to `s3://bucket/runs/{exec_id}/detections/{frame_key}.json`
  4. Return detection summaries (count + bboxes)

#### 4. OCR (`jeepney-ocr`)

- **Runtime:** Python 3.12
- **Memory:** 512 MB (Pillow image cropping + thefuzz)
- **Timeout:** 2 minutes
- **Lambda Layer:** `Pillow`, `thefuzz` (or bundled in deployment package)
- **Logic (per detection):**
  1. Download original frame from S3
  2. Crop to bounding box region using Pillow
  3. Call vision API on cropped image: "Read the route placard text on this jeepney. The placard is typically on the windshield or side, showing origin-destination (e.g., 'CUBAO - DIVISORIA'). Return the raw text."
  4. Normalize text (uppercase, standardize separators)
  5. Fuzzy-match against canonical routes loaded from `s3://bucket/routes/canonical-routes.json` (cached across invocations via Lambda global scope)
  6. Write result to `s3://bucket/runs/{exec_id}/ocr/{frame_key}_d{idx}.json`
  7. Return OCR result summary

#### 5. Assemble (`jeepney-assemble`)

- **Runtime:** Python 3.12
- **Memory:** 512 MB
- **Timeout:** 5 minutes
- **Logic:**
  1. List all JSON files under `geo/`, `detections/`, `ocr/` prefixes for this execution
  2. Load and join: frame → geo result → detections → OCR per detection
  3. Build observation records per the schema from the parent spec
  4. Apply confidence thresholds (geo_confidence ≥ 0.3, match_confidence ≥ 0.5)
  5. Write `observations.jsonl`, `quality_report.json`, `unmatched_placards.json` to `s3://bucket/runs/{exec_id}/output/`
  6. Return summary statistics

### Step Functions State Machine Design

```json
{
  "Comment": "Jeepney Spotter Video Processing Pipeline",
  "StartAt": "Extract",
  "States": {
    "Extract": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:jeepney-extract",
      "TimeoutSeconds": 900,
      "ResultPath": "$.extract",
      "Next": "Geolocate",
      "Retry": [{ "ErrorEquals": ["Lambda.ServiceException"], "MaxAttempts": 2 }],
      "Catch": [{ "ErrorEquals": ["States.ALL"], "Next": "PipelineFailed" }]
    },
    "Geolocate": {
      "Type": "Map",
      "ItemsPath": "$.extract.frame_keys",
      "MaxConcurrency": 10,
      "Iterator": {
        "StartAt": "GeolocateFrame",
        "States": {
          "GeolocateFrame": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:...:jeepney-geolocate",
            "Retry": [{ "ErrorEquals": ["States.ALL"], "MaxAttempts": 2 }],
            "End": true
          }
        }
      },
      "ResultPath": "$.geo_results",
      "Next": "Detect"
    },
    "Detect": {
      "Type": "Map",
      "ItemsPath": "$.extract.frame_keys",
      "MaxConcurrency": 10,
      "Iterator": {
        "StartAt": "DetectFrame",
        "States": {
          "DetectFrame": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:...:jeepney-detect",
            "Retry": [{ "ErrorEquals": ["States.ALL"], "MaxAttempts": 2 }],
            "End": true
          }
        }
      },
      "ResultPath": "$.detect_results",
      "Next": "FlattenDetections"
    },
    "FlattenDetections": {
      "Type": "Pass",
      "Comment": "Flatten per-frame detections into a flat list of {frame_key, bbox, detection_idx} for OCR fan-out. Done via ResultSelector + intrinsic functions, or a small Lambda.",
      "Next": "OCR"
    },
    "OCR": {
      "Type": "Map",
      "ItemsPath": "$.all_detections",
      "MaxConcurrency": 10,
      "Iterator": {
        "StartAt": "OCRDetection",
        "States": {
          "OCRDetection": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:...:jeepney-ocr",
            "Retry": [{ "ErrorEquals": ["States.ALL"], "MaxAttempts": 2 }],
            "End": true
          }
        }
      },
      "ResultPath": "$.ocr_results",
      "Next": "Assemble"
    },
    "Assemble": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:jeepney-assemble",
      "TimeoutSeconds": 300,
      "ResultPath": "$.output",
      "Next": "PipelineSucceeded"
    },
    "PipelineSucceeded": { "Type": "Succeed" },
    "PipelineFailed": { "Type": "Fail", "Cause": "Pipeline stage failed" }
  }
}
```

**FlattenDetections note:** Step Functions' intrinsic function `States.ArrayPartition` and JSONPath can reshape data, but flattening nested arrays of detections is complex. A tiny "flatten" Lambda (10 lines, 128MB, 30s timeout) is the pragmatic choice here.

### Map State Concurrency

MaxConcurrency is set to 10 for all Map states. This balances:
- **API rate limits:** Claude API allows ~60 RPM on standard tiers; Gemini has similar limits. 10 concurrent Lambdas each making 1-2 calls stays comfortably under limits.
- **Cost predictability:** Prevents runaway parallel execution.
- **V1 scale:** 60 frames × 1-2 API calls per frame = 120-180 calls total. At concurrency 10, each Map state completes in ~6 parallel batches.

### API Gateway

- **Endpoint:** `POST /process-video`
- **Request body:** `{ "youtube_url": "string", "sample_rate_s": number }`
- **Auth:** API key (V1 — single user, no need for Cognito)
- **Response:** `{ "execution_arn": "string", "status_url": "string" }` (async — returns immediately after starting Step Functions execution)
- **Status endpoint:** `GET /status/{execution_id}` — proxies to `DescribeExecution` API to check progress.

### IAM Roles

Three roles:

1. **API Gateway execution role** — `states:StartExecution`, `states:DescribeExecution` on the state machine ARN
2. **Step Functions execution role** — `lambda:InvokeFunction` on all 5 Lambda function ARNs
3. **Lambda execution role** (shared) — `s3:GetObject`, `s3:PutObject`, `s3:ListBucket` on the data bucket; `secretsmanager:GetSecretValue` on the API keys secret; `logs:*` on CloudWatch log groups

The shared Lambda role is acceptable at V1 scale. In a production setup, each Lambda would get least-privilege (e.g., extract only writes to `frames/`, geolocate only reads from `frames/` and writes to `geo/`).

### Secrets Management

API keys stored in AWS Secrets Manager:

```json
{
  "ANTHROPIC_API_KEY": "sk-ant-...",
  "GOOGLE_API_KEY": "AIza..."
}
```

Fetched once per Lambda cold start via `boto3` and cached in module-level variables. No environment variables for secrets (they show in CloudWatch logs).

### Lambda Layers

Two custom layers:

1. **`ffmpeg-yt-dlp` layer** — Used by extract Lambda only
   - Contains static `ffmpeg` and `yt-dlp` binaries compiled for Amazon Linux 2023 (arm64)
   - Published as a versioned layer; pinned in CDK
   - Source: community-maintained `ffmpeg-lambda-layer` + `yt-dlp` binary from GitHub releases

2. **`pillow-thefuzz` layer** — Used by OCR Lambda
   - Contains `Pillow` and `thefuzz[speedup]` (python-Levenshtein)
   - Built via Docker using `sam build --use-container` pattern, even though we use CDK for deployment

### IaC: AWS CDK (Python)

The infrastructure is defined in CDK Python. Single stack: `JeepneySpotterStack`.

```
infra/
├── app.py                # CDK app entry point
├── cdk.json
├── requirements.txt      # aws-cdk-lib
└── stacks/
    └── jeepney_spotter.py  # All resources in one stack
```

CDK constructs:
- `aws_s3.Bucket` — data bucket with lifecycle rule (auto-delete runs older than 30 days)
- `aws_lambda.Function` × 5 (+ 1 flatten utility)
- `aws_lambda.LayerVersion` × 2
- `aws_stepfunctions.StateMachine` — the full pipeline
- `aws_apigateway.RestApi` — with POST /process-video and GET /status/{id}
- `aws_secretsmanager.Secret` — API keys (created empty, filled manually)
- `aws_iam.Role` × 3

### Error Handling Strategy

| Error Type | Handling |
|------------|----------|
| Lambda timeout (extract) | Catch → PipelineFailed. User retries with lower quality or shorter video. |
| API rate limit (429) | Lambda-level retry with exponential backoff (3 attempts, 2s/4s/8s). Vision API SDKs handle this natively. |
| API transient error (5xx) | Step Functions Retry block: 2 attempts with 5s backoff. |
| Frame with no landmarks | Geolocate returns `{ "confidence": 0.0, "skipped": true }`. Assemble filters it out. |
| Frame with no jeepneys | Detect returns `{ "detections": [] }`. OCR Map state receives empty list for that frame — no-op. |
| Unreadable placard | OCR returns `{ "placard_text_raw": null }`. Logged but not matched. |
| S3 access denied | Immediate fail — IAM misconfiguration, needs manual fix. |

### Cost Estimate (V1 — single run)

| Component | Usage | Est. Cost |
|-----------|-------|-----------|
| Lambda compute | ~70 invocations × avg 30s × 512MB | $0.02 |
| Step Functions | ~75 state transitions | $0.002 |
| S3 | 60 PNGs (~200MB) + JSON files, 30 day retention | $0.01/month |
| API Gateway | 2 requests | $0.000007 |
| Secrets Manager | 1 secret, ~5 fetches | $0.40/month |
| Claude API | ~120 calls (geo + detect + OCR) | $2-4 |
| Gemini API | ~60 calls (geo cross-reference) | $1-2 |
| **Total per run** | | **$3-6** (dominated by vision API costs) |

## Key Design Decisions

### 1. S3 as data bus, not Step Functions payload

Step Functions payloads are limited to 256 KB. A single frame is ~100-500 KB as PNG. Even the JSON results would approach limits at scale. All data passes through S3; Step Functions only passes S3 keys and small metadata.

### 2. One Lambda per stage, not one monolithic Lambda

Separation enables:
- Independent scaling (detect can use more memory than geolocate)
- Independent deployment (update OCR logic without redeploying extract)
- Clearer CloudWatch logs per stage
- Step Functions retry granularity per stage

### 3. Single shared Lambda execution role (V1)

Pragmatic choice for V1. Each Lambda could write anywhere in the bucket. Acceptable because: single user, single bucket, low risk. The plan documents the per-Lambda role split as a V2 hardening step.

### 4. 480p video download cap

The extract stage downloads at max 480p. This is a deliberate quality/reliability tradeoff:
- Text on jeepney placards is typically large block letters — readable at 480p
- Street signs and landmarks for geolocation are identifiable at 480p
- 480p keeps video files under 400MB for a 1-hour video, fitting comfortably in Lambda's 10GB /tmp
- Higher resolution adds download time and storage without proportional quality gains for our use case

### 5. Geolocate and Detect as separate stages (not combined)

The parent spec has them as separate stages, and there's good reason:
- Different prompt strategies (landmark identification vs. vehicle detection)
- Different failure modes (no landmarks ≠ no jeepneys)
- Detect could later be swapped for a YOLO model endpoint without touching geolocate
- Separation allows running detect on ALL frames, even those without geolocation (useful for OCR dataset building)

### 6. Flatten Lambda between Detect and OCR

Step Functions Map state requires a flat array. Detect returns per-frame results with variable numbers of detections (0-N jeepneys per frame). A small Lambda flattens `[[det1, det2], [det3], [], [det4, det5, det6]]` into `[det1, det2, det3, det4, det5, det6]` with frame provenance attached. This is cleaner than trying to use nested Map states.

## Out of Scope (V1)

- **Multi-video batch processing** — V1 processes one video per API call
- **Per-Lambda IAM roles** — shared role is fine for single-user V1
- **Video caching** — each run re-downloads the video
- **WebSocket progress updates** — use polling via GET /status
- **Custom domain** — API Gateway default URL is fine
- **CI/CD pipeline** — manual `cdk deploy` for V1
- **Monitoring/alerting** — CloudWatch logs only, no alarms
- **VPC** — Lambdas run in default VPC-less mode (no need for private resources)
- **ECS Fargate fallback for extract** — Lambda 15-min timeout is sufficient for V1 videos

## Open Questions

1. **Claude vs Gemini for detection stage** — The parent spec uses both for geolocation (cross-reference). Should detection also dual-call, or is one model sufficient? Recommendation: single model (Claude) for detection in V1, to keep API costs down. Geolocation benefits from cross-referencing because location estimation is inherently uncertain; detection is more binary.

2. **Route matching data freshness** — The `canonical-routes.json` is uploaded to S3 once. How to keep it in sync with the `mm-transit-routes-reverse` loop as new routes are discovered? Recommendation: a manual upload step documented in the README. V2 could automate via a separate Lambda triggered on loop commits.
