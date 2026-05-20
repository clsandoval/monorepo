"""Reparse previously saved Booking + Agoda HTML for prices.

Outputs per-block, per-city, top-5 cheapest listings (1 adult, total NZD for the stay).
Filters: prefer rooms tagged 'private bathroom' or with private-bath keyword.
"""
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

OUT = Path(__file__).parent / "scan_out"
BLOCKS = ["A_early", "B_suntosun", "C_late"]
CITIES = ["Wanaka", "Queenstown"]
NIGHTS = {
    ("A_early", "Wanaka"): 8,
    ("A_early", "Queenstown"): 6,
    ("B_suntosun", "Wanaka"): 8,
    ("B_suntosun", "Queenstown"): 6,
    ("C_late", "Wanaka"): 8,
    ("C_late", "Queenstown"): 6,
}

PRIVATE_HINTS = re.compile(r"private bathroom|en-?suite|studio|hotel room|king|queen", re.I)
SHARED_HINTS = re.compile(r"\b(dorm|dormitory|bed in|shared|bunk)\b", re.I)


def parse_booking(html: str, nights: int) -> list[dict]:
    s = BeautifulSoup(html, "html.parser")
    out = []
    for card in s.select('[data-testid="property-card"]'):
        title_el = card.select_one('[data-testid="title"]')
        if not title_el:
            continue
        name = title_el.get_text(strip=True)
        # availability-single contains room type + total price
        for unit in card.select('[data-testid="availability-single"]'):
            txt = unit.get_text(" ", strip=True).replace("\xa0", " ")
            # Extract "Price NZD 383" (final price)
            m = re.search(r"Price\s+NZD\s+([\d,]+)", txt)
            if not m:
                m = re.search(r"NZD\s+([\d,]+)\s+\d+\s+nights", txt)
            if not m:
                continue
            total = int(m.group(1).replace(",", ""))
            per_night = round(total / nights)
            room_type = txt.split("Per night")[0].strip()[:120]
            is_shared = bool(SHARED_HINTS.search(room_type))
            out.append({
                "hotel": name,
                "room": room_type,
                "total_nzd": total,
                "per_night_nzd": per_night,
                "private_bath": not is_shared,
            })
    return out


def parse_agoda(html: str, nights: int) -> list[dict]:
    s = BeautifulSoup(html, "html.parser")
    out = []
    # Agoda hotel cards
    for card in s.select('[data-selenium="hotel-item"], [data-element-index]'):
        name_el = card.select_one('[data-selenium="hotel-name"], h3')
        if not name_el:
            continue
        name = name_el.get_text(strip=True)
        txt = card.get_text(" ", strip=True).replace("\xa0", " ")
        m = re.search(r"NZ\$\s?([\d,]+)|NZD\s?([\d,]+)", txt)
        if not m:
            continue
        raw = (m.group(1) or m.group(2)).replace(",", "")
        try:
            val = int(raw)
        except ValueError:
            continue
        # Agoda often shows per-night; normalize
        if val < 700:  # likely per-night
            per_night = val
            total = val * nights
        else:
            total = val
            per_night = round(val / nights)
        out.append({
            "hotel": name,
            "room": "",
            "total_nzd": total,
            "per_night_nzd": per_night,
            "private_bath": True,  # Agoda search default — hotels not dorms
        })
    return out


def main():
    report = {}
    for block in BLOCKS:
        report[block] = {}
        for city in CITIES:
            n = NIGHTS[(block, city)]
            city_data = {"nights": n, "booking_top": [], "agoda_top": []}
            # Booking
            f = OUT / f"{block}_{city}_booking.html"
            if f.exists():
                listings = parse_booking(f.read_text(), n)
                listings.sort(key=lambda x: x["per_night_nzd"])
                # Top 5 private-bath options
                priv = [x for x in listings if x["private_bath"]][:5]
                city_data["booking_top"] = priv
                city_data["booking_total_listings"] = len(listings)
            f = OUT / f"{block}_{city}_agoda.html"
            if f.exists():
                listings = parse_agoda(f.read_text(), n)
                listings.sort(key=lambda x: x["per_night_nzd"])
                city_data["agoda_top"] = listings[:5]
                city_data["agoda_total_listings"] = len(listings)
            report[block][city] = city_data
    (OUT / "report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
