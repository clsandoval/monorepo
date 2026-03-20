/**
 * Tab 5 — Other Assets (§4.23)
 */

import { Plus, Trash2, ArrowRightLeft, Building2, Shield } from 'lucide-react';
import type { OtherAssets, TaxableTransfer, BusinessInterest, ExemptAsset, TaxableTransferType } from '@/types/estate-tax';
import { TAXABLE_TRANSFER_TYPES } from '@/types/estate-tax';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export interface OtherAssetsTabProps {
  data: OtherAssets;
  onChange: (data: OtherAssets) => void;
}

const TRANSFER_TYPE_LABELS: Record<TaxableTransferType, string> = {
  CONTEMPLATION_OF_DEATH: 'Contemplation of Death',
  REVOCABLE: 'Revocable Transfer',
  POWER_OF_APPOINTMENT: 'Power of Appointment',
  LIFE_INSURANCE: 'Life Insurance (Estate Beneficiary)',
  INSUFFICIENT_CONSIDERATION: 'Insufficient Consideration',
};

export function OtherAssetsTab({ data, onChange }: OtherAssetsTabProps) {
  // Taxable Transfers
  const addTaxableTransfer = () => {
    const newItem: TaxableTransfer = {
      id: crypto.randomUUID(),
      type: 'CONTEMPLATION_OF_DEATH',
      description: '',
      fmv: 0,
    };
    onChange({ ...data, taxableTransfers: [...data.taxableTransfers, newItem] });
  };

  const removeTaxableTransfer = (id: string) => {
    onChange({ ...data, taxableTransfers: data.taxableTransfers.filter((t) => t.id !== id) });
  };

  const updateTaxableTransfer = (id: string, partial: Partial<TaxableTransfer>) => {
    onChange({
      ...data,
      taxableTransfers: data.taxableTransfers.map((t) => (t.id === id ? { ...t, ...partial } : t)),
    });
  };

  // Business Interests
  const addBusinessInterest = () => {
    const newItem: BusinessInterest = {
      id: crypto.randomUUID(),
      businessName: '',
      description: '',
      fmv: 0,
    };
    onChange({ ...data, businessInterests: [...data.businessInterests, newItem] });
  };

  const removeBusinessInterest = (id: string) => {
    onChange({ ...data, businessInterests: data.businessInterests.filter((b) => b.id !== id) });
  };

  const updateBusinessInterest = (id: string, partial: Partial<BusinessInterest>) => {
    onChange({
      ...data,
      businessInterests: data.businessInterests.map((b) => (b.id === id ? { ...b, ...partial } : b)),
    });
  };

  // Exempt Assets
  const addExemptAsset = () => {
    const newItem: ExemptAsset = {
      id: crypto.randomUUID(),
      description: '',
      fmv: 0,
      legalBasis: '',
    };
    onChange({ ...data, exemptAssets: [...data.exemptAssets, newItem] });
  };

  const removeExemptAsset = (id: string) => {
    onChange({ ...data, exemptAssets: data.exemptAssets.filter((e) => e.id !== id) });
  };

  const updateExemptAsset = (id: string, partial: Partial<ExemptAsset>) => {
    onChange({
      ...data,
      exemptAssets: data.exemptAssets.map((e) => (e.id === id ? { ...e, ...partial } : e)),
    });
  };

  return (
    <div data-testid="other-assets-tab" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1e3a5f]">Other Assets</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Taxable transfers, business interests, and exempt assets under Section 87.
        </p>
      </div>

      {/* Taxable Transfers */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-[#1e3a5f]" />
            <CardTitle className="text-base">Taxable Transfers</CardTitle>
          </div>
          <CardDescription>
            Transfers made during the decedent's lifetime that are included in the gross estate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.taxableTransfers.length === 0 && (
            <p
              data-testid="taxable-transfer-count"
              className="text-sm text-muted-foreground py-3 text-center"
            >
              No taxable transfers added.
            </p>
          )}

          <div className="space-y-3">
            {data.taxableTransfers.map((item, index) => (
              <Card key={item.id} className="bg-muted/30 border-muted">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Transfer {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTaxableTransfer(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`tt-type-${index}`}>Transfer Type</Label>
                    <Select
                      value={item.type}
                      onValueChange={(val) =>
                        updateTaxableTransfer(item.id, { type: val as TaxableTransferType })
                      }
                    >
                      <SelectTrigger id={`tt-type-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAXABLE_TRANSFER_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {TRANSFER_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`tt-desc-${index}`}>Description</Label>
                    <Input
                      id={`tt-desc-${index}`}
                      value={item.description}
                      onChange={(e) =>
                        updateTaxableTransfer(item.id, { description: e.target.value })
                      }
                      placeholder="Brief description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`tt-fmv-${index}`}>Fair Market Value (₱)</Label>
                    <Input
                      id={`tt-fmv-${index}`}
                      type="number"
                      value={item.fmv}
                      onChange={(e) =>
                        updateTaxableTransfer(item.id, { fmv: Number(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addTaxableTransfer}
            data-testid="add-taxable-transfer"
            className="gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Add Taxable Transfer
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Business Interests */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#1e3a5f]" />
            <CardTitle className="text-base">Business Interests</CardTitle>
          </div>
          <CardDescription>
            Partnership interests, sole proprietorships, and other business holdings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.businessInterests.length === 0 && (
            <p
              data-testid="business-interest-count"
              className="text-sm text-muted-foreground py-3 text-center"
            >
              No business interests added.
            </p>
          )}

          <div className="space-y-3">
            {data.businessInterests.map((item, index) => (
              <Card key={item.id} className="bg-muted/30 border-muted">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Interest {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBusinessInterest(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`bi-name-${index}`}>Business Name</Label>
                    <Input
                      id={`bi-name-${index}`}
                      value={item.businessName}
                      onChange={(e) =>
                        updateBusinessInterest(item.id, { businessName: e.target.value })
                      }
                      placeholder="Entity name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`bi-desc-${index}`}>Description / Nature of Interest</Label>
                    <Input
                      id={`bi-desc-${index}`}
                      value={item.description}
                      onChange={(e) =>
                        updateBusinessInterest(item.id, { description: e.target.value })
                      }
                      placeholder="e.g. 50% partnership interest"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`bi-fmv-${index}`}>Fair Market Value (₱)</Label>
                    <Input
                      id={`bi-fmv-${index}`}
                      type="number"
                      value={item.fmv}
                      onChange={(e) =>
                        updateBusinessInterest(item.id, { fmv: Number(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addBusinessInterest}
            data-testid="add-business-interest"
            className="gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Add Business Interest
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Exempt Assets */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#1e3a5f]" />
            <CardTitle className="text-base">Exempt Assets (Sec. 87)</CardTitle>
          </div>
          <CardDescription>
            Assets excluded from the gross estate by law (e.g., merger of usufruct, GSIS proceeds).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.exemptAssets.length === 0 && (
            <p
              data-testid="exempt-asset-count"
              className="text-sm text-muted-foreground py-3 text-center"
            >
              No exempt assets added.
            </p>
          )}

          <div className="space-y-3">
            {data.exemptAssets.map((item, index) => (
              <Card key={item.id} className="bg-muted/30 border-muted">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Asset {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExemptAsset(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`ea-desc-${index}`}>Description</Label>
                    <Input
                      id={`ea-desc-${index}`}
                      value={item.description}
                      onChange={(e) =>
                        updateExemptAsset(item.id, { description: e.target.value })
                      }
                      placeholder="Description of exempt asset"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`ea-basis-${index}`}>Legal Basis</Label>
                    <Input
                      id={`ea-basis-${index}`}
                      value={item.legalBasis}
                      onChange={(e) =>
                        updateExemptAsset(item.id, { legalBasis: e.target.value })
                      }
                      placeholder="e.g. Sec. 87(A), RA 8291"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`ea-fmv-${index}`}>Fair Market Value (₱)</Label>
                    <Input
                      id={`ea-fmv-${index}`}
                      type="number"
                      value={item.fmv}
                      onChange={(e) =>
                        updateExemptAsset(item.id, { fmv: Number(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addExemptAsset}
            data-testid="add-exempt-asset"
            className="gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Add Exempt Asset
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
