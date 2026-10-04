const fs = require('fs');
const path = require('path');
const load = name => JSON.parse(fs.readFileSync(path.join(__dirname, '../data', name + '.json'), 'utf8'));
const absolute = (value, baseUrl) => new URL(value, baseUrl).href;
const clean = value => String(value).replace(/["\r\n]/g, ' ');

function buildM3U(baseUrl) {
  const lines = ['#EXTM3U'];
  const add = (id, name, image, group, url, credit) => {
    if (credit) lines.push(`#EXT-X-ATTRIBUTION:${clean(credit.attribution)} | ${credit.license_url} | ${credit.source_url}`);
    lines.push(`#EXTINF:-1 tvg-id="${clean(id)}" tvg-name="${clean(name)}" tvg-logo="${absolute(image, baseUrl)}" group-title="${clean(group)}",${clean(name)}`, url);
  };
  for (const type of ['live', 'vod']) {
    const categories = load(type + '_categories');
    for (const item of load(type + '_streams')) {
      const category = categories.find(c => c.category_id === item.category_id).category_name;
      add(`${type}-${item.stream_id}`, item.name, item.stream_icon, `${type === 'live' ? 'Demo Kanallar' : 'Filmler'} / ${category}`, item.stream_url, item);
    }
  }
  const infos = load('series_info');
  for (const series of load('series')) {
    for (const [season, episodes] of Object.entries(infos[series.series_id].episodes)) {
      for (const episode of episodes) {
        add(`series-${episode.id}`, `${series.name} S${season.padStart(2, '0')}E${String(episode.episode_num).padStart(2, '0')} - ${episode.title}`, episode.info.movie_image, `Koleksiyonlar / ${series.name}`, episode.stream_url, episode.info);
      }
    }
  }
  return lines.join('\n') + '\n';
}
module.exports = buildM3U;
