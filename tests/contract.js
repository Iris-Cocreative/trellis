// Trellis · contract test. No browser; runs on the files.
// A documented API drifts unless something checks it, and drift is the thing this
// project exists to stop. Until the lints exist, this holds the line on:
//   every class in core.css is in the README's Public API
//   every variable that section names exists in core.css
//   every layer in core.css is named there
//   products turn knobs: a product layer is one :root rule of variables. Every
//     layer in examples/ is checked, and so is any path given as an argument:
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
const inTicks = (api.match(/`[^`]*`/g) || []).filter(t => !/\.(css|js|json)`$|`window\./.test(t)).join(' ');
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

// Products turn knobs.
const EXAMPLES = fs.readdirSync(path.join(dir, 'examples')).filter(f => f.endsWith('.css')).map(f => 'examples/' + f);
check(EXAMPLES.length >= 2, 'examples/ needs at least two product layers: they are what proves knobs can reshape everything');
const PRODUCTS = [...EXAMPLES, ...process.argv.slice(2).map(f => path.resolve(f))];
const setBy = new Map();
const decl = s => [...s.matchAll(/(--[a-z][a-z0-9-]*)\s*:\s*([^;]+);/g)].map(m => [m[1], m[2].replace(/\s+/g, ' ').trim()]);
for (const f of PRODUCTS) {
  const css = stripComments(read(f));
  const rules = css.match(/[^{}]+\{/g).map(r => r.trim().replace(/\s*\{$/, ''));
  check(rules.length === 2 && /^@layer trellis\.product$/.test(rules[0]) && /^:root\[data-product="[a-z-]+"\]$/.test(rules[1]),
    `${f} must be one :root[data-product] rule in @layer trellis.product; found: ${rules.join(' | ')}`);
  const body = css.slice(css.indexOf('{', css.indexOf(':root')) + 1);
  const notVar = stripComments(body).replace(/--[a-z][a-z0-9-]*\s*:[^;]+;/g, '').replace(/[\s}]/g, '');
  check(!notVar, `${f} sets something other than a variable: ${notVar.slice(0, 60)}`);
  for (const [k] of decl(body)) setBy.set(k, f);
}

// The template.
const tpl = stripComments(read('product.template.css'));
const knobs = new Map(decl(tpl));
for (const [k, f] of setBy) check(knobs.has(k), `${f} sets ${k}, which product.template.css doesn't list`);
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

// Package.
const pkg = JSON.parse(read('package.json'));
for (const f of ['./core.css', './settle.js', './product.template.css', './tokens.json', './math.js']) {
  check(pkg.exports && pkg.exports[f], `package.json doesn't export ${f}`);
  check(fs.existsSync(path.join(dir, f)), `${f} doesn't exist`);
}
for (const f of Object.keys(pkg.exports)) check(!/^\.\/examples\//.test(f), `${f} must not be a package export: a product layer lives with its product`);
check(pkg.name === '@iris-cocreative/trellis', `package.json's name is ${pkg.name}`);
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
// text can be read: check every layer, in both themes, with the same arithmetic
// core.css uses. Floors are WCAG AA: 4.5 for text, 3 for a control's color.
// The faint ink and the borders are decoration and have none.
const FLOORS = [['text', 'bg', 4.5], ['text', 'bg-raised', 4.5], ['text', 'bg-sunken', 4.5],
  ['text-secondary', 'bg', 4.5], ['text-secondary', 'bg-raised', 4.5], ['text-secondary', 'bg-sunken', 4.5],
  ['text-tertiary', 'bg', 4.5], ['text-tertiary', 'bg-raised', 4.5],
  ['accent-ink', 'accent', 4.5], ['accent', 'bg', 3], ['accent', 'bg-raised', 3]];
for (const f of [null, ...PRODUCTS]) {
  const seed = JSON.parse(JSON.stringify(M.SEED));
  if (f) {
    const css = stripComments(read(f));
    for (const [, k, v] of css.matchAll(/--seed-([a-z]+)\s*:\s*([^;]+);/g)) {
      try { seed.color.seeds[k] = M.parseColor(v); } catch (e) { fails.push(`${f}: --seed-${k}: ${e.message}`); }
    }
    const lift = css.match(/--color-lift\s*:\s*([\d.]+)/), flip = css.match(/--ink-flip\s*:\s*([\d.]+)/);
    if (lift) seed.color.lift = +lift[1];
    if (flip) seed.color.flip = +flip[1];
  }
  for (const theme of ['light', 'dark']) {
    const p = M.palette(theme, seed);
    for (const [ink, ground, floor] of FLOORS) {
      const r = M.contrast(p[ink], p[ground]);
      check(r >= floor, `contrast: ${f || 'core'} ${theme}: --${ink} on --${ground} is ${r.toFixed(2)}:1, under ${floor}`);
    }
  }
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
