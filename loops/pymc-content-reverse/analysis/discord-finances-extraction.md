# #finances Channel — Financial Data Extract

**Source:** Discord channel `#finances` (channel ID `747388118256320582`)
**Date range:** 2020-08-24 through 2026-03-11
**Messages mined:** 4,385 (5,171 lines in JSONL)
**Extraction focus:** Pricing signals, business model, revenue figures, compensation structure

---

## 1. Pricing Signals — Hourly Rates

### Contractor / Team Member Rates

**Thomas (UTC+7) — 2021-06-02**
> "I think we said $50/h"

**Maxim — 2021-06-26**
> "It is $50"

**Eric Ma (GMT-5) — 2021-06-27**
> "if we make contributions back to the OSS PyMC3 or ArviZ packages outside of project contexts that are charged to projects, we can bill that back to PyMC Labs at a flat rate of $50. […] we may need to institute a cap on the total pool of $ available for OSS contribs if we run into sustainability issues."

**Luciano (UTC+1) — 2021-10-01**
> "we set a ceiling of 12 hs per month that would be billable at 50$/hs for OSS. Any hours that went above that, we wouldn't charge to labs."

**Thomas (UTC+7) — 2024-02-01** (on proposed hourly rate increase)
> "Incorrect. Rate has gone up by $5 for project work starting February 1st. OSS rate unchanged"

**Bill (UTC-8) — 2025-01-03** (discussing rate history)
> "I suspect the 80 -> 85 change probably hasnt kept up with inflation, or the 50/50 split in the context of multimillion dollar contracts."

**Thomas (UTC+7) — 2025-01-03** (on rate history)
> "correct, which definitely has happened in the past. we raised it (last year?) from $75 to $80. I think it's fair to consider and check the potential implications. my hunch is that it might have put us over on too many projects, but I'll look into it"

**Rate trajectory inferred:** $50/h (2021, OSS) → $75 → $80 → $85 (project work, post-Feb 2024). OSS rate held at $50 (capped at 6h/month, then 12h/month at various points).

**Maxim — 2021-10-13**
> "I still think that we should calculate effectiveness based on $360 rate"
*(Notional client-facing rate for effectiveness calculations)*

**Thomas (UTC+7) — 2024-04-18** (in client billing discussion)
> "$140/h"

**Ricardo — 2023-04-20**
> "61 USD per hour on average"
**Thomas (UTC+7) — 2023-04-20**
> "essentially our profitability"
*(Average effective rate per billed hour across all team members)*

**Christian — 2022-08-01**
> "$125 for me"
*(Personal hourly rate for that individual at that time)*

### External / Independent Rates Referenced

**Jesse Grabowski — 2024-01-28**
> "I charge 300/hr for hourly consulting"

**Ulf Aslak — 2024-01-28**
> "my previous salary * 1.5 / 0.75 (cause I came expect to do billable work more than 75% of the time) which put me nicely in the 100-200 range."

**Eric Ma (GMT-5) — 2024-01-28**
> "I've used $1K/hr to scare off firms like AlphaSights"

### US Bonus / Geographic Rate Modifier

**Thomas (UTC+7) — 2025-01-01**
> "there is the US-bonus of +$25 which is supposed to account for the higher opportunity cost of US folks."

**Ben Vincent — 2022-01-31**
> "idea of +$25/hr for 100% labs makes sense"

### Industry Veteran Rate (proposed Jan 2025)

**Thomas (UTC+7) — 2025-01-01**
> "I'm proposing to add a new bonus modifier: the 'industry veteran rate' that adds $50 to their existing rate. […] that person needs to have been in a leadership position (C-level or partner) at a mid- to large-sized company (>200 employees) and have managed >10 people. to the best of my knowledge, this currently applies to [Luca] and [Joe Wilkinson]."

### PhD Bonus

**Thomas (UTC+7) — 2025-01-04**
> "Labs is also an example of that, where there is a PhD bonus and of course the general bonus."
*(Existence confirmed but no dollar amount stated in channel)*

---

## 2. Revenue Figures

### Monthly Revenue

**Thomas (UTC+7) — 2020-12-17**
> "for the month of December we have generate revenue on the order of $85k ($60k roche + $20k indigo + $5k appgrowth)"

**Thomas (UTC+7) — 2023-05-22**
> "without bonus payments it's about $61k per month so far"
> "we were averaging about $12k per month in that bucket, that's way down this month"
*(The "$12k" bucket = OSS/internal billing)*

**Thomas (UTC+7) — 2023-05-22** (outstanding invoices snapshot)
> "invoices that are either sent or about to be sent (but haven't been paid yet):
> * Indigo $70k
> * Roche: $17k
> * Galapagos: $15k
> * Curology: $10k
> * BP: $24k
> * Appgrowth $5k
> * Akili $15k
> Total: $156k"

### Annual Revenue Milestones

**Luciano (UTC+1) — 2021-11-02**
> "I don't know about this guys. $1.5M in the first year seems big to me, and we might need to think about how and where labs should be registered so that we don't run into tax problems"
*(First-year revenue estimate, circa late 2021)*

**745274789517721631 — 2021-11-01** (core team member, unresolved)
> "And to think we started with a lucrative 5k contract one and a half year ago..."
*(First contract: ~$5k, circa mid-2020)*

### Company Balance

**Thomas (UTC+7) — 2023-10-06**
> "total balance at ~$240k"

**Thomas (UTC+7) — 2025-12-15**
> "Bain/Coke budget seems to be secured for all of 2026, so that's the ultimate hedge and will carry us."

### Long-Term Revenue Target

**Thomas (UTC+7) — 2025-01-04**
> "[GenAI initiative] could be $50mm revenue over the next 10 years (could also be much more)."

---

## 3. Business Model — How PyMC Labs Makes Money

### The 50/50 Revenue Split

**Oriol — 2025-10-02**
> "All the hours in here are client hours. 50% of the project budget goes to hourly rates, any extra out of that goes into the bonus. The other 50% is for internal/OSS/infra costs so changes in these elements should not have any effect on the bonus/hours"

**Ben Vincent — 2025-09-25**
> "50% of all revenue goes to Labs. 50% into project hours + bonus"

**Thomas (UTC+7) — 2025-01-04**
> "yes, as a significant part of their work is business development it comes out of the other 50%. only project work comes out of project budgets."

**Thomas (UTC+7) — 2020-08-26** (founding rationale)
> "the idea is that we charge clients rates way higher than that, and through the bonus pool structure we all get a piece of that upside while also aligning incentives to work efficiently as well as sharing some of the risk between us. if we do this well, it's quite likely the majority of the pay for some people will come through the bonus pool"

### Billing Structure

- Team members bill as independent contractors (freelancers) on a monthly basis
- Invoices submitted to Labs by 1st of each month
- Time tracked via Toggl; invoices generated via toggl-billing app (GitHub: `pymc-labs/toggl-billing`)
- Labs invoices clients; contractors invoice Labs
- Currency: invoices submitted in USD; Labs converts to local currency via Wise at time of payment; conversion fees absorbed by Labs

**Sef M — 2024-04-26**
> "You send us the invoice in USD, exactly as how it is in Toggl. We make the conversion on our side with Wise on the day of payment. That converted amount is entered into the field of total amount to be received. The conversion rate is paid by Labs. You get the money in your currency."

### Payment Terms / Late Payments

**Niall — 2023-05-22**
> "90 days is a pretty long payment terms, 60 is probably something i've seen more often"

**Sef M — 2023-05-22**
> "the net payment terms are also not always being followed, most clients pay late"

**Sef M — 2022-07-12**
> "Added to the bonus pool for Q1 and Q2 are only the projects that meet two criteria: already completed in terms of SOW and paid in full by the client"

### SLA / Retainer Model

**Niall — 2023-12-24**
> "It'll be nice to try and use the saas and more SLAs to boost the bonus pool too. Where they just become constant low hour intensive, constant revenue projects"
> "Don't think it would need that many either, 5 SLAs would add 45k to the bonus pool each quarter"

**Niall — 2024-10-31**
> "i'd love to sell more SLAs, those projects are pretty big in terms of margin (Audible/L.L Bean)"

**Niall — 2024-09-08**
> "SLAs are super profitable if we can get like 10 of them that would be a pretty sizeable addition to the pool"

### Project Pricing Strategy

**Thomas (UTC+7) — 2021-10-04** (on HF MMM and Indigo Phase 3 proposals)
> "Phase 2 were priced at $65k and $70k, respectively (if I remember correctly), those were 'big tickets' for us at that time"
> "Now, big tickets for us are $150k-$200k (Roche, GT, Erisyon)"
> "I'd like to get these two into that range as well"
> "Indigo we currently have at $175k, HF not sure yet, maybe $150k?"

**Thomas (UTC+7) — 2021-10-05**
> "HF is spending >$100mm on marketing every year, I think our work will make that *at the very least* more than 1% more effective, so arguing about a couple of hundred k seems silly."

**Luciano (UTC+1) — 2021-10-06**
> "I just went through the phase 3 proposal for HF and I think that it would cost us about 75K to do. Anything above will be bonus."
> "I know that the cost really makes no sense anymore for pricing the project, so $75K would be super low-balling the pitch, and either 150K or 175K seem fine."

---

## 4. Specific Client Deal Sizes

### Roche
- SOW1: completed before 2021
- SOW2: ~$38k (Alona/Luciano, 2021-10-15)
- SOW3: $140k (Thomas, 2021-10-15)
- Q2 2023 outstanding: $17k

### HelloFresh
- Phase 2: ~$65k (Thomas, 2021-10-04)
- Phase 3 target: $150k–$175k
- HF Workshop: separate SOW

### Indigo
- Phase 2: ~$70k
- Phase 3 proposal: $175k (sent Oct 2021)

### Colgate
- Total project budget: ~$295k (Ricardo, 2024-04-18)

### Readystate
- Annual contract: **$2M/year** (Thomas, 2025-01-04)
- Started at $500k/year (Bill, 2025-01-05), scaled to $2M
- SOW bonus margin: ~$237k leftover (Ricardo, 2024-04-18)

**Thomas (UTC+7) — 2025-01-04:**
> "a company like readystate paying us $2mm a year is not quite as patient"

### Bain (Coca-Cola / Red Cities)
- Annual run rate: **$5M/year** (Niall, 2025-01-05)
- Red Cities sub-contract: **3 × $350k = $1.05M** starting October (Niall, 2025-01-30)
- Red Cities project: **$580k**, 50% upfront + 50% on completion (Niall, 2025-10-01)
- Q3 2024 Bain billed: $189,805.07 (Tom Knackstedt, 2024-10-31)

**Niall — 2025-01-05:**
> "Bain is 5m per year at the moment"

**Thomas (UTC+7) — 2025-12-15:**
> "Bain/Coke budget seems to be secured for all of 2026"

### Other Clients (Deal Sizes)
| Client | Amount | Period | Source |
|--------|--------|--------|--------|
| Appgrowth | $5k/month | Dec 2020 | Thomas 2020-12-17 |
| Galapagos | $15k | Q2 2023 | Thomas 2023-05-22 |
| Curology | $10k | Q2 2023 | Thomas 2023-05-22 |
| BP | $24k | Q2 2023 | Thomas 2023-05-22 |
| Akili | $15k | Q2 2023 | Thomas 2023-05-22 |
| Erisyon | $150k–$200k tier | 2021 | Thomas 2021-10-04 |
| Audible | SLA (high margin) | 2024 | Niall 2024-10-31 |
| L.L. Bean | SLA (high margin) | 2024 | Niall 2024-10-31 |

---

## 5. Quarterly Bonus Pool — History

### Structure
- Pool = project revenue collected minus project labor costs
- Distributed quarterly, proportional to hours worked across all projects
- Only completed + fully-paid SOWs included
- OSS hours added to pool starting Q4 2022

**Thomas (UTC+7) — 2020-08-26**
> "if we do this well, it's quite likely the majority of the pay for some people will come through the bonus pool"

### Q3 2025 Bonus Detail (most recent)

**Thomas (UTC+7) — 2026-01-09**
> "Q3 2025 Bonus Pool: ~$288,000
> We have high confidence in the $285K-$295K range.
> **Effective Additional Hourly Rate:**
> High Intensity tier (1.2x): ~$41/hr
> Regular: ~$34/hr
> Blended average: ~$36/hr"

### Historical Bonus Trajectory

| Period | Pool Amount | Notes |
|--------|-------------|-------|
| Q2 2022 | $0 | Thomas: "like we did in Q2 when it was $0" |
| Q3–Q4 2023 | ~$21–24k | Low; few invoices paid |
| Q2 2024 | ~$200k | Thomas: "looks to be around $200k" |
| Q3 2024 | ~$223k | Bain as primary driver |
| Q3 2025 | ~$288k | Thomas 2026-01-09 |

**Ricardo — 2023-12-24**
> "Those 3 consecutive quarters were 30k of bonus for me haha. Definitely gold"

---

## 6. Compensation Model

### Base Rate Structure (as of 2024–2025)

| Modifier | Amount | Applies to |
|----------|--------|-----------|
| Base rate | $85/hr (raised from $80, Feb 2024) | All project work |
| OSS rate | $50/hr (flat, capped at 6–12 hrs/month) | OSS contributions |
| US bonus | +$25/hr | US-based team members |
| Industry veteran | +$50/hr (proposed Jan 2025) | C-level/partner vets, 200+ employees |
| PhD bonus | Exists (amount not stated) | PhDs |
| High Intensity tier | 1.2x multiplier on hours (Q3 2025) | Criteria TBD |

**Thomas (UTC+7) — 2025-01-01**
> "our hourly comp structure has been working well so far for the most part. it hasn't really been touched since the first day of Labs."

### Bonus Distribution Logic

**Thomas (UTC+7) — 2024-09-12**
> "the logic is that we're all contributing on equal footing to the profit of the company"

*(Bonus is NOT weighted by hourly rate — flat per worked hour)*

### Compensation Philosophy

**Thomas (UTC+7) — 2020-08-26**
> "quite a few of us are based outside the US where cost of living (things like rent in SF, healthcare, paying off student loans etc) is vastly lower. this is also reflected in salaries in these locations. the idea is that we charge clients rates way higher than that, and through the bonus pool structure we all get a piece of that upside"

**Thomas (UTC+7) — 2025-01-02**
> "I'm not sure 'stress' or 'responsibility' should be big factors. […] one fairly clean factor of rate is opportunity cost. someone in the US can get a much higher salary than someone in Europe, that's just a fact, even though there's no reason to assume their work will be more valuable."

---

## 7. Profit / Margin Signals

**Luciano (UTC+1) — 2021-10-06**
> "I think that it would cost us about 75K to do [HF Phase 3]. Anything above will be bonus."
*(Project cost ~$75k; client price $150–175k; margin ~50–57%)*

**Ricardo — 2023-04-20**
> "61 USD per hour on average"
**Thomas (UTC+7) — 2023-04-20**
> "essentially our profitability"

**Niall — 2024-10-31**
> "i'd love to sell more SLAs, those projects are pretty big in terms of margin (Audible/L.L Bean)"

**Ricardo — 2023-12-24**
> "Those free 7.5k are a third of the bonus"
*(SLA/passive income = ~$7.5k/quarter; ~1/3 of total pool at that time)*

---

## 8. Cost Structure

### Currency / Transfer Costs
- Labs absorbs USD→EUR/GBP conversion costs via Wise
- "The conversion rate is paid by Labs" — Sef M, 2024-04-26

**Thomas (UTC+7) — 2025-03-06**
> "a pretty small % of our revenue is in Euros, and we don't convert that internally to USD. in practice though, because we pay much more EUR than we earn EUR, we usually convert USD->EUR at the time of payment"
*(Most revenue is USD-denominated)*

### NumFOCUS / OSS Budget
**Chris Fonnesbeck — 2024-11-16:**
> "we currently have a general funds balance of about -$9000 (note the negative sign). We have a no cost extension to our CZI grant to spend the $44k remaining"

**Thomas (UTC+7) — 2024-11-25**
> "it seems like we ran out of numfocus funds, so you can't invoice them anymore for OSS hours. instead, just invoice OSS hours to PyMC Labs like before (limits apply)"

---

## 9. Financial Milestones

| Date | Milestone | Source |
|------|-----------|--------|
| ~mid-2020 | First contract: ~$5k | Core team member, Nov 2021 |
| Dec 2020 | Monthly revenue ~$85k (Roche $60k + Indigo $20k + Appgrowth $5k) | Thomas 2020-12-17 |
| Late 2021 | First-year revenue estimated at ~$1.5M | Luciano Nov 2021 |
| Oct 2021 | First $175k proposal sent (to Indigo) | Thomas 2021-10-05 |
| Oct 2021 | "At capacity" with clients | Thomas 2021-10-04 |
| Q2 2022 | Bonus pool = $0 | Thomas 2022-10-18 |
| Jul 2024 | Q2 2024 bonus pool ~$200k | Thomas 2024-07-26 |
| Q3 2024 | Bonus pool ~$223k (Bain driving) | Tom Knackstedt Oct 2024 |
| Q3 2025 | Bonus pool ~$288k | Thomas 2026-01-09 |
| 2025 | Bain (Coke) = $5M/year | Niall Jan 2025 |
| 2025 | Readystate = $2M/year | Thomas Jan 2025 |
| 2025 | Annual revenue $8M | (from sales channel) |

---

## 10. Pricing Signals for Website

These data points are relevant to the website but should NOT be published verbatim — they are internal pricing signals:

- **Project work (consulting):** $37k–$200k+ per SOW. "Big ticket" threshold escalated from $65k (2021) → $150k–$200k (2021+)
- **Workshops:** ~$20–30k/engagement (Thomas, from courses channel)
- **SLA/retainer model:** High-margin, low-hours; preferred growth vehicle
- **EAP (Expert Access Program):** $5k–$14k/month (from sales channel)
- **MMM Agent pilots:** $10k–$50k/month (from sales channel)
- **Annual contract size:** $500k–$5M for strategic partners
- **Client hourly rate implied:** $140/h+ (Thomas 2024-04-18)

---

## 11. Additional Signals

**Thomas (UTC+7) — 2020-09-24** (founding bonus structure rationale)
> "what if instead there is a bonus pool but it's *cross* projects. so one big bonus pool that e.g. every month gets divided by the number of hours people spent on whatever they worked on (project work, website, PM etc)"

**Thomas (UTC+7) — 2025-12-15**
> "we're investing in building out the sales team to help with that."

**Thomas (UTC+7) — 2025-01-04** (on long-term GenAI vision)
> "if he (and the team) succeeds, it could be $50mm revenue over the next 10 years (could also be much more)."

**Ben Vincent — 2022-04-26** (on productized consulting)
> "And maybe there is a niche of just bashing out some MMM code. If we could churn out 10 x $30k MMM jobs per year and each job could (in theory) be quick and easy"

*Extracted from #finances (2020-08-24 → 2026-03-11), 4,385 messages.*
