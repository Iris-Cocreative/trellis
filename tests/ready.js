// Trellis · wait for the page to really be ready
// networkidle doesn't mean parsed: on a slow machine the browser can go half a
// second without a request while it is still working through the HTML, and the
// scripts at the end of the body haven't run. (Found in CI: Trellis undefined.)
// So this waits for the document, then the runtime, then what the runtime says.
// Never a guessed delay.
module.exports = async function ready(page) {
  await page.waitForFunction(() => document.readyState === 'complete' && window.Trellis, null, { timeout: 90000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await window.Trellis.settled();
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    await window.Trellis.settled();
  });
};
