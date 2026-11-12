# Status

Where each planned piece of Trellis stands. One line per item: its state, the commit that last changed it, and the test result that backs it. The plan itself lives outside this repository; this file mirrors its state for anyone, or any agent, reading the code alone. The [changelog](CHANGELOG.md) cites the same items by name.

**Updated 2026-11-11.** Version 0.9.0.

States: **idea** (named, not started) · **planning** (its condition is written) · **underway** · **done** (its condition holds and the evidence is recorded) · **integrated** (the owner has confirmed it) · **decided** (the owner has chosen; the work that follows is its own item).

**The suite, last full run.** `contract.js` ok. Chromium 14/14 and WebKit 14/14 on the development laptop, and green in CI. `align.js` 0 off in 17 runs, `pixel.js` 0 of 60 card edges off, `math.js` 320 checks ok in both engines, `perf.js` 0 of 5,000 blocks off their lines and inside its laptop budgets (first settle 1,219ms in WebKit). Earlier the same day, with the laptop busy, `perf.js` missed those budgets; the timings follow the machine's load.

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
| Apply the cap on the cell | underway | `bcc9438` | The cap is in the token source, the math module, core and rule 19. The test at the largest accessibility size waits on a decision about controls. |
| Read the cell from a probe | done | (this commit) | WebKit at 312% text now reports the cell Chromium does (18 wide, 15.09 on a phone); suite at baseline. |
| Controls past the cap | idea | | Above the cap a control grows to fit its label, in whole cells. |
| Perf on a quiet laptop | idea | | Rerun `perf.js webkit` with nothing else running. |
| Padding clears the corner | idea | | A floor on card padding from its radius. |
| Private files off the site | idea | | Product layers kept where no public site serves them. |
| Keyboard reach for scrollers | idea | | A rail, a board and a code sample in prose scroll, and a keyboard cannot reach them unless the page adds a tab stop. |

## Before the second app

| Item | State | Commit | Evidence |
|---|---|---|---|
| Tailwind coexistence spike | idea | | `layers.js` proves the order against the shape of Tailwind's layers, not Tailwind itself. |
| Floats that follow and close | idea | | |
| Density at scale | idea | | |
| Theme name mapping | idea | | |
| Person colors | decided | | No change for now. |

## Knowledge base

One chapter each. Rules, decisions and primitives will carry stable IDs that the tests, the changelog and commit notes cite.

| Item | State |
|---|---|
| Start Here | idea |
| The Seed | idea |
| Rules | idea |
| Decisions | idea |
| Anatomy | idea |
| Type | idea |
| Primitives | idea |
| Color and Theme | idea |
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
| Mycelium vines | idea |

## Kit

| Item | State |
|---|---|
| Review Outlines and mentions | idea |
| Fold | idea |
| Stacked surfaces | idea |
| Interaction presets | idea |
| Component and collection contract | idea |
| Navigation templates | idea |
| Icons | idea |
| Right-sized images | idea |
| Calendar standards | idea |
| Specimen as knob editor | idea |

## Platforms

| Item | State |
|---|---|
| Platform layer | idea |
| Web view host | idea |
| React Native theme | idea |
| Hybrid seam test | idea |
| Forced colors fallback | idea |
| Write down the surface default | idea |
| Native or web, per surface | decided |

## Release

The repository is public from the start. This is the release, and it waits until two apps run on Trellis.

| Item | State |
|---|---|
| Possibilities demo | idea |
| Lint rules | idea |
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
