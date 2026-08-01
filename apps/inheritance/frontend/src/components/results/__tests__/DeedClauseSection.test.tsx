/**
 * The results-view exit: the clause on screen, the copy control, the DOCX
 * download.
 *
 * The load-bearing assertion is that the `<pre>`'s `textContent` is byte-for-byte
 * the string `buildDeedClauseText` returned — that is what proves the screen
 * renders the builder's output rather than a second composition that could
 * carry a different figure.
 *
 * Mocking follows `ActionsBar.test.tsx`: `global.URL.createObjectURL` /
 * `revokeObjectURL` replaced with `vi.fn()` in `beforeEach`, and
 * `navigator.clipboard.writeText` spied via `vi.spyOn`.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DeedClauseSection } from '../DeedClauseSection';
import type { EngineInput, EngineOutput, InheritanceShare, ManualFlag } from '../../../types';
import { buildDeedSchedule } from '../../../lib/deed/schedule-lines';
import { buildDeedClauseText } from '../../../lib/deed/clause-text';

const ZERO = { centavos: 0 };

function makeShare(over: Partial<InheritanceShare> = {}): InheritanceShare {
  return {
    heir_id: 'lc1',
    heir_name: 'Juan Cruz',
    heir_category: 'LegitimateChildGroup',
    inherits_by: 'OwnRight',
    represents: null,
    from_legitime: ZERO,
    from_free_portion: ZERO,
    from_intestate: ZERO,
    total: { centavos: 500000000 },
    legitime_fraction: '1/1',
    legal_basis: ['Art. 979'],
    donations_imputed: ZERO,
    gross_entitlement: { centavos: 500000000 },
    net_from_estate: { centavos: 500000000 },
    ...over,
  } as InheritanceShare;
}

function makeInput(over: Partial<EngineInput> = {}): EngineInput {
  return {
    net_distributable_estate: { centavos: 500000000 },
    decedent: {
      id: 'd',
      name: 'Test Decedent',
      date_of_death: '2026-01-15',
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
    config: { max_pipeline_restarts: 10, retroactive_ra_11642: false },
    ...over,
  } as EngineInput;
}

function makeOutput(over: Partial<EngineOutput> = {}): EngineOutput {
  return {
    per_heir_shares: [makeShare()],
    narratives: [],
    computation_log: {
      steps: [],
      total_estate: { centavos: 500000000 },
      legitime_pool: ZERO,
      free_portion: ZERO,
    },
    warnings: [],
    succession_type: 'Intestate',
    scenario_code: 'A1',
    ...over,
  } as unknown as EngineOutput;
}

function expectedText(input: EngineInput, output: EngineOutput): string {
  return buildDeedClauseText(buildDeedSchedule(input, output));
}

describe('DeedClauseSection rendering', () => {
  it('renders the section wrapper', () => {
    const input = makeInput();
    const output = makeOutput();
    render(<DeedClauseSection input={input} output={output} />);
    expect(screen.getByTestId('deed-clause-section')).toBeInTheDocument();
  });

  it('renders exactly the builder string', () => {
    const input = makeInput();
    const output = makeOutput();
    render(<DeedClauseSection input={input} output={output} />);
    expect(screen.getByTestId('deed-clause-text').textContent).toBe(expectedText(input, output));
  });

  it('renders the clause inside a PRE element', () => {
    render(<DeedClauseSection input={makeInput()} output={makeOutput()} />);
    expect(screen.getByTestId('deed-clause-text').tagName).toBe('PRE');
  });

  it('offers an enabled copy control', () => {
    render(<DeedClauseSection input={makeInput()} output={makeOutput()} />);
    const button = screen.getByTestId('copy-deed-clause');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it('offers an enabled DOCX download control', () => {
    render(<DeedClauseSection input={makeInput()} output={makeOutput()} />);
    const button = screen.getByTestId('download-deed-docx');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });
});

describe('DeedClauseSection copy control', () => {
  it('copies exactly the rendered clause', async () => {
    const user = userEvent.setup();
    const input = makeInput();
    const output = makeOutput();
    render(<DeedClauseSection input={input} output={output} />);
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');

    await user.click(screen.getByTestId('copy-deed-clause'));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0]![0]).toBe(screen.getByTestId('deed-clause-text').textContent);
    writeText.mockRestore();
  });
});

describe('DeedClauseSection DOCX download', () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURL = vi.fn().mockReturnValue('blob:deed-test');
    revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    clickSpy.mockRestore();
  });

  it('creates exactly one object URL', async () => {
    const user = userEvent.setup();
    render(<DeedClauseSection input={makeInput()} output={makeOutput()} />);
    await user.click(screen.getByTestId('download-deed-docx'));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('builds a blob with the wordprocessingml MIME type', async () => {
    const user = userEvent.setup();
    render(<DeedClauseSection input={makeInput()} output={makeOutput()} />);
    await user.click(screen.getByTestId('download-deed-docx'));
    const blob = createObjectURL.mock.calls[0]![0] as Blob;
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
  });

  it('revokes the object URL it created', async () => {
    const user = userEvent.setup();
    render(<DeedClauseSection input={makeInput()} output={makeOutput()} />);
    await user.click(screen.getByTestId('download-deed-docx'));
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith(createObjectURL.mock.results[0]!.value);
  });

  it('names the file from the decedent and the date of death', async () => {
    const user = userEvent.setup();
    render(<DeedClauseSection input={makeInput()} output={makeOutput()} />);
    await user.click(screen.getByTestId('download-deed-docx'));
    const anchor = clickSpy.mock.instances[0] as unknown as HTMLAnchorElement;
    expect(anchor.getAttribute('download')).toBe(
      'deed-schedule-of-shares-test-decedent-2026-01-15.docx',
    );
  });
});

describe('DeedClauseSection refusal visibility', () => {
  it('shows a heir-scoped refusal on screen', () => {
    const flag: ManualFlag = {
      category: 'Art. 992 Iron Curtain',
      description: 'UNANSWERED: the engine declines to compute this relationship.',
      related_heir_id: 'lc1',
    };
    render(
      <DeedClauseSection
        input={makeInput()}
        output={makeOutput({ per_heir_shares: [makeShare()], warnings: [flag] })}
      />,
    );
    const text = screen.getByTestId('deed-clause-text').textContent!;
    expect(text).toContain('MANUAL REVIEW REQUIRED — NO SHARE STATED');
    expect(text).toContain(flag.description);
  });

  it('shows a document-scoped refusal on screen', () => {
    const flag: ManualFlag = {
      category: 'Reserva Troncal',
      description: 'A reserva troncal question arises on these facts.',
      related_heir_id: null,
    };
    render(<DeedClauseSection input={makeInput()} output={makeOutput({ warnings: [flag] })} />);
    expect(screen.getByTestId('deed-clause-text').textContent).toContain(
      'MANUAL REVIEW REQUIRED BEFORE THIS SCHEDULE IS USED',
    );
  });
});

describe('DeedClauseSection escaping', () => {
  it('renders a heir name with ampersands and angle brackets unaltered', () => {
    const output = makeOutput({ per_heir_shares: [makeShare({ heir_name: 'Ana & <Ben>' })] });
    render(<DeedClauseSection input={makeInput()} output={output} />);
    expect(screen.getByTestId('deed-clause-text').textContent).toContain('Ana & <Ben>');
  });
});
