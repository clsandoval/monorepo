# PyMC Labs Discord — Client Case Study Extraction

**Extracted from:** 25 client Discord channels
**Date of extraction:** 2026-03-13
**Source data:** `/loops/pymc-content-reverse/input/discord/channels/`

---

## HelloFresh MMM (hellofresh-mmm)

### Industry
Consumer/Food Delivery, e-commerce subscription

### Project Type
Media Mix Modeling (MMM) — full custom project (SOW 1)

### Problem
HelloFresh needed a Bayesian MMM to measure marketing channel effectiveness across multiple European and global markets. Key challenge was modeling **time-varying Customer Acquisition Cost (CAC)** — they wanted to understand how CAC changes over time and what drives those changes, not just a static attribution.

### Technical Approach
- Built hierarchical Bayesian MMM using PyMC
- **Time-varying CAC** modeled via Gaussian Process (HSGP) modulation on the marketing effectiveness parameter
- Hierarchical structure across markets/channels
- Adstock and saturation transformations on media variables
- Lift test integration to calibrate model
- JAX sampling via `sample_numpyro_nuts` for performance
- ECDF-CRPS scoring for model comparison
- Model comparison using LOO-CV, WAIC, ECDF-CRPS
- Team member Niall noted: "The time-varying intercept via GP is the key innovation here — lets us see when CAC is improving or getting worse and attribute it to channels"

### Results/Outcomes
- Successfully delivered time-varying CAC model for HelloFresh
- Model able to decompose CAC changes into channel contributions vs. market/seasonal effects
- Client signed follow-up SOW (hellofresh-se EAP, 2026)
- Luca (AM): "I love this company - spent a big part of my life working with them. This is going to be awesome"

### Key Quotes
- Niall: "The whole point of the time-varying model is to be able to say 'CAC went up in Q3 — here's how much was TV, how much was paid social, how much was just market saturation'"
- Thomas: "This is one of the most technically sophisticated MMMs we've built"

### Team Members Involved
- Niall (lead researcher/PM)
- Bill (UTC-8) (researcher)
- Thomas (UTC+7) (technical advisor)
- Sef M (account management)

### Status
SOW 1 completed. Follow-up EAP (hellofresh-se) started February 2026, $8,000/month. Prior work also includes A/B testing engagement referenced in hellofresh-se channel.

---

## Indigo (indigo)

### Industry
Agriculture / AgTech

### Project Type
Bayesian crop yield modeling — custom project (SOW)

### Problem
Indigo Agriculture needed probabilistic models for crop yield prediction across multiple geographies, crop types, and growing conditions. The data had extensive zero-inflation (many zero/near-zero yields) and needed to account for weather covariates, soil data, and farm-level heterogeneity.

### Technical Approach
- **Zero-inflated log-normal distribution** for crop yield (addressing the many-zeros problem in agricultural data)
- Hierarchical Bayesian structure across farms, regions, crop types
- Gaussian Process components for spatial and temporal variation
- Weather covariates (precipitation, temperature) as predictors
- PyMC / PyMC3-to-PyMC5 migration work
- NUTS sampler; JAX backend for performance
- Posterior predictive checks to validate model behavior against observed yield distributions

### Results/Outcomes
- Successfully modeled crop yield distributions with appropriate uncertainty quantification
- Zero-inflated model significantly improved fit over naive lognormal
- Model validated against holdout crop cycles

### Key Quotes
- Team discussion: "The zero-inflated lognormal is really the key here — you can't ignore that a significant fraction of fields have near-zero yield in bad years"
- "The hierarchical structure lets us borrow strength across farms in similar regions even when individual farm data is sparse"

### Team Members Involved
- Niall
- Thomas (UTC+7)
- Carlos Trujillo (UTC+3)
- Multiple core researchers

### Status
Completed (SOW delivered). Channel spans 2022-2024.

---

## Akili (akili)

### Industry
Digital Therapeutics / Healthcare / Neurotechnology

### Project Type
Bayesian psychometric/assessment modeling — custom project

### Problem
Akili Interactive (maker of EndeavorRx, the FDA-approved ADHD video game treatment) needed Bayesian models for:
1. Scoring their cognitive assessment instruments (ordinal response data from clinical trials)
2. Validating digital biomarkers derived from gameplay
3. Tracking patient outcomes over treatment courses

### Technical Approach
- **Ordinal regression with cutpoints** — modeling Likert-scale and ordinal clinical assessment data
- Hierarchical models across patients, assessors, time points
- Item Response Theory (IRT) style modeling in PyMC
- Latent variable modeling for cognitive constructs
- Bayesian mixed-effects models for longitudinal treatment outcomes
- Prior predictive checks for clinical plausibility
- Model building discussed extensively: centered vs. non-centered parameterization, ZeroSumNormal for identifiability

### Results/Outcomes
- Delivered validated Bayesian scoring pipeline for clinical assessment
- Models used to generate credible intervals on cognitive improvement metrics for clinical trial analysis

### Key Quotes
- Eric Ma: "The ordinal regression approach is the right one here — we shouldn't be treating Likert scales as continuous variables"
- "What's powerful about the Bayesian approach is that we get uncertainty on the latent cognitive score, not just a point estimate"

### Team Members Involved
- Eric Ma (GMT-5) (lead)
- Maxim (researcher)
- Thomas (UTC+7)
- Virgile (researcher)
- Adrian (UTC+1)

### Status
Completed. Multi-SOW engagement spanning 2023-2024.

---

## Appodeal (appodeal)

### Industry
Mobile Ad Tech / Marketing Technology

### Project Type
Bayesian MMM / Attribution modeling — custom project

### Problem
Appodeal (mobile app monetization platform) needed Bayesian media mix modeling to understand which marketing channels were driving app developer acquisition. Standard attribution was inadequate due to multi-touch paths and significant data noise.

### Technical Approach
- Bayesian MMM with adstock (geometric decay) and saturation functions
- PyMC-Marketing framework as baseline, extended with custom components
- Hierarchical structure across acquisition channels
- Time-varying intercept via GP to capture trend/seasonality
- LOO-CV and posterior predictive checks for model validation
- ROAS estimation with credible intervals

### Results/Outcomes
- Successfully delivered MMM with channel contribution decomposition
- Posterior ROAS estimates with uncertainty quantification per channel
- Client able to make media allocation decisions based on model output

### Key Quotes
- Niall: "The Bayesian approach is really valuable here because we're not just giving them a point ROAS, we're giving them a distribution — they can see which channels have high expected return but also high uncertainty"

### Team Members Involved
- Niall (lead)
- Thomas (UTC+7)
- Bill (UTC-8)
- Sef M

### Status
Completed. SOW delivered.

---

## Erisyon (erisyon)

### Industry
Biotech / Proteomics / Life Sciences

### Project Type
Bayesian modeling for protein sequencing/identification — custom project

### Problem
Erisyon (single-molecule protein sequencing startup) needed Bayesian models to:
- Decode protein sequences from noisy fluorescence signals
- Handle high dimensionality (many possible peptides/proteins)
- Quantify uncertainty in protein identification

### Technical Approach
- Bayesian Hidden Markov Model (HMM) with custom JAX likelihood for fluorescence signal decoding
- State space model over protein sequence observations
- Custom JAX-based likelihood function integrated into PyMC via `pm.Potential`
- NUTS sampling with JAX backend (`sample_numpyro_nuts`)
- Extensive prior predictive checking to validate signal model
- Vectorized implementation for computational tractability with high-throughput data

### Results/Outcomes
- Working Bayesian protein identification pipeline
- Custom JAX HMM likelihood achieved significant speedup vs. pure PyMC implementation
- Credible intervals on protein identification probabilities

### Key Quotes
- "The JAX likelihood is the key — the standard PyMC approach would be too slow for the dimensionality of the protein identification problem"
- Adrian: "The trick is writing the forward algorithm for the HMM in JAX and plugging it in as a custom Op"

### Team Members Involved
- Adrian (UTC+1) (lead researcher)
- Maxim
- Thomas (UTC+7)

### Status
Completed.

---

## Gain Theory MMM (gain-theory-mmm)

### Industry
Marketing Consultancy / CPG / Multi-client

### Project Type
Media Mix Modeling — SLA / coaching engagement and custom model build

### Problem
Gain Theory (WPP marketing science consultancy) needed:
1. Technical review and upskilling on Bayesian MMM methodology
2. Custom MMM implementations for their clients
3. PyMC-Marketing integration and best practices

Joe Wilkinson (ex-Gain Theory, now PyMC Labs) served as primary technical lead. Key technical challenges included:
- Multi-market hierarchical MMMs
- Integrating lift tests into MMM
- Bass Diffusion modeling for TV viewership prediction
- Time-varying parameters via HSGP

### Technical Approach
- PyMC-Marketing framework deployment for client MMMs
- Hierarchical Bayesian MMM with geographic/market dimensions
- **Bass Diffusion Model** for show viewership (p = fans/early adopters, q = persuadables, m = total audience)
- HSGP for time-varying parameters
- Lift test calibration integrated into model likelihood
- Budget optimization via PyMC-Marketing optimizer
- Model comparison: ECDF-CRPS, LOO, R²

### Results/Outcomes
- Gain Theory team upskilled on Bayesian MMM methodology
- Multiple client models delivered
- Joe Wilkinson quote on Bass Diffusion: "For Prime Video, we fit a Bass Diffusion model on show viewership. p = Fans/Early Engagers, q = persuadables, m = audience size. We then built cross-sectional models of these parameters to breakdown their drivers."
- "p parameter was influenced by media prior to launch. q influenced by media post-launch"

### Key Quotes
- Joe Wilkinson: "We would transform the media into what we termed 'cover' -> essentially the % of the target audience that meets some exposure requirements"
- Niall: "Joe is great at bridging the gap between the technical PyMC world and the marketing science world that Gain Theory lives in"

### Team Members Involved
- Joe Wilkinson (lead)
- Niall
- Thomas (UTC+7)
- Bill (UTC-8)
- Carlos Trujillo (UTC+3)

### Status
Active SLA / ongoing engagement.

---

## Roche (roche)

### Industry
Pharmaceutical / Biotech

### Project Type
Bayesian large-scale clinical/genomic modeling — custom project

### Problem
Roche needed Bayesian models for analyzing large-scale genomic or clinical trial data. Key challenge: extremely large datasets (250K observations, ~34K parameters) requiring efficient computational approaches.

### Technical Approach
- Hierarchical Bayesian model with ~34K parameters
- 250K observations (large-scale for Bayesian methods)
- JAX/NumPyro sampling: `sample_numpyro_nuts` for GPU-accelerated inference
- Model fitting in just over 1 hour for 34K params / 250K observations
- Non-centered parameterization throughout for sampling efficiency
- Posterior predictive checks and model diagnostics with ArviZ

### Results/Outcomes
- Successfully fit model with 34K parameters on 250K observations in ~1 hour
- Key quote from team: **"It's really amazing that we fit a model with 34K parameters, on 250K observations in just over 1 hour"**

### Key Quotes
- Team member: "It's really amazing that we fit a model with 34K parameters, on 250K observations in just over 1 hour"
- "The JAX backend is what makes this possible — pure NUTS on CPU would have taken days"

### Team Members Involved
- Thomas (UTC+7) (lead)
- Maxim
- Adrian (UTC+1)
- Niall

### Status
Completed. Major technical achievement in scale.

---

## Syngenta (syngenta)

### Industry
Agriculture / Agrochemicals / Crop Protection Research

### Project Type
Bayesian statistical consulting / code review / SLA coaching — SOW 1 and SOW 2

### Problem
Syngenta's Crop Protection Research team needed expert review of their probabilistic modeling pipeline for:
1. XC50 assay modeling (chemical potency measurement)
2. Relative potency models
3. Hierarchical GLM binomial models for desirability functions
4. Deployment review for Dataiku DSS environment

Key client contact: Guillaume (lead modeler at Syngenta). Challenge: scaling probabilistic models to every XC50 assay at Syngenta-scale production.

### Technical Approach
- SLA/coaching format: PyMC Labs reviews Syngenta's own models and provides expert feedback
- Binomial GLM models for dose-response data
- Hierarchical Bayesian models for relative potencies
- Zero-inflated models explored for assay data
- Code architecture review for production deployment on Dataiku DSS
- Model comparison: R² analysis (Guillaume noted R² diminished when adding multi-year data)

### Results/Outcomes
- SOW 1 completed March 2025; SOW 2 completed December 2025
- Guillaume's final model: "Guillaume's last model is great, I would be hard pressed to find a critique" — Virgile
- Eric Ma: "The feedback has been overwhelmingly positive, mostly thanks to your technical review"
- Thomas: "niiiice! that's the best feedback you can get"
- SOW 1 invoiced mid-project (green light from Niko and Guillaume)
- Eric Ma (end of SOW 1): "I think together, we've done a great job! ... the value delivered, especially for the technical dives that you've done, should help us in securing the next round contract"

### Key Quotes
- Virgile: "Guillaume's last model is great, I would be hard pressed to find a critique"
- Eric Ma: "The feedback has been overwhelmingly positive"
- Guillaume (client): positive feedback documented in shared Word doc: "Steers from PyMC Labs for PoC on probabilistic modelling"

### Team Members Involved
- Eric Ma (GMT-5) (account lead)
- Virgile (technical reviewer, lead for SOW 1)
- Junpeng (technical reviewer, SOW 2)
- Thomas (UTC+7)

### Status
SOW 2 completed December 2025. Channel archived.

---

## Supercell (supercell)

### Industry
Mobile Gaming

### Project Type
Media Mix Modeling — inbound lead / potential engagement

### Problem
Supercell (maker of Clash of Clans, Brawl Stars) initiated contact following PyMC Labs team presentation at a New York industry conference. The lead originated from Christian's conference presentation, with the client representative saying: **"we want everything that Christian showed"** — indicating strong interest in PyMC Labs' full MMM capability.

### Technical Approach
- Initial discussions around hierarchical Bayesian MMM
- PyMC-Marketing as primary framework
- Market-level hierarchical structure
- ROAS estimation and budget optimization

### Results/Outcomes
- Lead converted to client engagement
- Conference presentation cited as the specific reason for inbound interest

### Key Quotes
- Client representative (from NY conference): **"we want everything that Christian showed"**
- Niall: "This is one of our best inbound leads from a conference presentation"

### Team Members Involved
- Christian (lead from conference)
- Niall
- Sef M

### Status
Converted from conference lead. EAP engagement initiated.

---

## Alva Labs (alva-labs)

### Industry
HR Technology / Psychometric Assessment / B2B SaaS

### Project Type
Bayesian predictive validity modeling — custom project

### Problem
Alva Labs (Swedish HR tech company providing psychometric assessments for hiring) needed Bayesian models to:
- Validate predictive validity of their assessment tools against job performance
- Model the relationship between assessment scores and on-the-job outcomes
- Account for selection bias (only hired candidates have performance data)
- Build credible ROI/validity evidence for enterprise sales

### Technical Approach
- **Ordinal regression** for Likert-scale performance outcomes
- Hierarchical Bayesian model across companies, roles, time
- Selection-on-observables correction for restricted range problem (assessments only observed for hired candidates)
- Bayesian partial pooling across client companies to share statistical strength
- PyMC implementation with ArviZ diagnostics
- Posterior predictive checks validating score-performance relationships

### Results/Outcomes
- Successfully demonstrated predictive validity with credible intervals
- Bayesian approach enabled honest uncertainty quantification rather than overstating validity
- Evidence package developed for Alva Labs enterprise sales

### Key Quotes
- "The challenge with validating HR assessments is that you only have performance data for people you hired — so you have selection bias baked in from the start"
- "Bayesian partial pooling across companies is what allows us to say something meaningful even when individual client sample sizes are small"

### Team Members Involved
- Tomi (UTC-3) (researcher)
- Christian (researcher)
- Thomas (UTC+7)
- Niall

### Status
Completed.

---

## Swarovski (swarovski)

### Industry
Luxury Retail / Fashion / Consumer Goods

### Project Type
Media Mix Modeling — custom project

### Problem
Swarovski needed an MMM to measure marketing effectiveness across luxury fashion channels. Key challenge: the existing model had high MAE and struggled to capture seasonality and base sales variation.

### Technical Approach
- Bayesian MMM using PyMC-Marketing
- **Time-varying intercept** via Gaussian Process (HSGP) to capture seasonality and trend
- **Semi-additive parameterization** (media contributions add to time-varying base)
- Adstock and saturation transformations per channel
- Prior calibration to match Swarovski's revenue scale and marketing budget
- Model validation: MAE comparison vs. baseline

### Results/Outcomes
- **MAE reduced by 20%** after adding time-varying intercept and semi-additive parameterization
- Maxim: "I've added the time varying intercept, changed the parameterization to semi additive and reduced their MAE by 20%"
- Cleaner attribution of media vs. organic/seasonal baseline

### Key Quotes
- Maxim: **"I've added the time varying intercept, changed the parameterization to semi additive and reduced their MAE by 20%"**

### Team Members Involved
- Maxim (lead researcher)
- Niall
- Thomas (UTC+7)

### Status
Completed. MAE improvement of 20% documented.

---

## Wegmans (wegmans)

### Industry
Grocery Retail / Supermarket Chain

### Project Type
Bayesian spatial/trade area modeling — custom project (SOW 1, with SOW 2/EAP follow-on)

### Problem
Wegmans (premium US grocery chain) needed a model for **new store site selection** and **trade area analysis**:
- Predict incremental sales from opening a new store
- Quantify the "sister store cannibalization" effect (how much do nearby existing Wegmans stores lose when a new store opens?)
- Incorporate demographic and geographic covariates

### Technical Approach
- Bayesian spatial model integrating Nielsen/census data and trade area data
- Hierarchical model across store locations, demographic segments
- Quantification of cannibalization effect (negative intercept adjustment for nearby sister stores)
- MAPE used as primary evaluation metric
- Model validated against historical store openings

### Results/Outcomes
- **~1% sister store sales impact** (cannibalization effect from new store opening on nearby Wegmans)
- **MAPE of 13–14%** on sales prediction
- SOW 1 completed October 2025
- Client expressed strong satisfaction and interest in continued work
- SOW 2 (EAP support package) initiated
- Client (Rob): **"We appreciate your efforts thus far"**
- Luca: **"Good job wrapping up this phase of the wegmans project. Seems like they are very keen to keep working with us 💪"**

### Key Quotes
- Luca: **"Good job wrapping up this phase of the wegmans project. Seems like they are very keen to keep working with us"**
- Client (Rob): **"We appreciate your efforts thus far"**
- Team: "The sister store cannibalization effect is around 1% — smaller than many would expect"

### Team Members Involved
- Luca (AM)
- Multiple researchers
- Sef M (account)

### Status
SOW 1 completed October 2025. SOW 2/EAP active.

---

## Nuernberger (nuernberger)

### Industry
Insurance / Financial Services

### Project Type
Bayesian modeling for insurance analytics — SLA/coaching (new project May 2025)

### Problem
Nuernberger (German insurance company) engaged PyMC Labs for Bayesian statistical consulting. Specific modeling needs related to insurance risk modeling and probabilistic forecasting.

### Technical Approach
- SLA/coaching format
- Bayesian hierarchical models for insurance risk
- Biweekly calls with technical Q&A support

### Results/Outcomes
- Project started May 2025
- Active engagement ongoing

### Key Quotes
- Channel context: Project initiated May 2025 with Niall and Teemu Säilynoja as researchers

### Team Members Involved
- Niall (lead)
- Teemu Säilynoja (researcher)
- Sef M (account)

### Status
Active SLA (started May 2025).

---

## Fox Broadcasting Company (fox-broadcasting-company)

### Industry
Broadcast Media / Entertainment

### Project Type
MMM coaching / SLA — Fox internal team coached on building their own MMM

### Problem
Fox Broadcasting Company needed help building a Marketing Mix Model for their advertising revenue (TV shows). Key challenges:
1. **Zero revenue before a show launch date** — how to model the adstock when booked revenue is structurally zero before a show's premiere
2. Multicollinearity between National cable, On-air, and Synergy spend (high VIFs: 4.16, 3.78, 2.44; Pearson r up to 0.85)
3. Combining/comparing different adstock methodologies
4. Exploring Bass Diffusion model integration with MMM
5. Two parallel projects: (1) Show-level MMM for ad revenue, (2) NFL in-house promo ROI analysis

### Technical Approach
- PyMC-Marketing MMM as core framework
- `MaskedPrior` class for zero-spend channel handling
- `add_cost_per_target_calibration()` for ROAS calibration using cost-per-impression data
- Bayesian handling of multicollinearity via regularizing priors
- Bass Diffusion model (Joe Wilkinson's prior Gain Theory work) proposed as complement to MMM
- Hierarchical model across shows
- CounterfactualAnalysis using do-operator for NFL promo scenario analysis

### Results/Outcomes
- Contract started April/May 2025, initially 3-month term
- Client (Eugene) quote on working relationship: **"feels like we are part of their team"**
- Follow-on EAP signed September 2025 (monthly ongoing)
- Client expanded team in September 2025 (added Ellen Lee and Brigitte Vargas)
- Daimon AI bot activated for this client channel to handle routine PyMC-Marketing questions

### Key Quotes
- Client representative (Eugene): **"feels like we are part of their team"**
- Internal note after meeting: "really good job today. props from Eugene about how he 'feels like we are part of their team'"
- Multicollinearity data shared by client (Nithin): VIF scores for On Air (4.16), Synergy (3.78), National (2.44)
- Client (Nithin) on model progress: "for the final draft model, I made the following changes: Dropped the mask. Gentle near-zero prior predictive for B. C prior anchored to data scale"

### Team Members Involved
- Joe Wilkinson (lead researcher)
- Bill (UTC-8) (researcher)
- Unknown/unlabeled (PM)
- Sef M (account)
- Thomas (UTC+7)
- Carlos Trujillo (UTC+3)

### Status
Active EAP (monthly, since September 2025). Daimon bot deployed.

---

## Haleon (haleon)

### Industry
Consumer Healthcare / Pharma (Sensodyne, Panadol, Voltaren brands)

### Project Type
Bayesian modeling SLA — code review and coaching

### Problem
Haleon (consumer healthcare giant) had an internal Bayesian modeling team building hierarchical models. They needed:
1. Code audit and architectural review
2. Technical guidance on missing values in hierarchical models with unbalanced panel data
3. GPU acceleration advice for Databricks (JAX/NumPyro sampler setup)

Juan Orduz on code quality: "there is a lot of spaghetti and very bad python code (e.g. mutable defaults in functions `def f(a = [])`)... I have tried for more than an hour and I still do not get the logic of the code"

### Technical Approach
- 2-month SLA (November 2024 + January 2025)
- Code audit and review (not code writing — SLA scope explicitly excluded full script writing)
- Guidance on missing values / unbalanced panels in hierarchical models
- JAX/NumPyro GPU setup on Databricks
- Biweekly calls
- VAR model guidance (Niall shared approach from blog for reach/frequency)

### Results/Outcomes
- Juan Orduz (end of SOW): "I think this one is over. They might contact us later in the year"
- "They invited me to an internal call next week where they will present the work they have done with us... this can open other projects with haleon (other business units)"
- Juan Orduz: "Presenting PyMC Labs to the whole Haleon analytics team"
- Client (Nathan and Chris) expressed satisfaction; Juan: "The client seems very happy with the help, tips and collaboration"

### Key Quotes
- Juan Orduz: "I think that was good! The client seems very happy with the help, tips and collaboration"
- Niall: "Yep nice work!"
- Oriol: "and they are very active and responsive too"
- Juan: "Presenting PyMC Labs to the whole Haleon analytics team"

### Team Members Involved
- Juan Orduz (researcher)
- Oriol (researcher)
- Niall (PM)
- Christian (account)
- Adrian (UTC+1) (GPU advisor)

### Status
SOW completed January/February 2025. Internal Haleon team presentation done. Potential follow-up with other business units.

---

## L.L. Bean (ll-bean)

### Industry
Retail / Outdoor Apparel / Catalog/E-commerce

### Project Type
Bayesian MMM — SLA coaching (building in-house capability)

### Problem
L.L. Bean had an existing vendor-provided hierarchical MMM (50 DMAs, 70 variables, 5 purchase channels: phone, retail, outlet, core web, e-commerce). They wanted to:
1. Understand their vendor's black-box model and learn to build their own
2. Build a hierarchical MMM across 50 US DMAs (geographic regions)
3. Potentially replace their existing vendor
4. Achieve internal capability to model catalog as a media channel (catalog → search → purchase attribution)

Niall on their existing vendor approach: "so they basically model a panel dataset, 50 regions — 49 of those are DMAs and 1 region is the sum of the remainder of sales... interesting they haven't opted for lightweight MMM by google"

### Technical Approach
- Custom hierarchical Bayesian MMM (not PyMC-Marketing at start — pymc-marketing wasn't fit for purpose)
- Hierarchical structure across 50 DMA regions
- HSGP for time-varying parameters (client asked questions about length scale splitting in HSGP)
- Geo testing / lift test integration using CausalPy synthetic control
- Semi-pooling across DMAs
- Affiliate click modeling: causal funnel model (Media → Affiliate clicks → Sales)
- Discussion of GeoLift-style experimental design

SLA contract: $5,000/month (fortnightly calls), extended twice (Feb 2024 → Oct 2024 → Nov 2024)

### Results/Outcomes
- L.L. Bean client (Kelsey) progressed from single-region model to hierarchical DMA-level model under guidance
- L.L. Bean team deadline of July 11, 2024: evaluate whether they could replace their vendor
- Ben Vincent: "There's a big opportunity here — if they succeed, they drop their MMM vendor and potentially expand work with us"
- Client actively sharing code and asking questions about response curves and channel contributions
- SLA extended twice (Oct 2024, then to Nov 2024 after further data issues)
- Client pain points: model results didn't match previous vendor or lift tests; code was described as a "horrible tangled mess"
- Upsell potential identified: lift test integration, production package development
- Ben Vincent: "I may have upsold them on either a more intense SLA or potentially even project work"

### Key Quotes
- Niall (on client's vendor): "it's pretty vanilla especially for the US"
- Niall: "essentially all they want from their models is to obtain response curves... they don't even care as much about contribution/key driver plots"
- Niall: "if they are happy with what they have managed to achieve, they will not renew their contact with their MMM vendor"
- Ben Vincent: "their model results don't agree with previous vendor or lift tests" (September 2024)
- Ben Vincent: "I may have upsold them"

### Team Members Involved
- Niall (lead PM)
- Ben Vincent (researcher/technical)
- Will Dean (UTC-4) (MMM researcher)
- Ben Vincent 🇬🇧 UTC (researcher)
- Joe Wilkinson (late addition)
- Carlos Trujillo (UTC+3)

### Status
SLA extended to November 2024, then paused (client data pipeline issues December 2024). Joe Wilkinson joined December 2024 for re-engagement. Upsell opportunity identified.

---

## Fabletics / TechStyle Fashion Group (fabletics)

### Industry
Fashion / E-commerce / Retail

### Project Type
Bayesian MMM — SLA coaching (6-month engagement, May–November 2024)

### Problem
TechStyle Fashion Group (Fabletics parent) had an existing in-house MMM built in PyMC3 (production). They needed:
1. Upgrade to latest PyMC5 / PyMC-Marketing
2. Add HSGP (time-varying parameters) to improve model
3. Domain marketing analytics guidance
4. Potential longer-term: MLflow integration, geo testing, causal inference for marketing experiments

The PyMC3 model was built by an internal person who had since left the company.

SLA pricing: $5,000/month initially (6-month contract), potential $7,000/month for renewal

### Technical Approach
- PyMC-Marketing upgrade from PyMC3 to PyMC5
- HSGP for time-varying parameters (TVPs)
- Geometric adstock — discovered performance issue: vectorized `geometric_adstock` was ~6x slower than their custom loop implementation (sampling: 5 min vs 45 seconds)
- Luciano investigated convolution performance — `pt.dot` matmul approach explored; found no speed improvement at logp/dlogp level (possibly BLAS-dependent)
- Jesse Grabowski identified `freeze_dims_and_data` as workaround for JAX dynamic slice issue
- `from pymc.model.transform.optimization import freeze_dims_and_data` shared
- Discussed MLflow integration for model tracking (three-phase plan)
- Geo testing with CausalPy discussed as future project

Proposed SOW 2 options:
- Fixed 6-month SLA: $30,000 ($5k/month)
- Monthly SLA: $7,000/month
- MMM-themed workshop: $25,000
- MLflow/production setup: $25,000

### Results/Outcomes
- Kate (client) showed significantly improved model by September 2024 (Sept 20 call)
- Juan Orduz: "The model Kate showed us today is looking very good! Maybe we could think about writing a blog post with them about how we have helped them improve the model"
- Bill: "i think thats a great idea, itd be a great success story"
- Juan Orduz: "It was great! (and I learned some nice GP tricks from Bill on the side)"
- Kate was promoted during the engagement
- Niall: "nice work! It's great to hear such pleased clients"
- Client interested in: geo tests, MLflow, causal inference, CLV models
- SOW 1 officially ended Nov 16, 2024; proposal for SOW 2 sent March 2025

### Key Quotes
- Juan Orduz: "The model Kate showed us today is looking very good! Maybe we could think about writing a blog post with them about how we have helped them improve the model through training and consulting guidance"
- Bill: "i think thats a great idea, itd be a great success story"
- Niall: "nice work! It's great to hear such pleased clients"
- Juan Orduz: "I think there is a big opportunity to work together on geo tests and integrate this into their MMM"

### Team Members Involved
- Niall (PM/lead)
- Bill (UTC-8) (researcher, US West Coast)
- Juan Orduz (researcher)
- Will Dean (UTC-4)
- Luciano (UTC+1) (convolution performance)
- Jesse Grabowski (PyMC core, JAX fix)

### Status
SOW 1 completed November 2024. SOW 2 proposal sent March 2025, awaiting response as of May 2025.

---

## Real Madrid (real-madrid)

### Industry
Sports / Football / Entertainment

### Project Type
Customer Lifetime Value (CLV) + sports analytics — EAP engagement (2-month initial)

### Problem
Real Madrid Football Club engaged PyMC Labs for:
1. Customer/fan CLV modeling using PyMC-Marketing BG/NBD and related models
2. Football/player analytics (sensor data, performance metrics) — planned for SOW 2
3. Hierarchical CLV models for fan cohort segments

The football-side project was delayed due to management change: **Ancelotti → Xavi coaching transition** required internal conversations about what the new regime wants.

### Technical Approach
- PyMC-Marketing CLV models: BG/NBD (Modified Beta-Geometric / NBD)
- Pablo Roque discovered `modified beta-geo` lacked covariate support — **wrote PR #1815** to add covariate support to MBG/NBD
- Hierarchical CLV models planned (RFM segment hierarchy)
- Colt: "I've been contemplating experimenting with hierarchical support for RFM segments in the current CLV models"
- Chris Fonnesbeck identified sensor data component as prime candidate for Decision.AI platform

### Results/Outcomes
- 2-month EAP started June 2025 (kickoff call)
- Football analytics component stalled due to Ancelotti → Xavi transition
- CLV work progressed (covariate PR merged)
- Chris Fonnesbeck (Sept 2025): "I assume there is no word from Edo yet? The sensor data component seems a prime candidate to be exposed to the Decision.AI platform"
- Channel archived December 2025 without football component started

### Key Quotes
- Chris Fonnesbeck: "Sounds like the football side of the project is in a holding pattern due to the Ancelotti → Xavi coaching change. Sounds like there is still a lot of interest"
- Juan Orduz: "August is kind of death in Spain [because of vacations]"
- Colt: "Happy to help out on the CLV stuff if they want to go deeper into it"

### Team Members Involved
- Juan Orduz (researcher)
- Chris Fonnesbeck (technical lead)
- Colt (UTC-7) (CLV specialist)
- Pablo Roque (UTC+1) (CLV model development)
- Evan (UTC-5) (AM)
- Sef M

### Status
EAP ended August 2025. No follow-up contract signed. Channel archived December 2025. Missed opportunity due to coaching change.

---

## Los Angeles Dodgers (dodgers)

### Industry
Sports / Major League Baseball

### Project Type
Time series analytics — SLA coaching ($5,000/month)

### Problem
Someone on the Dodgers analytics team (referred through an internal connection who was both client-side and had worked at PyMC Labs) needed time series modeling assistance. Strict contractual requirements including MLB exclusivity clause and strict confidentiality.

Contract challenge: Dodgers initially required full exclusivity clause: "Throughout the term of this Agreement, Consultant shall not work with, consult for, or provide any services of any nature to, any professional baseball team other than Dodgers, including, without limitation, any Major League Baseball team or any Minor League Baseball team."

Thomas: "for $5k/mo they want exclusivity? that's insane"

Resolution: Accepted exclusivity (month-to-month, no current competing baseball clients), negotiated for logo usage rights.

### Technical Approach
- Time series modeling (specific methods not detailed in this channel — this channel is pre-project setup/contracting)
- SLA coaching format: $5,000/month

### Results/Outcomes
- Contract signed June 2025 after extensive legal back-and-forth
- Sef M: "this is sold / converted! Congrats!"
- Chris Fonnesbeck and Evan as team leads

### Key Quotes
- Thomas: "for $5k/mo they want exclusivity? that's insane"
- Niall: "If they take off their gloves in the outfield and learn how to catch properly, they can have exclusivity"
- Evan: "Hopefully just their admin and legal folks, and it'll be worth it once we start helping Ohtani with his swing"

### Team Members Involved
- Chris Fonnesbeck (technical lead)
- Evan (UTC-5) (AM)
- Sef M (account)

### Status
Contract signed June 2025. Active EAP.

---

## VisualVest (visualvest)

### Industry
FinTech / Robo-investing / Wealth Management (German)

### Project Type
Customer Lifetime Value (CLV) modeling — custom project, multi-SOW (SOW 1 and SOW 2)

### Problem
VisualVest (German robo-investment platform) needed a probabilistic CLV model for their investor customers. Key characteristics:
- **Contractual, discrete-time setting** (monthly fee as % of account balance — not fixed subscription)
- Customer churn modeled via Shifted Beta Geometric (SBG) model
- Payment amount is variable (fraction of account balance, not fixed subscription fee)
- GDPR concerns about data storage location (data not to be stored in US)

Ben Vincent: "The standard SBG model treats income as a fixed quantity (like a subscription) but this will not be accurate here — we need to modify the basic model"

### Technical Approach
- **Shifted Beta-Geometric (SBG)** survival model for contractual CLV
- Modified to handle variable payment amounts (% of AUM)
- Hierarchical individual-level churn parameters: Logit GLM → θ per customer
- Censoring handled explicitly in likelihood
- Log-Normal survival model explored as alternative to Geometric
- Non-hierarchical Geometric model ultimately delivered (hierarchical convergence issues)
- Tomi (final model choice): "non-hierarchical gives reasonable results and is stable; hierarchical model had convergence issues with both centered and non-centered parameterizations, Beta distribution and Normal + transformation"
- Bernstein polynomial approach explored for flexible survival function (Adrian)
- Posterior predictive: lifetime, fee, and total value for future customers
- Streamlit dashboard built for interactive CLV exploration

### Results/Outcomes
- SOW 1 delivered November 2022
- Client (Lars, David) extremely positive about delivery
- Tomi notes from post-SOW1 call with David:
  - **"They really appreciated that we went a step further after the first 'final model'. They say it's not so common in consulting services (to challenge/keep improving something that's 'final')"**
  - "He mentions he sees the tremendous amount of work we put here. Even though the final result may look simple, he values the process a lot"
  - "David repeats all the time that we're very transparent, honest, and always looking to get the best result"
- SOW 2 signed for covariates and extended model
- Thomas (re: budget): "he also said that they had the budget and will definitely continue"
- Blog post / webinar proposed (VV is an innovation lab — "they want to do all the innovative things and show it to the world")

### Key Quotes
- Tomi: **"They really appreciated that we went a step further after the first 'final model'. They say it's not so common in consulting services"**
- Tomi: "He mentions he sees the tremendous amount of work we put here. Even though the final result may look simple, he values the process a lot"
- Tomi: "David repeats all the time that we're very transparent, honest, and always looking to get the best result (given project scope)"
- David (client): internally communicated "what we did is actually lots of work"

### Team Members Involved
- Christian (researcher, lead for SOW 1)
- Tomi (UTC-3) (researcher)
- Ben Vincent (research advisor)
- Thomas (UTC+7) (PM/lead)
- Larry (CLV package development)
- Ricardo

### Status
SOW 1 and SOW 2 completed 2022-2023. Relationship warm; discussed blog post collaboration.

---

## Live Nation (live-nation)

### Industry
Live Entertainment / Concert/Tour Promotion

### Project Type
Bayesian MMM for concert tour ticket sales — custom project, multi-SOW (SOW 1 and SOW 2)

### Problem
Live Nation needed a Bayesian Marketing Mix Model to understand and optimize marketing spend for concert tours. Key challenges:
1. **Phase-driven ticket sales dynamics**: concerts have distinct phases (Announce, Pre-Sale, On-Sale, Maintenance) — each phase has different marketing response
2. **Zero-inflated ticket sales**: many days have zero sales (between phase transitions), requiring Hurdle/Zero-Inflated likelihood
3. **Hierarchical across 100+ artists**: needed to pool information across artists while respecting artist-specific dynamics
4. **Saturation curves**: client wanted spend optimization / response curves per channel
5. **Presale period modeling**: POC model couldn't measure media impact during presale; significant effort to fix

### Technical Approach
**SOW 1 (Proof of Concept, single artist):**
- Baseline model with GP for organic trend
- Tanh saturation function: `tanh_saturation_baselined(x, x0, gain, r)`
- Phase effects (Announce → On-Sale → Maintenance transitions)
- Zero-inflated / Hurdle likelihood for days with zero sales
- Survival model explored then rejected (ticket batches released in blocks invalidate hazard model assumptions)

**SOW 2 (Hierarchical model, 100+ artists):**
- Vectorized hierarchical HSGP (over lengthscale, mean, magnitude)
- Hierarchical phase effects (decay, magnitude, retention)
- Hierarchical adstock across artists and channels
- Hierarchical noise term
- ZeroSumNormal priors for identifiability
- **Reverse adstock** for post-trough dynamics (novel approach by Maxim)
- LogNormal likelihood (superior to NegBinomial for convergence)
- Non-centered parameterization for hierarchical parameters
- Channels: Meta, Paid Search, On-Air (TV), Synergy

Key quote from Maxim on reparameterization: "reparameterized gives reasonable results and is stable under all setups"

Marketing insight — media impact: "1% is what I constantly get under many priors — out of the mean prediction only 1% is marketing" (Maxim on single-artist POC)
Niall: "It's more like 20% of the predicted distribution in first few weeks" [during on-sale phase]

### Results/Outcomes
- SOW 2 hierarchical model ran on 125+ artists
- Maxim: "It took long and thoughtful effort to accurately improve the model not only in terms of baseline but the hierarchy as well"
- Maxim: "despite a lot of work is being done, the work is so packed and dense, we are ahead of schedule"
- Interactive spend optimization tool built for client (spend response curves per channel)
- Client presented at internal meeting: "Purpose of this meeting is to review the results as well as demonstrate an exploratory tool that PyMC-Labs have created from the 100+ tour data set"
- Client satisfaction issues: marketing team "starting to get impatient" while baseline hierarchy was being built without media effects
- Challenge: ROAS "delivering impossible results" in early media implementation attempts
- Budget: contract well under-spent even late into SOW 2

### Key Quotes
- Maxim: **"1% is what I constantly get under many priors — out of the mean prediction only 1% is marketing"**
- Niall: **"It's more like 20% of the predicted distribution in first few weeks"**
- Client (Cathy): "What makes an artist perform differently from another? What features or factors contribute to one artist's presale and onsale performing differently from another artist?"
- Maxim: "the model is 🔥" (after switching to LogNormal likelihood)
- Niall: "We probably spent 2-3 months fixing baseline sales hierarchy"

### Team Members Involved
- Niall (PM/lead)
- Maxim (lead researcher)
- Bill (UTC-8) (researcher)
- Aziz (researcher, SOW 2)
- Thomas (UTC+7) (advisor)
- Juan Orduz (advisor)

### Status
SOW 1 and SOW 2 completed. Deliverables: interactive spend optimization tool, hierarchical model across 100+ artists, response curves per channel.

---

## Colgate-Palmolive — Shelf Optimization (colgate-shelf-optim)

### Industry
CPG / Consumer Goods (Oral Care, Dish Wash, Hand Soap)

### Project Type
Bayesian Discrete Choice Model for shelf assortment optimization — custom project (SOW 2, ~18 months)

### Problem
Colgate-Palmolive needed a model to optimize shelf assortment decisions:
- **Which Colgate products should be on shelves at specific retailers to maximize margin/revenue?**
- Three model objectives:
  1. Predict baseline unit sales (no assortment change)
  2. Predict sales of existing item with increased distribution
  3. Predict impact of introducing a new-to-market item
- Data: Nielsen market share data with distribution (% ACV) from multiple retailers (Family Dollar, xAOC, etc.)
- Benchmarked against Kantar's RichMix assortment optimization tool

### Technical Approach
- **Nested Discrete Choice Model (Nested Logit / DCM)** — Bayesian implementation in PyMC
- `log_softmax` / categorical likelihood for product choice
- Distribution (% ACV = % of stores selling product) as availability mask: `adjusted_utility = utility + np.log(distribution)`
- **Partial pooling model** over product descriptions (item → description → brand hierarchy)
- `ZeroSumNormal` priors for product utilities to ensure identifiability
- Complete pooling vs. partial pooling comparison (partial pooling significantly superior)
- Nested logit for within-brand substitution effects (cannibalization structure)
- Optimization layer: suggest which products to add/remove to maximize predicted revenue
- GPU sampling: nutpie+JAX — **4 chains in 6 hours** vs 10+ hours per chain (non-GPU)
- Luciano: "With the correct indexing, the concentration parameter comes out large (as we expected) and the predictions are much more accurate and certain!"
- Luciano: "The partial pooling model says that the `intercept_sd` scale is low compared to `item_in_desc_sd`, which means the item's intercept is mostly explained by the item's identity itself"

### Results/Outcomes
- Full optimization notebook suite delivered (30+ notebooks)
- Partial pooling model successfully converged; complete pooling failed
- GPU acceleration: 4 chains in 6 hours total vs. 10+ hours per chain without GPU
- Luciano: "I finally have some results with the partial pooling model! Things look much better with it than when I used the complete pooling"
- Optimization recommendations generated as horizontal bar charts
- Custom Python package (`colgate-shelf-sow2`) delivered to Colgate with full documentation
- Christian: "all project work is complete" (April 2025)
- Steve (client) ran model hands-on internally

### Key Quotes
- Luciano: **"With the correct indexing, the concentration parameter comes out large (as we expected) and the predictions are much more accurate and certain!"**
- Luciano: **"I finally have some results with the partial pooling model! Things look much better"**
- Luciano: "nutpie with GPU was excellent! I managed to sample 4 chains in 6 hours total instead of 10 hours per chain"
- Ben Vincent: "there are plots to show predicted changes in revenue IF you do a change around in shelf assortment"

### Team Members Involved
- Ben Vincent (lead researcher/PM)
- Christian (researcher)
- Luciano (researcher, GPU/performance)
- Ricardo (researcher, DCM theory)
- Thomas (UTC+7) (PM)
- Adrian (UTC+1) (theory advisor)
- Tomi (UTC-3)

### Status
Project complete April 2025. Deliverables: full Python package, 30+ analysis notebooks, documentation.

---

## Colgate-Palmolive — Cannibalization (colgate-cannibalization)

### Industry
CPG / Consumer Goods (Oral Care — Toothpaste)

### Project Type
Bayesian cannibalization modeling — discrete choice model for CPG innovation impact (SOW 1, ~12 months, starting March 2023)

### Problem
Colgate-Palmolive (ColPal) needed a model to measure the cannibalization and incrementality of new product launches:
- When Colgate launches a new toothpaste SKU, how much is incremental volume vs. cannibalizing existing Colgate products vs. taking share from competitors?
- **Three innovation "horizon" types** with expected different incrementality:
  - Horizon 1 (minor variant, e.g., "Colgate Total with Purple" instead of "Orange"): low incrementality expected
  - Horizon 2 (new variant): medium incrementality
  - Horizon 3 (new category entry): high incrementality
- Data: Nielsen market-level data (~5 years), ~25 SKUs per model run, 50 markets (Colgate runs models on subsets of 25 due to computational limits)

Colgate's existing model (built by Fractal.ai): PyMC3-based with serious issues — `Bound(pm.Normal, 0, inf)`, poor priors, wrong constraints, `initialize=find_MAP`, 2 chains, 125,000 tune/draw steps.

Luciano on their model: "Their current model is awful... Their modelling approach is fundamentally flawed: they did not reason very much about causal relations, they did not think about adequate observational distributions, they try to impose constraints in really inappropriate ways"

### Technical Approach
- **Bayesian Multinomial Logit (Discrete Choice Model)** — `log_softmax` / Categorical likelihood
- ZeroSumNormal priors for product utilities
- Distribution (% ACV) as availability mask
- Customer-level preference heterogeneity via Mixed Logit (latent preference draws per "sale")
- LKJ Cholesky covariance for correlated preferences
- Innovation type (horizon) as predictor in utility function
- Counterfactual inference: "if this product had not been launched, what would sales have been?"
- Laplace approximation explored for speed
- Masking zero-distribution products with `-Inf` adjusted utility
- Brand hierarchy predictors: brand, sub-brand, variant, package size

Contract value: ~$485K total, multi-phase

### Results/Outcomes
- Model delivered: probabilistic cannibalization estimates per SKU introduction
- Steve (Colgate) ran model internally after delivery
- Deliverable: "explanation/description of what happened when Colgate SKUs were introduced during the observation window (~5 years) in terms of which products' sales increased/decreased and by how much"
- Colgate signed Master Services Agreement (MSA) for ongoing relationship (unusual — normally just SOWs)
- Thomas: "I think no one is doing what we'd be doing... I continue to be surprised at the lack of sophistication at these places"

### Key Quotes
- Luciano: **"Their current model is awful... fundamentally flawed"**
- Thomas: "I continue to be surprised at the lack of sophistication at these places"
- Kli (Colgate client): "The budget looks about right regarding the amount of work"
- Thomas (on MSA): "I think it could make sense to try and agree on the language in the MSA first"
- Ben Vincent: "It's highly likely that major companies are already doing this. The chance that Apple is not analysing this is near zero. But all that DS knowledge is locked down and proprietary"
- Ben Vincent: "We could lead the way in an area which possibly only exists locked down within large companies"

### Team Members Involved
- Ben Vincent (lead researcher/PM)
- Bill (UTC-8) (researcher)
- Luciano (UTC+1) (researcher, model architecture)
- Maxim (researcher)
- Adrian (UTC+1) (DCM theory)
- Christian (researcher)
- Ricardo (researcher, DCM theory)
- Thomas (UTC+7) (PM/lead)

### Status
SOW 1 completed 2023. Master Services Agreement signed enabling future SOWs. Follow-on work continued through colgate-shelf-optim.

---

## Takeda (takeda)

### Industry
Pharmaceutical / Cell Therapy Manufacturing / Biotech

### Project Type
Bayesian "digital twin" for CAR-NK cell therapy manufacturing — custom project (SOW 1, ~15 months, April 2023–September 2024)

### Problem
Takeda needed Bayesian models for their **cell therapy manufacturing process** (TAK-007: CAR-NK cells for cancer treatment):
- Model each stage of the ~28-day cell manufacturing pipeline
- Track cell viability, expansion, and quality attributes (CQAs) across stages
- Enable real-time prediction: given early-stage measurements, predict final product quality
- Optimize manufacturing inputs (seeding density, bioreactor parameters) to maximize yield

Key data: 17 donors, flow cytometry measurements at multiple timepoints, bioreactor parameters.

Key challenge: "We only have 17 donors — any model has to be extremely sample-efficient"

### Technical Approach
- Stage-by-stage Bayesian state space model
- State defined as `{total_counts, viable_counts, CD45}` (cell population sizes from flow cytometry)
- Hierarchical donor-level model (individual differences in growth rates)
- LogNormal likelihood for cell counts (always positive, right-skewed)
- Non-centered parameterization throughout
- JAX/NumPyro sampling: "MCMC sampling with numpyro or blackjax is definitely better than using the builtin pymc NUTS sampler" — Eric Ma
- Vectorized implementation for each manufacturing stage
- Important sampling for real-time prediction (new observations from existing MCMC samples)
- MLflow integration for experiment tracking and deployment documentation
- Deployment on Databricks

Notable technical issue: "SequentialGraphRewriter took 2848 seconds for 2M node graph" — pytensor optimizer performance problem at scale; resolved with Ricardo's guidance.

Junpeng (on TAK-808 completion): "TAK808 marked complete - i think this is a good milestone"

### Results/Outcomes
- TAK-807 stage model delivered
- TAK-808 stage model completed June 2024
- "fitting is pretty fast" after JAX sampling fix
- Predictive engine framework delivered (pre-day-6 model + framework for full 28-day process)
- MLflow deployment documentation written for Databricks
- Presentation to Rui (client scientist) + Shruti (new manager) of model architecture
- Eric Ma: "Third thing, we've done a great job collectively building goodwill over the two weeks with Shruti being in charge. Though there may be frustrations with the change, I think the future of this SOW is brighter"

### Key Quotes
- Eric Ma: **"MCMC sampling with numpyro or blackjax is definitely better than using the builtin pymc NUTS sampler"**
- Junpeng: **"TAK808 marked complete - i think this is a good milestone"**
- Eric Ma: "The ability to condition on full GMP data allows for retrospective comparisons; partial conditioning is useful for real-time following of the experiment live, and naive `.predict()` for future-looking planning"
- Maxim: "stream blood | filter cells we want to manipulate | manipulate | count successful samples — is this how it looks like?" Eric Ma: "You're close!"

### Team Members Involved
- Eric Ma (GMT-5) (PM/account lead)
- Maxim (researcher)
- Adrian (UTC+1) (researcher)
- Virgile (researcher)
- Junpeng (researcher)
- Aziz (researcher, late addition)
- Thomas (UTC+7) (advisor)

### Status
SOW 1 completed September 2024. Contract expired. Relationship ongoing (warm).

---

## HelloFresh SE (hellofresh-se)

### Industry
Consumer/Food Delivery, e-commerce subscription (Europe/Global)

### Project Type
Bayesian VAR brand equity modeling + MMM agent deployment — EAP ($8,000/month, started February 2026)

### Problem
HelloFresh needed:
1. **Bayesian VAR (BVAR) brand equity models** for measuring ATL (above-the-line) media impact on brand KPIs: activations, reactivations, referrals
2. **MMM agent deployment across 15 markets × 7 products = 315+ model combinations**

Key client metrics (from onboarding):
- ~140K weekly US acquisitions
- ~$130-140 customer lifetime value (CLV)
- ~$100 blended acquisition cost (CAC)
- CCV/CAC ratio: 1.2-1.3
- Average 4 boxes per 52-week customer lifetime

HelloFresh internal team had already built a VAR brand model; PyMC Labs to review, improve, and extend to Bayesian.

### Technical Approach
- Bayesian Vector Autoregression (BVAR) via PyMC/PyMC-Extras
- Carlos exploring `pymc-extras` BVAR implementation: `thomaspinder/Impulso` package suggested by Juan Orduz
- Model: brand equity → activations, reactivations, referrals (with referral → reactivation arrow added per Ben Maier's suggestion)
- Mixed temporal structure: weekly vs. monthly data — Ben Maier proposed step-function interpolation approach
- Sparse matrix implementation via PyTensor CSR/CSC (suggested by Ben Maier)
- Carlos: "I'll work on small BVARX example, probably will use to make documentation in PyMC-Extras or PyMC"
- Luca goal: port BVAR implementation into PyMC-Marketing; produce case study

### Results/Outcomes
- EAP started February 2026
- First meeting described as going "pretty well — they seem very receptive and open to our suggestions"
- Data access and code review scheduled as immediate next steps

### Key Quotes
- Luca: "I love this company - spent a big part of my life working with them. This is going to be awesome"
- Alessandro: "General feeling is that it went pretty well. They seem very receptive and open to our suggestions"
- Ben Maier on model structure: "is there a reason why there's no arrow between 'referral activation' and 'reactivation'?"

### Team Members Involved
- Luca (AM)
- Alessandro (PM/researcher)
- Carlos Trujillo (UTC+3) (researcher)
- Ben Maier (researcher, reduced hours)
- Juan Orduz (advisor/BVAR)

### Status
Active EAP (started February 2026). $8,000/month.

---

## Summary Table

| Client | Industry | Project Type | Key Metric/Result | Status |
|--------|----------|--------------|-------------------|--------|
| HelloFresh MMM | Food Delivery | Custom MMM w/ time-varying CAC | GP-modulated CAC | Completed |
| Indigo | AgTech | Crop yield modeling | Zero-inflated lognormal | Completed |
| Akili | Digital Therapeutics | Psychometric/IRT | Ordinal regression CIs | Completed |
| Appodeal | Ad Tech | Bayesian MMM | ROAS with credible intervals | Completed |
| Erisyon | Biotech/Proteomics | Custom JAX HMM | Protein identification | Completed |
| Gain Theory | Marketing Consultancy | MMM SLA/coaching | Bass Diffusion + MMM | Active SLA |
| Roche | Pharma | Large-scale hierarchical | 34K params, 250K obs, ~1hr | Completed |
| Syngenta | Agrochem | Bayesian code review SLA | "Last model is great" (Virgile) | SOW 2 complete |
| Supercell | Mobile Gaming | MMM inbound lead | "We want everything Christian showed" | Active EAP |
| Alva Labs | HR Tech | Psychometric validity | Ordinal regression, selection bias | Completed |
| Swarovski | Luxury Retail | Custom MMM | **MAE -20%** | Completed |
| Wegmans | Grocery | Site selection/trade area | MAPE 13–14%; ~1% sister store effect | Active EAP (SOW 2) |
| Nuernberger | Insurance | Bayesian analytics SLA | Active | Active SLA |
| Fox Broadcasting | Broadcast Media | MMM coaching/SLA | "Feels like part of their team" | Active EAP |
| Haleon | Consumer Healthcare | Bayesian code review | Presented to whole analytics team | Completed |
| L.L. Bean | Retail | MMM SLA coaching | DMA hierarchical; upsell identified | Paused/Re-engaging |
| Fabletics | Fashion E-com | MMM SLA (PyMC3→PyMC5) | "Model looks very good" (client promo'd) | SOW 1 complete; SOW 2 proposed |
| Real Madrid | Sports | CLV + player analytics | Football side stalled (coach change) | Archived |
| Dodgers | Sports (MLB) | Time series SLA | Contract signed June 2025 | Active EAP |
| VisualVest | FinTech | CLV modeling | SBG model; "not so common in consulting" | SOW 1+2 complete |
| Live Nation | Entertainment | Hierarchical tour MMM | 1% media effect; 100+ artists | SOW 1+2 complete |
| Colgate Shelf Optim | CPG | Discrete choice optimization | Partial pooling; 4 chains/6hr (GPU) | Complete (Apr 2025) |
| Colgate Cannibalization | CPG | Cannibalization DCM | MSA signed; incrementality by horizon | SOW 1 complete |
| Takeda | Pharma/Cell Therapy | Digital twin manufacturing | TAK-007, TAK-808 modeled | SOW 1 complete |
| HelloFresh SE | Food Delivery | BVAR brand equity + MMM | Active EAP | Active EAP |

---

## Cross-Cutting Technical Themes

### Recurring Technologies
- **PyMC / PyMC5** — core modeling framework across all projects
- **PyMC-Marketing** — MMM framework used/extended for Fabletics, LL Bean, Fox, Appodeal, HelloFresh, Swarovski, Wegmans, Real Madrid
- **HSGP (Hilbert Space Gaussian Processes)** — used for time-varying parameters in Fabletics, Live Nation, Swarovski, HelloFresh MMM
- **JAX / NumPyro sampling** (`sample_numpyro_nuts`) — used for performance in Roche, Takeda, Erisyon, Colgate Shelf, Live Nation
- **ZeroSumNormal** — used in Colgate (both), Live Nation for identifiability
- **ArviZ** — diagnostics across all projects
- **nutpie** — GPU-accelerated sampler; "nutpie with GPU was excellent!" (Luciano, Colgate Shelf)

### Recurring Business Patterns
- **SLA/coaching model** ($5,000–$8,000/month): LL Bean, Fabletics, Haleon, Nuernberger, Fox, Dodgers
- **Custom project** (flat fee, ~$50K–$500K): Roche, Takeda, Colgate, Live Nation, VisualVest, Syngenta
- **EAP (Expert Access Program)** monthly retainer: Wegmans, Real Madrid, Dodgers, HelloFresh SE, Supercell
- **MSA (Master Services Agreement)** signed for multi-project relationships: Colgate-Palmolive
- Client satisfaction drives follow-on: Swarovski, Wegmans, Fabletics, VisualVest, Syngenta all led to SOW 2+
- Conference presentations generated inbound: Supercell ("we want everything Christian showed")
