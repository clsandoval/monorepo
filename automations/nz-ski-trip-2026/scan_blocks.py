"""Scan multiple date blocks across booking sites for the NZ ski trip.

Strategy: hit each site's city-search URL sorted by price-ascending, save HTML,
extract listing prices + hotel names, then report cheapest options per block.

8 nights Wanaka + 6 nights Queenstown, three candidate date blocks:
- Block A: Wanaka 2026-07-20..28, Queenstown 2026-07-28..08-03 (earliest)
- Block B: Wanaka 2026-07-26..08-03, Queenstown 2026-08-03..09 (sun-to-sun)
- Block C: Wanaka 2026-08-01..09, Queenstown 2026-08-09..15 (latest)
"""
import re
import json
import time
from pathlib import Path
from cloakbrowser import launch
from bs4 import BeautifulSoup

OUT = Path("/home/clsandoval/cs/monorepo/automations/nz-ski-trip-2026/scan_out")
OUT.mkdir(exist_ok=True, parents=True)

BLOCKS = {
    "A_early":  {"wanaka": ("2026-07-20", "2026-07-28"), "queenstown": ("2026-07-28", "2026-08-03")},
    "B_suntosun": {"wanaka": ("2026-07-26", "2026-08-03"), "queenstown": ("2026-08-03", "2026-08-09")},
    "C_late":   {"wanaka": ("2026-08-01", "2026-08-09"), "queenstown": ("2026-08-09", "2026-08-15")},
}

CITIES = ["Wanaka", "Queenstown"]


def booking_url(city: str, ci: str, co: str) -> str:
    return (
        "https://www.booking.com/searchresults.html?"
        f"ss={city}%2C+New+Zealand&checkin={ci}&checkout={co}"
        "&group_adults=1&no_rooms=1&group_children=0"
        "&selected_currency=NZD&order=price"
    )


def agoda_url(city: str, ci: str, co: str) -> str:
    return (
        "https://www.agoda.com/search?"
        f"textToSearch={city}&checkIn={ci}&checkOut={co}"
        "&rooms=1&adults=1&children=0&currencyCode=NZD"
    )


def parse_booking(html: str) -> list[dict]:
    """Extract (name, price_nzd_total) tuples from Booking search results."""
    s = BeautifulSoup(html, "html.parser")
    out = []
    # Booking uses [data-testid="property-card"]
    for card in s.select('[data-testid="property-card"]')[:15]:
        name_el = card.select_one('[data-testid="title"]')
        price_el = card.select_one('[data-testid="price-and-discounted-price"]')
        if not name_el or not price_el:
            continue
        name = name_el.get_text(strip=True)
        price_text = price_el.get_text(" ", strip=True)
        m = re.search(r"NZ\$\s?([\d,]+)", price_text)
        if not m:
            continue
        total = int(m.group(1).replace(",", ""))
        out.append({"name": name, "total_nzd": total, "raw": price_text})
    return out


def parse_agoda(html: str) -> list[dict]:
    """Extract listings from Agoda. Try several selector patterns."""
    s = BeautifulSoup(html, "html.parser")
    out = []
    # Common: hotel-card or property cards
    for card in s.select('[data-selenium="hotel-item"], li[data-selenium="hotel-item"], [data-element-index]')[:15]:
        # Hotel name
        name_el = (
            card.select_one('h3')
            or card.select_one('[data-selenium="hotel-name"]')
            or card.select_one('[data-element-name="property-card-content-title"]')
        )
        text_blob = card.get_text(" ", strip=True)
        if not name_el:
            continue
        name = name_el.get_text(strip=True)
        # Price tokens
        m = (
            re.search(r"NZ\$\s?([\d,]+)", text_blob)
            or re.search(r"NZD\s?([\d,]+)", text_blob)
        )
        if not m:
            continue
        total = int(m.group(1).replace(",", ""))
        out.append({"name": name, "total_nzd": total, "raw": text_blob[:120]})
    # Fallback: regex over the whole page if structured parsing failed
    if not out:
        text = s.get_text(" ", strip=True)
        for m in re.finditer(r"(NZ\$|NZD)\s?([\d,]{3,6})", text):
            try:
                out.append({"name": "?", "total_nzd": int(m.group(2).replace(",", "")), "raw": m.group(0)})
            except Exception:
                pass
            if len(out) >= 10:
                break
    return out


def run():
    browser = launch(headless=True)
    summary = {}
    try:
        for block_id, dates in BLOCKS.items():
            summary[block_id] = {}
            for city in CITIES:
                ci, co = dates[city.lower()]
                nights = (
                    (int(co.split("-")[2]) - int(ci.split("-")[2]))
                    if co[:7] == ci[:7]
                    else None
                )
                summary[block_id][city] = {"checkin": ci, "checkout": co, "nights": nights, "sites": {}}
                for site, build, parser in [
                    ("booking", booking_url, parse_booking),
                    ("agoda", agoda_url, parse_agoda),
                ]:
                    url = build(city, ci, co)
                    print(f"\n>>> {block_id} | {city} | {site} | {ci}->{co}")
                    print(f"    {url}")
                    try:
                        page = browser.new_page()
                        page.goto(url, wait_until="domcontentloaded", timeout=60000)
                        page.wait_for_timeout(7000)
                        html = page.content()
                        fname = OUT / f"{block_id}_{city}_{site}.html"
                        fname.write_text(html)
                        listings = parser(html)
                        listings.sort(key=lambda x: x["total_nzd"])
                        top = listings[:5]
                        summary[block_id][city]["sites"][site] = top
                        print(f"    -> {len(listings)} listings, cheapest {top[:3]}")
                        page.close()
                    except Exception as e:
                        print(f"    ERR {type(e).__name__}: {e}")
                        summary[block_id][city]["sites"][site] = {"error": f"{type(e).__name__}: {e}"}
                    time.sleep(2)
    finally:
        browser.close()
    (OUT / "summary.json").write_text(json.dumps(summary, indent=2))
    print("\n\n==== SUMMARY ====")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    run()
