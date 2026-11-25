/* Trellis · figma-sealed · a plugin script that runs only as it was printed
   A script reaches Figma by being copied, whole, into a tool that can't fetch
   it. So each one is printed as a function beside a hash of its own source,
   and refuses to run when the two differ: what ran in the file is what the
   repository holds. A tool may print a script again before it runs it (some
   are, some aren't), so spaces, line ends, commas, semicolons and round
   brackets are left out of the hash; every name, number, string and operator
   is in it. When it refuses, it answers with a hash of each line, to find the
   line that changed: node tools/figma-sealed.js <printed script> prints the
   same. */
'use strict';
const hash = (s) => { let h = 0x811c9dc5; for (const ch of s.replace(/[\s;,()]/g, '')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };
const lines = (src) => src.split('\n').map((l) => hash(l).slice(-3)).join(' ');
// A whole script without its file headers, its comments after a line or on their own, and its indents, which stay in the repository.
const bare = (src) => src.replace(/\r\n/g, '\n').replace(/^\/\*[\s\S]*?\*\/\n/, '').replace(/^[ \t]*\/\/.*\n/gm, '').replace(/ {3}\/\/ .*$/gm, '').replace(/^[ \t]+/gm, '');
const seal = (name, body) => {
  const run = `async () => {\n${body.trim()}\n}`;
  return `// Trellis ${name}
const RUN = ${run};
const hash = ${hash.toString()};
if (hash(RUN.toString()) !== '${hash(run)}') throw new Error('Not the script that was printed; its lines: ' + RUN.toString().split('\\n').map((l) => hash(l).slice(-3)).join(' '));
return await RUN();
`;
};
module.exports = { seal, bare };

if (require.main === module) {
  const src = require('fs').readFileSync(process.argv[2], 'utf8');
  console.log(lines(src.slice(src.indexOf('async () => {'), src.lastIndexOf('\n};\nconst hash = ') + 2)));
}
