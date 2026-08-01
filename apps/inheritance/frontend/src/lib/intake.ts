/**
 * Guided Intake Form mapping functions (§4.18)
 * Source: docs/plans/inheritance-premium-spec.md §4.18
 *
 * Converts intake form state into:
 * - EngineInput (pre-populated case wizard)
 * - IntakeData (stored in cases.intake_data JSONB)
 *
 * The client-record and milestone-seed mappings were removed under CUT-01 with
 * the client-details and settlement-track steps that fed them.
 */

import type { EngineInput, Person, Decedent } from '@/types';
import type {
  IntakeFormState,
  IntakeData,
  DecedentInfoStepState,
  FamilyCompositionStepState,
  IntakeHeirEntry,
} from '@/types/intake';

// --------------------------------------------------------------------------
// ID generation
// --------------------------------------------------------------------------

let _idCounter = 0;

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++_idCounter}`;
}

// --------------------------------------------------------------------------
// createInitialIntakeState
// --------------------------------------------------------------------------

export function createInitialIntakeState(): IntakeFormState {
  return {
    currentStep: 0,
    decedentInfo: {
      full_name: '',
      date_of_death: '',
      place_of_death: '',
      last_known_address: '',
      civil_status: null,
      has_will: false,
      property_regime: null,
      citizenship: 'Filipino',
      tin: '',
    },
    familyComposition: {
      heirs: [],
    },
    assetSummary: {
      real_property_count: 0,
      real_property_total_value: 0,
      has_cash: false,
      has_vehicles: false,
      vehicle_count: 0,
    },
  };
}

// --------------------------------------------------------------------------
// mapDecedentInfoToDecedent
// --------------------------------------------------------------------------

export function mapDecedentInfoToDecedent(info: DecedentInfoStepState): Decedent {
  const isMarried =
    info.civil_status === 'married' || info.civil_status === 'legally_separated';
  const hasLegalSeparation = info.civil_status === 'legally_separated';

  return {
    id: generateId('decedent'),
    name: info.full_name,
    date_of_death: info.date_of_death,
    is_married: isMarried,
    date_of_marriage: null,
    marriage_solemnized_in_articulo_mortis: false,
    was_ill_at_marriage: false,
    illness_caused_death: false,
    years_of_cohabitation: 0,
    has_legal_separation: hasLegalSeparation,
    is_illegitimate: false,
  };
}

// --------------------------------------------------------------------------
// mapHeirEntryToPerson
// --------------------------------------------------------------------------

export function mapHeirEntryToPerson(heir: IntakeHeirEntry, index: number): Person {
  return {
    id: generateId(`person-${index}`),
    name: heir.name,
    is_alive_at_succession: heir.is_alive,
    relationship_to_decedent: heir.relationship,
    degree: 1,
    line: null,
    children: [],
    filiation_proved: true,
    filiation_proof_type: null,
    is_guilty_party_in_legal_separation: false,
    adoption: null,
    is_unworthy: false,
    unworthiness_condoned: false,
    has_renounced: false,
    blood_type: null,
  };
}

// --------------------------------------------------------------------------
// mapFamilyToPersons
// --------------------------------------------------------------------------

export function mapFamilyToPersons(family: FamilyCompositionStepState): Person[] {
  return family.heirs.map((heir, index) => mapHeirEntryToPerson(heir, index));
}

// --------------------------------------------------------------------------
// mapIntakeToEngineInput
// --------------------------------------------------------------------------

export function mapIntakeToEngineInput(state: IntakeFormState): EngineInput {
  const decedent = mapDecedentInfoToDecedent(state.decedentInfo);
  const family_tree = mapFamilyToPersons(state.familyComposition);
  const will = state.decedentInfo.has_will
    ? {
        institutions: [],
        legacies: [],
        devises: [],
        disinheritances: [],
        date_executed: '',
      }
    : null;

  return {
    net_distributable_estate: { centavos: 0 },
    decedent,
    family_tree,
    will,
    donations: [],
    config: {
      retroactive_ra_11642: false,
      max_pipeline_restarts: 10,
    },
  };
}

// --------------------------------------------------------------------------
// mapIntakeToIntakeData
// --------------------------------------------------------------------------

export function mapIntakeToIntakeData(state: IntakeFormState): IntakeData {
  const d = state.decedentInfo;
  const a = state.assetSummary;

  return {
    decedent_tin: d.tin || null,
    asset_categories: {
      has_real_property: a.real_property_count > 0,
      real_property_count: a.real_property_count,
      real_property_total_value: a.real_property_total_value,
      has_cash: a.has_cash,
      has_vehicles: a.has_vehicles,
      vehicle_count: a.vehicle_count,
    },
    will_status: d.has_will ? 'testate' : 'intestate',
  };
}

// --------------------------------------------------------------------------
// isStepComplete
// --------------------------------------------------------------------------

export function isStepComplete(state: IntakeFormState, step: number): boolean {
  switch (step) {
    case 0: // Decedent Info
      return (
        state.decedentInfo.full_name.trim() !== '' &&
        state.decedentInfo.date_of_death.trim() !== '' &&
        state.decedentInfo.civil_status !== null
      );

    case 1: // Family Composition
      return state.familyComposition.heirs.length > 0;

    case 2: // Asset Summary (all fields have defaults)
      return true;

    case 3: // Review (no input required)
      return true;

    default:
      return false;
  }
}
