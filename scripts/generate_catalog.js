// Source URLs, stable IDs and per-title licenses are reviewed in media_catalog.json.
const fs = require('fs');
const path = require('path');
const films = require('../data/media_catalog.json');
const write = (name, data) => fs.writeFileSync(path.join(__dirname, '../data', name + '.json'), JSON.stringify(data, null, 2) + '\n');
const categoryNames = ['Nature & Comedy', 'Fantasy Adventures', 'Science Fiction', 'Animated Shorts', 'Behind the Scenes', 'ESO Astronomy', 'Hubble Discoveries', 'Natural World'];
const categories = categoryNames.map((name, i) => ({ category_id: String(i + 1), category_name: name, parent_id: 0 })).filter(c => films.some(f => f.category_id === c.category_id));
const artwork = (f, kind) => `/artwork/${f.slug}-${kind}.jpg`;
const credits = f => ({ license: f.license, license_url: f.license_url, license_source: f.license_source, attribution: f.attribution, source_url: f.source_url, ...(f.usage_note ? { usage_note: f.usage_note } : {}) });
const languageName = language => language === 'en' ? 'English' : 'No dialogue';
const vod = films.map((f, i) => ({
  num: i + 1, name: f.title, stream_type: 'movie', stream_id: f.stream_id,
  stream_icon: artwork(f, 'cover'), cover: artwork(f, 'cover'), backdrop_path: [artwork(f, 'backdrop')],
  category_id: f.category_id, container_extension: f.container_extension, stream_url: f.stream_url,
  plot: f.plot, genre: categories.find(c => c.category_id === f.category_id).category_name,
  language: f.language, language_name: languageName(f.language),
  duration_secs: f.duration, duration: new Date(f.duration * 1000).toISOString().slice(11, 19),
  ...credits(f),
}));
const live = films.map((f, i) => ({
  num: i + 1, name: `${f.title}${f.language === 'en' ? ' [EN]' : ''} • Demo`, stream_type: 'live', stream_id: f.live_stream_id,
  stream_icon: artwork(f, 'backdrop'), category_id: f.category_id,
  container_extension: f.container_extension, stream_url: f.stream_url, epg_channel_id: '', tv_archive: 0,
  language: f.language, language_name: languageName(f.language),
  is_demo: true, plot: `On-demand demo for the live TV screen. This is not a continuous live broadcast. ${f.plot}`, ...credits(f),
}));
const seriesInfo = {};
const collectionNames = { '5': 'Behind the Open Movies', '6': 'Europe to the Stars', '7': 'Hubblecast', '8': 'Waterfalls & Monsoon Landscapes' };
const series = categories.map((c, i) => {
  const items = vod.filter(v => v.category_id === c.category_id);
  const id = 3000 + Number(c.category_id);
  const languages = [...new Set(items.map(v => v.language))];
  seriesInfo[id] = {
    seasons: [{ id: 1, season_number: 1, name: 'Open Media Collection', episode_count: items.length, cover: items[0].cover }],
    episodes: { '1': items.map((v, n) => ({
      id: films.find(f => f.stream_id === v.stream_id).episode_id, episode_num: n + 1, season: 1,
      title: v.name, container_extension: v.container_extension, stream_url: v.stream_url,
      info: { movie_image: v.cover, cover_big: v.cover, backdrop_path: v.backdrop_path, plot: v.plot, duration_secs: v.duration_secs, duration: v.duration, language: v.language, ...credits(v) },
    })) },
  };
  return { num: i + 1, series_id: id, name: collectionNames[c.category_id] || c.category_name + ' Collection', category_id: c.category_id,
    cover: items[0].cover, backdrop_path: items.map(v => v.backdrop_path[0]), genre: c.category_name,
    plot: c.category_id === '6' ? 'Eight English-language chapters about exploring the southern sky, from ESO.' : c.category_id === '7' ? 'Selected English-language Hubblecast episodes about discoveries and technology.' : 'A curated collection of openly licensed films and videos, presented as episodes for the demo library.',
    language: languages.length === 1 ? languages[0] : 'mul',
    episode_run_time: String(Math.max(1, Math.round(items.reduce((n, v) => n + v.duration_secs, 0) / items.length / 60))),
  };
});
for (const type of ['live', 'vod', 'series']) write(type + '_categories', categories);
write('vod_streams', vod);
write('live_streams', live);
write('series', series);
write('series_info', seriesInfo);

const creditsText = [
  'OPEN MEDIA CREDITS / EKRAN GORUNTUSU MEDYA ATIFLARI', '',
  'This catalog is licensed, not attribution-free. All entries use a specified CC BY license.',
  'When publishing screenshots, show the full applicable credit, source and license link clearly alongside the image. Note the frame extraction and cropping.',
  'ESO and ESA/Hubble require full, visible credits. Keep complete video end credits. Do not reuse music separately or imply endorsement. Avoid identifiable people in promotional screenshots.',
  'Logos and trademarks are excluded. Bundled artwork uses extracted frames, not standalone broadcaster logos.',
  'Live-screen entries are finite on-demand demos, not real live TV. Collections reuse the same videos in the series UI.',
  '',
  ...films.flatMap(f => [f.title, `${f.attribution} — ${f.license}`, f.license_url,
    `Film: ${f.source_url}`, `License source: ${f.license_source}`, `License basis: ${f.license_basis}`,
    `Artwork: ${f.slug}-cover.jpg / ${f.slug}-backdrop.jpg`,
    `Frame: ${f.artwork_timestamp_seconds}s. ${f.artwork_changes}`,
    ...(f.usage_note ? [`Usage: ${f.usage_note}`] : []), '']),
];
fs.writeFileSync(path.join(__dirname, '../MEDIA_CREDITS.txt'), creditsText.join('\n'));
console.log(`Generated ${vod.length} videos, ${live.length} demo channels and ${series.length} collections.`);
