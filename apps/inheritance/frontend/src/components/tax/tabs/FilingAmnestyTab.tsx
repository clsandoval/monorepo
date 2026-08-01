/**
 * Tab 8 — Filing & Amnesty (§4.23)
 */

import { Calculator, AlertTriangle } from 'lucide-react';
import type { FilingData, AmnestyDeductionMode } from '@/types/estate-tax';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

export interface FilingAmnestyTabProps {
  data: FilingData;
  onChange: (data: FilingData) => void;
  onCompute?: () => void;
}

export function FilingAmnestyTab({ data, onChange, onCompute }: FilingAmnestyTabProps) {
  const update = (partial: Partial<FilingData>) => {
    onChange({ ...data, ...partial });
  };

  return (
    <div data-testid="filing-amnesty-tab" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1e3a5f]">Filing &amp; Amnesty</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure filing options and determine estate tax amnesty eligibility.
        </p>
      </div>

      {/* Filing Date */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filing Date</CardTitle>
          <CardDescription>
            The statutory deadline for this return, and how late it is, are computed from this date
            and the date of death.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assumed-filing-date">Assumed filing date</Label>
            <Input
              id="assumed-filing-date"
              data-testid="assumed-filing-date"
              type="date"
              value={data.assumedFilingDate}
              onChange={(e) => update({ assumedFilingDate: e.target.value })}
            />
            <p
              data-testid="assumed-filing-date-note"
              className="text-xs text-muted-foreground"
            >
              Left blank until you state it. The engine does not assume today&apos;s date, because a
              computation that changes with the calendar is not reproducible. While this is blank,
              the return reports the filing deadline and the lateness as undetermined.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estate Tax Amnesty */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estate Tax Amnesty</CardTitle>
          <CardDescription>
            Under RA 11213 (as extended), estates with unpaid taxes may qualify for amnesty.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="amnesty-toggle"
              data-testid="amnesty-toggle"
              checked={data.userElectsAmnesty}
              onCheckedChange={(checked) => update({ userElectsAmnesty: !!checked })}
            />
            <Label htmlFor="amnesty-toggle" className="cursor-pointer font-medium">
              Elect Estate Tax Amnesty
            </Label>
          </div>

          {data.userElectsAmnesty && (
            <div data-testid="amnesty-mode-section" className="space-y-4 mt-2">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Amnesty Deduction Mode</Label>
                <RadioGroup
                  value={data.amnestyDeductionMode}
                  onValueChange={(val) =>
                    update({ amnestyDeductionMode: val as AmnestyDeductionMode })
                  }
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors has-[[data-state=checked]]:border-[#1e3a5f] has-[[data-state=checked]]:bg-[#1e3a5f]/5">
                      <RadioGroupItem value="standard" id="amnesty-standard" className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Standard</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Full deduction regime — includes standard deduction and all allowable deductions.
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors has-[[data-state=checked]]:border-[#1e3a5f] has-[[data-state=checked]]:bg-[#1e3a5f]/5">
                      <RadioGroupItem value="narrow" id="amnesty-narrow" className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Narrow</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Minimal deductions — used when prior return was filed with declared net estate.
                        </p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Eligibility */}
              <div
                data-testid="amnesty-eligibility-section"
                className="space-y-3 p-4 rounded-lg border border-amber-200 bg-amber-50/50"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-sm font-semibold text-amber-900">Amnesty Eligibility Check</p>
                </div>
                <p className="text-xs text-amber-700">
                  Answer the following to determine if this estate qualifies for amnesty.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="tax-fully-paid"
                      data-testid="tax-fully-paid"
                      checked={data.taxFullyPaidBeforeMay2022}
                      onCheckedChange={(checked) =>
                        update({ taxFullyPaidBeforeMay2022: !!checked })
                      }
                    />
                    <Label htmlFor="tax-fully-paid" className="cursor-pointer font-normal text-sm leading-snug">
                      Estate tax was fully paid before May 2022
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="prior-return-filed"
                      data-testid="prior-return-filed"
                      checked={data.priorReturnFiled}
                      onCheckedChange={(checked) => update({ priorReturnFiled: !!checked })}
                    />
                    <Label htmlFor="prior-return-filed" className="cursor-pointer font-normal text-sm leading-snug">
                      A prior estate tax return was filed
                    </Label>
                  </div>

                  {data.priorReturnFiled && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="previously-declared-net-estate" className="text-sm">
                        Previously declared net estate (₱)
                      </Label>
                      <Input
                        id="previously-declared-net-estate"
                        data-testid="previously-declared-net-estate"
                        type="number"
                        value={data.previouslyDeclaredNetEstate ?? ''}
                        onChange={(e) =>
                          update({
                            previouslyDeclaredNetEstate: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        placeholder="0.00"
                        className="max-w-xs"
                      />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="pending-court-case"
                      data-testid="pending-court-case"
                      checked={data.hasPendingCourtCasePreAmnestyAct}
                      onCheckedChange={(checked) =>
                        update({ hasPendingCourtCasePreAmnestyAct: !!checked })
                      }
                    />
                    <Label htmlFor="pending-court-case" className="cursor-pointer font-normal text-sm leading-snug">
                      Has pending court case pre-Amnesty Act
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="unexplained-wealth"
                      data-testid="unexplained-wealth"
                      checked={data.hasUnexplainedWealthCases}
                      onCheckedChange={(checked) =>
                        update({ hasUnexplainedWealthCases: !!checked })
                      }
                    />
                    <Label htmlFor="unexplained-wealth" className="cursor-pointer font-normal text-sm leading-snug">
                      Has unexplained wealth cases
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="pending-rpc-felonies"
                      data-testid="pending-rpc-felonies"
                      checked={data.hasPendingRPCFelonies}
                      onCheckedChange={(checked) =>
                        update({ hasPendingRPCFelonies: !!checked })
                      }
                    />
                    <Label htmlFor="pending-rpc-felonies" className="cursor-pointer font-normal text-sm leading-snug">
                      Has pending RPC felonies
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filing Flags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filing Options</CardTitle>
          <CardDescription>Select all that apply to this return.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Checkbox
                id="is-amended"
                data-testid="is-amended"
                checked={data.isAmended}
                onCheckedChange={(checked) => update({ isAmended: !!checked })}
              />
              <Label htmlFor="is-amended" className="cursor-pointer font-normal">
                Amended Return
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="has-extension"
                data-testid="has-extension"
                checked={data.hasExtension}
                onCheckedChange={(checked) => update({ hasExtension: !!checked })}
              />
              <Label htmlFor="has-extension" className="cursor-pointer font-normal">
                Extension Filed
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="is-installment"
                data-testid="is-installment"
                checked={data.isInstallment}
                onCheckedChange={(checked) => update({ isInstallment: !!checked })}
              />
              <Label htmlFor="is-installment" className="cursor-pointer font-normal">
                Installment Payment
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="is-judicial"
                data-testid="is-judicial"
                checked={data.isJudicialSettlement}
                onCheckedChange={(checked) => update({ isJudicialSettlement: !!checked })}
              />
              <Label htmlFor="is-judicial" className="cursor-pointer font-normal">
                Judicial Settlement
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disqualifying Violations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Disqualifying Violations</CardTitle>
          <CardDescription>
            Check any that apply — these may disqualify the estate from amnesty.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="pcgg-violation"
                data-testid="pcgg-violation"
                checked={data.hasPcggViolation}
                onCheckedChange={(checked) => update({ hasPcggViolation: !!checked })}
              />
              <Label htmlFor="pcgg-violation" className="cursor-pointer font-normal">
                PCGG Violation (Presidential Commission on Good Government)
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="ra3019-violation"
                data-testid="ra3019-violation"
                checked={data.hasRa3019Violation}
                onCheckedChange={(checked) => update({ hasRa3019Violation: !!checked })}
              />
              <Label htmlFor="ra3019-violation" className="cursor-pointer font-normal">
                RA 3019 Violation (Anti-Graft and Corrupt Practices Act)
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="ra9160-violation"
                data-testid="ra9160-violation"
                checked={data.hasRa9160Violation}
                onCheckedChange={(checked) => update({ hasRa9160Violation: !!checked })}
              />
              <Label htmlFor="ra9160-violation" className="cursor-pointer font-normal">
                RA 9160 Violation (Anti-Money Laundering Act)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compute button */}
      {onCompute && (
        <Button
          data-testid="compute-estate-tax"
          onClick={onCompute}
          size="lg"
          className="w-full gap-3 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-base h-12"
        >
          <Calculator className="h-5 w-5" />
          Compute Estate Tax
        </Button>
      )}
    </div>
  );
}
