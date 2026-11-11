# Status

Where each planned piece of Trellis stands. One line per item: its state, the commit that last changed it, and the test result that backs it. The plan itself lives outside this repository; this file mirrors its state for anyone, or any agent, reading the code alone. The [changelog](CHANGELOG.md) cites the same items by name.

**Updated 2026-11-11, at `b60f874`.** Version 0.8.0 plus unreleased changes.

States: **idea** (named, not started) · **planning** (its condition is written) · **underway** · **done** (its condition holds and the evidence is recorded) · **decision** (waiting on the owner; not for a build session to implement).

**The suite, last full run.** `contract.js` ok. Chromium 14/14. WebKit 13/14 on the development laptop, where `perf.js` missed its timing budgets on a busy machine, and all green in CI at CI's scale. `align.js` 0 off in 17 runs, `pixel.js` 0 of 60 card edges off, `math.js` 320 checks ok in both engines, `perf.js` 0 of 5,000 blocks off their lines.

## Before the first app

Everything here lands before the first app pins a version.

| Item | State | Commit | Evidence |
|---|---|---|---|
| Report what is already applied | done | `5eec8ef` | The v0.7 suite and the 0.8.0 suite match: same counts, 0 off. |
| Its own repository | underway | `5bdc537` | Public, CI green, Pages serves the specimen, installs by git address. Waiting on the old location becoming a pointer, and on a decision about the two-commit history. |
| MIT license | done | `5bdc537` | `LICENSE`; `contract.js` checks it. |
| Rename to Trellis | underway | `5bdc537` | Layers, package, global, headers and tests renamed; 0.8.0 lists each as breaking. Waiting on the private product layers' side of the rename landing. |
| Neutral public specimen | done | `5eec8ef` | No product switcher, no web fonts; two example layers in the matrix; one outside layer by address. |
| Tests in CI | done | `5bdc537` | Every push and pull request, Chromium and WebKit. |
| Package shape | done | `5bdc537` | A scratch project installed it by git address with no token. |
| Namespace the cascade layers | done | `5bdc537` | `layers.js`, both engines; `contract.js` fails on a layer outside `trellis`. |
| One runtime file | done | `5bdc537` | `settle.js` sets the device pixel ratio and fit width itself. |
| Prose context | done | `5bdc537` | `align.js`: 0 of 90 prose blocks off (89 in WebKit). |
| Post type layouts | done | `5bdc537` | `layout.js`, both engines, wide and phone. |
| Wave 1 primitives | done | `5bdc537` | `layout.js` checks inputs on touch and opens the modal and the sheet. |
| Three rule conflicts | done | `5bdc537` | Gap utilities reach clusters only; rule 5 and the cluster comment say what they should. |
| Settle performance test | done | `5bdc537` | `perf.js` in CI: inside its budgets, 0 of 5,000 off. |
| Version contract | done | `5bdc537` | Changelog from 0.2.0; the README's Public API, checked by `contract.js`. |
| React contract | done | `5bdc537` | `REACT.md`. |
| Split card padding | done | `73d2025` | `layout.js` checks the default, each knob alone and the shorthand. |
| Token source | done | `4cd7cf8` | `contract.js` fails on a stale `core.css`; the specimen renders identically before and after. |
| Math module | done | `b60f874` | `tests/math.js`: 320 checks, both engines; `contract.js` checks its seed and worked examples. |
| Five ways to meet a line | decision | | |
| Cap on the cell | decision | | |
| Perf on a quiet laptop | idea | | Rerun `perf.js webkit` with nothing else running. |
| Padding clears the corner | idea | | A floor on card padding from its radius. |

## Before the second app

| Item | State | Commit | Evidence |
|---|---|---|---|
| Tailwind coexistence spike | idea | | `layers.js` proves the order against the shape of Tailwind's layers, not Tailwind itself. |
| Floats that follow and close | idea | | |
| Density at scale | idea | | |
| Theme name mapping | idea | | |
| Person colors | decision | | |

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
| Native or web, per surface | decision |

## Release

The repository is public from the start. This is the release, and it waits until two apps run on Trellis.

| Item | State |
|---|---|
| Possibilities demo | idea |
| Lint rules | idea |
| Contributing guide | idea |
| About page | idea |
| First release | idea |

## Working together

| Item | State | Commit | Evidence |
|---|---|---|---|
| Connect the build session | planning | | |
| Status file in the repository | done | this commit | This file. |
| Review the workflow | idea | | |

## Keeping this file

A build session updates the line when an item's state changes, in the same commit as the work where it can, and updates the suite line after a full run. It names items and never people, clients or anything internal.
