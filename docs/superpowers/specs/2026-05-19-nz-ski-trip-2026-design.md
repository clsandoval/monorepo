# NZ Ski Trip 2026 — Design Spec

**Status:** booked, contingent (decision pending)
**Created:** 2026-05-19
**Trip entity:** `entities/trips/2026-08-new-zealand-ski.md`

## Decision Gate — Hard Deadline 2026-06-25

The trip is booked but kept refundable until 2026-06-25 because of a contingent family event:

> **IF** cousin (birthday Aug 8) comes to Manila for her birthday → **cancel NZ**, pivot to alternate trip: **Hintertux summer skiing, Sat 20 Jun → Thu 2 Jul 2026** (~PHP 156,000, ~$2,768 USD; ~$2,920 cheaper than NZ).
>
> **ELSE** → **push through with NZ as booked** (Wyndham Wanaka + Holiday Inn Queenstown + Qantas).

Alternate trip itinerary: `automations/nz-ski-trip-2026/hintertux-itinerary.md` (hour-by-hour). Already sent to Telegram 2026-05-19.

Decision must be made by 2026-06-25 to preserve free cancellation on all NZ bookings.

## 1. Goal & Constraints

Plan and execute a **13-night solo snowboard trip** from Manila to NZ's Southern Lakes, hitting **all four major resorts** in the Wanaka/Queenstown cluster. Hotels are now booked; the remaining work is flights, visa, lift passes, shuttles, and gear rental.

| Constraint | Value |
|---|---|
| Origin | Manila (MNL) |
| Destination airport | Queenstown (ZQN) |
| Total NZ nights | 13 (7 Wanaka + 6 Queenstown) |
| **Locked dates** | **Depart MNL Wed 30 Jul → Depart ZQN Wed 13 Aug 2026** |
| Hard constraints | In MNL all of Jul 29; back in MNL by midnight Aug 15 |
| Travelers | Solo |
| Discipline | Snowboard |
| Resorts (locked) | Treble Cone, Cardrona, The Remarkables, Coronet Peak |
| Ground transport | Shuttles only (no rental car) |
| Cadence | Full send — no scheduled work days, fit in opportunistically |
| Visa status | None yet — NZeTA + IVL to apply online |
| **Hotels — booked, fully refundable until 2026-06-25** | Wyndham Wanaka (PHP 78,000 / 7N) + Holiday Inn Queenstown Frankton (PHP 60,000 / 6N) = **PHP 138,000 / ~USD $2,484 / ~NZD $4,140** |

## 2. Date Selection — LOCKED

**NZ Term 2 school holidays 2026:** Sat 4 Jul – Sun 19 Jul. Term 3 begins Mon 20 Jul.

### Locked Itinerary

| Leg | Date | Notes |
|---|---|---|
| Depart MNL | **Wed 30 Jul** (evening) | After Jul 29 hard-stay-in-MNL constraint |
| Arrive ZQN | Thu 31 Jul (afternoon) | ~14–17h travel via SYD/AKL/SIN |
| Shuttle ZQN → Wanaka | Thu 31 Jul (afternoon) | Ritchies, ~1h45m |
| **Wanaka (Wyndham)** | **Thu 31 Jul → Thu 7 Aug** | **7 nights** |
| Transfer Wanaka → Queenstown | Thu 7 Aug | Optional ½ day Cardrona en route |
| **Queenstown (Holiday Inn Frankton)** | **Thu 7 Aug → Wed 13 Aug** | **6 nights** |
| Depart ZQN | **Wed 13 Aug** (morning) | |
| Arrive MNL | Wed 13 / Thu 14 Aug | ~36h buffer before Aug 15 midnight cap |

### Why this window

| Factor | Status |
|---|---|
| MNL constraint Jul 29 (full day) | ✅ Depart Jul 30 evening |
| Back in MNL by midnight Aug 15 | ✅ Arrive Aug 13–14 |
| NZ school holidays (ended Sun 19 Jul) | ✅ Cleared by 12 days |
| All 4 resorts open | ✅ All open by Sat 27 Jun (TC is the bottleneck) |
| Pricing scan history (earlier exploration) | Late-Jul / early-Aug was the cheapest window inside the Jul 20 – Aug 15 hard envelope. Raw data: `automations/nz-ski-trip-2026/scan_out/report.json` |

## 3. Resort Comparison & Day Allocation

| Resort | Base | Terrain (ha) | Vertical (m) | Snowboard fit | Allocation |
|---|---|---:|---:|---|---:|
| **Cardrona** | Wanaka/transit | 615 | 600 | Excellent — biggest area in NZ, world-class parks, groomers | **3 days** (2 from Wanaka + 1 on transfer day) |
| **Treble Cone** | Wanaka | 550 | 700 | Strong — longest vertical, off-piste bowls, fewer beginners | **3 days** |
| **The Remarkables** | Queenstown | 385 | 468 | Strong — higher elevation, more snow-sure, balanced | **3 days** |
| **Coronet Peak** | Queenstown | 280 | 462 | OK — intermediate-heavy, closest to town, night riding | **2 days** |

**Totals:** Wanaka side 1,165 ha (64%), Queenstown side 665 ha (36%). Final locked split: **7 nights Wanaka / 6 nights Queenstown**.

## 4a. Flight Routing — BOOKED

**Outbound — Wed 30 Jul → Thu 31 Jul:**
- **QF20** MNL 20:35 PHT (Wed 30 Jul) → SYD 06:08 AEST (Thu 31 Jul) — ~8h33m
- SYD layover ~3h22m
- **QF121** SYD 09:30 AEST → ZQN 14:30 NZST (Thu 31 Jul) — ~3h

**Return — Wed 13 Aug:**
- **QF124** ZQN morning NZST → SYD AEST (~3h) — verify exact times in Qantas app
- SYD layover ~2-3h
- **QF19** SYD 12:20 AEST → MNL 17:30 PHT — ~8h10m
- All same day; arrive MNL Wed 13 Aug 17:30, ~54h before midnight Aug 15 cap ✓

## 4. High-Level Itinerary (13 NZ nights, locked dates)

| Day | Date | Base | Plan |
|---|---|---|---|
| 0 | Wed 30 Jul | Travel | Depart MNL evening |
| 1 | Thu 31 Jul | Arrive + Wanaka | Land ZQN afternoon; shuttle to Wanaka (~1h45m); check in Wyndham; gear pickup if shop still open; groceries; early bed |
| 2 | Fri 1 Aug | Wanaka | **Treble Cone ×1** — orientation, groomers, learn the four basins |
| 3 | Sat 2 Aug | Wanaka | **Cardrona ×1** — biggest area, parks (avoid Sat crowds = aim early lift) |
| 4 | Sun 3 Aug | Wanaka | **Treble Cone ×2** — off-piste push, Saddle/Matukituki basins |
| 5 | Mon 4 Aug | Wanaka | **REST / WEATHER FLEX** — lake walk, gear check, town day |
| 6 | Tue 5 Aug | Wanaka | **Cardrona ×2** — weekday quieter, parks focus |
| 7 | Wed 6 Aug | Wanaka | **Treble Cone ×3** — favorite re-rides |
| 8 | Thu 7 Aug | Transfer | **Cardrona ×3 (half day)** AM → afternoon Ritchies Wanaka → Queenstown (~1h15m via Cromwell); check into Holiday Inn |
| 9 | Fri 8 Aug | Queenstown | **The Remarkables ×1** — orientation |
| 10 | Sat 9 Aug | Queenstown | **Coronet Peak ×1** — long blues; **night ski session** if running Sat |
| 11 | Sun 10 Aug | Queenstown | **The Remarkables ×2** — Sugar Bowl / off-piste exploration |
| 12 | Mon 11 Aug | Queenstown | **REST / WEATHER FLEX** — town day, Skyline gondola, return gear logistics |
| 13 | Tue 12 Aug | Queenstown | **The Remarkables ×3** OR **Coronet Peak ×2** — decide by snow report |
| 14 | Wed 13 Aug | Travel | Depart ZQN morning → MNL by midnight Aug 15 ✓ |

**Resort tally:** TC ×3, Cardrona ×2 + ×½ transfer, Rem ×2–3, Coronet ×1–2 = ~10–11 ski days; 2 rest/flex days; 2 travel days; 1 arrival settle-in day.

## 5. Cost Breakdown (Solo, NZD ≈ USD × 1.67, PHP ≈ USD × 56)

| Item | USD | NZD | PHP | Status / Notes |
|---|---:|---:|---:|---|
| **Wyndham Wanaka — 7 nights** | **$1,404** | $2,340 | **78,000** | ✅ BOOKED, free cancel until 2026-06-25 |
| **Holiday Inn Queenstown — 6 nights** | **$1,080** | $1,800 | **60,000** | ✅ BOOKED, free cancel until 2026-06-25 |
| **Flights MNL ↔ ZQN return (Qantas)** | **$1,080** | $1,800 | **60,000** | ✅ BOOKED — QF20/QF121 out, QF124/QF19 back (see §4a) |
| NZeTA + IVL | $74 | $123 | ~4,100 | $23 NZeTA + $100 IVL (online, ~72h processing) |
| Travel insurance (14 days, snow rider) | $150 | $250 | ~8,400 | Cover-More / SafetyWing / World Nomads |
| Lift passes | $642 | $1,070 | ~36,000 | TC ×3, Cardrona ×2+½, NZSki 5-day combo — see §7 |
| Snowboard + boots rental — 14d | $252 | $420 | ~14,100 | ~$30/day Wanaka shop; weekly rate |
| Mountain shuttles | $288 | $480 | ~16,100 | TC/Cardrona ~$25 return × 5 days, NZSki shuttle ~$15 × 5 |
| Intercity shuttles | $78 | $130 | ~4,400 | ZQN→Wanaka, Wanaka→QT, QT→ZQN |
| Food (self-cater + some dinners) | $400 | $670 | ~22,400 | ~$50/day × 13 |
| Contingency / extras | $240 | $400 | ~13,400 | Après, gondola, gear repair |
| **TOTAL** | **~$5,690** | **~$9,480** | **~317,000** | |

**Locked spend (hotels): USD $2,484 / PHP 138,000.** Remaining spend is variable; flights are the biggest swing (±USD $400).

## 6. Hotels — BOOKED

| Hotel | Dates | Nights | Cost (PHP) | Free-cancel until |
|---|---|---:|---:|---|
| **Club Wyndham Wanaka, Trademark Collection** | Thu 31 Jul → Thu 7 Aug | 7 | **78,000** | 2026-06-25 |
| **Holiday Inn Queenstown Frankton Road by IHG** | Thu 7 Aug → Wed 13 Aug | 6 | **60,000** | 2026-06-25 |
| **TOTAL** | | **13** | **138,000** | |

Both bookings confirmed via Agoda. If anything in the rest of the plan changes (flights, visa, etc.) before 2026-06-25, hotels can be cancelled and rebooked without penalty.

### Live Booking.com price scan history (for reference)

Earlier exploration of 3 date blocks found cheapest private-bath options across Booking.com listings:
- Wanaka: Mt Aspiring Holiday Park NZ$153/night, Mt Barker $178, Wanaka Mountain Views $173
- Queenstown: Gorgeous Cabin (Block B only) NZ$123/night, Quail Rise $148, Aspen Lodge $150

The booked Wyndham (NZ$334/night) and Holiday Inn (NZ$300/night) are above the cheapest-available tier but were chosen for brand familiarity and existing deals. Raw scan data: `automations/nz-ski-trip-2026/scan_out/report.json`.

Scrape tool: [CloakBrowser](https://github.com/CloakHQ/CloakBrowser) scaffold at `automations/nz-ski-trip-2026/`.

## 7. Lift Pass Strategy

| Pass | Resort(s) | Price (approx, advance) | Logic |
|---|---|---:|---|
| Treble Cone 3-day flex | TC | ~NZD $420 | Buy advance online, ~10% discount vs walk-up; flex use across the Wanaka leg |
| Cardrona 3-day flex | Cardrona | ~NZD $330 | Same — advance online via cardrona.com or NZ Ski Deals |
| NZSki Multi-Day Pass (5-day) | Coronet + Remarkables interchangeable | ~NZD $520 | Use across 5 of the 6 Queenstown days |

**Notes:**
- **Cardrona + Treble Cone are jointly owned** — check for a combined "Cardrona + TC" multi-day pass on cardrona-treblecone.com (often cheaper than separate passes; sometimes called the "Mountain Pass").
- **Ikon Pass** worth checking: includes Mt Hutt, Coronet Peak, and The Remarkables (NZSki). If you're considering future US/JP/EU trips this season, an Ikon Base (~USD $929) may pay for itself just on Queenstown days. Spec assumes no Ikon (one-shot calc).
- **Buy early** — most resorts have early-bird windows ending May/June with 20–30% off; verify cutoffs at booking time.

## 8. Shuttles & Ground Transport

**Intercity:**
- **ZQN airport → Wanaka:** Ritchies (Wanaka Connexions) or Yello! — ~NZD $50–60, ~1h45m. Departs 4–6× daily. Book online.
- **Wanaka → Queenstown:** Ritchies — ~NZD $40–50, ~1h15m via Cromwell (NOT Crown Range in winter — main highway is safer + always open). Alternatively, **Alpine Connexions** runs ski-shuttle services that can drop at Cardrona base on transfer day, then continue to QT in afternoon — verify this is bookable for Mon 3 Aug.
- **Queenstown hotel → ZQN airport:** Super Shuttle or hotel shuttle — ~NZD $15–25.

**Mountain shuttles (daily):**
- **Wanaka → Treble Cone:** TC's own shuttle ~NZD $25 return; pickup from central Wanaka, ~30 min ride.
- **Wanaka → Cardrona:** Cardrona shuttle ~NZD $25 return; ~50 min ride.
- **Queenstown → Coronet Peak:** NZSki shuttle ~NZD $15 return; ~25 min, multiple departures from central QT.
- **Queenstown → The Remarkables:** NZSki shuttle ~NZD $15 return; ~45 min, multiple departures.

**Booking model:** Mountain shuttles are typically pay-as-you-go or bookable same-day via the resort app. Book intercity legs in advance.

## 9. Visa: NZeTA + IVL

Philippine passport → **NZeTA required** (electronic, online).

**Application steps:**
1. Apply at https://nzeta.immigration.govt.nz/ (or the official iOS/Android app — slightly cheaper: NZD $17 vs $23).
2. Submit: passport scan, recent photo, basic itinerary info, payment.
3. Pay **IVL (International Visitor Levy) NZD $100** at the same time — mandatory for tourists.
4. Processing: usually <72 hours, often within minutes.
5. **Validity:** 2 years, multiple entries, max 90 days per visit.

**Apply ~4 weeks before departure** as a buffer; do it well after flights are booked (need approximate dates).

**I can help by:** drafting the application data (passport details from user, photo guidance, declarations checklist), then user submits.

## 10. Booking Sequence & Lead Times

| # | Task | When | Status |
|---|---|---|---|
| 0 | Wyndham Wanaka (7N) | Done | ✅ Booked, free cancel until 2026-06-25 |
| 0 | Holiday Inn Queenstown (6N) | Done | ✅ Booked, free cancel until 2026-06-25 |
| 0 | Qantas flights MNL ↔ ZQN (60k PHP flat) | Done | ✅ Booked |
| 2 | Apply NZeTA + IVL | After flights confirmed | — |
| 3 | Purchase travel insurance (14d, snow-sports rider) | 4 weeks before departure | — |
| 4 | **Hotel cancellation gate — review whole plan before 2026-06-25** | 2026-06-20 self-check | — |
| 5 | Buy lift passes (early-bird windows often close end May / early Jun) | Late May / early Jun | — |
| 6 | Reserve snowboard + boots rental (Wanaka shop) | Late June | — |
| 7 | Book intercity shuttles (ZQN→Wanaka 31 Jul, Wanaka→QT 7 Aug, QT→ZQN 13 Aug) | 2–3 weeks before | — |
| 8 | Verify mountain shuttle schedules each leg | 1 week before | — |
| 9 | Pack gear, print confirmations, set Telegram/email reminders | Departure week | — |

## 11. Open Questions / Decisions

- [ ] **Cardrona + Treble Cone combined pass** — does the joint operator offer it for 2026? Verify on cardrona-treblecone.com before buying separate passes.
- [ ] **Ikon Pass eval** — any other 2026/27 ski plans that would make Ikon pay off? If yes, change pass strategy.
- [ ] **Existing snowboard gear** — bringing own boots/board, or full rental? Spec assumes full rental.
- [ ] **Transfer-day Cardrona ride** — confirm luggage storage at Cardrona base (or skip and ride Cardrona ×2 from Wanaka only).
- [ ] **Flight routing** — direct-ish via SYD vs AKL stopover; PAL vs Qantas vs Jetstar combo. Must depart MNL Jul 30 evening or later; must arrive MNL by midnight Aug 15.
- [ ] **Coronet Peak night skiing** — confirm Sat Aug 9 night session is running 2026; book if so.

## 12. Deliverables on Approval

1. **Trip entity** created at `entities/trips/2026-08-new-zealand-ski.md` with full frontmatter (`status: planning`, dates, locations, tags).
2. **Implementation plan** at `docs/superpowers/plans/2026-05-19-nz-ski-trip-2026-plan.md` — step-by-step booking checklist with checkboxes, decision points, and "Claude can help with" annotations on applicable tasks.
3. **Dashboards** — trip surfaces on existing upcoming-trips dashboard via Dataview query (no new dashboard needed).

## 13. Sources

- [NZ School Holidays — Ministry of Education](https://www.education.govt.nz/school-terms-and-holidays-dates)
- [Cardrona Mountain Info](https://cardrona-treblecone.com/mountains)
- [Treble Cone — Wikipedia](https://en.wikipedia.org/wiki/Treble_Cone)
- [NZSki — Coronet, Remarkables](https://www.nzski.com/)
- [Coronet Peak vs Remarkables — Snopro NZ](https://snopro.co.nz/coronet-peak-vs-remarkables/)
- [Holiday Inn Queenstown Frankton Road](https://holidayinnqueenstown.co.nz/)
- [Ramada Resort by Wyndham Wanaka](https://www.wyndhamhotels.com/ramada/wanaka-new-zealand/ramada-resort-wanaka/overview)
- [NZeTA application](https://nzeta.immigration.govt.nz/)
