# Technical SEO & Internal Linking Audit (Pre-Optimization)

**Generated:** 2026-10-16  
**Repository:** static site for `paarustudio.com` on Netlify  
**Auditor:** Senior Technical SEO Engineer  
**Branch:** `seo/internal-linking`

---

## Executive Summary

| Metric | Pre-Optimization Value | Benchmark / Target |
|---|---|---|
| **Total HTML Files** | 40 | 40 |
| **Sitemap URLs** | 39 | All indexable canonicals |
| **True Orphans (0 total inbound)** | 2 (/ai-video-content-generation, /commercial-films) | 0 |
| **Click Depth > 2 from `/`** | 2 | 0 (all pages depth <= 2) |
| **Pages with < 3 Contextual Inbound Links** | 14 | 0 |
| **Pages Missing from `sitemap.xml`** | 1 (/commercial-films) | 0 |
| **Nav/Footer Template Variants** | Multiple divergent variants | 1 Unified Master Header & Footer |
| **Thin Pages (< 500 words)** | 12 | Documented & upgraded with clear briefs |
| **Links to Redirects / .html** | 0 | 0 |

---

## 1. Critical Finding: Orphans & Unreachable Pages

The following pages currently receive zero or near-zero discoverability in internal crawl graphs:
- **`/ai-video-content-generation`**: 0 inbound links across all pages. Depth: Unreachable.
- **`/commercial-films`**: 0 inbound links across all pages. Depth: Unreachable.
- **`ai-video-content-generation.html`** (/ai-video-content-generation): Has no inbound links from the homepage, services, or blog.
- **`commercial-films.html`** (/commercial-films): Legacy precursor to `/films`. Canonical targets `https://paarustudio.com/films`. No internal links point to it.

---

## 2. Click Depth Distribution from `/`

Depth represents minimum clicks from the homepage (`/`):
- **Depth 1 (Directly linked from homepage):** 25 pages
- **Depth 2 (Two hops from homepage):** 12 pages
- **Depth > 2 or Unreachable:** 2 pages
  - `/ai-video-content-generation`: Depth = Unreachable
  - `/commercial-films`: Depth = Unreachable

---

## 3. Pages with Fewer than 3 Inbound Contextual Links

Contextual links are in-body links (excluding static site-wide header nav and footer). A strong thematic cluster requires at least 3 contextual inbound links from relevant pages:

| Target Page | Contextual Inbound Count | Current Contextual Sources |
|---|---|---|
| `/about` | 0 | *None* |
| `/ai-reel` | 1 | `/blog-ai-in-advertising-and-production` |
| `/ai-video-content-generation` | 0 | *None* |
| `/blog-animated-educational-videos` | 2 | `/blog-explainer-videos`, `/blog` |
| `/blog-corporate-videos` | 1 | `/blog` |
| `/blog-video-production-bangalore` | 2 | `/blog-explainer-videos`, `/blog` |
| `/blog-video-production-essentials` | 1 | `/blog` |
| `/blog-viral-video-marketing` | 1 | `/blog` |
| `/case-study-japfa` | 1 | `/case-studies` |
| `/case-study-signeasy` | 1 | `/case-studies` |
| `/commercial-films` | 0 | *None* |
| `/join-team` | 0 | *None* |
| `/privacy-policy` | 0 | *None* |
| `/social-media-marketing` | 1 | `/` |

---

## 4. Sitemap Discrepancies

- **In Sitemap count:** 39
- **Missing from Sitemap:**
- `/commercial-films`
- **Note on /corporate-video-production:** GSC reported *"No referring sitemaps detected"* because Googlebot had not re-crawled the sitemap since its addition, or referencing URLs did not reinforce sitemap discovery.
- **Note on /commercial-films:** Canonical points to `/films`, so it should remain excluded from the sitemap, but must 301 redirect to `/films` in `_redirects`.

---

## 5. Header and Footer Template Divergence

Across the 40 pages, header and footer templates are severely fragmented into at least 4 distinct variations:

### Header Variations Detected:
1. **Homepage Master Nav:** Features Services Mega Dropdown, Media Dropdown, Portfolio, Case Studies, Blog, Get Started, AI Services button, Contact Us button. (Join Team moved or footer-only).
2. **Older Service Nav (/corporate-video-production, /video-production):** Has Services & Media dropdowns, Portfolio, Get Started, **Join Team**, Ai Services, Contact Us. **MISSING Case Studies and Blog completely!**
3. **Legacy Minimal Nav (/case-study-onsurity, /case-study-herbalife, /case-study-observance):** Stripped-down navbar: only Home, Portfolio, Case Studies, Video Production, Contact Us. No dropdowns.
4. **Simple Showcase Nav (/ai-reel, /ai-video-content-generation):** Non-standard minimal navigation bar.

### Footer Variations Detected:
1. **Homepage 4-Column Footer:** Services (7 links) / Company (4 links) / Resources (4 links: Case Studies, Blog, FAQ, Get Started) / Legal (Privacy Policy) + AI Due Diligence ask-ai section.
2. **Older 3-Column Footer (/corporate-video-production, /video-production, /films, /motion-graphics-animation):** Video & Media / Company / Legal. Missing Resources column. Contains dead `#` links (Facebook, Security Compliance, Accessibility, Terms of Use).
3. **Partial 3-Column Footer (/blog-*, /case-studies, /get-started, etc.):** Services / Company / Legal. Missing Resources column.
4. **Single-line Minimal Footer (/case-study-onsurity, /case-study-herbalife, /case-study-observance, /case-study-signeasy, /case-study-auram-jewellery):** Just a simple copyright line with 1 or 2 links.

---

## 6. Duplication and Near-Duplication Analysis

### A. `/ai-services` vs `/ai-video-production`
- **`/ai-services` (Indexed in GSC):** Comprehensive AI studio offering covering generative neural pipelines, AI ad films, synthetic product commercials, virtual human avatars, and automated reels. (Word count: ~1,120 words).
- **`/ai-video-production` (Discovered - Not Indexed in GSC):** Educational / explainer landing page specifically detailing how AI integrates with traditional camera workflows, VFX pipelines, and virtual sets. (Word count: 469 words).
- **Resolution Strategy:**
  - Both serve distinct search intents (Service offering vs. Production workflow).
  - Standardize `/ai-services` as the global Nav & Footer primary AI link.
  - Link `/ai-video-production` from the AI card/section on the homepage and within `/ai-services`.
  - Strengthen `/ai-video-production` with reciprocal contextual links and expand its unique copy so it is clearly distinct.

### B. `/films` vs `/commercial-films`
- `commercial-films.html` has canonical set to `https://paarustudio.com/films`.
- `/films` is the active URL with 1,303 words.
- **Resolution Strategy:** Add explicit 301 redirect in `_redirects` from `/commercial-films` and `/commercial-films.html` to `/films`. Exclude `/commercial-films` from sitemap.

---

## 7. Thin Pages (< 500 Words)

The following 12 pages contain under 500 words of indexable body text:

| Page URL | Word Count | H1 Heading | Assessment |
|---|---|---|---|
| `/ai-reel` | 153 | AI-Generated Brand Reel | Thin |
| `/ai-video-content-generation` | 157 | AI Content Generation Showcase | Thin |
| `/ai-video-production` | 469 | AI Video Production Explained | Thin |
| `/case-studies` | 436 | CASE STUDIES | Thin |
| `/case-study-auram-jewellery` | 482 | Scaling Auram Jewellery with Meta Ads &amp; High-Intent SEO | Thin |
| `/case-study-calvin-klein` | 463 | Calvin Klein | Thin |
| `/case-study-herbalife` | 203 | Herbalife | Cinematic Brand Film | Thin |
| `/case-study-observance` | 194 | Observance Eye | Digital Video Commercial | Thin |
| `/case-study-onsurity` | 194 | Onsurity | Motion Graphics Showcase | Thin |
| `/case-study-signeasy` | 366 | High-Impact Outdoor Marketing (OOH) for Signeasy | Thin |
| `/contact` | 353 | We're Your One-StopDigital Partner | Thin |
| `/portfolio` | 269 | Video Production & Advertising Work for Brands We’ve Helped Grow | Thin |

---

## 8. Complete Pre-Optimization Inventory

| URL | Canonical | In Sitemap | Words | Inbound (Tot / Ctx) | Outbound | Nav Template | Footer Template |
|---|---|---|---|---|---|---|---|
| `/about` | `/about` | Yes | 627 | 11 / 0 | 32 | Partial/Variant | Modern 4-Col |
| `/ai-reel` | `/ai-reel` | Yes | 153 | 1 / 1 | 10 | Simple/Custom Nav | Custom Footer |
| `/ai-services` | `/ai-services` | Yes | 1337 | 52 / 6 | 45 | Partial/Variant | Modern 4-Col |
| `/ai-video-content-generation` | `/ai-video-content-generation` | Yes | 157 | 0 / 0 | 10 | Simple/Custom Nav | Custom Footer |
| `/ai-video-production` | `/ai-video-production` | Yes | 469 | 8 / 7 | 38 | Partial/Variant | Custom Footer |
| `/blog-ai-in-advertising-and-production` | `/blog-ai-in-advertising-and-production` | Yes | 1103 | 4 / 4 | 37 | Modern Full | Custom Footer |
| `/blog-animated-educational-videos` | `/blog-animated-educational-videos` | Yes | 1005 | 2 / 2 | 38 | Partial/Variant | Custom Footer |
| `/blog-corporate-videos` | `/blog-corporate-videos` | Yes | 709 | 1 / 1 | 38 | Partial/Variant | Custom Footer |
| `/blog-creative-agency-vs-ad-agency-trends` | `/blog-creative-agency-vs-ad-agency-trends` | Yes | 1325 | 4 / 4 | 40 | Modern Full | Custom Footer |
| `/blog-explainer-videos` | `/blog-explainer-videos` | Yes | 677 | 7 / 6 | 42 | Partial/Variant | Custom Footer |
| `/blog-modern-advertising-trends-2026` | `/blog-modern-advertising-trends-2026` | Yes | 998 | 4 / 4 | 36 | Modern Full | Custom Footer |
| `/blog-video-production-bangalore` | `/blog-video-production-bangalore` | Yes | 1184 | 2 / 2 | 41 | Partial/Variant | Custom Footer |
| `/blog-video-production-essentials` | `/blog-video-production-essentials` | Yes | 1175 | 1 / 1 | 36 | Partial/Variant | Custom Footer |
| `/blog-viral-video-marketing` | `/blog-viral-video-marketing` | Yes | 766 | 1 / 1 | 37 | Partial/Variant | Custom Footer |
| `/blog` | `/blog` | Yes | 576 | 52 / 7 | 40 | Partial/Variant | Custom Footer |
| `/case-studies` | `/case-studies` | Yes | 436 | 63 / 12 | 39 | Partial/Variant | Custom Footer |
| `/case-study-auram-jewellery` | `/case-study-auram-jewellery` | Yes | 482 | 5 / 5 | 22 | Legacy/Older | Custom Footer |
| `/case-study-calvin-klein` | `/case-study-calvin-klein` | Yes | 463 | 4 / 4 | 34 | Partial/Variant | Custom Footer |
| `/case-study-giva` | `/case-study-giva` | Yes | 579 | 4 / 4 | 34 | Partial/Variant | Custom Footer |
| `/case-study-herbalife` | `/case-study-herbalife` | Yes | 203 | 4 / 4 | 14 | Simple/Custom Nav | Custom Footer |
| `/case-study-japfa` | `/case-study-japfa` | Yes | 853 | 1 / 1 | 36 | Partial/Variant | Modern 4-Col |
| `/case-study-observance` | `/case-study-observance` | Yes | 194 | 3 / 3 | 14 | Simple/Custom Nav | Custom Footer |
| `/case-study-onsurity` | `/case-study-onsurity` | Yes | 194 | 4 / 4 | 14 | Simple/Custom Nav | Custom Footer |
| `/case-study-signeasy` | `/case-study-signeasy` | Yes | 366 | 1 / 1 | 22 | Legacy/Older | Custom Footer |
| `/commercial-films` | `/films` | **No** | 1265 | 0 / 0 | 37 | Legacy/Older | Custom Footer |
| `/contact` | `/contact` | Yes | 353 | 81 / 22 | 32 | Partial/Variant | Modern 4-Col |
| `/corporate-video-production` | `/corporate-video-production` | Yes | 915 | 13 / 7 | 41 | Partial/Variant | Older 3-Col |
| `/ecommerce` | `/ecommerce` | Yes | 879 | 77 / 10 | 34 | Partial/Variant | Custom Footer |
| `/films` | `/films` | Yes | 1303 | 15 / 9 | 42 | Partial/Variant | Older 3-Col |
| `/get-started` | `/get-started` | Yes | 524 | 136 / 55 | 30 | Partial/Variant | Custom Footer |
| `/` | `/` | Yes | 2193 | 163 / 2 | 79 | Partial/Variant | Modern 4-Col |
| `/influencer-marketing` | `/influencer-marketing` | Yes | 1429 | 44 / 8 | 38 | Partial/Variant | Modern 4-Col |
| `/join-team` | `/join-team` | Yes | 627 | 60 / 0 | 30 | Partial/Variant | Custom Footer |
| `/media-offerings` | `/media-offerings` | Yes | 2049 | 146 / 9 | 59 | Partial/Variant | Custom Footer |
| `/motion-graphics-animation` | `/motion-graphics-animation` | Yes | 911 | 14 / 8 | 41 | Partial/Variant | Older 3-Col |
| `/performance-marketing` | `/performance-marketing` | Yes | 831 | 82 / 8 | 37 | Partial/Variant | Modern 4-Col |
| `/portfolio` | `/portfolio` | Yes | 269 | 114 / 17 | 33 | Partial/Variant | Custom Footer |
| `/privacy-policy` | `/privacy-policy` | Yes | 521 | 33 / 0 | 30 | Partial/Variant | Custom Footer |
| `/social-media-marketing` | `/social-media-marketing` | Yes | 957 | 37 / 1 | 35 | Partial/Variant | Modern 4-Col |
| `/video-production` | `/video-production` | Yes | 2361 | 146 / 32 | 53 | Partial/Variant | Older 3-Col |
