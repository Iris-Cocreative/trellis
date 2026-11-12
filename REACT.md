# The React contract

For any React app on Trellis. The foundation is CSS plus one small script, and React's job is to output its markup, not to re-implement it. The README defines the [public API](README.md#public-api); this says how a React app stays inside it.

## Installing

```bash
# By git address, pinned to a commit. There is no npm package yet.
npm install github:Iris-Cocreative/trellis#<commit>
```

```js
// The root layout. The import stays the same when this becomes a published package.
import '@iris-cocreative/trellis/core.css';
import './product.css';   // the product layer: the app's own file, copied from product.template.css
```

The package is `@iris-cocreative/trellis`, and it exports `core.css`, `settle.js` and `product.template.css`.

## The rules

1. **Primitives output exactly these class chains.** `<Card>` renders `<div class="card">`, and adds no wrapper and no style of its own. Its props map to `cc-*` modifiers, or to the variables the primitive exposes. A component that needs a new look is asking for a new variant in the foundation.
2. **`data-product` and `data-theme` go on `<html>`.** Set them on the server, so nothing flashes. Leave `data-theme` off to follow the system.
3. **Fonts are the app's job.** The foundation names families through knobs (`--font-sans`, `--font-heading`) and loads nothing. Use `next/font` or a stylesheet, and point the knobs at it.
4. **`settle.js` runs once per page, as a client effect, not per component.**
   ```jsx
   // A client component, rendered once in the root layout.
   'use client';
   import { useEffect } from 'react';
   export function TrellisRuntime() {
     useEffect(() => { import('@iris-cocreative/trellis/settle.js'); }, []);
     return null;
   }
   ```
   It watches the page for added nodes and changed text, so nothing needs to call it after a render. Importing it twice is harmless, and importing it on a server does nothing. To wait for the page to be on its lines (a test, a scroll restore), `await window.Trellis.settled()`.
5. **Inline styles set variables only.** `style={{ '--av-n': 4 }}` passes; `style={{ padding: 13 }}` fails.
6. **No Tailwind on foundation surfaces.** A surface uses the foundation or Tailwind, not both. If an app loads both while migrating, it states the [import order](README.md#adoption) first.
7. **CMS content goes in `.prose`, untouched.** `<article className="prose" dangerouslySetInnerHTML={{ __html }} />`. Don't map tags to components to style them: the point of `.prose` is that the content needs no classes. Sanitize it when it's saved; the README says what `.prose` does with what gets through.
8. **A rail or a board carries its own tab stop.** `<div className="rail" tabIndex={0} role="group" aria-label="…">`: a keyboard scrolls only what it can focus, and Safari doesn't make a scroller focusable on its own. Code and tables in `.prose` get theirs from `settle.js` (rule 20).

## Things that will catch you out

- **`settle.js` writes to the DOM.** It sets `--settle-n` and `--settle` in a text block's `style` attribute, and `data-prose-empty` on blocks in `.prose`. React won't remove what it doesn't know about, but it will replace `style` wholesale if you set a `style` prop on that same element with a new object. Use class names on text blocks where you can. If it can't be helped, `Trellis.settled()` and the watcher put it right on the next frame.
- **`.prose` and `.shell` are containers.** `container-type: inline-size` means their width can't come from their content, so one in a flex row with no width collapses to nothing. Give it a width, `flex: 1`, or a grid track.
- **`.modal` is a `<dialog>`.** Open it with `ref.current.showModal()`, in an effect or a handler. Rendering `<dialog open>` skips the top layer, the focus trap and the inert page. Closing on a backdrop click is yours: `onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close(); }}`.
- **Server and client must agree on the class chain,** which they will if rule 1 holds. Don't choose a class from `window.innerWidth`: a container query can do it, and doesn't need to know.

## The review checklist

For every pull request, until the lints exist. These are the five enforcement rules, as questions.

- [ ] **No raw values.** Is every color, size, space, radius, shadow and z-index a token, or a variable set from one?
- [ ] **Edges land on lines.** If this added a surface, did it pass `tests/align.js` in Chromium *and* WebKit, with the grid looked at?
- [ ] **Every class is registered.** Is every class here defined in `core.css` and shown in the specimen, or in the product's `/design` page? A class that isn't is a new primitive being started by accident.
- [ ] **Products turn knobs.** Does the product layer still only set variables on `:root`? Do variants and contexts only set a primitive's own variables?
- [ ] **Inline styles set variables only.** Does every `style` prop here set a custom property and nothing else?
- [ ] **Scrollers can be reached.** Does every rail, board or other region that scrolls sideways have `tabIndex={0}`, a role and a label, or something focusable inside?
