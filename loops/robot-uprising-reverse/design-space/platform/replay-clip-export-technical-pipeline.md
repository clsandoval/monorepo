# 6.05b — Replay GIF/Clip Export Technical Pipeline on PC

## The Design Question

How does Robot Uprising's browser-based tech stack (React + Pixi.js + Vite, no backend) actually capture, encode, and export gameplay clips as GIF, MP4, and WebP — at quality levels that rival native screen recording, with watermarking, clipboard integration, and sub-3-second render times? This is the engineering blueprint for the Cascade Pipeline described in `6.09`.

The Opus Magnum lesson isn't just "add a GIF button." It's that the game's *architecture* was designed from day one to produce GIF-ready frames — a two-pass render system that first runs to steady state, then captures one clean loop. Robot Uprising's deterministic tick engine gives us an even stronger foundation: every match is a pure function of its inputs. We never screen-capture. We re-render from state.

---

## The Technical Landscape (2025-2026 Browser APIs)

### Frame Capture: Pixi.js ExtractSystem

Pixi.js v7+ provides `renderer.extract` with methods for pulling pixel data from the WebGL canvas:
- `extract.canvas(target)` → returns a Canvas2D element
- `extract.pixels(target)` → returns a `Uint8Array` of RGBA data
- `extract.image(target)` → returns an `HTMLImageElement`
- `extract.base64(target)` → returns a base64-encoded string

**Critical insight:** For clip export, we don't use live capture at all. Because the game engine is deterministic and tick-based, we **re-simulate the match** at maximum speed and call `extract.canvas()` after each tick render. This produces pixel-perfect frames at any resolution — 1080p, 4K, or thumbnail — without being constrained by the player's monitor resolution or frame rate during actual gameplay.

### Video Encoding: Three Tiers

**Tier 1 — WebCodecs API (Primary, Modern Browsers)**
The WebCodecs API provides low-level access to hardware video encoders. As of 2025-2026: Chrome 94+, Firefox 133+, Safari 16.6+ (partial), Safari 26+ (full). The `canvas-record` library wraps this cleanly: 5-10× faster than FFmpeg WASM, 20× faster than software H264 encoding. Supports VP8/VP9/AV1/HEVC codecs. Uses `mp4-muxer` for container creation.

Pipeline: `Pixi.js extract → VideoFrame → VideoEncoder → EncodedVideoChunk → mp4-muxer → Blob → download/clipboard`

**Tier 2 — FFmpeg WASM (Fallback, Broad Compatibility)**
For browsers without WebCodecs (Firefox Android, older Safari): `@ffmpeg/ffmpeg` runs the full FFmpeg stack compiled to WebAssembly. Slower (real-time or slower), larger download (~25MB WASM binary), but supports every format. Requires `SharedArrayBuffer` and correct CORS headers (`Cross-Origin-Embedder-Policy: require-corp`, `Cross-Origin-Opener-Policy: same-origin`).

**Tier 3 — MediaRecorder API (Emergency Fallback)**
The oldest and most broadly supported API. Captures the canvas as a WebM stream in real-time. Quality varies by browser. No frame-accurate control — frames can be dropped. Only used when WebCodecs and FFmpeg WASM both fail.

### GIF Encoding: Two Options

**`gifenc` (mattdesl) — Recommended**
Fast, modern GIF encoding. ~15KB minified. Synchronous or Web Worker mode. Supports per-frame delay, global/local color tables, dithering control. Produces well-optimized GIFs.

**`gif.js` (jnordberg) — Legacy Alternative**
Older but battle-tested. Uses Web Workers for parallel quantization. Slightly larger API surface. Good fallback if `gifenc` has compatibility issues.

### WebP Encoding: Native Canvas API

`canvas.toBlob('image/webp', quality)` is supported in Chrome, Firefox, and Edge. Safari added WebP encoding in Safari 16+. WebP animated sequences require a custom muxer (no native browser API for animated WebP), making this format best suited for **still frames** (match cards, architecture screenshots) rather than clips.

### Clipboard: Images Only

`navigator.clipboard.write()` supports `image/png` via `ClipboardItem`. Video blobs (`video/mp4`) are **not supported** by the Clipboard API in any browser. Design implication: "Copy to clipboard" produces a PNG still frame (the peak moment), not the video clip. The clip itself goes to download or share sheet.

---

## Six Technical Architecture Options

### Option A: "The Render Farm" — Offline Re-Simulation Pipeline

**How it works:** When the player requests a clip export, the game spawns a Web Worker running a headless copy of the tick engine. The worker re-simulates the selected tick range, calling into an OffscreenCanvas-backed Pixi.js renderer at the target resolution. Each frame is passed to the encoder (WebCodecs or FFmpeg WASM). The main thread stays responsive — the player can browse the Inspector while the clip renders in the background.

**Technical flow:**
```
User selects tick range (e.g., T19–T26)
  → Worker receives: match seed + initial config + target tick range + resolution + format
  → Worker re-simulates T0 → T19 (fast, no rendering)
  → Worker renders T19 → T26 (one Pixi.js frame per tick at target resolution)
  → Each frame → VideoEncoder.encode(VideoFrame) or gifenc.addFrame(canvas)
  → Final: Blob created, transferred to main thread via postMessage(blob, [blob])
  → Main thread: download trigger / share sheet / toast notification
```

**Render budget for a 60-tick match at 1080p:**
- Pixi.js render per frame: ~5ms (8×8 grid, <50 sprites, simple shader effects)
- WebCodecs encode per frame: ~2ms (hardware H.264)
- Total for 60 frames: ~420ms
- Muxing + finalization: ~100ms
- **Total: ~500ms for a full match clip**

For GIF: `gifenc` encodes at ~15ms/frame (color quantization is CPU-intensive). A 60-frame GIF takes ~1 second.

**Strengths:**
- Sub-second render for most clips. The "encoding..." progress ring barely appears.
- Resolution-independent. Can export at 4K even on a 1080p monitor.
- Main thread never blocks. Player can continue Inspector analysis.
- Deterministic re-render means the exported clip is pixel-identical to what the player saw.

**Weaknesses:**
- Requires a full copy of the game engine and Pixi.js renderer in the Worker. Bundle size impact: ~200-400KB additional.
- OffscreenCanvas + WebGL in Workers has browser-specific quirks (Safari added full support in Safari 17).
- The headless re-simulation must exactly match the main simulation — any divergence produces incorrect clips.

**Sensory description:** The player selects a tick range on the Inspector timeline. A cyan highlight sweeps across the selected ticks. They tap "Export MP4." A circular progress ring appears at the bottom-right of the screen — a thin cyan line sweeping clockwise around a small film-reel icon. The ring completes in 0.8 seconds. A soft ascending two-note chime plays (C5 → E5, 200ms each). A toast slides in from the bottom: "Clip saved — Mission 5, ticks 19-26" with "Open" and "Share" buttons. The toast auto-dismisses after 5 seconds, leaving a small green checkmark badge on the export button.

---

### Option B: "The Screenshot Sequence" — Frame-by-Frame Image Export

**How it works:** Instead of encoding video in-browser, the game exports individual PNG frames (one per tick) as a ZIP file. The player uses external tools (FFmpeg CLI, Premiere, DaVinci Resolve) to assemble the clip. For quick sharing, the game also offers a single "best frame" PNG (the tick with highest event density) exported to clipboard.

**Technical flow:**
```
User selects tick range
  → Re-simulate and render each tick to canvas
  → canvas.toBlob('image/png') per frame → collect in JSZip
  → JSZip.generateAsync({type: 'blob'}) → download as frames.zip
  → Bonus: peak tick frame → navigator.clipboard.write([ClipboardItem]) → clipboard
```

**Strengths:**
- Zero encoding dependencies. No WebCodecs, no FFmpeg WASM, no CORS headers.
- Maximum quality — lossless PNGs at any resolution.
- Content creators with professional editing workflows prefer raw frames.
- Works in every browser that supports `canvas.toBlob()` (effectively all modern browsers).

**Weaknesses:**
- Extremely high friction for casual sharing. "Download a ZIP and run FFmpeg" is a non-starter for 95% of players.
- ZIP file sizes are large (~500KB per 1080p PNG × 60 ticks = ~30MB for a full match).
- No audio. Professional workflows add audio separately.

**Best suited for:** The Director's Cut pipeline (6.09, Option F) as an "Export Raw Frames" option for content creators who want maximum post-production control.

---

### Option C: "The Canvas Recorder" — Real-Time Capture During Sealed Watch

**How it works:** During the Sealed Watch, a `MediaRecorder` streams the Pixi.js canvas to a WebM blob in real-time. When the match ends, the blob is available for instant download — no re-rendering needed.

**Technical flow:**
```
Sealed Watch begins
  → canvas.captureStream(fps) → MediaRecorder({mimeType: 'video/webm; codecs=vp9'})
  → recorder.ondataavailable → collect chunks
Sealed Watch ends
  → new Blob(chunks, {type: 'video/webm'}) → available immediately
  → Optional: use FFmpeg WASM to remux WebM → MP4 for broader compatibility
```

**Strengths:**
- Zero re-render cost. The clip is ready the instant the match ends.
- Captures exactly what the player saw, including any browser-level rendering artifacts.
- MediaRecorder is supported in Chrome 49+, Firefox 25+, Safari 14.1+.

**Weaknesses:**
- Quality depends on the player's hardware. Low-end machines produce choppy recordings.
- Resolution locked to the player's canvas size during gameplay. No 4K upscale.
- WebM format has limited shareability (no native iOS playback, no Twitter embedding).
- No post-hoc trimming without re-encoding. The full match is one blob.
- Conflicts with "no backend" principle less than with "quality-first" principle — the quality is unpredictable.

**Best suited for:** A secondary "quick capture" option alongside the deterministic re-render pipeline.

---

### Option D: "The Hybrid Renderer" — WebCodecs Primary + GIF Fallback + MediaRecorder Emergency

**How it works:** Feature detection at startup determines the best available encoding path. The game uses the highest-quality option available and falls back gracefully.

**Capability detection cascade:**
```javascript
async function detectExportCapabilities() {
  const capabilities = {
    webcodecs: false,
    ffmpegWasm: false,
    mediaRecorder: false,
    gifenc: true, // always available (pure JS)
    clipboard: false,
    shareApi: false,
  };

  // Tier 1: WebCodecs
  if ('VideoEncoder' in window) {
    const support = await VideoEncoder.isConfigSupported({
      codec: 'avc1.42001E', // H.264 Baseline
      width: 1920, height: 1080,
      bitrate: 5_000_000,
      framerate: 1, // tick-based, not 60fps
    });
    capabilities.webcodecs = support.supported;
  }

  // Tier 2: FFmpeg WASM (requires SharedArrayBuffer)
  capabilities.ffmpegWasm = typeof SharedArrayBuffer !== 'undefined';

  // Tier 3: MediaRecorder
  capabilities.mediaRecorder = 'MediaRecorder' in window
    && MediaRecorder.isTypeSupported('video/webm; codecs=vp9');

  // Clipboard
  capabilities.clipboard = 'clipboard' in navigator
    && 'write' in navigator.clipboard;

  // Web Share API (mobile-first)
  capabilities.shareApi = 'share' in navigator
    && 'canShare' in navigator;

  return capabilities;
}
```

**Export decision matrix:**

| Format | WebCodecs Available | FFmpeg WASM Available | Neither |
|--------|--------------------|-----------------------|---------|
| MP4 | WebCodecs + mp4-muxer (~500ms) | FFmpeg WASM (~5s) | Offer WebM via MediaRecorder |
| GIF | gifenc (~1s) | gifenc (~1s) | gifenc (~1s) |
| WebP (still) | canvas.toBlob (~50ms) | canvas.toBlob (~50ms) | canvas.toBlob (~50ms) |
| Clipboard | PNG via Clipboard API | PNG via Clipboard API | PNG via Clipboard API |

**Strengths:**
- Works everywhere. Every browser gets the best possible output.
- Graceful degradation is invisible to the player — they see "Export MP4" regardless of which encoder runs underneath.
- The capability detection runs once at startup; no per-export overhead.

**Weaknesses:**
- Complexity. Three encoding paths = three sets of bugs.
- The FFmpeg WASM fallback requires ~25MB of WASM binary. Lazy-load on first export request.
- Testing matrix is large: 3 browsers × 3 encoding tiers × 3 output formats.

---

### Option E: "The Replay-First Architecture" — Encode Nothing, Share Everything

**How it works:** Leans entirely into the deterministic replay model (6.09, Option E). Instead of encoding video at all, the game exports compact replay codes (`RU-M5-v2-3a8f?t=19&end=26`) that any browser running the game can play back. Video encoding is deferred to an optional "Download as video" button in the replay viewer — effectively pushing the encoding cost to the viewer, not the sharer.

**Technical flow:**
```
Player selects tick range
  → Serialize: {seed, config_hash, start_tick, end_tick, camera_state}
  → Encode as compact URL-safe string (~40-60 characters)
  → Copy to clipboard as text
  → When viewer opens link: game loads, re-simulates, plays tick range
  → Viewer can optionally "Download as MP4" from their own browser
```

**Strengths:**
- Near-zero bandwidth. A 50-character string encodes an entire match segment.
- The viewer gets full interactivity — they can pause, scrub, inspect units, view different camera angles.
- No encoding libraries needed at share-time. Zero bundle size impact for the basic share path.
- The replay viewer is the game's web demo — every replay link is a free acquisition funnel.

**Weaknesses:**
- Not a video. Can't auto-play on Twitter, Discord, or Reddit. Can't paste into a WhatsApp chat and have it play inline.
- Requires the viewer to load the game (or web demo). High friction for casual discovery.
- The replay is only valid for the game version that produced it. Version migrations break old replays unless the engine is backward-compatible.

**Best suited for:** Community analysis, teaching, forum posts, Discord coaching — any context where the viewer is already engaged with the game. Must be paired with video export for casual viral sharing.

---

### Option F: "The Social Card Engine" — Static Image Generation Pipeline

**How it works:** A specialized renderer produces designed static images (Match Cards, Architecture Screenshots) rather than video. Uses the Pixi.js renderer to composite game elements with designed templates — terrain backdrops, typography, heatmap overlays, unit icons, QR codes — into a single high-resolution PNG.

**Technical flow:**
```
Match ends
  → Render terrain backdrop at 1080×1080 (1:1) or 1920×1080 (16:9) to OffscreenCanvas
  → Overlay: desaturate to 30% brightness, apply gaussian blur (sigma=4)
  → Composite: unit icons (pre-rendered sprites), heatmap overlay (per-tile colored squares at 20% opacity),
    mission title (game font via Canvas2D measureText + fillText), tick count, outcome badge
  → QR code: generate via `qrcode` library (replay link encoded), render at 80×80px in bottom-right
  → Watermark: game logo at 10% opacity, bottom-right
  → canvas.toBlob('image/png') → Clipboard API + download
```

**QR Code generation:** Use `qrcode` npm package (~12KB). Encode the replay link (`RU-M5-v2-3a8f`) into a QR code. The QR code links to the web demo replay viewer. On scan: viewer loads game → auto-plays the match → Inspector available.

**Watermark implementation:** The game logo is a pre-rendered PNG sprite (~2KB). Composited at 10% opacity in the bottom-right corner of every export (Match Card, Architecture Screenshot, video clip). Position: 16px inset from edges. Optional toggle in settings to remove watermark (disabled in free/demo version, available in full game).

**Strengths:**
- Lightning-fast. A Match Card renders in <100ms.
- Universal shareability. PNGs work everywhere — Discord, Reddit, Twitter, WhatsApp, iMessage, email, print.
- The QR code creates a bridge from static image to interactive replay.
- Clipboard API support means one-tap copy → paste into any chat.

**Weaknesses:**
- Static images lack motion. The "did you see that?" moment requires video.
- QR codes require the viewer to actively scan — most won't.
- The designed template limits customization. Every Match Card looks similar after 20 matches.

---

## Recommended Architecture: "The Cascade Renderer"

Combine Options A + D + E + F into a unified pipeline:

```
ExportManager
├── MatchCardRenderer (Option F)
│   ├── Produces: 1080×1080 PNG (1:1) or 1920×1080 (16:9)
│   ├── Auto-generated after every match (zero player action)
│   ├── To clipboard: navigator.clipboard.write([ClipboardItem({image/png: blob})])
│   └── QR code: replay link → qrcode lib → composite
│
├── HighlightDetector
│   ├── Scans event log for peak ticks (kill, cascade, overload, pivot)
│   ├── Ranks by event density + EDT proximity
│   └── Returns: [{startTick, endTick, category, score}]
│
├── ClipRenderer (Option A re-render + Option D capability detection)
│   ├── Input: tick range, resolution, format, overlays, camera state
│   ├── Web Worker with OffscreenCanvas + headless Pixi.js
│   ├── Encoder: WebCodecs (primary) → FFmpeg WASM (fallback) → MediaRecorder (emergency)
│   ├── GIF: gifenc (always available)
│   ├── Produces: MP4 / WebM / GIF blob
│   └── Audio mux: Web Audio API renders tick audio → AudioEncoder → interleaved with video
│
├── ReplayLinkGenerator (Option E)
│   ├── Serializes: seed + config_hash + tick_range + camera_state
│   ├── Encodes: base62 URL-safe string (~40-60 chars)
│   └── Format: RU-{mission}-{version}-{hash}?t={start}&end={end}
│
└── ShareManager
    ├── Web Share API (mobile): navigator.share({files: [blob], title, text})
    ├── Clipboard (images): navigator.clipboard.write()
    ├── Clipboard (replay links): navigator.clipboard.writeText()
    ├── Download: URL.createObjectURL(blob) → <a download>
    └── Platform presets: {twitter: {maxDuration: 140s, maxSize: 512MB},
                           discord: {maxSize: 25MB, preferGIF: true},
                           tiktok: {aspect: '9:16', maxDuration: 60s}}
```

### Audio Encoding Pipeline

The sealed watch audio (kulintang gongs, signal chimes, combat crunches, buffer alarms) must be captured and muxed into MP4 clips. The Web Audio API's `OfflineAudioContext` renders the audio for the selected tick range:

```
OfflineAudioContext(channels=2, length=tickCount*sampleRate, sampleRate=44100)
  → Schedule all audio events for tick range (gong at T19, chime at T20-21, crunch at T24)
  → offlineCtx.startRendering() → AudioBuffer
  → AudioBuffer → AudioEncoder (WebCodecs) → EncodedAudioChunk
  → Interleave with video chunks in mp4-muxer
```

For GIF export: no audio (GIF format doesn't support audio). The highlight reel UI should indicate this: "GIF (no audio) / MP4 (with audio)" with the audio icon greyed out on the GIF option.

### Watermark Specification

```
Position: bottom-right, 16px inset from canvas edges
Size: 48×48px (scales with export resolution)
Content: Robot Uprising circuit-brain logo
Opacity: 12% normal, 18% on dark backgrounds (auto-detected via average luminance of bottom-right 96×96px region)
Format: pre-rendered PNG sprite, composited after all game content but before encoding
Toggle: Settings → Export → "Show watermark" (default: on, cannot be disabled in demo/free version)
Animation (video only): 200ms fade-in at clip start, persistent thereafter
```

### File Naming Convention

```
{game}-{mission}-{ticks}-{outcome}-{timestamp}.{ext}

Examples:
  robot-uprising-m5-t19-t26-victory-20260317-143022.mp4
  robot-uprising-m5-t19-t26-victory-20260317-143022.gif
  robot-uprising-m5-card-victory-20260317-143022.png
  robot-uprising-m5-architecture-20260317-142800.png
```

Files save to a dedicated directory: `~/RobotUprising/clips/` (desktop) or the browser's download directory (web). Configurable in Settings → Export → "Clip save location."

### Bundle Size Budget

| Component | Size (minified + gzipped) | Load Strategy |
|-----------|--------------------------|---------------|
| gifenc | ~5KB | Bundled (always available) |
| mp4-muxer | ~15KB | Lazy-loaded on first MP4 export |
| qrcode | ~12KB | Lazy-loaded on first Match Card |
| WebCodecs polyfill | 0KB (native API) | N/A |
| FFmpeg WASM core | ~25MB | Lazy-loaded only when WebCodecs unavailable |
| canvas-record wrapper | ~8KB | Lazy-loaded on first export |
| **Total (typical path)** | **~40KB** | gifenc bundled, rest lazy |
| **Total (worst case)** | **~25MB** | FFmpeg WASM fallback |

The FFmpeg WASM binary is the elephant. On first load, show a one-time download progress bar: "Downloading video encoder (25 MB)... this only happens once." Cache in IndexedDB for subsequent sessions.

---

## Player Journeys

### Journey: Elara, 26, ML Engineer, Dual-Monitor Setup, Linux (Chrome)

**Context:** Mission 6, first factory mission. She just designed a relay mesh that routes scout intelligence through two compression stages before reaching her strikers. The sealed watch ended in victory at tick 53. She's on Ubuntu with Chrome 120+ — full WebCodecs support.

**Minute 0:00 — The Automatic Match Card**
The sealed watch fades. Before the highlight reel appears, a Match Card materializes in the bottom-left corner — a 1:1 square with the Palawan jungle backdrop (deep green canopy, fog tendrils), her five unit icons arranged in a V formation, "MISSION 6 — PALAWAN" in angular type, "53 TICKS • VICTORY" below, a miniature heatmap showing dense green signal paths converging on her relay cluster at E4-E5, and a tiny QR code in the bottom-right corner. The card's composition is automatic — she didn't touch anything.

A small "📋 Copied" toast flashes — the Match Card PNG was auto-copied to her clipboard. She alt-tabs to Discord, pastes into #victories. The card appears instantly — 1080×1080, crisp typography, the circuit-brain watermark barely visible at 12% opacity in the corner. Two people react with 🔥 within 30 seconds.

**Minute 0:15 — The Highlight Export**
Back in the game, three highlight thumbnails are displayed. She hovers over the second one — tick 31, where her dual-compression relay chain fired and three strikers simultaneously pivoted east. The thumbnail micro-animates: three ticks of before/during/after, green dashed lines flashing in cascade. She clicks "Export MP4."

Behind the scenes: her browser has WebCodecs. The ExportManager spawns a Web Worker. The worker re-simulates ticks 28-34 headlessly (skipping T0-T27 in ~50ms), then renders 7 frames at 1920×1080 via OffscreenCanvas + Pixi.js. Each frame passes through `VideoEncoder` with H.264 Baseline at 5 Mbps. The `OfflineAudioContext` renders the audio for those 7 ticks — three kulintang strikes (one per signal hop) and a resonant boom on the triple-pivot. Audio and video chunks interleave in `mp4-muxer`. Total time: 380ms.

A progress ring appears — barely enough time to notice it filling. A ascending two-note chime (C5→E5). Toast: "Clip saved — ticks 28-34, 7s MP4, 1.2 MB." She clicks "Open" — the system file manager highlights the file in `~/RobotUprising/clips/`. She drags it into a tweet draft. Caption: "My relay mesh designed a flanking maneuver I didn't program."

**Minute 0:45 — The Architecture Screenshot**
Before closing the Plan screen, she presses F12. The workbench chrome fades — panels slide away over 300ms, background dims to charcoal. What remains: the 8×8 board with ghost unit positions, five colored subway-map channel lines converging on the relay cluster, perception radius highlights on the scouts as translucent cyan hexagonal overlaps, and signal particle dots flowing along channel lines at half speed. The circuit-brain watermark sits at 12% opacity. The whole image looks like a technical diagram from a Nature paper on multi-agent systems.

She presses Ctrl+C. The architecture screenshot lands on her clipboard as a PNG. She pastes it into her lab's Slack channel: "This is basically a RAG pipeline. Scouts are retrievers, relays are augmentation layers, strikers are generators." Her advisor replies: "Can you send me the replay link so I can step through it?" She copies the replay code from the Inspector: `RU-M6-v1-7d2a?t=28&end=34`. Her advisor loads it in his browser, scrubs through the tick range, and uses the Inspector to trace the signal compression.

**What she's thinking:** "I exported three artifacts — card, clip, screenshot — in under a minute, without leaving the game or opening any external software. The clip is higher quality than if I'd used OBS because it's re-rendered at full resolution from game state."

**UI Annotations:**
- Match Card auto-copy: Clipboard API `navigator.clipboard.write([new ClipboardItem({'image/png': cardBlob})])` — triggers on match end, no player action
- Export progress ring: 32px diameter, cyan stroke, clockwise fill, ~380ms total for WebCodecs MP4
- Architecture screenshot (F12): strips UI, dims BG, renders channel wiring + ghost units + perception radii + signal particles + watermark
- Replay link: 40-character alphanumeric with tick parameters, copyable text field + QR code

---

### Journey: Tomás, 14, First-Timer, Budget Android Phone → PC After School

**Context:** Mission 3, learning hooks. He's playing on his family's shared Windows 10 desktop with Firefox 130. Firefox supports WebCodecs on desktop but the machine is a 2018-era Celeron with 4GB RAM. He just failed — his scout's buffer overloaded at tick 11 and was eliminated while stunned at tick 12.

**Minute 0:00 — The Defeat Card**
The Match Card auto-generates: Ifugao rice terrace backdrop desaturated to grey-green, his scout icon with a red X overlay, "MISSION 3 — IFUGAO / 12 TICKS / DEFEATED" in muted text. The heatmap is almost entirely amber — overload dominated. The card copies to clipboard automatically.

He doesn't share it. He's embarrassed. But then he notices the highlight reel shows two moments: tick 11 (buffer bar going red) and tick 12 (scout eliminated while stunned). He taps tick 11.

**Minute 0:15 — The Help-Seeking Export**
He wants to ask for help on Discord, but he's never used screen recording software. He sees two export options: "Export GIF" and "Copy Replay Link." He taps "Copy Replay Link." The text `RU-M3-v1-a3f1` appears in a copyable field. He Ctrl+C's it and pastes it in the game's Discord #help channel: "what did i do wrong? RU-M3-v1-a3f1"

Behind the scenes: no encoding happened. The replay link is just a serialized string — seed, config hash, tick range. Zero computational cost, zero bandwidth.

Five minutes later, a veteran loads his replay in their own browser. They scrub to tick 11, click his scout, see the context window: 6/6 slots full, 3 slots occupied by `ambient-noise` channel messages (stale, low-priority data filling the scout's entire working memory). They reply: "Your scout listens to ambient-noise. Toggle it off in context config — it's filling 3 of your 6 slots every tick." Precise, actionable feedback enabled by deterministic replay sharing.

**Minute 0:30 — The Accidental GIF (Two Weeks Later)**
Mission 7. Tomás has improved dramatically. His command agent dynamically reroutes a striker around a defensive formation. The highlight reel catches it — a 5-second sequence at ticks 34-39 where the channel line blinks, the striker pivots, and the enemy base falls.

He taps "Export GIF." His machine doesn't have fast WebCodecs video encoding, but `gifenc` is pure JavaScript and runs fine. The Web Worker renders 6 frames at 480×270 (auto-downscaled for GIF file size), quantizes colors (256-color palette per frame, dithered), and produces a 1.8MB GIF in 1.2 seconds. The progress ring fills. Toast: "GIF saved — ticks 34-39, 1.8 MB."

He opens TikTok, uploads the GIF as a video. Caption: "my robot outsmarted the other robots 🤖." The looping GIF — channel line blinking, striker pivoting, red combat flash on the base — gets 12,000 views. The circuit-brain watermark is visible in the corner. Three comments ask "what game is this?"

**What he's thinking:** "I didn't know how to record my screen. I didn't need to. The game just... gave me the clip."

**UI Annotations:**
- Replay link: zero-cost export, no encoding, ~30 characters, universally shareable as text
- GIF export on low-end hardware: auto-downscale to 480×270, gifenc in Worker, ~1.2s for 6 frames
- File size awareness: GIF option shows estimated size (1.8 MB) before export; MP4 shows smaller estimate but notes "(better quality, needs download)"
- Watermark on GIF: same 12% opacity logo, scaled to 24×24px at 480p resolution

---

### Journey: Kwame, 32, Twitch Streamer, 2,400 Followers, Factorio/Zachtronics Veteran, MacOS (Safari)

**Context:** Mission 9, deep campaign. Streaming on OBS. His architecture is a 6-unit relay mesh with a Command agent. He just executed and the sealed watch was extraordinary — a 4-hop signal chain triggered a triple-pincer attack at tick 47. Chat is losing it. He needs to export this NOW, while the energy is live.

**Minute 0:00 — The Split-Second Decision**
Three highlight thumbnails appear. The first is the triple-pincer at tick 47 — three red combat flashes in a single frame, channel lines converging from three directions. Gold border. System's top pick. He taps it.

Two options: "Export MP4 (with audio)" and "Export GIF (no audio)." For Twitter, he needs MP4 with the kulintang soundtrack. He taps MP4.

Behind the scenes: Safari 26+ has full WebCodecs support. The Worker spawns, re-simulates to tick 44 (headless, 200ms), renders ticks 44-50 at 1920×1080 (7 frames), encodes H.264 at 8 Mbps (Safari's hardware encoder is fast), muxes audio (three ascending gong strikes + the deep boom of three simultaneous combat events + the base-breach chord). Total render: 450ms.

The progress ring fills. Chime plays. He clicks "Share" — macOS share sheet appears (Messages, AirDrop, Twitter, Mail). He shares directly to Twitter without leaving the game. The clip uploads. He reads the tweet on stream: "My AI designed a triple-pincer I never programmed. Game: Robot Uprising." Chat: "CLIP IT 🔥"

**Minute 0:30 — The Director's Cut Setup**
For YouTube, he wants more control. He enters the Inspector, opens Director's Cut (Ctrl+D). Selects ticks 40-55 (wider range, showing the setup before the pincer). Camera: "Unit Follow: COMMAND-A" to show the reroute orders being issued. Overlay: decision trace ON, channel lines ON, buffer bars ON. Platform preset: "YouTube 16:9." Audio: full mix. Watermark: on.

He taps "Export." This is a longer clip — 16 frames. The Worker renders at 1920×1080. WebCodecs encodes 16 video frames + audio. Total: 800ms. The file saves as `robot-uprising-m9-t40-t55-victory-20260317-214523.mp4` — 3.2 MB. He'll add it to his YouTube compilation later.

**Minute 1:00 — The Raw Frames Option**
For his thumbnail artist, he wants a single high-resolution frame of the triple-pincer moment. He right-clicks tick 47 in the Inspector → "Export Frame as PNG." The frame renders at 3840×2160 (4K, regardless of his monitor resolution) — the 8×8 board fills the center, three red combat flashes frozen mid-animation, channel lines glowing, the circuit-brain watermark at 12% opacity. The PNG is 2.1 MB, crisp enough for a YouTube thumbnail after cropping.

**What he's thinking:** "I got a Twitter clip, a YouTube clip, and a thumbnail frame — all in 90 seconds, all higher quality than OBS because they're re-rendered from game state at target resolution. The audio was perfect because it's regenerated from the audio engine, not captured from my speakers."

**UI Annotations:**
- Safari WebCodecs: full support from Safari 26+, H.264 hardware encoder
- macOS share sheet: native integration via Web Share API
- Director's Cut: expanded export with camera controls, overlay toggles, platform presets
- 4K frame export: right-click tick → "Export Frame as PNG" → renders at 3840×2160 regardless of monitor
- Audio regeneration: OfflineAudioContext re-synthesizes all tick audio events for the selected range

---

### Journey: Dr. Santos, 52, CS Professor, UP Diliman, Classroom Deployment

**Context:** Using Robot Uprising as a teaching tool for her CS 180 (Artificial Intelligence) class. She needs to export clips for lecture slides showing specific agent behaviors. She's on the university's standardized environment: Ubuntu 22.04, Firefox ESR (older version, no WebCodecs).

**Minute 0:00 — The Fallback Path**
She opens Mission 4 in the web demo, configures a specific hook topology to demonstrate cascading behavior, and executes. After the sealed watch, she clicks "Export MP4" on the cascade highlight.

Behind the scenes: Firefox ESR doesn't support WebCodecs. The ExportManager detects this and checks for `SharedArrayBuffer` — it's available (the university's Apache server has the correct COOP/COEP headers). The FFmpeg WASM binary needs to download. A progress bar appears: "Downloading video encoder (25 MB)... this only happens once." It takes 8 seconds on the university's 100 Mbps connection. The binary caches in IndexedDB.

Now the clip renders: the Worker re-simulates and renders 10 frames, passes them to FFmpeg WASM for H.264 encoding. Total: 4.5 seconds (10× slower than WebCodecs, but still acceptable). Toast: "Clip saved — ticks 18-28, 2.1 MB."

She drags the clip into her PowerPoint slide. It plays inline. The students see the signal cascade in context — not a screenshot with arrows, but the actual game playing back the actual behavior.

**Minute 1:00 — The Replay Link for Homework**
She posts a replay link on Canvas LMS: "Load `RU-M4-v1-c7e3` in the web demo. Identify the bottleneck in the relay's context window at tick 22. Submit a 100-word analysis."

38 students load the replay simultaneously. Each runs the deterministic simulation in their own browser. No server load — the "no backend" architecture means 38 concurrent replays cost zero infrastructure. Each student scrubs to tick 22 independently, inspects the relay's context window, and discovers the bottleneck: stale data from a filtered channel occupying 4 of 12 buffer slots, leaving insufficient room for time-critical combat signals.

**What she's thinking:** "The replay link is better than a video for teaching because students interact with it. They can click units, read context windows, trace decisions. It's not passive viewing — it's active forensics. And it costs me nothing to distribute."

**UI Annotations:**
- FFmpeg WASM fallback: one-time 25MB download, cached in IndexedDB, ~4.5s per clip encode
- COOP/COEP headers required: server must send `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin` for SharedArrayBuffer
- Replay link for education: zero-bandwidth, zero-server-cost distribution to N students simultaneously
- Graceful degradation messaging: "Downloading video encoder" progress bar is honest and one-time

---

## Interaction Effects

### With Deterministic Tick Engine (Locked)
The foundation of everything. Because every tick is a pure function of the game state, we never screen-capture — we re-render. This means:
- Resolution independence: export at 4K from a 720p laptop
- Perfect frame accuracy: every exported tick is pixel-identical across all viewers
- Audio regeneration: `OfflineAudioContext` re-synthesizes audio from event data
- Replay links: the entire match is a function call, not a recording

### With Sealed Watch Pacing (Locked, 1 second/tick)
At 1 tick per second, a 60-tick match produces 60 frames. This is comically few frames for video encoding — most video pipelines expect 1,800+ frames (30fps × 60s). Implications:
- Encoding is nearly instantaneous (60 frames × 7ms/frame = 420ms total)
- GIF files are small (60 frames at 256 colors ≈ 1-3 MB)
- MP4 files are tiny (60 keyframes at 5 Mbps ≈ 2-5 MB)
- The "encoding..." progress ring should be almost invisible for most clips

**Design decision:** Export at 1 fps (matching tick rate) by default. Offer a "Smooth export" toggle that interpolates between ticks at 10fps or 30fps — adding easing animations for unit movement, signal pulse travel, and buffer bar changes. This produces more "normal-looking" video but requires ~30× more frames to encode.

### With Audio Design (6.02, 6.02d)
The `OfflineAudioContext` approach means clip audio is regenerated from event data, not captured from speakers. This has three consequences:
1. **Perfect isolation:** No desktop notification sounds, no Discord pings, no background music from Spotify
2. **Volume normalization:** Export audio is mixed at a consistent level regardless of the player's system volume
3. **Channel sonic signatures** (6.02d): each channel's procedurally generated audio identity is faithfully reproduced in exports — viewers hear the same pitched tones the player heard

### With Streamer Overlay (6.04d)
The re-render pipeline can apply the Streamer Overlay *at export time* regardless of whether the player used it during gameplay:
- 2px channel lines (vs. 1px default) → survives Twitter/Discord video compression
- 150% buffer bars → legible at mobile phone viewing distances
- White unit outlines → survive lossy encoding artifacts
- Dark charcoal blacks (#1a1a1a vs. #000000) → prevent banding in video compression

A toggle: "Export with Streamer Overlay" should be on by default for social-targeted exports (Highlight Reel, Director's Cut) and off for analytical exports (Inspector clips, Architecture Screenshots).

### With Mobile (6.07)
On mobile, the Web Share API (`navigator.share()`) provides native sharing:
```javascript
await navigator.share({
  files: [new File([clipBlob], 'robot-uprising-clip.mp4', {type: 'video/mp4'})],
  title: 'Robot Uprising — Mission 5',
  text: 'My relay mesh designed a flanking maneuver'
});
```
This opens the OS share sheet — WhatsApp, Instagram Stories, Messages, AirDrop — without saving to the camera roll first. On iOS, this is the only way to share video without the camera roll permission prompt.

**Mobile performance concern:** OffscreenCanvas + WebGL in Workers is supported in Chrome Android and Safari iOS 17+, but low-end devices may struggle. Auto-downscale to 720p for mobile exports. Show "Rendering clip..." with a progress bar rather than a progress ring if the render takes >2 seconds.

### With Web Demo (6.11)
Every replay link is a potential entry point to the web demo. The `?t=` parameter deep-links to a specific tick. If the viewer doesn't have the full game, the replay link opens the web demo in replay-viewer mode — the match plays, the Inspector is available, and a "Get the full game" CTA appears after viewing.

### With Accessibility (6.08)
Exported clips inherit the player's visual settings:
- High-contrast mode → thicker outlines, shape-first design → clips are MORE legible for all viewers
- Colorblind palette → exports use the same palette → colorblind-safe by default
- 200% UI scale → exports at native resolution preserve the larger UI elements

Screen reader users can export Match Cards (static PNG) and replay links (text) via keyboard navigation. The highlight reel is keyboard-navigable: Tab cycles highlights, Enter previews, Shift+Enter exports.

---

## Comparable Games Deep Dive

### Opus Magnum — The Two-Pass GIF Render
Opus Magnum's GIF recorder uses a two-pass system: first pass runs the solution at high speed to reach steady state (all products submitted, all instruction loops aligned), second pass records one clean cycle at normal speed. This produces a perfectly looping GIF. Robot Uprising can't loop (matches have outcomes, not cycles), but the *principle* — don't screen-capture, re-render from state — is directly applicable. The key insight from Barth: "Instead of an elevator pitch for Opus Magnum, I would say just look at the gifs." The GIF export wasn't a feature. It was the marketing strategy.

### Halo 3 Theater Mode — The Content Creator's Toolkit
Theater Mode gave players detachable camera control, bookmarks, and clip saving. It launched machinima as a genre. Key technical lesson: Halo 3 stored match data as input logs (player inputs per tick), not video. The engine replayed the inputs to regenerate the match. Robot Uprising's deterministic tick engine does the same thing more cleanly — the match is a pure function of (seed, config), not a sequence of player inputs. This means replays are *even more compact* than Halo 3's.

### Steam Game Recording (2024-2025)
Valve's built-in game recording marks key events on a timeline via developer API. Robot Uprising should integrate with this: fire Steam Timeline markers for kills, overloads, reroutes, and base damage. This gives players Steam-native clip creation *in addition to* the game's built-in tools. The Steam Game Recording API is additive — it captures the screen, while the game's built-in tools re-render from state.

### Balatro — The Screenshot Economy
Balatro's viral Reddit presence was driven by score screenshots, not video clips. The end-of-run screen was *designed* to be screenshot-worthy: large numbers, clear typography, recognizable visual grammar. Robot Uprising's Match Card applies this lesson explicitly — the card is designed for sharing, not just for the player's records.

### canvas-record (dmnsgn) — The Technical Reference
The `canvas-record` library demonstrates the state-of-the-art for browser-based canvas recording: WebCodecs primary (5-10× faster than FFmpeg WASM), fallback to FFmpeg WASM, supports MP4/WebM/MKV/MOV/GIF/PNG sequence. Robot Uprising's pipeline architecture closely mirrors this cascade, adapted for tick-based deterministic replay rather than real-time capture.

---

## Sensory Description: The Export Moment

**The progress ring.** When the player taps "Export MP4," a 32px circle appears at the bottom-right of the screen. Its stroke is thin — 2px — and starts as cool cyan (#00D4FF). As encoding progresses, the stroke sweeps clockwise. For a typical 7-frame clip on a WebCodecs-capable machine, the sweep completes in under a second — fast enough that it feels like a loading indicator that was barely necessary. At completion, the stroke shifts to warm gold (#FFD700) and a soft two-note ascending chime plays (C5 → E5, each note 150ms, sine wave with 200ms exponential decay). The circle holds for 300ms, then morphs into a small checkmark that fades over 1 second.

**The toast notification.** Slides up from the bottom edge — a rounded rectangle with dark charcoal background (#1a1a2e) and a thin cyan left border. Inside: the game's film-reel icon (16px, cyan), the text "Clip saved — Mission 5, ticks 19-26" in the game's monospace font (12px, white), and two pill buttons: "Open" (cyan outline) and "Share" (filled cyan). The toast slides up over 200ms (ease-out), holds for 5 seconds, then slides down over 300ms. If the player hovers, the auto-dismiss pauses.

**The Match Card materialization.** After the sealed watch ends, the card doesn't just appear — it assembles. First, the terrain backdrop fades in at 30% brightness (200ms). Then the unit icons drop in from above, one by one, with subtle bounce easing (each icon 100ms apart). The mission title types itself letter by letter (60ms per character, game font, angular). The heatmap overlay blooms outward from the center of the board (radial gradient, 400ms). The QR code pixelates in from static noise (150ms). The watermark fades in last (200ms, 12% opacity). Total assembly: ~1.2 seconds. This animation only plays once per match — on subsequent views (from the Inspector), the card appears instantly.

**The FFmpeg WASM download.** On first encounter (browsers without WebCodecs), a wider progress bar replaces the small ring: 240px wide, centered at bottom of screen, dark background with cyan fill. Above the bar: "Downloading video encoder (25 MB)... this only happens once" in 11px text. The bar fills based on actual download progress. When complete, the bar morphs into the normal circular progress ring and encoding begins. A one-time cost, amortized forever.

---

## The TikTok Clip Test

**The instant export:** A player taps one button. 0.8 seconds later, a clip exists. The TikTok caption: "This game exports highlights faster than I can blink." The flex isn't the gameplay — it's the *tool*. Content creators notice when a game respects their workflow.

**The architecture screenshot as tech art:** An isometric grid with five colored signal lines converging on a central relay, signal particles flowing along the lines like data through a network, the whole image rendered in circuit-diagram clarity against charcoal. Caption: "This is an AI attention system. I designed it in a game. It works." The image is indistinguishable from a technical visualization you'd see in a machine learning paper — except it's a game screenshot.

**The replay link reveal:** A veteran loads a newbie's replay link, scrubs to the critical tick, clicks the struggling scout, and the context window reveals: 3 of 6 slots filled with useless ambient noise. The moment of diagnosis. Caption: "Found the bug in someone else's robot brain in 10 seconds." The clip teaches viewers that this game has *depth* — the Inspector isn't a scoreboard, it's a debugger.

---

## New Aspects Discovered

- **6.05f — Smooth interpolation export mode:** Design of the "Smooth Export" toggle that interpolates between ticks at 10/30fps — easing curves for unit movement, signal pulse travel animation, buffer bar transitions. Turns 60-frame clips into 600-1800-frame clips. When to default on vs. off. Performance impact on low-end export.
- **6.05g — Steam Game Recording API integration:** Technical specification for firing Steam Timeline markers from the tick engine — which events trigger markers, marker categories, icon design, interaction with Steam's clip creation overlay, and how Steam-native clips compare to in-game exports.
