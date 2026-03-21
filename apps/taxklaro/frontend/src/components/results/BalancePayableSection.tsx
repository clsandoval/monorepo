import type { BalanceDisposition, OverpaymentDisposition, Peso } from '@/types/common';

interface BalancePayableSectionProps {
  balance: Peso;
  disposition: BalanceDisposition;
  overpayment: Peso;
  overpaymentDisposition: OverpaymentDisposition | null;
  totalItCredits: Peso;
  cwtCredits: Peso;
  quarterlyPayments: Peso;
  priorYearExcess: Peso;
}

function formatPeso(value: Peso): string {
  const num = parseFloat(value);
  return '₱' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const DISPOSITION_LABELS: Record<BalanceDisposition, string> = {
  BALANCE_PAYABLE: 'Balance Payable',
  ZERO_BALANCE: 'Zero Balance',
  OVERPAYMENT: 'Overpayment',
};

const OVERPAYMENT_LABELS: Record<OverpaymentDisposition, string> = {
  CARRY_OVER: 'Carry over to next year',
  REFUND: 'Claim as refund',
  TCC: 'Apply for Tax Credit Certificate (TCC)',
  PENDING_ELECTION: 'Pending election',
};

export function BalancePayableSection({
  balance,
  disposition,
  overpayment,
  overpaymentDisposition,
  totalItCredits,
  cwtCredits,
  quarterlyPayments,
  priorYearExcess,
}: BalancePayableSectionProps) {
  const hasCredits = parseFloat(totalItCredits) > 0;
  const hasOverpayment = disposition === 'OVERPAYMENT' && parseFloat(overpayment) > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Balance &amp; Credits</span>
        <span className="text-xs text-muted-foreground">{DISPOSITION_LABELS[disposition]}</span>
      </div>

      {hasCredits && (
        <table className="w-full text-sm mb-3">
          <thead>
            <tr>
              <th className="text-left pb-1.5 text-xs uppercase tracking-wide text-muted-foreground font-normal" colSpan={2}>
                Tax Credits Applied
              </th>
            </tr>
          </thead>
          <tbody>
            {parseFloat(cwtCredits) > 0 && (
              <tr className="even:bg-gray-50/50">
                <td className="py-1.5 text-muted-foreground">Creditable Withholding Tax (CWT)</td>
                <td className="py-1.5 text-right tabular-nums text-green-500">({formatPeso(cwtCredits)})</td>
              </tr>
            )}
            {parseFloat(quarterlyPayments) > 0 && (
              <tr className="even:bg-gray-50/50">
                <td className="py-1.5 text-muted-foreground">Quarterly Payments (1701Q)</td>
                <td className="py-1.5 text-right tabular-nums text-green-500">({formatPeso(quarterlyPayments)})</td>
              </tr>
            )}
            {parseFloat(priorYearExcess) > 0 && (
              <tr className="even:bg-gray-50/50">
                <td className="py-1.5 text-muted-foreground">Prior Year Excess Credits</td>
                <td className="py-1.5 text-right tabular-nums text-green-500">({formatPeso(priorYearExcess)})</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td className="pt-2 text-muted-foreground font-medium">Total Credits</td>
              <td className="pt-2 text-right tabular-nums text-green-500 font-medium">({formatPeso(totalItCredits)})</td>
            </tr>
          </tfoot>
        </table>
      )}

      {disposition === 'BALANCE_PAYABLE' && (
        <div className="flex justify-between items-baseline pt-1 border-t border-border">
          <span className="text-sm text-foreground font-medium">Net Balance Payable</span>
          <span className="tabular-nums text-red-500 font-semibold text-lg">{formatPeso(balance)}</span>
        </div>
      )}

      {disposition === 'ZERO_BALANCE' && (
        <div className="flex justify-between items-baseline pt-1 border-t border-border">
          <span className="text-sm text-muted-foreground">Net Balance</span>
          <span className="tabular-nums text-muted-foreground text-lg">₱0.00</span>
        </div>
      )}

      {hasOverpayment && (
        <div className="pt-1 border-t border-border">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-green-500 font-medium">Overpayment</span>
            <span className="tabular-nums text-green-500 font-semibold text-lg">{formatPeso(overpayment)}</span>
          </div>
          {overpaymentDisposition && (
            <p className="text-xs text-muted-foreground mt-1">
              Disposition: {OVERPAYMENT_LABELS[overpaymentDisposition]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default BalancePayableSection;
