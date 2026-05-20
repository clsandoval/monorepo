"""Fetch live hotel prices for the NZ ski trip via CloakBrowser."""
import re
import sys
from cloakbrowser import launch

QUERIES = [
    {
        "name": "Ramada Wyndham Wanaka (Booking.com)",
        "url": "https://www.booking.com/hotel/nz/ramada-resort-wanaka.html?checkin=2026-07-26&checkout=2026-08-03&group_adults=1&no_rooms=1&selected_currency=NZD",
    },
    {
        "name": "Holiday Inn Queenstown Frankton (Booking.com)",
        "url": "https://www.booking.com/hotel/nz/holiday-inn-queenstown-frankton-road.html?checkin=2026-08-03&checkout=2026-08-09&group_adults=1&no_rooms=1&selected_currency=NZD",
    },
    {
        "name": "Wanaka search (Agoda)",
        "url": "https://www.agoda.com/search?selectedproperty=&checkIn=2026-07-26&checkOut=2026-08-03&rooms=1&adults=1&children=0&textToSearch=Wanaka",
    },
    {
        "name": "Queenstown search (Agoda)",
        "url": "https://www.agoda.com/search?checkIn=2026-08-03&checkOut=2026-08-09&rooms=1&adults=1&children=0&textToSearch=Queenstown",
    },
]


def extract_prices(html: str, top_n: int = 8) -> list[str]:
    # Grab "NZ$ 1,234" / "$1234" / "NZD 234" patterns
    pats = [
        r"NZ\$\s?[\d,]+",
        r"NZD\s?[\d,]+",
        r"\$\s?[\d,]{3,}",
    ]
    hits: list[str] = []
    for p in pats:
        hits.extend(re.findall(p, html))
    # Dedupe, preserve order
    seen = set()
    out = []
    for h in hits:
        n = h.strip()
        if n not in seen:
            seen.add(n)
            out.append(n)
        if len(out) >= top_n:
            break
    return out


def main():
    browser = launch(headless=True)
    try:
        for q in QUERIES:
            print(f"\n=== {q['name']} ===")
            print(f"URL: {q['url']}")
            try:
                page = browser.new_page()
                page.goto(q["url"], wait_until="domcontentloaded", timeout=45000)
                # Let lazy content render
                page.wait_for_timeout(5000)
                html = page.content()
                title = page.title()
                print(f"TITLE: {title[:120]}")
                print(f"HTML length: {len(html)}")
                prices = extract_prices(html)
                print(f"Top price tokens: {prices}")
                # Save for inspection
                fname = "/tmp/" + re.sub(r"\W+", "_", q["name"]) + ".html"
                with open(fname, "w") as f:
                    f.write(html)
                print(f"saved -> {fname}")
                page.close()
            except Exception as e:
                print(f"ERROR: {type(e).__name__}: {e}")
    finally:
        browser.close()


if __name__ == "__main__":
    main()
