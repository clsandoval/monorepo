interface AmnestyComparisonProps {
  amnestyActive?: boolean;
}

export function AmnestyComparison({ amnestyActive = false }: AmnestyComparisonProps) {
  if (amnestyActive) {
    // Placeholder for when SEC launches a new ECIP amnesty program.
    // Replace this block with actual amnesty program details.
    return (
      <div className="space-y-3">
        <h2 className="font-display text-xl font-bold text-charcoal">
          Amnesty Program Available
        </h2>
        <div className="rounded-lg border border-sec-blue/30 bg-sec-blue/5 px-5 py-4">
          <p className="font-body text-sm text-charcoal">
            An SEC amnesty program is currently active. Details will appear here when the program
            is configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display text-xl font-bold text-charcoal">
        SEC Amnesty / ECIP Programs
      </h2>
      <div className="rounded-lg border border-divider bg-gray-50 px-5 py-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            <svg
              className="h-4 w-4 text-gray-muted"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="font-body text-sm font-medium text-charcoal">
              No amnesty program is currently active
            </p>
            <p className="font-body text-sm text-gray-secondary leading-relaxed">
              The SEC periodically announces Enhanced Compliance Incentive Programs (ECIP)
              that allow delinquent corporations to settle penalties at a reduced rate or under
              simplified terms. These programs are time-limited and announced via SEC
              Memorandum Circulars.
            </p>
            <p className="font-body text-sm text-gray-secondary leading-relaxed">
              When a new ECIP is announced, the comparison between standard penalties and
              amnesty terms will appear here. Check the{" "}
              <a
                href="https://www.sec.gov.ph/memorandum-circulars/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sec-blue underline hover:text-sec-blue/80"
              >
                SEC Memorandum Circulars page
              </a>{" "}
              for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
