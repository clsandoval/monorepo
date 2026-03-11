# Kosmas UI Treatment Deck — Design Spec

**Date:** 2026-03-11
**Status:** Approved

## Overview

A living web-based style guide / UI treatment reference for all Kosmas Athletic Ventures Co. websites. Single-page format, developer-facing, with visual treatments and token values.

## Scope

- **Kosmas parent brand only** — venue sub-brands (Helios, PinkPod, Telepark) are out of scope
- **Format:** Single-page scrollable reference site
- **Audience:** Developers building Kosmas websites

## Brand Assets

- **Logo:** `docs/brand/kosmas/kosmas-logo.png` — Angular geometric wordmark + stylized runner icon. Black on white (use `filter: invert(1)` + `mix-blend-mode: screen` on dark backgrounds).
- **Logo Brief:** `docs/brand/kosmas/kosmas-logo-brief.pdf`
- **Logo Ideas:** `docs/brand/kosmas/kosmas-logo-ideas.pdf`

## Color Palette (Palette D)

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | Dark Plum | `#4A1942` | Hero backgrounds, primary buttons, brand sections, emphasis blocks |
| Accent | Soft Gold | `#F0DFA0` | Headlines on dark, CTAs, active nav, hover states, key text |
| Secondary | Periwinkle | `#B8C8E8` | Secondary elements, tags, info states, subtle highlights |
| Foundation | Near Black | `#1E1E1E` | Page background, body text on light, grounding layer |

### Extended Colors

- Plum Light: `#6B2D63`
- Gold Dim: `#C4B580`
- Periwinkle Dim: `#8A9ABB`

### Neutrals

`#111` → `#1E1E1E` → `#252525` → `#333` → `#444` → `#888` → `#BBB` → `#EEE` → `#FAFAFA`

## Typography

**Font:** Rajdhani (Google Fonts) — geometric, angular, sporty

| Element | Size | Weight | Letter-Spacing | Transform |
|---------|------|--------|----------------|-----------|
| H1 | 48px | 700 | 6px | uppercase |
| H2 | 36px | 700 | 4px | uppercase |
| H3 | 24px | 600 | 2px | uppercase |
| H4 | 18px | 600 | 1px | none |
| Body | 16px | 400 | 0.5px | none |
| Caption | 13px | 500 | 2px | uppercase |
| Label | 11px | 700 | 3px | uppercase |

## Spacing & Grid

- **Base unit:** 8px
- **Scale:** 4, 8, 16, 24, 32, 48, 64, 80px (0.5x through 10x)
- **Max content width:** 1080px
- **Container padding:** 32px horizontal

## Buttons

All buttons: Rajdhani 700, 14px, letter-spacing 3px, uppercase, padding 14px 32px, border-radius 4px, border 2px.

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| Primary | `#4A1942` | `#F0DFA0` | `#4A1942` |
| Secondary | transparent | `#F0DFA0` | `#F0DFA0` |
| Ghost | transparent | `#BBB` | `#444` |
| Accent | `#F0DFA0` | `#1E1E1E` | `#F0DFA0` |
| Info | `#B8C8E8` | `#1E1E1E` | `#B8C8E8` |

## Cards & Containers

- Background: `#252525`
- Border: 1px solid `#333`
- Border-radius: 8px
- Hover: border shifts to `#6B2D63`

## Brand Tone

- Premium & confident
- Sporty & athletic
- Bold & distinct
- Elegant without being soft or approachable
- NOT: overly friendly, corporate, generic, or ornate

## Inspirations

- Nike (clean, dynamic, iconic)
- Wilson (strong, athletic, confident)
- Mood board references: Benzy Golf Co., Boostio, CB Training, Somma Social

## Future Scope (Separate Sessions)

Additional sample layouts to be designed:
- CRUD interfaces
- ERP dashboard
- Marketing pages
- Blog layouts
- Schedule / calendar views

## Implementation

The treatment deck is a single HTML file with embedded styles and base64 logo. Draft at:
`.superpowers/brainstorm/79095-1773229010/treatment-deck-draft.html`

Final deliverable location: `docs/brand/kosmas/ui-treatment-deck.html`
