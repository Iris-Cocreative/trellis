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
//   corner  a small padding on a very round card is raised, by whole cells, to
//           what clears the corner's curve; a padding that clears it, at the
//           defaults or one side against the other, is left alone; bleeding
//           media and a card's scroller still meet its edges (D113)
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
//           screen, flips it, follows it in a scroller and closes it; at
//           312% text an options card grows with its type, in whole cells, to
//           the screen less its margins, and cuts no label off that fits (D111)
//   switch  in a menu row: no room for a label, at the row's end, lit by the
//           row, the row not washed
//   choice  checkbox, radio and switch (D109): boxes on half cells at the
//           row's start, rows whole cells, capitals centered on the box, a
//           wrapped label's box on its first line; the touch hit area; checked,
//           mixed, disabled and invalid; Space, a radio group's arrows, a
//           click on the words; a prose task's box on its first line
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
//   covers  a card's link covers the card, its button and tag take their own
//           clicks, a row's link the same, and the focus ring is the card's;
//           an image fills its frame at the focal point, the frame in cells,
//           and a banner, a strip and a full bleed meet the card's edges and
//           take its corners
//   gaps    a shell keeps a column for an aside only when it has one; the
//           column's brand is not in the tab bar; prose in a bubble that
//           shrinks to its content has a width; a message keeps the line
//           breaks it was typed with, and a bubble of markup does not (D112)
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

    // Padding clears the corner (D113): corner, sides, top and bottom as asked,
    // then the sides and the top and bottom as laid out, in cells. The content's
    // own corner, measured from the boxes, must be inside the curve.
    {
      const host = document.createElement('div');
      host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; inline-size: calc(var(--u) * 30); visibility: hidden;';
      document.body.appendChild(host);
      const CASES = [
        [5, 0, 0, 2, 2], [5, 1, 1, 2, 2], [4, 1, 1, 2, 2], [5, .25, 2, 1.25, 2], [5, 2, .25, 2, 1.25], [3, 0, 1, 1, 1],
        [5, 1, 4, 1, 4], [5, 4, 1, 4, 1], [5, 0, 5, 0, 5], [4, 1, 2, 1, 2], [4, 1.5, 1.5, 1.5, 1.5], [3, 1, 1, 1, 1], [1.5, 2, 0, 2, 0], [1.5, 2, 2, 2, 2], [2, 1, 2, 1, 2], [.25, 1, 1, 1, 1], [0, 0, 0, 0, 0],
      ];
      for (const [r, i, b, wi, wb] of CASES) {
        host.innerHTML = `<div class="card" style="--card-radius: calc(var(--u) * ${r}); --card-pad-inline: calc(var(--u) * ${i}); --card-pad-block: calc(var(--u) * ${b})"><div style="block-size: calc(var(--u) * 12)"></div></div>`;
        const c = box(host.firstChild), k = box(host.firstChild.firstChild), name = `corner: a card of corner ${r} and padding ${i} by ${b} cells`;
        const px = (k.left - c.left) / u, py = (k.top - c.top) / u, ex = (c.right - k.right) / u, ey = (c.bottom - k.bottom) / u;
        expect([[px, wi], [ex, wi], [py, wb], [ey, wb]].every(([a, w]) => Math.abs(a - w) < .01), `${name} lays out ${px.toFixed(2)} by ${py.toFixed(2)} (and ${ex.toFixed(2)} by ${ey.toFixed(2)} at its end), not ${wi} by ${wb}`);
        expect(px >= r || py >= r || Math.hypot(r - px, r - py) <= r + .01, `${name}: its content's corner, ${px.toFixed(2)} by ${py.toFixed(2)} in, is on the curve`);
      }
      // A pill's corner counts to eight cells; a bare 0 is a length; the shorthand and a nested card are held too.
      const laid = html => { host.innerHTML = html; return [...host.querySelectorAll('[data-c]')].map(e => { const s = getComputedStyle(e); return [parseFloat(s.paddingLeft) / u, parseFloat(s.paddingTop) / u, parseFloat(s.borderTopLeftRadius) / u].map(v => +v.toFixed(2)); }); };
      const is = (got, want, what) => expect(got.every((g, n) => want[n].every((w, m) => Math.abs(g[m] - w) < .02)), `corner: ${what}: ${JSON.stringify(got)}, not ${JSON.stringify(want)}`);
      is(laid('<div class="card" data-c style="--card-radius: var(--r-round); --card-pad: var(--sp-1)">a</div>'), [[3, 3]], 'a pill with one cell of padding');
      is(laid('<div class="card" data-c style="--card-radius: 0; --card-pad: var(--sp-1)">a</div>'), [[1, 1, 0]], 'a bare 0 for the corner');
      is(laid('<div class="card" data-c style="--card-radius: var(--r-1h); --card-pad-inline: var(--sp-2); --card-pad-block: 0">a</div>'), [[2, 0]], 'a bare 0 for one padding');
      is(laid('<div class="card" data-c style="--card-radius: calc(var(--u) * 5); --card-pad: var(--sp-1)"><div class="card" data-c>a</div></div>'), [[2, 2, 5], [2, 2, 4]], 'a card in a round card');
      // Bleeding media and a scroller give the raised padding back, and meet the card's edges exactly.
      const round = 'style="--card-radius: calc(var(--u) * 5); --card-pad: var(--sp-1)"';
      const meets = (html, sides, what) => { host.innerHTML = html; const c = box(host.querySelector('.card')), m = box(host.querySelector('[data-m]')), off = sides.filter(k => Math.abs(c[k] - m[k]) > .05);
        expect(!off.length, `corner: ${what} does not meet a round card's ${off.join(', ')} edge (${off.map(k => (m[k] - c[k]).toFixed(2)).join(', ')}px)`);
        const s = getComputedStyle(host.querySelector('.card')); expect(Math.abs(parseFloat(s.paddingLeft) - 2 * u) < .05, `corner: the card of ${what} pads ${s.paddingLeft}`); };
      const words = '<p class="t-sm">Words</p>';
      meets(`<div class="card stack" ${round}><div class="media cc-bleed" data-m></div>${words}</div>`, ['left', 'top', 'right'], 'a banner');
      meets(`<div class="card stack" ${round}>${words}<div class="media cc-bleed" data-m></div></div>`, ['left', 'bottom', 'right'], 'a banner at the foot');
      meets(`<div class="card" ${round}><div class="media cc-bleed-start" data-m></div><div>${words}</div></div>`, ['left', 'top', 'bottom'], 'a strip');
      meets(`<div class="card" ${round}><div>${words}</div><div class="media cc-bleed-end" data-m></div></div>`, ['right', 'top', 'bottom'], 'a strip at the end');
      meets(`<div class="card" ${round}><div class="media cc-fill" data-m></div><div>${words}</div></div>`, ['left', 'top', 'right', 'bottom'], 'a full bleed');
      meets(`<div class="card" ${round}><div class="card-scroll" data-m tabindex="0">${words}</div></div>`, ['left', 'top', 'right', 'bottom'], 'a scroller');
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
    // The current link's mark: at the start in the column, on the top edge in the tab bar.
    {
      const mark = l => getComputedStyle(l).boxShadow, cur = s => $(s + ' .shell-link[aria-current="page"]');
      const xy = l => { const m = /(-?[\d.]+)px\s+(-?[\d.]+)px/.exec(mark(l)); return m ? [+m[1], +m[2]] : [0, 0]; };
      const tabCur = cur('#demo-shell-narrow');
      expect(tabCur, 'the narrow shell has no current link');
      if (tabCur) {
        const m = mark(tabCur), cs = getComputedStyle(tabCur);
        const [x, y] = xy(tabCur);
        expect(/inset/.test(m) && x === 0 && y === 2, `the tab bar's current link draws the column's mark, not its own: ${m}`);
        expect(cs.borderTopLeftRadius === '0px' && cs.borderTopRightRadius === '0px' && parseFloat(cs.borderBottomLeftRadius) > 0, `the tab bar's current mark meets rounded corners: ${cs.borderRadius}`);
      }
      const colCur = cur('#demo-shell-wide');
      if (colCur && nav('#demo-shell-wide') === 'column') expect(xy(colCur)[0] === 2 && xy(colCur)[1] === 0, `the column's current link lost its start mark: ${mark(colCur)}`);
    }

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
    // A segmented control written as radios: aria-checked="true" is selected, as aria-selected is.
    const seg = document.createElement('div'); seg.className = 'tabs cc-seg'; seg.setAttribute('role', 'radiogroup');
    seg.innerHTML = '<button class="tab" type="button" role="radio" aria-checked="true">Day</button><button class="tab" type="button" role="radio" aria-checked="false">Week</button>' +
      '<button class="tab" type="button" role="tab" aria-selected="true">Month</button>';
    host.appendChild(seg);
    const [rOn, rOff, sel] = seg.querySelectorAll('.tab'), bg = e => getComputedStyle(e).backgroundColor;
    if (bg(rOn) === bg(rOff)) fails.push('a tab with aria-checked="true" draws like the others');
    if (bg(rOn) !== bg(sel)) fails.push(`a checked radio tab (${bg(rOn)}) is not drawn as a selected tab (${bg(sel)})`);
    if (getComputedStyle(rOn).color !== getComputedStyle(sel).color) fails.push("a checked radio tab's ink is not a selected tab's");
    host.remove();
    return fails;
  }));
  // What a site moving onto Trellis needed: a fill grid reaches both edges, a
  // block button its container's width, a tag's edge may be dashed, a select's
  // chevron takes its own color, a top-level card its own ground, the widest
  // frame is a product knob, and a frame that is a grid of cards keeps its
  // centering under the outset.
  fails.push(...await page.evaluate(async () => {
    const fails = [], u = Trellis.cell(), host = document.createElement('div'), root = document.documentElement;
    host.style.cssText = `position:absolute;top:0;left:0;width:${u * 46}px`;
    host.innerHTML = '<div class="grid cc-fill" style="--grid-min:var(--sp-16)"><div class="card">a</div><div class="card">b</div></div>' +
      '<div class="grid" style="--grid-min:var(--sp-16)"><div class="card">a</div><div class="card">b</div></div>' +
      '<div class="block-test" style="width:' + (u * 20) + 'px"><button class="button cc-block" type="button"><span class="button-label">Send</span></button><button class="button" type="button"><span class="button-label">Send</span></button></div>' +
      '<span class="tag" style="--tag-edge-style:dashed"><span class="tag-label">Soon</span></span><span class="tag"><span class="tag-label">Here</span></span>' +
      '<select class="input" style="--chevron-color:rgb(255, 0, 0)"><option>One</option></select>' +
      '<div class="card" style="--surface:rgb(0, 128, 0)">ground</div>';
    document.body.appendChild(host);
    await Trellis.settled();
    const box = e => e.getBoundingClientRect(), hb = box(host);
    const [fill, plain] = host.querySelectorAll('.grid');
    const fc = [...fill.children].map(box), pc = [...plain.children].map(box);
    // Two tracks of a fill grid reach both of its edges; a plain grid's leave the remainder as space.
    const gutter = (fc[0].left - box(fill).left), end = box(fill).right - fc[1].right;
    if (Math.abs(gutter) > .5 || Math.abs(end) > .5) fails.push(`.grid.cc-fill: its cards start ${gutter.toFixed(1)}px and end ${end.toFixed(1)}px from its edges`);
    if (Math.abs(box(fill).right - box(plain).right) > .5) fails.push('.grid.cc-fill: not the same box as a plain grid');
    if (box(plain).right - pc[1].right < u) fails.push('a plain .grid now stretches its tracks');
    const [block, btn] = host.querySelectorAll('.block-test .button');
    if (Math.abs(box(block).width - u * 20) > .5) fails.push(`.button.cc-block is ${box(block).width.toFixed(1)}px in a ${u * 20}px column`);
    if (box(btn).width > u * 10) fails.push('a plain button stretched in a column');
    const [dashed, solid] = host.querySelectorAll('.tag');
    if (getComputedStyle(dashed).borderTopStyle !== 'dashed') fails.push('--tag-edge-style: dashed does not reach the tag: ' + getComputedStyle(dashed).borderTopStyle);
    if (getComputedStyle(solid).borderTopStyle !== 'solid') fails.push("a tag's edge is not solid by default");
    if (!/255, 0, 0/.test(getComputedStyle(host.querySelector('select')).backgroundImage)) fails.push("--chevron-color does not reach a select's chevron");
    if (getComputedStyle(host.querySelector('.block-test ~ .card')).backgroundColor !== 'rgb(0, 128, 0)') fails.push("--surface on a top-level card is not its ground");
    host.remove();
    // A frame that is a grid of cards: centered, inside the screen, and the knob moves its widest.
    const f = document.createElement('div'); f.className = 'grid frame'; f.innerHTML = '<div class="card">a</div><div class="card">b</div>';
    const ref = document.createElement('div'); ref.className = 'frame';
    document.body.append(f, ref);
    await Trellis.settled();
    const r = box(f), q = box(ref);
    if (Math.abs(r.left - q.left) > .5 || Math.abs(r.right - q.right) > .5) fails.push(`a frame that is a grid of cards is not where a frame is: ${r.left.toFixed(1)} to ${r.right.toFixed(1)}, a frame ${q.left.toFixed(1)} to ${q.right.toFixed(1)}`);
    const before = r.width;
    root.style.setProperty('--frame-max-n', '40');
    const narrow = box(f).width;
    if (narrow > u * 40 + .5 || (before > u * 40 + .5 && narrow >= before)) fails.push(`--frame-max-n: 40 leaves a frame ${narrow.toFixed(1)}px wide (a cell is ${u}px)`);
    root.style.removeProperty('--frame-max-n');
    f.remove(); ref.remove();
    await Trellis.settled();
    return fails;
  }));
  // A shell without an aside, at every width: main reaches the grid's end, and
  // a width set for other pages' asides keeps no column here. The brand of a
  // side column is not in the tab bar; a top bar keeps its brand. The boxes are
  // absolute and unseen: they need a width, not a place.
  fails.push(...await page.evaluate(async () => {
    const bad = [], expect = (ok, msg) => { if (!ok) bad.push(msg); };
    const host = document.createElement('div');
    host.style.cssText = 'position: absolute; inset: 0 auto auto 0; visibility: hidden;';
    const shell = (id, rem, cls, aside, grid = '') => `<div style="width: ${rem}rem"><div class="shell ${cls}" id="${id}"><div class="shell-grid" style="--shell-h: calc(var(--u) * 20); ${grid}"><header class="shell-nav"><a class="shell-brand" href="#top"><span>Seed Library</span></a><a class="shell-link" href="#top">Home</a></header><main class="shell-main"><p class="t-sm">Main</p></main>${aside}</div></div></div>`;
    const has = '<aside class="shell-aside"><p class="t-sm">Aside</p></aside>', wide = '--shell-aside-w: calc(var(--u) * 30)';
    host.innerHTML = ['side', 'cc-top'].map(k => shell(`sh-${k}-none`, 90, k, '') + shell(`sh-${k}-has`, 90, k, has) + shell(`sh-${k}-hidden`, 90, k, has.replace('<aside', '<aside hidden')) + shell(`sh-${k}-set`, 90, k, '', wide) + shell(`sh-${k}-wider`, 90, k, has, wide) + shell(`sh-${k}-narrow`, 30, k, '')).join('');
    document.body.appendChild(host);
    await Trellis.settled();
    const cell = document.createElement('div'); cell.style.width = 'var(--u)'; host.appendChild(cell);
    const u = cell.getBoundingClientRect().width, box = s => document.querySelector(s).getBoundingClientRect();
    for (const k of ['side', 'cc-top']) {
      const near = (n, cells) => { const spare = box(`#sh-${k}-${n} .shell-grid`).right - box(`#sh-${k}-${n} .shell-main`).right; expect(Math.abs(spare - cells * u) < 1, `${k} shell, ${n}: main ends ${(spare / u).toFixed(2)} cells before the grid's end, not ${cells}`); };
      near('none', 0); near('has', 24); near('hidden', 0); near('set', 0); near('wider', 30); near('narrow', 0);
      const shown = n => getComputedStyle(document.querySelector(`#sh-${k}-${n} .shell-brand`)).display !== 'none';
      expect(shown('none'), `${k} shell: the brand is not in the wide navigation`);
      expect(shown('narrow') === (k === 'cc-top'), k === 'cc-top' ? 'a top bar lost its brand when narrow' : "the column's brand is in the tab bar");
    }
    host.remove();
    return bad;
  }));

  // What a bubble holds (D112). Prose: in a bubble that shrinks to its content
  // it has the width of its words, never nothing and never past the message's
  // measure; code, an embed and a wall post take the measure, and an embed
  // keeps its shape. Typed text: its line breaks are kept; the line breaks of
  // markup (between paragraphs, after a br, in prose) are not.
  fails.push(...await page.evaluate(async () => {
    const bad = [], expect = (ok, msg) => { if (!ok) bad.push(msg); };
    const host = document.createElement('div');
    host.className = 'card chat-thread';
    host.style.cssText = 'position: absolute; inset: 0 auto auto 0; visibility: hidden; width: calc(var(--u) * 30);';
    const item = (id, cls, inner) => `<div class="chat-item ${cls}" id="${id}"><span class="avatar cc-sm" aria-hidden="true">A</span><div class="chat-item-body">${inner}</div></div>`;
    const words = 'Bring seed, a jar and whatever was learned since spring, and write the year on each packet before the table opens.';
    const pre = '<pre><code>const seed = 1;</code></pre>', embed = '<iframe title="Embed" srcdoc="<p>Embed</p>"></iframe>';
    const markup = '<p class="t-sm">One</p>\n          <p class="t-sm">Two</p>';
    host.innerHTML = [
      item('b-short', '', '<div class="chat-item-bubble"><div class="prose"><p>Yes.</p></div></div>'),
      item('b-one', '', '<div class="chat-item-bubble prose"><p>Yes.</p></div>'),
      item('b-own', 'cc-own', '<div class="chat-item-bubble"><div class="prose"><p>Yes.</p></div></div>'),
      item('b-long', '', `<div class="chat-item-bubble"><div class="prose"><h3>Seed</h3><p>${words}</p><ul><li>Paper</li></ul></div></div>`),
      item('b-pre', '', `<div class="chat-item-bubble"><div class="prose">${pre}</div></div>`),
      `<div class="cc-dense">${item('b-dense', '', `<div class="chat-item-bubble"><div class="prose">${pre}</div></div>`)}</div>`,
      item('b-embed', '', `<div class="chat-item-bubble"><div class="prose">${embed}</div></div>`),
      item('b-wall', 'cc-wall', '<div class="chat-item-bubble prose"><h3>Beds</h3><p>Yes.</p></div>'),
      item('b-wall-in', 'cc-wall', '<div class="chat-item-bubble"><div class="prose"><p>Yes.</p></div></div>'),
      item('b-flat', 'cc-flat', '<div class="chat-item-bubble"><div class="prose"><p>Yes.</p></div></div>'),
      item('l-one', '', '<div class="chat-item-bubble t-sm">One</div>'),
      item('l-three', '', '<div class="chat-item-bubble t-sm">One\nTwo <b>and</b>\nThree</div>'),
      item('l-flat-one', 'cc-flat', '<div class="chat-item-bubble t-sm">One</div>'),
      item('l-flat', 'cc-flat', '<div class="chat-item-bubble t-sm">One\nTwo\nThree</div>'),
      item('l-wrap', '', `<div class="chat-item-bubble t-sm">${words}\n${words}</div>`),
      item('l-markup', '', `<div class="chat-item-bubble">\n          ${markup}\n        </div>`),
      item('l-tight', '', `<div class="chat-item-bubble">${markup.replace(/\n\s*/g, '')}</div>`),
      item('l-br', '', '<div class="chat-item-bubble t-sm">One<br>\nTwo</div>'),
      item('l-br-tight', '', '<div class="chat-item-bubble t-sm">One<br>Two</div>'),
      item('l-prose', '', '<div class="chat-item-bubble">\n  <div class="prose">\n    <p>One\n    two</p>\n  </div>\n</div>'),
    ].join('');
    document.body.appendChild(host);
    await Trellis.settled();
    const cell = document.createElement('div'); cell.style.width = 'var(--u)'; host.appendChild(cell);
    const u = cell.getBoundingClientRect().width; cell.remove();
    const el = (id, s = '.chat-item-bubble') => document.querySelector(`#${id} ${s}`), box = (id, s) => el(id, s).getBoundingClientRect();
    for (const id of ['b-short', 'b-one', 'b-own']) {
      const w = box(id).width, p = el(id, 'p'), r = document.createRange(); r.selectNodeContents(p);
      const t = r.getBoundingClientRect().width;
      expect(t > u && Math.abs(w - t - 2 * u) < 1.5, `${id}: a bubble of one word of prose is ${w.toFixed(1)}px round ${t.toFixed(1)}px of words, not the words and a cell each side`);
    }
    const end = box('b-own').right, row = document.querySelector('#b-own').getBoundingClientRect().right;
    expect(Math.abs(end - row) < 1, `your own bubble of prose ends ${(row - end).toFixed(1)}px before the row's end`);
    for (const id of ['b-long', 'b-pre', 'b-embed', 'b-wall', 'b-wall-in', 'b-flat']) {
      const b = box(id), body = box(id, '.chat-item-body'), pr = document.querySelector(`#${id} .prose`);
      expect(b.width > 8 * u && Math.abs(b.width - body.width) < 1.5, `${id}: the bubble is ${b.width.toFixed(1)}px in a message ${body.width.toFixed(1)}px wide`);
      expect(pr.scrollWidth <= pr.clientWidth + (id === 'b-pre' ? u : 0) + 1, `${id}: its prose overflows, ${pr.scrollWidth} in ${pr.clientWidth}`);   // code steps out a cell, into the bubble's padding
    }
    for (const id of ['b-wall', 'b-wall-in', 'b-flat', 'b-pre']) expect(getComputedStyle(document.querySelector(`#${id} .prose`)).containerType === 'inline-size', `${id}: its prose is not a container`);
    for (const id of ['b-pre', 'b-dense']) { const b = box(id), c = box(id, 'pre'); expect(c.left >= b.left - .1 && c.right <= b.right + .1 && c.width > 8 * u, `${id}: code reaches ${(b.left - c.left).toFixed(1)}px past its bubble, or is nothing: ${c.width.toFixed(1)}px wide`); }
    const f = box('b-embed', 'iframe');
    expect(f.width > 8 * u && Math.abs(f.height - f.width * 9 / 16) < u + 1, `an embed in a bubble is ${f.width.toFixed(1)} by ${f.height.toFixed(1)}px, not 16 by 9 of its bubble`);
    const h = id => box(id).height, line = parseFloat(getComputedStyle(el('l-one')).lineHeight);
    for (const [three, one] of [['l-three', 'l-one'], ['l-flat', 'l-flat-one']]) {
      const rise = h(three) - h(one);
      expect(rise > line * 2 - u - 1 && rise < line * 2 + u + 1, `${three}: three typed lines are ${rise.toFixed(1)}px taller than one (a line is ${line})`);
    }
    expect(box('l-wrap').right <= box('l-wrap', '.chat-item-body').right + 1, 'a typed line longer than the bubble does not wrap');
    for (const [a, b, what] of [['l-markup', 'l-tight', 'between its paragraphs'], ['l-br', 'l-br-tight', 'after its line break']]) expect(Math.abs(h(a) - h(b)) < 1, `a bubble of markup draws the spaces ${what}: ${h(a).toFixed(1)}px against ${h(b).toFixed(1)}px`);
    expect(Math.abs(h('l-prose') - h('b-short')) < 1, `a bubble of indented prose is ${h('l-prose').toFixed(1)}px, its one line ${h('b-short').toFixed(1)}px`);
    // Each bubble's bottom on a line from its own top: whole cells, with Safari's
    // missing space given as margin by settle.js.
    for (const id of ['b-short', 'b-long', 'l-one', 'l-three', 'l-wrap']) { const t = box(id).height + parseFloat(getComputedStyle(el(id)).marginBottom || 0); expect(Math.abs(t / u - Math.round(t / u)) < .04, `${id}: the bubble takes ${(t / u).toFixed(2)} cells`); }
    host.remove();
    return bad;
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
  // Choice inputs (D109): checkbox, radio and switch as one archetype. Each box
  // is on half cells at its row's start, the row whole cells, the label's
  // capitals centered on the box; the hit area is the touch minimum on a coarse
  // pointer; checked, mixed, disabled and invalid each draw; Space and a radio
  // group's arrows work; a prose task list's box centers on its first line.
  await page.evaluate(() => {
    const host = document.createElement('div'); host.id = 'choice-test'; host.className = 'stack';
    host.style.cssText = 'position: fixed; inset-block-start: 0; inset-inline-start: 0; z-index: 2147483647; padding: var(--sp-2); background: var(--bg); --stack-gap: var(--sp-1);';
    host.innerHTML = '<label class="choice" id="ch-off"><input type="checkbox"><span class="choice-label">Off</span></label>'
      + '<label class="choice" id="ch-on"><input type="checkbox" checked><span class="choice-label">On</span></label>'
      + '<label class="choice" id="ch-mixed"><input type="checkbox"><span class="choice-label">Mixed</span></label>'
      + '<label class="choice" id="ch-dis"><input type="checkbox" disabled><span class="choice-label">Disabled</span></label>'
      + '<label class="choice" id="ch-dis-on"><input type="checkbox" disabled checked><span class="choice-label">Disabled on</span></label>'
      + '<label class="choice" id="ch-bad"><input type="checkbox" aria-invalid="true"><span class="choice-label">Invalid</span></label>'
      + '<label class="choice" id="ch-r1"><input type="radio" name="ch-r" checked><span class="choice-label">First</span></label>'
      + '<label class="choice" id="ch-r2"><input type="radio" name="ch-r"><span class="choice-label">Second</span></label>'
      + '<label class="choice cc-sm" id="ch-sm"><input type="checkbox"><span class="choice-label">Small</span></label>'
      + '<label class="choice cc-lg" id="ch-lg"><input type="checkbox"><span class="choice-label">Large</span></label>'
      + '<label class="choice" id="ch-bare"><input type="checkbox" aria-label="Done"></label>'
      + '<div style="inline-size: calc(var(--u) * 8)"><label class="choice" id="ch-wrap"><input type="checkbox"><span class="choice-label cap-center">A label long enough to wrap</span></label></div>'
      + '<button class="switch" type="button" role="switch" aria-checked="mixed" id="ch-sw-mixed"><span class="switch-label">Mixed</span></button>'
      + '<div class="prose"><ul><li id="ch-task"><input type="checkbox" disabled checked> A task done</li></ul></div>'
      + '<span id="ch-accent" style="background: color-mix(in oklab, var(--text) 0%, var(--accent))"></span><span id="ch-accent-raw" style="background: var(--accent)"></span><span id="ch-alert" style="color: var(--alert)"></span>';
    document.body.prepend(host);
    host.querySelector('#ch-mixed input').indeterminate = true;
  });
  await page.evaluate(async () => { await Trellis.settled(); await new Promise(r => setTimeout(r, 100)); await Trellis.settled(); });
  fails.push(...await page.evaluate(async () => {
    const fails = [], u = Trellis.cell(), $ = id => document.getElementById(id), r = e => e.getBoundingClientRect(), near = (a, b, t = .6) => Math.abs(a - b) < t;
    const onHalf = v => { const h = u / 2, m = ((v % h) + h) % h; return m < .3 || m > h - .3; };
    const whole = v => { const m = ((v % u) + u) % u; return m < .5 || m > u - .5; };
    // The height of a capital in an element's own type.
    const cap = e => { const p = document.createElement('span'); p.style.cssText = 'position: absolute; inline-size: 0; block-size: 1cap'; e.appendChild(p); const h = r(p).height; p.remove(); return h; };
    const accent = getComputedStyle($('ch-accent')).backgroundColor, alert = getComputedStyle($('ch-alert')).color;
    // Let the color transitions finish.
    await Promise.all(document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#choice-test')).map(a => a.finished.catch(() => {})));
    const want = { 'ch-off': 1.5, 'ch-r1': 1.5, 'ch-sm': 1, 'ch-lg': 2, 'ch-bare': 1.5 };
    for (const id of ['ch-off', 'ch-on', 'ch-mixed', 'ch-r1', 'ch-sm', 'ch-lg', 'ch-bare']) {
      const row = $(id), box = row.querySelector('input'), b = r(box), rb = r(row), words = row.querySelector('.choice-label');
      if (!onHalf(b.width) || !onHalf(b.height) || !near(b.width, b.height)) fails.push(`choice ${id}: its box is ${b.width.toFixed(2)}×${b.height.toFixed(2)}, not square on half cells`);
      if (want[id] && !near(b.width, want[id] * u)) fails.push(`choice ${id}: its box is ${b.width.toFixed(2)}px, not ${want[id]} cells`);
      if (!near(b.left, rb.left)) fails.push(`choice ${id}: its box starts ${(b.left - rb.left).toFixed(2)}px into its row`);
      if (!whole(rb.height) || rb.height < 2 * u - .5) fails.push(`choice ${id}: its row is ${rb.height.toFixed(2)}px tall, not whole cells`);
      if (words) {
        const w = r(words);
        if (!near(w.left - b.right, u / 2)) fails.push(`choice ${id}: its words start ${(w.left - b.right).toFixed(2)}px after the box, not half a cell`);
        if (CSS.supports('text-box: trim-both cap alphabetic') && !near(w.top + w.height / 2, b.top + b.height / 2)) fails.push(`choice ${id}: its capitals' middle is ${(w.top + w.height / 2 - b.top - b.height / 2).toFixed(2)}px from its box's`);
      }
    }
    if (getComputedStyle($('ch-r1').querySelector('input')).borderRadius !== '50%') fails.push('choice: a radio is not a circle');
    // Hit area: on a coarse pointer at least --hit-min around the row; the words take the click anywhere.
    if (matchMedia('(pointer: coarse)').matches) {
      const hit = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hit-min')) || 44;
      for (const id of ['ch-off', 'ch-bare', 'ch-sm']) {
        const rb = r($(id)), x = rb.left + rb.width / 2, y = rb.top + rb.height / 2;
        const reach = [[x, y - hit / 2 + 1], [x, y + hit / 2 - 1], [x - Math.max(rb.width, hit) / 2 + 1, y], [x + Math.max(rb.width, hit) / 2 - 1, y]];
        // Neighbors in the test's stack sit a cell away and would win the hit: lift this row above them to measure its own.
        $(id).style.zIndex = '1';
        for (const [px, py] of reach) { const at = document.elementFromPoint(px, py); if (!at || !at.closest('#' + id)) fails.push(`choice ${id}: a tap at ${(px - rb.left).toFixed(0)},${(py - rb.top).toFixed(0)} (inside ${hit}px) misses the row`); }
        $(id).style.zIndex = '';
      }
    }
    // States.
    const bg = id => getComputedStyle($(id).querySelector('input')).backgroundColor, edge = id => getComputedStyle($(id).querySelector('input')).borderTopColor;
    const mark = id => getComputedStyle($(id).querySelector('input'), '::before');
    if (bg('ch-on') !== accent || mark('ch-on').transform === 'matrix(0, 0, 0, 0, 0, 0)') fails.push(`choice: a checked box is not filled with the accent and marked (${bg('ch-on')}, ${accent})`);
    if (bg('ch-off') === accent || mark('ch-off').transform !== 'matrix(0, 0, 0, 0, 0, 0)') fails.push('choice: an unchecked box is drawn as checked');
    if (bg('ch-mixed') !== accent || mark('ch-mixed').clipPath !== 'none' || parseFloat(mark('ch-mixed').height) > u / 2) fails.push(`choice: a mixed box is not filled with a bar (${bg('ch-mixed')}, ${mark('ch-mixed').clipPath}, ${mark('ch-mixed').height})`);
    if (bg('ch-r1') !== accent || mark('ch-r1').borderRadius !== '50%') fails.push('choice: a chosen radio is not filled with a dot');
    if (edge('ch-bad') !== alert) fails.push(`choice: an invalid box's edge is ${edge('ch-bad')}, not the alert ${alert}`);
    if (bg('ch-dis-on') === accent || getComputedStyle($('ch-dis')).color === getComputedStyle($('ch-off')).color || getComputedStyle($('ch-dis')).cursor !== 'not-allowed') fails.push('choice: a disabled choice is not quieted');
    // A wrapped label hangs from its row's top line, the row whole cells, the box on its first line's capitals.
    if (CSS.supports('text-box: trim-both cap alphabetic')) {
      const w = $('ch-wrap'), words = w.querySelector('.choice-label'), b = r(w.querySelector('input'));
      if (!words.hasAttribute('data-trellis-wrap')) fails.push('choice: a wrapping .cap-center label is not marked as wrapped');
      else {
        const first = r(words).top, capH = cap(words);
        if (!whole(r(w).height)) fails.push(`choice: a row with a wrapped label is ${r(w).height.toFixed(2)}px, not whole cells`);
        if (!near(b.top + b.height / 2, first + capH / 2, 1)) fails.push(`choice: with a wrapped label the box's middle is ${(b.top + b.height / 2 - first - capH / 2).toFixed(2)}px from the first line's capitals`);
      }
    }
    // A switch that is mixed holds its thumb half way.
    if (getComputedStyle($('ch-sw-mixed')).getPropertyValue('--switch-x').trim() !== '50%') fails.push('choice: a mixed switch does not hold its thumb half way');
    // A prose task: the box is the choice's, centered on the first line's capitals, at full ink though disabled.
    const t = $('ch-task'), tb = r(t.querySelector('input')), tr = r(t);
    if (!near(tb.width, 1.5 * u)) fails.push(`prose task: its box is ${tb.width.toFixed(2)}px, not a cell and a half`);
    if (CSS.supports('text-box: trim-both cap alphabetic')) {
      const capH = cap(t);
      if (!near(tb.top + tb.height / 2, tr.top + capH / 2, 1)) fails.push(`prose task: its box's middle is ${(tb.top + tb.height / 2 - tr.top - capH / 2).toFixed(2)}px from the first line's capitals`);
    }
    if (getComputedStyle(t.querySelector('input')).backgroundColor !== getComputedStyle($('ch-accent-raw')).backgroundColor) fails.push('prose task: a done task written disabled is not drawn at full ink');
    return fails;
  }));
  // Keyboard and pointer: Space toggles a checkbox, arrows move a radio group, a click on the words toggles.
  {
    const checked = sel => page.evaluate(s => document.querySelector(s).checked, sel);
    await page.focus('#ch-off input'); await page.keyboard.press('Space');
    if (!(await checked('#ch-off input'))) fails.push('choice: Space does not check a focused checkbox');
    await page.focus('#ch-r1 input'); await page.keyboard.press('ArrowDown');
    if (!(await checked('#ch-r2 input')) || await checked('#ch-r1 input')) fails.push('choice: an arrow key does not move a radio group');
    await page.focus('#ch-off input'); await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => { const i = document.querySelector('#ch-on input'); return document.activeElement === i && getComputedStyle(i).outlineStyle !== 'none' ? '' : `${document.activeElement === i ? 'focused' : 'not focused: ' + document.activeElement.outerHTML.slice(0, 60)}, outline ${getComputedStyle(i).outlineStyle}, focus-visible ${i.matches(':focus-visible')}`; });
    if (focused) fails.push('choice: a focused box draws no focus ring: ' + focused);
    const end = async sel => { const b = await page.locator(sel).boundingBox(); return { x: b.width - 2, y: b.height / 2 }; };
    await page.locator('#ch-on').click({ position: await end('#ch-on') });
    if (await checked('#ch-on input')) fails.push('choice: a click on the words does not toggle the box');
    if (touch) { await page.locator('#ch-sm').tap({ position: await end('#ch-sm') }); if (!(await checked('#ch-sm input'))) fails.push('choice: a tap on the words does not toggle the box'); }
    await page.locator('#ch-dis').click({ position: await end('#ch-dis'), force: true });
    if (await checked('#ch-dis input')) fails.push('choice: a disabled box toggled');
  }
  await page.evaluate(() => document.getElementById('choice-test').remove());

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

  // A cover link and a cover image (D108). The link covers its card: what is
  // under a point anywhere on the card is the link, but a button or a tag in
  // it takes its own click, and a real click on each goes where it should. A
  // list row's link does the same for a button in its end. The focus ring is
  // drawn round the card. An image fills its frame by cover at the focal
  // point, the frame whole cells; a bleeding frame meets the card's edges and
  // takes its corners: a banner, a strip at the start, the whole ground.
  {
    await page.evaluate(() => {
      const list = document.createElement('ul'); list.className = 'list'; list.id = 'cover-row-test';
      list.innerHTML = '<li class="list-item"><div class="list-body"><p class="t-sm"><a class="list-link" href="#cover-row">A row that links</a></p><p class="t-xs">Its second line</p></div><div class="list-end"><button class="button cc-ghost cc-sm" type="button"><span class="button-label">Act</span></button></div></li>';
      document.getElementById('demo-cover-line').after(list);
      window.__coverHits = [];
      window.__coverClick = e => { const a = e.target.closest('a, button'); window.__coverHits.push(a ? (a.className.split(' ')[0] || a.tagName) : 'none'); if (a && a.matches('a')) e.preventDefault(); };
      document.addEventListener('click', window.__coverClick, true);
      document.getElementById('demo-cover-banner').scrollIntoView({ block: 'center' });
    });
    await page.waitForTimeout(150);
    const geo = await page.evaluate(() => {
      const $ = s => document.querySelector(s), r = e => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
      const mid = e => { const b = r(e); return { x: (b.l + b.r) / 2, y: (b.t + b.b) / 2 }; };
      const at = (x, y) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('a, button') || e) : null; };
      const card = $('#demo-cover-banner'), link = card.querySelector('.card-link'), cb = r(card);
      // Near each corner, inside its curve (a third of the radius in), the middle, and the words.
      const k = Math.ceil(parseFloat(getComputedStyle(card).borderTopLeftRadius) / 3) + 1;
      const spots = [[cb.l + k, cb.t + k], [cb.r - k, cb.t + k], [cb.l + k, cb.b - k], [cb.r - k, cb.b - k], [(cb.l + cb.r) / 2, (cb.t + cb.b) / 2], [mid(card.querySelector('.t-sm')).x, mid(card.querySelector('.t-sm')).y]];
      const covered = spots.filter(([x, y]) => at(x, y) !== link).length;
      const out = {
        covered, spots: spots.length,
        btnOwn: at(mid($('#demo-cover-save')).x, mid($('#demo-cover-save')).y) === $('#demo-cover-save'),
        tagOwn: at(mid(card.querySelector('.tag')).x, mid(card.querySelector('.tag')).y) === card.querySelector('.tag'),
        save: mid($('#demo-cover-save')), words: mid(card.querySelector('.t-sm')),
        u: Trellis.cell(),
      };
      // Bleeds: each frame's box against its card's, and its corners against the card's.
      const fr = (sel, corners) => { const m = $(sel), c = m.closest('.card'), mb = r(m), b = r(c), cs = getComputedStyle(m), cr = getComputedStyle(c).borderTopLeftRadius;
        return { mb, b, radii: corners.map(k => cs[k]), cr, border: getComputedStyle(c, '::after').borderTopColor }; };
      out.banner = fr('#demo-cover-banner > .media', ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius']);
      out.strip = fr('#demo-cover-line > .media', ['borderTopLeftRadius', 'borderBottomLeftRadius', 'borderTopRightRadius']);
      out.fill = fr('#demo-cover-fill > .media', ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius']);
      const f = $('#demo-media-focus'), img = f.querySelector('img'), ics = getComputedStyle(img);
      out.focus = { fb: r(f), ib: r(img), fit: ics.objectFit, pos: ics.objectPosition };
      out.imgs = [...document.querySelectorAll('#demo-covers .media, #demo-cover-line .media')].map(m => { const a = r(m), b = r(m.querySelector('img')); return Math.max(Math.abs(a.l - b.l), Math.abs(a.t - b.t), Math.abs(a.w - b.w), Math.abs(a.h - b.h)); });
      return out;
    });
    const near = (a, b, t = .5) => Math.abs(a - b) <= t, whole = v => { const m = ((v % geo.u) + geo.u) % geo.u; return m < .5 || m > geo.u - .5; };
    if (geo.covered) fails.push(`cover link: ${geo.covered} of ${geo.spots} points on the card are not the link`);
    if (!geo.btnOwn) fails.push("cover link: the card's button is under the cover, not above it");
    if (!geo.tagOwn) fails.push("cover link: the card's tag link is under the cover, not above it");
    await page.mouse.click(geo.save.x, geo.save.y);
    await page.mouse.click(geo.words.x, geo.words.y);
    const row = await page.evaluate(async () => {
      const row = document.querySelector('#cover-row-test .list-item'), link = row.querySelector('.list-link'), btn = row.querySelector('button'), words = row.querySelector('.t-xs');
      row.scrollIntoView({ block: 'center' }); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const mid = e => { const b = e.getBoundingClientRect(); return { x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 }; };
      const at = p => { const e = document.elementFromPoint(p.x, p.y); return e ? (e.closest('a, button') || e) : null; };
      return { covered: at(mid(words)) === link, own: at(mid(btn)) === btn, btn: mid(btn), words: mid(words) };
    });
    if (!row.covered) fails.push("cover link: a list row's second line is not its link");
    if (!row.own) fails.push("cover link: a list row's button is under its link's cover");
    await page.mouse.click(row.btn.x, row.btn.y);
    await page.mouse.click(row.words.x, row.words.y);
    const hits = await page.evaluate(() => window.__coverHits.join(' '));
    if (hits !== 'button card-link button list-link') fails.push(`cover link: real clicks on the button, the words, the row's button and the row's words went to "${hits}", not "button card-link button list-link"`);
    if (geo.imgs.some(d => d > .5)) fails.push(`cover image: an image does not fill its frame (off by ${Math.max(...geo.imgs).toFixed(2)}px)`);
    const fo = geo.focus;
    if (fo.fit !== 'cover' || fo.pos !== '50% 25%') fails.push(`cover image: object-fit ${fo.fit} at ${fo.pos}, not cover at the focal point 50% 25%`);
    if (!near(fo.fb.w, 8 * geo.u) || !near(fo.fb.h, 10 * geo.u)) fails.push(`cover image: a frame of 8 by 10 cells is ${fo.fb.w.toFixed(2)} by ${fo.fb.h.toFixed(2)}px`);
    const meets = (n, f, sides) => { const off = sides.filter(s => !near(f.mb[s], f.b[s])); if (off.length) fails.push(`cover image: the ${n} does not meet its card's ${off.join(', ')} edge (${off.map(s => `${f.mb[s].toFixed(2)} against ${f.b[s].toFixed(2)}`).join('; ')})`); };
    meets('banner', geo.banner, ['l', 't', 'r']); meets('strip', geo.strip, ['l', 't', 'b']); meets('full bleed', geo.fill, ['l', 't', 'r', 'b']);
    const corners = (n, f, takes) => takes.forEach((t, i) => { if ((f.radii[i] === f.cr) !== t) fails.push(`cover image: the ${n}'s corner ${i + 1} is ${f.radii[i]}; the card's is ${f.cr}, and it should ${t ? '' : 'not '}take it`); });
    corners('banner', geo.banner, [true, true, false]); corners('strip', geo.strip, [true, true, false]); corners('full bleed', geo.fill, [true, true, true]);
    if (!near(geo.strip.mb.w, 3 * geo.u)) fails.push(`cover image: the strip is ${geo.strip.mb.w.toFixed(2)}px wide, not three cells`);
    if (!whole(geo.banner.mb.h)) fails.push(`cover image: the banner is ${geo.banner.mb.h.toFixed(2)}px tall, not whole cells`);
    if (!/^(transparent|rgba\(0, 0, 0, 0\))$/.test(geo.fill.border)) fails.push(`cover image: a full-bleed card still draws its edge (${geo.fill.border})`);
    // The focus ring, from the keyboard: Tab from a field just before the card
    // lands on its link, and the ring is drawn by the cover, round the card.
    // WebKit leaves links out of Tab (as Safari does by default), so there the
    // link is given a tabindex for the test.
    await page.evaluate(wk => {
      const before = document.createElement('input'); before.className = 'input';
      const card = document.getElementById('demo-cover-banner'); card.before(before); before.focus();
      if (wk) card.querySelector('.card-link').tabIndex = 0;
    }, engine === 'webkit');
    await page.keyboard.press('Tab');
    const fr = await page.evaluate(() => {
      const card = document.getElementById('demo-cover-banner'), link = card.querySelector('.card-link'), cs = getComputedStyle(link, '::before');
      const focusColor = (() => { const p = document.createElement('i'); p.style.color = 'var(--focus)'; card.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; })();
      const out = { focused: document.activeElement === link, visible: link.matches(':focus-visible'), style: cs.outlineStyle, width: parseFloat(cs.outlineWidth), color: cs.outlineColor, focusColor, own: getComputedStyle(link).outlineStyle, pos: cs.position, inset: [cs.top, cs.left, cs.right, cs.bottom].join(' '), parent: link.offsetParent === card };
      card.previousElementSibling.remove(); link.removeAttribute('tabindex'); link.blur();
      return out;
    });
    if (!fr.focused || !fr.visible) fails.push(`cover link: the card's link did not take a visible focus (focused ${fr.focused}, focus-visible ${fr.visible})`);
    else {
      if (fr.style !== 'solid' || !(fr.width > 0) || fr.color !== fr.focusColor) fails.push(`cover link: the card's focus ring is ${fr.style} ${fr.width}px ${fr.color}, not the focus color ${fr.focusColor}`);
      if (fr.own !== 'none') fails.push('cover link: the link draws a ring round its words as well as the card');
      if (fr.pos !== 'absolute' || fr.inset !== '0px 0px 0px 0px' || !fr.parent) fails.push(`cover link: the ring is not drawn round the card (${fr.pos}, inset ${fr.inset}, the card ${fr.parent ? '' : 'not '}its box)`);
    }
    await page.evaluate(() => { document.removeEventListener('click', window.__coverClick, true); document.getElementById('cover-row-test').remove(); });
  }

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
  // Floats past the cap (D111): at the reader's largest text size (312%) the
  // specimen's options cards grow with their type, in whole cells, up to the
  // screen less its margins: no sideways scroll, inside the screen, and no
  // label cut off where its row fits the screen. At default sizes the card is
  // --options-w exactly (16 cells), checked above with the knobs.
  {
    const ax = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: touch ? 3 : 1, isMobile: touch, hasTouch: touch });
    // FONT=Verdana (or Georgia) sets every family to a wider face, as a runner's fonts can be.
    await ax.addInitScript(font => {
      const set = () => {
        if (!document.documentElement) return false;
        const s = document.documentElement.style; s.fontSize = '312%';
        if (font) ['--font-sans', '--font-serif', '--font-heading', '--font-mono'].forEach(v => s.setProperty(v, font));
        return true;
      };
      if (!set()) new MutationObserver((m, o) => { if (set()) o.disconnect(); }).observe(document, { childList: true });
    }, process.env.FONT || '');
    await ax.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
    await ready(ax);
    fails.push(...await ax.evaluate(async () => {
      const fails = [], u = Trellis.cell(), root = document.documentElement, vw = root.clientWidth;
      const whole = v => { const m = ((v % u) + u) % u; return m < .5 || m > u - .5; };
      const check = (card, name) => {
        // Its laid-out width and place, not its drawn box: a float opens from 98% scale, and a slow runner measures it mid-way.
        const b = card.getBoundingClientRect(), cs = getComputedStyle(card), w16 = u * 16, lw = parseFloat(cs.width), mid = (b.left + b.right) / 2;
        const r = { width: lw, left: mid - lw / 2, right: mid + lw / 2 };
        if (!whole(r.width)) fails.push(`312%: ${name} is ${r.width.toFixed(1)}px wide, not whole cells`);
        if (r.width < w16 - .5) fails.push(`312%: ${name} is narrower than its 16 cells`);
        if (r.left < -.5 || r.right > vw + .5) fails.push(`312%: ${name} runs off the screen (${r.left.toFixed(0)} to ${r.right.toFixed(0)} of ${vw})`);
        if (card.scrollWidth > card.clientWidth + 1) fails.push(`312%: ${name} scrolls sideways`);
        const room = round => Math.floor(round / u) * u;
        const capped = r.width >= room(vw - u) - .5 || r.width >= card.parentElement.getBoundingClientRect().width - .5;
        card.querySelectorAll('.options-card-item .button-label').forEach(l => {
          const range = document.createRange(); range.selectNodeContents(l);
          const need = range.getBoundingClientRect().width, has = l.getBoundingClientRect().width;
          if (need > has + 1 && !capped) fails.push(`312%: "${l.textContent}" in ${name} is cut off (${need.toFixed(0)}px of words in ${has.toFixed(0)}px) though the card could grow`);
        });
        if (getComputedStyle(root).fontSize === '16px') fails.push('312%: the text size was not set');
        return r.width;
      };
      const inline = document.querySelector('.options-card.settle[role="listbox"]');
      inline.scrollIntoView({ block: 'center' }); await Trellis.settled();
      const w = check(inline, 'the inline options card');
      if (w < u * 16 + .5 && inline.parentElement.getBoundingClientRect().width > u * 17) fails.push('312%: the inline options card did not grow with its type');
      const menu = document.getElementById('roles-menu'), btn = document.querySelector('[data-roles]');
      btn.scrollIntoView({ block: 'center' }); await Trellis.settled();
      // Placed: float.js has written its position (a slow runner takes longer than a PC).
      btn.click();
      for (let t = 0; t < 40 && !(menu.matches(':popover-open') && menu.style.getPropertyValue('--float-x')); t++) await new Promise(r => setTimeout(r, 100));
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (!menu.matches(':popover-open')) fails.push('312%: the Roles menu did not open');
      else check(menu, 'the Roles menu');
      if (root.scrollWidth > vw + 1) fails.push(`312%: the page scrolls sideways (${root.scrollWidth} of ${vw})`);
      return fails;
    }));
    await ax.close();
  }
  await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]); // WebKit on Windows can hang on close
  console.log(`${engine} ${size}${touch ? ' touch' : ''}: layout ${fails.length ? fails.length + ' FAILED' : 'ok'}`);
  fails.forEach(f => console.log('  ' + f));
  process.exit(fails.length ? 1 : 0);
})();
