import { Link } from '@tanstack/react-router';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EngineOutput } from '@/types';
import { EFFECTIVE_CATEGORY_LABELS, SUCCESSION_TYPE_LABELS, formatPeso } from '@/types';

interface QuickCalcResultsProps {
  output: EngineOutput;
  estateCentavos: number;
}

export function QuickCalcResults({ output, estateCentavos }: QuickCalcResultsProps) {
  return (
    <div className="mt-6 space-y-4">
      {/* Visible: Summary */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
          {SUCCESSION_TYPE_LABELS[output.succession_type]} &middot; {output.scenario_code}
        </span>
      </div>

      {/* Visible: Distribution table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Heir</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Category</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Share</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">%</th>
            </tr>
          </thead>
          <tbody>
            {output.per_heir_shares.map((share) => {
              const totalCentavos = typeof share.total.centavos === 'string'
                ? Number(share.total.centavos)
                : share.total.centavos;
              const pct = estateCentavos > 0
                ? ((totalCentavos / estateCentavos) * 100).toFixed(1)
                : '0.0';
              return (
                <tr key={share.heir_id} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{share.heir_name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{EFFECTIVE_CATEGORY_LABELS[share.heir_category]}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatPeso(share.total.centavos)}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Blurred: Detailed breakdown with overlay */}
      <div className="relative" data-testid="blur-overlay">
        <div className="blur-sm pointer-events-none select-none space-y-3">
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <h3 className="font-medium text-sm">Detailed Narrative</h3>
            {output.narratives.map((n) => (
              <p key={n.heir_id} className="text-sm text-muted-foreground">{n.text}</p>
            ))}
          </div>
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <h3 className="font-medium text-sm">Computation Log</h3>
            {output.computation_log.steps.map((s) => (
              <p key={s.step_number} className="text-xs text-muted-foreground">{s.step_name}: {s.description}</p>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
          <p className="text-sm font-medium mb-3">Create an account to see the full breakdown</p>
          <Link to="/auth" search={{ mode: 'signup' as const, redirect: '' }}>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
