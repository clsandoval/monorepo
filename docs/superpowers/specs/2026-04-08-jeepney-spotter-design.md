# Jeepney Spotter — Video-Based Jeepney Route Reconstruction

**Date:** 2026-04-08
**Status:** Draft — **PREMISE INVALIDATED (see note below)**
**Project:** `projects/jeepney-spotter/`

## Problem

The `mm-transit-routes-reverse` loop compiled 604 jeepney routes into a GTFS feed, but 97% lack polyline geometry — they have names, endpoints, and fares but no route shapes. Every successful informal transit mapping project globally (Digital Matatus, WhereIsMyTransport, Trufi) required human riders with GPS phones. No automated system exists for extracting transit routes from video.

> **UPDATE (2026-04-14): Core premise invalidated.** Investigation of Sakay.ph's live Route Explorer (`explore.sakay.ph/jeeps`) revealed **458 jeepney routes with full geometry, stop lists (11-156 per route), fares, and schedules** — all actively maintained. The "97% geometry gap" was based on the stale 2020 GitHub GTFS export; Sakay.ph kept updating their live site. Of our 609 routes, ~293 (48%) match Sakay routes. The geometry data EXISTS — it's a data import problem, not a field collection or video extraction problem. This spec remains valuable as a proof-of-concept for video-based transit data extraction, but the specific Manila jeepney use case is better solved by importing Sakay.ph data. See "New Applications" section in the investigation report for where this pipeline architecture IS the right tool.

## Idea

Process YouTube dashcam and street-level footage of Metro Manila to detect jeepneys, read their route placards, and geolocate the frames — building a dataset of structured observations that can be clustered into full route polylines.

## Prerequisites

### API Keys & Credentials

All credentials are mounted at `/workspace/.env`. Source this file before running any pipeline stage.

| Credential | Env Var | Used By | Purpose |
|------------|---------|---------|---------|
| Anthropic API Key | `ANTHROPIC_API_KEY` | Stages 2, 4 | Claude vision API for geolocation and OCR |
| Google AI API Key | `GOOGLE_API_KEY` | Stage 2 | Gemini vision API for cross-reference geolocation |
| Replicate API Token | `REPLICATE_API_TOKEN` | Stage 3 | Grounding DINO detection + optional SAM 3 segmentation |

### Minimum API Tier Requirements

- **Anthropic**: Any paid tier. Claude Sonnet is sufficient; Opus not required. Rate limit: at least 60 requests/minute on the vision endpoint.
- **Google AI (Gemini)**: Any paid tier with vision access. Gemini 2.0 Flash or 2.5 Flash is sufficient. Rate limit: at least 30 requests/minute.
- **Replicate**: Any account with billing enabled. SAM 3 runs on Replicate's GPU infrastructure. No minimum tier — pay per prediction.

### Tools

- `yt-dlp`: Must be installed and on PATH. No YouTube authentication required for public videos.
- `ffmpeg`: Must be installed and on PATH. Used for frame extraction.
- `python 3.12+`: Required runtime.

### Verifying Each Credential

**Anthropic API Key:**
```bash
source /workspace/.env
curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":10,"messages":[{"role":"user","content":"ping"}]}' \
  | python3 -c "import sys,json; r=json.load(sys.stdin); print('OK' if 'content' in r else f'FAIL: {r}')"
```

**Google AI API Key:**
```bash
source /workspace/.env
curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"ping"}]}]}' \
  | python3 -c "import sys,json; r=json.load(sys.stdin); print('OK' if 'candidates' in r else f'FAIL: {r}')"
```

**Replicate API Token:**
```bash
source /workspace/.env
curl -s -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/account \
  | python3 -c "import sys,json; r=json.load(sys.stdin); print('OK' if 'username' in r else f'FAIL: {r}')"
```

**yt-dlp:**
```bash
yt-dlp --version
```

**ffmpeg:**
```bash
ffmpeg -version | head -1
```

### Smoke Test — Validate All Credentials

Run this single command before starting the full pipeline. It validates every credential and tool dependency:

```bash
source /workspace/.env && python3 -c "
import subprocess, sys, json, urllib.request, os

errors = []

# Check yt-dlp
try:
    subprocess.run(['yt-dlp', '--version'], capture_output=True, check=True)
    print('[OK] yt-dlp')
except Exception as e:
    errors.append(f'yt-dlp: {e}')
    print('[FAIL] yt-dlp')

# Check ffmpeg
try:
    subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
    print('[OK] ffmpeg')
except Exception as e:
    errors.append(f'ffmpeg: {e}')
    print('[FAIL] ffmpeg')

# Check Anthropic API key
api_key = os.environ.get('ANTHROPIC_API_KEY', '')
if not api_key:
    errors.append('ANTHROPIC_API_KEY not set')
    print('[FAIL] ANTHROPIC_API_KEY not set')
else:
    import anthropic
    try:
        c = anthropic.Anthropic()
        r = c.messages.create(model='claude-sonnet-4-20250514', max_tokens=10, messages=[{'role':'user','content':'ping'}])
        print('[OK] Anthropic API')
    except Exception as e:
        errors.append(f'Anthropic API: {e}')
        print(f'[FAIL] Anthropic API: {e}')

# Check Replicate API token
rkey = os.environ.get('REPLICATE_API_TOKEN', '')
if not rkey:
    errors.append('REPLICATE_API_TOKEN not set')
    print('[FAIL] REPLICATE_API_TOKEN not set')
else:
    req = urllib.request.Request(
        'https://api.replicate.com/v1/account',
        headers={'Authorization': f'Bearer {rkey}'}
    )
    try:
        resp = json.loads(urllib.request.urlopen(req).read())
        if 'username' in resp:
            print(f'[OK] Replicate API (user: {resp[\"username\"]})')
        else:
            errors.append('Replicate: unexpected response')
            print('[FAIL] Replicate API')
    except Exception as e:
        errors.append(f'Replicate: {e}')
        print(f'[FAIL] Replicate API: {e}')

# Check Google AI API key
gkey = os.environ.get('GOOGLE_API_KEY', '')
if not gkey:
    errors.append('GOOGLE_API_KEY not set')
    print('[FAIL] GOOGLE_API_KEY not set')
else:
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gkey}',
        data=json.dumps({'contents':[{'parts':[{'text':'ping'}]}]}).encode(),
        headers={'Content-Type':'application/json'}
    )
    try:
        resp = json.loads(urllib.request.urlopen(req).read())
        if 'candidates' in resp:
            print('[OK] Google AI API')
        else:
            errors.append(f'Google AI: unexpected response')
            print('[FAIL] Google AI API')
    except Exception as e:
        errors.append(f'Google AI: {e}')
        print(f'[FAIL] Google AI: {e}')

# Check routes.json exists
if os.path.exists('data/routes.json'):
    print('[OK] routes.json')
else:
    errors.append('data/routes.json not found')
    print('[FAIL] data/routes.json not found — copy from mm-transit-routes-reverse')

if errors:
    print(f'\n{len(errors)} FAILED checks. Fix before running pipeline.')
    sys.exit(1)
else:
    print('\nAll checks passed. Ready to run pipeline.')
"
```

## Architecture

### Pipeline Overview

Six sequential stages per video:

```
EXTRACT → CLASSIFY → GEOLOCATE → DETECT → IDENTIFY → ASSEMBLE
frames     filter      read+geocode  Grounding   OCR route    observations
from video  aerial      anchor frames DINO        placards     + trajectories
```

### Stage 1 — Frame Extraction

- Download video via `yt-dlp`
- Extract frames with `ffmpeg` at 1fps (dense sampling for trajectory linking)
- Output: PNG frames named `{video_id}_f{timestamp_s}.png`
- Runs on any machine, no GPU needed

#### Frame Deduplication Strategy

Dashcam footage from stopped vehicles (traffic jams, red lights) produces near-identical consecutive frames. At 1fps sampling, this wastes compute on redundant data.

**Approach: Perceptual hash deduplication**

1. After frame extraction, compute a perceptual hash (pHash) for each frame using `Pillow` + `imagehash`
2. Compare each frame's pHash against the previous frame
3. If the Hamming distance between consecutive frame hashes is ≤ 4 (out of 64 bits), mark the later frame as a duplicate
4. Duplicates are skipped in downstream stages but logged in the quality report

**Implementation:**
```python
import imagehash
from PIL import Image

def is_duplicate(frame_path: str, prev_hash: imagehash.ImageHash, threshold: int = 4) -> bool:
    current_hash = imagehash.phash(Image.open(frame_path))
    return abs(current_hash - prev_hash) <= threshold
```

**Expected impact:** In heavy Manila traffic, 10-20% of frames at 1fps sampling will be near-duplicates. At 1fps on a 1-hour video (3,600 frames), this saves 360-720 redundant detections.

**Dependencies added:** `imagehash` (adds to `pyproject.toml`).

#### Error Handling — Stage 1

| Error Condition | Handling Strategy |
|----------------|-------------------|
| `yt-dlp` download fails (network error) | Retry up to 3 times with 5s backoff. Log error and abort pipeline if all retries fail. |
| `yt-dlp` download fails (video unavailable/private) | Log error with video URL. Abort pipeline — no frames to process. |
| `yt-dlp` download fails (age-restricted/geo-blocked) | Log error. Suggest user provide `--cookies` flag or alternative URL. Abort pipeline. |
| `ffmpeg` frame extraction fails | Retry once. If still fails, log error and abort — likely corrupt download. |
| Video shorter than expected | Extract what's available. Log actual frame count vs expected. Continue if ≥10 frames. |
| Disk full during extraction | Check available disk space before extraction (need ~500MB per hour of video for frames). Abort early if insufficient. |

### Stage 1b — Frame Classification (Pre-filter)

Before geolocation or detection, classify each frame as street-level dashcam or non-dashcam (aerial views, map overlays, title cards, interior shots). YouTube dashcam videos often start with Google Earth flyovers or contain mid-video map overlays that waste API calls if processed.

**Approach:** Lightweight VLM call or basic CNN classifier. The prompt is simple: "Is this a street-level dashcam frame showing a road? Yes or no." Non-dashcam frames are skipped for all downstream stages but logged in the quality report.

**Why this matters:** Investigation found that the EDSA test video starts with Google Earth aerial imagery. These frames have completely different visual signatures from dashcam footage — perceptual hash dedup doesn't catch them because they're not similar to *each other* or to street-level frames. Two of 14 extracted frames were aerial views, wasting detection API calls and skewing hit rate metrics.

### Stage 2 — Geolocation (Read + Geocode)

Geolocate frames using a two-step approach: VLM reads visible text, then a geocoding step converts those text observations into coordinates. Sparse anchoring — process anchor frames every 10-15 seconds, interpolate intermediate positions along the OSM road network graph.

**Primary approach (Read + Geocode):**
1. **Step 2a — Text extraction:** Send anchor frame to Claude vision API. Ask it to read ALL visible text: business names, street signs, billboards, landmarks. No coordinates, no location guessing. Claude is a sign reader, not a coordinate guesser.
2. **Step 2b — Research geocoding:** Send the extracted text observations to Gemini with geographic context (e.g., "these businesses were seen on EDSA, Metro Manila"). Gemini reasons about business clustering to produce precise coordinates with an error radius.

**Why two steps:** Investigation showed that single-shot VLM geolocation is fundamentally broken. Claude seeing "Jollibee" on a frame tries to guess which of 200+ Jollibee branches in Metro Manila it is — an impossible task. When we split read and geocode, the same frame went from 7,800m error to 25m accuracy. The cost difference is negligible (Gemini research call is ~$0.005).

**Fallback:** If the research geocoding step fails, fall back to single-shot VLM geolocation from both Claude and Gemini with tiebreaker logic (see below).

**Expected hit rate:** 40-60% of anchor frames will have enough visual clues for a usable geolocation. Frames of blank roads, tunnels, or dense traffic with no signage return low confidence and are skipped.

#### Geolocation Prompt Template

```
You are a geolocation expert specializing in Metro Manila, Philippines.

Analyze this dashcam frame and estimate the precise location where it was captured.

Look for these visual clues:
- Street name signs, barangay signs, city boundary markers
- Business names and signage (especially chain stores with known locations)
- Landmarks: churches, malls, government buildings, schools, hospitals
- Road features: number of lanes, median type, overhead pedestrian bridges, MRT/LRT tracks
- Jeepney route signs visible on other vehicles
- Filipino text on signs (Tagalog/English bilingual signage is common)
- Building architecture style and density (residential vs commercial vs industrial)

Context: This frame is from a dashcam video recorded while driving in Metro Manila.
The region spans roughly lat 14.35-14.75, lon 120.90-121.15.

Respond with ONLY valid JSON matching this schema:

{
  "lat": <float, estimated latitude, e.g. 14.5965>,
  "lon": <float, estimated longitude, e.g. 121.0012>,
  "confidence": <float, 0.0-1.0, how certain you are of this location>,
  "geo_radius_m": <int, estimated error radius in meters — how far off could this estimate be?>,
  "landmarks": [<string, each visible clue used for the estimate>],
  "reasoning": "<string, brief explanation of how you determined the location>"
}

Confidence guidelines:
- 0.8-1.0: Exact street visible on sign, or unmistakable landmark (e.g. "SM Megamall" sign). geo_radius_m: 50-200
- 0.5-0.7: Identifiable area from multiple contextual clues (building cluster, road type). geo_radius_m: 200-1000
- 0.2-0.4: General area only (e.g. "looks like Quezon City" from road width and building style). geo_radius_m: 1000-5000
- 0.0-0.1: No useful clues, pure guess — return this rather than fabricating a location. geo_radius_m: 5000+
```

**Example input:** A dashcam frame showing a wide 6-lane road with an elevated MRT track overhead, a "Quezon Avenue" street sign visible, and SM North EDSA mall signage in the background.

**Example output:**
```json
{
  "lat": 14.6510,
  "lon": 121.0325,
  "confidence": 0.85,
  "geo_radius_m": 100,
  "landmarks": ["Quezon Avenue street sign", "MRT-3 elevated track", "SM North EDSA signage"],
  "reasoning": "The Quezon Avenue street sign combined with the MRT-3 elevated guideway and SM North EDSA mall visible in the background places this near the Quezon Avenue MRT station on EDSA, Quezon City."
}
```

#### Claude/Gemini Disagreement Tiebreaker Logic

When both models return a geolocation for the same frame:

1. **Both confident (≥0.5):** If the two estimates are within 500m of each other (haversine distance), average the lat/lon and take the higher confidence score. If they are >500m apart, take the estimate with the higher confidence. If confidences are within 0.1 of each other and locations disagree, take the higher confidence regardless of model — investigation showed Gemini consistently outperforms Claude at sign reading and geolocation in Manila (14km disagreement on 2 of 3 frames, Gemini correct each time).
2. **One confident, one not:** Take the confident estimate (≥0.5). Discard the low-confidence one.
3. **Neither confident (<0.5):** Take the higher confidence estimate but cap the reported `geo_confidence` at the raw score (no boosting). Flag the observation with `geo_source: "low_confidence_single"`.
4. **One model errors out:** Use the successful model's result. Log the failure in `stage_errors`.
5. **Both models error out:** Mark the frame as unlocatable. Set `lat`, `lon` to null and `geo_confidence` to 0.0.

**Distance calculation:**
```python
from math import radians, sin, cos, sqrt, atan2

def haversine_m(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth radius in meters
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1-a))
```

#### Error Handling — Stage 2

| Error Condition | Handling Strategy |
|----------------|-------------------|
| Anthropic API returns 429 (rate limit) | Exponential backoff: 2s, 4s, 8s, 16s. Max 4 retries per frame. If still failing, skip Claude for this frame, use Gemini only. |
| Anthropic API returns 500/503 (server error) | Retry up to 2 times with 3s delay. If still failing, use Gemini only for this frame. |
| Google AI API returns 429 (rate limit) | Same backoff strategy as Anthropic. Fall back to Claude only. |
| Google AI API returns 500/503 | Same retry strategy as Anthropic. Fall back to Claude only. |
| API returns 400 (bad request / image too large) | Log the frame path and error. Skip frame. Image may be corrupt or exceed size limit — resize to 1568px max dimension and retry once. |
| Model returns invalid JSON | Attempt to extract JSON from response using regex `\{.*\}`. If still invalid, log raw response and skip frame. |
| Model returns location outside Metro Manila bbox | Flag as suspicious but keep (driver may be on approach routes). Set `geo_confidence = min(returned_confidence, 0.3)`. |
| Both models fail for a frame | Mark frame as unlocatable. Continue pipeline — detection and OCR can still run (observations just won't have location). |

### Stage 3 — Jeepney Detection

Detect all jeepneys present in each frame using Grounding DINO, optionally refined with SAM 3.

**Primary approach: Grounding DINO** — Use Grounding DINO via Replicate API with text prompt "jeepney". This is a text-prompted object detector that produces tight, pixel-accurate bounding boxes. Cost: ~$0.01/frame.

**Investigation results:** Grounding DINO found 5.75x more jeepneys than Claude VLM on the same frames (23 vs 4 across 4 test frames). On frame 10, Claude found zero jeepneys while Grounding DINO found eight. The bounding boxes are dramatically tighter — Grounding DINO is a real object detector, not a VLM guessing at pixel coordinates. This difference cascades into OCR quality: tight bounding boxes produce crops that actually contain the jeepney placard, while VLM bounding boxes often captured power lines and road surface instead.

**Optional refinement: SAM 3** — For even tighter segmentation masks (useful for OCR crops), stack SAM 3 on top of Grounding DINO detections. DINO finds the jeepney, SAM segments it precisely. This two-stage approach gives the best of both: fast text-prompted detection + precise segmentation.

**Fallback:** If Grounding DINO is unavailable, use a VLM (Claude or Gemini) to identify and return approximate bounding boxes. The VLM path is less accurate (4x fewer detections, approximate bounding boxes) but requires no Replicate account. For scale processing, distill Grounding DINO + SAM 3 outputs (~5,000 labeled frames) into a lightweight YOLO-class detector.

#### Bbox Overlap Deduplication

After detection (SAM 3 or VLM), check for duplicate detections by computing IoU (intersection over union) between all pairs of bounding boxes. If two bboxes overlap by more than 80% IoU, keep the one with higher confidence and discard the other.

```python
def iou(box1, box2):
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    inter = max(0, x2 - x1) * max(0, y2 - y1)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    return inter / (area1 + area2 - inter) if (area1 + area2 - inter) > 0 else 0
```

#### E-Jeepney vs Classic Distinction

The detection prompt excludes modern e-jeepneys, but some newer traditional jeepneys look similar to e-jeepneys. To reduce false negatives, include a `vehicle_type` field in the detection output: `"classic"`, `"e-jeepney"`, or `"uncertain"`. Log all detections but only route-match classic and uncertain types. This avoids losing borderline detections while keeping the data clean for analysis.

#### Jeepney Detection Prompt Template (VLM Fallback)

```
You are a vehicle detection expert. Analyze this dashcam frame from Metro Manila, Philippines.

Identify ALL jeepneys visible in the frame. Jeepneys are the primary form of public transit in Manila — they are elongated vehicles (typically 5-7m long) with:
- Open rear entry (no door at the back)
- Route placard/signboard on the windshield or side showing destination text
- Often brightly colored/decorated with chrome accents
- Bench seating visible through open sides or rear
- Distinctive elongated body style (longer than a car, shorter than a bus)

Do NOT include: buses, UV Express vans, tricycles, private cars, trucks, motorcycles, or modern e-jeepneys (which look like small buses with doors).

For each jeepney detected, provide a bounding box in pixel coordinates [x1, y1, x2, y2] where (x1,y1) is the top-left corner and (x2,y2) is the bottom-right corner.

Respond with ONLY valid JSON matching this schema:

{
  "jeepneys": [
    {
      "bbox": [<int x1>, <int y1>, <int x2>, <int y2>],
      "confidence": <float, 0.0-1.0>,
      "orientation": "<string: 'front'|'rear'|'side'|'partial'>",
      "vehicle_type": "<string: 'classic'|'e-jeepney'|'uncertain'>",
      "placard_visible": <boolean, true if route signboard text might be readable>
    }
  ],
  "frame_summary": "<string, brief description of scene — e.g. 'busy intersection with 3 jeepneys loading passengers'>"
}

If no jeepneys are visible, return: {"jeepneys": [], "frame_summary": "<description>"}
```

**Example input:** A dashcam frame showing a busy Manila street with two jeepneys — one facing the camera loading passengers, one driving away showing its rear.

**Example output:**
```json
{
  "jeepneys": [
    {
      "bbox": [120, 280, 580, 520],
      "confidence": 0.92,
      "orientation": "front",
      "vehicle_type": "classic",
      "placard_visible": true
    },
    {
      "bbox": [650, 310, 890, 480],
      "confidence": 0.78,
      "orientation": "rear",
      "vehicle_type": "classic",
      "placard_visible": false
    }
  ],
  "frame_summary": "Two-lane road with one jeepney loading passengers facing camera (placard visible), another pulling away showing rear."
}
```

#### Error Handling — Stage 3

| Error Condition | Handling Strategy |
|----------------|-------------------|
| API rate limit (429) | Exponential backoff: 2s, 4s, 8s, 16s. Max 4 retries. If exhausted, skip frame and log. |
| API server error (500/503) | Retry up to 2 times with 3s delay. If still failing, skip frame. |
| Model returns invalid JSON | Attempt regex extraction. If invalid, log and treat frame as "0 jeepneys detected." |
| Model returns bounding boxes outside frame dimensions | Clamp bbox coordinates to frame dimensions. Log warning. |
| Model returns unreasonably large number of detections (>20) | Cap at 20, sort by confidence, take top 20. Log warning — likely hallucination. |
| Image too large for API | Resize to 1568px max dimension before sending. Retry once. |

### Stage 4 — Route Identification (OCR)

For each detected jeepney bounding box:

1. Crop the jeepney region from the frame
2. Send cropped image to vision API: read the route placard text (the windshield/side sign showing route name, e.g., "CUBAO - DIVISORIA")
3. Normalize the raw text (uppercase, trim whitespace, standardize separators)
4. Fuzzy-match against the 604 known routes from the existing `mm-transit-routes-reverse` GTFS dataset

**Scope:** Placard text only. LTFRB body numbers and T-series codes are too small and side-mounted to read reliably from dashcam-distance footage.

**Unmatched placards** are logged separately — they may represent routes not in the existing database and are valuable for expanding route coverage.

#### Placard OCR Prompt Template

```
You are an OCR expert reading Filipino jeepney route placards.

This cropped image shows a jeepney detected in a Metro Manila dashcam frame. Read the route placard — the signboard typically displayed on the windshield or side of the jeepney that shows the route name.

Placard text typically follows these patterns:
- "ORIGIN - DESTINATION" (e.g., "CUBAO - DIVISORIA")
- "ORIGIN - DESTINATION VIA LANDMARK" (e.g., "BACLARAN - BLUMENTRITT VIA QUIAPO")
- Single destination name (e.g., "FAIRVIEW")
- Abbreviated names are common (e.g., "STA. CRUZ", "SM NORTH", "QC")

Read EXACTLY what is written. Do not correct spelling or guess missing words.
If the text is partially obscured, read what you can and indicate unclear portions with [?].

Respond with ONLY valid JSON matching this schema:

{
  "placard_text_raw": "<string, exact text as read from the placard>",
  "placard_readable": <boolean, true if at least one word was confidently read>,
  "ocr_confidence": <float, 0.0-1.0, confidence in the reading>,
  "notes": "<string, any relevant context — e.g. 'text partially obscured by glare', 'multiple signs visible'>"
}

If no placard text is visible or readable, return:
{"placard_text_raw": "", "placard_readable": false, "ocr_confidence": 0.0, "notes": "<reason>"}
```

**Example input:** A cropped image of a jeepney's windshield area showing a hand-painted route sign reading "CUBAO - DIVISORIA".

**Example output:**
```json
{
  "placard_text_raw": "CUBAO - DIVISORIA",
  "placard_readable": true,
  "ocr_confidence": 0.88,
  "notes": "White text on blue background, clearly legible. Standard two-endpoint format."
}
```

**Example input (partial):** A cropped image where the placard is partially obscured by windshield glare, showing "BAC... - DIVISO..."

**Example output:**
```json
{
  "placard_text_raw": "BAC[?] - DIVISO[?]",
  "placard_readable": true,
  "ocr_confidence": 0.45,
  "notes": "Partial text visible through windshield glare. First word likely starts with 'BAC' (Baclaran?), second appears to be 'DIVISORIA' truncated."
}
```

#### Fuzzy Matching Configuration

**Scorer: `thefuzz.fuzz.token_set_ratio`**

Rationale: Jeepney placard text has three properties that make `token_set_ratio` the best scorer:
1. **Word order varies** — placards may read "CUBAO - DIVISORIA" or "DIVISORIA - CUBAO" for the same route. `token_set_ratio` ignores word order.
2. **Subset matching** — OCR may capture only partial text ("CUBAO DIVISORIA") while the GTFS entry is "Cubao–Divisoria (Traditional Jeepney)". `token_set_ratio` scores 100 when one string's tokens are a subset of the other's.
3. **Extra words are common** — placards sometimes include "VIA" clauses or landmarks not in the GTFS name. `token_set_ratio` penalizes only explicit disagreement, not extra content.

`WRatio` was considered but rejected because its weighted combination of multiple scorers can produce inflated scores for partial matches that aren't actually the same route. `token_sort_ratio` was rejected because it still penalizes extra tokens, which hurts on partial OCR reads.

**Preprocessing before matching:**
1. Uppercase both placard text and GTFS route names
2. Remove punctuation: `—`, `–`, `-`, `/`, `(`, `)`, `,`
3. Replace multiple spaces with single space, trim
4. Remove common noise words: `"MODERN PUJ"`, `"TRADITIONAL JEEPNEY"`, `"LOOP"`
5. Normalize Filipino abbreviations: `"STA."` → `"SANTA"`, `"STO."` → `"SANTO"`, `"SM "` → `"SM "`

**Important:** Do NOT strip `"VIA"` — it carries route-distinguishing signal. "Baclaran-Divisoria" and "Baclaran-Divisoria via Quiapo" are different routes that take different streets. Use a two-pass matching approach:
1. First pass: match with "VIA" and intermediate stops intact
2. Second pass (only if first pass scores <50): strip "VIA" and retry — catches cases where the GTFS entry doesn't include the via clause

**Match thresholds:** score ≥80 = auto-match, 50-79 = candidate (logged for review), <50 = unmatched.

**Tie-breaking when multiple routes score identically:**
1. Prefer routes whose GTFS `route_id` starts with a well-known prefix (T-series LTFRB codes > named routes > JICA codes)
2. Among same-prefix routes, prefer shorter route names (more specific match)
3. If still tied, return all tied candidates and let the assembly stage flag for manual review

#### Error Handling — Stage 4

| Error Condition | Handling Strategy |
|----------------|-------------------|
| API rate limit (429) | Same backoff as Stage 2. If exhausted, skip this jeepney crop. Log as `ocr_skipped`. |
| API server error | Retry up to 2 times. If failing, skip crop. |
| Model returns invalid JSON | Attempt regex extraction. If invalid, treat as unreadable placard. |
| Placard text is empty string | Mark as unreadable. Do not attempt fuzzy matching. |
| Crop dimensions too small (<50px either dimension) | Skip OCR — placard text is too small to read. Log as `crop_too_small`. |
| Crop dimensions too large (>2000px) | Resize to 1000px max dimension before sending to API. |
| Fuzzy match returns score <50 for all routes | Log in `unmatched_placards.json`. This is not an error — it may be a new route. |

### Stage 5 — Assembly & Trajectory Linking

Combine outputs from stages 2-4 into the observation schema. Filter out entries below confidence thresholds. Write to JSONL dataset file and generate a quality report.

#### Trajectory Linking (Within-Video)

Sequential frames from the same video can track the same physical jeepney across multiple sightings. If frame N and frame N+k both show a jeepney with the same route placard, and the geolocations are consistent with forward motion along a road, these are likely the same vehicle — giving two (or more) points on the actual route shape.

**Same-vehicle hypothesis:** Two observations are linked as the same physical jeepney if:
1. Same matched route (or same raw placard text if unmatched)
2. Timestamps are sequential (within 5 minutes of each other)
3. Geolocations are consistent: distance between points is plausible for road travel at jeepney speed (5-30 km/h in Manila traffic)

Linked observations get a shared `trajectory_id` field. Each trajectory is a sequence of points along a route, far more valuable than isolated sightings.

#### Cross-Video Aggregation

The assembly stage supports multi-video aggregation — not just concatenation of observations, but synthesis across videos:

1. **Route clustering:** Group all observations by `matched_route`. For each route, collect all geolocated sightings across all videos.
2. **Point deduplication:** Observations from different videos at the same location (within 50m) for the same route are merged, boosting confidence.
3. **Route shape reconstruction:** When a route has enough clustered points (≥5), snap them to the OSM road network to produce a candidate polyline geometry. Use shortest-path routing between consecutive points on the road graph.
4. **Coverage scoring:** For each route, report how many unique observation points exist and what percentage of the estimated route length they cover.

#### Error Handling — Stage 5

| Error Condition | Handling Strategy |
|----------------|-------------------|
| Missing geolocation for a frame | Set `lat`, `lon` to null, `geo_confidence` to 0.0. Observation is still valid if detection + OCR succeeded. |
| Missing detection data for a frame | No observations generated for that frame. Log in quality report. |
| Inconsistent data (detection references non-existent frame) | Skip the orphaned detection. Log as data integrity warning. |
| Output directory not writable | Fail fast with clear error message before processing begins. |
| `observations.jsonl` already exists | Append mode — new observations are added. Deduplication by `observation_id` prevents duplicates on re-runs. |

## Data Model

### Observation Schema

Each row is one jeepney sighting:

| Field | Type | Description |
|-------|------|-------------|
| `observation_id` | string | `{video_id}_{frame_ts}_{jeepney_idx}` |
| `source_video` | string | YouTube video ID |
| `frame_timestamp_s` | int | Seconds into video |
| `frame_path` | string | Path to extracted frame PNG |
| `lat` | float \| null | Estimated latitude (null if geolocation failed) |
| `lon` | float \| null | Estimated longitude (null if geolocation failed) |
| `geo_confidence` | float | 0-1, from VLM |
| `geo_radius_m` | int \| null | Estimated error radius in meters (null if geolocation failed) |
| `geo_source` | string | `"claude"`, `"gemini"`, `"averaged"`, `"interpolated"`, `"low_confidence_single"`, `"failed"` |
| `geo_landmarks` | string[] | Clues used for geolocation |
| `placard_text_raw` | string | Raw OCR output from placard |
| `placard_text_clean` | string | Normalized (uppercase, trimmed) |
| `matched_route` | string \| null | Matched route from GTFS dataset, null if no match |
| `match_confidence` | float | Fuzzy match score (0-100) |
| `bbox` | int[4] | Bounding box in frame `[x1, y1, x2, y2]` |
| `vehicle_type` | string | `"classic"`, `"e-jeepney"`, `"uncertain"` |
| `detection_confidence` | float | From detector |
| `trajectory_id` | string \| null | Shared ID linking observations of the same physical jeepney across frames |
| `stage_errors` | object | Per-stage error tracking (see below) |

#### `stage_errors` Schema

Tracks failures and anomalies at each pipeline stage for every observation:

```json
{
  "geolocate": {"claude_error": null, "gemini_error": null},
  "detect": {"error": null},
  "ocr": {"error": null},
  "match": {"error": null}
}
```

Each error field is either `null` (no error) or a string describing the failure. Examples:
- `"rate_limited_after_4_retries"`
- `"invalid_json_response"`
- `"image_too_large_resized"`
- `"model_returned_location_outside_bbox"`
- `"crop_too_small_48x32"`

### Route Matching

The fuzzy matcher draws from existing `mm-transit-routes-reverse` data:

- 604 jeepney route names with origin-destination pairs
- LTFRB T-series codes where known
- Common aliases (e.g., "QUIAPO" vs "STA. CRUZ" for overlapping terminal areas)

Match thresholds: score ≥80 = auto-match, 50-79 = candidate (logged for review), <50 = unmatched. Unmatched placards are flagged in `unmatched_placards.json` for manual review and potential database expansion.

### Regression Test Fixtures — Placard Fuzzy Matching

These example placard texts should be used as golden test cases to verify the fuzzy matching logic is calibrated correctly. Each entry includes the raw OCR text, the expected best-match route from the GTFS dataset, and the expected `token_set_ratio` score.

| # | Raw Placard Text (OCR) | Expected Matched Route ID | Expected Route Name | Expected Score | Notes |
|---|----------------------|---------------------------|---------------------|----------------|-------|
| 1 | `CUBAO - DIVISORIA` | `congress-01` | Cubao–Divisoria | 100 | Exact token match after preprocessing |
| 2 | `BACLARAN DIVISORIA TAFT` | `DOTR:R_SAKAY_PUJ_1607` | Baclaran-Divisoria via Taft | 100 | Tokens are a subset — `token_set_ratio` yields 100 |
| 3 | `CUBAO FAIRVIEW` | `cubao-fairview-mpuj` | Cubao — SM Fairview (Modern PUJ) | 100 | After removing "Modern PUJ", remaining tokens are subset |
| 4 | `BAC[?] - DIVISO[?]` | `DOTR:R_SAKAY_PUJ_1607` | Baclaran-Divisoria via Taft | 62 | Partial OCR — should land in "candidate" range (50-79) |
| 5 | `QUIAPO CUBAO` | `cubao-quiapo-traditional` | Cubao — Quiapo (Traditional Jeepney) | 100 | Word order reversed from GTFS — `token_set_ratio` handles this |
| 6 | `ANTIPOLO CATHEDRAL` | `cubao-antipolo-cathedral-mpuj` | Cubao — Antipolo Cathedral (Modern PUJ) | 100 | Subset match — placard has fewer words |
| 7 | `MONUMENTO MALABON` | `LRT1-FEEDER-MON-MAL-LETRE` | Monumento–Malabon via Letre | 100 | After preprocessing, tokens match as subset |
| 8 | `XYZ UNKNOWN ROUTE` | (none) | — | <50 | Should NOT match any route — validates unmatched handling |

**How to run the regression tests:**
```bash
source /workspace/.env && python3 -c "
from thefuzz import fuzz, process
import json, re

# Load routes
with open('data/routes.json') as f:
    routes = json.load(f)

# Preprocessing
NOISE = ['MODERN PUJ', 'TRADITIONAL JEEPNEY', 'LOOP']
def clean(s):
    s = s.upper()
    for c in '—–-/(),':
        s = s.replace(c, ' ')
    for n in NOISE:
        s = s.replace(n, '')
    s = s.replace('STA.', 'SANTA').replace('STO.', 'SANTO')
    return re.sub(r'\s+', ' ', s).strip()

route_names = {r['route_id']: clean(r['route_long_name']) for r in routes}
choices = list(route_names.values())
ids = list(route_names.keys())

tests = [
    ('CUBAO - DIVISORIA', 'congress-01', 100),
    ('BACLARAN DIVISORIA TAFT', 'DOTR:R_SAKAY_PUJ_1607', 100),
    ('CUBAO FAIRVIEW', 'cubao-fairview-mpuj', 100),
    ('QUIAPO CUBAO', 'cubao-quiapo-traditional', 100),
    ('ANTIPOLO CATHEDRAL', 'cubao-antipolo-cathedral-mpuj', 100),
    ('MONUMENTO MALABON', 'LRT1-FEEDER-MON-MAL-LETRE', 100),
    ('XYZ UNKNOWN ROUTE', None, 50),  # should be below 50
]

for raw, expected_id, threshold in tests:
    cleaned = clean(raw)
    result = process.extractOne(cleaned, choices, scorer=fuzz.token_set_ratio)
    matched_idx = choices.index(result[0])
    matched_id = ids[matched_idx]
    score = result[1]
    if expected_id is None:
        status = 'PASS' if score < threshold else 'FAIL'
    else:
        status = 'PASS' if matched_id == expected_id and score >= threshold else 'FAIL'
    print(f'[{status}] \"{raw}\" → {matched_id} (score={score}, expected={expected_id})')
"
```

## Candidate YouTube Videos

These videos were selected based on: (a) dashcam/driving tour format with forward-facing camera, (b) coverage of major jeepney corridors in Metro Manila, (c) sufficient duration for meaningful frame extraction, (d) HD/4K resolution for readable signage.

### Video 1: EDSA Full Drive — Monumento to Mall of Asia

| Field | Value |
|-------|-------|
| URL | `https://www.youtube.com/watch?v=tCBd12atK_I` |
| Title | Driving Tour on EDSA in 2024! The BUSIEST Road in Manila! Monumento to Mall of Asia |
| Duration | ~45-60 min (full EDSA traverse) |
| Route Coverage | EDSA corridor: Caloocan (Monumento) → Quezon City (Cubao, Ortigas) → Mandaluyong → Makati → Pasay (MOA). Passes through 6 cities. |
| Why Ideal | EDSA is Metro Manila's main artery and a primary jeepney corridor. Passes multiple jeepney terminals (Monumento, Cubao, Crossing/Shaw, Magallanes). High density of street signs, landmarks, and business signage for geolocation. Many jeepney routes cross or run parallel to EDSA. |

### Video 2: Manila City Driving Tour 4K

| Field | Value |
|-------|-------|
| URL | `https://www.youtube.com/watch?v=-GFAy9PFT8E` |
| Title | Manila, Philippines - Driving Tour 4K |
| Duration | ~30-60 min |
| Route Coverage | Manila city proper: Quiapo, Divisoria, Tondo, Ermita, Malate, Taft Avenue corridor. |
| Why Ideal | Manila city center has the densest concentration of traditional jeepney routes. Divisoria and Quiapo are major jeepney terminals. 4K resolution improves OCR readability of placard text. Covers routes like Baclaran-Divisoria, Cubao-Quiapo, and many LRT1 feeder routes. |

### Video 3: Rizal to Manila Dashcam

| Field | Value |
|-------|-------|
| URL | `https://www.youtube.com/watch?v=1CB6loqFSjI` |
| Title | From Rizal back to Manila - Dashcam Video |
| Duration | ~30-45 min |
| Route Coverage | Rizal province → Manila via major arterials (likely Marcos Highway or Ortigas Ave Extension corridor). Covers eastern approach routes into Metro Manila. |
| Why Ideal | Actual dashcam footage (70mai A810 camera) rather than vlog-style driving tour — more representative of the input format the pipeline will process. Covers jeepney corridors between Rizal/Antipolo and Metro Manila (Cubao-Antipolo, Cubao-Angono, Cubao-Cainta routes from our GTFS data). |

### Video Selection Criteria for Additional Candidates

When selecting additional test videos, prioritize:
1. **Forward-facing dashcam or driving tour** — not walking tours, not vlogs with frequent camera movement
2. **Daytime footage** — jeepney placard text is unreadable at night
3. **Major arterial roads** — EDSA, Aurora Blvd, Commonwealth Ave, Taft Ave, Quezon Ave — these have the highest jeepney density
4. **Minimal editing/cuts** — continuous footage enables frame timestamp-based ordering
5. **HD minimum (1080p)** — 4K preferred for placard OCR readability
6. **30+ minutes duration** — shorter videos yield too few frames at 1/min sampling

## Project Structure

```
projects/jeepney-spotter/
├── README.md
├── pyproject.toml              # uv project, Python 3.12+
├── src/
│   ├── extract.py              # Stage 1: yt-dlp + ffmpeg frame extraction
│   ├── geolocate.py            # Stage 2: VLM geolocation + sparse anchoring
│   ├── classify.py             # Stage 1b: frame classification (dashcam vs aerial/metadata)
│   ├── detect.py               # Stage 3: Grounding DINO detection + optional SAM 3 refinement
│   ├── ocr.py                  # Stage 4: placard OCR + two-pass fuzzy route matching
│   ├── assemble.py             # Stage 5: combine, trajectory link, cross-video aggregate
│   ├── trajectory.py           # Trajectory linking and same-vehicle hypothesis
│   └── pipeline.py             # Orchestrator: runs stages 1-5 sequentially
├── data/
│   ├── frames/                 # Extracted PNGs (gitignored)
│   ├── routes.json             # Copied from mm-transit-routes-reverse for matching
│   └── output/                 # observations.jsonl, quality_report.json (gitignored)
└── tests/
    ├── test_fuzzy_matching.py  # Regression tests for placard matching
    └── test_trajectory.py      # Trajectory linking tests
```

## Dependencies

- `yt-dlp` — video download
- `ffmpeg-python` — frame extraction
- `anthropic` — Claude vision API (geolocation + OCR)
- `google-genai` — Gemini vision API (cross-reference geolocation)
- `thefuzz` — fuzzy string matching for route placards
- `Pillow` — image cropping for jeepney bounding boxes
- `imagehash` — perceptual hashing for frame deduplication
- `replicate` — Grounding DINO detection + optional SAM 3 segmentation via Replicate API
- `osmnx` — OSM road network graph for route snapping and interpolation
- `networkx` — graph operations for shortest-path routing between observation points

## Compute & Infrastructure

All inference runs in the cloud — no local GPU required locally.

- **VLM calls (text extraction + geocoding + OCR):** Cloud API calls to Claude (text extraction, OCR) and Gemini (research geocoding). Cost scales with number of anchor frames and detected jeepneys. Two-step geolocation adds ~$0.005/anchor frame for Gemini research call.
- **Grounding DINO (detection):** Replicate API. ~$0.01/frame. Primary detector — 5.75x more detections than VLM with tighter bounding boxes. Optional SAM 3 refinement for segmentation masks. Once ~5,000 frames are labeled, distill into YOLO-class detector for cheaper scale inference.
- **OSM routing (assembly):** Local computation using osmnx. Downloads Metro Manila road network once, caches locally.

## CLI Interface

```
# Single video
python -m src.pipeline --video "YOUTUBE_URL" --output data/output/

# Multiple videos (aggregates observations across all)
python -m src.pipeline --video "URL1" --video "URL2" --output data/output/

# Anchor interval for geolocation (default: 10s)
python -m src.pipeline --video "URL" --anchor-interval 15 --output data/output/
```

Runs all 5 stages sequentially. Each stage reads the previous stage's output. Stages are idempotent — re-running skips already-processed frames (keyed by `observation_id`). Multi-video runs aggregate observations and produce cross-video trajectory links and route shapes.

## Scope

- **Input:** YouTube videos (user-supplied), dashcam footage from Metro Manila. Process multiple videos and aggregate.
- **Processing:** Dense 1fps frame extraction, sparse anchor geolocation every 10-15s, SAM 3 detection on all frames, OCR on detected jeepneys, trajectory linking and cross-video aggregation.
- **Output:**
  - `observations.jsonl` — all jeepney sightings with geolocation, placard reading, route match, trajectory IDs
  - `trajectories.jsonl` — linked sequences of same-vehicle observations
  - `route_shapes.geojson` — reconstructed route polylines snapped to OSM road network
  - `quality_report.json` — hit rates per stage
  - `unmatched_placards.json` — placard readings that didn't match a known route

### Success Criteria

| Stage | Metric | Viable (proceed) | Marginal (investigate) | Kill (stop) |
|-------|--------|-------------------|------------------------|-------------|
| Geolocation | % anchor frames with confident location (>0.5) | >40% | 20-40% | <20% |
| Geolocation accuracy | Median geo_radius_m of confident locations | <500m | 500m-2km | >2km |
| Detection | % frames with ≥1 jeepney detected | >30% | 20-30% | <20% |
| OCR | % detected jeepneys with readable placard | >25% | 15-25% | <15% |
| Matching | % readable placards matching a known route | >50% | 30-50% | <30% |

Kill means stop — if detection is below 20% on a major corridor like EDSA, the approach is fundamentally broken, not just miscalibrated. Geolocation accuracy matters as much as hit rate: 40% of frames getting a location that's 10km off is noise, not data.

**End-to-end success:** At least 5-10 high-confidence observations — geolocated, detected, placard read, route matched — that can be plotted on a map and visually verified against known route paths. At least 1 trajectory (same jeepney tracked across multiple frames).

### Automated Success Criteria Checks

After a pipeline run produces `observations.jsonl` and `quality_report.json`, run these commands to evaluate each metric against the thresholds above:

**Geolocation hit rate** — % of frames with geo_confidence > 0.5:
```bash
cat data/output/observations.jsonl | python3 -c "
import sys, json
lines = [json.loads(l) for l in sys.stdin]
# Deduplicate to unique frames (multiple jeepneys per frame)
frames = {}
for obs in lines:
    key = f\"{obs['source_video']}_{obs['frame_timestamp_s']}\"
    if key not in frames or obs['geo_confidence'] > frames[key]:
        frames[key] = obs['geo_confidence']
total = len(frames)
confident = sum(1 for v in frames.values() if v > 0.5)
pct = (confident / total * 100) if total else 0
status = 'VIABLE' if pct > 40 else ('MARGINAL' if pct > 20 else 'KILL')
print(f'Geolocation: {confident}/{total} frames confident ({pct:.1f}%) — {status}')
"
```

**Detection hit rate** — % of frames with ≥1 jeepney:
```bash
cat data/output/observations.jsonl | python3 -c "
import sys, json
lines = [json.loads(l) for l in sys.stdin]
frames_with_detections = set()
all_frames = set()
for obs in lines:
    key = f\"{obs['source_video']}_{obs['frame_timestamp_s']}\"
    all_frames.add(key)
    if obs.get('detection_confidence', 0) > 0:
        frames_with_detections.add(key)
# Also count frames that produced 0 observations (no jeepneys)
# These would be in quality_report.json — for this check, we use observations only
total = len(all_frames)
detected = len(frames_with_detections)
pct = (detected / total * 100) if total else 0
status = 'VIABLE' if pct > 30 else ('MARGINAL' if pct > 15 else 'KILL')
print(f'Detection: {detected}/{total} frames with jeepneys ({pct:.1f}%) — {status}')
print('NOTE: Total frames from quality_report.json may be higher (includes 0-detection frames)')
"
```

**Detection hit rate (from quality report):**
```bash
cat data/output/quality_report.json | python3 -c "
import sys, json
r = json.load(sys.stdin)
total = r.get('total_frames', 0)
detected = r.get('frames_with_detections', 0)
pct = (detected / total * 100) if total else 0
status = 'VIABLE' if pct > 30 else ('MARGINAL' if pct > 15 else 'KILL')
print(f'Detection: {detected}/{total} frames ({pct:.1f}%) — {status}')
"
```

**OCR hit rate** — % of detected jeepneys with readable placard:
```bash
cat data/output/observations.jsonl | python3 -c "
import sys, json
lines = [json.loads(l) for l in sys.stdin]
total = len(lines)
readable = sum(1 for obs in lines if obs.get('placard_text_raw', '').strip())
pct = (readable / total * 100) if total else 0
status = 'VIABLE' if pct > 25 else ('MARGINAL' if pct > 10 else 'KILL')
print(f'OCR: {readable}/{total} jeepneys with readable placard ({pct:.1f}%) — {status}')
"
```

**Matching hit rate** — % of readable placards matching a known route:
```bash
cat data/output/observations.jsonl | python3 -c "
import sys, json
lines = [json.loads(l) for l in sys.stdin]
readable = [obs for obs in lines if obs.get('placard_text_raw', '').strip()]
matched = sum(1 for obs in readable if obs.get('matched_route') is not None and obs.get('match_confidence', 0) >= 80)
total = len(readable)
pct = (matched / total * 100) if total else 0
status = 'VIABLE' if pct > 50 else ('MARGINAL' if pct > 25 else 'KILL')
print(f'Matching: {matched}/{total} readable placards matched ({pct:.1f}%) — {status}')
"
```

**End-to-end summary** — count of high-confidence complete observations:
```bash
cat data/output/observations.jsonl | python3 -c "
import sys, json
lines = [json.loads(l) for l in sys.stdin]
complete = [obs for obs in lines
    if obs.get('geo_confidence', 0) > 0.5
    and obs.get('detection_confidence', 0) > 0.5
    and obs.get('placard_text_raw', '').strip()
    and obs.get('matched_route') is not None
    and obs.get('match_confidence', 0) >= 80]
print(f'End-to-end: {len(complete)} high-confidence observations')
for obs in complete[:10]:
    print(f'  {obs[\"observation_id\"]}: {obs[\"matched_route\"]} at ({obs[\"lat\"]:.4f}, {obs[\"lon\"]:.4f}) conf={obs[\"geo_confidence\"]:.2f}')
status = 'VIABLE' if len(complete) >= 5 else ('MARGINAL' if len(complete) >= 2 else 'KILL')
print(f'Status: {status} (need ≥5 for viable)')
"
```

**Stage error summary:**
```bash
cat data/output/observations.jsonl | python3 -c "
import sys, json
lines = [json.loads(l) for l in sys.stdin]
error_counts = {}
for obs in lines:
    for stage, errs in obs.get('stage_errors', {}).items():
        if isinstance(errs, dict):
            for k, v in errs.items():
                if v is not None:
                    key = f'{stage}.{k}'
                    error_counts[key] = error_counts.get(key, 0) + 1
        elif errs is not None:
            error_counts[stage] = error_counts.get(stage, 0) + 1
if error_counts:
    print('Stage errors:')
    for k, v in sorted(error_counts.items(), key=lambda x: -x[1]):
        print(f'  {k}: {v}')
else:
    print('No stage errors recorded.')
"
```

## How to Validate

Step-by-step commands to run the pipeline on a single frame and verify each stage's output independently. This validates the full pipeline works before committing to a full video run.

### Step 0: Prerequisites Check

```bash
cd projects/jeepney-spotter
source /workspace/.env
python3 -c "
# Run the smoke test from the Prerequisites section above
import subprocess, os
assert subprocess.run(['yt-dlp', '--version'], capture_output=True).returncode == 0, 'yt-dlp not found'
assert subprocess.run(['ffmpeg', '-version'], capture_output=True).returncode == 0, 'ffmpeg not found'
assert os.environ.get('ANTHROPIC_API_KEY'), 'ANTHROPIC_API_KEY not set'
assert os.environ.get('GOOGLE_API_KEY'), 'GOOGLE_API_KEY not set'
assert os.path.exists('data/routes.json'), 'routes.json not found'
print('All prerequisites OK')
"
```

### Step 1: Extract a Single Frame

Download 10 seconds from a test video and extract 1 frame:

```bash
# Download just 10 seconds of footage
yt-dlp --download-sections "*0-10" -o "data/frames/test_video.mp4" \
  "https://www.youtube.com/watch?v=tCBd12atK_I"

# Extract 1 frame at the 5-second mark
ffmpeg -i data/frames/test_video.mp4 -vf "select=eq(n\,150)" -vframes 1 \
  data/frames/test_frame.png

# Verify frame exists and has reasonable dimensions
python3 -c "
from PIL import Image
img = Image.open('data/frames/test_frame.png')
print(f'Frame: {img.size[0]}x{img.size[1]} pixels')
assert img.size[0] > 640, 'Frame too small — video may not have downloaded correctly'
print('Stage 1 OK: frame extracted')
"
```

### Step 2: Geolocate the Frame

```bash
source /workspace/.env
python3 -c "
import anthropic, json, base64
client = anthropic.Anthropic()

with open('data/frames/test_frame.png', 'rb') as f:
    img_b64 = base64.standard_b64encode(f.read()).decode()

response = client.messages.create(
    model='claude-sonnet-4-20250514',
    max_tokens=1024,
    messages=[{
        'role': 'user',
        'content': [
            {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/png', 'data': img_b64}},
            {'type': 'text', 'text': '''You are a geolocation expert specializing in Metro Manila, Philippines.
Analyze this dashcam frame and estimate the location. Look for street signs, business names, landmarks, road features.
Respond with ONLY valid JSON: {\"lat\": <float>, \"lon\": <float>, \"confidence\": <0-1>, \"landmarks\": [<strings>], \"reasoning\": \"<string>\"}'''}
        ]
    }]
)

result = json.loads(response.content[0].text)
print(json.dumps(result, indent=2))
assert 'lat' in result and 'lon' in result, 'Missing lat/lon'
assert 0 <= result['confidence'] <= 1, 'Confidence out of range'
print(f\"Stage 2 OK: geolocated at ({result['lat']:.4f}, {result['lon']:.4f}) conf={result['confidence']}\")
"
```

### Step 3: Detect Jeepneys in the Frame

```bash
source /workspace/.env
python3 -c "
import anthropic, json, base64
client = anthropic.Anthropic()

with open('data/frames/test_frame.png', 'rb') as f:
    img_b64 = base64.standard_b64encode(f.read()).decode()

response = client.messages.create(
    model='claude-sonnet-4-20250514',
    max_tokens=1024,
    messages=[{
        'role': 'user',
        'content': [
            {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/png', 'data': img_b64}},
            {'type': 'text', 'text': '''Identify ALL jeepneys visible in this Metro Manila dashcam frame.
For each, provide bounding box [x1,y1,x2,y2] in pixels.
Respond with ONLY valid JSON: {\"jeepneys\": [{\"bbox\": [x1,y1,x2,y2], \"confidence\": <0-1>, \"orientation\": \"front|rear|side|partial\", \"placard_visible\": <bool>}], \"frame_summary\": \"<string>\"}'''}
        ]
    }]
)

result = json.loads(response.content[0].text)
print(json.dumps(result, indent=2))
print(f\"Stage 3 OK: {len(result['jeepneys'])} jeepneys detected\")
for i, j in enumerate(result['jeepneys']):
    print(f\"  Jeepney {i}: bbox={j['bbox']} conf={j['confidence']} placard_visible={j['placard_visible']}\")
"
```

### Step 4: OCR a Jeepney Placard (if detected)

```bash
source /workspace/.env
python3 -c "
import anthropic, json, base64
from PIL import Image

# Use the first detected jeepney bbox from step 3
# Replace these with actual bbox values from step 3 output
BBOX = [120, 280, 580, 520]  # REPLACE with actual values

img = Image.open('data/frames/test_frame.png')
crop = img.crop(BBOX)
crop.save('data/frames/test_crop.png')

client = anthropic.Anthropic()
with open('data/frames/test_crop.png', 'rb') as f:
    img_b64 = base64.standard_b64encode(f.read()).decode()

response = client.messages.create(
    model='claude-sonnet-4-20250514',
    max_tokens=512,
    messages=[{
        'role': 'user',
        'content': [
            {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/png', 'data': img_b64}},
            {'type': 'text', 'text': '''Read the route placard text on this jeepney.
Respond with ONLY valid JSON: {\"placard_text_raw\": \"<exact text>\", \"placard_readable\": <bool>, \"ocr_confidence\": <0-1>, \"notes\": \"<context>\"}'''}
        ]
    }]
)

result = json.loads(response.content[0].text)
print(json.dumps(result, indent=2))
print(f\"Stage 4a OK: placard='{result['placard_text_raw']}' conf={result['ocr_confidence']}\")
"
```

### Step 5: Fuzzy Match the Placard Text

```bash
python3 -c "
from thefuzz import fuzz, process
import json, re

# Load routes
with open('data/routes.json') as f:
    routes = json.load(f)

NOISE = ['MODERN PUJ', 'TRADITIONAL JEEPNEY', 'LOOP']
def clean(s):
    s = s.upper()
    for c in '—–-/(),':
        s = s.replace(c, ' ')
    for n in NOISE:
        s = s.replace(n, '')
    s = s.replace('STA.', 'SANTA').replace('STO.', 'SANTO')
    return re.sub(r'\s+', ' ', s).strip()

route_names = {r['route_id']: clean(r['route_long_name']) for r in routes}
choices = list(route_names.values())
ids = list(route_names.keys())

# Replace with actual placard text from step 4
PLACARD = 'CUBAO - DIVISORIA'  # REPLACE with actual OCR output
cleaned = clean(PLACARD)

results = process.extract(cleaned, choices, scorer=fuzz.token_set_ratio, limit=5)
print(f'Placard: \"{PLACARD}\" → cleaned: \"{cleaned}\"')
print('Top 5 matches:')
for name, score, idx in results:
    route_id = ids[choices.index(name)]
    print(f'  {score:3d}  {route_id:40s}  {name}')

best = results[0]
if best[1] >= 80:
    print(f\"Stage 5 OK: auto-matched to {ids[choices.index(best[0])]} (score={best[1]})\")
elif best[1] >= 50:
    print(f\"Stage 5 OK: candidate match {ids[choices.index(best[0])]} (score={best[1]}, needs review)\")
else:
    print(f'Stage 5 OK: no match (best score={best[1]}, logged as unmatched)')
"
```

### Step 6: Verify Assembly

After running all stages, verify the output file is well-formed:

```bash
python3 -c "
import json
with open('data/output/observations.jsonl') as f:
    obs = [json.loads(line) for line in f]
print(f'Total observations: {len(obs)}')
for o in obs[:3]:
    print(json.dumps(o, indent=2))

# Verify schema
required_fields = ['observation_id', 'source_video', 'frame_timestamp_s', 'lat', 'lon',
    'geo_confidence', 'geo_radius_m', 'placard_text_raw', 'matched_route', 'match_confidence',
    'bbox', 'vehicle_type', 'detection_confidence', 'trajectory_id', 'stage_errors']
for o in obs:
    for field in required_fields:
        assert field in o, f'Missing field: {field} in {o[\"observation_id\"]}'
print('Schema validation passed')
"
```

## Investigation Results

Two investigations were run on real EDSA dashcam footage (total cost: $0.49). Key findings that shaped the current architecture:

### Investigation 1 — Baseline Pipeline (Cost: $0.36)

- **14 frames** extracted from a 60-second EDSA clip
- **Detection:** 50% of frames had ≥1 jeepney (viable, above 30% threshold). 8 jeepneys detected across 14 frames via Claude VLM
- **Geolocation:** Claude and Gemini disagreed by **14km** on frame 7 and **12km** on frame 14. Gemini won every tiebreaker by reading signage text (PSBank, BDO branch names, politician billboards). The "prefer Claude" tiebreaker was empirically wrong
- **OCR:** 1/5 readable placards (20%, below 25% viable threshold). The placard read "BOTOLAN" — a Zambales provincial route, not in the 604-route database. Fuzzy match score: 42 (correctly flagged as unmatched). Discovery pathway validated
- **Bounding box quality:** VLM bounding boxes were so approximate that several OCR crops contained power lines and road surface, not jeepneys. The 20% OCR rate was a detection quality problem, not an OCR problem
- **Frame classification gap:** First 2 frames were Google Earth aerial views (video intro), wasting API calls. Perceptual hash dedup doesn't catch aerial-to-dashcam mode switches

### Investigation 2 — Improved Pipeline (Cost: $0.13)

- **Read + Geocode geolocation:** Claude reads text (Jollibee, ACLC College, Philippine Heart Center), Gemini geocodes the cluster → 25m accuracy on frame 10 (vs 7,800m with single-shot). Frame 14: 10m accuracy (vs 3,600m). Splitting the task produces orders-of-magnitude improvement at near-zero extra cost
- **Grounding DINO detection:** 23 jeepneys found across 4 frames vs Claude's 4 on the same frames (**5.75x improvement**). Frame 10: DINO found 8 jeepneys where Claude found zero. Cost: $0.01/frame. Tighter bounding boxes cascade into better OCR crops
- **SAM 2 video on Replicate:** Model ID was wrong, didn't work for single images. But unnecessary — Grounding DINO's bounding boxes are already tight enough for OCR crops. SAM useful as optional refinement layer on top of DINO, not as primary detector

### Actionable Changes Made to This Spec

1. **Stage 2:** Research-based geolocation (read + geocode) is now the primary approach, not a roadmap item
2. **Stage 3:** Grounding DINO is now the primary detector, SAM 3 is optional refinement
3. **Stage 1b:** Frame classification added as pre-filter for aerial/metadata frames
4. **Tiebreaker:** "Prefer Claude" rule dropped — use highest confidence regardless of model
5. **Fuzzy matching:** Two-pass approach preserves "via" signal (previously stripped)
6. **Success criteria:** Added geolocation accuracy threshold (median geo_radius_m)
7. **Kill thresholds:** Tightened detection kill from 15% to 20%

## Roadmap

1. **Collective route snapping (map matching)** — Current assembly snaps observations independently to the road network. Better approach: snap all observations for a route *collectively* — find the path on the OSM road graph that best fits all observations as a group. Noisy geolocations (off by 500m-2km) cancel out when 20 observations all roughly follow the same corridor. The road network constrains the solution — there are only so many paths between Cubao and Divisoria. This is the same map-matching algorithm Uber uses for GPS traces, except with 200-2000m accuracy instead of 5m. Enables route reconstruction even with mediocre per-observation accuracy.

2. **Google Places API geocoding** — Current research geocoding uses Gemini for the geocode step. For production, replace with Google Places API for deterministic, cacheable results. Cost: basically free at this scale (cents per hundreds of lookups).

3. **YOLO distillation** — Once Grounding DINO + SAM 3 have labeled ~5,000 frames, train a YOLO-class jeepney detector and deploy on a cheap endpoint. Replaces DINO for scale processing at lower cost.

4. **GTFS export** — Generate `shapes.txt` entries for the 604 jeepney routes in the existing `mm-transit-routes-reverse` feed. This is the end goal — filling in the 97% geometry gap.

5. **Visualization** — Web app showing observation density heatmap and reconstructed route polylines on a map.

6. **Community video ingestion** — Accept dashcam footage submissions from Manila drivers to scale observation coverage beyond YouTube.

## Prior Art

No existing system extracts transit routes from video. All successful informal transit mapping (Digital Matatus/Nairobi, WhereIsMyTransport/Cape Town, Trufi Association) required human riders with GPS phones.

Grounding DINO enables text-prompted object detection with tight bounding boxes — used in Stage 3 for jeepney detection (5.75x more detections than VLM approach at $0.01/frame). VLMs (Claude, Gemini) can read text from street-level imagery — used in Stage 2 for text extraction, with a separate geocoding step for coordinate estimation. Investigation validated this split approach: 25m accuracy vs 7,800m with single-shot VLM geolocation. This pipeline combines both capabilities in a novel way.

Existing datasets with the geometry gap:
- Sakay.ph GTFS (GitHub): 296-349 routes, frozen since 2020
- TUMI Datahub Manila GTFS: same data, frozen July 2020
- OSM: only 23 of 400+ jeepney routes have geometric relations
- LTFRB franchise database: not publicly downloadable
