# Trellis brand marks

All marks are drawn on a 24-unit square (two cells at a 12px cell) and paint in `currentColor`, so they follow the text color in light and dark themes.

| File | What it is | Use |
|---|---|---|
| `trellis-mark.svg` | The panel: a rounded square (the plane), 2:1 laths (the lines), and a vine resting on three lattice points and ending in a tendril curl | Recommended. The nav bar, next to the word, at 24px |
| `trellis-mark-b.svg` | The tile: the same drawing cut out of one solid rounded square | Favicon, app icon, avatar, anywhere the mark sits alone |
| `trellis-lockup.svg` | The panel and the word "Trellis", 90 x 24 | Places that take one image (a README header, slides). The word is live text in the system sans the site uses, so it renders in the viewer's system font |

The lattice is the framework's own: points at (4 + 8m, 4n) with m and n of equal parity, laths sloping 2:1. The vine bows off the lattice between points and rests on it at (12, 20), (12, 12) and near (12, 4).

Inline use: paste the SVG, drop `role`, `aria-label` and the `<title>`, and add `aria-hidden="true"` when visible text sits beside it. Each file uses its own mask and clip ids (`tm-`, `ts-`, `tl-`), so the mark and the lockup can share a page.

Hold the mark at 18px or larger. Below that, the laths blur into a tone; use `trellis-mark-b.svg` instead.
