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
        {/* Navigation */}
        <nav className="mb-8 flex items-center justify-between">
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Inheritance Calculator
          </Link>
          <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </a>
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
        <article className="article-body mb-16">
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
                <a href={link.to} className="text-primary hover:underline text-sm">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
