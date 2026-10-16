#!/usr/bin/env node

/**
 * link-audit.js
 * Comprehensive internal link and technical SEO audit script.
 * Audits every HTML page in the repository for:
 * - Inbound links (count + sources, total & contextual)
 * - Outbound links & anchor texts
 * - Click depth from /
 * - Canonical & redirects resolution
 * - In-sitemap status
 * - Links to redirecting / non-canonical URLs
 * - Word count, Title, H1, Meta Description
 * - JSON-LD Schema @types
 * - Nav and Footer template variants
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper: load _redirects
function loadRedirects() {
    const redirectsPath = path.join(ROOT_DIR, '_redirects');
    const redirectMap = new Map();
    if (!fs.existsSync(redirectsPath)) return redirectMap;

    const lines = fs.readFileSync(redirectsPath, 'utf8').split('\n');
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#')) continue;
        const parts = line.split(/\s+/);
        // Netlify format:
        // /path /target 301!
        // or /path query=val /target 301!
        if (parts.length >= 2) {
            let from = parts[0];
            let to = parts[1];
            if (parts.length >= 3 && parts[1].includes('=')) {
                // query param redirect: ignore for clean path matching
                continue;
            }
            redirectMap.set(from, to);
        }
    }
    return redirectMap;
}

// Helper: load sitemap.xml
function loadSitemap() {
    const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
    const urls = new Set();
    if (!fs.existsSync(sitemapPath)) return urls;

    const content = fs.readFileSync(sitemapPath, 'utf8');
    const locRegex = /<loc>(.*?)<\/loc>/g;
    let match;
    while ((match = locRegex.exec(content)) !== null) {
        let u = match[1].trim();
        try {
            const parsed = new URL(u);
            urls.add(parsed.pathname === '' ? '/' : parsed.pathname);
        } catch (e) {
            urls.add(u);
        }
    }
    return urls;
}

// Map HTML filename to expected canonical clean URL
function fileToCleanUrl(filename) {
    if (filename === 'index.html') return '/';
    return '/' + filename.replace(/\.html$/, '');
}

// Clean target url from href
function normalizeHref(href, currentFile) {
    if (!href) return null;
    let h = href.trim();
    if (h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript:') || h === '#') {
        return null;
    }
    // External URLs
    if (h.startsWith('http://') || h.startsWith('https://')) {
        try {
            const parsed = new URL(h);
            if (parsed.hostname === 'paarustudio.com' || parsed.hostname === 'www.paarustudio.com') {
                return parsed.pathname === '' ? '/' : parsed.pathname;
            }
            return null; // External
        } catch (e) {
            return null;
        }
    }
    // Remove hash and query
    let clean = h.split('#')[0].split('?')[0];
    if (!clean) {
        if (h.startsWith('#')) return null; // In-page anchor
        return null;
    }
    if (!clean.startsWith('/')) {
        clean = '/' + clean;
    }
    // Standardize
    if (clean === '/index.html') clean = '/';
    return clean;
}

// Strip HTML tags for word count
function extractText(html) {
    let text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return text;
}

// Parse a single HTML file
function parseHtmlFile(filepath, filename, redirects) {
    const content = fs.readFileSync(filepath, 'utf8');

    // Title
    const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/is);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';

    // Meta Description
    const metaDescMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/is)
        || content.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/is);
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : '';

    // Canonical
    const canonicalMatch = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/is)
        || content.match(/<link[^>]*href=["'](.*?)["'][^>]*rel=["']canonical["']/is);
    let canonical = canonicalMatch ? canonicalMatch[1].trim() : '';
    let canonicalPath = '';
    if (canonical) {
        try {
            canonicalPath = new URL(canonical).pathname || '/';
        } catch (e) {
            canonicalPath = canonical;
        }
    }

    // H1
    const h1Matches = [...content.matchAll(/<h1[^>]*>(.*?)<\/h1>/gis)];
    const h1List = h1Matches.map(m => m[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' '));
    const h1 = h1List.join(' | ');

    // JSON-LD Types
    const ldJsonMatches = [...content.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const jsonLdTypes = [];
    for (const m of ldJsonMatches) {
        try {
            const data = JSON.parse(m[1].trim());
            function findTypes(obj) {
                if (!obj) return;
                if (Array.isArray(obj)) {
                    obj.forEach(findTypes);
                } else if (typeof obj === 'object') {
                    if (obj['@type']) {
                        if (Array.isArray(obj['@type'])) {
                            jsonLdTypes.push(...obj['@type']);
                        } else {
                            jsonLdTypes.push(obj['@type']);
                        }
                    }
                    for (const k in obj) {
                        if (typeof obj[k] === 'object') findTypes(obj[k]);
                    }
                }
            }
            findTypes(data);
        } catch (e) {
            // malformed json-ld fallback
            const typeMatches = m[1].match(/"@type"\s*:\s*["']([^"']+)["']/g);
            if (typeMatches) {
                typeMatches.forEach(tm => {
                    const t = tm.replace(/"@type"\s*:\s*["']/, '').replace(/["']$/, '');
                    jsonLdTypes.push(t);
                });
            }
        }
    }

    // Nav Template Variant Detection
    let navVariant = 'Unknown';
    if (content.includes('class="navbar"')) {
        const navBlockMatch = content.match(/<nav class=["']navbar["'][\s\S]*?<\/nav>/i);
        const navContent = navBlockMatch ? navBlockMatch[0] : '';
        const hasServicesDropdown = navContent.includes('Services <span') || navContent.includes('Services<span');
        const hasMediaDropdown = navContent.includes('Media <span') || navContent.includes('Media<span');
        const hasCaseStudies = navContent.includes('href="/case-studies"') || navContent.includes('href="case-studies.html"');
        const hasBlog = navContent.includes('href="/blog"') || navContent.includes('href="blog.html"');
        const hasJoinTeamInNav = navContent.includes('join-team');

        if (hasServicesDropdown && hasMediaDropdown && hasCaseStudies && hasBlog && !hasJoinTeamInNav) {
            navVariant = 'Modern Full (Services+Media, CaseStudies, Blog, AI, Contact)';
        } else if (hasJoinTeamInNav && (!hasCaseStudies || !hasBlog)) {
            navVariant = 'Legacy/Older (Join Team in Nav, missing CaseStudies/Blog)';
        } else if (hasServicesDropdown && hasMediaDropdown) {
            navVariant = 'Partial/Variant (Services+Media present)';
        } else {
            navVariant = 'Simple/Custom Nav';
        }
    } else {
        navVariant = 'No .navbar detected';
    }

    // Footer Template Variant Detection
    let footerVariant = 'Unknown';
    if (content.includes('<footer')) {
        const hasServicesCol = content.includes('<h4>Services</h4>');
        const hasVideoMediaCol = content.includes('<h4>Video &amp; Media</h4>') || content.includes('<h4>Video & Media</h4>');
        const hasResourcesCol = content.includes('<h4>Resources</h4>');
        const hasCompanyCol = content.includes('<h4>Company</h4>');
        const hasLegalCol = content.includes('<h4>Legal</h4>');
        const hasAskAi = content.includes('ask-ai-section');

        if (hasServicesCol && hasCompanyCol && hasResourcesCol && hasLegalCol) {
            footerVariant = 'Modern 4-Col (Services/Company/Resources/Legal)' + (hasAskAi ? ' + AskAI' : '');
        } else if (hasVideoMediaCol && hasCompanyCol && hasLegalCol && !hasResourcesCol) {
            footerVariant = 'Older 3-Col (Video & Media/Company/Legal)';
        } else {
            footerVariant = `Custom Footer (${hasServicesCol ? 'Services ' : ''}${hasVideoMediaCol ? 'VideoMedia ' : ''}${hasResourcesCol ? 'Resources ' : ''}${hasCompanyCol ? 'Company ' : ''}${hasLegalCol ? 'Legal' : ''})`.trim();
        }
    } else {
        footerVariant = 'No <footer> detected';
    }

    // Word Count
    const plainText = extractText(content);
    const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;

    // Separate Contextual vs Template Links
    // Locate <nav> and <footer>
    const navMatch = content.match(/<nav\b[\s\S]*?<\/nav>/gi) || [];
    const footerMatch = content.match(/<footer\b[\s\S]*?<\/footer>/gi) || [];
    const templateHtml = [...navMatch, ...footerMatch].join('\n');

    // Extract all <a> tags
    const linkRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
    let match;
    const allLinks = [];
    while ((match = linkRegex.exec(content)) !== null) {
        const fullTag = match[0];
        const attrs = match[1];
        const innerText = match[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
        const hrefMatch = attrs.match(/href=["']([^"']*)["']/i);
        if (hrefMatch) {
            const rawHref = hrefMatch[1];
            const isTemplate = templateHtml.includes(fullTag);
            allLinks.push({
                rawHref,
                anchor: innerText || '[image/icon]',
                isTemplate
            });
        }
    }

    return {
        filename,
        filepath,
        cleanUrl: fileToCleanUrl(filename),
        title,
        metaDescription,
        canonical,
        canonicalPath,
        h1List,
        h1,
        jsonLdTypes: [...new Set(jsonLdTypes)],
        navVariant,
        footerVariant,
        wordCount,
        allLinks
    };
}

// Run audit
function runAudit() {
    const redirects = loadRedirects();
    const sitemapUrls = loadSitemap();

    // Read all html files in ROOT_DIR
    const files = fs.readdirSync(ROOT_DIR)
        .filter(f => f.endsWith('.html') && !f.includes('.backup'));

    const pages = new Map();
    for (const f of files) {
        const pageData = parseHtmlFile(path.join(ROOT_DIR, f), f, redirects);
        pages.set(pageData.cleanUrl, pageData);
    }

    // Known canonical URLs in the system
    const allCanonicalUrls = new Set([...pages.keys()]);

    // Build link graph
    // inboundLinks: targetUrl -> array of { sourceUrl, anchor, isTemplate, rawHref }
    const inboundMap = new Map();
    const outboundMap = new Map();
    const redirectLinksFound = [];

    for (const [url, page] of pages) {
        inboundMap.set(url, []);
        outboundMap.set(url, []);
    }

    for (const [sourceUrl, page] of pages) {
        for (const link of page.allLinks) {
            const normalized = normalizeHref(link.rawHref, page.filename);
            if (!normalized) continue;

            // Check if normalized is a redirecting URL
            let resolvedTarget = normalized;
            let isRedirect = false;
            let currentCheck = normalized;
            let visitedRedirects = new Set();

            while (redirects.has(currentCheck)) {
                isRedirect = true;
                visitedRedirects.add(currentCheck);
                currentCheck = redirects.get(currentCheck);
                // strip hash/query for internal routing
                let cleanRedirect = currentCheck.split('#')[0].split('?')[0];
                if (visitedRedirects.has(cleanRedirect)) break; // loop protection
                resolvedTarget = cleanRedirect;
            }

            if (isRedirect || link.rawHref.endsWith('.html')) {
                redirectLinksFound.push({
                    sourceUrl,
                    rawHref: link.rawHref,
                    normalized,
                    resolvedTarget,
                    anchor: link.anchor,
                    isTemplate: link.isTemplate
                });
            }

            // Map to existing page
            if (inboundMap.has(resolvedTarget)) {
                inboundMap.get(resolvedTarget).push({
                    sourceUrl,
                    anchor: link.anchor,
                    isTemplate: link.isTemplate,
                    rawHref: link.rawHref
                });
            }

            outboundMap.get(sourceUrl).push({
                targetUrl: resolvedTarget,
                rawHref: link.rawHref,
                anchor: link.anchor,
                isTemplate: link.isTemplate,
                isRedirect
            });
        }
    }

    // Calculate BFS Click Depth from '/'
    const clickDepth = new Map();
    for (const u of pages.keys()) {
        clickDepth.set(u, Infinity);
    }
    if (clickDepth.has('/')) {
        clickDepth.set('/', 0);
        const queue = ['/'];
        while (queue.length > 0) {
            const current = queue.shift();
            const currentDepth = clickDepth.get(current);
            const outLinks = outboundMap.get(current) || [];
            for (const ol of outLinks) {
                if (clickDepth.has(ol.targetUrl)) {
                    if (clickDepth.get(ol.targetUrl) > currentDepth + 1) {
                        clickDepth.set(ol.targetUrl, currentDepth + 1);
                        queue.push(ol.targetUrl);
                    }
                }
            }
        }
    }

    // Categorize issues
    const orphanPages = [];
    const depthGt2 = [];
    const lowContextualInbound = [];
    const missingFromSitemap = [];
    const thinPages = [];
    const navFooterMismatches = [];
    const nonCanonicalPages = [];

    const pageSummaries = [];

    for (const [url, page] of pages) {
        const inLinks = inboundMap.get(url) || [];
        const contextualInLinks = inLinks.filter(l => !l.isTemplate);
        const depth = clickDepth.get(url);
        const inSitemap = sitemapUrls.has(url);
        const isNonCanonical = (page.canonicalPath && page.canonicalPath !== url) || redirects.has(url);

        if (isNonCanonical) {
            nonCanonicalPages.push({
                url,
                filename: page.filename,
                canonicalTarget: page.canonicalPath,
                redirectTarget: redirects.get(url)
            });
        } else {
            if (inLinks.length === 0 && url !== '/') {
                orphanPages.push(url);
            }
            if (depth > 2 && depth !== Infinity) {
                depthGt2.push({ url, depth });
            }
            if (depth === Infinity && url !== '/') {
                depthGt2.push({ url, depth: 'Unreachable' });
            }
            if (contextualInLinks.length < 3 && url !== '/') {
                lowContextualInbound.push({
                    url,
                    count: contextualInLinks.length,
                    sources: [...new Set(contextualInLinks.map(l => l.sourceUrl))]
                });
            }
            if (!inSitemap) {
                missingFromSitemap.push(url);
            }
        }

        if (page.wordCount < 500) {
            thinPages.push({ url, wordCount: page.wordCount, h1: page.h1 });
        }
        if (!page.navVariant.startsWith('Modern Full') || !page.footerVariant.startsWith('Modern 4-Col')) {
            navFooterMismatches.push({
                url,
                navVariant: page.navVariant,
                footerVariant: page.footerVariant
            });
        }

        pageSummaries.push({
            url,
            filename: page.filename,
            title: page.title,
            h1: page.h1,
            metaDescription: page.metaDescription,
            canonicalPath: page.canonicalPath,
            wordCount: page.wordCount,
            inSitemap,
            depth,
            totalInbound: inLinks.length,
            contextualInbound: contextualInLinks.length,
            inboundSources: [...new Set(inLinks.map(l => l.sourceUrl))],
            contextualSources: [...new Set(contextualInLinks.map(l => l.sourceUrl))],
            totalOutbound: (outboundMap.get(url) || []).length,
            jsonLdTypes: page.jsonLdTypes,
            navVariant: page.navVariant,
            footerVariant: page.footerVariant
        });
    }

    return {
        totalPages: pages.size,
        sitemapUrlCount: sitemapUrls.size,
        orphanPages,
        depthGt2,
        lowContextualInbound,
        missingFromSitemap,
        thinPages,
        navFooterMismatches,
        nonCanonicalPages,
        redirectLinksFound,
        pageSummaries,
        pages,
        inboundMap,
        outboundMap,
        clickDepth,
        sitemapUrls
    };
}

// If run directly from command line
if (require.main === module) {
    const audit = runAudit();
    console.log(`=== LINK AUDIT SUMMARY ===`);
    console.log(`Total HTML pages: ${audit.totalPages}`);
    console.log(`Canonical indexable pages: ${audit.totalPages - audit.nonCanonicalPages.length}`);
    console.log(`Total URLs in sitemap: ${audit.sitemapUrlCount}`);
    console.log(`Orphans (0 total inbound): ${audit.orphanPages.length} ->`, audit.orphanPages);
    console.log(`Click depth > 2 from /: ${audit.depthGt2.length} ->`, audit.depthGt2);
    console.log(`Pages with < 3 contextual inbound links: ${audit.lowContextualInbound.length}`);
    console.log(`Pages missing from sitemap.xml: ${audit.missingFromSitemap.length} ->`, audit.missingFromSitemap);
    console.log(`Non-canonical / redirected pages: ${audit.nonCanonicalPages.length} ->`, audit.nonCanonicalPages.map(p => p.url));
    console.log(`Thin pages (< 500 words): ${audit.thinPages.length}`);
    console.log(`Nav/Footer template mismatches: ${audit.navFooterMismatches.length}`);
    console.log(`Internal links pointing to redirects or .html: ${audit.redirectLinksFound.length}`);

    // If --json flag passed, output JSON
    if (process.argv.includes('--json')) {
        console.log(JSON.stringify(audit, null, 2));
    }
}

module.exports = { runAudit, loadRedirects, loadSitemap };
