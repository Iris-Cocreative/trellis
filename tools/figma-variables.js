#!/usr/bin/env node
/* Trellis · figma-variables · the Figma file's variables, generated
   Code is the source and the Figma file is generated from it (the Figma
   conventions). This reads tokens.json through math.js, the same arithmetic
   core.css does, and each product layer's knobs, and writes the variables a
   Figma file holds, resolved:

     Product  Core, one mode per product layer and one per scope   what a product turns:
                each role's size and line at both screens, every color in
                both themes, the families and weights, and the shape and
                density knobs (as aliases of Space, as the layer writes them)
     Space    Phone and Wide   the cell, the counts, control and icon sizes, corners
     Type     Phone and Wide   each role's size and line height; families, weights
     Color    Light and Dark   every role, from the one seed

   Figma holds a number per mode and no arithmetic, and a variable has one set
   of modes. So a product is its own collection: Type and Color alias it, and a
   frame picks a screen, a theme and a product by three modes, with one set of
   layers. A scope (D96), a product nested in a product, is a Product mode of
   its own, worked out with what its layer's root set carried in, and set on an
   inner frame, as data-product is on an inner element; a mood is that frame in
   the Dark Color mode too. Each value is worked out here at the two screens the modes stand for
   (a 393pt phone and a 1440pt wide screen) and written as a number. What that
   loses is written down in docs/figma/README.md. Each variable is named as its
   CSS variable, with its code syntax set to it, so a designer's file reads in
   the code's words.

   node tools/figma-variables.js              the collections as JSON, on stdout
   node tools/figma-variables.js --out FILE   written to FILE
   node tools/figma-variables.js --plugin     a Figma plugin script that writes them
                                              into the open file, by name, keeping
                                              every binding (docs/figma/README.md)
   node tools/figma-variables.js --tokens FILE    another token file
   node tools/figma-variables.js --layer FILE …   these product layers, not examples/
                                                  and experiments/scopes/interbeing.css */
'use strict';
const fs = require('fs');
const path = require('path');
const M = require('../math.js');

const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
const flags = (name) => args.flatMap((a, i) => (a === name ? [args[i + 1]] : []));
const tokens = JSON.parse(fs.readFileSync(flag('--tokens') || path.join(root, 'tokens.json'), 'utf8'));
const seed = M.seedFromTokens(tokens);
// The example layers, and the scopes study: the one layer with scopes in it.
const LAYERS = (flags('--layer').length ? flags('--layer') : fs.readdirSync(path.join(root, 'examples')).filter((f) => f.endsWith('.css')).sort().map((f) => path.join(root, 'examples', f))
  .concat(path.join(root, 'experiments', 'scopes', 'interbeing.css')));

// The two screens the modes stand for.
const SCREENS = { Phone: { width: 393, dpr: 3 }, Wide: { width: 1440, dpr: 2 } };
const cellAt = (s) => {
  const target = M.cellTarget({ width: s.width }, seed);
  return s.width < seed.cell.screenWide ? M.fit({ width: s.width, target, dpr: s.dpr }, seed).cell : M.wholeCell(target);
};
const CELL = Object.fromEntries(Object.entries(SCREENS).map(([m, s]) => [m, cellAt(s)]));
const round = (v) => Math.round(v * 1000) / 1000;
const vals = (pick) => ({ type: 'FLOAT', values: Object.fromEntries(Object.keys(SCREENS).map((m) => [m, round(pick(m))])) });
// A role's size and line height are a class in the code (.t-h1), not a variable.
const syntax = (name) => { const m = name.match(/^type\/([a-z0-9]+)\/(size|line)$/); return m ? '.t-' + m[1] : `var(--${name.split('/').pop()})`; };
const v = (name, def, scopes) => Object.assign({ name, codeSyntax: { WEB: syntax(name) }, scopes }, def);
const $ = (group, key) => { const n = tokens[group][key]; return n && n.$value !== undefined ? n.$value : n; };
const keys = (o) => Object.keys(o).filter((k) => k[0] !== '$');

/* ---- Space ------------------------------------------------------------------ */
const space = [v('space/u', vals((m) => CELL[m]), ['GAP', 'WIDTH_HEIGHT'])];
const spName = (k) => 'sp-' + k;
for (const k of keys(tokens.space)) space.push(v('space/' + spName(k), vals((m) => CELL[m] * $('space', k)), ['GAP', 'WIDTH_HEIGHT']));
space.push(v('space/line', vals(() => 1), ['STROKE_FLOAT']));
// A ring's line (D103): a quarter of the dot, one line at the least and two at the most, on the half-cell dot.
space.push(v('derived/dot-ring', vals((m) => Math.min(2, Math.max(1, CELL[m] * 0.5 / 4))), ['STROKE_FLOAT']));
for (const k of keys(tokens.size.control)) space.push(v('size/size-control-' + k, vals((m) => CELL[m] * tokens.size.control[k].$value), ['WIDTH_HEIGHT']));
for (const k of keys(tokens.size.icon)) space.push(v('size/size-icon' + (k === 'base' ? '' : '-' + k), vals((m) => CELL[m] * tokens.size.icon[k].$value), ['WIDTH_HEIGHT']));
space.push(v('size/hit-min', vals(() => tokens.size['hit-min'].$value), ['WIDTH_HEIGHT']));
for (const k of keys(tokens.radius)) {
  const n = tokens.radius[k].$value;
  space.push(v('radius/r-' + k, vals((m) => (n >= 999 ? 999 : CELL[m] * n)), ['CORNER_RADIUS']));
}
const controlType = keys(tokens['control-type']).map((k) => v('type/control/fs-control' + (k === 'base' ? '' : '-' + k), vals(() => tokens['control-type'][k].$value), ['FONT_SIZE']));

/* ---- Products --------------------------------------------------------------- */
// A layer's knobs, as written: --name → its value. The template holds core's
// default for every knob, so core is the template, and a product is the
// template with its own layer over it.
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const knobsIn = (css) => new Map([...css.matchAll(/(--[a-z][a-z0-9-]*)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const TEMPLATE = knobsIn(stripComments(fs.readFileSync(path.join(root, 'product.template.css'), 'utf8')));
// A layer is its :root[data-product] rule and any scopes after it, each a
// [data-product] rule (D96), as tests/contract.js reads them. A scope is the
// template, then the root's knobs, then its own: a choice the root made
// carries in, and what nobody set follows again from the scope's own values.
const title = (name) => name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const PRODUCTS = [{ mode: 'Core', knobs: TEMPLATE }].concat(LAYERS.flatMap((file) => {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const blocks = [...stripComments(fs.readFileSync(file, 'utf8')).matchAll(/((?::root)?\[data-product="([a-z-]+)"\])\s*\{([^}]*)\}/g)];
  const top = blocks.find((b) => b[1].startsWith(':root')), base = new Map([...TEMPLATE, ...(top ? knobsIn(top[3]) : [])]);
  const name = top ? title(top[2]) : title(path.basename(file, '.css'));
  return (top ? [{ mode: name, file: rel, knobs: base }] : []).concat(blocks.filter((b) => b !== top).map((b) =>
    ({ mode: `${name} › ${title(b[2])}`, file: rel, scope: b[2], knobs: new Map([...base, ...knobsIn(b[3])]) })));
}));

// A number a knob holds, in px for a length: 2 and 2rem are 32 (the type knobs
// are rem without the unit), 0px is 0. An expression is not a number: core
// works it out, and so does math.js.
const num = (s) => { const m = s && s.match(/^(-?[\d.]+)(rem|px)?$/); return m ? +m[1] * (m[2] === 'px' ? 1 : 16) : undefined; };
const plain = (s) => { const m = s && s.match(/^-?[\d.]+$/); return m ? +s : undefined; };
// A knob that follows another (--fw-button: var(--fw-label)) is the one it names.
const follow = (k, name, seen = []) => { const value = k.get(name), ref = value && value.match(/^var\((--[a-z0-9-]+)\)$/);
  return ref && k.has(ref[1]) && !seen.includes(ref[1]) ? follow(k, ref[1], seen.concat(name)) : value; };

// A product's seed, as tests/math.js builds it from the live knobs.
function productSeed(k) {
  const pt = (n) => num(k.get('--' + n)), K = (n) => plain(k.get('--' + n));
  const or = (x, d) => (x === undefined ? d : x), s7 = seed.seven;
  const seven = { h1: or(pt('h1-max'), s7.h1), body: or(pt('body-max'), s7.body), label: or(pt('label-max'), s7.label),
    ratio: [or(K('rh-min'), s7.ratio[0]), or(K('rh-max'), s7.ratio[1])],
    spaceNarrow: or(pt('c-min'), s7.spaceNarrow), spaceWide: or(pt('c-max'), s7.spaceWide) };
  const t = seed.type;
  const type = Object.assign({}, t, M.typeFrom(seven, { h1: pt('h1-min'), body: pt('body-min'), label: pt('label-min'), step: [K('rp-min'), K('rp-max')] }),
    { lineH1: or(K('lh-h1'), t.lineH1), lineHeadingStep: or(K('lh-h-step'), t.lineHeadingStep), lineBody: or(K('lh-body'), t.lineBody),
      lineParagraphStep: or(K('lh-p-step'), t.lineParagraphStep), lineLabel: or(K('lh-label'), t.lineLabel) });
  const color = JSON.parse(JSON.stringify(seed.color));
  for (const [name, value] of k) {
    // Every seed a layer sets, the night ones (D97, D98) and the stages (D107)
    // too; one it leaves as the template has it (var(--…)) follows.
    const m = name.match(/^--seed-([a-z0-9-]+)$/);
    if (m && !/^var\(--[a-z0-9-]+\)$/.test(value)) color.seeds[m[1]] = M.parseColor(value);
  }
  if (K('color-lift') !== undefined) color.lift = K('color-lift');
  if (K('ink-flip') !== undefined) color.flip = K('ink-flip');
  if (K('night-lift') !== undefined) color.nightLift = K('night-lift');   // a dusk (D97)
  if (K('day-depth') !== undefined) color.dayDepth = K('day-depth');      // a paper that is not white (D98)
  return Object.assign({}, seed, { seven, type, color });
}

// Figma names a family it has. Each family a layer lists is looked up here in
// order, and the first one found stands in for it: the generic families of
// core's default, and the system fonts the example layers name.
const STAND_IN = {
  'ui-sans-serif': 'Inter', 'system-ui': 'Inter', 'sans-serif': 'Inter', Inter: 'Inter',
  Georgia: 'Gelasio', serif: 'Gelasio',
  'Helvetica Neue': 'Hanken Grotesk', Helvetica: 'Hanken Grotesk', Arial: 'Hanken Grotesk',
  'Gill Sans': 'Lato', 'Gill Sans MT': 'Lato', 'Trebuchet MS': 'Lato',
  'Iowan Old Style': 'Source Serif 4', 'Palatino Linotype': 'Source Serif 4', Palatino: 'Source Serif 4',
  // Web fonts a layer names that Figma has: Interbeing's.
  Geist: 'Geist', Halant: 'Halant', 'Cormorant Garamond': 'Cormorant Garamond', 'Alegreya Sans': 'Alegreya Sans'
};
const family = (k, name, seen = []) => {
  const value = k.get(name) || '';
  const ref = value.match(/^var\((--[a-z-]+)\)$/);
  if (ref && !seen.includes(ref[1])) return family(k, ref[1], seen.concat(name));
  const found = value.split(',').map((f) => f.trim().replace(/^["']|["']$/g, '')).find((f) => STAND_IN[f]);
  if (!found) throw new Error(`${name}: no family Figma has stands in for ${value}`);
  return STAND_IN[found];
};

// The knobs a frame can hold: each is a length, an alias of the variable the
// layer names (var(--r-q) is radius/r-q, at the frame's own screen), or a
// number. A knob written as an expression is listed as not carried.
const KNOBS = [
  ['shape-card', 'CORNER_RADIUS'], ['shape-control', 'CORNER_RADIUS'], ['shape-input', 'CORNER_RADIUS'], ['shape-float', 'CORNER_RADIUS'],
  ['density-card-pad', 'GAP'], ['density-card-pad-inline', 'GAP'], ['density-card-pad-block', 'GAP'],
  ['density-control-h', 'WIDTH_HEIGHT'], ['density-control-fs', 'FONT_SIZE'],
  ['density-option-h', 'WIDTH_HEIGHT'], ['density-option-fs', 'FONT_SIZE'], ['density-options-pad', 'GAP'], ['density-seg-h', 'WIDTH_HEIGHT'],
  ['tag-default-h', 'WIDTH_HEIGHT'], ['tag-default-fs', 'FONT_SIZE'], ['tag-fs-sm', 'FONT_SIZE'], ['tag-fs-md', 'FONT_SIZE'], ['tag-fs-lg', 'FONT_SIZE'],
  ['tag-r-fixed', 'CORNER_RADIUS']
];
const WEIGHTS = ['fw-body', 'fw-heading', 'fw-label', 'fw-label-text', 'fw-strong', 'fw-button'];
const FAMILIES = ['font-sans', 'font-serif', 'font-heading', 'font-button'];   // a button's face (D100)

const product = [], notCarried = {};
const pv = (name, type, scopes, pick, codeSyntax) => {
  const out = { name, type, scopes, values: Object.fromEntries(PRODUCTS.map((p) => [p.mode, pick(p)])) };
  if (codeSyntax) out.codeSyntax = { WEB: codeSyntax };
  else out.hidden = true;   // a value per screen or theme, read through Type and Color, never picked
  product.push(out);
  return out;
};
const at0 = (name) => product.find((x) => x.name === name).values.Core;
const seeds = new Map(PRODUCTS.map((p) => [p.mode, productSeed(p.knobs)]));
const SCREEN_KEY = { Phone: 'phone', Wide: 'wide' };
for (const role of Object.keys(M.ROLES)) for (const m of Object.keys(SCREENS)) {
  const size = (p) => M.typeSize(role, SCREENS[m].width, {}, seeds.get(p.mode));
  pv(`${SCREEN_KEY[m]}/${role}/size`, 'FLOAT', [], (p) => round(size(p)));
  pv(`${SCREEN_KEY[m]}/${role}/line`, 'FLOAT', [], (p) => round(M.lineHeight(role, size(p), CELL[m], seeds.get(p.mode))));
}
const palettes = new Map(PRODUCTS.map((p) => [p.mode, { Light: M.palette('light', seeds.get(p.mode)), Dark: M.palette('dark', seeds.get(p.mode)) }]));
const roles = Object.keys(M.palette('light', seed));
for (const theme of ['Light', 'Dark']) for (const k of roles) pv(`${theme.toLowerCase()}/${k}`, 'COLOR', [], (p) => M.hex(palettes.get(p.mode)[theme][k]));
// Ink on a solid fill of each hue, as core computes it from the fill (C4):
// a solid tag's, a badge's. Core writes it inline; the file holds it as a role.
const SOLIDS = roles.filter((k) => /^(kind-|ok$|warn$|alert$|stage-\d+$)/.test(k));
for (const theme of ['Light', 'Dark']) for (const k of SOLIDS) pv(`${theme.toLowerCase()}/on-${k}`, 'COLOR', [], (p) => M.hex(M.ink(palettes.get(p.mode)[theme][k], seeds.get(p.mode))));
// Tints: a role at a share over nothing, as core mixes them with color-mix()
// (a state over a control's fill, a tag's ground and edge, an avatar's wash).
// Figma has no mix, and drops a paint's own opacity on an instance, so each
// is a color with its alpha in it. [role, shares in percent]
const HUES = SOLIDS;
const TINTS = [['text', [6, 10, 12, 32]], ['accent-ink', [6, 12]], ['accent', [26]], ...HUES.map((k) => [k, /^kind-(person|group)$/.test(k) ? [14, 26, 42] : [14, 42]])];
const alpha = (pct) => Math.round(pct * 2.55).toString(16).padStart(2, '0');
for (const theme of ['Light', 'Dark']) for (const [k, shares] of TINTS) for (const pct of shares)
  pv(`${theme.toLowerCase()}/tint/${k}/${pct}`, 'COLOR', [], (p) => M.hex(palettes.get(p.mode)[theme][k]) + alpha(pct));
for (const f of FAMILIES) pv('font/' + f, 'STRING', [], (p) => family(p.knobs, '--' + f));
for (const w of WEIGHTS) pv('weight/' + w, 'FLOAT', [], (p) => plain(follow(p.knobs, '--' + w)));

// Any variable this file holds, by its CSS name, for a knob that names one.
const byCss = new Map(space.concat(controlType).map((x) => [x.codeSyntax.WEB.slice(6, -1), x.name]));
for (const [k] of KNOBS) byCss.set(k, 'knob/' + k);
for (const [k, scope] of KNOBS) pv('knob/' + k, 'FLOAT', [scope], (p) => {
  const value = p.knobs.get('--' + k), ref = value && value.match(/^var\(--([a-z0-9-]+)\)$/);
  if (ref && byCss.has(ref[1])) return { alias: byCss.get(ref[1]) };
  if (num(value) !== undefined) return num(value);
  (notCarried[p.mode] = notCarried[p.mode] || []).push(`--${k}: ${value}`);
  return { alias: byCss.get((TEMPLATE.get('--' + k).match(/^var\(--([a-z0-9-]+)\)$/) || [])[1]) || 'space/u' };
}, `var(--${k})`);
// A tag's corner: core takes the larger of a fixed corner and a share of its
// height. A share of a half is a pill; under that, the fixed corner stands in.
pv('knob/tag-radius', 'FLOAT', ['CORNER_RADIUS'], (p) => (plain(p.knobs.get('--tag-r-ratio')) >= 0.5 ? { alias: 'radius/r-round' } : { alias: 'knob/tag-r-fixed' }), 'var(--tag-radius)');

// Measures core works out from the knobs, in cells, then at each screen: a
// frame can't compute, so each is a number per product and screen, read
// through Space like a role's size through Type. Each is the CSS it stands for.
const CELLS = {};
for (const k of keys(tokens.space)) CELLS['sp-' + k] = $('space', k);
for (const k of keys(tokens.size.control)) CELLS['size-control-' + k] = tokens.size.control[k].$value;
for (const k of keys(tokens.radius)) CELLS['r-' + k] = tokens.radius[k].$value;
CELLS.u = 1;
const cellsOf = (k, name, seen = []) => {
  const value = k.get('--' + name) || (CELLS[name] !== undefined ? `var(--${name})` : '');
  const ref = value.match(/^var\(--([a-z0-9-]+)\)$/);
  if (ref) return CELLS[ref[1]] !== undefined ? CELLS[ref[1]] : seen.includes(ref[1]) ? NaN : cellsOf(k, ref[1], seen.concat(name));
  if (value === '0px' || value === '0') return 0;
  const calc = value.match(/^calc\(\(var\(--([a-z0-9-]+)\) - var\(--([a-z0-9-]+)\)\) \/ 2\)$/);
  if (calc) return (cellsOf(k, calc[1], seen) - cellsOf(k, calc[2], seen)) / 2;
  return NaN;
};
const down = (x, step) => Math.floor(x / step + 1e-9) * step;
const ROUND = 999;
const DERIVED = {
  // .button: padding-inline is half its height, down to half cells (and its border, inside it here).
  'control-pad': (c) => down(c('density-control-h') / 2, 0.5),
  // .tag: its corner, the larger of a fixed one and a share of its height; its padding that corner, from half a cell to one.
  ...Object.fromEntries([['tag-pad', 'tag-default-h'], ['tag-pad-sm', 'size-control-xs'], ['tag-pad-lg', 'size-control-md']].map(([n, h]) =>
    [n, (c, k) => Math.min(1, Math.max(0.5, down(Math.max(c('tag-r-fixed'), c(h) * plain(k.get('--tag-r-ratio'))), 0.5)))])),
  // .tabs.cc-seg: the ground around the tabs, and a tab's corner inside the control's.
  'seg-pad': (c) => c('density-seg-pad'),
  'seg-tab-r': (c) => (c('shape-control') >= ROUND ? ROUND : Math.max(0.25, c('shape-control') - 0.25)),
  // .options-card-item: the float's corner less its padding.
  'option-r': (c) => Math.max(0.25, c('shape-float') - c('density-options-pad')),
  // .composer > .button: the box's corner less its padding, a quarter cell at the least (D99).
  'composer-btn-r': (c) => Math.max(0.25, c('shape-input') - 0.25),
  // A card in a card: how far it steps out, and its corner, concentric (rule 21).
  'card-nest-out': (c) => Math.min(1, Math.max(0, c('density-card-pad-inline') - 1)),
  'card-nest-r': (c) => { const out = Math.min(1, Math.max(0, c('density-card-pad-inline') - 1)); return Math.max(0.25, c('shape-card') - Math.min(c('density-card-pad-inline') - out, c('density-card-pad-block'))); },
  'card-nest-r2': (c) => { const out = Math.min(1, Math.max(0, c('density-card-pad-inline') - 1)); const r = Math.max(0.25, c('shape-card') - Math.min(c('density-card-pad-inline') - out, c('density-card-pad-block')));
    const pad = Math.min(c('density-card-pad-inline'), 1), padB = Math.min(c('density-card-pad-block'), 1), out2 = Math.min(1, Math.max(0, pad - 1)); return Math.max(0.25, r - Math.min(pad - out2, padB)); }
};
const derived = [];
for (const [name, f] of Object.entries(DERIVED)) {
  const cells = new Map(PRODUCTS.map((p) => {
    const c = (n) => { const x = cellsOf(p.knobs, n); if (Number.isNaN(x)) throw new Error(`${p.mode}: --${n} is not in cells, so ${name} can't follow it`); return x; };
    return [p.mode, f(c, p.knobs)];
  }));
  for (const m of Object.keys(SCREENS)) pv(`${SCREEN_KEY[m]}/${name}`, 'FLOAT', [], (p) => { const x = cells.get(p.mode); return x >= ROUND ? ROUND : round(x * CELL[m]); });
  const scope = /-r2?$/.test(name) ? ['CORNER_RADIUS'] : ['GAP'];
  const x = { name: 'derived/' + name, type: 'FLOAT', scopes: scope, values: Object.fromEntries(Object.keys(SCREENS).map((m) => [m, at0(`${SCREEN_KEY[m]}/${name}`)])), aliases: Object.fromEntries(Object.keys(SCREENS).map((m) => [m, `${SCREEN_KEY[m]}/${name}`])) };
  derived.push(x);
}
space.push(...derived);

/* ---- Type ------------------------------------------------------------------- */
// Resolved at core's values, and aliased to the frame's product.
const type = [];
const core = PRODUCTS[0].mode;
const at = (name) => product.find((x) => x.name === name).values[core];
for (const role of Object.keys(M.ROLES)) for (const part of ['size', 'line']) {
  const x = v(`type/${role}/${part}`, vals((m) => at(`${SCREEN_KEY[m]}/${role}/${part}`)), [part === 'size' ? 'FONT_SIZE' : 'LINE_HEIGHT']);
  x.aliases = Object.fromEntries(Object.keys(SCREENS).map((m) => [m, `${SCREEN_KEY[m]}/${role}/${part}`]));
  type.push(x);
}
type.push(...controlType);
const both = (pick) => Object.fromEntries(Object.keys(SCREENS).map((m) => [m, pick(m)]));
for (const f of FAMILIES) type.push(Object.assign(v('type/' + f, { type: 'STRING', values: both(() => at('font/' + f)) }, ['FONT_FAMILY']), { aliases: both(() => 'font/' + f) }));
for (const w of WEIGHTS) type.push(Object.assign(v('type/' + w, { type: 'FLOAT', values: both(() => at('weight/' + w)) }, ['FONT_WEIGHT']), { aliases: both(() => 'weight/' + w) }));

/* ---- Color ------------------------------------------------------------------ */
// Scoped by role: a ground is a fill, an ink is text, an edge is a stroke; a
// hue (the accent, a kind, a status) can be any of the three.
const colorScopes = (k) => /^bg/.test(k) ? ['FRAME_FILL', 'SHAPE_FILL'] : /^text|-ink$/.test(k) ? ['TEXT_FILL', 'SHAPE_FILL'] : /^border|^focus$/.test(k) ? ['STROKE_COLOR'] : ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR'];
const color = roles.map((k) => Object.assign(
  v('color/' + k, { type: 'COLOR', values: { Light: at('light/' + k), Dark: at('dark/' + k) } }, colorScopes(k)),
  { aliases: { Light: 'light/' + k, Dark: 'dark/' + k } }));
for (const [k, shares] of TINTS) for (const pct of shares) color.push({ name: `color/tint/${k}/${pct}`, type: 'COLOR', scopes: ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR'],
  codeSyntax: { WEB: /^stage-\d+$/.test(k) && pct === 14 ? `var(--${k}-tint)` : `color-mix(in oklab, var(--${k}) ${pct}%, transparent)` },
  values: { Light: at(`light/tint/${k}/${pct}`), Dark: at(`dark/tint/${k}/${pct}`) }, aliases: { Light: `light/tint/${k}/${pct}`, Dark: `dark/tint/${k}/${pct}` } });
// The shadow under a float or a modal (--lift): its color in each theme.
color.push({ name: 'color/lift', type: 'COLOR', scopes: ['EFFECT_COLOR'], values: { Light: '#1014161f', Dark: '#0000008c' } });
for (const k of SOLIDS) color.push({ name: 'color/on-' + k, type: 'COLOR', scopes: ['TEXT_FILL', 'SHAPE_FILL'], values: { Light: at('light/on-' + k), Dark: at('dark/on-' + k) }, aliases: { Light: 'light/on-' + k, Dark: 'dark/on-' + k } });

const out = {
  $description: 'Trellis variables for Figma, generated by tools/figma-variables.js from tokens.json, math.js and the product layers. Do not edit; regenerate.',
  screens: SCREENS,
  products: PRODUCTS.map((p) => Object.assign({ mode: p.mode, layer: p.file || 'product.template.css' }, p.scope ? { scope: p.scope } : {}, { notCarried: notCarried[p.mode] || [] })),
  collections: [
    { name: 'Product', modes: PRODUCTS.map((p) => p.mode), variables: product },
    { name: 'Space', modes: Object.keys(SCREENS), variables: space },
    { name: 'Type', modes: Object.keys(SCREENS), variables: type },
    { name: 'Color', modes: ['Light', 'Dark'], variables: color }
  ]
};

if (args.includes('--plugin')) {
  // Compact, since a plugin can't fetch and the script travels whole: per
  // variable [name, type, scopes, values in mode order, code syntax]; a value
  // "@name" is an alias, a color is hex without its #, and the code syntax is
  // 1 for var(--its last part), 0 for none (hidden), 2 for none (shown), or
  // written out. A product's tint (light/tint/<role>/<pct>) is its role's hex
  // with the share as alpha, so its values are 0 and the plugin works them out.
  const scopes = [...new Set(out.collections.flatMap((c) => c.variables.map((x) => x.scopes.join(','))))];
  const pack = (c, x) => {
    const val = (m) => { const a = x.aliases && x.aliases[m], y = x.values[m]; return a ? '@' + a : y && y.alias ? '@' + y.alias : x.type === 'COLOR' ? y.slice(1) : y; };
    const cs = !x.codeSyntax ? (x.hidden ? 0 : 2) : x.codeSyntax.WEB === `var(--${x.name.split('/').pop()})` ? 1 : x.codeSyntax.WEB;
    const tint = c.name === 'Product' && x.name.match(/^(light|dark)\/tint\/(.+)\/(\d+)$/);
    if (tint && c.modes.every((m) => x.values[m] === c.variables.find((y) => y.name === `${tint[1]}/${tint[2]}`).values[m] + alpha(+tint[3])))
      return [x.name, x.type[0], scopes.indexOf(x.scopes.join(',')), 0, cs];
    return [x.name, x.type[0], scopes.indexOf(x.scopes.join(',')), c.modes.map(val), cs];
  };
  const data = { scopes, collections: out.collections.map((c) => ({ name: c.name, modes: c.modes, v: c.variables.map((x) => pack(c, x)) })) };
  process.stdout.write(fs.readFileSync(path.join(__dirname, 'figma-plugin.js'), 'utf8').replace('/*DATA*/null', JSON.stringify(data)));
} else {
  const json = JSON.stringify(out, null, 2) + '\n';
  const to = flag('--out');
  if (to) { fs.writeFileSync(to, json); console.log(`${out.collections.map((c) => `${c.name} ${c.variables.length}`).join(' · ')} → ${to}`); }
  else process.stdout.write(json);
}
