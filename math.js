/* Trellis · the math
   The fit, the ratio, standing, hanging and the gutter parity rule, as plain
   functions with no DOM and no dependencies. core.css says the same things in
   CSS; this file says them in arithmetic, so the specimen can show its working
   and a native screen can lay out on the same lattice.

   Every length is in points: one CSS pixel at the reader's default text size,
   one pt on iOS, one dp on Android. Pass textScale for the reader's text size
   (1 is the default) and dpr for the device's pixels per point.

   SEED holds the neutral defaults. They are tokens.json's, and
   tests/contract.js fails if the two disagree; pass your own seed to any
   function to use a product's values instead.

   Browser: <script src="math.js"> sets window.TrellisMath.
   Node, bundlers, React Native: require('@iris-cocreative/trellis/math.js'). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TrellisMath = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SEED = {
    cell: { targetNarrow: 10, targetWide: 12, screenNarrow: 500, screenWide: 1000, textScaleMax: 1.5 },
    frame: { max: 100, module: 4 },
    type: {
      spaceNarrow: 320, spaceWide: 1440,
      h1: [36, 64], body: [16, 18], label: [11, 12],
      headingRatio: [1.2, 1.333], paragraphRatio: [1.125, 1.2],
      lineH1: 1.05, lineHeadingStep: 0.05, lineBody: 1.45, lineParagraphStep: 0.03, lineLabel: 1.2,
      afterH1: 0.33, afterHeadingStep: 0.11
    },
    // The palette: seeds, each one color in its light-theme form as OKLCH
    // [lightness, chroma, hue], and every role derived from one of them.
    color: {
      seeds: {
        neutral: [0.55, 0.004, 100], accent: [0.553, 0.166, 258.4],
        person: [0.617, 0.132, 68.7], group: [0.555, 0.09, 212], event: [0.487, 0.155, 313.5],
        course: [0.519, 0.127, 154.1], topic: [0.508, 0.163, 257.5],
        ok: [0.547, 0.146, 152.3], warn: [0.572, 0.125, 69.8], alert: [0.558, 0.168, 36.3]
      },
      lift: 0.17, flip: 0.58,
      // Neutral roles: the neutral seed's hue and chroma at a lightness for each theme.
      neutrals: {
        bg: [0.973, 0.176], 'bg-raised': [1, 0.213], 'bg-raised-2': [0.985, 0.245], 'bg-raised-3': [0.97, 0.277], 'bg-sunken': [0.943, 0.148], 'bg-hover': [0.936, 0.264],
        text: [0.213, 0.967], 'text-secondary': [0.397, 0.823], 'text-tertiary': [0.544, 0.655], 'text-faint': [0.695, 0.495],
        border: [0.879, 0.308], 'border-subtle': [0.921, 0.259], 'border-strong': [0.741, 0.419]
      }
    }
  };

  // Steps from an anchor. Headings step down from H1; paragraphs step out from
  // body. The eyebrow is the label one paragraph step up: [anchor, step, ratio].
  var ROLES = {
    h1: ['h1', 0], h2: ['h1', -1], h3: ['h1', -2], h4: ['h1', -3], h5: ['h1', -4], h6: ['h1', -5],
    xl: ['body', 2], lg: ['body', 1], body: ['body', 0], sm: ['body', -1], xs: ['body', -2],
    label: ['label', 0], eyebrow: ['label', 1, 'paragraphRatio']
  };
  var RATIO = { h1: 'headingRatio', body: 'paragraphRatio' };

  function clamp(lo, v, hi) { return Math.max(lo, Math.min(v, hi)); }   // as CSS: when lo > hi, lo wins
  function mod(a, n) { return ((a % n) + n) % n; }
  function roundTo(v, step) { return Math.round(v / step) * step; }     // halves go up, as CSS round(nearest)
  function isHeading(role) { return /^h[1-6]$/.test(role); }
  function stands(role) { return /^h[123]$/.test(role); }

  // ---- The cell ----------------------------------------------------------
  // Its target grows in a straight line from the narrow screen to the wide
  // one and holds outside them. It follows the reader's text size up to the
  // cap (1.5 by default) and no further: above it only type grows. The dial
  // scales it after the cap.
  function cellScale(textScale, seed) {
    return Math.min(textScale || 1, (seed || SEED).cell.textScaleMax);
  }
  function cellTarget(o, seed) {
    var c = (seed || SEED).cell, k = cellScale(o.textScale, seed);
    var slope = (c.targetWide - c.targetNarrow) / (c.screenWide - c.screenNarrow);
    var grown = (c.targetNarrow - slope * c.screenNarrow) * k + slope * o.width;
    return clamp(c.targetNarrow * k, grown, c.targetWide * k) * (o.dial || 1);
  }

  // Whole, on a wide screen: the target rounded to an even point, so half a
  // cell is whole too.
  function wholeCell(target) { return roundTo(target, 2); }

  // ---- The gutter parity rule ---------------------------------------------
  // The field between the gutters must be whole modules of 4 cells. With an
  // even count of cells that holds when the gutter has the same parity as
  // half the count: 40 cells take 2 (field 36), 42 take 3 (field 36). Beside
  // a notch the gutter must also clear the safe area: the fewest cells that
  // do, plus one if the parity is wrong.
  function gutterCells(cells, safeCells) {
    var half = cells / 2, safe = safeCells || 0;
    return Math.max(2 + mod(half, 2), safe + mod(half - safe, 2));
  }

  // ---- The fit --------------------------------------------------------------
  // Where the screen's edge frames the page, whole cells span it.
  //   count  the even number nearest (width - hair) / target, so the center is a line
  //   cell   (width - hair) / count, rounded down to 1/32 point, and held within
  //          0.8 to 1.25 of the target
  //   hair   one device pixel: the last line needs it, since a line occupies the
  //          pixels after its coordinate
  // o: { width, target, dpr, safeLeft, safeRight }
  function fit(o, seed) {
    var f = (seed || SEED).frame, hair = 1 / (o.dpr || 1), w = o.width - hair;
    var count = 2 * Math.round(w / (o.target * 2));
    var cell = clamp(o.target * 0.8, Math.floor((w / Math.max(count, 2) + 1 / 4096) * 32) / 32, o.target * 1.25);
    var frame = Math.min(count, f.max);
    var safe = Math.ceil(Math.max(o.safeLeft || 0, o.safeRight || 0) / cell);
    var gutter = gutterCells(frame, safe);
    return { cells: count, cell: cell, frameCells: frame, gutterCells: gutter, fieldCells: frame - 2 * gutter,
      modules: (frame - 2 * gutter) / f.module, hair: hair, spare: w - count * cell };
  }

  // Not fitted (a wide screen): the frame steps by a module, at most frame.max
  // cells, and the gutter by two cells, between 2 and 4.
  function wideFrame(o, seed) {
    var f = (seed || SEED).frame, hair = 1 / (o.dpr || 1), u = o.cell, step = u * f.module;
    var width = Math.min(Math.floor((o.width - hair + 1 / 16) / step) * step, u * f.max);
    var two = u * 2, g = Math.floor(clamp(two, o.width * 0.04, u * 4) / two) * two;
    var safe = Math.max(Math.ceil((o.safeLeft || 0) / two) * two, Math.ceil((o.safeRight || 0) / two) * two);
    var gutter = Math.max(g, safe);
    return { frameCells: Math.round(width / u), gutterCells: Math.round(gutter / u), fieldCells: Math.round((width - 2 * gutter) / u),
      modules: (width - 2 * gutter) / step, margin: (o.width - width - hair) / 2 };
  }

  // ---- The ratio ------------------------------------------------------------
  // A role's two ends: its size in the narrow space and in the wide one.
  function typeEnds(role, seed) {
    var t = (seed || SEED).type, r = ROLES[role], anchor = t[r[0]], n = r[1];
    var key = r[2] || RATIO[r[0]], ratio = key ? t[key] : [1, 1];
    return [anchor[0] * Math.pow(ratio[0], n), anchor[1] * Math.pow(ratio[1], n)];
  }

  // A role's size in a space of a given width: a straight line between its two
  // ends, held at each. The space is the container, not the window.
  function typeSize(role, space, o, seed) {
    var t = (seed || SEED).type, k = (o && o.textScale) || 1, e = typeEnds(role, seed);
    var slope = (e[1] - e[0]) / (t.spaceWide - t.spaceNarrow);
    return clamp(e[0], e[0] + slope * (space / k - t.spaceNarrow), e[1]) * k;
  }

  // Line height, as a multiple of the size. Each smaller heading opens by a
  // step; each larger paragraph role closes by one.
  function lineRatio(role, seed) {
    var t = (seed || SEED).type, n = ROLES[role][1];
    if (isHeading(role)) return t.lineH1 + t.lineHeadingStep * -n;
    if (ROLES[role][0] === 'label') return t.lineLabel;
    return t.lineBody - t.lineParagraphStep * n;
  }

  // ---- Standing and hanging -------------------------------------------------
  // Headlines stand (h1 to h3): the line height is whole cells, and the box,
  // trimmed to the capitals and the baseline, is padded on top to whole cells.
  // So the last baseline is on a cell line and every line above it is too.
  // Other text hangs: its own line height, its capitals' top on a cell line,
  // its block rounded up to whole cells so what follows starts on a line.
  function lineHeight(role, size, cell, seed) {
    var raw = size * lineRatio(role, seed);
    return stands(role) ? roundTo(raw, cell) : raw;
  }

  // The space a standing headline adds above its capitals. capHeight is the
  // font's, at this size; layout engines store it in 1/64 point.
  function standPad(capHeight, cell) {
    return Math.ceil(capHeight / cell - 1e-9) * cell - Math.floor(capHeight * 64) / 64;
  }

  // A hanging block's height: up to whole cells.
  function hang(height, cell) { return Math.ceil(height / cell - 1e-3) * cell; }

  // A cluster (a wrapping row of tags) rounds to the nearest cell, halves down,
  // and never to nothing. At the end of a surface (atEnd) nothing follows it but
  // the surface's padding, so there it rounds up, like text.
  function settleCluster(height, cell, atEnd) {
    return atEnd ? hang(height, cell) : Math.max(cell, Math.floor((height + cell / 2 - 0.5) / cell) * cell);
  }

  // A heading's own space after it: a share of its size, rounded up to whole
  // cells (to the nearest, a common size drops a cell). 1/64 point absorbs
  // layout's own rounding, as core.css does.
  function spaceAfter(role, size, cell, seed) {
    if (!isHeading(role)) return 0;
    var t = (seed || SEED).type;
    return Math.ceil((size * (t.afterH1 + t.afterHeadingStep * -ROLES[role][1]) - 1 / 64) / cell) * cell;
  }
  // In a stack it is the larger of that space and the gap, never the sum.
  function spaceAfterInStack(own, gap) { return Math.max(0, own - gap); }

  // ---- Color --------------------------------------------------------------
  // A relational palette. A product chooses a few seeds; every role is one of
  // them at a lightness. Neutral roles take the neutral seed's hue and chroma
  // at a lightness for each theme. A hue (the accent, each kind, each status)
  // is its seed in the light theme, and in the dark theme the same color
  // lifted by `lift`. Ink on a fill flips at `flip`: white on a fill darker
  // than it, a dark ink of the fill's own hue on one lighter. core.css says the
  // same with relative colors (oklch(from …)); this says it in arithmetic.
  // Colors are OKLCH triples [l, c, h]; out of the sRGB gamut, channels clip.
  function parseColor(s) {
    if (Array.isArray(s)) return s;
    var m = /^#([0-9a-f]{6})$/i.exec(String(s).trim());
    if (m) return rgbToOklch([0, 2, 4].map(function (i) { return parseInt(m[1].substr(i, 2), 16) / 255; }));
    m = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*\)$/i.exec(String(s).trim());
    if (m) return [parseFloat(m[1]) / (m[2] ? 100 : 1), parseFloat(m[3]), parseFloat(m[4])];
    throw new Error('math.js: a color is #rrggbb or oklch(l c h); got ' + s);
  }
  function toLinear(x) { return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }
  function fromLinear(x) { return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055; }
  function rgbToOklch(rgb) {
    var r = toLinear(rgb[0]), g = toLinear(rgb[1]), b = toLinear(rgb[2]);
    var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    var s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    var L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    var A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    var B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return [L, Math.sqrt(A * A + B * B), mod(Math.atan2(B, A) * 180 / Math.PI, 360)];
  }
  function oklchToRgb(c) {
    var a = c[1] * Math.cos(c[2] * Math.PI / 180), b = c[1] * Math.sin(c[2] * Math.PI / 180);
    var l = Math.pow(c[0] + 0.3963377774 * a + 0.2158037573 * b, 3);
    var m = Math.pow(c[0] - 0.1055613458 * a - 0.0638541728 * b, 3);
    var s = Math.pow(c[0] - 0.0894841775 * a - 1.291485548 * b, 3);
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(function (x) { return clamp(0, fromLinear(Math.max(0, x)), 1); });
  }
  function hex(c) { return '#' + oklchToRgb(c).map(function (x) { return ('0' + Math.round(x * 255).toString(16)).slice(-2); }).join(''); }
  // WCAG 2 relative luminance and contrast, for the checks.
  function luminance(c) { var rgb = oklchToRgb(c).map(toLinear); return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]; }
  function contrast(a, b) { var x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

  // A hue's color in a theme: its seed, lifted in the dark.
  function hue(seedColor, theme, seed) {
    var s = parseColor(seedColor), lift = (seed || SEED).color.lift;
    return theme === 'dark' ? [Math.min(s[0] + lift, 1), s[1], s[2]] : s;
  }
  // Ink on a fill: white below the flip, a dark ink of the fill's hue above it.
  function ink(fill, seed) {
    var f = parseColor(fill), flip = (seed || SEED).color.flip;
    return f[0] < flip ? [1, 0, f[2]] : [0.16, f[1] * 0.3, f[2]];
  }
  // Every role in one theme, as OKLCH triples.
  function palette(theme, seed) {
    var col = (seed || SEED).color, s = col.seeds, out = {}, n = parseColor(s.neutral), k;
    var dark = theme === 'dark' ? 1 : 0;
    for (k in col.neutrals) out[k] = [col.neutrals[k][dark], n[1], n[2]];
    out.accent = hue(s.accent, theme, seed);
    out['accent-ink'] = ink(out.accent, seed);
    out.focus = out.accent;
    ['person', 'group', 'event', 'course', 'topic'].forEach(function (k) { out['kind-' + k] = hue(s[k], theme, seed); });
    ['ok', 'warn', 'alert'].forEach(function (k) { out[k] = hue(s[k], theme, seed); });
    return out;
  }

  // A seed from tokens.json, for a platform that reads the token file.
  function seedFromTokens(tokens) {
    var v = function (g, k) { return g[k].$value; }, c = tokens.cell, t = tokens.type, col = tokens.color;
    var triple = function (x) { return x.components.slice(); };
    var seeds = {}, neutrals = {};
    Object.keys(col.seed).forEach(function (k) { if (k[0] !== '$') seeds[k] = triple(col.seed[k].$value); });
    Object.keys(col.neutral).forEach(function (k) { if (k[0] !== '$') neutrals[k] = [col.neutral[k].light.$value, col.neutral[k].dark.$value]; });
    return {
      color: { seeds: seeds, lift: v(col, 'lift'), flip: v(col, 'ink-flip'), neutrals: neutrals },
      cell: { targetNarrow: v(c, 'target-narrow'), targetWide: v(c, 'target-wide'), screenNarrow: v(c, 'screen-narrow'), screenWide: v(c, 'screen-wide'), textScaleMax: v(c, 'text-scale-max') },
      frame: { max: v(tokens.frame, 'max'), module: SEED.frame.module },
      type: Object.assign({}, SEED.type, {
        spaceNarrow: v(t, 'space-narrow'), spaceWide: v(t, 'space-wide'),
        h1: [v(t, 'h1-narrow'), v(t, 'h1-wide')], body: [v(t, 'body-narrow'), v(t, 'body-wide')], label: [v(t, 'label-narrow'), v(t, 'label-wide')],
        headingRatio: [v(t, 'heading-ratio-narrow'), v(t, 'heading-ratio-wide')],
        paragraphRatio: [v(t, 'paragraph-ratio-narrow'), v(t, 'paragraph-ratio-wide')]
      })
    };
  }

  return {
    SEED: SEED, ROLES: ROLES,
    cellScale: cellScale, cellTarget: cellTarget, wholeCell: wholeCell, gutterCells: gutterCells, fit: fit, wideFrame: wideFrame,
    typeEnds: typeEnds, typeSize: typeSize, lineRatio: lineRatio, lineHeight: lineHeight,
    standPad: standPad, hang: hang, settleCluster: settleCluster, spaceAfter: spaceAfter, spaceAfterInStack: spaceAfterInStack,
    stands: stands, isHeading: isHeading, seedFromTokens: seedFromTokens,
    parseColor: parseColor, hex: hex, contrast: contrast, hue: hue, ink: ink, palette: palette
  };
});
