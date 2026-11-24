# Moving an existing site onto Trellis

The companion to `SKILL.md` for a site or app that already has its own CSS. It adds the steps a new project doesn't need: take stock, sort, translate the brand, switch, measure. Everything in `SKILL.md` still applies; read it first.

The worked example is a brand site moved over on 2026-11-19: a static site with a dark-first brand, 28 pages and three WebGL scenes. Its own-file counts went from 381 raw lengths, 79 raw colors and 136 restyled primitives to 61, 8 and 47, and it ended close to the approved design.

## The aim

Match the site's approved look closely, not pixel for pixel. Trellis measures space in whole cells and sizes type by a ratio, so small shifts are expected and accepted. A difference that matters is not forced. It gets a workaround in the app's own layer and a line in the ledger.

## 1. Take stock before touching anything

- Run `node <trellis>/tools/check.js <the app's own folders>` and keep the numbers as the "before" baseline. Leave out archives, print files and vendored code.
- Count the classes the markup actually uses, most used first. Frequency tells you what matters, and the list shows every name.
- List every component the stylesheets define.
- Read the site's token file. A three-tier one (raw values → semantic roles → section grounds) maps almost one to one onto seeds → roles → scopes.
- Note what must not move: WebGL clear colors, image masks, anything a script reads from CSS.

## 2. Sort every part by its job, not its name

Each component goes into exactly one bucket:

| Bucket | Test | Action | Examples from the brand site |
|---|---|---|---|
| **Same job** | A Trellis primitive does what it does | Use the primitive and delete the site's version | `.btn` → `.button`, `.icon-btn` → `.button.icon-button`, `.container` → `.frame`; Trellis's own `.stack`, `.cluster`, `.grid`, `.split`, `.card`, `.tag`, `.field`/`.input`, `.skip-link`; the type roles |
| **Same name, other job** | The name exists in Trellis but means something else | Rename the site's class, then sort it again | `.board` (a schedule) → `.timetable`; `.section` → `.room`; `.pair` → `.lib-pair` |
| **Own part** | Trellis has nothing like it | Keep it, rewritten by the five rules in `SKILL.md` on Trellis tokens | Arches, accordion, timeline, quotes, the library room, the WebGL scenes, header, drawer, footer |

Three checks while sorting:
- Type roles may shift a step. Map by the size the role renders at, not by its name: the site's `.t-h3` became `.t-h4` there.
- A part that is "almost" a primitive is the primitive. Set its variables, or record the gap. Never build a near-copy.
- Only what the old site boxed gets a box. Trellis brings order and spacing, not a new layout. Don't wrap content in `.card`s, add containers, or color cards the old design didn't have. Text that sat on the page ground stays on it, in a `.stack` or `.frame`. The aim is a site better than the original, not one rebuilt from Trellis parts.

## 3. Put the brand into knobs

- Convert the palette to OKLCH. Seeds take their light-theme form; `--seed-accent-night` takes the brand's own night accent where it isn't a plain lift.
- Hit exact brand grounds with the depth and lift knobs: `--day-depth` for paper, `--night-lift` for night. The brand site set `--night-lift: .025` so the night ground lands on the umber its WebGL scenes clear to. Measure the lightness you need and set the knob from it; don't guess.
- Set families, weights, tracking and the ratio (`--h1-max`, `--body-max`) from the old type scale's top values.
- Get density from the knobs (`--density-control-h`, `--density-control-fs`), never by restyling a button.
- Run `node <trellis>/tests/contract.js <product file>`. It checks the knobs and the contrast.

## 4. Turn section grounds into scopes

A section with its own ground (a "room", a band, a mood) becomes a scope: `data-product="part"` plus `data-theme` when it flips day or night. It gets a `[data-product="part"]` rule of knobs in the product file. The brand site's plaster and stone rooms became light scopes on a dark page. Never re-declare roles to recolor a section.

## 5. Switch in one step

If a class name collides, as `.stack`, `.card` and `.grid` usually do, the two systems can't run side by side, so switch in one step. Work on a local branch and commit in layers:

1. Pin Trellis in `vendor/trellis/` with `SOURCE.txt`, and add the product file.
2. The CSS: load order `core.css`, product, then the app's layers. Delete what Trellis now covers; rewrite the own parts on tokens.
3. The markup, across every page and every script that writes markup.
4. The docs: Trellis rules in `CLAUDE.md` (`SKILL.md`, step 5), the ledger, the budget.

Keep the old site served beside the new one (a worktree of `main` on another port) so people can compare them.

## 6. Write down what doesn't fit

Every difference Trellis can't express gets a row in `TRELLIS-LEDGER.md`: what was needed, what was used instead, and what Trellis should gain (a variant, a knob, a primitive or nothing). The brand site logged 13. The common ones to expect:
- type above H1
- a frame wider than 1200px, or a narrow one
- a grid whose tracks stretch to fill
- a see-through card ground
- fluid space between sections
- body text above 1rem
- art colors that are not UI

## 7. Measure, then hand over

- Run the checker again, compare it with the baseline, and write the budget: `--budget check.budget.json --write`.
- Confirm every page returns 200 and every script parses.
- List what needs human eyes at 1440 and 390 wide. These are the places Trellis's choices replaced the site's: frame width, grid fill, heading space, control heights, card grounds, select arrows, and contrast in light scopes.
- Report it short: what changed, the numbers before and after, the ledger gaps, the commits.
