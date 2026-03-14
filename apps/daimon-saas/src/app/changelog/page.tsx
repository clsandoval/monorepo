import { Metadata } from 'next';
import { PublicLayout } from '@/components/layout/public-layout';

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
  'New Feature': 'bg-[#B4E7DD] text-[#0C1F40]',
  'Improvement': 'bg-[#EBF8FF] text-[#2B6CB0]',
  'Bug Fix': 'bg-[#FFF5F5] text-[#C53030]',
  'Security': 'bg-[#FFF9DB] text-[#B7791F]',
  'Deprecated': 'bg-[#F7FAFC] text-[#718096]',
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
      <div className="max-w-3xl mx-auto px-6 py-20" style={{ paddingTop: '80px' }}>
        {/* Header */}
        <div className="mb-16">
          <h1
            className="font-archivo font-bold text-[#0C1F40] text-[40px] sm:text-[28px]"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            Changelog
          </h1>
          <p className="mt-3 text-[18px] font-inter font-normal text-[#4A5568]">
            What&apos;s new in Daimon
          </p>
        </div>

        {/* Release list */}
        <div>
          {entries.map((entry) => (
            <article
              key={entry.version}
              className="mb-14"
              style={{
                borderLeft: '3px solid #B4E7DD',
                paddingLeft: '24px',
              }}
            >
              {/* Date + version badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <time
                  dateTime={entry.date}
                  className="text-[14px] font-inter font-medium text-[#718096]"
                >
                  {formatDate(entry.date)}
                </time>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F7FAFC] text-[#2D3748] border border-[rgba(12,31,64,0.12)]">
                  {entry.version}
                </span>
              </div>

              {/* Title */}
              <h2
                className="font-archivo font-bold text-[#0C1F40] text-[24px] mt-2 mb-4"
              >
                {entry.title}
              </h2>

              {/* Category tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {entry.categories.map((cat) => (
                  <span
                    key={cat}
                    className={`text-[12px] font-inter font-semibold px-2 py-0.5 rounded-[4px] ${CATEGORY_STYLES[cat]}`}
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Changes list */}
              <ul className="space-y-0" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {entry.changes.map((change, i) => (
                  <li
                    key={i}
                    className="relative text-[15px] font-inter font-normal text-[#2D3748] leading-relaxed"
                    style={{ padding: '8px 0 8px 20px' }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 text-[#B4E7DD] font-bold"
                      style={{ top: '8px' }}
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
