const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../server');
const buildM3U = require('../scripts/build_m3u');
const films = require('../data/media_catalog.json');
const vod = require('../data/vod_streams.json');
const live = require('../data/live_streams.json');
const shows = require('../data/series.json');
const infos = require('../data/series_info.json');

test('catalog contains licensed sources, matching artwork, and globally unique playable IDs', () => {
  const ids = [...vod, ...live].map(x => x.stream_id);
  assert.equal(films.length, 28);
  assert.equal(vod.length, films.length);
  assert.equal(live.length, films.length);
  assert.equal(shows.length, 7);
  assert.ok(films.filter(f => f.language === 'en').length >= 20);
  assert.ok(live.every(v => v.is_demo && v.name.includes('Demo')));
  for (const f of films) {
    assert.match(f.license_url, /^https:\/\/creativecommons.org\/licenses\/by\//);
    assert.ok(f.license_source && f.attribution && f.source_url);
    assert.ok(!f.license_basis.startsWith('Blender Studio default'));
    assert.equal(vod.find(v => v.stream_id === f.stream_id).stream_url, f.stream_url);
    assert.equal(live.find(v => v.stream_id === f.live_stream_id).stream_url, f.stream_url);
    assert.ok(['video.blender.org', 'cdn.eso.org', 'cdn.esahubble.org', 'cdn2.esahubble.org'].includes(new URL(f.stream_url).hostname));
    assert.ok(f.duration > 0);
    assert.ok(['mp4', 'm4v'].includes(f.container_extension));
    assert.ok(['en', 'zxx'].includes(f.language));
    for (const kind of ['cover', 'backdrop']) {
      const file = fs.readFileSync(path.join(__dirname, '../public/artwork', `${f.slug}-${kind}.jpg`));
      assert.equal(file.subarray(0, 2).toString('hex'), 'ffd8');
    }
  }
  for (const show of shows) {
    const info = infos[show.series_id];
    assert.equal(info.seasons[0].episode_count, info.episodes['1'].length);
    ids.push(...info.episodes['1'].map(ep => ep.id));
  }
  assert.equal(new Set(ids).size, ids.length);
  const expectedArtwork = films.flatMap(f => ['cover', 'backdrop'].map(kind => `${f.slug}-${kind}.jpg`)).sort();
  assert.deepEqual(fs.readdirSync(path.join(__dirname, '../public/artwork')).sort(), expectedArtwork);
  for (const id of ['1005', '1008', '1009', '1010', '2005', '2008', '2009', '2010', '4005', '4008', '4009', '4010']) assert.ok(!ids.includes(id));
});

test('M3U contains 84 playable entries with deploy-aware artwork and credits', () => {
  const m3u = buildM3U('https://example.test');
  assert.equal((m3u.match(/^#EXTINF:/gm) || []).length, 84);
  assert.equal((m3u.match(/^#EXT-X-ATTRIBUTION:/gm) || []).length, 84);
  assert.equal((m3u.match(/tvg-logo="https:\/\/example.test\/artwork\//g) || []).length, 84);
  assert.ok(!m3u.includes('localhost'));
  assert.equal(fs.readFileSync(path.join(__dirname, '../data/playlist.m3u'), 'utf8'), buildM3U('http://localhost:8080'));
});

test('Xtream endpoints expose details, filters, artwork, authentication and media redirects', async t => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const auth = 'username=test_user&password=test_pass';
  const api = action => fetch(`${base}/player_api.php?${auth}&${action}`);
  assert.equal((await fetch(`${base}/player_api.php`)).status, 401);
  assert.equal((await fetch(`${base}/get.php`)).status, 401);
  const detail = await (await api(`action=get_vod_info&vod_id=${vod[0].stream_id}`)).json();
  assert.equal(detail.info.movie_image, base + vod[0].cover);
  assert.equal(detail.info.license, films[0].license);
  assert.equal((await api('action=get_vod_info&vod_id=missing')).status, 404);
  const filtered = await (await api('action=get_vod_streams&category_id=2')).json();
  assert.ok(filtered.length && filtered.every(v => v.category_id === '2'));
  const series = await (await api(`action=get_series_info&series_id=${shows[0].series_id}`)).json();
  assert.ok(series.episodes['1'][0].info.movie_image.startsWith('http'));
  const episode = series.episodes['1'][0];
  for (const [route, id, target] of [['movie', vod[0].stream_id, vod[0].stream_url], ['live', live[0].stream_id, live[0].stream_url], ['series', episode.id, episode.stream_url]]) {
    for (const extension of ['mp4', 'm4v', 'm3u8']) {
      const response = await fetch(`${base}/${route}/test_user/test_pass/${id}.${extension}`, { redirect: 'manual' });
      assert.equal(response.status, 302);
      assert.equal(response.headers.get('location'), target);
    }
    assert.equal((await fetch(`${base}/${route}/bad/bad/${id}.mp4`, { redirect: 'manual' })).status, 401);
  }
  const playlist = await (await fetch(`${base}/get.php?${auth}`)).text();
  assert.equal(playlist, buildM3U(base));
  const science = vod.find(v => v.container_extension === 'm4v');
  const scienceResponse = await fetch(`${base}/movie/test_user/test_pass/${science.stream_id}.m4v`, { redirect: 'manual' });
  assert.equal(scienceResponse.status, 302);
  assert.equal(scienceResponse.headers.get('location'), science.stream_url);
  const artwork = await fetch(detail.info.movie_image);
  assert.equal(artwork.status, 200);
  assert.match(artwork.headers.get('content-type'), /image\/jpeg/);
});
