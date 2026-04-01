# RLC GM Meeting Deck

Presentation deck for Kosmas Athletic Ventures' first meeting with Robinsons Land Corporation's new General Manager (Teddy V. Bernas, OIC-Business Unit GM of RLC Residences).

## Context

- **Purpose**: Re-introduce Kosmas to the new RLC GM; build confidence in the JV partnership
- **Not a cold pitch** — Helios (20-court, 10-story pickleball building) is already a JV with RLC
- **All three venues are in Bridgetowne**, RLC's flagship estate in Pasig

## Deck Structure (12 slides)

1. **Cover** — Kosmas Athletic Ventures, "Building the Multi-Sport Ecosystem in Southeast Asia"
2. **The Ecosystem** — Venues, tech, sports, ops, payments overview
3. **The Opportunity** — PH sports infrastructure boom, key stats (200+ courts, 1 FIFA Pro pitch, 0 integrated operators)
4. **Who is Kosmas** — Company overview, markets (PH/SG/TH), 3 venues, exclusive PodPlay rights
5. **Technology: PodPlay** — Autonomous ops, smart replay, booking/payments, analytics
6. **The Autonomous Model** — PodPlay as a venue OS across verticals; Sharks Pool Club case study (+76% revenue, 37% margin)
7. **Atleta 63** — Operational football venue in Bridgetowne, FIFA Quality Pro-certified
8. **Temporary Facility** — 14 pickleball courts, tent structure, Sept 2026
9. **Helios** — Flagship 20-court, 10-story building, JV with RLC, 2028 target
10. **Multi-Sport Play** — Pickleball (active) + Football (operational), one campus
11. **RLC x Kosmas** — What each partner brings
12. **Close**

## Design

- **Palette**: PSG colors — Navy #004170, Red #E30613, White #FFFFFF, Gold #CEAB5D
- **Typography**: Instrument Serif (headings) + Geist (body)
- **Tone**: Corporate polished, ecosystem-first
- **Approach**: Lead with the vision (ecosystem map), zoom into layers

## Deployment

Deployed to Fly.io as a static nginx container.

```bash
cd projects/kosmas/rlc-gm-meeting-deck
fly deploy
```

**Live URL**: https://kosmas-rlc-deck.fly.dev

App name: `kosmas-rlc-deck` (org: cheerful-885)

## Navigation

- Arrow keys / spacebar to advance
- Swipe on mobile
- Progress bar at top
- Nav buttons appear on hover (bottom-right)

## Key Research

### RLC (Robinsons Land Corporation)
- One of PH's largest real estate developers (JG Summit arm)
- Back-to-back Developer of the Year (DOT Property Philippines)
- New OIC-GM: Teddy V. Bernas (as of early 2026)
- Bridgetowne is their flagship mixed-use estate in Pasig

### Atleta 63
- 104m x 66m artificial football pitch in Bridgetowne (RLC development)
- Only FIFA Quality Pro-certified field in the Philippines
- 24/7 operation, open to professional clubs and recreational players
- Founded by football enthusiasts / UP soccer dads, co-founders from Anytime Fitness

### PodPlay
- Autonomous venue operating system — spun off from PingPod (Oct 2025)
- $8M Series A led by Frontier Growth, $50M valuation
- 1M+ users, 200+ locations, tripled revenue YoY
- Verticals: pickleball, table tennis, pool/billiards, golf sims, dog wash, racing sims, soccer, hockey, baseball
- Key tech: patent-pending replay system (1.5M+ replays, 110M+ social impressions), Kisi access control, white-label apps, Tableau analytics
- Sharks Pool Club case study: +76% revenue, 37% operating margin, +50% capacity after PodPlay integration

### Venue Pipeline (all in Bridgetowne)
| Venue | Type | Courts | Timeline | Status |
|-------|------|--------|----------|--------|
| Atleta 63 | Football | 1 field | Operational | Live |
| Temporary Facility | Pickleball (tent) | 14 | Sept 2026 | Requirements gathering |
| Helios | Pickleball (10-story) | 20 | 2028 | Design phase, JV with RLC |

## TODO

- [ ] Replace placeholder "Venue Photography" / "Concept Render" / "Architectural Render" with actual images
- [ ] Replace "contact details" on closing slide with real contact info
- [ ] Swap lightning bolt SVG with actual Kosmas runner icon from `docs/brand/kosmas/`
- [ ] Update Kosmas brand palette to PSG colors across `.impeccable.md` and other brand docs
- [ ] Verify all stats are current before presenting
