/* Trellis · runtime · v0.9
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
   answered, or an app that handles the backdrop itself.

   THE CELL, for any script: cell() measures it from one hidden box on the
   root ([data-trellis-cell]). Read it there, not from --u-px, which WebKit
   computes against the default text size when the root's font size is set.

   window.Trellis: fit() · cell() the cell in px · all() re-settles ·
   observe(el) watches more · settled() a promise for when nothing is left
   to write. */
(function () {
  'use strict';
  if (typeof window === 'undefined' || window.Trellis) return;
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

  var api = { fit: fit, cell: cell, all: function () {}, observe: function () {}, settled: function () { return Promise.resolve(); } };
  window.Trellis = api;

  // ---- Settling --------------------------------------------------------------
  if (!('ResizeObserver' in window)) { api.settled = function () { return Promise.resolve(); }; return; }
  // Safari today: round blocks in script. Prose nesting: every browser.
  var ROUNDS = !!window.CSS && !CSS.supports('height', 'calc-size(fit-content, size)') && CSS.supports('text-box', 'trim-both cap alphabetic');

  var BLOCKTAGS = 'p, div, ul, ol, dl, h1, h2, h3, h4, h5, h6, blockquote, pre, table, figure, hr, details, img, video, iframe';
  var PDIV = '.prose div:not([class], :has(> :is(' + BLOCKTAGS + ')))';
  var TEXT = '.t-h4, .t-h5, .t-h6, .t-xl, .t-lg, .t-body, .t-sm, .t-xs, .t-label, .snap, .snap-x, ' +
    '.prose :is(h4, h5, h6, p, li, dt, dd, summary, blockquote, figcaption, caption), .prose blockquote > :is(footer, cite), ' + PDIV;
  var BLOCK = '.cluster, .settle, .field, .prose :is(pre, table, figure, details, dl, video, audio), ' +
    '.prose > :not(h1, h2, h3, h4, h5, h6, p, ul, ol, hr, blockquote, iframe, div:not([class]))';
  // Blocks that nest: what follows text or an image in them lands on a line.
  var INNER = '.prose :is(li, blockquote, figure, details)';
  var EMPTY = '.prose :is(h1, h2, h3, h4, h5, h6, p, blockquote, div:not([class]))';
  var MEDIA = 'img, video, iframe, audio, svg, canvas, hr, table, input, object, embed';
  // What's settled: only what a browser needs. Chrome rounds in CSS, so there it's prose nesting alone.
  var SEL = ROUNDS ? TEXT + ', ' + BLOCK + ', ' + INNER : INNER;
  var SKIP = '[data-settle-skip]';   // an overlay or a layer that moves often: not content, not ours
  var CLUSTER_END = ':is(.card, .modal-body, .member-tile) > .cluster:last-child';   // a cluster at a surface's end rounds up

  // What an element is gets worked out once, when it's first seen. These
  // selectors are not cheap, and a pass visits every block.
  var IS_INNER = 1, IS_TEXT = 2, IS_BLOCK = 4, IS_CLUSTER = 8, IS_HOLDER = 16;
  // Text with blocks inside it: a blockquote of paragraphs, a list item with a list.
  var HOLDS = ':scope > :is(p, ul, ol, dl, h1, h2, h3, h4, h5, h6, blockquote, pre, figure, table, details, footer, cite, div)';
  var kinds = new WeakMap();
  function kindOf(el) {
    var k = kinds.get(el);
    if (k === undefined) {
      k = (el.matches(INNER) ? IS_INNER : 0);
      if (ROUNDS) {
        if (el.matches(TEXT)) { k |= IS_TEXT; if (el.querySelector(HOLDS)) k |= IS_HOLDER; }
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

  // Text: how many cells it needs. Its count must be cleared first, so this
  // reads its natural height.
  function settleText(el, unit, writes) {
    if (el.classList.contains('cap-center')) return;
    var cs = getComputedStyle(el);
    if (cs.display === 'inline' || cs.display === 'none' || cs.display === 'contents') return;
    var h = el.getBoundingClientRect().height;
    if (h > 0) writes.push([el, '--settle-n', Math.ceil(h / unit - 1e-3)]);
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
    // surface's padding follows it.
    var nearest = (k & IS_CLUSTER) && !el.matches(CLUSTER_END);
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
  function all() { document.querySelectorAll(SEL).forEach(enqueue); schedule(); }

  // Resolves once everything queued is measured and nothing is left to write.
  function settled() {
    return new Promise(function (done) { waiting.push(done); schedule(); });
  }

  function start() {
    started = true;
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
