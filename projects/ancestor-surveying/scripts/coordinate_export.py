"""
Export coordinate tables in formats matching existing surveying output.
"""
import csv


def export_all_points_csv(points: list, output_path: str) -> str:
    with open(output_path, "w") as f:
        for p in points:
            desc = p.get("description", "")
            residual = p.get("residual", 0.0)
            f.write(f'{p["id"]} {p["easting"]:.4f} {p["northing"]:.4f} {residual:.4f} "{desc}"\n')
    return output_path


def export_control_points_csv(controls: list, output_path: str) -> str:
    with open(output_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["CONTROL", "NORTHING", "EASTING", "ELEVATION"])
        for c in controls:
            writer.writerow([c["name"], f'{c["northing"]:.3f}', f'{c["easting"]:.3f}', f'{c["elevation"]:.3f}'])
    return output_path


def export_lot_coords_csv(coords: list, lot_name: str, output_path: str) -> str:
    with open(output_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["LOT", "CORNER", "EASTING", "NORTHING", "MONUMENT"])
        for c in coords:
            writer.writerow([lot_name, c["corner"], f'{c["easting"]:.3f}', f'{c["northing"]:.3f}', c.get("monument", "")])
    return output_path
