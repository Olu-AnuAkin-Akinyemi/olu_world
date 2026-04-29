// functions/api/starboard/crew.ts

// Uses the Artist-project Starboard key, not the Muses key. The Muses key
// (STARBOARD_API_KEY) authorizes manifest/assets/heartbeat for the Muses
// release; this endpoint posts to the øLu AnuAkin (Artist) project's crew.
interface Env {
  STARBOARD_ARTIST_API_KEY: string;
}

const PROJECT_ID = 'cef933d4-7f63-4f4c-ab96-8fc3902901b8';
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

// Per-isolate IP tracker. Cloudflare can spawn multiple isolates so this is
// best-effort, not a hard guarantee. Sufficient for casual abuse; pair with
// a WAF rule if traffic warrants it.
const recent = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    recent.set(ip, hits);
    return true;
  }
  hits.push(now);
  recent.set(ip, hits);
  return false;
}

function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot: real users never fill this; bots usually do.
  if (body.botcheck) {
    return Response.json({ ok: true, skipped: true }, { status: 200 });
  }

  if (!isValidEmail(body.email)) {
    return Response.json({ error: 'invalid_email' }, { status: 400 });
  }

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (isRateLimited(ip)) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }

  const cf = (request as unknown as { cf?: Record<string, unknown> }).cf ?? {};

  const payload = {
    email: body.email.toLowerCase(),
    name: str(body.name),
    city: str(body.city) ?? str(cf.city),
    region: str(body.region) ?? str(cf.region),
    country: str(body.country) ?? str(cf.country),
  };

  const response = await fetch(
    `https://starboard.one-kind.co/api/public/projects/${PROJECT_ID}/crew`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.STARBOARD_ARTIST_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json().catch(() => ({}));
  return Response.json(data, { status: response.status });
};
