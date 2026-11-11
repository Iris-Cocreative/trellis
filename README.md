# Trellis

> **Pre-1.0.** Trellis will break between minor versions, and says so in the [changelog](CHANGELOG.md). It is not yet taking contributions. Public is not a release: there is no npm package and no 1.0 until two apps run on it.

**v0.8 · 2026-11-11.** A CSS framework from a cell and a ratio, in context: one design and development seed that a product reshapes by turning knobs, never by redrawing a primitive. From [Iris Cocreative](https://iriscocreative.com). Live specimen: <https://iris-cocreative.github.io/trellis/>. What changed: [CHANGELOG.md](CHANGELOG.md). License: [MIT](LICENSE).

**It is CSS plus a small runtime.** Load `core.css`, a product layer, and `settle.js`, once. Safari needs the script for rhythm; every browser needs it for exact device pixels and the fit width.

**Scope.** Trellis is for fully custom projects: apps and sites whose markup you write. A site built in a visual builder keeps that builder's design system. "The foundation" in this document is the common noun for the same thing.

| File | What it is |
|---|---|
| `core.css` | The foundation: tokens, theme, base, layout, primitives, utilities, in cascade layers. Product-agnostic. |
| `examples/` | Two invented product layers, `quarry.css` and `almanac.css`. They only turn knobs on `:root`: fonts, ratios, palette, shapes, density. The tests run through them to prove a product can reshape everything that way. |
| `settle.js` | The runtime, and the only script a consumer loads. Sets the exact device pixels and fit width in every browser; rounds text to whole cells where the browser lacks `calc-size()` (Safari today); settles what CSS can't in `.prose`. |
| `tokens.json` | The token source, in the W3C Design Tokens format: the cell's target, the octaves, sizes, radii, layers, motion, the ratio's defaults, color roles as light and dark pairs, kind colors. Values are in cells and points, never rem or px, so a native screen and a web screen share one seed. |
| `tools/build-tokens.js` | The web generator. It writes the generated tokens of `core.css` from `tokens.json`, and holds the rem conversion. `contract.js` fails if the two disagree. |
| `math.js` | The fit, the ratio, standing, hanging and the gutter parity rule as plain functions, in points, with no DOM. The specimen's math view runs on it, and a native screen uses it as is. |
| `product.template.css` | Every knob, with its default and a line on what it does. Copy it to start a product layer. |
| `package.json` | Exports `core.css`, `settle.js` and the template. The product layers aren't exports: products will own them. |
| `REACT.md` | The contract for a React app, with the pull request checklist. |
| `CHANGELOG.md` | What changed in each version, and what broke. |
| `experiments/solids.js` | An experiment: point, line, plane carried on into solid, motion and transformation (the Platonic solids, morphing by geometry). Not part of the package. |
| `index.html`, `specimen.css`, `specimen.js` | The specimen. Built only from the foundation, so it is also the first test of it. Controls: theme, the dial (cell size), fit, Hang (the `--hang` knob, switchable), grid, Measure (padding, gap, a heading's own space, the line each text block stands on or hangs from), CSS (every stylesheet in a side panel; with Measure on, click anything to find its rule). The ratio section shows the math behind every type role, recomputed live and checked against the browser. |
| `tests/` | `align.js`, `pixel.js`, `layout.js`, `layers.js`, `math.js`, `perf.js`, `contract.js`, `matrix.js`. They run in CI; see `tests/README.md`. |
| `LICENSE` | MIT, held by Iris Cocreative. |

## Why

Interfaces drift. An audit of two working apps, before this existed, found dozens of font sizes, scores of spacing values and radii, thousands of one-off utility values, and many separate builds of the same avatar, modal and pill. Nothing stopped the drift, so it drifted. Trellis replaces values with relationships, and relationships with checked rules.

## The seed: a cell and a ratio, in context

Two measures, and two ways they meet the world.

| | What it is |
|---|---|
| **The cell** | The measure of space. Every gap, inset, control, corner and avatar is made of cells; it halves and doubles. |
| **The ratio** | The measure of type. Headings step down from H1 by one ratio, paragraphs step out from body by another. |
| **Response** | Both answer to the screen: it sets how many cells there are and how far the ratio opens. The reader's dial scales the cell, and with it every space. |
| **Context** | Both answer to the box they're in: type sizes come from the container, and a context changes variables, never markup, so a component nests at any depth. |

Grown from these: lines are planes · edges land on lines · headlines stand on the cells, text hangs from them · one concept, one archetype · products turn knobs.

### The cell

`--u`. Its target is `clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem) × --u-scale`: 10px on a phone, rising to 12px on a 1000px screen, and following the reader's font-size setting. `--u-scale` is the dial.
- It halves and doubles. **Home values: 1px, ¼u, ½u, u, 2u** (`--line`, `--sp-q`, `--sp-h`, `--sp-1`, `--sp-2`); multiples 1½u, 3u, 4u, 6u, 8u, 12u, 16u. ½u and ¼u live inside things (a control's padding, a tag's gap); **between blocks, space is whole cells**.
- ¼u is rounded to a pixel, so where two quarters must add to a half, the second is `--sp-q2` (½u − ¼u), exact at any cell.

**Lines are planes.** A line can't be infinitely thin: it occupies pixels, by rule the pixels just after its coordinate (right of it, below it). So N cells drawn with their edges need N cells plus one line. `--line` is one logical pixel (3 device pixels on an iPhone); `--hair` is one device pixel (⅓px on 3×). Neither scales.

**The frame, the field and the module.** The page sits in a centered `.frame`: a **field** of whole **modules** (4 cells each) with a gutter of whole cells either side. The field's edges, and every fourth line in from them, are the strongest lines, so the structure is symmetric about the screen whatever its width. The grid bleeds past the frame to the screen's edges.

**Whole, on wide screens.** The target rounds to an even pixel, so ½u is whole. The frame steps by a module (at most 100u) and the gutter by two cells; the margins take the remainder.

**Fitted, on touch screens** (coarse pointer, 1.5× and up: phones in either orientation, foldables, tablets). The screen's edge is the frame, so whole cells must span it.
- `--cells` = the even number nearest (width − hair) ÷ target, and `--u` = (width − hair) ÷ cells, rounded down to 1/32px. Even, so the screen's center is a line; minus a hair, because the last line needs its pixel.
- The gutter takes 2 or 3 cells (more beside a notch) so the field stays whole modules: 40 cells on a 393px iPhone (9 modules + 2 + 2, cell 9.81px), 44 on a 440px Pro Max (cell 9.97px), 74 on an 852px phone in landscape (cell 11.5px, since the target has grown by that width). The cell strays at most ~2.5% from its target.
- **Lines are counted in device pixels, space in cells.** The cell becomes fractional; lines never do. A 1× screen never fits: there a fractional cell would draw equal gaps as 5px and 6px.
- **Snapping.** WebKit (every iPhone) draws each box edge at the device pixel its coordinate rounds to, half up; the grid canvas uses the same rounding, so a card's edge and the grid line it stands on are the same physical pixel. Chrome's device emulation snaps to whole CSS pixels instead, so dev tools can't show the micro scale: check WebKit.
- 1/32px keeps every half cell exact in the browser's 1/64px layout grid, so nothing drifts. The cells fall short of the screen by up to about a pixel, split between the edges.
- Desktop windows don't fit by default (every space would breathe while the window is dragged). `data-unit-fit="on"` forces it, `"off"` refuses it; `--fit-width` lets a script pass the real width where a classic scrollbar makes `100vw` too wide; a script may set `--dpr` exactly (2.625 on some Android phones; the specimen does).
- **`--u` and `--cells` are not registered properties.** Chrome passes a registered length on at six significant digits (10.03125px became 10.0312px and the page drifted), and WebKit computed a registered cell count as 0 (blank iPhones in v0.3.0). Unregistered, they stay expressions. `--u-px` is a registered copy for scripts to read, never for layout. The count uses typed division; the old `tan(atan2())` trick is wrong in WebKit with viewport units.
- **The fitted cell is clamped** to 0.8–1.25 × its target, so a browser that gets the math wrong still lays out a usable page.

### The ratio

Fluid, fractal type from the [Type Scale Generator](https://lab.iriscocreative.com/tools/type-scale-generator.html).
- Two anchors, H1 and body, each with a size for a narrow space (20rem) and a wide one (90rem). Every role is a straight line between its two ends, clamped.
- Headings step down from H1 by one ratio; paragraphs step out from body by another; **both ratios open with the space**. The default is 1.2 → 1.333; the examples run from 1.125 → 1.25 (Quarry) to 1.333 → 1.5 (Almanac).
- Sizes respond to their **container** (`100cqi`), so a role inside a card scales to the card: the same structure at every scale of context.
- A heading carries its own space after it, proportional to its size (H1 0.33em, +0.11em a step), settled on the cells. **In a stack it is the larger of that space and the gap, never the sum.**
- Known wrinkle: in every product, xs is larger in a narrow space than a wide one (the paragraph ratio opens faster than body grows), so CSS holds xs at its narrow size. The math view says so. Either accept a fixed xs or retune the paragraph ratio.

### Type on the cell

The cell is the only line on the page; the grid draws nothing else.
- **Headlines stand** (h1, h2, h3): line height rounds to whole cells, the box is trimmed to the capitals and the alphabetic baseline and padded to whole cells, so every baseline lands on a cell line.
- **Text hangs** (h4–h6, the paragraph roles, the label): its own proportional line height, never forced to the grid. It hangs from a cell line by the top of its capitals, and its block rounds up to whole cells (`calc-size()`, or `settle.js`), so whatever follows starts on a line.
- **Blocks settle too**: a `.cluster` (a wrapping row of tags or chips) and anything marked `.settle` (a code sample, a figure) round up to whole cells. Inside a cluster, things keep their own half-cell rhythm, like letters in a word.

### Point, line, plane +

Kandinsky's three elements are the three measures: the **point** (the hairline, the ½ cell dot), the **line** (a cell's edge, rhythm in one direction), the **plane** (the cell and every surface built from cells).

An experiment (`experiments/solids.js`) carries them on: **solid** (the plane extruded: a cube, drawn at the lattice's 2:1 slope), **motion** (the solid turns; motion moves rest states, never layout), **transformation** (one Platonic solid becomes another by moving its points: cube → dodecahedron through the pyritohedra, cube → tetrahedron, cube → octahedron through the cuboctahedron, Fuller's vector equilibrium, octahedron → icosahedron along the golden ratio). Where it could go: loading and empty states, transitions between views (a list becoming a field), the organic layer. Kept out of the core until a product needs it.

### Settling, and what the runtime writes

**The foundation is CSS plus a small runtime.** Load `settle.js` once with `core.css`. Safari needs it for rhythm; every browser needs it for exact device pixels and the fit width; `.prose` needs it in every browser for what CSS can't round.

| It writes | On | Why |
|---|---|---|
| `--dpr`, `--fit-width` | `<html>`, every browser | The exact device pixel ratio (core only knows 2× and 3×), and the page's real width where a classic scrollbar makes `100vw` too wide. |
| `--settle-n` | Text, Safari only | Text hangs from a cell line and rounds its block up to whole cells. `calc-size()` does that in CSS, and Safari doesn't have it yet, so the script counts the cells a block needs, and core makes that count its least height. A count, not a measured gap: WebKit's trimmed heights jitter by 1/64px with where a box sits, and a box held at whole cells has nothing to add up. |
| `--settle` | Clusters and `.settle` blocks, Safari only | They keep their own box and take the missing space as end margin. |
| `--settle-start` | The block after text or an image in a nesting block in `.prose`, every browser | See Prose. |
| `data-prose-empty` | Empty blocks in `.prose`, every browser | See Prose. |

These are variables, not padding values, because inline styles only ever set variables (enforcement rule 5): what the space means stays in the stylesheet. When Safari ships `calc-size()` (or the CSS rhythm property `block-step`, which is exactly this), the Safari half switches itself off and those inline variables disappear.

Everything queued is settled in one pass, in one frame, and it can't be lazy about what's off screen, since a visible block's position is the sum of every block above it. Numbers and what they changed are in [`tests/README.md`](tests/README.md).

### The math, in plain words

The same rules without CSS, for any platform. `math.js` is these formulas as functions, and `tests/math.js` checks them against the stylesheet in Chromium and WebKit. Lengths are in points: one CSS pixel at the reader's default text size, one pt on iOS, one dp on Android.

**The cell's target.** `target = clamp(narrow, narrow + (wide − narrow) × (screen − 500) ÷ 500, wide) × text scale × dial`, where narrow is 10 and wide is 12. Ten points up to a 500-point screen, twelve from 1000 points on, a straight line between.

**Whole, where a window frames the page.** `cell = target rounded to the nearest even point`. The frame is the largest whole number of 4-cell modules that fits, at most 100 cells; the gutter is 2 or 4 cells (4 percent of the width, rounded down to two cells).

**Fitted, where the screen's edge frames the page.**
- `width = screen − hair`, where a hair is one device pixel (1 ÷ pixel ratio). The last line needs its pixel.
- `count = 2 × round(width ÷ (2 × target))`. Even, so the screen's center is a line.
- `cell = width ÷ count`, rounded down to 1/32 point, and held between 0.8 and 1.25 of the target.
- Example: 393 points at 3× gives 40 cells of 9.8125.

**The gutter parity rule.** The field between the gutters must be whole modules of 4 cells. With an even count, that holds when the gutter has the same parity as half the count: `gutter = 2 + (count ÷ 2) mod 2`. So 40 cells take a gutter of 2 (field 36, 9 modules) and 42 take 3 (field 36). Beside a notch, the gutter is the fewest cells that clear the safe area, plus one if its parity is wrong.

**The ratio.** Two anchors, H1 and body, each with a size in a narrow space (320) and a wide one (1440). A heading n steps below H1 has ends `H1 ÷ ratioⁿ`, using the narrow ratio for the narrow end and the wide ratio for the wide end; paragraph roles step out from body the same way. `size = clamp(narrow end, narrow end + (wide end − narrow end) × (space − 320) ÷ 1120, wide end)`, where the space is the container the text sits in, not the window.

**Standing** (h1 to h3). `line height = size × line ratio, rounded to the nearest whole cells`. The box is trimmed to the capitals and the baseline and padded on top by `cap height rounded up to whole cells − cap height`, so the last baseline sits on a cell line and every line above it does too.

**Hanging** (everything else). The line height is `size × line ratio`, unrounded. The top of the capitals sits on a cell line, and `block height = height rounded up to whole cells`, so whatever follows starts on a line. A wrapping row of tags rounds to the nearest cell instead, halves down.

**A heading's own space.** `space after = size × (0.33 + 0.11 per step below H1), rounded to whole cells`. In a stack it is the larger of that and the gap, never the sum.

### The token source

The values every platform shares live in one file, `tokens.json`, in the [W3C Design Tokens format](https://www.designtokens.org/). Lengths there are in **cells** or in **points**, never rem or px: a point is one CSS pixel at the reader's default text size, one pt on iOS, one dp on Android. Each group says which in `$extensions.trellis.unit`. Colors are light and dark pairs.

`node tools/build-tokens.js` writes the block of `core.css` between `tokens:start` and `tokens:end` from it; the rem conversion lives in that script and nowhere else. To change a shared value, change it in `tokens.json` and run the script. What stays hand-written in `core.css` is formula and web plumbing: the cell's rounding, lines, the frame, the gutter, the fit. `tests/contract.js` fails if `core.css` is out of date, or if a web unit gets into the token file.

## Layout

Five levels, each with a few named parts. A unique design changes variables at any level; it doesn't invent a sixth.

| Level | Parts | Notes |
|---|---|---|
| **Page** | `.frame` · `.shell` (navigation, main, an aside; a tab bar when its box is under 48rem, the aside under main when it is under 72rem) | The field of modules and its gutters, centered. `.shell` holds a `.shell-grid`, since a query can't restyle the container it asks. |
| **Section** | `.section`, `.section-head`, `.section-body`; `.cc-split` (head beside body when the container is wider than 54rem), `.cc-band` (the surface reaches the screen's edges, painted by an outset border image so it never adds scroll) · `.cover` (a full-screen opening: media to the edges, words in the field; its height is whole cells) | A band of the page. |
| **Composition** | `.stack` (one above another) · `.cluster` (a wrapping row) · `.cols` (n equal columns) · `.split` (two columns at a ratio, `--split-a : --split-b`, 2 : 1 by default; one column under 36rem of container) · `.grid` (as many fixed tracks as fit) · `.cells` (the lattice: children placed by `--cell-x`, `--cell-y`, sized by `--cell-w`, `--cell-h`, in cells) · `.rail` (scrolls sideways and snaps) · `.list` (rows divided by hairlines: chats, actions, members, post indexes) · `.board` (lanes of cards in a sideways scroller) · `.prose` (bare tags from an editor; see Prose) | How a region arranges what it holds. |
| **Surface** | `.card` | Padding, an edge plane, its own container. Hangs. |
| **Element** | type roles, `.tag`, `.button`, `.avatar`, `.float` … | The primitives. |

Every part: children start on cells; space between blocks is whole cells; responds to its container (`@container`), never the window; context changes variables, never markup.

**Free, flowing, moving, and still on the cells.** The rules that let open, animated, creative layouts stay hyper-responsive:
1. **Rest on the lattice, move off it.** Layout places things on cells. Motion is `transform` and `opacity` only, so it never reflows; every motion starts and ends at a rest position on the lattice.
2. **Time has a ratio too.** Durations come from one small set (`--dur-*`) and three easings (enter, exit, move). Reduced motion collapses them; the rest state is complete on its own.
3. **Free things live in layers.** An organic or animated element sits in its own layer (`.cells`, a canvas, a positioned layer), its coordinates in cells; the flow around it never depends on it.
4. **Spans, not pixels.** A creative arrangement is written in cells or modules and re-placed by container queries.
5. **Content in the field, color to the edge.** Text and controls stay in the field; a band's surface, a photograph or a rail may reach the screen's edges.
6. **Scroll is a timeline.** Scroll scenes use CSS scroll-driven animation (`animation-timeline: view()`), not scroll listeners.

**A post type is a composition of these plus prose.** The specimen works one through: an article is a `.cover`, then a `.split` holding `.prose` and a `.list` of related posts, then a `.list` of comments. There is no `.post` class, and there shouldn't be one.

**Next** (named, not built): `.scene` (a pinned stage stepped by scroll), `.canvas` (an endless field: a constellation, a map of work). Each gets built when a product asks, from these rules.

## Prose: content with no classes

Our apps carry rich content from editors and markdown, which arrives as bare tags. One class on the wrapper, `.prose`, maps every tag to its role and settles every block to whole cells. A class on a tag wins: `<h2 class="t-h4">` is an h4. `.prose` is its own container, so its type answers to its own width, and it stops at `--prose-measure` (56 cells; a product knob).

| Tag | Becomes |
|---|---|
| `h1`–`h3` | `.t-h1`–`.t-h3`: stand on the cells |
| `h4`–`h6` | `.t-h4`–`.t-h6`: hang |
| `p`, `li`, `dt`, `dd`, `summary`, a text-only `div` | `.t-body` |
| `blockquote` and the paragraphs in it | `.t-lg`, with a line on its left; `footer` or a direct `cite` is its attribution, `.t-sm` |
| `figcaption`, `caption`, `td` | `.t-sm` |
| `th` | `.t-label` |
| `ul`, `ol` | whole cells between items at every depth; the marker sits in a whole-cell margin |
| `pre` | a surface with one cell of padding, so it hangs like a card (rule 5) |
| `table` | a lattice: every line in a cell is whole cells, so rows stand on the grid; a wide table scrolls inside itself |
| `figure`, `img`, `video` | full width, corners from `--shape-card`; a caption hangs from the next line |
| two or more images in a `figure` or a `p` | a gallery of whole-cell squares, cropped (3 across, 2 in a narrow container) |
| `iframe` | full width at 16:9, its height rounded up to whole cells (`--embed-w`, `--embed-h`) |
| `hr` | one line, on a coordinate, given back so what follows is on a line |
| `details` | a block; its `summary` hangs; contents settle when opened |
| `a`, `code`, `kbd`, `strong`, `em`, `mark`, `small`, `sub`, `sup`, … | marks: `line-height: 0`, and sub and sup are moved rather than baseline-shifted, so none can stretch a line |

**Space.** The column's gap is 2 cells, and a heading keeps the rule from a stack: the larger of its own space and the gap, never the sum. It adds whole cells before it (h1, h2: 4; h3: 2; h4–h6: 1) so it belongs to what it introduces, and none directly after another heading.

**What the editor emits that has no role.** Decided 2026-11-07. Sanitize when content is saved if you can; this is the floor for when you can't.

| It emits | We do | Why |
|---|---|---|
| A style on a span, a mark or a `font` tag | Drop type, color, background and space; keep `font-weight`, `font-style`, `text-decoration` | Google Docs writes bold as a styled span, so emphasis has to survive. Pasted `color: #000` is invisible on a dark theme, and a pasted `font-size` breaks the line. |
| A style on a block | Drop the same, plus margins, padding and float; keep `text-align` | The block keeps its role's size, line and space. |
| An empty paragraph (`<p></p>`, `<p><br></p>`, `<p>&nbsp;</p>`) | Hide it | An empty paragraph isn't space; space is the column's. CSS catches `:empty`; `settle.js` marks the other two with `data-prose-empty`, because CSS can't tell them from content. Without the script they take one settled line. |
| A nested `div` from a paste | `display: contents`: its children join the column | It carries no meaning, and it would otherwise break the gap and every direct-child rule. A `div` with only text and marks is a paragraph, since that is what a browser's own editor makes of a line. A `div` with a class is left alone: it's a component. |
| An element we don't know | A block that rounds up to whole cells | So whatever follows is on a line. |

**The limit of CSS.** `<li>text<ul>…</ul></li>` puts text in an anonymous box, and a caption follows an image of any height; neither can be rounded in CSS. `settle.js` measures these and writes `--settle-start` on the block that follows, in every browser. Without the script the outer block still rounds to whole cells, so the page recovers at the next block: only the lines inside drift. One case stays unsettled even with it: bare text mixed with blocks inside a pasted `div`, which becomes an anonymous box in the column.

## Rules

### Edges

1. **Edges land on lines**, or a hairline or quarter cell off them. A box centered on a line is then even (14 = 12 + hairline; 18 = 12 + ¼u each side). A box pinned to something else, such as the screen's edge, takes whatever size lands its free edge on a line. **The grid fits whatever frames the page**: the screen's edges when fitted, the `.frame`'s own edges on a wide screen.
2. **Columns round to cells.** `.cols` rounds every track down to whole cells, so each column's left edge is on a line. `.grid` uses fixed tracks that don't stretch.
3. **A surface's edge is a plane after its coordinate, and never changes its size.** A card draws its edge as an `::after` frame one line larger: inside the box on the left and top, just outside it on the right and bottom, so each edge lies on its grid line's pixels. A surface that clips (it scrolls, or has `overflow: hidden`) would cut that frame off, so it keeps an inset outline or lets an inner scroller clip. Floats align to anchors, not the grid. Controls with a fixed height keep a real border and give it back in their padding.
4. **Draw grids in device pixels, never with repeating CSS gradients.** Safari rounds each repeated tile and the error grows across the screen.
5. **Surfaces hang.** A card steps `--hang` cells (a product knob, 1 by default) out into the space around it, so the text inside a card with a one-cell padding lines up with the text outside; a card with more padding still steps out one cell. A row hangs as a whole only when it holds nothing but cards; a card inside one column of a row stays in its column; nested, a card hangs into its parent's padding. Gutters are at least two cells, so a hanging card never reaches the screen's edge. **Hang is clipped by any ancestor with hidden overflow** (a scroll pane, a clipped section), so a card there silently loses its step-out: give that ancestor `--hang: 0`, or a cell of inline padding. `.list` rows and a `pre` in `.prose` hang by the same rule.

### Text

6. **Between blocks, space is whole cells.** A ½ or 1½ cell gap between stacked blocks puts everything after it off the grid. So `.u-gap-q` and `.u-gap-h` reach clusters only, never a stack. A cluster rounds its height to the nearest cell, halves down, so its content can overflow into the gap after it by up to half a cell; that is safe only because that gap is whole cells and at least one. A row that holds half-cell padding is one thing, like a button: its edges stay on lines and its contents keep their own rhythm (`.list.cc-dense`).
7. **Center only what differs by an even number of cells**; otherwise align to `start`.
8. **Beside a control, text centers its capitals on the control** (`.cap-center`): both are trimmed to cap height.
9. **An icon beside capitals or numbers centers on the cap height; beside lowercase text, on the x-height** (`.snap-x`).
10. **Marks never stretch a line**: code, mono, bold, italic and links get `line-height: 0` inside text. (Plain spans are left alone.)
11. **Truncate sideways only** (`.u-truncate`: `overflow-x: clip`). A trimmed box ends at the baseline, so `overflow: hidden` cuts every descender.
12. **Overhangs are given back.** An icon taller than the line beside it takes negative margin for its whole height below its offset.

### Primitives and variants

13. **One concept, one primitive.** Variants are `cc-*` modifiers that change the primitive's own variables.
14. **Products turn knobs.** A product layer only sets variables on `:root`. Primitives read the knobs; variants and contexts set the primitive's own variables, so a product never overrides a variant by accident.
15. **Context changes variables, not markup.** `.cc-dense .card { --card-pad: u }`; a card is a container, so its type scales to it.
16. **Floating surfaces align to their anchor, not the page grid.** One `.float` for every popover, options card and tooltip; top layer, follows its anchor, closes when the anchor scrolls away.
17. **Control type is fixed, and listed.** Controls sit in rows of a fixed height, so their labels don't scale with the container: `--fs-control-xs` … `--fs-control-lg` are the only font sizes outside the type roles. `--white` and `--black` are the only raw neutrals (ink on a solid color or a photo).
18. **Touch targets.** On a coarse pointer every control's hit area is at least `--hit-min` (44px, Apple's guidance), whatever it draws: an invisible `::before` grows around it, so density never costs a missed tap.

## Primitives

| Primitive | Anatomy and variants |
|---|---|
| `.avatar` | The photo is the box, on whole cells. Gap and ring are spread shadows outside it, concentric at every size. **Shape is kind**: circle = person, rounded square (corner = size ÷ 4) = group. Initials on a wash of the ring color. Sizes u · 2u · 3u · 4u · 6u · 8u · 12u. `.avatar-dot`, `.avatar-stack`. |
| `.tag` | **The archetype**: a height; a corner; padding equal to the corner (½u to u); a hairline edge and a tint mixed from one kind color; a label trimmed to its capitals. Kind, emphasis, size, state and context change variables only. By default, and in Almanac: pills. In Quarry: ¼u corners, uppercase. |
| `.button`, `.icon-button` | Heights 1½u · 2u · 2½u · 3u · 4u; padding half the height; label trimmed to cap height; hit area ≥ 44px on touch. |
| `.card` | Padding from two knobs, `--density-card-pad-inline` (the sides) and `--density-card-pad-block` (top and bottom). Both follow `--density-card-pad`, so they are equal unless a product splits them: trimmed text makes equal padding optically equal, and a product may still tighten the sides and keep the vertical rhythm. Corner from `--shape-card`, nested corners concentric, an edge plane, a container for its own type. |
| `.float` | `.options-card` (16u wide, ≤ 24u tall), `.tooltip`. Motion defined once on `.float[popover]`. |
| Scrollbars | One archetype (`--scrollbar-width`, `--scrollbar-size`, `--scrollbar-thumb`, `--scrollbar-track`); variants `.cc-scroll-thick`, `.cc-scroll-none`. |
| Layout | See Layout: `.frame`, `.section`, `.stack`, `.cluster`, `.cols`, `.split`, `.grid`, `.cells`, `.rail`, `.context`, `--hang`. |
| Type roles | `.t-h1`…`.t-h6`, `.t-xl`, `.t-lg`, `.t-body`, `.t-sm`, `.t-xs`, `.t-label`, plus `.snap` / `.snap-x` for other text and `.settle` for any block. |

Added in v0.7.

| Primitive | Anatomy and variants |
|---|---|
| `.field`, `.input` | **One box for input, select and textarea.** It draws at the product's control height, so it matches a button beside it, and occupies whole cells, so what follows stays on a line. A real border, given back in its padding. Lines of a textarea are whole cells. States (`[aria-invalid]`, `:disabled`, `:read-only`) change variables. On touch, at least the 44px target and 16px type, or iOS zooms the page. |
| `.modal` | **One archetype on the native `<dialog>`,** opened with `showModal()`, so the top layer, focus trap, Escape and inert page come free. `.modal > .modal-inner > .modal-header / -body / -footer`, as the standard's markup contract. Its motion: enter 200ms, backdrop 250ms, exit 150ms, scale from .96. It scrolls whole, so a modal taller than the screen reaches its top. The scroll lock needs no counting: `html:has(.modal[open])`. It replaces a scripted modal manager, which builds by hand what the dialog gives. A backdrop click is the app's one line of script. |
| `.modal.cc-sheet` | The same parts, changing variables only: at the bottom, edge to edge, on the spring curve. **On a screen under 48rem every modal is a sheet.** |
| `.tabs`, `.tab` | Whole cells tall, on a baseline that's a plane after its coordinate. `[aria-selected]` is the only state. `.cc-seg` is the same tabs as a segmented control. |
| `.chat-item` | An avatar and a body, for messages, walls and system lines; `.cc-own`, `.cc-wall` and `.cc-system` change variables. |
| `.member-tile` | A `.card` with a person in it. `.cc-row` puts the avatar beside the words. |
| `.badge`, `.dot` | A count, and the smallest mark of a state. |
| `.skeleton` | A surface's real structure, shimmering. A text slot keeps its role, so it settles to the same cells and nothing moves when the words arrive. Anything that draws itself becomes a `.cc-block`, sized in cells. |

## Products

A product is one file: a single `:root[data-product="name"]` rule in `@layer trellis.product` that sets knobs and nothing else. Copy [`product.template.css`](product.template.css), which lists every knob with its default and a line on what it does. A product layer lives with its product, not here.

With no product layer the page is core's own defaults: the neutral theme, system fonts, both color themes. That is what the specimen shows.

Two invented layers in `examples/` show the range, and keep the mechanism tested:

| | Neutral (core alone) | Quarry | Almanac |
|---|---|---|---|
| Character | plain | a dense working tool | slow and editorial |
| Type | system sans | Helvetica, heavier headings | a serif for headlines over a humanist sans |
| Ratio | 1.2 → 1.333 | 1.125 → 1.25 | 1.333 → 1.5 |
| Shapes | soft cards, pills | ¼u corners everywhere, uppercase tags | round cards, pill tags |
| Density | comfortable | one notch denser | comfortable, card sides tighter than top and bottom, a narrower measure |

**The specimen takes one layer by address.** `?layer=examples/quarry.css&product=quarry` loads that stylesheet and sets `data-product`. A layer on another origin loads only when the specimen is served from localhost, so a product's private layer can be seen, and run through the tests, from where it lives ([`tests/README.md`](tests/README.md)).

## Organic interfaces

A community map, a constellation of people, a field of work and a web of relationships are not gridded and shouldn't be. Their rules branch from the same seed:
- **Positions** may be free (force layouts) or sit on a lattice. The isometric lattice slopes **2:1**, so every lattice point is also a cell corner.
- **Sizes** of nodes come from the octaves; **strokes** from the line scale; **labels** stand on cell lines; rings and gaps follow the avatar rule.
- From the masters: **Kandinsky** (every mark a point, line or plane), **Mondrian** (a few proportions in asymmetric balance), **Frank Lloyd Wright** (the whole grown from the part), **Buckminster Fuller** (detail by doubling, never new numbers), **Christopher Alexander** (levels of scale, strong centers).

## Public API

This is what a consumer may rely on. Anything here changing is a changelog entry, and a breaking one says so. Anything not here is internal, however stable it looks. `tests/contract.js` fails if a class in `core.css` isn't listed here.

**Versioning.** Semver, staying 0.x until two apps ship on the same version. A 0.x minor may break, and must say so in [CHANGELOG.md](CHANGELOG.md). Pin an exact version.

**The rhythm model** is part of the API, and the most expensive part to change: the cell is the only line; headlines (h1–h3) stand on it, with a baseline on a cell line; other text hangs from it by its cap top and rounds its block up to whole cells; space between blocks is whole cells; a heading's own space in a stack is the larger of it and the gap. Changing any of that is a major entry, with a note in the specimen's history.

| Part | The API |
|---|---|
| **Files** | `core.css`, `settle.js`, `product.template.css`, `tokens.json`, `math.js` |
| **Layers** | `@layer trellis`, with sublayers `reset`, `tokens`, `theme`, `base`, `layout`, `primitives`, `product`, `utilities`, in that order |
| **Root attributes** | `data-product` (selects a product layer; absent is the neutral default) · `data-theme` (`light`, `dark`; absent follows the system) · `data-unit-fit` (`on`, `off`; absent fits touch screens) |
| **Runtime** | `window.Trellis`: `fit()`, `all()`, `observe(el)`, `settled()`. `data-settle-skip` opts an overlay out. It writes `--dpr`, `--fit-width`, `--settle-n`, `--settle`, `--settle-start` and `data-prose-empty`; those are its own. |
| **Knobs** (products set these on `:root`) | Everything in `product.template.css` |
| **Tokens** (read them, don't set them) | Space `--u`, `--u-px`, `--u-scale` (the dial; settable) · `--sp-q`, `--sp-q2`, `--sp-h`, `--sp-1`, `--sp-1h`, `--sp-2`, `--sp-3`, `--sp-4`, `--sp-6`, `--sp-8`, `--sp-12`, `--sp-16` · Lines `--line`, `--hair` · Frame `--gutter`, `--frame-max`, `--frame-max-n` · Corners `--r-q`, `--r-h`, `--r-1`, `--r-1h`, `--r-2`, `--r-round` · Sizes `--size-icon-sm`, `--size-icon`, `--size-icon-md`, `--size-icon-lg`, `--size-control-xs`, `--size-control-sm`, `--size-control-md`, `--size-control-lg`, `--size-control-xl` · Control type `--fs-control-xs`, `--fs-control-sm`, `--fs-control-md`, `--fs-control`, `--fs-control-lg` · Motion `--dur-in`, `--dur-in-slow`, `--dur-out`, `--dur-sheet-in`, `--dur-sheet-out`, `--dur-skeleton`, `--ease-in`, `--ease-out`, `--ease-spring` · Stacking `--z-raised`, `--z-sticky`, `--z-overlay`, `--z-float`, `--z-toast` · Theme `--surface`, `--ok`, `--warn`, `--alert`, `--lift`, `--white`, `--black`, `--hit-min`, `--font-mono` · Lattice `--iso-dx`, `--iso-dy` |

**Classes, and the variables a context may set on them.** Variants and contexts set these; products don't.

| Class | Modifiers and parts | Variables |
|---|---|---|
| Type roles | `.t-h1`, `.t-h2`, `.t-h3`, `.t-h4`, `.t-h5`, `.t-h6`, `.t-xl`, `.t-lg`, `.t-body`, `.t-sm`, `.t-xs`, `.t-label` · `.t-serif`, `.t-mono` · `.snap`, `.snap-x`, `.settle`, `.cap-center` | |
| `.prose` | | `--prose-inner-gap`, `--stack-gap`, `--embed-w`, `--embed-h` |
| `.frame` | | |
| `.section` | `.section-head`, `.section-body`, `.cc-split`, `.cc-band` | `--section-head-w`, `--band-bg` |
| `.cover` | `.cover-media`, `.cover-body` | `--cover-h`, `--cover-pad`, `--cover-scrim` |
| `.shell` | `.shell-grid`, `.shell-nav`, `.shell-main`, `.shell-aside`, `.shell-link` | `--shell-h`, `--shell-nav-w`, `--shell-aside-w`, `--shell-pad` |
| `.stack`, `.cluster` | | `--stack-gap`, `--cluster-gap` |
| `.cols`, `.split`, `.grid` | | `--cols`, `--cols-gap`, `--split-a`, `--split-b`, `--split-gap`, `--grid-min`, `--grid-gap` |
| `.cells` | | `--cell-x`, `--cell-y`, `--cell-w`, `--cell-h` |
| `.rail` | | `--rail-item`, `--rail-gap` |
| `.row`, `.col`, `.context` | | `--row-gap` |
| `.list` | `.list-item`, `.list-body`, `.list-end`, `.list-link` | `--list-pad-y`, `--list-gap`, `--list-rule`, `--list-hang` |
| `.board` | `.board-lane`, `.board-lane-head` | `--board-lane-w`, `--board-gap`, `--board-lane-gap` |
| `.card` | `.card-media` | `--card-pad` (sets both), `--card-pad-inline`, `--card-pad-block`, `--card-radius`, `--card-border` |
| `.button`, `.icon-button` | `.button-label`, `.cc-primary`, `.cc-ghost`, `.cc-sm`, `.cc-md`, `.cc-lg` | `--btn-h`, `--btn-fs`, `--btn-radius`, `--btn-bg`, `--btn-ink`, `--btn-border`, `--btn-tracking` |
| `.icon` | `.cc-end` | `--icon-size`, `--icon-stroke` |
| `.tag` | `.tag-label`, `.tag-dot`, `.tag-remove` · kinds `.cc-person`, `.cc-group`, `.cc-event`, `.cc-course`, `.cc-ok`, `.cc-warn`, `.cc-alert` · `.cc-outline`, `.cc-solid` · `.cc-sm`, `.cc-md`, `.cc-lg` | `--tag-h`, `--tag-fs`, `--tag-color`, `--tag-radius`, `--tag-pad`, `--tag-fill`, `--tag-edge`, `--tag-ink`, `--tag-gap` |
| `.avatar` | `.avatar-initials`, `.avatar-dot`, `.avatar-stack`, `.avatar-more` · sizes `.cc-xs`, `.cc-sm`, `.cc-md`, `.cc-lg`, `.cc-xl`, `.cc-xxl`, `.cc-hero` · `.cc-group` | `--av-n`, `--av-gap`, `--av-ring`, `--av-knock`, `--av-color`, `--av-radius` |
| `.field`, `.input` | `.field-label`, `.field-hint`, `.cc-sm`, `.cc-lg` · states `[aria-invalid="true"]`, `:disabled`, `:read-only` | `--input-h`, `--input-fs`, `--input-radius`, `--input-bg`, `--input-ink`, `--input-border`, `--input-pad`, `--input-rows` |
| `.tabs`, `.tab` | `.cc-seg` · `[aria-selected="true"]` | `--tab-h`, `--tab-fs`, `--tab-pad`, `--tab-rule`, `--tab-mark`, `--tab-mark-h`, `--tab-on-bg`, `--tab-radius`, `--tab-gap` |
| `.chat-item` | `.chat-item-body`, `.chat-item-meta`, `.chat-item-bubble`, `.cc-own`, `.cc-wall`, `.cc-system` | `--chat-bg`, `--chat-edge`, `--chat-pad`, `--chat-radius`, `--chat-measure` |
| `.member-tile` | `.member-tile-body`, `.cc-row` | `--tile-dir`, `--tile-align` |
| `.badge`, `.dot` | `.cc-quiet`, `.cc-accent`, `.cc-ok`, `.cc-warn` | `--badge-color`, `--badge-ink`, `--badge-h`, `--dot-color`, `--dot-size` |
| `.skeleton` | `.cc-block` | `--skel-lo`, `--skel-hi`, `--skel-radius`, `--skel-w`, `--skel-h` |
| `.modal` | `.modal-inner`, `.modal-header`, `.modal-body`, `.modal-footer`, `.cc-sheet` | `--modal-w`, `--modal-pad`, `--modal-gutter`, `--modal-radius`, `--modal-scrim` |
| `.float` | `.options-card`, `.options-card-heading`, `.options-card-item`, `.options-card-label`, `.options-card-rule`, `.tooltip` | `--float-pad`, `--float-radius` |
| Contexts | `.cc-dense`, `.cc-on-media` | |
| Scrollbars | `.cc-scroll-thick`, `.cc-scroll-none` | `--scrollbar-width`, `--scrollbar-size`, `--scrollbar-thumb`, `--scrollbar-thumb-hover`, `--scrollbar-track` |
| Utilities | `.u-text-secondary`, `.u-text-tertiary`, `.u-truncate`, `.u-sr-only`, `.u-align-end`, `.u-gap-q`, `.u-gap-h`, `.u-gap-1`, `.u-gap-2`, `.u-gap-4` | |

## Enforcement

Today, in CI on every push and pull request ([`tests/README.md`](tests/README.md) has what each proves and the numbers):
- **`align.js`**: every edge on a cell line, and every block in a real post, across the matrix in Chromium and WebKit.
- **`pixel.js`**: in WebKit at 3×, every card edge covers the device pixels of the grid line it stands on.
- **`layout.js`**: each layout and the modal behave as they say.
- **`layers.js`**: the required import order holds.
- **`math.js`**: the math module and the stylesheet agree, in both engines.
- **`perf.js`**: 5,000 blocks stay on their lines, inside the budgets.
- **`contract.js`**: the Public API is complete, **products only turn knobs**, the template matches core.

Intended, not built yet: **no raw values** outside the token layer, **every class registered** in the consuming app, and **inline styles set variables only**. Until those lints exist, the five rules are the review checklist in [`REACT.md`](REACT.md).

## Browser support

Everything degrades to a working layout. Per feature:

| Feature | Chrome | Safari | Without it |
|---|---|---|---|
| `light-dark()`, `round()`, `mod()`, `pow()`, container queries, `popover`, `@starting-style` | yes | yes | (all current browsers) |
| `text-box` trimming | 133+ | 18.2+ | text sits a few pixels off its line (Firefox today) |
| Typed division (`100vw / 1rem`): the fit | recent (about 140) | recent (about 26) | the cell stays whole; no fit |
| `calc-size()`: text and clusters round to whole cells, controls to whole half cells | 129+ | not yet | `settle.js` rounds text and clusters; controls keep natural widths |
| `:has()`: prose's galleries and text-only divs, the modal's scroll lock | yes | yes | (all current browsers) |
| `<dialog>` motion, `transition-behavior: allow-discrete` | yes | enter yes, exit partly | a modal closes without its exit transition |

## Adoption

- **Install by git address, pinned to a commit.** There is no npm package yet.
  ```bash
  npm install github:Iris-Cocreative/trellis#<commit>
  ```
  Then import `@iris-cocreative/trellis/core.css`, your own product layer, and `@iris-cocreative/trellis/settle.js`. For React, see [`REACT.md`](REACT.md).
- **Without a bundler,** load the three files from a pinned copy: `core.css`, your product layer, `settle.js`.
- **A product owns its layer.** Start from `product.template.css`, keep the knobs you change, and put `data-product` on `<html>`.
- **Beside an existing stylesheet,** migrate one surface at a time. A surface uses Trellis or the other system, not both.
- **With Tailwind, order matters, and neither import order is safe alone.** Namespacing stops the foundation's layers merging with Tailwind's, but `trellis` still has to sit between them: above Tailwind's preflight, or preflight flattens the type roles; below its utilities, or a utility margin on a heading loses to the reset. State the order first, before either stylesheet:
  ```css
  @layer theme, base, trellis, components, utilities;
  ```
  `tests/layers.js` proves this against the shape of Tailwind's layers, in both import orders; a later spike proves it against real Tailwind.

## Open questions

1. **xs.** Accept a fixed xs, or retune the paragraph ratios so it scales.
2. **Hang** is on by default (`--hang: 1`). Should a product ever turn it off?
3. **Spanned foldables.** On a spanned foldable the frame centers across the hinge; placing content per screen (viewport segments) is a later step.
4. **Firefox** places text a few pixels off its line until it ships `text-box`.
