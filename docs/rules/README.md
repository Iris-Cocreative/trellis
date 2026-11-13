# Rules

A rule is a constraint the foundation keeps everywhere, with a reason, a failure it prevents and a way it is checked. This chapter is the review standard: a change that breaks a rule either fixes the change or changes the rule, through a decision.

`R1` to `R20` keep the README's numbers. `F1` to `F6` are the rules for free, flowing and moving layouts. Page shapes and IDs are in [the knowledge base's README](../README.md).

A rule is `questioned` when its reason is missing, the code does not keep it, or a test is missing for something it claims. Each questioned page says what is missing.

## Edges

| ID | Rule | Status | How it is checked |
|---|---|---|---|
| [R1](R1.md) | Edges land on lines | settled | `tests/align.js`: the top and left of every box, in both engines |
| [R2](R2.md) | Columns round to cells | settled | `tests/align.js`: the left edge of every column |
| [R3](R3.md) | A surface's edge is a plane after its coordinate | settled | `tests/pixel.js`: card edges against grid line pixels, WebKit at 3× |
| [R4](R4.md) | Draw grids in device pixels | settled | `tests/pixel.js` reads the canvas grid; the ban on gradient grids is review only |
| [R5](R5.md) | Surfaces step out (Outset) | settled | `tests/layout.js` (list rows); `tests/align.js` with `outset` |

## Text

| ID | Rule | Status | How it is checked |
|---|---|---|---|
| [R6](R6.md) | Between blocks, space is whole cells | settled | `tests/align.js`, `tests/perf.js` |
| [R7](R7.md) | Center only what differs by an even number of cells | settled | review only |
| [R8](R8.md) | Beside a control, text centers its capitals on the control; one that wraps hangs | settled | `tests/align.js` checks a wrapped one as text; `tests/layout.js` builds one |
| [R9](R9.md) | An icon centers on the cap height or the x-height | settled | review only |
| [R10](R10.md) | Marks never stretch a line | settled | review only; `tests/align.js` catches the drift a stretched line causes |
| [R11](R11.md) | Truncate sideways only | settled | review only |
| [R12](R12.md) | Overhangs are given back | withdrawn | D68: the component's choice |

## Primitives and variants

| ID | Rule | Status | How it is checked |
|---|---|---|---|
| [R13](R13.md) | One concept, one primitive | settled | review only; `tests/contract.js` lists every class |
| [R14](R14.md) | Products turn knobs | settled | `tests/contract.js` |
| [R15](R15.md) | Context changes variables, not markup | settled | review only |
| [R16](R16.md) | Floating surfaces align to their anchor; following and closing are the app's | settled | review only |
| [R17](R17.md) | Control type is fixed, and listed | settled | review only; `tests/align.js` with `ax` for the growing clause |
| [R18](R18.md) | Touch targets | settled | `tests/layout.js`, for inputs and shell links |
| [R19](R19.md) | The reader's text size wins; the cell stops at 1.5× | settled | `tests/align.js` with `ax`; `tests/math.js`; `tests/contract.js` |
| [R20](R20.md) | Every sideways scroller can be reached by keyboard | settled | `tests/align.js` (keyboard reach, every run) |

## Free, flowing and moving layouts

| ID | Rule | Status | How it is checked |
|---|---|---|---|
| [F1](F1.md) | Rest on the lattice, move off it | settled | review only |
| [F2](F2.md) | Time has a ratio too | questioned | review only; the ratio waits on Motion proportions (D70) |
| [F3](F3.md) | Free things live in layers | settled | review only |
| [F4](F4.md) | Spans, not pixels | settled | review only |
| [F5](F5.md) | Content in the field, color to the edge | settled | `tests/layout.js` (cover); `tests/align.js` sideways scroll |
| [F6](F6.md) | Scroll is a timeline | withdrawn | D71: in the plan for `.scene` |

## Review only

Several rules have no test. Until the lints in the README's Enforcement section exist (no raw values outside the token layer, every class registered, inline styles set variables only), the review checklist in `REACT.md` carries them.
