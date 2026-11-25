// Trellis · alignment test
// Loads the specimen and checks that every edge lands on a cell line:
//   headlines (.t-h1 to .t-h3): the bottom edge, which is the last baseline
//   all other text: the top edge, which is the top of the capitals
//   boxes (cards, plates, stacks, rows, tags, buttons, …): top and left
//   prose: every block in a .prose, read from its bare tag, by the same rules
//   keyboard reach: every region that scrolls sideways can be focused, or holds something that can
//   the specimen's band in the opposite scheme (D96): its blocks are measured with the rest, its roles
//   are the other theme's, its ground is painted, and its contrast holds
//   the specimen's eyebrows, and the labels colored like them: 4.5:1 on their grounds in both themes
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
const { FLOORS } = require('../tools/product');

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

  const r = await page.evaluate(width => {
    const top = document.getElementById('top'), pr = top.getBoundingClientRect();
    const u = Trellis.cell();
    const TEXT = /\bt-(h\d|xl|lg|body|sm|xs|label|eyebrow)\b/, STANDS = /\bt-h[123]\b/;
    const BOX = /\b(card|plate|tag|button|avatar|section|stack|cluster|cols|grid|float|row|list|board|shell|cover|field|input|tabs|chat-item|chat-thread|member-tile|pair|composer)\b/;
    // [data-by-ratio]: a type scale set by the ratio alone, off the cells on purpose (the specimen's playground).
    const SKIP = '.measure-layer,svg,[popover],.nav,.float,.avatar,.code-panel,.shell-nav,[data-by-ratio]';
    const off = (v) => { const m = ((v % u) + u) % u; return m > .5 && m < u - .5; };
    const desc = e => e.tagName.toLowerCase() + '.' + [...e.classList].join('.') + ' "' + (e.textContent || '').trim().slice(0, 28) + '"';
    const out = { u, text: 0, box: 0, offText: [], offBox: [], band: 0 };
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
      // What an atom in a sentence holds is the atom's own: a tag's label, a chip's dot and face (D106).
      let inAtom = false;
      for (let a = e.parentElement; a && !a.matches('.prose'); a = a.parentElement) if (/^inline/.test(getComputedStyle(a).display)) { inAtom = true; break; }
      if (inAtom) continue;
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
      if (e.closest(SKIP) || e.matches('.tag-label,.button-label,.tag-dot,.tag-remove,.cap-center:not([data-trellis-wrap])')) continue;
      // Inside a cluster things keep the cluster's own half-cell rhythm; the cluster itself is checked.
      if (e.parentElement && e.parentElement.closest('.cluster')) continue;
      // So do a pair, a message's meta (a name and a time on one baseline) and the parts a message carries (a quote, a file, a link, reactions): the block is checked.
      if (e.parentElement && e.parentElement.closest('.pair,.chat-quote,.chat-link,.chat-file,.chat-reactions,.composer,.cc-slots,.chat-item-meta')) continue;
      // What is in a field's box (D116) is centered in it, and its control runs on under it: the box is checked.
      // A continuing message's hover time sits on its text's baseline; its actions float over the run gap.
      if (e.closest('.chat-item-time,.chat-item-actions')) continue;
      // A dense row is one thing: its edges are on lines, its contents keep a half-cell rhythm.
      if (e.parentElement && e.parentElement.closest('.list.cc-dense .list-item,.cc-dense .list .list-item')) continue;
      // A centered row (--list-align: center) is one thing too: its edges are on lines, its parts center on each other (D104).
      const inRow = e.parentElement && e.parentElement.closest('.list-item');
      if (inRow && getComputedStyle(inRow).alignItems === 'center') continue;
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
      if (e.closest('[data-scheme-opposite]') && (TEXT.test(e.className) || BOX.test(e.className))) out.band++;
      // Cap-centered text that wraps hangs like other text (rule 8): its top and
      // its rounded end are on lines.
      if (e.matches('.cap-center[data-trellis-wrap]')) {
        out.text++;
        if (off(t) || off(bot)) out.offText.push(desc(e) + ' wrapped, top@' + t.toFixed(1) + ' end@' + bot.toFixed(1));
      } else if (TEXT.test(e.className)) {
        out.text++;
        const edge = STANDS.test(e.className) ? bot : t;
        if (off(edge)) out.offText.push(desc(e) + (STANDS.test(e.className) ? ' baseline@' : ' top@') + edge.toFixed(1));
      } else if (BOX.test(e.className)) {
        out.box++;
        // A right-aligned end (a row's end, its swipe actions) and bleeding media have a free left edge, by design.
        const freeLeft = e.closest('.list-end,.list-actions,.cover-media,.chat-item.cc-own,.chat-item.cc-system,.tabs');
        if (off(t) || (!freeLeft && off(l))) out.offBox.push(desc(e) + ' top@' + t.toFixed(1) + ' left@' + l.toFixed(1));
      }
    }
    // Keyboard reach: a region that scrolls sideways takes focus itself (an
    // explicit tab stop, since Chrome's automatic one isn't in Safari) or holds
    // something that does. A textarea takes focus by itself, in every browser,
    // unless it is disabled, inert or taken out of the tab order.
    const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [contenteditable], [tabindex]:not([tabindex="-1"])';
    out.scrollers = 0; out.noReach = [];
    for (const e of document.querySelectorAll('body *')) {
      if (e.scrollWidth <= e.clientWidth + 1 || !e.getClientRects().length) continue;
      if (!/^(auto|scroll)$/.test(getComputedStyle(e).overflowX)) continue;
      if (e.closest('[popover]:not(:popover-open), dialog:not([open]), [hidden]')) continue;
      out.scrollers++;
      const native = e.matches('textarea:not(:disabled)') && e.tabIndex >= 0 && !e.closest('[inert]');
      if (!(e.hasAttribute('tabindex') && e.tabIndex >= 0) && !native && !e.querySelector(FOCUSABLE)) out.noReach.push(desc(e));
    }
    out.frame = +(pr.width / u).toFixed(3);
    out.gutter = +(parseFloat(getComputedStyle(top).paddingLeft) / u).toFixed(3);
    // Against the width asked for: on a phone Chrome's innerWidth grows to whatever overflows.
    out.scrollW = document.documentElement.scrollWidth; out.vw = width;
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
  }, width);
  // A scheme on part of a page (D96): the specimen's band is in the scheme the
  // page isn't. Its roles must be the ones the page has in that theme, so the
  // page is put in it for a moment and read; it must paint its ground, read from
  // the pixels where nothing lies over it; and its text must meet its floors.
  const band = await page.evaluate(FLOORS => {
    const band = document.querySelector('[data-scheme-opposite]'), root = document.documentElement;
    // Only the specimen has one (and its Color section): the Tailwind page doesn't.
    if (!band) return document.getElementById('color') ? { fails: ['the specimen has no band in the opposite scheme'] } : null;
    const fails = [], cs = getComputedStyle(band);
    const dark = e => { const s = getComputedStyle(e).colorScheme; return s === 'dark' || (s !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches); };
    const want = dark(root) ? 'light' : 'dark';
    if (cs.colorScheme !== want) fails.push(`its color scheme is ${cs.colorScheme}, on a ${dark(root) ? 'dark' : 'light'} page`);
    const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
    const px = (...colors) => { ctx.clearRect(0, 0, 1, 1); colors.forEach(c => { ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); }); return [...ctx.getImageData(0, 0, 1, 1).data]; };
    const lum = p => { const f = p.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * f[0] + .7152 * f[1] + .0722 * f[2]; };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const same = (a, b, t) => a.every((v, i) => Math.abs(v - b[i]) <= t);
    const ROLES = ['bg', 'bg-raised', 'bg-raised-2', 'bg-raised-3', 'bg-sunken', 'bg-hover', 'text', 'text-secondary', 'text-tertiary', 'text-faint', 'border', 'border-subtle', 'border-strong',
      'accent', 'accent-ink', 'focus', 'kind-person', 'kind-group', 'kind-event', 'kind-course', 'kind-topic', 'ok', 'warn', 'alert', ...[1, 2, 3, 4, 5, 6, 7].flatMap(n => [`stage-${n}`, `stage-${n}-ink`, `stage-${n}-tint`])];
    const read = host => {
      const probe = document.createElement('i'); probe.style.cssText = 'position: absolute; transition: none';
      host.appendChild(probe);
      const out = Object.fromEntries(ROLES.map(r => { probe.style.color = `var(--${r})`; return [r, px(getComputedStyle(probe).color)]; }));
      probe.remove();
      return out;
    };
    const at = root.getAttribute('data-theme'), mine = read(band), here = read(document.body);
    root.setAttribute('data-theme', want);
    const theirs = read(document.body);
    if (at === null) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', at);
    ROLES.forEach(r => { if (!same(mine[r], theirs[r], 1)) fails.push(`--${r} is ${mine[r]} in it, ${theirs[r]} on a ${want} page`); });
    const moved = ROLES.filter(r => !same(theirs[r], here[r], 1)).length;
    if (moved < ROLES.length / 2) fails.push(`only ${moved} of ${ROLES.length} roles differ between the themes: nothing was proved`);
    FLOORS.forEach(([ink, ground, floor]) => { const r = ratio(mine[ink], mine[ground]); if (r < floor) fails.push(`--${ink} on --${ground} is ${r.toFixed(2)}:1 in it, under ${floor}`); });
    // The text it holds, as drawn: each run's ink on the grounds under it.
    let low = 99, n = 0;
    for (const e of band.querySelectorAll('*')) {
      const words = e.matches('input:not([type="checkbox"])') ? e.value : [...e.childNodes].filter(c => c.nodeType === 3).map(c => c.data.trim()).join('');
      if (!words || !e.getClientRects().length) continue;
      const grounds = [];
      for (let a = e; a; a = a === band ? null : a.parentElement) grounds.unshift(getComputedStyle(a).backgroundColor);
      const g = px(...grounds), r = ratio(px(...grounds, getComputedStyle(e).color), g);
      n++; low = Math.min(low, r);
      if (r < 4.5) fails.push(`"${words.slice(0, 24)}" is ${r.toFixed(2)}:1 on its ground, under 4.5`);
    }
    if (n < 20) fails.push(`only ${n} pieces of text were found in it`);
    if (!same(px(cs.backgroundColor), mine.bg, 1)) fails.push(`its ground is ${px(cs.backgroundColor)}, not --bg (${mine.bg})`);
    band.scrollIntoView({ block: 'start', behavior: 'instant' });
    window.scrollBy({ top: -innerHeight / 2, behavior: 'instant' });
    const b = band.getBoundingClientRect(), pr = document.getElementById('top').getBoundingClientRect(), u = Trellis.cell();
    if (Math.abs(b.left - pr.left) > .5 || Math.abs(b.right - pr.right) > .5) fails.push(`it runs ${b.left.toFixed(1)} to ${b.right.toFixed(1)}, the frame ${pr.left.toFixed(1)} to ${pr.right.toFixed(1)}`);
    const spots = [[b.left + u / 2, b.top + u / 2], [b.right - u / 2, b.top + u / 2], [b.left + u / 2, b.top - u / 2]];
    // A screenshot shows the visual viewport. On a phone page that scrolls sideways Chrome's layout
    // viewport is larger than that, and what is clicked or measured is in the layout viewport's points.
    const v = window.visualViewport, view = { x: v.offsetLeft, y: v.offsetTop };
    return { fails, low, n, view, ground: mine.bg, spots: spots.map(([x, y], i) => ({ x, y, inside: i < 2, clear: document.elementFromPoint(x, y) === (i < 2 ? band : document.getElementById('top')) })) };
  }, FLOORS);
  // Small text in a color (an eyebrow, a master's label) reads on the ground under it, in both
  // themes: the page is put in each for a moment, and the band in the other. A full bleed's
  // eyebrow is white over a picture, which tests/layout.js reads from the pixels.
  const small = await page.evaluate(() => {
    if (!document.getElementById('color')) return null;
    const root = document.documentElement, band = document.querySelector('[data-scheme-opposite]'), fails = [];
    const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
    const px = colors => { ctx.clearRect(0, 0, 1, 1); colors.forEach(c => { ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); }); return [...ctx.getImageData(0, 0, 1, 1).data]; };
    const lum = p => { const f = p.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * f[0] + .7152 * f[1] + .0722 * f[2]; };
    const was = [root, band].map(e => e && e.getAttribute('data-theme'));
    const els = [...document.querySelectorAll('#top .t-eyebrow, #top .master .t-label')].filter(e => e.getClientRects().length && !e.closest('.card:has(> .media.cc-fill)'));
    const heads = document.querySelectorAll('#top .section-head .t-eyebrow').length, masters = document.querySelectorAll('#top .master .t-label').length;
    let low = 99;
    for (const theme of ['light', 'dark']) {
      root.setAttribute('data-theme', theme);
      if (band) band.setAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
      for (const e of els) {
        const grounds = [];
        for (let a = e; a; a = a.parentElement) grounds.unshift(getComputedStyle(a).backgroundColor);
        const g = px(grounds), x = lum(px([...grounds, getComputedStyle(e).color])), y = lum(g), r = (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
        low = Math.min(low, r);
        if (g[3] !== 255) fails.push(`"${e.textContent.trim()}" has no ground to read it on`);
        if (r < 4.5) fails.push(`"${e.textContent.trim()}" is ${r.toFixed(2)}:1 on its ground in the ${theme} theme, under 4.5`);
      }
    }
    [root, band].forEach((e, i) => { if (e) { if (was[i] === null) e.removeAttribute('data-theme'); else e.setAttribute('data-theme', was[i]); } });
    if (heads < 15 || masters < 3) fails.push(`only ${heads} section eyebrows and ${masters} masters' labels were found`);
    return { fails, low, n: els.length };
  });
  // Measure draws over the page, so its pixels say nothing here.
  if (band && band.spots && !flags.includes('measure')) {
    await page.waitForTimeout(100);
    const shot = (await page.screenshot({ scale: 'css' })).toString('base64');
    const seen = await page.evaluate(async ([shot, spots, view]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + shot; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      return spots.map(s => {
        const x = Math.floor(s.x - view.x), y = Math.floor(s.y - view.y);
        return x >= 0 && y >= 0 && x < c.width && y < c.height ? [...g.getImageData(x, y, 1, 1).data] : null;
      });
    }, [shot, band.spots, band.view]);
    const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= 4);
    if (!band.spots.some(s => s.inside && s.clear)) band.fails.push('no clear point on its ground was found');
    band.spots.forEach((s, i) => {
      if (!s.clear) return;
      if (!seen[i]) { band.fails.push(`the point at ${s.x.toFixed(0)},${s.y.toFixed(0)} is not on the screenshot`); return; }
      if (s.inside && !near(seen[i], band.ground)) band.fails.push(`at ${s.x.toFixed(0)},${s.y.toFixed(0)} the pixel is ${seen[i]}, its ground ${band.ground}`);
      if (!s.inside && near(seen[i], band.ground)) band.fails.push(`its ground is painted above it too, at ${s.x.toFixed(0)},${s.y.toFixed(0)}`);
    });
  }
  if (band && r.band < 30) band.fails.push(`only ${r.band} of its blocks were measured`);
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
  await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]); // WebKit on Windows can hang on close
  const bad = r.offText.length + r.offBox.length + r.offProse.length + errors.length + r.noReach.length + (r.scrollW > r.vw ? 1 : 0) + (band ? band.fails.length : 0) + (small ? small.fails.length : 0);
  console.log(`${flags.includes('webkit') ? 'webkit' : 'chromium'} ${size} ${product} ${theme} ${flags.join(' ')} :: u=${r.u} frame=${r.frame} gutter=${r.gutter} ` +
    `text ${r.offText.length}/${r.text} off · boxes ${r.offBox.length}/${r.box} off · prose ${r.offProse.length}/${r.prose} off · scroll ${r.scrollW}/${r.vw} · unreachable ${r.noReach.length}/${r.scrollers} · errors ${errors.length}` +
    (band && band.low ? ` · band ${r.band} blocks, ${band.fails.length} off, text from ${band.low.toFixed(1)}:1` : '') +
    (small ? ` · eyebrows ${small.n}, from ${small.low.toFixed(1)}:1` : '') +
    (r.calcSize ? '' : ' · (no calc-size: settle.js)'));
  if (process.env.VERBOSE || bad) {
    r.offText.slice(0, 12).forEach(x => console.log('  text  ' + x));
    r.offBox.slice(0, 12).forEach(x => console.log('  box   ' + x));
    r.offProse.slice(0, Number(process.env.SHOW || 12)).forEach(x => console.log('  prose ' + x));
    r.wide.forEach(x => console.log('  wide  ' + x + ' reaches past the screen'));
    if (band) band.fails.slice(0, 12).forEach(x => console.log('  band  ' + x));
    if (small) small.fails.slice(0, 12).forEach(x => console.log('  small ' + x));
    r.noReach.slice(0, 12).forEach(x => console.log('  reach ' + x + ' scrolls sideways with no way in for a keyboard'));
    errors.slice(0, 5).forEach(x => console.log('  error ' + x));
  }
  process.exit(bad ? 1 : 0);
})();
