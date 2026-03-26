import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from subdivision_tree import build_tree, compute_seniority, validate_area_sums

def test_build_tree_basic():
    lots = [
        {"lot_name": "LOT 42-A", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25520},
        {"lot_name": "LOT 42-B", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25001},
    ]
    tree = build_tree(lots)
    assert "PSD-(AF)-02-047911 (AR)" in [n["survey"] for n in tree["surveys"]]

def test_build_tree_groups_by_survey():
    lots = [
        {"lot_name": "LOT 42-A", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25520},
        {"lot_name": "LOT 42-B", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25001},
        {"lot_name": "LOT 40-A", "survey_number": "CSD-2-02-005396-D", "stated_area": 55920},
        {"lot_name": "LOT 40-B", "survey_number": "CSD-2-02-005396-D", "stated_area": 55848},
    ]
    tree = build_tree(lots)
    survey_names = [n["survey"] for n in tree["surveys"]]
    assert "PSD-(AF)-02-047911 (AR)" in survey_names
    assert "CSD-2-02-005396-D" in survey_names

def test_build_tree_children():
    lots = [
        {"lot_name": "LOT 42-A", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25520},
        {"lot_name": "LOT 42-B", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25001},
    ]
    tree = build_tree(lots)
    survey = [s for s in tree["surveys"] if s["survey"] == "PSD-(AF)-02-047911 (AR)"][0]
    child_names = [c["lot_name"] for c in survey["lots"]]
    assert "LOT 42-A" in child_names
    assert "LOT 42-B" in child_names

def test_compute_seniority():
    lots = [
        {"lot_name": "LOT 42-A", "survey_number": "PSD-(AF)-02-047911 (AR)", "date_of_original_survey": "2003"},
        {"lot_name": "LOT 30", "survey_number": "GSS-380", "date_of_original_survey": "Jan. 19, 1959"},
    ]
    chain = compute_seniority(lots)
    gss = [c for c in chain if c["survey"] == "GSS-380"][0]
    psd = [c for c in chain if c["survey"] == "PSD-(AF)-02-047911 (AR)"][0]
    assert gss["rank"] < psd["rank"]

def test_area_sum_validation():
    lots = [
        {"lot_name": "LOT 42-A", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25520},
        {"lot_name": "LOT 42-B", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25001},
    ]
    results = validate_area_sums(lots)
    assert len(results) > 0
    assert results[0]["survey"] == "PSD-(AF)-02-047911 (AR)"
    assert results[0]["total_area"] == 50521
