/* Trellis · figma-photo · the stand-in picture, for the parts that hold an image
   Not run on its own (tools/figma-components.js). */
// A stand-in photograph, since the sandbox can't fetch: a PNG drawn here (a
// sky, a sun high in it, hills), stored without compression.
function png(w, h, px) {
  const raw = [];
  for (let y = 0; y < h; y++) { raw.push(0); for (let x = 0; x < w; x++) raw.push(...px(x / w, y / h)); }
  const T = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; T.push(c >>> 0); }
  const crc = (b) => { let c = ~0; for (const x of b) c = T[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
  const u32 = (n) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (t, d) => { const b = [...t].map((ch) => ch.charCodeAt(0)).concat(d); return u32(d.length).concat(b, u32(crc(b))); };
  let a = 1, b = 0; for (const x of raw) { a = (a + x) % 65521; b = (b + a) % 65521; }
  const z = [0x78, 1];
  for (let i = 0; i < raw.length; i += 65535) { const n = Math.min(65535, raw.length - i); z.push(i + n >= raw.length ? 1 : 0, n & 255, n >> 8, ~n & 255, (~n >> 8) & 255); for (let j = i; j < i + n; j++) z.push(raw[j]); }
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...chunk('IHDR', [...u32(w), ...u32(h), 8, 2, 0, 0, 0]), ...chunk('IDAT', z.concat(u32(((b << 16) | a) >>> 0))), ...chunk('IEND', [])]);
}
const mix = (p, q, t) => p.map((x, i) => Math.round(x + (q[i] - x) * Math.min(1, Math.max(0, t))));
const IW = 120, IH = 100;   // squarer than a banner, so a focal point shows
const IMG = figma.createImage(png(IW, IH, (u, v) => {
  if (v > 0.66 + 0.06 * Math.sin(u * 7 + 1)) return mix([92, 124, 82], [42, 66, 48], (v - 0.62) * 3);
  if (v > 0.54 + 0.05 * Math.sin(u * 4)) return mix([122, 142, 150], [98, 116, 120], (v - 0.5) * 5);
  if (Math.hypot((u - 0.68) * 1.6, v - 0.22) < 0.09) return [252, 230, 176];
  return mix([140, 176, 210], [244, 204, 164], v / 0.56);
})).hash;
// The image by cover at its focal point (--media-focus). The middle is Figma's
// own fill, which follows a resize; any other is a crop, worked out for the
// frame's size at the wide screen, and stretches if the frame is resized.
const photo = (w, h, focus = [0.5, 0.5]) => {
  if (focus[0] === 0.5 && focus[1] === 0.5) return { type: 'IMAGE', scaleMode: 'FILL', imageHash: IMG };
  const sw = Math.min(1, (w / h) / (IW / IH)), sh = Math.min(1, (IW / IH) / (w / h));
  return { type: 'IMAGE', scaleMode: 'CROP', imageHash: IMG, imageTransform: [[sw, 0, (1 - sw) * focus[0]], [0, sh, (1 - sh) * focus[1]]] };
};
// A full bleed's scrim, to 80% black at its foot (a gradient's stops can't bind).
const SCRIM = { type: 'GRADIENT_LINEAR', gradientTransform: [[0, 1, 0], [-1, 0, 1]], gradientStops: [{ position: 0.3, color: { r: 0, g: 0, b: 0, a: 0 } }, { position: 1, color: { r: 0, g: 0, b: 0, a: 0.8 } }] };
