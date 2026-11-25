/* Trellis · figma-screens · the screens, made of the other parts' components
   Run as `node tools/figma-components.js --plugin screens`, last. One settings
   card in each product, wide and light, phone and dark; a page of scopes (D96);
   a conversation, flat and in bubbles (D99), and one on a phone at night; the
   shell in two products; a page of events with covered cards, covered rows,
   choices, a field with slots and cards that are a choice (D108, D109, D116). The section Screens, removed and built again. */
clear(['Screens']);
host.name = 'screens'; host.itemSpacing = 80;
const line = (name) => { const r = row(name, { itemSpacing: 80, counterAxisAlignItems: 'MIN' }); host.appendChild(r); return r; };
const [listSet, itemSet, composerSet, fieldSet, groupSet, coverSet, linkRowSet, shellSet, bubbleSet, flatSet, dividerSet, typingSet, stackCmp] =
  ['list-item', 'options-card-item', 'composer', 'field', 'list cc-group', 'card:has(.card-link)', 'list-item:has(.list-link)', 'shell', 'chat-item', 'chat-item cc-flat', 'chat-divider', 'chat-typing', 'avatar-stack'].map(got);

// ---- Screens: one settings card, in each product at two screens and themes -----
const item = (t, on) => inst(itemSet, { kind: 'switch', state: on ? 'selected' : 'rest' }, 'label', t);
async function settings(title, width, modes) {
  const f = col(title); f.resize(width, 400); f.counterAxisSizingMode = 'FIXED'; f.primaryAxisSizingMode = 'AUTO'; fill(f, [paint('bg')]);
  padX(f, 'space/sp-2'); padY(f, 'space/sp-4');
  modeOf(f, modes);
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
  for (const [l, k, e] of [['People', 'cc-person', 'default'], ['Events', 'cc-event', 'default'], ['Daily', 'cc-quiet', 'default'], ['Urgent', 'cc-alert', 'cc-solid']]) {
    const t = variant(tagSet, { kind: k, emphasis: e, size: 'default' }).createInstance(); tagsRow.appendChild(t);
    t.setProperties({ [Object.keys(t.componentProperties).find((x) => x.startsWith('label'))]: l });
  }
  const fld = variant(fieldSet, { state: 'rest' }).createInstance(); card.appendChild(fld); fld.layoutSizingHorizontal = 'FILL';
  const actions = row('cluster'); card.appendChild(actions); bind(actions, 'itemSpacing', 'space/sp-1');
  for (const [l, k, e] of [['Save', 'cc-primary'], ['Cancel', 'default'], ['Turn off', 'cc-alert', 'cc-outline']]) actions.appendChild(btn(k, 'default', l, e));
  return f;
}
const shown = [], first = line('settings');
for (const [p, s, c] of [['Core', 'Wide', 'Light'], ['Core', 'Phone', 'Dark'], ['Quarry', 'Wide', 'Light'], ['Quarry', 'Phone', 'Dark'], ['Almanac', 'Wide', 'Light'], ['Almanac', 'Phone', 'Dark']]) {
  const f = await settings(`Settings · ${p} · ${s} · ${c}`, s === 'Wide' ? 480 : 393, { Product: p, Space: s, Type: s, Color: c });
  first.appendChild(f); shown.push(f.id);
}
// Scopes (D96): a product nested in a product is an inner frame with its own
// Product mode, and a mood (data-theme) the same frame in the Dark Color mode.
async function scopeCard(name, scope, dark) {
  const card = col(`[data-product="${scope}"]`); modeOf(card, Object.assign({ Product: 'Grove › ' + name }, dark ? { Color: 'Dark' } : {}));
  fill(card, [paint('bg-raised')]); edge(card, 'border-subtle'); corners(card, 'knob/shape-card');
  padX(card, 'knob/density-card-pad-inline'); padY(card, 'knob/density-card-pad-block'); bind(card, 'itemSpacing', 'space/sp-2');
  const head = col('section-head'); card.appendChild(head); head.layoutSizingHorizontal = 'FILL'; bind(head, 'itemSpacing', 'space/sp-1');
  head.appendChild(await words(dark ? 'A scope, at night' : 'A scope', { style: 'eyebrow', ink: 'text-tertiary' }));
  head.appendChild(await words(name, { style: 'h3' }));
  const list = col('list'); card.appendChild(list); list.layoutSizingHorizontal = 'FILL';
  for (const [t, m, u] of [['Morning sit', 'dot', 'true'], ['Study circle', 'face', 'false']]) { const i = variant(listSet, { mark: m, unread: u, state: 'rest' }).createInstance(); list.appendChild(i); i.layoutSizingHorizontal = 'FILL'; label(i, 'title', t); }
  card.appendChild(btn('cc-primary', 'default', 'Join'));
  return card;
}
const eco = col('Grove · Wide · Light · scopes'); width(eco, 1200); eco.counterAxisSizingMode = 'FIXED'; fill(eco, [paint('bg')]);
modeOf(eco, { Product: 'Grove', Space: 'Wide', Type: 'Wide', Color: 'Light' });
padX(eco, 'space/sp-4'); padY(eco, 'space/sp-4'); bind(eco, 'itemSpacing', 'space/sp-3');
eco.appendChild(await words('One ecosystem', { style: 'h2' }));
const arch = row('archways', { counterAxisAlignItems: 'MIN' }); eco.appendChild(arch); arch.layoutSizingHorizontal = 'FILL'; bind(arch, 'itemSpacing', 'space/sp-2');
for (const [n, s, d] of [['Studio', 'studio', false], ['Lodge', 'lodge', true], ['Lantern', 'lantern', false]]) { const k = await scopeCard(n, s, d); arch.appendChild(k); k.layoutGrow = 1; }
// Conversations (D99): a header, a flat thread with everything a message carries, a composer;
// beside it a bubble thread. A run is a cell apart (a flat row pads half of it), a group two.
async function convo(name, w, flat, says) {
  const f = col(name); width(f, w); bind(f, 'itemSpacing', 'space/sp-2');
  const head = row('header'); f.appendChild(head); head.layoutSizingHorizontal = 'FILL'; bind(head, 'itemSpacing', 'space/sp-1');
  head.appendChild(flat ? av('cc-md') : stackCmp.createInstance());
  const pair = col('pair'); head.appendChild(pair); pair.layoutGrow = 1; bind(pair, 'itemSpacing', 'space/sp-h');
  pair.appendChild(await words(flat ? 'Ada' : 'Food Systems', { fs: 'type/sm/size', weight: 'type/fw-strong', name: 'list-title' }));
  pair.appendChild(await words(flat ? 'Seed Library · Food Systems' : 'Ada, Jonah, you and 9 more', { style: 'xs', ink: 'text-tertiary', name: 'context' }));
  head.appendChild(icon('cc-md', 'ph-magnifying-glass')); head.appendChild(icon('cc-md', 'ph-info'));
  const th = col(flat ? 'chat-thread cc-flat' : 'chat-thread'); f.appendChild(th); th.layoutSizingHorizontal = 'FILL'; bind(th, 'itemSpacing', flat ? 'space/sp-1' : 'space/sp-2');
  for (const group of says) {
    const run = col('run'); th.appendChild(run); run.layoutSizingHorizontal = 'FILL'; if (!flat) bind(run, 'itemSpacing', 'space/sp-1');
    for (const [kind, v, o, deep] of group) {
      const i = variant({ flat: flatSet, bubble: bubbleSet, divider: dividerSet, typing: typingSet }[kind], v).createInstance();
      // A flat row pads its hover fill; a line of the thread's own keeps to the text's edges.
      const into = flat && kind !== 'flat' ? row('inset') : null;
      if (into) { run.appendChild(into); into.layoutSizingHorizontal = 'FILL'; padX(into, 'space/sp-1'); padY(into, 'space/sp-h'); }
      (into || run).appendChild(i); if (kind !== 'typing') i.layoutSizingHorizontal = 'FILL';
      props(i, o); if (deep) deep(i);
    }
  }
  if (flat) { const b = variant(composerSet, { state: 'empty' }).createInstance(); f.appendChild(b); b.layoutSizingHorizontal = 'FILL'; }
  return f;
}
const only = { 'chat-item-bubble': false };
const asAlert = (i) => i.findOne((n) => n.type === 'INSTANCE' && n.name === 'chat-file').setProperties({ tint: 'alert' });
const withImage = (i) => i.findOne((n) => n.type === 'INSTANCE' && n.name === 'chat-link').setProperties({ media: 'image' });
const FLAT = (more) => [
  [['divider', { kind: 'default' }, { label: 'Yesterday' }]],
  [['flat', { run: 'first', state: 'rest' }, { text: 'The seed log is up to date. Twelve varieties are on it.' }], ['flat', { run: 'cc-cont', state: 'rest' }, { ...only, 'chat-file': true }, asAlert]],
  [['divider', { kind: 'cc-new' }, { label: 'New' }]],
  [['flat', { run: 'first', state: 'rest' }, { text: 'Yes, with a note that they want another week.', 'chat-quote': true, 'chat-edited': true, 'chat-reactions': true }], ['flat', { run: 'cc-cont', state: 'hover' }, { ...only, 'chat-link': true }, more]],
  [['flat', { run: 'first', state: 'cc-removed' }, { text: 'Message removed' }]],
  [['typing', { thread: 'cc-flat' }, {}]]];
const threads = row('threads', { counterAxisAlignItems: 'MIN' }); eco.appendChild(threads); bind(threads, 'itemSpacing', 'space/sp-4');
threads.appendChild(await convo('conversation', 520, true, FLAT(withImage)));
threads.appendChild(await convo('conversation', 520, false, [
  [['divider', { kind: 'default' }, { label: 'Today' }]],
  [['bubble', { from: 'default', run: 'first', state: 'default' }, { text: 'Is the swap table still on for Saturday?' }], ['bubble', { from: 'default', run: 'cc-cont', state: 'default' }, { ...only, 'chat-file': true }]],
  [['bubble', { from: 'cc-own', run: 'first', state: 'default' }, { text: 'It is. I will bring a jar for the beans.', 'chat-quote': true, 'chat-reactions': true }]],
  [['divider', { kind: 'cc-new' }, { label: 'New' }]],
  [['bubble', { from: 'default', run: 'first', state: 'default' }, { ...only, 'chat-link': true }], ['bubble', { from: 'default', run: 'cc-cont', state: 'cc-removed' }, { text: 'Message removed' }]],
  [['typing', { thread: 'default' }, {}]]]));
const second = line('scopes, conversation'); second.appendChild(eco); shown.push(eco.id);
// The same flat conversation on a phone, at night, in one product.
const ph9 = col('Conversation · Almanac · Phone · Dark'); modeOf(ph9, { Product: 'Almanac', Space: 'Phone', Type: 'Phone', Color: 'Dark' });
fill(ph9, [paint('bg')]); padX(ph9, 'space/sp-2'); padY(ph9, 'space/sp-2'); ph9.appendChild(await convo('conversation', 354, true, FLAT(null)));
second.appendChild(ph9); shown.push(ph9.id);
// The shell (D80): across the top, wide and light; a tab bar, on a phone at night; a translucent bar (D115).
const third = line('shell');
for (const [p, s, c, top, bar] of [['Quarry', 'Wide', 'Light', 'cc-top', 'opaque'], ['Almanac', 'Phone', 'Dark', 'default', 'opaque'], ['Core', 'Phone', 'Light', 'cc-top', 'translucent']]) {
  const f = col(`Shell · ${p} · ${s} · ${c}`); modeOf(f, { Product: p, Space: s, Type: s, Color: c });
  f.appendChild(variant(shellSet, { top, width: s === 'Wide' ? 'wide' : 'narrow', bar }).createInstance());
  third.appendChild(f); shown.push(f.id);
}
// Covered cards, covered rows and choices (D108, D109), in one product: a page of events.
const ev = col('Events · Almanac · Wide · Light'); width(ev, 1200); ev.counterAxisSizingMode = 'FIXED'; fill(ev, [paint('bg')]);
modeOf(ev, { Product: 'Almanac', Space: 'Wide', Type: 'Wide', Color: 'Light' });
padX(ev, 'space/sp-4'); padY(ev, 'space/sp-4'); bind(ev, 'itemSpacing', 'space/sp-3');
const top = row('section-head', { counterAxisAlignItems: 'MAX' }); ev.appendChild(top); top.layoutSizingHorizontal = 'FILL'; bind(top, 'itemSpacing', 'space/sp-1');
const eh = col('pair'); bind(eh, 'itemSpacing', 'space/sp-1'); top.appendChild(eh); eh.layoutGrow = 1;
eh.appendChild(await words('This month', { style: 'eyebrow', ink: 'text-tertiary' })); eh.appendChild(await words('Events', { style: 'h2' }));
// A search in a field's box, and a count on an icon button's corner (D116, D115).
top.appendChild(inst(got('input cc-slots'), { start: 'icon', end: 'button', state: 'rest', size: 'default' }, 'value', 'Lantern'));
top.appendChild(props(pick(inst(iconSet, { kind: 'default', emphasis: 'default', size: 'default' }), 'ph-chat'), { 'badge cc-corner': true }));
const grid = row('grid cc-fill', { counterAxisAlignItems: 'MIN' }); ev.appendChild(grid); grid.layoutSizingHorizontal = 'FILL'; bind(grid, 'itemSpacing', 'space/sp-2');
for (const [m, s] of [['cc-bleed', 'rest'], ['cc-fill', 'hover'], ['default', 'rest']]) { const i = variant(coverSet, { media: m, state: s }).createInstance(); grid.appendChild(i); i.layoutGrow = 1; }
const lower = row('columns', { counterAxisAlignItems: 'MIN' }); ev.appendChild(lower); lower.layoutSizingHorizontal = 'FILL'; bind(lower, 'itemSpacing', 'space/sp-2');
const left = col('column'); lower.appendChild(left); left.layoutGrow = 1; bind(left, 'itemSpacing', 'space/sp-2');
const strip = variant(coverSet, { media: 'cc-bleed-start', state: 'selected' }).createInstance(); left.appendChild(strip); strip.layoutSizingHorizontal = 'FILL';
const rows = col('list'); left.appendChild(rows); rows.layoutSizingHorizontal = 'FILL';
for (const s of ['rest', 'hover', 'rest']) { const i = variant(linkRowSet, { state: s }).createInstance(); rows.appendChild(i); i.layoutSizingHorizontal = 'FILL'; }
// A card of choices: a mixed parent over its children, a radio group, a draft tag, a block button.
const prefs = col('card'); lower.appendChild(prefs); width(prefs, 400); fill(prefs, [paint('bg-raised')]); edge(prefs, 'border-subtle'); corners(prefs, 'knob/shape-card');
padX(prefs, 'knob/density-card-pad-inline'); padY(prefs, 'knob/density-card-pad-block'); bind(prefs, 'itemSpacing', 'space/sp-2');
const ph = row('section-head', { primaryAxisAlignItems: 'SPACE_BETWEEN' }); prefs.appendChild(ph); ph.layoutSizingHorizontal = 'FILL';
ph.appendChild(await words('Reminders', { style: 'h4' }));
const draft = inst(tagSet, { kind: 'default', emphasis: 'cc-outline', size: 'cc-sm' }, 'label', 'Draft'); ph.appendChild(draft); draft.dashPattern = [4, 2];
const choiceSet = got('choice'), choose = (kind, checked, t, indent) => { const i = inst(choiceSet, { kind, checked, state: 'rest', size: 'default' }, 'choice-label', t); if (indent) { const w = row('nested'); bind(w, 'paddingLeft', 'space/sp-2'); w.appendChild(i); return w; } return i; };
const checks = col('fieldset'); prefs.appendChild(checks);
for (const [c, t, n] of [['mixed', 'Every event', false], ['true', 'A day before', true], ['false', 'An hour before', true]]) checks.appendChild(choose('checkbox', c, t, n));
const radios = col('fieldset'); prefs.appendChild(radios);
for (const [c, t] of [['false', 'By email'], ['true', 'By text message']]) radios.appendChild(choose('radio', c, t));
// Two cards that are a choice (D116).
const ways = col('radiogroup'); prefs.appendChild(ways); ways.layoutSizingHorizontal = 'FILL'; bind(ways, 'itemSpacing', 'space/sp-1');
for (const [checked, t] of [['true', 'Keep a bed going'], ['false', 'Grow at home']]) { const i = inst(got('card:has(.card-choice)'), { kind: 'radio', checked, state: 'rest' }); ways.appendChild(i); i.layoutSizingHorizontal = 'FILL'; label(i.findOne((n) => n.type === 'INSTANCE'), 'choice-label', t); }
const save = btn('cc-primary', 'default', 'Save reminders'); prefs.appendChild(save); save.layoutSizingHorizontal = 'FILL';
host.appendChild(ev); shown.push(ev.id);
await host.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 0.05 } });   // drawn once, so its layout has settled before the section takes its size
return Object.assign({ screens: shown }, section('Screens'));
