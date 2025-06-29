const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

function loadJsonData(filename) {
  try {
    const filePath = path.join(__dirname, 'data', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
}

app.get('/player_api.php', (req, res) => {
  const { username, password, action, series_id } = req.query;

  if (username === 'test_user' && password === 'test_pass') {

    if (action === 'get_live_categories') {
      res.json(loadJsonData('live_categories.json'));

    } else if (action === 'get_live_streams') {
      res.json(loadJsonData('live_streams.json'));

    } else if (action === 'get_vod_categories') {
      res.json(loadJsonData('vod_categories.json'));

    } else if (action === 'get_vod_streams') {
      res.json(loadJsonData('vod_streams.json'));

    } else if (action === 'get_series_categories') {
      res.json(loadJsonData('series_categories.json'));

    } else if (action === 'get_series') {
      res.json(loadJsonData('series.json'));

    } else if (action === 'get_series_info' && series_id) {
      const seriesInfo = loadJsonData('series_info.json');
      const seriesData = loadJsonData('series.json');
      const info = seriesData.find(s => s.series_id == series_id);

      if (seriesInfo[series_id]) {
        res.json({
          ...seriesInfo[series_id],
          info: info
        });
      } else {
        res.json({"error": "Series not found"});
      }

    } else {
      res.json({
        "user_info": {
          "username": "test_user",
          "password": "test_pass",
          "message": "Welcome to Mock Xtream API",
          "auth": 1,
          "status": "Active",
          "exp_date": "1999999999",
          "is_trial": "0",
          "active_cons": "0",
          "created_at": Math.floor(Date.now() / 1000).toString(),
          "max_connections": "3",
          "allowed_output_formats": [
            "m3u8",
            "ts",
            "rtmp"
          ]
        },
        "server_info": {
          "url": "localhost",
          "port": "8080",
          "https_port": "0",
          "server_protocol": "http",
          "rtmp_port": "1935",
          "timezone": "Europe/Istanbul",
          "timestamp_now": Math.floor(Date.now() / 1000),
          "time_now": new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
      });
    }
  } else {
    res.status(401).json({"error": "Invalid credentials"});
  }
});

app.get('/live/:username/:password/:stream_id.m3u8', (req, res) => {
  res.redirect('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
});

app.get('/movie/:username/:password/:stream_id.mp4', (req, res) => {
  res.redirect('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
});

app.get('/series/:username/:password/:stream_id.mp4', (req, res) => {
  res.redirect('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
});

app.get('/:username/:password/:stream_id', (req, res) => {
  res.redirect('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
});

app.listen(8080, () => {
  console.log('Mock Xtream API running on port 8080');
  console.log('Test credentials: username=test_user, password=test_pass');
});