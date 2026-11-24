#!/usr/bin/env node
/* Trellis · figma-components · the Figma file's components, generated
   Prints a Figma plugin script, run after the variables (tools/figma-variables.js
   --plugin) in the same file. An agent's Figma tool takes 50,000 characters,
   so the components travel in two parts, each the shared kit
   (tools/figma-kit.js: the variables by name, the fonts, the helpers) and then
   its own body, wrapped so a run that fails takes back what it made:

     node tools/figma-components.js --plugin primitives   every primitive as a
          component set named by its class chain, its variants the modifiers
          (`button` with kind=cc-ghost, size=cc-sm is class="button cc-ghost
          cc-sm"), each measure bound to the variable core reads, in the
          section Components (tools/figma-primitives.js)
     node tools/figma-components.js --plugin templates    what is built from
          them, in the section Templates: the bubble, a grouped list, a member
          tile, a skeleton, a media frame, a covered card and row, the shell
          and its navigation; then the Screens
          (tools/figma-templates.js)
     node tools/figma-components.js                       each part's length

   Run them in that order, and both whenever the code changes: the first
   removes all three sections, the second builds two of them again. A
   designer's own frames elsewhere on the page are left alone, though an
   instance of a component they rebuilt is detached from it. */
'use strict';
const fs = require('fs');
const path = require('path');

const PARTS = { primitives: 'figma-primitives.js', templates: 'figma-templates.js' };
const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8').replace(/\r\n/g, '\n');
const script = (part) => `${read('figma-kit.js')}\ntry {\n${read(PARTS[part])}\n} catch (e) {\n  for (const n of page.children.slice()) if (!before.has(n.id)) n.remove();\n  throw e;\n}\n`;
module.exports = { PARTS, script };

if (require.main === module) {
  const args = process.argv.slice(2), i = args.indexOf('--plugin');
  if (i < 0) for (const p of Object.keys(PARTS)) console.log(`${p}: ${script(p).length} characters`);
  else if (!PARTS[args[i + 1]]) { console.error(`--plugin takes one of: ${Object.keys(PARTS).join(', ')}`); process.exit(1); }
  else process.stdout.write(script(args[i + 1]));
}
