/**
 * AttributionSection — the attorney signature block on the exported report.
 *
 * PROVENANCE, from `.planning/phases/23-.../23-RESEARCH.md` §1 and §2.
 *
 * §1 measured that no attribution block existed anywhere in `EstatePDF`. The
 * nearest thing was a single 8-point grey line inside the letterhead, confirmed
 * by rendering the real document:
 *
 *   Alpha Attorney | IBP Roll No. IBP-000002 | PTR No. PTR-000003 | MCLE No. MCLE-000004
 *
 * §2 measured that `user_profiles` held four of the five identifiers ROADMAP
 * Phase 23 criterion 2 names, and migration 016 added the fifth.
 *
 * THESE CASES REPLACE AND STRENGTHEN the two `FirmHeaderSection` cases that
 * plan 23-04 task 2 relocated out of `pdf.test.tsx`. What was one concatenated
 * grey line — unlabelled per field, dropped whole when `counselName` was empty,
 * and unable to state that a credential was missing — is now five labelled
 * lines with an explicit absent marker.
 *
 * The five values below are pairwise DISTINCT so a crossed binding cannot pass
 * by coincidence.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('@react-pdf/renderer', () => ({
  View: ({ children, style, ...props }: any) => <div {...props}>{children}</div>,
  Text: ({ children, style, ...props }: any) => <span {...props}>{children}</span>,
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T): T => styles,
  },
}));

vi.mock('../../../lib/supabase', () => ({
  supabase: { from: vi.fn(), storage: { from: vi.fn() }, auth: { getUser: vi.fn() } },
  supabaseConfigured: false,
}));

import { AttributionSection, ATTRIBUTION_LABELS } from '../AttributionSection';
import { defaultFirmProfile } from '../../../lib/firm-profile';

const FULL = {
  ...defaultFirmProfile(),
  counselName: 'Alpha Attorney',
  rollOfAttorneysNo: 'R-000001',
  ibpRollNo: 'IBP-000002',
  ptrNo: 'PTR-000003',
  mcleComplianceNo: 'MCLE-000004',
};

const EXPECTED_LINES = [
  'Counsel: Alpha Attorney',
  'Roll of Attorneys No.: R-000001',
  'IBP Roll No.: IBP-000002',
  'PTR No.: PTR-000003',
  'MCLE Compliance No.: MCLE-000004',
];

describe('AttributionSection > fully populated profile', () => {
  it('renders the heading', () => {
    const { container } = render(<AttributionSection profile={FULL} />);
    expect(container.textContent).toContain('Attorney Attribution');
  });

  // Five separate assertions, each binding one label to one distinct value.
  for (const expected of EXPECTED_LINES) {
    it(`renders "${expected}"`, () => {
      const { container } = render(<AttributionSection profile={FULL} />);
      expect(container.textContent).toContain(expected);
    });
  }

  it('marks nothing absent when everything is on file', () => {
    const { container } = render(<AttributionSection profile={FULL} />);
    expect(container.textContent).not.toContain('NOT ON FILE');
    expect(container.textContent).not.toContain('ATTORNEY ATTRIBUTION UNAVAILABLE');
  });

  it('states each label exactly once, so the letterhead cannot repeat them', () => {
    const { container } = render(<AttributionSection profile={FULL} />);
    const text = container.textContent ?? '';
    for (const { label } of ATTRIBUTION_LABELS) {
      expect(text.split(label).length - 1).toBe(1);
    }
  });
});

describe('AttributionSection > partly populated profile', () => {
  const PARTIAL = { ...defaultFirmProfile(), counselName: 'Alpha Attorney' };

  it('prints the value it has', () => {
    const { container } = render(<AttributionSection profile={PARTIAL} />);
    expect(container.textContent).toContain('Counsel: Alpha Attorney');
  });

  it('marks every absent credential rather than omitting its line', () => {
    const { container } = render(<AttributionSection profile={PARTIAL} />);
    const text = container.textContent ?? '';
    expect(text).toContain('Roll of Attorneys No.: NOT ON FILE');
    expect(text).toContain('IBP Roll No.: NOT ON FILE');
    expect(text).toContain('PTR No.: NOT ON FILE');
    expect(text).toContain('MCLE Compliance No.: NOT ON FILE');
  });
});

describe('AttributionSection > a whitespace-only stored value is absent, not blank', () => {
  it('renders NOT ON FILE for a PTR number of spaces', () => {
    const { container } = render(
      <AttributionSection profile={{ ...FULL, ptrNo: '   ' }} />,
    );
    expect(container.textContent).toContain('PTR No.: NOT ON FILE');
  });
});

describe('AttributionSection > absent profile', () => {
  it('still renders the heading, so the block is never silently missing', () => {
    const { container } = render(<AttributionSection profile={null} />);
    expect(container.textContent).toContain('Attorney Attribution');
  });

  it('says on its own face that no profile was loaded', () => {
    const { container } = render(<AttributionSection profile={null} />);
    expect(container.textContent).toContain('ATTORNEY ATTRIBUTION UNAVAILABLE');
  });

  it('prints none of the five labels', () => {
    const { container } = render(<AttributionSection profile={null} />);
    const text = container.textContent ?? '';
    for (const { label } of ATTRIBUTION_LABELS) {
      expect(text).not.toContain(label);
    }
  });
});
