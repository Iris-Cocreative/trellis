/* Trellis specimen · the palette study
   How few colors does a palette need? One. From a chosen accent this derives
   every seed core takes: the five kinds by a harmony around the hue wheel, the
   three statuses at their fixed hues and the accent's strength, and a neutral
   with a trace of a hue. math.js then makes every role in both themes, as it
   does for any seeds. A study in the page: core still takes a seed for each.
   Not part of the package. */
(function () {
  'use strict';
  var sec = document.querySelector('[data-pal]'), M = window.TrellisMath;
  if (!sec || !M) return;
  var root = document.documentElement, TAU = Math.PI * 2;
  var base = M.SEED.color;
  var DEFAULT = { h: base.seeds.accent[2], c: base.seeds.accent[1], l: base.seeds.accent[0], harmony: 'pentad', neutral: 'warm', tint: base.seeds.neutral[1], lift: base.lift, turn: 40 };
  var state = Object.assign({}, DEFAULT), whole = false;

  // Where each kind sits from the accent, in degrees of hue. Topic keeps the
  // accent's own hue: it is the default tag.
  var HARMONY = {
    pentad:    { person: 72, group: 144, event: 216, course: 288 },     // five, evenly
    analogous: { person: -50, group: -25, event: 25, course: 50 },      // neighbors
    split:     { person: 150, group: 210, event: 30, course: -30 },     // either side of the opposite, and of itself
    square:    { person: 90, group: 180, event: 270, course: 135 }      // quarters, and one between
  };
  var STATUS = { ok: 152, warn: 70, alert: 30 };
  var KINDS = ['person', 'group', 'event', 'course', 'topic'], ORDER = ['accent', 'neutral'].concat(KINDS, ['ok', 'warn', 'alert']);
  var NAMES = { accent: 'Accent', neutral: 'Neutral', person: 'Person', group: 'Group', event: 'Event', course: 'Course', topic: 'Topic', ok: 'Ok', warn: 'Warn', alert: 'Alert' };

  function mod(v, n) { return ((v % n) + n) % n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function css(c, a) { return 'oklch(' + (+c[0].toFixed(3)) + ' ' + (+c[1].toFixed(3)) + ' ' + (+mod(c[2], 360).toFixed(1)) + (a == null ? '' : ' / ' + a) + ')'; }
  // Is an OKLCH color inside sRGB? math.js clips; a derived seed should not need it.
  function inGamut(c) {
    var a = c[1] * Math.cos(c[2] * Math.PI / 180), b = c[1] * Math.sin(c[2] * Math.PI / 180);
    var l = Math.pow(c[0] + 0.3963377774 * a + 0.2158037573 * b, 3), m = Math.pow(c[0] - 0.1055613458 * a - 0.0638541728 * b, 3), s = Math.pow(c[0] - 0.0894841775 * a - 1.291485548 * b, 3);
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
      .every(function (x) { return x > -0.001 && x < 1.001; });
  }
  // A derived seed: brought inside the gamut, then held where its ink reads at 4.5:1.
  function hold(c) {
    c = c.slice(); c[2] = mod(c[2], 360);
    while (c[1] > 0.01 && !inGamut(c)) c[1] -= 0.004;
    var seed = { color: { flip: base.flip } }, n = 0;
    while (M.contrast(M.ink(c, seed), c) < 4.5 && n++ < 80) c[0] += c[0] < base.flip ? -0.004 : 0.004;
    return c;
  }
  function derive() {
    var acc = [state.l, state.c, state.h], off = HARMONY[state.harmony], seeds = { accent: acc };
    var nh = state.neutral === 'accent' ? state.h : state.neutral === 'complement' ? state.h + 180 : base.seeds.neutral[2];
    seeds.neutral = [0.55, state.tint, mod(nh, 360)];
    KINDS.forEach(function (k) { seeds[k] = hold(k === 'topic' ? [state.l - 0.045, state.c, state.h] : [state.l, state.c * 0.85, state.h + off[k]]); });
    Object.keys(STATUS).forEach(function (k) { seeds[k] = hold([state.l, clamp(state.c * 0.9, 0.1, 0.17), STATUS[k]]); });
    return { color: { seeds: seeds, lift: state.lift, flip: base.flip, neutrals: base.neutrals } };
  }

  // ---- The wheel ---------------------------------------------------------------
  var wheel = sec.querySelector('[data-pal-wheel]');
  function drawWheel(seed) {
    var dpr = window.devicePixelRatio || 1, S = wheel.clientWidth, u = window.Trellis && Trellis.cell ? Trellis.cell() : 12;
    if (wheel.width !== Math.round(S * dpr)) wheel.width = wheel.height = Math.round(S * dpr);
    var ctx = wheel.getContext('2d'), cx = S / 2, R = S / 2 - 1, r = R - 2 * u, mid = (R + r) / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, S, S);
    // The ring: every hue at the accent's own lightness and strength.
    for (var d = 0; d < 360; d++) {
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(d * TAU / 360) * r, cx + Math.sin(d * TAU / 360) * r);
      ctx.arc(cx, cx, R, d * TAU / 360, (d + 1.6) * TAU / 360); ctx.arc(cx, cx, r, (d + 1.6) * TAU / 360, d * TAU / 360, true);
      ctx.fillStyle = M.hex([state.l, state.c, d + 0.5]); ctx.fill();
    }
    function at(h, rad) { return [cx + Math.cos(h * TAU / 360) * rad, cx + Math.sin(h * TAU / 360) * rad]; }
    var text = getComputedStyle(sec).color, ground = getComputedStyle(root).getPropertyValue('--bg').trim() || '#fff';
    // The harmony: a spoke to each kind, and the shape they make.
    ctx.lineWidth = 1; ctx.strokeStyle = text; ctx.globalAlpha = 0.35;
    var pts = ['accent'].concat(KINDS.slice(0, 4)).map(function (k) { return at(seed.color.seeds[k][2], r - u / 2); });
    pts.sort(function (a, b) { return Math.atan2(a[1] - cx, a[0] - cx) - Math.atan2(b[1] - cx, b[0] - cx); });
    ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.stroke();
    ctx.globalAlpha = 1;
    KINDS.slice(0, 4).concat(['ok', 'warn', 'alert']).forEach(function (k) {
      var c = seed.color.seeds[k], p = at(c[2], mid), status = STATUS[k] != null;
      ctx.beginPath(); ctx.arc(p[0], p[1], status ? u / 3 : u / 2, 0, TAU); ctx.fillStyle = M.hex(c); ctx.fill();
      ctx.lineWidth = status ? 1 : 2; ctx.strokeStyle = status ? text : ground; ctx.stroke();
    });
    var a = at(state.h, mid);
    ctx.beginPath(); ctx.arc(a[0], a[1], u * 0.8, 0, TAU); ctx.fillStyle = M.hex([state.l, state.c, state.h]); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ground; ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = text; ctx.beginPath(); ctx.arc(a[0], a[1], u * 0.8 + 2, 0, TAU); ctx.stroke();
  }
  function fromPointer(e) {
    var b = wheel.getBoundingClientRect();
    state.h = Math.round(mod(Math.atan2(e.clientY - b.top - b.height / 2, e.clientX - b.left - b.width / 2) * 360 / TAU, 360));
    render();
  }
  wheel.addEventListener('pointerdown', function (e) { wheel.setPointerCapture(e.pointerId); fromPointer(e); });
  wheel.addEventListener('pointermove', function (e) { if (wheel.hasPointerCapture(e.pointerId)) fromPointer(e); });

  // ---- Controls ------------------------------------------------------------------
  var inputs = {}, outs = {};
  sec.querySelectorAll('[data-pal-in]').forEach(function (el) {
    inputs[el.dataset.palIn] = el;
    el.addEventListener('input', function () { state[el.dataset.palIn] = parseFloat(el.value); render(); });
  });
  sec.querySelectorAll('[data-pal-out]').forEach(function (el) { outs[el.dataset.palOut] = el; });
  ['harmony', 'neutral'].forEach(function (name) {
    sec.querySelectorAll('[data-pal-' + name + ']').forEach(function (tab) {
      tab.addEventListener('click', function () { state[name] = tab.getAttribute('data-pal-' + name); render(); });
    });
  });
  var FORMAT = { h: function (v) { return Math.round(v) + '°'; }, c: function (v) { return v.toFixed(3); }, l: function (v) { return v.toFixed(3); }, tint: function (v) { return v.toFixed(3); }, lift: function (v) { return v.toFixed(3); }, turn: function (v) { return Math.round(v) + '°'; } };
  function stops(fn, n) { var out = []; for (var i = 0; i <= n; i++) out.push(css(fn(i / n))); return 'linear-gradient(to right, ' + out.join(', ') + ')'; }
  function controls() {
    Object.keys(inputs).forEach(function (k) { if (parseFloat(inputs[k].value) !== state[k]) inputs[k].value = state[k]; if (outs[k]) outs[k].textContent = FORMAT[k](state[k]); });
    ['harmony', 'neutral'].forEach(function (name) {
      sec.querySelectorAll('[data-pal-' + name + ']').forEach(function (tab) { tab.setAttribute('aria-selected', String(tab.getAttribute('data-pal-' + name) === state[name])); });
    });
    var acc = css([state.l, state.c, state.h]);
    inputs.h.style.setProperty('--range-fill', stops(function (t) { return [state.l, state.c, t * 360]; }, 24));
    inputs.c.style.setProperty('--range-fill', stops(function (t) { return [state.l, 0.02 + t * 0.22, state.h]; }, 6));
    inputs.l.style.setProperty('--range-fill', stops(function (t) { return [0.42 + t * 0.24, state.c, state.h]; }, 6));
    ['h', 'c', 'l'].forEach(function (k) { inputs[k].style.setProperty('--range-thumb', acc); });
  }

  // ---- What follows ---------------------------------------------------------------
  var seedBox = sec.querySelector('[data-pal-seeds]');
  function seedsRow(seed) {
    var s = seed.color.seeds, html = '';
    ORDER.forEach(function (k) {
      var c = k === 'neutral' ? [0.55, s.neutral[1], s.neutral[2]] : s[k], ink = M.ink(c, seed), ratio = M.contrast(ink, c);
      html += '<div class="pal-seed' + (k === 'accent' ? ' cc-chosen' : '') + '"><span class="pal-chip" style="--c: ' + css(c) + '; --i: ' + css(ink) + '"><b>Aa</b><span>' + ratio.toFixed(1) + (ratio < 4.5 ? ' !' : '') + '</span></span>' +
        '<span class="pal-seed-name">' + NAMES[k] + '</span><span class="pal-seed-val">' + Math.round(mod(c[2], 360)) + '° · ' + c[1].toFixed(2).replace(/^0/, '') + '</span></div>';
    });
    seedBox.innerHTML = html;
  }
  function schemes(seed) {
    sec.querySelectorAll('[data-pal-scheme]').forEach(function (panel) {
      var theme = panel.dataset.palScheme, pal = M.palette(theme, seed);
      Object.keys(pal).forEach(function (k) { panel.style.setProperty('--' + k, css(pal[k])); });
      var worst = ['kind-person', 'kind-group', 'kind-event', 'kind-course', 'kind-topic', 'ok', 'warn', 'alert'].map(function (k) { return M.contrast(M.ink(pal[k], seed), pal[k]); }).sort(function (a, b) { return a - b; })[0];
      var parts = [['Text', M.contrast(pal.text, pal.bg)], ['Tertiary on the third level', M.contrast(pal['text-tertiary'], pal['bg-raised-3'])], ['Ink on the accent', M.contrast(pal['accent-ink'], pal.accent)], ['The lowest ink on a kind or status', worst]];
      panel.querySelector('[data-pal-contrast]').textContent = parts.map(function (p) { return p[0] + ' ' + p[1].toFixed(1) + ':1' + (p[1] < 4.5 ? ' (under 4.5)' : ''); }).join(' · ') + '.';
    });
  }
  function extras(seed) {
    var s = seed.color.seeds, acc = s.accent, g = {};
    g.accent = 'linear-gradient(to right in oklch, ' + css(acc) + ', ' + css([acc[0], acc[1], acc[2] + state.turn]) + ')';
    var ring = ['accent'].concat(KINDS.slice(0, 4)).map(function (k) { return s[k]; }).sort(function (a, b) { return mod(a[2] - acc[2], 360) - mod(b[2] - acc[2], 360); });
    g.harmony = 'linear-gradient(to right in oklch, ' + ring.map(function (c) { return css(c); }).join(', ') + ')';
    g.ground = 'linear-gradient(to right in oklab, var(--bg), color-mix(in oklab, ' + css(acc) + ' 22%, var(--bg)))';
    sec.querySelectorAll('[data-pal-gradient]').forEach(function (el) { el.style.setProperty('--g', g[el.dataset.palGradient]); });
    // A shadow leans toward the accent's opposite; offsets and blurs double, in cells.
    var shade = function (a) { return 'light-dark(' + css([0.25, 0.05, acc[2] + 180], a) + ', ' + css([0, 0, 0], a * 3.2) + ')'; };
    var S = { 1: '0 var(--sp-q) var(--sp-1) ' + shade(0.12), 2: '0 var(--sp-h) var(--sp-2) ' + shade(0.14), 3: '0 var(--sp-1) var(--sp-4) ' + shade(0.16) };
    sec.querySelectorAll('[data-pal-shadow]').forEach(function (el) { el.style.setProperty('--s', S[el.dataset.palShadow]); });
  }
  function vars(seed) {
    var s = seed.color.seeds, v = {};
    ['neutral', 'accent'].concat(KINDS, ['ok', 'warn', 'alert']).forEach(function (k) { v['--seed-' + k] = css(s[k]); });
    v['--color-lift'] = String(+state.lift.toFixed(3)); v['--gradient-turn'] = String(Math.round(state.turn));
    return v;
  }
  var out = sec.querySelector('[data-pal-export]');
  function exportLayer(v) {
    out.textContent = '@layer trellis.product {\n  :root[data-product="yours"] {\n' + Object.keys(v).map(function (k) { return '    ' + k + ': ' + v[k] + ';'; }).join('\n') + '\n  }\n}\n';
  }
  var applied = [];
  function page(v) {
    applied.forEach(function (k) { root.style.removeProperty(k); }); applied = [];
    if (!whole) return;
    Object.keys(v).forEach(function (k) { root.style.setProperty(k, v[k]); applied.push(k); });
  }

  function render() {
    var seed = derive(), v = vars(seed);
    controls(); drawWheel(seed); seedsRow(seed); schemes(seed); extras(seed); exportLayer(v); page(v);
  }
  var wholeBtn = sec.querySelector('[data-pal-whole]');
  wholeBtn.addEventListener('click', function () { whole = wholeBtn.getAttribute('aria-checked') !== 'true'; wholeBtn.setAttribute('aria-checked', String(whole)); render(); });
  sec.querySelector('[data-pal-reset]').addEventListener('click', function () { state = Object.assign({}, DEFAULT); render(); });
  sec.querySelector('[data-pal-copy]').addEventListener('click', function (e) {
    var label = e.currentTarget.querySelector('.button-label');
    if (navigator.clipboard) navigator.clipboard.writeText(out.textContent).then(function () { label.textContent = 'Copied'; setTimeout(function () { label.textContent = 'Copy'; }, 1500); });
  });
  // The wheel draws in the page's inks: follow the theme, the cell and the size.
  new MutationObserver(function () { requestAnimationFrame(render); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('resize', function () { requestAnimationFrame(render); });
  if ('ResizeObserver' in window) new ResizeObserver(function () { drawWheel(derive()); }).observe(wheel);
  render();
})();
