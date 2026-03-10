# Angkin Design System — Audience-Fit Analysis

**Aspect 24 of 27** | Wave 3: Synthesis & Comparison
Generated: 2026-03-10

---

## Overview

This analysis maps each of the 10 design options to the 7 primary Angkin user segments. For each segment, we identify which options are best fit, which are worst fit, and what specific design signals create that fit or friction.

The 7 segments are defined not as demographics but as **behavioral + emotional archetypes** — the mode someone is in when they arrive at an Angkin tool. A 47-year-old HR officer and a 26-year-old OFW may be in the same emotional mode (anxious, time-pressured, first-time user) for different tasks.

---

## Segment Definitions

| # | Segment | Core Need | Emotional State | Primary Device | Typical Tools Used |
|---|---------|-----------|-----------------|----------------|--------------------|
| A | Scared first-time filer | One clear answer | High anxiety, low confidence | Mobile | Retirement pay, separation pay |
| B | Busy HR/payroll staff | Speed + auditability | Task-focused, time-pressured | Desktop | Full tool suite, repeat usage |
| C | OFW checking remotely on mobile | Simple input → trusted number | Anxious, isolated, phone-only | Mobile (spotty signal) | Separation pay, final pay, 13th month |
| D | Small business owner | Quick compliance check | Curious but overwhelmed | Mixed | Tax, SSS/PhilHealth contributions, labor |
| E | Accountant/bookkeeper (bulk work) | Batch computation, saved results | Professional, efficiency-obsessed | Desktop (multi-monitor) | Every tool, 10-50x per day |
| F | Young professional (first job) | Understanding rights | Curious, slightly suspicious of institutions | Mobile + desktop | Retirement, 13th month, overtime |
| G | Retiree checking pension | Complete, accurate, citable | Cautious, reads everything, mistrusts "flashy" | Tablet + desktop | Retirement pay, SSS benefits |

---

## Segment A: Scared First-Time Filer

**Archetype:** Mang Rolly (57, security guard, first time using a compliance tool) or the factory worker who heard about RA 7641 from a co-worker. Low digital literacy. High emotional stakes. Often reading on a budget Android phone.

**What they need from design:**
- Zero jargon in labels and instructions
- Large, readable text (16px+ body, 48px+ touch targets)
- One action visible at a time
- Error messages as human sentences, not codes
- A result number that is undeniably clear
- No login wall, no account prompt, no upsell

**Ranking for this segment:**

| Rank | Option | Score | Rationale |
|------|--------|-------|-----------|
| 🥇 1 | **Option 2: Radical Clarity** | 5/5 | Designed *specifically* for this persona (Mang Rolly). One-thing-per-screen, 19px minimum text, WCAG AAA targets, plain-language labels. No decoration competing for attention. |
| 🥈 2 | **Option 8: Mobile-First Micro-App** | 5/5 | Renz persona overlaps strongly. GCash-familiar card pattern, 90-second task flow, one-thumb operation, no cognitive overhead. |
| 🥉 3 | **Option 3: Filipino Warmth** | 4/5 | Ate Leny persona — guided step-by-step, warm micro-copy, Tagalog-optional labeling, signals "this was made for you." |
| 4 | **Option 1: Trust Minimalism** | 3/5 | Relief-focused design helps, but Western whitespace aesthetic may read as "unfinished" to low-familiarity users. |
| 5 | **Option 5: Playful Utility** | 3/5 | Friendly, but energetic visuals (coral, bold) may feel "too much" for an anxious user who just wants facts. |
| 6 | **Option 9: Soft Institutional** | 2/5 | Rosario persona is too sophisticated — cautious tablet user with high literacy. The "institutional" signals can intimidate first-timers. |
| 7 | **Option 4: Stripe-Grade** | 2/5 | Carlo Reyes persona is the opposite of this segment. The professional density signals "this is for experts." |
| 8 | **Option 10: Bold Geometric** | 2/5 | Dark aesthetic, geometric confidence — visually strong but can feel intimidating to low-confidence users. |
| 9 | **Option 6: Editorial** | 1/5 | Long article format → first-timer may never find the calculator. Editorial depth is for the curious, not the terrified. |
| 10 | **Option 7: Dashboard-Native** | 1/5 | Sidebar navigation, keyboard shortcut labels, data-dense panels — this would cause immediate abandonment. |

**Key insight:** For Segment A, the fight is Radical Clarity vs. Mobile-First vs. Filipino Warmth. Radical Clarity is most accessible; Filipino Warmth is most culturally resonant. The choice depends on whether cultural fit or accessibility compliance is the higher priority.

---

## Segment B: Busy HR/Payroll Staff

**Archetype:** Ate Leny (HR officer managing 65 workers in Cebu) or the corporate HR generalist handling quarterly separations. Repeat user. Uses tool for specific verified answers. Needs to trust the output enough to put it in an official document.

**What they need from design:**
- Speed to result (minimum clicks, fast load)
- Result they can share/screenshot/copy
- No condescension (no "what is retirement pay?" explanations if they didn't ask)
- A UI that doesn't require re-learning on each visit
- Clear result breakdown (not just the total, but the components)

**Ranking for this segment:**

| Rank | Option | Score | Rationale |
|------|--------|-------|-----------|
| 🥇 1 | **Option 4: Stripe-Grade** | 5/5 | Carlo Reyes persona. Trustworthy professional aesthetic, no explanatory overhead, result breakdown with copy-paste. |
| 🥈 2 | **Option 1: Trust Minimalism** | 4/5 | Maria Santos persona — BPO admin, laptop, fast result. Clean, predictable, no surprises. |
| 🥉 3 | **Option 3: Filipino Warmth** | 4/5 | Ate Leny *is* this persona. The Cebu HR officer who needs the number and needs to trust it. |
| 4 | **Option 9: Soft Institutional** | 4/5 | Professional signals, clear result format, feels citable — matches "put this number in an official document" need. |
| 5 | **Option 7: Dashboard-Native** | 4/5 | Mel Santos is the super-power-user end of this segment. Not for all HR staff, but excellent for those with high tool frequency. |
| 6 | **Option 2: Radical Clarity** | 3/5 | One-thing-per-screen is actually slower for repeat users who know the tool. Great for first-timers, inefficient for veterans. |
| 7 | **Option 8: Mobile-First** | 3/5 | Ate Leny uses mobile — so this fits her specific case. But the 90-second optimization doesn't serve complex payroll queries. |
| 8 | **Option 5: Playful Utility** | 2/5 | Jasmine persona is different from an HR professional. "This tool is on your side" narrative is slightly off for HR staff who are representing both employer and employee. |
| 9 | **Option 6: Editorial** | 2/5 | Reading an article isn't what HR staff need. The editorial wrap adds time without adding value for this segment. |
| 10 | **Option 10: Bold Geometric** | 2/5 | Jolo persona (design-literate young professional) has different needs. Bold aesthetic doesn't signal "professional HR tool." |

**Key insight:** Options 1, 4, 9 form a cluster of "professional trustworthy" options that all serve HR staff well. The differentiation between them comes down to deployment model and developer economics, not user experience outcomes.

---

## Segment C: OFW Checking Remotely on Mobile

**Archetype:** Jasmine Villanueva (26, domestic worker in Hong Kong, iPhone, tired, 15 minutes). The OFW market is 10M+ Filipinos. They're often checking rights they're entitled to from abroad — separation pay, final pay, 13th month — sometimes urgently, sometimes on spotty connections.

**What they need from design:**
- Works perfectly on mobile (one-thumb use)
- Fast load on spotty LTE/WiFi
- Outcome-oriented: "what am I owed?" not "how is it calculated?"
- Feels like it's on their side (not bureaucratic, not intimidating)
- Easy to screenshot + share (Viber, Messenger, Facebook groups)
- Tagalog-aware micro-copy (code-switching is natural)

**Ranking for this segment:**

| Rank | Option | Score | Rationale |
|------|--------|-------|-----------|
| 🥇 1 | **Option 8: Mobile-First Micro-App** | 5/5 | Renz persona maps directly. Card-based, one-thumb, 90 seconds, screenshot-ready result. OFW users often discover tools via Messenger/FB share — the PWA install prompt is a bonus. |
| 🥈 2 | **Option 5: Playful Utility** | 5/5 | Jasmine is literally the primary persona. "Kaya mo 'yan, we'll figure this out together" tone is exactly right. Celebratory result moment drives the screenshot behavior. Facebook-shareable. |
| 🥉 3 | **Option 3: Filipino Warmth** | 4/5 | Strong mobile implementation, culturally resonant. Tagalog-first options. Warm encouragement for anxious OFW arriving with uncertain rights. |
| 4 | **Option 2: Radical Clarity** | 3/5 | Excellent mobile execution, but austere aesthetics don't drive sharing behavior. An OFW won't screenshot a grey form to send to her friends. |
| 5 | **Option 1: Trust Minimalism** | 3/5 | Reliable but not shareable. The clean design instills confidence but won't generate word-of-mouth. |
| 6 | **Option 9: Soft Institutional** | 2/5 | Rosario persona (older, tablet, careful) is the wrong target for OFW behavior. Too slow, too text-heavy. |
| 7 | **Option 10: Bold Geometric** | 2/5 | Visually memorable (could drive sharing) but dark mode may be hard to read in bright outdoor environments. Also optimized for design-literate users, not OFW-specific context. |
| 8 | **Option 6: Editorial** | 2/5 | Rodel persona is not an OFW — it's a domestic worker in Laguna. The long article is incompatible with "15 minutes on a bunk bed" behavior. |
| 9 | **Option 4: Stripe-Grade** | 1/5 | Explicitly desktop-optimized. Mobile is an afterthought. OFW users would encounter a desktop-first layout squeezed into a phone. |
| 10 | **Option 7: Dashboard-Native** | 1/5 | Absolutely wrong audience. Mel (power user at 27" monitor) is the opposite of Jasmine (phone, bunk bed, 15 minutes). |

**Key insight:** This segment drives viral growth. The tools that OFWs screenshot and share in Facebook groups become the discovery channel for thousands of new users. Options 5 and 8 are most likely to generate this behavior; Options 1 and 2, while usable, don't create shareable moments.

---

## Segment D: Small Business Owner

**Archetype:** The sari-sari store owner scaling to 10 employees, the restaurant owner wondering if they're computing 13th month correctly, the freelance studio owner suddenly responsible for SSS compliance. First-time compliance user, but with higher stakes and more complex questions than Segment A.

**What they need from design:**
- Confidence that the tool is authoritative (not "just a calculator")
- Clear enough to understand without a law degree
- Multiple tools accessible from one place (they have multiple compliance needs)
- The result should come with enough explanation to help them *understand*
- Mobile-capable but not necessarily phone-exclusive

**Ranking for this segment:**

| Rank | Option | Score | Rationale |
|------|--------|-------|-----------|
| 🥇 1 | **Option 6: Editorial Calculator** | 5/5 | Rodel Bautista is essentially a small business owner archetype. The article-embedded calculator is ideal: it teaches while it computes. A business owner needs to understand their obligations, not just get a number. |
| 🥈 2 | **Option 1: Trust Minimalism** | 4/5 | Maria Santos's "relief" experience applies here. Clean, authoritative, no friction. The domain-tinting system helps navigate across multiple compliance areas. |
| 🥉 3 | **Option 3: Filipino Warmth** | 4/5 | "Guided step-by-step in language she recognizes" maps well to an overwhelmed business owner who needs to feel confident, not just compute. |
| 4 | **Option 9: Soft Institutional** | 4/5 | The "feels like a trusted institution but modern" positioning is strong for a business owner who needs to trust the output enough to act on it. |
| 5 | **Option 5: Playful Utility** | 3/5 | Good entry experience but may feel "too fun" for someone trying to compute real financial obligations. The celebratory tone can feel off when you're the employer, not the employee. |
| 6 | **Option 2: Radical Clarity** | 3/5 | Mang Rolly persona is actually close to a non-digital business owner in some ways. But the zero-explanation approach fails when the user needs to *understand* their obligation. |
| 7 | **Option 8: Mobile-First** | 3/5 | Works for mobile-only owners but doesn't serve the multi-tool discovery need (a business owner needs to find and use 5-6 related tools, not just one). |
| 8 | **Option 4: Stripe-Grade** | 2/5 | Too professional — signals "for people who already know compliance," which is the opposite of a small business owner trying to figure things out. |
| 9 | **Option 10: Bold Geometric** | 2/5 | Jolo persona (design-literate BGC startup) is close to a certain type of business owner, but the aesthetic doesn't build the *institutional trust* a small business owner needs. |
| 10 | **Option 7: Dashboard-Native** | 1/5 | Power-user infrastructure for someone who doesn't know what most compliance requirements even are. Would cause immediate abandonment. |

**Key insight:** Segment D is where Option 6 (Editorial Calculator) earns its place. The editorial model's weakness (requires more development effort, slower to navigate for power users) becomes a strength here: a business owner *wants* the explanation. The calculator embedded in context is more valuable than a naked calculator.

---

## Segment E: Accountant/Bookkeeper (Bulk Work)

**Archetype:** Mel Santos (38, payroll specialist, 27" monitor, 40-80 computations/month) or the external bookkeeper handling 5 small business clients. This is Angkin's highest-value user — uses the full 148-tool suite, generates the most sessions, and has the highest switching cost once habituated.

**What they need from design:**
- Speed above all else: minimal clicks from arrival to result
- Keyboard navigability
- Batch-friendly: multiple computations without losing context
- Exportable/shareable results
- Zero explanation overhead (they know the law)
- Reliable, predictable — no surprise UI changes

**Ranking for this segment:**

| Rank | Option | Score | Rationale |
|------|--------|-------|-----------|
| 🥇 1 | **Option 7: Dashboard-Native Power Tool** | 5/5 | Mel Santos *is* this persona. Keyboard shortcuts, split panels, batch operations, saved computations. Built explicitly for her. |
| 🥈 2 | **Option 4: Stripe-Grade Developer System** | 5/5 | Carlo Reyes at 400-person company. Professional aesthetic, speed, no-frills. Token system means the tool they habituation to is consistent across all 148 tools. |
| 🥉 3 | **Option 1: Trust Minimalism** | 4/5 | Clean, fast, no surprises. Repeat users of well-designed minimal tools get very fast — they learn the pattern and can interact without reading. |
| 4 | **Option 9: Soft Institutional** | 3/5 | Trustworthy and professional but not optimized for speed and batch work. An accountant would find it slightly too verbose. |
| 5 | **Option 2: Radical Clarity** | 3/5 | One-thing-per-screen is actually *slower* for this segment. The accessibility-first design over-explains for users who already understand. |
| 6 | **Option 3: Filipino Warmth** | 2/5 | Friendly and warm — attributes that don't matter to someone doing 80 computations. The step-by-step guidance adds friction for power users. |
| 7 | **Option 6: Editorial** | 2/5 | Reading articles around the calculator is the definition of friction for this segment. No accountant will scroll through 600 words to use a calculator. |
| 8 | **Option 10: Bold Geometric** | 2/5 | Aesthetic is interesting; not designed for batch work. No keyboard shortcuts, no saved computations, no batch functionality. |
| 9 | **Option 5: Playful Utility** | 1/5 | "Kaya mo 'yan, we'll figure this out together" is condescending to Mel, who runs payroll for 600 people. The celebratory animations slow down a professional workflow. |
| 10 | **Option 8: Mobile-First** | 1/5 | Phone-first, single computation, one-thumb UX. The opposite of what a multi-monitor desktop professional needs. |

**Key insight:** Segment E has the highest retention potential but the smallest initial audience. Options 4 and 7 would dominate this segment but need careful onboarding to help lower-skill users (Segment A/B) graduate into power-user mode over time.

---

## Segment F: Young Professional (First Job)

**Archetype:** Jolo (27, fintech UX designer, BGC) or the BPO associate in their first permanent job who just heard about mandatory benefits. They're checking their rights — possibly with skepticism, possibly with curiosity. Design-literate. Uses both mobile and desktop. Would share a well-designed tool on social media.

**What they need from design:**
- Visual quality that earns respect (they'll judge it as a designer would)
- Fast, no-nonsense UX — they don't need handholding
- Feel like it's an ally, not an institution ("my rights calculator" not "the government's computation form")
- Result presented in a shareable, screenshot-ready way
- Mobile-capable but fine on desktop too

**Ranking for this segment:**

| Rank | Option | Score | Rationale |
|------|--------|-------|-----------|
| 🥇 1 | **Option 10: Bold Geometric** | 5/5 | Jolo *is* this persona. High visual quality, dark aesthetic with yellow accents, screenshot-worthy result card. Would generate organic sharing in design communities and Twitter/X. |
| 🥈 2 | **Option 5: Playful Utility** | 5/5 | Jasmine is young professional adjacent. "On your side" narrative + visual boldness + celebratory result = shareable content. Works for someone who wants to understand their rights. |
| 🥉 3 | **Option 3: Filipino Warmth** | 4/5 | Resonates culturally for young Filipinos who appreciate local design. Tagalog code-switching feels natural. Less "wow" than Options 10/5 but warm and trustworthy. |
| 4 | **Option 8: Mobile-First** | 4/5 | Renz (27, mobile-first) is similar demographic. Clean card UI, GCash-familiar pattern. Gets the job done but doesn't generate "wow" reactions. |
| 5 | **Option 1: Trust Minimalism** | 3/5 | Good design, but young professionals won't get excited about minimalism. It's fine, not inspiring. Won't generate sharing behavior. |
| 6 | **Option 6: Editorial** | 3/5 | The young professional wanting to understand their rights is actually a strong match for the editorial model. The article context serves their learning mode. |
| 7 | **Option 4: Stripe-Grade** | 2/5 | Carlo (41, payroll manager) aesthetic is too "boomer corporate" for this segment. Competent but not inspiring. |
| 8 | **Option 9: Soft Institutional** | 2/5 | Rosario persona is age-mismatched. "Institutional trust" signals read as "old and boring" to design-literate young professionals. |
| 9 | **Option 2: Radical Clarity** | 2/5 | Functional but visually dull by design. A UX designer would respect it professionally but wouldn't share it. |
| 10 | **Option 7: Dashboard-Native** | 2/5 | Over-engineered for occasional users. A young professional checking their rights once a year doesn't need batch operations. |

**Key insight:** Segment F has outsized viral potential. Young, design-literate professionals are the people most likely to share Angkin tools in their networks — IF the tool looks good enough to be proud of. Options 10 and 5 are the strongest bets for organic growth through this segment.

---

## Segment G: Retiree Checking Pension

**Archetype:** Rosario (58, retired school administrator, tablet, careful reader) or the 55+ employee who was just told about their retirement package and needs to verify the numbers with precision. Higher-trust threshold. Reads every label. Distrusts flashy things. Has time to be thorough.

**What they need from design:**
- Absolute trust signals — no gamification, no "fun" animations
- Large, readable text (accessibility-first)
- Clear explanations of what each input means
- Result that comes with enough context to be citable
- Doesn't punish slow, careful reading
- Works on tablet (not just phone or desktop)

**Ranking for this segment:**

| Rank | Option | Score | Rationale |
|------|--------|-------|-----------|
| 🥇 1 | **Option 9: Soft Institutional** | 5/5 | Rosario *is* the exact persona. "Looks like it was made by professionals who know what they're doing." Atkinson Hyperlegible font designed for legibility. Muted blues/greens. No flashy animations. Citable result format. |
| 🥈 2 | **Option 6: Editorial Calculator** | 5/5 | Rodel Bautista persona (52, reading carefully, wanting to understand) maps closely. The editorial context gives Rosario the explanation she needs to trust the number. |
| 🥉 3 | **Option 1: Trust Minimalism** | 4/5 | Clean, predictable, trustworthy. Maria Santos's "relief" applies — Rosario would appreciate not having to fight through clutter. |
| 4 | **Option 4: Stripe-Grade** | 4/5 | Professional and authoritative — trustworthy signals she'd respect. But the desktop-first design isn't optimal for her Samsung Tab. |
| 5 | **Option 2: Radical Clarity** | 4/5 | Accessibility-first design serves the reading-carefully user well. But Mang Rolly persona (low literacy) assumes less sophistication than Rosario has. |
| 6 | **Option 3: Filipino Warmth** | 3/5 | Culturally resonant but may feel too friendly/casual for Rosario's high-trust-threshold expectations. "Warm" can read as "not serious" to this segment. |
| 7 | **Option 7: Dashboard-Native** | 2/5 | Too complex for occasional use. Rosario checking her own retirement pay doesn't need saved computations and keyboard shortcuts. |
| 8 | **Option 8: Mobile-First** | 2/5 | Phone-first card swipe is wrong for a deliberate, careful tablet user. The 90-second task flow assumes a different pace than Rosario needs. |
| 9 | **Option 5: Playful Utility** | 1/5 | "Kaya mo 'yan" tone and sparkle animations would immediately fail Rosario's 3-second "is this a scam?" test. This is exactly the aesthetic she distrusts. |
| 10 | **Option 10: Bold Geometric** | 1/5 | Dark mode, electric yellow, Jolo's aesthetic — would register as "parang scam yan" for a 58-year-old school administrator. The highest-trust-requiring user needs the most institutional-looking design. |

**Key insight:** Segment G has the highest stakes — these are people making retirement decisions. The options that work for them (6, 9, editorial, institutional) are not coincidentally also the ones that score highest on trustworthiness in the comparison matrix. Trust architecture IS the accessibility strategy for this segment.

---

## Cross-Segment Fit Matrix

| Option | A: First-Time | B: HR Staff | C: OFW Mobile | D: Small Biz | E: Accountant | F: Young Pro | G: Retiree | **Best Fit Count** |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1: Trust Minimalism** | 3 | 4 | 3 | 4 | 4 | 3 | 4 | 0 primary, 6 secondary |
| **2: Radical Clarity** | **5** | 3 | 3 | 3 | 3 | 2 | 4 | 1 primary |
| **3: Filipino Warmth** | 4 | 4 | 4 | 4 | 2 | 4 | 3 | 0 primary, 5 secondary |
| **4: Stripe-Grade** | 2 | **5** | 1 | 2 | **5** | 2 | 4 | 2 primary |
| **5: Playful Utility** | 3 | 2 | **5** | 3 | 1 | **5** | 1 | 2 primary |
| **6: Editorial** | 1 | 2 | 2 | **5** | 2 | 3 | **5** | 2 primary |
| **7: Dashboard-Native** | 1 | 4 | 1 | 1 | **5** | 2 | 2 | 1 primary |
| **8: Mobile-First** | **5** | 3 | **5** | 3 | 1 | 4 | 2 | 2 primary |
| **9: Soft Institutional** | 2 | 4 | 2 | 4 | 3 | 2 | **5** | 1 primary |
| **10: Bold Geometric** | 2 | 2 | 2 | 2 | 2 | **5** | 1 | 1 primary |

**Legend:** 5 = primary fit (optimal), 4 = strong secondary, 3 = adequate, 2 = poor fit, 1 = wrong audience

---

## Key Findings

### Finding 1: No Single Option Serves All Segments

The highest cross-segment coverage belongs to **Option 3 (Filipino Warmth)** — it scores 4+ across 5 of 7 segments. But even Option 3 fails for power users (Segment E) and Design-savvy young professionals seeking visual punch (Segment F). This confirms the hybrid strategy suggested in the comparison matrix.

### Finding 2: The Trust-Usability Spectrum

Segments map along two axes:
- **Trust threshold:** How much visual authority does the user need to trust the output? (Segment G high, Segment F low)
- **Speed requirement:** How quickly does the user need the result? (Segment E highest, Segment G lowest)

```
                HIGH TRUST NEEDED
                      |
         Segment G  (Rosario, retiree)
         Segment D  (small biz owner)
                      |
    SLOW ─────────────┼───────────── FAST
                      |
         Segment A  (first-timer)     Segment E (accountant)
         Segment C  (OFW)             Segment B (HR staff)
                      |
               LOW TRUST NEEDED
                      |
              Segment F (young pro)
```

The best-fit options cluster in the quadrant they're built for. No option serves all four quadrants at once — this is the core argument for a hybrid design system.

### Finding 3: The OFW Segment Drives Growth, the Accountant Segment Drives Retention

**Segment C (OFW)** is Angkin's acquisition engine: millions of users, social sharing behavior, high urgency. Options 5 and 8 serve this segment best and would drive organic discovery.

**Segment E (Accountant)** is Angkin's retention engine: fewer users, daily habits, uses all 148 tools. Options 4 and 7 serve this segment best and would drive product stickiness.

A strategic product decision: optimize for acquisition (choose Options 5/8) or retention (choose Options 4/7) — or invest in the architectural complexity of serving both simultaneously.

### Finding 4: Option 1 (Trust Minimalism) is the "Least Wrong" Option

Option 1 scores 3-4 across every segment except it has no primary best-fit for any segment. It never fails catastrophically, but it never delivers a transcendent experience for anyone. This makes it an excellent **safe default** for a brand that needs to serve diverse users without taking risks — but a poor choice if the goal is to win any specific segment decisively.

### Finding 5: Options 6, 7, 10 Are "Specialist Plays"

Editorial (6), Dashboard-Native (7), and Bold Geometric (10) each dominate one specific segment but fail several others:
- Option 6 wins Segment D (small biz) and G (retiree) — but fails everyone who needs speed
- Option 7 wins Segment E (accountant) exclusively — fails Segments A, C, G catastrophically
- Option 10 wins Segment F (young professional) exclusively — fails Segments G, D, E significantly

These are viable options for specific product strategies but risky as the universal Angkin identity.

---

## Recommended Segment-to-Option Mapping

For a product strategy that serves the full Angkin user base:

| Strategy | Primary Design | Serve Segments | Trade-off |
|----------|---------------|----------------|-----------|
| **Mass appeal** | Option 3 + Option 8 hybrid | A, B, C, D, F | Sacrifices power-user (E) experience |
| **Trust-first** | Option 9 + Option 1 hybrid | B, D, G | Sacrifices cultural fit and viral growth |
| **Growth-first** | Option 5 + Option 8 | C, F, A | Sacrifices professional credibility |
| **Platform play** | Option 4 + Option 7 hybrid | B, E (+ D, G passable) | Desktop-biased, mobile risks at scale |
| **Full spectrum** | Hybrid A from matrix (Option 3 warmth + Option 4 tokens + Option 8 mobile) | A, B, C, D, F | Highest development complexity |

**Recommendation:** The **Full Spectrum hybrid** (Warm Stripe from comparison matrix) is the highest-ROI choice for a product serving 148 tools to all Filipino demographic segments. Segment E (power users) can be served through an advanced mode toggle, rather than requiring a separate design system.

---

*Next: Developer Experience Comparison (Aspect 25) — estimating implementation time for each option.*
