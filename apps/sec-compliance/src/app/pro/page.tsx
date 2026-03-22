import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Solo",
    price: "₱999",
    corpLimit: 5,
    description: "For accountants managing a small portfolio of clients.",
    features: [
      "Portfolio dashboard",
      "Penalty computation for all corps",
      "Compliance timeline view",
      "Status monitoring",
      "Remediation guides",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Practice",
    price: "₱2,499",
    corpLimit: 25,
    description: "For growing practices with a mid-size client base.",
    features: [
      "Portfolio dashboard",
      "Penalty computation for all corps",
      "Compliance timeline view",
      "Status monitoring",
      "Remediation guides",
      "CSV batch import",
      "Branded PDF reports",
    ],
    cta: "Start free trial",
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Firm",
    price: "₱4,999",
    corpLimit: 100,
    description: "For established firms handling large client volumes.",
    features: [
      "Portfolio dashboard",
      "Penalty computation for all corps",
      "Compliance timeline view",
      "Status monitoring",
      "Remediation guides",
      "CSV batch import",
      "Branded PDF reports",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
];

const steps = [
  {
    number: "01",
    title: "Import your corporations",
    description:
      "Add corporations one by one or upload a CSV with all your clients at once. We pull in their SEC registration details automatically.",
  },
  {
    number: "02",
    title: "Monitor the compliance dashboard",
    description:
      "See every corporation's status at a glance — outstanding filings, computed penalties, risk flags, and upcoming deadlines in one unified view.",
  },
  {
    number: "03",
    title: "Generate client reports",
    description:
      "Export branded PDF compliance reports per corporation. Share directly with clients or use internally for your advisory work.",
  },
];

const faqs = [
  {
    question: "What happens after the 14-day trial?",
    answer:
      "Your dashboard goes read-only — you can still view all your corporations and their compliance status, but you won't be able to add new ones or generate reports. Your data is fully preserved and restored the moment you subscribe.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes. You can upgrade or downgrade at any time from your account settings. Plan changes take effect at the start of your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Visa, Mastercard, and Maya. All payments are processed securely. We do not store your card details on our servers.",
  },
  {
    question: "Is my client data secure?",
    answer:
      "Your data is stored in Supabase with encryption at rest and in transit. We never share your client information with third parties. You can export or delete your data at any time.",
  },
];

export default function ProPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <p className="font-body text-sm font-semibold text-sec-blue uppercase tracking-widest mb-5">
            SEC Compliance Navigator Pro
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-charcoal leading-tight mb-6">
            Manage compliance for all your clients
          </h1>
          <p className="font-body text-lg text-gray-secondary leading-relaxed mb-4 max-w-2xl">
            If you're an accountant or bookkeeper tracking 10, 20, or 50+ corporations in
            spreadsheets — you already know how painful this is. One missed filing date ripples
            into penalties across your entire portfolio.
          </p>
          <p className="font-body text-lg text-gray-secondary leading-relaxed mb-10 max-w-2xl">
            Pro gives you a single dashboard for every client corporation: status, penalties,
            deadlines, and remediation steps — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href="/pro/signup"
              className="inline-flex items-center gap-2 bg-sec-blue text-white px-8 py-3.5 rounded-md font-body font-semibold text-base hover:opacity-90 transition-opacity"
            >
              Start your 14-day free trial
              <ArrowRight className="size-4" />
            </Link>
            <p className="font-body text-sm text-gray-muted">No credit card required.</p>
          </div>
        </div>
      </section>

      <div className="border-t border-divider" />

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-24">
        <div className="max-w-2xl mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-charcoal mb-4">
            Simple, transparent pricing
          </h2>
          <p className="font-body text-base text-gray-secondary leading-relaxed">
            Every plan includes a 14-day free trial. No credit card required to start.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 flex flex-col gap-6 ${
                plan.highlighted
                  ? "border-sec-blue ring-1 ring-sec-blue/20 shadow-sm"
                  : "border-divider"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-block bg-sec-blue text-white text-xs font-body font-semibold px-3 py-1 rounded-full tracking-wide">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-display text-2xl font-semibold text-charcoal mb-1">
                  {plan.name}
                </h3>
                <p className="font-body text-sm text-gray-secondary leading-snug">
                  {plan.description}
                </p>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold text-charcoal">
                    {plan.price}
                  </span>
                  <span className="font-body text-sm text-gray-muted">/mo</span>
                </div>
                <p className="font-body text-sm text-gray-secondary mt-1">
                  Up to{" "}
                  <span className="font-semibold text-charcoal">{plan.corpLimit} corporations</span>
                </p>
              </div>

              <ul className="flex flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="size-4 text-sec-blue mt-0.5 shrink-0" />
                    <span className="font-body text-sm text-charcoal leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-2">
                <Link
                  href="/pro/signup"
                  className={`block w-full text-center px-5 py-3 rounded-md font-body font-semibold text-sm transition-opacity hover:opacity-90 ${
                    plan.highlighted
                      ? "bg-sec-blue text-white"
                      : "border border-sec-blue text-sec-blue hover:bg-sec-blue/5"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-divider" />

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-24">
        <div className="max-w-2xl mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-charcoal mb-4">
            How it works
          </h2>
          <p className="font-body text-base text-gray-secondary leading-relaxed">
            Get your entire client portfolio under compliance oversight in under an hour.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div key={step.number}>
              <p className="font-display text-5xl font-semibold text-divider mb-4 leading-none select-none">
                {step.number}
              </p>
              <h3 className="font-display text-xl font-semibold text-charcoal mb-3">
                {step.title}
              </h3>
              <p className="font-body text-sm text-gray-secondary leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-divider" />

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-24">
        <div className="max-w-2xl mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-charcoal mb-4">
            Frequently asked questions
          </h2>
        </div>

        <div className="max-w-3xl grid grid-cols-1 gap-0 divide-y divide-divider">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-8">
              <h4 className="font-display text-lg font-semibold text-charcoal mb-3">
                {faq.question}
              </h4>
              <p className="font-body text-sm text-gray-secondary leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-divider" />

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-charcoal mb-5">
            Start your 14-day free trial
          </h2>
          <p className="font-body text-base text-gray-secondary leading-relaxed mb-8">
            No credit card required. Set up your portfolio in minutes and see exactly where each
            client stands with the SEC.
          </p>
          <Link
            href="/pro/signup"
            className="inline-flex items-center gap-2 bg-sec-blue text-white px-8 py-3.5 rounded-md font-body font-semibold text-base hover:opacity-90 transition-opacity"
          >
            Get started free
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
