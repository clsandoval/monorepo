/**
 * Tab 7 — Special Deductions (§4.23)
 */

import { Plus, Trash2, Globe } from 'lucide-react';
import type { SpecialDeductions, ForeignTaxCreditClaim } from '@/types/estate-tax';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface SpecialDeductionsTabProps {
  data: SpecialDeductions;
  onChange: (data: SpecialDeductions) => void;
}

export function SpecialDeductionsTab({ data, onChange }: SpecialDeductionsTabProps) {
  const update = (partial: Partial<SpecialDeductions>) => {
    onChange({ ...data, ...partial });
  };

  const addForeignTaxClaim = () => {
    const newClaim: ForeignTaxCreditClaim = {
      id: crypto.randomUUID(),
      country: '',
      foreignTaxPaid: 0,
      foreignPropertyFMV: 0,
    };
    update({ foreignTaxCreditClaims: [...data.foreignTaxCreditClaims, newClaim] });
  };

  const removeForeignTaxClaim = (id: string) => {
    update({ foreignTaxCreditClaims: data.foreignTaxCreditClaims.filter((c) => c.id !== id) });
  };

  const updateForeignTaxClaim = (id: string, partial: Partial<ForeignTaxCreditClaim>) => {
    update({
      foreignTaxCreditClaims: data.foreignTaxCreditClaims.map((c) =>
        c.id === id ? { ...c, ...partial } : c,
      ),
    });
  };

  return (
    <div data-testid="special-deductions-tab" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1e3a5f]">Special Deductions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Special deductions under NIRC Sec. 86(A)(3)–(6).
        </p>
      </div>

      {/* Auto-applied deductions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Auto-Applied Deductions</CardTitle>
          <CardDescription>These are automatically computed by the engine.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-muted">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Standard Deduction</p>
              <p
                data-testid="standard-deduction"
                className="text-base font-semibold text-[#1e3a5f]"
              >
                ₱{data.standardDeduction.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Auto-applied by engine</p>
            </div>

            <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-muted">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Family Home Deduction</p>
              <p
                data-testid="family-home-deduction"
                className="text-base font-semibold text-[#1e3a5f]"
              >
                ₱{data.familyHomeDeduction.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Auto-calculated from Real Properties tab
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claimable amounts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Claimable Amounts</CardTitle>
          <CardDescription>Enter allowable amounts claimed under NIRC.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="medical-expenses">
                Medical Expenses (₱){' '}
                <span className="text-xs text-muted-foreground font-normal">within 1 year of DOD</span>
              </Label>
              <Input
                id="medical-expenses"
                data-testid="medical-expenses"
                type="number"
                value={data.medicalExpenses}
                onChange={(e) => update({ medicalExpenses: Number(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ra4917-benefits">
                RA 4917 Benefits (₱){' '}
                <span className="text-xs text-muted-foreground font-normal">retirement benefits</span>
              </Label>
              <Input
                id="ra4917-benefits"
                data-testid="ra4917-benefits"
                type="number"
                value={data.ra4917Benefits}
                onChange={(e) => update({ ra4917Benefits: Number(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Foreign Tax Credits */}
      <Card data-testid="foreign-tax-credits-section">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#1e3a5f]" />
            <CardTitle className="text-base">Foreign Tax Credits</CardTitle>
          </div>
          <CardDescription>
            Credits for estate taxes paid to foreign governments on property located outside the Philippines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.foreignTaxCreditClaims.length === 0 && (
            <p
              data-testid="no-foreign-tax-claims"
              className="text-sm text-muted-foreground py-3 text-center"
            >
              No foreign tax credit claims added.
            </p>
          )}

          <div className="space-y-3">
            {data.foreignTaxCreditClaims.map((claim, index) => (
              <Card key={claim.id} data-testid={`foreign-tax-claim-${index}`} className="bg-muted/30 border-muted">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Credit {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`remove-foreign-tax-claim-${index}`}
                      onClick={() => removeForeignTaxClaim(claim.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`ftc-country-${index}`}>Country</Label>
                    <Input
                      id={`ftc-country-${index}`}
                      data-testid={`ftc-country-${index}`}
                      value={claim.country}
                      onChange={(e) =>
                        updateForeignTaxClaim(claim.id, { country: e.target.value })
                      }
                      placeholder="e.g. United States"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`ftc-tax-paid-${index}`}>Foreign Tax Paid (₱)</Label>
                      <Input
                        id={`ftc-tax-paid-${index}`}
                        data-testid={`ftc-tax-paid-${index}`}
                        type="number"
                        value={claim.foreignTaxPaid}
                        onChange={(e) =>
                          updateForeignTaxClaim(claim.id, {
                            foreignTaxPaid: Number(e.target.value) || 0,
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`ftc-property-fmv-${index}`}>Foreign Property FMV (₱)</Label>
                      <Input
                        id={`ftc-property-fmv-${index}`}
                        data-testid={`ftc-property-fmv-${index}`}
                        type="number"
                        value={claim.foreignPropertyFMV}
                        onChange={(e) =>
                          updateForeignTaxClaim(claim.id, {
                            foreignPropertyFMV: Number(e.target.value) || 0,
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addForeignTaxClaim}
            data-testid="add-foreign-tax-claim"
            className="gap-2 border-dashed w-full"
          >
            <Plus className="h-4 w-4" />
            Add Foreign Tax Credit Claim
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
