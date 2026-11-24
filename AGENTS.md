# Agents working on or with Trellis

Trellis is a CSS foundation. Read these before you write CSS or markup for it:

- [`skill/SKILL.md`](skill/SKILL.md): how to build an interface on Trellis. Start here.
- [`skill/ADOPT.md`](skill/ADOPT.md): how to move an existing site or app onto Trellis.
- The [README's Public API](README.md#public-api): every class, variable and knob. A name that is not there is not Trellis's.
- [`docs/`](docs/README.md): the reasons. Rules (`docs/rules/`), decisions (`docs/decisions/`, one record per choice) and anatomy (`docs/anatomy/`).
- [`tests/README.md`](tests/README.md): how to serve and run the tests.

## Where Trellis disagrees with ordinary web practice

1. **Space is counted in cells.** Every length is a cell (`--u`) or a token made of cells, never a pixel or rem value of your own. Space between blocks is whole cells.
2. **Products only turn knobs.** A product layer is a `:root[data-product="name"]` rule in `@layer trellis.product` that sets variables from `product.template.css`, and nothing else. Colors go in as seeds, never roles.
3. **Context changes variables, never markup.** A dense list, a section in its own colors or a night mood sets variables (or a scope's `data-product` and `data-theme`); the markup stays the same.
4. **Inline styles set variables only.** `style="--cols: 3"`, or `el.style.setProperty('--x', …)` from script, with the property that reads `--x` in the stylesheet.
5. **The tests are the referee.** A change is right when `tests/contract.js` and the browser matrix pass in Chromium and WebKit, not when it looks right in one browser.
