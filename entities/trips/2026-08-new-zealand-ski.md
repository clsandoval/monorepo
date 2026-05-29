---
type: trip
name: NZ Ski Trip 2026 — Wanaka + Queenstown
status: booked-contingent
decision_gate: 2026-06-25
contingency: "Cancel and pivot to Hintertux (Jun 20-Jul 2) IF cousin Aug-8 birthday brings her to Manila; else proceed with NZ"
dates:
  start: 2026-07-30
  end: 2026-08-14
nz_dates:
  arrive: 2026-07-31
  wanaka_in: 2026-07-31
  wanaka_out: 2026-08-07
  qt_in: 2026-08-07
  qt_out: 2026-08-13
  depart: 2026-08-13
locations: ['Wanaka', 'Queenstown', 'Otago', 'South Island']
countries: ['New Zealand']
tags: [skiing, snowboard, solo, wanaka, queenstown, treble-cone, cardrona, remarkables, coronet-peak]
research:
  - "[[2026-05-19-nz-ski-trip-2026-design]]"
hotels:
  - name: Club Wyndham Wanaka, Trademark Collection by Wyndham
    nights: 7
    cost_php: 78000
    cancel_by: 2026-06-25
  - name: Holiday Inn Queenstown Frankton Road by IHG
    nights: 6
    cost_php: 60000
    cancel_by: 2026-06-25
flights:
  - airline: Qantas
    route: MNL ↔ ZQN return
    cost_php: 60000
    outbound:
      - flight: QF20
        from: MNL
        to: SYD
        dep_local: 2026-07-30 20:35 PHT
        arr_local: 2026-07-31 06:08 AEST
      - flight: QF121
        from: SYD
        to: ZQN
        dep_local: 2026-07-31 09:30 AEST
        arr_local: 2026-07-31 14:30 NZST
    return:
      - flight: QF124
        from: ZQN
        to: SYD
        dep_local: 2026-08-13 morning NZST
      - flight: QF19
        from: SYD
        to: MNL
        dep_local: 2026-08-13 12:20 AEST
        arr_local: 2026-08-13 17:30 PHT
booked_php: 198000
budget_php: ~317000
budget_usd: ~5690
created: 2026-05-19
---

## Overview

Solo snowboard trip to NZ's Southern Lakes. 7 nights Wanaka (Treble Cone + Cardrona) → 6 nights Queenstown (The Remarkables + Coronet Peak).

## Locked Itinerary

- **Depart MNL:** Wed 30 Jul 2026 (evening)
- **Wanaka (Wyndham):** Thu 31 Jul → Thu 7 Aug
- **Queenstown (Holiday Inn Frankton):** Thu 7 Aug → Wed 13 Aug
- **Depart ZQN:** Wed 13 Aug (morning)
- **Arrive MNL:** By midnight Aug 15 (hard cap)

## Hotels — Booked

| Hotel | Dates | Nights | PHP | Cancel by |
|---|---|---:|---:|---|
| Wyndham Wanaka | Thu 31 Jul → Thu 7 Aug | 7 | 78,000 | 2026-06-25 |
| Holiday Inn Queenstown Frankton | Thu 7 Aug → Wed 13 Aug | 6 | 60,000 | 2026-06-25 |

## Resorts

| Resort | Base | Allocated days |
|---|---|---:|
| Treble Cone | Wanaka | 3 |
| Cardrona | Wanaka + transfer day | 2 + ½ |
| The Remarkables | Queenstown | 3 |
| Coronet Peak | Queenstown | 2 |

## Design Spec

Full design: [[2026-05-19-nz-ski-trip-2026-design]]
Automation: `automations/nz-ski-trip-2026/` (price scraper + map renderer + Telegram sender)
Trail maps: sent to Telegram 2026-05-19; high-res PNGs at `automations/nz-ski-trip-2026/maps/`

## Next Actions

- [x] Book flights MNL ↔ ZQN — Qantas, 60k PHP flat ✅
- [ ] Apply **Visitor Visa** (online) + pay IVL — Filipino passport needs a full visitor visa, NOT an NZeTA. Tracker: `documents/applications/2026-nz-visitor-visa/TRACKER.md`
- [ ] Buy travel insurance with snow-sports rider
- [ ] Buy lift passes (early-bird windows close end May/early Jun)
- [ ] Reserve snowboard rental (Wanaka shop) late June
- [ ] Book intercity shuttles 2-3 weeks before
- [ ] **2026-06-20: review whole plan before hotel cancellation deadline 2026-06-25**
