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
   node tools/figma-variables.js --plugin product            a Figma plugin script that
   node tools/figma-variables.js --plugin space-type-color   writes them into the open
                                              file, by name, keeping every binding, in
                                              two parts to fit an agent's Figma tool
                                              (docs/figma/README.md): the Product
                                              collection, then the other three and the
                                              text styles
   node tools/figma-variables.js --plugin <part> --only <regex>   a delta: only the
                                              variables whose names match, nothing removed
   node tools/figma-variables.js --plugin checksum   a script that returns the open file's
   node tools/figma-variables.js --checksum          checksum of every value, and the
                                              generator's, to compare
   node tools/figma-variables.js --lengths    each part's length
   node tools/figma-variables.js --tokens FILE    another token file
   node tools/figma-variables.js --layer FILE …   these product layers, not examples/
                                                  and experiments/scopes/grove.css */
'use strict';
const fs = require('fs');
const path = require('path');
const M = require('../math.js');
const { seal, bare } = require('./figma-sealed.js');

const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
const flags = (name) => args.flatMap((a, i) => (a === name ? [args[i + 1]] : []));
const tokens = JSON.parse(fs.readFileSync(flag('--tokens') || path.join(root, 'tokens.json'), 'utf8'));
const seed = M.seedFromTokens(tokens);
// The example layers, and the scopes study: the one layer with scopes in it.
const LAYERS = (flags('--layer').length ? flags('--layer') : fs.readdirSync(path.join(root, 'examples')).filter((f) => f.endsWith('.css')).sort().map((f) => path.join(root, 'examples', f))
  .concat(path.join(root, 'experiments', 'scopes', 'grove.css')));

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
// The other quarter (--sp-q2): a half less a quarter, so the two make a half at any cell.
space.push(v('space/sp-q2', vals((m) => CELL[m] * ($('space', 'h') - $('space', 'q'))), ['GAP', 'WIDTH_HEIGHT']));
space.push(v('space/line', vals(() => 1), ['STROKE_FLOAT']));
// A hairline is one device pixel (--hair): a third of a point on the 3x phone, half on the 2x wide screen.
space.push(v('space/hair', vals((m) => 1 / SCREENS[m].dpr), ['STROKE_FLOAT', 'WIDTH_HEIGHT']));
// A ring's line (D103): a quarter of the dot, one line at the least and two at the most, on the half-cell dot.
space.push(v('derived/dot-ring', vals((m) => Math.min(2, Math.max(1, CELL[m] * 0.5 / 4))), ['STROKE_FLOAT']));
for (const k of keys(tokens.size.control)) space.push(v('size/size-control-' + k, vals((m) => CELL[m] * tokens.size.control[k].$value), ['WIDTH_HEIGHT']));
// --size-icon is a cell and two lines.
const linesOf = (t) => (t.$extensions && t.$extensions.trellis && t.$extensions.trellis.lines) || 0;
for (const k of keys(tokens.size.icon)) space.push(v('size/size-icon' + (k === 'base' ? '' : '-' + k), vals((m) => CELL[m] * tokens.size.icon[k].$value + linesOf(tokens.size.icon[k])), ['WIDTH_HEIGHT']));
space.push(v('size/hit-min', vals(() => tokens.size['hit-min'].$value), ['WIDTH_HEIGHT']));
// Measures core sets in cells and names: the shell's columns (D80), a bubble's measure (D99), a tray's width.
for (const [k, n] of [['shell-nav-w', 20], ['shell-aside-w', 24], ['chat-measure', 40], ['tray-w', 32]]) space.push(v('size/' + k, vals((m) => CELL[m] * n), ['WIDTH_HEIGHT']));
// A media frame's height (D108), a count of cells in the code: twelve, and a full-bleed card's eighteen.
for (const [k, n, css] of [['media-h', 12, 'calc(var(--u) * var(--media-h))'], ['media-h-fill', 18, '.media.cc-fill'],
  // What a message carries, at its widest (D99), and a textarea's three lines.
  ['chat-file-measure', 26, '.chat-file'], ['chat-link-measure', 32, '.chat-link'], ['textarea-h', 7, 'textarea.input'],
  // A large field's slot (D116): its height less a quarter cell each side. The other two are derived/input-slot and --sp-1h.
  ['input-slot-lg', 3.5, '.input.cc-slots.cc-lg']]) space.push(Object.assign(v('size/' + k, vals((m) => CELL[m] * n), ['WIDTH_HEIGHT']), { codeSyntax: { WEB: css } }));
for (const k of keys(tokens.radius)) {
  const n = tokens.radius[k].$value;
  space.push(v('radius/r-' + k, vals((m) => (n >= 999 ? 999 : CELL[m] * n)), ['CORNER_RADIUS']));
}
// A translucent bar's blur (D115): --shell-nav-blur: var(--sp-1), as the README has it. Figma's radius is twice CSS's.
space.push(v('derived/shell-nav-blur', vals((m) => CELL[m] * 2), ['EFFECT_FLOAT']));
const controlType = keys(tokens['control-type']).map((k) => v('type/control/fs-control' + (k === 'base' ? '' : '-' + k), vals(() => tokens['control-type'][k].$value), ['FONT_SIZE']));

/* ---- Products --------------------------------------------------------------- */
// A layer's knobs, as written: --name → its value. The template holds core's
// default for every knob, so core is the template, and a product is the
// template with its own layer over it.
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const knobsIn = (css) => new Map([...css.matchAll(/(--[a-z][a-z0-9-]*)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const TEMPLATE = knobsIn(stripComments(fs.readFileSync(path.join(root, 'product.template.css'), 'utf8')));
// A layer is its :root[data-product] rule and any scopes after it, each a
// [data-product] rule (D96), or [data-product][data-theme="dark"] where it is
// always dark (D114), as tests/contract.js reads them. A scope is the
// template, then the root's knobs, then its own: a choice the root made
// carries in, and what nobody set follows again from the scope's own values.
const title = (name) => name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const PRODUCTS = [{ mode: 'Core', knobs: TEMPLATE }].concat(LAYERS.flatMap((file) => {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const blocks = [...stripComments(fs.readFileSync(file, 'utf8')).matchAll(/((?::root)?\[data-product="([a-z-]+)"\](?:\[data-theme="dark"\])?)\s*\{([^}]*)\}/g)];
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
  // Web fonts a layer names that Figma has: the scopes study's (Grove).
  Geist: 'Geist', Halant: 'Halant', 'Cormorant Garamond': 'Cormorant Garamond', 'Alegreya Sans': 'Alegreya Sans'
};
const family = (k, name, seen = [], raw = false) => {
  const value = k.get(name) || '';
  const ref = value.match(/^var\((--[a-z-]+)\)$/);
  if (ref && !seen.includes(ref[1])) return family(k, ref[1], seen.concat(name), raw);
  const found = value.split(',').map((f) => f.trim().replace(/^["']|["']$/g, '')).find((f) => STAND_IN[f]);
  if (!found) throw new Error(`${name}: no family Figma has stands in for ${value}`);
  return raw ? found : STAND_IN[found];
};
// The family the code names first that Figma can stand in for, as the code writes it.
const codeFamily = (k, name) => family(k, name, [], true);

// The knobs a frame can hold: each is a length, an alias of the variable the
// layer names (var(--r-q) is radius/r-q, at the frame's own screen), or a
// number. A knob written as an expression is listed as not carried.
const KNOBS = [
  ['shape-card', 'CORNER_RADIUS'], ['shape-control', 'CORNER_RADIUS'], ['shape-input', 'CORNER_RADIUS'], ['shape-float', 'CORNER_RADIUS'],
  ['density-card-pad', 'GAP'], ['density-card-pad-inline', 'GAP'], ['density-card-pad-block', 'GAP'],
  ['density-control-h', 'WIDTH_HEIGHT'], ['density-control-fs', 'FONT_SIZE'],
  ['density-option-h', 'WIDTH_HEIGHT'], ['density-option-fs', 'FONT_SIZE'], ['density-options-pad', 'GAP'], ['density-seg-h', 'WIDTH_HEIGHT'],
  ['tag-default-h', 'WIDTH_HEIGHT'], ['tag-default-fs', 'FONT_SIZE'], ['tag-fs-sm', 'FONT_SIZE'], ['tag-fs-md', 'FONT_SIZE'], ['tag-fs-lg', 'FONT_SIZE'],
  ['tag-r-fixed', 'CORNER_RADIUS'],
  // A bubble's own corner and its padding (D122).
  ['chat-shape', 'CORNER_RADIUS'], ['chat-bubble-pad', 'GAP']
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
// a solid tag's, a badge's, a filled button's (D115); on the third ink a solid quiet tag's. Core writes it inline; the file holds it as a role.
const SOLIDS = roles.filter((k) => /^(kind-|ok$|warn$|alert$|stage-\d+$|text-tertiary$)/.test(k));
for (const theme of ['Light', 'Dark']) for (const k of SOLIDS) pv(`${theme.toLowerCase()}/on-${k}`, 'COLOR', [], (p) => M.hex(M.ink(palettes.get(p.mode)[theme][k], seeds.get(p.mode))));
// An outline button's edge and label (D115): its kind's color where it reads as text. With no kind it is the text's ink.
const OUTLINES = ['accent', 'ok', 'alert'];
const outlineInk = (p, theme, k) => M.hex(M.outlineInk(palettes.get(p.mode)[theme][k], theme.toLowerCase()));
for (const theme of ['Light', 'Dark']) for (const k of OUTLINES) pv(`${theme.toLowerCase()}/btn-outline-${k}`, 'COLOR', [], (p) => outlineInk(p, theme, k));
// What a filled kind's state layer mixes in (--state-tone, D120): on a fill between
// STATE_BAND's lightnesses, black under a white label and white under a dark one;
// anywhere else its label's own ink. A primary's label is the accent's ink, a
// destructive or confirming button's the ink computed from its fill.
const FILLED = { accent: 'accent-ink', alert: 'on-alert', ok: 'on-ok' };
const stateTone = (p, theme, k) => {
  const own = (n) => product.find((x) => x.name === `${theme.toLowerCase()}/${n}`).values[p.mode];
  const f = M.parseColor(own(k)), inBand = f[0] >= M.STATE_BAND[0] && f[0] <= M.STATE_BAND[1];
  return inBand ? (f[0] > seeds.get(p.mode).color.flip ? '#ffffff' : '#000000') : own(FILLED[k]);
};
for (const theme of ['Light', 'Dark']) for (const k of Object.keys(FILLED)) pv(`${theme.toLowerCase()}/state-tone-${k}`, 'COLOR', [], (p) => stateTone(p, theme, k));
// Tints: a role at a share over nothing, as core mixes them with color-mix()
// (a state over a control's fill, a tag's ground and edge, an avatar's wash).
// Figma has no mix, and drops a paint's own opacity on an instance, so each
// is a color with its alpha in it. [role, shares in percent]
const HUES = SOLIDS;
// 18% is a file's mark (D99), in the accent, a kind or the alert; 50% the unread line's rule.
const TINTS = [['text', [6, 8, 10, 12, 20, 24, 32]], ['accent', [8, 16, 18, 26, 50, 60]],
  // A filled button's hover and press in its state tone (D120), an outline's in its own ink (D115); a chosen card's wash is the accent's 8% (D116).
  ...Object.keys(FILLED).map((k) => ['state-tone-' + k, [6, 12]]), ...OUTLINES.map((k) => ['btn-outline-' + k, [6, 12]]),
  // A translucent bar's ground, at the least that reads over anything (D115).
  ['bg', [85]],
  ...HUES.map((k) => [k, [14, ...(/^kind-|^alert$/.test(k) ? [18] : []), ...(/^kind-(person|group)$/.test(k) ? [26] : []), 42]])];
const alpha = (pct) => Math.round(pct * 2.55).toString(16).padStart(2, '0');
for (const theme of ['Light', 'Dark']) for (const [k, shares] of TINTS) for (const pct of shares)
  pv(`${theme.toLowerCase()}/tint/${k}/${pct}`, 'COLOR', [], (p) => product.find((x) => x.name === `${theme.toLowerCase()}/${k}`).values[p.mode] + alpha(pct));
// A product's color knobs (the bubble's, D99, D122): each the role the layer names,
// in each theme, or a color written out. A mix is not carried. The two grounds are
// laid over their wash, transparent unless a product sets one.
const COLOR_KNOBS = { 'chat-bubble-bg': ['FRAME_FILL', 'SHAPE_FILL'], 'chat-own-bg': ['FRAME_FILL', 'SHAPE_FILL'], 'chat-own-ink': ['TEXT_FILL', 'SHAPE_FILL'], 'chat-bubble-edge': ['STROKE_COLOR'] };
// A bubble's ground (D122): a share of the text (others') or the accent (your own)
// mixed into the surface in OKLab, as core draws it. A mix can't be carried, so each
// is resolved over each surface a bubble can stand on, as a card's ground is.
const CHAT_GROUNDS = ['bg', 'bg-raised', 'bg-raised-2', 'bg-raised-3'];
const CHAT_WASHES = { 'chat-wash': ['text', '--chat-bubble-wash'], 'chat-own-wash': ['accent', '--chat-own-wash'] };
const share = (p, k) => { const m = (p.knobs.get(k) || '').match(/^(\d+(?:\.\d+)?)%$/); if (!m) throw new Error(`${p.mode}: ${k} is not a plain percentage`); return m[1] / 100; };
const toLab = (c) => [c[0], c[1] * Math.cos(c[2] * Math.PI / 180), c[1] * Math.sin(c[2] * Math.PI / 180)];
const mixLab = (a, s, b) => { const x = toLab(M.parseColor(a)), y = toLab(M.parseColor(b)), m = x.map((q, i) => q * s + y[i] * (1 - s)); return [m[0], Math.hypot(m[1], m[2]), ((Math.atan2(m[2], m[1]) * 180 / Math.PI) + 360) % 360]; };
for (const theme of ['light', 'dark']) for (const [k, [ink, knob]] of Object.entries(CHAT_WASHES)) for (const g of CHAT_GROUNDS)
  pv(`${theme}/${k}/${g}`, 'COLOR', [], (p) => { const own = palettes.get(p.mode)[theme === 'light' ? 'Light' : 'Dark']; return M.hex(mixLab(own[ink], share(p, knob), own[g])); });
// The washes' shares, as numbers: nothing binds them, they say what the grounds were worked out from.
for (const k of ['chat-bubble-wash', 'chat-own-wash']) pv('knob/' + k, 'FLOAT', [], (p) => round(share(p, '--' + k) * 100), `var(--${k})`);
for (const theme of ['light', 'dark']) for (const k of Object.keys(COLOR_KNOBS)) pv(`${theme}/${k}`, 'COLOR', [], (p) => {
  const value = p.knobs.get('--' + k), ref = value && value.match(/^var\(--([a-z0-9-]+)\)$/);
  if (ref && roles.includes(ref[1])) return { alias: `${theme}/${ref[1]}` };
  if (value === 'transparent') return '#00000000';
  try { return M.hex(M.parseColor(value)); } catch (e) { if (theme === 'light') (notCarried[p.mode] = notCarried[p.mode] || []).push(`--${k}: ${value}`); return { alias: `${theme}/${TEMPLATE.get('--' + k).match(/^var\(--([a-z0-9-]+)\)$/)[1]}` }; }
});
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
  // .card .media: concentric with the card, its corner less the smaller padding, a quarter cell at the least (D108).
  'media-r': (c) => Math.max(0.25, c('shape-card') - Math.min(c('density-card-pad-inline'), c('density-card-pad-block'))),
  // .input.cc-slots > .button: the box's height less a quarter cell each side (D116).
  'input-slot': (c) => c('density-control-h') - 0.5,
  // A card in a card: how far it steps out, and its corner, concentric (rule 21).
  'card-nest-out': (c) => Math.min(1, Math.max(0, c('density-card-pad-inline') - 1)),
  'card-nest-r': (c) => { const out = Math.min(1, Math.max(0, c('density-card-pad-inline') - 1)); return Math.max(0.25, c('shape-card') - Math.min(c('density-card-pad-inline') - out, c('density-card-pad-block'))); },
  'card-nest-r2': (c) => { const out = Math.min(1, Math.max(0, c('density-card-pad-inline') - 1)); const r = Math.max(0.25, c('shape-card') - Math.min(c('density-card-pad-inline') - out, c('density-card-pad-block')));
    const pad = Math.min(c('density-card-pad-inline'), 1), padB = Math.min(c('density-card-pad-block'), 1), out2 = Math.min(1, Math.max(0, pad - 1)); return Math.max(0.25, r - Math.min(pad - out2, padB)); }
};
// An icon's line at each size: --icon-weight 256ths of it (D118). In pixels, since a stroke here is not a share of its box.
const ICON_LINES = keys(tokens.size.icon).map((k) => (k === 'base' ? '' : '-' + k));
const iconLine = (p, m, k) => { const t = tokens.size.icon[k.slice(1) || 'base']; return round((CELL[m] * t.$value + linesOf(t)) * plain(p.knobs.get('--icon-weight')) / 256); };
const derived = [];
for (const k of ICON_LINES) {
  for (const m of Object.keys(SCREENS)) pv(`${SCREEN_KEY[m]}/icon-line${k}`, 'FLOAT', [], (p) => iconLine(p, m, k));
  derived.push({ name: 'derived/icon-line' + k, type: 'FLOAT', scopes: ['STROKE_FLOAT'], codeSyntax: { WEB: 'var(--icon-weight)' },
    values: Object.fromEntries(Object.keys(SCREENS).map((m) => [m, at0(`${SCREEN_KEY[m]}/icon-line${k}`)])), aliases: Object.fromEntries(Object.keys(SCREENS).map((m) => [m, `${SCREEN_KEY[m]}/icon-line${k}`])) });
}
for (const [name, f] of Object.entries(DERIVED)) {
  const cells = new Map(PRODUCTS.map((p) => {
    const c = (n) => { const x = cellsOf(p.knobs, n); if (Number.isNaN(x)) throw new Error(`${p.mode}: --${n} is not in cells, so ${name} can't follow it`); return x; };
    return [p.mode, f(c, p.knobs)];
  }));
  for (const m of Object.keys(SCREENS)) pv(`${SCREEN_KEY[m]}/${name}`, 'FLOAT', [], (p) => { const x = cells.get(p.mode); return x >= ROUND ? ROUND : round(x * CELL[m]); });
  const scope = /-r2?$/.test(name) ? ['CORNER_RADIUS'] : name === 'input-slot' ? ['WIDTH_HEIGHT'] : ['GAP'];
  const x = { name: 'derived/' + name, type: 'FLOAT', scopes: scope, values: Object.fromEntries(Object.keys(SCREENS).map((m) => [m, at0(`${SCREEN_KEY[m]}/${name}`)])), aliases: Object.fromEntries(Object.keys(SCREENS).map((m) => [m, `${SCREEN_KEY[m]}/${name}`])) };
  derived.push(x);
}
// A row centers its words in whole cells (D121): its title (the body role) and the
// line under it (sm), a cell apart, half a cell in a dense list, round up to whole
// cells with their padding once, and what that adds is shared above and below. A
// frame can't round, so the padding is worked out here, at each product's sizes:
// the row as many cells as the code's family makes it (a system sans's capitals are
// 0.7 of its size, Segoe UI's and SF's within half a percent; a family the layer
// names, its stand-in's), and the file's words, in the family standing in for it
// (each family's capitals as Figma trims them, measured in the file 2026-11-28),
// centered in it. Inter's capitals are 4% taller than a system sans's: without this
// a row could take a cell more in the file than in the code.
const CAP = { Inter: 0.727, Lato: 0.717, 'Hanken Grotesk': 0.697, Geist: 0.71, Gelasio: 0.693, 'Source Serif 4': 0.67, Halant: 0.66, 'Cormorant Garamond': 0.625, 'Alegreya Sans': 0.641 };
const SYSTEM_SANS = ['ui-sans-serif', 'system-ui', 'sans-serif'];
const rowPad = (p, m, cells) => {
  const own = (n) => product.find((x) => x.name === n).values[p.mode], u = CELL[m], fileCap = CAP[own('font/font-sans')];
  if (!fileCap) throw new Error(`${p.mode}: no capital height for ${own('font/font-sans')}`);
  const codeCap = SYSTEM_SANS.includes(codeFamily(p.knobs, '--font-sans')) ? 0.7 : fileCap;
  const words = (cap) => (own(`${SCREEN_KEY[m]}/body/size`) + own(`${SCREEN_KEY[m]}/sm/size`)) * cap + cells * u;
  return (Math.ceil((words(codeCap) + 2 * cells * u - 1 / 32) / u - 1e-9) * u - words(fileCap)) / 2;
};
for (const [name, cells] of [['list-pad', 1], ['list-pad-dense', 0.5]]) {
  for (const m of Object.keys(SCREENS)) pv(`${SCREEN_KEY[m]}/${name}`, 'FLOAT', [], (p) => round(rowPad(p, m, cells)));
  derived.push({ name: 'derived/' + name, type: 'FLOAT', scopes: ['GAP'], codeSyntax: { WEB: name === 'list-pad' ? '.list-item' : '.cc-dense .list-item' },
    values: Object.fromEntries(Object.keys(SCREENS).map((m) => [m, at0(`${SCREEN_KEY[m]}/${name}`)])), aliases: Object.fromEntries(Object.keys(SCREENS).map((m) => [m, `${SCREEN_KEY[m]}/${name}`])) });
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
// What the code writes for a tint: a stage's own role, a filled or outline button's state layer, or the mix.
const tintSyntax = (k, pct) => /^stage-\d+$/.test(k) && pct === 14 ? `var(--${k}-tint)` : /^state-tone-/.test(k) ? `color-mix(in oklab, var(--state-tone) ${pct}%, transparent)` : /^(on|btn-outline)-/.test(k) ? `color-mix(in oklab, var(--btn-ink) ${pct}%, transparent)` : `color-mix(in oklab, var(--${k}) ${pct}%, transparent)`;
for (const [k, shares] of TINTS) for (const pct of shares) color.push({ name: k === 'bg' ? 'color/shell-nav-bg' : `color/tint/${k}/${pct}`, type: 'COLOR', scopes: ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR'],
  codeSyntax: { WEB: k === 'bg' ? 'var(--shell-nav-bg)' : tintSyntax(k, pct) },
  values: { Light: at(`light/tint/${k}/${pct}`), Dark: at(`dark/tint/${k}/${pct}`) }, aliases: { Light: `light/tint/${k}/${pct}`, Dark: `dark/tint/${k}/${pct}` } });
for (const [k, [ink, knob]] of Object.entries(CHAT_WASHES)) for (const g of CHAT_GROUNDS) color.push({ name: `color/${k}/${g}`, type: 'COLOR', scopes: ['FRAME_FILL', 'SHAPE_FILL'],
  codeSyntax: { WEB: `color-mix(in oklab, var(--${ink}) var(${knob}), var(--${g}))` }, values: { Light: at(`light/${k}/${g}`), Dark: at(`dark/${k}/${g}`) }, aliases: { Light: `light/${k}/${g}`, Dark: `dark/${k}/${g}` } });
for (const [k, scopes] of Object.entries(COLOR_KNOBS)) color.push(Object.assign(v('color/' + k, { type: 'COLOR', values: { Light: at('light/' + k), Dark: at('dark/' + k) } }, scopes), { aliases: { Light: 'light/' + k, Dark: 'dark/' + k } }));
// The shadow under a float or a modal (--lift): its color in each theme.
// White, for words on a full-bleed image (D108), as on a .cover.
color.push({ name: 'color/white', type: 'COLOR', scopes: ['TEXT_FILL', 'SHAPE_FILL'], codeSyntax: { WEB: 'var(--white)' }, values: { Light: '#ffffff', Dark: '#ffffff' } });
// A plain button's edge there (--border-strong on a full bleed, D108).
color.push({ name: 'color/tint/white/60', type: 'COLOR', scopes: ['STROKE_COLOR'], codeSyntax: { WEB: 'color-mix(in oklab, var(--white) 60%, transparent)' }, values: { Light: '#ffffff99', Dark: '#ffffff99' } });
for (const k of OUTLINES) color.push({ name: 'color/btn-outline-' + k, type: 'COLOR', scopes: ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'], codeSyntax: { WEB: '.button.cc-outline' }, values: { Light: at('light/btn-outline-' + k), Dark: at('dark/btn-outline-' + k) }, aliases: { Light: 'light/btn-outline-' + k, Dark: 'dark/btn-outline-' + k } });
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

// The variables script travels in two parts, since an agent's Figma tool takes
// 50,000 characters: the Product collection, and the other three with the text
// styles (tools/figma-plugin.js). A variable's collection is known by the first
// part of its name, so a part can make one the other part writes.
const PARTS = { product: ['Product'], 'space-type-color': ['Space', 'Type', 'Color'] };
const owner = {};
for (const c of out.collections) for (const x of c.variables) {
  const k = x.name.split('/')[0];
  if (owner[k] && owner[k] !== c.name) throw new Error(`${x.name}: ${k}/ names variables in ${owner[k]} and ${c.name}`);
  owner[k] = c.name;
}
const coreOf = (prefix) => Object.fromEntries(product.filter((x) => x.name.startsWith(prefix)).map((x) => [x.name, x.values.Core]));
const fonts = { families: [...new Set(product.filter((x) => x.name.startsWith('font/')).flatMap((x) => Object.values(x.values)))],
  weights: [...new Set(product.filter((x) => x.name.startsWith('weight/')).flatMap((x) => Object.values(x.values)))], core: Object.assign(coreOf('font/'), coreOf('weight/')),
  // A text style holds one case and one tracking: core's defaults, in percent.
  tracking: { heading: parseFloat(TEMPLATE.get('--heading-tracking')) * 100, label: parseFloat(TEMPLATE.get('--label-tracking')) * 100, upper: TEMPLATE.get('--label-case') === 'uppercase' } };

// Compact, since a plugin can't fetch and the script travels whole: per
// variable [name, type, scopes, values in mode order, code syntax]; a value
// "@name" is an alias, a color is hex without its #, and the code syntax is
// 1 for var(--its last part), 0 for none (hidden), 2 for none (shown), 3 for the
// mix a tint's name says, or
// written out. A product's tint (light/tint/<role>/<pct>) is its role's hex
// with the share as alpha, so its values are 0 and the plugin works them out; one
// that is its own Product variable in every mode (color/x is light/x and dark/x) is
// 1; and a value the same as the mode before it is ''.
// only: a delta, the variables whose names match, written without removing the rest
// (and so the parts' empty stand-ins, and the text styles, are left alone too).
const mixOf = (name) => { const t = name.match(/^color\/tint\/(.+)\/(\d+)$/); return t && `color-mix(in oklab, var(--${t[1]}) ${t[2]}%, transparent)`; };
function plugin(part, only) {
  const own = out.collections.filter((c) => PARTS[part].includes(c.name));
  const scopes = [...new Set(own.flatMap((c) => c.variables.map((x) => x.scopes.join(','))))];
  const pack = (c, x) => {
    const val = (m) => { const a = x.aliases && x.aliases[m], y = x.values[m]; return a ? '@' + a : y && y.alias ? '@' + y.alias : x.type === 'COLOR' ? y.slice(1) : y; };
    const cs = !x.codeSyntax ? (x.hidden ? 0 : 2) : x.codeSyntax.WEB === `var(--${x.name.split('/').pop()})` ? 1 : x.codeSyntax.WEB === mixOf(x.name) ? 3 : x.codeSyntax.WEB;
    const tint = c.name === 'Product' && x.name.match(/^(light|dark)\/tint\/(.+)\/(\d+)$/);
    if (tint && !only && c.modes.every((m) => x.values[m] === c.variables.find((y) => y.name === `${tint[1]}/${tint[2]}`).values[m] + alpha(+tint[3])))
      return [x.name, x.type[0], scopes.indexOf(x.scopes.join(',')), 0, cs];
    const vals = c.modes.map(val), rest = x.name.split('/').slice(1).join('/');
    return [x.name, x.type[0], scopes.indexOf(x.scopes.join(',')), c.modes.every((m, i) => vals[i] === `@${m.toLowerCase()}/${rest}`) ? 1 : vals.map((y, i) => (i && y === vals[i - 1] ? '' : y)), cs];
  };
  const data = { scopes, owner, collections: out.collections.map((c) => Object.assign({ name: c.name, modes: c.modes }, own.includes(c) ? { v: c.variables.filter((x) => !only || only.test(x.name)).map((x) => pack(c, x)) } : {})) };
  data.fonts = own.some((c) => c.name === 'Type') && !only ? fonts : { families: fonts.families, weights: fonts.weights };
  if (only) data.delta = true;
  return seal(`figma-variables --plugin ${part}${only ? ' --only ' + only.source : ''}`, bare(fs.readFileSync(path.join(__dirname, 'figma-plugin.js'), 'utf8')).replace('/*DATA*/null', () => JSON.stringify(data)));
}

// A checksum of every value in every mode, to check a file against the
// generator: FNV-1a over the sorted lines "collection|name|mode|value", a
// color as 8-digit hex, a number to 3 places, an alias as @name. The
// checksum part prints a script that works out the same from the open file.
const valueLine = (x, m) => { const a = x.aliases && x.aliases[m], y = x.values[m];
  if (a || (y && y.alias)) return '@' + (a || y.alias);
  if (x.type === 'COLOR') return (y.length === 7 ? y + 'ff' : y).slice(1).toLowerCase();
  return x.type === 'FLOAT' ? (Math.round(y * 1000) / 1000).toFixed(3) : String(y); };
const fnv = (lines) => { let h = 0x811c9dc5; for (const ch of lines.sort().join('\n')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const CHECKSUM = `const fnv = ${fnv.toString()};
const lines = [], names = {};
const cols = await figma.variables.getLocalVariableCollectionsAsync(), vars = await figma.variables.getLocalVariablesAsync();
for (const x of vars) names[x.id] = x.name;
const hex = (c) => ['r', 'g', 'b', 'a'].map((k) => Math.round((k in c ? c[k] : 1) * 255).toString(16).padStart(2, '0')).join('');
for (const c of cols.filter((c) => ${JSON.stringify(out.collections.map((c) => c.name))}.includes(c.name))) for (const x of vars.filter((x) => x.variableCollectionId === c.id)) for (const m of c.modes) {
  const y = x.valuesByMode[m.modeId];
  lines.push([c.name, x.name, m.name, y && y.type === 'VARIABLE_ALIAS' ? '@' + names[y.id] : x.resolvedType === 'COLOR' ? hex(y) : x.resolvedType === 'FLOAT' ? (Math.round(y * 1000) / 1000).toFixed(3) : String(y)].join('|'));
}
return { values: lines.length, checksum: fnv(lines) };
`;
module.exports = { PARTS: Object.keys(PARTS).concat('checksum'), plugin: (part) => (part === 'checksum' ? CHECKSUM : plugin(part)) };

if (require.main !== module) return;   // required (tests/contract.js): nothing printed
if (args.includes('--plugin')) {
  const part = flag('--plugin');
  if (!module.exports.PARTS.includes(part)) { console.error(`--plugin takes one of: ${module.exports.PARTS.join(', ')}`); process.exit(1); }
  process.stdout.write(part === 'checksum' ? CHECKSUM : plugin(part, flag('--only') && new RegExp(flag('--only'))));
} else if (args.includes('--checksum')) {
  const lines = out.collections.flatMap((c) => c.variables.flatMap((x) => c.modes.map((m) => [c.name, x.name, m, valueLine(x, m)].join('|'))));
  console.log(JSON.stringify({ values: lines.length, checksum: fnv(lines) }));
} else if (args.includes('--lengths')) {
  for (const p of Object.keys(PARTS)) console.log(`${p}: ${plugin(p).length} characters`);
} else {
  const json = JSON.stringify(out, null, 2) + '\n';
  const to = flag('--out');
  if (to) { fs.writeFileSync(to, json); console.log(`${out.collections.map((c) => `${c.name} ${c.variables.length}`).join(' · ')} → ${to}`); }
  else process.stdout.write(json);
}
