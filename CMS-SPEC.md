# CMS Spec — Log Section Content Management

> **Status:** Draft (March 2026)
> **Scope:** Log section only. Everything else on the site stays hand-edited.
> **Stack:** Cloudflare Pages Functions + D1 (SQLite) + Cloudflare Access
> **Goal:** Add, edit, and publish Log entries from a browser form — no code editing, no deploys.

---

## Why

The Log section (`#log` in `index.html`) is the only section where content velocity will outpace manual HTML editing. Gallery, Tracks, Catalog, Kindred, and Hero change per release cycle (a few times a year). The Log is meant to grow continuously — process notes, voice memos, press features, video clips. Editing `index.html` by hand for every new entry kills momentum.

A CMS for the Log solves:
1. **Add entries without touching code** — fill out a form, hit publish
2. **From any device** — phone, tablet, laptop, no VS Code required
3. **Media embedding** — attach images, audio files, or video links through the form
4. **Draft/publish workflow** — write entries ahead of time, publish when ready

### What the CMS does NOT touch

| Section | CMS-managed? | Why not |
|---------|-------------|---------|
| Hero | No | Changes per release cycle, design-driven swap (PRE-RELEASE-HERO.md) |
| Gallery | No | Curated art pieces, changes rarely, needs image pipeline control |
| Tracks | No | Tied to release milestones, changes with Afterglow finalization |
| Catalog/Archive | No | Release-driven, 1-2 changes per year |
| Kindred | No | Occasional artist additions, simple HTML edit |
| Sync | No | Static copy + mailto CTA |
| **Log** | **Yes** | **Frequent, varied content types, growing feed** |

---

## Architecture Decision: Self-Built on Cloudflare

The site is already on Cloudflare Pages. Building on Cloudflare's own services means zero new vendors, zero new accounts, and the free tier covers everything.

| Option | Verdict |
|--------|---------|
| Sanity / Contentful | Overkill for a single-table CMS. External dependency. Free tier limits. |
| Strapi (self-hosted) | Needs a server. Not serverless. Hosting cost. |
| Google Sheets + API | Fragile. No media handling. No auth. |
| **Cloudflare D1 + Pages Functions** | **Free tier (5M reads/day, 100k writes/day). Same platform. Serverless. SQLite.** |

### How It Works

```
You (Admin Page)                    Visitors (Public Site)
     │                                      │
     ▼                                      ▼
┌──────────────┐                  ┌───────────────────┐
│ /admin        │                  │ oluanuakin.me      │
│ Protected by  │                  │ Static HTML        │
│ CF Access     │                  │ (built by Vite)    │
└──────┬───────┘                  └───────────────────┘
       │                                    ▲
       ▼                                    │ Build injects
┌──────────────┐                  ┌───────────────────┐
│ /api/log/*    │                  │ Vite build step    │
│ Pages Fns     │─── publish ────▶│ Fetches log entries │
│ CRUD + media  │    (rebuild)    │ from D1, renders    │
└──────┬───────┘                  │ into index.html     │
       │                          └───────────────────┘
       ▼
┌──────────────┐   ┌─────────────────┐
│ Cloudflare D1│   │ Cloudflare R2   │
│ Log entries  │   │ Media files     │
│ (SQLite)     │   │ (images, audio) │
└──────────────┘   └─────────────────┘
```

**Key principle:** The public site stays **pure static HTML**. No client-side API calls. No JS required to render Log entries. The CMS writes to D1, triggers a Vite rebuild, and the build script injects the latest entries into `index.html`. Same performance as today.

---

## Log Entry Schema

### What a Log entry looks like today

From [index.html:518-541](index.html#L518-L541) — the existing Wavy Magazine entry:

```html
<div class="note-item reveal" data-note-type="press">
  <span class="note-date">Apr 2025</span>
  <div class="note-media-icon"><!-- SVG icon per type --></div>
  <div class="note-body">
    <p class="note-title">Channeling Sound and Spirit Across Borders</p>
    <p class="note-desc">Featured in Wavy Magazine — on self-expression...</p>
  </div>
  <span class="note-media-pill press">Press</span>
  <div class="note-full-content" hidden>
    <!-- HTML body shown in overlay on click -->
    <p>Featured in <strong>Wavy Magazine</strong>...</p>
    <blockquote>...</blockquote>
    <p class="note-press-link-wrap"><a href="...">Read full article →</a></p>
  </div>
</div>
```

### Database Table

```sql
CREATE TABLE log_entries (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  title         TEXT NOT NULL,
  date_display  TEXT NOT NULL,          -- Human-readable: "Apr 2025", "Mar 2026"
  date_sort     TEXT NOT NULL,          -- ISO for ordering: "2025-04-01"
  entry_type    TEXT NOT NULL CHECK (entry_type IN ('written', 'audio', 'video', 'press')),
  description   TEXT NOT NULL,          -- Short preview text shown in the feed
  full_content  TEXT,                   -- HTML body for the overlay (nullable for simple entries)
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);
```

### Media Attachments Table

Log entries can contain inline media — images in written entries, audio files in audio entries, video embeds in video entries. These are stored separately and referenced in `full_content`.

```sql
CREATE TABLE log_media (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  entry_id    TEXT NOT NULL REFERENCES log_entries(id) ON DELETE CASCADE,
  media_type  TEXT NOT NULL CHECK (media_type IN ('image', 'audio', 'video')),
  url         TEXT NOT NULL,            -- R2 URL (images, audio) or Cloudflare Stream/external URL (video)
  alt_text    TEXT,                     -- For images
  filename    TEXT,                     -- Original filename for reference
  created_at  TEXT DEFAULT (datetime('now'))
);
```

### Planned entries (from strategy docs)

| Title | Type | Media |
|-------|------|-------|
| What AFTERGLOW actually means | written | Inline image (handwritten photo) |
| Collage — using your hands, not a screen | video | Process clip (Cloudflare Stream or external) |
| WTFYA — why it even exists | audio | Voice memo file (uploaded to R2) |
| Wavy Magazine feature (existing) | press | External link |

---

## Media Handling

### Images — Cloudflare R2

**Why R2 over Cloudflare Images:** R2 is a simple object store (free for 10GB storage, 10M reads/mo). For the Log, you're uploading a few images per entry — not generating responsive variants. R2 is simpler and cheaper ($0/mo within free tier) than Cloudflare Images ($5/mo). If you ever need responsive variants for Log images, you can add Cloudflare Image Resizing later.

**Upload flow:**
1. Admin selects an image file in the form
2. Pages Function uploads to R2 bucket (`PUT` via R2 binding)
3. Returns the public URL: `https://media.oluanuakin.me/{entry_id}/{filename}`
4. URL is inserted into `full_content` HTML as `<img src="..." alt="...">`

**R2 bucket setup:**
- Bucket name: `olu-log-media`
- Custom domain: `media.oluanuakin.me` (R2 custom domains are free on Cloudflare)
- Public read access (media is not private)

### Audio — Cloudflare R2

Voice memos and audio clips uploaded to the same R2 bucket. Rendered in `full_content` as:

```html
<audio controls preload="metadata">
  <source src="https://media.oluanuakin.me/{entry_id}/memo.mp3" type="audio/mpeg">
</audio>
```

**Accepted formats:** MP3, M4A, WAV. Browser `<audio>` handles playback natively — no custom player needed for the Log overlay.

### Video — Cloudflare Stream or External Embed

Two paths:
1. **Cloudflare Stream** (already in use, customer code `mrl30lrm2q4cfcg0`): Upload video to Stream, store video ID, render as iframe in `full_content`
2. **External embed** (YouTube, Vimeo): Paste embed URL in the form, stored in `full_content` as iframe with `data-src` for lazy loading

```html
<!-- Cloudflare Stream -->
<iframe
  data-src="https://customer-mrl30lrm2q4cfcg0.cloudflarestream.com/{VIDEO_ID}/iframe?controls=true"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
  allowfullscreen="true"
></iframe>

<!-- External (YouTube/Vimeo) -->
<iframe data-src="https://www.youtube.com/embed/{VIDEO_ID}" allowfullscreen></iframe>
```

The existing overlay JS at [main.js:232-234](src/js/main.js#L232-L234) already handles `data-src` → `src` swap when the overlay opens. No JS changes needed.

---

## Admin Interface

### Auth — Cloudflare Access

Cloudflare Access (free, up to 50 users) protects `/admin/*`:
- **Login:** Email-based one-time PIN — no password to manage
- **Allowed:** Your email only
- **Setup:** Cloudflare Zero Trust dashboard → Access Application → protect `oluanuakin.me/admin/*`
- **Verification:** Pages Functions check `CF-Access-JWT-Assertion` header on every API call

No custom auth code. Cloudflare handles the login page, session, and JWT.

### Admin Page

Single page at `/admin/index.html`. Vanilla HTML + JS — consistent with the site's stack.

```
/admin/
  index.html        -- Log admin (entry list + form)
  admin.js          -- CRUD logic, media upload, fetch calls
  admin.css          -- Admin-only styles
```

### Admin UI — What You See

**Entry list view:**
- List of all entries (drafts and published), sorted by `date_sort` descending
- Each row shows: date, type pill, title, status badge (draft/published)
- Click to edit. "New Entry" button at top.
- "Publish Changes" button triggers site rebuild

**Entry form:**

```
┌─────────────────────────────────────────────┐
│  ← Back to list              [Save Draft]   │
│                              [Publish]       │
│                                              │
│  Title: ____________________________________│
│                                              │
│  Date: [Mar 2026________]                   │
│                                              │
│  Type: (•) Written  ( ) Audio               │
│        ( ) Video    ( ) Press               │
│                                              │
│  Description (preview text):                │
│  ___________________________________________│
│  ___________________________________________│
│                                              │
│  Full Content (overlay body):               │
│  ┌─────────────────────────────────────┐    │
│  │ Rich text editor                     │    │
│  │ Bold / Italic / Link / Quote / Image │    │
│  │                                      │    │
│  │ Write or paste content here...       │    │
│  │                                      │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  Media:                                      │
│  [Upload Image] [Upload Audio] [Add Video]  │
│  ┌──────┐                                   │
│  │ thumb │ memo.mp3 (1.2 MB)  [Remove]     │
│  └──────┘                                   │
│                                              │
│  Status: Draft ▼                             │
└─────────────────────────────────────────────┘
```

**Rich text editor:** Use a lightweight library like [Trix](https://trix-editor.org/) (58kb, zero config, outputs clean HTML) or build a simple `contenteditable` div with toolbar buttons for bold, italic, link, blockquote. Trix is the pragmatic choice — it's one `<trix-editor>` tag and outputs sanitized HTML that maps directly to `full_content`.

**Media upload:**
- "Upload Image" → file picker → uploads to R2 → inserts `<img>` into the rich text editor at cursor position
- "Upload Audio" → file picker → uploads to R2 → inserts `<audio>` element into full_content
- "Add Video" → modal asking for Cloudflare Stream video ID or external embed URL → inserts `<iframe data-src="...">` into full_content

### Type-specific icon mapping

The SVG icons in the feed are determined by `entry_type`. The build script maps type → icon:

| Type | Icon | Color |
|------|------|-------|
| written | Pen/pencil SVG | `#5A9EBF` |
| audio | Waveform SVG | `#5A9EBF` |
| video | Play triangle SVG | `#5A9EBF` |
| press | Document lines SVG (current) | `#5A9EBF` |

These SVGs are baked into the build template, not stored in D1.

---

## API Routes (Pages Functions)

```
functions/
  api/
    log/
      index.js          -- GET (list all), POST (create entry)
      [id].js           -- GET (single), PUT (update), DELETE
    media/
      upload.js         -- POST (upload file to R2, return URL)
      [id].js           -- DELETE (remove file from R2)
    deploy/
      trigger.js        -- POST (hits Cloudflare Pages deploy hook)
  _middleware.js         -- CF Access JWT verification (all /api/* routes)
```

**GET /api/log** — List all entries (admin sees drafts + published):
```js
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT e.*, GROUP_CONCAT(m.url) as media_urls FROM log_entries e LEFT JOIN log_media m ON e.id = m.entry_id GROUP BY e.id ORDER BY e.date_sort DESC'
  ).all();
  return Response.json(results);
}
```

**POST /api/log** — Create new entry:
```js
export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  await env.DB.prepare(
    'INSERT INTO log_entries (id, title, date_display, date_sort, entry_type, description, full_content, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, body.title, body.date_display, body.date_sort, body.entry_type, body.description, body.full_content || null, body.status || 'draft').run();
  return Response.json({ id }, { status: 201 });
}
```

**POST /api/media/upload** — Upload file to R2:
```js
export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const file = formData.get('file');
  const entryId = formData.get('entry_id');
  const key = `${entryId}/${file.name}`;

  await env.LOG_MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type }
  });

  const url = `https://media.oluanuakin.me/${key}`;
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  await env.DB.prepare(
    'INSERT INTO log_media (id, entry_id, media_type, url, filename) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, entryId, getMediaType(file.type), url, file.name).run();

  return Response.json({ id, url }, { status: 201 });
}

function getMediaType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  return 'image';
}
```

**POST /api/deploy/trigger** — Trigger site rebuild:
```js
export async function onRequestPost({ env }) {
  const response = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
  return Response.json({ success: response.ok });
}
```

---

## Build Pipeline Changes

### Current Flow
```
Vite build → bundles src/js + src/css → outputs index.html + assets → dist/
```

### New Flow
```
pre-build script → fetches log entries from D1 → renders HTML
Vite build → injects rendered log entries into index.html → bundles → dist/
```

### Template Markers

Replace the hardcoded log entries in `index.html` with markers:

```html
<!-- Inside #log .section-inner, after the filter strip -->

<!-- CMS:log -->
<!-- Existing entries stay here during migration, then get replaced by build output -->
<!-- /CMS:log -->
```

### Build-time Renderer

```js
// scripts/build-log.mjs

const TYPE_ICONS = {
  press: `<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2" width="11" height="10" rx="1" stroke="#5A9EBF" stroke-width="0.8"/>
    <line x1="3.5" y1="5" x2="10.5" y2="5" stroke="#5A9EBF" stroke-width="0.7"/>
    <line x1="3.5" y1="7" x2="8" y2="7" stroke="#5A9EBF" stroke-width="0.7"/>
    <line x1="3.5" y1="9" x2="6.5" y2="9" stroke="#5A9EBF" stroke-width="0.7"/>
  </svg>`,
  written: `<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 11l7-7 1 1-7 7H3v-1z" stroke="#5A9EBF" stroke-width="0.8"/>
  </svg>`,
  audio: `<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 5.5h2l3-2.5v8l-3-2.5H2v-3z" stroke="#5A9EBF" stroke-width="0.8"/>
    <path d="M9 5c.7.7.7 3.3 0 4" stroke="#5A9EBF" stroke-width="0.7"/>
  </svg>`,
  video: `<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="4,2.5 11,7 4,11.5" stroke="#5A9EBF" stroke-width="0.8" fill="none"/>
  </svg>`
};

function renderLogEntry(entry) {
  const icon = TYPE_ICONS[entry.entry_type] || TYPE_ICONS.written;
  const fullContentHtml = entry.full_content
    ? `<div class="note-full-content" hidden>${entry.full_content}</div>`
    : '';

  return `
      <div class="note-item reveal" data-note-type="${entry.entry_type}">
        <span class="note-date">${entry.date_display}</span>
        <div class="note-media-icon">${icon}</div>
        <div class="note-body">
          <p class="note-title">${escapeHtml(entry.title)}</p>
          <p class="note-desc">${escapeHtml(entry.description)}</p>
        </div>
        <span class="note-media-pill ${entry.entry_type}">${capitalize(entry.entry_type)}</span>
        ${fullContentHtml}
      </div>`;
}
```

The build script fetches published entries from D1 via Cloudflare's REST API (or via `wrangler d1 execute`), renders the HTML, and replaces the content between `<!-- CMS:log -->` markers. The output is static HTML — identical in structure to what's hand-coded today.

---

## JS Impact

**None.** The existing JS in [main.js:199-265](src/js/main.js#L199-L265) handles:
- Filter buttons → toggles `.hidden` class based on `data-note-type` ✓
- Click → reads `.note-date`, `.note-title`, `.note-full-content` from DOM → populates overlay ✓
- Overlay iframe lazy loading (`data-src` → `src`) ✓

All of this works on DOM structure alone. As long as the build script outputs the same HTML structure (`.note-item` with the right children and attributes), the JS doesn't need a single change.

---

## Migration Path

### Phase 1 — Database + API

1. Install Wrangler CLI (`npm install -g wrangler`)
2. Create D1 database: `wrangler d1 create olu-log`
3. Run schema migration:
   ```
   wrangler d1 execute olu-log --file=migrations/001_schema.sql
   ```
4. Seed with existing Wavy Magazine entry:
   ```
   wrangler d1 execute olu-log --file=migrations/002_seed.sql
   ```
5. Create R2 bucket: `wrangler r2 bucket create olu-log-media`
6. Add D1 + R2 bindings to `wrangler.toml`
7. Build Pages Functions (4 files: `log/index.js`, `log/[id].js`, `media/upload.js`, `deploy/trigger.js`, `_middleware.js`)
8. Set up Cloudflare Access on `/admin/*` and `/api/*`
9. **Test:** `curl https://oluanuakin.me/api/log` returns the seeded entry

### Phase 2 — Build Integration

1. Add `<!-- CMS:log -->` / `<!-- /CMS:log -->` markers to `index.html`
2. Write `scripts/build-log.mjs` (fetches D1, renders HTML)
3. Add pre-build step to `package.json`:
   ```json
   "scripts": {
     "prebuild": "node scripts/build-log.mjs",
     "build": "vite build"
   }
   ```
4. Diff test: built output must match current site exactly
5. **Test:** `npm run build` → verify Log section renders correctly in `dist/index.html`

### Phase 3 — Admin Interface

1. Create `/admin/index.html` — entry list + form
2. Wire up CRUD to `/api/log/*`
3. Add media upload (image + audio to R2, video URL input)
4. Integrate Trix editor for `full_content`
5. Add "Publish Changes" button → `POST /api/deploy/trigger`
6. **Test:** Full round-trip — create entry in admin → publish → verify on live site

### Phase 4 — Polish

1. Entry preview in admin (renders the overlay body so you see what visitors see)
2. Bulk status changes (publish/unpublish multiple entries)
3. Media library view (all uploaded files with delete option)
4. Image resize on upload (optional — R2 + basic sharp processing in the Pages Function)

---

## File Structure

```
/
  index.html                    # Has <!-- CMS:log --> markers
  admin/
    index.html                  # Log admin page (protected by CF Access)
    admin.js                    # CRUD, media upload, deploy trigger
    admin.css                   # Admin-only styles
  functions/
    api/
      log/
        index.js                # GET list, POST create
        [id].js                 # GET/PUT/DELETE single entry
      media/
        upload.js               # POST file to R2
        [id].js                 # DELETE file from R2
      deploy/
        trigger.js              # POST triggers Pages rebuild
    _middleware.js               # CF Access JWT verification
  migrations/
    001_schema.sql              # CREATE TABLE log_entries + log_media
    002_seed.sql                # INSERT Wavy Magazine entry
  scripts/
    build-log.mjs               # NEW: fetches D1, renders log HTML into template
    optimize-images.mjs         # Unchanged (hero/brand assets)
  src/
    css/styles.css              # Unchanged
    js/main.js                  # Unchanged — reads from DOM as before
    js/gallery3d.js             # Unchanged
    js/hoverAudio.js            # Unchanged
```

---

## Cost

| Service | Free Tier | This Project |
|---------|-----------|-------------|
| Cloudflare D1 | 5M reads/day, 100k writes/day | ~10 reads/build, ~1-2 writes/week |
| Cloudflare R2 | 10GB storage, 10M reads/mo | A few MB of images + audio |
| Cloudflare Pages Functions | 100k requests/day | ~5-10 admin requests/week |
| Cloudflare Access | 50 users free | 1 user |

**Monthly cost: $0.** Everything stays within free tiers. A single-person admin writing a few log entries per week won't come close to any limit.

---

## Wrangler Config

```toml
# wrangler.toml (add to project root)
name = "olu-world"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "olu-log"
database_id = "<your-d1-id>"

[[r2_buckets]]
binding = "LOG_MEDIA"
bucket_name = "olu-log-media"

[vars]
DEPLOY_HOOK_URL = "<your-pages-deploy-hook-url>"
```

---

## When to Build

**After May 15 PWR swap.** The site needs to be stable before adding infrastructure. After May 15:
- Release pressure is off
- You'll want to start posting Log entries regularly (process notes, voice memos, press features)
- The Log becomes the primary content update channel

**Estimated effort:**
- Phase 1 (DB + API): Half a day
- Phase 2 (Build integration): Half a day
- Phase 3 (Admin UI): A focused weekend
- Phase 4 (Polish): Ongoing

---

## Future Expansion

If content velocity justifies it later, the same D1 + Pages Functions + build pattern can expand to other sections (Gallery, Catalog, Kindred) without architectural changes. But that's a decision for after the Log CMS proves itself — not now.
