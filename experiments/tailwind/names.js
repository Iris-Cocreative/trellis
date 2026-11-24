// Trellis · Tailwind spike · shared names
// Two kinds of name both sides use, found with the real Tailwind:
//   classes   every class core.css styles that Tailwind also turns into a
//             utility, so the one class gets both rules
//   tokens    every custom property core.css declares that Tailwind's default
//             theme also declares on :root, so whichever layer is higher wins it
// Writes dist/names.json, the list D110 cites. Usage: node names.js
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');

const here = __dirname;
const core = fs.readFileSync(path.join(here, '../../core.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

// Every class a core.css selector names. Values (decimals like .5, urls) are
// not selectors, so only the part before each block's brace is read.
const classes = new Set();
for (const m of core.matchAll(/([^{}]+)\{/g)) {
  if (/^\s*@/.test(m[1])) continue;
  for (const c of m[1].matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)) classes.add(c[1]);
}
const tokens = new Set([...core.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));

(async () => {
  const list = [...classes].sort();
  // Tailwind writes a rule only for a candidate it can make a utility of.
  const css = `@import "tailwindcss" source(none);\n@source inline("${list.join(' ')}");`;
  const out = await postcss([tailwind({ base: here, optimize: false })]).process(css, { from: path.join(here, 'names.css') });
  const made = new Set();
  out.root.walkRules(r => { for (const c of r.selector.matchAll(/\.((?:\\.|[\w-])+)/g)) made.add(c[1].replace(/\\/g, '')); });
  const clash = list.filter(c => made.has(c));
  // Tailwind writes a theme variable only once something uses it, so the
  // default theme is read from its source: any of these can reach :root.
  const themeCss = fs.readFileSync(require.resolve('tailwindcss/theme.css'), 'utf8');
  const theme = new Set([...themeCss.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
  const shared = [...tokens].filter(t => theme.has(t)).sort();
  const report = { tailwind: require('tailwindcss/package.json').version, classes: clash, tokens: shared };
  fs.mkdirSync(path.join(here, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(here, 'dist/names.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`${list.length} classes in core.css, ${clash.length} also Tailwind utilities: ${clash.join(' ')}`);
  console.log(`${tokens.size} tokens in core.css, ${shared.length} also in Tailwind's default theme: ${shared.join(' ')}`);
})().catch(e => { console.error(e); process.exit(1); });
