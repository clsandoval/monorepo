import { Metadata } from 'next';
import Link from 'next/link';
import { Key, Server, Plug, Github } from 'lucide-react';
import { PublicLayout } from '@/components/layout/public-layout';

export const metadata: Metadata = {
  title: 'About — Daimon',
  description: 'Daimon is the self-serve SaaS layer for Decision Orchestrator — bringing AI-powered Discord automation to every team.',
  openGraph: {
    title: 'About Daimon',
    description: 'We believe AI belongs in the tools your team already uses.',
    images: [{ url: 'https://daimon.ai/og-about.png' }],
  },
  alternates: {
    canonical: 'https://daimon.ai/about',
  },
};

const VALUES = [
  {
    title: 'Your data is yours',
    body: 'BYOK means your Anthropic API key goes directly to Anthropic. We store credentials encrypted in Supabase Vault. We never log your conversations.',
  },
  {
    title: 'Reasoning over speed',
    body: 'We chose Claude because it thinks before it answers. A slower, correct response is worth more than a fast, wrong one.',
  },
  {
    title: 'Small teams, big leverage',
    body: 'Daimon is built for 2–20 person teams who need enterprise-grade AI tooling without enterprise-grade setup.',
  },
  {
    title: 'No lock-in',
    body: 'Every integration uses standard OAuth or API keys. If you leave Daimon, you keep your tokens, your data, and your services.',
  },
  {
    title: 'Discord-native',
    body: 'We didn\'t bolt Discord on. Daimon was built from the ground up as a Discord-first application. The bot is the product.',
  },
  {
    title: 'Open about limitations',
    body: 'AI systems make mistakes. Daimon won\'t hide that. Error messages are clear, citations are explicit, and the bot tells you when it doesn\'t know.',
  },
];

const HOW_IT_WORKS = [
  {
    Icon: Key,
    heading: 'Bring Your Own Keys',
    body: 'Your Anthropic API key powers every Claude request. We never see your conversations. You control the model, the spend, and the data.',
  },
  {
    Icon: Server,
    heading: 'Deploy in Two Minutes',
    body: 'Paste your Discord bot token and guild ID. Daimon handles the connection, the tooling, and the multi-tenant isolation — you get a live AI assistant immediately.',
  },
  {
    Icon: Plug,
    heading: 'Connect What You Use',
    body: 'GitHub, Linear, Toggl, Google Analytics, Fly.io, and more. OAuth for services that support it, API key paste for everything else.',
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <div>
        {/* Section 1: Hero */}
        <section className="bg-foreground relative overflow-hidden pt-24 pb-20">
          {/* Gradient orbs */}
          <div
            className="absolute rounded-full pointer-events-none w-[600px] h-[600px] -top-[200px] -left-[150px] opacity-30 bg-[radial-gradient(circle,_hsl(var(--primary))_0%,_transparent_70%)]"
          />
          <div
            className="absolute rounded-full pointer-events-none w-[500px] h-[500px] -bottom-[150px] -right-[100px] opacity-30 bg-[radial-gradient(circle,_hsl(var(--secondary))_0%,_transparent_70%)]"
          />
          <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
            <h1 className="font-archivo font-bold text-white mx-auto max-w-[700px] text-[clamp(30px,4vw,44px)]">
              We believe AI belongs in the tools your team already uses.
            </h1>
            <p className="text-white/70 mt-5 mx-auto font-inter font-normal text-xl max-w-[600px]">
              Daimon brings Claude-powered decision intelligence to Discord — the platform where teams already live.
            </p>
          </div>
        </section>

        {/* Section 2: Mission */}
        <section className="bg-white py-20">
          <div className="max-w-3xl mx-auto px-8">
            <h2 className="font-archivo font-bold text-foreground text-[32px]">Our Mission</h2>
            <div className="mt-6 space-y-5 text-[17px] font-inter font-normal text-muted-foreground leading-[1.75]">
              <p>
                Decision-making is the most high-value work any team does — and it&apos;s increasingly
                happening asynchronously, in Discord, over fast-moving threads. Yet the tools that help
                teams think — AI assistants, project trackers, time loggers, analytics dashboards —
                are siloed from the conversation.
              </p>
              <p>
                Daimon closes that gap. It sits inside Discord, where decisions happen, and brings 50+
                connected tools into every thread. You ask a question. Daimon queries your data, checks
                your repositories, reviews your metrics, and answers in context — right where the
                conversation is.
              </p>
              <p>
                We built Daimon on Claude because we believe reasoning quality matters more than speed.
                We built it BYOK because we believe your data belongs to you. And we built it self-serve
                because the best tools are the ones your team actually deploys.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: How Daimon Works */}
        <section className="bg-background py-16">
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="font-archivo font-bold text-foreground text-[28px] mb-10">
              Built on Decision Orchestrator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map(({ Icon, heading, body }, i) => (
                <div
                  key={i}
                  className="bg-white border-t-4 border-t-primary p-6 rounded-none"
                >
                  <div className="w-10 h-10 bg-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-archivo font-bold text-foreground text-lg mb-2">{heading}</h3>
                  <p className="font-inter text-[15px] text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Values */}
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="font-archivo font-bold text-foreground text-[32px] mb-10">What We Believe</h2>
            <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {VALUES.map((value) => (
                <li key={value.title}>
                  <article className="h-full p-6 bg-background border border-border rounded-xl">
                    <h3 className="font-archivo font-bold text-foreground text-lg">
                      {value.title}
                    </h3>
                    <p className="font-inter font-normal text-muted-foreground text-[15px] mt-2 leading-relaxed">
                      {value.body}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 5: Team */}
        <section className="bg-background py-20">
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="font-archivo font-bold text-foreground text-[32px] text-center">
              The Team
            </h2>
            <p className="font-inter text-lg text-muted-foreground text-center mt-2 mb-12">
              Small, focused, shipping.
            </p>
            <ul role="list" className="flex justify-center">
              <li>
                <article className="flex flex-col items-center gap-3 text-center bg-white border border-border rounded-2xl max-w-[280px] px-6 py-8">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                    <span className="font-archivo font-bold text-white text-[28px]">F</span>
                  </div>
                  <div>
                    <p className="font-archivo font-bold text-foreground text-xl">Founder</p>
                    <p className="font-inter text-sm text-muted-foreground mt-1">Founder &amp; Builder</p>
                    <p className="font-inter text-sm text-muted-foreground mt-2 max-w-[240px]">
                      Decision Orchestrator started as an internal tool. Daimon makes it available to every team.
                    </p>
                    <a
                      href="https://github.com/handle"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 font-inter text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      @handle
                    </a>
                  </div>
                </article>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 6: CTA */}
        <section className="bg-foreground py-20">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="font-archivo font-bold text-white text-4xl">
              Try Daimon free today
            </h2>
            <p className="font-inter text-lg text-white/70 mt-3">
              No credit card. No configuration. Just paste your keys and go.
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                aria-label="Get started free — go to signup page"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-archivo font-bold text-base hover:bg-primary/80 transition-colors rounded-none"
              >
                Get started free
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
