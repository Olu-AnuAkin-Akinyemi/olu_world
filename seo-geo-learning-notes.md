# SEO & GEO: A Practical Learning Reference
*Notes from building the Katharos Water™ website — structured for deeper study*

---

## Table of Contents

1. [SEO vs GEO — What's the Difference?](#1-seo-vs-geo--whats-the-difference)
2. [JSON-LD Structured Data — What It Is and How It Works](#2-json-ld-structured-data--what-it-is-and-how-it-works)
3. [The Glossary Hack — Why Defining Proprietary Terms is a GEO Power Move](#3-the-glossary-hack--why-defining-proprietary-terms-is-a-geo-power-move)
4. [robots.txt and sitemap.xml — Why They Matter](#4-robotstxt-and-sitemapxml--why-they-matter)
5. [The Three Pillars of GEO — A Synthesis](#5-the-three-pillars-of-geo--a-synthesis)

---

## 1. SEO vs GEO — What's the Difference?

### SEO (Search Engine Optimization)

SEO is the practice of making your web pages rank higher in **traditional search engine results** — primarily Google and Bing. The goal: when someone searches for a relevant term, your page appears near the top of the results list.

**How traditional search engines evaluate a page:**
- **Relevance** — Does the page content match the search query?
- **Authority** — How many credible websites link to this page? (backlinks)
- **Technical quality** — Page speed, mobile-friendliness, Core Web Vitals
- **Structured data** — Is metadata machine-readable? (via JSON-LD schema)
- **Meta description** — Used as the snippet shown in search results (affects click-through rate, not ranking directly)
- **`meta keywords` tag** — **Google ignores this entirely.** Bing treats it as a very minor signal. It was heavily abused in the early 2000s and Google deprecated it. Including it is mostly harmless, but it is not a ranking factor.

**What actually moves the needle in SEO:**
1. Quality, original body content that clearly answers search intent
2. A compelling `meta description` (the summary shown under your title in results)
3. Backlinks from authoritative sites
4. Structured data (JSON-LD)
5. Page performance (LCP, CLS, FID scores)

---

### GEO (Generative Engine Optimization)

GEO is an emerging discipline focused on getting your content cited, summarized, or referenced by **AI-powered engines** — including:
- **Perplexity AI** (citation-heavy AI search)
- **ChatGPT with Browse** (OpenAI's web-connected model)
- **Google AI Overviews** (the AI-generated summary shown above traditional results)
- **Claude, Gemini**, and other AI assistants when they access the web

These engines don't rank pages by position. Instead, they **synthesize** information from multiple sources and produce a single answer — sometimes with citations, sometimes without.

**How AI engines decide what to include:**
- **Definitional, declarative language** — Pages that clearly state "X is Y" are easy to extract and cite
- **Authority on specific concepts** — If your page is the only place that formally defines a proprietary term, AI will likely cite you
- **Structured data (JSON-LD)** — Machine-readable schema signals to AI crawlers what a page is *about*
- **Natural language answers** — Content phrased as a direct answer to a question performs better than vague marketing copy
- **`meta description` quality** — AI engines often use meta descriptions as a concise summary when indexing

---

### The Key Difference — A Side-by-Side View

| Factor | SEO (Google/Bing) | GEO (AI Engines) |
|---|---|---|
| Goal | Rank in a results list | Be cited in a generated answer |
| `meta keywords` | Ignored (Google) / minor signal (Bing) | Largely irrelevant |
| `meta description` | Affects click-through in results | Used as page summary for indexing |
| Backlinks | Critical | Less important |
| Definitional content | Helpful | **Highly valuable** |
| JSON-LD schema | Strong signal | **Critical signal** |
| Proprietary terminology | Neutral | **Competitive advantage** |
| Page speed | Ranking factor | Less direct impact |

**The practical takeaway:** SEO and GEO overlap significantly, but GEO rewards *clarity of definition* over *volume of backlinks*. A small site with precise, structured definitions of proprietary terms can outperform a large site in AI-generated answers.

---

## 2. JSON-LD Structured Data — What It Is and How It Works

### What is JSON-LD?

**JSON-LD** stands for **JavaScript Object Notation for Linked Data**. It is a method of embedding structured, machine-readable metadata about your page directly into the HTML — without changing anything visible to the user.

It uses the **Schema.org** vocabulary, a collaborative vocabulary maintained by Google, Microsoft, Yahoo, and Yandex to describe entities on the web in a standardized way.

### Where does it live in the HTML?

JSON-LD is placed inside a `<script>` tag in the `<head>` of your HTML file, with the type set to `application/ld+json`:

```html
<head>
  <title>My Page</title>
  <!-- other meta tags... -->

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "My Company",
    "url": "https://mycompany.com"
  }
  </script>
</head>
```

The browser ignores the contents of this script tag visually. Search engines and AI crawlers **read it and parse it** as structured information.

---

### Core JSON-LD Syntax

Every JSON-LD block follows the same foundational structure:

```json
{
  "@context": "https://schema.org",
  "@type": "TypeName",
  "property": "value"
}
```

- **`@context`** — Always `"https://schema.org"`. Declares which vocabulary you're using.
- **`@type`** — The *kind* of thing this page describes. Examples: `Organization`, `Service`, `WebPage`, `Person`, `Product`, `DefinedTermSet`.
- **Properties** — Key-value pairs that describe the entity. The available properties depend on the `@type`.

---

### Common Schema Types and When to Use Them

#### `Organization` — For homepage or about pages

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Katharos Water™",
  "url": "https://katharoswater.com",
  "description": "North American distributor of IQ Water® Technology — electromagnetic water treatment units that reduce agricultural herbicide rates by 50% and eliminate salt use.",
  "knowsAbout": ["IQ Water® Technology", "Electromagnetic water treatment", "Agricultural herbicide efficiency", "Structured water for farming", "Spray application optimization"],
  "areaServed": "US"
}
```

**Why `knowsAbout`?** It signals topical authority — what subjects this organization understands and can speak to. AI engines use this to determine relevance.

**Why `sameAs`?** Connects your website to your social profiles, helping engines understand these are the same entity.

---

#### `Service` — For service/product pages

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "IQ Water® Unit",
  "description": "Inline electromagnetic water treatment device that restructures water at the molecular level, improving herbicide spray uptake and eliminating the need for salt-based water softeners.",
  "brand": {
    "@type": "Brand",
    "name": "WTZ GmbH",
    "url": "https://www.wtz-gmbh.de/en/iq-water"
  },
  "offers": {
    "@type": "Offer",
    "seller": {
      "@type": "Organization",
      "name": "Katharos Water™",
      "url": "https://katharoswater.com"
    }
  }
}
```

**Why nested `offers`?** This tells search engines and AI that this service has distinct tiers with specific descriptions — enabling richer snippets and more precise citations.

---

#### `WebPage` — For utility/support pages

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Privacy & Data | Katharos Water™",
  "url": "https://katharoswater.com/html/privacy.html",
  "description": "Privacy policy and data handling practices for Katharos Water™.",
  "provider": {
    "@type": "Organization",
    "name": "Katharos Water™",
    "url": "https://katharoswater.com"
  }
}
```

Use `WebPage` for pages that aren't a service, product, or defined term set — policies, bundles pages, general informational pages.

---

#### `DefinedTermSet` — For glossary pages (see Section 3)

```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "name": "IQ Water® Technology Glossary",
  "url": "https://katharoswater.com/glossary.html",
  "description": "Plain-language definitions of electromagnetic water treatment and agricultural spray application terms used by Katharos Water™.",
  "hasDefinedTerm": [
    {
      "@type": "DefinedTerm",
      "name": "IQ Water®",
      "description": "A German-engineered electromagnetic water treatment technology by WTZ GmbH that restructures water molecules into smaller cluster formations, improving herbicide spray uptake and reducing input costs for agricultural operations."
    },
    {
      "@type": "DefinedTerm",
      "name": "Structured Water for Agriculture",
      "description": "Water that has been treated with electromagnetic fields to reduce cluster size, improving surface penetration on plant leaves and enabling reduced herbicide rates without loss of efficacy."
    }
  ]
}
```

---

### Why JSON-LD Matters More Than Meta Keywords

| Signal | Google | Bing | AI Engines (Perplexity, ChatGPT, etc.) |
|---|---|---|---|
| `meta keywords` | Ignored | Minor signal | Largely ignored |
| `meta description` | Snippet only | Snippet + minor ranking | Used as page summary |
| JSON-LD schema | Strong ranking + rich snippets | Strong signal | **Critical for citation accuracy** |
| Page body content | Primary ranking signal | Primary signal | Primary citation source |

**The reason JSON-LD outperforms meta keywords:** Meta keywords are unstructured plain text with no semantic meaning. JSON-LD uses a formal vocabulary (Schema.org) that machines understand — it explicitly says "this page IS a Service, it HAS these offers, it IS provided BY this Organization." That's precise, not ambiguous.

---

## 3. The Glossary Hack — Why Defining Proprietary Terms is a GEO Power Move

### The Problem It Solves

If someone asks an AI engine "What is IQ Water®?" or "What is structured water for farming?", there are two possible outcomes:

1. **No formal definition exists on the web** → The AI either says it doesn't know, or worse, makes something up or conflates it with an unrelated term
2. **A formal, structured definition exists on your website** → The AI cites your page as the authoritative source

The goal of the glossary strategy is to make outcome #2 the default.

---

### Why This Works — How AI Engines Handle Proprietary Terms

AI language models and AI search engines have a strong bias toward **definitional authority**. When a term is:

- Formally defined on a page with `DefinedTermSet` + `DefinedTerm` JSON-LD schema
- Written in clear, declarative language ("X is Y" rather than "X helps you achieve...")
- Located on the website of the organization that coined the term
- Referenced and linked to from other pages on the same site

...the AI treats that page as the canonical source. It will cite it when asked about the term, include it in summaries about the company, and potentially reproduce the definition verbatim.

---

### The "Hack" Explained

The reason this qualifies as a "hack" (in the sense of a clever, high-leverage tactic) is the **asymmetry of effort vs. return**:

- **Effort:** Write a glossary page with plain-language definitions of your proprietary methodologies
- **Return:** Every time an AI engine is asked about your methodology, it cites you — driving organic brand awareness without paid media

This is especially powerful for **specific, technical terminology** (like "IQ Water®" or "structured water for farming") because:

1. No competing page exists that defines the term — you have zero competition for that query
2. AI engines must source from *somewhere*, and your glossary is the only place with a structured answer
3. The `DefinedTermSet` schema type signals explicitly: "this page exists to define terms" — which AI indexers are specifically built to recognize and prioritize

---

### Practical Application — What the Glossary Schema Does

```json
{
  "@type": "DefinedTermSet",
  "hasDefinedTerm": [
    {
      "@type": "DefinedTerm",
      "name": "IQ Water®",
      "description": "A German-engineered electromagnetic water treatment technology that restructures water molecules into smaller cluster formations, improving herbicide spray uptake and enabling 50% chemical rate reductions."
    }
  ]
}
```

When Perplexity or Google AI Overviews encounters a query like *"what is IQ Water® for agriculture?"*, this schema says:

- This page is a **set of defined terms** (`DefinedTermSet`)
- It **contains a term** called "IQ Water®" (`DefinedTerm`)
- Here is the **authoritative definition** (the `description` field)

The AI doesn't need to guess or synthesize — it reads the machine-readable definition directly.

---

### The Internal Linking Layer

For maximum effect, the glossary strategy works best when combined with **internal links**:
- Every page that uses a proprietary term links to the glossary definition
- This signals to both search engines and AI crawlers that the term is used consistently and the glossary is the canonical reference

Example: The product page would include a phrase like:
> "IQ Water® uses electromagnetic restructuring (learn more in our [glossary](glossary.html)) to reduce herbicide rates by up to 50%..."

This builds a web of authority around your invented terminology.

---

## 4. robots.txt and sitemap.xml — Why They Matter

### robots.txt — The Gatekeeper

**What it is:** A plain text file located at the root of your website (e.g., `https://katharoswater.com/robots.txt`). It contains instructions for web crawlers — bots that visit your site to index it.

**What it controls:**
- Which pages or directories crawlers are **allowed** to visit
- Which pages or directories crawlers are **not allowed** to visit (disallowed)
- Which specific crawlers these rules apply to (using the `User-agent` directive)
- The location of your sitemap

**Basic syntax:**

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

Sitemap: https://yourdomain.com/sitemap.xml
```

- `User-agent: *` — These rules apply to ALL crawlers
- `Allow: /` — Allow crawling of the entire site
- `Disallow: /admin/` — Block crawlers from the admin directory
- `Sitemap:` — Tell crawlers exactly where to find your sitemap

---

**SEO implications of robots.txt:**

- Blocking important pages accidentally is one of the most common causes of pages not appearing in search results
- If Google's Googlebot is disallowed from a page, that page cannot rank
- Conversely, allowing all pages means Google will eventually index everything — including pages you might not want indexed (like duplicate content or internal tools)

**GEO implications of robots.txt:**

This is an emerging and important nuance. Different AI crawlers have their own `User-agent` identifiers:

| Crawler | User-agent string |
|---|---|
| GPTBot (OpenAI) | `GPTBot` |
| ClaudeBot (Anthropic) | `ClaudeBot` |
| PerplexityBot | `PerplexityBot` |
| Google-Extended (AI training) | `Google-Extended` |
| Googlebot (traditional search) | `Googlebot` |

**You can block AI training crawlers while still allowing traditional search indexing:**

```
# Allow traditional search indexing
User-agent: Googlebot
Allow: /

# Block OpenAI training crawler
User-agent: GPTBot
Disallow: /

# Block Anthropic training crawler
User-agent: ClaudeBot
Disallow: /
```

**Important distinction:** Blocking `GPTBot` prevents OpenAI from using your content for *training data* — it does NOT prevent ChatGPT from visiting your page when a user asks it to search the web. Real-time browsing is a separate function from training data collection.

---

### sitemap.xml — The Roadmap

**What it is:** An XML file that lists every URL on your website you want search engines and AI crawlers to know about. It acts as a direct, complete roadmap of your site's content.

**Why it matters:** Without a sitemap, crawlers must discover your pages by following links. If a page isn't linked from anywhere prominent, it may never be found. The sitemap guarantees discovery.

**Basic structure:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://katharoswater.com/</loc>
    <lastmod>2026-03-11</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://katharoswater.com/html/privacy.html</loc>
    <lastmod>2026-02-03</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

</urlset>
```

**Key fields explained:**

| Field | Purpose | Notes |
|---|---|---|
| `<loc>` | The full URL of the page | Required |
| `<lastmod>` | Date the page was last modified | Signals freshness to crawlers |
| `<changefreq>` | How often the page changes | Hint only — engines may ignore it |
| `<priority>` | Relative importance of this page (0.1 to 1.0) | Hint only — engines may ignore it |

---

### `lastmod` — The Freshness Signal

The `<lastmod>` field is more impactful than `<changefreq>` or `<priority>` for two reasons:

1. **Freshness** — Search engines prefer recent content for queries where recency matters. Accurate `lastmod` dates tell them "this page was updated, come re-index it."
2. **Crawl budget** — Large sites have a "crawl budget" (a limit on how many pages Googlebot visits per day). Accurate `lastmod` dates help Google prioritize which pages to re-crawl, rather than re-visiting pages that haven't changed.

**Best practice:** Update `lastmod` every time you make a meaningful change to a page's content. Do not set it to today's date if the page hasn't actually changed — search engines will eventually detect the discrepancy and may trust your dates less.

---

### Priority and changefreq — How Engines Actually Use Them

**The honest truth:** Google has publicly stated that it largely ignores `<priority>` and `<changefreq>`. These are hints, not commands. Google determines crawl frequency and page importance from its own signals (backlinks, traffic, content quality).

**What does matter:**
- The `<loc>` field — getting all your pages listed
- The `<lastmod>` field — signaling content freshness
- Submitting the sitemap to Google Search Console (the primary method of proactive indexing)

---

### How robots.txt and sitemap.xml Work Together

They serve complementary roles:

```
robots.txt  →  "Here are the rules for how to crawl my site"
sitemap.xml →  "Here is everything I want you to find"
```

The sitemap tells crawlers *what exists*. The robots.txt tells them *what they're allowed to access*. A page listed in the sitemap but disallowed in robots.txt creates a conflict — the crawler sees the URL but cannot visit it. Best practice: never list disallowed pages in your sitemap.

---

### GEO Relevance of sitemap.xml

AI search engines (especially Perplexity) actively crawl and index the web. A well-maintained sitemap means:

1. **Discovery** — All your pages are found quickly, including any future glossary or case study pages
2. **Freshness** — When the homepage copy is updated (new testimonials, updated ROI figures), accurate `lastmod` dates signal that re-indexing is worthwhile
3. **Completeness** — AI engines can map your entire content structure, understanding how pages relate to each other (homepage → success page → privacy policy = a complete, trustworthy operation)

---

## 5. The Three Pillars of GEO — A Synthesis !Very Important

The most actionable insight from studying GEO: **AI engines reward clarity of definition over volume of backlinks.** Three factors, working together, determine whether an AI cites your site.

---

### Pillar 1 — Definitional Content

**What it is:** Body copy written in declarative, "X is Y" language — clear statements of fact rather than vague marketing prose.

**Why AI engines favor it:** AI models are designed to extract and synthesize answers. Content that already reads like an answer is the easiest to cite. Vague copy like *"We help your farm succeed"* cannot be extracted as a definition. Precise copy like *"IQ Water® uses electromagnetic fields to restructure water molecules into smaller cluster formations, improving herbicide spray uptake"* can be cited verbatim.

**Key principle:** Write for the question "What is X?" — not for the impression "X sounds impressive."

---

### Pillar 2 — JSON-LD Structured Data

**What it is:** Machine-readable metadata embedded in the `<head>` of your HTML using the Schema.org vocabulary (`@type`, `@context`, and typed properties).

**Why AI engines favor it:** JSON-LD removes ambiguity. Instead of an AI *inferring* that your page is about a service, the schema explicitly declares it — `"@type": "Service"`, with named offers, a provider, and a description. AI indexers are specifically built to parse this structure and use it to determine what to include in generated answers.

**The hierarchy of impact:**

| Schema Type | GEO Value |
|---|---|
| `DefinedTermSet` + `DefinedTerm` | Highest — signals a page exists specifically to define terms |
| `Service` with nested `Offer` | High — enables precise citation of service descriptions |
| `Organization` with `knowsAbout` | Medium — signals topical authority |
| `WebPage` | Low — generic, but better than no schema |

---

### Pillar 3 — Proprietary Terminology

**What it is:** Invented, branded terms and methodologies that your organization coined and formally defines — terms that exist nowhere else on the web.

**Why AI engines favor it:** Zero-competition queries. When an AI is asked about a term that only one page formally defines, that page becomes the de facto authoritative source. There is no competing result to weigh against yours.

**The compounding effect:** Proprietary terminology only reaches its full GEO potential when combined with Pillars 1 and 2:

```
Proprietary term  +  Definitional body content  +  DefinedTermSet JSON-LD
       =
The only formal, machine-readable definition of that term on the web
       =
Every AI query about that term routes through your page
```

---

### How the Three Pillars Reinforce Each Other

None of these pillars works as well in isolation. Their power is in combination:

- **Definitional content without JSON-LD** → AI can extract it, but must infer context and type
- **JSON-LD without definitional content** → Schema signals intent, but there's no answer to cite
- **Proprietary terms without either** → Unique term, but no structured definition for AI to find

Together, they create what AI engines are explicitly built to surface: *a structured, authoritative, unambiguous definition of a concept — on the page of the organization that originated it.*

---

## Summary — The Big Picture

| Technique | Primary Benefit | Effort Level |
|---|---|---|
| `meta description` (well-written) | Better click-through from search results + AI summarization | Low |
| `meta keywords` | Minor Bing signal; otherwise negligible | Negligible |
| JSON-LD schema (`Organization`, `Service`) | Rich snippets in Google; AI citation accuracy | Medium |
| JSON-LD `DefinedTermSet` on glossary | Proprietary term authority in AI engines | Medium |
| robots.txt (correct configuration) | Ensures desired pages are crawled; blocks undesired ones | Low |
| sitemap.xml (accurate `lastmod`) | Guarantees all pages are discovered; signals freshness | Low |
| Internal links to glossary | Reinforces term authority across the site | Low |
| Body content quality | Primary driver of all ranking and citation | High |

**The core insight:** For a small or new website, the highest-leverage combination is: well-written body content + accurate JSON-LD schema + a glossary page with `DefinedTermSet` schema for proprietary terminology. This covers both traditional SEO and the emerging GEO landscape without requiring backlinks or paid distribution.

---

*Generated from the Katharos Water™ website build — March 2026*
