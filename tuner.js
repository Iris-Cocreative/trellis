/* Trellis specimen · the ratio playground
   Seven values set the type ratio: H1, body and the label in a wide space, the
   ratio in a wide space and in a narrow one, and the two spaces. The rest is
   worked out from them, and shown beside its sum:

     the half step   √ratio, at each end            the text sizes (xs to xl)
                                                    step out from body by it
     body, narrow    body ÷ a narrow half step      18 ÷ √1.2 = 16.4
     H1, narrow      as many steps above body as    64 is 4.41 steps of 1.333
                     in a wide space                above 18, and 16.4 × 1.2^4.41
                                                    = 36.7
     label, narrow   the label, unchanged           12

   So a narrow space shrinks the step and keeps every role's place around
   body: as many headings stay above body text at one end as at the other.

   Those are core's real knobs (--h1-min to --rp-max, and the two spaces as
   --c-min and --c-max), and the playground writes them onto three sample
   boxes, so what the boxes show is the real type roles, sized by the browser:
     wide     every role at its wide end. A wide space does not fit in a
              column, so the stylesheet moves this box's two spaces below any
              width it can have (specimen.css, .play-box.cc-wide).
     narrow   a box as wide as the narrow space, so every role is at its
              narrow end for real.
     live     a box as wide as the "This box" slider says. The stage cuts off
              what runs past the column; the type still answers to all of it.
   The page keeps its own knobs unless "Apply to the whole page" puts these on
   :root. Nothing is stored.

   Under the playground, core's own model is set beside it (compare, below):
   the twelve numbers core sizes type from, each one set, against the seven
   the playground sets and the five it works out; the seven numbers only core
   has, for lines and the space after a heading; and every role's size at
   both ends in each model, from math.js. Core is not changed by it. */
(function () {
  'use strict';
  var M = window.TrellisMath, root = document.documentElement;
  var play = document.querySelector('[data-play]');
  if (!play || !M) return;
  var one = function (s) { return play.querySelector(s); };
  var each = function (s, f) { Array.prototype.forEach.call(play.querySelectorAll(s), f); };
  var boxes = { wide: one('[data-play-box="wide"]'), narrow: one('[data-play-box="narrow"]'), live: one('[data-play-box="live"]') };
  var stage = one('[data-play-stage]'), scrub = one('[data-play-space]'), where = one('[data-play-where]');
  var whole = one('[data-play-whole]'), out = one('[data-play-export]');
  var inputs = {}, outs = {}, sums = {};
  each('[data-play-in]', function (i) { inputs[i.dataset.playIn] = i; });
  each('[data-play-out]', function (o) { outs[o.dataset.playOut] = o; });
  each('[data-play-sum]', function (o) { sums[o.dataset.playSum] = o; });

  var REM = 16;          // a knob is in rem: 16 points at the default text size
  var SMALL = 10.95;     // under about 11px a size is flagged
  var GAP = 160;         // the wide space stays this far past the narrow one
  // Two values that can't cross: the one being dragged takes the other with it.
  var PUSH = { rn: ['rw', 1, 0], rw: ['rn', -1, 0], sn: ['sw', 1, GAP], sw: ['sn', -1, GAP] };
  var KNOBS = ['h1-min', 'h1-max', 'rh-min', 'rh-max', 'body-min', 'body-max', 'rp-min', 'rp-max', 'label-min', 'label-max'];
  var SPACES = ['c-min', 'c-max'];
  var ROLES = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'xl', 'lg', 'body', 'sm', 'xs', 'eyebrow', 'label'];
  var SAMPLE = { h1: 'Trellis', h2: 'Seed library', h3: 'Garden Stewards', h4: 'Upcoming gatherings', h5: 'Resources and gallery', h6: 'Members of this circle',
    xl: 'A living map of people.', lg: 'Join a circle near you.', body: 'Circles are small groups.',
    sm: 'Posted in the Seed Library.', xs: 'Last active 2 hours ago', eyebrow: 'Seed library', label: 'Seeking · Offering' };
  var COUNT = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  var num = function (v, d) { return String(+(+v).toFixed(d == null ? 3 : d)); };
  var px = function (v) { return num(v, 1) + 'px'; };

  // The seven values, in points and ratios; and the live box's space, which is
  // the column's own until the slider is moved.
  var state = {}, space = null, touched = false, applied = false;
  // Where settle.js holds text at whole cells (Safari, today), a block whose
  // type shrinks keeps its old height, and nothing tells the runtime: it
  // watches for text that changes, not for a knob set on a box. So after it
  // has changed a knob or the live box, the playground writes each sample's
  // text back to it, which is the change the runtime measures again for.
  // Only the samples are measured, not the page (Trellis.all() would be).
  var stale = false;
  function remeasure() {
    [boxes.wide, boxes.narrow, boxes.live].forEach(function (box) {
      Array.prototype.forEach.call(box.querySelectorAll('p'), function (p) {
        var t = p.firstChild;
        if (t && t.nodeType === 3) t.data = t.data;
      });
    });
  }

  // ---- The model -------------------------------------------------------------
  // H1's place: how many steps of the wide ratio it sits above body.
  function place(s) { return Math.log(s.h1 / s.body) / Math.log(s.rw); }
  function derive(s) {
    var body = s.body / Math.sqrt(s.rn);
    return {
      'h1-max': s.h1 / REM, 'h1-min': body * Math.pow(s.rn, place(s)) / REM,
      'rh-max': s.rw, 'rh-min': s.rn,
      'body-max': s.body / REM, 'body-min': body / REM,
      'rp-max': Math.sqrt(s.rw), 'rp-min': Math.sqrt(s.rn),
      'label-max': s.label / REM, 'label-min': s.label / REM,
      'c-min': s.sn / REM, 'c-max': s.sw / REM
    };
  }
  // A slider holds a value to its own step and ends, so the state is read back from it.
  function put(k, v) { inputs[k].value = v; state[k] = +inputs[k].value; }
  // The seven values the page itself has: core's, or a product layer's.
  function read() {
    readPage();
    var cs = getComputedStyle(root), K = function (k) { return parseFloat(cs.getPropertyValue('--' + k)); };
    put('h1', K('h1-max') * REM); put('body', K('body-max') * REM); put('label', K('label-max') * REM);
    put('rw', K('rh-max')); put('rn', K('rh-min'));
    put('sn', K('c-min') * REM); put('sw', K('c-max') * REM);
  }

  // ---- The samples: the real classes, built once ---------------------------
  ['wide', 'narrow'].forEach(function (end) {
    var list = boxes[end].querySelector('[data-play-lines]');
    ROLES.forEach(function (r) {
      var line = document.createElement('div');
      line.className = 'play-line' + (M.stands(r) ? ' cc-stands' : '');
      line.dataset.role = r;
      line.innerHTML = '<span class="play-meta"><b>' + r + '</b> <span data-size></span><span class="bar" aria-hidden="true"></span></span><p class="t-' + r + '">' + SAMPLE[r] + '</p>';
      list.appendChild(line);
    });
  });

  function words(list) { return list.length < 2 ? list.join('') : list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1]; }
  function say(el, text) { if (el && el.textContent !== text) el.textContent = text; }

  // ---- What the browser made of it -------------------------------------------
  function draw() {
    if (stale) { stale = false; remeasure(); }
    var k = parseFloat(getComputedStyle(root).fontSize) / REM;   // the reader's text size
    ['wide', 'narrow'].forEach(function (end) {
      var sizes = {}, under = [], small = [];
      var lines = boxes[end].querySelectorAll('.play-line');
      Array.prototype.forEach.call(lines, function (line) { sizes[line.dataset.role] = parseFloat(getComputedStyle(line.lastElementChild).fontSize) / k; });
      Array.prototype.forEach.call(lines, function (line) {
        var r = line.dataset.role, v = sizes[r];
        var sunk = M.isHeading(r) && v < sizes.body - .05, tiny = v < SMALL;
        if (sunk) under.push(r);
        if (tiny) small.push(r);
        say(line.querySelector('[data-size]'), num(v, 1));
        line.querySelector('.bar').style.setProperty('--w', (v * k).toFixed(2) + 'px');
        if (tiny) line.dataset.flag = 'small'; else if (sunk) line.dataset.flag = 'under'; else delete line.dataset.flag;
      });
      var fit = 6 - under.length;
      var at = end === 'wide' ? 'At ' + num(state.rw) + ' H1 is ' + num(place(state), 2) + ' steps above body: '
        : 'At ' + num(state.rn) + ' the steps are smaller and the places are the same: ';
      var a = !under.length ? at + 'all six headings stay above body text.'
        : at + (fit === 1 ? 'only h1 stays' : fit ? COUNT[fit] + ' headings stay' : 'no heading stays') + ' above body text, and ' +
          words(under) + (under.length > 1 ? ' come' : ' comes') + ' out smaller.';
      var b = small.length ? 'Under 11px: ' + words(small) + '.' : 'Nothing is under 11px.';
      say(one('[data-play-note="' + end + '"]'), a + ' ' + b);
    });

    // The live box. Its space is its content box, as a container's is.
    var cs = getComputedStyle(boxes.live), pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    var fit = stage.clientWidth - pad;
    if (fit > 0 && stage.dataset.fit !== String(fit)) { stage.dataset.fit = String(fit); stage.style.setProperty('--play-fit', fit + 'px'); }
    var s = space == null ? fit / k : space;
    if (space == null && fit > 0) scrub.value = Math.round(s);
    say(outs.space, Math.round(s) + 'px');
    scrub.setAttribute('aria-valuetext', Math.round(s) + ' pixels');
    fill(scrub);
    var t = (s - state.sn) / (state.sw - state.sn);
    say(where, (t < 0 ? 'Narrower than the narrow space, so every size holds at its narrow end.'
      : t > 1 ? 'Wider than the wide space, so every size holds at its wide end.'
      : Math.round(t * 100) + '% of the way from the narrow space to the wide one, and so is every size.') +
      (s * k > fit + .5 ? ' The box runs past this column; its type answers to its whole width.' : ''));
  }

  // How far along its track a slider's thumb is, for the track's ink.
  function fill(i) {
    var lo = +i.min, hi = +i.max;
    i.style.setProperty('--range-at', num((+i.value - lo) / (hi - lo), 4));
  }

  function exportText() {
    var k = derive(state);
    var lines = KNOBS.map(function (n) { return '    --' + n + ': ' + num(k[n], 4) + ';'; });
    return '/* A product layer, from the Trellis specimen\'s ratio playground. Load it after\n   core.css and put data-product="yours" on <html>. */\n' +
      '@layer trellis.product {\n  :root[data-product="yours"] {\n' + lines.join('\n') + '\n' +
      '    /* The two spaces, in rem: --c-min: ' + num(k['c-min'], 4) + '; --c-max: ' + num(k['c-max'], 4) + '. core.css reads them,\n' +
      '       but they are not product knobs yet, so here they are a comment. */\n  }\n}\n';
  }

  // ---- The two models, compared ---------------------------------------------
  // `page` is the page's own knobs, core's or a product layer's: the twelve
  // for size and the seven for lines and space. They are read with the
  // playground's values off :root, and put back in the same breath.
  var cmp = one('[data-cmp]'), page = {}, roleRows = {};
  var OWN = ['lh-h1', 'lh-h-step', 'lh-body', 'lh-p-step', 'lh-label', 'mb-h1', 'mb-h-step'];
  var FROM = { h1: 'anchor', h2: 'h1 ÷ r', h3: 'h1 ÷ r²', h4: 'h1 ÷ r³', h5: 'h1 ÷ r⁴', h6: 'h1 ÷ r⁵',
    xl: 'body × s²', lg: 'body × s', body: 'anchor', sm: 'body ÷ s', xs: 'body ÷ s²', eyebrow: 'label × s', label: 'anchor' };
  // How the playground works out each of the five it does not set.
  var HOW = {
    'h1-min': function (k) { return num(k['body-min'] * REM, 1) + ' × ' + num(state.rn) + '^' + num(place(state), 2); },
    'body-min': function () { return num(state.body) + ' ÷ √' + num(state.rn); },
    'label-min': function () { return 'the wide label'; },
    'rp-max': function () { return '√' + num(state.rw); },
    'rp-min': function () { return '√' + num(state.rn); }
  };
  function readPage() {
    var all = KNOBS.concat(SPACES), held = applied ? all.map(function (n) { return root.style.getPropertyValue('--' + n); }) : null;
    if (held) all.forEach(function (n) { root.style.removeProperty('--' + n); });
    var cs = getComputedStyle(root);
    all.concat(OWN).forEach(function (n) { page[n] = parseFloat(cs.getPropertyValue('--' + n)); });
    if (held) all.forEach(function (n, i) { root.style.setProperty('--' + n, held[i]); });
  }
  // A set of knobs as math.js takes them: sizes in points, and core's lines.
  function seedOf(k) {
    var pair = function (n) { return [k[n + '-min'] * REM, k[n + '-max'] * REM]; };
    return { type: { h1: pair('h1'), body: pair('body'), label: pair('label'),
      headingRatio: [k['rh-min'], k['rh-max']], paragraphRatio: [k['rp-min'], k['rp-max']],
      lineH1: page['lh-h1'], lineHeadingStep: page['lh-h-step'], lineBody: page['lh-body'], lineParagraphStep: page['lh-p-step'], lineLabel: page['lh-label'],
      afterH1: page['mb-h1'], afterHeadingStep: page['mb-h-step'] } };
  }
  // The roles' rows, built once: a name, where it comes from, four sizes, and
  // core's line and space after.
  if (cmp) (function () {
    var table = one('[data-cmp-roles]'), cell = function (c, d) { return '<span class="t-mono snap cap-center ' + c + '" role="cell" ' + d + '></span>'; };
    ROLES.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'cmp-row'; row.setAttribute('role', 'row');
      row.innerHTML = '<span class="t-mono snap cap-center cmp-role" role="rowheader"><b>' + r + '</b></span>' +
        '<span class="t-mono snap cap-center cmp-how cmp-from" role="cell">' + FROM[r] + '</span>' +
        cell('cmp-num', 'data-c="0"') + cell('cmp-num', 'data-c="1"') + cell('cmp-num', 'data-p="0"') + cell('cmp-num', 'data-p="1"') +
        cell('cmp-num cmp-extra', 'data-line') + cell('cmp-num cmp-extra', 'data-after');
      table.appendChild(row); roleRows[r] = row;
    });
  })();
  // Which headings a model puts under body text, and where: "h6 at both ends".
  function sunk(ends) {
    var list = [];
    ROLES.forEach(function (r) {
      if (!M.isHeading(r)) return;
      var n = ends[r][0] < ends.body[0] - .05, w = ends[r][1] < ends.body[1] - .05;
      if (n || w) list.push(r + (n && w ? ' at both ends' : n ? ' in a narrow space' : ' in a wide space'));
    });
    return list;
  }
  function compare(k) {
    if (!cmp) return;
    var differ = [];
    each('[data-cmp-knob]', function (row) {
      var n = row.dataset.cmpKnob, unit = row.dataset.cmpUnit;
      var show = function (v) { return unit === 'ratio' ? num(v) : unit === 'space' ? Math.round(v * REM) + 'px' : px(v * REM); };
      var a = show(page[n]), b = show(k[n]);
      say(row.querySelector('[data-cmp-core]'), a);
      say(row.querySelector('[data-cmp-play]'), b);
      if (HOW[n]) say(row.querySelector('[data-cmp-how]'), HOW[n](k));
      if (a !== b) { row.dataset.differs = ''; differ.push('--' + n); } else delete row.dataset.differs;
    });
    say(one('[data-cmp-note]'), differ.length ? 'At these values ' + COUNT[differ.length] + ' of the twelve differ: ' + words(differ) + '.'
      : 'At these values the two agree on all twelve.');
    each('[data-cmp-own]', function (row) { say(row.querySelector('[data-cmp-core]'), num(page[row.dataset.cmpOwn])); });

    var seeds = [seedOf(page), seedOf(k)], ends = [{}, {}];
    ROLES.forEach(function (r) { ends[0][r] = M.typeEnds(r, seeds[0]); ends[1][r] = M.typeEnds(r, seeds[1]); });
    ROLES.forEach(function (r) {
      var row = roleRows[r], heading = M.isHeading(r);
      [0, 1].forEach(function (end) {
        var c = row.querySelector('[data-c="' + end + '"]'), p = row.querySelector('[data-p="' + end + '"]');
        var a = num(ends[0][r][end], 1), b = num(ends[1][r][end], 1);
        say(c, a); say(p, b);
        if (a !== b) p.dataset.differs = ''; else delete p.dataset.differs;
        [[c, 0], [p, 1]].forEach(function (x) {
          if (heading && ends[x[1]][r][end] < ends[x[1]].body[end] - .05) x[0].dataset.flag = 'under'; else delete x[0].dataset.flag;
        });
      });
      say(row.querySelector('[data-line]'), num(M.lineRatio(r, seeds[0]), 2));
      say(row.querySelector('[data-after]'), heading ? num(page['mb-h1'] + page['mb-h-step'] * -M.ROLES[r][1], 2) : '');
    });
    var a = sunk(ends[0]), b = sunk(ends[1]);
    say(one('[data-cmp-roles-note]'), !a.length && !b.length ? 'No heading is smaller than body text in either.'
      : 'Smaller than body text, and shown fainter: in core, ' + (a.length ? words(a) : 'no heading') + '; in the playground, ' + (b.length ? words(b) : 'no heading') + '.');
  }

  // ---- Write the knobs, and say what was worked out -------------------------
  function apply() {
    var k = derive(state), on = whole.getAttribute('aria-checked') === 'true';
    [boxes.wide, boxes.narrow, boxes.live].forEach(function (t) {
      KNOBS.concat(SPACES).forEach(function (n) {
        // The wide sample's two spaces are the stylesheet's, which hold it at its wide end.
        if (t === boxes.wide && SPACES.indexOf(n) >= 0) return;
        t.style.setProperty('--' + n, num(k[n], 4));
      });
    });
    if (on || applied) KNOBS.concat(SPACES).forEach(function (n) {
      if (on) root.style.setProperty('--' + n, num(k[n], 4)); else root.style.removeProperty('--' + n);
    });
    applied = on;

    var text = { h1: px(state.h1), body: px(state.body), label: px(state.label), rw: num(state.rw), rn: num(state.rn),
      sn: Math.round(state.sn) + 'px', sw: Math.round(state.sw) + 'px', snh: Math.round(state.sn) + 'px', swh: Math.round(state.sw) + 'px',
      h1n: px(k['h1-min'] * REM), bodyn: px(k['body-min'] * REM), labeln: px(k['label-min'] * REM), pw: num(k['rp-max']), pn: num(k['rp-min']) };
    Object.keys(text).forEach(function (n) { say(outs[n], text[n]); });
    say(sums.h1n, num(k['body-min'] * REM, 1) + ' × ' + num(state.rn) + '^' + num(place(state), 2));
    say(sums.bodyn, num(state.body) + ' ÷ √' + num(state.rn));
    say(sums.pw, '√' + num(state.rw));
    say(sums.pn, '√' + num(state.rn));
    Object.keys(inputs).forEach(function (n) { inputs[n].value = state[n]; inputs[n].setAttribute('aria-valuetext', text[n].replace('px', ' pixels')); fill(inputs[n]); });
    // The stretch of the live box's slider between the two spaces, where type grows.
    var lo = +scrub.min, hi = +scrub.max;
    scrub.style.setProperty('--range-a', num((state.sn - lo) / (hi - lo), 4));
    scrub.style.setProperty('--range-b', num((state.sw - lo) / (hi - lo), 4));
    each('[data-play-preset]', function (b) {
      var hit = Math.abs(state.rw - b.dataset.playPreset) < .0005 && Math.abs(state.rn - b.dataset.playNarrow) < .0005;
      b.setAttribute('aria-pressed', hit ? 'true' : 'false');
    });
    say(out, exportText());
    compare(k);
    stale = true;
    requestAnimationFrame(draw);
  }

  // ---- Controls ---------------------------------------------------------------
  Object.keys(inputs).forEach(function (n) {
    inputs[n].addEventListener('input', function () {
      state[n] = +inputs[n].value;
      hold(n);
      touched = true;
      apply();
    });
  });
  // The narrow ratio is never the larger, and the narrow space stays short of
  // the wide one. If the other can't move far enough, the dragged one stops.
  function hold(n) {
    var p = PUSH[n];
    if (!p) return;
    var o = p[0], want = state[n] + p[1] * p[2];
    if (p[1] * (state[o] - want) >= 0) return;
    put(o, want);
    if (state[o] !== want) put(n, state[o] - p[1] * p[2]);
  }
  each('[data-play-preset]', function (b) {
    b.addEventListener('click', function () {
      put('rw', b.dataset.playPreset); put('rn', b.dataset.playNarrow);
      touched = true;
      apply();
    });
  });
  scrub.addEventListener('input', function () {
    space = +scrub.value;
    boxes.live.style.setProperty('--play-w', num(space / REM, 4) + 'rem');
    stale = true;
    requestAnimationFrame(draw);
  });
  whole.addEventListener('click', function () {
    whole.setAttribute('aria-checked', whole.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    apply();
  });
  one('[data-play-reset]').addEventListener('click', function () {
    whole.setAttribute('aria-checked', 'false');
    if (applied) KNOBS.concat(SPACES).forEach(function (n) { root.style.removeProperty('--' + n); });
    applied = false; touched = false; space = null;
    boxes.live.style.removeProperty('--play-w');
    read(); apply();
  });
  one('[data-play-copy]').addEventListener('click', function (e) {
    var label = e.currentTarget.querySelector('.button-label');
    if (navigator.clipboard) navigator.clipboard.writeText(exportText()).then(function () { label.textContent = 'Copied'; setTimeout(function () { label.textContent = 'Copy'; }, 1500); });
  });
  one('[data-play-save]').addEventListener('click', function () {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([exportText()], { type: 'text/css' }));
    a.download = 'product.css';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  // The boxes are read again when they are resized, and the seven values when
  // the page's own knobs change (a product layer) before anything was dragged.
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { requestAnimationFrame(draw); });
    [stage, boxes.wide, boxes.narrow].forEach(function (el) { ro.observe(el); });
  }
  new MutationObserver(function () { if (!touched && !applied) read(); else readPage(); apply(); })
    .observe(root, { attributes: true, attributeFilter: ['data-product'] });

  read(); apply();
  stale = false;   // the runtime has not measured anything yet
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(draw); });
})();
