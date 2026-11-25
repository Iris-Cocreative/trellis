// Trellis · contract test. No browser; runs on the files.
// A documented API drifts unless something checks it, and drift is the thing this
// project exists to stop. Until the lints exist, this holds the line on:
//   every class in core.css is in the README's Public API
//   every variable that section names exists in core.css
//   every layer in core.css is named there
//   products turn knobs: a product layer is one :root rule of variables. Every
//     layer in examples/ is checked, the scopes study's (experiments/scopes/grove.css),
//     and so is any path given as an argument:
//     node contract.js ../my-app/product.css
//   every knob a product sets is in product.template.css, and exists in core
//   every template default matches core's
//   package.json exports what the README says, at the README's version
//   settle.js loads on a server without throwing, and twice without harm
// Usage: node contract.js. Exits 1 if anything is off.
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
// Line endings are normalized, so a checkout with CRLF reads the same.
const read = f => fs.readFileSync(path.resolve(dir, f), 'utf8').replace(/\r\n/g, '\n');
const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
const fails = [];
const check = (ok, what) => { if (!ok) fails.push(what); };

const core = stripComments(read('core.css'));
const readme = read('README.md');
const api = (readme.match(/## Public API\n([\s\S]*?)\n## /) || [])[1] || '';
check(api, 'README has no Public API section');

// Classes. Only what is used as a selector: a dot followed by a name, outside
// declarations' numbers and url()s, which the name pattern already excludes.
const coreRules = core.replace(/@layer[^{;]*[{;]/g, ' ');
const classes = new Set((coreRules.match(/\.[a-z][a-z0-9_-]*(?=[\s,.:>+~)\[{])/g) || []).map(c => c.slice(1)));
const inTicks = (api.match(/`[^`]*`/g) || []).filter(t => !/\.(css|js|json|md)`$|`window\./.test(t)).join(' ');
const documented = new Set((inTicks.match(/\.[a-z][a-z0-9_-]*/g) || []).map(c => c.slice(1)));
for (const c of classes) check(documented.has(c), `.${c} is in core.css but not in the README's Public API`);
for (const c of documented) check(classes.has(c), `.${c} is in the README's Public API but not in core.css`);

// Variables named in the API.
const named = new Set((api.match(/`[^`]*`/g) || []).join(' ').match(/--[a-z][a-z0-9-]*/g) || []);
for (const v of named) check(core.includes(v) || read('settle.js').includes(v), `${v} is in the README's Public API but not in core.css or settle.js`);

// Layers.
const layers = (core.match(/@layer\s+([a-z.]+)\s*\{/g) || []).map(l => l.match(/@layer\s+([a-z.]+)/)[1]);
for (const l of new Set(layers)) check(api.includes(l.replace('trellis.', '')) || api.includes(l), `layer ${l} is not named in the README's Public API`);
check(!core.match(/@layer\s+(reset|tokens|theme|base|layout|primitives|product|utilities)\b/), 'a layer in core.css is outside the trellis namespace');

// Products turn knobs. The same validator an installed consumer runs
// (tools/product.js, npx trellis-product): shape, knobs and, below, contrast.
const P = require('../tools/product.js');
const EXAMPLES = fs.readdirSync(path.join(dir, 'examples')).filter(f => f.endsWith('.css')).map(f => 'examples/' + f);
check(EXAMPLES.length >= 2, 'examples/ needs at least two product layers: they are what proves knobs can reshape everything');
// The scopes study's layer is the one with scopes, one of them always dark (D114).
const PRODUCTS = [...EXAMPLES, 'experiments/scopes/grove.css', ...process.argv.slice(2).map(f => path.resolve(f))];
const decl = s => [...s.matchAll(/(--[a-z][a-z0-9-]*)\s*:\s*([^;]+);/g)].map(m => [m[1], m[2].replace(/\s+/g, ' ').trim()]);
for (const f of PRODUCTS) fails.push(...P.shape(read(f), f).fails);

// The template.
const tpl = stripComments(read('product.template.css'));
const knobs = new Map(decl(tpl));
const coreDefaults = new Map();
for (const [k, v] of decl(core)) if (!coreDefaults.has(k)) coreDefaults.set(k, v);
for (const [k, v] of knobs) {
  check(core.includes(k), `product.template.css lists ${k}, which core.css never reads`);
  if (coreDefaults.has(k)) check(coreDefaults.get(k) === v, `template default for ${k} is "${v}"; core's is "${coreDefaults.get(k)}"`);
}
for (const line of read('product.template.css').split('\n')) {
  const m = line.match(/^\s*(--[a-z][a-z0-9-]*)\s*:/);
  if (m) check(line.includes('/*'), `product.template.css: ${m[1]} has no one-line meaning`);
}

// The Figma variables: generated, complete, every mode filled.
{
  const { execFileSync } = require('child_process');
  const fv = JSON.parse(execFileSync(process.execPath, [path.join(dir, 'tools', 'figma-variables.js')], { encoding: 'utf8' }));
  const names = new Set();
  for (const c of fv.collections) for (const v of c.variables) {
    check(!names.has(v.name), `figma-variables: ${v.name} twice`); names.add(v.name);
    for (const m of c.modes) check(v.values[m] !== undefined && v.values[m] !== null && !Number.isNaN(v.values[m]), `figma-variables: ${v.name} has no ${m} value`);
  }
  const color = fv.collections.find((c) => c.name === 'Color');
  const have = new Set(color ? color.variables.map((x) => x.name) : []);
  for (const k of Object.keys(require(path.join(dir, 'math.js')).palette('light'))) check(have.has('color/' + k), `figma-variables: the Color collection has no ${k}`);
  // A product is a mode, and every example layer is one.
  const product = fv.collections.find((c) => c.name === 'Product');
  for (const f of EXAMPLES) check(fv.products.some((p) => p.layer === f), `figma-variables: ${f} is not a Product mode`);
  for (const p of fv.products) check(!p.notCarried.length, `figma-variables: ${p.mode} sets knobs the file can't hold: ${p.notCarried.join(', ')}`);
  // An alias names a variable the file holds.
  for (const c of fv.collections) for (const x of c.variables) for (const a of [...Object.values(x.aliases || {}), ...Object.values(x.values).map((y) => y && y.alias)].filter(Boolean))
    check(names.has(a), `figma-variables: ${x.name} aliases ${a}, which isn't generated`);
  check(product && product.modes[0] === 'Core', 'figma-variables: the Product collection opens on Core');
  // The plugin scripts that write the file parse as the body of an async
  // function, as Figma's plugin tool runs them, and every variable the
  // components name is generated. The variables travel in parts
  // (tools/figma-variables.js), and between them write every collection once.
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const fvParts = require(path.join(dir, 'tools', 'figma-variables.js')).PARTS;
  const varScripts = fvParts.map((p) => [`figma-variables --plugin ${p}`, execFileSync(process.execPath, [path.join(dir, 'tools', 'figma-variables.js'), '--plugin', p], { encoding: 'utf8' })]);
  const written = {};
  for (const [name, src] of varScripts) {
    const packed = src.match(/^const PACKED = (.*);$/m);
    if (packed) for (const c of JSON.parse(packed[1]).collections.filter((c) => c.v)) {
      check(!written[c.name], `${name} writes ${c.name}, which ${written[c.name]} writes too`); written[c.name] = name;
      check(c.v.length === fv.collections.find((x) => x.name === c.name).variables.length, `${name} writes ${c.v.length} of ${c.name}'s variables`);
    }
  }
  for (const c of fv.collections) check(written[c.name], `no figma-variables part writes ${c.name}`);
  // The components travel in parts (tools/figma-components.js), each the kit and a body.
  const fc = require(path.join(dir, 'tools', 'figma-components.js'));
  const compScripts = Object.keys(fc.PARTS).map((p) => [`figma-components --plugin ${p}`, fc.script(p)]);
  for (const [name, src] of varScripts.concat(compScripts)) {
    try { new AsyncFunction('figma', src); } catch (e) { check(false, `${name} does not parse: ${e.message}`); }
    check(src.length < 50000, `${name} is ${src.length} characters; an agent's Figma tool takes 50,000`);
  }
  for (const [name, src] of compScripts) {
    for (const [, n] of src.matchAll(/'((?:space|size|radius|knob|derived|type|color)\/[a-z0-9/-]+)'/g))
      check(names.has(n), `${name} binds ${n}, which isn't generated`);
    // A role it paints, edges or inks by name is a Color variable.
    for (const m of src.matchAll(/(?:paint|edge|side|glyph)\('([a-z][a-z0-9-]*)'|ink: '([a-z][a-z0-9-]*)'/g))
      check(names.has('color/' + (m[1] || m[2])), `${name} paints ${m[1] || m[2]}, which isn't a Color variable`);
  }
  // Each part runs, in order, against a stand-in for Figma's API: a part that throws, or
  // asks for a component no part before it builds, fails here (tools/figma-inventory.js).
  try { execFileSync(process.execPath, [path.join(dir, 'tools', 'figma-inventory.js')], { encoding: 'utf8', stdio: 'pipe' }); } catch (e) { check(false, String(e.stderr || e.message).trim()); }
}

// Package.
const pkg = JSON.parse(read('package.json'));
for (const f of ['./core.css', './settle.js', './presets.js', './float.js', './product.template.css', './tokens.json', './math.js']) {
  check(pkg.exports && pkg.exports[f], `package.json doesn't export ${f}`);
  check(fs.existsSync(path.join(dir, f)), `${f} doesn't exist`);
}
for (const f of Object.keys(pkg.exports)) check(!/^\.\/examples\//.test(f), `${f} must not be a package export: a product layer lives with its product`);
check(pkg.name === '@iris-cocreative/trellis', `package.json's name is ${pkg.name}`);
// What an installed consumer gets (tests/package.js proves it from the tarball).
// A runtime that writes window.Trellis is a side effect, or a bundler drops its bare import.
const shipped = f => (pkg.files || []).includes(f.replace(/^\.\//, ''));
for (const f of Object.keys(pkg.exports).filter(f => f.endsWith('.js'))) {
  check(shipped(f), `package.json exports ${f} but its files don't carry it`);
  const writes = /window\.Trellis\s*=|\(window\.Trellis\s*=/.test(read(f));
  check(writes === (pkg.sideEffects || []).includes(f), `package.json's sideEffects should ${writes ? '' : 'not '}list ${f}: it ${writes ? 'sets' : "doesn't set"} window.Trellis`);
}
for (const [b, f] of Object.entries(pkg.bin || {})) {
  check(shipped(f), `the ${b} command's ${f} isn't in package.json's files`);
  check(read(f).startsWith('#!/usr/bin/env node\n'), `${f} needs a #!/usr/bin/env node line to run as ${b}`);
}
check(pkg.bin && pkg.bin['trellis-check'] === 'tools/check.js' && pkg.bin['trellis-product'] === 'tools/product.js', 'package.json should install trellis-check and trellis-product');
for (const f of ['skill/SKILL.md', 'skill/ADOPT.md']) check(shipped(f), `package.json's files don't carry ${f}, which the adoption workflow reads`);
check(!pkg.dependencies, 'package.json has runtime dependencies; Trellis has none');
check(fs.existsSync(path.join(dir, 'LICENSE')) && pkg.license === 'MIT', 'the MIT license is missing, or package.json does not name it');
const version = (readme.match(/\*\*v(\d+\.\d+(?:\.\d+)?)\b/) || [])[1];
check(version && pkg.version.startsWith(version), `README says v${version}; package.json says ${pkg.version}`);
check(read('CHANGELOG.md').includes(`## ${pkg.version}`), `CHANGELOG.md has no entry for ${pkg.version}`);
check(read('core.css').includes(`· v${version} ·`), `core.css's header doesn't say v${version}`);

// The token source. core.css's generated block is exactly what tokens.json makes,
// and the template's palette is the token source's.
const tokens = JSON.parse(read('tokens.json'));
check(require('../tools/build-tokens.js').check(), 'core.css is out of date with tokens.json: run node tools/build-tokens.js');
for (const group of ['cell', 'space', 'size', 'radius', 'layer', 'motion', 'color'])
  check(tokens[group], `tokens.json has no ${group} group`);
const color = tokens.color || {};
for (const [k, t] of Object.entries(color.seed || {})) {
  if (k[0] === '$') continue;
  const v = t.$value || {};
  check(v.colorSpace === 'oklch' && Array.isArray(v.components) && v.components.length === 3, `tokens.json: color.seed.${k} needs an OKLCH value`);
}
for (const [k, t] of Object.entries(color.neutral || {})) {
  if (k[0] === '$') continue;
  check(t.light && t.dark && typeof t.light.$value === 'number' && typeof t.dark.$value === 'number', `tokens.json: color.neutral.${k} needs a light and a dark lightness`);
}
check(color.lift && color['ink-flip'] && color.gradient, 'tokens.json: color needs lift, ink-flip and gradient');
const walk = (o, at = '') => Object.entries(o).forEach(([k, v]) => {
  if (k[0] === '$' || typeof v !== 'object' || v === null) return;
  if ('$value' in v) { const s = JSON.stringify(v.$value); check(!/rem|px|vw/.test(s), `tokens.json: ${at}${k} carries a web unit; values are in cells and points`); }
  else walk(v, at + k + '.');
});
walk(tokens);

// The math module: no DOM, and its neutral seed is the token source's and core's.
const M = require('../math.js');
const fromTokens = M.seedFromTokens(tokens);
check(JSON.stringify(fromTokens.cell) === JSON.stringify(M.SEED.cell), "math.js's cell seed is not tokens.json's");
check(JSON.stringify(fromTokens.type) === JSON.stringify(M.SEED.type), "math.js's type seed is not tokens.json's");
check(fromTokens.frame.max === M.SEED.frame.max, "math.js's frame seed is not tokens.json's");
check(JSON.stringify(fromTokens.color) === JSON.stringify(M.SEED.color), "math.js's color seed is not tokens.json's");

// Contrast. The palette is derived, so a product's seeds decide whether its
// text can be read: check core and every layer, in both themes, with the same
// arithmetic core.css uses (the floors are tools/product.js's).
const layersToCheck = [[null, 'core', M.SEED]];
const scopesOf = f => P.scopesOf(read(f), f, fails);
for (const f of PRODUCTS) for (const [label, , seed, themes] of scopesOf(f)) layersToCheck.push([f, label, seed, themes]);
// The Figma file's products (tools/figma-variables.js): core and every scope of
// every layer it reads is a Product mode (D96), and each mode's colors, night,
// dusk and paper included (D97, D98), are the ones this file composes and checks.
{
  const fv = JSON.parse(require('child_process').execFileSync(process.execPath, [path.join(dir, 'tools', 'figma-variables.js')], { encoding: 'utf8' }));
  const vars = new Map(fv.collections.find(c => c.name === 'Product').variables.map(x => [x.name, x]));
  const modes = [[fv.products[0], 'core', M.SEED]];
  for (const f of [...new Set(fv.products.slice(1).map(p => p.layer))]) for (const [label, scope, seed] of scopesOf(f)) {
    const p = fv.products.find(x => x.layer === f && (x.scope || null) === scope);
    check(p, `figma-variables: ${label} is not a Product mode`);
    if (p) modes.push([p, label, seed]);
  }
  for (const [p, label, seed] of modes) for (const theme of ['light', 'dark']) {
    const pal = M.palette(theme, seed);
    for (const k of Object.keys(pal)) {
      const v = vars.get(`${theme}/${k}`), got = v && v.values[p.mode];
      check(got === M.hex(pal[k]), `figma-variables: ${p.mode} ${theme}/${k} is ${got}, where ${label} is ${M.hex(pal[k])}`);
    }
  }
}
for (const [, f, seed, themes] of layersToCheck) fails.push(...P.contrast(f, seed, themes));
// A scope that is always dark says so in its selector, and only then is the day skipped (D114).
{
  // A night scope's colors: a status, as a line, is under its floor by day and over it at night.
  const night = '--seed-accent: oklch(.634 .112 82.1); --seed-ground: oklch(.55 .028 231.5);';
  const layer = (selector, knobs, more = '') => `@layer trellis.product { :root[data-product="p"] { --seed-accent: oklch(.333 .063 134.2); } ${more} ${selector} { ${knobs} } }`;
  const themesOf = (css) => [...new Set(P.validate(css, 'p').fails.filter((x) => x.startsWith('contrast:')).map((x) => / (light|dark): /.exec(x)[1]))].join(' ');
  const bad = '--seed-accent-night: oklch(.3 .02 90);';   // too dark for the night's page
  check(themesOf(layer('[data-product="x"]', night)) === 'light', 'product.js: a scope that does not say it is dark must be held to its floors by day');
  check(P.validate(layer('[data-product="x"][data-theme="dark"]', night), 'p').fails.length === 0, 'product.js: a scope that is always dark must not be held to its floors by day');
  check(themesOf(layer('[data-product="x"][data-theme="dark"]', night + bad)) === 'dark', 'product.js: a scope that is always dark must be held to its floors at night');
  check(themesOf(layer('[data-product="x"][data-theme="dark"]', '--shape-card: var(--r-1);', `[data-product="x"] { ${night} }`)) === 'light', "product.js: a scope's plain rule must be held to its floors in both themes, with a dark rule beside it");
  check(P.validate(layer('[data-product="x"][data-theme="dark"]', '--seed-accent-night: oklch(.8 .1 90);', `[data-product="x"] { --seed-ground: oklch(.55 .028 231.5); ${bad} }`), 'p').fails.filter((x) => x.includes('[data-theme="dark"]')).length === 0, "product.js: a dark rule's own seeds must win over its plain rule's");
  check(P.validate(layer('[data-product="x"][data-theme="dark"]', '--shape-card: var(--r-1);', `[data-product="x"] { ${bad} }`), 'p').fails.some((x) => x.includes('[data-theme="dark"]')), "product.js: a dark rule must stand on its plain rule's seeds");
  check(P.validate(read('experiments/scopes/grove.css').replaceAll('[data-theme="dark"] {', ' {'), 'grove').fails.length > 0, 'grove.css: without its selector the lodge must be held to its floors by day');
  // Not a way out: a light rule, a root rule or anything else in the selector is no scope.
  for (const s of ['[data-product="x"][data-theme="light"]', ':root[data-product="x"][data-theme="dark"]', '[data-product="x"].cc-dark'])
    check(P.shape(layer(s, night), 'p').fails.length > 0, `product.js: ${s} must not be taken for a scope`);
  // What makes it true: core draws that element in the dark theme, whatever the page's.
  check(/\[data-product\]\[data-theme="dark"\]:not\(:root\)\s*\{\s*color-scheme: dark;/.test(core), 'core.css: an element with data-product and data-theme="dark" must be dark whatever the page is');
}
// One seed (D90). Whatever accent a product chooses, inside sRGB, the seeds that
// follow from it carry an ink that reads, in both themes, and those whose ink
// is white are inside sRGB themselves.
{
  const rgb = c => { const a = c[1] * Math.cos(c[2] * Math.PI / 180), b = c[1] * Math.sin(c[2] * Math.PI / 180);
    const l = (c[0] + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (c[0] - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (c[0] - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]; };
  const inside = c => rgb(c).every(x => x > -0.002 && x < 1.002);
  let low = [99], out = null, n = 0;
  for (let l = 0.3; l <= 0.861; l += 0.04) for (let c = 0.02; c <= 0.241; c += 0.02) for (let h = 0; h < 360; h += 6) {
    if (!inside([l, c, h])) continue;
    const seed = JSON.parse(JSON.stringify(M.SEED)); seed.color.seeds = { accent: [l, c, h] };
    const d = M.derived(seed);
    for (const k of Object.keys(d)) {
      if (k === 'neutral') continue;
      n++;
      for (const theme of ['light', 'dark']) { const fill = M.hue(d[k], theme, seed), r = M.contrast(M.ink(fill, seed), fill); if (r < low[0]) low = [r, k, theme, l, c, h]; }
      if (d[k][0] < seed.color.flip && !inside(d[k]) && !out) out = [k, l, c, h, d[k]];
    }
  }
  check(n > 10000, `one seed: only ${n} derived seeds were checked`);
  check(low[0] >= 4.5, `one seed: ink on the ${low[1]} seed derived from oklch(${low.slice(3).map(x => +x.toFixed(2)).join(' ')}) is ${low[0].toFixed(2)}:1 in ${low[2]}, under 4.5`);
  check(!out, out ? `one seed: the ${out[0]} seed derived from oklch(${out.slice(1, 4).map(x => +x.toFixed(2)).join(' ')}) is outside sRGB: oklch(${out[4].map(x => +x.toFixed(3)).join(' ')})` : '');
  // core.css states the same rule: every seed but the accent is read as itself if set, and as its
  // derived token if not, and has no default, so one a layer leaves follows on every scope (D96).
  for (const k of ['neutral', 'person', 'group', 'event', 'course', 'topic', 'ok', 'warn', 'alert', ...[1, 2, 3, 4, 5, 6, 7].map(n => 'stage-' + n)])
    check(!coreDefaults.has(`--seed-${k}`) && coreDefaults.has(`--derived-${k}`) && core.includes(`var(--seed-${k}, var(--derived-${k}))`),
      `core.css: --seed-${k} should have no default and be read as var(--seed-${k}, var(--derived-${k}))`);
  check(/:root, \[data-product\] \{[^}]*--accent:/.test(core), 'core.css: the roles must be worked out on :root and on every [data-product] scope');
  // Stages (D107). Whatever color a product gives a stage, inside sRGB, pale or deep, its ink
  // reads as text on core's page and every raised level in both themes, its fill and its
  // ink stay inside sRGB (near enough: a twentieth of a channel), and a pale fill is not
  // lifted to white at night.
  let lowInk = [99], far = [0], sn = 0;
  const over = c => Math.max(0, ...rgb(c).map(x => Math.max(-x, x - 1)));
  for (let l = 0.25; l <= 0.961; l += 0.05) for (let c = 0; c <= 0.321; c += 0.04) for (let h = 0; h < 360; h += 10) {
    if (!inside([l, c, h])) continue;
    sn++;
    for (const theme of ['light', 'dark']) {
      const p = M.palette(theme, M.SEED), fill = M.stage([l, c, h], theme, M.SEED), ink = M.stageInk([l, c, h], theme, M.SEED);
      for (const g of ['bg', 'bg-raised', 'bg-raised-2', 'bg-raised-3']) { const r = M.contrast(ink, p[g]); if (r < lowInk[0]) lowInk = [r, theme, g, l, c, h]; }
      for (const x of [fill, ink]) if (over(x) > far[0]) far = [over(x), theme, l, c, h];
      check(theme === 'light' || fill[0] <= Math.max(l, M.SEED.color.derive.above + M.SEED.color.lift) + 1e-9, `stages: a seed at lightness ${l.toFixed(2)} is lifted to ${fill[0].toFixed(2)} at night`);
    }
  }
  check(sn > 1500, `stages: only ${sn} seeds were checked`);
  check(lowInk[0] >= 4.5, `stages: the ink of a stage seeded oklch(${lowInk.slice(3).map(x => +x.toFixed(2)).join(' ')}) is ${lowInk[0].toFixed(2)}:1 on --${lowInk[2]} in ${lowInk[1]}, under 4.5`);
  check(far[0] < 0.1, `stages: a stage seeded oklch(${far.slice(2).map(x => +x.toFixed(2)).join(' ')}) leaves sRGB by ${far[0].toFixed(3)} in ${far[1]}`);
}
for (const [k, name] of [['lineH1', '--lh-h1'], ['lineHeadingStep', '--lh-h-step'], ['lineBody', '--lh-body'], ['lineParagraphStep', '--lh-p-step'], ['lineLabel', '--lh-label'], ['afterH1', '--mb-h1'], ['afterHeadingStep', '--mb-h-step']])
  check(parseFloat(coreDefaults.get(name)) === M.SEED.type[k], `math.js's ${k} is ${M.SEED.type[k]}; core's ${name} is ${coreDefaults.get(name)}`);
// The worked examples in the README, which a native screen must reproduce.
const fitAt = (width, dial) => M.fit({ width, target: M.cellTarget({ width, dial }), dpr: 3 });
for (const [width, dial, cells, cell, gutter] of [[393, 1, 40, 9.8125, 2], [440, 1, 44, 9.96875, 2], [375, 1, 38, 9.84375, 3], [852, 1, 74, 11.5, 3], [393, 14 / 12, 34, 11.53125, 3]]) {
  const f = fitAt(width, dial);
  check(f.cells === cells && f.cell === cell && f.gutterCells === gutter && Number.isInteger(f.modules), `math.js: a ${width}pt screen should fit ${cells} cells of ${cell} with a ${gutter}-cell gutter; got ${f.cells}, ${f.cell}, ${f.gutterCells}`);
}
check(M.gutterCells(40) === 2 && M.gutterCells(42) === 3 && M.gutterCells(40, 5) === 6, 'math.js: the gutter parity rule is off');
check(M.wholeCell(M.cellTarget({ width: 1440 })) === 12 && M.wideFrame({ width: 1440, cell: 12 }).frameCells === 100, 'math.js: a 1440pt screen should hold a 100-cell frame of 12pt cells');

// The runtime on a server.
try {
  require('../settle.js');
  delete require.cache[require.resolve('../settle.js')];
  require('../settle.js');
} catch (e) { fails.push('settle.js throws on a server: ' + e.message); }

console.log(`contract: ${classes.size} classes, ${named.size} named variables, ${knobs.size} knobs, ${new Set(layers).size} layers checked · ${fails.length ? fails.length + ' FAILED' : 'ok'}`);
fails.forEach(f => console.log('  ' + f));
process.exit(fails.length ? 1 : 0);
