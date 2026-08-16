# Manufacturer logos

One SVG per manufacturer, named after the slug of its `dir_name` in the library API — lowercase,
with every run of non-alphanumeric characters collapsed to a single `-`. `paulmann licht` therefore
becomes `paulmann-licht.svg`. `manufacturerLogoSlug()` in `../../components/ManufacturerLogo.tsx`
produces that name, and the file is picked up automatically: nothing needs registering by hand.

Manufacturers without a file here fall back to a monogram, so adding logos one at a time is fine.
`PROVENANCE.md` records where each file came from and under what licence.

Each logo is a separate chunk, fetched only when something renders it — inlining all of them into
the component costs ~75kB gzipped, which the profile page would pay to show a single mark.

## The two shapes

`<slug>.svg` is the **square** mark. It is what lists and grids use, where a row of logos should
read as one tidy column rather than a ragged mix of square marks and 6:1 wordmarks.

`<slug>.wide.svg` is optional and holds the **full lockup**, used where a single logo stands alone
and has room — the manufacturer page header. Only add it when the brand's lockup contains a mark
worth showing on its own: Bang & Olufsen's `B&O` monogram, Signify's circled `s`, Gledopto's round
mark, Sylvania's badge. Everything else has one file and both slots use it.

Usually the square file is a crop of the same artwork, but it can be a **different file entirely** —
Reolink's square is its blue R disc while the wide file is the wordmark. `SEPARATE_SQUARE` builds
the mark under its own slug and renames it into place, which also lets the two halves be classified
differently: Reolink's R keeps its own colours while the wordmark is themed.

Cropping to the mark is a **viewBox change alone** — an SVG root clips whatever falls outside it,
so no path editing is needed, and the prune pass then drops the geometry that fell outside. The same
trick removes part of a lockup outright: Kogan's `.com` sits past the wordmark, so trimming the
viewBox to the wordmark deletes it from both shapes. Measure the mark's bounding box in a browser (`getBBox()` on the
leaf elements, clustered by x) and pad the shorter side to square it.

A brand whose lockup is pure type — Osram, Belkin, Harman Kardon, Intelbras — has no mark to crop
to, so its wordmark is fitted into the square slot and simply renders smaller there. That is the
accepted trade for a uniform grid; do not invent a monogram mark for it.

## The two rendering modes

`ManufacturerLogo` picks the mode from the file itself, so the file has to be written for the mode
it wants:

- **Monochrome** — the file paints everything with `fill="currentColor"`. It is inlined into the
  page so it can inherit a colour. Add `data-brand="#rrggbb"` to the root `<svg>` to name the brand
  ink. Where that ink lacks contrast against a scheme the component *darkens or lightens it, keeping
  the hue*, rather than discarding it — TP-Link's cyan turning black on the light theme reads as the
  wrong logo, where a deeper cyan still reads as TP-Link. A colour with no hue to preserve (Sonos'
  black, Sony's white) or one pinned to either end of the lightness range (Denon's near-black
  `#0B131A`) is dropped for the theme's text colour instead, which is crisper than a muddy grey.
  **Always set `data-brand` for a coloured mark** — without it the logo silently renders in plain
  black and white.
- **Full colour** — the file keeps its own fills and is rendered as an `<img>`. Use it when the
  artwork needs more than one ink to be recognisable *and* reads on both a white and a near-black
  background: IKEA's blue-and-yellow, Lidl, Google's four-colour G, Velux.
- **Two-tone** — a file may mix the two: Amazon paints its wordmark with `currentColor` and keeps
  `#f90` on the smile, so the type follows the theme while the brand colour stays put. That is
  exactly how Amazon's own dark-mode lockup behaves. Any file containing `currentColor` takes the
  monochrome path, so the literal fills alongside it simply survive.

A single-ink logo should be monochrome even when that ink is black — flattening it is what lets it
show up on the dark theme at all.

Every file needs a `viewBox` and must not set `width`/`height` — the component sizes the mark to
its slot, and fixed dimensions fight it. Slots are a fixed height with the width free up to 2.5×
that, which is what lets a 6:1 wordmark like Harman Kardon stay readable next to a square mark.

**The viewBox must hug the artwork.** The slot fits the viewBox, not the ink, so any margin inside
it shrinks the logo — a traced bitmap keeps the source image's canvas, which put Treatlife's 218×71
wordmark inside a 400×200 box and rendered it at half the size it should be. Measure the union of
the drawn elements' bounding rectangles (client rects, so strokes and transforms count) and set the
viewBox to exactly that. Skip elements that paint nothing: `fill: none` with no stroke, or
`opacity: 0`, would otherwise inflate the bounds back to the old canvas.

## Adding a logo

Use the **mark** rather than the full lockup where the brand has one. Every slot the logo appears
in already prints the manufacturer's name beside it, and at 24–48px the wordmark half of a lockup
is unreadable. Paulmann's press kit ships block-plus-wordmark; only the block is checked in here.

Good sources, in rough order of preference:

1. [Simple Icons](https://simpleicons.org) (`npm i simple-icons`) — CC0 collection, already
   monochrome and square. Carries the official brand hex, which goes straight into `data-brand`.
2. [Wikimedia Commons](https://commons.wikimedia.org) — many brand logos are there as SVG under
   `PD-textlogo`. Check the licence on the file page and record it in `PROVENANCE.md`.
3. The manufacturer's own press kit. To convert an EPS or AI file:

```sh
gs -q -dNOPAUSE -dBATCH -dEPSCrop -sDEVICE=pdfwrite -o logo.pdf logo.eps
inkscape --pdf-poppler --export-type=svg --export-plain-svg --export-filename=logo.svg logo.pdf
```

Keep the result small. If you shorten coordinates, be
careful: path data packs numbers without separators and relies on the leading `.` to delimit them,
so `.0004.1285` is *two* numbers. Rounding them to `0` and `.129` and writing them back adjacent
gives `00.129`, which reads as one number and shifts every coordinate after it — the glyphs quietly
fall apart. Round with a tokeniser, keep the compact `.5` form, and scale the precision to the
viewBox (2 decimals is generous at 2000 units and destroys a 24-unit Simple Icon).

Then strip what the round-trip leaves behind: `<defs>` clip paths (each is only the bounding box of
the glyph it wraps), `id` attributes, `fill-opacity="1"`, `fill-rule="nonzero"`, editor namespaces,
and any `<!DOCTYPE>` with an internal entity subset (Adobe exports use `&ns_svg;` entities that are
undefined once the DOCTYPE goes). Replace `rgb(…%)` fills with hex, and set `role="img"`.

## Coverage

118 of the 121 manufacturers have a logo. The remaining 3 have no usable artwork at all and render
a monogram instead. Never approximate a mark by hand — a wrong logo is worse than a monogram.

Sources worth trying, roughly in yield order for this domain:

- **Simple Icons** covers the well-known tech brands only (19 of ours).
- **Wikimedia Commons** has SVG logos for anything with a Wikipedia article (23). Search the file
  namespace directly rather than relying on Wikidata's `P154` property, which is often unset — but
  require the brand name in the *filename*, or "Free" matches half of Commons.
- **The manufacturer's own site** is the biggest source for smart-home brands (17). Most serve
  their header logo as SVG. Sweep them with a headless browser and pick candidates from `<img>`
  elements inside a header or with "logo" in the URL, plus inline `<svg>` near the top of the page.
  Expect roughly half the hits to be cookie banners, payment badges and country flags — review
  every candidate visually before keeping it.
- **gilbarbara/logos** and **VectorLogoZone** were near-useless here (0 and 1 hits): they index
  developer tooling, not consumer hardware.
- **Home Assistant's `brands` repo** covers almost every one of the missing names, but it is PNG
  only, so nothing there can be used as-is.

## Tracing a raster

A bitmap can be vectorised with `potrace` when the artwork is flat, high-contrast and reasonably
large — most brand wordmarks are. The result is a **single-ink silhouette**, so any second colour in
the original is lost; that is the price, and it is recorded as `traced silhouette` in
`PROVENANCE.md`. Always compare the trace against its source before keeping it.

```sh
# Ink is whatever differs from the background colour, which handles transparency, knockouts and
# light-on-dark artwork in one rule. Masking on alpha alone fills knockouts and misses pale inks.
magick logo.png -filter Lanczos -resize '1800x1800>' -background white -alpha remove -alpha off flat.png
bg=$(magick flat.png -format '%[pixel:p{1,1}]' info:)
magick flat.png -alpha off -fuzz 22% -transparent "$bg" -alpha extract -threshold 50% -negate mask.pbm
potrace --svg --turdsize 4 --alphamax 1.0 --opttolerance 0.2 -o logo.svg mask.pbm
```

potrace paints every trace `#000000`, so sample the brand ink separately — from the *interior* of
the mask (erode it a few pixels first), or antialiased edge pixels drag the average toward the
background and a black wordmark comes out near-white. Where the ink samples as white, record no
`data-brand` at all and let the theme colour it; asserting white makes the logo vanish on the light
theme.

**One trace per ink.** A single mask flattens the whole logo to one colour, which loses Arlec's red
underline, Lexman's red circle and Gledopto's red mark. Quantise the mask's interior to find the
inks that each cover a meaningful share, mask each one separately (`-fuzz 30% -transparent <ink>`
leaves alpha 0 exactly where that ink is, which potrace traces directly), and stack the results —
every mask comes from the same bitmap, so the layers already share a coordinate system. Those logos
then belong in `DARK_INK_THEMED`, so their dark half follows the theme while the brand ink stays.

**Knockout artwork** — a solid shape with the mark punched out of it, like Reolink's R — needs the
same treatment for a different reason: potrace leaves the punched-out part transparent, so it would
show the card behind it. Flood-fill the silhouette from a corner to get the solid shape, subtract
the ink to get the holes, and stack the two layers with the holes painted white.

That trick only works when the knockout is genuinely enclosed. LSC's white house runs into the gap
between its two blocks, so it is connected to the outside and flood-fill cannot tell it from the
page margin. There, lay a **white backing** the size of the logo's own bounding box underneath the
blocks and leave their knockouts alone — the backing shows through exactly where the artwork is
white. A deliberate backing like that has to be exempted from the artboard stripper, which would
otherwise take it for an export canvas.

When two inks are too close for any fuzz value to separate — eWeLink's square and its orbital lines
differ by a few percent — **remap the image to a palette** of the exact inks first (`+dither -remap`),
then mask each with `-fuzz 1%`. Snapping every pixel to its nearest ink makes the masks exact.

Only split inks that are genuinely separate elements. Two stops of a gradient (Lumiman, VeSync) or
two shades of one colour (Youless) come out worse as a hard-edged split, and a layer that traces
badly is worth discarding on its own — Melitec's white layer did, so it kept the single-ink trace.

Watch out for artwork that is not really vector: Commons' "Aeotec brand logo.svg" is a bitmap in an
SVG wrapper (`<use xlink:href="#_Image1">`) and was dropped for that reason.

## Traps worth knowing

Exports carry shapes that are not part of the logo, and they bite in specific ways:

- **White artboard rects.** A full-canvas white rectangle is invisible on a white page and a white
  block on the dark theme. Strip them — but only plain rectangles: Lidl's white keyline is also
  full-canvas and *is* part of the logo, and a `<rect>` inside a `<clipPath>` is geometry, not
  paint, so removing it empties the clip and hides everything the clip applies to.
- **`<style>` blocks live inside `<defs>`.** Deleting `<defs>` wholesale to drop gradients also
  deletes the stylesheet, at which point class-based rules vanish and a shape styled
  `opacity: 0` becomes a solid block. Remove the gradient elements, not their container.
- **Shapes with no `fill` attribute default to black.** For a two-tone file the root needs
  `fill="currentColor"` or those shapes stay black and disappear on the dark theme.
- **Cropping does not shrink the file.** A `viewBox` crop only clips; the geometry outside it is
  still shipped. Delete the elements that fall outside the visible area.
- **A `<style>` block is global once a logo is inlined.** Illustrator emits `.st0`, `.cls-1` and
  friends in every file it exports, so two inlined logos defining the same class fight and whichever
  rendered last wins for both — NodOn's orange disappeared whenever Linkind loaded after it.
  Scoping the class names would only fix collisions *between classes*; a file containing
  `path { fill: #000 }` would still repaint every other logo on the page. So no file here keeps a
  stylesheet at all: the build flattens each `<style>` block into presentation attributes and drops
  the now-dead `class` attributes, leaving nothing that can escape the file. Resolve the cascade
  from the stylesheet rules, not from `getComputedStyle` — the computed value turns `currentColor`
  into a concrete colour and would bake the theming away.
- **Embedded `<image>` elements.** Aeotec's file paints a raster gloss over the vector letters.
  Strip them: an embedded bitmap is never the logo you want, and it dwarfs the vector data.
- **Sub-brand lockups.** Sengled's artwork is the "sengled pulse" lockup; the library entry is plain
  Sengled, and the badge's dark pill inverts to a white blob on the dark theme. It overlapped the
  wordmark, so it had to be deleted by region rather than cropped away.
