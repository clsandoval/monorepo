/**
 * Tab 1 — Decedent Details (§4.23)
 */

import type { DecedentDetails, MaritalStatus, PropertyRegime, WorldwideELIT } from '@/types/estate-tax';
import { MARITAL_STATUSES, PROPERTY_REGIMES } from '@/types/estate-tax';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export interface DecedentTabProps {
  data: DecedentDetails;
  onChange: (data: DecedentDetails) => void;
}

const DEFAULT_WORLDWIDE_ELIT: WorldwideELIT = {
  claimsAgainstEstate: 0,
  claimsVsInsolvent: 0,
  unpaidMortgages: 0,
  casualtyLosses: 0,
  funeralExpenses: 0,
  judicialAdminExpenses: 0,
};

const MARITAL_STATUS_LABELS: Record<string, string> = {
  single: 'Single',
  married: 'Married',
  widowed: 'Widowed',
  legally_separated: 'Legally Separated',
  annulled: 'Annulled',
};

const PROPERTY_REGIME_LABELS: Record<string, string> = {
  ACP: 'Absolute Community of Property (ACP)',
  CPG: 'Conjugal Partnership of Gains (CPG)',
  CSP: 'Complete Separation of Property (CSP)',
};

export function DecedentTab({ data, onChange }: DecedentTabProps) {
  const update = (partial: Partial<DecedentDetails>) => {
    onChange({ ...data, ...partial });
  };

  const updateElit = (partial: Partial<WorldwideELIT>) => {
    onChange({
      ...data,
      worldwideELIT: { ...(data.worldwideELIT ?? DEFAULT_WORLDWIDE_ELIT), ...partial },
    });
  };

  const showPropertyRegime = data.maritalStatus === 'married';
  const showNraFields = data.isNonResidentAlien;

  const elit = data.worldwideELIT ?? DEFAULT_WORLDWIDE_ELIT;

  return (
    <div data-testid="decedent-tab" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1e3a5f]">Decedent Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Some fields have been pre-filled from your inheritance computation.
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decedent-name">Full Name (Last, First, Middle)</Label>
            <Input
              id="decedent-name"
              data-testid="decedent-name"
              value={data.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="e.g. Cruz, Juan Dela"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="decedent-dod">Date of Death (from the case fact set)</Label>
            <Input
              id="decedent-dod"
              data-testid="decedent-dod"
              type="date"
              value={data.dateOfDeath}
              readOnly
              aria-readonly="true"
              className="bg-muted"
            />
            <p
              data-testid="decedent-dod-source"
              className="text-xs text-muted-foreground"
            >
              Entered once on the Decedent step of the succession wizard. This return reads it from
              there.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decedent-address">Address at Time of Death</Label>
            <Input
              id="decedent-address"
              data-testid="decedent-address"
              value={data.address}
              onChange={(e) => update({ address: e.target.value })}
              placeholder="Street, Barangay, City, Province"
            />
          </div>
        </CardContent>
      </Card>

      {/* Citizenship */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Citizenship</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decedent-citizenship">Citizenship Status</Label>
            <Select
              value={data.citizenship}
              onValueChange={(val) => {
                const isnra = val === 'NRA';
                update({ citizenship: val as 'Filipino' | 'NRA', isNonResidentAlien: isnra });
              }}
            >
              <SelectTrigger id="decedent-citizenship" data-testid="decedent-citizenship">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Filipino">Filipino</SelectItem>
                <SelectItem value="NRA">Non-Resident Alien (NRA)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="nra-checkbox"
              data-testid="nra-checkbox"
              checked={data.isNonResidentAlien}
              onCheckedChange={(checked) =>
                update({
                  isNonResidentAlien: !!checked,
                  citizenship: checked ? 'NRA' : 'Filipino',
                })
              }
            />
            <Label htmlFor="nra-checkbox" className="cursor-pointer font-normal">
              Non-Resident Alien (NRA)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Marital Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Marital Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={data.maritalStatus}
            onValueChange={(val) => update({ maritalStatus: val as MaritalStatus })}
            data-testid="marital-status-group"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {MARITAL_STATUSES.map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <RadioGroupItem value={status} id={`marital-${status}`} />
                  <Label htmlFor={`marital-${status}`} className="cursor-pointer font-normal">
                    {MARITAL_STATUS_LABELS[status] ?? status}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {showPropertyRegime && (
            <>
              <Separator />
              <div data-testid="property-regime-group" className="space-y-3">
                <Label className="text-sm font-medium">Property Regime</Label>
                <RadioGroup
                  value={data.propertyRegime ?? ''}
                  onValueChange={(val) => update({ propertyRegime: val as PropertyRegime })}
                >
                  <div className="space-y-2">
                    {PROPERTY_REGIMES.map((regime) => (
                      <div key={regime} className="flex items-center gap-2">
                        <RadioGroupItem value={regime} id={`regime-${regime}`} />
                        <Label htmlFor={`regime-${regime}`} className="cursor-pointer font-normal">
                          {PROPERTY_REGIME_LABELS[regime] ?? regime}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* NRA — Worldwide Estate */}
      {showNraFields && (
        <Card data-testid="nra-worldwide-section" className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-amber-900">Worldwide Estate (NRA)</CardTitle>
            <CardDescription className="text-amber-700">
              Required for Non-Resident Aliens to compute the Philippine estate tax proportionally.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="worldwide-gross-estate">Total Worldwide Gross Estate (₱)</Label>
              <Input
                id="worldwide-gross-estate"
                data-testid="worldwide-gross-estate"
                type="number"
                value={data.worldwideGrossEstate ?? ''}
                onChange={(e) =>
                  update({
                    worldwideGrossEstate: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="0.00"
              />
            </div>

            <Separator />

            <div data-testid="worldwide-elit-section" className="space-y-4">
              <p className="text-sm font-medium text-amber-900">Worldwide ELIT (Exclusions, Losses, Indebtedness, Taxes)</p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="elit-claims-estate">Claims against estate (₱)</Label>
                  <Input
                    id="elit-claims-estate"
                    data-testid="elit-claims-estate"
                    type="number"
                    value={elit.claimsAgainstEstate}
                    onChange={(e) => updateElit({ claimsAgainstEstate: Number(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="elit-claims-insolvent">Claims vs insolvent (₱)</Label>
                  <Input
                    id="elit-claims-insolvent"
                    data-testid="elit-claims-insolvent"
                    type="number"
                    value={elit.claimsVsInsolvent}
                    onChange={(e) => updateElit({ claimsVsInsolvent: Number(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="elit-unpaid-mortgages">Unpaid mortgages (₱)</Label>
                  <Input
                    id="elit-unpaid-mortgages"
                    data-testid="elit-unpaid-mortgages"
                    type="number"
                    value={elit.unpaidMortgages}
                    onChange={(e) => updateElit({ unpaidMortgages: Number(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="elit-casualty-losses">Casualty losses (₱)</Label>
                  <Input
                    id="elit-casualty-losses"
                    data-testid="elit-casualty-losses"
                    type="number"
                    value={elit.casualtyLosses}
                    onChange={(e) => updateElit({ casualtyLosses: Number(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="elit-funeral-expenses">
                    Funeral expenses (₱){' '}
                    <span className="text-xs text-muted-foreground font-normal">(pre-TRAIN only)</span>
                  </Label>
                  <Input
                    id="elit-funeral-expenses"
                    data-testid="elit-funeral-expenses"
                    type="number"
                    value={elit.funeralExpenses}
                    onChange={(e) => updateElit({ funeralExpenses: Number(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="elit-judicial-admin">
                    Judicial/admin expenses (₱){' '}
                    <span className="text-xs text-muted-foreground font-normal">(pre-TRAIN only)</span>
                  </Label>
                  <Input
                    id="elit-judicial-admin"
                    data-testid="elit-judicial-admin"
                    type="number"
                    value={elit.judicialAdminExpenses}
                    onChange={(e) => updateElit({ judicialAdminExpenses: Number(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
