const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getPublicUrl } = require('../scripts/public_url');

const request = (host, forwarded) => ({
  protocol: 'http',
  get: name => ({ host, 'x-forwarded-proto': forwarded })[name],
});

test('Vercel artwork stays on the public request domain, not protected deployment host', () => {
  const env = { VERCEL: '1', VERCEL_URL: 'protected-deployment.vercel.app' };
  assert.equal(getPublicUrl(request('public.vercel.app', 'https'), env).href, 'https://public.vercel.app/');
  assert.equal(getPublicUrl(request('custom.example', 'https'), env).href, 'https://custom.example/');
});

test('explicit base URL wins, LAN hosts retain ports, and local clients cannot spoof proxy protocol', () => {
  assert.equal(getPublicUrl(request('localhost:8080'), { PUBLIC_BASE_URL: 'https://configured.example' }).href, 'https://configured.example/');
  assert.equal(getPublicUrl(request('192.168.1.10:8080', 'https'), {}).href, 'http://192.168.1.10:8080/');
  assert.equal(getPublicUrl(request('service.run.app', 'https'), { K_SERVICE: 'mock' }).href, 'https://service.run.app/');
});

test('offline playlist generation uses production domain or local default, never deployment URL', () => {
  assert.equal(getPublicUrl(undefined, { VERCEL_PROJECT_PRODUCTION_URL: 'public.vercel.app', VERCEL_URL: 'protected.vercel.app' }).href, 'https://public.vercel.app/');
  assert.equal(getPublicUrl(undefined, { VERCEL_URL: 'protected.vercel.app' }).href, 'http://localhost:8080/');
});
