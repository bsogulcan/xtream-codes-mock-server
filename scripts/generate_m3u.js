const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const load = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));

const liveCategories = load('live_categories.json');
const liveStreams = load('live_streams.json');
const vodCategories = load('vod_categories.json');
const vodStreams = load('vod_streams.json');
const seriesCategories = load('series_categories.json');
const series = load('series.json');
const seriesInfo = load('series_info.json');

const catName = (cats, id) => {
  const c = cats.find((x) => String(x.category_id) === String(id));
  return c ? c.category_name : 'Diğer';
};

const lines = ['#EXTM3U'];

for (const s of liveStreams) {
  const group = `Canlı / ${catName(liveCategories, s.category_id)}`;
  lines.push(`#EXTINF:-1 tvg-id="${s.stream_id}" tvg-name="${s.name}" tvg-logo="${s.stream_icon}" group-title="${group}",${s.name}`);
  lines.push(s.stream_url);
}

for (const v of vodStreams) {
  const group = `VOD / ${catName(vodCategories, v.category_id)}`;
  lines.push(`#EXTINF:-1 tvg-id="vod-${v.stream_id}" tvg-name="${v.name}" tvg-logo="${v.stream_icon}" group-title="${group}",${v.name}`);
  lines.push(v.stream_url);
}

for (const sh of series) {
  const info = seriesInfo[String(sh.series_id)];
  if (!info || !info.episodes) continue;
  const showGroup = `Dizi / ${catName(seriesCategories, sh.category_id)} / ${sh.name}`;
  for (const seasonNum of Object.keys(info.episodes)) {
    for (const ep of info.episodes[seasonNum]) {
      const title = `${sh.name} S${String(seasonNum).padStart(2, '0')}E${String(ep.episode_num).padStart(2, '0')} - ${ep.title}`;
      lines.push(`#EXTINF:-1 tvg-id="series-${ep.id}" tvg-name="${title}" tvg-logo="${sh.cover}" group-title="${showGroup}",${title}`);
      lines.push(ep.stream_url);
    }
  }
}

const out = lines.join('\n') + '\n';
const outPath = path.join(__dirname, '..', 'data', 'playlist.m3u');
fs.writeFileSync(outPath, out);

const counts = {
  live: liveStreams.length,
  vod: vodStreams.length,
  episodes: series.reduce((acc, sh) => {
    const info = seriesInfo[String(sh.series_id)];
    if (!info || !info.episodes) return acc;
    return acc + Object.values(info.episodes).reduce((a, eps) => a + eps.length, 0);
  }, 0),
};
console.log(`Wrote ${outPath}`);
console.log(counts, 'total entries:', counts.live + counts.vod + counts.episodes);
