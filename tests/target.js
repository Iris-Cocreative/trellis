// Trellis · which specimen a test opens
// The specimen takes one product layer by address (see index.html). A test names
// it one of three ways:
//   neutral            no layer: core's own defaults
//   quarry, almanac    an example in examples/, by its name
//   name=<address>     a layer from outside the repository, such as a product's
//                      private layer served from where it lives. The specimen
//                      only loads another origin's layer when it is itself
//                      served from localhost.
// theme: auto (follows the system), light or dark.
module.exports = function target(url, product = 'neutral', theme = 'auto') {
  const u = new URL(url);
  if (product && product !== 'neutral') {
    const at = product.indexOf('=');
    const name = at < 0 ? product : product.slice(0, at);
    const href = at < 0 ? new URL(`examples/${product}.css`, u).href : new URL(product.slice(at + 1), u).href;
    u.searchParams.set('layer', href);
    u.searchParams.set('product', name);
  }
  if (theme === 'light' || theme === 'dark') u.searchParams.set('theme', theme);
  return u.href;
};
