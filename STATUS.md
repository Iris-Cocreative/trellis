# Status

Where each planned piece of Trellis stands. One line per item: its state, the commit that last changed it, and the test result that backs it. The plan itself lives outside this repository; this file mirrors its state for anyone, or any agent, reading the code alone. The [changelog](CHANGELOG.md) cites the same items by name.

**Updated 2026-11-19.** Version 0.10.0.

States: **idea** (named, not started) · **planning** (its condition is written) · **underway** · **done** (its condition holds and the evidence is recorded) · **integrated** (the owner has confirmed it) · **decided** (the owner has chosen; the work that follows is its own item).

**The suite, last full run** (2026-11-19, unreleased, `f2416c1`, stages: contract ok, Chromium 16/16, WebKit 15/16 with only the `perf.js` timing missed, first settle 1,635ms with the PC busy, 0 of 5,000 blocks off; alone and alternated with `0652f57` three times it read 3,009, 1,382 and 1,467ms against 2,029, 1,361 and 1,681ms, so nothing here moved it. The four commits before it, each on a snapshot: `4808d31`, the ring dot, Chromium 16/16 and WebKit 15/16, the miss the same timing at 1,507ms; `45aeeba`, a row's mark, and `4439468`, the clamp, 16/16 in both; `508f29e`, prose, Chromium 16/16 and WebKit 14/16: the timing at 1,609ms, and `tests/math.js` sat without output until it was stopped, then passed four times in a row alone (1,268 checks), and passed in CI. `508f29e` is green in CI. `tests/math.js` is 1,619 checks from `f2416c1`. Before these, 2026-11-16, `7f6b2c5`, the Figma template: contract ok, Chromium 16/16, WebKit 16/16, first settle 1,284ms in WebKit. Before it, `f46e5ab`, the improvements from the first app: contract ok, Chromium 16/16, WebKit 16/16; at `62a18e1` WebKit 15/16 with only the `perf.js` timing missed, 1,616ms, 0 of 5,000 blocks off. Before them, `670a7db`: contract ok, Chromium 16/16, WebKit 15/16 on the PC with only the `perf.js` timing missed, 0 of 5,000 blocks off; `5b0eb83`, type from seven values, green in CI). Earlier, at `d73f6c5`: green in CI, which had failed since `ff79803`: its WebKit on a 6px sideways scroll at 312% text in the Color study, and from `6283dbc` its older Chromium on the chroma limit; both are fixed. On the development PC, with the slider: `contract.js` ok. Chromium 16/16 and WebKit 15/16 on the development PC: the miss is `perf.js` timing (first settle 1,544ms against 1,500ms; three reruns alone measured 1,523, 1,484 and 1,196ms), 0 of 5,000 blocks off. `align.js` 0 off in 21 runs, `math.js` 914 checks ok. Before it the same day, with color from one seed: Chromium 16/16 and WebKit 16/16: `align.js` 0 off in 21 runs, `math.js` 914 checks ok in both engines, `perf.js` 0 of 5,000 blocks off and inside its budgets (first settle 1,285ms in WebKit). Earlier the same day, with the heading floor: Chromium 16/16 and WebKit 15/16, the miss `perf.js` timing with the machine busy (first settle 1,740ms against 1,500ms), 0 of 5,000 blocks off. On 2026-11-15, 0.10.0: `contract.js` ok. Chromium 16/16 and WebKit 16/16: `align.js` 0 off in 21 runs, `pixel.js` 0 of 176 card edges off, `perf.js` 0 of 5,000 blocks off and inside its budgets (first settle 1,453ms in WebKit). Before that (2026-11-12, then unreleased): `contract.js` ok. Chromium 16/16 and WebKit 15/16 on the development PC: the miss is `perf.js` timing with the machine busy, 0 of 5,000 blocks off. `align.js` 0 off in 21 runs, four of them at 312% text. On 2026-11-11: Chromium 14/14 and WebKit 14/14, and green in CI; `align.js` 0 off in 17 runs, `pixel.js` 0 of 60 card edges off, `math.js` 320 checks ok in both engines, `perf.js` 0 of 5,000 blocks off their lines and inside its PC budgets (first settle 1,219ms in WebKit). Earlier the same day, with the PC busy, `perf.js` missed those budgets; the timings follow the machine's load.

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
| Perf on a quiet PC | underway | | `perf.js` judges a median of runs, runs alone at the end of the matrix, and can compare against a reference build alternately (`PERF_BASE`), so a busy machine asks the right question: alternated with 0.10.0 on a busy PC, the median first settle was 1,582ms against 1,499ms, within the tolerance. Every test gives a hung WebKit close five seconds. Still to do: five runs with nothing else running, for the absolute record. |
| Padding clears the corner | idea | | A floor on card padding from its radius. |
| Private files off the site | idea | | Product layers kept where no public site serves them. |
| Keyboard reach for scrollers | done | `3f5499c` | Rule 20: markup for rails and boards, `settle.js` for prose; `align.js` fails a scroller with no way in, 0 in all 21 runs. |
| A relational palette | done | `4a78c5e` | Seeds and derived roles; `contract.js` checks contrast for core and both examples in both themes; ink on the dark accent 7.7:1 (was 2.5:1). Suite at baseline. |
| Heading space rounds up | done | `5308e58` | Rounds up in `core.css` and `math.js`; `tests/math.js` checks every heading's margin, 368 checks in both engines. |
| Primitive fixes from the specimen | done | `08bea9a` | Every fix from the specimen review is in the changelog: a dense cluster at a surface's end rounds up (D55), how details open (D61), the tab bar (D62), board lane padding (D63), space under hanging rows (D64), your own chat message (D65), scrollbars in rounded corners (D66). |
| Modal dismiss on a drag | done | `8d9b88e` | `settle.js` closes a modal only on a true backdrop click; `tests/layout.js` checks the drag and `data-trellis-stay`, both engines, wide and touch. |
| Every control has every state | done | `55f8915` | One state layer; hover and press measured on primary and ghost buttons, rows and tabs in both engines and both themes. |
| A switch primitive | done | `dff93ee` | `.switch` in core, the specimen's bar and a demo; both engines. |
| Design feedback on the specimen | done | `44a92c9`, `670a7db` | The second round, 2026-11-16, every note built: Measure in 0.4s, one level of dots, straight marks (D85), the cell as counts (D86), a frame's reserve (D87), three levels by ground alone (D88), the hero redrawn, the ratio playground, a palette from one color. A third round the same day: the graph is back in the playground and its three lines are handles (the two spaces, and the width of the live box); the two columns of samples are set by the ratio alone, off the cells; a dense card's last row keeps its spare space above it (D92). A fourth round the same day, built: rods drawn so no edge doubles at 125%, the ratio graph colored by kind of role, stand-ins for photographs and faces drawn from the palette, and a card's scroller cut at the card's line (D95). The owner chose root two with 1.26 narrow, and no core context for type by the ratio alone, for now. |

## Before the second app

| Item | State | Commit | Evidence |
|---|---|---|---|
| Tailwind coexistence spike | done | (this commit) | Real Tailwind 4.3.2 in `experiments/tailwind/`, the first app's setup, built as `next dev` and a production build would. `tests/tailwind.js`, both engines, with core alone and with the first app's product layer: with the statement, in both orders and bundled, every Trellis box sits where it sits without Tailwind, a utility beats the reset, the roles beat preflight; each bare order breaks what the README says; the `@source not inline` line keeps `.list-item` and `.outline` Trellis's. `align.js` on the page, a card grid and an aside in Tailwind utilities: 0 off in 12 runs with the first app's layer (Chromium 1440 and 393 touch, WebKit 1280 and 393 touch; the statement both ways and bundled). D110. The suite with it: contract ok, Chromium 18/18, WebKit 18/18 (first settle 1,202ms). Open: Trellis's `.grid` reaches Tailwind's `grid`. The theme name mapping lives with the app. |
| Navigation templates | done | `d3c54f7` | `.shell.cc-top` with a menu tray, `.float.cc-anchor`, `.shell-foot`, `.outline`, `.crumbs`, `.skip-link` (D80); `tests/layout.js` in both engines, wide and touch. |
| Stacked surfaces | done | `3b7b59e` | Rule 21: a three-step ground ladder from nesting, concentric corners, `.list.cc-group`, a tray grabber, trays that step back, three at most (D81); `tests/layout.js` and `tests/contract.js`, both engines. |
| Interaction presets | done | `6d91f7d` | Fade and press in `core.css`; glow, reveal, detents, swipe and share in the optional `presets.js` (D82); `tests/layout.js` drives each, both engines, wide and touch. |
| Ink on solid fills | done | `9a48945` | Computed from the fill; three seeds a step darker; `tests/contract.js` holds every solid kind and status at 4.5:1 (D83). |
| Measures a compact app needs | done | `744f409` | `--seg-pad`, `--option-h`, `--option-fs`, `--options-w`, `--options-max-h`, `--float-ink` (D84), each defaulting to what was fixed; `tests/layout.js` checks each default and each variable; `contract.js` ok; the matrix 16/16 in Chromium and in WebKit. Asked for by Agent Weaver; it has not taken them up yet. |
| Floats that follow and close | done | `c92b8ab` | Rule 16, the README and the skill say how to open a float; `.float[popover]` reads `--float-x` and `--float-y`; `float.js` (optional, exported) places one by its anchor, keeps it on screen, flips it, follows it and closes it. `tests/layout.js` drives each, both engines, wide and touch; the specimen's Roles menu uses it. Asked for by Agent Weaver. |
| A closed popover float is gone | done | `0e354c0` | `.float[popover]:not(:popover-open) { display: none }` in core; `tests/layout.js` opens and closes an options card and reads its box: no box, no clicks, closed and after closing; it fails without the rule. Both engines. From Agent Weaver. |
| An icon button is `button icon-button` | done | `62a18e1` | The README and the skill write `.button.icon-button` and give the markup once; the specimen's two bare menu buttons are buttons. `tools/check.js` counts `bare-modifiers`: 17 in Agent Weaver's app; in the specimen, one left: its legend's `lg cc-own`, a class of its own named like a modifier. |
| The check sees restyling through an app's own class | done | `62a18e1` | `tools/check.js` counts `restyled-own`: it reads class strings in pages and scripts to learn which classes sit on a primitive, and counts a property the primitive draws; variables, place and `display: none` are the app's. 52 in Agent Weaver's app, beside its 21 restyled. A budget that never recorded a kind reports it and does not fail. The skill says what such a class may carry. |
| Compact density as knobs | done | `18d19fb` | `--density-option-h`, `--density-option-fs`, `--density-options-pad`, `--density-seg-h`, `--density-seg-pad` in core and the template, each defaulting to what was there; `contract.js` ok (70 knobs); `tests/layout.js` sets them on the root and measures a segmented control (two cells) and a menu row (two cells, smaller type), both engines. |
| A switch in a menu row | done | `f46e5ab` | `.switch:empty` takes no gap and sits at the row's end; a row's `aria-checked` lights it; the row is not washed; no hit area of its own in a row. `tests/layout.js`, both engines, wide and touch. |
| Scopes: a product nested in a product | done | | D96: `data-product` on any element; roles and the type followers worked out on every scope; choices carry, what follows follows again; ground and ink seeds; a mood is a scope with `data-theme`. `contract.js` checks each scope's contrast; `tests/math.js` 1,184 checks. Asked for by Interbeing (study: `experiments/scopes/`). |
| Night with its own ground | done | | D97: `--seed-night` and `--night-lift`; `tests/math.js` 1,244 checks in Chromium and WebKit. From Interbeing (Common Ground at night, the Practice House's dusk bar). |
| A paper that is not white; a night accent | done | | D98: `--day-depth`, `--seed-accent-night`; `tests/math.js` 1,268 checks in Chromium and WebKit. From Interbeing. |
| The conversation pieces | done | | D99: `.composer`, `.chat-thread.cc-flat`, the parts a message carries, `.avatar.cc-space`/`.cc-plain`, `.pair`, `.list-item.cc-unread`. From the Collab OS messaging brief. Contract ok (80 knobs); Chromium 16/16; WebKit 15/16, only the `perf.js` timing missed, 0 of 5,000 blocks off, and the last commit is as slow on this machine. |
| A button's face | done | | D100: `--font-button`, `--fw-button`, `--button-case`, `--button-tracking`; a spaced label stays centered; `tests/layout.js` in both engines. From Interbeing (the Practice House buttons). |
| A link may be the current one | done | | D101: `.tab` and `.tag` take `aria-current` as selected; `tests/layout.js` in both engines. From Interbeing's schedule. |
| An eyebrow's own case | done | | D102: `--eyebrow-case`, `--eyebrow-tracking`, following the label's. From Interbeing. |
| A ring dot | done | `4808d31` | D103: `.dot.cc-ring` with `--dot-ring` and `--dot-fill`; `contract.js` holds each status at 3:1 on the page and every raised level; `tests/layout.js` in both engines. From Agent Weaver (request 16) and the Collab OS owed-cards bench. |
| A row's mark on its first line | done | `45aeeba` | D104: `.list-mark` (a capital tall, its mark centered: on the first line however the row wraps; a column a cell wide at the row's start, `--list-mark-w`) and `--list-align` (`flex-start`, or `center` for a one-line row and its controls); `tests/layout.js` in both engines, wide and touch. From the Collab OS owed-cards bench. |
| A clamp that keeps its descenders | done | `4439468` | D105: `.u-clamp` with `--lines` and `--clamp-reach`, clipped from the top by a `clip-path`, its box the role's own; `settle.js` measures the trim where a browser leaves a clamp's box untrimmed (Safari). `tests/layout.js` reads the pixels in both engines, wide and at 3x. From the Collab OS owed-cards bench. |
| Inline atoms in prose | done | `508f29e` | D106: a prose gallery is images and nothing else, so a sentence with two links, a tag or a chip in it stays a sentence; `tests/layout.js` checks eleven shapes and a sentence of atoms, both engines. From the Collab OS owed-cards bench. A chip primitive for a record named in text waits for a second app's shape. |
| Stages: a process palette | done | `f2416c1` | D107: seven stage seeds, each with a fill, an ink that reads as text and a tint, in both themes; a seed may be pale; `.dot` and `.tag` take `.cc-stage-1` to `-7`. `contract.js` holds every stage's ink at 4.5:1 for any seed in sRGB; `tests/math.js` 1,619 checks in Chromium and WebKit. The owner chose seven stages with the last for what is closed, variants on both primitives, and defaults round the wheel. From the Collab OS owed-cards bench. |
| A cover link and a cover image | done | | D108: `.card-link` (the card's title covers the card, its own controls raised above it, the state layer and the focus ring on the cover) and `.media` (a frame in cells, a real `<img>` by cover at `--media-focus`, bleeding to a card's edges as a banner, a strip or the whole ground, taking its corners); `.list-link` raises a row's button the same way. `tests/layout.js` in both engines, wide and touch: every point on the card is its link, the button, the tag and a row's button take real clicks, the ring is drawn round the card from the keyboard, each image fills its frame at its focal point, and each bleed meets its card's edges and corners. From the first app. |
| Choice inputs | done | | D109: `.choice`, checkbox and radio on the native input, boxes on half cells (a cell and a half; `.cc-sm` one, `.cc-lg` two), the row the hit area, at least `--hit-min` on touch; checked, mixed (`indeterminate`), disabled and invalid; `.switch` folded in (shared row and colors, `aria-checked="mixed"`, markup unchanged); the prose task list draws the same box. `tests/layout.js` in both engines, wide and touch. The suite at `6171408`: contract ok, Chromium 16/16, WebKit 16/16; merged with D108 and D110, contract, `layout.js`, `tailwind.js` and `align.js` ok in both. From the review of the second app's outlines. Not yet in the Figma template. |
| A product's own seeds | idea | | A product names a seed of its own (Interbeing's gold) and gets light and dark forms and a contrast check, as the kinds do. From the scopes study. Stages (D107) are seven such seeds in an order, and their arithmetic for a pale seed (`shade()`) is what a named seed would use. |
| Smaller gaps from the first app | idea | | The tooltip's side padding, a button's side padding, an option's ground as a variable, a row that must not wrap: each waits for a second app to ask. Not built, by design. |
| Type by the ratio alone | decided | | Not in core for now: the playground keeps it in the specimen's own CSS, until a long document asks for it. |
| Density at scale | idea | | |
| Theme name mapping | idea | | |
| Person colors | decided | | No change for now. |
| Headings never under body text | decided | | Yes: floor every heading at the body size, and H1 may be larger. At root two H5 and H6 fall under body text; at the golden ratio H4 does too. The work is its own item. |
| Apply the heading floor | done | `87eb93e` | D89: each end of a heading is `max()` of its own step and body's, in `core.css` and `math.js` (`typeEnds()`, `typeSteps()`). At the defaults h6 is 16 to 18. `tests/math.js` reads every heading from the browser and fails one under body's. |
| The ratio model | decided | | Yes: core takes the seven, and works the other five out, each still settable. Decided on the comparison of the two models on the specimen. |
| Apply type from seven values | done | `5b0eb83` | D93: `--rp-min`, `--rp-max`, `--body-min`, `--h1-min` and `--label-min` default to expressions of the seven, in `core.css` and `math.js` (`typeFrom()`); the two spaces are product knobs. `tests/math.js` measures every role against it in both engines. |
| A default ratio of root two | done | `5b0eb83` | D94: 1.26 opening to 1.414, and H1 at 72 in a wide space, chosen on a trial page. H1 is 40.4 to 72; h5 lands on body's size by the ratio and only h6 is held there. |
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
| Review Outlines and mentions | done: kit patterns named (a checklist outline, a mention atom, a mention picker, choice cards); its first core need, choice inputs, is D109 |
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
| Figma template | underway: what Figma can't express is written down (`docs/figma/README.md`). The file is generated by three plugin scripts: `node tools/figma-variables.js --plugin` writes the variables and text styles, and `node tools/figma-components.js --plugin primitives`, then `--plugin templates`, the components, the templates and the screens (two parts, each the shared kit `tools/figma-kit.js` and a body, to fit the 50,000 characters). **Products are modes:** a Product collection with Core, Almanac and Quarry (from `examples/`), and Interbeing with its three scopes (from `experiments/scopes/interbeing.css`), holds each role's size and line at both screens, every color in both themes, the families and weights, and the shape and density knobs, as aliases of Space; Type and Color alias it, so a frame picks product, screen and theme by three modes. **A scope is a Product mode on an inner frame** (D96), worked out with its root's choices carried in, and a mood the same frame in Dark; **Color keeps two modes**, since a dusk, a night ground, a paper and a night accent or ink (D97, D98) are a product's own Dark and Light values. 300 Product variables, 48 Space (with the measures core works out, `derived/…`, a ring's line, a hairline, the shell's columns and a bubble's measure), 41 Type (with a button's family and weight, D100), 99 Color (with ink on each solid hue and stage, each share as a color with its alpha since Figma drops a paint's opacity on an instance, each stage's fill, ink and tint, D107, and the bubble's knobs, D99). **The primitives are components** named by their class chains, bound to those variables: button (kind × size × state), button icon-button, tag (kind with the stages × emphasis × size), avatar (kind with cc-space × ring with cc-plain × size), badge, dot (kind with cc-accent and the stages × fill with cc-ring), switch, range, input, field, tab, tabs, tabs cc-seg, options-card-item, options-card, tooltip, list-item (mark × unread × state), composer, chat-item cc-flat, card (level), modal. **Templates are built from them:** chat-item (the bubble: others' and your own, first and continuing, on `--chat-own-bg`, `--chat-own-ink`, `--chat-bubble-edge`), chat-reaction, list cc-group (its hairlines from the text's start), member-tile (and `cc-row`), skeleton (and `cc-block`), shell (with and without `cc-top`, wide and narrow), crumbs, outline, skip-link (D80). Screens: one settings card in each product, wide and light, phone and dark; an Interbeing page of three scopes, one at night, with a flat thread, a composer and a bubble thread; and the shell in two products, wide across the top in Quarry, a phone's tab bar in Almanac at night. Regenerated with the templates (2026-11-23): the new variables written from the generator's own output and the Templates and Screens from the templates part; the variables checked in the file against the generator's by a checksum of all 2,476 values. The suite with the templates (2026-11-23): contract ok, Chromium 16/16, WebKit 16/16 (first settle a median 1,136ms, 0 of 5,000 blocks off). `tests/contract.js` checks every example layer and every scope is a mode, each mode's colors are the contract's own for that layer or scope, every alias resolves, each script parses and fits the 50,000 characters an agent's Figma tool takes, and every variable the components bind and every role they paint is generated. Not carried: case and tracking (tags, labels, eyebrows, buttons); a mark on a wrapped title's first line; a plain list's hairlines; quotes, files, links, dividers and typing in a thread; a skeleton's shimmer; the shell's middle width and its open menu tray. Next: the cover link and cover image (D108) and the choice inputs (D109), once they land in core; then quotes, files, links, dividers and typing. Due before the next product is rebuilt on Trellis |

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
| Review the workflow | done | | Recorded in the plan on 2026-11-13. |

## Keeping this file

A build session updates the line when an item's state changes, in the same commit as the work where it can, and updates the suite line after a full run. It names items and never people, clients or anything internal.
