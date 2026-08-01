/**
 * The four refusal rules, verbatim article copying and exact centavo arithmetic.
 *
 * Source of truth:
 * `.planning/phases/22-deed-of-extrajudicial-settlement-schedule-of-shares/22-RESEARCH.md` §4
 * (the four refusal rules R0-R3).
 *
 * Local builders only — this codebase has no shared fixture module and one must
 * not be introduced. The `Art.` literal below lives in the TEST, which is not a
 * display layer, and never in the module under test.
 */

import { describe, it, expect } from 'vitest';
import type {
  EngineInput,
  EngineOutput,
  InheritanceShare,
  ManualFlag,
} from '../../../types';
import {
  buildDeedSchedule,
  formatDeedPesos,
  REFUSAL_NEGATIVE_AMOUNT,
  REFUSAL_NO_ARTICLE,
} from '../schedule-lines';

const ZERO = { centavos: 0 };

function makeShare(over: Partial<InheritanceShare>): InheritanceShare {
  return {
    heir_id: 'h1',
    heir_name: 'Heir One',
    heir_category: 'LegitimateChildGroup',
    inherits_by: 'OwnRight',
    represents: null,
    from_legitime: ZERO,
    from_free_portion: ZERO,
    from_intestate: ZERO,
    total: { centavos: 100000 },
    legitime_fraction: '1/1',
    legal_basis: ['Art. 979'],
    donations_imputed: ZERO,
    gross_entitlement: { centavos: 100000 },
    net_from_estate: { centavos: 100000 },
    ...over,
  } as InheritanceShare;
}

function makeFlag(over: Partial<ManualFlag>): ManualFlag {
  return {
    category: 'Reserva Troncal',
    description: 'A reserva troncal question arises on these facts.',
    related_heir_id: null,
    ...over,
  };
}

function makeInput(over: Partial<EngineInput> = {}): EngineInput {
  return {
    net_distributable_estate: { centavos: 1000000000 },
    decedent: {
      id: 'd1',
      name: 'Juan dela Cruz',
      date_of_death: '2024-03-15',
      is_married: false,
      date_of_marriage: null,
      marriage_solemnized_in_articulo_mortis: false,
      was_ill_at_marriage: false,
      illness_caused_death: false,
      years_of_cohabitation: 0,
      has_legal_separation: false,
      is_illegitimate: false,
    },
    family_tree: [],
    will: null,
    donations: [],
    config: { retroactive_ra_11642: false, max_pipeline_restarts: 3 },
    ...over,
  } as EngineInput;
}

function makeOutput(over: Partial<EngineOutput> = {}): EngineOutput {
  return {
    per_heir_shares: [makeShare({})],
    narratives: [],
    computation_log: {
      steps: [],
      total_estate: { centavos: 1000000000 },
      legitime_pool: ZERO,
      free_portion: ZERO,
    },
    warnings: [],
    succession_type: 'Intestate',
    scenario_code: 'A1',
    ...over,
  } as unknown as EngineOutput;
}

describe('formatDeedPesos', () => {
  it('prints zero with both centavo digits', () => {
    expect(formatDeedPesos(0n)).toBe('PHP 0.00');
  });

  it('prints one centavo', () => {
    expect(formatDeedPesos(1n)).toBe('PHP 0.01');
  });

  it('always prints the two decimals, unlike formatPeso', () => {
    expect(formatDeedPesos(100n)).toBe('PHP 1.00');
  });

  it('groups thousands', () => {
    expect(formatDeedPesos(150000000n)).toBe('PHP 1,500,000.00');
  });

  it('keeps non-zero centavos', () => {
    expect(formatDeedPesos(123456789n)).toBe('PHP 1,234,567.89');
  });

  it('formats a value above the safe integer range exactly', () => {
    expect(formatDeedPesos('9007199254740993')).toBe('PHP 90,071,992,547,409.93');
  });

  it('throws rather than formatting a negative amount', () => {
    expect(() => formatDeedPesos(-1n)).toThrow(/DEED NEGATIVE AMOUNT/);
  });
});

describe('buildDeedSchedule — stated lines', () => {
  it('emits one line per share in the engine order', () => {
    const output = makeOutput({
      per_heir_shares: [
        makeShare({ heir_id: 'a', heir_name: 'Ana' }),
        makeShare({ heir_id: 'b', heir_name: 'Ben' }),
      ],
    });
    const schedule = buildDeedSchedule(makeInput(), output);
    expect(schedule.lines.map((l) => l.heirId)).toEqual(['a', 'b']);
  });

  it('does not sort — reversing the engine array reverses the lines', () => {
    const shares = [
      makeShare({ heir_id: 'a', heir_name: 'Ana' }),
      makeShare({ heir_id: 'b', heir_name: 'Ben' }),
    ];
    const forward = buildDeedSchedule(makeInput(), makeOutput({ per_heir_shares: shares }));
    const reversed = buildDeedSchedule(
      makeInput(),
      makeOutput({ per_heir_shares: [...shares].reverse() }),
    );
    expect(forward.lines.map((l) => l.heirId)).toEqual(['a', 'b']);
    expect(reversed.lines.map((l) => l.heirId)).toEqual(['b', 'a']);
  });

  it('copies legal_basis verbatim', () => {
    const share = makeShare({ legal_basis: ['Art. 979', 'Art. 996'] });
    const schedule = buildDeedSchedule(makeInput(), makeOutput({ per_heir_shares: [share] }));
    expect(schedule.lines[0]!.articles).toEqual(['Art. 979', 'Art. 996']);
  });

  it('copies legal_basis into a distinct array object', () => {
    const share = makeShare({ legal_basis: ['Art. 979'] });
    const schedule = buildDeedSchedule(makeInput(), makeOutput({ per_heir_shares: [share] }));
    expect(schedule.lines[0]!.articles).not.toBe(share.legal_basis);
  });

  it('mutating the copied articles leaves the engine array unchanged', () => {
    const share = makeShare({ legal_basis: ['Art. 979'] });
    const schedule = buildDeedSchedule(makeInput(), makeOutput({ per_heir_shares: [share] }));
    schedule.lines[0]!.articles.push('INVENTED');
    expect(share.legal_basis).toEqual(['Art. 979']);
  });

  it('states net_from_estate as the amount', () => {
    const share = makeShare({ net_from_estate: { centavos: 250001 } });
    const schedule = buildDeedSchedule(makeInput(), makeOutput({ per_heir_shares: [share] }));
    expect(schedule.lines[0]!.amountCentavos).toBe('250001');
    expect(schedule.lines[0]!.displayAmount).toBe(formatDeedPesos(250001));
  });

  it('labels the heir category from the shared label map', () => {
    const share = makeShare({ heir_category: 'SurvivingSpouseGroup' });
    const schedule = buildDeedSchedule(makeInput(), makeOutput({ per_heir_shares: [share] }));
    expect(schedule.lines[0]!.categoryLabel).toBe('Surviving Spouse');
  });

  it('sums the stated lines exactly', () => {
    const output = makeOutput({
      per_heir_shares: [
        makeShare({ heir_id: 'a', net_from_estate: { centavos: 100000 } }),
        makeShare({ heir_id: 'b', net_from_estate: { centavos: 250001 } }),
        makeShare({ heir_id: 'c', net_from_estate: { centavos: 1 } }),
      ],
    });
    const schedule = buildDeedSchedule(makeInput(), output);
    expect(schedule.statedSumCentavos).toBe('350002');
  });
});

describe('buildDeedSchedule — refusals', () => {
  it('R0 refuses a negative net share', () => {
    const share = makeShare({ net_from_estate: { centavos: -1 } });
    const schedule = buildDeedSchedule(makeInput(), makeOutput({ per_heir_shares: [share] }));
    const line = schedule.lines[0]!;
    expect(line.kind).toBe('refused');
    expect(line.amountCentavos).toBeNull();
    expect(line.displayAmount).toBeNull();
    expect(line.refusalReasons).toContain(REFUSAL_NEGATIVE_AMOUNT);
  });

  it('R1 refuses a line the engine gave no article for', () => {
    const share = makeShare({ legal_basis: [] });
    const schedule = buildDeedSchedule(makeInput(), makeOutput({ per_heir_shares: [share] }));
    const line = schedule.lines[0]!;
    expect(line.kind).toBe('refused');
    expect(line.refusalReasons).toContain(REFUSAL_NO_ARTICLE);
  });

  it('R2 refuses only the heir a flag names', () => {
    const output = makeOutput({
      per_heir_shares: [makeShare({ heir_id: 'a' }), makeShare({ heir_id: 'b' })],
      warnings: [makeFlag({ related_heir_id: 'a' })],
    });
    const schedule = buildDeedSchedule(makeInput(), output);
    expect(schedule.lines[0]!.kind).toBe('refused');
    expect(schedule.lines[1]!.kind).toBe('stated');
  });

  it('R2 carries the flag category and description verbatim', () => {
    const flag = makeFlag({
      related_heir_id: 'a',
      category: 'Art. 992 Iron Curtain',
      description: 'UNANSWERED: the engine declines to compute this relationship.',
    });
    const output = makeOutput({
      per_heir_shares: [makeShare({ heir_id: 'a' })],
      warnings: [flag],
    });
    const schedule = buildDeedSchedule(makeInput(), output);
    const reason = schedule.lines[0]!.refusalReasons[0]!;
    expect(reason).toContain(flag.category);
    expect(reason).toContain(flag.description);
  });

  it('collects every reason that fires', () => {
    const share = makeShare({ net_from_estate: { centavos: -1 }, legal_basis: [] });
    const schedule = buildDeedSchedule(makeInput(), makeOutput({ per_heir_shares: [share] }));
    expect(schedule.lines[0]!.refusalReasons).toHaveLength(2);
    expect(schedule.lines[0]!.refusalReasons).toContain(REFUSAL_NEGATIVE_AMOUNT);
    expect(schedule.lines[0]!.refusalReasons).toContain(REFUSAL_NO_ARTICLE);
  });

  it('R3 puts a heir-less flag on the document and refuses no line', () => {
    const flag = makeFlag({ related_heir_id: null });
    const output = makeOutput({
      per_heir_shares: [makeShare({ heir_id: 'a' }), makeShare({ heir_id: 'b' })],
      warnings: [flag],
    });
    const schedule = buildDeedSchedule(makeInput(), output);
    expect(schedule.documentRefusals).toEqual([`${flag.category}: ${flag.description}`]);
    expect(schedule.lines.every((l) => l.kind === 'stated')).toBe(true);
  });

  it('partition sizes always sum to the share count', () => {
    const output = makeOutput({
      per_heir_shares: [
        makeShare({ heir_id: 'a' }),
        makeShare({ heir_id: 'b', legal_basis: [] }),
        makeShare({ heir_id: 'c', net_from_estate: { centavos: -5 } }),
      ],
    });
    const schedule = buildDeedSchedule(makeInput(), output);
    expect(schedule.statedCount + schedule.refusedCount).toBe(3);
    expect(schedule.statedCount).toBe(1);
    expect(schedule.refusedCount).toBe(2);
  });

  it('a refused line contributes nothing to the stated sum', () => {
    const output = makeOutput({
      per_heir_shares: [
        makeShare({ heir_id: 'a', net_from_estate: { centavos: 100000 } }),
        makeShare({ heir_id: 'b', net_from_estate: { centavos: 999999 }, legal_basis: [] }),
      ],
    });
    const schedule = buildDeedSchedule(makeInput(), output);
    expect(schedule.statedSumCentavos).toBe('100000');
  });
});

describe('buildDeedSchedule — estate value and pass-through', () => {
  it('formats the net distributable estate', () => {
    const schedule = buildDeedSchedule(
      makeInput({ net_distributable_estate: { centavos: 1000000000 } }),
      makeOutput(),
    );
    expect(schedule.netEstateDisplay).toBe('PHP 10,000,000.00');
  });

  it('never prints a negative estate as a peso amount', () => {
    const schedule = buildDeedSchedule(
      makeInput({ net_distributable_estate: { centavos: -5 } }),
      makeOutput(),
    );
    expect(schedule.netEstateDisplay).toBe(REFUSAL_NEGATIVE_AMOUNT);
    expect(schedule.netEstateCentavos).toBe('-5');
  });

  it('passes the decedent name and date of death through character for character', () => {
    const input = makeInput();
    input.decedent.name = 'Peña & Sons <Estate>';
    input.decedent.date_of_death = '1990-12-31';
    const schedule = buildDeedSchedule(input, makeOutput());
    expect(schedule.decedentName).toBe('Peña & Sons <Estate>');
    expect(schedule.dateOfDeath).toBe('1990-12-31');
  });

  it('passes a heir name through unescaped', () => {
    const share = makeShare({ heir_name: 'Ana & Ben <Jr>' });
    const schedule = buildDeedSchedule(makeInput(), makeOutput({ per_heir_shares: [share] }));
    expect(schedule.lines[0]!.heirName).toBe('Ana & Ben <Jr>');
  });
});
