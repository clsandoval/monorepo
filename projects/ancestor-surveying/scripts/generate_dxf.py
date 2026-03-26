"""
Generate AutoCAD-compatible .dxf boundary plan files.

Produces a DXF with:
  - BOUNDARY layer: closed polygon of the lot boundary
  - LABELS layer: corner numbers, bearing-distance annotations on each line
  - ANNOTATIONS layer: lot name, plan number, area
"""
import math
import ezdxf


def _midpoint(p1: tuple, p2: tuple) -> tuple:
    return ((p1[0] + p2[0]) / 2.0, (p1[1] + p2[1]) / 2.0)


def _line_angle(p1: tuple, p2: tuple) -> float:
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    return math.degrees(math.atan2(dy, dx))


def generate_boundary_plan(
    lot_data: dict,
    output_path: str,
    neighbor_lots: list = None,
    discrepancies: list = None,
) -> str:
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()

    doc.layers.add("BOUNDARY", color=7)
    doc.layers.add("LABELS", color=3)
    doc.layers.add("ANNOTATIONS", color=1)
    if neighbor_lots:
        doc.layers.add("NEIGHBORS", color=8)

    coords = lot_data["coords"]
    n = len(coords)

    # Draw boundary polygon
    points = list(coords) + [coords[0]]
    for i in range(len(points) - 1):
        msp.add_line(points[i], points[i + 1], dxfattribs={"layer": "BOUNDARY"})

    # Corner markers and labels
    text_height = _compute_text_height(coords)
    marker_size = text_height * 0.3
    for i, (e, n_coord) in enumerate(coords):
        corner_num = i + 1
        msp.add_line(
            (e - marker_size, n_coord), (e + marker_size, n_coord),
            dxfattribs={"layer": "LABELS"},
        )
        msp.add_line(
            (e, n_coord - marker_size), (e, n_coord + marker_size),
            dxfattribs={"layer": "LABELS"},
        )
        msp.add_text(
            str(corner_num),
            height=text_height,
            dxfattribs={"layer": "LABELS"},
        ).set_placement((e + marker_size * 1.5, n_coord + marker_size * 1.5))

    # Bearing-distance labels on each line
    lines = lot_data.get("lines", [])
    for i, line in enumerate(lines):
        j = (i + 1) % n
        mid = _midpoint(coords[i], coords[j])
        angle = _line_angle(coords[i], coords[j])
        offset_dist = text_height * 1.2
        perp_angle = math.radians(angle + 90)
        text_pos = (
            mid[0] + offset_dist * math.cos(perp_angle),
            mid[1] + offset_dist * math.sin(perp_angle),
        )
        label = f"{line['bearing_text']}, {line['distance']:.2f} m"
        text_entity = msp.add_text(
            label,
            height=text_height * 0.7,
            rotation=angle if -90 <= angle <= 90 else angle + 180,
            dxfattribs={"layer": "LABELS"},
        )
        text_entity.set_placement(text_pos)

    # Lot name and area annotation (centered)
    centroid = (
        sum(c[0] for c in coords) / n,
        sum(c[1] for c in coords) / n,
    )
    msp.add_text(
        lot_data["lot_name"],
        height=text_height * 1.5,
        dxfattribs={"layer": "ANNOTATIONS"},
    ).set_placement(centroid)
    msp.add_text(
        f"{lot_data['plan_number']}",
        height=text_height * 0.8,
        dxfattribs={"layer": "ANNOTATIONS"},
    ).set_placement((centroid[0], centroid[1] - text_height * 2))
    msp.add_text(
        f"Area: {lot_data['area_sqm']:,.0f} sq.m.",
        height=text_height * 0.8,
        dxfattribs={"layer": "ANNOTATIONS"},
    ).set_placement((centroid[0], centroid[1] - text_height * 4))

    # Neighbor lots
    if neighbor_lots:
        for nb in neighbor_lots:
            nb_coords = nb["coords"]
            nb_points = list(nb_coords) + [nb_coords[0]]
            for i in range(len(nb_points) - 1):
                msp.add_line(
                    nb_points[i], nb_points[i + 1],
                    dxfattribs={"layer": "NEIGHBORS"},
                )
            nb_centroid = (
                sum(c[0] for c in nb_coords) / len(nb_coords),
                sum(c[1] for c in nb_coords) / len(nb_coords),
            )
            msp.add_text(
                nb["lot_name"],
                height=text_height,
                dxfattribs={"layer": "NEIGHBORS"},
            ).set_placement(nb_centroid)

    # Discrepancy annotations
    if discrepancies:
        for disc in discrepancies:
            pos = disc.get("position", centroid)
            msp.add_text(
                disc["text"],
                height=text_height * 0.6,
                dxfattribs={"layer": "ANNOTATIONS", "color": 1},
            ).set_placement(pos)

    doc.saveas(output_path)
    return output_path


def _compute_text_height(coords: list) -> float:
    es = [c[0] for c in coords]
    ns = [c[1] for c in coords]
    extent = max(max(es) - min(es), max(ns) - min(ns))
    return max(0.5, extent / 40.0)


def generate_consolidated_plan(lots: list, output_path: str, project_id: str = "") -> str:
    """Generate a consolidated DXF with all lots on one plan."""
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()
    doc.layers.add("BOUNDARY", color=7)
    doc.layers.add("LABELS", color=3)
    doc.layers.add("ANNOTATIONS", color=1)

    all_coords = []
    for lot_data in lots:
        coords = lot_data["coords"]
        all_coords.extend(coords)
        n = len(coords)
        # Boundary polygon
        points = list(coords) + [coords[0]]
        for i in range(len(points) - 1):
            msp.add_line(points[i], points[i + 1], dxfattribs={"layer": "BOUNDARY"})
        # Corner markers
        text_height = _compute_text_height(coords)
        marker_size = text_height * 0.3
        for i, (e, n_coord) in enumerate(coords):
            msp.add_line((e - marker_size, n_coord), (e + marker_size, n_coord), dxfattribs={"layer": "LABELS"})
            msp.add_line((e, n_coord - marker_size), (e, n_coord + marker_size), dxfattribs={"layer": "LABELS"})
        # Lot label
        centroid = (sum(c[0] for c in coords) / n, sum(c[1] for c in coords) / n)
        msp.add_text(lot_data["lot_name"], height=text_height, dxfattribs={"layer": "ANNOTATIONS"}).set_placement(centroid)
        if lot_data.get("area_sqm"):
            msp.add_text(f"Area: {lot_data['area_sqm']:,.0f} sq.m.", height=text_height * 0.6, dxfattribs={"layer": "ANNOTATIONS"}).set_placement((centroid[0], centroid[1] - text_height * 1.5))

    # Project title
    if project_id and all_coords:
        overall_th = _compute_text_height(all_coords)
        max_n = max(c[1] for c in all_coords)
        mid_e = (min(c[0] for c in all_coords) + max(c[0] for c in all_coords)) / 2
        msp.add_text(f"Project: {project_id}", height=overall_th * 2, dxfattribs={"layer": "ANNOTATIONS"}).set_placement((mid_e, max_n + overall_th * 5))

    doc.saveas(output_path)
    return output_path
