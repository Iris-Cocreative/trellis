/* Trellis · figma-surfaces · fields, tabs, menus, rows, cards and dialogs
   Run as `node tools/figma-components.js --plugin surfaces`, after the
   primitives: an input and one with slots (D116), a field, tabs, an options
   card, a tooltip, a list row, the composer, a card, a card that is a choice
   (D116), a modal and a tray, in the section Surfaces, which it removes and
   builds again, with the Templates and the Screens, which are made of it. */
clear(['Surfaces', 'Templates', 'Screens']);
host.name = 'surfaces';
const [dotSet, choiceSet] = ['dot', 'choice'].map(got);

// ---- input, field -----------------------------------------------------------
const IN_SIZES = { default: ['knob/density-control-h', 'knob/density-control-fs', 'space/sp-1'], 'cc-sm': ['size/size-control-sm', 'type/control/fs-control-sm', 'space/sp-h'], 'cc-lg': ['size/size-control-xl', 'type/control/fs-control-lg', 'space/sp-1'] };
// A select's mark, which the code draws from two gradients: not an icon.
const chevron = (c, off) => { const v = figma.createVector(); v.name = 'chevron'; v.vectorPaths = [{ windingRule: 'NONZERO', data: 'M 0 0 L 10 0 L 5 5 Z' }]; stroke(v, []); fill(v, [paint(off ? 'text-tertiary' : 'text')]); c.appendChild(v); };
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
  if (p.element === 'select') { chevron(c, p.state === 'disabled'); bind(c, 'itemSpacing', 'space/sp-1'); bind(c, 'paddingRight', 'space/sp-1'); }
  return c;
}, { skip: (p) => p.element === 'select' && p.state === 'read-only', text: ['value', 'Placeholder'], caption: 'input · element × state × size', description: 'Trellis .input: one box for input, select and textarea, at the product\'s control height (--density-control-h, --shape-input). A select draws a chevron a cell from its end; a textarea is three lines of two cells (--input-rows) and grows with its text. invalid is aria-invalid="true". On touch the code makes it 44pt and 16px type, or iOS zooms.' });

// Something in its box (D116): what comes before the control and after it. A button stands a quarter
// cell from the edge all round, its corner the box's less that; an icon or a unit where a plain input's words start.
const SLOT = { default: 'derived/input-slot', 'cc-sm': 'space/sp-1h', 'cc-lg': 'size/input-slot-lg' };
await set('input cc-slots', { start: ['none', 'icon', 'unit', 'button'], end: ['none', 'icon', 'unit', 'button', 'select'], state: ['rest', 'invalid', 'disabled', 'read-only'], size: Object.keys(IN_SIZES) }, async (p) => {
  const c = component(), [h, fs, pad] = IN_SIZES[p.size], off = p.state === 'disabled', sel = p.end === 'select';
  c.primaryAxisSizingMode = 'FIXED'; c.resize(240, 36); fixedHeight(c, h); bind(c, 'itemSpacing', 'space/sp-h'); corners(c, 'knob/shape-input');
  bind(c, 'paddingLeft', p.start === 'button' ? 'space/sp-q' : pad); bind(c, 'paddingRight', p.end === 'button' ? 'space/sp-q' : sel ? 'space/sp-1' : pad);
  fill(c, [paint(off || p.state === 'read-only' ? 'bg-sunken' : 'bg-raised')]);
  edge(c, p.state === 'invalid' ? 'alert' : off ? 'border-subtle' : 'border');
  const ink = off ? 'text-tertiary' : 'text-secondary';
  const slot = async (kind, unit) => {
    if (kind === 'icon') c.appendChild(glyph(ink, 'ph-magnifying-glass'));
    else if (kind === 'unit') c.appendChild(await words(unit, { fs, weight: 'type/fw-body', ink, name: 'input-unit ' + (unit === '$' ? 'start' : 'end') }));
    else if (kind === 'button') {
      const b = row('button icon-button cc-ghost', { primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'FIXED', primaryAxisAlignItems: 'CENTER' }); c.appendChild(b);
      bind(b, 'width', SLOT[p.size]); bind(b, 'height', SLOT[p.size]); corners(b, 'derived/composer-btn-r');
      const g = glyph(off ? 'text-faint' : 'text', 'ph-x'); g.name = 'button icon'; b.appendChild(g);
    }
  };
  await slot(p.start, '$');
  const t = await words('Value', { fs, weight: 'type/fw-body', ink: off ? 'text-tertiary' : 'text', name: 'value' }); c.appendChild(t); t.layoutGrow = 1; t.textAutoResize = 'HEIGHT';
  if (sel) chevron(c, off); else await slot(p.end, 'a month');
  return c;
}, { skip: (p) => (p.start === 'none' && (p.end === 'none' || p.end === 'select')) || (p.end === 'select' && p.state === 'read-only'), text: ['value', 'Value'], swap: [['drawing', 'icon', 'ph-magnifying-glass'], ['button drawing', 'button icon', 'ph-x']], caption: 'input cc-slots · start × end × state × size', width: 1600,
  description: 'Trellis div.input.cc-slots (D116): an input in every way it is drawn, with a bare .input-control in it (an input or a select); what comes before the control stands at its start and what comes after at its end. A slot is an .icon or an .input-unit, drawn and nothing more, or a .button.icon-button, its own control. <div class="input cc-slots"><svg class="icon cc-phosphor" aria-hidden="true">…</svg><input class="input-control"></div>. The box takes the ring and the states from its control: invalid, disabled, read-only. A select takes a start slot; its end is its chevron. The whole box is the field in the code: a click on a unit or an icon focuses it. A unit is cut at 6em (--input-unit).' });

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
  if (!sw) c.appendChild(glyph(off ? 'text-faint' : 'text', 'ph-user'));
  const t = await words('Option', { fs: 'knob/density-option-fs', weight: 'type/fw-body', ink: off ? 'text-faint' : 'text' });
  c.appendChild(t); t.layoutGrow = 1;
  if (sw) c.appendChild(track(on, off));
  else if (p.state === 'selected') { const g = glyph('accent', 'ph-check'); g.name = 'icon cc-end'; c.appendChild(g); }
  return c;
}, { text: ['label', 'Option'], parts: [['icon', false]], swap: [['drawing', 'icon', 'ph-user']], caption: 'options-card-item · kind × state', width: 900, description: 'Trellis .options-card-item, a row in an options card. Properties show an icon before its label and swap its drawing. selected is aria-selected or aria-checked. kind=switch is button.options-card-item[role=menuitemcheckbox] with an empty span.switch at its end, lit by the row.' });
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
  const composerBtn = (ink, bg, d) => {
    const b = row('button icon-button', { primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'FIXED', primaryAxisAlignItems: 'CENTER' });
    bind(b, 'width', 'size/size-control-md'); bind(b, 'height', 'size/size-control-md'); corners(b, 'derived/composer-btn-r'); fill(b, bg ? [paint(bg)] : []);
    const g = glyph(ink, d); b.appendChild(g); if (bg) g.name = 'send icon'; return b;
  };
  c.appendChild(composerBtn('text', null, 'ph-paperclip'));
  const box = row('composer-input'); c.appendChild(box); box.layoutGrow = 1; padX(box, 'space/sp-q'); fixedHeight(box, 'size/size-control-md');
  const t = await words(ready ? 'See you at ten' : 'Write a message', { fs: 'type/control/fs-control-lg', weight: 'type/fw-body', ink: ready ? 'text' : 'text-tertiary', name: 'value' });
  box.appendChild(t); t.layoutGrow = 1;
  c.appendChild(composerBtn(ready ? 'accent-ink' : 'text-tertiary', ready ? 'accent' : 'bg-hover', 'ph-arrow-up'));
  return c;
}, { swap: [['drawing', 'icon', 'ph-paperclip']], caption: 'composer · state', width: 900, description: 'Trellis .composer: one box, .composer-input (a textarea that grows a line at a time to --composer-max) between icon buttons, .composer-send last, which wakes with text. Three cells for one line. It takes the focus ring. In a .field its hint starts at the text.' });

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

// ---- a card that is a choice (D116) ----------------------------------------
await set('card:has(.card-choice)', { kind: ['radio', 'checkbox'], checked: ['false', 'true', 'mixed'], state: ['rest', 'hover', 'press', 'invalid', 'disabled'] }, async (p) => {
  const c = component('VERTICAL'), on = p.checked !== 'false', off = p.state === 'disabled', lit = on && !off; c.counterAxisAlignItems = 'MIN'; width(c, 288);
  corners(c, 'knob/shape-card'); padX(c, 'knob/density-card-pad-inline'); padY(c, 'knob/density-card-pad-block'); bind(c, 'itemSpacing', 'space/sp-1');
  fill(c, off ? [paint('bg-sunken')] : p.checked === 'true' ? [paint('bg-raised'), paint('accent', 0.08)] : [paint('bg-raised')]);
  const role = p.state === 'invalid' ? 'alert' : on ? (off ? 'text' : 'accent') : null;
  if (role) { stroke(c, [paint(role, off ? 0.2 : 1)]); c.strokeAlign = 'INSIDE'; c.strokeWeight = 2; } else edge(c, 'border-subtle');
  const t = variant(choiceSet, { kind: p.kind, checked: p.checked, state: off || p.state === 'invalid' ? p.state : 'rest', size: 'default' }).createInstance(); c.appendChild(t); label(t, 'choice-label', 'Keep a bed going'); t.name = 'choice card-choice';
  for (const [x, style, ink, name] of [['Two evenings a month, all season.', 'sm', 'text-secondary', 'body'], ['Nine places left', 'xs', lit ? 'text-secondary' : 'text-tertiary', 'note']]) { const w = await words(x, { style, ink, name }); c.appendChild(w); w.layoutSizingHorizontal = 'FILL'; w.textAutoResize = 'HEIGHT'; }
  if (share[p.state]) { const v = figma.createRectangle(); v.name = 'card-choice::before'; c.appendChild(v); v.layoutPositioning = 'ABSOLUTE'; v.x = v.y = 0; v.resize(c.width, c.height); v.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' }; corners(v, 'knob/shape-card'); fill(v, [paint('text', share[p.state])]); }
  return c;
}, { skip: (p) => p.kind === 'radio' && p.checked === 'mixed', caption: 'card:has(.card-choice) · kind × checked × state', width: 1650, description: 'Trellis .card > label.choice.card-choice > input + .choice-label (D116): the choice\'s own label covers the card, so a press anywhere on it is a press on the label; what describes it is an aria-describedby, and the card\'s other controls are raised above the cover. Chosen, an edge two lines thick (--card-choice-edge) and 8% of the choice\'s color under its words (--card-choice-fill), and the third ink reads as the second; mixed lights the edge alone; invalid turns the edge to the alert, from the input or its radiogroup; disabled sinks the ground and keeps the description readable. Hover and press are the shared layer on the cover (here drawn over the words too), and the ring is the code\'s.' });

// ---- modal ------------------------------------------------------------------
const dialog = async (m) => {
  m.counterAxisAlignItems = 'MIN'; fill(m, [paint('bg-raised')]); edge(m, 'border'); lift(m);
  const head = row('modal-header', { counterAxisAlignItems: 'MIN', primaryAxisAlignItems: 'SPACE_BETWEEN' }); m.appendChild(head); head.layoutSizingHorizontal = 'FILL';
  padX(head, 'space/sp-2'); bind(head, 'paddingTop', 'space/sp-2'); bind(head, 'paddingBottom', 'space/sp-1');
  head.appendChild(await words('Dialog title', { style: 'h4', name: 'title' }));
  head.appendChild(icon('cc-sm', 'ph-x'));
  const body = col('modal-body'); m.appendChild(body); body.layoutSizingHorizontal = 'FILL'; padX(body, 'space/sp-2'); padY(body, 'space/sp-1');
  const bt = await words('The body scrolls when the dialog is taller than the screen. Its footer holds the actions, the main one last.', { style: 'body', ink: 'text-secondary', name: 'body' });
  body.appendChild(bt); bt.layoutSizingHorizontal = 'FILL'; bt.textAutoResize = 'HEIGHT';
  const foot = row('modal-footer', { primaryAxisAlignItems: 'MAX' }); m.appendChild(foot); foot.layoutSizingHorizontal = 'FILL';
  padX(foot, 'space/sp-2'); bind(foot, 'paddingBottom', 'space/sp-2'); bind(foot, 'paddingTop', 'space/sp-1'); bind(foot, 'itemSpacing', 'space/sp-h');
  foot.appendChild(btn('default', 'default', 'Cancel')); foot.appendChild(btn('cc-primary', 'default', 'Save'));
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

return Object.assign({ components: made }, section('Surfaces'));
