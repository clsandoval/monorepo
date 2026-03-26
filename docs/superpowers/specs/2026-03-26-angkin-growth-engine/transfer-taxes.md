# Transfer & Transaction Taxes Hub -- angkin.ph SEO Spec

## Hub Page
- **URL:** /transfer-taxes/
- **H1:** "Transfer & Transaction Tax Calculators & Tools -- Philippines"
- **Overview:**

  Every time a Filipino donates property to a child, sells real estate, files a deed of sale, executes a loan agreement, or transfers shares in a family corporation, multiple transfer and transaction taxes are triggered -- often simultaneously and across different government agencies. Donor's tax (6% via BIR), VAT (12% via BIR), documentary stamp tax (47 different instrument rates via BIR), and local transfer tax (0.5-0.75% via LGU) each have their own computation rules, filing deadlines, and penalty structures.

  angkin.ph's Transfer & Transaction Taxes hub provides five specialized calculators that cover the full spectrum of Philippine transfer taxes: donor's tax for inter-vivos gifts, the VAT computation engine for business transactions, the VAT refund claims tool for zero-rated exporters, a documentary stamp tax engine covering all 47 taxable instrument types, and a property transfer tax bundler that computes all taxes triggered by a single real property sale in one computation. Together, these tools address the multi-agency complexity that currently costs Filipino property owners, business operators, and their professional advisors P20,000-P200,000+ per transaction in professional fees.

  The Philippine property transfer process requires coordination between the BIR (for CGT and DST), the LGU Treasurer (for local transfer tax), and the Registry of Deeds (for registration). Each agency uses a different valuation base -- BIR zonal value, LGU Schedule of Market Values, or Registry of Deeds fee schedule -- creating a complexity that professionals currently arbitrage through information asymmetry.

- **Hub FAQs:**
  1. What taxes do I need to pay when selling property in the Philippines?
  2. How is donor's tax computed in the Philippines after the TRAIN Law?
  3. What is documentary stamp tax (DST) and when do I need to pay it?
  4. How do I compute VAT for my business in the Philippines?
  5. Can I claim a VAT refund as an exporter or BPO company?
  6. What is the local transfer tax rate in my city or municipality?
  7. How are property transfer taxes split between buyer and seller?
  8. What is the deadline for filing donor's tax and what is the penalty for late filing?

- **Related Hubs:**
  - Tax (Income Tax) (/tax/) -- capital gains tax on real property (A3) and unlisted shares (A4) are frequently triggered alongside donor's tax and DST
  - Tax Administration (/tax-admin/) -- BIR penalty calculator (B2) computes penalties for late DST/donor's tax filing; compliance calendar (B3) tracks all transaction-triggered deadlines; eBIRForms bridge (B7) covers the manual-only Forms 1800, 2000, 2000-OT
  - Property & Real Estate (/property/) -- real property tax (RPT), RPVARA amnesty, and Maceda Law tools operate in the same property lifecycle

- **Structured Data:** CollectionPage + FAQPage

---

## Tools

### C1: Donor's Tax Calculator (BIR Form 1800)
- **URL:** /transfer-taxes/donors-tax-calculator
- **H1:** "Donor's Tax Calculator Philippines -- Free Online Calculator"
- **Opportunity Score:** 4.05 (Market 3 | Moat 4 | Computability 5 | Pain 4)
- **TAM:** Total TAM: P121M/year (Consumer P12.5M at P499/transaction for 25K addressable transactions; Professional P108M at P999/mo for 9K estate-planning CPAs/lawyers)
- **Professional Fee Displaced:** Lawyer/CPA preparation of BIR Form 1800: P5,000-P25,000 per donation; notarization of Deed of Donation: P200-P5,000 + 1-2% of property value; total professional cost for mid-value donation (P2M property): P20,000-P80,000
- **Governing Statute:** NIRC Sec. 98-104 (Title III -- Transfer Taxes), as amended by TRAIN Law (RA 10963); Revenue Regulations No. 12-2018 (implementing rules for TRAIN donor's tax); BIR Form 1800; flat 6% rate on cumulative net gifts exceeding P250,000 per calendar year; 30-day filing deadline from date of donation; Sec. 86(E) (donor's tax credit against estate tax if donor dies within 5 years -- tapering from 100% to 20%)
- **Target Keywords:**
  - Primary: "donors tax calculator philippines"
  - Secondary:
    - "donor's tax computation TRAIN law"
    - "BIR form 1800 calculator"
    - "6 percent donors tax philippines"
    - "donation tax exemption P250,000"
    - "how to compute donor's tax on property"
  - Long-tail:
    - "how to compute donors tax in the philippines 2026"
    - "donors tax on property donation to children"
    - "BIR form 1800 how to file and compute"
    - "is there an exemption for donors tax in the philippines"
    - "donors tax on cash donation above 250,000"
    - "how to get BIR CAR for donated property"
    - "difference between donors tax and estate tax philippines"
    - "donors tax computation for land donation to family members"
- **How It Works Content:**
  - Walk through the post-TRAIN flat 6% formula: determine FMV of donated property (for real property: higher of BIR zonal value or assessed value); deduct encumbrances assumed by donee; compute cumulative net gifts for the calendar year; apply P250,000 annual exemption; tax = 6% of excess per NIRC Sec. 99 as amended
  - Explain the cumulative YTD tracking requirement: multiple donations within one calendar year compound -- each subsequent donation adds to the cumulative total, and tax already paid on prior donations is credited per Sec. 100
  - Detail the BIR CAR (Certificate Authorizing Registration) process: no title transfer at the Registry of Deeds without BIR CAR; taxpayer must file Form 1800, pay the tax, and obtain CAR before the RD will process the title transfer
  - Cover the common confusion between donation (inter-vivos, triggers donor's tax) and inheritance (mortis causa, triggers estate tax): many Filipinos attempt to register inherited property using a deed of donation, or vice versa
  - Explain the donor's tax credit against estate tax per Sec. 86(E): if the donor dies within 5 years of the donation, the donor's tax paid is creditable against the estate tax on a tapering schedule (100% in year 1, 80% in year 2, 60% in year 3, 40% in year 4, 20% in year 5)
- **Step-by-Step Guide:**
  1. Select the type of donated property: real property, cash, personal property, or shares of stock
  2. For real property: enter the BIR zonal value and assessed value (tool selects the higher as FMV)
  3. Enter any encumbrances or liabilities assumed by the donee (mortgage, liens)
  4. Enter the date of donation (for 30-day deadline computation)
  5. Enter any prior donations made in the same calendar year (for cumulative threshold)
  6. Tool computes: net gift for this donation, cumulative YTD net gifts, taxable amount over P250,000, donor's tax due, minus prior donor's tax paid in same year
  7. View the required documents for BIR Form 1800 filing and BIR CAR application
  8. Check if concurrent DST is triggered (real property donations also trigger DST per Sec. 196)
- **FAQ Topics:**
  1. What is the donor's tax rate in the Philippines?
  2. Is the P250,000 exemption per donation or per year?
  3. What is the deadline for filing donor's tax?
  4. Do I need to pay donor's tax on cash gifts to my children?
  5. What is the BIR CAR and why do I need it for donated property?
  6. What is the difference between donor's tax and estate tax?
  7. Can donor's tax paid be credited against estate tax?
  8. What is the penalty for late filing of donor's tax (BIR Form 1800)?
- **Related Tools:**
  - A3 (CGT Real Property) -- if the transfer is a sale rather than a donation, CGT applies instead
  - C4 (DST Engine) -- real property donations also trigger DST (1.5% of FMV)
  - C5 (Property Transfer Tax Bundler) -- for transactions involving both sale and donation elements
  - B2 (BIR Penalty Calculator) -- penalties for late filing of donor's tax (25% surcharge + 12% interest)
  - B7 (eBIRForms Bridge) -- BIR Form 1800 is one of the forms not yet served by Taxumo/JuanTax
- **Structured Data:** SoftwareApplication (applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}, applicationSubCategory: "Tax Calculator")

---

### C2: VAT Computation Engine
- **URL:** /transfer-taxes/vat-calculator
- **H1:** "VAT Calculator Philippines (Quarterly BIR Form 2550Q) -- Free Online Calculator"
- **Opportunity Score:** 3.75 (Market 4 | Moat 3 | Computability 4 | Pain 4)
- **TAM:** Total TAM: P1.29B/year (Consumer P931M at P199/mo for 390K addressable VAT-registered businesses; Professional P360M at P999/mo for 30K CPAs/bookkeepers)
- **Professional Fee Displaced:** Bookkeeping with monthly/quarterly VAT filing P3,000-P15,000/month (P36,000-P180,000/year); CPA firm quarterly VAT return preparation P3,000-P10,000 per quarter; complex mixed transactions P20,000+/quarter
- **Governing Statute:** NIRC Sec. 105-115 (Title IV -- Value-Added Tax), as amended by TRAIN Law and EOPT Act; Sec. 106(A)(2) and 108(B) (zero-rated sales); Sec. 109 (VAT-exempt transactions); Sec. 110(B) (proportional input tax allocation for mixed transactions); Sec. 114 (5% final withholding VAT on government procurement); RR 3-2024 (EOPT VAT implementation); RA 12023 (12% VAT on digital services effective October 2024); BIR Forms 2550Q (quarterly, post-EOPT), 2550M (monthly for large taxpayers)
- **Target Keywords:**
  - Primary: "VAT calculator philippines"
  - Secondary:
    - "BIR 2550Q VAT computation"
    - "output VAT input VAT computation"
    - "quarterly VAT return calculator"
    - "VAT on digital services Philippines 2024"
    - "zero-rated VAT philippines"
  - Long-tail:
    - "how to compute VAT payable quarterly in the philippines"
    - "output VAT minus input VAT computation example"
    - "how to file BIR form 2550Q quarterly VAT return"
    - "VAT input tax allocation mixed taxable and exempt sales"
    - "zero rated vs VAT exempt difference philippines"
    - "VAT carry forward input tax credit computation"
    - "new VAT on Netflix Spotify digital services philippines"
    - "5 percent withholding VAT government procurement computation"
- **How It Works Content:**
  - Explain the basic VAT formula: output VAT (12% of gross taxable sales) minus input VAT (12% of VAT-paid purchases attributable to taxable sales) = VAT payable; if negative, carry forward or apply for refund per NIRC Sec. 110
  - Detail the three transaction categories: taxable (12% output VAT, input VAT deductible), zero-rated (0% output VAT, input VAT still creditable -- generates refund eligibility), exempt (no output VAT, no input VAT credit) per Sec. 106/108/109
  - Cover the proportional input tax allocation for mixed transactions: when a business has both taxable and exempt sales, input VAT must be allocated proportionally per Sec. 110(B)
  - Explain the quarterly filing shift under EOPT Act: most VAT-registered businesses now file quarterly (2550Q) instead of monthly (2550M); monthly filing retained only for large taxpayers
  - Note the new digital services VAT under RA 12023 (October 2024): non-resident digital service providers (Netflix, Spotify, Google, etc.) must register for and collect 12% VAT on services consumed in the Philippines
- **Step-by-Step Guide:**
  1. Enter total sales/receipts for the quarter, categorized by taxable, zero-rated, and exempt
  2. Enter total purchases for the quarter with input VAT amounts, categorized by directly attributable to taxable/zero-rated vs. common purchases
  3. For mixed transactions: tool automatically allocates common input VAT proportionally based on sales mix
  4. Enter any input VAT carry-forward from prior quarters
  5. Enter 5% final withholding VAT on government sales (if applicable)
  6. Tool computes: output VAT, creditable input VAT, net VAT payable or excess input VAT
  7. Review whether excess input qualifies for refund (zero-rated) or carry-forward only (mixed)
  8. Generate BIR Form 2550Q worksheet with computation breakdown
- **FAQ Topics:**
  1. How do I compute VAT payable for my business?
  2. What is the difference between zero-rated and VAT-exempt?
  3. How do I claim input VAT credits?
  4. When do I need to register for VAT?
  5. How is input VAT allocated for mixed transactions?
  6. Can I carry forward excess input VAT to the next quarter?
  7. What is the 5% final VAT on government sales?
  8. Does VAT now apply to Netflix and Spotify in the Philippines?
- **Related Tools:**
  - C3 (VAT Refund Claims) -- for zero-rated businesses with excess input VAT eligible for refund
  - B3 (Compliance Calendar) -- tracks quarterly 2550Q filing deadlines
  - B2 (BIR Penalty Calculator) -- penalties for late VAT filing
  - A1 (Self-Employed IT) -- for self-employed professionals who are also VAT-registered
  - C4 (DST Engine) -- some VAT-triggering transactions also trigger DST
- **Structured Data:** SoftwareApplication (applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}, applicationSubCategory: "Tax Calculator")

---

### C3: VAT Refund Claims Engine (NIRC Sec. 112)
- **URL:** /transfer-taxes/vat-refund-claims-calculator
- **H1:** "VAT Refund Claims Calculator (Section 112) -- Free Online Calculator"
- **Opportunity Score:** 3.65 (Market 2 | Moat 5 | Computability 3 | Pain 5)
- **TAM:** Total TAM: P108M/year (Consumer/in-house P90M at P999/mo for 7.5K addressable zero-rated businesses; Professional P18M at P2,999/mo for 500 specialist practitioners)
- **Professional Fee Displaced:** Tax firms charge 3-10% success fee on refund amount (for a P5M refund: P150,000-P500,000); flat retainers P200,000-P2M+ per engagement for law firms handling complex claims
- **Governing Statute:** NIRC Sec. 112 (VAT refund claims for zero-rated sellers); Sec. 112(A) (refund of input tax attributable to zero-rated sales); Sec. 112(C) (5% of total BIR+BOC VAT collection auto-appropriated for refund fund -- P28.75B for 2023); RR 14-2020 (VAT refund processing); RMC 71-2023 + RMO 23-2023 (streamlined documentary requirements -- reduced from 30 to 9-17 documents); BIR Form 1914 (Application for Tax Refund/TCC); 2-year prescriptive period from close of taxable quarter; 90-day BIR processing period post-EOPT; CREATE MORE Act RA 12066 (November 2024, further streamlined zero-rating and refund)
- **Target Keywords:**
  - Primary: "VAT refund claim philippines calculator"
  - Secondary:
    - "section 112 VAT refund NIRC"
    - "BIR form 1914 tax refund"
    - "zero rated VAT refund computation"
    - "input VAT refund exporters BPO"
    - "PEZA VAT refund claim"
  - Long-tail:
    - "how to file VAT refund claim with BIR section 112"
    - "VAT refund for exporters BPO IT-BPM philippines"
    - "BIR form 1914 application for tax refund computation"
    - "input VAT attribution schedule zero rated sales"
    - "two year prescriptive period VAT refund when to file"
    - "RMO 23-2023 reduced documentary requirements VAT refund"
    - "PEZA locator VAT zero rating refund process"
    - "how long does BIR take to process VAT refund claims"
- **How It Works Content:**
  - Explain VAT refund eligibility: businesses with zero-rated sales (exporters, BPO/IT-BPM companies, PEZA/BOI locators) accumulate input VAT that cannot be applied against output tax (since output VAT on zero-rated sales is P0) per Sec. 106(A)(2) and 108(B)
  - Detail the input VAT attribution computation: directly attributable input VAT to zero-rated sales is fully refundable; common input VAT must be allocated proportionally based on sales mix per Sec. 110(B)
  - Cover the 2-year prescriptive period: refund application must be filed within 2 years after the close of the taxable quarter when zero-rated sales were made -- missing this deadline permanently forfeits the claim per Sec. 112(A)
  - Explain the streamlined documentary requirements under RMC 71-2023 and RMO 23-2023: the checklist was reduced from 30 to 9-17 documents, classified by risk level (low/medium/high)
  - Note the 5% special fund under Sec. 112(C): 5% of total BIR+BOC VAT collection (approximately P28.75B for 2023) is auto-appropriated annually for refund payments
- **Step-by-Step Guide:**
  1. Enter total zero-rated sales for the taxable quarter
  2. Enter total taxable and exempt sales for the same quarter
  3. Enter input VAT directly attributable to zero-rated sales
  4. Enter common input VAT (not directly attributable) for proportional allocation
  5. Tool computes refundable input VAT using the attribution and allocation methodology
  6. Enter the quarter-end date to compute the 2-year prescriptive filing deadline
  7. Tool generates the documentary checklist under RMO 23-2023 based on risk classification
  8. Review the refund claim summary for BIR Form 1914 preparation
- **FAQ Topics:**
  1. Who is eligible for a VAT refund in the Philippines?
  2. What is the 2-year prescriptive period for VAT refund claims?
  3. How long does BIR take to process VAT refund applications?
  4. What documents are required for a VAT refund claim?
  5. How is input VAT attributed to zero-rated sales?
  6. Can PEZA-registered companies claim VAT refunds?
  7. What is BIR Form 1914?
  8. What happens if I miss the 2-year filing deadline?
- **Related Tools:**
  - C2 (VAT Computation Engine) -- computes the quarterly VAT that generates the excess input for refund claims
  - B3 (Compliance Calendar) -- tracks the 2-year prescriptive period deadlines
  - B2 (BIR Penalty Calculator) -- while refund claims do not trigger penalties, late quarterly VAT filing does
  - A2 (Corporate IT) -- PEZA/BOI-registered corporations have special CIT treatment alongside VAT zero-rating
  - B7 (eBIRForms Bridge) -- assists with Form 1914 preparation
- **Structured Data:** SoftwareApplication (applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}, applicationSubCategory: "Tax Refund Calculator")

---

### C4: Documentary Stamp Tax (DST) Engine
- **URL:** /transfer-taxes/documentary-stamp-tax-calculator
- **H1:** "Documentary Stamp Tax (DST) Calculator Philippines -- Free Online Calculator"
- **Opportunity Score:** 4.10 (Market 5 | Moat 3 | Computability 5 | Pain 3)
- **TAM:** Total TAM: P605M/year (Consumer P281M blended -- P239M from 100K regular business filers at P199/mo + P42M from 140K one-time filers at P299/transaction; Professional P324M at P999/mo for 27K bookkeepers/CPAs)
- **Professional Fee Displaced:** DST computation bundled in real estate transaction fees (P10,000-P50,000 full conveyancing package); private loan DST often not computed at all, creating penalty exposure; bookkeeper hourly billing P300-P600/hour for DST preparation (1-3 hours per complex schedule)
- **Governing Statute:** NIRC Sec. 173-201 (Title VII -- Documentary Stamp Tax), as amended by TRAIN Law and EOPT Act; RR 4-2024 (EOPT implementation); RMC 48-2024 (new Form 2000 version); BIR Forms 2000 (monthly DST declaration, due 5th of following month), 2000-OT (one-time transaction DST). Key rates: Sec. 196 -- real property deeds of sale at P15 per P1,000 (1.5%); Sec. 179 -- loan agreements at P1.50 per P200 (0.75%); Sec. 174 -- original share issuance at P2 per P200 par value (1%); Sec. 175 -- share transfers at P1.50 per P200 par value (0.75%); Sec. 194 -- leases at P3 for first P2,000 then P1 per P1,000; Sec. 195 -- mortgages at P40 for first P5,000 then P20 per P5,000
- **Target Keywords:**
  - Primary: "documentary stamp tax calculator philippines"
  - Secondary:
    - "DST computation real property sale"
    - "DST on loan agreement philippines"
    - "BIR form 2000 DST computation"
    - "documentary stamp tax rates 2026"
    - "DST on share transfer computation"
  - Long-tail:
    - "how to compute documentary stamp tax on property sale philippines"
    - "DST rate on loan agreement promissory note"
    - "BIR form 2000 OT one time DST computation"
    - "documentary stamp tax on lease agreement computation"
    - "DST on share issuance original subscription"
    - "what documents are subject to documentary stamp tax"
    - "penalty for not paying DST inadmissibility in court"
    - "how to compute DST on installment sale full contract price"
- **How It Works Content:**
  - Present the complete DST rate schedule across all 47 taxable instrument types in the NIRC, with the most common rates: real property deeds (1.5%), loan agreements (0.75%), original share issuance (1%), share transfers (0.75%), leases (tiered), and mortgages (tiered) per Sec. 173-201
  - Explain the valuation base for real property DST: same as CGT -- higher of selling price or BIR zonal value / assessed value per Sec. 196
  - Cover the installment sale rule: DST is computed on the FULL contract price at time of execution, not on individual installment payments (per BIR Ruling OT-028-2024, which was needed because of widespread miscalculation)
  - Detail the 5-day filing deadline: Form 2000 (monthly declaration) is due by the 5th of the month following the month the document was executed -- one of the tightest deadlines in the BIR calendar
  - Warn about the inadmissibility penalty per Sec. 201: courts cannot admit unstamped or insufficiently stamped documents as evidence -- this makes DST compliance critical for enforceability of contracts
- **Step-by-Step Guide:**
  1. Select the document type from the catalog of 47 DST-taxable instruments
  2. Enter the transaction value (selling price, loan amount, par value, lease amount, etc.)
  3. For real property: enter BIR zonal value and assessed value; tool selects the highest as DST base
  4. For installment sales: enter the full contract price (not installment amount)
  5. Tool computes the DST using the applicable statutory rate formula
  6. View the legal basis with the specific NIRC section cited
  7. For one-time transactions: generate Form 2000-OT computation worksheet
  8. For regular monthly filers: aggregate all monthly DST-triggering documents for Form 2000
- **FAQ Topics:**
  1. What is documentary stamp tax and which documents are subject to it?
  2. How much is the DST on a property sale?
  3. Is DST separate from capital gains tax?
  4. Do I need to pay DST on a loan between friends or family?
  5. What is the DST rate on share issuance and share transfers?
  6. When is the deadline for filing DST?
  7. What happens if I do not pay DST on a document?
  8. Is DST computed on the installment payment or the full contract price?
- **Related Tools:**
  - A3 (CGT Real Property) -- real property sales trigger both CGT and DST simultaneously
  - A4 (CGT Unlisted Shares) -- share transfers trigger both CGT (15%) and DST (0.75%) simultaneously
  - C1 (Donor's Tax) -- property donations trigger both donor's tax and DST
  - C5 (Property Transfer Tax Bundler) -- bundles DST with all other transfer taxes for property sales
  - B2 (BIR Penalty Calculator) -- penalties for late DST filing (25% surcharge + 12% interest + inadmissibility)
- **Structured Data:** SoftwareApplication (applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}, applicationSubCategory: "Tax Calculator")

---

### C5: Property Transfer Tax Bundler
- **URL:** /transfer-taxes/property-transfer-tax-bundler
- **H1:** "Complete Property Transfer Tax Calculator (CGT + DST + Transfer Tax) -- Free Online Calculator"
- **Opportunity Score:** 3.75 (Market 3 | Moat 4 | Computability 4 | Pain 4)
- **TAM:** Total TAM: P135M/year (Consumer P21M at P199/transaction for 106K addressable transactions; Professional P114M at P500/mo allocated within a broader bundle for 19K real estate professionals). Bundled ONETT suite (A3 + C4 + C5 + C1) at P999/transaction: P127M/year consumer.
- **Professional Fee Displaced:** Real estate lawyer P15,000-P80,000 per transaction for full transfer coordination; sellers routinely underestimate total transfer cost (typically 8-10% of sale price all-in); the computation itself is arithmetically simple but spans 3 agencies with 3 different valuation bases
- **Governing Statute:** NIRC Sec. 24(D) (6% CGT -- BIR); NIRC Sec. 196 (1.5% DST on deeds of sale -- BIR); RA 7160 Local Government Code Sec. 135 (LGU Transfer Tax: 0.5% for municipalities/provinces, 0.75% for cities/Metro Manila, on the higher of consideration or FMV); LRA Registration Fee Schedule (Registry of Deeds); PD 1529 (Property Registration Decree)
- **Target Keywords:**
  - Primary: "property transfer tax calculator philippines"
  - Secondary:
    - "total cost of selling property philippines"
    - "CGT DST transfer tax computation"
    - "real property transfer taxes Philippines"
    - "closing costs property sale Philippines"
    - "LGU transfer tax rate philippines"
  - Long-tail:
    - "how to compute all taxes when selling property in the philippines"
    - "total transfer taxes buyer seller property sale philippines"
    - "CGT plus DST plus local transfer tax computation"
    - "closing costs calculator selling house philippines"
    - "local government transfer tax rate Metro Manila cities"
    - "Registry of Deeds registration fee schedule property transfer"
    - "how much does it cost to transfer property title philippines"
    - "property sale taxes BIR LGU Registry of Deeds computation"
- **How It Works Content:**
  - Explain the four-tax structure for Philippine property transfers: (1) Capital Gains Tax at 6% of higher of selling price or zonal value (BIR, paid by seller); (2) Documentary Stamp Tax at 1.5% of same base (BIR, typically paid by buyer but negotiable); (3) Local Transfer Tax at 0.5%/0.75% of higher of consideration or FMV per LGU Schedule of Market Values (LGU Treasurer, paid by buyer); (4) Registration Fee per the LRA schedule (Registry of Deeds, paid by buyer) per respective governing laws
  - Detail the three different valuation bases used by the three agencies: BIR uses zonal values per Revenue District Office; LGU uses the Schedule of Market Values (SMV) updated every 3 years under RA 7160; Registry of Deeds uses a separate fee schedule -- these values frequently differ from each other
  - Cover the filing/payment sequence and timeline: CGT must be paid first (within 30 days of notarization) to obtain BIR CAR; then DST and local transfer tax are paid; finally, the new title is registered at the Registry of Deeds
  - Explain the typical cost allocation between buyer and seller: CGT is the seller's obligation by statute; DST, local transfer tax, and RD fees are the buyer's by convention but negotiable
  - Note the multi-agency navigation challenge: the entire process requires visits to the Notary Public, BIR RDO, LGU Treasurer's Office, and Registry of Deeds -- each with its own queue, documents, and timelines
- **Step-by-Step Guide:**
  1. Enter the gross selling price / consideration
  2. Enter the BIR zonal value of the property (tool provides lookup guidance)
  3. Enter the assessed value from the tax declaration and the LGU SMV
  4. Select the LGU location (city or municipality) for the correct transfer tax rate (0.5% or 0.75%)
  5. Tool computes all four taxes/fees simultaneously:
     - CGT: 6% of MAX(selling price, zonal value, assessed value)
     - DST: 1.5% of same base
     - Local Transfer Tax: 0.5%/0.75% of MAX(consideration, LGU FMV)
     - RD Registration Fee: per LRA schedule based on property value
  6. View total transfer cost as a percentage of property value
  7. See the buyer vs. seller cost allocation breakdown
  8. Review the step-by-step filing timeline with required documents per agency
- **FAQ Topics:**
  1. What are all the taxes I need to pay when buying or selling property in the Philippines?
  2. Who pays CGT -- the buyer or the seller?
  3. What is the local transfer tax and how is it different from CGT?
  4. How do I find the BIR zonal value vs. the LGU Schedule of Market Values?
  5. What is the typical total transfer cost as a percentage of property value?
  6. How long does the entire property transfer process take?
  7. What documents do I need for each agency (BIR, LGU, Registry of Deeds)?
  8. Can the buyer and seller agree to split the taxes differently?
- **Related Tools:**
  - A3 (CGT Real Property) -- detailed CGT computation with principal residence exemption analysis
  - C4 (DST Engine) -- standalone DST computation for any document type
  - C1 (Donor's Tax) -- if the transfer is a donation rather than a sale
  - B2 (BIR Penalty Calculator) -- penalties for missing the 30-day CGT deadline
  - B7 (eBIRForms Bridge) -- electronic filing of Forms 1706 and 2000-OT
- **Structured Data:** SoftwareApplication (applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: {price: "0", priceCurrency: "PHP"}, applicationSubCategory: "Property Tax Calculator")

---

## Blog Posts

### "Complete Guide to Philippine Property Transfer Taxes: CGT, DST, Transfer Tax, and Registration Fees"
- **URL:** /blog/complete-guide-property-transfer-taxes-philippines
- **Target Query:** "property transfer taxes philippines complete guide"
- **Word Count:** 1500
- **Content Outline:**
  - Break down each of the four taxes/fees triggered by a property sale: CGT (6%), DST (1.5%), local transfer tax (0.5-0.75%), and RD registration fee
  - Walk through a worked example: selling a P5M property in Quezon City with specific zonal and assessed values
  - Explain the different valuation bases used by BIR, LGU, and RD
  - Detail the step-by-step process from Deed of Absolute Sale through title transfer completion
  - Cover the buyer vs. seller cost allocation conventions
- **CTA Tools:** C5 (Property Transfer Tax Bundler), A3 (CGT Real Property), C4 (DST Engine)
- **Related Posts:** "How to Compute Capital Gains Tax," "Donor's Tax Guide Philippines"

### "Donor's Tax in the Philippines After TRAIN Law: Everything You Need to Know"
- **URL:** /blog/donors-tax-philippines-train-law-guide
- **Target Query:** "donors tax philippines TRAIN law computation"
- **Word Count:** 1200-1500
- **Content Outline:**
  - Explain the post-TRAIN simplification: flat 6% rate replaced the old graduated table; P250,000 annual exemption per donor
  - Walk through three common scenarios: donating land to a child, gifting cash above the threshold, transferring shares to a family member
  - Detail the cumulative YTD tracking requirement with a worked example of multiple donations in one year
  - Cover the BIR CAR process and why title transfer is blocked without it
  - Address the OFW remittance question: when do family remittances trigger donor's tax?
- **CTA Tools:** C1 (Donor's Tax Calculator)
- **Related Posts:** "Property Transfer Taxes Complete Guide," "Difference Between Donor's Tax and Estate Tax"

### "Documentary Stamp Tax: The Hidden Tax Filipinos Keep Missing"
- **URL:** /blog/documentary-stamp-tax-hidden-tax-philippines
- **Target Query:** "documentary stamp tax philippines what documents"
- **Word Count:** 1000-1300
- **Content Outline:**
  - Explain why DST catches people off guard: it applies to 47 different document types, many that people create routinely (loan agreements, leases, share transfers)
  - Cover the most commonly missed DST obligations: private loans between individuals, lease agreements, share subscriptions
  - Detail the inadmissibility penalty under Sec. 201: unstamped documents cannot be admitted as evidence in court
  - Walk through DST computation for the five most common document types with worked examples
  - Explain the installment sale trap: DST is on the full contract price, not individual installments
- **CTA Tools:** C4 (DST Engine)
- **Related Posts:** "Property Transfer Taxes Guide," "BIR Penalty Calculator Guide"

### "VAT for Philippine Businesses: Output Tax, Input Tax, and Quarterly Filing Explained"
- **URL:** /blog/vat-businesses-philippines-output-input-quarterly-filing
- **Target Query:** "VAT computation philippines business quarterly filing"
- **Word Count:** 1200-1500
- **Content Outline:**
  - Explain the basic VAT mechanics: 12% output on sales, input credits on purchases, net payable = output minus input
  - Cover the P3M mandatory registration threshold and consequences of crossing it
  - Detail the quarterly filing change under EOPT Act (from monthly 2550M to quarterly 2550Q for most filers)
  - Walk through input VAT allocation for businesses with mixed taxable/exempt sales
  - Address the October 2024 digital services VAT (RA 12023) and what it means for businesses using foreign SaaS
- **CTA Tools:** C2 (VAT Calculator)
- **Related Posts:** "Zero-Rated vs. VAT Exempt Explained," "BIR Compliance Calendar 2026"

### "VAT Refund Claims for Exporters and BPO Companies: A Section 112 Guide"
- **URL:** /blog/vat-refund-claims-exporters-bpo-section-112-guide
- **Target Query:** "VAT refund claim exporters BPO section 112 philippines"
- **Word Count:** 1000-1300
- **Content Outline:**
  - Explain why zero-rated businesses accumulate refundable input VAT: zero-rated output means no offset for input tax paid on purchases
  - Detail the 2-year prescriptive period and why missing it permanently forfeits the claim
  - Cover the streamlined documentary requirements under RMC 71-2023 and RMO 23-2023 (from 30 to 9-17 documents)
  - Walk through the input VAT attribution methodology: direct attribution vs. proportional allocation
  - Address the historical backlog and the EOPT 90-day processing improvement
- **CTA Tools:** C3 (VAT Refund Claims Engine), C2 (VAT Calculator)
- **Related Posts:** "VAT for Philippine Businesses Guide," "BIR Penalty Calculator Guide"
