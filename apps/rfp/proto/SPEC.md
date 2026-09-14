# bidkita proto — SPEC.md

The contract for the four page-builders (index.html, brief.html, app.html, notice.html).
Copy the snippets below **verbatim**. All pages live in this directory and link
`style.css` relatively. No frameworks, no webfonts, no external assets.

---

## 1. `<head>` boilerplate (every page)

Replace only the `<title>` text. The 3-line accent script MUST come before the
stylesheet link so the accent is set before first paint.

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>bidkita — PAGE TITLE HERE</title>
<script>
  var a = localStorage.getItem('accent');
  if (a) document.documentElement.dataset.accent = a;
</script>
<link rel="stylesheet" href="style.css">
```

## 2. Accent toggle (markup + JS)

The toggle markup is identical everywhere. Place it in `.topnav-right`
(marketing pages) or `.rail-foot` (app pages).

```html
<div class="accent-toggle" aria-label="Accent colour">
  <button class="swatch swatch-r" data-accent="" title="Signal red">R</button>
  <button class="swatch swatch-b" data-accent="blue" title="Blue">B</button>
</div>
```

The toggle's script goes once per page, just before `</body>`:

```html
<script>
  document.querySelectorAll('.accent-toggle .swatch').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.documentElement.dataset.accent = btn.dataset.accent;
      localStorage.setItem('accent', btn.dataset.accent);
    });
  });
</script>
```

The active swatch's ring is pure CSS (keyed off `html[data-accent]`) — no JS
class toggling needed.

## 3. Marketing top nav (index.html, brief.html) — first child of `<body>`

```html
<nav class="topnav">
  <a class="wordmark" href="index.html">bidkita</a>
  <div class="topnav-links">
    <a href="index.html">Product</a>
    <a href="brief.html">Brief</a>
    <a href="app.html">App</a>
  </div>
  <div class="topnav-right">
    <div class="accent-toggle" aria-label="Accent colour">
      <button class="swatch swatch-r" data-accent="" title="Signal red">R</button>
      <button class="swatch swatch-b" data-accent="blue" title="Blue">B</button>
    </div>
    <a class="btn" href="app.html">Start free</a>
  </div>
</nav>
```

## 4. App left rail (app.html, notice.html) — first child of `<body>`

Page content goes in a sibling `<main class="app-main">…</main>`.
Add `active` to the `.rail-icon` matching the current page.

```html
<aside class="rail">
  <a class="rail-mark" href="index.html">b.</a>
  <nav class="rail-nav">
    <a class="rail-icon" href="app.html" title="Search &amp; board" aria-label="Search and board">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="11" cy="11" r="7"/>
        <line x1="16.5" y1="16.5" x2="21" y2="21"/>
      </svg>
    </a>
    <a class="rail-icon" href="brief.html" title="Brief" aria-label="Brief">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 3h9l4 4v14H6z"/>
        <line x1="9" y1="11" x2="16" y2="11"/>
        <line x1="9" y1="15" x2="16" y2="15"/>
      </svg>
    </a>
    <a class="rail-icon" href="#" title="Settings" aria-label="Settings">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <line x1="4" y1="7" x2="20" y2="7"/>
        <circle cx="9" cy="7" r="2.25" fill="#FCFBF8"/>
        <line x1="4" y1="16" x2="20" y2="16"/>
        <circle cx="15" cy="16" r="2.25" fill="#FCFBF8"/>
      </svg>
    </a>
  </nav>
  <div class="rail-foot">
    <div class="accent-toggle" aria-label="Accent colour">
      <button class="swatch swatch-r" data-accent="" title="Signal red">R</button>
      <button class="swatch swatch-b" data-accent="blue" title="Blue">B</button>
    </div>
  </div>
</aside>
```

## 5. Send button icon (chat panel)

```html
<button class="send" aria-label="Send">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </svg>
</button>
```

## 6. Palette & ration rules (non-negotiable)

- Ground `#FCFBF8` (`--paper`), ink `#16130F` (`--ink`), secondary `#8E8A82`
  (`--grey`), hairlines `#E4E1DB` (`--hairline`).
- ONE accent via `var(--accent)`. Default `#D93025`; `html[data-accent="blue"]`
  switches it to `#1550D8`. **Never hard-code an accent hex** outside the two
  toggle swatches (`.swatch-r`/`.swatch-b`, which always show their own colour).
- Accent budget per screen: the wordmark (`.wordmark` / `.rail-mark`), ONE thin
  rule (`.rule-accent`), and at most one or two small elements — a primary
  `.btn`, the single nearest-deadline `.count.soon`, or a `.selected` row bar.
  Nothing else is ever coloured. No gradients, textures, illustration, or a
  second accent.
- All numerals, ref numbers, peso amounts, and countdowns use the mono stack
  (`.mono`/`.num`/`.ref`/`.count`/`.peso`) with tabular figures.
- Every ref number shown anywhere is a link to `notice.html`:
  `<a class="ref" href="notice.html">2026-08-0141</a>`.

## 7. Class inventory

| Class | Usage |
|---|---|
| `.wrap` | Centered 1120px content column with side padding (marketing pages). |
| `.stack` | Vertical rhythm helper — 16px between children. |
| `.surface` | Large white rounded (14px) content card floating on the ground, subtle shadow. |
| `.hero` | Headline, clamp(40px,6vw,84px), weight 800, -0.03em. |
| `.h2` / `.h3` | Section and card headings, tight tracking. |
| `.label` | 10px uppercase .12em warm-grey micro-label (column headers, kickers). |
| `.lede` | 16px grey intro paragraph, max 52ch. |
| `.muted` | Grey secondary text. |
| `.mono` / `.num` / `.peso` | Monospace tabular figures; `.num` also right-aligns in tables. |
| `.ref` | Monospace ref number link (hairline underline) → notice.html. |
| `.rule-accent` | The ONE thin accent rule per screen (`<hr class="rule-accent">`). |
| `.rule` | Plain hairline `<hr>`. |
| `.topnav` | Marketing top nav bar (hairline bottom rule). |
| `.wordmark` | Lowercase "bidkita" in accent, links to index.html. |
| `.topnav-links` | Grey text links group in the top nav. |
| `.topnav-right` | Right cluster of the top nav (toggle + Start free). |
| `.rail` | Fixed 60px icon-only left rail (app pages). |
| `.rail-mark` | "b." wordmark in accent at rail top, links to index.html. |
| `.rail-nav` | Icon stack inside the rail. |
| `.rail-icon` (+ `.active`) | 36px icon button; `.active` inks the current page's icon. |
| `.rail-foot` | Bottom slot of the rail (holds the accent toggle). |
| `.app-main` | Content region beside the rail (margin-left: 60px). |
| `.data` | Data table: generous rows, hairline rules, grey uppercase `<th>`. |
| `.data .num` | Right-aligned monospace figure cell (use on `th` and `td`). |
| `.data tr.selected` | Selected row — thin accent bar on the left edge (rationed). |
| `.chip` | Pill filter chip (white, hairline border). |
| `.chip-x` | The small × remove button inside a `.chip`. |
| `.count` | Pill countdown chip, mono, grey-outlined ("3d 04h"). |
| `.count.soon` | Nearest-deadline variant — filled accent, white text (max one per screen). |
| `.btn` | Solid accent pill button (primary; rationed). |
| `.btn-ghost` | Hairline-outlined pill button (everything secondary). |
| `.search` | Rounded (8px) white search/text field. |
| `.chat` | Chat panel column (flex, 16px gaps). |
| `.msg.user` | Grey bubble, right-aligned user message. |
| `.msg.assistant` | Plain assistant text block, left-aligned, full width. |
| `.match-card` | Hairline-ruled match result inside an assistant reply (no box). |
| `.match-meta` | Inline row of ref/chips/figures inside a match card. |
| `.chat-form` | Input row: `.chat-input` + `.send`. |
| `.chat-input` | Rounded pill text input. |
| `.send` | 40px circular accent send button (holds the arrow SVG from §5). |
| `.accent-toggle` | R/B toggle wrapper (row in topnav, column in rail). |
| `.swatch` / `.swatch-r` / `.swatch-b` | 22px labelled swatch dots; active one is ringed via CSS. |
| `.brief` | Print-friendly document column, max 880px, white with hairline edge; has print styles. |
