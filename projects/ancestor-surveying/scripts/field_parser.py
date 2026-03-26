"""
Parse CSV field measurement files from survey equipment.

CSV format (no header): point_id, easting, northing, elevation, point_code
"""
import csv
import os
import glob


def parse_field_csv(file_path: str) -> list:
    points = []
    with open(file_path, "r") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) < 5:
                continue
            try:
                points.append({
                    "id": int(row[0].strip()),
                    "easting": float(row[1].strip()),
                    "northing": float(row[2].strip()),
                    "elevation": float(row[3].strip()),
                    "code": row[4].strip(),
                })
            except (ValueError, IndexError):
                continue
    return points


def filter_by_code(points: list, codes: list) -> list:
    return [p for p in points if p["code"] in codes]


def parse_field_directory(directory: str) -> dict:
    csv_files = glob.glob(os.path.join(directory, "**", "*.csv"), recursive=True)
    all_points = []
    seen_ids = set()
    for csv_file in csv_files:
        points = parse_field_csv(csv_file)
        for p in points:
            if p["id"] not in seen_ids:
                all_points.append(p)
                seen_ids.add(p["id"])

    control_codes = {"G1-COR", "G2-CHECKING", "G1", "G2"}
    boundary_codes = {"FC"}

    return {
        "coordinate_system": "PRS92",
        "all_points": all_points,
        "control_points": [p for p in all_points if p["code"] in control_codes],
        "boundary_corners": [p for p in all_points if p["code"] in boundary_codes],
        "line_points": [p for p in all_points if p["code"] == "FL"],
        "ground_points": [p for p in all_points if p["code"] == "G"],
    }
