"""
Build lot hierarchy from parsed TD data.
Groups lots by survey number, computes seniority from dates,
and validates area sums within subdivision groups.
"""
import re
from collections import defaultdict


def build_tree(lots: list) -> dict:
    groups = defaultdict(list)
    for lot in lots:
        survey = lot.get("survey_number", "unknown")
        groups[survey].append({
            "lot_name": lot["lot_name"],
            "stated_area": lot.get("stated_area", 0),
        })
    surveys = []
    for survey_name, lot_list in groups.items():
        surveys.append({
            "survey": survey_name,
            "lots": lot_list,
            "total_area": sum(l["stated_area"] for l in lot_list),
            "lot_count": len(lot_list),
        })
    return {"surveys": surveys}


def compute_seniority(lots: list) -> list:
    surveys = {}
    for lot in lots:
        survey = lot.get("survey_number", "unknown")
        if survey not in surveys:
            date_str = lot.get("date_of_original_survey", "")
            year = _extract_year(date_str)
            surveys[survey] = year
    sorted_surveys = sorted(surveys.items(), key=lambda x: x[1] if x[1] else 9999)
    chain = []
    current_rank = 1
    prev_year = None
    for survey_name, year in sorted_surveys:
        if prev_year is not None and year != prev_year:
            current_rank += 1
        chain.append({"survey": survey_name, "year": year, "rank": current_rank})
        prev_year = year
    return chain


def validate_area_sums(lots: list) -> list:
    groups = defaultdict(list)
    for lot in lots:
        survey = lot.get("survey_number", "unknown")
        groups[survey].append(lot)
    results = []
    for survey_name, lot_list in groups.items():
        total = sum(l.get("stated_area", 0) for l in lot_list)
        results.append({
            "survey": survey_name,
            "lot_count": len(lot_list),
            "total_area": total,
            "lots": [{"lot_name": l["lot_name"], "area": l.get("stated_area", 0)} for l in lot_list],
        })
    return results


def _extract_year(date_str: str) -> int:
    if not date_str:
        return 0
    match = re.search(r"\b(19|20)\d{2}\b", str(date_str))
    if match:
        return int(match.group(0))
    return 0
