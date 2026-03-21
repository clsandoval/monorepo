import type { Peso } from '@/types/common';

interface InstallmentSectionProps {
  installmentEligible: boolean;
  installmentFirstDue: Peso;
  installmentSecondDue: Peso;
}

function formatPeso(value: Peso): string {
  const num = parseFloat(value);
  return '₱' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function InstallmentSection({
  installmentEligible,
  installmentFirstDue,
  installmentSecondDue,
}: InstallmentSectionProps) {
  if (!installmentEligible) {
    return (
      <p className="text-sm text-muted-foreground">
        Installment payment not applicable (balance due is ₱2,000 or less, or no balance payable).
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
        Balance exceeds ₱2,000 — eligible for 2-installment payment
      </p>
      <table className="w-full text-sm">
        <tbody>
          <tr className="even:bg-gray-50/50">
            <td className="py-2">
              <span className="text-foreground font-medium">1st Installment</span>
              <p className="text-xs text-muted-foreground mt-0.5">Due: April 15</p>
            </td>
            <td className="py-2 text-right tabular-nums text-foreground font-semibold">{formatPeso(installmentFirstDue)}</td>
          </tr>
          <tr className="even:bg-gray-50/50">
            <td className="py-2">
              <span className="text-foreground font-medium">2nd Installment</span>
              <p className="text-xs text-muted-foreground mt-0.5">Due: July 15</p>
            </td>
            <td className="py-2 text-right tabular-nums text-foreground font-semibold">{formatPeso(installmentSecondDue)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default InstallmentSection;
