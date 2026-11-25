/* Trellis · figma-settle · what can only be placed once the layout has settled
   Run as `node tools/figma-components.js --plugin settle`, last, on its own
   (it needs no kit). Figma lays a script's work out after the script ends, so a
   width read while it runs can be another screen's. It places the count on each
   icon button's corner from the widths as they are now (D115: a quarter cell,
   or more on a small button, past the corner, its right edge held), and fits
   each section to its frame. It adds and removes nothing. */
const page = figma.root.children[0];
const PAST = { default: 3, 'cc-sm': 9, 'cc-md': 6, 'cc-lg': 3 };
const set = page.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'button icon-button');
let placed = 0;
for (const c of set.children) {
  const b = c.children.find((n) => n.name === 'badge cc-corner');
  b.x = c.width + PAST[c.name.match(/size=([a-z-]+)/)[1]] - b.width; b.y = -PAST[c.name.match(/size=([a-z-]+)/)[1]];
  placed++;
}
let y = 0;
for (const name of ['Icons', 'Components', 'Surfaces', 'Thread', 'Templates', 'Screens']) {
  const s = page.children.find((n) => n.type === 'SECTION' && n.name === name);
  if (!s) continue;
  if (s.children.length === 1) s.resizeWithoutConstraints(s.children[0].width, s.children[0].height);
  s.x = 0; s.y = y; y += s.height + 200;
}
return { placed };
