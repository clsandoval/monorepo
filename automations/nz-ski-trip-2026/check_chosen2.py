"""Pull prices for the locked hotels via direct Booking.com property URLs."""
import re
import time
from pathlib import Path
from cloakbrowser import launch
from bs4 import BeautifulSoup

OUT = Path(__file__).parent / "scan_out"

TARGETS = [
    {
        "label": "Club Wyndham Wanaka (Trademark Collection)",
        "nights": 8,
        "url": (
            "https://www.booking.com/hotel/nz/wyndham-vacation-resort-wanaka.html"
            "?checkin=2026-07-26&checkout=2026-08-03&group_adults=1&no_rooms=1"
            "&selected_currency=NZD"
        ),
    },
    {
        "label": "Holiday Inn Queenstown Frankton Road by IHG",
        "nights": 6,
        "url": (
            "https://www.booking.com/hotel/nz/goldridge-resort.html"
            "?checkin=2026-08-03&checkout=2026-08-09&group_adults=1&no_rooms=1"
            "&selected_currency=NZD"
        ),
    },
]


def extract_property_prices(html: str, nights: int):
    s = BeautifulSoup(html, "html.parser")
    text = s.get_text(" ", strip=True).replace("\xa0", " ")
    # Look for all "NZ$ N,NNN" mentions and the room-block table
    # The property page has a table with rows per room; look for room names + prices.
    rooms = []
    # Heuristic: room tables use class hprt-roomtype-name or data-block-id="..."
    for tr in s.select("tr, [data-block-id]"):
        txt = tr.get_text(" ", strip=True).replace("\xa0", " ")
        if "NZ$" not in txt and "NZD" not in txt:
            continue
        # Skip noisy
        if len(txt) < 20 or len(txt) > 600:
            continue
        m = re.search(r"NZ\$\s?([\d,]+)|NZD\s?([\d,]+)", txt)
        if not m:
            continue
        raw = (m.group(1) or m.group(2)).replace(",", "")
        try:
            v = int(raw)
        except ValueError:
            continue
        rooms.append({"snippet": txt[:200], "price_nzd": v, "per_night_nzd": round(v / nights)})
    # De-duplicate identical
    seen = set()
    out = []
    for r in rooms:
        key = (r["price_nzd"], r["snippet"][:60])
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    out.sort(key=lambda x: x["price_nzd"])
    return out, text[:400]


def main():
    browser = launch(headless=True)
    try:
        for t in TARGETS:
            print(f"\n>>> {t['label']}")
            print(f"    {t['url']}")
            page = browser.new_page()
            page.goto(t["url"], wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(8000)
            html = page.content()
            (OUT / f"chosen2_{t['label'].split()[0]}.html").write_text(html)
            print(f"    title: {page.title()[:120]}")
            rooms, head = extract_property_prices(html, t["nights"])
            print(f"    head: {head[:200]}")
            print(f"    rooms found: {len(rooms)}")
            for r in rooms[:10]:
                print(f"      NZ${r['price_nzd']} (NZ${r['per_night_nzd']}/n) — {r['snippet'][:120]}")
            page.close()
            time.sleep(2)
    finally:
        browser.close()


if __name__ == "__main__":
    main()
