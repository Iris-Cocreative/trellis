# Figma: what it can't express

Code is the source, and the Figma file is generated from it (the Figma conventions, in [STATUS](../../STATUS.md)). This page is the list a designer needs before working in that file: what Trellis does that a Figma file cannot hold, what the file holds instead, and who keeps the two together. It is written before anyone designs in the file, so that nobody learns it from a build that doesn't match.

The variables come from `tools/figma-variables.js`, which reads `tokens.json` through `math.js`, the same arithmetic `core.css` does. Run it again whenever the tokens change; never edit a variable in Figma by hand.

## What carries over

- **Every token, named as in the code.** `sp-1`, `size-control-lg`, `r-1h`, `text-secondary`, each with its code syntax set to `var(--…)`, so a handoff reads in the code's words.
- **Two screens as modes.** Space and Type have a Phone mode (a 393pt screen, the cell 9.8125) and a Wide mode (1440pt, the cell 12). Color has Light and Dark.
- **Auto layout bound to the counts.** Gaps and padding bind to the space variables, corners to the radius variables, heights to the control sizes.
- **Type roles as text styles,** their size and line height bound to the Type variables, trimmed to the capitals and the baseline (Figma's vertical trim: cap height to baseline).
- **Components named by their class chains:** `button icon-button cc-ghost cc-sm` is a component set `button` with properties for the modifiers, so the name a designer picks is the class a builder writes.

## What it can't, and what stands in

| Trellis does | Figma can't, because | In the file |
|---|---|---|
| **Type follows its space.** A role's size is a straight line between its narrow and wide ends, read from its container's width. | A variable is one number per mode, with no arithmetic, and a frame does not know its width. | Two samples, Phone and Wide. A card's type in a narrow column is the screen's, not the column's: mark it, and the code will be smaller there. |
| **The cell follows the screen** and the reader's text size, up to a cap, and the fit makes whole cells span a fitted screen. | No variable follows a width, and no text-size setting exists. | The cell at two screens. A Large text mode (the 312% case) can be added; until then, nobody checks it in Figma. |
| **Everything rounds to whole cells.** A block's height rounds up so what follows starts on a line; a control is never shorter than its own type; a wrapped label hangs. | Auto layout hugs its contents to any height. | The designer snaps by hand: a fixed height in cells where a box must keep the rhythm, and a layout grid of the cell to check against. The code will correct a box that hugs to 61pt; the file won't show it. |
| **Headlines stand on a line.** H1 to H3 have whole-cell line heights and the last baseline on a cell line. | Expressible as a number, not as the rule. | The generated line height already stands; a designer who changes a size must regenerate, not type a new one. |
| **Color is derived.** Nine seeds follow from the accent; the dark theme lifts each; ink on a fill is chosen by contrast. | Variables alias, but don't compute: there is no relative color, no `color-mix()`, no `light-dark()`. | Every role resolved, in both modes. Changing the accent in Figma changes only the accent: change it in the token file and regenerate. |
| **One state layer.** Hover, press and selected mix a control's own ink into its fill by a share. | No mix. | A component variant per state, its fill precomputed. Hover is prototype-only. |
| **Depth is read from nesting.** A card in a card is the next ground and its corner is concentric. | A component doesn't know what it is inside. | A `level` property (1, 2, 3) on surfaces; the designer sets it. Corners per level are precomputed. |
| **Context changes variables.** `.cc-dense`, a compact product's density knobs, a container that turns a column into a tab bar. | No inheritance of variables through a subtree, no container queries. | Variants for each context that changes a measure (dense, compact) and for the shell at each width; a product becomes a mode of a Product collection when the second one is generated. |
| **An edge is a plane.** A card's edge is drawn on its grid line's pixels, one line wide, stepping out a cell. | A stroke is inside, outside or centered on a box, at any position. | Strokes inside, on boxes placed on the grid. The step out is drawn by placing the box a cell wider. Pixel precision is the code's. |
| **Floats** sit in the top layer, are placed by their anchor, flip at the screen's edge and close when it scrolls away. | Overlays exist only in prototypes, placed by hand. | A float is drawn beside its anchor where it would open, and the flip is not shown. |
| **Touch targets.** On touch every control's hit area is 44pt, whatever it draws. | Not drawn. | Annotated once, in the file's cover notes; nobody needs to draw it per control. |
| **Motion.** Durations and easings are tokens; the fade, the press, the trays. | Variables hold no durations; prototype transitions are set per connection. | The durations are listed as notes; a prototype sets them by hand, and is not the spec. |
| **System fonts.** Core's default is the platform's sans. | A file needs a named family. | Inter stands in for the sans, Georgia for the serif. A product with its own fonts names them in its layer, and its mode carries them. |
| **Forced colors and reduced motion.** | Not expressible. | The code's alone. |

## Who keeps them together

The file follows the code, one way. A change a designer makes in Figma is a proposal: it reaches the code as a change to a token, a knob or a primitive, through the same review as any other, and then the file is generated again. Where the two disagree, the code is right and the file is stale.
