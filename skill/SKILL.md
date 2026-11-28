---
name: trellis
description: Build, restyle or mock up any interface in a project that uses Trellis (it loads Trellis's core.css, has a vendor/trellis folder, a data-product attribute on <html>, or a CLAUDE.md that says it is a Trellis project). Use before writing or changing ANY CSS, markup, component or HTML mockup there, even when the request doesn't mention Trellis ("add a panel", "tweak the toolbar", "mock up a settings page"). Also for starting a new project on Trellis, for moving an existing site or app onto Trellis (see ADOPT.md), and for checking one against its rules.
---

# Building on Trellis

Trellis is a CSS foundation: a cell (`--u`, 12px on a wide screen, 10px on a phone) measures all space, a ratio measures all type, and a fixed set of primitives covers the common parts. An app on Trellis writes markup from those primitives and turns knobs. It does not write its own sizes.

The reference is the Trellis README (the "Public API" section lists every class, variable and knob). Read from the project's pinned copy if it has one; otherwise the repository, github.com/Iris-Cocreative/trellis, which often sits beside the project as `../trellis`.

## Before you write a class

Find the need here first. If it is here, use it and write no CSS for it.

| You need | Use |
|---|---|
| A page with navigation, main, a side panel | `.shell` > `.shell-grid` > `.shell-nav`, `.shell-main`, `.shell-aside`, `.shell-foot`; `.cc-top` for a top bar. No aside, no element: its column goes with it, so never `--shell-aside-w: 0px`. A translucent bar sets `--shell-nav-bg` (at least 85% of `--bg` or `--bg-raised`) and `--shell-nav-blur` on `.shell-nav`. A `.shell-brand` in a side column leaves the phone's tab bar by itself |
| Things one above another, or in a wrapping row | `.stack` (`--stack-gap`), `.cluster` (`--cluster-gap`) |
| Columns | `.cols` (`--cols`), `.split` (`--split-a`, `--split-b`), `.grid` (`--grid-min`) |
| A sideways scroller, lanes | `.rail`, `.board` (give each `tabindex="0"`, a role and a label) |
| A panel, a box, a tile | `.card` (`--card-pad`); nested cards step their ground by themselves |
| Rows: sessions, files, members, results | `.list` > `.list-item` > `.list-body`, `.list-end`; `.cc-group` for rows sharing one surface; `.cc-dense` for tight rows; a dot, an icon or a small face beside the first line goes in a `.list-mark` (`span.list-mark.t-sm` beside a `.t-sm` line); a row that is one line and its controls sets `--list-align: center` on the list, with `.cap-center` on its words. Never `align-items` on a row |
| A button, an icon button | `.button`; `.button.icon-button` for an icon alone, never `.icon-button` by itself: `<button class="button icon-button cc-ghost cc-sm" aria-label="…">`; `.cc-primary`, `.cc-ghost`; destructive is `.cc-alert`, confirm `.cc-ok`; `.cc-outline` on any of those or the accent takes the fill away (a button in another color: `--btn-color` with `.cc-outline`, or `--btn-bg`, `--btn-ink` and `--btn-border`); `.cc-sm`, `.cc-md`, `.cc-lg` |
| A text field, select, textarea, search box | `.input` inside `.field` with `.field-label`, `.field-hint`; `.cc-sm`, `.cc-lg` |
| A unit, an icon, a show-password or clear button in a field | `div.input.cc-slots` > (`svg.icon`, `span.input-unit[aria-hidden]` or `button.button.icon-button.cc-ghost[aria-label]`) + `input.input-control` + the same at the end; sizes go on the box (`.input.cc-slots.cc-sm`). A select takes a start slot only, a textarea none (that is `.composer`). Never an icon placed over an `.input`, and never a box of your own round a bare input |
| A checkbox, a radio, a check beside a row's text | `label.choice` > a native `input type="checkbox"` or `"radio"` + `.choice-label` (`.cc-sm`, `.cc-lg`); the input is the box, so never hide it or draw one of your own (a `.card-choice` whose card shows the choice itself may make its input `.u-sr-only`). Mixed is `input.indeterminate = true` from script (a parent whose children are partly done); invalid is `aria-invalid="true"`. A box with no words: `label.choice` > `input[aria-label]`. Words that may wrap: `.choice-label.cap-center`. A task list in `.prose` needs nothing |
| An icon | `svg.icon.cc-phosphor[aria-hidden="true"]` > `<use href="#ph-…"/>`, from a sprite of Phosphor's raw drawings in the app's own markup (its MIT notice with it); `--icon-size`, `--icon-weight` (8 thin, 12 light, 16 regular), `--icon-color` (a role), `.icon-tone` with `--icon-tone`; `.cc-mirror` on one that points along the line. An icon package's SVG: the same classes. A stroke set of your own is `.icon` alone (`--icon-stroke`), a raster `img.icon`. Alone and meaning something: `role="img" aria-label`. Never an icon font, and never a size or color of your own on the `svg`. Adding or drawing one, and native sizes: `ICONS.md` beside this file |
| On or off | `.switch` (the same archetype, with a track; `aria-checked="mixed"` for a selection that differs); in a menu row, the row is `button.options-card-item[role=menuitemcheckbox][aria-checked]` and the switch an empty `<span class="switch" aria-hidden="true">` at its end, with no script to copy the state |
| A value along a line (a slider) | `input.range`; `.cc-zone` to ink a stretch between two values |
| One of several (a filter, a view switch) | `.tabs.cc-seg` > `.tab[aria-selected]` (or `role="radio"` tabs with `aria-checked` in a `role="radiogroup"`); plain `.tabs` for tabs |
| A label, a status, a chip | `.tag` (kinds `.cc-ok`, `.cc-warn`, `.cc-alert`…; no kind, `.cc-quiet`; `.cc-solid`, `.cc-outline`); a color per value is `style="--tag-color: var(--…)"`, never a class that sets `background` |
| A status light, a count | `.dot` (`--dot-color`, `--dot-size`; `.cc-ring` for a state not yet reached, drawn as a ring), `.badge`; a count on an icon button is a `.badge.cc-corner[aria-hidden="true"]` inside it, and the button's `aria-label` says the count |
| A step of a process (idea, planned, underway, done…) | `.dot.cc-stage-1` … `.cc-stage-7`, `.tag.cc-stage-n`; words in the stage's color take `--stage-n-ink`, a wash `--stage-n-tint`, a fill `--stage-n`. The product layer sets `--seed-stage-1` … `-7`, pale colors included; map your status names to the numbers in markup. Never keep a status color list of your own |
| A color core has no seed for (a brand gold, an axis, an alliance) | name it in the product layer, `--seed-own-gold: #c09642`, as many as the product has. Use it by `--seed: var(--seed-own-gold)` on a `.tag.cc-seed`, a `.dot.cc-seed` or, for a part of your own, anything with `.u-seed`; that element (and what is in it) has `--seeded` (a fill), `--seeded-ink` (words, a ring), `--seeded-tint`, and `--seeded-solid` with `--seeded-solid-ink` (a fill and its label), right in both themes. A button takes the last two in its `--btn-*` variables, on `:not(:disabled, [aria-disabled="true"])`. Never a hand-mixed `oklch(from var(--kind-…) …)`, and never a light and a dark copy of a color |
| A menu, a popover, a tooltip | `.float.options-card` > `.options-card-item`; `.float.tooltip`. Always a popover: `popover="manual"` and `Trellis.float.open(float, anchor)` from `float.js` (it places, flips, follows and closes it), or `.cc-anchor` with a `popovertarget` button. Never `position` or `z-index` of your own |
| A dialog, a drawer, a bottom sheet | `dialog.modal` > `.modal-inner` > `.modal-header`, `.modal-body`, `.modal-footer`; `.cc-tray` with a side; a step counter goes above the title, not beside it. Open with `showModal()` |
| A person or group | `.avatar`, `.member-tile` (`.cc-row`; words on a tall avatar's middle: `align-self: center` on the body); a photo is `img.avatar`, or with an `.avatar-dot` a `.media.cc-round` inside the `.avatar` |
| A whole card or row that opens something | the title is an `a.card-link` (a row's `a.list-link`): it covers the card, and the card's own buttons, tags and fields stay above it with their own clicks. Never an `<a>` round the card, never a click handler on it |
| A whole card that is a choice | the card's title is a `label.choice.card-choice` > `input type="radio"` (or `"checkbox"`) + `.choice-label.cap-center`, the cards in a `fieldset` or a `role="radiogroup"` with a label, the description under it with an `id` in the input's `aria-describedby`; the card's fields, buttons and links go beside the label, never in it. Its lit look is `--card-choice-edge`, `--card-choice-fill`, `--card-choice-glow` on the label. Never `role="radio"` on a card, and never a `.card-link` as well: a card is one or the other |
| An image: a cover, a banner, a thumbnail, a photo | `.media` > `img` (with `alt`, `loading="lazy"`), sized in cells (`--media-w`, `--media-h`), filled by cover at `--media-focus` (`50% 25%` keeps a face); as a card's own child `.cc-bleed` (a banner), `.cc-bleed-start` / `-end` (a strip), `.cc-fill` (the whole ground, under `--media-scrim`); `.cc-round` for a face. Never `background-image` for a picture |
| Messages | `.chat-item` (`.cc-own`, `.cc-cont`, `.cc-system`); put the typed text straight in `.chat-item-bubble`: it keeps its line breaks, so never `white-space` of your own; rendered Markdown is a `.prose` in it. A day break is `.chat-divider`. A bubble is a faint ground with no edge (D122), yours a wash of the accent: never a solid accent bubble, which reads as a primary button. Its look is product knobs (`--chat-shape`, `--chat-bubble-pad`, `--chat-bubble-wash`, `--chat-own-wash`, `--chat-bubble-bg`, `--chat-own-bg`, `--chat-own-ink`, `--chat-bubble-edge`), never a `border-radius` or `background` of your own |
| Rendered Markdown or editor content | `.prose` on the wrapper, bare tags inside |
| Loading | `.skeleton` |
| Text | `.t-h1`…`.t-h6`, `.t-xl`, `.t-lg`, `.t-body`, `.t-sm`, `.t-xs`, `.t-label`, `.t-eyebrow`; `.u-text-secondary`; `.u-truncate` for one line, `.u-clamp` for several (`--lines`, two unless set). Never `-webkit-line-clamp` or `overflow: hidden` on text: it cuts the descenders |
| Hover, press and selected on a control of your own | `.u-state` with `--state-fill` and `--state-ink` |

A variant is a `cc-*` modifier, and a modifier needs its base beside it: `.icon-button` and `cc-*` alone draw nothing (`.cc-dense` and the scrollbar modifiers, which core uses as contexts, are the exceptions). A one-off adjustment sets the primitive's own variable, on the primitive, in a context: `.my-toolbar .button { --btn-h: var(--size-control-sm); }`. Name the primitive in the selector, or give its element a class of your own (`<span class="dot my-light">` with `.my-light { --dot-size: var(--sp-1); }`). Set on the ancestor alone (`.my-toolbar { --btn-h: … }`) it does nothing: a primitive declares its variables on its own element, and that beats what it inherits. Only the layout gaps (`--stack-gap`, `--cluster-gap`) are read from an ancestor.

A class of your own on a primitive's element may carry two things: the primitive's variables, and the primitive's place in its parent (`margin`, `flex`, `order`, `align-self`, `grid-area`, `position` and its insets, `z-index`), or hiding it (`display: none`). Nothing the primitive draws: `.my-tb { width: 28px; border-radius: 7px }` on `class="button icon-button my-tb"` restyles the button as surely as `.my-bar .icon-button { width: 28px }` does, and `tools/check.js` counts both (the second as `restyled-own`). A primitive's variables are listed in the README's Public API; in a pinned copy without the README they are the `--name:` lines that open its rule in `core.css`.

A compact app does not set the same variables in every context: its product layer sets the density knobs once (`--density-control-h`, `--density-control-fs`, `--density-option-h`, `--density-option-fs`, `--density-options-pad`, `--density-seg-h`, `--density-seg-pad`), and every button, input, menu row and segmented control follows. Two cells for a control is `--density-seg-h: var(--size-control-xs); --density-seg-pad: var(--sp-q)`; a menu row two cells in small type is `--density-option-h: var(--size-control-sm); --density-option-fs: var(--fs-control-sm)`.

Never redeclare a primitive's properties (`.my-toolbar .button { height: 26px }` is the mistake this skill exists to prevent). When the property you want to change is not a variable, use the primitive as it is and record the gap (see below).

## When you do write CSS

An app's own parts (a timeline, a diff view, a canvas) are legitimate. They follow five rules.

1. **No raw values.** Every length is a token or cells; every color is a role or a `color-mix()` of roles; every font size is a type role or a `--fs-control-*` token.
2. **Space between blocks is whole cells.** Halves and quarters live inside a control only.
3. **Context changes variables, not markup or properties.**
4. **The product layer sets knobs only**: a `:root[data-product="name"]` rule in `@layer trellis.product`, in its own file, holding only variables listed in `product.template.css` and colors of its own (`--seed-own-<name>`), and any scopes after it. Colors go in as seeds (`--seed-accent`), never roles (`--accent`). A part of the page with its own look (a community, a section, a mood) is a **scope**: `data-product="part"` on its element and a `[data-product="part"]` rule of knobs in the same file; add `data-theme` for night on a day page, and for a scope that is always dark write its rule `[data-product="part"][data-theme="dark"]`, so its contrast is checked at night alone. Set only what makes it itself: what the root chose carries in, and every role follows from the scope's seeds. Never re-declare roles in a context to recolor a part.
5. **Inline styles and scripts set variables only**: `el.style.setProperty('--x', …)`, with the property that uses `--x` in the stylesheet.

What a number becomes, with the cell at 12px:

| Raw | Token |
|---|---|
| 1px line · 3px · 6px · 12px · 18px · 24px · 36px · 48px | `--line` · `--sp-q` · `--sp-h` · `--sp-1` · `--sp-1h` · `--sp-2` · `--sp-3` · `--sp-4` |
| Any other length | `calc(var(--u) * n)`, n a multiple of ¼ |
| Control heights 18 · 24 · 30 · 36 · 48 | `--size-control-xs` · `-sm` · `-md` · `-lg` · `-xl` |
| Icons 12 · 18 · 24 | `--size-icon` · `--size-icon-md` · `--size-icon-lg` |
| Corners 3 · 6 · 12 · 18 · 24 · pill | `--r-q` · `--r-h` · `--r-1` · `--r-1h` · `--r-2` · `--r-round` |
| Small type in a control | `--fs-control-xs` … `--fs-control-lg` |
| Grays, edges, fills | `--text`, `--text-secondary`, `--text-tertiary`, `--text-faint`, `--border`, `--border-subtle`, `--bg`, `--bg-raised`, `--bg-sunken` |
| Hues | `--accent`, `--ok`, `--warn`, `--alert`, `--kind-*`, `--stage-1` … `--stage-7` (with `-ink` and `-tint`); on an element with a color of the product's own, `--seeded` (with `-ink`, `-tint`, `-solid`, `-solid-ink`) |
| Time, stacking | `--dur-in`, `--dur-out`, `--ease-out`; `--z-raised`, `--z-sticky`, `--z-overlay`, `--z-float`, `--z-toast` |

A design that asks for 26px or 10.5px gets the nearest token (24px, `--fs-control-xs`). If the nearest token is truly wrong, that is a gap in Trellis: see below.

## When Trellis doesn't have it

Do not invent a near-copy of a primitive. Build the part as the app's own, by the five rules, and record the gap where the project keeps them (a `TRELLIS-LEDGER.md` beside its build doc, if it has one): what was needed, what you used instead, and whether Trellis should gain a variant, a knob or a primitive. Those entries are how Trellis grows.

## Mockups

Mock up in HTML, on the real thing: a page that loads the project's `core.css`, its product layer and `settle.js`, built from the table above. A mockup drawn in raw pixels gets copied into the build pixel by pixel. Use a design tool only when the project asks for one.

## Check your work

Where the project installs Trellis as a package:

```bash
npx trellis-check <the app's source folder>                # counts, per file
npx trellis-check <folder> --show restyled                 # list one kind
npx trellis-check <folder> --budget check.budget.json      # fails if a count rose
npx trellis-product <product layer file>                   # knobs only, and contrast
```

Where it pins a copy or sits beside the repository, the same files by path: `node <trellis>/tools/check.js …` and `node <trellis>/tools/product.js <product layer file>`, with `core.css` and `product.template.css` one folder above `tools/`. In an installed package `<trellis>` is `node_modules/@iris-cocreative/trellis`.

It also counts a modifier without its base (`--show bare-modifiers`). If the project has a budget file, run the third form before you finish: your change must not raise any count, and lowering one is part of the job. After lowering, rewrite the budget with `--write`. The product check exits 1 on a layer that sets anything but the template's knobs and colors of its own, or a knob to a number it can't check, or whose text falls under its contrast floor on any scope.

## Moving an existing site onto Trellis

Read `ADOPT.md` beside this file. It covers taking stock, sorting each part by its job, putting the brand into knobs, scopes, switching in one step, and the ledger and budget.

## Starting a project on Trellis

1. Install it pinned to a commit (`npm install github:Iris-Cocreative/trellis#<commit>`), or pin a copy: `vendor/trellis/` with `core.css`, `settle.js` (and `float.js` or `presets.js` if it uses them), `product.template.css`, `tools/check.js`, `tools/product.js` and `math.js` for the checks, and a `SOURCE.txt` naming the commit or tag.
2. Load, in order: `core.css`, the product layer, the app's CSS; then `settle.js` once. Beside Tailwind, state `@layer theme, base, trellis, components, utilities;` first, and add `@source not inline("list-item outline snap-x");` after `@import "tailwindcss"` (D110). On a Trellis surface, Tailwind lengths name cells (`p-(--sp-2)`), never its rem scale.
3. Copy `product.template.css` to the project's own product file, keep the knobs you change, put `data-product` on `<html>`.
4. Write the budget (`npx trellis-check <src> --budget check.budget.json --write`) on day one, while it is all zeros.
5. Put this in the project's `CLAUDE.md`, so every session sees it:

   > This project is built on Trellis. Before writing or changing any CSS, markup or mockup, use the `trellis` skill. Use Trellis primitives and tokens, no raw values, and run `npx trellis-check` with the budget before finishing.
