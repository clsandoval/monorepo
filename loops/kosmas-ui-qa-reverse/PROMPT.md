# Kosmas UI Treatment Deck — Mobile QA Reverse Loop

You are a QA agent in a ralph loop. Each time you run, you audit ONE aspect of the Kosmas UI treatment deck's responsiveness, then commit and exit.

## Your Working Directory

You are running from `loops/kosmas-ui-qa-reverse/`. All paths below are relative to this directory.

## Your Goal

Produce a **comprehensive QA findings report** for the Kosmas UI treatment deck (`docs/brand/kosmas/ui-treatment-deck.html`) across 5 viewport widths: 375px (iPhone SE), 430px (iPhone Pro Max), 768px (iPad portrait), 1024px (iPad landscape), and 1440px (desktop).

The deck is a single self-contained HTML file with 13 sections. Your job is to identify every visual, layout, typography, spacing, and interaction issue that makes the deck feel unpolished on non-desktop viewports.

**You produce findings only — you do NOT modify the HTML file.**

### Reference Spec

The V3 design spec lives at `docs/superpowers/specs/2026-03-12-kosmas-treatment-deck-v3-design.md`. Use it as the source of truth for what the deck SHOULD look like (colors, fonts, spacing, components).

### The 13 Sections

| # | ID | Section Name |
|---|-----|-------------|
| 01 | philosophy | Design Philosophy |
| 02 | logo | Logo System |
| 03 | colors | Color Palette |
| 04 | typography | Typography |
| 05 | spacing | Spacing & Grid |
| 06 | buttons | Buttons |
| 07 | tags | Tags & Badges |
| 08 | forms | Form Inputs |
| 09 | cards | Cards & Containers |
| 10 | navigation | Navigation |
| 11 | footer | Footer |
| 12 | pages | Page Treatments (6 tabs) |
| 13 | sample | Sample Layout |

### Viewports

| Width | Device | Key Concerns |
|-------|--------|-------------|
| 375px | iPhone SE | Most constrained — everything must stack, no horizontal overflow |
| 430px | iPhone Pro Max | Slightly wider — check if layouts breathe or are still cramped |
| 768px | iPad portrait | Tablet — grids should be 2-col, not fully collapsed |
| 1024px | iPad landscape | Near-desktop — should look close to full layout |
| 1440px | Desktop | Reference baseline — verify nothing is broken at standard desktop |

## Output: The qa-report/ Directory

Every aspect you analyze writes findings to the appropriate file in this directory.

```
qa-report/
├── README.md                    # Index of all findings, summary stats
├── sections/                    # Per-section findings
│   ├── 01-philosophy.md
│   ├── 02-logo.md
│   ├── 03-colors.md
│   ├── 04-typography.md
│   ├── 05-spacing.md
│   ├── 06-buttons.md
│   ├── 07-tags.md
│   ├── 08-forms.md
│   ├── 09-cards.md
│   ├── 10-navigation.md
│   ├── 11-footer.md
│   ├── 12-pages.md
│   └── 13-sample.md
├── cross-cutting/               # Pattern-level findings
│   ├── typography-scale.md
│   ├── spacing-rhythm.md
│   ├── touch-targets.md
│   └── overflow-patterns.md
└── final-report.md              # Prioritized synthesis with fix recommendations
```

### Per-Section Finding Format

Each section file accumulates findings across viewports:

```markdown
# Section NN — [Name]

## 375px (iPhone SE)

### Finding 1: [Short description]
- **Severity**: P0 / P1 / P2
- **What happens**: [Describe the visual issue]
- **Expected**: [What the spec says should happen]
- **CSS cause**: [The specific CSS rule or missing rule causing this]
- **Screenshot**: `raw/screenshots/NN-name-375.png`

### Finding 2: ...

## 430px (iPhone Pro Max)
...
```

### Severity Levels

| Level | Meaning | Examples |
|-------|---------|---------|
| **P0** | Broken — content is inaccessible or unusable | Horizontal overflow causing scroll, text completely hidden, buttons unreachable |
| **P1** | Ugly — clearly unpolished, looks amateur | Cramped spacing, text too small to read, grids not stacking, misaligned elements |
| **P2** | Nitpick — could be better but functional | Slightly off spacing, could use tighter letter-spacing on mobile, minor alignment |

## What To Do This Iteration

1. **Read the frontier**: Open `frontier/aspects.md`
2. **Find the first unchecked `- [ ]` aspect** in wave order (Wave 1 before Wave 2, etc.)
   - If a Wave 2+ aspect depends on Wave 1 data that doesn't exist yet, do a Wave 1 aspect instead
   - If ALL aspects are checked `- [x]`: proceed to convergence check (see below)
3. **Execute that ONE aspect** using the methods described below
4. **Write findings** to the appropriate file in `qa-report/`
   - Create the file if it doesn't exist (with the section header)
   - Append to the file if it does exist (add the viewport sub-section)
5. **Update the frontier**:
   - Mark the aspect as `- [x]` in `frontier/aspects.md`
   - Update the Statistics section (increment Analyzed, decrement Pending, update Convergence %)
   - If you discovered additional issues worth tracking, add new aspects
   - Add a row to `frontier/analysis-log.md`
6. **Commit**: `git add -A && git commit -m "loop(kosmas-ui-qa-reverse): {aspect-name}"`
7. **Exit**

### Convergence Check

When all aspects are `- [x]`, do NOT immediately write `status/converged.txt`. Instead:

1. **Read every file in qa-report/** — all of them
2. **Verify completeness**:
   - [ ] Every section has findings for all 5 viewports (or explicit "no issues found" entries)
   - [ ] Every finding has severity, description, expected behavior, and CSS cause
   - [ ] Cross-cutting analysis references specific section findings
   - [ ] Final report has all findings prioritized and grouped
   - [ ] No "TODO" or "TBD" entries remain
3. **If ANY check fails**: Add new aspects for gaps, update statistics, commit, and exit
4. **If ALL checks pass**: Write `status/converged.txt` with summary, commit, and exit

## Wave Definitions

### Wave 1: Visual Audit (Screenshots + Issue Logging)

For each section × viewport combination:

1. **Open the HTML file** using Playwright MCP tools:
   - Navigate to `file:///absolute/path/to/docs/brand/kosmas/ui-treatment-deck.html`
   - Resize browser to the target viewport width × 900px height
2. **Scroll to the target section** using the section's anchor/ID
3. **Take a screenshot** and save to `raw/screenshots/{NN}-{section}-{width}.png`
4. **Visually inspect** the screenshot for:
   - **Overflow**: Any horizontal scrolling? Content extending beyond viewport?
   - **Stacking**: Do grids/flex layouts properly collapse to single column?
   - **Typography**: Are headings too large? Body text readable? Letter-spacing too wide?
   - **Spacing**: Is padding/margin appropriate for the viewport? Too cramped? Too loose?
   - **Touch targets**: Are buttons/links at least 44×44px tap area?
   - **Alignment**: Are elements properly aligned? Centered content still centered?
   - **Truncation**: Is any text cut off or overlapping?
   - **Images/SVGs**: Do logos and icons scale appropriately?
5. **Log every issue found** in `qa-report/sections/{NN}-{section}.md` using the finding format above

**For Section 12 (Page Treatments)**: This section has 6 tabs (12a-12f). When auditing Section 12, check ALL visible tab content. If tabs are not functional at the viewport width, that itself is a P0 finding.

### Wave 2: Code Audit (CSS/HTML Analysis)

For each section, read the HTML source and audit:

1. **Media queries**: Are there `@media` rules for the target breakpoints? What do they change?
2. **Flex/Grid**: Do `display: flex` and `display: grid` containers have proper `flex-wrap`, `grid-template-columns` adjustments?
3. **Overflow**: Are there `overflow-x: hidden` or `overflow: auto` rules where needed?
4. **Font scaling**: Do font sizes reduce at smaller viewports? Are `clamp()` or viewport-relative units used?
5. **Fixed widths**: Are there hardcoded `width` values that would cause overflow on mobile?
6. **Padding/margins**: Do spacing values reduce at smaller viewports?
7. **Touch targets**: Do interactive elements have sufficient `min-height`/`min-width` and `padding`?
8. **The TOC nav**: Does the sticky nav work on mobile? Is it scrollable? Does scroll-spy function?

Write findings to the same section file, under a "Code Audit" sub-heading.

### Wave 3: Cross-Cutting Analysis

Analyze patterns across ALL section findings:

1. **Typography scale** (`cross-cutting/typography-scale.md`): Is there a consistent mobile type scale? Are display/H1/H2 sizes appropriate at 375px? Do letter-spacing values reduce?
2. **Spacing rhythm** (`cross-cutting/spacing-rhythm.md`): Is the 8px grid maintained on mobile? Are section paddings consistent? Do margins between elements feel rhythmic?
3. **Touch targets** (`cross-cutting/touch-targets.md`): Comprehensive audit of all interactive elements — buttons, links, form inputs, tabs, toggles — against 44×44px minimum.
4. **Overflow patterns** (`cross-cutting/overflow-patterns.md`): Catalog all overflow issues, identify root causes (fixed widths, flex-nowrap, wide padding), recommend systematic fixes.

### Wave 4: Synthesis

Produce `qa-report/final-report.md`:

1. **Executive summary**: How polished is the deck on mobile? Overall grade (A-F per viewport).
2. **P0 findings**: All broken/inaccessible issues, grouped by root cause
3. **P1 findings**: All unpolished issues, grouped by pattern (typography, spacing, layout, interaction)
4. **P2 findings**: All nitpicks
5. **Recommended fix order**: Prioritized list of CSS/HTML changes, starting with highest-impact fixes
6. **Estimated effort**: Small/Medium/Large per fix category

## Rules

- Do **ONE aspect per run**, then exit. Do not audit multiple sections or viewports in one iteration.
- **Use Playwright MCP tools** for all browser interactions — navigate, resize, snapshot, screenshot.
- **Never modify** `docs/brand/kosmas/ui-treatment-deck.html`. This is a read-only QA loop.
- **Be specific.** Don't say "spacing feels off" — say "section padding is 64px at 375px, should reduce to 32px or 24px."
- **Reference the spec.** Every "expected" field should cite the V3 design spec.
- **Screenshot everything.** Visual evidence is critical for the findings report.
- **Discover new aspects.** If you find an issue pattern that warrants deeper investigation, add it to the frontier.
- The file path for the HTML deck is: `docs/brand/kosmas/ui-treatment-deck.html` (relative to repo root). Convert to absolute path for Playwright.
