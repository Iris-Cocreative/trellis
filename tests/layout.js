// Trellis · layout behavior test
// What a position check can't see: that each layout responds and behaves.
//   list    a row is whole cells; its rule adds no height; it steps out a cell
//   shell   its nav is a column in a wide box and a tab bar in a narrow one,
//           with the same markup, in the same window
//   cover   its media reaches both screen edges and adds no sideways scroll
//   board   it scrolls inside itself, and its lanes are the set width
//   input   every height is whole cells; on touch, at least 44px and 16px type
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
//   forced  in forced colors, current and selected marks, the switch, dots,
//           badges and avatar rings still draw
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
    const r = id => parseFloat(cs(id).borderTopLeftRadius), pad = id => Math.min(parseFloat(cs(id).paddingLeft), parseFloat(cs(id).paddingTop));
    const q = Math.max(1, Math.round(u / 4));
    [['demo-nest-1', 'demo-nest-2'], ['demo-nest-2', 'demo-nest-3']].forEach(([a, b]) => {
      const want = Math.max(q, r(a) - pad(a));
      if (Math.abs(r(b) - want) > .5) fails.push(`${b}'s corner is ${r(b)}, not ${a}'s less its padding (${want})`);
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
    if (cs('.dot').backgroundColor === canvas) fails.push('forced colors: a dot vanished');
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
  await browser.close();
  console.log(`${engine} ${size}${touch ? ' touch' : ''}: layout ${fails.length ? fails.length + ' FAILED' : 'ok'}`);
  fails.forEach(f => console.log('  ' + f));
  process.exit(fails.length ? 1 : 0);
})();
