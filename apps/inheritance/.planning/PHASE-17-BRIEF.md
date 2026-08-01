# Phase 17 Brief — Launch Film as a Verified Artefact

**Status:** brief only. Do NOT plan or execute until Phase 15 is complete and Phase 16
is drafted. **Recorded:** 2026-08-01, at owner request.

## Why this is a phase and not a one-off

A launch film v1 already exists and was delivered
(`.planning/LAUNCH-FILM-BRIEF.md`, sent to the owner 2026-08-01). Making it *once* was a
task. This phase exists because of what the film contains: **peso figures and a Civil Code
article, presented to lawyers as fact.**

That puts a marketing asset in exactly the same failure class this whole project was built
to close. `PROJECT.md` ranks it plainly — *a wrong legal number must never reach a lawyer
silently.* A film showing ₱1,500,000 beside "Art. 996" is a legal claim on a public
channel, and it is currently protected by nothing but the care taken on the day. The v1
figures were verified by hand against engine output; nothing stops v2 from drifting.

The rigour this project applies to the engine should apply to anything that quotes it.

## Deliverable 1: `scripts/check-film-figures.mjs` (build this FIRST)

The gate that makes the discipline structural rather than remembered.

- Extract every numeral, peso figure and `Art. NNN` citation from the film composition
  (`film.html` or its successor).
- Recompute the source case through the real engine (`engine/examples/cases/*.json`).
- **Fail** when any on-screen figure is absent from the engine's actual output, and when
  any article citation is absent from the engine's `legal_basis` for that heir.
- Fail on any numeral with no declared source at all — the approved-figures list is
  allow-list, not deny-list.

Register in `gates.manifest.json` as blocking, per loop invariant 2. Nothing else in this
phase is safe to leave unattended before this gate exists — an autonomous agent iterating
on a film will otherwise invent a metric the moment it wants a stronger claim.

## Deliverable 2: reproducible render

The v1 render depended on a hand-built harness and two ad-hoc npm installs.

- One documented command renders the film from a clean checkout.
- `ffmpeg`/`ffprobe` availability is a declared, checked prerequisite (they were absent
  on this machine; static npm binaries were used).
- Determinism is asserted, not assumed: render twice, compare frame hashes, fail on drift.
  The composition is already a pure function of the playhead — no `Math.random`,
  no `Date.now`, no CSS transitions — so this should hold, and the gate proves it.

## Deliverable 3: screenshots are captured, never mocked

- The evidence frames come from the running app against the seeded fixture, via a
  committed capture script — not from a designer's recreation.
- The capture asserts the app rendered real data before shooting: if the results screen
  does not show the expected engine figures, the capture fails rather than shooting a
  blank or stale screen.

## Deliverable 4: close the declared departures

v1 shipped with four departures, all recorded in `LAUNCH-FILM-BRIEF.md` §5:

1. **No voiceover** — no TTS on the machine. This is the biggest quality gap. With a voice,
   Law 2 (word-locked sync) becomes live and beat timings get measured from the VO file
   instead of directed by hand.
2. **Renderer** — HyperFrames unresolvable; a local seek harness was used instead.
3. **No music or SFX** — no licensed audio available. Unsourced audio would violate the
   same honesty rule as unsourced figures, so the delivered file is silent.
4. **Master only** — no vertical cut, captions or poster.

Each is either closed or re-recorded as accepted debt with a reason.

## Success criteria (what must be TRUE)

1. A numeral added to the film that does not appear in real engine output fails a blocking
   gate — demonstrated by injecting one and watching it fail.
2. An `Art. NNN` citation that the engine does not attribute to that heir fails the same
   gate.
3. One documented command renders the film from a clean checkout, and rendering twice
   produces identical frame hashes.
4. The evidence screenshots are provably from the running app: the capture script fails
   when the app does not render the expected figures.
5. Every departure in `LAUNCH-FILM-BRIEF.md` §5 is either closed or listed as accepted debt
   with a stated reason.
6. A film can be re-cut for a different case fixture without any figure being hand-typed.

## Explicitly out of scope

Brand redesign, a website, additional campaign assets, analytics, distribution or
scheduling. This phase makes *one* artefact trustworthy and reproducible. It does not start
a marketing function.

## Relationship to Phase 16

Phase 16's scope lock (`check-scope.mjs`) pins the *product's* surface area. This is the
same idea pointed at the *claims*: 16 stops the loop growing the app, 17 stops it
overstating the app. They are siblings and should read as one policy.
