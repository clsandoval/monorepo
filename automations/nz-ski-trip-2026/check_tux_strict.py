"""Strict Tuxertal-only hotel scrape — filter to postcode 6293."""
import re
from pathlib import Path
from cloakbrowser import launch
from bs4 import BeautifulSoup

OUT = Path(__file__).parent / "scan_out"

# Search by specific Tuxertal village names + check location after
URLS = [
    ("Hintertux", "https://www.booking.com/searchresults.html?ss=Hintertux+Glacier%2C+Austria&checkin=2026-06-21&checkout=2026-07-01&group_adults=1&no_rooms=1&group_children=0&selected_currency=EUR&order=price"),
    ("Tux6293", "https://www.booking.com/searchresults.html?ss=6293+Tux%2C+Austria&checkin=2026-06-21&checkout=2026-07-01&group_adults=1&no_rooms=1&group_children=0&selected_currency=EUR&order=price"),
]
NIGHTS = 10
TUXERTAL_TOWNS = {"tux", "lanersbach", "vorderlanersbach", "madseit", "juns", "hintertux"}


def parse_filtered(html: str) -> list[dict]:
    s = BeautifulSoup(html, "html.parser")
    out = []
    for card in s.select('[data-testid="property-card"]'):
        title_el = card.select_one('[data-testid="title"]')
        if not title_el:
            continue
        name = title_el.get_text(strip=True)
        # Try multiple location selectors
        addr_el = card.select_one('[data-testid="address"]') or card.select_one('[data-testid="distance"]')
        location = addr_el.get_text(" ", strip=True) if addr_el else ""
        # Find the link to inspect URL slug (often contains village)
        link = card.select_one('a[data-testid="title-link"]') or card.find("a", href=re.compile(r"/hotel/"))
        href = link.get("href", "") if link else ""

        # Filter: keep only if location text OR url slug mentions a Tuxertal village
        text_blob = (name + " " + location + " " + href).lower()
        is_tuxertal = any(t in text_blob for t in TUXERTAL_TOWNS)
        # Exclude false matches: "tux" in "luxor" etc — but our villages are specific
        if not is_tuxertal:
            continue
        # Extract distance-from-center if present (helpful)
        dist_el = card.select_one('[data-testid="distance"]')
        distance = dist_el.get_text(" ", strip=True) if dist_el else ""

        for unit in card.select('[data-testid="availability-single"]'):
            txt = unit.get_text(" ", strip=True).replace("\xa0", " ")
            m = re.search(r"Price\s+€\s*([\d,]+)", txt)
            if not m:
                continue
            total = int(m.group(1).replace(",", ""))
            room_type = txt.split("Per night")[0].strip()[:140]
            out.append({
                "hotel": name,
                "distance": distance,
                "room": room_type,
                "total_eur": total,
                "per_night_eur": round(total / NIGHTS),
                "url": (href if href.startswith("http") else ("https://www.booking.com" + href))[:120] if href else "",
            })
            break  # first (cheapest) unit only
    return out


def main():
    browser = launch(headless=True)
    try:
        all_results = {}
        for label, url in URLS:
            print(f"\n>>> {label}\n    {url}")
            page = browser.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(9000)
            html = page.content()
            (OUT / f"tuxstrict_{label}.html").write_text(html)
            listings = parse_filtered(html)
            for r in listings:
                key = r["hotel"]
                if key not in all_results or r["per_night_eur"] < all_results[key]["per_night_eur"]:
                    all_results[key] = r
            print(f"   {len(listings)} matched Tuxertal towns")
            page.close()
        sorted_listings = sorted(all_results.values(), key=lambda x: x["per_night_eur"])
        print("\n\n=== STRICT TUXERTAL ONLY ===")
        print(f"{'€/n':<6} {'Total':<8} {'Hotel':<40} {'Distance':<25}")
        for r in sorted_listings[:15]:
            print(f"€{r['per_night_eur']:<5} €{r['total_eur']:<7} {r['hotel'][:40]:<40} {r['distance'][:25]:<25}")
            print(f"        {r['url']}")
    finally:
        browser.close()


if __name__ == "__main__":
    main()
