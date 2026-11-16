/* Trellis specimen · the ratio playground
   Seven values set the type ratio: H1, body and the label in a wide space, the
   ratio in a wide space and in a narrow one, and the two spaces. The rest is
   worked out from them, and shown beside its sum:

     the half step   √ratio, at each end            the text sizes (xs to xl)
                                                    step out from body by it
     body, narrow    body ÷ a narrow half step      18 ÷ √1.2 = 16.4
     H1, narrow      as many steps above body as    64 is 4.41 steps of 1.333
                     in a wide space                above 18, and 16.4 × 1.2^4.41
                                                    = 36.7
     label, narrow   the label, unchanged           12

   So a narrow space shrinks the step and keeps every role's place around
   body: as many headings stay above body text at one end as at the other.

   Core works the same five out from the same seven (D93), on :root. A box
   that sets one of the seven does not make core work the five out again,
   since a variable is worked out where it is declared. So the playground
   writes all twelve (--h1-min to --rp-max, --c-min and --c-max) onto three sample
   boxes, so what the boxes show is the real type roles, sized by the browser:
     wide     every role at its wide end. A wide space does not fit in a
              column, so the stylesheet moves this box's two spaces below any
              width it can have (specimen.css, .play-box.cc-wide).
     narrow   a box as wide as the narrow space, so every role is at its
              narrow end for real.
     live     a box as wide as the "This box" slider says. The stage cuts off
              what runs past the column; the type still answers to all of it.
   The page keeps its own knobs unless "Apply to the whole page" puts these on
   :root. Nothing is stored.
 */
(function () {
  'use strict';
  var M = window.TrellisMath, root = document.documentElement;
  var play = document.querySelector('[data-play]');
  if (!play || !M) return;
  var one = function (s) { return play.querySelector(s); };
  var each = function (s, f) { Array.prototype.forEach.call(play.querySelectorAll(s), f); };
  var boxes = { wide: one('[data-play-box="wide"]'), narrow: one('[data-play-box="narrow"]'), live: one('[data-play-box="live"]') };
  var stage = one('[data-play-stage]'), scrub = one('[data-play-space]'), where = one('[data-play-where]');
  var whole = one('[data-play-whole]'), out = one('[data-play-export]');
  var inputs = {}, outs = {}, sums = {};
  each('[data-play-in]', function (i) { inputs[i.dataset.playIn] = i; });
  each('[data-play-out]', function (o) { outs[o.dataset.playOut] = o; });
  each('[data-play-sum]', function (o) { sums[o.dataset.playSum] = o; });

  var REM = 16;          // a knob is in rem: 16 points at the default text size
  var SMALL = 10.95;     // under about 11px a size is flagged
  var GAP = 160;         // the wide space stays this far past the narrow one
  // Two values that can't cross: the one being dragged takes the other with it.
  var PUSH = { rn: ['rw', 1, 0], rw: ['rn', -1, 0], sn: ['sw', 1, GAP], sw: ['sn', -1, GAP] };
  var KNOBS = ['h1-min', 'h1-max', 'rh-min', 'rh-max', 'body-min', 'body-max', 'rp-min', 'rp-max', 'label-min', 'label-max'];
  var SPACES = ['c-min', 'c-max'];
  var SEVEN = ['h1-max', 'body-max', 'label-max', 'rh-max', 'rh-min', 'c-min', 'c-max'];   // what a product sets
  var ROLES = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'xl', 'lg', 'body', 'sm', 'xs', 'eyebrow', 'label'];
  var SAMPLE = { h1: 'Trellis', h2: 'Seed library', h3: 'Garden Stewards', h4: 'Upcoming gatherings', h5: 'Resources and gallery', h6: 'Members of this circle',
    xl: 'A living map of people.', lg: 'Join a circle near you.', body: 'Circles are small groups.',
    sm: 'Posted in the Seed Library.', xs: 'Last active 2 hours ago', eyebrow: 'Seed library', label: 'Seeking · Offering' };
  var COUNT = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  var num = function (v, d) { return String(+(+v).toFixed(d == null ? 3 : d)); };
  var px = function (v) { return num(v, 1) + 'px'; };

  // The seven values, in points and ratios; and the live box's space, which is
  // the column's own until the slider is moved.
  var state = {}, space = null, touched = false, applied = false;
  // Where settle.js holds text at whole cells (Safari, today), a block whose
  // type shrinks keeps its old height, and nothing tells the runtime: it
  // watches for text that changes, not for a knob set on a box. So after it
  // has changed a knob or the live box, the playground writes each sample's
  // text back to it, which is the change the runtime measures again for.
  // Only the samples are measured, not the page (Trellis.all() would be).
  var stale = false;
  function remeasure() {
    [boxes.wide, boxes.narrow, boxes.live].forEach(function (box) {
      Array.prototype.forEach.call(box.querySelectorAll('p'), function (p) {
        var t = p.firstChild;
        if (t && t.nodeType === 3) t.data = t.data;
      });
    });
  }

  // ---- The model -------------------------------------------------------------
  // H1's place: how many steps of the wide ratio it sits above body.
  function place(s) { return Math.log(s.h1 / s.body) / Math.log(s.rw); }
  function derive(s) {
    var body = s.body / Math.sqrt(s.rn);
    return {
      'h1-max': s.h1 / REM, 'h1-min': body * Math.pow(s.rn, place(s)) / REM,
      'rh-max': s.rw, 'rh-min': s.rn,
      'body-max': s.body / REM, 'body-min': body / REM,
      'rp-max': Math.sqrt(s.rw), 'rp-min': Math.sqrt(s.rn),
      'label-max': s.label / REM, 'label-min': s.label / REM,
      'c-min': s.sn / REM, 'c-max': s.sw / REM
    };
  }
  // A slider holds a value to its own step and ends, so the state is read back from it.
  function put(k, v) { inputs[k].value = v; state[k] = +inputs[k].value; }
  // The seven values the page itself has: core's, or a product layer's.
  function read() {
    var cs = getComputedStyle(root), K = function (k) { return parseFloat(cs.getPropertyValue('--' + k)); };
    put('h1', K('h1-max') * REM); put('body', K('body-max') * REM); put('label', K('label-max') * REM);
    put('rw', K('rh-max')); put('rn', K('rh-min'));
    put('sn', K('c-min') * REM); put('sw', K('c-max') * REM);
  }

  // ---- The samples: the real classes, built once ---------------------------
  ['wide', 'narrow'].forEach(function (end) {
    var list = boxes[end].querySelector('[data-play-lines]');
    ROLES.forEach(function (r) {
      var line = document.createElement('div');
      line.className = 'play-line';
      line.dataset.role = r;
      line.innerHTML = '<span class="play-meta"><b>' + r + '</b> <span data-size></span><span class="bar" aria-hidden="true"></span></span><p class="t-' + r + '">' + SAMPLE[r] + '</p>';
      list.appendChild(line);
    });
  });

  function words(list) { return list.length < 2 ? list.join('') : list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1]; }
  function say(el, text) { if (el && el.textContent !== text) el.textContent = text; }

  // ---- What the browser made of it -------------------------------------------
  function draw() {
    if (stale) { stale = false; remeasure(); }
    var k = parseFloat(getComputedStyle(root).fontSize) / REM;   // the reader's text size
    ['wide', 'narrow'].forEach(function (end) {
      var sizes = {}, under = [], small = [], lands = [];
      var lines = boxes[end].querySelectorAll('.play-line');
      Array.prototype.forEach.call(lines, function (line) { sizes[line.dataset.role] = parseFloat(getComputedStyle(line.lastElementChild).fontSize) / k; });
      Array.prototype.forEach.call(lines, function (line) {
        var r = line.dataset.role, v = sizes[r];
        // A heading whose own step is under body's size is held there (D89); one
        // whose step is body's size lands on it by the ratio, and is not held.
        var own = M.isHeading(r) ? sizes.h1 / Math.pow(end === 'wide' ? state.rw : state.rn, +r.slice(1) - 1) : 0;
        var sunk = M.isHeading(r) && own < sizes.body - .05, tiny = v < SMALL;
        if (sunk) under.push(r);
        if (M.isHeading(r) && r !== 'h1' && Math.abs(own - sizes.body) <= .05) lands.push(r);
        if (tiny) small.push(r);
        say(line.querySelector('[data-size]'), num(v, 1));
        line.querySelector('.bar').style.setProperty('--w', (v * k).toFixed(2) + 'px');
        if (tiny) line.dataset.flag = 'small'; else if (sunk) line.dataset.flag = 'held'; else delete line.dataset.flag;
      });
      var fit = 6 - under.length - lands.length;
      var at = end === 'wide' ? 'At ' + num(state.rw) + ' H1 is ' + num(place(state), 2) + ' steps above body: '
        : 'At ' + num(state.rn) + ' the steps are smaller and the places are the same: ';
      var a = !under.length && !lands.length ? at + 'all six headings are larger than body text.'
        : at + (fit === 1 ? 'only h1 is' : fit ? COUNT[fit] + ' headings are' : 'no heading is') + ' larger than body text' +
          (lands.length ? ', ' + words(lands) + ' lands on its size by the ratio' : '') +
          (under.length ? ', and ' + words(under) + (under.length > 1 ? ' are' : ' is') + ' held at its size.' : '.');
      var b = small.length ? 'Under 11px: ' + words(small) + '.' : 'Nothing is under 11px.';
      say(one('[data-play-note="' + end + '"]'), a + ' ' + b);
    });

    // The live box. Its space is its content box, as a container's is.
    var cs = getComputedStyle(boxes.live), pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    var fit = stage.clientWidth - pad;
    if (fit > 0 && stage.dataset.fit !== String(fit)) { stage.dataset.fit = String(fit); stage.style.setProperty('--play-fit', fit + 'px'); }
    var s = space == null ? fit / k : space;
    if (space == null && fit > 0) scrub.value = Math.round(s);
    say(outs.space, Math.round(s) + 'px');
    scrub.setAttribute('aria-valuetext', Math.round(s) + ' pixels');
    fill(scrub);
    drawGraph(s);
    var t = (s - state.sn) / (state.sw - state.sn);
    say(where, (t < 0 ? 'Narrower than the narrow space, so every size holds at its narrow end.'
      : t > 1 ? 'Wider than the wide space, so every size holds at its wide end.'
      : Math.round(t * 100) + '% of the way from the narrow space to the wide one, and so is every size.') +
      (s * k > fit + .5 ? ' The box runs past this column; its type answers to its whole width.' : ''));
  }

  // How far along its track a slider's thumb is, for the track's ink.
  function fill(i) {
    var lo = +i.min, hi = +i.max;
    i.style.setProperty('--range-at', num((+i.value - lo) / (hi - lo), 4));
  }

  function exportText() {
    var k = derive(state);
    var lines = SEVEN.map(function (n) { return '    --' + n + ': ' + num(k[n], 4) + ';'; });
    return '/* A product layer, from the Trellis specimen\'s ratio playground: the seven values.\n   Core works the other five out. Load it after core.css and put\n   data-product="yours" on <html>. */\n' +
      '@layer trellis.product {\n  :root[data-product="yours"] {\n' + lines.join('\n') + '\n  }\n}\n';
  }

  // ---- The graph: every role's size against the width of its space -----------
  // Three handles: the narrow space, the wide space, and the live box's own
  // width. Each moves a hidden range input, which holds the value to its step
  // and its ends and tells the rest of the playground, as a slider would.
  var graph = one('[data-play-graph]'), SVG = 'http://www.w3.org/2000/svg', G = null;
  var HANDLES = { sn: ['The narrow space', inputs.sn, 8], sw: ['The wide space', inputs.sw, 8], space: ['This box', scrub, 8] };
  function svg(n, a, parent) { var e = document.createElementNS(SVG, n); for (var k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
  function kind(r) { return M.isHeading(r) ? 'heading' : /^(label|eyebrow)$/.test(r) ? 'label' : 'text'; }
  // A set of knobs as math.js takes them, in points.
  function seedOf(k) {
    var pair = function (n) { return [k[n + '-min'] * REM, k[n + '-max'] * REM]; };
    return { type: { spaceNarrow: k['c-min'] * REM, spaceWide: k['c-max'] * REM, h1: pair('h1'), body: pair('body'), label: pair('label'),
      headingRatio: [k['rh-min'], k['rh-max']], paragraphRatio: [k['rp-min'], k['rp-max']] } };
  }
  function setHandle(n, v) {
    var i = HANDLES[n][1];
    i.value = v;
    i.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function buildGraph() {
    G = { curves: {}, names: {}, handles: {}, x: function () { return 0; } };
    G.zone = svg('rect', { 'class': 'play-zone' }, graph);
    G.base = svg('line', { 'class': 'play-axis' }, graph);
    ROLES.forEach(function (r) {
      G.curves[r] = svg('polyline', { 'class': 'play-curve cc-' + kind(r) }, graph);
      G.names[r] = svg('text', { 'class': 'play-name' }, graph);
      G.names[r].textContent = r;
    });
    Object.keys(HANDLES).forEach(function (n) {
      var lo = +HANDLES[n][1].min, hi = +HANDLES[n][1].max;
      var g = svg('g', { 'class': 'play-handle cc-' + n, role: 'slider', tabindex: '0', 'aria-label': HANDLES[n][0], 'aria-orientation': 'horizontal', 'aria-valuemin': lo, 'aria-valuemax': hi }, graph);
      svg('rect', { 'class': 'play-hit' }, g); svg('line', { 'class': 'play-rule' }, g); svg('rect', { 'class': 'play-grip' }, g); svg('text', { 'class': 'play-tick' }, g);
      G.handles[n] = g;
      var move = function (e) { setHandle(n, Math.round(G.x(e.clientX - graph.getBoundingClientRect().left))); };
      g.addEventListener('pointerdown', function (e) { g.setPointerCapture(e.pointerId); move(e); e.preventDefault(); g.focus(); });
      g.addEventListener('pointermove', function (e) { if (g.hasPointerCapture(e.pointerId)) move(e); });
      g.addEventListener('keydown', function (e) {
        var step = HANDLES[n][2] * (e.shiftKey ? 5 : 1), v = +HANDLES[n][1].value;
        var to = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? v - step : e.key === 'ArrowRight' || e.key === 'ArrowUp' ? v + step : e.key === 'Home' ? lo : e.key === 'End' ? hi : null;
        if (to == null) return;
        e.preventDefault();
        setHandle(n, to);
      });
    });
  }
  // s is the live box's space. Every role is three straight pieces: held at its
  // narrow end, rising between the two spaces, held at its wide end.
  function drawGraph(s) {
    if (!graph) return;
    if (!G) buildGraph();
    var w = graph.clientWidth, h = graph.clientHeight, u = window.Trellis && Trellis.cell ? Trellis.cell() : 12;
    if (!(w > 0 && h > 0)) return;
    var k = derive(state), seed = seedOf(k), lo = +scrub.min, hi = +scrub.max;
    var left = u, right = u * 6, top = u * 3, bottom = u;
    var ymax = Math.max(k['h1-max'], k['h1-min']) * REM * 1.04;
    var X = function (v) { return left + (v - lo) / (hi - lo) * (w - left - right); };
    var Y = function (v) { return h - bottom - v / ymax * (h - top - bottom); };
    G.x = function (px) { return lo + (px - left) / (w - left - right) * (hi - lo); };
    graph.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var set = function (e, a) { for (var n in a) e.setAttribute(n, typeof a[n] === 'number' ? +a[n].toFixed(2) : a[n]); };
    set(G.zone, { x: X(state.sn), y: top, width: Math.max(0, X(state.sw) - X(state.sn)), height: h - top - bottom });
    set(G.base, { x1: left, x2: w - right, y1: h - bottom, y2: h - bottom });
    var tags = [];
    ROLES.forEach(function (r) {
      var pts = [lo, state.sn, state.sw, hi].map(function (x) { return X(x).toFixed(1) + ',' + Y(M.typeSize(r, x, null, seed)).toFixed(1); });
      G.curves[r].setAttribute('points', pts.join(' '));
      tags.push([r, Y(M.typeSize(r, hi, null, seed))]);
    });
    // Names at the right end, pushed apart where the small roles crowd.
    tags.sort(function (a, b) { return a[1] - b[1]; });
    for (var i = 1; i < tags.length; i++) tags[i][1] = Math.max(tags[i][1], tags[i - 1][1] + u * .9);
    var over = tags[tags.length - 1][1] - (h - bottom);
    if (over > 0) tags.forEach(function (t) { t[1] -= over; });
    tags.forEach(function (t) { set(G.names[t[0]], { x: w - right + u * .75, y: t[1] + u * .3 }); });
    var at = { sn: state.sn, sw: state.sw, space: s };
    Object.keys(at).forEach(function (n) {
      var g = G.handles[n], x = X(Math.max(lo, Math.min(at[n], hi))), kids = g.children, grip = n === 'space' ? u * 1.5 : u;
      set(kids[0], { x: x - u, y: 0, width: u * 2, height: h });
      set(kids[1], { x1: x, x2: x, y1: n === 'space' ? u * 1.5 : u * 2.5, y2: h - bottom });
      set(kids[2], { x: x - u * .5, y: n === 'space' ? 0 : u * 1.5, width: u, height: grip, rx: u * .25 });
      set(kids[3], { x: x, y: n === 'space' ? u * 2.5 : u * 1.2 });
      kids[3].setAttribute('display', n === 'space' ? 'none' : 'inline');
      say(kids[3], Math.round(at[n]) + '');
      set(g, { 'aria-valuenow': Math.round(at[n]), 'aria-valuetext': Math.round(at[n]) + ' pixels' });
    });
  }

  // ---- Write the knobs, and say what was worked out -------------------------
  function apply() {
    var k = derive(state), on = whole.getAttribute('aria-checked') === 'true';
    [boxes.wide, boxes.narrow, boxes.live].forEach(function (t) {
      KNOBS.concat(SPACES).forEach(function (n) {
        // The wide sample's two spaces are the stylesheet's, which hold it at its wide end.
        if (t === boxes.wide && SPACES.indexOf(n) >= 0) return;
        t.style.setProperty('--' + n, num(k[n], 4));
      });
    });
    if (on || applied) KNOBS.concat(SPACES).forEach(function (n) {
      if (on) root.style.setProperty('--' + n, num(k[n], 4)); else root.style.removeProperty('--' + n);
    });
    applied = on;

    var text = { h1: px(state.h1), body: px(state.body), label: px(state.label), rw: num(state.rw), rn: num(state.rn),
      sn: Math.round(state.sn) + 'px', sw: Math.round(state.sw) + 'px', snh: Math.round(state.sn) + 'px', swh: Math.round(state.sw) + 'px',
      h1n: px(k['h1-min'] * REM), bodyn: px(k['body-min'] * REM), labeln: px(k['label-min'] * REM), pw: num(k['rp-max']), pn: num(k['rp-min']) };
    Object.keys(text).forEach(function (n) { say(outs[n], text[n]); });
    say(sums.h1n, num(k['body-min'] * REM, 1) + ' × ' + num(state.rn) + '^' + num(place(state), 2));
    say(sums.bodyn, num(state.body) + ' ÷ √' + num(state.rn));
    say(sums.pw, '√' + num(state.rw));
    say(sums.pn, '√' + num(state.rn));
    Object.keys(inputs).forEach(function (n) { inputs[n].value = state[n]; inputs[n].setAttribute('aria-valuetext', text[n].replace('px', ' pixels')); fill(inputs[n]); });
    // The stretch of the live box's slider between the two spaces, where type grows.
    var lo = +scrub.min, hi = +scrub.max;
    scrub.style.setProperty('--range-a', num((state.sn - lo) / (hi - lo), 4));
    scrub.style.setProperty('--range-b', num((state.sw - lo) / (hi - lo), 4));
    each('[data-play-preset]', function (b) {
      var hit = Math.abs(state.rw - b.dataset.playPreset) < .0005 && Math.abs(state.rn - b.dataset.playNarrow) < .0005;
      b.setAttribute('aria-pressed', hit ? 'true' : 'false');
    });
    say(out, exportText());
    stale = true;
    requestAnimationFrame(draw);
  }

  // ---- Controls ---------------------------------------------------------------
  Object.keys(inputs).forEach(function (n) {
    inputs[n].addEventListener('input', function () {
      state[n] = +inputs[n].value;
      hold(n);
      touched = true;
      apply();
    });
  });
  // The narrow ratio is never the larger, and the narrow space stays short of
  // the wide one. If the other can't move far enough, the dragged one stops.
  function hold(n) {
    var p = PUSH[n];
    if (!p) return;
    var o = p[0], want = state[n] + p[1] * p[2];
    if (p[1] * (state[o] - want) >= 0) return;
    put(o, want);
    if (state[o] !== want) put(n, state[o] - p[1] * p[2]);
  }
  each('[data-play-preset]', function (b) {
    b.addEventListener('click', function () {
      put('rw', b.dataset.playPreset); put('rn', b.dataset.playNarrow);
      touched = true;
      apply();
    });
  });
  scrub.addEventListener('input', function () {
    space = +scrub.value;
    boxes.live.style.setProperty('--play-w', num(space / REM, 4) + 'rem');
    stale = true;
    requestAnimationFrame(draw);
  });
  whole.addEventListener('click', function () {
    whole.setAttribute('aria-checked', whole.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    apply();
  });
  one('[data-play-reset]').addEventListener('click', function () {
    whole.setAttribute('aria-checked', 'false');
    if (applied) KNOBS.concat(SPACES).forEach(function (n) { root.style.removeProperty('--' + n); });
    applied = false; touched = false; space = null;
    boxes.live.style.removeProperty('--play-w');
    read(); apply();
  });
  one('[data-play-copy]').addEventListener('click', function (e) {
    var label = e.currentTarget.querySelector('.button-label');
    if (navigator.clipboard) navigator.clipboard.writeText(exportText()).then(function () { label.textContent = 'Copied'; setTimeout(function () { label.textContent = 'Copy'; }, 1500); });
  });
  one('[data-play-save]').addEventListener('click', function () {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([exportText()], { type: 'text/css' }));
    a.download = 'product.css';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  // The boxes are read again when they are resized, and the seven values when
  // the page's own knobs change (a product layer) before anything was dragged.
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { requestAnimationFrame(draw); });
    [stage, boxes.wide, boxes.narrow].forEach(function (el) { ro.observe(el); });
  }
  new MutationObserver(function () { if (!touched && !applied) read(); apply(); })
    .observe(root, { attributes: true, attributeFilter: ['data-product'] });

  read(); apply();
  stale = false;   // the runtime has not measured anything yet
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(draw); });
})();
