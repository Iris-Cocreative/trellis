# Trellis tests

They run in CI on every push and pull request (`.github/workflows/test.yml`), in Chromium and WebKit.

| Test | What it proves |
|---|---|
| `contract.js` | No browser. Every class in `core.css` is in the README's Public API; product layers only set variables on `:root` (every layer in `examples/`, and any path given as an argument); every knob is in `product.template.css` with core's default; the generated tokens in `core.css` are exactly what `tokens.json` makes, and no web unit is in the token file; every text role, the accent and its ink, each status as a line, and every stage's ink, meet their contrast floors in both themes, for core and every product layer (WCAG AA, with `math.js` doing the same arithmetic as `core.css`); the package exports what it should and carries its license; `math.js` has no DOM, carries the token source's seed and reproduces the README's worked examples; `settle.js` loads on a server. It reads files with either line ending. |
| `align.js` | Every edge lands on a cell line: a headline's last baseline, the top of every other text block, the top and left of every box, and every block in the `.prose` post, read from its bare tag. Also fails a block that collapsed, a block past its column, a region that scrolls sideways with no way in for a keyboard (a `tabindex`, something focusable in it, or a textarea that can take focus), sideways scroll past the width it was given and console errors. Opens every `details` and measures again. On the specimen's band in the opposite scheme (D96) it also reads every color role and compares it with the page's own in that theme, finds the band's ground in the pixels, and holds each role's floor and 4.5:1 on every piece of text in it. |
| `pixel.js` | Lines are planes: each card's edge covers the same device pixels as the grid line it stands on, one CSS pixel (3 device pixels) wide. |
| `layout.js` | What a position check can't see: a card's padding is equal by default and each of its two knobs moves one direction alone; a small padding on a very round card is raised to clear its corner, and bleeding media still meets its edges; a list row is whole cells and its rule adds no height; the same shell markup is a column in a wide box and a tab bar in a narrow one; a shell keeps a column for an aside only when it has one, and a side column's brand is not in the tab bar; prose in a message's bubble has the width of its words, and a message keeps its typed line breaks; a cover's media reaches both screen edges with no sideways scroll; a board scrolls; inputs meet the touch target and 16px type on touch; a modal and a sheet really open, lock the page, sit where they should and undo it all on close; a mark in a list row sits on the middle of its first line's capitals; a ring dot keeps its box and its line; a card's link covers the card while its own button and tag keep their clicks, and its focus ring is drawn round the card; an image fills its frame at its focal point, and a bleeding frame meets its card's edges and corners; on a full bleed, in both themes, a control with no fill of its own reads on the scrim (its ground taken from the pixels), at rest, hovered, pressed and focused, and one with a fill or on a surface is as it is elsewhere; a long tag in a member tile stops at the tile's padding; at 340% text a choice's wrapped label is marked, its lines clear each other and its row is whole cells; at 312% text the specimen's options cards grow with their type in whole cells, stay on the screen and cut off no label that fits it; clamped text is whole cells tall and, read from a screenshot, keeps its last line's descenders with nothing of the hidden line under them. |
| `layers.js` | The import order the README requires, against the shape of Tailwind v4's layers (a preflight in `base`, a margin in `utilities`). |
| `tailwind.js` | The same against Tailwind v4 itself (`experiments/tailwind/`, built by its `build.js` into a committed `dist/`), in seven orders, each compared with Trellis alone: with the `@layer` statement, Trellis first or Tailwind first or bundled for production, every Trellis box sits where it does without Tailwind, a margin utility beats the reset, a type role beats preflight, Trellis's names shared with Tailwind's theme keep Trellis's values, and `.list-item` and `.outline` stay Trellis's (the app's `@source not inline` line); without the statement or that line, the order breaks what the README says. Reports what the statement can't fix: the app's unlayered tokens, a layout in Tailwind's rem lengths, Trellis's `.grid` on a Tailwind `grid`. `LAYER=name=<address>` adds a product layer. |
| `math.js` | `math.js` at the root says in arithmetic what `core.css` says in CSS. This checks that they agree across eight screens and all three layers: the fit's count, cell and gutter; the whole cell, frame and gutter on a wide screen; every type role's size from the live knobs; standing and hanging; and the specimen's ratio playground, whose sample boxes carry knobs of their own: every role at its wide end and at its narrow end, and the half step as the root of the ratio; from the browser alone, that no heading is smaller than body text (D89); and that the seeds the browser derives from an accent, the seven stages among them, are the ones `math.js` derives, for core's accent and four others (D90); a scope's roles, a pale stage's fill and ink among them, in both themes (D96, D107). 1,619 checks. |
| `perf.js` | The runtime under load: see below. |
| `matrix.js` | Runs all of the browser tests across the list below. |
| `package.js` | What an installed consumer gets. It runs `npm pack`, installs the tarball and a pinned esbuild into a clean project in a temporary folder, and from there: the tarball carries every export, both commands and the skill, and nothing of the repository's own; `settle.js`, `float.js` and `presets.js`, imported by their package paths, survive a minified, tree-shaken bundle and set their `window.Trellis` APIs in each engine (a control bundle with the old `sideEffects` list must lose two of them); `trellis-check` counts a raw length and a raw color and exits 1 over its budget; `trellis-product` accepts the template and a layer with a scope, and rejects a layer that sets a property, an unknown knob and an unreadable accent; every installed path, import and command the packaged docs name resolves. Needs npm and the network. Not in the matrix: CI runs it as its own step. |
| `ready.js` | What they all wait on: the document, then the runtime, then `Trellis.settled()`. `networkidle` doesn't mean parsed. |
| `tailwind-fresh.js` | Whether the spike's committed bundle holds today's `core.css`. When it doesn't, `tailwind.js` skips the bundle and the matrix runs the statement order in its place; CI rebuilds the spike first. |
| `target.js` | Which specimen a test opens: core alone, an example layer, or a layer from outside the repository. |

## Running them

Serve the repository root, then point the tests at the specimen:

```bash
python -m http.server 8765 --bind 127.0.0.1          # from the repository root
export PLAYWRIGHT=/path/to/node_modules/playwright   # if it isn't resolvable
node tests/contract.js
node tests/matrix.js http://127.0.0.1:8765/ all      # or: chromium, webkit, and --quick
node tests/package.js                                # or: chromium, webkit; no server
```

Each browser needs the Playwright version its build came from. On a machine with mismatched builds, run `matrix.js ... chromium` and `... webkit` with a different `PLAYWRIGHT` each.

One at a time:

```bash
node tests/align.js http://127.0.0.1:8765/ 393x852 quarry light touch webkit
node tests/pixel.js http://127.0.0.1:8765/ 393x852 webkit
node tests/layout.js http://127.0.0.1:8765/ webkit 393x852 touch
node tests/perf.js http://127.0.0.1:8765/ webkit
```

`align.js` takes a size, then a layer, then a theme, then flags. The layer is `neutral` (core alone), the name of an example (`quarry`, `almanac`), or `name=<address>` for a layer from outside the repository. The theme is `auto`, `light` or `dark`.

`align.js` flags: `touch` (a 3× phone), `webkit` (the engine of every iPhone browser), `u9`…`u18` (the reader's dial, 12 = 100%), `fit-on` / `fit-off`, `measure`, `math`, `css`, `outset`, `slow` (a CPU throttled 6×, Chromium only), `ax` (the reader's text size at 312%, the largest iOS accessibility size). `VERBOSE=1` lists everything checked; `SHOW=n` lists more of what's off.

Run the WebKit cases: Safari is where `calc-size()` is missing and `settle.js` does the rounding, and Chrome's device emulation snaps edges to whole CSS pixels, so it can't see the micro scale.

Tests wait on `ready.js` and on the real transition, never on a guessed delay.

## A product layer from outside the repository

A product layer lives with its product, and may be private. It runs through the same tests from where it lives:

```bash
# 1. The contract: one :root rule of variables, in @layer trellis.product, every knob known.
node tests/contract.js ../my-app/styles/product.css

# 2. Alignment, in both engines. Serve the layer anywhere a local browser can reach,
#    serve this repository on localhost, and name the layer by its data-product value.
LAYER=mine=http://127.0.0.1:9000/styles/product.css node tests/matrix.js http://127.0.0.1:8765/ all
```

`LAYER` adds seven `align.js` runs for that layer to the list below. To look at it, open the specimen with `?layer=<address>&product=<name>`. The specimen loads a layer from another origin only when it is itself served from localhost, so the public page can't be restyled by a link. Fonts are the product's job: a layer that names a web font is tested with its fallback unless the page loads that font.

## The matrix

`matrix.js` holds the list. As of v0.9. Neutral is core alone; Quarry and Almanac are the invented layers in `examples/`.

| Engine | Screens and settings |
|---|---|
| Chromium `align.js` | 1440×900 neutral dark · 1440×900 Quarry light, Outset · 1280×800 Almanac dark, math · 1024×768 neutral light, CSS panel · 1280×800 neutral dark, Measure · 768×1024 Quarry dark · 393×852 touch neutral dark · 393×852 touch Almanac light, dial 10 · 375×812 touch Quarry light, Outset · 393×852 touch neutral dark, throttled 6× · 1440×900 Quarry light, text 312% · 375×812 touch Almanac light, text 312% |
| WebKit `align.js` | 1440×900 neutral dark · 1280×800 Quarry dark, Outset · 393×852 touch Quarry light · 393×852 touch neutral dark, dial 14 · 440×956 touch Almanac light, math · 375×812 touch neutral dark, Outset · 852×393 touch Almanac dark, math, Outset · 393×852 touch neutral dark, text 312% · 1280×800 Almanac dark, text 312% |
| WebKit `pixel.js` | 393×852 · 440×956 |
| Both | `layers.js` · `tailwind.js` · `layout.js` at 1440×900 and 393×852 touch · `math.js` |
| `align.js` on the Tailwind spike | Chromium 1440×900 light, the statement · WebKit 393×852 touch dark, the production bundle |
| WebKit | `perf.js`, last and alone |

## What a pass looked like

**2026-11-11, v0.8,** on a Windows PC: Chromium through Playwright 1.62, WebKit through Playwright 1.60. The same machine ran v0.7 the same day, before the rename and the move, and every count below matched it.

- `align.js`: 0 off in all 17 runs, with 267 or 303 text blocks, 263 or 275 boxes and 89 or 90 prose blocks each (90 or 91 from v0.9, which adds a heading to the sample post).
- `pixel.js`: 0 of 60 card edges off at both sizes. (The specimen has more cards; those in a rail or a board are skipped, since a scroller clips them.)
- `layout.js`, `layers.js`, `contract.js`: ok.
- `perf.js`: 0 of 5,000 blocks off their lines. Its timing budgets failed at the PC's scale that day, in v0.7 and v0.8 alike, with the machine under other load: see Performance.

**2026-11-07, v0.7,** same PC: `align.js` 0 off in all 17 runs, `pixel.js` 0 of 60, the rest ok, and `perf.js` inside its budgets.

## Performance

`perf.js`: a page of 2,000 list rows and 2,000 text blocks, with system fonts. Each number is the time until everything is on its line; in brackets, the longest single frame, which is what a reader feels. 5 runs on the same PC, 2026-11-07, v0.7; a phone will be slower. On 2026-11-11 the same PC, busy with other work, took 4,000 to 7,700ms for the first settle in WebKit and 1,040ms in Chromium (v0.7 and v0.8 alike, since the runtime did not change), which is over the PC budget: these timings depend on what else the machine is doing. Blocks off their lines stayed 0 of 5,000. Later that day, with the PC quiet, one WebKit run was back inside the budgets: first settle 1,219ms, one changed row 63ms, 1,000 rows 474ms.

| | WebKit (`settle.js` rounds) | Chromium (CSS rounds) |
|---|---|---|
| First settle, 4,000 blocks arriving at once | 1,100–1,340ms (580–750ms) | 395ms (385ms) |
| One row's text changes | 35–66ms (17–31ms) | 33ms (17ms) |
| 1,000 rows added at once | 455–600ms (240–320ms) | 152ms (146ms) |
| Blocks off their lines, after each of those | 0 of 5,000 | 0 of 5,000 |

Budgets in `perf.js`, scaled ×4 in CI because a shared runner is slower: first settle 1,500ms, one changed row 150ms and one 50ms frame, 1,000 added rows 1,000ms. Timings are budgets; being on the lines is not, and never scales.

### Measuring on a busy machine

One run is a sample, not a reading. `perf.js` judges the median of `PERF_RUNS` runs (3 by default), each on a fresh page, and prints every run's first settle beside the median. `matrix.js` runs it last and alone: until 2026-11-19 it ran beside three other browser tests, so it partly timed the suite itself.

The absolute budgets only mean something on a quiet machine. To ask whether a change made the runtime slower while other work is running, serve a reference build (the last release, from a worktree) on a second port and compare against it. The two run alternately in the same browser, so both feel the same load:

```bash
git worktree add --detach ../trellis-base v0.10.0
(cd ../trellis-base && python -m http.server 8792 --bind 127.0.0.1) &
PERF_RUNS=5 PERF_BASE=http://127.0.0.1:8792/ node tests/perf.js http://127.0.0.1:8794/ webkit
```

Then each median is judged against the base's: no more than `PERF_TOLERANCE` (0.15) slower, and a row change also gets a frame's grace. Being on the lines is still checked in every run.

On 2026-11-19 the development PC (20 cores, about 57% busy with 32 Claude processes and about 130 browser processes) measured, alone, five WebKit first settles of 1,725 to 1,872ms. Alternated with 0.10.0 it measured 1,347 to 2,204ms (median 1,582ms) against 0.10.0's 1,343 to 1,536ms (median 1,499ms): within the tolerance, so the runtime added since 0.10.0 costs no more than the noise. Run to run, the same build moved by up to a quarter on that machine.

On 2026-11-24, at `598efef`, the development PC measured, alone, five WebKit first settles of 1,198 to 1,248ms (median 1,238ms), one changed row 65ms and 1,000 rows 531ms: inside every budget. Alternated with 0.10.0, served from its own worktree on a port checked to be that worktree's, it measured 1,207 to 1,250ms (median 1,220ms) against 1,152 to 1,527ms (median 1,253ms). Blocks off their lines were 0 of 5,000 throughout. The PC was not quiet: 16 to 46% busy in samples taken before and after. Check what a port serves before trusting a base (`curl <url>/.git` names the worktree): a first comparison that day was thrown out because a leftover server already held the base's port.

A WebKit browser on Windows sometimes never answers `browser.close()` once a test has finished. Every test now gives it five seconds and then exits, so a finished test cannot sit with no output. Each run also has two minutes to settle, or `perf.js` fails and says which run stalled.

### What the numbers changed

- **The first plan was to settle rows lazily behind an IntersectionObserver. It can't work:** a visible block's position is the sum of every block above it, so an unsettled block above the fold would push what's visible off its lines.
- **Text used to be settled by padding a measured gap.** WebKit's trimmed heights jitter by 1/64px with position, so corrections moved neighbors, which needed correcting, and it never converged: at 5,000 blocks, up to 87 were off their lines, intermittently, and one changed row took 380ms of blocking work. Text now holds a *count of cells* as its least height, so a box is exactly whole cells and there is nothing to add up.
- **Slicing the work across frames made it 3× slower with the same longest frame.** Layout is the cost, not reading, so more slices mean more layouts. It settles everything queued in one pass. The longest frame during a first settle is the browser laying out the new blocks, and it's the same in every policy tried:

| Batch policy, first settle | Total | Longest frame | Passes |
|---|---|---|---|
| Adaptive, shrinking to 128 | 2,600–2,900ms | 600–730ms | 32–36 |
| Fixed 2,048 | 1,830–1,960ms | 590–630ms | 7–8 |
| All at once (what it does) | 790–840ms | 620–670ms | 2 |

**For a page with thousands of rows:** the first settle is the expensive one. Rendering fewer rows (virtualizing) helps more than anything here can, and the rhythm doesn't mind: a virtualized row is whole cells, so its spacer can be too.
