// Trellis · pixel test
// Lines are planes: a card's edge must cover the same device pixels as the
// grid line it stands on. This renders the specimen as a 3x phone, paints
// every card's edge pure red on black, screenshots it, and checks that each
// edge starts on the device pixel its coordinate rounds to (half up), which
// is where the grid canvas draws that line, and that it is 3 device pixels
// (one CSS pixel) wide.
// Usage: node pixel.js <url> [WxH] [webkit] [dial]
// Needs Playwright (PLAYWRIGHT=module path; CHROME=a Chrome binary for Chromium).
// Exits 1 if any edge is off. Run it in WebKit: that is what an iPhone draws
// with, and Chrome's device emulation snaps to whole CSS pixels instead.
const pw = require(process.env.PLAYWRIGHT || 'playwright');
const ready = require('./ready');

(async () => {
  const [url, size = '393x852', engine = 'webkit', dial = '12'] = process.argv.slice(2);
  if (!url) { console.error('usage: node pixel.js <url> [WxH] [webkit|chromium] [dial]'); process.exit(2); }
  const [w, h] = size.split('x').map(Number), D = 3;
  const browser = engine === 'webkit' ? await pw.webkit.launch()
    : await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: D, isMobile: true, hasTouch: true });
  const decoder = await browser.newPage();
  await page.addInitScript(d => localStorage.setItem('trellis', JSON.stringify({ dial: d, grid: false })), +dial);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
  await page.addStyleTag({ content: '.card::after{border-color:#f00 !important} .card{background:#000 !important} *{transition:none !important}' });
  await ready(page);

  const red = p => p[0] > 200 && p[1] < 60 && p[2] < 60;
  const R0 = v => Math.floor(v * D + .5);
  let checked = 0, off = 0;
  // A card inside a scroller (a rail) is clipped by its scroll box at the edges; skip those.
  const cards = await page.$$('.card');
  for (let i = 0; i < cards.length; i++) {
    if (await cards[i].evaluate(e => !!e.parentElement.closest('.rail, .board, .demo-scroll, .scroll-pane'))) continue;
    await cards[i].evaluate(e => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(120);
    const r = await cards[i].evaluate(e => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; });
    if (r.t < 0 || r.b > h || r.r - r.l < 4) continue;   // taller than the screen: its edges are checked where they show
    const png = (await page.screenshot()).toString('base64');
    const exp = { L: R0(r.l), R: R0(r.r), T: R0(r.t), B: R0(r.b) };
    const ym = R0((r.t + r.b) / 2), xm = R0(r.l * .6 + r.r * .4);
    // Read a run of pixels across each edge, in the decoder page.
    const runs = await decoder.evaluate(async ([png, exp, ym, xm]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const px = (x, y) => Array.from(g.getImageData(x, y, 1, 1).data);
      const out = {};
      for (const k of ['L', 'R']) out[k] = Array.from({ length: 13 }, (_, d) => px(exp[k] - 6 + d, ym));
      for (const k of ['T', 'B']) out[k] = Array.from({ length: 13 }, (_, d) => px(xm, exp[k] - 6 + d));
      return out;
    }, [png, exp, ym, xm]);
    const res = {};
    for (const k of Object.keys(runs)) {
      const first = runs[k].findIndex(red);
      let width = 0; if (first >= 0) while (first + width < 13 && red(runs[k][first + width])) width++;
      res[k] = first < 0 ? 'none' : (first - 6) + (width === 3 ? '' : ` (${width}dp wide)`);
      checked++;
      if (first - 6 !== 0 || width !== 3) off++;
    }
    if (process.env.VERBOSE || Object.values(res).some(v => v !== '0')) console.log(`  card ${i}`, JSON.stringify(res));
  }
  await browser.close();
  console.log(`${engine} ${size} dial ${dial}: ${checked} card edges checked, ${off} off its grid line`);
  process.exit(off ? 1 : 0);
})();
