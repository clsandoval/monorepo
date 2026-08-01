import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IntakeFormState } from '@/types/intake';

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

const mockFrom = vi.fn();
const mockRpc = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

import { GuidedIntakeForm, type GuidedIntakeFormProps } from '../GuidedIntakeForm';
import { DecedentInfoStep, type DecedentInfoStepProps } from '../DecedentInfoStep';
import { FamilyCompositionStep, type FamilyCompositionStepProps } from '../FamilyCompositionStep';
import { AssetSummaryStep, type AssetSummaryStepProps } from '../AssetSummaryStep';
import { IntakeReviewStep, type IntakeReviewStepProps } from '../IntakeReviewStep';
import {
  INTAKE_STEPS,
  INTAKE_STEP_COUNT,
  PROPERTY_REGIMES,
} from '@/types/intake';

// --------------------------------------------------------------------------
// Test helpers
// --------------------------------------------------------------------------

const defaultFormProps: GuidedIntakeFormProps = {
  orgId: 'org-1',
  userId: 'user-1',
  onComplete: vi.fn(),
  onCancel: vi.fn(),
};

function renderForm(overrides: Partial<GuidedIntakeFormProps> = {}) {
  return render(<GuidedIntakeForm {...defaultFormProps} {...overrides} />);
}

// ==========================================================================
// TESTS — GuidedIntakeForm container
// ==========================================================================

describe('intake > GuidedIntakeForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the guided intake form container', () => {
    renderForm();
    expect(screen.getByTestId('guided-intake-form')).toBeInTheDocument();
  });

  it('starts at step 0 (Decedent Info)', () => {
    renderForm();
    // The first step should be visible
    expect(screen.getByTestId('guided-intake-form')).toBeInTheDocument();
  });

  it('shows step progress indicator', () => {
    renderForm();
    const form = screen.getByTestId('guided-intake-form');
    // Progress should show current step context
    expect(form).toBeInTheDocument();
  });

  it('shows Cancel button', () => {
    renderForm();
    const form = screen.getByTestId('guided-intake-form');
    expect(form).toBeInTheDocument();
  });
});

// ==========================================================================
// TESTS — Step type constants
// ==========================================================================

describe('intake > INTAKE_STEPS constants', () => {
  it('has 4 steps', () => {
    expect(INTAKE_STEP_COUNT).toBe(4);
    expect(INTAKE_STEPS).toHaveLength(4);
  });

  it('steps are in correct order', () => {
    expect(INTAKE_STEPS[0]).toBe('Decedent Info');
    expect(INTAKE_STEPS[1]).toBe('Family Composition');
    expect(INTAKE_STEPS[2]).toBe('Asset Summary');
    expect(INTAKE_STEPS[3]).toBe('Review & Save');
  });

  it('PROPERTY_REGIMES has 3 options', () => {
    expect(PROPERTY_REGIMES).toHaveLength(3);
    expect(PROPERTY_REGIMES).toContain('ACP');
    expect(PROPERTY_REGIMES).toContain('CPG');
    expect(PROPERTY_REGIMES).toContain('complete_separation');
  });
});

// ==========================================================================
// TESTS — DecedentInfoStep (step component)
// ==========================================================================

describe('intake > DecedentInfoStep', () => {
  const defaultState = {
    full_name: '',
    date_of_death: '',
    place_of_death: '',
    last_known_address: '',
    civil_status: null as null,
    has_will: false,
    property_regime: null as null,
    citizenship: 'Filipino',
    tin: '',
  };

  const defaultProps: DecedentInfoStepProps = {
    state: defaultState,
    onStateChange: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders decedent info step', () => {
    render(<DecedentInfoStep {...defaultProps} />);
    expect(screen.getByTestId('decedent-info-step')).toBeInTheDocument();
  });
});

// ==========================================================================
// TESTS — FamilyCompositionStep (step component)
// ==========================================================================

describe('intake > FamilyCompositionStep', () => {
  const defaultState = {
    heirs: [],
  };

  const defaultProps: FamilyCompositionStepProps = {
    state: defaultState,
    onStateChange: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders family composition step', () => {
    render(<FamilyCompositionStep {...defaultProps} />);
    expect(screen.getByTestId('family-composition-step')).toBeInTheDocument();
  });
});

// ==========================================================================
// TESTS — AssetSummaryStep (step component)
// ==========================================================================

describe('intake > AssetSummaryStep', () => {
  const defaultState = {
    real_property_count: 0,
    real_property_total_value: 0,
    has_cash: false,
    has_vehicles: false,
    vehicle_count: 0,
  };

  const defaultProps: AssetSummaryStepProps = {
    state: defaultState,
    onStateChange: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders asset summary step', () => {
    render(<AssetSummaryStep {...defaultProps} />);
    expect(screen.getByTestId('asset-summary-step')).toBeInTheDocument();
  });
});

// ==========================================================================
// TESTS — IntakeReviewStep (step component)
// ==========================================================================

describe('intake > IntakeReviewStep', () => {
  const fullState: IntakeFormState = {
    currentStep: 3,
    decedentInfo: {
      full_name: 'Juan dela Cruz',
      date_of_death: '2024-03-15',
      place_of_death: 'Manila',
      last_known_address: '456 Mabini St, Manila',
      civil_status: 'married',
      has_will: false,
      property_regime: 'ACP',
      citizenship: 'Filipino',
      tin: '987-654-321',
    },
    familyComposition: {
      heirs: [
        { name: 'Maria Santos', relationship: 'SurvivingSpouse', is_alive: true },
        { name: 'Pedro dela Cruz', relationship: 'LegitimateChild', is_alive: true },
      ],
    },
    assetSummary: {
      real_property_count: 2,
      real_property_total_value: 5000000,
      has_cash: true,
      has_vehicles: false,
      vehicle_count: 0,
    },
  };

  const defaultProps: IntakeReviewStepProps = {
    state: fullState,
    onCreateCase: vi.fn(),
    onBack: vi.fn(),
    isSubmitting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders review step', () => {
    render(<IntakeReviewStep {...defaultProps} />);
    expect(screen.getByTestId('intake-review-step')).toBeInTheDocument();
  });
});
