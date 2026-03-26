"""
Parse Philippine-style technical descriptions into structured data.

Input: Raw text of a technical description from a land title.
Output: Dict with lot_name, plan_number, stated_area, lines (bearing/distance/corner),
        and references (corner identity links to other lots).

Philippine TD format:
  "thence N 45°30' E, 25.00 m to corner 2;"
  Bearing: N/S degrees°minutes'seconds" E/W
  Distance: meters
  Corner: integer
"""
import re


def parse_bearing(text: str) -> dict:
    """Parse a bearing string like "N 45°30' E" into components."""
    pattern = r"([NS])\s*(\d+)[°]\s*(\d+)['](?:\s*(\d+)[\"])?\s*([EW])"
    match = re.search(pattern, text)
    if not match:
        raise ValueError(f"Cannot parse bearing from: {text}")
    return {
        "degrees": int(match.group(2)),
        "minutes": int(match.group(3)),
        "seconds": int(match.group(4)) if match.group(4) else 0,
        "ns": match.group(1),
        "ew": match.group(5),
    }


def parse_line(text: str) -> dict:
    """Parse a single TD line into bearing, distance, and corner number."""
    bearing = parse_bearing(text)
    dist_match = re.search(r"([\d.]+)\s*m\b", text)
    if not dist_match:
        raise ValueError(f"Cannot parse distance from: {text}")
    corner_match = re.search(r"to\s+corner\s+(\d+)", text)
    if not corner_match:
        raise ValueError(f"Cannot parse corner from: {text}")
    return {
        "bearing": bearing,
        "distance": float(dist_match.group(1)),
        "to_corner": int(corner_match.group(1)),
    }


def parse_technical_description(text: str) -> dict:
    """Parse a full technical description into structured data."""
    # Extract lot name and plan number
    lot_match = re.search(r"\(([^,)]+),\s*([^)]+)\)", text)
    lot_name = lot_match.group(1).strip() if lot_match else None
    plan_number = lot_match.group(2).strip() if lot_match else None

    # Extract stated area
    area_match = re.search(r"Area:\s*([\d,]+(?:\.\d+)?)\s*sq\.?\s*m", text)
    stated_area = float(area_match.group(1).replace(",", "")) if area_match else None

    # Extract references (e.g., "identical to corner 3 of Lot 5-A")
    references = []
    ref_pattern = r"corner\s+(\d+),?\s*identical\s+to\s+corner\s+(\d+)\s+of\s+([\w\s\-]+?)(?:[;,.]|\s*$)"
    for match in re.finditer(ref_pattern, text, re.IGNORECASE):
        references.append({
            "corner": int(match.group(1)),
            "identical_to_corner": int(match.group(2)),
            "identical_to_lot": match.group(3).strip(),
        })

    # Extract bearing-distance lines
    lines = []
    line_pattern = r"thence\s+[NS].*?to\s+corner\s+\d+.*?[;.]"
    for match in re.finditer(line_pattern, text, re.IGNORECASE):
        lines.append(parse_line(match.group(0)))

    return {
        "lot_name": lot_name,
        "plan_number": plan_number,
        "stated_area": stated_area,
        "lines": lines,
        "references": references,
    }
