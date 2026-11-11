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
    cell: { targetNarrow: 10, targetWide: 12, screenNarrow: 500, screenWide: 1000 },
    frame: { max: 100, module: 4 },
    type: {
      spaceNarrow: 320, spaceWide: 1440,
      h1: [36, 64], body: [16, 18], label: [11, 12],
      headingRatio: [1.2, 1.333], paragraphRatio: [1.125, 1.2],
      lineH1: 1.05, lineHeadingStep: 0.05, lineBody: 1.45, lineParagraphStep: 0.03, lineLabel: 1.2,
      afterH1: 0.33, afterHeadingStep: 0.11
    }
  };

  // Steps from an anchor. Headings step down from H1; paragraphs step out from body.
  var ROLES = {
    h1: ['h1', 0], h2: ['h1', -1], h3: ['h1', -2], h4: ['h1', -3], h5: ['h1', -4], h6: ['h1', -5],
    xl: ['body', 2], lg: ['body', 1], body: ['body', 0], sm: ['body', -1], xs: ['body', -2],
    label: ['label', 0]
  };

  function clamp(lo, v, hi) { return Math.max(lo, Math.min(v, hi)); }   // as CSS: when lo > hi, lo wins
  function mod(a, n) { return ((a % n) + n) % n; }
  function roundTo(v, step) { return Math.round(v / step) * step; }     // halves go up, as CSS round(nearest)
  function isHeading(role) { return /^h[1-6]$/.test(role); }
  function stands(role) { return /^h[123]$/.test(role); }

  // ---- The cell ----------------------------------------------------------
  // Its target grows in a straight line from the narrow screen to the wide
  // one and holds outside them. It follows the reader's text size, and the
  // dial scales it.
  function cellTarget(o, seed) {
    var c = (seed || SEED).cell, k = (o.textScale || 1);
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
    var ratio = r[0] === 'h1' ? t.headingRatio : r[0] === 'body' ? t.paragraphRatio : [1, 1];
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
    if (role === 'label') return t.lineLabel;
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
  // and never to nothing.
  function settleCluster(height, cell) { return Math.max(cell, Math.floor((height + cell / 2 - 0.5) / cell) * cell); }

  // A heading's own space after it: a share of its size, settled on the cells.
  function spaceAfter(role, size, cell, seed) {
    if (!isHeading(role)) return 0;
    var t = (seed || SEED).type;
    return roundTo(size * (t.afterH1 + t.afterHeadingStep * -ROLES[role][1]), cell);
  }
  // In a stack it is the larger of that space and the gap, never the sum.
  function spaceAfterInStack(own, gap) { return Math.max(0, own - gap); }

  // A seed from tokens.json, for a platform that reads the token file.
  function seedFromTokens(tokens) {
    var v = function (g, k) { return g[k].$value; }, c = tokens.cell, t = tokens.type;
    return {
      cell: { targetNarrow: v(c, 'target-narrow'), targetWide: v(c, 'target-wide'), screenNarrow: v(c, 'screen-narrow'), screenWide: v(c, 'screen-wide') },
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
    cellTarget: cellTarget, wholeCell: wholeCell, gutterCells: gutterCells, fit: fit, wideFrame: wideFrame,
    typeEnds: typeEnds, typeSize: typeSize, lineRatio: lineRatio, lineHeight: lineHeight,
    standPad: standPad, hang: hang, settleCluster: settleCluster, spaceAfter: spaceAfter, spaceAfterInStack: spaceAfterInStack,
    stands: stands, isHeading: isHeading, seedFromTokens: seedFromTokens
  };
});
