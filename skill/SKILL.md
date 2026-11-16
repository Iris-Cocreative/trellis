---
name: trellis
description: Build, restyle or mock up any interface in a project that uses Trellis (it loads Trellis's core.css, has a vendor/trellis folder, a data-product attribute on <html>, or a CLAUDE.md that says it is a Trellis project). Use before writing or changing ANY CSS, markup, component or HTML mockup there, even when the request doesn't mention Trellis ("add a panel", "tweak the toolbar", "mock up a settings page"). Also for starting a new project on Trellis and for checking one against its rules.
---

# Building on Trellis

Trellis is a CSS foundation: a cell (`--u`, 12px on a wide screen, 10px on a phone) measures all space, a ratio measures all type, and a fixed set of primitives covers the common parts. An app on Trellis writes markup from those primitives and turns knobs. It does not write its own sizes.

The reference is the Trellis README (the "Public API" section lists every class, variable and knob). Read from the project's pinned copy if it has one; otherwise the repository, github.com/Iris-Cocreative/trellis, which often sits beside the project as `../trellis`.

## Before you write a class

Find the need here first. If it is here, use it and write no CSS for it.

| You need | Use |
|---|---|
| A page with navigation, main, a side panel | `.shell` > `.shell-grid` > `.shell-nav`, `.shell-main`, `.shell-aside`, `.shell-foot`; `.cc-top` for a top bar |
| Things one above another, or in a wrapping row | `.stack` (`--stack-gap`), `.cluster` (`--cluster-gap`) |
| Columns | `.cols` (`--cols`), `.split` (`--split-a`, `--split-b`), `.grid` (`--grid-min`) |
| A sideways scroller, lanes | `.rail`, `.board` (give each `tabindex="0"`, a role and a label) |
| A panel, a box, a tile | `.card` (`--card-pad`); nested cards step their ground by themselves |
| Rows: sessions, files, members, results | `.list` > `.list-item` > `.list-body`, `.list-end`; `.cc-group` for rows sharing one surface; `.cc-dense` for tight rows |
| A button, an icon button | `.button`; `.button.icon-button` for an icon alone, never `.icon-button` by itself: `<button class="button icon-button cc-ghost cc-sm" aria-label="…">`; `.cc-primary`, `.cc-ghost`; `.cc-sm`, `.cc-md`, `.cc-lg` |
| A text field, select, textarea, search box | `.input` inside `.field` with `.field-label`, `.field-hint`; `.cc-sm`, `.cc-lg` |
| On or off | `.switch` |
| A value along a line (a slider) | `input.range`; `.cc-zone` to ink a stretch between two values |
| One of several (a filter, a view switch) | `.tabs.cc-seg` > `.tab[aria-selected]`; plain `.tabs` for tabs |
| A label, a status, a chip | `.tag` (kinds `.cc-ok`, `.cc-warn`, `.cc-alert`…; `.cc-solid`, `.cc-outline`) |
| A status light, a count | `.dot` (`--dot-color`, `--dot-size`), `.badge` |
| A menu, a popover, a tooltip | `.float.options-card` > `.options-card-item`; `.float.tooltip`; `.cc-anchor` to place it under its opener |
| A dialog, a drawer, a bottom sheet | `dialog.modal` > `.modal-inner` > `.modal-header`, `.modal-body`, `.modal-footer`; `.cc-tray` with a side. Open with `showModal()` |
| A person or group | `.avatar`, `.member-tile` |
| Messages | `.chat-item` (`.cc-own`, `.cc-cont`, `.cc-system`) |
| Rendered Markdown or editor content | `.prose` on the wrapper, bare tags inside |
| Loading | `.skeleton` |
| Text | `.t-h1`…`.t-h6`, `.t-xl`, `.t-lg`, `.t-body`, `.t-sm`, `.t-xs`, `.t-label`, `.t-eyebrow`; `.u-text-secondary`, `.u-truncate` |
| Hover, press and selected on a control of your own | `.u-state` with `--state-fill` and `--state-ink` |

A variant is a `cc-*` modifier, and a modifier needs its base beside it: `.icon-button` and `cc-*` alone draw nothing (`.cc-dense` and the scrollbar modifiers, which core uses as contexts, are the exceptions). A one-off adjustment sets the primitive's own variable, on the primitive, in a context: `.my-toolbar .button { --btn-h: var(--size-control-sm); }`. Name the primitive in the selector, or give its element a class of your own (`<span class="dot my-light">` with `.my-light { --dot-size: var(--sp-1); }`). Set on the ancestor alone (`.my-toolbar { --btn-h: … }`) it does nothing: a primitive declares its variables on its own element, and that beats what it inherits. Only the layout gaps (`--stack-gap`, `--cluster-gap`) are read from an ancestor.

A class of your own on a primitive's element may carry two things: the primitive's variables, and the primitive's place in its parent (`margin`, `flex`, `order`, `align-self`, `grid-area`, `position` and its insets, `z-index`), or hiding it (`display: none`). Nothing the primitive draws: `.my-tb { width: 28px; border-radius: 7px }` on `class="button icon-button my-tb"` restyles the button as surely as `.my-bar .icon-button { width: 28px }` does, and `tools/check.js` counts both (the second as `restyled-own`). A primitive's variables are listed in the README's Public API; in a pinned copy without the README they are the `--name:` lines that open its rule in `core.css`.

Never redeclare a primitive's properties (`.my-toolbar .button { height: 26px }` is the mistake this skill exists to prevent). When the property you want to change is not a variable, use the primitive as it is and record the gap (see below).

## When you do write CSS

An app's own parts (a timeline, a diff view, a canvas) are legitimate. They follow five rules.

1. **No raw values.** Every length is a token or cells; every color is a role or a `color-mix()` of roles; every font size is a type role or a `--fs-control-*` token.
2. **Space between blocks is whole cells.** Halves and quarters live inside a control only.
3. **Context changes variables, not markup or properties.**
4. **The product layer sets knobs only**: one `:root[data-product="name"]` rule in `@layer trellis.product`, in its own file, holding only variables listed in `product.template.css`. Colors go in as seeds (`--seed-accent`), never roles (`--accent`).
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
| Hues | `--accent`, `--ok`, `--warn`, `--alert`, `--kind-*` |
| Time, stacking | `--dur-in`, `--dur-out`, `--ease-out`; `--z-raised`, `--z-sticky`, `--z-overlay`, `--z-float`, `--z-toast` |

A design that asks for 26px or 10.5px gets the nearest token (24px, `--fs-control-xs`). If the nearest token is truly wrong, that is a gap in Trellis: see below.

## When Trellis doesn't have it

Do not invent a near-copy of a primitive. Build the part as the app's own, by the five rules, and record the gap where the project keeps them (a `TRELLIS-LEDGER.md` beside its build doc, if it has one): what was needed, what you used instead, and whether Trellis should gain a variant, a knob or a primitive. Those entries are how Trellis grows.

## Mockups

Mock up in HTML, on the real thing: a page that loads the project's `core.css`, its product layer and `settle.js`, built from the table above. A mockup drawn in raw pixels gets copied into the build pixel by pixel. Use a design tool only when the project asks for one.

## Check your work

```bash
node <trellis>/tools/check.js <the app's source folder>              # counts, per file
node <trellis>/tools/check.js <folder> --show restyled                # list one kind
node <trellis>/tools/check.js <folder> --budget check.budget.json     # fails if a count rose
```

It also counts a modifier without its base (`--show bare-modifiers`). If the project has a budget file, run the third form before you finish: your change must not raise any count, and lowering one is part of the job. After lowering, rewrite the budget with `--write`. `node <trellis>/tests/contract.js <product layer file>` checks a product layer.

## Starting a project on Trellis

1. Pin a copy: `vendor/trellis/` with `core.css`, `settle.js` and a `SOURCE.txt` naming the commit or tag.
2. Load, in order: `core.css`, the product layer, the app's CSS; then `settle.js` once. Beside Tailwind, state `@layer theme, base, trellis, components, utilities;` first.
3. Copy `product.template.css` to the project's own product file, keep the knobs you change, put `data-product` on `<html>`.
4. Write the budget (`--budget check.budget.json --write`) on day one, while it is all zeros.
5. Put this in the project's `CLAUDE.md`, so every session sees it:

   > This project is built on Trellis. Before writing or changing any CSS, markup or mockup, use the `trellis` skill. Use Trellis primitives and tokens, no raw values, and run `tools/check.js` with the budget before finishing.
