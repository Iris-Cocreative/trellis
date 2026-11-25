/* Trellis · figma-icons · the icons, Phosphor's (D118)
   Run as `node tools/figma-components.js --plugin icons`, first of the parts:
   a component for each icon the other parts use, and no more, from the
   specimen's sprite (tools/figma-phosphor.js), with Phosphor's notice, in the
   section Icons. It removes and builds that section, and the others after it,
   which are made of these. ICONS is [name, x, y, path on the 256 square]. */
clear(SECTIONS);
host.name = 'icons';
const ICONS = /*ICONS*/null, NOTICE = /*NOTICE*/null;
// What points along the line turns in right-to-left text.
const MIRROR = ['ph-arrow-bend-up-left'];
const off = [];
const wall = row('icons', { counterAxisAlignItems: 'MIN' }); host.appendChild(wall);
wall.layoutWrap = 'WRAP'; wall.primaryAxisSizingMode = 'FIXED'; wall.resize(1200, 100); wall.counterAxisSizingMode = 'AUTO'; wall.itemSpacing = wall.counterAxisSpacing = 24;
for (const [name, x, y, d] of ICONS) {
  const cell = col('cell', { counterAxisAlignItems: 'CENTER', itemSpacing: 12 }); wall.appendChild(cell); width(cell, 150); cell.counterAxisSizingMode = 'FIXED';
  const c = figma.createComponent(); cell.appendChild(c); c.name = name; c.resize(256, 256); fill(c, []); c.clipsContent = false;
  const v = figma.createVector(); v.name = 'ph'; v.vectorPaths = [{ windingRule: 'NONE', data: d }]; c.appendChild(v); v.x = x; v.y = y;
  v.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }; fill(v, []); stroke(v, [paint('text')]); v.strokeCap = 'ROUND'; v.strokeJoin = 'ROUND'; v.strokeAlign = 'CENTER';
  if (Math.abs(v.x - x) > 0.5 || Math.abs(v.y - y) > 0.5) off.push(`${name} at ${v.x}, ${v.y}, not ${x}, ${y}`);
  bind(c, 'width', 'size/size-icon-lg'); bind(c, 'height', 'size/size-icon-lg'); bind(v, 'strokeWeight', 'derived/icon-line-lg');
  c.description = `Phosphor ${name.slice(3)}, regular. <svg class="icon cc-phosphor${MIRROR.includes(name) ? ' cc-mirror' : ''}" aria-hidden="true"><use href="#${name}"/></svg>.${MIRROR.includes(name) ? ' .cc-mirror turns it in right-to-left text.' : ''} Its size is one of the icon sizes and its line that size's (derived/icon-line…), the two set together; its ink is a role on its stroke. Phosphor is MIT: the notice is beside these.`;
  IC[name] = c; made.push(name);
  cell.appendChild(await words(name, { style: 'xs', ink: 'text-secondary', name: 'caption' }));
}
const sizes = row('sizes', { itemSpacing: 48, counterAxisAlignItems: 'CENTER' }); host.appendChild(sizes);
for (const size of ['size-icon-sm', 'size-icon', 'size-icon-md', 'size-icon-lg']) { const r = row('size', { itemSpacing: 12 }); sizes.appendChild(r); r.appendChild(glyph('text', 'ph-house', size)); r.appendChild(await words(size, { style: 'xs', ink: 'text-secondary', name: 'caption' })); }
const inks = row('inks', { itemSpacing: 48, counterAxisAlignItems: 'CENTER' }); host.appendChild(inks);
for (const role of ['text', 'text-secondary', 'text-tertiary', 'accent', 'ok', 'warn', 'alert', 'stage-3-ink']) { const r = row('ink', { itemSpacing: 12 }); inks.appendChild(r); r.appendChild(glyph(role, 'ph-house', 'size-icon-lg')); r.appendChild(await words(role, { style: 'xs', ink: 'text-secondary', name: 'caption' })); }
const n = await words(NOTICE, { style: 'xs', ink: 'text-secondary', name: 'Phosphor, MIT License' }); host.appendChild(n); n.resize(720, n.height); n.textAutoResize = 'HEIGHT';
await host.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 0.05 } });
return Object.assign({ icons: made.length, off }, section('Icons'));
