---
phase: 12-wizard-output-journey-gates
plan: 05
subsystem: journey-harness
tags: [seo, smoke, blog, landing]
requires: []
provides:
  - "frontend/journey/seo-smoke.mjs — the JRNY-11 smoke runner"
  - "frontend/journey/seo-routes.json — the committed public route list"
affects: []
tech-stack:
  added: []
  patterns:
    - "committed route data rather than a run-time scan, so lost coverage is a visible diff"
key-files:
  created:
    - frontend/journey/seo-routes.json
    - frontend/journey/seo-smoke.mjs
  modified: []
key-decisions:
  - "'No 404' is implemented as 'no observed response carried status >= 400', because src/router.ts declares no notFoundComponent and there is no not-found screen to look for."
  - "Fourteen routes are smoke-checked, not reference-imaged: JRNY-11 asks for a smoke check and marketing copy changes often."
requirements-completed: [JRNY-11]
duration: 24 min
completed: 2026-07-31
---

# Phase 12 Plan 05: Public-Surface SEO Smoke Summary

A dependency-free runner that loads all fourteen landing, blog and marketing routes in a real
browser against the built application and asserts render, console cleanliness and network status per
route.

3 tasks, 2 files created, 1 commit (`8d4603f90`).

## Route list provenance

`grep -rho "path: '[^']*'" src/routes/landing src/routes/blog src/routes/index.tsx | sort -u`
returned exactly fourteen paths, and all fourteen appear in `seo-routes.json`:

```
/                                  /blog/no-will-philippines
/blog                              /blog/parents-inheritance-share
/blog/how-to-compute-legitime      /blog/preterition-explained
/blog/illegitimate-children-rights /illegitimate-child-inheritance
/blog/intestate-vs-testate         /intestate-succession-calculator
/legitimate-share-calculator       /no-will-inheritance-philippines
/parents-inheritance-share         /spouse-and-children-inheritance
```

`count=14 unique=14 badkeys=0 badpath=0`.

## Verification

```
node journey/seo-smoke.mjs        -> exit 0 (run twice, side-effect free)
    GATE-SKIPS total=14 skipped=0
    SEO SMOKE PASS routes=14 failed=0
npx tsc -b --force                -> exit 0, no output
grep -c "process.exit(2)" journey/seo-smoke.mjs -> 1
grep -c "approve"        journey/seo-smoke.mjs -> 0
grep -c "writeFile"      journey/seo-smoke.mjs -> 0
git diff --stat frontend/src/                   -> empty
```

## The three observed failures

| Marker | Injection | Observed |
|---|---|---|
| `SEO RENDER FAILURE` | `/this-route-does-not-exist` added to a scratch `seo-routes.json` | `SEO RENDER FAILURE /this-route-does-not-exist — no <h1> element exists on the page`, exit 1 |
| `SEO BAD STATUS` | `fetch("/journey-missing-endpoint", { headers: { Accept: "application/json" } })` in `BlogIndex` | `SEO BAD STATUS /blog — 1 response(s) >= 400, first: HTTP 404 http://127.0.0.1:4173/journey-missing-endpoint`, exit 1 |
| `SEO CONSOLE ERROR` | `console.error("journey injected")` in `BlogIndex` | `SEO CONSOLE ERROR /blog — 1 console error(s), first: journey injected`, exit 1 |

Every injection was restored with `git checkout --`, `git diff --stat frontend/src/` came back empty,
and the restored tree re-ran green at `routes=14 failed=0`.

## Deviations from Plan

**[Rule 1 - Bug in the plan's prescribed injection] The `SEO BAD STATUS` injection the plan
specifies cannot fire, for a reason worth recording** — Found during: Task 3 | The plan asks for
`<img src="/journey-missing-asset.png" />` in `BlogIndex.tsx`. That was tried first and the smoke
stayed green at `routes=14 failed=0` even though the string was confirmed present in the built
bundle. Cause, measured against a live `vite preview`:

```
curl -o /dev/null -w "%{http_code}"                        /journey-missing-asset.png  -> 200
curl -o /dev/null -w "%{http_code}" -H "Accept: image/png" /journey-missing-asset.png  -> 404
```

`vite preview`'s SPA history fallback rewrites any request whose `Accept` header accepts HTML.
Chromium sends `image/avif,image/webp,image/apng,image/svg+xml,*/*;q=0.8` for an `<img>`, and the
`*/*` term accepts HTML, so the missing asset is answered `200 text/html` and there is no 4xx to
observe. | Fix: the injection, not the assertion, was changed — a `fetch` with an explicit
`Accept: application/json`, which the fallback does not rewrite. No assertion was weakened; the
threshold is still `status >= 400` with no allow-list. | Verification: the corrected injection
produced `SEO BAD STATUS ... HTTP 404` and exit 1, pasted above. | Commit: `8d4603f90`

**Total deviations:** 1 auto-fixed (1 bug in a plan-specified verification step). **Impact:** none on
the delivered artifact; the finding is that a missing *static asset* is not detectable through this
server, while a missing *data endpoint* is.

## Issues Encountered

Worth knowing for Phase 13 and beyond: under `vite preview`, a broken `<img>`/`<script>` src does not
surface as a 4xx to a browser-side network listener. `SEO BAD STATUS` therefore protects against
failing API/data fetches, not against missing bundled assets. Nothing in JRNY-11 asks for the latter,
so no scope was added.

## Next

Wave 1 complete. Ready for wave 2 (12-03, 12-04, 12-06, 12-07).
