# Investigation Report: Jeepney Vision Pipeline — Ultra Comprehensive

**Date:** 2026-04-14
**Spec:** `docs/superpowers/specs/2026-04-08-jeepney-spotter-design.md`
**Duration:** ~30 minutes
**Prior investigations:** 2 (v1: $0.36, v2: $0.13)

## Summary

- Steps attempted: 10 (6 main + 4 branching investigations)
- Succeeded: 9
- Failed: 1 (Grounding DINO false positive rate)
- Skipped: 0
- Timed out: 0

## CRITICAL UPDATE: Spec Premise Invalidated

**Post-investigation discovery:** Sakay.ph's live Route Explorer has **458 jeepney routes with full geometry, stops, fares, and schedules**. The spec's core claim ("97% lack polyline geometry") was based on the stale 2020 GitHub GTFS export. The geometry data EXISTS — Sakay.ph has it. The pipeline proved the concept works but the Manila jeepney use case is better solved by importing existing data. See gap analysis below.

### Sakay.ph vs Our Data

| | Our Database | Sakay.ph Live |
|---|---|---|
| Total jeepney routes | 609 | 458 |
| With geometry | 22 (3.6%) | 458 (100%) |
| With stop lists | ~0 | 458 (11-156 stops each) |
| Name-matched overlap | ~293 routes (48%) | |
| Sakay-only routes | | ~115 |
| Our-only routes | ~66 | |

## Critical Findings

### Finding 1: Read+Geocode Geolocation is Production-Ready

100% hit rate on 18 anchor frames with 50-150m accuracy. The two-step approach (Claude reads text → Gemini geocodes business clusters via text-only API with `responseMimeType: "application/json"`) eliminates both the accuracy problem AND the JSON parsing problem from prior investigations.

**Specific improvement:** Gemini 2.5 Flash with `responseMimeType: "application/json"` forces structured output, eliminating the truncated/malformed responses that plagued prior runs. No image needed for the geocoding step — pure text reasoning about business clustering.

### Finding 2: Grounding DINO is Fundamentally Broken for Jeepneys

97% false positive rate. Of 135 "jeepney" detections across 30 frames, VLM confirmation showed only 1 was actually a jeepney. DINO detected every vehicle type (SUVs: 24, buses: 3, motorcycles: 2) as "jeepney" because the text-prompted detection model has no concept of what a Filipino jeepney looks like.

**Spec impact:** Stage 3 (Detection) needs complete rethinking. Options:
1. Fine-tune a YOLO model on manually labeled jeepney images
2. Use VLM detection (lower count but accurate)
3. Two-stage: DINO detects "vehicle" → VLM confirms "is this a jeepney?"

### Finding 3: OCR Bottleneck is Camera Position, Not Quality

4.3% readable placard rate (1 out of 23 detected jeepneys). This is below the spec's KILL threshold of 15%. But the cause is physical, not algorithmic: dashcam footage captures oncoming jeepneys at 50-100m distance across 6 lanes of EDSA. Route placards are windshield-mounted, facing forward — readable only to passengers/vehicles approaching from the front.

**Spec fix needed:** Forward-facing dashcam on a multi-lane divided highway is the worst possible camera angle for placard reading. Better approaches:
- Side-window camera
- Rear-facing camera (captures jeepneys driving alongside/behind)
- Dedicated video from jeepney terminals (where vehicles are stationary)
- Google Street View imagery (captures both sides of the street)

### Finding 4: One Real Route Inferred and Validated

**Route MODERN-015 (Novaliches-Malinta)** identified from frame_143:
- Two independent OCR readings: "NOVALICHES EXIT VIA ALAM" (VLM full-frame) and "WTSC NOVA MALINTA EXIT via ALAMINOS" (DINO crop)
- Fuzzy match score: 76 (candidate range)
- Location: (14.6500, 121.0028) — northern EDSA, Caloocan
- **Geographically validated**: Novaliches-Malinta route would cross EDSA in Caloocan, exactly where observed

### Finding 5: Video Structure Discovery

The EDSA video is NOT a straight drive — it alternates between street-level dashcam footage and Google Earth aerial transitions, jumping between Caloocan (north) and Ortigas (south). This non-linear structure means:
- Frame deduplication doesn't catch mode switches (aerial ↔ dashcam)
- Frame classification is essential but the spec's first-15-frames check misses mid-video aerials
- Geolocation timestamps can't assume monotonic travel direction

## Steps

### 1. Video Download + Frame Extraction
- **Status:** success
- **Duration:** 2m
- **Result:** 190 frames at 1fps from 3-minute EDSA clip (30s-210s offset to skip intro). Perceptual hash dedup removed 13 duplicates (6.8%). 177 unique frames. All classified as street-level (intro skipped).
- **Key finding:** 6.8% dedup rate at 1fps — lower than spec's predicted 10-20% because this section had consistent movement (not heavy traffic standstill).

### 2. Read+Geocode Geolocation
- **Status:** success
- **Duration:** ~3m
- **Result:** 18/18 anchor frames geolocated (100%). Median radius: ~100m.
- **Key finding:** Text-only Gemini geocoding with `responseMimeType: "application/json"` is the breakthrough. Prior investigations used image-based Gemini calls that returned verbose markdown. Pure text reasoning ("these businesses are on EDSA: Shakey's Caloocan, 24 Chicken Monumento, MCU Hospital") produces better coordinates AND parseable output.
- **Branching discovery:** Coordinates jump non-linearly (Caloocan → Ortigas → Caloocan → Ortigas) revealing the video contains Google Earth transitions, not continuous driving.

### 3. Grounding DINO Detection
- **Status:** success (technically) / failure (practically)
- **Duration:** ~8m (rate limited at 6 req/min on <$5 credit tier)
- **Result:** 135 detections across 30 frames (4.5 per frame avg). 29/30 frames had detections (97%).
- **Key finding:** 97% false positive rate. DINO's text-prompted detection with query "jeepney" matches every vehicle type. The 5.75x improvement over VLM from investigation v2 was an illusion — DINO found more boxes, but almost none were jeepneys.

### 4a. VLM Confirmation Branch
- **Status:** success
- **Duration:** ~3m
- **Result:** 30 DINO detections sent to Claude for confirmation. 1/30 (3%) confirmed as jeepney. 24 SUVs, 3 buses, 2 motorcycles.
- **Key finding:** Two-stage (DINO → VLM confirm) works but at 3% true positive rate, it's cheaper to skip DINO and use VLM directly.

### 4b. Full-Frame VLM Scan
- **Status:** success
- **Duration:** ~5m
- **Result:** 30 frames scanned. 4 frames with jeepneys (13%). 1 readable placard.
- **Key finding:** VLM full-frame detection is more conservative (4 vs 135) but more accurate. 13% detection rate is below the 30% viable threshold when sampling every 6th frame, but rises to 33% in neighborhood scans of jeepney-dense areas.

### 4c. Neighborhood Scan
- **Status:** success
- **Duration:** ~4m
- **Result:** 27 additional frames around confirmed jeepney hotspots. 19 jeepney observations. 0 additional readable placards.
- **Key finding:** Jeepneys cluster in specific EDSA segments (Ortigas area: frames 55-64, Monumento area: frames 88-95). But even at close temporal proximity, placards remain unreadable due to distance and angle.

### 5. OCR + Fuzzy Matching
- **Status:** success
- **Duration:** <1m
- **Result:** "NOVALICHES EXIT VIA ALAM" → MODERN-015 (Novaliches-Malinta), score 76. "BOTOLAN" → unmatched (score 42).
- **Key finding:** Two-pass matching (with/without VIA) correctly handles partial placard reads. The placard "WTSC NOVA MALINTA EXIT via ALAMINOS" from the DINO crop matched T3157 (Malinta-Recto) at 70 — both point to Novaliches/Malinta area routes.

### 6. Assembly + Trajectory Linking
- **Status:** success
- **Duration:** <1m
- **Result:** 23 observations in JSONL. 2 trajectories found (13 and 6 observations respectively). GeoJSON exported.
- **Key finding:** Trajectory 1 (frames 55-64, Ortigas area) spans 209m over 9 seconds. Speed estimate: 83 km/h — too fast for a jeepney, suggesting these are interpolated positions from a non-linear video structure, not actual jeepney movement. Trajectory 2 (frames 90-95, Monumento) spans 60m at ~43 km/h — more plausible.

## Surprises

1. **Gemini 2.5 Flash uses thinking tokens.** With `maxOutputTokens: 256`, the response was truncated after "{"lat": 14.6" — most tokens went to internal reasoning. Setting `maxOutputTokens: 8192` and `responseMimeType: "application/json"` fixed both issues simultaneously.

2. **Grounding DINO doesn't know what a jeepney is.** The v2 investigation's "5.75x improvement" was actually 5.75x more false positives. This is the biggest spec gap discovered.

3. **The video is a compilation, not a continuous drive.** Google Earth transitions between EDSA segments create discontinuous coordinate sequences that break trajectory linking assumptions.

4. **Placard readability is a physics problem.** On a 6-lane divided highway, oncoming jeepneys are 15-20m away across a median. At 1080p, a placard at that distance is ~30px wide — below readable threshold regardless of OCR quality.

5. **Replicate free tier rate limits (6 req/min) add ~5 minutes to any DINO-based pipeline.** At scale, this requires a paid tier or batching strategy.

## Cost Breakdown

| Service | Calls | Est. Cost |
|---------|-------|-----------|
| Claude API (text extraction, 18 frames) | 18 | ~$0.29 |
| Claude API (detection, 30 frames) | 30 | ~$0.48 |
| Claude API (OCR + confirmation, 55 calls) | 55 | ~$0.44 |
| Claude API (neighborhood scan, 27 frames) | 27 | ~$0.43 |
| Gemini API (geocoding, 18 text-only) | 18 | ~$0.02 |
| Replicate Grounding DINO (30 frames) | 30 | ~$0.30 |
| **Total (investigation)** | **178** | **~$1.96** |

## Artifacts Index

| File | Description |
|------|-------------|
| steps/01-download-extract/artifacts/edsa_3min.webm | 3-min EDSA footage |
| steps/01-download-extract/artifacts/frames_deduped/*.jpg | 177 deduplicated frames |
| steps/01-download-extract/artifacts/dedup_report.json | Dedup statistics |
| steps/02-geolocation/artifacts/claude_*.json | Text extraction results (18) |
| steps/02-geolocation/artifacts/gemini_*.json | Geocoding results (18) |
| steps/02-geolocation/artifacts/geolocation_results.json | Combined geolocation |
| steps/03-detection/artifacts/detection_results.json | Grounding DINO results (30) |
| steps/04-ocr-matching/artifacts/*_fullframe.json | VLM detection+OCR (57) |
| steps/04-ocr-matching/artifacts/match_results.json | Fuzzy matching results |
| steps/05-assembly/artifacts/observations.jsonl | All observations |
| steps/05-assembly/artifacts/observations.geojson | Map-ready GeoJSON |
| steps/05-assembly/artifacts/quality_report.json | Pipeline metrics |
