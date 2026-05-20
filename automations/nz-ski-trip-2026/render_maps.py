"""Render trail-map PDFs and webp into high-res PNGs."""
from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image

MAPS_DIR = Path(__file__).parent / "maps"
OUT_DIR = MAPS_DIR

DPI = 300  # high res

PDFS = [
    ("treble_cone.pdf", "treble_cone.png"),
    ("remarkables.pdf", "remarkables.png"),
    ("coronet_peak.pdf", "coronet_peak.png"),
]

WEBPS = [
    ("cardrona.webp", "cardrona.png"),
]


def render_pdf(pdf_path: Path, out_path: Path, dpi: int = DPI):
    pdf = pdfium.PdfDocument(str(pdf_path))
    # Use first page (trail maps are single-page)
    page = pdf[0]
    scale = dpi / 72
    bitmap = page.render(scale=scale)
    pil = bitmap.to_pil()
    pil.save(out_path, "PNG", optimize=True)
    print(f"  {pdf_path.name} ({page.get_width()/72:.1f}x{page.get_height()/72:.1f}in) -> {out_path.name} {pil.size}, {out_path.stat().st_size/1024:.0f} KB")


def convert_webp(webp_path: Path, out_path: Path):
    img = Image.open(webp_path).convert("RGB")
    img.save(out_path, "PNG", optimize=True)
    print(f"  {webp_path.name} -> {out_path.name} {img.size}, {out_path.stat().st_size/1024:.0f} KB")


def main():
    print(f"Rendering @ {DPI} DPI to {OUT_DIR}")
    for src, dst in PDFS:
        render_pdf(MAPS_DIR / src, OUT_DIR / dst)
    for src, dst in WEBPS:
        convert_webp(MAPS_DIR / src, OUT_DIR / dst)


if __name__ == "__main__":
    main()
