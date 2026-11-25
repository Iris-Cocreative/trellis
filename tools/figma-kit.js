/* Trellis · figma-kit · what both component scripts share
   Not run on its own: `node tools/figma-components.js --plugin <part>` prints
   this, then the part (tools/figma-primitives.js or tools/figma-templates.js),
   wrapped so a run that fails takes back what it made. It reads the variables
   by name (tools/figma-variables.js --plugin writes them), loads every family a
   product names, and holds the helpers: paint, bind, a component set from its
   variants. Top-level await and return, as an agent's Figma tool runs it. */
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
const families = [...new Set(Object.keys(V).filter((n) => n.startsWith('font/')).flatMap(valuesOf))];
const weights = [...new Set(Object.keys(V).filter((n) => n.startsWith('weight/')).flatMap(valuesOf))];
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
  fill(f, []); f.counterAxisAlignItems = 'CENTER'; f.clipsContent = false;
  return Object.assign(f, props);
};
// A frame that holds text never clips: trimmed to the baseline, a descender hangs below its box.
const col = (name, props = {}) => { const f = figma.createAutoLayout('VERTICAL', { name }); fill(f, []); f.clipsContent = false; return Object.assign(f, props); };
// resize() fixes both axes; a box that holds text hugs its height again.
const width = (node, w) => { node.resize(w, node.height); if (node.layoutMode === 'VERTICAL') node.primaryAxisSizingMode = 'AUTO'; else node.counterAxisSizingMode = 'AUTO'; };
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
    if (o.skip && o.skip(p)) continue;   // a pair the code has no such thing as (a radio's mixed)
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
const share = { rest: 0, hover: 0.06, press: 0.12, selected: 0.10 };
const STAGES = [1, 2, 3, 4, 5, 6, 7];
const label = (inst, key, v) => inst.setProperties({ [Object.keys(inst.componentProperties).find((k) => k.startsWith(key))]: v });
