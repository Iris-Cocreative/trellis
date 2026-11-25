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
  // A length in cells is a named count if there is one, and a product of the cell if not.
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
    `       It follows the reader's text size up to ${cap}× and no further: above that only type grows.`,
    `       --u-type is the rem formula alone, with no cap and no dial: the cell the reader's text size asks for. */`);
  line('u-type', `clamp(${rem(lo)}, calc(${rem(intercept)} + ${n(slope * 100)}vw), ${rem(hi)})`);
  line('u-base', `min(var(--u-type), ` +
    `clamp(${px(lo * cap)}, calc(${px(intercept * cap)} + ${n(slope * 100)}vw), ${px(hi * cap)}))`);
  line('frame-max-n', val(tokens.frame, 'max'));

  head('Counts: space in cells. Any whole count is on the grid; these have names');
  for (const k of keys(tokens.space)) {
    const v = val(tokens.space, k);
    if (v === 0.25) {
      line('sp-q', 'max(var(--line), round(nearest, calc(var(--u) / 4), 1px))', '¼u 3');
      line('sp-q2', 'calc(var(--sp-h) - var(--sp-q))', 'the other quarter: ¼u + this is exactly ½u at any cell');
    } else if (v === 0.5) line('sp-h', 'calc(var(--u) / 2)', '½u 6');
    else if (v === 1) line('sp-1', 'var(--u)', 'u 12');
    else line(`sp-${k}`, `calc(var(--u) * ${n(v)})`, `${n(v)}u ${at12(v)}`);
  }

  head('Sizes: named roles, each in cells, or in cells plus a line');
  for (const k of keys(tokens.size.icon)) {
    const t = tokens.size.icon[k], lines = ((t.$extensions || {}).trellis || {}).lines;
    line(k === 'base' ? 'size-icon' : `size-icon-${k}`, lines ? `calc(${cells(t.$value)} + var(--line) * ${lines})` : cells(t.$value), at12(t.$value) + (lines ? ` + ${lines} lines` : ''));
  }
  for (const k of keys(tokens.size.control)) line(`size-control-${k}`, cells(val(tokens.size.control, k)), at12(val(tokens.size.control, k)));
  line('hit-min', tokens.size['hit-min'].$value + 'px', 'the least hit area on a coarse pointer');

  head('Control type: fixed sizes, deliberately not fluid');
  for (const k of keys(tokens['control-type'])) line(k === 'base' ? 'fs-control' : `fs-control-${k}`, rem(val(tokens['control-type'], k)));

  head('Radii: measured in cells too. Nested radius = outer radius − padding');
  for (const k of keys(tokens.radius)) line(`r-${k}`, k === 'round' ? val(tokens.radius, k) + 'px' : cells(val(tokens.radius, k)));

  head('Layers: one scale for everything that stacks');
  for (const k of keys(tokens.layer)) line(`z-${k}`, val(tokens.layer, k));

  head('Motion: enter slower than exit');
  for (const k of keys(tokens.motion.duration)) {
    const d = val(tokens.motion.duration, k), ms = d.unit === 's' ? d.value * 1000 : d.value;
    line(`dur-${k}`, ms >= 1000 ? n(ms / 1000) + 's' : ms + 'ms');
  }
  for (const k of keys(tokens.motion.easing)) line(`ease-${k}`, `cubic-bezier(${val(tokens.motion.easing, k).map(x => n(x).replace(/^0\./, '.')).join(', ')})`);

  // Type from seven values (D93), in rem, unitless: the two spaces, H1, body
  // and the label in a wide space, and the ratio at each end. Five more follow
  // from them, as math.js's typeFrom() has it, and a product may set any.
  head('The ratio: seven values, in rem, unitless. Products set these');
  const t = tokens.type, unit = v => n(v / REM).replace(/^0\./, '.');
  line('c-min', n(val(t, 'space-narrow') / REM), `${val(t, 'space-narrow')}pt, the narrow space`);
  line('c-max', n(val(t, 'space-wide') / REM), `${val(t, 'space-wide')}pt, the wide space`);
  line('h1-max', unit(val(t, 'h1-wide')), 'H1 in a wide space');
  line('body-max', unit(val(t, 'body-wide')), 'body in a wide space');
  line('label-max', unit(val(t, 'label-wide')), 'the label');
  line('rh-min', n(val(t, 'heading-ratio-narrow')), 'the ratio in a narrow space');
  line('rh-max', n(val(t, 'heading-ratio-wide')), 'the ratio in a wide space');
  out.push('  }');
  // Five more follow (D93), and a product may set any of them: --rp-min,
  // --rp-max, --body-min, --h1-min and --label-min. They have no default: the
  // value in use, --type-*, is worked out on the root and again on every scope
  // (D96), so what a layer set carries in and what it left follows the scope's
  // own seven. Not on every text element: that cost WebKit a fifth of its
  // first settle (tests/perf.js), and a box that sets the seven is a scope.
  out.push('', '  /* And five that follow from the seven, with no default: --rp-min, --rp-max, --body-min, --h1-min,',
    '     --label-min. A product may set any; core reads --type-*, worked out here and on every scope. */',
    '  :root, [data-product] {');
  line('type-rp-min', 'var(--rp-min, sqrt(var(--rh-min)))', 'the text step, narrow: half a heading step');
  line('type-rp-max', 'var(--rp-max, sqrt(var(--rh-max)))', 'the text step, wide');
  line('type-body-min', 'var(--body-min, calc(var(--body-max) / sqrt(var(--rh-min))))', 'body in a narrow space: body less a narrow text step');
  line('type-h1-min', 'var(--h1-min, calc(var(--type-body-min) * pow(var(--rh-min), log(var(--h1-max) / var(--body-max), var(--rh-max)))))', 'H1 in a narrow space: as many steps above body as in a wide one');
  line('type-label-min', 'var(--label-min, var(--label-max))', 'the label is one size');
  out.push('  }', '}', '@layer trellis.theme {', '  :root {');
  // The palette is relational: seeds are knobs, roles are derived from them with
  // relative colors. light-dark() reads color-scheme, so one declaration carries
  // both themes. math.js derives the same seeds and roles in arithmetic.
  const col = tokens.color, short = v => n(v).replace(/^(-?)0\./, '$1.');
  const oklch = v => `oklch(${v.components.map((x, i) => (i === 2 ? n(x) : short(x))).join(' ')})`;
  const HUES = { accent: 'accent', person: 'kind-person', group: 'kind-group', event: 'kind-event', course: 'kind-course', topic: 'kind-topic', ok: 'ok', warn: 'warn', alert: 'alert' };
  const d = col.derive, dv = k => d[k].$value, KINDS = keys(d['kind-turn']), STATUSES = keys(d['status-hue']);
  const STAGES = names(d['stage-turn']).sort((a, b) => a - b);
  out.push('    /* Seeds: one color each, in its light-theme form. A product sets the accent. The others follow',
    '       from it, and a product may set any of them in its place (--seed-neutral, --seed-person, …,',
    '       --seed-ground and --seed-ink, the neutral for grounds and for text, and --seed-night, the ground at',
    '       night; --seed-stage-1 to -' + STAGES.length + ', the steps of a process). None has a default. If a',
    '       product layer sets one, it carries into its scopes; if not, each scope works it out from its own',
    '       accent. Products set seeds here, never roles. */');
  for (const k of keys(col.seed)) line(`seed-${k}`, oklch(col.seed[k].$value));
  line('color-lift', short(col.lift.$value), 'how much lighter a hue is in the dark theme');
  line('ink-flip', short(col['ink-flip'].$value), 'ink on a fill: white below this lightness, dark above it');
  line('day-depth', short(col['day-depth'].$value), 'how much darker every ground and edge is by day: 0 is white paper, higher is a beige paper; never under 0');
  line('night-lift', short(col['night-lift'].$value), 'how much lighter every ground and edge is at night: 0 is core\'s night, higher is lighter, like dusk, and down to -.025 is a deeper night');
  line('gradient-space', col.gradient.space.$value, 'the space gradients interpolate in');
  line('gradient-turn', n(col.gradient.turn.$value), 'degrees the accent gradient turns its hue');
  out.push('  }', '', '  /* Everything that follows from the seeds, on the root and again on every scope (D96), so a',
    '     scope that sets a seed recolors everything inside it. */', '  :root, [data-product] {');
  // A seed as it is used: the one a layer set, or the one that follows.
  const F = k => (col.seed[k] ? `var(--seed-${k})` : `var(--seed-${k}, var(--derived-${k}))`);
  // The seeds that follow from the accent (D90), as math.js's derived() has them.
  // clear(x): a lightness kept clear of the ink flip. S is 0 where the ink is
  // white and 1 where it is dark, the step the ink itself is written with.
  const S = x => `clamp(0, (${x} - var(--ink-flip)) * 1000, 1)`;
  const clear = x => `calc((1 - ${S(x)}) * clamp(${short(dv('clear-above'))} - var(--color-lift), ${x}, ${short(dv('clear-below'))}) + ${S(x)} * max(${x}, ${short(dv('clear-above'))}))`;
  // The limit: the most chroma sRGB holds at a hue for each unit of lightness,
  // as straight segments between a few hues. In CSS a segment is its slope
  // times clamp(0, hue − its start, its length), and the limit is the sum:
  // clamp and calc alone. cos() on a channel inside a relative color is not
  // safe to use: WebKit reads degrees there as radians, and Chromium before
  // 2026 reads the channel as nothing.
  const KNOTS = names(d.limit).map(k => [Number(k), d.limit[k].$value]).sort((a, b) => a[0] - b[0]);
  const limitAt = hue => { const x = ((hue % 360) + 360) % 360; let i = 0; while (i < KNOTS.length - 2 && KNOTS[i + 1][0] <= x) i++;
    return KNOTS[i][1] + (KNOTS[i + 1][1] - KNOTS[i][1]) * (x - KNOTS[i][0]) / (KNOTS[i + 1][0] - KNOTS[i][0]); };
  const num = v => String(Number(v.toFixed(7))).replace(/^(-?)0\./, '$1.');
  // limit(turn): the limit at the accent's hue turned by `turn`, for h from 0 to 360.
  const limit = turn => {
    const two = KNOTS.concat(KNOTS.slice(1).map(k => [k[0] + 360, k[1]]));
    let text = num(limitAt(turn));
    for (let i = 0; i < two.length - 1; i++) {
      const a = Math.max(two[i][0], turn), b = Math.min(two[i + 1][0], turn + 360);
      const slope = (two[i + 1][1] - two[i][1]) / (two[i + 1][0] - two[i][0]);
      if (b <= a || Math.abs(slope) < 1e-9) continue;
      const from = a - turn;
      text += ` ${slope < 0 ? '-' : '+'} ${num(Math.abs(slope))} * clamp(0, ${from ? `h - ${n(from)}` : 'h'}, ${n(b - a)})`;
    }
    return `(${text})`;
  };
  out.push('', '    /* The seeds that follow from the accent. Each takes its lightness, kept clear of the ink flip so',
    '       its ink reads; a kind is the accent turned around the hue wheel, with no more chroma than sRGB',
    '       holds at its hue; a status keeps its own hue; the neutral is a trace of the accent\'s hue; a',
    '       stage is the accent turned an eighth of the wheel further than the stage before it. */');
  line('derived-base', `oklch(from var(--seed-accent) ${clear('l')} c h)`, 'the accent, its lightness kept clear of the flip');
  line('derived-accent-night', 'oklch(from var(--seed-accent) calc(l + var(--color-lift)) c h)', 'the accent at night, unless a product gives it a night of its own (D98)');
  line('derived-neutral', `oklch(from var(--seed-accent) .55 ${short(dv('neutral-chroma'))} h)`);
  for (const k of KINDS) {
    const turn = n(d['kind-turn'][k].$value);
    line(`derived-${k}`, `oklch(from var(--derived-base) l min(c * ${short(dv('kind-chroma'))}, l * ${limit(d['kind-turn'][k].$value)}) calc(h + ${turn}))`);
  }
  const step = dv('topic-step'), stepped = step < 0 ? `l - ${short(-step)}` : `l + ${short(step)}`;
  line('derived-topic', `oklch(from var(--seed-accent) ${clear(`(${stepped})`)} calc(c * min(1, ${clear(`(${stepped})`)} / l)) h)`, 'the accent a step darker');
  for (const k of STATUSES)
    line(`derived-${k}`, `oklch(from var(--derived-base) l min(clamp(${short(dv('status-chroma-min'))}, c * ${short(dv('status-chroma'))}, ${short(dv('status-chroma-max'))}), l * ${num(limitAt(d['status-hue'][k].$value))}) ${n(d['status-hue'][k].$value)})`);
  for (const k of STAGES)
    line(`derived-stage-${k}`, `oklch(from var(--derived-base) l min(c * ${short(dv('stage-chroma'))}, l * ${limit(d['stage-turn'][k].$value)}) calc(h + ${n(d['stage-turn'][k].$value)}))`);

  head('Neutral roles: a seed\'s hue and chroma at a lightness for each theme. Grounds and edges take the ground seed (the night seed at night, lifted by --night-lift), text the ink seed; all follow the neutral unless set');
  const GROUND = `var(--seed-ground, ${F('neutral')})`, INK = `var(--seed-ink, ${F('neutral')})`, NIGHT = `var(--seed-night, ${GROUND})`, INK_NIGHT = `var(--seed-ink-night, ${INK})`;
  const at = (sd, l) => `oklch(from ${sd} ${short(l)} c h)`;
  // At night a ground or an edge takes the night seed (the ground unless set) and the night lift.
  for (const k of keys(col.neutral)) {
    const text = k.startsWith('text'), day = text ? INK : GROUND, l = col.neutral[k].dark.$value;
    // Ink climbs toward white as the night lifts, three times as fast, so a dusk keeps its floors.
    // By day a ground or an edge is darkened by --day-depth, and ink darkens with it, three times as fast.
    const d = col.neutral[k].light.$value;
    const dayPart = text ? `oklch(from ${INK} calc(${short(d)} * (1 - min(1, var(--day-depth) * 3))) c h)` : `oklch(from ${GROUND} calc(${short(d)} - var(--day-depth)) c h)`;
    line(k, `light-dark(${dayPart}, ${text ? `oklch(from ${INK_NIGHT} calc(${short(l)} + ${short(1 - l)} * min(1, var(--night-lift) * 3)) c h)` : `oklch(from ${NIGHT} calc(${short(l)} + var(--night-lift)) c h)`})`);
  }
  head('Hues: the seed in the light theme, lifted in the dark. Kinds: what sort of thing this is; shape and color both follow kind');
  for (const k of Object.keys(HUES)) {
    // The accent may have a night of its own (--seed-accent-night); every other hue is lifted.
    line(HUES[k], k === 'accent'
      ? `light-dark(${F(k)}, var(--seed-accent-night, var(--derived-accent-night)))`
      : `light-dark(${F(k)}, oklch(from ${F(k)} calc(l + var(--color-lift)) c h))`);
    if (k === 'accent') {
      line('accent-ink', 'oklch(from var(--accent) clamp(.16, (var(--ink-flip) - l) * 1000, 1) calc(clamp(0, (l - var(--ink-flip)) * 1000, 1) * c * .3) h)', 'white on a dark accent, a dark ink of its hue on a light one');
      line('focus', 'var(--accent)');
    }
  }
  // Stages (D107): a product may make a stage's seed pale, so each role is
  // worked out from the seed's own lightness. Where the lightness moves, the
  // chroma moves with it (math.js: shade), toward black in step with the
  // lightness and toward white in step with what is left of it.
  head('Stages: the steps of a process, in order. A fill (the seed, lifted in the dark no further than a derived seed is, so a pale one stays), an ink that reads as text in both themes, and a tint: the fill at a share');
  const SG = col.stage, inkDay = short(SG['ink-light'].$value), inkNight = short(SG['ink-dark'].$value);
  const up = to => `calc(c * min(1, (1 - ${to}) / max(1 - l, .001)))`;
  const lifted = `max(l, min(l + var(--color-lift), ${short(dv('clear-above'))} + var(--color-lift)))`;
  for (const k of STAGES) {
    const sd = `var(--seed-stage-${k}, var(--derived-stage-${k}))`;
    line(`stage-${k}`, `light-dark(${sd}, oklch(from ${sd} ${lifted} ${up(lifted)} h))`);
    line(`stage-${k}-ink`, `light-dark(oklch(from ${sd} min(l, ${inkDay}) calc(c * min(1, ${inkDay} / max(l, .001))) h), oklch(from ${sd} max(l, ${inkNight}) ${up(`max(l, ${inkNight})`)} h))`);
    line(`stage-${k}-tint`, `color-mix(in oklab, var(--stage-${k}) ${n(SG.tint.$value * 100)}%, transparent)`);
  }
  head('Gradients: an interpolation space and stops. Add a direction or a shape: linear-gradient(to right var(--gradient-accent))');
  line('gradient-accent', 'in var(--gradient-space), var(--accent), oklch(from var(--accent) l c calc(h + var(--gradient-turn)))');
  line('gradient-surface', 'in var(--gradient-space), var(--bg-raised), var(--bg-sunken)');
  out.push('  }');
  // A product's own colors (D117). A property's name can't be made from another,
  // so core can't give --seed-own-gold roles of its own name on the root. It gives
  // them where the color is used instead: any element that names a seed as its
  // --seed has that seed's roles. Nothing is declared where none is used.
  const solidLo = short(col.own['solid-below'].$value), solidHi = short(col.own['solid-above'].$value);
  const sd = 'var(--seed, var(--seed-accent))', pale = 'clamp(0, (l - var(--ink-flip)) * 100000, 1)';
  const solidL = `((1 - ${pale}) * min(l, ${solidLo}) + ${pale} * max(l, ${solidHi}))`;
  out.push('', '  /* A product\'s own colors (D117): --seed-own-gold and any other a layer names. An element that takes one as its',
    '     --seed has its roles, worked out as a stage\'s are: a fill, an ink that reads as text in both themes, a tint,',
    '     and a solid fill (the fill, clear of the ink flip) with the ink that reads on it. No element, no cost. */',
    '  .u-seed, .tag.cc-seed, .dot.cc-seed {');
  line('seeded', `light-dark(${sd}, oklch(from ${sd} ${lifted} ${up(lifted)} h))`);
  line('seeded-ink', `light-dark(oklch(from ${sd} min(l, ${inkDay}) calc(c * min(1, ${inkDay} / max(l, .001))) h), oklch(from ${sd} max(l, ${inkNight}) ${up(`max(l, ${inkNight})`)} h))`);
  line('seeded-tint', `color-mix(in oklab, var(--seeded) ${n(SG.tint.$value * 100)}%, transparent)`);
  line('seeded-solid', `oklch(from var(--seeded) calc${solidL} calc(c * min(1, ${solidL} / max(l, .001), (1 - ${solidL}) / max(1 - l, .001))) h)`);
  line('seeded-solid-ink', 'oklch(from var(--seeded-solid) clamp(.16, (var(--ink-flip) - l) * 1000, 1) calc(clamp(0, (l - var(--ink-flip)) * 1000, 1) * c * .3) h)');
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
  out.push('      --gradient-accent: in oklab, var(--accent), var(--accent);', '      --gradient-surface: in oklab, var(--bg-raised), var(--bg-sunken);', '    }',
    '    .u-seed, .tag.cc-seed, .dot.cc-seed { --seeded: var(--seed, var(--accent)); --seeded-ink: var(--text); --seeded-solid: var(--text); --seeded-solid-ink: var(--bg); }', '  }', '}');
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
