const fs = require('fs');
const path = require('path');
const buildM3U = require('./build_m3u');
const { getPublicUrl } = require('./public_url');
const baseUrl = getPublicUrl();
const target = path.join(__dirname, '../data/playlist.m3u');
fs.writeFileSync(target, buildM3U(baseUrl));
console.log(`Wrote ${target} (artwork base: ${baseUrl})`);
