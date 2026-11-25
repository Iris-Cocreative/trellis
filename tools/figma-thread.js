/* Trellis · figma-thread · the conversation (D99)
   Run as `node tools/figma-components.js --plugin thread`, after the
   primitives: what a message can carry (a quote, a file, a link, reactions),
   the thread's own lines (a divider, the typing line) and the messages
   themselves, bubble, flat, wall and system, in the section Thread, which it
   removes and builds again, with the Screens, which are made of it. */
clear(['Thread', 'Screens']);
host.name = 'thread';

// ---- chat-quote, chat-file, chat-link: the same in a bubble and a flat row ----
const quoteSet = await set('chat-quote', { state: ['rest', 'hover'] }, async (p) => {
  const c = component('VERTICAL'), on = p.state === 'hover'; c.counterAxisAlignItems = 'MIN'; width(c, 320);
  bind(c, 'itemSpacing', 'space/sp-h'); bind(c, 'paddingLeft', 'space/sp-1'); side(c, on ? 'text-tertiary' : 'border-strong', 'Left', 2);
  c.appendChild(await words('Jonah', { fs: 'type/xs/size', ink: 'text', name: 'chat-quote-author' }));
  const t = await words('Thank you. One thing: can the two drying ones go on the swap table anyway? They only want another week, and there is room.', { style: 'xs', ink: on ? 'text' : 'text-secondary', name: 'chat-quote-text' });
  c.appendChild(t); wrap(t); t.textTruncation = 'ENDING'; t.maxLines = 2;
  return c;
}, { caption: 'chat-quote · state', width: 800, description: 'Trellis a.chat-quote > span.chat-quote-author.t-xs + span.chat-quote-text.t-xs: the message this one replies to, who wrote it and two lines of it, after a two-line rule (--chat-quote-rule), its text on the next cell. A link or a button to the original; hover inks the rule and the words. The code rounds the block up to whole cells.' });

// The file's mark is the specimen's, on a 12 box.
const FILE = 'M 3.6 1.8 L 6.6 1.8 L 9 4.2 L 9 10.2 L 3.6 10.2 Z M 6.6 1.8 L 6.6 4.2 L 9 4.2';
const FILE_TINTS = { default: 'accent', 'kind-person': 'kind-person', 'kind-group': 'kind-group', 'kind-event': 'kind-event', 'kind-course': 'kind-course', 'kind-topic': 'kind-topic', alert: 'alert' };
const fileSet = await set('chat-file', { tint: Object.keys(FILE_TINTS) }, async (p) => {
  const c = component(), hue = FILE_TINTS[p.tint];
  bind(c, 'paddingLeft', 'space/sp-h'); bind(c, 'paddingRight', 'space/sp-1h'); padY(c, 'space/sp-h'); bind(c, 'itemSpacing', 'space/sp-1');
  corners(c, 'radius/r-1'); fill(c, [paint('bg-raised')]); edge(c, 'border-subtle'); bind(c, 'maxWidth', 'size/chat-file-measure');
  const m = row('chat-file-mark', { primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'FIXED', primaryAxisAlignItems: 'CENTER' }); c.appendChild(m);
  bind(m, 'width', 'size/size-control-lg'); bind(m, 'height', 'size/size-control-lg'); corners(m, 'radius/r-h'); fill(m, [paint(hue, 0.18)]);
  const i = figma.createFrame(); i.name = 'icon'; fill(i, []); i.resize(12, 12); i.clipsContent = false; m.appendChild(i);
  const v = figma.createVector(); v.vectorPaths = [{ windingRule: 'NONE', data: FILE }]; i.appendChild(v); [v.x, v.y] = at(FILE);
  stroke(v, [paint(hue)]); fill(v, []); v.strokeWeight = 0.9; v.strokeCap = 'ROUND'; v.strokeJoin = 'ROUND'; v.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  bind(i, 'width', 'size/size-icon'); bind(i, 'height', 'size/size-icon');
  const pair = col('pair'); c.appendChild(pair); bind(pair, 'itemSpacing', 'space/sp-h');
  pair.appendChild(await words('seed-log-november.pdf', { style: 'sm', name: 'name' }));
  pair.appendChild(await words('PDF · 2.4 MB', { style: 'xs', ink: 'text-tertiary', name: 'size' }));
  return c;
}, { text: ['name', 'seed-log-november.pdf'], caption: 'chat-file · tint', width: 1100, description: 'Trellis a.chat-file > span.chat-file-mark > svg.icon, then .pair > .t-sm.u-truncate + .t-xs: a file, four cells tall, at most 26 wide, its mark tinted by its kind (--chat-file-tint, the accent unless set; a variant here for each kind and the alert). A name too long is cut with an ellipsis: set Truncate on an instance\'s name. The same shape as an attachment chip.' });

const linkSet = await set('chat-link', { media: ['none', 'image'] }, async (p) => {
  const c = component('VERTICAL'); c.counterAxisAlignItems = 'MIN'; width(c, 384);
  bind(c, 'itemSpacing', 'space/sp-h'); bind(c, 'paddingLeft', 'space/sp-1'); side(c, 'accent', 'Left', 2);
  c.appendChild(await words('seedsavers.org', { style: 'xs', ink: 'text-tertiary', name: 'chat-link-site' }));
  const t = await words('Drying seed at home', { style: 'sm', name: 'chat-link-title' }); c.appendChild(t); wrap(t);
  if (p.media === 'image') {
    const b = row('inset'); c.appendChild(b); b.layoutSizingHorizontal = 'FILL'; bind(b, 'paddingTop', 'space/sp-h');
    const m = figma.createFrame(); m.name = 'chat-link-media'; m.clipsContent = true; b.appendChild(m); m.layoutSizingHorizontal = 'FILL'; bind(m, 'height', 'space/sp-16'); corners(m, 'radius/r-1');
    fill(m, [photo(372, 192)]);
  }
  return c;
}, { text: ['chat-link-title', 'Drying seed at home: racks, screens and how long each kind takes'], caption: 'chat-link · media', width: 1000, description: 'Trellis a.chat-link > span.chat-link-site.t-xs + span.chat-link-title.t-sm + img.chat-link-media: a link\'s preview after a two-line rule in the accent (--chat-link-rule), at most 32 cells wide; the image is sixteen cells tall, by cover, with a corner of one cell. Hover underlines the title. The picture is a stand-in: replace the fill.' });
// Its measure is its width, and the most a flat row may stretch it to.
for (const c of linkSet.children) { bind(c, 'width', 'size/chat-link-measure'); bind(c, 'maxWidth', 'size/chat-link-measure'); }

const reactionSet = await set('chat-reaction', { mine: ['false', 'true'] }, async (p) => {
  const c = component(), on = p.mine === 'true';
  fixedHeight(c, 'size/size-control-sm'); padX(c, 'space/sp-h'); bind(c, 'itemSpacing', 'space/sp-q'); corners(c, 'radius/r-round');
  fill(c, on ? [paint('bg'), paint('accent', 0.16)] : [paint('bg')]); edge(c, on ? 'accent' : 'border-subtle', on ? 0.6 : 1);
  c.appendChild(await words('👍', { fs: 'type/control/fs-control-lg', ink: 'text', name: 'emoji' }));
  c.appendChild(await words('3', { fs: 'type/control/fs-control-sm', ink: on ? 'text' : 'text-secondary', name: 'count' }));
  return c;
}, { text: ['count', '3'], caption: 'chat-reaction · mine', width: 400, description: 'Trellis .chat-reactions > .chat-reaction > .chat-reaction-emoji: a pill a control tall. Yours (.cc-mine, or aria-pressed="true") is the accent at 16% over the surface, its edge the accent at 60%.' });

// ---- chat-divider, chat-typing: the thread's own lines -----------------------
await set('chat-divider', { kind: ['default', 'cc-new'] }, async (p) => {
  const c = component(), fresh = p.kind === 'cc-new'; c.primaryAxisSizingMode = 'FIXED'; width(c, 480); bind(c, 'itemSpacing', 'space/sp-1');
  const rule = () => { const r = figma.createRectangle(); r.name = 'rule'; c.appendChild(r); r.layoutGrow = 1; fill(r, [fresh ? paint('accent', 0.5) : paint('border-subtle')]); bind(r, 'height', 'space/line'); };
  rule(); c.appendChild(await words('Today', { style: 'xs', ink: fresh ? 'accent' : 'text-tertiary' })); rule();
  return c;
}, { text: ['label', 'Today'], caption: 'chat-divider · kind', width: 1100, description: 'Trellis div.chat-divider > span.t-xs: a day, a rule each side of the words on their capitals\' middle (--chat-divider-rule). .cc-new is the unread line, "New" in the accent, its rules the accent at 50%.' });

await set('chat-typing', { thread: ['default', 'cc-flat'] }, async (p) => {
  const c = component(); bind(c, 'itemSpacing', 'space/sp-h'); bind(c, 'paddingLeft', p.thread === 'cc-flat' ? 'space/sp-4' : 'space/sp-3');
  const d = row('chat-typing-dots'); c.appendChild(d); bind(d, 'itemSpacing', 'space/sp-q');
  for (let i = 0; i < 3; i++) { const e = figma.createEllipse(); e.name = 'i'; d.appendChild(e); bind(e, 'width', 'space/sp-q'); bind(e, 'height', 'space/sp-q'); fill(e, [paint('text-tertiary')]); e.opacity = 0.6; }
  c.appendChild(await words('Ada is typing', { style: 'xs', ink: 'text-tertiary' }));
  return c;
}, { text: ['label', 'Ada is typing'], caption: 'chat-typing · thread', width: 600, description: 'Trellis .chat-typing > span.chat-typing-dots > i×3, then span.t-xs: three dots and the words, from the text\'s column (--chat-inset: three cells in a bubble thread, four in a flat one). The dots pulse in turn; here they are still, at 60%, as the code draws them under reduced motion.' });

// What a message carries beside its words: each shown by a property.
const CARRIED = [['chat-quote', false], ['chat-item-bubble', true], ['chat-edited', false], ['chat-file', false], ['chat-link', false], ['chat-reactions', false]];
async function carry(body, bub, flat) {
  const add = (n, name) => { n.name = name; body.appendChild(n); if (flat && !['chat-file', 'chat-reactions'].includes(name)) n.layoutSizingHorizontal = 'FILL'; };
  add(variant(quoteSet, { state: 'rest' }).createInstance(), 'chat-quote');
  add(bub, 'chat-item-bubble');
  add(variant(fileSet, { tint: 'default' }).createInstance(), 'chat-file');
  add(variant(linkSet, { media: 'none' }).createInstance(), 'chat-link');
  const r = row('chat-reactions'); bind(r, 'itemSpacing', 'space/sp-q'); add(r, 'chat-reactions');
  for (const mine of ['true', 'false']) r.appendChild(variant(reactionSet, { mine }).createInstance());
}
const edited = () => words('(edited)', { fs: 'type/control/fs-control-xs', weight: 'type/fw-body', ink: 'text-tertiary', name: 'chat-edited' });
const CARRIES = ' Properties show what it carries: chat-quote, chat-file, chat-link, chat-reactions, chat-edited; a message that is only a file or a link hides chat-item-bubble.';
async function meta(strong) {
  const m = row('chat-item-meta', { counterAxisAlignItems: 'BASELINE' }); bind(m, 'itemSpacing', 'space/sp-h');
  if (strong !== null) m.appendChild(await words('Ada', strong ? { fs: 'type/sm/size', weight: 'type/fw-strong', ink: 'text', name: 'name' } : { style: 'xs', ink: 'text-tertiary', name: 'name' }));
  m.appendChild(await words('9:41', { style: 'xs', ink: 'text-tertiary', name: 'time' }));
  return m;
}

// ---- chat-item: the bubble and its knobs -------------------------------------
await set('chat-item', { from: ['default', 'cc-own'], run: ['first', 'cc-cont'], state: ['default', 'cc-removed'] }, async (p) => {
  const c = component(), own = p.from === 'cc-own', cont = p.run === 'cc-cont', gone = p.state === 'cc-removed';
  c.counterAxisAlignItems = 'MIN'; c.primaryAxisSizingMode = 'FIXED'; width(c, 560); bind(c, 'itemSpacing', 'space/sp-1');
  if (own) c.primaryAxisAlignItems = 'MAX';
  else { const a = av('default'); c.appendChild(a); a.opacity = cont ? 0 : 1; }
  const body = col('chat-item-body', { counterAxisAlignItems: own ? 'MAX' : 'MIN' }); c.appendChild(body);
  bind(body, 'itemSpacing', 'space/sp-1'); bind(body, 'maxWidth', 'size/chat-measure');
  const bub = row('chat-item-bubble', { counterAxisAlignItems: 'MAX' }); padX(bub, 'space/sp-1'); padY(bub, 'space/sp-1'); bind(bub, 'itemSpacing', 'space/sp-q');
  cornersBut(bub, 'knob/shape-card', [own ? 'bottomRightRadius' : 'bottomLeftRadius']);
  bind(bub, own ? 'bottomRightRadius' : 'bottomLeftRadius', 'radius/r-q');
  if (gone) { edge(bub, 'border'); bub.dashPattern = [4, 2]; } else { fill(bub, [paint(own ? 'chat-own-bg' : 'bg-raised')]); if (!own) edge(bub, 'chat-bubble-edge'); }
  const t = await words('A message', { style: 'body', ink: gone ? 'text-tertiary' : own ? 'chat-own-ink' : 'text', name: 'text' }); bub.appendChild(t); t.maxWidth = 456;
  bub.appendChild(await edited());
  if (!own && !cont) body.appendChild(await meta(false));
  await carry(body, bub, false);
  if (own) body.appendChild(await meta(null));
  return c;
}, { text: ['text', 'A bubble hangs its text from a cell.'], parts: CARRIED, caption: 'chat-item · from × run × state', width: 1250, description: 'Trellis .chat-item in a bubble thread: .avatar + .chat-item-body > .chat-item-meta + .chat-item-bubble. The bubble pads a cell, at most --chat-measure (40 cells) wide, its corner --shape-card and the speaker\'s bottom corner --chat-tail (a quarter cell). Others\' bubbles take the raised ground and the product\'s --chat-bubble-edge; your own (.cc-own) sits at the row\'s end with no avatar, in --chat-own-bg and --chat-own-ink, its meta under it. .cc-cont continues a run a cell apart: the avatar keeps its place, unseen, and the meta shows once. .cc-removed keeps the bubble\'s place as a dashed edge, its words tertiary and (in the code) italic.' + CARRIES });

// ---- chat-item cc-flat: flat rows, their actions on hover ---------------------
await set('chat-item cc-flat', { run: ['first', 'cc-cont'], state: ['rest', 'hover', 'cc-removed'] }, async (p) => {
  const c = component(), cont = p.run === 'cc-cont', gone = p.state === 'cc-removed', on = p.state === 'hover'; c.clipsContent = false;
  c.counterAxisAlignItems = cont ? 'BASELINE' : 'MIN'; c.primaryAxisSizingMode = 'FIXED'; width(c, 480);
  padY(c, 'space/sp-h'); padX(c, 'space/sp-1'); bind(c, 'itemSpacing', 'space/sp-1'); corners(c, 'radius/r-h');
  fill(c, on ? [paint('text', share.hover)] : []);
  if (!cont) c.appendChild(av('cc-md'));
  else {
    const time = row('chat-item-time', { primaryAxisSizingMode: 'FIXED', primaryAxisAlignItems: 'CENTER' }); bind(time, 'width', 'space/sp-3'); c.appendChild(time);
    const w = await words('9:41', { style: 'xs', ink: 'text-tertiary', name: 'time' }); time.appendChild(w); w.opacity = on ? 1 : 0;
  }
  const body = col('chat-item-body'); c.appendChild(body); body.layoutGrow = 1; bind(body, 'itemSpacing', 'space/sp-1');
  if (!cont) body.appendChild(await meta(true));
  const bub = row('chat-item-bubble', { counterAxisAlignItems: 'MAX' }); bind(bub, 'itemSpacing', 'space/sp-q');
  const t = await words('A message', { style: 'body', ink: gone ? 'text-tertiary' : 'text', name: 'text' }); bub.appendChild(t); bub.appendChild(await edited());
  await carry(body, bub, true); wrap(t);
  if (on) {
    const a = row('chat-item-actions'); c.appendChild(a); a.layoutPositioning = 'ABSOLUTE';
    padX(a, 'space/sp-q'); padY(a, 'space/sp-q'); bind(a, 'itemSpacing', 'space/sp-q'); corners(a, 'radius/r-1'); fill(a, [paint('bg')]); edge(a, 'border-subtle'); a.strokeAlign = 'OUTSIDE';
    for (let i = 0; i < 3; i++) a.appendChild(icon());
    a.x = c.width - 12 - a.width; a.y = -12; a.constraints = { horizontal: 'MAX', vertical: 'MIN' };
  }
  return c;
}, { text: ['text', 'A flat thread: everyone at the start, no bubble.'], parts: CARRIED, caption: 'chat-item cc-flat · run × state', width: 1650, description: 'Trellis .chat-thread.cc-flat > .chat-item: a three-cell plain face, the name strong and the time on one baseline, the text at full measure. .cc-cont continues a run a cell apart and keeps the face\'s column for its own time, shown on hover. The row\'s hover fill is drawn half the run gap out each way, so a run\'s rows meet; .chat-item-actions (react, reply, more) wait on its top edge at its end, shown on hover and focus. Your own message (.cc-own) changes only its name. .cc-removed: the words tertiary and (in the code) italic, no actions.' + CARRIES });

// ---- chat-item cc-wall, cc-system --------------------------------------------
{
  const w = component(); w.name = 'chat-item cc-wall'; w.counterAxisAlignItems = 'MIN'; w.primaryAxisSizingMode = 'FIXED'; width(w, 480); bind(w, 'itemSpacing', 'space/sp-1');
  w.appendChild(av('default'));
  const body = col('chat-item-body'); w.appendChild(body); body.layoutGrow = 1; bind(body, 'itemSpacing', 'space/sp-1');
  body.appendChild(await meta(false));
  const t = await words('Is the trial bed list ready to share with the stewards?', { style: 'sm', name: 'text' }); body.appendChild(t); wrap(t);
  w.description = 'Trellis .chat-item.cc-wall: a post or a comment, no bubble, the text at full measure. A reply steps in under what it answers.';
  const s = component(); s.name = 'chat-item cc-system'; s.primaryAxisSizingMode = 'FIXED'; width(s, 480); s.primaryAxisAlignItems = 'CENTER';
  s.appendChild(await words('Ada joined Food Systems', { style: 'xs', ink: 'text-tertiary', name: 'text' }));
  s.description = 'Trellis .chat-item.cc-system: a line the thread itself says, in the middle of the column, tertiary.';
  const block = col('messages block', { itemSpacing: 12 }); host.appendChild(block);
  block.appendChild(await words('chat-item cc-wall · chat-item cc-system', { style: 'label', ink: 'text-tertiary', name: 'caption' }));
  const r = row('messages row', { itemSpacing: 48, counterAxisAlignItems: 'MIN' }); block.appendChild(r); r.appendChild(w); r.appendChild(s); made.push('chat-item cc-wall', 'chat-item cc-system');
}
return Object.assign({ components: made }, section('Thread'));
