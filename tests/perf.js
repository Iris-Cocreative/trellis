// Trellis · runtime performance test
// A dense working page: 2,000 list rows and 2,000 text blocks, in WebKit, where
// settle.js does the rounding. It measures the first settle, one changed row and
// a thousand rows added at once, each as the time until everything is on its line
// and as the longest single frame, which is what a reader feels. And it checks the
// result really is on the lines.
// Usage: node perf.js <url> [webkit|chromium] [rows] [blocks]
// Budgets are in BUDGET below; tests/README.md records the numbers. Exits 1 over
// budget, or if anything ends up off a line. Timings vary by machine, so CI runs
// it with PERF_SCALE to widen the budgets.
const pw = require(process.env.PLAYWRIGHT || 'playwright');
const SCALE = Number(process.env.PERF_SCALE || 1);
const BUDGET = { first: 1500 * SCALE, change: 150 * SCALE, add: 1000 * SCALE, changeFrame: 50 * SCALE };

(async () => {
  const [url, engine = 'webkit', rows = '2000', blocks = '2000'] = process.argv.slice(2);
  if (!url) { console.error('usage: node perf.js <url> [webkit|chromium] [rows] [blocks]'); process.exit(2); }
  const browser = engine === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(new URL('tests/README.md', url).href);
  const base = new URL('.', url).href;
  // Built in the page so the first settle is timed from a known moment, not from
  // page load, and the fonts are the system's, so no font swap muddies the numbers.
  await page.setContent(`<!doctype html><html data-theme="light"><head><link rel="stylesheet" href="${base}core.css"></head>
    <body><main class="frame" id="top"><ul class="list" id="rows"></ul><div class="stack" id="blocks"></div></main></body></html>`, { waitUntil: 'load' });
  await page.addScriptTag({ url: base + 'settle.js' });

  const r = await page.evaluate(async ({ rows, blocks }) => {
    // The longest gap between frames while an operation runs.
    const timed = async fn => {
      let longest = 0, last = performance.now(), on = true;
      const tick = () => { const n = performance.now(); longest = Math.max(longest, n - last); last = n; if (on) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      const t = performance.now();
      await fn();
      await new Promise(r => requestAnimationFrame(r));
      await window.Trellis.settled();
      const total = performance.now() - t;
      on = false;
      return { total, longest };
    };
    const text = n => ('Row ' + n + ' with some words about a seed, which wrap at narrow widths when there are enough of them. ').repeat(1 + n % 3);
    const row = n => `<li class="list-item"><span class="avatar cc-sm">A</span><div class="list-body"><p class="t-sm">Member ${n}</p><p class="t-xs">${text(n)}</p></div><div class="list-end"><span class="t-xs">2m</span></div></li>`;
    const list = document.getElementById('rows'), stack = document.getElementById('blocks');
    let html = ''; for (let i = 0; i < rows; i++) html += row(i);
    let blk = ''; for (let i = 0; i < blocks; i++) blk += `<p class="t-body">${text(i)}</p>`;
    const first = await timed(() => { list.innerHTML = html; stack.innerHTML = blk; });

    const lines = () => {
      const top = document.getElementById('top').getBoundingClientRect().top;
      const u = Trellis.cell();
      let off = 0, all = 0;
      document.querySelectorAll('#rows > .list-item, #blocks > p').forEach(e => { all++; const m = (((e.getBoundingClientRect().top - top) % u) + u) % u; if (m > .5 && m < u - .5) off++; });
      return { off, all };
    };
    const afterFirst = lines();

    // One row changes: the common case in a live app.
    const target = list.children[Math.floor(rows / 2)].querySelector('.t-xs');
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const change = await timed(() => { target.textContent = text(5) + text(6) + text(7); });
    const afterChange = lines();

    // Text shrinks. A block held at whole cells doesn't resize when this happens,
    // so nothing but the text's own change can notice it.
    const tall = target.getBoundingClientRect().height;
    await timed(() => { target.textContent = 'Short.'; });
    const short = target.getBoundingClientRect().height;
    const u = Trellis.cell();
    const shrank = short < tall && short <= u + .5;
    const afterShrink = lines();
    // And nested in a bigger text change: replaced through the parent, as a framework might.
    const para = stack.children[10]; const paraTall = (para.innerHTML = text(1) + text(2) + text(3), await new Promise(r => requestAnimationFrame(r)), await window.Trellis.settled(), para.getBoundingClientRect().height);
    para.firstChild.data = 'Short too.';
    await new Promise(r => requestAnimationFrame(r)); await window.Trellis.settled();
    const shrankData = para.getBoundingClientRect().height < paraTall;

    // A thousand rows arrive at once: a page of results, a sync.
    let more = ''; for (let i = 0; i < 1000; i++) more += row(rows + i);
    const add = await timed(() => { list.insertAdjacentHTML('beforeend', more); });
    const afterAdd = lines();
    return { first, change, add, afterFirst, afterChange, afterAdd, shrank, shrankData, tall, short, afterShrink, settles: !!CSS.supports('height', 'calc-size(fit-content, size)') };
  }, { rows: +rows, blocks: +blocks });
  await browser.close();

  const f = v => Math.round(v.total) + 'ms (longest frame ' + Math.round(v.longest) + 'ms)';
  console.log(`${engine} ${rows} rows + ${blocks} blocks: first settle ${f(r.first)} · one row changed ${f(r.change)} · 1000 rows added ${f(r.add)} · off the lines ${r.afterFirst.off}, ${r.afterChange.off}, ${r.afterAdd.off} of ${r.afterAdd.all}${r.settles ? ' (rounds in CSS)' : ''}`);
  const over = [];
  if (r.first.total > BUDGET.first) over.push(`first settle over ${BUDGET.first}ms`);
  if (r.change.total > BUDGET.change) over.push(`one changed row over ${BUDGET.change}ms`);
  if (r.change.longest > BUDGET.changeFrame) over.push(`one changed row held a frame over ${BUDGET.changeFrame}ms`);
  if (r.add.total > BUDGET.add) over.push(`1000 added rows over ${BUDGET.add}ms`);
  if (r.afterFirst.off || r.afterChange.off || r.afterAdd.off || r.afterShrink.off) over.push('something ended up off a line');
  if (!r.shrank) over.push(`a block did not shrink with its text: ${r.tall}px to ${r.short}px`);
  if (!r.shrankData) over.push('a block did not shrink when its text node changed');
  errors.forEach(e => over.push(e));
  over.forEach(o => console.log('  ' + o));
  process.exit(over.length ? 1 : 0);
})();
