# PhilGEPS EDA — reproduce

```bash
uv run --with matplotlib --with numpy python eda.py     # figures/*.pdf + stats.json
uv run --with typst python -c "import typst; typst.compile('report.typ', output='philgeps-eda.pdf', font_paths=['fonts'])"
```

`fonts/` is not committed: Inter statics from `rsms/inter` releases (`extras/ttf/`) plus
`ArchivoExpanded-{Bold,SemiBold,Medium}.ttf` from `Omnibus-Type/Archivo` (`fonts/ttf/`).
Figures are gitignored — `eda.py` regenerates them from `apps/rfp/*.db`.

Three traps this hit, all of which produce plausible-looking wrong output:

- `sqlite3.connect(":memory:")` needs `uri=True` before `ATTACH 'file:...?mode=ro'` will open.
- Typst folds the width token into the family name: `Archivo Expanded` must be requested as
  `font: "Archivo", stretch: 125%`. Asking for "Archivo Expanded" silently falls back to
  Libertinus, and the build still exits 0.
- `ax.barh(labels, values)` with *truncated* label strings merges any duplicate label into one
  summed bar. Plot against `np.arange` positions and set the ticks separately.

`lib.typ` is a stand-in for `pymc-labs/pymc-labs-report-template`, which is not in this
workspace. Re-render through the real template before this goes to anyone at PyMC Labs.
