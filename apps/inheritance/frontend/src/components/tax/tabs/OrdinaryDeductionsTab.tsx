/**
 * Tab 6 — Ordinary Deductions (§4.23)
 */

import type { OrdinaryDeductions, VanishingDeductionProperty, PropertyOwnership } from '@/types/estate-tax';
import { getDeductionRules, PROPERTY_OWNERSHIPS } from '@/types/estate-tax';

export interface OrdinaryDeductionsTabProps {
  data: OrdinaryDeductions;
  dateOfDeath: string;
  onChange: (data: OrdinaryDeductions) => void;
}

export function OrdinaryDeductionsTab({
  data,
  dateOfDeath,
  onChange,
}: OrdinaryDeductionsTabProps) {
  const deductionRules = getDeductionRules(dateOfDeath);
  const showPreTrainFields = deductionRules === 'PRE_TRAIN';

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
    <div data-testid="ordinary-deductions-tab">
      <h2>Ordinary Deductions</h2>

      <div>
        <label>Claims Against the Estate</label>
        <p data-testid="claims-estate-count">
          {data.claimsAgainstEstate.length} claim(s)
        </p>
      </div>

      <div>
        <label>Claims Against Insolvent Persons</label>
        <p data-testid="claims-insolvent-count">
          {data.claimsAgainstInsolvent.length} claim(s)
        </p>
      </div>

      <div>
        <label>Unpaid Mortgages</label>
        <p data-testid="unpaid-mortgages-count">
          {data.unpaidMortgages.length} mortgage(s)
        </p>
      </div>

      <div>
        <label>Unpaid Taxes</label>
        <p data-testid="unpaid-taxes-count">
          {data.unpaidTaxes.length} tax(es)
        </p>
      </div>

      <div>
        <label>Casualty Losses</label>
        <p data-testid="casualty-losses-count">
          {data.casualtyLosses.length} loss(es)
        </p>
      </div>

      <section data-testid="vanishing-deduction-section">
        <h3>Vanishing Deduction Properties</h3>

        {data.vanishingDeductionProperties.length === 0 && (
          <p data-testid="no-vanishing-properties">No vanishing deduction properties added.</p>
        )}

        {data.vanishingDeductionProperties.map((prop, index) => (
          <div key={prop.id} data-testid={`vanishing-property-${index}`}>
            <div>
              <label htmlFor={`vd-desc-${index}`}>Description</label>
              <input
                id={`vd-desc-${index}`}
                data-testid={`vd-desc-${index}`}
                type="text"
                value={prop.description}
                onChange={(e) => updateVanishingProperty(prop.id, { description: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor={`vd-transfer-type-${index}`}>Prior Transfer Type</label>
              <select
                id={`vd-transfer-type-${index}`}
                data-testid={`vd-transfer-type-${index}`}
                value={prop.priorTransferType}
                onChange={(e) =>
                  updateVanishingProperty(prop.id, {
                    priorTransferType: e.target.value as 'INHERITANCE' | 'GIFT',
                  })
                }
              >
                <option value="INHERITANCE">Inheritance</option>
                <option value="GIFT">Gift</option>
              </select>
            </div>

            <div>
              <label htmlFor={`vd-transfer-date-${index}`}>Prior Transfer Date (YYYY-MM-DD)</label>
              <input
                id={`vd-transfer-date-${index}`}
                data-testid={`vd-transfer-date-${index}`}
                type="text"
                value={prop.priorTransferDate}
                onChange={(e) =>
                  updateVanishingProperty(prop.id, { priorTransferDate: e.target.value })
                }
              />
            </div>

            <div>
              <label htmlFor={`vd-prior-fmv-${index}`}>Prior FMV (₱)</label>
              <input
                id={`vd-prior-fmv-${index}`}
                data-testid={`vd-prior-fmv-${index}`}
                type="number"
                value={prop.priorFMV}
                onChange={(e) =>
                  updateVanishingProperty(prop.id, { priorFMV: Number(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <label htmlFor={`vd-current-fmv-${index}`}>Current FMV (₱)</label>
              <input
                id={`vd-current-fmv-${index}`}
                data-testid={`vd-current-fmv-${index}`}
                type="number"
                value={prop.currentFMV}
                onChange={(e) =>
                  updateVanishingProperty(prop.id, { currentFMV: Number(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <label htmlFor={`vd-mortgage-${index}`}>Mortgage on Property (₱)</label>
              <input
                id={`vd-mortgage-${index}`}
                data-testid={`vd-mortgage-${index}`}
                type="number"
                value={prop.mortgageOnProperty}
                onChange={(e) =>
                  updateVanishingProperty(prop.id, {
                    mortgageOnProperty: Number(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  data-testid={`vd-tax-paid-${index}`}
                  checked={prop.priorTaxWasPaid}
                  onChange={(e) =>
                    updateVanishingProperty(prop.id, { priorTaxWasPaid: e.target.checked })
                  }
                />
                Prior tax was paid
              </label>
            </div>

            <div>
              <label htmlFor={`vd-ownership-${index}`}>Ownership</label>
              <select
                id={`vd-ownership-${index}`}
                data-testid={`vd-ownership-${index}`}
                value={prop.ownership}
                onChange={(e) =>
                  updateVanishingProperty(prop.id, {
                    ownership: e.target.value as PropertyOwnership,
                  })
                }
              >
                {PROPERTY_OWNERSHIPS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  data-testid={`vd-ph-situs-${index}`}
                  checked={prop.isPhilippineSitus}
                  onChange={(e) =>
                    updateVanishingProperty(prop.id, { isPhilippineSitus: e.target.checked })
                  }
                />
                Philippine Situs
              </label>
            </div>

            <button
              data-testid={`remove-vanishing-property-${index}`}
              onClick={() => removeVanishingProperty(prop.id)}
            >
              Remove
            </button>
          </div>
        ))}

        <button data-testid="add-vanishing-property" onClick={addVanishingProperty}>
          Add Vanishing Deduction Property
        </button>
      </section>

      {showPreTrainFields && (
        <div data-testid="pre-train-section">
          <div>
            <label htmlFor="funeral-expenses">Funeral Expenses</label>
            <input
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
            />
          </div>

          <div>
            <label htmlFor="judicial-admin-expenses">
              Judicial/Administration Expenses
            </label>
            <input
              id="judicial-admin-expenses"
              data-testid="judicial-admin-expenses"
              type="number"
              value={data.judicialAdminExpenses ?? ''}
              onChange={(e) =>
                onChange({
                  ...data,
                  judicialAdminExpenses: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
