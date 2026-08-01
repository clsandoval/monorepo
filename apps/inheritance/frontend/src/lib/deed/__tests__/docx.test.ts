/**
 * The three-part OPC package, the XML escaping and the clause round trip.
 *
 * Source of truth for the layout asserted here:
 * `.planning/phases/22-deed-of-extrajudicial-settlement-schedule-of-shares/22-RESEARCH.md` §3.
 *
 * `readStoredZip` below is LOCAL TO THIS FILE on purpose, and parses the
 * archive the way the parity gate will: a shared reader imported by both the
 * test and the writer would let a single mistake satisfy both sides.
 */

import { describe, it, expect } from 'vitest';
import type {
  EngineInput,
  EngineOutput,
  InheritanceShare,
  ManualFlag,
} from '../../../types';
import { buildDeedSchedule } from '../schedule-lines';
import { buildDeedClauseText } from '../clause-text';
import {
  buildDeedClauseDocx,
  escapeXmlText,
  extractDocxParagraphs,
  DOCX_PART_NAMES,
} from '../docx';

function readStoredZip(bytes: Uint8Array): Map<string, string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) {
    throw new Error('ZIP READ: no end of central directory');
  }

  const count = view.getUint16(eocd + 10, true);
  let off = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  const out = new Map<string, string>();

  for (let i = 0; i < count; i += 1) {
    if (view.getUint32(off, true) !== 0x02014b50) {
      throw new Error('ZIP READ: bad central header signature at ' + off);
    }
    const nameLen = view.getUint16(off + 28, true);
    const extraLen = view.getUint16(off + 30, true);
    const commentLen = view.getUint16(off + 32, true);
    const localOffset = view.getUint32(off + 42, true);
    const name = decoder.decode(bytes.subarray(off + 46, off + 46 + nameLen));

    if (view.getUint32(localOffset, true) !== 0x04034b50) {
      throw new Error('ZIP READ: bad local header signature for ' + name);
    }
    if (view.getUint16(localOffset + 8, true) !== 0) {
      throw new Error('ZIP READ: entry is not stored: ' + name);
    }
    const size = view.getUint32(localOffset + 18, true);
    const localNameLen = view.getUint16(localOffset + 26, true);
    const localExtraLen = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLen + localExtraLen;
    out.set(name, decoder.decode(bytes.subarray(start, start + size)));

    off += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

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

/** Two stated lines, one refused line, and one document-level refusal. */
function mixedSchedule(input: EngineInput = makeInput()) {
  const output = makeOutput({
    per_heir_shares: [
      makeShare({ heir_id: 'a', heir_name: 'Ana Reyes', net_from_estate: { centavos: 123456789 } }),
      makeShare({ heir_id: 'b', heir_name: 'Ben Reyes', net_from_estate: { centavos: 250001 } }),
      makeShare({ heir_id: 'c', heir_name: 'Cel Reyes', legal_basis: [] }),
    ],
    warnings: [makeFlag({ related_heir_id: null })],
  });
  return buildDeedSchedule(input, output);
}

describe('DOCX part set', () => {
  it('holds exactly three parts', () => {
    const parts = readStoredZip(buildDeedClauseDocx(mixedSchedule()));
    expect(parts.size).toBe(3);
  });

  it('holds them in the declared order', () => {
    const parts = readStoredZip(buildDeedClauseDocx(mixedSchedule()));
    expect([...parts.keys()]).toEqual([...DOCX_PART_NAMES]);
  });

  it('declares the main document content type', () => {
    const parts = readStoredZip(buildDeedClauseDocx(mixedSchedule()));
    expect(parts.get('[Content_Types].xml')).toContain('PartName="/word/document.xml"');
    expect(parts.get('[Content_Types].xml')).toContain(
      'wordprocessingml.document.main+xml',
    );
  });

  it('relates the package root to the document part', () => {
    const parts = readStoredZip(buildDeedClauseDocx(mixedSchedule()));
    expect(parts.get('_rels/.rels')).toContain('Target="word/document.xml"');
    expect(parts.get('_rels/.rels')).toContain('Id="rId1"');
  });

  it('opens every part with the XML prolog', () => {
    const parts = readStoredZip(buildDeedClauseDocx(mixedSchedule()));
    for (const body of parts.values()) {
      expect(body.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')).toBe(true);
    }
  });

  it('ships no style sheet, theme, fontTable, settings or docProps', () => {
    const parts = readStoredZip(buildDeedClauseDocx(mixedSchedule()));
    for (const name of parts.keys()) {
      expect(name).not.toContain('styles');
      expect(name).not.toContain('theme');
      expect(name).not.toContain('fontTable');
      expect(name).not.toContain('settings');
      expect(name).not.toContain('docProps');
    }
  });
});

describe('DOCX round trip', () => {
  it('re-extracts to the clause text character for character', () => {
    const schedule = mixedSchedule();
    const parts = readStoredZip(buildDeedClauseDocx(schedule));
    const recovered = extractDocxParagraphs(parts.get('word/document.xml')!).join('\n');
    expect(recovered).toBe(buildDeedClauseText(schedule));
  });

  it('emits one paragraph per clause line', () => {
    const schedule = mixedSchedule();
    const parts = readStoredZip(buildDeedClauseDocx(schedule));
    const paragraphs = extractDocxParagraphs(parts.get('word/document.xml')!);
    expect(paragraphs.length).toBe(buildDeedClauseText(schedule).split('\n').length);
  });

  it('renders an empty clause line as a self-closing paragraph', () => {
    const schedule = mixedSchedule();
    const parts = readStoredZip(buildDeedClauseDocx(schedule));
    const xml = parts.get('word/document.xml')!;
    expect(xml).toContain('<w:p/>');
    expect(extractDocxParagraphs(xml)).toContain('');
  });

  it('preserves the three-space indentation of continuation lines', () => {
    const schedule = mixedSchedule();
    const parts = readStoredZip(buildDeedClauseDocx(schedule));
    const paragraphs = extractDocxParagraphs(parts.get('word/document.xml')!);
    expect(paragraphs.some((p) => p.startsWith('   Share: PHP '))).toBe(true);
  });
});

describe('XML escaping', () => {
  it('escapes an ampersand', () => {
    expect(escapeXmlText('a & b')).toBe('a &amp; b');
  });

  it('escapes angle brackets', () => {
    expect(escapeXmlText('<x>')).toBe('&lt;x&gt;');
  });

  it('replaces the ampersand first, so an escape is not double-escaped', () => {
    expect(escapeXmlText('&lt;')).toBe('&amp;lt;');
  });

  it('leaves quotes untouched', () => {
    expect(escapeXmlText(`he said "hi" and 'bye'`)).toBe(`he said "hi" and 'bye'`);
  });

  it('round-trips a name carrying a close-tag injection', () => {
    const input = makeInput();
    input.decedent.name = 'Ampersand & <Angle> </w:t></w:r></w:p> Injection';
    const schedule = mixedSchedule(input);
    const parts = readStoredZip(buildDeedClauseDocx(schedule));
    const recovered = extractDocxParagraphs(parts.get('word/document.xml')!).join('\n');
    expect(recovered).toBe(buildDeedClauseText(schedule));
    expect(recovered).toContain('Ampersand & <Angle> </w:t></w:r></w:p> Injection');
  });

  it('a close-tag injection creates no extra element', () => {
    const input = makeInput();
    input.decedent.name = 'Ampersand & <Angle> </w:t></w:r></w:p> Injection';
    const schedule = mixedSchedule(input);
    const parts = readStoredZip(buildDeedClauseDocx(schedule));
    const xml = parts.get('word/document.xml')!;
    const opens = xml.split('<w:t xml:space="preserve">').length - 1;
    const nonEmptyLines = buildDeedClauseText(schedule)
      .split('\n')
      .filter((l) => l !== '').length;
    expect(opens).toBe(nonEmptyLines);
  });
});

describe('determinism', () => {
  it('produces byte-identical archives for the same schedule', () => {
    const first = buildDeedClauseDocx(mixedSchedule());
    const second = buildDeedClauseDocx(mixedSchedule());
    expect(first.length).toBe(second.length);
    for (let i = 0; i < first.length; i += 1) {
      expect(first[i]).toBe(second[i]);
    }
  });
});

describe('figure integrity', () => {
  it('carries the exact peso string the clause states, the same number of times', () => {
    const schedule = mixedSchedule();
    const text = buildDeedClauseText(schedule);
    expect(schedule.lines[0]!.displayAmount).toBe('PHP 1,234,567.89');
    const parts = readStoredZip(buildDeedClauseDocx(schedule));
    const recovered = extractDocxParagraphs(parts.get('word/document.xml')!).join('\n');
    const countIn = (s: string) => s.split('PHP 1,234,567.89').length - 1;
    expect(countIn(recovered)).toBe(countIn(text));
    expect(countIn(recovered)).toBeGreaterThan(0);
  });

  it('states no peso amount in a refused heir paragraph', () => {
    const schedule = mixedSchedule();
    const parts = readStoredZip(buildDeedClauseDocx(schedule));
    const paragraphs = extractDocxParagraphs(parts.get('word/document.xml')!);
    const start = paragraphs.findIndex((p) => p.startsWith('3. Cel Reyes'));
    expect(start).toBeGreaterThanOrEqual(0);
    for (let i = start; i < paragraphs.length && paragraphs[i] !== ''; i += 1) {
      expect(paragraphs[i]).not.toContain('PHP ');
    }
  });
});
