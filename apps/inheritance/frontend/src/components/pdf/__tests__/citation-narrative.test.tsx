/**
 * Rendered-output guards for INST-04: no markdown asterisk, no repeated article.
 *
 * PROVENANCE — the two measured facts these tests guard, from
 * `.planning/phases/23-.../23-RESEARCH.md` §5 and §6.
 *
 * §5: every one of the twenty committed engine cases emits at least one
 * narrative containing `**`, and `**` appears in narratives ONLY — not in the
 * computation log and not in any warning. `toPdfSafeText`'s own header states
 * it strips no markdown, and `@react-pdf/renderer` does not parse markdown, so
 * the markers printed verbatim on the exported page.
 *
 * §6: the audit's literal string `Art. 996: Art. 996` no longer occurs anywhere
 * in `frontend/src/` — Phase 17 added the missing map entry and replaced the
 * key fallback with a loud `CITATION NOT RESOLVED`. The duplication survived in
 * a different form, and rendering the real document confirmed it character for
 * character before this change:
 *
 *   Art. 980: Children of the deceased shall always inherit from him (Art. 980 NCC)
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { InheritanceShare, HeirNarrative, Money } from '../../../types';

// Mock @react-pdf/renderer so the PDF primitives render as HTML in jsdom,
// exactly as pdf.test.tsx does.
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Page: ({ children, size, ...props }: any) => <div {...props}>{children}</div>,
  View: ({ children, style, ...props }: any) => <div {...props}>{children}</div>,
  Text: ({ children, style, ...props }: any) => <span {...props}>{children}</span>,
  Image: ({ src, ...props }: any) => <img src={src} {...props} />,
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T): T => styles,
  },
}));

import { NarrativesSection } from '../NarrativesSection';
import { PerHeirBreakdownSection } from '../PerHeirBreakdownSection';

// ── Local builders (no shared fixture module exists in this codebase) ──

function money(pesos: number): Money {
  return { centavos: pesos * 100 };
}

function zero(): Money {
  return { centavos: 0 };
}

function createShare(overrides: Partial<InheritanceShare> = {}): InheritanceShare {
  return {
    heir_id: 'heir-1',
    heir_name: 'Maria Santos',
    heir_category: 'LegitimateChildGroup',
    inherits_by: 'OwnRight',
    represents: null,
    from_legitime: money(500000),
    from_free_portion: zero(),
    from_intestate: zero(),
    total: money(500000),
    legitime_fraction: '1/2',
    legal_basis: ['Art.887'],
    donations_imputed: zero(),
    gross_entitlement: money(500000),
    net_from_estate: money(500000),
    ...overrides,
  };
}

function createNarrative(overrides: Partial<HeirNarrative> = {}): HeirNarrative {
  return {
    heir_id: 'heir-1',
    heir_name: 'Maria Santos',
    heir_category_label: 'Legitimate Child',
    text: 'Plain sentence.',
    ...overrides,
  };
}

// Declared here, NOT imported from product code: a test that counts with the
// same expression the product strips with would agree with itself rather than
// with the document.
const ARTICLE_TOKEN = /Art\.\s*\d+/g;

function articleCount(text: string): number {
  return (text.match(ARTICLE_TOKEN) ?? []).length;
}

describe('NarrativesSection > markdown emphasis never reaches the page', () => {
  it('strips the markers from the measured engine narrative, keeping every character between them', () => {
    const { container } = render(
      <NarrativesSection
        narratives={[
          createNarrative({
            text:
              '**Bio Child (legitimate child)** receives **PHP 3,000,000**. ' +
              'As a legitimate child, Bio Child is a compulsory heir.',
          }),
        ]}
      />,
    );

    expect(container.textContent).toContain('Bio Child (legitimate child)');
    expect(container.textContent).toContain('PHP 3,000,000');
    expect(container.textContent).not.toContain('*');
  });

  it('strips emphasis and converts the peso sign in the same narrative', () => {
    const { container } = render(
      <NarrativesSection
        narratives={[createNarrative({ text: '**Maria** receives **₱1,500,000**.' })]}
      />,
    );

    expect(container.textContent).toContain('Maria');
    expect(container.textContent).toContain('PHP 1,500,000');
    expect(container.textContent).not.toContain('*');
    expect(container.textContent).not.toContain('₱');
  });

  it('leaves a narrative with no emphasis unchanged', () => {
    const { container } = render(
      <NarrativesSection narratives={[createNarrative({ text: 'Plain sentence.' })]} />,
    );

    expect(container.textContent).toContain('Plain sentence.');
  });
});

describe('PerHeirBreakdownSection > a citation names its article once', () => {
  it('renders Art. 980 without the trailing parenthetical that repeated it', () => {
    const { container } = render(
      <PerHeirBreakdownSection shares={[createShare({ legal_basis: ['Art. 980'] })]} />,
    );

    expect(container.textContent).toContain('Children of the deceased shall always inherit from him');
    expect(articleCount(container.textContent ?? '')).toBe(1);
  });

  it('renders Art. 996 without the trailing parenthetical that repeated it', () => {
    const { container } = render(
      <PerHeirBreakdownSection shares={[createShare({ legal_basis: ['Art. 996'] })]} />,
    );

    expect(container.textContent).toContain('Surviving spouse with legitimate children');
    expect(articleCount(container.textContent ?? '')).toBe(1);
  });

  it('leaves a description that never carried a parenthetical alone', () => {
    const { container } = render(
      <PerHeirBreakdownSection shares={[createShare({ legal_basis: ['Art. 888'] })]} />,
    );

    expect(container.textContent).toContain("Legitimate children's legitime");
  });

  it('preserves the loud unresolved path Phase 17 installed', () => {
    const { container } = render(
      <PerHeirBreakdownSection shares={[createShare({ legal_basis: ['not an article at all'] })]} />,
    );

    expect(container.textContent).toContain('CITATION NOT RESOLVED');
  });

  it('renders no Legal Basis heading when the engine cited nothing', () => {
    const { container } = render(
      <PerHeirBreakdownSection shares={[createShare({ legal_basis: [] })]} />,
    );

    expect(container.textContent).not.toContain('Legal Basis');
  });
});
