// Trellis · Tailwind spike · which core.css a bundle holds
// build.js writes it to dist/core.sha256; tests/tailwind.js compares. Line
// endings don't count, so a checkout on Windows reads the same as one on Linux.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

exports.coreHash = () => crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, '../../core.css'), 'utf8').replace(/\r\n/g, '\n'))
  .digest('hex');
