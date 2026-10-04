// Use the origin the client reached, never a protected Vercel deployment URL.
function getPublicUrl(req, env = process.env) {
  if (env.PUBLIC_BASE_URL) return new URL(env.PUBLIC_BASE_URL);
  if (req) {
    const forwardedProtocol = (env.VERCEL || env.K_SERVICE)
      ? req.get('x-forwarded-proto')?.split(',')[0].trim()
      : undefined;
    const protocol = ['http', 'https'].includes(forwardedProtocol)
      ? forwardedProtocol
      : (env.VERCEL ? 'https' : req.protocol);
    return new URL(`${protocol}://${req.get('host')}`);
  }
  return new URL(env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : `http://localhost:${env.PORT || 8080}`);
}

module.exports = { getPublicUrl };
