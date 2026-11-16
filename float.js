/* Trellis · float.js · placing and closing a float, optional
   A .float opens as a manual popover, so it is in the top layer, over a modal
   and outside every clip, with core's fade. Core places it through two
   variables, --float-x and --float-y; this file writes them.

     Trellis.float.open(float, anchor, options)    open it by its anchor
     Trellis.float.toggle(float, anchor, options)  open, or close if open
     Trellis.float.close(float)                    close it
     Trellis.float.place(float, anchor, options)   place it again, now

   options
     side    'block-end' (under, the default), 'block-start' (over),
             'inline-end' or 'inline-start' (beside); it flips to the other
             side when there is no room, and a tooltip's 'block-end' too
     align   'start' (the default), 'end' or 'center', along that side
     gap     the space between anchor and float, in px (a quarter cell)
     margin  the least it keeps from the screen's edge, in px (half a cell)
     onClose a function called once when it closes, by any route

   While it is open it follows its anchor when anything scrolls or the window
   resizes, and closes on Escape (focus goes back to the anchor), a press
   outside the float and its anchor, or when the anchor scrolls out of view.
   An anchor with aria-expanded has it kept true while open.

   A float marked .cc-anchor and opened by popovertarget is placed by CSS
   anchor positioning where the browser has it: use one or the other.
   Load it after settle.js; it needs nothing else. */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  var T = window.Trellis || (window.Trellis = {});
  if (T.float) return;
  var open = new Map();   // float → its state while open

  function cell() { return typeof T.cell === 'function' ? T.cell() : 12; }
  function rtl(el) { return getComputedStyle(el).direction === 'rtl'; }

  // Is any of the anchor still in view, inside every scroller around it?
  function inView(a) {
    var r = a.getBoundingClientRect(), top = r.top, bottom = r.bottom, left = r.left, right = r.right;
    for (var p = a.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      var cs = getComputedStyle(p);
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + cs.overflowY)) {
        var s = p.getBoundingClientRect();
        top = Math.max(top, s.top); bottom = Math.min(bottom, s.bottom); left = Math.max(left, s.left); right = Math.min(right, s.right);
      }
    }
    return bottom > Math.max(top, 0) && top < innerHeight && right > Math.max(left, 0) && left < innerWidth;
  }

  function place(f, a, o) {
    o = o || (open.get(f) || {}).o || {};
    var u = cell(), gap = o.gap != null ? o.gap : u / 4, m = o.margin != null ? o.margin : u / 2;
    var r = a.getBoundingClientRect(), w = f.offsetWidth, h = f.offsetHeight;
    var W = document.documentElement.clientWidth, H = innerHeight;
    var side = o.side || 'block-end', align = o.align || 'start', flip = rtl(a);
    var keep = function (v, size, max) { return Math.max(m, Math.min(max - size - m, v)); };
    // Along the anchor's edge: its start, its end or its center; atEnd says
    // whether the float lines up with the far end (hi) instead of the near (lo).
    var along = function (lo, hi, size, max, atEnd) { return keep(align === 'center' ? (lo + hi - size) / 2 : atEnd ? hi - size : lo, size, max); };
    // Its side, or the other one when its own has no room and the other has.
    var pick = function (want, other, size, max) { return want >= m && want + size <= max - m ? want : other >= m && other + size <= max - m ? other : want; };
    var x, y;
    if (side === 'block-end' || side === 'block-start') {
      var below = r.bottom + gap, above = r.top - gap - h;
      y = keep(side === 'block-end' ? pick(below, above, h, H) : pick(above, below, h, H), h, H);
      x = along(r.left, r.right, w, W, (align === 'end') !== flip);   // in a right-to-left page, start is the right
    } else {
      var right = r.right + gap, left = r.left - gap - w;
      x = keep((side === 'inline-end') !== flip ? pick(right, left, w, W) : pick(left, right, w, W), w, W);
      y = along(r.top, r.bottom, h, H, align === 'end');
    }
    f.style.setProperty('--float-x', Math.round(x) + 'px');
    f.style.setProperty('--float-y', Math.round(y) + 'px');
  }

  function close(f) {
    var s = open.get(f);
    if (!s) { if (f.matches && f.matches(':popover-open')) f.hidePopover(); return; }
    open.delete(f);
    document.removeEventListener('keydown', s.key, true);
    document.removeEventListener('pointerdown', s.press, true);
    window.removeEventListener('scroll', s.move, true);
    window.removeEventListener('resize', s.move);
    f.removeEventListener('toggle', s.toggled);
    if (s.a.hasAttribute('aria-expanded')) s.a.setAttribute('aria-expanded', 'false');
    if (f.matches(':popover-open')) f.hidePopover();
    if (s.o.onClose) s.o.onClose(f);
  }

  function openFloat(f, a, o) {
    o = o || {};
    if (open.has(f)) close(f);
    if (!f.hasAttribute('popover')) f.setAttribute('popover', 'manual');
    if (!f.matches(':popover-open')) f.showPopover();
    place(f, a, o);
    var s = { a: a, o: o };
    var frame = 0;
    s.move = function () {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        if (!open.has(f)) return;
        if (!a.isConnected || !inView(a)) close(f); else place(f, a, o);
      });
    };
    s.key = function (e) { if (e.key === 'Escape') { e.preventDefault(); close(f); if (a.focus) a.focus(); } };
    s.press = function (e) { if (!f.contains(e.target) && !a.contains(e.target)) close(f); };
    s.toggled = function (e) { if (e.newState === 'closed') close(f); };
    open.set(f, s);
    document.addEventListener('keydown', s.key, true);
    document.addEventListener('pointerdown', s.press, true);
    window.addEventListener('scroll', s.move, { capture: true, passive: true });
    window.addEventListener('resize', s.move);
    f.addEventListener('toggle', s.toggled);
    if (a.hasAttribute('aria-expanded')) a.setAttribute('aria-expanded', 'true');
    return f;
  }

  T.float = {
    open: openFloat,
    close: close,
    place: function (f, a, o) { place(f, a, o); },
    toggle: function (f, a, o) { if (open.has(f) || f.matches(':popover-open')) close(f); else openFloat(f, a, o); },
    isOpen: function (f) { return open.has(f); }
  };
})();
