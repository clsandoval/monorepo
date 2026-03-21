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
      <p className="text-sm text-zinc-500">
        Installment payment not applicable (balance due is ₱2,000 or less, or no balance payable).
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
        Balance exceeds ₱2,000 — eligible for 2-installment payment
      </p>
      <table className="w-full text-sm">
        <tbody>
          <tr className="even:bg-zinc-900/30">
            <td className="py-2">
              <span className="text-zinc-50 font-medium">1st Installment</span>
              <p className="text-xs text-zinc-500 mt-0.5">Due: April 15</p>
            </td>
            <td className="py-2 text-right tabular-nums text-zinc-50 font-semibold">{formatPeso(installmentFirstDue)}</td>
          </tr>
          <tr className="even:bg-zinc-900/30">
            <td className="py-2">
              <span className="text-zinc-50 font-medium">2nd Installment</span>
              <p className="text-xs text-zinc-500 mt-0.5">Due: July 15</p>
            </td>
            <td className="py-2 text-right tabular-nums text-zinc-50 font-semibold">{formatPeso(installmentSecondDue)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default InstallmentSection;
