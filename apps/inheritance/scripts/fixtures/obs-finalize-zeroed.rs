// FIXTURE — never compiled. Lives outside engine/src on purpose so cargo never
// sees it. Drives the SUBCOMPONENTS ZEROED verdict of scripts/check-observability.mjs.
//
// This is what engine/src/step10_finalize.rs looked like before Phase 5: all
// three sub-components blanked and the legitime fraction emptied, so a lawyer
// could not tell protected legitime from freely disposable pesos.

fn build_share() -> InheritanceShare {
    InheritanceShare {
        heir_id: dist.heir_id.clone(),
        heir_name,
        from_legitime: Money::new(0), // TODO: round sub-components
        from_free_portion: Money::new(0),
        from_intestate: Money::new(0),
        total: total_money,
        legitime_fraction: String::new(),
        legal_basis: dist.legal_basis.clone(),
    }
}
