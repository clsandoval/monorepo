import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ResultsSummaryProps {
  totalPenalty: number;
  mc28Penalty: number;
  boSubtotal: number;
  dataParam?: string;
}

export function ResultsSummary({
  totalPenalty,
  mc28Penalty,
  boSubtotal,
  dataParam,
}: ResultsSummaryProps) {
  return (
    <div className="space-y-4 rounded-lg border border-divider bg-white p-6">
      <div className="space-y-2">
        <p className="font-body text-sm text-gray-secondary">
          Estimated Total Penalties
        </p>
        <p className="font-display text-4xl font-bold text-charcoal">
          {formatCurrency(totalPenalty)}
        </p>
      </div>

      {(mc28Penalty > 0 || boSubtotal > 0) && (
        <div className="space-y-1 border-t border-divider pt-3">
          {mc28Penalty > 0 && (
            <div className="flex items-center justify-between font-body text-sm">
              <span className="text-gray-secondary">MC28 Penalty</span>
              <span className="text-charcoal">
                {formatCurrency(mc28Penalty)}
              </span>
            </div>
          )}
          {boSubtotal > 0 && (
            <div className="flex items-center justify-between font-body text-sm">
              <span className="text-gray-secondary">BO Penalties</span>
              <span className="text-charcoal">
                {formatCurrency(boSubtotal)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="pt-2">
        <Link href={dataParam ? `/signup?data=${dataParam}` : "/signup"}>
          <Button className="w-full bg-sec-blue text-white hover:bg-sec-blue/90 font-body">
            How do I fix this? &rarr;
          </Button>
        </Link>
      </div>
    </div>
  );
}
