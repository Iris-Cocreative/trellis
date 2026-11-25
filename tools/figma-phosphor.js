/* Trellis · figma-phosphor · Phosphor's drawings, as Figma's vectors take them
   Reads the specimen's sprite (index.html: Phosphor's raw drawings, as strokes
   with no width of their own, D118) and its notice, and gives each icon asked
   for as one path on the 256 square, absolute M, L, C and Z only, with the top
   left of its box, since a vector in Figma stands at its own path's corner. A
   drawing in strokes alone: bold, fill and duotone are other drawings. */
'use strict';
const fs = require('fs');
const path = require('path');

const round = (n) => Math.round(n * 100) / 100;
const attrs = (s) => Object.fromEntries([...s.matchAll(/([a-z0-9-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const nums = (s) => (s.match(/-?(?:\d+\.?\d*|\.\d+)/g) || []).map(Number);

// An SVG arc as cubics (the specification's own arithmetic, for a circle).
function arc(x1, y1, r, large, sweep, x2, y2) {
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2, d = Math.hypot(dx, dy);
  r = Math.max(r, d);
  const k = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, (r * r - d * d) / (d * d)));
  const cx = k * dy + (x1 + x2) / 2, cy = -k * dx + (y1 + y2) / 2;
  const a = Math.atan2(y1 - cy, x1 - cx);
  let t = Math.atan2(y2 - cy, x2 - cx) - a;
  if (sweep && t < 0) t += 2 * Math.PI; else if (!sweep && t > 0) t -= 2 * Math.PI;
  const n = Math.ceil(Math.abs(t) / (Math.PI / 2) - 1e-6), out = [];
  for (let i = 0; i < n; i++) {
    const p = a + (t * i) / n, q = a + (t * (i + 1)) / n, h = (4 / 3) * Math.tan((q - p) / 4) * r;
    out.push([cx + r * Math.cos(p) - h * Math.sin(p), cy + r * Math.sin(p) + h * Math.cos(p), cx + r * Math.cos(q) + h * Math.sin(q), cy + r * Math.sin(q) - h * Math.cos(q), cx + r * Math.cos(q), cy + r * Math.sin(q)]);
  }
  return out;
}

// A path's commands, absolute, as [M x y], [L x y], [C six], [Z].
const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, A: 7, Z: 0 };
// An arc's two flags are one digit each, and may run into the next number.
const arcNums = (s) => {
  const N = '[ ,]*(-?(?:\\d+\\.?\\d*|\\.\\d+))', F = '[ ,]*([01])';
  return [...s.matchAll(new RegExp(N + N + N + F + F + N + N, 'g'))].flatMap((m) => m.slice(1).map(Number));
};
function segments(d) {
  const out = []; let x = 0, y = 0, sx = 0, sy = 0, last = null;
  for (const [, cmd, rest] of d.matchAll(/([a-zA-Z])([^a-zA-Z]*)/g)) {
    const up = cmd.toUpperCase(), rel = cmd !== up, n = ARGS[up];
    if (n === undefined) throw new Error(`figma-phosphor: a path command ${cmd} in ${d}`);
    const v = up === 'A' ? arcNums(rest) : nums(rest);
    for (let i = 0; i === 0 || i < v.length; i += n || 1) {
      const a = v.slice(i, i + n), X = (k) => a[k] + (rel ? x : 0), Y = (k) => a[k] + (rel ? y : 0);
      let next = null;
      if (up === 'Z') { out.push(['Z']); x = sx; y = sy; }
      else if (up === 'M' && i === 0) { [x, y] = [X(0), Y(1)]; sx = x; sy = y; out.push(['M', x, y]); }
      else if (up === 'L' || up === 'M') { [x, y] = [X(0), Y(1)]; out.push(['L', x, y]); }
      else if (up === 'H') { x = X(0); out.push(['L', x, y]); }
      else if (up === 'V') { y = Y(0); out.push(['L', x, y]); }
      else if (up === 'A') {
        const [ex, ey] = [X(5), Y(6)];
        if (a[0] !== a[1]) throw new Error('figma-phosphor: an arc that is not a circle\'s');
        for (const c of arc(x, y, a[0], !!a[3], !!a[4], ex, ey)) out.push(['C', ...c]);
        x = ex; y = ey;
      } else {
        const c = up === 'C' ? [X(0), Y(1), X(2), Y(3), X(4), Y(5)] : [last ? 2 * x - last[0] : x, last ? 2 * y - last[1] : y, X(0), Y(1), X(2), Y(3)];
        out.push(['C', ...c]); next = [c[2], c[3]]; x = c[4]; y = c[5];
      }
      last = next;
      if (!n) break;
    }
  }
  return out;
}
const points = (s, close) => { const v = nums(s); return v.reduce((d, _, i) => (i % 2 ? d : d + `${i ? 'L' : 'M'}${v[i]} ${v[i + 1]}`), '') + (close ? 'Z' : ''); };
function shape(tag, a) {
  const n = (k) => +a[k];
  if (a['stroke-width'] || a.class || !a.stroke) throw new Error(`figma-phosphor: a ${tag} that is not a plain stroke`);
  if (tag === 'path') return a.d;
  if (tag === 'line') return `M${n('x1')} ${n('y1')}L${n('x2')} ${n('y2')}`;
  if (tag === 'polyline') return points(a.points);
  if (tag === 'polygon') return points(a.points, true);
  // A dot (a circle with a fill, smaller than its line) is a ring with a hole where the line doesn't reach: a short line fills it.
  if (tag === 'circle') return `M${n('cx') - n('r')} ${n('cy')}A${n('r')} ${n('r')} 0 1 1 ${n('cx') + n('r')} ${n('cy')}A${n('r')} ${n('r')} 0 1 1 ${n('cx') - n('r')} ${n('cy')}Z` + (a.fill === 'none' ? '' : `M${n('cx') - 1} ${n('cy')}L${n('cx') + 1} ${n('cy')}`);
  if (tag === 'rect') { const [x, y, w, h, r] = ['x', 'y', 'width', 'height', 'rx'].map(n); return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`; }
  throw new Error(`figma-phosphor: a ${tag}`);
}

// The path's box: a cubic's ends, and where it turns.
function corner(segs) {
  const xs = [], ys = []; let x = 0, y = 0;
  for (const s of segs) {
    if (s[0] === 'Z') continue;
    if (s[0] === 'C') for (let t = 0.005; t < 1; t += 0.005) {
      const u = 1 - t, at = (p, i) => u * u * u * p + 3 * u * u * t * s[1 + i] + 3 * u * t * t * s[3 + i] + t * t * t * s[5 + i];
      xs.push(at(x, 0)); ys.push(at(y, 1));
    }
    [x, y] = s.slice(-2); xs.push(x); ys.push(y);
  }
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8').replace(/\r\n/g, '\n');
// [name, x, y, path] for each name, in the order given.
function icons(names) {
  return names.map((name) => {
    const m = html.match(new RegExp(`<symbol id="${name}" viewBox="0 0 256 256">(.*?)</symbol>`));
    if (!m) throw new Error(`figma-phosphor: no symbol ${name} in index.html's sprite`);
    const segs = [...m[1].matchAll(/<([a-z]+) ([^>]*?)\/>/g)].flatMap((s) => segments(shape(s[1], attrs(s[2]))));
    return [name, ...corner(segs).slice(0, 2).map(round), segs.map(([c, ...v]) => [c, ...v.map(round)].join(' ')).join(' ')];
  });
}
// Phosphor's notice, which every copy of its drawings keeps: the sprite's own comment.
function notice() {
  const m = html.match(/<!--\s*((?:(?!-->)[\s\S])*?Copyright \(c\) \d+ Phosphor Icons(?:(?!-->)[\s\S])*?)\s*-->/);
  if (!m) throw new Error('figma-phosphor: no Phosphor notice in index.html');
  return m[1].replace(/^[ \t]+/gm, '').replace(/([^\n])\n(?=[^\n])/g, '$1 ').trim();
}
module.exports = { icons, notice };
