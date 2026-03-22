interface StepGuideProps {
  status: "delinquent" | "suspended" | "revoked";
}

interface Step {
  number: number;
  title: string;
  description: string;
  note?: string;
}

const DELINQUENT_STEPS: Step[] = [
  {
    number: 1,
    title: "Gather Required Documents",
    description:
      "Collect your SEC Certificate of Registration, Articles of Incorporation, and all backlog GIS, AFS, and Beneficial Ownership reports for years not yet filed. See the document checklist below for the complete list.",
  },
  {
    number: 2,
    title: "Settle Accumulated Penalties at the SEC Cashier",
    description:
      "Proceed to the SEC cashier (Secretariat Building, PICC Complex, Pasay City or the nearest SEC extension office) and pay all outstanding penalties. Request official receipts — these are required for your filing.",
  },
  {
    number: 3,
    title: "File All Backlog Reports (GIS, AFS, Beneficial Ownership)",
    description:
      "Submit all overdue General Information Sheets, Audited Financial Statements, and Beneficial Ownership reports to the SEC. Late filing fees must be settled first (Step 2) before reports will be accepted.",
  },
  {
    number: 4,
    title: "Submit MC 28 Compliance Documentation (if applicable)",
    description:
      "If your corporation has foreign equity or is subject to the Anti-Dummy Law, submit proof of compliance with SEC Memorandum Circular No. 28 (Beneficial Ownership Disclosure).",
  },
  {
    number: 5,
    title: "Confirm Active Status with the SEC",
    description:
      "After all filings and payments are processed, verify that your corporation's status has been updated to active in the SEC's online verification system (ESPARC). This may take several business days.",
  },
];

const SUSPENDED_ADDITIONAL_STEPS: Step[] = [
  {
    number: 6,
    title: "File Petition to Lift Suspension",
    description:
      "Prepare and file a notarized Petition to Lift Suspension with the SEC, signed by the authorized officer. Attach proof of penalty payments and all backlog filings. Use the petition generator below to create a template.",
    note: "Your board must pass a resolution authorizing the filing. Attach a Secretary's Certificate attesting to the resolution.",
  },
  {
    number: 7,
    title: "Publish Petition in a Newspaper of General Circulation",
    description:
      "The petition must be published once in a newspaper of general circulation in the Philippines. Keep proof of publication (publisher's affidavit and newspaper clipping) as these must be submitted to the SEC.",
  },
  {
    number: 8,
    title: "Wait for SEC Order Lifting Suspension",
    description:
      "The SEC will evaluate your petition and, if complete, issue an Order lifting the suspension. Processing times vary — typically 30–90 business days. Follow up with the SEC's Company Registration and Monitoring Department (CRMD).",
  },
];

function StepItem({ step }: { step: Step }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sec-blue font-body text-sm font-bold text-white">
          {step.number}
        </div>
      </div>
      <div className="min-w-0 flex-1 pb-6">
        <p className="font-body text-sm font-semibold text-charcoal leading-snug">
          {step.title}
        </p>
        <p className="font-body text-sm text-gray-secondary mt-1 leading-relaxed">
          {step.description}
        </p>
        {step.note && (
          <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
            <p className="font-body text-xs text-amber-800 leading-relaxed">
              <strong>Note:</strong> {step.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StepList({ steps }: { steps: Step[] }) {
  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div
        className="absolute left-4 top-4 bottom-0 w-px bg-divider"
        style={{ transform: "translateX(-0.5px)" }}
      />
      <div className="space-y-0">
        {steps.map((step) => (
          <StepItem key={step.number} step={step} />
        ))}
      </div>
    </div>
  );
}

export function StepGuide({ status }: StepGuideProps) {
  if (status === "revoked") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-charcoal">
            Path to Revival
          </h2>
          <p className="font-body text-sm text-gray-secondary mt-1">
            Your corporation has been revoked. Revival requires a separate legal process.
          </p>
        </div>

        <div className="rounded-lg border border-crimson/20 bg-crimson/5 px-5 py-4 space-y-2">
          <p className="font-body text-sm font-semibold text-crimson">
            Corporate Revival under the Revised Corporation Code
          </p>
          <p className="font-body text-sm text-gray-secondary leading-relaxed">
            Revival of a revoked corporation requires filing a Petition for Revival under
            Section 11 of the Revised Corporation Code (RA 11232). This is a more involved
            legal process than lifting a suspension and typically requires:
          </p>
          <ul className="font-body text-sm text-gray-secondary space-y-1 list-disc list-inside leading-relaxed">
            <li>A vote by the majority of the board of directors</li>
            <li>Ratification by at least a majority of the outstanding capital stock</li>
            <li>Filing of a verified petition for revival with the SEC</li>
            <li>Payment of all outstanding penalties and fees</li>
            <li>Publication requirements as prescribed by the SEC</li>
          </ul>
          <p className="font-body text-sm text-gray-secondary leading-relaxed mt-2">
            Given the complexity of the revival process,{" "}
            <strong className="text-charcoal">
              we strongly recommend engaging a corporate lawyer or accredited corporate secretary
            </strong>{" "}
            to guide your corporation through the petition. Errors in the revival petition can
            result in denial and additional delays.
          </p>
        </div>
      </div>
    );
  }

  const isSuspended = status === "suspended";
  const steps = isSuspended
    ? [...DELINQUENT_STEPS, ...SUSPENDED_ADDITIONAL_STEPS]
    : DELINQUENT_STEPS;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold text-charcoal">
          {isSuspended ? "Path to Reinstatement" : "Path to Good Standing"}
        </h2>
        <p className="font-body text-sm text-gray-secondary mt-1">
          {isSuspended
            ? "Follow these 8 steps to lift your suspension and restore your corporation to active status."
            : "Follow these 5 steps to clear your delinquency and restore your corporation to good standing."}
        </p>
      </div>

      <StepList steps={steps} />
    </div>
  );
}
