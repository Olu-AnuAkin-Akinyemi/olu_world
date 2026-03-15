
# SEO Copy Improvement Strategy — øLu AnuAkin

> **Project:** øLu AnuAkin — https://olu.world/
> **Stack:** Vite 5.x · Vanilla JS/CSS · Custom Audio/Video · Bandcamp/Spotify/Apple/Tidal
> **Why:** Improve visibility, citation, and conversion for a multidisciplinary artist, griot, and founder. Optimize for both traditional SEO and GEO (AI search engines).
> **Last updated:** 2026-03-15

---

## Current State Snapshot

| Element | Status | Notes |
|---|---|---|
| `<meta description>` | ✅ Done | Updated with Griot, Founder, Minnesota, Yoruba roots, PWR |
| `<title>` | ✅ Good | "øLu AnuAkin — Multidisciplinary Artist" |
| Open Graph | ✅ Done | `og:title`, `og:description`, `og:image` (PWR cover), `og:type`, `og:url` |
| Twitter Card | ✅ Done | `summary_large_image` with PWR art |
| JSON-LD structured data | ✅ Done | `MusicGroup` + 3 albums (PWR, Afterglow, Mama's Boy) |
| Canonical URL | ✅ Done | `https://olu.world/` |
| `sitemap.xml` | ✅ Done | In `public/` — single URL entry |
| `robots.txt` | ✅ Done | In `public/` — allows all crawlers |
| Favicon | ✅ Done | SVG + PNG + ICO + Apple Touch + Web Manifest |

---

## 1. Meta Description — Current / Swap Templates

**Current (PWR era):**
```html
<meta name="description" content="øLu AnuAkin — Multidisciplinary Artist, Griot, and Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots. PWR out now.">
```

**Afterglow pre-release (swap when ready):**
```html
<meta name="description" content="øLu AnuAkin — Multidisciplinary Artist, Griot, and Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots. Afterglow EP coming soon.">
```

**Afterglow post-release:**
```html
<meta name="description" content="øLu AnuAkin — Multidisciplinary Artist, Griot, and Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots. Afterglow EP out now.">
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
  "url": "https://olu.world/",
  "genre": ["Alternative Soul", "Indie R&B", "Conscious Hip Hop"],
  "description": "Multidisciplinary Artist, Griot, and Founder. Yoruba and American roots. Based in Minnesota.",
  "image": "https://olu.world/PWR_Cover-Art.webp",
  "foundingLocation": {
    "@type": "Place",
    "name": "Minnesota",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "MN",
      "addressCountry": "US"
    }
  },
  "knowsAbout": [
    "Alternative Soul", "Indie R&B", "Conscious Hip Hop",
    "Music Production", "Visual Art", "Cinematic World-Building",
    "Sync Licensing", "Yoruba Culture", "Griot Storytelling Tradition"
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
    "https://soundcloud.com/oluanuakin"
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
|---|---|---|---|
| `name`, `url`, `description` | ✅ | Baseline | Core identity |
| `genre` | ✅ | High | Alt Soul, Indie R&B, Conscious Hip Hop |
| `image` | ✅ | Medium | Rich snippets in search |
| `foundingLocation` | ✅ | High | Location-based queries ("artists from Minnesota") |
| `knowsAbout` | ✅ | **Highest** | Topical authority — AI engines use this to determine relevance |
| `memberOf` | ✅ | Medium | Cross-references Galorious Expression® entity |
| `sameAs` | ✅ | High | Links social profiles as same entity |
| `track` | ✅ | High | Individual song-level citations |
| `album` | ✅ | High | Album/EP/single-level citations |
| `foundingDate` | ❌ TODO | Medium | Add when user provides year |
| `award` | ❌ TODO | High | Add any recognitions for rich snippets |

**Update checklist when Afterglow launches:**
- Add `"url"` to the Afterglow album entry (Bandcamp link)
- Update `"description"` from "coming soon" to release description
- Swap `"image"` from PWR to Afterglow cover art
- Add Spotify/Apple/Tidal to `"sameAs"` when DSP links are live

---

## 3. Open Graph & Twitter Card Meta Tags

**Currently in `<head>` of `index.html`:**
```html
<!-- Open Graph -->
<meta property="og:title" content="øLu AnuAkin — PWR • 2026" />
<meta property="og:description" content="Multidisciplinary Artist, Griot, and Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots. PWR out now." />
<meta property="og:image" content="https://olu.world/PWR_Cover-Art.webp" />
<meta property="og:type" content="music.musician" />
<meta property="og:url" content="https://olu.world/" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="øLu AnuAkin — PWR • 2026" />
<meta name="twitter:description" content="Multidisciplinary Artist, Griot, and Founder. Alternative Soul / Indie R&B from Minnesota. PWR out now." />
<meta name="twitter:image" content="https://olu.world/PWR_Cover-Art.webp" />
```

**Swap template for Afterglow:**
```html
<!-- Open Graph -->
<meta property="og:title" content="øLu AnuAkin — Afterglow EP • 2026" />
<meta property="og:description" content="Multidisciplinary Artist, Griot, and Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots. Afterglow EP out now." />
<meta property="og:image" content="https://olu.world/src/assets/AFTERGLOW_cover-art.webp" />

<!-- Twitter Card -->
<meta name="twitter:title" content="øLu AnuAkin — Afterglow EP • 2026" />
<meta name="twitter:description" content="Multidisciplinary Artist, Griot, and Founder. Alternative Soul / Indie R&B from Minnesota. Afterglow EP out now." />
<meta name="twitter:image" content="https://olu.world/src/assets/AFTERGLOW_cover-art.webp" />
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

1. **`<meta description>`** — swap release name and status
2. **OG + Twitter tags** — swap title, description, and image URL
3. **JSON-LD** — update `"image"`, add URL to new album, update descriptions
4. **Hero section** — uncomment Afterglow hero, comment PWR hero (see comment blocks in `index.html`)
5. **`sitemap.xml`** — update `<lastmod>` to deploy date
6. **Archive section** — uncomment PWR archive card (May 15 wide release)

---

## Core SEO Copy Principles

- **Declarative language is AI-citable** — "øLu AnuAkin is a Multidisciplinary Artist, Griot, and Founder" > "øLu AnuAkin makes amazing music"
- **`lastmod` is a live freshness signal** — update it on every meaningful content deploy
- **JSON-LD is the highest GEO-value investment** — without it, AI engines must guess what your page is about
- **Proprietary terms build authority** — "Griot," "Visioneer," and brand names in structured data create zero-competition queries
- **Social sharing images must be absolute URLs** — relative paths break OG/Twitter previews
