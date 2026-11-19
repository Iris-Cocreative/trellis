// Trellis · runtime performance test
// A dense working page: 2,000 list rows and 2,000 text blocks, in WebKit, where
// settle.js does the rounding. It measures the first settle, one changed row and
// a thousand rows added at once, each as the time until everything is on its line
// and as the longest single frame, which is what a reader feels. And it checks the
// result really is on the lines.
// Usage: node perf.js <url> [webkit|chromium] [rows] [blocks]
// Budgets are in BUDGET below; tests/README.md records the numbers. Exits 1 over
// budget, or if anything ends up off a line. Timings vary by machine, so CI runs
// it with PERF_SCALE to widen the budgets. The budgets judge the median of
// PERF_RUNS runs (3 by default), each on a fresh page in the same browser.
// PERF_BASE=<url> compares against another served Trellis instead: see below.
const pw = require(process.env.PLAYWRIGHT || 'playwright');
const SCALE = Number(process.env.PERF_SCALE || 1);
const BUDGET = { first: 1500 * SCALE, change: 150 * SCALE, add: 1000 * SCALE, changeFrame: 50 * SCALE };
const RUNS = Math.max(1, Number(process.env.PERF_RUNS || 3));

(async () => {
  const [url, engine = 'webkit', rows = '2000', blocks = '2000'] = process.argv.slice(2);
  if (!url) { console.error('usage: node perf.js <url> [webkit|chromium] [rows] [blocks]'); process.exit(2); }
  const browser = engine === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const errors = [];
  // One measurement on a fresh page; the budgets judge the median of RUNS of them.
  const once = async (at = url) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(new URL('tests/README.md', at).href);
  const base = new URL('.', at).href;
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
  await page.close();
  return r;
  };

  // Timings follow what else the machine is doing, so one run is a sample, not a
  // reading: take the median of RUNS (PERF_RUNS, 3 by default). Being on the lines
  // is not a timing, and must hold in every run.
  // PERF_BASE=<url of another served Trellis, such as the last release> runs it
  // alternately with this one, in the same browser at the same moment, so both
  // feel the same load; then the budgets are relative: no median more than
  // PERF_TOLERANCE (0.15 by default) slower than the base's. That is the
  // question a change asks on a busy machine: did this make it slower?
  const BASE = process.env.PERF_BASE;
  const TOL = Number(process.env.PERF_TOLERANCE || .15);
  // A run that has not settled in two minutes has stalled (a loaded machine has
  // done it): fail and say so, rather than sit with no output.
  // Each run prints as it ends (on stderr, so the summary stays one line), so a
  // stall shows where it happened.
  const run = async at => {
    const t = Date.now();
    let timer;
    const r = await Promise.race([once(at), new Promise((_, no) => { timer = setTimeout(() => no(new Error(`a run at ${at || url} did not settle in 120s`)), 120000); })]);
    clearTimeout(timer);
    console.error(`  run ${at || url}: first settle ${Math.round(r.first.total)}ms, ${Math.round((Date.now() - t) / 1000)}s in all`);
    return r;
  };
  const all = [], ref = [];
  try {
    for (let i = 0; i < RUNS; i++) {
      if (BASE && i % 2) ref.push(await run(BASE));
      all.push(await run());
      if (BASE && !(i % 2)) ref.push(await run(BASE));
    }
  } catch (e) {
    // A stalled browser may not close either: give it five seconds, then go.
    console.log(`${engine}: ${e.message}`);
    await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]);
    process.exit(1);
  }
  await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]); // WebKit on Windows can hang on close
  const sum = runs => {
    const median = pick => { const v = runs.map(pick).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
    const mid = k => ({ total: median(x => x[k].total), longest: median(x => x[k].longest) });
    const worst = k => ({ off: Math.max(...runs.map(x => x[k].off)), all: runs[0][k].all });
    return { ...runs[0], first: mid('first'), change: mid('change'), add: mid('add'),
      afterFirst: worst('afterFirst'), afterChange: worst('afterChange'), afterAdd: worst('afterAdd'), afterShrink: worst('afterShrink'),
      shrank: runs.every(x => x.shrank), shrankData: runs.every(x => x.shrankData) };
  };
  const r = sum(all);

  const f = v => Math.round(v.total) + 'ms (longest frame ' + Math.round(v.longest) + 'ms)';
  const firsts = runs => runs.map(x => Math.round(x.first.total)).join(', ');
  console.log(`${engine} ${rows} rows + ${blocks} blocks, median of ${RUNS} (first settles ${firsts(all)}ms): first settle ${f(r.first)} · one row changed ${f(r.change)} · 1000 rows added ${f(r.add)} · off the lines ${r.afterFirst.off}, ${r.afterChange.off}, ${r.afterAdd.off} of ${r.afterAdd.all}${r.settles ? ' (rounds in CSS)' : ''}`);
  const over = [];
  if (BASE) {
    const b = sum(ref);
    const pct = (a, z) => Math.round((a / z - 1) * 100);
    console.log(`  base ${BASE}, alternated (first settles ${firsts(ref)}ms): first settle ${f(b.first)} · one row changed ${f(b.change)} · 1000 rows added ${f(b.add)}`);
    console.log(`  against the base: first settle ${pct(r.first.total, b.first.total)}%, one row changed ${pct(r.change.total, b.change.total)}%, 1000 rows added ${pct(r.add.total, b.add.total)}%`);
    // A row change is tens of milliseconds, where a frame's jitter is a large share,
    // so it is judged with a floor of a frame on top of the tolerance.
    if (r.first.total > b.first.total * (1 + TOL)) over.push(`first settle more than ${TOL * 100}% slower than the base`);
    if (r.change.total > b.change.total * (1 + TOL) + 17) over.push(`one changed row more than ${TOL * 100}% and a frame slower than the base`);
    if (r.add.total > b.add.total * (1 + TOL)) over.push(`1000 added rows more than ${TOL * 100}% slower than the base`);
  } else {
    if (r.first.total > BUDGET.first) over.push(`first settle over ${BUDGET.first}ms`);
    if (r.change.total > BUDGET.change) over.push(`one changed row over ${BUDGET.change}ms`);
    if (r.change.longest > BUDGET.changeFrame) over.push(`one changed row held a frame over ${BUDGET.changeFrame}ms`);
    if (r.add.total > BUDGET.add) over.push(`1000 added rows over ${BUDGET.add}ms`);
  }
  if (r.afterFirst.off || r.afterChange.off || r.afterAdd.off || r.afterShrink.off) over.push('something ended up off a line');
  if (!r.shrank) over.push(`a block did not shrink with its text: ${r.tall}px to ${r.short}px`);
  if (!r.shrankData) over.push('a block did not shrink when its text node changed');
  errors.forEach(e => over.push(e));
  over.forEach(o => console.log('  ' + o));
  process.exit(over.length ? 1 : 0);
})();
