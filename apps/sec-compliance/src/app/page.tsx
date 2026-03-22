import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-charcoal leading-tight mb-6">
            Is your corporation in trouble with the SEC?
          </h1>
          <p className="font-body text-lg text-gray-secondary leading-relaxed mb-8 max-w-2xl">
            117,000+ corporations were suspended in a single SEC batch order. Check your compliance
            status and penalties in 2 minutes — free, no signup required.
          </p>
          <Link
            href="/wizard"
            className="inline-block bg-sec-blue text-white px-8 py-3 rounded-md font-body font-semibold text-base hover:opacity-90 transition-opacity"
          >
            Check Your Status →
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-divider" />

      {/* Value Props */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-display text-xl font-semibold text-charcoal mb-3">
              Free Penalty Computation
            </h3>
            <p className="font-body text-sm text-gray-secondary leading-relaxed">
              Calculate your exact penalties based on the current SEC penalty schedule (MC No. 6,
              Series of 2024).
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-charcoal mb-3">
              Plain-Language Guide
            </h3>
            <p className="font-body text-sm text-gray-secondary leading-relaxed">
              Understand your compliance status, what documents you need, and the exact steps to fix
              it.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-charcoal mb-3">
              Compare Options
            </h3>
            <p className="font-body text-sm text-gray-secondary leading-relaxed">
              See the cost of standard reinstatement vs. amnesty programs when available.
            </p>
          </div>
        </div>
      </section>

      {/* Authority line */}
      <div className="border-t border-divider" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="font-body text-sm text-gray-secondary">
          Based on{" "}
          <span className="font-semibold text-charcoal">
            SEC Memorandum Circular No. 6, Series of 2024
          </span>{" "}
          — the current penalty schedule.
        </p>
      </section>
    </main>
  );
}
