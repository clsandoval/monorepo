#import "lib.typ": *

#show: report.with(
  title: "The Philippine Procurement Board",
  subtitle: "An exhaustive read of every open government notice on both PhilGEPS systems — 22,068 notices, ₱207.1 billion of live contract value.",
  author: "PyMC Labs",
  date: "9 August 2026",
)

= Ten numbers

#wide[#grid(columns: (1fr, 1fr, 1fr), gutter: 5pt,
  stat("22,068", "open notices, both systems"),
  stat("₱207.1B", "live contract value"),
  stat("0.863", "Gini of contract value"),
)]
#v(5pt)
#wide[#grid(columns: (1fr, 1fr, 1fr), gutter: 5pt,
  stat("80%", "of value in top 10% of notices"),
  stat("60.4%", "close within six days"),
  stat("62.1%", "of deadlines fall Mon or Tue"),
)]
#v(5pt)
#wide[#grid(columns: (1fr, 1fr, 1fr), gutter: 5pt,
  stat("4,860", "distinct procuring entities"),
  stat("6,839", "distinct firm archetypes"),
  stat("306×", "notices priced at ₱4,950,000"),
)]

#v(6pt)
#callout[
  *The one-sentence version.* This is an enormous, atomised, fast-expiring market whose money is
  concentrated in a few hundred contracts, whose budgets are set by hand rather than costed, and
  whose official taxonomy cannot be trusted to find anything — which means the binding constraint on
  a bidder is not access to the data but the ability to be told, quickly, which four or five of
  22,068 notices are theirs.
]

= 1 · The corpus

Two systems are live simultaneously, mid-migration. PS Advisory 2026-19 ended Executive-branch
posting on legacy PhilGEPS 1.5 on 31 July 2026; non-Executive entities are on later batches and are
still posting there. A given procuring entity posts to exactly one system at a time, so the two
corpora are disjoint by construction — cross-searched in both directions, zero overlap.

#table(columns: (auto, auto, auto, auto),
  [System], [Notices], [Value], [Median ABC],
  [mPhilGEPS (modernised)], [4,288], [₱87.0B], [₱2,000,000],
  [Legacy PhilGEPS 1.5], [17,780], [₱120.0B], [₱877,192],
  [*Total*], [*22,068*], [*₱207.1B*], [₱1,000,000],
)

*Legacy is 81% of the board and it is the part nobody scrapes.* It is also a structurally different
market: 73% public bidding against mPhilGEPS's 58% small-value procurement, and 36% civil works. The
segment with real money is mostly in the corpus that every existing aggregator ignores.

ABC is present on 22,036 of 22,068 notices (99.9%). It is a labelled field on the detail page, not an
inference — no language model is required to read it.

#widefig("figures/02-abc-by-source.pdf",
  caption: [Contract size by system, log scale. The distributions barely overlap in their centre of
  mass: legacy is a high-volume, small-ticket LGU market; mPhilGEPS skews to larger national
  contracts. Treating them as one pool averages away the distinction that matters.])

= 2 · The money is not where the notices are

#flowfig("figures/01-concentration.pdf",
  caption: [Cumulative value against notices ranked by size. The curve's shape, not its level, is
  the finding.])

The value distribution is close to pathological. A Gini of *0.863* puts contract value more unequally
distributed than income in any country on earth.

#table(columns: (auto, auto, auto),
  [Slice of notices], [Share of notices], [Share of value],
  [Largest 1%], [220 notices], [*40.9%*],
  [Largest 10%], [2,204 notices], [*80.0%*],
  [Smallest 50%], [11,034 notices], [1.8%],
)

Mean ABC is ₱9,396,029; median is ₱1,000,000. The mean sits at the 76th percentile — a nine-to-one
ratio that says the average is describing a handful of contracts and nothing else. The 99th
percentile is ₱121.2M and the largest single notice is ₱13.72B.

#callout[
  *Consequence.* Any product decision framed as "serve contractors" is under-specified to the point
  of being wrong. The 11,034 notices below the median carry ₱3.7B between them — less than the top
  three notices combined. Volume and value are separate businesses with separate customers.
]

#widefig("figures/12-class-abc.pdf",
  caption: [Contract size by official classification. Civil works and infrastructure together are
  8,082 notices — 37% of the board — but ₱136.4B, or 66% of all value.])

= 3 · Budgets are set by hand, and it shows

This section is the one a procurement economist would read first, and it is invisible in any
aggregator that only lists notices.

#flowfig("figures/04-round-numbers.pdf",
  caption: [Share of budgets that are exact multiples of each round figure.])

*46.0% of all budgets are exact multiples of ₱1,000; 35.3% of ₱10,000; 21.7% of ₱100,000; 8.0% of a
full ₱1,000,000.* A costed estimate — quantities times unit prices plus contingency — does not land
on a round million once in twelve times. These are figures chosen to fit an appropriation, then
described as an estimate.

The four most common budgets in the corpus are ₱1,000,000 (341 notices), ₱500,000 (316),
*₱4,950,000 (306)*, and ₱100,000 (299).

That third value is the interesting one, and it motivates a formal test.

#flowfig("figures/03-threshold-bunching.pdf",
  caption: [Notices just below each threshold divided by notices just above, against placebo cut
  points at 1.3×, 1.7× and 2.3× the same threshold. Ratios above the placebo indicate genuine
  crowding rather than the ordinary downward slope of the size distribution.])

A raw below-versus-above count proves nothing: small contracts are more common than large ones, so
*any* cut point in a decaying distribution has more mass beneath it. Two corrections are needed.
First, exact-threshold notices are excluded from both bins — with 8% of budgets landing on an exact
million, leaving them in the upper bin manufactures fake anti-bunching at precisely the round numbers
under test. Second, each threshold is compared against placebo cut points of similar magnitude but
no procedural significance.

#table(columns: (auto, auto, auto, auto),
  [Threshold], [Below ÷ above], [Placebo], [Excess],
  [₱100K], [1.44], [0.85], [1.69×],
  [₱500K], [1.91], [1.13], [1.69×],
  [₱1M], [1.63], [1.20], [1.36×],
  [₱5M], [4.71], [1.31], [*3.59×*],
  [₱15M], [2.19], [0.95], [2.32×],
  [₱50M], [5.36], [1.24], [*4.34×*],
)

Every threshold shows excess crowding just beneath it, and the effect strengthens with contract size
— 3.59× at ₱5M and 4.34× at ₱50M. Combined with 306 notices priced at ₱4,950,000, exactly 1% under
the ₱5M line, the pattern is consistent with budgets being written to stay under procedural
thresholds rather than to reflect the cost of the work.

#callout[
  *Read this claim narrowly.* Bunching below a threshold is what contract-splitting looks like in
  aggregate data, but it is equally what a well-understood budget ceiling looks like when an agency
  scopes work to fit it. This analysis cannot separate the two, and nothing here identifies any
  individual notice as improper. What it does establish is that *thresholds, not costs, are shaping
  the numbers* — which is a fact about how to search this market, whatever its cause.
]

= 4 · Everything expires, and it expires on Monday

#flowfig("figures/05-lead-time.pdf",
  caption: [Share of the snapshot still open, by day. Median remaining life is 4.4 days.])

*21.6% of the board closes within 48 hours and 60.4% within six days.* Median remaining life is
4.4 days. The stock figure of "22,068 open opportunities" is therefore misleading as a measure of
what is actionable: two-thirds of it is gone before a weekly reviewer looks again.

Against that, inflow is relentless. Measuring it needs care: publish dates are only observable for
notices *still open*, so anything published three weeks ago and already closed is invisible, and any
average over a trailing window is biased downwards. Two unbiased routes agree. Little's law on the
stock and the mean 16-day notice lifetime gives *≈1,380 arrivals and departures per day*. The
freshest, uncensored days confirm it directly.

#table(columns: (auto, auto, auto),
  [Date], [Published], [Closing],
  [Mon 3 Aug], [826], [—],
  [Tue 4 Aug], [1,488], [—],
  [Wed 5 Aug], [3,012], [—],
  [Thu 6 Aug], [2,642], [—],
  [Fri 7 Aug], [2,141], [—],
  [Mon 10 Aug], [—], [*4,692*],
  [Tue 11 Aug], [—], [3,647],
  [Wed 12 Aug], [—], [2,128],
)

*The worst single day is a Monday: 4,692 notices expire at once*, 21% of the whole board, and 13,326
expire inside seven days. Peak observed publication was 3,012 in one day. So the steady-state
pipeline is roughly *1,500–3,000 detail fetches to ingest and 1,000–4,700 rows to expire per working
day* — an order of magnitude more churn than the stock figure suggests, and the reason a weekly
cadence cannot work.

#flowfig("figures/06-deadline-clock.pdf",
  caption: [Submission deadlines by hour (mPhilGEPS, where a time is recorded) and by weekday
  (both systems). Legacy records dates without times, so the clock panel is mPhilGEPS only.])

Two operational facts fall out, and neither is in any competitor's product:

- *Deadlines are a morning event.* 1,619 notices close at 10:00 and 1,452 at 09:00 — together more
  than four times the 14:00 count. A submission that is not lodged before mid-morning is late.
- *Deadlines are a Monday–Tuesday event.* Monday takes 7,233 closings and Tuesday 6,467 — *62.1%
  of the entire board across two days* — against just 1,355 on Friday. The real preparation deadline
  is therefore the preceding Friday afternoon, and the weekend is the crunch.

#widefig("figures/11-inflow.pdf",
  caption: [Publish dates of notices *that are still open*. The upward climb is not rising activity —
  it is right-censoring: notices published weeks ago have already closed and left the corpus. Only
  the last few days are unbiased, which is why inflow is estimated from those and from Little's law.])

= 5 · There is no centre of gravity

#widefig("figures/07-geography.pdf",
  caption: [Notices by delivery location. Metro Manila, highlighted, is under a tenth of the board.])

*Metro Manila accounts for 2,187 notices — 9.9%.* Reaching 80% of the corpus requires *44* separate
provinces. Batangas (788), Cebu (693), Iloilo (599), Laguna (510) and Leyte (505) each carry a real
share, and the tail is long and thin.

A capital-city product covers a tenth of this market. The dispersion also explains why the
procurement graveyard is littered with projects that indexed the national portal and stopped: the
work is in the provinces, and the provinces are the part that is tedious to normalise.

Delivery location is missing entirely on 8.7% of notices — genuinely blank on the source page, not a
parsing failure. Any geographic filter must therefore decide what to do with one notice in eleven,
and silently dropping them is the wrong answer.

= 6 · The demand side is atomised

#widefig("figures/08-category-band.pdf",
  caption: [Top twelve business categories by contract size band. Construction and its supply chain
  dominate both the count and the value.])

Construction Projects alone is 6,253 notices (28.3%); adding Construction Materials and Supplies
(1,467) and heavy construction services puts construction and its supply chain near 40% of the board.
Consulting Services is 179 notices — 0.8%. Titles containing the word "software" number *44*, or 0.2%.

#flowfig("figures/10-agencies.pdf",
  caption: [The twelve largest procuring entities. Note the axis: the largest is under 300 notices.])

*4,860 distinct procuring entities publish to these systems, and the twenty largest account for only
8.9% of the board.* 46.5% of entities have published exactly one open notice. There is no dominant
buyer to build a relationship with — not even DPWH, whose largest single district office contributes
185 notices, or 0.8%.

By tier: municipalities 5,822 notices, barangays 3,690, cities 3,171, provinces 1,883, national
departments 3,569. *Local government accounts for roughly two-thirds of the board*, down to
individual barangays.

#flowfig("figures/09-archetype-thinness.pdf",
  caption: [Notices per firm archetype, defined as category × size band × province, log–log. The
  distribution is close to a power law over three decades.])

Defining a firm archetype as category × size band × province yields *6,839* distinct archetypes.
The largest — general merchandise, micro, Metro Manila — has 289 open notices. *The median archetype
has exactly one, and 59.7% have exactly one.* Reaching half the board takes 504 archetypes.

#callout[
  *The churn mechanism.* A precisely profiled firm sees single digits per session, which validates
  aggressive curation — but the median archetype sees roughly one notice every ten days. Serve a
  narrow profile literally and the user opens an empty feed most mornings and leaves. Deliberate
  widening — adjacent provinces, adjacent categories, lot-level decomposition of multi-lot notices —
  is not a nice-to-have; it is what keeps the product from appearing broken.
]

= 7 · What the data says

1. *Pick volume or value; they are different companies.* 11,034 notices below the median carry 1.8%
   of the money. 2,204 notices carry 80% of it. The first is a high-churn, low-price, many-user
   business; the second is a few hundred firms for whom one missed bid dwarfs a decade of
   subscription fees.
2. *The official taxonomy cannot be the filter.* Category is self-declared by the buyer and wrong
   often enough to matter — notices filed as Goods that are civil works, one filed as Consulting
   Services that is a printing job. Classification is a hint, not a key.
3. *Daily cadence is not a feature choice, it is arithmetic.* 60.4% six-day expiry against 583 new
   notices a weekday means a weekly reviewer structurally misses most of the market.
4. *Friday afternoon is the real deadline.* 62.1% of closings are Monday or Tuesday morning. A
   product that surfaces a Monday 09:00 deadline on Monday at 08:00 is worthless.
5. *The provinces are the product.* Metro Manila is 9.9%; 44 provinces are needed for 80%; two-thirds
   of notices come from LGUs down to barangay level. A normalised local-government registry is the
   asset here, and it is built by labour, not by cleverness.
6. *Thresholds shape the numbers, so search must be threshold-aware.* Excess mass sits below every
   procedural line, most sharply at ₱5M and ₱50M, and ₱4,950,000 recurs 306 times. A firm whose
   capacity straddles ₱5M should be shown both sides of that line explicitly.
7. *Software is not a market here.* 44 notices in 22,068. Construction and supply are the market.

= 8 · Method, and what would move these numbers

Both systems were enumerated in full rather than sampled — 215 listing pages plus 4,288 detail
fetches on mPhilGEPS, 893 pager offsets plus 17,780 detail fetches on legacy — on 8–9 August 2026.
Detail fields are parsed as labelled key–value structure, never by line adjacency: an adjacency
parser silently wrote the *following field's label* into any empty field, corrupting delivery location
on 13% of notices while reporting a 100% capture rate. Days-to-close is measured against a fixed
reference of 9 August 2026.

Four caveats bound everything above.

- *Snapshot, not panel.* Every figure describes the board on one day. Lead-time and inflow statistics
  are stable in shape, but composition shifts with the migration between systems.
- *Business category is self-declared* and, per a 337-notice model-tagged audit, materially wrong in
  a low single-digit percentage of cases. Category-level counts are indicative.
- *Bunching is a pattern, not a finding about any notice.* Contract splitting and honest
  scoping-to-budget are observationally identical in this data.
- *The deepest text is untouched.* Attached bid documents and supplements — present on every detail
  page examined — were not fetched. Notice descriptions are largely boilerplate; the real scope lives
  in the attachments, and no competitor surfaces them either.
