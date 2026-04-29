
// functions/api/starboard/heartbeat.ts

interface Env {
  STARBOARD_API_KEY: string;
}

const RELEASE_PROJECT_ID = 'fdf755ab-80a7-40fb-b168-edef1e7ebd9a';
const SOURCE_HOSTNAME = 'oluanuakin.me';

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = await request.json() as Record<string, unknown>;
  const cf = (request as unknown as { cf?: Record<string, unknown> }).cf ?? {};

  // EP/album players send the per-track projectId; fall back to the release
  // ID for single-track players. Starboard aggregates track heartbeats up to
  // the parent release automatically.
  const targetProjectId = typeof body.projectId === 'string'
    ? body.projectId
    : RELEASE_PROJECT_ID;

  // Starboard does not infer client IP/geo from the proxy connection — we
  // must enrich from cf-connecting-ip and the Cloudflare request.cf object.
  const enriched = {
    ...body,
    ua: request.headers.get('user-agent') ?? '',
    source: SOURCE_HOSTNAME,
    ip: request.headers.get('cf-connecting-ip') ?? 'unknown',
    country: typeof cf.country === 'string' ? cf.country : '',
    region: typeof cf.region === 'string' ? cf.region : '',
    city: typeof cf.city === 'string' ? cf.city : '',
  };

  const starboardUrl = `https://starboard.one-kind.co/api/public/projects/${encodeURIComponent(targetProjectId)}/heartbeat`;
  const response = await fetch(starboardUrl, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.STARBOARD_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(enriched),
  });

  return new Response(response.body, { status: response.status });
};
