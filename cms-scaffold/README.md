# CMS Scaffold — Notes/Log Section

> **Scope:** Admin interface for creating and managing Log entries (written, audio, video, press).  
> **Stack:** Cloudflare D1 (SQLite) + Pages Functions + R2 (media storage) + Cloudflare Access (auth).  
> **Everything else** (Gallery, Tracks, Catalog, Kindred, Hero) stays hand-edited in HTML.

---

## What's Here (Steps 1–2)

```
cms-scaffold/
├── migrations/
│   ├── 001_initial_schema.sql    # Notes table with media support
│   └── 002_seed_content.sql      # Current Wavy Magazine entry + 3 planned drafts
├── functions/
│   ├── _middleware.js             # CF Access JWT verification (protects writes)
│   └── api/
│       ├── _utils.js             # Shared helpers (response, ID gen, timestamp)
│       ├── notes/
│       │   ├── index.js          # GET list + POST create
│       │   ├── [id].js           # GET single + PUT update + DELETE
│       │   └── reorder.js        # PUT batch sort_order update
│       ├── media/
│       │   └── upload.js         # File upload → R2 (or CF Images for photos)
│       └── deploy/
│           └── trigger.js        # Triggers CF Pages rebuild after edits
├── wrangler.toml                 # D1 + R2 bindings (fill in your IDs)
└── README.md                     # This file
```

---

## What's NOT Here Yet (Steps 3–4 — we build together)

- **Step 3 — Build integration:** Vite pre-build script that fetches notes from D1 and injects HTML into `index.html` template markers. Needs to match your exact Log section markup.
- **Step 4 — Admin UI:** The `/admin/` page where you type a title, pick a type, upload media, write content, and hit publish. Vanilla HTML + JS.

These depend on your live codebase, so we'll wire them in Claude Code when you're ready.

---

## Setup (when you're ready to build)

### 1. Create the D1 database

```bash
npx wrangler d1 create oluanuakin-cms
```

Copy the `database_id` from the output and paste it into `wrangler.toml`.

### 2. Run migrations

```bash
# Create the table
npx wrangler d1 execute oluanuakin-cms --file=./migrations/001_initial_schema.sql

# Seed with existing content
npx wrangler d1 execute oluanuakin-cms --file=./migrations/002_seed_content.sql
```

For local dev, add `--local` to both commands.

### 3. Create the R2 bucket (for media uploads)

```bash
npx wrangler r2 bucket create oluanuakin-media
```

### 4. Set up Cloudflare Access

In the Cloudflare Zero Trust dashboard:
1. Create an Access Application
2. Protect path: `oluanuakin.me/admin/*`
3. Policy: Allow your email address
4. Copy the **Team Domain** and **AUD tag**

### 5. Set environment variables

```bash
npx wrangler secret put CF_ACCESS_TEAM_DOMAIN
npx wrangler secret put CF_ACCESS_AUD
npx wrangler secret put CF_DEPLOY_HOOK_URL
npx wrangler secret put MEDIA_PUBLIC_URL
```

### 6. Create a deploy hook

In CF Pages dashboard → your site → Settings → Builds → Deploy hooks.
Create one, copy the URL, use it for `CF_DEPLOY_HOOK_URL`.

### 7. Copy scaffold files into your repo

```bash
# From your project root:
cp -r cms-scaffold/migrations/ ./migrations/
cp -r cms-scaffold/functions/ ./functions/
# Merge wrangler.toml bindings into your existing config
```

### 8. Test the API locally

```bash
npx wrangler pages dev . --d1=DB=oluanuakin-cms

# In another terminal:
curl http://localhost:8788/api/notes
# Should return the seeded Wavy Magazine entry
```

---

## API Reference

### Notes

| Method | Path | What it does |
|--------|------|-------------|
| `GET` | `/api/notes` | List published notes |
| `GET` | `/api/notes?status=all` | List all notes (admin) |
| `GET` | `/api/notes?type=press` | Filter by type |
| `POST` | `/api/notes` | Create note (JSON body) |
| `GET` | `/api/notes/:id` | Get single note |
| `PUT` | `/api/notes/:id` | Update note fields |
| `DELETE` | `/api/notes/:id` | Delete note |
| `PUT` | `/api/notes/reorder` | Batch update sort_order |

### Media

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/api/media/upload` | Upload file (multipart form, field: `file`) |

### Deploy

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/api/deploy/trigger` | Trigger site rebuild |

### Create note example

```bash
curl -X POST http://localhost:8788/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "What AFTERGLOW Actually Means",
    "date_display": "Mar 2026",
    "note_type": "written",
    "description": "Handwritten reflection on the project origin.",
    "full_content": "<p>The word afterglow means...</p>",
    "media_type": "image",
    "media_url": "/media/image/handwritten-note.webp",
    "media_alt": "Handwritten page about Afterglow",
    "status": "published"
  }'
```

---

## Notes table fields

| Field | Type | Purpose |
|-------|------|---------|
| `title` | text | Entry title shown in the Log feed |
| `date_display` | text | Human-readable date ("Apr 2025") |
| `note_type` | text | written / audio / video / press |
| `description` | text | Short preview text in the feed row |
| `full_content` | text | HTML body shown in the overlay on click |
| `external_url` | text | Link out (e.g. magazine article URL) |
| `media_type` | text | image / audio / video (or null) |
| `media_url` | text | URL to the attached media file |
| `media_alt` | text | Alt text for images, title for audio/video |
| `sort_order` | int | Display order (lower = higher in feed) |
| `status` | text | draft / published |

---

## What happens when you publish a note

1. You fill out the form in `/admin/` and click Publish
2. Admin JS sends `POST /api/notes` with the content
3. D1 stores the note
4. Admin JS sends `POST /api/deploy/trigger`
5. Cloudflare Pages rebuilds the site (~60 seconds)
6. The build script fetches all published notes from D1
7. It renders them as HTML matching your Log section markup
8. Fresh static site goes live — no JS needed on the public page

---

## Next steps (Steps 3–4)

When you open Claude Code post-May 14:

1. **Step 3:** We add `<!-- CMS:notes -->` markers to your `index.html` and write `scripts/build-notes.mjs` — a pre-build script that queries D1 and outputs HTML matching your exact `.note-item` structure (date, icon, title, description, pill, full_content).

2. **Step 4:** We build `/admin/index.html` — a simple form with fields for each note property, a file upload for media, a preview panel, and a "Publish" button that saves + triggers rebuild.
