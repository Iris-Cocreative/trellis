#!/usr/bin/env node
/* Trellis · product · is a product layer only knobs, and can its text be read?
   No browser and no dependencies beyond the package's own math.js and
   product.template.css. It checks what a product owns, and nothing of the
   repository's own:

     shape      one :root[data-product="name"] rule, and any [data-product]
                scopes it brings (D96), all in @layer trellis.product
     knobs      it sets variables only, and only those product.template.css lists
     contrast   every text role, the accent and its ink, each status as a line,
                each stage's ink, a solid kind's ink and an outline button's
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
    if (!knobs.has(k)) fails.push(`${label} sets ${k}, which product.template.css doesn't list`);
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
      if (/^var\(--[a-z0-9-]+\)$/.test(v.trim())) continue;
      try { out[k] = M.parseColor(v); } catch (e) { fails.push(`${label}: --seed-${k}: ${e.message}`); }
    }
    return out;
  };
  const rootBlock = blocks.find((b) => b[1].startsWith(':root'));
  const rootBody = rootBlock ? rootBlock[4] : '';
  const lift = rootBody.match(/--color-lift\s*:\s*([\d.]+)/), flip = rootBody.match(/--ink-flip\s*:\s*([\d.]+)/);
  if (lift) base.color.lift = +lift[1];
  if (flip) base.color.flip = +flip[1];
  const nightOf = (body) => { const m = body.match(/--night-lift\s*:\s*([\d.]+)/); return m ? +m[1] : undefined; };
  const dayOf = (body) => { const m = body.match(/--day-depth\s*:\s*([\d.]+)/); return m ? +m[1] : undefined; };
  if (nightOf(rootBody) !== undefined) base.color.nightLift = nightOf(rootBody);
  if (dayOf(rootBody) !== undefined) base.color.dayDepth = dayOf(rootBody);
  const rootSeeds = rootBlock ? seedsOf(rootBody) : {}, out = [];
  if (rootBlock) out.push([label, null, M.scope(base, rootSeeds), THEMES]);
  for (const b of blocks.filter((x) => x !== rootBlock)) {
    const under = b[3] ? blocks.filter((x) => x !== rootBlock && !x[3] && x[2] === b[2]).map((x) => x[4]) : [];
    const bodies = [...under, b[4]];
    const sc = M.scope(base, rootSeeds, ...bodies.map(seedsOf));
    for (const body of bodies) {
      if (nightOf(body) !== undefined) sc.color.nightLift = nightOf(body);
      if (dayOf(body) !== undefined) sc.color.dayDepth = dayOf(body);
    }
    out.push([`${label} ${b[1]}`, b[2], sc, b[3] ? ['dark'] : THEMES]);
  }
  return out;
}

// Contrast for one seed, in both themes, or in the ones scopesOf() says it is seen in.
function contrast(label, seed, themes = THEMES) {
  const fails = [];
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
  }
  return fails;
}

// Everything a product owns: shape, knobs, and contrast on every scope.
function validate(css, label = 'product layer', knobs = template()) {
  const { fails, sets } = shape(css, label, knobs);
  for (const [scope, , seed, themes] of scopesOf(css, label, fails)) fails.push(...contrast(scope, seed, themes));
  return { fails, sets };
}

module.exports = { validate, shape, scopesOf, contrast, template, FLOORS, SOLIDS, OUTLINES, BAR, GROUNDS, THEMES };

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
    console.log(`${f}: ${sets.size} knobs, ${n} ${n === 1 ? 'scope' : 'scopes'}${night ? ` (${night} always dark, so checked at night alone)` : ''} · ${fails.length ? fails.length + ' FAILED' : 'ok'}`);
    fails.forEach((x) => console.log('  ' + x));
    if (fails.length) failed++;
  }
  process.exit(failed ? 1 : 0);
}
