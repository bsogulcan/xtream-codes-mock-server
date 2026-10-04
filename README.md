# Xtream Mock API Server

A lightweight Docker-based mock server that simulates Xtream Codes API endpoints for IPTV application development and testing.

## Test Credentials

* Server URL: https://xtream-codes-mock-server-337348938954.europe-west1.run.app
* Username: test_user
* Password: test_pass

## Run Locally

Run `npm install` and `npm start` (default port: 8080).

## Deploy to Vercel

Vercel supports this Express server directly; Docker is not required. The API reads bundled JSON files and redirects video requests to their source URLs.

1. Push this repository to GitHub and import it at https://vercel.com/new.
2. Select the **Express** framework preset if it is not detected automatically. Keep the repository root as the Root Directory and leave build/output overrides unset.
3. Deploy, then use `https://<your-project>.vercel.app` as the server URL with the test credentials above.
4. Set `PUBLIC_BASE_URL=https://<your-project>.vercel.app` in the project's environment variables and redeploy so the API advertises your stable production domain. Without it, the API uses Vercel's deployment URL, or localhost when running locally.

Verify `/player_api.php?username=test_user&password=test_pass` and `/get.php?username=test_user&password=test_pass` on the deployed domain. IPTV clients need a URL they can access without a Vercel login; check Deployment Protection if requests show a login page.

The free Hobby plan is limited to personal, non-commercial use and its included usage quotas. See [Express deployment](https://vercel.com/docs/frameworks/backend/express) and [Hobby plan](https://vercel.com/docs/plans/hobby).

## Docker

### From Docker Hub
```bash
docker run -d -p 8080:8080 --name xtream-codes-mock-server bsogulcan/xtream-codes-mock-server:latest
```

### Build Local Image
```bash
# Clone the repository
git clone https://github.com/bsogulcan/xtream-codes-mock-server.git
cd xtream-codes-mock-server

# Build Docker image
docker build -t xtream-codes-mock-server .

# Run the container
docker run -d -p 8080:8080 --name xtream-codes-mock-server xtream-codes-mock-server
```

## Screenshot-ready open media catalog

The default catalog contains **10 distinct Blender open films**, shown as 10 VOD titles,
10 finite demo channels, and 4 collections containing 10 episodes (30 M3U entries).
Demo channels are on-demand MP4 films, not continuous live broadcasts. Collections
repackage those same films for testing series screens; they are not original TV series.
Unverified TV broadcasts, third-party channel logos, and Apple test clips have been removed.

Run `npm start`, then import:

```text
http://localhost:8080/get.php?username=test_user&password=test_pass
```

For a phone or simulator that cannot reach localhost, set `PUBLIC_BASE_URL` to this
server's reachable LAN address or deployed HTTPS origin. Artwork URLs in Xtream API
responses and `/get.php` use that origin. Videos redirect to Blender's public MP4 files.
20 bundled JPEGs provide portrait covers and landscape backdrops without third-party
image hosting. `get_vod_info&vod_id=1001` also returns artwork and licensing metadata.
Remote video availability depends on Blender's hosting.

These assets are **CC BY, not public domain or attribution-free**. Before publishing
screenshots, copy the applicable credits and license links from [MEDIA_CREDITS.txt](MEDIA_CREDITS.txt)
into the accompanying caption/credits and retain the image modification note. Keep movie
end credits when sharing the films. Logos and trademarks are excluded from Blender's
content licenses. Per-film sources, license basis, frame timestamps and changes are
recorded in [data/media_catalog.json](data/media_catalog.json).

Regenerate all Xtream fixtures and the checked-in M3U after editing the reviewed catalog:

```bash
npm run generate:playlist
# For an exported playlist with remotely accessible artwork:
PUBLIC_BASE_URL=https://your-server.example npm run generate:playlist
npm test
```

The checked-in `data/playlist.m3u` targets localhost by default; use `/get.php` for an
origin-aware playlist on a deployed server. Artwork is bundled in `public/artwork/`;
regenerating JSON does not redownload media or recreate these images.

The catalog only retains titles with a project-specific license statement or an explicit
license card in the official film. Entries previously based only on Blender Studio's
general terms were removed. Stable media IDs are stored in `media_catalog.json` so
removing a title does not reassign its ID to another film.

API request examples live in `collections/` (Bruno). Open that directory as a collection;
the redundant root-level JSON export has been removed. Series Info uses collection ID
3001, and the VOD playback example uses movie ID 1001.
