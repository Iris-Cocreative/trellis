/* Trellis specimen: controls, live readouts, drawings, the Measure overlay. */
(function () {
  'use strict';

  var root = document.documentElement;
  var page = document.getElementById('top');
  var KEY = 'trellis';
  var SVGNS = 'http://www.w3.org/2000/svg';

  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  var state = {
    theme: new URLSearchParams(location.search).get('theme') || saved.theme || 'auto',
    // The reader's dial: 12 is 100% of the target (10px on a phone, 12px wide).
    // A new key, so a size saved under the old meaning can't shrink the cell.
    dial: saved.dial || 12,
    grid: saved.grid !== false,
    measure: !!saved.measure,
    hang: saved.hang !== false,   // surfaces hang by default
    fit: saved.fit || 'auto',
    css: !!saved.css,
    math: !!saved.math,
    file: saved.file || 'core.css'
  };

  if (state.theme !== 'light' && state.theme !== 'dark') state.theme = 'auto';

  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function resolvedTheme() {
    if (state.theme === 'auto') return darkQuery.matches ? 'dark' : 'light';
    return state.theme;
  }

  function unitPx() { return parseFloat(getComputedStyle(root).getPropertyValue('--u-px')) || 12; }
  // --cells is an unregistered expression, so count the frame instead.
  function cells() { return fitted() ? Math.round(page.getBoundingClientRect().width / unitPx()) : 0; }
  function gutterCells() { return Math.round(parseFloat(getComputedStyle(page).paddingLeft) / unitPx()); }

  // Fit: the same condition as core.css. settle.js passes the real width and
  // the exact device pixel ratio.
  var touchQuery = window.matchMedia('(pointer: coarse) and (min-resolution: 1.5dppx)');
  var canFit = window.CSS && CSS.supports('width', 'calc(100vw / 1px * 1px)');
  function fitted() { return canFit && (state.fit === 'on' || (state.fit === 'auto' && touchQuery.matches)); }

  // ---- Controls ----------------------------------------------------------
  function apply() {
    if (state.theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', resolvedTheme());
    root.toggleAttribute('data-grid', state.grid);
    root.toggleAttribute('data-measure', state.measure);
    root.toggleAttribute('data-no-hang', !state.hang);
    root.toggleAttribute('data-css', state.css);
    root.toggleAttribute('data-math', state.math);
    codePanel.hidden = !state.css;
    if (state.css) showFile(state.file);
    root.style.setProperty('--u-scale', String(state.dial / 12));
    if (state.fit === 'auto') root.removeAttribute('data-unit-fit');
    else root.setAttribute('data-unit-fit', state.fit);
    window.Trellis.fit();

    document.querySelectorAll('[data-set]').forEach(function (b) {
      var k = b.dataset.set, v = b.dataset.value, on;
      if (k === 'theme') on = state.theme === 'auto' ? v === 'auto' : v === resolvedTheme();
      else on = state[k] === v;
      b.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('[data-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(!!state[b.dataset.toggle]));
    });
    save();
    schedule();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-set], [data-toggle], [data-step]');
    if (!b) return;
    if (b.dataset.set) state[b.dataset.set] = b.dataset.value;
    if (b.dataset.toggle) state[b.dataset.toggle] = !state[b.dataset.toggle];
    // A fitted unit is fractional anyway, so its target moves by 1px; a whole unit stays even.
    if (b.dataset.step) state.dial = Math.min(18, Math.max(9, state.dial + Number(b.dataset.step) * (fitted() ? 1 : 2)));
    if (!fitted() && state.dial % 2) state.dial += 1;
    apply();
  });
  darkQuery.addEventListener('change', function () { if (state.theme === 'auto') apply(); });
  touchQuery.addEventListener('change', apply);

  // Modals: open and close on the native dialog, a backdrop click included.
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open-modal]');
    if (o) { document.getElementById(o.dataset.openModal).showModal(); return; }
    var dlg = e.target.closest('dialog.modal');
    if (dlg && (e.target === dlg || e.target.closest('[data-close-modal]'))) dlg.close();
  });
  // Tabs: the selected state is all a tab has.
  document.querySelectorAll('.tabs').forEach(function (list) {
    list.addEventListener('click', function (e) {
      var t = e.target.closest('.tab'); if (!t) return;
      list.querySelectorAll('.tab').forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
    });
  });

  // Filter tags toggle
  var filters = document.getElementById('filter-tags');
  if (filters) filters.addEventListener('click', function (e) {
    var t = e.target.closest('button.tag');
    if (t) t.setAttribute('aria-pressed', String(t.getAttribute('aria-pressed') !== 'true'));
  });

  // Fill the scroll panes with real-looking rows
  var rows = ['Seed library', 'Food systems', 'Regenerative finance', 'Facilitation', 'Permaculture',
    'Pattern design', 'Community land trusts', 'Mutual aid', 'Bioregional mapping', 'Soil health',
    'Restorative justice', 'Cooperative housing', 'Commons governance', 'Seed libraries'];
  document.querySelectorAll('[data-fill-list]').forEach(function (list) {
    rows.forEach(function (r, i) {
      var p = document.createElement('p');
      p.className = 't-sm';
      p.textContent = r + (i % 3 === 0 ? ' · 12 members' : '');
      list.appendChild(p);
    });
  });

  // ---- Live readouts -----------------------------------------------------
  function px(v) { return Math.round(v * 10) / 10; }
  function px2(v) { return Math.round(v * 100) / 100; }
  function readouts() {
    var u = unitPx(), n = cells();
    document.getElementById('unit-value').textContent = px2(u) + 'px';
    document.getElementById('seed-u').textContent = px2(u) + 'px';
    var g = gutterCells(), rem = parseFloat(getComputedStyle(root).fontSize);
    var target = M.cellTarget({ width: window.innerWidth, textScale: rem / 16, dial: state.dial / 12 });
    document.getElementById('seed-u-note').textContent = n
      ? 'The measure of space, fitted to this screen: the ' + px2(target) + 'px target becomes ' + px2(u) +
        'px so whole cells span it. It halves and doubles, ¼, ½, 1, 2, 4, 8, and every gap, inset, control, corner and avatar is made of it.'
      : 'The measure of space: the ' + px2(target) + 'px target, rounded to an even pixel. It halves and doubles, ¼, ½, 1, 2, 4, 8, and every gap, inset, control, corner and avatar is made of it.';
    var frameCells = Math.round(page.getBoundingClientRect().width / u);
    document.getElementById('seed-resp').textContent = n ? n + ' × ' + px2(u) : frameCells + ' cells';
    document.getElementById('seed-resp-note').textContent = n
      ? 'Both answer to the screen. ' + n + ' cells span this one exactly: ' + ((n - 2 * g) / 4) + ' modules of 4 and ' + g +
        ' cells each side. The screen also sets how far the ratio opens; the reader\'s dial scales the cell, and with it every space.'
      : 'Both answer to the screen. This frame is ' + frameCells + ' cells, ' + ((frameCells - 2 * g) / 4) +
        ' modules of 4 between ' + g + '-cell gutters; the screen also sets how far the ratio opens, and the reader\'s dial scales the cell.';
    var cw = Math.round(containerWidth(document.getElementById('seed-ctx')));
    document.getElementById('seed-ctx').textContent = cw + 'px';
    document.getElementById('seed-ctx-note').textContent = "Both answer to the box they're in. This card is " + cw +
      'px wide, and its type is sized from that, not from the window. A context changes variables, never markup, so a component nests at any depth.';

    var sizes = {};
    document.querySelectorAll('.type-row').forEach(function (row) {
      var s = row.querySelector('.type-sample');
      var out = row.querySelector('[data-readout]');
      var cs = getComputedStyle(s);
      var fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight);
      // The label's capitals meet the sample's: a headline's capitals sit
      // its settling pad below its box top; text hangs from its box top.
      row.style.setProperty('--cap-offset', (parseFloat(cs.paddingTop) || 0) + 'px');
      var bar = row.querySelector('.type-bar');
      if (bar) bar.style.setProperty('--w', fs.toFixed(2) + 'px');
      var role = (s.className.match(/t-(h\d|xl|lg|body|sm|xs|label)/) || [])[1];
      sizes[role] = fs;
      out.textContent = px(fs) + ' / ' + px(lh) + 'px';
    });
    if (sizes.h1 && sizes.h2) {
      document.getElementById('seed-r').textContent = (sizes.h1 / sizes.h2).toFixed(3);
      var rcs = getComputedStyle(root);
      var narrow = +parseFloat(rcs.getPropertyValue('--rh-min')).toFixed(3), wide = +parseFloat(rcs.getPropertyValue('--rh-max')).toFixed(3);
      document.getElementById('seed-r-note').textContent =
        'The measure of type. Headings step down from H1 by a ratio that opens with the space, ' + narrow +
        ' in a narrow one to ' + wide + ' in a wide one. This is the ratio here.';
    }
    document.querySelectorAll('[data-ctx-readout]').forEach(function (o) {
      var h = o.closest('.card').querySelector('.t-h3');
      o.textContent = 'Heading: ' + px(parseFloat(getComputedStyle(h).fontSize)) + 'px.';
    });
    document.querySelectorAll('[data-px]').forEach(function (el) {
      el.setAttribute('title', Math.max(1, Math.round(u * Number(el.dataset.px))) + 'px');
    });
  }

  // ---- Avatar anatomy, drawn from the live tokens -------------------------
  function el(name, attrs, parent) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function spreads(node) {
    var m = getComputedStyle(node).boxShadow.match(/(-?[\d.]+)px(?=\s*(,|$))/g) || [];
    return m.map(function (s) { return parseFloat(s); });
  }
  function anatomy() {
    var svg = document.getElementById('anatomy');
    if (!svg) return;
    var probe = document.querySelector('.avatar.cc-sm');
    var u = unitPx();
    var sp = probe ? spreads(probe) : [1, 3];
    var gap = sp[0] || 1, ring = (sp[1] || 3) - gap;
    var avail = svg.parentNode.clientWidth - 4 * u;
    var k = Math.max(3, Math.min(8, Math.floor(avail / (7 * u))));   // whole-number magnification
    var W = 7 * u * k, H = 4 * u * k;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.innerHTML = '';
    var g = el('g', { 'class': 'an-grid' }, svg);
    for (var i = 0; i <= 7 * 2; i++) {
      var x = i * u * k / 2;
      el('line', { x1: x, y1: 0, x2: x, y2: H, 'class': i % 2 ? 'an-half' : (i % 4 ? 'an-cell' : 'an-cell2') }, g);
    }
    for (var j = 0; j <= 4 * 2; j++) {
      var y = j * u * k / 2;
      el('line', { x1: 0, y1: y, x2: W, y2: y, 'class': j % 2 ? 'an-half' : (j % 4 ? 'an-cell' : 'an-cell2') }, g);
    }
    var cx = 2 * u * k, cy = 2 * u * k, r = u * k;
    el('rect', { x: u * k, y: u * k, width: 2 * u * k, height: 2 * u * k, 'class': 'an-cells' }, svg);
    el('circle', { cx: cx, cy: cy, r: r + (gap + ring) * k, 'class': 'an-ring' }, svg);
    el('circle', { cx: cx, cy: cy, r: r + gap * k, 'class': 'an-gap' }, svg);
    el('circle', { cx: cx, cy: cy, r: r, 'class': 'an-photo' }, svg);
    var lx = 4 * u * k + u * k / 2;
    function note(y1, x1, title, sub) {
      el('polyline', { points: x1 + ',' + y1 + ' ' + (lx - 8) + ',' + y1, 'class': 'an-lead' }, svg);
      el('circle', { cx: x1, cy: y1, r: 3, 'class': 'an-dot' }, svg);
      var t = el('text', { x: lx, y: y1 - 4, 'class': 'an-title' }, svg); t.textContent = title;
      var s = el('text', { x: lx, y: y1 + 16, 'class': 'an-sub' }, svg); s.textContent = sub;
    }
    var a = Math.PI / 4;
    note(cy - (r + (gap + ring / 2) * k) * Math.sin(a), cx + (r + (gap + ring / 2) * k) * Math.cos(a), 'ring · ' + ring + 'px', 'the person’s color');
    note(cy, cx + r + gap * k / 2, 'gap · ' + gap + 'px', 'the surface behind it');
    note(cy + r * 0.55, cx + r * 0.6, 'photo · 2u = ' + (2 * u) + 'px', 'whole cells, on the lines');
    var e = el('text', { x: u * k, y: H - u * k / 3, 'class': 'an-sub' }, svg);
    e.textContent = 'outer edge: ' + (gap + ring) + 'px past the cell line';
  }

  // ---- Organic: a constellation on the 2:1 isometric lattice -------------
  var NODES = [
    { id: 'a', kind: 'group', x: .2, y: .38, n: 4, label: 'Seed Library' },
    { id: 'b', kind: 'group', x: .55, y: .3, n: 3, label: 'Food Systems' },
    { id: 'c', kind: 'group', x: .8, y: .58, n: 4, label: 'Garden Stewards' },
    { id: 'd', kind: 'group', x: .42, y: .74, n: 3, label: 'Soil Health' },
    { id: 'p1', kind: 'person', x: .08, y: .16, hue: 30 }, { id: 'p2', kind: 'person', x: .3, y: .12, hue: 300 },
    { id: 'p3', kind: 'person', x: .36, y: .48, hue: 200 }, { id: 'p4', kind: 'person', x: .66, y: .1, hue: 120 },
    { id: 'p5', kind: 'person', x: .7, y: .44, hue: 15 }, { id: 'p6', kind: 'person', x: .94, y: .3, hue: 260 },
    { id: 'p7', kind: 'person', x: .62, y: .86, hue: 45 }, { id: 'p8', kind: 'person', x: .9, y: .84, hue: 340 },
    { id: 'p9', kind: 'person', x: .2, y: .82, hue: 170 }, { id: 'p10', kind: 'person', x: .08, y: .6, hue: 80 }
  ];
  var LINKS = [['p1', 'a'], ['p2', 'a'], ['p3', 'a', 2], ['p3', 'b'], ['p3', 'd'], ['p2', 'b'], ['p4', 'b'], ['p5', 'b'],
    ['p5', 'c', 2], ['p6', 'c'], ['p8', 'c'], ['p7', 'c'], ['p7', 'd'], ['p9', 'd'], ['p10', 'a'], ['p10', 'd']];

  function organic() {
    var svg = document.getElementById('organic-art');
    if (!svg) return;
    var u = unitPx();
    var W = Math.floor(svg.parentNode.clientWidth / u) * u;
    var H = 30 * u;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.innerHTML = '';
    var dx = 2 * u, dy = u, step = 2;            // lattice: rhombi 4u wide, 2u tall
    var lat = el('g', { 'class': 'org-lattice' }, svg);
    var span = Math.ceil((W / 2 + H) / (dy * step)) + 2;
    for (var c = -span; c <= span; c++) {
      var b = c * dy * step;                        // y-intercept on a 2u spacing
      el('line', { x1: 0, y1: b, x2: W, y2: b + W / 2, 'class': c % 2 ? '' : 'cc-strong' }, lat);
      el('line', { x1: 0, y1: b, x2: W, y2: b - W / 2, 'class': c % 2 ? '' : 'cc-strong' }, lat);
    }
    function snap(n) {                               // nearest lattice point: x on 2u, y on u, parity matched
      var i = Math.round((n.x * (W - 8 * u) + 4 * u) / (dx * step) * 2) / 2;
      var j = Math.round((n.y * (H - 8 * u) + 4 * u) / (dy * step));
      if ((i % 1) !== 0) j += .5;
      return { x: i * dx * step, y: j * dy * step };
    }
    var pos = {};
    NODES.forEach(function (n) { pos[n.id] = snap(n); });
    var links = el('g', { 'class': 'org-links' }, svg);
    LINKS.forEach(function (l) {
      var a = pos[l[0]], b = pos[l[1]];
      el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, 'class': l[2] ? 'cc-strong' : '' }, links);
    });
    var nodes = el('g', {}, svg);
    NODES.forEach(function (n) {
      var p = pos[n.id];
      if (n.kind === 'person') {
        var r = u;                                     // 2u photo
        el('circle', { cx: p.x, cy: p.y, r: r + 2, 'class': 'org-person-ring' }, nodes);
        el('circle', { cx: p.x, cy: p.y, r: r + 1, 'class': 'org-gap' }, nodes);
        var f = el('circle', { cx: p.x, cy: p.y, r: r, 'class': 'org-person' }, nodes);
        f.style.setProperty('--hue', n.hue);
      } else {
        var s = n.n * u, h = s / 2, rr = s / 4;
        el('rect', { x: p.x - h - 2, y: p.y - h - 2, width: s + 4, height: s + 4, rx: rr + 2, 'class': 'org-group-ring' }, nodes);
        el('rect', { x: p.x - h - 1, y: p.y - h - 1, width: s + 2, height: s + 2, rx: rr + 1, 'class': 'org-gap' }, nodes);
        el('rect', { x: p.x - h, y: p.y - h, width: s, height: s, rx: rr, 'class': 'org-group' }, nodes);
        var base = Math.ceil((p.y + h + 2 * u) / u) * u;   // the label stands on a cell line
        var t = el('text', { x: p.x, y: base, 'class': 'org-label', 'text-anchor': 'middle' }, nodes);
        t.textContent = n.label;
      }
    });
  }

  // ---- Anchored menu -------------------------------------------------------
  var menu = document.getElementById('roles-menu');
  var scroller = document.getElementById('demo-scroll');
  var anchor = null;
  if (menu && typeof menu.showPopover === 'function') {
    document.querySelectorAll('[popovertarget="roles-menu"]').forEach(function (b) {
      if (!b.closest('#roles-menu')) b.addEventListener('click', function () { anchor = b; });
    });
    var place = function (force) {
      if (!anchor || (!force && !menu.matches(':popover-open'))) return;
      var a = anchor.getBoundingClientRect(), s = scroller.getBoundingClientRect();
      if (a.bottom < s.top || a.top > s.bottom) { menu.hidePopover(); return; }
      var w = menu.offsetWidth || 192, h = menu.offsetHeight || 160, gap = unitPx() / 2;
      var left = Math.min(Math.max(12, a.right - w), window.innerWidth - w - 12);
      var top = a.bottom + gap;
      if (top + h > window.innerHeight - 12) top = Math.max(12, a.top - gap - h);
      menu.style.left = Math.round(left) + 'px';
      menu.style.top = Math.round(top) + 'px';
    };
    menu.addEventListener('beforetoggle', function (e) { if (e.newState === 'open') place(true); });
    menu.addEventListener('toggle', function (e) { if (e.newState === 'open') place(); });
    scroller.addEventListener('scroll', function () { place(); }, { passive: true });
    window.addEventListener('scroll', function () { place(); }, { passive: true });
    window.addEventListener('resize', function () { place(); });
  }

  // ---- Measure -----------------------------------------------------------
  var layer = document.getElementById('measure-layer');
  var inspector = document.getElementById('inspector');
  var TEXT_ROLE = /\bt-(h\d|xl|lg|body|sm|xs|label)\b/;
  var SKIP = 'svg *, .grid-layer, .measure-layer, br, b, em, i, code, a, .edge-line, .edge-line *, [data-fill-list] > p:nth-child(n+4)';

  function name(v, u) {
    v = Math.round(v * 100) / 100;
    if (Math.abs(v) < .5) return null;
    if (v === 1) return { t: 'line' };
    if (v === 2) return { t: '2px' };
    var q = v / u;
    var map = { .25: '¼u', .5: '½u', .75: '¾u', 1: 'u', 1.5: '1½u', 2.5: '2½u', 3.5: '3½u' };
    for (var key in map) if (Math.abs(q - key) < .02) return { t: map[key] };
    if (Math.abs(v - Math.max(1, Math.round(u / 4))) < .5) return { t: '¼u' };
    if (Math.abs(q - Math.round(q)) < .02) return { t: Math.round(q) + 'u' };
    if (Math.abs(q * 2 - Math.round(q * 2)) < .02) return { t: Math.floor(q) + '½u' };
    return { t: v + 'px', off: true };
  }

  function box(cls, x, y, w, h) {
    var d = document.createElement('div');
    d.className = cls;
    d.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px';
    layer.appendChild(d);
    return d;
  }
  function label(text, x, y, cls) {
    var d = document.createElement('div');
    d.className = 'm-label' + (cls ? ' ' + cls : '');
    d.textContent = text;
    d.style.left = x + 'px'; d.style.top = y + 'px';
    layer.appendChild(d);
  }

  function measure() {
    layer.textContent = '';
    if (!state.measure) return;
    var u = unitPx();
    var pr = page.getBoundingClientRect();
    var all = page.querySelectorAll('*');
    for (var n = 0; n < all.length; n++) {
      var e = all[n];
      if (e.matches(SKIP) || e.closest('.grid-layer, .measure-layer, [popover]')) continue;
      var cs = getComputedStyle(e);
      if (cs.display === 'inline' || cs.display === 'none' || cs.display === 'contents') continue;
      var r = e.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      var x = r.left - pr.left, y = r.top - pr.top;
      var isText = TEXT_ROLE.test(e.className);

      if (isText) {
        if (/\bt-h[123]\b/.test(e.className)) box('m-base', x, y + r.height - 1, r.width, 1);   // a headline stands on its baseline
        else box('m-base cc-hang', x, y, r.width, 1);                                              // text hangs from its top line
        continue;
      }
      box('m-box', x, y, r.width, r.height);

      var bt = parseFloat(cs.borderTopWidth), bl = parseFloat(cs.borderLeftWidth);
      var br = parseFloat(cs.borderRightWidth), bb = parseFloat(cs.borderBottomWidth);
      var it = bt + parseFloat(cs.paddingTop), il = bl + parseFloat(cs.paddingLeft);
      var ir = br + parseFloat(cs.paddingRight), ib = bb + parseFloat(cs.paddingBottom);
      if (it > .5) box('m-pad', x, y, r.width, it);
      if (ib > .5) box('m-pad', x, y + r.height - ib, r.width, ib);
      if (il > .5) box('m-pad', x, y + it, il, r.height - it - ib);
      if (ir > .5) box('m-pad', x + r.width - ir, y + it, ir, r.height - it - ib);
      if (r.width > 3 * u && r.height > 2 * u) {
        var nt = name(it, u), nl = name(il, u);
        if (nt && it >= u / 2) label(nt.t, x + r.width / 2, y + it / 2, nt.off ? 'cc-off' : '');
        if (nl && il >= u / 2 && (il !== it || r.height > 4 * u)) label(nl.t, x + il / 2, y + it + (r.height - it - ib) / 2, nl.off ? 'cc-off' : '');
      }

      if (/flex|grid/.test(cs.display)) {
        var cg = parseFloat(cs.columnGap) || 0, rg = parseFloat(cs.rowGap) || 0;
        if (!cg && !rg) continue;
        // The distance between two children is gap + their own margins (a
        // heading's space after it). Each gets its own band and its own name.
        var kids = [], kms = [];
        for (var c = 0; c < e.children.length; c++) {
          var k = e.children[c], kcs = getComputedStyle(k);
          if (kcs.position === 'absolute' || kcs.position === 'fixed' || kcs.display === 'none' || k.hasAttribute('popover')) continue;
          kids.push(k.getBoundingClientRect());
          kms.push({ t: parseFloat(kcs.marginTop) || 0, b: parseFloat(kcs.marginBottom) || 0 });
        }
        for (var q = 1; q < kids.length; q++) {
          var a = kids[q - 1], b = kids[q], ma = kms[q - 1].b, mb = kms[q].t;
          if (cg && b.left >= a.right - .5 && b.top < a.bottom && b.bottom > a.top) {
            var gy = Math.max(a.top, b.top), gh = Math.min(a.bottom, b.bottom) - gy;
            box('m-gap', a.right - pr.left, gy - pr.top, b.left - a.right, gh);
            var ng = name(cg, u);
            if (ng && gh > u) label(ng.t, a.right - pr.left + (b.left - a.right) / 2, gy - pr.top + gh / 2, 'cc-gap' + (ng.off ? ' cc-off' : ''));
          } else if (rg && b.top >= a.bottom - .5) {
            var gx = Math.max(a.left, b.left), gw = Math.min(a.right, b.right) - gx;
            if (gw <= 0) { gx = b.left; gw = b.width; }
            var lx = gx - pr.left + Math.min(gw / 2, 3 * u), y0 = a.bottom - pr.top;
            if (ma > .5) {
              box('m-own', gx - pr.left, y0, gw, ma);
              var no = name(ma, u);
              if (no && gw > 2 * u) label(no.t, lx + 4 * u, y0 + ma / 2, 'cc-own' + (no.off ? ' cc-off' : ''));
            }
            box('m-gap', gx - pr.left, y0 + ma, gw, rg);
            var nr = name(rg, u);
            if (nr && gw > 2 * u) label(nr.t, lx, y0 + ma + rg / 2, 'cc-gap' + (nr.off ? ' cc-off' : ''));
            if (mb > .5) {
              box('m-own', gx - pr.left, y0 + ma + rg, gw, mb);
              var nb = name(mb, u);
              if (nb && gw > 2 * u) label(nb.t, lx + 4 * u, y0 + ma + rg + mb / 2, 'cc-own' + (nb.off ? ' cc-off' : ''));
            }
          }
        }
      }
    }
  }

  // Inspector: hover any element while Measure is on
  var hot = null;
  var VARS = {
    card: ['--card-pad-inline', '--card-pad-block', '--card-radius'], button: ['--btn-h', '--btn-radius', '--btn-fs'],
    tag: ['--tag-h', '--tag-radius', '--tag-pad', '--tag-fs'], avatar: ['--av-n', '--av-gap', '--av-ring'],
    float: ['--float-pad', '--float-radius'], stack: ['--stack-gap'], cluster: ['--cluster-gap'], grid: ['--grid-min', '--grid-gap']
  };
  function describe(e) {
    var u = unitPx(), r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    function nm(v) { var o = name(v, u); return o ? (o.off ? '<span class="off">' + o.t + '</span>' : o.t) : '0'; }
    var rowsHtml = [];
    rowsHtml.push(['size', nm(r.width) + ' × ' + nm(r.height)]);
    var ins = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(function (v, i) {
      var b = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth][i];
      return nm(parseFloat(v) + parseFloat(b));
    });
    if (ins.join() !== '0,0,0,0') rowsHtml.push(['inset', ins.join(' ')]);
    if (/flex|grid/.test(cs.display)) rowsHtml.push(['gap', nm(parseFloat(cs.rowGap) || 0) + ' / ' + nm(parseFloat(cs.columnGap) || 0)]);
    if (parseFloat(cs.marginBottom) > .5) rowsHtml.push(['space after', nm(parseFloat(cs.marginBottom))]);
    if (parseFloat(cs.borderTopLeftRadius)) rowsHtml.push(['corner', cs.borderTopLeftRadius === '50%' ? 'circle' : nm(parseFloat(cs.borderTopLeftRadius))]);
    rowsHtml.push(['type', px(parseFloat(cs.fontSize)) + ' / ' + (cs.lineHeight === 'normal' ? 'normal' : px(parseFloat(cs.lineHeight)) + 'px') + ' · ' + cs.fontFamily.split(',')[0].replace(/"/g, '')]);
    Object.keys(VARS).forEach(function (p) {
      if (!e.classList.contains(p)) return;
      VARS[p].forEach(function (v) {
        var val = cs.getPropertyValue(v).trim();
        if (val) rowsHtml.push([v, val.length > 40 ? val.slice(0, 40) + '…' : val]);
      });
    });
    var cls = e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '';
    return '<p class="inspector-title">' + e.tagName.toLowerCase() + cls + '</p><dl>' +
      rowsHtml.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>';
  }
  document.addEventListener('pointermove', function (ev) {
    if (!state.measure) { if (!inspector.hidden) inspector.hidden = true; return; }
    var t = ev.target;
    if (!(t instanceof Element) || !page.contains(t) || t.closest('svg') && t.tagName !== 'svg') { inspector.hidden = true; if (hot) { hot.remove(); hot = null; } return; }
    var pr = page.getBoundingClientRect(), r = t.getBoundingClientRect();
    if (!hot) hot = box('m-hot', 0, 0, 0, 0);
    if (!hot.isConnected) layer.appendChild(hot);
    hot.style.cssText = 'position:absolute;left:' + (r.left - pr.left) + 'px;top:' + (r.top - pr.top) + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
    inspector.innerHTML = describe(t);
    inspector.hidden = false;
    var iw = inspector.offsetWidth, ih = inspector.offsetHeight;
    var lx = ev.clientX + 16, ly = ev.clientY + 16;
    if (lx + iw > window.innerWidth - 8) lx = ev.clientX - iw - 16;
    if (ly + ih > window.innerHeight - 8) ly = ev.clientY - ih - 16;
    inspector.style.left = Math.max(8, lx) + 'px';
    inspector.style.top = Math.max(8, ly) + 'px';
  });

  // ---- Scheduling ----------------------------------------------------------
  var queued = false;
  // ---- The math behind each type role -------------------------------------
  // Recomputed by math.js from the same root knobs the stylesheet reads, then
  // checked against what the browser actually set. math.js works in points; a
  // knob is in rem, so it is 16 points at the default text size.
  var M = window.TrellisMath;
  function liveSeed(K) {
    var pair = function (k) { return [K(k + '-min') * 16, K(k + '-max') * 16]; };
    return { cell: M.SEED.cell, frame: M.SEED.frame, type: {
      spaceNarrow: K('c-min') * 16, spaceWide: K('c-max') * 16,
      h1: pair('h1'), body: pair('body'), label: pair('label'),
      headingRatio: [K('rh-min'), K('rh-max')], paragraphRatio: [K('rp-min'), K('rp-max')],
      lineH1: K('lh-h1'), lineHeadingStep: K('lh-h-step'), lineBody: K('lh-body'), lineParagraphStep: K('lh-p-step'), lineLabel: K('lh-label'),
      afterH1: K('mb-h1'), afterHeadingStep: K('mb-h-step') } };
  }
  var ROLES = {
    h1: ['anchor', 'h1', '', 0], h2: ['h1 ÷ r', 'h1', 'rh', -1], h3: ['h1 ÷ r²', 'h1', 'rh', -2],
    h4: ['h1 ÷ r³', 'h1', 'rh', -3], h5: ['h1 ÷ r⁴', 'h1', 'rh', -4], h6: ['h1 ÷ r⁵', 'h1', 'rh', -5],
    xl: ['body × p²', 'body', 'rp', 2], lg: ['body × p', 'body', 'rp', 1], body: ['anchor', 'body', '', 0],
    sm: ['body ÷ p', 'body', 'rp', -1], xs: ['body ÷ p²', 'body', 'rp', -2], label: ['anchor', 'label', '', 0]
  };
  var SUP = ['', '', '²', '³', '⁴', '⁵'];
  function f(v, d) { return String(+v.toFixed(d == null ? 3 : d)); }
  function containerWidth(el) {
    var c = el.parentElement;
    while (c && getComputedStyle(c).containerType === 'normal') c = c.parentElement;
    if (!c) return window.innerWidth;
    var cs = getComputedStyle(c);
    return c.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }
  function math() {
    if (!state.math) return;
    var cs = getComputedStyle(root), K = function (k) { return parseFloat(cs.getPropertyValue('--' + k)); };
    var rem = parseFloat(cs.fontSize), seed = liveSeed(K), scale = { textScale: rem / 16 };
    var cmin = K('c-min'), cmax = K('c-max');
    document.querySelectorAll('.type-row').forEach(function (row) {
      var s = row.querySelector('.type-sample'), out = row.querySelector('[data-math-out]');
      var role = (s.className.match(/t-(h\d|xl|lg|body|sm|xs|label)/) || [])[1];
      var R = ROLES[role]; if (!R || !out) return;
      var n = R[3], base = R[1], rk = R[2], p = Math.abs(n), op = n < 0 ? ' ÷ ' : ' × ';
      var pts = M.typeEnds(role, seed);
      var ends = ['min', 'max'].map(function (e, i) {
        var v = K(base + '-' + e), r = rk ? K(rk + '-' + e) : 1;
        return { v: pts[i] / 16, expr: n ? f(v) + op + f(r) + SUP[p] + ' = ' : '' };
      });
      var cw = containerWidth(s), slope = (ends[1].v - ends[0].v) / (cmax - cmin);
      var raw = ends[0].v + slope * (cw / rem - cmin);
      var px = M.typeSize(role, cw, scale, seed), sz = px / rem;
      var heading = M.isHeading(role), stands = M.stands(role), u0 = unitPx();
      var lhk = M.lineRatio(role, seed), mbk = heading ? seed.type.afterH1 + seed.type.afterHeadingStep * p : 0;
      var lh = M.lineHeight(role, px, u0, seed), mb = M.spaceAfter(role, px, u0, seed);
      var actual = parseFloat(getComputedStyle(s).fontSize);
      var check = Math.abs(actual - px) < .06 ? ' ✓' : ' (browser: ' + f(actual, 2) + 'px)';
      var clamp = ends[0].v > ends[1].v ? ', held at the narrow size, which is larger than the wide one: the ratio grows faster than the anchor'
        : raw < ends[0].v ? ', held at the narrow size' : raw > ends[1].v ? ', held at the wide size' : '';
      var lines = [
        '<b>' + role + ' = ' + R[0] + '</b>: ' + ends[0].expr + f(ends[0].v) + 'rem in a ' + f(cmin * rem, 0) + 'px space, ' +
          ends[1].expr + f(ends[1].v) + 'rem in ' + f(cmax * rem, 0) + 'px',
        '<b>here</b>, ' + f(cw, 1) + 'px: ' + f(ends[0].v) + ' + (' + f(ends[1].v) + ' − ' + f(ends[0].v) + ') × (' + f(cw, 1) + ' − ' +
          f(cmin * rem, 0) + ') ÷ ' + f((cmax - cmin) * rem, 0) + ' = ' + f(sz) + 'rem = <b>' + f(px, 2) + 'px</b>' + clamp + check,
        '<b>line</b> ' + f(px, 2) + ' × ' + f(lhk, 2) + ' = ' + f(px * lhk, 2) +
          (stands ? ' → <b>' + f(lh, 2) + 'px</b>, ' + Math.round(lh / u0) + ' cells: a headline stands on the cells'
                  : 'px, its own line: text hangs from a cell line and its block rounds up to whole cells') +
          (heading ? ' · <b>space after</b> ' + f(px, 2) + ' × ' + f(mbk, 2) + ' = ' + f(px * mbk, 2) + ' → <b>' + f(mb, 2) + 'px</b>, ' + Math.round(mb / u0) + ' cells' : '')
      ];
      // Write only when the math changed: new nodes would be settled again,
      // which resizes the page and runs this again.
      var html = lines.map(function (l) { return '<p class="t-xs">' + l + '</p>'; }).join('');
      if (out.dataset.html !== html) { out.dataset.html = html; out.innerHTML = html; }
    });
  }

  // ---- The CSS panel -------------------------------------------------------
  var codePanel = document.getElementById('code-panel');
  var codeView = document.getElementById('code-view');
  var codeBody = document.getElementById('code-body');
  var codeFind = document.getElementById('code-find');
  var codeCount = document.getElementById('code-count');
  var files = {}, shown = null, hits = [], hitAt = -1;
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var TOKEN = /(@[\w-]+)|(--[\w-]+)|("[^"]*"|'[^']*')|(#[0-9a-fA-F]{3,8}\b)|((?<![\w#.-])-?\d*\.?\d+(?:px|rem|em|%|cqi|vw|vh|svw|deg|ms|s|dppx|fr|ch|cap|ex)?(?![\w-]))/g;
  function tok(seg) {
    return esc(seg).replace(TOKEN, function (m, a, v, str, hex, num) {
      var c = a ? 'a' : v ? 'v' : str ? 's' : hex ? 'h' : 'n';
      return '<span class="tk-' + c + '">' + m + '</span>';
    });
  }
  function highlight(text) {
    var inC = false;
    return text.replace(/\r/g, '').split('\n').map(function (line, i) {
      var out = '', at = 0;
      while (at <= line.length) {
        if (inC) {
          var e = line.indexOf('*/', at), end = e < 0 ? line.length : e + 2;
          out += '<span class="tk-c">' + esc(line.slice(at, end)) + '</span>';
          at = end; if (e >= 0) inC = false; else break;
        } else {
          var st = line.indexOf('/*', at);
          out += tok(st < 0 ? line.slice(at) : line.slice(at, st));
          if (st < 0) break;
          at = st; inC = true;
        }
      }
      return '<span class="code-line" data-n="' + (i + 1) + '">' + (out || ' ') + '</span>';
    }).join('');
  }
  // The one product layer the page was given by address, if any (see index.html).
  var LAYER = window.TRELLIS_LAYER || null;
  var layerButton = document.querySelector('[data-layer-file]');
  if (LAYER && layerButton) {
    layerButton.dataset.file = LAYER.href;
    layerButton.querySelector('.button-label').textContent = LAYER.product;
    layerButton.hidden = false;
  }
  function fetchFile(name) {
    // A layer on another origin may not allow reading; the panel says so and the page carries on.
    if (!files[name]) files[name] = fetch(name, { cache: 'no-cache' }).then(function (r) { return r.text(); })
      .catch(function () { return '/* ' + name + " can't be read from here. */"; });
    return files[name];
  }
  function showFile(name, then) {
    state.file = name; save();
    document.querySelectorAll('[data-file]').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.file === name)); });
    if (shown === name) { find(); if (then) then(); return; }
    fetchFile(name).then(function (text) {
      if (state.file !== name) return;
      codeView.innerHTML = highlight(text);
      shown = name; codeBody.scrollTop = 0;
      find(); if (then) then();
    });
  }
  function find(step) {
    var q = codeFind.value.trim().toLowerCase();
    codeView.querySelectorAll('.cc-hit, .cc-now').forEach(function (l) { l.classList.remove('cc-hit', 'cc-now'); });
    hits = [];
    if (q) codeView.querySelectorAll('.code-line').forEach(function (l) { if (l.textContent.toLowerCase().indexOf(q) >= 0) hits.push(l); });
    if (!hits.length) { hitAt = -1; codeCount.textContent = q ? '0' : ''; return; }
    hitAt = step ? (hitAt + step + hits.length) % hits.length : 0;
    hits.forEach(function (l) { l.classList.add('cc-hit'); });
    reveal(hits[hitAt]);
    codeCount.textContent = (hitAt + 1) + '/' + hits.length;
  }
  function reveal(line) {
    line.classList.add('cc-now');
    codeBody.scrollTop = line.offsetTop - codeBody.clientHeight / 3;
  }
  codeFind.addEventListener('input', function () { find(); });
  codeFind.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); find(e.shiftKey ? -1 : 1); } });
  // With Measure on, a click on the page finds the element's rule: its
  // classes in order, in the core, then the product, then the specimen.
  function findRule(el) {
    var classes = [];
    for (var c = el; c && c !== page && classes.length < 6; c = c.parentElement)
      [].forEach.call(c.classList || [], function (k) { if (classes.indexOf(k) < 0) classes.push(k); });
    var order = LAYER ? ['core.css', LAYER.href, 'specimen.css'] : ['core.css', 'specimen.css'];
    Promise.all(order.map(fetchFile)).then(function (texts) {
      for (var i = 0; i < classes.length; i++) {
        // A selector line (it ends in "{") that names the class.
        var re = new RegExp('^[^/*\\n]*\\.' + classes[i] + '(?![\\w-])[^;\\n]*\\{', 'm');
        for (var j = 0; j < order.length; j++) {
          var m = re.exec(texts[j]);
          if (!m) continue;
          var lineNo = texts[j].slice(0, m.index).split('\n').length;
          codeFind.value = '.' + classes[i];
          showFile(order[j], function () {
            find();
            var line = codeView.querySelector('.code-line[data-n="' + lineNo + '"]');
            if (line) { codeView.querySelectorAll('.cc-now').forEach(function (l) { l.classList.remove('cc-now'); }); reveal(line); }
          });
          return;
        }
      }
      codeFind.value = classes[0] ? '.' + classes[0] : '';
      find();
    });
  }
  document.addEventListener('click', function (e) {
    if (!state.measure || !state.css || !page.contains(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    findRule(e.target);
  }, true);
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-file]');
    if (b) showFile(b.dataset.file);
  });

  // ---- Grid, drawn in device pixels --------------------------------------
  // Each line is one device pixel at the device pixel its coordinate rounds
  // to, which is how the browser snaps box edges, so drawing and layout land
  // on the same pixels. Columns count from the field's left edge (the
  // strongest line), rows from the top of the page. The grid bleeds past
  // the frame to the screen's edges.
  var grid = document.getElementById('grid-canvas');
  var inkProbe = document.createElement('span');
  inkProbe.setAttribute('aria-hidden', 'true');
  inkProbe.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  page.appendChild(inkProbe);
  function ink(v) { inkProbe.style.color = 'var(' + v + ')'; return getComputedStyle(inkProbe).color; }
  function drawGrid() {
    if (!state.grid) return;
    var dpr = window.devicePixelRatio || 1;
    var cw = grid.clientWidth, ch = grid.clientHeight;
    var bw = Math.round(cw * dpr), bh = Math.round(ch * dpr);
    if (grid.width !== bw) grid.width = bw;
    if (grid.height !== bh) grid.height = bh;
    var ctx = grid.getContext('2d');
    ctx.clearRect(0, 0, bw, bh);
    var u = unitPx(), pr = page.getBoundingClientRect();
    if (!(u > 0)) return;
    var cs = getComputedStyle(root);
    var a = function (k) { return Math.min(1, (parseFloat(cs.getPropertyValue(k)) || 0) * dpr); };
    var text = ink('--text'), group = ink('--kind-group');
    var tiers = [[text, a('--grid-a-1')], [group, a('--grid-a-2')], [group, a('--grid-a-4')]];
    var tier = function (i) { i = ((i % 4) + 4) % 4; return i === 0 ? tiers[2] : i === 2 ? tiers[1] : tiers[0]; };
    var x0 = pr.left + parseFloat(getComputedStyle(page).paddingLeft);
    var top = Math.max(0, pr.top), bottom = Math.min(ch, pr.bottom);
    if (bottom <= top) return;
    var T = Math.round(top * dpr), B = Math.round(bottom * dpr);
    var k, x, j, y;
    for (k = Math.ceil(-x0 / u); (x = x0 + k * u) <= cw; k++) {
      var tv = tier(k); ctx.fillStyle = tv[0]; ctx.globalAlpha = tv[1];
      ctx.fillRect(Math.round(x * dpr), T, 1, B - T);
    }
    for (j = Math.ceil((top - pr.top) / u); (y = pr.top + j * u) <= bottom; j++) {
      var th = tier(j); ctx.fillStyle = th[0]; ctx.globalAlpha = th[1];
      ctx.fillRect(0, Math.round(y * dpr), bw, 1);
    }
    ctx.globalAlpha = 1;
  }
  var gridQueued = false;
  function scheduleGrid() {
    if (gridQueued) return;
    gridQueued = true;
    requestAnimationFrame(function () { gridQueued = false; drawGrid(); });
  }
  window.addEventListener('scroll', scheduleGrid, { passive: true });

  function refresh() {
    queued = false;
    drawGrid();
    readouts();
    math();
    anatomy();
    organic();
    measure();
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { requestAnimationFrame(refresh); });
  }
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(page);
  window.addEventListener('resize', schedule);
  document.addEventListener('scroll', function (e) {
    if (state.measure && e.target !== document && page.contains(e.target)) schedule();
  }, true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);

  apply();
})();
