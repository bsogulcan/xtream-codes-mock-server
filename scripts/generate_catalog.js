// The reviewed source and licensing information lives in media_catalog.json.
const fs = require('fs');
const path = require('path');
const films = require('../data/media_catalog.json');
const write = (name, data) => fs.writeFileSync(path.join(__dirname, '../data', name + '.json'), JSON.stringify(data, null, 2) + '\n');
const categories = ['Doğa ve Komedi', 'Fantastik Yolculuklar', 'Bilim Kurgu', 'Kısa Animasyonlar'].map((name, i) => ({ category_id: String(i + 1), category_name: name, parent_id: 0 }));
const artwork = (f, kind) => `/artwork/${f.slug}-${kind}.jpg`;
const credits = f => ({ license: f.license, license_url: f.license_url, license_source: f.license_source, attribution: f.attribution, source_url: f.source_url });
const vod = films.map((f, i) => ({
  num: i + 1, name: f.title, stream_type: 'movie', stream_id: f.stream_id,
  stream_icon: artwork(f, 'cover'), cover: artwork(f, 'cover'), backdrop_path: [artwork(f, 'backdrop')],
  category_id: f.category_id, container_extension: 'mp4', stream_url: f.stream_url,
  plot: f.plot, genre: categories.find(c => c.category_id === f.category_id).category_name,
  duration_secs: f.duration, duration: new Date(f.duration * 1000).toISOString().slice(11, 19),
  ...credits(f),
}));
const live = films.map((f, i) => ({
  num: i + 1, name: `${f.title} • Demo`, stream_type: 'live', stream_id: f.live_stream_id,
  stream_icon: artwork(f, 'backdrop'), category_id: f.category_id,
  container_extension: 'mp4', stream_url: f.stream_url, epg_channel_id: '', tv_archive: 0,
  is_demo: true, plot: 'Canlı kanal arayüzü için sonlu açık film demosu; gerçek canlı yayın değildir.', ...credits(f),
}));
const seriesInfo = {};
const series = categories.map((c, i) => {
  const items = vod.filter(v => v.category_id === c.category_id);
  const id = 3001 + i;
  seriesInfo[id] = {
    seasons: [{ id: 1, season_number: 1, name: 'Açık Film Seçkisi', episode_count: items.length, cover: items[0].cover }],
    episodes: { '1': items.map((v, n) => ({
      id: films.find(f => f.stream_id === v.stream_id).episode_id, episode_num: n + 1, season: 1,
      title: v.name, container_extension: 'mp4', stream_url: v.stream_url,
      info: { movie_image: v.cover, cover_big: v.cover, backdrop_path: v.backdrop_path, plot: v.plot, duration_secs: v.duration_secs, duration: v.duration, ...credits(v) },
    })) },
  };
  return { num: i + 1, series_id: id, name: c.category_name + ' Koleksiyonu', category_id: c.category_id,
    cover: items[0].cover, backdrop_path: items.map(v => v.backdrop_path[0]), genre: c.category_name,
    plot: 'Bağımsız açık filmlerden oluşturulmuş demo koleksiyonu; orijinal bir televizyon dizisi değildir.',
    cast: 'Blender Foundation', episode_run_time: String(Math.round(items.reduce((n, v) => n + v.duration_secs, 0) / items.length / 60)),
  };
});
for (const type of ['live', 'vod', 'series']) write(type + '_categories', categories);
write('vod_streams', vod);
write('live_streams', live);
write('series', series);
write('series_info', seriesInfo);
console.log(`Generated ${vod.length} films, ${live.length} demo channels and ${series.length} collections.`);
