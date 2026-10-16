/**
 * check-sitemap.js
 * Validates that every canonical, indexable HTML page in the repo
 * is present in sitemap.xml. Exits with code 1 if any are missing.
 *
 * Excluded from sitemap:
 *  - commercial-films.html (canonical -> /films)
 *  - index.html (represented as https://paarustudio.com/)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');

// Files that should NOT appear in the sitemap (non-canonical / redirected)
const EXCLUDED = new Set(['commercial-films', 'index']);

// ── 1. Gather all HTML slugs ──
const htmlFiles = fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.html'))
  .map(f => f.replace('.html', ''))
  .filter(slug => !EXCLUDED.has(slug));

// ── 2. Parse sitemap URLs ──
const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
const sitemapUrls = new Set();
const locRegex = /<loc>(.*?)<\/loc>/g;
let match;
while ((match = locRegex.exec(sitemapXml)) !== null) {
  let url = match[1].replace('https://paarustudio.com/', '').replace(/\/$/, '');
  if (url === '') url = '__homepage__'; // homepage
  sitemapUrls.add(url);
}

// ── 3. Validate ──
const missing = [];
for (const slug of htmlFiles) {
  if (!sitemapUrls.has(slug)) {
    missing.push(slug);
  }
}

// Also validate that homepage is present
if (!sitemapUrls.has('__homepage__')) {
  missing.push('/ (homepage)');
}

// ── 4. Check for sitemap entries that don't have corresponding HTML ──
const extraInSitemap = [];
for (const url of sitemapUrls) {
  if (url === '__homepage__') continue;
  const htmlPath = path.join(ROOT, `${url}.html`);
  if (!fs.existsSync(htmlPath)) {
    extraInSitemap.push(url);
  }
}

// ── 5. Verify robots.txt references sitemap ──
const robotsPath = path.join(ROOT, 'robots.txt');
let robotsOk = false;
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  robotsOk = robots.includes('sitemap.xml') || robots.includes('Sitemap:');
}

// ── Report ──
console.log('=== Sitemap Validation Report ===\n');
console.log(`HTML files (indexable):  ${htmlFiles.length}`);
console.log(`Sitemap URLs:           ${sitemapUrls.size}`);
console.log(`robots.txt references:  ${robotsOk ? '✅ Yes' : '❌ No'}`);
console.log('');

let hasErrors = false;

if (missing.length > 0) {
  console.log(`❌ MISSING from sitemap (${missing.length}):`);
  missing.forEach(s => console.log(`   - ${s}`));
  hasErrors = true;
} else {
  console.log('✅ All canonical pages present in sitemap');
}

if (extraInSitemap.length > 0) {
  console.log(`\n⚠ In sitemap but no HTML file found (${extraInSitemap.length}):`);
  extraInSitemap.forEach(s => console.log(`   - ${s}`));
}

if (!robotsOk) {
  console.log('\n❌ robots.txt does not reference sitemap.xml');
  hasErrors = true;
}

console.log('');
if (hasErrors) {
  console.log('RESULT: FAIL');
  process.exit(1);
} else {
  console.log('RESULT: PASS');
  process.exit(0);
}
