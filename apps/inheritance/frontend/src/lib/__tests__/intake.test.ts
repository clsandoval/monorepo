import { describe, it, expect } from 'vitest';
import type { IntakeFormState, IntakeHeirEntry, DecedentInfoStepState } from '@/types/intake';
import {
  mapDecedentInfoToDecedent,
  mapFamilyToPersons,
  mapHeirEntryToPerson,
  mapIntakeToEngineInput,
  mapIntakeToIntakeData,
  createInitialIntakeState,
  isStepComplete,
} from '../intake';

// --------------------------------------------------------------------------
// Fixtures
// --------------------------------------------------------------------------

function createFullIntakeState(
  overrides: Partial<IntakeFormState> = {},
): IntakeFormState {
  return {
    currentStep: 3, // review step
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
        { name: 'Ana dela Cruz', relationship: 'LegitimateChild', is_alive: true },
        { name: 'Jose dela Cruz', relationship: 'LegitimateChild', is_alive: false },
      ],
    },
    assetSummary: {
      real_property_count: 2,
      real_property_total_value: 5000000,
      has_cash: true,
      has_vehicles: true,
      vehicle_count: 1,
    },
    ...overrides,
  };
}

function createDecedentInfoState(
  overrides: Partial<DecedentInfoStepState> = {},
): DecedentInfoStepState {
  return {
    full_name: 'Juan dela Cruz',
    date_of_death: '2024-03-15',
    place_of_death: 'Manila',
    last_known_address: '456 Mabini St, Manila',
    civil_status: 'married',
    has_will: false,
    property_regime: 'ACP',
    citizenship: 'Filipino',
    tin: '987-654-321',
    ...overrides,
  };
}

// ==========================================================================
// TESTS — createInitialIntakeState
// ==========================================================================

describe('intake > createInitialIntakeState', () => {
  it('returns a state with currentStep = 0', () => {
    const state = createInitialIntakeState();
    expect(state.currentStep).toBe(0);
  });

  it('returns empty decedentInfo with Filipino citizenship default', () => {
    const state = createInitialIntakeState();
    expect(state.decedentInfo.full_name).toBe('');
    expect(state.decedentInfo.date_of_death).toBe('');
    expect(state.decedentInfo.citizenship).toBe('Filipino');
    expect(state.decedentInfo.has_will).toBe(false);
    expect(state.decedentInfo.property_regime).toBeNull();
  });

  it('returns empty family composition', () => {
    const state = createInitialIntakeState();
    expect(state.familyComposition.heirs).toEqual([]);
  });

  it('returns zero asset summary', () => {
    const state = createInitialIntakeState();
    expect(state.assetSummary.real_property_count).toBe(0);
    expect(state.assetSummary.has_cash).toBe(false);
    expect(state.assetSummary.has_vehicles).toBe(false);
  });
});

// ==========================================================================
// TESTS — mapDecedentInfoToDecedent
// ==========================================================================

describe('intake > mapDecedentInfoToDecedent', () => {
  it('maps full_name to name', () => {
    const info = createDecedentInfoState();
    const decedent = mapDecedentInfoToDecedent(info);
    expect(decedent.name).toBe('Juan dela Cruz');
  });

  it('maps date_of_death', () => {
    const info = createDecedentInfoState();
    const decedent = mapDecedentInfoToDecedent(info);
    expect(decedent.date_of_death).toBe('2024-03-15');
  });

  it('sets is_married = true when civil_status is "married"', () => {
    const info = createDecedentInfoState({ civil_status: 'married' });
    const decedent = mapDecedentInfoToDecedent(info);
    expect(decedent.is_married).toBe(true);
  });

  it('sets is_married = false when civil_status is "single"', () => {
    const info = createDecedentInfoState({ civil_status: 'single' });
    const decedent = mapDecedentInfoToDecedent(info);
    expect(decedent.is_married).toBe(false);
  });

  it('sets is_married = false when civil_status is "widowed"', () => {
    const info = createDecedentInfoState({ civil_status: 'widowed' });
    const decedent = mapDecedentInfoToDecedent(info);
    expect(decedent.is_married).toBe(false);
  });

  it('sets is_married = false when civil_status is "annulled"', () => {
    const info = createDecedentInfoState({ civil_status: 'annulled' });
    const decedent = mapDecedentInfoToDecedent(info);
    expect(decedent.is_married).toBe(false);
  });

  it('sets has_legal_separation = true for "legally_separated"', () => {
    const info = createDecedentInfoState({ civil_status: 'legally_separated' });
    const decedent = mapDecedentInfoToDecedent(info);
    expect(decedent.has_legal_separation).toBe(true);
    // legally separated was married, so is_married = true for inheritance purposes
    expect(decedent.is_married).toBe(true);
  });

  it('generates a unique id', () => {
    const info = createDecedentInfoState();
    const decedent = mapDecedentInfoToDecedent(info);
    expect(decedent.id).toBeDefined();
    expect(typeof decedent.id).toBe('string');
    expect(decedent.id!.length).toBeGreaterThan(0);
  });
});

// ==========================================================================
// TESTS — mapHeirEntryToPerson
// ==========================================================================

describe('intake > mapHeirEntryToPerson', () => {
  it('maps name field', () => {
    const heir: IntakeHeirEntry = {
      name: 'Pedro dela Cruz',
      relationship: 'LegitimateChild',
      is_alive: true,
    };
    const person = mapHeirEntryToPerson(heir, 0);
    expect(person.name).toBe('Pedro dela Cruz');
  });

  it('maps relationship_to_decedent', () => {
    const heir: IntakeHeirEntry = {
      name: 'Pedro dela Cruz',
      relationship: 'LegitimateChild',
      is_alive: true,
    };
    const person = mapHeirEntryToPerson(heir, 0);
    expect(person.relationship_to_decedent).toBe('LegitimateChild');
  });

  it('maps is_alive to is_alive_at_succession', () => {
    const aliveHeir: IntakeHeirEntry = {
      name: 'Pedro',
      relationship: 'LegitimateChild',
      is_alive: true,
    };
    const deceasedHeir: IntakeHeirEntry = {
      name: 'Jose',
      relationship: 'LegitimateChild',
      is_alive: false,
    };
    expect(mapHeirEntryToPerson(aliveHeir, 0).is_alive_at_succession).toBe(true);
    expect(mapHeirEntryToPerson(deceasedHeir, 1).is_alive_at_succession).toBe(false);
  });

  it('sets default values for unspecified fields', () => {
    const heir: IntakeHeirEntry = {
      name: 'Pedro',
      relationship: 'LegitimateChild',
      is_alive: true,
    };
    const person = mapHeirEntryToPerson(heir, 0);
    expect(person.degree).toBe(1);
    expect(person.line).toBeNull();
    expect(person.children).toEqual([]);
    expect(person.filiation_proved).toBe(true);
    expect(person.is_unworthy).toBe(false);
    expect(person.has_renounced).toBe(false);
  });

  it('generates a unique id for each heir', () => {
    const heir: IntakeHeirEntry = {
      name: 'Pedro',
      relationship: 'LegitimateChild',
      is_alive: true,
    };
    const p1 = mapHeirEntryToPerson(heir, 0);
    const p2 = mapHeirEntryToPerson(heir, 1);
    expect(p1.id).toBeDefined();
    expect(p2.id).toBeDefined();
    expect(p1.id).not.toBe(p2.id);
  });

  it('maps SurvivingSpouse relationship correctly', () => {
    const heir: IntakeHeirEntry = {
      name: 'Maria Santos',
      relationship: 'SurvivingSpouse',
      is_alive: true,
    };
    const person = mapHeirEntryToPerson(heir, 0);
    expect(person.relationship_to_decedent).toBe('SurvivingSpouse');
  });
});

// ==========================================================================
// TESTS — mapFamilyToPersons
// ==========================================================================

describe('intake > mapFamilyToPersons', () => {
  it('maps each heir entry to a Person', () => {
    const family = {
      heirs: [
        { name: 'Maria', relationship: 'SurvivingSpouse' as const, is_alive: true },
        { name: 'Pedro', relationship: 'LegitimateChild' as const, is_alive: true },
        { name: 'Ana', relationship: 'LegitimateChild' as const, is_alive: true },
      ],
    };
    const persons = mapFamilyToPersons(family);
    expect(persons).toHaveLength(3);
  });

  it('returns empty array when no heirs', () => {
    const persons = mapFamilyToPersons({ heirs: [] });
    expect(persons).toEqual([]);
  });

  it('preserves order of heirs', () => {
    const family = {
      heirs: [
        { name: 'First', relationship: 'SurvivingSpouse' as const, is_alive: true },
        { name: 'Second', relationship: 'LegitimateChild' as const, is_alive: true },
        { name: 'Third', relationship: 'LegitimateChild' as const, is_alive: false },
      ],
    };
    const persons = mapFamilyToPersons(family);
    expect(persons[0].name).toBe('First');
    expect(persons[1].name).toBe('Second');
    expect(persons[2].name).toBe('Third');
  });

  it('correctly maps alive/predeceased status', () => {
    const family = {
      heirs: [
        { name: 'Alive', relationship: 'LegitimateChild' as const, is_alive: true },
        { name: 'Predeceased', relationship: 'LegitimateChild' as const, is_alive: false },
      ],
    };
    const persons = mapFamilyToPersons(family);
    expect(persons[0].is_alive_at_succession).toBe(true);
    expect(persons[1].is_alive_at_succession).toBe(false);
  });
});

// ==========================================================================
// TESTS — mapIntakeToEngineInput
// ==========================================================================

describe('intake > mapIntakeToEngineInput', () => {
  it('pre-populates decedent name from decedent info', () => {
    const state = createFullIntakeState();
    const input = mapIntakeToEngineInput(state);
    expect(input.decedent?.name).toBe('Juan dela Cruz');
  });

  it('pre-populates decedent date_of_death', () => {
    const state = createFullIntakeState();
    const input = mapIntakeToEngineInput(state);
    expect(input.decedent?.date_of_death).toBe('2024-03-15');
  });

  it('pre-populates decedent is_married from civil status', () => {
    const state = createFullIntakeState();
    const input = mapIntakeToEngineInput(state);
    expect(input.decedent?.is_married).toBe(true);
  });

  it('pre-populates family_tree from family composition', () => {
    const state = createFullIntakeState();
    const input = mapIntakeToEngineInput(state);
    expect(input.family_tree).toBeDefined();
    expect(input.family_tree).toHaveLength(4);
  });

  it('sets will = null for intestate (has_will = false)', () => {
    const state = createFullIntakeState({
      decedentInfo: createDecedentInfoState({ has_will: false }),
    });
    const input = mapIntakeToEngineInput(state);
    expect(input.will).toBeNull();
  });

  it('sets will = object for testate (has_will = true)', () => {
    const state = createFullIntakeState({
      decedentInfo: createDecedentInfoState({ has_will: true }),
    });
    const input = mapIntakeToEngineInput(state);
    expect(input.will).toBeDefined();
    expect(input.will).not.toBeNull();
  });

  it('maps family member names correctly to family_tree persons', () => {
    const state = createFullIntakeState();
    const input = mapIntakeToEngineInput(state);
    const names = input.family_tree!.map((p) => p.name);
    expect(names).toContain('Maria Santos');
    expect(names).toContain('Pedro dela Cruz');
    expect(names).toContain('Ana dela Cruz');
    expect(names).toContain('Jose dela Cruz');
  });

  it('handles empty family composition', () => {
    const state = createFullIntakeState({
      familyComposition: { heirs: [] },
    });
    const input = mapIntakeToEngineInput(state);
    expect(input.family_tree).toEqual([]);
  });
});

// ==========================================================================
// TESTS — mapIntakeToIntakeData
// ==========================================================================

describe('intake > mapIntakeToIntakeData', () => {
  it('maps decedent TIN', () => {
    const state = createFullIntakeState();
    const intakeData = mapIntakeToIntakeData(state);
    expect(intakeData.decedent_tin).toBe('987-654-321');
  });

  it('maps asset categories', () => {
    const state = createFullIntakeState();
    const intakeData = mapIntakeToIntakeData(state);
    expect(intakeData.asset_categories.has_real_property).toBe(true);
    expect(intakeData.asset_categories.real_property_count).toBe(2);
    expect(intakeData.asset_categories.real_property_total_value).toBe(5000000);
    expect(intakeData.asset_categories.has_cash).toBe(true);
    expect(intakeData.asset_categories.has_vehicles).toBe(true);
    expect(intakeData.asset_categories.vehicle_count).toBe(1);
  });

  it('sets will_status = "intestate" when has_will = false', () => {
    const state = createFullIntakeState({
      decedentInfo: createDecedentInfoState({ has_will: false }),
    });
    const intakeData = mapIntakeToIntakeData(state);
    expect(intakeData.will_status).toBe('intestate');
  });

  it('sets will_status = "testate" when has_will = true', () => {
    const state = createFullIntakeState({
      decedentInfo: createDecedentInfoState({ has_will: true }),
    });
    const intakeData = mapIntakeToIntakeData(state);
    expect(intakeData.will_status).toBe('testate');
  });

  it('sets has_real_property = false when count is 0', () => {
    const state = createFullIntakeState({
      assetSummary: {
        real_property_count: 0,
        real_property_total_value: 0,
        has_cash: false,
        has_vehicles: false,
        vehicle_count: 0,
      },
    });
    const intakeData = mapIntakeToIntakeData(state);
    expect(intakeData.asset_categories.has_real_property).toBe(false);
  });
});

// ==========================================================================
// TESTS — isStepComplete
// ==========================================================================

describe('intake > isStepComplete', () => {
  it('step 0 (decedent info) is complete when required fields set', () => {
    const state = createFullIntakeState();
    expect(isStepComplete(state, 0)).toBe(true);
  });

  it('step 0 is incomplete when decedent full_name is empty', () => {
    const state = createFullIntakeState({
      decedentInfo: createDecedentInfoState({ full_name: '' }),
    });
    expect(isStepComplete(state, 0)).toBe(false);
  });

  it('step 0 is incomplete when date_of_death is empty', () => {
    const state = createFullIntakeState({
      decedentInfo: createDecedentInfoState({ date_of_death: '' }),
    });
    expect(isStepComplete(state, 0)).toBe(false);
  });

  it('step 0 is incomplete when civil_status is null', () => {
    const state = createFullIntakeState({
      decedentInfo: createDecedentInfoState({ civil_status: null }),
    });
    expect(isStepComplete(state, 0)).toBe(false);
  });

  it('step 1 (family composition) is complete when at least 1 heir', () => {
    const state = createFullIntakeState();
    expect(isStepComplete(state, 1)).toBe(true);
  });

  it('step 1 is incomplete when no heirs', () => {
    const state = createFullIntakeState({
      familyComposition: { heirs: [] },
    });
    expect(isStepComplete(state, 1)).toBe(false);
  });

  it('step 2 (asset summary) is always complete (all fields have defaults)', () => {
    const state = createInitialIntakeState();
    expect(isStepComplete(state, 2)).toBe(true);
  });

  it('step 3 (review) is always complete (review step has no input)', () => {
    const state = createFullIntakeState();
    expect(isStepComplete(state, 3)).toBe(true);
  });
});
