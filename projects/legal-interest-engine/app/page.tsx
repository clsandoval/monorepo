import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SessionProvider } from '@/components/providers/session-provider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 sm:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-primary leading-tight mb-6">
              Philippine Legal Interest,{' '}
              <span className="italic">Computed Correctly</span>
            </h1>
            <p className="text-lg sm:text-xl font-body text-secondary leading-relaxed mb-10 max-w-xl mx-auto">
              Eliminate computation errors in your legal filings. Nacar-compliant interest
              calculations with court-ready documents — built for Philippine practitioners.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/calculate"
                className="inline-flex items-center justify-center px-8 py-3 rounded-md bg-primary text-white font-body font-medium text-base hover:bg-primary-light transition-colors duration-150 w-full sm:w-auto"
              >
                Try the Calculator
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-3 rounded-md border border-border text-primary font-body font-medium text-base hover:bg-primary/5 transition-colors duration-150 w-full sm:w-auto"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-surface border-t border-border px-4 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-primary text-center mb-4">
              Built for Philippine Courts
            </h2>
            <p className="font-body text-secondary text-center mb-14 max-w-xl mx-auto leading-relaxed">
              Every feature designed around the realities of Philippine civil litigation and
              Supreme Court jurisprudence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary text-lg mb-2">
                    Nacar-Compliant
                  </h3>
                  <p className="font-body text-secondary text-sm leading-relaxed">
                    Correctly handles the 12%→6% transition under <em>Nacar v. Gallery Frames</em>,
                    Art. 2212 compounding, and the distinction between loan and non-loan obligations.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary text-lg mb-2">
                    Court-Ready Documents
                  </h3>
                  <p className="font-body text-secondary text-sm leading-relaxed">
                    Generate computation worksheets, summary memos, demand letters, and court
                    filing documents — all pre-formatted to Philippine legal standards.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary text-lg mb-2">
                    Case Management
                  </h3>
                  <p className="font-body text-secondary text-sm leading-relaxed">
                    Organize computations by case, track status from demand to execution, and
                    maintain a complete record of your interest computations. Pro feature.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <div className="bg-primary rounded-xl px-8 py-10 text-center">
              <p className="font-mono text-4xl font-semibold text-white mb-3">
                ~40%
              </p>
              <p className="font-heading text-lg font-semibold text-accent mb-4">
                of interest computations filed in Philippine courts contain errors
              </p>
              <p className="font-body text-accent/70 text-sm leading-relaxed max-w-md mx-auto">
                Incorrect rate application, missed Nacar transitions, and manual spreadsheet
                errors cost litigants millions in under-recovered or contested interest awards.
              </p>
              <div className="mt-8">
                <Link
                  href="/calculate"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-white text-primary font-body font-medium text-sm hover:bg-accent/10 transition-colors duration-150"
                >
                  Compute for Free
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </SessionProvider>
  );
}
