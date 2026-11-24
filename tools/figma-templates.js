/* Trellis · figma-templates · the second part of the components script
   Run as `node tools/figma-components.js --plugin templates`, after the
   primitives part, which it is made of. The components built from primitives
   (a bubble and a reaction, a grouped list, a member tile, a skeleton, the
   shell and its navigation, D80) in the section Templates, then the Screens:
   one settings card in each product, wide and light, phone and dark, a page of
   scopes (D96), and the shell in two products. It removes and builds both
   sections again. */

// ---- Start clean ------------------------------------------------------------
const C = page.children.find((n) => n.name === 'Components');
if (!C) throw new Error('no Components section: run figma-components --plugin primitives first');
for (const n of page.children.slice()) if (['Templates', 'Screens'].includes(n.name)) n.remove();
const got = (name) => C.findOne((n) => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === name);
const [btnSet, iconSet, tagSet, avatarSet, listSet, itemSet, chatSet, composerSet, fieldSet] =
  ['button', 'button icon-button', 'tag', 'avatar', 'list-item', 'options-card-item', 'chat-item cc-flat', 'composer', 'field'].map(got);
const av = (size, ring = 'cc-plain') => variant(avatarSet, { kind: 'default', ring, size }).createInstance();
const inst = (s, props, key, v) => { const i = variant(s, props).createInstance(); if (key) label(i, key, v); return i; };
const btn = (kind, size, text) => inst(btnSet, { kind, size, state: 'rest' }, 'label', text);
const icon = () => inst(iconSet, { kind: 'cc-ghost', size: 'cc-sm' });
// Corners bound to one variable, but those a mark squares (D85).
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const cornersBut = (node, name, square = []) => RADII.forEach((f) => { if (!square.includes(f)) bind(node, f, name); });
// A line on one side: a current link's mark, a bar's rule.
const side = (node, role, s, w) => { stroke(node, [paint(role)]); node.strokeAlign = 'INSIDE'; for (const x of ['Top', 'Bottom', 'Left', 'Right']) node[`stroke${x}Weight`] = x === s ? w : 0; };
host.name = 'templates';

// ---- chat-item: the bubble and its knobs (D99) ----------------------------------
const bubbleSet = await set('chat-item', { from: ['default', 'cc-own'], run: ['first', 'cc-cont'] }, async (p) => {
  const c = component(), own = p.from === 'cc-own', cont = p.run === 'cc-cont';
  c.counterAxisAlignItems = 'MIN'; c.primaryAxisSizingMode = 'FIXED'; width(c, 560); bind(c, 'itemSpacing', 'space/sp-1');
  if (own) c.primaryAxisAlignItems = 'MAX';
  else { const a = av('default'); c.appendChild(a); a.opacity = cont ? 0 : 1; }
  const body = col('chat-item-body', { counterAxisAlignItems: own ? 'MAX' : 'MIN' }); c.appendChild(body);
  bind(body, 'itemSpacing', 'space/sp-1'); bind(body, 'maxWidth', 'size/chat-measure');
  const bub = row('chat-item-bubble'); padX(bub, 'space/sp-1'); padY(bub, 'space/sp-1');
  cornersBut(bub, 'knob/shape-card', [own ? 'bottomRightRadius' : 'bottomLeftRadius']);
  bind(bub, own ? 'bottomRightRadius' : 'bottomLeftRadius', 'radius/r-q');
  fill(bub, [paint(own ? 'chat-own-bg' : 'bg-raised')]); if (!own) edge(bub, 'chat-bubble-edge');
  bub.appendChild(await words(own ? (cont ? 'And one more.' : 'See you at ten.') : cont ? 'The run goes on, a cell under it.' : 'A bubble hangs its text from a cell.', { style: 'body', ink: own ? 'chat-own-ink' : 'text', name: 'text' }));
  body.appendChild(bub);
  if (own || !cont) {
    const meta = row('chat-item-meta', { counterAxisAlignItems: 'BASELINE' }); bind(meta, 'itemSpacing', 'space/sp-h');
    if (!own) meta.appendChild(await words('Ada', { style: 'xs', ink: 'text-tertiary', name: 'name' }));
    meta.appendChild(await words('9:41', { style: 'xs', ink: 'text-tertiary', name: 'time' }));
    if (own) body.appendChild(meta); else body.insertChild(0, meta);
  }
  return c;
}, { caption: 'chat-item · from × run', width: 1200, description: 'Trellis .chat-item in a bubble thread: .avatar + .chat-item-body > .chat-item-meta + .chat-item-bubble. The bubble pads a cell, at most --chat-measure (40 cells) wide, its corner --shape-card and the speaker\'s bottom corner --chat-tail (a quarter cell). Others\' bubbles take the raised ground and the product\'s --chat-bubble-edge; your own (.cc-own) sits at the row\'s end with no avatar, in --chat-own-bg and --chat-own-ink, its meta under it. .cc-cont continues a run a cell apart: the avatar keeps its place, unseen, and the meta shows once.' });

await set('chat-reaction', { mine: ['false', 'true'] }, async (p) => {
  const c = component(), on = p.mine === 'true';
  fixedHeight(c, 'size/size-control-sm'); padX(c, 'space/sp-h'); bind(c, 'itemSpacing', 'space/sp-q'); corners(c, 'radius/r-round');
  fill(c, on ? [paint('bg'), paint('accent', 0.16)] : [paint('bg')]); edge(c, on ? 'accent' : 'border-subtle', on ? 0.6 : 1);
  c.appendChild(await words('👍', { fs: 'type/control/fs-control-lg', ink: 'text', name: 'emoji' }));
  c.appendChild(await words('3', { fs: 'type/control/fs-control-sm', ink: on ? 'text' : 'text-secondary', name: 'count' }));
  return c;
}, { text: ['count', '3'], caption: 'chat-reaction · mine', width: 400, description: 'Trellis .chat-reactions > .chat-reaction > .chat-reaction-emoji: a pill a control tall. Yours (.cc-mine, or aria-pressed="true") is the accent at 16% over the surface, its edge the accent at 60%.' });

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

// ---- the shell and its navigation (D80) -------------------------------------
const LINKS = ['Home', 'People', 'Events', 'Library'];
const PLUS = 'M 9 3 L 9 15 M 3 9 L 15 9', HOUSE = 'M 3 9 L 9 3 L 15 9 M 5 8 L 5 15 L 13 15 L 13 8', MENU = 'M 3 5 L 15 5 M 3 9 L 15 9 M 3 13 L 15 13';
// A shell-link beside the page (side), across the top (bar) or in a tab bar (tab).
async function link(t, on, how) {
  const l = how === 'tab' ? col('shell-link', { primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' }) : row('shell-link');
  bind(l, 'itemSpacing', how === 'tab' ? 'space/sp-q' : 'space/sp-h');
  if (how === 'tab') bind(l, 'minHeight', 'space/sp-4'); else { padX(l, 'space/sp-h'); bind(l, 'minHeight', how === 'bar' ? 'size/size-control-sm' : 'size/size-control-md'); }
  cornersBut(l, 'radius/r-h', !on ? [] : how === 'bar' ? ['bottomLeftRadius', 'bottomRightRadius'] : ['topLeftRadius', 'bottomLeftRadius']);
  if (on) side(l, 'accent', how === 'bar' ? 'Bottom' : 'Left', 2);
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

// ---- Lay out ----------------------------------------------------------------
const tpl = figma.createSection(); tpl.name = 'Templates'; page.appendChild(tpl);
fill(host, [paint('bg')]); tpl.appendChild(host); host.x = 0; host.y = 0;
host.setExplicitVariableModeForCollection(COL.Space, COL.Space.modes.find((m) => m.name === 'Wide').modeId);
host.setExplicitVariableModeForCollection(COL.Type, COL.Type.modes.find((m) => m.name === 'Wide').modeId);
tpl.resizeWithoutConstraints(host.width, host.height);

// ---- Screens: one settings card, in each product at two screens and themes -----
const item = (t, on) => inst(itemSet, { kind: 'switch', state: on ? 'selected' : 'rest' }, 'label', t);
async function settings(title, width, modes) {
  const f = col(title); f.resize(width, 400); f.counterAxisSizingMode = 'FIXED'; f.primaryAxisSizingMode = 'AUTO'; fill(f, [paint('bg')]);
  padX(f, 'space/sp-2'); padY(f, 'space/sp-4');
  for (const [colName, modeName] of Object.entries(modes)) f.setExplicitVariableModeForCollection(COL[colName], COL[colName].modes.find((m) => m.name === modeName).modeId);
  const card = col('card'); f.appendChild(card); card.layoutSizingHorizontal = 'FILL';
  fill(card, [paint('bg-raised')]); edge(card, 'border-subtle'); corners(card, 'knob/shape-card');
  padX(card, 'knob/density-card-pad-inline'); padY(card, 'knob/density-card-pad-block'); bind(card, 'itemSpacing', 'space/sp-2');
  const head = col('section-head'); card.appendChild(head); head.layoutSizingHorizontal = 'FILL'; bind(head, 'itemSpacing', 'space/sp-1');
  head.appendChild(await words('Settings', { style: 'eyebrow', ink: 'text-tertiary' }));
  head.appendChild(await words('Notifications', { style: 'h4' }));
  const lede = await words('Choose what reaches you, and when. Nothing here is sent until you save.', { style: 'sm', ink: 'text-secondary' });
  head.appendChild(lede); lede.layoutSizingHorizontal = 'FILL'; lede.textAutoResize = 'HEIGHT';
  card.appendChild(got('tabs cc-seg').createInstance());
  const opts = col('options'); card.appendChild(opts); opts.layoutSizingHorizontal = 'FILL'; bind(opts, 'itemSpacing', 'space/sp-q');
  for (const [l, on] of [['Mentions', true], ['Replies to me', true], ['A weekly digest', false]]) { const i = item(l, on); opts.appendChild(i); i.layoutSizingHorizontal = 'FILL'; }
  const tagsRow = row('cluster'); card.appendChild(tagsRow); bind(tagsRow, 'itemSpacing', 'space/sp-h');
  for (const [l, k, e] of [['People', 'cc-person', 'default'], ['Events', 'cc-event', 'default'], ['Urgent', 'cc-alert', 'cc-solid']]) {
    const t = variant(tagSet, { kind: k, emphasis: e, size: 'default' }).createInstance(); tagsRow.appendChild(t);
    t.setProperties({ [Object.keys(t.componentProperties).find((x) => x.startsWith('label'))]: l });
  }
  const fld = variant(fieldSet, { state: 'rest' }).createInstance(); card.appendChild(fld); fld.layoutSizingHorizontal = 'FILL';
  const actions = row('cluster'); card.appendChild(actions); bind(actions, 'itemSpacing', 'space/sp-1');
  for (const [l, k] of [['Save', 'cc-primary'], ['Cancel', 'default']]) {
    const b = variant(btnSet, { kind: k, size: 'default', state: 'rest' }).createInstance(); actions.appendChild(b);
    b.setProperties({ [Object.keys(b.componentProperties).find((x) => x.startsWith('label'))]: l });
  }
  return f;
}
const screens = figma.createSection(); screens.name = 'Screens'; page.appendChild(screens);
const shown = [];
let x = 0;
for (const [p, s, c] of [['Core', 'Wide', 'Light'], ['Core', 'Phone', 'Dark'], ['Quarry', 'Wide', 'Light'], ['Quarry', 'Phone', 'Dark'], ['Almanac', 'Wide', 'Light'], ['Almanac', 'Phone', 'Dark']]) {
  const f = await settings(`Settings · ${p} · ${s} · ${c}`, s === 'Wide' ? 480 : 393, { Product: p, Space: s, Type: s, Color: c });
  screens.appendChild(f); f.x = x; f.y = 0; x += f.width + 80; shown.push(f.id);
}
// Scopes (D96): a product nested in a product is an inner frame with its own
// Product mode, and a mood (data-theme) the same frame in the Dark Color mode.
const modeOf = (f, modes) => { for (const [k, m] of Object.entries(modes)) f.setExplicitVariableModeForCollection(COL[k], COL[k].modes.find((x) => x.name === m).modeId); };
async function scopeCard(name, scope, dark) {
  const card = col(`[data-product="${scope}"]`); modeOf(card, Object.assign({ Product: 'Grove › ' + name }, dark ? { Color: 'Dark' } : {}));
  fill(card, [paint('bg-raised')]); edge(card, 'border-subtle'); corners(card, 'knob/shape-card');
  padX(card, 'knob/density-card-pad-inline'); padY(card, 'knob/density-card-pad-block'); bind(card, 'itemSpacing', 'space/sp-2');
  const head = col('section-head'); card.appendChild(head); head.layoutSizingHorizontal = 'FILL'; bind(head, 'itemSpacing', 'space/sp-1');
  head.appendChild(await words(dark ? 'A scope, at night' : 'A scope', { style: 'eyebrow', ink: 'text-tertiary' }));
  head.appendChild(await words(name, { style: 'h3' }));
  const list = col('list'); card.appendChild(list); list.layoutSizingHorizontal = 'FILL';
  for (const [t, m, u] of [['Morning sit', 'dot', 'true'], ['Study circle', 'face', 'false']]) { const i = variant(listSet, { mark: m, unread: u, state: 'rest' }).createInstance(); list.appendChild(i); i.layoutSizingHorizontal = 'FILL'; label(i, 'title', t); }
  const b = variant(btnSet, { kind: 'cc-primary', size: 'default', state: 'rest' }).createInstance(); card.appendChild(b); label(b, 'label', 'Join');
  return card;
}
const eco = col('Grove · Wide · Light · scopes'); width(eco, 1200); eco.counterAxisSizingMode = 'FIXED'; fill(eco, [paint('bg')]);
modeOf(eco, { Product: 'Grove', Space: 'Wide', Type: 'Wide', Color: 'Light' });
padX(eco, 'space/sp-4'); padY(eco, 'space/sp-4'); bind(eco, 'itemSpacing', 'space/sp-3');
eco.appendChild(await words('One ecosystem', { style: 'h2' }));
const arch = row('archways', { counterAxisAlignItems: 'MIN' }); eco.appendChild(arch); arch.layoutSizingHorizontal = 'FILL'; bind(arch, 'itemSpacing', 'space/sp-2');
for (const [n, s, d] of [['Studio', 'studio', false], ['Lodge', 'lodge', true], ['Lantern', 'lantern', false]]) { const k = await scopeCard(n, s, d); arch.appendChild(k); k.layoutGrow = 1; }
const threads = row('threads', { counterAxisAlignItems: 'MIN' }); eco.appendChild(threads); bind(threads, 'itemSpacing', 'space/sp-4');
const talk = col('chat-thread cc-flat'); threads.appendChild(talk); width(talk, 520); bind(talk, 'itemSpacing', 'space/sp-q');
for (const v of [{ run: 'first', state: 'rest' }, { run: 'cc-cont', state: 'hover' }]) { const i = variant(chatSet, v).createInstance(); talk.appendChild(i); i.layoutSizingHorizontal = 'FILL'; }
const cmp = variant(composerSet, { state: 'ready' }).createInstance(); talk.appendChild(cmp); cmp.layoutSizingHorizontal = 'FILL';
// A bubble thread: others' run, then your own.
const bub = col('chat-thread'); threads.appendChild(bub); width(bub, 520); bind(bub, 'itemSpacing', 'space/sp-1');
for (const [from, run] of [['default', 'first'], ['default', 'cc-cont'], ['cc-own', 'first']]) { const i = variant(bubbleSet, { from, run }).createInstance(); bub.appendChild(i); i.layoutSizingHorizontal = 'FILL'; }
const rowH = Math.max(...screens.children.map((n) => n.height));
screens.appendChild(eco); eco.x = 0; eco.y = rowH + 80; shown.push(eco.id);
// The shell (D80), in two products: across the top, wide and light; a tab bar, on a phone at night.
let sx = 0, sy = eco.y + eco.height + 80;
for (const [p, s, c, top] of [['Quarry', 'Wide', 'Light', 'cc-top'], ['Almanac', 'Phone', 'Dark', 'default'], ['Core', 'Phone', 'Light', 'cc-top']]) {
  const f = col(`Shell · ${p} · ${s} · ${c}`); modeOf(f, { Product: p, Space: s, Type: s, Color: c });
  f.appendChild(variant(shellSet, { top, width: s === 'Wide' ? 'wide' : 'narrow' }).createInstance());
  screens.appendChild(f); f.x = sx; f.y = sy; sx += f.width + 80; shown.push(f.id);
}
screens.resizeWithoutConstraints(Math.max(x - 80, eco.width, sx - 80), sy + Math.max(...shown.slice(-3).map((id) => screens.findOne((n) => n.id === id).height)));
C.x = 0; C.y = 0; tpl.x = 0; tpl.y = C.height + 200; screens.x = 0; screens.y = tpl.y + tpl.height + 200;
return { components: made, templatesSection: tpl.id, screensSection: screens.id, screens: shown, size: [Math.round(tpl.width), Math.round(tpl.height)] };
