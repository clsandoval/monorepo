# Tax (Income Tax) Hub -- angkin.ph SEO Spec

## Hub Page
- **URL:** /tax/
- **H1:** "Income Tax Calculators & Tools -- Philippines"
- **Overview:**

  Income tax is the single largest compliance burden for Filipino taxpayers. Whether you are a freelancer choosing between the 8% flat rate and graduated rates, a corporation navigating the RCIT vs. MCIT comparison, or an employee verifying your withholding tax, the Philippine income tax system demands precise computation grounded in the NIRC as amended by the TRAIN Law (RA 10963) and CREATE Act (RA 11534).

  angkin.ph's Income Tax hub brings together five purpose-built calculators covering every major income tax scenario in the Philippines: self-employed professionals, corporations, capital gains on real property and unlisted shares, and compensation earners. Each tool applies the exact statutory formulas -- graduated rate tables, flat rate options, CGT percentages -- so you can compute your tax due in minutes instead of paying a CPA thousands of pesos for arithmetic.

  Beyond computation, the hub provides plain-language explainers of governing statutes, step-by-step filing guides for BIR Forms 1700 through 1707, and optimization tools that compare multiple tax regimes side-by-side to find the option that legally minimizes your tax bill.

- **Hub FAQs:**
  1. What are the Philippine income tax rates for 2026 under the TRAIN Law?
  2. Should I choose the 8% flat tax or graduated rates as a freelancer?
  3. How do I compute capital gains tax when selling property in the Philippines?
  4. What is the difference between RCIT and MCIT for Philippine corporations?
  5. When do I need to file BIR Form 1700 vs. 1701 vs. 1701A?
  6. How is the 15% capital gains tax on unlisted shares computed?
  7. What deductions can self-employed individuals claim -- OSD vs. itemized?
  8. What are the penalties for late filing of income tax returns in the Philippines?

- **Related Hubs:**
  - Tax Administration (/tax-admin/) -- the compliance calendar, penalty calculator, and withholding tools that support the filing obligations triggered by income tax
  - Transfer & Transaction Taxes (/transfer-taxes/) -- donor's tax and DST are frequently triggered alongside capital gains tax in property and share transfers
  - Labor & Employment (/labor/) -- compensation withholding connects employee income tax to payroll compliance

- **Structured Data:** CollectionPage + FAQPage

---

## Tools

### A1: Individual Self-Employed / Professional Income Tax Optimizer
- **URL:** /tax/self-employed-income-tax-calculator
- **H1:** "Self-Employed & Freelancer Income Tax Calculator -- Free Online Calculator"
- **Opportunity Score:** 4.30 (Market 5 | Moat 3 | Computability 5 | Pain 4)
- **TAM:** Total TAM: P4.28B/year (Consumer P3.92B at P199/mo for 1.64M addressable; Professional P360M at P999/mo for 30K CPAs)
- **Professional Fee Displaced:** CPA annual ITR preparation P3,000-P10,000 per return; monthly bookkeeping retainer P5,000-P30,000/month for mixed-income earners
- **Governing Statute:** NIRC Sec. 24(A) (graduated rates), Sec. 24(A)(2)(b) (8% flat rate option for gross receipts under P3M), Sec. 34(L) (Optional Standard Deduction -- 40% of gross), Sec. 74-79 (quarterly installments); TRAIN Law RA 10963; BIR Forms 1701, 1701A, 1701Q
- **Target Keywords:**
  - Primary: "freelancer income tax calculator philippines"
  - Secondary:
    - "8% flat tax vs graduated rate calculator"
    - "BIR 1701A tax computation"
    - "self-employed tax Philippines 2026"
    - "OSD vs itemized deduction calculator"
    - "professional income tax computation"
  - Long-tail:
    - "how to compute income tax for freelancers in the philippines"
    - "should I choose 8% or graduated income tax"
    - "how to file BIR form 1701A for self-employed"
    - "freelancer tax optimization philippines 2026"
    - "how to compute quarterly income tax 1701Q"
    - "what is the OSD 40% optional standard deduction"
    - "income tax computation for doctors lawyers engineers philippines"
    - "BIR 8 percent tax option eligibility requirements"
- **How It Works Content:**
  - Explain the three computation paths: 8% flat (Sec. 24(A)(2)(b)), graduated + OSD (Sec. 34(L) at 40%), and graduated + itemized deductions (Sec. 34), with statutory citations
  - Detail the 8% eligibility threshold (gross receipts not exceeding P3M, not VAT-registered) per TRAIN Law
  - Walk through the 2023-forward graduated rate table (P250K exempt through 35% bracket above P8M) per NIRC Sec. 24(A)
  - Explain OSD mechanics: 40% of gross sales/receipts automatically deducted, no substantiation needed
  - Cover quarterly installment computation (cumulative subtraction method per Sec. 74-77) and how quarterly payments reduce annual tax due
- **Step-by-Step Guide:**
  1. Enter gross receipts/sales for the taxable year (or quarter for 1701Q)
  2. Enter business expenses if computing under itemized deduction path
  3. Enter creditable withholding taxes from BIR 2307 certificates received
  4. Tool computes tax due under all three regimes and highlights the optimal choice
  5. Review side-by-side comparison showing annual tax savings per regime
  6. Generate pre-filled computation worksheet for BIR Form 1701 or 1701A
  7. For quarterly filing: enter cumulative income and prior quarterly payments to compute current quarter installment
- **FAQ Topics:**
  1. Can I switch from 8% flat to graduated rate mid-year?
  2. What happens if my gross receipts exceed P3M -- do I lose the 8% option?
  3. Is the P250,000 tax-exempt threshold applied to the 8% flat rate?
  4. How does the OSD 40% interact with the 8% option?
  5. Do I still need to file 2551Q (percentage tax) if I elect the 8% option?
  6. What creditable withholding taxes (BIR 2307) can I deduct from my income tax?
  7. How do I compute quarterly income tax using the cumulative method?
  8. What is the deadline for filing BIR Form 1701 and 1701A?
- **Related Tools:**
  - B5 (Quarterly IT Reconciliation) -- computes quarterly installments that feed into the annual return
  - B1 (BIR Form Navigator) -- determines whether filer uses 1701 vs. 1701A
  - B2 (BIR Penalty Calculator) -- computes surcharges if filing is late
  - A5 (Compensation IT) -- for mixed-income earners who have both employment and self-employment income
  - B3 (Compliance Calendar) -- tracks all quarterly and annual filing deadlines
- **Structured Data:** SoftwareApplication (applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}, applicationSubCategory: "Tax Calculator")

---

### A2: Corporate Income Tax -- RCIT vs. MCIT Engine
- **URL:** /tax/corporate-income-tax-calculator
- **H1:** "Corporate Income Tax Calculator (RCIT vs. MCIT) -- Free Online Calculator"
- **Opportunity Score:** 4.00 (Market 4 | Moat 4 | Computability 4 | Pain 4)
- **TAM:** Total TAM: P1.27B/year (Consumer P1.03B at P199/mo for 430K addressable corporations; Professional P240M at P999/mo for 20K CPAs). De-duplicated TAM approximately P549M.
- **Professional Fee Displaced:** CPA monthly retainer P10,000-P30,000/month for SME corporations; annual tax return + AFS P25,000-P100,000; Big 4 audit P500,000+
- **Governing Statute:** NIRC Sec. 27(A) (RCIT at 25% standard / 20% for small corporations with net taxable income not exceeding P5M and total assets not exceeding P100M); Sec. 27(E) (MCIT at 2% of gross income, applicable from 4th year of operations); Sec. 34(L) (OSD 40% for corporations); Sec. 75-76 (quarterly corporate IT); CREATE Act RA 11534; BIR Forms 1702-RT, 1702-MX, 1702-EX, 1702Q
- **Target Keywords:**
  - Primary: "corporate income tax calculator philippines"
  - Secondary:
    - "RCIT vs MCIT computation"
    - "CREATE law corporate tax rate 2026"
    - "BIR 1702 computation"
    - "minimum corporate income tax philippines"
    - "MCIT carry forward calculator"
  - Long-tail:
    - "how to compute corporate income tax RCIT vs MCIT philippines"
    - "what is the minimum corporate income tax MCIT rate"
    - "how to carry forward excess MCIT as tax credit"
    - "CREATE law 20% reduced corporate tax rate requirements"
    - "how to compute quarterly corporate income tax 1702Q"
    - "NOLCO net operating loss carry over computation"
    - "when does MCIT apply to Philippine corporations"
    - "corporate income tax rate for small corporations under CREATE"
- **How It Works Content:**
  - Detail the RCIT computation: gross revenue minus COGS/COS equals gross income; minus allowable deductions (itemized or OSD at 40%) equals taxable net income; times 25% (or 20% for qualifying small corporations under CREATE) equals RCIT per Sec. 27(A)/(B)
  - Explain the MCIT threshold: 2% of gross income applies from the 4th taxable year of operations; corporation pays whichever is higher between RCIT and MCIT per Sec. 27(E)
  - Cover the MCIT excess carry-forward: when MCIT exceeds RCIT, the difference is creditable against RCIT for the next 3 years per Sec. 27(E)
  - Explain NOLCO tracking: net operating losses can be carried over for up to 3 succeeding taxable years per Sec. 34(D)(3)
  - Walk through the small corporation qualification test: total assets not exceeding P100M (excluding land) AND net taxable income not exceeding P5M as of year-end per CREATE Act
- **Step-by-Step Guide:**
  1. Enter gross revenues and cost of goods sold/cost of services
  2. Select deduction method: itemized expenses or OSD (40% of gross income)
  3. Enter taxable year and whether the corporation is in its 4th year or later (MCIT applicability)
  4. Enter total assets and net taxable income for small corporation rate qualification
  5. Tool computes both RCIT and MCIT and identifies which applies
  6. Enter any MCIT carry-forward credits from prior 3 years to offset current RCIT
  7. Enter NOLCO balances from prior years for deduction
  8. Enter creditable withholding taxes (2307 certificates) and quarterly payments
  9. Review the final tax payable/refundable with full breakdown
- **FAQ Topics:**
  1. What is the difference between RCIT and MCIT?
  2. When does a corporation start paying MCIT?
  3. How long can excess MCIT be carried forward as a tax credit?
  4. What qualifies as a small corporation under CREATE (20% rate)?
  5. How does NOLCO (net operating loss carry-over) work?
  6. Can a corporation use both NOLCO and MCIT carry-forward?
  7. What is the OSD for corporations and when should it be elected?
  8. Are PEZA/BOI-registered companies subject to regular RCIT/MCIT?
- **Related Tools:**
  - B5 (Quarterly IT Reconciliation) -- quarterly 1702Q computation and annual reconciliation
  - B4 (Withholding Agent Engine) -- employer withholding obligations that generate 1601C and 0619E filings
  - B3 (Compliance Calendar) -- all 4 quarterly + 1 annual filing deadlines for corporate IT
  - A4 (CGT Unlisted Shares) -- triggered by corporate restructuring and share transfers
  - B2 (BIR Penalty Calculator) -- computes penalties for late corporate IT filings
- **Structured Data:** SoftwareApplication (applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}, applicationSubCategory: "Tax Calculator")

---

### A3: Capital Gains Tax -- Real Property (BIR Form 1706)
- **URL:** /tax/capital-gains-tax-real-property-calculator
- **H1:** "Capital Gains Tax on Real Property Calculator -- Free Online Calculator"
- **Opportunity Score:** 4.30 (Market 3 | Moat 5 | Computability 5 | Pain 4)
- **TAM:** Total TAM: P292M/year (Consumer P64M at P499/transaction for 127.5K addressable transactions; Professional P228M at P999/mo for 19K real estate professionals)
- **Professional Fee Displaced:** Full conveyancing service P30,000-P150,000 per transaction; CPA ONETT preparation P5,000-P15,000 per transaction
- **Governing Statute:** NIRC Sec. 24(D)(1) (6% CGT on the higher of gross selling price or fair market value); BIR zonal value schedules per Revenue District Office; Sec. 196 (DST at 1.5% concurrently due); BIR Form 1706; 30-day filing deadline from date of notarization
- **Target Keywords:**
  - Primary: "capital gains tax calculator philippines"
  - Secondary:
    - "CGT real property computation"
    - "BIR form 1706 calculator"
    - "6 percent capital gains tax Philippines"
    - "zonal value BIR lookup"
    - "real property tax computation selling house"
  - Long-tail:
    - "how to compute capital gains tax on sale of property in the philippines"
    - "capital gains tax calculator BIR 2026"
    - "what is the 6% capital gains tax on real property"
    - "how to file BIR form 1706 for property sale"
    - "zonal value vs selling price capital gains tax"
    - "capital gains tax exemption principal residence philippines"
    - "30 day deadline capital gains tax filing penalty"
    - "CGT vs DST on real property sale how to compute"
- **How It Works Content:**
  - Explain the 6% CGT formula: tax = 6% times the HIGHER of (a) gross selling price or (b) BIR zonal value or (c) assessed value times assessment level, per NIRC Sec. 24(D)(1)
  - Detail the zonal value system: BIR publishes zonal values per barangay/district; these serve as the floor for CGT computation; updated periodically via Revenue Memorandum Orders
  - Cover the principal residence exemption: if seller uses proceeds to acquire a new principal residence within 18 months, 6% CGT may be exempt under Sec. 24(D)(2), subject to conditions
  - Note the concurrent DST obligation: 1.5% DST on real property deeds of sale per Sec. 196 uses the same valuation base (higher of selling price or FMV)
  - Explain the eONETT system (RMC 56-2023) for online filing and eCAR issuance
- **Step-by-Step Guide:**
  1. Enter the gross selling price of the real property
  2. Enter the BIR zonal value (tool provides lookup guidance by revenue district)
  3. Enter the assessed value and assessment level from the tax declaration
  4. Tool automatically selects the highest value as the CGT tax base
  5. View computed CGT (6%) and DST (1.5%) with total transfer taxes
  6. Check eligibility for principal residence exemption
  7. Review the 30-day filing deadline and required documents for BIR Form 1706
- **FAQ Topics:**
  1. Who pays the capital gains tax -- buyer or seller?
  2. How do I find the BIR zonal value of my property?
  3. What is the penalty for filing capital gains tax late?
  4. Is CGT paid on the selling price or the zonal value?
  5. Can I be exempt from CGT if I reinvest in a new home?
  6. What documents do I need to file BIR Form 1706?
  7. How long does it take to get a Certificate Authorizing Registration (CAR)?
  8. Is DST separate from CGT on property sales?
- **Related Tools:**
  - C4 (DST Engine) -- computes the documentary stamp tax due on the same property transaction
  - C5 (Property Transfer Tax Bundler) -- computes all taxes (CGT + DST + LGU transfer tax + RD fees) in one transaction
  - C1 (Donor's Tax) -- if the property is donated rather than sold, donor's tax applies instead
  - B2 (BIR Penalty Calculator) -- computes surcharge and interest for late CGT filing
  - A4 (CGT Unlisted Shares) -- for sellers transferring shares instead of property
- **Structured Data:** SoftwareApplication (applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}, applicationSubCategory: "Tax Calculator")

---

### A4: Capital Gains Tax -- Unlisted Shares + DST (BIR Forms 1707 / 2000-OT)
- **URL:** /tax/capital-gains-tax-unlisted-shares-calculator
- **H1:** "Capital Gains Tax on Unlisted Shares Calculator -- Free Online Calculator"
- **Opportunity Score:** 4.05 (Market 3 | Moat 4 | Computability 5 | Pain 4)
- **TAM:** Total TAM: P98M/year (Consumer P14M at P999/transaction for 14K addressable transactions; Professional P84M at P999/mo for 7K corporate lawyers/CPAs)
- **Professional Fee Displaced:** CPA/lawyer for unlisted share sale filing P5,000-P25,000 per simple transaction; P30,000-P200,000+ for complex corporate restructuring
- **Governing Statute:** NIRC Sec. 24(C) (15% CGT on net capital gain from sale of unlisted shares); NIRC Sec. 175 (DST on transfer of shares at P1.50 per P200 par value, i.e., 0.75%); RR 20-2020 (FMV determination using Adjusted Net Asset Method / book value from latest AFS); BIR Forms 1707 (per transaction, within 30 days), 1707-A (annual summary), 2000-OT (DST on share transfer)
- **Target Keywords:**
  - Primary: "capital gains tax unlisted shares calculator philippines"
  - Secondary:
    - "CGT shares of stock not listed PSE"
    - "BIR form 1707 computation"
    - "15% capital gains tax shares Philippines"
    - "DST on share transfer computation"
    - "unlisted share sale tax computation"
  - Long-tail:
    - "how to compute capital gains tax on sale of unlisted shares in the philippines"
    - "BIR form 1707 how to file and compute"
    - "what is the capital gains tax rate on shares not listed on PSE"
    - "documentary stamp tax on transfer of shares computation"
    - "RR 20-2020 fair market value unlisted shares"
    - "how to determine book value of shares for CGT"
    - "capital gains tax family corporation share transfer"
    - "30 day deadline BIR 1707 unlisted share sale"
- **How It Works Content:**
  - Explain the 15% CGT formula: tax = 15% times (selling price minus cost basis minus incidental expenses) per NIRC Sec. 24(C)
  - Detail the FMV determination under RR 20-2020: adjusted net asset method using the latest audited financial statements prior to the sale date
  - Cover the DST computation on share transfers: ceiling(par value / P200) times P1.50 per NIRC Sec. 175
  - Warn about below-FMV transfers: if selling price is below FMV, BIR may assess based on FMV; excess may be treated as donation triggering donor's tax (Form 1800)
  - Note the CMEPA (Capital Markets Efficiency Promotion Act) impact: stock transaction tax reduction to 0.1% for listed shares effective July 2025 -- distinguishing listed vs. unlisted treatment
- **Step-by-Step Guide:**
  1. Enter the selling price of the unlisted shares
  2. Enter the cost basis (original purchase price plus incidental expenses)
  3. Enter the par value and number of shares transferred
  4. Enter the book value per share from the latest AFS (for FMV comparison under RR 20-2020)
  5. Tool computes net capital gain and 15% CGT
  6. Tool computes DST on the share transfer (0.75% of par value)
  7. Review combined CGT + DST total and 30-day filing deadline
  8. Check whether below-FMV sale triggers donor's tax exposure
- **FAQ Topics:**
  1. What is the difference between CGT on unlisted shares and stock transaction tax on listed shares?
  2. How is the fair market value of unlisted shares determined?
  3. What is the deadline for filing BIR Form 1707?
  4. Do I also need to pay DST when transferring unlisted shares?
  5. What if the shares are sold below book value?
  6. How do I compute the cost basis for inherited or donated shares?
  7. What is the annual CGT return (BIR Form 1707-A)?
  8. Is CGT applied to both individual and corporate sellers of unlisted shares?
- **Related Tools:**
  - A3 (CGT Real Property) -- for sellers disposing of real property instead of shares
  - C4 (DST Engine) -- standalone DST computation for any document type including share transfers
  - C1 (Donor's Tax) -- if the share transfer involves a below-FMV element treated as donation
  - B2 (BIR Penalty Calculator) -- penalties for late filing of Form 1707
  - A2 (Corporate IT) -- the corporate buyer/seller may have RCIT implications from the transaction gain/loss
- **Structured Data:** SoftwareApplication (applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}, applicationSubCategory: "Tax Calculator")

---

### A5: Individual Income Tax -- Compensation Earners (BIR Form 1700)
- **URL:** /tax/compensation-income-tax-calculator
- **H1:** "Employee Income Tax Calculator (BIR Form 1700) -- Free Online Calculator"
- **Opportunity Score:** 3.85 (Market 5 | Moat 2 | Computability 5 | Pain 3)
- **TAM:** Total TAM: P1.59B/year (Consumer P1.50B at P499/filing for 3M addressable non-substituted filers; Professional P96M at P999/mo for 8K tax preparers). Subscription model TAM: P7.26B but overstates for a seasonal tool.
- **Professional Fee Displaced:** CPA preparation of simple BIR 1700: P1,500-P5,000 per annual return; PICPA regional minimum P4,000
- **Governing Statute:** NIRC Sec. 24(A) (graduated rates for citizens and resident aliens); Sec. 79-83 (withholding tax on compensation); TRAIN Law RA 10963 (rate table effective January 1, 2023); BIR Form 1700; P250,000 exemption threshold; 13th month pay exemption up to P90,000; de minimis benefits per RR 11-2018
- **Target Keywords:**
  - Primary: "income tax calculator philippines employees"
  - Secondary:
    - "BIR form 1700 tax computation"
    - "philippine income tax table 2026"
    - "TRAIN law income tax rates"
    - "withholding tax computation employees"
    - "substituted filing eligibility Philippines"
  - Long-tail:
    - "how to compute income tax for employees in the philippines 2026"
    - "do I need to file BIR form 1700 as an employee"
    - "philippine income tax table TRAIN law 2023 onwards"
    - "how to compute annual income tax with multiple employers"
    - "what is substituted filing BIR when am I exempt from filing"
    - "how to reconcile BIR 2316 certificates from two employers"
    - "13th month pay tax exemption computation"
    - "how to compute withholding tax on compensation monthly"
- **How It Works Content:**
  - Walk through the graduated rate table under TRAIN Law: P0 on the first P250K; 15% on P250,001-P400K; 20% on P400,001-P800K; 25% on P800,001-P2M; 30% on P2,000,001-P8M; 35% above P8M, per NIRC Sec. 24(A)
  - Explain statutory deductions that reduce taxable compensation: SSS (employee share), PhilHealth (employee share), Pag-IBIG (employee share) per their respective laws
  - Detail non-taxable items: 13th month pay and other benefits up to P90,000 per TRAIN Law Sec. 32(B)(7)(e); de minimis benefits per RR 11-2018
  - Explain substituted filing under RR 2-98 as amended: when the employer's 1604CF serves as the employee's ITR (single employer, correct withholding, no other income)
  - Cover the multi-employer scenario: employees who worked for two or more employers during the year must file 1700 and reconcile multiple BIR 2316 certificates
- **Step-by-Step Guide:**
  1. Enter gross annual compensation income (from BIR Form 2316)
  2. Enter statutory deductions (SSS, PhilHealth, Pag-IBIG contributions)
  3. Enter non-taxable benefits (13th month pay, de minimis) for exemption computation
  4. If multiple employers: enter each BIR 2316 certificate to aggregate total compensation and taxes withheld
  5. Tool computes net taxable income and applies the graduated rate table
  6. Deduct total taxes withheld (from all 2316 certificates) from tax due
  7. View tax payable or refundable balance
  8. Check substituted filing eligibility to determine if Form 1700 filing is actually required
- **FAQ Topics:**
  1. Do I need to file BIR Form 1700 if I only have one employer?
  2. What is substituted filing and am I eligible?
  3. How do I file if I had two employers in one year?
  4. Is the 13th month pay taxable?
  5. What is the income tax exemption threshold under TRAIN law?
  6. How do I get my BIR Form 2316 from my employer?
  7. What is the deadline for filing BIR Form 1700?
  8. Can I claim a refund if too much tax was withheld?
- **Related Tools:**
  - A1 (Self-Employed IT) -- for employees with side freelance income (mixed-income earners filing 1701)
  - B6 (2307/2316 Tracker) -- tracks and reconciles withholding certificates from multiple employers
  - B1 (BIR Form Navigator) -- determines whether the employee uses 1700 or 1701
  - B2 (BIR Penalty Calculator) -- penalties for non-filing when substituted filing does not apply
  - B3 (Compliance Calendar) -- annual filing deadline tracking
- **Structured Data:** SoftwareApplication (applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}, applicationSubCategory: "Tax Calculator")

---

## Blog Posts

### "8% Flat Tax vs. Graduated Rates: Which Saves Filipino Freelancers More Money?"
- **URL:** /blog/8-percent-flat-tax-vs-graduated-rates-freelancers
- **Target Query:** "8% flat tax vs graduated rate philippines freelancer"
- **Word Count:** 1200-1500
- **Content Outline:**
  - Explain the three tax regimes available to self-employed individuals post-TRAIN Law (8% flat, graduated + OSD, graduated + itemized)
  - Walk through a concrete comparison using a freelancer earning P1.5M gross: compute tax under each regime with actual numbers
  - Cover the P3M gross receipts ceiling for 8% eligibility and what happens when you cross it
  - Discuss the percentage tax exemption for 8% electors (no 2551Q filing) and the compliance cost savings
  - Include a decision flowchart: when 8% wins, when graduated + OSD wins, when itemized wins
- **CTA Tools:** A1 (Self-Employed IT Optimizer)
- **Related Posts:** "Quarterly Income Tax Filing Guide," "BIR Form 1701A Step-by-Step"

### "RCIT vs. MCIT: A Complete Guide for Philippine SME Corporations"
- **URL:** /blog/rcit-vs-mcit-guide-philippine-corporations
- **Target Query:** "RCIT vs MCIT difference computation philippines"
- **Word Count:** 1000-1300
- **Content Outline:**
  - Explain why MCIT exists: it ensures corporations pay at least 2% of gross income even in low-profit or loss years
  - Detail when MCIT kicks in (4th year of operations) and the comparison mechanics
  - Walk through MCIT carry-forward: how excess MCIT becomes a credit against RCIT in the next 3 years, with a worked example
  - Cover the CREATE Act reduced rate (20% for small corporations) and how it interacts with MCIT
  - Address common errors: forgetting to track carry-forward credits, NOLCO misapplication
- **CTA Tools:** A2 (Corporate IT Calculator)
- **Related Posts:** "Quarterly Corporate IT Filing Calendar," "NOLCO Carry-Over Guide"

### "How to Compute Capital Gains Tax on Philippine Property Sales (2026 Guide)"
- **URL:** /blog/how-to-compute-capital-gains-tax-property-philippines
- **Target Query:** "how to compute capital gains tax property sale philippines"
- **Word Count:** 1000-1500
- **Content Outline:**
  - Explain the 6% CGT formula and the three-way valuation comparison (selling price vs. zonal value vs. assessed value)
  - Guide readers on how to look up BIR zonal values for their barangay
  - Cover the simultaneous DST obligation (1.5%) and the total transfer tax picture
  - Detail the 30-day filing deadline and penalty consequences (25% surcharge + 12% interest per NIRC Sec. 248/249)
  - Discuss the principal residence exemption and the 18-month reinvestment window
- **CTA Tools:** A3 (CGT Real Property), C4 (DST Engine), C5 (Property Transfer Tax Bundler)
- **Related Posts:** "Complete Guide to Property Transfer Taxes," "BIR Zonal Values Explained"

### "Capital Gains Tax on Unlisted Shares: What Philippine Business Owners Need to Know"
- **URL:** /blog/capital-gains-tax-unlisted-shares-philippines
- **Target Query:** "CGT unlisted shares philippines how to compute"
- **Word Count:** 800-1200
- **Content Outline:**
  - Distinguish between CGT on unlisted shares (15%) and stock transaction tax on listed shares (0.6% / 0.1% post-CMEPA)
  - Explain the FMV determination requirement under RR 20-2020 (adjusted net asset method)
  - Walk through a worked example: founder selling shares in a family corporation
  - Cover the DST on share transfers (0.75% of par value) and the concurrent Form 2000-OT filing
  - Warn about below-FMV transfers and the donor's tax exposure
- **CTA Tools:** A4 (CGT Unlisted Shares), C4 (DST Engine)
- **Related Posts:** "Capital Gains Tax on Real Property," "Donor's Tax Guide Philippines"

### "Do Employees Need to File Income Tax Returns? Understanding Substituted Filing"
- **URL:** /blog/do-employees-need-to-file-income-tax-philippines
- **Target Query:** "do I need to file income tax return employee philippines"
- **Word Count:** 800-1000
- **Content Outline:**
  - Explain substituted filing: when your employer's 1604CF serves as your ITR and you are exempt from filing 1700
  - List the specific scenarios that disqualify substituted filing: multiple employers, additional income sources, tax withheld does not equal tax due
  - Walk through the BIR 2316 certificate and how to verify your employer filed correctly
  - Cover the common scenario of switching jobs mid-year and the resulting obligation to file
  - Address penalties for non-filing when substituted filing does not apply
- **CTA Tools:** A5 (Compensation IT Calculator), B1 (BIR Form Navigator)
- **Related Posts:** "Philippine Income Tax Table 2026," "How to File BIR Form 1700"
