#!/usr/bin/env python3
"""Generate the coverage corpus — the heir shapes generate-fuzz-cases.py cannot reach.

The original property generator (examples/generate-fuzz-cases.py, SEED = 20260224) is
deterministic and its 100 committed outputs are byte-stable. Adding a generator function to
that file would shift its random stream and rewrite the whole corpus, so this is a *second*
generator with its own seed writing to its own directory. Zero churn on fuzz-cases/.

Measured gap this closes (see .planning/phases/06-property-test-coverage-depth/06-RESEARCH.md
sections 2.2-2.3, taken over all 140 previously committed inputs):

  - NephewNiece            appeared in 0 files
  - LegitimatedChild       appeared in 0 files
  - LegitimateAscendant    appeared in 0 files
  - OtherCollateral        appeared in 0 files
  - Stranger               appeared in 0 files

Every shape emitted here was run through engine/target/release/inheritance-engine during
planning and conserves the estate with no duplicate heir rows ("Group A" in the research doc).
Shapes that break sum conservation today live in examples/defect-cases/ instead, with their
exact observed numbers frozen in engine/defect-baseline.json.

Usage:
    python3 examples/generate-coverage-cases.py
"""
import json
import os
import random

CASES_DIR = "./examples/coverage-cases"
SEED = 20260731  # Fixed seed, deliberately different from generate-fuzz-cases.py
os.makedirs(CASES_DIR, exist_ok=True)

rng = random.Random(SEED)

# ── Name pools ──────────────────────────────────────────────────────

FIRST_NAMES = [
    "Ana", "Ben", "Carlos", "Diana", "Eduardo", "Fatima", "Gabriel", "Helena",
    "Ivan", "Julia", "Kevin", "Lorna", "Miguel", "Nora", "Oscar", "Patricia",
    "Quintin", "Rosa", "Sandra", "Tomas", "Ursela", "Victor", "Wendy", "Xavier",
    "Yolanda", "Zenaida", "Amara", "Bruno", "Celine", "Dante",
]
LAST_NAMES = [
    "Santos", "Reyes", "Cruz", "Garcia", "Mendoza", "Torres", "Lopez",
    "Gonzales", "Ramos", "Aquino",
]

# Copied field-for-field from examples/cases/17-adopted-child.json. An AdoptedChild whose
# `adoption` is null was measured to receive 0 centavos while its legitimate siblings split the
# whole estate, with no warning — see 06-RESEARCH.md section 2.6. This is an input-completeness
# fact, not a legal reading.
ADOPTION_TEMPLATE = {
    "decree_date": "2015-01-01",
    "regime": "Ra8552",
    "adopter": "d",
    "adoptee": None,
    "is_stepparent_adoption": False,
    "biological_parent_spouse": None,
    "is_rescinded": False,
    "rescission_date": None,
}

# ── Helper builders ─────────────────────────────────────────────────

def rand_name():
    return f"{rng.choice(FIRST_NAMES)} {rng.choice(LAST_NAMES)}"

def pesos(p):
    return {"centavos": p * 100}

def rand_estate():
    """Random estate between 100,000 and 100,000,000 pesos."""
    return rng.choice([
        rng.randint(1000, 10000) * 100,           # 100K - 1M
        rng.randint(10000, 100000) * 100,          # 1M - 10M
        rng.randint(100000, 1000000) * 100,        # 10M - 100M
    ])

def decedent(name, married=False, articulo_mortis=False, ill=False,
             illness_death=False, cohab=0, legal_sep=False):
    return {
        "id": "d", "name": name, "date_of_death": "2026-01-15",
        "is_married": married,
        "date_of_marriage": "2000-01-01" if married else None,
        "marriage_solemnized_in_articulo_mortis": articulo_mortis,
        "was_ill_at_marriage": ill,
        "illness_caused_death": illness_death,
        "years_of_cohabitation": cohab,
        "has_legal_separation": legal_sep,
        "is_illegitimate": False,
    }

def person(pid, name, rel, alive=True, children=None, degree=None,
           filiation_proof=None, blood=None, renounced=False, line=None,
           adoption=None):
    deg = degree
    if deg is None:
        deg = {
            "LegitimateChild": 1, "LegitimatedChild": 1, "AdoptedChild": 1,
            "IllegitimateChild": 1, "SurvivingSpouse": 1, "LegitimateParent": 1,
            "LegitimateAscendant": 2, "Sibling": 2, "NephewNiece": 3,
            "OtherCollateral": 4, "Stranger": 0,
        }.get(rel, 1)
    return {
        "id": pid, "name": name, "is_alive_at_succession": alive,
        "relationship_to_decedent": rel, "degree": deg, "line": line,
        "children": children or [], "filiation_proved": True,
        "filiation_proof_type": filiation_proof,
        "is_guilty_party_in_legal_separation": False,
        "adoption": adoption, "is_unworthy": False, "unworthiness_condoned": False,
        "has_renounced": renounced, "blood_type": blood,
    }

def heir_ref(pid, name):
    return {"person_id": pid, "name": name, "is_collective": False, "class_designation": None}

def stranger_ref(name):
    return {"person_id": None, "name": name, "is_collective": False, "class_designation": None}

def donation(did, recipient, amount_pesos, exempt=False, is_stranger=False):
    return {
        "id": did, "recipient_heir_id": recipient, "recipient_is_stranger": is_stranger,
        "value_at_time_of_donation": pesos(amount_pesos), "date": "2020-01-01",
        "description": "advance on inheritance", "is_expressly_exempt": exempt,
        "is_support_education_medical": False, "is_customary_gift": False,
        "is_professional_expense": False, "professional_expense_parent_required": False,
        "professional_expense_imputed_savings": None, "is_joint_from_both_parents": False,
        "is_to_child_spouse_only": False, "is_joint_to_child_and_spouse": False,
        "is_wedding_gift": False, "is_debt_payment_for_child": False,
        "is_election_expense": False, "is_fine_payment": False,
    }

def case(estate_pesos, dec, family, w=None, donations=None):
    return {
        "net_distributable_estate": pesos(estate_pesos),
        "decedent": dec,
        "family_tree": family,
        "will": w,
        "donations": donations or [],
        "config": {"retroactive_ra_11642": False, "max_pipeline_restarts": 10},
    }

def gen_spouse():
    return person("sp", rand_name(), "SurvivingSpouse")

# ── Shape generators ────────────────────────────────────────────────
# Each corresponds to one row of the "Group A" table in 06-RESEARCH.md section 2.4.

def gen_nephews_representing():
    """1 living full-blood Sibling + 1 predeceased Sibling with 1-3 nephews."""
    n_nephews = rng.randint(1, 3)
    nephew_ids = [f"n{i+1}" for i in range(n_nephews)]
    family = [
        person("sib1", rand_name(), "Sibling", blood="Full"),
        person("sib2", rand_name(), "Sibling", alive=False, children=nephew_ids),
    ]
    # blood_type stays None on the nephews: with a blood_type set, this exact family
    # duplicates every nephew row and loses 20% of the estate (LAW-02, see defect-cases/).
    for nid in nephew_ids:
        family.append(person(nid, rand_name(), "NephewNiece", blood=None))
    dec = decedent(rand_name(), married=False)
    return f"nephews-representing-{n_nephews}nn", case(rand_estate(), dec, family)

def gen_nephews_only():
    """All siblings predeceased; 1-4 nephews inherit in their own right."""
    n_nephews = rng.randint(1, 4)
    nephew_ids = [f"n{i+1}" for i in range(n_nephews)]
    # Split the nephews across one or two predeceased siblings.
    n_siblings = 1 if n_nephews < 3 else 2
    family = []
    for s in range(n_siblings):
        assigned = nephew_ids[s::n_siblings]
        family.append(person(f"sib{s+1}", rand_name(), "Sibling", alive=False,
                             children=assigned))
    for nid in nephew_ids:
        family.append(person(nid, rand_name(), "NephewNiece", blood=None))
    dec = decedent(rand_name(), married=False)
    return f"nephews-only-{n_siblings}dead-sib-{n_nephews}nn", case(rand_estate(), dec, family)

def gen_nephews_with_spouse():
    """gen_nephews_representing plus a surviving spouse."""
    n_nephews = rng.randint(1, 3)
    nephew_ids = [f"n{i+1}" for i in range(n_nephews)]
    family = [
        person("sib1", rand_name(), "Sibling", blood="Full"),
        person("sib2", rand_name(), "Sibling", alive=False, children=nephew_ids),
    ]
    for nid in nephew_ids:
        family.append(person(nid, rand_name(), "NephewNiece", blood=None))
    family.append(gen_spouse())
    dec = decedent(rand_name(), married=True)
    return f"nephews-with-spouse-{n_nephews}nn", case(rand_estate(), dec, family)

def gen_sibling_renounces():
    """2 living siblings, one renounces. Renunciation is NOT a representation trigger."""
    nephew_ids = ["n1"]
    family = [
        person("sib1", rand_name(), "Sibling", blood="Full", renounced=True,
               children=nephew_ids),
        person("sib2", rand_name(), "Sibling", blood="Full"),
        person("n1", rand_name(), "NephewNiece", blood=None),
    ]
    dec = decedent(rand_name(), married=False)
    return "sibling-renounces-1nn", case(rand_estate(), dec, family)

def gen_other_collateral():
    """1-3 OtherCollateral heirs at degree 4, no closer relative alive."""
    n = rng.randint(1, 3)
    family = [person(f"oc{i+1}", rand_name(), "OtherCollateral", degree=4)
              for i in range(n)]
    dec = decedent(rand_name(), married=False)
    return f"other-collateral-{n}oc", case(rand_estate(), dec, family)

def gen_ascendants_above_parent():
    """2 LegitimateAscendant at degree 2 (grandparents), no parents alive."""
    has_spouse = rng.choice([True, False])
    family = [
        person("asc1", rand_name(), "LegitimateAscendant", degree=2, line="Paternal"),
        person("asc2", rand_name(), "LegitimateAscendant", degree=2, line="Maternal"),
    ]
    if has_spouse:
        family.append(gen_spouse())
    dec = decedent(rand_name(), married=has_spouse)
    desc = "ascendants-grandparents" + ("-sp" if has_spouse else "")
    return desc, case(rand_estate(), dec, family)

def gen_legitimated_child():
    """1-3 LegitimatedChild heirs, plus a Stranger bystander who inherits nothing.

    The Stranger row is deliberate: `Stranger` is the eleventh Relationship variant and
    appeared in zero of the 140 previously committed inputs. A Stranger in the family tree
    is a non-heir bystander — measured to leave the distribution and the estate sum
    completely unchanged — so it closes the variant gap without perturbing any shape.
    """
    n = rng.randint(1, 3)
    family = [person(f"lg{i+1}", rand_name(), "LegitimatedChild") for i in range(n)]
    family.append(person("str1", rand_name(), "Stranger", degree=0))
    dec = decedent(rand_name(), married=False)
    return f"legitimated-{n}lg-stranger-bystander", case(rand_estate(), dec, family)

def gen_adopted_with_legitimate():
    """1 AdoptedChild (adoption object populated) + 1-3 LegitimateChild."""
    n_lc = rng.randint(1, 3)
    family = [person(f"lc{i+1}", rand_name(), "LegitimateChild") for i in range(n_lc)]
    adoption = dict(ADOPTION_TEMPLATE)
    adoption["adoptee"] = "ac1"
    adoption["adopter"] = "d"
    family.append(person("ac1", rand_name(), "AdoptedChild", adoption=adoption))
    dec = decedent(rand_name(), married=False)
    return f"adopted-plus-{n_lc}lc", case(rand_estate(), dec, family)

def gen_heir_donation_at_or_below_one():
    """2 legitimate children, one donation to a child at 60-100% of the estate.

    With exactly 2 children a ratio <= 1.0 conserves the estate (Group A, 06-RESEARCH.md
    section 2.4). Ratio > 1.0 does not — that is LAW-06 and lives in
    examples/defect-cases/02-heir-donation-above-estate.json.

    The child count is pinned to 2 on purpose. Measured while executing plan 06-01: with
    *3* children the same donation breaks sum conservation from ratio 0.6 upward
    (E = 100,000,000 centavos, ratio 0.6 -> per-heir total 106,666,666). That is the same
    LAW-06 mechanism at a lower ratio, not a new defect, and it belongs in the defect corpus
    rather than the asserting one. Recorded in 06-01-SUMMARY.md.
    """
    n_lc = 2
    family = [person(f"lc{i+1}", rand_name(), "LegitimateChild") for i in range(n_lc)]
    estate = rand_estate()
    ratio = rng.choice([0.60, 0.75, 0.90, 1.00])
    amount = int(estate * ratio)
    dons = [donation("don1", "lc1", amount, is_stranger=False)]
    dec = decedent(rand_name(), married=False)
    desc = f"heir-donation-ratio{int(ratio * 100):03d}-{n_lc}lc"
    return desc, case(estate, dec, family, donations=dons)

# ── Main generation ─────────────────────────────────────────────────

GENERATORS = [
    (gen_nephews_representing, 5),
    (gen_nephews_only, 4),
    (gen_nephews_with_spouse, 3),
    (gen_sibling_renounces, 3),
    (gen_other_collateral, 3),
    (gen_ascendants_above_parent, 4),
    (gen_legitimated_child, 2),
    (gen_adopted_with_legitimate, 3),
    (gen_heir_donation_at_or_below_one, 3),
]

def main():
    for f in os.listdir(CASES_DIR):
        if f.endswith(".json"):
            os.remove(os.path.join(CASES_DIR, f))

    case_num = 0
    for gen_fn, count in GENERATORS:
        for _ in range(count):
            case_num += 1
            desc, data = gen_fn()
            filename = f"{case_num:03d}-{desc}.json"
            filepath = os.path.join(CASES_DIR, filename)
            with open(filepath, "w") as f:
                json.dump(data, f, indent=2)

    print(f"Generated {case_num} coverage cases in {CASES_DIR}/")

if __name__ == "__main__":
    main()
