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
  const { username, password, action, series_id, category_id } = req.query;

  if (username === 'test_user' && password === 'test_pass') {

    if (action === 'get_live_categories') {
      res.json(loadJsonData('live_categories.json'));

    } else if (action === 'get_live_streams') {
      const liveStreams = loadJsonData('live_streams.json');
      
      if (category_id) {
        // Category ID'ye göre filtrele
        const filteredStreams = liveStreams.filter(stream => 
          stream.category_id == category_id
        );
        res.json(filteredStreams);
      } else {
        // Tüm live stream'leri döndür
        res.json(liveStreams);
      }

    } else if (action === 'get_vod_categories') {
      res.json(loadJsonData('vod_categories.json'));

    } else if (action === 'get_vod_streams') {
      const vodStreams = loadJsonData('vod_streams.json');
      
      if (category_id) {
        // Category ID'ye göre filtrele
        const filteredStreams = vodStreams.filter(stream => 
          stream.category_id == category_id
        );
        res.json(filteredStreams);
      } else {
        // Tüm VOD stream'leri döndür
        res.json(vodStreams);
      }

    } else if (action === 'get_series_categories') {
      res.json(loadJsonData('series_categories.json'));

    } else if (action === 'get_series') {
      const series = loadJsonData('series.json');
      
      if (category_id) {
        // Category ID'ye göre filtrele
        const filteredSeries = series.filter(s => 
          s.category_id == category_id
        );
        res.json(filteredSeries);
      } else {
        // Tüm serileri döndür
        res.json(series);
      }

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

// Live stream endpoint
app.get('/live/:username/:password/:stream_id.m3u8', (req, res) => {
  const { username, password, stream_id } = req.params;
  
  if (username === 'test_user' && password === 'test_pass') {
    const liveStreams = loadJsonData('live_streams.json');
    const stream = liveStreams.find(s => s.stream_id == stream_id);
    
    if (stream && stream.stream_url) {
      res.redirect(stream.stream_url);
    } else {
      res.status(404).json({"error": "Stream not found"});
    }
  } else {
    res.status(401).json({"error": "Invalid credentials"});
  }
});

// VOD/Movie endpoint
app.get('/movie/:username/:password/:stream_id.mp4', (req, res) => {
  const { username, password, stream_id } = req.params;
  
  if (username === 'test_user' && password === 'test_pass') {
    const vodStreams = loadJsonData('vod_streams.json');
    const stream = vodStreams.find(s => s.stream_id == stream_id);
    
    if (stream && stream.stream_url) {
      res.redirect(stream.stream_url);
    } else {
      res.status(404).json({"error": "Movie not found"});
    }
  } else {
    res.status(401).json({"error": "Invalid credentials"});
  }
});

// Series episode endpoint
app.get('/series/:username/:password/:stream_id.mp4', (req, res) => {
  const { username, password, stream_id } = req.params;
  
  if (username === 'test_user' && password === 'test_pass') {
    const seriesInfo = loadJsonData('series_info.json');
    let episodeUrl = null;
    
    // Search through all series for the episode
    for (const seriesId in seriesInfo) {
      const series = seriesInfo[seriesId];
      if (series.episodes) {
        for (const seasonNum in series.episodes) {
          const episodes = series.episodes[seasonNum];
          const episode = episodes.find(ep => ep.id == stream_id);
          if (episode && episode.stream_url) {
            episodeUrl = episode.stream_url;
            break;
          }
        }
      }
      if (episodeUrl) break;
    }
    
    if (episodeUrl) {
      res.redirect(episodeUrl);
    } else {
      res.status(404).json({"error": "Episode not found"});
    }
  } else {
    res.status(401).json({"error": "Invalid credentials"});
  }
});

// Generic stream endpoint
app.get('/:username/:password/:stream_id', (req, res) => {
  const { username, password, stream_id } = req.params;
  
  if (username === 'test_user' && password === 'test_pass') {
    // Try live streams first
    const liveStreams = loadJsonData('live_streams.json');
    let stream = liveStreams.find(s => s.stream_id == stream_id);
    
    if (stream && stream.stream_url) {
      res.redirect(stream.stream_url);
      return;
    }
    
    // Try VOD streams
    const vodStreams = loadJsonData('vod_streams.json');
    stream = vodStreams.find(s => s.stream_id == stream_id);
    
    if (stream && stream.stream_url) {
      res.redirect(stream.stream_url);
      return;
    }
    
    // Try series episodes
    const seriesInfo = loadJsonData('series_info.json');
    let episodeUrl = null;
    
    for (const seriesId in seriesInfo) {
      const series = seriesInfo[seriesId];
      if (series.episodes) {
        for (const seasonNum in series.episodes) {
          const episodes = series.episodes[seasonNum];
          const episode = episodes.find(ep => ep.id == stream_id);
          if (episode && episode.stream_url) {
            episodeUrl = episode.stream_url;
            break;
          }
        }
      }
      if (episodeUrl) break;
    }
    
    if (episodeUrl) {
      res.redirect(episodeUrl);
    } else {
      res.status(404).json({"error": "Stream not found"});
    }
  } else {
    res.status(401).json({"error": "Invalid credentials"});
  }
});

app.listen(8080, () => {
  console.log('Mock Xtream API running on port 8080');
  console.log('Test credentials: username=test_user, password=test_pass');
});