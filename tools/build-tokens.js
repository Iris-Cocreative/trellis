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
  // The palette is relational: seeds are knobs, roles are derived from them with
  // relative colors. light-dark() reads color-scheme, so one declaration carries
  // both themes. math.js derives the same roles in arithmetic.
  const col = tokens.color, short = v => n(v).replace(/^0\./, '.');
  const oklch = v => `oklch(${v.components.map((x, i) => (i === 2 ? n(x) : short(x))).join(' ')})`;
  const HUES = { accent: 'accent', person: 'kind-person', group: 'kind-group', event: 'kind-event', course: 'kind-course', topic: 'kind-topic', ok: 'ok', warn: 'warn', alert: 'alert' };
  out.push('    /* Seeds: one color each, in its light-theme form. A product sets these, never a role. */');
  for (const k of keys(col.seed)) line(`seed-${k}`, oklch(col.seed[k].$value));
  line('color-lift', short(col.lift.$value), 'how much lighter a hue is in the dark theme');
  line('ink-flip', short(col['ink-flip'].$value), 'ink on a fill: white below this lightness, dark above it');
  line('gradient-space', col.gradient.space.$value, 'the space gradients interpolate in');
  line('gradient-turn', n(col.gradient.turn.$value), 'degrees the accent gradient turns its hue');
  head('Neutral roles: the neutral seed\'s hue and chroma at a lightness for each theme');
  const at = (seed, l) => `oklch(from var(--seed-${seed}) ${short(l)} c h)`;
  for (const k of keys(col.neutral)) line(k, `light-dark(${at('neutral', col.neutral[k].light.$value)}, ${at('neutral', col.neutral[k].dark.$value)})`);
  head('Hues: the seed in the light theme, lifted in the dark. Kinds: what sort of thing this is; shape and color both follow kind');
  for (const k of keys(col.seed)) {
    if (!HUES[k]) continue;
    line(HUES[k], `light-dark(var(--seed-${k}), oklch(from var(--seed-${k}) calc(l + var(--color-lift)) c h))`);
    if (k === 'accent') {
      line('accent-ink', 'oklch(from var(--accent) clamp(.16, (var(--ink-flip) - l) * 1000, 1) calc(clamp(0, (l - var(--ink-flip)) * 1000, 1) * c * .3) h)', 'white on a dark accent, a dark ink of its hue on a light one');
      line('focus', 'var(--accent)');
    }
  }
  head('Gradients: an interpolation space and stops. Add a direction or a shape: linear-gradient(to right var(--gradient-accent))');
  line('gradient-accent', 'in var(--gradient-space), var(--accent), oklch(from var(--accent) l c calc(h + var(--gradient-turn)))');
  line('gradient-surface', 'in var(--gradient-space), var(--bg-raised), var(--bg-sunken)');
  out.push('  }');
  // A browser without relative colors gets core's own palette, resolved by
  // math.js: a product's seeds are lost there, its legibility is not.
  const M = require('../math.js'), seed = M.seedFromTokens(tokens);
  const light = M.palette('light', seed), dark = M.palette('dark', seed);
  out.push('  /* Without relative colors: core\'s palette, resolved by math.js. */', '  @supports not (color: oklch(from red l c h)) {', '    :root {');
  for (const k of Object.keys(light)) {
    const a = M.hex(light[k]), b = M.hex(dark[k]);
    out.push(`      --${k}: ${a === b ? a : `light-dark(${a}, ${b})`};`);
  }
  out.push('      --gradient-accent: in oklab, var(--accent), var(--accent);', '      --gradient-surface: in oklab, var(--bg-raised), var(--bg-sunken);', '    }', '  }', '}');
  return out.join('\n');
}

function run(check) {
  delete require.cache[require.resolve('../math.js')];
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
