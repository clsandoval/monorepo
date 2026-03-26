"""
Convert bearing-distance sequences into XY coordinates.

Bearings use Philippine surveying convention:
  N/S angle E/W → quadrant bearing measured from N or S toward E or W.

Converted to azimuth (clockwise from north):
  NE: azimuth = angle
  SE: azimuth = 180 - angle
  SW: azimuth = 180 + angle
  NW: azimuth = 360 - angle

Coordinates: (easting, northing) in meters.
  easting += distance * sin(azimuth)
  northing += distance * cos(azimuth)
"""
import math


def bearing_to_azimuth(bearing: dict) -> float:
    """Convert a quadrant bearing dict to azimuth in decimal degrees."""
    angle = bearing["degrees"] + bearing["minutes"] / 60.0 + bearing["seconds"] / 3600.0
    ns, ew = bearing["ns"], bearing["ew"]
    if ns == "N" and ew == "E":
        return angle
    elif ns == "S" and ew == "E":
        return 180.0 - angle
    elif ns == "S" and ew == "W":
        return 180.0 + angle
    elif ns == "N" and ew == "W":
        return 360.0 - angle
    else:
        raise ValueError(f"Invalid bearing quadrant: {ns} {ew}")


def compute_coordinates(lines: list, origin: tuple = (0.0, 0.0)) -> list:
    """
    Compute XY coordinates from a sequence of bearing-distance lines.

    Args:
        lines: List of dicts with 'bearing' and 'distance' keys.
        origin: (easting, northing) of the starting point.

    Returns:
        List of (easting, northing) tuples, starting with origin
        and ending with the computed return-to-start point.
    """
    coords = [origin]
    e, n = origin
    for line in lines:
        azimuth_deg = bearing_to_azimuth(line["bearing"])
        azimuth_rad = math.radians(azimuth_deg)
        dist = line["distance"]
        e += dist * math.sin(azimuth_rad)
        n += dist * math.cos(azimuth_rad)
        coords.append((e, n))
    return coords
