// Trellis · cascade layer test
// Proves the import order the README requires for a project that also loads
// Tailwind. It uses the shape of Tailwind v4's layers, not Tailwind itself:
// a preflight that flattens headings in `base`, a margin utility in
// `utilities`. tests/README.md says what this does and doesn't prove.
//   utility wins   a Tailwind margin on a heading beats Trellis's reset
//   role wins      a Trellis type role beats Tailwind's preflight
// Usage: node layers.js <url> [webkit]
// Needs Playwright (PLAYWRIGHT=module path). Exits 1 if a case surprises it,
// including the unsafe orders ceasing to be unsafe: then the README is wrong.
const pw = require(process.env.PLAYWRIGHT || 'playwright');

const TAILWIND = `
  @layer theme, base, components, utilities;
  @layer base { h1 { font-size: inherit; font-weight: inherit; margin: 0; } }
  @layer utilities { .mt-test { margin-block-start: 40px; } }`;
const STATEMENT = '@layer theme, base, trellis, components, utilities;';

const CASES = [
  { name: 'statement, Tailwind first', statement: true, first: 'tailwind', utility: true, role: true },
  { name: 'statement, Trellis first', statement: true, first: 'trellis', utility: true, role: true },
  // The two bare orders. Each breaks one thing; the statement is what fixes both.
  { name: 'no statement, Tailwind first', statement: false, first: 'tailwind', utility: false, role: true },
  { name: 'no statement, Trellis first', statement: false, first: 'trellis', utility: true, role: false },
];

(async () => {
  const [base, engine = 'chromium'] = process.argv.slice(2);
  if (!base) { console.error('usage: node layers.js <url> [webkit]'); process.exit(2); }
  const browser = engine === 'webkit' ? await pw.webkit.launch()
    : await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage();
  await page.goto(new URL('tests/README.md', base).href);
  let bad = 0;
  for (const c of CASES) {
    const tw = `<style>${TAILWIND}</style>`, core = `<link rel="stylesheet" href="${new URL('core.css', base).href}">`;
    await page.setContent(`<!doctype html><html><head>${c.statement ? `<style>${STATEMENT}</style>` : ''}${c.first === 'trellis' ? core + tw : tw + core}</head>
      <body><h1 class="t-h1 mt-test" id="h">Heading</h1></body></html>`, { waitUntil: 'load' });
    const r = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById('h'));
      return { margin: parseFloat(cs.marginBlockStart), size: parseFloat(cs.fontSize), body: parseFloat(getComputedStyle(document.body).fontSize) };
    });
    const utility = r.margin === 40, role = r.size > r.body;
    const ok = utility === c.utility && role === c.role;
    if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${engine} ${c.name}: utility ${utility ? 'wins' : 'loses'} (margin ${r.margin}px) · role ${role ? 'wins' : 'loses'} (${r.size}px over ${r.body}px body)`);
  }
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
