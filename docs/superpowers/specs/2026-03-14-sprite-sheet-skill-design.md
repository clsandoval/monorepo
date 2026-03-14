# Sprite Sheet Skill Design

## Purpose

A workflow guide skill that teaches Claude how to generate consistent sprite sheets using the `gemini-image-gen` skill, then slice them into individual assets. Solves the core problem: individual AI image generation calls drift in style, proportions, and details. The skill encodes lessons learned from hands-on experimentation with Gemini's Nano Banana 2 model.

## Problem Statement

When generating game assets with AI image generation:
1. **Cross-generation drift** — each API call produces slightly different details, proportions, and invented features
2. **AI cannot rotate** — asking for "the same sprite from a different angle" produces a different sprite, not a rotation
3. **State inconsistency** — idle/destroyed/hologram versions of the same entity look like different entities
4. **No built-in memory** — each Gemini call is stateless with no awareness of prior outputs

## Solution: Anchor-First Pipeline

A 3-phase workflow that forces consistency by constraining the generation space.

### Phase 1: Anchor

Generate a single hero sprite — the canonical view (typically front-facing NE, idle state). The user approves or requests re-generation. This approved image becomes the **style anchor** for all subsequent generations.

One anchor per project/art style, not per entity. If generating 5 unit types in the same visual style, only 1 anchor is needed. Subsequent entities reference it for style consistency.

### Phase 2: Master Sheet

One Gemini call per entity. All states and real directions in a single image, using the anchor as a `-r` reference.

Grid layout: **rows = states, columns = directions**. Only 2 real directions are generated (front-facing NE, back-facing SW). Example for 3 states:

```
| idle_ne    | idle_sw    |
| broken_ne  | broken_sw  |
| ghost_ne   | ghost_sw   |
```

The key insight: everything in one image forces the model to maintain consistent proportions, details, and design language across all cells.

### Phase 3: Slice + Flip

Run `slice.py` on the master sheet to:
1. Cut the grid into individual PNGs based on row/col count
2. Generate horizontally flipped variants for the 2 mirrored directions:
   - `idle_ne.png` → flip → `idle_nw.png`
   - `idle_sw.png` → flip → `idle_se.png`

Final output: 4 directions x N states from a single Gemini call.

## Prerequisites

The `gemini-image-gen` SKILL.md must be updated to document the `-r / --reference` flag before this skill ships. The sprite-sheet workflow depends entirely on reference image chaining, which is implemented in `generate.py` but not documented in the gemini-image-gen skill instructions.

## SKILL.md Frontmatter

```yaml
name: sprite-sheet
description: >-
  Generate consistent sprite sheets for games using the Anchor-First Pipeline.
  Produces master sheets with multiple states and directions in a single image,
  then slices into individual sprites with automatic horizontal flipping.
  Use when the user asks to create sprite sheets, game sprites, character animations,
  unit assets, tilesets, or any batch of related images that must be visually consistent.
  Works alongside the gemini-image-gen skill. Triggers on "sprite sheet", "sprite",
  "game assets", "unit sprites", "animation frames", "tileset", "slice sprites".
```

## File Organization

Anchors, master sheets, and sliced output follow a standard layout:

```
<project>/assets/
├── anchor.png                    # Style anchor (one per project)
├── units/
│   ├── scout/
│   │   ├── scout-master.png      # Master sheet (all states x directions)
│   │   ├── idle_ne.png           # Sliced individual sprites
│   │   ├── idle_nw.png           # (flipped from idle_ne)
│   │   ├── idle_sw.png
│   │   ├── idle_se.png           # (flipped from idle_sw)
│   │   ├── broken_ne.png
│   │   └── ...
│   └── striker/
│       ├── striker-master.png
│       └── ...
├── tiles/
│   └── ...
└── ui/
    └── ...
```

The anchor lives at the project's asset root. Master sheets live alongside their sliced output. Claude should ask the user where assets go if no convention exists yet.

## Skill Structure

```
.claude/skills/sprite-sheet/
├── SKILL.md              # Workflow guide (~200 lines)
└── scripts/
    └── slice.py          # Grid slicer + horizontal flipper
```

The skill contains no image generation code. It is a workflow guide that tells Claude how to use the existing `gemini-image-gen` skill correctly for sprite work, then provides `slice.py` for post-processing.

## Prompt Engineering Rules

### Rule 1: Grid description is explicit and structural

Bad: "Show this robot from different angles in different states"

Good: "Generate a sprite sheet. 3 rows, 2 columns. Row 1: idle. Row 2: destroyed. Row 3: hologram. Column 1: front-right (NE). Column 2: back-left (SW)."

### Rule 2: Hammer consistency language

Every master sheet prompt must include: "ALL cells must be the EXACT same entity — same proportions, same chassis, same details. Only the STATE and ANGLE change between cells."

### Rule 3: Describe deltas, not full descriptions

Describe the anchor entity once, then describe only what changes per state:
- Destroyed: "cracked eye, split chassis, sparks, smoke, fallen tilt, dimmed colors"
- Hologram: "semi-transparent blue, scan lines, wireframe quality, ethereal glow"

### Rule 4: Never ask AI to rotate — describe the camera position

Bad: "rotate 90 degrees"

Good: "front-right isometric view showing the eye and front chassis" vs "back-left isometric view showing the rear panel and exhaust"

### Rule 5: Reference image is mandatory after Phase 1

Every Phase 2 call uses `-r anchor.png`. No exceptions.

## Asset Type Decision Tree

Not everything needs the master sheet pipeline. The direction convention (NE/SW + flip to NW/SE) is optimized for isometric views. Side-scrolling sprites would use left/right columns instead; top-down sprites might use N/S/E/W. The flip axis and label suffixes should be adapted to the projection type.

```
Does this asset have directional variants?
  YES → Master sheet pipeline (Phase 2 + 3)
  NO  → Single image with -r anchor

Does this asset have multiple states?
  YES → Include states as rows in the sheet
  NO  → Single image with -r anchor
```

**Full pipeline (sheet + slice):**
- Unit sprites (directional + multiple states)
- Base/factory sprites (directional + states)

**Single image with -r anchor:**
- Icons (flat, no direction)
- Portraits (close-up, no direction)
- Tiles/terrain (symmetric, no rotation)
- Effects/VFX (particles, flashes)
- UI mockups and screen layouts

## slice.py Specification

### Interface

```bash
python3 .claude/skills/sprite-sheet/scripts/slice.py \
  input_sheet.png \
  --rows 3 --cols 2 \
  --labels "idle_ne,idle_sw,broken_ne,broken_sw,ghost_ne,ghost_sw" \
  --flip \
  -o output_dir/
```

### Behavior

1. Read the master sheet PNG
2. Divide evenly into `rows x cols` grid cells
3. Save each cell as `{label}.png` (or `cell_R_C.png` if no labels provided)
4. If `--flip` is set, generate horizontal mirrors with name substitution:
   - `_ne.png` → `_nw.png`
   - `_sw.png` → `_se.png`
   - Cells without `_ne` or `_sw` in their name are skipped for flipping
5. Create output directory if it doesn't exist

### Dependencies

Pillow only. The script checks for it on import and prints `pip install Pillow` if missing. No other dependencies.

### Edge Cases

- Sheet dimensions that don't divide evenly: warn and use floor division (some pixel loss at edges is acceptable for AI-generated content)
- Label count must match `rows x cols` or the script errors with a clear message
- Labels are assigned left-to-right, top-to-bottom (reading order)
- Output preserves the input image's color mode and transparency (RGBA). No scaling or padding applied
