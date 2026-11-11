/* Trellis · solids · an experiment (v0.6)
   Point, line, plane, then: solid, motion, transformation.
   Each form is the convex hull of a set of points that moves continuously,
   so one solid becomes another by geometry, not by a crossfade:
     cube → dodecahedron     the cube's edges lift into roofs (pyritohedra)
     cube → tetrahedron      every other corner sinks to the center
     cube → octahedron       truncation, through the cuboctahedron
                             (Fuller's vector equilibrium)
     octahedron → icosahedron  vertices slide along the golden ratio
   Drawn on a canvas at device resolution: points are dots, lines are one
   CSS pixel, planes are flat-shaded in the product's colors. The resting
   view is 2:1 dimetric, the same slope as the isometric lattice. Motion
   pauses off-screen and when the reader prefers reduced motion. */
(function () {
  'use strict';
  var PHI = (1 + Math.sqrt(5)) / 2;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---- Point sets -----------------------------------------------------------
  function signs(p) {      // every sign combination of a point
    var out = [[]];
    p.forEach(function (v) {
      var next = [];
      out.forEach(function (o) { next.push(o.concat(v)); if (v) next.push(o.concat(-v)); });
      out = next;
    });
    return out;
  }
  function cyclic(p) { return [p, [p[1], p[2], p[0]], [p[2], p[0], p[1]]]; }
  function perms(p) {
    return [[p[0], p[1], p[2]], [p[0], p[2], p[1]], [p[1], p[0], p[2]], [p[1], p[2], p[0]], [p[2], p[0], p[1]], [p[2], p[1], p[0]]];
  }
  function expand(bases, family) {
    var pts = [];
    bases.forEach(function (b) { family(b).forEach(function (q) { signs(q).forEach(function (s) { pts.push(s); }); }); });
    return pts;
  }
  var CUBE = signs([1, 1, 1]);
  var SHAPES = {
    // h: 0 is the cube (roofs flat on its faces), 1/φ the regular dodecahedron
    pyrito: function (h) { return CUBE.concat(expand([[0, 1 - h * h, 1 + h]], cyclic)); },
    // s: 1 is the cube, under ⅓ the odd corners are inside: a tetrahedron
    tetra: function (s) { return CUBE.map(function (p) { var odd = (p[0] * p[1] * p[2]) < 0; return odd ? p.map(function (v) { return v * s; }) : p; }); },
    // c: 1 → 0 cube → cuboctahedron; then b: 1 → 0 cuboctahedron → octahedron
    trunc: function (c) { return expand([[1, 1, c]], perms); },
    rect: function (b) { return expand([[1, b, 0]], perms); },
    // k: 0 is the octahedron, φ the icosahedron
    jessen: function (k) { return expand([[0, 1, k]], cyclic); }
  };

  // The cycle: [shape, from, to, name at the start, name at the end, seconds]
  var ease = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var STAGES = [
    ['pyrito', 0, 1 / PHI, 'Cube', 'Dodecahedron'],
    ['pyrito', 1 / PHI, 0, 'Dodecahedron', 'Cube'],
    ['tetra', 1, .2, 'Cube', 'Tetrahedron'],
    ['tetra', .2, 1, 'Tetrahedron', 'Cube'],
    ['trunc', 1, 0, 'Cube', 'Cuboctahedron'],
    ['rect', 1, 0, 'Cuboctahedron', 'Octahedron'],
    ['jessen', 0, PHI, 'Octahedron', 'Icosahedron'],
    ['jessen', PHI, 0, 'Icosahedron', 'Octahedron'],
    ['rect', 0, 1, 'Octahedron', 'Cuboctahedron'],
    ['trunc', 0, 1, 'Cuboctahedron', 'Cube']
  ];
  var MOVE = 2.6, HOLD = 1.4, STEP = MOVE + HOLD;

  function morph(t) {      // t in seconds → { pts, name }
    var cycle = STAGES.length * STEP, local = ((t % cycle) + cycle) % cycle;
    var i = Math.floor(local / STEP), x = local - i * STEP, st = STAGES[i];
    var f = x < HOLD ? 0 : ease((x - HOLD) / MOVE);
    var v = st[1] + (st[2] - st[1]) * f;
    return { pts: SHAPES[st[0]](v), name: f < .5 ? st[3] : st[4] };
  }

  // ---- Hull ------------------------------------------------------------------
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function unit(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

  function hull(raw) {
    // Dedupe, then scale so the farthest point is at radius 1.
    var pts = [];
    raw.forEach(function (p) { if (!pts.some(function (q) { return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]) < 1e-6; })) pts.push(p); });
    var r = Math.max.apply(null, pts.map(function (p) { return Math.hypot(p[0], p[1], p[2]); }));
    pts = pts.map(function (p) { return [p[0] / r, p[1] / r, p[2] / r]; });
    var n = pts.length, eps = 1e-5, planes = [];
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) for (var k = j + 1; k < n; k++) {
      var nrm = cross(sub(pts[j], pts[i]), sub(pts[k], pts[i]));
      if (Math.hypot(nrm[0], nrm[1], nrm[2]) < 1e-7) continue;
      nrm = unit(nrm);
      var d = dot(nrm, pts[i]), pos = false, neg = false;
      for (var m = 0; m < n && !(pos && neg); m++) {
        var s = dot(nrm, pts[m]) - d;
        if (s > eps) pos = true; else if (s < -eps) neg = true;
      }
      if (pos && neg) continue;
      if (pos) { nrm = [-nrm[0], -nrm[1], -nrm[2]]; d = -d; }
      if (planes.some(function (pl) { return dot(pl.n, nrm) > 1 - 1e-6 && Math.abs(pl.d - d) < 1e-5; })) continue;
      planes.push({ n: nrm, d: d });
    }
    // Each plane's points, in order around their center: the face polygon.
    var faces = planes.map(function (pl) {
      var on = pts.filter(function (p) { return Math.abs(dot(pl.n, p) - pl.d) < 1e-4; });
      var c = [0, 0, 0]; on.forEach(function (p) { c[0] += p[0] / on.length; c[1] += p[1] / on.length; c[2] += p[2] / on.length; });
      var ax = unit(sub(on[0], c)), ay = cross(pl.n, ax);
      on.sort(function (a, b) {
        var va = sub(a, c), vb = sub(b, c);
        return Math.atan2(dot(va, ay), dot(va, ax)) - Math.atan2(dot(vb, ay), dot(vb, ax));
      });
      return { n: pl.n, pts: on };
    });
    return { pts: pts, faces: faces };
  }

  // ---- Drawing ------------------------------------------------------------------
  function rotation(yaw, pitch) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    return function (p) {
      var x = cy * p[0] + sy * p[2], z = -sy * p[0] + cy * p[2];
      return [x, cp * p[1] - sp * z, sp * p[1] + cp * z];
    };
  }
  var probe;
  function ink(el, v) {
    if (!probe) { probe = document.createElement('span'); probe.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'; }
    el.parentElement.appendChild(probe);
    probe.style.color = 'var(' + v + ')';
    var c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  }

  function draw(cv, model, yaw, pitch) {
    var dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr)) cv.width = Math.round(w * dpr);
    if (cv.height !== Math.round(h * dpr)) cv.height = Math.round(h * dpr);
    var g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    var R = rotation(yaw, pitch), s = Math.min(w, h) * .4, cx = w / 2, cy = h / 2;
    var P = function (p) { var q = R(p); return [cx + q[0] * s, cy - q[1] * s, q[2]]; };
    var col = cv._ink, light = unit([-.4, .7, .6]);
    var u = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--u-px')) || 12;
    // Back edges first, faint: the lines behind the planes.
    g.lineWidth = 1; g.lineJoin = 'round';
    model.faces.forEach(function (f) {
      if (R(f.n)[2] > 0) return;
      g.strokeStyle = col.text; g.globalAlpha = .14;
      g.beginPath(); f.pts.forEach(function (p, i) { var q = P(p); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.closePath(); g.stroke();
    });
    // Front planes, flat-shaded, then their edges.
    model.faces.forEach(function (f) {
      var n = R(f.n);
      if (n[2] <= 0) return;
      var lit = Math.max(0, dot(n, light));
      g.globalAlpha = .12 + .5 * lit;
      g.fillStyle = col.face;
      g.beginPath(); f.pts.forEach(function (p, i) { var q = P(p); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.closePath(); g.fill();
      g.globalAlpha = .85; g.strokeStyle = col.text; g.stroke();
    });
    // Points: a dot at every vertex in front.
    g.fillStyle = col.point; g.globalAlpha = 1;
    model.pts.forEach(function (p) {
      var q = P(p);
      if (q[2] < -.05) return;
      g.beginPath(); g.arc(q[0], q[1], u / 4, 0, Math.PI * 2); g.fill();
    });
    g.globalAlpha = 1;
  }

  // ---- Mounting -------------------------------------------------------------------
  var DIMETRIC = { yaw: Math.PI / 4, pitch: Math.PI / 6 };   // 2:1, the lattice's slope
  var CUBE_MODEL = hull(CUBE);
  var all = [];

  function mount(cv) {
    var mode = cv.dataset.solid, nameEl = cv.closest('.solid-cell') && cv.closest('.solid-cell').querySelector('[data-solid-name]');
    var item = { cv: cv, mode: mode, nameEl: nameEl, visible: false, last: '' };
    all.push(item);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { item.visible = es[0].isIntersecting; }).observe(cv);
    else item.visible = true;
  }

  function frame(now) {
    var t = now / 1000, moving = !still.matches;
    all.forEach(function (it) {
      if (!it.visible && it.drawn) return;
      it.cv._ink = it.cv._ink || { face: ink(it.cv, '--kind-group'), text: ink(it.cv, '--text'), point: ink(it.cv, '--accent') };
      var yaw = DIMETRIC.yaw, pitch = DIMETRIC.pitch, model = CUBE_MODEL;
      if (it.mode !== 'solid' && moving) {
        yaw += t * .5;
        pitch = DIMETRIC.pitch + Math.sin(t * .37) * .35;
      }
      if (it.mode === 'transform') {
        var m = morph(moving ? t : HOLD / 2);
        model = hull(m.pts);
        if (it.nameEl && m.name !== it.last) { it.last = m.name; it.nameEl.textContent = m.name; }
      }
      if (it.mode === 'solid' && it.drawn && !it.dirty) return;
      draw(it.cv, model, yaw, pitch);
      it.drawn = true; it.dirty = false;
    });
    requestAnimationFrame(frame);
  }

  // Colors change with the product and theme: re-read them, redraw the still one.
  function refresh() { all.forEach(function (it) { it.cv._ink = null; it.dirty = true; }); }
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-product', 'data-theme', 'style'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh);
  window.addEventListener('resize', refresh);

  function start() {
    document.querySelectorAll('canvas[data-solid]').forEach(mount);
    if (all.length) requestAnimationFrame(frame);
  }
  window.TrellisSolids = { refresh: refresh };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
