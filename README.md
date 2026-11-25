# Trellis

> **Pre-1.0.** Trellis will break between minor versions, and the [changelog](CHANGELOG.md) says when it does. It isn't taking contributions yet. The repo is public, but there's no release: no npm package, and no 1.0 until two apps run on it.

**v0.10 · 2026-11-15.** Trellis is a CSS framework built on two values: a spacing unit (the cell) and a type ratio. Every space and type size comes from those two and from the box it sits in. A product gets its own look by changing variables (knobs) rather than writing new CSS for the components. From [Iris Cocreative](https://iriscocreative.com). Live specimen: <https://iris-cocreative.github.io/trellis/>. What changed: [CHANGELOG.md](CHANGELOG.md). License: [MIT](LICENSE).

**It's CSS plus a small runtime.** Load `core.css`, a product layer and `settle.js`, once. Safari needs the script to keep text on the cells, every browser needs it for exact device pixels and the fit width, and `.prose` needs it everywhere for the few things CSS can't round.

**Scope.** Trellis is for fully custom projects: apps and sites whose markup you write. A site built in a visual builder should keep that builder's design system. This README sometimes calls Trellis "the foundation". A "rule N" is one of the numbered [Rules](#rules) below, and a D-number links to its decision record in [`docs/decisions/`](docs/decisions/).

| File | What it is |
|---|---|
| `core.css` | The foundation: tokens, theme, base, layout, primitives, utilities, in cascade layers. Product-agnostic. |
| `examples/` | Two invented product layers, `quarry.css` and `almanac.css`. They only turn knobs on `:root`: fonts, ratios, palette, shapes, density. The tests run through them to prove a product can reshape everything that way. |
| `settle.js` | The runtime, and the only script a consumer loads. Sets the exact device pixels and fit width in every browser; rounds text to whole cells where the browser lacks `calc-size()` (Safari today); settles what CSS can't in `.prose`; closes a modal on a true backdrop click. |
| `tokens.json` | The token source, in the W3C Design Tokens format: the cell's target, the named counts of cells, sizes, radii, layers, motion, the ratio's defaults, and the palette as seeds, a lift and a lightness ladder. Values are in cells and points, never rem or px, so a native screen and a web screen share one seed. |
| `tools/build-tokens.js` | The web generator. It writes the generated tokens of `core.css` from `tokens.json`, and holds the rem conversion. `contract.js` fails if the two disagree. |
| `math.js` | The fit, the ratio, standing, hanging, the gutter parity rule and the palette as plain functions, in points and OKLCH, with no DOM. The specimen's math view runs on it, and a native screen uses it as is. |
| `product.template.css` | Every knob, with its default and a line on what it does. Copy it to start a product layer. |
| `package.json` | Exports `core.css`, `settle.js`, `float.js`, `presets.js`, `math.js`, `tokens.json`, the template and `tools/product.js`, and installs two commands, `trellis-check` and `trellis-product`. The three runtimes are its side effects, so a bundler keeps a bare import of each. The product layers aren't exports: products will own them. |
| `tools/figma-variables.js` | The Figma file's variables, generated from `tokens.json` through `math.js`: Space and Type at a phone and a wide screen, Color in light and dark, each named as its CSS variable. `tools/figma-components.js` draws the components from them, and `tools/figma-inventory.js` lists what it draws, to check the file against. What Figma can't express is in [docs/figma](docs/figma/README.md). |
| `tools/check.js` | The check for an app built on Trellis: it counts raw lengths, type, colors and radii, restyled primitives, modifiers without their base, variables in a product layer that are not knobs, and inline styles that are not variables, per file. With `--budget` it fails when a count rises. No browser, no dependencies. Installed, it is `npx trellis-check`. |
| `tools/product.js` | The check for a product layer: one `:root[data-product]` rule and its scopes in `@layer trellis.product`, only the template's knobs, and every text role, accent, status and stage over its contrast floor in both themes, on every scope (at night alone for a scope that is always dark). Installed, it is `npx trellis-product <layer>`; `tests/contract.js` runs it on `examples/`. |
| `skill/SKILL.md` | The same contract as instructions for a coding agent: which primitive answers which need, the five rules for an app's own CSS, what a raw number becomes, how to mock up, and how to start a project. It ships in the package, with `skill/ADOPT.md` for moving an existing site over: copy `node_modules/@iris-cocreative/trellis/skill/` to where your agent loads skills. |
| `REACT.md` | The contract for a React app, with the pull request checklist. |
| `CHANGELOG.md` | What changed in each version, and what broke. |
| `experiments/solids.js` | An experiment: point, line, plane carried on into solid, motion and transformation (the cube turning a quarter at a time, and truncating through the cuboctahedron to the octahedron and back). Not part of the package. |
| `experiments/vines.js` | An experiment: seeded vines that grow up the lattice, resting on its points and leaving them between, sized in cells and colored from the theme. The specimen's hero grows them up the frame's edge. Not part of the package. |
| `brand/` | The Trellis mark: a lattice with a vine through it, in one color (`currentColor`), with a solid version for small sizes and a lockup. |
| `index.html`, `specimen.css`, `specimen.js`, `hero.js`, `palette.js` | The specimen (`hero.js` moves the hero's drawings; `palette.js` is the Color section's study, a palette from one color). Built only from the foundation, so it is also the first test of it. A column beside the field names every section. Controls: theme, the dial (cell size), fit, Outset or Contained (the `--outset` knob, switchable), the grid (lines, dots at the crossings, or off), Measure (padding, gap, a heading's own space, the line each text block stands on or hangs from), CSS (every stylesheet in a side panel; with Measure on, click anything to find its rule). The ratio section shows the math behind every type role, recomputed live and checked against the browser. |
| `STATUS.md` | Where each planned piece stands: its state, the commit that changed it, the test that backs it. |
| `tests/` | `align.js`, `pixel.js`, `layout.js`, `layers.js`, `math.js`, `perf.js`, `contract.js`, `matrix.js`, `package.js`. They run in CI; see `tests/README.md`. Not part of the package. |
| `LICENSE` | MIT, held by Iris Cocreative. |

## Why

Before Trellis existed, an audit of two working apps found dozens of font sizes, scores of spacing values and radii, thousands of one-off utility values, and several separate builds of the same avatar, modal and pill. Nothing in either codebase stopped a new value being added. Trellis sizes everything from a few shared values instead, and the tests fail when something steps outside them.

## The seed: a cell and a ratio, in context

The cell measures space and the ratio measures type. Both respond to the screen and to the box they sit in.

| | What it is |
|---|---|
| **The cell** | The measure of space. Every gap, inset, control, corner and avatar is a count of cells. |
| **The ratio** | The measure of type. Headings step down from H1 by one ratio, paragraphs step out from body by another. |
| **Response** | Both answer to the screen: it sets how many cells there are and how far the ratio opens. The reader's dial scales the cell, and with it every space. |
| **Context** | Both answer to the box they're in: type sizes come from the container, and a context (a dense list, a sidebar) changes variables rather than markup, so a component works at any depth. |

The rules below follow from these. The main ones are that lines take up pixels, edges land on cell lines, headlines stand on the cells and other text hangs from them, each concept has one primitive, and products only turn knobs.

### The cell

`--u`. Its target is `clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem) × --u-scale`: 10px on a phone, rising to 12px on a 1000px screen, and following the reader's font-size setting **up to 1.5 times the default** (rule 19). `--u-scale` is the dial.
- **The cap.** Above 1.5× only type grows: the cell stops, so a phone keeps about 26 cells instead of becoming a 13-cell column at the largest accessibility sizes, and layouts reflow because their breakpoints are in rem. `text-scale-max` in `tokens.json`; in CSS the target is the smaller of its rem line and the same line at the cap in px.
- **Space is counted in cells.** Any whole count is on the grid, and Trellis enforces no set of counts ([D86](docs/decisions/D86.md)). **Home values: 1px, ¼u, ½u, u, 2u** (`--line`, `--sp-q`, `--sp-h`, `--sp-1`, `--sp-2`); the other named counts are 1½u, 3u, 4u, 5u, 6u, 8u, 12u, 13u, 16u (`--sp-1h`, `--sp-3`, `--sp-4`, `--sp-5`, `--sp-6`, `--sp-8`, `--sp-12`, `--sp-13`, `--sp-16`), and any other is `calc(var(--u) * n)`. ½u and ¼u live inside things (a control's padding, a tag's gap); **between blocks, space is whole cells**.
- **Counts and ratios work together.** A product may favor a set of counts that suits its type ratio: doubling counts (1, 2, 4, 8, 16), or the Fibonacci counts (1, 2, 3, 5, 8, 13) beside a golden ratio, so margins, gaps and type share one proportion. Counts measure space and the ratio measures type; knowing which to reach for is part of the craft.
- ¼u is rounded to a pixel, so where two quarters must add to a half, the second is `--sp-q2` (½u − ¼u), exact at any cell.

**Lines are planes.** A line can't be infinitely thin: it occupies pixels, by rule the pixels just after its coordinate (right of it, below it). So N cells drawn with their edges need N cells plus one line. `--line` is one logical pixel (3 device pixels on an iPhone); `--hair` is one device pixel (⅓px on 3×). Neither scales.

**The frame, the field and the module.** The page sits in a centered `.frame`: a **field** of whole **modules** (4 cells each) with a gutter of whole cells either side. The field's edges, and every fourth line in from them, are the strongest lines, so the structure is symmetric about the screen whatever its width. The grid bleeds past the frame to the screen's edges.

**Whole, on wide screens.** The target rounds to an even pixel, so ½u is whole. The frame steps by a module (at most 100u) and the gutter by two cells; the margins take the remainder. Something that lives in a margin, a column of navigation beside the page, asks the frame for a **reserve** (`--frame-reserve-start`, `--frame-reserve-end`): the frame stays centered while both margins cover their reserves, then gives up the other margin, then its own width ([D87](docs/decisions/D87.md)).

**Fitted, on touch screens** (coarse pointer, 1.5× and up: phones in either orientation, foldables, tablets). The screen's edge is the frame, so whole cells must span it.
- `--cells` = the even number nearest (width − hair) ÷ target, and `--u` = (width − hair) ÷ cells, rounded down to 1/32px. Even, so the screen's center is a line; minus a hair, because the last line needs its pixel.
- The gutter takes 2 or 3 cells (more beside a notch) so the field stays whole modules: 40 cells on a 393px iPhone (9 modules + 2 + 2, cell 9.81px), 44 on a 440px Pro Max (cell 9.97px), 74 on an 852px phone in landscape (cell 11.5px, since the target has grown by that width). The cell strays at most ~2.5% from its target.
- **Lines are counted in device pixels, space in cells.** The cell becomes fractional; lines never do. A 1× screen never fits: there a fractional cell would draw equal gaps as 5px and 6px.
- **Snapping.** WebKit (every iPhone) draws each box edge at the device pixel its coordinate rounds to, half up; the grid canvas uses the same rounding, so a card's edge and the grid line it stands on are the same physical pixel. Chrome's device emulation snaps to whole CSS pixels instead, so dev tools can't show the micro scale: check WebKit.
- 1/32px keeps every half cell exact in the browser's 1/64px layout grid, so nothing drifts. The cells fall short of the screen by up to about a pixel, split between the edges.
- Desktop windows don't fit by default (every space would breathe while the window is dragged). `data-unit-fit="on"` forces it, `"off"` refuses it; `--fit-width` lets a script pass the real width where a classic scrollbar makes `100vw` too wide; a script may set `--dpr` exactly (2.625 on some Android phones; the specimen does).
- **`--u` and `--cells` are not registered properties.** Chrome passes a registered length on at six significant digits (10.03125px became 10.0312px and the page drifted), and WebKit computed a registered cell count as 0 (blank iPhones in v0.3.0). Unregistered, they stay expressions. `--u-px` is a registered copy, kept for convenience and never for layout: scripts read the cell with `Trellis.cell()`, because WebKit computes a registered length on the root against the default text size when a page or app sets the root's font size. The count uses typed division; the old `tan(atan2())` trick is wrong in WebKit with viewport units.
- **The fitted cell is clamped** to 0.8–1.25 × its target, so a browser that gets the math wrong still lays out a usable page.

### The ratio

Fluid, fractal type from the [Type Scale Generator](https://lab.iriscocreative.com/tools/type-scale-generator.html).
- **Seven values set it** ([D93](docs/decisions/D93.md)): H1, body and the label in a wide space (`--h1-max`, `--body-max`, `--label-max`), the ratio in a wide space and in a narrow one (`--rh-max`, `--rh-min`), and the two spaces (`--c-min`, 20rem; `--c-max`, 90rem). Five follow, and a product may set any of them: the text step is the square root of the ratio (`--rp-min`, `--rp-max`), body in a narrow space is body less a narrow text step (`--body-min`), H1 in a narrow space sits as many steps above body as in a wide one (`--h1-min`), and the label is one size (`--label-min`). Every role is a straight line between its two ends, clamped.
- Headings step down from H1 by the ratio; the text sizes step out from body by half a step; **the ratio opens with the space**. **A heading is never smaller than body text:** each of its ends is floored at body's, so one a wide ratio would put under body takes body's size, in the heading's family and weight ([D89](docs/decisions/D89.md)). The default is 1.26 → 1.414, root two, with H1 at 72 in a wide space ([D94](docs/decisions/D94.md)); the examples run from 1.125 → 1.25 (Quarry) to 1.333 → 1.5 (Almanac), and set all twelve numbers themselves.
- Sizes respond to their **container** (`100cqi`), so a role inside a card scales to the card: the same structure at every scale of context.
- A heading carries its own space after it, proportional to its size (H1 0.33em, +0.11em a step), rounded up to whole cells. **In a stack it is the larger of that space and the gap, never the sum.**
- Known wrinkle: in a product that sets its own text step, xs can be larger in a narrow space than a wide one (the step opens faster than body grows), so CSS holds xs at its narrow size. At core's defaults xs is the same at both ends. The math view says so. Either accept a fixed xs or retune the paragraph ratio.

### Type on the cell

The cell is the only line on the page; the grid draws nothing else.
- **Headlines stand** (h1, h2, h3): line height rounds to whole cells, the box is trimmed to the capitals and the alphabetic baseline and padded to whole cells, so every baseline lands on a cell line.
- **Text hangs** (h4–h6, the paragraph roles, the label and the eyebrow): its own proportional line height, never forced to the grid. It hangs from a cell line by the top of its capitals, and its block rounds up to whole cells (`calc-size()`, or `settle.js`), so whatever follows starts on a line.
- **Blocks settle too**: anything marked `.settle` (a code sample, a figure) rounds up to whole cells, and a `.cluster` (a wrapping row of tags or chips) to the nearest cell, halves down, or up at the end of a surface (rule 6). Inside a cluster, things keep their own half-cell rhythm, like letters in a word.

### Five ways to meet a line

Everything on the page meets a cell line in one of five ways, and each name means one thing. Stand and Hang are how type meets a line; Inset, Outset and Center are how a box does.

| Relation | What meets the line | Example |
|---|---|---|
| **Stand** | The last baseline sits on a line. | `.t-h1` to `.t-h3`: line height in whole cells, every baseline on a cell line. |
| **Hang** | The top of the capitals sits on a line, and the block rounds up to whole cells. | A paragraph, `.t-h4` to `.t-h6`, the label, the eyebrow. |
| **Inset** | Content sits whole cells inside a surface's edge. | A card's padding: one cell in, so its first line starts on a cell line. |
| **Outset** | A surface's edge steps whole cells outside the line its content keeps. | A card steps `--outset` cells out, so the text inside it lines up with the text beside it (rule 5). `.list` rows and a `pre` in `.prose` do the same. |
| **Center** | A box straddles a line by the same amount either side. | An icon, a dot or a node on the lattice; a box centered on a line is even (rule 1). |

### Point, line, plane +

Kandinsky's three elements are the three measures: the **point** (the hairline, the ½ cell dot), the **line** (a cell's edge, rhythm in one direction), the **plane** (the cell and every surface built from cells).

An experiment (`experiments/solids.js`) carries them on: **solid** (the plane extruded: a cube, drawn at the lattice's 2:1 slope), **motion** (the solid turns; motion moves rest states, never layout), **transformation** (one form becomes another by moving its points: the cube's corners are cut until it becomes the cuboctahedron, Fuller's vector equilibrium, then the octahedron, and back, each form scaled to keep the same size). Where it could go: loading and empty states, transitions between views (a list becoming a field), the organic layer. Kept out of the core until a product needs it.

### Settling, and what the runtime writes

This is what `settle.js` writes, where, and why.

| It writes | On | Why |
|---|---|---|
| `--dpr`, `--fit-width` | `<html>`, every browser | The exact device pixel ratio (core only knows 2× and 3×), and the page's real width where a classic scrollbar makes `100vw` too wide. |
| `--settle-n` | Text, Safari only | Text hangs from a cell line and rounds its block up to whole cells. `calc-size()` does that in CSS, and Safari doesn't have it yet, so the script counts the cells a block needs, and core makes that count its least height. A count, not a measured gap: WebKit's trimmed heights jitter by 1/64px with where a box sits, and a box held at whole cells has nothing to add up. |
| `--settle` | Clusters, `.settle` blocks, and the half-cell blocks (`.pair`, `.chat-item-meta`, `.chat-quote`, `.chat-link`, `.chat-reactions`), Safari only | They keep their own box and take the missing space as end margin. |
| `--settle-start` | The block after text or an image in a nesting block in `.prose`, every browser | See Prose. |
| `data-prose-empty` | Empty blocks in `.prose`, every browser | See Prose. |
| `[data-trellis-cell]` | One hidden box on `<html>`, every browser | The cell, measured, for `Trellis.cell()`. It takes no space. |
| `--range-at` | Every `input.range`, every browser | How far along a slider's thumb is, 0 to 1, so its track can be inked up to it. Written when a slider arrives and on `input`; after setting `.value` from a script, call `Trellis.range(el)`, or `Trellis.range()` for all of them. |
| `--composer-h` | A `textarea.composer-input`, where `field-sizing` is missing | The composer's text grows a line at a time; without `field-sizing: content` its height is written here, when it arrives and on `input`. After setting `.value` from a script, call `Trellis.composer(el)`, or `Trellis.composer()` for all of them. |
| `tabindex="0"`, `data-trellis-reach` | A `pre` or `table` in `.prose` that scrolls sideways with nothing focusable inside, every browser | A keyboard can reach it (rule 20). Taken back when it no longer overflows; an author's own `tabindex` is left alone. |

These are variables, not padding values, because inline styles only ever set variables (enforcement rule 5): what the space means stays in the stylesheet. When Safari ships `calc-size()` (or the CSS rhythm property `block-step`, which is exactly this), the Safari half switches itself off and those inline variables disappear.

Everything queued is settled in one pass, in one frame, and it can't be lazy about what's off screen, since a visible block's position is the sum of every block above it. Numbers and what they changed are in [`tests/README.md`](tests/README.md).

### The math, in plain words

The same rules without CSS, for any platform. `math.js` is these formulas as functions, and `tests/math.js` checks them against the stylesheet in Chromium and WebKit. Lengths are in points: one CSS pixel at the reader's default text size, one pt on iOS, one dp on Android.

**The cell's target.** `k = min(text scale, 1.5)`, the reader's text size up to the cap. `target = clamp(narrow × k, (narrow − 500 × slope) × k + slope × screen, wide × k) × dial`, where narrow is 10, wide is 12 and `slope = (wide − narrow) ÷ 500`. At the default text size: ten points up to a 500-point screen, twelve from 1000 points on, a straight line between. Above a text scale of 1.5 the target stops growing; type does not.

**Whole, where a window frames the page.** `cell = target rounded to the nearest even point`. The frame is the largest whole number of 4-cell modules that fits, at most 100 cells; the gutter is 2 or 4 cells (4 percent of the width, rounded down to two cells).

**Fitted, where the screen's edge frames the page.**
- `width = screen − hair`, where a hair is one device pixel (1 ÷ pixel ratio). The last line needs its pixel.
- `count = 2 × round(width ÷ (2 × target))`. Even, so the screen's center is a line.
- `cell = width ÷ count`, rounded down to 1/32 point, and held between 0.8 and 1.25 of the target.
- Example: 393 points at 3× gives 40 cells of 9.8125.

**The gutter parity rule.** The field between the gutters must be whole modules of 4 cells. With an even count, that holds when the gutter has the same parity as half the count: `gutter = 2 + (count ÷ 2) mod 2`. So 40 cells take a gutter of 2 (field 36, 9 modules) and 42 take 3 (field 36). Beside a notch, the gutter is the fewest cells that clear the safe area, plus one if its parity is wrong.

**The ratio.** Two anchors, H1 and body, each with a size in a narrow space (320) and a wide one (1440). Of those four sizes a product sets the two wide ones and the ratio at each end; `body narrow = body ÷ √(narrow ratio)` and `H1 narrow = body narrow × narrow ratioᵖ`, where `p = log(H1 ÷ body) ÷ log(wide ratio)` is how many steps H1 sits above body. The text step is `√ratio` at each end. A heading n steps below H1 has ends `H1 ÷ ratioⁿ`, using the narrow ratio for the narrow end and the wide ratio for the wide end; paragraph roles step out from body the same way. A heading's ends are never under body's: `end = max(H1 ÷ ratioⁿ, body)`, at each end. `size = clamp(narrow end, narrow end + (wide end − narrow end) × (space − 320) ÷ 1120, wide end)`, where the space is the container the text sits in, not the window.

**Standing** (h1 to h3). `line height = size × line ratio, rounded to the nearest whole cells`. The box is trimmed to the capitals and the baseline and padded on top by `cap height rounded up to whole cells − cap height`, so the last baseline sits on a cell line and every line above it does too.

**Hanging** (everything else). The line height is `size × line ratio`, unrounded. The top of the capitals sits on a cell line, and `block height = height rounded up to whole cells`, so whatever follows starts on a line. A wrapping row of tags rounds to the nearest cell instead, halves down, except at the end of a surface, where it rounds up.

**A heading's own space.** `space after = size × (0.33 + 0.11 per step below H1), rounded up to whole cells`. In a stack it is the larger of that and the gap, never the sum.

### The token source

The values every platform shares live in one file, `tokens.json`, in the [W3C Design Tokens format](https://www.designtokens.org/). Lengths there are in **cells** or in **points**, never rem or px: a point is one CSS pixel at the reader's default text size, one pt on iOS, one dp on Android. Each group says which in `$extensions.trellis.unit`. Colors are light and dark pairs.

`node tools/build-tokens.js` writes the block of `core.css` between `tokens:start` and `tokens:end` from it; the rem conversion lives in that script and nowhere else. To change a shared value, change it in `tokens.json` and run the script. What stays hand-written in `core.css` is formula and web plumbing: the cell's rounding, lines, the frame, the gutter, the fit. `tests/contract.js` fails if `core.css` is out of date, or if a web unit gets into the token file.

## Layout

There are five levels, each with a few named parts. A custom design changes variables at any of the five rather than adding a sixth.

| Level | Parts | Notes |
|---|---|---|
| **Page** | `.frame` · `.shell` (navigation, main, an aside and a foot; a tab bar when its box is under 48rem, the aside under main when it is under 72rem; a column for the aside only when there is one) · `.shell.cc-top` (the navigation as a bar across the top; under 48rem its links fold behind a menu button and open as a left tray) | The field of modules and its gutters, centered. `.shell` holds a `.shell-grid`, since a query can't restyle the container it asks. **A translucent bar** is two variables on `.shell-nav` ([D115](docs/decisions/D115.md)): `--shell-nav-bg: color-mix(in oklab, var(--bg) 85%, transparent); --shell-nav-blur: var(--sp-1)`. Keep at least 85% of `--bg` or `--bg-raised`: there the words in `--text` and `--text-secondary`, so the brand and the links, hold 4.5:1 over anything, black or white. What doesn't: `--text-tertiary`, a button's thin edge, and the focus ring where the accent only just passes (set `--focus: var(--text)` beside them). A ground of your own color is yours to check. |
| **Section** | `.section`, `.section-head`, `.section-body`; `.cc-split` (head beside body when the container is wider than 54rem), `.cc-band` (the surface reaches the screen's edges, painted by an outset border image so it never adds scroll) · `.cover` (a full-screen opening: media to the edges, words in the field; its height is whole cells) | A band of the page. |
| **Composition** | `.stack` (one above another) · `.cluster` (a wrapping row) · `.pair` (two lines that belong together, a half cell apart: a name over its context; the block rounds up to whole cells; in a cluster it takes the spare room) · `.cols` (n equal columns) · `.split` (two columns at a ratio, `--split-a : --split-b`, 2 : 1 by default; one column under 36rem of container) · `.grid` (as many fixed tracks as fit) · `.cells` (the lattice: children placed by `--cell-x`, `--cell-y`, sized by `--cell-w`, `--cell-h`, in cells) · `.rail` (scrolls sideways and snaps) · `.list` (rows divided by hairlines: chats, actions, members, post indexes) · `.board` (lanes of cards in a sideways scroller) · `.prose` (bare tags from an editor; see Prose) | How a region arranges what it holds. |
| **Surface** | `.card` | Padding, an edge plane, its own container. Steps out (Outset). |
| **Element** | type roles, `.tag`, `.button`, `.avatar`, `.float` … | The primitives. |

In every part, children start on cells, space between blocks is whole cells, size comes from the container (`@container`) rather than the window, and a context changes variables while the markup stays the same.

**Rules for free and animated layouts.** These keep open, moving layouts on the cells at any size:
1. **Rest on the lattice, move off it.** Layout places things on cells. Every motion starts and ends at a rest position on the lattice.
2. **Durations come from a set.** There is one small set of durations (`--dur-*`) and three easings (in, out, spring). The plan is to derive them from a seed, as space and type are ([D70](docs/decisions/D70.md)). Reduced motion collapses them, and the rest state is complete on its own.
3. **Free things live in layers.** An organic or animated element sits in its own layer (`.cells`, a canvas, a positioned layer), its coordinates in cells, and the flow around it doesn't depend on it.
4. **Arrangements are in cells.** A creative arrangement is written in cells or modules and re-placed by container queries, so it has no pixel positions.
5. **Content stays in the field.** Text and controls stay in the field. A band's surface, a photograph or a rail may reach the screen's edges.
6. **Withdrawn** ([D71](docs/decisions/D71.md)). Scroll scenes, built on scroll-driven animation rather than scroll listeners, moved to the plan for `.scene` until something uses them. The number is kept so later rules don't renumber.

**A post type is a composition of these plus prose.** The specimen works one through: an article is a `.cover`, then a `.split` holding `.prose` and a `.list` of related posts, then a `.list` of comments. There's no `.post` class, and Trellis doesn't plan one.

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
| `pre` | a surface with one cell of padding, so it steps out like a card (rule 5) |
| `table` | a lattice: every line in a cell is whole cells, so rows stand on the grid; a wide table scrolls inside itself |
| `figure`, `img`, `video` | full width, corners from `--shape-card`; a caption hangs from the next line |
| two or more images in a `figure`, or alone in a `p` | a gallery of whole-cell squares, cropped (3 across, 2 in a narrow container). An image counts alone or inside a link. A paragraph is a gallery only when images are all it holds (images, links with no class, a break): two links in a sentence do not make one, and a tag, a chip, a face (`.avatar`), a link with a class or any mark in it makes it text, where what is inline stays inline ([D106](docs/decisions/D106.md)) |
| `iframe` | full width at 16:9, its height rounded up to whole cells (`--embed-w`, `--embed-h`) |
| `hr` | one line, on a coordinate, given back so what follows is on a line |
| `details` | a block; its `summary` hangs, a full-row target with the shared states and a chevron in a two-cell margin, centered on its capitals, that turns when open; the contents take the same inset in `--details-ink` (secondary text) and settle when opened; consecutive details are rows, a hairline between them |
| `a`, `code`, `kbd`, `strong`, `em`, `mark`, `small`, `sub`, `sup`, … | marks: `line-height: 0`, and sub and sup are moved rather than baseline-shifted, so none can stretch a line |

**Space.** The column's gap is 2 cells, and a heading follows the stack rule from The ratio: it takes the larger of its own space and the gap. It adds whole cells before it (h1, h2: 4; h3: 2; h4–h6: 1) so it belongs to what it introduces, and none directly after another heading.

**What the editor emits that has no role.** Decided 2026-11-07. Sanitize when content is saved if you can; this is the floor for when you can't.

| It emits | We do | Why |
|---|---|---|
| A style on a span, a mark or a `font` tag | Drop type, color, background and space; keep `font-weight`, `font-style`, `text-decoration` | Google Docs writes bold as a styled span, so emphasis has to survive. Pasted `color: #000` is invisible on a dark theme, and a pasted `font-size` breaks the line. |
| A style on a block | Drop the same, plus margins, padding and float; keep `text-align` | The block keeps its role's size, line and space. |
| An empty paragraph (`<p></p>`, `<p><br></p>`, `<p>&nbsp;</p>`) | Hide it | An empty paragraph isn't space; space is the column's. CSS catches `:empty`; `settle.js` marks the other two with `data-prose-empty`, because CSS can't tell them from content. Without the script they take one settled line. |
| A nested `div` from a paste | `display: contents`: its children join the column | It carries no meaning, and it would otherwise break the gap and every direct-child rule. A `div` with only text and marks is a paragraph, since that is what a browser's own editor makes of a line. A `div` with a class is left alone: it's a component. |
| An element we don't know | A block that rounds up to whole cells | So whatever follows is on a line. |

**The limit of CSS.** `<li>text<ul>…</ul></li>` puts text in an anonymous box, and a caption follows an image of any height; neither can be rounded in CSS. `settle.js` measures these and writes `--settle-start` on the block that follows, in every browser. Without the script the outer block still rounds to whole cells, so the page recovers at the next block: only the lines inside drift. One case stays unsettled even with it: bare text mixed with blocks inside a pasted `div`, which becomes an anonymous box in the column. And CSS can't see bare words: a paragraph of nothing but words and two images is read as a gallery, and so is one with a text link and a single linked image. Put the images in a `figure`, or any mark around a word.

## Color

**A palette from one color.** A product chooses one seed, the accent. The other seeds are worked out from it, and any of them can be set by hand. Every color role is derived from a seed, the way every type size is derived from the ratio. Seeds are knobs a product sets. Roles are tokens a product reads and doesn't set.

| | What it is |
|---|---|
| **Seeds** | `--seed-accent`, and the seeds that follow from it (listed below). Each is one color, in its light-theme form. |
| **One seed** | Each of the nine follows a token derived from the accent, `--derived-neutral` to `--derived-alert` ([D90](docs/decisions/D90.md)): it has no default of its own, and core reads it as `var(--seed-neutral, var(--derived-neutral))`, so one a layer leaves follows again on every scope ([D96](docs/decisions/D96.md)). A kind is the accent turned around the hue wheel, a fifth of it apart; a status keeps its own hue and takes the accent's strength; topic is the accent a step darker; the neutral is a trace of the accent's hue. Each takes the accent's lightness, kept clear of `--ink-flip` so its ink reads at 4.5:1 at any hue, and no more chroma than sRGB holds there. The numbers are in `tokens.json` (`color.derive`), and `math.js` has it as `derived()`. |
| **Neutral roles** | `--bg`, `--bg-raised`, `--bg-sunken`, `--bg-hover`, `--text`, `--text-secondary`, `--text-tertiary`, `--text-faint`, `--border`, `--border-subtle`, `--border-strong`: a seed's hue and chroma at a lightness for each theme, the ground seed's for grounds and edges and the ink seed's for text (both the neutral unless set). The lightness ladder is in `tokens.json`. |
| **Hues** | `--accent`, `--kind-*`, `--ok`, `--warn`, `--alert`: the seed in the light theme, and in the dark the same color lifted by `--color-lift` (0.17 of OKLCH lightness). `--focus` is the accent. `--bg-hover` no longer paints hover (the state layer does) and stays one minor for products that read it. |
| **Stages** | A process in order: an idea, a plan, work underway, work done, what is put away. A product names its steps and may use fewer than seven. Each seed gives three roles ([D107](docs/decisions/D107.md)). `--stage-1` … `--stage-7`, the fill: the seed, and in the dark the seed lifted, but no further than a derived seed is lifted, so a pale seed is not washed out to white. `--stage-1-ink` …, the same hue where it reads as text: no lighter than .48 by day, no darker than .76 at night. `--stage-1-tint` …, the fill at 14%, a tag's share, over whatever is behind it. Where the lightness moves the chroma moves with it, so a seed inside sRGB stays inside. Unset, a stage is the accent turned an eighth of the wheel further than the stage before it, at .85 of its chroma: 45° to 315°, never the accent's own hue. A dot takes the fill, a ring the ink (a line needs it), a tag is tinted from the fill: `.dot.cc-stage-3`, `.tag.cc-stage-3`. |
| **Ink** | Ink on a solid fill is computed from the fill: white on a fill darker than `--ink-flip` (0.58), a dark ink of the fill's own hue on a lighter one. `--accent-ink` is the accent's; a solid tag and a badge compute theirs from their kind or status the same way. |
| **Mixes** | A tint, an edge or a wash is a role mixed with `color-mix(in oklab, …)`: a tag's fill and edge from its kind, an avatar's wash from its ring, the scrollbar and the skeleton from the ink, a scrim from black. A color is a role, or a mix of a role. |
| **Gradients** | `--gradient-accent` (the accent turning its hue by `--gradient-turn`) and `--gradient-surface` (raised to sunken) are an interpolation space and stops, in `--gradient-space` (OKLCH). Add a direction or a shape: `linear-gradient(to right var(--gradient-accent))`. |

**The seeds.** Set any of these to choose your own color. Left unset, each follows the seed named.

- **Nine from the accent:** `--seed-neutral`, one per kind (`--seed-person`, `--seed-group`, `--seed-event`, `--seed-course`, `--seed-topic`) and one per status (`--seed-ok`, `--seed-warn`, `--seed-alert`).
- **Seven stages of a process,** `--seed-stage-1` to `--seed-stage-7`, in order ([D107](docs/decisions/D107.md)). Unset, each follows the accent. Set, a stage can be any color, including a pale one.
- **Paper and ink, from the neutral:** `--seed-ground` for every ground and edge, and `--seed-ink` for every text role, so the paper and the ink can be different hues ([D96](docs/decisions/D96.md)).
- **Night:** grounds and edges take `--seed-night` (which follows the ground) and are lightened by `--night-lift`, so a ground can change hue after dark ([D97](docs/decisions/D97.md)). At 0 it's core's night; about .15 gives a dusk. `--seed-accent-night` gives the accent its own night color in place of the lifted one, and `--seed-ink-night` does the same for text (it follows the ink) ([D98](docs/decisions/D98.md)).
- **Day:** `--day-depth` darkens grounds and edges by day. It's 0 by default; .019 gives a light beige ground ([D98](docs/decisions/D98.md)).

**How roles are made.** Every role is `light-dark()` of two relative colors (`oklch(from var(--seed-…) …)`), and `math.js` derives the same seeds and roles in arithmetic for a native screen. Roles are worked out on `:root` and on every `[data-product]` scope, so a seed set on a scope recolors everything in it. A seed set on a box that isn't a scope does nothing.

**Contrast.** `tests/contract.js` checks contrast for core and every product layer, in both themes, on the root and on every scope. A scope whose rule asks for the dark theme is checked in the dark theme alone ([D114](docs/decisions/D114.md)). A seed that fails one of these fails the contract:
- text, secondary and tertiary ink: 4.5:1 on the page and on every raised level
- ink on the accent and on every solid kind and status: 4.5:1
- an outline button's ink, from the accent, confirm or destructive: 4.5:1 on the page and on every raised level, hovered and pressed too
- the accent: 3:1 on the page
- each status: 3:1 on the page and on every raised level, because a ring dot draws it as a line ([D103](docs/decisions/D103.md))
- every stage's ink: 4.5:1 on the page and on every raised level, whatever color the stage was given ([D107](docs/decisions/D107.md))

A stage's fill has no floor, so it can be pale.

## Rules

### Edges

1. **Edges land on lines**, or a hairline or quarter cell off them. A box centered on a line is then even (14 = 12 + hairline; 18 = 12 + ¼u each side). A box pinned to something else, such as the screen's edge, takes whatever size lands its free edge on a line. **The grid fits whatever frames the page**: the screen's edges when fitted, the `.frame`'s own edges on a wide screen.
2. **Columns round to cells.** `.cols` rounds every track down to whole cells, so each column's left edge is on a line. `.grid` uses fixed tracks that don't stretch.
3. **A surface's edge is a plane after its coordinate, and never changes its size.** A card draws its edge as an `::after` frame one line larger: inside the box on the left and top, just outside it on the right and bottom, so each edge lies on its grid line's pixels. A surface that clips (it scrolls, or has `overflow: hidden`) would cut that frame off, so it keeps an inset outline or lets an inner scroller clip, at the surface's own edge and corners (`.card-scroll`, [D95](docs/decisions/D95.md)). Floats align to anchors, not the grid. Controls with a fixed height keep a real border and give it back in their padding.
4. **Draw grids in device pixels, never with repeating CSS gradients.** Safari rounds each repeated tile and the error grows across the screen.
5. **Surfaces step out (Outset).** A card's edge steps `--outset` cells (a product knob, 1 by default) out into the space around it, so the text inside a card with a one-cell padding lines up with the text outside; a card with more padding still steps out one cell. A row steps out as a whole only when it holds nothing but cards; a card inside one column of a row stays in its column; nested, a card steps out into its parent's padding. Gutters are at least two cells, so a card that steps out never reaches the screen's edge. **Outset is clipped by any ancestor with hidden overflow** (a scroll pane, a clipped section), so a card there silently loses its step-out: give that ancestor `--outset: 0`, or a cell of inline padding. `.list` rows and a `pre` in `.prose` step out by the same rule.

### Text

6. **Between blocks, space is whole cells.** A ½ or 1½ cell gap between stacked blocks puts everything after it off the grid. So `.u-gap-q` and `.u-gap-h` reach clusters only, never a stack. A cluster rounds its height to the nearest cell, halves down, so its content can overflow into the gap after it by up to half a cell; that is safe only because that gap is whole cells and at least one. At the end of a surface (the last cluster in a card, a modal body or a member tile) nothing follows but the surface's padding, so there it rounds up instead. A row that holds half-cell padding is one thing, like a button: its edges stay on lines and its contents keep their own rhythm (`.list.cc-dense`).
7. **Center only what differs by an even number of cells**; otherwise align to `start`.
8. **Beside a control, text centers its capitals on the control** (`.cap-center`): both are trimmed to cap height. A label that wraps hangs from its top line instead and rounds up to whole cells, like any text: `settle.js` marks it (`data-trellis-wrap`) in every browser. **In a list row** the parts hang from one line by default, which suits a face beside two lines. A mark the size of a line (a dot, an icon, a small face) sits in a `.list-mark`, a box as tall as a capital with the mark centered in it, so it stays on the middle of the first line when the row wraps. A row that is one line and its controls sets `--list-align: center`, with `.cap-center` on its words ([D104](docs/decisions/D104.md)).
9. **An icon beside capitals or numbers centers on the cap height; beside lowercase text, on the x-height** (`.snap-x`).
10. **Marks never stretch a line**: code, mono, bold, italic and links get `line-height: 0` inside text. (Plain spans are left alone.)
11. **Truncate sideways only** (`.u-truncate`: `overflow-x: clip`). A trimmed box ends at the baseline, so `overflow: hidden` cuts every descender. **Several lines are `.u-clamp`** (`--lines`, two unless set), never `-webkit-line-clamp` with `overflow: hidden` on a role: that cuts the tails off g, p and y, and where the role rounds its box up it shows the top of the next, hidden line. `.u-clamp` clips from the top instead: its lines, and a descender's depth under the last baseline (`--clamp-reach`, .24em), never as far as the hidden line's tall letters. The clip is drawn, not laid out, so the box is the role's own and what follows is on the same line with or without the clamp ([D105](docs/decisions/D105.md)). Safari leaves a clamp's box untrimmed, so there `settle.js` measures the trim and puts the text on its line; without the script it is a plain clamp a few pixels low. In a headline set tighter than about 1.15, the hidden line's ascenders reach into the descenders' depth and the clip stops at them; an accent on a hidden capital can show as a speck.
12. **Withdrawn** ([D68](docs/decisions/D68.md)). It said an icon taller than its line gives the overhang back; core had no mechanism for it. Whether an icon overhangs its line is the component's choice. The number stays.

### Primitives and variants

13. **One concept, one primitive.** Variants are `cc-*` modifiers that change the primitive's own variables.
14. **Products turn knobs.** A product layer only sets variables on `:root`. Primitives read the knobs; variants and contexts set the primitive's own variables, so a product never overrides a variant by accident.
15. **Context changes variables, not markup.** `.cc-dense .card { --card-pad: u }`; a card is a container, so its type scales to it.
16. **Floating surfaces align to their anchor, not the page grid.** One `.float` for every popover, options card and tooltip. Core puts it in the top layer at a fixed position and defines its motion once. **Open it as a popover:** `popover` with a `popovertarget` button, or `popover="manual"` and `showPopover()` from a script; only as a popover is it fixed, stacked over everything (a modal too, which no `z-index` can do) and faded. Closed, it is gone. **Place it through two variables,** `--float-x` and `--float-y`, its left and top on the screen; `float.js` writes them: `Trellis.float.open(float, anchor)` puts it under its anchor, keeps it on the screen, flips it when there is no room, follows the anchor when anything scrolls, and closes it on Escape, a press elsewhere, or when the anchor scrolls out of view. A float marked `.cc-anchor`, opened by `popovertarget`, is placed by CSS anchor positioning instead, where the browser has it ([D80](docs/decisions/D80.md)); use one or the other. A popover in the top layer is made a block, so `display: -webkit-box` on the float itself does nothing: a tooltip that caps its lines does it on a child.
17. **Control type is fixed, and listed.** Controls sit in rows of a fixed height, so their labels don't scale with the container: `--fs-control-xs` … `--fs-control-lg` are the only font sizes outside the type roles. `--white` and `--black` are the only raw neutrals (ink on a solid color or a photo). **A control is never shorter than its own type:** past the cell's cap (rule 19) a label can outgrow its control, and then the control grows by whole cells from its own height (button, icon button, tag, input, tab, badge). At default sizes every label is shorter than its control, so nothing moves.
18. **Touch targets.** On a coarse pointer every control's hit area is at least `--hit-min` (44px, Apple's guidance), whatever it draws: an invisible `::before` grows around it, so compact controls are still easy to tap.
19. **The reader's text size wins; the cell stops at 1.5×.** Type follows the reader's setting all the way. The cell follows it up to 1.5 times the default (`text-scale-max`), and above that layouts reflow instead of the cells growing. iOS and Android accessibility sizes reach about three times normal, which would turn a 40-cell phone into a 13-cell one. `tests/align.js` checks the specimen at 312% (the largest iOS size) in both engines and all three layers: no sideways scroll, nothing off its line.
20. **Every sideways scroller can be reached by keyboard.** A keyboard scrolls only what it can focus, and Safari doesn't make a scroller focusable on its own. A `.rail` and a `.board` carry their tab stop in the markup: `tabindex="0"`, `role="group"` and an `aria-label`, since only the author has the words. A `pre` or a `table` in `.prose` comes from an editor and can't carry one, so `settle.js` gives it `tabindex="0"` when it overflows with nothing focusable inside, and takes it back when it no longer does. `tests/align.js` fails any region that scrolls sideways with no way in.
21. **Depth is the ground.** A surface on a surface takes the next step of the neutral ladder, never a shadow by default: a card, a grouped list, a modal or a float is level 1 (`--bg-raised`); a card or grouped list inside one is level 2 (`--bg-raised-2`), and inside that level 3 (`--bg-raised-3`), where it stops (`--surface-level` says which). In light each step goes back toward the page, in dark each step is lighter. A surface on a surface is drawn by its ground alone: it has no edge of its own, pads one cell, and keeps at least a cell from the surface around it (it steps out only into padding its parent can spare), so its text stands on its parent's line ([D88](docs/decisions/D88.md)). Nested corners are concentric: a card's corner is its parent's less the gap between the two edges, never under a quarter cell. Rows in a group (`.list.cc-group`) share one surface and divide by hairlines that start at the row's text. A bottom tray keeps a grabber (`.modal-grabber`); a modal or bottom tray under another steps up two cells for each level, so it peeks by whole cells; three are open at most, and a fourth replaces the third. Only the top surface takes input. Floats and modals keep `--lift`, since they sit over the page; a card may take a shadow where a design asks for one, but depth never depends on it ([D81](docs/decisions/D81.md)).
22. **Padding clears the corner.** A card's content stays out of its corner's curve. With the same padding p on both sides, content clears a corner of radius r from p = r (1 - 1/√2), about 0.293 of the radius. With the other side further in, at q, less will do, and none once q passes the radius: 0.415 (r - q), the chord of the curve. A card's padding in each direction is held to the smaller of the two: where it falls short it grows by whole cells, and where it clears the corner it is left alone, so nothing moves at the defaults or for a tight side beside a roomy one. `--card-inset-inline` and `--card-inset-block` are what a card lays out; bleeding media and scrollers give back those, so they still meet its edges ([D113](docs/decisions/D113.md)).

## Primitives

| Primitive | Anatomy and variants |
|---|---|
| `.avatar` | The photo is the box, on whole cells. Gap and ring are spread shadows outside it, concentric at every size. **Shape is kind**: circle = person, rounded square (corner = size ÷ 4) = group, rounded square in the accent = a space (`.cc-space`: a project with people of its own, such as a collaboration). `.cc-plain` draws no gap or ring, for dense rows. Initials on a wash of the ring color. Sizes u · 2u · 3u · 4u · 6u · 8u · 12u. `.avatar-dot`, `.avatar-stack`. **A photo** is the avatar itself, `<img class="avatar cc-md" src="…" alt="…">`, cropped to the box by cover. With a presence dot the face is inside: `span.avatar.cc-md > span.media.cc-round[style="--media-w: 3; --media-h: 3"] > img`, then `span.avatar-dot`, the two counts the avatar's own. |
| `.tag` | **The archetype**: a height; a corner; padding equal to the corner (½u to u); a hairline edge and a tint mixed from one kind color; a label trimmed to its capitals. Kind, emphasis, size, state and context change variables only. A stage (`.cc-stage-1` … `.cc-stage-7`) is a color like a kind's: a step of a process, in the product's own color ([D107](docs/decisions/D107.md)). **Any other color, per value,** is the one variable on the element: `<span class="tag" style="--tag-color: var(--my-topic)">`, a role, a mix of roles or a variable the app holds; the tint, the edge, the `.tag-dot` and, `.cc-solid`, the ink all follow, and it wins over a kind. **`.cc-quiet`** is no kind: the neutral's tint and edge, its words in `--text-secondary`, for what is worth a label and not a color ([D115](docs/decisions/D115.md)). By default, and in Almanac: pills. In Quarry: ¼u corners, uppercase. |
| `.button`, `.button.icon-button` | Heights 1½u · 2u · 2½u · 3u · 4u; padding half the height; label trimmed to cap height; hit area ≥ 44px on touch. **An icon button is a button:** `.icon-button` is a modifier that makes it square, and alone it draws nothing. Markup: `<button class="button icon-button cc-ghost cc-sm" aria-label="…">`. **Its face** is a product's or a scope's: `--font-button`, `--fw-button`, `--button-case`, `--button-tracking` ([D100](docs/decisions/D100.md)); a spaced label stays centered. **Kinds** ([D115](docs/decisions/D115.md)): `.cc-alert` is destructive and `.cc-ok` is confirm, filled with the status as a solid tag is. **`.cc-outline`** takes a kind's fill away: the edge and the label are its color, moved to where it reads as text in both themes, hovered and pressed too. It works on `.cc-alert`, `.cc-ok` and `.cc-primary` (the accent); alone it is the text's ink; `--btn-color` in a context is any other color. `--btn-tint: 10%` puts a share of the color in its ground: up to a tenth, its label holds 4.5:1, hovered too. A button in a color of its own sets `--btn-bg`, `--btn-ink` and `--btn-border`. **A count** is a `.badge.cc-corner` inside an icon button: `<button class="button icon-button" aria-label="Chat, 3 unread"><svg class="icon">…</svg><span class="badge cc-corner" aria-hidden="true">3</span></button>`. The button's label says the count, since it is the name a screen reader reads. |
| `.card` | Padding from two knobs, `--density-card-pad-inline` (the sides) and `--density-card-pad-block` (top and bottom). Both follow `--density-card-pad`, so they are equal unless a product splits them: trimmed text makes equal padding optically equal, and a product may still tighten the sides and keep the vertical rhythm, as far as the corner's curve allows (rule 22). Corner from `--shape-card`, in `.cc-dense` from `--shape-card-dense` (a cell unless set: it does not follow `--shape-card` unless a product sets it to `var(--shape-card)`), nested corners concentric, an edge plane, a container for its own type. |
| `.float` | Opened as a popover and placed through `--float-x` and `--float-y` (rule 16; `float.js` places, follows and closes one). `.options-card` (16u wide, ≤ 24u tall, items 2½u, unless its variables say otherwise; past the cell's cap its width grows with its type in whole cells, up to the screen less half a cell each side, so a label at 312% text is not cut off where it fits the screen, [D111](docs/decisions/D111.md); a compact product sets its rows and padding once, with `--density-option-h`, `--density-option-fs` and `--density-options-pad`, and a segmented control's with `--density-seg-h` and `--density-seg-pad`), `.tooltip` (the page's ink as its ground, the page as its ink). Motion defined once on `.float[popover]`. |
| `.choice` | **Checkbox and radio ([D109](docs/decisions/D109.md)).** A row whole cells tall, with the native input as its box and the words' capitals centered on it. See [Checkbox, radio and switch](#checkbox-radio-and-switch). |
| `.switch` | **On or off, and it takes effect now.** The same row with a track for a box. See [Checkbox, radio and switch](#checkbox-radio-and-switch). |
| `.range` | **A value along a line.** An `input type="range"` on the cells: a row two cells tall, a track a quarter cell thick, a thumb a cell and a half across; on a coarse pointer a two-cell thumb in a row as tall as the touch target. The track is inked up to the thumb: `settle.js` writes how far along it is as `--range-at`, 0 to 1, when a slider arrives and when it moves, and a script that sets `.value` calls `Trellis.range(el)`. `.cc-zone` inks the stretch from `--range-a` to `--range-b` instead: where the value has an effect. A slider that draws a scale paints `--range-fill` itself, and may fill its thumb with `--range-thumb-fill`. [D91](docs/decisions/D91.md). |
| States | **One relational layer for every control.** Hover, press and selected mix the control's own ink into its own fill by a share (`--state-hover` 6%, `--state-press` 12%, `--state-selected` 10%, product knobs), so the same rule works on a light fill, a solid one and none. Hover only where a pointer can hover, so a tap never leaves it stuck. Selected keeps a mark of its own too (a border, an edge, a check, a solid tag, a tab's line), so it can't be mistaken for hover; an edge mark is a straight line, and the corners it touches are square ([D85](docs/decisions/D85.md)). Disabled (`:disabled`, `aria-disabled`) drops hover and press and quiets the ink. Focus is the one global ring: an input no longer adds a second cue, a row that links rings the whole row, a scroller's ring is drawn inside it. **A control of your own** takes the same layer with `.u-state`: set `--state-fill` and `--state-ink` on it, and every state follows. |
| Scrollbars | One archetype (`--scrollbar-width`, `--scrollbar-size`, `--scrollbar-thumb`, `--scrollbar-track`); variants `.cc-scroll-thick`, `.cc-scroll-none`. |
| Layout | See Layout: `.frame`, `.section`, `.stack`, `.cluster`, `.cols`, `.split`, `.grid`, `.cells`, `.rail`, `.context`, `--outset`. |
| Type roles | `.t-h1`…`.t-h6`, `.t-xl`, `.t-lg`, `.t-body`, `.t-sm`, `.t-xs`, `.t-label`, `.t-eyebrow` (the label one paragraph step up, for what opens a section), plus `.snap` / `.snap-x` for other text and `.settle` for any block. Label text (`.t-label`, `.t-eyebrow`, a prose `th`) takes `--fw-label-text`, 400; controls keep `--fw-label`. The eyebrow takes the label's case and spacing unless `--eyebrow-case` and `--eyebrow-tracking` say otherwise ([D102](docs/decisions/D102.md)). |

Added in v0.7.

| Primitive | Anatomy and variants |
|---|---|
| `.field`, `.input` | **One box for input, select and textarea.** It draws at the product's control height, so it matches a button beside it, and occupies whole cells, so what follows stays on a line. A real border, given back in its padding. Lines of a textarea are whole cells. States (`[aria-invalid]`, `:disabled`, `:read-only`) change variables. On touch, at least the 44px target and 16px type, or iOS zooms the page. |
| `.input.cc-slots` | **A field with something in its box ([D116](docs/decisions/D116.md)).** A `div` drawn as an input in every way, holding a bare `.input-control` (an input or a select). What comes before it stands at the box's start, what comes after at its end: an `.icon` or an `.input-unit` (text), which are drawn and nothing more, or a `.button.icon-button`, which keeps its own click, ring and touch target. The control reaches every edge of the box, so a click on a unit or an icon focuses it and a browser's autofill fills the whole box; a number's spinner and a search's clear stay between the slots, and the browser's own clear and reveal go where a button follows the control. The box takes the one focus ring and the invalid, disabled and read-only states. A select takes a start slot only; a textarea takes none (that is the composer). Name a unit in the label ("Your gift, in dollars") and hide it from assistive technology. |
| `.composer` | **One box for writing a message**: leading controls, the text, trailing controls and a send button inside one edge, three cells for one line and two more for each line after, to `--composer-max`, then it scrolls. The box takes the focus ring; send wakes with text, in CSS (`:placeholder-shown`, so give it a placeholder). Inside a `.field`, whose hint starts at the text and is gone on touch, since it names keys. A visible label is optional: an `aria-label` or a visually hidden label names it, and the placeholder names the recipient. |
| `.modal` | **One archetype on the native `<dialog>`,** opened with `showModal()`, so the top layer, focus trap, Escape and inert page come free. `.modal > .modal-inner > .modal-header / -body / -footer`, as the standard's markup contract. Its motion: enter 200ms, backdrop 250ms, exit 150ms, scale from .96. It scrolls whole, so a modal taller than the screen reaches its top. The scroll lock needs no counting: `html:has(.modal[open])`. It replaces a scripted modal manager, which builds by hand what the dialog gives. `settle.js` closes it on a backdrop click, but only when the press began on the backdrop too, so selecting text in the card and letting go outside never closes it; it calls `requestClose()` where the browser has it, so a `cancel` handler can refuse. `data-trellis-stay` opts a modal out: one that must be answered, or an app that handles the backdrop itself (the snippet is in `REACT.md`). **A step counter** ("Step 2 of 3") goes above the title, the two in a `.stack`, or at the start of the footer. Beside the title it can't share a baseline: the header's parts start at one top, where small text hangs its capitals and an h1 to h3 stands, and even two that hang share their capitals' line and not their baseline. |
| `.modal.cc-tray` | The same parts, changing variables only, sliding in from a side on the spring curve: flush to its edge, its two ends inset by `--tray-margin` (2 cells), its free side's corners round. On the left by default; `.cc-right`, `.cc-top`, `.cc-bottom`. **On a screen under 48rem a centered modal is a bottom tray**; a side tray stays a drawer. `.cc-sheet` (the bottom, edge to edge) and `--dur-sheet-in`/`--dur-sheet-out` stay one minor as aliases. |
| `.tabs`, `.tab` | Whole cells tall, on a baseline that's a plane after its coordinate. Selected is `[aria-selected="true"]`, `[aria-checked="true"]` (a segmented control written as `role="radio"`) or `[aria-current]` on a link. `.cc-seg` is the same tabs as a segmented control. |
| `.chat-item`, `.chat-thread` | An avatar and a body, for messages, walls and system lines; `.cc-own`, `.cc-wall`, `.cc-system` and `.cc-removed` change variables. Bubbles by default; **flat rows** in a `.chat-thread.cc-flat`: everyone at the start, a three-cell plain avatar and the name and time once per run, each later message's own time in the avatar's column on hover, the row filled on hover with its actions on its top edge. A message carries a quote, a file, a link preview and reactions, drawn the same both ways. The thread holds dividers (a day, the unread line) and the typing line, which starts at the text's column. **A bubble holds typed text or prose ([D112](docs/decisions/D112.md)).** Words and inline marks keep the line breaks and spaces they were typed with; a bubble of paragraphs, prose or any block sets its own lines (so in hand-written markup, keep plain text on the tag's line). `.prose` in a bubble, or on it, is as wide as its words up to the message's measure; with code or an embed in it, and on a wall, it takes the measure. |
| `.member-tile` | A `.card` with a person in it. `.cc-row` puts the avatar beside the words. Without `.card` it is the same row inside a card of something else. **Beside an avatar taller than the words,** a class of your own on the `.member-tile-body` with `align-self: center` (its place, so yours to set) puts them on the avatar's middle; `--tile-align` moves the avatar, not the words. **Over a banner** (`.card.stack > .media.cc-bleed` + `.member-tile.cc-row`), a negative `margin-block-start` in whole cells on the avatar lifts it over the image's edge. |
| `.badge`, `.dot` | A count, and the smallest mark of a state. A dot that carries meaning by itself takes `role="img"` and a label; one beside words that say the same is hidden from assistive technology. **A ring** (`.dot.cc-ring`) is the same mark not yet filled, for a state before it is reached (an idea, a plan) beside the dots of the states after it. Its line is a quarter of the dot, one line at the least and two at the most, so a half-cell bead draws a finer ring; `--dot-ring` sets it. Its inside is clear: on a line (a rail, a rule) `--dot-fill: var(--surface)` keeps the line out of it. A quiet ring takes the next ink up (`--text-tertiary`), since a line is thinner than a fill ([D103](docs/decisions/D103.md)). **A stage** (`.dot.cc-stage-1` … `.cc-stage-7`) is a step of a process: the dot takes the stage's fill, which a product may make pale, and a ring takes its ink, which reads on every ground ([D107](docs/decisions/D107.md)). |
| `.skeleton` | A surface's real structure, shimmering. A text slot keeps its role, so it settles to the same cells and nothing moves when the words arrive. Anything that draws itself becomes a `.cc-block`, sized in cells. |
| `.card-link`, `.media` | **A card is one link, and an image fills its frame** ([D108](docs/decisions/D108.md)). The card's title is an `a.card-link`; its cover spans the card, takes the state layer and draws the focus ring round the card, and the card's own buttons, tags and fields are raised above it, so they keep their clicks (a list row's `.list-link` does the same for its end). Never an `<a>` round the card. `.media` is a frame sized in cells (`--media-w` by `--media-h`; no width fills the column) holding a real `<img>` with its `alt` and `loading="lazy"`, which fills it by cover at `--media-focus`; nothing moves when it loads. As a card's own child it bleeds to the card's edges and takes its corners: `.cc-bleed` (a banner at the top or foot), `.cc-bleed-start`, `.cc-bleed-end` (a strip three cells wide, as tall as the card, which becomes a row), `.cc-fill` (the card's whole ground, under a scrim, its words white at the foot, and white too the ink and edge of a control with no fill of its own, and the focus ring; a primary button, a solid tag and a field keep theirs). `.cc-round` for a face. |
| `.card-choice` | **A whole card is a choice ([D116](docs/decisions/D116.md)).** The card's title is a `label.choice.card-choice`, which covers the card: a press anywhere chooses it, and Space, a radio group's arrows and the form stay the native input's. The card's own fields, buttons and links sit beside the label, never in it, and are raised above the cover. Chosen, the card has an edge two lines thick and a wash under its words; mixed has the edge alone; invalid is the alert's edge, from the input or its `role="radiogroup"`; disabled sinks the ground. The focus ring is round the card. Put the cards in a `fieldset` or a `role="radiogroup"` with a name, the radios under one `name`, and the description in an `aria-describedby`. **A `.card-link` goes somewhere, a `.card-choice` is a value:** a card is one or the other, and a `.card-link` in a choice card is a plain link with no cover. |

### Checkbox, radio and switch

Checkbox, radio and switch share one design ([D109](docs/decisions/D109.md)).

**The row.** It's whole cells tall, with the box at its start on half cells and half a cell before the words. The words' capitals center on the box (rule 8). The whole row is the hit area, at least 44px on touch. Words that may wrap take `.cap-center`: when they wrap, they hang from the row's top line, the box stays level with the first line's capitals, and a line is never shorter than its type.

**The box is the native input,** drawn with `appearance: none`: `label.choice > input[type=checkbox|radio] + .choice-label`. That means Space, a radio group's arrow keys, form submission and the focus ring all come from the browser.
- A checkbox is a square a cell and a half across (`.cc-sm` is one cell, `.cc-lg` two). A radio is the same size as a circle.
- Checked fills the box with `--choice-on` and marks it in `--choice-ink`.
- **Mixed** is the input's `indeterminate` property, set from script (in React, through a ref). It's drawn as a bar, for a parent whose children are partly done.
- Invalid (`aria-invalid`, or `:user-invalid`) turns the edge to the alert color. Disabled dims the box and the words.
- A box with no words, such as a check beside text the person edits, is `label.choice > input[aria-label]`.

**In `.prose`,** a task list's box is the same, whether it comes from Markdown (`li > input`) or an editor (`li > label > input + div`), centered on the first line. `disabled` keeps full ink there, because it records a state, and a done item's words take the tertiary ink.

**The switch** is for a setting that's on or off and takes effect straight away. Use a `button` with `role="switch"` and `aria-checked`, or, in a form, a `label` around a visually hidden checkbox with `role="switch"`.
- The track is 3 × 1½ cells, and the thumb is one cell, a quarter cell inside it. When on, the thumb moves across and the track fills with the accent, with the thumb in the accent's ink.
- The row is whole cells tall and its label centers its capitals on the track (rule 8). The track takes the shared states, and the hit area is at least 44px on touch.
- A choice of one among several is a segmented control (`.tabs.cc-seg`), not a set of switches.
- **In a menu row,** the row is the control: `button.options-card-item[role=menuitemcheckbox][aria-checked]`, with its label at the start and an empty `span.switch` at the end. That switch keeps no room for a label, is lit by its row's `aria-checked`, adds no hit area of its own, and the row isn't shaded as a chosen option.
- **Mixed** (`aria-checked="mixed"`, for a setting over a selection that differs) holds the thumb half way. ARIA reads a mixed `role=switch` as off, so say so in its label or description. A menu row's `menuitemcheckbox` handles mixed correctly.

## Products

A product is one file: a `:root[data-product="name"]` rule in `@layer trellis.product` that sets knobs and nothing else, and any scopes it brings. Copy [`product.template.css`](product.template.css), which lists every knob with its default and a line on what it does. A product layer lives with its product, not here.

**Scopes: a product nested in a product ([D96](docs/decisions/D96.md)).** `data-product` may sit on any element, and the same file may hold `[data-product="part"]` rules after its root rule: a community on a shared platform, a section in its own colors, a mood. A scope sets knobs, as a product does. **What a layer set carries in; what the scope sets is its own; what nobody set follows again** from the scope's own values, so a scope that sets one accent gets every role, and keeps the paper, ink, fonts and type its product chose. `data-theme` on a scope makes it a **mood**: night on a day page, or the reverse; such a scope paints its own ground. The specimen has one: a band across the page, always in the theme the page isn't. The contract checks contrast for each scope, its seeds over its product's, in both themes. **A scope that is always dark** says so in its rule's selector, `[data-product="lodge"][data-theme="dark"]`: by day the rule doesn't apply, so the check skips the light theme for that scope and no other ([D114](docs/decisions/D114.md)). A knob that follows another (the nine seeds, ground and ink, the five type values that follow the seven, `--font-heading`, the card's two paddings) has no default for this reason: leave it out to follow, set it to choose.

```css
@layer trellis.product {
  :root[data-product="grove"]     { --seed-accent: oklch(.33 .063 134); --seed-ground: oklch(.55 .011 77); --font-heading: "Halant", serif; }
  [data-product="studio"]         { --seed-accent: oklch(.49 .061 257); --font-heading: "Cormorant Garamond", serif; }
  [data-product="lantern"]        { --seed-accent: oklch(.62 .035 120); --seed-ground: oklch(.55 .017 152); }
  [data-product="lodge"][data-theme="dark"] { --seed-accent: oklch(.634 .112 82); }   /* always dark */
}
```
```html
<html data-product="grove"> … <article class="card" data-product="studio"> … <section data-product="lantern" data-theme="dark"> …
```

With no product layer the page is core's own defaults: the neutral theme, system fonts, both color themes. That is what the specimen shows.

Two invented layers in `examples/` show the range, and keep the mechanism tested:

| | Neutral (core alone) | Quarry | Almanac |
|---|---|---|---|
| Character | plain | a dense working tool | slow and editorial |
| Type | system sans | Helvetica, heavier headings | a serif for headlines over a humanist sans |
| Ratio | 1.26 → 1.414 | 1.125 → 1.25 | 1.333 → 1.5 |
| Shapes | soft cards, pills | ¼u corners everywhere, uppercase tags | round cards, pill tags |
| Density | comfortable | one notch denser | comfortable, card sides tighter than top and bottom, a narrower measure |

**The specimen takes one layer by address.** `?layer=examples/quarry.css&product=quarry` loads that stylesheet and sets `data-product`. A layer on another origin loads only when the specimen is served from localhost, so a product's private layer can be seen, and run through the tests, from where it lives ([`tests/README.md`](tests/README.md)).

## Interaction presets

Seven behaviors an element asks for by name, each off until it does ([D82](docs/decisions/D82.md)). Fade and press are CSS alone; the other five need `presets.js`, the one optional file beside `settle.js`. Load it after `settle.js`. Each reads its knobs from `core.css`, and under reduced motion each still works and nothing travels.

| Preset | Ask with | What it does | Knobs |
|---|---|---|---|
| Fade | `data-trellis-fade="x"` or `"y"` on a scroller | Its edges fade where there is more to see, from a scroll-driven mask: none at the start, none at the end. Where the browser has no scroll-driven animation, no fade. | `--fade-size` (3 cells) |
| Press | `data-trellis-press` on a control | It sinks while pressed, at once, on top of the state layer's press. Not under reduced motion. | `--press-scale` (.97) |
| Glow | `data-trellis-glow` on a field that scrolls (`="all"` adds a mouse) | Light under the finger, following it, fading when it lifts. It is the field's background image: set the field's color with `background-color`, not the `background` shorthand. | `--glow-size`, `--glow-color` |
| Reveal | `data-trellis-reveal` on a scroller | Its scrollbar shows while it scrolls or a pointer is over it, and steps away after. | |
| Detents | `data-trellis-detents="half full"` (or fractions, `"0.4 0.9"`) on a bottom tray | It opens at the first detent and rests at the nearest when its grabber or header is let go; dragged four cells below the lowest, it closes. It moves by a translate ([D20](docs/decisions/D20.md)), so it is as tall as its tallest detent; focus below the screen's edge raises it to full. | |
| Swipe | `data-trellis-swipe` on a `.list-item` holding a `.list-actions` | Dragged toward its start the row slides to show its actions; past half their width it stays open. Focus in the actions opens it, Escape or a press elsewhere closes it, and a drag never follows the row's link. | |
| Share | `data-trellis-share="name"` on an element | It carries across a change of view: `Trellis.transition(update)` runs the change in a view transition where the browser has one and motion is wanted, plainly otherwise. Between pages the app adds `@view-transition { navigation: auto; }`. | |

## Organic interfaces

A community map, a constellation of people, a field of work and a web of relationships don't sit on the square grid. Their rules still come from the cell:
- **Positions** may be free (force layouts) or sit on a lattice. The isometric lattice slopes **2:1**, so every lattice point is also a cell corner.
- **Sizes** of nodes are counts of cells; **strokes** from the line scale; **labels** stand on cell lines; rings and gaps follow the avatar rule.
- The ideas come from **Kandinsky** (every mark a point, line or plane), **Mondrian** (a few proportions in asymmetric balance), **Frank Lloyd Wright** (the whole grown from the part), **Buckminster Fuller** (detail by more of the same part, never new numbers), **Christopher Alexander** (levels of scale, strong centers).

## Public API

This is what a consumer may rely on. Anything here changing is a changelog entry, and a breaking one says so. Anything not here is internal, however stable it looks. `tests/contract.js` fails if a class in `core.css` isn't listed here.

**Versioning.** Semver, staying 0.x until two apps ship on the same version. A 0.x minor may break, and must say so in [CHANGELOG.md](CHANGELOG.md). Pin an exact version.

**The rhythm model** is part of the API, and the most expensive part to change: the cell is the only line; headlines (h1–h3) stand on it, with a baseline on a cell line; other text hangs from it by its cap top and rounds its block up to whole cells; space between blocks is whole cells; a heading's own space in a stack is the larger of it and the gap. Changing any of that is a major entry, with a note in the specimen's history.

| Part | The API |
|---|---|
| **Files** | `core.css`, `settle.js`, `product.template.css`, `tokens.json`, `math.js` · optional: `presets.js`, `float.js` · checks: `tools/check.js` and `tools/product.js`, installed as the commands `trellis-check` and `trellis-product`, and `tools/product.js`'s `validate(css)` · agent instructions: `skill/SKILL.md`, `skill/ADOPT.md` |
| **Layers** | `@layer trellis`, with sublayers `reset`, `tokens`, `theme`, `base`, `layout`, `primitives`, `product`, `utilities`, in that order |
| **Root attributes** | `data-product` (selects a product layer; absent is the neutral default; on any other element, a scope, [D96](docs/decisions/D96.md)) · `data-theme` (`light`, `dark`; absent follows the system) · `data-unit-fit` (`on`, `off`; absent fits touch screens) |
| **Runtime** | `window.Trellis`: `fit()`, `cell()` (the cell in px, measured), `all()`, `observe(el)`, `settled()`, `range(el)`, `composer(el)`; with `presets.js`, `presets` (the seven names) and `transition(update)`; with `float.js`, `float`, whose methods are `open(float, anchor, options)`, `toggle(…)`, `close(float)`, `place(…)` and `isOpen(float)` (options: `side`, `align`, `gap`, `margin`, `onClose`), which writes `--float-x` and `--float-y` and an anchor's `aria-expanded`. `presets.js` writes `--glow-x`, `--glow-y`, `data-trellis-glowing`, `data-trellis-scrolling`, `--tray-offset`, `data-trellis-dragging`, `--swipe-x`, `data-trellis-swiped` and a shared element's `view-transition-name`; those are its own. `data-settle-skip` opts an overlay out. It closes a `dialog.modal` on a backdrop click that began and ended on the backdrop; `data-trellis-stay` opts a modal out. It keeps the order of open modals, writing `--modal-index` on each and `data-trellis-depth` on those under the top one, and closes the third when a fourth opens. It writes `--dpr`, `--fit-width`, `--settle-n`, `--settle`, `--settle-start`, `data-prose-empty`, `tabindex` with `data-trellis-reach` on prose that scrolls, and, where a browser leaves a clamp's box untrimmed, `data-trellis-clamp`, `--clamp-top` and `--clamp-h` on a `.u-clamp`; those are its own. |
| **Knobs** (products set these on `:root`) | Everything in `product.template.css` |
| **Tokens** (read them, don't set them) | Space `--u`, `--u-px`, `--u-scale` (the dial; settable), `--u-type` (the cell the reader's text size asks for, past the cap too) · `--sp-q`, `--sp-q2`, `--sp-h`, `--sp-1`, `--sp-1h`, `--sp-2`, `--sp-3`, `--sp-4`, `--sp-5`, `--sp-6`, `--sp-8`, `--sp-12`, `--sp-13`, `--sp-16` · Lines `--line`, `--hair` · Frame `--gutter`, `--frame-max`, `--frame-max-n` · Corners `--r-q`, `--r-h`, `--r-1`, `--r-1h`, `--r-2`, `--r-round` · Sizes `--size-icon-sm`, `--size-icon`, `--size-icon-md`, `--size-icon-lg`, `--size-control-xs`, `--size-control-sm`, `--size-control-md`, `--size-control-lg`, `--size-control-xl` · Control type `--fs-control-xs`, `--fs-control-sm`, `--fs-control-md`, `--fs-control`, `--fs-control-lg` · Motion `--dur-in`, `--dur-in-slow`, `--dur-out`, `--dur-tray-in`, `--dur-tray-out` (`--dur-sheet-in`, `--dur-sheet-out`: aliases for one minor), `--dur-skeleton`, `--ease-in`, `--ease-out`, `--ease-spring` · Stacking `--z-raised`, `--z-sticky`, `--z-overlay`, `--z-float`, `--z-toast` · Theme `--surface`, `--bg`, `--bg-raised`, `--bg-raised-2`, `--bg-raised-3`, `--bg-sunken`, `--bg-hover`, `--text`, `--text-secondary`, `--text-tertiary`, `--text-faint`, `--border`, `--border-subtle`, `--border-strong`, `--accent`, `--accent-ink`, `--focus`, `--kind-person`, `--kind-group`, `--kind-event`, `--kind-course`, `--kind-topic`, `--ok`, `--warn`, `--alert`, the stages `--stage-1`, `--stage-2`, `--stage-3`, `--stage-4`, `--stage-5`, `--stage-6`, `--stage-7`, each with its ink (`--stage-1-ink` … `--stage-7-ink`) and its tint (`--stage-1-tint` … `--stage-7-tint`), `--gradient-accent`, `--gradient-surface`, `--lift`, `--white`, `--black`, `--hit-min`, `--font-mono`, `--font-emoji` · Lattice `--iso-dx`, `--iso-dy` |

**Classes, and the variables a context may set on them.** Variants and contexts set these; products don't.

| Class | Modifiers and parts | Variables |
|---|---|---|
| Type roles | `.t-h1`, `.t-h2`, `.t-h3`, `.t-h4`, `.t-h5`, `.t-h6`, `.t-xl`, `.t-lg`, `.t-body`, `.t-sm`, `.t-xs`, `.t-label`, `.t-eyebrow` · `.t-serif`, `.t-mono` · `.snap`, `.snap-x`, `.settle`, `.cap-center` | |
| `.prose` | | `--prose-inner-gap`, `--stack-gap`, `--embed-w`, `--embed-h`, `--details-ink`, `--details-chevron` |
| `.frame` | | `--frame-reserve-start`, `--frame-reserve-end` (space the frame keeps clear in a margin, in whole cells; it gives up the other margin first), `--frame-shift` (read it) |
| `.section` | `.section-head`, `.section-body`, `.cc-split`, `.cc-band` | `--section-head-w`, `--band-bg` |
| `.cover` | `.cover-media`, `.cover-body` | `--cover-h`, `--cover-pad`, `--cover-scrim` |
| `.shell` | `.shell-grid`, `.shell-nav`, `.shell-main`, `.shell-aside`, `.shell-foot`, `.shell-link` (`[aria-current]`: the selected fill and an accent mark at its start; in the tab bar, on its top edge), `.shell-brand` (also in a side column; not in its tab bar) · `.cc-top` with `.shell-brand`, `.shell-menu`, `.shell-links` (a `[popover]`: in the bar when wide, a left tray from `.shell-menu` under 48rem), `.shell-nav-end` | on `.shell-nav`: `--shell-nav-bg` (its ground: `--surface`), `--shell-nav-blur` (what it blurs behind it: none) · `--shell-h`, `--shell-nav-w`, `--shell-aside-w` (its column, kept only while the grid holds a `.shell-aside` that is not `hidden`), `--shell-pad`, `--shell-bar-h` |
| `.outline` | `.outline-link` (an `a`, or a `details`' `summary`) · `[aria-current]` | `--outline-indent`, `--outline-row` |
| `.crumbs` | an `ol` of `li > a`, the last with `aria-current="page"` | |
| `.skip-link` | | |
| `.stack`, `.cluster`, `.pair` | | `--stack-gap`, `--cluster-gap` |
| `.cols`, `.split`, `.grid` | `.grid.cc-fill` (tracks share the remainder) | `--cols`, `--cols-gap`, `--split-a`, `--split-b`, `--split-gap`, `--grid-min`, `--grid-gap` |
| `.cells` | | `--cell-x`, `--cell-y`, `--cell-w`, `--cell-h` |
| `.rail` | | `--rail-item`, `--rail-gap` |
| `.row`, `.col`, `.context` | | `--row-gap` |
| `.list` | `.list-item`, `.list-body`, `.list-end`, `.list-link`, `.list-title`, `.list-sub` (a row's two lines), `.list-mark` (a dot, an icon or a small face centered on the first line's capitals, at the row's start, where it is a column `--list-mark-w` wide, or in its end; give it the role of the line beside it: `span.list-mark.t-sm`), `.list-actions` (a row's swipe actions) · `.cc-group` (the rows share one surface; rules start at the text) · `.list-item.cc-unread` (the title in the strong weight, the line under it in the text's ink) · `[aria-current]`, `[aria-selected="true"]` on the row or its link (the selected fill and an accent mark) | `--list-pad-y`, `--list-gap`, `--list-rule`, `--list-outset`, `--list-mark-w` (the column a row's leading mark stands in: a cell), `--list-align` (where a row's parts meet: `flex-start`, hanging from one line; `center` for a row that is one line and its controls, its words `.cap-center`) |
| `.board` | `.board-lane`, `.board-lane-head` | `--board-lane-w`, `--board-gap`, `--board-lane-gap`, `--board-card-pad` (lane cards' padding and the lane head's sides, a cell) |
| `.card` | (its level is read from nesting, rule 21) · `.card-link` (the card's title as its one link: it covers the card, its other controls stay above it, [D108](docs/decisions/D108.md)) · `.card-media`, `.card-scroll` (a scroller that spans the card's sides, and reaches its top or bottom edge where it is the card's first or last part, taking the card's corners, so what scrolls is cut at the card's line; its content keeps the card's padding) | `--surface-level` (1 to 3; read it), `--card-scroll-pad`, `--card-pad` (sets both), `--card-pad-inline`, `--card-pad-block`, `--card-inset-inline` and `--card-inset-block` (the padding it lays out, the corner cleared; read them), `--card-radius`, `--card-border`, `--surface` (its ground: set it on a top-level card for a glass or tinted one) |
| `.media` | an `img`, `video` or `picture` inside, filling it by cover · `.cc-round` · in a card, as its own child: `.cc-bleed` (both sides, and the top as the card's first part, the foot as its last), `.cc-bleed-start`, `.cc-bleed-end` (a strip as tall as the card), `.cc-fill` (the card's whole ground) | `--media-w`, `--media-h` (the frame in cells; no width fills the column, the height is 12, a strip's width 3, a full bleed's least height 18), `--media-focus` (the focal point, `object-position`), `--media-radius`, `--media-fill` (an empty frame's ground), `--media-scrim` (drawn over the image) |
| `.button` | `.icon-button` (a modifier, never alone: `button icon-button`), `.button-label`, `.cc-primary`, `.cc-ghost`, `.cc-block` (as wide as its container) · kinds `.cc-alert` (destructive), `.cc-ok` (confirm) · `.cc-outline` ([D115](docs/decisions/D115.md)) · `.cc-sm`, `.cc-md`, `.cc-lg` | `--btn-h`, `--btn-fs`, `--btn-radius`, `--btn-bg`, `--btn-ink`, `--btn-border`, `--btn-tracking` · `--btn-color` (a kind's color, and what `.cc-outline` draws in), `--btn-tint` (the share of it in an outline's ground: none) |
| `.icon` | `.cc-end` · a stroke by default; a filled or two-toned glyph says so on its own shapes, `<g fill="currentColor" stroke="none">` (in a sprite, inside the `symbol`) | `--icon-size` (any count of cells), `--icon-stroke` |
| `.tag` | `.tag-label`, `.tag-dot`, `.tag-remove` · kinds `.cc-person`, `.cc-group`, `.cc-event`, `.cc-course`, `.cc-ok`, `.cc-warn`, `.cc-alert`, `.cc-quiet` (no kind: the neutral, [D115](docs/decisions/D115.md)) · stages `.cc-stage-1`, `.cc-stage-2`, `.cc-stage-3`, `.cc-stage-4`, `.cc-stage-5`, `.cc-stage-6`, `.cc-stage-7` (a step of a process, in its product's color, [D107](docs/decisions/D107.md)) · `.cc-outline`, `.cc-solid` (also `[aria-pressed="true"]`, and `[aria-current]` on a link, [D101](docs/decisions/D101.md)) · `.cc-sm`, `.cc-md`, `.cc-lg` | `--tag-h`, `--tag-fs`, `--tag-color`, `--tag-radius`, `--tag-pad`, `--tag-fill`, `--tag-edge`, `--tag-edge-style` (solid, or dashed for what isn't here yet), `--tag-ink`, `--tag-gap` |
| `.avatar` | `.avatar-initials`, `.avatar-dot`, `.avatar-stack`, `.avatar-more` · sizes `.cc-xs`, `.cc-sm`, `.cc-md`, `.cc-lg`, `.cc-xl`, `.cc-xxl`, `.cc-hero` · kinds `.cc-group`, `.cc-space` · `.cc-plain` (no gap, no ring) | `--av-n`, `--av-gap`, `--av-ring`, `--av-knock`, `--av-color`, `--av-radius` |
| `.field`, `.input` | `.field-label`, `.field-hint`, `.cc-sm`, `.cc-lg` · states `[aria-invalid="true"]`, `:disabled`, `:read-only` | `--field-inset` (the label's and hint's start: the input's own text inset, a cell, half in `.cc-dense` or beside `.input.cc-sm`), `--input-h`, `--input-fs`, `--input-radius`, `--input-bg`, `--input-ink`, `--input-border`, `--input-pad`, `--input-rows`, `--chevron-color` (a select's chevron; the text color unless set) |
| `.input.cc-slots` | `.input-control` (an `input` or a `select`), `.input-unit`; also `.icon` and `.button.icon-button` · `.cc-sm`, `.cc-lg` · states from its control: `[aria-invalid="true"]`, `:disabled`, `:read-only` | the input's own, on the box; `--input-unit` (how far the control runs under a unit, 4em: as long as the unit or more), `--input-slot-ink` (an icon's and a unit's) |
| `.composer` | `.composer-input` (a `textarea`), `.composer-send` (on a `.button.icon-button`); controls are `.button.icon-button` | `--composer-radius`, `--composer-pad`, `--composer-control`, `--composer-line`, `--composer-max`, `--composer-fs`, `--composer-edge`, `--composer-send-rest`, `--composer-send-ready`, `--composer-send-ink`; settle.js writes `--composer-h` |
| `.tabs`, `.tab` | `.cc-seg` · `[aria-selected="true"]`, `[aria-checked="true"]` (a tab that is a `role="radio"`), or `[aria-current]` on a link ([D101](docs/decisions/D101.md)) | `--tab-h`, `--tab-fs`, `--tab-pad`, `--tab-rule`, `--tab-mark`, `--tab-mark-h`, `--tab-on-bg`, `--tab-radius`, `--tab-gap`, `--seg-pad` (the ring around a segmented control's tabs) |
| `.chat-item` | `.chat-item-body`, `.chat-item-meta`, `.chat-item-name`, `.chat-item-bubble`, `.chat-item-time` (a continuing message's own time, flat rows), `.chat-item-actions` · `.cc-own` (a solid bubble at the row's end, no avatar, its meta after the bubble; in flat rows, nothing but the name), `.cc-cont` (continues the message before it from the same speaker: one avatar and one meta for the run, `--chat-run-gap` apart), `.cc-wall`, `.cc-system`, `.cc-removed`, `.cc-flat` (one flat row outside a flat thread) · parts: `.chat-quote` > `.chat-quote-author`, `.chat-quote-text` · `.chat-file` > `.chat-file-mark` · `.chat-link` > `.chat-link-site`, `.chat-link-title`, `.chat-link-media` · `.chat-reactions` > `.chat-reaction` > `.chat-reaction-emoji` (`.cc-mine`, or `aria-pressed="true"`) · `.chat-edited` | `--chat-bg`, `--chat-ink`, `--chat-edge`, `--chat-edge-style`, `--chat-style`, `--chat-pad`, `--chat-radius`, `--chat-tail` (the speaker's bottom corner), `--chat-measure`, `--chat-avatar`, `--chat-avatar-n`, `--chat-meta-order`, `--chat-name-ink`, `--chat-name-weight`, `--chat-run-gap`, `--chat-row` (the row's hover fill), `--chat-outset`, `--chat-time`, `--chat-time-seen`, `--chat-actions`, `--chat-actions-seen`, `--chat-quote-rule`, `--chat-file-tint`, `--chat-link-rule`, `--reaction-bg`, `--reaction-edge`, `--reaction-ink` · product knobs `--chat-own-bg`, `--chat-own-ink`, `--chat-bubble-edge` |
| `.chat-thread` | `.cc-flat` (flat rows) · `.chat-divider` (`.cc-new`: the unread line) · `.chat-typing` > `.chat-typing-dots` | `--chat-inset` (where a message's text starts: the typing line starts there), `--chat-divider-rule`, `--stack-gap` |
| `.member-tile` | `.member-tile-body`, `.cc-row` | `--tile-dir`, `--tile-align` |
| `.badge`, `.dot` | `.cc-quiet`, `.cc-accent`, `.cc-ok`, `.cc-warn` · `.badge.cc-corner` (a count on its `.icon-button`'s corner, as the button's child, [D115](docs/decisions/D115.md)) · `.dot.cc-ring` (a ring: the dot not yet filled) · on a dot, a stage: `.cc-stage-1`, `.cc-stage-2`, `.cc-stage-3`, `.cc-stage-4`, `.cc-stage-5`, `.cc-stage-6`, `.cc-stage-7` (its fill; with `.cc-ring`, its ink) | `--badge-color`, `--badge-ink`, `--badge-h`, `--dot-color`, `--dot-size` · on a ring: `--dot-ring` (its line: a quarter of the dot, one line to two), `--dot-fill` (its inside: clear) |
| `.skeleton` | `.cc-block` | `--skel-lo`, `--skel-hi`, `--skel-radius`, `--skel-w`, `--skel-h` |
| `.modal` | `.modal-inner`, `.modal-grabber` (drawn on a bottom tray), `.modal-header`, `.modal-body`, `.modal-footer`, `.cc-tray` with `.cc-left` (the default), `.cc-right`, `.cc-top`, `.cc-bottom`; `.cc-sheet` (an alias for one minor) | `--modal-w`, `--modal-pad`, `--modal-gutter`, `--modal-gutter-block`, `--modal-gutter-inline`, `--modal-radius`, `--modal-max-h`, `--modal-scrim`, `--tray-w`, `--tray-margin` |
| `.float` | `.options-card`, `.options-card-heading`, `.options-card-item`, `.options-card-label`, `.options-card-rule`, `.tooltip` · `.cc-anchor` (placed under its opener by anchor positioning, where the browser has it) | `--float-x`, `--float-y` (its left and top: `float.js` writes them), `--float-pad`, `--float-radius`, `--float-ink` (set with `--surface`, for a float or a tooltip on a ground of your own) · on an options card: `--options-w`, `--options-max-h`, `--option-h`, `--option-fs` |
| Contexts | `.cc-dense`, `.cc-on-media` | |
| Scrollbars | `.cc-scroll-thick`, `.cc-scroll-none` | `--scrollbar-width`, `--scrollbar-size`, `--scrollbar-thumb`, `--scrollbar-thumb-hover`, `--scrollbar-track` |
| `.choice` | `.choice-label` (`.cap-center` where it may wrap) · its `input[type="checkbox"]` or `input[type="radio"]` is the box: `:checked`, `:indeterminate` (mixed: set `indeterminate` from script), `:disabled`, `[aria-invalid="true"]`, `:user-invalid` · `.cc-sm`, `.cc-lg` · in `.prose`, `li > input[type="checkbox"]` and `li > label > input[type="checkbox"]` (a task list) | `--choice-box`, `--choice-radius`, `--choice-edge`, `--choice-fill`, `--choice-line`, `--choice-row` · shared with `.switch`: `--choice-on`, `--choice-ink`, `--choice-gap` |
| `.card-choice` | on the `label.choice` that is a card's title · `:checked`, `:indeterminate`, `:disabled`, `[aria-invalid="true"]` (on the input, or on the `role="radiogroup"`), `:user-invalid` · its input may be `.u-sr-only` where a part of the card shows the choice | `--card-choice-edge`, `--card-choice-fill`, `--card-choice-glow` (a chosen card's edge, its wash and a shadow, none unless set) · and the choice's `--choice-on` |
| `.switch` | `.switch-label` · `[aria-checked="true"]`, `[aria-checked="mixed"]` (the thumb half way), or a checked `input` inside · `[aria-disabled="true"]`, `:disabled` · empty, at the end of an `.options-card-item[aria-checked]`: lit by its row | `--switch-w`, `--switch-h`, `--switch-knob`, `--switch-off`, `--switch-on`, `--switch-thumb` · and the choice's `--choice-on`, `--choice-ink`, `--choice-gap` |
| `.range` | `.cc-zone` · `:disabled` | `--range-h`, `--range-track`, `--range-thumb`, `--range-ink`, `--range-rest`, `--range-fill`, `--range-thumb-fill`, `--range-a`, `--range-b` (on `.cc-zone`) · `--range-at` (`settle.js` writes it; read it) |
| States | `:hover` (where a pointer hovers), `:active`, `[aria-pressed="true"]`, `[aria-selected="true"]`, `[aria-checked="true"]`, `[aria-current]`, `:disabled`, `[aria-disabled="true"]` · `.u-state` for a control of your own | `--state-fill`, `--state-ink` (on `.u-state`) · `--state-act`, `--state-on` (the shares a control paints with; set by the states, read them) |
| Presets | `[data-trellis-fade]`, `[data-trellis-press]`, `[data-trellis-glow]`, `[data-trellis-reveal]`, `[data-trellis-detents]`, `[data-trellis-swipe]`, `[data-trellis-share]` | `--fade-size`, `--press-scale`, `--glow-size`, `--glow-color` |
| Utilities | `.u-text-secondary`, `.u-text-tertiary`, `.u-truncate`, `.u-clamp` (on a type role: so many lines and an ellipsis, its descenders kept and its box the role's own), `.u-sr-only`, `.u-align-end`, `.u-state`, `.u-gap-q`, `.u-gap-h`, `.u-gap-1`, `.u-gap-2`, `.u-gap-4` | on `.u-clamp`: `--lines` (2), `--clamp-reach` (how far under the last baseline it shows: .24em, a descender; raise it for a face with deeper ones) |

## Enforcement

Today, in CI on every push and pull request ([`tests/README.md`](tests/README.md) has what each proves and the numbers):
- **`align.js`**: every edge on a cell line, and every block in a real post, across the matrix in Chromium and WebKit.
- **`pixel.js`**: in WebKit at 3×, every card edge covers the device pixels of the grid line it stands on.
- **`layout.js`**: each layout and the modal behave as they say.
- **`layers.js`**: the required import order holds.
- **`math.js`**: the math module and the stylesheet agree, in both engines.
- **`perf.js`**: 5,000 blocks stay on their lines, inside the budgets.
- **`contract.js`**: the Public API is complete, **products only turn knobs**, the template matches core.

In an app built on Trellis, `tools/check.js` (`npx trellis-check`) counts what breaks three of the rules (**no raw values**, **products turn knobs**, **inline styles set variables only**), a primitive redrawn from outside (named in the selector, or through a class of the app's own that sits on the primitive's element in its markup or scripts), and a modifier without its base (`icon-button` with no `button`, a `cc-*` with nothing core beside it), and holds each file to a budget that only goes down. It reads source and never opens a browser, so **edges land on lines** and **every class registered** are still the review checklist in [`REACT.md`](REACT.md).

## Browser support

Everything degrades to a working layout. Per feature:

| Feature | Chrome | Safari | Without it |
|---|---|---|---|
| `light-dark()`, `round()`, `mod()`, `pow()`, container queries, `popover`, `@starting-style` | yes | yes | (all current browsers) |
| `text-box` trimming | 133+ | 18.2+ | text sits a few pixels off its line (Firefox today) |
| Typed division (`100vw / 1rem`): the fit | recent (about 140) | recent (about 26) | the cell stays whole; no fit |
| `calc-size()`: text and clusters round to whole cells, controls to whole half cells | 129+ | not yet | `settle.js` rounds text and clusters; controls keep natural widths |
| Trimming a clamp's box (`.u-clamp`) | yes | not yet | `settle.js` measures the trim, pulls the text up to its line and sets the box's height; without the script, a plain clamp a few pixels low, its box a little tall |
| `:has()`: prose's galleries and text-only divs, the modal's scroll lock | yes | yes | (all current browsers) |
| Relative colors (`oklch(from …)`): every color role | 122+ | 18+ | core's own palette, resolved to fixed colors: a product's seeds are lost, nothing is unreadable |
| `<dialog>` motion, `transition-behavior: allow-discrete` | yes | enter yes, exit partly | a modal closes without its exit transition |

## Adoption

- **Install by git address, pinned to a commit.** There is no npm package yet.
  ```bash
  npm install github:Iris-Cocreative/trellis#<commit>
  ```
  Then import `@iris-cocreative/trellis/core.css`, your own product layer, and `@iris-cocreative/trellis/settle.js` (and `float.js` or `presets.js` if you use them). For React, see [`REACT.md`](REACT.md).
- **Check the app from the installed package.** Two commands come with it, and neither needs a browser or a dependency:
  ```bash
  npx trellis-check src                                   # counts, per file
  npx trellis-check src --budget check.budget.json --write   # record today's counts
  npx trellis-check src --budget check.budget.json        # exits 1 if a count rose
  npx trellis-product src/product.css                     # exits 1 if the layer is more than knobs, or can't be read
  ```
  The agent instructions are in the package too: `node_modules/@iris-cocreative/trellis/skill/SKILL.md` and `skill/ADOPT.md`. `tests/package.js` installs the packed tarball into a clean project and runs these.
- **Without a bundler,** load the three files from a pinned copy: `core.css`, your product layer, `settle.js`.
- **A product owns its layer.** Start from `product.template.css`, keep the knobs you change, and put `data-product` on `<html>`.
- **In a native app, choose per surface.** The default: native for the shell, navigation, messaging and any long list; a web view on Trellis for content, media, canvases and what the web already does well.
- **Beside an existing stylesheet,** migrate one surface at a time. A surface uses Trellis or the other system, not both.
- **With Tailwind, state the layer order first ([D110](docs/decisions/D110.md)).** Neither import order works on its own: `trellis` has to sit between Tailwind's layers. Put this before either stylesheet. The `@source` line stops Tailwind making utilities out of three Trellis class names:
  ```css
  @layer theme, base, trellis, components, utilities;
  @import "tailwindcss";
  @source not inline("list-item outline snap-x");
  ```
  With the statement, either import order works, and so does importing `core.css` from the Tailwind entry in a production build.

  Without it:
  - **Tailwind first:** `trellis` lands above Tailwind's utilities, so a utility on a Trellis element loses (a `mt-*` on a paragraph does nothing).
  - **Trellis first:** `trellis` lands below `base`. Preflight sets every heading role to body size and moves every box on a Trellis surface, and Tailwind's `--font-sans`, `--font-serif`, `--font-mono`, `--ease-in` and `--ease-out` replace Trellis's.
  - **Without the `@source` line,** a `.list-item` becomes `display: list-item` and an `.outline` draws an outline.

  Three things the statement can't fix:
  - An app's own unlayered `:root` tokens beat every layer, so where both declare a name the app's value wins (shadcn's `--accent` is a hover gray).
  - Tailwind's spacing scale is in rem, so a layout around a Trellis card should use cells (`gap-(--sp-2)`, `p-(--sp-3)`).
  - Trellis's `.grid` also styles every Tailwind `grid` element, setting its gap and tracks where the element doesn't. Trellis keeps `.grid` because it's meant to replace Tailwind over time. While the two coexist, a surface still on Tailwind sets its own gap and columns on each `grid`, or moves to Trellis's grid. The clash ends when the surface moves over.

  `tests/tailwind.js` checks all of this against real Tailwind v4 (`experiments/tailwind/`), in every order and both engines, and `tests/layers.js` checks it against the shape of Tailwind's layers.

## Open questions

1. **xs.** Accept a fixed xs, or retune the paragraph ratios so it scales.
2. **Outset** is on by default (`--outset: 1`). Should a product ever turn it off?
3. **Spanned foldables.** On a spanned foldable the frame centers across the hinge; placing content per screen (viewport segments) is a later step.
4. **Firefox** places text a few pixels off its line until it ships `text-box`.
