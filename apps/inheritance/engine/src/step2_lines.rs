//! Step 2: Build Lines (Representation Analysis)
//!
//! Analyzes classified heirs to build inheritance lines, handling
//! representation for predeceased, disinherited, or unworthy heirs.
//!
//! Spec references: §5 (Representation, Arts. 970-977)
//!   - §5.1 Triggers (predecease, disinheritance, incapacity/unworthiness — NOT renunciation)
//!   - §5.2 Rules (per stirpes, lines not heads, no depth limit descending, collateral limit)
//!   - §5.3 Build Lines Algorithm

use crate::types::*;

// ── Types ───────────────────────────────────────────────────────────

/// A line of succession for distribution purposes.
/// Each line represents one "slot" in the inheritance division.
/// One living child = 1 line. One predeceased child with N grandchildren = 1 line.
#[derive(Debug, Clone)]
pub struct Line {
    /// The degree-1 heir who anchors this line (whether alive or represented).
    pub ancestor_heir_id: HeirId,
    /// Effective category of this line's ancestor.
    pub effective_category: EffectiveCategory,
    /// How inheritance flows: OwnRight (heir alive) or Representation (descendants step in).
    pub mode: InheritanceMode,
    /// Heir IDs that actually receive through this line.
    /// For OwnRight: `[ancestor_heir_id]`. For Representation: `[rep1, rep2, ...]`.
    pub participants: Vec<HeirId>,
}

/// Per-category line counts, used by Step 3 for scenario determination.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LineCounts {
    pub legitimate_child: usize,
    pub illegitimate_child: usize,
    pub surviving_spouse: usize,
    pub legitimate_ascendant: usize,
}

/// Input to Step 2.
#[derive(Debug, Clone)]
pub struct Step2Input {
    pub heirs: Vec<Heir>,
}

/// Output of Step 2 — lines built, heirs updated with representation info.
#[derive(Debug, Clone)]
pub struct Step2Output {
    pub lines: Vec<Line>,
    pub heirs: Vec<Heir>,
    pub line_counts: LineCounts,
    pub warnings: Vec<ManualFlag>,
}

// ── Public API ──────────────────────────────────────────────────────

/// Build inheritance lines from classified heirs.
///
/// For each primary heir (degree 1), determines whether they form a line
/// in their own right or are represented by their descendants.
/// Updates heir fields: `representation_trigger`, `represented_by`, `represents`,
/// `inherits_by`, `line_ancestor`.
pub fn step2_build_lines(input: &Step2Input) -> Step2Output {
    let mut heirs = input.heirs.clone();
    let warnings = Vec::new();

    // Phase 1: Identify line anchors per category and build lines (immutable pass).
    // Anchor selection is per-category (see `anchor_ids_for_category`): every
    // category except the ascendants still anchors at degree 1, while the
    // ascendants anchor at the nearest living degree (Art. 987 ¶1).
    let mut anchor_ids: Vec<HeirId> = Vec::new();
    for category in ANCHOR_CATEGORY_ORDER {
        for id in anchor_ids_for_category(&heirs, category) {
            if !anchor_ids.contains(&id) {
                anchor_ids.push(id);
            }
        }
    }

    // Build each line and collect results: (anchor_id, line, trigger)
    // Also collect extinct lines (trigger exists but no representatives) so we can
    // set representation_trigger on those heirs for downstream stages (Step 5).
    let mut line_results: Vec<(HeirId, Line, Option<RepresentationTrigger>)> = Vec::new();
    let mut extinct_triggers: Vec<(HeirId, RepresentationTrigger)> = Vec::new();

    for anchor_id in &anchor_ids {
        let anchor = heirs.iter().find(|h| h.id == *anchor_id).unwrap();
        let trigger = get_representation_trigger(anchor);
        match build_single_line(anchor, &heirs) {
            Some(line) => line_results.push((anchor_id.clone(), line, trigger)),
            None => {
                // Line is extinct. If a trigger exists, record it so downstream
                // stages know this heir had a trigger but no representatives.
                //
                // Ascendants are never recorded here. `has_extinct_line` in Step 5
                // reads this field only for the LC and IC groups, and an ascendant
                // can never be represented (Art. 972 ¶1), so an ascendant has no
                // "line that went extinct" to report.
                if anchor.effective_category != EffectiveCategory::LegitimateAscendantGroup {
                    if let Some(t) = trigger {
                        extinct_triggers.push((anchor_id.clone(), t));
                    }
                }
            }
        }
    }

    // Art. 969 promotion can move the descendant anchor tier off degree 1. A
    // degree-1 descendant left behind by that promotion, whose own line is
    // extinct, must still carry its representation_trigger: Step 5 reads that
    // field through `has_extinct_line` to exclude it from the per-line legitime.
    // Losing the mark would silently pay a predeceased childless heir.
    for heir in &heirs {
        let is_descendant = matches!(
            heir.effective_category,
            EffectiveCategory::LegitimateChildGroup | EffectiveCategory::IllegitimateChildGroup
        );
        if !is_descendant || heir.degree_from_decedent != 1 || anchor_ids.contains(&heir.id) {
            continue;
        }
        if let Some(t) = get_representation_trigger(heir) {
            if build_single_line(heir, &heirs).is_none() {
                extinct_triggers.push((heir.id.clone(), t));
            }
        }
    }

    // Phase 2: Update heir fields based on computed lines (mutable pass)
    let mut lines = Vec::new();

    for (anchor_id, line, trigger) in &line_results {
        match line.mode {
            InheritanceMode::OwnRight => {
                if let Some(heir) = heirs.iter_mut().find(|h| h.id == *anchor_id) {
                    heir.inherits_by = InheritanceMode::OwnRight;
                }
            }
            InheritanceMode::Representation => {
                // Update ancestor heir
                if let Some(ancestor) = heirs.iter_mut().find(|h| h.id == *anchor_id) {
                    ancestor.representation_trigger = *trigger;
                    ancestor.represented_by = line.participants.clone();
                }
                // Update each representative
                for rep_id in &line.participants {
                    if let Some(rep) = heirs.iter_mut().find(|h| h.id == *rep_id) {
                        rep.inherits_by = InheritanceMode::Representation;
                        rep.line_ancestor = Some(anchor_id.clone());
                        rep.represents = Some(anchor_id.clone());
                    }
                }
            }
        }
        lines.push(line.clone());
    }

    // Set representation_trigger on heirs with extinct lines so Step 5 can
    // detect them via has_extinct_line() and exclude them from legitime distribution.
    for (anchor_id, trigger) in &extinct_triggers {
        if let Some(heir) = heirs.iter_mut().find(|h| h.id == *anchor_id) {
            heir.representation_trigger = Some(*trigger);
            // represented_by stays empty — this is how Step 5 detects extinct lines
        }
    }

    // Phase 3: Compute per-category line counts
    let line_counts = LineCounts {
        legitimate_child: lines
            .iter()
            .filter(|l| l.effective_category == EffectiveCategory::LegitimateChildGroup)
            .count(),
        illegitimate_child: lines
            .iter()
            .filter(|l| l.effective_category == EffectiveCategory::IllegitimateChildGroup)
            .count(),
        surviving_spouse: lines
            .iter()
            .filter(|l| l.effective_category == EffectiveCategory::SurvivingSpouseGroup)
            .count(),
        legitimate_ascendant: lines
            .iter()
            .filter(|l| l.effective_category == EffectiveCategory::LegitimateAscendantGroup)
            .count(),
    };

    Step2Output {
        lines,
        heirs,
        line_counts,
        warnings,
    }
}

// ── Internal helpers ────────────────────────────────────────────────

/// The order in which categories contribute anchors to the line list.
///
/// Fixed so that emitted row order stays stable regardless of the order the
/// heirs happen to appear in the family tree.
const ANCHOR_CATEGORY_ORDER: [EffectiveCategory; 5] = [
    EffectiveCategory::LegitimateChildGroup,
    EffectiveCategory::IllegitimateChildGroup,
    EffectiveCategory::SurvivingSpouseGroup,
    EffectiveCategory::LegitimateAscendantGroup,
    EffectiveCategory::CollateralGroup,
];

/// Select the heirs of one effective category that anchor an inheritance line.
///
/// Descendants, the surviving spouse and collaterals anchor at
/// `degree_from_decedent == 1`, which is the rule this engine has always
/// applied.
///
/// Ascendants anchor at the nearest **surviving** degree. This transcribes
/// Art. 987 ¶1: "In default of the father and mother, the ascendants nearest in
/// degree shall inherit." Before this rule existed, a grandparent at degree 2
/// could never anchor a line, so `LineCounts.legitimate_ascendant` stayed 0 and
/// the ascendant intestate regime was unreachable whenever both parents were
/// gone.
///
/// An ascendant only counts toward the nearest degree if it can actually
/// inherit — `is_alive && is_eligible && !has_renounced` — because a
/// predeceased ascendant cannot be represented (Art. 972 ¶1) and so cannot
/// hold a degree open against the ascendants above it.
pub fn anchor_ids_for_category(heirs: &[Heir], category: EffectiveCategory) -> Vec<HeirId> {
    match category {
        EffectiveCategory::LegitimateAscendantGroup => {
            let candidates: Vec<&Heir> = heirs
                .iter()
                .filter(|h| {
                    h.effective_category == category
                        && h.is_alive
                        && h.is_eligible
                        && !h.has_renounced
                })
                .collect();

            // Art. 987 ¶1: the ascendants nearest in degree inherit.
            let min_degree = match candidates.iter().map(|h| h.degree_from_decedent).min() {
                Some(d) => d,
                None => return Vec::new(),
            };

            candidates
                .iter()
                .filter(|h| h.degree_from_decedent == min_degree)
                .map(|h| h.id.clone())
                .collect()
        }
        // Descendants: Art. 969. "Should there be more than one of equal degree
        // belonging to the same line they shall divide the inheritance per
        // capita; should they be of different lines but of equal degree, one-half
        // shall go to the paternal and the other half to the maternal
        // ascendants" — and, operatively here, when the relatives nearest in
        // degree repudiate, "those of the following degree shall inherit in their
        // own right and cannot represent the person or persons repudiating the
        // inheritance."
        //
        // A repudiating heir yields no line (Art. 977 makes renunciation neither
        // a representation trigger nor an own-right claim), so a wholly
        // repudiating nearest degree promotes the degree below it. A predeceased
        // heir with living descendants DOES yield a line — a representation line
        // — so predecease never promotes and the estate still passes per stirpes.
        EffectiveCategory::LegitimateChildGroup
        | EffectiveCategory::IllegitimateChildGroup
        // Collaterals do not sit at degree 1 — a brother or sister is at degree 2
        // — so the same "first degree that yields a line" rule selects the
        // siblings in the ordinary family and the nephews when no sibling record
        // exists at all, which is Art. 975 ¶2's "if they alone survive" shape.
        | EffectiveCategory::CollateralGroup => {
            anchor_ids_at_first_line_yielding_degree(heirs, category)
        }
        // The surviving spouse has exactly one degree and no representation.
        EffectiveCategory::SurvivingSpouseGroup => heirs
            .iter()
            .filter(|h| h.effective_category == category && h.degree_from_decedent == 1)
            .map(|h| h.id.clone())
            .collect(),
    }
}

/// Anchor at the lowest `degree_from_decedent` of `category` that actually
/// yields at least one line, and return every heir of that category at that
/// degree.
fn anchor_ids_at_first_line_yielding_degree(
    heirs: &[Heir],
    category: EffectiveCategory,
) -> Vec<HeirId> {
    let mut degrees: Vec<i32> = heirs
        .iter()
        .filter(|h| h.effective_category == category)
        .map(|h| h.degree_from_decedent)
        .collect();
    degrees.sort_unstable();
    degrees.dedup();

    for degree in degrees {
        if degree_yields_a_line(heirs, category, degree) {
            return heirs
                .iter()
                .filter(|h| h.effective_category == category && h.degree_from_decedent == degree)
                .map(|h| h.id.clone())
                .collect();
        }
    }

    Vec::new()
}

/// True when at least one heir of `category` at `degree` produces a line.
fn degree_yields_a_line(heirs: &[Heir], category: EffectiveCategory, degree: i32) -> bool {
    heirs
        .iter()
        .filter(|h| h.effective_category == category && h.degree_from_decedent == degree)
        .any(|h| build_single_line(h, heirs).is_some())
}

/// Determine the representation trigger for an heir.
///
/// Priority:
/// 1. Not alive → Predecease
/// 2. Alive, validly disinherited → Disinheritance
/// 3. Alive, unworthy (not condoned) → Unworthiness
/// 4. Renounced → None (Art. 977: renunciation is NOT a representation trigger)
/// 5. Otherwise → None
pub fn get_representation_trigger(heir: &Heir) -> Option<RepresentationTrigger> {
    // Priority 1: Not alive → Predecease
    if !heir.is_alive {
        return Some(RepresentationTrigger::Predecease);
    }
    // Priority 2: Alive, validly disinherited → Disinheritance
    if heir.is_disinherited && heir.disinheritance_valid {
        return Some(RepresentationTrigger::Disinheritance);
    }
    // Priority 3: Alive, unworthy (not condoned) → Unworthiness
    if heir.is_unworthy && !heir.unworthiness_condoned {
        return Some(RepresentationTrigger::Unworthiness);
    }
    // Priority 4: Renounced → None (Art. 977: renunciation is NOT a trigger)
    // Priority 5: Otherwise → None
    None
}

/// Build a single inheritance line for the given anchor heir.
///
/// - If anchor is alive + eligible + not renounced → OwnRight line
/// - If anchor has a representation trigger → find representatives recursively
/// - If renounced or no trigger → None (extinct line)
fn build_single_line(anchor: &Heir, all_heirs: &[Heir]) -> Option<Line> {
    // Check representation trigger FIRST — a disinherited heir is alive/eligible
    // but should not get OwnRight; their descendants represent them.
    let trigger = get_representation_trigger(anchor);

    // Art. 972 ¶1: "The right of representation takes place in the direct
    // descending line, but never in the ascending."
    //
    // An ascendant anchor therefore never produces a Representation line and
    // `find_representatives_recursive` is never called on one. That call would
    // walk the ascendant's `children`, which are the decedent's own siblings —
    // constructing representation in the ascending line and crediting a
    // predeceased parent's share to a collateral.
    if anchor.effective_category == EffectiveCategory::LegitimateAscendantGroup {
        if trigger.is_some() {
            return None; // Line extinct — an ascendant is never represented.
        }
        if anchor.is_alive && anchor.is_eligible && !anchor.has_renounced {
            return Some(Line {
                ancestor_heir_id: anchor.id.clone(),
                effective_category: anchor.effective_category,
                mode: InheritanceMode::OwnRight,
                participants: vec![anchor.id.clone()],
            });
        }
        return None;
    }

    // Art. 972 ¶2: in the collateral line representation "shall take place only
    // in favor of the children of brothers or sisters, whether they be of the
    // full or half blood". Only a brother or sister — degree 2 — may therefore
    // be represented, and only by their own children, one level down. A
    // grand-nephew never steps into a predeceased nephew's place.
    if anchor.effective_category == EffectiveCategory::CollateralGroup {
        if trigger.is_some() {
            if anchor.degree_from_decedent != 2 {
                return None; // Only a brother or sister can be represented.
            }
            let reps = find_collateral_representatives(anchor, all_heirs);
            if reps.is_empty() {
                return None; // Line extinct — no living children of that sibling.
            }
            return Some(Line {
                ancestor_heir_id: anchor.id.clone(),
                effective_category: anchor.effective_category,
                mode: InheritanceMode::Representation,
                participants: reps,
            });
        }
        if anchor.is_alive && anchor.is_eligible && !anchor.has_renounced {
            return Some(Line {
                ancestor_heir_id: anchor.id.clone(),
                effective_category: anchor.effective_category,
                mode: InheritanceMode::OwnRight,
                participants: vec![anchor.id.clone()],
            });
        }
        return None;
    }

    if let Some(_trigger) = trigger {
        // Heir has a representation trigger — find living descendants
        let reps = find_representatives_recursive(anchor, all_heirs);
        if reps.is_empty() {
            return None; // Line extinct — no living representatives
        }
        return Some(Line {
            ancestor_heir_id: anchor.id.clone(),
            effective_category: anchor.effective_category,
            mode: InheritanceMode::Representation,
            participants: reps,
        });
    }

    // No trigger — check if heir can inherit in own right
    if anchor.is_alive && anchor.is_eligible && !anchor.has_renounced {
        return Some(Line {
            ancestor_heir_id: anchor.id.clone(),
            effective_category: anchor.effective_category,
            mode: InheritanceMode::OwnRight,
            participants: vec![anchor.id.clone()],
        });
    }

    None // Line extinct (e.g., renounced with no trigger, or ineligible)
}

/// Find the representatives of a triggered **collateral** anchor.
///
/// Art. 972 ¶2 confines representation in the collateral line to "the children
/// of brothers or sisters", so this walks `heir.children` exactly one level and
/// never recurses:
/// - a child that has repudiated is excluded entirely (Art. 977);
/// - a child that is alive, eligible and carries no representation trigger is a
///   representative;
/// - a child that itself carries a trigger is skipped, not recursed into.
fn find_collateral_representatives(heir: &Heir, all_heirs: &[Heir]) -> Vec<HeirId> {
    let mut reps = Vec::new();

    for child_id in &heir.children {
        let child = match all_heirs.iter().find(|h| h.id == *child_id) {
            Some(c) => c,
            None => continue,
        };

        if child.has_renounced {
            continue; // Art. 977
        }
        if get_representation_trigger(child).is_some() {
            continue; // One level only — no deeper representation.
        }
        if child.is_alive && child.is_eligible {
            reps.push(child.id.clone());
        }
    }

    reps
}

/// Recursively find living, eligible representatives for a triggered heir.
///
/// Traverses the heir's `children` list. For each child:
/// - Alive + eligible + not renounced → representative
/// - Has a representation trigger → recurse into their children
/// - Renounced → excluded (Art. 977), no representation for them
fn find_representatives_recursive(heir: &Heir, all_heirs: &[Heir]) -> Vec<HeirId> {
    let mut reps = Vec::new();

    for child_id in &heir.children {
        let child = match all_heirs.iter().find(|h| h.id == *child_id) {
            Some(c) => c,
            None => continue, // child not in heir list
        };

        // Art. 977: Renounced children are excluded entirely — no representation
        if child.has_renounced {
            continue;
        }

        let trigger = get_representation_trigger(child);

        if trigger.is_none() {
            // No trigger: child is alive, not disinherited, not unworthy
            // They can serve as a representative if eligible
            if child.is_alive && child.is_eligible {
                reps.push(child.id.clone());
            }
        } else {
            // Child has a trigger (dead, disinherited, unworthy) → recurse deeper
            let child_reps = find_representatives_recursive(child, all_heirs);
            reps.extend(child_reps);
        }
    }

    reps
}

// ═══════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ── Helpers ─────────────────────────────────────────────────────

    fn make_heir(id: &str, name: &str, eff_cat: EffectiveCategory, degree: i32) -> Heir {
        let raw_cat = match eff_cat {
            EffectiveCategory::LegitimateChildGroup => HeirCategory::LegitimateChild,
            EffectiveCategory::IllegitimateChildGroup => HeirCategory::IllegitimateChild,
            EffectiveCategory::SurvivingSpouseGroup => HeirCategory::SurvivingSpouse,
            EffectiveCategory::LegitimateAscendantGroup => HeirCategory::LegitimateParent,
            EffectiveCategory::CollateralGroup => HeirCategory::Sibling,
        };
        Heir {
            id: id.to_string(),
            name: name.to_string(),
            raw_category: raw_cat,
            effective_category: eff_cat,
            is_compulsory: true,
            is_alive: true,
            is_eligible: true,
            filiation_proved: true,
            filiation_proof_type: Some(FiliationProof::BirthCertificate),
            is_unworthy: false,
            unworthiness_condoned: false,
            is_disinherited: false,
            disinheritance_valid: false,
            has_renounced: false,
            adoption: None,
            has_valid_adoption: false,
            is_stepparent_adoptee: false,
            legal_separation_guilty: false,
            articulo_mortis_marriage: false,
            degree_from_decedent: degree,
            line: None,
            blood_type: None,
            representation_trigger: None,
            represented_by: vec![],
            represents: None,
            inherits_by: InheritanceMode::OwnRight,
            line_ancestor: None,
            children: vec![],
        }
    }

    /// Shorthand: degree-1 legitimate child.
    fn make_lc(id: &str, name: &str) -> Heir {
        make_heir(id, name, EffectiveCategory::LegitimateChildGroup, 1)
    }

    /// Shorthand: degree-2 grandchild (legitimate child group).
    fn make_gc(id: &str, name: &str) -> Heir {
        make_heir(id, name, EffectiveCategory::LegitimateChildGroup, 2)
    }

    /// Shorthand: degree-3 great-grandchild (legitimate child group).
    fn make_ggc(id: &str, name: &str) -> Heir {
        make_heir(id, name, EffectiveCategory::LegitimateChildGroup, 3)
    }

    /// Shorthand: degree-1 illegitimate child.
    fn make_ic(id: &str, name: &str) -> Heir {
        make_heir(id, name, EffectiveCategory::IllegitimateChildGroup, 1)
    }

    /// Shorthand: degree-2 grandchild of illegitimate child.
    fn make_ic_gc(id: &str, name: &str) -> Heir {
        make_heir(id, name, EffectiveCategory::IllegitimateChildGroup, 2)
    }

    /// Shorthand: surviving spouse.
    fn make_ss(id: &str, name: &str) -> Heir {
        make_heir(id, name, EffectiveCategory::SurvivingSpouseGroup, 1)
    }

    /// Shorthand: legitimate parent (ascendant).
    fn make_parent(id: &str, name: &str) -> Heir {
        make_heir(id, name, EffectiveCategory::LegitimateAscendantGroup, 1)
    }

    // ── Modifier functions ──────────────────────────────────────────

    fn dead(mut heir: Heir) -> Heir {
        heir.is_alive = false;
        heir
    }

    fn renounced(mut heir: Heir) -> Heir {
        heir.has_renounced = true;
        heir
    }

    fn disinherited_valid(mut heir: Heir) -> Heir {
        heir.is_disinherited = true;
        heir.disinheritance_valid = true;
        heir
    }

    fn unworthy_uncondoned(mut heir: Heir) -> Heir {
        heir.is_unworthy = true;
        heir.unworthiness_condoned = false;
        heir.is_eligible = false; // Step 1 marks unworthy as ineligible
        heir
    }

    fn with_children(mut heir: Heir, child_ids: &[&str]) -> Heir {
        heir.children = child_ids.iter().map(|s| s.to_string()).collect();
        heir
    }

    #[allow(dead_code)]
    fn ineligible(mut heir: Heir) -> Heir {
        heir.is_eligible = false;
        heir
    }

    // ── §5.1: Representation trigger determination ──────────────────

    #[test]
    fn test_representation_trigger_predecease() {
        // Dead heir → trigger = Predecease
        let heir = dead(make_lc("lc1", "Ana"));
        assert_eq!(
            get_representation_trigger(&heir),
            Some(RepresentationTrigger::Predecease)
        );
    }

    #[test]
    fn test_representation_trigger_disinheritance() {
        // Alive, validly disinherited → trigger = Disinheritance
        let heir = disinherited_valid(make_lc("lc1", "Ana"));
        assert_eq!(
            get_representation_trigger(&heir),
            Some(RepresentationTrigger::Disinheritance)
        );
    }

    #[test]
    fn test_representation_trigger_unworthiness() {
        // Alive, unworthy (not condoned) → trigger = Unworthiness
        let heir = unworthy_uncondoned(make_lc("lc1", "Ana"));
        assert_eq!(
            get_representation_trigger(&heir),
            Some(RepresentationTrigger::Unworthiness)
        );
    }

    #[test]
    fn test_representation_trigger_renounced_returns_none() {
        // Art. 977: Renunciation is NOT a representation trigger
        let heir = renounced(make_lc("lc1", "Ana"));
        assert_eq!(get_representation_trigger(&heir), None);
    }

    #[test]
    fn test_representation_trigger_alive_eligible_returns_none() {
        // Alive + eligible + not renounced → no trigger (inherits in own right)
        let heir = make_lc("lc1", "Ana");
        assert_eq!(get_representation_trigger(&heir), None);
    }

    #[test]
    fn test_representation_trigger_dead_takes_priority_over_disinheritance() {
        // Dead AND disinherited → Predecease takes priority
        let heir = disinherited_valid(dead(make_lc("lc1", "Ana")));
        assert_eq!(
            get_representation_trigger(&heir),
            Some(RepresentationTrigger::Predecease)
        );
    }

    // ── §5.3: Build lines — OWN_RIGHT (all alive) ──────────────────

    #[test]
    fn test_all_alive_lc_own_right_lines() {
        // 3 alive LC heirs → 3 OWN_RIGHT lines
        let input = Step2Input {
            heirs: vec![
                make_lc("lc1", "Ana"),
                make_lc("lc2", "Belen"),
                make_lc("lc3", "Carlos"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 3);
        for line in &output.lines {
            assert_eq!(line.mode, InheritanceMode::OwnRight);
            assert_eq!(
                line.effective_category,
                EffectiveCategory::LegitimateChildGroup
            );
            assert_eq!(line.participants.len(), 1);
        }
        assert_eq!(output.line_counts.legitimate_child, 3);
    }

    #[test]
    fn test_single_alive_lc_one_line() {
        let input = Step2Input {
            heirs: vec![make_lc("lc1", "Ana")],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 1);
        assert_eq!(output.lines[0].mode, InheritanceMode::OwnRight);
        assert_eq!(output.lines[0].participants, vec!["lc1"]);
        assert_eq!(output.lines[0].ancestor_heir_id, "lc1");
        assert_eq!(output.line_counts.legitimate_child, 1);
    }

    // ── §5.3: Representation — predeceased heir with descendants ────

    #[test]
    fn test_predeceased_lc_with_grandchildren_representation() {
        // 1 predeceased LC with 2 grandchildren → REPRESENTATION line with 2 participants
        let input = Step2Input {
            heirs: vec![
                with_children(dead(make_lc("lc1", "Ana")), &["gc1", "gc2"]),
                make_gc("gc1", "Dina"),
                make_gc("gc2", "Elena"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 1);
        let line = &output.lines[0];
        assert_eq!(line.mode, InheritanceMode::Representation);
        assert_eq!(line.ancestor_heir_id, "lc1");
        assert_eq!(line.participants.len(), 2);
        assert!(line.participants.contains(&"gc1".to_string()));
        assert!(line.participants.contains(&"gc2".to_string()));
        assert_eq!(output.line_counts.legitimate_child, 1);
    }

    #[test]
    fn test_predeceased_lc_no_descendants_extinct() {
        // Predeceased LC with no children → line is extinct (no line produced)
        let input = Step2Input {
            heirs: vec![dead(make_lc("lc1", "Ana"))],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 0);
        assert_eq!(output.line_counts.legitimate_child, 0);
    }

    // ── §5.1: Renunciation does NOT trigger representation (Art. 977) ──

    #[test]
    fn test_renounced_heir_no_representation() {
        // Art. 977: Renounced heir cannot be represented; line extinct
        let input = Step2Input {
            heirs: vec![
                with_children(renounced(make_lc("lc1", "Ana")), &["gc1", "gc2"]),
                make_gc("gc1", "Dina"),
                make_gc("gc2", "Elena"),
            ],
        };
        let output = step2_build_lines(&input);

        // lc1's line should be extinct — renunciation blocks representation
        let lc1_lines: Vec<&Line> = output
            .lines
            .iter()
            .filter(|l| l.ancestor_heir_id == "lc1")
            .collect();
        assert!(lc1_lines.is_empty());
    }

    // ── §5.1: Disinheritance triggers representation ────────────────

    #[test]
    fn test_disinherited_heir_descendants_represent() {
        // Validly disinherited LC with 2 children → children represent
        let input = Step2Input {
            heirs: vec![
                with_children(disinherited_valid(make_lc("lc1", "Ana")), &["gc1", "gc2"]),
                make_gc("gc1", "Dina"),
                make_gc("gc2", "Elena"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 1);
        let line = &output.lines[0];
        assert_eq!(line.mode, InheritanceMode::Representation);
        assert_eq!(line.ancestor_heir_id, "lc1");
        assert_eq!(line.participants.len(), 2);
    }

    // ── §5.1: Unworthiness triggers representation ──────────────────

    #[test]
    fn test_unworthy_heir_descendants_represent() {
        // Unworthy (not condoned) LC with children → children represent
        let input = Step2Input {
            heirs: vec![
                with_children(
                    unworthy_uncondoned(make_lc("lc1", "Ana")),
                    &["gc1"],
                ),
                make_gc("gc1", "Dina"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 1);
        let line = &output.lines[0];
        assert_eq!(line.mode, InheritanceMode::Representation);
        assert_eq!(line.ancestor_heir_id, "lc1");
        assert_eq!(line.participants, vec!["gc1"]);
    }

    // ── §5.2: No depth limit — deep representation (Art. 982) ──────

    #[test]
    fn test_deep_representation_three_levels() {
        // Child predeceased → grandchild also predeceased → great-grandchild represents
        // Art. 982: no depth limit in direct descending line
        let input = Step2Input {
            heirs: vec![
                with_children(dead(make_lc("lc1", "Ana")), &["gc1"]),
                with_children(dead(make_gc("gc1", "Belen")), &["ggc1"]),
                make_ggc("ggc1", "Carlos"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 1);
        let line = &output.lines[0];
        assert_eq!(line.mode, InheritanceMode::Representation);
        assert_eq!(line.ancestor_heir_id, "lc1");
        // Only the great-grandchild (alive leaf) is a participant
        assert_eq!(line.participants, vec!["ggc1"]);
        assert_eq!(output.line_counts.legitimate_child, 1);
    }

    // ── Mixed alive and represented lines ───────────────────────────

    #[test]
    fn test_mixed_alive_and_represented_lines() {
        // 2 alive LC + 1 predeceased LC with 2 grandchildren → 3 lines
        let input = Step2Input {
            heirs: vec![
                make_lc("lc1", "Ana"),
                make_lc("lc2", "Belen"),
                with_children(dead(make_lc("lc3", "Carlos")), &["gc1", "gc2"]),
                make_gc("gc1", "Dina"),
                make_gc("gc2", "Elena"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 3);
        assert_eq!(output.line_counts.legitimate_child, 3);

        let own_right_lines: Vec<&Line> = output
            .lines
            .iter()
            .filter(|l| l.mode == InheritanceMode::OwnRight)
            .collect();
        assert_eq!(own_right_lines.len(), 2);

        let rep_lines: Vec<&Line> = output
            .lines
            .iter()
            .filter(|l| l.mode == InheritanceMode::Representation)
            .collect();
        assert_eq!(rep_lines.len(), 1);
        assert_eq!(rep_lines[0].ancestor_heir_id, "lc3");
        assert_eq!(rep_lines[0].participants.len(), 2);
    }

    // ── Surviving spouse ────────────────────────────────────────────

    #[test]
    fn test_spouse_own_right_line() {
        // Alive spouse → 1 OWN_RIGHT line
        let input = Step2Input {
            heirs: vec![make_ss("sp1", "Maria")],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 1);
        assert_eq!(output.lines[0].mode, InheritanceMode::OwnRight);
        assert_eq!(
            output.lines[0].effective_category,
            EffectiveCategory::SurvivingSpouseGroup
        );
        assert_eq!(output.line_counts.surviving_spouse, 1);
    }

    #[test]
    fn test_dead_spouse_no_line() {
        // Dead spouse → no line (spouse has no representation)
        let input = Step2Input {
            heirs: vec![dead(make_ss("sp1", "Maria"))],
        };
        let output = step2_build_lines(&input);

        let spouse_lines: Vec<&Line> = output
            .lines
            .iter()
            .filter(|l| l.effective_category == EffectiveCategory::SurvivingSpouseGroup)
            .collect();
        assert!(spouse_lines.is_empty());
        assert_eq!(output.line_counts.surviving_spouse, 0);
    }

    // ── Ascendants ──────────────────────────────────────────────────

    #[test]
    fn test_ascendant_own_right_line() {
        // Surviving parent → 1 OWN_RIGHT line
        let input = Step2Input {
            heirs: vec![make_parent("p1", "Pedro")],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 1);
        assert_eq!(output.lines[0].mode, InheritanceMode::OwnRight);
        assert_eq!(
            output.lines[0].effective_category,
            EffectiveCategory::LegitimateAscendantGroup
        );
        assert_eq!(output.line_counts.legitimate_ascendant, 1);
    }

    // ── Line counts ─────────────────────────────────────────────────

    #[test]
    fn test_line_counts_all_categories() {
        // 2 LC + 1 IC + spouse + 1 parent → counts should match
        let input = Step2Input {
            heirs: vec![
                make_lc("lc1", "Ana"),
                make_lc("lc2", "Belen"),
                make_ic("ic1", "Carlo"),
                make_ss("sp1", "Maria"),
                make_parent("p1", "Pedro"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(
            output.line_counts,
            LineCounts {
                legitimate_child: 2,
                illegitimate_child: 1,
                surviving_spouse: 1,
                legitimate_ascendant: 1,
            }
        );
    }

    // ── Heir field updates ──────────────────────────────────────────

    #[test]
    fn test_heir_fields_updated_own_right() {
        // Alive LC heir → inherits_by = OwnRight, no line_ancestor, no represents
        let input = Step2Input {
            heirs: vec![make_lc("lc1", "Ana")],
        };
        let output = step2_build_lines(&input);

        let heir = output.heirs.iter().find(|h| h.id == "lc1").unwrap();
        assert_eq!(heir.inherits_by, InheritanceMode::OwnRight);
        assert!(heir.represents.is_none());
        assert!(heir.line_ancestor.is_none());
        assert!(heir.represented_by.is_empty());
    }

    #[test]
    fn test_heir_fields_updated_representation() {
        // Predeceased LC with grandchildren → grandchildren have representation fields set
        let input = Step2Input {
            heirs: vec![
                with_children(dead(make_lc("lc1", "Ana")), &["gc1", "gc2"]),
                make_gc("gc1", "Dina"),
                make_gc("gc2", "Elena"),
            ],
        };
        let output = step2_build_lines(&input);

        // The ancestor should have represented_by set
        let ancestor = output.heirs.iter().find(|h| h.id == "lc1").unwrap();
        assert!(ancestor.represented_by.contains(&"gc1".to_string()));
        assert!(ancestor.represented_by.contains(&"gc2".to_string()));
        assert_eq!(
            ancestor.representation_trigger,
            Some(RepresentationTrigger::Predecease)
        );

        // Each grandchild should have inherits_by = Representation
        for gc_id in &["gc1", "gc2"] {
            let gc = output
                .heirs
                .iter()
                .find(|h| h.id == *gc_id)
                .unwrap();
            assert_eq!(gc.inherits_by, InheritanceMode::Representation);
            assert_eq!(gc.line_ancestor, Some("lc1".to_string()));
        }
    }

    // ── TV-10: Representation per stirpes (I2 scenario) ─────────────

    #[test]
    fn test_tv10_predeceased_child_three_grandchildren_per_stirpes() {
        // TV-10: I2 scenario — 2 alive LC + 1 predeceased LC with 3 grandchildren
        // + surviving spouse
        // Lines: 3 LC lines (2 own-right + 1 representation) + 1 SS line = 4 total
        let input = Step2Input {
            heirs: vec![
                make_lc("lc1", "Ana"),
                make_lc("lc2", "Belen"),
                with_children(dead(make_lc("lc3", "Carlos")), &["gc1", "gc2", "gc3"]),
                make_gc("gc1", "Dina"),
                make_gc("gc2", "Elena"),
                make_gc("gc3", "Fiona"),
                make_ss("sp1", "Maria"),
            ],
        };
        let output = step2_build_lines(&input);

        // 3 LC lines + 1 SS line = 4 lines total
        assert_eq!(output.lines.len(), 4);
        assert_eq!(output.line_counts.legitimate_child, 3);
        assert_eq!(output.line_counts.surviving_spouse, 1);

        // The representation line for lc3 should have 3 participants
        let rep_line = output
            .lines
            .iter()
            .find(|l| l.ancestor_heir_id == "lc3")
            .unwrap();
        assert_eq!(rep_line.mode, InheritanceMode::Representation);
        assert_eq!(rep_line.participants.len(), 3);
        assert!(rep_line.participants.contains(&"gc1".to_string()));
        assert!(rep_line.participants.contains(&"gc2".to_string()));
        assert!(rep_line.participants.contains(&"gc3".to_string()));

        // §14.2 Invariant 5: sum of representatives = line ancestor's share
        // (This invariant is verified at distribution time, but the line structure
        // supports it: 3 representatives will split lc3's share per stirpes)
    }

    // ── TV-08: Disinheritance + representation (T3 scenario) ────────

    #[test]
    fn test_tv08_disinheritance_plus_representation() {
        // TV-08: T3 scenario — E=₱16M, 3 LC lines + spouse
        // One LC is validly disinherited; their descendants represent them.
        // The disinherited heir gets ₱0 but the line survives through descendants.
        let input = Step2Input {
            heirs: vec![
                make_lc("lc1", "Ana"),   // alive, own right
                make_lc("lc2", "Belen"), // alive, own right
                with_children(
                    disinherited_valid(make_lc("lc3", "Carlos")),
                    &["gc1", "gc2"],
                ),
                make_gc("gc1", "Dina"),
                make_gc("gc2", "Elena"),
                make_ss("sp1", "Maria"),
            ],
        };
        let output = step2_build_lines(&input);

        // 3 LC lines + 1 SS line = 4 total
        assert_eq!(output.lines.len(), 4);
        assert_eq!(output.line_counts.legitimate_child, 3);
        assert_eq!(output.line_counts.surviving_spouse, 1);

        // lc3's line survives through representation (despite disinheritance)
        let rep_line = output
            .lines
            .iter()
            .find(|l| l.ancestor_heir_id == "lc3")
            .unwrap();
        assert_eq!(rep_line.mode, InheritanceMode::Representation);
        assert_eq!(rep_line.participants.len(), 2);

        // The disinherited heir should have representation_trigger = Disinheritance
        let lc3 = output.heirs.iter().find(|h| h.id == "lc3").unwrap();
        assert_eq!(
            lc3.representation_trigger,
            Some(RepresentationTrigger::Disinheritance)
        );
    }

    // ── Art. 902: Illegitimate child can be represented ─────────────

    #[test]
    fn test_illegitimate_child_can_be_represented() {
        // Art. 902: predeceased IC with descendants → REPRESENTATION line
        let input = Step2Input {
            heirs: vec![
                with_children(dead(make_ic("ic1", "Carlo")), &["ic_gc1", "ic_gc2"]),
                make_ic_gc("ic_gc1", "Dina"),
                make_ic_gc("ic_gc2", "Elena"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 1);
        let line = &output.lines[0];
        assert_eq!(line.mode, InheritanceMode::Representation);
        assert_eq!(
            line.effective_category,
            EffectiveCategory::IllegitimateChildGroup
        );
        assert_eq!(line.ancestor_heir_id, "ic1");
        assert_eq!(line.participants.len(), 2);
        assert_eq!(output.line_counts.illegitimate_child, 1);
    }

    // ── Renounced representative excluded, others remain ────────────

    #[test]
    fn test_renounced_grandchild_excluded_others_remain() {
        // Predeceased LC with 3 grandchildren, one has renounced.
        // Art. 977: the renounced grandchild cannot inherit (and cannot be represented).
        // The other 2 grandchildren still represent.
        let input = Step2Input {
            heirs: vec![
                with_children(dead(make_lc("lc1", "Ana")), &["gc1", "gc2", "gc3"]),
                make_gc("gc1", "Dina"),
                renounced(make_gc("gc2", "Elena")),
                make_gc("gc3", "Fiona"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 1);
        let line = &output.lines[0];
        assert_eq!(line.mode, InheritanceMode::Representation);
        assert_eq!(line.participants.len(), 2);
        assert!(line.participants.contains(&"gc1".to_string()));
        assert!(!line.participants.contains(&"gc2".to_string())); // Renounced
        assert!(line.participants.contains(&"gc3".to_string()));
    }

    // ── All grandchildren renounced → line extinct ──────────────────

    #[test]
    fn test_all_grandchildren_renounced_line_extinct() {
        // Predeceased LC with 2 grandchildren, both renounced → extinct
        let input = Step2Input {
            heirs: vec![
                with_children(dead(make_lc("lc1", "Ana")), &["gc1", "gc2"]),
                renounced(make_gc("gc1", "Dina")),
                renounced(make_gc("gc2", "Elena")),
            ],
        };
        let output = step2_build_lines(&input);

        let lc1_lines: Vec<&Line> = output
            .lines
            .iter()
            .filter(|l| l.ancestor_heir_id == "lc1")
            .collect();
        assert!(lc1_lines.is_empty());
        assert_eq!(output.line_counts.legitimate_child, 0);
    }

    // ── Empty heirs ─────────────────────────────────────────────────

    #[test]
    fn test_empty_heirs_no_lines() {
        let input = Step2Input { heirs: vec![] };
        let output = step2_build_lines(&input);

        assert!(output.lines.is_empty());
        assert!(output.heirs.is_empty());
        assert_eq!(
            output.line_counts,
            LineCounts {
                legitimate_child: 0,
                illegitimate_child: 0,
                surviving_spouse: 0,
                legitimate_ascendant: 0,
            }
        );
    }

    // ── Ineligible heir with no representation trigger → extinct ────

    #[test]
    fn test_ineligible_heir_no_trigger_extinct() {
        // IC without filiation proof is alive but ineligible, with no trigger.
        // Line should be extinct.
        let mut heir = make_ic("ic1", "Carlo");
        heir.is_eligible = false;
        heir.filiation_proved = false;

        let input = Step2Input {
            heirs: vec![heir],
        };
        let output = step2_build_lines(&input);

        assert!(output.lines.is_empty());
        assert_eq!(output.line_counts.illegitimate_child, 0);
    }

    // ── Multiple extinct lines don't contribute to count ────────────

    #[test]
    fn test_multiple_extinct_lines_not_counted() {
        // 2 predeceased LC with no descendants + 1 alive LC → only 1 line
        let input = Step2Input {
            heirs: vec![
                dead(make_lc("lc1", "Ana")),
                dead(make_lc("lc2", "Belen")),
                make_lc("lc3", "Carlos"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 1);
        assert_eq!(output.lines[0].ancestor_heir_id, "lc3");
        assert_eq!(output.line_counts.legitimate_child, 1);
    }

    // ── Representation through dead grandchild to great-grandchildren ──

    #[test]
    fn test_representation_skips_dead_intermediate() {
        // lc1 (dead) → gc1 (dead) → ggc1 (alive) + ggc2 (alive)
        // The representation line should have ggc1 and ggc2 as participants
        let input = Step2Input {
            heirs: vec![
                with_children(dead(make_lc("lc1", "Ana")), &["gc1"]),
                with_children(dead(make_gc("gc1", "Belen")), &["ggc1", "ggc2"]),
                make_ggc("ggc1", "Carlos"),
                make_ggc("ggc2", "Dina"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 1);
        let line = &output.lines[0];
        assert_eq!(line.mode, InheritanceMode::Representation);
        assert_eq!(line.ancestor_heir_id, "lc1");
        assert_eq!(line.participants.len(), 2);
        assert!(line.participants.contains(&"ggc1".to_string()));
        assert!(line.participants.contains(&"ggc2".to_string()));
    }

    // ── Mixed representation: some grandchildren alive, one dead with kids ──

    #[test]
    fn test_mixed_depth_representation() {
        // lc1 (dead) → gc1 (alive) + gc2 (dead) → ggc1 (alive)
        // Representatives: gc1 and ggc1
        let input = Step2Input {
            heirs: vec![
                with_children(dead(make_lc("lc1", "Ana")), &["gc1", "gc2"]),
                make_gc("gc1", "Belen"),
                with_children(dead(make_gc("gc2", "Carlos")), &["ggc1"]),
                make_ggc("ggc1", "Dina"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.lines.len(), 1);
        let line = &output.lines[0];
        assert_eq!(line.mode, InheritanceMode::Representation);
        assert_eq!(line.ancestor_heir_id, "lc1");
        assert_eq!(line.participants.len(), 2);
        assert!(line.participants.contains(&"gc1".to_string()));
        assert!(line.participants.contains(&"ggc1".to_string()));
    }

    // ── Art. 987 ¶1 / Art. 972 ¶1: per-category anchor selection ────

    /// Shorthand: an ascendant at an arbitrary degree.
    fn make_ascendant(id: &str, name: &str, degree: i32) -> Heir {
        make_heir(id, name, EffectiveCategory::LegitimateAscendantGroup, degree)
    }

    /// Shorthand: a collateral (sibling) at degree 2.
    fn make_sibling(id: &str, name: &str) -> Heir {
        make_heir(id, name, EffectiveCategory::CollateralGroup, 2)
    }

    #[test]
    fn test_ascendant_anchors_fall_to_grandparents_when_parents_absent() {
        // Art. 987 ¶1: "In default of the father and mother, the ascendants
        // nearest in degree shall inherit." No parent is in the tree at all, so
        // the two living grandparents anchor lines of their own.
        let heirs = vec![
            make_ascendant("gp1", "Lolo", 2),
            make_ascendant("gp2", "Lola", 2),
        ];

        let anchors =
            anchor_ids_for_category(&heirs, EffectiveCategory::LegitimateAscendantGroup);
        assert_eq!(anchors, vec!["gp1".to_string(), "gp2".to_string()]);

        let output = step2_build_lines(&Step2Input { heirs });
        assert_eq!(output.line_counts.legitimate_ascendant, 2);
    }

    #[test]
    fn test_ascendant_anchors_stop_at_the_nearest_living_degree() {
        // A surviving parent excludes the grandparents entirely (Art. 987 ¶1
        // applies only "in default of the father and mother").
        let heirs = vec![
            make_ascendant("p1", "Pedro", 1),
            make_ascendant("gp1", "Lolo", 2),
            make_ascendant("gp2", "Lola", 2),
        ];

        let anchors =
            anchor_ids_for_category(&heirs, EffectiveCategory::LegitimateAscendantGroup);
        assert_eq!(anchors, vec!["p1".to_string()]);

        let output = step2_build_lines(&Step2Input { heirs });
        assert_eq!(output.line_counts.legitimate_ascendant, 1);
    }

    #[test]
    fn test_dead_ascendant_is_never_represented() {
        // Art. 972 ¶1: representation "takes place in the direct descending
        // line, but never in the ascending". A predeceased parent whose
        // `children` list names the decedent's sibling must NOT be represented
        // by that sibling.
        let heirs = vec![
            with_children(dead(make_ascendant("fa", "Father", 1)), &["sib1"]),
            make_sibling("sib1", "Sibling"),
        ];
        let output = step2_build_lines(&Step2Input { heirs });

        let fa = output.heirs.iter().find(|h| h.id == "fa").unwrap();
        assert!(fa.represented_by.is_empty());

        let sib1 = output.heirs.iter().find(|h| h.id == "sib1").unwrap();
        assert_eq!(sib1.inherits_by, InheritanceMode::OwnRight);
        assert_eq!(sib1.represents, None);

        assert_eq!(output.line_counts.legitimate_ascendant, 0);
    }

    #[test]
    fn test_descendant_anchors_are_unchanged_by_this_plan() {
        // Descendant anchoring and descending-line representation are untouched:
        // two degree-1 legitimate children, one predeceased with a living child.
        let input = Step2Input {
            heirs: vec![
                make_lc("lc1", "Ana"),
                with_children(dead(make_lc("lc2", "Belen")), &["gc1"]),
                make_gc("gc1", "Dina"),
            ],
        };
        let output = step2_build_lines(&input);

        assert_eq!(output.line_counts.legitimate_child, 2);
        let gc1 = output.heirs.iter().find(|h| h.id == "gc1").unwrap();
        assert_eq!(gc1.inherits_by, InheritanceMode::Representation);
        assert_eq!(gc1.represents, Some("lc2".to_string()));
    }

    // ── Art. 972 ¶2 / Art. 975: collateral anchors ──────────────────

    /// Shorthand: a collateral heir at an arbitrary degree.
    fn make_collateral(id: &str, name: &str, degree: i32) -> Heir {
        make_heir(id, name, EffectiveCategory::CollateralGroup, degree)
    }

    #[test]
    fn test_predeceased_sibling_is_represented_by_its_own_children() {
        // Art. 972 ¶2: representation in the collateral line takes place in
        // favor of the children of brothers or sisters.
        let input = Step2Input {
            heirs: vec![
                make_collateral("sib1", "Sibling One", 2),
                with_children(dead(make_collateral("sib2", "Sibling Two", 2)), &["n1", "n2"]),
                make_collateral("n1", "Nephew One", 3),
                make_collateral("n2", "Nephew Two", 3),
            ],
        };
        let output = step2_build_lines(&input);

        let sib2 = output.heirs.iter().find(|h| h.id == "sib2").unwrap();
        assert!(sib2.represented_by.contains(&"n1".to_string()));
        assert!(sib2.represented_by.contains(&"n2".to_string()));

        for nid in &["n1", "n2"] {
            let n = output.heirs.iter().find(|h| h.id == *nid).unwrap();
            assert_eq!(n.inherits_by, InheritanceMode::Representation);
            assert_eq!(n.represents, Some("sib2".to_string()));
        }
    }

    #[test]
    fn test_grand_nephew_cannot_represent_a_predeceased_nephew() {
        // Art. 972 ¶2 confines collateral representation to the children of
        // brothers or sisters — a grand-nephew never represents.
        let input = Step2Input {
            heirs: vec![
                with_children(dead(make_collateral("sib1", "Sibling", 2)), &["n1"]),
                with_children(dead(make_collateral("n1", "Nephew", 3)), &["gn1"]),
                make_collateral("gn1", "Grand-nephew", 4),
            ],
        };
        let output = step2_build_lines(&input);

        let sib1 = output.heirs.iter().find(|h| h.id == "sib1").unwrap();
        assert!(sib1.represented_by.is_empty());

        let gn1 = output.heirs.iter().find(|h| h.id == "gn1").unwrap();
        assert_eq!(gn1.inherits_by, InheritanceMode::OwnRight);
    }

    #[test]
    fn test_nephews_anchor_when_no_sibling_record_exists() {
        // Art. 975 ¶2 shape: the nephews alone survive and no sibling record is
        // in the tree at all.
        let heirs = vec![
            make_collateral("n1", "Nephew One", 3),
            make_collateral("n2", "Nephew Two", 3),
        ];

        let anchors = anchor_ids_for_category(&heirs, EffectiveCategory::CollateralGroup);
        assert_eq!(anchors, vec!["n1".to_string(), "n2".to_string()]);
    }

    #[test]
    fn test_living_sibling_still_anchors_over_its_children() {
        // A living sibling anchors; their child does not become an anchor.
        let heirs = vec![
            with_children(make_collateral("sib1", "Sibling", 2), &["n1"]),
            make_collateral("n1", "Nephew", 3),
        ];

        let anchors = anchor_ids_for_category(&heirs, EffectiveCategory::CollateralGroup);
        assert_eq!(anchors, vec!["sib1".to_string()]);

        let output = step2_build_lines(&Step2Input { heirs });
        let n1 = output.heirs.iter().find(|h| h.id == "n1").unwrap();
        assert_eq!(n1.inherits_by, InheritanceMode::OwnRight);
    }

    // ── Art. 969: total repudiation promotes the following degree ───

    #[test]
    fn test_art969_promotes_grandchildren_when_all_children_repudiate() {
        // Art. 969: when the nearest relatives repudiate, "those of the
        // following degree shall inherit in their own right and cannot
        // represent the person or persons repudiating the inheritance."
        let heirs = vec![
            with_children(renounced(make_lc("lc1", "Ana")), &["gc1"]),
            with_children(renounced(make_lc("lc2", "Belen")), &["gc2"]),
            with_children(renounced(make_lc("lc3", "Carlos")), &["gc3"]),
            make_gc("gc1", "Dina"),
            make_gc("gc2", "Elena"),
            make_gc("gc3", "Fiona"),
        ];

        let anchors =
            anchor_ids_for_category(&heirs, EffectiveCategory::LegitimateChildGroup);
        assert_eq!(
            anchors,
            vec!["gc1".to_string(), "gc2".to_string(), "gc3".to_string()]
        );

        let output = step2_build_lines(&Step2Input { heirs });
        assert_eq!(output.line_counts.legitimate_child, 3);

        for gid in &["gc1", "gc2", "gc3"] {
            let gc = output.heirs.iter().find(|h| h.id == *gid).unwrap();
            assert_eq!(gc.inherits_by, InheritanceMode::OwnRight);
            assert_eq!(gc.represents, None);
        }
        for cid in &["lc1", "lc2", "lc3"] {
            let c = output.heirs.iter().find(|h| h.id == *cid).unwrap();
            assert!(c.represented_by.is_empty());
        }
    }

    #[test]
    fn test_art969_promotes_on_a_single_repudiating_nearest_relative() {
        let heirs = vec![
            with_children(renounced(make_lc("lc1", "Ana")), &["gc1"]),
            make_gc("gc1", "Dina"),
        ];

        let anchors =
            anchor_ids_for_category(&heirs, EffectiveCategory::LegitimateChildGroup);
        assert_eq!(anchors, vec!["gc1".to_string()]);

        let output = step2_build_lines(&Step2Input { heirs });
        assert_eq!(output.line_counts.legitimate_child, 1);
    }

    #[test]
    fn test_partial_repudiation_does_not_promote() {
        // Only a WHOLLY repudiating nearest degree promotes. One non-repudiating
        // child keeps the anchor tier at degree 1, and the grandchildren of the
        // repudiating children take nothing (Art. 977 bars representation).
        let heirs = vec![
            with_children(renounced(make_lc("lc1", "Ana")), &["gc1"]),
            with_children(renounced(make_lc("lc2", "Belen")), &["gc2"]),
            with_children(make_lc("lc3", "Carlos"), &["gc3"]),
            make_gc("gc1", "Dina"),
            make_gc("gc2", "Elena"),
            make_gc("gc3", "Fiona"),
        ];

        let anchors =
            anchor_ids_for_category(&heirs, EffectiveCategory::LegitimateChildGroup);
        assert_eq!(
            anchors,
            vec!["lc1".to_string(), "lc2".to_string(), "lc3".to_string()]
        );

        let output = step2_build_lines(&Step2Input { heirs });
        assert_eq!(output.line_counts.legitimate_child, 1);
    }

    #[test]
    fn test_fully_predeceased_degree_still_passes_per_stirpes() {
        // Predecease does NOT promote — a predeceased child with living
        // descendants still yields a representation line at degree 1.
        let heirs = vec![
            with_children(dead(make_lc("lc1", "Ana")), &["gc1"]),
            with_children(dead(make_lc("lc2", "Belen")), &["gc2"]),
            make_gc("gc1", "Dina"),
            make_gc("gc2", "Elena"),
        ];

        let anchors =
            anchor_ids_for_category(&heirs, EffectiveCategory::LegitimateChildGroup);
        assert_eq!(anchors, vec!["lc1".to_string(), "lc2".to_string()]);

        let output = step2_build_lines(&Step2Input { heirs });
        assert_eq!(output.line_counts.legitimate_child, 2);
        for gid in &["gc1", "gc2"] {
            let gc = output.heirs.iter().find(|h| h.id == *gid).unwrap();
            assert_eq!(gc.inherits_by, InheritanceMode::Representation);
        }
    }
}
