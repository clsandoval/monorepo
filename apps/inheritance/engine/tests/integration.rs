//! Integration tests for the Philippine Inheritance Distribution Engine.
//!
//! Runs all 23 test vectors from Spec §14 end-to-end through the full pipeline
//! (Steps 1-10), then verifies the 10 invariants from §14.2.

use num_bigint::BigInt;
use num_traits::Zero;

use inheritance_engine::flags::detect_spec_flags;
use inheritance_engine::fraction::{frac, money_to_frac};
use inheritance_engine::step1_classify::{step1_classify, Step1Input};
use inheritance_engine::step2_lines::{step2_build_lines, Step2Input};
use inheritance_engine::step3_scenario::{step3_determine_scenario, Step3Input};
use inheritance_engine::step4_estate_base::{step4_compute_estate_base, Step4Input};
use inheritance_engine::step5_legitimes::{step5_compute_legitimes, Step5Input};
use inheritance_engine::step6_validation::{step6_validate_will, Step6Input};
use inheritance_engine::step7_distribute::{step7_distribute, Step7Input};
use inheritance_engine::step8_collation::{step8_collation_adjustment, Step8Input};
use inheritance_engine::step9_vacancy::{step9_resolve_vacancies, Step9Input};
use inheritance_engine::step10_finalize::{step10_finalize, NarrativeConfig, Step10Input};
use inheritance_engine::types::*;

// ══════════════════════════════════════════════════════════════════════
// Pipeline runner
// ══════════════════════════════════════════════════════════════════════

/// Run the full pipeline (Steps 1-10) on an EngineInput, returning EngineOutput.
fn run_pipeline(input: &EngineInput) -> EngineOutput {
    let net_estate_frac = money_to_frac(&input.net_distributable_estate.centavos);

    // Mirrors engine/src/pipeline.rs: manual-review flags and per-step log entries
    // accumulated across Steps 1-9 and handed to Step 10.
    let mut pipeline_warnings: Vec<ManualFlag> = Vec::new();
    pipeline_warnings.extend(detect_spec_flags(input));
    let mut step_logs: Vec<StepLog> = Vec::new();

    // Step 1: Classify heirs
    let disinheritances = input
        .will
        .as_ref()
        .map(|w| w.disinheritances.clone())
        .unwrap_or_default();
    let step1 = step1_classify(&Step1Input {
        decedent: input.decedent.clone(),
        family_tree: input.family_tree.clone(),
        disinheritances,
    });
    pipeline_warnings.extend(step1.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 1,
        step_name: "Classify Heirs".to_string(),
        description: "Mapped each person in the family tree to an effective heir category".to_string(),
    });

    // Step 2: Build lines
    let step2 = step2_build_lines(&Step2Input {
        heirs: step1.heirs.clone(),
    });
    pipeline_warnings.extend(step2.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 2,
        step_name: "Build Lines".to_string(),
        description: "Grouped classified heirs into lines of descent and counted each category".to_string(),
    });

    // Step 3: Determine scenario
    let has_siblings_or_nephews = input.family_tree.iter().any(|p| {
        matches!(
            p.relationship_to_decedent,
            Relationship::Sibling | Relationship::NephewNiece
        ) && p.is_alive_at_succession
    });
    let has_other_collaterals = input.family_tree.iter().any(|p| {
        matches!(p.relationship_to_decedent, Relationship::OtherCollateral) && p.is_alive_at_succession
    });
    let step3 = step3_determine_scenario(&Step3Input {
        line_counts: step2.line_counts.clone(),
        has_will: input.will.is_some(),
        decedent: input.decedent.clone(),
        has_siblings_or_nephews,
        has_other_collaterals,
    });
    pipeline_warnings.extend(step3.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 3,
        step_name: "Determine Scenario".to_string(),
        description: "Selected the scenario code and succession type from the line counts".to_string(),
    });

    // Step 4: Compute estate base (collation)
    let step4 = step4_compute_estate_base(&Step4Input {
        net_estate: net_estate_frac.clone(),
        donations: input.donations.clone(),
        heirs: step2.heirs.clone(),
    });
    pipeline_warnings.extend(step4.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 4,
        step_name: "Compute Estate Base".to_string(),
        description: "Added collatable donations to the net estate to form the estate base".to_string(),
    });

    // Step 5: Compute legitimes
    let step5 = step5_compute_legitimes(&Step5Input {
        estate_base: step4.estate_base.clone(),
        scenario_code: step3.scenario_code,
        line_counts: step2.line_counts.clone(),
        heirs: step2.heirs.clone(),
        decedent: input.decedent.clone(),
    });
    pipeline_warnings.extend(step5.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 5,
        step_name: "Compute Legitimes".to_string(),
        description: "Computed each compulsory heir's legitime fraction and amount".to_string(),
    });

    // Step 6: Testate validation (only if will exists)
    let (step6, succession_type) = if let Some(ref will) = input.will {
        let s6 = step6_validate_will(&Step6Input {
            will: will.clone(),
            heirs: step2.heirs.clone(),
            heir_legitimes: step5.heir_legitimes.clone(),
            free_portion: step5.free_portion.clone(),
            estate_base: step4.estate_base.clone(),
            net_estate: net_estate_frac.clone(),
            donations: input.donations.clone(),
            scenario_code: step3.scenario_code,
        });
        pipeline_warnings.extend(s6.warnings.iter().cloned());
        step_logs.push(StepLog {
            step_number: 6,
            step_name: "Validate Will".to_string(),
            description: "Ran testate validation over the will".to_string(),
        });
        let st = s6
            .succession_type_override
            .unwrap_or(step3.succession_type);
        (Some(s6), st)
    } else {
        step_logs.push(StepLog {
            step_number: 6,
            step_name: "Validate Will".to_string(),
            description: "No will supplied; testate validation not applicable".to_string(),
        });
        (None, step3.succession_type)
    };

    // Step 7: Distribute
    let step7 = step7_distribute(&Step7Input {
        net_estate: net_estate_frac.clone(),
        estate_base: step4.estate_base.clone(),
        heirs: step2.heirs.clone(),
        line_counts: step2.line_counts.clone(),
        scenario_code: step3.scenario_code,
        succession_type,
        heir_legitimes: step5.heir_legitimes.clone(),
        free_portion: step5.free_portion.clone(),
        validation: step6.clone(),
        will: input.will.clone(),
        donations: input.donations.clone(),
    });

    pipeline_warnings.extend(step7.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 7,
        step_name: "Distribute".to_string(),
        description: "Allocated the estate base across heirs as legitime, free portion and intestate shares".to_string(),
    });

    // Step 8: Collation adjustment
    let step8 = step8_collation_adjustment(&Step8Input {
        net_estate: net_estate_frac.clone(),
        estate_base: step4.estate_base.clone(),
        distributions: step7.distributions.clone(),
        donation_results: step4.donation_results.clone(),
        donations: input.donations.clone(),
        heirs: step2.heirs.clone(),
    });

    pipeline_warnings.extend(step8.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 8,
        step_name: "Collation Adjustment".to_string(),
        description: "Imputed each heir's collatable donations against that heir's share".to_string(),
    });

    // Step 9: Vacancy resolution
    let step9 = step9_resolve_vacancies(&Step9Input {
        net_estate: net_estate_frac.clone(),
        estate_base: step4.estate_base.clone(),
        collation_output: step8.clone(),
        distributions: step7.distributions.clone(),
        heirs: step2.heirs.clone(),
        scenario_code: step3.scenario_code,
        succession_type: step7.final_succession_type,
        will: input.will.clone(),
        restart_count: 0,
        max_restarts: input.config.max_pipeline_restarts,
    });

    pipeline_warnings.extend(step9.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 9,
        step_name: "Resolve Vacancies".to_string(),
        description: "Resolved renunciation, incapacity and accretion vacancies".to_string(),
    });

    // Handle restart if needed (simplified: one level of restart)
    if step9.requires_restart {
        return run_pipeline_with_restart(input, &step9, pipeline_warnings, step_logs);
    }

    // Step 10: Finalize + narrate
    let final_scenario = step3.scenario_code;
    step10_finalize(&Step10Input {
        net_estate: input.net_distributable_estate.clone(),
        net_estate_frac: net_estate_frac.clone(),
        estate_base: step4.estate_base.clone(),
        decedent: input.decedent.clone(),
        heirs: step2.heirs.clone(),
        heir_legitimes: step5.heir_legitimes.clone(),
        free_portion: step5.free_portion.clone(),
        validation: step6,
        final_distributions: step9.adjusted_distributions,
        collation_output: step8,
        vacancies: step9.vacancies,
        succession_type: step7.final_succession_type,
        scenario_code: final_scenario,
        narrative_config: NarrativeConfig::default(),
        total_restarts: 0,
        warnings: pipeline_warnings,
        step_logs,
    })
}

/// Handle pipeline restart (e.g., total renunciation -> scenario re-evaluation).
/// Re-runs from Step 1 with updated heir list (renounced heirs excluded from
/// active participation, but parents now considered).
fn run_pipeline_with_restart(
    input: &EngineInput,
    step9: &inheritance_engine::step9_vacancy::Step9Output,
    prior_warnings: Vec<ManualFlag>,
    prior_logs: Vec<StepLog>,
) -> EngineOutput {
    let net_estate_frac = money_to_frac(&input.net_distributable_estate.centavos);

    let mut pipeline_warnings: Vec<ManualFlag> = Vec::new();
    pipeline_warnings.extend(detect_spec_flags(input));
    pipeline_warnings.extend(prior_warnings);
    let mut step_logs: Vec<StepLog> = prior_logs;

    // Use updated heirs from step9 (renounced heirs marked, new heirs activated)
    let heirs_for_restart = step9.heirs.clone();

    // Step 2 on updated heirs
    let step2 = step2_build_lines(&Step2Input {
        heirs: heirs_for_restart,
    });
    pipeline_warnings.extend(step2.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 2,
        step_name: "Build Lines".to_string(),
        description: "Grouped classified heirs into lines of descent and counted each category".to_string(),
    });

    // Step 3 re-evaluate scenario
    let has_siblings_or_nephews = input.family_tree.iter().any(|p| {
        matches!(
            p.relationship_to_decedent,
            Relationship::Sibling | Relationship::NephewNiece
        ) && p.is_alive_at_succession
    });
    let has_other_collaterals = input.family_tree.iter().any(|p| {
        matches!(p.relationship_to_decedent, Relationship::OtherCollateral) && p.is_alive_at_succession
    });
    let step3 = step3_determine_scenario(&Step3Input {
        line_counts: step2.line_counts.clone(),
        has_will: input.will.is_some(),
        decedent: input.decedent.clone(),
        has_siblings_or_nephews,
        has_other_collaterals,
    });
    pipeline_warnings.extend(step3.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 3,
        step_name: "Determine Scenario".to_string(),
        description: "Selected the scenario code and succession type from the line counts".to_string(),
    });

    let step4 = step4_compute_estate_base(&Step4Input {
        net_estate: net_estate_frac.clone(),
        donations: input.donations.clone(),
        heirs: step2.heirs.clone(),
    });
    pipeline_warnings.extend(step4.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 4,
        step_name: "Compute Estate Base".to_string(),
        description: "Added collatable donations to the net estate to form the estate base".to_string(),
    });

    let step5 = step5_compute_legitimes(&Step5Input {
        estate_base: step4.estate_base.clone(),
        scenario_code: step3.scenario_code,
        line_counts: step2.line_counts.clone(),
        heirs: step2.heirs.clone(),
        decedent: input.decedent.clone(),
    });
    pipeline_warnings.extend(step5.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 5,
        step_name: "Compute Legitimes".to_string(),
        description: "Computed each compulsory heir's legitime fraction and amount".to_string(),
    });

    let step6 = None; // Restart cases are intestate
    step_logs.push(StepLog {
        step_number: 6,
        step_name: "Validate Will".to_string(),
        description: "No will supplied; testate validation not applicable".to_string(),
    });
    let succession_type = step3.succession_type;

    let step7 = step7_distribute(&Step7Input {
        net_estate: net_estate_frac.clone(),
        estate_base: step4.estate_base.clone(),
        heirs: step2.heirs.clone(),
        line_counts: step2.line_counts.clone(),
        scenario_code: step3.scenario_code,
        succession_type,
        heir_legitimes: step5.heir_legitimes.clone(),
        free_portion: step5.free_portion.clone(),
        validation: step6.clone(),
        will: input.will.clone(),
        donations: input.donations.clone(),
    });

    pipeline_warnings.extend(step7.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 7,
        step_name: "Distribute".to_string(),
        description: "Allocated the estate base across heirs as legitime, free portion and intestate shares".to_string(),
    });

    let step8 = step8_collation_adjustment(&Step8Input {
        net_estate: net_estate_frac.clone(),
        estate_base: step4.estate_base.clone(),
        distributions: step7.distributions.clone(),
        donation_results: step4.donation_results.clone(),
        donations: input.donations.clone(),
        heirs: step2.heirs.clone(),
    });
    pipeline_warnings.extend(step8.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 8,
        step_name: "Collation Adjustment".to_string(),
        description: "Imputed each heir's collatable donations against that heir's share".to_string(),
    });

    let step9b = step9_resolve_vacancies(&Step9Input {
        net_estate: net_estate_frac.clone(),
        estate_base: step4.estate_base.clone(),
        collation_output: step8.clone(),
        distributions: step7.distributions.clone(),
        heirs: step2.heirs.clone(),
        scenario_code: step3.scenario_code,
        succession_type: step7.final_succession_type,
        will: input.will.clone(),
        restart_count: 1,
        max_restarts: input.config.max_pipeline_restarts,
    });
    pipeline_warnings.extend(step9b.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 9,
        step_name: "Resolve Vacancies".to_string(),
        description: "Resolved renunciation, incapacity and accretion vacancies".to_string(),
    });

    step10_finalize(&Step10Input {
        net_estate: input.net_distributable_estate.clone(),
        net_estate_frac: net_estate_frac.clone(),
        estate_base: step4.estate_base.clone(),
        decedent: input.decedent.clone(),
        heirs: step2.heirs.clone(),
        heir_legitimes: step5.heir_legitimes.clone(),
        free_portion: step5.free_portion.clone(),
        validation: step6,
        final_distributions: step9b.adjusted_distributions,
        collation_output: step8,
        vacancies: step9b.vacancies,
        succession_type: step7.final_succession_type,
        scenario_code: step3.scenario_code,
        narrative_config: NarrativeConfig::default(),
        total_restarts: 1,
        warnings: pipeline_warnings,
        step_logs,
    })
}

// ══════════════════════════════════════════════════════════════════════
// Builder helpers
// ══════════════════════════════════════════════════════════════════════

fn default_decedent(name: &str, is_married: bool) -> Decedent {
    Decedent {
        id: "decedent".into(),
        name: name.into(),
        date_of_death: "2026-01-15".into(),
        is_married,
        date_of_marriage: if is_married {
            Some("2000-01-01".into())
        } else {
            None
        },
        marriage_solemnized_in_articulo_mortis: false,
        was_ill_at_marriage: false,
        illness_caused_death: false,
        years_of_cohabitation: 0,
        has_legal_separation: false,
        is_illegitimate: false,
    }
}

fn person(id: &str, name: &str, rel: Relationship) -> Person {
    Person {
        id: id.into(),
        name: name.into(),
        is_alive_at_succession: true,
        relationship_to_decedent: rel,
        degree: match rel {
            Relationship::LegitimateChild
            | Relationship::LegitimatedChild
            | Relationship::AdoptedChild
            | Relationship::IllegitimateChild
            | Relationship::SurvivingSpouse
            | Relationship::LegitimateParent => 1,
            Relationship::LegitimateAscendant => 2,
            Relationship::Sibling => 2,
            Relationship::NephewNiece => 3,
            Relationship::OtherCollateral => 4,
            Relationship::Stranger => 0,
        },
        line: None,
        children: vec![],
        filiation_proved: true,
        filiation_proof_type: None,
        is_guilty_party_in_legal_separation: false,
        adoption: None,
        is_unworthy: false,
        unworthiness_condoned: false,
        has_renounced: false,
        blood_type: None,
    }
}

fn ic_person(id: &str, name: &str, proof: FiliationProof) -> Person {
    let mut p = person(id, name, Relationship::IllegitimateChild);
    p.filiation_proof_type = Some(proof);
    p
}

fn parent(id: &str, name: &str, line: LineOfDescent) -> Person {
    let mut p = person(id, name, Relationship::LegitimateParent);
    p.line = Some(line);
    p
}

fn grandchild(id: &str, name: &str, parent_id: &str) -> Person {
    let mut p = person(id, name, Relationship::LegitimateChild);
    p.degree = 2;
    // grandchild's parent link is set in the parent's children field
    let _ = parent_id; // used by caller to wire up children
    p
}

fn sibling(id: &str, name: &str, blood: BloodType) -> Person {
    let mut p = person(id, name, Relationship::Sibling);
    p.blood_type = Some(blood);
    p
}

fn heir_ref(id: &str, name: &str) -> HeirReference {
    HeirReference {
        person_id: Some(id.into()),
        name: name.into(),
        is_collective: false,
        class_designation: None,
    }
}

fn stranger_ref(name: &str) -> HeirReference {
    HeirReference {
        person_id: None,
        name: name.into(),
        is_collective: false,
        class_designation: None,
    }
}

fn institution(id: &str, heir: HeirReference, share: ShareSpec) -> InstitutionOfHeir {
    let is_residuary = matches!(share, ShareSpec::Residuary);
    InstitutionOfHeir {
        id: id.into(),
        heir,
        share,
        conditions: vec![],
        substitutes: vec![],
        is_residuary,
    }
}

fn simple_will(
    institutions: Vec<InstitutionOfHeir>,
    legacies: Vec<Legacy>,
    disinheritances: Vec<Disinheritance>,
) -> Will {
    Will {
        institutions,
        legacies,
        devises: vec![],
        disinheritances,
        date_executed: "2025-01-01".into(),
    }
}

fn simple_donation(
    id: &str,
    recipient: &str,
    pesos: i64,
) -> Donation {
    Donation {
        id: id.into(),
        recipient_heir_id: Some(recipient.into()),
        recipient_is_stranger: false,
        value_at_time_of_donation: Money::from_pesos(pesos),
        date: "2020-01-01".into(),
        description: "advance on inheritance".into(),
        is_expressly_exempt: false,
        is_support_education_medical: false,
        is_customary_gift: false,
        is_professional_expense: false,
        professional_expense_parent_required: false,
        professional_expense_imputed_savings: None,
        is_joint_from_both_parents: false,
        is_to_child_spouse_only: false,
        is_joint_to_child_and_spouse: false,
        is_wedding_gift: false,
        is_debt_payment_for_child: false,
        is_election_expense: false,
        is_fine_payment: false,
    }
}

fn default_config() -> EngineConfig {
    EngineConfig::default()
}

// ══════════════════════════════════════════════════════════════════════
// Invariant checks (§14.2)
// ══════════════════════════════════════════════════════════════════════

/// Invariant 1: Sum of per_heir net_from_estate = net_distributable_estate
fn check_sum_invariant(output: &EngineOutput, estate: &Money) {
    let sum: BigInt = output
        .per_heir_shares
        .iter()
        .map(|s| s.net_from_estate.centavos.clone())
        .fold(BigInt::zero(), |a, b| a + b);
    assert_eq!(
        sum, estate.centavos,
        "Invariant 1 (Sum): net_from_estate sum {} != estate {}",
        sum, estate.centavos
    );
}

/// Invariant 6: Adopted child share == legitimate child share
#[allow(dead_code)]
fn check_adoption_equality(output: &EngineOutput) {
    let lc_shares: Vec<&InheritanceShare> = output
        .per_heir_shares
        .iter()
        .filter(|s| s.heir_category == EffectiveCategory::LegitimateChildGroup && s.inherits_by == InheritanceMode::OwnRight)
        .collect();
    // All LC shares should be equal (when there's no collation difference)
    if lc_shares.len() > 1 {
        let first = &lc_shares[0].total.centavos;
        for s in &lc_shares[1..] {
            assert_eq!(
                &s.total.centavos, first,
                "Invariant 6: LC shares should be equal when no collation differences"
            );
        }
    }
}

/// Invariant 10: Scenario code matches surviving heir combination
#[allow(dead_code)]
fn check_scenario_consistency(output: &EngineOutput, expected: ScenarioCode) {
    assert_eq!(
        output.scenario_code, expected,
        "Invariant 10: scenario {} != expected {:?}",
        format!("{:?}", output.scenario_code),
        expected
    );
}

// ══════════════════════════════════════════════════════════════════════
// Helper: find a share by heir_id
// ══════════════════════════════════════════════════════════════════════

fn find_share<'a>(output: &'a EngineOutput, heir_id: &str) -> &'a InheritanceShare {
    output
        .per_heir_shares
        .iter()
        .find(|s| s.heir_id == heir_id)
        .unwrap_or_else(|| panic!("No share found for heir '{}'", heir_id))
}

#[allow(dead_code)]
fn find_share_by_name<'a>(output: &'a EngineOutput, name: &str) -> &'a InheritanceShare {
    output
        .per_heir_shares
        .iter()
        .find(|s| s.heir_name == name)
        .unwrap_or_else(|| panic!("No share found for heir name '{}'", name))
}

fn pesos(amount: i64) -> BigInt {
    BigInt::from(amount) * BigInt::from(100)
}

fn assert_total_pesos(share: &InheritanceShare, expected_pesos: i64, label: &str) {
    let expected = pesos(expected_pesos);
    assert_eq!(
        share.total.centavos, expected,
        "{}: total {} != expected {} pesos",
        label, share.total.centavos, expected_pesos
    );
}

fn assert_net_from_estate_pesos(share: &InheritanceShare, expected_pesos: i64, label: &str) {
    let expected = pesos(expected_pesos);
    assert_eq!(
        share.net_from_estate.centavos, expected,
        "{}: net_from_estate {} != expected {} pesos",
        label, share.net_from_estate.centavos, expected_pesos
    );
}

/// Exact-centavo assertion.
///
/// `assert_total_pesos` multiplies a whole-peso `i64` by 100 and therefore cannot express
/// 166666666 or 166666667 centavos, which are the values TV-10 and TV-13 actually produce
/// under the largest-remainder distribution in `step10_finalize.rs`. This helper can.
/// It does not replace `assert_total_pesos` — every existing call to that helper stays.
fn assert_total_centavos(share: &InheritanceShare, expected_centavos: i64, label: &str) {
    let expected = BigInt::from(expected_centavos);
    assert_eq!(
        share.total.centavos, expected,
        "{}: total {} centavos != expected {} centavos",
        label, share.total.centavos, expected_centavos
    );
}

/// Whole-vector shape assertion: scenario code, succession type and heir-row count.
///
/// The row-count assertion is what makes a duplicated or dropped heir row a test failure
/// rather than a silent change.
fn assert_vector_shape(
    output: &EngineOutput,
    expected_code: ScenarioCode,
    expected_type: SuccessionType,
    expected_rows: usize,
    label: &str,
) {
    assert_eq!(
        output.scenario_code, expected_code,
        "{}: scenario_code {:?} != expected {:?}",
        label, output.scenario_code, expected_code
    );
    assert_eq!(
        output.succession_type, expected_type,
        "{}: succession_type {:?} != expected {:?}",
        label, output.succession_type, expected_type
    );
    assert_eq!(
        output.per_heir_shares.len(),
        expected_rows,
        "{}: per_heir_shares.len() {} != expected {}",
        label,
        output.per_heir_shares.len(),
        expected_rows
    );
}

// ══════════════════════════════════════════════════════════════════════
// TV-01: I1 -- Single LC, entire estate
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv01_single_lc_entire_estate() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(5_000_000),
        decedent: default_decedent("Juan Cruz", false),
        family_tree: vec![person("lc1", "Maria Cruz", Relationship::LegitimateChild)],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert_eq!(output.succession_type, SuccessionType::Intestate);
    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::I1, SuccessionType::Intestate, 1, "TV-01");
    check_scenario_consistency(&output, ScenarioCode::I1);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "lc1"), 500000000, "TV-01 lc1");

    let maria = find_share(&output, "lc1");
    assert_total_pesos(maria, 5_000_000, "Maria");
}

// ══════════════════════════════════════════════════════════════════════
// TV-02: I2 -- 3 LC + Spouse, equal shares (Art. 996)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv02_married_3lc_spouse_equal() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(12_000_000),
        decedent: default_decedent("Pedro Santos", true),
        family_tree: vec![
            person("lc1", "Ana", Relationship::LegitimateChild),
            person("lc2", "Ben", Relationship::LegitimateChild),
            person("lc3", "Carlos", Relationship::LegitimateChild),
            person("sp", "Rosa", Relationship::SurvivingSpouse),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert_eq!(output.succession_type, SuccessionType::Intestate);
    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::I2, SuccessionType::Intestate, 4, "TV-02");
    check_scenario_consistency(&output, ScenarioCode::I2);
    assert_total_centavos(find_share(&output, "lc1"), 300000000, "TV-02 lc1");
    assert_total_centavos(find_share(&output, "lc2"), 300000000, "TV-02 lc2");
    assert_total_centavos(find_share(&output, "lc3"), 300000000, "TV-02 lc3");
    assert_total_centavos(find_share(&output, "sp"), 300000000, "TV-02 sp");

    // Each gets 1/4 = P3,000,000
    for id in &["lc1", "lc2", "lc3", "sp"] {
        let share = find_share(&output, id);
        assert_total_pesos(share, 3_000_000, id);
    }
}

// ══════════════════════════════════════════════════════════════════════
// TV-03: I3 -- 2 LC + 1 IC, 2:1 ratio
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv03_2lc_1ic_ratio() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(10_000_000),
        decedent: default_decedent("Diego Reyes", false),
        family_tree: vec![
            person("lc1", "Elena", Relationship::LegitimateChild),
            person("lc2", "Felix", Relationship::LegitimateChild),
            ic_person("ic1", "Gloria", FiliationProof::BirthCertificate),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert_eq!(output.succession_type, SuccessionType::Intestate);
    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::I3, SuccessionType::Intestate, 3, "TV-03");
    check_scenario_consistency(&output, ScenarioCode::I3);
    assert_total_centavos(find_share(&output, "lc1"), 400000000, "TV-03 lc1");
    assert_total_centavos(find_share(&output, "lc2"), 400000000, "TV-03 lc2");
    assert_total_centavos(find_share(&output, "ic1"), 200000000, "TV-03 ic1");

    // 2:1 ratio, total units=5: LC get 2/5=P4M each, IC gets 1/5=P2M
    assert_total_pesos(find_share(&output, "lc1"), 4_000_000, "Elena");
    assert_total_pesos(find_share(&output, "lc2"), 4_000_000, "Felix");
    assert_total_pesos(find_share(&output, "ic1"), 2_000_000, "Gloria");
}

// ══════════════════════════════════════════════════════════════════════
// TV-04: I11 -- Spouse only inherits all
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv04_spouse_only() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(8_000_000),
        decedent: default_decedent("Mario Lim", true),
        family_tree: vec![person("sp", "Lucia", Relationship::SurvivingSpouse)],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert_eq!(output.succession_type, SuccessionType::Intestate);
    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::I11, SuccessionType::Intestate, 1, "TV-04");
    check_scenario_consistency(&output, ScenarioCode::I11);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "sp"), 800000000, "TV-04 sp");

    assert_total_pesos(find_share(&output, "sp"), 8_000_000, "Lucia");
}

// ══════════════════════════════════════════════════════════════════════
// TV-05: I6 -- Parents + Spouse (no children)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv05_parents_and_spouse() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(10_000_000),
        decedent: default_decedent("Roberto Garcia", true),
        family_tree: vec![
            person("sp", "Teresa", Relationship::SurvivingSpouse),
            parent("f", "Manuel", LineOfDescent::Paternal),
            parent("m", "Dolores", LineOfDescent::Maternal),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert_eq!(output.succession_type, SuccessionType::Intestate);
    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::I6, SuccessionType::Intestate, 3, "TV-05");
    check_scenario_consistency(&output, ScenarioCode::I6);
    assert_total_centavos(find_share(&output, "f"), 250000000, "TV-05 f");
    assert_total_centavos(find_share(&output, "m"), 250000000, "TV-05 m");
    assert_total_centavos(find_share(&output, "sp"), 500000000, "TV-05 sp");

    // Art. 997: 1/2 to spouse, 1/2 to ascendants (equal)
    assert_total_pesos(find_share(&output, "sp"), 5_000_000, "Teresa");
    assert_total_pesos(find_share(&output, "f"), 2_500_000, "Manuel");
    assert_total_pesos(find_share(&output, "m"), 2_500_000, "Dolores");
}

// ══════════════════════════════════════════════════════════════════════
// TV-06: T1 -- Will leaves FP to charity
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv06_testate_fp_to_charity() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(10_000_000),
        decedent: default_decedent("Carmen Dela Cruz", false),
        family_tree: vec![
            person("lc1", "Daniel", Relationship::LegitimateChild),
            person("lc2", "Eva", Relationship::LegitimateChild),
        ],
        will: Some(simple_will(
            vec![
                institution("i1", heir_ref("lc1", "Daniel"), ShareSpec::EqualWithOthers),
                institution("i2", heir_ref("lc2", "Eva"), ShareSpec::EqualWithOthers),
                institution("i3", stranger_ref("Charity C"), ShareSpec::Residuary),
            ],
            vec![],
            vec![],
        )),
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::T1, SuccessionType::Testate, 3, "TV-06");
    check_scenario_consistency(&output, ScenarioCode::T1);
    assert_total_centavos(find_share(&output, "lc1"), 250000000, "TV-06 lc1");
    assert_total_centavos(find_share(&output, "lc2"), 250000000, "TV-06 lc2");
    assert_total_centavos(find_share(&output, "Charity C"), 500000000, "TV-06 Charity C");

    // LC1 and LC2 each get legitime only = P2.5M
    assert_total_pesos(find_share(&output, "lc1"), 2_500_000, "Daniel");
    assert_total_pesos(find_share(&output, "lc2"), 2_500_000, "Eva");
    // Charity gets FP = P5M
    let charity = output
        .per_heir_shares
        .iter()
        .find(|s| s.heir_name == "Charity C")
        .expect("Charity C share");
    assert_eq!(charity.total.centavos, pesos(5_000_000), "Charity total");
}

// ══════════════════════════════════════════════════════════════════════
// TV-07: T3 -> I2 -- Preterition annuls will
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv07_preterition_annuls_will() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(12_000_000),
        decedent: default_decedent("Alberto Ramos", true),
        family_tree: vec![
            person("lc1", "Bea", Relationship::LegitimateChild),
            person("lc2", "Cris", Relationship::LegitimateChild),
            person("lc3", "Dina", Relationship::LegitimateChild),
            person("sp", "Flora", Relationship::SurvivingSpouse),
        ],
        will: Some(simple_will(
            vec![
                institution(
                    "i1",
                    heir_ref("lc1", "Bea"),
                    ShareSpec::Fraction(frac(1, 2)),
                ),
                institution(
                    "i2",
                    heir_ref("lc2", "Cris"),
                    ShareSpec::Fraction(frac(1, 2)),
                ),
                // LC3 (Dina) totally omitted — triggers preterition
            ],
            vec![],
            vec![],
        )),
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    // Preterition -> intestate by preterition
    assert!(
        output.succession_type == SuccessionType::IntestateByPreterition
            || output.succession_type == SuccessionType::Intestate,
        "Expected intestate (by preterition), got {:?}",
        output.succession_type
    );
    check_sum_invariant(&output, &input.net_distributable_estate);

    // spec 14.2 writes "T3 to I2": the T3 institution is detected then annulled, so the code stays T3 and the type becomes IntestateByPreterition. fuzz_invariants.rs INV10 documents the same rule.
    assert_vector_shape(&output, ScenarioCode::T3, SuccessionType::IntestateByPreterition, 4, "TV-07");
    check_scenario_consistency(&output, ScenarioCode::T3);
    assert_total_centavos(find_share(&output, "lc1"), 300000000, "TV-07 lc1");
    assert_total_centavos(find_share(&output, "lc2"), 300000000, "TV-07 lc2");
    assert_total_centavos(find_share(&output, "lc3"), 300000000, "TV-07 lc3");
    assert_total_centavos(find_share(&output, "sp"), 300000000, "TV-07 sp");

    // All 4 heirs get equal shares = P3M each (I2 rules)
    for id in &["lc1", "lc2", "lc3", "sp"] {
        assert_total_pesos(find_share(&output, id), 3_000_000, id);
    }
}

// ══════════════════════════════════════════════════════════════════════
// TV-08: T3 -- Disinheritance + Representation
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv08_disinheritance_representation() {
    let mut lc3 = person("lc3", "Karen", Relationship::LegitimateChild);
    lc3.children = vec!["gc1".into(), "gc2".into()];

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(16_000_000),
        decedent: default_decedent("Hector Villanueva", true),
        family_tree: vec![
            person("lc1", "Irene", Relationship::LegitimateChild),
            person("lc2", "Jorge", Relationship::LegitimateChild),
            lc3,
            grandchild("gc1", "Luis", "lc3"),
            grandchild("gc2", "Marta", "lc3"),
            person("sp", "Nora", Relationship::SurvivingSpouse),
        ],
        will: Some(simple_will(
            vec![
                institution("i1", heir_ref("lc1", "Irene"), ShareSpec::EqualWithOthers),
                institution("i2", heir_ref("lc2", "Jorge"), ShareSpec::EqualWithOthers),
                institution("i3", stranger_ref("Friend F"), ShareSpec::Residuary),
            ],
            vec![],
            vec![Disinheritance {
                heir_reference: heir_ref("lc3", "Karen"),
                cause_code: DisinheritanceCause::ChildMaltreatment,
                cause_specified_in_will: true,
                cause_proven: true,
                reconciliation_occurred: false,
            }],
        )),
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::T3, SuccessionType::Testate, 7, "TV-08");
    check_scenario_consistency(&output, ScenarioCode::T3);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "lc1"), 266666667, "TV-08 lc1");
    assert_total_centavos(find_share(&output, "lc2"), 266666667, "TV-08 lc2");
    assert_total_centavos(find_share(&output, "lc3"), 0, "TV-08 lc3");
    assert_total_centavos(find_share(&output, "gc1"), 133333333, "TV-08 gc1");
    assert_total_centavos(find_share(&output, "gc2"), 133333333, "TV-08 gc2");
    assert_total_centavos(find_share(&output, "sp"), 266666667, "TV-08 sp");
    assert_total_centavos(find_share(&output, "Friend F"), 533333333, "TV-08 Friend F");

    // Karen (disinherited) gets 0
    let karen = find_share(&output, "lc3");
    assert_eq!(karen.total.centavos, BigInt::zero(), "Karen should get 0");

    // Each child line gets 1/3 of children's collective legitime (P8M / 3)
    // Spouse gets equal share from FP
    // Friend F gets remainder of FP
    // Exact amounts depend on the engine's rounding
    // GC1 and GC2 should represent LC3's line
    let gc1 = find_share(&output, "gc1");
    let gc2 = find_share(&output, "gc2");
    // They should split LC3's share equally
    assert_eq!(
        gc1.total.centavos, gc2.total.centavos,
        "Grandchildren should have equal shares"
    );
    // Their combined share should equal one child-line share
}

// ══════════════════════════════════════════════════════════════════════
// TV-09: T3 -- Adopted child = legitimate (RA 8552)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv09_adopted_equals_legitimate() {
    let mut adopted = person("ac1", "Sam", Relationship::AdoptedChild);
    adopted.adoption = Some(Adoption {
        decree_date: "2010-03-15".into(),
        regime: AdoptionRegime::Ra8552,
        adopter: "decedent".into(),
        adoptee: "ac1".into(),
        is_stepparent_adoption: false,
        biological_parent_spouse: None,
        is_rescinded: false,
        rescission_date: None,
    });

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(15_000_000),
        decedent: default_decedent("Patricia Torres", true),
        family_tree: vec![
            person("lc1", "Quentin", Relationship::LegitimateChild),
            person("lc2", "Rita", Relationship::LegitimateChild),
            adopted,
            person("sp", "Victor", Relationship::SurvivingSpouse),
        ],
        will: Some(simple_will(
            vec![
                institution("i1", heir_ref("lc1", "Quentin"), ShareSpec::EqualWithOthers),
                institution("i2", heir_ref("lc2", "Rita"), ShareSpec::EqualWithOthers),
                institution("i3", heir_ref("ac1", "Sam"), ShareSpec::EqualWithOthers),
                institution("i4", stranger_ref("University U"), ShareSpec::Residuary),
            ],
            vec![],
            vec![],
        )),
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::T3, SuccessionType::Testate, 5, "TV-09");
    check_scenario_consistency(&output, ScenarioCode::T3);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "lc1"), 250000000, "TV-09 lc1");
    assert_total_centavos(find_share(&output, "lc2"), 250000000, "TV-09 lc2");
    assert_total_centavos(find_share(&output, "ac1"), 250000000, "TV-09 ac1");
    assert_total_centavos(find_share(&output, "sp"), 250000000, "TV-09 sp");
    assert_total_centavos(find_share(&output, "University U"), 500000000, "TV-09 University U");

    // Invariant 6: adopted child == legitimate child
    let lc1 = find_share(&output, "lc1");
    let ac1 = find_share(&output, "ac1");
    assert_eq!(
        lc1.total.centavos, ac1.total.centavos,
        "Invariant 6: adopted share {} != legitimate share {}",
        ac1.total.centavos, lc1.total.centavos
    );

    // Each child gets P2.5M, spouse P2.5M, university P5M
    assert_total_pesos(lc1, 2_500_000, "Quentin");
    assert_total_pesos(find_share(&output, "lc2"), 2_500_000, "Rita");
    assert_total_pesos(ac1, 2_500_000, "Sam");
    assert_total_pesos(find_share(&output, "sp"), 2_500_000, "Victor");
}

// ══════════════════════════════════════════════════════════════════════
// TV-10: I2 -- Representation (predeceased child with 3 grandchildren)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv10_representation_per_stirpes() {
    let mut lc2 = person("lc2", "Gil", Relationship::LegitimateChild);
    lc2.is_alive_at_succession = false;
    lc2.children = vec!["gc1".into(), "gc2".into(), "gc3".into()];

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(20_000_000),
        decedent: default_decedent("Ernesto Mendoza", true),
        family_tree: vec![
            person("lc1", "Faye", Relationship::LegitimateChild),
            lc2,
            person("lc3", "Helen", Relationship::LegitimateChild),
            grandchild("gc1", "Ian", "lc2"),
            grandchild("gc2", "Joy", "lc2"),
            grandchild("gc3", "Ken", "lc2"),
            person("sp", "Lorna", Relationship::SurvivingSpouse),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert_eq!(output.succession_type, SuccessionType::Intestate);
    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::I2, SuccessionType::Intestate, 7, "TV-10");
    check_scenario_consistency(&output, ScenarioCode::I2);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "lc1"), 500000000, "TV-10 lc1");
    assert_total_centavos(find_share(&output, "lc2"), 0, "TV-10 lc2");
    assert_total_centavos(find_share(&output, "gc1"), 166666667, "TV-10 gc1");
    assert_total_centavos(find_share(&output, "gc2"), 166666667, "TV-10 gc2");
    assert_total_centavos(find_share(&output, "gc3"), 166666666, "TV-10 gc3");
    assert_total_centavos(find_share(&output, "lc3"), 500000000, "TV-10 lc3");
    assert_total_centavos(find_share(&output, "sp"), 500000000, "TV-10 sp");

    // 3 lines + spouse = 4 shares of P5M each
    assert_total_pesos(find_share(&output, "lc1"), 5_000_000, "Faye");
    assert_total_pesos(find_share(&output, "lc3"), 5_000_000, "Helen");
    assert_total_pesos(find_share(&output, "sp"), 5_000_000, "Lorna");

    // Grandchildren split LC2's P5M line per stirpes (P5M/3 each)
    // P5M/3 = P1,666,666.67 -- rounding applies
    let gc1 = find_share(&output, "gc1");
    let gc2 = find_share(&output, "gc2");
    let gc3 = find_share(&output, "gc3");

    // Invariant 5: sum of representatives = line ancestor's share
    let gc_sum = gc1.total.centavos.clone() + gc2.total.centavos.clone() + gc3.total.centavos.clone();
    assert_eq!(
        gc_sum,
        pesos(5_000_000),
        "Invariant 5: GC sum {} != line share P5M",
        gc_sum
    );
}

// ══════════════════════════════════════════════════════════════════════
// TV-11: T5b -- Collation + cap check + inofficiousness
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv11_collation_cap_inofficious() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(18_000_000),
        decedent: default_decedent("Oscar Navarro", true),
        family_tree: vec![
            person("lc1", "Pilar", Relationship::LegitimateChild),
            person("lc2", "Ramon", Relationship::LegitimateChild),
            ic_person("ic1", "Sofia", FiliationProof::FinalJudgment),
            person("sp", "Tina", Relationship::SurvivingSpouse),
        ],
        will: Some(simple_will(
            vec![
                institution("i1", heir_ref("lc1", "Pilar"), ShareSpec::EqualWithOthers),
                institution("i2", heir_ref("lc2", "Ramon"), ShareSpec::EqualWithOthers),
            ],
            vec![Legacy {
                id: "leg1".into(),
                legatee: stranger_ref("Friend G"),
                property: LegacySpec::FixedAmount(Money::from_pesos(3_000_000)),
                conditions: vec![],
                substitutes: vec![],
                is_preferred: false,
            }],
            vec![],
        )),
        donations: vec![simple_donation("d1", "lc1", 2_000_000)],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::T5b, SuccessionType::Testate, 5, "TV-11");
    check_scenario_consistency(&output, ScenarioCode::T5b);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "lc1"), 500000000, "TV-11 lc1");
    assert_total_centavos(find_share(&output, "lc2"), 500000000, "TV-11 lc2");
    assert_total_centavos(find_share(&output, "sp"), 500000000, "TV-11 sp");
    assert_total_centavos(find_share(&output, "ic1"), 250000000, "TV-11 ic1");
    assert_total_centavos(find_share(&output, "Friend G"), 250000000, "TV-11 Friend G");

    // Invariant 9: from_estate_sum = net_estate
    let from_estate_sum: BigInt = output
        .per_heir_shares
        .iter()
        .map(|s| s.net_from_estate.centavos.clone())
        .fold(BigInt::zero(), |a, b| a + b);
    assert_eq!(
        from_estate_sum,
        pesos(18_000_000),
        "Invariant 9: from_estate_sum != P18M"
    );

    // Pilar: P5M entitlement - P2M donation = P3M from estate
    assert_net_from_estate_pesos(find_share(&output, "lc1"), 3_000_000, "Pilar");
    // Ramon: P5M from estate
    assert_net_from_estate_pesos(find_share(&output, "lc2"), 5_000_000, "Ramon");
    // Sofia (IC): P2.5M
    assert_net_from_estate_pesos(find_share(&output, "ic1"), 2_500_000, "Sofia");
    // Tina (spouse): P5M
    assert_net_from_estate_pesos(find_share(&output, "sp"), 5_000_000, "Tina");
    // Friend G: reduced from P3M to P2.5M (inofficious)
    let friend_g = output
        .per_heir_shares
        .iter()
        .find(|s| s.heir_name == "Friend G")
        .expect("Friend G share");
    assert_eq!(
        friend_g.net_from_estate.centavos,
        pesos(2_500_000),
        "Friend G reduced to P2.5M"
    );
}

// ══════════════════════════════════════════════════════════════════════
// TV-12: T2 -- Inofficious legacy + spouse underprovision
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv12_inofficious_legacy_spouse_recovery() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(10_000_000),
        decedent: default_decedent("Vivian Aquino", true),
        family_tree: vec![
            person("lc1", "Wes", Relationship::LegitimateChild),
            person("sp", "Xena", Relationship::SurvivingSpouse),
        ],
        will: Some(simple_will(
            vec![],
            vec![Legacy {
                id: "leg1".into(),
                legatee: stranger_ref("Friend H"),
                property: LegacySpec::FixedAmount(Money::from_pesos(6_000_000)),
                conditions: vec![],
                substitutes: vec![],
                is_preferred: false,
            }],
            vec![],
        )),
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::T2, SuccessionType::Testate, 3, "TV-12");
    check_scenario_consistency(&output, ScenarioCode::T2);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "lc1"), 500000000, "TV-12 lc1");
    assert_total_centavos(find_share(&output, "sp"), 250000000, "TV-12 sp");
    assert_total_centavos(find_share(&output, "Friend H"), 250000000, "TV-12 Friend H");

    // LC1 = P5M, Spouse = P2.5M, Friend H reduced from P6M to P2.5M
    assert_total_pesos(find_share(&output, "lc1"), 5_000_000, "Wes");
    assert_total_pesos(find_share(&output, "sp"), 2_500_000, "Xena");
    let friend_h = output
        .per_heir_shares
        .iter()
        .find(|s| s.heir_name == "Friend H")
        .expect("Friend H");
    assert_eq!(
        friend_h.total.centavos,
        pesos(2_500_000),
        "Friend H reduced"
    );
}

// ══════════════════════════════════════════════════════════════════════
// TV-13: T5a -- Cap rule triggered (many ICs with spouse)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv13_cap_rule_triggered() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(20_000_000),
        decedent: default_decedent("Alma Bautista", true),
        family_tree: vec![
            person("lc1", "Bianca", Relationship::LegitimateChild),
            ic_person("ic1", "Carlo", FiliationProof::OpenContinuousPossession),
            ic_person("ic2", "Dante", FiliationProof::BirthCertificate),
            ic_person("ic3", "Elisa", FiliationProof::PrivateHandwrittenAdmission),
            person("sp", "Fiona", Relationship::SurvivingSpouse),
        ],
        will: Some(simple_will(
            vec![
                institution("i1", heir_ref("lc1", "Bianca"), ShareSpec::EqualWithOthers),
                institution("i2", heir_ref("ic1", "Carlo"), ShareSpec::EqualWithOthers),
                institution("i3", heir_ref("ic2", "Dante"), ShareSpec::EqualWithOthers),
                institution("i4", heir_ref("ic3", "Elisa"), ShareSpec::EqualWithOthers),
                institution("i5", heir_ref("sp", "Fiona"), ShareSpec::EqualWithOthers),
            ],
            vec![],
            vec![],
        )),
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::T5a, SuccessionType::Testate, 5, "TV-13");
    check_scenario_consistency(&output, ScenarioCode::T5a);
    assert_total_centavos(find_share(&output, "lc1"), 1000000000, "TV-13 lc1");
    assert_total_centavos(find_share(&output, "sp"), 500000000, "TV-13 sp");
    assert_total_centavos(find_share(&output, "ic1"), 166666667, "TV-13 ic1");
    assert_total_centavos(find_share(&output, "ic2"), 166666667, "TV-13 ic2");
    // spec 14.3 displays P1,666,666.67 for all three ICs, which would sum to P5,000,000.01. The engine emits 166666667 / 166666667 / 166666666, summing to exactly 5000000000 centavos, under the largest-remainder distribution in step10_finalize.rs. Conservation requires it; the spec figure is a rounded display.
    assert_total_centavos(find_share(&output, "ic3"), 166666666, "TV-13 ic3");

    // LC: P10M, Spouse: P5M, each IC: P5M/3 = P1,666,666.67
    assert_total_pesos(find_share(&output, "lc1"), 10_000_000, "Bianca");
    assert_total_pesos(find_share(&output, "sp"), 5_000_000, "Fiona");

    // ICs capped: P5M/3 each. P5,000,000/3 = 166,666,666.67 centavos
    // With rounding, they should sum to P5M
    let ic1 = find_share(&output, "ic1");
    let ic2 = find_share(&output, "ic2");
    let ic3 = find_share(&output, "ic3");
    let ic_sum = ic1.total.centavos.clone() + ic2.total.centavos.clone() + ic3.total.centavos.clone();
    assert_eq!(ic_sum, pesos(5_000_000), "IC sum should be P5M after cap");
}

// ══════════════════════════════════════════════════════════════════════
// TV-14: MIXED -- Will covers part of FP, undisposed goes intestate
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv14_mixed_succession() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(10_000_000),
        decedent: default_decedent("Andres Lim", true),
        family_tree: vec![
            person("lc1", "Belen", Relationship::LegitimateChild),
            person("lc2", "Cesar", Relationship::LegitimateChild),
            person("sp", "Diana", Relationship::SurvivingSpouse),
        ],
        will: Some(simple_will(
            vec![
                institution("i1", heir_ref("lc1", "Belen"), ShareSpec::EqualWithOthers),
                institution("i2", heir_ref("lc2", "Cesar"), ShareSpec::EqualWithOthers),
                institution(
                    "i3",
                    stranger_ref("Charity A"),
                    ShareSpec::Fraction(frac(1, 10)), // P1M of P10M
                ),
            ],
            vec![],
            vec![],
        )),
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);

    // spec 14.2 writes "MIXED", which is the succession type, not a ScenarioCode. spec 14.4 states "Scenario T3, detected as MIXED".
    assert_vector_shape(&output, ScenarioCode::T3, SuccessionType::Mixed, 4, "TV-14");
    check_scenario_consistency(&output, ScenarioCode::T3);
    assert_total_centavos(find_share(&output, "lc1"), 300000000, "TV-14 lc1");
    assert_total_centavos(find_share(&output, "lc2"), 300000000, "TV-14 lc2");
    assert_total_centavos(find_share(&output, "sp"), 300000000, "TV-14 sp");
    assert_total_centavos(find_share(&output, "Charity A"), 100000000, "TV-14 Charity A");

    // Belen: P2.5M (legitime) + P500K (intestate) = P3M
    assert_total_pesos(find_share(&output, "lc1"), 3_000_000, "Belen");
    assert_total_pesos(find_share(&output, "lc2"), 3_000_000, "Cesar");
    assert_total_pesos(find_share(&output, "sp"), 3_000_000, "Diana");

    let charity = output
        .per_heir_shares
        .iter()
        .find(|s| s.heir_name == "Charity A")
        .expect("Charity A");
    assert_eq!(charity.total.centavos, pesos(1_000_000), "Charity A = P1M");
}

// ══════════════════════════════════════════════════════════════════════
// TV-15: I13 -- Collateral siblings (full + half blood)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv15_collateral_siblings() {
    // 2 full-blood siblings + 1 half-blood sibling
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(10_000_000),
        decedent: default_decedent("Eduardo Tan", false),
        family_tree: vec![
            sibling("sib1", "Flora", BloodType::Full),
            sibling("sib2", "Gino", BloodType::Full),
            sibling("sib3", "Hilda", BloodType::Half),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert_eq!(output.succession_type, SuccessionType::Intestate);
    check_sum_invariant(&output, &input.net_distributable_estate);

    // The full-blood to half-blood ratio under Art. 1006 is the recorded question LAWYER-DECISION: LAWYER-03. These amounts are pinned as a characterization of current behaviour, not as an answer to it.
    assert_vector_shape(&output, ScenarioCode::I13, SuccessionType::Intestate, 3, "TV-15");
    check_scenario_consistency(&output, ScenarioCode::I13);
    assert_total_centavos(find_share(&output, "sib1"), 400000000, "TV-15 sib1");
    assert_total_centavos(find_share(&output, "sib2"), 400000000, "TV-15 sib2");
    assert_total_centavos(find_share(&output, "sib3"), 200000000, "TV-15 sib3");

    // Art. 1006: full=2units, full=2units, half=1unit. Total units=5.
    // Per unit = P10M/5 = P2M
    // Full siblings get 2/5 = P4M each, half sibling gets 1/5 = P2M
    assert_total_pesos(find_share(&output, "sib1"), 4_000_000, "Flora");
    assert_total_pesos(find_share(&output, "sib2"), 4_000_000, "Gino");
    assert_total_pesos(find_share(&output, "sib3"), 2_000_000, "Hilda");
}

// ══════════════════════════════════════════════════════════════════════
// TV-16: T12-AM -- Articulo mortis (spouse sole heir, marriage at death)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv16_articulo_mortis() {
    let decedent = Decedent {
        id: "decedent".into(),
        name: "Ignacio Bello".into(),
        date_of_death: "2026-05-20".into(),
        is_married: true,
        date_of_marriage: Some("2026-04-01".into()),
        marriage_solemnized_in_articulo_mortis: true,
        was_ill_at_marriage: true,
        illness_caused_death: true,
        years_of_cohabitation: 1,
        has_legal_separation: false,
        is_illegitimate: false,
    };

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(9_000_000),
        decedent,
        family_tree: vec![person("sp", "Julia", Relationship::SurvivingSpouse)],
        will: Some(simple_will(
            vec![
                institution("i1", heir_ref("sp", "Julia"), ShareSpec::EqualWithOthers),
                institution("i2", stranger_ref("Nephew N"), ShareSpec::Residuary),
            ],
            vec![],
            vec![],
        )),
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);

    // spec 14.2 writes "T12-AM"; -AM is the spec's articulo-mortis annotation and T12 is the enum variant.
    assert_vector_shape(&output, ScenarioCode::T12, SuccessionType::Testate, 2, "TV-16");
    check_scenario_consistency(&output, ScenarioCode::T12);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "sp"), 300000000, "TV-16 sp");
    assert_total_centavos(find_share(&output, "Nephew N"), 600000000, "TV-16 Nephew N");

    // Articulo mortis: spouse 1/3 (reduced from 1/2)
    assert_total_pesos(find_share(&output, "sp"), 3_000_000, "Julia");
    // Nephew gets 2/3 FP = P6M
    let nephew = output
        .per_heir_shares
        .iter()
        .find(|s| s.heir_name == "Nephew N")
        .expect("Nephew N");
    assert_eq!(nephew.total.centavos, pesos(6_000_000), "Nephew N = P6M");
}

// ══════════════════════════════════════════════════════════════════════
// TV-17: I7 -- IC-only (3 illegitimate children, filiation gate)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv17_ic_only_equal_shares() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(6_000_000),
        decedent: default_decedent("Kevin Ramos", false),
        family_tree: vec![
            ic_person("ic1", "Lara", FiliationProof::BirthCertificate),
            ic_person("ic2", "Marco", FiliationProof::FinalJudgment),
            ic_person("ic3", "Nina", FiliationProof::PublicDocumentAdmission),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert_eq!(output.succession_type, SuccessionType::Intestate);
    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::I7, SuccessionType::Intestate, 3, "TV-17");
    check_scenario_consistency(&output, ScenarioCode::I7);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "ic1"), 200000000, "TV-17 ic1");
    assert_total_centavos(find_share(&output, "ic2"), 200000000, "TV-17 ic2");
    assert_total_centavos(find_share(&output, "ic3"), 200000000, "TV-17 ic3");

    // Art. 988: ICs share equally = P2M each
    assert_total_pesos(find_share(&output, "ic1"), 2_000_000, "Lara");
    assert_total_pesos(find_share(&output, "ic2"), 2_000_000, "Marco");
    assert_total_pesos(find_share(&output, "ic3"), 2_000_000, "Nina");
}

// ══════════════════════════════════════════════════════════════════════
// TV-18: I15 -- Escheat (no heirs, estate to State)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv18_escheat_to_state() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(5_000_000),
        decedent: default_decedent("Oscar Cruz", false),
        family_tree: vec![],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert_eq!(output.succession_type, SuccessionType::Intestate);
    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::I15, SuccessionType::Intestate, 1, "TV-18");
    check_scenario_consistency(&output, ScenarioCode::I15);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "STATE"), 500000000, "TV-18 STATE");

    // Art. 1011: entire estate to State
    assert_eq!(output.per_heir_shares.len(), 1, "One share (State)");
    assert_eq!(
        output.per_heir_shares[0].total.centavos,
        pesos(5_000_000),
        "State gets P5M"
    );
}

// ══════════════════════════════════════════════════════════════════════
// TV-19: I2 -> I5 -- Total renunciation, parents inherit
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv19_total_renunciation_restart() {
    let mut lc1 = person("lc1", "Queenie", Relationship::LegitimateChild);
    lc1.has_renounced = true;
    let mut lc2 = person("lc2", "Rafael", Relationship::LegitimateChild);
    lc2.has_renounced = true;

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(12_000_000),
        decedent: default_decedent("Pablo Dela Rosa", false),
        family_tree: vec![
            lc1,
            lc2,
            parent("f", "Santiago", LineOfDescent::Paternal),
            parent("m", "Teresa", LineOfDescent::Maternal),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);

    // spec 14.2 writes "I2 to I5": I2 before the renunciation restart, I5 after. I5 is the final emitted code.
    assert_vector_shape(&output, ScenarioCode::I5, SuccessionType::Intestate, 4, "TV-19");
    check_scenario_consistency(&output, ScenarioCode::I5);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "f"), 600000000, "TV-19 f");
    assert_total_centavos(find_share(&output, "m"), 600000000, "TV-19 m");
    assert_total_centavos(find_share(&output, "lc1"), 0, "TV-19 lc1");
    assert_total_centavos(find_share(&output, "lc2"), 0, "TV-19 lc2");

    // After restart: parents inherit P6M each
    assert_total_pesos(find_share(&output, "f"), 6_000_000, "Santiago");
    assert_total_pesos(find_share(&output, "m"), 6_000_000, "Teresa");

    // Renounced children get 0
    let q = find_share(&output, "lc1");
    assert_eq!(q.total.centavos, BigInt::zero(), "Queenie renounced = 0");
    let r = find_share(&output, "lc2");
    assert_eq!(r.total.centavos, BigInt::zero(), "Rafael renounced = 0");
}

// ══════════════════════════════════════════════════════════════════════
// TV-20: I-ID -- Iron Curtain (Art. 992)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv20_iron_curtain() {
    let mut decedent = default_decedent("Ulises Reyes", false);
    decedent.is_illegitimate = true;

    // Victor is the illegitimate parent
    let mut victor = person("f", "Victor", Relationship::LegitimateParent);
    victor.line = Some(LineOfDescent::Paternal);

    // Wendy is Victor's legitimate child (half-sibling of decedent)
    let mut wendy = person("sib1", "Wendy", Relationship::Sibling);
    wendy.degree = 2;

    // Xavier is Victor's illegitimate child (half-sibling of decedent)
    let mut xavier = person("sib2", "Xavier", Relationship::Sibling);
    xavier.degree = 2;

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(8_000_000),
        decedent,
        family_tree: vec![victor, wendy, xavier],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);

    // spec 14.2 writes "I-ID", which is not a ScenarioCode variant (types.rs declares T1-T15 and I1-I15 only). I5 is the measured value and is pinned here as a characterization. Art. 992's reach into the collateral line is the recorded question LAWYER-DECISION: LAWYER-04, which blocks LAW-07 in phase 14; when that answer arrives this expected value is the one to revisit.
    assert_vector_shape(&output, ScenarioCode::I5, SuccessionType::Intestate, 1, "TV-20");
    check_scenario_consistency(&output, ScenarioCode::I5);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "f"), 800000000, "TV-20 f");

    // Victor (parent) gets everything, siblings blocked
    assert_total_pesos(find_share(&output, "f"), 8_000_000, "Victor");
}

// ══════════════════════════════════════════════════════════════════════
// TV-21: T1 -- Fideicommissary (Art. 863 + Art. 872 partial validity)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv21_fideicommissary() {
    let mut lc1 = person("lc1", "Zara", Relationship::LegitimateChild);
    lc1.children = vec!["gc1".into()];

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(10_000_000),
        decedent: default_decedent("Yolanda Cruz", false),
        family_tree: vec![
            lc1,
            person("lc2", "Adam", Relationship::LegitimateChild),
            grandchild("gc1", "Bella", "lc1"),
        ],
        will: Some(simple_will(
            vec![
                institution("i1", heir_ref("lc1", "Zara"), ShareSpec::EqualWithOthers),
                institution("i2", heir_ref("lc2", "Adam"), ShareSpec::EqualWithOthers),
            ],
            vec![],
            vec![],
        )),
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::T1, SuccessionType::Mixed, 2, "TV-21");
    check_scenario_consistency(&output, ScenarioCode::T1);
    // characterization: locks current behaviour so any change is visible in a diff.
    assert_total_centavos(find_share(&output, "lc1"), 500000000, "TV-21 lc1");
    assert_total_centavos(find_share(&output, "lc2"), 500000000, "TV-21 lc2");

    // Zara: P5M, Adam: P5M (Bella has expectancy only, P0 now)
    assert_total_pesos(find_share(&output, "lc1"), 5_000_000, "Zara");
    assert_total_pesos(find_share(&output, "lc2"), 5_000_000, "Adam");
}

// ══════════════════════════════════════════════════════════════════════
// TV-22: I1 -- Representation collation (Art. 1064)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv22_representation_collation() {
    let mut lc2 = person("lc2", "Elena", Relationship::LegitimateChild);
    lc2.is_alive_at_succession = false;
    lc2.children = vec!["gc1".into(), "gc2".into()];

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(9_000_000),
        decedent: default_decedent("Carmen Aquino", false),
        family_tree: vec![
            person("lc1", "David", Relationship::LegitimateChild),
            lc2,
            grandchild("gc1", "Faye", "lc2"),
            grandchild("gc2", "Gabriel", "lc2"),
        ],
        will: None,
        donations: vec![simple_donation("d1", "lc2", 3_000_000)],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::I1, SuccessionType::Intestate, 4, "TV-22");
    check_scenario_consistency(&output, ScenarioCode::I1);
    assert_total_centavos(find_share(&output, "lc1"), 600000000, "TV-22 lc1");
    assert_total_centavos(find_share(&output, "lc2"), 300000000, "TV-22 lc2");
    assert_total_centavos(find_share(&output, "gc1"), 300000000, "TV-22 gc1");
    assert_total_centavos(find_share(&output, "gc2"), 300000000, "TV-22 gc2");

    // Invariant 9: from_estate_sum = P9M (net estate)
    let from_estate_sum: BigInt = output
        .per_heir_shares
        .iter()
        .map(|s| s.net_from_estate.centavos.clone())
        .fold(BigInt::zero(), |a, b| a + b);
    assert_eq!(
        from_estate_sum,
        pesos(9_000_000),
        "Invariant 9: from_estate sum = P9M"
    );

    // David: P6M from estate (entitlement P6M, no donation)
    assert_net_from_estate_pesos(find_share(&output, "lc1"), 6_000_000, "David");

    // Grandchildren: each P1.5M from estate
    // (line entitlement P6M - P3M donation = P3M from estate, split 2 ways)
    let gc1 = find_share(&output, "gc1");
    let gc2 = find_share(&output, "gc2");
    assert_net_from_estate_pesos(gc1, 1_500_000, "Faye");
    assert_net_from_estate_pesos(gc2, 1_500_000, "Gabriel");
}

// ══════════════════════════════════════════════════════════════════════
// TV-23: I5 -- Ascendant-only (parents equal shares)
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_tv23_ascendant_only() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(8_000_000),
        decedent: default_decedent("Hannah Villanueva", false),
        family_tree: vec![
            parent("f", "Ismael", LineOfDescent::Paternal),
            parent("m", "Josefa", LineOfDescent::Maternal),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert_eq!(output.succession_type, SuccessionType::Intestate);
    check_sum_invariant(&output, &input.net_distributable_estate);

    assert_vector_shape(&output, ScenarioCode::I5, SuccessionType::Intestate, 2, "TV-23");
    check_scenario_consistency(&output, ScenarioCode::I5);
    assert_total_centavos(find_share(&output, "f"), 400000000, "TV-23 f");
    assert_total_centavos(find_share(&output, "m"), 400000000, "TV-23 m");

    // Arts. 985-987: parents equal shares
    assert_total_pesos(find_share(&output, "f"), 4_000_000, "Ismael");
    assert_total_pesos(find_share(&output, "m"), 4_000_000, "Josefa");
}

// ══════════════════════════════════════════════════════════════════════
// LAW-01: I5 -- Grandparents inherit under Regime B (Arts. 985-987)
//
// Closes the `.planning/research/LEGAL-CONFORMANCE.md` §2a ascendant-order row.
//
// Art. 987 ¶1: "In default of the father and mother, the ascendants nearest in
// degree shall inherit." Art. 987 ¶2: "should they be of different lines but of
// equal degree, one-half shall go to the paternal and the other half to the
// maternal ascendants. In each line the division shall be made per capita."
//
// 1200000000 centavos → 600000000 to the paternal line, split per capita
// between gp1 and gp2 at 300000000 each; 600000000 to the sole maternal
// grandparent gp3.
//
// BEFORE (07-RESEARCH.md §1.1, measured 2026-07-31): scenario I15 with a single
// STATE row of 1200000000 — the estate escheated while three grandparents lived.
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_law01_grandparents_inherit_under_regime_b() {
    let mut gp1 = person("gp1", "Lolo Paterno", Relationship::LegitimateAscendant);
    gp1.line = Some(LineOfDescent::Paternal);
    let mut gp2 = person("gp2", "Lola Paterna", Relationship::LegitimateAscendant);
    gp2.line = Some(LineOfDescent::Paternal);
    let mut gp3 = person("gp3", "Lola Materna", Relationship::LegitimateAscendant);
    gp3.line = Some(LineOfDescent::Maternal);

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(12_000_000),
        decedent: default_decedent("Karla Mendoza", false),
        family_tree: vec![gp1, gp2, gp3],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);
    assert_vector_shape(&output, ScenarioCode::I5, SuccessionType::Intestate, 3, "LAW-01");
    check_scenario_consistency(&output, ScenarioCode::I5);

    assert_total_centavos(find_share(&output, "gp1"), 300000000, "LAW-01 gp1");
    assert_total_centavos(find_share(&output, "gp2"), 300000000, "LAW-01 gp2");
    assert_total_centavos(find_share(&output, "gp3"), 600000000, "LAW-01 gp3");

    assert!(
        output.per_heir_shares.iter().all(|s| s.heir_id != "STATE"),
        "LAW-01: the estate must not escheat while ascendants survive"
    );
}

// ══════════════════════════════════════════════════════════════════════
// LAW-04: I5 -- No representation in the ascending line (Art. 972 ¶1)
//
// Closes the `.planning/research/LEGAL-CONFORMANCE.md` §2a representation row.
//
// Art. 972 ¶1: "The right of representation takes place in the direct
// descending line, but never in the ascending." The predeceased father is
// therefore not represented by his own children, who are the decedent's
// siblings. Art. 986 ¶2 gives the whole estate to the sole surviving parent,
// and Art. 985 excludes the collaterals entirely while an ascendant survives.
//
// BEFORE (07-RESEARCH.md §1.4, measured 2026-07-31): fa=6000000000 and
// mo=6000000000 — the dead father's half was credited through his sibling
// children — against a sibling-free control of fa=0 and mo=12000000000.
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_law04_no_representation_in_the_ascending_line() {
    let mut fa = parent("fa", "Ignacio", LineOfDescent::Paternal);
    fa.is_alive_at_succession = false;
    fa.children = vec!["sib1".into()];
    let mo = parent("mo", "Modesta", LineOfDescent::Maternal);
    let mut sib1 = person("sib1", "Nestor", Relationship::Sibling);
    sib1.blood_type = Some(BloodType::Full);

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(12_000_000),
        decedent: default_decedent("Olivia Ramos", false),
        family_tree: vec![fa, mo, sib1],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);
    // Exactly one row: the surviving mother. The predeceased father is credited
    // nothing and the sibling is not an heir at all.
    assert_vector_shape(&output, ScenarioCode::I5, SuccessionType::Intestate, 1, "LAW-04");
    check_scenario_consistency(&output, ScenarioCode::I5);

    assert_total_centavos(find_share(&output, "mo"), 1200000000, "LAW-04 mo");
    assert!(
        output
            .per_heir_shares
            .iter()
            .find(|s| s.heir_id == "fa")
            .map_or(true, |s| s.total.centavos == BigInt::zero()),
        "LAW-04: a predeceased ascendant is credited nothing"
    );
    assert!(
        output.per_heir_shares.iter().all(|s| s.heir_id != "sib1"),
        "LAW-04: a collateral takes nothing while an ascendant survives"
    );
}

// ══════════════════════════════════════════════════════════════════════
// LAW-02: I13 -- Collateral representation conserves the estate
//
// Closes the `.planning/research/LEGAL-CONFORMANCE.md` §2a collateral row.
//
// Art. 1005: surviving brothers and sisters inherit per capita and the children
// of brothers and sisters per stirpes. Art. 1006: the full blood take double the
// portion of the half blood. Art. 1008 carries that ratio to the
// representatives.
//
// One full-blood line at 2 units plus one half-blood line at 1 unit is 3 units
// of 200000000 centavos: sib1 takes 400000000, and n1 and n2 split their line's
// 200000000 into 100000000 each.
//
// BEFORE (07-RESEARCH.md §1.2, measured 2026-07-31): five rows with n1 and n2
// each appearing twice, a per-heir sum of 480000000 against a 600000000 estate,
// and a CLI exit code of 2.
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_law02_collateral_representation_conserves_the_estate() {
    let mut sib1 = person("sib1", "Paulo", Relationship::Sibling);
    sib1.blood_type = Some(BloodType::Full);

    let mut sib2 = person("sib2", "Quirino", Relationship::Sibling);
    sib2.is_alive_at_succession = false;
    sib2.blood_type = Some(BloodType::Half);
    sib2.children = vec!["n1".into(), "n2".into()];

    let mut n1 = person("n1", "Rosa", Relationship::NephewNiece);
    n1.blood_type = Some(BloodType::Half);
    let mut n2 = person("n2", "Sixto", Relationship::NephewNiece);
    n2.blood_type = Some(BloodType::Half);

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(6_000_000),
        decedent: default_decedent("Teodora Cruz", false),
        family_tree: vec![sib1, sib2, n1, n2],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);
    assert_vector_shape(&output, ScenarioCode::I13, SuccessionType::Intestate, 3, "LAW-02");
    check_scenario_consistency(&output, ScenarioCode::I13);

    assert_total_centavos(find_share(&output, "sib1"), 400000000, "LAW-02 sib1");
    assert_total_centavos(find_share(&output, "n1"), 100000000, "LAW-02 n1");
    assert_total_centavos(find_share(&output, "n2"), 100000000, "LAW-02 n2");

    let mut ids: Vec<&str> = output
        .per_heir_shares
        .iter()
        .map(|s| s.heir_id.as_str())
        .collect();
    let before = ids.len();
    ids.sort();
    ids.dedup();
    assert_eq!(ids.len(), before, "LAW-02: duplicate heir_id in per_heir_shares");

    assert!(
        output.per_heir_shares.iter().all(|s| s.heir_id != "sib2"),
        "LAW-02: the predeceased sibling receives no row"
    );
}

// ══════════════════════════════════════════════════════════════════════
// LAW-03: I1 -- Total repudiation promotes the following degree (Art. 969)
//
// Closes the `.planning/research/LEGAL-CONFORMANCE.md` §2a repudiation row.
//
// Art. 969: when the relatives nearest in degree repudiate, "those of the
// following degree shall inherit in their own right and cannot represent the
// person or persons repudiating the inheritance." Art. 962 ¶1 divides among
// relatives of the same degree "in equal shares", and Art. 977 bars the
// grandchildren from representing the repudiators.
//
// 12000000000 centavos divides three ways into 4000000000 each. The family is
// deliberately symmetric — one grandchild per repudiating child — so an
// own-right per-capita division and a per-stirpes division give identical
// amounts, and the vector proves the promotion without pinning a division this
// plan has not derived from a quoted article.
//
// BEFORE (07-RESEARCH.md §1.3, measured 2026-07-31): scenario I15 with a single
// STATE row of 12000000000 and the three grandchildren absent entirely.
// ══════════════════════════════════════════════════════════════════════

#[test]
fn test_law03_total_repudiation_promotes_the_following_degree() {
    let mut family: Vec<Person> = Vec::new();
    for (cid, gid, cname, gname) in [
        ("lc1", "gc1", "Ubaldo", "Ximena"),
        ("lc2", "gc2", "Vicente", "Yolanda"),
        ("lc3", "gc3", "Wilfredo", "Zenaida"),
    ] {
        let mut child = person(cid, cname, Relationship::LegitimateChild);
        child.has_renounced = true;
        child.children = vec![gid.into()];
        family.push(child);

        let mut gc = person(gid, gname, Relationship::LegitimateChild);
        gc.degree = 2;
        family.push(gc);
    }

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(120_000_000),
        decedent: default_decedent("Amelia Bautista", false),
        family_tree: family,
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    check_sum_invariant(&output, &input.net_distributable_estate);
    assert_vector_shape(&output, ScenarioCode::I1, SuccessionType::Intestate, 6, "LAW-03");
    check_scenario_consistency(&output, ScenarioCode::I1);

    assert_total_centavos(find_share(&output, "gc1"), 4000000000, "LAW-03 gc1");
    assert_total_centavos(find_share(&output, "gc2"), 4000000000, "LAW-03 gc2");
    assert_total_centavos(find_share(&output, "gc3"), 4000000000, "LAW-03 gc3");
    assert_total_centavos(find_share(&output, "lc1"), 0, "LAW-03 lc1");

    assert!(
        output.per_heir_shares.iter().all(|s| s.heir_id != "STATE"),
        "LAW-03: the estate must not escheat while grandchildren survive"
    );
}

// ══════════════════════════════════════════════════════════════════════
// Cross-cutting invariant tests
// ══════════════════════════════════════════════════════════════════════

/// Run all test vectors and verify Invariant 1 (sum) holds for each.
#[test]
fn test_invariant1_sum_all_vectors() {
    let vectors = build_all_simple_vectors();
    for (name, input) in &vectors {
        let output = run_pipeline(input);
        let sum: BigInt = output
            .per_heir_shares
            .iter()
            .map(|s| s.net_from_estate.centavos.clone())
            .fold(BigInt::zero(), |a, b| a + b);
        assert_eq!(
            sum, input.net_distributable_estate.centavos,
            "Invariant 1 failed for {}: sum={} != estate={}",
            name, sum, input.net_distributable_estate.centavos
        );
    }
}

/// Invariant 2: Compulsory heirs receive >= their legitime (except valid disinheritance).
/// We verify this for intestate vectors where legitime floor always applies.
#[test]
fn test_invariant2_legitime_floor() {
    // For intestate cases, compulsory heirs always receive >= legitime.
    // Run a sample of intestate vectors and check.
    let vectors = vec![
        ("TV-02", build_tv02()),
        ("TV-03", build_tv03()),
        ("TV-05", build_tv05()),
    ];

    for (name, input) in &vectors {
        let output = run_pipeline(input);
        // For each compulsory heir, total >= 0 (basic sanity; full legitime
        // check requires comparing against computed legitime fractions,
        // which we verify in the individual test functions above).
        for share in &output.per_heir_shares {
            assert!(
                share.total.centavos >= BigInt::zero(),
                "Invariant 2 ({} heir {}): negative share",
                name,
                share.heir_id
            );
        }
    }
}

/// Invariant 7: Preterition -> ALL institutions annulled.
#[test]
fn test_invariant7_preterition_annuls_all() {
    let input = build_tv07();
    let output = run_pipeline(&input);

    // In preterition case, succession type should be IntestateByPreterition
    assert!(
        output.succession_type == SuccessionType::IntestateByPreterition
            || output.succession_type == SuccessionType::Intestate,
        "Invariant 7: Preterition should produce intestate succession"
    );

    // All 4 heirs should get equal shares (institutions annulled)
    let shares: Vec<&BigInt> = output
        .per_heir_shares
        .iter()
        .filter(|s| s.total.centavos > BigInt::zero())
        .map(|s| &s.total.centavos)
        .collect();
    assert_eq!(shares.len(), 4, "Invariant 7: 4 heirs with shares");
    // All should be equal
    for s in &shares[1..] {
        assert_eq!(
            *s, shares[0],
            "Invariant 7: all heirs equal after preterition"
        );
    }
}

/// Invariant 8: Valid disinheritance -> heir gets 0 but descendants may represent.
#[test]
fn test_invariant8_disinheritance_zero() {
    let input = build_tv08();
    let output = run_pipeline(&input);

    // Karen (disinherited) should get 0
    let karen = find_share(&output, "lc3");
    assert_eq!(
        karen.total.centavos,
        BigInt::zero(),
        "Invariant 8: disinherited heir gets 0"
    );

    // But grandchildren should represent (get > 0)
    let gc1 = find_share(&output, "gc1");
    let gc2 = find_share(&output, "gc2");
    assert!(
        gc1.total.centavos > BigInt::zero(),
        "Invariant 8: representative gc1 gets > 0"
    );
    assert!(
        gc2.total.centavos > BigInt::zero(),
        "Invariant 8: representative gc2 gets > 0"
    );
}

/// Invariant 9: estate_base = net_estate + collatable_donations; from_estate_sum = net_estate.
#[test]
fn test_invariant9_collation() {
    // TV-11 has collation
    let input = build_tv11();
    let output = run_pipeline(&input);

    let from_estate_sum: BigInt = output
        .per_heir_shares
        .iter()
        .map(|s| s.net_from_estate.centavos.clone())
        .fold(BigInt::zero(), |a, b| a + b);
    assert_eq!(
        from_estate_sum, input.net_distributable_estate.centavos,
        "Invariant 9: from_estate_sum = net_estate"
    );

    // TV-22 also has collation (representation collation)
    let input22 = build_tv22();
    let output22 = run_pipeline(&input22);

    let from_estate_sum22: BigInt = output22
        .per_heir_shares
        .iter()
        .map(|s| s.net_from_estate.centavos.clone())
        .fold(BigInt::zero(), |a, b| a + b);
    assert_eq!(
        from_estate_sum22, input22.net_distributable_estate.centavos,
        "Invariant 9: from_estate_sum = net_estate (TV-22)"
    );
}

// ══════════════════════════════════════════════════════════════════════
// Builder functions for reuse in invariant tests
// ══════════════════════════════════════════════════════════════════════

fn build_tv02() -> EngineInput {
    EngineInput {
        net_distributable_estate: Money::from_pesos(12_000_000),
        decedent: default_decedent("Pedro Santos", true),
        family_tree: vec![
            person("lc1", "Ana", Relationship::LegitimateChild),
            person("lc2", "Ben", Relationship::LegitimateChild),
            person("lc3", "Carlos", Relationship::LegitimateChild),
            person("sp", "Rosa", Relationship::SurvivingSpouse),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    }
}

fn build_tv03() -> EngineInput {
    EngineInput {
        net_distributable_estate: Money::from_pesos(10_000_000),
        decedent: default_decedent("Diego Reyes", false),
        family_tree: vec![
            person("lc1", "Elena", Relationship::LegitimateChild),
            person("lc2", "Felix", Relationship::LegitimateChild),
            ic_person("ic1", "Gloria", FiliationProof::BirthCertificate),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    }
}

fn build_tv05() -> EngineInput {
    EngineInput {
        net_distributable_estate: Money::from_pesos(10_000_000),
        decedent: default_decedent("Roberto Garcia", true),
        family_tree: vec![
            person("sp", "Teresa", Relationship::SurvivingSpouse),
            parent("f", "Manuel", LineOfDescent::Paternal),
            parent("m", "Dolores", LineOfDescent::Maternal),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    }
}

fn build_tv07() -> EngineInput {
    EngineInput {
        net_distributable_estate: Money::from_pesos(12_000_000),
        decedent: default_decedent("Alberto Ramos", true),
        family_tree: vec![
            person("lc1", "Bea", Relationship::LegitimateChild),
            person("lc2", "Cris", Relationship::LegitimateChild),
            person("lc3", "Dina", Relationship::LegitimateChild),
            person("sp", "Flora", Relationship::SurvivingSpouse),
        ],
        will: Some(simple_will(
            vec![
                institution(
                    "i1",
                    heir_ref("lc1", "Bea"),
                    ShareSpec::Fraction(frac(1, 2)),
                ),
                institution(
                    "i2",
                    heir_ref("lc2", "Cris"),
                    ShareSpec::Fraction(frac(1, 2)),
                ),
            ],
            vec![],
            vec![],
        )),
        donations: vec![],
        config: default_config(),
    }
}

fn build_tv08() -> EngineInput {
    let mut lc3 = person("lc3", "Karen", Relationship::LegitimateChild);
    lc3.children = vec!["gc1".into(), "gc2".into()];

    EngineInput {
        net_distributable_estate: Money::from_pesos(16_000_000),
        decedent: default_decedent("Hector Villanueva", true),
        family_tree: vec![
            person("lc1", "Irene", Relationship::LegitimateChild),
            person("lc2", "Jorge", Relationship::LegitimateChild),
            lc3,
            grandchild("gc1", "Luis", "lc3"),
            grandchild("gc2", "Marta", "lc3"),
            person("sp", "Nora", Relationship::SurvivingSpouse),
        ],
        will: Some(simple_will(
            vec![
                institution("i1", heir_ref("lc1", "Irene"), ShareSpec::EqualWithOthers),
                institution("i2", heir_ref("lc2", "Jorge"), ShareSpec::EqualWithOthers),
                institution("i3", stranger_ref("Friend F"), ShareSpec::Residuary),
            ],
            vec![],
            vec![Disinheritance {
                heir_reference: heir_ref("lc3", "Karen"),
                cause_code: DisinheritanceCause::ChildMaltreatment,
                cause_specified_in_will: true,
                cause_proven: true,
                reconciliation_occurred: false,
            }],
        )),
        donations: vec![],
        config: default_config(),
    }
}

fn build_tv11() -> EngineInput {
    EngineInput {
        net_distributable_estate: Money::from_pesos(18_000_000),
        decedent: default_decedent("Oscar Navarro", true),
        family_tree: vec![
            person("lc1", "Pilar", Relationship::LegitimateChild),
            person("lc2", "Ramon", Relationship::LegitimateChild),
            ic_person("ic1", "Sofia", FiliationProof::FinalJudgment),
            person("sp", "Tina", Relationship::SurvivingSpouse),
        ],
        will: Some(simple_will(
            vec![
                institution("i1", heir_ref("lc1", "Pilar"), ShareSpec::EqualWithOthers),
                institution("i2", heir_ref("lc2", "Ramon"), ShareSpec::EqualWithOthers),
            ],
            vec![Legacy {
                id: "leg1".into(),
                legatee: stranger_ref("Friend G"),
                property: LegacySpec::FixedAmount(Money::from_pesos(3_000_000)),
                conditions: vec![],
                substitutes: vec![],
                is_preferred: false,
            }],
            vec![],
        )),
        donations: vec![simple_donation("d1", "lc1", 2_000_000)],
        config: default_config(),
    }
}

fn build_tv22() -> EngineInput {
    let mut lc2 = person("lc2", "Elena", Relationship::LegitimateChild);
    lc2.is_alive_at_succession = false;
    lc2.children = vec!["gc1".into(), "gc2".into()];

    EngineInput {
        net_distributable_estate: Money::from_pesos(9_000_000),
        decedent: default_decedent("Carmen Aquino", false),
        family_tree: vec![
            person("lc1", "David", Relationship::LegitimateChild),
            lc2,
            grandchild("gc1", "Faye", "lc2"),
            grandchild("gc2", "Gabriel", "lc2"),
        ],
        will: None,
        donations: vec![simple_donation("d1", "lc2", 3_000_000)],
        config: default_config(),
    }
}

/// Build a collection of the simpler test vectors for cross-cutting invariant checks.
fn build_all_simple_vectors() -> Vec<(&'static str, EngineInput)> {
    vec![
        ("TV-01", EngineInput {
            net_distributable_estate: Money::from_pesos(5_000_000),
            decedent: default_decedent("Juan Cruz", false),
            family_tree: vec![person("lc1", "Maria Cruz", Relationship::LegitimateChild)],
            will: None,
            donations: vec![],
            config: default_config(),
        }),
        ("TV-02", build_tv02()),
        ("TV-03", build_tv03()),
        ("TV-04", EngineInput {
            net_distributable_estate: Money::from_pesos(8_000_000),
            decedent: default_decedent("Mario Lim", true),
            family_tree: vec![person("sp", "Lucia", Relationship::SurvivingSpouse)],
            will: None,
            donations: vec![],
            config: default_config(),
        }),
        ("TV-05", build_tv05()),
        ("TV-17", EngineInput {
            net_distributable_estate: Money::from_pesos(6_000_000),
            decedent: default_decedent("Kevin Ramos", false),
            family_tree: vec![
                ic_person("ic1", "Lara", FiliationProof::BirthCertificate),
                ic_person("ic2", "Marco", FiliationProof::FinalJudgment),
                ic_person("ic3", "Nina", FiliationProof::PublicDocumentAdmission),
            ],
            will: None,
            donations: vec![],
            config: default_config(),
        }),
        ("TV-23", EngineInput {
            net_distributable_estate: Money::from_pesos(8_000_000),
            decedent: default_decedent("Hannah Villanueva", false),
            family_tree: vec![
                parent("f", "Ismael", LineOfDescent::Paternal),
                parent("m", "Josefa", LineOfDescent::Maternal),
            ],
            will: None,
            donations: vec![],
            config: default_config(),
        }),
    ]
}

// ══════════════════════════════════════════════════════════════════════
// Narrative smoke tests
// ══════════════════════════════════════════════════════════════════════

/// Every heir in the output should have a non-empty narrative.
#[test]
fn test_all_heirs_have_narratives() {
    let vectors = build_all_simple_vectors();
    for (name, input) in &vectors {
        let output = run_pipeline(input);
        for share in &output.per_heir_shares {
            if share.total.centavos > BigInt::zero() {
                let narrative = output
                    .narratives
                    .iter()
                    .find(|n| n.heir_id == share.heir_id);
                assert!(
                    narrative.is_some(),
                    "{}: heir {} has share but no narrative",
                    name,
                    share.heir_id
                );
                assert!(
                    !narrative.unwrap().text.is_empty(),
                    "{}: heir {} has empty narrative text",
                    name,
                    share.heir_id
                );
            }
        }
    }
}

/// Computation log should record steps.
#[test]
fn test_computation_log_populated() {
    let input = build_tv02();
    let output = run_pipeline(&input);
    assert!(
        !output.computation_log.steps.is_empty(),
        "Computation log should have step entries"
    );
}

// ══════════════════════════════════════════════════════════════════════
// Observability: warnings and computation log reach EngineOutput (OBS-01, OBS-09)
// ══════════════════════════════════════════════════════════════════════

/// Step 6 builds a `preterition` ManualFlag at step6_validation.rs; before this
/// phase the pipeline discarded it and `warnings` was always empty. Same fixture
/// as `test_tv07_preterition_annuls_will`.
#[test]
fn test_warnings_reach_output_on_preterition() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(12_000_000),
        decedent: default_decedent("Alberto Ramos", true),
        family_tree: vec![
            person("lc1", "Bea", Relationship::LegitimateChild),
            person("lc2", "Cris", Relationship::LegitimateChild),
            person("lc3", "Dina", Relationship::LegitimateChild),
            person("sp", "Flora", Relationship::SurvivingSpouse),
        ],
        will: Some(simple_will(
            vec![
                institution(
                    "i1",
                    heir_ref("lc1", "Bea"),
                    ShareSpec::Fraction(frac(1, 2)),
                ),
                institution(
                    "i2",
                    heir_ref("lc2", "Cris"),
                    ShareSpec::Fraction(frac(1, 2)),
                ),
                // LC3 (Dina) totally omitted — triggers preterition
            ],
            vec![],
            vec![],
        )),
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert!(
        !output.warnings.is_empty(),
        "preterition case must emit at least one warning, got none"
    );
    assert!(
        output.warnings.iter().any(|w| w.category == "preterition"),
        "expected a warning with category \"preterition\", got {:?}",
        output
            .warnings
            .iter()
            .map(|w| w.category.clone())
            .collect::<Vec<_>>()
    );
}

/// A run with no restart executes Steps 1-9 once and Step 10 once: exactly ten
/// log entries, first numbered 1 and last numbered 10. Same fixture as
/// `test_tv01_single_lc_entire_estate`.
#[test]
fn test_computation_log_has_ten_steps() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(5_000_000),
        decedent: default_decedent("Juan Cruz", false),
        family_tree: vec![person("lc1", "Maria Cruz", Relationship::LegitimateChild)],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert_eq!(output.computation_log.total_restarts, 0);
    assert_eq!(output.computation_log.steps.len(), 10);
    assert_eq!(output.computation_log.steps[0].step_number, 1);
    assert_eq!(output.computation_log.steps[9].step_number, 10);
}

/// A run with one restart executes Steps 1-9, then Steps 2-9 again, then Step 10:
/// 9 + 8 + 1 = 18 entries. Same fixture as `test_tv19_total_renunciation_restart`.
#[test]
fn test_computation_log_has_eighteen_steps_after_restart() {
    let mut lc1 = person("lc1", "Queenie", Relationship::LegitimateChild);
    lc1.has_renounced = true;
    let mut lc2 = person("lc2", "Rafael", Relationship::LegitimateChild);
    lc2.has_renounced = true;

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(12_000_000),
        decedent: default_decedent("Pablo Dela Rosa", false),
        family_tree: vec![
            lc1,
            lc2,
            parent("f", "Santiago", LineOfDescent::Paternal),
            parent("m", "Teresa", LineOfDescent::Maternal),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert_eq!(output.computation_log.total_restarts, 1);
    assert_eq!(output.computation_log.steps.len(), 18);
    assert_eq!(output.computation_log.steps[17].step_number, 10);
}

/// A spec §13.1 flag detected from the input survives the whole pipeline and lands
/// in EngineOutput, which a unit test on flags.rs alone cannot show.
#[test]
fn test_spec_flag_reaches_output_end_to_end() {
    let mut decedent = default_decedent("Alberto Ramos", true);
    decedent.marriage_solemnized_in_articulo_mortis = true;

    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(12_000_000),
        decedent,
        family_tree: vec![
            person("lc1", "Bea", Relationship::LegitimateChild),
            person("sp", "Flora", Relationship::SurvivingSpouse),
        ],
        will: None,
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert!(
        output
            .warnings
            .iter()
            .any(|w| w.category == "ARTICULO_MORTIS"),
        "expected an ARTICULO_MORTIS spec flag, got {:?}",
        output
            .warnings
            .iter()
            .map(|w| w.category.clone())
            .collect::<Vec<_>>()
    );
}

/// The ten spec codes and the six internal category strings must coexist. This is
/// what stops a later refactor from replacing one set with the other.
#[test]
fn test_pipeline_warnings_still_carry_internal_categories() {
    let input = EngineInput {
        net_distributable_estate: Money::from_pesos(12_000_000),
        decedent: default_decedent("Alberto Ramos", true),
        family_tree: vec![
            person("lc1", "Bea", Relationship::LegitimateChild),
            person("lc2", "Cris", Relationship::LegitimateChild),
            person("lc3", "Dina", Relationship::LegitimateChild),
            person("sp", "Flora", Relationship::SurvivingSpouse),
        ],
        will: Some(simple_will(
            vec![
                institution(
                    "i1",
                    heir_ref("lc1", "Bea"),
                    ShareSpec::Fraction(frac(1, 2)),
                ),
                institution(
                    "i2",
                    heir_ref("lc2", "Cris"),
                    ShareSpec::Fraction(frac(1, 2)),
                ),
                // LC3 (Dina) totally omitted — triggers preterition
            ],
            vec![],
            vec![],
        )),
        donations: vec![],
        config: default_config(),
    };

    let output = run_pipeline(&input);

    assert!(
        output.warnings.iter().any(|w| w.category == "preterition"),
        "internal category \"preterition\" must still reach output, got {:?}",
        output
            .warnings
            .iter()
            .map(|w| w.category.clone())
            .collect::<Vec<_>>()
    );
}
