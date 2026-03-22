import { formatCurrency } from "@/lib/utils";

interface CostRange {
  min: number;
  max: number;
}

interface CostEstimateProps {
  totalPenalties: number;
  reinstatement: {
    petitionFee: number;
    publicationEstimate: CostRange;
    professionalFeesEstimate: CostRange;
    totalEstimate: CostRange;
  };
}

interface CostRowProps {
  label: string;
  description?: string;
  value: string;
  isTotal?: boolean;
  isRange?: boolean;
}

function CostRow({ label, description, value, isTotal }: CostRowProps) {
  return (
    <tr className={isTotal ? "border-t-2 border-charcoal/20 bg-charcoal/5" : ""}>
      <td className={`px-4 py-3 ${isTotal ? "font-semibold text-charcoal" : "text-charcoal"}`}>
        <span className="font-body text-sm">{label}</span>
        {description && (
          <p className="font-body text-xs text-gray-secondary mt-0.5">{description}</p>
        )}
      </td>
      <td
        className={`px-4 py-3 text-right font-body text-sm ${
          isTotal ? "font-bold text-charcoal" : "text-charcoal"
        }`}
      >
        {value}
      </td>
    </tr>
  );
}

export function CostEstimate({ totalPenalties, reinstatement }: CostEstimateProps) {
  const { petitionFee, publicationEstimate, professionalFeesEstimate, totalEstimate } =
    reinstatement;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold text-charcoal">
          Reinstatement Cost Estimate
        </h2>
        <p className="font-body text-sm text-gray-secondary mt-1">
          Estimated total cost to restore your corporation to good standing. Ranges reflect
          market variability for professional and publication fees.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-divider">
        <table className="w-full">
          <thead>
            <tr className="border-b border-divider bg-gray-50">
              <th className="px-4 py-3 text-left font-body text-sm font-semibold text-charcoal">
                Cost Component
              </th>
              <th className="px-4 py-3 text-right font-body text-sm font-semibold text-charcoal">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <CostRow
              label="Accumulated Penalties"
              description="Computed from your filing history"
              value={formatCurrency(totalPenalties)}
            />
            <CostRow
              label="Petition Fee"
              description="Fixed SEC filing fee"
              value={formatCurrency(petitionFee)}
            />
            <CostRow
              label="Newspaper Publication"
              description="Required publication in newspaper of general circulation"
              value={`${formatCurrency(publicationEstimate.min)} – ${formatCurrency(publicationEstimate.max)}`}
            />
            <CostRow
              label="Professional Fees"
              description="Lawyer / corporate secretary (estimated)"
              value={`${formatCurrency(professionalFeesEstimate.min)} – ${formatCurrency(professionalFeesEstimate.max)}+`}
            />
            <CostRow
              label="Total Estimated Cost"
              value={`${formatCurrency(totalEstimate.min)} – ${formatCurrency(totalEstimate.max)}`}
              isTotal
            />
          </tbody>
        </table>
      </div>

      <p className="font-body text-xs text-gray-secondary">
        * Professional fees are estimates only. Actual costs depend on complexity of your
        situation and rates negotiated with your counsel.
      </p>
    </div>
  );
}
