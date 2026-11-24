// Trellis · real Tailwind beside Trellis
// layers.js proves the import order against the shape of Tailwind's layers;
// this proves it against Tailwind v4 itself, built the way an app builds it
// (experiments/tailwind, dist/ committed). It opens the spike page in each
// order and compares it with Trellis alone (?order=none):
//   rhythm      every box in the Trellis-only part sits where it sits without
//               Tailwind: preflight changed nothing
//   utility     a margin utility on a paragraph beats Trellis's reset
//   role        a type role beats preflight's flattened headings
//   theme       --font-sans and the other names Tailwind's theme shares are Trellis's
//   classes     .list-item is still a row and .outline draws no outline: the
//               app's @source not inline line kept Tailwind from making utilities of them
// It also reports, without failing on them, what an app has to know: which
// of Trellis's tokens the app's own unlayered :root replaces, that a layout in
// Tailwind's rem lengths puts a card off its line, and that Trellis's .grid
// gives a Tailwind `grid` its row gap.
// Usage: node tailwind.js <url> [webkit]   (url: the repository root, served)
//        LAYER=name=<address> adds a product layer beside core.css in every order.
// Needs Playwright (PLAYWRIGHT=module path). Exits 1 if a case surprises it,
// including an unsafe order ceasing to be unsafe: then the README is wrong.
const pw = require(process.env.PLAYWRIGHT || 'playwright');
const ready = require('./ready');
const fresh = require('./tailwind-fresh');

const SAFE = { rhythm: true, utility: true, role: true, theme: true, classes: true };
const CASES = [
  { order: 'statement', expect: SAFE },
  { order: 'statement-trellis', expect: SAFE },
  { order: 'bundle', expect: SAFE },
  // Without the statement each order breaks something; the statement fixes both.
  { order: 'tailwind', expect: { ...SAFE, utility: false } },
  { order: 'trellis', expect: { ...SAFE, rhythm: false, role: false, theme: false } },
  // Without @source not inline, a Trellis class name becomes a utility too,
  // and a list row that is display: list-item moves everything under it.
  { order: 'unguarded', expect: { ...SAFE, rhythm: false, classes: false } },
];
const LAYER = process.env.LAYER;
if (LAYER && !/^[a-z][a-z0-9-]*=.+\.css$/.test(LAYER)) { console.error('LAYER must be name=<address of a .css file>'); process.exit(2); }
const SHARED = ['--font-sans', '--font-serif', '--font-mono', '--ease-in', '--ease-out'];

(async () => {
  const [base, engine = 'chromium'] = process.argv.slice(2);
  if (!base) { console.error('usage: node tailwind.js <url> [webkit]'); process.exit(2); }
  const browser = engine === 'webkit' ? await pw.webkit.launch()
    : await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));

  const read = async order => {
    const u = new URL(`experiments/tailwind/index.html?order=${order}&theme=light`, base);
    if (LAYER) { const at = LAYER.indexOf('='); u.searchParams.set('product', LAYER.slice(0, at)); u.searchParams.set('layer', new URL(LAYER.slice(at + 1), base).href); }
    await page.goto(u.href, { waitUntil: 'load' });
    await ready(page);
    return page.evaluate(shared => {
      const top = document.getElementById('top'), pr = top.getBoundingClientRect(), u = Trellis.cell();
      const root = getComputedStyle(document.documentElement);
      const rects = [...document.querySelectorAll('#surface, #surface *')].map(e => {
        const b = e.getBoundingClientRect();
        return [b.left - pr.left, b.top - pr.top, b.width, b.height].map(v => +v.toFixed(2)).join(',');
      });
      // Every custom property any sheet declares, and which of them a rule in
      // no cascade layer declares (an app's own unlayered :root).
      const tokens = {}, unlayered = {};
      for (const s of document.styleSheets) {
        let rules; try { rules = s.cssRules; } catch (e) { continue; }
        const walk = (list, layered) => { for (const r of list) {
          if (r.style) for (const p of r.style) if (p.startsWith('--')) { tokens[p] = 1; if (!layered && r.selectorText === ':root') unlayered[p] = 1; }
          if (r.cssRules) walk(r.cssRules, layered || r instanceof CSSLayerBlockRule);
        } };
        walk(rules, false);
      }
      for (const t of Object.keys(tokens)) tokens[t] = root.getPropertyValue(t).trim();
      const h1 = document.getElementById('role'), p = document.getElementById('utility');
      const row = document.querySelector('#list .list-item'), outline = document.getElementById('outline');
      const out = {
        u, rects, tokens, unlayered: Object.keys(unlayered), fonts: Object.fromEntries(shared.map(t => [t, root.getPropertyValue(t).trim()])),
        margin: parseFloat(getComputedStyle(p).marginTop),
        h1: parseFloat(getComputedStyle(h1).fontSize), body: parseFloat(getComputedStyle(document.body).fontSize),
        row: getComputedStyle(row).display, outline: getComputedStyle(outline).outlineStyle,
      };
      // The template's two layouts, measured once and removed.
      const t = document.getElementById('rem-layout').content.cloneNode(true);
      top.appendChild(t);
      const off = v => { const m = ((v % u) + u) % u; return m > .5 && m < u - .5; };
      const cards = [...document.querySelectorAll('#rem .card')].map(c => c.getBoundingClientRect());
      out.remOff = cards.filter(b => off(b.left - pr.left) || off(b.top - pr.top)).length;
      out.remCards = cards.length;
      out.leakGap = parseFloat(getComputedStyle(document.getElementById('leak')).rowGap) / u;
      document.getElementById('rem').remove(); document.getElementById('leak').remove();
      return out;
    }, SHARED);
  };

  const alone = await read('none');
  let bad = 0;
  for (const c of CASES) {
    // The bundle holds its own copy of core.css; built from another, it tests that one.
    if (c.order === 'bundle' && !fresh()) { console.log(`skip ${engine} bundle: dist/bundle.css holds an older core.css (run node build.js in experiments/tailwind; CI does)`); continue; }
    const r = await read(c.order);
    const moved = r.rects.filter((x, i) => x !== alone.rects[i]).length + Math.abs(r.rects.length - alone.rects.length);
    const got = {
      rhythm: moved === 0,
      utility: Math.abs(r.margin - 2 * r.u) < .01,
      role: r.h1 > r.body,
      theme: SHARED.every(t => r.fonts[t] === alone.fonts[t]),
      classes: r.row === 'flex' && r.outline === 'none',
    };
    const wrong = Object.keys(got).filter(k => got[k] !== c.expect[k]);
    if (wrong.length) bad++;
    console.log(`${wrong.length ? 'FAIL' : 'ok  '} ${engine} ${c.order}: ` +
      `rhythm ${got.rhythm ? 'kept' : `broken (${moved} of ${alone.rects.length} boxes moved)`} · ` +
      `utility ${got.utility ? 'wins' : 'loses'} (${r.margin}px, 2 cells ${+(2 * r.u).toFixed(2)}px) · ` +
      `role ${got.role ? 'wins' : 'loses'} (${r.h1}px over ${r.body}px) · ` +
      `theme ${got.theme ? "Trellis's" : `Tailwind's (${SHARED.filter(t => r.fonts[t] !== alone.fonts[t]).join(' ')})`} · ` +
      `classes ${got.classes ? 'kept' : `taken (.list-item ${r.row}, .outline ${r.outline})`}` +
      (wrong.length ? `  [expected ${wrong.map(k => `${k} ${c.expect[k] ? 'safe' : 'broken'}`).join(', ')}]` : ''));
    if (c.order === 'statement') {
      // What an app has to know, from the order it should use.
      const changed = Object.keys(alone.tokens).filter(t => t in r.tokens && r.tokens[t] !== alone.tokens[t]);
      const taken = changed.filter(t => r.unlayered.includes(t)), follow = changed.filter(t => !taken.includes(t));
      console.log(`  note: the app's unlayered :root declares ${taken.length} of Trellis's tokens, and wins them in every order: ${taken.join(' ')}`);
      console.log(`  note: ${follow.length} more follow from those: ${follow.join(' ')}`);
      console.log(`  note: in Tailwind's own lengths (grid-cols-3 gap-6 p-8) ${r.remOff} of ${r.remCards} cards are off their lines`);
      console.log(`  note: Trellis's .grid gives a Tailwind \`grid gap-x-4\` a row gap of ${+r.leakGap.toFixed(2)} cells`);
      if (!taken.includes('--accent')) { bad++; console.log('FAIL the app\'s --accent no longer replaces Trellis\'s: the theme map is out of date'); }
    }
  }
  if (errors.length) { bad++; errors.slice(0, 5).forEach(e => console.log('  error ' + e)); }
  await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]); // WebKit on Windows can hang on close
  process.exit(bad ? 1 : 0);
})();
