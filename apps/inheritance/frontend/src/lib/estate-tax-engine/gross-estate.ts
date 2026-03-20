/**
 * Estate Tax Engine — Gross Estate Computation (spec §8)
 *
 * Computes Items 29–34 of BIR Form 1801.
 * Pure function; no side effects. All monetary values in centavos (integer).
 */

import type {
  DecedentInfo,
  RealProperty,
  PersonalPropertyFinancial,
  PersonalPropertyTangible,
  TaxableTransfer,
  BusinessInterest,
  ColumnValues,
  GrossEstateResult,
} from './types';

// ── Asset collections ─────────────────────────────────────────────────────────

export interface GrossEstateAssets {
  realProperties: RealProperty[];
  personalPropertiesFinancial: PersonalPropertyFinancial[];
  personalPropertiesTangible: PersonalPropertyTangible[];
  taxableTransfers: TaxableTransfer[];
  businessInterests: BusinessInterest[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Zero ColumnValues. */
function zeroCV(): ColumnValues {
  return { exclusive: 0, conjugal: 0, total: 0 };
}

/**
 * Sum a list of items that each have an ownershipType ('exclusive' | 'conjugal') and a
 * pre-resolved amount into Column A / Column B.
 */
function sumByOwnership(
  items: Array<{ ownershipType: 'exclusive' | 'conjugal'; amount: number }>,
): ColumnValues {
  const result = zeroCV();
  for (const item of items) {
    if (item.ownershipType === 'exclusive') {
      result.exclusive += item.amount;
    } else {
      result.conjugal += item.amount;
    }
  }
  result.total = result.exclusive + result.conjugal;
  return result;
}

/**
 * Resolve the FMV for a real property.
 * Engine rule: fmv = max(fmvTaxDeclaration, fmvBir).
 * If the caller already provided a pre-computed `fmv` override, use that.
 */
function resolveRealPropertyFMV(p: RealProperty): number {
  if (p.fmv !== undefined) return p.fmv;
  return Math.max(p.fmvTaxDeclaration, p.fmvBir);
}

// ── computeGrossEstate ────────────────────────────────────────────────────────

/**
 * Compute gross estate (Items 29–34) from the filtered asset arrays.
 * The assets passed here must already exclude Sec. 87 exempt assets.
 *
 * NRA rule: Item 30 (family home) is always ₱0 for NRAs.
 */
export function computeGrossEstate(
  decedent: DecedentInfo,
  assets: GrossEstateAssets,
): GrossEstateResult {
  const {
    realProperties,
    personalPropertiesFinancial,
    personalPropertiesTangible,
    taxableTransfers,
    businessInterests,
  } = assets;

  // ── Item 29: Real Properties excluding family home ────────────────────────

  const nonFamilyHomeProps = realProperties.filter((p) => !p.isDesignatedFamilyHome);
  const item29 = sumByOwnership(
    nonFamilyHomeProps.map((p) => ({
      ownershipType: p.ownershipType,
      amount: resolveRealPropertyFMV(p),
    })),
  );

  // ── Item 30: Family Home ──────────────────────────────────────────────────
  // NRA: always 0 (family home deduction not available to NRAs per spec §8.2)
  let item30 = zeroCV();
  if (!decedent.isNRA) {
    const familyHomeProps = realProperties.filter((p) => p.isDesignatedFamilyHome);
    item30 = sumByOwnership(
      familyHomeProps.map((p) => ({
        ownershipType: p.ownershipType,
        amount: resolveRealPropertyFMV(p),
      })),
    );
  }

  // ── Item 31: Personal Properties (financial + tangible) ───────────────────

  const allPersonalItems = [
    ...personalPropertiesFinancial.map((p) => ({ ownershipType: p.ownershipType, amount: p.fmv })),
    ...personalPropertiesTangible.map((p) => ({ ownershipType: p.ownershipType, amount: p.fmv })),
  ];
  const item31 = sumByOwnership(allPersonalItems);

  // ── Item 32: Taxable Transfers ────────────────────────────────────────────
  // taxableAmount per item = max(0, fmvAtDeath - considerationReceived)
  // Ownership: use ownershipType if present, default to 'exclusive'

  const taxableTransferItems = taxableTransfers.map((t) => {
    const taxableAmount = Math.max(0, t.fmvAtDeath - t.considerationReceived);
    return {
      ownershipType: (t.ownershipType ?? 'exclusive') as 'exclusive' | 'conjugal',
      amount: taxableAmount,
    };
  });
  const item32 = sumByOwnership(taxableTransferItems);

  // ── Item 33: Business Interests ───────────────────────────────────────────
  // netEquity floored at 0

  const businessItems = businessInterests.map((b) => ({
    ownershipType: b.ownershipType,
    amount: Math.max(0, b.netEquity),
  }));
  const item33 = sumByOwnership(businessItems);

  // ── Item 34: Total Gross Estate ───────────────────────────────────────────

  const totalExclusive =
    item29.exclusive + item30.exclusive + item31.exclusive + item32.exclusive + item33.exclusive;
  const totalConjugal =
    item29.conjugal + item30.conjugal + item31.conjugal + item32.conjugal + item33.conjugal;
  const total: ColumnValues = {
    exclusive: totalExclusive,
    conjugal: totalConjugal,
    total: totalExclusive + totalConjugal,
  };

  return {
    realProperty: item29,
    familyHome: item30,
    personalProperty: item31,
    taxableTransfers: item32,
    businessInterest: item33,
    total,
  };
}
