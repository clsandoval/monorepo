# PhilHealth (Philippine Health Insurance Corporation) — angkin.ph SEO Spec

## Hub Page

- **URL:** /philhealth/
- **H1:** "PhilHealth Calculators & Tools — Philippines"
- **Overview:**

PhilHealth administers the National Health Insurance Program (NHIP) covering approximately 112 million Filipinos under universal enrollment mandated by Republic Act No. 11223 (Universal Health Care Act of 2019). With 59.3 million registered members and 36.3 million direct contributors, PhilHealth touches nearly every Filipino household — yet its systems remain opaque to the patients and employers who depend on them.

angkin.ph's PhilHealth hub provides free, statute-accurate calculators for every PhilHealth computation: premium contribution computation with the 2025 rate schedule, benefit eligibility verification by member category, case rate lookup for all ~9,000 medical and procedural case rates (including the 50% adjustment under PC2024-0037), and OFW contribution portability. Every tool cites the specific PhilHealth circular or RA 11223 section governing its formula, so users can verify against the law.

The case rate transparency tool addresses the single largest information asymmetry in Philippine healthcare: no patient-facing tool exists to verify what PhilHealth is required to deduct from a hospital bill before discharge. Hospitals process ~12 million claims per year totaling over P164 billion, yet patients have no way to independently verify whether the correct case rate was applied. angkin.ph changes that.

- **Hub FAQs:**
  1. **What is the PhilHealth contribution rate for 2025?** The premium rate is 5% of Basic Monthly Salary (BMS), with an income floor of P10,000 (minimum premium P500/month) and ceiling of P100,000 (maximum premium P5,000/month). For employed members, the cost is split 50/50 between employer and employee (2.5% each). Self-employed, voluntary, and OFW members pay the full 5%. (RA 11223 Sec. 10-11; PhilHealth Advisory PA2025-0002)
  2. **How do I know if my PhilHealth membership is active?** Eligibility depends on your member category: employed members need at least 3 posted monthly contributions within the last 6 months before benefit availment; self-employed/voluntary members need at least 9 contributions within the last 12 months. Lifetime members (120+ cumulative months + retirement age) pay nothing further. (RA 11223 Sec. 7, 9)
  3. **What is the PhilHealth case rate system?** PhilHealth uses approximately 9,000 fixed case rates — a predetermined peso amount per diagnosis or procedure that is deducted from your hospital bill. After the PC2024-0037 circular (effective January 1, 2025), many case rates increased by 50%. For example, normal spontaneous delivery is P9,750 (hospital) and cesarean section is P19,000.
  4. **Is there a penalty for late PhilHealth contribution remittance?** Yes. Employers face a 3% per month compounded penalty on unremitted contributions. Criminal penalties under RA 11223 Sec. 44 include P50,000-P100,000 fine and 6-12 months imprisonment.
  5. **What does PhilHealth cover for OFWs?** OFW premium = declared monthly income x 5% (floor P500, ceiling P5,000/month). Annual payment option available. Coverage extends to qualified dependents in the Philippines during deployment. There is no bilateral PhilHealth agreement — OFWs must independently maintain membership.
  6. **What is the PhilHealth "no co-payment" policy?** Under RA 11223 Sec. 9, PhilHealth-accredited hospitals are not supposed to charge patients beyond the case rate for covered conditions. In practice, this policy is widely violated. angkin.ph's case rate tool helps patients verify what should have been deducted.
  7. **Who qualifies as a PhilHealth dependent?** Your PhilHealth membership covers your declared dependents: legally married spouse (if uninsured), children under 21 (or incapacitated regardless of age), and dependent parents who are senior citizens without their own coverage. Dependents must be declared in your Member Data Record (MDR).
  8. **What is a PhilHealth Z Benefit?** Z Benefits cover 20 catastrophic illness packages with annual limits ranging from P200,000 (some cancers) to P2,140,000 (kidney transplant from deceased donor). Eligibility requires active membership, no prior Z benefit availment within the qualifying period, and treatment at a Z-accredited facility.

- **Related Hubs:**
  - **/sss/** — SSS contributions are computed from the same payroll base as PhilHealth. Employers remit both simultaneously.
  - **/pagibig/** — Pag-IBIG is the third mandatory government contribution deducted alongside PhilHealth.
  - **/gsis/** — Government employees' health insurance is also through PhilHealth, but their other social insurance (pension) is GSIS, not SSS.
  - **/bir/** — PhilHealth premiums are an allowable deduction for self-employed taxpayers computing income tax.

- **Structured Data:** CollectionPage + FAQPage

---

## Tools

### B-PHI-1: PhilHealth Case Rate Benefit Application Calculator

- **URL:** /philhealth/case-rate-calculator
- **H1:** "PhilHealth Case Rate Calculator 2025 — Free Online Tool"
- **Opportunity Score:** 4.00 (Rank #13)
- **TAM:** P636M/year (Consumer P156M at P99/event + Professional P480M); SAM P127M; SOM Y1 P6.4M
- **Professional Fee Displaced:** No formal professional market exists — hospitals process claims internally. Informal fixers/expediters charge P2,000-P10,000 per contested claim. The value proposition is transparency, not professional displacement.
- **Governing Statute:** PhilHealth Circular PC2024-0037 (50% case rate adjustment effective Jan 1, 2025); PC2024-0012 (case rate rules revision); PC2024-0023 (hemodialysis 156 sessions); PC2024-0036 (peritoneal dialysis Z package); RA 11223 Sec. 9
- **Target Keywords:**
  - Primary: "PhilHealth case rate 2025"
  - Secondary: "PhilHealth case rate table", "PhilHealth coverage for hospitalization", "PhilHealth benefit calculator", "PhilHealth case rate list"
  - Long-tail: "PhilHealth case rate for cesarean section 2025", "PhilHealth case rate for normal delivery 2025", "PhilHealth hemodialysis coverage 156 sessions", "PhilHealth case rate for heart attack fibrinolysis", "PhilHealth Z benefit kidney transplant coverage", "how much does PhilHealth cover for surgery", "PhilHealth out of pocket calculator hospitalization", "PhilHealth case rate increase 2025 PC2024-0037"
- **How It Works Content:**
  1. Search for your diagnosis or medical procedure from the catalog of ~9,000 case rates maintained by PhilHealth per PC2024-0037 and prior circulars
  2. The tool displays the fixed PhilHealth case rate amount — split between facility share and professional fee share — that the hospital is required to deduct from your bill
  3. For 2025: most case rates increased by 50% per PC2024-0037, except excluded conditions listed in Annex C (e.g., cataract, hemodialysis)
  4. Second case rate eligibility: specific conditions in PC2024-0037 Annex D allow two case rates in one admission — the tool checks for additive eligibility
  5. Z Benefits: for catastrophic illness packages, the tool shows the annual limit and checks whether the condition qualifies for one of 20 Z benefit categories
- **Step-by-Step Guide:**
  1. Enter your diagnosis or medical condition (plain language or ICD-10 code)
  2. The calculator searches the ~9,000 case rate catalog and displays matching results
  3. View the total case rate amount and the facility/professional fee breakdown
  4. If applicable, check second case rate eligibility for concurrent conditions
  5. Enter your estimated total hospital bill to compute expected out-of-pocket: Total Bill minus Case Rate = Your Cost
  6. For Z benefit conditions: view the annual coverage limit and facility accreditation requirement
  7. Print or save the case rate citation to present to the hospital billing department
- **FAQ Topics:**
  1. What is a PhilHealth case rate and how does it reduce my hospital bill?
  2. How much does PhilHealth cover for normal delivery in 2025?
  3. How much does PhilHealth cover for cesarean section in 2025?
  4. What is the PhilHealth coverage for hemodialysis — how many sessions per year?
  5. Can I get two PhilHealth case rates in one hospital admission?
  6. What are PhilHealth Z Benefits and which diseases are covered?
  7. What should I do if the hospital charges me more than the case rate?
  8. Did PhilHealth case rates increase in 2025? Which procedures are excluded from the increase?
- **Related Tools:** B-PHI-3 (eligibility check — verify you qualify before using case rate), B-PHI-2 (premium computation — must be current to claim), A-SSS-2 (SSS maternity benefit is separate from PhilHealth delivery case rate), A-SSS-4 (SSS sickness benefit is separate from PhilHealth hospitalization coverage)
- **Structured Data:** SoftwareApplication — name: "PhilHealth Case Rate Calculator 2025", applicationCategory: "HealthApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

### B-PHI-2: PhilHealth Premium Contribution Calculator

- **URL:** /philhealth/contribution-calculator
- **H1:** "PhilHealth Contribution Calculator 2025 — Free Online Tool"
- **Opportunity Score:** 3.85 (Rank #19)
- **TAM:** P27,875M/year (Consumer P27,216M + Professional P659M); SAM P1,394M; SOM Y1 P13.9M
- **Professional Fee Displaced:** HR/payroll outsourcing including PhilHealth compliance P875-P1,750/employee/month (full-service); HR compliance audit P25,000-P150,000 per engagement; bookkeepers P300-P800/month for individual payroll reconciliation
- **Governing Statute:** RA 11223 Sec. 10-11; PhilHealth Advisory PA2025-0002; PhilHealth Contribution Table v2 (2024-2025)
- **Target Keywords:**
  - Primary: "PhilHealth contribution table 2025"
  - Secondary: "PhilHealth contribution calculator", "PhilHealth monthly contribution", "PhilHealth premium rate 2025", "how to compute PhilHealth contribution"
  - Long-tail: "PhilHealth contribution for self-employed 2025", "PhilHealth contribution for OFW 2025", "PhilHealth employer employee share computation", "PhilHealth minimum contribution P500", "PhilHealth maximum contribution P5000", "PhilHealth kasambahay contribution who pays", "PhilHealth late remittance penalty 3% per month", "PhilHealth PEN schedule remittance deadline"
- **How It Works Content:**
  1. Determine Basic Monthly Salary (BMS): fixed regular pay only — excludes allowances, overtime, commissions, bonuses, per RA 11223 Sec. 10
  2. Apply premium rate: BMS x 5% = total monthly premium for 2024-2025 per PhilHealth Advisory PA2025-0002
  3. Apply floor and ceiling: if BMS is below P10,000, use P10,000 (minimum premium P500); if above P100,000, use P100,000 (maximum premium P5,000)
  4. Cost sharing: employed = 2.5% employee + 2.5% employer; self-employed/voluntary/OFW = full 5%; kasambahay earning P5,000 or less = employer pays full 5%
  5. Remittance deadline: based on Payer Employer Number (PEN) ending digit — day 11-15 (PEN 0-4) or day 16-20 (PEN 5-9) of the following month
- **Step-by-Step Guide:**
  1. Enter your Basic Monthly Salary (BMS) — regular pay excluding variable components
  2. Select your member type: employed, self-employed, voluntary, OFW, or kasambahay
  3. The calculator applies the 5% rate with floor (P10,000) and ceiling (P100,000)
  4. For employed members: view the employer share and employee share breakdown
  5. For employers: enter PEN ending digit to see your remittance deadline
  6. If computing late penalties: enter months of delinquency for the 3%/month compounded penalty
  7. Review the annual premium summary and total employer obligation
- **FAQ Topics:**
  1. What is the PhilHealth premium rate for 2025?
  2. What is included in "Basic Monthly Salary" for PhilHealth — are allowances included?
  3. What is the minimum and maximum PhilHealth monthly contribution?
  4. How is PhilHealth contribution split between employer and employee?
  5. Do kasambahay (household workers) pay their own PhilHealth contribution?
  6. What is the penalty for late PhilHealth employer remittance?
  7. How do self-employed members compute their PhilHealth contribution?
  8. When is the PhilHealth remittance deadline based on PEN number?
- **Related Tools:** A-SSS-3 (SSS contribution computed alongside PhilHealth from same payroll), C-HDMF-3 (Pag-IBIG contribution — third mandatory deduction), B-PHI-3 (eligibility depends on contribution count), B-PHI-4 (OFW-specific contribution rules)
- **Structured Data:** SoftwareApplication — name: "PhilHealth Contribution Calculator 2025", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

### B-PHI-3: PhilHealth Benefit Eligibility Checker

- **URL:** /philhealth/eligibility-checker
- **H1:** "PhilHealth Benefit Eligibility Checker — Free Online Tool"
- **Opportunity Score:** 3.75 (Rank #39)
- **TAM:** P13,667M/year (Consumer P12,888M + Professional P779M); SAM P683M; SOM Y1 P6.8M
- **Professional Fee Displaced:** No discrete market exists — denied-benefit lawyers charge P5,000-P50,000 for disputes; hospital social workers navigate claims informally
- **Governing Statute:** RA 11223 Sec. 7, 9; PhilHealth Advisory PA2025-0002; PhilHealth Circulars on individual membership categories
- **Target Keywords:**
  - Primary: "PhilHealth eligibility check"
  - Secondary: "PhilHealth active membership checker", "PhilHealth contribution requirements for coverage", "PhilHealth benefit eligibility", "how to check PhilHealth membership status"
  - Long-tail: "PhilHealth 3 in 6 rule for employed members", "PhilHealth 9 in 12 rule for self-employed", "PhilHealth lifetime member 120 months", "PhilHealth benefit denial lapsed contributions", "PhilHealth dependent coverage spouse children parents", "how many PhilHealth contributions needed for hospitalization", "PhilHealth posted vs paid contribution difference", "PhilHealth eligibility for OFW dependents in Philippines"
- **How It Works Content:**
  1. Determine member category: employed (direct contributor), self-employed/voluntary, OFW, sponsored/indigent, or lifetime member, per RA 11223 Sec. 7
  2. Apply the category-specific contribution-count gate: employed needs 3 posted contributions in the 6 months before availment; self-employed needs 9 in the 12 months before availment; OFW must be within membership validity period; lifetime member needs 120+ cumulative months + retirement age
  3. Three-step eligibility check: (a) Is the member in an active category? (b) Does the contribution count meet the lookback threshold? (c) Is the healthcare facility PhilHealth-accredited?
  4. Dependent coverage: spouse, children under 21, incapacitated children, and dependent senior citizen parents — all must be declared in the Member Data Record (MDR)
  5. Key distinction: "posted" contributions (remitted and credited by PhilHealth) count — not merely "paid" contributions deducted by employer but not yet remitted
- **Step-by-Step Guide:**
  1. Select your PhilHealth member category (employed, self-employed, voluntary, OFW, indigent, lifetime)
  2. Enter your total cumulative contributions and contributions within the required lookback window
  3. The eligibility checker validates whether you meet the contribution-count gate for your category
  4. Enter dependents to check if they are covered under your membership
  5. View your eligibility status: active (eligible for benefits), lapsed (insufficient contributions), or lifetime (no further contributions needed)
  6. If lapsed: see how many additional contributions are needed and by when to restore eligibility
- **FAQ Topics:**
  1. How many PhilHealth contributions do I need to be eligible for hospitalization?
  2. What is the difference between "posted" and "paid" PhilHealth contributions?
  3. What is the PhilHealth 3-in-6 eligibility rule for employed members?
  4. What is the PhilHealth 9-in-12 rule for self-employed members?
  5. How do I become a PhilHealth lifetime member?
  6. Are my parents covered under my PhilHealth membership?
  7. What happens to my PhilHealth eligibility if my employer fails to remit contributions?
  8. How do I add dependents to my PhilHealth Member Data Record (MDR)?
- **Related Tools:** B-PHI-2 (contribution computation — determines whether you meet the count), B-PHI-1 (case rate benefit — only accessible if eligible), B-PHI-4 (OFW-specific eligibility rules), A-SSS-3 (SSS eligibility gates work similarly)
- **Structured Data:** SoftwareApplication — name: "PhilHealth Benefit Eligibility Checker", applicationCategory: "HealthApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

### B-PHI-4: OFW PhilHealth Contribution & Portability Calculator

- **URL:** /philhealth/ofw-contribution-calculator
- **H1:** "OFW PhilHealth Contribution & Portability Calculator — Free Online Tool"
- **Opportunity Score:** 3.50 (Rank #59)
- **TAM:** Not independently sized in detailed TAM analysis; estimated from shared PhilHealth population — 3.2M OFW PhilHealth members, ~P150-P300M addressable
- **Professional Fee Displaced:** No dedicated professional service — direct-pay system; recruitment agencies assist as part of deployment paperwork
- **Governing Statute:** RA 11223 Sec. 5-6 (universal coverage); OFW-specific implementing rules; PhilHealth foreign posts circular
- **Target Keywords:**
  - Primary: "OFW PhilHealth contribution"
  - Secondary: "PhilHealth for OFW 2025", "OFW PhilHealth payment", "PhilHealth OFW contribution rate", "how to pay PhilHealth abroad"
  - Long-tail: "OFW PhilHealth contribution calculator 2025", "OFW PhilHealth annual payment how much", "PhilHealth coverage for OFW family in Philippines", "OFW PhilHealth lapsed what happens", "where to pay PhilHealth abroad OFW", "PhilHealth OFW voluntary membership return to Philippines", "PhilHealth OFW dependent coverage while deployed", "OFW PhilHealth contribution P500 minimum"
- **How It Works Content:**
  1. OFW premium = declared monthly income x 5%, with floor P500/month and ceiling P5,000/month, per RA 11223 Sec. 5 and OFW implementing rules
  2. Annual payment option: monthly rate x 12 months as one-time payment — available for convenience
  3. Coverage scope: member plus qualified dependents in the Philippines (spouse, children under 21, dependent parents) during the OFW's deployment period
  4. No bilateral PhilHealth agreement exists with any country — PhilHealth is separate from SSS portability agreements; OFWs must independently maintain membership
  5. Lapse risk: if OFW contributions lapse, Philippine-based dependents lose PhilHealth benefit eligibility — the most common OFW insurance pain point
- **Step-by-Step Guide:**
  1. Enter your declared monthly income as OFW
  2. The calculator applies the 5% rate with P500 floor and P5,000 ceiling
  3. View monthly and annual payment options
  4. Enter your dependents in the Philippines to confirm they are covered
  5. Check your current contribution status against the eligibility lookback window
  6. Review available payment channels: PhilHealth accredited collecting agents abroad, PhilHealth foreign posts, or the Electronic Premium Remittance System (EPRS)
- **FAQ Topics:**
  1. How much is the PhilHealth contribution for OFW in 2025?
  2. Can I pay PhilHealth annually as an OFW instead of monthly?
  3. Are my family members in the Philippines covered by my OFW PhilHealth?
  4. What happens if my PhilHealth as an OFW lapses while I am abroad?
  5. Where can I pay PhilHealth while working overseas?
  6. Does PhilHealth have bilateral agreements like SSS with other countries?
  7. How do I continue PhilHealth membership when I return to the Philippines?
  8. Is PhilHealth contribution mandatory for OFWs?
- **Related Tools:** B-PHI-2 (standard contribution computation for domestic workers), B-PHI-3 (eligibility check — verify OFW dependents' coverage), E-OFW-2 (total OFW pre-departure cost includes PhilHealth), A-SSS-3 (SSS contribution — separate from PhilHealth for OFWs)
- **Structured Data:** SoftwareApplication — name: "OFW PhilHealth Contribution Calculator", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

## Blog Posts

### Blog Post 1: PhilHealth Case Rates 2025 — Complete Updated List After PC2024-0037

- **URL:** /philhealth/philhealth-case-rates-2025-complete-guide
- **Target Query:** "PhilHealth case rate 2025"
- **Content Outline:**
  1. Introduction: what PC2024-0037 changed — 50% increase effective January 1, 2025 for most conditions
  2. Key case rates every Filipino should know: normal delivery (P9,750), cesarean (P19,000), hemodialysis (P6,350/session x 156/year), angioplasty (P524,000), kidney transplant (P1,000,000+)
  3. Excluded conditions (Annex C): cataract, hemodialysis, and other conditions that did NOT receive the 50% increase
  4. Second case rate rules (Annex D): when two case rates apply in one admission
  5. Z Benefits: the 20 catastrophic illness packages and their coverage limits
  6. How the "no co-payment" policy (RA 11223 Sec. 9) is supposed to work — and why hospitals still charge extra
  7. How to use the angkin.ph case rate calculator before going to the hospital
- **CTA Tools:** B-PHI-1 (case rate calculator), B-PHI-3 (eligibility checker)
- **Related Posts:** "PhilHealth Contribution Table 2025", "How to Check Your PhilHealth Eligibility"

### Blog Post 2: PhilHealth Contribution Table 2025 — Rates, Floor, Ceiling, and Deadlines

- **URL:** /philhealth/philhealth-contribution-table-2025
- **Target Query:** "PhilHealth contribution table 2025"
- **Content Outline:**
  1. The 5% premium rate for 2024-2025 with income floor (P10,000) and ceiling (P100,000)
  2. Full contribution table: BMS ranges with employee share, employer share, and total premium
  3. Self-employed and voluntary member contributions: full 5% burden, minimum P500/month
  4. OFW contribution: declared income x 5%, annual payment option
  5. Kasambahay rules: employer pays full premium if salary is P5,000 or below
  6. PEN-based remittance schedule: deadline by employer number ending digit
  7. Late penalty: 3%/month compounded + criminal liability under RA 11223 Sec. 44
  8. Common employer errors: including non-BMS components, missing the PEN deadline
- **CTA Tools:** B-PHI-2 (contribution calculator), A-SSS-3 (SSS contribution — computed alongside), C-HDMF-3 (Pag-IBIG contribution)
- **Related Posts:** "SSS Contribution Table 2025", "Pag-IBIG Contribution Table 2025"

### Blog Post 3: How to Check Your PhilHealth Eligibility Before Going to the Hospital

- **URL:** /philhealth/how-to-check-philhealth-eligibility
- **Target Query:** "how to check PhilHealth eligibility"
- **Content Outline:**
  1. Why eligibility matters: denial of benefits at discharge is the most common PhilHealth complaint
  2. The contribution-count gates by member type: 3-in-6 (employed), 9-in-12 (self-employed), OFW validity period, lifetime (120 months)
  3. The "posted" vs. "paid" distinction: why employer deductions that are not remitted do not count
  4. How to check your status: PhilHealth Member Portal, PhilHealth hotline, or angkin.ph eligibility checker
  5. How to add dependents to your MDR: spouse, children, parents
  6. What to do if you discover you are lapsed: how many contributions are needed and how quickly
  7. Accreditation check: verify your hospital and doctor are PhilHealth-accredited
- **CTA Tools:** B-PHI-3 (eligibility checker), B-PHI-2 (contribution calculator to verify payments), B-PHI-1 (case rate to estimate coverage)
- **Related Posts:** "PhilHealth Case Rates 2025", "PhilHealth Contribution Table 2025"

### Blog Post 4: OFW PhilHealth — How to Keep Your Family Covered While Working Abroad

- **URL:** /philhealth/ofw-philhealth-family-coverage-guide
- **Target Query:** "OFW PhilHealth coverage family"
- **Content Outline:**
  1. Why OFW PhilHealth lapses are dangerous: dependents denied benefits during hospitalization
  2. How OFW contribution works: 5% of declared income, P500 floor, P5,000 ceiling
  3. Annual vs. monthly payment: pros and cons for OFWs with variable contracts
  4. Payment channels abroad: accredited collecting agents, PhilHealth foreign posts, EPRS online
  5. Dependent coverage: who is covered and how to update your MDR from abroad
  6. What happens when you return to the Philippines: transition from OFW to employed or voluntary
  7. PhilHealth vs. SSS portability: PhilHealth has no bilateral agreements — fully independent
  8. Checklist: ensuring continuous coverage throughout your deployment
- **CTA Tools:** B-PHI-4 (OFW contribution calculator), B-PHI-3 (eligibility checker for dependents), E-OFW-2 (total pre-departure cost)
- **Related Posts:** "PhilHealth Contribution Table 2025", "OFW Total Pre-Departure Cost Calculator"
