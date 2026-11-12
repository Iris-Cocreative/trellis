/* Trellis · solids · an experiment (v0.7)
   Point, line, plane, then: solid, motion, transformation.
   Solid: a cube at rest on the lattice.
   Motion: the same cube, in the same view, makes a quarter turn about its
   own vertical axis, rests, then about its depth axis, rests, then about
   its width axis, rests. A cube turned a quarter is the cube again, so every
   turn leaves the lattice and lands back on it.
   Transformation: the form is the convex hull of a set of points that moves
   continuously, so one solid becomes another by geometry, not by a crossfade:
     cube → cuboctahedron → octahedron → cuboctahedron → cube
   by truncating the corners. Each form is scaled to the cube's mean width,
   so it keeps its apparent size, and makes a quarter turn while it changes.
   Drawn on a canvas at device resolution: points are dots, lines are one
   CSS pixel, planes are flat-shaded in the product's colors. The resting
   view is 2:1 dimetric, the same slope as the isometric lattice. Motion
   pauses off-screen and rests when the reader prefers reduced motion. */
(function () {
  'use strict';
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
    // c: 1 → 0 cube → cuboctahedron (the corners cut until the cuts meet)
    trunc: function (c) { return expand([[1, 1, c]], perms); },
    // b: 1 → 0 cuboctahedron → octahedron (the square faces shrink to points)
    rect: function (b) { return expand([[1, b, 0]], perms); }
  };

  // ---- Time -------------------------------------------------------------------
  // Rest on the lattice, then move off it and back, eased in and out.
  var ease = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var MOVE = 2.6, HOLD = 1.4, STEP = MOVE + HOLD;
  function phase(t, n) {   // t in seconds over n steps → { i, f }: f is 0 at rest, 1 on arrival
    var cycle = n * STEP, local = ((t % cycle) + cycle) % cycle;
    var i = Math.floor(local / STEP), x = local - i * STEP;
    return { i: i, f: x < HOLD ? 0 : ease((x - HOLD) / MOVE) };
  }

  // The transformation: [shape, from, to, name at the start, name at the end]
  var STAGES = [
    ['trunc', 1, 0, 'Cube', 'Cuboctahedron'],
    ['rect', 1, 0, 'Cuboctahedron', 'Octahedron'],
    ['rect', 0, 1, 'Octahedron', 'Cuboctahedron'],
    ['trunc', 0, 1, 'Cuboctahedron', 'Cube']
  ];
  function morph(t) {      // t in seconds → { pts, name, f }
    var p = phase(t, STAGES.length), st = STAGES[p.i];
    var v = st[1] + (st[2] - st[1]) * p.f;
    return { pts: SHAPES[st[0]](v), name: p.f < .5 ? st[3] : st[4], f: p.f };
  }

  // The motion: quarter turns about the cube's own axes, vertical (y here),
  // then depth (z), then width (x).
  var TURNS = [1, 2, 0];
  function turn(t) {       // t in seconds → { axis, angle }
    var p = phase(t, TURNS.length);
    return { axis: TURNS[p.i], angle: p.f * Math.PI / 2 };
  }

  // ---- Hull ------------------------------------------------------------------
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function unit(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

  // Mean width: the form's breadth, averaged over every direction. Holding it
  // fixed keeps the apparent size while the form changes, seen from any side.
  var DIRS = [];
  for (var di = 0, DN = 96, GA = Math.PI * (3 - Math.sqrt(5)); di < DN; di++) {
    var dy = 1 - 2 * (di + .5) / DN, dr = Math.sqrt(1 - dy * dy);
    DIRS.push([dr * Math.cos(GA * di), dy, dr * Math.sin(GA * di)]);
  }
  function meanWidth(pts) {
    var sum = 0;
    DIRS.forEach(function (d) {
      var lo = Infinity, hi = -Infinity;
      pts.forEach(function (p) { var s = dot(p, d); if (s < lo) lo = s; if (s > hi) hi = s; });
      sum += hi - lo;
    });
    return sum / DIRS.length;
  }
  var UNIT_WIDTH = meanWidth(CUBE) / Math.sqrt(3);   // the cube with its corners at radius 1

  function hull(raw) {
    // Dedupe, so a form at rest has only its own points, then scale it to the cube's mean width.
    var pts = [];
    raw.forEach(function (p) { if (!pts.some(function (q) { return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]) < 1e-6; })) pts.push(p); });
    var k = UNIT_WIDTH / meanWidth(pts);
    pts = pts.map(function (p) { return [p[0] * k, p[1] * k, p[2] * k]; });
    var n = pts.length, eps = 1e-5, planes = [];
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) for (var k2 = j + 1; k2 < n; k2++) {
      var nrm = cross(sub(pts[j], pts[i]), sub(pts[k2], pts[i]));
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
  function spin(axis, a, view) {   // turn the solid about its own axis, then look at it
    if (!a) return view;
    var c = Math.cos(a), s = Math.sin(a);
    return function (p) {
      var x = p[0], y = p[1], z = p[2];
      if (axis === 0) return view([x, c * y - s * z, s * y + c * z]);
      if (axis === 1) return view([c * x + s * z, y, -s * x + c * z]);
      return view([c * x - s * y, s * x + c * y, z]);
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

  function draw(cv, model, R) {
    var dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr)) cv.width = Math.round(w * dpr);
    if (cv.height !== Math.round(h * dpr)) cv.height = Math.round(h * dpr);
    var g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    var s = Math.min(w, h) * .4, cx = w / 2, cy = h / 2;
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
    // Points: a dot at every vertex in front. A corner that is just splitting
    // stays one dot at its center, and its dots slide out to their vertices
    // as they separate, so there are never more dots than readable points.
    var near = u / 2 / s, groups = [], dots = [];   // near: one dot's width, in model units
    model.pts.forEach(function (p) {
      var gp = groups.filter(function (c) { return Math.hypot(p[0] - c[0][0], p[1] - c[0][1], p[2] - c[0][2]) < 2 * near; })[0];
      if (gp) gp.push(p); else groups.push([p]);
    });
    groups.forEach(function (gp) {
      var c = [0, 0, 0], rho = 0;
      gp.forEach(function (p) { c[0] += p[0] / gp.length; c[1] += p[1] / gp.length; c[2] += p[2] / gp.length; });
      gp.forEach(function (p) { rho = Math.max(rho, Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2])); });
      var w = Math.min(1, Math.max(0, (rho - .45 * near) / (.5 * near)));
      w = w * w * (3 - 2 * w);
      if (!w) { dots.push(c); return; }
      gp.forEach(function (p) { dots.push([c[0] + (p[0] - c[0]) * w, c[1] + (p[1] - c[1]) * w, c[2] + (p[2] - c[2]) * w]); });
    });
    g.fillStyle = col.point; g.globalAlpha = 1;
    dots.forEach(function (p) {
      var q = P(p);
      if (q[2] < -.05) return;
      g.beginPath(); g.arc(q[0], q[1], u / 4, 0, Math.PI * 2); g.fill();
    });
    g.globalAlpha = 1;
  }

  // ---- Mounting -------------------------------------------------------------------
  var DIMETRIC = rotation(Math.PI / 4, Math.PI / 6);   // 2:1, the lattice's slope
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
      // At rest (the still cube, or all of them for less motion): draw once, then only on change.
      if ((it.mode === 'solid' || !moving) && it.drawn && !it.dirty) return;
      it.cv._ink = it.cv._ink || { face: ink(it.cv, '--kind-group'), text: ink(it.cv, '--text'), point: ink(it.cv, '--accent') };
      var model = CUBE_MODEL, R = DIMETRIC;
      if (it.mode === 'motion' && moving) {
        var q = turn(t);
        R = spin(q.axis, q.angle, DIMETRIC);
      }
      if (it.mode === 'transform') {
        var m = morph(moving ? t : 0);
        model = hull(m.pts);
        R = spin(1, m.f * Math.PI / 2, DIMETRIC);
        if (it.nameEl && m.name !== it.last) { it.last = m.name; it.nameEl.textContent = m.name; }
      }
      draw(it.cv, model, R);
      it.drawn = true; it.dirty = false;
    });
    requestAnimationFrame(frame);
  }

  // Colors change with the product and theme: re-read them, redraw the still ones.
  function refresh() { all.forEach(function (it) { it.cv._ink = null; it.dirty = true; }); }
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-product', 'data-theme', 'style'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh);
  window.addEventListener('resize', refresh);
  still.addEventListener('change', refresh);

  function start() {
    document.querySelectorAll('canvas[data-solid]').forEach(mount);
    if (all.length) requestAnimationFrame(frame);
  }
  window.TrellisSolids = { refresh: refresh };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
