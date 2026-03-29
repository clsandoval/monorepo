"use client";

import { useState } from "react";

export function LegalBasis({ section4 }: { section4: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 rounded-xl border border-border-subtle bg-[#fafaf9] px-6 py-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-[13px] font-medium text-text-secondary">
          Legal basis
        </span>
        <span
          className={`text-xs text-text-tertiary transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {open && (
        <div className="mt-4 border-t border-border-subtle pt-4 text-[13px] font-light leading-relaxed text-text-secondary">
          {section4 ? (
            <>
              <p className="mb-2.5">
                <strong className="font-semibold text-text-primary">
                  Section 4, RA 6552:
                </strong>{" "}
                &ldquo;In case where less than two years of installments were
                paid, the seller shall give the buyer a grace period of not less
                than sixty days from the date the installment became due.&rdquo;
              </p>
              <p className="mb-2.5">
                If the buyer fails to pay the installments due at the expiration
                of the grace period, the seller may cancel the contract after
                thirty days from receipt by the buyer of the notice of
                cancellation or the demand for rescission of the contract by a
                notarial act.
              </p>
            </>
          ) : (
            <>
              <p className="mb-2.5">
                <strong className="font-semibold text-text-primary">
                  Section 3, RA 6552:
                </strong>{" "}
                &ldquo;…the actual cash surrender value of the payments on the
                property equivalent to fifty percent of the total payments
                made…&rdquo;
              </p>
              <p className="mb-2.5">
                <strong className="font-semibold text-text-primary">
                  Section 3(b):
                </strong>{" "}
                &ldquo;…an additional five percent every year but not to exceed
                ninety percent of the total payments made…&rdquo;
              </p>
            </>
          )}
          <p className="text-xs italic text-text-tertiary">
            Republic Act No. 6552, &ldquo;An Act to Provide Protection to
            Buyers of Real Estate on Installment Payments&rdquo; (1972)
          </p>
        </div>
      )}
    </div>
  );
}
