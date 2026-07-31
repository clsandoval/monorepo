//! Full pipeline orchestrator.
//!
//! Runs Steps 1-10 in sequence, handling restarts when needed
//! (e.g., total renunciation triggers scenario re-evaluation).

use crate::fraction::money_to_frac;
use crate::step1_classify::{step1_classify, Step1Input};
use crate::step2_lines::{step2_build_lines, Step2Input};
use crate::step3_scenario::{step3_determine_scenario, Step3Input};
use crate::step4_estate_base::{step4_compute_estate_base, Step4Input};
use crate::step5_legitimes::{step5_compute_legitimes, Step5Input};
use crate::step6_validation::{step6_validate_will, Step6Input};
use crate::step7_distribute::{step7_distribute, Step7Input};
use crate::step8_collation::{step8_collation_adjustment, Step8Input};
use crate::step9_vacancy::{step9_resolve_vacancies, Step9Input, Step9Output};
use crate::step10_finalize::{step10_finalize, NarrativeConfig, Step10Input};
use crate::types::*;

/// Run the full pipeline (Steps 1-10) on an EngineInput, returning EngineOutput.
pub fn run_pipeline(input: &EngineInput) -> EngineOutput {
    let net_estate_frac = money_to_frac(&input.net_distributable_estate.centavos);

    // Manual-review flags built by Steps 1-9. Every step owns a `warnings` field;
    // this accumulator is what carries them to Step 10 and out to EngineOutput.
    let mut pipeline_warnings: Vec<ManualFlag> = Vec::new();
    // One entry per step that actually ran, in run order. Step 10 appends its own.
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
        description: "Mapped each person in the family tree to an effective heir category"
            .to_string(),
    });

    // Step 2: Build lines
    let step2 = step2_build_lines(&Step2Input {
        heirs: step1.heirs.clone(),
    });
    pipeline_warnings.extend(step2.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 2,
        step_name: "Build Lines".to_string(),
        description: "Grouped classified heirs into lines of descent and counted each category"
            .to_string(),
    });

    // Step 3: Determine scenario
    let has_siblings_or_nephews = input.family_tree.iter().any(|p| {
        matches!(
            p.relationship_to_decedent,
            Relationship::Sibling | Relationship::NephewNiece
        ) && p.is_alive_at_succession
    });
    let has_other_collaterals = input.family_tree.iter().any(|p| {
        matches!(p.relationship_to_decedent, Relationship::OtherCollateral)
            && p.is_alive_at_succession
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
        description: "Selected the scenario code and succession type from the line counts"
            .to_string(),
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
        description: "Added collatable donations to the net estate to form the estate base"
            .to_string(),
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
        description:
            "Allocated the estate base across heirs as legitime, free portion and intestate shares"
                .to_string(),
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
        description: "Imputed each heir's collatable donations against that heir's share"
            .to_string(),
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

    // Handle restart if needed (e.g., total renunciation)
    if step9.requires_restart {
        return run_pipeline_with_restart(input, &step9, pipeline_warnings, step_logs);
    }

    // Step 10: Finalize + narrate
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
        scenario_code: step3.scenario_code,
        narrative_config: NarrativeConfig::default(),
        total_restarts: 0,
        warnings: pipeline_warnings,
        step_logs,
    })
}

/// Handle pipeline restart (e.g., total renunciation -> scenario re-evaluation).
///
/// `prior_warnings` and `prior_logs` carry everything the first pass accumulated
/// across Steps 1-9; the restart pass re-runs Steps 2-9 and appends to both.
fn run_pipeline_with_restart(
    input: &EngineInput,
    step9: &Step9Output,
    prior_warnings: Vec<ManualFlag>,
    prior_logs: Vec<StepLog>,
) -> EngineOutput {
    let net_estate_frac = money_to_frac(&input.net_distributable_estate.centavos);

    let mut pipeline_warnings: Vec<ManualFlag> = Vec::new();
    pipeline_warnings.extend(prior_warnings);
    let mut step_logs: Vec<StepLog> = prior_logs;

    let heirs_for_restart = step9.heirs.clone();

    let step2 = step2_build_lines(&Step2Input {
        heirs: heirs_for_restart,
    });
    pipeline_warnings.extend(step2.warnings.iter().cloned());
    step_logs.push(StepLog {
        step_number: 2,
        step_name: "Build Lines".to_string(),
        description: "Grouped classified heirs into lines of descent and counted each category"
            .to_string(),
    });

    let has_siblings_or_nephews = input.family_tree.iter().any(|p| {
        matches!(
            p.relationship_to_decedent,
            Relationship::Sibling | Relationship::NephewNiece
        ) && p.is_alive_at_succession
    });
    let has_other_collaterals = input.family_tree.iter().any(|p| {
        matches!(p.relationship_to_decedent, Relationship::OtherCollateral)
            && p.is_alive_at_succession
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
        description: "Selected the scenario code and succession type from the line counts"
            .to_string(),
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
        description: "Added collatable donations to the net estate to form the estate base"
            .to_string(),
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
        description:
            "Allocated the estate base across heirs as legitime, free portion and intestate shares"
                .to_string(),
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
        description: "Imputed each heir's collatable donations against that heir's share"
            .to_string(),
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
