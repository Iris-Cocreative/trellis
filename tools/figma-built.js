/* Trellis · figma-built · what the parts after the primitives share
   Not run on its own (tools/figma-components.js): the components built so far,
   by name, as instances, and a few helpers. */
if (!page.children.some((n) => n.type === 'SECTION' && n.name === 'Components')) throw new Error('no Components section: run figma-components --plugin primitives first');
const got = (name) => {
  for (const s of page.children) if (s.type === 'SECTION' && SECTIONS.includes(s.name)) { const f = s.findOne((n) => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === name); if (f) return f; }
  throw new Error(`no component ${name}: run the part that builds it first`);
};
const [btnSet, iconSet, tagSet, avatarSet] = ['button', 'button icon-button', 'tag', 'avatar'].map(got);
const av = (size, ring = 'cc-plain', kind = 'default') => variant(avatarSet, { kind, ring, size }).createInstance();
const inst = (s, props, key, v) => { const i = variant(s, props).createInstance(); if (key) label(i, key, v); return i; };
const btn = (kind, size, text, emphasis = 'default') => inst(btnSet, { kind, emphasis, size, state: 'rest' }, 'label', text);
const icon = (size = 'cc-sm', name = 'ph-dots-three') => pick(inst(iconSet, { kind: 'cc-ghost', emphasis: 'default', size }), name);
// A component's own properties on an instance, by name: its text, the parts it shows.
const props = (i, o) => { const all = Object.keys(i.componentProperties); i.setProperties(Object.fromEntries(Object.entries(o).map(([k, v]) => [all.find((x) => x === k || x.startsWith(k + '#')), v]))); return i; };
// Text that fills its column and wraps; its column must already hold it.
const wrap = (t) => { t.layoutSizingHorizontal = 'FILL'; t.textAutoResize = 'HEIGHT'; return t; };
// Corners bound to one variable, but those a mark squares (D85).
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const cornersBut = (node, name, square = []) => RADII.forEach((f) => { if (!square.includes(f)) bind(node, f, name); });
// A line on one side: a current link's mark, a bar's rule, a quote's.
const side = (node, role, s, w) => { stroke(node, [paint(role)]); node.strokeAlign = 'INSIDE'; for (const x of ['Top', 'Bottom', 'Left', 'Right']) node[`stroke${x}Weight`] = x === s ? w : 0; };
