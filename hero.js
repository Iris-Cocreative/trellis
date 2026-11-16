/* Trellis specimen · the hero's drawings
   Four cards, each drawing what it names inside itself, and a thread that runs
   the channels between them. Everything here sets variables (--k, --r, --w),
   one attribute (data-look) and two canvases; specimen.css does the rest.
   It runs while the cards are on screen, stops when they are not, and shows
   each drawing at rest for readers who ask for less motion. Not part of the
   package. */
(function () {
  'use strict';
  var page = document.getElementById('top');
  var wrap = document.querySelector('.seeds-wrap');
  if (!page || !wrap) return;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var TAU = Math.PI * 2;

  function cell() { return window.Trellis && Trellis.cell ? Trellis.cell() : 12; }
  var probe = document.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  wrap.appendChild(probe);
  function ink(v) { probe.style.color = 'var(' + v + ')'; return getComputedStyle(probe).color; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(x) { x = clamp(x, 0, 1); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function round(v, d) { var k = Math.pow(10, d); return Math.round(v * k) / k; }

  // A value that rests at each stop and eases to the next: stops are
  // [value, seconds held, seconds to reach the next].
  function track(stops) {
    var total = 0;
    stops.forEach(function (s) { total += s[1] + s[2]; });
    return function (t) {
      t = t % total;
      for (var i = 0; i < stops.length; i++) {
        var s = stops[i], next = stops[(i + 1) % stops.length];
        if (t < s[1]) return { v: s[0], i: i, moving: false };
        t -= s[1];
        if (t < s[2]) { var p = ease(t / s[2]); return { v: s[0] + (next[0] - s[0]) * p, i: p < .5 ? i : (i + 1) % stops.length, moving: true }; }
        t -= s[2];
      }
      return { v: stops[0][0], i: 0, moving: false };
    };
  }

  var art = {};
  document.querySelectorAll('[data-art]').forEach(function (el) { art[el.dataset.art] = el; });

  // Everything a frame needs from the page is measured here, once, and again
  // only when the page changes (a resize, the theme, the cell). A frame itself
  // reads no layout and no computed style: asking for either sixty times a
  // second makes the browser lay the whole page out sixty times a second.
  var G = { u: 12, dpr: 1, text: '#000', group: '#000', cellsW: 0, cellsH: 0, ctxMax: 14, threadW: 0, threadH: 0 }, dirty = true;
  function measure() {
    if (!dirty) return;
    dirty = false;
    G.u = cell(); G.dpr = window.devicePixelRatio || 1;
    G.text = ink('--text'); G.group = ink('--kind-group');
    if (art.cells) { G.cellsW = art.cells.clientWidth; G.cellsH = art.cells.clientHeight; }
    if (art.context) G.ctxMax = Math.max(8, Math.min(14, Math.floor(art.context.clientWidth / G.u)));
    if (thread) { G.threadW = thread.clientWidth; G.threadH = thread.clientHeight; buildThread(); }
  }
  function readout(el, text) { var r = el.querySelector('[data-art-readout]'); if (r && r.textContent !== text) r.textContent = text; }

  // ---- Cells ----------------------------------------------------------------
  // The cell breathes: at rest it is the page's own, then it is smaller, then
  // larger, and every shape made of cells follows. Between breaths a line runs
  // along a grid line the shapes share: an edge they keep together.
  var cellK = track([[1, 4.5, 1.3], [.75, 1.8, 1.6], [7 / 6, 1.8, 1.3]]);
  var SWEEPS = [['h', 0, 0, 13], ['v', 5, 0, 4], ['h', 5, 0, 11], ['v', 0, 0, 8], ['h', 4, 0, 11], ['v', 8, 0, 9], ['v', 3, 5, 9]];
  function drawCells(t) {
    var el = art.cells; if (!el) return;
    var k = still.matches ? 1 : cellK(t).v, u = G.u, c = u * k;
    el.style.setProperty('--k', round(k, 4));
    readout(el, '1 cell = ' + round(c, 1) + 'px');
    var cv = el.querySelector('canvas'), dpr = G.dpr;
    var W = G.cellsW, H = G.cellsH;
    if (cv.width !== Math.round(W * dpr)) cv.width = Math.round(W * dpr);
    if (cv.height !== Math.round(H * dpr)) cv.height = Math.round(H * dpr);
    var ctx = cv.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    // The card's grid, a device pixel a line, as the page's grid is drawn.
    ctx.fillStyle = G.text; ctx.globalAlpha = .1;
    for (var x = 0; x <= W + .5; x += c) ctx.fillRect(Math.round(x * dpr), 0, 1, cv.height);
    for (var y = 0; y <= H + .5; y += c) ctx.fillRect(0, Math.round(y * dpr), cv.width, 1);
    if (still.matches) { ctx.globalAlpha = 1; return; }
    // One sweep every three seconds: it draws along the line, then fades.
    var n = Math.floor(t / 3), s = SWEEPS[n % SWEEPS.length], lt = t - n * 3;
    var p = ease(lt / 1.1), fade = 1 - clamp((lt - 1.5) / .9, 0, 1);
    if (fade > 0) {
      var a = s[2] * c, b = a + (s[3] - s[2]) * c * p, at = s[1] * c, lw = Math.max(1, Math.round(dpr));
      ctx.fillStyle = G.group; ctx.globalAlpha = .9 * fade;
      if (s[0] === 'h') ctx.fillRect(Math.round(a * dpr), Math.round(at * dpr), Math.round((b - a) * dpr), lw);
      else ctx.fillRect(Math.round(at * dpr), Math.round(a * dpr), lw, Math.round((b - a) * dpr));
    }
    ctx.globalAlpha = 1;
  }

  // ---- Ratios ---------------------------------------------------------------
  var RATIOS = [[1.2, 'minor third'], [1.333, 'fourth'], [1.414, 'root two'], [1.618, 'golden']];
  var ratioR = track(RATIOS.map(function (r) { return [r[0], 2.6, 1.1]; }));
  function drawRatio(t) {
    var el = art.ratio; if (!el) return;
    var s = still.matches ? { v: 1.333, i: 1 } : ratioR(t);
    el.style.setProperty('--r', round(s.v, 4));
    readout(el, '× ' + s.v.toFixed(3) + (s.moving ? '' : ' ' + RATIOS[s.i][1]));
  }

  // ---- Context --------------------------------------------------------------
  var ctxW = null, ctxMax = 0;
  function drawContext(t) {
    var el = art.context; if (!el) return;
    var max = G.ctxMax;
    if (max !== ctxMax) { ctxMax = max; ctxW = track([[max, 2.4, 1.5], [max - 6, 2.2, 1.2], [max - 3, 2.2, 1.2]]); }
    var w = still.matches ? max : ctxW(t).v;
    el.style.setProperty('--w', round(w, 3));
    readout(el, Math.round(w) + ' cells wide');
  }

  // ---- Expression -------------------------------------------------------------
  var LOOKS = [['neutral', 'Neutral'], ['quarry', 'Quarry'], ['almanac', 'Almanac']];
  function drawExpression(t) {
    var el = art.expression; if (!el) return;
    var i = still.matches ? 0 : Math.floor(t / 3.4) % LOOKS.length;
    if (el.dataset.look !== LOOKS[i][0]) el.dataset.look = LOOKS[i][0];
    readout(el, LOOKS[i][1]);
  }

  // ---- The thread -------------------------------------------------------------
  // Two cells part the cards, so a cell line runs down the middle of every
  // channel between them, and another a cell outside the row. The thread keeps
  // to those lines: up one channel, over a card, down the next, under the next
  // card, turning each corner on a radius of two cells. It draws, then fades.
  var thread = document.getElementById('seed-thread'), pts = [], len = 0;
  function buildThread() {
    var u = G.u, R = 2 * u, cr = thread.getBoundingClientRect();
    var cards = [].slice.call(wrap.querySelectorAll('.seeds > .card')).map(function (c) {
      var r = c.getBoundingClientRect();
      return { l: r.left - cr.left, t: r.top - cr.top, r: r.right - cr.left, b: r.bottom - cr.top };
    });
    pts = []; len = 0;
    // The thread needs a cell either side of the cards: three cells of canvas.
    if (!cards.length || cards[0].l < 2 * u - 1) return;
    var rows = [];
    cards.forEach(function (c) {
      var row = rows.filter(function (r) { return Math.abs(r[0].t - c.t) < 2; })[0];
      if (row) row.push(c); else rows.push([c]);
    });
    function push(x, y, gap) {
      var last = pts[pts.length - 1];
      if (last && !gap) len += Math.hypot(x - last.x, y - last.y);
      pts.push({ x: x, y: y, s: len, gap: !!gap });
    }
    function line(x, y) {
      var last = pts[pts.length - 1], d = Math.hypot(x - last.x, y - last.y), n = Math.max(1, Math.ceil(d / 3));
      for (var i = 1; i <= n; i++) push(last.x + (x - last.x) * i / n, last.y + (y - last.y) * i / n);
    }
    function arc(cx, cy, a0, a1) {
      var n = Math.max(6, Math.ceil(Math.abs(a1 - a0) * R / 3));
      for (var i = 1; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; push(cx + Math.cos(a) * R, cy + Math.sin(a) * R); }
    }
    rows.forEach(function (row) {
      row.sort(function (a, b) { return a.l - b.l; });
      var T = Math.min.apply(null, row.map(function (c) { return c.t; })) - u;
      var B = Math.max.apply(null, row.map(function (c) { return c.b; })) + u;
      var xs = [row[0].l - u];
      for (var i = 1; i < row.length; i++) xs.push((row[i - 1].r + row[i].l) / 2);
      xs.push(row[row.length - 1].r + u);
      push(xs[0], B, true);
      var up = true;
      for (var j = 0; j < row.length; j++) {
        var x0 = xs[j], x1 = xs[j + 1];
        if (up) {                                     // up the channel, over the card, into the next channel
          line(x0, T + R); arc(x0 + R, T + R, Math.PI, Math.PI * 1.5);
          line(x1 - R, T); arc(x1 - R, T + R, Math.PI * 1.5, TAU);
        } else {                                      // down the channel, under the card
          line(x0, B - R); arc(x0 + R, B - R, Math.PI, Math.PI * .5);
          line(x1 - R, B); arc(x1 - R, B - R, Math.PI * .5, 0);
        }
        up = !up;
      }
      line(xs[row.length], up ? T : B);
    });
  }
  function drawThread(t) {
    if (!thread) return;
    var dpr = G.dpr, W = G.threadW, H = G.threadH;
    if (thread.width !== Math.round(W * dpr)) thread.width = Math.round(W * dpr);
    if (thread.height !== Math.round(H * dpr)) thread.height = Math.round(H * dpr);
    var ctx = thread.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (pts.length < 2) return;
    var u = G.u, color = G.group;
    ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.fillStyle = color;
    function stroke(from, to, alpha) {
      if (alpha <= .005) return;
      ctx.globalAlpha = alpha; ctx.beginPath();
      var started = false;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (p.s < from || p.s > to) { started = false; continue; }
        if (!started || p.gap) { ctx.moveTo(p.x + .5, p.y + .5); started = true; } else ctx.lineTo(p.x + .5, p.y + .5);
      }
      ctx.stroke();
    }
    if (still.matches) { stroke(0, len, .22); ctx.globalAlpha = 1; return; }
    // The head travels 36 cells a second, with 120 cells of tail behind it that
    // fades toward its end; then a rest, and it sets off again.
    var speed = 36 * u, tail = 120 * u, period = (len + tail) / speed + 2;
    var head = (t % period) * speed;
    var BANDS = 20;
    for (var b = 0; b < BANDS; b++) {
      var hi = head - tail * b / BANDS, lo = head - tail * (b + 1) / BANDS;
      stroke(Math.max(0, lo), Math.min(len, hi), .9 * Math.pow(1 - b / BANDS, 1.3));
    }
    if (head <= len) {                                 // the point that draws it
      for (var i = 0; i < pts.length; i++) if (pts[i].s >= head) break;
      var hp = pts[Math.min(i, pts.length - 1)];
      ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(hp.x + .5, hp.y + .5, u / 4, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ---- One clock, running only while the cards are on screen ------------------
  var raf = 0, t0 = 0, seen = true;
  function frame(now) {
    if (!t0) t0 = now;
    var t = (now - t0) / 1000;
    measure();
    drawCells(t); drawRatio(t + 1.2); drawContext(t + .6); drawExpression(t + 2); drawThread(t);
    raf = still.matches || !seen ? 0 : requestAnimationFrame(frame);
  }
  function play() { if (!raf) raf = requestAnimationFrame(frame); }
  function changed() { dirty = true; play(); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { seen = es[es.length - 1].isIntersecting; if (seen) play(); }, { rootMargin: '10% 0px' }).observe(wrap);
  }
  if ('ResizeObserver' in window) new ResizeObserver(changed).observe(wrap);
  window.addEventListener('resize', changed);
  if (still.addEventListener) still.addEventListener('change', changed);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(changed);
  // The theme and the cell change from the bar above: redraw at rest states too.
  new MutationObserver(changed).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'data-product'] });
  play();
})();
