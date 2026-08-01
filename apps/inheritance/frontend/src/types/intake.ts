/**
 * Guided Intake Form types (§4.18)
 * Source: docs/plans/inheritance-premium-spec.md §4.18
 */

import type { Relationship } from './index';
import type { CivilStatus } from './client';

/** Property regime options */
export type PropertyRegime = 'ACP' | 'CPG' | 'complete_separation';

export const PROPERTY_REGIMES: readonly PropertyRegime[] = [
  'ACP',
  'CPG',
  'complete_separation',
];

export const PROPERTY_REGIME_LABELS: Record<PropertyRegime, string> = {
  ACP: 'Absolute Community (ACP)',
  CPG: 'Conjugal Partnership (CPG)',
  complete_separation: 'Complete Separation',
};

/** Heir entry in family composition step */
export interface IntakeHeirEntry {
  name: string;
  relationship: Relationship;
  is_alive: boolean;
}

/** Decedent info step state */
export interface DecedentInfoStepState {
  full_name: string;
  date_of_death: string;
  place_of_death: string;
  last_known_address: string;
  civil_status: CivilStatus | null;
  has_will: boolean;
  property_regime: PropertyRegime | null;
  citizenship: string;
  tin: string;
}

/** Family composition step state */
export interface FamilyCompositionStepState {
  heirs: IntakeHeirEntry[];
}

/** Asset summary step state */
export interface AssetSummaryStepState {
  real_property_count: number;
  real_property_total_value: number;
  has_cash: boolean;
  has_vehicles: boolean;
  vehicle_count: number;
}

/** The overall intake form state across all 4 steps */
export interface IntakeFormState {
  currentStep: number;
  decedentInfo: DecedentInfoStepState;
  familyComposition: FamilyCompositionStepState;
  assetSummary: AssetSummaryStepState;
}

/** Data stored in cases.intake_data JSONB column */
export interface IntakeData {
  decedent_tin: string | null;
  asset_categories: {
    has_real_property: boolean;
    real_property_count: number;
    real_property_total_value: number;
    has_cash: boolean;
    has_vehicles: boolean;
    vehicle_count: number;
  };
  will_status: 'intestate' | 'testate';
}

/** Milestone seed data for deadline generation */
export interface MilestoneSeed {
  label: string;
  offset_days: number;
  description: string;
  legal_basis: string | null;
}

/** The 4 intake steps */
export const INTAKE_STEPS = [
  'Decedent Info',
  'Family Composition',
  'Asset Summary',
  'Review & Save',
] as const;

export type IntakeStepName = (typeof INTAKE_STEPS)[number];

/** Total number of intake steps */
export const INTAKE_STEP_COUNT = INTAKE_STEPS.length;
