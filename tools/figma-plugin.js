/* Trellis · figma-plugin · writes the generated variables into a Figma file
   Not run on its own: `node tools/figma-variables.js --plugin <part>` prints
   this with that part's variables in place of DATA, as a script for Figma's
   plugin API (a development plugin, or an agent's Figma tool, which takes
   50,000 characters). The variables travel in two parts: `product` writes the
   Product collection, `space-type-color` the other three and the text styles.
   Each part makes every collection and mode, writes only its own
   collections' variables, and makes any variable they alias that isn't there
   yet, empty, for the other part to fill; so either can run first, though
   product first is the usual order. It works by name, so it can run on a file
   again and again: a collection, mode, variable or text style that exists is
   updated in place and keeps every binding to it; one that's missing is made;
   a variable the generator no longer writes is removed from its part's
   collections (but in a delta, --only, which writes only what it names).
   Top-level await and return, as an agent's Figma tool runs it. */
const PACKED = /*DATA*/null;
// Unpacked to the generator's JSON shape (tools/figma-variables.js, --plugin).
const TYPES = { F: 'FLOAT', S: 'STRING', C: 'COLOR' };
// A tint's values are 0: its role's hex, with the share in its name as alpha.
const share = (pct) => Math.round(pct * 2.55).toString(16).padStart(2, '0');
for (const c of PACKED.collections) for (const row of c.v || []) if (row[3] === 0) {
  const [, theme, role, pct] = row[0].match(/^(light|dark)\/tint\/(.+)\/(\d+)$/);
  row[3] = c.v.find((y) => y[0] === `${theme}/${role}`)[3].map((hex) => hex + share(+pct));
}
const DATA = { collections: PACKED.collections.map((c) => ({ name: c.name, modes: c.modes, variables: c.v && c.v.map(([name, t, sc, vs, cs]) => {
  const d = { name, type: TYPES[t], scopes: PACKED.scopes[sc] ? PACKED.scopes[sc].split(',') : [], values: {}, aliases: {} };
  c.modes.forEach((m, i) => { const y = vs[i]; if (typeof y === 'string' && y[0] === '@') d.aliases[m] = y.slice(1); else d.values[m] = d.type === 'COLOR' ? '#' + y : y; });
  if (cs === 0) d.hidden = true; else if (cs !== 2) d.codeSyntax = { WEB: cs === 1 ? `var(--${name.split('/').pop()})` : cs };
  return d;
}) })) };
const mine = DATA.collections.filter((c) => c.variables);

const report = { made: [], updated: 0, removed: [], styles: [] };
const rgb = (hex) => Object.assign({ r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255 }, hex.length > 7 ? { a: parseInt(hex.slice(7, 9), 16) / 255 } : {});

// Collections and their modes, in the generator's order: all four, in either part.
const existing = await figma.variables.getLocalVariableCollectionsAsync();
const cols = {};
for (const c of DATA.collections) {
  let col = existing.find((x) => x.name === c.name);
  if (!col) { col = figma.variables.createVariableCollection(c.name); report.made.push('collection ' + c.name); }
  c.modes.forEach((m, i) => {
    if (col.modes.some((x) => x.name === m)) return;
    if (i === 0 && !c.modes.includes(col.modes[0].name)) col.renameMode(col.modes[0].modeId, m);
    else col.addMode(m);
  });
  for (const m of col.modes.slice()) if (!c.modes.includes(m.name)) col.removeMode(m.modeId);
  cols[c.name] = col;
}
// A variable's collection, by the first part of its name (PACKED.owner).
const colOf = (name) => cols[PACKED.owner[name.split('/')[0]]];

// Every variable first, so an alias can name one made later.
const all = await figma.variables.getLocalVariablesAsync();
const byName = {};
for (const x of all) if (Object.values(cols).some((c) => c.id === x.variableCollectionId)) byName[x.name] = x;
for (const c of mine) {
  const col = cols[c.name], want = new Set(c.variables.map((x) => x.name));
  if (!PACKED.delta) for (const x of all.filter((y) => y.variableCollectionId === col.id)) if (!want.has(x.name)) { report.removed.push(x.name); x.remove(); delete byName[x.name]; }
  for (const d of c.variables) {
    let x = byName[d.name];
    if (x && x.resolvedType !== d.type) { x.remove(); x = null; }
    if (!x) { x = figma.variables.createVariable(d.name, col, d.type); byName[d.name] = x; report.made.push(d.name); }
  }
}
// One the other part writes, made empty if it isn't there yet: an alias has the type of what it names.
for (const c of mine) for (const d of c.variables) for (const a of Object.values(d.aliases)) if (!byName[a]) {
  if (!colOf(a)) throw new Error(`${d.name}: no collection holds ${a}`);
  byName[a] = figma.variables.createVariable(a, colOf(a), d.type); report.made.push(a + ' (empty, for its part)');
}
for (const c of mine) {
  const col = cols[c.name];
  for (const d of c.variables) {
    const x = byName[d.name];
    x.scopes = d.scopes;
    x.hiddenFromPublishing = !!d.hidden;
    if (d.codeSyntax) x.setVariableCodeSyntax('WEB', d.codeSyntax.WEB);
    for (const mode of col.modes) {
      const alias = d.aliases[mode.name], value = d.values[mode.name];
      if (alias) x.setValueForMode(mode.modeId, figma.variables.createVariableAlias(byName[alias]));
      else x.setValueForMode(mode.modeId, d.type === 'COLOR' ? rgb(value) : value);
    }
    report.updated++;
  }
}

// Text styles, one per role, bound to the Type variables, trimmed to the
// capitals and the baseline: in the part that writes Type. Every family any
// product names is loaded in every weight any product sets, so a frame can
// switch product.
const F = PACKED.fonts;
if (F) {
  const STYLE = { 100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black' };
  const fonts = await figma.listAvailableFontsAsync();
  const key = (s) => s.replace(/\s+/g, '').toLowerCase();
  const find = (fam, w) => fonts.find((x) => x.fontName.family === fam && key(x.fontName.style) === key(STYLE[w]));
  const fontFor = (fam, w) => { const f = find(fam, w); if (!f) throw new Error(`Figma has no ${fam} at ${w}; pick another stand-in in tools/figma-variables.js`); return f.fontName; };
  // A family may lack a weight another product sets (Alegreya Sans has no 600):
  // that pair is never drawn, so only a text style's own font must exist.
  for (const fam of F.families) for (const w of F.weights) { const f = find(fam, w); if (f) await figma.loadFontAsync(f.fontName); }
  const roles = [...new Set(mine.flatMap((c) => c.variables).map((x) => (x.name.match(/^type\/([a-z0-9]+)\/size$/) || [])[1]).filter(Boolean))];
  const styles = await figma.getLocalTextStylesAsync();
  for (const role of roles) {
    const heading = /^h\d$/.test(role), label = role === 'label' || role === 'eyebrow';
    const fam = heading ? 'font-heading' : 'font-sans', w = heading ? 'fw-heading' : label ? 'fw-label-text' : 'fw-body';
    const name = 'Trellis/' + role;
    let s = styles.find((x) => x.name === name);
    if (!s) { s = figma.createTextStyle(); s.name = name; report.made.push('style ' + name); }
    s.fontName = fontFor(F.core['font/' + fam], F.core['weight/' + w]);
    s.leadingTrim = 'CAP_HEIGHT';
    s.setBoundVariable('fontFamily', byName['type/' + fam]);
    s.setBoundVariable('fontWeight', byName['type/' + w]);
    s.setBoundVariable('fontSize', byName[`type/${role}/size`]);
    s.setBoundVariable('lineHeight', byName[`type/${role}/line`]);
    s.description = `Trellis .t-${role}: its size and line follow the frame's Type mode (Phone or Wide) and Product mode.`;
    report.styles.push(name);
  }
}

return { made: report.made.length, madeNames: report.made.slice(0, 40), updated: report.updated, removed: report.removed, styles: report.styles.length,
  collections: Object.values(cols).map((c) => ({ name: c.name, id: c.id, modes: c.modes.map((m) => m.name), variables: c.variableIds.length })) };
