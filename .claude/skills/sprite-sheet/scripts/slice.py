#!/usr/bin/env python3
"""Slice a master sprite sheet into individual PNGs with optional horizontal flipping."""

import argparse
import os
import sys

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow is required. Install it with: pip install Pillow", file=sys.stderr)
    sys.exit(1)


def slice_sheet(input_path: str, rows: int, cols: int, output_dir: str,
                labels: list[str] | None = None, flip: bool = False) -> list[str]:
    """Slice a sprite sheet into individual cells and optionally flip them."""
    img = Image.open(input_path)
    width, height = img.size
    cell_w = width // cols
    cell_h = height // rows

    if width % cols != 0 or height % rows != 0:
        print(f"WARNING: Sheet {width}x{height} doesn't divide evenly into {cols}x{rows} grid. "
              f"Using {cell_w}x{cell_h} cells (some edge pixels may be lost).", file=sys.stderr)

    expected_count = rows * cols
    if labels and len(labels) != expected_count:
        print(f"ERROR: Got {len(labels)} labels but grid is {rows}x{cols} = {expected_count} cells",
              file=sys.stderr)
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)
    output_files = []

    for r in range(rows):
        for c in range(cols):
            idx = r * cols + c
            label = labels[idx] if labels else f"cell_{r}_{c}"

            left = c * cell_w
            upper = r * cell_h
            right = left + cell_w
            lower = upper + cell_h

            cell = img.crop((left, upper, right, lower))
            out_path = os.path.join(output_dir, f"{label}.png")
            cell.save(out_path)
            output_files.append(out_path)
            print(f"Saved: {out_path}")

            if flip:
                flip_label = None
                if "_ne" in label:
                    flip_label = label.replace("_ne", "_nw")
                elif "_sw" in label:
                    flip_label = label.replace("_sw", "_se")
                elif "_left" in label:
                    flip_label = label.replace("_left", "_right")
                elif "_right" in label:
                    flip_label = label.replace("_right", "_left")

                if flip_label:
                    flipped = cell.transpose(Image.FLIP_LEFT_RIGHT)
                    flip_path = os.path.join(output_dir, f"{flip_label}.png")
                    flipped.save(flip_path)
                    output_files.append(flip_path)
                    print(f"Flipped: {flip_path}")

    return output_files


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Slice a master sprite sheet into individual PNGs")
    parser.add_argument("input", help="Path to the master sprite sheet PNG")
    parser.add_argument("--rows", type=int, required=True, help="Number of rows in the grid")
    parser.add_argument("--cols", type=int, required=True, help="Number of columns in the grid")
    parser.add_argument("--labels", type=str, default=None,
                        help="Comma-separated cell labels (left-to-right, top-to-bottom). "
                             "Count must match rows x cols.")
    parser.add_argument("--flip", action="store_true",
                        help="Generate horizontally flipped variants. "
                             "Renames _ne->_nw, _sw->_se, _left->_right, _right->_left.")
    parser.add_argument("-o", "--output", default="sprites/",
                        help="Output directory (default: sprites/)")
    args = parser.parse_args()

    label_list = [l.strip() for l in args.labels.split(",")] if args.labels else None
    slice_sheet(args.input, args.rows, args.cols, args.output, label_list, args.flip)
