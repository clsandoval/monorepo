# PyMC Brand Guidelines — Complete Extraction

> Source: https://pymc-brand-deck.netlify.app/
> Extracted: 2026-03-13
> Used by: All frontend pages, component library, design system

---

## 1. Color System

### Primary Palette

| Token Name    | Hex       | Usage                                                                 | Proportion |
|---------------|-----------|-----------------------------------------------------------------------|------------|
| Navy          | `#0C1F40` | Primary text, dark backgrounds, primary dominant color               | 60–70%     |
| White         | `#FFFFFF` | Base page background                                                  | 60–70%     |
| White Soft    | `#F7F7F7` | Soft section backgrounds, card backgrounds on light pages            | 60–70%     |
| Aqua          | `#B4E7DD` | Supporting accent: buttons, underlines, CI stripe, hover states      | 20–30%     |
| Periwinkle    | `#9FAAE2` | Supporting accent: gradients, meta tags, secondary decorations       | 20–30%     |
| Peach Orange  | `#F6AE72` | **DATA VISUALIZATION ONLY** — chart highlights, KPIs, trend indicators | 5–10%   |

### Color Ratio Rule
> "60–70% dominant / 20–30% supporting / 5–10% accent"

### Peach Orange Restriction — STRICT
> Reserved **exclusively** for data visualization accents — chart highlights, KPIs, trend indicators.
> **NEVER use for**: buttons, backgrounds, tags, general UI elements, borders, text.

### Semantic Color Assignments
| Purpose                        | Color              |
|--------------------------------|--------------------|
| Primary button background      | Aqua (`#B4E7DD`)   |
| Primary button text            | Navy (`#0C1F40`)   |
| Secondary button border        | Navy (`#0C1F40`)   |
| Dark bg primary button bg      | Aqua (`#B4E7DD`)   |
| Dark bg secondary button border | White (`#FFFFFF`) |
| Active nav link underline      | Aqua (`#B4E7DD`)   |
| Category tags                  | 20% Aqua           |
| Meta tags                      | 20% Periwinkle     |
| Status tags                    | Solid Aqua         |
| Footer background              | Navy (`#0C1F40`)   |
| Footer text                    | White              |
| Card CI accent stripe — band 1 | 30% Aqua opacity   |
| Card CI accent stripe — band 2 | 35% Periwinkle opacity |
| Card CI accent stripe — band 3 | 60% Aqua opacity   |

---

## 2. Typography

### Font Families

| Role           | Font         | Fallback  | Notes                                    |
|----------------|--------------|-----------|------------------------------------------|
| Headlines / Display | Archivo (variable) | sans-serif | Uses `wdth` axis: 62.5–125 range |
| Body / UI      | Inter        | sans-serif | All paragraph, label, nav, button text  |
| Serif Accent   | Lora         | Georgia   | Decorative accent use only              |

### Archivo `wdth` Axis Usage
| Variant              | `wdth` value | Usage                   |
|----------------------|-------------|-------------------------|
| Archivo Expanded     | 125         | Display, H1 — hero headings |
| Archivo Semi-Expanded| 112.5       | H2, H3 — subheadings    |
| Archivo Normal       | 100         | **NOT used in brand** — avoid |

### Type Scale

| Level       | Font                        | Size (desktop) | Size (fluid)              | Weight | Line Height | Max Width | Usage                        |
|-------------|-----------------------------|----------------|---------------------------|--------|-------------|-----------|------------------------------|
| Display     | Archivo Expanded (wdth:125) | 56–72px        | —                         | 700    | 1.1         | —         | Homepage hero                |
| H1          | Archivo Expanded (wdth:125) | 40–48px        | `clamp(36px, 5vw, 64px)`  | 700    | 1.1         | —         | Main headlines               |
| H2          | Archivo Semi-Expanded (wdth:112.5) | 28–36px | `clamp(28px, 3.5vw, 44px)` | 500  | 1.15        | —         | Subheadings                  |
| H3          | Archivo Semi-Expanded (wdth:112.5) | 22–26px | `clamp(18px, 2vw, 24px)`  | 400    | 1.3         | —         | Section titles               |
| Body        | Inter                       | 18px           | —                         | 400    | 1.7         | 640px     | Paragraph text               |
| Body Large  | Inter                       | 22px           | —                         | 400    | 1.6         | 720px     | Featured paragraphs          |
| Small Text  | Inter                       | 14px           | —                         | —      | —           | —         | Labels, captions             |
| Tiny Text   | Inter                       | 12px           | —                         | —      | —           | —         | Metadata                     |

### Font Weights Available
- 400 (regular)
- 500 (medium)
- 600 (semibold)
- 700 (bold)

---

## 3. Spacing System

### Page / Section Padding

| Context            | Value                                  |
|--------------------|----------------------------------------|
| Slide / section padding (desktop) | 80px horizontal × 60px vertical |
| Slide / section padding (mobile)  | 60px horizontal × 24px vertical |

### Margin Scale

| Token   | Value |
|---------|-------|
| MT/MB 12 | 12px |
| MT/MB 16 | 16px |
| MT/MB 24 | 24px |
| MT/MB 32 | 32px |
| MT/MB 48 | 48px |
| MT/MB 64 | 64px |

### Grid / Flex Gaps

| Layout         | Gap   |
|----------------|-------|
| Grid 2 columns | 32px  |
| Grid 3 columns | 24px  |
| Grid 4 columns | 20px  |
| Grid 5 columns | 16px  |
| Flex row/col   | 16px  |

---

## 4. Navigation

| Property              | Desktop Value                   | Mobile Value          |
|-----------------------|---------------------------------|-----------------------|
| Height                | 64px                            | 56px                  |
| Horizontal padding    | 32px                            | —                     |
| Background            | White 92% opacity + 12px blur   | Same                  |
| Border radius         | 0                               | 0                     |
| Position              | Sticky, z-index 50              | Sticky, z-index 50    |
| Link gap              | 28px                            | Hidden (hamburger)    |
| Link font             | Inter, 15px, weight 500, navy   | Full-screen overlay   |
| Active link indicator | 2px aqua underline              | —                     |
| Hover                 | Opacity transition              | —                     |
| Logo font             | Archivo, 18px, weight 700       | Same                  |
| Logo icon size        | 28px × 28px                     | Same                  |
| Logo icon gap         | 8px                             | Same                  |
| CTA button height     | 38px                            | 38px                  |
| CTA button font       | 14px                            | 14px                  |
| CTA button padding    | 0 20px                          | 0 20px                |

---

## 5. Buttons

### Button Variants

| Variant                | Background        | Text    | Border               | Hover                                       |
|------------------------|-------------------|---------|----------------------|---------------------------------------------|
| Primary (light bg)     | Aqua (`#B4E7DD`)  | Navy    | 1.5px solid Aqua     | Opacity 0.85                                |
| Secondary (light bg)   | Transparent       | Navy    | 1.5px solid Navy     | Background → Navy, text → White             |
| Ghost (light bg)       | Transparent       | Navy    | None                 | Opacity transition                          |
| Primary (dark bg)      | Aqua (`#B4E7DD`)  | Navy    | —                    | Opacity 0.85                                |
| Secondary (dark bg)    | Transparent       | White   | 1.5px solid White    | Background → White, text → Navy             |

### Button Sizes

| Size     | Height | Padding   | Font size | Weight |
|----------|--------|-----------|-----------|--------|
| Standard | 44px   | 0 28px    | 15px      | 600    |
| Compact  | 38px   | 0 20px    | 14px      | 600    |

### Button Rules
- Border radius: **0** (sharp corners — no rounding ever)
- Border width: 1.5px solid
- Transition: `all 0.2s ease`
- Font family: Inter

---

## 6. Cards

### Base Card Style

| Property      | Value        |
|---------------|--------------|
| Background    | White        |
| Border radius | 0            |
| Box shadow    | None         |
| Hover         | Opacity 0.92 |
| Padding       | 24px         |
| Image ratio   | 16:10        |

### CI Accent Stripe (Left Edge Decoration)
Every content card has a left-edge stripe composed of three overlapping bands:

| Band | Position        | Color            | Opacity |
|------|-----------------|------------------|---------|
| Primary   | top 15%–85%  | Aqua (`#B4E7DD`) | 30%     |
| Secondary | top 35%–65%  | Periwinkle (`#9FAAE2`) | 35% |
| Tertiary  | center       | Aqua (`#B4E7DD`) | 60%     |
| Stripe width | — | — | 6px total |

### Card Types
- **Course card**: Background white, padding 32px, flex space-between center, price in Archivo 32px weight 700
- **Stat card**: Archivo expanded large number, optional tinted gradient background
- **Team card (compact)**: Avatar + name + title + tags
- **Team card (byline)**: Avatar + name + date + read time

---

## 7. Tags & Pills

| Style        | Background        | Text   | Usage             |
|--------------|-------------------|--------|-------------------|
| Category tag | 20% Aqua          | Navy   | Content categories|
| Meta tag     | 20% Periwinkle    | Navy   | Metadata labels   |
| Status tag   | Solid Aqua        | Navy   | Status indicators |

### Tag Specifications
| Property      | Value       |
|---------------|-------------|
| Height        | Auto (flex) |
| Padding       | 4px 14px    |
| Font          | Inter, 13px, weight 500 |
| Border radius | 0           |
| Icon gap      | 6px         |

---

## 8. Gradients & Background Blobs

### Tier System

| Tier   | Use Case                            | Animation | Notes                          |
|--------|-------------------------------------|-----------|--------------------------------|
| Tier 1 | Hero sections, cover images         | Yes       | Animated drift blobs + dots texture overlay at 50% opacity |
| Tier 2 | Section backgrounds, testimonials   | No        | Static gradient blobs, soft color wash |

### Blob Drift Animations (20–30s cycles, keyframe specs)

| Animation Name       | Horizontal Range | Vertical Range | Notes                   |
|----------------------|-----------------|----------------|-------------------------|
| `drift-teal`         | ±200px          | ±100px         | —                       |
| `drift-periwinkle`   | ±150px          | ±100px         | —                       |
| `drift-navy-right`   | ±120px          | ±150px         | translateY -57%         |
| `drift-navy-left`    | ±150px          | ±160px         | —                       |
| `drift-navy-center`  | ±120px          | ±160px         | translateX -50%         |

### Gradient Color Combinations (135deg)
1. Aqua (`#B4E7DD`) + Periwinkle (`#9FAAE2`)
2. Periwinkle (`#9FAAE2`) + Peach (`#F6AE72`)
3. Aqua (`#B4E7DD`) + Teal (derived from Aqua, deeper shade)

### Prism Visual (Decorative Hero Element)
Three overlapping gradient boxes at different rotations:

| Box | Size      | Gradient               | Rotation | Opacity |
|-----|-----------|------------------------|----------|---------|
| 1   | 200×200px | Aqua → Periwinkle      | -5°      | 60%     |
| 2   | 180×180px | Periwinkle → Peach     | +8°      | 60%     |
| 3   | 160×160px | Aqua → Teal            | -2°      | 60%     |

---

## 9. Hero Section

| Property         | Value                                         |
|------------------|-----------------------------------------------|
| Title position   | Bottom of viewport                            |
| CTA position     | Below title                                   |
| Background       | White base + Tier 1 animated blobs + dots texture |
| Dots opacity     | 50%                                           |

---

## 10. Footer

| Property           | Value                               |
|--------------------|-------------------------------------|
| Background         | Navy (`#0C1F40`)                    |
| Padding            | 48px                                |
| Text color         | White                               |
| Grid (desktop)     | 1.5fr 1fr 1fr 1fr 1fr (5 columns) with 32px gap |
| Grid (mobile)      | 1fr 1fr (2 columns)                 |
| Column header font | Inter, 14px, weight 400, uppercase, letter-spacing 0.08em, opacity 45% |
| Link font          | Inter, 14px, white 70% opacity      |
| Link hover         | 100% opacity                        |
| Link line spacing  | 8px between links                   |
| Divider            | 1px solid white 10% opacity, margin 32px top / 16px bottom |

---

## 11. Dividers

| Property      | Value             |
|---------------|-------------------|
| Width         | 48px              |
| Height        | 3px               |
| Color         | Aqua (`#B4E7DD`)  |
| Border radius | 2px               |
| Margin        | 24px vertical     |

---

## 12. Logo System

### Permitted Forms
1. **Full logotype**: Rocket icon + wordmark
2. **Standalone icon**: Rocket mark only

### Color Rules
| Background  | Logo Color              |
|-------------|-------------------------|
| Light bg    | Navy (`#0C1F40`)        |
| Dark bg     | Aqua (`#B4E7DD`)        |
| Aqua bg     | Navy (`#0C1F40`)        |

### Logo Rules
- **Safe zone**: 1x on all sides (x = half the icon width)
- **Minimum size**: 80px width (digital)
- **Border radius**: 0
- **Single flat color only** — no gradients, no multi-color

### Logo Don'ts (strict)
- Never tilt, rotate, or distort
- Never apply gradients or multi-color fills
- Never add drop shadows or outlines
- Never rearrange components
- Never change proportions

---

## 13. Type Specimen Row (UI Pattern)

| Property       | Value                                  |
|----------------|----------------------------------------|
| Padding        | 16px vertical                          |
| Border bottom  | 1px solid navy at 8% opacity           |
| Label width    | 140px                                  |
| Label font     | 12px, uppercase, letter-spacing 0.08em, opacity 40% |

---

## 14. Slide/Section Container

| Property     | Value                                       |
|--------------|---------------------------------------------|
| Min-height   | 100vh                                       |
| Padding      | 80px 60px (desktop) / 60px 24px (mobile)   |
| Display      | Flex column, centered                       |
| Overflow     | Hidden                                      |

### Slide Number
| Property  | Value                                   |
|-----------|-----------------------------------------|
| Position  | Top right (32px from top, 60px from right) |
| Font      | Archivo, 14px, weight 600, opacity 30%, navy |

### Slide Label
| Property       | Value                          |
|----------------|--------------------------------|
| Font           | Inter, 12px, weight 600        |
| Text transform | Uppercase                      |
| Letter spacing | 0.1em                          |
| Opacity        | 50%                            |
| Margin bottom  | 12px                           |

---

## 15. Responsive Breakpoint

**Mobile breakpoint: max-width 900px**

| Component         | Desktop                       | Mobile                              |
|-------------------|-------------------------------|-------------------------------------|
| Section padding   | 80px horizontal × 60px vert  | 60px horizontal × 24px vert        |
| Grids             | Multi-column                  | Single column or 2 columns          |
| Hero padding      | Standard                      | 40px 32px                           |
| Footer            | 5-column grid                 | 2-column grid                       |
| Course cards      | Flex row                      | Flex column, left-aligned           |
| Navigation links  | Inline                        | Hidden, hamburger → full-screen overlay |

---

## 16. Do's & Don'ts Summary

### Logo
| Do                                      | Don't                                          |
|-----------------------------------------|------------------------------------------------|
| Use full logotype or icon alone         | Tilt, rotate, or distort                       |
| Use single flat colors only             | Apply gradients or multi-color fills           |
| Maintain proper safe zones              | Add drop shadows or outlines                   |
| —                                       | Rearrange components or change proportions     |

### Peach Orange
| Do                                        | Don't                                     |
|-------------------------------------------|-------------------------------------------|
| Use for data viz: charts, KPIs, trends    | Use on buttons                            |
| —                                         | Use on backgrounds                        |
| —                                         | Use on tags                               |
| —                                         | Use for any general UI                    |

### Buttons
| Do                                         | Don't                                    |
|--------------------------------------------|------------------------------------------|
| Use aqua for primary buttons               | Change border style from 1.5px           |
| Use navy for secondary borders (light bg)  | Add shadows                              |
| Maintain 0 border radius                   | Alter proportions                        |

### Typography
| Do                                               | Don't                                    |
|--------------------------------------------------|------------------------------------------|
| Use Archivo wdth:125 for H1/Display              | Mix fonts inappropriately                |
| Use Archivo wdth:112.5 for H2/H3                 | Use Archivo at normal wdth:100 in brand  |
| Use Inter for all body/UI text                   | —                                        |

### Cards
| Do                                         | Don't                              |
|--------------------------------------------|------------------------------------|
| Include CI accent stripe on left edge      | Add box shadows                    |
| Use white backgrounds                      | Round corners                      |
| —                                          | Omit the CI stripe                 |

### Animations
| Do                                               | Don't                             |
|--------------------------------------------------|-----------------------------------|
| Apply drift animations to Tier 1 blob sections  | Animate Peach Orange              |
| Respect `prefers-reduced-motion` media query     | Use other easing functions        |

---

## 17. CSS Custom Properties (Recommended Tokens)

Based on the brand guidelines, the following CSS custom properties should be defined:

```css
:root {
  /* Colors */
  --color-navy: #0C1F40;
  --color-white: #FFFFFF;
  --color-white-soft: #F7F7F7;
  --color-aqua: #B4E7DD;
  --color-periwinkle: #9FAAE2;
  --color-peach: #F6AE72; /* DATA VIZ ONLY */

  /* Typography */
  --font-headline: 'Archivo', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-serif-accent: 'Lora', Georgia, serif;

  /* Font sizes */
  --text-display: clamp(56px, 6vw, 72px);
  --text-h1: clamp(36px, 5vw, 64px);
  --text-h2: clamp(28px, 3.5vw, 44px);
  --text-h3: clamp(18px, 2vw, 24px);
  --text-body-large: 22px;
  --text-body: 18px;
  --text-small: 14px;
  --text-tiny: 12px;

  /* Spacing */
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  --space-48: 48px;
  --space-64: 64px;

  /* Nav */
  --nav-height-desktop: 64px;
  --nav-height-mobile: 56px;

  /* Buttons */
  --btn-height-standard: 44px;
  --btn-height-compact: 38px;
  --btn-radius: 0;
  --btn-border-width: 1.5px;
  --btn-transition: all 0.2s ease;

  /* Border radius */
  --radius-none: 0;
  --radius-divider: 2px;
}
```

---

## 18. Tailwind Config Mapping

For Next.js / Tailwind CSS implementation:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: '#0C1F40',
        aqua: '#B4E7DD',
        periwinkle: '#9FAAE2',
        peach: '#F6AE72',  // data viz only
        'white-soft': '#F7F7F7',
      },
      fontFamily: {
        headline: ['Archivo', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      borderRadius: {
        none: '0',
        DEFAULT: '0',  // override default rounded
      },
      height: {
        'nav-desktop': '64px',
        'nav-mobile': '56px',
        'btn-standard': '44px',
        'btn-compact': '38px',
      },
    },
  },
}
```

---

## 19. Daimon-Specific Brand Application Notes

The Daimon SaaS website uses the PyMC brand system with these application decisions:

| Element                     | Brand Application                                               |
|-----------------------------|------------------------------------------------------------------|
| Page backgrounds            | White (`#FFFFFF`) on light pages, Navy (`#0C1F40`) on landing hero dark sections |
| Primary CTA buttons         | Aqua bg, Navy text, 0 border-radius, 44px height, Inter 15px 600 |
| Dashboard cards             | White bg, CI left-edge stripe, 0 border-radius, 24px padding    |
| Status indicators           | Solid Aqua tags (active), 20% Periwinkle (pending), custom for error |
| Landing page hero           | Tier 1 animated blobs on white base                             |
| Section dividers            | 48px × 3px Aqua divider, 24px vertical margin                   |
| Navigation                  | Sticky, white 92% opacity, blur 12px, Aqua active underline     |
| Footer                      | Navy bg, white text, 5-column grid desktop                      |
| Admin panel                 | White Soft (`#F7F7F7`) backgrounds for data-dense views         |
| Charts/metrics              | Aqua primary, Periwinkle secondary, Peach for KPI accents only  |

See [design-system.md](../ui/design-system.md) for the full UI component system built on these guidelines.
