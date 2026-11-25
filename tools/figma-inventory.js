#!/usr/bin/env node
/* Trellis · figma-inventory · what the component scripts draw, to check a file against
   Runs the parts of tools/figma-components.js, in order, against a stand-in for
   Figma's plugin API that keeps names, types, text, descriptions and component
   properties, and none of the drawing. Per section: the layers, the texts and
   the components (each set's name, variants, properties and description), each
   counted and hashed.

     node tools/figma-inventory.js            what the scripts draw
     node tools/figma-inventory.js --list     each component, with its variants
     node tools/figma-inventory.js --plugin   a script that works out the same
          from the open file; the two print the same when the file holds what
          the scripts draw, name for name (the variables' own check is
          figma-variables --checksum)

   tests/contract.js runs it, so a part that throws, or asks for a component no
   part before it builds, fails there. */
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const fc = require('./figma-components.js');

// Read the same way from the stand-in and from the file. An instance's insides are its component's.
function measure(page) {
  const hash = (lines) => { let h = 0x811c9dc5; for (const ch of lines.join('\n')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return `${lines.length} ${h.toString(16)}`; };
  const plain = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&');   // as Figma stores a description
  const out = {};
  for (const s of page.children.filter((n) => n.type === 'SECTION')) {
    const layers = [], texts = [], comps = [];
    const walk = (n, d) => {
      layers.push(`${d} ${n.type} ${n.name}`);
      if (n.type === 'TEXT') texts.push(n.characters);
      if (n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && n.parent.type !== 'COMPONENT_SET'))
        comps.push([n.name, n.type === 'COMPONENT_SET' ? n.children.map((c) => c.name).join('|') : '', Object.entries(n.componentPropertyDefinitions).filter(([, v]) => v.type !== 'VARIANT').map(([k]) => k.split('#')[0]).join(), plain(n.description)].join(' · '));
      if (n.type !== 'INSTANCE') for (const c of n.children || []) walk(c, d + 1);
    };
    walk(s, 0);
    out[s.name] = { layers: hash(layers), texts: hash(texts), components: hash(comps), variants: comps.reduce((a, c) => a + c.split(' · ')[1].split('|').length, 0) };
  }
  return out;
}
const PLUGIN = `const measure = ${measure.toString()};\nreturn measure(figma.root.children[0]);\n`;

async function draw() {
  const fv = JSON.parse(execFileSync(process.execPath, [path.join(__dirname, 'figma-variables.js')], { encoding: 'utf8', maxBuffer: 1e8 }));
  const LEAF = { TEXT: 1, ELLIPSE: 1, RECTANGLE: 1, VECTOR: 1 }, NAME = { VECTOR: 'Vector', ELLIPSE: 'Ellipse', RECTANGLE: 'Rectangle' };
  let ids = 0;
  class Node {
    constructor(type) { Object.assign(this, { type, id: `1:${++ids}`, name: NAME[type] || type, width: 100, height: 100, visible: true, parent: null, description: '', defs: {} }); if (!LEAF[type]) this.children = []; }
    appendChild(n) { this.insertChild(this.children.filter((x) => x !== n).length, n); }
    insertChild(i, n) { n.remove(); n.parent = this; this.children.splice(i, 0, n); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter((x) => x !== this); this.parent = null; }
    findAll(f) { return (this.children || []).flatMap((c) => [...(f(c) ? [c] : []), ...c.findAll(f)]); }
    findOne(f) { return this.findAll(f)[0] || null; }
    resize(w, h) { this.width = w; this.height = h; }
    resizeWithoutConstraints(w, h) { this.resize(w, h); }
    setBoundVariable() {}
    setExplicitVariableModeForCollection() {}
    async setTextStyleIdAsync() {}
    async exportAsync() {}
    set() { return this.type === 'COMPONENT' && this.parent && this.parent.type === 'COMPONENT_SET' ? this.parent : this; }
    addComponentProperty(n, type, def) { const k = `${n}#${++ids}:0`; this.defs[k] = { type, def }; return k; }
    get componentPropertyDefinitions() { return this.defs; }
    get componentPropertyReferences() { return this.refs; }
    set componentPropertyReferences(r) { this.refs = r; if (r.characters) { let p = this; while (p.type !== 'COMPONENT_SET') p = p.parent; this.characters = p.defs[r.characters].def; } }
    createInstance() {
      const copy = (n, top) => {
        const m = new Node(top ? 'INSTANCE' : n.type); Object.assign(m, { name: top ? n.set().name : n.name, characters: n.characters, main: top ? n : n.main });
        if (!top) m.id = 'I' + m.id;
        if (n.children) m.children = n.children.map((c) => Object.assign(copy(c), { parent: m }));
        return m;
      };
      return copy(this, true);
    }
    get componentProperties() { const s = this.main.set(); return Object.assign({}, s.defs, s.type === 'COMPONENT_SET' ? Object.fromEntries(this.main.name.split(', ').map((p) => [p.split('=')[0], {}])) : {}); }
    setProperties(o) { for (const k of Object.keys(o)) if (!(k in this.componentProperties)) throw new Error(`${this.name} has no property ${k}`); }
  }
  const page = new Node('PAGE'), make = (t) => () => { const n = new Node(t); page.appendChild(n); return n; };
  const figma = {
    root: { children: [page], findOne: (f) => page.findOne(f) },
    variables: {
      getLocalVariablesAsync: async () => fv.collections.flatMap((c) => c.variables.map((v) => ({ name: v.name, valuesByMode: v.values }))),
      getLocalVariableCollectionsAsync: async () => fv.collections.map((c) => ({ name: c.name, modes: c.modes.map((m) => ({ name: m, modeId: m })) })),
      setBoundVariableForPaint: (p) => p, setBoundVariableForEffect: (e) => e
    },
    getLocalTextStylesAsync: async () => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'xl', 'lg', 'body', 'sm', 'xs', 'label', 'eyebrow'].map((r) => ({ name: 'Trellis/' + r, id: r })),
    listAvailableFontsAsync: async () => [], loadFontAsync: async () => {}, createImage: () => ({ hash: '' }),
    createAutoLayout: (dir, props) => Object.assign(make('FRAME')(), props),
    createComponentFromNode: (n) => Object.assign(n, { type: 'COMPONENT' }),
    combineAsVariants: (list, parent) => { const s = new Node('COMPONENT_SET'); for (const c of list) s.appendChild(c); parent.appendChild(s); return s; }
  };
  for (const [k, t] of Object.entries({ createFrame: 'FRAME', createText: 'TEXT', createVector: 'VECTOR', createEllipse: 'ELLIPSE', createRectangle: 'RECTANGLE', createComponent: 'COMPONENT', createSection: 'SECTION' })) figma[k] = make(t);
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  for (const part of Object.keys(fc.PARTS)) {
    try { await new AsyncFunction('figma', fc.script(part))(figma); } catch (e) { throw new Error(`figma-components --plugin ${part}: ${e.message}`); }
  }
  const stray = page.children.filter((n) => n.type !== 'SECTION');
  if (stray.length) throw new Error(`left on the page, outside the sections: ${stray.map((n) => n.name).join(', ')}`);
  return page;
}
module.exports = { draw, measure };

if (require.main === module) {
  if (process.argv.includes('--plugin')) process.stdout.write(PLUGIN);
  else draw().then((page) => {
    if (process.argv.includes('--list')) for (const s of page.children) for (const n of s.findAll((x) => x.type === 'COMPONENT_SET' || (x.type === 'COMPONENT' && x.parent.type !== 'COMPONENT_SET'))) console.log(`${s.name} · ${n.name} · ${n.type === 'COMPONENT_SET' ? n.children.length : 1}`);
    else console.log(JSON.stringify(measure(page), null, 1));
  }).catch((e) => { console.error(e.message); process.exit(1); });
}
