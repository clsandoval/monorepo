#!/usr/bin/env python3
"""Report which heir shapes the committed corpus actually reaches.

Read-only. Writes no file, takes no flag, has no --update / --fix / --accept escape hatch —
a check that can rewrite its own input is not a check.

Exists so a reader can confirm in one command that the coverage claim of plan 06-01 holds,
and so a later phase can see at a glance which shapes exist. Before this phase, five of the
eleven Relationship variants appeared nowhere in the 140 committed inputs, no file contained
a stranger donee, and the maximum donation/estate ratio across the whole corpus was 0.5524.

Usage:
    cd engine && python3 examples/report-corpus-shapes.py
Exit 0 when all eleven variants are PRESENT and defect-cases reaches a ratio >= 1.0,
exit 1 otherwise.
"""
import json
import os
import sys

CORPUS_DIRS = [
    "./examples/cases",
    "./examples/fuzz-cases",
    "./examples/coverage-cases",
    "./examples/defect-cases",
]

# The Relationship enum, in declaration order, from engine/src/types.rs:96-108.
RELATIONSHIP_VARIANTS = [
    "LegitimateChild",
    "LegitimatedChild",
    "AdoptedChild",
    "IllegitimateChild",
    "SurvivingSpouse",
    "LegitimateParent",
    "LegitimateAscendant",
    "Sibling",
    "NephewNiece",
    "OtherCollateral",
    "Stranger",
]


def load_dir(path):
    """Return [(filename, parsed_json)] for every .json in path, sorted by name."""
    out = []
    if not os.path.isdir(path):
        return out
    for name in sorted(os.listdir(path)):
        if not name.endswith(".json"):
            continue
        with open(os.path.join(path, name)) as fh:
            out.append((name, json.load(fh)))
    return out


def estate_centavos(case):
    return int(case.get("net_distributable_estate", {}).get("centavos", 0) or 0)


def max_donation_ratio(cases):
    """Largest (total donations / estate) ratio in a set of cases, None when no donation.

    Totalled per case rather than per donation, which is how the 0.5524 corpus baseline in
    .planning/research/LEGAL-CONFORMANCE.md line 76 was computed — so this number stays
    directly comparable to the figure this phase set out to move.
    """
    best = None
    for _name, case in cases:
        estate = estate_centavos(case)
        if estate <= 0:
            continue
        donations = case.get("donations") or []
        if not donations:
            continue
        total = sum(
            int(d.get("value_at_time_of_donation", {}).get("centavos", 0) or 0)
            for d in donations
        )
        ratio = total / estate
        if best is None or ratio > best:
            best = ratio
    return best


def main():
    corpora = {d: load_dir(d) for d in CORPUS_DIRS}

    print("== File counts ==")
    total_files = 0
    for d in CORPUS_DIRS:
        n = len(corpora[d])
        total_files += n
        print(f"  {d:34s} {n:4d}")
    print(f"  {'TOTAL':34s} {total_files:4d}")

    print()
    print("== relationship_to_decedent histogram (all family_tree entries) ==")
    histogram = {}
    for cases in corpora.values():
        for _name, case in cases:
            for member in case.get("family_tree") or []:
                rel = member.get("relationship_to_decedent")
                histogram[rel] = histogram.get(rel, 0) + 1
    for rel, count in sorted(histogram.items(), key=lambda kv: (-kv[1], kv[0])):
        print(f"  {rel:24s} {count:5d}")

    print()
    print("== Relationship variant coverage (enum order) ==")
    absent = []
    for variant in RELATIONSHIP_VARIANTS:
        present = histogram.get(variant, 0) > 0
        if not present:
            absent.append(variant)
        print(f"  {variant:24s} {'PRESENT' if present else 'ABSENT'}")

    print()
    print("== Maximum donation/estate ratio per directory ==")
    ratios = {}
    for d in CORPUS_DIRS:
        ratio = max_donation_ratio(corpora[d])
        ratios[d] = ratio
        shown = "n/a (no donations)" if ratio is None else f"{ratio:.4f}"
        print(f"  {d:34s} {shown}")

    print()
    stranger_files = []
    for d, cases in corpora.items():
        for name, case in cases:
            for don in case.get("donations") or []:
                if don.get("recipient_is_stranger") is True:
                    stranger_files.append(f"{d}/{name}")
                    break
    print(f"== Files with a stranger donee: {len(stranger_files)} ==")
    for f in stranger_files:
        print(f"  {f}")

    defect_ratio = ratios.get("./examples/defect-cases")
    ratio_ok = defect_ratio is not None and defect_ratio >= 1.0

    print()
    if not absent:
        print("All 11 Relationship variants PRESENT")
    else:
        print(f"MISSING variants: {', '.join(absent)}")
    if ratio_ok:
        print(f"defect-cases max donation/estate ratio {defect_ratio:.4f} >= 1.0000")
    else:
        shown = "n/a" if defect_ratio is None else f"{defect_ratio:.4f}"
        print(f"defect-cases max donation/estate ratio {shown} is below 1.0000")

    if not absent and ratio_ok:
        print("CORPUS SHAPES OK")
        return 0
    print("CORPUS SHAPES INCOMPLETE")
    return 1


if __name__ == "__main__":
    sys.exit(main())
