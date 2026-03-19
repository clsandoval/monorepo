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

export function buildEngineInput(estateCentavos: number, heirs: QuickCalcHeir[]): EngineInput {
  const hasSpouse = heirs.some(h => h.type === 'SurvivingSpouse');

  const counters: Record<string, number> = {};
  const familyTree = heirs.map((heir, i) => {
    const template = NAME_TEMPLATES[heir.type];
    counters[template] = (counters[template] || 0) + 1;
    const count = counters[template];
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
