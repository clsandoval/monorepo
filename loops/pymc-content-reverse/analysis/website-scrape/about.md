# Website Scrape — About / Team Page
Source: https://www.pymc-labs.com/about/ + https://www.pymc-labs.com/team/
Scraped: 2026-03-13

---

## Page Structure

The current site has two related pages:
- `/about/` — Company overview + team grid
- `/team/` + `/team/{slug}/` — Team listing + individual profiles

---

## Company Overview Text (from /about/)

**Headline / Positioning:**
> "We are the inventors of PyMC, the leading platform for statistical data science. We have launched a consultancy to turn our expertise into your advantage."

**Team composition statement:**
> "Our team consists of PhDs, mathematicians, neuroscientists, engineers, and social scientists."

**Expertise claim:**
> "Our decades of experience in Bayesian AI modeling allows us to come up with unique and impactful solutions to your most challenging business problems."

**PyMC impact claims:**
- Used to: "find planets outside of our solar system, detect earthquakes, predict elections or estimate the spread of COVID-19"
- "The most cited paper on PeerJ where it was published"

**CTAs on page:**
- "Contact us"
- "Stay connected with the latest developments in Bayesian AI Statistics and AI" → newsletter subscribe

**Note:** No dedicated company history/founding story section found. No founding year stated. ~18 client logos displayed but not labeled in HTML.

---

## Team Members (32 total)

### Partners

**Dr. Thomas Wiecki**
- Role: Partner, PyMC Labs
- Title: Author of PyMC, the leading platform for statistical data science
- Education: PhD in Computational Cognitive Neuroscience, Brown University
- Career: Former VP of Data Science and Head of Research at Quantopian Inc; built team of data scientists to develop a hedge fund from pool of 300,000 crowd researchers
- Specializations: Probabilistic AI statistics, Teaching
- Links: twiecki.io | github.com/twiecki | linkedin.com/in/twiecki | twitter.com/twiecki
- Individual page: https://www.pymc-labs.com/team/thomas-wiecki/

**Dr. Christian Luhmann**
- Role: Partner
- Education: PhD in Psychology, Vanderbilt University; BS in Computer Science, Northeastern University
- Career: Former Professor at Stony Brook University
- Quote: "More than 20 years of experience teaching and conducting research in data science"
- Roles: Leads PyMC Community Team, co-organizer of PyMCon Web Series

**Dr. Luca Fiaschi**
- Role: Partner
- Education: PhD in Computer Science, Heidelberg University
- Career: Former Chief Data & AI Officer at Mistplay; Former VP Data Science at HelloFresh
- Experience: 15+ years leading AI, infrastructure and analytics teams in hypergrowth tech companies

**Niall Oulton**
- Role: Partner
- Education: Masters in Econometrics, University of Bristol
- Experience: "10 years industry and agency experience" in marketing
- Notable: Core PyMC-Marketing Developer

**Joe Wilkinson**
- Role: Partner
- Education: BSc in Economics, University of Sheffield
- Experience: "15 years marketing analytics experience"; Former Senior Partner at Gain Theory

### Team Members

**Allen Downey**
- Role: Principal Data Scientist
- Education: PhD in Computer Science, UC Berkeley
- Current: Professor Emeritus at Olin College
- Author: Think Python, Think Stats, and Probably Overthinking It

**Andrew Heusser**
- Experience: 16 years as data scientist
- Education: PhD in Cognitive Neuroscience, NYU
- Work: Built ML-powered product features and Bayesian marketing mix models

**Benjamin Maier**
- No bio available in scraped content

**Bernard Mares**
- Location: France-based
- Role: Independent mathematician and data science engineer
- Education: PhD in mathematical physics, MIT
- Work: Maintains open-source projects across PyMC and conda-forge

**Camilo Saldarriaga**
- Expertise: Financial economist, Bayesian statistical modeling
- Experience: Consulting for OECD
- Education: Master's degrees in Economics and Financial Economics

**Christopher Fonnesbeck**
- Role: Creator of PyMC
- Education: PhD, University of Georgia
- Current: Adjunct Associate Professor at Vanderbilt University Medical Center
- Experience: "20 years of experience as a data scientist in academia, industry, and government"
- Career: 7 years in pro baseball research (Philadelphia Phillies, New York Yankees, Milwaukee Brewers)
- Specializations: Bio, Gaussian Processes, Math, Modeling, Natural Resources, Sports, Teaching, Time-Series
- Individual page: https://www.pymc-labs.com/team/christopher-fonnesbeck/

**Colt Allen**
- Role: Principal Data Scientist
- Experience: "Over 10 years of experience" across multiple industries
- Notable: Lead developer for Customer Lifetime Value modeling in PyMC-Marketing

**Daniel Saunders**
- Expertise: Fast, stable Bayesian models for pricing and marketing
- Education: PhD, University of British Columbia (evolutionary game theory)
- Career: Taught scientific computing and statistics at UBC

**Eliot Carlson**
- Role: Junior Researcher
- Education: BS in Statistics, Yale; MS in Data Science, Columbia
- Interests: "computational methods, MCMC, and their applications"

**Erik Ringen**
- No bio available in scraped content

**Evan Wimpey**
- Work: Bayesian solutions for clients
- Education: Master's degrees in Economics and Analytics
- Note: "performs data comedy outside consulting"

**Francesco Muia**
- Role: Senior freelance data scientist
- Education: PhD in theoretical physics; Executive MBA from SDA Bocconi
- Achievements: Stephen Hawking Fellow; secured €750k+ in research funding

**Halah Joseph**
- Experience: "Over 10 years of experience" at intersection of AI, data, consulting, marketing
- Expertise: Scaling AI solutions and client engagement; translating AI concepts into business value

**Jake Piekarski**
- Expertise: Marketing analytics
- Background: Mathematics and statistical modeling
- Focus: Marketing Mix Modeling optimization

**Juan Orduz**
- Education: PhD in Mathematics, Humboldt Universität zu Berlin
- Experience: "More than 9+ years of industry experience" in Tech
- Interests: Time series, Bayesian methods, causal inference

**Kemble Fletcher**
- No bio available in scraped content

**Kusti Skytén**
- Role: Associate Data Scientist
- Education: Master's in Mathematical Statistics, University of Cambridge
- Research: Simulator-based inference and Bayesian optimization

**Maxim Laletin**
- No bio available in scraped content

**Mengxing Baldour-Wang**
- No bio available in scraped content

**Nina Rismal**
- No bio available in scraped content

**Olivera Stojanovic**
- No bio available in scraped content

**Oriol Abril Pla**
- Links available (GitHub, LinkedIn) but no bio in scraped content

**Pablo de Roque**
- Links available (GitHub, LinkedIn) but no bio in scraped content

**Purna Mansingh**
- Links available (GitHub, LinkedIn) but no bio in scraped content

**Sandra Meneses**
- Links available (GitHub, LinkedIn) but no bio in scraped content

**Teemu Säilynoja**
- Links available (GitHub, LinkedIn) but no bio in scraped content

**Titi Alailima**
- Links available (GitHub, LinkedIn) but no bio in scraped content

**Ulf Aslak**
- Links available (GitHub, LinkedIn) but no bio in scraped content

---

## Individual Team Member URL Pattern

`https://www.pymc-labs.com/team/{first-last-slug}/`

Confirmed pages:
- https://www.pymc-labs.com/team/thomas-wiecki/
- https://www.pymc-labs.com/team/christopher-fonnesbeck/

Individual pages contain: role, bio, education, career history, specialization tags, social links.

<!-- GAP: Need to scrape individual pages for all 32 team members to get full bios -->
<!-- GAP: No founding year / company history narrative found — needs Discord/other source -->
<!-- GAP: Client logos on about page not labeled — need identification from other sources -->
<!-- GAP: 12 team members have no bio in scraped content (Benjamin Maier, Erik Ringen, Kemble Fletcher, Maxim Laletin, Mengxing Baldour-Wang, Nina Rismal, Olivera Stojanovic, Oriol Abril Pla, Pablo de Roque, Purna Mansingh, Sandra Meneses, Teemu Säilynoja, Titi Alailima, Ulf Aslak) -->

---

## Social/Newsletter CTAs

- LinkedIn, GitHub, X (Twitter), YouTube, Bluesky — all active
- Newsletter: "Stay connected with the latest developments in Bayesian AI Statistics and AI"
