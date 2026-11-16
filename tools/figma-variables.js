#!/usr/bin/env node
/* Trellis · figma-variables · the Figma file's variables, generated
   Code is the source and the Figma file is generated from it (the Figma
   conventions). This reads tokens.json through math.js, the same arithmetic
   core.css does, and writes the variables a Figma file holds, resolved:

     Space   Phone and Wide   the cell, the counts, control and icon sizes, corners
     Type    Phone and Wide   each role's size and line height; families, weights
     Color   Light and Dark   every role, from the one seed

   Figma holds a number per mode and no arithmetic, so each value is worked out
   here at the two screens the modes stand for (a 393pt phone and a 1440pt
   wide screen) and written as a number. What that loses is written down in
   docs/figma/README.md. Each variable is named as its CSS variable, with
   its code syntax set to it, so a designer's file reads in the code's words.

   node tools/figma-variables.js              the collections as JSON, on stdout
   node tools/figma-variables.js --out FILE   written to FILE
   node tools/figma-variables.js --tokens FILE   another token file (a product's) */
'use strict';
const fs = require('fs');
const path = require('path');
const M = require('../math.js');

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
const tokens = JSON.parse(fs.readFileSync(flag('--tokens') || path.join(__dirname, '..', 'tokens.json'), 'utf8'));
const seed = M.seedFromTokens(tokens);

// The two screens the modes stand for.
const SCREENS = { Phone: { width: 393, dpr: 3 }, Wide: { width: 1440, dpr: 2 } };
const cellAt = (s) => {
  const target = M.cellTarget({ width: s.width }, seed);
  return s.width < seed.cell.screenWide ? M.fit({ width: s.width, target, dpr: s.dpr }, seed).cell : M.wholeCell(target);
};
const CELL = Object.fromEntries(Object.entries(SCREENS).map(([m, s]) => [m, cellAt(s)]));
const round = (v) => Math.round(v * 1000) / 1000;
const vals = (pick) => ({ type: 'FLOAT', values: Object.fromEntries(Object.keys(SCREENS).map((m) => [m, round(pick(m))])) });
// A role's size and line height are a class in the code (.t-h1), not a variable.
const syntax = (name) => { const m = name.match(/^type\/([a-z0-9]+)\/(size|line)$/); return m ? '.t-' + m[1] : `var(--${name.split('/').pop()})`; };
const v = (name, def, scopes) => Object.assign({ name, codeSyntax: { WEB: syntax(name) }, scopes }, def);
const $ = (group, key) => { const n = tokens[group][key]; return n && n.$value !== undefined ? n.$value : n; };
const keys = (o) => Object.keys(o).filter((k) => k[0] !== '$');

/* ---- Space ------------------------------------------------------------------ */
const space = [v('space/u', vals((m) => CELL[m]), ['GAP', 'WIDTH_HEIGHT'])];
const spName = (k) => 'sp-' + k;
for (const k of keys(tokens.space)) space.push(v('space/' + spName(k), vals((m) => CELL[m] * $('space', k)), ['GAP', 'WIDTH_HEIGHT']));
space.push(v('space/line', vals(() => 1), ['STROKE_FLOAT']));
for (const k of keys(tokens.size.control)) space.push(v('size/size-control-' + k, vals((m) => CELL[m] * tokens.size.control[k].$value), ['WIDTH_HEIGHT']));
for (const k of keys(tokens.size.icon)) space.push(v('size/size-icon' + (k === 'base' ? '' : '-' + k), vals((m) => CELL[m] * tokens.size.icon[k].$value), ['WIDTH_HEIGHT']));
space.push(v('size/hit-min', vals(() => tokens.size['hit-min'].$value), ['WIDTH_HEIGHT']));
for (const k of keys(tokens.radius)) {
  const n = tokens.radius[k].$value;
  space.push(v('radius/r-' + k, vals((m) => (n >= 999 ? 999 : CELL[m] * n)), ['CORNER_RADIUS']));
}

/* ---- Type ------------------------------------------------------------------- */
const type = [];
const ROLE_NAME = (r) => (/^h\d$/.test(r) ? r : r);
for (const role of Object.keys(M.ROLES)) {
  type.push(v(`type/${ROLE_NAME(role)}/size`, vals((m) => M.typeSize(role, SCREENS[m].width, {}, seed)), ['FONT_SIZE']));
  type.push(v(`type/${ROLE_NAME(role)}/line`, vals((m) => M.lineHeight(role, M.typeSize(role, SCREENS[m].width, {}, seed), CELL[m], seed)), ['LINE_HEIGHT']));
}
for (const k of keys(tokens['control-type'])) type.push(v('type/control/fs-control' + (k === 'base' ? '' : '-' + k), vals(() => tokens['control-type'][k].$value), ['FONT_SIZE']));
const str = (s) => ({ type: 'STRING', values: Object.fromEntries(Object.keys(SCREENS).map((m) => [m, s])) });
type.push(v('type/font-sans', str('Inter'), ['FONT_FAMILY']));
type.push(v('type/font-serif', str('Georgia'), ['FONT_FAMILY']));
for (const [n, w] of [['fw-body', 400], ['fw-heading', 500], ['fw-label', 500], ['fw-strong', 600]]) type.push(v('type/' + n, vals(() => w), ['FONT_WEIGHT']));

/* ---- Color ------------------------------------------------------------------ */
const light = M.palette('light', seed), dark = M.palette('dark', seed);
// Scoped by role: a ground is a fill, an ink is text, an edge is a stroke; a
// hue (the accent, a kind, a status) can be any of the three.
const colorScopes = (k) => /^bg/.test(k) ? ['FRAME_FILL', 'SHAPE_FILL'] : /^text|-ink$/.test(k) ? ['TEXT_FILL', 'SHAPE_FILL'] : /^border|^focus$/.test(k) ? ['STROKE_COLOR'] : ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR'];
const color = Object.keys(light).map((k) => v('color/' + k, { type: 'COLOR', values: { Light: M.hex(light[k]), Dark: M.hex(dark[k]) } }, colorScopes(k)));

const out = {
  $description: 'Trellis variables for Figma, generated by tools/figma-variables.js from tokens.json and math.js. Do not edit; regenerate.',
  screens: SCREENS,
  collections: [
    { name: 'Space', modes: Object.keys(SCREENS), variables: space },
    { name: 'Type', modes: Object.keys(SCREENS), variables: type },
    { name: 'Color', modes: ['Light', 'Dark'], variables: color }
  ]
};
const json = JSON.stringify(out, null, 2) + '\n';
const to = flag('--out');
if (to) { fs.writeFileSync(to, json); console.log(`${out.collections.map((c) => `${c.name} ${c.variables.length}`).join(' · ')} → ${to}`); }
else process.stdout.write(json);
