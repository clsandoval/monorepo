---
type: project
name: Pod Play Southeast Asia
status: active
people: [[Carlos Sandoval]], [[Richard Bachman]], [[Isabel Lapus]], [[Sophia Lapus]], [[Kim Lapus]], [[Marco Basug]]
places: [[Philippines]], [[Singapore]], [[Thailand]]
related: [[Pod Play]], [[Ping Pod]], [[Magpie]], [[Digital Wallet]], [[Ping Pod Asia Franchise]], [[Kosmas Athletic Ventures]]
tags: [business, franchise, asia, distribution]
---

# Pod Play Southeast Asia

Master distribution and franchise operation for [[Pod Play]] and [[Ping Pod]] across Southeast Asia, operated by [[Kosmas Athletic Ventures]].

## Kosmas Team

| Person | Role |
|--------|------|
| Richard Bachman | Presenting org chart + hiring recommendations |
| Isabel Lapus | Team member |
| Sophia Lapus | Team member |
| Carlos Sandoval | Operations, technical lead |
| Kim Lapus | Team member |
| Marco Basug | Operations, traveled to NJ training with Carlos |

## Status (as of 2026-03-26)

- **Pod Play rights**: Team holds Southeast Asia distribution rights
- **Philippines deployment**: Payment platform working via [[Magpie]], booking system functional
- **HQ location**: [[Singapore]] being evaluated — EDB supportive with tax incentives and visa support
- **NJ Training Trip**: Completed (March 2–10, 2026) — see [[2026-03 NJ PodPlay Training]]

### Venue Pipeline

| Venue | Courts | Type | Timeline | Status |
|-------|--------|------|----------|--------|
| [[Tela Park]] (Telepark) | 8 | Pro (replay) | ~1 month (late April 2026) | Site survey done, cabling done, blocked on ABM + legal |
| [[Temporary Facility]] | 14 | Tent | ~6 months (Sept 2026) | Dialog started with PodPlay, waiting on Ernesto's requirements list |
| [[Helios]] | 20 | 10-story building | ~2 years (2028) | JV with Robinsons Land (RLC), design phase |

### Current Blockers

1. **Apple Business Manager** — waiting on Apple verification to get VPP licensing from PodPlay
2. **Legal** — need to contact legal for replay script licensing
3. **Camera compatibility** — Tela Park may use different camera model than standard Dahua; needs verification
4. **Network setup clarity** — need to fully understand standard PodPlay router/switch/traffic flow to evaluate Telepark's proposed custom setup

### Key Resolved Items (from NJ Training)

- Per-facility branded apps (not one global app) — each venue gets own app + dashboard
- Own Mosyle MDM instance needed (separate from PodPlay's)
- Own Apple Business Manager needed
- Deployment server access granted; V2 replay service coming (runs from dashboard, no VPN needed)
- Power: just swap PDU for 220V; all other gear is universal 100-240V
- Telepark dashboard already created by PodPlay
- BOM: Chad's Google Sheets MRP tool auto-generates per club; will duplicate for Kosmas
- Support: 3-tier escalation (PH team → Nico → Patrick)

## Revenue Model

- Upcharge model: 70/30 split (team/Pod Play) on anything above $50 base price
- Philippines withholding tax: 17%
- Payment processing via [[Magpie]] (GCash + credit cards)

## Key Relationships

- [[Ping Pod]] franchise distribution (see [[Ping Pod Asia Franchise]])
- [[Magpie]] payment platform partnership
- [[Central Group]] potential Thailand franchise deal
- [[Robinsons Land]] joint venture for Helios
- EDB Singapore for HQ setup

## Action Items

- [ ] Get Apple Business Manager verified → VPP licensing
- [ ] Contact legal for replay script licensing
- [ ] Verify camera compatibility for Tela Park (different model than Dahua)
- [ ] Clarify Tela Park network setup (managed PoEs, switch-to-switch) against standard PodPlay config
- [ ] Get Ernesto's requirements list for Temporary Facility app development
- [ ] Finalize legal agreements
- [ ] Set up Google Cloud alerting for our own locations
- [ ] Negotiate wallet partnership terms with [[Magpie]]
- [ ] Schedule Singapore EDB briefing visit
- [ ] Richard to present org chart with hiring recommendations
