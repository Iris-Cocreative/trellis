// Trellis · Tailwind spike · build
// Compiles the two entries with the real Tailwind v4, through the same PostCSS
// plugin an app uses (@tailwindcss/postcss), into dist/, which is committed so
// the page and its tests run without an install.
//   dist/app.css             app.css as `next dev` would build it (no optimizing)
//   dist/app-unguarded.css   the same without its @source not inline line
//   dist/bundle.css          bundle.css (the statement, app.css, core.css) as a
//                            production build would: Lightning CSS minifies and lowers it
//   dist/core.sha256         the core.css the bundle was built from
// Usage: npm install, then node build.js. Rebuild when core.css changes:
// tests/tailwind.js skips a stale bundle and says so. CI always rebuilds.
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const { coreHash } = require('./hash');

const here = __dirname;
const GUARD = /^@source not inline\(.*\);\r?\n/m;
const builds = [
  { from: 'app.css', to: 'dist/app.css', optimize: false },
  { from: 'app.css', to: 'dist/app-unguarded.css', optimize: false, edit: css => css.replace(GUARD, '') },
  { from: 'bundle.css', to: 'dist/bundle.css', optimize: { minify: true } },
];

(async () => {
  fs.mkdirSync(path.join(here, 'dist'), { recursive: true });
  for (const b of builds) {
    const from = path.join(here, b.from), to = path.join(here, b.to);
    let css = fs.readFileSync(from, 'utf8');
    if (b.edit) { const was = css; css = b.edit(css); if (css === was) throw new Error(`${b.to}: the edit found nothing to change`); }
    // The plugin caches a build by the file it came from, so an edited copy
    // names a file of its own (beside the source, so its imports resolve).
    const as = b.edit ? path.join(here, path.basename(b.to)) : from;
    const out = await postcss([tailwind({ base: here, optimize: b.optimize })]).process(css, { from: as, to });
    fs.writeFileSync(to, out.css);
    console.log(`${b.to}: ${(out.css.length / 1024).toFixed(1)} KB${b.optimize ? ', optimized' : ''}`);
  }
  fs.writeFileSync(path.join(here, 'dist/core.sha256'), coreHash() + '\n');
})().catch(e => { console.error(e); process.exit(1); });
