// Trellis · layout behavior test
// What a position check can't see: that each layout responds and behaves.
//   list    a row is whole cells; its rule adds no height; it steps out a cell;
//           a .list-mark centers its mark on the first line's capitals, one
//           line or several; --list-align: center centers a row's parts
//   shell   its nav is a column in a wide box and a tab bar in a narrow one,
//           with the same markup, in the same window
//   cover   its media reaches both screen edges and adds no sideways scroll
//   board   it scrolls inside itself, and its lanes are the set width
//   input   every height is whole cells; on touch, at least 44px and 16px type
//   knobs   a segmented control's ring, an option's height and type and its
//           card's width and cap, a float's ink: the default, and the variable; and the
//           compact density knobs a product sets once
//   wrap    a cap-centered label that wraps is marked, hangs from its row's
//           top line and rounds up to whole cells; one that doesn't, centers
//   modal   the real dialog: modal, page locked, on screen, a tray flush to
//           its side, and everything undone when it closes
//   nav     a top bar four cells tall; narrow, its links a left tray from the
//           menu button; a dropdown under its button; outline rows whole cells
//           and a cell in per level; crumbs show only the parent when narrow;
//           the skip link hidden until it has focus
//   stacked each nested card a step of the ladder, corners concentric; grouped
//           rows whole cells with their rules; trays step back, three at most
//   presets fade at the edges where there is more; glow under a touch; reveal
//           while scrolling; swipe to the actions and back; detents open at
//           half, rest full, close when dragged down; share names and runs
//   floats  a closed popover float has no box and takes no clicks; it opens
//           and closes to nothing again; float.js places one by its anchor, keeps it on
//           screen, flips it, follows it in a scroller and closes it
//   switch  in a menu row: no room for a label, at the row's end, lit by the
//           row, the row not washed
//   forced  in forced colors, current and selected marks, the switch, dots,
//           badges and avatar rings still draw
//   ring    a ring dot keeps the dot's box, its line a quarter of the dot and
//           two lines at most, clear inside unless it is given a fill
//   stages  a stage's dot is its fill, its ring its ink, its tag tinted from it
//   prose   a paragraph with two links, with chips, with faces or with a mark
//           beside its images is text, and an atom in it leaves its lines where
//           they were; images alone, linked or not, are still a gallery
//   clamp   clamped text keeps the box of its lines, in whole cells; in the
//           pixels, its last line's descenders are as deep as its first line's,
//           and nothing of the hidden line shows under them
// Usage: node layout.js <url> [webkit] [WxH] [touch]
// Needs Playwright (PLAYWRIGHT=module path). Exits 1 if anything is off.
const pw = require(process.env.PLAYWRIGHT || 'playwright');
const ready = require('./ready');

(async () => {
  const [url, engine = 'chromium', size = '1440x900', touchFlag] = process.argv.slice(2);
  if (!url) { console.error('usage: node layout.js <url> [webkit] [WxH] [touch]'); process.exit(2); }
  const [width, height] = size.split('x').map(Number), touch = touchFlag === 'touch';
  const browser = engine === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: touch ? 3 : 1, isMobile: touch, hasTouch: touch });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
  await ready(page);
  // eslint-disable-next-line prefer-const
  let fails = await page.evaluate(() => {
    const fails = [], u = Trellis.cell();
    const whole = v => { const m = ((v % u) + u) % u; return m < .5 || m > u - .5; };
    const $ = s => document.querySelector(s), box = e => e.getBoundingClientRect();
    const expect = (ok, what) => { if (!ok) fails.push(what); };

    // List
    const rows = [...document.querySelectorAll('#demo-list > .list-item')];
    rows.forEach((r, i) => expect(whole(box(r).height), `list row ${i} is ${box(r).height.toFixed(2)}px, not whole cells`));
    expect(Math.abs(box(rows[1]).top - box(rows[0]).bottom) < .1, 'a list rule added height between rows');
    const list = $('#demo-list'), body = rows[0].querySelector('.list-body');
    expect(Math.abs(box(rows[0]).left - box(list.parentElement).left + u) < 1, 'a list does not step out one cell');
    expect(Math.abs(box(rows[0].firstElementChild).left - box(list.parentElement).left) < 1, "a row's content is not on the column's edge");
    expect(body && whole(box(body).top - box(rows[0]).top), "a row's body does not start on a line");
    expect(getComputedStyle(rows[0]).alignItems === 'flex-start', `a list row's parts should hang from one line by default: align-items is ${getComputedStyle(rows[0]).alignItems}`);
    // A mark on the first line (D104): centered on its capitals, however many
    // lines the row runs to, at the row's start and in its end. The capital is
    // measured from a cap-centered line of the same role, whose box is trimmed
    // to it and not rounded.
    {
      const mid = e => (box(e).top + box(e).bottom) / 2;
      const probe = document.createElement('div'); probe.className = 'row'; probe.innerHTML = '<span class="t-sm cap-center">X</span>';
      $('#demo-list-mark').parentElement.appendChild(probe);
      const cap = box(probe.firstElementChild).height; probe.remove();
      const marked = [...document.querySelectorAll('#demo-list-mark > .list-item')];
      expect(marked.length >= 2 && cap > 0, 'the specimen has no rows with a .list-mark to check');
      expect(marked.some(r => box(r.querySelector('.list-body > p')).height > u * 1.5), 'no row with a .list-mark runs to a second line');
      marked.forEach((r, i) => {
        const line = box(r.querySelector('.list-body > p')).top + cap / 2;
        expect(whole(box(r).height), `a row with a mark is ${box(r).height.toFixed(2)}px, not whole cells`);
        expect(whole(box(r.querySelector('.list-body')).left - box(r).left), `row ${i}: the words after a .list-mark do not start on a line`);
        expect(Math.abs(box(r.querySelector('.list-end')).right - box(r.querySelector('.list-end .list-mark > *')).right) < .1, `row ${i}: a mark in the row's end is not at its end`);
        r.querySelectorAll('.list-mark').forEach(m => {
          expect(Math.abs(box(m).height - cap) < .6, `a .list-mark is ${box(m).height.toFixed(2)}px tall, a capital of its line ${cap.toFixed(2)}px`);
          expect(Math.abs(mid(m.firstElementChild) - line) < .6, `row ${i}: a ${m.firstElementChild.className} in a .list-mark sits ${(mid(m.firstElementChild) - line).toFixed(2)}px off the middle of its first line's capitals`);
        });
      });
      // --list-align: center: a face, one line of words and a control share a middle.
      const centered = [...document.querySelectorAll('#demo-list-center > .list-item')];
      expect(centered.length > 0, 'the specimen has no centered rows to check');
      centered.forEach((r, i) => {
        const parts = [r.querySelector('.avatar'), r.querySelector('.cap-center'), r.querySelector('.button')], at = mid(parts[0]);
        expect(whole(box(r).height), `a centered row is ${box(r).height.toFixed(2)}px, not whole cells`);
        parts.forEach(p => expect(p && Math.abs(mid(p) - at) < .6, `centered row ${i}: ${p && p.className} sits ${p && (mid(p) - at).toFixed(2)}px off the face's middle`));
        expect(Math.abs(mid(parts[0]) - mid(r)) < .6, `centered row ${i}: its face is not in the row's middle`);
        expect(box(parts[1]).left - box(r.querySelector('.list-body')).left < .6, "a cap-centered line in a row's body does not start at the body's start");
      });
    }

    // Card padding: two knobs that default to equal, and a shorthand for contexts.
    {
      const root = document.documentElement, host = document.createElement('div');
      host.innerHTML = '<div class="card" id="pad-a">a</div><div class="card cc-dense" id="pad-b">b</div><div class="card" id="pad-c" style="--card-pad-block: 0px">c</div>';
      document.body.appendChild(host);
      const pad = id => { const cs = getComputedStyle(document.getElementById(id)); return [cs.paddingLeft, cs.paddingRight, cs.paddingTop, cs.paddingBottom].map(parseFloat); };
      const near = (a, b) => Math.abs(a - b) < .05;
      let p = pad('pad-a');
      expect(p.every(v => near(v, p[0])) && p[0] > 0, `a card's padding is not equal by default: ${p}`);
      const was = p[0];
      root.style.setProperty('--density-card-pad-inline', 'var(--sp-1)');
      p = pad('pad-a');
      expect(near(p[0], u) && near(p[1], u) && near(p[2], was) && near(p[3], was), `the inline knob should set the sides alone: ${p}`);
      root.style.removeProperty('--density-card-pad-inline');
      root.style.setProperty('--density-card-pad-block', 'var(--sp-1)');
      p = pad('pad-a');
      expect(near(p[2], u) && near(p[3], u) && near(p[0], was) && near(p[1], was), `the block knob should set top and bottom alone: ${p}`);
      root.style.setProperty('--density-card-pad', 'var(--sp-4)');
      p = pad('pad-a');
      expect(near(p[0], 4 * u) && near(p[2], u), `the one knob should move whichever side is not split: ${p}`);
      root.style.removeProperty('--density-card-pad-block');
      root.style.removeProperty('--density-card-pad');
      p = pad('pad-b');
      expect(p.every(v => near(v, u)), `a dense card's shorthand should set both: ${p}`);
      p = pad('pad-c');
      expect(near(p[2], 0) && near(p[0], was), `a context should be able to set one side: ${p}`);
      host.remove();
    }

    // Shell: same markup, same window, two widths.
    const nav = id => getComputedStyle($(id + ' .shell-nav')).flexDirection;
    const narrow = $('#demo-shell-narrow');
    expect(nav('#demo-shell-narrow') === 'row', 'the narrow shell did not become a tab bar');
    if (box($('#demo-shell-wide')).width >= 48 * parseFloat(getComputedStyle(document.documentElement).fontSize)) expect(nav('#demo-shell-wide') === 'column', 'the wide shell nav is not a column');
    // A sticky bar rides up to the viewport's bottom when its box is out of view, so go to it first.
    narrow.scrollIntoView({ block: 'end' });
    expect(box(narrow.querySelector('.shell-nav')).top >= box(narrow.querySelector('.shell-aside')).bottom - 1, 'the tab bar is not below the content');
    expect(whole(box(narrow).height), `the narrow shell is ${box(narrow).height.toFixed(2)}px, not whole cells`);
    narrow.querySelectorAll('.shell-link').forEach(l => expect(box(l).height >= 44 || parseFloat(getComputedStyle(l).minHeight) >= 44, 'a tab is under the 44px touch target'));

    // Cover
    const media = box($('#demo-cover .cover-media')), W = document.documentElement.clientWidth;
    expect(media.left <= 1 && media.right >= W - 1, `the cover media doesn't reach the edges: ${media.left.toFixed(1)} to ${media.right.toFixed(1)} of ${W}`);
    expect(document.documentElement.scrollWidth <= innerWidth, `the cover added sideways scroll: ${document.documentElement.scrollWidth} over ${innerWidth}`);
    const cb = box($('#demo-cover .cover-body')), frame = $('#top');
    expect(Math.abs(cb.left - (box(frame).left + parseFloat(getComputedStyle(frame).paddingLeft))) < 1, "the cover's words are not in the field");
    expect(whole(box($('#demo-cover')).height), "the cover's height is not whole cells");

    // Board
    const board = $('#demo-board'), lane = board.querySelector('.board-lane');
    expect(Math.abs(box(lane).width - 24 * u) < 1, `a lane is ${box(lane).width}px, not 24 cells`);
    // To the end: a small scroll snaps straight back to the first lane, as it should.
    if (board.scrollWidth > board.clientWidth) { board.scrollLeft = board.scrollWidth; expect(board.scrollLeft > 0, 'the board does not scroll'); board.scrollLeft = 0; }
    // A cluster at a surface's end (D92): a dense card's last row is 2½-cell
    // buttons in three cells, and the spare half cell is above them, so the
    // space under them is the card's padding.
    document.querySelectorAll('.cc-dense .card > .cluster:last-child').forEach(c => {
      const b = c.querySelector('.button'); if (!b) return;
      const card = c.parentElement, under = box(card).bottom - box(b).bottom - parseFloat(getComputedStyle(card).borderBottomWidth);
      expect(Math.abs(under - parseFloat(getComputedStyle(card).paddingBottom)) < .75, `under a dense card's buttons is ${under.toFixed(2)}px, not its padding of ${getComputedStyle(card).paddingBottom}`);
      expect(whole(box(c).height), `a card's last cluster is ${box(c).height.toFixed(2)}px, not whole cells`);
    });
    // Slider (D91): a row of whole cells, two on a fine pointer and the touch
    // target on a coarse one; settle.js says how far along the thumb is, when
    // it moves, when a script asks, and for a slider added later.
    {
      const r = $('#demo-range'), coarse = matchMedia('(pointer: coarse)').matches, at = e => getComputedStyle(e).getPropertyValue('--range-at').trim();
      expect(whole(box(r).height), `a slider's row is ${box(r).height.toFixed(2)}px, not whole cells`);
      expect(coarse ? box(r).height >= 44 : Math.abs(box(r).height - 2 * u) < .5, `a slider's row is ${box(r).height.toFixed(2)}px: ${coarse ? 'under the 44px touch target' : 'not two cells'}`);
      expect(at(r) === '0.4', `a slider at 40 of 100 has --range-at ${at(r)}, not 0.4`);
      r.value = 80; r.dispatchEvent(new Event('input', { bubbles: true }));
      expect(at(r) === '0.8', `a slider moved to 80 has --range-at ${at(r)}, not 0.8`);
      r.value = 40; window.Trellis.range(r);
      expect(at(r) === '0.4', `Trellis.range() left --range-at at ${at(r)}, not 0.4`);
      const off = $('#demo-range-off');
      expect(getComputedStyle(off).cursor === 'not-allowed', 'a disabled slider does not say so');
      const zone = getComputedStyle($('#demo-range-zone')).getPropertyValue('--range-fill');
      expect(/--range-xa|--range-xb/.test(zone) || /calc|linear-gradient/.test(zone), 'a zone slider has no zone');
    }
    // Field: every control height is whole cells, so what follows stays on a line.
    document.querySelectorAll('.field .input:not(textarea), .demo-inputs .input').forEach(i => {
      if (i.closest('dialog')) return;
      const taken = box(i).height + parseFloat(getComputedStyle(i).marginBlockEnd);
      expect(whole(taken), `an input takes ${taken.toFixed(2)}px, not whole cells`);
    });
    const ta = $('textarea.input');
    expect(whole(box(ta).height), `a textarea is ${box(ta).height.toFixed(2)}px, not whole cells`);
    if (matchMedia('(pointer: coarse)').matches) {
      document.querySelectorAll('.field .input').forEach(i => {
        if (i.closest('dialog')) return;   // closed: it has no size yet
        expect(box(i).height >= 44, `an input is ${box(i).height}px on touch, under the 44px target`);
        expect(parseFloat(getComputedStyle(i).fontSize) >= 16, `an input's type is ${getComputedStyle(i).fontSize} on touch: iOS would zoom the page`);
      });
    }
    // Tabs
    const tabs = $('#demo-tabs');
    expect(whole(box(tabs).height), `tabs are ${box(tabs).height}px, not whole cells`);
    // Measures a context can change (D84): each default is what was fixed, and each variable moves its own measure.
    {
      const host = document.createElement('div');
      host.innerHTML = '<div class="tabs cc-seg" id="d84-seg-a"><button class="tab" type="button">A</button></div>'
        + '<div class="tabs cc-seg" id="d84-seg-b" style="--tab-h: var(--size-control-xs); --seg-pad: var(--sp-q)"><button class="tab" type="button">A</button></div>'
        + '<div class="float options-card" id="d84-opt-a"><button class="options-card-item" type="button">A</button></div>'
        + '<div class="float options-card" id="d84-opt-b" style="--option-h: var(--size-control-sm); --option-fs: var(--fs-control-sm); --options-w: calc(var(--u) * 20); --options-max-h: calc(var(--u) * 30)"><button class="options-card-item" type="button">A</button></div>'
        + '<div class="float tooltip" id="d84-tip-a">a</div><div class="float tooltip" id="d84-tip-b" style="--surface: var(--bg-raised); --float-ink: var(--text)">b</div>'
        + '<i id="d84-q" style="display: block; width: var(--sp-q); color: var(--bg)"></i><i id="d84-t" style="color: var(--text)"></i>';
      document.body.appendChild(host);
      const el = id => document.getElementById('d84-' + id), cs = id => getComputedStyle(el(id)), near = (a, b) => Math.abs(a - b) < .05;
      const item = id => el(id).querySelector('.options-card-item'), q = box(el('q')).width;
      expect(near(box(el('seg-a')).height, u * 3), `a segmented control is ${box(el('seg-a')).height}px by default, not three cells`);
      expect(near(parseFloat(cs('seg-a').paddingTop), u / 2), "a segmented control's ring is not half a cell by default");
      expect(near(parseFloat(cs('seg-b').paddingTop), q), '--seg-pad does not set the ring of a segmented control');
      expect(near(box(el('seg-b')).height, u * 1.5 + q * 2), `a segmented control with 1½-cell tabs and a ¼-cell ring is ${box(el('seg-b')).height}px`);
      expect(near(box(item('opt-a')).height, u * 2.5) && near(box(el('opt-a')).width, u * 16), 'an options card is not 16 cells wide with 2½-cell items by default');
      expect(near(box(item('opt-b')).height, u * 2), '--option-h does not set the height of an item');
      expect(parseFloat(getComputedStyle(item('opt-b')).fontSize) < parseFloat(getComputedStyle(item('opt-a')).fontSize), '--option-fs does not set the type of an item');
      expect(near(box(el('opt-b')).width, u * 20) && near(parseFloat(cs('opt-b').maxHeight), u * 30), "--options-w and --options-max-h do not set an options card's width and cap");
      expect(cs('tip-a').color === cs('q').color, "a tooltip's ink is not the page by default");
      expect(cs('tip-b').color === cs('t').color, '--float-ink does not set the ink of a float');
      host.remove();
    }
    // Compact density as knobs: a product sets them once and every menu and
    // segmented control follows, with no variable set on the primitives.
    {
      const root = document.documentElement, host = document.createElement('div');
      host.innerHTML = '<div class="tabs cc-seg" id="dk-seg"><button class="tab" type="button">A</button></div>'
        + '<div class="float options-card" id="dk-opt"><button class="options-card-item" type="button">A</button></div>';
      document.body.appendChild(host);
      const el = id => document.getElementById('dk-' + id), near = (a, b) => Math.abs(a - b) < .05;
      const len = v => { const i = document.createElement('i'); i.style.cssText = `display: block; width: ${v}`; host.appendChild(i); const w = i.getBoundingClientRect().width; i.remove(); return w; };
      const q = len('var(--sp-q)'), hh = len('var(--sp-h)'), xs = len('var(--size-control-xs)'), sm = len('var(--size-control-sm)'), lg = len('var(--size-control-lg)');
      const item = () => el('opt').querySelector('.options-card-item'), fs = () => parseFloat(getComputedStyle(item()).fontSize);
      const was = fs();
      expect(near(parseFloat(getComputedStyle(el('opt')).paddingTop), q), "an options card's padding is not a quarter cell by default");
      root.style.setProperty('--density-seg-h', 'var(--size-control-xs)');
      expect(near(box(el('seg')).height, lg), `with --density-seg-h alone the ring should follow, keeping three cells: ${box(el('seg')).height}px`);
      Object.entries({ '--density-seg-pad': 'var(--sp-q)', '--density-option-h': 'var(--size-control-sm)', '--density-option-fs': 'var(--fs-control-sm)', '--density-options-pad': 'var(--sp-h)' }).forEach(([k, v]) => root.style.setProperty(k, v));
      expect(near(box(el('seg')).height, xs + 2 * q), `a compact product's segmented control is ${box(el('seg')).height}px, not two cells`);
      expect(near(box(item()).height, sm) && fs() < was, `a compact product's menu row is ${box(item()).height}px in ${fs()}px type, not two cells in smaller type`);
      expect(near(parseFloat(getComputedStyle(el('opt')).paddingTop), hh), "--density-options-pad does not set an options card's padding");
      ['--density-seg-h', '--density-seg-pad', '--density-option-h', '--density-option-fs', '--density-options-pad'].forEach(k => root.style.removeProperty(k));
      host.remove();
    }
    // Skeleton: the placeholder settles to whole cells, so the real words won't move anything.
    document.querySelectorAll('.skeleton:not(.cc-block)').forEach(e => expect(whole(box(e).height), 'a skeleton line is not whole cells'));
    return fails;
  });
  // Modal and tray: real interaction, the native dialog.
  const m = await page.evaluate(async () => {
    const fails = [], u = Trellis.cell(), wait = ms => new Promise(r => setTimeout(r, ms));
    for (const id of ['demo-modal', 'demo-tray']) {
      const d = document.getElementById(id), inner = d.querySelector('.modal-inner');
      d.showModal();
      await Promise.all(inner.getAnimations().map(a => a.finished));   // the real transition, however busy the page is
      await wait(50);
      const r = inner.getBoundingClientRect(), H = innerHeight, W = document.documentElement.clientWidth;
      if (!d.matches(':modal')) fails.push(id + ' is not modal');
      if (getComputedStyle(document.documentElement).overflowY !== 'hidden') fails.push(id + ' did not lock the page');
      if (getComputedStyle(inner).transform !== 'none' || getComputedStyle(inner).opacity !== '1') fails.push(id + ' did not finish entering');
      if (r.top < -1 || r.bottom > H + 1) fails.push(`${id} is off the screen: ${r.top.toFixed(0)} to ${r.bottom.toFixed(0)} of ${H}`);
      const narrow = W < 48 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      if (id === 'demo-tray') {
        // On the left, flush to the screen's edge, two cells from the top and the bottom.
        if (Math.abs(r.left) > 1) fails.push(`${id} should be flush left: ${r.left.toFixed(1)}`);
        if (Math.abs(r.top - 2 * u) > 1 || Math.abs(H - r.bottom - 2 * u) > 1) fails.push(`${id} should be two cells from the top and bottom: ${r.top.toFixed(1)}, ${(H - r.bottom).toFixed(1)}`);
      } else if (narrow && Math.abs(r.bottom - H) > 1) fails.push(`${id} should sit on the bottom as a tray: ${r.bottom.toFixed(0)} of ${H}`);
      else if (!narrow && Math.abs((r.top + r.bottom) / 2 - H / 2) > 1) fails.push(`${id} should be centered`);
      d.close();
      await Promise.all(inner.getAnimations().map(a => a.finished));
      await wait(100);
      if (d.open || getComputedStyle(d).display !== 'none') fails.push(id + ' did not close');
    }
    if (getComputedStyle(document.documentElement).overflowY === 'hidden') fails.push('the page stayed locked after closing');
    return fails;
  });
  fails.push(...m);

  // Navigation: the top bar, its menu as a tray when narrow, a dropdown under
  // its button, the outline, breadcrumbs and the skip link.
  const nav = await page.evaluate(async () => {
    const fails = [], u = Trellis.cell(), wait = ms => new Promise(r => setTimeout(r, ms));
    const whole = v => { const m = ((v % u) + u) % u; return m < .5 || m > u - .5; };
    const box = e => e.getBoundingClientRect(), shown = e => getComputedStyle(e).display !== 'none';
    const wide = document.getElementById('demo-top-wide'), narrow = document.getElementById('demo-top-narrow');
    const bar = wide.querySelector('.shell-nav');
    if (Math.abs(box(bar).height - 4 * u) > .5) fails.push(`the top bar is ${box(bar).height.toFixed(1)}px, not four cells`);
    const wl = wide.querySelector('.shell-links'), nl = narrow.querySelector('.shell-links');
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize), roomy = box(wide).width >= 48 * rem;
    if (roomy && (!shown(wl) || shown(wide.querySelector('.shell-menu')))) fails.push('a wide top bar should show its links and hide the menu button');
    if (shown(wl) && Math.abs(box(wl).top + box(wl).height / 2 - (box(bar).top + box(bar).height / 2)) > 1) fails.push('the links are not centered in the bar');
    if (shown(nl) || !shown(narrow.querySelector('.shell-menu'))) fails.push('a narrow top bar should hide its links behind the menu button');
    // The menu: a left tray, flush, two cells from the top and the bottom, the page locked.
    narrow.querySelector('.shell-menu').click();
    await Promise.all(nl.getAnimations().map(a => a.finished)); await wait(50);
    const r = box(nl), H = innerHeight;
    if (!nl.matches(':popover-open')) fails.push('the menu button did not open the links');
    else {
      if (Math.abs(r.left) > 1) fails.push(`the menu tray should be flush left: ${r.left.toFixed(1)}`);
      if (Math.abs(r.top - 2 * u) > 1 || Math.abs(H - r.bottom - 2 * u) > 1) fails.push(`the menu tray should be two cells from the top and bottom: ${r.top.toFixed(1)}, ${(H - r.bottom).toFixed(1)}`);
      if (getComputedStyle(document.documentElement).overflowY !== 'hidden') fails.push('the open menu did not lock the page');
      nl.hidePopover(); await wait(50);
      if (getComputedStyle(document.documentElement).overflowY === 'hidden') fails.push('the page stayed locked after the menu closed');
    }
    // A dropdown opens under its button, by its anchor, where the browser can.
    if (roomy && CSS.supports('position-area: block-end')) {
      const btn = wide.querySelector('[popovertarget="top-guides-wide"]'), f = document.getElementById('top-guides-wide');
      btn.scrollIntoView({ block: 'center' }); await wait(50);
      btn.click(); await Promise.all(f.getAnimations().map(a => a.finished)); await wait(50);
      const fb = box(f), bb = box(btn), gap = parseFloat(getComputedStyle(f).marginTop);
      if (!f.matches(':popover-open')) fails.push('the dropdown did not open');
      else if (Math.abs(fb.top - bb.bottom - gap) > 1 || Math.abs(fb.left - bb.left) > 1) fails.push(`the dropdown is not under its button: ${fb.left.toFixed(0)},${fb.top.toFixed(0)} vs ${bb.left.toFixed(0)},${bb.bottom.toFixed(0)}`);
      f.hidePopover();
    }
    // The outline: rows whole cells, each level a cell further in.
    const rows = [...wide.querySelectorAll('.outline-link')].filter(shown);
    rows.forEach(e => { if (!whole(box(e).height)) fails.push(`an outline row is ${box(e).height.toFixed(1)}px, not whole cells`); });
    const top = wide.querySelector('.outline > ul > li > .outline-link'), sub = wide.querySelector('.outline ul ul .outline-link');
    if (Math.abs(box(sub).left - box(top).left - u) > .5) fails.push('an outline level is not one cell further in');
    // Breadcrumbs: all of them when there is room, only the parent in a narrow box.
    const seen = c => [...c.querySelectorAll('.crumbs > li')].filter(shown).length;
    if (box(wide).width >= 30 * rem && seen(wide) !== 3) fails.push(`wide breadcrumbs should show 3 crumbs, not ${seen(wide)}`);
    if (seen(narrow) !== 1) fails.push(`narrow breadcrumbs should show only the parent, not ${seen(narrow)}`);
    [wide, narrow].forEach(c => { const h = box(c.querySelector('.crumbs')).height; if (!whole(h)) fails.push(`breadcrumbs are ${h.toFixed(1)}px, not whole cells`); });
    // The skip link: off the screen until it takes focus.
    const skip = document.querySelector('.skip-link');
    if (box(skip).bottom > 0) fails.push('the skip link shows before it has focus');
    skip.focus(); await wait(50);
    if (box(skip).top < 0 || box(skip).bottom > innerHeight) fails.push('the focused skip link is not on the screen');
    skip.blur();
    return fails;
  });
  fails.push(...nav);

  // Surfaces on surfaces: each level a step of the ladder, corners concentric,
  // grouped rows whole cells with their rules, trays that step back, three at most.
  const stacked = await page.evaluate(async () => {
    const fails = [], u = Trellis.cell(), wait = ms => new Promise(r => setTimeout(r, ms));
    const whole = v => { const m = ((v % u) + u) % u; return m < .5 || m > u - .5; };
    const cs = id => getComputedStyle(document.getElementById(id));
    const probe = document.createElement('div'); document.body.appendChild(probe);
    const color = role => { probe.style.color = `var(--${role})`; return getComputedStyle(probe).color; };
    [['demo-nest-1', 'bg-raised', '1'], ['demo-nest-2', 'bg-raised-2', '2'], ['demo-nest-3', 'bg-raised-3', '3']].forEach(([id, role, level]) => {
      if (cs(id).backgroundColor !== color(role)) fails.push(`${id} should be --${role}: ${cs(id).backgroundColor} vs ${color(role)}`);
      if (cs(id).getPropertyValue('--surface-level').trim() !== level) fails.push(`${id} should be level ${level}`);
    });
    probe.remove();
    // Concentric with the real gap between the two edges (D88): a nested card
    // steps out into its parent's padding, so the gap is what is left of it.
    const r = id => parseFloat(cs(id).borderTopLeftRadius), box = id => document.getElementById(id).getBoundingClientRect();
    const q = Math.max(1, Math.round(u / 4));
    [['demo-nest-1', 'demo-nest-2'], ['demo-nest-2', 'demo-nest-3']].forEach(([a, b]) => {
      const gap = Math.min(box(b).left - box(a).left, parseFloat(cs(a).paddingTop));
      if (gap < u - .5) fails.push(`${b}'s edge is ${gap}px from ${a}'s: under a cell`);
      const want = Math.max(q, r(a) - gap);
      if (Math.abs(r(b) - want) > .5) fails.push(`${b}'s corner is ${r(b)}, not ${a}'s less the gap between them (${want})`);
      if (!whole(box(b).left - box(a).left)) fails.push(`${b} is not whole cells inside ${a}`);
    });
    // A nested surface has no edge of its own, and a cell of padding.
    ['demo-nest-2', 'demo-nest-3'].forEach(id => {
      if (Math.abs(parseFloat(cs(id).paddingLeft) - u) > .5) fails.push(`${id}'s padding is ${cs(id).paddingLeft}, not a cell`);
      const edge = getComputedStyle(document.getElementById(id), '::after').borderTopColor;
      if (!/rgba?\(0, 0, 0, 0\)|transparent/.test(edge)) fails.push(`${id} draws an edge: ${edge}`);
    });
    const rows = [...document.querySelectorAll('#demo-group > .list-item')];
    rows.forEach((e, i) => { if (!whole(e.getBoundingClientRect().height)) fails.push(`grouped row ${i} is not whole cells`); });
    if (getComputedStyle(rows[0].querySelector('.list-body')).borderImageSource === 'none') fails.push('a grouped row has no rule');
    if (getComputedStyle(rows[rows.length - 1].querySelector('.list-body')).borderImageSource !== 'none') fails.push('the last grouped row has a rule');
    // Trays over trays.
    const d = n => document.getElementById('demo-stack-' + n);
    const settle = async () => { await wait(50); await Promise.all([1, 2, 3, 4].flatMap(n => d(n).querySelector('.modal-inner').getAnimations()).map(a => a.finished.catch(() => {}))); await wait(50); };
    d(1).showModal(); await settle(); d(2).showModal(); await settle(); d(3).showModal(); await settle();
    const depth = n => d(n).getAttribute('data-trellis-depth');
    if (depth(1) !== '2' || depth(2) !== '1' || depth(3) !== null) fails.push(`tray depths should be 2, 1 and none: ${depth(1)}, ${depth(2)}, ${depth(3)}`);
    // Each tray behind steps up two cells per level (heights differ with the fonts, so read the step).
    const step = n => parseFloat((getComputedStyle(d(n).querySelector('.modal-inner')).translate.split(' ')[1]) || 0);
    if (Math.abs(step(2) + 2 * u) > 1 || Math.abs(step(1) + 4 * u) > 1 || Math.abs(step(3)) > 1) fails.push(`trays behind should step up two cells per level: ${step(1).toFixed(1)}, ${step(2).toFixed(1)}, ${step(3).toFixed(1)}`);
    if (!d(1).querySelector('.modal-grabber').offsetHeight) fails.push('a bottom tray has no grabber');
    d(4).showModal(); await settle();
    if (d(3).open) fails.push('a fourth tray did not replace the third');
    if (!d(1).open || !d(2).open) fails.push('a fourth tray closed more than the third');
    [4, 2, 1].forEach(n => d(n).close()); await settle();
    if ([1, 2, 3, 4].some(n => d(n).hasAttribute('data-trellis-depth'))) fails.push('a closed tray kept its depth');
    return fails;
  });
  fails.push(...stacked);

  // Interaction presets, driven by synthetic pointer events so they run headless.
  const presets = await page.evaluate(async () => {
    const fails = [], wait = ms => new Promise(r => setTimeout(r, ms)), frames = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const at = (el, type, x, y, id = 9) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: id, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y }));
    const val = (el, k) => getComputedStyle(el).getPropertyValue(k).trim();
    if (!window.Trellis || !Array.isArray(Trellis.presets) || Trellis.presets.length !== 7) fails.push('presets.js did not list seven presets');
    // Fade: none at the start, the far edge fading; at the end, the reverse.
    if (CSS.supports('animation-timeline: scroll()')) {
      const r = document.getElementById('demo-fade');
      if (r.scrollWidth > r.clientWidth + 1) {
        r.scrollLeft = 0; await frames();
        if (parseFloat(val(r, '--fade-start')) !== 0 || !(parseFloat(val(r, '--fade-end')) > 0)) fails.push(`fade at the start should be 0 and more: ${val(r, '--fade-start')}, ${val(r, '--fade-end')}`);
        r.scrollLeft = r.scrollWidth; await frames();
        if (!(parseFloat(val(r, '--fade-start')) > 0) || parseFloat(val(r, '--fade-end')) !== 0) fails.push(`fade at the end should be more and 0: ${val(r, '--fade-start')}, ${val(r, '--fade-end')}`);
        r.scrollLeft = 0;
      }
    }
    // Press: the knob is there for a pressed control to read.
    if (val(document.querySelector('[data-trellis-press]'), '--press-scale') !== '.97' && val(document.querySelector('[data-trellis-press]'), '--press-scale') !== '0.97') fails.push('a press preset has no --press-scale');
    // Glow: lit under a touch, dark again when it lifts.
    const g = document.getElementById('demo-glow'), gb = g.getBoundingClientRect();
    at(g, 'pointerdown', gb.left + 30, gb.top + 20);
    if (!g.hasAttribute('data-trellis-glowing') || val(g, '--glow-x') !== '30px') fails.push(`the glow did not light under the touch: ${val(g, '--glow-x')}`);
    if (getComputedStyle(g).backgroundImage === 'none') fails.push('the glow has no background to draw on');
    at(g, 'pointerup', gb.left + 30, gb.top + 20);
    if (g.hasAttribute('data-trellis-glowing')) fails.push('the glow stayed lit after the touch lifted');
    // Reveal: marked while it scrolls.
    g.scrollTop = 24; await wait(120);
    if (!g.hasAttribute('data-trellis-scrolling')) fails.push('a reveal field was not marked while scrolling');
    g.scrollTop = 0;
    // Swipe: dragged toward its start it opens by its actions' width; Escape closes it.
    const row = document.querySelector('#demo-swipe .list-item'), rb = row.getBoundingClientRect(), w = row.querySelector('.list-actions').getBoundingClientRect().width;
    at(row, 'pointerdown', rb.right - 20, rb.top + 10);
    for (let i = 1; i <= 8; i++) at(row, 'pointermove', rb.right - 20 - i * 30, rb.top + 10);
    at(row, 'pointerup', rb.right - 260, rb.top + 10);
    if (Math.abs(parseFloat(row.style.getPropertyValue('--swipe-x')) + w) > 1) fails.push(`a swiped row should open by its actions (${w.toFixed(0)}): ${row.style.getPropertyValue('--swipe-x')}`);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    if (parseFloat(row.style.getPropertyValue('--swipe-x')) !== 0) fails.push('Escape did not close a swiped row');
    row.querySelector('.list-actions button').focus();
    if (Math.abs(parseFloat(row.style.getPropertyValue('--swipe-x')) + w) > 1) fails.push('focus in a row\'s actions did not open it');
    row.querySelector('.list-actions button').blur(); document.body.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    // Detents: opens at half, dragged up rests full, dragged well down closes.
    const d = document.getElementById('demo-detents'), inner = d.querySelector('.modal-inner');
    d.showModal(); await wait(50);
    const full = inner.getBoundingClientRect().height, off = () => parseFloat(d.style.getPropertyValue('--tray-offset'));
    if (Math.abs(off() - (full - innerHeight / 2)) > 1) fails.push(`a tray with detents should open at half: offset ${off()}, want ${(full - innerHeight / 2).toFixed(0)}`);
    const grab = d.querySelector('.modal-grabber'), gy = grab.getBoundingClientRect().top + 2, gx = grab.getBoundingClientRect().left + 10;
    at(grab, 'pointerdown', gx, gy, 11); at(grab, 'pointermove', gx, gy - 600, 11); at(grab, 'pointerup', gx, gy - 600, 11);
    if (off() !== 0) fails.push(`dragged up, the tray should rest full: offset ${off()}`);
    at(grab, 'pointerdown', gx, gy, 12); at(grab, 'pointermove', gx, gy + innerHeight, 12); at(grab, 'pointerup', gx, gy + innerHeight, 12);
    await wait(50);
    if (d.open) { fails.push('dragged well down, the tray did not close'); d.close(); }
    // Share: named for the transition; the transition runs or falls back.
    const card = document.querySelector('[data-trellis-share]');
    if (card.style.viewTransitionName !== card.getAttribute('data-trellis-share')) fails.push('a shared element was not named for the transition');
    let ran = false; await Trellis.transition(() => { ran = true; });
    if (!ran) fails.push('Trellis.transition did not run its update');
    return fails;
  });
  fails.push(...presets);

  // Forced colors (C5): what carried meaning with a shadow or a fill alone is
  // drawn again in system colors. Run where the browser can emulate it.
  await page.emulateMedia({ forcedColors: 'active' });
  const forced = await page.evaluate(() => {
    const fails = [];
    if (!matchMedia('(forced-colors: active)').matches) return fails;
    const cs = (s, p) => { const e = document.querySelector(s); return e && getComputedStyle(e, p || null); };
    const canvas = getComputedStyle(document.body).backgroundColor;
    const lined = (s, p) => { const c = cs(s, p); return c && c.outlineStyle === 'solid' && parseFloat(c.outlineWidth) > 0; };
    [['.shell-link[aria-current]'], ['.outline-link[aria-current]'], ['.tabs.cc-seg .tab[aria-selected="true"]'], ['.switch', '::after'], ['.badge'], ['.avatar']].forEach(([s, p]) => { if (!lined(s, p)) fails.push(`forced colors: ${s}${p || ''} draws no outline`); });
    const mark = cs('.tabs:not(.cc-seg) .tab[aria-selected="true"]', '::after');
    if (!mark || mark.backgroundColor === canvas) fails.push('forced colors: a selected tab lost its line');
    if (cs('.dot:not(.cc-ring)').backgroundColor === canvas) fails.push('forced colors: a dot vanished');
    const ring = cs('.dot.cc-ring');
    if (!ring) fails.push('forced colors: the specimen has no ring dot to check');
    else {
      // The system's own colors, read from a probe: an engine that only emulates the query keeps the page's ground.
      const probe = document.createElement('i'); probe.style.cssText = 'background: Canvas; color: CanvasText'; document.body.appendChild(probe);
      const sys = getComputedStyle(probe), sysCanvas = sys.backgroundColor, sysText = sys.color; probe.remove();
      if (ring.backgroundColor !== sysCanvas || ring.borderTopColor !== sysText || !(parseFloat(ring.borderTopWidth) > 0)) fails.push(`forced colors: a ring dot is not a line of the system's text color around its canvas: ${ring.borderTopWidth} ${ring.borderTopColor} around ${ring.backgroundColor}`);
    }
    const on = cs('.switch[aria-checked="true"]', '::after'), off = cs('.switch:not([aria-checked="true"])', '::after');
    if (on && off && on.backgroundColor === off.backgroundColor) fails.push('forced colors: a switch looks the same on and off');
    return fails;
  });
  await page.emulateMedia({ forcedColors: 'none' });
  fails.push(...forced);
  // Rule 8: a cap-centered label that wraps hangs instead. Built in a stack, so
  // its row starts on a line, and narrow, so its label must wrap.
  fails.push(...await page.evaluate(async () => {
    const fails = [], u = Trellis.cell(), host = document.createElement('div');
    const off = v => { const m = ((v % u) + u) % u; return m > .5 && m < u - .5; };
    host.className = 'stack';
    host.style.cssText = 'position:absolute;top:0;left:0;width:' + (u * 14) + 'px';
    host.innerHTML = '<div class="row" style="align-items:center;flex-wrap:nowrap"><span class="t-label cap-center" style="flex:0 0 ' + (u * 6) + 'px">A label long enough to wrap</span><button class="button" type="button"><span class="button-label">Go</span></button></div>' +
      '<div class="row" style="align-items:center;flex-wrap:nowrap"><span class="t-label cap-center">Short</span><button class="button" type="button"><span class="button-label">Go</span></button></div><p class="t-body">After</p>';
    document.body.appendChild(host);
    await Trellis.settled(); await Trellis.settled();
    const [long, short] = host.querySelectorAll('.cap-center'), after = host.querySelector('p');
    const top = host.getBoundingClientRect().top, r = long.getBoundingClientRect(), row = long.parentElement.getBoundingClientRect();
    if (!long.hasAttribute('data-trellis-wrap')) fails.push('a cap-centered label that wraps is not marked');
    else {
      if (Math.abs(r.top - row.top) > .5) fails.push('a wrapped cap-centered label does not hang from its row\'s top');
      if (off(r.top - top) || off(r.bottom - top)) fails.push(`a wrapped cap-centered label is off the cells: ${((r.top - top) / u).toFixed(2)}u to ${((r.bottom - top) / u).toFixed(2)}u`);
      if (off(after.getBoundingClientRect().top - top)) fails.push('what follows a wrapped cap-centered label is off its line');
    }
    if (short.hasAttribute('data-trellis-wrap')) fails.push('a one-line cap-centered label is marked as wrapped');
    const s = short.getBoundingClientRect(), b = short.nextElementSibling.getBoundingClientRect();
    if (Math.abs((s.top + s.bottom) / 2 - (b.top + b.bottom) / 2) > .75) fails.push('a one-line cap-centered label does not center on its control');
    host.remove();
    return fails;
  }));
  // A button's face (D100): a scope sets its family, weight, case and letter
  // spacing, and the spaced label stays centered (the spacing after its last
  // letter is given back before its first, as an indent). Padding stays even, and
  // a bare 0 is a spacing too.
  fails.push(...await page.evaluate(async () => {
    const fails = [], host = document.createElement('div');
    host.style.cssText = 'position:absolute;top:0;left:0;--font-button:Georgia,serif;--fw-button:700;--button-case:uppercase;--button-tracking:.18em';
    host.innerHTML = '<button class="button" type="button"><span class="button-label">Sign up</span></button><button class="button" type="button" style="--button-tracking:0"><span class="button-label">Plain</span></button>';
    document.body.appendChild(host);
    await Trellis.settled();
    const [b, plain] = host.querySelectorAll('.button'), cs = getComputedStyle(b), fs = parseFloat(cs.fontSize);
    if (cs.textTransform !== 'uppercase') fails.push('--button-case does not reach the button: ' + cs.textTransform);
    if (!/Georgia/.test(cs.fontFamily)) fails.push('--font-button does not reach the button: ' + cs.fontFamily);
    if (cs.fontWeight !== '700') fails.push('--fw-button does not reach the button: ' + cs.fontWeight);
    if (Math.abs(parseFloat(cs.letterSpacing) - fs * .18) > .1) fails.push('--button-tracking does not reach the button: ' + cs.letterSpacing);
    // The label's box holds the indent before its first letter and the spacing after its last.
    const r = b.getBoundingClientRect(), l = b.querySelector('.button-label').getBoundingClientRect();
    const glyphs = l.left + l.width / 2, box = r.left + r.width / 2;
    if (Math.abs(glyphs - box) > .75) fails.push(`a spaced button label is off center by ${(glyphs - box).toFixed(2)}px`);
    for (const x of [b, plain]) { const c = getComputedStyle(x); if (c.paddingInlineStart !== c.paddingInlineEnd || parseFloat(c.paddingInlineStart) < 1) fails.push(`a button's padding is ${c.paddingInlineStart} and ${c.paddingInlineEnd}`); }
    if (parseFloat(getComputedStyle(plain).textIndent) !== 0) fails.push('a button with no letter spacing is indented');
    host.remove();
    return fails;
  }));
  // A heading in a row carries no space after it: between two buttons it
  // centers on them.
  fails.push(...await page.evaluate(async () => {
    const fails = [], host = document.createElement('div');
    host.innerHTML = '<div class="cluster"><button class="button icon-button" type="button" aria-label="a">←</button><h2 class="t-h4">November 2026</h2><button class="button icon-button" type="button" aria-label="b">→</button></div>';
    document.body.appendChild(host);
    await Trellis.settled();
    const h = host.querySelector('h2'), b = host.querySelector('button'), mid = e => { const r = e.getBoundingClientRect(); return (r.top + r.bottom) / 2; };
    if (parseFloat(getComputedStyle(h).marginBlockEnd) !== 0) fails.push('a heading in a row keeps its space after');
    if (Math.abs(mid(h) - mid(b)) > 1) fails.push(`a heading in a row is ${(mid(b) - mid(h)).toFixed(1)}px off its buttons' center`);
    host.remove();
    return fails;
  }));
  // An eyebrow's own case (D102): it follows the label's unless set.
  fails.push(...await page.evaluate(async () => {
    const fails = [], host = document.createElement('div');
    host.innerHTML = '<div style="--label-case:none;--eyebrow-case:uppercase;--eyebrow-tracking:.14em"><p class="t-label">a</p><p class="t-eyebrow">b</p></div><div style="--label-case:lowercase"><p class="t-eyebrow">c</p></div>';
    document.body.appendChild(host);
    const [l, e, f] = host.querySelectorAll('p'), cs = x => getComputedStyle(x);
    if (cs(l).textTransform !== 'none' || cs(e).textTransform !== 'uppercase') fails.push(`--eyebrow-case: label ${cs(l).textTransform}, eyebrow ${cs(e).textTransform}`);
    if (Math.abs(parseFloat(cs(e).letterSpacing) - parseFloat(cs(e).fontSize) * .14) > .1) fails.push('--eyebrow-tracking does not reach the eyebrow');
    if (cs(f).textTransform !== 'lowercase') fails.push('an eyebrow with no case of its own does not follow the label\'s');
    host.remove();
    return fails;
  }));
  // A link may be the current one (D101): a tab or a tag that is a link, with
  // aria-current, draws as selected; aria-current="false" does not.
  fails.push(...await page.evaluate(async () => {
    const fails = [], host = document.createElement('div');
    host.innerHTML = '<nav class="tabs cc-seg"><a class="tab" href="#a" aria-current="page">Month</a><a class="tab" href="#b" aria-current="false">List</a></nav>' +
      '<a class="tag" href="#c" aria-current="page">Mine</a><a class="tag" href="#d">Open</a>';
    document.body.appendChild(host);
    await Trellis.settled();
    const [on, off] = host.querySelectorAll('.tab'), [t1, t2] = host.querySelectorAll('.tag');
    if (getComputedStyle(on).backgroundColor === getComputedStyle(off).backgroundColor) fails.push('a current tab link draws like the others');
    if (getComputedStyle(t1).backgroundColor === getComputedStyle(t2).backgroundColor) fails.push('a current tag link is not solid');
    host.remove();
    return fails;
  }));
  // Stages (D107): seven of them, each a dot in its fill, a ring in its ink and
  // a tag tinted from its fill; a product's own seed reaches all three.
  fails.push(...await page.evaluate(() => {
    const fails = [], host = document.createElement('div'), paint = document.createElement('i');
    host.setAttribute('data-product', 'stage-test');
    host.innerHTML = [1, 2, 3, 4, 5, 6, 7].map(n => `<span class="dot cc-stage-${n}"></span><span class="dot cc-ring cc-stage-${n}"></span><span class="tag cc-stage-${n}"><span class="tag-label">n</span></span><span class="tag cc-solid cc-stage-${n}"><span class="tag-label">n</span></span>`).join('');
    host.appendChild(paint); document.body.appendChild(host);
    const cs = e => getComputedStyle(e), role = v => { paint.style.color = `var(--${v})`; return cs(paint).color; };
    // One color can be written two ways (oklch from a role, oklab from a mix): compare what each paints.
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const px = c => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
    const same = (a, b) => px(a).every((v, i) => Math.abs(v - px(b)[i]) <= 1);
    const read = () => [1, 2, 3, 4, 5, 6, 7].map(n => { const [dot, ring, tag, solid] = [...host.children].slice((n - 1) * 4, n * 4); return { n, dot: cs(dot).backgroundColor, ring: cs(ring).borderTopColor, tag: cs(tag).backgroundColor, solid: cs(solid).backgroundColor, fill: role(`stage-${n}`), ink: role(`stage-${n}-ink`) }; });
    let seen = read();
    seen.forEach(s => {
      if (!same(s.dot, s.fill)) fails.push(`stages: .dot.cc-stage-${s.n} is ${s.dot}, not the stage's fill ${s.fill}`);
      if (!same(s.ring, s.ink)) fails.push(`stages: a ring's line at stage ${s.n} is ${s.ring}, not the stage's ink ${s.ink}`);
      if (!same(s.solid, s.fill)) fails.push(`stages: a solid tag at stage ${s.n} is ${s.solid}, not the stage's fill ${s.fill}`);
      if (same(s.tag, s.fill) || px(s.tag)[3] === 0 || px(s.tag)[3] === 255) fails.push(`stages: a tag at stage ${s.n} is ${s.tag}: it should be a tint of its fill`);
    });
    if (new Set(seen.map(s => px(s.fill).join())).size !== 7) fails.push('stages: two stages have the same fill by default');
    // A pale seed of the product's own: the dot takes it as it is, and the ring's line is darker (or, at night, no darker) so it reads.
    const was = seen[1];
    host.style.setProperty('--seed-stage-2', 'oklch(.887 .182 95.3)');
    const now = read()[1], sum = c => px(c).slice(0, 3).reduce((a, b) => a + b, 0), day = sum(role('bg')) > 382;
    if (same(now.dot, was.dot)) fails.push('stages: --seed-stage-2 on a scope did not reach its dot');
    if (!same(now.dot, now.fill)) fails.push("stages: a pale stage's dot is not its fill");
    if (day && !(sum(now.ring) < sum(now.dot) - 60)) fails.push(`stages: by day a pale stage's ring (${now.ring}) should be its ink, well darker than its fill (${now.dot})`);
    if (!day && !same(now.ring, now.ink)) fails.push("stages: at night a pale stage's ring is not its ink");
    host.remove();
    return fails;
  }));
  // Prose (D106): a gallery is images and nothing else. A paragraph with two
  // links in it was read as one, and its sentence laid out as a grid.
  fails.push(...await page.evaluate(async () => {
    const fails = [], u = Trellis.cell();
    const IMG = "<img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'/%3E\" alt=''>";
    const cases = [
      ['a paragraph with two links', '<p>See <a href="#a">the log</a> and <a href="#b">the swap</a> for more.</p>', 'block'],
      ['a paragraph with two links that have a class', '<p>Ask <a class="x-chip" href="#a">Marisol</a> or <a class="x-chip" href="#b">Ada</a> first.</p>', 'block'],
      ['a paragraph with two faces', '<p>With <img class="avatar" alt=""> and <img class="avatar" alt=""> on the rota.</p>', 'block'],
      ['a paragraph with a mark and two images', '<p><em>Before</em> ' + IMG + ' and after ' + IMG + '</p>', 'block'],
      ['a paragraph of two images', '<p>' + IMG + ' ' + IMG + '</p>', 'grid'],
      ['a paragraph of two images with classes', '<p>' + IMG.replace('<img', '<img class="x-wide"') + ' ' + IMG.replace('<img', '<img class="x-wide"') + '</p>', 'grid'],
      ['a paragraph of two linked images', '<p><a href="#a">' + IMG + '</a> <a href="#b">' + IMG + '</a></p>', 'grid'],
      ['a paragraph of an image and a linked image', '<p>' + IMG + ' <a href="#b">' + IMG + '</a></p>', 'grid'],
      ['a figure of two images', '<figure>' + IMG + IMG + '<figcaption>Two</figcaption></figure>', 'grid'],
      ['a figure of two linked images', '<figure><a href="#a">' + IMG + '</a><a href="#b">' + IMG + '</a></figure>', 'grid'],
      ['a figure of one image, two links in its caption', '<figure>' + IMG + '<figcaption>One, with <a href="#a">a link</a> and <a href="#b">another</a></figcaption></figure>', 'block'],
    ];
    const host = document.createElement('article'); host.className = 'prose'; host.innerHTML = cases.map(c => c[1]).join('');
    document.querySelector('#prose-atoms').after(host);
    await Trellis.settled();
    cases.forEach((c, i) => { const d = getComputedStyle(host.children[i]).display; if (d !== c[2]) fails.push(`prose: ${c[0]} is display: ${d}, not ${c[2]}`); });
    host.remove();
    // The specimen's sentence of atoms: each atom inline, every line of words a line height from the last, the block whole cells.
    const p = document.querySelector('#prose-atoms p');
    if (!p) return fails.concat('prose: the specimen has no sentence of atoms to check');
    const top = p.getBoundingClientRect().top, lh = parseFloat(getComputedStyle(p).lineHeight), tops = [];
    [...p.childNodes].filter(n => n.nodeType === 3).forEach(n => { const r = document.createRange(); r.selectNodeContents(n); [...r.getClientRects()].forEach(b => { if (!tops.some(t => Math.abs(t - b.top) < 1)) tops.push(b.top); }); });
    tops.sort((a, b) => a - b);
    const atoms = [...p.querySelectorAll('.tag, .demo-chip')];
    if (atoms.length < 3) fails.push('prose: the sentence of atoms has lost its atoms');
    atoms.forEach(a => { if (getComputedStyle(a).display !== 'inline-flex') fails.push(`prose: an atom in a sentence is display: ${getComputedStyle(a).display}`); });
    if (getComputedStyle(p).display !== 'block') fails.push(`prose: a sentence with atoms in it is display: ${getComputedStyle(p).display}`);
    for (let i = 1; i < tops.length; i++) if (Math.abs(tops[i] - tops[i - 1] - lh) > .6) fails.push(`prose: line ${i + 1} of the sentence of atoms is ${(tops[i] - tops[i - 1]).toFixed(2)}px under the last, not a line height (${lh.toFixed(2)}px): an atom stretched its line`);
    const h = p.getBoundingClientRect().height, m = ((h % u) + u) % u;
    if (m > .5 && m < u - .5) fails.push(`prose: the sentence of atoms is ${h.toFixed(2)}px tall, not whole cells`);
    return fails;
  }));
  // A ring dot (D103): the dot's own box with a line inside it, a quarter of
  // the dot and never over two lines, clear inside; --dot-ring and --dot-fill
  // set the line and the inside. A browser draws a border in whole device
  // pixels, so a width may read up to a device pixel under what was asked.
  fails.push(...await page.evaluate(() => {
    const fails = [], host = document.createElement('div');
    host.innerHTML = '<span class="dot"></span><span class="dot cc-ring"></span><span class="dot cc-ring" style="--dot-size: var(--sp-2)"></span>' +
      '<span class="dot cc-ring cc-ok" style="--dot-size: var(--sp-2); --dot-ring: var(--line); --dot-fill: var(--surface)"></span><span class="dot cc-quiet"></span><span class="dot cc-ring cc-quiet"></span>';
    document.body.appendChild(host);
    const [dot, ring, big, set, quiet, quietRing] = [...host.children], cs = e => getComputedStyle(e), w = e => parseFloat(cs(e).borderTopWidth);
    const probe = document.createElement('i'); probe.style.cssText = 'display: block; width: var(--line)'; host.appendChild(probe);
    const line = probe.getBoundingClientRect().width, clear = c => /rgba\(0, 0, 0, 0\)|transparent/.test(c);
    const size = e => e.getBoundingClientRect().width, px = 1 / devicePixelRatio;
    if (Math.abs(size(ring) - size(dot)) > .01) fails.push(`a ring dot is ${size(ring)}px wide, a dot ${size(dot)}px`);
    if (!(w(ring) >= line - .01) || w(ring) > size(ring) / 4 + .01) fails.push(`a half-cell ring's line is ${w(ring)}px: it should be a quarter of its ${size(ring)}px, and a line at least`);
    if (w(big) > line * 2 + .01 || w(big) < line * 2 - px - .01) fails.push(`a two-cell ring's line is ${w(big)}px, not two lines`);
    if (!clear(cs(ring).backgroundColor)) fails.push(`a ring dot is filled: ${cs(ring).backgroundColor}`);
    if (cs(ring).borderTopColor !== cs(dot).backgroundColor) fails.push("a ring's line is not the dot's color");
    if (Math.abs(w(set) - line) > px + .01) fails.push(`--dot-ring: var(--line) drew a ${w(set)}px ring`);
    if (clear(cs(set).backgroundColor)) fails.push('--dot-fill did not fill a ring');
    if (cs(quietRing).borderTopColor === cs(quiet).backgroundColor) fails.push('a quiet ring should take the next ink up from a quiet dot');
    host.remove();
    return fails;
  }));
  // Floats as popovers: a closed one is gone, not laid out unseen where it
  // takes clicks; it opens and fades, and closes to nothing again.
  fails.push(...await page.evaluate(async () => {
    const fails = [], wait = ms => new Promise(r => setTimeout(r, ms));
    const host = document.createElement('div');
    host.innerHTML = '<div class="float options-card" popover="manual" id="pop-card"><button class="options-card-item" type="button">A</button><button class="options-card-item" type="button">B</button></div>';
    document.body.appendChild(host);
    const f = document.getElementById('pop-card'), cs = () => getComputedStyle(f);
    const gone = what => {
      if (cs().display !== 'none') fails.push(`an options card ${what} is display: ${cs().display}, not none`);
      const r = f.getBoundingClientRect();
      if (r.width || r.height) fails.push(`an options card ${what} still has a box: ${r.width.toFixed(0)} by ${r.height.toFixed(0)}`);
      if (f.contains(document.elementFromPoint(4, 4))) fails.push(`an options card ${what} takes clicks at the page's corner`);
    };
    gone('closed');
    f.showPopover();
    await Promise.all(f.getAnimations().map(a => a.finished)); await wait(50);
    if (!f.matches(':popover-open') || cs().display !== 'flex' || cs().opacity !== '1') fails.push(`an open options card is display: ${cs().display}, opacity ${cs().opacity}`);
    f.hidePopover();
    await Promise.all(f.getAnimations().map(a => a.finished.catch(() => {}))); await wait(50);
    gone('closed after opening');
    // float.js: placed by its anchor through --float-x and --float-y, kept on
    // the screen, flipped when there is no room, and closed by Escape, a press
    // elsewhere, a toggle, and its anchor scrolling out of view.
    if (!window.Trellis || !Trellis.float) fails.push('float.js did not load');
    else {
      const u = Trellis.cell(), F = Trellis.float, frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const W = document.documentElement.clientWidth, H = innerHeight, near = (a, b) => Math.abs(a - b) < 1.5;
      const btn = (x, y) => { const b = document.createElement('button'); b.className = 'button cc-sm'; b.type = 'button'; b.textContent = 'Open'; b.setAttribute('aria-expanded', 'false'); b.style.cssText = `position: fixed; left: ${x}px; top: ${y}px`; host.appendChild(b); return b; };
      const fr = () => { const c = getComputedStyle(f), left = parseFloat(c.left), top = parseFloat(c.top); return { left, top, right: left + f.offsetWidth, bottom: top + f.offsetHeight }; };   // where it is placed: its box is scaled while it fades in
      let a = btn(Math.round(W / 2), u * 4), r = a.getBoundingClientRect();   // room for its width on either side, on a phone too
      F.open(f, a);
      if (!f.matches(':popover-open')) fails.push('Trellis.float.open did not open the float');
      if (!near(fr().left, r.left) || !near(fr().top, r.bottom + u / 4)) fails.push(`a float is not under its anchor's start, a quarter cell down: ${fr().left.toFixed(0)},${fr().top.toFixed(0)} for ${r.left.toFixed(0)},${r.bottom.toFixed(0)}`);
      if (!f.style.getPropertyValue('--float-x') || !f.style.getPropertyValue('--float-y')) fails.push('float.js did not write --float-x and --float-y');
      if (a.getAttribute('aria-expanded') !== 'true') fails.push("an open float's anchor is not aria-expanded");
      F.place(f, a, { align: 'end' });
      if (!near(fr().right, r.right)) fails.push(`align: 'end' does not line a float up with its anchor's end: ${fr().right.toFixed(0)} for ${r.right.toFixed(0)}`);
      a.style.left = u * 2 + 'px'; r = a.getBoundingClientRect();
      F.place(f, a, { side: 'inline-end' });
      if (!near(fr().left, r.right + u / 4) || !near(fr().top, r.top)) fails.push(`side: 'inline-end' does not put a float beside its anchor: ${fr().left.toFixed(0)},${fr().top.toFixed(0)}`);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      if (f.matches(':popover-open') || a.getAttribute('aria-expanded') !== 'false') fails.push('Escape did not close the float');
      if (document.activeElement !== a) fails.push('Escape did not give focus back to the anchor');
      // At the screen's bottom right: flipped above, and kept a half cell from the edge.
      a.remove(); a = btn(W - u * 3, H - u * 3); r = a.getBoundingClientRect();
      F.open(f, a);
      if (!near(fr().bottom, r.top - u / 4)) fails.push(`a float with no room under its anchor did not flip above it: its bottom ${fr().bottom.toFixed(0)}, the anchor's top ${r.top.toFixed(0)}`);
      if (fr().right > W - u / 2 + 1) fails.push(`a float left the screen: its right edge at ${fr().right.toFixed(0)} of ${W}`);
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      if (f.matches(':popover-open')) fails.push('a press elsewhere did not close the float');
      F.toggle(f, a); F.toggle(f, a);
      if (f.matches(':popover-open')) fails.push('Trellis.float.toggle did not close an open float');
      // In a scroller: it follows its anchor, and closes once the anchor is out of view.
      a.remove();
      const box = document.createElement('div');
      box.style.cssText = `position: fixed; left: 0; top: 0; width: ${u * 20}px; height: ${u * 10}px; overflow: auto`;
      box.innerHTML = `<div style="height: ${u * 40}px; padding-top: ${u * 2}px"><button class="button cc-sm" type="button">Open</button></div>`;
      host.appendChild(box); a = box.querySelector('button');
      F.open(f, a);
      const top0 = fr().top;
      box.scrollTop = u; await frame();
      if (!f.matches(':popover-open') || !near(fr().top, top0 - u)) fails.push(`a float did not follow its anchor in a scroller: ${fr().top.toFixed(0)}, was ${top0.toFixed(0)}`);
      box.scrollTop = u * 10; await frame();
      if (f.matches(':popover-open')) fails.push('a float stayed open after its anchor scrolled out of view');
    }
    host.remove();
    return fails;
  }));
  // A switch in a menu row: the row is the control, the switch an empty span at
  // its end. It keeps no room for a label, ends where a row's end icon does, is
  // lit by its row's aria-checked, and the row is not washed as chosen.
  fails.push(...await page.evaluate(async () => {
    const fails = [], host = document.createElement('div');
    host.innerHTML = '<div class="float options-card"><button class="options-card-item" type="button" role="menuitemcheckbox" aria-checked="false" id="sw-row"><span class="options-card-label">Listen</span><span class="switch" aria-hidden="true"></span></button>'
      + '<button class="options-card-item" type="button" id="sw-plain"><span class="options-card-label">Plain</span><svg class="icon cc-end" viewBox="0 0 14 14" aria-hidden="true"></svg></button></div>'
      + '<div class="cluster"><button class="switch" type="button" role="switch" aria-checked="true" id="sw-on"><span class="switch-label">On</span></button><button class="switch" type="button" role="switch" aria-checked="false" id="sw-off"><span class="switch-label">Off</span></button></div>';
    document.body.appendChild(host);
    const $ = id => document.getElementById(id), row = $('sw-row'), sw = row.querySelector('.switch'), near = (a, b) => Math.abs(a - b) < .6;
    const track = e => getComputedStyle(e, '::after'), r = e => e.getBoundingClientRect();
    if (!near(r(sw).width, parseFloat(track(sw).width))) fails.push(`an empty switch is ${r(sw).width.toFixed(1)}px wide, not its track's ${track(sw).width}: it keeps room for a label`);
    const end = r($('sw-plain').querySelector('.icon')).right;
    if (!near(r(sw).right, end)) fails.push(`a menu row's switch ends at ${r(sw).right.toFixed(1)}, not where a row's end icon does (${end.toFixed(1)})`);
    if (track(sw).backgroundColor !== track($('sw-off')).backgroundColor) fails.push("an unchecked row's switch is not drawn off");
    const ground = getComputedStyle(row).backgroundColor;
    row.setAttribute('aria-checked', 'true');
    await Promise.all(sw.getAnimations({ subtree: true }).map(x => x.finished.catch(() => {})));   // the track's color transition
    if (track(sw).backgroundColor !== track($('sw-on')).backgroundColor) fails.push("a checked row's switch is not lit by its row");
    if (getComputedStyle(row).backgroundColor !== ground) fails.push(`a checked row that holds a switch is washed as a chosen option: ${getComputedStyle(row).backgroundColor}, was ${ground}`);
    if (matchMedia('(pointer: coarse)').matches && getComputedStyle(sw, '::before').content !== 'none') fails.push("a menu row's switch grows a hit area of its own, into the rows around it");
    host.remove();
    return fails;
  }));
  // A backdrop click closes a modal through the runtime, but only when the press
  // began on the backdrop too: a press inside the card let go outside it (selecting
  // text) keeps it open, and data-trellis-stay keeps it open whatever is clicked.
  const open = () => page.evaluate(() => document.getElementById('demo-modal').open);
  const show = () => page.evaluate(async () => {
    const d = document.getElementById('demo-modal'), inner = d.querySelector('.modal-inner');
    d.showModal();
    await Promise.all(inner.getAnimations().map(a => a.finished));
    const r = inner.getBoundingClientRect();
    return { x: r.left + r.width / 2, inside: r.top + Math.min(r.height / 2, 40), backdrop: r.top / 2 };
  });
  const settle = () => page.waitForTimeout(250);
  let at = await show();
  if (at.backdrop < 2) fails.push('the modal leaves no backdrop above it to click');
  else {
    await page.mouse.move(at.x, at.inside); await page.mouse.down();
    await page.mouse.move(at.x, at.backdrop, { steps: 4 }); await page.mouse.up(); await settle();
    if (!(await open())) fails.push('a press inside the modal let go on the backdrop closed it');
    await page.evaluate(() => document.getElementById('demo-modal').setAttribute('data-trellis-stay', ''));
    await page.mouse.click(at.x, at.backdrop); await settle();
    if (!(await open())) fails.push('a backdrop click closed a modal with data-trellis-stay');
    await page.evaluate(() => document.getElementById('demo-modal').removeAttribute('data-trellis-stay'));
    await page.mouse.click(at.x, at.backdrop); await settle();
    if (await open()) fails.push('a backdrop click did not close the modal');
  }
  await page.evaluate(() => { const d = document.getElementById('demo-modal'); if (d.open) d.close(); });

  // A clamp (D105). Layout: the box is its lines' own, the first capitals at its
  // top and whole cells tall, so it sits where unclamped text would. Pixels:
  // black words on white, read row by row. Every line has descenders and tall
  // letters, so the last line's tails must reach as deep as the first line's
  // (the clip keeps them), and the rows under them must be empty to a cell
  // below (nothing of the next, hidden line shows).
  {
    const ROLES = ['t-sm', 't-body', 't-h5'], D = touch ? 3 : 1;
    const marks = await page.evaluate(async (roles) => {
      const u = Trellis.cell(), words = 'Lazy gypsy typing by a quay, judging hefty jugs of pygmy hog quality; '.repeat(8);
      const host = document.createElement('div'); host.id = 'clamp-test'; host.className = 'stack';
      host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; z-index: 2147483647; box-sizing: content-box; inline-size: calc(var(--u) * 22); padding: var(--sp-2); background: #fff; color: #000; --stack-gap: var(--sp-2);';
      host.innerHTML = roles.map(r => `<p class="${r} u-clamp">${words}</p>`).join('') + '<p class="t-sm u-clamp" style="--lines: 3">' + words + '</p>';
      // A capital of each role, from a cap-centered line: its box is trimmed to it and not rounded. Out of the stack, so it moves nothing.
      const caps = document.createElement('div'); caps.className = 'row'; caps.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; visibility: hidden;';
      caps.innerHTML = roles.map(r => `<span class="${r} cap-center">X</span>`).join('');
      host.appendChild(caps);
      document.body.appendChild(host);
      await Trellis.settled(); await new Promise(r => setTimeout(r, 100)); await Trellis.settled();
      const hb = host.getBoundingClientRect(), out = [];
      host.querySelectorAll('.u-clamp').forEach(el => {
        const b = el.getBoundingClientRect(), cs = getComputedStyle(el), probe = caps.children[roles.indexOf(el.classList[0])];
        out.push({ role: el.className, lines: +cs.getPropertyValue('--lines'), x: b.left - hb.left, y: b.top - hb.top, w: b.width, h: b.height, u,
          lh: parseFloat(cs.lineHeight), fs: parseFloat(cs.fontSize), cap: probe.getBoundingClientRect().height });
      });
      return out;
    }, ROLES);
    const whole = (v, u) => { const m = ((v % u) + u) % u; return m < .5 || m > u - .5; };
    for (const m of marks) {
      const lines = (m.lines - 1) * m.lh + m.cap;
      if (!whole(m.y, m.u)) fails.push(`clamp: ${m.role} starts ${m.y.toFixed(2)}px down its stack, off the lines`);
      if (!whole(m.h, m.u) || m.h < lines - .5 || m.h >= lines + m.u) fails.push(`clamp: ${m.role} is ${m.h.toFixed(2)}px tall; its ${m.lines} lines are ${lines.toFixed(2)}px, so ${(Math.ceil(lines / m.u - 1e-3) * m.u).toFixed(0)}px in whole cells`);
    }
    const png = (await page.locator('#clamp-test').screenshot()).toString('base64');
    const decoder = await browser.newPage();
    const rows = await decoder.evaluate(async ([png, marks, D]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
      // The darkest pixel of each row of a clamp's column, as luminance.
      return marks.map(m => {
        const x0 = Math.max(0, Math.floor(m.x * D)), w = Math.min(img.width - x0, Math.ceil(m.w * D)), y0 = Math.floor(m.y * D), n = Math.min(img.height - y0, Math.ceil((m.h + m.u * 2) * D));
        const d = g.getImageData(x0, y0, w, n).data, out = [];
        for (let y = 0; y < n; y++) { let low = 255; for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, l = .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]; if (l < low) low = l; } out.push(low); }
        return out;
      });
    }, [png, marks, D]);
    await decoder.close();
    await page.evaluate(() => document.getElementById('clamp-test').remove());
    marks.forEach((m, i) => {
      const r = rows[i], INK = 170, CLEAR = 225;
      // How many rows of ink hang under a baseline, before the first clear row.
      const depth = line => { const from = Math.ceil(((line - 1) * m.lh + m.cap) * D + .5); let n = 0; while (from + n < r.length && r[from + n] < INK) n++; return [n, from]; };
      const [first] = depth(1), [last, from] = depth(m.lines);
      if (first < 1) { fails.push(`clamp: ${m.role}: no descender found under the first line; the test's words or its baseline are wrong`); return; }
      // A line's deepest letter differs from the next line's by a row or two of soft edge: one CSS pixel is the tolerance.
      if (process.env.VERBOSE) console.log(`  clamp ${m.role} ${m.lines} lines: ${first} rows under the first baseline, ${last} under the last (at ${D}x)`);
      if (last < first - D) fails.push(`clamp: ${m.role}: the last line's descenders are cut: ${last} rows of ink under its baseline, ${first} under the first line's (at ${D}x)`);
      if (last > first + D) fails.push(`clamp: ${m.role}: ${last} rows of ink under the last baseline, ${first} under the first line's: the hidden line shows through (at ${D}x)`);
      const stray = r.slice(from + last + 1, from + last + 1 + Math.round(m.u * D)).findIndex(l => l < CLEAR);
      if (stray >= 0) fails.push(`clamp: ${m.role}: ink ${((last + 1 + stray) / D).toFixed(1)}px under the last baseline, past its descenders: the hidden line shows`);
    });
  }
  await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]); // WebKit on Windows can hang on close
  console.log(`${engine} ${size}${touch ? ' touch' : ''}: layout ${fails.length ? fails.length + ' FAILED' : 'ok'}`);
  fails.forEach(f => console.log('  ' + f));
  process.exit(fails.length ? 1 : 0);
})();
