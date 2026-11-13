/* Trellis · presets.js · interaction presets, optional
   settle.js is the one file a page needs; this is the one it may add. Each
   preset is off until an element asks for it with a data attribute, and each
   reads its variables from core.css, so a product can tune it there. Under
   reduced motion every preset still works and nothing travels: the
   durations it reads collapse, and the glow and the transitions stand down.

   The presets that need no script live in core.css alone:
     data-trellis-fade="x|y"   the scroller's edges fade where there is more
     data-trellis-press        a pressed control sinks
   The ones here:
     data-trellis-glow         a glow under the finger on a scrollable field
     data-trellis-reveal       a thin scrollbar that shows only while scrolling
     data-trellis-detents      a bottom tray that rests at named heights and
                               is dragged between them by its grabber
     data-trellis-swipe        a list row that slides to show its actions
     data-trellis-share        an element that carries across a view change:
                               Trellis.transition(update) runs the change
   window.Trellis.presets lists them; Trellis.transition(update) is the
   shared-element transition, or a plain call where the browser has none. */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  var T = window.Trellis || (window.Trellis = {});
  if (T.presets) return;
  T.presets = ['fade', 'press', 'glow', 'reveal', 'detents', 'swipe', 'share'];
  var still = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function cell() { return typeof T.cell === 'function' ? T.cell() : 12; }
  function closest(e, sel) { return e && e.closest ? e.closest(sel) : null; }

  // ---- Glow: under the finger, on a field that scrolls ------------------------
  // A touch or a pen lights the field where it lands and follows it; mouse
  // only when the attribute says "all". The light lives on the field's own
  // background, so it never moves the content.
  function glowAt(f, e) {
    var r = f.getBoundingClientRect();
    f.style.setProperty('--glow-x', (e.clientX - r.left) + 'px');
    f.style.setProperty('--glow-y', (e.clientY - r.top) + 'px');
  }
  document.addEventListener('pointerdown', function (e) {
    var f = closest(e.target, '[data-trellis-glow]');
    if (!f || (e.pointerType === 'mouse' && f.getAttribute('data-trellis-glow') !== 'all')) return;
    glowAt(f, e);
    f.setAttribute('data-trellis-glowing', '');
    function move(ev) { if (ev.pointerId === e.pointerId) glowAt(f, ev); }
    function end(ev) {
      if (ev.pointerId !== e.pointerId) return;
      f.removeAttribute('data-trellis-glowing');
      document.removeEventListener('pointermove', move, true);
      document.removeEventListener('pointerup', end, true);
      document.removeEventListener('pointercancel', end, true);
    }
    document.addEventListener('pointermove', move, true);
    document.addEventListener('pointerup', end, true);
    document.addEventListener('pointercancel', end, true);
  }, true);

  // ---- Reveal: a scrollbar that shows while it is used --------------------------
  var revealTimers = new WeakMap();
  document.addEventListener('scroll', function (e) {
    var s = e.target;
    if (!s || !s.matches || !s.matches('[data-trellis-reveal]')) return;
    s.setAttribute('data-trellis-scrolling', '');
    clearTimeout(revealTimers.get(s));
    revealTimers.set(s, setTimeout(function () { s.removeAttribute('data-trellis-scrolling'); }, 800));
  }, true);

  // ---- Detents: a bottom tray that rests at named heights -------------------------
  // data-trellis-detents="half full" (or fractions of the screen: "0.4 0.9").
  // The tray is as tall as its tallest detent and moves down by the rest, so
  // the motion is a translate (D20). It opens at the first detent. Its
  // grabber or header drags it; let go, it settles at the nearest; dragged
  // more than four cells below the lowest, it closes. Focus that lands below
  // the screen's edge raises it to the tallest.
  // The offsets each detent rests at, in the order the attribute lists them.
  function detents(d) {
    var H = window.innerHeight, inner = d.querySelector('.modal-inner'), full = inner ? inner.getBoundingClientRect().height : H * .9;
    return (d.getAttribute('data-trellis-detents') || 'full').split(/\s+/).filter(Boolean).map(function (k) {
      var h = k === 'full' ? full : k === 'half' ? H / 2 : parseFloat(k) * H;
      return full - Math.max(0, Math.min(full, h || full));
    });
  }
  function rest(d, offset) { d.style.setProperty('--tray-offset', Math.round(offset) + 'px'); }
  if ('MutationObserver' in window) new MutationObserver(function (records) {
    records.forEach(function (r) {
      var d = r.target;
      if (!d.matches('dialog.modal[data-trellis-detents]')) return;
      if (d.open) rest(d, detents(d)[0]);
      else d.style.removeProperty('--tray-offset');
    });
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ['open'] });
  document.addEventListener('pointerdown', function (e) {
    var handle = closest(e.target, '.modal-grabber, .modal-header'), d = closest(handle, 'dialog.modal[data-trellis-detents][open]');
    if (!d || closest(e.target, 'button, a, input, select, textarea')) return;
    var y0 = e.clientY, base = parseFloat(d.style.getPropertyValue('--tray-offset')) || 0, offsets = detents(d);
    d.setAttribute('data-trellis-dragging', '');
    function move(ev) { if (ev.pointerId === e.pointerId) rest(d, Math.max(0, base + ev.clientY - y0)); }
    function end(ev) {
      if (ev.pointerId !== e.pointerId) return;
      document.removeEventListener('pointermove', move, true);
      document.removeEventListener('pointerup', end, true);
      document.removeEventListener('pointercancel', end, true);
      d.removeAttribute('data-trellis-dragging');
      var now = parseFloat(d.style.getPropertyValue('--tray-offset')) || 0, lowest = Math.max.apply(null, offsets);
      if (now > lowest + 4 * cell()) { if (typeof d.requestClose === 'function') d.requestClose(); else d.close(); return; }
      var best = offsets.reduce(function (a, b) { return Math.abs(b - now) < Math.abs(a - now) ? b : a; });
      rest(d, best);
    }
    document.addEventListener('pointermove', move, true);
    document.addEventListener('pointerup', end, true);
    document.addEventListener('pointercancel', end, true);
  }, true);
  document.addEventListener('focusin', function (e) {
    var d = closest(e.target, 'dialog.modal[data-trellis-detents][open]');
    if (d && e.target.getBoundingClientRect().bottom > window.innerHeight) rest(d, 0);
  });

  // ---- Swipe: a row slides to show its actions ------------------------------------
  // .list-item[data-trellis-swipe] holds a .list-actions after its content.
  // Drag the row toward its start: past half the actions' width it stays open
  // with them shown, short of that it closes. Focus inside the actions opens
  // it, so a keyboard reaches them; Escape, or a press anywhere else, closes.
  var openRow = null, dragged = null;
  // A drag is not a press on the link under it: the click that ends a drag is dropped.
  document.addEventListener('click', function (c) {
    if (dragged && dragged.row.contains(c.target) && Date.now() - dragged.at < 400) { c.preventDefault(); c.stopPropagation(); }
    dragged = null;
  }, true);
  function slide(row, x) { row.style.setProperty('--swipe-x', Math.round(x) + 'px'); if (x) row.setAttribute('data-trellis-swiped', ''); else row.removeAttribute('data-trellis-swiped'); }
  function width(row) { var a = row.querySelector(':scope > .list-actions'); return a ? a.getBoundingClientRect().width : 0; }
  function sign(row) { return getComputedStyle(row).direction === 'rtl' ? 1 : -1; }
  function shut() { if (openRow) { slide(openRow, 0); openRow = null; } }
  document.addEventListener('dragstart', function (e) { if (closest(e.target, '.list-item[data-trellis-swipe]')) e.preventDefault(); }, true);
  document.addEventListener('pointerdown', function (e) {
    var row = closest(e.target, '.list-item[data-trellis-swipe]');
    if (openRow && openRow !== row) shut();
    if (!row || closest(e.target, '.list-actions')) return;
    var x0 = e.clientX, y0 = e.clientY, s = sign(row), w = width(row), base = row === openRow ? s * w : 0, moved = false;
    function move(ev) {
      if (ev.pointerId !== e.pointerId) return;
      var dx = ev.clientX - x0;
      if (!moved) { if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(ev.clientY - y0)) return; moved = true; row.setAttribute('data-trellis-dragging', ''); }
      var x = base + dx;
      slide(row, s < 0 ? Math.max(-w, Math.min(0, x)) : Math.min(w, Math.max(0, x)));
    }
    function end(ev) {
      if (ev.pointerId !== e.pointerId) return;
      document.removeEventListener('pointermove', move, true);
      document.removeEventListener('pointerup', end, true);
      document.removeEventListener('pointercancel', end, true);
      row.removeAttribute('data-trellis-dragging');
      if (!moved) return;
      var x = Math.abs(parseFloat(row.style.getPropertyValue('--swipe-x')) || 0);
      if (x > w / 2) { slide(row, s * w); openRow = row; } else { slide(row, 0); if (openRow === row) openRow = null; }
      dragged = { row: row, at: Date.now() };
    }
    document.addEventListener('pointermove', move, true);
    document.addEventListener('pointerup', end, true);
    document.addEventListener('pointercancel', end, true);
  }, true);
  document.addEventListener('focusin', function (e) {
    var a = closest(e.target, '.list-item[data-trellis-swipe] > .list-actions');
    if (a) { var row = a.parentElement; if (openRow && openRow !== row) shut(); slide(row, sign(row) * width(row)); openRow = row; }
    else if (openRow && !openRow.contains(e.target)) shut();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openRow) { var r = openRow; shut(); var l = r.querySelector('a, button'); if (l && r.contains(document.activeElement)) l.focus(); } });

  // ---- Share: an element that carries across a change of view -----------------------
  // data-trellis-share="name" becomes the element's view-transition-name.
  // Trellis.transition(update) runs update inside a view transition where the
  // browser has one and motion is wanted, and plainly otherwise; it returns a
  // promise for when the new view is in place. Between pages, the app opts in
  // with @view-transition { navigation: auto; } in its own CSS.
  function name(el) { el.style.viewTransitionName = el.getAttribute('data-trellis-share') || 'none'; }
  function names(rootEl) { (rootEl.querySelectorAll ? rootEl : document).querySelectorAll('[data-trellis-share]').forEach(name); }
  names(document);
  if ('MutationObserver' in window) new MutationObserver(function (records) {
    records.forEach(function (r) {
      if (r.type === 'attributes') name(r.target);
      else r.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.matches('[data-trellis-share]')) name(n); names(n); } });
    });
  }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-trellis-share'] });
  T.transition = function (update) {
    if (!document.startViewTransition || still.matches) return Promise.resolve().then(update);
    return document.startViewTransition(update).updateCallbackDone;
  };
})();
