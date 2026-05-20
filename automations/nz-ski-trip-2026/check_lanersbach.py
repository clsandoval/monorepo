"""Scrape Booking.com for Lanersbach / Vorderlanersbach (Tux valley, Austria) hotels.

10 nights solo, private bath, Sun 21 Jun → Wed 1 Jul 2026.
"""
import re
from pathlib import Path
from cloakbrowser import launch
from bs4 import BeautifulSoup

OUT = Path(__file__).parent / "scan_out"

QUERIES = [
    ("Lanersbach", "https://www.booking.com/searchresults.html?ss=Lanersbach%2C+Austria&checkin=2026-06-21&checkout=2026-07-01&group_adults=1&no_rooms=1&group_children=0&selected_currency=EUR&order=price"),
    ("Vorderlanersbach", "https://www.booking.com/searchresults.html?ss=Vorderlanersbach%2C+Austria&checkin=2026-06-21&checkout=2026-07-01&group_adults=1&no_rooms=1&group_children=0&selected_currency=EUR&order=price"),
    ("Tux_Hintertux", "https://www.booking.com/searchresults.html?ss=Tux%2C+Austria&checkin=2026-06-21&checkout=2026-07-01&group_adults=1&no_rooms=1&group_children=0&selected_currency=EUR&order=price"),
]
NIGHTS = 10


def parse(html: str) -> list[dict]:
    s = BeautifulSoup(html, "html.parser")
    out = []
    for card in s.select('[data-testid="property-card"]'):
        title_el = card.select_one('[data-testid="title"]')
        if not title_el:
            continue
        name = title_el.get_text(strip=True)
        # Look for distance / location info
        addr = card.select_one('[data-testid="address"]')
        location = addr.get_text(strip=True) if addr else ""
        for unit in card.select('[data-testid="availability-single"]'):
            txt = unit.get_text(" ", strip=True).replace("\xa0", " ")
            m = re.search(r"Price\s+€\s*([\d,]+)|€\s*([\d,]+)\s+\d+\s+nights|Price\s+EUR\s+([\d,]+)", txt)
            if not m:
                continue
            raw = next((g for g in m.groups() if g), None)
            if not raw:
                continue
            total = int(raw.replace(",", "").replace(".", ""))
            room_type = txt.split("Per night")[0].strip()[:150]
            shared = bool(re.search(r"\b(dorm|dormitory|bed in|bunk|shared)\b", room_type, re.I))
            out.append({
                "hotel": name,
                "location": location[:80],
                "room": room_type,
                "total_eur": total,
                "per_night_eur": round(total / NIGHTS),
                "private_bath": not shared,
            })
    return out


def main():
    browser = launch(headless=True)
    try:
        for label, url in QUERIES:
            print(f"\n>>> {label}")
            page = browser.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(9000)
            html = page.content()
            (OUT / f"lanersbach_{label}.html").write_text(html)
            listings = parse(html)
            listings.sort(key=lambda x: x["per_night_eur"])
            priv = [x for x in listings if x["private_bath"]]
            print(f"   Total: {len(listings)}, private-bath: {len(priv)}")
            for x in priv[:10]:
                print(f"   €{x['per_night_eur']}/n (€{x['total_eur']}/10n) — {x['hotel'][:45]} | {x['location'][:35]}")
            page.close()
    finally:
        browser.close()


if __name__ == "__main__":
    main()
