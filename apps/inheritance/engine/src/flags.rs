//! Manual-review flags (Spec §13.1).
//!
//! The spec names ten situations that "require human judgment". This module is
//! the single auditable place where all ten are declared and detected.
//!
//! **A flag decides nothing.** It is the engine saying *a human must decide this*.
//! No detector here computes a share, alters a distribution, excludes an heir or
//! changes a scenario code. Every trigger is a field comparison transcribed from
//! the spec's own table; where the spec's trigger cannot be expressed from data
//! the engine derives, the fact is supplied by the person entering the case via
//! `EngineConfig.manual_review_facts` and is read, never inferred.
//!
//! These ten are a set **disjoint** from the six internal category strings the
//! pipeline steps construct (`unknown_donee`, `preterition`, `disinheritance`,
//! `inofficiousness`, `max_restarts`, `vacancy_unresolved`). Both sets survive and
//! both reach `EngineOutput.warnings`.
//!
//! Spec reference: §13.1 Manual Review Flags.

use std::collections::HashSet;

use crate::types::*;

// ── The ten spec flag codes (§13.1, in the spec table's order) ───────

/// Art. 903 names "parents", not "ascendants".
pub const SPEC_FLAG_GRANDPARENT_OF_ILLEGITIMATE: &str = "GRANDPARENT_OF_ILLEGITIMATE";
/// An illegitimate child renounces while concurring with legitimate children.
pub const SPEC_FLAG_CROSS_CLASS_ACCRETION: &str = "CROSS_CLASS_ACCRETION";
/// Property subject to the Art. 891 reservation.
pub const SPEC_FLAG_RESERVA_TRONCAL: &str = "RESERVA_TRONCAL";
/// Heirs disagree about collatability or value (Art. 1077).
pub const SPEC_FLAG_COLLATION_DISPUTE: &str = "COLLATION_DISPUTE";
/// Pre-2022 adoption raising the RA 11642 Sec. 41 retroactivity question.
pub const SPEC_FLAG_RA_11642_RETROACTIVITY: &str = "RA_11642_RETROACTIVITY";
/// Art. 900 ¶2 conditions detected.
pub const SPEC_FLAG_ARTICULO_MORTIS: &str = "ARTICULO_MORTIS";
/// Compulsory heirs must choose under Art. 911 ¶3.
pub const SPEC_FLAG_USUFRUCT_ANNUITY_OPTION: &str = "USUFRUCT_ANNUITY_OPTION";
/// The same person appears in both the paternal and the maternal line (Art. 890).
pub const SPEC_FLAG_DUAL_LINE_ASCENDANT: &str = "DUAL_LINE_ASCENDANT";
/// The will disinherits a person unborn when it was executed (Arts. 915-923).
pub const SPEC_FLAG_POSTHUMOUS_DISINHERITANCE: &str = "POSTHUMOUS_DISINHERITANCE";
/// The will contains conflicting instructions requiring court resolution.
pub const SPEC_FLAG_CONTRADICTORY_DISPOSITIONS: &str = "CONTRADICTORY_DISPOSITIONS";

/// All ten codes in the spec's table order. The complete set, auditable in one
/// place, and the order in which `detect_spec_flags` emits them.
pub const SPEC_FLAG_CODES: [&str; 10] = [
    SPEC_FLAG_GRANDPARENT_OF_ILLEGITIMATE,
    SPEC_FLAG_CROSS_CLASS_ACCRETION,
    SPEC_FLAG_RESERVA_TRONCAL,
    SPEC_FLAG_COLLATION_DISPUTE,
    SPEC_FLAG_RA_11642_RETROACTIVITY,
    SPEC_FLAG_ARTICULO_MORTIS,
    SPEC_FLAG_USUFRUCT_ANNUITY_OPTION,
    SPEC_FLAG_DUAL_LINE_ASCENDANT,
    SPEC_FLAG_POSTHUMOUS_DISINHERITANCE,
    SPEC_FLAG_CONTRADICTORY_DISPOSITIONS,
];

/// The RA 11642 boundary date. The spec's trigger is worded "Pre-2022 adoption".
/// `Date` is an ISO-8601 `String`, which sorts lexicographically, so this is a
/// plain string comparison and not a date-library dependency.
const RA_11642_BOUNDARY: &str = "2022-01-01";

fn flag(category: &str, description: &str, related_heir_id: Option<HeirId>) -> ManualFlag {
    ManualFlag {
        category: category.to_string(),
        description: description.to_string(),
        related_heir_id,
    }
}

// ── Detectors ───────────────────────────────────────────────────────

/// Detect every §13.1 manual-review situation present in `input`.
///
/// Returns flags in the fixed order of [`SPEC_FLAG_CODES`], so output is
/// deterministic. Reads only `EngineInput`; computes nothing.
pub fn detect_spec_flags(input: &EngineInput) -> Vec<ManualFlag> {
    let mut flags: Vec<ManualFlag> = Vec::new();
    let facts = &input.config.manual_review_facts;

    // 1. GRANDPARENT_OF_ILLEGITIMATE — Art. 903 says "parents", not "ascendants".
    if input.decedent.is_illegitimate {
        if let Some(p) = input.family_tree.iter().find(|p| {
            p.is_alive_at_succession
                && p.relationship_to_decedent == Relationship::LegitimateAscendant
                && p.degree >= 2
        }) {
            flags.push(flag(
                SPEC_FLAG_GRANDPARENT_OF_ILLEGITIMATE,
                "Art. 903 names the parents of an illegitimate decedent, not the ascendants generally. A surviving ascendant beyond the first degree requires review.",
                Some(p.id.clone()),
            ));
        }
    }

    // 2. CROSS_CLASS_ACCRETION — Arts. 1018 vs 968 point in different directions.
    let has_living_legitimate_child = input.family_tree.iter().any(|q| {
        q.is_alive_at_succession
            && matches!(
                q.relationship_to_decedent,
                Relationship::LegitimateChild
                    | Relationship::LegitimatedChild
                    | Relationship::AdoptedChild
            )
    });
    if has_living_legitimate_child {
        if let Some(p) = input.family_tree.iter().find(|p| {
            p.relationship_to_decedent == Relationship::IllegitimateChild && p.has_renounced
        }) {
            flags.push(flag(
                SPEC_FLAG_CROSS_CLASS_ACCRETION,
                "An illegitimate child renounced while concurring with legitimate children. Arts. 1018 and 968 point in different directions on where the vacant portion goes.",
                Some(p.id.clone()),
            ));
        }
    }

    // 3. RESERVA_TRONCAL — an asserted fact; Art. 891 reservation is not modelled.
    if facts.reserva_troncal_property_present {
        flags.push(flag(
            SPEC_FLAG_RESERVA_TRONCAL,
            "The estate includes property stated to have been acquired by gratuitous title from an ascendant, brother or sister. Art. 891 reservation is not modelled by this engine.",
            None,
        ));
    }

    // 4. COLLATION_DISPUTE — an asserted fact; Art. 1077 dual computation.
    if !facts.disputed_donation_ids.is_empty() {
        flags.push(flag(
            SPEC_FLAG_COLLATION_DISPUTE,
            "The parties dispute the collatability or the value of at least one donation. Art. 1077 requires a dual computation that this engine does not produce.",
            None,
        ));
    }

    // 5. RA_11642_RETROACTIVITY — a pre-2022 RA 8552 decree.
    if let Some(p) = input.family_tree.iter().find(|p| {
        p.adoption.as_ref().is_some_and(|a| {
            a.regime == AdoptionRegime::Ra8552 && a.decree_date.as_str() < RA_11642_BOUNDARY
        })
    }) {
        flags.push(flag(
            SPEC_FLAG_RA_11642_RETROACTIVITY,
            "A pre-2022 adoption decree under RA 8552 raises the RA 11642 Sec. 41 retroactivity question. See .planning/LAWYER-AGENDA.md entry LAWYER-08.",
            Some(p.id.clone()),
        ));
    }

    // 6. ARTICULO_MORTIS — Art. 900 ¶2 conditions.
    if input.decedent.marriage_solemnized_in_articulo_mortis {
        flags.push(flag(
            SPEC_FLAG_ARTICULO_MORTIS,
            "The marriage was solemnized in articulo mortis. The Art. 900 paragraph 2 conditions require review.",
            None,
        ));
    }

    // 7. USUFRUCT_ANNUITY_OPTION — an asserted fact; Art. 911 ¶3 conversion.
    if !facts.usufruct_or_annuity_disposition_ids.is_empty() {
        flags.push(flag(
            SPEC_FLAG_USUFRUCT_ANNUITY_OPTION,
            "At least one disposition gives a usufruct or a life annuity. Art. 911 paragraph 3 lets the parties convert it by agreement, which cannot be computed.",
            None,
        ));
    }

    // 8. DUAL_LINE_ASCENDANT — an asserted fact; Art. 890 division by line.
    if let Some(id) = facts.dual_line_ascendant_ids.first() {
        flags.push(flag(
            SPEC_FLAG_DUAL_LINE_ASCENDANT,
            "A person is stated to appear in both the paternal and the maternal ascending line. Art. 890 division by line requires review.",
            Some(id.clone()),
        ));
    }

    // 9. POSTHUMOUS_DISINHERITANCE — an asserted fact; Arts. 915-923.
    if let Some(id) = facts.unborn_disinherited_ids.first() {
        flags.push(flag(
            SPEC_FLAG_POSTHUMOUS_DISINHERITANCE,
            "The will disinherits a person stated to have been unborn when it was executed. Arts. 915 to 923 require review.",
            Some(id.clone()),
        ));
    }

    // 10. CONTRADICTORY_DISPOSITIONS — repeated disposition ids, or the same
    //     person instituted more than once.
    if let Some(will) = input.will.as_ref() {
        let mut seen_disposition_ids: HashSet<&str> = HashSet::new();
        let mut duplicate_disposition = false;
        for id in will
            .institutions
            .iter()
            .map(|i| i.id.as_str())
            .chain(will.legacies.iter().map(|l| l.id.as_str()))
            .chain(will.devises.iter().map(|d| d.id.as_str()))
        {
            if !seen_disposition_ids.insert(id) {
                duplicate_disposition = true;
            }
        }

        let mut seen_person_ids: HashSet<&str> = HashSet::new();
        let mut duplicate_institution = false;
        for pid in will
            .institutions
            .iter()
            .filter_map(|i| i.heir.person_id.as_deref())
        {
            if !seen_person_ids.insert(pid) {
                duplicate_institution = true;
            }
        }

        if duplicate_disposition || duplicate_institution {
            flags.push(flag(
                SPEC_FLAG_CONTRADICTORY_DISPOSITIONS,
                "The will contains repeated disposition identifiers or institutes the same person more than once. The conflicting instructions require court resolution.",
                None,
            ));
        }
    }

    flags
}

// ── Tests ───────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn base_input() -> EngineInput {
        EngineInput {
            net_distributable_estate: Money::from_pesos(1_000_000),
            decedent: Decedent {
                id: "d1".to_string(),
                name: "Test Decedent".to_string(),
                date_of_death: "2024-01-01".to_string(),
                is_married: false,
                date_of_marriage: None,
                marriage_solemnized_in_articulo_mortis: false,
                was_ill_at_marriage: false,
                illness_caused_death: false,
                years_of_cohabitation: 0,
                has_legal_separation: false,
                is_illegitimate: false,
            },
            family_tree: vec![],
            will: None,
            donations: vec![],
            config: EngineConfig::default(),
        }
    }

    fn person(id: &str, rel: Relationship) -> Person {
        Person {
            id: id.to_string(),
            name: id.to_string(),
            is_alive_at_succession: true,
            relationship_to_decedent: rel,
            degree: 1,
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

    fn has(flags: &[ManualFlag], code: &str) -> bool {
        flags.iter().any(|f| f.category == code)
    }

    fn empty_will() -> Will {
        Will {
            institutions: vec![],
            legacies: vec![],
            devises: vec![],
            disinheritances: vec![],
            date_executed: "2023-01-01".to_string(),
        }
    }

    fn institution(id: &str, person_id: Option<&str>) -> InstitutionOfHeir {
        InstitutionOfHeir {
            id: id.to_string(),
            heir: HeirReference {
                person_id: person_id.map(|s| s.to_string()),
                name: person_id.unwrap_or("someone").to_string(),
                is_collective: false,
                class_designation: None,
            },
            share: ShareSpec::EqualWithOthers,
            conditions: vec![],
            substitutes: vec![],
            is_residuary: false,
        }
    }

    #[test]
    fn test_detects_grandparent_of_illegitimate() {
        let mut input = base_input();
        input.decedent.is_illegitimate = true;
        let mut gp = person("gp1", Relationship::LegitimateAscendant);
        gp.degree = 2;
        input.family_tree = vec![gp];

        let flags = detect_spec_flags(&input);
        assert!(has(&flags, SPEC_FLAG_GRANDPARENT_OF_ILLEGITIMATE));
        assert_eq!(
            flags
                .iter()
                .find(|f| f.category == SPEC_FLAG_GRANDPARENT_OF_ILLEGITIMATE)
                .and_then(|f| f.related_heir_id.clone()),
            Some("gp1".to_string())
        );
    }

    #[test]
    fn test_detects_cross_class_accretion() {
        let mut input = base_input();
        let mut ic = person("ic1", Relationship::IllegitimateChild);
        ic.has_renounced = true;
        input.family_tree = vec![ic, person("lc1", Relationship::LegitimateChild)];

        let flags = detect_spec_flags(&input);
        assert!(has(&flags, SPEC_FLAG_CROSS_CLASS_ACCRETION));
    }

    #[test]
    fn test_detects_reserva_troncal() {
        let mut input = base_input();
        input.config.manual_review_facts.reserva_troncal_property_present = true;

        let flags = detect_spec_flags(&input);
        assert!(has(&flags, SPEC_FLAG_RESERVA_TRONCAL));
    }

    #[test]
    fn test_detects_collation_dispute() {
        let mut input = base_input();
        input.config.manual_review_facts.disputed_donation_ids = vec!["don1".to_string()];

        let flags = detect_spec_flags(&input);
        assert!(has(&flags, SPEC_FLAG_COLLATION_DISPUTE));
    }

    #[test]
    fn test_detects_ra_11642_retroactivity() {
        let mut input = base_input();
        let mut adoptee = person("ac1", Relationship::AdoptedChild);
        adoptee.adoption = Some(Adoption {
            decree_date: "2015-06-01".to_string(),
            regime: AdoptionRegime::Ra8552,
            adopter: "d1".to_string(),
            adoptee: "ac1".to_string(),
            is_stepparent_adoption: false,
            biological_parent_spouse: None,
            is_rescinded: false,
            rescission_date: None,
        });
        input.family_tree = vec![adoptee];

        let flags = detect_spec_flags(&input);
        assert!(has(&flags, SPEC_FLAG_RA_11642_RETROACTIVITY));
    }

    #[test]
    fn test_ra_11642_not_flagged_for_post_2022_decree() {
        let mut input = base_input();
        let mut adoptee = person("ac1", Relationship::AdoptedChild);
        adoptee.adoption = Some(Adoption {
            decree_date: "2023-03-01".to_string(),
            regime: AdoptionRegime::Ra8552,
            adopter: "d1".to_string(),
            adoptee: "ac1".to_string(),
            is_stepparent_adoption: false,
            biological_parent_spouse: None,
            is_rescinded: false,
            rescission_date: None,
        });
        input.family_tree = vec![adoptee];

        let flags = detect_spec_flags(&input);
        assert!(!has(&flags, SPEC_FLAG_RA_11642_RETROACTIVITY));
    }

    #[test]
    fn test_detects_articulo_mortis() {
        let mut input = base_input();
        input.decedent.marriage_solemnized_in_articulo_mortis = true;

        let flags = detect_spec_flags(&input);
        assert!(has(&flags, SPEC_FLAG_ARTICULO_MORTIS));
    }

    #[test]
    fn test_detects_usufruct_annuity_option() {
        let mut input = base_input();
        input
            .config
            .manual_review_facts
            .usufruct_or_annuity_disposition_ids = vec!["leg1".to_string()];

        let flags = detect_spec_flags(&input);
        assert!(has(&flags, SPEC_FLAG_USUFRUCT_ANNUITY_OPTION));
    }

    #[test]
    fn test_detects_dual_line_ascendant() {
        let mut input = base_input();
        input.config.manual_review_facts.dual_line_ascendant_ids = vec!["asc1".to_string()];

        let flags = detect_spec_flags(&input);
        assert!(has(&flags, SPEC_FLAG_DUAL_LINE_ASCENDANT));
        assert_eq!(
            flags
                .iter()
                .find(|f| f.category == SPEC_FLAG_DUAL_LINE_ASCENDANT)
                .and_then(|f| f.related_heir_id.clone()),
            Some("asc1".to_string())
        );
    }

    #[test]
    fn test_detects_posthumous_disinheritance() {
        let mut input = base_input();
        input.config.manual_review_facts.unborn_disinherited_ids = vec!["p9".to_string()];

        let flags = detect_spec_flags(&input);
        assert!(has(&flags, SPEC_FLAG_POSTHUMOUS_DISINHERITANCE));
    }

    #[test]
    fn test_detects_contradictory_dispositions() {
        let mut input = base_input();
        let mut will = empty_will();
        // Same disposition id twice.
        will.institutions = vec![institution("i1", Some("a")), institution("i1", Some("b"))];
        input.will = Some(will);

        let flags = detect_spec_flags(&input);
        assert!(has(&flags, SPEC_FLAG_CONTRADICTORY_DISPOSITIONS));
    }

    #[test]
    fn test_detects_contradictory_dispositions_by_repeated_institution() {
        let mut input = base_input();
        let mut will = empty_will();
        // Distinct ids, but the same person instituted twice.
        will.institutions = vec![institution("i1", Some("a")), institution("i2", Some("a"))];
        input.will = Some(will);

        let flags = detect_spec_flags(&input);
        assert!(has(&flags, SPEC_FLAG_CONTRADICTORY_DISPOSITIONS));
    }

    /// Without this, an always-on detector would pass all ten tests above and be
    /// useless. A clean input must produce nothing.
    #[test]
    fn test_clean_input_produces_no_spec_flags() {
        let mut input = base_input();
        input.family_tree = vec![
            person("lc1", Relationship::LegitimateChild),
            person("sp", Relationship::SurvivingSpouse),
        ];
        let mut will = empty_will();
        will.institutions = vec![institution("i1", Some("lc1")), institution("i2", Some("sp"))];
        input.will = Some(will);

        assert!(detect_spec_flags(&input).is_empty());
    }

    #[test]
    fn test_spec_flag_codes_array_holds_all_ten() {
        assert_eq!(SPEC_FLAG_CODES.len(), 10);
        let unique: HashSet<&str> = SPEC_FLAG_CODES.iter().copied().collect();
        assert_eq!(unique.len(), 10, "SPEC_FLAG_CODES contains a duplicate");
    }

    #[test]
    fn test_flags_are_emitted_in_spec_table_order() {
        // An input triggering several codes must emit them in SPEC_FLAG_CODES order.
        let mut input = base_input();
        input.decedent.marriage_solemnized_in_articulo_mortis = true;
        input.config.manual_review_facts.reserva_troncal_property_present = true;
        input.config.manual_review_facts.dual_line_ascendant_ids = vec!["asc1".to_string()];

        let flags = detect_spec_flags(&input);
        let order: Vec<usize> = flags
            .iter()
            .map(|f| {
                SPEC_FLAG_CODES
                    .iter()
                    .position(|c| *c == f.category)
                    .expect("emitted a category that is not a spec code")
            })
            .collect();
        let mut sorted = order.clone();
        sorted.sort_unstable();
        assert_eq!(order, sorted);
        assert_eq!(flags.len(), 3);
    }
}
