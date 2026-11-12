/* Trellis · vines · an experiment (v0.1)
   Vines growing up the lattice. The trellis is the 2:1 lattice the page is
   built on: its points sit on cell corners, two cells apart across and one
   down, and its laths slope 2:1. A vine walks up it from point to point: it
   rests on a lattice point, then moves off the lattice to the next one,
   along a lath or straight up through the middle of a rhombus. Leaves are
   one, one and a half or two cells long; flowers span a cell and a half;
   tendrils coil about half a cell across and end in a quarter-cell dot; a
   flower's heart is a half-cell dot. Stems taper to one line.
   Seeded: the same seed, cell and size grow the same vines. Drawn on a
   canvas at device resolution, in the theme's colors, read from tokens.
   It grows while on screen, pauses when off it, and shows the grown state at
   once when the reader prefers reduced motion. It never touches layout: the
   page positions the canvas (on a cell line, so the lattice meets the grid).

   TrellisVines.mount(canvas, options) → { regrow(seed), finish(), pause(),
   play(), redraw(), destroy() }. Options, all optional:
     seed 1 · cell (px, else Trellis.cell()) · edge 'none' | 'left' | 'right'
     · band 12 (cells, the width vines keep to at an edge) · count (vines)
     · reach .9 (of the height) · density 1 (branching) · curl 1 (sway)
     · leaves 1 · blooms 1 · speed 8 (cells a second) · lattice 'full' |
     'rails' | 'none' · colors { stem, leaf, bloom, lattice, rail, bg }: token names */
(function () {
  'use strict';
  if (typeof window === 'undefined' || window.TrellisVines) return;
  var TAU = Math.PI * 2;
  var still = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var COLORS = { stem: '--ok', leaf: '--ok', bloom: '--kind-person', lattice: '--border', rail: '--border-strong', bg: '--bg' };

  function rng(a) {                       // mulberry32: small, seeded, good enough
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var easeOut = function (x) { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); };

  // ---- Growing: a seeded walk over the lattice, then a smooth stem through it ----
  // Lattice points are (2u·m, u·n) with m and n both even or both odd.
  function plan(W, H, u, o) {
    var rand = rng(o.seed * 7919 + 17), stems = [], decor = [], rails = [], v = o.speed * u;
    var mLo = 0, mHi = Math.floor(W / (2 * u)), top = H * (1 - o.reach);
    if (o.edge === 'right') mLo = Math.max(0, mHi - Math.round(o.band / 2));
    if (o.edge === 'left') mHi = Math.min(mHi, Math.round(o.band / 2));
    var edged = o.edge === 'left' || o.edge === 'right', used = {};
    if (!edged) { mLo = 1; mHi -= 1; }                                    // keep stems off a free canvas's sides
    var count = o.count || Math.max(edged ? 2 : 1, Math.round((mHi - mLo) / 9));
    var free = function (m, n) { return m >= mLo && m <= mHi && !used[m + ',' + n]; };

    function grow(m, n, dir, maxSteps, gen, birth, w0, ceil) {
      var pts = [[m, n]], ups = [false];
      for (var k = 0; k < maxSteps && (n - 1) * u > ceil; k++) {
        if (rand() < .3) dir = -dir;                                        // a lath runs a while, then turns
        // along a lath, the other lath, or up through the rhombus: the first point no stem holds yet
        var ways = rand() < .16 * o.curl ? [[0, 2], [dir, 1], [-dir, 1]] : [[dir, 1], [0, 2], [-dir, 1]], go = null;
        for (var w = 0; w < 3 && !go; w++) if (free(m + ways[w][0], n - ways[w][1])) go = ways[w];
        if (!go) break;
        if (go[0]) dir = go[0];
        m += go[0]; n -= go[1]; ups.push(!go[0]);
        used[m + ',' + n] = 1; pts.push([m, n]);
      }
      if (pts.length < 2) return;
      var P = pts.map(function (p) { return [p[0] * 2 * u, p[1] * u]; });
      var S = [], L = 0, way = [0];
      for (var i = 0; i < P.length - 1; i++) {                              // Catmull-Rom, bowed off the lattice
        var a = P[Math.max(i - 1, 0)], b = P[i], c = P[i + 1], d = P[Math.min(i + 2, P.length - 1)];
        var dx = c[0] - b[0], dy = c[1] - b[1], len = Math.hypot(dx, dy);
        var sw = (rand() - .5) * (ups[i + 1] ? 1.1 : .5) * u * o.curl, nx = -dy / len * sw, ny = dx / len * sw;
        var c1 = [b[0] + (c[0] - a[0]) / 6 + nx, b[1] + (c[1] - a[1]) / 6 + ny];
        var c2 = [c[0] - (d[0] - b[0]) / 6 + nx, c[1] - (d[1] - b[1]) / 6 + ny];
        var steps = Math.max(4, Math.ceil(len / 2));
        for (var j = i ? 1 : 0; j <= steps; j++) {
          var t = j / steps, s = 1 - t;
          var x = s * s * s * b[0] + 3 * s * s * t * c1[0] + 3 * s * t * t * c2[0] + t * t * t * c[0];
          var y = s * s * s * b[1] + 3 * s * s * t * c1[1] + 3 * s * t * t * c2[1] + t * t * t * c[1];
          if (S.length) L += Math.hypot(x - S[S.length - 1].x, y - S[S.length - 1].y);
          S.push({ x: x, y: y, s: L });
        }
        way.push(L);
        if (!ups[i + 1]) rails.push({ x0: b[0], y0: b[1], x1: c[0], y1: c[1], t0: birth + way[i] / v, t1: birth + L / v });
      }
      var stem = { pts: S, len: L, birth: birth, w0: w0, w1: 1, gen: gen };
      stems.push(stem);
      var heading = function (s) {
        var i = 1; while (i < S.length - 1 && S[i].s < s) i++;
        return Math.atan2(S[i].y - S[i - 1].y, S[i].x - S[i - 1].x);
      };
      var side = rand() < .5 ? 1 : -1, last = P.length - 1;
      for (i = 1; i < last; i++) {                                           // at each point it rests on
        var at = birth + way[i] / v, h = heading(way[i]), turned = pts[i + 1][0] - pts[i][0] !== pts[i][0] - pts[i - 1][0];
        if (rand() < .78 * o.leaves) {
          side = -side;
          var size = [1, 1.5, 2][Math.floor(rand() * 3)] * (gen ? .75 : 1);
          decor.push({ k: 'leaf', x: P[i][0], y: P[i][1], a: h + side * (.6 + rand() * .4), size: size * u, bend: (rand() - .5) * .5, t0: at });
        }
        if (turned && rand() < .45 * o.curl) decor.push(curl(P[i][0], P[i][1], h - side * (.9 + rand() * .4), -side, at, u));
        if (gen < 2 && i > 1 && i < last - 1 && rand() < .2 * o.density) {
          var wAt = w0 + (1 - w0) * way[i] / L, cdir = pts[i + 1][0] > pts[i][0] ? -1 : 1;
          grow(pts[i][0], pts[i][1], cdir, gen ? 2 + rand() * 2 : 3 + rand() * 4, gen + 1, at, Math.max(1, wAt * .8), top);
        }
      }
      var end = birth + L / v, eh = heading(L), r = rand();
      var tip = r < (gen ? .3 : .7) * o.blooms ? 'flower' : r < (gen ? .5 : .85) * o.blooms ? 'bud' : 'leaf';
      decor.push({ k: tip, x: S[S.length - 1].x, y: S[S.length - 1].y, a: eh, size: (tip === 'flower' ? .75 : tip === 'bud' ? .7 : 1.5) * u, bend: 0, t0: end });
    }

    for (var i = 0; i < count; i++) {
      var m = mLo + Math.round((i + .5) / count * (mHi - mLo) + (rand() - .5) * 2);
      var n = Math.ceil(H / u) + 1; if ((n - m) % 2) n++;                   // root just below the bottom edge
      grow(clamp(m, mLo, mHi), n, rand() < .5 ? -1 : 1, 99, 0, i * .45 + rand() * .6, Math.max(1.25, u / 7), H - (H - top) * (i ? .6 + rand() * .4 : 1));   // the first climbs all the way
    }
    var tEnd = 0;
    stems.forEach(function (s) { tEnd = Math.max(tEnd, s.birth + s.len / v); });
    return { stems: stems, decor: decor, rails: rails, v: v, tEnd: tEnd + 1.2 };
  }

  function curl(x, y, a, turn, t0, u) {    // a tendril: curvature rises as it winds
    var pts = [[x, y]], r0 = u * .45, total = TAU * 1.3, th = 0, step = Math.max(.5, u / 24);
    while (th < total) {
      var r = Math.max(r0 * (1 - th / total * .75), 1);
      a += turn * step / r; th += step / r;
      x += Math.cos(a) * step; y += Math.sin(a) * step; pts.push([x, y]);
    }
    return { k: 'curl', pts: pts, t0: t0, x: x, y: y };
  }

  // ---- Drawing ----------------------------------------------------------------
  function leafPath(c, L, bend) {           // a leaf along +x, its base at 0
    var w = L * .42;
    c.moveTo(0, 0);
    c.bezierCurveTo(L * .2, -w, L * .68, -w * .86 + bend * L * .3, L, bend * L * .7);
    c.bezierCurveTo(L * .72, w * .72 + bend * L * .3, L * .28, w * .95, 0, 0);
  }
  function drawDecor(c, d, g, col, u) {
    if (d.k === 'curl') {
      var n = Math.max(2, Math.round(d.pts.length * g));
      c.beginPath(); c.moveTo(d.pts[0][0], d.pts[0][1]);
      for (var i = 1; i < n; i++) c.lineTo(d.pts[i][0], d.pts[i][1]);
      c.strokeStyle = col.stem; c.lineWidth = 1; c.stroke();
      return;
    }
    var s = easeOut(g); if (s < .02) return;
    c.save(); c.translate(d.x, d.y); c.rotate(d.a); c.scale(s, s); c.lineWidth = 1 / s;
    var ink = d.k === 'leaf' ? col.leaf : col.bloom;
    c.beginPath();
    if (d.k === 'leaf') leafPath(c, d.size, d.bend);
    else if (d.k === 'bud') c.ellipse(d.size * .55, 0, d.size * .5, d.size * .3, 0, 0, TAU);
    else for (var k = 0; k < 5; k++) {
      var a = k * TAU / 5 + .3, cx = u * .3, R = d.size;
      c.moveTo(cx, 0);
      c.bezierCurveTo(cx + Math.cos(a - .6) * R, Math.sin(a - .6) * R, cx + Math.cos(a - .25) * R * 1.05, Math.sin(a - .25) * R * 1.05, cx + Math.cos(a) * R, Math.sin(a) * R);
      c.bezierCurveTo(cx + Math.cos(a + .25) * R * 1.05, Math.sin(a + .25) * R * 1.05, cx + Math.cos(a + .6) * R, Math.sin(a + .6) * R, cx, 0);
    }
    c.fillStyle = col.bg; c.fill();
    c.globalAlpha = d.k === 'bud' ? .9 : .16; c.fillStyle = ink; c.fill(); c.globalAlpha = 1;
    c.strokeStyle = ink; c.stroke();
    if (d.k === 'leaf') { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(d.size * .5, d.bend * d.size * .25, d.size * .86, d.bend * d.size * .6); c.globalAlpha = .55; c.stroke(); c.globalAlpha = 1; }
    if (d.k === 'flower') { c.beginPath(); c.arc(u * .3, 0, u / 4, 0, TAU); c.fillStyle = ink; c.fill(); }
    c.restore();
  }

  function mount(canvas, options) {
    var o = Object.assign({ seed: 1, edge: 'none', band: 12, reach: .9, density: 1, curl: 1, leaves: 1, blooms: 1, speed: 8, lattice: 'full' }, options || {});
    o.colors = Object.assign({}, COLORS, o.colors || {});
    var ctx = canvas.getContext('2d'), probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    canvas.appendChild(probe);               // inside the canvas: never rendered, but it reads tokens in context
    var col = {}, plot = null, u = 0, W = 0, H = 0, dpr = 1, cache = null;
    var time = 0, last = 0, raf = 0, seen = false, playing = false, done = false;

    function cellPx() { return +o.cell || (window.Trellis && window.Trellis.cell ? window.Trellis.cell() : 12); }
    function colors() {
      Object.keys(o.colors).forEach(function (k) { probe.style.color = 'var(' + o.colors[k] + ')'; col[k] = getComputedStyle(probe).color; });
    }
    function layout() {
      var r = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1; u = cellPx(); W = r.width; H = r.height;
      var bw = Math.round(W * dpr), bh = Math.round(H * dpr);
      if (canvas.width !== bw) canvas.width = bw;
      if (canvas.height !== bh) canvas.height = bh;
      plot = W > 0 && H > 0 && u > 0 ? plan(W, H, u, o) : null;
      colors(); paintLattice();
    }
    function paintLattice() {                  // the laths, drawn once: 1 line wide, fading from the edge
      cache = null;
      if (o.lattice !== 'full' || !plot) return;
      cache = document.createElement('canvas'); cache.width = canvas.width; cache.height = canvas.height;
      var c = cache.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.beginPath();
      for (var b = -Math.ceil(W / 2 / (2 * u)) * 2 * u; b <= H + W / 2; b += 2 * u) {
        c.moveTo(0, b); c.lineTo(W, b + W / 2); c.moveTo(0, b); c.lineTo(W, b - W / 2);
      }
      c.strokeStyle = col.lattice; c.lineWidth = 1; c.globalAlpha = .7; c.stroke();
      if (o.edge === 'left' || o.edge === 'right') {
        var span = Math.min(W, o.band * u * 1.4), g = o.edge === 'right' ? c.createLinearGradient(W, 0, W - span, 0) : c.createLinearGradient(0, 0, span, 0);
        g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.globalCompositeOperation = 'destination-in'; c.globalAlpha = 1; c.fillStyle = g; c.fillRect(0, 0, W, H);
      }
    }
    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!plot) return;
      if (cache) ctx.drawImage(cache, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      var t = time, v = plot.v;
      if (o.lattice !== 'none') plot.rails.forEach(function (r) {   // the laths a vine rests on come forward as it passes
        var g = clamp((t - r.t0) / (r.t1 - r.t0 + .3), 0, 1); if (!g) return;
        ctx.globalAlpha = g * .8; ctx.strokeStyle = col.rail; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(r.x0, r.y0); ctx.lineTo(r.x0 + (r.x1 - r.x0) * g, r.y0 + (r.y1 - r.y0) * g); ctx.stroke();
      });
      ctx.globalAlpha = 1; ctx.strokeStyle = col.stem;
      plot.stems.forEach(function (s) {
        var reach = (t - s.birth) * v, P = s.pts; if (reach <= 0) return;
        for (var i = 1, from = 0; i < P.length && P[i - 1].s < reach; i++) {
          if (i - from < 6 && i < P.length - 1 && P[i].s < reach) continue;      // a few samples a stroke, each a width
          ctx.beginPath(); ctx.moveTo(P[from].x, P[from].y);
          for (var j = from + 1; j <= i; j++) {
            if (P[j].s <= reach) ctx.lineTo(P[j].x, P[j].y);
            else { var k = (reach - P[j - 1].s) / (P[j].s - P[j - 1].s); ctx.lineTo(P[j - 1].x + (P[j].x - P[j - 1].x) * k, P[j - 1].y + (P[j].y - P[j - 1].y) * k); }
          }
          ctx.lineWidth = s.w0 + (s.w1 - s.w0) * P[from].s / s.len; ctx.stroke(); from = i;
        }
      });
      plot.decor.forEach(function (d) {
        var g = (t - d.t0) / (d.k === 'curl' ? .9 : d.k === 'leaf' ? .6 : .9);
        if (g > 0) drawDecor(ctx, d, Math.min(g, 1), col, u);
        if (d.k === 'curl' && g >= 1) { ctx.beginPath(); ctx.arc(d.x, d.y, u / 8, 0, TAU); ctx.fillStyle = col.stem; ctx.fill(); }
      });
    }
    function frame(now) {
      raf = 0;
      if (!playing) return;
      time += Math.min(.05, (now - (last || now)) / 1000); last = now;
      draw();
      if (time >= plot.tEnd) { done = true; playing = false; return; }
      raf = requestAnimationFrame(frame);
    }
    function play() {
      if (still.matches || !plot) { finish(); return; }
      if (playing || done) return;
      playing = true; last = 0; raf = requestAnimationFrame(frame);
    }
    function pause() { playing = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    function finish() { pause(); if (plot) time = plot.tEnd; done = true; draw(); }

    var queued = 0;
    function refresh() {                      // size, cell or theme changed: same seed, regrown to the same moment
      if (queued) return;
      queued = requestAnimationFrame(function () { queued = 0; layout(); if (done || still.matches) finish(); else draw(); });
    }
    var ro = 'ResizeObserver' in window ? new ResizeObserver(refresh) : null;
    if (ro) ro.observe(canvas);
    var mo = new MutationObserver(refresh);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
    var dark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (dark) dark.addEventListener('change', refresh);
    var onStill = function () { if (still.matches) finish(); };
    still.addEventListener && still.addEventListener('change', onStill);
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      var on = es[es.length - 1].isIntersecting;
      if (on) { seen = true; play(); } else pause();
    }) : null;

    layout();
    if (still.matches) finish(); else { draw(); if (io) io.observe(canvas); else play(); }

    return {
      regrow: function (seed) { if (seed != null) o.seed = seed; pause(); time = 0; done = false; layout(); draw(); if (seen || !io) play(); },
      finish: finish, pause: pause, play: play, redraw: refresh,
      destroy: function () {
        pause(); if (ro) ro.disconnect(); if (io) io.disconnect(); mo.disconnect();
        if (dark) dark.removeEventListener('change', refresh);
        still.removeEventListener && still.removeEventListener('change', onStill);
        probe.remove(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }

  window.TrellisVines = { mount: mount };
})();
