/* Trellis · figma-templates · the components built from primitives
   Run as `node tools/figma-components.js --plugin templates`, after the
   primitives: a grouped list, a row swiped open, a stack of faces, a member
   tile, a skeleton, prose, a media frame, a covered card and a covered row
   (D108), the shell and its navigation (D80), in the section Templates, which
   it removes and builds again, with the Screens, which are made of it. */
clear(['Templates', 'Screens']);
host.name = 'templates';
const listSet = got('list-item');

// ---- list cc-group: rows on one surface, hairlines from the text ------------
const TEXT_AT = { none: 'space/sp-1', dot: 'space/sp-3', face: 'space/sp-3' };
const groupSet = await set('list cc-group', { mark: Object.keys(TEXT_AT) }, async (p) => {
  const c = component('VERTICAL'); c.counterAxisAlignItems = 'MIN'; width(c, 360); c.clipsContent = false;
  fill(c, [paint('bg-raised')]); corners(c, 'knob/shape-card'); edge(c, 'border-subtle');
  const titles = ['Morning sit', 'Study circle', 'Work period'];
  for (const [i, t] of titles.entries()) {
    const r = inst(listSet, { mark: p.mark, unread: 'false', state: 'rest' }, 'title', t); c.appendChild(r); r.layoutSizingHorizontal = 'FILL';
    if (i === titles.length - 1) break;
    // The rule is drawn, not laid out: a box with no height, its hairline hanging out of it.
    const h = row('rule', { counterAxisAlignItems: 'MIN' }); c.appendChild(h); bind(h, 'paddingLeft', TEXT_AT[p.mark]);
    const line = figma.createRectangle(); line.name = 'hair'; h.appendChild(line); fill(line, [paint('border-subtle')]); bind(line, 'height', 'space/hair');
    h.resize(360, 0.01); h.layoutSizingHorizontal = 'FILL'; line.layoutSizingHorizontal = 'FILL';
  }
  return c;
}, { caption: 'list cc-group · mark', width: 1200, description: 'Trellis .list.cc-group: the rows share one surface, with a card\'s ground, edge and corner (a level-1 surface; a level 2 in a card). The hairline between rows (--list-rule, one device pixel) starts at the row\'s text, past its mark, and runs to the surface\'s edge; it adds no height.' });

{
  // A row slid toward its start, its actions at its end (the swipe preset).
  const c = component(); c.name = 'list-item[data-trellis-swipe]'; c.primaryAxisSizingMode = 'FIXED'; width(c, 360); c.clipsContent = true; c.primaryAxisAlignItems = 'MAX'; c.counterAxisAlignItems = 'MAX';
  const r = inst(listSet, { mark: 'face', unread: 'true', state: 'rest' }, 'title', 'Study circle'); c.appendChild(r); r.resize(360, r.height);
  const a = row('list-actions'); c.appendChild(a); a.layoutSizingVertical = 'FILL';
  for (const [k, t] of [['cc-ghost', 'Archive'], ['cc-primary', 'Reply']]) { const b = btn(k, 'default', t); a.appendChild(b); b.layoutSizingVertical = 'FILL'; for (const f of RADII) b[f] = 0; }
  c.description = 'Trellis .list-item[data-trellis-swipe] > … + .list-actions: on touch a row slides toward its start to show its actions, buttons as tall as the row with square corners, clipped at its end until then. Drawn open; the slide is presets.js.';
  // Faces in a row, each a half cell over the one before it, parted by the surface.
  const st = row('avatar-stack'), s = figma.createComponentFromNode(st); s.itemSpacing = -6; s.clipsContent = false;
  for (const kind of ['default', 'default', 'cc-group']) { const x = av('default', 'cc-plain', kind); s.appendChild(x); stroke(x, [paint('bg')]); x.strokeAlign = 'OUTSIDE'; x.strokeWeight = 2; }
  const more = row('avatar-more', { primaryAxisAlignItems: 'CENTER', counterAxisSizingMode: 'FIXED' }); s.appendChild(more); bind(more, 'minWidth', 'space/sp-2'); bind(more, 'height', 'space/sp-2'); padX(more, 'space/sp-q'); corners(more, 'radius/r-round');
  fill(more, [paint('bg-sunken')]); edge(more, 'border'); more.appendChild(await words('+9', { fs: 'type/control/fs-control-xs', ink: 'text-secondary', name: 'count' }));
  s.description = 'Trellis .avatar-stack > .avatar… + .avatar-more: faces in a row, each a half cell over the one before and parted from it by two lines of the surface (--av-knock); the rest as a count. The overlap and the knock are numbers at the wide screen.';
  // Someone's presence, on the face's edge.
  const d = row('avatar with avatar-dot'), dc = figma.createComponentFromNode(d); dc.clipsContent = false; dc.appendChild(av('cc-md'));
  const e = figma.createEllipse(); e.name = 'avatar-dot'; dc.appendChild(e); e.layoutPositioning = 'ABSOLUTE'; e.resize(6, 6); e.x = e.y = dc.width - 36 * 0.1464 - 3; e.constraints = { horizontal: 'MAX', vertical: 'MAX' };   // held from the far edges, so it keeps its place as the face takes the wide size
  bind(e, 'width', 'space/sp-h'); bind(e, 'height', 'space/sp-h'); fill(e, [paint('ok')]); stroke(e, [paint('bg')]); e.strokeAlign = 'OUTSIDE'; e.strokeWeight = 2;
  dc.description = 'Trellis .avatar > .avatar-dot: presence, a half cell on the face\'s edge at 45 degrees, parted from it by two lines of the surface. Drawn on the three-cell face.';
  const block = col('rows block', { itemSpacing: 12 }); host.appendChild(block);
  block.appendChild(await words('list-item[data-trellis-swipe] · avatar-stack · avatar with avatar-dot', { style: 'label', ink: 'text-tertiary', name: 'caption' }));
  const l = row('rows row', { itemSpacing: 48 }); block.appendChild(l); for (const x of [c, s, dc]) l.appendChild(x);
  made.push(c.name, 'avatar-stack', 'avatar with avatar-dot');
}

// ---- prose: a post's bare tags, each in its role --------------------------------
{
  const c = component('VERTICAL'); c.name = 'prose'; c.counterAxisAlignItems = 'MIN'; width(c, 480); bind(c, 'itemSpacing', 'space/sp-2');
  const para = async (t, style, into = c, ink) => { const x = await words(t, { style, ink, name: style }); into.appendChild(x); wrap(x); return x; };
  await para('The trial bed in June', 'h3');
  await para('Content arrives from editors and Markdown as bare tags. Each one takes its role, and every block stands two cells from the next.', 'body');
  const h = row('h4'); c.appendChild(h); h.layoutSizingHorizontal = 'FILL'; bind(h, 'paddingTop', 'space/sp-1'); await para('What to bring', 'h4', h);
  const ul = col('ul'); c.appendChild(ul); ul.layoutSizingHorizontal = 'FILL'; bind(ul, 'itemSpacing', 'space/sp-1');
  for (const t of ['Seed from at least six plants of each kind, dried for two weeks.', 'A jar with a label.']) {
    const li = row('li', { counterAxisAlignItems: 'BASELINE' }); ul.appendChild(li); li.layoutSizingHorizontal = 'FILL';
    const m = row('::marker', { primaryAxisSizingMode: 'FIXED', primaryAxisAlignItems: 'CENTER' }); li.appendChild(m); bind(m, 'width', 'space/sp-2'); m.appendChild(await words('•', { style: 'body', ink: 'text-tertiary', name: 'marker' }));
    await para(t, 'body', li);
  }
  const q = row('blockquote'); c.appendChild(q); q.layoutSizingHorizontal = 'FILL'; bind(q, 'paddingLeft', 'space/sp-2'); side(q, 'border-strong', 'Left', 1);
  await para('Everyone who saves seed was once handed some.', 'lg', q);
  c.description = 'Trellis .prose: bare tags from an editor or Markdown, each in its role (README, Prose, has the map). Blocks stand two cells apart (--stack-gap), a list\'s items one (--prose-inner-gap), markers in a two-cell margin; a heading keeps more space before it than after; a quotation is the next size up after a line. Code, tables, figures, galleries and task lists are the code\'s: set them with the text styles.';
  const block = col('prose block', { itemSpacing: 12 }); host.appendChild(block);
  block.appendChild(await words('prose', { style: 'label', ink: 'text-tertiary', name: 'caption' })); block.appendChild(c); made.push('prose');
}

// ---- member-tile, skeleton --------------------------------------------------
await set('member-tile', { layout: ['default', 'cc-row'] }, async (p) => {
  const r = p.layout === 'cc-row', c = component(r ? 'HORIZONTAL' : 'VERTICAL');
  c.counterAxisAlignItems = 'MIN'; width(c, r ? 420 : 240);
  fill(c, [paint('bg-raised')]); edge(c, 'border-subtle'); corners(c, 'knob/shape-card');
  padX(c, 'knob/density-card-pad-inline'); padY(c, 'knob/density-card-pad-block'); bind(c, 'itemSpacing', 'space/sp-2');
  c.appendChild(av(r ? 'cc-lg' : 'cc-xl', 'default'));
  const b = col('member-tile-body'); c.appendChild(b); bind(b, 'itemSpacing', 'space/sp-1');
  if (r) b.layoutGrow = 1; else b.layoutSizingHorizontal = 'FILL';
  b.appendChild(await words('Ada Lovelace', { style: 'h5', name: 'name' }));
  b.appendChild(await words('Steward, since March', { style: 'sm', ink: 'text-secondary', name: 'role' }));
  const cl = row('cluster'); bind(cl, 'itemSpacing', 'space/sp-h'); (r ? b : c).appendChild(cl);
  cl.appendChild(inst(tagSet, { kind: 'cc-person', emphasis: 'default', size: 'cc-sm' }, 'label', 'Mentor'));
  cl.appendChild(btn('default', 'cc-sm', 'Message'));
  return c;
}, { caption: 'member-tile · layout', width: 900, description: 'Trellis .card.member-tile > .avatar + .member-tile-body + .cluster: a card with a person in it, two cells between its parts. A column by default; .cc-row puts the avatar beside the words.' });

await set('skeleton', { kind: ['default', 'cc-block'] }, async (p) => {
  const c = component(); corners(c, 'radius/r-q'); fill(c, [paint('text', 0.08)]);
  if (p.kind === 'cc-block') { c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'FIXED'; c.resize(240, 12); bind(c, 'height', 'space/sp-1'); }
  else { const t = await words('A line of placeholder copy', { style: 'body', name: 'text' }); fill(t, []); c.appendChild(t); }
  return c;
}, { caption: 'skeleton · kind', width: 700, description: 'Trellis .skeleton: a surface\'s real structure, shimmering, while its data is on its way. A text slot keeps its role and its placeholder copy, unseen, so it settles to the same cells. Anything that draws itself (a button, an avatar, an icon) becomes a .cc-block, sized in cells (--skel-w, --skel-h). The shimmer runs from the ink at 8% to 16%; the file draws the 8%.' });

// ---- media, a covered card, a covered row (D108) ----------------------------
const FOCUS = { '50% 50%': [0.5, 0.5], '50% 25%': [0.5, 0.25] };
await set('media', { kind: ['default', 'cc-round'], focus: Object.keys(FOCUS), fill: ['image', 'empty'] }, async (p) => {
  const c = component(), round = p.kind === 'cc-round', w = round ? 144 : 240;
  c.primaryAxisSizingMode = c.counterAxisSizingMode = 'FIXED'; c.resize(w, 144); c.clipsContent = true;
  bind(c, 'height', 'size/media-h'); if (round) bind(c, 'width', 'size/media-h');
  corners(c, round ? 'radius/r-round' : 'radius/r-1');
  fill(c, p.fill === 'empty' ? [paint('bg-sunken')] : [photo(w, 144, FOCUS[p.focus])]);
  return c;
}, { caption: 'media · kind × focus × fill', width: 1400, description: 'Trellis .media > img (D108): a frame sized in cells, --media-w by --media-h (twelve cells; no width fills its column), the image a real <img> by cover at --media-focus (50% 25% keeps a face). Empty, it shows --media-fill. Its corner is --r-1, in a card concentric with the card\'s (derived/media-r); .cc-round is a circle. The image here is a stand-in: replace the fill. A focus off the middle is a crop made at this size; resize the frame and crop again.' });

const MEDIA = ['default', 'cc-bleed', 'cc-bleed-start', 'cc-fill'];
async function cover(kind, state) {
  const strip = kind === 'cc-bleed-start', full = kind === 'cc-fill', ink = (r) => (full ? 'white' : r);
  const c = component(strip ? 'HORIZONTAL' : 'VERTICAL'); c.counterAxisAlignItems = 'MIN'; width(c, 300); c.itemSpacing = 0;
  c.clipsContent = true; corners(c, 'knob/shape-card'); fill(c, [paint('bg-raised')]); if (!full) edge(c, 'border-subtle');
  const frame = (n) => { const m = figma.createFrame(); m.name = `media ${n}`; m.clipsContent = true; m.resize(300, 144); fill(m, [photo(300, 144)]); return m; };
  const body = col('card-body'); padX(body, 'knob/density-card-pad-inline'); padY(body, 'knob/density-card-pad-block'); bind(body, 'itemSpacing', 'space/sp-1');
  if (full) {
    bind(c, 'minHeight', 'size/media-h-fill'); c.primaryAxisAlignItems = 'MAX';
    const m = frame(kind); c.appendChild(m); m.layoutPositioning = 'ABSOLUTE'; m.x = m.y = 0; m.resize(300, 216); fill(m, [photo(300, 216), SCRIM]);
    m.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  } else if (kind !== 'default') {
    const m = frame(kind); c.appendChild(m);
    if (strip) { bind(m, 'width', 'space/sp-3'); m.layoutSizingVertical = 'FILL'; } else { bind(m, 'height', 'size/media-h'); m.layoutSizingHorizontal = 'FILL'; }
  }
  c.appendChild(body); if (strip) body.layoutGrow = 1; else body.layoutSizingHorizontal = 'FILL';
  if (kind === 'default') { const m = frame(kind); body.appendChild(m); m.layoutSizingHorizontal = 'FILL'; bind(m, 'height', 'size/media-h'); corners(m, 'derived/media-r'); }
  body.appendChild(await words('Saturday', { style: 'eyebrow', ink: ink('text-tertiary') }));
  body.appendChild(await words('Lantern walk', { style: 'h4', ink: ink('text'), name: 'card-link' }));
  const sub = await words('Meet at the gate at dusk; we take the lower path.', { style: 'sm', ink: ink('text-secondary'), name: 'sub' });
  body.appendChild(sub); sub.layoutSizingHorizontal = 'FILL'; sub.textAutoResize = 'HEIGHT';
  const cl = row('cluster'); bind(cl, 'itemSpacing', 'space/sp-h'); body.appendChild(cl);
  cl.appendChild(inst(tagSet, { kind: 'cc-event', emphasis: full ? 'cc-solid' : 'default', size: 'cc-sm' }, 'label', 'Outdoors')); cl.appendChild(icon());
  // The cover, a link's ::before over the whole card: the state layer, the accent mark at its start when selected.
  if (share[state] || state === 'selected') {
    const v = figma.createRectangle(); v.name = 'card-link::before'; c.appendChild(v); v.layoutPositioning = 'ABSOLUTE'; v.x = v.y = 0; v.resize(c.width, c.height);
    v.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' }; corners(v, 'knob/shape-card'); fill(v, [paint('text', share[state])]);
    if (state === 'selected') side(v, 'accent', 'Left', 2);
  }
  return c;
}
const coverSet = await set('card:has(.card-link)', { media: MEDIA, state: ['rest', 'hover', 'press', 'selected'] }, (p) => cover(p.media, p.state), { caption: 'card:has(.card-link) · media × state', width: 1400,
  description: 'Trellis .card with an a.card-link title (D108): the link\'s ::before covers the card, so the whole card is one link and nothing is wrapped in an <a>; its other controls (the tag, the button) are raised above the cover and keep their own clicks. Hover and press mix the ink into the cover (6%, 12%), selected (aria-current) 10% with the accent mark at its start; the focus ring is the cover\'s, round the card. Hover is prototype-only. The media is a .media as the card\'s own child: default sits inside, concentric; .cc-bleed is a banner to the card\'s top and sides; .cc-bleed-start a strip three cells wide, the card a row; .cc-fill the card\'s whole ground, at least eighteen cells tall, under a scrim to 80% black, its edge dropped and its words white.' });

const linkRowSet = await set('list-item:has(.list-link)', { state: ['rest', 'hover', 'press', 'selected'] }, async (p) => {
  const c = component(); c.primaryAxisSizingMode = 'FIXED'; width(c, 380); bind(c, 'paddingRight', 'space/sp-1');
  fill(c, share[p.state] ? [paint('text', share[p.state])] : []); if (p.state === 'selected') side(c, 'accent', 'Left', 2);
  const r = inst(listSet, { mark: 'face', unread: 'false', state: 'rest' }, 'title', 'Study circle'); c.appendChild(r); r.layoutGrow = 1;
  c.appendChild(icon());
  return c;
}, { caption: 'list-item:has(.list-link) · state', width: 900, description: 'Trellis .list-item with an a.list-link title (D108): its ::before covers the row, and a button in the row\'s end is raised above it. Hover and press mix the ink into the row; selected (aria-current on the link) is 10% with the accent mark at its start.' });

// ---- the shell and its navigation (D80) -------------------------------------
const LINKS = ['Home', 'People', 'Events', 'Library'];
const PLUS = 'M 9 3 L 9 15 M 3 9 L 15 9', HOUSE = 'M 3 9 L 9 3 L 15 9 M 5 8 L 5 15 L 13 15 L 13 8', MENU = 'M 3 5 L 15 5 M 3 9 L 15 9 M 3 13 L 15 13';
// A shell-link beside the page (side), across the top (bar) or in a tab bar (tab).
async function link(t, on, how) {
  const l = how === 'tab' ? col('shell-link', { primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' }) : row('shell-link');
  bind(l, 'itemSpacing', how === 'tab' ? 'space/sp-q' : 'space/sp-h');
  if (how === 'tab') bind(l, 'minHeight', 'space/sp-4'); else { padX(l, 'space/sp-h'); bind(l, 'minHeight', how === 'bar' ? 'size/size-control-sm' : 'size/size-control-md'); }
  // The current link: the selected fill, and its mark on the bar's edge (a tab bar's on its top), the corners it touches square (D85).
  const MARK = { bar: ['Bottom', 'bottomLeftRadius', 'bottomRightRadius'], tab: ['Top', 'topLeftRadius', 'topRightRadius'], side: ['Left', 'topLeftRadius', 'bottomLeftRadius'] }[how];
  cornersBut(l, 'radius/r-h', on ? MARK.slice(1) : []);
  if (on) { side(l, 'accent', MARK[0], 2); fill(l, [paint('text', share.selected)]); }
  if (how !== 'bar') l.appendChild(glyph(on ? 'text' : 'text-secondary', t === 'Home' ? HOUSE : PLUS));
  l.appendChild(await words(t, { fs: how === 'tab' ? 'type/control/fs-control-xs' : 'type/control/fs-control', ink: on ? 'text' : 'text-secondary' }));
  return l;
}
async function shell(p) {
  const top = p.top === 'cc-top', narrow = p.width === 'narrow';
  const c = component('VERTICAL'); c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'FIXED';
  c.resize(narrow ? 393 : 1200, narrow ? 760 : 680); c.counterAxisAlignItems = 'MIN'; c.itemSpacing = 0; fill(c, [paint('bg')]); c.clipsContent = true;
  const nav = top || narrow ? row('shell-nav') : col('shell-nav', { counterAxisAlignItems: 'MIN' });
  fill(nav, [paint('bg')]);
  if (top) {
    fixedHeight(nav, 'space/sp-4'); padX(nav, 'space/sp-2'); bind(nav, 'itemSpacing', narrow ? 'space/sp-1' : 'space/sp-2'); edge(nav, 'border-subtle', 1, ['Bottom']);
    nav.appendChild(await words('Trellis', { fs: 'type/control/fs-control', weight: 'type/fw-strong', name: 'shell-brand' }));
    if (narrow) {
      const m = row('button icon-button shell-menu', { primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'FIXED', primaryAxisAlignItems: 'CENTER' }); nav.appendChild(m);
      bind(m, 'width', 'size/size-control-sm'); bind(m, 'height', 'size/size-control-sm'); corners(m, 'knob/shape-control'); m.appendChild(glyph('text', MENU));
    }
    else { const ls = row('shell-links'); bind(ls, 'itemSpacing', 'space/sp-q2'); nav.appendChild(ls); for (const t of LINKS) ls.appendChild(await link(t, t === 'People', 'bar')); }
    const end = row('shell-nav-end', { primaryAxisAlignItems: 'MAX' }); bind(end, 'itemSpacing', 'space/sp-h'); nav.appendChild(end); end.layoutGrow = 1;
    end.appendChild(icon()); end.appendChild(av('default'));
  } else if (narrow) {
    bind(nav, 'paddingLeft', 'space/sp-2'); bind(nav, 'paddingRight', 'space/sp-2'); edge(nav, 'border-subtle', 1, ['Top']);
    for (const t of LINKS) { const l = await link(t, t === 'People', 'tab'); nav.appendChild(l); l.layoutGrow = 1; }
  } else {
    nav.counterAxisSizingMode = 'FIXED'; bind(nav, 'width', 'size/shell-nav-w'); padX(nav, 'space/sp-1'); padY(nav, 'space/sp-1'); bind(nav, 'itemSpacing', 'space/sp-q2'); edge(nav, 'border-subtle', 1, ['Right']);
    nav.primaryAxisSizingMode = 'FIXED'; nav.counterAxisSizingMode = 'FIXED';
    for (const t of LINKS) { const l = await link(t, t === 'People', 'side'); nav.appendChild(l); l.layoutSizingHorizontal = 'FILL'; }
  }
  const main = col('shell-main'); padX(main, 'space/sp-2'); padY(main, 'space/sp-2'); bind(main, 'itemSpacing', 'space/sp-2');
  const head = col('section-head'); bind(head, 'itemSpacing', 'space/sp-1'); main.appendChild(head);
  head.appendChild(await words('Directory', { style: 'eyebrow', ink: 'text-tertiary' })); head.appendChild(await words('People', { style: 'h2' }));
  const g = variant(groupSet, { mark: 'face' }).createInstance(); main.appendChild(g); g.layoutSizingHorizontal = 'FILL';
  const aside = col('shell-aside'); padX(aside, 'space/sp-2'); padY(aside, 'space/sp-2'); bind(aside, 'itemSpacing', 'space/sp-1');
  aside.appendChild(await words('This week', { style: 'h5' }));
  const at = await words('Three sits and a study circle. The aside drops under main below 72rem.', { style: 'sm', ink: 'text-secondary' }); aside.appendChild(at);
  const foot = col('shell-foot'); padX(foot, 'space/sp-2'); padY(foot, 'space/sp-2'); edge(foot, 'border-subtle', 1, ['Top']);
  foot.appendChild(await words('The small print · Privacy · Terms', { style: 'xs', ink: 'text-tertiary' }));
  const grow = (n) => { n.layoutGrow = 1; };
  if (narrow) {
    if (top) c.appendChild(nav);
    for (const n of [main, aside, foot]) { c.appendChild(n); n.layoutSizingHorizontal = 'FILL'; }
    grow(main);
    if (!top) c.appendChild(nav);
    nav.layoutSizingHorizontal = 'FILL'; at.layoutSizingHorizontal = 'FILL'; at.textAutoResize = 'HEIGHT';
  } else {
    const cols = row('shell-cols', { counterAxisAlignItems: 'MIN' }); cols.appendChild(main); cols.appendChild(aside);
    grow(main); aside.counterAxisSizingMode = 'FIXED'; bind(aside, 'width', 'size/shell-aside-w'); at.layoutSizingHorizontal = 'FILL'; at.textAutoResize = 'HEIGHT';
    const right = col('shell-right'); right.appendChild(cols); right.appendChild(foot); cols.layoutSizingHorizontal = 'FILL'; foot.layoutSizingHorizontal = 'FILL'; grow(cols);
    if (top) { c.appendChild(nav); nav.layoutSizingHorizontal = 'FILL'; c.appendChild(right); right.layoutSizingHorizontal = 'FILL'; grow(right); }
    else {
      c.layoutMode = 'HORIZONTAL'; c.counterAxisAlignItems = 'MIN'; c.appendChild(nav); nav.layoutSizingVertical = 'FILL';
      c.appendChild(right); grow(right); right.layoutSizingVertical = 'FILL';
    }
  }
  return c;
}
const shellSet = await set('shell', { top: ['default', 'cc-top'], width: ['wide', 'narrow'] }, shell, { caption: 'shell · top × width', width: 1700,
  description: 'Trellis .shell > .shell-grid > .shell-nav, .shell-main, .shell-aside, .shell-foot. Wide, the navigation is a column 20 cells wide (--shell-nav-w) and the aside 24 (--shell-aside-w); under 72rem the aside drops under main, and under 48rem the navigation is a tab bar. .cc-top puts it in a bar four cells tall (--shell-bar-h): .shell-brand, .shell-links, .shell-nav-end; under 48rem the links fold behind .shell-menu and open as a left tray. The shell answers to its own width (a container query): here, wide is 1200 and narrow a 393pt phone. The current link (aria-current) carries the accent mark; a dropdown is an options-card under its link (.float.cc-anchor).' });

// Crumbs, an outline, the skip link.
await set('crumbs', { width: ['default', 'narrow'] }, async (p) => {
  const c = component(); const narrow = p.width === 'narrow';
  const li = async (t, ink) => { const l = row('li'); bind(l, 'minHeight', 'space/sp-2'); c.appendChild(l); l.appendChild(await words(t, { fs: 'type/control/fs-control-sm', ink })); return l; };
  if (narrow) await li('← Guides', 'text-secondary');
  else for (const [i, t] of ['Library', 'Guides', 'Setup'].entries()) {
    if (i) { const s = await li('/', 'text-faint'); padX(s, 'space/sp-h'); }
    await li(t, i === 2 ? 'text' : 'text-secondary');
  }
  return c;
}, { caption: 'crumbs · width', width: 600, description: 'Trellis nav > ol.crumbs > li > a, the last li the page itself (aria-current="page"). Rows are whole cells. In a box under 30rem only the parent shows, as a link back.' });
{
  const c = component('VERTICAL'); c.name = 'outline'; c.counterAxisAlignItems = 'MIN'; width(c, 220);
  for (const [t, lvl, on] of [['Overview', 0, false], ['Install', 0, true], ['Requirements', 1, false], ['Steps', 1, false], ['Use', 0, false]]) {
    const w = row('li'); c.appendChild(w); w.layoutSizingHorizontal = 'FILL'; if (lvl) bind(w, 'paddingLeft', 'space/sp-1');
    const l = row('outline-link'); w.appendChild(l); l.layoutGrow = 1; padX(l, 'space/sp-h'); bind(l, 'minHeight', 'size/size-control-sm');
    cornersBut(l, 'radius/r-h', on ? ['topLeftRadius', 'bottomLeftRadius'] : []); if (on) side(l, 'accent', 'Left', 2);
    l.appendChild(await words(t, { fs: 'type/control/fs-control', ink: on ? 'text' : 'text-secondary' }));
  }
  c.description = 'Trellis nav.outline > ul > li > a.outline-link (+ ul): rows a control tall (--outline-row), each level a cell further in (--outline-indent). The heading in view is aria-current, marked by the app.';
  const k = component(); k.name = 'skip-link'; bind(k, 'minHeight', 'size/size-control-lg'); padX(k, 'space/sp-1h'); corners(k, 'knob/shape-control'); fill(k, [paint('accent')]);
  k.appendChild(await words('Skip to content', { fs: 'type/control/fs-control', ink: 'accent-ink' }));
  k.description = 'Trellis a.skip-link: the first thing in the page, hidden until it takes focus, then drawn over the page\'s start, a cell in.';
  const block = col('nav block', { itemSpacing: 12 }); host.appendChild(block);
  block.appendChild(await words('outline · skip-link', { style: 'label', ink: 'text-tertiary', name: 'caption' }));
  const r = row('nav row', { itemSpacing: 48, counterAxisAlignItems: 'MIN' }); block.appendChild(r); r.appendChild(c); r.appendChild(k); made.push('outline', 'skip-link');
}

return Object.assign({ components: made }, section('Templates'));
