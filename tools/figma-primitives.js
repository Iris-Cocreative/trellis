/* Trellis · figma-primitives · the first controls
   Run as `node tools/figma-components.js --plugin primitives`, after the
   icons: buttons, tags, avatars, badges, dots, switches, choices and the range,
   each a component set named by its class chain, in the section Components,
   which it removes and builds again; Surfaces, Thread, Templates and Screens
   are removed too, since they are made of these: run the other parts after it. */

// ---- Start clean ------------------------------------------------------------
clear(from('Components'));

// ---- badge ------------------------------------------------------------------
const BADGE = { default: ['alert', 1, 'on-alert'], 'cc-quiet': ['text', 0.1, 'text-secondary'], 'cc-accent': ['accent', 1, 'accent-ink'] };
const badgeSet = await set('badge', { kind: Object.keys(BADGE) }, async (p) => {
  const c = component(), [ground, o, ink] = BADGE[p.kind];
  fixedHeight(c, 'size/size-control-xs'); bind(c, 'minWidth', 'size/size-control-xs'); padX(c, 'space/sp-q'); corners(c, 'radius/r-round');
  c.primaryAxisAlignItems = 'CENTER';
  fill(c, o < 1 ? [paint('bg-raised'), paint(ground, o)] : [paint(ground)]);
  c.appendChild(await words('3', { fs: 'type/control/fs-control-xs', weight: 'type/fw-strong', ink }));
  return c;
}, { text: ['count', '3'], caption: 'badge · kind', width: 400, description: 'Trellis .badge: a count. <span class="badge cc-accent">3</span>. .cc-corner stands it on an icon button\'s corner: that button\'s own property.' });

// ---- button -----------------------------------------------------------------
const SIZES = { default: ['knob/density-control-h', 'knob/density-control-fs', 'derived/control-pad'], 'cc-sm': ['size/size-control-sm', 'type/control/fs-control-sm', 'space/sp-1'],
  'cc-md': ['size/size-control-md', 'type/control/fs-control-md', 'space/sp-1'], 'cc-lg': ['size/size-control-xl', 'type/control/fs-control-lg', 'space/sp-2'] };
const KINDS = { default: { bg: null, edge: 'border-strong', ink: 'text' }, 'cc-primary': { bg: 'accent', edge: 'accent', ink: 'accent-ink' }, 'cc-ghost': { bg: null, edge: null, ink: 'text' },
  'cc-alert': { bg: 'alert', edge: 'alert', ink: 'on-alert' }, 'cc-ok': { bg: 'ok', edge: 'ok', ink: 'on-ok' } };
// Outline (D115): the fill taken away, its edge and label one ink, the kind's color where it reads; with no kind, the text's.
const LINES = { default: 'text', 'cc-primary': 'btn-outline-accent', 'cc-alert': 'btn-outline-alert', 'cc-ok': 'btn-outline-ok' };
const faceOf = (p) => (p.emphasis === 'cc-outline' ? { bg: null, edge: LINES[p.kind], ink: LINES[p.kind] } : KINDS[p.kind]);
const EMPHASES = ['default', 'cc-outline'], noGhost = (p) => p.kind === 'cc-ghost' && p.emphasis === 'cc-outline';
const buttonFace = (c, p) => {
  const k = faceOf(p), off = p.state === 'disabled';
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
await set('button', { kind: Object.keys(KINDS), emphasis: EMPHASES, size: Object.keys(SIZES), state: ['rest', 'hover', 'press', 'disabled'] }, async (p) => {
  const c = component(), ink = buttonFace(c, p);
  c.appendChild(glyph(ink));
  c.appendChild(await words('Button', { fs: SIZES[p.size][1], ink, family: 'type/font-button', weight: 'type/fw-button' }));
  return c;
}, { skip: noGhost, text: ['label', 'Button'], parts: [['icon', false]], swap: [['drawing', 'icon', 'ph-plus']], caption: 'button · kind × emphasis × size × state', width: 1600,
  description: 'Trellis .button. <button class="button cc-primary cc-sm">Save</button>. Height, padding and corner follow the product (--density-control-h, --shape-control). Its family and weight follow the product (--font-button, --fw-button); its case and spacing (--button-case, --button-tracking) are for the code alone. Hover is 6% of its ink over its fill, press 12%; disabled is :disabled or aria-disabled. .cc-block fills its row: set an instance\'s width to Fill. .cc-alert is destructive and .cc-ok confirms (D115), filled with the status. .cc-outline takes a kind\'s fill away: its edge and label are the kind\'s color moved to where it reads as text; --btn-tint, a share of it in the ground, is the code\'s. Properties show an icon before the label and swap its drawing. On touch the hit area is 44pt whatever it draws.' });

// A count on its corner (D115): how far past the corner it stands, at each size, at the wide screen.
const PAST = { default: 3, 'cc-sm': 9, 'cc-md': 6, 'cc-lg': 3 };
await set('button icon-button', { kind: Object.keys(KINDS), emphasis: EMPHASES, size: Object.keys(SIZES) }, async (p) => {
  const c = component(); host.appendChild(c); c.clipsContent = false;   // in the wide host, where its badge is placed
  const ink = buttonFace(c, Object.assign({ state: 'rest' }, p));
  c.paddingLeft = c.paddingRight = 0; c.primaryAxisSizingMode = 'FIXED'; bind(c, 'width', SIZES[p.size][0]);
  c.appendChild(glyph(ink));
  const b = variant(badgeSet, { kind: 'default' }).createInstance(); c.appendChild(b); b.name = 'badge cc-corner'; b.layoutPositioning = 'ABSOLUTE';
  b.x = c.width + PAST[p.size] - b.width; b.y = -PAST[p.size]; b.constraints = { horizontal: 'MAX', vertical: 'MIN' };
  return c;
}, { skip: noGhost, parts: [['badge cc-corner', false]], swap: [['drawing', 'icon', 'ph-plus']], caption: 'button icon-button · kind × emphasis × size', width: 1600, description: 'Trellis .button.icon-button: a button made square. Its property drawing swaps the icon, svg.icon.cc-phosphor (D118). The property badge cc-corner shows a count on its corner (D115): span.badge.cc-corner in the button, aria-hidden, the button\'s own label naming the count; it grows outward with the reader\'s text, here it stands where one figure does at the wide screen. <button class="button icon-button cc-ghost cc-sm" aria-label="Add">. An icon button alone draws nothing: it is always a button.' });

// ---- tag --------------------------------------------------------------------
const TAG_KINDS = { default: 'kind-topic', 'cc-person': 'kind-person', 'cc-group': 'kind-group', 'cc-event': 'kind-event', 'cc-course': 'kind-course', 'cc-ok': 'ok', 'cc-warn': 'warn', 'cc-alert': 'alert', 'cc-quiet': 'text-tertiary', ...Object.fromEntries(STAGES.map((n) => ['cc-stage-' + n, 'stage-' + n])) };
const TAG_SIZES = { default: ['knob/tag-default-h', 'knob/tag-default-fs', 'derived/tag-pad', 'space/sp-h'], 'cc-sm': ['size/size-control-xs', 'knob/tag-fs-sm', 'derived/tag-pad-sm', 'space/sp-q'], 'cc-lg': ['size/size-control-md', 'knob/tag-fs-lg', 'derived/tag-pad-lg', 'space/sp-h'] };
await set('tag', { kind: Object.keys(TAG_KINDS), emphasis: ['default', 'cc-outline', 'cc-solid'], size: Object.keys(TAG_SIZES) }, async (p) => {
  const c = component(), hue = TAG_KINDS[p.kind], [h, fs, pad, gap] = TAG_SIZES[p.size], solid = p.emphasis === 'cc-solid', ink = solid ? 'on-' + hue : p.kind === 'cc-quiet' ? 'text-secondary' : 'text';
  fixedHeight(c, h); padX(c, pad); corners(c, 'knob/tag-radius'); bind(c, 'itemSpacing', gap);
  fill(c, solid ? [paint(hue)] : p.emphasis === 'cc-outline' ? [] : [paint(hue, 0.14)]);
  edge(c, hue, solid ? 1 : 0.42);
  const d = figma.createEllipse(); d.name = 'tag-dot'; c.appendChild(d); bind(d, 'width', 'space/sp-h'); bind(d, 'height', 'space/sp-h'); fill(d, [paint(solid ? 'on-' + hue : hue)]);
  c.appendChild(await words('Tag', { fs, ink }));
  const x = glyph(ink, 'ph-x', 'size-icon-sm'); x.name = 'tag-remove'; c.appendChild(x); x.opacity = 0.7;
  return c;
}, { text: ['label', 'Tag'], parts: [['tag-dot', false], ['tag-remove', false]], caption: 'tag · kind × emphasis × size', width: 1600,
  description: 'Trellis .tag, the archetype: a height, a corner, padding equal to the corner, an edge and a tint mixed from one kind color. <span class="tag cc-person cc-solid">. .cc-stage-1 to 7 take a step of a process (D107). .cc-quiet is the neutral, for a label with no kind (D115). .cc-seed, a product\'s own color (D117), is the code\'s. A link that is the current one, a.tag[aria-current="page"], draws solid (D101). A product sets its corner, height and size (--tag-r-fixed, --tag-r-ratio, --tag-default-h); its case and tracking (--tag-case, Quarry\'s uppercase) are the code\'s alone. What isn\'t here yet takes --tag-edge-style: dashed: dash an instance\'s stroke (4, 2). Properties show .tag-dot (the kind\'s color before the words) and .tag-remove (a button at the end: the code pulls its box into the tag\'s padding, the file draws the mark alone).' });

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

// ---- dot --------------------------------------------------------------------
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
}, { caption: 'dot · kind × fill', width: 900, description: 'Trellis .dot: the smallest mark of a state. One that carries meaning alone takes role="img" and a label. .cc-ring is the dot not yet filled: a line a quarter of the dot, one to two lines (--dot-ring), clear inside (--dot-fill); on a rail set --dot-fill: var(--surface). .cc-stage-1 to 7 fill with a stage and ring with its ink. .cc-seed, a product\'s own color (D117), is the code\'s.' });

// ---- switch -----------------------------------------------------------------
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

return Object.assign({ components: made }, section('Components'));
