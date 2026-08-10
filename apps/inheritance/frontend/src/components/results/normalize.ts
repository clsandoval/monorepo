import type { EngineOutput, InheritanceShare, HeirNarrative } from '../../types';

/**
 * Make a stored EngineOutput safe to render regardless of the engine version
 * that produced it. `cases.output_json` is a JSONB blob persisted at compute
 * time and read back weeks or months later — an older engine may not have
 * emitted `narratives`/`warnings`/`per_heir_shares`, or emitted a share without
 * `legal_basis`. The results renderer reads `.length`/`.map` on those arrays, so
 * a missing field crashed the whole page (caught only by the app error
 * boundary). Defaulting every array here means a legacy case renders what it has
 * instead of failing; it never fabricates figures — money fields are untouched.
 */
export function withOutputDefaults(output: EngineOutput): EngineOutput {
  const shares: InheritanceShare[] = Array.isArray(output.per_heir_shares)
    ? output.per_heir_shares.map((s) => ({ ...s, legal_basis: Array.isArray(s.legal_basis) ? s.legal_basis : [] }))
    : [];
  const narratives: HeirNarrative[] = Array.isArray(output.narratives)
    ? output.narratives.map((n) => ({ ...n, legal_basis: Array.isArray(n.legal_basis) ? n.legal_basis : [] }))
    : [];
  return {
    ...output,
    per_heir_shares: shares,
    narratives,
    warnings: Array.isArray(output.warnings) ? output.warnings : [],
    computation_log:
      output.computation_log && Array.isArray(output.computation_log.steps)
        ? output.computation_log
        : { steps: [], total_restarts: 0, final_scenario: output.computation_log?.final_scenario ?? '' },
  };
}
