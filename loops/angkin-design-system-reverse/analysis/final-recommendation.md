# Angkin Design System — Final Ranked Recommendation

**Aspect 27 of 27** | Wave 3: Synthesis & Comparison
Generated: 2026-03-10

---

## Synthesis Method

This recommendation integrates all five Wave 3 analyses:

- **Comparison Matrix (Aspect 23):** 12-dimension scoring across all 10 options
- **Audience-Fit Analysis (Aspect 24):** 7 user segments × 10 options
- **Developer Experience (Aspect 25):** Foundation time, per-tool velocity, stack compatibility
- **Brand Strength (Aspect 26):** Name-fit, badge elegance, cross-domain coherence, competitive differentiation, shareability

Each option's final standing is a weighted synthesis — not merely the average of the four analyses, but an integrated judgment that accounts for the specific product context: **148 tools, Philippines-first, mobile-dominant, trust-critical, owned by a small team with real shipping constraints.**

---

## The Core Tension: What Angkin Is and What It Must Do

"Angkin" means *to claim as one's own*. The brand promise is radical: *these are your rights — your tools to understand them.* This frames a fundamental product design challenge:

**Trust** must be high enough that a 57-year-old security guard trusts a number he's going to show his employer. But **warmth** must be high enough that an OFW in Hong Kong doesn't feel like she's filling out another government form. And **mobile readiness** must be absolute, because 85% of Philippine internet traffic arrives on devices that cost less than ₱10,000.

No single option achieves all three at maximum strength. This is the reason the recommendation includes both ranked pure options AND a recommended hybrid — the hybrid is not a compromise, it is the product.

---

## Top 3 Options: Ranked with Detailed Rationale

---

### 🥇 #1: Option 3 — Filipino Warmth

**Score:** 48/60 (1st overall in comparison matrix)
**Brand Strength:** 20/25
**Best Segments:** First-time filers (A), OFWs (C), HR staff (B), Small business (D), Young professionals (F)
**Dev Experience:** 2–3 days foundation, 2–3 hrs per tool

#### Why It Ranks First

Filipino Warmth earns the top position not by being the best at any single dimension, but by being **the only option that scores 4 or higher across five of seven audience segments** without catastrophically failing any of the others. For a 148-tool suite serving every working Filipino demographic, breadth of serve is a primary constraint.

**The cultural fit argument is decisive.** Angkin is a Filipino word. The tools are for Filipino workers. The competitors (BIR eFPS, SSS portal, PhilHealth) all feel like foreign bureaucracy imposed on Filipino users — gray, dense, untrustworthy in texture even when correct in output. Option 3 is the only design system that could plausibly be described as "a tool made by Filipinos for Filipinos." That positioning is a competitive moat that cannot be replicated by Western design systems applied to Philippine content.

**Terracotta + Yeseva One is a rare combination in Philippine digital products.** While GCash dominates with electric blue, BDO with deep red, and Maya with purple-violet, Option 3's warm sunset palette (terracotta #E07A5F, golden amber #F2CC8F, soft sage #81B29A) occupies an unclaimed visual territory. It doesn't look like money (which feels suspicious in a compliance context), doesn't look like government (which feels bureaucratic), and doesn't look like entertainment (which feels frivolous). It looks like *understanding* — the warm, patient explanation of something complicated by someone who wants you to succeed.

**The "Ate Leny effect":** Multiple personas across multiple analyses map naturally to Option 3. The HR officer in Cebu (Ate Leny), the OFW checking her separation pay (Jasmine-adjacent), the first-time filer (Mang Rolly with guided assistance) — all feel served rather than tolerated by this design. No other option achieves this breadth without compromise.

#### What Option 3 Sacrifices (and Why That's Acceptable)

- **Trustworthiness score: 3/5** — The warmth signals "approachable" before it signals "authoritative." A 58-year-old retiree (Rosario) might need an extra layer of institutional signaling that Option 3's terracotta warmth doesn't naturally provide. *Mitigation:* The step-by-step guidance pattern and "law box" citation component (styled to match) can provide institutional grounding within the warm frame.

- **Power-user efficiency: low** — Mel Santos (38, payroll specialist, 80 computations/month) would find the guided, step-by-step warm UX inefficient. *Mitigation:* An "expert mode" toggle that collapses explanatory text and reveals all fields at once, preserving the brand palette while increasing density.

- **Visual memorability: 4/5** — Strong but not the most screenshot-worthy. The result reveal is warm and clear, but not as visually arresting as Option 10's Bebas Neue result card. *Mitigation:* A dedicated result-share card (formatted as a tall social share card with the Angkin badge, tool name, and the computed amount in large Yeseva One) can be generated on compute.

#### Implementation Path

1. Deploy Option 3 CSS (CDN-served, `cdn.angkin.ph/design/v1/angkin-warmth.css`)
2. Build domain token override files (labor.css, tax.css, property.css, ofw.css)
3. Create scaffold for the three most common archetypes: single-form, multi-step, lookup
4. Launch with the 10 highest-traffic tools (labor: retirement pay, 13th month, separation pay; tax: income, withholding; SSS/PhilHealth/Pag-IBIG contributions × 2)
5. Harvest patterns from the first 10 tools → stabilize into shared component library

---

### 🥈 #2: Option 5 — Playful Utility

**Score:** 47/60 (2nd overall)
**Brand Strength:** 19/25
**Best Segments:** OFWs (C), Young professionals (F), First-time filers (A) second-tier
**Dev Experience:** 2–3 days foundation, 1–2 hrs per tool (fastest of all single-app options)

#### Why It Ranks Second

Option 5 is the strongest candidate for **organic growth**. In the Audience-Fit analysis, it is co-primary for the two segments with the highest viral potential: OFWs checking rights remotely (Segment C) and young design-literate professionals (Segment F). These are the users most likely to screenshot a result and share it in a Viber group, post it on Twitter, or recommend it in a Facebook group — which is how a 148-tool compliance suite achieves scale without a marketing budget.

**The CLI generator is a developer experience standout.** `npx angkin-new retire-math --domain labor --inputs "salary,years"` scaffolding a complete tool in 1–2 hours is the fastest delivery mechanism of any non-dashboard option. For a small team shipping 148 tools, this velocity multiplier is non-trivial.

**"Kaya mo 'yan" as a brand manifesto.** Option 5's most powerful design element is tonal: it positions Angkin as *the user's ally against complexity*, not as *an authority dispensing information*. This is the most sophisticated brand positioning in the set. Compliance tools historically position as "accurate and authoritative" — but users don't fail to use them because they doubt accuracy; they fail because they feel intimidated. Option 5 removes intimidation as the primary product challenge.

**The result celebration moment** (count-up animation + confetti burst when computing) is the only native social-sharing UX in the set. When a factory worker sees "₱87,450.00 — you're owed this" rendered in bold coral with a subtle sparkle, that is a shareable moment. Multiplied across 148 tools and millions of users, this creates organic word-of-mouth distribution.

#### What Option 5 Sacrifices (and Why That's a Strategic Risk)

- **Trustworthiness: 3/5** — The celebration mechanics raise the "is this serious?" doubt for users with high-stakes decisions (Rosario checking retirement, Segment G). This is not fatal for most tools, but IS a problem for the highest-stakes computations (separation pay disputes, retirement package negotiations). *Mitigation:* A "tone dial" in the design system — celebration animations are opt-in per tool, defaulting to subtle for high-stakes tools.

- **HR/professional credibility: 2/5** — Ate Leny (HR officer compiling payroll) would find the coral-and-sparkle aesthetic inconsistent with the professional gravity of the work. *Mitigation:* A professional variant that preserves the bold colors but removes animations and adopts more neutral typography for tools with known professional primary audiences.

- **Developer experience dependency on design team** — Bold colors and illustrations create a higher design-team dependency per tool. The CLI generates structure; it can't generate tool-specific illustrations. *Mitigation:* A curated illustration library (one per compliance domain, 14+ illustrations total) eliminates per-tool illustration needs.

#### Why Option 5 Ranks Below Option 3

The tie-breaker is breadth vs. depth: Option 3 serves more segments adequately; Option 5 serves fewer segments brilliantly. For a suite that must work for Mang Rolly (57, security guard, first-timer) AND Ate Leny (HR officer) AND Rosario (58, retiree), Option 3's breadth advantage is the deciding factor. Option 5's depth in OFW/young-professional segments is a strength, but those segments' viral growth contribution, while valuable, is secondary to the suite's core mission of universal Filipino compliance access.

---

### 🥉 #3: Option 8 — Mobile-First Micro-App

**Score:** 45/60 (3rd overall)
**Brand Strength:** 16/25
**Best Segments:** OFWs (C), First-time filers (A), Young professionals second-tier (F)
**Dev Experience:** 2–3 days foundation, ~45 min per tool (tied fastest with Option 7)

#### Why It Ranks Third

Option 8 represents the **honest architecture for Philippine internet realities**. When 85% of users arrive on mobile, designing for desktop-first and "making it responsive" is a lie — the mobile experience is always second-class. Option 8 makes mobile primary, not accommodated. This architectural honesty pays dividends in UX quality, performance, and cultural fit.

**The 90-second task flow is the right constraint.** A compliance tool that can be completed in 90 seconds on a ₱5,000 Redmi Note with spotty LTE is serving Philippine users' actual reality. Options designed for 10-minute deep-dives are serving a Western user model projected onto Filipino users.

**GCash-pattern familiarity** is a genuine advantage. Filipino mobile users have the most experience with GCash's card-stack navigation, bottom tabs, and CTA-button-at-bottom layouts. Option 8 speaks the visual dialect that millions of Filipinos use daily. The learning curve approaches zero.

**PWA installability** is the distribution mechanism most suited to the Angkin use case. Users who calculate their 13th month pay in November and want to check overtime rates in March can install the tool to their home screen without app store friction. For tools with seasonal usage patterns (DOLE deadlines, SSS contribution changes), installability creates a retention mechanism.

#### What Option 8 Sacrifices (and Why It's a Structural Limitation)

- **Content adaptability: 2/5** — The card-swipe model that makes Option 8 elegant for single-form calculators breaks for multi-step wizards, lookup tables, and dashboard/trackers. At least 40% of the 148-tool suite (complex archetypes) would require architectural redesign to fit the mobile-first card model. *This is not a mitigation problem; it's a structural constraint.*

- **Cross-tool coherence: 3/5** — Independent PWAs (148 separate deployments, 148 PWA manifests) make architectural coherence an active maintenance problem, not a system guarantee. Over time, tool #47 and tool #3 will drift unless aggressive governance prevents it. *Mitigation exists but requires sustained engineering discipline.*

- **Brand strength: 16/25 (lowest of the top 3)** — The independent-PWA model fragments the "by Angkin" brand signal. There is no persistent chrome that says "this is Angkin" — only a badge in the card header. For a brand trying to establish suite-level recognition (so that users discover tool #47 because they loved tool #3), this fragmentation works against the core business objective.

#### Why Option 8 Ranks Below Options 3 and 5

The structural limitations on content adaptability disqualify Option 8 as the *primary* design system for a 148-tool suite that includes lookup tables, decision trees, multi-step wizards, and dashboard/trackers. It excels as a mobile pattern library that informs the suite's mobile implementation — but it cannot serve as the unified system architecture on its own.

---

## The Recommended Hybrid: "Warm Stripe"

Based on the cross-analysis, no pure option scores above 48/60. The three recommended hybrid profiles from the comparison matrix all score above 49/60 estimated. The **Warm Stripe** hybrid — estimated at 52/60 — is the strategic recommendation.

### Warm Stripe: Option 3 Color Warmth + Option 4 Token Architecture + Option 8 Mobile Patterns

This is not a compromise between three options. It is a layered architecture where each option contributes its primary strength:

| Layer | Contributor | What It Provides |
|-------|-------------|-----------------|
| **Brand & Color** | Option 3 (Filipino Warmth) | Terracotta/amber/sage palette, Yeseva One display, cultural resonance, Tagalog-aware micro-copy |
| **Architecture** | Option 4 (Stripe-Grade) | `tokens.json` → `tokens.css` + `tokens.d.ts` pipeline, semantic versioning, Style Dictionary governance, TypeScript-first component API |
| **Mobile Patterns** | Option 8 (Mobile-First) | Card-first layouts, bottom CTA, 90-second flow, PWA installability, GCash-pattern familiarity |

### What the Warm Stripe System Looks Like

**Token Layer (Option 4 architecture)**
```
packages/
  @angkin/tokens/
    tokens.json          # Single source of truth
    tokens.css           # CSS custom properties output
    tokens.d.ts          # TypeScript type exports
    tokens.tailwind.js   # Tailwind preset

  @angkin/ui/
    components/          # React 19 component library
      Calculator.tsx     # Base calculator shell
      ResultCard.tsx     # The "claim your rights" moment
      StepIndicator.tsx  # Multi-step wizard progress
      LookupTable.tsx    # Reference table archetype
    index.ts
```

**Visual Vocabulary (Option 3 brand)**
```css
/* Base tokens — Option 3's warmth in Option 4's architecture */
--color-brand-primary: #E07A5F;      /* Terracotta */
--color-brand-secondary: #F2CC8F;    /* Golden amber */
--color-brand-accent: #81B29A;       /* Soft sage */
--color-surface: #FEFAF6;            /* Warm off-white */
--color-text-primary: #2D2A26;       /* Warm near-black */

/* Domain overrides — 14 compliance domains */
--color-domain-labor: #E07A5F;       /* Warm terracotta */
--color-domain-tax: #C1854E;         /* Deep amber */
--color-domain-property: #81B29A;    /* Sage green */
--color-domain-ofw: #5C8BA3;         /* Trust blue (OFW tools) */
--color-domain-maritime: #2D6A8F;    /* Deep sea (MARINA) */
```

**Mobile Patterns (Option 8's interaction model)**
- Card-container layouts for all form archetypes (one card per section)
- Bottom-fixed CTA button ("I-compute" / "Compute")
- Swipe-friendly step transitions for multi-step wizards
- PWA manifest template in tool scaffold
- GCash-pattern bottom tabs for hub navigation

**Result Card: The "Claim Your Rights" Moment**
The computation result is the brand's most important design moment. In Warm Stripe, it renders as:

```
┌────────────────────────────────────┐
│  Yeseva One, 48px                  │
│  ₱ 87,450.00                       │
│  ─────────────────────────────────  │
│  Retirement Pay due (RA 7641)      │
│                                     │
│  Breakdown:                         │
│  Last 6-month avg. salary  ₱22,500 │
│  Multiplied by years        ×  3.5  │
│  = ₱78,750 + ₱8,700 (13th)         │
│                                     │
│  [Share result] [Compute again]     │
│                      by Angkin  ↗  │
└────────────────────────────────────┘
```

The terracotta border-left (4px) on the result card, Yeseva One for the number, and the "by Angkin" in the bottom-right create a brand signature that is visually distinct, culturally resonant, and screenshot-worthy.

### Warm Stripe Estimated Scores

| Dimension | Opt 3 Pure | Warm Stripe Hybrid |
|-----------|:----------:|:-----------------:|
| Friendliness | 5 | 5 |
| Trustworthiness | 3 | 4 |
| Distinctiveness | 4 | 4 |
| Simplicity | 4 | 5 |
| Scalability | 4 | 5 |
| Developer Ergonomics | 4 | 5 |
| Brand Cohesion | 4 | 5 |
| Mobile Readiness | 4 | 5 |
| Accessibility | 4 | 4 |
| Filipino Cultural Fit | 5 | 5 |
| Content Adaptability | 3 | 5 |
| Visual Memorability | 4 | 4 |
| **TOTAL** | **48/60** | **~56/60** |

---

## Two Additional Hybrid Profiles

### Hybrid B: "Trusted Mobile"
**Option 9 (Soft Institutional) typography + Option 8 (Mobile-First) patterns + Option 1 (Trust Minimalism) whitespace philosophy**

Estimated score: ~50/60
Best for: compliance tools where output has highest stakes (separation pay disputes, retirement package challenges, property transfer disputes)
Primary segments: B (HR staff), D (small business), G (retiree)

Implementation signal: Use this hybrid for the "High Stakes" tool tier — tools where users are most likely to be in a dispute or making consequential decisions. Cormorant Garamond + Atkinson Hyperlegible as the type pairing creates immediate institutional authority; Option 8's mobile patterns ensure it still works for the OFW checking on her phone.

### Hybrid C: "Distinctive Clarity"
**Option 10 (Bold Geometric) brand signature + Option 2 (Radical Clarity) content structure + Option 5 (Playful Utility) result celebration**

Estimated score: ~49/60
Best for: maximum brand differentiation and viral growth through social sharing
Primary segments: F (young professionals), C (OFWs), A (first-timers)

Implementation signal: This hybrid is the strongest candidate for a **content marketing strategy** — if Angkin's growth model relies on social sharing and organic discovery, the Bebas Neue result card + Radical Clarity form structure + sparkle result celebration is the highest-shareability combination in the set. The risk is that trustworthiness scores drop for older, higher-stakes user segments.

---

## Recommended Next Steps

### Step 1: Validate with Users — Option 3 as Prototype (Next 2 Weeks)

Build a functional prototype of **Option 3 (Filipino Warmth)** for three tools:
- RetireMath (retirement pay — highest search volume)
- SeparaKalc (separation pay — OFW primary use case)
- 13thMonthCalc (13th month — universal use case, seasonally viral)

Test with 5-8 users across two segments:
- Segment A (first-time filer): recruit via Facebook groups about labor rights
- Segment B (HR/payroll): recruit via LinkedIn HR Philippines groups

**Key hypotheses to test:**
1. Does the terracotta warmth signal "trustworthy" or "unprofessional" to HR staff?
2. Does the Tagalog-optional micro-copy ("Pwede ring I-compute ito para sa...") feel natural or forced?
3. Is the result card (Yeseva One + terracotta border) screenshot-worthy? Do users share it unprompted?
4. Do users understand the "by Angkin" badge? Do they know what Angkin is after their first session?

### Step 2: Build the Token Architecture — Option 4 as Foundation (Weeks 3–6)

Regardless of the final visual identity decision, begin implementing **Option 4's token architecture** immediately. This is non-controversial: the token layer is independent of the visual language and will be the foundation for any option or hybrid.

```bash
# Deliverable: @angkin/tokens package in the monorepo
packages/angkin/tokens/
  tokens.json        # Define color, typography, spacing, radius, shadow tokens
  tokens.css         # CSS custom properties output (auto-generated)
  tokens.d.ts        # TypeScript types (auto-generated)
  tailwind.config.js # Tailwind preset (maps tokens to utilities)
  README.md          # Governance rules for new domain colors
```

This can be done in parallel with user testing (Step 1) and before the visual identity is locked. When user testing validates Option 3 (or a variation), the visual layer plugs into the already-built token architecture.

### Step 3: MVP Scope — Ship 10 Tools with Warm Stripe (Weeks 7–16)

After user testing validates the visual direction (ideally validating Option 3 warmth with Option 4 token architecture), ship the first 10 Angkin tools:

**Labor tools (highest urgency/volume):**
1. RetireMath (RA 7641)
2. SeparaKalc (separation pay)
3. 13thMonthCalc
4. OvertimePay
5. HazardPay

**Contribution tools (universal use):**
6. SSS Contribution Calculator
7. PhilHealth Premium Calculator
8. Pag-IBIG Fund Calculator

**Tax tools (high search volume):**
9. IncomeTaxKlaro (individual)
10. WithholdingTax

Validate the token system, CDN pipeline, and component library with real tools before scaling to 148. Tools 11-148 should follow the established pattern with minimal design decisions required.

### Step 4: Advanced Mode Toggle (Month 4+)

Once the core suite is stable, implement an **advanced mode** toggle — available globally and per-tool — that:
- Collapses explanatory text to show all fields simultaneously
- Removes guided step progression in favor of single-page form
- Enables keyboard navigation (Tab between fields, Enter to compute)
- Preserves the brand palette but increases information density

This serves Segment E (accountants) without building a separate design system (Option 7) or fragmenting the product into multiple shells.

### Step 5: Social Share Cards (Month 4+)

Implement the result-share card mechanism across all launched tools:
- A formatted tall-card (1080×1920 PNG) generated on compute
- Tool name + computed amount in large type + Angkin branding + QR code to tool
- One-tap share button (opens to Messenger, Viber, or WhatsApp)

This is the viral flywheel that makes Angkin's Filipino cultural warmth into a distribution mechanism.

---

## Final Verdict: What to Do on Monday

1. **Adopt Warm Stripe as the strategic target** — Option 3's visual identity on Option 4's token architecture with Option 8's mobile interaction patterns.

2. **Start the token architecture now** — Begin `packages/angkin/tokens/` this week. It's the right foundation regardless of final visual choices.

3. **Prototype Option 3 for user testing** — Build RetireMath, SeparaKalc, and 13thMonthCalc in the Option 3 aesthetic. Test with real Filipinos. Listen to whether the terracotta warmth reads as trustworthy.

4. **Reserve Option 5 as the "Growth Variant"** — If user testing reveals that the young-professional/OFW segment wants more celebration and visual boldness, the Playful Utility aesthetic is ready to deploy as an optional tool theme or for a specific sub-domain (e.g., `ofw.angkin.ph`).

5. **Reserve Option 7 or Option 4 tokens as the "Power User Mode"** — The accountant segment can be served via an advanced-mode toggle, not a separate system.

**The single most important design decision:** The result card. Whatever visual system is chosen, the moment when the user sees their computed amount — the "₱87,450.00" rendered in large type with clear context — is the moment that builds trust, creates sharing behavior, and defines the brand. Invest disproportionate design effort here.

---

## Summary Table: All 10 Options + Hybrids

| Option | Overall Score | Primary Strength | Best For | Avoid For |
|--------|:---:|---|---|---|
| **3: Filipino Warmth** | 48/60 | Cultural fit + breadth | Mass audience, Philippines-first | Power users, retirees needing authority |
| **5: Playful Utility** | 47/60 | Viral/OFW appeal | Growth + young/OFW | High-stakes professional work |
| **8: Mobile-First** | 45/60 | Mobile UX purity | 90-second phone use | Complex archetype tools |
| **1: Trust Minimalism** | 44/60 | Balanced trustworthiness | Safe default | Viral growth |
| **4: Stripe-Grade** | 44/60 | Dev ergonomics + coherence | Power users + large teams | First-timers, OFWs |
| **9: Soft Institutional** | 44/60 | Highest trust ceiling | Retirees + formal decisions | Young/OFW growth |
| **10: Bold Geometric** | 44/60 | Visual memorability | Young professionals | Older users, trust-critical |
| **2: Radical Clarity** | 43/60 | Accessibility + mobile | Low literacy, government adjacent | Cultural resonance, sharing |
| **7: Dashboard-Native** | 41/60 | Power-user efficiency | Accountants, bulk work | Everyone else |
| **6: Editorial** | 39/60 | Contextual trust-building | Small business education | Speed-oriented users |
| **Hybrid A: Warm Stripe** | ~52/60 | Breadth + architecture + mobile | Full Angkin audience | N/A — designed to serve all |
| **Hybrid B: Trusted Mobile** | ~50/60 | Trust + mobile | High-stakes decisions | Viral growth, young professionals |
| **Hybrid C: Distinctive Clarity** | ~49/60 | Differentiation + shareability | Social-first growth strategy | Trust-critical tools |

---

*This completes Wave 3 — Synthesis & Comparison. All 27 aspects are now done. The loop convergence check follows.*
