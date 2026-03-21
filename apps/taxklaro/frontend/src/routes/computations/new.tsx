import { useState, useCallback } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { authenticatedRoute } from '../__root';
import { authGuard } from '../../lib/auth-guard';
import { CenteredColumn } from '../../components/layout/CenteredColumn';
import { AccordionWizard } from '../../components/computation/AccordionWizard';
import type { WizardFormData } from '../../types/wizard';
import { DEFAULT_WIZARD_DATA } from '../../types/wizard';
import { createDefaultTaxpayerInput } from '../../types/engine-input';
import type { TaxpayerInput } from '../../types/engine-input';
import { useCompute } from '../../hooks/useCompute';
import { useOrganization } from '../../hooks/useOrganization';
import { createComputation, saveComputationOutput } from '../../lib/computations';
import { ResultsView } from '../../components/computation/ResultsView';

export const ComputationsNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/computations/new',
  beforeLoad: authGuard,
  component: ComputationsNewPage,
});

function ComputationsNewPage() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const [formData, setFormData] = useState<Partial<WizardFormData>>({ ...DEFAULT_WIZARD_DATA });
  const [savedCompId, setSavedCompId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { result, errors, isComputing, runCompute } = useCompute();

  const handleChange = useCallback((updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleCompute = useCallback(async () => {
    setSaveError(null);
    const defaults = createDefaultTaxpayerInput();
    const { clientId, computationTitle, ...wizardFields } = formData as WizardFormData;
    const engineInput: TaxpayerInput = {
      ...defaults,
      ...wizardFields,
      itemizedExpenses: {
        ...defaults.itemizedExpenses,
        ...(wizardFields.itemizedExpenses ?? {}),
      },
    };

    // Create computation record in Supabase
    let compId: string | null = null;
    if (orgId) {
      const record = await createComputation(
        orgId,
        clientId ?? null,
        computationTitle || 'Untitled Computation',
        engineInput,
      );
      if (record) {
        compId = record.id;
        setSavedCompId(compId);
      } else {
        setSaveError('Failed to save computation record.');
      }
    }

    // Run WASM computation
    const wasmResult = await runCompute(engineInput);

    // Persist output if computation succeeded and we have a record
    if (compId && wasmResult.status === 'ok') {
      const { error } = await saveComputationOutput(compId, wasmResult.data);
      if (error) {
        setSaveError('Computation succeeded but failed to save results.');
      }
    }
  }, [formData, runCompute, orgId]);

  // Show results after computation
  if (result) {
    return (
      <CenteredColumn wide>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Computation Results</h1>
          <div className="flex items-center gap-4">
            {savedCompId && (
              <button
                className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
                onClick={() => navigate({ to: '/computations/$compId', params: { compId: savedCompId } })}
              >
                View Details
              </button>
            )}
            <button
              className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
              onClick={() => navigate({ to: '/computations' })}
            >
              Back to Computations
            </button>
          </div>
        </div>
        {saveError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 mb-6">
            {saveError}
          </div>
        )}
        <ResultsView result={result} />
      </CenteredColumn>
    );
  }

  return (
    <CenteredColumn>
      <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">New Computation</div>
      <h1 className="text-2xl font-semibold mb-8">Tell us about this taxpayer</h1>

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 mb-6">
          {errors.map((e, i) => (
            <p key={i}>{e.message}</p>
          ))}
        </div>
      )}

      <AccordionWizard
        data={formData}
        onChange={handleChange}
        onCompute={handleCompute}
        computing={isComputing}
      />
    </CenteredColumn>
  );
}
