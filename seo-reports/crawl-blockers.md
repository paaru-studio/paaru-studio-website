# Crawl Blocker Audit & Resolution Report

**Target Pages:** `/video-production`, `/case-study-onsurity`, and other GSC "Discovered – currently not indexed" candidates (`/privacy-policy`, `/influencer-marketing`, `/ai-video-production`, `/about`, `/join-team`, and case study pages).  
**Status Date:** 2026-10-16  
**Auditor:** Senior Technical SEO Engineer

---

## 1. Technical Health Checklist

| Parameter | `/video-production` | `/case-study-onsurity` | Other Discovered Pages | Status |
|---|---|---|---|---|
| **Meta Robots** | `index, follow` (default) | `index, follow` (default) | `index, follow` (default) | Pass (No `noindex`) |
| **X-Robots-Tag** | None in `_headers` | None in `_headers` | None in `_headers` | Pass |
| **robots.txt** | `Allow: /` | `Allow: /` | `Allow: /` | Pass |
| **Canonical URL** | `https://paarustudio.com/video-production` | `https://paarustudio.com/case-study-onsurity` | Clean self-referencing canonicals | Pass |
| **HTTP Status Code** | 200 OK | 200 OK | 200 OK | Pass |
| **Redirect Chains** | None (Clean flat URLs, `.html` 301s to clean) | None | None | Pass |
| **Content Delivery** | 100% initial HTML (Static) | 100% initial HTML (Static) | 100% initial HTML (Static) | Pass (No JS rendering wall) |
| **Heavy Autoplay Video** | None (No `<video>` or `<iframe autoplay>`) | Standard lazy-loaded YouTube iframe | Standard lazy-loaded iframes | Pass |
| **Page Weight** | ~132 KB HTML | ~24 KB HTML | 22 KB - 105 KB | Pass |

---

## 2. Root Cause Analysis: Why Google Discovered But Did Not Crawl/Index

"Discovered – currently not indexed" in Google Search Console means Googlebot is aware of the URL's existence (from sitemaps or external/internal links), but its automated crawl scheduling system chose not to allocate crawl bandwidth to crawl the page.

Our deep inspection reveals the exact structural root causes:

### A. Template Inconsistency & Navigation Disconnection
- **Outdated Navbar on `/video-production`:** Still had the legacy menu (`Portfolio`, `Get Started`, `Join Team`, `Ai Services`, `Contact Us`), completely omitting `Case Studies` and `Blog`.
- **Outdated 3-Column Footer:** Contained obsolete 3-column navigation (`Video & Media`, `Company`, `Legal`) without the `Resources` column, and had dead placeholder links (`href="#"` for Facebook, Security Compliance, Accessibility, Terms of Use).
- **Stripped Minimalist Shell on Case Studies:** `/case-study-onsurity`, `/case-study-herbalife`, `/case-study-observance` had stripped-down header bars (no service dropdowns) and single-line copyright footers with zero service navigation links. To a crawler, arriving at a case study was an architectural dead-end.

### B. Missing Video Cluster Architecture (Spoke Isolation)
- While the homepage linked to `/video-production`, it **did not link** to its core video spokes:
  - `/corporate-video-production`
  - `/films` (TVCs, DVCs & UGC Hub)
  - `/motion-graphics-animation`
- Neither the main navigation menu nor the homepage footer linked to these three spokes.
- Spoke pages lacked reciprocal links to `/video-production` and to one another. Googlebot could not establish the topical authority and internal PageRank flow of the video production cluster.

### C. Thin Content on Case Studies
- `/case-study-onsurity` had only **194 words** of body copy.
- `/case-study-observance` had only **194 words**.
- `/case-study-herbalife` had only **203 words**.
- Without related service links, reciprocal case study links, or detailed case-study outcomes, these pages fell below Google's quality threshold for prompt indexing.

### D. Missing Schema & Semantic Heading Signals
- `/video-production` had a generic H1 (`Cinema-Grade Craft. Every Screen. Every Story.`) that lacked the primary target keyword ("Video Production Agency in Bangalore").
- Neither `/video-production` nor `/corporate-video-production` had comprehensive `Service` and `FAQPage` schema structured data aligned with the visible FAQs.

---

## 3. Corrective Action Plan

1. **Unify Site-Wide Navigation & Footers (Task 3):** Roll out the complete master header and 4-column footer to every page in the repo, eliminating all dead `#` links and ensuring every page has access to all services, case studies, blog, and resources.
2. **Contextual Homepage Links (Task 4):** Add in-body links from the homepage directly into `/corporate-video-production`, `/films`, and `/motion-graphics-animation`.
3. **Cluster Triangulation (Task 5 & 6):** Connect `/video-production` (hub) with all 3 spokes with distinct anchor texts, and create two-way links between service hubs and relevant case studies.
4. **Schema & Heading Enhancements (Task 10):** Add structured JSON-LD schemas (`BreadcrumbList`, `FAQPage`, `Service`) and enrich page headings.
