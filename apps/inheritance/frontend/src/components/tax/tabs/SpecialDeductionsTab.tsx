/**
 * Tab 7 — Special Deductions (§4.23)
 */

import type { SpecialDeductions, ForeignTaxCreditClaim } from '@/types/estate-tax';

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
    <div data-testid="special-deductions-tab">
      <h2>Special Deductions</h2>

      <div>
        <label htmlFor="medical-expenses">Medical Expenses (within 1 year of DOD)</label>
        <input
          id="medical-expenses"
          data-testid="medical-expenses"
          type="number"
          value={data.medicalExpenses}
          onChange={(e) => update({ medicalExpenses: Number(e.target.value) || 0 })}
        />
      </div>

      <div>
        <label htmlFor="ra4917-benefits">RA 4917 Benefits</label>
        <input
          id="ra4917-benefits"
          data-testid="ra4917-benefits"
          type="number"
          value={data.ra4917Benefits}
          onChange={(e) => update({ ra4917Benefits: Number(e.target.value) || 0 })}
        />
      </div>

      <section data-testid="foreign-tax-credits-section">
        <h3>Foreign Tax Credits</h3>

        {data.foreignTaxCreditClaims.length === 0 && (
          <p data-testid="no-foreign-tax-claims">No foreign tax credit claims added.</p>
        )}

        {data.foreignTaxCreditClaims.map((claim, index) => (
          <div key={claim.id} data-testid={`foreign-tax-claim-${index}`}>
            <div>
              <label htmlFor={`ftc-country-${index}`}>Country</label>
              <input
                id={`ftc-country-${index}`}
                data-testid={`ftc-country-${index}`}
                type="text"
                value={claim.country}
                onChange={(e) => updateForeignTaxClaim(claim.id, { country: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor={`ftc-tax-paid-${index}`}>Foreign Tax Paid (₱)</label>
              <input
                id={`ftc-tax-paid-${index}`}
                data-testid={`ftc-tax-paid-${index}`}
                type="number"
                value={claim.foreignTaxPaid}
                onChange={(e) =>
                  updateForeignTaxClaim(claim.id, {
                    foreignTaxPaid: Number(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <label htmlFor={`ftc-property-fmv-${index}`}>Foreign Property FMV (₱)</label>
              <input
                id={`ftc-property-fmv-${index}`}
                data-testid={`ftc-property-fmv-${index}`}
                type="number"
                value={claim.foreignPropertyFMV}
                onChange={(e) =>
                  updateForeignTaxClaim(claim.id, {
                    foreignPropertyFMV: Number(e.target.value) || 0,
                  })
                }
              />
            </div>

            <button
              data-testid={`remove-foreign-tax-claim-${index}`}
              onClick={() => removeForeignTaxClaim(claim.id)}
            >
              Remove
            </button>
          </div>
        ))}

        <button data-testid="add-foreign-tax-claim" onClick={addForeignTaxClaim}>
          Add Foreign Tax Credit Claim
        </button>
      </section>

      <div>
        <label>Standard Deduction</label>
        <p data-testid="standard-deduction">₱{data.standardDeduction.toLocaleString()}</p>
        <span className="text-sm text-muted-foreground">
          Auto-applied by engine (₱5,000,000)
        </span>
      </div>

      <div>
        <label>Family Home Deduction</label>
        <p data-testid="family-home-deduction">
          ₱{data.familyHomeDeduction.toLocaleString()}
        </p>
        <span className="text-sm text-muted-foreground">
          Auto-calculated from Real Properties tab
        </span>
      </div>
    </div>
  );
}
