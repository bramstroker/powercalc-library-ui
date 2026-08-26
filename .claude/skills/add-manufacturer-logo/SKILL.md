---
name: add-manufacturer-logo
description: Add or replace a manufacturer logo in src/assets/manufacturer-logos. Use when asked to add a logo for a brand, fix a logo's colours, crop one to its mark, or convert supplied artwork (SVG/EPS/AI/PDF/raster) into a checked-in logo.
---

# Adding a manufacturer logo

`src/assets/manufacturer-logos/README.md` is the contract the files must satisfy and
`PROVENANCE.md` is the record of where each came from. **Read both before starting** — this
skill is the procedure, those are the rules.

The component that consumes the files is `src/components/ManufacturerLogo.tsx`. Nothing needs
registering: the file is picked up by its name.

## 1. Confirm the slug

The filename is the slug of the manufacturer's `dir_name` in the library API, not its display
name. Get it from the API rather than guessing:

```sh
curl -s https://api.powercalc.nl/library \
  | python3 -c "import json,sys; [print(m['dir_name'],'|',m['full_name'],'|',m.get('aliases')) \
      for m in json.load(sys.stdin)['manufacturers'] if 'phil' in m['dir_name'].lower()]"
```

Then lowercase it and collapse every run of non-alphanumerics to `-` (`paulmann licht` →
`paulmann-licht.svg`). Brands can appear twice under different dir names — `philips` and
`signify` are separate manufacturers here — so match the one that was asked for.

## 2. Source the artwork

**Prefer full-colour artwork, and never source from Simple Icons or any other monochrome icon
set.** A silhouette throws away every ink but one, which is exactly what makes IKEA's
blue-and-yellow or Gledopto's red mark recognisable.

In order of yield for this domain:

1. **Wikimedia Commons.** Check the licence over the API and record it verbatim:
   ```sh
   curl -s -G https://commons.wikimedia.org/w/api.php \
     --data-urlencode action=query --data-urlencode format=json \
     --data-urlencode prop=imageinfo --data-urlencode 'iiprop=url|extmetadata' \
     --data-urlencode 'titles=File:Philips shield (2013).svg'
   ```
   Require the brand name in the _filename_; searching Wikidata's `P154` misses most brands.
2. **The manufacturer's own site or press kit** — usually the header logo, served as SVG.
3. **A raster the maintainer supplies**, vectorised with `potrace`, one trace per ink.

When the user drops files in `~/Downloads`, use those. If they are byte-identical to a Commons
file (`md5`), cite Commons — it is the stronger provenance.

For EPS / AI / PDF:

```sh
gs -q -dNOPAUSE -dBATCH -dEPSCrop -sDEVICE=pdfwrite -o logo.pdf logo.eps
inkscape --pdf-poppler --export-type=svg --export-plain-svg --export-filename=logo.svg logo.pdf
```

**Never approximate a mark by hand.** A wrong logo is worse than the monogram fallback.

## 3. Decide the shape(s)

`<slug>.svg` is the **square** mark used in grids and on the profile page. `<slug>.wide.svg` is
optional and holds the **full lockup** for the manufacturer page header.

Only ship a wide file when the lockup contains a mark worth showing on its own. The square is
then either a viewBox crop of the lockup (an SVG root clips whatever falls outside it — no path
editing needed) or, as with Philips' shield and Reolink's R disc, **a different file entirely**.

A brand whose lockup is pure type (Osram, Belkin) has no mark to crop to; fit the wordmark into
the square slot and let it render smaller. Do not invent a mark.

## 4. Clean the file

Round-tripped artwork arrives full of traps. In order:

**Flatten group transforms into the path data.** Inkscape parks artwork under nested
`translate`/`matrix` groups. Coordinate rounding later turns `matrix(0.78527577,…)` into
`matrix(.79,…)` — rounding a coordinate is safe, rounding a _scale factor_ is not, and the
artwork's own large offsets amplify the error:

```sh
python3 .claude/skills/add-manufacturer-logo/scripts/flatten_transforms.py in.svg out.svg
```

**Delete editor bookkeeping _elements_, not just attributes.** `<sodipodi:namedview>`,
`<inkscape:grid>`, `<metadata>`. Once their `xmlns:` declarations are stripped these become
undeclared namespace prefixes — a fatal XML parse error for a full-colour logo, which is
rendered as an `<img>` from a data URI and so silently fails to draw.

**Drop dead `<defs>`.** Round-trips leave a `<clipPath>` that is only the page bounding box.
But check first: a `<style>` block often lives inside `<defs>` too, and deleting it blindly once
turned Trust's `opacity:0` rect solid.

**Flatten any `<style>` block to presentation attributes.** Monochrome logos are inlined into
the page, so `.st0` / `.cls-1` class names collide globally between them — NodOn lost its orange
when Linkind happened to load after it. Resolve the cascade from the stylesheet rules; do _not_
use `getComputedStyle`, which resolves `currentColor` to a literal.

**Strip** `id` attributes, `fill-opacity="1"`, `fill-rule="nonzero"`, editor namespaces, and any
`<!DOCTYPE>` with an internal entity subset (Adobe's `&ns_svg;` entities break once it goes).
If an `id` is referenced by `clip-path="url(#…)"`, remove the reference too or keep the id —
never leave a dangling one.

**Minify coordinates with a tokeniser, never a regex over the raw string.** Path data packs
numbers without separators and relies on a leading `.` to delimit them, so `.0004.1285` is _two_
numbers; rounding them to `0` and `.129` and writing them back adjacent gives `00.129`, one
number, and every coordinate after it shifts. Scale precision to the viewBox: 2 decimals is
generous at 2000 units and destroys a 24-unit artwork.

## 5. Set the rendering mode

`ManufacturerLogo` picks the mode from the file itself:

| Mode        | Write the file as                                                                 | Use when                                                                                  |
| ----------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Monochrome  | everything `fill="currentColor"`, plus `data-brand="#rrggbb"` on the root `<svg>` | single-ink artwork, _including black_ — flattening is what lets it show on the dark theme |
| Full colour | keeps its own fills                                                               | multi-ink artwork that reads on both white and near-black                                 |
| Two-tone    | `currentColor` on the dark ink, literal fills on the rest                         | a coloured mark beside a near-black wordmark                                              |

**Always set `data-brand` on a coloured monochrome mark** — without it the logo silently renders
plain black and white. Where the brand ink lacks contrast the component shifts its lightness and
keeps the hue; an ink with no hue to keep is dropped for the theme's text colour instead.

## 6. Fix the viewBox

Every file needs a `viewBox` and must **not** set `width`/`height` — the component sizes the mark
to its slot and fixed dimensions fight it.

**The viewBox must hug the artwork**, because the slot fits the viewBox rather than the ink. A
traced bitmap keeps the source canvas, which once rendered Treatlife's 218×71 wordmark at half
size inside a 400×200 box. Measure the union of the drawn elements' client rects in a browser and
set the viewBox to exactly that; skip elements that paint nothing (`fill: none` with no stroke,
`opacity: 0`) or they inflate the bounds back to the old canvas.

## 7. Verify before committing

**Pixel-diff the cleaned file against the artwork it came from.** Give both the same intrinsic
size first, since the comparison renders at a common width:

```sh
node .claude/skills/add-manufacturer-logo/scripts/diffsvg.mjs original.svg cleaned.svg 800
```

A few dozen differing pixels on a detailed mark is edge antialiasing. A percent or more is a real
shift — render both and look.

**Then look at it in the app, on both themes.** A logo that is geometrically perfect can still be
invisible on one background or wrong next to its neighbours:

```sh
npm run dev -- --port 3200
```

Screenshot `/manufacturers` (the square in a grid, beside other brands) and
`/manufacturer/<dir_name>` (the wide lockup in the header) in light _and_ dark.

Finally: `npm run lint`, `npx tsc --noEmit`, `npm test -- --run` — from the repository root.

## 8. Record it

Update **`PROVENANCE.md`**: add a row under the right source section (file, manufacturer,
rendering mode, shapes, licence verbatim), bump that section's count, bump the coverage line, and
add the slug to the wide-variant list if it ships one. Update the coverage count in
**`README.md`** too. Both counts are per manufacturer, so re-derive them rather than assuming +1.

Do not add a logo to the repo without its provenance row — the licence is the reason the file can
be there at all.

## Tests

`src/components/ManufacturerLogo.test.tsx` needs a manufacturer that will _never_ have a logo for
its monogram-fallback cases, and uses the sentinel `NO_LOGO = "no such manufacturer"` for exactly
that. If a test names a real brand there, adding that brand's logo breaks it — repoint it at
`NO_LOGO` rather than picking another real name.
