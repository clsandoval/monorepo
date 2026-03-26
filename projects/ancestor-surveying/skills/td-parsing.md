# Technical Description Parsing Guide

## Philippine TD Format

A typical Philippine technical description looks like:

```
A parcel of land (Lot 5-B, Psd-04-123456), situated in Brgy. San Isidro,
Municipality of Batangas, Province of Batangas.

Beginning at corner 1, identical to corner 3 of Lot 5-A;
thence N 45°30' E, 25.00 m to corner 2;
thence S 44°30' E, 52.00 m to corner 3;
thence S 45°30' W, 25.00 m to corner 4;
thence N 44°30' W, 52.00 m to corner 1 (point of beginning).

Area: 1,300 sq.m., more or less.
```

## Key Elements
- **Lot identifier:** In parentheses at the start — lot name + plan number.
- **Location:** Municipality, province.
- **Bearings:** N/S degrees°minutes'seconds" E/W. Seconds often omitted.
- **Distances:** Always in meters.
- **Corner references:** "identical to corner X of Lot Y" — these link lots together.
- **Area:** Stated at the end, "more or less" is standard.

## Script Usage

```python
from td_parser import parse_technical_description
result = parse_technical_description(td_text)
# result = {lot_name, plan_number, stated_area, lines: [{bearing, distance, to_corner}], references}
```

## What To Watch For
- Missing seconds in bearings (assume 0)
- OCR artifacts: degree symbol replaced by 'o', apostrophe variants
- "thence" sometimes capitalized or abbreviated
- Area may use "sq.m.", "sqm", "square meters"
- References are critical — they define how lots connect
