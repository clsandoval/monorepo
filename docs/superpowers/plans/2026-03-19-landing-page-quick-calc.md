# Landing Page Quick Calc Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the landing page hero CTAs with an inline quick-calc widget that lets unauthenticated visitors run one free intestate inheritance calculation, showing partial results with a blur gate to drive signups.

**Architecture:** A new `QuickCalc` component tree lives in `src/components/quick-calc/`. The widget builds a valid `EngineInput` from simplified inputs (estate amount + heir relationship chips), validates via `EngineInputSchema`, computes via `computeWasm()`, and renders partial results. A `sessionStorage` flag gates repeat calculations. The landing page (`src/routes/index.tsx`) swaps the hero CTA block for the widget.

**Tech Stack:** React, TypeScript, Zod (existing schemas), WASM bridge (existing), shadcn/ui components (Button, Input, Select, Badge, Card), Vitest + jsdom

**Spec:** `docs/superpowers/specs/2026-03-19-landing-page-quick-calc-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/components/quick-calc/defaults.ts` | Per-relationship `Person` defaults table, `Decedent` template builder, `buildEngineInput()` function |
| `src/components/quick-calc/QuickCalcWidget.tsx` | Input form: estate amount, heir chips with add/remove, calculate button, session gate |
| `src/components/quick-calc/QuickCalcResults.tsx` | Results display: visible summary table + blurred detail sections with signup CTA overlay |
| `src/components/quick-calc/__tests__/defaults.test.ts` | Tests for `buildEngineInput()` — validates output passes `EngineInputSchema` |
| `src/components/quick-calc/__tests__/QuickCalcWidget.test.tsx` | Tests for widget interactions — add/remove heirs, calculate, session gate |
| `src/components/quick-calc/__tests__/QuickCalcResults.test.tsx` | Tests for results rendering — visible vs blurred sections |
| `src/routes/index.tsx` | Modified — swap hero CTAs for `<QuickCalcWidget />`, remove "try without an account" link |

---

### Task 1: defaults.ts — EngineInput Builder

**Files:**
- Create: `src/components/quick-calc/defaults.ts`
- Test: `src/components/quick-calc/__tests__/defaults.test.ts`

- [ ] **Step 1: Write the failing test for `buildEngineInput`**

Create `src/components/quick-calc/__tests__/defaults.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildEngineInput, type QuickCalcHeir } from '../defaults';
import { EngineInputSchema } from '@/schemas';

describe('buildEngineInput', () => {
  it('builds valid EngineInput for spouse + 2 legitimate children', () => {
    const heirs: QuickCalcHeir[] = [
      { type: 'SurvivingSpouse' },
      { type: 'LegitimateChild' },
      { type: 'LegitimateChild' },
    ];
    const input = buildEngineInput(1_000_000_00, heirs); // 1M pesos in centavos
    const result = EngineInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('builds valid EngineInput for illegitimate child (sets filiation defaults)', () => {
    const heirs: QuickCalcHeir[] = [{ type: 'IllegitimateChild' }];
    const input = buildEngineInput(500_000_00, heirs);
    const result = EngineInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    expect(input.family_tree[0].filiation_proved).toBe(true);
    expect(input.family_tree[0].filiation_proof_type).toBe('BirthCertificate');
  });

  it('builds valid EngineInput for father + mother (sets line defaults)', () => {
    const heirs: QuickCalcHeir[] = [{ type: 'Father' }, { type: 'Mother' }];
    const input = buildEngineInput(500_000_00, heirs);
    const result = EngineInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    expect(input.family_tree[0].line).toBe('Paternal');
    expect(input.family_tree[1].line).toBe('Maternal');
  });

  it('builds valid EngineInput for siblings (sets blood_type default)', () => {
    const heirs: QuickCalcHeir[] = [{ type: 'Brother' }, { type: 'Sister' }];
    const input = buildEngineInput(500_000_00, heirs);
    const result = EngineInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    expect(input.family_tree[0].blood_type).toBe('Full');
    expect(input.family_tree[1].blood_type).toBe('Full');
  });

  it('sets is_married=true and date_of_marriage when spouse present', () => {
    const heirs: QuickCalcHeir[] = [{ type: 'SurvivingSpouse' }];
    const input = buildEngineInput(500_000_00, heirs);
    expect(input.decedent.is_married).toBe(true);
    expect(input.decedent.date_of_marriage).not.toBeNull();
  });

  it('sets is_married=false when no spouse present', () => {
    const heirs: QuickCalcHeir[] = [{ type: 'LegitimateChild' }];
    const input = buildEngineInput(500_000_00, heirs);
    expect(input.decedent.is_married).toBe(false);
    expect(input.decedent.date_of_marriage).toBeNull();
  });

  it('auto-generates unique heir names', () => {
    const heirs: QuickCalcHeir[] = [
      { type: 'LegitimateChild' },
      { type: 'LegitimateChild' },
      { type: 'LegitimateChild' },
    ];
    const input = buildEngineInput(500_000_00, heirs);
    const names = input.family_tree.map(p => p.name);
    expect(new Set(names).size).toBe(3);
    expect(names[0]).toBe('Child 1');
    expect(names[1]).toBe('Child 2');
    expect(names[2]).toBe('Child 3');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/inheritance/frontend && npx vitest run src/components/quick-calc/__tests__/defaults.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write `defaults.ts` implementation**

Create `src/components/quick-calc/defaults.ts`:

```typescript
import type { EngineInput, Person, Decedent, Relationship, LineOfDescent, FiliationProof, BloodType } from '@/types';

export type QuickCalcHeirType =
  | 'SurvivingSpouse'
  | 'LegitimateChild'
  | 'IllegitimateChild'
  | 'Father'
  | 'Mother'
  | 'Brother'
  | 'Sister';

export interface QuickCalcHeir {
  type: QuickCalcHeirType;
}

/** Display labels for the heir type dropdown */
export const HEIR_TYPE_LABELS: Record<QuickCalcHeirType, string> = {
  SurvivingSpouse: 'Surviving Spouse',
  LegitimateChild: 'Legitimate Child',
  IllegitimateChild: 'Illegitimate Child',
  Father: 'Father',
  Mother: 'Mother',
  Brother: 'Brother',
  Sister: 'Sister',
};

/** Which heir types can only appear once */
export const SINGLETON_TYPES: QuickCalcHeirType[] = ['SurvivingSpouse', 'Father', 'Mother'];

interface PersonDefaults {
  relationship_to_decedent: Relationship;
  degree: number;
  line: LineOfDescent | null;
  filiation_proved: boolean;
  filiation_proof_type: FiliationProof | null;
  blood_type: BloodType | null;
}

const PERSON_DEFAULTS: Record<QuickCalcHeirType, PersonDefaults> = {
  SurvivingSpouse: { relationship_to_decedent: 'SurvivingSpouse', degree: 1, line: null, filiation_proved: false, filiation_proof_type: null, blood_type: null },
  LegitimateChild: { relationship_to_decedent: 'LegitimateChild', degree: 1, line: null, filiation_proved: false, filiation_proof_type: null, blood_type: null },
  IllegitimateChild: { relationship_to_decedent: 'IllegitimateChild', degree: 1, line: null, filiation_proved: true, filiation_proof_type: 'BirthCertificate', blood_type: null },
  Father: { relationship_to_decedent: 'LegitimateParent', degree: 1, line: 'Paternal', filiation_proved: false, filiation_proof_type: null, blood_type: null },
  Mother: { relationship_to_decedent: 'LegitimateParent', degree: 1, line: 'Maternal', filiation_proved: false, filiation_proof_type: null, blood_type: null },
  Brother: { relationship_to_decedent: 'Sibling', degree: 2, line: null, filiation_proved: false, filiation_proof_type: null, blood_type: 'Full' },
  Sister: { relationship_to_decedent: 'Sibling', degree: 2, line: null, filiation_proved: false, filiation_proof_type: null, blood_type: 'Full' },
};

/** Name counters per category for auto-naming */
const NAME_TEMPLATES: Record<QuickCalcHeirType, string> = {
  SurvivingSpouse: 'Spouse',
  LegitimateChild: 'Child',
  IllegitimateChild: 'Illegitimate Child',
  Father: 'Father',
  Mother: 'Mother',
  Brother: 'Brother',
  Sister: 'Sister',
};

function buildPerson(heir: QuickCalcHeir, index: number, name: string): Person {
  const defaults = PERSON_DEFAULTS[heir.type];
  return {
    id: `quick-calc-${index}`,
    name,
    is_alive_at_succession: true,
    relationship_to_decedent: defaults.relationship_to_decedent,
    degree: defaults.degree,
    line: defaults.line,
    children: [],
    filiation_proved: defaults.filiation_proved,
    filiation_proof_type: defaults.filiation_proof_type,
    is_guilty_party_in_legal_separation: false,
    adoption: null,
    is_unworthy: false,
    unworthiness_condoned: false,
    has_renounced: false,
    blood_type: defaults.blood_type,
  };
}

function buildDecedent(hasSpouse: boolean): Decedent {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: 'decedent',
    name: 'Decedent',
    date_of_death: today,
    is_married: hasSpouse,
    date_of_marriage: hasSpouse ? '2000-01-01' : null,
    marriage_solemnized_in_articulo_mortis: false,
    was_ill_at_marriage: false,
    illness_caused_death: false,
    years_of_cohabitation: 0,
    has_legal_separation: false,
    is_illegitimate: false,
  };
}

/**
 * Build a valid EngineInput from quick-calc simplified inputs.
 * @param estateCentavos - estate value in centavos
 * @param heirs - list of heir types selected by user
 */
export function buildEngineInput(estateCentavos: number, heirs: QuickCalcHeir[]): EngineInput {
  const hasSpouse = heirs.some(h => h.type === 'SurvivingSpouse');

  // Auto-generate names with counters per category
  const counters: Record<string, number> = {};
  const familyTree = heirs.map((heir, i) => {
    const template = NAME_TEMPLATES[heir.type];
    counters[template] = (counters[template] || 0) + 1;
    const count = counters[template];
    // Singletons don't get a number suffix
    const name = SINGLETON_TYPES.includes(heir.type) ? template : `${template} ${count}`;
    return buildPerson(heir, i, name);
  });

  return {
    net_distributable_estate: { centavos: estateCentavos },
    decedent: buildDecedent(hasSpouse),
    family_tree: familyTree,
    will: null,
    donations: [],
    config: {
      retroactive_ra_11642: false,
      max_pipeline_restarts: 5,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/inheritance/frontend && npx vitest run src/components/quick-calc/__tests__/defaults.test.ts`
Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/quick-calc/defaults.ts src/components/quick-calc/__tests__/defaults.test.ts
git commit -m "feat(quick-calc): add EngineInput builder with per-relationship defaults"
```

---

### Task 2: QuickCalcResults — Partial Results with Blur Gate

**Files:**
- Create: `src/components/quick-calc/QuickCalcResults.tsx`
- Test: `src/components/quick-calc/__tests__/QuickCalcResults.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/quick-calc/__tests__/QuickCalcResults.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickCalcResults } from '../QuickCalcResults';
import type { EngineOutput, InheritanceShare, Money, EffectiveCategory } from '@/types';

// Mock TanStack Router (QuickCalcResults uses Link)
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

function makeMoney(pesos: number): Money {
  return { centavos: pesos * 100 };
}

function makeShare(name: string, category: EffectiveCategory, total: Money): InheritanceShare {
  return {
    heir_id: `id-${name}`,
    heir_name: name,
    heir_category: category,
    inherits_by: 'OwnRight' as const,
    represents: null,
    from_legitime: makeMoney(0),
    from_free_portion: makeMoney(0),
    from_intestate: total,
    total,
    legitime_fraction: '0/1',
    legal_basis: [],
    donations_imputed: makeMoney(0),
    gross_entitlement: total,
    net_from_estate: total,
  };
}

const mockOutput: EngineOutput = {
  per_heir_shares: [
    makeShare('Spouse', 'SurvivingSpouseGroup', makeMoney(500_000)),
    makeShare('Child 1', 'LegitimateChildGroup', makeMoney(500_000)),
  ],
  narratives: [
    { heir_id: 'id-Spouse', heir_name: 'Spouse', heir_category_label: 'Surviving Spouse', text: 'Spouse gets half.' },
    { heir_id: 'id-Child 1', heir_name: 'Child 1', heir_category_label: 'Legitimate Child', text: 'Child gets half.' },
  ],
  computation_log: { steps: [{ step_number: 1, step_name: 'Init', description: 'test' }], total_restarts: 0, final_scenario: 'I3' },
  warnings: [],
  succession_type: 'Intestate',
  scenario_code: 'I3' as any,
};

describe('QuickCalcResults', () => {
  it('renders heir names and amounts in visible section', () => {
    render(<QuickCalcResults output={mockOutput} estateCentavos={1_000_000_00} />);
    expect(screen.getByText('Spouse')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  it('renders succession type badge', () => {
    render(<QuickCalcResults output={mockOutput} estateCentavos={1_000_000_00} />);
    expect(screen.getByText(/Intestate/)).toBeInTheDocument();
  });

  it('renders signup CTA in blurred section', () => {
    render(<QuickCalcResults output={mockOutput} estateCentavos={1_000_000_00} />);
    expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
  });

  it('renders blurred overlay container', () => {
    render(<QuickCalcResults output={mockOutput} estateCentavos={1_000_000_00} />);
    const blurred = document.querySelector('[data-testid="blur-overlay"]');
    expect(blurred).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/inheritance/frontend && npx vitest run src/components/quick-calc/__tests__/QuickCalcResults.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write `QuickCalcResults.tsx` implementation**

Create `src/components/quick-calc/QuickCalcResults.tsx`:

```tsx
import { Link } from '@tanstack/react-router';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EngineOutput } from '@/types';
import { EFFECTIVE_CATEGORY_LABELS, SUCCESSION_TYPE_LABELS, formatPeso } from '@/types';

interface QuickCalcResultsProps {
  output: EngineOutput;
  estateCentavos: number;
}

export function QuickCalcResults({ output, estateCentavos }: QuickCalcResultsProps) {
  return (
    <div className="mt-6 space-y-4">
      {/* Visible: Summary */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
          {SUCCESSION_TYPE_LABELS[output.succession_type]} &middot; {output.scenario_code}
        </span>
      </div>

      {/* Visible: Distribution table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Heir</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Category</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Share</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">%</th>
            </tr>
          </thead>
          <tbody>
            {output.per_heir_shares.map((share) => {
              const totalCentavos = typeof share.total.centavos === 'string'
                ? Number(share.total.centavos)
                : share.total.centavos;
              const pct = estateCentavos > 0
                ? ((totalCentavos / estateCentavos) * 100).toFixed(1)
                : '0.0';
              return (
                <tr key={share.heir_id} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{share.heir_name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{EFFECTIVE_CATEGORY_LABELS[share.heir_category]}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatPeso(share.total.centavos)}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Blurred: Detailed breakdown with overlay */}
      <div className="relative" data-testid="blur-overlay">
        <div className="blur-sm pointer-events-none select-none space-y-3">
          {/* Fake narrative content */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <h3 className="font-medium text-sm">Detailed Narrative</h3>
            {output.narratives.map((n) => (
              <p key={n.heir_id} className="text-sm text-muted-foreground">{n.text}</p>
            ))}
          </div>
          {/* Fake computation log */}
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <h3 className="font-medium text-sm">Computation Log</h3>
            {output.computation_log.steps.map((s) => (
              <p key={s.step_number} className="text-xs text-muted-foreground">{s.step_name}: {s.description}</p>
            ))}
          </div>
        </div>
        {/* Overlay CTA */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
          <p className="text-sm font-medium mb-3">Create an account to see the full breakdown</p>
          <Link to="/auth" search={{ mode: 'signup' as const, redirect: '' }}>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/inheritance/frontend && npx vitest run src/components/quick-calc/__tests__/QuickCalcResults.test.tsx`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/quick-calc/QuickCalcResults.tsx src/components/quick-calc/__tests__/QuickCalcResults.test.tsx
git commit -m "feat(quick-calc): add results display with blur gate and signup CTA"
```

---

### Task 3: QuickCalcWidget — Input Form + Session Gate

**Files:**
- Create: `src/components/quick-calc/QuickCalcWidget.tsx`
- Test: `src/components/quick-calc/__tests__/QuickCalcWidget.test.tsx`

**Dependencies:** Task 1 (`defaults.ts`), Task 2 (`QuickCalcResults.tsx`)

- [ ] **Step 1: Write the failing test**

Create `src/components/quick-calc/__tests__/QuickCalcWidget.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickCalcWidget } from '../QuickCalcWidget';

// Mock the WASM compute
vi.mock('@/wasm/bridge', () => ({
  computeWasm: vi.fn().mockResolvedValue({
    per_heir_shares: [{
      heir_id: '0', heir_name: 'Spouse', heir_category: 'SurvivingSpouseGroup',
      inherits_by: 'OwnRight', represents: null,
      from_legitime: { centavos: 0 }, from_free_portion: { centavos: 0 },
      from_intestate: { centavos: 50000000 }, total: { centavos: 50000000 },
      legitime_fraction: '1/2', legal_basis: [],
      donations_imputed: { centavos: 0 }, gross_entitlement: { centavos: 50000000 },
      net_from_estate: { centavos: 50000000 },
    }],
    narratives: [],
    computation_log: { steps: [], total_restarts: 0, final_scenario: 'I1' },
    warnings: [],
    succession_type: 'Intestate',
    scenario_code: 'I1',
  }),
}));

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

beforeEach(() => {
  sessionStorage.clear();
});

describe('QuickCalcWidget', () => {
  it('renders estate input and add heir button', () => {
    render(<QuickCalcWidget />);
    expect(screen.getByPlaceholderText(/estate/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Heir/i)).toBeInTheDocument();
  });

  it('calculate button is disabled with no heirs', () => {
    render(<QuickCalcWidget />);
    const calcBtn = screen.getByRole('button', { name: /Calculate/i });
    expect(calcBtn).toBeDisabled();
  });

  it('can add an heir chip', async () => {
    const user = userEvent.setup();
    render(<QuickCalcWidget />);
    await user.click(screen.getByText(/Add Heir/i));
    await user.click(screen.getByText(/Surviving Spouse/i));
    // Chip label for singleton spouse is just "Surviving Spouse"
    const chips = screen.getAllByText(/Surviving Spouse/i);
    expect(chips.length).toBeGreaterThanOrEqual(1);
  });

  it('can remove an heir chip', async () => {
    const user = userEvent.setup();
    render(<QuickCalcWidget />);
    // Add a legitimate child (non-singleton, so chip text is unique: "Legitimate Child 1")
    await user.click(screen.getByText(/Add Heir/i));
    await user.click(screen.getByText(/Legitimate Child$/i));
    expect(screen.getByText('Legitimate Child 1')).toBeInTheDocument();
    // Click the X button on the chip
    const removeBtn = screen.getByText('Legitimate Child 1').parentElement!.querySelector('button')!;
    await user.click(removeBtn);
    expect(screen.queryByText('Legitimate Child 1')).not.toBeInTheDocument();
  });

  it('disables singleton heir types after adding once', async () => {
    const user = userEvent.setup();
    render(<QuickCalcWidget />);
    // Add a non-singleton first to avoid text collision: add Father
    await user.click(screen.getByText(/Add Heir/i));
    await user.click(screen.getByText('Father'));
    // Open dropdown again — Father should be disabled
    await user.click(screen.getByText(/Add Heir/i));
    const dropdownOptions = document.querySelectorAll('[class*="popover"] button, .absolute button');
    const fatherOption = Array.from(dropdownOptions).find(el => el.textContent === 'Father');
    expect(fatherOption).toBeTruthy();
    expect((fatherOption as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows results after successful calculation', async () => {
    const user = userEvent.setup();
    render(<QuickCalcWidget />);
    // Enter estate amount
    const input = screen.getByPlaceholderText(/estate/i);
    await user.type(input, '1000000');
    // Add heir
    await user.click(screen.getByText(/Add Heir/i));
    await user.click(screen.getByText(/Surviving Spouse/i));
    // Calculate
    await user.click(screen.getByRole('button', { name: /Calculate/i }));
    await waitFor(() => {
      expect(screen.getByText('Spouse')).toBeInTheDocument();
    });
  });

  it('shows error message when WASM fails to load', async () => {
    const { computeWasm } = await import('@/wasm/bridge');
    vi.mocked(computeWasm).mockRejectedValueOnce(new Error('WASM load failed'));
    const user = userEvent.setup();
    render(<QuickCalcWidget />);
    const input = screen.getByPlaceholderText(/estate/i);
    await user.type(input, '1000000');
    await user.click(screen.getByText(/Add Heir/i));
    await user.click(screen.getByText('Father'));
    await user.click(screen.getByRole('button', { name: /Calculate/i }));
    await waitFor(() => {
      expect(screen.getByText(/Unable to load calculator/i)).toBeInTheDocument();
    });
    // Failed calc should NOT set the session gate
    expect(sessionStorage.getItem('quick-calc-used')).toBeNull();
  });

  it('blocks second calculation with session gate', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('quick-calc-used', 'true');
    render(<QuickCalcWidget />);
    const input = screen.getByPlaceholderText(/estate/i);
    await user.type(input, '1000000');
    await user.click(screen.getByText(/Add Heir/i));
    await user.click(screen.getByText(/Surviving Spouse/i));
    await user.click(screen.getByRole('button', { name: /Calculate/i }));
    await waitFor(() => {
      expect(screen.getByText(/Create an account for unlimited/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/inheritance/frontend && npx vitest run src/components/quick-calc/__tests__/QuickCalcWidget.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write `QuickCalcWidget.tsx` implementation**

Create `src/components/quick-calc/QuickCalcWidget.tsx`:

```tsx
import { useState, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { Plus, X, Loader2, Calculator, UserPlus, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EngineInputSchema } from '@/schemas';
import { computeWasm } from '@/wasm/bridge';
import { pesosToCentavos } from '@/types';
import type { EngineOutput } from '@/types';
import { buildEngineInput, HEIR_TYPE_LABELS, SINGLETON_TYPES, type QuickCalcHeir, type QuickCalcHeirType } from './defaults';
import { QuickCalcResults } from './QuickCalcResults';

const SESSION_KEY = 'quick-calc-used';

const ALL_HEIR_TYPES: QuickCalcHeirType[] = [
  'SurvivingSpouse', 'LegitimateChild', 'IllegitimateChild',
  'Father', 'Mother', 'Brother', 'Sister',
];

export function QuickCalcWidget() {
  const [estatePesos, setEstatePesos] = useState('');
  const [heirs, setHeirs] = useState<QuickCalcHeir[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [computing, setComputing] = useState(false);
  const [output, setOutput] = useState<EngineOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gated, setGated] = useState(false);

  const estateCentavos = pesosToCentavos(Number(estatePesos) || 0);
  const canCalculate = estateCentavos > 0 && heirs.length > 0 && !computing;

  const disabledTypes = new Set<QuickCalcHeirType>(
    SINGLETON_TYPES.filter(t => heirs.some(h => h.type === t))
  );

  const addHeir = useCallback((type: QuickCalcHeirType) => {
    setHeirs(prev => [...prev, { type }]);
    setDropdownOpen(false);
  }, []);

  const removeHeir = useCallback((index: number) => {
    setHeirs(prev => prev.filter((_, i) => i !== index));
  }, []);

  const calculate = useCallback(async () => {
    // Session gate check
    if (sessionStorage.getItem(SESSION_KEY)) {
      setGated(true);
      return;
    }

    setError(null);
    setComputing(true);
    try {
      const input = buildEngineInput(estateCentavos, heirs);
      const validation = EngineInputSchema.safeParse(input);
      if (!validation.success) {
        setError('Invalid input. Please check your entries and try again.');
        return;
      }
      const result = await computeWasm(input);
      setOutput(result);
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      setError('Unable to load calculator. Please try again or create an account.');
    } finally {
      setComputing(false);
    }
  }, [estateCentavos, heirs]);

  // Display name for heir chip
  const heirChipLabel = (heir: QuickCalcHeir, index: number): string => {
    const sameTypeBefore = heirs.slice(0, index).filter(h => h.type === heir.type).length;
    if (SINGLETON_TYPES.includes(heir.type)) return HEIR_TYPE_LABELS[heir.type];
    return `${HEIR_TYPE_LABELS[heir.type]} ${sameTypeBefore + 1}`;
  };

  if (gated) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-sm font-medium">Create an account for unlimited calculations</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/auth" search={{ mode: 'signup' as const, redirect: '' }}>
            <Button className="gap-2"><UserPlus className="h-4 w-4" />Create Account</Button>
          </Link>
          <Link to="/auth" search={{ mode: 'signin' as const, redirect: '' }}>
            <Button variant="outline" className="gap-2"><LogIn className="h-4 w-4" />Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estate amount input */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Net Distributable Estate (PHP)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₱</span>
          <Input
            type="number"
            placeholder="Enter estate value"
            value={estatePesos}
            onChange={e => setEstatePesos(e.target.value)}
            className="pl-7"
            min={0}
          />
        </div>
      </div>

      {/* Heir chips */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Heirs</label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
          {heirs.map((heir, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {heirChipLabel(heir, i)}
              <button onClick={() => removeHeir(i)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add heir dropdown */}
        <div className="relative inline-block">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Plus className="h-3 w-3" /> Add Heir
          </Button>
          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-48 rounded-md border bg-popover shadow-md">
              {ALL_HEIR_TYPES.map(type => {
                const disabled = disabledTypes.has(type);
                return (
                  <button
                    key={type}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled}
                    data-disabled={disabled || undefined}
                    onClick={() => addHeir(type)}
                  >
                    {HEIR_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Calculate button */}
      <Button
        className="w-full gap-2"
        disabled={!canCalculate}
        onClick={calculate}
      >
        {computing ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Computing...</>
        ) : (
          <><Calculator className="h-4 w-4" />Calculate Distribution</>
        )}
      </Button>

      {/* Sign in/up links below */}
      {!output && (
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span>Already have an account?</span>
          <Link to="/auth" search={{ mode: 'signin' as const, redirect: '' }} className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      )}

      {/* Results */}
      {output && <QuickCalcResults output={output} estateCentavos={estateCentavos} />}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/inheritance/frontend && npx vitest run src/components/quick-calc/__tests__/QuickCalcWidget.test.tsx`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/quick-calc/QuickCalcWidget.tsx src/components/quick-calc/__tests__/QuickCalcWidget.test.tsx
git commit -m "feat(quick-calc): add widget with heir chips, session gate, and WASM compute"
```

---

### Task 4: Wire into Landing Page

**Files:**
- Modify: `src/routes/index.tsx:32-73` (replace unauthenticated hero section)

**Dependencies:** Task 3

- [ ] **Step 1: Write the failing test**

Create `src/components/quick-calc/__tests__/landing-integration.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock useAuth to return no user
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  createRoute: vi.fn(() => ({})),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  useNavigate: vi.fn(() => vi.fn()),
}));

// Mock WASM
vi.mock('@/wasm/bridge', () => ({
  computeWasm: vi.fn(),
}));

describe('Landing page (unauthenticated)', () => {
  it('renders quick calc widget instead of old CTAs', async () => {
    // Dynamic import after mocks are set up
    const { DashboardPage } = await import('@/routes/index');
    render(<DashboardPage />);
    // Quick calc widget elements should be present
    expect(screen.getByPlaceholderText(/estate/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Heir/i)).toBeInTheDocument();
    // Old CTAs should be gone
    expect(screen.queryByText('Create Account')).not.toBeInTheDocument();
    expect(screen.queryByText('try without an account')).not.toBeInTheDocument();
  });

  it('still renders feature cards', async () => {
    const { DashboardPage } = await import('@/routes/index');
    render(<DashboardPage />);
    expect(screen.getByText('All Succession Types')).toBeInTheDocument();
    expect(screen.getByText('Full Family Tree')).toBeInTheDocument();
    expect(screen.getByText('Professional PDF')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/inheritance/frontend && npx vitest run src/components/quick-calc/__tests__/landing-integration.test.tsx`
Expected: FAIL — old CTAs still present / `DashboardPage` not exported

- [ ] **Step 3: Modify `src/routes/index.tsx`**

Replace the unauthenticated hero section (lines 32-73). The key changes:
1. Import `QuickCalcWidget` from `@/components/quick-calc/QuickCalcWidget`
2. Export `DashboardPage` for test access
3. Replace the CTA buttons block and "try without an account" link with `<QuickCalcWidget />`
4. Keep the headline, subtitle, badge, and feature cards

The new unauthenticated section should be:

```tsx
import { QuickCalcWidget } from '@/components/quick-calc/QuickCalcWidget';

// ... existing imports minus UserPlus, LogIn (no longer needed in unauthed section)

export function DashboardPage() {
  // ... same auth/loading checks ...

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 sm:py-20 px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-[#c5a44e] text-xs font-medium px-3 py-1 rounded-full border border-accent/20 mb-4">
            Philippine Succession Law
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-foreground mb-3">
            Estate Distribution<br />Made Simple
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto mb-6">
            Compute Philippine inheritance shares instantly. Handles testate, intestate, mixed succession, preterition, and representation.
          </p>
        </div>

        {/* Quick Calc Widget (replaces old CTAs) */}
        <div className="max-w-md mx-auto mb-10">
          <QuickCalcWidget />
        </div>

        {/* Feature grid (unchanged) */}
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          {/* ... same feature cards ... */}
        </div>
      </div>
    );
  }

  return <AuthenticatedDashboard user={user} />;
}
```

Remove `UserPlus` and `LogIn` from the lucide imports if they are no longer used in the unauthed section (check if `AuthenticatedDashboard` still needs them — it doesn't, so they can be removed entirely).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/inheritance/frontend && npx vitest run src/components/quick-calc/__tests__/landing-integration.test.tsx`
Expected: All 2 tests PASS

- [ ] **Step 5: Run all tests to verify no regressions**

Run: `cd apps/inheritance/frontend && npx vitest run`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/routes/index.tsx src/components/quick-calc/__tests__/landing-integration.test.tsx
git commit -m "feat(quick-calc): wire widget into landing page, remove old CTAs"
```

---

### Task 5: Manual QA in Browser

**Dependencies:** Task 4

- [ ] **Step 1: Start dev server and open in browser**

Run: `cd apps/inheritance/frontend && npm run dev`
Open: `http://localhost:5173`

- [ ] **Step 2: Verify landing page layout**

Check:
- Headline, subtitle, badge still visible
- Quick calc widget appears where CTAs used to be
- "Create Account" / "Sign In" / "try without an account" links are gone
- Feature cards still at the bottom
- "Already have an account? Sign In" link below calculate button

- [ ] **Step 3: Test quick calc flow**

1. Enter estate amount: `1000000`
2. Add heirs: Surviving Spouse, Legitimate Child, Legitimate Child
3. Click "Calculate Distribution"
4. Verify: spinner appears briefly, then results table shows with heir names, amounts, percentages
5. Verify: succession type badge shows "Intestate Succession"
6. Verify: blurred section visible below with "Create an account to see the full breakdown" + "Sign Up Free" button

- [ ] **Step 4: Test session gate**

1. Refresh the page (sessionStorage persists)
2. Enter new inputs and click Calculate
3. Verify: shows "Create an account for unlimited calculations" instead of computing

- [ ] **Step 5: Test edge cases**

1. Clear sessionStorage, refresh
2. Try Calculate with no heirs — button should be disabled
3. Try Calculate with empty estate — button should be disabled
4. Add Surviving Spouse, then open dropdown — Surviving Spouse should be disabled
5. Add Father, Mother — both options should be disabled after adding
6. Add 3 Legitimate Children — verify chips show "Legitimate Child 1", "Legitimate Child 2", "Legitimate Child 3"
7. Remove a chip — verify it disappears and the option re-enables in dropdown

- [ ] **Step 6: Commit if any fixes needed**

```bash
git add -u
git commit -m "fix(quick-calc): QA fixes from browser testing"
```
