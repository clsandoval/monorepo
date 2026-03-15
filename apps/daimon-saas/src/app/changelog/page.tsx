import { Metadata } from 'next';
import { PublicLayout } from '@/components/layout/public-layout';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Changelog — Daimon',
  description: 'What\'s new in Daimon — feature releases, improvements, and bug fixes.',
  openGraph: {
    title: 'Changelog — Daimon',
    description: 'What\'s new in Daimon.',
    images: [{ url: 'https://daimon.ai/og-changelog.png' }],
  },
  alternates: {
    canonical: 'https://daimon.ai/changelog',
  },
};

type CategoryTag = 'New Feature' | 'Improvement' | 'Bug Fix' | 'Security' | 'Deprecated';

interface ChangelogEntry {
  date: string;
  version: string;
  title: string;
  categories: CategoryTag[];
  changes: string[];
}

const CATEGORY_STYLES: Record<CategoryTag, string> = {
  'New Feature': 'bg-primary text-primary-foreground',
  'Improvement': 'bg-blue-50 text-blue-700',
  'Bug Fix': 'bg-red-50 text-red-700',
  'Security': 'bg-yellow-50 text-yellow-700',
  'Deprecated': 'bg-muted text-muted-foreground',
};

const entries: ChangelogEntry[] = [
  {
    date: '2026-03-13',
    version: 'v1.0.0',
    title: 'Daimon launches in open beta',
    categories: ['New Feature'],
    changes: [
      'Self-serve signup: create your Daimon tenant in under 2 minutes',
      'Bring Your Own Keys: paste your Anthropic API key and Discord bot token — no sharing required',
      '50+ tools out of the box: Discord management, GitHub, Linear, Toggl, Google Analytics, Fly.io, LinkedIn, and more',
      'Free tier: try Daimon at no cost with 1 Discord server',
      'Starter tier ($9/month): production-ready with priority response times and team support',
      'Pro tier ($29/month): unlimited Discord servers, advanced analytics, dedicated support',
      'Supabase-powered data isolation: every tenant\'s data is logically isolated behind RLS policies',
      'OAuth integrations: connect GitHub, Google, and Linear with one click',
      'API key integrations: connect Toggl and other services via API key paste',
      'Real-time bot status: dashboard shows live heartbeat and connection health',
    ],
  },
];

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ChangelogPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="font-archivo font-bold text-foreground text-[clamp(28px,4vw,40px)]">
            Changelog
          </h1>
          <p className="mt-3 text-lg font-inter font-normal text-muted-foreground">
            What&apos;s new in Daimon
          </p>
        </div>

        {/* Release list */}
        <div>
          {entries.map((entry) => (
            <article
              key={entry.version}
              className="mb-14 border-l-[3px] border-l-primary pl-6"
            >
              {/* Date + version badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <time
                  dateTime={entry.date}
                  className="text-sm font-inter font-medium text-muted-foreground"
                >
                  {formatDate(entry.date)}
                </time>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-semibold bg-muted text-foreground border border-border">
                  {entry.version}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-archivo font-bold text-foreground text-2xl mt-2 mb-4">
                {entry.title}
              </h2>

              {/* Category tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {entry.categories.map((cat) => (
                  <span
                    key={cat}
                    className={cn(
                      'text-sm font-inter font-semibold px-2 py-0.5 rounded',
                      CATEGORY_STYLES[cat]
                    )}
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Changes list */}
              <ul className="list-none p-0 m-0">
                {entry.changes.map((change, i) => (
                  <li
                    key={i}
                    className="relative text-[15px] font-inter font-normal text-foreground/85 leading-relaxed py-2 pl-5"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-2 text-primary font-bold"
                    >
                      →
                    </span>
                    {change}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
