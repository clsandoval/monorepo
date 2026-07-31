/**
 * Estate Tax Inputs Wizard — 8-tab container (§4.23)
 */

import { useState, useCallback } from 'react';
import { Check, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import type { EstateTaxWizardState, TabIndex } from '@/types/estate-tax';
import { TAB_NAMES, TAB_COUNT, isTabValid } from '@/types/estate-tax';
import { DecedentTab } from './tabs/DecedentTab';
import { ExecutorTab } from './tabs/ExecutorTab';
import { RealPropertiesTab } from './tabs/RealPropertiesTab';
import { PersonalPropertiesTab } from './tabs/PersonalPropertiesTab';
import { OtherAssetsTab } from './tabs/OtherAssetsTab';
import { OrdinaryDeductionsTab } from './tabs/OrdinaryDeductionsTab';
import { SpecialDeductionsTab } from './tabs/SpecialDeductionsTab';
import { FilingAmnestyTab } from './tabs/FilingAmnestyTab';
import type { AutoSaveStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface EstateTaxWizardProps {
  state: EstateTaxWizardState;
  onChange: (state: EstateTaxWizardState) => void;
  autoSaveStatus: AutoSaveStatus;
  decedentName: string;
  onBack: () => void;
  onCompute?: () => void;
}

const TAB_FULL_NAMES: readonly string[] = [
  'Decedent',
  'Executor',
  'Real Properties',
  'Personal',
  'Other Assets',
  'Deductions',
  'Special Ded.',
  'Filing',
];

/**
 * Read the wizard's starting tab out of the URL, once, at mount.
 *
 * This seam exists so a journey gate can land directly on a tab without clicking
 * through every tab before it — a real browser cannot reach into a component tree,
 * it can only set a URL. It is deliberately additive: with no `tab` search param
 * present the result is `0`, byte-identical to the previous default, so every
 * committed test is unaffected.
 *
 * The value is clamped. An out-of-range tab index would render nothing, which a
 * screenshot gate could then approve as a reference.
 */
function readInitialTab(): TabIndex {
  if (typeof window === 'undefined') return 0;

  const raw = new URLSearchParams(window.location.search).get('tab');
  const parsed = raw === null ? Number.NaN : Number.parseInt(raw, 10);
  if (Number.isInteger(parsed) && parsed >= 0 && parsed <= TAB_COUNT - 1) {
    return parsed as TabIndex;
  }
  return 0;
}

export function EstateTaxWizard({
  state,
  onChange,
  autoSaveStatus,
  decedentName,
  onBack,
  onCompute,
}: EstateTaxWizardProps) {
  const [activeTab, setActiveTab] = useState<TabIndex>(readInitialTab);

  const handleTabChange = useCallback((tab: TabIndex) => {
    setActiveTab(tab);
  }, []);

  const handleNext = useCallback(() => {
    if (activeTab < TAB_COUNT - 1) {
      setActiveTab((activeTab + 1) as TabIndex);
    }
  }, [activeTab]);

  const handleBack = useCallback(() => {
    if (activeTab > 0) {
      setActiveTab((activeTab - 1) as TabIndex);
    }
  }, [activeTab]);

  const updateState = useCallback(
    (partial: Partial<EstateTaxWizardState>) => {
      onChange({ ...state, ...partial });
    },
    [state, onChange],
  );

  const saveStatusConfig = {
    saving: { label: 'Saving...', variant: 'secondary' as const },
    saved: { label: 'Saved', variant: 'secondary' as const },
    error: { label: 'Save error', variant: 'destructive' as const },
    idle: null,
  }[autoSaveStatus];

  return (
    <div data-testid="estate-tax-wizard" className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-testid="back-to-inheritance"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inheritance Results
        </Button>

        <div className="text-center">
          <h1 className="text-base font-semibold text-[#1e3a5f]">
            Estate Tax — Estate of {decedentName}
          </h1>
          <p className="text-xs text-muted-foreground">BIR Form 1801</p>
        </div>

        <div className="min-w-[100px] flex justify-end">
          {saveStatusConfig && (
            <Badge
              variant={saveStatusConfig.variant}
              data-testid="auto-save-status"
              className="gap-1.5 text-xs"
            >
              <Save className="h-3 w-3" />
              {saveStatusConfig.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Tab strip */}
      <div className="border-b bg-white px-4 overflow-x-auto">
        <div className="flex gap-0.5 py-3 min-w-max" role="tablist">
          {TAB_NAMES.map((name, i) => {
            const valid = isTabValid(i as TabIndex, state);
            const isActive = activeTab === i;
            const isCompleted = valid && i < activeTab;

            return (
              <button
                key={i}
                role="tab"
                aria-selected={isActive}
                data-testid={`tab-${i}`}
                onClick={() => handleTabChange(i as TabIndex)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors',
                  isActive && 'bg-[#c5a44e]/10 text-[#1e3a5f] font-medium',
                  isCompleted && 'text-[#1e3a5f] font-medium',
                  !isActive && !isCompleted && 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold shrink-0',
                    isActive && 'bg-[#1e3a5f] text-white',
                    isCompleted && 'bg-[#1e3a5f] text-white',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground',
                  )}
                >
                  {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span>{name}</span>
              </button>
            );
          })}
          <span className="ml-auto flex items-center text-xs text-muted-foreground px-2 shrink-0">
            Step {activeTab + 1} of {TAB_COUNT}
          </span>
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            {activeTab === 0 && (
              <DecedentTab
                data={state.decedent}
                onChange={(decedent) => updateState({ decedent })}
              />
            )}
            {activeTab === 1 && (
              <ExecutorTab
                data={state.executor}
                onChange={(executor) => updateState({ executor })}
              />
            )}
            {activeTab === 2 && (
              <RealPropertiesTab
                data={state.realProperties}
                onChange={(realProperties) => updateState({ realProperties })}
              />
            )}
            {activeTab === 3 && (
              <PersonalPropertiesTab
                data={state.personalProperties}
                onChange={(personalProperties) => updateState({ personalProperties })}
              />
            )}
            {activeTab === 4 && (
              <OtherAssetsTab
                data={state.otherAssets}
                onChange={(otherAssets) => updateState({ otherAssets })}
              />
            )}
            {activeTab === 5 && (
              <OrdinaryDeductionsTab
                data={state.ordinaryDeductions}
                dateOfDeath={state.decedent.dateOfDeath}
                onChange={(ordinaryDeductions) => updateState({ ordinaryDeductions })}
              />
            )}
            {activeTab === 6 && (
              <SpecialDeductionsTab
                data={state.specialDeductions}
                onChange={(specialDeductions) => updateState({ specialDeductions })}
              />
            )}
            {activeTab === 7 && (
              <FilingAmnestyTab
                data={state.filing}
                onChange={(filing) => updateState({ filing })}
                onCompute={onCompute}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between px-6 py-4 border-t bg-white">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={activeTab === 0}
          data-testid="prev-tab"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={activeTab === TAB_COUNT - 1}
          data-testid="next-tab"
          className="gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
        >
          Next: {TAB_FULL_NAMES[activeTab + 1] ?? ''}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
