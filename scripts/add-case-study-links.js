/**
 * add-case-study-links.js
 * Adds "Related Services" and "Explore More Case Studies" blocks
 * just before the <!-- Footer --> comment on each case study page.
 * Also ensures each case study links back to /case-studies.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Mapping: case study slug -> { related services, peer case studies }
const CS_MAP = {
  'case-study-herbalife': {
    services: [
      { href: '/video-production', label: 'Video Production' },
      { href: '/films', label: 'TVCs, DVCs & UGC' },
      { href: '/ecommerce', label: 'E-Commerce Solutions' },
    ],
    peers: [
      { href: '/case-study-observance', label: 'Observance Eye Healthcare', badge: 'Healthcare DVC' },
      { href: '/case-study-onsurity', label: 'Onsurity HealthTech', badge: 'Motion Graphics' },
      { href: '/case-study-calvin-klein', label: 'Calvin Klein', badge: 'Luxury Fashion' },
    ],
  },
  'case-study-observance': {
    services: [
      { href: '/films', label: 'TVCs, DVCs & UGC' },
      { href: '/video-production', label: 'Video Production' },
    ],
    peers: [
      { href: '/case-study-herbalife', label: 'Herbalife Nutrition', badge: 'Brand Film' },
      { href: '/case-study-onsurity', label: 'Onsurity HealthTech', badge: 'Motion Graphics' },
      { href: '/case-study-japfa', label: 'Japfa Best', badge: 'Performance Marketing' },
    ],
  },
  'case-study-onsurity': {
    services: [
      { href: '/motion-graphics-animation', label: 'Motion Graphics & Animation' },
      { href: '/corporate-video-production', label: 'Corporate Video Production' },
    ],
    peers: [
      { href: '/case-study-herbalife', label: 'Herbalife Nutrition', badge: 'Brand Film' },
      { href: '/case-study-observance', label: 'Observance Eye Healthcare', badge: 'Healthcare DVC' },
      { href: '/case-study-signeasy', label: 'Signeasy Enterprise', badge: 'OOH Marketing' },
    ],
  },
  'case-study-calvin-klein': {
    services: [
      { href: '/video-production', label: 'Video Production' },
      { href: '/portfolio', label: 'Portfolio' },
    ],
    peers: [
      { href: '/case-study-giva', label: 'GIVA Jewellery', badge: 'E-Commerce & Fashion' },
      { href: '/case-study-herbalife', label: 'Herbalife Nutrition', badge: 'Brand Film' },
      { href: '/case-study-auram-jewellery', label: 'Auram Jewellery', badge: 'Performance Marketing' },
    ],
  },
  'case-study-giva': {
    services: [
      { href: '/ecommerce', label: 'E-Commerce Solutions' },
      { href: '/performance-marketing', label: 'Performance Marketing' },
    ],
    peers: [
      { href: '/case-study-auram-jewellery', label: 'Auram Jewellery', badge: 'Performance Marketing' },
      { href: '/case-study-calvin-klein', label: 'Calvin Klein', badge: 'Luxury Fashion' },
      { href: '/case-study-japfa', label: 'Japfa Best', badge: 'Performance Marketing' },
    ],
  },
  'case-study-auram-jewellery': {
    services: [
      { href: '/performance-marketing', label: 'Performance Marketing' },
      { href: '/ecommerce', label: 'E-Commerce Solutions' },
    ],
    peers: [
      { href: '/case-study-giva', label: 'GIVA Jewellery', badge: 'E-Commerce & Fashion' },
      { href: '/case-study-calvin-klein', label: 'Calvin Klein', badge: 'Luxury Fashion' },
      { href: '/case-study-herbalife', label: 'Herbalife Nutrition', badge: 'Brand Film' },
    ],
  },
  'case-study-signeasy': {
    services: [
      { href: '/media-offerings', label: 'Offline & OOH Marketing' },
      { href: '/corporate-video-production', label: 'Corporate Video Production' },
    ],
    peers: [
      { href: '/case-study-japfa', label: 'Japfa Best', badge: 'Performance Marketing' },
      { href: '/case-study-onsurity', label: 'Onsurity HealthTech', badge: 'Motion Graphics' },
      { href: '/case-study-observance', label: 'Observance Eye Healthcare', badge: 'Healthcare DVC' },
    ],
  },
  'case-study-japfa': {
    services: [
      { href: '/performance-marketing', label: 'Performance Marketing' },
      { href: '/social-media-marketing', label: 'Social Media Marketing' },
    ],
    peers: [
      { href: '/case-study-giva', label: 'GIVA Jewellery', badge: 'E-Commerce & Fashion' },
      { href: '/case-study-auram-jewellery', label: 'Auram Jewellery', badge: 'Performance Marketing' },
      { href: '/case-study-signeasy', label: 'Signeasy Enterprise', badge: 'OOH Marketing' },
    ],
  },
};

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;');
}

function buildRelatedBlock(slug, config) {
  const serviceLinks = config.services
    .map(
      s =>
        `                    <a href="${s.href}" style="display: inline-block; padding: 10px 22px; border-radius: 999px; background: rgba(255,191,0,0.12); color: var(--accent-color, #ffbf00); text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid rgba(255,191,0,0.25); transition: background 0.2s;">${escapeHtml(s.label)}</a>`
    )
    .join('\n');

  const peerCards = config.peers
    .map(
      p =>
        `                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; flex: 1; min-width: 240px;">
                        <span style="color: var(--accent-color, #ffbf00); font-size: 11px; font-weight: 700; text-transform: uppercase;">${escapeHtml(p.badge)}</span>
                        <h4 style="font-size: 18px; color: #fff; margin: 8px 0 12px;">${escapeHtml(p.label)}</h4>
                        <a href="${p.href}" style="color: var(--accent-color, #ffbf00); text-decoration: underline; font-weight: 600; font-size: 13.5px;">Read Case Study →</a>
                    </div>`
    )
    .join('\n');

  return `
    <!-- Related Services & More Case Studies -->
    <section style="padding: 60px 16px; background: #0a0a0a; border-top: 1px solid rgba(255,255,255,0.06);">
        <div class="container" style="max-width: 1100px; margin: 0 auto;">
            <div style="margin-bottom: 48px;">
                <span style="font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--accent-color, #ffbf00); text-transform: uppercase;">Related Services</span>
                <h3 style="font-size: 24px; font-weight: 800; color: #fff; margin: 8px 0 20px;">Explore the Services Behind This Project</h3>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
${serviceLinks}
                    <a href="/case-studies" style="display: inline-block; padding: 10px 22px; border-radius: 999px; background: rgba(255,255,255,0.06); color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid rgba(255,255,255,0.12); transition: background 0.2s;">← All Case Studies</a>
                </div>
            </div>
            <div>
                <span style="font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--accent-color, #ffbf00); text-transform: uppercase;">More Case Studies</span>
                <h3 style="font-size: 24px; font-weight: 800; color: #fff; margin: 8px 0 24px;">Explore Similar Projects</h3>
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
${peerCards}
                </div>
            </div>
        </div>
    </section>

`;
}

let modified = 0;

for (const [slug, config] of Object.entries(CS_MAP)) {
  const filePath = path.join(ROOT, `${slug}.html`);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ File not found: ${slug}.html`);
    continue;
  }
  let html = fs.readFileSync(filePath, 'utf8');

  // Check if we already added these blocks
  if (html.includes('Related Services & More Case Studies')) {
    console.log(`✓ ${slug}.html – already has Related block, skipping`);
    continue;
  }

  // Insert before <!-- Footer -->
  const footerMarker = '        <!-- Footer -->';
  const idx = html.indexOf(footerMarker);
  if (idx === -1) {
    console.log(`⚠ ${slug}.html – Footer marker not found`);
    continue;
  }

  const block = buildRelatedBlock(slug, config);
  html = html.slice(0, idx) + block + html.slice(idx);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ ${slug}.html – added Related Services + More Case Studies block`);
  modified++;
}

console.log(`\nDone. Modified ${modified} files.`);
