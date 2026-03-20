/**
 * Tab 4 — Personal Properties (§4.23)
 */

import { Plus, Trash2, Briefcase } from 'lucide-react';
import type { PersonalPropertyItem, PersonalPropertySubtype, PropertyOwnership } from '@/types/estate-tax';
import { PERSONAL_PROPERTY_SUBTYPES, PROPERTY_OWNERSHIPS } from '@/types/estate-tax';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface PersonalPropertiesTabProps {
  data: PersonalPropertyItem[];
  onChange: (data: PersonalPropertyItem[]) => void;
}

const SUBTYPE_LABELS: Record<PersonalPropertySubtype, string> = {
  cash: 'Cash',
  bank_deposit: 'Bank Deposit',
  receivable: 'Receivable',
  shares: 'Shares of Stock',
  bonds: 'Bonds',
  vehicle: 'Vehicle',
  jewelry: 'Jewelry',
  other: 'Other',
};

const OWNERSHIP_LABELS: Record<PropertyOwnership, string> = {
  exclusive: 'Exclusive',
  conjugal: 'Conjugal',
  community: 'Community',
};

export function PersonalPropertiesTab({ data, onChange }: PersonalPropertiesTabProps) {
  const addProperty = () => {
    const newItem: PersonalPropertyItem = {
      id: crypto.randomUUID(),
      subtype: 'cash',
      description: '',
      fmv: 0,
      ownership: 'exclusive',
    };
    onChange([...data, newItem]);
  };

  const removeProperty = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  const updateProperty = (id: string, partial: Partial<PersonalPropertyItem>) => {
    onChange(data.map((item) => (item.id === id ? { ...item, ...partial } : item)));
  };

  return (
    <div data-testid="personal-properties-tab" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1e3a5f]">Personal Properties</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Movable property owned by the decedent at time of death.
        </p>
      </div>

      {data.length === 0 && (
        <div
          data-testid="no-personal-properties"
          className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl text-muted-foreground"
        >
          <Briefcase className="h-8 w-8 mb-3 opacity-40" />
          <p className="text-sm font-medium">No personal properties added</p>
          <p className="text-xs mt-1">Add cash, bank deposits, shares, vehicles, etc.</p>
        </div>
      )}

      <div className="space-y-4">
        {data.map((item, index) => (
          <Card key={item.id} data-testid={`personal-property-${index}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {SUBTYPE_LABELS[item.subtype]}
                  {item.description ? ` — ${item.description}` : ''}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid={`remove-personal-property-${index}`}
                  onClick={() => removeProperty(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`pp-subtype-${index}`}>Type</Label>
                  <Select
                    value={item.subtype}
                    onValueChange={(val) =>
                      updateProperty(item.id, { subtype: val as PersonalPropertySubtype })
                    }
                  >
                    <SelectTrigger id={`pp-subtype-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONAL_PROPERTY_SUBTYPES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {SUBTYPE_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`pp-ownership-${index}`}>Ownership</Label>
                  <Select
                    value={item.ownership}
                    onValueChange={(val) =>
                      updateProperty(item.id, { ownership: val as PropertyOwnership })
                    }
                  >
                    <SelectTrigger id={`pp-ownership-${index}`}>
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

              <div className="space-y-2">
                <Label htmlFor={`pp-description-${index}`}>Description</Label>
                <Input
                  id={`pp-description-${index}`}
                  value={item.description}
                  onChange={(e) => updateProperty(item.id, { description: e.target.value })}
                  placeholder="Brief description of the asset"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`pp-fmv-${index}`}>Fair Market Value (₱)</Label>
                <Input
                  id={`pp-fmv-${index}`}
                  type="number"
                  value={item.fmv}
                  onChange={(e) =>
                    updateProperty(item.id, { fmv: Number(e.target.value) || 0 })
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
        onClick={addProperty}
        data-testid="add-personal-property"
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Add Personal Property
      </Button>
    </div>
  );
}
