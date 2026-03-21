import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PesoInput } from '@/components/shared/PesoInput';
import type { WizardFormData } from '@/types/wizard';

interface Props {
  data: Partial<WizardFormData>;
  onChange: (updates: Partial<WizardFormData>) => void;
}

function parseAmount(val: string | undefined): number {
  if (!val) return 0;
  return parseFloat(val.replace(/,/g, '')) || 0;
}

export function WS05Compensation({ data, onChange }: Props) {
  const [taxableComp, setTaxableComp] = useState<string>(data.taxableCompensation ?? '');
  const [numEmployers, setNumEmployers] = useState<string>('1');
  const [compCwt, setCompCwt] = useState<string>(data.compensationCwt ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const compAmt = parseAmount(taxableComp);
  const cwtAmt = parseAmount(compCwt);

  const showZeroCompAdvisory = taxableComp !== '' && compAmt === 0;
  const showHighCwtWarning = compAmt > 0 && cwtAmt > compAmt;
  const showMultipleEmployerAdvisory = numEmployers !== '1';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-normal">Your employment income</h2>
        <p className="text-sm text-muted-foreground mt-1">
          For mixed-income earners, your salary from employers and your business income are
          computed together for tax purposes. Your employer(s) already withheld income tax from
          your salary — enter the NET taxable compensation after all exclusions.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxable-comp">Total taxable compensation income</Label>
        <PesoInput
          id="taxable-comp"
          value={taxableComp}
          onChange={(v) => {
            setTaxableComp(v);
            setErrors((e) => ({ ...e, taxableComp: '' }));
            onChange({ taxableCompensation: v || '0.00' });
          }}
          placeholder="0.00"
        />
        <p className="text-xs text-muted-foreground">
          From your BIR Form 2316, use the amount on &apos;Gross Taxable Compensation Income&apos;
          or Item 22 — which is your gross compensation MINUS non-taxable exclusions (SSS,
          PhilHealth, Pag-IBIG employee share, 13th month pay up to ₱90,000, de minimis
          benefits). If you have multiple employers, add up all Form 2316 amounts.
        </p>
        {errors.taxableComp && <p className="text-sm text-destructive">{errors.taxableComp}</p>}
        {showZeroCompAdvisory && (
          <Alert className="border-amber-400 bg-amber-50 text-amber-900">
            <AlertDescription>
              You entered ₱0 for compensation. If you truly have no salary income, consider
              selecting &apos;Purely Self-Employed&apos; instead.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="num-employers">How many employers did you have this year?</Label>
        <Select value={numEmployers} onValueChange={setNumEmployers}>
          <SelectTrigger id="num-employers">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 employer</SelectItem>
            <SelectItem value="2">2 employers</SelectItem>
            <SelectItem value="3+">3 or more employers</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          If you had more than one employer in the tax year, enter the combined totals from all
          your Form 2316 certificates in the fields below.
        </p>
        {showMultipleEmployerAdvisory && (
          <Alert className="border-amber-400 bg-amber-50 text-amber-900">
            <AlertDescription>
              With multiple employers, your total tax withheld may exceed what a single employer
              would withhold. Make sure you combine all Form 2316 amounts.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comp-cwt">
          Total income tax withheld from your salary (from all Form 2316s)
        </Label>
        <PesoInput
          id="comp-cwt"
          value={compCwt}
          onChange={(v) => {
            setCompCwt(v);
            setErrors((e) => ({ ...e, compCwt: '' }));
            onChange({ compensationCwt: v || '0.00' });
          }}
          placeholder="0.00"
        />
        <p className="text-xs text-muted-foreground">
          From your BIR Form 2316, use Item 33 &apos;Total Taxes Withheld&apos;. If you have
          multiple Form 2316s, add the Item 33 amounts from each.
        </p>
        {errors.compCwt && <p className="text-sm text-destructive">{errors.compCwt}</p>}
        {showHighCwtWarning && (
          <Alert className="border-amber-400 bg-amber-50 text-amber-900">
            <AlertDescription>
              Tax withheld exceeds your taxable compensation. Please verify your Form 2316 figures.
            </AlertDescription>
          </Alert>
        )}
      </div>

    </div>
  );
}

export default WS05Compensation;
