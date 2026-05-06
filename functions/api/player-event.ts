// functions/api/player-event.ts

interface Env {
  DB: D1Database;
}

interface PlayerEventBody {
  track_id:         string;
  event_type:       string;
  link_dest?:       string | null;
  device_type?:     string;
  session_id:       string;
  play_duration_s?: number | null;
  track_duration_s?: number | null;
  seek_position_s?: number | null;
}

const VALID_TRACKS = ['pwr', 'wtfya', 'indecision', 'alwys-lovd'] as const;
const VALID_EVENTS = ['play', 'pause', 'complete', 'seek', 'link_click'] as const;
const VALID_DESTS  = [
  'spotify', 'apple', 'bandcamp',
  'tidal', 'pandora', 'amazon',
  'audiomack', 'deezer', null
] as const;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {

  // ── Referer guard ─────────────────────────────────────────────────
  const referer = request.headers.get('Referer') ?? '';
  if (!referer.startsWith('https://oluanuakin.me')) {
    return new Response('Forbidden', { status: 403 });
  }

  // ── Geo headers (injected by Cloudflare automatically) ────────────
  const country = request.headers.get('CF-IPCountry');
  const region  = request.headers.get('CF-IPRegion');
  const city    = request.headers.get('CF-IPCity');

  // ── IP hash — daily rotation, not recoverable ─────────────────────
  // Raw IP is never stored. Hash resets each day so cross-day
  // tracking is impossible. Used only for unique listener counts.
  const ip         = request.headers.get('CF-Connecting-IP') ?? '';
  const today      = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const msgBuffer  = new TextEncoder().encode(ip + today);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const ip_hash    = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);

  // ── Entry source (referring domain only, no path) ─────────────────
  let entry_source = 'direct';
  try {
    const ref = request.headers.get('Referer');
    if (ref) entry_source = new URL(ref).hostname;
  } catch { /* invalid URL — leave as 'direct' */ }

  // ── Hour of play (UTC) ────────────────────────────────────────────
  const hour_utc = new Date().getUTCHours();

  // ── Parse request body ────────────────────────────────────────────
  let body: PlayerEventBody;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const {
    track_id,
    event_type,
    link_dest        = null,
    device_type,
    session_id,
    play_duration_s  = null,
    track_duration_s = null,
    seek_position_s  = null,
  } = body;

  // ── Validate ──────────────────────────────────────────────────────
  if (!(VALID_TRACKS as readonly string[]).includes(track_id))
    return new Response('Bad Request', { status: 400 });

  if (!(VALID_EVENTS as readonly string[]).includes(event_type))
    return new Response('Bad Request', { status: 400 });

  if (link_dest !== null && !(VALID_DESTS as readonly (string | null)[]).includes(link_dest))
    return new Response('Bad Request', { status: 400 });

  if (!session_id || typeof session_id !== 'string' || session_id.length > 64)
    return new Response('Bad Request', { status: 400 });

  // ── Derive listen_pct server-side ─────────────────────────────────
  // Calculated here — not trusted from the client.
  let listen_pct: number | null = null;
  if (
    play_duration_s  != null &&
    track_duration_s != null &&
    track_duration_s > 0
  ) {
    listen_pct = Math.min(
      100,
      Math.round((play_duration_s / track_duration_s) * 1000) / 10
    );
  }

  // ── Write to D1 ───────────────────────────────────────────────────
  await env.DB.prepare(`
    INSERT INTO player_events
      (track_id, event_type, link_dest, device_type, session_id,
       play_duration_s, listen_pct, track_duration_s, seek_position_s,
       ip_hash, country, region, city, entry_source, hour_utc)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    track_id,
    event_type,
    link_dest        ?? null,
    device_type      ?? null,
    session_id,
    play_duration_s  ?? null,
    listen_pct,
    track_duration_s ?? null,
    seek_position_s  ?? null,
    ip_hash,
    country,
    region,
    city,
    entry_source,
    hour_utc
  ).run();

  return new Response('OK', { status: 200 });
};
