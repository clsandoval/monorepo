import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';


type BlogCategory = 'Product' | 'Engineering' | 'Guides' | 'Company';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  updatedAt?: string;
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
    content: `
Discord is where decisions happen.

For a growing number of teams — startups, agencies, open-source projects, gaming communities — Discord isn't just a chat app. It's the async HQ. Product discussions, deployment alerts, customer support, sprint reviews — they all happen in Discord.

But the AI tools that could supercharge those conversations have been living in separate tabs. ChatGPT here, GitHub there, Toggl over there. Context switching kills momentum.

**That's what Daimon solves.**

Daimon is a Discord bot powered by Claude that brings 50+ tools into every conversation. Ask it to pull your Toggl time report and post it as a summary. Ask it to open a GitHub issue from a Discord thread. Ask it to check your Fly.io deployment status. It understands context, reasons across tools, and responds in plain English.

**Bring Your Own Keys**

We built Daimon BYOK from day one. Your Anthropic API key goes directly to Anthropic — we never proxy your conversations. Your Discord bot token is encrypted at rest using Supabase Vault. Your service credentials (GitHub, Linear, Toggl) are never exposed to our application logic. You own your data.

**Two minutes from signup to live bot**

1. Sign up at daimon.ai
2. Paste your Anthropic API key
3. Paste your Discord bot token + server ID
4. Your bot is online

No YAML. No Docker. No infra. We handle the multi-tenant orchestration; you get the result.

**Start free today**

Daimon is free to start. The free tier connects one Discord server and gives you all 50+ tools. Starter ($9/month) and Pro ($29/month) plans are available for teams that need more.
    `,
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
    content: `
When we say "Bring Your Own Keys," we mean it literally: your Anthropic API key, stored encrypted in Supabase Vault, sent directly to Anthropic's API on every request. We never see your conversations. We never proxy your Claude calls. We never have access to your AI spend.

**Why this matters**

Most SaaS AI tools act as a proxy between you and the LLM. Your messages go: You → Their servers → OpenAI/Anthropic → Their servers → You. That means:

- Your conversations are logged on their infrastructure
- Their pricing includes a markup on your AI spend
- If they get breached, your conversation history is exposed
- If they shut down, your AI assistant goes dark

With BYOK, the architecture is: You → Daimon (bot logic only) → Anthropic. Daimon handles the orchestration — tool selection, multi-step reasoning, Discord formatting — but the actual Claude API call goes directly from the bot to Anthropic using your key.

**What we do store**

We're transparent about what we keep:

- Your API key (AES-256 encrypted in Supabase Vault, never logged)
- Your Discord bot token (encrypted, used only to maintain your bot's connection)
- Tool outputs (stored in tenant_tool_calls table, 90-day retention, RLS-isolated to your tenant)
- Message metadata (stored in tenant_messages, 90-day retention, RLS-isolated to your tenant)

We do not store the content of your Claude conversations. The LLM inference happens in memory.

**The tradeoff**

BYOK means you manage your own Anthropic billing. If you run a lot of queries, your API bill will reflect that — we can't subsidize it. But you get something in return: complete cost transparency, no markup, and a direct relationship with Anthropic.

We think that tradeoff is worth it. Your AI stack should belong to you.
    `,
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
    content: `
This sounds hyperbolic. It isn't.

Discord started as a gaming chat platform. But somewhere between 2020 and 2023, it became something else: the async HQ for a generation of internet-native teams. Open-source projects. Web3 communities. Indie studios. Startups. Creator collectives. They all chose Discord — not Slack, not Teams — as their operating environment.

**Why Discord, not Slack?**

A few reasons:

- **Free.** Slack's free tier limits message history. Discord doesn't.
- **Voice + text native.** Audio channels are always on, no scheduling friction.
- **Community-grade.** Server structure (channels → categories → roles) scales from 3 people to 100,000.
- **Bot ecosystem.** Discord bots are a first-class feature with a mature API.

The result: Discord is where 150+ million monthly active users hang out — and increasingly, where they work.

**The AI gap**

But Discord's bot ecosystem is frozen in 2019 thinking. Most Discord bots do simple things: moderation, music, polls. They don't reason. They don't have access to your project's data. They can't answer "what did we ship last week?" or "which Toggl client is behind on hours?"

That's the gap we're filling. Daimon treats Discord as an operating system — a surface for multi-step AI reasoning connected to real data. Not a novelty bot. An operating layer.

**What this looks like in practice**

In a Discord server running Daimon:

- The engineering channel can query GitHub PRs and Fly.io deployments
- The ops channel can pull Toggl time reports and Google Analytics metrics
- The product channel can create Linear issues from discussion threads
- The exec channel can get synthesized weekly summaries from all of the above

One assistant. Fifty tools. The conversation layer your team already lives in.

**The bet**

We're betting that async text + AI is the future of team productivity — and that Discord is the platform where this clicks first. If we're right, every Discord community eventually wants an AI that can reason about their data. Daimon is built for that moment.
    `,
  },
];

const CATEGORY_COLORS: Record<BlogCategory, 'info' | 'success' | 'neutral' | 'warning'> = {
  Product: 'info',
  Engineering: 'success',
  Guides: 'neutral',
  Company: 'warning',
};

function getAllPosts(): BlogPost[] {
  return POSTS;
}

function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Post Not Found — Daimon' };

  const title = `${post.seo.metaTitle || post.title} — Daimon`;
  return {
    title,
    description: post.seo.metaDescription,
    authors: [{ name: post.author.name }],
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.seo.metaDescription,
      images: [{ url: post.seo.ogImageUrl || 'https://daimon.ai/og-blog-default.png' }],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    alternates: {
      canonical: `https://daimon.ai/blog/${post.slug}`,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function renderContent(content: string) {
  return content
    .trim()
    .split('\n')
    .map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
        const text = trimmed.slice(2, -2);
        return (
          <h2 key={i} className="font-archivo font-bold text-foreground text-[28px] mt-12 mb-4">
            {text}
          </h2>
        );
      }
      if (trimmed.startsWith('- ')) {
        return (
          <li key={i} className="mb-2">
            {trimmed.slice(2).split('**').map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="font-bold text-foreground">{part}</strong> : part
            )}
          </li>
        );
      }
      if (/^\d+\. /.test(trimmed)) {
        return (
          <li key={i} className="mb-2">
            {trimmed.replace(/^\d+\. /, '')}
          </li>
        );
      }
      return (
        <p key={i} className="mb-5 text-[17px] text-muted-foreground leading-[1.8]">
          {trimmed.split('**').map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="font-bold text-foreground">{part}</strong> : part
          )}
        </p>
      );
    });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const relatedPosts = getAllPosts()
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: { '@type': 'Person', name: post.author.name },
    publisher: {
      '@type': 'Organization',
      name: 'Daimon',
      logo: { '@type': 'ImageObject', url: 'https://daimon.ai/logo.png' },
    },
    image: post.coverImageUrl || 'https://daimon.ai/og-blog-default.png',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://daimon.ai/blog/${post.slug}`,
    },
  };

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <main className="max-w-3xl mx-auto px-8 pt-20 pb-24">
        {/* Breadcrumb */}
        <nav className="mb-6 text-muted-foreground text-sm">
          <Link href="/blog" className="hover:underline decoration-primary">
            Blog
          </Link>
          <span className="mx-2">→</span>
          <Link
            href={`/blog?category=${post.category}`}
            className="hover:underline decoration-primary"
          >
            {post.category}
          </Link>
        </nav>

        {/* Post header */}
        <h1
          className="font-archivo font-bold text-foreground text-[clamp(30px,4vw,44px)] max-w-3xl"
        >
          {post.title}
        </h1>

        <div className="mt-4">
          <Badge variant={CATEGORY_COLORS[post.category]} label={post.category} />
        </div>

        <div className="mt-4 flex items-center gap-3 text-muted-foreground text-[15px]">
          <div
            className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          >
            {post.author.name[0]}
          </div>
          <span className="font-medium text-foreground">{post.author.name}</span>
          <span className="text-muted-foreground">·</span>
          <time dateTime={post.publishedAt} className="text-muted-foreground">
            {formatDate(post.publishedAt)}
          </time>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{post.readTimeMinutes} min read</span>
        </div>

        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={`${post.title} — cover image`}
            className="w-full mt-8 rounded-2xl object-cover max-h-[480px]"
          />
        )}

        {/* Post body */}
        <div className="mt-10 max-w-2xl mx-auto">
          {renderContent(post.content)}
        </div>

        {/* Author card */}
        <aside
          aria-label="About the author"
          className="mt-12 flex items-center gap-6 rounded-xl border border-border p-6 bg-background"
        >
          <div
            className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          >
            {post.author.name[0]}
          </div>
          <div>
            <div className="font-archivo font-bold text-foreground text-lg">
              {post.author.name}
            </div>
            <div className="text-muted-foreground text-sm">
              {post.author.role}
            </div>
          </div>
        </aside>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section aria-label="Related posts" className="mt-16">
            <h2
              className="font-archivo font-bold text-foreground mb-6 text-2xl"
            >
              More from the blog
            </h2>
            <ul
              role="list"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {relatedPosts.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={`/blog/${related.slug}`}
                    className="block rounded-xl overflow-hidden border border-border bg-white transition-all duration-200 hover:-translate-y-0.5"
                    aria-label={related.title}
                  >
                    <article aria-labelledby={`related-${related.slug}`}>
                      <div
                        className="w-full h-32 bg-foreground"
                      />
                      <div className="p-4">
                        <Badge variant={CATEGORY_COLORS[related.category]} label={related.category} />
                        <h3
                          id={`related-${related.slug}`}
                          className="mt-2 font-archivo font-bold text-foreground line-clamp-2 text-base"
                        >
                          {related.title}
                        </h3>
                      </div>
                    </article>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA section */}
        <div
          className="mt-16 rounded-2xl p-10 text-center bg-foreground"
        >
          <h2
            className="font-archivo font-bold text-white text-[28px]"
          >
            Ready to put AI in your Discord?
          </h2>
          <p className="mt-3 text-white/70 text-base">
            Start free — no credit card required.
          </p>
          <div className="mt-6">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 rounded-none font-semibold text-sm bg-primary text-foreground hover:opacity-90 transition-opacity"
            >
              Get started free
            </Link>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
