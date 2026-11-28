#!/usr/bin/env node
/* Trellis · product · is a product layer only knobs, and can its text be read?
   No browser and no dependencies beyond the package's own math.js and
   product.template.css. It checks what a product owns, and nothing of the
   repository's own:

     shape      one :root[data-product="name"] rule, and any [data-product]
                scopes it brings (D96), all in @layer trellis.product
     knobs      it sets variables only, and only those product.template.css lists,
                or a color of its own, --seed-own-<name>, which must be a color (D117);
                --night-lift, --day-depth, --color-lift and --ink-flip must be plain
                numbers, and over their floors
     contrast   every text role, the accent and its ink, each status as a line,
                each stage's ink, each of the product's own colors' ink and the ink
                on its solid fill, a solid kind's ink and an outline button's
                meet their floors
                (WCAG AA), in both themes, for the root and for every scope.
                A scope whose rule names the dark theme in its selector,
                [data-product="part"][data-theme="dark"], never applies by day,
                so it is held to its floors at night alone (D114)

     node tools/product.js <product.css> ...      report, exit 1 if any fails
     npx trellis-product <product.css> ...         the same, from an installed package

   tests/contract.js runs the same checks on every layer in examples/, beside
   the checks that belong to the repository alone. */
'use strict';
const fs = require('fs');
const path = require('path');
const M = require('../math.js');

const root = path.join(__dirname, '..');
const normalize = (s) => s.replace(/\r\n/g, '\n');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const decl = (s) => [...s.matchAll(/(--[a-z][a-z0-9-]*)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].replace(/\s+/g, ' ').trim()]);
const template = () => new Map(decl(stripComments(normalize(fs.readFileSync(path.join(root, 'product.template.css'), 'utf8')))));

// Floors are WCAG AA: 4.5 for text, 3 for a control's color. The faint ink and
// the borders are decoration and have none.
const GROUNDS = ['bg', 'bg-raised', 'bg-raised-2', 'bg-raised-3'];
const FLOORS = [['text', 'bg', 4.5], ['text', 'bg-raised', 4.5], ['text', 'bg-sunken', 4.5],
  ['text-secondary', 'bg', 4.5], ['text-secondary', 'bg-raised', 4.5], ['text-secondary', 'bg-sunken', 4.5],
  ['text-tertiary', 'bg', 4.5], ['text-tertiary', 'bg-raised', 4.5],
  ['text', 'bg-raised-2', 4.5], ['text-secondary', 'bg-raised-2', 4.5], ['text-tertiary', 'bg-raised-2', 4.5],
  ['text', 'bg-raised-3', 4.5], ['text-secondary', 'bg-raised-3', 4.5], ['text-tertiary', 'bg-raised-3', 4.5],
  ['accent-ink', 'accent', 4.5], ['accent', 'bg', 3], ['accent', 'bg-raised', 3],
  // A status drawn as a line: a ring dot (.dot.cc-ring, D103) is one or two lines of its
  // color on the page or a surface, so each status holds 3:1 there, as the accent does.
  ...['ok', 'warn', 'alert'].flatMap((k) => GROUNDS.map((g) => [k, g, 3])),
  // A stage's ink is for words and for a ring's line (D107): text, on the page and every raised
  // level, whatever color the product gave the stage. Its fill has no floor: it may be pale.
  ...[1, 2, 3, 4, 5, 6, 7].flatMap((n) => GROUNDS.map((g) => [`stage-${n}-ink`, g, 4.5]))];
const THEMES = ['light', 'dark'];
// A product's own color (D117): a name of its own after --seed-own-, and not the name of another's role.
const OWN = /^--seed-own-(?!.*-(?:ink|solid|tint)$)[a-z][a-z0-9-]*$/;
// The palette's numbers, as a layer writes them: the seed's name for each, and the least it may be.
//   night-lift  under 0 is a night deeper than core's, and its ink dims with it: past -.025 core's own
//               tertiary ink falls to its floor, and any hue in the grounds takes it under (D117)
//   day-depth   a raised surface is white at 0, so nothing is left to lift it into
//   color-lift  a hue is lifted at night, never lowered
const NUMBERS = { 'color-lift': ['lift', 0, 'a color is lifted at night, never lowered'], 'ink-flip': ['flip', 0, 'it is a lightness'],
  'night-lift': ['nightLift', -0.025, 'a night deeper than that takes tertiary ink under 4.5:1'], 'day-depth': ['dayDepth', 0, 'a raised surface is white by day already'] };
const isNumber = (s) => /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s);
// What an outline button takes its color from (.button.cc-outline, D115): its ink is a label.
const OUTLINES = ['accent', 'ok', 'alert'];
// A translucent bar (--shell-nav-bg, D115) keeps this share of its ground, and these inks are words on it.
const BAR = { share: 0.85, grounds: ['bg', 'bg-raised'], inks: ['text', 'text-secondary'] };
const SOLIDS = ['kind-person', 'kind-group', 'kind-event', 'kind-course', 'kind-topic', 'ok', 'warn', 'alert'];

// The shape and the knobs. Returns the failures and the knobs the layer sets.
function shape(css, label, knobs = template()) {
  const fails = [], sets = new Map();
  const body0 = stripComments(normalize(css));
  const rules = (body0.match(/[^{}]+\{/g) || []).map((r) => r.trim().replace(/\s*\{$/, ''));
  // One product: a :root[data-product] rule, and any scopes it brings (D96), each
  // a [data-product] rule, all in @layer trellis.product. Or a file of scopes alone.
  // A scope that is always dark says so in its selector (D114); a root can't be one.
  if (!(rules.length >= 2 && /^@layer trellis\.product$/.test(rules[0]) && rules.slice(1).every((r) => /^(:root\[data-product="[a-z-]+"\]|\[data-product="[a-z-]+"\](\[data-theme="dark"\])?)$/.test(r))
    && rules.slice(2).every((r) => !r.startsWith(':root'))))
    fails.push(`${label} must be a :root[data-product] rule and [data-product] scopes in @layer trellis.product; found: ${rules.join(' | ') || 'no rules'}`);
  const at = body0.indexOf('@layer');
  const body = at < 0 ? body0 : body0.slice(body0.indexOf('{', at) + 1);
  const notVar = body.replace(/(?::root)?\[data-product="[a-z-]+"\](?:\[data-theme="dark"\])?\s*\{/g, '').replace(/--[a-z][a-z0-9-]*\s*:[^;]+;/g, '').replace(/[\s}]/g, '');
  if (notVar) fails.push(`${label} sets something other than a variable: ${notVar.slice(0, 60)}`);
  for (const [k, v] of decl(body)) {
    sets.set(k, v);
    if (knobs.has(k) || OWN.test(k)) continue;
    fails.push(k.startsWith('--seed-own-') ? `${label} sets ${k}: a color of its own can't end in -ink, -solid or -tint, which are roles` : `${label} sets ${k}, which product.template.css doesn't list`);
  }
  return { fails, sets };
}

// Each scope of a layer, the root first: [what to call it, the scope's name or
// null for the root, its seed, the themes it can be seen in]. A file with scopes is
// checked once per scope: the root's seeds, then the scope's over them, as M.scope() and
// core.css both have it (D96). A rule for [data-product="x"][data-theme="dark"] matches
// only an element that is dark, and core makes such an element dark whatever the page is,
// so by day it is never seen; a plain rule for the same scope is under it (D114).
function scopesOf(css, label, fails = []) {
  css = stripComments(normalize(css));
  const base = JSON.parse(JSON.stringify(M.SEED));
  const blocks = [...css.matchAll(/((?::root)?\[data-product="([a-z-]+)"\](\[data-theme="dark"\])?)\s*\{([^}]*)\}/g)];
  const seedsOf = (body) => {
    const out = {};
    // A seed a layer sets is that color; one it leaves, or leaves as the
    // template has it (var(--…)), follows from its accent.
    for (const [, k, v] of body.matchAll(/--seed-([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      // A color of the product's own follows nothing, so a name in its place is a color no check would see (D117).
      if (/^var\(--[a-z0-9-]+\)$/.test(v.trim()) && !OWN.test('--seed-' + k)) continue;
      try { out[k] = M.parseColor(v); } catch (e) { fails.push(`${label}: --seed-${k}: ${e.message}`); }
    }
    return out;
  };
  const rootBlock = blocks.find((b) => b[1].startsWith(':root'));
  const rootBody = rootBlock ? rootBlock[4] : '';
  // The palette's numbers, signs and all; core reads each on the root and on every scope. One
  // that isn't a number can't be checked, so it is refused rather than passed over.
  const numbers = (body, color) => {
    for (const [k, v] of decl(body)) {
      const n = NUMBERS[k.slice(2)];
      if (!n) continue;
      if (isNumber(v)) color[n[0]] = +v;
      else if (!fails.some((f) => f.startsWith(`${label}: ${k} is "${v}"`))) fails.push(`${label}: ${k} is "${v}": it must be a plain number, as -.012 or .15 is, or its colors can't be checked`);
    }
  };
  numbers(rootBody, base.color);
  chatKnobs(rootBody, base, label, fails);
  const rootSeeds = rootBlock ? seedsOf(rootBody) : {}, out = [];
  if (rootBlock) out.push([label, null, M.scope(base, rootSeeds), THEMES]);
  for (const b of blocks.filter((x) => x !== rootBlock)) {
    const under = b[3] ? blocks.filter((x) => x !== rootBlock && !x[3] && x[2] === b[2]).map((x) => x[4]) : [];
    const bodies = [...under, b[4]];
    const sc = M.scope(base, rootSeeds, ...bodies.map(seedsOf));
    for (const body of bodies) { numbers(body, sc.color); chatKnobs(body, sc, `${label} ${b[1]}`, fails); }
    out.push([`${label} ${b[1]}`, b[2], sc, b[3] ? ['dark'] : THEMES]);
  }
  return out;
}

// The palette's numbers over their floors, and a night deeper than core's inside sRGB: near black
// sRGB holds little color, so a strong --seed-night that is in at core's night can be out of it (D117).
function ranges(label, seed) {
  const fails = [], col = seed.color;
  for (const [k, [name, floor, why]] of Object.entries(NUMBERS))
    if ((col[name] || 0) < floor) fails.push(`${label}: --${k} is ${col[name]}, under its floor of ${floor}: ${why}`);
  if (fails.length || !(col.nightLift < 0)) return fails;
  const p = M.palette('dark', seed), out = Object.keys(p).filter((k) => /^(bg|border)/.test(k) && !M.inGamut(p[k]));
  if (out.length) fails.push(`${label}: with --night-lift at ${col.nightLift}, the night's ${out.map((k) => '--' + k).join(', ')} ${out.length > 1 ? 'are' : 'is'} outside sRGB: quiet --seed-night (the ground, if that isn't set), or raise the lift`);
  return fails;
}

// Contrast for one seed, in both themes, or in the ones scopesOf() says it is seen in;
// first that the numbers it stands on are ones core can draw.
function contrast(label, seed, themes = THEMES, shares = stateShares()) {
  const fails = ranges(label, seed);
  if (fails.length) return fails;
  for (const theme of themes) {
    const p = M.palette(theme, seed);
    for (const [ink, ground, floor] of FLOORS) {
      const r = M.contrast(p[ink], p[ground]);
      if (!(r >= floor)) fails.push(`contrast: ${label} ${theme}: --${ink} on --${ground} is ${r.toFixed(2)}:1, under ${floor}`);
    }
    // A solid tag or a badge on a kind or status: ink computed from the fill.
    for (const k of SOLIDS) {
      const r = M.contrast(M.ink(p[k], seed), p[k]);
      if (!(r >= 4.5)) fails.push(`contrast: ${label} ${theme}: ink on a solid --${k} is ${r.toFixed(2)}:1, under 4.5`);
    }
    for (const k of OUTLINES) for (const g of GROUNDS) {
      const r = M.contrast(M.outlineInk(p[k], theme), p[g]);
      if (!(r >= 4.5)) fails.push(`contrast: ${label} ${theme}: an outline button's ink from --${k} on --${g} is ${r.toFixed(2)}:1, under 4.5`);
    }
    // A solid or selected quiet tag: ink computed from the neutral it fills with.
    const q = M.contrast(M.ink(p['text-tertiary'], seed), p['text-tertiary']);
    if (!(q >= 4.5)) fails.push(`contrast: ${label} ${theme}: ink on a solid quiet tag is ${q.toFixed(2)}:1, under 4.5`);
    // Every state of a control with a fill of its own (D120): hovered, pressed, and for a
    // button selected, selected and hovered, selected and pressed. A primary, destructive or
    // confirm button, a button in a color of the product's own, and a solid or selected tag
    // in every kind, status, stage and the neutral.
    const { hover, press, selected } = shares, sh = { button: [hover, press, selected, selected + hover, selected + press], tag: [hover, press] };
    const filled = ![hover, press, selected].every(Number.isFinite) ? [] :[['accent', p['accent-ink'], 'button', 'a primary button'], ...['ok', 'alert'].map((k) => [k, M.ink(p[k], seed), 'button', `a ${k} button`]),
      ...ownOf(seed).map((k) => [k + '-solid', p[k + '-solid-ink'], 'button', `a button in --seed-${k}`]),
      ...[...SOLIDS, 'text-tertiary', ...[1, 2, 3, 4, 5, 6, 7].map((n) => `stage-${n}`)].map((k) => [k, M.ink(p[k], seed), 'tag', `a solid --${k} tag`])];
    for (const [k, ink, kind, what] of filled) for (const s of sh[kind]) {
      const r = M.contrast(ink, M.stateOver(p[k], ink, s, seed));
      if (!(r >= 4.5)) fails.push(`contrast: ${label} ${theme}: the label of ${what} with ${Math.round(s * 100)}% of the state layer is ${r.toFixed(2)}:1, under 4.5`);
    }
    // Each color of the product's own (D117): its ink is text, and a label stands on its solid fill.
    for (const k of ownOf(seed)) {
      for (const g of GROUNDS) {
        const r = M.contrast(p[k + '-ink'], p[g]);
        if (!(r >= 4.5)) fails.push(`contrast: ${label} ${theme}: the ink of --seed-${k} on --${g} is ${r.toFixed(2)}:1, under 4.5`);
      }
      const r = M.contrast(p[k + '-solid-ink'], p[k + '-solid']);
      if (!(r >= 4.5)) fails.push(`contrast: ${label} ${theme}: ink on the solid fill of --seed-${k} is ${r.toFixed(2)}:1, under 4.5`);
    }
    fails.push(...speech(label, theme, p, seed.chat || {}));
  }
  return fails;
}

// Speech (D122): a bubble's ground is a share of the text (others') or the accent
// (your own) mixed into the surface in OKLab, with the product's --chat-bubble-bg or
// --chat-own-bg laid over it. The words, and the second ink (the third reads as
// the second on a bubble), hold 4.5:1 on it over every surface; your own words
// are --chat-own-ink, and the second ink is held there while that is the text.
const lab = (c) => [c[0], c[1] * Math.cos(c[2] * Math.PI / 180), c[1] * Math.sin(c[2] * Math.PI / 180)];
const mixLab = (a, share, b) => { const x = lab(a), y = lab(b), m = x.map((v, i) => v * share + y[i] * (1 - share)); return [m[0], Math.hypot(m[1], m[2]), ((Math.atan2(m[2], m[1]) * 180 / Math.PI) + 360) % 360]; };
const rgb8 = (c) => [1, 3, 5].map((i) => parseInt(M.hex(c).substr(i, 2), 16));
const overRgb = (c, share, g) => { const x = rgb8(c), y = rgb8(g); return M.parseColor('#' + x.map((v, i) => ('0' + Math.round(v * share + y[i] * (1 - share)).toString(16)).slice(-2)).join('')); };
// A knob's color, as a layer can write it: transparent, a role, a color, or a role's share
// mixed in OKLab into another role, the surface or nothing. null where it can't be read.
const ROLE = /^var\(--([a-z0-9-]+)\)$/;
function chatColor(v) {
  v = v.replace(/\s+/g, ' ').trim();
  if (v === 'transparent') return { clear: true };
  if (v === 'currentColor' || v === 'currentcolor') return { role: 'text' };
  let m = ROLE.exec(v);
  if (m) return { role: m[1] };
  m = /^color-mix\(in oklab, (var\(--[a-z0-9-]+\)|#[0-9a-f]{6}|oklch\([^)]*\)) (\d+(?:\.\d+)?)%, (transparent|var\(--[a-z0-9-]+\)|#[0-9a-f]{6}|oklch\([^)]*\))\)$/i.exec(v);
  if (m) {
    const side = (s) => (ROLE.test(s) ? { role: ROLE.exec(s)[1] } : s === 'transparent' ? { clear: true } : { color: M.parseColor(s) });
    try { return { mix: [side(m[1]), m[2] / 100, side(m[3])] }; } catch (e) { return null; }
  }
  try { return { color: M.parseColor(v) }; } catch (e) { return null; }
}
// A parsed color on a surface: [color, alpha].
function chatPaint(spec, p, g) {
  const one = (s) => (s.clear ? null : s.color ? s.color : s.role === 'surface' ? p[g] : p[s.role]);
  if (spec.clear) return [p[g], 0];
  if (spec.mix) { const [a, share, b] = spec.mix, x = one(a); if (b.clear) return [x, share]; return [mixLab(x, share, one(b)), 1]; }
  return [one(spec), 1];
}
function speech(label, theme, p, chat) {
  const fails = [], t = chatDefaults(), wash = chat.wash ?? t.wash, ownWash = chat.ownWash ?? t.ownWash;
  const known = (s) => !s || s.clear || s.color || (s.role && (s.role === 'surface' || p[s.role])) || (s.mix && s.mix.every((x) => typeof x === 'number' || known(x)));
  for (const k of ['bg', 'ownBg', 'ownInk']) if (chat[k] && !known(chat[k])) return [`contrast: ${label}: a bubble's knob names a color that isn't a role; it can't be checked`];
  for (const g of GROUNDS) {
    const lay = (base, spec) => { if (!spec) return base; const [c, a] = chatPaint(spec, p, g); return a >= 1 ? c : a <= 0 ? base : overRgb(c, a, base); };
    const others = lay(mixLab(p.text, wash, p[g]), chat.bg), own = lay(mixLab(p.accent, ownWash, p[g]), chat.ownBg);
    const ownInk = chat.ownInk ? chatPaint(chat.ownInk, p, g)[0] : p.text;
    const checks = [['--text', p.text, others, "others' bubble"], ['--text-secondary', p['text-secondary'], others, "others' bubble"], ['--chat-own-ink', ownInk, own, 'your own bubble']];
    if (!chat.ownInk || chat.ownInk.role === 'text') checks.push(['--text-secondary', p['text-secondary'], own, 'your own bubble']);
    for (const [what, ink, ground, where] of checks) {
      const r = M.contrast(ink, ground);
      if (!(r >= 4.5)) fails.push(`contrast: ${label} ${theme}: ${what} on ${where} on --${g} is ${r.toFixed(2)}:1, under 4.5`);
    }
  }
  return fails;
}
// The washes core draws (the template's), as shares.
let templateChat;
function chatDefaults() {
  if (templateChat) return templateChat;
  const t = template(), share = (k) => parseFloat(t.get(k)) / 100;
  return (templateChat = { wash: share('--chat-bubble-wash'), ownWash: share('--chat-own-wash') });
}
// A layer's bubble knobs, on the seed a scope is checked with. A wash must be a plain
// percentage, and a color one the check can read, or it is refused.
function chatKnobs(body, seed, label, fails) {
  const chat = seed.chat = Object.assign({}, seed.chat);
  for (const [k, v] of decl(body)) {
    const share = { '--chat-bubble-wash': 'wash', '--chat-own-wash': 'ownWash' }[k], color = { '--chat-bubble-bg': 'bg', '--chat-own-bg': 'ownBg', '--chat-own-ink': 'ownInk' }[k];
    if (share) {
      const m = /^(\d+(?:\.\d+)?)%$/.exec(v);
      if (m && +m[1] <= 100) chat[share] = m[1] / 100;
      else fails.push(`${label}: ${k} is "${v}": it must be a plain percentage, as 7% is, or a bubble's contrast can't be checked`);
    } else if (color) {
      const spec = chatColor(v);
      if (spec) chat[color] = spec;
      else fails.push(`${label}: ${k} is "${v}": a bubble's color is transparent, a role, a color, or color-mix(in oklab, …) of a role and a role, the surface or transparent; anything else can't be checked`);
    }
  }
}

// The state layer's shares (D58): the template's, or the layer's own where it sets them.
// One that isn't a plain percentage can't be checked, so it is refused.
let templateShares;
function stateShares(sets = null, fails = [], label = 'product layer') {
  if (!sets && templateShares) return templateShares;
  const t = template(), out = {};
  for (const k of ['hover', 'press', 'selected']) {
    const v = ((sets && sets.get(`--state-${k}`)) || t.get(`--state-${k}`) || '').trim(), m = /^(\d+(?:\.\d+)?)%$/.exec(v);
    if (m) out[k] = m[1] / 100;
    else { out[k] = NaN; fails.push(`${label}: --state-${k} is "${v}": it must be a plain percentage, as 6% is, or a control's states can't be checked`); }
  }
  if (!sets) templateShares = out;
  return out;
}

// The colors of the product's own a seed holds: own-gold, own-inner, … (D117).
function ownOf(seed) { return Object.keys(seed.color.seeds).filter((k) => OWN.test('--seed-' + k)); }

// Everything a product owns: shape, knobs, and contrast on every scope.
function validate(css, label = 'product layer', knobs = template()) {
  const { fails, sets } = shape(css, label, knobs), shares = stateShares(sets, fails, label);
  for (const [scope, , seed, themes] of scopesOf(css, label, fails)) fails.push(...contrast(scope, seed, themes, shares));
  return { fails, sets };
}

module.exports = { validate, shape, scopesOf, contrast, stateShares, speech, chatColor, ownOf, template, FLOORS, SOLIDS, OUTLINES, BAR, GROUNDS, THEMES };

if (require.main === module) {
  const files = process.argv.slice(2);
  if (!files.length) { console.error('usage: node tools/product.js <product.css> ...'); process.exit(2); }
  const knobs = template();
  let failed = 0;
  for (const f of files) {
    let css;
    try { css = fs.readFileSync(f, 'utf8'); } catch (e) { console.log(`${f}: can't read it (${e.code || e.message})`); failed++; continue; }
    const { fails, sets } = validate(css, f, knobs);
    const all = scopesOf(css, f), n = all.length, night = all.filter((s) => s[3].length === 1).length;
    const own = [...new Set(all.flatMap((s) => ownOf(s[2])))];
    console.log(`${f}: ${sets.size} knobs, ${n} ${n === 1 ? 'scope' : 'scopes'}${own.length ? `, ${own.length} ${own.length === 1 ? 'color' : 'colors'} of its own (${own.map((k) => k.slice(4)).join(', ')})` : ''}${night ? ` (${night} always dark, so checked at night alone)` : ''} · ${fails.length ? fails.length + ' FAILED' : 'ok'}`);
    fails.forEach((x) => console.log('  ' + x));
    if (fails.length) failed++;
  }
  process.exit(failed ? 1 : 0);
}
