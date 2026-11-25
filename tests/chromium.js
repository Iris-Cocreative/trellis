// Trellis · launch Chromium for a screen of a given density
// Chromium on Linux hints text at 1x and not above it. Which of the two a font
// gets is one value for the whole renderer process: the density of whatever
// document was laid out last (LayoutView::LayoutRoot), and an SVG image is a
// document of its own, laid out at 1x whatever the screen. So on a 3x page a
// font first asked for just after an SVG image was laid out gets a 1x screen's
// metrics: a capital of 25.78px type is 20px tall, not 18.8, and 1cap, which a
// headline's padding is worked out from, moves by up to a cell. It comes and
// goes with the timing, mostly on a throttled CPU, and no settling ends it.
// Chromium compiles that line for Linux and ChromeOS only, so at 3x on Linux
// the fonts are asked for unhinted, as a 3x screen has them, and the metrics
// are the same either way. steady() is the proof: no font's capitals move when
// an SVG image has been laid out.
const path = require('path');

exports.launch = (pw, density = 1) => {
  const options = process.env.CHROME ? { executablePath: process.env.CHROME } : {};
  if (density > 1 && process.platform === 'linux' && !process.env.FONTCONFIG_FILE) {
    options.env = { ...process.env, FONTCONFIG_FILE: path.join(__dirname, 'fonts.conf') };
  }
  return pw.chromium.launch(options);
};

// Every size is a new one, so its metrics are asked for and not remembered.
// Returns what moved, in words, or null.
exports.steady = page => page.evaluate(async () => {
  let n = 0;
  const cap = px => {
    const i = document.createElement('i'), size = px + (n++) / 1e4;
    i.style.cssText = `position: absolute; visibility: hidden; font: 500 ${size}px var(--font-sans, system-ui); height: 1cap; width: 0`;
    document.body.appendChild(i);
    const h = i.getBoundingClientRect().height;
    i.remove();
    return h / size;
  };
  for (const px of [11, 13, 16, 18, 21, 25, 29, 36, 47, 61]) {
    const before = cap(px), image = new Image();
    image.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${px}' height='${px}'/%3E`;
    await new Promise(done => { image.onload = image.onerror = done; });
    const after = cap(px);
    if (Math.abs(after - before) > .002) return `a capital of ${px}px type is ${(before * px).toFixed(2)}px, and ${(after * px).toFixed(2)}px once an SVG image has been laid out: the browser's metrics are not the screen's, so nothing here can be trusted (tests/chromium.js)`;
  }
  return null;
});
