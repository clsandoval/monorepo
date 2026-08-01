/**
 * The fixed clause layout, the refusal rendering, the stable numbering and the
 * absence of every non-schedule deed clause.
 *
 * Traces to ROADMAP Phase 22 criteria 1 (a computed case yields a pasteable
 * clause), 3 (every stated line carries the engine's article), 4 (a line that
 * cannot be expressed says so and supplies no wording) and 6 (the clause
 * contains nothing else of the deed).
 *
 * Local builders only. Every `DeedSchedule` under test is produced by the real
 * `buildDeedSchedule`; hand-writing a schedule literal would let the two modules
 * drift.
 */

import { describe, it, expect } from 'vitest';
import type {
  EngineInput,
  EngineOutput,
  InheritanceShare,
  ManualFlag,
} from '../../../types';
import { buildDeedSchedule, DEED_SCOPE_NOTICE } from '../schedule-lines';
import { buildDeedClauseText, deedClauseBaseName } from '../clause-text';

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
      name: 'Juan Dela Cruz',
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

function render(output: EngineOutput, input: EngineInput = makeInput()) {
  const schedule = buildDeedSchedule(input, output);
  return { schedule, text: buildDeedClauseText(schedule) };
}

/** The block starting at `n. ` and running to the next blank line. */
function blockOf(text: string, n: number): string {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.startsWith(`${n}. `));
  expect(start).toBeGreaterThanOrEqual(0);
  const out: string[] = [];
  for (let i = start; i < lines.length && lines[i] !== ''; i += 1) {
    out.push(lines[i]!);
  }
  return out.join('\n');
}

describe('clause header and shape', () => {
  it('opens with the clause title', () => {
    const { text } = render(makeOutput());
    expect(text.split('\n')[0]).toBe('SCHEDULE OF SHARES');
  });

  it('names the estate and the date of death, each on its own line', () => {
    const { text } = render(makeOutput());
    const lines = text.split('\n');
    expect(lines).toContain('Estate of: Juan Dela Cruz');
    expect(lines).toContain('Date of death: 2024-03-15');
  });

  it('states the net distributable estate as entered', () => {
    const { schedule, text } = render(makeOutput());
    expect(text.split('\n')).toContain(
      `Net distributable estate as entered: ${schedule.netEstateDisplay}`,
    );
  });

  it('carries no trailing newline', () => {
    const { text } = render(makeOutput());
    expect(text.endsWith('\n')).toBe(false);
  });

  it('contains no carriage return', () => {
    const { text } = render(makeOutput());
    expect(text.includes('\r')).toBe(false);
  });

  it('has no line with trailing whitespace', () => {
    const { text } = render(makeOutput());
    const offenders = text.split('\n').filter((l) => l !== l.replace(/\s+$/, ''));
    expect(offenders).toEqual([]);
  });

  it('discloses the open wording question by id', () => {
    const { text } = render(makeOutput());
    expect(text).toContain('LAWYER-13');
  });
});

describe('stated lines', () => {
  const twoHeirs = () =>
    makeOutput({
      per_heir_shares: [
        makeShare({ heir_id: 'a', heir_name: 'Ana Reyes' }),
        makeShare({ heir_id: 'b', heir_name: 'Ben Reyes', net_from_estate: { centavos: 250001 } }),
      ],
    });

  it('numbers the blocks in engine order', () => {
    const { text } = render(twoHeirs());
    expect(blockOf(text, 1)).toContain('Ana Reyes');
    expect(blockOf(text, 2)).toContain('Ben Reyes');
  });

  it('prints the share field and the article field in a stated block', () => {
    const { text } = render(twoHeirs());
    const block = blockOf(text, 1);
    expect(block).toContain('   Share: PHP ');
    expect(block).toContain('   Governing article(s): ');
  });

  it('joins a multi-article legal_basis with a semicolon in engine order', () => {
    const output = makeOutput({
      per_heir_shares: [makeShare({ legal_basis: ['Art. 979', 'Art. 996'] })],
    });
    const { text } = render(output);
    expect(blockOf(text, 1)).toContain('   Governing article(s): Art. 979; Art. 996');
  });

  it('prints exactly the line model peso string', () => {
    const { schedule, text } = render(twoHeirs());
    expect(blockOf(text, 2)).toContain(`   Share: ${schedule.lines[1]!.displayAmount}`);
  });

  it('labels the heir category beside the name', () => {
    const output = makeOutput({
      per_heir_shares: [makeShare({ heir_name: 'Ana Reyes', heir_category: 'SurvivingSpouseGroup' })],
    });
    const { text } = render(output);
    expect(blockOf(text, 1).split('\n')[0]).toBe('1. Ana Reyes (Surviving Spouse)');
  });
});

describe('refused lines', () => {
  it('prints the refusal label and the closing sentence', () => {
    const output = makeOutput({ per_heir_shares: [makeShare({ legal_basis: [] })] });
    const { text } = render(output);
    const block = blockOf(text, 1);
    expect(block).toContain('MANUAL REVIEW REQUIRED — NO SHARE STATED');
    expect(block).toContain('A lawyer must decide this line. No wording is supplied for it.');
  });

  it('prints no peso amount and no article inside a refused block', () => {
    const output = makeOutput({ per_heir_shares: [makeShare({ legal_basis: [] })] });
    const { text } = render(output);
    const block = blockOf(text, 1);
    expect(block).not.toContain('PHP ');
    expect(block).not.toContain('Governing article(s):');
  });

  it('keeps the engine position of a refused heir', () => {
    const output = makeOutput({
      per_heir_shares: [
        makeShare({ heir_id: 'a', heir_name: 'Ana' }),
        makeShare({ heir_id: 'b', heir_name: 'Ben', legal_basis: [] }),
        makeShare({ heir_id: 'c', heir_name: 'Cel' }),
      ],
    });
    const { text } = render(output);
    expect(blockOf(text, 1)).toContain('Ana');
    expect(blockOf(text, 2)).toContain('Ben');
    expect(blockOf(text, 2)).toContain('MANUAL REVIEW REQUIRED — NO SHARE STATED');
    expect(blockOf(text, 3)).toContain('Cel');
  });

  it('renders a heir-scoped flag verbatim', () => {
    const flag = makeFlag({
      related_heir_id: 'a',
      category: 'Art. 992 Iron Curtain',
      description: 'UNANSWERED: the engine declines to compute this relationship.',
    });
    const output = makeOutput({
      per_heir_shares: [makeShare({ heir_id: 'a' })],
      warnings: [flag],
    });
    const { text } = render(output);
    const block = blockOf(text, 1);
    expect(block).toContain(flag.category);
    expect(block).toContain(flag.description);
  });
});

describe('document refusals', () => {
  it('places the document refusal heading before the SHARES marker', () => {
    const output = makeOutput({ warnings: [makeFlag({ related_heir_id: null })] });
    const { text } = render(output);
    const heading = text.indexOf('MANUAL REVIEW REQUIRED BEFORE THIS SCHEDULE IS USED');
    const marker = text.indexOf('\nSHARES\n');
    expect(heading).toBeGreaterThanOrEqual(0);
    expect(marker).toBeGreaterThanOrEqual(0);
    expect(heading).toBeLessThan(marker);
  });

  it('omits the heading entirely when no document-scoped flag was raised', () => {
    const { text } = render(makeOutput());
    expect(text).not.toContain('MANUAL REVIEW REQUIRED BEFORE THIS SCHEDULE IS USED');
  });
});

describe('footer', () => {
  const mixed = () =>
    makeOutput({
      per_heir_shares: [
        makeShare({ heir_id: 'a' }),
        makeShare({ heir_id: 'b' }),
        makeShare({ heir_id: 'c', legal_basis: [] }),
      ],
    });

  it('counts the stated and refused lines', () => {
    const { text } = render(mixed());
    const lines = text.split('\n');
    expect(lines).toContain('Lines stated: 2');
    expect(lines).toContain('Lines refused: 1');
  });

  it('prints exactly the line model sum string', () => {
    const { schedule, text } = render(mixed());
    expect(text.split('\n')).toContain(
      `Sum of the shares stated above: ${schedule.statedSumDisplay}`,
    );
  });

  it('qualifies the sum when a line is refused', () => {
    const { text } = render(mixed());
    expect(text).toContain(
      'This sum covers the stated lines only and is incomplete while any line above is refused.',
    );
  });

  it('does not qualify the sum when every line is stated', () => {
    const { text } = render(makeOutput());
    expect(text).not.toContain('This sum covers the stated lines only');
  });
});

describe('criterion 6 — nothing else of the deed is emitted', () => {
  /**
   * `DEED_SCOPE_NOTICE` is the one line that names these clauses, and it names
   * them only to disclaim them. It is removed before the scan so the assertion
   * measures what the generator EMITS rather than what it disowns.
   */
  const FORBIDDEN = [
    'parties',
    'publication',
    'bond',
    'undertake',
    'undertaking',
    'acknowledg',
    'jurat',
    'notar',
    'witness whereof',
    'hereby adjudicate',
    'signature',
  ];

  function bodyWithoutScopeNotice(text: string): string {
    return text
      .split('\n')
      .filter((l) => l !== DEED_SCOPE_NOTICE)
      .join('\n')
      .toLowerCase();
  }

  it('emits no parties, publication, bond, undertaking, acknowledgment, jurat, notarial or signature clause', () => {
    const output = makeOutput({
      per_heir_shares: [
        makeShare({ heir_id: 'a', heir_name: 'Ana Reyes' }),
        makeShare({ heir_id: 'b', heir_name: 'Ben Reyes', legal_basis: [] }),
      ],
      warnings: [makeFlag({ related_heir_id: null })],
    });
    const { text } = render(output);
    const body = bodyWithoutScopeNotice(text);
    for (const term of FORBIDDEN) {
      expect(body).not.toContain(term);
    }
  });

  it('emits no operative adjudicating sentence', () => {
    const { text } = render(makeOutput());
    expect(bodyWithoutScopeNotice(text)).not.toContain('hereby adjudicate');
  });

  it('the scope notice is the only line naming those clauses, and it disclaims them', () => {
    const { text } = render(makeOutput());
    const naming = text
      .split('\n')
      .filter((l) => FORBIDDEN.some((term) => l.toLowerCase().includes(term)));
    expect(naming).toEqual([DEED_SCOPE_NOTICE]);
    expect(DEED_SCOPE_NOTICE).toContain('is not itself a Deed of Extrajudicial Settlement');
  });
});

describe('empty output', () => {
  it('says so rather than printing an empty schedule', () => {
    const { text } = render(makeOutput({ per_heir_shares: [] }));
    expect(text).toContain('No heir share was returned by the engine.');
    expect(text.split('\n')).toContain('Lines stated: 0');
  });
});

describe('deedClauseBaseName', () => {
  it('slugs the decedent name and appends the date of death', () => {
    const { schedule } = render(makeOutput());
    expect(deedClauseBaseName(schedule)).toBe(
      'deed-schedule-of-shares-juan-dela-cruz-2024-03-15',
    );
  });

  it('substitutes a placeholder when the name slugs to nothing', () => {
    const input = makeInput();
    input.decedent.name = '!!!';
    const { schedule } = render(makeOutput(), input);
    expect(deedClauseBaseName(schedule)).toBe(
      'deed-schedule-of-shares-unnamed-decedent-2024-03-15',
    );
  });
});
