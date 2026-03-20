/**
 * Tab 6 — Ordinary Deductions (§4.23)
 */

import { Plus, Trash2 } from 'lucide-react';
import type {
  OrdinaryDeductions,
  DeductionItem,
  VanishingDeductionProperty,
  PropertyOwnership,
} from '@/types/estate-tax';
import { getDeductionRules, PROPERTY_OWNERSHIPS } from '@/types/estate-tax';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export interface OrdinaryDeductionsTabProps {
  data: OrdinaryDeductions;
  dateOfDeath: string;
  onChange: (data: OrdinaryDeductions) => void;
}

const OWNERSHIP_LABELS: Record<PropertyOwnership, string> = {
  exclusive: 'Exclusive',
  conjugal: 'Conjugal',
  community: 'Community',
};

interface DeductionListProps {
  label: string;
  description?: string;
  items: DeductionItem[];
  testIdPrefix: string;
  addLabel: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, partial: Partial<DeductionItem>) => void;
}

function DeductionList({
  label,
  description,
  items,
  testIdPrefix,
  addLabel,
  onAdd,
  onRemove,
  onUpdate,
}: DeductionListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p
            data-testid={`${testIdPrefix}-count`}
            className="text-sm text-muted-foreground py-2 text-center"
          >
            None added.
          </p>
        )}

        {items.map((item, index) => (
          <div
            key={item.id}
            data-testid={`${testIdPrefix}-${index}`}
            className="flex items-end gap-3 p-3 rounded-lg bg-muted/30 border border-muted"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor={`${testIdPrefix}-desc-${index}`} className="text-xs text-muted-foreground">
                Description
              </Label>
              <Input
                id={`${testIdPrefix}-desc-${index}`}
                data-testid={`${testIdPrefix}-desc-${index}`}
                value={item.description}
                onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                placeholder="Brief description"
              />
            </div>
            <div className="w-36 space-y-2">
              <Label htmlFor={`${testIdPrefix}-amount-${index}`} className="text-xs text-muted-foreground">
                Amount (₱)
              </Label>
              <Input
                id={`${testIdPrefix}-amount-${index}`}
                data-testid={`${testIdPrefix}-amount-${index}`}
                type="number"
                value={item.amount}
                onChange={(e) => onUpdate(item.id, { amount: Number(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              data-testid={`remove-${testIdPrefix}-${index}`}
              onClick={() => onRemove(item.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9 p-0 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          data-testid={`add-${testIdPrefix}`}
          className="gap-2 border-dashed w-full"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

export function OrdinaryDeductionsTab({
  data,
  dateOfDeath,
  onChange,
}: OrdinaryDeductionsTabProps) {
  const deductionRules = getDeductionRules(dateOfDeath);
  const showPreTrainFields = deductionRules === 'PRE_TRAIN';

  // Helpers for simple deduction lists
  const makeAdd = (field: keyof Pick<OrdinaryDeductions, 'claimsAgainstEstate' | 'claimsAgainstInsolvent' | 'unpaidMortgages' | 'unpaidTaxes' | 'casualtyLosses' | 'publicUseTransfers'>) => () => {
    const newItem: DeductionItem = { id: crypto.randomUUID(), description: '', amount: 0 };
    onChange({ ...data, [field]: [...(data[field] as DeductionItem[]), newItem] });
  };

  const makeRemove = (field: keyof Pick<OrdinaryDeductions, 'claimsAgainstEstate' | 'claimsAgainstInsolvent' | 'unpaidMortgages' | 'unpaidTaxes' | 'casualtyLosses' | 'publicUseTransfers'>) => (id: string) => {
    onChange({ ...data, [field]: (data[field] as DeductionItem[]).filter((i) => i.id !== id) });
  };

  const makeUpdate = (field: keyof Pick<OrdinaryDeductions, 'claimsAgainstEstate' | 'claimsAgainstInsolvent' | 'unpaidMortgages' | 'unpaidTaxes' | 'casualtyLosses' | 'publicUseTransfers'>) => (id: string, partial: Partial<DeductionItem>) => {
    onChange({
      ...data,
      [field]: (data[field] as DeductionItem[]).map((i) => (i.id === id ? { ...i, ...partial } : i)),
    });
  };

  // Vanishing deduction
  const addVanishingProperty = () => {
    const newItem: VanishingDeductionProperty = {
      id: crypto.randomUUID(),
      description: '',
      priorTransferType: 'INHERITANCE',
      priorTransferDate: '',
      priorFMV: 0,
      currentFMV: 0,
      mortgageOnProperty: 0,
      priorTaxWasPaid: false,
      ownership: 'exclusive',
      isPhilippineSitus: true,
    };
    onChange({
      ...data,
      vanishingDeductionProperties: [...data.vanishingDeductionProperties, newItem],
    });
  };

  const removeVanishingProperty = (id: string) => {
    onChange({
      ...data,
      vanishingDeductionProperties: data.vanishingDeductionProperties.filter((p) => p.id !== id),
    });
  };

  const updateVanishingProperty = (id: string, partial: Partial<VanishingDeductionProperty>) => {
    onChange({
      ...data,
      vanishingDeductionProperties: data.vanishingDeductionProperties.map((p) =>
        p.id === id ? { ...p, ...partial } : p,
      ),
    });
  };

  return (
    <div data-testid="ordinary-deductions-tab" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1e3a5f]">Ordinary Deductions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Allowable deductions from the gross estate under NIRC Sec. 86(A).
        </p>
      </div>

      <DeductionList
        label="Claims Against the Estate"
        description="Obligations contracted during the decedent's lifetime."
        items={data.claimsAgainstEstate}
        testIdPrefix="claims-estate"
        addLabel="Add Claim"
        onAdd={makeAdd('claimsAgainstEstate')}
        onRemove={makeRemove('claimsAgainstEstate')}
        onUpdate={makeUpdate('claimsAgainstEstate')}
      />

      <DeductionList
        label="Claims Against Insolvent Persons"
        description="Receivables from persons who are insolvent."
        items={data.claimsAgainstInsolvent}
        testIdPrefix="claims-insolvent"
        addLabel="Add Claim"
        onAdd={makeAdd('claimsAgainstInsolvent')}
        onRemove={makeRemove('claimsAgainstInsolvent')}
        onUpdate={makeUpdate('claimsAgainstInsolvent')}
      />

      <DeductionList
        label="Unpaid Mortgages"
        description="Mortgages or indebtedness on property included in the gross estate."
        items={data.unpaidMortgages}
        testIdPrefix="unpaid-mortgages"
        addLabel="Add Mortgage"
        onAdd={makeAdd('unpaidMortgages')}
        onRemove={makeRemove('unpaidMortgages')}
        onUpdate={makeUpdate('unpaidMortgages')}
      />

      <DeductionList
        label="Unpaid Taxes"
        description="Taxes accrued before the decedent's death."
        items={data.unpaidTaxes}
        testIdPrefix="unpaid-taxes"
        addLabel="Add Tax"
        onAdd={makeAdd('unpaidTaxes')}
        onRemove={makeRemove('unpaidTaxes')}
        onUpdate={makeUpdate('unpaidTaxes')}
      />

      <DeductionList
        label="Casualty Losses"
        description="Losses not compensated by insurance after death but before settlement."
        items={data.casualtyLosses}
        testIdPrefix="casualty-losses"
        addLabel="Add Loss"
        onAdd={makeAdd('casualtyLosses')}
        onRemove={makeRemove('casualtyLosses')}
        onUpdate={makeUpdate('casualtyLosses')}
      />

      <DeductionList
        label="Transfers for Public Use"
        description="Bequests, legacies, or devises to the government for public purpose."
        items={data.publicUseTransfers}
        testIdPrefix="public-use-transfers"
        addLabel="Add Transfer"
        onAdd={makeAdd('publicUseTransfers')}
        onRemove={makeRemove('publicUseTransfers')}
        onUpdate={makeUpdate('publicUseTransfers')}
      />

      <Separator />

      {/* Vanishing Deduction */}
      <Card data-testid="vanishing-deduction-section">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Vanishing Deduction Properties</CardTitle>
          <CardDescription>
            Properties received by inheritance or gift within 5 years before the decedent's death.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.vanishingDeductionProperties.length === 0 && (
            <p
              data-testid="no-vanishing-properties"
              className="text-sm text-muted-foreground py-3 text-center"
            >
              No vanishing deduction properties added.
            </p>
          )}

          <div className="space-y-4">
            {data.vanishingDeductionProperties.map((prop, index) => (
              <Card key={prop.id} data-testid={`vanishing-property-${index}`} className="bg-muted/30 border-muted">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Property {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`remove-vanishing-property-${index}`}
                      onClick={() => removeVanishingProperty(prop.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`vd-desc-${index}`}>Description</Label>
                    <Input
                      id={`vd-desc-${index}`}
                      data-testid={`vd-desc-${index}`}
                      value={prop.description}
                      onChange={(e) =>
                        updateVanishingProperty(prop.id, { description: e.target.value })
                      }
                      placeholder="Description of property"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`vd-transfer-type-${index}`}>Prior Transfer Type</Label>
                      <Select
                        value={prop.priorTransferType}
                        onValueChange={(val) =>
                          updateVanishingProperty(prop.id, {
                            priorTransferType: val as 'INHERITANCE' | 'GIFT',
                          })
                        }
                      >
                        <SelectTrigger id={`vd-transfer-type-${index}`} data-testid={`vd-transfer-type-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INHERITANCE">Inheritance</SelectItem>
                          <SelectItem value="GIFT">Gift</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`vd-transfer-date-${index}`}>Prior Transfer Date</Label>
                      <Input
                        id={`vd-transfer-date-${index}`}
                        data-testid={`vd-transfer-date-${index}`}
                        type="date"
                        value={prop.priorTransferDate}
                        onChange={(e) =>
                          updateVanishingProperty(prop.id, { priorTransferDate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`vd-prior-fmv-${index}`}>Prior FMV (₱)</Label>
                      <Input
                        id={`vd-prior-fmv-${index}`}
                        data-testid={`vd-prior-fmv-${index}`}
                        type="number"
                        value={prop.priorFMV}
                        onChange={(e) =>
                          updateVanishingProperty(prop.id, { priorFMV: Number(e.target.value) || 0 })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`vd-current-fmv-${index}`}>Current FMV (₱)</Label>
                      <Input
                        id={`vd-current-fmv-${index}`}
                        data-testid={`vd-current-fmv-${index}`}
                        type="number"
                        value={prop.currentFMV}
                        onChange={(e) =>
                          updateVanishingProperty(prop.id, {
                            currentFMV: Number(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`vd-mortgage-${index}`}>Mortgage (₱)</Label>
                      <Input
                        id={`vd-mortgage-${index}`}
                        data-testid={`vd-mortgage-${index}`}
                        type="number"
                        value={prop.mortgageOnProperty}
                        onChange={(e) =>
                          updateVanishingProperty(prop.id, {
                            mortgageOnProperty: Number(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`vd-ownership-${index}`}>Ownership</Label>
                    <Select
                      value={prop.ownership}
                      onValueChange={(val) =>
                        updateVanishingProperty(prop.id, {
                          ownership: val as PropertyOwnership,
                        })
                      }
                    >
                      <SelectTrigger id={`vd-ownership-${index}`} data-testid={`vd-ownership-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_OWNERSHIPS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {OWNERSHIP_LABELS[o]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`vd-tax-paid-${index}`}
                        data-testid={`vd-tax-paid-${index}`}
                        checked={prop.priorTaxWasPaid}
                        onCheckedChange={(checked) =>
                          updateVanishingProperty(prop.id, { priorTaxWasPaid: !!checked })
                        }
                      />
                      <Label htmlFor={`vd-tax-paid-${index}`} className="cursor-pointer font-normal">
                        Prior tax was paid
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`vd-ph-situs-${index}`}
                        data-testid={`vd-ph-situs-${index}`}
                        checked={prop.isPhilippineSitus}
                        onCheckedChange={(checked) =>
                          updateVanishingProperty(prop.id, { isPhilippineSitus: !!checked })
                        }
                      />
                      <Label htmlFor={`vd-ph-situs-${index}`} className="cursor-pointer font-normal">
                        Philippine situs
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addVanishingProperty}
            data-testid="add-vanishing-property"
            className="gap-2 border-dashed w-full"
          >
            <Plus className="h-4 w-4" />
            Add Vanishing Deduction Property
          </Button>
        </CardContent>
      </Card>

      {/* Pre-TRAIN fields */}
      {showPreTrainFields && (
        <Card data-testid="pre-train-section" className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-blue-900">Pre-TRAIN Deductions</CardTitle>
            <CardDescription className="text-blue-700">
              Applicable only when the date of death is before January 1, 2018.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="funeral-expenses">Funeral Expenses (₱)</Label>
                <Input
                  id="funeral-expenses"
                  data-testid="funeral-expenses"
                  type="number"
                  value={data.funeralExpenses ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      funeralExpenses: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="judicial-admin-expenses">Judicial / Admin Expenses (₱)</Label>
                <Input
                  id="judicial-admin-expenses"
                  data-testid="judicial-admin-expenses"
                  type="number"
                  value={data.judicialAdminExpenses ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      judicialAdminExpenses: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
