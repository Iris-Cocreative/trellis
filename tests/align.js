// Trellis · alignment test
// Loads the specimen and checks that every edge lands on a cell line:
//   headlines (.t-h1 to .t-h3): the bottom edge, which is the last baseline
//   all other text: the top edge, which is the top of the capitals
//   boxes (cards, plates, stacks, rows, tags, buttons, …): top and left
//   prose: every block in a .prose, read from its bare tag, by the same rules
//   keyboard reach: every region that scrolls sideways can be focused, or holds something that can
// Usage:
//   node align.js <url> [WxH] [product] [theme] [flags…]
//   product: neutral, an example's name, or name=<address> (see target.js)
//   theme: auto, light or dark
//   flags: touch (an emulated 3x phone), u9…u18 (the dial; 12 is 100%), fit-on|fit-off,
//          measure, math, css, outset, webkit (run in WebKit, as an iPhone does),
//          slow (a CPU throttled 6 times; Chromium only),
//          ax (the reader's text size at 312%, the largest iOS accessibility size:
//          53pt body over the default 17pt; the cell stops at 1.5x, type doesn't)
// Needs Playwright: set PLAYWRIGHT to its module path if it isn't resolvable,
// and CHROME to a Chrome binary to use one instead of Playwright's Chromium.
// Exits 1 if anything is off.
const pw = require(process.env.PLAYWRIGHT || 'playwright');
const ready = require('./ready');
const target = require('./target');

(async () => {
  const [url, size = '1440x900', product = 'neutral', theme = 'auto', ...flags] = process.argv.slice(2);
  if (!url) { console.error('usage: node align.js <url> [WxH] [product] [theme] [flags…]'); process.exit(2); }
  const [width, height] = size.split('x').map(Number);
  const touch = flags.includes('touch');
  const unitFlag = flags.find(f => /^u\d+$/.test(f));
  const fit = (flags.find(f => /^fit-/.test(f)) || 'fit-auto').slice(4);
  const browser = flags.includes('webkit') ? await pw.webkit.launch()
    : await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage({ viewport: { width, height: height || 900 }, deviceScaleFactor: touch ? 3 : 1, isMobile: touch, hasTouch: touch });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  // A font CDN having a bad minute is not a layout failure: resources only count from our own origin.
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const from = (m.location() || {}).url || '';
    if (/Failed to load resource/.test(m.text()) && from && new URL(from).origin !== new URL(url).origin) return;
    errors.push(m.text());
  });
  await page.addInitScript(s => localStorage.setItem('trellis', JSON.stringify(s)), {
    grid: true, fit, dial: unitFlag ? Number(unitFlag.slice(1)) : 12,
    measure: flags.includes('measure'), math: flags.includes('math'), css: flags.includes('css'), outset: flags.includes('outset')
  });
  // The reader's text size, as a browser's default font size would set it: on
  // the root, before any stylesheet or script runs.
  if (flags.includes('ax')) await page.addInitScript(() => {
    const set = () => { if (!document.documentElement) return false; document.documentElement.style.fontSize = '312%'; return true; };
    if (!set()) new MutationObserver((m, o) => { if (set()) o.disconnect(); }).observe(document, { childList: true });
  });
  // A slow machine, like a cheap phone: everything must still end up on its line.
  if (flags.includes('slow')) await (await page.context().newCDPSession(page)).send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.goto(target(url, product, theme), { waitUntil: 'networkidle', timeout: 120000 });
  await ready(page);

  const r = await page.evaluate(() => {
    const top = document.getElementById('top'), pr = top.getBoundingClientRect();
    const u = Trellis.cell();
    const TEXT = /\bt-(h\d|xl|lg|body|sm|xs|label)\b/, STANDS = /\bt-h[123]\b/;
    const BOX = /\b(card|plate|tag|button|avatar|section|stack|cluster|cols|grid|float|row|list|board|shell|cover|field|input|tabs|chat-item|member-tile)\b/;
    const SKIP = '.measure-layer,svg,[popover],.nav,.float,.avatar,.code-panel,.shell-nav';
    const off = (v) => { const m = ((v % u) + u) % u; return m > .5 && m < u - .5; };
    const desc = e => e.tagName.toLowerCase() + '.' + [...e.classList].join('.') + ' "' + (e.textContent || '').trim().slice(0, 28) + '"';
    const out = { u, text: 0, box: 0, offText: [], offBox: [] };
    // Prose: bare tags, no classes, so the roles are read from the tag. Inside a
    // table only the rows are checked: a cell's left edge belongs to its column.
    const P_STANDS = 'h1,h2,h3', P_INLINEISH = 'td,th,tbody,thead,summary *,pre *,pre';
    out.prose = 0; out.offProse = [];
    const SOLID = 'hr,p,li,ul,ol,figure,table,blockquote,pre,iframe,img,video,h1,h2,h3,h4,h5,h6,details,dl';
    const proseRight = p => p.getBoundingClientRect().right;
    const checkProse = (when) => {
    const pdesc = e => e.tagName.toLowerCase() + ' "' + (e.textContent || '').trim().slice(0, 34) + '"';
    for (const e of top.querySelectorAll('.prose *')) {
      if (e.closest('svg') || e.matches(P_INLINEISH) && !e.matches('pre')) continue;
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.display === 'contents' || /^inline/.test(cs.display) || cs.display === 'table-column' || cs.display === 'table-column-group') continue;
      if (e.closest('details:not([open])') && e.tagName !== 'SUMMARY' && e.tagName !== 'DETAILS') continue;
      const b = e.getBoundingClientRect();
      // A block that collapsed is a failure, not something to skip: this is how a rule can vanish.
      if ((b.width < 1 || b.height < 1) && e.matches(SOLID)) { out.offProse.push(when + pdesc(e) + ' collapsed ' + b.width + 'x' + b.height); continue; }
      if (b.width < 1 || b.height < 1) continue;
      out.prose++;
      // Nothing but a code sample stepping out (Outset) reaches past the column.
      if (!e.closest('pre') && !e.closest('table') && b.right > proseRight(e.closest('.prose')) + 1) out.offProse.push(when + pdesc(e) + ' past the column by ' + (b.right - proseRight(e.closest('.prose'))).toFixed(1));
      const stands = e.matches(P_STANDS), v = (stands ? b.bottom : b.top) - pr.top, l = b.left - pr.left;
      if (off(v)) out.offProse.push(when + pdesc(e) + (stands ? ' baseline@' : ' top@') + v.toFixed(2) + ' (' + (v / u).toFixed(2) + 'u)');
      else if (!e.matches('tr,caption,figcaption,table') && off(l)) out.offProse.push(when + pdesc(e) + ' left@' + l.toFixed(2));
    }
    };
    checkProse('');
    window.__recheck = () => { out.prose = 0; checkProse('details open: '); return out; };
    for (const e of top.querySelectorAll('*')) {
      if (e.closest('.prose') && !e.matches('.prose')) continue;
      if (e.closest(SKIP) || e.matches('.tag-label,.button-label,.tag-dot,.tag-remove,.cap-center')) continue;
      // Inside a cluster things keep the cluster's own half-cell rhythm; the cluster itself is checked.
      if (e.parentElement && e.parentElement.closest('.cluster')) continue;
      // A dense row is one thing: its edges are on lines, its contents keep a half-cell rhythm.
      if (e.parentElement && e.parentElement.closest('.list.cc-dense .list-item,.cc-dense .list .list-item')) continue;
      // A scroller's contents move as it scrolls; the scroller itself is checked.
      if (e.parentElement && e.parentElement.closest('.demo-scroll,.scroll-pane,.board')) continue;
      // An annotation may align to the capitals it annotates (.cap-align) rather than a cell line.
      if (e.closest('.cap-align')) continue;
      const cs = getComputedStyle(e);
      if (cs.display === 'inline' || cs.display === 'none') continue;
      const b = e.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) continue;
      const t = b.top - pr.top, bot = b.bottom - pr.top, l = b.left - pr.left;
      // A dialog is closed here; open, it aligns to the screen, not the page (rule 16).
      if (e.closest('dialog')) continue;
      if (TEXT.test(e.className)) {
        out.text++;
        const edge = STANDS.test(e.className) ? bot : t;
        if (off(edge)) out.offText.push(desc(e) + (STANDS.test(e.className) ? ' baseline@' : ' top@') + edge.toFixed(1));
      } else if (BOX.test(e.className)) {
        out.box++;
        // A right-aligned end and bleeding media have a free left edge, by design.
        const freeLeft = e.closest('.list-end,.cover-media,.chat-item.cc-own,.chat-item.cc-system,.tabs');
        if (off(t) || (!freeLeft && off(l))) out.offBox.push(desc(e) + ' top@' + t.toFixed(1) + ' left@' + l.toFixed(1));
      }
    }
    // Keyboard reach: a region that scrolls sideways takes focus itself (an
    // explicit tab stop, since Chrome's automatic one isn't in Safari) or holds
    // something that does.
    const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [contenteditable], [tabindex]:not([tabindex="-1"])';
    out.scrollers = 0; out.noReach = [];
    for (const e of document.querySelectorAll('body *')) {
      if (e.scrollWidth <= e.clientWidth + 1 || !e.getClientRects().length) continue;
      if (!/^(auto|scroll)$/.test(getComputedStyle(e).overflowX)) continue;
      if (e.closest('[popover]:not(:popover-open), dialog:not([open]), [hidden]')) continue;
      out.scrollers++;
      if (!(e.hasAttribute('tabindex') && e.tabIndex >= 0) && !e.querySelector(FOCUSABLE)) out.noReach.push(desc(e));
    }
    out.frame = +(pr.width / u).toFixed(3);
    out.gutter = +(parseFloat(getComputedStyle(top).paddingLeft) / u).toFixed(3);
    out.scrollW = document.documentElement.scrollWidth; out.vw = innerWidth;
    // What makes the page scroll sideways: whatever reaches past the screen with
    // no clipping ancestor to hold it.
    out.wide = [];
    if (out.scrollW > out.vw) {
      const W = document.documentElement.clientWidth;
      const held = e => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return true; return false; };
      for (const e of document.querySelectorAll('body *')) {
        const b = e.getBoundingClientRect();
        if (b.width && b.right > W + .5 && !held(e) && !e.matches('canvas, .measure-layer *')) out.wide.push(desc(e) + ' right@' + b.right.toFixed(1));
        if (out.wide.length >= 8) break;
      }
    }
    out.trim = CSS.supports('text-box', 'trim-both cap alphabetic');
    out.calcSize = CSS.supports('height', 'calc-size(fit-content, size)');
    return out;
  });
  // The one change a reader makes inside a post: open every details and measure again.
  const again = await page.evaluate(() => { document.querySelectorAll('.prose details').forEach(d => { d.open = true; }); return 1; })
    .then(() => ready(page))
    .then(() => page.evaluate(() => {
      const top = document.getElementById('top'), pr = top.getBoundingClientRect();
      const u = Trellis.cell();
      const off = (v) => { const m = ((v % u) + u) % u; return m > .5 && m < u - .5; };
      const res = [];
      top.querySelectorAll('.prose > *, .prose details > *, .prose details li').forEach(e => {
        const cs = getComputedStyle(e), b = e.getBoundingClientRect();
        if (cs.display === 'none' || cs.display === 'contents' || b.height < 1) return;
        const v = (e.matches('h1,h2,h3') ? b.bottom : b.top) - pr.top;
        if (off(v)) res.push('details open: ' + e.tagName.toLowerCase() + ' "' + e.textContent.trim().slice(0, 30) + '" @' + v.toFixed(2));
      });
      return res;
    }));
  r.offProse.push(...again);
  await browser.close();
  const bad = r.offText.length + r.offBox.length + r.offProse.length + errors.length + r.noReach.length + (r.scrollW > r.vw ? 1 : 0);
  console.log(`${flags.includes('webkit') ? 'webkit' : 'chromium'} ${size} ${product} ${theme} ${flags.join(' ')} :: u=${r.u} frame=${r.frame} gutter=${r.gutter} ` +
    `text ${r.offText.length}/${r.text} off · boxes ${r.offBox.length}/${r.box} off · prose ${r.offProse.length}/${r.prose} off · scroll ${r.scrollW}/${r.vw} · unreachable ${r.noReach.length}/${r.scrollers} · errors ${errors.length}` +
    (r.calcSize ? '' : ' · (no calc-size: settle.js)'));
  if (process.env.VERBOSE || bad) {
    r.offText.slice(0, 12).forEach(x => console.log('  text  ' + x));
    r.offBox.slice(0, 12).forEach(x => console.log('  box   ' + x));
    r.offProse.slice(0, Number(process.env.SHOW || 12)).forEach(x => console.log('  prose ' + x));
    r.wide.forEach(x => console.log('  wide  ' + x + ' reaches past the screen'));
    r.noReach.slice(0, 12).forEach(x => console.log('  reach ' + x + ' scrolls sideways with no way in for a keyboard'));
    errors.slice(0, 5).forEach(x => console.log('  error ' + x));
  }
  process.exit(bad ? 1 : 0);
})();
