# D1 Analytics — Setup Guide
## Cloudflare Pages · oluanuakin.me

---

## Step 1 — Install Workers types

Run in your project root:

```bash
npm install -D @cloudflare/workers-types
```

---

## Step 2 — Create the D1 database

```bash
npx wrangler d1 create oluanuakin-analytics
```

Wrangler will output something like:

```
✅ Successfully created DB 'oluanuakin-analytics'
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy that `database_id` — you need it in the next step.**

---

## Step 3 — Update `wrangler.toml`

Add this block to your existing `wrangler.toml`.
If you don't have a `wrangler.toml` yet, create one in your project root.

```toml
name = "oluanuakin-me"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "oluanuakin-analytics"
database_id = "YOUR_DATABASE_ID_HERE"   # ← paste from Step 2
```

---

## Step 4 — Run the schema

Run this exactly as written — it creates the table and all indexes in one command:

```bash
npx wrangler d1 execute oluanuakin-analytics --remote --command "
CREATE TABLE IF NOT EXISTS player_events (
  id               TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  track_id         TEXT    NOT NULL,
  event_type       TEXT    NOT NULL CHECK (event_type IN ('play','pause','complete','seek','link_click')),
  link_dest        TEXT,
  device_type      TEXT,
  session_id       TEXT    NOT NULL,
  play_duration_s  INTEGER,
  listen_pct       REAL,
  track_duration_s INTEGER,
  seek_position_s  INTEGER,
  ip_hash          TEXT,
  country          TEXT,
  region           TEXT,
  city             TEXT,
  entry_source     TEXT,
  hour_utc         INTEGER,
  created_at       TEXT    DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_track_events ON player_events (track_id, event_type);
CREATE INDEX IF NOT EXISTS idx_session      ON player_events (session_id);
CREATE INDEX IF NOT EXISTS idx_country      ON player_events (country);
CREATE INDEX IF NOT EXISTS idx_created      ON player_events (created_at);
"
```

Verify it worked:

```bash
npx wrangler d1 execute oluanuakin-analytics --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
```

You should see `player_events` in the output.

---

## Step 5 — Create the functions folder structure

In your project root, create this path if it doesn't exist:

```
functions/
  api/
    player-event.ts
  tsconfig.json
```

Contents of each file are in `pages-function-ts.md`.

---

## Step 6 — Add `functions/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "types": ["@cloudflare/workers-types"],
    "strict": true,
    "noEmit": true
  },
  "include": ["./**/*.ts"]
}
```

This is completely isolated from your main Vite/JS build.
It does not affect `main.js`, `vite.config.js`, or anything else.

---

## Step 7 — Set WAF rate limiting

In the Cloudflare Dashboard:

1. Select your `oluanuakin.me` zone
2. Security → WAF → Rate Limiting Rules → **Create rule**
3. Configure:
   - **Rule name:** `player-event rate limit`
   - **Field:** URI Path · **Operator:** equals · **Value:** `/api/player-event`
   - **Rate:** 20 requests per 60 seconds
   - **Scope:** IP
   - **Action:** Block
4. Save and deploy

---

## Step 8 — Update `main.js` (two lines)

In your `initCatalogPlayer()` function, the pause and ended handlers
need `track_duration_s` added so the server can derive `listen_pct`.

Find your pause handler and update:
```js
// BEFORE
sendEvent({ track_id: track, event_type: 'pause', play_duration_s: listenedSecs });

// AFTER
sendEvent({ track_id: track, event_type: 'pause', play_duration_s: listenedSecs, track_duration_s: duration });
```

Find your ended handler and update:
```js
// BEFORE
sendEvent({ track_id: track, event_type: 'complete', play_duration_s: listenedSecs });

// AFTER
sendEvent({ track_id: track, event_type: 'complete', play_duration_s: listenedSecs, track_duration_s: duration });
```

`duration` is already in scope — it's parsed from `btn.dataset.duration` at the top of each player's init block.

---

## Step 9 — Deploy

```bash
git add .
git commit -m "add: D1 player analytics, Pages Function, WAF rate limit"
git push
```

Cloudflare Pages detects the push and auto-deploys.
The Pages Function at `functions/api/player-event.ts` goes live automatically.

---

## Step 10 — Verify

Play a track on the live site, then go to:
**Cloudflare Dashboard → D1 → oluanuakin-analytics → Console**

Run:
```sql
SELECT * FROM player_events ORDER BY created_at DESC LIMIT 5;
```

You should see rows with `country`, `region`, `city`, `ip_hash`, `listen_pct` populated.

---

## Useful queries — save these in D1 Console

```sql
-- Attention score per track (avg % listened)
SELECT
  track_id,
  ROUND(AVG(listen_pct), 1) AS avg_listen_pct,
  COUNT(*) AS total_plays
FROM player_events
WHERE event_type IN ('pause','complete') AND listen_pct IS NOT NULL
GROUP BY track_id
ORDER BY avg_listen_pct DESC;

-- Unique listeners per track (hashed IP, daily)
SELECT track_id, COUNT(DISTINCT ip_hash) AS unique_listeners
FROM player_events
WHERE event_type = 'play'
GROUP BY track_id;

-- Time spent per track — avg seconds before pause/complete
SELECT
  track_id,
  ROUND(AVG(play_duration_s), 0) AS avg_seconds,
  MAX(play_duration_s) AS longest_listen
FROM player_events
WHERE event_type IN ('pause','complete') AND play_duration_s IS NOT NULL
GROUP BY track_id;

-- Top countries
SELECT country, COUNT(*) AS plays
FROM player_events
WHERE event_type = 'play' AND country IS NOT NULL
GROUP BY country ORDER BY plays DESC LIMIT 10;

-- Top cities
SELECT city, region, country, COUNT(*) AS plays
FROM player_events
WHERE event_type = 'play' AND city IS NOT NULL
GROUP BY city ORDER BY plays DESC LIMIT 10;

-- Platform clicks per track
SELECT track_id, link_dest, COUNT(*) AS clicks
FROM player_events
WHERE event_type = 'link_click'
GROUP BY track_id, link_dest
ORDER BY track_id, clicks DESC;

-- Best listening hours (UTC)
SELECT hour_utc, COUNT(*) AS plays
FROM player_events
WHERE event_type = 'play'
GROUP BY hour_utc ORDER BY hour_utc;

-- Completion rate per track
SELECT
  track_id,
  COUNT(CASE WHEN event_type = 'complete' THEN 1 END) AS completions,
  COUNT(CASE WHEN event_type = 'play' THEN 1 END) AS plays,
  ROUND(
    COUNT(CASE WHEN event_type = 'complete' THEN 1 END) * 100.0
    / NULLIF(COUNT(CASE WHEN event_type = 'play' THEN 1 END), 0), 1
  ) AS completion_pct
FROM player_events
GROUP BY track_id;

-- Where people seek to most (attention map)
SELECT track_id, seek_position_s, COUNT(*) AS frequency
FROM player_events
WHERE event_type = 'seek'
GROUP BY track_id, seek_position_s
ORDER BY track_id, frequency DESC;
```