"""
Scan a 7-folder survey project directory and produce structured metadata.
"""
import os
import glob
import re


def scan_project(project_dir: str) -> dict:
    project_id = os.path.basename(os.path.normpath(project_dir))

    # Subject lot XLSM files
    subject_lots = []
    client_dir = os.path.join(project_dir, "2 From Client")
    if os.path.isdir(client_dir):
        for xlsm in glob.glob(os.path.join(client_dir, "**", "*.xlsm"), recursive=True):
            filename = os.path.basename(xlsm)
            # Skip utility/check files that are not actual lot data
            if re.search(r"TD Check|Research Request", filename, re.IGNORECASE):
                continue
            lot_name = _extract_lot_name(filename)
            subject_lots.append({
                "lot_name": lot_name,
                "td_file": os.path.relpath(xlsm, project_dir),
                "filename": filename,
            })

    # Adjoining lot XLSM files
    adjoining_lots = []
    research_dir = os.path.join(project_dir, "3 Research")
    if os.path.isdir(research_dir):
        adj_dir = os.path.join(research_dir, "LDC Adjoining Lots")
        if os.path.isdir(adj_dir):
            for xlsm in glob.glob(os.path.join(adj_dir, "*.xlsm")):
                filename = os.path.basename(xlsm)
                lot_name = _extract_lot_name(filename)
                adjoining_lots.append({
                    "lot_name": lot_name,
                    "td_file": os.path.relpath(xlsm, project_dir),
                    "filename": filename,
                })

    # Field CSV files
    field_data_files = []
    field_dir = os.path.join(project_dir, "4 Field")
    if os.path.isdir(field_dir):
        for csv_file in glob.glob(os.path.join(field_dir, "**", "*.csv"), recursive=True):
            field_data_files.append(os.path.relpath(csv_file, project_dir))

    # Parent surveys from research folder
    parent_surveys = []
    if os.path.isdir(research_dir):
        for item in os.listdir(research_dir):
            item_path = os.path.join(research_dir, item)
            if os.path.isdir(item_path) and item != "LDC Adjoining Lots":
                parent_surveys.append(item)
        for pdf in glob.glob(os.path.join(research_dir, "*.pdf")):
            name = os.path.splitext(os.path.basename(pdf))[0]
            if name not in parent_surveys:
                parent_surveys.append(name)

    # Existing outputs
    existing_outputs = []
    output_dir = os.path.join(project_dir, "5 Reports and Drafting")
    if os.path.isdir(output_dir):
        for f in glob.glob(os.path.join(output_dir, "**", "*.pdf"), recursive=True):
            existing_outputs.append(os.path.relpath(f, project_dir))
        for f in glob.glob(os.path.join(output_dir, "**", "*.dwg"), recursive=True):
            existing_outputs.append(os.path.relpath(f, project_dir))

    # Infer project type
    has_field = len(field_data_files) > 0
    has_tds = len(subject_lots) > 0
    project_type = "relocation" if has_field and has_tds else "boundary" if has_tds else "unknown"

    return {
        "project_id": project_id,
        "project_type": project_type,
        "subject_lots": subject_lots,
        "adjoining_lots": adjoining_lots,
        "field_data_files": field_data_files,
        "parent_surveys": parent_surveys,
        "existing_outputs": existing_outputs,
        "status": "scanned",
    }


def _extract_lot_name(filename: str) -> str:
    name = os.path.splitext(filename)[0]
    match = re.match(r"(LOT\s+[\w\-]+)", name, re.IGNORECASE)
    if match:
        return match.group(1)
    return name
