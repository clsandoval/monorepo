export function Header() {
  return (
    <header className="mb-12">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-heading text-base font-semibold text-white">
          M
        </div>
        <span className="font-heading text-lg font-semibold tracking-tight text-text-primary">
          Maceda
        </span>
      </div>
      <h1 className="mb-3 font-heading text-4xl font-light leading-tight tracking-tight text-text-primary">
        Know your <em className="font-normal italic">rights</em> under
        <br />
        the Maceda Law
      </h1>
      <p className="max-w-md text-base font-light leading-relaxed text-text-secondary">
        Calculate your Cash Surrender Value and grace period eligibility under
        Republic Act 6552 — the law that protects Filipino homebuyers paying in
        installments.
      </p>
    </header>
  );
}
