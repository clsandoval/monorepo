/**
 * Tests for Ordinary Deductions — spec §9
 *
 * Field mapping (types.ts OrdinaryDeductionsResult vs spec §9):
 *   item5a_standard_deduction   → standard deduction (auto-applied in ordinary schedule)
 *   item5b_claims_against_estate → spec §9.2 claims against estate (5A)
 *   item5c_claims_vs_insolvent  → spec §9.3 claims vs insolvent (5B)
 *   item5d_unpaid_mortgages     → spec §9.4 unpaid mortgages (5C part 1)
 *   item5e_unpaid_taxes         → spec §9.4 unpaid taxes (5C part 2)
 *   item5f_casualty_losses      → spec §9.5 casualty losses (5D)
 *   item5g_vanishing_deduction  → spec §9.6 vanishing deduction (5E)
 *   item5h_transfers_for_public_use → spec §9.7 public use transfers (5F)
 *
 * Funeral (5G) and judicial (5H) are handled in Module 2 (special deductions).
 */

import { describe, it, expect } from 'vitest';
import {
  computeClaimsAgainstEstate,
  computeClaimsVsInsolvent,
  computeUnpaidMortgagesAndTaxes,
  computeCasualtyLosses,
  computeVanishingDeduction,
  computePublicUseTransfers,
  computeFuneralExpenses,
  computeJudicialAdminExpenses,
  computeOrdinaryDeductions,
} from '../ordinary-deductions';
import type {
  ClaimAgainstEstate,
  ClaimVsInsolvent,
  UnpaidMortgage,
  UnpaidTax,
  CasualtyLoss,
  VanishingDeductionProperty,
  PublicUseTransfer,
  FuneralExpense,
  JudicialAdminExpense,
} from '../types';

// ── §9.2 Claims Against Estate ─────────────────────────────────────────────

describe('computeClaimsAgainstEstate', () => {
  it('happy path: exclusive + conjugal claims', () => {
    const claims: ClaimAgainstEstate[] = [
      { description: 'Personal loan', ownershipType: 'exclusive', amount: 10_000_000 },
      { description: 'Joint credit card', ownershipType: 'conjugal', amount: 5_000_000 },
    ];
    const result = computeClaimsAgainstEstate(claims);
    expect(result.exclusive).toBe(10_000_000);
    expect(result.conjugal).toBe(5_000_000);
    expect(result.total).toBe(15_000_000);
  });

  it('empty claims returns zeros', () => {
    expect(computeClaimsAgainstEstate([])).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
  });

  it('multiple exclusive claims summed', () => {
    const claims: ClaimAgainstEstate[] = [
      { description: 'Loan 1', ownershipType: 'exclusive', amount: 2_000_000 },
      { description: 'Loan 2', ownershipType: 'exclusive', amount: 3_000_000 },
    ];
    const result = computeClaimsAgainstEstate(claims);
    expect(result.exclusive).toBe(5_000_000);
    expect(result.conjugal).toBe(0);
    expect(result.total).toBe(5_000_000);
  });
});

// ── §9.3 Claims vs Insolvent ────────────────────────────────────────────────

describe('computeClaimsVsInsolvent', () => {
  it('happy path: deducts amounts (treated as exclusive)', () => {
    const claims: ClaimVsInsolvent[] = [
      { description: 'Receivable from debtor A', amount: 3_000_000 },
    ];
    const result = computeClaimsVsInsolvent(claims);
    expect(result.exclusive).toBe(3_000_000);
    expect(result.total).toBe(3_000_000);
  });

  it('empty returns zeros', () => {
    expect(computeClaimsVsInsolvent([])).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
  });

  it('multiple insolvent claims summed', () => {
    const claims: ClaimVsInsolvent[] = [
      { description: 'Debtor A', amount: 1_000_000 },
      { description: 'Debtor B', amount: 2_000_000 },
    ];
    const result = computeClaimsVsInsolvent(claims);
    expect(result.total).toBe(3_000_000);
  });
});

// ── §9.4 Unpaid Mortgages and Taxes ────────────────────────────────────────

describe('computeUnpaidMortgagesAndTaxes', () => {
  it('combines mortgages + taxes by ownership', () => {
    const mortgages: UnpaidMortgage[] = [
      { description: 'BPI mortgage', ownershipType: 'conjugal', amount: 10_000_000 },
    ];
    const taxes: UnpaidTax[] = [
      { description: 'Income tax', amount: 2_000_000 },
    ];
    const result = computeUnpaidMortgagesAndTaxes(mortgages, taxes);
    expect(result.conjugal).toBe(10_000_000);
    expect(result.exclusive).toBe(2_000_000); // UnpaidTax has no ownershipType → exclusive
    expect(result.total).toBe(12_000_000);
  });

  it('empty arrays return zeros', () => {
    expect(computeUnpaidMortgagesAndTaxes([], [])).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
  });

  it('multiple items summed by column', () => {
    const mortgages: UnpaidMortgage[] = [
      { description: 'Mortgage A', ownershipType: 'exclusive', amount: 5_000_000 },
      { description: 'Mortgage B', ownershipType: 'conjugal', amount: 8_000_000 },
    ];
    const taxes: UnpaidTax[] = [
      { description: 'RPT', amount: 1_000_000 },
    ];
    const result = computeUnpaidMortgagesAndTaxes(mortgages, taxes);
    expect(result.exclusive).toBe(6_000_000); // 5M + 1M tax
    expect(result.conjugal).toBe(8_000_000);
    expect(result.total).toBe(14_000_000);
  });
});

// ── §9.5 Casualty Losses ────────────────────────────────────────────────────

describe('computeCasualtyLosses', () => {
  it('uses amount as net deductible (gross - insurance pre-applied)', () => {
    const losses: CasualtyLoss[] = [
      { description: 'Fire damage', amount: 50_000_000 },
    ];
    const result = computeCasualtyLosses(losses);
    expect(result.exclusive).toBe(50_000_000);
    expect(result.total).toBe(50_000_000);
  });

  it('empty losses return zeros', () => {
    expect(computeCasualtyLosses([])).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
  });

  it('multiple losses summed', () => {
    const losses: CasualtyLoss[] = [
      { description: 'Flood', amount: 20_000_000 },
      { description: 'Theft', amount: 10_000_000 },
    ];
    const result = computeCasualtyLosses(losses);
    expect(result.total).toBe(30_000_000);
  });
});

// ── §9.6 Vanishing Deduction ─────────────────────────────────────────────────

describe('computeVanishingDeduction', () => {
  const dateOfDeath = '2021-09-01';

  const makeProp = (overrides: Partial<VanishingDeductionProperty> = {}): VanishingDeductionProperty => ({
    description: 'Inherited house',
    fmvAtDeath: 500_000_000,         // ₱5M
    fmvAtPriorTransfer: 400_000_000, // ₱4M
    priorTransferDate: '2020-09-01', // ~1 year
    priorTaxesPaid: 100_000,         // non-zero = taxes were paid
    encumbrances: 0,
    ...overrides,
  });

  it('100% tier: elapsed ≤ 1 year', () => {
    const prop = makeProp({ priorTransferDate: '2021-01-01' }); // ~8 months
    const result = computeVanishingDeduction([prop], 1_000_000_000, 0, dateOfDeath);
    // iv = min(400M, 500M) = 400M; nv = 400M; pct = 1.00; ratio = 1.0
    expect(result.exclusive).toBe(400_000_000);
    expect(result.total).toBe(400_000_000);
  });

  it('80% tier: elapsed > 1 year ≤ 2 years', () => {
    const prop = makeProp({ priorTransferDate: '2019-12-01' }); // ~21 months
    const result = computeVanishingDeduction([prop], 1_000_000_000, 0, dateOfDeath);
    // iv = 400M, nv = 400M, pct = 0.80, ratio = 1.0; VD = 320M
    expect(result.exclusive).toBe(320_000_000);
  });

  it('60% tier: elapsed > 2 years ≤ 3 years', () => {
    const prop = makeProp({ priorTransferDate: '2018-12-01' }); // ~33 months
    const result = computeVanishingDeduction([prop], 1_000_000_000, 0, dateOfDeath);
    expect(result.exclusive).toBe(240_000_000);
  });

  it('40% tier: elapsed > 3 years ≤ 4 years', () => {
    const prop = makeProp({ priorTransferDate: '2017-12-01' }); // ~45 months
    const result = computeVanishingDeduction([prop], 1_000_000_000, 0, dateOfDeath);
    expect(result.exclusive).toBe(160_000_000);
  });

  it('20% tier: elapsed > 4 years ≤ 5 years', () => {
    const prop = makeProp({ priorTransferDate: '2016-09-01' }); // 5 years exact
    const result = computeVanishingDeduction([prop], 1_000_000_000, 0, dateOfDeath);
    expect(result.exclusive).toBe(80_000_000);
  });

  it('0%: elapsed > 5 years — disqualified', () => {
    const prop = makeProp({ priorTransferDate: '2014-01-01' }); // > 7 years
    const result = computeVanishingDeduction([prop], 1_000_000_000, 0, dateOfDeath);
    expect(result.exclusive).toBe(0);
    expect(result.total).toBe(0);
  });

  it('prior tax not paid (priorTaxesPaid = 0) — disqualified', () => {
    const prop = makeProp({ priorTaxesPaid: 0, priorTransferDate: '2021-01-01' });
    const result = computeVanishingDeduction([prop], 1_000_000_000, 0, dateOfDeath);
    expect(result.total).toBe(0);
  });

  it('ratio reduces VD when ELIT > 0', () => {
    const ge = 1_000_000_000; // ₱10M
    const elit = 500_000_000; // ₱5M
    const prop = makeProp({ priorTransferDate: '2021-01-01' }); // 100% tier, ~8 months
    const result = computeVanishingDeduction([prop], ge, elit, dateOfDeath);
    // ratio = (10M - 5M) / 10M = 0.5; iv = 400M; pct = 1.0; VD = 400M * 0.5 = 200M
    expect(result.exclusive).toBe(200_000_000);
  });

  it('encumbrances reduce net value', () => {
    const prop = makeProp({
      fmvAtPriorTransfer: 400_000_000,
      fmvAtDeath: 500_000_000,
      encumbrances: 100_000_000,
      priorTransferDate: '2021-01-01', // 100%
    });
    const result = computeVanishingDeduction([prop], 1_000_000_000, 0, dateOfDeath);
    // iv = 400M; nv = 400M - 100M = 300M; pct = 1.0; ratio = 1.0
    expect(result.exclusive).toBe(300_000_000);
  });

  it('GE = 0 returns zero (guards division by zero)', () => {
    const prop = makeProp({ priorTransferDate: '2021-01-01' });
    const result = computeVanishingDeduction([prop], 0, 0, dateOfDeath);
    expect(result.total).toBe(0);
  });

  it('spec TV-03 scenario: 18-month 80% tier with ratio', () => {
    // GE = 9M, ELIT = 500K, prior FMV 3.5M, current FMV 4.2M, 18 months → pct=0.80
    const ge = 900_000_000;
    const elit = 50_000_000; // ₱500K
    const prop: VanishingDeductionProperty = {
      description: 'Inherited property',
      fmvAtDeath: 420_000_000,
      fmvAtPriorTransfer: 350_000_000,
      priorTransferDate: '2020-03-01', // ~18 months before 2021-09-01
      priorTaxesPaid: 100_000,
      encumbrances: 0,
    };
    const result = computeVanishingDeduction([prop], ge, elit, dateOfDeath);
    // iv = 350M; nv = 350M; pct = 0.80; ratio = (900M-50M)/900M = 850/900
    const expected = Math.floor(0.80 * 350_000_000 * (850_000_000 / 900_000_000));
    expect(result.exclusive).toBe(expected);
  });
});

// ── §9.7 Public Use Transfers ───────────────────────────────────────────────

describe('computePublicUseTransfers', () => {
  it('citizen: full amount (no nraFactor)', () => {
    const transfers: PublicUseTransfer[] = [
      { description: 'Donation to City', amount: 20_000_000 },
    ];
    const result = computePublicUseTransfers(transfers);
    expect(result.exclusive).toBe(20_000_000);
    expect(result.total).toBe(20_000_000);
  });

  it('NRA: proportional by nraFactor', () => {
    const transfers: PublicUseTransfer[] = [
      { description: 'Donation to DepEd', amount: 100_000_000 }, // ₱1M
    ];
    const result = computePublicUseTransfers(transfers, 0.25);
    expect(result.total).toBe(25_000_000); // 0.25 * 100M
  });

  it('empty transfers return zeros', () => {
    expect(computePublicUseTransfers([])).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
  });

  it('nraFactor = 1.0 gives full amount', () => {
    const transfers: PublicUseTransfer[] = [
      { description: 'Full transfer', amount: 50_000_000 },
    ];
    const result = computePublicUseTransfers(transfers, 1.0);
    expect(result.total).toBe(50_000_000);
  });
});

// ── §9.8 Funeral Expenses ───────────────────────────────────────────────────

describe('computeFuneralExpenses', () => {
  it('TRAIN deductionRules → zero', () => {
    const expenses: FuneralExpense[] = [{ description: 'Funeral', amount: 10_000_000 }];
    const result = computeFuneralExpenses(expenses, 100_000_000, 'TRAIN');
    expect(result).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
  });

  it('PRE_TRAIN: deductible = actual when actual < 5% * GE', () => {
    const expenses: FuneralExpense[] = [{ description: 'Funeral', amount: 15_000_000 }]; // ₱150K
    const ge = 500_000_000; // ₱5M; 5% = ₱250K = 25M centavos
    const result = computeFuneralExpenses(expenses, ge, 'PRE_TRAIN');
    expect(result.total).toBe(15_000_000);
  });

  it('PRE_TRAIN: caps at 5% of GE when actual exceeds limit', () => {
    const expenses: FuneralExpense[] = [{ description: 'Funeral', amount: 50_000_000 }]; // ₱500K
    const ge = 500_000_000; // ₱5M; 5% = ₱250K = 25M centavos
    const result = computeFuneralExpenses(expenses, ge, 'PRE_TRAIN');
    expect(result.total).toBe(25_000_000); // capped at 5% limit
  });

  it('PRE_TRAIN: empty expenses → zero', () => {
    const result = computeFuneralExpenses([], 500_000_000, 'PRE_TRAIN');
    expect(result).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
  });

  it('PRE_TRAIN: TV-07 scenario — ₱150K actual, ₱5M GE', () => {
    const expenses: FuneralExpense[] = [{ description: 'Funeral', amount: 15_000_000 }];
    const result = computeFuneralExpenses(expenses, 500_000_000, 'PRE_TRAIN');
    expect(result.total).toBe(15_000_000);
  });
});

// ── §9.9 Judicial Admin Expenses ───────────────────────────────────────────

describe('computeJudicialAdminExpenses', () => {
  it('TRAIN deductionRules → zero', () => {
    const items: JudicialAdminExpense[] = [{ description: 'Atty fees', amount: 5_000_000 }];
    const result = computeJudicialAdminExpenses(items, 'TRAIN');
    expect(result).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
  });

  it('PRE_TRAIN: actual amounts, no cap', () => {
    const items: JudicialAdminExpense[] = [
      { description: 'Attorney fees', amount: 5_000_000 },
      { description: 'Court fees', amount: 1_000_000 },
    ];
    const result = computeJudicialAdminExpenses(items, 'PRE_TRAIN');
    expect(result.total).toBe(6_000_000);
  });

  it('PRE_TRAIN: empty items → zero', () => {
    const result = computeJudicialAdminExpenses([], 'PRE_TRAIN');
    expect(result).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
  });

  it('PRE_TRAIN: large amounts — no cap enforced', () => {
    const items: JudicialAdminExpense[] = [
      { description: 'Complex estate', amount: 1_000_000_000 }, // ₱10M
    ];
    const result = computeJudicialAdminExpenses(items, 'PRE_TRAIN');
    expect(result.total).toBe(1_000_000_000);
  });
});

// ── computeOrdinaryDeductions (integration) ─────────────────────────────────

describe('computeOrdinaryDeductions', () => {
  it('TRAIN: computes all components; funeral/judicial are zero', () => {
    const result = computeOrdinaryDeductions(
      {
        claimsAgainstEstate: [{ description: 'Loan', ownershipType: 'exclusive', amount: 100_000_000 }],
        claimsVsInsolvent: [],
        unpaidMortgages: [],
        unpaidTaxes: [],
        casualtyLosses: [],
        vanishingDeductionProperties: [],
        publicUseTransfers: [],
        funeralExpenses: [],
        judicialAdminExpenses: [],
      },
      'TRAIN',
      1_000_000_000,
      '2021-01-01',
    );
    expect(result.item5b_claims_against_estate.exclusive).toBe(100_000_000);
    expect(result.item5g_vanishing_deduction.total).toBe(0);
    expect(result.item5h_transfers_for_public_use.total).toBe(0);
    expect(result.total.exclusive).toBe(100_000_000);
    expect(result.total.total).toBe(100_000_000);
  });

  it('total equals sum of all component totals', () => {
    const result = computeOrdinaryDeductions(
      {
        claimsAgainstEstate: [{ description: 'Claim', ownershipType: 'conjugal', amount: 50_000_000 }],
        claimsVsInsolvent: [{ description: 'Insolvent', amount: 10_000_000 }],
        unpaidMortgages: [],
        unpaidTaxes: [],
        casualtyLosses: [],
        vanishingDeductionProperties: [],
        publicUseTransfers: [],
        funeralExpenses: [],
        judicialAdminExpenses: [],
      },
      'TRAIN',
      500_000_000,
      '2021-01-01',
    );
    expect(result.total.total).toBe(60_000_000);
    expect(result.total.conjugal).toBe(50_000_000);
    expect(result.total.exclusive).toBe(10_000_000);
  });

  it('PRE_TRAIN: includes funeral and judicial in total', () => {
    const result = computeOrdinaryDeductions(
      {
        claimsAgainstEstate: [],
        claimsVsInsolvent: [],
        unpaidMortgages: [],
        unpaidTaxes: [],
        casualtyLosses: [],
        vanishingDeductionProperties: [],
        publicUseTransfers: [],
        funeralExpenses: [{ description: 'Funeral', amount: 15_000_000 }], // ₱150K
        judicialAdminExpenses: [{ description: 'Atty fees', amount: 5_000_000 }],
      },
      'PRE_TRAIN',
      500_000_000, // GE ₱5M; 5% = ₱250K → funeral 150K deductible
      '2015-01-01',
    );
    // funeral = min(15M, 25M) = 15M
    expect(result.item5a_standard_deduction.total).toBe(15_000_000);
    // judicial = 5M
    expect(result.item5b_claims_against_estate.total).toBe(5_000_000);
    expect(result.total.total).toBe(20_000_000);
  });

  it('NRA factor applied to public use transfers', () => {
    const result = computeOrdinaryDeductions(
      {
        claimsAgainstEstate: [],
        claimsVsInsolvent: [],
        unpaidMortgages: [],
        unpaidTaxes: [],
        casualtyLosses: [],
        vanishingDeductionProperties: [],
        publicUseTransfers: [{ description: 'Transfer', amount: 100_000_000 }],
        funeralExpenses: [],
        judicialAdminExpenses: [],
      },
      'TRAIN',
      1_000_000_000,
      '2021-01-01',
      0.25, // NRA factor
    );
    expect(result.item5h_transfers_for_public_use.total).toBe(25_000_000);
  });

  it('TRAIN: transfers for public use reduce the vanishing-deduction ratio (LAW-09)', () => {
    // LEGAL-CONFORMANCE.md §2b worked example. NIRC Sec. 86(A)(5) as amended by
    // RA 10963 reduces against paragraphs (2), (3), (4) and (6); paragraph (6)
    // is Transfers for Public Use. RR 12-2018 Sec. 6(5) restates it.
    const result = computeOrdinaryDeductions(
      {
        claimsAgainstEstate: [
          { description: 'Loan', ownershipType: 'exclusive', amount: 100_000_000 }, // ₱1M
        ],
        claimsVsInsolvent: [],
        unpaidMortgages: [],
        unpaidTaxes: [],
        casualtyLosses: [],
        vanishingDeductionProperties: [
          {
            description: 'Inherited lot',
            fmvAtDeath: 1_000_000_000,         // ₱10M
            fmvAtPriorTransfer: 1_000_000_000, // ₱10M
            priorTransferDate: '2023-06-01',   // under one year → vanishingPct 1.00
            priorTaxesPaid: 100_000,
            encumbrances: 0,
          },
        ],
        publicUseTransfers: [{ description: 'Donation to the City', amount: 500_000_000 }], // ₱5M
        funeralExpenses: [],
        judicialAdminExpenses: [],
      },
      'TRAIN',
      3_000_000_000, // ₱30M gross estate
      '2024-01-01',
    );
    // ratio = (3_000_000_000 − 100_000_000 − 500_000_000) / 3_000_000_000 = 0.8
    // 0.8 × 1_000_000_000 = 800_000_000
    // Before this fix the same input produced 966_666_600, because the ratio
    // omitted paragraph (6).
    expect(result.item5g_vanishing_deduction.total).toBe(800_000_000);
    expect(result.item5h_transfers_for_public_use.total).toBe(500_000_000);
  });

  it('PRE_TRAIN: transfers for public use reduce the vanishing-deduction ratio (LAW-09)', () => {
    // RA 8424 Sec. 86(A)(2) reduced against paragraphs (1) and (3), and
    // pre-TRAIN paragraph (3) was ALSO Transfers for Public Use. Funeral and
    // judicial are empty here so the two regimes differ only by the term under
    // test.
    const result = computeOrdinaryDeductions(
      {
        claimsAgainstEstate: [
          { description: 'Loan', ownershipType: 'exclusive', amount: 100_000_000 }, // ₱1M
        ],
        claimsVsInsolvent: [],
        unpaidMortgages: [],
        unpaidTaxes: [],
        casualtyLosses: [],
        vanishingDeductionProperties: [
          {
            description: 'Inherited lot',
            fmvAtDeath: 1_000_000_000,
            fmvAtPriorTransfer: 1_000_000_000,
            priorTransferDate: '2014-06-01', // under one year → vanishingPct 1.00
            priorTaxesPaid: 100_000,
            encumbrances: 0,
          },
        ],
        publicUseTransfers: [{ description: 'Donation to the City', amount: 500_000_000 }],
        funeralExpenses: [],
        judicialAdminExpenses: [],
      },
      'PRE_TRAIN',
      3_000_000_000,
      '2015-01-01',
    );
    expect(result.item5g_vanishing_deduction.total).toBe(800_000_000);
    expect(result.item5h_transfers_for_public_use.total).toBe(500_000_000);
  });
});
