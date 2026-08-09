# UI handoff — bidkita prototype

For whoever takes over the UI. State as of 2026-08-09.

## What's decided

- **Style 11 ("signal") is locked.** The approved artifacts are the images, not a prose
  description: `research/ph-rfp-spike/ui/apply-11-signal-red-landing.png` and
  `apply-11-signal-red-app.png`, plus `brand-11-signal-red.png`. Build to the pixels.
  A prose reinterpretation of "style 11" already produced one wrong screen set (11b, reverted).
- **Red vs blue is NOT decided.** Everything runs off `--accent` in `style.css`
  (`#D93025`, or `#1550D8` when `html[data-accent="blue"]`). The R/B toggle in the chrome
  flips it live and persists via localStorage. Deciding = deleting the toggle and one hex.
- **Six screens is the whole surface** (free, no login — no auth screens exist):
  landing, board+chat, notice detail, brief, profile, preferences/unsubscribe.
  Only the first four are built here. Plus two states that must look deliberate, not broken:
  *widened* (60% of firm archetypes have exactly one open notice) and *no-docs*
  (legacy notices are auth-gated). gpt-image references for all eight: `ui/17-0*.png` (layout
  reference only — palette 17 lost to 11).

## What's here

| file | screen |
|---|---|
| `index.html` | landing — hero, flow field, prompt card, chips |
| `app.html` | board: table dominant, chat docked right |
| `notice.html` | detail: eligibility, bid docs, who-won-similar |
| `brief.html` | the Friday brief as a web page |
| `style.css` | all shared styles + both accent values |
| `SPEC.md` | head boilerplate, nav markup, class inventory — the parity contract |

Nav markup is byte-identical across pages by design (marketing nav on index/brief, icon rail
on app/notice). Keep it that way.

The landing's hero field is a canvas flow field (in `index.html`): 22 sine-warped polylines,
white→accent gradient, ~6s pulse, pointer-repulsion. One rAF loop, paused offscreen and under
`prefers-reduced-motion`, gradient rebuilt only on accent change. 60fps capture exists if you
want to see it without running it.

## Hard content rules (not style — product)

- **No win rates, no predictions, no "firms like you earn X".** Everything shown is a
  published fact (ABC, closing time, award record). One gpt-image mockup invented a 38% win
  rate; that number class ends prospect conversations and is banned (#148).
- **Every ref on any screen links to its PhilGEPS notice** so the reader can verify in one click.
- The brief's record section says "N award records **in our sample**" — never "your history".
- Data Privacy Act line stays on the brief and preferences pages: opt-out honoured on first
  request.

## Data the UI will eventually sit on

`apps/rfp/`: `corpus.db` (22,324 notices, `corpus_state` view for open/expired),
`tags.db` (work_type per notice), `awards.db` (1,580 award records, contacts),
`docs.db` (9,875 bid documents). The board's real query is in `brief.py::match()`.
