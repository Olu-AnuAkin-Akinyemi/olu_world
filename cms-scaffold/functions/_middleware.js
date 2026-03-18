// ============================================================
// _middleware.js — Cloudflare Access JWT Verification
// Protects /api/* write operations (POST, PUT, DELETE).
// GET requests pass through unauthenticated so the build
// script can fetch content without a JWT.
//
// Setup: In Cloudflare Zero Trust dashboard, create an Access
// Application protecting oluanuakin.me/admin/* with your email.
// Then set these env vars in wrangler.toml or CF dashboard:
//   CF_ACCESS_TEAM_DOMAIN = "your-team.cloudflareaccess.com"
//   CF_ACCESS_AUD         = "your-policy-aud-tag"
// ============================================================

async function verifyJWT(request, env) {
  const token = request.headers.get('CF-Access-JWT-Assertion');
  if (!token) return false;

  const certsUrl = `https://${env.CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`;

  try {
    const certsResponse = await fetch(certsUrl);
    if (!certsResponse.ok) return false;
    const { keys } = await certsResponse.json();

    // Decode JWT header to find signing key
    const [headerB64] = token.split('.');
    const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
    const key = keys.find(k => k.kid === header.kid);
    if (!key) return false;

    const cryptoKey = await crypto.subtle.importKey(
      'jwk', key,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false, ['verify']
    );

    const parts = token.split('.');
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = Uint8Array.from(
      atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, data);
    if (!valid) return false;

    // Verify claims
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp < nowSec) return false;
    if (payload.iss !== `https://${env.CF_ACCESS_TEAM_DOMAIN}`) return false;
    if (payload.aud && !payload.aud.includes(env.CF_ACCESS_AUD)) return false;

    return true;
  } catch (e) {
    console.error('JWT verification failed:', e);
    return false;
  }
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // Only protect API write operations
  if (url.pathname.startsWith('/api/') && request.method !== 'GET') {
    const valid = await verifyJWT(request, env);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  const response = await next();

  // CORS for admin SPA
  response.headers.set('Access-Control-Allow-Origin', url.origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, CF-Access-JWT-Assertion');

  return response;
}
