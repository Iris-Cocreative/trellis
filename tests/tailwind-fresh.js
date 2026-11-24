// Trellis · is the Tailwind spike's bundle built from today's core.css?
// experiments/tailwind/build.js records the core.css it bundled.
const fs = require('fs');
const path = require('path');
const { coreHash } = require('../experiments/tailwind/hash');

module.exports = function fresh() {
  try { return fs.readFileSync(path.join(__dirname, '../experiments/tailwind/dist/core.sha256'), 'utf8').trim() === coreHash(); }
  catch (e) { return false; }
};
