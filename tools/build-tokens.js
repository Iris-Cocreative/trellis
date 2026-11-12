// Trellis · the web token generator
// Writes the generated tokens of core.css from tokens.json: everything between
// the two marker comments. tokens.json holds values in cells and points; the
// conversion to rem, px and CSS functions lives here and nowhere else, so
// another platform reads the same file and writes its own units.
//   node tools/build-tokens.js           rewrite the block in core.css
//   node tools/build-tokens.js --check   exit 1 if core.css is out of date
// No dependencies. tests/contract.js runs the check.
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
const START = '/* tokens:start · generated from tokens.json by tools/build-tokens.js · do not edit by hand */';
const END = '/* tokens:end */';
const REM = 16;   // points in one rem

function build(tokens) {
  const n = v => String(Number(v.toFixed(5)));              // 0.625, not 0.62500
  const rem = pt => n(pt / REM) + 'rem';
  const val = (group, key) => group[key].$value;
  const names = group => Object.keys(group).filter(k => k[0] !== '$');
  // In the file's order, except the two scales whose names are numbers: a JSON
  // parser moves whole-number names first, so those are put in order of size.
  const keys = group => (group === tokens.space || group === tokens.radius
    ? names(group).sort((a, b) => group[a].$value - group[b].$value) : names(group));
  const SP = Object.fromEntries(keys(tokens.space).map(k => [val(tokens.space, k), k]));
  // A length in cells is an octave if there is one, and a product of the cell if not.
  const cells = c => (SP[c] ? `var(--sp-${SP[c]})` : `calc(var(--u) * ${n(c)})`);
  const out = [];
  const line = (name, value, note) => out.push(`    --${name}: ${value};${note ? `   /* ${note} */` : ''}`);
  const head = text => out.push('', `    /* ${text} */`);
  const at12 = c => n(c * 12);                              // for the comments: px at a 12px cell

  out.push('@layer trellis.tokens {', '  :root {');

  // The cell's target: a straight line between its two ends, clamped.
  const c = tokens.cell, lo = val(c, 'target-narrow'), hi = val(c, 'target-wide');
  const slope = (hi - lo) / (val(c, 'screen-wide') - val(c, 'screen-narrow'));
  const intercept = lo - slope * val(c, 'screen-narrow');
  // The cap: the target follows the reader's text size (rem) up to text-scale-max.
  // The target only grows with text size, so the capped target is the smaller of
  // the rem line and the same line at the cap, written in px, which text size
  // doesn't move. No typed division, so it holds in every browser.
  const cap = val(c, 'text-scale-max');
  const px = pt => n(pt) + 'px';
  out.push(`    /* The cell's target: ${lo}pt up to a ${val(c, 'screen-narrow')}pt screen, rising to ${hi}pt at ${val(c, 'screen-wide')}pt.`,
    `       It follows the reader's text size up to ${cap}× and no further: above that only type grows. */`);
  line('u-base', `min(clamp(${rem(lo)}, calc(${rem(intercept)} + ${n(slope * 100)}vw), ${rem(hi)}), ` +
    `clamp(${px(lo * cap)}, calc(${px(intercept * cap)} + ${n(slope * 100)}vw), ${px(hi * cap)}))`);
  line('frame-max-n', val(tokens.frame, 'max'));

  head('Octaves: the cell halved and doubled');
  for (const k of keys(tokens.space)) {
    const v = val(tokens.space, k);
    if (v === 0.25) {
      line('sp-q', 'max(var(--line), round(nearest, calc(var(--u) / 4), 1px))', '¼u 3');
      line('sp-q2', 'calc(var(--sp-h) - var(--sp-q))', 'the other quarter: ¼u + this is exactly ½u at any cell');
    } else if (v === 0.5) line('sp-h', 'calc(var(--u) / 2)', '½u 6');
    else if (v === 1) line('sp-1', 'var(--u)', 'u 12');
    else line(`sp-${k}`, `calc(var(--u) * ${n(v)})`, `${n(v)}u ${at12(v)}`);
  }

  head('Sizes: named roles, each an octave or an octave plus a line');
  for (const k of keys(tokens.size.icon)) {
    const t = tokens.size.icon[k], lines = ((t.$extensions || {}).trellis || {}).lines;
    line(k === 'base' ? 'size-icon' : `size-icon-${k}`, lines ? `calc(${cells(t.$value)} + var(--line) * ${lines})` : cells(t.$value), at12(t.$value) + (lines ? ` + ${lines} lines` : ''));
  }
  for (const k of keys(tokens.size.control)) line(`size-control-${k}`, cells(val(tokens.size.control, k)), at12(val(tokens.size.control, k)));
  line('hit-min', tokens.size['hit-min'].$value + 'px', 'the least hit area on a coarse pointer');

  head('Control type: fixed sizes, deliberately not fluid');
  for (const k of keys(tokens['control-type'])) line(k === 'base' ? 'fs-control' : `fs-control-${k}`, rem(val(tokens['control-type'], k)));

  head('Radii: octaves too. Nested radius = outer radius − padding');
  for (const k of keys(tokens.radius)) line(`r-${k}`, k === 'round' ? val(tokens.radius, k) + 'px' : cells(val(tokens.radius, k)));

  head('Layers: one scale for everything that stacks');
  for (const k of keys(tokens.layer)) line(`z-${k}`, val(tokens.layer, k));

  head('Motion: enter slower than exit');
  for (const k of keys(tokens.motion.duration)) {
    const d = val(tokens.motion.duration, k), ms = d.unit === 's' ? d.value * 1000 : d.value;
    line(`dur-${k}`, ms >= 1000 ? n(ms / 1000) + 's' : ms + 'ms');
  }
  for (const k of keys(tokens.motion.easing)) line(`ease-${k}`, `cubic-bezier(${val(tokens.motion.easing, k).map(x => n(x).replace(/^0\./, '.')).join(', ')})`);

  head('The ratio\'s neutral defaults, in rem, unitless. Products set these');
  const t = tokens.type;
  line('c-min', n(val(t, 'space-narrow') / REM), `${val(t, 'space-narrow')}pt, the narrow space`);
  line('c-max', n(val(t, 'space-wide') / REM), `${val(t, 'space-wide')}pt, the wide space`);
  for (const [name, key] of [['h1', 'h1'], ['body', 'body'], ['label', 'label']]) {
    line(`${name}-min`, n(val(t, key + '-narrow') / REM).replace(/^0\./, '.'));
    line(`${name}-max`, n(val(t, key + '-wide') / REM).replace(/^0\./, '.'));
  }
  line('rh-min', n(val(t, 'heading-ratio-narrow')));
  line('rh-max', n(val(t, 'heading-ratio-wide')));
  line('rp-min', n(val(t, 'paragraph-ratio-narrow')));
  line('rp-max', n(val(t, 'paragraph-ratio-wide')));

  out.push('  }', '}', '@layer trellis.theme {', '  :root {');
  const pair = g => (g.light.$value === g.dark.$value ? g.light.$value : `light-dark(${g.light.$value}, ${g.dark.$value})`);
  out.push('    /* Semantic roles. light-dark() reads color-scheme, so one declaration carries both themes. */');
  for (const k of keys(tokens.color)) line(k, pair(tokens.color[k]));
  head('Kinds: what sort of thing this is. Shape and color both follow kind');
  for (const k of keys(tokens.kind)) line(`kind-${k}`, pair(tokens.kind[k]));
  out.push('');
  for (const k of keys(tokens.status)) line(k, pair(tokens.status[k]));
  out.push('  }', '}');
  return out.join('\n');
}

function run(check) {
  const tokens = JSON.parse(fs.readFileSync(path.join(dir, 'tokens.json'), 'utf8'));
  const file = path.join(dir, 'core.css');
  const css = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const a = css.indexOf(START), b = css.indexOf(END);
  if (a < 0 || b < a) throw new Error('core.css has no tokens:start and tokens:end markers');
  const next = css.slice(0, a) + START + '\n' + build(tokens) + '\n' + css.slice(b);
  if (check) return next === css;
  if (next !== css) fs.writeFileSync(file, next);
  return next !== css;
}

module.exports = { build, check: () => run(true) };
if (require.main === module) {
  const check = process.argv.includes('--check');
  const r = run(check);
  if (check) { console.log(r ? 'tokens: core.css is up to date' : 'tokens: core.css is out of date; run node tools/build-tokens.js'); process.exit(r ? 0 : 1); }
  console.log(r ? 'tokens: core.css rewritten' : 'tokens: core.css already up to date');
}
