# Status

Where each planned piece of Trellis stands. One line per item: its state, the commit that last changed it, and the test result that backs it. The plan itself lives outside this repository; this file mirrors its state for anyone, or any agent, reading the code alone. The [changelog](CHANGELOG.md) cites the same items by name.

**Updated 2026-11-16.** Version 0.10.0.

States: **idea** (named, not started) · **planning** (its condition is written) · **underway** · **done** (its condition holds and the evidence is recorded) · **integrated** (the owner has confirmed it) · **decided** (the owner has chosen; the work that follows is its own item).

**The suite, last full run** (2026-11-16, unreleased, `d73f6c5`). Green in CI, which had failed since `ff79803`: its WebKit on a 6px sideways scroll at 312% text in the Color study, and from `6283dbc` its older Chromium on the chroma limit; both are fixed. On the development laptop, with the slider: `contract.js` ok. Chromium 16/16 and WebKit 15/16 on the development laptop: the miss is `perf.js` timing (first settle 1,544ms against 1,500ms; three reruns alone measured 1,523, 1,484 and 1,196ms), 0 of 5,000 blocks off. `align.js` 0 off in 21 runs, `math.js` 914 checks ok. Before it the same day, with color from one seed: Chromium 16/16 and WebKit 16/16: `align.js` 0 off in 21 runs, `math.js` 914 checks ok in both engines, `perf.js` 0 of 5,000 blocks off and inside its budgets (first settle 1,285ms in WebKit). Earlier the same day, with the heading floor: Chromium 16/16 and WebKit 15/16, the miss `perf.js` timing with the machine busy (first settle 1,740ms against 1,500ms), 0 of 5,000 blocks off. On 2026-11-15, 0.10.0: `contract.js` ok. Chromium 16/16 and WebKit 16/16: `align.js` 0 off in 21 runs, `pixel.js` 0 of 176 card edges off, `perf.js` 0 of 5,000 blocks off and inside its budgets (first settle 1,453ms in WebKit). Before that (2026-11-12, then unreleased): `contract.js` ok. Chromium 16/16 and WebKit 15/16 on the development laptop: the miss is `perf.js` timing with the machine busy, 0 of 5,000 blocks off. `align.js` 0 off in 21 runs, four of them at 312% text. On 2026-11-11: Chromium 14/14 and WebKit 14/14, and green in CI; `align.js` 0 off in 17 runs, `pixel.js` 0 of 60 card edges off, `math.js` 320 checks ok in both engines, `perf.js` 0 of 5,000 blocks off their lines and inside its laptop budgets (first settle 1,219ms in WebKit). Earlier the same day, with the laptop busy, `perf.js` missed those budgets; the timings follow the machine's load.

## Before the first app

Everything here lands before the first app pins a version.

| Item | State | Commit | Evidence |
|---|---|---|---|
| Report what is already applied | integrated | `dc57bea` | The v0.7 suite and the 0.8.0 suite match: same counts, 0 off. |
| Its own repository | integrated | `dc57bea` | Public, one fresh first commit, CI green, Pages serves the specimen, installs by git address; the old location is a pointer and redirects here. |
| MIT license | integrated | `dc57bea` | `LICENSE`; `contract.js` checks it. |
| Rename to Trellis | integrated | `dc57bea` | Layers, package, global, headers and tests renamed; 0.8.0 lists each as breaking; the private product layers declare the new layer name. |
| Neutral public specimen | integrated | `dc57bea` | No product switcher, no web fonts; two example layers in the matrix; one outside layer by address. |
| Tests in CI | done | `dc57bea` | Every push and pull request, Chromium and WebKit. |
| Package shape | done | `dc57bea` | A scratch project installed it by git address with no token. |
| Namespace the cascade layers | integrated | `dc57bea` | `layers.js`, both engines; `contract.js` fails on a layer outside `trellis`. |
| One runtime file | integrated | `dc57bea` | `settle.js` sets the device pixel ratio and fit width itself. |
| Prose context | integrated | `dc57bea` | `align.js`: 0 of 90 prose blocks off (89 in WebKit). |
| Post type layouts | integrated | `dc57bea` | `layout.js`, both engines, wide and phone. |
| Wave 1 primitives | integrated | `dc57bea` | `layout.js` checks inputs on touch and opens the modal and the sheet. |
| Three rule conflicts | done | `dc57bea` | Gap utilities reach clusters only; rule 5 and the cluster comment say what they should. |
| Settle performance test | integrated | `dc57bea` | `perf.js` in CI: inside its budgets, 0 of 5,000 off. |
| Version contract | integrated | `dc57bea` | Changelog from 0.2.0; the README's Public API, checked by `contract.js`. |
| React contract | integrated | `dc57bea` | `REACT.md`. |
| Split card padding | integrated | `7751fba` | `layout.js` checks the default, each knob alone and the shorthand. |
| Token source | integrated | `08086e2` | `contract.js` fails on a stale `core.css`; the specimen renders identically before and after. |
| Math module | integrated | `150398b` | `tests/math.js`: 320 checks, both engines; `contract.js` checks its seed and worked examples. |
| Five ways to meet a line | decided | | Yes: Stand, Hang, Inset, Outset and Center, and the card behavior called Hang becomes Outset. |
| Apply the five relations | done | `ddff689` | `--hang` is `--outset` everywhere, the README names all five; `contract.js` ok, suite at baseline. Breaking, under Unreleased. |
| Cap on the cell | decided | | Yes: the cell follows the reader's text size up to a cap; above it only type grows. |
| Apply the cap on the cell | done | `bcc9438`, `f077de3` | The cap in the token source, the math module, core and rule 19; `align.js` at 312% in both engines and all three layers: 0 off, no sideways scroll. |
| Read the cell from a probe | done | `379a604` | WebKit at 312% text now reports the cell Chromium does (18 wide, 15.09 on a phone); suite at baseline. |
| Controls past the cap | done | `f077de3` | Button, icon button, tag, input, tab and badge are never shorter than their type; nothing moves at default sizes. |
| Cap-centered text that wraps | done | `005048f` | `settle.js` marks a wrapped label and core hangs it from its row's top, in whole cells (D67); `tests/align.js` and `tests/layout.js`, both engines. |
| Perf on a quiet laptop | idea | | Rerun `perf.js webkit` with nothing else running. |
| Padding clears the corner | idea | | A floor on card padding from its radius. |
| Private files off the site | idea | | Product layers kept where no public site serves them. |
| Keyboard reach for scrollers | done | `3f5499c` | Rule 20: markup for rails and boards, `settle.js` for prose; `align.js` fails a scroller with no way in, 0 in all 21 runs. |
| A relational palette | done | `4a78c5e` | Seeds and derived roles; `contract.js` checks contrast for core and both examples in both themes; ink on the dark accent 7.7:1 (was 2.5:1). Suite at baseline. |
| Heading space rounds up | done | `5308e58` | Rounds up in `core.css` and `math.js`; `tests/math.js` checks every heading's margin, 368 checks in both engines. |
| Primitive fixes from the specimen | underway | `08bea9a` | Dense cluster at a surface's end rounds up (D55). |
| Modal dismiss on a drag | done | `8d9b88e` | `settle.js` closes a modal only on a true backdrop click; `tests/layout.js` checks the drag and `data-trellis-stay`, both engines, wide and touch. |
| Every control has every state | done | `55f8915` | One state layer; hover and press measured on primary and ghost buttons, rows and tabs in both engines and both themes. |
| A switch primitive | done | `dff93ee` | `.switch` in core, the specimen's bar and a demo; both engines. |
| Design feedback on the specimen | done | `44a92c9` | The second round, 2026-11-16, every note built: Measure in 0.4s, one level of dots, straight marks (D85), the cell as counts (D86), a frame's reserve (D87), three levels by ground alone (D88), the hero redrawn, the ratio playground, a palette from one color. Waiting on the owner's eye, and on two decisions the studies raise: the ratio model and what core derives of color. |

## Before the second app

| Item | State | Commit | Evidence |
|---|---|---|---|
| Tailwind coexistence spike | idea | | `layers.js` proves the order against the shape of Tailwind's layers, not Tailwind itself. |
| Navigation templates | done | `d3c54f7` | `.shell.cc-top` with a menu tray, `.float.cc-anchor`, `.shell-foot`, `.outline`, `.crumbs`, `.skip-link` (D80); `tests/layout.js` in both engines, wide and touch. |
| Stacked surfaces | done | `3b7b59e` | Rule 21: a three-step ground ladder from nesting, concentric corners, `.list.cc-group`, a tray grabber, trays that step back, three at most (D81); `tests/layout.js` and `tests/contract.js`, both engines. |
| Interaction presets | done | `6d91f7d` | Fade and press in `core.css`; glow, reveal, detents, swipe and share in the optional `presets.js` (D82); `tests/layout.js` drives each, both engines, wide and touch. |
| Ink on solid fills | done | `9a48945` | Computed from the fill; three seeds a step darker; `tests/contract.js` holds every solid kind and status at 4.5:1 (D83). |
| Measures a compact app needs | done | `744f409` | `--seg-pad`, `--option-h`, `--option-fs`, `--options-w`, `--options-max-h`, `--float-ink` (D84), each defaulting to what was fixed; `tests/layout.js` checks each default and each variable; `contract.js` ok; the matrix 16/16 in Chromium and in WebKit. Asked for by Agent Weaver; it has not taken them up yet. |
| Floats that follow and close | idea | | |
| Density at scale | idea | | |
| Theme name mapping | idea | | |
| Person colors | decided | | No change for now. |
| Headings never under body text | decided | | Yes: floor every heading at the body size, and H1 may be larger. At root two H5 and H6 fall under body text; at the golden ratio H4 does too. The work is its own item. |
| Apply the heading floor | done | `87eb93e` | D89: each end of a heading is `max()` of its own step and body's, in `core.css` and `math.js` (`typeEnds()`, `typeSteps()`). At the defaults h6 is 16 to 18. `tests/math.js` reads every heading from the browser and fails one under body's. |
| The ratio model | decided | | Yes: core takes the seven, and works the other five out, each still settable. Decided on the comparison of the two models on the specimen. |
| Apply type from seven values | done | COMMIT | D93: `--rp-min`, `--rp-max`, `--body-min`, `--h1-min` and `--label-min` default to expressions of the seven, in `core.css` and `math.js` (`typeFrom()`); the two spaces are product knobs. `tests/math.js` measures every role against it in both engines. |
| A default ratio of root two | done | COMMIT | D94: 1.26 opening to 1.414, and H1 at 72 in a wide space, chosen on a trial page. H1 is 40.4 to 72; h5 lands on body's size by the ratio and only h6 is held there. |
| Color from one seed | decided | | Yes: core derives the kinds, the statuses and the neutral from the accent, each still settable, as the specimen's study does. The work is its own item. |
| Apply color from one seed | done | `6283dbc`, `d73f6c5` | D90: nine seeds default to tokens derived from the accent, in closed form in `core.css` and `math.js` (`derived()`): a lightness kept clear of the ink flip and a chroma limit by hue, in straight segments written with `clamp()` alone, stand in for the study's loop. `contract.js` holds ink at 4.5:1 on every derived seed for about 2,000 accents; `tests/math.js` checks the browser's seeds against `math.js` for five accents in both engines. Core's own kinds, statuses and neutral move. |
| A slider | done | `c6d7ee4` | D91: `.range`, an `input type="range"` on the cells, with `.cc-zone`; `settle.js` writes `--range-at` so the track is inked up to the thumb. The ratio playground and the Color study use it. `tests/layout.js` checks its row, its thumb, `--range-at` on a move and from `Trellis.range()`, and the touch target, in both engines. |

## Knowledge base

One chapter each. Rules, decisions and primitives will carry stable IDs that the tests, the changelog and commit notes cite.

| Item | State |
|---|---|
| Start Here | idea |
| Agent skill | done: `skill/SKILL.md`, every class and variable it names checked against `core.css` |
| The Seed | done |
| Rules | done |
| Decisions | done: every record has its alternatives |
| Anatomy | done |
| Type | idea |
| Primitives | idea |
| Color and Theme | done: `C1` to `C5` |
| Products and Platforms | idea |
| Support and Degradation | idea |
| Tooling | idea |
| Adoption | idea |
| Versioning | idea |
| Open Questions and Roadmap | idea |
| Diagram the parts | idea |

## Off the Trellis

Work that grows from the grid or leaves it, and still belongs to it.

| Item | State |
|---|---|
| Three relations | idea |
| Lattice in 3D | idea |
| Zoom as a local dial | idea |
| Motion proportions | idea |
| Grow by cells | idea |
| Mycelium vines | underway |

## Kit

| Item | State |
|---|---|
| Review Outlines and mentions | idea |
| Fold | idea |
| Stacked surfaces | done: see Before the second app |
| Interaction presets | done: see Before the second app |
| Component and collection contract | idea |
| Navigation templates | done: see Before the second app |
| Icons | idea |
| Right-sized images | idea |
| Calendar standards | idea |
| Specimen as knob editor | done: `e252bf0`, the specimen's Tune it |
| Figma conventions | decided: code is the source and the file is generated from it; variables named as the tokens, with Phone and Wide modes for the cell and Light and Dark for color; layouts as auto layout; what Figma can't express is written down before anyone designs in it. Mockups are HTML on `core.css` by default; Figma is for work that needs a designer's hands on it |
| Figma template | planning: one library, products as modes, generated from `tokens.json` and `math.js`, components named by their class chains; a one-screen spike first. Due before the next product is rebuilt on Trellis |

## Platforms

| Item | State |
|---|---|
| Platform layer | idea |
| Web view host | idea |
| React Native theme | idea |
| Hybrid seam test | idea |
| Forced colors fallback | done: one forced-colors block, checked by `tests/layout.js` (D83) |
| Write down the surface default | idea |
| Native or web, per surface | decided |

## Release

The repository is public from the start. This is the release, and it waits until two apps run on Trellis.

| Item | State |
|---|---|
| Possibilities demo | idea |
| Lint rules | underway: `tools/check.js` counts raw values, restyled primitives, a product layer's non-knobs and inline styles, with a budget; alignment in a consuming app is not checked yet |
| Contributing guide | idea |
| About page | idea |
| First release | planning |

## Working together

| Item | State | Commit | Evidence |
|---|---|---|---|
| Connect the build session | done | | |
| Status file in the repository | done | `0b7e2c6` | This file. |
| Review the workflow | idea | | |

## Keeping this file

A build session updates the line when an item's state changes, in the same commit as the work where it can, and updates the suite line after a full run. It names items and never people, clients or anything internal.
