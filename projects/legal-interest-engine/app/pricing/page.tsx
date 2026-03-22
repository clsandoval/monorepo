import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SessionProvider } from '@/components/providers/session-provider';
import { Card, CardBody, CardHeader } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for the Legal Interest Engine. Start free with 3 computations per month. Upgrade for unlimited computations, document generation, and case management.',
};

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

interface FeatureRowProps {
  label: string;
  free: boolean | string;
  consumer: boolean | string;
  professional: boolean | string;
}

function FeatureRow({ label, free, consumer, professional }: FeatureRowProps) {
  function render(v: boolean | string) {
    if (v === true) return <CheckIcon />;
    if (v === false) return <XIcon />;
    return <span className="text-xs font-body text-secondary">{v}</span>;
  }

  return (
    <li className="flex items-center gap-2 text-sm font-body text-secondary">
      {render(professional)}
      {label}
    </li>
  );
}

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

  const freeFeatures = [
    '3 computations per month',
    'Nacar-compliant calculations',
    'On-screen results breakdown',
  ];

  const consumerFeatures = [
    'Unlimited computations',
    'Save computation history',
    'Worksheet PDF',
    'Summary memo',
    'All free features',
  ];

  const proFeatures = [
    'Everything in Consumer',
    'Demand letters',
    'Court filing documents',
    'Case management',
    'Link computations to cases',
  ];

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Heading */}
            <div className="text-center mb-14">
              <h1 className="font-heading text-4xl font-semibold text-primary mb-4">
                Simple, transparent pricing
              </h1>
              <p className="font-body text-secondary text-lg max-w-xl mx-auto leading-relaxed">
                Start free. Upgrade when you need documents or case management.
                No contracts, cancel anytime.
              </p>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Free */}
              <Card>
                <CardHeader>
                  <p className="text-xs font-body text-muted uppercase tracking-widest mb-1">Free</p>
                  <p className="font-mono text-3xl font-semibold text-primary">₱0</p>
                  <p className="text-xs font-body text-muted mt-0.5">forever</p>
                </CardHeader>
                <CardBody className="space-y-4">
                  <ul className="space-y-2.5">
                    {freeFeatures.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm font-body text-secondary">
                        <CheckIcon />
                        {f}
                      </li>
                    ))}
                    <li className="flex items-center gap-2 text-sm font-body text-muted">
                      <XIcon />
                      Document generation
                    </li>
                    <li className="flex items-center gap-2 text-sm font-body text-muted">
                      <XIcon />
                      Case management
                    </li>
                  </ul>
                  <Link
                    href="/signup"
                    className="block text-center w-full px-4 py-2 rounded-md border border-border text-primary font-body font-medium text-sm hover:bg-primary/5 transition-colors duration-150"
                  >
                    Get started free
                  </Link>
                </CardBody>
              </Card>

              {/* Consumer */}
              <Card className="border-primary/30 shadow-md">
                <CardHeader className="bg-primary/5">
                  <p className="text-xs font-body text-primary uppercase tracking-widest mb-1 font-medium">Consumer</p>
                  <p className="font-mono text-3xl font-semibold text-primary">₱199</p>
                  <p className="text-xs font-body text-muted mt-0.5">per month</p>
                </CardHeader>
                <CardBody className="space-y-4">
                  <ul className="space-y-2.5">
                    {consumerFeatures.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm font-body text-secondary">
                        <CheckIcon />
                        {f}
                      </li>
                    ))}
                    <li className="flex items-center gap-2 text-sm font-body text-muted">
                      <XIcon />
                      Demand letters
                    </li>
                    <li className="flex items-center gap-2 text-sm font-body text-muted">
                      <XIcon />
                      Court filing documents
                    </li>
                  </ul>
                  <Link
                    href="/signup"
                    className="block text-center w-full px-4 py-2 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary-light transition-colors duration-150"
                  >
                    Start Consumer
                  </Link>
                </CardBody>
              </Card>

              {/* Professional */}
              <Card>
                <CardHeader>
                  <p className="text-xs font-body text-muted uppercase tracking-widest mb-1">Professional</p>
                  <p className="font-mono text-3xl font-semibold text-primary">₱999</p>
                  <p className="text-xs font-body text-muted mt-0.5">per month</p>
                </CardHeader>
                <CardBody className="space-y-4">
                  <ul className="space-y-2.5">
                    {proFeatures.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm font-body text-secondary">
                        <CheckIcon />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="block text-center w-full px-4 py-2 rounded-md border border-border text-primary font-body font-medium text-sm hover:bg-primary/5 transition-colors duration-150"
                  >
                    Start Professional
                  </Link>
                </CardBody>
              </Card>
            </div>

            {/* FAQ */}
            <div className="mt-20">
              <h2 className="font-heading text-2xl font-semibold text-primary text-center mb-10">
                Frequently asked questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <div>
                  <h3 className="font-body font-semibold text-primary text-sm mb-2">
                    What payment methods are accepted?
                  </h3>
                  <p className="font-body text-secondary text-sm leading-relaxed">
                    We accept GCash, Maya, credit and debit cards via PayMongo.
                    All Philippine payment methods are supported.
                  </p>
                </div>
                <div>
                  <h3 className="font-body font-semibold text-primary text-sm mb-2">
                    Can I cancel anytime?
                  </h3>
                  <p className="font-body text-secondary text-sm leading-relaxed">
                    Yes. Cancel any time from your settings. Your plan stays active until
                    the end of the billing period and won&apos;t renew.
                  </p>
                </div>
                <div>
                  <h3 className="font-body font-semibold text-primary text-sm mb-2">
                    Are computations legally accurate?
                  </h3>
                  <p className="font-body text-secondary text-sm leading-relaxed">
                    Our engine is built on <em>Nacar v. Gallery Frames</em> (G.R. No. 189871)
                    and related circulars. Always verify with a licensed attorney before
                    use in legal proceedings.
                  </p>
                </div>
                <div>
                  <h3 className="font-body font-semibold text-primary text-sm mb-2">
                    Can I upgrade or downgrade?
                  </h3>
                  <p className="font-body text-secondary text-sm leading-relaxed">
                    Yes. Upgrade or downgrade anytime from your account settings.
                    Changes take effect at the start of the next billing period.
                  </p>
                </div>
                <div>
                  <h3 className="font-body font-semibold text-primary text-sm mb-2">
                    Is my data secure?
                  </h3>
                  <p className="font-body text-secondary text-sm leading-relaxed">
                    All data is encrypted at rest and in transit. Computation data is
                    never shared with third parties.
                  </p>
                </div>
                <div>
                  <h3 className="font-body font-semibold text-primary text-sm mb-2">
                    Do you offer team or firm plans?
                  </h3>
                  <p className="font-body text-secondary text-sm leading-relaxed">
                    Not yet. Multiple Professional subscriptions can be used within the same
                    firm independently. Team billing is on our roadmap.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </SessionProvider>
  );
}
