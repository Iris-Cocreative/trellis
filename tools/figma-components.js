/* Trellis · figma-components · the Figma file's components, generated
   A Figma plugin script, run after the variables (tools/figma-variables.js
   --plugin) in the same file: it reads them by name and builds every
   primitive as a component set named by its class chain, its variants the
   modifiers (`button` with kind=cc-ghost, size=cc-sm is
   class="button cc-ghost cc-sm"), each measure bound to the variable core
   reads, so a frame's Product, Space, Type and Color modes reshape it. Then
   one screen composed from them, in each product, wide and light, phone
   and dark.

   It owns three things on the first page, by name: the sections Components
   and Screens, which it removes and builds again. Run it on a file as often as
   the code changes; a designer's own frames elsewhere are left alone, though
   an instance of a component it rebuilt is detached from it.

   Top-level await and return, as an agent's Figma tool runs it. */

const V = {};
for (const x of await figma.variables.getLocalVariablesAsync()) V[x.name] = x;
const need = (n) => { if (!V[n]) throw new Error(`no variable ${n}: run figma-variables --plugin first`); return V[n]; };
const COL = {};
for (const c of await figma.variables.getLocalVariableCollectionsAsync()) COL[c.name] = c;
const STY = {};
for (const s of await figma.getLocalTextStylesAsync()) STY[s.name] = s;

// Every family a product names, in every weight one sets.
const fonts = await figma.listAvailableFontsAsync();
const STYLE = { 400: 'regular', 500: 'medium', 600: 'semibold', 700: 'bold' };
const valuesOf = (n) => Object.values(need(n).valuesByMode);
const families = [...new Set(['font/font-sans', 'font/font-serif', 'font/font-heading'].flatMap(valuesOf))];
const weights = [...new Set(['weight/fw-body', 'weight/fw-heading', 'weight/fw-label', 'weight/fw-label-text', 'weight/fw-strong'].flatMap(valuesOf))];
for (const fam of families) for (const w of weights) {
  const f = fonts.find((x) => x.fontName.family === fam && x.fontName.style.replace(/\s+/g, '').toLowerCase() === STYLE[w]);
  if (f) await figma.loadFontAsync(f.fontName);
}
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

// A run that fails takes back what it made, so the next one starts clean.
const page = figma.root.children[0];
const before = new Set(page.children.map((n) => n.id));

// ---- Helpers ----------------------------------------------------------------
// A role, or a role at a share (a hover's 6%, a tag's 14%): a share is its
// own color variable, color/tint/<role>/<percent>, with the alpha in it.
// Figma drops a paint's own opacity on an instance, so none is used.
const paint = (role, share = 1) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color',
  need(share >= 1 ? 'color/' + role : `color/tint/${role}/${Math.round(share * 100)}`));
const fill = (node, paints) => { node.fills = paints; };
const stroke = (node, paints) => { node.strokes = paints; };
const bind = (node, field, name) => node.setBoundVariable(field, need(name));
const corners = (node, name) => ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'].forEach((f) => bind(node, f, name));
const padX = (node, name) => { bind(node, 'paddingLeft', name); bind(node, 'paddingRight', name); };
const padY = (node, name) => { bind(node, 'paddingTop', name); bind(node, 'paddingBottom', name); };
const edge = (node, role, opacity = 1, sides = ['Top', 'Bottom', 'Left', 'Right']) => {
  stroke(node, [paint(role, opacity)]);
  node.strokeAlign = 'INSIDE';
  for (const s of ['Top', 'Bottom', 'Left', 'Right']) { if (sides.includes(s)) bind(node, `stroke${s}Weight`, 'space/line'); else node[`stroke${s}Weight`] = 0; }
};
const lift = (node) => {
  node.effects = [figma.variables.setBoundVariableForEffect({ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.12 }, offset: { x: 0, y: 6 }, radius: 24, spread: 0, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false }, 'color', need('color/lift'))];
};
const row = (name, props = {}) => {
  const f = figma.createAutoLayout('HORIZONTAL', { name });
  fill(f, []); f.counterAxisAlignItems = 'CENTER';
  return Object.assign(f, props);
};
const col = (name, props = {}) => { const f = figma.createAutoLayout('VERTICAL', { name }); fill(f, []); return Object.assign(f, props); };
const component = (dir = 'HORIZONTAL') => {
  const c = figma.createComponent();
  c.layoutMode = dir; c.primaryAxisSizingMode = 'AUTO'; c.counterAxisSizingMode = 'AUTO';
  c.counterAxisAlignItems = 'CENTER'; fill(c, []);
  return c;
};
const fixedHeight = (node, name) => { if (node.layoutMode === 'HORIZONTAL') node.counterAxisSizingMode = 'FIXED'; else node.primaryAxisSizingMode = 'FIXED'; bind(node, 'height', name); };
// Text in a role's style, or a control's label: its own size, the label weight, trimmed to its capitals.
async function words(chars, o) {
  const t = figma.createText();
  t.fontName = { family: 'Inter', style: 'Regular' };
  t.characters = chars; t.name = o.name || 'label';
  if (o.style) await t.setTextStyleIdAsync(STY['Trellis/' + o.style].id);
  else {
    bind(t, 'fontFamily', o.family || 'type/font-sans');
    bind(t, 'fontWeight', o.weight || 'type/fw-label');
    if (o.fs) bind(t, 'fontSize', o.fs); else t.fontSize = o.size;
    t.lineHeight = { unit: 'PERCENT', value: 100 };
    t.leadingTrim = 'CAP_HEIGHT';
  }
  fill(t, [paint(o.ink || 'text')]);
  return t;
}
const glyph = (ink, d = 'M 9 3 L 9 15 M 3 9 L 15 9') => {
  const box = figma.createFrame(); box.name = 'icon'; fill(box, []); box.resize(18, 18); box.clipsContent = false;
  const v = figma.createVector(); v.vectorPaths = [{ windingRule: 'NONE', data: d }];
  stroke(v, [paint(ink)]); v.strokeWeight = 1.5; v.strokeCap = 'ROUND'; v.resize(18, 18);
  v.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  box.appendChild(v); bind(box, 'width', 'size/size-icon-md'); bind(box, 'height', 'size/size-icon-md');
  return box;
};

// A component set from a list of variants, laid out in rows by its first property.
const host = col('primitives', { itemSpacing: 48, paddingLeft: 48, paddingRight: 48, paddingTop: 48, paddingBottom: 48 });
const made = [];
async function set(name, axes, build, o = {}) {
  const combos = Object.entries(axes).reduce((acc, [k, vs]) => acc.flatMap((a) => vs.map((v) => Object.assign({}, a, { [k]: v }))), [{}]);
  const comps = [];
  for (const p of combos) {
    const c = await build(p);
    c.name = Object.entries(p).map(([k, v]) => `${k}=${v}`).join(', ');
    comps.push(c);
  }
  const block = col(name + ' block', { itemSpacing: 12 });
  const caption = await words(o.caption || name, { style: 'label', ink: 'text-tertiary', name: 'caption' });
  block.appendChild(caption);
  host.appendChild(block);
  const s = figma.combineAsVariants(comps, block);
  s.name = name;
  s.description = o.description || '';
  s.layoutMode = 'HORIZONTAL'; s.layoutWrap = 'WRAP';
  s.itemSpacing = 16; s.counterAxisSpacing = 16;
  s.paddingLeft = s.paddingRight = s.paddingTop = s.paddingBottom = 24;
  s.counterAxisAlignItems = 'CENTER';
  s.primaryAxisSizingMode = 'FIXED'; s.counterAxisSizingMode = 'AUTO';
  s.resize(o.width || 1200, s.height);
  fill(s, [paint('bg')]);
  if (o.text) {
    const key = s.addComponentProperty(o.text[0], 'TEXT', o.text[1]);
    for (const c of s.children) for (const t of c.findAll((n) => n.type === 'TEXT' && n.name === o.text[0])) t.componentPropertyReferences = { characters: key };
  }
  made.push(name);
  return s;
}
const variant = (s, props) => s.children.find((c) => c.name === Object.entries(props).map(([k, v]) => `${k}=${v}`).join(', '));

// ---- Start clean ------------------------------------------------------------
for (const n of page.children.slice()) if (['Components', 'Screens', 'Settings · Wide · Light', 'Settings · Phone · Dark'].includes(n.name)) n.remove();
const share = { rest: 0, hover: 0.06, press: 0.12, selected: 0.10 };
try {

// ---- button -----------------------------------------------------------------
const SIZES = { default: ['knob/density-control-h', 'knob/density-control-fs', 'derived/control-pad'], 'cc-sm': ['size/size-control-sm', 'type/control/fs-control-sm', 'space/sp-1'],
  'cc-md': ['size/size-control-md', 'type/control/fs-control-md', 'space/sp-1'], 'cc-lg': ['size/size-control-xl', 'type/control/fs-control-lg', 'space/sp-2'] };
const KINDS = { default: { bg: null, edge: 'border-strong', ink: 'text' }, 'cc-primary': { bg: 'accent', edge: 'accent', ink: 'accent-ink' }, 'cc-ghost': { bg: null, edge: null, ink: 'text' } };
const buttonFace = (c, p) => {
  const k = KINDS[p.kind], off = p.state === 'disabled';
  const [h, , pad] = SIZES[p.size];
  fixedHeight(c, h); padX(c, pad); corners(c, 'knob/shape-control');
  c.itemSpacing = 0; bind(c, 'itemSpacing', 'space/sp-h'); c.primaryAxisAlignItems = 'CENTER';
  const fills = [];
  if (off) fills.push(paint('bg-sunken'));
  else { if (k.bg) fills.push(paint(k.bg)); if (share[p.state || 'rest']) fills.push(paint(k.ink, share[p.state])); }
  fill(c, fills);
  if (off) edge(c, 'border-subtle'); else if (k.edge) edge(c, k.edge);
  return off ? 'text-faint' : k.ink;
};
await set('button', { kind: Object.keys(KINDS), size: Object.keys(SIZES), state: ['rest', 'hover', 'press', 'disabled'] }, async (p) => {
  const c = component(), ink = buttonFace(c, p);
  c.appendChild(await words('Button', { fs: SIZES[p.size][1], ink }));
  return c;
}, { text: ['label', 'Button'], caption: 'button · kind × size × state',
  description: 'Trellis .button. <button class="button cc-primary cc-sm">Save</button>. Height, padding and corner follow the product (--density-control-h, --shape-control). Hover is 6% of its ink over its fill, press 12%; disabled is :disabled or aria-disabled. On touch the hit area is 44pt whatever it draws.' });

await set('button icon-button', { kind: Object.keys(KINDS), size: Object.keys(SIZES) }, async (p) => {
  const c = component(), ink = buttonFace(c, Object.assign({ state: 'rest' }, p));
  c.paddingLeft = c.paddingRight = 0; c.primaryAxisSizingMode = 'FIXED'; bind(c, 'width', SIZES[p.size][0]);
  c.appendChild(glyph(ink));
  return c;
}, { caption: 'button icon-button · kind × size', description: 'Trellis .button.icon-button: a button made square. <button class="button icon-button cc-ghost cc-sm" aria-label="Add">. An icon button alone draws nothing: it is always a button.' });

// ---- tag --------------------------------------------------------------------
const TAG_KINDS = { default: 'kind-topic', 'cc-person': 'kind-person', 'cc-group': 'kind-group', 'cc-event': 'kind-event', 'cc-course': 'kind-course', 'cc-ok': 'ok', 'cc-warn': 'warn', 'cc-alert': 'alert' };
const TAG_SIZES = { default: ['knob/tag-default-h', 'knob/tag-default-fs', 'derived/tag-pad', 'space/sp-h'], 'cc-sm': ['size/size-control-xs', 'knob/tag-fs-sm', 'derived/tag-pad-sm', 'space/sp-q'], 'cc-lg': ['size/size-control-md', 'knob/tag-fs-lg', 'derived/tag-pad-lg', 'space/sp-h'] };
await set('tag', { kind: Object.keys(TAG_KINDS), emphasis: ['default', 'cc-outline', 'cc-solid'], size: Object.keys(TAG_SIZES) }, async (p) => {
  const c = component(), hue = TAG_KINDS[p.kind], [h, fs, pad, gap] = TAG_SIZES[p.size], solid = p.emphasis === 'cc-solid';
  fixedHeight(c, h); padX(c, pad); corners(c, 'knob/tag-radius'); bind(c, 'itemSpacing', gap);
  fill(c, solid ? [paint(hue)] : p.emphasis === 'cc-outline' ? [] : [paint(hue, 0.14)]);
  edge(c, hue, solid ? 1 : 0.42);
  c.appendChild(await words('Tag', { fs, ink: solid ? 'on-' + hue : 'text' }));
  return c;
}, { text: ['label', 'Tag'], caption: 'tag · kind × emphasis × size', width: 1600,
  description: 'Trellis .tag, the archetype: a height, a corner, padding equal to the corner, an edge and a tint mixed from one kind color. <span class="tag cc-person cc-solid">. A product sets its corner, height and size (--tag-r-fixed, --tag-r-ratio, --tag-default-h); its case and tracking (--tag-case, Quarry\'s uppercase) are the code\'s alone.' });

// ---- avatar -----------------------------------------------------------------
const AV = { 'cc-xs': [1, 'space/sp-1'], default: [2, 'space/sp-2'], 'cc-md': [3, 'space/sp-3'], 'cc-lg': [4, 'space/sp-4'], 'cc-xl': [6, 'space/sp-6'], 'cc-xxl': [8, 'space/sp-8'], 'cc-hero': [12, 'space/sp-12'] };
const GROUP_R = { 0.25: 'radius/r-q', 0.5: 'radius/r-h', 1: 'radius/r-1', 1.5: 'radius/r-1h', 2: 'radius/r-2' };
await set('avatar', { kind: ['default', 'cc-group'], size: Object.keys(AV) }, async (p) => {
  const c = component(), [n, size] = AV[p.size], hue = p.kind === 'cc-group' ? 'kind-group' : 'kind-person', big = n >= 4;
  c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'FIXED'; c.primaryAxisAlignItems = 'CENTER';
  bind(c, 'width', size); bind(c, 'height', size);
  if (p.kind === 'cc-group') { if (GROUP_R[n / 4]) corners(c, GROUP_R[n / 4]); else c.cornerRadius = n * 3; } else corners(c, 'radius/r-round');
  fill(c, [paint('bg-raised'), paint(hue, 0.26)]);
  const gap = big ? 3 : 1, ring = big ? 3 : 2;
  const shadow = (spread, role) => figma.variables.setBoundVariableForEffect({ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 1 }, offset: { x: 0, y: 0 }, radius: 0, spread, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false }, 'color', need('color/' + role));
  c.effects = [shadow(gap + ring, hue), shadow(gap, 'bg-raised')];
  if (n >= 2) c.appendChild(await words('AB', { size: Math.round(n * 12 * 0.38), ink: 'text' }));
  return c;
}, { caption: 'avatar · kind × size', description: 'Trellis .avatar: the photo is the box, on whole cells. Shape is kind: a circle is a person, a rounded square (corner a quarter of its size) a group. Its gap and ring are spread shadows; in the file they are numbers at the wide screen.' });

// ---- badge, dot -------------------------------------------------------------
const BADGE = { default: ['alert', 1, 'on-alert'], 'cc-quiet': ['text', 0.1, 'text-secondary'], 'cc-accent': ['accent', 1, 'accent-ink'] };
await set('badge', { kind: Object.keys(BADGE) }, async (p) => {
  const c = component(), [ground, o, ink] = BADGE[p.kind];
  fixedHeight(c, 'size/size-control-xs'); bind(c, 'minWidth', 'size/size-control-xs'); padX(c, 'space/sp-q'); corners(c, 'radius/r-round');
  c.primaryAxisAlignItems = 'CENTER';
  fill(c, o < 1 ? [paint('bg-raised'), paint(ground, o)] : [paint(ground)]);
  c.appendChild(await words('3', { fs: 'type/control/fs-control-xs', weight: 'type/fw-strong', ink }));
  return c;
}, { text: ['count', '3'], caption: 'badge · kind', width: 400, description: 'Trellis .badge: a count. <span class="badge cc-accent">3</span>.' });
await set('dot', { kind: ['default', 'cc-ok', 'cc-warn', 'cc-quiet'] }, async (p) => {
  const c = component(); c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'FIXED';
  bind(c, 'width', 'space/sp-h'); bind(c, 'height', 'space/sp-h'); corners(c, 'radius/r-round');
  fill(c, [paint({ default: 'alert', 'cc-ok': 'ok', 'cc-warn': 'warn', 'cc-quiet': 'text-faint' }[p.kind])]);
  return c;
}, { caption: 'dot · kind', width: 400, description: 'Trellis .dot: the smallest mark of a state. One that carries meaning alone takes role="img" and a label.' });

// ---- switch -----------------------------------------------------------------
const track = (on, off) => {
  const t = row('track', { primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'FIXED' });
  bind(t, 'width', 'space/sp-3'); bind(t, 'height', 'space/sp-1h'); corners(t, 'radius/r-round'); padX(t, 'space/sp-q');
  t.primaryAxisAlignItems = on ? 'MAX' : 'MIN';
  fill(t, off ? [paint('text', 0.1)] : on ? [paint('accent')] : [paint('text', 0.32)]);
  const k = figma.createEllipse(); k.name = 'thumb'; t.appendChild(k);
  bind(k, 'width', 'space/sp-1'); bind(k, 'height', 'space/sp-1');
  fill(k, [off ? paint('bg-sunken') : on ? paint('accent-ink') : { type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]);
  return t;
};
await set('switch', { checked: ['false', 'true'], state: ['rest', 'disabled'] }, async (p) => {
  const c = component(); bind(c, 'minHeight', 'size/size-control-sm'); bind(c, 'itemSpacing', 'space/sp-h');
  c.appendChild(track(p.checked === 'true', p.state === 'disabled'));
  c.appendChild(await words('Switch', { fs: 'type/control/fs-control', ink: p.state === 'disabled' ? 'text-faint' : 'text' }));
  return c;
}, { text: ['label', 'Switch'], caption: 'switch · checked × state', width: 600, description: 'Trellis .switch: on or off, now. <button class="switch" role="switch" aria-checked="true">Label</button>. The track 3 × 1½ cells, the thumb a cell.' });

// ---- range ------------------------------------------------------------------
await set('range', { kind: ['default', 'cc-zone'] }, async (p) => {
  const c = component(); c.primaryAxisSizingMode = 'FIXED'; c.resize(240, 24); fixedHeight(c, 'space/sp-2');
  c.itemSpacing = 0;
  const seg = (role, grow) => { const r = figma.createRectangle(); r.name = 'track'; fill(r, [paint(role)]); c.appendChild(r); bind(r, 'height', 'space/sp-q'); corners(r, 'radius/r-round'); r.layoutGrow = grow; return r; };
  if (p.kind === 'cc-zone') { seg('border', 1); seg('text-secondary', 1); }
  else seg('text-secondary', 1);
  const thumb = figma.createEllipse(); thumb.name = 'thumb'; c.appendChild(thumb);
  bind(thumb, 'width', 'space/sp-1h'); bind(thumb, 'height', 'space/sp-1h');
  fill(thumb, [paint('bg-raised')]); stroke(thumb, [paint('text-secondary')]); thumb.strokeWeight = 1; thumb.strokeAlign = 'INSIDE';
  seg('border', 1);
  return c;
}, { caption: 'range · kind', width: 600, description: 'Trellis .range: a value along a line. <input type="range" class="range">. Inked up to the thumb (--range-at); .cc-zone inks the stretch where the value has an effect. Drag the thumb by resizing the two tracks.' });

// ---- input, field -----------------------------------------------------------
const IN_SIZES = { default: ['knob/density-control-h', 'knob/density-control-fs', 'space/sp-1'], 'cc-sm': ['size/size-control-sm', 'type/control/fs-control-sm', 'space/sp-h'], 'cc-lg': ['size/size-control-xl', 'type/control/fs-control-lg', 'space/sp-1'] };
const inputSet = await set('input', { state: ['rest', 'invalid', 'disabled', 'read-only'], size: Object.keys(IN_SIZES) }, async (p) => {
  const c = component(), [h, fs, pad] = IN_SIZES[p.size], quiet = p.state === 'disabled' || p.state === 'read-only';
  c.primaryAxisSizingMode = 'FIXED'; c.resize(240, 36); fixedHeight(c, h); padX(c, pad); corners(c, 'knob/shape-input');
  fill(c, [paint(quiet ? 'bg-sunken' : 'bg-raised')]);
  edge(c, p.state === 'invalid' ? 'alert' : p.state === 'disabled' ? 'border-subtle' : 'border');
  const t = await words('Placeholder', { fs, weight: 'type/fw-body', ink: p.state === 'disabled' ? 'text-tertiary' : 'text-tertiary', name: 'value' });
  c.appendChild(t); t.layoutGrow = 1; t.textAutoResize = 'HEIGHT';
  return c;
}, { text: ['value', 'Placeholder'], caption: 'input · state × size', description: 'Trellis .input: one box for input, select and textarea, at the product\'s control height (--density-control-h, --shape-input). invalid is aria-invalid="true". On touch the code makes it 44pt and 16px type, or iOS zooms.' });

await set('field', { state: ['rest', 'invalid'] }, async (p) => {
  const c = component('VERTICAL'); c.counterAxisAlignItems = 'MIN'; bind(c, 'itemSpacing', 'space/sp-1');
  const lab = await words('Label', { style: 'label', ink: 'text-secondary', name: 'label' }); c.appendChild(lab);
  const box = variant(inputSet, { state: p.state === 'invalid' ? 'invalid' : 'rest', size: 'default' }).createInstance(); c.appendChild(box);
  const hint = await words('A hint, or what went wrong', { style: 'xs', ink: p.state === 'invalid' ? 'alert' : 'text-tertiary', name: 'hint' }); c.appendChild(hint);
  for (const t of [lab, hint]) { const w = row('inset'); bind(w, 'paddingLeft', 'space/sp-1'); c.insertChild(c.children.indexOf(t), w); w.appendChild(t); }
  return c;
}, { caption: 'field · state', width: 700, description: 'Trellis .field: a label, an input and a hint, the label and hint starting where the input\'s text does (--field-inset, a cell). <label class="field"><span class="field-label t-label">…</span><input class="input">…<span class="field-hint t-xs">…</span></label>.' });

// ---- tab, tabs --------------------------------------------------------------
const tabSet = await set('tab', { context: ['default', 'cc-seg'], selected: ['false', 'true'] }, async (p) => {
  const c = component(), seg = p.context === 'cc-seg', on = p.selected === 'true';
  fixedHeight(c, seg ? 'knob/density-seg-h' : 'size/size-control-lg'); padX(c, 'space/sp-1'); bind(c, 'itemSpacing', 'space/sp-h');
  if (seg) { corners(c, 'derived/seg-tab-r'); fill(c, on ? [paint('bg-raised')] : []); }
  else if (on) { stroke(c, [paint('text')]); c.strokeAlign = 'INSIDE'; c.strokeTopWeight = c.strokeLeftWeight = c.strokeRightWeight = 0; c.strokeBottomWeight = 2; }
  c.appendChild(await words('Tab', { fs: seg ? 'type/control/fs-control-sm' : 'type/control/fs-control', ink: on ? 'text' : 'text-secondary' }));
  return c;
}, { text: ['label', 'Tab'], caption: 'tab · context × selected', width: 600, description: 'Trellis .tab, in .tabs or .tabs.cc-seg (the segmented control). aria-selected="true" is its only state; a tab is whole cells tall.' });
const tabs = async (seg) => {
  const c = component(); c.name = seg ? 'tabs cc-seg' : 'tabs';
  if (seg) { fill(c, [paint('bg-sunken')]); edge(c, 'border-subtle'); bind(c, 'paddingLeft', 'derived/seg-pad'); bind(c, 'paddingRight', 'derived/seg-pad'); padY(c, 'derived/seg-pad'); corners(c, 'knob/shape-control'); bind(c, 'itemSpacing', 'space/line'); }
  else edge(c, 'border-subtle', 1, ['Bottom']);
  ['Day', 'Week', 'Month'].forEach((label, i) => { const t = variant(tabSet, { context: seg ? 'cc-seg' : 'default', selected: String(i === 1) }).createInstance(); c.appendChild(t); t.setProperties({ [Object.keys(t.componentProperties).find((k) => k.startsWith('label'))]: label }); });
  c.description = seg ? 'Trellis .tabs.cc-seg: a choice of one among several. Its ground pads the tabs (--density-seg-pad) so the control is three cells tall by default.' : 'Trellis .tabs: tabs on a rule, the selected one marked by a line under it.';
  return c;
};
{
  const block = col('tabs block', { itemSpacing: 12 }); host.appendChild(block);
  block.appendChild(await words('tabs · tabs cc-seg', { style: 'label', ink: 'text-tertiary', name: 'caption' }));
  const r = row('tabs row', { itemSpacing: 48 }); block.appendChild(r);
  r.appendChild(await tabs(false)); r.appendChild(await tabs(true)); made.push('tabs', 'tabs cc-seg');
}

// ---- options-card, tooltip --------------------------------------------------
const itemSet = await set('options-card-item', { kind: ['default', 'switch'], state: ['rest', 'hover', 'selected', 'disabled'] }, async (p) => {
  const c = component(); c.primaryAxisSizingMode = 'FIXED'; c.resize(192, 30);
  bind(c, 'minHeight', 'knob/density-option-h'); padX(c, 'space/sp-h'); bind(c, 'itemSpacing', 'space/sp-h'); corners(c, 'derived/option-r');
  const sw = p.kind === 'switch', on = sw ? p.state === 'selected' : false, off = p.state === 'disabled';
  fill(c, !sw && share[p.state] ? [paint('text', share[p.state])] : sw && p.state === 'hover' ? [paint('text', share.hover)] : []);
  const t = await words('Option', { fs: 'knob/density-option-fs', weight: 'type/fw-body', ink: off ? 'text-faint' : 'text' });
  c.appendChild(t); t.layoutGrow = 1;
  if (sw) c.appendChild(track(on, off));
  else if (p.state === 'selected') c.appendChild(glyph('accent', 'M 3 9.5 L 7 13.5 L 15 4.5'));
  return c;
}, { text: ['label', 'Option'], caption: 'options-card-item · kind × state', width: 900, description: 'Trellis .options-card-item, a row in an options card. selected is aria-selected or aria-checked. kind=switch is button.options-card-item[role=menuitemcheckbox] with an empty span.switch at its end, lit by the row.' });
{
  const c = component('VERTICAL'); c.name = 'options-card'; c.counterAxisSizingMode = 'FIXED'; c.counterAxisAlignItems = 'MIN';
  bind(c, 'width', 'space/sp-16'); padX(c, 'knob/density-options-pad'); padY(c, 'knob/density-options-pad'); corners(c, 'knob/shape-float');
  fill(c, [paint('bg-raised')]); edge(c, 'border'); lift(c);
  for (const [label, state] of [['Rename', 'rest'], ['Duplicate', 'hover'], ['Sort by name', 'selected'], ['Archive', 'disabled']]) {
    const i = variant(itemSet, { kind: 'default', state }).createInstance(); c.appendChild(i); i.layoutSizingHorizontal = 'FILL';
    i.setProperties({ [Object.keys(i.componentProperties).find((k) => k.startsWith('label'))]: label });
  }
  c.description = 'Trellis .float.options-card: 16 cells wide, items 2½ cells (--density-option-h), padding --density-options-pad, corner --shape-float, item corners concentric. Opened as a popover by its anchor; drawn here where it would open.';
  const tip = component(); tip.name = 'tooltip'; padX(tip, 'space/sp-h'); padY(tip, 'space/sp-q'); corners(tip, 'radius/r-q'); fill(tip, [paint('text')]); lift(tip);
  const tt = await words('A tooltip', { fs: 'type/control/fs-control-sm', weight: 'type/fw-body', ink: 'bg', name: 'label' }); tip.appendChild(tt);
  tip.description = 'Trellis .float.tooltip: the page\'s ink as its ground, the page as its ink.';
  const block = col('floats block', { itemSpacing: 12 }); host.appendChild(block);
  block.appendChild(await words('options-card · tooltip', { style: 'label', ink: 'text-tertiary', name: 'caption' }));
  const r = row('floats row', { itemSpacing: 48, counterAxisAlignItems: 'MIN' }); block.appendChild(r);
  r.appendChild(c); r.appendChild(tip); made.push('options-card', 'tooltip');
}

// ---- card -------------------------------------------------------------------
const LEVEL = { 1: ['bg-raised', 'knob/shape-card', 'knob/density-card-pad-inline', 'knob/density-card-pad-block'], 2: ['bg-raised-2', 'derived/card-nest-r', 'space/sp-1', 'space/sp-1'], 3: ['bg-raised-3', 'derived/card-nest-r2', 'space/sp-1', 'space/sp-1'] };
const cardSet = await set('card', { level: ['1', '2', '3'] }, async (p) => {
  const c = component('VERTICAL'); c.counterAxisSizingMode = 'FIXED'; c.counterAxisAlignItems = 'MIN'; c.resize(288, 100);
  const [ground, r, px, py] = LEVEL[p.level];
  fill(c, [paint(ground)]); corners(c, r); padX(c, px); padY(c, py); bind(c, 'itemSpacing', 'space/sp-1');
  if (p.level === '1') edge(c, 'border-subtle');
  c.appendChild(await words('Card', { style: 'h5', name: 'title' }));
  const b = await words('A surface on the page. In a card it is the next ground, with no edge, one cell of padding and a concentric corner.', { style: 'sm', ink: 'text-secondary', name: 'body' });
  c.appendChild(b); b.layoutSizingHorizontal = 'FILL'; b.textAutoResize = 'HEIGHT';
  return c;
}, { text: ['title', 'Card'], caption: 'card · level', width: 1100, description: 'Trellis .card. Its level is its nesting, which a component can\'t see: set it. Level 1 has an edge and the product\'s padding and corner (--density-card-pad-inline, -block, --shape-card); 2 and 3 step along the ground and are concentric. A nested card steps out by derived/card-nest-out: draw it that much wider.' });

// ---- modal ------------------------------------------------------------------
const btnSet = figma.root.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'button');
const iconSet = figma.root.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'button icon-button');
{
  const m = component('VERTICAL'); m.name = 'modal'; m.counterAxisSizingMode = 'FIXED'; m.counterAxisAlignItems = 'MIN'; m.resize(420, 200);
  fill(m, [paint('bg-raised')]); corners(m, 'knob/shape-card'); edge(m, 'border'); lift(m);
  const head = row('modal-header', { counterAxisAlignItems: 'MIN', primaryAxisAlignItems: 'SPACE_BETWEEN' }); m.appendChild(head); head.layoutSizingHorizontal = 'FILL';
  padX(head, 'space/sp-2'); bind(head, 'paddingTop', 'space/sp-2'); bind(head, 'paddingBottom', 'space/sp-1');
  head.appendChild(await words('Dialog title', { style: 'h4', name: 'title' }));
  head.appendChild(variant(iconSet, { kind: 'cc-ghost', size: 'cc-sm' }).createInstance());
  const body = col('modal-body'); m.appendChild(body); body.layoutSizingHorizontal = 'FILL'; padX(body, 'space/sp-2'); padY(body, 'space/sp-1');
  const bt = await words('The body scrolls when the dialog is taller than the screen. Its footer holds the actions, the main one last.', { style: 'body', ink: 'text-secondary', name: 'body' });
  body.appendChild(bt); bt.layoutSizingHorizontal = 'FILL'; bt.textAutoResize = 'HEIGHT';
  const foot = row('modal-footer', { primaryAxisAlignItems: 'MAX' }); m.appendChild(foot); foot.layoutSizingHorizontal = 'FILL';
  padX(foot, 'space/sp-2'); bind(foot, 'paddingBottom', 'space/sp-2'); bind(foot, 'paddingTop', 'space/sp-1'); bind(foot, 'itemSpacing', 'space/sp-h');
  foot.appendChild(variant(btnSet, { kind: 'default', size: 'default', state: 'rest' }).createInstance());
  foot.appendChild(variant(btnSet, { kind: 'cc-primary', size: 'default', state: 'rest' }).createInstance());
  m.description = 'Trellis .modal on the native <dialog>: .modal > .modal-inner > .modal-header / -body / -footer, padding two cells (--modal-pad), corner --shape-card. On a screen under 48rem a centered modal is a bottom tray (.cc-tray.cc-bottom).';
  const block = col('modal block', { itemSpacing: 12 }); host.appendChild(block);
  block.appendChild(await words('modal', { style: 'label', ink: 'text-tertiary', name: 'caption' }));
  block.appendChild(m); made.push('modal');
}

// ---- Lay out ----------------------------------------------------------------
const comps = figma.createSection(); comps.name = 'Components'; page.appendChild(comps);
fill(host, [paint('bg')]);
comps.appendChild(host); host.x = 0; host.y = 0;
host.setExplicitVariableModeForCollection(COL.Space, COL.Space.modes.find((m) => m.name === 'Wide').modeId);
host.setExplicitVariableModeForCollection(COL.Type, COL.Type.modes.find((m) => m.name === 'Wide').modeId);
comps.resizeWithoutConstraints(host.width, host.height);

// ---- Screens: one settings card, in each product at two screens and themes -----
const item = (label, on) => { const i = variant(itemSet, { kind: 'switch', state: on ? 'selected' : 'rest' }).createInstance(); i.setProperties({ [Object.keys(i.componentProperties).find((k) => k.startsWith('label'))]: label }); return i; };
const tagSet = figma.root.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'tag');
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
  const segComp = figma.root.findOne((n) => n.type === 'COMPONENT' && n.name === 'tabs cc-seg');
  card.appendChild(segComp.createInstance());
  const opts = col('options'); card.appendChild(opts); opts.layoutSizingHorizontal = 'FILL'; bind(opts, 'itemSpacing', 'space/sp-q');
  for (const [l, on] of [['Mentions', true], ['Replies to me', true], ['A weekly digest', false]]) { const i = item(l, on); opts.appendChild(i); i.layoutSizingHorizontal = 'FILL'; }
  const tagsRow = row('cluster'); card.appendChild(tagsRow); bind(tagsRow, 'itemSpacing', 'space/sp-h');
  for (const [l, k, e] of [['People', 'cc-person', 'default'], ['Events', 'cc-event', 'default'], ['Urgent', 'cc-alert', 'cc-solid']]) {
    const t = variant(tagSet, { kind: k, emphasis: e, size: 'default' }).createInstance(); tagsRow.appendChild(t);
    t.setProperties({ [Object.keys(t.componentProperties).find((x) => x.startsWith('label'))]: l });
  }
  const fieldSet = figma.root.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'field');
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
screens.resizeWithoutConstraints(x - 80, Math.max(...screens.children.map((n) => n.height)));
comps.x = 0; comps.y = 0; screens.x = 0; screens.y = comps.height + 200;
return { components: made, componentsSection: comps.id, screensSection: screens.id, screens: shown, size: [Math.round(comps.width), Math.round(comps.height)] };
} catch (e) {
  for (const n of page.children.slice()) if (!before.has(n.id)) n.remove();
  throw e;
}
