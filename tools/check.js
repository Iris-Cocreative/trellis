#!/usr/bin/env node
/* Trellis · check · does an app keep the foundation's rules?
   No browser and no dependencies. Point it at an app's stylesheets, scripts and
   pages, and it counts what the enforcement rules forbid:

     raw lengths      a px or rem length in a declaration (not a token, not cells)
     raw type         a font-size that is not a token or an em
     raw colors       a hex, rgb(), hsl() or literal oklch() color
     raw radii        a border-radius that is not a token or a percentage
     restyled         a declaration, other than a variable, on a core primitive
     product layer    a variable in @layer trellis.product that is not a knob
     inline styles    a style set from script or markup that is not a variable
     own classes      classes the app defines itself (a count, never a failure)

   node tools/check.js <file or folder> ...          report, exit 0
   node tools/check.js ... --budget check.json       fail if any count rose
   node tools/check.js ... --budget check.json --write   record today's counts
   node tools/check.js ... --show raw-type           list every hit of one kind
   node tools/check.js ... --json                    the counts as JSON

   A budget only ever goes down: an app adopts the foundation one file at a
   time, and this keeps what it has gained. */
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const has = (name) => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };
const budgetPath = flag('--budget');
const show = flag('--show');
const corePath = flag('--core') || path.join(root, 'core.css');
const write = has('--write');
const asJson = has('--json');
if (!args.length) { console.error('usage: node tools/check.js <file or folder> ... [--budget file [--write]] [--show kind] [--json]'); process.exit(2); }

const KINDS = ['raw-lengths', 'raw-type', 'raw-colors', 'raw-radii', 'restyled', 'product-layer', 'inline-styles'];
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
const classesIn = (text) => new Set((text.match(/\.[a-zA-Z_][\w-]*/g) || []).map((c) => c.slice(1)));

const core = strip(fs.readFileSync(corePath, 'utf8'));
const coreClasses = classesIn(core.replace(/url\([^)]*\)|"[^"]*"|'[^']*'/g, ''));
const knobs = new Set((fs.readFileSync(path.join(root, 'product.template.css'), 'utf8').match(/^\s*--[\w-]+(?=:)/gm) || []).map((k) => k.trim()));

/* ---- gather the files ---------------------------------------------------- */
const SKIP = new Set(['node_modules', 'vendor', '.git', 'data', 'dist', 'build']);
const files = [];
const walk = (p) => {
  const st = fs.statSync(p);
  if (st.isDirectory()) { for (const n of fs.readdirSync(p)) if (!SKIP.has(n) && !n.startsWith('.')) walk(path.join(p, n)); }
  else if (/\.(css|js|mjs|jsx|tsx|ts|html)$/.test(p)) files.push(p);
};
args.forEach(walk);

/* ---- a small CSS walker: every declaration, with the rules around it ----- */
function declarations(css, each) {
  let i = 0; const stack = [];
  const line = (at) => css.slice(0, at).split('\n').length;
  while (i < css.length) {
    const rest = css.slice(i);
    const m = rest.match(/[{};]/);
    if (!m) break;
    const end = i + m.index, chunk = css.slice(i, end).trim();
    if (m[0] === '{') stack.push(chunk);
    else {
      if (chunk) {
        const c = chunk.indexOf(':');
        if (c > 0) each(chunk.slice(0, c).trim(), chunk.slice(c + 1).trim(), stack, line(end - chunk.length));
      }
      if (m[0] === '}') stack.pop();
    }
    i = end + 1;
  }
}

const hits = [];
const hit = (kind, file, line, text) => hits.push({ kind, file, line, text });
const ownClasses = new Set();

const RAW_LEN = /(?<![\w.#-])-?(?:\d*\.)?\d+(?:px|rem)\b/g;
const isZero = (v) => /^-?0*\.?0+(px|rem)$/.test(v);
const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(|\boklch\((?!\s*from\b)|\boklab\((?!\s*from\b)/g;

function checkCss(file, text) {
  const css = strip(text);
  declarations(css, (prop, value, stack, line) => {
    const rule = stack[stack.length - 1] || '';
    if (/^@|^(from|to|\d+%)/.test(rule.trim()) && !/^@(layer|media|container|supports|scope)/.test(rule.trim())) { /* keyframes and the like still count below */ }
    const inProduct = stack.some((s) => /^@layer\s+trellis\.product\b/.test(s));
    const where = `${prop}: ${value}`.slice(0, 110);
    if (inProduct) {
      if (!prop.startsWith('--')) hit('product-layer', file, line, `${where}   (a product layer only sets variables)`);
      else if (!knobs.has(prop)) hit('product-layer', file, line, `${where}   (not a knob in product.template.css)`);
      return;
    }
    const bare = value.replace(/var\(\s*--[\w-]+\s*,/g, 'var(');   // a fallback inside var() still counts; keep it
    if (prop === 'font-size') { if (!/^(var\(|calc\(var\(|[\d.]+em$|inherit|0$)/.test(value) || /\d(px|rem)\b/.test(value.replace(/var\([^)]*\)/g, ''))) hit('raw-type', file, line, where); }
    else if (/^border(-[\w]+)*-radius$/.test(prop)) { if (/\d(px|rem)\b/.test(value.replace(/var\([^()]*\)/g, ''))) hit('raw-radii', file, line, where); }
    else for (const v of bare.match(RAW_LEN) || []) if (!isZero(v)) hit('raw-lengths', file, line, `${where}   → ${v}`);
    for (const c of value.match(RAW_COLOR) || []) hit('raw-colors', file, line, `${where}   → ${c}`);
    // a declaration on a core primitive that is not a variable redraws it
    if (!prop.startsWith('--') && rule && !rule.startsWith('@')) {
      for (const part of rule.split(',')) {
        const subject = part.trim().split(/[\s>+~]+/).pop().replace(/::?[\w-]+(\([^)]*\))?/g, '');
        const cls = [...classesIn(subject)];
        if (cls.length && cls.every((c) => coreClasses.has(c))) { hit('restyled', file, line, `${part.trim()} { ${where} }`); break; }
      }
    }
  });
  // classes the app defines itself
  css.replace(/([^{}]*)\{/g, (_, sel) => { if (!sel.trim().startsWith('@')) for (const c of classesIn(sel)) if (!coreClasses.has(c)) ownClasses.add(c); return ''; });
}

function checkScript(file, text) {
  const lines = text.split('\n');
  lines.forEach((l, n) => {
    for (const m of l.matchAll(/\.style\.([a-zA-Z]+)\s*=(?!=)/g)) if (m[1] !== 'cssText' || true) hit('inline-styles', file, n + 1, l.trim().slice(0, 110));
    for (const m of l.matchAll(/\bstyle=(["'`])((?:(?!\1).)*)/g)) {
      const body = m[2].replace(/\$\{[^}]*\}/g, 'X');
      const props = body.split(';').map((d) => d.split(':')[0].trim()).filter(Boolean);
      if (props.some((p) => !p.startsWith('--'))) hit('inline-styles', file, n + 1, m[0].slice(0, 110));
    }
    for (const m of l.matchAll(/\bstyle=\{\{([^}]*)\}\}/g)) if (/(^|,)\s*[a-zA-Z]+\s*:/.test(m[1])) hit('inline-styles', file, n + 1, m[0].slice(0, 110));
  });
}

for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  if (f.endsWith('.css')) checkCss(f, text);
  else {
    checkScript(f, text);
    if (f.endsWith('.html')) for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) checkCss(f, m[1]);
  }
}

/* ---- report --------------------------------------------------------------- */
const rel = (f) => path.relative(process.cwd(), f).replace(/\\/g, '/');
const counts = {};
for (const f of files) counts[rel(f)] = Object.fromEntries(KINDS.map((k) => [k, 0]));
for (const h of hits) counts[rel(h.file)][h.kind]++;
const total = Object.fromEntries(KINDS.map((k) => [k, hits.filter((h) => h.kind === k).length]));

if (show) {
  for (const h of hits.filter((x) => x.kind === show)) console.log(`${rel(h.file)}:${h.line}  ${h.text}`);
  console.log(`\n${total[show] ?? 0} ${show}`);
  process.exit(0);
}
if (asJson) { console.log(JSON.stringify({ total, own_classes: ownClasses.size, files: counts }, null, 2)); process.exit(0); }

const short = { 'raw-lengths': 'lengths', 'raw-type': 'type', 'raw-colors': 'colors', 'raw-radii': 'radii', restyled: 'restyled', 'product-layer': 'product', 'inline-styles': 'inline' };
const w = Math.max(5, ...Object.keys(counts).map((f) => f.length));
const row = (name, c) => name.padEnd(w + 2) + KINDS.map((k) => String(c[k] || '·').padStart(short[k].length + 2)).join('');
console.log(row('', Object.fromEntries(KINDS.map((k) => [k, short[k]]))));
for (const [f, c] of Object.entries(counts)) if (KINDS.some((k) => c[k])) console.log(row(f, c));
console.log(row('total', total));
console.log(`\n${ownClasses.size} classes of the app's own · ${files.length} files · core: ${coreClasses.size} classes`);

if (budgetPath) {
  if (write) { fs.writeFileSync(budgetPath, JSON.stringify({ total, files: counts }, null, 2) + '\n'); console.log(`budget written to ${budgetPath}`); process.exit(0); }
  const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf8'));
  const over = [];
  for (const [f, c] of Object.entries(counts)) for (const k of KINDS) {
    const was = (budget.files[f] || {})[k] || 0;
    if (c[k] > was) over.push(`${f}: ${k} ${was} → ${c[k]}`);
  }
  if (over.length) { console.log(`\nover budget:\n  ${over.join('\n  ')}\n\nSee what rose with --show <kind>. A budget only goes down.`); process.exit(1); }
  console.log('\ninside the budget');
}
