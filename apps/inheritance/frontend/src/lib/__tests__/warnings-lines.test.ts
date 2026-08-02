/**
 * The engine-warning line model.
 *
 * PROVENANCE. The two warning payloads asserted below are not invented. They
 * were measured for `.planning/phases/23-.../23-RESEARCH.md` §4 by running all
 * twenty committed cases under `engine/examples/cases/` through the compiled
 * WASM engine via `frontend/journey/engine.mjs`. Eighteen produce zero
 * warnings. The two that do not are:
 *
 *   engine/examples/cases/06-testate-charity.json
 *     category `preterition`, related_heir_id null, severity `error`
 *
 *   engine/examples/cases/17-adopted-child.json
 *     category `RA_11642_RETROACTIVITY`, related_heir_id "ac1",
 *     severity `info` because the category is unmapped
 *
 * Those are the only two warning shapes any committed input can reach, so they
 * are the two this file pins character for character.
 */

import { describe, it, expect } from 'vitest';
import type { ManualFlag, InheritanceShare } from '../../types';
import {
  buildWarningLines,
  getWarningSeverity,
  WARNINGS_HEADING,
  RELATED_HEIR_LABEL,
} from '../warnings-lines';

// ── Local builders (this codebase defines them per test file) ──────────

function flag(partial: Partial<ManualFlag> = {}): ManualFlag {
  return {
    category: 'preterition',
    description: 'a description',
    related_heir_id: null,
    ...partial,
  };
}

function share(partial: Partial<InheritanceShare> = {}): InheritanceShare {
  const zero = { centavos: 0 };
  return {
    heir_id: 'h1',
    heir_name: 'Heir One',
    heir_category: 'LegitimateChildGroup',
    inherits_by: 'OwnRight',
    represents: null,
    from_legitime: zero,
    from_free_portion: zero,
    from_intestate: zero,
    total: zero,
    legitime_fraction: '0/1',
    legal_basis: [],
    donations_imputed: zero,
    gross_entitlement: zero,
    net_from_estate: zero,
    ...partial,
  } as InheritanceShare;
}

// The measured payloads, verbatim.
const PRETERITION_DESCRIPTION =
  'Art. 854: compulsory heir totally omitted — all institutions annulled';
const RA_11642_DESCRIPTION =
  'A pre-2022 adoption decree under RA 8552 raises the RA 11642 Sec. 41 retroactivity question. See .planning/LAWYER-AGENDA.md entry LAWYER-08.';

describe('warnings-lines > constants', () => {
  it('the heading is the words the results screen already used', () => {
    expect(WARNINGS_HEADING).toBe('Manual Review Required');
  });

  it('the related-heir label is the words the results screen already used', () => {
    expect(RELATED_HEIR_LABEL).toBe('Related heir:');
  });
});

describe('warnings-lines > getWarningSeverity', () => {
  it('preterition is an error', () => {
    expect(getWarningSeverity('preterition')).toBe('error');
  });

  it('max_restarts is an error', () => {
    expect(getWarningSeverity('max_restarts')).toBe('error');
  });

  it('inofficiousness is a warning', () => {
    expect(getWarningSeverity('inofficiousness')).toBe('warning');
  });

  it('disinheritance is a warning', () => {
    expect(getWarningSeverity('disinheritance')).toBe('warning');
  });

  it('vacancy_unresolved is a warning', () => {
    expect(getWarningSeverity('vacancy_unresolved')).toBe('warning');
  });

  it('unknown_donee is info', () => {
    expect(getWarningSeverity('unknown_donee')).toBe('info');
  });

  it('an unmapped category falls through to info rather than being dropped', () => {
    expect(getWarningSeverity('RA_11642_RETROACTIVITY')).toBe('info');
  });

  it('the empty string falls through to info', () => {
    expect(getWarningSeverity('')).toBe('info');
  });
});

describe('warnings-lines > buildWarningLines, the 06-testate-charity shape', () => {
  const lines = buildWarningLines(
    [flag({ category: 'preterition', description: PRETERITION_DESCRIPTION, related_heir_id: null })],
    [],
  );

  it('produces exactly one line', () => {
    expect(lines).toHaveLength(1);
  });

  it('classifies it as an error', () => {
    expect(lines[0]!.severity).toBe('error');
  });

  it('carries the engine category through unchanged', () => {
    expect(lines[0]!.category).toBe('preterition');
  });

  it('carries the engine description through character for character', () => {
    expect(lines[0]!.description).toBe(PRETERITION_DESCRIPTION);
  });

  it('names no heir, because the engine named none', () => {
    expect(lines[0]!.relatedHeirName).toBeNull();
  });
});

describe('warnings-lines > buildWarningLines, the 17-adopted-child shape', () => {
  const lines = buildWarningLines(
    [
      flag({
        category: 'RA_11642_RETROACTIVITY',
        description: RA_11642_DESCRIPTION,
        related_heir_id: 'ac1',
      }),
    ],
    [share({ heir_id: 'ac1', heir_name: 'Adopted Child' })],
  );

  it('produces exactly one line', () => {
    expect(lines).toHaveLength(1);
  });

  it('classifies the unmapped category as info', () => {
    expect(lines[0]!.severity).toBe('info');
  });

  it('resolves the related heir name from the awarded shares', () => {
    expect(lines[0]!.relatedHeirName).toBe('Adopted Child');
  });

  it('carries the description through character for character', () => {
    expect(lines[0]!.description).toBe(RA_11642_DESCRIPTION);
  });

  it('keeps the lawyer-agenda reference in the text', () => {
    expect(lines[0]!.description).toContain('LAWYER-08');
  });
});

describe('warnings-lines > buildWarningLines, the unresolved heir', () => {
  it('states loudly that a named heir was not awarded, rather than dropping the field', () => {
    const lines = buildWarningLines(
      [flag({ category: 'RA_11642_RETROACTIVITY', related_heir_id: 'ac1' })],
      [],
    );
    expect(lines[0]!.relatedHeirName).toBe('UNRESOLVED HEIR ac1');
  });
});

describe('warnings-lines > buildWarningLines, order and count', () => {
  it('preserves input order across three flags', () => {
    const lines = buildWarningLines(
      [
        flag({ category: 'preterition' }),
        flag({ category: 'inofficiousness' }),
        flag({ category: 'unknown_donee' }),
      ],
      [],
    );
    expect(lines.map((l) => l.category)).toEqual([
      'preterition',
      'inofficiousness',
      'unknown_donee',
    ]);
  });

  it('returns an empty array for an empty input', () => {
    expect(buildWarningLines([], [])).toHaveLength(0);
  });

  it('does not de-duplicate two identical flags', () => {
    const identical = flag({ category: 'preterition', description: PRETERITION_DESCRIPTION });
    const lines = buildWarningLines([identical, identical], []);
    expect(lines).toHaveLength(2);
  });
});
