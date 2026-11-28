// Trellis · layout behavior test
// What a position check can't see: that each layout responds and behaves.
//   list    a row is whole cells; its rule adds no height; it steps out a cell;
//           a .list-mark centers its mark on the first line's capitals, one
//           line or several; --list-align: center centers a row's parts
//   rows    a row centers its words in the space it takes (D121): as far from
//           its top to the first line's capitals as from the last baseline to
//           its bottom, in a plain, a dense and a grouped list, in a card and
//           in a board, with a mark, a face, an end, wrapped and selected; a
//           dense row's lines half a cell apart; the mark on the first line
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
//           click on the words; a prose task's box on its first line; at 340%
//           text a wrapped label is marked and its lines clear each other
//   forced  in forced colors, current and selected marks, the switch, dots,
//           badges and avatar rings still draw
//   ring    a ring dot keeps the dot's box, its line a quarter of the dot and
//           two lines at most, clear inside unless it is given a fill
//   stages  a stage's dot is its fill, its ring its ink, its tag tinted from it
//   seeds   a product's own color: its tag, its dot and ring, a part of the app's
//           own and a button given its variables, in both themes, on a pale, a
//           deep, a middling, a white and a black one: words in its ink and the
//           label on its solid fill read at 4.5:1; a disabled button keeps its
//           look; in forced colors the dot and the ring still draw
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
//           take its corners; on a full bleed, in both themes, a control with
//           no fill of its own reads on the scrim, at rest, hovered, pressed
//           and focused, and one with a fill, or on a surface, is untouched
//   slots   a field with something in its box (D116): the box is the input's in
//           every state; every point of it is the control but a button's own;
//           words half a cell off the slots, right to left too; the browser's
//           spinner and clear between them; one ring; a unit level with its
//           value; the same at 312%
//   invalid the edge of an invalid input, select, textarea, box with slots and
//           choice is the alert's under the pointer too, in both themes
//   ckcard  a whole card that is a choice (D116): every point its label's but
//           its own controls'; the keyboard; chosen, mixed, invalid, disabled;
//           the one ring; the inks on a lit card, at three levels, in both
//           themes; forced colors; whole cells at 312%
//   tile    a member tile's cluster is no wider than its tile
//   gaps    a shell keeps a column for an aside only when it has one; the
//           column's brand is not in the tab bar; prose in a bubble that
//           shrinks to its content has a width; a message keeps the line
//           breaks it was typed with, and a bubble of markup does not (D112)
//   controls (D115) a button's kinds and its outline, a quiet tag: the label as
//           drawn on every ground in both themes, hovered, pressed, focused,
//           disabled and selected, on a full bleed and in forced colors; a count
//           on an icon button's corner, at every size and at 312% text; a bar's
//           ground and blur, and the words on it over black and over white; the
//           face for code and a dense card's corner as knobs
//   icons   (D118) what each kind of drawing draws, as an amount of ink: strokes
//           at each weight, outlined files, dots, tones, stroke icons as they
//           were, pictures, a mirror; their color, size and knob; forced colors
// Usage: node layout.js <url> [webkit] [WxH] [touch]
// Needs Playwright (PLAYWRIGHT=module path). Exits 1 if anything is off.
const pw = require(process.env.PLAYWRIGHT || 'playwright');
const ready = require('./ready');
const chromium = require('./chromium');

(async () => {
  const [url, engine = 'chromium', size = '1440x900', touchFlag] = process.argv.slice(2);
  if (!url) { console.error('usage: node layout.js <url> [webkit] [WxH] [touch]'); process.exit(2); }
  const [width, height] = size.split('x').map(Number), touch = touchFlag === 'touch';
  const browser = engine === 'webkit' ? await pw.webkit.launch() : await chromium.launch(pw, touch ? 3 : 1);
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
    expect(body && Math.abs(box(body).left - box(rows[0].firstElementChild).right - u) < .6, "a row's body is not a cell after its face");
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
        + '<div class="float options-card" id="d84-opt-a"><p class="t-label options-card-heading">A</p><button class="options-card-item" type="button">A</button></div>'
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
      {
        const hd = el('opt-a').querySelector('.options-card-heading'), air = box(item('opt-a')).top - box(hd).bottom;
        expect(near(air, u / 2), `an options card's heading is ${air}px above its first item, not half a cell`);
      }
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
  // Rows (D121): a row centers its words in the space it takes. Built here, so
  // every kind of row is measured the same way in each engine: from the row's
  // top to the first line's capitals, and from the last baseline to its bottom.
  const rowFails = await page.evaluate(async () => {
    const fails = [], u = Trellis.cell(), box = e => e.getBoundingClientRect();
    const whole = v => { const m = ((v % u) + u) % u; return m < .5 || m > u - .5; };
    const base = el => { const s = document.createElement('span'); s.style.cssText = 'display: inline-block; width: 0; height: 0; vertical-align: baseline'; el.append(s); const y = box(s).top; s.remove(); return y; };
    const long = 'Sort the bean seed by year, and set aside anything older than three seasons for the germination test, so nothing tired goes on the swap table';
    const ROWS = [
      ['one line', '<div class="list-body"><p class="t-sm">Book the hall</p></div>'],
      ['two lines', '<div class="list-body"><p class="t-sm">Send the seed list</p><p class="t-xs">Spring gathering</p></div>'],
      ['wrapped', `<div class="list-body"><p class="t-sm">${long}</p><p class="t-xs">Spring gathering</p></div>`],
      ['an end', '<div class="list-body"><p class="t-sm">Evening tide</p><p class="t-xs">Tuesday</p></div><div class="list-end"><span class="t-xs">19:00</span></div>'],
      ['marks', `<span class="list-mark t-sm"><span class="dot cc-accent"></span></span><div class="list-body"><p class="t-sm">${long}</p></div><div class="list-end"><span class="list-mark t-sm"><span class="avatar cc-plain" style="--av-n: 1.5">AO</span></span></div>`],
      ['a mark, two lines', '<span class="list-mark t-sm"><span class="dot cc-ok"></span></span><div class="list-body"><p class="t-sm">Label the drying racks</p><p class="t-xs">One tag a tray</p></div>'],
      ['a face', '<span class="avatar cc-sm">JB</span><div class="list-body"><p class="t-sm">Jonah Baptiste</p></div><div class="list-end"><span class="t-xs">Yesterday</span></div>'],
      ['a face and a pair', '<span class="avatar cc-md cc-plain">FS</span><div class="list-body"><div class="pair"><p class="t-sm">Food Systems</p><p class="t-xs">You: Friday works</p></div></div><div class="list-end"><span class="t-xs">Mon</span></div>'],
      ['a face, three lines', `<span class="avatar cc-sm">MV</span><div class="list-body"><p class="t-sm">Marisol Vega</p><p class="t-xs">${long}</p></div><div class="list-end"><span class="t-xs">2m</span></div>`],
    ];
    const list = cls => `<ul class="list ${cls}">` + ROWS.map(([k, h], i) => `<li class="list-item" data-k="${k}"${i === 1 ? ' aria-current="true"' : ''}>${h}</li>`).join('') + '</ul>';
    const host = document.createElement('div');
    host.className = 'stack'; host.id = 'rows-d121';
    host.innerHTML = `<div style="--outset: 0; inline-size: calc(var(--u) * 32); max-inline-size: 100%">${list('')}${list('cc-dense')}${list('cc-group')}<div class="card">${list('')}</div></div>`
      + `<div class="board" tabindex="0" role="group" aria-label="Rows"><div class="board-lane">${list('cc-group')}<article class="card">${list('cc-dense')}</article></div></div>`;
    document.getElementById('demo-list').parentElement.appendChild(host);
    await Trellis.settled();
    const cap = (() => { const p = document.createElement('div'); p.className = 'row'; p.innerHTML = '<span class="t-sm cap-center">X</span>'; host.appendChild(p); const h = box(p.firstElementChild).height; p.remove(); return h; })();
    let n = 0;
    host.querySelectorAll('.list').forEach(l => {
      const where = [l.className.replace('list', '').trim() || 'plain', l.closest('.board') ? 'in a board' : l.closest('.card') ? 'in a card' : ''].filter(Boolean).join(' ');
      l.querySelectorAll(':scope > .list-item').forEach(r => {
        n++;
        const k = `${where}, ${r.dataset.k}`, R = box(r), words = [...r.querySelectorAll('.list-body p')];
        const first = box(words[0]), last = words.at(-1), above = first.top - R.top, below = R.bottom - base(last);
        if (!whole(R.height)) fails.push(`rows: ${k}: the row is ${R.height.toFixed(2)}px, not whole cells`);
        // No taller than its tallest part rounded up once, between its padding.
        const pad = parseFloat(getComputedStyle(r).paddingTop), tall = Math.max(...[...r.children].map(c => box(c).height));
        if (Math.abs(R.height - 2 * pad - Math.ceil((tall - .04) / u) * u) > .5) fails.push(`rows: ${k}: the row is ${R.height.toFixed(2)}px, where its tallest part, ${tall.toFixed(2)}px, rounds up to ${(2 * pad + Math.ceil((tall - .04) / u) * u).toFixed(2)}px`);
        if (Math.abs(above - below) > .5) fails.push(`rows: ${k}: ${above.toFixed(2)}px over its words and ${below.toFixed(2)}px under them, not centered`);
        r.querySelectorAll('.list-mark').forEach(m => { const d = (box(m.firstElementChild).top + box(m.firstElementChild).bottom) / 2 - (first.top + cap / 2); if (Math.abs(d) > .6) fails.push(`rows: ${k}: a mark is ${d.toFixed(2)}px off its first line's capitals`); });
        const end = r.querySelector('.list-end > .t-xs');
        if (end && Math.abs(box(end).top - first.top) > .6) fails.push(`rows: ${k}: its end is ${(box(end).top - first.top).toFixed(2)}px off its first line`);
        const face = r.querySelector(':scope > .avatar');
        if (face && Math.abs(box(face).top - R.top - parseFloat(getComputedStyle(r).paddingTop)) > .6) fails.push(`rows: ${k}: its face is not at the row's top`);
        if (r.dataset.k === 'two lines') {
          const gap = box(words[1]).top - base(words[0]), want = l.matches('.cc-dense') ? u / 2 : u;
          if (Math.abs(gap - want) > .6) fails.push(`rows: ${k}: its lines are ${gap.toFixed(2)}px apart, not ${want === u ? 'a cell' : 'half a cell'}`);
        }
      });
    });
    if (n !== 6 * ROWS.length) fails.push(`rows: measured ${n} rows, not ${6 * ROWS.length}`);
    host.remove();
    return fails;
  });
  fails.push(...rowFails);

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
    // Its rule is the row's own, from the body's column to the surface's edge (D121).
    const rule = e => getComputedStyle(e, '::after');
    if (rule(rows[0]).content === 'none' || rule(rows[0]).gridColumnStart !== '1' || rule(rows[0]).position !== 'absolute') fails.push('a grouped row has no rule from its body');
    if (rule(rows[rows.length - 1]).content !== 'none') fails.push('the last grouped row has a rule');
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

  // Speech (D122): a bubble is a shaped ground with no edge, so no message reads as
  // a button. Rounder than a control, the top corner on the speaker's side square
  // on the first of a run and round after it, in both directions of writing; a
  // faint ground, everyone's and your own, under which the text, its second ink
  // and its third read at 4.5:1 as drawn, in both themes, on the page and on a
  // card and a card in a card; nothing on a wall, a system line, a flat row or a
  // removed message's ground. The product's knobs reach it: the corner, the
  // padding, the washes, and the three a product may have set before (D99).
  fails.push(...await page.evaluate(async () => {
    const bad = [], expect = (ok, msg) => { if (!ok) bad.push(msg); };
    const px = (...cs) => { const c = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }), g = c.getContext('2d', { willReadFrequently: true }); cs.forEach(v => { g.fillStyle = v; g.fillRect(0, 0, 1, 1); }); return [...g.getImageData(0, 0, 1, 1).data]; };
    const lum = p => { const f = p.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * f[0] + .7152 * f[1] + .0722 * f[2]; };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const item = (id, cls, inner = 'Yes, with a note.') => `<div class="chat-item ${cls}" id="${id}"><span class="avatar cc-sm" aria-hidden="true">A</span><div class="chat-item-body"><p class="chat-item-meta t-xs"><span>Ada</span><time>9:41</time></p><div class="chat-item-bubble t-sm">${inner} <span class="chat-edited">(edited)</span> <span class="u-text-secondary">second</span></div></div></div>`;
    const thread = (p) => `<div class="chat-thread">${item(p + 'first', '')}${item(p + 'cont', 'cc-cont')}${item(p + 'own', 'cc-own')}${item(p + 'own-cont', 'cc-own cc-cont')}${item(p + 'wall', 'cc-wall')}${item(p + 'system', 'cc-system')}${item(p + 'flat', 'cc-flat')}${item(p + 'gone', 'cc-removed')}</div>`;
    const host = document.createElement('div');
    host.style.cssText = 'position: absolute; inset: 0 auto auto 0; width: calc(var(--u) * 40);';
    host.innerHTML = ['light', 'dark'].map(t => `<div data-product="speech-${t}" data-theme="${t}" style="background: var(--bg)">${thread(t + '-page-')}<div class="card">${thread(t + '-card-')}<div class="card">${thread(t + '-nest-')}</div></div></div>`).join('')
      + `<div dir="rtl">${thread('rtl-')}</div><div class="cc-dense">${thread('dense-')}</div>`
      + `<div class="knobs-old" style="--chat-own-bg: var(--accent); --chat-own-ink: var(--accent-ink); --chat-bubble-edge: var(--border)">${thread('old-')}</div>`
      + `<div style="--chat-shape: 0px; --chat-bubble-pad: var(--sp-2); --chat-bubble-wash: 0%; --chat-own-wash: 0%">${thread('knob-')}</div>`
      + `<div style="--chat-bubble-bg: var(--ok); --chat-own-bg: color-mix(in oklab, var(--alert) 50%, transparent)">${thread('over-')}</div>`;
    document.body.appendChild(host);
    await Trellis.settled();
    const b = id => document.querySelector(`#${id} .chat-item-bubble`), cs = id => getComputedStyle(b(id));
    const probe = document.createElement('i'); host.appendChild(probe);
    const len = v => { probe.style.width = v; const w = getComputedStyle(probe).width; return parseFloat(w); };
    const R = len('var(--r-1h)'), R1 = len('var(--r-1)'), PAD = len('var(--sp-1)'), PAD2 = len('var(--sp-2)');
    const corners = id => { const s = cs(id); return [s.borderStartStartRadius, s.borderStartEndRadius, s.borderEndEndRadius, s.borderEndStartRadius].map(parseFloat); };
    const want = (id, c, what) => { const got = corners(id); expect(got.every((v, i) => Math.abs(v - c[i]) < .5), `speech: ${what} has corners ${got.join(', ')} (start-start, start-end, end-end, end-start), not ${c.join(', ')}`); };
    want('light-page-first', [0, R, R, R], 'the first of others\' run');
    want('light-page-cont', [R, R, R, R], 'a later message in others\' run');
    want('light-page-own', [R, 0, R, R], 'the first of your run');
    want('light-page-own-cont', [R, R, R, R], 'a later message in your run');
    const phys = s => [s.borderTopLeftRadius, s.borderTopRightRadius].map(parseFloat);
    expect(phys(cs('rtl-first'))[1] < .5 && phys(cs('rtl-first'))[0] > R - .5, `speech: right to left, the first of others' run squares its top ${phys(cs('rtl-first'))[1] < .5 ? '' : 'right '}corner wrongly: top-left ${phys(cs('rtl-first'))[0]}, top-right ${phys(cs('rtl-first'))[1]}`);
    expect(phys(cs('rtl-own'))[0] < .5 && phys(cs('rtl-own'))[1] > R - .5, `speech: right to left, your own first message squares the wrong top corner: top-left ${phys(cs('rtl-own'))[0]}, top-right ${phys(cs('rtl-own'))[1]}`);
    want('dense-cont', [R1, R1, R1, R1], 'a bubble in .cc-dense');
    want('knob-cont', [0, 0, 0, 0], 'a bubble with --chat-shape at 0');
    for (const id of ['light-page-first', 'light-page-own', 'dark-page-first', 'dark-page-own']) {
      const s = cs(id);
      expect(s.outlineStyle === 'none' || px(s.outlineColor)[3] === 0 || parseFloat(s.outlineWidth) === 0, `speech: ${id} draws an edge, ${s.outlineColor}`);
      expect(Math.abs(parseFloat(s.paddingTop) - PAD) < .5 && Math.abs(parseFloat(s.paddingInlineStart) - PAD) < .5, `speech: ${id}'s padding is ${s.paddingTop}, not a cell`);
    }
    // The ground as drawn: its color under the (transparent) layer laid over it, over its surface.
    const ground = (id) => { const s = cs(id), img = s.backgroundImage, m = img.match(/(?:rgba?|oklab|oklch|color)\([^()]*(?:\([^()]*\)[^()]*)*\)/), under = getComputedStyle(b(id).closest('.card, [data-product], body')).backgroundColor; return px(under, s.backgroundColor, m ? m[0] : 'transparent'); };
    const ink = (id, sel) => px(getComputedStyle(sel ? b(id).querySelector(sel) : b(id)).color);
    for (const t of ['light', 'dark']) for (const where of ['page', 'card', 'nest']) for (const who of ['first', 'own']) {
      const id = `${t}-${where}-${who}`, g = ground(id), under = px(getComputedStyle(b(id).closest('.card, [data-product]')).backgroundColor);
      expect(px(cs(id).backgroundColor)[3] === 255, `speech: ${id}'s ground is not opaque: ${cs(id).backgroundColor}`);
      for (const [what, sel] of [['its words', null], ['its second ink', '.u-text-secondary'], ['its third ink', '.chat-edited']]) {
        const r = ratio(ink(id, sel), g);
        expect(r >= 4.5, `speech: ${what} on ${id}'s ground read at ${r.toFixed(2)}:1, under 4.5`);
      }
      // Faint: a ground, not a fill. Against what it stands on it is under 1.6:1, where a solid accent is far over.
      const r = ratio(g, under);
      expect(r > 1.02 && r < 1.6, `speech: ${id}'s ground is ${r.toFixed(2)}:1 against what it stands on: ${r <= 1.02 ? 'no ground' : 'a fill, not a faint ground'}`);
    }
    expect(px(cs('light-page-own').backgroundColor).join() !== px(cs('light-page-first').backgroundColor).join(), 'speech: your own ground is the same as others\'');
    for (const id of ['light-page-wall', 'light-page-system', 'light-page-flat', 'light-page-gone']) {
      const under = px(getComputedStyle(b(id).closest('.card, [data-product]')).backgroundColor);
      expect(ground(id).join() === under.join(), `speech: ${id} has a ground: ${cs(id).backgroundColor} ${cs(id).backgroundImage}`);
    }
    expect(cs('light-page-gone').outlineStyle === 'dashed', `speech: a removed message lost its dashed edge: ${cs('light-page-gone').outlineStyle}`);
    // A removed message's words, and the third ink on a ground of no bubble, stay the third.
    const roleIn = (el, v) => { const i = document.createElement('i'); i.style.color = `var(--${v})`; el.appendChild(i); const c = px(getComputedStyle(i).color); i.remove(); return c; };
    const thread0 = b('light-page-gone').closest('.chat-thread');
    expect(ink('light-page-gone').join() === roleIn(thread0, 'text-tertiary').join(), `speech: a removed message's words are ${ink('light-page-gone')}, not the third ink`);
    expect(ink('light-page-flat', '.chat-edited').join() === roleIn(thread0, 'text-tertiary').join(), 'speech: "(edited)" in a flat row is not the third ink');
    // The knobs a product may have set before (D99) still reach the bubble.
    const oldOwn = document.querySelector('.knobs-old');
    expect(ground('old-own').join() === roleIn(oldOwn, 'accent').join(), `speech: --chat-own-bg set to the accent paints ${ground('old-own')}, not the accent ${roleIn(oldOwn, 'accent')}`);
    expect(ink('old-own').join() === roleIn(oldOwn, 'accent-ink').join(), `speech: --chat-own-ink no longer reaches your own words`);
    expect(px(cs('old-first').outlineColor).join() === roleIn(oldOwn, 'border').join() && cs('old-first').outlineStyle === 'solid', `speech: --chat-bubble-edge draws ${cs('old-first').outlineColor}, not the edge it names`);
    expect(Math.abs(parseFloat(cs('knob-first').paddingTop) - PAD2) < .5, `speech: --chat-bubble-pad does not reach the bubble: ${cs('knob-first').paddingTop}`);
    for (const id of ['knob-first', 'knob-own']) expect(ratio(ground(id), px(getComputedStyle(document.body).backgroundColor)) < 1.01, `speech: with its wash at 0% ${id} still has a ground`);
    expect(ground('over-first').join() === roleIn(b('over-first'), 'ok').join(), `speech: --chat-bubble-bg does not replace others' ground: ${ground('over-first')}`);
    const half = ground('over-own'), wash = (() => { const s = cs('over-own'); return px(getComputedStyle(document.body).backgroundColor, s.backgroundColor); })();
    expect(half.join() !== wash.join(), 'speech: a translucent --chat-own-bg is not laid over your own wash');
    host.remove();
    return bad;
  }));

  // Speech in forced colors (D122). The system draws every outline in its text
  // color, a transparent one too. A bubble with a ground keeps its edge there, so
  // it is still a shape; a bubble that is no bubble (a wall post, a system line,
  // a flat row, removed or not, and a wall's quote) draws none, since its box is
  // trimmed to its capitals and an edge on it runs through its words.
  await page.emulateMedia({ forcedColors: 'active' });
  fails.push(...await page.evaluate(async () => {
    if (!matchMedia('(forced-colors: active)').matches) return [];
    const bad = [], host = document.createElement('div');
    host.style.cssText = 'position: absolute; inset: 0 auto auto 0; width: calc(var(--u) * 30);';
    const item = (cls, inner = '<div class="chat-item-bubble t-sm">Yes, with a note, judging the gypsy beans.</div>') => `<div class="chat-item ${cls}"><span class="avatar cc-sm" aria-hidden="true">A</span><div class="chat-item-body"><p class="chat-item-meta t-xs"><span>Ada</span><time>9:41</time></p>${inner}</div></div>`;
    const quote = '<a class="chat-quote" href="#"><span class="chat-quote-author t-xs">Ada</span><span class="chat-quote-text t-xs">Is the swap table on?</span></a>';
    host.innerHTML = `<div class="chat-thread">${item('', '')}${['', 'cc-own', 'cc-cont', 'cc-removed', 'cc-own cc-removed'].map((c) => item(c)).join('')}</div>`
      + `<div class="chat-thread">${['cc-wall', 'cc-system', 'cc-wall cc-removed'].map((c) => item(c)).join('')}${item('cc-wall', quote + '<div class="chat-item-bubble t-sm">Yes.</div>')}</div>`
      + `<div class="chat-thread cc-flat">${['', 'cc-own', 'cc-cont', 'cc-removed', 'cc-system'].map((c) => item(c)).join('')}</div>`;
    document.body.appendChild(host);
    await Trellis.settled();
    for (const b of host.querySelectorAll('.chat-item-bubble, .chat-quote, .chat-quote-text')) {
      const s = getComputedStyle(b), it = b.closest('.chat-item'), what = `${it.className.replace('chat-item', '').trim() || 'a plain'}${it.closest('.cc-flat') ? ' flat' : ''} ${b.className.split(' ')[0]}`;
      const drawn = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
      const r = document.createRange(); r.selectNodeContents(b); const ink = r.getBoundingClientRect(), box = b.getBoundingClientRect(), off = parseFloat(s.outlineOffset) || 0;
      const lines = [box.top - off - parseFloat(s.outlineWidth), box.bottom + off];
      if (drawn && lines.some((y) => y > ink.top + 2 && y < ink.bottom - 2)) bad.push(`speech: in forced colors ${what} draws an edge through its words (${s.outlineStyle} at ${lines.map((y) => (y - ink.top).toFixed(1)).join(' and ')}px into ${ink.height.toFixed(1)}px of text)`);
      const ground = b.classList.contains('chat-item-bubble') && !it.closest('.cc-flat') && !/cc-(wall|system)/.test(it.className);
      if (ground && !drawn) bad.push(`speech: in forced colors ${what} lost its edge: ${s.outlineStyle} ${s.outlineWidth}`);
    }
    host.remove();
    return bad;
  }));
  await page.emulateMedia({ forcedColors: 'none' });

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
  // A product's own colors (D117): a scope names them, an element takes one, and
  // every part of it reads. The button is the documented recipe: the --btn-*
  // variables, set from the app's own class.
  {
    const bad = await page.evaluate(() => {
      const fails = [], host = document.createElement('div'), sheet = document.createElement('style');
      sheet.textContent = '#l-seeds * { transition: none !important; } .l-seed-btn:not(:disabled, [aria-disabled="true"]) { --btn-bg: var(--seeded-solid); --btn-border: var(--seeded-solid); --btn-ink: var(--seeded-solid-ink); } .l-seed-part { background: var(--seeded-tint); color: var(--seeded-ink); } .l-seed-two { --first: var(--seeded); } .l-seed-mix { background: linear-gradient(var(--first), var(--seeded)); }';
      document.head.appendChild(sheet);
      host.id = 'l-seeds';
      host.setAttribute('data-product', 'seed-test');
      const COLORS = { gold: '#c09642', pale: '#fff3c0', deep: '#14104a', mid: 'oklch(.6 .25 330)', band: 'oklch(.585 .02 90)', white: '#ffffff', black: '#000000' };
      for (const k in COLORS) host.style.setProperty('--seed-own-' + k, COLORS[k]);
      const row = k => { const s = `style="--seed: var(--seed-own-${k})"`;
        return `<div data-k="${k}"><span class="tag cc-seed" ${s}><span class="tag-dot"></span><span class="tag-label">n</span></span><span class="tag cc-seed cc-solid" ${s}><span class="tag-label">n</span></span><button class="tag cc-seed" aria-pressed="true" ${s}><span class="tag-label">n</span></button><span class="dot cc-seed" ${s}></span><span class="dot cc-ring cc-seed" ${s}></span><span class="u-seed l-seed-part" ${s}>n</span><button class="button u-seed l-seed-btn" ${s}>n</button><button class="button u-seed l-seed-btn" disabled ${s}>n</button><span class="u-seed" ${s}><i></i></span><button class="button" disabled>n</button><span class="tag cc-outline cc-seed" ${s}><span class="tag-label">n</span></span><button class="tag cc-seed" ${s}><span class="tag-label">n</span></button></div>`; };
      host.innerHTML = Object.keys(COLORS).map(row).join('') + '<div data-none><span class="tag cc-seed"><span class="tag-label">n</span></span><span class="tag" style="--tag-color: var(--accent)"><span class="tag-label">n</span></span></div>'
        + '<div class="u-seed" data-round style="--seed: var(--seed-own-gold)"><span class="tag cc-seed"><span class="tag-label">n</span></span><span class="dot cc-seed"></span></div>'
        + '<div class="u-seed l-seed-two" style="--seed: var(--seed-own-gold)"><div class="u-seed l-seed-mix" style="--seed: var(--seed-own-deep)"></div><i></i></div>'
        + '<div data-product="seed-inner" style="--seed-own-gold: #2f6db5"><span class="dot cc-seed" style="--seed: var(--seed-own-gold)"></span></div>';
      document.body.appendChild(host);
      const cs = e => getComputedStyle(e);
      const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      const px = (c, over) => { ctx.clearRect(0, 0, 1, 1); if (over) { ctx.fillStyle = over; ctx.fillRect(0, 0, 1, 1); } ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
      const same = (a, b) => px(a).every((v, i) => Math.abs(v - px(b)[i]) <= 1);
      const lum = p => { const [r, g, b] = p.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * r + .7152 * g + .0722 * b; };
      const con = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
      for (const theme of ['light', 'dark']) {
        host.setAttribute('data-theme', theme);
        const role = (v, el) => { const i = el.querySelector('i') || host; i.style.color = `var(${v})`; const c = cs(i).color; i.style.color = ''; return c; };
        const M = window.TrellisMath, grounds = ['--bg', '--bg-raised', '--bg-raised-2', '--bg-raised-3'].map(v => [v, role(v, host)]);
        for (const el of host.querySelectorAll('[data-k]')) {
          const k = el.dataset.k, [tag, solid, pressed, dot, ring, part, btn, off, probe, plainOff, outline, rest] = el.children, at = `seeds: ${k}, ${theme}: `;
          const [fill, ink, tint, full, label] = ['--seeded', '--seeded-ink', '--seeded-tint', '--seeded-solid', '--seeded-solid-ink'].map(v => role(v, probe));
          const is = (a, b, what) => { if (!same(a, b)) fails.push(at + `${what}: ${a}, not ${b}`); };
          is(cs(dot).backgroundColor, fill, 'a dot is its fill');
          is(cs(ring).borderTopColor, ink, "a ring's line is its ink");
          is(cs(tag.firstChild).backgroundColor, fill, "a tag's dot is its fill");
          if (k !== 'white' && k !== 'black') { const p = px(cs(tag).backgroundColor); if (!(p[3] > 20 && p[3] < 60)) fails.push(at + `a tag is a tint of it: ${cs(tag).backgroundColor}`); }
          is(cs(solid).backgroundColor, full, 'a solid tag is its solid fill');
          is(cs(solid).color, label, "a solid tag's label is the ink on it");
          is(cs(pressed).backgroundColor, full, 'a pressed tag is its solid fill');
          is(cs(btn).backgroundColor, full, 'a button given the recipe is its solid fill');
          is(cs(btn).color, label, "a button's label is the ink on it");
          for (const p of ['backgroundColor', 'color', 'borderTopColor']) is(cs(off)[p], cs(plainOff)[p], 'a disabled one keeps its look: ' + p);
          is(cs(part).color, ink, 'words in its ink');
          is(cs(part).backgroundColor, tint, 'a part on its tint');
          if (px(cs(outline).backgroundColor)[3] !== 0) fails.push(at + 'an outline tag has no fill');
          for (const [g, c] of grounds) { const r = con(px(ink), px(c)); if (!(r >= 4.5)) fails.push(at + `its ink on ${g} is ${r.toFixed(2)}:1`); }
          for (const [g, c] of grounds.slice(0, 3)) { const r = con(px(ink), px(tint, c)); if (!(r >= 4.5)) fails.push(at + `its ink on its tint on ${g} is ${r.toFixed(2)}:1`); }
          for (const e of [solid, pressed, btn]) { const r = con(px(cs(e).color), px(cs(e).backgroundColor)); if (!(r >= 4.5)) fails.push(at + `a label on its solid fill (${e.className}) is ${r.toFixed(2)}:1`); }
          const r = con(px(cs(rest).color), px(cs(rest).backgroundColor, grounds[1][1])); if (!(r >= 4.5)) fails.push(at + `a tag's label on its tint is ${r.toFixed(2)}:1`);
        }
        const none = host.querySelector('[data-none]').children, round = host.querySelector('[data-round]').children, gold = host.querySelector('[data-k="gold"]').children;
        if (theme === 'light' && !same(cs(none[0]).backgroundColor, cs(none[1]).backgroundColor)) fails.push('seeds: a tag that names no color is not the accent by day');
        if (!same(cs(round[0]).backgroundColor, cs(gold[0]).backgroundColor) || !same(cs(round[1]).backgroundColor, cs(gold[3]).backgroundColor)) fails.push(`seeds: ${theme}: --seed set round a tag and a dot does not reach them`);
        const deep = role('--seeded', host.querySelector('[data-k="deep"]').children[8]), two = host.querySelector('.l-seed-two');
        if (!same(role('--first', two), cs(gold[3]).backgroundColor)) fails.push(`seeds: ${theme}: a color taken by a name on a parent is not the parent's`);
        const mix = cs(two.firstChild).backgroundImage.match(/okl\w+\([^()]*\)|rgba?\([^()]*\)/g) || [];
        if (mix.length !== 2 || !same(mix[0], cs(gold[3]).backgroundColor) || !same(mix[1], deep)) fails.push(`seeds: ${theme}: two colors on one part: ${cs(two.firstChild).backgroundImage}`);
        const inner = cs(host.querySelector('[data-product="seed-inner"] > .dot')).backgroundColor;
        if (same(inner, cs(gold[3]).backgroundColor)) fails.push(`seeds: ${theme}: a scope's own gold does not reach its dot`);
        if (theme === 'light' && !same(inner, '#2f6db5')) fails.push(`seeds: a scope's own gold is ${inner}, not #2f6db5`);
      }
      return fails;
    });
    fails.push(...bad);
    await page.emulateMedia({ forcedColors: 'active' });
    fails.push(...await page.evaluate(() => {
      if (!matchMedia('(forced-colors: active)').matches) return [];
      const fails = [], cs = e => getComputedStyle(e), host = document.getElementById('l-seeds'), i = document.createElement('i');
      host.appendChild(i); i.style.cssText = 'forced-color-adjust: none; color: Canvas; background: CanvasText';
      const canvas = cs(i).color, text = cs(i).backgroundColor, [, , , dot, ring] = host.querySelector('[data-k="gold"]').children;
      if (cs(dot).backgroundColor !== text) fails.push(`seeds: in forced colors a dot is ${cs(dot).backgroundColor}`);
      if (cs(ring).borderTopColor !== text || cs(ring).backgroundColor !== canvas) fails.push(`seeds: in forced colors a ring is ${cs(ring).borderTopColor} around ${cs(ring).backgroundColor}`);
      return fails;
    }));
    await page.emulateMedia({ forcedColors: 'none' });
    await page.evaluate(() => document.getElementById('l-seeds').remove());
  }
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

  // Something in a field's box (D116). The box is the input it stands in for:
  // the same height, edge, ground, corner and ink, at rest and in each state.
  // Its control reaches every part of the box but a button, so a click on an
  // icon or a unit is a click on the field and autofill fills the box; its
  // words stay half a cell off the slots, from both sides and right to left,
  // a long unit too. A button keeps its click, its target and its own ring;
  // the box takes the one ring of its control. A unit's capitals are level
  // with the value's, read from a screenshot. A number's spinner and a
  // search's own clear button stay between the slots, and the browser's clear
  // goes when the app brings a button.
  {
    await page.evaluate(() => {
      const host = document.createElement('div'); host.id = 'slots-test'; host.className = 'stack';
      host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; z-index: 2147483647; inline-size: calc(var(--u) * 30); padding: var(--sp-2); background: var(--bg)';
      const icon = '<svg class="icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10"/></svg>';
      const btn = (k = '') => `<button class="button icon-button cc-ghost" type="button" aria-label="Act"${k}>${icon}</button>`, unit = t => `<span class="input-unit" aria-hidden="true">${t}</span>`;
      const box = (id, start, attrs, end, cls = '') => `<div class="input cc-slots ${cls}" id="${id}">${start}<input class="input-control" aria-label="${id}" ${attrs}>${end}</div>`;
      const pair = (id, cls, attrs) => `<input class="input ${cls}" id="${id}-plain" aria-label="${id}" ${attrs}>` + box(id, icon, attrs, '', cls);
      const sel = '<option>One</option><option>Two</option>';
      const all = p => box(p + 'icon', icon, 'value="Words"', '') + box(p + 'unit', unit('H'), 'value="H"', unit('a month')) + box(p + 'long', unit('https://'), 'value="Words"', unit('USD'))
        + box(p + 'search', icon, 'type="search" value="Words"', btn()) + box(p + 'lead', btn(), 'value="Words"', '') + box(p + 'over', unit('a unit far longer than its room'), 'value="Words"', '') + box(p + 'two', icon, 'value="Words"', unit('a unit') + btn())
        + box(p + 'text', '', 'value="Words"', '<button class="button cc-ghost" type="button"><span class="button-label">Show it</span></button>');
      host.innerHTML = pair('sl-rest', '', 'value="Words"') + pair('sl-sm', 'cc-sm', 'value="Words"') + pair('sl-lg', 'cc-lg', 'value="Words"')
        + pair('sl-off', '', 'value="Words" disabled') + pair('sl-ro', '', 'value="Words" readonly') + pair('sl-bad', '', 'value="Words" aria-invalid="true"') + `<div class="field">${box('sl-asked', icon, 'value="Words" aria-invalid="true"', '')}<p class="field-hint t-xs" id="sl-hint">A hint</p></div><div class="input cc-slots" id="sl-cut" style="--input-unit: 20em">${unit('https://a-long-address.example.org/with/a/path/of/its/own/')}<input class="input-control" aria-label="Cut" value="Words"></div>`
        + `<select class="input" id="sl-sel-plain" aria-label="Plain">${sel}</select><div class="input cc-slots" id="sl-sel">${icon}<select class="input-control" aria-label="Sel">${sel}</select></div>`
        + `<div class="cc-dense stack">${pair('sl-dense', '', 'value="Words"')}</div>`
        + box('sl-num', unit('$'), 'type="number" value="25"', unit('a month')) + box('sl-find', icon, 'type="search" value="Words"', '') + all('sl-')
        + box('sl-sm-btn', icon, 'value="Words"', btn(), 'cc-sm') + box('sl-lg-btn', icon, 'value="Words"', btn(), 'cc-lg')
        + `<div dir="rtl" class="stack">${all('rtl-')}<select class="input" id="rtl-sel-plain" aria-label="Plain">${sel}</select><div class="input cc-slots" id="rtl-sel">${icon}<select class="input-control" aria-label="Sel">${sel}</select></div></div>`
        + `<article class="card stack" id="sl-card"><p class="t-h6"><a class="card-link" href="#slots-test">A card that links</a></p>${box('sl-inlink', icon, 'value="Words"', btn())}</article>`;
      document.body.appendChild(host);
      window.__slots = {
        px: (...cs) => { const c = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }), g = c.getContext('2d', { willReadFrequently: true }); cs.forEach(v => { g.fillStyle = v; g.fillRect(0, 0, 1, 1); }); return [...g.getImageData(0, 0, 1, 1).data]; },
        ratio: (a, b) => { const l = p => { const f = p.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * f[0] + .7152 * f[1] + .0722 * f[2]; }; const x = l(a), y = l(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); },
        still: () => Promise.all(document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#slots-test, #card-choice-test')).map(a => a.finished.catch(() => {}))),
        theme: document.documentElement.getAttribute('data-theme'),
      };
      scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
    await page.evaluate(async () => { await Trellis.settled(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await window.__slots.still(); });
    fails.push(...await page.evaluate(() => {
      const fails = [], u = Trellis.cell(), $ = id => document.getElementById(id), r = e => e.getBoundingClientRect(), near = (a, b, t = .6) => Math.abs(a - b) < t, say = m => fails.push('field slots: ' + m);
      const coarse = matchMedia('(pointer: coarse)').matches, hit = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hit-min')) || 44;
      for (const id of ['sl-rest', 'sl-sm', 'sl-lg', 'sl-off', 'sl-ro', 'sl-bad', 'sl-sel', 'sl-dense']) {
        const b = $(id), p = $(id + '-plain'), bs = getComputedStyle(b), ps = getComputedStyle(p), c = getComputedStyle(b.querySelector('.input-control'));
        if (!near(r(b).height, r(p).height, .1) || !near(r(b).width, r(p).width, .1)) say(`${id} is ${r(b).width.toFixed(2)} by ${r(b).height.toFixed(2)}, the plain input ${r(p).width.toFixed(2)} by ${r(p).height.toFixed(2)}`);
        for (const k of ['borderTopColor', 'borderTopWidth', 'borderTopLeftRadius', 'backgroundColor', 'fontSize', 'marginBlockEnd', 'cursor']) if (bs[k] !== ps[k] && !(k === 'cursor' && ['sl-rest', 'sl-sm', 'sl-lg', 'sl-ro', 'sl-bad', 'sl-sel', 'sl-dense'].includes(id))) say(`${id}'s ${k} is ${bs[k]}, the plain input's ${ps[k]}`);
        for (const k of ['color', 'fontSize', 'fontFamily', 'lineHeight']) if (c[k] !== ps[k]) say(`${id}'s words' ${k} is ${c[k]}, the plain input's ${ps[k]}`);
        if (!/^(transparent|rgba\(0, 0, 0, 0\))$/.test(c.backgroundColor) || parseFloat(c.borderTopWidth)) say(`${id}'s control draws a box of its own`);
      }
      const alert = (() => { const i = document.createElement('i'); i.style.color = 'var(--alert)'; document.body.appendChild(i); const c = getComputedStyle(i).color; i.remove(); return c; })();
      if (getComputedStyle($('sl-bad')).borderTopColor !== alert || getComputedStyle($('sl-hint')).color !== alert) say('an invalid control does not turn its box and its hint to the alert');
      if (getComputedStyle($('sl-off')).borderTopColor === getComputedStyle($('sl-rest')).borderTopColor || getComputedStyle($('sl-ro')).backgroundColor === getComputedStyle($('sl-rest')).backgroundColor) say('disabled or read-only is drawn as at rest, so nothing was proved');
      const bg = e => getComputedStyle(e).backgroundPositionX;
      if (bg($('sl-sel').querySelector('select')) !== bg($('sl-sel-plain'))) say(`a select's chevron is at ${bg($('sl-sel').querySelector('select'))}, a plain one's at ${bg($('sl-sel-plain'))}`);
      for (const s of [$('rtl-sel-plain'), $('rtl-sel').querySelector('select')]) if (/right|100%/.test(bg(s))) say(`right to left, a select's chevron is at ${bg(s)}, over its words`);
      const ends = s => parseFloat(getComputedStyle(s).paddingLeft);
      if (parseFloat(getComputedStyle($('sl-sel').querySelector('select')).paddingRight) < 2.5 * u) say('a select in a box keeps no room for its chevron');
      if (ends($('rtl-sel').querySelector('select')) < 2.5 * u || ends($('rtl-sel-plain')) < 2.5 * u) say('right to left, a select keeps no room for its chevron');
      for (const b of document.querySelectorAll('#slots-test .cc-slots')) {
        const id = b.id, c = b.querySelector('.input-control'), cs = getComputedStyle(c), rb = r(b), rc = r(c), line = parseFloat(getComputedStyle(b).borderTopWidth), rtl = cs.direction === 'rtl';
        const isSel = c.matches('select');
        if (rc.left > rb.left + line + .6 || rc.right < rb.right - line - .6 || rc.top > rb.top + line + .6 || rc.bottom < rb.bottom - line - .6) say(`${id}'s control (${rc.left.toFixed(1)} to ${rc.right.toFixed(1)}) does not reach its box's edges (${rb.left.toFixed(1)} to ${rb.right.toFixed(1)})`);
        // The words' room, and the slots on either side of it.
        const room = [rc.left + parseFloat(cs.paddingLeft), rc.right - parseFloat(cs.paddingRight)];
        if (room[1] - room[0] < 4 * u) say(`${id} leaves ${(room[1] - room[0]).toFixed(1)}px for its words`);
        for (const s of b.children) {
          if (s === c) continue;
          const rs = r(s), before = (s.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0, left = before !== rtl;
          const gap = left ? room[0] - rs.right : rs.left - room[1];
          if (gap < u / 2 - .6) say(`${id}: "${s.textContent || s.tagName}" is ${gap.toFixed(2)}px from the words, not half a cell`);
          if (rs.left < rb.left || rs.right > rb.right || rs.top < rb.top - .1 || rs.bottom > rb.bottom + .1) say(`${id}: "${s.textContent || s.tagName}" leaves the box`);
          if (!near(rs.top + rs.height / 2, rb.top + rb.height / 2, .6)) say(`${id}: "${s.textContent || s.tagName}" is ${(rs.top + rs.height / 2 - rb.top - rb.height / 2).toFixed(2)}px off the box's middle`);
          const outer = s === b.firstElementChild || s === b.lastElementChild, edge = left ? rs.left - rb.left : rb.right - rs.right, pad = parseFloat(getComputedStyle(b).paddingLeft) + line;
          if (outer && !near(edge, s.matches('.button') ? u / 4 : pad, 1)) say(`${id}: "${s.textContent || s.tagName}" is ${edge.toFixed(2)}px from the box's edge`);
          if (!s.matches('.button') && getComputedStyle(s).pointerEvents !== 'none') say(`${id}: "${s.textContent || s.tagName}" takes clicks`);
        }
        // Every point of the box is the control, or a button's own.
        b.scrollIntoView({ block: 'center', behavior: 'instant' });
        const v = r(b), y = v.top + v.height / 2;
        for (let x = v.left + 2; x < v.right - 1; x += 3) {
          const at = document.elementFromPoint(x, y), own = at && at.closest('.button');
          if (at !== c && !(own && own.parentElement === b)) { say(`${id}: a click ${(x - v.left).toFixed(0)}px in goes to ${at ? at.tagName + '.' + at.className : 'nothing'}, not the control`); break; }
        }
        for (const k of b.querySelectorAll('.button')) {
          const q = r(k), cx = q.left + q.width / 2, cy = q.top + q.height / 2, t = coarse ? hit / 2 - 1 : Math.min(q.width, q.height) / 2 - 1;
          for (const [x, y] of [[cx, cy], [cx - t, cy], [cx + t, cy], [cx, cy - t], [cx, cy + t]]) { const at = document.elementFromPoint(x, y); if (!at || at.closest('.button') !== k) say(`${id}: a press ${(x - cx).toFixed(0)},${(y - cy).toFixed(0)} from its button's middle misses it`); }
        }
        if (isSel && rc.left < rb.left - 1.5) say(`${id}: a select's box starts ${(rb.left - rc.left).toFixed(1)}px before its field's, so its list would open off it`);
      }
      return fails;
    }));
    // Clicks: on an icon, a unit, and the box's own padding, then on a button.
    const spot = (id, part) => page.evaluate(async ([id, part]) => { const b = document.getElementById(id); b.scrollIntoView({ block: 'center', behavior: 'instant' }); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); const e = part ? b.querySelector(part) : b, q = e.getBoundingClientRect(); return part ? { x: q.left + q.width / 2, y: q.top + q.height / 2 } : { x: q.left + 4, y: q.top + q.height / 2 }; }, [id, part]);
    for (const [id, part] of [['sl-icon', '.icon'], ['sl-unit', '.input-unit'], ['sl-unit', '.input-unit:last-child'], ['sl-long', '.input-unit'], ['rtl-unit', '.input-unit'], ['sl-inlink', '.icon'], ['sl-icon', '']]) {
      await page.evaluate(() => document.activeElement.blur());
      const p = await spot(id, part);
      await (touch ? page.touchscreen.tap(p.x, p.y) : page.mouse.click(p.x, p.y));
      const at = await page.evaluate(id => document.activeElement === document.querySelector(`#${id} .input-control`), id);
      if (!at) fails.push(`field slots: a press on ${id}'s ${part || 'padding'} does not focus its control`);
    }
    for (const id of ['sl-search', 'sl-inlink']) {
      await page.evaluate(id => { document.activeElement.blur(); window.__acted = 0; document.querySelector(`#${id} .button`).addEventListener('click', () => window.__acted++); }, id);
      const p = await spot(id, '.button');
      await (touch ? page.touchscreen.tap(p.x, p.y) : page.mouse.click(p.x, p.y));
      if (await page.evaluate(() => window.__acted) !== 1) fails.push(`field slots: a press on ${id}'s button is not its own`);
      if (await page.evaluate(id => document.activeElement === document.querySelector(`#${id} .input-control`), id)) fails.push(`field slots: a press on ${id}'s button went to the field`);
    }
    // The browser's own parts: a spinner steps and a search clears, inside the slots.
    if (!touch) {
      const inside = async (id, dx, dy) => { const p = await page.evaluate(async id => { const c = document.querySelector(`#${id} .input-control`); c.scrollIntoView({ block: 'center', behavior: 'instant' }); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); const q = c.getBoundingClientRect(); return { x: q.right - parseFloat(getComputedStyle(c).paddingRight), y: q.top + q.height / 2 }; }, id); await page.mouse.move(p.x - 40, p.y); await page.mouse.move(p.x - dx, p.y + dy); await page.mouse.click(p.x - dx, p.y + dy); return page.evaluate(id => document.querySelector(`#${id} .input-control`).value, id); };
      const num = await inside('sl-num', 6, -4);
      if (num !== '26') fails.push(`field slots: a number's spinner is not at the end of its words' room (a press there left ${num})`);
      await page.focus('#sl-find .input-control');
      const found = await inside('sl-find', 7, 0);
      if (found !== '') fails.push(`field slots: a search's own clear button is not at the end of its words' room (a press there left "${found}")`);
      await page.focus('#sl-search .input-control');
      const kept = await inside('sl-search', 7, 0);
      if (kept !== 'Words') fails.push("field slots: the browser's clear button is still there beside the app's");
    }
    // One ring: the box's for its control, the button's own for a button, drawn inside the box that would cut it.
    await page.focus('#sl-search .input-control'); await page.keyboard.press('End');
    fails.push(...await page.evaluate(() => {
      const fails = [], b = document.getElementById('sl-search'), c = b.querySelector('.input-control'), bs = getComputedStyle(b), i = document.createElement('i');
      i.style.color = 'var(--focus)'; b.parentElement.appendChild(i); const want = getComputedStyle(i).color; i.remove();
      if (bs.outlineStyle !== 'solid' || bs.outlineColor !== want || !(parseFloat(bs.outlineWidth) > 0)) fails.push(`field slots: focused, the box's ring is ${bs.outlineStyle} ${bs.outlineColor}, not ${want}`);
      if (getComputedStyle(c).outlineStyle !== 'none') fails.push('field slots: the control draws a ring inside the box');
      const k = b.querySelector('.button'); k.focus();
      const ks = getComputedStyle(k), q = k.getBoundingClientRect(), rb = b.getBoundingClientRect(), line = parseFloat(bs.borderTopWidth), out = parseFloat(ks.outlineOffset) + parseFloat(ks.outlineWidth);
      // A phone's WebKit does not show a button focused by script as focused; every other run does.
      if (ks.outlineStyle !== 'solid' && k.matches(':focus-visible')) fails.push('field slots: a focused button in the box has no ring');
      if (!k.matches(':focus-visible') && !matchMedia('(pointer: coarse)').matches) fails.push('field slots: a button in the box took no visible focus');
      if (getComputedStyle(b).outlineStyle !== 'none') fails.push("field slots: the box takes its button's ring as well");
      if (q.right + out > rb.right - line + .1 || q.top - out < rb.top + line - .1) fails.push("field slots: the box cuts its button's ring");
      document.activeElement.blur();
      return fails;
    }));
    // Level capitals: the unit's and the value's, from the pixels.
    {
      await spot('sl-unit', '');
      await page.mouse.move(width - 2, height - 2);
      const png = (await page.locator('#sl-unit').screenshot()).toString('base64');
      const lines = await page.evaluate(async png => {
        const b = document.getElementById('sl-unit'), c = b.querySelector('.input-control'), rb = b.getBoundingClientRect(), un = b.querySelector('.input-unit').getBoundingClientRect(), x0 = c.getBoundingClientRect().left + parseFloat(getComputedStyle(c).paddingLeft);
        const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
        const k = img.width / rb.width, v = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height }), g = v.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
        const ink = (from, to) => { const x = Math.round((from - rb.left) * k), w = Math.round((to - from) * k), y = Math.round(4 * k), h = img.height - 2 * y, d = g.getImageData(x, y, w, h).data, bg = d[0] + d[1] + d[2], rows = []; for (let j = 0; j < h; j++) { let n = 0; for (let i = 0; i < w; i++) { const q = (j * w + i) * 4; n = Math.max(n, Math.abs(d[q] + d[q + 1] + d[q + 2] - bg)); } if (n > 120) rows.push(j); } return rows.length ? [rows[0], rows[rows.length - 1]] : null; };
        return { unit: ink(un.left, un.right), value: ink(x0, x0 + un.width + 2), k };
      }, png);
      if (!lines.unit || !lines.value) fails.push('field slots: no ink found in the unit or the value');
      else if (Math.abs(lines.unit[0] - lines.value[0]) > lines.k || Math.abs(lines.unit[1] - lines.value[1]) > lines.k) fails.push(`field slots: a unit's capitals stand at ${lines.unit}, its value's at ${lines.value}`);
    }
    // What a slot says can be read, in both themes.
    for (const theme of ['light', 'dark']) fails.push(...await page.evaluate(async theme => {
      document.documentElement.setAttribute('data-theme', theme); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await window.__slots.still();
      const { px, ratio } = window.__slots, out = [];
      for (const s of document.querySelectorAll('#sl-unit .input-unit, #sl-icon > .icon, #sl-search .button, #sl-bad > .icon, #sl-ro > .icon')) { const g = px(getComputedStyle(s.closest('.cc-slots')).backgroundColor), q = ratio(px(getComputedStyle(s).color), g); if (q < 4.5) out.push(`field slots, ${theme}: ${s.parentElement.id}'s ${s.tagName} is ${q.toFixed(2)}:1 on its box`); }
      return out;
    }, theme));
    await page.evaluate(() => { const t = window.__slots.theme; if (t === null) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); document.getElementById('slots-test').remove(); });
  }

  // An invalid field's edge is the alert's, under the pointer as at rest, in both
  // themes: an input, a select, a textarea, one with something in its box, and a
  // choice. A valid one, and one that says aria-invalid="false", still darken.
  if (!touch) {
    await page.evaluate(() => {
      const host = document.createElement('div'); host.id = 'invalid-test'; host.className = 'stack';
      host.style.cssText = 'position: fixed; inset-block-start: 0; inset-inline-start: 0; z-index: 2147483647; inline-size: calc(var(--u) * 30); padding: var(--sp-2); background: var(--bg)';
      const bad = 'aria-invalid="true" aria-label="Asked"', sel = '<option>One</option><option>Two</option>';
      // No transitions: the edge is read where it ends, not on its way (WebKit starts one late after a theme changes).
      host.innerHTML = `<style>#invalid-test * { transition: none !important; }</style><input class="input" id="iv-input" ${bad}><input class="input cc-sm" id="iv-small" ${bad}><input class="input" id="iv-ro" readonly ${bad}><input class="input" id="iv-off" disabled ${bad}>`
        + `<select class="input" id="iv-select" ${bad}>${sel}</select><textarea class="input" id="iv-lines" ${bad}></textarea>`
        + `<div class="input cc-slots" id="iv-slots"><input class="input-control" ${bad}></div><div class="input cc-slots" id="iv-slots-select"><select class="input-control" ${bad}>${sel}</select></div>`
        + `<label class="choice" id="iv-choice"><input type="checkbox" ${bad}><span class="choice-label">A choice</span></label>`
        // Checked and invalid, and invalid by the browser once touched (:user-invalid), checked or not.
        + `<label class="choice" id="iv-choice-on"><input type="checkbox" checked ${bad}><span class="choice-label">A choice</span></label>`
        + `<label class="choice" id="iv-choice-user"><input type="checkbox" required aria-label="Asked"><span class="choice-label">A choice</span></label>`
        + `<label class="choice" id="iv-choice-user-on"><input type="checkbox" aria-label="Asked"><span class="choice-label">A choice</span></label>`
        + `<input class="input" id="iv-ok" aria-label="Fine"><input class="input" id="iv-not" aria-invalid="false" aria-label="Fine"><i id="iv-alert" style="color: var(--alert)"></i>`;
      document.body.appendChild(host);
      host.querySelector('#iv-choice-user-on input').setCustomValidity('Not this one');
      window.__iv = document.documentElement.getAttribute('data-theme');
    });
    // Touched: the required box checked and unchecked again, the other checked.
    for (const s of ['#iv-choice-user input', '#iv-choice-user input', '#iv-choice-user-on input']) await page.locator(s).click();
    if (!(await page.evaluate(() => ['#iv-choice-user input', '#iv-choice-user-on input'].every(s => document.querySelector(s).matches(':user-invalid')) && document.querySelector('#iv-choice-user-on input').checked)))
      fails.push('invalid: a touched box is not :user-invalid here, so nothing was proved');
    const edge = async id => page.evaluate(async id => {
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const e = document.getElementById(id), t = e.matches('.choice') ? e.querySelector('input') : e;
      return { color: getComputedStyle(t).borderTopColor, over: e.matches(':hover'), alert: getComputedStyle(document.getElementById('iv-alert')).color };
    }, id);
    const hovers = await page.evaluate(() => matchMedia('(hover: hover)').matches);
    if (!hovers) fails.push('invalid: this browser says it has no pointer that hovers, so nothing was proved');
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme);
      for (const id of ['iv-input', 'iv-small', 'iv-ro', 'iv-off', 'iv-select', 'iv-lines', 'iv-slots', 'iv-slots-select', 'iv-choice', 'iv-choice-on', 'iv-choice-user', 'iv-choice-user-on', 'iv-ok', 'iv-not']) {
        await page.mouse.move(width - 2, height - 2);
        const rest = await edge(id), b = await page.locator('#' + id).boundingBox();
        await page.mouse.move(b.x + 10, b.y + b.height / 2);
        const at = await edge(id);
        if (rest.over || !at.over) { fails.push(`invalid, ${theme}: the pointer is not on ${id} when it should be, so nothing was proved`); continue; }
        if (id === 'iv-ok' || id === 'iv-not') { if (at.color === rest.color || rest.color === rest.alert) fails.push(`invalid, ${theme}: ${id} is ${rest.color} and stays so under the pointer, so nothing was proved`); }
        else if (rest.color !== rest.alert || at.color !== at.alert) fails.push(`invalid, ${theme}: ${id}'s edge is ${rest.color}, and ${at.color} under the pointer, not the alert (${at.alert})`);
      }
    }
    await page.mouse.move(width - 2, height - 2);
    // Forced colors (D83): an invalid edge is the system's Mark, whatever else the box is,
    // checked included; a valid one is not. Where the browser can emulate it.
    await page.emulateMedia({ forcedColors: 'active' });
    fails.push(...await page.evaluate(async () => {
      const fails = [];
      if (!matchMedia('(forced-colors: active)').matches) return fails;
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const sys = v => { const i = document.createElement('i'); i.style.color = v; i.style.forcedColorAdjust = 'none'; document.body.appendChild(i); const c = getComputedStyle(i).color; i.remove(); return c; }, mark = sys('Mark');
      const edge = id => { const e = document.getElementById(id); return getComputedStyle(e.matches('.choice') ? e.querySelector('input') : e).borderTopColor; };
      for (const id of ['iv-input', 'iv-small', 'iv-ro', 'iv-select', 'iv-lines', 'iv-slots', 'iv-slots-select', 'iv-choice', 'iv-choice-on', 'iv-choice-user', 'iv-choice-user-on'])
        if (edge(id) !== mark) fails.push(`invalid, forced colors: ${id}'s edge is ${edge(id)}, not Mark (${mark})`);
      for (const id of ['iv-ok', 'iv-not']) if (edge(id) === mark) fails.push(`invalid, forced colors: ${id} is valid and its edge is Mark`);
      return fails;
    }));
    await page.emulateMedia({ forcedColors: 'none' });
    await page.evaluate(() => { if (window.__iv === null) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', window.__iv); document.getElementById('invalid-test').remove(); });
  }

  // A whole card that is a choice (D116). Every point of the card is its label,
  // corners included, so a press anywhere chooses it, but its own field, button
  // and link keep theirs; a .card-link in it has no cover. The native input
  // does the rest: Space, a radio group's arrows from card to card, disabled.
  // Chosen, the card has an edge of two lines and a wash under its words; mixed
  // the edge alone; invalid, from the input or its group, the alert's. The one
  // ring is round the card. The inks on a lit card read, at all three levels,
  // in both themes. In forced colors chosen is not told by the wash.
  {
    await page.evaluate(() => {
      const host = document.createElement('div'); host.id = 'card-choice-test'; host.className = 'stack';
      host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; z-index: 2147483647; inline-size: min(100vw, calc(var(--u) * 60)); padding: var(--sp-2); background: var(--bg)';
      const card = (id, attrs, rest = '', cls = '', style = '') => `<article class="card stack u-gap-1 ${cls}" id="${id}" style="${style}"><label class="choice card-choice"><input ${attrs}><span class="choice-label cap-center">Title</span></label><p class="t-sm">What it is, in a line of words.</p>${rest}</article>`;
      const field = '<div class="field"><label class="field-label t-label" for="ck-gift">Gift</label><div class="input cc-slots"><span class="input-unit">$</span><input class="input-control" id="ck-gift"></div></div>';
      host.innerHTML = `<div class="cols" style="--cols: 2" role="radiogroup" aria-label="Ways">${card('ck-a', 'type="radio" name="ck" checked')}${card('ck-c', 'type="radio" name="ck" disabled')}${card('ck-b', 'type="radio" name="ck"', field + '<div class="cluster"><button class="button cc-sm" type="button" id="ck-btn"><span class="button-label">Act</span></button><a class="tag cc-sm" href="#card-choice-test" id="ck-tag"><span class="tag-label">Tag</span></a></div><p class="t-xs"><a class="card-link" href="#card-choice-test" id="ck-link">More about it</a></p>')}</div>`
        + `<div class="cols" style="--cols: 3">${card('ck-off', 'type="checkbox"')}${card('ck-on', 'type="checkbox" checked')}${card('ck-mixed', 'type="checkbox"')}${card('ck-bad', 'type="checkbox" aria-invalid="true"')}${card('ck-dis', 'type="checkbox" disabled')}${card('ck-dison', 'type="checkbox" checked disabled')}</div>`
        + `<div class="cols" style="--cols: 2" role="radiogroup" aria-label="Asked" aria-invalid="true">${card('ck-g1', 'type="radio" name="ckg"')}${card('ck-g2', 'type="radio" name="ckg" disabled')}</div>`
        + `<article class="card" id="ck-hid"><label class="choice card-choice"><input class="u-sr-only" type="radio" name="ckh"><span class="choice-label">A tile says it</span></label></article>`
        + `<article class="card" id="ck-tiny" style="--card-pad: 0px"><label class="choice card-choice"><input type="checkbox"><span class="choice-label">Tiny</span></label></article>`
        + `<article class="card" id="ck-glow"><label class="choice card-choice" style="--card-choice-glow: 0 0 9px var(--ok); --card-choice-fill: var(--bg-hover); --card-choice-edge: var(--warn)"><input type="checkbox" checked><span class="choice-label">A product's own light</span></label></article>`
        + `<article class="card" id="ck-l1"><div class="stack">${card('ck-l2', 'type="checkbox" checked')}<article class="card"><div class="stack">${card('ck-l3', 'type="checkbox" checked')}</div></article></div></article>`
        + `<div class="cluster" id="ck-ref"><i id="ck-accent" style="color: var(--choice-on, var(--accent))"></i><i id="ck-alert" style="color: var(--alert)"></i><i id="ck-focus" style="color: var(--focus)"></i><i id="ck-warn" style="color: var(--warn)"></i></div>`;
      document.body.appendChild(host);
      host.querySelector('#ck-mixed input').indeterminate = true;
      scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
    await page.evaluate(async () => { await Trellis.settled(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await window.__slots.still(); });
    fails.push(...await page.evaluate(() => {
      const fails = [], u = Trellis.cell(), $ = id => document.getElementById(id), r = e => e.getBoundingClientRect(), say = m => fails.push('card choice: ' + m);
      const ref = id => getComputedStyle($(id)).color, lab = id => $(id).querySelector('.card-choice'), be = id => getComputedStyle(lab(id), '::before'), af = id => getComputedStyle(lab(id), '::after');
      const clear = v => /^(transparent|rgba\(0, 0, 0, 0\))$/.test(v), line = parseFloat(getComputedStyle($('ck-a'), '::after').borderTopWidth);
      // The cover is the card's box.
      for (const c of document.querySelectorAll('#card-choice-test .card:has(> .card-choice)')) {
        const l = c.querySelector('.card-choice'), b = getComputedStyle(l, '::before'), a = getComputedStyle(l, '::after'), edge = getComputedStyle(c, '::after');
        if (l.offsetParent !== c || b.position !== 'absolute' || [b.top, b.right, b.bottom, b.left].join() !== [edge.top, edge.right, edge.bottom, edge.left].join()) say(`${c.id}'s cover is not its card's edge (${[b.top, b.right, b.bottom, b.left]} against ${[edge.top, edge.right, edge.bottom, edge.left]})`);
        if (b.borderTopLeftRadius !== getComputedStyle(c).borderTopLeftRadius || a.borderTopLeftRadius !== b.borderTopLeftRadius) say(`${c.id}'s cover does not take its card's corner`);
        if (a.zIndex !== '-1' || getComputedStyle(c).isolation !== 'isolate' || getComputedStyle(l).zIndex !== 'auto') say(`${c.id}'s wash is not under its words`);
        if (!(Math.abs(r(c).height / u - Math.round(r(c).height / u)) < .05)) say(`${c.id} is ${(r(c).height / u).toFixed(2)} cells tall`);
      }
      const lit = (id, edge, ground) => { const b = be(id), w = parseFloat(b.borderTopWidth); if (edge ? (w < 2 * line - .6 || w <= line || b.borderTopColor !== edge) : w > 0) say(`${id}'s edge is ${b.borderTopWidth} ${b.borderTopColor}${edge ? ', not two lines of ' + edge : ', and it is not chosen'}`); if (clear(af(id).backgroundColor) === ground) say(`${id}'s ground is ${af(id).backgroundColor}`); };
      lit('ck-a', ref('ck-accent'), true); lit('ck-b', '', false); lit('ck-off', '', false); lit('ck-on', ref('ck-accent'), true); lit('ck-mixed', ref('ck-accent'), false);
      lit('ck-bad', ref('ck-alert'), false); lit('ck-g1', ref('ck-alert'), false); lit('ck-hid', '', false); lit('ck-glow', ref('ck-warn'), true);
      if (getComputedStyle($('ck-g1').querySelector('input')).borderTopColor !== ref('ck-alert')) say("an invalid group's radio keeps its own edge");
      lit('ck-g2', '', true);   // disabled: sunk, and not lit by its group
      if (af('ck-a').boxShadow !== 'none' || af('ck-glow').boxShadow === 'none') say(`the glow is ${af('ck-a').boxShadow} unset and ${af('ck-glow').boxShadow} set`);
      for (const id of ['ck-dis', 'ck-dison', 'ck-c']) if (clear(af(id).backgroundColor) || be(id).borderTopColor === ref('ck-accent') || getComputedStyle(lab(id)).cursor !== 'not-allowed') say(`${id}, disabled, is not quieted`);
      // The chosen card's third ink is the second, and no other card's is.
      const ink = (id, v) => { const i = document.createElement('i'); i.style.color = `var(${v})`; $(id).appendChild(i); const c = getComputedStyle(i).color; i.remove(); return c; };
      if (ink('ck-on', '--text-tertiary') !== ink('ck-on', '--text-secondary') || ink('ck-off', '--text-tertiary') === ink('ck-off', '--text-secondary') || ink('ck-l1', '--text-tertiary') !== ink('ck-off', '--text-tertiary')) say("a lit card's third ink is not the second, or another card's is");
      // What is under each point.
      const at = (x, y) => document.elementFromPoint(x, y), mid = e => { const b = r(e); return [(b.left + b.right) / 2, (b.top + b.bottom) / 2]; };
      for (const id of ['ck-a', 'ck-b', 'ck-off', 'ck-l3', 'ck-hid']) {
        $(id).scrollIntoView({ block: 'center', behavior: 'instant' });
        const b = r($(id)), k = Math.ceil(parseFloat(getComputedStyle($(id)).borderTopLeftRadius) / 3) + 1, pts = [[b.left + k, b.top + k], [b.right - k, b.top + k], [b.left + k, b.bottom - k], [b.right - k, b.bottom - k], [b.left + b.width / 2, b.top + 3]];
        if ($(id).querySelector('p')) pts.push(mid($(id).querySelector('p')));
        const off = pts.filter(([x, y]) => { const e = at(x, y); return !e || e.closest('.card-choice') !== lab(id); }).length;
        if (off) say(`${off} of ${pts.length} points on ${id} are not its choice`);
      }
      $('ck-b').scrollIntoView({ block: 'center', behavior: 'instant' });
      for (const id of ['ck-btn', 'ck-tag', 'ck-link', 'ck-gift']) { const e = at(...mid($(id))); if (!e || e.closest('a, button, input') !== $(id)) say(`${id} is under the cover`); }
      if (getComputedStyle($('ck-link'), '::before').content !== 'none') say('a .card-link in a choice card still covers it');
      // Nothing interactive in a label but its own input, here and in the specimen.
      const held = [...document.querySelectorAll('.card-choice')].filter(l => l.querySelectorAll('a, button, select, textarea, input, [tabindex]').length !== 1);
      if (held.length) say(`${held.length} labels hold more than their input`);
      if (matchMedia('(pointer: coarse)').matches && r($('ck-tiny')).height < 44) say(`a card with no padding is ${r($('ck-tiny')).height.toFixed(1)}px tall on a touch screen`);
      return fails;
    }));
    const on = id => page.evaluate(id => document.querySelector(`#${id} input`).checked, id);
    const press = async (id, sel) => { const p = await page.evaluate(async ([id, sel]) => { const c = document.getElementById(id), e = sel ? c.querySelector(sel) : c; e.scrollIntoView({ block: 'center', behavior: 'instant' }); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); const b = e.getBoundingClientRect(); return sel ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : { x: b.right - 14, y: b.bottom - 14 }; }, [id, sel]); await (touch ? page.touchscreen.tap(p.x, p.y) : page.mouse.click(p.x, p.y)); };
    await page.evaluate(() => { window.__ck = []; document.getElementById('card-choice-test').addEventListener('click', e => { const a = e.target.closest('a, button'); if (a) { window.__ck.push(a.id); if (a.matches('a')) e.preventDefault(); } }); });
    for (const s of ['#ck-btn', '#ck-tag', '#ck-link', '#ck-gift']) { await press('ck-b', s); if (await on('ck-b')) { fails.push(`card choice: a press on ${s} chose the card`); break; } }
    const own = await page.evaluate(() => window.__ck.join(' ') + ' ' + document.activeElement.id);
    if (own !== 'ck-btn ck-tag ck-link ck-gift') fails.push(`card choice: presses on the card's own button, tag, link and field went to "${own}"`);
    await press('ck-b'); if (!(await on('ck-b')) || await on('ck-a')) fails.push("card choice: a press on a card's corner does not choose it");
    await press('ck-a', 'p'); if (!(await on('ck-a'))) fails.push("card choice: a press on a card's words does not choose it");
    await press('ck-c'); if (await on('ck-c')) fails.push('card choice: a disabled card was chosen');
    await press('ck-off', 'p'); if (!(await on('ck-off'))) fails.push('card choice: a press on a checkbox card does not check it');
    await press('ck-off', 'p'); if (await on('ck-off')) fails.push('card choice: a second press does not uncheck it');
    await press('ck-mixed', 'p'); if (!(await on('ck-mixed')) || await page.evaluate(() => document.querySelector('#ck-mixed input').indeterminate)) fails.push('card choice: a press on a mixed card does not check it');
    await press('ck-hid'); if (!(await on('ck-hid'))) fails.push('card choice: a card whose input is visually hidden does not take a press');
    if (!touch) {
      const wash = id => page.evaluate(id => { const m = getComputedStyle(document.querySelector(`#${id} .card-choice`), '::before').backgroundColor; return m; }, id);
      const over = async (id, sel = 'p') => { const p = await page.evaluate(async ([id, sel]) => { const e = document.getElementById(id).querySelector(sel); e.scrollIntoView({ block: 'center', behavior: 'instant' }); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, [id, sel]); await page.mouse.move(p.x, p.y); };
      await page.mouse.move(width - 2, height - 2);
      const rest = await wash('ck-off'), hovers = await page.evaluate(() => matchMedia('(hover: hover)').matches);
      await over('ck-off'); const hov = await wash('ck-off');
      await page.mouse.down(); const down = await wash('ck-off');
      await page.mouse.move(width - 2, height - 2); await page.mouse.up();
      if (hovers && hov === rest) fails.push(`card choice: a hovered card is drawn as at rest (${rest})`);
      if (down === rest || down === hov) fails.push(`card choice: a pressed card is ${down}, hovered ${hov}, at rest ${rest}`);
      await over('ck-dis'); if (await wash('ck-dis') !== rest) fails.push('card choice: a disabled card hovers');
      await over('ck-b', '#ck-btn'); if (await wash('ck-b') !== rest) fails.push("card choice: a hover on the card's button lights the card");
    }
    // The keyboard: the group's arrows go card to card, past the disabled one; Space; the ring round the card.
    await page.focus('#ck-a input'); await page.keyboard.press('ArrowDown');
    if (!(await on('ck-b')) || await on('ck-c')) fails.push('card choice: an arrow does not move to the next card, past the disabled one');
    // WebKit does not count a radio reached by an arrow as :focus-visible at once; focused afresh it is.
    await page.evaluate(() => document.activeElement.blur()); await page.focus('#ck-b input');
    const ring = await page.evaluate(() => { const i = document.querySelector('#ck-b input'), b = getComputedStyle(i.closest('label'), '::before'); return { at: document.activeElement === i, own: getComputedStyle(i).outlineStyle, style: b.outlineStyle, color: b.outlineColor, want: getComputedStyle(document.getElementById('ck-focus')).color, a: getComputedStyle(document.querySelector('#ck-a .card-choice'), '::before').outlineStyle }; });
    if (!ring.at || ring.own !== 'none' || ring.style !== 'solid' || ring.color !== ring.want || ring.a !== 'none') fails.push(`card choice: the ring is not round the focused card alone (${JSON.stringify(ring)})`);
    await page.keyboard.press('ArrowUp');
    if (!(await on('ck-a')) || await on('ck-c')) fails.push('card choice: an arrow does not move back, past the disabled card');
    await page.focus('#ck-off input'); await page.keyboard.press('Space');
    if (!(await on('ck-off'))) fails.push('card choice: Space does not check a card');
    await page.focus('#ck-hid input'); await page.keyboard.press('Shift');
    if (await page.evaluate(() => getComputedStyle(document.querySelector('#ck-hid .card-choice'), '::before').outlineStyle) !== 'solid') fails.push('card choice: a card whose input is visually hidden draws no ring');
    await page.focus('#ck-link');
    if (await page.evaluate(() => getComputedStyle(document.getElementById('ck-link')).outlineStyle) !== 'solid') fails.push('card choice: the link in a choice card draws no ring');
    await page.evaluate(() => document.activeElement.blur());
    for (const theme of ['light', 'dark']) fails.push(...await page.evaluate(async theme => {
      document.documentElement.setAttribute('data-theme', theme); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await window.__slots.still();
      const { px, ratio } = window.__slots, out = [];
      for (const id of ['ck-on', 'ck-l2', 'ck-l3']) {
        const c = document.getElementById(id), l = c.querySelector('.card-choice'), g = px(getComputedStyle(c).backgroundColor, getComputedStyle(l, '::after').backgroundColor), plain = px(getComputedStyle(c).backgroundColor);
        if (String(g) === String(plain)) out.push(`card choice, ${theme}: ${id} is not lit, so nothing was proved`);
        for (const v of ['--text', '--text-secondary', '--text-tertiary']) { const i = document.createElement('i'); i.style.color = `var(${v})`; c.appendChild(i); const q = ratio(px(getComputedStyle(i).color), g); i.remove(); if (q < 4.5) out.push(`card choice, ${theme}: ${v} on ${id}, lit, is ${q.toFixed(2)}:1`); }
        const e = ratio(px(getComputedStyle(l, '::before').borderTopColor), plain); if (e < 3) out.push(`card choice, ${theme}: ${id}'s edge is ${e.toFixed(2)}:1 on its ground`);
      }
      return out;
    }, theme));
    if (engine === 'chromium') {
      await page.emulateMedia({ forcedColors: 'active' });
      fails.push(...await page.evaluate(async () => {
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await window.__slots.still();
        const fails = [], be = id => getComputedStyle(document.querySelector(`#${id} .card-choice`), '::before'), sys = v => { const i = document.createElement('i'); i.style.color = v; i.style.forcedColorAdjust = 'none'; document.body.appendChild(i); const c = getComputedStyle(i).color; i.remove(); return c; };
        if (be('ck-on').borderTopColor !== sys('Highlight') || !(parseFloat(be('ck-on').borderTopWidth) > 1)) fails.push(`card choice, forced colors: a chosen card's edge is ${be('ck-on').borderTopWidth} ${be('ck-on').borderTopColor}`);
        if (parseFloat(be('ck-off').borderTopWidth) && !document.querySelector('#ck-off input').checked) fails.push('card choice, forced colors: an unchosen card has an edge of its own');
        if (be('ck-dison').borderTopColor !== sys('GrayText')) fails.push(`card choice, forced colors: a disabled card's edge is ${be('ck-dison').borderTopColor}`);
        return fails;
      }));
      await page.emulateMedia({ forcedColors: 'none' });
    }
    await page.evaluate(() => { const t = window.__slots.theme; if (t === null) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); document.getElementById('card-choice-test').remove(); delete window.__slots; });
  }

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

  // Controls on a full bleed (D108), in both themes. The ground is read from a
  // screenshot under each control, over a mid-gray image: ink 4.5:1 on it, an
  // edge 3:1. Hover and press mix white in, the focus ring is white. What has
  // a fill of its own, or is on a surface in the card, is as it is outside it.
  {
    await page.evaluate(() => {
      const host = document.createElement('div'); host.id = 'fill-test';
      host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; z-index: 2147483647; inline-size: calc(var(--u) * 30); background: var(--bg)';
      const icon = '<svg class="icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10"/></svg>';
      const controls = k => `<button class="button cc-sm" data-c="${k}-plain"><span class="button-label">A</span></button><button class="button cc-ghost cc-sm" data-c="${k}-ghost"><span class="button-label">B</span></button>`
        + `<button class="button icon-button cc-ghost cc-sm" data-c="${k}-icon" aria-label="C">${icon}</button><button class="button cc-sm" aria-pressed="true" data-c="${k}-pressed"><span class="button-label">D</span></button>`
        + `<a class="tag cc-sm cc-event" href="#fill-test" data-c="${k}-tag"><span class="tag-label">E</span></a><button class="tag cc-sm cc-outline" data-c="${k}-outline"><span class="tag-label">F</span></button>`
        + `<label class="choice cc-sm" data-c="${k}-choice"><input type="checkbox"><span class="choice-label">G</span></label><button class="switch" role="switch" aria-checked="false" data-c="${k}-switch"><span class="switch-label">H</span></button>`
        + `<div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="true" data-c="${k}-tab">I</button><button class="tab" role="tab" aria-selected="false" data-c="${k}-tab2">J</button></div>`;
      const filled = k => `<button class="button cc-primary cc-sm" data-c="${k}-primary"><span class="button-label">K</span></button><button class="button cc-sm" disabled data-c="${k}-disabled"><span class="button-label">L</span></button>`
        + `<span class="tag cc-sm cc-solid cc-event" data-c="${k}-solid"><span class="tag-label">M</span></span><button class="tag cc-sm" aria-pressed="true" data-c="${k}-tagon"><span class="tag-label">N</span></button>`
        + `<input class="input cc-sm" value="O" aria-label="O" data-c="${k}-input"><div class="tabs cc-seg" role="tablist"><button class="tab" role="tab" aria-selected="true" data-c="${k}-seg">P</button><button class="tab" role="tab" aria-selected="false" data-c="${k}-seg2">Q</button></div>`;
      host.innerHTML = `<div class="card" id="ft-card"><div class="media cc-fill" style="--media-fill: #808080; --media-h: 60"></div><div class="stack"><p class="t-h5"><a class="card-link" href="#fill-test" data-c="link">Words</a></p><div class="cluster">${controls('on')}</div><div class="cluster">${filled('on')}</div></div></div>`
        + `<div class="cluster">${filled('off')}${controls('off')}</div>`
        + `<div class="card"><div class="media cc-fill"></div><div class="stack"><div class="card"><div class="cluster">${controls('nest')}</div></div><div class="float options-card" style="position: static">${controls('float')}</div><div data-product="fill-test" data-theme="light">${controls('day')}</div></div></div>`
        + `<div data-product="fill-test" data-theme="light">${controls('mood')}</div>`;
      document.body.appendChild(host);
      window.__fill = {
        px: (...cs) => { const c = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }), g = c.getContext('2d', { willReadFrequently: true }); cs.forEach(v => { g.fillStyle = v; g.fillRect(0, 0, 1, 1); }); return [...g.getImageData(0, 0, 1, 1).data]; },
        ratio: (a, b) => { const l = p => { const f = p.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * f[0] + .7152 * f[1] + .0722 * f[2]; }; const x = l(a), y = l(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); },
        still: () => Promise.all(document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#fill-test')).map(a => a.finished.catch(() => {}))),
        el: k => document.querySelector(`[data-c="${k}"]`),
        theme: document.documentElement.getAttribute('data-theme'),
      };
    });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(async theme => { document.documentElement.setAttribute('data-theme', theme); scrollTo({ top: 0, left: 0, behavior: 'instant' }); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await window.__fill.still(); }, theme);
      await page.mouse.move(width - 2, height - 2);
      // The ground alone: the card's words and controls hidden, so the pixels are the image and its scrim.
      const hide = v => page.evaluate(v => { document.querySelector('#ft-card > .stack').style.visibility = v; }, v);
      await hide('hidden');
      const shot = (await page.locator('#ft-card').screenshot({ scale: 'css' })).toString('base64');
      await hide('');
      fails.push(...await page.evaluate(async ([theme, shot]) => {
        const fails = [], { px, ratio, el } = window.__fill, say = m => fails.push(`full bleed, ${theme}: ${m}`), card = document.getElementById('ft-card').getBoundingClientRect();
        const img = new Image(); img.src = 'data:image/png;base64,' + shot; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const g2 = c.getContext('2d', { willReadFrequently: true }); g2.drawImage(img, 0, 0);
        const ground = e => { const b = e.getBoundingClientRect(); return [...g2.getImageData(Math.round((b.left + b.right) / 2 - card.left), Math.round((b.top + b.bottom) / 2 - card.top), 1, 1).data]; };
        const css = p => `rgb(${p.slice(0, 3).join(' ')})`;
        const UNFILLED = ['plain', 'ghost', 'icon', 'pressed', 'tag', 'outline', 'choice', 'switch', 'tab', 'tab2'];
        for (const k of UNFILLED) {
          const e = el('on-' + k), cs = getComputedStyle(e), g = ground(e), under = px(css(g), cs.backgroundColor), r = ratio(px(css(under), cs.color), under);
          if (g[3] !== 255 || g[0] > 128) say(`the ground under ${k} is ${g}, not the scrim on the image`);
          if (r < 4.5) say(`${k}'s ink is ${r.toFixed(2)}:1 on the scrim (${cs.color} on ${g.slice(0, 3)})`);
        }
        const edges = { plain: el('on-plain'), pressed: el('on-pressed'), choice: el('on-choice').querySelector('input') };
        for (const [k, e] of Object.entries(edges)) { const g = ground(e), v = getComputedStyle(e).borderTopColor, r = ratio(px(css(g), v), g); if (r < 3) say(`${k}'s edge is ${r.toFixed(2)}:1 on the scrim (${v})`); }
        if (!/^(transparent|rgba\(0, 0, 0, 0\))$/.test(getComputedStyle(el('on-ghost')).borderTopColor)) say('a ghost button draws an edge');
        const same = (a, b, props, what) => props.forEach(p => { const x = getComputedStyle(el(a))[p], y = getComputedStyle(el(b))[p]; if (x !== y) say(`${what}: ${p} is ${x}, not ${y}`); });
        for (const k of ['primary', 'disabled', 'solid', 'tagon', 'input', 'seg', 'seg2']) same('on-' + k, 'off-' + k, ['color', 'backgroundColor', 'borderTopColor'], `${k}, which has its own fill, is changed`);
        for (const k of UNFILLED) {
          for (const s of ['nest', 'float']) same(`${s}-${k}`, 'off-' + k, ['color', 'borderTopColor'], `${k} on a ${s === 'nest' ? 'card' : 'float'} in the card`);
          same(`day-${k}`, `mood-${k}`, ['color', 'borderTopColor'], `${k} in a scope with a scheme in the card`);
        }
        return fails;
      }, [theme, shot]));
      // Hover and press on what draws no ground of its own.
      for (const k of ['plain', 'ghost', 'icon', 'outline']) {
        const p = await page.evaluate(k => { const b = window.__fill.el('on-' + k).getBoundingClientRect(); return { x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 }; }, k);
        const state = name => page.evaluate(async ([k, name]) => {
          const { px, el, still } = window.__fill, e = el('on-' + k);
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await still();
          const i = document.createElement('i'); i.style.background = `color-mix(in oklab, var(--white) var(--state-${name}), transparent)`; e.parentElement.appendChild(i);
          const got = px('rgb(64 64 64)', getComputedStyle(e).backgroundColor), want = px('rgb(64 64 64)', getComputedStyle(i).backgroundColor); i.remove();
          return got[0] > 66 && got.every((v, n) => Math.abs(v - want[n]) <= 1) ? '' : `${got.slice(0, 3)} over a gray of 64, not ${want.slice(0, 3)}`;
        }, [k, name]);
        await page.mouse.move(p.x, p.y);
        if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) { const bad = await state('hover'); if (bad) fails.push(`full bleed, ${theme}: ${k} hovered is ${bad}`); }
        await page.mouse.down();
        const bad = await state('press'); if (bad) fails.push(`full bleed, ${theme}: ${k} pressed is ${bad}`);
        await page.mouse.move(width - 2, height - 2); await page.mouse.up();
      }
      await page.keyboard.press('Tab');   // from here on focus is the keyboard's, and draws its ring
      fails.push(...await page.evaluate(theme => {
        const fails = [], { px, el } = window.__fill;
        for (const k of ['on-plain', 'on-ghost', 'on-icon', 'on-tag', 'on-choice', 'on-switch', 'on-tab', 'on-primary', 'on-tagon', 'on-input', 'off-plain', 'nest-plain', 'float-plain', 'link']) {
          const e = el(k).querySelector('input') || el(k); e.focus({ preventScroll: true });
          const cs = getComputedStyle(e, k === 'link' ? '::before' : null), i = document.createElement('i');
          // The card's own ring is drawn on the page, and one on a surface on the surface: theirs is the page's.
          i.style.color = k.startsWith('on-') ? 'var(--white)' : 'var(--focus)'; document.body.appendChild(i);
          const want = getComputedStyle(i).color; i.remove();
          if (document.activeElement !== e || !e.matches(':focus-visible')) fails.push(`full bleed, ${theme}: ${k} took no visible focus`);
          else if (cs.outlineStyle !== 'solid' || String(px(cs.outlineColor)) !== String(px(want))) fails.push(`full bleed, ${theme}: ${k}'s ring is ${cs.outlineStyle} ${cs.outlineColor}, not ${want}`);
        }
        document.activeElement.blur();
        return fails;
      }, theme));
    }
    await page.evaluate(() => { const t = window.__fill.theme; if (t === null) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); document.getElementById('fill-test').remove(); delete window.__fill; });
  }

  // A member tile's cluster is no wider than its tile: a tag or a button too long
  // for it truncates at the tile's padding, and one that fits keeps its width.
  fails.push(...await page.evaluate(async () => {
    const fails = [], u = Trellis.cell(), host = document.createElement('div');
    host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; inline-size: calc(var(--u) * 12)';
    const parts = '<span class="avatar" aria-hidden="true">A</span><div class="member-tile-body"><p class="t-h5">Ada</p></div><div class="cluster"><span class="tag cc-sm" data-long><span class="tag-label">A tag far longer than its tile can hold</span></span><button class="button cc-sm" data-long type="button"><span class="button-label">A button far longer than its tile</span></button><span class="tag cc-sm" data-short><span class="tag-label">Short</span></span></div>';
    host.innerHTML = `<article class="card member-tile">${parts}</article><div class="member-tile">${parts}</div><span class="tag cc-sm" id="tile-alone"><span class="tag-label">Short</span></span>`;
    document.body.appendChild(host); await Trellis.settled();
    const r = e => e.getBoundingClientRect(), alone = r(document.getElementById('tile-alone')).width;
    host.querySelectorAll('.member-tile').forEach(t => {
      const what = t.className, end = r(t).right - parseFloat(getComputedStyle(t).paddingRight);
      t.querySelectorAll('[data-long]').forEach(e => {
        const kind = e.className.split(' ')[0], l = e.firstElementChild;
        if (r(e).right > end + .5) fails.push(`tile: in a "${what}" of 12 cells a long ${kind} runs ${((r(e).right - end) / u).toFixed(2)} cells past its padding`);
        else if (l.scrollWidth <= l.clientWidth) fails.push(`tile: a long ${kind} in a "${what}" is not truncated, so nothing was proved`);
      });
      const s = r(t.querySelector('[data-short]')).width; if (Math.abs(s - alone) > .5) fails.push(`tile: a short tag in a "${what}" is ${s.toFixed(1)}px wide, ${alone.toFixed(1)} on its own`);
    });
    host.remove();
    return fails;
  }));

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
  // A reply's quote (D122): two lines of the message it answers, in a narrow
  // column. Read from a screenshot, black on white: its words are two bands of
  // ink, the second as deep as the first (its descenders kept), and nothing
  // under them to a cell past the quote (no top of a third line).
  {
    const D = touch ? 3 : 1;
    const q = await page.evaluate(async () => {
      const words = 'Lazy gypsy typing by a quay, judging hefty jugs of pygmy hog quality; '.repeat(6);
      const host = document.createElement('div'); host.id = 'quote-test';
      host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; z-index: 2147483647; box-sizing: content-box; inline-size: calc(var(--u) * 24); padding: var(--sp-2); background: #fff; color: #000; --text: #000; --text-secondary: #000; --border-strong: #fff;';
      host.innerHTML = `<a class="chat-quote" href="#quote-test"><span class="chat-quote-author t-xs" style="color: #fff">Ada</span><span class="chat-quote-text t-xs">${words}</span></a>`;
      document.body.appendChild(host);
      await Trellis.settled(); await new Promise(r => setTimeout(r, 100)); await Trellis.settled();
      const hb = host.getBoundingClientRect(), t = host.querySelector('.chat-quote-text').getBoundingClientRect(), qb = host.querySelector('.chat-quote').getBoundingClientRect();
      return { x: t.left - hb.left, y: t.top - hb.top, w: t.width, end: qb.bottom - hb.top, u: Trellis.cell() };
    });
    const png = (await page.locator('#quote-test').screenshot()).toString('base64');
    const decoder = await browser.newPage();
    const rows = await decoder.evaluate(async ([png, q, D]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
      const x0 = Math.floor(q.x * D), w = Math.min(img.width - x0, Math.ceil(q.w * D)), y0 = Math.max(0, Math.floor((q.y - q.u) * D)), n = Math.min(img.height - y0, Math.ceil((q.end + q.u - q.y + q.u) * D));
      const d = g.getImageData(x0, y0, w, n).data, out = [];
      for (let y = 0; y < n; y++) { let low = 255; for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, l = .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]; if (l < low) low = l; } out.push(low); }
      return out;
    }, [png, q, D]);
    await decoder.close();
    await page.evaluate(() => document.getElementById('quote-test').remove());
    // Bands of ink: runs of rows with any ink in them.
    const bands = []; let at = -1;
    rows.forEach((l, y) => { const inked = l < 225; if (inked && at < 0) at = y; if (!inked && at >= 0) { bands.push([at, y]); at = -1; } });
    if (at >= 0) bands.push([at, rows.length]);
    const tall = bands.map(([a, z]) => z - a);
    if (bands.length !== 2) fails.push(`quote: a two-line quote draws ${bands.length} bands of ink (${tall.map(h => (h / D).toFixed(1) + 'px').join(', ')}): ${bands.length > 2 ? 'the top of the hidden line shows' : 'its lines run together or are gone'} (at ${D}x)`);
    else if (Math.abs(tall[1] - tall[0]) > D + 1) fails.push(`quote: its second line is ${(tall[1] / D).toFixed(1)}px of ink, its first ${(tall[0] / D).toFixed(1)}px: ${tall[1] < tall[0] ? 'its descenders are cut' : 'the hidden line shows under it'} (at ${D}x)`);
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
    // A field's slots and a card's choice (D116): the box is as tall as a plain
    // input, its slots stay inside it and off the words, and the words keep
    // room; a card that is a choice is whole cells tall.
    fails.push(...await ax.evaluate(async () => {
      const fails = [], u = Trellis.cell(), host = document.createElement('div'), icon = '<svg class="icon" viewBox="0 0 14 14"><path d="M2 7h10"/></svg>';
      const btn = `<button class="button icon-button cc-ghost" type="button" aria-label="Act">${icon}</button>`, unit = t => `<span class="input-unit">${t}</span>`;
      host.className = 'stack'; host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; inline-size: min(100vw, calc(var(--u) * 26)); padding: var(--sp-1)';
      host.innerHTML = ['', 'cc-sm', 'cc-lg'].map(k => `<input class="input ${k}" value="Words"><div class="input cc-slots ${k}">${icon}<input class="input-control" value="Words">${btn}</div><div class="input cc-slots ${k}">${unit('https://')}<input class="input-control" value="25"></div><div class="input cc-slots ${k}">${unit('$')}<input class="input-control" type="number" value="25">${unit('a month')}</div>`).join('')
        + '<article class="card stack u-gap-1"><label class="choice card-choice"><input type="radio"><span class="choice-label cap-center">A title long enough to wrap here</span></label><p class="t-sm">What it is.</p></article>';
      document.body.appendChild(host); await Trellis.settled(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await Trellis.settled();
      const r = e => e.getBoundingClientRect(); let plain = 0;
      for (const b of host.querySelectorAll('.input')) {
        if (!b.matches('.cc-slots')) { plain = r(b).height; continue; }
        const c = b.querySelector('.input-control'), cs = getComputedStyle(c), rb = r(b), room = [r(c).left + parseFloat(cs.paddingLeft), r(c).right - parseFloat(cs.paddingRight)], name = `312%: a "${b.className}" of "${b.textContent}"`;
        if (Math.abs(rb.height - plain) > .1) fails.push(`${name} is ${rb.height.toFixed(1)}px tall, a plain input ${plain.toFixed(1)}px`);
        if (b.querySelectorAll('.input-unit').length < 2 && room[1] - room[0] < 4 * u) fails.push(`${name} leaves ${(room[1] - room[0]).toFixed(1)}px for its words`);
        for (const s of b.children) {
          if (s === c) continue;
          const rs = r(s), gap = rs.left < room[0] ? room[0] - rs.right : rs.left - room[1];
          if (gap < u / 2 - .6) fails.push(`${name}: "${s.textContent}" is ${gap.toFixed(1)}px from the words`);
          if (rs.top < rb.top - .5 || rs.bottom > rb.bottom + .5 || rs.left < rb.left - .5 || rs.right > rb.right + .5) fails.push(`${name}: "${s.textContent}" leaves the box`);
        }
      }
      const card = host.querySelector('.card'), h = r(card).height / u, l = card.querySelector('.choice-label');
      if (!l.hasAttribute('data-trellis-wrap')) fails.push('312%: the choice card did not wrap its title, so nothing was proved');
      if (Math.abs(h - Math.round(h)) > .05) fails.push(`312%: a choice card is ${h.toFixed(2)} cells tall`);
      if (r(l).right > r(card).right + .5 || host.scrollWidth > host.clientWidth + 1) fails.push('312%: a choice card or a field runs out of its column');
      host.remove();
      return fails;
    }));
    await ax.close();
  }
  // A choice past the cap: at 340% text its type is over three cells and the
  // page's line two, so a wrapped label's lines ran into each other, were
  // counted as one, and the row left the lines. Its line is never shorter than
  // its type now: the label is marked and its row whole cells. At default sizes
  // the line is the one it is in.
  {
    const ax = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: touch ? 3 : 1, isMobile: touch, hasTouch: touch });
    await ax.addInitScript(font => {
      const set = () => {
        if (!document.documentElement) return false;
        const s = document.documentElement.style; s.fontSize = '340%';
        if (font) ['--font-sans', '--font-serif', '--font-heading', '--font-mono'].forEach(v => s.setProperty(v, font));
        return true;
      };
      if (!set()) new MutationObserver((m, o) => { if (set()) o.disconnect(); }).observe(document, { childList: true });
    }, process.env.FONT || '');
    await ax.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
    await ready(ax);
    const build = async at => {
      const fails = [], u = Trellis.cell(), host = document.createElement('div');
      const whole = v => { const m = ((v % u) + u) % u; return m < .5 || m > u - .5; };
      host.className = 'stack';
      host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; inline-size: calc(var(--u) * 10)';
      host.innerHTML = ['', 'cc-sm', 'cc-lg'].map(k => `<label class="choice ${k}"><input type="checkbox"><span class="choice-label cap-center">Not yet, and not for a day</span></label>`).join('') + ['Not yet', 'A'].map(t => `<label class="choice"><input type="radio"><span class="choice-label cap-center">${t}</span></label>`).join('');
      document.body.appendChild(host); await Trellis.settled();
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await Trellis.settled();
      let wrapped = 0;
      for (const c of host.children) {
        const l = c.querySelector('.choice-label'), h = c.getBoundingClientRect().height, name = `${at}: a "${c.className}"`, fs = parseFloat(getComputedStyle(l).fontSize), lh = parseFloat(getComputedStyle(l).lineHeight);
        const range = document.createRange(); range.selectNodeContents(l);
        const tops = [...new Set([...range.getClientRects()].filter(b => b.width > 0).map(b => Math.round(b.top)))].sort((a, b) => a - b);
        if (tops.length > 1) wrapped++;
        if (!whole(h)) fails.push(`${name} is ${(h / u).toFixed(3)} cells tall`);
        if ((tops.length > 1) !== l.hasAttribute('data-trellis-wrap')) fails.push(`${name} of ${tops.length} lines is ${tops.length > 1 ? 'not ' : ''}marked as wrapped`);
        if (tops.length > 1 && tops[1] - tops[0] < fs - 1) fails.push(`${name}'s lines are ${tops[1] - tops[0]}px apart, its type ${fs.toFixed(1)}px`);
        if (lh < fs - .05 || !whole(lh)) fails.push(`${name}'s line is ${lh}px, not whole cells and at least its type's ${fs.toFixed(1)}px`);
      }
      if (wrapped < 3) fails.push(`${at}: only ${wrapped} of the choices wrapped, so nothing was proved`);
      const line = getComputedStyle(host).lineHeight, choice = getComputedStyle(host.lastElementChild).lineHeight;
      host.remove();
      return { fails, line, choice };
    };
    const big = await ax.evaluate(build, '340%');
    fails.push(...big.fails);
    if (big.line === big.choice) fails.push(`340%: a choice's line is the page's, ${big.line}, so nothing was proved`);
    await ax.close();
    const usual = await page.evaluate(build, '100%');
    fails.push(...usual.fails);
    if (usual.line !== usual.choice) fails.push(`choice: at default sizes its line is ${usual.choice}, the page's ${usual.line}`);
  }
  // Controls (D115): a button's kinds and its outline, a quiet tag, a count on an
  // icon button's corner, a translucent bar, and two knobs. Colors are read as
  // drawn, composited on each ground of the ladder, in both themes.
  {
    await page.evaluate(() => {
      const host = document.createElement('div'); host.id = 'ctl';
      host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; z-index: 2147483647; inline-size: calc(var(--u) * 30); background: var(--bg)';
      const b = (k, c, more = '') => `<button class="button cc-sm ${c}" type="button" data-k="${k}" ${more}><span class="button-label">A</span></button>`;
      const set = `<div class="cluster">${b('alert', 'cc-alert')}${b('ok', 'cc-ok')}${b('o-accent', 'cc-primary cc-outline')}${b('o-alert', 'cc-alert cc-outline')}${b('o-ok', 'cc-ok cc-outline')}${b('o-none', 'cc-outline')}${b('o-own', 'cc-outline', 'style="--btn-color: var(--kind-event)"')}`
        + `<button class="tag cc-quiet" type="button" data-k="quiet"><span class="tag-label">A</span></button><span class="tag cc-quiet cc-outline" data-k="quiet-outline"><span class="tag-label">A</span></span><span class="tag cc-quiet cc-solid" data-k="quiet-solid"><span class="tag-label">A</span></span><button class="tag cc-quiet" type="button" aria-pressed="true" data-k="quiet-on"><span class="tag-label">A</span></button></div>`;
      host.innerHTML = ['--bg', '--bg-raised', '--bg-raised-2', '--bg-raised-3'].map(g => `<div data-g="${g}" style="background: var(${g})">${set}</div>`).join('')
        + `<div class="cluster" id="ctl-more">${b('plain', '')}${b('plain-off', '', 'disabled')}${['cc-alert', 'cc-ok', 'cc-alert cc-outline', 'cc-outline'].map((c, i) => b('off-' + i, c, i % 2 ? 'aria-disabled="true"' : 'disabled') + b('size-' + i, c)).join('')}${b('o-on', 'cc-alert cc-outline', 'aria-pressed="true"')}${b('o-on-off', 'cc-alert cc-outline', 'aria-pressed="true" disabled')}`
        + `${b('o-tint', 'cc-alert cc-outline', 'style="--btn-tint: 10%; --btn-border: transparent"')}${b('own', '', 'style="--btn-bg: rgb(0 60 0); --btn-ink: rgb(200 255 200); --btn-border: rgb(1 2 3)"')}${b('own-kind', 'cc-alert', 'style="--btn-bg: rgb(0 60 0); --btn-ink: rgb(200 255 200); --btn-border: rgb(1 2 3)"')}</div>`
        // Every control with a fill of its own, to hover and press (D120): each filled kind, alone
        // and selected, a button in a product's own color, and a solid tag in every kind, status,
        // stage and the neutral, and a selected one.
        + `<div class="cluster" id="ctl-press">${b('primary', 'cc-primary')}${b('primary-on', 'cc-primary', 'aria-pressed="true"')}${b('alert-on', 'cc-alert', 'aria-pressed="true"')}${b('ok-on', 'cc-ok', 'aria-pressed="true"')}`
        + `${b('seeded', 'u-seed', 'style="--seed: var(--kind-event); --btn-bg: var(--seeded-solid); --btn-ink: var(--seeded-solid-ink); --btn-border: var(--seeded-solid)"')}`
        + ['', 'cc-person', 'cc-group', 'cc-event', 'cc-course', 'cc-ok', 'cc-warn', 'cc-alert', 'cc-quiet', ...[1, 2, 3, 4, 5, 6, 7].map(n => 'cc-stage-' + n)].map(c => `<button class="tag cc-solid ${c}" type="button" data-k="solid${c ? '-' + c.slice(3) : ''}"><span class="tag-label">A</span></button>`).join('')
        + `<button class="tag cc-alert" type="button" aria-pressed="true" data-k="alert-tag-on"><span class="tag-label">A</span></button>`
        // And fills far from the flip, white or nearly, which keep their ink's state and must still show it.
        + `<div class="tabs cc-seg" role="tablist" aria-label="A"><button class="tab" role="tab" type="button" aria-selected="true" data-k="seg-on">A</button><button class="tab" role="tab" type="button" aria-selected="false">B</button></div>`
        + `<button class="chat-reaction" type="button" data-k="reaction"><span>3</span></button><button class="chat-reaction" type="button" aria-pressed="true" data-k="reaction-on"><span>3</span></button></div>`
        + `<div class="card" id="ctl-fill"><div class="media cc-fill"></div><div class="cluster">${b('f-alert', 'cc-alert cc-outline')}${b('f-none', 'cc-outline')}<div class="card">${b('f-nest', 'cc-alert cc-outline')}</div></div></div>`;
      document.body.appendChild(host);
      window.__ctl = {
        px: (...cs) => { const c = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }), g = c.getContext('2d', { willReadFrequently: true }); cs.forEach(v => { g.fillStyle = v; g.fillRect(0, 0, 1, 1); }); return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); },
        ratio: (a, b) => { const l = p => { const f = p.map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * f[0] + .7152 * f[1] + .0722 * f[2]; }; const x = l(a), y = l(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); },
        still: () => Promise.all(document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#ctl')).map(a => a.finished.catch(() => {}))),
        // A label on its control on its ground, as drawn.
        read: e => { const { px, ratio } = window.__ctl, cs = getComputedStyle(e), g = getComputedStyle(e.closest('[data-g]') || document.getElementById('ctl')).backgroundColor, under = px(g, cs.backgroundColor); return { r: ratio(px(g, cs.backgroundColor, cs.color), under), under }; },
        color: v => { const i = document.createElement('i'); i.style.color = v; document.getElementById('ctl').appendChild(i); const c = window.__ctl.px(getComputedStyle(i).color); i.remove(); return c; },
        theme: document.documentElement.getAttribute('data-theme'),
      };
    });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(async theme => { document.documentElement.setAttribute('data-theme', theme); scrollTo({ top: 0, left: 0, behavior: 'instant' }); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await window.__ctl.still(); }, theme);
      await page.mouse.move(width - 2, height - 2);
      fails.push(...await page.evaluate(theme => {
        const fails = [], { px, read, color } = window.__ctl, say = m => fails.push(`controls, ${theme}: ${m}`), q = k => document.querySelector(`#ctl [data-k="${k}"]`), cs = k => getComputedStyle(q(k));
        const same = (a, b, t = 1) => a.every((v, i) => Math.abs(v - b[i]) <= t);
        for (const row of document.querySelectorAll('#ctl [data-g]')) for (const e of row.querySelectorAll('[data-k]')) {
          const { r, under } = read(e), k = e.dataset.k;
          if (r < 4.5) say(`${k} on ${row.dataset.g}: its label is ${r.toFixed(2)}:1`);
          if (/^(alert|ok)$/.test(k) && !same(under, color(`var(--${k})`))) say(`a ${k} button fills with ${under}, not --${k} ${color(`var(--${k})`)}`);
          if (/^o-/.test(k) && !same(under, color(`var(${row.dataset.g})`))) say(`${k} has a ground of its own: ${under} on ${row.dataset.g}`);
          if (/^o-/.test(k) && !same(px(getComputedStyle(e).color), px(getComputedStyle(e).borderTopColor), 0)) say(`${k}'s edge is ${getComputedStyle(e).borderTopColor}, its label ${getComputedStyle(e).color}`);
        }
        // Outline: the kind's hue, where math.js says it reads; alone, the text's ink.
        for (const [k, v] of [['o-accent', 'accent'], ['o-alert', 'alert'], ['o-ok', 'ok'], ['o-own', 'kind-event'], ['o-none', 'text']]) {
          const got = px(cs(k).color), M = window.TrellisMath, hex = M.hex(M.outlineInk('#' + color(`var(--${v})`).map(x => ('0' + x.toString(16)).slice(-2)).join(''), theme)), want = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16));
          if (!same(got, want, 3)) say(`${k}'s ink is ${got}, where math.js has ${want}`);
        }
        if (!same(px(cs('o-none').color), color('var(--text)'), 0)) say(`an outline alone is ${cs('o-none').color}, not the text's ink`);
        if (String(px(cs('o-alert').color)) === String(px(cs('o-ok').color))) say('destructive and confirm outlines are one color');
        // Quiet: the neutral's tint and edge, secondary words; solid and selected, filled.
        if (!same(px(cs('quiet').color), color('var(--text-secondary)'), 0)) say(`a quiet tag's words are ${cs('quiet').color}`);
        { const t = document.createElement('span'); t.className = 'tag'; t.style.setProperty('--tag-color', 'var(--text-tertiary)'); q('quiet').parentElement.appendChild(t);
          const want = getComputedStyle(t); for (const p of ['backgroundColor', 'borderTopColor', 'height', 'borderTopLeftRadius']) if (want[p] !== cs('quiet')[p]) say(`a quiet tag's ${p} is ${cs('quiet')[p]}, not ${want[p]}`); t.remove(); }
        for (const k of ['quiet-solid', 'quiet-on']) if (!same(read(q(k)).under, color('var(--text-tertiary)'))) say(`${k} does not fill with the neutral: ${read(q(k)).under}`);
        // The box is a button's, whatever its kind; disabled is a disabled button.
        for (const i of [0, 1, 2, 3]) {
          for (const p of ['width', 'height', 'paddingLeft', 'borderTopWidth', 'borderTopLeftRadius', 'fontSize']) if (cs('size-' + i)[p] !== cs('plain')[p]) say(`${q('size-' + i).className}: ${p} is ${cs('size-' + i)[p]}, a plain button's ${cs('plain')[p]}`);
          for (const p of ['color', 'backgroundColor', 'borderTopColor', 'boxShadow']) if (cs('off-' + i)[p] !== cs('plain-off')[p]) say(`a disabled ${q('off-' + i).className}: ${p} is ${cs('off-' + i)[p]}, a disabled button's ${cs('plain-off')[p]}`);
        }
        // Selected: its wash, its edge in its ink and two lines thick; not when disabled.
        if (cs('o-on').boxShadow === 'none' || String(px(cs('o-on').borderTopColor)) !== String(px(cs('o-on').color)) || read(q('o-on')).r < 4) say(`a selected outline: shadow ${cs('o-on').boxShadow}, edge ${cs('o-on').borderTopColor}, label ${read(q('o-on')).r.toFixed(2)}:1`);
        if (cs('o-on-off').boxShadow !== 'none' || cs('o-on-off').borderTopColor !== cs('plain-off').borderTopColor) say('a disabled selected outline still draws its mark');
        // The tint, and a button a context paints itself, with a kind or without.
        { const i = document.createElement('i'); i.style.background = 'color-mix(in oklab, var(--alert) 10%, transparent)'; document.getElementById('ctl').appendChild(i);
          if (!same(read(q('o-tint')).under, px(getComputedStyle(document.getElementById('ctl')).backgroundColor, getComputedStyle(i).backgroundColor))) say(`--btn-tint: 10% draws ${read(q('o-tint')).under}`); i.remove();
          if (read(q('o-tint')).r < 4.5) say(`a tinted outline's label is ${read(q('o-tint')).r.toFixed(2)}:1`);
          if (!/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs('o-tint').borderTopColor)) say(`--btn-border does not reach an outline: ${cs('o-tint').borderTopColor}`); }
        for (const k of ['own', 'own-kind']) if (!same(px(cs(k).backgroundColor), [0, 60, 0], 2) || !same(px(cs(k).color), [200, 255, 200], 2) || !same(px(cs(k).borderTopColor), [1, 2, 3], 2)) say(`${k}: --btn-bg, --btn-ink and --btn-border set in markup draw ${cs(k).backgroundColor}, ${cs(k).color}, ${cs(k).borderTopColor}`);
        // On a full bleed an outline is white, whatever its kind; on a surface in it, its own.
        for (const k of ['f-alert', 'f-none']) if (String(px(cs(k).color)) !== '255,255,255' || String(px(cs(k).borderTopColor)) !== '255,255,255') say(`${k}, an outline on a full bleed, is ${cs(k).color}`);
        if (cs('f-nest').color !== cs('o-alert').color) say(`an outline on a card in a full bleed is ${cs('f-nest').color}, not ${cs('o-alert').color}`);
        return fails;
      }, theme));
      // Hovered, pressed and focused, on the ground where they read worst. Every label holds
      // 4.5:1 in every state, and each state is a step from the one before it, a hundredth
      // of OKLab at least, read from the drawn ground (D120).
      const pressable = await page.evaluate(() => [...document.querySelectorAll('#ctl-press [data-k]')].map(e => e.dataset.k));
      const apart = (a, b) => page.evaluate(([a, b]) => {
        const M = window.TrellisMath, lab = c => { const o = M.parseColor('#' + c.map(x => ('0' + x.toString(16)).slice(-2)).join('')); return [o[0], o[1] * Math.cos(o[2] * Math.PI / 180), o[1] * Math.sin(o[2] * Math.PI / 180)]; };
        const x = lab(a), y = lab(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
      }, [a, b]);
      for (const k of ['alert', 'ok', 'o-accent', 'o-alert', 'o-ok', 'o-none', 'quiet', ...pressable]) {
        const sel = pressable.includes(k) ? `#ctl-press [data-k="${k}"]` : `#ctl [data-g="--bg-raised-3"] [data-k="${k}"]`, p = await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 }; }, sel);
        const state = () => page.evaluate(async s => { await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await window.__ctl.still(); const e = document.querySelector(s), { r, under } = window.__ctl.read(e); return { r, under, act: getComputedStyle(e).getPropertyValue('--state-act').trim() }; }, sel);
        const rest = await state();
        if (rest.r < 4.5) fails.push(`controls, ${theme}: ${k} at rest is ${rest.r.toFixed(2)}:1`);
        let before = rest;
        await page.mouse.move(p.x, p.y);
        if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
          const s = await state(), d = await apart(rest.under, s.under);
          if (s.act !== '6%' || s.r < 4.5) fails.push(`controls, ${theme}: ${k} hovered is ${s.r.toFixed(2)}:1 (${s.act})`);
          if (d < .01) fails.push(`controls, ${theme}: ${k} hovered is ${d.toFixed(4)} from rest in OKLab, too near to tell apart`);
          before = s;
        }
        await page.mouse.down();
        const s = await state(), d = await apart(before.under, s.under);
        if (s.act !== '12%' || s.r < 4.5) fails.push(`controls, ${theme}: ${k} pressed is ${s.r.toFixed(2)}:1 (${s.act})`);
        if (d < .01) fails.push(`controls, ${theme}: ${k} pressed is ${d.toFixed(4)} from ${before === rest ? 'rest' : 'hovered'} in OKLab, too near to tell apart`);
        await page.mouse.move(width - 2, height - 2); await page.mouse.up();
      }
      await page.keyboard.press('Tab');
      fails.push(...await page.evaluate(theme => {
        const fails = [], { px, color } = window.__ctl;
        for (const k of ['alert', 'ok', 'o-accent', 'o-alert', 'o-none', 'quiet']) {
          const e = document.querySelector(`#ctl [data-k="${k}"]`); e.focus({ preventScroll: true });
          const cs = getComputedStyle(e);
          if (!e.matches(':focus-visible') || cs.outlineStyle !== 'solid' || String(px(cs.outlineColor)) !== String(color('var(--focus)'))) fails.push(`controls, ${theme}: ${k} focused draws ${cs.outlineStyle} ${cs.outlineColor}`);
        }
        document.activeElement.blur();
        return fails;
      }, theme));
    }
    // Forced colors: a filled kind and an outline are outlined by their border.
    await page.emulateMedia({ forcedColors: 'active' });
    fails.push(...await page.evaluate(() => {
      const fails = [];
      if (!matchMedia('(forced-colors: active)').matches) return fails;
      for (const k of ['alert', 'ok', 'o-alert', 'o-none', 'quiet']) {
        const cs = getComputedStyle(document.querySelector(`#ctl [data-k="${k}"]`));
        if (cs.borderTopStyle !== 'solid' || !(parseFloat(cs.borderTopWidth) > 0) || /^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.borderTopColor)) fails.push(`forced colors: ${k} has no edge (${cs.borderTopStyle} ${cs.borderTopColor})`);
      }
      return fails;
    }));
    await page.emulateMedia({ forcedColors: 'none' });
    await page.evaluate(() => { const t = window.__ctl.theme; if (t === null) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); document.getElementById('ctl').remove(); });

    // The count on the corner: where it sits at each size, its button's box and
    // place untouched, its clicks the button's, on touch the whole 44px, and
    // past the cap, room for it and the icon clear.
    const corner = async (pg, at) => pg.evaluate(async at => {
      const fails = [], u = Trellis.cell(), host = document.createElement('div'), root = document.documentElement, r = e => e.getBoundingClientRect(), big = at !== '100%';
      const icon = '<svg class="icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10"/></svg>';
      const ib = (c, n, more = '') => `<button class="button icon-button ${c}" type="button" aria-label="A, ${n}" ${more}>${icon}${n === null ? '' : `<span class="badge cc-corner" aria-hidden="true">${n}</span>`}</button>`;
      host.id = 'corner-test'; host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline: 0; padding: calc(var(--u) * 4); background: var(--bg); z-index: 2147483647';
      const sizes = ['cc-sm', 'cc-md', '', 'cc-lg', 'cc-ghost'];
      host.innerHTML = sizes.map((c, i) => `<div class="cluster" data-row="${i}">${ib(c, 3)}${ib(c, null)}</div><div class="cluster" data-more="${i}">${ib(c, '99+')}${ib(c, null)}</div>`).join('')
        + `<div class="cluster" data-place>${ib('', null)}${ib('', null)}</div><div class="cluster" data-hide>${ib('', 3).replace('cc-corner"', 'cc-corner" hidden')}</div>`
        + `<div style="--button-tracking: .2em; --button-case: uppercase" data-face>${ib('', 'new')}</div><div style="display: flex; justify-content: flex-end" data-end>${ib('', '99+')}</div>`;
      document.body.appendChild(host); await Trellis.settled();
      sizes.forEach((c, i) => {
        const [btn, next] = host.querySelector(`[data-row="${i}"]`).children, b = r(btn), badge = btn.querySelector('.badge'), n = r(badge), g = r(btn.querySelector('.icon')), name = `${at}: a count on "${c || 'default'}"`;
        const past = { top: b.top - n.top, end: n.right - b.right };
        if (!big) {
          // At default sizes: a quarter cell past the corner from three cells up, its inner corner short of the middle by a quarter cell below that.
          const want = Math.max(u / 4, 1.5 * u - (b.width / 2 - u / 4));
          if (Math.abs(past.top - want) > 1.1 || Math.abs(past.end - want) > 1.1) fails.push(`${name} stands ${past.top.toFixed(2)} and ${past.end.toFixed(2)}px past the corner, not ${want.toFixed(2)}`);
          if (getComputedStyle(btn).marginTop !== '0px' || getComputedStyle(btn).marginRight !== '0px') fails.push(`${name} moved its button: ${getComputedStyle(btn).margin}`);
          if (b.width !== r(next).width || b.height !== r(next).height || Math.abs(b.top - r(next).top) > .1) fails.push(`${name} changed its button's box`);
        } else {
          if (!(n.height > 1.5 * u + .5)) fails.push(`${name} did not grow with its type (${n.height.toFixed(1)}px)`);
          if (n.right > r(next).left + u / 4 + .5 && Math.abs(r(next).top - b.top) < u * 2 && n.bottom > r(next).top) fails.push(`${name} covers the next button by ${(n.right - r(next).left).toFixed(1)}px`);
          if (n.top < r(btn.parentElement).top - u) fails.push(`${name} stands ${(r(btn.parentElement).top - n.top).toFixed(1)}px above its row`);
        }
        // The icon's middle is clear, and at most a quarter of it is under one figure.
        const w = Math.max(0, Math.min(n.right, g.right) - Math.max(n.left, g.left)), h = Math.max(0, Math.min(n.bottom, g.bottom) - Math.max(n.top, g.top));
        if (w * h > g.width * g.height / 4 + 1) fails.push(`${name} covers ${Math.round(100 * w * h / (g.width * g.height))}% of the icon`);
        if (badge.scrollWidth > badge.clientWidth + 1) fails.push(`${name}: its figure is wider than it`);
        const many = host.querySelector(`[data-more="${i}"] .badge`), m = r(many), mb = r(many.parentElement);
        if (Math.abs((m.right - mb.right) - past.end) > .6) fails.push(`${name}: more figures do not grow inward`);
        // A click on the count is its button's; on touch the whole target is.
        const hits = [[(n.left + n.right) / 2, (n.top + n.bottom) / 2]];
        if (matchMedia('(pointer: coarse)').matches) { const t = Math.max(44, b.width) / 2 - 1; hits.push([(b.left + b.right) / 2 - t, (b.top + b.bottom) / 2], [(b.left + b.right) / 2, (b.top + b.bottom) / 2 + t]); }
        btn.style.zIndex = 1;
        for (const [x, y] of hits) { const e = document.elementFromPoint(x, y); if (!e || e.closest('button') !== btn) fails.push(`${name}: a tap at ${(x - b.left).toFixed(0)},${(y - b.top).toFixed(0)} misses it`); }
        btn.style.zIndex = '';
      });
      if (host.querySelector('[data-hide] .badge').getClientRects().length) fails.push(`${at}: a hidden count is drawn`);
      { const cs = getComputedStyle(host.querySelector('[data-face] .badge')); if (!/^(0px|normal)$/.test(cs.letterSpacing) || cs.textIndent !== '0px' || cs.textTransform !== 'none') fails.push(`${at}: a count takes its button's face (${cs.letterSpacing}, ${cs.textIndent}, ${cs.textTransform})`); }
      { const e = r(host.querySelector('[data-end] .badge')); if (e.right > r(host).right - u * 3 + .5) fails.push(`${at}: a count at a row's end runs ${(e.right - r(host).right + u * 4).toFixed(1)}px past it`); }
      if (root.scrollWidth > root.clientWidth + 1) fails.push(`${at}: the page scrolls sideways (${root.scrollWidth} of ${root.clientWidth})`);
      host.remove();
      return fails;
    }, at);
    fails.push(...await corner(page, '100%'));
    {
      const ax = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: touch ? 3 : 1, isMobile: touch, hasTouch: touch });
      await ax.addInitScript(font => {
        const set = () => { if (!document.documentElement) return false; const s = document.documentElement.style; s.fontSize = '312%'; if (font) ['--font-sans', '--font-serif', '--font-heading', '--font-mono'].forEach(v => s.setProperty(v, font)); return true; };
        if (!set()) new MutationObserver((m, o) => { if (set()) o.disconnect(); }).observe(document, { childList: true });
      }, process.env.FONT || '');
      await ax.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
      await ready(ax);
      fails.push(...await corner(ax, '312%'));
      // The kinds hold their type, as a plain button does.
      fails.push(...await ax.evaluate(() => {
        const fails = [], u = Trellis.cell(), plain = document.querySelector('.button:not(.icon-button, .cc-sm, .cc-md, .cc-lg)').getBoundingClientRect().height;
        for (const e of document.querySelectorAll('#demo-kinds .button, #demo-outline .button')) { const h = e.getBoundingClientRect().height, l = e.querySelector('.button-label').getBoundingClientRect().height; if (Math.abs(h - plain) > .5 || h < parseFloat(getComputedStyle(e).fontSize) - .5 || l > h) fails.push(`312%: ${e.className} is ${h.toFixed(1)}px, a plain button ${plain.toFixed(1)}px`); }
        if (!document.querySelector('#demo-kinds .button') || !document.querySelector('#demo-outline .button')) fails.push('312%: the specimen has no kinds to check');
        return fails;
      }));
      await ax.close();
    }

    // The bar: opaque and not blurred unless it is told to be; told, what it is
    // told, and the words on it hold over black and over white; its tray is still
    // the screen's; opaque in forced colors and with less transparency asked for.
    fails.push(...await page.evaluate(async () => {
      const fails = [], px = (...cs) => { const c = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }), g = c.getContext('2d', { willReadFrequently: true }); cs.forEach(v => { g.fillStyle = v; g.fillRect(0, 0, 1, 1); }); return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
      const lum = p => { const f = p.map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * f[0] + .7152 * f[1] + .0722 * f[2]; }, ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
      const root = document.documentElement, was = root.getAttribute('data-theme');
      for (const theme of ['light', 'dark']) {
        root.setAttribute('data-theme', theme);
        for (const id of ['demo-shell-wide', 'demo-shell-narrow', 'demo-top-wide', 'demo-top-narrow']) {
          const nav = document.querySelector(`#${id} .shell-nav`), cs = getComputedStyle(nav), i = document.createElement('i');
          i.style.background = 'var(--surface)'; nav.appendChild(i); const surface = getComputedStyle(i).backgroundColor; i.remove();
          if (cs.backgroundColor !== surface || cs.backdropFilter !== 'none') fails.push(`bar, ${theme}: ${id} paints ${cs.backgroundColor} and ${cs.backdropFilter} by default, not ${surface} and no filter`);
          for (const g of ['--bg', '--bg-raised']) {
            nav.style.setProperty('--shell-nav-bg', `color-mix(in oklab, var(${g}) 85%, transparent)`); nav.style.setProperty('--shell-nav-blur', 'var(--sp-1)');
            const now = getComputedStyle(nav), blur = `blur(${parseFloat(getComputedStyle(nav).paddingLeft) >= 0 ? Trellis.cell() : 0}px)`;
            if (now.backdropFilter !== blur) fails.push(`bar, ${theme}: ${id} blurs ${now.backdropFilter}, not ${blur}`);
            if (String(px('black', now.backgroundColor)) === String(px('white', now.backgroundColor))) fails.push(`bar, ${theme}: ${id} lets nothing through`);
            for (const behind of ['black', 'white']) for (const e of nav.querySelectorAll('.shell-link, .shell-brand')) {
              if (!e.getClientRects().length) continue;
              const under = px(behind, now.backgroundColor, getComputedStyle(e).backgroundColor), r = ratio(px(`rgb(${under.join(' ')})`, getComputedStyle(e).color), under);
              if (r < 4.5) fails.push(`bar, ${theme}: "${e.textContent.trim()}" on 85% of ${g} over ${behind} is ${r.toFixed(2)}:1 in ${id}`);
            }
          }
          nav.style.removeProperty('--shell-nav-bg'); nav.style.removeProperty('--shell-nav-blur');
        }
      }
      if (was === null) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', was);
      // The tray of a narrow top bar that blurs.
      const nav = document.querySelector('#demo-top-narrow .shell-nav'), tray = nav.querySelector('.shell-links');
      const at = async () => { tray.showPopover(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await Promise.all(tray.getAnimations().map(a => a.finished.catch(() => {}))); const b = tray.getBoundingClientRect(); tray.hidePopover(); return [b.left, b.top, b.width, b.height].map(v => v.toFixed(1)).join(' '); };
      const plain = await at(); nav.style.setProperty('--shell-nav-blur', 'var(--sp-1)'); const blurred = await at(); nav.style.removeProperty('--shell-nav-blur');
      if (plain !== blurred) fails.push(`bar: its tray opens at ${blurred} when the bar blurs, ${plain} when it doesn't`);
      return fails;
    }));
    const opaque = how => page.evaluate(how => {
      const fails = [], nav = document.querySelector('#demo-top-wide .shell-nav');
      nav.style.setProperty('--shell-nav-bg', 'rgb(128 128 128 / .5)'); nav.style.setProperty('--shell-nav-blur', 'var(--sp-1)');
      const cs = getComputedStyle(nav), px = b => { const c = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }), g = c.getContext('2d', { willReadFrequently: true }); for (const v of [b, cs.backgroundColor]) { g.fillStyle = v; g.fillRect(0, 0, 1, 1); } return String(g.getImageData(0, 0, 1, 1).data); };
      if (px('black') !== px('white') || cs.backdropFilter !== 'none') fails.push(`${how}: a translucent bar paints ${cs.backgroundColor} and ${cs.backdropFilter}`);
      nav.style.removeProperty('--shell-nav-bg'); nav.style.removeProperty('--shell-nav-blur');
      return fails;
    }, how);
    await page.emulateMedia({ forcedColors: 'active' });
    if (await page.evaluate(() => matchMedia('(forced-colors: active)').matches)) fails.push(...await opaque('forced colors'));
    await page.emulateMedia({ forcedColors: 'none' });
    if (engine === 'chromium') {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
      if (await page.evaluate(() => matchMedia('(prefers-reduced-transparency: reduce)').matches)) fails.push(...await opaque('less transparency'));
      else fails.push('less transparency: the engine did not emulate it, so nothing was proved');
      await cdp.send('Emulation.setEmulatedMedia', { features: [] });
      await cdp.detach();
    }

    // Two knobs: a face for code, and a dense card's corner, which its padding still clears (D113).
    fails.push(...await page.evaluate(() => {
      const fails = [], u = Trellis.cell(), root = document.documentElement, host = document.createElement('div');
      host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; inline-size: calc(var(--u) * 30); visibility: hidden';
      host.innerHTML = '<p class="t-body t-mono" id="kn-mono">a</p><div class="prose"><p><code id="kn-code">a</code></p><pre id="kn-pre">a</pre></div><div data-product="kn"><p class="t-mono" id="kn-scope">a</p></div>'
        + '<div class="cc-dense"><div class="card" id="kn-dense">a</div></div><div class="card cc-dense" id="kn-self">a</div><div class="card" id="kn-card">a</div><div data-product="kn"><div class="cc-dense"><div class="card" id="kn-in">a</div></div></div><div class="cc-dense"><div class="card" style="--card-pad: var(--sp-4)"><div class="card" id="kn-nest">a</div></div></div>';
      document.body.appendChild(host);
      const cs = id => getComputedStyle(document.getElementById(id)), corner = id => parseFloat(cs(id).borderTopLeftRadius) / u, pad = id => [parseFloat(cs(id).paddingLeft) / u, parseFloat(cs(id).paddingTop) / u], near = (a, b) => Math.abs(a - b) < .02;
      for (const id of ['kn-mono', 'kn-code', 'kn-pre', 'kn-scope']) if (!/^"?IBM Plex Mono/.test(cs(id).fontFamily)) fails.push(`--font-mono: ${id} is ${cs(id).fontFamily} by default`);
      root.style.setProperty('--font-mono', 'Courier New');
      for (const id of ['kn-mono', 'kn-code', 'kn-pre', 'kn-scope']) if (!/^"?Courier New/.test(cs(id).fontFamily)) fails.push(`--font-mono: ${id} is ${cs(id).fontFamily}, not the knob's`);
      root.style.removeProperty('--font-mono');
      const card = corner('kn-card'), nest = corner('kn-nest');
      for (const id of ['kn-dense', 'kn-self', 'kn-in']) if (!near(corner(id), 1) || !pad(id).every(p => near(p, 1))) fails.push(`a dense card (${id}) has a corner of ${corner(id)} cells and padding ${pad(id)} by default, not 1 and 1`);
      for (const [n, want] of [[0, 1], [.25, 1], [2, 1], [5, 2]]) {
        root.style.setProperty('--shape-card-dense', `calc(var(--u) * ${n})`);
        for (const id of ['kn-dense', 'kn-self', 'kn-in']) {
          if (!near(corner(id), n)) fails.push(`--shape-card-dense: a dense card (${id}) has a corner of ${corner(id)} cells, not ${n}`);
          if (!pad(id).every(p => near(p, want))) fails.push(`--shape-card-dense at ${n}: a dense card (${id}) pads ${pad(id)} cells, not ${want}`);
        }
        if (!near(corner('kn-card'), card)) fails.push('--shape-card-dense reaches a card that is not dense');
      }
      if (near(corner('kn-nest'), nest)) fails.push('a card in a dense card is not concentric with its corner');
      root.style.removeProperty('--shape-card-dense');
      host.remove();
      return fails;
    }));
  }
  // Icons (D118): what each kind of drawing draws, read as an amount of ink from a
  // screenshot (the line's width, whatever the antialiasing), then color and size.
  {
    const at = await page.evaluate(async () => {
      const host = document.createElement('div'); host.id = 'ic-test';
      host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; z-index: 2147483647; display: grid; grid-template-columns: repeat(6, max-content); gap: var(--u); padding: var(--u); background: #fff; color: #000; --icon-size: calc(var(--u) * 4)';
      const G = 'fill="none" stroke="currentColor"', line = '<path d="M40,128H216"/>', minus = '<path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"/>', left = '<path d="M0,0H64V256H0Z"/>';
      const use = (id, style = '', cls = '') => `<svg class="icon cc-phosphor ${cls}" style="${style}" aria-hidden="true"><use href="#ic-${id}"/></svg>`;
      const ph = (b, style = '') => `<svg class="icon cc-phosphor" viewBox="0 0 256 256" style="${style}" aria-hidden="true">${b}</svg>`;
      const pic = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>');
      // [name, markup, the ink it should draw as a share of its box]
      const stroke = w => (176 * w + Math.PI * w * w / 4) / 65536, dot = r => Math.PI * r * r / 65536, old = (10 * 1.5 + Math.PI * .75 ** 2) / 196;
      const all = [
        ['a drawing in strokes, by use', use('line'), stroke(16)], ['at weight 8', use('line', '--icon-weight: 8'), stroke(8)], ['at weight 24', use('line', '--icon-weight: 24'), stroke(24)],
        ['in a context at weight 12', `<span style="--icon-weight: 12">${use('line')}</span>`, stroke(12)], ['inline, at weight 20', ph(`<g ${G}>${line}</g>`, '--icon-weight: 20'), stroke(20)],
        ['a raw file as it comes, its own weight 24 kept', ph(`<rect width="256" height="256" fill="none"/><path d="M40,128H216" ${G} stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/>`, '--icon-weight: 8'), stroke(24)],
        ['an outlined file', ph(minus), stroke(16)], ['an outlined file at another weight', ph(minus, '--icon-weight: 24; --icon-stroke: 9'), stroke(16)],
        ['a dot', use('dot'), dot(12)], ['a dot at weight 8', use('dot', '--icon-weight: 8'), dot(8)],
        ['a tone', use('tone'), .2 * 128 * 128 / 65536], ['a tone of its own', use('tone', '--icon-tone: #000'), 128 * 128 / 65536], ['a raw duotone', ph('<path d="M64,64H192V192H64Z" opacity="0.2"/>'), .2 * 128 * 128 / 65536],
        ['a stroke icon', '<svg class="icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10"/></svg>', old], ['a stroke icon where Phosphor has a weight', '<span style="--icon-weight: 24"><svg class="icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10"/></svg></span>', old],
        ['a stroke icon at 3', '<svg class="icon" style="--icon-stroke: 3" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10"/></svg>', (30 + Math.PI * 1.5 ** 2) / 196], ['a filled group in a stroke icon', '<svg class="icon" viewBox="0 0 14 14" aria-hidden="true"><g fill="currentColor" stroke="none"><path d="M0 0h7v14H0z"/></g></svg>', .5],
        ['a tone in a stroke icon', '<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path class="icon-tone" d="M0 0h8v16H0z"/></svg>', .1],
        ['a picture twice as wide as tall', `<img class="icon" src="${pic}" alt="">`, .5], ['a square picture in prose, its corners kept', `<div class="prose"><img class="icon" src="${pic.replaceAll('%2220%22', '%2240%22')}" alt=""></div>`, 1],
        // Mirrored: [share, the share of the ink in its left half]
        ['left to right, a mirror', use('left', '', 'cc-mirror'), .25, 1], ['right to left, a mirror', `<span dir="rtl">${use('left', '', 'cc-mirror')}</span>`, .25, 0], ['right to left, no mirror', `<span dir="rtl">${use('left')}</span>`, .25, 1],
        ['left to right inside right to left', `<span dir="rtl"><span dir="ltr">${use('left', '', 'cc-mirror')}</span></span>`, .25, 1], ['a stroke set, mirrored', '<span dir="rtl"><svg class="icon cc-mirror" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" stroke="none" d="M0 0h4v16H0z"/></svg></span>', .25, 0],
      ];
      host.innerHTML = `<svg hidden aria-hidden="true"><symbol id="ic-line" viewBox="0 0 256 256"><g ${G}>${line}</g></symbol><symbol id="ic-dot" viewBox="0 0 256 256"><g ${G}><circle cx="128" cy="128" r="4" fill="currentColor"/></g></symbol>`
        + `<symbol id="ic-tone" viewBox="0 0 256 256"><path class="icon-tone" d="M64,64H192V192H64Z"/></symbol><symbol id="ic-left" viewBox="0 0 256 256">${left}</symbol></svg>` + all.map(([, m], i) => `<div data-i="${i}" style="display: grid">${m}</div>`).join('');
      document.body.appendChild(host);
      scrollTo({ top: 0, left: 0, behavior: 'instant' });
      await Promise.all([...host.querySelectorAll('img')].map(i => i.decode())); await Trellis.settled();
      const h = host.getBoundingClientRect();
      return all.map(([name, , want, half], i) => { const e = host.querySelector(`[data-i="${i}"]`).querySelector('.icon').getBoundingClientRect(); return { name, want, half, x: e.x - h.x, y: e.y - h.y, w: e.width, h: e.height, W: h.width }; });
    });
    const png = (await page.locator('#ic-test').screenshot()).toString('base64');
    fails.push(...await page.evaluate(async ([png, at]) => {
      const fails = [], img = new Image(), u = Trellis.cell(); img.src = 'data:image/png;base64,' + png; await img.decode();
      const c = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height }), g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const k = img.width / at[0].W;
      for (const a of at) {
        if (Math.abs(a.w - u * 4) > .1 || Math.abs(a.h - u * 4) > .1) fails.push(`icons: ${a.name}: ${a.w.toFixed(1)} by ${a.h.toFixed(1)}px at four cells (${(u * 4).toFixed(1)})`);
        const x = Math.round((a.x - 1) * k), y = Math.round((a.y - 1) * k), w = Math.round((a.w + 2) * k), h = Math.round((a.h + 2) * k), d = g.getImageData(x, y, w, h).data;
        let ink = 0, left = 0;
        for (let j = 0; j < d.length; j += 4) { const v = 1 - (d[j] + d[j + 1] + d[j + 2]) / 765; ink += v; if ((j / 4) % w < w / 2) left += v; }
        const got = ink / (a.w * a.h * k * k);
        if (Math.abs(got - a.want) > (/picture/.test(a.name) ? .03 : Math.max(.006, a.want * .04))) fails.push(`icons: ${a.name}: draws ${(got * 100).toFixed(2)}% of its box, not ${(a.want * 100).toFixed(2)}%`);
        if (a.half !== undefined && Math.abs(left / ink - a.half) > .05) fails.push(`icons: ${a.name}: ${Math.round(100 * left / ink)}% of its ink is on the left, not ${a.half * 100}%`);
      }
      document.getElementById('ic-test').remove();
      // Every use in the specimen names a drawing it holds, and every icon is
      // either drawn and nothing more, or named.
      for (const e of document.querySelectorAll('.icon use')) if (!document.querySelector(e.getAttribute('href'))) fails.push(`icons: the specimen has no ${e.getAttribute('href')}`);
      for (const e of document.querySelectorAll('.icon')) if (e.tagName === 'IMG' ? !e.hasAttribute('alt') : !e.closest('[aria-hidden="true"]') && !(e.getAttribute('role') === 'img' && e.getAttribute('aria-label'))) fails.push(`icons: one in the specimen is neither hidden nor named: ${e.outerHTML.slice(0, 120)}`);
      return fails;
    }, [png, at]));
    // Color: the ink around it, or a role, which gives way to a color set on the
    // icon, to a disabled control and to forced colors; then size and the knob.
    await page.evaluate(() => {
      const host = document.createElement('div'); host.id = 'ic-color';
      host.style.cssText = 'position: absolute; inset-block-start: 0; inset-inline-start: 0; color: rgb(1 2 3)';
      const ic = (id, style = '', cls = '') => `<svg class="icon cc-phosphor ${cls}" id="${id}" style="${style}" viewBox="0 0 256 256" aria-hidden="true"><path class="icon-tone" d="M0,0H9V9Z"/></svg>`, own = '--icon-color: rgb(4 5 6)';
      host.innerHTML = '<style>@layer trellis.utilities { .ic-set { color: rgb(7 8 9); } }</style>' + ic('ic-ink') + ic('ic-own', own) + `<span style="${own}">${ic('ic-ctx')}</span>` + ic('ic-set', own, 'ic-set') + `<svg class="icon" id="ic-stroke" style="${own}" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10"/></svg>`
        + `<button class="button icon-button" type="button" id="ic-b" aria-label="A">${ic('ic-in', own)}</button><button class="button" type="button" disabled id="ic-off-b">${ic('ic-off', own)}</button><button class="button" type="button" aria-disabled="true" id="ic-aria-b">${ic('ic-aria', own)}</button><fieldset disabled>${ic('ic-set2', own)}</fieldset>`
        + ['sm', '', 'md', 'lg'].map(k => ic('ic-s' + k, `--icon-size: var(--size-icon${k && '-' + k})`)).join('') + `<div data-product="ic">${ic('ic-scope')}</div>`;
      document.body.appendChild(host);
    });
    fails.push(...await page.evaluate(() => {
      const fails = [], $ = id => document.getElementById(id), cs = id => getComputedStyle($(id)), u = Trellis.cell(), root = document.documentElement, is = (id, p, want, what) => { if (cs(id)[p] !== want) fails.push(`icons: ${what}: its ${p} is ${cs(id)[p]}, not ${want}`); };
      is('ic-ink', 'color', 'rgb(1, 2, 3)', 'one with no color of its own');
      for (const [id, what] of [['ic-own', 'one with --icon-color'], ['ic-ctx', 'one in a context with --icon-color'], ['ic-stroke', 'a stroke icon with --icon-color'], ['ic-in', 'one in a button, with --icon-color'], ['ic-set2', 'one in a disabled fieldset, in no control']]) is(id, 'color', 'rgb(4, 5, 6)', what);
      is('ic-own', 'fill', 'rgb(4, 5, 6)', 'a Phosphor drawing'); is('ic-own', 'stroke', 'none', 'a Phosphor drawing'); is('ic-stroke', 'stroke', 'rgb(4, 5, 6)', 'a stroke icon'); is('ic-stroke', 'fill', 'none', 'a stroke icon');
      is('ic-set', 'color', 'rgb(7, 8, 9)', 'one whose own class sets a color');
      for (const k of ['off', 'aria']) is('ic-' + k, 'color', getComputedStyle($(`ic-${k}-b`)).color, 'one in a disabled button');
      const r = e => e.getBoundingClientRect(), b = r($('ic-b')), i = r($('ic-in'));
      if (Math.abs(b.x + b.width / 2 - i.x - i.width / 2) > .51 || Math.abs(b.y + b.height / 2 - i.y - i.height / 2) > .51) fails.push('icons: one is not in the middle of its icon button');
      const px = v => { const e = document.createElement('i'); e.style.cssText = `position: absolute; width: ${v}`; document.body.appendChild(e); const w = e.getBoundingClientRect().width; e.remove(); return w; };
      for (const [k, n] of [['sm', 1], ['', 0], ['md', 1.5], ['lg', 2]]) { const q = r($('ic-s' + k)), want = n ? n * u : u + 2 * px('var(--line)'); if (Math.abs(q.width - want) > .1 || Math.abs(q.height - want) > .1) fails.push(`icons: --size-icon${k && '-' + k} draws ${q.width.toFixed(2)} by ${q.height.toFixed(2)}px, not ${want.toFixed(2)}`); }
      // The knob: 16 unless a product or a scope sets it.
      const w = id => parseFloat(cs(id).strokeWidth);
      if (w('ic-ink') !== 16 || w('ic-scope') !== 16) fails.push(`icons: a weight of ${w('ic-ink')} by default, not 16`);
      const style = document.createElement('style'); style.textContent = '@layer trellis.product { :root { --icon-weight: 12; } [data-product="ic"] { --icon-weight: 8; } }'; document.head.appendChild(style);
      if (w('ic-ink') !== 12 || w('ic-scope') !== 8) fails.push(`icons: a product's weight of 12 and a scope's of 8 draw ${w('ic-ink')} and ${w('ic-scope')}`);
      style.remove();
      return fails;
    }));
    if (engine !== 'webkit') {
      await page.emulateMedia({ forcedColors: 'active' });
      fails.push(...await page.evaluate(() => {
        const fails = [], cs = id => getComputedStyle(document.getElementById(id)), sys = v => { const e = document.createElement('i'); e.style.cssText = `forced-color-adjust: none; color: ${v}`; document.body.appendChild(e); const c = getComputedStyle(e).color; e.remove(); return c; };
        for (const id of ['ic-own', 'ic-ctx', 'ic-stroke']) if (cs(id).color !== sys('CanvasText')) fails.push(`icons: in forced colors ${id} is ${cs(id).color}, not the system's ${sys('CanvasText')}`);
        if (cs('ic-in').color !== sys('ButtonText')) fails.push(`icons: in forced colors one in a button is ${cs('ic-in').color}, not ${sys('ButtonText')}`);
        return fails;
      }));
      // A tone of the product's own is the ink's again.
      await page.evaluate(() => document.getElementById('ic-own').style.setProperty('--icon-tone', 'rgb(250 1 1)'));
      fails.push(...await page.evaluate(() => { const f = getComputedStyle(document.querySelector('#ic-own .icon-tone')).fill; return /250/.test(f) ? ['icons: in forced colors a tone keeps its own color, ' + f] : []; }));
      await page.emulateMedia({ forcedColors: 'none' });
    }
    await page.evaluate(() => document.getElementById('ic-color').remove());
  }
  await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]); // WebKit on Windows can hang on close
  console.log(`${engine} ${size}${touch ? ' touch' : ''}: layout ${fails.length ? fails.length + ' FAILED' : 'ok'}`);
  fails.forEach(f => console.log('  ' + f));
  process.exit(fails.length ? 1 : 0);
})();
