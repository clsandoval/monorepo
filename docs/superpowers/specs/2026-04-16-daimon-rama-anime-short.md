# DAIMON: Rama — 60s Anime Short Film Spec

## Logline

A small blue creature drifts through open space, discovers a colossal alien structure, enters it, and journeys deeper until it reaches the heart — where it stops, stares, and the film ends in silence.

## Tone & References

- **Rendezvous with Rama** (Arthur C. Clarke) — pure encounter, no conflict, no antagonist, no resolution. The structure is indifferent. The creature is tiny. Wonder is the only emotion.
- **Interstellar** — cosmic scale, time-bending geometry, emotional weight through visual contrast
- No departure. The creature goes deeper and never comes back. The story ends at the heart.

## Visual Language

### Creature

- Flat 2D cel-shaded anime, bold ink outlines, pink cheeks, cloud-like protrusions, big round eyes, small fang, stubby arms
- Translated from clay/fondant reference image — proportions and features carry over, texture does not
- Warm palette: soft blue body, pink cheek accents
- **Must be consistent across all clips** — passed as `reference_images` to every prediction

### Structures (Daimon Aesthetic)

- Dark-tech alien architecture: navy/black surfaces, cyan glowing glyphs, data streams, vast geometry
- Hard, angular, cold — contrast against the soft round creature
- The structures are indifferent. Glyphs cycle and pulse on their own schedule. Nothing reacts to the creature.
- Visual DNA pulled from Daimon product UI: dark panels, cyan/teal accents, data-forward aesthetic

### Style Anchor

`2D anime, bold ink outlines, cel-shaded, watercolor wash backgrounds, volumetric cyan lighting`

### Contrast Principle

Every frame is built on the tension between:
- Soft, round, warm (creature) vs hard, angular, cold (structure)
- Tiny vs incomprehensibly vast
- Alive vs indifferent

### Camera Language

Dynamic anime perspectives throughout:
- Low angles looking up at structures
- Fast push-ins on creature reactions
- Dramatic wide reveals for scale
- Very few locked-off static shots

## Shot List — 5 Clips (~60s)

### Clip 1 — APPROACH (10s, [Cut to:] x2)

**Shot A:** Wide — endless starfield, the creature floats alone, tiny. Slow dolly pull-back to establish isolation.

**Cut to Shot B:** Over-the-creature's-shoulder, a massive dark shape eclipses the stars ahead. Low-angle tilt up revealing scale. The creature's silhouette against incomprehensible geometry.

### Clip 2 — SURFACE (10s, [Cut to:] x2)

**Shot A:** Extreme wide — the creature approaches the exterior surface. Dark navy panels stretch in every direction, faintly etched with cyan glyphs. The creature is a speck.

**Cut to Shot B:** Close-up on the creature's face. Eyes wide. Pink cheeks. Mouth slightly open. The cyan glow of the structure reflects in its eyes. Fast push-in.

### Clip 3 — INTERIOR (15s, [Cut to:] x3)

**Shot A:** The creature enters through a gap in the structure. Dynamic low-angle looking up — vast cylindrical interior, data rivers flowing along the walls, floating geometric shapes.

**Cut to Shot B:** Tracking shot following the creature as it floats through. Glyphs pulse on surfaces as it passes — not reacting to it, just cycling. The structure doesn't care.

**Cut to Shot C:** Wide overhead shot looking down. The creature is a dot in a cathedral of dark geometry and cyan light threads.

### Clip 4 — EXPLORATION (15s, [Cut to:] x3)

**Shot A:** The creature passes through a chamber of floating monoliths — dark slabs suspended in formation, each etched with different glyph patterns. Slow orbit camera around the creature.

**Cut to Shot B:** A vast data waterfall — cyan light pouring from above into a dark abyss below. The creature stops at the edge, looks down. Crane shot tilting down into the void.

**Cut to Shot C:** Close-up, the creature reaches out a stubby arm toward a floating glyph. The glyph drifts away indifferently. The creature tilts its head.

### Clip 5 — HEART (10s, single shot)

One unbroken shot. The creature enters the final chamber. Slow dolly forward. The heart of the structure — a massive sphere of layered dark geometry and pulsing cyan light, suspended in the center of an impossibly large void. The creature drifts to a stop. Stares. Holds. The sphere pulses slowly. The creature is a pixel against it. End.

## Technical Spec

| Parameter | Value |
|---|---|
| Total duration | ~60s (10+10+15+15+10) |
| Resolution | 720p |
| Aspect ratio | 16:9 |
| Model | bytedance/seedance-2.0 (main, never fast) |
| Audio | Generated per-clip, stitched in final |
| Character consistency | reference_images on every prediction |
| Max concurrent predictions | 3 |

## Execution Plan

1. Upload character reference to public URL
2. Upload Daimon UI reference to public URL
3. Fire clips in batches of 3 max: batch 1 (clips 1-3), batch 2 (clips 4-5)
4. Each prediction gets both reference images for consistency
5. Download all clips, stitch with ffmpeg concat
6. Send final to Telegram

## Reference Assets

| Asset | Path | Role |
|---|---|---|
| Character ref (clay monster) | `/tmp/seedance-work/character_ref.jpg` | `reference_images` — creature design |
| Daimon UI ref | `loops/daimon-shadcn-forward/stage83-blog-introducing-daimon-full.png` | `reference_images` — structure aesthetic |
