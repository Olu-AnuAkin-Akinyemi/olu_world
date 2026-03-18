// ============================================================
// POST /api/deploy/trigger
// Hits your Cloudflare Pages deploy hook to rebuild the site.
// After a rebuild, the build script fetches fresh data from D1
// and bakes it into the static HTML.
//
// Setup: In CF Pages dashboard → Settings → Builds → Deploy hooks
// Create a hook, copy the URL, store it as:
//   CF_DEPLOY_HOOK_URL = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/..."
// ============================================================

import { jsonResponse, errorResponse } from '../_utils.js';

export async function onRequestPost({ env }) {
  if (!env.CF_DEPLOY_HOOK_URL) {
    return errorResponse('CF_DEPLOY_HOOK_URL not configured', 500);
  }

  try {
    const response = await fetch(env.CF_DEPLOY_HOOK_URL, { method: 'POST' });

    if (!response.ok) {
      const text = await response.text();
      return errorResponse(`Deploy hook failed: ${response.status} — ${text}`, 502);
    }

    return jsonResponse({ deployed: true, message: 'Build triggered. Site will update in ~60 seconds.' });
  } catch (e) {
    return errorResponse(`Deploy hook error: ${e.message}`, 502);
  }
}
