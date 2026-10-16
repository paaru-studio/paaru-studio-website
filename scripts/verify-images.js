/**
 * verify-images.js
 * 1. Checks that no references to old generic/unsafe filenames remain.
 * 2. Scans all HTML files and verifies that EVERY local image referenced in src, srcset,
 *    and CSS url() exists on disk (simulating 200 OK).
 * 3. Checks image optimization attributes (width, height, loading="lazy" for below-the-fold).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Forbidden legacy patterns
const FORBIDDEN_PATTERNS = [
  'ChatGPT Image',
  'ChatGPT%20Image',
  'Logo_1',
  'Logo_2',
  'Logo_3',
  'Image 01',
  'Image%2001',
  '03 (1)',
  '03%20%281%29',
  '04 (1)',
  '04%20%281%29',
  'Cart Logo',
  'Influencer Network Pic',
  'google Ads Video01',
  'google performance ads01',
  'social media_01',
  'social media_02',
  'social media_03',
  'social media_04',
  'social media_05',
  'Web Bg Curve 4k',
  'Website Bg Curve',
  'web page bg 4K',
  'Auram Jewellery assets'
];

console.log('=== Image Verification Suite ===\n');

// Scan all text files for forbidden patterns
function getAllFiles(dir, exts) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name.endsWith('.backup')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(full, exts));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.includes(ext) || entry.name === '_redirects' || entry.name === '_headers') {
        results.push(full);
      }
    }
  }
  return results;
}

const sourceFiles = getAllFiles(ROOT_DIR, ['.html', '.css', '.js', '.json', '.xml'])
  .filter(f => !f.includes('rename-images.js') && !f.includes('verify-images.js') && !f.includes('encode-image-srcs.js') && !f.includes('_redirects'));

let forbiddenFound = 0;
sourceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  FORBIDDEN_PATTERNS.forEach(pat => {
    if (content.includes(pat)) {
      console.log(`❌ Legacy pattern "${pat}" found in: ${path.relative(ROOT_DIR, file)}`);
      forbiddenFound++;
    }
  });
});

if (forbiddenFound === 0) {
  console.log('✅ Check 1 PASS: Zero legacy or generic image references in all HTML/CSS/JS files.');
} else {
  console.log(`❌ Check 1 FAIL: ${forbiddenFound} legacy references found.`);
}

// 2. Validate every referenced image exists on disk (200 check)
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html') && !f.includes('.backup'));
const missingImages = [];
const verifiedImages = new Set();
let totalImagesChecked = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Regex to extract src and srcset
  const srcRegex = /\b(?:src|srcset)=["']([^"']+)["']/g;
  let match;
  while ((match = srcRegex.exec(content)) !== null) {
    const rawVal = match[1];
    // Split srcset entries (comma separated with optional 1x/2x descriptor)
    const candidates = rawVal.split(',').map(s => s.trim().split(/\s+/)[0]);

    candidates.forEach(cand => {
      if (!cand || cand.startsWith('http://') || cand.startsWith('https://') || cand.startsWith('data:') || cand.startsWith('blob:')) {
        return; // External or data URI
      }

      // Check if image file extension
      if (/\.(webp|png|jpe?g|gif|svg|ico|mp4)$/i.test(cand)) {
        totalImagesChecked++;
        // Strip leading slash or URL encoding
        let cleanPath = decodeURIComponent(cand).replace(/^\//, '');
        const diskPath = path.join(ROOT_DIR, cleanPath);

        if (fs.existsSync(diskPath)) {
          verifiedImages.add(cleanPath);
        } else {
          missingImages.push({ file, reference: cand, expectedPath: cleanPath });
        }
      }
    });
  }

  // Also extract background-image: url(...)
  const cssUrlRegex = /url\(["']?([^"')]+)["']?\)/g;
  while ((match = cssUrlRegex.exec(content)) !== null) {
    const rawVal = match[1].trim();
    if (rawVal.startsWith('http://') || rawVal.startsWith('https://') || rawVal.startsWith('data:')) continue;
    if (/\.(webp|png|jpe?g|gif|svg|ico)$/i.test(rawVal)) {
      totalImagesChecked++;
      let cleanPath = decodeURIComponent(rawVal).replace(/^\//, '');
      const diskPath = path.join(ROOT_DIR, cleanPath);
      if (fs.existsSync(diskPath)) {
        verifiedImages.add(cleanPath);
      } else {
        missingImages.push({ file, reference: rawVal, expectedPath: cleanPath });
      }
    }
  }
});

console.log(`\nChecked ${totalImagesChecked} image occurrences (${verifiedImages.size} unique image files).`);

if (missingImages.length === 0) {
  console.log(`✅ Check 2 PASS: All ${verifiedImages.size} referenced local images exist on disk (100% 200 OK)!`);
} else {
  console.log(`❌ Check 2 FAIL: ${missingImages.length} referenced images missing on disk:`);
  missingImages.forEach(m => console.log(`   - In [${m.file}]: "${m.reference}" -> Expected at: ${m.expectedPath}`));
}

// 3. Check for width, height, and loading="lazy" in index.html client marquee
console.log('\n=== Check 3: index.html Marquee Optimization ===');
const indexContent = fs.readFileSync(indexPath = path.join(ROOT_DIR, 'index.html'), 'utf8');
const marqueeMatch = indexContent.match(/<div class="clients-marquee[\s\S]*?<\/section>/);

if (marqueeMatch) {
  const marqueeHtml = marqueeMatch[0];
  const imgTags = marqueeHtml.match(/<img\b[^>]*>/g) || [];
  let allHaveDims = true;
  let allHaveLazy = true;

  imgTags.forEach(tag => {
    if (!tag.includes('width=') || !tag.includes('height=')) allHaveDims = false;
    if (!tag.includes('loading="lazy"')) allHaveLazy = false;
  });

  console.log(`Total marquee images: ${imgTags.length}`);
  console.log(`All have width/height: ${allHaveDims ? '✅ Yes' : '❌ No'}`);
  console.log(`All have loading="lazy": ${allHaveLazy ? '✅ Yes' : '❌ No'}`);
}

const allPassed = forbiddenFound === 0 && missingImages.length === 0;
console.log(`\nOVERALL RESULT: ${allPassed ? 'PASS ✅' : 'FAIL ❌'}`);
process.exit(allPassed ? 0 : 1);
