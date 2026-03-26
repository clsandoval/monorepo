# GSIS (Government Service Insurance System) — angkin.ph SEO Spec

## Hub Page

- **URL:** /gsis/
- **H1:** "GSIS Calculators & Tools — Philippines"
- **Overview:**

The Government Service Insurance System (GSIS) provides compulsory social insurance to all civilian government employees in the Philippines — approximately 2.12 million active members and 646,000 pensioners as of 2025. Unlike SSS (which covers the private sector), GSIS members face a unique complexity: four coexisting retirement laws (RA 8291, RA 660, RA 1616, and PD 1146) whose applicability depends on date of entry into government service. This creates a law-selection problem before any benefit formula is even applied. Once the applicable law is determined, each benefit type has its own deterministic formula — but the Option 1 vs. Option 2 retirement election is an irreversible, high-stakes NPV decision that GSIS provides no tool to analyze.

angkin.ph's GSIS hub provides free, statute-accurate calculators for every GSIS computation a government employee, retiree, or agency HR officer encounters: BMP retirement pension with Option 1 vs. Option 2 NPV comparison, legacy law selection optimizer for pre-1997 employees, contribution computation with criminal liability exposure, disability benefit with LWOP tracking, survivorship and death benefit, and RA 7699 portability totalization for split-career workers. Every calculator cites the specific RA 8291 section, RA 660 provision, or GSIS IRR rule governing its formula.

In 2025, GSIS disbursed P194 billion in total benefits. GSIS's own computation materials are a static PDF published in 2014, and its web application firewall blocks external access to annual reports. angkin.ph fills this information gap with interactive, transparent tools that surface the math GSIS branch officers compute behind closed doors.

- **Hub FAQs:**
  1. **How is the GSIS retirement pension (BMP) computed?** BMP = 0.025 x (Average Monthly Compensation + P700) x Pensionable Period of Service (years). AMC is the average of your last 36 months of basic salary (excluding allowances, bonuses, RATA). BMP is capped at 90% of AMC (requires 36+ years to hit the cap). (RA 8291 Sec. 9-12)
  2. **What is the difference between GSIS Option 1 and Option 2?** Option 1 provides a lump sum of 60 x BMP at retirement, with monthly pension starting after 5 years. Option 2 provides a cash payment of 18 x BMP at retirement plus immediate lifetime monthly pension. The choice is irreversible and depends on your age, life expectancy, and investment alternatives. No GSIS tool currently models this NPV comparison.
  3. **What retirement laws apply to government employees who entered service before 1997?** Employees who entered before June 1, 1977 can choose from RA 660, RA 1616, PD 1146, or RA 8291. Those who entered between June 1, 1977 and May 31, 1997 can choose RA 660, PD 1146, or RA 8291. Post-June 24, 1997 entrants are under RA 8291 only. (RA 660; RA 1616; PD 1146; RA 8291)
  4. **What is the GSIS contribution rate?** Total premium is 21% of monthly compensation: 9% employee personal share + 12% employer/agency share. Remittance is due within the first 10 days of the following month. Agency heads face criminal liability (6 years 1 day to 12 years imprisonment) for late remittance. (RA 8291 Sec. 5-7, 52)
  5. **What is RA 7699 portability totalization?** If you worked in both government and private sectors without qualifying for pension in either GSIS or SSS independently, RA 7699 allows combining (totalizing) your credited service from both systems. Each system then pays its proportionate share. (RA 7699)
  6. **What is the GSIS survivorship pension?** When a member dies (in service or after retirement), primary beneficiaries receive 50% of BMP as the basic survivorship pension + up to 50% for dependent children (shared equally). Total is capped at 100% of BMP. Funeral benefit is P30,000. (RA 8291 Sec. 21-25)
  7. **How is GSIS disability benefit computed?** Permanent Total Disability = BMP for life + 18 x BMP cash if the member has 180+ contributions and is in service. Temporary Total Disability = 75% of daily salary (floor P70, ceiling P340/day) for up to 120 days. Permanent Partial Disability = (BMP / 30) x LWOP days. (RA 8291 Sec. 16-20)
  8. **How many government employees retire each year?** Approximately 68,000 new government retirees are added to the GSIS pension roll annually, based on ADB Technical Assistance data showing retirement roll growth from 373,949 (2018) to 442,242 (2019).

- **Related Hubs:**
  - **/sss/** — SSS is the private-sector equivalent of GSIS. Workers switching between government and private sectors need both (RA 7699 portability).
  - **/philhealth/** — Government employees contribute to PhilHealth in addition to GSIS (PhilHealth covers both sectors).
  - **/pagibig/** — Pag-IBIG covers both government and private sector employees. Government employees contribute to Pag-IBIG alongside GSIS.
  - **/bir/** — GSIS retirement pension is partially tax-exempt; understanding the BIR tax treatment of retirement benefits matters for Option 1 vs. Option 2 analysis.

- **Structured Data:** CollectionPage + FAQPage

---

## Tools

### D-GSIS-1: GSIS BMP Retirement Pension + Option 1/2 NPV Decision Calculator

- **URL:** /gsis/retirement-pension-calculator
- **H1:** "GSIS Retirement Pension Calculator — Free Online BMP & Option 1 vs. Option 2 Tool"
- **Opportunity Score:** 4.05 (Rank #8 overall; highest in GSIS cluster)
- **TAM:** P372M/year (Consumer P199M realistic + Professional P173.5M); SAM P74M; SOM Y1 P3.7M
- **Professional Fee Displaced:** Pre-retirement financial advisors P5,000-P20,000 per consultation; labor lawyers P20,000+ for full retirement planning analysis; no dedicated GSIS retirement calculator service is commercially available
- **Governing Statute:** RA 8291 Sections 9-12; GSIS IRR (Resolution No. 88, S. 2010); GSIS official retirement benefit page
- **Target Keywords:**
  - Primary: "GSIS retirement pension calculator"
  - Secondary: "GSIS BMP computation", "GSIS pension calculator", "GSIS retirement benefit", "how to compute GSIS pension"
  - Long-tail: "GSIS BMP formula 0.025 AMC computation", "GSIS Option 1 vs Option 2 retirement comparison", "GSIS retirement 60 months lump sum vs 18 months pension", "GSIS AMC average monthly compensation computation", "GSIS retirement pension 90% cap AMC", "GSIS P700 RAMC addend what is it", "GSIS retirement for teachers DepEd pension", "how much GSIS pension will I get with 30 years service"
- **How It Works Content:**
  1. Compute Average Monthly Compensation (AMC): sum of basic monthly salary for last 36 months / 36 — only basic salary included (no allowances, bonuses, RATA), per RA 8291 Sec. 9
  2. Compute Revalued AMC (RAMC): AMC + P700 (a statutory addend commonly omitted in manual computations)
  3. BMP = 0.025 x RAMC x PPP (Pensionable Period of Service in whole years)
  4. Apply the 90% of AMC cap: if BMP exceeds 90% of AMC, it is reduced to 90% of AMC (requires PPP of 36+ years)
  5. Option 1: lump sum = 60 x BMP at retirement; monthly pension resumes after 5 years. Option 2: cash = 18 x BMP at retirement + immediate monthly pension for life. The NPV comparison shows the break-even age and cumulative payout curves.
- **Step-by-Step Guide:**
  1. Enter your monthly basic salary for the last 36 months (or average if consistent)
  2. Enter your total Pensionable Period of Service (PPP) in whole years
  3. The calculator computes your AMC, RAMC (AMC + P700), and BMP
  4. The 90% cap check runs automatically: if BMP > 90% of AMC, it is capped
  5. View Option 1 vs. Option 2 side by side: lump sum amounts, when pension starts, and monthly pension rate
  6. Enter your retirement age and life expectancy assumptions for the NPV comparison
  7. View the break-even analysis: at what age Option 2 cumulative payout overtakes Option 1
  8. View the cumulative payout curves over 10, 15, 20, and 25 years post-retirement
- **FAQ Topics:**
  1. What is the GSIS BMP formula?
  2. What is the P700 RAMC addend in the GSIS retirement computation?
  3. What is the 90% AMC cap on GSIS retirement pension?
  4. What is the difference between GSIS Option 1 and Option 2?
  5. How many years of service do I need for maximum GSIS pension?
  6. When should I choose Option 1 (60-month lump sum) over Option 2 (18-month cash + immediate pension)?
  7. How is AMC computed — does it include allowances and bonuses?
  8. Can I retire early from government at age 60 or must I wait until 65?
- **Related Tools:** D-GSIS-2 (legacy law selection — pre-1997 employees should compare laws before computing BMP), D-GSIS-4 (contribution computation — PPP depends on contribution history), D-GSIS-3 (portability — split-career workers may have reduced PPP), A-SSS-1 (SSS retirement equivalent for private-sector comparison)
- **Structured Data:** SoftwareApplication — name: "GSIS Retirement Pension Calculator", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

### D-GSIS-2: GSIS Legacy Retirement Law Selection Optimizer

- **URL:** /gsis/legacy-law-selector
- **H1:** "GSIS Retirement Law Selector — RA 660, RA 1616, PD 1146, RA 8291 Comparison Tool"
- **Opportunity Score:** 3.75 (Rank #40)
- **TAM:** P142M/year (Consumer P56M realistic + Professional P86M); SAM P28M; SOM Y1 P1.4M
- **Professional Fee Displaced:** Labor lawyers charge P10,000-P30,000 for retirement benefit optimization consultation comparing multiple laws; GSIS branch comparison worksheets available only on in-person request
- **Governing Statute:** RA 660 (1951); RA 1616 (1957); PD 1146 (1977); RA 8291 Sections 9-11; DepEd DO 27, s. 2001 (comparative guide)
- **Target Keywords:**
  - Primary: "GSIS retirement law comparison"
  - Secondary: "RA 660 vs RA 8291 retirement", "GSIS Magic 87 calculator", "RA 1616 take all retirement", "GSIS which retirement law to choose"
  - Long-tail: "GSIS RA 660 Magic 87 eligibility computation", "RA 1616 take all retirement refund computation", "GSIS retirement law for employees before 1997", "PD 1146 vs RA 8291 pension comparison", "GSIS RA 660 80% AMS pension computation", "GSIS retirement law for DepEd teachers before 1977", "how to choose between RA 660 RA 1616 PD 1146 RA 8291", "GSIS retirement law irreversible election comparison"
- **How It Works Content:**
  1. Determine law eligibility by date of entry into government service: before June 1, 1977 = RA 660/RA 1616/PD 1146/RA 8291; June 1, 1977 to May 31, 1997 = RA 660/PD 1146/RA 8291; on or after June 24, 1997 = RA 8291 only
  2. RA 660 "Magic 87": age + years of service must equal 87 or more; minimum age 52, minimum service 35 years; pension = up to 80% of AMS (last 3 years average) if above 57, or 75% if 57 and below
  3. RA 1616 "Take All": entered before June 1, 1977; at least 20 years service; any age; benefit = gratuity from last employer + refund of personal GSIS premiums with interest — no ongoing pension (pure lump sum)
  4. PD 1146: 15+ years service, 60+ years old; similar to RA 8291 but without the P700 RAMC addend
  5. The tool computes pension under each applicable law and highlights the optimal choice — typically a P5,000-P20,000/month differential over a 20-year retirement
- **Step-by-Step Guide:**
  1. Enter your date of entry into government service
  2. The tool identifies which retirement laws you are eligible to elect
  3. Enter your salary history (last 3 years for AMS, last 36 months for AMC)
  4. Enter your total years of service, age at retirement, and contribution history
  5. For each eligible law, the calculator computes: (a) RA 660 pension (80% or 75% of AMS), (b) RA 1616 gratuity + premium refund, (c) PD 1146 pension, (d) RA 8291 BMP with Option 1 and Option 2
  6. View the side-by-side comparison: monthly pension, lump sum, and NPV of each option
  7. The optimizer highlights which law maximizes your total lifetime benefit
- **FAQ Topics:**
  1. What is the GSIS "Magic 87" rule under RA 660?
  2. What is the RA 1616 "Take All" retirement option?
  3. How do I know which GSIS retirement laws I am eligible for?
  4. Can I change my GSIS retirement law election after I choose?
  5. Is RA 660 or RA 8291 better for a 30-year government veteran?
  6. How much is the pension difference between RA 660 and RA 8291?
  7. What is the RA 1616 gratuity computation — who pays the gratuity?
  8. Can DepEd teachers choose RA 660 retirement if they entered before 1997?
- **Related Tools:** D-GSIS-1 (BMP computation under RA 8291 — one of the laws being compared), D-GSIS-4 (contribution history determines PPP for all laws), D-GSIS-3 (portability — may affect eligibility if service was split between government and private)
- **Structured Data:** SoftwareApplication — name: "GSIS Retirement Law Selector", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

### D-GSIS-3: GSIS Portability Totalization Calculator (RA 7699)

- **URL:** /gsis/portability-calculator
- **H1:** "GSIS-SSS Portability Calculator — RA 7699 Totalization Tool"
- **Opportunity Score:** 3.50 (Rank #60)
- **TAM:** P92M/year (Consumer P40M realistic + Professional P52M); SAM P18M; SOM Y1 P0.9M
- **Professional Fee Displaced:** Labor lawyers charge P15,000-P40,000 for portability claim assistance; the computation is straightforward but most eligible workers do not know portability exists
- **Governing Statute:** RA 7699 (Limited Portability Law, 1994); RA 7699 IRR Sections 3-6; GSIS-SSS Joint Implementing Rules
- **Target Keywords:**
  - Primary: "GSIS SSS portability calculator"
  - Secondary: "RA 7699 portability totalization", "GSIS SSS combined service", "portability law Philippines", "how to totalize GSIS and SSS service"
  - Long-tail: "RA 7699 portability how to compute pro-rata pension", "GSIS SSS portability requirements split career", "government private sector portability retirement", "RA 7699 totalization eligibility 15 years combined", "GSIS SSS portability which system to file with", "portability totalization teacher moved to private school", "RA 7699 portability GOCC privatization pension", "can I combine GSIS and SSS years of service for retirement"
- **How It Works Content:**
  1. Test independent eligibility first: can you qualify for GSIS retirement with GSIS service alone (15 years + age 60)? Can you qualify for SSS retirement with SSS contributions alone (120 months + age 60)? If you qualify in both, totalization does not apply — each system pays independently, per RA 7699 Sec. 3
  2. If you fail in one or both systems: totalize credited service = GSIS PPP + SSS credited months (no double-counting of overlapping periods)
  3. Test totalized service: does total combined service meet 15 years (GSIS minimum) or 120 months (SSS minimum)?
  4. Pro-rata benefit: compute theoretical full benefit from the system where claim is filed; multiply by (own system's PPP / total credited service) to get pro-rated benefit
  5. Example: GSIS 8 years + SSS 9 years = 17 years total (meets 15-year minimum). GSIS pays 8/17 of retirement benefit; SSS pays 9/17.
- **Step-by-Step Guide:**
  1. Enter your total GSIS Pensionable Period of Service (years)
  2. Enter your total SSS credited months
  3. Enter your salary history for both GSIS (for AMC) and SSS (for AMSC)
  4. The calculator first tests whether you independently qualify in either system
  5. If you do not independently qualify: the calculator totalizes your combined service
  6. View the pro-rata benefit from each system: GSIS share and SSS share
  7. Compare the totalized benefit against the independent benefit (if applicable) to confirm which is higher
  8. See which system you should file with (the "last system" rule)
- **FAQ Topics:**
  1. What is RA 7699 portability totalization?
  2. Do I need RA 7699 if I already qualify for both GSIS and SSS independently?
  3. How is the pro-rata pension computed under portability totalization?
  4. Which system should I file my portability claim with — GSIS or SSS?
  5. Can I combine GSIS and SSS years of service for retirement?
  6. Does RA 7699 apply to teachers who moved from public to private schools?
  7. What documents do I need for a portability totalization claim?
  8. Can I use portability if I worked at a GOCC that was privatized?
- **Related Tools:** D-GSIS-1 (BMP computation — the GSIS portion of the pro-rata), A-SSS-1 (SSS retirement pension — the SSS portion), D-GSIS-4 (GSIS contribution history determines PPP for portability), A-SSS-3 (SSS contribution history determines SSS credited months)
- **Structured Data:** SoftwareApplication — name: "GSIS-SSS Portability Calculator", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

### D-GSIS-4: GSIS Contribution Computation & Employer Remittance Calculator

- **URL:** /gsis/contribution-calculator
- **H1:** "GSIS Contribution Calculator — Free Online Tool for Government Agencies"
- **Opportunity Score:** 3.60 (Rank #45)
- **TAM:** P543M/year (Consumer P22M realistic + Professional P521M at Practice tier); SAM P109M; SOM Y1 P5.4M
- **Professional Fee Displaced:** External audit firms (COA-accredited) charge P50,000-P200,000/year for LGU GSIS compliance audits; internal government HR and accounting functions handle computation
- **Governing Statute:** RA 8291 Sections 5-7; GSIS IRR Rule III; RA 8291 Section 52 (criminal liability for agency heads)
- **Target Keywords:**
  - Primary: "GSIS contribution computation"
  - Secondary: "GSIS contribution rate 2025", "GSIS employee share employer share", "GSIS premium contribution", "how to compute GSIS contribution"
  - Long-tail: "GSIS 9% employee 12% employer contribution computation", "GSIS contribution monthly compensation base", "GSIS remittance deadline first 10 days", "GSIS criminal liability agency head late remittance", "GSIS contribution for LGU employees", "GSIS contribution for GOCC employees", "GSIS life insurance premium separate from pension", "GSIS contribution for contractual government employees"
- **How It Works Content:**
  1. Fixed rate split: employee personal share = 9% of monthly compensation; employer/agency share = 12% of monthly compensation; total premium = 21%, per RA 8291 Sec. 5
  2. Monthly compensation base: basic salary + PERA + other fixed allowances integrated in the Salary Standardization Law (SSL) — excludes RATA, clothing allowance, year-end bonus
  3. Remittance deadline: within the first 10 days of the following calendar month
  4. Life insurance premium: separate from pension premium, computed as a fixed percentage of basic salary by salary grade under RA 8291 Sec. 5(b)
  5. Criminal liability: RA 8291 Section 52 imposes 6 years 1 day to 12 years imprisonment on agency heads who fail to remit on time — personal, non-delegable liability
- **Step-by-Step Guide:**
  1. Enter the employee's monthly basic salary and integrated allowances
  2. The calculator computes: employee share (9%), employer share (12%), and total premium (21%)
  3. For agency-level computation: enter the number of employees and their salary grades
  4. View the total monthly remittance obligation for the entire agency
  5. Review the remittance deadline and the criminal liability exposure under RA 8291 Sec. 52
  6. If computing for late remittance: view the interest computation on outstanding amounts
  7. See the separate life insurance premium computation by salary grade
- **FAQ Topics:**
  1. What is the GSIS contribution rate for government employees?
  2. What is included in "monthly compensation" for GSIS contribution purposes?
  3. Is RATA included in the GSIS contribution base?
  4. What is the criminal penalty for late GSIS remittance by agency heads?
  5. When is the GSIS remittance deadline for government agencies?
  6. Do contractual government employees contribute to GSIS?
  7. How is the GSIS life insurance premium different from the pension premium?
  8. Does GSIS contribution apply to GOCC employees?
- **Related Tools:** D-GSIS-1 (retirement BMP depends on contribution/PPP history), A-SSS-3 (SSS contribution — private sector equivalent), B-PHI-2 (PhilHealth contribution — government employees also contribute), C-HDMF-3 (Pag-IBIG contribution — government employees contribute to all three)
- **Structured Data:** SoftwareApplication — name: "GSIS Contribution Calculator", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

### D-GSIS-5: GSIS Survivorship & Death Benefit Calculator

- **URL:** /gsis/death-benefit-calculator
- **H1:** "GSIS Death Benefit & Survivorship Pension Calculator — Free Online Tool"
- **Opportunity Score:** 3.30 (Rank lower tier)
- **TAM:** P67M/year (Consumer P7.2M + Professional P60M); SAM P13M; SOM Y1 P0.7M
- **Professional Fee Displaced:** Denied survivorship claim legal assistance P10,000-P30,000 per attorney; document procurement assistance P500-P2,000 per item via fixers
- **Governing Statute:** RA 8291 Sections 21-25; GSIS Resolution No. 188 (restructuring of survivorship benefits)
- **Target Keywords:**
  - Primary: "GSIS death benefit calculator"
  - Secondary: "GSIS survivorship pension", "GSIS death benefit for spouse", "GSIS funeral benefit", "how to compute GSIS death benefit"
  - Long-tail: "GSIS survivorship pension 50% BMP computation", "GSIS dependent children pension death benefit", "GSIS death benefit pension vs cash lump sum", "GSIS funeral benefit P30,000 who can claim", "GSIS death benefit surviving spouse remarriage", "GSIS death benefit 180 contributions requirement", "GSIS death benefit for retired pensioner", "how long can children receive GSIS survivorship pension"
- **How It Works Content:**
  1. Primary beneficiaries (spouse + dependent children): basic survivorship pension = 50% of BMP; dependent children's pension = up to 50% of BMP shared equally among qualifying children under 18 or incapacitated; total capped at 100% of BMP, per RA 8291 Sec. 21-25
  2. Pension vs. cash options: Option A (pension only) if deceased had 3+ years service and 36 contributions in last 5 years or 180 total; Option B (pension + cash) with cash = 100% AMC x years of PPP; Option C (cash only, min P12,000) for shorter service
  3. Funeral benefit: fixed P30,000 payable to spouse, actual burial payer, or children in priority order
  4. Termination triggers: spouse pension ends on remarriage or cohabitation; children's pension ends at age 18, marriage, or employment (except disabled children)
  5. The 50%/50% pension split between spouse and children is recomputed as children age out of eligibility
- **Step-by-Step Guide:**
  1. Enter the deceased member's salary history (last 36 months for AMC) and total PPP
  2. The calculator computes the BMP using the standard GSIS formula
  3. Enter beneficiary information: surviving spouse, number and ages of dependent children
  4. View the survivorship pension breakdown: spouse share (50% of BMP) + children share (up to 50% of BMP)
  5. Determine which option applies (A, B, or C) based on service years and contribution count
  6. If Option B: view the additional cash payment (100% AMC x PPP)
  7. View the funeral benefit amount (P30,000) and eligible claimant
  8. See the pension termination triggers and recomputation schedule as children age out
- **FAQ Topics:**
  1. How much is the GSIS survivorship pension for surviving spouse?
  2. How is the GSIS dependent children's pension computed after a member's death?
  3. What are the three options (A, B, C) for GSIS death benefit?
  4. Does GSIS survivorship pension stop if the surviving spouse remarries?
  5. Who can claim the GSIS funeral benefit of P30,000?
  6. Can a common-law partner claim GSIS death benefit?
  7. How long do dependent children receive GSIS survivorship pension?
  8. What happens to the GSIS death benefit pension when children reach age 18?
- **Related Tools:** D-GSIS-1 (survivorship pension is based on BMP formula), D-GSIS-4 (contribution count determines which option A/B/C applies), A-SSS-5 (SSS death benefit — private sector equivalent), D-GSIS-6 (disability — if death results from disability, different rules may apply)
- **Structured Data:** SoftwareApplication — name: "GSIS Death Benefit Calculator", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

### D-GSIS-6: GSIS Disability Benefit Calculator

- **URL:** /gsis/disability-benefit-calculator
- **H1:** "GSIS Disability Benefit Calculator — PTD, PPD, TTD Computation Tool"
- **Opportunity Score:** 3.00 (lowest in GSIS cluster)
- **TAM:** P1.3M/year (consumer only — professional TAM bundled into D-GSIS-4); very small market (~1,500 new non-EC disability cases/year)
- **Professional Fee Displaced:** Labor lawyers assist with disputed disability classifications at P15,000-P50,000 per case; no retail computation service exists
- **Governing Statute:** RA 8291 Sections 16-20; GSIS IRR Rule V; GSIS Policy and Procedural Guidelines No. 216-12
- **Target Keywords:**
  - Primary: "GSIS disability benefit calculator"
  - Secondary: "GSIS disability pension", "GSIS PTD PPD TTD benefit", "GSIS disability benefit computation", "how to compute GSIS disability benefit"
  - Long-tail: "GSIS permanent total disability benefit BMP computation", "GSIS temporary total disability 75% daily salary computation", "GSIS PPD benefit LWOP days computation", "GSIS disability benefit 180 contributions cash payment", "GSIS TTD benefit floor P70 ceiling P340 per day", "GSIS disability benefit for government employees", "GSIS disability vs ECC disability difference", "GSIS disability benefit LWOP vs sick leave distinction"
- **How It Works Content:**
  1. Permanent Total Disability (PTD): benefit = BMP for life (same formula as retirement); plus cash payment = 18 x BMP if in service with 180+ monthly contributions; if separated with fewer contributions, cash = 100% AMC x each year of PPP (min P12,000), per RA 8291 Sec. 16
  2. Permanent Partial Disability (PPD): benefit = (BMP / 30) x number of compensable LWOP days; maximum entitlement period 12 months per contingency; only LWOP days are compensable (days taken as sick leave with pay are excluded), per RA 8291 Sec. 18
  3. Temporary Total Disability (TTD): benefit = 75% of daily basic salary x number of disability days; floor P70/day, ceiling P340/day; duration up to 120 days extendable to 240 days with medical justification, per RA 8291 Sec. 17
  4. Medical classification: GSIS Medical Evaluation Department must certify disability type (PTD, PPD, or TTD) — this is the only non-deterministic step
  5. The 180-contribution threshold for the 18 x BMP cash bonus under PTD is a cliff-edge that most members are unaware of
- **Step-by-Step Guide:**
  1. Select disability classification: PTD, PPD, or TTD
  2. For PTD: enter your salary history (for AMC/BMP), total contributions, and service status
  3. For PPD: enter your BMP (or salary for computation) and number of LWOP days in the disability period
  4. For TTD: enter your daily basic salary and number of disability days
  5. The calculator computes the applicable benefit amount with floor/ceiling checks
  6. For PTD: view whether you qualify for the 18 x BMP cash bonus (180-contribution threshold)
  7. For PPD: view the maximum 12-month entitlement period and remaining balance
  8. Review the LWOP vs. sick leave distinction for PPD computation
- **FAQ Topics:**
  1. What is the difference between GSIS PTD, PPD, and TTD disability benefits?
  2. How is the GSIS PTD disability pension computed?
  3. What is the GSIS TTD benefit rate per day?
  4. How does the LWOP vs. sick leave distinction affect GSIS PPD benefit?
  5. How many GSIS contributions are needed for the 18 x BMP disability cash bonus?
  6. What is the maximum TTD benefit duration under GSIS?
  7. Is GSIS disability benefit different from Employees' Compensation (ECC) disability?
  8. Who certifies disability type for GSIS benefit — the agency doctor or GSIS?
- **Related Tools:** D-GSIS-1 (disability BMP formula is the same as retirement BMP), D-GSIS-4 (contribution count determines 180-contribution threshold for PTD cash), D-GSIS-5 (if disability leads to death, survivorship benefit applies), A-SSS-7 (SSS disability equivalent for private-sector comparison)
- **Structured Data:** SoftwareApplication — name: "GSIS Disability Benefit Calculator", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

## Blog Posts

### Blog Post 1: GSIS Retirement Option 1 vs. Option 2 — Which Should You Choose?

- **URL:** /gsis/gsis-option-1-vs-option-2-retirement-comparison
- **Target Query:** "GSIS Option 1 vs Option 2"
- **Content Outline:**
  1. Introduction: this is the most consequential financial decision a government retiree makes — and it is irreversible
  2. How Option 1 works: 60 x BMP lump sum at retirement, no monthly pension for 5 years, then lifetime pension resumes
  3. How Option 2 works: 18 x BMP cash at retirement + immediate monthly pension for life
  4. The NPV analysis: at what age does Option 2 cumulative payout overtake Option 1?
  5. Worked example: BMP = P23,025 (30 years service, P30,000 AMC) — break-even age calculation
  6. Factors that favor Option 1: shorter life expectancy, high investment return expectations, immediate large expense needs
  7. Factors that favor Option 2: longer life expectancy, risk aversion, no immediate cash need
  8. Why GSIS provides no tool for this comparison — and how angkin.ph fills the gap
- **CTA Tools:** D-GSIS-1 (retirement calculator with NPV comparison), D-GSIS-2 (legacy law selector — pre-1997 employees should check this first)
- **Related Posts:** "GSIS Retirement Law Comparison for Pre-1997 Employees", "GSIS BMP Computation Guide"

### Blog Post 2: GSIS Retirement Laws — RA 660, RA 1616, PD 1146, RA 8291 Compared

- **URL:** /gsis/gsis-retirement-laws-ra-660-ra-1616-pd-1146-ra-8291-compared
- **Target Query:** "GSIS RA 660 vs RA 8291"
- **Content Outline:**
  1. Why multiple retirement laws coexist: history from 1951 to 1997
  2. Eligibility tree by date of entry into government service
  3. RA 660 "Magic 87": age + service = 87, pension up to 80% of AMS
  4. RA 1616 "Take All": pure lump sum, no ongoing pension, best for high terminal salary
  5. PD 1146: the in-between law, largely superseded by RA 8291
  6. RA 8291: the default for post-1997, BMP formula with Option 1/2
  7. Side-by-side comparison: worked example for a 57-year-old with 30 years service
  8. The pension differential: P5,000-P20,000/month for life — why this choice matters
  9. How teachers (DepEd, 900,000 employees) are the largest affected cohort
- **CTA Tools:** D-GSIS-2 (legacy law selector), D-GSIS-1 (BMP computation for RA 8291)
- **Related Posts:** "GSIS Option 1 vs Option 2", "GSIS-SSS Portability for Career Switchers"

### Blog Post 3: GSIS-SSS Portability — How to Combine Government and Private Sector Service for Retirement

- **URL:** /gsis/gsis-sss-portability-ra-7699-guide
- **Target Query:** "GSIS SSS portability RA 7699"
- **Content Outline:**
  1. What RA 7699 does: combines government and private sector service to meet minimum pension thresholds
  2. Who qualifies: split-career workers who fail to independently qualify in either GSIS or SSS
  3. Step-by-step: how totalization works with worked example (8 years GSIS + 9 years SSS = 17 years)
  4. The pro-rata formula: each system pays its proportionate share based on credited service
  5. The "last system" filing rule: why you file with the system you contributed to most recently
  6. Common scenarios: teachers who moved to private schools, GOCC employees after privatization, government to private sector transitions
  7. The biggest problem: most eligible workers do not know portability exists and forfeit benefits entirely
  8. What documents you need from both GSIS and SSS to file a portability claim
- **CTA Tools:** D-GSIS-3 (portability calculator), D-GSIS-1 (GSIS BMP for GSIS portion), A-SSS-1 (SSS pension for SSS portion)
- **Related Posts:** "GSIS Retirement Laws Compared", "SSS Retirement Pension Guide"

### Blog Post 4: GSIS Contribution Guide for Government Agencies — Rates, Deadlines, and Criminal Liability

- **URL:** /gsis/gsis-contribution-guide-government-agencies
- **Target Query:** "GSIS contribution rate government employees"
- **Content Outline:**
  1. The 21% total rate: 9% employee + 12% employer (government agency share)
  2. What counts as "monthly compensation" for GSIS: basic salary + PERA + SSL-integrated allowances only
  3. What is excluded: RATA, clothing allowance, year-end bonus, productivity incentive
  4. Remittance deadline: first 10 days of the following month
  5. Criminal liability under RA 8291 Sec. 52: 6 years 1 day to 12 years imprisonment for agency heads
  6. Common errors: LGUs with limited HR capacity miscalculating the compensation base
  7. The separate life insurance premium: how it differs from the pension premium
  8. How Agency Authorized Officers (AAOs) process monthly remittance through ERF
- **CTA Tools:** D-GSIS-4 (contribution calculator), D-GSIS-1 (BMP — contributions determine retirement benefit)
- **Related Posts:** "GSIS Option 1 vs Option 2", "SSS Contribution Table 2025 (private sector comparison)"
