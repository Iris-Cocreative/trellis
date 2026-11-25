# Status

Where each planned piece of Trellis stands. One line per item: its state, the commit that last changed it, and the test result that backs it. The plan itself lives outside this repository; this file mirrors its state for anyone, or any agent, reading the code alone. The [changelog](CHANGELOG.md) cites the same items by name.

**Updated 2026-11-19.** Version 0.10.0.

States: **idea** (named, not started) · **planning** (its condition is written) · **underway** · **done** (its condition holds and the evidence is recorded) · **integrated** (the owner has confirmed it) · **decided** (the owner has chosen; the work that follows is its own item).

**The suite, last full run** (2026-11-24, unreleased, five defects found on the way: contract ok, Chromium 18/18, WebKit 18/18 (first settle 1,255ms), and `layout.js` and `align.js` at 312% with Verdana in both engines. Before it, 2026-11-24, unreleased, the band in the other scheme, D113 and the cap's comparison merged with D112: contract ok, Chromium 18/18, WebKit 18/18 (first settle 1,164ms), and `layout.js` and `align.js` at 312% with Verdana in both engines. Before it, 2026-11-24, unreleased, the gaps from the first app's mockups, D112: contract ok, Chromium 18/18, WebKit 17/18 with only the `perf.js` timing missed, first settle 1,882ms with three sessions on the PC and 0 of 5,000 blocks off; alone afterward, alternated twice with the commit before it, inside every budget at 1,335 and 1,349ms against 1,498 and 1,245ms. Before it, 2026-11-23, the D111 fix after CI: contract ok, Chromium 18/18, WebKit 18/18; `tests/layout.js` at 312% also with `FONT=Verdana` and `FONT=Georgia` in both engines. Before it, `e5331a8`, the float past the cap, the tab bar's mark and the radio tab, on the merged pull request: Chromium 18/18, WebKit 17/18 with only the `perf.js` timing missed, first settle 1,574ms with four sessions on the PC and 0 of 5,000 blocks off; `settle.js` untouched. Before it, 2026-11-19, `f2416c1`, stages: contract ok, Chromium 16/16, WebKit 15/16 with only the `perf.js` timing missed, first settle 1,635ms with the PC busy, 0 of 5,000 blocks off; alone and alternated with `0652f57` three times it read 3,009, 1,382 and 1,467ms against 2,029, 1,361 and 1,681ms, so nothing here moved it. The four commits before it, each on a snapshot: `4808d31`, the ring dot, Chromium 16/16 and WebKit 15/16, the miss the same timing at 1,507ms; `45aeeba`, a row's mark, and `4439468`, the clamp, 16/16 in both; `508f29e`, prose, Chromium 16/16 and WebKit 14/16: the timing at 1,609ms, and `tests/math.js` sat without output until it was stopped, then passed four times in a row alone (1,268 checks), and passed in CI. `508f29e` is green in CI. `tests/math.js` is 1,619 checks from `f2416c1`. Before these, 2026-11-16, `7f6b2c5`, the Figma template: contract ok, Chromium 16/16, WebKit 16/16, first settle 1,284ms in WebKit. Before it, `f46e5ab`, the improvements from the first app: contract ok, Chromium 16/16, WebKit 16/16; at `62a18e1` WebKit 15/16 with only the `perf.js` timing missed, 1,616ms, 0 of 5,000 blocks off. Before them, `670a7db`: contract ok, Chromium 16/16, WebKit 15/16 on the PC with only the `perf.js` timing missed, 0 of 5,000 blocks off; `5b0eb83`, type from seven values, green in CI). Earlier, at `d73f6c5`: green in CI, which had failed since `ff79803`: its WebKit on a 6px sideways scroll at 312% text in the Color study, and from `6283dbc` its older Chromium on the chroma limit; both are fixed. On the development PC, with the slider: `contract.js` ok. Chromium 16/16 and WebKit 15/16 on the development PC: the miss is `perf.js` timing (first settle 1,544ms against 1,500ms; three reruns alone measured 1,523, 1,484 and 1,196ms), 0 of 5,000 blocks off. `align.js` 0 off in 21 runs, `math.js` 914 checks ok. Before it the same day, with color from one seed: Chromium 16/16 and WebKit 16/16: `align.js` 0 off in 21 runs, `math.js` 914 checks ok in both engines, `perf.js` 0 of 5,000 blocks off and inside its budgets (first settle 1,285ms in WebKit). Earlier the same day, with the heading floor: Chromium 16/16 and WebKit 15/16, the miss `perf.js` timing with the machine busy (first settle 1,740ms against 1,500ms), 0 of 5,000 blocks off. On 2026-11-15, 0.10.0: `contract.js` ok. Chromium 16/16 and WebKit 16/16: `align.js` 0 off in 21 runs, `pixel.js` 0 of 176 card edges off, `perf.js` 0 of 5,000 blocks off and inside its budgets (first settle 1,453ms in WebKit). Before that (2026-11-12, then unreleased): `contract.js` ok. Chromium 16/16 and WebKit 15/16 on the development PC: the miss is `perf.js` timing with the machine busy, 0 of 5,000 blocks off. `align.js` 0 off in 21 runs, four of them at 312% text. On 2026-11-11: Chromium 14/14 and WebKit 14/14, and green in CI; `align.js` 0 off in 17 runs, `pixel.js` 0 of 60 card edges off, `math.js` 320 checks ok in both engines, `perf.js` 0 of 5,000 blocks off their lines and inside its PC budgets (first settle 1,219ms in WebKit). Earlier the same day, with the PC busy, `perf.js` missed those budgets; the timings follow the machine's load.

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
| Test the cap's value | done | `619f489` | D46 holds the comparison: 1.25, 1.5 and 2 in scratch copies, `align.js` at six text sizes, on 393 and 320 phones and 1440 wide, both engines, with both example layers at two of the sizes (180 runs). 2 scrolls sideways at 320 from 200%; 1.25 leaves the specimen's lines at 312% on a phone; 1.5 stays; 1.25 reads better on a phone, and is the owner's question. |
| Read the cell from a probe | done | `379a604` | WebKit at 312% text now reports the cell Chromium does (18 wide, 15.09 on a phone); suite at baseline. |
| Controls past the cap | done | `f077de3` | Button, icon button, tag, input, tab and badge are never shorter than their type; nothing moves at default sizes. |
| Cap-centered text that wraps | done | `005048f` | `settle.js` marks a wrapped label and core hangs it from its row's top, in whole cells (D67); `tests/align.js` and `tests/layout.js`, both engines. |
| Perf on a quiet PC | underway | | `perf.js` judges a median of runs, runs alone at the end of the matrix, and can compare against a reference build alternately (`PERF_BASE`), so a busy machine asks the right question: alternated with 0.10.0 on a busy PC, the median first settle was 1,582ms against 1,499ms, within the tolerance. Every test gives a hung WebKit close five seconds. On 2026-11-24 five runs alone were inside every budget (median first settle 1,238ms) and, alternated, no slower than 0.10.0, with the PC 16 to 46% busy (`tests/README.md`). Still open: the same five with nothing else running. |
| Padding clears the corner | done | `89cec08` | D113, rule 22: a card's padding is held to what clears its corner, 0.293 of the radius with equal paddings and less beside a roomier one, and grows by whole cells. 0 of 54 cards and 0 of 3,550 boxes differ from before with core, Quarry and Almanac, wide, on a phone and at 312% text, both engines. `tests/layout.js` in both engines, wide and touch; it fails without the floor. Bleeding media and a scroller still meet a raised card's edges. |
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
| Measures a compact app needs | done | `744f409` | `--seg-pad`, `--option-h`, `--option-fs`, `--options-w`, `--options-max-h`, `--float-ink` (D84), each defaulting to what was fixed; `tests/layout.js` checks each default and each variable; `contract.js` ok; the matrix 16/16 in Chromium and in WebKit. Asked for by the desktop tool; it has not taken them up yet. |
| Floats that follow and close | done | `c92b8ab` | Rule 16, the README and the skill say how to open a float; `.float[popover]` reads `--float-x` and `--float-y`; `float.js` (optional, exported) places one by its anchor, keeps it on screen, flips it, follows it and closes it. `tests/layout.js` drives each, both engines, wide and touch; the specimen's Roles menu uses it. Asked for by the desktop tool. |
| A closed popover float is gone | done | `0e354c0` | `.float[popover]:not(:popover-open) { display: none }` in core; `tests/layout.js` opens and closes an options card and reads its box: no box, no clicks, closed and after closing; it fails without the rule. Both engines. From the desktop tool. |
| An icon button is `button icon-button` | done | `62a18e1` | The README and the skill write `.button.icon-button` and give the markup once; the specimen's two bare menu buttons are buttons. `tools/check.js` counts `bare-modifiers`: 17 in the desktop tool; in the specimen, one left: its legend's `lg cc-own`, a class of its own named like a modifier. |
| The check sees restyling through an app's own class | done | `62a18e1` | `tools/check.js` counts `restyled-own`: it reads class strings in pages and scripts to learn which classes sit on a primitive, and counts a property the primitive draws; variables, place and `display: none` are the app's. 52 in the desktop tool, beside its 21 restyled. A budget that never recorded a kind reports it and does not fail. The skill says what such a class may carry. |
| Compact density as knobs | done | `18d19fb` | `--density-option-h`, `--density-option-fs`, `--density-options-pad`, `--density-seg-h`, `--density-seg-pad` in core and the template, each defaulting to what was there; `contract.js` ok (70 knobs); `tests/layout.js` sets them on the root and measures a segmented control (two cells) and a menu row (two cells, smaller type), both engines. |
| A switch in a menu row | done | `f46e5ab` | `.switch:empty` takes no gap and sits at the row's end; a row's `aria-checked` lights it; the row is not washed; no hit area of its own in a row. `tests/layout.js`, both engines, wide and touch. |
| Scopes: a product nested in a product | done | | D96: `data-product` on any element; roles and the type followers worked out on every scope; choices carry, what follows follows again; ground and ink seeds; a mood is a scope with `data-theme`. `contract.js` checks each scope's contrast; `tests/math.js` 1,184 checks. Asked for by the community app (study: `experiments/scopes/`). |
| A scheme on part of a page | done | `724fca6` | D96 made a scope with `data-theme` a mood; the specimen's band now shows it, always in the theme the page isn't. `tests/align.js` in both engines, both page themes, wide and on a phone, with core and both example layers (24 runs): 0 of its 34 blocks off, each of its 45 color roles the one the page has in that theme, its ground read from the pixels, its text from 4.8:1 up. It fails with the ground unpainted, the scheme unset, the page's own scheme, a role fixed, and no band. |
| Night with its own ground | done | | D97: `--seed-night` and `--night-lift`; `tests/math.js` 1,244 checks in Chromium and WebKit. From the community app (the home space at night, the studio's dusk bar). |
| A paper that is not white; a night accent | done | | D98: `--day-depth`, `--seed-accent-night`; `tests/math.js` 1,268 checks in Chromium and WebKit. From the community app. |
| The conversation pieces | done | | D99: `.composer`, `.chat-thread.cc-flat`, the parts a message carries, `.avatar.cc-space`/`.cc-plain`, `.pair`, `.list-item.cc-unread`. From the planning app's messaging brief. Contract ok (80 knobs); Chromium 16/16; WebKit 15/16, only the `perf.js` timing missed, 0 of 5,000 blocks off, and the last commit is as slow on this machine. |
| A button's face | done | | D100: `--font-button`, `--fw-button`, `--button-case`, `--button-tracking`; a spaced label stays centered; `tests/layout.js` in both engines. From the community app (the studio's buttons). |
| A link may be the current one | done | | D101: `.tab` and `.tag` take `aria-current` as selected; `tests/layout.js` in both engines. From the community app's schedule. |
| An eyebrow's own case | done | | D102: `--eyebrow-case`, `--eyebrow-tracking`, following the label's. From the community app. |
| A ring dot | done | `4808d31` | D103: `.dot.cc-ring` with `--dot-ring` and `--dot-fill`; `contract.js` holds each status at 3:1 on the page and every raised level; `tests/layout.js` in both engines. From the desktop tool (request 16) and the planning app's owed-cards bench. |
| A row's mark on its first line | done | `45aeeba` | D104: `.list-mark` (a capital tall, its mark centered: on the first line however the row wraps; a column a cell wide at the row's start, `--list-mark-w`) and `--list-align` (`flex-start`, or `center` for a one-line row and its controls); `tests/layout.js` in both engines, wide and touch. From the planning app's owed-cards bench. |
| A clamp that keeps its descenders | done | `4439468` | D105: `.u-clamp` with `--lines` and `--clamp-reach`, clipped from the top by a `clip-path`, its box the role's own; `settle.js` measures the trim where a browser leaves a clamp's box untrimmed (Safari). `tests/layout.js` reads the pixels in both engines, wide and at 3x. From the planning app's owed-cards bench. |
| Inline atoms in prose | done | `508f29e` | D106: a prose gallery is images and nothing else, so a sentence with two links, a tag or a chip in it stays a sentence; `tests/layout.js` checks eleven shapes and a sentence of atoms, both engines. From the planning app's owed-cards bench. A chip primitive for a record named in text waits for a second app's shape. |
| Stages: a process palette | done | `f2416c1` | D107: seven stage seeds, each with a fill, an ink that reads as text and a tint, in both themes; a seed may be pale; `.dot` and `.tag` take `.cc-stage-1` to `-7`. `contract.js` holds every stage's ink at 4.5:1 for any seed in sRGB; `tests/math.js` 1,619 checks in Chromium and WebKit. The owner chose seven stages with the last for what is closed, variants on both primitives, and defaults round the wheel. From the planning app's owed-cards bench. |
| A cover link and a cover image | done | | D108: `.card-link` (the card's title covers the card, its own controls raised above it, the state layer and the focus ring on the cover) and `.media` (a frame in cells, a real `<img>` by cover at `--media-focus`, bleeding to a card's edges as a banner, a strip or the whole ground, taking its corners); `.list-link` raises a row's button the same way. `tests/layout.js` in both engines, wide and touch: every point on the card is its link, the button, the tag and a row's button take real clicks, the ring is drawn round the card from the keyboard, each image fills its frame at its focal point, and each bleed meets its card's edges and corners. From the first app. In the Figma template: `media`, `card:has(.card-link)` and `list-item:has(.list-link)`. |
| Choice inputs | done | | D109: `.choice`, checkbox and radio on the native input, boxes on half cells (a cell and a half; `.cc-sm` one, `.cc-lg` two), the row the hit area, at least `--hit-min` on touch; checked, mixed (`indeterminate`), disabled and invalid; `.switch` folded in (shared row and colors, `aria-checked="mixed"`, markup unchanged); the prose task list draws the same box. `tests/layout.js` in both engines, wide and touch. The suite at `6171408`: contract ok, Chromium 16/16, WebKit 16/16; merged with D108 and D110, contract, `layout.js`, `tailwind.js` and `align.js` ok in both. From the review of the second app's outlines. In the Figma template: `choice` in every state and size, and the switch's mixed state. |
| Gaps from a site moving on | done | | `.grid.cc-fill`, `.button.cc-block`, `--tag-edge-style`, `--chevron-color`, `--frame-max-n` as a knob, `--surface` as a card's ground, and the outset never moving a frame; a teammate's pull request, merged with main, `tests/layout.js` in both engines. |
| Floats past the cap | done | | D111: past the cell's cap an options card's width grows with its type in whole cells, up to the screen less its margins; `--u-type` over `--u-base`, exactly 1 at default sizes. `tests/layout.js` measures the specimen's options cards at 312% text in both engines, wide and touch, with the default faces and with `FONT=Verdana` or `Georgia`; a select's text is clipped to its box. |
| Two small core gaps | done | | The tab bar's current link takes its own mark (the top edge) in place of the column's; `.tab[aria-checked="true"]` is selected, for a segmented control of radios. `tests/layout.js` in both engines, wide and touch. |
| Gaps from the first app's mockups | done | | Four defects: prose in a bubble that shrinks to its content, a message's typed line breaks (D112), a shell's column for an aside it doesn't have, a side column's brand in the tab bar. `tests/layout.js` in both engines, wide and touch, each check failing without its rule. Documented: a tag's own color, a photo in an avatar, a filled icon, a modal's step counter, a member tile beside a tall avatar. What else the mockups asked for was sorted against this version and is the owner's to choose from. |
| Defects found on the way | done | (this commit) | Controls with no fill of their own on a full-bleed card are white, their edge, hover, press and ring with them, in both themes (D108); a choice's line is never shorter than its type, so its row holds at 340% text (Chromium: 0 off where about 900 edges were); a member tile's cluster is no wider than its tile (320px, 312%: no sideways scroll in core, Quarry or Almanac, both engines); `tests/align.js` knows a textarea takes focus, reads the band's pixels where a phone page that scrolls sideways has them, and is told the width it measures sideways scroll against. Each new check fails without its fix, and the reach and band checks still fail in every real case, on an ordinary page and on one that scrolls sideways, in both engines. The Figma file's full bleed waits for its next regeneration. |
| The `.grid` name beside Tailwind | decided | | Trellis keeps `.grid` (D110); a surface still on Tailwind sets its own gap and columns, and the clash ends when it moves over. The first app's theme map lists its grids that set neither or only one. |
| A product's own seeds | idea | | A product names a seed of its own (the community app's gold) and gets light and dark forms and a contrast check, as the kinds do. From the scopes study. Stages (D107) are seven such seeds in an order, and their arithmetic for a pale seed (`shade()`) is what a named seed would use. |
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
| Agent guidance | done: `AGENTS.md` at the root points an agent at the skill, the adoption guide, the Public API, `docs/` and the tests, and names the five places Trellis disagrees with ordinary web practice |
| The surface default | underway: the README's adoption section says it (native for the shell, navigation, messaging and long lists; a web view for content, media and canvases); the first app's own build document has yet to |
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
| Figma template | underway: what Figma can't express is written down (`docs/figma/README.md`). The file is generated by six plugin scripts, each under the 50,000 characters an agent's Figma tool takes: `node tools/figma-variables.js --plugin product`, then `--plugin space-type-color`, write the variables and text styles (each part makes what the other's aliases need, empty, so either can go first; `--only` writes a delta; `--checksum` and `--plugin checksum` compare the file with the generator), and `node tools/figma-components.js --plugin primitives`, `--plugin thread`, `--plugin templates` and `--plugin screens` the components and the screens, a section each (each the shared kit `tools/figma-kit.js`, what it shares and a body). `tools/figma-inventory.js` runs them against a stand-in for Figma's API and prints what they draw; `--plugin` prints a script that reads the same from the file. **Products are modes:** a Product collection with Core, Almanac and Quarry (from `examples/`), and Grove (the community app, as the scopes study draws it) with its three scopes (from `experiments/scopes/grove.css`), holds each role's size and line at both screens, every color in both themes, the families and weights, and the shape and density knobs, as aliases of Space; Type and Color alias it, so a frame picks product, screen and theme by three modes. **A scope is a Product mode on an inner frame** (D96), worked out with its root's choices carried in, and a mood the same frame in Dark; **Color keeps two modes**, since a dusk, a night ground, a paper and a night accent or ink (D97, D98) are a product's own Dark and Light values. 322 Product variables, 55 Space (with the measures core works out, `derived/…`, a ring's line, a hairline, the shell's columns, a tray's width, the measures of a bubble, a file and a link, a textarea's lines, a media frame's height and corner), 41 Type (with a button's family and weight, D100), 110 Color (with white, ink on each solid hue and stage, each share as a color with its alpha since Figma drops a paint's opacity on an instance, each stage's fill, ink and tint, D107, and the bubble's knobs, D99). **The primitives are components** named by their class chains, bound to those variables: button (kind × size × state), button icon-button, tag (kind with the stages × emphasis × size; its dot and its remove by property), avatar (kind with cc-space × ring with cc-plain × size), badge, dot (kind with cc-accent and the stages × fill with cc-ring), switch (with its mixed state), choice (checkbox and radio × checked, mixed × invalid, disabled × size, D109), range, input (input, select, textarea × state × size), field, tab, tabs, tabs cc-seg, options-card-item, options-card (with a heading and a rule), tooltip, list-item (mark × unread × state), composer, card (level), modal, modal cc-tray (side). **The conversation** (D99) is its own section: chat-quote, chat-file (each kind's tint), chat-link (with and without its image), chat-reaction, chat-divider (and cc-new), chat-typing, chat-item (the bubble: others' and your own, first and continuing, removed, on `--chat-own-bg`, `--chat-own-ink`, `--chat-bubble-edge`), chat-item cc-flat (first and continuing × rest, hover with its actions, removed), chat-item cc-wall, chat-item cc-system; a message shows a quote, a file, a link, reactions or "(edited)" by property. **Templates are built from the primitives:** list cc-group (its hairlines from the text's start), a swiped list-item with its list-actions, avatar-stack, an avatar with its avatar-dot, prose, member-tile (and `cc-row`), skeleton (and `cc-block`), media (and `cc-round`, at two focal points, empty), `card:has(.card-link)` (the media inside, as a banner, a strip and a full bleed × rest, hover, press, selected), `list-item:has(.list-link)` (D108), shell (with and without `cc-top`, wide and narrow, the tab bar's mark on its top), crumbs, outline, skip-link (D80). `.button.cc-block` and the dashed tag edge are instance settings, shown on a screen. Screens: one settings card in each product, wide and light, phone and dark; a Grove page of three scopes, one at night, over a flat conversation with everything a message carries and a bubble one; the flat conversation on a phone in Almanac at night; the shell in two products, wide across the top in Quarry, a phone's tab bar in Almanac at night; and a page of events in Almanac: covered cards with a banner, a full bleed and the media inside, a strip, covered rows, a card of choices (a mixed parent, a radio group), a dashed draft tag and a block button. Regenerated 2026-11-24: first an inventory (one page, three sections, every layer from the scripts' own runs, every name and text in the scripts, no comment, annotation or prototype link, nothing published), then the 31 new variables as a delta and all four component parts in full from the scripts; nothing in the four sections is patched by hand. The file's variables match the generator's by the checksum of all 2,666 values (`9b3e63c2`), and its sections the scripts' by the inventory: 46 components, 469 variants, 2,504 layers with every name, text, description and property. Screenshots of the new components and the changed screens were looked at, and icons, drawn off center since the first round, are fixed. The text styles' case and tracking (core's: the label and eyebrow uppercase, 8%, headings −1%) were in the file and not in the generator; it writes the same values now, and the styles were not written again. The suite, merged with D112 and D113 (2026-11-24): contract ok, Chromium 18/18, WebKit 17/18 with only the `perf.js` timing missed (first settle a median 1,622ms against 1,500ms on a busy PC, 0 of 5,000 blocks off; `settle.js` untouched). `tests/contract.js` checks every example layer and every scope is a mode, each mode's colors are the contract's own for that layer or scope, every alias resolves, each script parses and fits the 50,000 characters an agent's Figma tool takes, the variables parts write every collection once, every variable the components bind and every role they paint is generated, and the component parts run in order against the stand-in. Not carried: a product's own case and tracking; a mark on a wrapped title's first line; a plain list's hairlines; a skeleton's shimmer; the shell's middle width and its open menu tray; the cover's raised controls and focus ring, and a focal point that follows a resize (a crop is made at one size); a choice's hover, touch area and wrapped label; a conversation's rounding, italics and motion. **Left, of what the first app's design on Trellis uses and core ships:** the `.cc-dense` context (a dense list, card, member tile and toolbar), the mono family (`.t-mono`) and an icon set (a plus stands for any icon) |

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
| Internal names out of the public repository | done | | Products and clients are named by role (the desktop tool, the community app, the planning app, the membership app, the brand site); the scopes study is Grove, with the studio, the lodge and the lantern room (`experiments/scopes/grove.css`). `contract.js` and both engines' matrices pass on it. |

## Keeping this file

A build session updates the line when an item's state changes, in the same commit as the work where it can, and updates the suite line after a full run. It names items and never people, clients or anything internal.
