const fs = require('fs');
const path = require('path');
const buildM3U = require('./build_m3u');
const baseUrl = process.env.PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 8080}`);
const target = path.join(__dirname, '../data/playlist.m3u');
fs.writeFileSync(target, buildM3U(baseUrl));
console.log(`Wrote ${target} (artwork base: ${baseUrl})`);
