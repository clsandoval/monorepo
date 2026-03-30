const FAQ_ITEMS = [
  {
    q: "When does the amnesty expire?",
    a: "The amnesty window runs from July 5, 2024 to July 5, 2026. After July 5, 2026, all accumulated penalties, surcharges, and interest will again become due. There is no indication that the deadline will be extended, so property owners should file before that date.",
  },
  {
    q: "Does my city or municipality need to pass an ordinance first?",
    a: "No. BLGF Memorandum Circular No. 003-2025 clarifies that the amnesty under RA 12001 Section 30 applies by operation of law. No local ordinance, resolution, or Sanggunian action is required. Your LGU Treasurer's office must accept amnesty payments directly.",
  },
  {
    q: "What years of delinquency are covered?",
    a: "The amnesty covers all real property tax delinquencies incurred before July 5, 2024. This includes any unpaid basic RPT and Special Education Fund (SEF) from any year prior to that date. Delinquencies arising on or after July 5, 2024 are not covered and must be paid with applicable penalties.",
  },
  {
    q: "Can I pay in installments?",
    a: "RA 12001 Section 30 does not mandate installment options for amnesty payments. However, your LGU may offer installment arrangements at its discretion. Contact your local Treasurer's office to ask about installment plans. The full amnesty amount must be settled before July 5, 2026 regardless of payment schedule.",
  },
  {
    q: "What happens if I don't pay before July 5, 2026?",
    a: "If you do not avail of the amnesty before the deadline, all previously waived penalties, surcharges, and interest will be reimposed. You will owe the full amount — principal plus accumulated penalties at 2% per month (capped at 72%). The amnesty is a one-time opportunity with no announced plans for extension.",
  },
  {
    q: "What documents do I need to bring to the Treasurer's office?",
    a: "Bring your latest tax declaration or a copy of your property's Tax Declaration Number (TD No.), a valid government-issued ID, and this computation summary (click Print Summary above). The Treasurer's office can look up your exact delinquency records using your TD number.",
  },
  {
    q: "Does this calculator give the exact amount I'll pay?",
    a: "This calculator provides an estimate based on the amounts you enter. Your actual delinquency may differ — the Treasurer's office has the official records of assessed values per year. Use this tool to understand approximate savings and prepare before visiting your LGU.",
  },
  {
    q: "Are there other fees besides the RPT and SEF?",
    a: "The amnesty under Section 30 specifically covers penalties, surcharges, and interest on delinquent RPT and SEF. Some LGUs may charge minimal processing or certification fees, but these are separate from the tax computation. The principal RPT and SEF amounts shown in this calculator are the core obligation.",
  },
];

export function FaqSection() {
  return (
    <section className="mt-16">
      <h2 className="font-heading text-lg font-bold text-text-primary mb-4">
        Frequently Asked Questions
      </h2>
      <div className="space-y-0 divide-y divide-border-subtle">
        {FAQ_ITEMS.map((item, i) => (
          <details
            key={i}
            className="group"
            {...(i === 0 ? { open: true } : {})}
          >
            <summary className="flex cursor-pointer items-center justify-between py-4 font-heading text-[15px] font-semibold text-text-primary hover:text-accent transition-colors list-none [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="ml-4 text-text-secondary group-open:rotate-180 transition-transform text-xs">
                ▼
              </span>
            </summary>
            <p className="pb-4 font-body text-sm text-text-secondary leading-relaxed">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
