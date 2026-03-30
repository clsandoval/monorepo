import { getDaysUntilDeadline } from "@/lib/engine";

export function DeadlineBanner() {
  const daysLeft = getDaysUntilDeadline();

  if (daysLeft <= 0) {
    return (
      <div className="rounded-lg bg-text-primary px-6 py-4 text-center">
        <p className="font-heading text-lg font-bold text-bg">
          The amnesty period has ended.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="font-heading text-sm font-semibold text-accent uppercase tracking-wide">
          Amnesty Deadline
        </p>
        <p className="font-heading text-2xl sm:text-3xl font-bold text-text-primary">
          {daysLeft} days remaining
        </p>
      </div>
      <p className="font-body text-sm text-text-secondary">
        File before <strong className="text-text-primary">July 5, 2026</strong>{" "}
        to waive all penalties and surcharges on delinquent real property taxes.
      </p>
    </div>
  );
}
