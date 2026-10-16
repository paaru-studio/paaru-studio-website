/**
 * add-blog-links.js
 * Task 7: Blog Interlinking
 * 1. Add "Related Reading" blocks to the 3 featured blog posts
 * 2. Add contextual blog links from service pages to relevant blog posts
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ── 1. Related Reading blocks for featured blog posts ──

const BLOG_RELATED = {
  'blog-modern-advertising-trends-2026': {
    relatedPosts: [
      { href: '/blog-ai-in-advertising-and-production', title: 'AI in Advertising & Production', badge: 'AI & Technology' },
      { href: '/blog-creative-agency-vs-ad-agency-trends', title: 'Creative Agency vs Ad Agency: Key Differences', badge: 'Industry Insights' },
      { href: '/blog-viral-video-marketing', title: 'Viral Video Marketing Strategies', badge: 'Video Marketing' },
    ],
    serviceLinks: [
      { href: '/video-production', label: 'Video Production' },
      { href: '/performance-marketing', label: 'Performance Marketing' },
      { href: '/social-media-marketing', label: 'Social Media Marketing' },
    ],
  },
  'blog-ai-in-advertising-and-production': {
    relatedPosts: [
      { href: '/blog-modern-advertising-trends-2026', title: 'Modern Advertising Trends 2026', badge: 'Industry Trends' },
      { href: '/blog-creative-agency-vs-ad-agency-trends', title: 'Creative Agency vs Ad Agency: Key Differences', badge: 'Industry Insights' },
      { href: '/blog-video-production-essentials', title: 'Video Production Essentials', badge: 'Production Guide' },
    ],
    serviceLinks: [
      { href: '/ai-services', label: 'AI Services' },
      { href: '/video-production', label: 'Video Production' },
      { href: '/corporate-video-production', label: 'Corporate Video Production' },
    ],
  },
  'blog-creative-agency-vs-ad-agency-trends': {
    relatedPosts: [
      { href: '/blog-modern-advertising-trends-2026', title: 'Modern Advertising Trends 2026', badge: 'Industry Trends' },
      { href: '/blog-ai-in-advertising-and-production', title: 'AI in Advertising & Production', badge: 'AI & Technology' },
      { href: '/blog-corporate-videos', title: 'Corporate Videos That Drive Results', badge: 'Corporate Films' },
    ],
    serviceLinks: [
      { href: '/video-production', label: 'Video Production' },
      { href: '/media-offerings', label: 'Offline & OOH Marketing' },
      { href: '/get-started', label: 'Get Started' },
    ],
  },
};

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;');
}

function buildRelatedReadingBlock(config) {
  const postCards = config.relatedPosts.map(p =>
    `                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; flex: 1; min-width: 240px;">
                        <span style="color: var(--accent-color, #ffbf00); font-size: 11px; font-weight: 700; text-transform: uppercase;">${escapeHtml(p.badge)}</span>
                        <h4 style="font-size: 17px; color: #fff; margin: 8px 0 12px; line-height: 1.3;">${escapeHtml(p.title)}</h4>
                        <a href="${p.href}" style="color: var(--accent-color, #ffbf00); text-decoration: underline; font-weight: 600; font-size: 13.5px;">Read Article →</a>
                    </div>`
  ).join('\n');

  const svcPills = config.serviceLinks.map(s =>
    `                    <a href="${s.href}" style="display: inline-block; padding: 8px 20px; border-radius: 999px; background: rgba(255,191,0,0.12); color: var(--accent-color, #ffbf00); text-decoration: none; font-weight: 600; font-size: 13px; border: 1px solid rgba(255,191,0,0.25);">${escapeHtml(s.label)}</a>`
  ).join('\n');

  return `
                <!-- Related Reading & Services -->
                <div style="margin-top: 48px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.08);">
                    <span style="font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--accent-color, #ffbf00); text-transform: uppercase;">Continue Reading</span>
                    <h3 style="font-size: 22px; font-weight: 800; color: #fff; margin: 8px 0 20px;">Related Articles</h3>
                    <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 36px;">
${postCards}
                    </div>
                    <span style="font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--accent-color, #ffbf00); text-transform: uppercase;">Explore Services</span>
                    <h3 style="font-size: 18px; font-weight: 700; color: #fff; margin: 8px 0 16px;">Services Related to This Article</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
${svcPills}
                        <a href="/blog" style="display: inline-block; padding: 8px 20px; border-radius: 999px; background: rgba(255,255,255,0.06); color: #fff; text-decoration: none; font-weight: 600; font-size: 13px; border: 1px solid rgba(255,255,255,0.12);">← All Blog Posts</a>
                    </div>
                </div>
`;
}

// ── 2. Service page -> blog contextual links ──

const SERVICE_BLOG_LINKS = [
  {
    file: 'ai-services.html',
    search: 'Amplify Every Creative Output With',
    contextBefore: 'Amplify Every Creative Output With',
    // We'll add a link in the section desc
    findText: null, // Will use a different approach
  },
  // These will be handled by targeted text replacements
];

// ── Execute Part 1: Add Related Reading blocks ──

let modified = 0;

for (const [slug, config] of Object.entries(BLOG_RELATED)) {
  const filePath = path.join(ROOT, `${slug}.html`);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ File not found: ${slug}.html`);
    continue;
  }
  let html = fs.readFileSync(filePath, 'utf8');

  if (html.includes('Related Reading &amp; Services') || html.includes('Continue Reading')) {
    console.log(`✓ ${slug}.html – already has Related Reading block, skipping`);
    continue;
  }

  // Find the CTA band and insert Related Reading before it
  const ctaMarker = '<!-- In-Article CTA Band -->';
  const idx = html.indexOf(ctaMarker);
  if (idx === -1) {
    // Try alternate: insert before footer
    const footerIdx = html.indexOf('        <!-- Footer -->');
    if (footerIdx === -1) {
      console.log(`⚠ ${slug}.html – no insertion point found`);
      continue;
    }
    // Insert before closing </section> before footer
    const sectionEnd = html.lastIndexOf('</section>', footerIdx);
    if (sectionEnd === -1) {
      console.log(`⚠ ${slug}.html – no </section> found before footer`);
      continue;
    }
    const block = buildRelatedReadingBlock(config);
    html = html.slice(0, sectionEnd) + block + '\n    ' + html.slice(sectionEnd);
  } else {
    const block = buildRelatedReadingBlock(config);
    html = html.slice(0, idx) + block + '\n                ' + html.slice(idx);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ ${slug}.html – added Related Reading block`);
  modified++;
}

console.log(`\nPart 1 done. Modified ${modified} blog files.\n`);

// ── Execute Part 2: Add contextual blog links from service pages ──

const contextualLinks = [
  {
    file: 'ai-services.html',
    // Find a good place in the body to add blog link
    marker: '<!-- Footer -->',
    findInBody: 'AI-powered video pipeline',
    replaceWith: null,
  },
  {
    file: 'performance-marketing.html',
    findInBody: 'Performance-Tracked Ad Buying',
    replaceWith: null,
  },
  {
    file: 'social-media-marketing.html',
    findInBody: 'ROI-Driven Social Advertising',
    replaceWith: null,
  },
];

// For service -> blog links, use targeted replacements

// ai-services.html: Find a relevant paragraph and add link to blog-ai post
const aiFile = path.join(ROOT, 'ai-services.html');
if (fs.existsSync(aiFile)) {
  let html = fs.readFileSync(aiFile, 'utf8');
  if (!html.includes('/blog-ai-in-advertising-and-production')) {
    // Find the CTA or closing section and add a contextual mention
    const footerMarker = '        <!-- Footer -->';
    const footerIdx = html.indexOf(footerMarker);
    if (footerIdx !== -1) {
      // Insert a small related blog reading section before footer
      const blogBlock = `
    <!-- Related Blog Reading -->
    <section style="padding: 40px 16px; background: #0a0a0a; border-top: 1px solid rgba(255,255,255,0.06);">
        <div class="container" style="max-width: 800px; margin: 0 auto; text-align: center;">
            <span style="font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--accent-color, #ffbf00); text-transform: uppercase;">From Our Blog</span>
            <h3 style="font-size: 22px; font-weight: 800; color: #fff; margin: 10px 0 12px;">Deep Dive into AI-Powered Advertising</h3>
            <p style="color: rgba(255,255,255,0.6); font-size: 15px; margin-bottom: 20px;">Explore how artificial intelligence is transforming creative production and advertising workflows.</p>
            <a href="/blog-ai-in-advertising-and-production" style="display: inline-block; padding: 12px 28px; border-radius: 999px; background: rgba(255,191,0,0.12); color: var(--accent-color, #ffbf00); text-decoration: none; font-weight: 700; font-size: 14px; border: 1px solid rgba(255,191,0,0.25);">Read: AI in Advertising & Production →</a>
        </div>
    </section>

`;
      html = html.slice(0, footerIdx) + blogBlock + html.slice(footerIdx);
      fs.writeFileSync(aiFile, html, 'utf8');
      console.log(`✅ ai-services.html – added blog link to /blog-ai-in-advertising-and-production`);
    }
  } else {
    console.log(`✓ ai-services.html – already links to blog-ai post`);
  }
}

// performance-marketing.html: Add link to blog-modern-advertising-trends-2026
const perfFile = path.join(ROOT, 'performance-marketing.html');
if (fs.existsSync(perfFile)) {
  let html = fs.readFileSync(perfFile, 'utf8');
  if (!html.includes('/blog-modern-advertising-trends-2026')) {
    const footerMarker = '        <!-- Footer -->';
    const footerIdx = html.indexOf(footerMarker);
    if (footerIdx !== -1) {
      const blogBlock = `
    <!-- Related Blog Reading -->
    <section style="padding: 40px 16px; background: #0a0a0a; border-top: 1px solid rgba(255,255,255,0.06);">
        <div class="container" style="max-width: 800px; margin: 0 auto; text-align: center;">
            <span style="font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--accent-color, #ffbf00); text-transform: uppercase;">From Our Blog</span>
            <h3 style="font-size: 22px; font-weight: 800; color: #fff; margin: 10px 0 12px;">Stay Ahead of the Performance Curve</h3>
            <p style="color: rgba(255,255,255,0.6); font-size: 15px; margin-bottom: 20px;">Discover how performance creative, AI-driven ad optimization, and dynamic DOOH are reshaping advertising in 2026.</p>
            <a href="/blog-modern-advertising-trends-2026" style="display: inline-block; padding: 12px 28px; border-radius: 999px; background: rgba(255,191,0,0.12); color: var(--accent-color, #ffbf00); text-decoration: none; font-weight: 700; font-size: 14px; border: 1px solid rgba(255,191,0,0.25);">Read: Modern Advertising Trends 2026 →</a>
        </div>
    </section>

`;
      html = html.slice(0, footerIdx) + blogBlock + html.slice(footerIdx);
      fs.writeFileSync(perfFile, html, 'utf8');
      console.log(`✅ performance-marketing.html – added blog link to /blog-modern-advertising-trends-2026`);
    }
  } else {
    console.log(`✓ performance-marketing.html – already links to blog post`);
  }
}

// social-media-marketing.html: Add link to blog-modern-advertising-trends-2026
const smmFile = path.join(ROOT, 'social-media-marketing.html');
if (fs.existsSync(smmFile)) {
  let html = fs.readFileSync(smmFile, 'utf8');
  if (!html.includes('/blog-modern-advertising-trends-2026')) {
    const footerMarker = '        <!-- Footer -->';
    const footerIdx = html.indexOf(footerMarker);
    if (footerIdx !== -1) {
      const blogBlock = `
    <!-- Related Blog Reading -->
    <section style="padding: 40px 16px; background: #0a0a0a; border-top: 1px solid rgba(255,255,255,0.06);">
        <div class="container" style="max-width: 800px; margin: 0 auto; text-align: center;">
            <span style="font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--accent-color, #ffbf00); text-transform: uppercase;">From Our Blog</span>
            <h3 style="font-size: 22px; font-weight: 800; color: #fff; margin: 10px 0 12px;">The Future of Social Advertising</h3>
            <p style="color: rgba(255,255,255,0.6); font-size: 15px; margin-bottom: 20px;">Explore how creator-driven UGC, AI tools, and performance creative are reshaping modern advertising strategies.</p>
            <a href="/blog-modern-advertising-trends-2026" style="display: inline-block; padding: 12px 28px; border-radius: 999px; background: rgba(255,191,0,0.12); color: var(--accent-color, #ffbf00); text-decoration: none; font-weight: 700; font-size: 14px; border: 1px solid rgba(255,191,0,0.25);">Read: Modern Advertising Trends 2026 →</a>
        </div>
    </section>

`;
      html = html.slice(0, footerIdx) + blogBlock + html.slice(footerIdx);
      fs.writeFileSync(smmFile, html, 'utf8');
      console.log(`✅ social-media-marketing.html – added blog link to /blog-modern-advertising-trends-2026`);
    }
  } else {
    console.log(`✓ social-media-marketing.html – already links to blog post`);
  }
}

// media-offerings.html & get-started.html: Link to blog-creative-agency-vs-ad-agency-trends
for (const fileName of ['media-offerings.html', 'get-started.html']) {
  const filePath = path.join(ROOT, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ ${fileName} not found`);
    continue;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('/blog-creative-agency-vs-ad-agency-trends')) {
    const footerMarker = '        <!-- Footer -->';
    const footerIdx = html.indexOf(footerMarker);
    if (footerIdx !== -1) {
      const blogBlock = `
    <!-- Related Blog Reading -->
    <section style="padding: 40px 16px; background: #0a0a0a; border-top: 1px solid rgba(255,255,255,0.06);">
        <div class="container" style="max-width: 800px; margin: 0 auto; text-align: center;">
            <span style="font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--accent-color, #ffbf00); text-transform: uppercase;">From Our Blog</span>
            <h3 style="font-size: 22px; font-weight: 800; color: #fff; margin: 10px 0 12px;">Creative Agency vs Ad Agency: What's Right for Your Brand?</h3>
            <p style="color: rgba(255,255,255,0.6); font-size: 15px; margin-bottom: 20px;">Understand the strategic differences and discover why brands in 2026 are choosing integrated creative partners.</p>
            <a href="/blog-creative-agency-vs-ad-agency-trends" style="display: inline-block; padding: 12px 28px; border-radius: 999px; background: rgba(255,191,0,0.12); color: var(--accent-color, #ffbf00); text-decoration: none; font-weight: 700; font-size: 14px; border: 1px solid rgba(255,191,0,0.25);">Read: Creative Agency vs Ad Agency →</a>
        </div>
    </section>

`;
      html = html.slice(0, footerIdx) + blogBlock + html.slice(footerIdx);
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`✅ ${fileName} – added blog link to /blog-creative-agency-vs-ad-agency-trends`);
    }
  } else {
    console.log(`✓ ${fileName} – already links to blog post`);
  }
}

console.log('\nPart 2 done. Blog interlinking complete.');
