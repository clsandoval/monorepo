/**
 * Subject: `frontend/src/lib/form1801-csv.ts` — the machine-readable exit from
 * BIR Form 1801 (RET-03, RET-04).
 *
 * Source of truth for which rows exist and what they are called:
 * `lib/estate-tax-engine/form1801-lines.ts`. Every `output` here is produced by
 * the REAL `computeEstateTax`, never by a hand-written literal.
 *
 * The load-bearing cases are 7 and 9. Case 7 asserts the total cell is the bare
 * integer `500000000` — a locale-formatted string in this column would silently
 * cost the reader their centavos. Case 9 asserts a declined line writes its
 * words rather than a `0`, because a zero is a claim that nothing is owed.
 */

import { describe, it, expect } from 'vitest';
import {
  escapeCsvField,
  neutraliseFormula,
  buildForm1801Csv,
  buildForm1801CsvFilename,
} from '../form1801-csv';
import { computeEstateTax, buildForm1801Lines, FORM1801_LINE_IDS } from '../estate-tax-engine';
import { createDefaultEstateTaxState } from '@/types/estate-tax';
import type { EstateTaxFullOutput } from '../estate-tax-engine';

function makeOutput(dateOfDeath: string, preTrainExpenses = false): EstateTaxFullOutput {
  const state = createDefaultEstateTaxState();
  state.decedent.name = 'Test Decedent';
  state.decedent.dateOfDeath = dateOfDeath;
  state.decedent.address = '123 Test St';
  state.executor.name = 'Test Executor';
  state.realProperties = [
    {
      id: 'rp1',
      titleNumber: 'T-123456',
      taxDecNumber: 'TD-1',
      location: 'Quezon City',
      lotArea: 250,
      improvementArea: null,
      classification: 'residential',
      fmvTaxDec: 8_000_000,
      fmvBirZonal: 9_000_000,
      ownership: 'exclusive',
      isFamilyHome: false,
      hasBarangayCert: false,
    },
  ];
  if (preTrainExpenses) {
    state.ordinaryDeductions.funeralExpenses = 100_000;
    state.ordinaryDeductions.judicialAdminExpenses = 50_000;
  }
  return computeEstateTax(state);
}

const trainOutput = () => makeOutput('2020-06-15');
const preTrainOutput = () => makeOutput('2015-06-15', true);

/** Split the document into records on CRLF. */
function records(csv: string): string[] {
  return csv.split('\r\n');
}

/** The data row for a line id, located via the model's own ordering. */
function rowForId(csv: string, id: string): string {
  const { lines } = buildForm1801Lines(trainOutput());
  const index = lines.findIndex((l) => l.id === id);
  // 4 provenance records (3 + blank) then the header, then the data rows.
  return records(csv)[5 + index] ?? '';
}

describe('escapeCsvField', () => {
  it('(1) leaves a plain value unchanged', () => {
    expect(escapeCsvField('Quezon City')).toBe('Quezon City');
  });

  it('(2) wraps a value containing a comma', () => {
    expect(escapeCsvField('Lot 4, Block 12, Quezon City')).toBe('"Lot 4, Block 12, Quezon City"');
  });

  it('(3) wraps and doubles embedded quotes', () => {
    expect(escapeCsvField('He said "sold"')).toBe('"He said ""sold"""');
  });

  it('(4) wraps a value containing a line feed', () => {
    expect(escapeCsvField('line one\nline two')).toBe('"line one\nline two"');
  });
});

describe('neutraliseFormula', () => {
  it('(5) prefixes every formula-triggering leading character', () => {
    expect(neutraliseFormula('=SUM(A1:A2)')).toBe("'=SUM(A1:A2)");
    expect(neutraliseFormula('+1')).toBe("'+1");
    expect(neutraliseFormula('-1')).toBe("'-1");
    expect(neutraliseFormula('@x')).toBe("'@x");
  });

  it('(6) leaves an ordinary label unchanged', () => {
    expect(neutraliseFormula('Standard Deduction')).toBe('Standard Deduction');
  });
});

describe('buildForm1801Csv', () => {
  it('(7) writes the six column names in order', () => {
    const csv = buildForm1801Csv(trainOutput(), 'Test Decedent');
    expect(records(csv)[4]).toBe(
      'Item,Description,Exclusive (centavos),Conjugal (centavos),Total (centavos),Authority',
    );
  });

  it('(8) writes one data row per declared line id', () => {
    const csv = buildForm1801Csv(trainOutput(), 'Test Decedent');
    const dataRows = records(csv).slice(5, 5 + FORM1801_LINE_IDS.length);

    expect(dataRows).toHaveLength(FORM1801_LINE_IDS.length);
    for (const dataRow of dataRows) {
      expect(dataRow).not.toBe('');
    }
  });

  it('(9) writes the standard deduction as the exact integer 500000000', () => {
    const csv = buildForm1801Csv(trainOutput(), 'Test Decedent');
    const cells = rowForId(csv, 'sp-standard-deduction').split(',');

    expect(cells[4]).toBe('500000000');
  });

  it('(10) carries the governing section on the standard-deduction row', () => {
    const csv = buildForm1801Csv(trainOutput(), 'Test Decedent');
    expect(rowForId(csv, 'sp-standard-deduction')).toContain('NIRC Sec. 86(A)(4)');
  });

  it('(11) never writes a bare zero for a declined line', () => {
    const csv = buildForm1801Csv(trainOutput(), 'Test Decedent');
    const { lines } = buildForm1801Lines(trainOutput());
    const declined = lines.filter((l) => l.total === null);

    expect(declined.length).toBeGreaterThan(0);
    for (const line of declined) {
      const cells = rowForId(csv, line.id).split(',');
      expect(cells[4]).not.toBe('0');
      expect(cells[4]).toBe(line.displayTotal);
    }
  });

  it('(12) separates records with CRLF and never a bare LF', () => {
    const csv = buildForm1801Csv(trainOutput(), 'Test Decedent');

    expect(csv).toContain('\r\n');
    // Every LF in the document must be preceded by a CR.
    for (let i = 0; i < csv.length; i++) {
      if (csv[i] === '\n') {
        expect(csv[i - 1]).toBe('\r');
      }
    }
  });

  it('(13) carries a provenance block naming the unit', () => {
    const csv = buildForm1801Csv(trainOutput(), 'Test Decedent');
    const head = records(csv).slice(0, 3);

    expect(head[0]).toContain('Test Decedent');
    expect(head[2]).toContain('centavos');
  });

  it('(14) writes a MANUAL REVIEW row naming both schedules on the pre-TRAIN fact set', () => {
    const csv = buildForm1801Csv(preTrainOutput(), 'Test Decedent');
    const review = records(csv).filter((r) => r.startsWith('MANUAL REVIEW'));

    expect(review.length).toBeGreaterThan(0);
    expect(review.join(' ')).toContain('Schedule 5');
    expect(review.join(' ')).toContain('Schedule 6');
  });
});

describe('buildForm1801CsvFilename', () => {
  it('(15) builds a slugged, dated filename', () => {
    expect(buildForm1801CsvFilename('Juan dela Cruz', '2026-06-15')).toBe(
      'form1801-juan-dela-cruz-2026-06-15.csv',
    );
  });

  it('(16) strips a comma and a slash out of the decedent name', () => {
    const filename = buildForm1801CsvFilename('Juan, dela/Cruz', '2026-06-15');

    expect(filename).not.toContain(',');
    expect(filename).not.toContain('/');
  });
});
