# SEO & Content Growth Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SEO infrastructure, 6 high-intent landing pages, a blog system with 6 posts, and GA4 analytics to the inheritance calculator SPA.

**Architecture:** All new pages are public routes under TanStack Router's `publicRootRoute`. A `<SEOHead>` component handles per-page meta tags via `useEffect` (no SSR). Landing pages embed `QuickCalcWidget` with a new optional `initialHeirs` prop. Blog posts are `.tsx` files with exported metadata constants. GA4 events fire from a thin `analytics.ts` helper.

**Tech Stack:** React 19, TanStack Router 1.163.3, Vite 7.3, Tailwind 4.2, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-03-19-seo-content-growth-engine-design.md`

**Prerequisites (manual, before implementation):**
- Register domain (`.ph` or `.com`) and point to Fly via CNAME — spec suggests `inheritance.ph`, `mana.ph`, or `successionlaw.ph`
- Create GA4 property and get measurement ID (replace `G-XXXXXXXXXX` in index.html)
- Set up Google Search Console, verify domain ownership
- After deployment: submit sitemap.xml to Search Console

---

## File Map

### New Files

| File | Purpose |
|------|---------|
| `src/components/seo/SEOHead.tsx` | Sets document title, meta description, canonical URL, OG tags via useEffect |
| `src/components/seo/JsonLd.tsx` | Renders JSON-LD structured data script tag |
| `src/lib/analytics.ts` | GA4 gtag helper — `trackEvent(name, params)` + specific event wrappers |
| `src/components/landing/LandingPageLayout.tsx` | Shared layout for all landing pages: SEO head + hero + widget + explainer + internal links |
| `src/routes/landing/intestate-succession-calculator.tsx` | Landing page route |
| `src/routes/landing/legitimate-share-calculator.tsx` | Landing page route |
| `src/routes/landing/spouse-and-children-inheritance.tsx` | Landing page route |
| `src/routes/landing/illegitimate-child-inheritance.tsx` | Landing page route |
| `src/routes/landing/parents-inheritance-share.tsx` | Landing page route |
| `src/routes/landing/no-will-inheritance-philippines.tsx` | Landing page route |
| `src/components/blog/BlogLayout.tsx` | Shared blog post layout: SEO head + article wrapper + CTA footer |
| `src/components/blog/BlogIndex.tsx` | Blog index page component listing all posts |
| `src/routes/blog/index.tsx` | `/blog` route |
| `src/routes/blog/intestate-vs-testate.tsx` | Blog post route |
| `src/routes/blog/how-to-compute-legitime.tsx` | Blog post route |
| `src/routes/blog/illegitimate-children-rights.tsx` | Blog post route |
| `src/routes/blog/no-will-philippines.tsx` | Blog post route |
| `src/routes/blog/preterition-explained.tsx` | Blog post route |
| `src/routes/blog/parents-inheritance-share.tsx` | Blog post route |
| `src/lib/blog-posts.ts` | Blog post metadata registry (title, slug, description, date, keywords) |
| `public/robots.txt` | Allows full crawl, points to sitemap |
| `scripts/generate-sitemap.ts` | Build-time sitemap.xml generator |

### Modified Files

| File | Change |
|------|--------|
| `index.html` | Add GA4 gtag snippet, default OG meta tags, favicon link |
| `src/components/quick-calc/QuickCalcWidget.tsx` | Add optional `initialHeirs` prop |
| `src/components/quick-calc/defaults.ts` | Export `QuickCalcHeir` type (already exported) |
| `src/router.ts` | Import and register all new routes under `publicRootRoute` |
| `src/routes/__root.tsx` | Update `isPublicRoute` check to include landing + blog paths |
| `vite.config.ts` | Add post-build sitemap generation hook |
| `package.json` | Add `generate-sitemap` script |

---

## Task 1: SEOHead Component

**Files:**
- Create: `src/components/seo/SEOHead.tsx`

- [ ] **Step 1: Create SEOHead component**

```tsx
// src/components/seo/SEOHead.tsx
import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

const SITE_NAME = 'Inheritance Calculator Philippines';
const BASE_URL = 'https://inheritance-frontend.fly.dev';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;

export function SEOHead({ title, description, canonical, ogImage }: SEOHeadProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical || `${BASE_URL}${window.location.pathname}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) ||
               document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (property.startsWith('og:')) {
          el.setAttribute('property', property);
        } else {
          el.setAttribute('name', property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', fullTitle);
    setMeta('og:description', description);
    setMeta('og:image', image);
    setMeta('og:type', 'website');
    setMeta('og:url', canonicalUrl);

    // Canonical link
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;
  }, [fullTitle, description, canonicalUrl, image]);

  return null;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd apps/inheritance/frontend && npx tsc --noEmit`
Expected: No errors related to SEOHead

- [ ] **Step 3: Commit**

```bash
git add src/components/seo/SEOHead.tsx
git commit -m "feat(seo): add SEOHead component for per-page meta tags"
```

---

## Task 2: JSON-LD Structured Data Component

**Files:**
- Create: `src/components/seo/JsonLd.tsx`

- [ ] **Step 1: Create JsonLd component**

```tsx
// src/components/seo/JsonLd.tsx
interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const CALCULATOR_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Inheritance Calculator Philippines',
  applicationCategory: 'LegalService',
  operatingSystem: 'Web',
  description: 'Free Philippine succession law calculator. Compute inheritance shares for intestate, testate, and mixed succession.',
  url: 'https://inheritance-frontend.fly.dev',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'PHP',
  },
};
```

- [ ] **Step 2: Verify it compiles**

Run: `cd apps/inheritance/frontend && npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/seo/JsonLd.tsx
git commit -m "feat(seo): add JSON-LD structured data component"
```

---

## Task 3: GA4 Analytics Integration

**Files:**
- Modify: `index.html`
- Create: `src/lib/analytics.ts`

- [ ] **Step 1: Add GA4 gtag to index.html**

Add before `</head>` in `index.html` (replace `G-XXXXXXXXXX` with actual measurement ID when available):

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Also add default meta tags to `<head>`:

```html
<meta name="description" content="Free Philippine inheritance calculator. Compute estate distribution for intestate, testate, and mixed succession under the Civil Code." />
<meta property="og:title" content="Inheritance Calculator Philippines" />
<meta property="og:description" content="Free Philippine inheritance calculator. Compute estate distribution under the Civil Code." />
<meta property="og:type" content="website" />
```

- [ ] **Step 2: Create analytics helper**

```ts
// src/lib/analytics.ts
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function trackEvent(name: string, params?: Record<string, unknown>) {
  if (window.gtag) {
    window.gtag('event', name, params);
  }
}

export function trackQuickCalcUsed(heirCount: number) {
  trackEvent('quick_calc_used', { heir_count: heirCount });
}

export function trackSignupStarted() {
  trackEvent('signup_started');
}

export function trackSignupCompleted() {
  trackEvent('signup_completed');
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd apps/inheritance/frontend && npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add index.html src/lib/analytics.ts
git commit -m "feat(analytics): add GA4 gtag and event tracking helpers"
```

---

## Task 4: Add `initialHeirs` Prop to QuickCalcWidget

**Files:**
- Modify: `src/components/quick-calc/QuickCalcWidget.tsx`

- [ ] **Step 1: Write test for initialHeirs**

Create or update `src/components/quick-calc/__tests__/QuickCalcWidget.test.tsx` to add a test:

```tsx
it('renders with pre-filled heirs when initialHeirs is provided', () => {
  render(<QuickCalcWidget initialHeirs={[{ type: 'SurvivingSpouse' }, { type: 'LegitimateChild' }]} />);
  expect(screen.getByText('Surviving Spouse')).toBeInTheDocument();
  expect(screen.getByText('Legitimate Child 1')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/inheritance/frontend && npx vitest run --reporter=verbose -- QuickCalcWidget`
Expected: FAIL — QuickCalcWidget doesn't accept `initialHeirs` prop

- [ ] **Step 3: Add initialHeirs prop**

In `src/components/quick-calc/QuickCalcWidget.tsx`, change the component signature and useState:

```tsx
// Change:
export function QuickCalcWidget() {
  const [heirs, setHeirs] = useState<QuickCalcHeir[]>([]);

// To:
interface QuickCalcWidgetProps {
  initialHeirs?: QuickCalcHeir[];
}

export function QuickCalcWidget({ initialHeirs }: QuickCalcWidgetProps) {
  const [heirs, setHeirs] = useState<QuickCalcHeir[]>(initialHeirs ?? []);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/inheritance/frontend && npx vitest run --reporter=verbose -- QuickCalcWidget`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/quick-calc/QuickCalcWidget.tsx src/components/quick-calc/__tests__/QuickCalcWidget.test.tsx
git commit -m "feat(quick-calc): add optional initialHeirs prop for landing pages"
```

---

## Task 5: robots.txt and Sitemap Generation

**Files:**
- Create: `public/robots.txt`
- Create: `scripts/generate-sitemap.ts`
- Modify: `package.json`

- [ ] **Step 1: Create robots.txt**

```
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://inheritance-frontend.fly.dev/sitemap.xml
```

- [ ] **Step 2: Create sitemap generator script**

```ts
// scripts/generate-sitemap.ts
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = 'https://inheritance-frontend.fly.dev';
const today = new Date().toISOString().slice(0, 10);

const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/intestate-succession-calculator', priority: '0.9', changefreq: 'monthly' },
  { path: '/legitimate-share-calculator', priority: '0.9', changefreq: 'monthly' },
  { path: '/spouse-and-children-inheritance', priority: '0.9', changefreq: 'monthly' },
  { path: '/illegitimate-child-inheritance', priority: '0.9', changefreq: 'monthly' },
  { path: '/parents-inheritance-share', priority: '0.9', changefreq: 'monthly' },
  { path: '/no-will-inheritance-philippines', priority: '0.9', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/intestate-vs-testate', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/how-to-compute-legitime', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/illegitimate-children-rights', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/no-will-philippines', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/preterition-explained', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/parents-inheritance-share', priority: '0.7', changefreq: 'monthly' },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

const outPath = resolve(import.meta.dirname, '../dist/sitemap.xml');
writeFileSync(outPath, xml, 'utf-8');
console.log(`Sitemap written to ${outPath}`);
```

- [ ] **Step 3: Add script to package.json**

Add to `"scripts"`:
```json
"postbuild": "tsx scripts/generate-sitemap.ts"
```

And add `tsx` to devDependencies if not present:
```bash
cd apps/inheritance/frontend && npm install -D tsx
```

- [ ] **Step 4: Test the build**

Run: `cd apps/inheritance/frontend && npm run build`
Expected: Build succeeds, `dist/sitemap.xml` is generated, `dist/robots.txt` is copied from `public/`

- [ ] **Step 5: Commit**

```bash
git add public/robots.txt scripts/generate-sitemap.ts package.json package-lock.json
git commit -m "feat(seo): add robots.txt and build-time sitemap generation"
```

---

## Task 6: Landing Page Layout Component

**Files:**
- Create: `src/components/landing/LandingPageLayout.tsx`

- [ ] **Step 1: Create the shared layout**

```tsx
// src/components/landing/LandingPageLayout.tsx
import { Link } from '@tanstack/react-router';
import { SEOHead } from '@/components/seo/SEOHead';
import { JsonLd, CALCULATOR_JSONLD } from '@/components/seo/JsonLd';
import { QuickCalcWidget } from '@/components/quick-calc/QuickCalcWidget';
import type { QuickCalcHeir } from '@/components/quick-calc/defaults';

interface RelatedLink {
  to: string;
  label: string;
}

interface LandingPageLayoutProps {
  title: string;
  description: string;
  headline: string;
  subheadline: string;
  initialHeirs?: QuickCalcHeir[];
  legalExplainer: React.ReactNode;
  relatedLinks: RelatedLink[];
}

export function LandingPageLayout({
  title,
  description,
  headline,
  subheadline,
  initialHeirs,
  legalExplainer,
  relatedLinks,
}: LandingPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={title} description={description} />
      <JsonLd data={CALCULATOR_JSONLD} />

      <div className="max-w-2xl mx-auto py-16 sm:py-24 px-4 sm:px-6">
        {/* Navigation back to home */}
        <nav className="mb-8">
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Inheritance Calculator
          </Link>
        </nav>

        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-[#c5a44e] text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            Philippine Succession Law
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-serif text-foreground mb-4 leading-[1.1]">
            {headline}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            {subheadline}
          </p>
        </div>

        {/* Calculator Widget */}
        <div className="max-w-md mx-auto mb-16">
          <QuickCalcWidget initialHeirs={initialHeirs} />
        </div>

        {/* Legal Explainer */}
        <article className="prose prose-slate max-w-none mb-16">
          {legalExplainer}
        </article>

        {/* Related Links */}
        <nav className="border-t pt-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Related Topics
          </h2>
          <ul className="space-y-2">
            {relatedLinks.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-primary hover:underline text-sm">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd apps/inheritance/frontend && npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingPageLayout.tsx
git commit -m "feat(landing): add shared LandingPageLayout component"
```

---

## Task 7: Landing Pages (All 6)

**Files:**
- Create: `src/routes/landing/intestate-succession-calculator.tsx`
- Create: `src/routes/landing/legitimate-share-calculator.tsx`
- Create: `src/routes/landing/spouse-and-children-inheritance.tsx`
- Create: `src/routes/landing/illegitimate-child-inheritance.tsx`
- Create: `src/routes/landing/parents-inheritance-share.tsx`
- Create: `src/routes/landing/no-will-inheritance-philippines.tsx`

Each landing page follows the same pattern. Here is the first one in full; the rest follow the same structure with different content.

- [ ] **Step 1: Create intestate-succession-calculator landing page**

```tsx
// src/routes/landing/intestate-succession-calculator.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { LandingPageLayout } from '@/components/landing/LandingPageLayout';

export const intestateSuccessionCalculatorRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/intestate-succession-calculator',
  component: IntestateSuccessionCalculatorPage,
});

function IntestateSuccessionCalculatorPage() {
  return (
    <LandingPageLayout
      title="Intestate Succession Calculator Philippines"
      description="Free online calculator for intestate succession under Philippine law. Compute inheritance shares when there is no will, based on the Civil Code of the Philippines."
      headline="Intestate Succession Calculator"
      subheadline="Compute inheritance shares when the deceased left no will. Based on Articles 960-1014 of the Civil Code."
      legalExplainer={
        <>
          <h2 className="text-xl font-bold font-serif">What Is Intestate Succession?</h2>
          <p>
            Intestate succession occurs when a person dies without leaving a valid will, or when the will does not cover all of the deceased's property. Under Philippine law (Articles 960-1014 of the Civil Code), the estate is distributed according to a fixed order of priority among the heirs.
          </p>
          <p>
            The law designates compulsory heirs — the surviving spouse, legitimate children, illegitimate children, and legitimate parents — who are entitled to specific shares called <em>legitimes</em>. The order of succession and the size of each share depend on which heirs survive the decedent.
          </p>
          <p>
            For example, if the deceased is survived by a spouse and two legitimate children, the estate is divided equally among them. If there are no descendants, the parents inherit alongside the surviving spouse according to specific proportions set by law.
          </p>
        </>
      }
      relatedLinks={[
        { to: '/spouse-and-children-inheritance', label: 'Inheritance Share of Surviving Spouse & Children' },
        { to: '/no-will-inheritance-philippines', label: 'What Happens When There Is No Will?' },
        { to: '/legitimate-share-calculator', label: 'How to Compute the Legitime' },
        { to: '/blog/intestate-vs-testate', label: 'Blog: Intestate vs Testate Succession' },
      ]}
    />
  );
}
```

- [ ] **Step 2: Create legitimate-share-calculator landing page**

```tsx
// src/routes/landing/legitimate-share-calculator.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { LandingPageLayout } from '@/components/landing/LandingPageLayout';

export const legitimateShareCalculatorRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/legitimate-share-calculator',
  component: LegitimateShareCalculatorPage,
});

function LegitimateShareCalculatorPage() {
  return (
    <LandingPageLayout
      title="Legitime Calculator Philippines — Compute Compulsory Shares"
      description="Calculate the legitime (compulsory share) of each heir under Philippine succession law. Free tool based on the Civil Code."
      headline="Legitimate Share Calculator"
      subheadline="Compute the compulsory shares (legitimes) that the law guarantees to each heir."
      legalExplainer={
        <>
          <h2 className="text-xl font-bold font-serif">What Is the Legitime?</h2>
          <p>
            The legitime is the portion of the deceased's estate that the law reserves for compulsory heirs. Under Articles 886-914 of the Civil Code, no will or donation can impair these reserved shares. Compulsory heirs include legitimate children and descendants, the surviving spouse, legitimate parents and ascendants, and illegitimate children.
          </p>
          <p>
            The size of each heir's legitime depends on who survives the decedent. For instance, if only legitimate children survive, they share one-half of the estate equally as their combined legitime. The other half is the free portion, which the decedent may dispose of freely by will.
          </p>
          <p>
            Calculating the legitime correctly is essential for both testate and intestate succession. If a will fails to respect the legitimes, affected heirs may petition for the reduction of excessive testamentary dispositions.
          </p>
        </>
      }
      relatedLinks={[
        { to: '/intestate-succession-calculator', label: 'Intestate Succession Calculator' },
        { to: '/spouse-and-children-inheritance', label: 'Spouse & Children Inheritance Shares' },
        { to: '/blog/how-to-compute-legitime', label: 'Blog: How to Compute the Legitime' },
        { to: '/blog/preterition-explained', label: 'Blog: Preterition Explained' },
      ]}
    />
  );
}
```

- [ ] **Step 3: Create spouse-and-children-inheritance landing page**

```tsx
// src/routes/landing/spouse-and-children-inheritance.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { LandingPageLayout } from '@/components/landing/LandingPageLayout';

export const spouseAndChildrenInheritanceRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/spouse-and-children-inheritance',
  component: SpouseAndChildrenInheritancePage,
});

function SpouseAndChildrenInheritancePage() {
  return (
    <LandingPageLayout
      title="Inheritance Share of Surviving Spouse & Children — Philippines"
      description="Calculate how a Philippine estate is divided between the surviving spouse and children. Covers legitimate and illegitimate children under the Civil Code."
      headline="Spouse & Children Inheritance"
      subheadline="How the estate is divided when both a surviving spouse and children inherit."
      initialHeirs={[
        { type: 'SurvivingSpouse' },
        { type: 'LegitimateChild' },
        { type: 'LegitimateChild' },
      ]}
      legalExplainer={
        <>
          <h2 className="text-xl font-bold font-serif">Inheritance When Spouse and Children Survive</h2>
          <p>
            When the deceased is survived by both a spouse and legitimate children, Article 996 of the Civil Code provides that the surviving spouse receives a share equal to the legitime of each legitimate child. In practical terms, the surviving spouse is treated as an additional child for division purposes.
          </p>
          <p>
            For example, if the decedent leaves a spouse and two legitimate children, the estate is divided into three equal shares — one for the spouse and one for each child. If illegitimate children also survive, they receive shares equal to half the legitime of a legitimate child (Article 176, Family Code).
          </p>
          <p>
            The surviving spouse's share is separate from any community property or conjugal partnership interests. The estate subject to succession is only the decedent's net share after settling debts and separating the surviving spouse's half of community property.
          </p>
        </>
      }
      relatedLinks={[
        { to: '/illegitimate-child-inheritance', label: 'Illegitimate Child Inheritance Rights' },
        { to: '/intestate-succession-calculator', label: 'Intestate Succession Calculator' },
        { to: '/legitimate-share-calculator', label: 'Legitime Calculator' },
        { to: '/blog/no-will-philippines', label: 'Blog: What Happens When There Is No Will?' },
      ]}
    />
  );
}
```

- [ ] **Step 4: Create illegitimate-child-inheritance landing page**

```tsx
// src/routes/landing/illegitimate-child-inheritance.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { LandingPageLayout } from '@/components/landing/LandingPageLayout';

export const illegitimateChildInheritanceRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/illegitimate-child-inheritance',
  component: IllegalitimateChildInheritancePage,
});

function IllegalitimateChildInheritancePage() {
  return (
    <LandingPageLayout
      title="Inheritance Rights of Illegitimate Children — Philippines"
      description="Understand the inheritance rights of illegitimate children under Philippine law. Calculate their share alongside legitimate heirs using the Civil Code rules."
      headline="Illegitimate Child Inheritance"
      subheadline="Calculate the inheritance share of illegitimate children under Philippine succession law."
      initialHeirs={[
        { type: 'SurvivingSpouse' },
        { type: 'LegitimateChild' },
        { type: 'IllegitimateChild' },
      ]}
      legalExplainer={
        <>
          <h2 className="text-xl font-bold font-serif">Rights of Illegitimate Children</h2>
          <p>
            Under Article 176 of the Family Code, illegitimate children are entitled to inherit from their parents. Their legitime is equal to one-half of the share of a legitimate child. This right applies in both testate and intestate succession.
          </p>
          <p>
            For an illegitimate child to inherit, filiation must be established — typically through the birth certificate, a public document, or a private handwritten instrument signed by the parent. Once filiation is proved, the illegitimate child is a compulsory heir whose legitime cannot be impaired by will.
          </p>
          <p>
            When legitimate and illegitimate children concur with a surviving spouse, the estate is divided proportionally: the spouse's share equals one legitimate child's share, each legitimate child receives a full share, and each illegitimate child receives half a share.
          </p>
        </>
      }
      relatedLinks={[
        { to: '/spouse-and-children-inheritance', label: 'Spouse & Children Inheritance' },
        { to: '/legitimate-share-calculator', label: 'Legitime Calculator' },
        { to: '/blog/illegitimate-children-rights', label: 'Blog: Rights of Illegitimate Children' },
        { to: '/intestate-succession-calculator', label: 'Intestate Succession Calculator' },
      ]}
    />
  );
}
```

- [ ] **Step 5: Create parents-inheritance-share landing page**

```tsx
// src/routes/landing/parents-inheritance-share.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { LandingPageLayout } from '@/components/landing/LandingPageLayout';

export const parentsInheritanceShareRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/parents-inheritance-share',
  component: ParentsInheritanceSharePage,
});

function ParentsInheritanceSharePage() {
  return (
    <LandingPageLayout
      title="Inheritance of Parents — Philippine Succession Law"
      description="Calculate the inheritance share of surviving parents when there are no children. Philippine Civil Code rules for ascending heirs."
      headline="Parents' Inheritance Share"
      subheadline="How the estate is distributed when the deceased's parents are the surviving heirs."
      initialHeirs={[
        { type: 'Father' },
        { type: 'Mother' },
      ]}
      legalExplainer={
        <>
          <h2 className="text-xl font-bold font-serif">When Parents Inherit</h2>
          <p>
            Under Article 985 of the Civil Code, legitimate parents and ascendants inherit only when the deceased has no legitimate children or descendants. If only parents survive (no spouse, no children), they divide the entire estate equally between them.
          </p>
          <p>
            When both a surviving spouse and the parents concur, the spouse is entitled to one-half of the estate and the parents share the other half equally. This rule applies under Article 1001 of the Civil Code.
          </p>
          <p>
            If only one parent survives, that parent inherits the full share that would have been split between both parents. Grandparents and more remote ascendants inherit only if there are no surviving parents, and the nearest degree excludes the more remote.
          </p>
        </>
      }
      relatedLinks={[
        { to: '/intestate-succession-calculator', label: 'Intestate Succession Calculator' },
        { to: '/spouse-and-children-inheritance', label: 'Spouse & Children Inheritance' },
        { to: '/blog/parents-inheritance-share', label: 'Blog: Estate Distribution When Both Parents Are Alive' },
        { to: '/legitimate-share-calculator', label: 'Legitime Calculator' },
      ]}
    />
  );
}
```

- [ ] **Step 6: Create no-will-inheritance-philippines landing page**

```tsx
// src/routes/landing/no-will-inheritance-philippines.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { LandingPageLayout } from '@/components/landing/LandingPageLayout';

export const noWillInheritanceRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/no-will-inheritance-philippines',
  component: NoWillInheritancePage,
});

function NoWillInheritancePage() {
  return (
    <LandingPageLayout
      title="Who Inherits If There Is No Will? — Philippine Law"
      description="Find out who inherits when someone dies without a will in the Philippines. Order of intestate succession under the Civil Code explained."
      headline="No Will? Here's Who Inherits"
      subheadline="The Philippine Civil Code prescribes exactly who inherits and how much when there is no will."
      initialHeirs={[
        { type: 'SurvivingSpouse' },
        { type: 'LegitimateChild' },
        { type: 'LegitimateChild' },
      ]}
      legalExplainer={
        <>
          <h2 className="text-xl font-bold font-serif">Intestate Succession Order</h2>
          <p>
            When a Filipino dies without a will, the Civil Code (Articles 960-1014) establishes a strict order of succession. First in line are legitimate children and descendants, who share the estate equally, with the surviving spouse taking a share equal to one child's.
          </p>
          <p>
            If there are no children, the legitimate parents inherit. Without parents, siblings take over. The surviving spouse concurs with each of these groups, receiving a defined portion. Only when there are no relatives within the fifth degree of consanguinity does the State inherit (Article 1011).
          </p>
          <p>
            Illegitimate children inherit alongside legitimate heirs at half the share of a legitimate child. The key principle is that nearer relatives exclude more remote ones, and the law aims to keep the estate within the family.
          </p>
        </>
      }
      relatedLinks={[
        { to: '/intestate-succession-calculator', label: 'Intestate Succession Calculator' },
        { to: '/spouse-and-children-inheritance', label: 'Spouse & Children Inheritance' },
        { to: '/parents-inheritance-share', label: 'Parents\' Inheritance Share' },
        { to: '/blog/no-will-philippines', label: 'Blog: What Happens When There Is No Will?' },
      ]}
    />
  );
}
```

- [ ] **Step 7: Verify all landing pages compile**

Run: `cd apps/inheritance/frontend && npx tsc --noEmit`

- [ ] **Step 8: Commit**

```bash
git add src/routes/landing/
git commit -m "feat(landing): add 6 SEO landing pages with QuickCalcWidget"
```

---

## Task 8: Blog Post Registry and Layout

**Files:**
- Create: `src/lib/blog-posts.ts`
- Create: `src/components/blog/BlogLayout.tsx`
- Create: `src/components/blog/BlogIndex.tsx`

- [ ] **Step 1: Create blog post metadata registry**

```ts
// src/lib/blog-posts.ts
export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;        // YYYY-MM-DD
  keywords: string[];
  ctaLink: string;     // Landing page to link to from the CTA
  ctaText: string;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: 'intestate-vs-testate',
    title: "Intestate vs Testate Succession: What's the Difference?",
    description: 'Learn the key differences between intestate and testate succession under Philippine law, including when each applies and how estates are distributed.',
    date: '2026-03-19',
    keywords: ['intestate vs testate philippines', 'succession types', 'philippine inheritance law'],
    ctaLink: '/intestate-succession-calculator',
    ctaText: 'Try the Intestate Succession Calculator',
  },
  {
    slug: 'how-to-compute-legitime',
    title: 'How to Compute the Legitime Under Philippine Law',
    description: 'Step-by-step guide to computing the legitime (compulsory share) for each type of heir under the Philippine Civil Code.',
    date: '2026-03-19',
    keywords: ['how to compute legitime', 'legitime calculation', 'compulsory heirs philippines'],
    ctaLink: '/legitimate-share-calculator',
    ctaText: 'Calculate Legitimes Now',
  },
  {
    slug: 'illegitimate-children-rights',
    title: 'Rights of Illegitimate Children in Philippine Inheritance',
    description: 'Understand the inheritance rights of illegitimate children, how their shares compare to legitimate heirs, and what proof of filiation is required.',
    date: '2026-03-19',
    keywords: ['illegitimate child inheritance rights philippines', 'filiation proof', 'inheritance share illegitimate'],
    ctaLink: '/illegitimate-child-inheritance',
    ctaText: 'Calculate Illegitimate Child Shares',
  },
  {
    slug: 'no-will-philippines',
    title: 'What Happens When There Is No Will in the Philippines?',
    description: 'A practical guide to intestate succession in the Philippines — who inherits, in what order, and how much they receive when there is no will.',
    date: '2026-03-19',
    keywords: ['no will inheritance philippines', 'intestate succession', 'who inherits without will'],
    ctaLink: '/no-will-inheritance-philippines',
    ctaText: 'See Who Inherits Without a Will',
  },
  {
    slug: 'preterition-explained',
    title: 'Preterition Explained: When a Compulsory Heir Is Left Out',
    description: 'What happens when a will omits a compulsory heir? Learn about preterition under Philippine law and its effect on testamentary dispositions.',
    date: '2026-03-19',
    keywords: ['preterition philippine law', 'compulsory heir omitted', 'will annulment philippines'],
    ctaLink: '/legitimate-share-calculator',
    ctaText: 'Calculate Compulsory Shares',
  },
  {
    slug: 'parents-inheritance-share',
    title: 'Estate Distribution When Both Parents Are Alive',
    description: 'How Philippine succession law distributes the estate when the deceased has no children and both parents survive. Covers with and without surviving spouse.',
    date: '2026-03-19',
    keywords: ['inheritance parents share philippines', 'ascending heirs', 'parents inheritance'],
    ctaLink: '/parents-inheritance-share',
    ctaText: 'Calculate Parents\' Shares',
  },
];

export function getBlogPost(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}
```

- [ ] **Step 2: Create BlogLayout component**

```tsx
// src/components/blog/BlogLayout.tsx
import { Link } from '@tanstack/react-router';
import { SEOHead } from '@/components/seo/SEOHead';
import type { BlogPostMeta } from '@/lib/blog-posts';

interface BlogLayoutProps {
  meta: BlogPostMeta;
  children: React.ReactNode;
}

export function BlogLayout({ meta, children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={meta.title} description={meta.description} />

      <div className="max-w-[65ch] mx-auto py-16 sm:py-24 px-4 sm:px-6">
        {/* Navigation */}
        <nav className="mb-8 flex gap-4 text-sm">
          <Link to="/" className="text-primary hover:underline">Home</Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/blog" className="text-primary hover:underline">Blog</Link>
        </nav>

        {/* Article Header */}
        <header className="mb-10">
          <time className="text-xs text-muted-foreground uppercase tracking-wide">
            {new Date(meta.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground mt-2 leading-tight">
            {meta.title}
          </h1>
        </header>

        {/* Article Body */}
        <article className="prose prose-slate max-w-none [&>h2]:font-serif [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>p]:leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4">
          {children}
        </article>

        {/* CTA */}
        <div className="mt-16 p-6 rounded-lg border bg-card text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Ready to compute inheritance shares?
          </p>
          <Link
            to={meta.ctaLink}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {meta.ctaText}
          </Link>
        </div>

        {/* Back to blog */}
        <div className="mt-8 pt-8 border-t">
          <Link to="/blog" className="text-sm text-primary hover:underline">
            ← All articles
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create BlogIndex component**

```tsx
// src/components/blog/BlogIndex.tsx
import { Link } from '@tanstack/react-router';
import { SEOHead } from '@/components/seo/SEOHead';
import { BLOG_POSTS } from '@/lib/blog-posts';

export function BlogIndex() {
  const sortedPosts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Blog — Philippine Inheritance Law"
        description="Articles and guides about Philippine succession law, estate distribution, and inheritance rights."
      />

      <div className="max-w-2xl mx-auto py-16 sm:py-24 px-4 sm:px-6">
        <nav className="mb-8">
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Inheritance Calculator
          </Link>
        </nav>

        <div className="text-center mb-12">
          <p className="text-[#c5a44e] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Learn
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground mb-2">
            Philippine Inheritance Law
          </h1>
          <p className="text-sm text-muted-foreground">
            Guides and explainers on succession, legitimes, and estate distribution.
          </p>
        </div>

        <div className="space-y-6">
          {sortedPosts.map(post => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-5 rounded-lg border bg-card hover:border-primary/30 transition-colors"
            >
              <time className="text-xs text-muted-foreground">
                {new Date(post.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
              <h2 className="text-lg font-semibold font-serif mt-1 text-foreground">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {post.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify it compiles**

Run: `cd apps/inheritance/frontend && npx tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add src/lib/blog-posts.ts src/components/blog/BlogLayout.tsx src/components/blog/BlogIndex.tsx
git commit -m "feat(blog): add blog post registry, layout, and index components"
```

---

## Task 9: Blog Routes and Posts (All 6)

**Files:**
- Create: `src/routes/blog/index.tsx`
- Create: `src/routes/blog/intestate-vs-testate.tsx`
- Create: `src/routes/blog/how-to-compute-legitime.tsx`
- Create: `src/routes/blog/illegitimate-children-rights.tsx`
- Create: `src/routes/blog/no-will-philippines.tsx`
- Create: `src/routes/blog/preterition-explained.tsx`
- Create: `src/routes/blog/parents-inheritance-share.tsx`

- [ ] **Step 1: Create blog index route**

```tsx
// src/routes/blog/index.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { BlogIndex } from '@/components/blog/BlogIndex';

export const blogIndexRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/blog',
  component: BlogIndex,
});
```

- [ ] **Step 2: Create intestate-vs-testate blog post**

```tsx
// src/routes/blog/intestate-vs-testate.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost } from '@/lib/blog-posts';

export const blogIntestateVsTestateRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/blog/intestate-vs-testate',
  component: IntestateVsTestatePage,
});

function IntestateVsTestatePage() {
  const meta = getBlogPost('intestate-vs-testate')!;
  return (
    <BlogLayout meta={meta}>
      <p>
        When someone passes away in the Philippines, the distribution of their estate depends fundamentally on one question: did they leave a valid will? The answer determines whether <strong>testate</strong> or <strong>intestate</strong> succession applies — and the difference can be dramatic.
      </p>

      <h2>Testate Succession</h2>
      <p>
        Testate succession occurs when the deceased left a valid last will and testament. Under the Civil Code (Articles 783-795), the will governs how the estate is distributed, subject to the reserved legitimes of compulsory heirs. The testator has freedom over the <em>free portion</em> — the part of the estate not reserved for compulsory heirs.
      </p>
      <p>
        For a will to be valid in the Philippines, it must meet specific formal requirements: it must be in writing, signed by the testator, and attested by at least three credible witnesses. A holographic will (entirely handwritten and signed by the testator) is also valid without witnesses.
      </p>

      <h2>Intestate Succession</h2>
      <p>
        Intestate succession applies when there is no will, the will is void, or the will does not dispose of all the decedent's property. The Civil Code (Articles 960-1014) prescribes a fixed order of priority among heirs, leaving no room for the decedent's preferences.
      </p>
      <p>
        The order of intestate heirs is: (1) legitimate children and descendants, (2) legitimate parents and ascendants, (3) illegitimate children and descendants, (4) the surviving spouse, (5) brothers and sisters, nephews and nieces, and (6) other collateral relatives up to the fifth degree. The State inherits only as a last resort.
      </p>

      <h2>Key Differences</h2>
      <ul>
        <li><strong>Control:</strong> Testate succession respects the decedent's wishes (within legal limits). Intestate succession follows a rigid statutory formula.</li>
        <li><strong>Free portion:</strong> In testate succession, the testator can direct the free portion to anyone. In intestate succession, everything goes to legal heirs in the prescribed order.</li>
        <li><strong>Disputes:</strong> Wills can be contested on grounds of undue influence, fraud, or formality defects. Intestate succession is more mechanical but disputes still arise over heirship and estate valuation.</li>
      </ul>

      <h2>Mixed Succession</h2>
      <p>
        It's also possible to have mixed succession — when a will exists but doesn't dispose of the entire estate. The will governs the property it covers, and intestate rules apply to the rest.
      </p>
    </BlogLayout>
  );
}
```

- [ ] **Step 3: Create how-to-compute-legitime blog post**

```tsx
// src/routes/blog/how-to-compute-legitime.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost } from '@/lib/blog-posts';

export const blogHowToComputeLegitimeRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/blog/how-to-compute-legitime',
  component: HowToComputeLegitimePage,
});

function HowToComputeLegitimePage() {
  const meta = getBlogPost('how-to-compute-legitime')!;
  return (
    <BlogLayout meta={meta}>
      <p>
        The <strong>legitime</strong> is the portion of a person's estate that Philippine law reserves for compulsory heirs. No will, donation, or other disposition can impair these shares. Understanding how to calculate the legitime is essential for anyone dealing with estate settlement.
      </p>

      <h2>Step 1: Determine the Net Estate</h2>
      <p>
        Start with the gross estate — all property owned by the decedent at the time of death. Deduct all debts, funeral expenses, and charges against the estate. Add back the value of any donations <em>inter vivos</em> (lifetime gifts) that are subject to collation. The result is the net estate from which legitimes are computed.
      </p>

      <h2>Step 2: Identify the Compulsory Heirs</h2>
      <p>
        The Civil Code designates four classes of compulsory heirs:
      </p>
      <ol>
        <li><strong>Legitimate children and descendants</strong> — always entitled to one-half of the estate as their combined legitime</li>
        <li><strong>Legitimate parents and ascendants</strong> — inherit only if there are no legitimate children or descendants</li>
        <li><strong>Surviving spouse</strong> — always a compulsory heir when married to the decedent</li>
        <li><strong>Illegitimate children</strong> — entitled to one-half of the share of a legitimate child</li>
      </ol>

      <h2>Step 3: Apply the Rules</h2>
      <p>
        The size of each heir's legitime depends on which heirs concur. Here are common scenarios:
      </p>
      <ul>
        <li><strong>One legitimate child alone:</strong> Legitime = 1/2 of the estate</li>
        <li><strong>Two or more legitimate children:</strong> Combined legitime = 1/2, divided equally</li>
        <li><strong>Legitimate children + surviving spouse:</strong> Children share 1/2 equally; spouse gets a share equal to one child's</li>
        <li><strong>Parents only (no children):</strong> Combined legitime = 1/2</li>
        <li><strong>Parents + surviving spouse:</strong> Parents get 1/4; spouse gets 1/4</li>
        <li><strong>Surviving spouse alone (no children, no parents):</strong> Legitime = 1/2</li>
      </ul>

      <h2>Step 4: Calculate the Free Portion</h2>
      <p>
        Whatever remains after allocating all legitimes is the <strong>free portion</strong>. In testate succession, the testator may dispose of this freely. In intestate succession, the free portion is distributed according to the same intestate rules.
      </p>
    </BlogLayout>
  );
}
```

- [ ] **Step 4: Create illegitimate-children-rights blog post**

```tsx
// src/routes/blog/illegitimate-children-rights.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost } from '@/lib/blog-posts';

export const blogIllegitimateChildrenRightsRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/blog/illegitimate-children-rights',
  component: IllegitimateChildrenRightsPage,
});

function IllegitimateChildrenRightsPage() {
  const meta = getBlogPost('illegitimate-children-rights')!;
  return (
    <BlogLayout meta={meta}>
      <p>
        Philippine law recognizes the inheritance rights of illegitimate children, though their shares are smaller than those of legitimate heirs. Here's what you need to know about how the law treats illegitimate children in succession.
      </p>

      <h2>The Basic Rule</h2>
      <p>
        Under Article 176 of the Family Code, an illegitimate child is entitled to a legitime equal to <strong>one-half</strong> of the legitime of a legitimate child. This applies in both testate and intestate succession. The illegitimate child is a compulsory heir whose share cannot be taken away by will.
      </p>

      <h2>Proving Filiation</h2>
      <p>
        Before an illegitimate child can inherit, <strong>filiation</strong> must be established — that is, the parent-child relationship must be legally proven. The most common forms of proof are:
      </p>
      <ul>
        <li>The birth certificate (if the parent is named)</li>
        <li>A public document or a final judgment acknowledging the child</li>
        <li>A private handwritten instrument signed by the parent</li>
        <li>Open and continuous possession of the status of an illegitimate child</li>
      </ul>

      <h2>How Shares Are Computed</h2>
      <p>
        When legitimate and illegitimate children concur, the calculation follows a proportional formula. For example, if a decedent leaves 1 legitimate child and 1 illegitimate child, the legitimate child's share is twice the illegitimate child's share. If the net estate is ₱3,000,000, the legitimate child receives ₱2,000,000 and the illegitimate child receives ₱1,000,000.
      </p>

      <h2>Concurring with Other Heirs</h2>
      <p>
        Illegitimate children can inherit alongside the surviving spouse and legitimate children. The surviving spouse's share is equal to one legitimate child's share. All these shares come from the legitime portion first, with any remainder going to the free portion.
      </p>
    </BlogLayout>
  );
}
```

- [ ] **Step 5: Create no-will-philippines blog post**

```tsx
// src/routes/blog/no-will-philippines.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost } from '@/lib/blog-posts';

export const blogNoWillRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/blog/no-will-philippines',
  component: NoWillPhilippinesPage,
});

function NoWillPhilippinesPage() {
  const meta = getBlogPost('no-will-philippines')!;
  return (
    <BlogLayout meta={meta}>
      <p>
        The majority of Filipinos die without a will. When this happens, the law — not the decedent — decides who gets what. This guide explains the rules of intestate succession and the order of priority among heirs.
      </p>

      <h2>Who Inherits First?</h2>
      <p>
        The Civil Code establishes a clear hierarchy. The first to inherit are the <strong>legitimate children and descendants</strong> of the decedent. They share the estate equally, with the surviving spouse receiving a share equal to one child's.
      </p>
      <p>
        If there are no children, the <strong>legitimate parents and ascendants</strong> inherit. The surviving spouse, if any, gets half the estate and the parents share the other half. If only one parent survives, they get the full parental share.
      </p>

      <h2>The Role of the Surviving Spouse</h2>
      <p>
        The surviving spouse is unique — they concur with almost every other class of heir. With children, the spouse gets one child's share. With parents, the spouse gets half. Without any other compulsory heir, the spouse inherits everything.
      </p>

      <h2>Siblings and Collateral Relatives</h2>
      <p>
        If there are no descendants, ascendants, or spouse, the estate goes to <strong>brothers and sisters</strong> (and their children by representation). Full-blood siblings take double the share of half-blood siblings. Other collateral relatives up to the fifth degree inherit only if there are no closer relatives.
      </p>

      <h2>When the State Inherits</h2>
      <p>
        Under Article 1011, if the decedent has no relatives within the fifth degree, the estate goes to the municipality or city where the decedent lived, or to the national government if the decedent lived abroad.
      </p>
    </BlogLayout>
  );
}
```

- [ ] **Step 6: Create preterition-explained blog post**

```tsx
// src/routes/blog/preterition-explained.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost } from '@/lib/blog-posts';

export const blogPreteritionRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/blog/preterition-explained',
  component: PreteritionExplainedPage,
});

function PreteritionExplainedPage() {
  const meta = getBlogPost('preterition-explained')!;
  return (
    <BlogLayout meta={meta}>
      <p>
        <strong>Preterition</strong> occurs when a compulsory heir is completely omitted from the will — not just given a smaller share, but left out entirely. Under Philippine law, this has serious consequences for the entire will.
      </p>

      <h2>What the Law Says</h2>
      <p>
        Article 854 of the Civil Code provides: "The preterition or omission of one, some, or all of the compulsory heirs in the direct line, whether living at the time of the execution of the will or born after the death of the testator, shall annul the institution of heir; but the devises and legacies shall be valid insofar as they are not inofficious."
      </p>

      <h2>The Effect of Preterition</h2>
      <p>
        The key consequence is that preterition <strong>annuls the institution of heir</strong>. This means the provisions in the will that designate who gets the bulk of the estate are voided. However, specific bequests (legacies and devises) remain valid as long as they don't impair the legitimes.
      </p>
      <p>
        In practice, when preterition is found, the estate is distributed as if the institution of heir never existed. The compulsory heirs receive their legitimes, and the free portion is distributed according to intestate rules.
      </p>

      <h2>Who Can Be Preterited?</h2>
      <p>
        Preterition applies only to compulsory heirs <strong>in the direct line</strong> — legitimate children, legitimate parents, and illegitimate children. The surviving spouse cannot be preterited; if the spouse is omitted from the will, they simply receive their legitime without annulling the institution of heir.
      </p>

      <h2>Preterition vs. Disinheritance</h2>
      <p>
        Disinheritance is an intentional exclusion of a compulsory heir for a legal cause stated in the will. Preterition is an omission — the heir is simply not mentioned. The distinction matters: invalid disinheritance merely annuls the disinheritance clause, while preterition annuls the entire institution of heir.
      </p>
    </BlogLayout>
  );
}
```

- [ ] **Step 7: Create parents-inheritance-share blog post**

```tsx
// src/routes/blog/parents-inheritance-share.tsx
import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost } from '@/lib/blog-posts';

export const blogParentsInheritanceRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/blog/parents-inheritance-share',
  component: ParentsInheritanceSharePage,
});

function ParentsInheritanceSharePage() {
  const meta = getBlogPost('parents-inheritance-share')!;
  return (
    <BlogLayout meta={meta}>
      <p>
        When a person dies without children, their <strong>parents</strong> become the primary heirs alongside the surviving spouse. This article explains how the estate is divided when both parents are alive.
      </p>

      <h2>Parents as Compulsory Heirs</h2>
      <p>
        Under the Civil Code, legitimate parents are compulsory heirs of the second order — they inherit only when there are no legitimate children or descendants. When both parents survive and there is no surviving spouse, they divide the entire estate equally between them.
      </p>

      <h2>With a Surviving Spouse</h2>
      <p>
        When both parents and a surviving spouse concur, the estate is split as follows under Article 1001: the surviving spouse receives <strong>one-half</strong> of the estate, and the parents share the remaining <strong>one-half</strong> equally (one-quarter each).
      </p>

      <h2>Only One Parent Survives</h2>
      <p>
        If only one parent is alive, that parent takes the full parental share. With a spouse, the surviving parent gets one-half and the spouse gets one-half. Without a spouse, the single surviving parent inherits everything.
      </p>

      <h2>Grandparents and Ascendants</h2>
      <p>
        If neither parent is alive, the estate passes to the grandparents or more remote ascendants. The nearest degree of ascendant always excludes the more remote. Between the paternal and maternal lines, the estate is divided equally.
      </p>
    </BlogLayout>
  );
}
```

- [ ] **Step 8: Verify all blog routes compile**

Run: `cd apps/inheritance/frontend && npx tsc --noEmit`

- [ ] **Step 9: Commit**

```bash
git add src/routes/blog/
git commit -m "feat(blog): add blog index route and 6 initial blog posts"
```

---

## Task 10: Wire Routes Into Router and Update Public Route Detection

**Files:**
- Modify: `src/router.ts`
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Update __root.tsx to detect new public routes**

In `src/routes/__root.tsx`, update `RootLayout` to handle three layout modes:
1. **Auth routes** (`/auth`, `/share/`, `/invite/`) — centered layout (existing behavior)
2. **Content routes** (`/blog`, landing pages) — full-width minimal layout (no centering)
3. **Authenticated routes** — AppLayout with sidebar (existing behavior)

**IMPORTANT:** The current public route wrapper uses `flex items-center justify-center` which vertically/horizontally centers content. This is correct for auth forms but would break full-page landing pages and blog posts. Content routes need the `MinimalLayout` without centering.

```tsx
// Change RootLayout to:
function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthRoute =
    pathname.startsWith('/auth') ||
    pathname.startsWith('/share/') ||
    pathname.startsWith('/invite/');
  const isContentRoute =
    pathname.startsWith('/blog') ||
    pathname === '/intestate-succession-calculator' ||
    pathname === '/legitimate-share-calculator' ||
    pathname === '/spouse-and-children-inheritance' ||
    pathname === '/illegitimate-child-inheritance' ||
    pathname === '/parents-inheritance-share' ||
    pathname === '/no-will-inheritance-philippines';

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Outlet />
      </div>
    );
  }
  if (isContentRoute) {
    return (
      <main className="min-h-screen bg-background">
        <Outlet />
      </main>
    );
  }
  return <AppLayout><Outlet /></AppLayout>;
}
```

- [ ] **Step 2: Update router.ts to register all new routes**

Add imports and register under `publicRootRoute`:

```ts
// Add imports:
import { intestateSuccessionCalculatorRoute } from './routes/landing/intestate-succession-calculator';
import { legitimateShareCalculatorRoute } from './routes/landing/legitimate-share-calculator';
import { spouseAndChildrenInheritanceRoute } from './routes/landing/spouse-and-children-inheritance';
import { illegitimateChildInheritanceRoute } from './routes/landing/illegitimate-child-inheritance';
import { parentsInheritanceShareRoute } from './routes/landing/parents-inheritance-share';
import { noWillInheritanceRoute } from './routes/landing/no-will-inheritance-philippines';
import { blogIndexRoute } from './routes/blog/index';
import { blogIntestateVsTestateRoute } from './routes/blog/intestate-vs-testate';
import { blogHowToComputeLegitimeRoute } from './routes/blog/how-to-compute-legitime';
import { blogIllegitimateChildrenRightsRoute } from './routes/blog/illegitimate-children-rights';
import { blogNoWillRoute } from './routes/blog/no-will-philippines';
import { blogPreteritionRoute } from './routes/blog/preterition-explained';
import { blogParentsInheritanceRoute } from './routes/blog/parents-inheritance-share';

// Update the publicRootRoute children:
publicRootRoute.addChildren([
  authRoute,
  authCallbackRoute,
  authResetRoute,
  authResetConfirmRoute,
  shareTokenRoute,
  onboardingRoute,
  inviteTokenRoute,
  // Landing pages
  intestateSuccessionCalculatorRoute,
  legitimateShareCalculatorRoute,
  spouseAndChildrenInheritanceRoute,
  illegitimateChildInheritanceRoute,
  parentsInheritanceShareRoute,
  noWillInheritanceRoute,
  // Blog
  blogIndexRoute,
  blogIntestateVsTestateRoute,
  blogHowToComputeLegitimeRoute,
  blogIllegitimateChildrenRightsRoute,
  blogNoWillRoute,
  blogPreteritionRoute,
  blogParentsInheritanceRoute,
]),
```

- [ ] **Step 3: Verify the full app compiles**

Run: `cd apps/inheritance/frontend && npx tsc --noEmit`

- [ ] **Step 4: Verify the app builds**

Run: `cd apps/inheritance/frontend && npm run build`
Expected: Build succeeds, no errors

- [ ] **Step 5: Commit**

```bash
git add src/router.ts src/routes/__root.tsx
git commit -m "feat(routes): wire landing pages and blog into router"
```

---

## Task 11: Wire GA4 Events Into Existing Code

**Files:**
- Modify: `src/components/quick-calc/QuickCalcWidget.tsx` (add `trackQuickCalcUsed`)
- Modify: `src/routes/auth.tsx` or auth-related route (add `trackSignupStarted`)

- [ ] **Step 1: Add trackQuickCalcUsed to QuickCalcWidget**

In `QuickCalcWidget.tsx`, import and call after successful calculation:

```tsx
import { trackQuickCalcUsed } from '@/lib/analytics';

// Inside the calculate callback, after setOutput(result):
setOutput(result);
trackQuickCalcUsed(heirs.length);
sessionStorage.setItem(SESSION_KEY, 'true');
```

- [ ] **Step 2: Verify it compiles**

Run: `cd apps/inheritance/frontend && npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/quick-calc/QuickCalcWidget.tsx
git commit -m "feat(analytics): fire quick_calc_used GA4 event on calculation"
```

---

## Task 12: Final Build Verification

- [ ] **Step 1: Full build**

Run: `cd apps/inheritance/frontend && npm run build`
Expected: Clean build, no errors

- [ ] **Step 2: Check sitemap was generated**

Run: `cat apps/inheritance/frontend/dist/sitemap.xml | head -20`
Expected: Valid XML with all 14 URLs

- [ ] **Step 3: Check robots.txt was copied**

Run: `cat apps/inheritance/frontend/dist/robots.txt`
Expected: Contains `User-agent: *` and sitemap URL

- [ ] **Step 4: Run tests**

Run: `cd apps/inheritance/frontend && npm test`
Expected: All tests pass

- [ ] **Step 5: Final commit if any remaining changes**

```bash
git add -A
git commit -m "chore: final build verification for SEO content growth engine"
```
