"""Check Wyndham Wanaka on Agoda + direct Wyndham site."""
import re
import time
from pathlib import Path
from cloakbrowser import launch
from bs4 import BeautifulSoup

OUT = Path(__file__).parent / "scan_out"

URLS = [
    ("agoda_search", "https://www.agoda.com/search?textToSearch=Club+Wyndham+Wanaka&checkIn=2026-07-26&checkOut=2026-08-03&rooms=1&adults=1&currencyCode=NZD"),
    ("hotels_com", "https://www.hotels.com/ho406745/?q-check-in=2026-07-26&q-check-out=2026-08-03&q-rooms=1&q-room-0-adults=1"),
    ("expedia", "https://www.expedia.com/Wanaka-Hotels-Club-Wyndham-Wanaka.h1546053.Hotel-Information?chkin=2026-07-26&chkout=2026-08-03"),
]


def main():
    browser = launch(headless=True)
    try:
        for label, url in URLS:
            print(f"\n>>> {label}")
            print(f"    {url}")
            page = browser.new_page()
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                page.wait_for_timeout(9000)
                html = page.content()
                (OUT / f"wyndham_{label}.html").write_text(html)
                s = BeautifulSoup(html, "html.parser")
                for t in s(["script", "style"]):
                    t.decompose()
                text = " ".join(s.get_text(separator=" ").split()).replace("\xa0", " ")
                print(f"    TITLE: {page.title()[:120]}")
                # extract NZ$ / NZD / $ price tokens
                tokens = []
                for pat in [r"NZ\$\s?[\d,]+", r"NZD\s?[\d,]+", r"\$\s?[\d,]{3,4}"]:
                    tokens.extend(re.findall(pat, text))
                # Dedupe order-preserving
                seen = set()
                uniq = []
                for tk in tokens:
                    n = tk.strip()
                    if n not in seen:
                        seen.add(n)
                        uniq.append(n)
                    if len(uniq) >= 15:
                        break
                print(f"    price tokens: {uniq}")
                # availability indicators
                for kw in ["sold out", "no rooms", "unavailable", "fully booked"]:
                    if kw in text.lower():
                        print(f"    NOTE: page contains {kw!r}")
            except Exception as e:
                print(f"    ERR: {type(e).__name__}: {e}")
            page.close()
            time.sleep(2)
    finally:
        browser.close()


if __name__ == "__main__":
    main()
