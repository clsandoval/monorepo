# Launch Film — Brief & Direction

Built with the `product-launch-motion` skill. 2026-08-01.

## 1 · Intake

**Product.** A Philippine inheritance and estate-tax computation app for lawyers. Rust
succession engine (Civil Code Book III) compiled to WASM, TypeScript NIRC estate-tax
engine, React front end.

**Audience.** Philippine lawyers. Precise, busy, and specifically afraid of software that
will embarrass them in a filed pleading.

**The product's own headline.** "Estate Distribution Made Simple."

**The ONE claim — and why it is not the headline.** "Simple" is what every calculator
claims, and to this audience it reads as *approximate*. The thing actually visible on the
results screen that no spreadsheet gives them is the **Legal Basis** column: every peso
amount carries the Civil Code article it came from.

> **Claim: every peso traced to its article.**

**Angle.** The maths is exact, the exactness is checkable, and the citation travels with
the number.

## 2 · Direction — three written, two killed

**A · "The Ledger"** — Cream paper ground, navy ink, hairline rules, serif throughout,
paper grain. Locked-off orthographic camera; the only motion is content arriving.
Signature move: each `Art. 996` stamps in beside its row like a rubber stamp with a slight
rotation and ink bleed.
*Killed.* Beautiful but nearly static, and dressing software as paper undersells a
real-time engine. The stamp gag is also the only idea in it.

**C · "Screen as Evidence"** — The real UI floating on a neutral ground, lit like hardware
product photography: raking light, soft contact shadow, a slow 3D turn, zoom into the
`Art. 996` chip.
*Killed as a standalone.* It is the default screenshot-showcase film — exactly the
"slideshow" failure mode — and it argues nothing on its own. Its payoff frame is folded
into B.

**B · "The Split" — CHOSEN.** Near-black navy void. The estate is one luminous gold bar.
It divides into four exact segments that travel to their heir labels, and the four re-sum
at the bottom to prove nothing was lost. The real product screen arrives last, as evidence
rather than as the argument.
*Chosen* because it dramatises the actual claim instead of describing it, and because
conservation — `sum(per_heir) == estate`, exactly — is a real invariant this codebase
spent whole phases enforcing. The film argues something true about the engine.

**Signature move, one sentence.** The estate bar splits into four exact segments and
re-sums to prove nothing was lost.

## 3 · Truth pass — approved figures

Computed by running the real engine against
`engine/examples/cases/02-married-3lc.json`, which is the verbatim `input_json` of the
seeded case in `frontend/supabase/seed.sql`. Verified identical to what the running app
renders (see `shots/05-case.png`).

| Figure | Value |
|---|---|
| Net distributable estate | ₱6,000,000.00 |
| Ana — legitimate child | ₱1,500,000.00 |
| Ben — legitimate child | ₱1,500,000.00 |
| Carlos — legitimate child | ₱1,500,000.00 |
| Rosa — surviving spouse | ₱1,500,000.00 |
| Scenario code | I2 |
| Succession type | Intestate |
| Legal basis, every row | Art. 996 |
| Decedent / date of death | Pedro / 15 Jan 2026 |
| Heirs | 4 |
| Engine warnings | 0 |
| Conservation | sum == estate, exactly |

**No other numeral may appear on screen.** In particular: no adoption counts, no user
counts, no time-saved claims, no accuracy percentage. None of those are sourced.

## 4 · Look

Law 8, rationed: two grounds, one accent.

- Ground 1 (argument): `#0b1420` near-black navy
- Ground 2 (product): `#f8fafc`, the app's own surface, for the evidence frame
- Accent: `#c5a44e`, the product's gold — used on dark only. The aesthetics review found
  this gold fails contrast as text on light; on near-black it is correct and strong.
- Type: Lora for claim lines, Inter `tabular-nums` for every peso figure, matching the app.

## 5 · Declared departures from the skill

Stated plainly rather than shipped quietly, per the skill's definition of done.

1. **No voiceover.** This machine has no TTS — `say`, `espeak`, `piper` and `flite` are all
   absent, and no cloud TTS credential was authorised. The film is therefore a VO-less
   kinetic cut. Law 2 (word-locked sync) has nothing to sync against and is vacuous here;
   beat durations are directed rather than measured from a VO file, which is a real loss of
   rigour and the first thing to fix if a voice becomes available.
2. **Renderer.** HyperFrames was not resolvable in this environment. The film uses a
   deterministic seek-based harness built here: GSAP timeline paused, `seek(t)` per frame,
   Playwright screenshot, ffmpeg encode. This satisfies Law 3 by construction — no
   `Math.random`, no `Date.now`, no CSS transitions, no `repeat`/`yoyo`; frame N is a pure
   function of N.
3. **No music bed or SFX.** No licensed audio is available in this environment, and
   unsourced audio would violate the same honesty rule as unsourced figures. The delivered
   file is silent. Law 6's arithmetic is therefore untested, and the loudness target in the
   definition of done is not applicable.
4. **Deliverable set is the master only** — no vertical cut, captions or poster yet.

## 6 · What I would fix next

Get a voice on it. The claim lands harder spoken than typed, and word-locked timing is
the single biggest quality jump available. Then a music bed, then the vertical cut.
