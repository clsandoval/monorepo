# Legacy PhilGEPS award notices — the unauthenticated ASMX layer

**Measured live 2026-08-09.** Corrects `research/ph-rfp-spike/DECISIONS.md`, which recorded that no
free 2026 award data exists anywhere (BetterGov stops at 2025). It exists, it is ungated, and it
carries the winning firm's **name and full street address**.

## The trick: send a JSON content-type on a GET

The award abstract page is Ext JS and renders ~1 line of server HTML, so scraping the page is
useless. The ASMX service layer behind it answers plain **GET** requests with query-string
parameters — but only if you send a JSON content type. Without the header every call returns a
useless generic error, which is what makes this look gated when it isn't:

```bash
# fails — looks like an auth wall, isn't one
curl "https://notices.philgeps.gov.ph/p4_webservices/GEPSR3_AwardNotice.asmx/AwardAbstract_GetNotice?refID=12335534&awardID=6173269"
#   -> {"Message":"There was an error processing the request.", ...}   (or an ASP.NET Runtime Error page)

# works
curl -H "Content-Type: application/json; charset=utf-8" \
  "https://notices.philgeps.gov.ph/p4_webservices/GEPSR3_AwardNotice.asmx/AwardAbstract_GetNotice?refID=12335534&awardID=6173269"
```

POSTing a JSON body does **not** work. GET + query params + that header is the combination.

Responses are wrapped: `{"d":{"IsSuccessfull":true,"ErrorMsg":null,"Value":[ ...rows... ]}}` — note
the misspelled `IsSuccessfull`. Payload is always in `.d.Value` as a list.

## How to find awards, and the ids you need

Rolling listing (HTML, parses fine): `Tender/RecentAwardNoticeUI.aspx?menuIndex=3` →
`"100 award notices found"`, 20 rows per page. Each row links out with the four ids every service
call needs:

```
../R4/R3_AwardNotice_AwardAbstract.html?RefID=<refID>&LineItemID=<n>&OrgID=<orgID>&AwardID=<awardID>
```

Regex `RefID=(\d+)&amp;LineItemID=(\d+)&amp;OrgID=(\d+)&amp;AwardID=(\d+)` over the listing HTML.
Note the page's own links are relative to `../R4/`, i.e. `/GEPSNONPILOT/R4/...` — the
`/GEPSNONPILOT/Tender/R4/...` path in the earlier notes 404s.

Method catalogue lives in `/GEPSNONPILOT/R4/scripts/R3_Globals.js` — 819 `R3_GLOBAL_URL_*`
constants, ~65 of them on `GEPSR3_AwardNotice.asmx`. Grep it rather than guessing method names.

## What each call returns

| Method | Params | Useful fields |
|---|---|---|
| `AwardAbstract_GetAwardedSupplier` | `awardID`, `refID` | **`OrgName`**, **`OrgAddress`** (full street address incl. province/region), `ContactPerson`, `Designation` |
| `AwardAbstract_GetNotice` | `refID`, `awardID` | `ApprovedBudget` (ABC), `ProcurementMode`, `Classification`, `Category`, **`AreaOfDelivery`** (province), `FundingSource`, `FundingInstrument`, `ControlNo`, `Title`, `ContactPerson`, `CreatedBy` |
| `AwardAbstract_GetAwardNotice` | `awardID` | **`ContractAmount`** (the winning price), `AwardDate`, `PublishDate`, `ContractNo`, `ContractEffectivityDate`, `ContractEndDate`, `ProceedDate`, `DocumentCount`, `BidderListCount`, `Approver`, `CreatedBy` |
| `AwardAbstract_GetLineItem` | `awardID` | per-line-item award detail |
| `AwardAbstract_GetAwardReasons` | `awardID` | award justification |
| `AwardAbstract_GetProcuringEntity` | `orgID`, `refID`, `lineItemID`, `awardID` | buyer org detail |

`refID` is sometimes JSON-quoted in the query string in the site's own calls
(`refID=%2212335534%22`) and sometimes bare. Bare works for the methods above; `GetListBidders`
wants it quoted. Copy whatever the browser network tab does per method rather than assuming.

## TRAP: `BidderListCount` is not a count of competing bidders

It returned **1 on all 10 awards sampled**, including one `Public Bidding` award, and
`AwardAbstract_GetListBidders` returns an empty `Value: []` even for that same award. Ten
single-bidder awards in a row across three procurement modes is not credible.

Conclusion: it counts **award recipients**, not bidders. Competing-bidder identities are the
buyer's authenticated view and are not public.

Do not publish "100% of awards had a single bidder". It is a very quotable wrong number and it is
exactly the failure mode the EDA's threshold-bunching section was written to avoid.

## What IS measurable, and why it matters

No field records *how* a winner found the notice — that is unobservable in principle. Two proxies
are computable entirely from public data:

1. **Outsider win rate.** Winner's `OrgAddress` province vs the notice's `AreaOfDelivery`. A firm
   registered outside the delivery province could only have found the notice remotely. High rates
   mean remote discovery demonstrably wins work; near-zero means the market is local and
   relationship-driven, which would undercut a discovery product for the high-value segment.
   Caveat: registered address ≠ operating footprint (a Manila-registered contractor may run a Cebu
   branch), and the bias runs toward *overstating* outsiderness.
2. **Repeat-winner concentration per procuring entity.** One firm taking N of an entity's last M
   awards is relationship or genuine specialisation; dispersed, non-local winners mean discovery
   matters.

### First 10-award sample (2026-08-09)

Median winning price **93.4% of ABC**; **2 of 10 landed at exactly 100.0%** of the ceiling. Modes
seen: Negotiated Procurement (SVP), Public Bidding, Shopping. Two concrete winners:

- `F & Q ENTERPRISES`, Purok-5 Inamnan Pequeño, **Guinobatan, Albay** → barangay streetlight job,
  `AreaOfDelivery: Albay`. Local, and therefore unresolvable either way.
- `DANILYN'S ENTERPRISES, INC.`, **Las Piñas City, NCR** → ₱3.2M of handloom weaving machines at
  100.0% of ABC. Specialised national supplier, not a local relationship.

## Coverage limit

The public listing is only the **rolling 100 most recent** awards, so a usable sample needs daily
accumulation (~3,000/month) — or an unauthenticated date-range query. `AwardNoticeList_GetList` and
`AwardNoticeListAuditor_GetList` exist in the catalogue and are unprobed; that is the next thing to
try before committing to a poller.

## Operational note

Hitting this host concurrently with another scraper earned a **403** within a few requests. It
recovered with ~3 s spacing and a browser `User-Agent`. Rate limiting here is real but forgiving —
budget total concurrency across *all* jobs, not per job.
