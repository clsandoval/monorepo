import { Link } from '@tanstack/react-router';
import { SEOHead } from '@/components/seo/SEOHead';
import type { BlogPostMeta } from '@/lib/blog-posts';

interface BlogLayoutProps {
  meta: BlogPostMeta;
  children: React.ReactNode;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BlogLayout({ meta, children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={meta.title} description={meta.description} />

      <div className="max-w-[65ch] mx-auto py-16 sm:py-24 px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <a href="/blog" className="hover:text-foreground transition-colors">
            Blog
          </a>
          <span>/</span>
          <span className="text-foreground truncate">{meta.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-10">
          <p className="text-[#c5a44e] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Philippine Succession Law
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-foreground mb-4 leading-[1.15]">
            {meta.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(meta.date)}
          </p>
        </header>

        {/* Article body */}
        <article className="prose prose-slate max-w-none leading-relaxed
          prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
          prose-p:text-base prose-p:leading-relaxed prose-p:mb-5
          mb-16
        ">
          {children}
        </article>

        {/* CTA Card */}
        <div className="rounded-2xl border bg-muted/40 p-8 mb-10 text-center">
          <p className="text-sm text-muted-foreground mb-3">Ready to calculate?</p>
          <a
            href={meta.ctaLink}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {meta.ctaText}
          </a>
        </div>

        {/* Back to blog */}
        <div className="border-t pt-8">
          <a href="/blog" className="text-sm text-primary hover:underline">
            ← Back to all articles
          </a>
        </div>
      </div>
    </div>
  );
}
