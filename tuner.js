/* Trellis specimen · the tuner
   Turn the knobs a product turns, see them on type in a box you can resize, and
   take them away as a product layer. A named proportion writes the four type
   ratios; density sets the card and control knobs; fine tuning reaches every
   type knob. The graph draws each role's size against its container's width,
   from math.js, with the clamps where they hold. The list under it is the real
   classes, sized by the browser, beside what math.js says they should be.

   Knobs are set on the preview box, so the page keeps its own, unless "Apply to
   the whole page" puts them on :root. Nothing is stored. */
(function () {
  'use strict';
  var M = window.TrellisMath, root = document.documentElement;
  var sec = document.getElementById('tune');
  if (!sec || !M) return;
  var box = sec.querySelector('[data-tune-box]'), list = sec.querySelector('[data-tune-list]');
  var graph = sec.querySelector('[data-tune-graph]'), out = sec.querySelector('[data-tune-export]');
  var widthOut = sec.querySelector('[data-tune-width]'), series = sec.querySelector('[data-tune-series]');
  var propSel = sec.querySelector('[data-tune-proportion]'), densSel = sec.querySelector('[data-tune-density]');
  var whole = sec.querySelector('[data-tune-whole]');
  var SVG = 'http://www.w3.org/2000/svg';

  // A proportion writes the type ratios. Headings step by it in a wide space and
  // by its two-thirds power in a narrow one; paragraphs step by its two-thirds
  // power wide and its 0.4 power narrow. At a perfect fourth that is the
  // neutral seed's 1.333, 1.2 and 1.2, 1.12.
  var PROPORTIONS = {
    'minor-third': ['Minor third', 1.2], 'major-third': ['Major third', 1.25], 'fourth': ['Perfect fourth', 1.333],
    'tritone': ['Root two', 1.414], 'fifth': ['Perfect fifth', 1.5], 'golden': ['Golden', 1.618]
  };
  // The whole-cell counts each proportion would prefer for space. Shown, not
  // applied: counts as tokens are a later stage (D79).
  var COUNTS = { 'minor-third': '1, 2, 3, 4, 5, 6, 8, 10, 12', 'major-third': '1, 2, 3, 4, 5, 6, 8, 10, 12, 15',
    'fourth': '1, 2, 3, 4, 6, 8, 10, 12, 16', 'tritone': '2, 3, 4, 6, 8, 12, 16', 'fifth': '1, 2, 3, 4, 6, 9, 12, 18', 'golden': '1, 2, 3, 5, 8, 13, 21' };
  var DENSITY = {
    roomy: { 'density-card-pad': 'var(--sp-2)', 'density-control-h': 'var(--size-control-lg)', 'density-control-fs': 'var(--fs-control)' },
    dense: { 'density-card-pad': 'var(--sp-1)', 'density-control-h': 'var(--size-control-md)', 'density-control-fs': 'var(--fs-control-md)' }
  };
  var TYPE = ['h1-min', 'h1-max', 'body-min', 'body-max', 'label-min', 'label-max', 'rh-min', 'rh-max', 'rp-min', 'rp-max'];
  var ROLES = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'xl', 'lg', 'body', 'sm', 'xs', 'eyebrow', 'label'];
  var SAMPLE = { h1: 'Trellis', h2: 'Seed library', h3: 'Garden Stewards', h4: 'Upcoming gatherings', h5: 'Resources', h6: 'Members',
    xl: 'A living map of the people tending the same ground.', lg: 'Join a circle to meet the people working on it.',
    body: 'Circles are small groups organized around a shared purpose.', sm: 'Posted in the Seed Library.', xs: 'Last active 2 hours ago',
    eyebrow: 'Seed library', label: 'Seeking · Offering' };
  var COLOR = function (r) { return /^h\d$/.test(r) ? 'var(--kind-group)' : r === 'label' || r === 'eyebrow' ? 'var(--kind-person)' : 'var(--kind-topic)'; };
  var r3 = function (v) { return +(+v).toFixed(3); };

  var knobs = {}, density = 'roomy';
  function read(el) { var cs = getComputedStyle(el); TYPE.forEach(function (k) { knobs[k] = r3(parseFloat(cs.getPropertyValue('--' + k))); }); }
  function inputs() { return sec.querySelectorAll('[data-knob]'); }
  function show() { inputs().forEach(function (i) { i.value = knobs[i.dataset.knob]; }); }

  // The list: built once, the real classes.
  ROLES.forEach(function (r) {
    var line = document.createElement('div');
    line.className = 'tune-line';
    line.innerHTML = '<span class="tune-meta"><b>' + r + '</b> <span data-size></span></span><p class="t-' + r + '">' + SAMPLE[r] + '</p>';
    list.appendChild(line);
  });

  function seedFrom(el) {
    var cs = getComputedStyle(el), K = function (k) { return parseFloat(cs.getPropertyValue('--' + k)); };
    var pair = function (k) { return [K(k + '-min') * 16, K(k + '-max') * 16]; };
    return { cell: M.SEED.cell, frame: M.SEED.frame, type: {
      spaceNarrow: K('c-min') * 16, spaceWide: K('c-max') * 16, h1: pair('h1'), body: pair('body'), label: pair('label'),
      headingRatio: [K('rh-min'), K('rh-max')], paragraphRatio: [K('rp-min'), K('rp-max')],
      lineH1: K('lh-h1'), lineHeadingStep: K('lh-h-step'), lineBody: K('lh-body'), lineParagraphStep: K('lh-p-step'), lineLabel: K('lh-label'),
      afterH1: K('mb-h1'), afterHeadingStep: K('mb-h-step') } };
  }
  function space(el) { var cs = getComputedStyle(el); return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); }

  function draw() {
    var seed = seedFrom(list), w = space(list), scale = { textScale: parseFloat(getComputedStyle(root).fontSize) / 16 };
    var u = window.Trellis ? Trellis.cell() : 12;
    if (widthOut) widthOut.textContent = Math.round(w) + 'px, ' + (w / u).toFixed(1) + ' cells: drag the box\'s corner.';
    list.querySelectorAll('.tune-line').forEach(function (line, i) {
      var r = ROLES[i], p = line.querySelector('p'), want = M.typeSize(r, w, scale, seed), got = parseFloat(getComputedStyle(p).fontSize);
      line.querySelector('[data-size]').textContent = want.toFixed(1) + 'px' + (Math.abs(want - got) < .06 ? ' ✓' : ' (browser ' + got.toFixed(1) + ')');
    });
    // The graph: size against the container's width, 240 to 1600.
    var gw = graph.clientWidth, gh = graph.clientHeight, pad = u * 2;
    if (!(gw > 0)) return;
    var x0 = 240, x1 = 1600, ymax = seed.type.h1[1] * 1.08 * scale.textScale;
    var X = function (x) { return pad + (x - x0) / (x1 - x0) * (gw - pad * 3); };
    var Y = function (y) { return gh - pad - y / ymax * (gh - pad * 2); };
    graph.setAttribute('viewBox', '0 0 ' + gw + ' ' + gh);
    graph.textContent = '';
    function el(n, a, parent) { var e = document.createElementNS(SVG, n); for (var k in a) e.setAttribute(k, a[k]); (parent || graph).appendChild(e); return e; }
    [seed.type.spaceNarrow, seed.type.spaceWide].forEach(function (x) {
      el('line', { x1: X(x), x2: X(x), y1: pad / 2, y2: gh - pad, 'class': 'tune-axis' });
      el('text', { x: X(x), y: gh - pad / 4, 'text-anchor': 'middle', 'class': 'tune-tick' }).textContent = x + 'px';
    });
    el('line', { x1: X(Math.min(x1, Math.max(x0, w))), x2: X(Math.min(x1, Math.max(x0, w))), y1: pad / 2, y2: gh - pad, 'class': 'tune-now' });
    var tags = [];
    ROLES.forEach(function (r) {
      var pts = [];
      for (var x = x0; x <= x1; x += 20) pts.push(X(x).toFixed(1) + ',' + Y(M.typeSize(r, x, scale, seed)).toFixed(1));
      el('polyline', { points: pts.join(' '), 'class': 'tune-curve', style: 'stroke: ' + COLOR(r) });
      tags.push([r, Y(M.typeSize(r, x1, scale, seed))]);
    });
    // Names at the right end, pushed apart where the small roles crowd.
    tags.sort(function (a, b) { return a[1] - b[1]; });
    for (var i = 1; i < tags.length; i++) tags[i][1] = Math.max(tags[i][1], tags[i - 1][1] + 11);
    tags[tags.length - 1][1] = Math.min(tags[tags.length - 1][1], gh - pad);
    for (i = tags.length - 2; i >= 0; i--) tags[i][1] = Math.min(tags[i][1], tags[i + 1][1] - 11);
    tags.forEach(function (t) { el('text', { x: X(x1) + 6, y: t[1] + 3, 'class': 'tune-role' }).textContent = t[0]; });
  }

  function exportText() {
    var lines = TYPE.map(function (k) { return '    --' + k + ': ' + knobs[k] + ';'; });
    Object.keys(DENSITY[density]).forEach(function (k) { lines.push('    --' + k + ': ' + DENSITY[density][k] + ';'); });
    return '/* A product layer, exported from the Trellis specimen\'s tuner. Load it after core.css\n   and put data-product="yours" on <html>. */\n' +
      '@layer trellis.product {\n  :root[data-product="yours"] {\n' + lines.join('\n') + '\n  }\n}\n';
  }

  function apply() {
    var targets = [box].concat(whole && whole.getAttribute('aria-checked') === 'true' ? [root] : []);
    // The card padding's two split knobs follow --density-card-pad where core
    // declares them, on :root, so a box below it sets them as well. A product
    // layer, on :root, needs only the one.
    var SPLIT = ['density-card-pad-inline', 'density-card-pad-block'];
    [box, root].forEach(function (t) { TYPE.concat(Object.keys(DENSITY.roomy), SPLIT).forEach(function (k) { t.style.removeProperty('--' + k); }); });
    targets.forEach(function (t) {
      TYPE.forEach(function (k) { t.style.setProperty('--' + k, String(knobs[k])); });
      Object.keys(DENSITY[density]).forEach(function (k) { t.style.setProperty('--' + k, DENSITY[density][k]); });
      if (t === box) SPLIT.forEach(function (k) { t.style.setProperty('--' + k, DENSITY[density]['density-card-pad']); });
    });
    out.textContent = exportText();
    if (series) series.textContent = propSel.value in COUNTS ? 'Cell counts it would prefer for space: ' + COUNTS[propSel.value] + '. Shown, not applied.' : '';
    requestAnimationFrame(draw);
  }

  // Controls.
  propSel.addEventListener('change', function () {
    var p = (PROPORTIONS[propSel.value] || [])[1];
    if (!p) return;
    knobs['rh-max'] = r3(p); knobs['rh-min'] = r3(Math.pow(p, 2 / 3));
    knobs['rp-max'] = r3(Math.pow(p, 2 / 3)); knobs['rp-min'] = r3(Math.pow(p, .4));
    show(); apply();
  });
  densSel.addEventListener('change', function () { density = densSel.value; apply(); });
  inputs().forEach(function (i) {
    i.addEventListener('input', function () {
      var v = parseFloat(i.value);
      if (v > 0) { knobs[i.dataset.knob] = r3(v); propSel.value = 'custom'; apply(); }
    });
  });
  if (whole) whole.addEventListener('click', function () {
    whole.setAttribute('aria-checked', whole.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    apply();
  });
  sec.querySelector('[data-tune-copy]').addEventListener('click', function (e) {
    var b = e.currentTarget, label = b.querySelector('.button-label');
    if (navigator.clipboard) navigator.clipboard.writeText(exportText()).then(function () { label.textContent = 'Copied'; setTimeout(function () { label.textContent = 'Copy'; }, 1500); });
  });
  sec.querySelector('[data-tune-save]').addEventListener('click', function () {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([exportText()], { type: 'text/css' }));
    a.download = 'product.css';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  sec.querySelector('[data-tune-reset]').addEventListener('click', function () {
    [box, root].forEach(function (t) { TYPE.forEach(function (k) { t.style.removeProperty('--' + k); }); });
    if (whole) whole.setAttribute('aria-checked', 'false');
    read(root); density = densSel.value = 'roomy'; propSel.value = 'custom'; show(); apply();
  });

  // The box redraws as it is resized, and when the page's own knobs change (a product layer).
  if ('ResizeObserver' in window) new ResizeObserver(function () { requestAnimationFrame(draw); }).observe(list);
  new MutationObserver(function () { if (!box.style.getPropertyValue('--rh-min')) { read(root); show(); } requestAnimationFrame(draw); })
    .observe(root, { attributes: true, attributeFilter: ['data-product'] });

  read(root); show();
  out.textContent = exportText();
  propSel.value = 'custom';
  requestAnimationFrame(draw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(draw); });
})();
