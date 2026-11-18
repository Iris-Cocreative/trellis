// Trellis · math test
// math.js says in arithmetic what core.css says in CSS. This opens the specimen
// and checks that the two agree, so a native screen that lays out with math.js
// lands on the same lattice a browser does:
//   the cell      the fit's count, cell and gutter on a phone; the whole cell,
//                 frame and gutter on a wide screen
//   the ratio     every type role's size, from the live knobs and its container
//   standing      a headline's line height, and its own space after it
//   the playground  the ratio playground's sample boxes carry knobs of their
//                 own: every role in them at its wide end and at its narrow
//                 end, and the half step as the root of the ratio
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
      const frame = document.getElementById('top'), u = Trellis.cell();
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
        // A reserve, if the page sets one, read as the browser resolved it.
        const reserve = k => { const p = document.createElement('i'); p.style.cssText = `position:absolute;visibility:hidden;height:0;width:var(--frame-reserve-${k}, 0px)`; frame.appendChild(p); const v = p.getBoundingClientRect().width; p.remove(); return v; };
        const w = M.wideFrame({ width: root.clientWidth, cell: u, dpr, reserveStart: reserve('start'), reserveEnd: reserve('end') });
        expect(near(box.left, w.margin, .51), `whole: the frame starts at ${box.left}, math says ${w.margin}`);
        expect(Math.round(box.width / u) === w.frameCells, `whole: the frame is ${Math.round(box.width / u)} cells, math says ${w.frameCells}`);
        expect(Math.round(gutter / u) === w.gutterCells, `whole: the gutter is ${Math.round(gutter / u)} cells, math says ${w.gutterCells}`);
        expect(Number.isInteger(w.modules), `whole: the field is ${w.modules} modules, not whole`);
      }
      // The ratio, from the live knobs: a product layer turns them.
      // The seven values are numbers. The five that follow are numbers only where
      // a product set them; left to core they are expressions (NaN here), and
      // math.js works them out. So every size below also checks that core.css's
      // sqrt(), pow() and log() make what typeFrom() makes (D93).
      const pt = k => K(k) * 16;
      const seed = { cell: M.SEED.cell, frame: M.SEED.frame, type: Object.assign(M.typeFrom(
        { h1: pt('h1-max'), body: pt('body-max'), label: pt('label-max'), ratio: [K('rh-min'), K('rh-max')], spaceNarrow: pt('c-min'), spaceWide: pt('c-max') },
        { h1: pt('h1-min'), body: pt('body-min'), label: pt('label-min'), step: [K('rp-min'), K('rp-max')] }), { lineH1: K('lh-h1'), lineHeadingStep: K('lh-h-step'), lineBody: K('lh-body'),
        lineParagraphStep: K('lh-p-step'), lineLabel: K('lh-label'), afterH1: K('mb-h1'), afterHeadingStep: K('mb-h-step') }) };
      const space = el => { let c = el.parentElement; while (c && getComputedStyle(c).containerType === 'normal') c = c.parentElement; const s = getComputedStyle(c); return c.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight); };
      // A heading is never smaller than body text (D89), read from the browser alone.
      const floored = (where, sizes) => Object.keys(sizes).filter(M.isHeading).forEach(role =>
        expect(sizes[role] >= sizes.body - .06, `floor: ${role} is ${sizes[role]}px ${where}, under body's ${sizes.body}px`));
      const onPage = {};
      document.querySelectorAll('.type-row .type-sample').forEach(el => {
        const role = (el.className.match(/t-(h\d|xl|lg|body|sm|xs|label|eyebrow)/) || [])[1], s = getComputedStyle(el);
        const size = M.typeSize(role, space(el), { textScale: rem / 16 }, seed), actual = parseFloat(s.fontSize);
        onPage[role] = actual;
        expect(near(size, actual, .06), `ratio: ${role} is ${actual}px, math says ${size.toFixed(3)}`);
        // A heading's own space after it, rounded up to whole cells. The specimen
        // zeroes its samples' margins, so a hidden copy in the same container,
        // followed by a sibling and outside any stack, is measured instead.
        if (M.isHeading(role)) {
          const w = document.createElement('div'), h = document.createElement('p');
          w.style.cssText = 'position:absolute;visibility:hidden;inset-inline:0';
          h.className = 't-' + role; h.textContent = 'Seed';
          w.append(h, document.createElement('span'));
          el.parentElement.appendChild(w);
          const mb = M.spaceAfter(role, parseFloat(getComputedStyle(h).fontSize), u, seed), got = parseFloat(getComputedStyle(h).marginBottom);
          w.remove();
          expect(near(mb, got, .05), `space after: ${role}'s is ${got}px, math says ${mb.toFixed(3)}`);
        }
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
      floored('on the page', onPage);
      // The playground (tuner.js). Its sample boxes carry the knobs it works out,
      // and the roles in them are the real classes: the wide box holds every
      // role at its wide end, the narrow box, as wide as the narrow space, at
      // its narrow end. Where a role's narrow end is the larger, CSS holds it there.
      ['wide', 'narrow'].forEach(end => {
        const box = document.querySelector('[data-play-box="' + end + '"]');
        const lines = box ? box.querySelectorAll('.play-line > p') : [];
        expect(lines.length === 13, `playground: the ${end} box has ${lines.length} roles, not 13`);
        if (!box) return;
        const bs = getComputedStyle(box), B = k => parseFloat(bs.getPropertyValue('--' + k));
        const ends = k => [B(k + '-min') * 16, B(k + '-max') * 16];
        const own = { cell: M.SEED.cell, frame: M.SEED.frame, type: Object.assign({}, seed.type, { h1: ends('h1'), body: ends('body'), label: ends('label'),
          headingRatio: [B('rh-min'), B('rh-max')], paragraphRatio: [B('rp-min'), B('rp-max')] }) };
        expect(near(B('rp-min'), Math.sqrt(B('rh-min')), .001) && near(B('rp-max'), Math.sqrt(B('rh-max')), .001),
          `playground: the half step is ${B('rp-min')} and ${B('rp-max')}, not the roots of ${B('rh-min')} and ${B('rh-max')}`);
        const inBox = {};
        lines.forEach(el => {
          const role = (el.className.match(/t-(h\d|xl|lg|body|sm|xs|label|eyebrow)/) || [])[1], e = M.typeEnds(role, own);
          const want = (end === 'wide' ? Math.max(e[0], e[1]) : e[0]) * rem / 16, actual = parseFloat(getComputedStyle(el).fontSize);
          inBox[role] = actual;
          expect(near(want, actual, .06), `playground: ${role} at its ${end} end is ${actual}px, math says ${want.toFixed(3)}`);
        });
        floored(`in the playground's ${end} box`, inBox);
      });
      // One seed (D90). With no product layer, the nine seeds that follow from the
      // accent are what math.js derives, for core's accent and for four others:
      // light and dark inks, strong and quiet, round the wheel.
      if (!root.hasAttribute('data-product')) {
        const probe = document.createElement('i');
        document.body.appendChild(probe);
        for (const accent of [null, [0.62, 0.19, 30], [0.7, 0.14, 150], [0.45, 0.2, 300], [0.36, 0.1, 200]]) {
          const seed = JSON.parse(JSON.stringify(M.SEED));
          if (accent) { seed.color.seeds.accent = accent; root.style.setProperty('--seed-accent', `oklch(${accent.join(' ')})`); }
          const want = M.derived(seed);
          for (const k of Object.keys(want)) {
            probe.style.color = k === 'accent' ? 'var(--seed-accent)' : `var(--seed-${k}, var(--derived-${k}))`;
            const css = getComputedStyle(probe).color, m = /^oklch\(([\d.]+) ([\d.]+) ([\d.-]+)\)$/.exec(css);
            const turn = m ? Math.abs((((+m[3] - want[k][2]) % 360) + 540) % 360 - 180) : 999;
            expect(m && near(+m[1], want[k][0], .002) && near(+m[2], want[k][1], .002) && turn < .2,
              `one seed: --seed-${k} from ${accent ? 'oklch(' + accent.join(' ') + ')' : "core's accent"} is ${css}, math says ${want[k].map(x => +x.toFixed(4)).join(' ')}`);
          }
          root.style.removeProperty('--seed-accent');
        }
        probe.remove();

        // Scopes (D96). A product nested in a product: what the root set carries
        // in, what the scope set is its own, and every role follows again from the
        // scope's seeds, as math.js's scope() has it. Checked in both themes, on a
        // scope that is a mood (data-theme), and for type: a ratio the scope sets
        // moves its text step; a text step the root chose carries in.
        const ROLES = ['bg', 'bg-raised', 'text', 'text-secondary', 'border', 'accent', 'accent-ink', 'kind-person', 'kind-topic', 'ok', 'alert'];
        const scopeEl = document.createElement('div'), inner = document.createElement('i');
        scopeEl.setAttribute('data-product', 'test-scope');
        scopeEl.appendChild(inner); document.body.appendChild(scopeEl);
        const triple = css => { const m = /^oklch\(([\d.]+) ([\d.]+) ([\d.-]+|none)\)$/.exec(css); return m ? [+m[1], +m[2], m[3] === 'none' ? 0 : +m[3]] : null; };
        const same = (a, b) => a && near(a[0], b[0], .004) && near(a[1], b[1], .004) && (b[1] < .012 || Math.abs((((a[2] - b[2]) % 360) + 540) % 360 - 180) < .5);
        const CASES2 = [
          ['a scope that sets its accent', {}, { accent: [0.5, 0.12, 30] }],
          ['the root\'s neutral carries into a scope that sets its accent', { neutral: [0.55, 0.03, 90] }, { accent: [0.45, 0.1, 150] }],
          ['a scope with its own ground and ink', {}, { accent: [0.5, 0.1, 250], ground: [0.55, 0.02, 80], ink: [0.55, 0.05, 140] }],
          ['the root\'s ground carries; the scope\'s ink is its own', { ground: [0.55, 0.012, 77] }, { accent: [0.63, 0.11, 82], ink: [0.55, 0.013, 82] }]
        ];
        for (const [what, rootSet, scopeSet] of CASES2) {
          for (const [k, v] of Object.entries(rootSet)) root.style.setProperty(`--seed-${k}`, `oklch(${v.join(' ')})`);
          for (const [k, v] of Object.entries(scopeSet)) scopeEl.style.setProperty(`--seed-${k}`, `oklch(${v.join(' ')})`);
          for (const theme of ['light', 'dark']) {
            scopeEl.setAttribute('data-theme', theme);
            const p = M.palette(theme, M.scope(M.SEED, rootSet, scopeSet));
            for (const role of ROLES) {
              inner.style.color = `var(--${role})`;
              const got = triple(getComputedStyle(inner).color);
              expect(same(got, p[role]), `scope: ${what}, ${theme}: --${role} is ${getComputedStyle(inner).color}, math says ${p[role].map(x => +x.toFixed(4)).join(' ')}`);
            }
          }
          for (const k of Object.keys(rootSet)) root.style.removeProperty(`--seed-${k}`);
          for (const k of Object.keys(scopeSet)) scopeEl.style.removeProperty(`--seed-${k}`);
        }
        // Night: a ground of another hue after dark, and a dusk lifted from night.
        {
          const set = { accent: [0.5, 0.1, 250], ground: [0.55, 0.011, 77], night: [0.55, 0.048, 132] };
          for (const [k, v] of Object.entries(set)) scopeEl.style.setProperty(`--seed-${k}`, `oklch(${v.join(' ')})`);
          for (const lift of [0, 0.15]) {
            scopeEl.style.setProperty('--night-lift', String(lift));
            for (const theme of ['light', 'dark']) {
              scopeEl.setAttribute('data-theme', theme);
              const seed = M.scope(M.SEED, {}, set); seed.color.nightLift = lift;
              const p = M.palette(theme, seed);
              for (const role of ['bg', 'bg-raised-3', 'border', 'text', 'text-secondary']) {
                inner.style.color = `var(--${role})`;
                expect(same(triple(getComputedStyle(inner).color), p[role]), `scope: night seed, lift ${lift}, ${theme}: --${role} is ${getComputedStyle(inner).color}, math says ${p[role].map(x => +x.toFixed(4)).join(' ')}`);
              }
            }
          }
          for (const k of Object.keys(set)) scopeEl.style.removeProperty(`--seed-${k}`);
          scopeEl.style.removeProperty('--night-lift');
        }
        scopeEl.removeAttribute('data-theme');
        inner.style.color = '';
        inner.style.display = 'block'; inner.className = 't-body';
        const step = () => { inner.style.width = 'calc(var(--type-rp-min) * 1000px)'; return inner.getBoundingClientRect().width / 1000; };
        scopeEl.style.setProperty('--rh-min', '1.5');
        expect(near(step(), Math.sqrt(1.5), .002), `scope: a scope's own ratio gives a text step of ${step()}, math says ${Math.sqrt(1.5).toFixed(4)}`);
        root.style.setProperty('--rp-min', '1.1');
        expect(near(step(), 1.1, .002), `scope: the root's chosen text step should carry into a scope that sets only its ratio; it is ${step()}`);
        root.style.removeProperty('--rp-min'); scopeEl.style.removeProperty('--rh-min');
        scopeEl.remove();
      }
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
