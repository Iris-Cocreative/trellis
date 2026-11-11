// Trellis · math test
// math.js says in arithmetic what core.css says in CSS. This opens the specimen
// and checks that the two agree, so a native screen that lays out with math.js
// lands on the same lattice a browser does:
//   the cell      the fit's count, cell and gutter on a phone; the whole cell,
//                 frame and gutter on a wide screen
//   the ratio     every type role's size, from the live knobs and its container
//   standing      a headline's line height, and its own space after it
// It runs each layer it is given, since a product turns the ratio's knobs.
// Usage: node math.js <url> [webkit]
// Needs Playwright (PLAYWRIGHT=module path). Exits 1 if anything disagrees.
const pw = require(process.env.PLAYWRIGHT || 'playwright');
const ready = require('./ready');
const target = require('./target');

const CASES = [
  ['1440x900', 'neutral', false, 12], ['1024x768', 'quarry', false, 12], ['1280x800', 'almanac', false, 16],
  ['393x852', 'neutral', true, 12], ['440x956', 'almanac', true, 12], ['375x812', 'quarry', true, 12],
  ['393x852', 'neutral', true, 14], ['852x393', 'almanac', true, 12],
];

(async () => {
  const [url, engine = 'chromium'] = process.argv.slice(2);
  if (!url) { console.error('usage: node math.js <url> [webkit]'); process.exit(2); }
  const browser = engine === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const fails = [];
  let checked = 0;
  for (const [size, product, touch, dial] of CASES) {
    const [width, height] = size.split('x').map(Number);
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: touch ? 3 : 1, isMobile: touch, hasTouch: touch });
    await page.addInitScript(d => localStorage.setItem('trellis', JSON.stringify({ dial: d, grid: false })), dial);
    await page.goto(target(url, product, 'light'), { waitUntil: 'networkidle', timeout: 120000 });
    await ready(page);
    const r = await page.evaluate(() => {
      const M = window.TrellisMath, root = document.documentElement, cs = getComputedStyle(root), out = [];
      const K = k => parseFloat(cs.getPropertyValue('--' + k)), rem = parseFloat(cs.fontSize);
      const near = (a, b, by) => Math.abs(a - b) <= (by || .02);
      let n = 0;
      const expect = (ok, what) => { n++; if (!ok) out.push(what); };
      const frame = document.getElementById('top'), u = parseFloat(cs.getPropertyValue('--u-px'));
      const scale = parseFloat(root.style.getPropertyValue('--u-scale')) || 1, dpr = window.devicePixelRatio;
      const fitted = matchMedia('(pointer: coarse) and (min-resolution: 1.5dppx)').matches && CSS.supports('width', 'calc(100vw / 1px * 1px)');
      const t = M.cellTarget({ width: window.innerWidth, textScale: rem / 16, dial: scale });
      const box = frame.getBoundingClientRect(), gutter = parseFloat(getComputedStyle(frame).paddingLeft);
      if (fitted) {
        const f = M.fit({ width: root.clientWidth, target: t, dpr });
        expect(near(f.cell, u, .001), `fit: the cell is ${u}, math says ${f.cell}`);
        expect(Math.round(box.width / u) === f.frameCells, `fit: the frame is ${Math.round(box.width / u)} cells, math says ${f.frameCells}`);
        expect(Math.round(gutter / u) === f.gutterCells, `fit: the gutter is ${Math.round(gutter / u)} cells, math says ${f.gutterCells}`);
        expect(Number.isInteger(f.modules), `fit: the field is ${f.modules} modules, not whole`);
      } else {
        expect(near(M.wholeCell(t), u, .001), `whole: the cell is ${u}, math says ${M.wholeCell(t)}`);
        const w = M.wideFrame({ width: root.clientWidth, cell: u, dpr });
        expect(Math.round(box.width / u) === w.frameCells, `whole: the frame is ${Math.round(box.width / u)} cells, math says ${w.frameCells}`);
        expect(Math.round(gutter / u) === w.gutterCells, `whole: the gutter is ${Math.round(gutter / u)} cells, math says ${w.gutterCells}`);
        expect(Number.isInteger(w.modules), `whole: the field is ${w.modules} modules, not whole`);
      }
      // The ratio, from the live knobs: a product layer turns them.
      const pair = k => [K(k + '-min') * 16, K(k + '-max') * 16];
      const seed = { cell: M.SEED.cell, frame: M.SEED.frame, type: { spaceNarrow: K('c-min') * 16, spaceWide: K('c-max') * 16, h1: pair('h1'), body: pair('body'), label: pair('label'),
        headingRatio: [K('rh-min'), K('rh-max')], paragraphRatio: [K('rp-min'), K('rp-max')], lineH1: K('lh-h1'), lineHeadingStep: K('lh-h-step'), lineBody: K('lh-body'),
        lineParagraphStep: K('lh-p-step'), lineLabel: K('lh-label'), afterH1: K('mb-h1'), afterHeadingStep: K('mb-h-step') } };
      const space = el => { let c = el.parentElement; while (c && getComputedStyle(c).containerType === 'normal') c = c.parentElement; const s = getComputedStyle(c); return c.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight); };
      document.querySelectorAll('.type-row .type-sample').forEach(el => {
        const role = (el.className.match(/t-(h\d|xl|lg|body|sm|xs|label)/) || [])[1], s = getComputedStyle(el);
        const size = M.typeSize(role, space(el), { textScale: rem / 16 }, seed), actual = parseFloat(s.fontSize);
        expect(near(size, actual, .06), `ratio: ${role} is ${actual}px, math says ${size.toFixed(3)}`);
        if (M.stands(role)) {
          const lh = M.lineHeight(role, actual, u, seed);
          expect(near(lh, parseFloat(s.lineHeight), .05), `standing: ${role}'s line is ${s.lineHeight}, math says ${lh.toFixed(3)}`);
          expect(near(lh / u, Math.round(lh / u), .001), `standing: ${role}'s line is not whole cells`);
        } else {
          expect(near(M.lineHeight(role, actual, u, seed), parseFloat(s.lineHeight), .05), `hanging: ${role}'s line is ${s.lineHeight}, math says ${M.lineHeight(role, actual, u, seed).toFixed(3)}`);
          const h = el.getBoundingClientRect().height;
          expect(near(M.hang(h, u), h, .05), `hanging: ${role}'s block is ${h}px, not whole cells`);
        }
      });
      return { fails: out, n, u, fitted };
    });
    checked += r.n;
    r.fails.forEach(f => fails.push(`${size} ${product}${touch ? ' touch' : ''} dial ${dial}: ${f}`));
    await page.close();
  }
  await browser.close();
  console.log(`${engine} math: ${checked} checks across ${CASES.length} screens and layers · ${fails.length ? fails.length + ' FAILED' : 'ok'}`);
  fails.forEach(f => console.log('  ' + f));
  process.exit(fails.length ? 1 : 0);
})();
