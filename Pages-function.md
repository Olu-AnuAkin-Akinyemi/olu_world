# Pages Function + Privacy Page
## `functions/api/player-event.ts` · oluanuakin.me

---

## `functions/api/player-event.ts`

Create this file at exactly that path in your project root.

```ts
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
```

---

## Privacy Page — `/privacy`

Create `privacy.html` in your project root (or `src/pages/privacy.html`
depending on your Vite setup). Style it to match your site.

The content below covers GDPR, CCPA, and your specific data collection.
Copy and adapt the wording into your existing page template:

```html
<!-- Page title: Privacy · øLu AnuAkin -->

<section class="privacy-section">
  <div class="section-inner">
    <p class="sec-eyebrow">Legal</p>
    <h1 class="privacy-title">Privacy Policy</h1>
    <p class="privacy-updated">Last updated: May 2026</p>

    <div class="privacy-body">

      <h2>Overview</h2>
      <p>
        oluanuakin.me is a personal artist site. This policy explains what data
        is collected when you visit and use the audio player, and how it is used.
        No advertising networks, tracking pixels, or third-party analytics
        services are used on this site.
      </p>

      <h2>Audio Player Data</h2>
      <p>
        When you use the audio player, the following information is recorded:
      </p>
      <ul>
        <li>
          <strong>Listening activity</strong> — which tracks you play, how long
          you listen, whether you complete a track, and whether you seek within
          a track.
        </li>
        <li>
          <strong>Approximate location</strong> — country, region, and city,
          derived from your IP address at the moment of the request. Your raw
          IP address is never stored. A non-reversible daily hash is used solely
          to count unique listeners; it resets every 24 hours.
        </li>
        <li>
          <strong>Device type</strong> — mobile or desktop, derived from your
          browser's user agent string.
        </li>
        <li>
          <strong>Session identifier</strong> — a randomly generated ID created
          when you open this site and deleted automatically when you close the
          tab. It is not linked to your identity in any way.
        </li>
        <li>
          <strong>Platform link clicks</strong> — if you click a link to
          Spotify, Bandcamp, Apple Music, or another platform, the destination
          is recorded alongside the track you were listening to.
        </li>
        <li>
          <strong>Referring source</strong> — the domain you came from (e.g.
          instagram.com), if any. No path or query string is stored.
        </li>
        <li>
          <strong>Time of play</strong> — the UTC hour at which listening
          occurred, with no date precision beyond the day stored in the
          anonymous hash.
        </li>
      </ul>

      <h2>What Is Not Collected</h2>
      <ul>
        <li>Your name, email address, or any contact information
            (unless you submit the mailing list form separately).</li>
        <li>Your full IP address.</li>
        <li>Cookies or any persistent identifiers from the audio player.</li>
        <li>Browser fingerprint data.</li>
        <li>Any data from other tabs or sites.</li>
      </ul>

      <h2>Mailing List</h2>
      <p>
        If you submit the mailing list form, your email address is collected
        and stored separately from listening data. It is used only to send
        release announcements and early access notifications. You can
        unsubscribe at any time via the link in any email.
      </p>

      <h2>How Data Is Used</h2>
      <p>
        Listening data is used to understand which music resonates with
        listeners, where the audience is located, and which platforms they
        prefer. It informs release decisions and promotional strategy.
        It is never sold, shared with advertisers, or used for any purpose
        other than understanding how people engage with the music.
      </p>

      <h2>Data Retention</h2>
      <p>
        Anonymous listening data is retained for up to 12 months and then
        deleted. Mailing list data is retained until you unsubscribe.
      </p>

      <h2>Your Rights</h2>
      <p>
        If you are located in the EU/EEA (GDPR) or California (CCPA), you
        have the right to request information about data collected during your
        session, or to request its deletion. Because session data is anonymous
        and not linked to any identity, fulfilling deletion requests requires
        you to provide your session ID (available in your browser's
        sessionStorage under the key <code>olu_sid</code> while on the site).
      </p>
      <p>
        To make a request, contact:
        <a href="mailto:hello@oluanuakin.me">hello@oluanuakin.me</a>
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        If data collection practices change materially, this page will be
        updated with a new date. Continued use of the site after changes
        constitutes acceptance.
      </p>

    </div>
  </div>
</section>
```

---

## Checklist

- [ ] `npm install -D @cloudflare/workers-types`
- [ ] `functions/tsconfig.json` created (see d1-setup.md Step 6)
- [ ] `functions/api/player-event.ts` created with code above
- [ ] `wrangler.toml` updated with D1 binding (see d1-setup.md Step 3)
- [ ] D1 schema created (see d1-setup.md Step 4)
- [ ] `main.js` pause + ended handlers updated with `track_duration_s`
- [ ] `/privacy` page live and linked from footer
- [ ] WAF rate limiting rule set (see d1-setup.md Step 7)
- [ ] Deployed and verified with D1 console query