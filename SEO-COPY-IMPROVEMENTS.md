
# SEO Copy Improvement Strategy — øLu AnuAkin

> **Project:** øLu AnuAkin — https://olu.world/
> **Stack:** Vite 5.x · Vanilla JS/CSS · Custom Audio/Video · Bandcamp/Spotify/Apple/Tidal
> **Why:** Improve visibility, citation, and conversion for a multidisciplinary artist, griot, and founder. Optimize for both traditional SEO and GEO (AI search engines).

---

## Current State Snapshot

| Element | Status | Notes |
|---|---|---|
| `<meta description>` | ✓ Single tag | Needs update for pre-release status |
| `<title>` | ✓ Good | "øLu AnuAkin — Alternative Soul / Indie R&B" |
| Open Graph | ❌ Missing | No `og:` tags — social sharing broken |
| Twitter Card | ❌ Missing | No `twitter:` tags |
| JSON-LD structured data | ❌ Missing | No `MusicGroup` or `MusicAlbum` schema |
| Canonical URL | ❌ Missing | Should be `https://olu.world/` |
| `sitemap.xml` | ❌ Missing | Add for completeness |
| `robots.txt` | ❌ Missing | Add for crawler control |
| AI crawler rules | ❌ Missing | No differentiation between GPTBot/ClaudeBot and Googlebot |

---

## 1. Meta Description — Pre/Post Release

**Pre-release:**
```html
<meta name="description" content="øLu AnuAkin — Multidisciplinary Artist, Griot, and Founder. Alternative Soul from Minnesota. Yoruba and American roots. Afterglow EP coming soon.">
```

**Post-release:**
```html
<meta name="description" content="øLu AnuAkin — Multidisciplinary Artist, Griot, and Founder. Alternative Soul from Minnesota. Yoruba and American roots. Afterglow EP out now.">
```

**Why:** Specific, citable, and concise. "Griot" and "Founder" add depth. "Coming soon" for pre-release, "out now" for launch.

---

## 2. JSON-LD Structured Data — MusicGroup + MusicAlbum

**Add to `<head>` in `index.html`:**
```json
{
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": "øLu AnuAkin",
  "url": "https://olu.world/",
  "genre": ["Alternative Soul", "Indie R&B"],
  "founder": "øLu AnuAkin",
  "member": [{"@type": "Person", "name": "øLu AnuAkin"}],
  "description": "Multidisciplinary Artist, Griot, and Founder. Yoruba and American roots. Based in Minnesota.",
  "album": {
    "@type": "MusicAlbum",
    "name": "Afterglow",
    "albumProductionType": "EP",
    "datePublished": "2026",
    "url": "https://oluanuakin.bandcamp.com/album/afterglow",
    "description": "Afterglow EP — coming soon. Alternative Soul, Indie R&B."
  }
}
```

**Why:** Enables AI engines and search crawlers to recognize artist, album, and release status. Update `description` and `datePublished` at launch.

---

## 3. Open Graph & Twitter Card Meta Tags

**Add to `<head>` in `index.html`:**
```html
<!-- Open Graph -->
<meta property="og:title" content="øLu AnuAkin — Afterglow EP • 2026" />
<meta property="og:description" content="Multidisciplinary Artist, Griot, and Founder. Alternative Soul from Minnesota. Yoruba and American roots. Afterglow EP coming soon." />
<meta property="og:image" content="https://olu.world/src/assets/AFTERGLOW_cover-art.png" />
<meta property="og:type" content="music.musician" />
<meta property="og:url" content="https://olu.world/" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="øLu AnuAkin — Afterglow EP • 2026" />
<meta name="twitter:description" content="Multidisciplinary Artist, Griot, and Founder. Alternative Soul from Minnesota. Yoruba and American roots. Afterglow EP coming soon." />
<meta name="twitter:image" content="https://olu.world/src/assets/AFTERGLOW_cover-art.png" />
```

**Why:** Social sharing previews will show correct artist, album, and cover art. Update "coming soon" to "out now" at launch.

---

## 4. Hero & Tracks Meta — Pre-release

- Hero cover label: `Afterglow — Coming Soon`
- Tracks meta: `EP • 2026`

**At launch:**
- Hero cover label: `Afterglow — Out Now`
- Tracks meta: `EP • 2026`

---

## 5. sitemap.xml Guidance

**Create at project root:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://olu.world/</loc>
    <lastmod>2026-03-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Add more URLs as needed -->
</urlset>
```

---

## 6. robots.txt Guidance

**Create at project root:**
```
User-agent: *
Allow: /
Sitemap: https://olu.world/sitemap.xml

# Optional: Block AI training crawlers
User-agent: GPTBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
```

---

## 7. Priority Order

| Priority | Action | Effort | SEO/GEO Impact |
|---|---|---|---|
| 1 | Update `<meta description>` | 2 min | High — citable identity |
| 2 | Add JSON-LD `MusicGroup` + `MusicAlbum` schema | 30 min | Highest — enables AI citation |
| 3 | Add Open Graph + Twitter Card tags | 10 min | High — social sharing |
| 4 | Update hero cover label + tracks meta | 2 min | Medium — release clarity |
| 5 | Create sitemap.xml | 5 min | Medium — discovery |
| 6 | Create robots.txt | 5 min | Medium — crawler control |

---

## Release Strategy Context

**Afterglow is NOT released yet.** Timeline:
1. **Phase 1 (Coming Soon):** ~1 week before release. Possibly Bandcamp presale if available.
2. **Phase 2 (Bandcamp release):** Primary release on Bandcamp.
3. **Phase 3 (DSPs):** Spotify, Apple Music, Tidal — for sync licensing eligibility.

**Implication:** The site currently shows "Afterglow — Out Now" in the hero cover label and index.html copy. This needs to change to "Coming Soon" until release, then swap to "Out Now" at launch.

---

## Core SEO Copy Principles Applied Here

- **Put proof before generic descriptions** — Named testimonials (Blaine Crone, Crone's Crop Service) rank and convert better than anonymous claims.
- **Declarative language is AI-citable** — "IQ Water® restructures water at the molecular level" > "IQ Water® helps your farm."
- **`lastmod` is a live freshness signal** — update it on every meaningful content deploy.
- **JSON-LD is the highest GEO-value investment** — without it, AI engines must guess what your page is about.
- **Technical defects (duplicate tags) undermine everything else** — fix them first.
