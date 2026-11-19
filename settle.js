/* Trellis · runtime · v0.10
   The foundation is CSS plus this one small script. Load it once with core.css;
   it is safe to import more than once and does nothing on a server.

   EVERY BROWSER needs it for exact device pixels and the fit width:
     --dpr        the screen's exact ratio (core.css only knows 2x and 3x; some
                  Android phones are 2.625), so --hair is one real device pixel.
     --fit-width  the page's real width, where a classic scrollbar makes 100vw
                  too wide for a fitted cell.

   SAFARI needs it for rhythm. Text hangs from a cell line and rounds its block
   up to whole cells, so whatever follows starts on a line. core.css does this
   with calc-size(); where the browser lacks it this script does the same: it
   counts the cells each text block needs and writes the count to --settle-n,
   which core.css makes the block's least height. Clusters and .settle blocks
   keep their own box and take the space as end margin, through --settle. Reads
   and writes are batched, so a pass lays out as little as it can. It watches the page and
   any text added later; mark an overlay that changes often with data-settle-skip
   so it isn't watched.

   A CLAMP (.u-clamp) needs it where the browser leaves a clamp's box
   untrimmed, Safari today: the text would start a few pixels under its line and
   the box end under its last baseline. This measures what a block of the same
   type trims, marks the clamp (data-trellis-clamp), and writes --clamp-top (how
   far core pulls the text up) and --clamp-h (the height of the trimmed lines,
   in whole cells for a role, which core makes the box's). Whether a browser
   needs it is measured once, not read from its name.

   CAP-CENTERED TEXT needs it in every browser. A label beside a control
   centers its capitals on it (.cap-center), which only works on one line. This
   counts each one's lines and marks one that wraps with data-trellis-wrap; core
   then hangs it from its top line and rounds it up like other text (rule 8).

   PROSE needs it in every browser: what follows text or an image inside a
   nested block can't be rounded in CSS (--settle-start), and a lone <br> or
   &nbsp; can't be told from content (data-prose-empty). A pre or a table that
   scrolls sideways with nothing focusable inside takes a tab stop
   (tabindex="0", data-trellis-reach), since content from an editor can't
   carry one; it is taken back when the block no longer overflows.

   MODALS, in every browser: a .modal is a full-screen dialog whose padding
   plays the backdrop, so this closes one on a click on the backdrop, but only
   when the press began there too. A click goes to the common ancestor of where
   the press began and where it ended, so without that check, selecting text in
   the card and letting go outside it would close the modal. It asks the dialog
   to close (requestClose(), so a cancel handler can refuse) where the browser
   can. data-trellis-stay on the dialog opts it out: a modal that must be
   answered, or an app that handles the backdrop itself. It also keeps the
   order the open modals came in: --modal-index on each (0 for the first),
   and data-trellis-depth on those under the top one (1, then 2), so CSS can
   step them back. A fourth replaces the third: three levels at most.

   THE CELL, for any script: cell() measures it from one hidden box on the
   root ([data-trellis-cell]). Read it there, not from --u-px, which WebKit
   computes against the default text size when the root's font size is set.

   window.Trellis: fit() · cell() the cell in px · all() re-settles ·
   observe(el) watches more · settled() a promise for when nothing is left
   to write. */
(function () {
  'use strict';
  if (typeof window === 'undefined' || (window.Trellis && window.Trellis.fit)) return;
  var root = document.documentElement;

  // ---- Device pixels and the fit width: every browser ---------------------
  function fit() {
    var dpr = String(window.devicePixelRatio || 1);
    if (root.style.getPropertyValue('--dpr') !== dpr) root.style.setProperty('--dpr', dpr);
    // A classic scrollbar: 100vw is wider than the page.
    var want = window.innerWidth > root.clientWidth ? root.clientWidth + 'px' : '';
    if (root.style.getPropertyValue('--fit-width') !== want) {
      if (want) root.style.setProperty('--fit-width', want);
      else root.style.removeProperty('--fit-width');
    }
  }
  // Fires when the window moves to a screen with another ratio, or zooms.
  function watchRatio() {
    if (!window.matchMedia) return;
    window.matchMedia('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)')
      .addEventListener('change', function () { fit(); watchRatio(); }, { once: true });
  }
  fit();
  watchRatio();
  window.addEventListener('resize', fit);
  // A scrollbar arriving with the content changes the width, not the window.
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(root);

  // ---- The cell, measured: every browser -------------------------------------
  var probe = null;
  function cell() {
    if (!probe || !probe.isConnected) {
      probe = document.createElement('div');
      probe.setAttribute('data-trellis-cell', '');
      probe.setAttribute('aria-hidden', 'true');
      root.appendChild(probe);   // outside body, so no observer of the page sees it
    }
    return probe.getBoundingClientRect().width || 12;
  }

  // ---- Modals: a true backdrop click, every browser ---------------------------
  var pressedOn = null;
  document.addEventListener('pointerdown', function (e) { pressedOn = e.target; }, true);
  document.addEventListener('click', function (e) {
    var d = e.target;
    if (d === pressedOn && d.matches && d.matches('dialog.modal[open]:not([data-trellis-stay])')) {
      if (typeof d.requestClose === 'function') d.requestClose(); else d.close();
    }
    pressedOn = null;
  });
  var stack = [];
  function restack() {
    stack = stack.filter(function (d) { return d.open && d.isConnected; });
    stack.forEach(function (d, i) {
      var depth = stack.length - 1 - i;
      d.style.setProperty('--modal-index', String(i));
      if (depth) d.setAttribute('data-trellis-depth', String(depth)); else d.removeAttribute('data-trellis-depth');
    });
  }
  if ('MutationObserver' in window) new MutationObserver(function (records) {
    records.forEach(function (r) {
      var d = r.target;
      if (!d.matches('dialog.modal')) return;
      if (!d.open) { d.removeAttribute('data-trellis-depth'); d.style.removeProperty('--modal-index'); return; }
      if (stack.indexOf(d) < 0) {
        stack.push(d);
        if (stack.length > 3) stack[stack.length - 2].close();
      }
    });
    restack();
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ['open'] });

  // ---- Sliders: how far along the thumb is ------------------------------------
  // CSS can't read where a range input's thumb is (only Firefox has a
  // pseudo-element for the filled stretch), so --range-at, 0 to 1, is written
  // here: when a slider arrives, and when it moves. Setting .value from a
  // script fires no event, so that script calls Trellis.range(el).
  function rangeAt(el) {
    var lo = el.min === '' ? 0 : +el.min, hi = el.max === '' ? 100 : +el.max, at = hi > lo ? (+el.value - lo) / (hi - lo) : 0;
    el.style.setProperty('--range-at', String(+Math.max(0, Math.min(at, 1)).toFixed(4)));
  }
  function ranges(scope) {
    var list = (scope || document).querySelectorAll('input.range');
    for (var i = 0; i < list.length; i++) rangeAt(list[i]);
  }
  // ---- Composers: a box that grows with its text --------------------------------
  // field-sizing: content grows a .composer-input in CSS. Where a browser lacks
  // it, its height is written here as --composer-h, when it arrives and as it
  // changes; a script that sets .value calls Trellis.composer(el).
  var GROWS = !!window.CSS && !CSS.supports('field-sizing', 'content');
  function grow(el) {
    if (!GROWS) return;
    el.style.setProperty('--composer-h', 'auto');
    el.style.setProperty('--composer-h', el.scrollHeight + 'px');
  }
  function composers(scope) {
    if (!GROWS) return;
    var list = (scope || document).querySelectorAll('textarea.composer-input');
    for (var i = 0; i < list.length; i++) grow(list[i]);
  }
  document.addEventListener('input', function (e) {
    if (!e.target.matches) return;
    if (e.target.matches('input.range')) rangeAt(e.target);
    else if (e.target.matches('textarea.composer-input')) grow(e.target);
  }, true);
  if ('MutationObserver' in window) new MutationObserver(function (records) {
    records.forEach(function (r) {
      for (var i = 0; i < r.addedNodes.length; i++) {
        var n = r.addedNodes[i];
        if (n.nodeType !== 1) continue;
        if (n.matches('input.range')) rangeAt(n);
        else if (n.matches('textarea.composer-input')) grow(n);
        else if (n.firstElementChild) { ranges(n); composers(n); }
      }
    });
  }).observe(document, { subtree: true, childList: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { ranges(); composers(); }); else { ranges(); composers(); }

  // presets.js may have made the object first: add to it, don't replace it.
  var api = window.Trellis || {};
  api.range = function (el) { if (el) rangeAt(el); else ranges(); };
  api.composer = function (el) { if (el) grow(el); else composers(); };
  api.fit = fit; api.cell = cell; api.all = function () {}; api.observe = function () {}; api.settled = function () { return Promise.resolve(); };
  window.Trellis = api;

  // ---- Settling --------------------------------------------------------------
  if (!('ResizeObserver' in window)) { api.settled = function () { return Promise.resolve(); }; return; }
  // Safari today: round blocks in script. Prose nesting: every browser.
  var ROUNDS = !!window.CSS && !CSS.supports('height', 'calc-size(fit-content, size)') && CSS.supports('text-box', 'trim-both cap alphabetic');

  var BLOCKTAGS = 'p, div, ul, ol, dl, h1, h2, h3, h4, h5, h6, blockquote, pre, table, figure, hr, details, img, video, iframe';
  var PDIV = '.prose div:not([class], :has(> :is(' + BLOCKTAGS + ')))';
  var TEXT = '.t-h4, .t-h5, .t-h6, .t-xl, .t-lg, .t-body, .t-sm, .t-xs, .t-label, .t-eyebrow, .snap, .snap-x, ' +
    '.prose :is(h4, h5, h6, p, li, dt, dd, summary, blockquote, figcaption, caption), .prose blockquote > :is(footer, cite), ' + PDIV;
  var BLOCK = '.cluster, .settle, .field, .pair, .chat-item-meta, .chat-quote, .chat-link, .chat-reactions, .prose :is(pre, table, figure, details, dl, video, audio), ' +
    '.prose > :not(h1, h2, h3, h4, h5, h6, p, ul, ol, hr, blockquote, iframe, div:not([class]))';
  // Blocks that nest: what follows text or an image in them lands on a line.
  var INNER = '.prose :is(li, blockquote, figure, details)';
  var EMPTY = '.prose :is(h1, h2, h3, h4, h5, h6, p, blockquote, div:not([class]))';
  var MEDIA = 'img, video, iframe, audio, svg, canvas, hr, table, input, object, embed';
  var CAP = '.cap-center';   // centered on a control while it is one line; hangs once it wraps
  var CLAMP = '.u-clamp', STANDS = '.t-h1, .t-h2, .t-h3, .prose :is(h1, h2, h3)';
  // What's settled: only what a browser needs. Chrome rounds in CSS, so there it's prose nesting and cap-centered text.
  var SEL = (ROUNDS ? TEXT + ', ' + BLOCK + ', ' + INNER : INNER) + ', ' + CAP;

  // A clamp is a -webkit-box. Does this browser trim one, as it does a block?
  // One probe, when the page starts: a clamped line in a box, trimmed, against
  // its line height. Where it doesn't, clamps are settled here too.
  var TRIMS = !!window.CSS && CSS.supports('text-box', 'trim-both cap alphabetic'), CLAMPS = false;
  var bench = null;
  function benchFor(html) {
    if (!bench || !bench.isConnected) {
      bench = document.createElement('div');
      bench.setAttribute('aria-hidden', 'true');
      bench.style.cssText = 'position: absolute; visibility: hidden; pointer-events: none; inset-block-start: 0; inset-inline-start: 0; inline-size: max-content;';
      root.appendChild(bench);   // outside body, as the cell's probe is
    }
    bench.innerHTML = html;
    return bench;
  }
  function clampsNeedSettling() {
    if (!TRIMS) return false;   // nothing is trimmed here: a clamp is as far off its line as any text
    var b = benchFor('<div style="font: 16px/2 sans-serif; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; text-box: trim-both cap alphabetic">X</div>');
    var h = b.firstChild.getBoundingClientRect().height;
    b.innerHTML = '';
    return h > 24;   // untrimmed, the line is 32px; trimmed, a capital, about 12
  }
  // What a block of this type trims: above its first line's capitals and under
  // its last baseline. Read from three one-line blocks of the same font and
  // line: whole, trimmed at the start, trimmed at the end. Kept by font, since
  // a list of clamped titles shares one.
  var trimsBy = {}, trimsKept = 0;
  function fontOf(cs) { return [cs.fontFamily, cs.fontSize, cs.fontWeight, cs.fontStyle, cs.fontStretch, cs.lineHeight].join('|'); }
  function measureTrims(styles) {
    var need = [], seen = {}, i, html = '';
    for (i = 0; i < styles.length; i++) { var key = fontOf(styles[i]); if (!trimsBy[key] && !seen[key]) { seen[key] = 1; need.push([key, styles[i]]); } }
    if (!need.length) return;
    if (trimsKept + need.length > 200) { trimsBy = {}; trimsKept = 0; }
    for (i = 0; i < need.length; i++) {
      var cs = need[i][1], f = 'font-family: ' + cs.fontFamily.replace(/"/g, "'") + '; font-size: ' + cs.fontSize + '; font-weight: ' + cs.fontWeight + '; font-style: ' + cs.fontStyle +
        '; font-stretch: ' + cs.fontStretch + '; line-height: ' + cs.lineHeight + '; text-box-edge: cap alphabetic; text-box-trim: ';
      html += '<div style="' + f + 'none">X</div><div style="' + f + 'trim-start">X</div><div style="' + f + 'trim-end">X</div>';
    }
    var b = benchFor(html), kids = b.children;
    for (i = 0; i < need.length; i++) {
      var whole = kids[i * 3].getBoundingClientRect().height;
      trimsBy[need[i][0]] = [Math.max(0, whole - kids[i * 3 + 1].getBoundingClientRect().height), Math.max(0, whole - kids[i * 3 + 2].getBoundingClientRect().height)];
      trimsKept++;
    }
    b.innerHTML = '';
  }
  var SKIP = '[data-settle-skip]';   // an overlay or a layer that moves often: not content, not ours
  var CLUSTER_END = ':is(.card, .modal-body, .member-tile) > .cluster:last-child';   // a cluster at a surface's end rounds up

  // What an element is gets worked out once, when it's first seen. These
  // selectors are not cheap, and a pass visits every block.
  var IS_INNER = 1, IS_TEXT = 2, IS_BLOCK = 4, IS_CLUSTER = 8, IS_HOLDER = 16, IS_CAP = 32, IS_CLAMP = 64, IS_STAND = 128, IS_ROLE = 256;
  // Text with blocks inside it: a blockquote of paragraphs, a list item with a list.
  var HOLDS = ':scope > :is(p, ul, ol, dl, h1, h2, h3, h4, h5, h6, blockquote, pre, figure, table, details, footer, cite, div)';
  var kinds = new WeakMap();
  function kindOf(el) {
    var k = kinds.get(el);
    if (k === undefined) {
      k = (el.matches(INNER) ? IS_INNER : 0) | (el.matches(CAP) ? IS_CAP : 0);
      // A clamp is settled as a clamp, whatever its role: its box is counted without what it trims.
      if (CLAMPS && el.matches(CLAMP)) { k |= IS_CLAMP | (el.matches(STANDS) ? IS_STAND : el.matches(TEXT) ? IS_ROLE : 0); kinds.set(el, k); return k; }
      if (ROUNDS) {
        if (el.matches(TEXT) || (k & IS_CAP)) { k |= IS_TEXT; if (el.querySelector(HOLDS)) k |= IS_HOLDER; }
        if (el.matches(BLOCK)) k |= IS_BLOCK;
        if (el.classList.contains('cluster')) k |= IS_CLUSTER;
      }
      kinds.set(el, k);
    }
    return k;
  }

  // A lone <br> or &nbsp; looks like content to CSS. An empty block is not space.
  function markEmpty(scope) {
    if (scope.closest && !scope.closest('.prose') && !(scope.querySelector && scope.querySelector('.prose'))) return;
    var els = [];
    if (scope.matches && scope.matches(EMPTY)) els.push(scope);
    if (scope.querySelectorAll) els.push.apply(els, scope.querySelectorAll(EMPTY));
    els.forEach(function (el) {
      var empty = !el.textContent.replace(/[\s\u00a0\u200b\ufeff]/g, '') && !el.querySelector(MEDIA);
      if (empty !== el.hasAttribute('data-prose-empty')) el.toggleAttribute('data-prose-empty', empty);
    });
  }

  function settleInner(el, unit, writes) {
    var top = el.getBoundingClientRect().top, moved = 0;
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) {
      var cs = getComputedStyle(c);
      if (cs.position === 'absolute' || cs.display === 'none' || /^inline/.test(cs.display) || c.tagName === 'SUMMARY') continue;
      var have = parseFloat(c.style.getPropertyValue('--settle-start')) || 0;
      var y = c.getBoundingClientRect().top - top + moved - have;
      if (y < 0.5) { if (have) { writes.push([c, '--settle-start', null]); moved -= have; } continue; }
      var need = Math.ceil(y / unit - 1e-3) * unit - y;
      if (Math.abs(need - have) > 0.01) { writes.push([c, '--settle-start', need]); moved += need - have; }
    }
  }

  var isText = function (k) { return (k & IS_TEXT) && !(k & IS_BLOCK); };

  // How many lines a box of text runs to, from its fragments' rectangles. A
  // trimmed line can be shorter than its font's content area, so neighboring
  // lines' rectangles overlap: a new line is one that starts below the middle
  // of the last.
  function lines(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var rects = Array.prototype.filter.call(range.getClientRects(), function (b) { return b.width > 0 && b.height > 0; })
      .sort(function (a, b) { return a.top - b.top; });
    var n = 0, top = -Infinity, half = 0;
    for (var i = 0; i < rects.length; i++) {
      if (rects[i].top >= top + half) { n++; top = rects[i].top; half = rects[i].height / 2; }
    }
    return n;
  }

  // Text: how many cells it needs. Its count must be cleared first, so this
  // reads its natural height.
  function settleText(el, unit, writes) {
    if (el.classList.contains('cap-center') && !el.hasAttribute('data-trellis-wrap')) return;
    var cs = getComputedStyle(el);
    if (cs.display === 'inline' || cs.display === 'none' || cs.display === 'contents') return;
    var h = el.getBoundingClientRect().height;
    if (h > 0) writes.push([el, '--settle-n', Math.ceil(h / unit - 1e-3)]);
  }

  // Clamps: mark each one and pull its text up to its line, then give its box
  // the height of its trimmed lines. Three steps, each a batch: read every
  // font, write every mark, read every height. A headline is whole cells
  // already and takes the nearest count; other text rounds up; a clamp with no
  // role keeps its own height, less what a block would trim.
  function settleClamps(els, unit) {
    var styles = [], i, t, writes = [];
    for (i = 0; i < els.length; i++) styles.push(getComputedStyle(els[i]));
    measureTrims(styles);
    var trims = styles.map(function (cs) { return trimsBy[fontOf(cs)] || [0, 0]; });
    for (i = 0; i < els.length; i++) {
      if (!els[i].hasAttribute('data-trellis-clamp')) els[i].setAttribute('data-trellis-clamp', '');
      if (els[i].style.getPropertyValue('--clamp-h')) els[i].style.removeProperty('--clamp-h');
      t = trims[i][0].toFixed(4) + 'px';
      if (els[i].style.getPropertyValue('--clamp-top') !== t) els[i].style.setProperty('--clamp-top', t);
    }
    for (i = 0; i < els.length; i++) {
      if (styles[i].display === 'none') continue;
      var h = els[i].getBoundingClientRect().height - trims[i][1], k = kindOf(els[i]);
      if (h > 0) writes.push([els[i], '--clamp-h', (k & IS_STAND) ? Math.round(h / unit) * unit : (k & IS_ROLE) ? Math.ceil(h / unit - 1e-3) * unit : h]);
    }
    apply(writes);
  }

  // A block keeps its own box and takes the margin it's short by. It must be read
  // after the text inside it has its count, or its height is about to change.
  function settleBlock(el, unit, writes) {
    var cs = getComputedStyle(el);
    if (cs.display === 'inline' || cs.display === 'none' || cs.display === 'contents') return;
    var h = el.getBoundingClientRect().height;
    if (!(h > 0)) return;
    // A .settle block rounds up; a cluster rounds to the nearest cell, halves
    // down, at least one (as core.css does with calc-size).
    var k = kindOf(el);
    var have = parseFloat(el.style.getPropertyValue('--settle')) || 0;
    // At the end of a surface a cluster rounds up, as core.css does: only the
    // surface's padding follows it. What it gains is padding above its row,
    // inside its box (D92), so it is taken off the height measured here.
    var end = (k & IS_CLUSTER) && el.matches(CLUSTER_END);
    if (end) h -= have;
    var nearest = (k & IS_CLUSTER) && !end;
    var cells = nearest ? Math.max(1, Math.ceil(h / unit - 0.5 - 1e-3)) : Math.ceil(h / unit - 1e-3);
    var need = cells * unit - h;
    if (Math.abs(need - have) > 0.02) writes.push([el, '--settle', need]);
  }

  function apply(writes) {
    for (var i = 0; i < writes.length; i++) {
      var w = writes[i];
      if (w[2] === null) w[0].style.removeProperty(w[1]);
      else if (w[1] === '--settle-n') w[0].style.setProperty(w[1], String(w[2]));
      else { w[0].style.setProperty(w[1], w[2].toFixed(4) + 'px'); if (w[1] === '--settle-start') again = true; }
    }
  }

  // Everything queued is settled in one pass, in one frame. It can't be lazy about
  // what's off screen: a visible block's position is the sum of every block above
  // it. And slicing it across frames doesn't help: layout is the cost, not reading,
  // so more slices mean more layouts (measured: 3x slower, same longest frame).
  var queue = new Set(), added = new Set(), queued = false, waiting = [], started = false;
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(flush); }
  }
  // A settling write can change what a nesting block has to do, so a pass that
  // moved anything inside a nested block is followed by one more.
  var passes = 0, again = false;
  function flush() {
    queued = false;
    if (added.size) {
      var nodes = Array.from(added);
      added.clear();
      nodes.forEach(function (n) { if (n.isConnected) observe(n); });
    }
    var unit = cell();
    var batch = [], i, el, k, writes = [];
    queue.forEach(function (q) { if (q.isConnected) batch.push(q); });
    queue.clear();
    // Cap-centered text first: whether it wraps decides how it settles. Read every
    // count, then write every mark.
    var caps = [];
    for (i = 0; i < batch.length; i++) if (kindOf(batch[i]) & IS_CAP) caps.push([batch[i], lines(batch[i]) > 1]);
    for (i = 0; i < caps.length; i++) {
      if (caps[i][1] !== caps[i][0].hasAttribute('data-trellis-wrap')) caps[i][0].toggleAttribute('data-trellis-wrap', caps[i][1]);
    }
    // Clamps, where the browser leaves their box untrimmed.
    if (CLAMPS) {
      var clamps = [];
      for (i = 0; i < batch.length; i++) if (kindOf(batch[i]) & IS_CLAMP) clamps.push(batch[i]);
      if (clamps.length) settleClamps(clamps, unit);
    }
    // Text first: clear each count, read every natural height, write every count.
    var holders = [];
    for (i = 0; i < batch.length; i++) {
      el = batch[i];
      k = kindOf(el);
      if (!isText(k)) continue;
      if (k & IS_HOLDER) { holders.push(el); continue; }
      if (el.style.getPropertyValue('--settle-n')) el.style.removeProperty('--settle-n');
    }
    for (i = 0; i < batch.length; i++) {
      k = kindOf(batch[i]);
      if (isText(k) && !(k & IS_HOLDER)) settleText(batch[i], unit, writes);
    }
    apply(writes);
    // Text that holds other text is only known once what's inside it is, so these
    // go one at a time and deepest first. The queue is in document order, so that
    // is simply backwards. Few elements are holders, so this costs few layouts.
    for (i = holders.length - 1; i >= 0; i--) {
      writes = [];
      if (holders[i].style.getPropertyValue('--settle-n')) holders[i].style.removeProperty('--settle-n');
      settleText(holders[i], unit, writes);
      apply(writes);
    }
    // Then what holds it: blocks, and what follows text inside a nesting block.
    writes = [];
    for (i = 0; i < batch.length; i++) {
      k = kindOf(batch[i]);
      if (k & IS_INNER) settleInner(batch[i], unit, writes);
      if (k & IS_BLOCK) settleBlock(batch[i], unit, writes);
    }
    apply(writes);
    if (again && passes < 3) { again = false; passes++; all(); return; }
    again = false; passes = 0;
    reach();
    if (!queued && started) waiting.splice(0).forEach(function (done) { done(); });
  }

  // ---- Keyboard reach: prose, every browser -----------------------------------
  // A keyboard can only scroll a region it can focus. Safari doesn't make a
  // scroller focusable on its own, so a pre or a table in prose that overflows,
  // with nothing focusable inside, takes a tab stop. A rail or a board carries
  // its own in the markup; an author's tabindex is never touched.
  var REACH = '.prose :is(pre, table)';
  var FOCUSABLE = 'a[href], button, input, select, textarea, summary, [contenteditable], [tabindex]:not([tabindex="-1"])';
  function reach() {
    var els = document.querySelectorAll(REACH);
    for (var i = 0; i < els.length; i++) {
      var el = els[i], ours = el.hasAttribute('data-trellis-reach');
      if (!ours && el.hasAttribute('tabindex')) continue;
      var needs = el.scrollWidth > el.clientWidth + 1 && !el.querySelector(FOCUSABLE);
      if (needs && !ours) { el.setAttribute('tabindex', '0'); el.setAttribute('data-trellis-reach', ''); }
      else if (!needs && ours) { el.removeAttribute('tabindex'); el.removeAttribute('data-trellis-reach'); }
    }
  }
  function enqueue(el) {
    queue.add(el);
    schedule();
  }

  // A block is queued when it is first watched, so settled() can't resolve
  // before it has been measured. The observer's first report would only repeat
  // that, so it's skipped.
  var fresh = new WeakSet();
  var ro = new ResizeObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var t = entries[i].target;
      if (fresh.has(t)) { fresh.delete(t); continue; }
      enqueue(t);
    }
  });

  // The page or part of it. Pass a root to start somewhere narrower than <body>.
  var watched = new WeakSet();
  function watch(el) {
    if (watched.has(el)) return;
    watched.add(el);
    fresh.add(el);
    ro.observe(el);
    enqueue(el);
  }
  function observe(scope) {
    markEmpty(scope);
    if (scope.matches && scope.matches(SEL)) watch(scope);
    if (scope.querySelectorAll) scope.querySelectorAll(SEL).forEach(watch);
  }

  // The unit can change without any block resizing (a fitted screen turning,
  // the dial): re-settle everything when it does.
  // A font that arrived since has other metrics under the same name: what a block trims is measured again.
  function all() { trimsBy = {}; trimsKept = 0; document.querySelectorAll(SEL).forEach(enqueue); schedule(); }

  // Resolves once everything queued is measured and nothing is left to write.
  function settled() {
    return new Promise(function (done) { waiting.push(done); schedule(); });
  }

  function start() {
    started = true;
    CLAMPS = clampsNeedSettling();
    if (CLAMPS) SEL += ', ' + CLAMP;
    schedule();   // so a settled() called before now still resolves, on an empty page too
    observe(document.body);
    // Added nodes wait for the frame, so a thousand added at once cost one pass.
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        var at = r.target.nodeType === 1 ? r.target : r.target.parentElement;
        if (!at || at.closest(SKIP)) continue;
        for (var j = 0; j < r.addedNodes.length; j++) {
          var n = r.addedNodes[j];
          if (n.nodeType === 1 && !n.matches(SKIP)) added.add(n);
        }
        // Text changed inside a settled block. A block held at whole cells doesn't
        // resize when its text shrinks, so the observer can't be what notices.
        for (var e = at; e && e !== document.body; e = e.parentElement) {
          if (watched.has(e)) { enqueue(e); break; }
        }
      }
      if (added.size) schedule();
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    new MutationObserver(all).observe(root, { attributes: true, attributeFilter: ['style', 'data-product', 'data-unit-fit'] });
    window.addEventListener('resize', all);
    // Each time fonts finish loading, not just the first: a font arriving later can
    // make text wrap to fewer lines, and a block held at whole cells can't notice.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(all);
      if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', all);
    }
  }

  api.all = all;
  api.observe = observe;
  api.settled = settled;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
