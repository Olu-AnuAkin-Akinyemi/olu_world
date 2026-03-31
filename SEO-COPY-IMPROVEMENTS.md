
# SEO Copy Improvement Strategy — øLu AnuAkin

> **Project:** øLu AnuAkin — https://oluanuakin.me/
> **Stack:** Vite 5.x · Vanilla JS/CSS · Custom Audio/Video · Bandcamp/Spotify/Apple/Tidal
> **Why:** Improve visibility, citation, and conversion for a multidisciplinary artist, griot, and founder. Optimize for both traditional SEO and GEO (AI search engines).
> **Last updated:** 2026-03-16

---

## Current State Snapshot

| Element | Status | Notes |
| --- | --- | --- |
| `<title>` | ✅ Done | "øLu AnuAkin — Multidisciplinary · Griot" |
| `<meta description>` | ✅ Done | Griot, Founder, Minnesota, Yoruba roots (no release name — swap per era) |
| `<h1>` | ✅ Done | Visually-hidden: "øLu AnuAkin — Alternative Soul · Indie R&B" (eyebrow demoted to `<p>`) |
| Open Graph | ✅ Done | `og:title`, `og:description`, `og:image` (`about_FB_OG_photo.jpg`), `og:type`, `og:url` |
| Twitter Card | ✅ Done | `summary_large_image` with `about_FB_OG_photo.jpg` |
| JSON-LD structured data | ✅ Done | `MusicGroup` + 3 albums + `foundingDate: 2019` + Spotify in `sameAs` |
| Canonical URL | ✅ Done | `https://oluanuakin.me/` |
| `sitemap.xml` | ✅ Done | In `public/` — single URL entry |
| `robots.txt` | ✅ Done | In `public/` — allows all crawlers |
| Favicon | ✅ Done | SVG + PNG + ICO + Apple Touch + Web Manifest |
| Sync copy | ✅ Done | "available upon request" — stems/TV mix tags removed (Phase 2 deliverables) |
| Footer | ✅ Done | Instagram · Bandcamp · Stream (Odesli smart link) — SoundCloud removed |
| Archive | ✅ Done | Divine One (Cloudflare Stream) + Nirvana (YouTube). Sacred card preserved in comments |

---

## 1. Meta Description — Current / Swap Templates

**Current (pre-release — no release name):**

```html
<meta name="description" content="øLu AnuAkin — Multidisciplinary · Griot · Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots." />
```

**Afterglow pre-release (swap when ready):**

```html
<meta name="description" content="øLu AnuAkin — Multidisciplinary · Griot · Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots. Afterglow EP coming soon." />
```

**Afterglow post-release:**

```html
<meta name="description" content="øLu AnuAkin — Multidisciplinary · Griot · Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots. Afterglow EP out now." />
```

**Why:** Specific, citable, and concise. "Griot" and "Founder" add depth. Swap the release name and status as projects launch.

---

## 2. JSON-LD Structured Data — MusicGroup + Albums + Tracks

**Currently in `<head>` of `index.html`:**

```json
{
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": "øLu AnuAkin",
  "url": "https://oluanuakin.me/",
  "genre": ["Alternative Soul", "Indie R&B"],
  "description": "Multidisciplinary · Griot · Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots.",
  "image": "https://oluanuakin.me/about_FB_OG_photo.jpg",
  "foundingLocation": {
    "@type": "Place",
    "name": "Minnesota",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "MN",
      "addressCountry": "US"
    }
  },
  "foundingDate": "2019",
  "knowsAbout": [
    "Alternative Soul", "Indie R&B",
    "Music Production", "Visual Art", "Modeling", "Handmade Collage",
    "Cinematic World-Building", "Audio Engineering", "Performance Art",
    "Yoruba Culture", "Griot Storytelling Tradition"
  ],
  "member": [{"@type": "Person", "name": "øLu AnuAkin"}],
  "memberOf": {
    "@type": "Organization",
    "name": "Galorious Expression®",
    "url": "https://galoriousexpression.com/"
  },
  "sameAs": [
    "https://www.instagram.com/olu_anuakin/",
    "https://oluanuakin.bandcamp.com",
    "https://soundcloud.com/oluanuakin",
    "https://open.spotify.com/artist/6HlPxqjDQ8lM8iJiHqegxm"
  ],
  "track": [
    {
      "@type": "MusicRecording",
      "name": "PWR",
      "url": "https://oluanuakin.bandcamp.com/track/pwr-2",
      "duration": "PT3M",
      "description": "Personal transformation — stepping into power, resilience, and arrival."
    },
    {
      "@type": "MusicRecording",
      "name": "Nirvana",
      "description": "Lineage, love, where it all started — warmth and weight in equal measure."
    },
    {
      "@type": "MusicRecording",
      "name": "CLMB MTNS : v1",
      "url": "https://soundcloud.com/oluanuakin/clmb-mtns-v1",
      "description": "Ascension, grit, forward motion — a raw climb toward something greater."
    }
  ],
  "album": [
    {
      "@type": "MusicAlbum",
      "name": "PWR",
      "albumProductionType": "SingleRelease",
      "datePublished": "2026",
      "url": "https://oluanuakin.bandcamp.com/track/pwr-2",
      "description": "PWR — a single about personal transformation, stepping into power, resilience, and arrival."
    },
    {
      "@type": "MusicAlbum",
      "name": "Afterglow",
      "albumProductionType": "EPRelease",
      "datePublished": "2026",
      "description": "Afterglow EP — coming soon. Alternative Soul, Indie R&B."
    },
    {
      "@type": "MusicAlbum",
      "name": "Mama's Boy",
      "albumProductionType": "StudioAlbum",
      "url": "https://oluanuakin.bandcamp.com/album/mamas-boy",
      "description": "Mama's Boy — lineage, love, and where it all started."
    }
  ]
}
```

### Schema.org MusicGroup — Properties Reference

| Property | Status | GEO Value | Notes |
| --- | --- | --- | --- |
| `name`, `url`, `description` | ✅ | Baseline | Core identity |
| `genre` | ✅ | High | Alternative Soul, Indie R&B |
| `image` | ✅ | Medium | `about_FB_OG_photo.jpg` — rich snippets in search |
| `foundingLocation` | ✅ | High | Location-based queries ("artists from Minnesota") |
| `foundingDate` | ✅ | Medium | `"2019"` |
| `knowsAbout` | ✅ | **Highest** | Topical authority — includes Modeling, Handmade Collage, Audio Engineering, Performance Art |
| `memberOf` | ✅ | Medium | Cross-references Galorious Expression® entity |
| `sameAs` | ✅ | High | Instagram, Bandcamp, SoundCloud, Spotify |
| `track` | ✅ | High | PWR, Nirvana, CLMB MTNS |
| `album` | ✅ | High | PWR (single), Afterglow (EP), Mama's Boy (album) |
| `award` | ❌ TODO | High | Add any recognitions for rich snippets |

**Update checklist when Afterglow launches:**

- Add `"url"` to the Afterglow album entry (Bandcamp link)
- Update `"description"` from "coming soon" to release description
- Swap `"image"` from `about_FB_OG_photo.jpg` to Afterglow cover art
- Add Apple Music and Tidal to `"sameAs"` (Spotify already present)

---

## 3. Open Graph & Twitter Card Meta Tags

**Currently in `<head>` of `index.html`:**

```html
<!-- Open Graph -->
<meta property="og:title" content="øLu AnuAkin — Multidisciplinary · Griot" />
<meta property="og:description" content="Multidisciplinary · Griot · Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots." />
<meta property="og:image" content="https://oluanuakin.me/about_FB_OG_photo.jpg" />
<meta property="og:type" content="music.musician" />
<meta property="og:url" content="https://oluanuakin.me/" />
<meta property="og:locale" content="en_US" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="øLu AnuAkin — Multidisciplinary · Griot" />
<meta name="twitter:description" content="Multidisciplinary · Griot · Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots." />
<meta name="twitter:image" content="https://oluanuakin.me/about_FB_OG_photo.jpg" />
```

**Swap template for Afterglow (use `.jpg` for OG — Facebook/LinkedIn reject `.webp`):**

```html
<!-- Open Graph -->
<meta property="og:title" content="øLu AnuAkin — Afterglow EP • 2026" />
<meta property="og:description" content="Multidisciplinary · Griot · Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots. Afterglow EP out now." />
<meta property="og:image" content="https://oluanuakin.me/AFTERGLOW_cover-art.jpg" />

<!-- Twitter Card -->
<meta name="twitter:title" content="øLu AnuAkin — Afterglow EP • 2026" />
<meta name="twitter:description" content="Multidisciplinary · Griot · Founder. Alternative Soul / Indie R&B from Minnesota. Afterglow EP out now." />
<meta name="twitter:image" content="https://oluanuakin.me/AFTERGLOW_cover-art.jpg" />
```

---

## 4. sitemap.xml

**Location:** `public/sitemap.xml` (Vite copies to build root)

**Update `<lastmod>` on every meaningful content deploy.** This signals freshness to crawlers.

---

## 5. robots.txt

**Location:** `public/robots.txt` (Vite copies to build root)

**Current policy:** Allow all crawlers. If you want to block AI training crawlers while keeping search indexing, add:
```
User-agent: GPTBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
```

---

## 6. Release Swap Checklist

When swapping featured project (e.g., PWR → Afterglow):

1. **`<meta description>`** — append release name and status (e.g., "Afterglow EP out now.")
2. **OG + Twitter tags** — swap title, description, and image URL
3. **OG image in `public/`** — optimize Afterglow cover art with sharp (1200px, q85) and save as `public/AFTERGLOW_cover-art.jpg` (`.jpg` not `.webp` — Facebook/LinkedIn reject webp)
4. **JSON-LD** — update `"image"`, add URL to Afterglow album entry, update descriptions
5. **Hero section** — uncomment Afterglow hero, comment pre-release hero (see comment blocks in `index.html`)
6. **`<h1>`** — remove visually-hidden h1, promote hero headline to `<h1>` (see PRE-RELEASE-HERO.md)
7. **`sitemap.xml`** — update `<lastmod>` to deploy date
8. **Archive section** — uncomment PWR archive card (May 14 wide release)
9. **Email capture** — uncomment "Stay in the afterglow a little longer" CTA
10. **Sync section** — uncomment Afterglow scene cards, update body copy
11. **Cloudflare** — purge cache, then scrape Facebook/LinkedIn/Twitter debuggers

---

## Core SEO Copy Principles

- **Declarative language is AI-citable** — "øLu AnuAkin is a Multidisciplinary Artist, Griot, and Founder" > "øLu AnuAkin makes amazing music"
- **`lastmod` is a live freshness signal** — update it on every meaningful content deploy
- **JSON-LD is the highest GEO-value investment** — without it, AI engines must guess what your page is about
- **Proprietary terms build authority** — "Griot," "Visioneer," and brand names in structured data create zero-competition queries
- **Social sharing images must be absolute URLs** — relative paths break OG/Twitter previews
