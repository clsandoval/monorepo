# Angkin UI Treatment Deck — Reverse Loop

You are running in `--print` mode. You MUST output text describing what you are doing. If you only make tool calls without outputting text, your output is lost and the loop operator cannot see progress. Always:
1. Start by printing which aspect you detected and what you're about to do
2. Print progress as you work
3. End with a summary of what you did and whether you committed

## REQUIRED: Use the frontend-design Skill

**You MUST invoke the `frontend-design` skill before generating any visual artifact.** This is non-negotiable. Every HTML mockup, every component example, every layout — invoke `/frontend-design` first. The skill provides design principles that prevent generic AI aesthetics. Without it, your output will look like every other AI-generated UI.

## Your Working Directory

You are running from `loops/angkin-ui-treatment-reverse/`. All paths below are relative to this directory.

## Your Goal

Produce a **comprehensive, polished UI treatment deck** as an HTML document at `output/ui-treatment-deck.html` for **Angkin** — a unified platform of 148 Philippine compliance calculator tools at angkin.ph.

The deck is a visual reference document that defines how every surface of the Angkin platform looks and feels. It is anchored on the **selected brand mark**: the 2C Radical Clarity logo — a circle with diagonal slash forming a negative-space 'A', deep navy (#1E3A5F) on white.

**The logo reference image** is at `docs/brand/angkin/direction-02c-radical-clarity.png` (relative to repo root). When generating images with gemini-image-gen, ALWAYS use the `-r` flag to reference this logo so it appears consistently in mockups.

### What the Deck Must Cover

The treatment deck is a single long-scroll HTML page with these sections:

1. **Brand Mark** — The logo in all contexts: light bg, dark bg, colored bg, small (favicon), medium (nav), large (hero). Minimum clear space rules. What NOT to do.
2. **Color System** — Primary navy (#1E3A5F), extended palette (tints, shades, semantic colors for success/warning/error/info), neutral scale, accent color selection. Dark mode palette.
3. **Typography** — Font stack selection (with rationale), type scale (hero → caption), weight usage, monospace for numbers/amounts. Pair headings + body fonts.
4. **Spacing & Layout** — Base unit, spacing scale, page max-width, grid system, card padding, section spacing. Mobile vs desktop.
5. **Component Library** — Buttons (primary/secondary/ghost/danger), inputs, cards, badges, tooltips, modals, navigation, progress bars, tabs. All states (default/hover/focus/disabled/active).
6. **Data Display** — How computation results look: large peso amounts, comparison tables, pie/bar charts, per-item breakdowns, regime/heir cards. The "result card moment."
7. **Sub-Tool Branding** — How TaxKlaro, Inheritance, Retirement Pay, etc. are branded within the Angkin system. Tool icons, tool-specific accent colors (if any), "by Angkin" badge treatment.
8. **Navigation & Layout Patterns** — Top nav, sidebar, breadcrumbs, mobile hamburger, wizard progress, footer. How tools are accessed from the platform home.
9. **Iconography** — Icon style (line/filled/duotone), icon library choice, custom icons for tool categories, consistent stroke weight.
10. **Dark Mode** — Full dark mode treatment: backgrounds, text, cards, borders, how the logo inverts, how charts adapt.
11. **Mobile Treatment** — Touch targets, mobile nav, card stacking, wizard on mobile, results on mobile. 375px viewport examples.
12. **Example Screens** — Full-page mockups: Angkin home, TaxKlaro landing, TaxKlaro results, Inheritance wizard, a generic "new tool" template.

### Generating Visual Assets

Use `gemini-image-gen` to generate mockup images for each section. The command:

```bash
python3 /home/clsandoval/cs/monorepo/.claude/skills/gemini-image-gen/scripts/generate.py "<prompt>" -r /home/clsandoval/cs/monorepo/docs/brand/angkin/direction-02c-radical-clarity.png -o raw/<filename>.png
```

**ALWAYS use the `-r` flag** with the logo reference. This ensures the actual brand mark appears in generated mockups, not an AI approximation.

**Image naming**: `raw/section-{number}-{descriptor}.png` (e.g., `raw/section-01-logo-light-bg.png`)

### Building the Deck

The output deck at `output/ui-treatment-deck.html` is a self-contained HTML file that:
- References images from `../raw/`
- Uses inline CSS (no external dependencies)
- Is designed to be viewed at 1280px+ (it's a design reference, not a responsive app)
- Has a table of contents with anchor links
- Each section has a clear heading, description, and visual examples
- Code snippets showing CSS variables, token values, etc.

**You MUST use the frontend-design skill** when building or updating this HTML file. Invoke it before any HTML writing.

## Existing Context

- **Converged design system loop**: `loops/angkin-design-system-reverse/` — explored 10 design system options. The "Warm Stripe" hybrid was recommended but the user selected 2C Radical Clarity instead. Read the analysis files for useful context (benchmarks, audience research, tool archetypes).
- **Existing apps**: `apps/taxklaro/` (React 19 + Tailwind 4 + Rust WASM) and `apps/inheritance/` (same stack). Read their CSS/theme files for current design tokens.
- **Logo**: `docs/brand/angkin/direction-02c-radical-clarity.png`
- **UI mockups from brainstorm**: `docs/brand/angkin/ui-*.png` — initial mockups generated during the brand identity brainstorm.

## What To Do This Iteration

1. **Read the frontier**: Open `frontier/aspects.md`
2. **Find the first unchecked `- [ ]` aspect** in wave order
   - If a later-wave aspect depends on earlier work, skip to an earlier aspect
   - If ALL aspects are checked: proceed to convergence check
3. **Invoke the frontend-design skill** before generating any visual content
4. **Analyze that ONE aspect**:
   - For image generation aspects: use gemini-image-gen with `-r` flag
   - For HTML construction aspects: build/update `output/ui-treatment-deck.html`
   - For research aspects: read existing code/docs and write analysis
5. **Write findings** to `analysis/{aspect-name}.md`
6. **Update the frontier**:
   - Mark the aspect as `- [x]`
   - Update Statistics
   - Add discovered aspects if any
   - Add row to `frontier/analysis-log.md`
7. **Commit**: `git add -A && git commit -m "loop(angkin-ui-treatment-reverse): {aspect-name}"`
8. **Exit**

### Convergence Check

When all aspects are `- [x]`:

1. Open `output/ui-treatment-deck.html` in Playwright browser
2. Take a full-page screenshot — verify it looks polished, not broken
3. Verify all 12 sections are present and populated
4. Verify all images load (no broken img tags)
5. Verify the actual 2C logo appears in mockups (not AI approximations)
6. If ANY check fails: add new aspects, commit, exit
7. If ALL pass: write `status/converged.txt`, commit, exit

## Rules

- Do ONE aspect per run, then exit
- **ALWAYS invoke the frontend-design skill before any visual/HTML work** — this is mandatory
- **ALWAYS use `-r` flag with logo reference** when generating images
- Be opinionated. This is a design deck, not a buffet of options. Make clear choices.
- Show, don't tell. Every design decision should have a visual example.
- The deck should look beautiful itself — it IS a design artifact
- No placeholder images. Every image must be generated with gemini-image-gen.
- No "TBD" or "coming soon" sections. If an aspect is in the frontier, it gets done.
- Cross-reference existing app code (TaxKlaro, Inheritance) for realistic examples
