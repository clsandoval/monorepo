import { Link } from '@tanstack/react-router';
import { SEOHead } from '@/components/seo/SEOHead';
import { BLOG_POSTS } from '@/lib/blog-posts';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const sortedPosts = [...BLOG_POSTS].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export function BlogIndex() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Philippine Inheritance Law Blog"
        description="Articles and guides on Philippine succession law — intestate succession, legitimes, compulsory heirs, and more."
      />

      <div className="max-w-2xl mx-auto py-16 sm:py-24 px-4 sm:px-6">
        {/* Nav back to home */}
        <nav className="mb-8">
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Inheritance Calculator
          </Link>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <p className="text-[#c5a44e] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Learn
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-serif text-foreground leading-[1.1]">
            Philippine Inheritance Law
          </h1>
        </div>

        {/* Post cards */}
        <div className="space-y-6">
          {sortedPosts.map(post => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group rounded-xl border p-6 hover:border-primary/50 transition-colors"
            >
              <p className="text-xs text-muted-foreground mb-2">{formatDate(post.date)}</p>
              <h2 className="text-lg font-semibold font-serif text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {post.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
