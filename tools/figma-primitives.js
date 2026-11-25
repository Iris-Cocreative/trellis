/* Trellis · figma-primitives · the first part of the components script
   Run as `node tools/figma-components.js --plugin primitives`, which puts the
   kit (tools/figma-kit.js) before it. Every primitive as a component set named
   by its class chain, in the section Components, which it removes and builds
   again; Thread, Templates and Screens are removed too, since they are made of
   these: run the other parts after it. */

// ---- Start clean ------------------------------------------------------------
clear(SECTIONS);

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
  c.appendChild(await words('Button', { fs: SIZES[p.size][1], ink, family: 'type/font-button', weight: 'type/fw-button' }));
  return c;
}, { text: ['label', 'Button'], caption: 'button · kind × size × state',
  description: 'Trellis .button. <button class="button cc-primary cc-sm">Save</button>. Height, padding and corner follow the product (--density-control-h, --shape-control). Its family and weight follow the product (--font-button, --fw-button); its case and spacing (--button-case, --button-tracking) are for the code alone. Hover is 6% of its ink over its fill, press 12%; disabled is :disabled or aria-disabled. .cc-block fills its row: set an instance\'s width to Fill. On touch the hit area is 44pt whatever it draws.' });

await set('button icon-button', { kind: Object.keys(KINDS), size: Object.keys(SIZES) }, async (p) => {
  const c = component(), ink = buttonFace(c, Object.assign({ state: 'rest' }, p));
  c.paddingLeft = c.paddingRight = 0; c.primaryAxisSizingMode = 'FIXED'; bind(c, 'width', SIZES[p.size][0]);
  c.appendChild(glyph(ink));
  return c;
}, { caption: 'button icon-button · kind × size', description: 'Trellis .button.icon-button: a button made square. <button class="button icon-button cc-ghost cc-sm" aria-label="Add">. An icon button alone draws nothing: it is always a button.' });

// ---- tag --------------------------------------------------------------------
const TAG_KINDS = { default: 'kind-topic', 'cc-person': 'kind-person', 'cc-group': 'kind-group', 'cc-event': 'kind-event', 'cc-course': 'kind-course', 'cc-ok': 'ok', 'cc-warn': 'warn', 'cc-alert': 'alert', ...Object.fromEntries(STAGES.map((n) => ['cc-stage-' + n, 'stage-' + n])) };
const TAG_SIZES = { default: ['knob/tag-default-h', 'knob/tag-default-fs', 'derived/tag-pad', 'space/sp-h'], 'cc-sm': ['size/size-control-xs', 'knob/tag-fs-sm', 'derived/tag-pad-sm', 'space/sp-q'], 'cc-lg': ['size/size-control-md', 'knob/tag-fs-lg', 'derived/tag-pad-lg', 'space/sp-h'] };
await set('tag', { kind: Object.keys(TAG_KINDS), emphasis: ['default', 'cc-outline', 'cc-solid'], size: Object.keys(TAG_SIZES) }, async (p) => {
  const c = component(), hue = TAG_KINDS[p.kind], [h, fs, pad, gap] = TAG_SIZES[p.size], solid = p.emphasis === 'cc-solid';
  fixedHeight(c, h); padX(c, pad); corners(c, 'knob/tag-radius'); bind(c, 'itemSpacing', gap);
  fill(c, solid ? [paint(hue)] : p.emphasis === 'cc-outline' ? [] : [paint(hue, 0.14)]);
  edge(c, hue, solid ? 1 : 0.42);
  const d = figma.createEllipse(); d.name = 'tag-dot'; c.appendChild(d); bind(d, 'width', 'space/sp-h'); bind(d, 'height', 'space/sp-h'); fill(d, [paint(solid ? 'on-' + hue : hue)]);
  c.appendChild(await words('Tag', { fs, ink: solid ? 'on-' + hue : 'text' }));
  const x = glyph(solid ? 'on-' + hue : 'text', 'M 4 4 L 14 14 M 14 4 L 4 14'); x.name = 'tag-remove'; c.appendChild(x); x.opacity = 0.7; x.children[0].strokeWeight = 0.9; bind(x, 'width', 'size/size-icon-sm'); bind(x, 'height', 'size/size-icon-sm');
  return c;
}, { text: ['label', 'Tag'], parts: [['tag-dot', false], ['tag-remove', false]], caption: 'tag · kind × emphasis × size', width: 1600,
  description: 'Trellis .tag, the archetype: a height, a corner, padding equal to the corner, an edge and a tint mixed from one kind color. <span class="tag cc-person cc-solid">. .cc-stage-1 to 7 take a step of a process (D107). A link that is the current one, a.tag[aria-current="page"], draws solid (D101). A product sets its corner, height and size (--tag-r-fixed, --tag-r-ratio, --tag-default-h); its case and tracking (--tag-case, Quarry\'s uppercase) are the code\'s alone. What isn\'t here yet takes --tag-edge-style: dashed: dash an instance\'s stroke (4, 2). Properties show .tag-dot (the kind\'s color before the words) and .tag-remove (a button at the end: the code pulls its box into the tag\'s padding, the file draws the mark alone).' });

// ---- avatar -----------------------------------------------------------------
const AV = { 'cc-xs': [1, 'space/sp-1'], default: [2, 'space/sp-2'], 'cc-md': [3, 'space/sp-3'], 'cc-lg': [4, 'space/sp-4'], 'cc-xl': [6, 'space/sp-6'], 'cc-xxl': [8, 'space/sp-8'], 'cc-hero': [12, 'space/sp-12'] };
const GROUP_R = { 0.25: 'radius/r-q', 0.5: 'radius/r-h', 1: 'radius/r-1', 1.5: 'radius/r-1h', 2: 'radius/r-2' };
const avatarSet = await set('avatar', { kind: ['default', 'cc-group', 'cc-space'], ring: ['default', 'cc-plain'], size: Object.keys(AV) }, async (p) => {
  const c = component(), [n, size] = AV[p.size], hue = { default: 'kind-person', 'cc-group': 'kind-group', 'cc-space': 'accent' }[p.kind], big = n >= 4;
  c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'FIXED'; c.primaryAxisAlignItems = 'CENTER';
  c.clipsContent = true;   // the photo is the box; and Figma draws a shadow's spread (the ring) only on a frame that clips
  bind(c, 'width', size); bind(c, 'height', size);
  if (p.kind !== 'default') { if (GROUP_R[n / 4]) corners(c, GROUP_R[n / 4]); else c.cornerRadius = n * 3; } else corners(c, 'radius/r-round');
  fill(c, [paint('bg-raised'), paint(hue, 0.26)]);
  const gap = big ? 3 : 1, ring = big ? 3 : 2;
  const shadow = (spread, role) => figma.variables.setBoundVariableForEffect({ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 1 }, offset: { x: 0, y: 0 }, radius: 0, spread, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false }, 'color', need('color/' + role));
  if (p.ring === 'default') c.effects = [shadow(gap + ring, hue), shadow(gap, 'bg-raised')];
  if (n >= 2) c.appendChild(await words('AB', { size: Math.round(n * 12 * 0.38), ink: 'text' }));
  return c;
}, { caption: 'avatar · kind × size', description: 'Trellis .avatar: the photo is the box, on whole cells. Shape is kind: a circle is a person, a rounded square (corner a quarter of its size) a group, and in the accent a space: a project with people of its own (.cc-space). .cc-plain draws no gap and no ring. Its gap and ring are spread shadows; in the file they are numbers at the wide screen.' });

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
// A dot's fill, and its ring's line: a quiet ring and a stage's take an ink, since a line is thinner than a fill (D103, D107).
const DOT = { default: ['alert', 'alert'], 'cc-ok': ['ok', 'ok'], 'cc-warn': ['warn', 'warn'], 'cc-quiet': ['text-faint', 'text-tertiary'], 'cc-accent': ['accent', 'accent'],
  ...Object.fromEntries(STAGES.map((n) => ['cc-stage-' + n, ['stage-' + n, `stage-${n}-ink`]])) };
const dotSet = await set('dot', { kind: Object.keys(DOT), fill: ['default', 'cc-ring'] }, async (p) => {
  const c = component(); c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'FIXED';
  bind(c, 'width', 'space/sp-h'); bind(c, 'height', 'space/sp-h'); corners(c, 'radius/r-round');
  if (p.fill === 'cc-ring') {
    fill(c, []); stroke(c, [paint(DOT[p.kind][1])]); c.strokeAlign = 'INSIDE';
    for (const s of ['Top', 'Bottom', 'Left', 'Right']) bind(c, `stroke${s}Weight`, 'derived/dot-ring');
  } else fill(c, [paint(DOT[p.kind][0])]);
  return c;
}, { caption: 'dot · kind × fill', width: 900, description: 'Trellis .dot: the smallest mark of a state. One that carries meaning alone takes role="img" and a label. .cc-ring is the dot not yet filled: a line a quarter of the dot, one to two lines (--dot-ring), clear inside (--dot-fill); on a rail set --dot-fill: var(--surface). .cc-stage-1 to 7 fill with a stage and ring with its ink.' });

// ---- switch -----------------------------------------------------------------
// mid: aria-checked="mixed", the thumb half way on the off fill (D109).
const track = (on, off, mid) => {
  const t = row('track', { primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'FIXED' });
  bind(t, 'width', 'space/sp-3'); bind(t, 'height', 'space/sp-1h'); corners(t, 'radius/r-round'); padX(t, 'space/sp-q');
  t.primaryAxisAlignItems = mid ? 'CENTER' : on ? 'MAX' : 'MIN';
  fill(t, off ? [paint('text', 0.1)] : on ? [paint('accent')] : [paint('text', 0.32)]);
  const k = figma.createEllipse(); k.name = 'thumb'; t.appendChild(k);
  bind(k, 'width', 'space/sp-1'); bind(k, 'height', 'space/sp-1');
  fill(k, [off ? paint('bg-sunken') : on ? paint('accent-ink') : { type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]);
  return t;
};
await set('switch', { checked: ['false', 'true', 'mixed'], state: ['rest', 'disabled'] }, async (p) => {
  const c = component(); bind(c, 'minHeight', 'size/size-control-sm'); bind(c, 'itemSpacing', 'space/sp-h');
  c.appendChild(track(p.checked === 'true', p.state === 'disabled', p.checked === 'mixed'));
  c.appendChild(await words('Switch', { fs: 'type/control/fs-control', ink: p.state === 'disabled' ? 'text-faint' : 'text' }));
  return c;
}, { text: ['label', 'Switch'], caption: 'switch · checked × state', width: 900, description: 'Trellis .switch, the choice archetype\'s third box (D109): on or off, now. <button class="switch" role="switch" aria-checked="true">Label</button>, or label.switch > input[role=switch].u-sr-only + .switch-label. The track 3 × 1½ cells, the thumb a cell. aria-checked="mixed" holds the thumb half way on the off fill, for a setting over a selection that differs; a role=switch is read as off then, so its label says so.' });

// ---- choice: checkbox and radio (D109) ----------------------------------------
const CHOICE = { 'cc-sm': ['space/sp-1', 'type/control/fs-control-sm', 'size/size-control-sm'], default: ['space/sp-1h', 'type/control/fs-control', 'size/size-control-sm'], 'cc-lg': ['space/sp-2', 'type/control/fs-control-lg', 'size/size-control-lg'] };
// A mark in the box, scaled with it: the check (the code's clip path, in 18ths), a bar, a dot a third of the radio.
const CHECK = 'M 5.1 8.4 L 3.6 10.6 L 9 14.4 L 14.4 5.3 L 12.2 3.6 L 8.2 10.3 Z';
await set('choice', { kind: ['checkbox', 'radio'], checked: ['false', 'true', 'mixed'], state: ['rest', 'invalid', 'disabled'], size: Object.keys(CHOICE) }, async (p) => {
  const c = component(), [box, fs, h] = CHOICE[p.size], on = p.checked !== 'false', off = p.state === 'disabled';
  bind(c, 'minHeight', h); bind(c, 'itemSpacing', 'space/sp-h');
  const b = figma.createFrame(); b.name = 'input'; b.resize(18, 18); b.clipsContent = false; c.appendChild(b);
  corners(b, p.kind === 'radio' ? 'radius/r-round' : 'radius/r-q');
  fill(b, off ? [paint(on ? 'text' : 'bg-sunken', on ? 0.2 : 1)] : on ? [paint('accent')] : []);
  if (!(off && on)) edge(b, off ? 'text' : p.state === 'invalid' ? 'alert' : on ? 'accent' : 'text-tertiary', off ? 0.2 : 1);
  if (on) {
    const ink = off ? 'bg' : 'accent-ink';
    const m = p.kind === 'radio' ? figma.createEllipse() : p.checked === 'mixed' ? figma.createRectangle() : figma.createVector();
    m.name = 'mark'; b.appendChild(m);
    if (m.type === 'VECTOR') { m.vectorPaths = [{ windingRule: 'NONZERO', data: CHECK }]; m.resize(10.8, 10.8); m.x = m.y = 3.6; }
    else if (m.type === 'ELLIPSE') { m.resize(6, 6); m.x = m.y = 6; } else { m.resize(9, 2); m.x = 4.5; m.y = 8; }
    fill(m, [paint(ink)]); stroke(m, []);
    m.constraints = m.type === 'RECTANGLE' ? { horizontal: 'SCALE', vertical: 'CENTER' } : { horizontal: 'SCALE', vertical: 'SCALE' };
  }
  bind(b, 'width', box); bind(b, 'height', box);   // after the mark, drawn on an 18 box, so it scales with the box
  c.appendChild(await words('Choice', { fs, ink: off ? 'text-faint' : 'text', name: 'choice-label' }));
  return c;
}, { skip: (p) => p.kind === 'radio' && p.checked === 'mixed', text: ['choice-label', 'Choice'], caption: 'choice · kind × checked × state × size', width: 1600,
  description: 'Trellis .choice (D109): label.choice > input[type=checkbox|radio] + .choice-label. The row two cells (.cc-lg three), the box on half cells a half cell before its words: a cell and a half (.cc-sm one, .cc-lg two), a quarter-cell corner, a radio the same circle. Checked fills with --choice-on and marks in --choice-ink; mixed is the checkbox\'s indeterminate property, set from script, drawn as a bar; invalid (aria-invalid, :user-invalid) takes the alert edge; disabled quiets the box and the words. Hover and press are the shared state layer on the box. On touch the row\'s hit area is at least 44pt. With no words, label.choice > input[aria-label].' });

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
const inputSet = await set('input', { element: ['input', 'select', 'textarea'], state: ['rest', 'invalid', 'disabled', 'read-only'], size: Object.keys(IN_SIZES) }, async (p) => {
  const c = component(), [h, fs, pad] = IN_SIZES[p.size], quiet = p.state === 'disabled' || p.state === 'read-only', area = p.element === 'textarea';
  c.primaryAxisSizingMode = 'FIXED'; c.resize(240, 36); padX(c, pad); corners(c, 'knob/shape-input');
  if (area) { c.counterAxisSizingMode = 'AUTO'; c.counterAxisAlignItems = 'MIN'; padY(c, 'space/sp-h'); bind(c, 'minHeight', 'size/textarea-h'); } else fixedHeight(c, h);
  fill(c, [paint(quiet ? 'bg-sunken' : 'bg-raised')]);
  edge(c, p.state === 'invalid' ? 'alert' : p.state === 'disabled' ? 'border-subtle' : 'border');
  const t = await words('Placeholder', { fs, weight: 'type/fw-body', ink: p.state === 'disabled' ? 'text-tertiary' : 'text-tertiary', name: 'value' });
  // A textarea's lines are two cells, its words on each line's middle.
  if (area) { const l = row('line'); c.appendChild(l); bind(l, 'minHeight', 'space/sp-2'); l.layoutGrow = 1; l.appendChild(t); } else c.appendChild(t);
  t.layoutGrow = 1; t.textAutoResize = 'HEIGHT';
  if (p.element === 'select') { const v = figma.createVector(); v.name = 'chevron'; v.vectorPaths = [{ windingRule: 'NONZERO', data: 'M 0 0 L 10 0 L 5 5 Z' }]; stroke(v, []); fill(v, [paint(p.state === 'disabled' ? 'text-tertiary' : 'text')]); c.appendChild(v); bind(c, 'itemSpacing', 'space/sp-1'); bind(c, 'paddingRight', 'space/sp-1'); }
  return c;
}, { skip: (p) => p.element === 'select' && p.state === 'read-only', text: ['value', 'Placeholder'], caption: 'input · element × state × size', description: 'Trellis .input: one box for input, select and textarea, at the product\'s control height (--density-control-h, --shape-input). A select draws a chevron a cell from its end; a textarea is three lines of two cells (--input-rows) and grows with its text. invalid is aria-invalid="true". On touch the code makes it 44pt and 16px type, or iOS zooms.' });

await set('field', { state: ['rest', 'invalid'] }, async (p) => {
  const c = component('VERTICAL'); c.counterAxisAlignItems = 'MIN'; bind(c, 'itemSpacing', 'space/sp-1');
  const lab = await words('Label', { style: 'label', ink: 'text-secondary', name: 'label' }); c.appendChild(lab);
  const box = variant(inputSet, { element: 'input', state: p.state === 'invalid' ? 'invalid' : 'rest', size: 'default' }).createInstance(); c.appendChild(box);
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
  const c = component(); c.primaryAxisSizingMode = 'FIXED'; width(c, 192);
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
  const hd = row('options-card-heading'); c.appendChild(hd); hd.layoutSizingHorizontal = 'FILL'; padX(hd, 'space/sp-h'); bind(hd, 'paddingTop', 'space/sp-h'); bind(hd, 'paddingBottom', 'space/sp-1');
  // Its capitals a cell under the card's edge (the card's padding, a half, a quarter) and a cell over the first item.
  const hi = row('inset'); hd.appendChild(hi); bind(hi, 'paddingTop', 'space/sp-q'); hi.appendChild(await words('Guides', { style: 'label', ink: 'text-tertiary' }));
  for (const [label, state] of [['Rename', 'rest'], ['Duplicate', 'hover'], ['Sort by name', 'selected'], [null], ['Archive', 'disabled']]) {
    if (!label) { const r = row('options-card-rule', { primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'FIXED' }); c.appendChild(r); r.layoutSizingHorizontal = 'FILL'; bind(r, 'height', 'space/sp-h'); const l = figma.createRectangle(); l.name = 'line'; r.appendChild(l); l.layoutGrow = 1; bind(l, 'height', 'space/line'); fill(l, [paint('border-subtle')]); continue; }
    const i = variant(itemSet, { kind: 'default', state }).createInstance(); c.appendChild(i); i.layoutSizingHorizontal = 'FILL';
    i.setProperties({ [Object.keys(i.componentProperties).find((k) => k.startsWith('label'))]: label });
  }
  c.description = 'Trellis .float.options-card: 16 cells wide, items 2½ cells (--density-option-h), padding --density-options-pad, corner --shape-float, item corners concentric; .options-card-heading names a group, .options-card-rule parts two. Opened as a popover by its anchor; drawn here where it would open.';
  const tip = component(); tip.name = 'tooltip'; padX(tip, 'space/sp-h'); padY(tip, 'space/sp-q'); corners(tip, 'radius/r-q'); fill(tip, [paint('text')]); lift(tip);
  const tt = await words('A tooltip', { fs: 'type/control/fs-control-sm', weight: 'type/fw-body', ink: 'bg', name: 'label' }); tip.appendChild(tt);
  tip.description = 'Trellis .float.tooltip: the page\'s ink as its ground, the page as its ink.';
  const block = col('floats block', { itemSpacing: 12 }); host.appendChild(block);
  block.appendChild(await words('options-card · tooltip', { style: 'label', ink: 'text-tertiary', name: 'caption' }));
  const r = row('floats row', { itemSpacing: 48, counterAxisAlignItems: 'MIN' }); block.appendChild(r);
  r.appendChild(c); r.appendChild(tip); made.push('options-card', 'tooltip');
}

// ---- list-item, composer (D99, D104) -------------------------------------------
const listSet = await set('list-item', { mark: ['none', 'dot', 'face'], unread: ['false', 'true'], state: ['rest', 'selected'] }, async (p) => {
  const c = component(); c.counterAxisAlignItems = 'MIN'; c.primaryAxisSizingMode = 'FIXED'; width(c, 320);
  padY(c, 'space/sp-1'); padX(c, 'space/sp-1'); bind(c, 'itemSpacing', 'space/sp-1');
  const on = p.state === 'selected', bold = p.unread === 'true';
  fill(c, on ? [paint('text', share.selected)] : []);
  if (on) { stroke(c, [paint('accent')]); c.strokeAlign = 'INSIDE'; c.strokeTopWeight = c.strokeRightWeight = c.strokeBottomWeight = 0; c.strokeLeftWeight = 2; }
  const body = col('list-body'); c.appendChild(body); body.layoutGrow = 1; bind(body, 'itemSpacing', 'space/sp-1');
  const first = row('first line'); body.appendChild(first); bind(first, 'itemSpacing', 'space/sp-1');
  if (p.mark !== 'none') {
    const m = row('list-mark', { primaryAxisSizingMode: 'FIXED' }); bind(m, 'width', 'space/sp-1'); first.appendChild(m);
    m.appendChild((p.mark === 'dot' ? variant(dotSet, { kind: 'cc-stage-4', fill: 'default' }) : variant(avatarSet, { kind: 'default', ring: 'cc-plain', size: 'cc-xs' })).createInstance());
  }
  first.appendChild(await words('A row\'s title', { fs: 'type/body/size', weight: bold ? 'type/fw-strong' : 'type/fw-body', ink: 'text', name: 'title' }));
  const sub = await words('What it says, on the line under it', { style: 'sm', ink: bold ? 'text' : 'text-secondary', name: 'sub' });
  if (p.mark === 'none') body.appendChild(sub); else { const w = row('inset'); bind(w, 'paddingLeft', 'space/sp-2'); body.appendChild(w); w.appendChild(sub); }
  const end = row('list-end'); c.appendChild(end); bind(end, 'itemSpacing', 'space/sp-h');
  end.appendChild(await words('2m', { style: 'xs', ink: 'text-tertiary', name: 'time' }));
  if (bold) end.appendChild(variant(dotSet, { kind: 'cc-accent', fill: 'default' }).createInstance());
  return c;
}, { text: ['title', 'A row\'s title'], caption: 'list-item · mark × unread × state', width: 1100,
  description: 'Trellis .list > .list-item: a leading .list-mark, .list-body (.list-title, .list-sub), .list-end. A mark sits on the first line\'s capitals (D104), here by centering it on a one-line title: wrap the title and the code keeps it on the first line, the file does not. .cc-unread weighs the title, inks the line under it and shows a .dot.cc-accent. Selected is aria-current on the row. The list draws a hairline between rows that stops at the text\'s edges; a row here has none.' });

await set('composer', { state: ['empty', 'ready'] }, async (p) => {
  const c = component(), ready = p.state === 'ready'; c.counterAxisAlignItems = 'MAX'; c.primaryAxisSizingMode = 'FIXED'; width(c, 360);
  padX(c, 'space/sp-q'); padY(c, 'space/sp-q'); bind(c, 'itemSpacing', 'space/sp-q'); corners(c, 'knob/shape-input');
  fill(c, [paint('bg-raised')]); edge(c, 'border');
  const btn = (ink, bg, d) => {
    const b = row('button icon-button', { primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'FIXED', primaryAxisAlignItems: 'CENTER' });
    bind(b, 'width', 'size/size-control-md'); bind(b, 'height', 'size/size-control-md'); corners(b, 'derived/composer-btn-r'); fill(b, bg ? [paint(bg)] : []);
    b.appendChild(glyph(ink, d)); return b;
  };
  c.appendChild(btn('text-secondary', null));
  const box = row('composer-input'); c.appendChild(box); box.layoutGrow = 1; padX(box, 'space/sp-q'); fixedHeight(box, 'size/size-control-md');
  const t = await words(ready ? 'See you at ten' : 'Write a message', { fs: 'type/control/fs-control-lg', weight: 'type/fw-body', ink: ready ? 'text' : 'text-tertiary', name: 'value' });
  box.appendChild(t); t.layoutGrow = 1;
  c.appendChild(btn(ready ? 'accent-ink' : 'text-tertiary', ready ? 'accent' : 'bg-hover', 'M 9 15 L 9 3 M 4 8 L 9 3 L 14 8'));
  return c;
}, { caption: 'composer · state', width: 900, description: 'Trellis .composer: one box, .composer-input (a textarea that grows a line at a time to --composer-max) between icon buttons, .composer-send last, which wakes with text. Three cells for one line. It takes the focus ring. In a .field its hint starts at the text.' });

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
const dialog = async (m) => {
  m.counterAxisAlignItems = 'MIN'; fill(m, [paint('bg-raised')]); edge(m, 'border'); lift(m);
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
  return body;
};
{
  const m = component('VERTICAL'); m.name = 'modal'; m.resize(420, 200); m.primaryAxisSizingMode = 'AUTO'; m.counterAxisSizingMode = 'FIXED'; corners(m, 'knob/shape-card');
  await dialog(m);
  m.description = 'Trellis .modal on the native <dialog>: .modal > .modal-inner > .modal-header / -body / -footer, padding two cells (--modal-pad), corner --shape-card. On a screen under 48rem a centered modal is a bottom tray (.cc-tray.cc-bottom).';
  const block = col('modal block', { itemSpacing: 12 }); host.appendChild(block);
  block.appendChild(await words('modal', { style: 'label', ink: 'text-tertiary', name: 'caption' }));
  block.appendChild(m); made.push('modal');
}
// A tray: flush to a side of the screen, the corners away from it round.
await set('modal cc-tray', { side: ['cc-left', 'cc-right', 'cc-bottom'] }, async (p) => {
  const m = component('VERTICAL'), up = p.side === 'cc-bottom';
  if (up) {
    m.resize(393, 200); m.primaryAxisSizingMode = 'AUTO'; m.counterAxisSizingMode = 'FIXED';
    const g = row('modal-grabber', { primaryAxisAlignItems: 'CENTER', counterAxisSizingMode: 'FIXED' }); m.appendChild(g); g.layoutSizingHorizontal = 'FILL'; bind(g, 'height', 'space/sp-1');
    const pill = figma.createRectangle(); pill.name = 'pill'; g.appendChild(pill); bind(pill, 'width', 'space/sp-3'); bind(pill, 'height', 'space/sp-q'); corners(pill, 'radius/r-round'); fill(pill, [paint('text', 0.24)]);
  } else { m.resize(384, 480); m.primaryAxisSizingMode = 'FIXED'; m.counterAxisSizingMode = 'FIXED'; bind(m, 'width', 'size/tray-w'); }
  for (const f of { 'cc-left': ['topRightRadius', 'bottomRightRadius'], 'cc-right': ['topLeftRadius', 'bottomLeftRadius'], 'cc-bottom': ['topLeftRadius', 'topRightRadius'] }[p.side]) bind(m, f, 'knob/shape-card');
  const body = await dialog(m); if (!up) body.layoutGrow = 1;
  return m;
}, { caption: 'modal cc-tray · side', width: 1300, description: 'Trellis .modal.cc-tray with .cc-left (the default), .cc-right or .cc-bottom: flush to its side of the screen, the corners away from it round; a side tray is 32 cells wide (--tray-w), two cells clear at each end (--tray-margin), its body scrolling and its footer at the end. A bottom tray draws the .modal-grabber, a cell tall. .cc-top is a bottom tray turned over, without the grabber.' });

return Object.assign({ components: made }, section('Components'));
