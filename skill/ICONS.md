# Icons

The companion to `SKILL.md` for anything drawn as an icon. The default set is [Phosphor](https://phosphoricons.com) ([D118](https://github.com/Iris-Cocreative/trellis/blob/main/docs/decisions/D118.md)). Trellis ships no icons and loads none: a product carries the few it uses in its own markup.

## Use one

```html
<svg class="icon cc-phosphor" aria-hidden="true"><use href="#ph-bell"/></svg>
```

| Set | With | Where |
|---|---|---|
| Size | `--icon-size`: `--size-icon-sm` (1 cell), `--size-icon` (a cell and two lines, unless set), `--size-icon-md` (1½), `--size-icon-lg` (2), or any count of cells | The icon or a context |
| Weight | `--icon-weight`, in 256ths of the icon: 8 thin, 12 light, 16 regular, and anything between | The icon, a context, or the product layer (it is a knob) |
| Color | Nothing: it is the ink around it. A role by `--icon-color: var(--ok)` | The icon or a context |
| A duotone's second shape | Nothing: a fifth of that ink. A color by `--icon-tone` | The icon or a context |
| A direction | `.cc-mirror` on one that points along the line (arrows, carets back and forward, send, sign out, an indent). Not a check, a clock, a magnifier, a plus, or media controls | The icon |
| A line for a stroke set | `--icon-stroke`, in that drawing's own units (1.5) | The icon or a context |

- **An icon that carries meaning** takes a color that reads as a line on its ground (3:1): `--text` to `--text-tertiary`, `--accent`, a status, `--stage-n-ink`, `--seeded-ink`. A kind's plain color or a stage's fill is for a duotone's second shape.
- **A name.** Beside words, or in a control that has its own name, the icon is drawn and nothing more: `aria-hidden="true"`. Alone, it is `role="img" aria-label="Unread"`. An icon button's name is the button's `aria-label`.
- **A disabled control** takes its icon's color back, and so do forced colors. A color set on the icon by a class of your own does neither: in forced colors Chromium leaves an SVG the colors its author gave it. Use `--icon-color`.
- **Inside `.input.cc-slots`** an icon's color is the box's, `--input-slot-ink`.

### Weight, and what it can't do

Phosphor publishes six weights of each icon as outlined shapes: a file per weight, filled. No variable changes the weight of those. Its repository also holds the **raw** drawings they are made from, which are strokes, and a stroke's width is a variable. So:

- **Thin, light, regular and between are one drawing** and `--icon-weight`. Of 1,512 icons, 1,501 drawn thin this way, 1,503 light and 1,506 regular match Phosphor's own file, within a pixel at 128.
- **Bold is a drawing of its own.** Phosphor moves the shapes of most icons apart to make room for it: the regular drawing at 24 matches for 697 of the 1,512. Put the bold file in the sprite as `#ph-bell-bold`; it keeps its own weight. For a simple icon (a caret, a check, a plus, a leaf) 24 on the regular drawing is the same.
- **Fill and duotone are drawings of their own,** `#ph-bell-fill` and `#ph-bell-duotone`. A duotone's outline follows `--icon-weight`; a fill has no line.
- **An outlined file works as it is** under `.cc-phosphor` (what an icon package gives you, `@phosphor-icons/react` among them: pass it `className="icon cc-phosphor"`), at the weight of that file. Its `weight` picks another drawing; `--icon-weight` does nothing to it.

### One line at every size

A weight is a share of the icon, so regular is a line of .75px at 12px and 1.5px at 24. To draw one line at every size, a smaller icon takes a higher weight:

| Size | Weight | The line, at a 12px cell |
|---|---|---|
| `--size-icon-sm` · 12 | 24, from the bold drawing unless the icon is simple | 1.13 |
| `--size-icon` · 14 | 20 | 1.09 |
| `--size-icon-md` · 18 | 16 | 1.13 |
| `--size-icon-lg` · 24 | 12 | 1.13 |

Set it where you set the size: `.my-toolbar .icon { --icon-size: var(--size-icon-sm); --icon-weight: 24; }`.

## Add a Phosphor icon

1. Find it at [phosphoricons.com](https://phosphoricons.com). Get the drawing from [`phosphor-icons/core`](https://github.com/phosphor-icons/core), `raw/<weight>/<name>.svg`, at a commit you name (this was written against `2b75f3a`). The raw files are in the repository, not in the npm package, which has the outlines.
2. Make it a symbol in one sprite, in the page or the app's shell. By hand: keep the shapes, drop the empty `<rect>` and `stroke-width="16"`; a dot (a filled circle) becomes 8 smaller in radius with `stroke="currentColor"`, so it grows with the line; a duotone's `opacity="0.2"` becomes `class="icon-tone"`. Or with Node:

```js
// node sprite.js <a checkout of phosphor-icons/core> bell plant plant:bold plant:fill plant:duotone
const fs = require('fs'), [dir, ...names] = process.argv.slice(2);
for (const n of names) {
  const [name, weight = 'regular'] = n.split(':'), own = weight === 'regular' || weight === 'duotone';
  let s = fs.readFileSync(`${dir}/raw/${weight}/${name}${weight === 'regular' ? '' : '-' + weight}.svg`, 'utf8')
    .replace(/<\/?svg[^>]*>|<rect width="256" height="256" fill="none"\/>/g, '')
    .replace(/ stroke-line(cap|join)="round"/g, '');                        // .icon's own
  if (own) s = s.replace(/ stroke-width="16"/g, '')                         // follows --icon-weight
    .replace(/(<circle cx="[^"]*" cy="[^"]*" )r="([\d.]+)"\/>/g, (m, c, r) => `${c}r="${r - 8}" stroke="currentColor"/>`)   // a dot
    .replace(/<(\w+) ([^>]*?) opacity="0.2"/g, '<$1 class="icon-tone" $2');   // a duotone's second shape
  console.log(`<symbol id="ph-${name}${weight === 'regular' ? '' : '-' + weight}" viewBox="0 0 256 256">${s.trim()}</symbol>`);
}
```

3. The sprite is `<svg hidden aria-hidden="true">…</svg>`, in the same document as the icons. A sprite in a file of its own (`href="icons.svg#ph-bell"`) is a request, and inherits size, color and weight, but the page's `.icon-tone` doesn't reach it: leave `opacity="0.2"` there.
4. **Keep the notice.** Phosphor is under the MIT license, which asks for its notice in every copy. Put it in a comment above the sprite:

```
Icons: Phosphor, github.com/phosphor-icons/core

MIT License

Copyright (c) 2023 Phosphor Icons

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Draw your own

**To sit among Phosphor's,** draw on its grid and use `.cc-phosphor`, so the icon takes the same weight and color.

- A 256-unit square. Strokes 16 wide, round caps and joins, no fill, `stroke="currentColor"` and no `stroke-width` on the shape. Keep the stroke's outer edge inside 16 to 240.
- The common shapes, so a set looks like one: a circle of radius 96 on the middle, a square 176 across (40 to 216), a wide one 192 by 160, a tall one 160 by 192, a corner of 8, angles of 45 degrees.
- Two strokes that run side by side are at least 32 between centers, or they close up when small.
- A dot is a circle of radius 4 with the stroke. A filled shape has `stroke="none"` and no `fill`.
- A name for what it shows, in your own prefix: `#my-seed-jar`, never `#ph-…`.

**For a set of your own,** `.icon` alone draws strokes on any square, at `--icon-stroke` in that square's units. A filled or two-toned shape says so on itself: `<g fill="currentColor" stroke="none">`, `class="icon-tone"`. A whole set of filled drawings takes `.cc-phosphor`, which is only: filled unless a shape says otherwise.

**Optical variants.** One drawing scaled from 12 to 48 is too heavy at one end and too thin at the other, and detail closes up. Change the weight first (the table above). When the detail itself is too much, draw it again for the size:

| For | Draw on | Line | Detail |
|---|---|---|---|
| 1 cell, and a cell and two lines | 14 units, strokes on half units | 1.5 | The outline alone; one gap at least 2 units wide |
| 1½ and 2 cells | 24 units | 1.5 | Inner marks, if each has 2 units round it |
| 2½ cells and more | 48 units | 1.5 to 2 | A second tone, texture |

Give them one name and the size each is for, `#my-seed-14`, `#my-seed-24`, `#my-seed-48`, and write the one for the size where you use it. CSS can't choose by size: a `use` names one drawing, and the size in a place is yours and known. Draw the smallest first; what it needs is what the icon is.

**Check it** beside a line of text at the size it is for, in both themes, at 1 and 2 device pixels to a CSS pixel, with the text at 312%, and mirrored if it points.

## A raster icon

For a picture with its own colors: an app's icon, a logo from outside, an emoji image, a small photo of a thing. A shape in one color should be an SVG, since a raster can't take the ink.

```html
<img class="icon" src="leaf.png" width="108" height="108" alt="">
```

- It is sized by `--icon-size` as any icon is, fitted whole and never stretched, and its corners are its own. `width` and `height` are the file's, so nothing moves while it loads.
- Export at three times the largest it is drawn. The cell is 12px on a wide screen and 18 at the reader's largest text, so a two-cell icon is at most 36: 108px square. A transparent ground, PNG or WebP.
- It doesn't change with the theme or in forced colors. One that disappears on a dark ground gets its own ground in the drawing. A second file for night is yours to swap on `data-theme`; `prefers-color-scheme` in a `picture` can't see that attribute.
- `alt=""` beside its name, `alt="Seed Library"` alone.
- A face is `img.avatar`; a photo in a frame is `.media`.

## Native apps

A native app takes the same count of cells in points or dp, at its own cell, and the platform's own set where that is right. Sizes at a 12pt cell; a phone 393pt wide has a cell of 9.81 (the README's math, in plain words).

| Trellis | Box at 12 | Box at 9.81 | Phosphor weight for one line | Material Symbols | SF Symbols, to start from |
|---|---|---|---|---|---|
| `--size-icon-sm` · 1 cell | 12 | 9.8 | 24 (bold) | 12dp box, `opsz` 20, `wght` 550 | 11pt medium scale, bold |
| `--size-icon` · 1 cell, 2 lines | 14 | 11.8 | 20 | 14dp, `opsz` 20, `wght` 430 | 13pt medium, semibold |
| `--size-icon-md` · 1½ cells | 18 | 14.7 | 16 (regular) | 18dp, `opsz` 20, `wght` 340 | 17pt medium, regular |
| `--size-icon-lg` · 2 cells | 24 | 19.6 | 12 (light) | 24dp, `opsz` 24, `wght` 220 | 17pt large, light |

And by weight, at the same size:

| Phosphor | Units of 256 | Material `wght` at `opsz` 20 | at `opsz` 24 | SF weight |
|---|---|---|---|---|
| Thin | 8 | 180 | 120 | thin |
| Light | 12 | 270 | 220 | light |
| Regular | 16 | 340 | 300 | regular |
| Bold | 24 | 550 | 490 | bold |
| Fill | | `FILL` 1 | `FILL` 1 | the `.fill` variant |
| Duotone | | two layers of your own | | hierarchical rendering |

- **Material Symbols** are drawn in a box, as Trellis icons are, so the box is the size. Its `wght` column is measured: the line of its `remove` symbol, at each published weight, against Phosphor's width, rounded to ten. Its regular, 400, is heavier than Phosphor's (2dp at 24, where Phosphor's is 1.5). `opsz` goes from 20 to 48; under 20 use 20. Its own sharp, outlined and rounded families differ in corners; rounded is nearest.
- **SF Symbols** have no box: a point size sets them against San Francisco's capitals, in three scales, and they center on the capitals by themselves, as rule 9 asks. The column is worked out, not measured on a device: Apple says a circled symbol at the small scale spans the capital height, and that small and large are about 20% under and 30% over medium, so a box of *n* is about .92*n* points at medium and .71*n* at large. Check it on a device, and where the layout needs the box, give the image a frame of it. The weights are matched by name.
- **Phosphor itself** is on both platforms: `@phosphor-icons/flutter`, `phosphor-icons/swift`, and the raw drawings as vector drawables or custom symbols. Use it where a product's own face matters more than the platform's.
- SF Symbols may not be used outside Apple's platforms, or in an app's icon, logo or trademark (Apple's terms). Material Symbols are Apache 2.0. Phosphor is MIT. So a web page never uses an SF symbol.

## Not yet

Animated icons. Figma's set (`docs/figma/README.md`).
