import { Metadata } from 'next';
import Link from 'next/link';
import { PenLine } from 'lucide-react';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Blog — Daimon',
  description: 'Insights on AI-powered workflows, Discord automation, and building with Claude.',
  openGraph: {
    title: 'Daimon Blog',
    description: 'Insights on AI-powered workflows, Discord automation, and building with Claude.',
    images: [{ url: 'https://daimon.ai/og-blog.png' }],
  },
  alternates: {
    canonical: 'https://daimon.ai/blog',
  },
};

type BlogCategory = 'Product' | 'Engineering' | 'Guides' | 'Company';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTimeMinutes: number;
  category: BlogCategory;
  coverImageUrl?: string;
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  tags: string[];
  seo: {
    metaTitle?: string;
    metaDescription: string;
    ogImageUrl?: string;
  };
}

const POSTS: BlogPost[] = [
  {
    slug: 'introducing-daimon',
    title: 'Introducing Daimon: Bring Your Own Keys, Deploy in Two Minutes',
    excerpt:
      "Today we're opening Daimon to everyone. Bring your Anthropic API key and Discord bot token — your AI assistant is ready in under two minutes.",
    publishedAt: '2026-03-13',
    readTimeMinutes: 4,
    category: 'Product',
    tags: ['launch', 'product', 'discord', 'claude'],
    author: { name: 'Founder', role: 'Founder' },
    seo: {
      metaDescription:
        "Today we're opening Daimon to everyone. Bring your Anthropic API key and Discord bot token — your AI assistant is ready in under two minutes.",
    },
  },
  {
    slug: 'byok-why-it-matters',
    title: 'Why BYOK Matters More Than You Think',
    excerpt:
      "Bring Your Own Keys isn't just a feature. It's a philosophy about who controls your AI stack — and why it should be you.",
    publishedAt: '2026-03-13',
    readTimeMinutes: 5,
    category: 'Engineering',
    tags: ['byok', 'security', 'anthropic', 'api-keys'],
    author: { name: 'Founder', role: 'Founder' },
    seo: {
      metaDescription:
        "Bring Your Own Keys isn't just a feature. It's a philosophy about who controls your AI stack — and why it should be you.",
    },
  },
  {
    slug: 'discord-as-operating-system',
    title: 'Discord as an Operating System',
    excerpt:
      'Why we think Discord is the most underrated productivity platform of the decade — and what that means for AI.',
    publishedAt: '2026-03-13',
    readTimeMinutes: 6,
    category: 'Company',
    tags: ['discord', 'productivity', 'ai', 'async-work'],
    author: { name: 'Founder', role: 'Founder' },
    seo: {
      metaDescription:
        'Why we think Discord is the most underrated productivity platform of the decade — and what that means for AI.',
    },
  },
];

const CATEGORY_COLORS: Record<BlogCategory, 'info' | 'success' | 'neutral' | 'warning'> = {
  Product: 'info',
  Engineering: 'success',
  Guides: 'neutral',
  Company: 'warning',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <article
      aria-labelledby={`featured-${post.slug}`}
      className="flex flex-col md:flex-row rounded-2xl overflow-hidden border"
      style={{ borderColor: 'rgba(12,31,64,0.08)' }}
    >
      {/* Image area */}
      <div
        className="md:w-[480px] md:h-[320px] h-48 flex-shrink-0"
        style={{
          background: post.coverImageUrl
            ? undefined
            : '#F7F7F7',
        }}
      >
        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={`${post.title} — cover image`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Text area */}
      <div className="flex flex-col justify-center p-10">
        <Badge variant={CATEGORY_COLORS[post.category]} label={post.category} />
        <h2
          id={`featured-${post.slug}`}
          className="mt-3 font-archivo font-bold text-[#0C1F40]"
          style={{ fontSize: '28px', maxWidth: '520px' }}
        >
          {post.title}
        </h2>
        <p
          className="mt-3 text-[#4A5568]"
          style={{ fontSize: '16px', lineHeight: '1.7' }}
        >
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-3 text-[#718096]" style={{ fontSize: '14px' }}>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span>·</span>
          <span>{post.readTimeMinutes} min read</span>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-5 font-semibold text-[15px] text-[#0C1F40] hover:underline"
          style={{ textDecorationColor: '#B4E7DD' }}
          aria-label={post.title}
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <li>
      <Link
        href={`/blog/${post.slug}`}
        className="block rounded-xl overflow-hidden border bg-white transition-all duration-200 hover:-translate-y-0.5"
        style={{
          borderColor: 'rgba(12,31,64,0.08)',
        }}
        aria-label={post.title}
      >
        <article aria-labelledby={`post-${post.slug}`}>
          {/* Cover image / gradient fallback */}
          <div
            className="w-full h-[200px] object-cover"
            style={{
              background: post.coverImageUrl
                ? undefined
                : 'linear-gradient(135deg, #0C1F40 0%, #1a3a6e 100%)',
            }}
          >
            {post.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImageUrl}
                alt={`${post.title} — cover image`}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Card body */}
          <div className="p-5">
            <div className="mb-2">
              <Badge variant={CATEGORY_COLORS[post.category]} label={post.category} />
            </div>
            <h2
              id={`post-${post.slug}`}
              className="font-archivo font-bold text-[#0C1F40] line-clamp-2"
              style={{ fontSize: '20px' }}
            >
              {post.title}
            </h2>
            <p
              className="mt-2 text-[#4A5568] line-clamp-3"
              style={{ fontSize: '14px', lineHeight: '1.6' }}
            >
              {post.excerpt}
            </p>
            <div
              className="mt-3 flex items-center justify-between text-[#718096]"
              style={{ fontSize: '14px' }}
            >
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span>{post.readTimeMinutes} min read</span>
            </div>
          </div>
        </article>
      </Link>
    </li>
  );
}

export default function BlogPage() {
  const [featured, ...rest] = POSTS;

  return (
    <PublicLayout>
      <main className="max-w-7xl mx-auto px-8">
        {/* Page header */}
        <div className="pt-20 pb-12">
          <h1 className="font-archivo font-bold text-[#0C1F40]" style={{ fontSize: '44px' }}>
            Blog
          </h1>
          <p className="mt-2 text-[#4A5568]" style={{ fontSize: '18px' }}>
            Insights on AI-powered workflows, Discord automation, and building with Claude.
          </p>
        </div>

        {/* Featured post */}
        {featured ? (
          <FeaturedPostCard post={featured} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PenLine className="w-12 h-12 text-foreground/30 mb-4" />
            <h2 className="font-archivo font-bold text-[#0C1F40] text-xl">No posts yet</h2>
            <p className="mt-2 text-[#4A5568]">
              We&apos;re working on our first article. Check back soon.
            </p>
          </div>
        )}

        {/* Post grid */}
        {rest.length > 0 && (
          <ul
            role="list"
            className="mt-12 mb-20 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </ul>
        )}
      </main>
    </PublicLayout>
  );
}
