import { createRoute, redirect, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../__root';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { loadCase, updateCaseTaxInput, updateCaseOutput } from '@/lib/cases';
import { EstateTaxWizard } from '@/components/tax/EstateTaxWizard';
import { TaxResultsPanel } from '@/components/tax/results/TaxResultsPanel';
import {
  createDefaultEstateTaxState,
  type EstateTaxWizardState,
} from '@/types/estate-tax';
import type { AutoSaveStatus } from '@/types';
import type { EngineOutput } from '@/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  computeEstateTax,
  runAdvisor,
  runSensitivity,
  type EstateTaxFullOutput,
  type Suggestion,
  type SensitivityResult,
} from '@/lib/estate-tax-engine';
import { saveTaxOutput, runTaxBridge } from '@/lib/tax-bridge';

export const caseTaxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cases/$caseId/tax',
  beforeLoad: ({ context }) => {
    const ctx = context as { auth?: { user: unknown } | undefined };
    if (!ctx.auth?.user) throw redirect({ to: '/auth', search: { mode: 'signin' as const, redirect: '/cases' } });
  },
  component: CaseTaxPage,
});

function CaseTaxPage() {
  const { caseId } = caseTaxRoute.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decedentName, setDecedentName] = useState('');
  const [taxState, setTaxState] = useState<EstateTaxWizardState>(createDefaultEstateTaxState());
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
  const [taxOutput, setTaxOutput] = useState<EstateTaxFullOutput | null>(null);
  const [previousState, setPreviousState] = useState<EstateTaxWizardState | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [sensitivityResults, setSensitivityResults] = useState<SensitivityResult[]>([]);
  const [wizardCollapsed, setWizardCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchCase() {
      try {
        const row = await loadCase(caseId);
        if (cancelled) return;
        setDecedentName(row.decedent_name ?? 'Decedent');
        if (row.tax_input_json) {
          setTaxState(row.tax_input_json as EstateTaxWizardState);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load case');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCase();
    return () => { cancelled = true; };
  }, [caseId]);

  const handleChange = useCallback(async (state: EstateTaxWizardState) => {
    setTaxState(state);
    setAutoSaveStatus('saving');
    try {
      await updateCaseTaxInput(caseId, state as object);
      setAutoSaveStatus('saved');
    } catch {
      setAutoSaveStatus('error');
    }
  }, [caseId]);

  const handleBack = useCallback(() => {
    navigate({ to: '/cases/$caseId', params: { caseId } });
  }, [caseId, navigate]);

  const runCompute = useCallback(async (stateToCompute: EstateTaxWizardState) => {
    const output = computeEstateTax(stateToCompute);

    // Save tax output
    await saveTaxOutput(caseId, output);

    // Auto-bridge: only if tax computation produced a non-zero gross estate.
    // Otherwise we'd overwrite the inheritance estate value with 0.
    const hasGrossEstate = output.item40_gross_estate > 0 || output.tax_due > 0;
    if (hasGrossEstate) {
      try {
        const row = await loadCase(caseId);
        if (row.input_json) {
          const { bridgedOutput } = await runTaxBridge(row.input_json, output);
          await updateCaseOutput(caseId, bridgedOutput as EngineOutput);
          toast('Estate tax applied — heir shares updated');
        }
      } catch {
        // Bridge failure is non-fatal — skip silently
      }
    }

    setTaxOutput(output);
    setSuggestions(runAdvisor(stateToCompute, output));
    setSensitivityResults(runSensitivity(stateToCompute, output));
    setWizardCollapsed(true);

    if (!hasGrossEstate) {
      toast('Estate tax computed (no assets entered — inheritance shares unchanged)');
    }

    return output;
  }, [caseId]);

  const handleCompute = useCallback(async () => {
    try {
      await runCompute(taxState);
    } catch (err) {
      toast.error('Failed to compute estate tax: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [taxState, runCompute]);

  const handleApply = useCallback(async (patch: Partial<EstateTaxWizardState>) => {
    setPreviousState(taxState);
    const newState = { ...taxState, ...patch };
    setTaxState(newState);
    await updateCaseTaxInput(caseId, newState as object);
    try {
      await runCompute(newState);
    } catch (err) {
      toast.error('Failed to re-compute after applying suggestion: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [taxState, caseId, runCompute]);

  const handleRevert = useCallback(async () => {
    if (!previousState) return;
    const stateToRestore = previousState;
    setPreviousState(null);
    setTaxState(stateToRestore);
    await updateCaseTaxInput(caseId, stateToRestore as object);
    try {
      await runCompute(stateToRestore);
    } catch (err) {
      toast.error('Failed to re-compute after revert: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [previousState, caseId, runCompute]);

  const handleWhatIfCompute = useCallback(
    (state: EstateTaxWizardState): EstateTaxFullOutput => {
      return computeEstateTax(state);
    },
    [],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {taxOutput ? (
        <div>
          <button
            data-testid="toggle-wizard"
            className="flex items-center gap-2 text-sm text-muted-foreground mb-2"
            onClick={() => setWizardCollapsed((c) => !c)}
          >
            {wizardCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            {wizardCollapsed ? 'Show wizard' : 'Collapse wizard'}
          </button>

          {!wizardCollapsed && (
            <EstateTaxWizard
              state={taxState}
              onChange={handleChange}
              autoSaveStatus={autoSaveStatus}
              decedentName={decedentName}
              onBack={handleBack}
              onCompute={handleCompute}
            />
          )}

          <TaxResultsPanel
            output={taxOutput}
            suggestions={suggestions}
            sensitivityResults={sensitivityResults}
            wizardState={taxState}
            onApply={handleApply}
            onRevert={previousState ? handleRevert : undefined}
            onCompute={handleWhatIfCompute}
          />
        </div>
      ) : (
        <EstateTaxWizard
          state={taxState}
          onChange={handleChange}
          autoSaveStatus={autoSaveStatus}
          decedentName={decedentName}
          onBack={handleBack}
          onCompute={handleCompute}
        />
      )}
    </div>
  );
}
