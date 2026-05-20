"""Check live prices for the two locked hotels: Ramada Wyndham Wanaka + Holiday Inn Queenstown Frankton.

Strategy: hit Booking search filtered by hotel name (ss=...) + dates, then extract
the matching property card's price.
"""
import re
import time
from pathlib import Path
from cloakbrowser import launch
from bs4 import BeautifulSoup

OUT = Path(__file__).parent / "scan_out"
OUT.mkdir(exist_ok=True)

QUERIES = [
    {
        "label": "Ramada Wyndham Wanaka",
        "match": ["wyndham", "ramada"],
        "nights": 8,
        "url": (
            "https://www.booking.com/searchresults.html?"
            "ss=Ramada+Resort+by+Wyndham+Wanaka&checkin=2026-07-26&checkout=2026-08-03"
            "&group_adults=1&no_rooms=1&group_children=0&selected_currency=NZD"
        ),
    },
    {
        "label": "Holiday Inn Queenstown Frankton",
        "match": ["holiday inn", "frankton"],
        "nights": 6,
        "url": (
            "https://www.booking.com/searchresults.html?"
            "ss=Holiday+Inn+Queenstown+Frankton+Road&checkin=2026-08-03&checkout=2026-08-09"
            "&group_adults=1&no_rooms=1&group_children=0&selected_currency=NZD"
        ),
    },
]


def find_match(html: str, match_terms: list[str], nights: int):
    s = BeautifulSoup(html, "html.parser")
    cards = s.select('[data-testid="property-card"]')
    print(f"  property-card count: {len(cards)}")
    options = []
    for card in cards:
        title_el = card.select_one('[data-testid="title"]')
        if not title_el:
            continue
        name = title_el.get_text(strip=True)
        name_low = name.lower()
        if not all(t in name_low for t in match_terms):
            continue
        units = []
        for unit in card.select('[data-testid="availability-single"]'):
            txt = unit.get_text(" ", strip=True).replace("\xa0", " ")
            m = re.search(r"Price\s+NZD\s+([\d,]+)", txt)
            if not m:
                continue
            total = int(m.group(1).replace(",", ""))
            room_type = txt.split("Per night")[0].strip()[:140]
            units.append({
                "room": room_type,
                "total_nzd": total,
                "per_night_nzd": round(total / nights),
                "raw": txt[:200],
            })
        units.sort(key=lambda x: x["total_nzd"])
        options.append({"hotel": name, "units": units})
    return options


def main():
    browser = launch(headless=True)
    try:
        for q in QUERIES:
            print(f"\n>>> {q['label']}")
            print(f"    {q['url']}")
            page = browser.new_page()
            page.goto(q["url"], wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(8000)
            html = page.content()
            f = OUT / f"chosen_{q['label'].replace(' ', '_')}.html"
            f.write_text(html)
            matches = find_match(html, q["match"], q["nights"])
            print(f"    matched {len(matches)} hotels")
            for m in matches:
                print(f"    HOTEL: {m['hotel']}")
                for u in m["units"][:3]:
                    print(
                        f"      NZ${u['per_night_nzd']}/n  total NZ${u['total_nzd']} — {u['room'][:80]}"
                    )
            page.close()
            time.sleep(2)
    finally:
        browser.close()


if __name__ == "__main__":
    main()
