import { getDaysUntilDeadline } from "@/lib/engine";

export function Header() {
  const daysLeft = getDaysUntilDeadline();

  return (
    <header className="mb-8">
      <p className="text-sm font-body font-medium tracking-widest uppercase text-text-secondary mb-2">
        Republic Act No. 12001 · Section 30
      </p>
      <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight">
        Real Property Tax Amnesty Calculator
      </h1>
      <p className="mt-3 text-base font-body text-text-secondary leading-relaxed max-w-2xl">
        Calculate how much you save on penalties and surcharges under the RPVARA
        tax amnesty. Covers delinquencies incurred before July 5, 2024.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-accent-soft px-3 py-1 text-sm font-body font-semibold text-accent">
          {daysLeft > 0
            ? `${daysLeft} days remaining`
            : daysLeft === 0
              ? "Last day!"
              : "Amnesty period has ended"}
        </span>
        <span className="text-xs text-text-secondary font-body">
          Deadline: July 5, 2026
        </span>
      </div>
    </header>
  );
}
