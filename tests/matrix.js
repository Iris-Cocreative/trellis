// Trellis · the test matrix
// Runs align.js across screens, layers, themes and dials, and pixel.js in
// WebKit, a few at a time. The list below is the one in tests/README.md and
// the one CI runs.
// Usage: node matrix.js <url> [chromium|webkit|all] [--quick]
//        LAYER=name=<address> adds one outside product layer to the list.
// Needs Playwright (PLAYWRIGHT=module path). Exits 1 if anything is off.
const { spawn } = require('child_process');
const path = require('path');

const [url, engines = 'all', ...rest] = process.argv.slice(2);
if (!url) { console.error('usage: node matrix.js <url> [chromium|webkit|all] [--quick]'); process.exit(2); }
const quick = rest.includes('--quick');
const LIMIT = Number(process.env.JOBS || 4);

// neutral is core alone. quarry and almanac are the invented layers in examples/:
// between them they turn nearly every knob, which is what proves a product can
// reshape everything without redrawing anything.
const CHROMIUM = [
  ['1440x900', 'neutral', 'dark'],
  ['1440x900', 'quarry', 'light', 'outset'],
  ['1280x800', 'almanac', 'dark', 'math'],
  ['1024x768', 'neutral', 'light', 'css'],
  ['1280x800', 'neutral', 'dark', 'measure'],
  ['768x1024', 'quarry', 'dark'],
  ['393x852', 'neutral', 'dark', 'touch'],
  ['393x852', 'almanac', 'light', 'touch', 'u10'],
  ['375x812', 'quarry', 'light', 'touch', 'outset'],
  ['393x852', 'neutral', 'dark', 'touch', 'slow'],
];
const WEBKIT = [
  ['1440x900', 'neutral', 'dark', 'webkit'],
  ['1280x800', 'quarry', 'dark', 'webkit', 'outset'],
  ['393x852', 'quarry', 'light', 'touch', 'webkit'],
  ['393x852', 'neutral', 'dark', 'touch', 'webkit', 'u14'],
  ['440x956', 'almanac', 'light', 'touch', 'webkit', 'math'],
  ['375x812', 'neutral', 'dark', 'touch', 'webkit', 'outset'],
  ['852x393', 'almanac', 'dark', 'touch', 'webkit', 'math', 'outset'],
];
const PIXEL = ['393x852', '440x956'];

// One product layer from outside the repository: LAYER=name=<address>, where the
// address is a stylesheet a browser on this machine can reach. It runs through
// the same checks, in both engines, wide and on a phone.
const LAYER = process.env.LAYER;
if (LAYER) {
  if (!/^[a-z][a-z0-9-]*=.+\.css$/.test(LAYER)) { console.error('LAYER must be name=<address of a .css file>'); process.exit(2); }
  CHROMIUM.push(['1440x900', LAYER, 'dark', 'outset'], ['1024x768', LAYER, 'light', 'math'], ['393x852', LAYER, 'light', 'touch'], ['375x812', LAYER, 'dark', 'touch', 'outset']);
  WEBKIT.push(['1280x800', LAYER, 'light', 'webkit', 'outset'], ['393x852', LAYER, 'dark', 'touch', 'webkit'], ['440x956', LAYER, 'light', 'touch', 'webkit', 'math', 'outset']);
}

const jobs = [];
if (engines !== 'webkit') {
  (quick ? CHROMIUM.slice(0, 2) : CHROMIUM).forEach(a => jobs.push(['align.js', url, ...a]));
  jobs.push(['layers.js', url], ['layout.js', url, 'chromium', '1440x900'], ['layout.js', url, 'chromium', '393x852', 'touch'], ['math.js', url, 'chromium']);
}
if (engines !== 'chromium') {
  (quick ? WEBKIT.slice(2, 4) : WEBKIT).forEach(a => jobs.push(['align.js', url, ...a]));
  (quick ? PIXEL.slice(0, 1) : PIXEL).forEach(s => jobs.push(['pixel.js', url, s, 'webkit']));
  jobs.push(['layers.js', url, 'webkit'], ['layout.js', url, 'webkit', '1440x900'], ['layout.js', url, 'webkit', '393x852', 'touch'], ['math.js', url, 'webkit'], ['perf.js', url, 'webkit']);
}

let next = 0, failed = 0, done = 0;
function run() {
  if (next >= jobs.length) return;
  const args = jobs[next++];
  let out = '';
  const p = spawn(process.execPath, args.map((a, i) => (i ? a : path.join(__dirname, a))), { env: process.env });
  p.stdout.on('data', d => { out += d; });
  p.stderr.on('data', d => { out += d; });
  p.on('close', code => {
    done++;
    if (code) failed++;
    process.stdout.write((code ? 'FAIL ' : 'ok   ') + out.trimEnd() + '\n');
    if (done === jobs.length) {
      console.log(`\n${jobs.length - failed}/${jobs.length} passed`);
      process.exit(failed ? 1 : 0);
    }
    run();
  });
}
for (let i = 0; i < LIMIT; i++) run();
