# Trade, Customs & Excise — angkin.ph SEO Spec

## Hub Page

- **URL:** /customs/
- **H1:** "Trade, Customs & Excise Calculators & Tools — Philippines"
- **Overview:**

The Bureau of Customs (BOC) is the second-largest revenue-generating agency in the Philippine government, collecting PHP 931.05 billion in 2024. It administers all import-related duties and taxes under the Customs Modernization and Tariff Act (CMTA, RA 10863), governing total Philippine imports of USD 134.9 billion (2024). Every formal import entry requires a licensed customs broker (CMTA Section 802), and every imported good — from a PHP 500 Shopee International package to a PHP 50 million industrial machine — passes through a multi-step computation of customs duty, excise tax, VAT, brokerage fees, and processing charges.

The angkin.ph customs hub provides five free calculators covering the full spectrum of trade compliance: from computing the total landed cost of imported goods (F-BOC-1), through verifying automobile excise tax transparency for the 400,000+ new vehicles sold annually (F-BOC-3), to assessing Post-Clearance Audit (PCA) exposure where penalties reach 125%-600% of duty deficiency plus 20% annual interest (F-BOC-2). The hub also covers Free Trade Agreement (FTA) rate optimization to help SMEs claim tariff savings they routinely miss (F-BOC-4), and petroleum/alcohol/tobacco excise computation for importers in those regulated sectors (F-BOC-5).

The core pain point is opacity: BOC's own online estimator is limited to informal entries under PHP 50,000 and is not integrated with the Tariff Finder. No unified, comprehensive tool exists for Philippine importers to compute total landed cost before goods arrive. Licensed customs brokers charge PHP 1,300 to PHP 5,300+ per formal entry (statutory brokerage fee schedule under CAO 1-2001), and Post-Clearance Audit response engagements run PHP 50,000 to PHP 500,000 through Big 4 advisory firms. These tools bring transparency to a domain where information asymmetry costs Filipino businesses billions annually.

- **Hub FAQs:**

1. **How do I compute the total landed cost of an imported product in the Philippines?**
Total landed cost = CIF Value (Cost + Insurance + Freight) + Customs Duty (CIF x AHTN tariff rate, 0%-65%) + Excise Tax (if applicable) + VAT (12% of CIF + Duty + Excise) + Brokerage Fee (PHP 1,300-PHP 5,300+ per CAO 1-2001) + Import Processing Fee (PHP 250-PHP 1,000). The computation is governed by CMTA Sections 104, 201-203, and 1611.

2. **What is the de minimis threshold for Philippine imports?**
Under CAO 02-2025, imports with FOB/FCA value of PHP 10,000 or less shipped via B2C air freight are exempt from customs duty and VAT. However, multiple parcels to the same recipient at the same address on the same day are aggregated (consolidation rule), which catches many Filipino online shoppers by surprise.

3. **How much does a customs broker charge in the Philippines?**
Licensed customs broker fees follow the CAO 1-2001 statutory schedule: PHP 1,300 for shipments up to PHP 10,000 dutiable value, scaling to PHP 5,300 for shipments of PHP 100,000-PHP 200,000, plus 0.125% of the excess for shipments above PHP 200,000. Courier shipments are PHP 700 flat. These fees are mandatory for all formal import entries (CMTA Section 802).

4. **What are the automobile excise tax rates in the Philippines under the TRAIN Law?**
Under RA 10963 (TRAIN Law) amending NIRC Section 149: vehicles with Net Manufacturer/Importer Selling Price (NMISP) up to PHP 600,000 pay 4%; PHP 600,001-PHP 1,000,000 pay 10%; PHP 1,000,001-PHP 4,000,000 pay 20%; above PHP 4,000,000 pay 50%. Hybrid vehicles pay 50% of the applicable rate. Battery Electric Vehicles (BEVs) are fully exempt.

5. **What is a Post-Clearance Audit (PCA) and what are the penalties?**
Under CMTA Sections 1001-1005, BOC's Post-Clearance Audit Group (PCAG) can audit import entries within a 3-year lookback period from the date of payment. Penalties: 125% surcharge on duty deficiency for negligence, 600% surcharge for fraud (plus goods subject to seizure), and 20% per annum interest on the total assessment. PCAG collected PHP 2.71 billion in 2024.

6. **What is the Prior Disclosure Program (PDP) and how does it reduce penalties?**
Under CAO 01-2019, the PDP allows importers to voluntarily disclose customs duty or tax deficiencies before receiving an Audit Notification Letter (ANL). Voluntary disclosure caps penalties at standard deficiency plus interest only, avoiding the 125%/600% surcharge. The 3-year window allows self-correction at any time.

7. **How do Free Trade Agreements affect my import duties?**
The Philippines participates in multiple FTAs: ATIGA (ASEAN, mostly 0% for qualifying goods), AKFTA (ASEAN-Korea, 0%-5%), AIFTA (ASEAN-India, 0%-5%), and AJCEP (ASEAN-Japan, staged reductions). Claiming FTA rates requires a valid Certificate of Origin (Form D for ATIGA, Form AK for AKFTA, etc.) and compliance with Rules of Origin (40%+ ASEAN content for ATIGA).

8. **Are electric vehicles exempt from excise tax in the Philippines?**
Yes. Under the TRAIN Law (RA 10963), purely electric / Battery Electric Vehicles (BEVs) are fully exempt from excise tax. Hybrid Electric Vehicles (HEV/PHEV) pay 50% of the applicable excise rate bracket. This exemption applies to both locally manufactured and imported vehicles.

- **Related Hubs:**
  - **/ofw/** — OFW balikbayan box shipments benefit from duty-free thresholds; OFWs importing personal vehicles use the automobile excise calculator
  - **/transportation/** — Imported vehicles computed here flow into LTO registration costs computed in the transportation hub
  - **/business/** — Importers also face annual DTI/LGU business compliance obligations; SME importers using FTA rate optimization are likely also managing business permit renewals
  - **/professional-licensing/** — Customs brokers must maintain PRC licenses and CPD compliance tracked in the professional licensing hub

- **Structured Data:** CollectionPage + FAQPage (8 FAQs above)

---

## Tools

### F-BOC-1: BOC Landed Cost Calculator

- **URL:** /customs/landed-cost
- **H1:** "Philippine Import Duty & Landed Cost Calculator — Free Online Calculator"
- **Opportunity Score:** 4.00 (Top tier)
- **TAM:** PHP 185.5M/year (Consumer: ~32,500 addressable importers x PHP 199/mo = PHP 77.6M; Professional: ~9,000 active customs brokers x PHP 999/mo = PHP 107.9M)
- **Professional Fee Displaced:** Licensed customs brokers charge PHP 1,300-PHP 5,300+ per formal import entry (CAO 1-2001 statutory schedule) plus 0.125% of dutiable value above PHP 200,000; freight forwarder + brokerage bundled services run PHP 5,000-PHP 50,000+ for commercial importers; customs lawyers for classification disputes charge PHP 10,000-PHP 100,000+ per case; BOC has a free estimator at customs.gov.ph/estimator but it is limited to informal entries <PHP 50,000 and has no HS code lookup integration
- **Governing Statute:** CMTA (RA 10863) Sections 104 (when duty accrues), 201-203 (customs valuation — transaction value method), 1611 (tariff rates); NIRC Section 107 (12% VAT on importation); CAO 02-2025 (de minimis threshold PHP 10,000 FOB); CAO 1-2001 (brokerage fee schedule); AHTN (ASEAN Harmonized Tariff Nomenclature) Schedule of duty rates

- **Target Keywords:**
  - **Primary:** Philippine import duty calculator
  - **Secondary:** customs duty calculator Philippines, landed cost calculator, BOC duty computation, import tax Philippines, AHTN tariff rate lookup, customs brokerage fee calculator
  - **Long-tail:** how to compute import duty Philippines, total cost to import goods to Philippines, de minimis threshold Philippines 2026, import VAT computation Philippines, customs duty rate by HS code Philippines, how much is customs brokerage fee, Shopee international customs duty, import processing fee Philippines amount, CIF value computation Philippines

- **How It Works Content:**
  1. Establishes Customs Value using the CIF method per CMTA Section 201: CIF = Cost of Goods (FOB price) + Freight + Insurance, with multi-currency conversion at BSP reference rate
  2. Determines the applicable duty rate by looking up the 8-digit AHTN (ASEAN Harmonized Tariff Nomenclature) code — rates range from 0% to 65%, with most common rates at 0%, 1%, 3%, 5%, 7%, 10%, 15%, 20%, and 30%; applies FTA preferential rates (ATIGA/AKFTA/AIFTA/AJCEP) if Certificate of Origin is available
  3. Computes the full tax stack: Customs Duty (CIF x Rate) + Excise Tax (if applicable, per NIRC Sections 141-149) + VAT at 12% on the combined base of CIF + Duty + Excise (NIRC Section 107)
  4. Adds statutory fees: Brokerage fee per the CAO 1-2001 graduated schedule (PHP 1,300 for shipments up to PHP 10,000 dutiable value, scaling to PHP 5,300 + 0.125% of excess over PHP 200,000), Import Processing Fee (PHP 250 for under PHP 250K up to PHP 1,000 for over PHP 750K), and Documentary Stamp Tax
  5. Performs the de minimis check: if FOB/FCA value is PHP 10,000 or less AND the shipment is B2C air freight, the entire entry is exempt from duty and VAT per CAO 02-2025 — but warns about the consolidation rule (multiple parcels aggregated)

- **Step-by-Step Guide:**
  1. Enter the FOB (Free on Board) price of your goods in the original currency
  2. Enter the estimated freight cost and insurance amount (or use the tool's standard estimates)
  3. Select the product category or enter the AHTN/HS code directly (the tool provides a searchable code lookup)
  4. Select the country of origin (to determine whether FTA preferential rates apply)
  5. Indicate whether you have a valid Certificate of Origin (Form D/AK/AI/AJ) for FTA rate eligibility
  6. Select shipment type: Formal entry (requires broker) or Informal entry (self-filing, under PHP 50,000 dutiable value)
  7. Review your computed total: CIF value, customs duty, excise tax (if applicable), VAT, brokerage fee, IPF, and grand total landed cost
  8. Export the computation as a PDF or printable receipt for broker verification

- **FAQ Topics:**
  1. What is the CIF value and how is it different from FOB?
  2. How do I find the correct HS code for my imported product?
  3. Am I exempt from customs duty if my package is under PHP 10,000?
  4. What is the consolidation rule for de minimis imports?
  5. Do I need a customs broker for personal imports?
  6. How is the 12% import VAT computed — on the FOB price or the total?
  7. What is the Import Processing Fee and who pays it?
  8. Can I claim ASEAN free trade rates on my import from Thailand?

- **Related Tools:**
  - F-BOC-3 (Automobile Excise Tax Calculator) — for vehicle imports, the excise tax component is computed separately using the TRAIN Law rate table
  - F-BOC-2 (PCA Compliance Checker) — importers concerned about past entries can assess their audit exposure
  - F-BOC-4 (FTA Rate Optimizer) — compare MFN rates vs. ATIGA/AKFTA/AIFTA preferential rates to find tariff savings
  - F-BOC-5 (Petroleum/Alcohol/Tobacco Excise) — specific excise computation for regulated commodity imports
  - G-LTO-1 (MVUC Registration Calculator) — imported vehicles proceed to LTO registration after customs clearance

- **Structured Data:**
  ```json
  {
    "@type": "SoftwareApplication",
    "name": "Philippine Import Duty & Landed Cost Calculator",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "PHP" },
    "description": "Free calculator for Philippine import duty, VAT, brokerage fees, and total landed cost. Includes AHTN code lookup, FTA rate comparison, and de minimis checker."
  }
  ```

---

### F-BOC-2: BOC Post-Clearance Audit (PCA) Compliance Checker & PDP Advisor

- **URL:** /customs/pca-compliance
- **H1:** "BOC Post-Clearance Audit Penalty Calculator & PDP Advisor — Free Online Tool"
- **Opportunity Score:** 3.70 (Strong tier)
- **TAM:** PHP 32.1M-PHP 83.8M/year (Consumer: ~4,500 at-risk importers x PHP 499/assessment = PHP 2.2M conservative, or x PHP 999/mo = PHP 53.9M subscription ceiling; Professional: ~2,500 customs specialists x PHP 999/mo = PHP 29.9M)
- **Professional Fee Displaced:** Customs compliance law firms charge PHP 50,000-PHP 300,000 for PCA response engagement; Big 4 advisory firms (SGV/EY, PwC, KPMG) charge PHP 1,000-PHP 3,000/hour; PDP filing assistance runs PHP 20,000-PHP 100,000 per disclosure package; annual customs compliance review costs PHP 50,000-PHP 200,000
- **Governing Statute:** CMTA (RA 10863) Sections 1001-1005 (PCA authority, 3-year lookback); CMTA Section 1400 (penalties); CAO 01-2019 (PCA rules and Prior Disclosure Program)

- **Target Keywords:**
  - **Primary:** BOC post-clearance audit penalty calculator
  - **Secondary:** customs PCA Philippines, prior disclosure program BOC, CMTA penalty computation, customs audit exposure Philippines, BOC PCAG compliance
  - **Long-tail:** how to prepare for BOC post-clearance audit, PCA penalty 125% vs 600% difference, customs prior disclosure program how to file, BOC audit 3 year lookback rule, undervaluation penalty customs Philippines, how much is customs fraud penalty, PCAG audit notification letter Philippines, customs compliance self-assessment tool

- **How It Works Content:**
  1. Identifies import entries at risk within the 3-year lookback period from date of payment or duty-free clearance (CMTA Section 1001) — user inputs past import entries with declared CIF values and classifications
  2. Computes deficiency duties and taxes: Deficiency = (Correct CIF x Correct Duty Rate x 12% VAT) minus (Originally Paid Duties + Taxes), allowing users to model what-if scenarios for undervaluation or misclassification
  3. Applies the applicable penalty multiplier: 125% surcharge for negligence (good faith errors in valuation or classification) or 600% surcharge for fraud (deliberate undervaluation, misdeclaration, or use of falsified documents) per CMTA Section 1400 — plus 20% per annum interest on deficiency plus penalty from date of final assessment
  4. Models the Prior Disclosure Program (PDP) savings: voluntary disclosure before receiving an Audit Notification Letter (ANL) caps liability at deficiency plus standard interest only, avoiding the 125%/600% surcharge entirely — the tool computes the PHP savings from PDP vs. waiting for the ANL
  5. Calculates total exposure: Deficiency + Penalty + Accumulated Interest, with a side-by-side comparison of PDP-disclosed liability vs. post-ANL liability, showing the exact PHP amount saved by self-disclosure

- **Step-by-Step Guide:**
  1. Enter the import entry details: date of payment, declared CIF value, HS/AHTN code used, and duties/taxes paid
  2. Enter the corrected CIF value or corrected HS code (if you believe the original declaration was inaccurate)
  3. Select the likely penalty classification: Negligence (125%) or Fraud (600%)
  4. The tool computes: duty deficiency, applicable penalty surcharge, interest accrual to current date, and total liability
  5. Review the PDP comparison: total liability if disclosed voluntarily now vs. total liability if audited after ANL
  6. See the recommended action: file PDP (with timeline guidance) or wait (with risk assessment)
  7. Access the PDP filing checklist and nearest BOC/PCAG office contacts

- **FAQ Topics:**
  1. What triggers a BOC post-clearance audit?
  2. What is the difference between the 125% and 600% penalty?
  3. How far back can BOC audit my import entries?
  4. What is the Prior Disclosure Program and how does it save me money?
  5. Can I file a PDP after receiving an Audit Notification Letter?
  6. How is the 20% annual interest computed on my customs deficiency?
  7. Does undervaluation always result in the 600% fraud penalty?
  8. How much did PCAG collect in penalties in 2024?

- **Related Tools:**
  - F-BOC-1 (Landed Cost Calculator) — recompute the correct landed cost for entries you suspect were undervalued
  - F-BOC-4 (FTA Rate Optimizer) — verify whether you could have claimed a lower FTA rate instead of MFN, reducing deficiency exposure
  - F-BOC-3 (Automobile Excise Tax) — for vehicle importers facing PCA on excise tax declarations
  - R-DTI-1 (Business Compliance Calendar) — importers under PCA should also ensure their business permits and BIR filings are current

- **Structured Data:**
  ```json
  {
    "@type": "SoftwareApplication",
    "name": "BOC Post-Clearance Audit Penalty Calculator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "PHP" },
    "description": "Free tool to estimate BOC post-clearance audit exposure (125%/600% penalty + 20% interest) and compare PDP voluntary disclosure savings."
  }
  ```

---

### F-BOC-3: Automobile Excise Tax Transparency Calculator

- **URL:** /customs/auto-excise-tax
- **H1:** "Philippine Automobile Excise Tax Calculator (TRAIN Law) — Free Online Calculator"
- **Opportunity Score:** 3.85 (Strong tier)
- **TAM:** PHP 56.9M/year (Consumer: ~272,760 annual buyers x PHP 99/calculation = PHP 27.0M; Professional: ~2,500 dealerships x PHP 999/mo = PHP 29.9M)
- **Professional Fee Displaced:** No direct "professional fee" for excise tax calculation — the pain is information opacity. Car dealerships present all-in OTR (over-the-road) prices without transparently breaking out the excise tax component. For private vehicle imports, customs brokers charge PHP 10,000-PHP 50,000 for the entire clearance process; tax consultants for excise disputes charge PHP 50,000-PHP 200,000+
- **Governing Statute:** NIRC Section 149 as amended by RA 10963 (TRAIN Law) Section 49; RR No. 5-2018 (implementing rules for automobile excise); BOC Memorandum 2018-05-016; CMEPA (Comprehensive Motor Vehicle Enhancement and Promotion Act, effective 2025 — removes pick-up truck exemption)

- **Target Keywords:**
  - **Primary:** automobile excise tax calculator Philippines
  - **Secondary:** TRAIN Law car tax Philippines, excise tax on cars 2026, vehicle excise tax rate Philippines, car tax computation Philippines, NMISP excise calculator
  - **Long-tail:** how much is excise tax on cars Philippines, excise tax on hybrid car Philippines, electric car tax exemption Philippines, car excise tax bracket PHP 600000 vs PHP 1M, TRAIN law vehicle tax rate table, how to compute excise tax on imported car, pickup truck excise tax 2026 CMEPA, car dealer OTR price excise breakdown

- **How It Works Content:**
  1. Determines vehicle classification: automobiles (4+ wheel motor vehicles) are subject to excise tax; buses, trucks, cargo vans, jeepneys/jeepney substitutes, single-cab chassis, and special-purpose vehicles are exempt — effective 2025, CMEPA removes the pick-up truck exemption
  2. Computes the Net Manufacturer's/Importer's Selling Price (NMISP) — for domestic sales this is the declared selling price net of excise; for imports not for sale, NMISP = Total Landed Value (CIF + customs duty + all charges)
  3. Applies the TRAIN Law graduated rate table (RA 10963, effective 2018): up to PHP 600,000 = 4%; PHP 600,001-PHP 1,000,000 = 10%; PHP 1,000,001-PHP 4,000,000 = 20%; above PHP 4,000,000 = 50% — critically, rates apply to the FULL NMISP (not incrementally), creating significant bracket cliff effects
  4. Applies special rules: Battery Electric Vehicles (BEV) = fully EXEMPT from excise; Hybrid Electric Vehicles (HEV/PHEV) = 50% of the applicable bracket rate — the tool shows the PHP savings from choosing EV/hybrid vs. comparable ICE vehicle
  5. For imported vehicles, integrates with the landed cost computation: VAT Base = CIF + Customs Duty + Excise Tax; VAT = 12% of VAT Base — showing the full cascading tax effect where excise increases the VAT base

- **Step-by-Step Guide:**
  1. Select vehicle type: Automobile, SUV, Pickup (note CMEPA 2025 change), Hybrid, or Electric Vehicle
  2. Enter the Net Manufacturer's/Importer's Selling Price (NMISP) in PHP — or, for imports, enter CIF value + customs duty to compute NMISP automatically
  3. Select powertrain type: Internal Combustion Engine (ICE), Battery Electric (BEV), Hybrid (HEV), or Plug-in Hybrid (PHEV)
  4. Review the excise tax computation: applicable rate bracket, excise amount, VAT on (NMISP + Excise), and estimated OTR floor price
  5. See the bracket cliff warning: how a PHP 1 price difference at bracket boundaries creates PHP 36,000+ tax jumps
  6. Compare ICE vs. Hybrid vs. EV tax treatment side-by-side for vehicles in the same price range
  7. For imports: see the full landed cost including CIF, duty, excise, and VAT cascading

- **FAQ Topics:**
  1. What is the NMISP and how does it determine my car's excise tax?
  2. Why does a PHP 600,001 car pay so much more tax than a PHP 600,000 car?
  3. Are electric vehicles really tax-free in the Philippines?
  4. How much excise tax does a hybrid car pay?
  5. Is my pickup truck now subject to excise tax under CMEPA 2025?
  6. How do I verify the excise tax breakdown in my dealer's OTR price?
  7. What is the excise tax on a personally imported vehicle?
  8. Do buses, trucks, and jeepneys pay excise tax?

- **Related Tools:**
  - F-BOC-1 (Landed Cost Calculator) — compute the CIF + customs duty component that feeds into the excise tax base for imported vehicles
  - G-LTO-1 (MVUC Registration Calculator) — after computing excise tax, estimate your annual LTO registration cost including the EV/hybrid MVUC discount
  - G-LTO-2 (Late Registration Penalty) — used vehicle buyers should check delinquent registration status alongside excise verification
  - F-BOC-2 (PCA Compliance Checker) — vehicle importers concerned about NMISP declarations can assess PCA exposure

- **Structured Data:**
  ```json
  {
    "@type": "SoftwareApplication",
    "name": "Philippine Automobile Excise Tax Calculator",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "PHP" },
    "description": "Free calculator for Philippine automobile excise tax under the TRAIN Law. Covers ICE, hybrid, and EV vehicles with bracket cliff analysis and OTR price breakdown."
  }
  ```

---

### F-BOC-4: Free Trade Agreement (FTA) Tariff Rate Optimizer

- **URL:** /customs/fta-rate-optimizer
- **H1:** "Philippine FTA Tariff Rate Optimizer — Free Online Tool"
- **Opportunity Score:** 3.25 (Moderate tier)
- **TAM:** Subset of F-BOC-1 professional base; ~25,000 importers x fraction importing from ASEAN/Korea/India/Japan; strongest value for SMEs routinely paying MFN rates unnecessarily
- **Professional Fee Displaced:** Customs brokers and trade compliance managers at MNCs handle FTA rate claims; SMEs often pay the higher MFN rate unnecessarily because they do not know how to claim FTA rates or obtain proper Certificates of Origin; the savings from a single 5% duty rate reduction on a PHP 1M shipment = PHP 50,000 in avoidable duties
- **Governing Statute:** Multiple ASEAN FTA treaties — ATIGA (ASEAN Trade in Goods Agreement), AKFTA (ASEAN-Korea FTA), AIFTA (ASEAN-India FTA), AJCEP (ASEAN-Japan Comprehensive Economic Partnership), PH-EU PTA (pending); CAO/CMO on Certificate of Origin requirements; Rules of Origin (40%+ ASEAN content for ATIGA)

- **Target Keywords:**
  - **Primary:** FTA tariff rate Philippines
  - **Secondary:** ATIGA duty rate lookup, ASEAN free trade rate Philippines, AKFTA tariff rate, import duty savings Philippines FTA, Certificate of Origin Form D
  - **Long-tail:** how to claim ASEAN free trade rate Philippines, ATIGA vs MFN duty rate comparison, import from Thailand zero duty Philippines, AKFTA Form AK requirements, rules of origin ASEAN 40% content, how to get Certificate of Origin for imports, FTA rate for Korean products Philippines, duty savings calculator ASEAN imports

- **How It Works Content:**
  1. Identifies the country of origin and determines which FTA applies: ATIGA for ASEAN members (0% for most goods — Philippines eliminated 99%+ tariff lines by 2010), AKFTA for Korean-origin goods (0%-5%), AIFTA for Indian-origin goods (0%-5% with exclusion lists), AJCEP for Japanese-origin goods (staged reductions)
  2. Looks up the FTA preferential tariff rate vs. the Most Favored Nation (MFN) rate for the specific AHTN code — applies whichever rate is lower, showing the exact PHP savings on the user's shipment value
  3. Checks Rules of Origin compliance requirements: wholly-obtained goods qualify automatically; substantially transformed goods must meet the 40%+ ASEAN content threshold (for ATIGA); direct consignment rule must be satisfied (goods cannot transit through a third country without documentation)
  4. Identifies the required Certificate of Origin form: Form D (ATIGA), Form AK (AKFTA), Form AI (AIFTA), Form AJ (AJCEP) — and flags whether third-party invoicing is permitted under the applicable agreement
  5. Computes the total duty savings: (MFN Rate minus FTA Rate) x CIF Value, aggregated across multiple product lines for importers with diversified sourcing

- **Step-by-Step Guide:**
  1. Enter the HS/AHTN code of your imported product
  2. Select the country of origin (triggers applicable FTA identification)
  3. Enter the CIF value of the shipment
  4. Review the rate comparison: MFN rate vs. applicable FTA rate with PHP savings highlighted
  5. Check the Rules of Origin requirements for your specific product and FTA
  6. See the required Certificate of Origin form and filing instructions
  7. For multi-product importers: enter all product lines to see aggregate annual FTA savings potential

- **FAQ Topics:**
  1. What FTAs does the Philippines participate in?
  2. How do I get a Certificate of Origin (Form D) for ASEAN imports?
  3. Is there zero duty on all products from ASEAN countries?
  4. What is the 40% ASEAN content rule for Rules of Origin?
  5. Can I claim FTA rates if my goods transit through Singapore?
  6. How much duty can I save by using AKFTA rates on Korean imports?
  7. What products are excluded from AIFTA preferential rates?
  8. Does the Philippines have an FTA with China?

- **Related Tools:**
  - F-BOC-1 (Landed Cost Calculator) — compute the full landed cost using the FTA rate identified by this tool
  - F-BOC-2 (PCA Compliance Checker) — importers who claimed FTA rates should verify their Certificate of Origin compliance to avoid PCA exposure
  - F-BOC-5 (Petroleum/Alcohol/Tobacco Excise) — FTA rates may apply to regulated commodity imports from ASEAN partners

- **Structured Data:**
  ```json
  {
    "@type": "SoftwareApplication",
    "name": "Philippine FTA Tariff Rate Optimizer",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "PHP" },
    "description": "Free tool to compare MFN vs. ATIGA/AKFTA/AIFTA/AJCEP preferential tariff rates for Philippine imports. Shows duty savings and Certificate of Origin requirements."
  }
  ```

---

### F-BOC-5: Petroleum, Alcohol & Tobacco Excise Tax Calculator (Import Context)

- **URL:** /customs/excise-petroleum-alcohol-tobacco
- **H1:** "Petroleum, Alcohol & Tobacco Excise Tax Calculator — Free Online Calculator"
- **Opportunity Score:** 3.15 (Moderate tier)
- **TAM:** Primarily B2B industrial importers; lower consumer relevance; included in hub for completeness as excise collections exceed PHP 200B+ annually from petroleum alone
- **Professional Fee Displaced:** Handled internally by petroleum companies, tobacco manufacturers, and alcohol importers with dedicated compliance departments; tax consultants for excise disputes charge PHP 50,000-PHP 200,000+; lower automation opportunity for individuals
- **Governing Statute:** NIRC Section 141 (petroleum excise) as amended by RA 10963 (TRAIN Law); NIRC Section 143 (alcohol excise); NIRC Sections 144-145 (tobacco excise) as amended by RA 11346 (tobacco tax increase); RA 11467 (vapor/heated tobacco excise)

- **Target Keywords:**
  - **Primary:** petroleum excise tax Philippines calculator
  - **Secondary:** alcohol excise tax Philippines, tobacco excise tax TRAIN law, cigarette tax per pack Philippines, diesel excise tax Philippines, fuel excise tax rate 2026
  - **Long-tail:** how much is excise tax on diesel Philippines, excise tax on imported liquor Philippines, cigarette excise tax rate per pack 2026, LPG excise tax Philippines, excise tax on imported wine Philippines, gasoline excise tax per liter Philippines, TRAIN law petroleum excise rates, heated tobacco excise tax Philippines

- **How It Works Content:**
  1. Computes petroleum excise at the specific rate per liter or kilogram as fully phased in under the TRAIN Law (2020 onwards): gasoline PHP 10.00/L, diesel PHP 6.00/L, LPG PHP 3.00/L, kerosene PHP 3.00/L, bunker fuel PHP 6.00/L, lubricating oils PHP 8.00/L, aviation turbo jet PHP 4.00/L, petroleum coke PHP 2.50/kg, asphalts PHP 8.00/kg
  2. Computes tobacco excise at current rates: machine-packed cigarettes PHP 40.00/pack (increasing 4% annually thereafter per RA 11346 escalation), heated tobacco products PHP 27.50/pack (2024), vapor/freebase nicotine at PHP 59.13/mL salt nicotine liquid (2024 per RA 11467)
  3. Computes alcohol excise using the dual-rate structure: distilled spirits at PHP 42.00/proof liter + 22% of Net Retail Price (or PHP 47.00/proof liter alone, whichever is higher); fermented liquors/beer at PHP 39.00/liter (2024); wines at PHP 50.00/liter
  4. Stacks excise with customs duty and VAT for imported products: Total = CIF + Customs Duty + Excise Tax + VAT (12% of CIF + Duty + Excise) — showing the full cascading tax effect
  5. Applies annual escalation rates where applicable (tobacco: 4%/year post-TRAIN) and displays the historical rate trajectory for budget planning

- **Step-by-Step Guide:**
  1. Select the product category: Petroleum, Alcohol, or Tobacco
  2. Enter the specific product type (diesel, gasoline, LPG, beer, wine, spirits, cigarettes, etc.)
  3. Enter the volume or quantity (liters, packs, proof liters, kilograms)
  4. For imports: enter CIF value and applicable customs duty rate to compute the full stacked tax
  5. Review the excise tax computation with statutory citation
  6. See the annual escalation projection (for tobacco products with 4%/year increases)

- **FAQ Topics:**
  1. How much excise tax is on each liter of gasoline in the Philippines?
  2. What is the excise tax on imported wine per bottle?
  3. How much excise tax does a pack of cigarettes carry in 2026?
  4. Is there excise tax on LPG in the Philippines?
  5. How is the excise tax on distilled spirits computed (per proof liter + NRP)?
  6. Does the excise tax on cigarettes increase every year?

- **Related Tools:**
  - F-BOC-1 (Landed Cost Calculator) — compute the full import duty + VAT on top of excise for regulated commodity imports
  - F-BOC-4 (FTA Rate Optimizer) — check whether preferential customs duty rates apply to petroleum/alcohol imports from ASEAN partners

- **Structured Data:**
  ```json
  {
    "@type": "SoftwareApplication",
    "name": "Petroleum, Alcohol & Tobacco Excise Tax Calculator",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "PHP" },
    "description": "Free calculator for Philippine excise tax on petroleum, alcohol, and tobacco products under the TRAIN Law. Includes annual escalation projections and import stacking."
  }
  ```

---

## Blog Posts

### Blog Post 1: "How to Compute Import Duty in the Philippines: A Complete 2026 Guide"

- **URL:** /customs/blog/import-duty-guide-2026
- **Target Query:** "how to compute import duty Philippines" / "customs duty calculator Philippines"
- **Content Outline:**
  1. Introduction: BOC collected PHP 931B in 2024; every imported good passes through duty computation
  2. The CIF Method: How customs value is established (CMTA Sections 201-203) with worked examples
  3. Finding Your HS Code: How to use the Philippine Tariff Finder and AHTN classification system
  4. The Full Tax Stack: Duty + Excise + VAT computed step-by-step with a real product example (e.g., importing a laptop, a pair of shoes, a car part)
  5. The De Minimis Rule: PHP 10,000 FOB threshold and the consolidation trap
  6. Brokerage Fees: The CAO 1-2001 statutory schedule explained
  7. Common Mistakes: Wrong HS code, forgetting insurance in CIF, not claiming FTA rates
  8. CTA: Use the Landed Cost Calculator to compute your exact total before importing
- **CTA Tools:** F-BOC-1 (primary), F-BOC-4 (secondary)
- **Related Posts:** Blog Post 2 (De Minimis Guide), Blog Post 3 (Auto Excise)

### Blog Post 2: "The PHP 10,000 De Minimis Rule: When Your Shopee International Order Gets Taxed"

- **URL:** /customs/blog/de-minimis-rule-shopee-lazada
- **Target Query:** "customs duty Shopee international" / "de minimis Philippines online shopping"
- **Content Outline:**
  1. Introduction: Millions of Filipinos shop on Shopee International, Lazada, Shein, Temu — and are surprised by customs charges
  2. The De Minimis Threshold: PHP 10,000 FOB/FCA under CAO 02-2025 — below this, duty-free + VAT-free
  3. The Consolidation Trap: Multiple parcels to the same recipient on the same day are aggregated — a PHP 8,000 + PHP 5,000 order on the same day = PHP 13,000 = taxable
  4. How Courier Companies Handle It: DHL, FedEx, LBC compute and collect on behalf of BOC
  5. What Happens When You Exceed PHP 10,000: Duty rate depends on product category (HS code), plus 12% VAT on the total
  6. Tips: Spread orders across different days; know your HS code category rates
  7. CTA: Use the Landed Cost Calculator to estimate charges before you buy
- **CTA Tools:** F-BOC-1 (primary)
- **Related Posts:** Blog Post 1 (Import Duty Guide), Blog Post 4 (FTA Savings)

### Blog Post 3: "Car Excise Tax Philippines 2026: TRAIN Law Brackets, EV Exemptions & the CMEPA Pickup Change"

- **URL:** /customs/blog/car-excise-tax-train-law-2026
- **Target Query:** "car excise tax Philippines 2026" / "TRAIN law vehicle tax"
- **Content Outline:**
  1. Introduction: 400,000+ new vehicles sold annually; excise ranges from PHP 24,000 (budget car) to millions (luxury)
  2. The TRAIN Law Rate Table: 4%/10%/20%/50% brackets explained with NMISP examples
  3. The Bracket Cliff Effect: Why PHP 600,001 costs PHP 36,000 more in tax than PHP 600,000
  4. Electric Vehicles: Full excise exemption for BEVs — worked example vs. comparable ICE
  5. Hybrid Vehicles: 50% of applicable rate — worked example
  6. CMEPA 2025: Pick-up trucks lose their excise exemption — impact on Ford Ranger, Toyota Hilux, etc.
  7. Imported vs. Locally Assembled: How NMISP is determined differently
  8. CTA: Verify your car's excise tax with the Automobile Excise Tax Calculator
- **CTA Tools:** F-BOC-3 (primary), F-BOC-1 (secondary for imports)
- **Related Posts:** Blog Post 1 (Import Duty Guide), Blog Post 5 (PCA Guide)

### Blog Post 4: "Are You Overpaying Import Duty? How ASEAN Free Trade Rates Save Filipino SMEs Millions"

- **URL:** /customs/blog/asean-fta-savings-smes
- **Target Query:** "ASEAN free trade rate Philippines" / "ATIGA duty savings"
- **Content Outline:**
  1. Introduction: SMEs routinely pay the higher MFN rate because they don't know how to claim FTA preferences
  2. Philippines' FTA Network: ATIGA (0% for 99% of ASEAN goods), AKFTA, AIFTA, AJCEP
  3. Worked Example: Importing fabric from Thailand — MFN 15% vs. ATIGA 0% on PHP 2M shipment = PHP 300,000 savings
  4. Certificate of Origin: Form D (ATIGA), Form AK (AKFTA) — how to request and submit
  5. Rules of Origin: The 40% ASEAN content threshold and what it means for mixed-origin goods
  6. Common Barriers: Not knowing the FTA rate exists; broker doesn't proactively claim it; Form D processing delays
  7. CTA: Compare your MFN rate vs. FTA rate with the FTA Rate Optimizer
- **CTA Tools:** F-BOC-4 (primary), F-BOC-1 (secondary)
- **Related Posts:** Blog Post 1 (Import Duty Guide), Blog Post 5 (PCA Guide)

### Blog Post 5: "BOC Post-Clearance Audit: The 600% Penalty That Can Destroy Your Business"

- **URL:** /customs/blog/boc-pca-penalty-guide
- **Target Query:** "BOC post-clearance audit penalty" / "customs audit Philippines"
- **Content Outline:**
  1. Introduction: PCAG collected PHP 2.71B in 2024 with a PHP 3.5B target for 2025 — audits are increasing
  2. What Triggers a PCA: Undervaluation, misclassification, misdeclaration, poor record-keeping
  3. The 3-Year Lookback: Every import entry you filed in the last 3 years is auditable
  4. Penalty Math: 125% negligence vs. 600% fraud — worked example on a PHP 1M undervaluation
  5. The Interest Clock: 20% per annum from date of final assessment compounds rapidly
  6. The Prior Disclosure Program (PDP): How voluntary disclosure eliminates the surcharge
  7. Real Stakes: A PHP 1M undervaluation at 600% = PHP 6M penalty + PHP 1.2M/year interest = business-ending for SMEs
  8. CTA: Assess your PCA exposure and compute PDP savings
- **CTA Tools:** F-BOC-2 (primary), F-BOC-1 (secondary)
- **Related Posts:** Blog Post 1 (Import Duty Guide), Blog Post 4 (FTA Savings)
