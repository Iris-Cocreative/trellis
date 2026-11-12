# Changelog

Semver, staying 0.x until two apps ship on the same version. A 0.x minor may break, and must say so here. The public API is defined in the [README](README.md#public-api). Changing the rhythm model is a major entry, with a note in the specimen's history.

## Unreleased

**Breaking**
- **Apply the five relations:** the card behavior called Hang is now Outset, so Hang means only text hanging from a line. The knob `--hang` is now `--outset`, and the list's `--list-hang` is now `--list-outset`. A product layer that set `--hang` sets `--outset` instead; there is no alias.

**Added**
- **Apply the five relations:** the README names the five ways anything meets a line, with an example each: Stand, Hang, Inset, Outset and Center. Rule 5 and open question 2 use the new name.

**Changed**
- **Apply the cap on the cell:** the cell follows the reader's text size up to 1.5 times the default and no further; above that only type grows, and layouts reflow. At default text sizes nothing moves. The cap is `text-scale-max` in `tokens.json`, `cellScale()` in `math.js`, rule 19 in the README; in `core.css` the cell's target is the smaller of its rem line and the same line at the cap in px, so it needs no typed division.
- **Controls past the cap:** a control is never shorter than its own type. Past the cell's cap a label can outgrow its control, and then the button, icon button, tag, input, tab or badge grows by whole cells from its own height. At default sizes every label is shorter than its control, so nothing moves. Rule 17 says so. A segmented control's track is now its tabs plus its padding, the same height at default sizes.
- **Controls past the cap:** a word wider than its line breaks instead of scrolling the page (`overflow-wrap: break-word` on `body`); a tag is never wider than its row, and a long label truncates sideways (rule 11); a chat item's meta line wraps.

**Fixed**
- **Read the cell from a probe:** `settle.js` measured the cell from `--u-px`, which WebKit computes against the default text size when a page or app sets the root's font size (how an iOS web view usually scales text), so in Safari every block was rounded with the wrong cell. It now measures one hidden box a cell wide (`[data-trellis-cell]`, on `<html>`, taking no space). `Trellis.cell()` returns that measure for any script; the specimen and the tests use it. `--u-px` stays, as a convenience.
- The README's formula for the cell's target now matches `math.js` and `core.css`: the reader's text size scales the target's two ends and its intercept, not the screen's share.

**Specimen and tests**
- **Apply the cap on the cell:** `align.js` takes `ax`, the reader's text size at 312% (the largest iOS accessibility size), and the matrix runs it four times: both engines, all three layers, wide and on a phone. 21 `align.js` runs in all.
- The specimen's tag matrix stacks its rows below 36rem instead of 576px, the same at default sizes, so a row label never has to wrap.
- The specimen's Hang control is now Outset, and its saved setting is `outset`. The `align.js` flag `hang` is now `outset`.

## 0.9.0 · 2026-11-11

The last pieces before the first app pins a version: card padding in two knobs, one token file for every platform, and the math as a module.

**Breaking**
- **Split card padding:** `--card-pad` is no longer defined on every card. It is now the shorthand a variant or context sets for both directions. A stylesheet that read `var(--card-pad)` reads `--card-pad-inline` or `--card-pad-block` instead.

**Added**
- **Split card padding:** two knobs, `--density-card-pad-inline` and `--density-card-pad-block`. Both follow `--density-card-pad`, so padding stays equal unless a product splits it. On a card, `--card-pad-inline` and `--card-pad-block`. The Almanac example tightens its sides to one cell. `layout.js` checks the default, each knob alone, and the shorthand.
- **Token source:** `tokens.json`, in the W3C Design Tokens format, holds the cell's target, the octaves, sizes, control heights, radii, layers, motion, the ratio's defaults, color roles as light and dark pairs, and kind colors, in cells and points. `tools/build-tokens.js` writes the generated tokens of `core.css` from it and holds the rem conversion. Every computed value is the same as before: the specimen renders identically in Chromium and WebKit. `tokens.json` is a package export.
- **Math module:** `math.js` holds the fit, the ratio, standing, hanging and the gutter parity rule as plain functions in points, with no DOM. The specimen's math view runs on it, the README has the same formulas in words, and `tests/math.js` checks it against the stylesheet in both engines. It is a package export, and sets `window.TrellisMath` in a browser.

**Rules**
- **Free layouts, rule 1:** "motion is transform and opacity only" is withdrawn. The rule now says only that every motion starts and ends at a rest position on the lattice. What motion may use is still to be written.

**Fixed**
- **Accessibility in the specimen:** the options card's rule is no longer a separator inside a listbox; the lattice figure and the standalone dots have an image role for their labels; the sample post no longer skips from a second-level heading to a fourth.
- The README said an iPhone in landscape fits 84 cells. It fits 74: the cell's target has grown to about 11.4 points by that width.

## 0.8.0 · 2026-11-11

The foundation is renamed Trellis and moves to its own public repository, starting from one fresh commit. Nothing consumed the files yet, so the renames break no one in practice; they are listed as breaking because every one changes the public API.

**Breaking**
- **The name:** Iris Foundation is now Trellis. "The foundation" stays as the common noun.
- **Cascade layers:** `iris` and its sublayers are now `trellis`: `trellis.reset`, `trellis.tokens`, `trellis.theme`, `trellis.base`, `trellis.layout`, `trellis.primitives`, `trellis.product`, `trellis.utilities`. A product layer declares `@layer trellis.product`. Beside Tailwind the statement is `@layer theme, base, trellis, components, utilities;`.
- **The package:** `@iris-cocreative/foundation` is now `@iris-cocreative/trellis`, at the root of its own repository. Install it by git address.
- **The runtime global:** `window.IrisSettle` is now `window.Trellis`, with the same four methods: `fit()`, `all()`, `observe(el)`, `settled()`.
- **The skeleton's keyframes:** `iris-skeleton` is now `trellis-skeleton`.
- **`solids.js` moved** to `experiments/solids.js`, and its global `IrisSolids` is now `TrellisSolids`. It was never a package export.
- **Product layers left the repository.** A product layer lives with its product. The specimen no longer has a product switcher or a saved product; its saved settings moved to the `trellis` storage key.
- **Tests take a layer, not a product name:** `align.js` accepts `neutral`, an example's name, or `name=<address>`; its theme is `auto`, `light` or `dark` (`home` is gone).

**Added**
- **MIT license,** held by Iris Cocreative.
- **A neutral specimen:** core's own defaults, system fonts, no web fonts loaded.
- **`examples/quarry.css` and `examples/almanac.css`:** two invented product layers, so the tests still prove a product can reshape everything by turning knobs.
- **One product layer by address:** the specimen takes `?layer=<address>&product=<name>`, and `matrix.js` takes `LAYER=name=<address>`, so a private layer runs through the same tests from where it lives. `contract.js` checks any layer given as a path.
- **CI on every push and pull request,** and `.gitattributes` pins LF line endings: `contract.js` failed on a checkout with CRLF, and now reads either.

**Unchanged**
- The rhythm model, every class, every knob and every token.

## 0.7.0 · 2026-11-07

The contract, before the first app pins a version.

**Breaking**
- **Cascade layers are namespaced:** `reset`, `tokens`, `theme`, `base`, `layout`, `primitives`, `product` and `utilities` are now `iris.reset` and so on. A product layer must declare `@layer iris.product`. A project that also loads Tailwind states `@layer theme, base, iris, components, utilities;` first: without it, neither import order is safe (`tests/layers.js`).
- **`.u-gap-q` and `.u-gap-h` no longer set `--stack-gap`.** They reach clusters only, because rule 6 forbids half cells between stacked blocks.
- **`--settle` no longer applies to text.** Text takes `--settle-n`, a count of cells. `--settle` remains for clusters and `.settle` blocks. Both are for `settle.js` to write; only a stylesheet that read them is affected.
- **`settle.js` runs in every browser now,** and sets `--dpr` and `--fit-width` itself. A page that set them from its own script should stop.

**Added**
- **`.prose`:** bare tags from editors and markdown map to the type roles and settle to whole cells, with no classes on the content. Written down: what it does with styled spans, empty paragraphs and pasted divs.
- **Layouts:** `.list`, `.shell`, `.cover`, `.board`, and a worked post type in the specimen.
- **Primitives:** `.field` and `.input`, `.modal` and `.modal.cc-sheet` on the native dialog, `.tabs`, `.chat-item`, `.member-tile`, `.badge`, `.dot`, `.skeleton`.
- **Knobs:** `--prose-measure`, `--shape-input`. Tokens: `--ease-spring`, `--dur-sheet-in`, `--dur-sheet-out`, `--dur-skeleton`.
- **`window.IrisSettle.settled()`:** a promise for when nothing is left to write. **`data-settle-skip`:** an overlay that shouldn't be watched.
- **Package shape:** `package.json`, `product.template.css`, `REACT.md`.
- **Tests:** `layers.js`, `layout.js`, `perf.js`, `contract.js`, `matrix.js`, `ready.js`, a run throttled 6×, and CI.

**Fixed**
- **The runtime scales.** In WebKit at 5,000 blocks, up to 87 ended up off their lines, intermittently, and one changed row took 380ms of blocking work; now 0 and about 50ms. Text in Safari was settled by padding a measured gap, and WebKit's trimmed heights jitter by 1/64px with position, so corrections never converged. It now holds a count of cells as its least height. **The rhythm model is unchanged:** this is how Safari reaches it. The numbers are in `tests/README.md`.
- `--settle` inherited, so a block's space also padded the text inside it. It is now registered and doesn't.
- The reduced-motion override sat outside every layer, so nothing could override it.
- `settle.js` re-settles each time fonts finish loading, not just the first: a font arriving later could make text wrap to fewer lines in a block held at whole cells, which can't notice by itself. `settled()` no longer resolves before the runtime has started.

**Rules**
- Rule 5 says hang is clipped by any ancestor with hidden overflow.
- Rule 6 says half-cell gaps are for clusters; why a cluster's overflow is safe; and that a row with half-cell padding is one thing, its edges on lines and its contents on their own rhythm.

## 0.6.0 · 2026-11-02

- **Layout anatomy:** Page (`.frame`), Section (`.section`, `.cc-split`, `.cc-band`), Composition (`.stack`, `.cluster`, `.cols`, `.split`, `.grid`, `.cells`, `.rail`), Surface (`.card`), Element. Rules for free and moving layouts, and a named list of what's next.
- **Hang is a product knob:** `--hang`, one cell by default. A row hangs only when it is all cards; a card in a column stays put; nested cards hang into their parent. Frame clipping removed.
- Clusters round to the nearest cell, halves down. Button padding is half the height, in half cells.
- Point, line, plane +: solid, motion and transformation (`solids.js`), an experiment.

## 0.5.0 · 2026-11-02

- **Rhythm model changed. The half-unit baseline is gone; the cell is the only line on the page.** Headlines (h1–h3) stand on the cells. Other text hangs from a cell line by its cap top, runs its own line height, and rounds its block up to whole cells (`calc-size()`, or `settle.js` where Safari lacks it). A heading's own space in a stack is the larger of it and the gap, not the sum.
- Four seeds: the cell, the ratio, response, context. The cell's target is 10px on a phone, rising to 12px.
- A third product layer. The second gets a larger H1 and a 1.25–1.333 ratio.
- Control type and neutrals tokenized, 44px touch targets, exact `--dpr`, `tests/align.js` and `tests/pixel.js` committed.

## 0.4.1 · 2026-10-31

- Specimen: Measure names a heading's own space, the math behind every type role, and the CSS panel.

## 0.4.0 · 2026-10-29

- **Lines are planes:** a line occupies the pixels after its coordinate, so N cells with drawn edges need N cells plus one line. `--hair`, one device pixel.
- Fit: an even cell count, with a gutter of 2 or 3 cells so the field is whole 4-cell modules. Wide screens: the frame steps by a module.
- Card edges are an `::after` plane one line larger. The specimen's grid is a canvas at device resolution, replacing gradient tiles Safari rounds per tile.

## 0.3.1 · 2026-10-28

- **Fixed a blank page on every iPhone.** WebKit computes the `tan(atan2())` trick wrongly with viewport units, so the cell count came out 0. Now typed division behind `@supports`, an unregistered `--cells`, and a fitted cell clamped to 0.8–1.25× its target.

## 0.3.0 · 2026-10-28

- **Fitted unit:** on a touch screen, whole cells span the screen. `--u` is no longer a registered property, since Chrome substituted it at six significant digits and the page drifted; `--u-px` is a read-only copy. Gutters clear the safe areas.

## 0.2.0 · 2026-10-28

- **The first shared seed for two apps, under the working name Iris Foundation.** A unit (0.75rem, rounded to an even pixel), a ratio (the Type Scale Generator's fluid, fractal type, sized to its container) and a half-unit baseline. Core, plus product layers that only turn knobs. The specimen, and the first alignment test.
