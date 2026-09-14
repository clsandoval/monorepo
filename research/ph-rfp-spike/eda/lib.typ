// Minimal Tufte-style report class in PyMC Labs house style.
// Stand-in for pymc-labs/pymc-labs-report-template, which is not in this workspace:
// same asymmetric 2/3-text + wide-margin layout, same palette and type stack.

#let navy = rgb("#0C1F40")
#let peach = rgb("#F6AE72")
#let periwinkle = rgb("#9FAAE2")
#let aqua = rgb("#B4E7DD")
#let slate = rgb("#798496")
#let softwhite = rgb("#F7F7F7")
#let ink = rgb("#000000")

// A4 is 210mm. 22 left + 110 text + 6 gutter + 50 margin + 22 right = 210.
// The text column is deliberately ~110mm: at 9.5pt that is ~68 characters per line. A full-width
// 170mm column is ~100 characters and is the single biggest cause of a page feeling crowded.
#let TEXTW = 110mm
#let MARGW = 50mm
#let GUTTER = 6mm
#let FULLW = TEXTW + GUTTER + MARGW   // 166mm — figures may span text + margin

#let report(title: "", subtitle: "", author: "", date: "", body) = {
  set document(title: title, author: author)
  set page(
    paper: "a4",
    margin: (left: 22mm, right: MARGW + GUTTER + 22mm, top: 22mm, bottom: 20mm),
    footer: context {
      set text(font: "Inter", size: 7pt, fill: slate)
      block(width: FULLW, grid(columns: (1fr, auto), align: (left, right),
        [#title], [#counter(page).display()]))
    },
  )
  set text(font: "Inter", size: 9.5pt, weight: "light", fill: ink, lang: "en")
  set par(justify: true, leading: 0.68em, spacing: 1.0em)
  show heading: set text(font: "Archivo", stretch: 125%, fill: navy)
  show heading.where(level: 1): it => block(above: 1.6em, below: 0.8em,
    text(size: 13pt, weight: "bold", it.body))
  show heading.where(level: 2): it => block(above: 1.2em, below: 0.5em,
    text(size: 10pt, weight: "semibold", it.body))
  show figure: set align(left)
  show raw: set text(font: "DejaVu Sans Mono", size: 8pt)
  show strong: set text(weight: "semibold", fill: navy)
  show table.cell.where(y: 0): set text(weight: "semibold", fill: navy, size: 8pt)
  // Never split a table: a fragment carried onto the next page loses its header row and
  // reads as a column of unlabelled numbers.
  show table: it => block(breakable: false, it)
  set table(stroke: (x, y) => (
    top: if y == 0 { 0.8pt + navy } else if y == 1 { 0.4pt + slate } else { 0pt },
    bottom: 0pt, left: 0pt, right: 0pt,
  ), inset: (x: 4pt, y: 3.2pt))

  // ---- cover
  v(52mm)
  // justify: false — a justified display heading stretches word gaps grotesquely
  set par(justify: false)
  block(width: 100%)[
    #text(font: "Archivo", stretch: 125%, size: 25pt, weight: "bold", fill: navy, title)
    #v(4mm)
    #line(length: 34mm, stroke: 2pt + peach)
    #v(4mm)
    #text(font: "Inter", size: 11pt, weight: "light", fill: ink, subtitle)
    #v(14mm)
    #text(font: "Inter", size: 8pt, fill: slate, [#author · #date])
  ]
  pagebreak()
  set par(justify: true)

  body
}

// Figures float to the top or bottom of a page (placement: auto) rather than sitting exactly
// where they appear in the source. Without this, a figure taller than the space left on the
// page leaves a half-page hole, which is noise.
// Text-column figure. The caption sits in the right margin, top-aligned with the image, which
// is the point of the asymmetric layout: it keeps the reading column clean.
#let flowfig(path, caption: [], width: 100%) = figure(
  block(width: TEXTW)[
    #place(right, dx: MARGW + GUTTER, dy: 1mm,
      block(width: MARGW, align(left, text(size: 7.5pt, fill: slate, caption))))
    #image(path, width: width)
  ],
  kind: image, supplement: [Fig.], placement: auto,
)

// widefig is an alias for flowfig. A block wider than the text column gets re-centred by
// float placement and overflows off the LEFT page edge, so wide exhibits simply do not exist
// here: every figure is text-column width with its caption in the margin.
#let widefig = flowfig

// Full-width block for exhibits and stat rows that need the margin too.
#let wide(body) = block(width: FULLW, body)

// Marginal note, top-aligned with the current position.
#let sidenote(body) = place(right, dx: MARGW + GUTTER, dy: 0.4mm,
  block(width: MARGW, align(left, text(size: 7.5pt, fill: slate, body))))

// the number-that-matters callout
#let stat(value, label) = block(
  fill: softwhite, inset: (x: 7pt, y: 6pt), radius: 2pt, width: 100%,
)[
  #text(font: "Archivo", stretch: 125%, size: 15pt, weight: "bold", fill: navy, value)
  #linebreak()
  #text(size: 7pt, fill: slate, upper(label))
]

#let callout(body) = block(
  fill: softwhite, inset: 9pt, radius: 2pt, width: 100%,
  stroke: (left: 2pt + peach),
)[#text(size: 9pt, body)]
