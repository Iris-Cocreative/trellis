#!/usr/bin/env node
/* Trellis · figma-components · the Figma file's components, generated
   Prints a Figma plugin script, run after the variables (tools/figma-variables.js
   --plugin) in the same file. An agent's Figma tool takes 50,000 characters,
   so the components travel in parts, each the shared kit (tools/figma-kit.js:
   the variables by name, the fonts, the helpers), what it shares with other
   parts (figma-built.js: the components built so far; figma-photo.js: the
   stand-in picture) and its own body, wrapped so a run that fails takes back
   what it made, and sealed so it runs only as it was printed (figma-sealed.js):

     node tools/figma-components.js --plugin icons        Phosphor's icons, each
          the other parts use a component, in the section Icons, updated in place
     node tools/figma-components.js --plugin primitives   the first controls, each a
          component set named by its class chain, its variants the modifiers
          (`button` with kind=cc-ghost, size=cc-sm is class="button cc-ghost
          cc-sm"), each measure bound to the variable core reads, in the
          section Components (tools/figma-primitives.js)
     node tools/figma-components.js --plugin surfaces     fields, tabs, menus, rows,
          cards and dialogs, in the section Surfaces
     node tools/figma-components.js --plugin thread       the conversation: the
          messages and what they carry, in the section Thread
     node tools/figma-components.js --plugin templates    what is built from
          the primitives, in the section Templates: a grouped list, a member
          tile, a skeleton, a media frame, a covered card and row, the shell
          and its navigation
     node tools/figma-components.js --plugin screens      the section Screens
     node tools/figma-components.js --plugin settle       what can only be placed
          once the layout has settled, after the others
     node tools/figma-components.js                       each part's length

   Run them in that order. The icons are updated in place; the primitives
   remove every section after them, and each of the others builds its own again
   (and removes those made of it, so run the ones below it). Only those sections
   are touched: a designer's own frames elsewhere on the page are left alone,
   though an instance of a component they rebuilt is detached from it. */
'use strict';
const fs = require('fs');
const path = require('path');

const { seal, bare } = require('./figma-sealed.js');
const PARTS = {
  icons: ['figma-icons.js'],
  primitives: ['figma-primitives.js'],
  surfaces: ['figma-built.js', 'figma-surfaces.js'],
  thread: ['figma-built.js', 'figma-photo.js', 'figma-thread.js'],
  templates: ['figma-built.js', 'figma-photo.js', 'figma-templates.js'],
  screens: ['figma-built.js', 'figma-screens.js'],
  settle: ['figma-settle.js']
};
const read = (f) => bare(fs.readFileSync(path.join(__dirname, f), 'utf8'));
// The icons the other parts name are the ones the icons part makes.
const used = () => [...new Set(['figma-kit.js', ...Object.entries(PARTS).filter(([p]) => p !== 'icons').flatMap(([, f]) => f)].flatMap((f) => [...read(f).matchAll(/'(ph-[a-z-]+)'/g)].map((m) => m[1])))].sort();
const phosphor = () => { const P = require('./figma-phosphor.js'); return [P.icons(used()), P.notice()]; };
const script = (part) => {
  if (part === 'settle') return seal('figma-components --plugin settle', read('figma-settle.js'));
  let body = `${read('figma-kit.js')}\ntry {\n${PARTS[part].map(read).join('')}\n} catch (e) {\nfor (const n of page.children.slice()) if (!before.has(n.id)) n.remove();\nthrow e;\n}\n`;
  if (part === 'icons') { const [icons, notice] = phosphor(); body = body.replace('/*ICONS*/null', () => '[\n' + icons.map((x) => JSON.stringify(x)).join(',\n') + '\n]').replace('/*NOTICE*/null', () => JSON.stringify(notice)); }
  return seal('figma-components --plugin ' + part, body);
};
module.exports = { PARTS, script };

if (require.main === module) {
  const args = process.argv.slice(2), i = args.indexOf('--plugin');
  if (i < 0) for (const p of Object.keys(PARTS)) console.log(`${p}: ${script(p).length} characters`);
  else if (!PARTS[args[i + 1]]) { console.error(`--plugin takes one of: ${Object.keys(PARTS).join(', ')}`); process.exit(1); }
  else process.stdout.write(script(args[i + 1]));
}
