# NZ Ski Trip 2026 — Booking Helper Scripts

Stealth-browser scaffolding for live price checks on Agoda/Booking.com/etc. for the trip planned in
`docs/superpowers/specs/2026-05-19-nz-ski-trip-2026-design.md`.

## Setup

```bash
python3 -m venv .venv
.venv/bin/pip install cloakbrowser beautifulsoup4
.venv/bin/python -m cloakbrowser install   # ~200MB Chromium binary
```

## Why CloakBrowser

[CloakBrowser](https://github.com/CloakHQ/CloakBrowser) is a patched Chromium that defeats Booking.com / Agoda bot detection at the binary level. Standard Playwright + stealth plugins get blocked or rate-limited; CloakBrowser passes through cleanly. Verified 2026-05-19 — both sites returned full HTML without captchas.

## Usage

```bash
.venv/bin/python check_hotels.py
```

⚠ **Do NOT run from `/tmp`** — there's a stray `/tmp/inspect.py` that shadows the stdlib `inspect` and breaks Playwright imports.

## Known gotchas

1. **Booking.com URL slugs** — `https://www.booking.com/hotel/nz/<slug>.html` requires the canonical slug, not a guess. Find via Google: `site:booking.com holiday inn queenstown frankton`. Each property has one URL forever.
2. **Agoda search URLs** — the documented `textToSearch=` param doesn't propagate to listings. Use the `cityId` form: `https://www.agoda.com/city/queenstown-nz.html?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&adults=1&rooms=1`. City IDs: Queenstown = `19668`, Wanaka = `4063` (verify before relying on these).
3. **Prices render via JS** — wait at least 5s after `domcontentloaded` and re-query, or use `page.wait_for_selector` on a price element.
4. **Currency** — set `selected_currency=NZD` on Booking.com; on Agoda use the currency selector cookie or `currencyCode=NZD` in the URL.

## Target dates (locked)

| Leg | Check-in | Check-out | Nights |
|---|---|---|---|
| Wanaka | 2026-07-26 (Sun) | 2026-08-03 (Mon) | 8 |
| Queenstown | 2026-08-03 (Mon) | 2026-08-09 (Sun) | 6 |

## Properties to verify (NZD/night, solo, private bath)

- Ramada Resort by Wyndham Wanaka — Booking.com + Agoda + direct
- Distinction Wanaka
- Wanaka Hotel
- YHA Wanaka (private en-suite)
- Holiday Inn Queenstown Frankton Road by IHG — Booking.com + Agoda + IHG direct
- Heartland Hotel Queenstown
- Absoloot Hostel Queenstown (lakefront, private en-suite)
- Sherwood Queenstown
