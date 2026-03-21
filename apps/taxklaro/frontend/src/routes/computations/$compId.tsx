import { useState, useEffect, useCallback } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { authenticatedRoute } from '../__root';
import { authGuard } from '../../lib/auth-guard';
import { loadComputation, updateComputationInput, saveComputationOutput } from '../../lib/computations';
import { CenteredColumn } from '../../components/layout/CenteredColumn';
import { AccordionWizard } from '../../components/computation/AccordionWizard';
import { ResultsView } from '../../components/computation/ResultsView';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { useSaveStatus } from '../../lib/save-status-context';
import { useCompute } from '../../hooks/useCompute';
import { createDefaultTaxpayerInput } from '../../types/engine-input';
import type { WizardFormData } from '../../types/wizard';
import type { ComputationRow } from '../../types/org';
import type { TaxComputationResult } from '../../types/engine-output';
import type { TaxpayerInput } from '../../types/engine-input';

export const ComputationsCompIdRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/computations/$compId',
  beforeLoad: authGuard,
  component: ComputationDetailPage,
});

function ComputationDetailPage() {
  const { compId } = ComputationsCompIdRoute.useParams();
  const navigate = useNavigate();
  const { setStatus } = useSaveStatus();
  const { result: computeResult, errors: computeErrors, isComputing, runCompute } = useCompute();

  const [computation, setComputation] = useState<ComputationRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<WizardFormData>>({});
  const [liveResult, setLiveResult] = useState<TaxComputationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'results'>('input');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const row = await loadComputation(compId);
      if (cancelled) return;
      if (!row) {
        setError('Computation not found');
      } else {
        setComputation(row);
        setFormData((row.inputJson as Partial<WizardFormData>) ?? {});
        const output = row.outputJson as TaxComputationResult | null;
        setLiveResult(output);
        // Start on results tab if there are results
        if (output) setActiveTab('results');
      }
      setIsLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [compId]);

  // Sync computeResult from useCompute into liveResult
  useEffect(() => {
    if (computeResult) {
      setLiveResult(computeResult);
      setActiveTab('results');
    }
  }, [computeResult]);

  // Auto-save on formData changes (debounced)
  useEffect(() => {
    if (!computation) return;
    const timer = setTimeout(async () => {
      setStatus('saving');
      const { error: saveError } = await updateComputationInput(
        computation.id,
        formData as TaxpayerInput,
      );
      setStatus(saveError ? 'error' : 'saved');
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, computation, setStatus]);

  const handleChange = useCallback((updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleCompute = useCallback(async () => {
    if (!computation) return;
    const defaults = createDefaultTaxpayerInput();
    const { clientId: _clientId, computationTitle: _title, ...wizardFields } = formData as WizardFormData;
    const engineInput: TaxpayerInput = {
      ...defaults,
      ...wizardFields,
      itemizedExpenses: {
        ...defaults.itemizedExpenses,
        ...(wizardFields.itemizedExpenses ?? {}),
      },
    };

    const wasmResult = await runCompute(engineInput);

    if (wasmResult.status === 'ok') {
      setStatus('saving');
      const { error: saveError } = await saveComputationOutput(computation.id, wasmResult.data);
      setStatus(saveError ? 'error' : 'saved');
      if (!saveError) {
        setComputation((prev) => prev ? { ...prev, status: 'computed', outputJson: wasmResult.data } : prev);
      }
    }
  }, [formData, computation, runCompute, setStatus]);

  if (isLoading) {
    return (
      <CenteredColumn wide>
        <div className="animate-pulse space-y-4" data-testid="computation-detail-page">
          <div className="h-8 bg-zinc-800 rounded w-1/3" />
          <div className="h-64 bg-zinc-800 rounded" />
        </div>
      </CenteredColumn>
    );
  }

  if (error || !computation) {
    return (
      <CenteredColumn wide>
        <div className="text-center space-y-4" data-testid="computation-detail-page">
          <p className="text-zinc-400">{error ?? 'Computation not found'}</p>
          <button
            className="text-sm text-zinc-300 hover:text-zinc-50 underline underline-offset-2 transition-colors"
            onClick={() => navigate({ to: '/computations' })}
          >
            ← Back to Computations
          </button>
        </div>
      </CenteredColumn>
    );
  }

  const displayResult = liveResult ?? (computation.outputJson as TaxComputationResult | null);

  return (
    <CenteredColumn wide>
      {/* Page heading */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="space-y-1.5 min-w-0">
          <h1
            className="text-zinc-50 truncate"
            style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--text-h1-lh)' }}
          >
            {computation.title || 'Untitled Computation'}
          </h1>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-sm text-zinc-400">Tax Year {computation.taxYear}</span>
            <Badge
              variant={
                computation.status === 'computed' || computation.status === 'finalized'
                  ? 'default'
                  : 'secondary'
              }
              className={`capitalize text-xs ${
                computation.status === 'computed' || computation.status === 'finalized'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : ''
              }`}
            >
              {computation.status}
            </Badge>
          </div>
        </div>
        <button
          className="inline-flex items-center py-2 text-sm text-zinc-400 hover:text-zinc-50 underline underline-offset-2 shrink-0 transition-colors"
          onClick={() => navigate({ to: '/computations' })}
        >
          ← Back
        </button>
      </div>

      {/* Underline tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'input' | 'results')}
      >
        <TabsList variant="line">
          <TabsTrigger value="input">Input</TabsTrigger>
          <TabsTrigger value="results">
            Results
            {displayResult && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-green-600 w-1.5 h-1.5" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="pt-6">
          {computeErrors.length > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 mb-6">
              {computeErrors.map((e, i) => (
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
        </TabsContent>

        <TabsContent value="results" className="pt-6">
          {displayResult ? (
            <ResultsView result={displayResult} />
          ) : (
            <div className="rounded-xl border border-zinc-800 p-10 text-center text-zinc-400">
              <p className="text-[0.9375rem]">This computation has not been run yet.</p>
              <p className="text-sm mt-1 text-zinc-500">
                Switch to the Input tab and click Compute to generate results.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </CenteredColumn>
  );
}
