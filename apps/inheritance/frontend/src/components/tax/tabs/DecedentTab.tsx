/**
 * Tab 1 — Decedent Details (§4.23)
 */

import type { DecedentDetails, MaritalStatus, PropertyRegime, WorldwideELIT } from '@/types/estate-tax';
import { MARITAL_STATUSES, PROPERTY_REGIMES } from '@/types/estate-tax';

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
    <div data-testid="decedent-tab">
      <h2>Decedent Details</h2>
      <p className="text-sm text-muted-foreground">
        Some fields have been pre-filled from your inheritance computation.
      </p>

      <div>
        <label htmlFor="decedent-name">Full Name (Last, First, Middle)</label>
        <input
          id="decedent-name"
          data-testid="decedent-name"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="decedent-dod">Date of Death</label>
        <input
          id="decedent-dod"
          data-testid="decedent-dod"
          value={data.dateOfDeath}
          onChange={(e) => update({ dateOfDeath: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="decedent-citizenship">Citizenship</label>
        <select
          id="decedent-citizenship"
          data-testid="decedent-citizenship"
          value={data.citizenship}
          onChange={(e) => {
            const val = e.target.value as 'Filipino' | 'NRA';
            update({ citizenship: val, isNonResidentAlien: val === 'NRA' });
          }}
        >
          <option value="Filipino">Filipino</option>
          <option value="NRA">Non-Resident Alien</option>
        </select>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            data-testid="nra-checkbox"
            checked={data.isNonResidentAlien}
            onChange={(e) =>
              update({
                isNonResidentAlien: e.target.checked,
                citizenship: e.target.checked ? 'NRA' : 'Filipino',
              })
            }
          />
          Non-Resident Alien (NRA)
        </label>
      </div>

      <div>
        <label htmlFor="decedent-address">Address at Time of Death</label>
        <input
          id="decedent-address"
          data-testid="decedent-address"
          value={data.address}
          onChange={(e) => update({ address: e.target.value })}
        />
      </div>

      <div data-testid="marital-status-group">
        <label>Marital Status</label>
        {MARITAL_STATUSES.map((status) => (
          <label key={status}>
            <input
              type="radio"
              name="maritalStatus"
              value={status}
              checked={data.maritalStatus === status}
              onChange={() => update({ maritalStatus: status as MaritalStatus })}
            />
            {status.replace('_', ' ')}
          </label>
        ))}
      </div>

      {showPropertyRegime && (
        <div data-testid="property-regime-group">
          <label>Property Regime</label>
          {PROPERTY_REGIMES.map((regime) => (
            <label key={regime}>
              <input
                type="radio"
                name="propertyRegime"
                value={regime}
                checked={data.propertyRegime === regime}
                onChange={() => update({ propertyRegime: regime as PropertyRegime })}
              />
              {regime}
            </label>
          ))}
        </div>
      )}

      {showNraFields && (
        <div data-testid="nra-worldwide-section">
          <div>
            <label htmlFor="worldwide-gross-estate">
              Total Worldwide Gross Estate (₱)
            </label>
            <input
              id="worldwide-gross-estate"
              data-testid="worldwide-gross-estate"
              type="number"
              value={data.worldwideGrossEstate ?? ''}
              onChange={(e) =>
                update({
                  worldwideGrossEstate: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>

          <fieldset data-testid="worldwide-elit-section">
            <legend>Worldwide ELIT</legend>

            <div>
              <label htmlFor="elit-claims-estate">Claims against estate (₱)</label>
              <input
                id="elit-claims-estate"
                data-testid="elit-claims-estate"
                type="number"
                value={elit.claimsAgainstEstate}
                onChange={(e) => updateElit({ claimsAgainstEstate: Number(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label htmlFor="elit-claims-insolvent">Claims vs insolvent (₱)</label>
              <input
                id="elit-claims-insolvent"
                data-testid="elit-claims-insolvent"
                type="number"
                value={elit.claimsVsInsolvent}
                onChange={(e) => updateElit({ claimsVsInsolvent: Number(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label htmlFor="elit-unpaid-mortgages">Unpaid mortgages (₱)</label>
              <input
                id="elit-unpaid-mortgages"
                data-testid="elit-unpaid-mortgages"
                type="number"
                value={elit.unpaidMortgages}
                onChange={(e) => updateElit({ unpaidMortgages: Number(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label htmlFor="elit-casualty-losses">Casualty losses (₱)</label>
              <input
                id="elit-casualty-losses"
                data-testid="elit-casualty-losses"
                type="number"
                value={elit.casualtyLosses}
                onChange={(e) => updateElit({ casualtyLosses: Number(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label htmlFor="elit-funeral-expenses">
                Funeral expenses (₱) <span className="text-sm text-muted-foreground">(pre-TRAIN only)</span>
              </label>
              <input
                id="elit-funeral-expenses"
                data-testid="elit-funeral-expenses"
                type="number"
                value={elit.funeralExpenses}
                onChange={(e) => updateElit({ funeralExpenses: Number(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label htmlFor="elit-judicial-admin">
                Judicial/admin expenses (₱) <span className="text-sm text-muted-foreground">(pre-TRAIN only)</span>
              </label>
              <input
                id="elit-judicial-admin"
                data-testid="elit-judicial-admin"
                type="number"
                value={elit.judicialAdminExpenses}
                onChange={(e) => updateElit({ judicialAdminExpenses: Number(e.target.value) || 0 })}
              />
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
