import { useState, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { Plus, X, Loader2, Calculator, UserPlus, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EngineInputSchema } from '@/schemas';
import { computeWasm } from '@/wasm/bridge';
import { pesosToCentavos } from '@/types';
import type { EngineOutput } from '@/types';
import { buildEngineInput, HEIR_TYPE_LABELS, SINGLETON_TYPES, type QuickCalcHeir, type QuickCalcHeirType } from './defaults';
import { QuickCalcResults } from './QuickCalcResults';

const SESSION_KEY = 'quick-calc-used';

const ALL_HEIR_TYPES: QuickCalcHeirType[] = [
  'SurvivingSpouse', 'LegitimateChild', 'IllegitimateChild',
  'Father', 'Mother', 'Brother', 'Sister',
];

export function QuickCalcWidget() {
  const [estatePesos, setEstatePesos] = useState('');
  const [heirs, setHeirs] = useState<QuickCalcHeir[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [computing, setComputing] = useState(false);
  const [output, setOutput] = useState<EngineOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gated, setGated] = useState(false);

  const estateCentavos = pesosToCentavos(Number(estatePesos) || 0);
  const canCalculate = estateCentavos > 0 && heirs.length > 0 && !computing;

  const disabledTypes = new Set<QuickCalcHeirType>(
    SINGLETON_TYPES.filter(t => heirs.some(h => h.type === t))
  );

  const addHeir = useCallback((type: QuickCalcHeirType) => {
    setHeirs(prev => [...prev, { type }]);
    setDropdownOpen(false);
  }, []);

  const removeHeir = useCallback((index: number) => {
    setHeirs(prev => prev.filter((_, i) => i !== index));
  }, []);

  const calculate = useCallback(async () => {
    // Session gate check
    if (sessionStorage.getItem(SESSION_KEY)) {
      setGated(true);
      return;
    }

    setError(null);
    setComputing(true);
    try {
      const input = buildEngineInput(estateCentavos, heirs);
      const validation = EngineInputSchema.safeParse(input);
      if (!validation.success) {
        setError('Invalid input. Please check your entries and try again.');
        return;
      }
      const result = await computeWasm(input);
      setOutput(result);
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      setError('Unable to load calculator. Please try again or create an account.');
    } finally {
      setComputing(false);
    }
  }, [estateCentavos, heirs]);

  // Display name for heir chip
  const heirChipLabel = (heir: QuickCalcHeir, index: number): string => {
    const sameTypeBefore = heirs.slice(0, index).filter(h => h.type === heir.type).length;
    if (SINGLETON_TYPES.includes(heir.type)) return HEIR_TYPE_LABELS[heir.type];
    return `${HEIR_TYPE_LABELS[heir.type]} ${sameTypeBefore + 1}`;
  };

  if (gated) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-sm font-medium">Create an account for unlimited calculations</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/auth" search={{ mode: 'signup' as const, redirect: '' }}>
            <Button className="gap-2"><UserPlus className="h-4 w-4" />Create Account</Button>
          </Link>
          <Link to="/auth" search={{ mode: 'signin' as const, redirect: '' }}>
            <Button variant="outline" className="gap-2"><LogIn className="h-4 w-4" />Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estate amount input */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Net Distributable Estate (PHP)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₱</span>
          <Input
            type="number"
            placeholder="Enter estate value"
            value={estatePesos}
            onChange={e => setEstatePesos(e.target.value)}
            className="pl-7"
            min={0}
          />
        </div>
      </div>

      {/* Heir chips */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Heirs</label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
          {heirs.map((heir, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {heirChipLabel(heir, i)}
              <button onClick={() => removeHeir(i)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add heir dropdown */}
        <div className="relative inline-block">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Plus className="h-3 w-3" /> Add Heir
          </Button>
          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-48 rounded-md border bg-popover shadow-md">
              {ALL_HEIR_TYPES.map(type => {
                const disabled = disabledTypes.has(type);
                return (
                  <button
                    key={type}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled}
                    data-disabled={disabled || undefined}
                    onClick={() => addHeir(type)}
                  >
                    {HEIR_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Calculate button */}
      <Button
        className="w-full gap-2"
        disabled={!canCalculate}
        onClick={calculate}
      >
        {computing ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Computing...</>
        ) : (
          <><Calculator className="h-4 w-4" />Calculate Distribution</>
        )}
      </Button>

      {/* Sign in/up links below */}
      {!output && (
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span>Already have an account?</span>
          <Link to="/auth" search={{ mode: 'signin' as const, redirect: '' }} className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      )}

      {/* Results */}
      {output && <QuickCalcResults output={output} estateCentavos={estateCentavos} />}
    </div>
  );
}
