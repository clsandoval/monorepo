/**
 * Tab 3 — Real Properties (§4.23)
 */

import { Plus, Trash2, Home } from 'lucide-react';
import type { RealPropertyItem, PropertyClassification, PropertyOwnership } from '@/types/estate-tax';
import { PROPERTY_CLASSIFICATIONS, PROPERTY_OWNERSHIPS } from '@/types/estate-tax';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export interface RealPropertiesTabProps {
  data: RealPropertyItem[];
  onChange: (data: RealPropertyItem[]) => void;
}

const CLASSIFICATION_LABELS: Record<PropertyClassification, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  industrial: 'Industrial',
  agricultural: 'Agricultural',
};

const OWNERSHIP_LABELS: Record<PropertyOwnership, string> = {
  exclusive: 'Exclusive',
  conjugal: 'Conjugal',
  community: 'Community',
};

export function RealPropertiesTab({ data, onChange }: RealPropertiesTabProps) {
  const addProperty = () => {
    const newItem: RealPropertyItem = {
      id: crypto.randomUUID(),
      titleNumber: '',
      taxDecNumber: '',
      location: '',
      lotArea: null,
      improvementArea: null,
      classification: 'residential',
      fmvTaxDec: 0,
      fmvBirZonal: 0,
      ownership: 'exclusive',
      isFamilyHome: false,
      hasBarangayCert: false,
    };
    onChange([...data, newItem]);
  };

  const removeProperty = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  const updateProperty = (id: string, partial: Partial<RealPropertyItem>) => {
    onChange(data.map((item) => (item.id === id ? { ...item, ...partial } : item)));
  };

  return (
    <div data-testid="real-properties-tab" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1e3a5f]">Real Properties</h2>
        <p className="text-sm text-muted-foreground mt-1">
          All real property owned by the decedent at time of death.
        </p>
      </div>

      {data.length === 0 && (
        <div
          data-testid="no-real-properties"
          className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl text-muted-foreground"
        >
          <Home className="h-8 w-8 mb-3 opacity-40" />
          <p className="text-sm font-medium">No real properties added</p>
          <p className="text-xs mt-1">Add land, buildings, or other real property here.</p>
        </div>
      )}

      <div className="space-y-4">
        {data.map((item, index) => (
          <Card key={item.id} data-testid={`real-property-${index}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Property {index + 1}
                  {item.titleNumber ? ` — TCT No. ${item.titleNumber}` : ''}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid={`remove-real-property-${index}`}
                  onClick={() => removeProperty(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title & Tax Dec */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`rp-title-${index}`}>TCT / OCT Number</Label>
                  <Input
                    id={`rp-title-${index}`}
                    value={item.titleNumber}
                    onChange={(e) => updateProperty(item.id, { titleNumber: e.target.value })}
                    placeholder="TCT No."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`rp-taxdec-${index}`}>Tax Declaration Number</Label>
                  <Input
                    id={`rp-taxdec-${index}`}
                    value={item.taxDecNumber}
                    onChange={(e) => updateProperty(item.id, { taxDecNumber: e.target.value })}
                    placeholder="ARP / TD No."
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor={`rp-location-${index}`}>Location / Address</Label>
                <Input
                  id={`rp-location-${index}`}
                  value={item.location}
                  onChange={(e) => updateProperty(item.id, { location: e.target.value })}
                  placeholder="Barangay, Municipality, Province"
                />
              </div>

              {/* Area */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`rp-lot-area-${index}`}>Lot Area (sqm)</Label>
                  <Input
                    id={`rp-lot-area-${index}`}
                    type="number"
                    value={item.lotArea ?? ''}
                    onChange={(e) =>
                      updateProperty(item.id, {
                        lotArea: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`rp-improvement-area-${index}`}>Improvement Area (sqm)</Label>
                  <Input
                    id={`rp-improvement-area-${index}`}
                    type="number"
                    value={item.improvementArea ?? ''}
                    onChange={(e) =>
                      updateProperty(item.id, {
                        improvementArea: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <Separator />

              {/* Classification & Ownership */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`rp-classification-${index}`}>Classification</Label>
                  <Select
                    value={item.classification}
                    onValueChange={(val) =>
                      updateProperty(item.id, { classification: val as PropertyClassification })
                    }
                  >
                    <SelectTrigger id={`rp-classification-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_CLASSIFICATIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {CLASSIFICATION_LABELS[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`rp-ownership-${index}`}>Ownership</Label>
                  <Select
                    value={item.ownership}
                    onValueChange={(val) =>
                      updateProperty(item.id, { ownership: val as PropertyOwnership })
                    }
                  >
                    <SelectTrigger id={`rp-ownership-${index}`}>
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
              </div>

              {/* FMV */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`rp-fmv-taxdec-${index}`}>FMV per Tax Dec (₱)</Label>
                  <Input
                    id={`rp-fmv-taxdec-${index}`}
                    type="number"
                    value={item.fmvTaxDec}
                    onChange={(e) =>
                      updateProperty(item.id, { fmvTaxDec: Number(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`rp-fmv-zonal-${index}`}>FMV per BIR Zonal Value (₱)</Label>
                  <Input
                    id={`rp-fmv-zonal-${index}`}
                    type="number"
                    value={item.fmvBirZonal}
                    onChange={(e) =>
                      updateProperty(item.id, { fmvBirZonal: Number(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <Separator />

              {/* Flags */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`rp-family-home-${index}`}
                    checked={item.isFamilyHome}
                    onCheckedChange={(checked) =>
                      updateProperty(item.id, { isFamilyHome: !!checked })
                    }
                  />
                  <Label htmlFor={`rp-family-home-${index}`} className="cursor-pointer font-normal">
                    Designated family home{' '}
                    <span className="text-xs text-muted-foreground">(max ₱10M deduction)</span>
                  </Label>
                </div>

                {item.isFamilyHome && (
                  <div className="flex items-center gap-3 ml-6">
                    <Checkbox
                      id={`rp-barangay-cert-${index}`}
                      checked={item.hasBarangayCert}
                      onCheckedChange={(checked) =>
                        updateProperty(item.id, { hasBarangayCert: !!checked })
                      }
                    />
                    <Label
                      htmlFor={`rp-barangay-cert-${index}`}
                      className="cursor-pointer font-normal"
                    >
                      Has Barangay Captain certification
                    </Label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addProperty}
        data-testid="add-real-property"
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Add Real Property
      </Button>
    </div>
  );
}
