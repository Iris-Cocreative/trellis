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
    // Type from seven values (D93): H1, body and the label in a wide space, the
    // ratio at each end [narrow, wide], and the two spaces. `type` is what
    // follows from them (typeFrom, below), with the lines and the space after.
    seven: { h1: 72, body: 18, label: 12, ratio: [1.26, 1.414], spaceNarrow: 320, spaceWide: 1440 },
    type: {
      lineH1: 1.05, lineHeadingStep: 0.05, lineBody: 1.45, lineParagraphStep: 0.03, lineLabel: 1.2,
      afterH1: 0.33, afterHeadingStep: 0.11
    },
    // The palette: one seed, the accent, in its light-theme form as OKLCH
    // [lightness, chroma, hue]. The other nine seeds follow from it (derive),
    // and every role is a seed at a lightness. Add a seed here (neutral, person,
    // group, event, course, topic, ok, warn, alert; ground and ink, the neutral
    // for grounds and for text; night, the ground at night) to set it yourself.
    color: {
      seeds: { accent: [0.553, 0.166, 258.4] },
      lift: 0.17, flip: 0.58, nightLift: 0, dayDepth: 0,
      // Neutral roles: the neutral seed's hue and chroma at a lightness for each theme.
      neutrals: {
        bg: [0.973, 0.176], 'bg-raised': [1, 0.213], 'bg-raised-2': [0.975, 0.245], 'bg-raised-3': [0.95, 0.277], 'bg-sunken': [0.943, 0.148], 'bg-hover': [0.936, 0.264],
        text: [0.213, 0.967], 'text-secondary': [0.397, 0.823], 'text-tertiary': [0.52, 0.655], 'text-faint': [0.695, 0.495],
        border: [0.879, 0.308], 'border-subtle': [0.921, 0.259], 'border-strong': [0.741, 0.419]
      },
      // How the other seeds follow from the accent: see derived(), below.
      derive: {
        below: 0.54, above: 0.61, kind: 0.85, turn: { person: 144, group: 288, event: 72, course: 216 }, topic: -0.045,
        status: 0.9, statusMin: 0.1, statusMax: 0.17, statuses: { ok: 152, warn: 70, alert: 30 },
        stage: 0.85, stages: { 1: 45, 2: 90, 3: 135, 4: 180, 5: 225, 6: 270, 7: 315 },
        tint: 0.004, limit: [[0, 0.399], [30, 0.387], [45, 0.274], [60, 0.225], [90, 0.19], [120, 0.229], [135, 0.289], [150, 0.268], [165, 0.197], [195, 0.159], [225, 0.154], [255, 0.299], [270, 0.399], [360, 0.399]]
      },
      // Stages (D107): what follows from a stage's seed. Its ink is no lighter
      // than ink[0] by day and no darker than ink[1] at night; its tint is its
      // fill at this share.
      stage: { ink: [0.48, 0.76], tint: 0.14 },
      // A product's own colors (D117): a solid fill is no lighter than solid[0]
      // where its ink is white, and no darker than solid[1] where its ink is dark.
      own: { solid: [0.54, 0.62] }
    }
  };

  // ---- Type from seven values ----------------------------------------------
  // The five that follow, as core.css derives them:
  //   the text step   the square root of the ratio, at each end
  //   body, narrow    body less a narrow text step
  //   H1, narrow      as many steps above body as in a wide space
  //   label, narrow   the label: it is one size
  // `set` holds any of them a product set itself (h1, body, label: the narrow
  // size; step: [narrow, wide]); anything else in it is ignored. Returns the
  // two ends of each anchor and of each ratio, as the functions below read them.
  function typeFrom(seven, set) {
    set = set || {};
    var ok = function (v, d) { return typeof v === 'number' && isFinite(v) ? v : d; };
    var rn = seven.ratio[0], rw = seven.ratio[1], st = set.step || [];
    var body = ok(set.body, seven.body / Math.sqrt(rn));
    var place = Math.log(seven.h1 / seven.body) / Math.log(rw);
    return {
      spaceNarrow: seven.spaceNarrow, spaceWide: seven.spaceWide,
      h1: [ok(set.h1, body * Math.pow(rn, place)), seven.h1], body: [body, seven.body], label: [ok(set.label, seven.label), seven.label],
      headingRatio: [rn, rw], paragraphRatio: [ok(st[0], Math.sqrt(rn)), ok(st[1], Math.sqrt(rw))]
    };
  }
  SEED.type = Object.assign(typeFrom(SEED.seven), SEED.type);

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
  // cells, and the gutter by two cells, between 2 and 4. A reserve at either
  // side (reserveStart, reserveEnd, in points) is space the frame keeps clear:
  // it stays centered while both margins cover their reserves, then gives up
  // the other margin, then its own width.
  function wideFrame(o, seed) {
    var f = (seed || SEED).frame, hair = 1 / (o.dpr || 1), u = o.cell, step = u * f.module;
    var rs = o.reserveStart || 0, re = o.reserveEnd || 0;
    var width = Math.min(Math.floor((o.width - rs - re - hair + 1 / 16) / step) * step, u * f.max);
    var spare = o.width - width - hair, start = Math.max(rs, Math.min(spare / 2, spare - re));
    var two = u * 2, g = Math.floor(clamp(two, o.width * 0.04, u * 4) / two) * two;
    var safe = Math.max(Math.ceil((o.safeLeft || 0) / two) * two, Math.ceil((o.safeRight || 0) / two) * two);
    var gutter = Math.max(g, safe);
    return { frameCells: Math.round(width / u), gutterCells: Math.round(gutter / u), fieldCells: Math.round((width - 2 * gutter) / u),
      modules: (width - 2 * gutter) / step, margin: start, marginEnd: spare - start };
  }

  // ---- The ratio ------------------------------------------------------------
  // A role's two ends: its size in the narrow space and in the wide one.
  // A heading is never smaller than body text: each of its ends is floored at
  // body's. typeSteps gives the ends before the floor, for showing the working.
  function typeSteps(role, seed) {
    var t = (seed || SEED).type, r = ROLES[role], anchor = t[r[0]], n = r[1];
    var key = r[2] || RATIO[r[0]], ratio = key ? t[key] : [1, 1];
    return [anchor[0] * Math.pow(ratio[0], n), anchor[1] * Math.pow(ratio[1], n)];
  }
  function typeEnds(role, seed) {
    var e = typeSteps(role, seed), body = (seed || SEED).type.body;
    return isHeading(role) ? [Math.max(e[0], body[0]), Math.max(e[1], body[1])] : e;
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
  // A relational palette. A product chooses one seed, the accent; the other
  // seeds follow from it, and any of them can be set in its place. Every role
  // is a seed at a lightness. Neutral roles take the neutral seed's hue and chroma
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
  function linear(c) {
    var a = c[1] * Math.cos(c[2] * Math.PI / 180), b = c[1] * Math.sin(c[2] * Math.PI / 180);
    var l = Math.pow(c[0] + 0.3963377774 * a + 0.2158037573 * b, 3);
    var m = Math.pow(c[0] - 0.1055613458 * a - 0.0638541728 * b, 3);
    var s = Math.pow(c[0] - 0.0894841775 * a - 1.291485548 * b, 3);
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  }
  function oklchToRgb(c) { return linear(c).map(function (x) { return clamp(0, fromLinear(Math.max(0, x)), 1); }); }
  // Inside sRGB, to half a step of a channel's 255.
  function inGamut(c) {
    return linear(c).every(function (x) { return x > -0.00016 && fromLinear(Math.max(0, x)) < 1 + 0.5 / 255; });
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
  // A color at another lightness, its chroma moved with it: toward black in
  // step with the lightness, toward white in step with what is left of it. A
  // color inside sRGB stays inside, near enough, at any hue.
  function shade(c, l) {
    return [l, c[1] * (l < c[0] ? l / Math.max(c[0], 0.001) : Math.min(1, (1 - l) / Math.max(1 - c[0], 0.001))), c[2]];
  }
  // A stage (D107): a step of a process, in a color a product may make pale.
  //   stage     its fill: the seed, and in the dark the seed lifted, but no
  //             further than a derived seed is lifted, so a pale one stays put
  //   stageInk  the same hue where it reads as text: no lighter than ink[0] by
  //             day, no darker than ink[1] at night
  // A seed made before there were stages has none of their numbers: core's stand in.
  function stageOf(seed) { return (seed || SEED).color.stage || SEED.color.stage; }
  function stagesOf(seed) { var d = (seed || SEED).color.derive; return d.stages ? d : SEED.color.derive; }
  function stage(seedColor, theme, seed) {
    var s = parseColor(seedColor), col = (seed || SEED).color;
    return theme === 'dark' ? shade(s, Math.max(s[0], Math.min(s[0] + col.lift, col.derive.above + col.lift))) : s;
  }
  function stageInk(seedColor, theme, seed) {
    var s = parseColor(seedColor), ends = stageOf(seed).ink;
    return theme === 'dark' ? shade(s, Math.max(s[0], ends[1])) : shade(s, Math.min(s[0], ends[0]));
  }
  // A product's own color (D117): a seed a layer names itself (--seed-own-gold).
  // Its fill, its ink and its tint are a stage's. A fill a label stands on is the
  // fill moved clear of the flip, so ink on it reads at 4.5:1 for any color in sRGB.
  function ownSolid(seedColor, theme, seed) {
    var f = stage(seedColor, theme, seed), col = (seed || SEED).color, ends = (col.own || SEED.color.own).solid;
    return shade(f, f[0] < col.flip ? Math.min(f[0], ends[0]) : Math.max(f[0], ends[1]));
  }
  // Ink on a fill: white below the flip, a dark ink of the fill's hue above it.
  function ink(fill, seed) {
    var f = parseColor(fill), flip = (seed || SEED).color.flip;
    return f[0] < flip ? [1, 0, f[2]] : [0.16, f[1] * 0.3, f[2]];
  }
  // ---- One seed --------------------------------------------------------------
  // The seeds that follow from the accent (D90). core.css says the same with
  // relative colors, so it is arithmetic CSS can state: no search, no loop.
  //   clear   a derived seed keeps clear of the ink flip, so its ink reads at
  //           4.5:1 at any hue: no lighter than `below` where its ink is white
  //           (and no darker than `above` less the lift, since the dark theme
  //           lifts it), no darker than `above` where its ink is dark.
  //   limit   the most chroma sRGB holds at a hue, for each unit of lightness:
  //           straight segments between a few hues, under the real limit at
  //           every hue for a seed whose ink is white.
  //   follow  a kind: the accent turned around the wheel, at a share of its
  //           chroma and never more than the limit.
  function clear(l, seed) {
    var c = (seed || SEED).color, d = c.derive;
    return l < c.flip ? clamp(d.above - c.lift, l, d.below) : Math.max(l, d.above);
  }
  function chromaLimit(l, h, seed) {
    var k = (seed || SEED).color.derive.limit, x = mod(h, 360), i = 0;
    while (i < k.length - 2 && k[i + 1][0] <= x) i++;
    return l * (k[i][1] + (k[i + 1][1] - k[i][1]) * (x - k[i][0]) / (k[i + 1][0] - k[i][0]));
  }
  function follow(accent, turn, seed, share) {
    var a = parseColor(accent), d = (seed || SEED).color.derive, l = clear(a[0], seed), h = mod(a[2] + turn, 360);
    return [l, Math.min(a[1] * (share === undefined ? d.kind : share), chromaLimit(l, h, seed)), h];
  }
  // The seeds that follow from the accent.
  //   neutral  the accent's hue, a trace of chroma (its lightness is not used)
  //   kinds    person, group, event and course follow the accent, each turned
  //            its own way; topic is the accent a step darker, with the
  //            chroma that fits there
  //   statuses their own hues, the accent's lightness, a share of its chroma
  //            held between two ends and under what sRGB holds at that hue
  //   stages   stage-1 to stage-7, the steps of a process in order: each the
  //            accent turned an eighth of the wheel further than the last (D107)
  function derived(seed) {
    var col = (seed || SEED).color, d = col.derive, a = parseColor(col.seeds.accent), l = clear(a[0], seed), out = {}, k;
    out.neutral = [0.55, d.tint, a[2]];
    for (k in d.turn) out[k] = follow(a, d.turn[k], seed);
    var tl = clear(a[0] + d.topic, seed);
    out.topic = [tl, a[1] * Math.min(1, tl / a[0]), a[2]];
    for (k in d.statuses) out[k] = [l, Math.min(clamp(d.statusMin, a[1] * d.status, d.statusMax), chromaLimit(l, d.statuses[k], seed)), d.statuses[k]];
    var sg = stagesOf(seed);
    for (k in sg.stages) out['stage-' + k] = follow(a, sg.stages[k], seed, sg.stage);
    return out;
  }
  // All the seeds: the accent, and each of the others as it was set, or as it
  // follows. Ground (grounds and edges) and ink (text) are the neutral unless set.
  function seeds(seed) {
    var set = (seed || SEED).color.seeds, out = derived(seed), k;
    for (k in set) out[k] = parseColor(set[k]);
    if (!out.ground) out.ground = out.neutral;
    if (!out.ink) out.ink = out.neutral;
    if (!out.night) out.night = out.ground;
    if (!out['ink-night']) out['ink-night'] = out.ink;
    return out;
  }

  // A scope (D96): a product nested in a product. What the outer layers set
  // carries in, what the scope sets is its own, and what neither set follows
  // again from the scope's accent. Pass the seeds each layer set, outermost
  // first; the result is the seed to give palette().
  function scope(seed) {
    var base = JSON.parse(JSON.stringify(seed || SEED)), sets = Array.prototype.slice.call(arguments, 1), k, i;
    for (i = 0; i < sets.length; i++) for (k in sets[i]) base.color.seeds[k] = parseColor(sets[i][k]);
    return base;
  }

  // Every role in one theme, as OKLCH triples. A seed named own-… (a product's
  // own color, D117) adds four: own-gold, its fill; own-gold-ink; own-gold-solid,
  // the fill a label stands on; and own-gold-solid-ink, that label. In CSS they are
  // --seeded, --seeded-ink, --seeded-solid and --seeded-solid-ink on an element
  // whose --seed is var(--seed-own-gold).
  function palette(theme, seed) {
    var col = (seed || SEED).color, s = seeds(seed), out = {}, n, k, l;
    var dark = theme === 'dark' ? 1 : 0;
    for (k in col.neutrals) {
      // Text takes the ink; a ground or an edge the ground by day, and at night the night seed, lifted.
      // At night ink climbs toward white as the night lifts, three times as fast (D97).
      // By day grounds darken by dayDepth and ink with them, three times as fast (D98).
      if (k.indexOf('text') === 0) { n = dark ? s['ink-night'] : s.ink; l = col.neutrals[k][dark]; out[k] = [dark ? l + (1 - l) * Math.min(1, (col.nightLift || 0) * 3) : l * (1 - Math.min(1, (col.dayDepth || 0) * 3)), n[1], n[2]]; }
      else { n = dark ? s.night : s.ground; out[k] = [clamp(0, col.neutrals[k][dark] + (dark ? (col.nightLift || 0) : -(col.dayDepth || 0)), 1), n[1], n[2]]; }
    }
    out.accent = dark && s['accent-night'] ? s['accent-night'] : hue(s.accent, theme, seed);   // the accent's own night, if set (D98)
    out['accent-ink'] = ink(out.accent, seed);
    out.focus = out.accent;
    ['person', 'group', 'event', 'course', 'topic'].forEach(function (k) { out['kind-' + k] = hue(s[k], theme, seed); });
    ['ok', 'warn', 'alert'].forEach(function (k) { out[k] = hue(s[k], theme, seed); });
    Object.keys(stagesOf(seed).stages).forEach(function (k) { out['stage-' + k] = stage(s['stage-' + k], theme, seed); out['stage-' + k + '-ink'] = stageInk(s['stage-' + k], theme, seed); });
    Object.keys(s).forEach(function (k) {
      if (k.indexOf('own-') !== 0) return;
      out[k] = stage(s[k], theme, seed);
      out[k + '-ink'] = stageInk(s[k], theme, seed);
      out[k + '-solid'] = ownSolid(s[k], theme, seed);
      out[k + '-solid-ink'] = ink(out[k + '-solid'], seed);
    });
    return out;
  }

  // A seed from tokens.json, for a platform that reads the token file.
  function seedFromTokens(tokens) {
    var v = function (g, k) { return g[k].$value; }, c = tokens.cell, t = tokens.type, col = tokens.color;
    var triple = function (x) { return x.components.slice(); };
    var seeds = {}, neutrals = {};
    Object.keys(col.seed).forEach(function (k) { if (k[0] !== '$') seeds[k] = triple(col.seed[k].$value); });
    Object.keys(col.neutral).forEach(function (k) { if (k[0] !== '$') neutrals[k] = [col.neutral[k].light.$value, col.neutral[k].dark.$value]; });
    var d = col.derive, turn = {}, statuses = {}, stages = {};
    Object.keys(d['kind-turn']).forEach(function (k) { if (k[0] !== '$') turn[k] = d['kind-turn'][k].$value; });
    Object.keys(d['status-hue']).forEach(function (k) { if (k[0] !== '$') statuses[k] = d['status-hue'][k].$value; });
    Object.keys(d['stage-turn']).forEach(function (k) { if (k[0] !== '$') stages[k] = d['stage-turn'][k].$value; });
    var derive = { below: v(d, 'clear-below'), above: v(d, 'clear-above'), kind: v(d, 'kind-chroma'), turn: turn, topic: v(d, 'topic-step'),
      status: v(d, 'status-chroma'), statusMin: v(d, 'status-chroma-min'), statusMax: v(d, 'status-chroma-max'), statuses: statuses,
      stage: v(d, 'stage-chroma'), stages: stages,
      tint: v(d, 'neutral-chroma'), limit: Object.keys(d.limit).filter(function (k) { return k[0] !== '$'; }).map(function (k) { return [+k, d.limit[k].$value]; }).sort(function (a, b) { return a[0] - b[0]; }) };
    var seven = { h1: v(t, 'h1-wide'), body: v(t, 'body-wide'), label: v(t, 'label-wide'), ratio: [v(t, 'heading-ratio-narrow'), v(t, 'heading-ratio-wide')],
      spaceNarrow: v(t, 'space-narrow'), spaceWide: v(t, 'space-wide') };
    return {
      color: { seeds: seeds, lift: v(col, 'lift'), flip: v(col, 'ink-flip'), nightLift: v(col, 'night-lift'), dayDepth: v(col, 'day-depth'), neutrals: neutrals, derive: derive,
        stage: { ink: [v(col.stage, 'ink-light'), v(col.stage, 'ink-dark')], tint: v(col.stage, 'tint') },
        own: { solid: [v(col.own, 'solid-below'), v(col.own, 'solid-above')] } },
      cell: { targetNarrow: v(c, 'target-narrow'), targetWide: v(c, 'target-wide'), screenNarrow: v(c, 'screen-narrow'), screenWide: v(c, 'screen-wide'), textScaleMax: v(c, 'text-scale-max') },
      frame: { max: v(tokens.frame, 'max'), module: SEED.frame.module },
      seven: seven,
      type: Object.assign({}, SEED.type, typeFrom(seven))
    };
  }

  return {
    SEED: SEED, ROLES: ROLES,
    cellScale: cellScale, cellTarget: cellTarget, wholeCell: wholeCell, gutterCells: gutterCells, fit: fit, wideFrame: wideFrame,
    typeFrom: typeFrom, typeSteps: typeSteps, typeEnds: typeEnds, typeSize: typeSize, lineRatio: lineRatio, lineHeight: lineHeight,
    standPad: standPad, hang: hang, settleCluster: settleCluster, spaceAfter: spaceAfter, spaceAfterInStack: spaceAfterInStack,
    stands: stands, isHeading: isHeading, seedFromTokens: seedFromTokens,
    parseColor: parseColor, hex: hex, inGamut: inGamut, contrast: contrast, hue: hue, ink: ink, shade: shade, stage: stage, stageInk: stageInk, ownSolid: ownSolid, palette: palette,
    clear: clear, chromaLimit: chromaLimit, follow: follow, derived: derived, seeds: seeds, scope: scope
  };
});
