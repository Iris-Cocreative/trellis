// Trellis · package test. What an installed consumer gets, from the real tarball.
// `npm pack`, then install the tarball into a clean consumer in a temporary
// folder, and from there:
//   the tarball carries what the documented workflow needs, and nothing of the
//     repository's own (no tests/, docs/ or examples/)
//   the runtimes, imported by their public paths, survive an optimized esbuild
//     bundle, and in each browser engine settle.js, float.js and presets.js
//     initialize their window.Trellis APIs. A control bundle with the old
//     sideEffects list proves the check would see them dropped
//   trellis-check reports violations, and exits 1 when a count rises past its budget
//   trellis-product accepts a valid product layer and rejects an invalid one
//   every installed path and command the packaged docs name exists
// Needs npm and the network (it installs esbuild into the consumer), and
// Playwright (PLAYWRIGHT=module path) for the engines named:
//   node tests/package.js                 chromium and webkit
//   node tests/package.js chromium        one engine
// ESBUILD=<version> overrides the pinned esbuild. KEEP=1 keeps the folder.
// Exits 1 if anything is off.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const repo = path.join(__dirname, '..');
const ENGINES = process.argv.slice(2).length ? process.argv.slice(2) : ['chromium', 'webkit'];
const ESBUILD = process.env.ESBUILD || '0.25.12';
const NAME = '@iris-cocreative/trellis';
const fails = [];
let passed = 0;
const check = (ok, what) => { if (ok) passed++; else fails.push(what); };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'trellis-package-'));
const consumer = path.join(tmp, 'consumer');
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
// A command as a consumer types it, with its exit code and everything it printed.
const run = (cmd, cwd = consumer) => {
  const r = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
};

async function main() {
  // ---- The tarball -----------------------------------------------------------
  const packed = JSON.parse(sh(`npm pack --json --pack-destination "${tmp}"`, repo))[0];
  const tarball = path.join(tmp, packed.filename);
  const inTar = new Set(packed.files.map((f) => f.path.replace(/\\/g, '/')));
  const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
  const need = new Set([...Object.values(pkg.exports), ...Object.values(pkg.bin || {}), 'skill/SKILL.md', 'skill/ADOPT.md', 'README.md', 'REACT.md', 'LICENSE']
    .map((f) => f.replace(/^\.\//, '')));
  for (const f of need) check(inTar.has(f), `the tarball has no ${f}`);
  for (const f of inTar) check(!/^(tests|docs|examples|experiments|brand)\//.test(f), `the tarball carries ${f}, which is the repository's own`);

  // ---- A clean consumer ------------------------------------------------------
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({ name: 'trellis-consumer', version: '1.0.0', private: true }, null, 2));
  sh(`npm install --no-audit --no-fund "${tarball}" esbuild@${ESBUILD}`, consumer);
  const installed = path.join(consumer, 'node_modules', ...NAME.split('/'));
  check(fs.existsSync(path.join(installed, 'package.json')), `${NAME} did not install from the tarball`);

  // ---- The runtimes through an optimized bundle -------------------------------
  const esbuild = require(require.resolve('esbuild', { paths: [consumer] }));
  const entry = path.join(consumer, 'entry.js');
  fs.writeFileSync(entry, [`import '${NAME}/settle.js';`, `import '${NAME}/float.js';`, `import '${NAME}/presets.js';`, ''].join('\n'));
  const bundle = async () => {
    const r = await esbuild.build({ entryPoints: [entry], bundle: true, minify: true, treeShaking: true, format: 'iife', platform: 'browser', write: false, logLevel: 'silent', absWorkingDir: consumer });
    return { code: r.outputFiles[0].text, dropped: r.warnings.filter((w) => w.id === 'ignored-bare-import').map((w) => w.text) };
  };
  const built = await bundle();
  check(!built.dropped.length, `esbuild dropped a runtime import: ${built.dropped.join('; ')}`);
  // The control: the sideEffects list as it was (CSS and settle.js alone) loses
  // float.js and presets.js, so this test would see that regression.
  const pkgFile = path.join(installed, 'package.json'), shipped = fs.readFileSync(pkgFile, 'utf8');
  const old = JSON.parse(shipped); old.sideEffects = ['*.css', 'settle.js'];
  fs.writeFileSync(pkgFile, JSON.stringify(old));
  const control = await bundle();
  fs.writeFileSync(pkgFile, shipped);
  check(control.dropped.length === 2, `control: with the old sideEffects esbuild should drop float.js and presets.js; it dropped ${control.dropped.length}`);
  // esbuild's service holds its binary open, and Windows won't delete a file in use.
  await esbuild.stop();

  const pw = require(process.env.PLAYWRIGHT || 'playwright');
  for (const engine of ENGINES) {
    const browser = await pw[engine].launch();
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.setContent('<!doctype html><html><head></head><body><p>Text</p><div class="float" popover="manual">Float</div><button>Anchor</button></body></html>');
      await page.addScriptTag({ content: built.code });
      const got = await page.evaluate(async () => {
        const T = window.Trellis || {};
        const settled = typeof T.settled === 'function' ? await Promise.race([T.settled().then(() => true), new Promise((r) => setTimeout(() => r(false), 5000))]) : false;
        return {
          settle: ['fit', 'cell', 'all', 'observe', 'settled'].every((k) => typeof T[k] === 'function'), settled,
          float: !!T.float && ['open', 'toggle', 'close', 'place'].every((k) => typeof T.float[k] === 'function'),
          presets: Array.isArray(T.presets) && T.presets.includes('detents') && typeof T.transition === 'function',
        };
      });
      check(got.settle, `${engine}: settle.js did not set window.Trellis.fit, cell, all, observe and settled`);
      check(got.settled, `${engine}: Trellis.settled() did not resolve`);
      check(got.float, `${engine}: float.js did not set window.Trellis.float`);
      check(got.presets, `${engine}: presets.js did not set window.Trellis.presets and transition`);
      check(!errors.length, `${engine}: the bundle threw: ${errors.join('; ')}`);
    } finally {
      // WebKit on Windows can leave close() unanswered; don't wait on it forever.
      await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 5000))]);
    }
  }

  // ---- trellis-check, the app-source checker ----------------------------------
  const src = path.join(consumer, 'src');
  fs.mkdirSync(src);
  fs.writeFileSync(path.join(src, 'app.css'), '.app-panel { padding: var(--sp-2); }\n');
  let r = run('npx --no trellis-check src');
  check(r.code === 0, `trellis-check src exited ${r.code}: ${r.out.slice(0, 300)}`);
  check(/1 files · core: \d+ classes/.test(r.out), `trellis-check did not read core.css from the package: ${r.out.slice(0, 300)}`);
  r = run('npx --no trellis-check src --budget check.budget.json --write');
  check(r.code === 0 && fs.existsSync(path.join(consumer, 'check.budget.json')), `trellis-check --write did not write the budget: ${r.out.slice(0, 300)}`);
  fs.writeFileSync(path.join(src, 'app.css'), '.app-panel { padding: 13px; color: #f00; }\n');
  r = run('npx --no trellis-check src --json');
  const counts = (() => { try { return JSON.parse(r.out).total; } catch (e) { return {}; } })();
  check(counts['raw-lengths'] === 1 && counts['raw-colors'] === 1, `trellis-check should count one raw length and one raw color: ${JSON.stringify(counts)}`);
  r = run('npx --no trellis-check src --budget check.budget.json');
  check(r.code === 1 && /over budget/.test(r.out), `trellis-check over its budget should exit 1 and say so; exited ${r.code}: ${r.out.slice(-300)}`);
  // The documented long form, by path, as the skill writes it.
  r = run(`node node_modules/${NAME}/tools/check.js src --show raw-colors`);
  check(r.code === 0 && /app\.css:1/.test(r.out), `node node_modules/${NAME}/tools/check.js --show did not list the hit: ${r.out.slice(0, 300)}`);

  // ---- trellis-product, the product-layer validator ---------------------------
  fs.copyFileSync(path.join(installed, 'product.template.css'), path.join(consumer, 'product.css'));
  fs.writeFileSync(path.join(consumer, 'mine.css'), '@layer trellis.product {\n  :root[data-product="mine"] {\n    --seed-accent: oklch(0.55 0.15 250);\n    --h1-max: 64;\n  }\n  [data-product="lodge"] {\n    --seed-accent: oklch(0.5 0.12 40);\n  }\n}\n');
  fs.writeFileSync(path.join(consumer, 'bad.css'), '@layer trellis.product {\n  :root[data-product="bad"] {\n    --seed-accent: oklch(0.97 0.02 90);\n    --not-a-knob: 3;\n    padding: 4px;\n  }\n}\n');
  r = run('npx --no trellis-product product.css mine.css');
  check(r.code === 0 && /mine\.css: 2 knobs, 2 scopes · ok/.test(r.out), `trellis-product should accept the template and a valid layer; exited ${r.code}: ${r.out.slice(0, 400)}`);
  r = run('npx --no trellis-product bad.css');
  check(r.code === 1, `trellis-product should reject an invalid layer; exited ${r.code}`);
  for (const why of ['something other than a variable', "--not-a-knob, which product.template.css doesn't list", 'contrast:'])
    check(r.out.includes(why), `trellis-product did not report "${why}" for the invalid layer`);
  r = run(`node node_modules/${NAME}/tools/product.js mine.css`);
  check(r.code === 0, `node node_modules/${NAME}/tools/product.js exited ${r.code}`);
  r = run(`node -e "const P = require('${NAME}/tools/product.js'); process.exit(P.validate(require('fs').readFileSync('bad.css', 'utf8')).fails.length ? 0 : 1)"`);
  check(r.code === 0, `require('${NAME}/tools/product.js').validate() did not reject the invalid layer: ${r.out.slice(0, 300)}`);

  // ---- What the packaged docs name --------------------------------------------
  const docs = ['README.md', 'REACT.md', 'skill/SKILL.md', 'skill/ADOPT.md'].map((f) => fs.readFileSync(path.join(installed, f), 'utf8')).join('\n');
  // A file or a folder, as a sentence may end on it.
  const paths = new Set([...docs.matchAll(new RegExp(`node_modules/${NAME}/([\\w./-]+)`, 'g'))].map((m) => m[1].replace(/\.+$/, '')));
  check(paths.size >= 2, `the packaged docs name only ${paths.size} installed paths`);
  for (const f of paths) check(fs.existsSync(path.join(installed, f)), `the docs name node_modules/${NAME}/${f}, which the package doesn't carry`);
  const imports = new Set([...docs.matchAll(new RegExp(`['"]${NAME}/([\\w./-]+)['"]`, 'g'))].map((m) => m[1]));
  for (const f of imports) {
    let ok = true; try { require.resolve(`${NAME}/${f}`, { paths: [consumer] }); } catch (e) { ok = f.endsWith('.css') && fs.existsSync(path.join(installed, f)); }
    check(ok, `the docs import ${NAME}/${f}, which doesn't resolve`);
  }
  const bins = new Set([...docs.matchAll(/npx (?:--no )?(trellis-[a-z]+)/g)].map((m) => m[1]));
  check(bins.size >= 2, `the packaged docs name only ${bins.size} commands`);
  for (const b of bins) check(run(`npx --no ${b}`).code === 2, `npx ${b} does not resolve to its usage line`);
}

main().catch((e) => fails.push(`threw: ${e.stack || e.message}`)).finally(() => {
  if (process.env.KEEP) console.log(`kept ${tmp}`);
  else try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 }); } catch (e) { console.log(`couldn't remove ${tmp}: ${e.code}`); }
  console.log(`package: ${passed} checks, ${ENGINES.join(' and ')} · ${fails.length ? fails.length + ' FAILED' : 'ok'}`);
  fails.forEach((f) => console.log('  ' + f));
  process.exit(fails.length ? 1 : 0);
});
