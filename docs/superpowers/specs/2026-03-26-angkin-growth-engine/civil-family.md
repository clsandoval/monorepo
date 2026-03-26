# Civil & Family Law Hub — angkin.ph SEO Spec

## Hub Page

- **URL:** /civil/
- **H1:** "Civil & Family Law Calculators & Tools — Philippines"
- **Overview:**

Philippine civil and family law creates some of the most computation-heavy obligations Filipinos will ever face — yet the formulas are almost entirely unknown to the public. The Supreme Court's Nacar/Lara's Gifts framework for legal interest computation is routinely miscalculated even by practicing lawyers. The Family Code's marital property liquidation algorithm (Art. 102/129) governs every marriage dissolution but is understood by almost no one outside family law practice. The Loss of Earning Capacity formula — three multiplications that determine damages worth hundreds of thousands to millions of pesos — is gatekept by contingency-fee lawyers who charge 20-30% of recoveries.

The angkin.ph Civil & Family Law hub automates the statutory formulas that underpin every Philippine money dispute, every marriage dissolution, every accident claim, and every insurance policy surrender. These tools span the Civil Code (RA 386), the Family Code (EO 209), the Insurance Code (RA 10607), BSP Circular No. 799, and decades of Supreme Court jurisprudence. Together they form the computational infrastructure that connects to every other hub on angkin.ph — the Legal Interest Engine alone serves as shared infrastructure for 7+ other tools across labor, property, and corporate domains.

With approximately 600,000-800,000 pending court cases, 500,000-1,000,000 interest computation events per year, 65,000-75,000 annual marriage dissolutions requiring property liquidation, and 7+ million life insurance policies in force, this hub addresses legal and financial computation needs that affect a significant fraction of the Philippine adult population.

- **Hub FAQs:**
  1. How is legal interest computed in the Philippines after the Nacar ruling?
  2. What is the prescriptive period for a breach of contract claim in the Philippines?
  3. How is marital property divided when a marriage ends in the Philippines?
  4. What is the difference between ACP (Absolute Community of Property) and CPG (Conjugal Partnership of Gains)?
  5. How is Loss of Earning Capacity computed in wrongful death cases?
  6. What is the Cash Surrender Value of my life insurance policy?
  7. Does interest compound on unpaid interest under Philippine law (Art. 2212)?
  8. What is the 6-month deadline under Art. 103 of the Family Code?

- **Related Hubs:**
  - **Property & Real Estate Hub** — Legal interest (G1) applies to unpaid property obligations, delinquent RPT, and Maceda Law CSV refund delays; Prescriptive periods (G2) govern property claims; Marital property liquidation (G3) classifies real property before inheritance distribution
  - **Tax & BIR Hub** — Estate tax computation requires marital property liquidation first (G3 feeds estate tax); BIR penalty interest uses similar interest computation frameworks
  - **Labor & Employment Hub** — G1 (Legal Interest) is used in every NLRC back wage computation; G4 (LEC) applies in work accident fatality claims; G2 (Prescriptive Period) applies to labor claims (4 years for money claims under Art. 291 Labor Code)
  - **Corporate & SEC Hub** — Corporate disputes (shareholder loans, trade receivables) require Nacar interest computation; corporate-owned property goes through ACP/CPG liquidation if owned by a married shareholder

- **Structured Data:** CollectionPage + FAQPage

---

## Tools

### G1: Legal Interest Computation Engine (Nacar/Lara's Gifts Framework)

> **CROSS-DOMAIN INFRASTRUCTURE** — G1 is not just a standalone tool. It creates shared computational primitives used by D3 (Final Pay), D4 (Retirement Pay), D5 (Separation Pay), D6 (Back Wages), F4 (Maceda Law CSV refund delays), G3 (Marital Property estate debts), and G4 (LEC post-judgment interest). Building G1 once multiplies the value of 7+ other tools. The standalone TAM of P1,220M understates the full embedded value.

- **URL:** /civil/legal-interest-calculator
- **H1:** "Legal Interest Calculator Philippines — Nacar Framework (Free Online Tool)"
- **Opportunity Score:** 4.55 (Rank 2 overall — highest-scoring Civil/Family tool)
- **TAM:**
  - Consumer: 360,000 addressable litigants x P199/mo = P860M/year
  - Professional: 30,000 litigating lawyers x P999/mo = P360M/year
  - Total TAM: P1,220M/year | SAM: P305M | SOM Y1: P3.1M | SOM Y3: P15.2M
- **Professional Fee Displaced:** Demand letter with Nacar interest computation: P5,000-P25,000 (confirmed Respicio & Co., lawyer-philippines.com); collection suit filing: P20,000-P50,000+; contingency fee ~25% of recovery in civil collection cases. CPA firms engaged for Statements of Account with interest breakdowns: P3,000-P10,000. Small claims cases (up to P400K) do not award attorney's fees, yet self-filers routinely mis-compute interest.
- **Governing Statute:** Civil Code Art. 2209 (legal interest at 6% p.a.), Art. 2210 (interest on non-monetary damages), Art. 2212 (interest on interest from judicial demand), Art. 2213 (no interest on unliquidated claims unless ascertainable); BSP-MB Circular No. 799, Series of 2013 (reduced legal interest from 12% to 6% effective July 1, 2013); Nacar v. Gallery Frames (G.R. No. 189871, Aug. 13, 2013); Lara's Gifts & Decors v. Midtown Industrial Sales (G.R. No. 225433, Aug. 28, 2019); Eastern Shipping Lines v. CA (G.R. No. 97412, July 12, 1994)
- **Target Keywords:**
  - Primary: "legal interest calculator Philippines"
  - Secondary:
    - "Nacar interest computation"
    - "6 percent legal interest calculator"
    - "BSP Circular 799 interest computation"
    - "Philippine interest rate computation for court cases"
  - Long-tail:
    - "how to compute legal interest under Nacar v Gallery Frames"
    - "legal interest rate Philippines 2026 6 percent or 12 percent"
    - "how to compute interest on interest Art 2212 Civil Code"
    - "Nacar interest computation from demand to judgment to payment"
    - "how to compute legal interest for demand letter collection Philippines"
    - "legal interest computation for NLRC back wages"
    - "compound interest on court judgment Philippines"
    - "when does 12 percent interest rate apply vs 6 percent Philippines"
- **How It Works Content:**
  - Step 1: Determine if there is a stipulated interest rate (contractual) or if the legal rate applies (6% p.a. post-July 1, 2013; 12% p.a. pre-July 1, 2013)
  - Step 2: Classify the obligation — loan/forbearance (interest from demand/filing date) vs. non-loan monetary obligation (if liquidated: from demand; if unliquidated: from court judgment)
  - Step 3: Apply Art. 2212 compound interest layer — accrued interest itself earns 6% p.a. from judicial demand (this is the step most lawyers miss)
  - Step 4: Post-finality interest — all monetary awards (principal + accrued interest) earn 6% p.a. from date of finality until full satisfaction
  - Step 5: Transitional computation — obligations spanning July 1, 2013 require split calculation at 12% pre-transition and 6% post-transition
- **Step-by-Step Guide:**
  1. Enter the principal amount of the obligation
  2. Select obligation type: loan/forbearance, breach of contract (liquidated), or damages (unliquidated)
  3. Enter the stipulated interest rate (if contractual) or select "legal rate"
  4. Enter key dates: date of default, date of extrajudicial demand (if any), date of filing complaint, date of court judgment (if any), date of finality (if any), date of full payment (or intended payment date)
  5. Tool automatically determines the applicable rate per period (12% pre-July 2013, 6% post-July 2013)
  6. Tool computes interest for each period: demand-to-filing, filing-to-judgment, judgment-to-finality, finality-to-payment
  7. Tool applies Art. 2212 compound interest layer on accrued interest from judicial demand
  8. View total interest breakdown by period, total amount due, and a citation-ready computation memo
- **FAQ Topics:**
  1. What is the current legal interest rate in the Philippines?
  2. When did the legal interest rate change from 12% to 6%?
  3. What is the difference between interest on a loan/forbearance and interest on damages?
  4. Does interest compound under Philippine law?
  5. What is Art. 2212 and why do lawyers often miss it?
  6. How is interest computed after a court judgment becomes final and executory?
  7. What is the Nacar v. Gallery Frames formula?
  8. Can I charge a stipulated interest rate higher than 6%?
- **Related Tools:**
  - G2 (Prescriptive Period Calculator) — check if the underlying obligation has prescribed before computing interest
  - F4 (Maceda Law Calculator) — overdue CSV refunds accrue 6% p.a. legal interest from demand
  - D3 (Final Pay Computation) — delayed final pay releases accrue interest
  - D4 (Retirement Pay Calculator) — unpaid retirement benefits accrue interest from demand
  - B2 (BIR Penalty Calculator) — BIR penalties use a different interest framework (NIRC Sec. 249) but overlap conceptually
- **Structured Data:** SoftwareApplication — name: "Legal Interest Calculator Philippines", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

### G2: Prescriptive Period Deadline Calculator

- **URL:** /civil/prescriptive-period-calculator
- **H1:** "Prescriptive Period Calculator — Check Your Filing Deadline (Philippines)"
- **Opportunity Score:** 4.05
- **TAM:**
  - Consumer: 500,000 addressable potential claimants x P199/mo = P1,194M/year
  - Professional: 50,000 active lawyers x P999/mo = P599M/year
  - Total TAM: P1,793M/year | SAM: P358M | SOM Y1: P3.6M | SOM Y3: P17.9M
- **Professional Fee Displaced:** Legal opinion on prescription: P2,000-P5,000 initial consultation; collection suit intake screening: included in P20,000-P50,000 acceptance fee; portfolio clock-watching services: P7,000-P15,000/month retainer for large portfolios
- **Governing Statute:** Civil Code Art. 1139 (prescription by lapse of time), Art. 1140 (movables: 8 years), Art. 1141 (immovables: 30 years), Art. 1142 (mortgage: 10 years), Art. 1144 (written contracts/judgments: 10 years), Art. 1145 (oral contracts: 6 years), Art. 1146 (quasi-delicts: 4 years), Art. 1147 (forcible entry/defamation: 1 year), Art. 1149 (catch-all: 5 years), Art. 1150-1152 (when period begins), Art. 1155 (interruption: court filing, written extrajudicial demand, written acknowledgment by debtor), Art. 13 (computation: first day excluded, last day included)
- **Target Keywords:**
  - Primary: "prescriptive period calculator Philippines"
  - Secondary:
    - "prescription of actions Philippines"
    - "how long to file civil case Philippines"
    - "statute of limitations Philippines"
    - "filing deadline civil action Philippines"
  - Long-tail:
    - "prescriptive period for breach of written contract Philippines"
    - "how long can I sue for unpaid debt Philippines"
    - "does sending a demand letter interrupt prescription"
    - "prescriptive period oral contract Philippines 6 years"
    - "when does prescription start for quasi-delict Philippines"
    - "how to compute prescriptive period with interruption events"
    - "is my case still within the prescriptive period Philippines"
    - "prescriptive period for real property claims 30 years"
- **How It Works Content:**
  - Every civil action has a statutory deadline defined by the type of obligation: written contract (10 years), oral contract (6 years), quasi-delict/tort (4 years), forcible entry (1 year), real property (30 years), mortgage (10 years), judgment (10 years), catch-all (5 years)
  - The clock starts when the cause of action accrues (Art. 1150) — typically the date of breach or injury
  - Three events can interrupt (reset) the clock under Art. 1155: filing a court complaint, sending a written extrajudicial demand, or receiving a written acknowledgment of the debt from the debtor
  - CRITICAL: only written demand interrupts — verbal promises to pay or oral demands do NOT reset the clock
  - A missed prescriptive deadline is permanently fatal — there is no remedy once the period expires
- **Step-by-Step Guide:**
  1. Select the type of obligation (written contract, oral contract, quasi-delict, judgment, real property, mortgage, etc.)
  2. Enter the date the cause of action accrued (date of breach, injury, or default)
  3. Enter any interruption events: written demand letters sent (with dates), complaints filed, or written acknowledgments received
  4. Tool computes the applicable prescriptive period from Art. 1139-1149
  5. Tool calculates the current running period, accounting for clock resets at each interruption
  6. View the deadline date and days remaining
  7. View a "safe demand letter" deadline — the last date to send a written demand to prevent prescription
- **FAQ Topics:**
  1. What is a prescriptive period and why does it matter?
  2. What is the prescriptive period for a breach of written contract?
  3. Does a verbal demand or phone call interrupt prescription?
  4. What happens if I miss the prescriptive period?
  5. Does filing a barangay complaint interrupt prescription?
  6. What is the prescriptive period for unpaid rent or lease obligations?
  7. Can the debtor waive the prescriptive period defense?
  8. How is prescription computed for obligations with partial payments?
- **Related Tools:**
  - G1 (Legal Interest Engine) — once you confirm the claim is within the prescriptive period, compute the interest owed
  - F4 (Maceda Law Calculator) — check prescriptive period for filing DHSUD complaint
  - D3 (Final Pay Computation) — labor money claims have a 4-year prescriptive period (Art. 291 Labor Code)
  - B2 (BIR Penalty Calculator) — BIR assessments have their own prescriptive periods (3 years for regular, 10 years for fraud)
- **Structured Data:** SoftwareApplication — name: "Prescriptive Period Calculator Philippines", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

### G3: Marital Property Liquidation Engine (ACP/CPG)

- **URL:** /civil/marital-property-calculator
- **H1:** "Marital Property Liquidation Calculator — ACP & CPG (Philippines)"
- **Opportunity Score:** 3.95
- **TAM:**
  - Consumer: 45,000 addressable (annulment + estate cases) x P199/mo = P108M/year
  - Professional: 12,000 family/estate lawyers x P999/mo = P144M/year
  - Total TAM: P252M/year | SAM: P50M | SOM Y1: P0.5M | SOM Y3: P2.5M
- **Professional Fee Displaced:** Family lawyer for annulment property division: P100,000-P400,000 attorney's fees; estate lawyer for post-death liquidation: P50,000-P200,000; contested annulment with property division: P500,000-P1,000,000+. The liquidation algorithm is a 4-step (ACP) or 8-step (CPG) statutory process — lawyers charge P100K-P600K for what the Family Code explicitly defines in Art. 102/129.
- **Governing Statute:** Family Code (EO 209) Art. 88-104 (ACP), Art. 105-133 (CPG), Art. 74-81 (property regime selection), Art. 43/49-52 (annulment/nullity property effects), Art. 63 (legal separation effects), Art. 92 (ACP exclusions), Art. 109/117 (CPG classification), Art. 118 (installment purchases), Art. 120 (improvements on exclusive property), Art. 102-103 (ACP liquidation + 6-month deadline), Art. 129-130 (CPG liquidation)
- **Target Keywords:**
  - Primary: "marital property liquidation calculator Philippines"
  - Secondary:
    - "ACP CPG property division calculator"
    - "conjugal property division Philippines"
    - "absolute community of property computation"
    - "family code property liquidation"
  - Long-tail:
    - "how to divide property after annulment Philippines"
    - "what is the difference between ACP and CPG Philippines"
    - "6 month deadline liquidate marital property after death Art 103"
    - "how to classify property as community or exclusive Philippines"
    - "conjugal partnership of gains computation example"
    - "Art 118 installment purchase classification married Philippines"
    - "how to compute net gains in CPG liquidation"
    - "what property is excluded from absolute community Art 92"
- **How It Works Content:**
  - Filipino marriages default to ACP (post-August 3, 1988) or CPG (pre-August 3, 1988 or by prenup). The regime determines how property is divided at dissolution.
  - ACP (Art. 102) is a 4-step algorithm: inventory all property, pay all community debts, return exclusives to each spouse, split the net remainder 50/50
  - CPG (Art. 129) is an 8-step algorithm: inventory, return admin costs, pay conjugal debts, reimburse spouse advances, return exclusives, compute net remainder, identify net gains (remainder minus initial capital), split net gains 50/50
  - Asset classification is critical: Art. 118 (installment purchases — when did ownership vest?) and Art. 120 (improvements — land stays with owner, conjugal estate gets cost reimbursement)
  - Art. 103 imposes a 6-month deadline after death of spouse — any disposition of community property after 6 months without liquidation is VOID
- **Step-by-Step Guide:**
  1. Enter marriage date and select property regime (ACP default if married on/after August 3, 1988; CPG if before, or if prenup specifies CPG)
  2. Enter dissolution event (death of spouse, annulment, declaration of nullity, legal separation)
  3. For each asset: enter description, acquisition date, how acquired (purchase, inheritance, donation), who paid/from what funds, and current fair market value
  4. Tool classifies each asset as community/conjugal or exclusive using Art. 91-92 (ACP) or Art. 109/117/118/120 (CPG) decision trees
  5. For installment purchases (Art. 118), tool determines when ownership vested and computes reimbursement claims
  6. Enter all debts (community and exclusive)
  7. For CPG: enter each spouse's initial capital at marriage
  8. Tool runs the Art. 102 (ACP) or Art. 129 (CPG) liquidation algorithm
  9. View each spouse's total share: exclusive property returned + 50% of net community/gains
  10. If dissolution by death: view which share becomes the decedent's estate for inheritance distribution
- **FAQ Topics:**
  1. What property regime applies to my marriage?
  2. What is the difference between ACP and CPG?
  3. Is inherited property included in the community property?
  4. How is a house-and-lot purchased on installment classified (Art. 118)?
  5. What is the 6-month deadline under Art. 103 and what happens if I miss it?
  6. Does marital property liquidation happen before or after inheritance distribution?
  7. What happens if a widowed spouse remarries without liquidating?
  8. How are improvements on exclusive property treated (Art. 120)?
- **Related Tools:**
  - G1 (Legal Interest Engine) — estate debts and claims carry interest; Art. 2209 applies to obligations of the estate
  - G2 (Prescriptive Period Calculator) — check deadlines for property-related claims during liquidation
  - F1 (RPT Calculator) — property being liquidated still owes current RPT
  - F3 (RPVARA Amnesty Calculator) — estates with delinquent property need amnesty clearance before title transfer
  - A3 (CGT Real Property) — property transfers during or after liquidation may trigger capital gains tax
- **Structured Data:** SoftwareApplication — name: "Marital Property Calculator Philippines", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

### G4: Loss of Earning Capacity (LEC) Calculator

- **URL:** /civil/loss-of-earning-capacity-calculator
- **H1:** "Loss of Earning Capacity Calculator — Wrongful Death & Injury Damages (Philippines)"
- **Opportunity Score:** 4.30 (Rank 5, tied; Moat: 5/5 — highest moat category)
- **TAM:**
  - Consumer: 5,250 self-represented claimants x P199 one-time = P1M/year
  - Professional: 10,000 practitioners (PI lawyers + insurance adjusters + NLRC lawyers) x P999/mo = P120M/year
  - Total TAM: P121M/year | SAM: P24M | SOM Y1: P0.24M | SOM Y3: P1.2M
- **Professional Fee Displaced:** Contingency fee: 20-30% of total recovery — confirmed for personal injury cases. Acceptance fee: P20,000-P50,000 for personal injury/wrongful death cases. Victims regularly accept quick settlements at 20-40% of statutory entitlement. A victim with LEC of P1,000,000 paying 25% contingency = P250,000 to a lawyer for what is three-step arithmetic. The gap between the computation's simplicity and the professional fee it commands is the widest of any domain in the survey.
- **Governing Statute:** Civil Code Art. 2206 (damages for death: loss of earning capacity); Supreme Court jurisprudence: People v. Teehankee Jr., Villa Rey Transit v. Ferrer, Sarkies Tours v. CA, Perena v. Zarate — established the 2/3 x (80 - age) x 50% of gross income formula; IMC 2024-01 (CTPL death indemnity: P200K baseline)
- **Target Keywords:**
  - Primary: "loss of earning capacity calculator Philippines"
  - Secondary:
    - "LEC computation wrongful death Philippines"
    - "damages calculator accident death Philippines"
    - "Villa Rey Transit formula calculator"
    - "Art 2206 loss of earning capacity"
  - Long-tail:
    - "how to compute loss of earning capacity wrongful death Philippines"
    - "LEC formula 2/3 times 80 minus age Philippines"
    - "how much damages for death in car accident Philippines"
    - "loss of earning capacity computation for minimum wage earner"
    - "CTPL insurance vs civil damages difference Philippines"
    - "can I claim loss of earning capacity for permanent disability"
    - "how to compute damages if victim had no documented income"
    - "loss of earning capacity plus moral damages computation"
- **How It Works Content:**
  - The Supreme Court formula: LEC = Life Expectancy x Net Annual Income, where Life Expectancy = 2/3 x (80 - age at death/injury) and Net Annual Income = Gross Annual Income x 50% (standard deduction for living expenses)
  - For death: full LEC is awarded to the heirs of the deceased
  - For permanent partial disability: LEC = life expectancy x net annual income x disability percentage (the lost portion)
  - Additional damages typically awarded alongside LEC: moral damages (P50K-P100K for death of spouse/parent), death indemnity (P75K-P100K, SC-adjusted), burial expenses (actual, with receipts), attorney's fees (10-15% of total award)
  - CTPL offset: if CTPL insurance has already paid (up to P200K for death), the civil liability award is reduced by the CTPL amount already received
- **Step-by-Step Guide:**
  1. Enter the victim's age at time of death or injury
  2. Enter annual gross income (from payslips, ITR, business records, or minimum wage if undocumented)
  3. Select injury type: death, permanent total disability, or permanent partial disability
  4. For partial disability: enter the disability percentage
  5. Tool computes Life Expectancy using the 2/3 x (80 - age) formula
  6. Tool computes Net Annual Income at 50% of gross
  7. Tool calculates total LEC in Philippine Pesos
  8. View additional damage estimates: moral damages, death indemnity, burial expense allowance, attorney's fees
  9. Enter CTPL payment already received (if any) for net civil liability
- **FAQ Topics:**
  1. What is the Loss of Earning Capacity formula in the Philippines?
  2. Where does the 2/3 x (80 - age) formula come from?
  3. Why is only 50% of gross income used (net income deduction)?
  4. Can LEC be claimed if the victim was unemployed or a minor?
  5. What is the difference between CTPL insurance payment and civil damages?
  6. How much are moral damages for wrongful death in the Philippines?
  7. Can I compute LEC for permanent disability (not just death)?
  8. How do insurance companies compute settlement offers vs. the SC formula?
- **Related Tools:**
  - G1 (Legal Interest Engine) — post-judgment LEC awards earn 6% p.a. interest from finality until payment
  - G2 (Prescriptive Period Calculator) — quasi-delict claims prescribe in 4 years (Art. 1146)
  - D3 (Final Pay Computation) — for work-related accidents, final pay and LEC may both be due
  - D6 (Back Wages Risk Assessment) — for illegal dismissal leading to injury/death during employment
- **Structured Data:** SoftwareApplication — name: "Loss of Earning Capacity Calculator Philippines", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

### G5: Life Insurance Cash Surrender Value (CSV) Verification

- **URL:** /civil/life-insurance-csv-calculator
- **H1:** "Life Insurance Cash Surrender Value Calculator — Verify Your Policy (Philippines)"
- **Opportunity Score:** 3.30 (lowest in this hub, but addresses a market of 7+ million policies)
- **TAM:**
  - Consumer: 1,418,909 addressable policyholders x P199/mo = P3,388M/year (overstated — see SAM)
  - Professional: 15,000 practitioners (independent advisors + estate lawyers) x P999/mo = P180M/year
  - Total TAM: P3,568M/year | SAM: P180M | SOM Y1: P1.8M | SOM Y3: P9M
- **Professional Fee Displaced:** No standard market exists for individual CSV verification — this is the core information asymmetry. Actuarial consulting for individual policy review: P10,000-P50,000 (prohibitively expensive). IC complaint filing assistance from lawyers if underpayment suspected: P15,000-P30,000. Insurance agents have a financial conflict of interest (commissions tied to keeping policies in force). The moat is informational asymmetry rather than active professional gatekeeping.
- **Governing Statute:** RA 10607 (Amended Insurance Code) Sec. 227(d) (minimum non-forfeiture value: CSV >= reserve - min(1/5 of reserve, 2.5% of face + dividend additions)), Sec. 233 (non-forfeiture options: cash surrender, reduced paid-up, extended term), Sec. 237 (policy loan value), Sec. 243 (15-day free-look period), Sec. 249 (delayed claims: 12% interest p.a. if not paid within 90 days of proof of loss); IC Circular Letter No. 14-93 (Standard Life Insurance Policy Provisions)
- **Target Keywords:**
  - Primary: "life insurance cash surrender value calculator Philippines"
  - Secondary:
    - "CSV verification life insurance Philippines"
    - "insurance policy surrender value computation"
    - "RA 10607 non-forfeiture value"
    - "how much is my life insurance worth if I surrender"
  - Long-tail:
    - "how to compute cash surrender value of life insurance Philippines"
    - "minimum cash surrender value under Insurance Code Philippines"
    - "life insurance surrender vs lapse what is the difference"
    - "can I get my money back if I cancel life insurance Philippines"
    - "how to check if insurer is paying correct surrender value"
    - "life insurance policy loan value computation Philippines"
    - "what is non-forfeiture value in life insurance"
    - "how to file IC complaint for delayed insurance surrender payment"
- **How It Works Content:**
  - Every Philippine life insurance policy in force for 2-3+ years has a statutory minimum CSV defined by RA 10607 Sec. 227(d)
  - The statutory floor: CSV >= policy reserve for the current year + dividend additions - maximum surrender charge, where maximum surrender charge = lesser of (1/5 of entire reserve) or (2.5% of face amount + dividend additions)
  - Policyholders have three non-forfeiture options (Sec. 233): cash surrender, reduced paid-up insurance, or extended term insurance
  - If the insurer delays CSV payment beyond 90 days of proof of surrender, they owe 12% interest p.a. under Sec. 249
  - CRITICAL: letting a policy lapse (stopping premium payments without formally surrendering) results in zero recovery even when CSV > 0
- **Step-by-Step Guide:**
  1. Select policy type (whole life, endowment, term with CSV component, variable life)
  2. Enter face amount (sum insured)
  3. Enter annual premium amount
  4. Enter number of years the policy has been in force (policy year)
  5. Enter dividend additions (for participating policies) and outstanding policy loans with accrued interest
  6. Enter the reserve value from your policy's Table of Non-Forfeiture Values (found in your policy contract)
  7. Tool computes the maximum allowable surrender charge: min(reserve/5, face x 2.5%)
  8. Tool calculates the statutory minimum CSV floor
  9. Compare against the CSV amount your insurer quoted — view a "Fair Check" flag
  10. If insurer's offer is below statutory floor: view guidance on filing an Insurance Commission complaint
- **FAQ Topics:**
  1. What is Cash Surrender Value and when am I entitled to it?
  2. How is the minimum CSV computed under the Insurance Code?
  3. What is the difference between surrendering and letting a policy lapse?
  4. What happens if my insurer delays payment of my CSV?
  5. Can I take a policy loan against my CSV instead of surrendering?
  6. What are my three non-forfeiture options under Sec. 233?
  7. Does variable life insurance have a guaranteed CSV?
  8. How do I find my policy's Table of Non-Forfeiture Values?
- **Related Tools:**
  - G1 (Legal Interest Engine) — if insurer delays CSV payment, compute 12% interest p.a. from 90 days after proof of loss under Sec. 249
  - G3 (Marital Property Liquidation) — life insurance CSV is part of the marital estate and must be classified during liquidation
  - G2 (Prescriptive Period Calculator) — check the prescriptive period for filing an IC complaint
  - G4 (Loss of Earning Capacity) — for death benefits vs. CSV — different computations for different events
- **Structured Data:** SoftwareApplication — name: "Life Insurance CSV Calculator Philippines", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}

---

## Blog Posts

### Blog Post 1: The Nacar Interest Formula Explained — A Complete Guide for Filipinos

- **URL:** /civil/blog/nacar-interest-formula-guide
- **Target Query:** "how to compute legal interest Nacar v Gallery Frames Philippines"
- **Content Outline:**
  1. The three landmark cases: Eastern Shipping Lines (1994) -> Nacar v. Gallery Frames (2013) -> Lara's Gifts (2019) — how the framework evolved
  2. The rate change: BSP Circular 799 reduced legal interest from 12% to 6% effective July 1, 2013 — what this means for obligations spanning the transition
  3. The two-tier accrual rule: demand-to-finality (6% or stipulated rate) and finality-to-satisfaction (6% on total award)
  4. The Art. 2212 compound interest layer most lawyers miss — interest on interest from judicial demand
  5. Worked examples: a P500,000 promissory note defaulted in 2010, with demand letter, filing, judgment, and payment dates across the 12%/6% transition
  6. Common errors: wrong accrual start date, missing the compound layer, applying 12% after July 2013
  7. When stipulated rates apply vs. legal rate — and when courts reduce unconscionable stipulated rates
- **CTA Tools:** G1 (Legal Interest Calculator)
- **Related Posts:** Blog Post 2 (Prescription), Blog Post 5 (Demand Letter)

### Blog Post 2: Will Your Case Be Dismissed? Understanding Prescriptive Periods in Philippine Law

- **URL:** /civil/blog/prescriptive-period-guide-philippines
- **Target Query:** "prescriptive period civil case Philippines how many years"
- **Content Outline:**
  1. What prescription means: your right to sue expires after a fixed statutory period
  2. The full table: written contract (10 years), oral (6 years), quasi-delict (4 years), mortgage (10 years), real property (30 years), judgment (10 years), forcible entry (1 year), catch-all (5 years)
  3. When the clock starts: Art. 1150 — from the day the action may be brought
  4. How to stop the clock: Art. 1155 — ONLY three ways (court filing, written extrajudicial demand, written acknowledgment by debtor). Verbal demands DO NOT count.
  5. Common scenarios: unpaid invoice from 2020 — can I still sue? Verbal promise to pay — does it reset the clock? Demand via Viber message — does it qualify as "written"?
  6. Special prescriptive periods in other laws: labor money claims (4 years, Art. 291 Labor Code), BIR assessment (3 years regular, 10 years fraud), criminal offenses (separate tables)
  7. The fatal mistake: waiting too long to consult a lawyer and losing the right forever
- **CTA Tools:** G2 (Prescriptive Period Calculator), G1 (Legal Interest Calculator)
- **Related Posts:** Blog Post 1 (Nacar Interest), Blog Post 5 (Demand Letter)

### Blog Post 3: How to Divide Marital Property in the Philippines — ACP vs. CPG Explained

- **URL:** /civil/blog/marital-property-division-acp-cpg
- **Target Query:** "how to divide property after annulment Philippines ACP CPG"
- **Content Outline:**
  1. ACP vs. CPG: which applies to your marriage — the August 3, 1988 dividing line
  2. The ACP 4-step algorithm (Art. 102): inventory, pay debts, return exclusives, split 50/50
  3. The CPG 8-step algorithm (Art. 129): inventory, admin costs, pay debts, reimburse advances, return exclusives, net remainder, identify net gains, split gains 50/50
  4. The classification problem: how to determine if each asset is community/conjugal or exclusive
  5. Art. 118 installment trap: a house bought before marriage but paid during marriage — who gets it?
  6. Art. 120 improvement trap: building on one spouse's inherited lot using joint savings
  7. Worked example: the Perla-and-Ben scenario (Paranaque house, Makati condo, cars, savings — all classified and liquidated step by step)
  8. The Art. 103 time bomb: 6-month deadline after death of spouse — miss it and dispositions are VOID
  9. Why liquidation must happen BEFORE inheritance distribution — the two-engine pipeline
- **CTA Tools:** G3 (Marital Property Calculator), G1 (Legal Interest Engine)
- **Related Posts:** Blog Post 4 (LEC), Blog Post 2 (Prescription)

### Blog Post 4: How Much Is Your Accident Claim Really Worth? The LEC Formula Every Filipino Should Know

- **URL:** /civil/blog/loss-of-earning-capacity-accident-claim
- **Target Query:** "how much damages for death in car accident Philippines"
- **Content Outline:**
  1. The formula most accident victims never learn: LEC = 2/3 x (80 - age) x (gross annual income x 50%)
  2. Why insurance companies don't tell you: CTPL pays a maximum of P200K for death — but your LEC could be P500K-P5M+
  3. Worked examples by age and income bracket: 30-year-old earning P25K/month (LEC = P2.5M), 50-year-old earning P15K/month (LEC = P900K), minimum wage earner at age 40 (LEC = P1.2M+)
  4. Beyond LEC: moral damages, death indemnity, burial expenses, exemplary damages, attorney's fees
  5. The settlement trap: insurance adjusters offer P50K-P100K settlements to families who don't know the formula
  6. For permanent disability (not death): how to adjust the formula with a disability percentage
  7. How to document income: payslips, ITR, BIR Form 2316, certificate of employment — or minimum wage as the floor
  8. When to hire a lawyer vs. when to negotiate yourself: the cost-benefit calculation
- **CTA Tools:** G4 (LEC Calculator), G1 (Legal Interest Calculator)
- **Related Posts:** Blog Post 1 (Nacar Interest), Blog Post 5 (Demand Letter)

### Blog Post 5: How to Write a Demand Letter with Correct Interest Computation — Philippines

- **URL:** /civil/blog/demand-letter-interest-computation-guide
- **Target Query:** "how to write demand letter with interest computation Philippines"
- **Content Outline:**
  1. Why the demand letter matters: it starts the interest clock (Art. 2209), interrupts prescription (Art. 1155), and is a prerequisite to many legal actions
  2. The structure: date, addressee, statement of obligation, computation of amount due (principal + interest), demand for payment, deadline, consequence of non-payment
  3. How to compute the interest in your demand letter: identify the obligation type, select the rate, compute from date of default to demand date
  4. Common errors: applying 12% post-2013, forgetting the Art. 2212 compound layer, not stating "written extrajudicial demand" explicitly for Art. 1155 purposes
  5. Format requirements: must be sent by registered mail or personal delivery with acknowledgment receipt for Art. 1155 interruption
  6. Template outline: not a fill-in-the-blanks (legal document generation is outside scope), but a structural guide showing what a compliant demand letter looks like
  7. When the demand letter is enough vs. when you need to file in court: the small claims threshold (P400K) and when to hire a lawyer
- **CTA Tools:** G1 (Legal Interest Calculator), G2 (Prescriptive Period Calculator)
- **Related Posts:** Blog Post 1 (Nacar Interest), Blog Post 2 (Prescription)
