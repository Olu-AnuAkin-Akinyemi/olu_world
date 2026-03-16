# EPK Page & PDF — Planning Doc

> **Timeline:** Post-April 24 launch. Target: May 15 (alongside PWR wide release) or later.
> **Delete this file** once the EPK page is built and live.

---

## What

A dedicated `/epk` page and downloadable PDF/Doc for music supervisors, press, and industry contacts. Separate from the main portfolio — focused, professional, quick to scan.

## EPK Page (`/epk`)

### Content Sections
1. **Header** — Artist name, one-line bio, headshot
2. **Bio** — Short (2-3 paragraphs), tailored for industry. Yoruba/American roots, Minnesota, genre positioning
3. **Music** — Embedded player or links to key tracks (PWR, Afterglow singles). Bandcamp/Spotify links
4. **Press Photos** — 2-3 high-res downloadable images (hosted on Cloudflare or Google Drive)
5. **Press Quotes / Features** — If available by then
6. **Credits & Collaborators** — Key production/visual collaborators
7. **Contact** — Direct email (rotaa9@gmail.com), social links
8. **Download EPK** — Button to download the PDF version

### Design Notes
- Same brand aesthetic (dark theme, mono + serif typography, rust accents)
- Minimal — no carousel, no canvas, no animations. Clean and fast
- Mobile-friendly (supervisors check on phones)
- Could be a second HTML page (`epk.html`) or a route if CMS is added later

## Downloadable PDF

### Format Options
- **PDF** (recommended) — universal, professional, printable
- **Google Doc** link — easy to update, but less polished
- Could offer both: PDF download + "View latest version" Google Doc link

### PDF Content (1-2 pages)
- Artist photo + name + tagline
- Short bio
- Discography highlights (PWR, upcoming Afterglow)
- Genre tags (Alternative Soul, Indie R&B, Cinematic, Conscious Hip-Hop)
- Sync availability note (one-stop cleared, stems available)
- Contact: rotaa9@gmail.com
- Links: oluanuakin.me, Bandcamp, Spotify, Instagram

### Generation
- Could build with HTML/CSS and export to PDF (Puppeteer, or Canva)
- Or design in Canva/Figma and export manually
- Keep it easy to update — content changes with each release

## Phased Rollout

| Phase | Date | EPK State |
|-------|------|-----------|
| Launch | Apr 24 | No EPK page. Sync section has "Get in touch" mailto |
| PWR Wide Release | May 15 | Build `/epk` page + PDF. Update sync CTA to "Request EPK" linking to `/epk` |
| Afterglow | TBD | Update EPK with full catalog, scene cards, press coverage |

## Open Questions
- Does the EPK need a password/gate, or is it public?
- Which press photos to include? (Need high-res selects)
- Any press quotes or features to include at launch?
