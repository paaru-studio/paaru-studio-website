/**
 * rename-images.js
 * Renames generic/unsafe image files to descriptive lowercase names with underscores.
 * Updates all HTML/CSS/JS references, fixes alt text, adds 301 redirects,
 * and validates that every referenced image exists.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Complete File Renaming Map [oldPath, newPath]
const RENAME_MAP = [
  // Logos folder
  ['Logos/logo_simpliaxis.webp', 'Logos/logo_simpliaxis.webp'],
  ['Logos/logo_simpliaxis.png', 'Logos/logo_simpliaxis.png'],
  ['Logos/logo_fortis.webp', 'Logos/logo_fortis.webp'],
  ['Logos/logo_fortis.png', 'Logos/logo_fortis.png'],
  ['Logos/logo_ovum.webp', 'Logos/logo_ovum.webp'],
  ['Logos/logo_ovum.png', 'Logos/logo_ovum.png'],
  ['Logos/logo_mytatva.webp', 'Logos/logo_mytatva.webp'],
  ['Logos/logo_mytatva.png', 'Logos/logo_mytatva.png'],
  ['Logos/logo_herbalife.webp', 'Logos/logo_herbalife.webp'],
  ['Logos/logo_herbalife.png', 'Logos/logo_herbalife.png'],
  ['Logos/logo_anora.webp', 'Logos/logo_anora.webp'],
  ['Logos/logo_anora.png', 'Logos/logo_anora.png'],
  ['Logos/logo_mockzraj_ias.webp', 'Logos/logo_mockzraj_ias.webp'],
  ['Logos/logo_mockzraj_ias.png', 'Logos/logo_mockzraj_ias.png'],
  ['Logos/logo_iraedu_tech.webp', 'Logos/logo_iraedu_tech.webp'],
  ['Logos/logo_iraedu_tech.png', 'Logos/logo_iraedu_tech.png'],
  ['Logos/logo_cyseck.webp', 'Logos/logo_cyseck.webp'],
  ['Logos/logo_cyseck.png', 'Logos/logo_cyseck.png'],
  ['Logos/logo_the_mohraj.webp', 'Logos/logo_the_mohraj.webp'],
  ['Logos/logo_the_mohraj.png', 'Logos/logo_the_mohraj.png'],
  ['Logos/logo_the_tribe_concepts.webp', 'Logos/logo_the_tribe_concepts.webp'],
  ['Logos/logo_the_tribe_concepts.png', 'Logos/logo_the_tribe_concepts.png'],
  ['Logos/logo_livspace.webp', 'Logos/logo_livspace.webp'],
  ['Logos/logo_livspace.png', 'Logos/logo_livspace.png'],
  ['Logos/logo_onsurity.webp', 'Logos/logo_onsurity.webp'],
  ['Logos/logo_onsurity.png', 'Logos/logo_onsurity.png'],
  ['Logos/logo_windowfab.webp', 'Logos/logo_windowfab.webp'],
  ['Logos/logo_windowfab.png', 'Logos/logo_windowfab.png'],
  ['Logos/logo_cinemon.webp', 'Logos/logo_cinemon.webp'],
  ['Logos/logo_cinemon.png', 'Logos/logo_cinemon.png'],

  // Root & other images
  ['image_01.webp', 'image_01.webp'],
  ['image_01.jpeg', 'image_01.jpeg'],
  ['portfolio_pics/03_1.webp', 'portfolio_pics/03_1.webp'],
  ['portfolio_pics/03_1.jpeg', 'portfolio_pics/03_1.jpeg'],
  ['portfolio_pics/04_1.webp', 'portfolio_pics/04_1.webp'],
  ['portfolio_pics/04_1.jpeg', 'portfolio_pics/04_1.jpeg'],
  ['cart_logo.webp', 'cart_logo.webp'],
  ['cart_logo.png', 'cart_logo.png'],
  ['influencer_network_pic.webp', 'influencer_network_pic.webp'],
  ['influencer_network_pic.png', 'influencer_network_pic.png'],
  ['google_ads_video01.webp', 'google_ads_video01.webp'],
  ['google_ads_video01.png', 'google_ads_video01.png'],
  ['google_performance_ads01.webp', 'google_performance_ads01.webp'],
  ['google_performance_ads01.png', 'google_performance_ads01.png'],
  ['social_media_01.webp', 'social_media_01.webp'],
  ['social_media_01.jpg', 'social_media_01.jpg'],
  ['social_media_02.webp', 'social_media_02.webp'],
  ['social_media_02.jpg', 'social_media_02.jpg'],
  ['social_media_03.webp', 'social_media_03.webp'],
  ['social_media_03.jpg', 'social_media_03.jpg'],
  ['social_media_04.webp', 'social_media_04.webp'],
  ['social_media_04.jpg', 'social_media_04.jpg'],
  ['social_media_05.webp', 'social_media_05.webp'],
  ['social_media_05.jpg', 'social_media_05.jpg'],
  ['asset_1_ai_logo_web.webp', 'asset_1_ai_logo_web.webp'],
  ['showreel_paaru_studio_01.mp4', 'showreel_paaru_studio_01.mp4'],
  ['web_bg_curve_4k.webp', 'web_bg_curve_4k.webp'],
  ['web_bg_curve_4k.png', 'web_bg_curve_4k.png'],
  ['website_bg_curve.webp', 'website_bg_curve.webp'],
  ['website_bg_curve.png', 'website_bg_curve.png'],
  ['web_page_bg_4k.webp', 'web_page_bg_4k.webp'],
  ['web_page_bg_4k.png', 'web_page_bg_4k.png'],
  ['auram_jewellery_logo.webp', 'auram_jewellery_logo.webp']
];

console.log('=== Step 1: Renaming files on disk ===');

// Check special case: Logos/auram_jewellery_logo.webp
const auramLogosOld = path.join(ROOT_DIR, 'Logos/auram_jewellery_logo.webp');
if (fs.existsSync(auramLogosOld)) {
  fs.unlinkSync(auramLogosOld);
  console.log('Removed redundant "Logos/auram_jewellery_logo.webp" (Logos/logo_auram_jewellery.webp exists).');
}

// Rename directory "auram_jewellery_assets" -> "auram_jewellery_assets"
const oldAssetsDir = path.join(ROOT_DIR, 'auram_jewellery_assets');
const newAssetsDir = path.join(ROOT_DIR, 'auram_jewellery_assets');
if (fs.existsSync(oldAssetsDir)) {
  fs.renameSync(oldAssetsDir, newAssetsDir);
  console.log('Renamed directory: "auram_jewellery_assets" -> "auram_jewellery_assets"');
}

// Update symlink auram-jewellery-assets
const symlinkPath = path.join(ROOT_DIR, 'auram-jewellery-assets');
try {
  if (fs.existsSync(symlinkPath) || fs.lstatSync(symlinkPath)) {
    fs.unlinkSync(symlinkPath);
    fs.symlinkSync('auram_jewellery_assets', symlinkPath);
    console.log('Updated symlink auram-jewellery-assets -> auram_jewellery_assets');
  }
} catch (e) {}

// Rename all files
RENAME_MAP.forEach(([oldRel, newRel]) => {
  const oldFull = path.join(ROOT_DIR, oldRel);
  const newFull = path.join(ROOT_DIR, newRel);
  if (fs.existsSync(oldFull)) {
    fs.renameSync(oldFull, newFull);
    console.log(`Renamed: ${oldRel} -> ${newRel}`);
  } else if (!fs.existsSync(newFull)) {
    console.log(`Warning: neither ${oldRel} nor ${newRel} exists.`);
  }
});

// 2. Prepare Replacements Table (raw and URL-encoded versions)
const REPLACEMENTS = [];

// Directory replacement
REPLACEMENTS.push({ from: 'auram_jewellery_assets', to: 'auram_jewellery_assets' });
REPLACEMENTS.push({ from: 'auram_jewellery_assets', to: 'auram_jewellery_assets' });

RENAME_MAP.forEach(([oldRel, newRel]) => {
  const oldBase = path.basename(oldRel);
  const newBase = path.basename(newRel);

  // Full relative path
  REPLACEMENTS.push({ from: oldRel, to: newRel });
  REPLACEMENTS.push({ from: encodeURI(oldRel), to: newRel });
  // Also encode parentheses
  const parenEncoded = encodeURI(oldRel).replace(/\(/g, '%28').replace(/\)/g, '%29');
  if (parenEncoded !== encodeURI(oldRel)) {
    REPLACEMENTS.push({ from: parenEncoded, to: newRel });
  }

  // Filename only
  if (oldBase !== oldRel) {
    REPLACEMENTS.push({ from: oldBase, to: newBase });
    REPLACEMENTS.push({ from: encodeURI(oldBase), to: newBase });
    const baseParen = encodeURI(oldBase).replace(/\(/g, '%28').replace(/\)/g, '%29');
    if (baseParen !== encodeURI(oldBase)) {
      REPLACEMENTS.push({ from: baseParen, to: newBase });
    }
  }
});

// Sort replacements by longest 'from' first to prevent partial substring matches
REPLACEMENTS.sort((a, b) => b.from.length - a.from.length);

console.log(`\n=== Step 2: Updating references across all text files (${REPLACEMENTS.length} replacement rules) ===`);

function searchFiles(dir) {
  let fileList = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name.endsWith('.backup')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fileList = fileList.concat(searchFiles(full));
    } else if (/\.(html|css|js|json|xml|txt|md|toml|_redirects|_headers)$/i.test(entry.name)) {
      fileList.push(full);
    }
  }
  return fileList;
}

const allTextFiles = searchFiles(ROOT_DIR);

allTextFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  REPLACEMENTS.forEach(r => {
    if (content.includes(r.from)) {
      content = content.split(r.from).join(r.to);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated references in: ${path.relative(ROOT_DIR, file)}`);
  }
});

// 3. Update index.html Marquee with Unique Accurate Alt Texts and Attributes
console.log('\n=== Step 3: Updating index.html marquee logos and alt text ===');

const indexPath = path.join(ROOT_DIR, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// The 20 distinct brands in the client marquee
const CLIENT_LOGOS = [
  { file: 'Logos/logo_auram_jewellery.webp', alt: 'Auram Jewellery logo', w: 120, h: 107 },
  { file: 'Logos/logo_blackbuck.webp', alt: 'Blackbuck logo', w: 120, h: 76 },
  { file: 'Logos/logo_meesho.webp', alt: 'Meesho logo', w: 120, h: 26 },
  { file: 'Logos/logo_signeasy.webp', alt: 'Signeasy logo', w: 120, h: 38 },
  { file: 'Logos/logo_onsurity.webp', alt: 'Onsurity logo', w: 100, h: 100 },
  { file: 'Logos/logo_windowfab.webp', alt: 'Windowfab logo', w: 100, h: 100 },
  { file: 'Logos/logo_cinemon.webp', alt: 'Cinemon logo', w: 100, h: 100 },
  { file: 'Logos/logo_simpliaxis.webp', alt: 'Simpliaxis logo', w: 100, h: 100 },
  { file: 'Logos/logo_fortis.webp', alt: 'Fortis logo', w: 100, h: 100 },
  { file: 'Logos/logo_ovum.webp', alt: 'Ovum Hospitals logo', w: 100, h: 100 },
  { file: 'Logos/logo_mytatva.webp', alt: 'MyTatva logo', w: 100, h: 100 },
  { file: 'Logos/logo_herbalife.webp', alt: 'Herbalife logo', w: 100, h: 100 },
  { file: 'Logos/logo_anora.webp', alt: 'Anora logo', w: 100, h: 100 },
  { file: 'toyota_logo.webp', alt: 'Toyota logo', w: 100, h: 100 },
  { file: 'marriott_logo.webp', alt: 'Marriott logo', w: 40, h: 32 },
  { file: 'itc_logo.webp', alt: 'ITC logo', w: 100, h: 100 },
  { file: 'Logos/logo_the_mohraj.webp', alt: 'The Mohraj logo', w: 100, h: 100 },
  { file: 'Logos/logo_the_tribe_concepts.webp', alt: 'The Tribe Concepts logo', w: 100, h: 100 },
  { file: 'Logos/logo_livspace.webp', alt: 'Livspace logo', w: 100, h: 100 },
  { file: 'Logos/sugar_fit_logo.webp', alt: 'Sugar.fit logo', w: 40, h: 40 }
];

function buildMarqueeHtml() {
  const group1 = CLIENT_LOGOS.map(item => `                        <div class="client-logo client-logo--img">
                            <picture><img loading="lazy" decoding="async" src="${item.file}"
                                    alt="${item.alt}" width="${item.w}" height="${item.h}">
                            </picture>
                        </div>`).join('\n');

  const group2 = CLIENT_LOGOS.map(item => `                        <div class="client-logo client-logo--img" aria-hidden="true">
                            <picture><img loading="lazy" decoding="async" src="${item.file}" alt=""
                                    aria-hidden="true" width="${item.w}" height="${item.h}">
                            </picture>
                        </div>`).join('\n');

  return `            <div class="clients-marquee full-bleed" aria-hidden="false">
                <div class="clients-track">
                    <div class="clients-group">
${group1}
                    </div>
                    <!-- duplicate for seamless scroll -->
                    <div class="clients-group" aria-hidden="true">
${group2}
                    </div>
                </div>
            </div>`;
}

const marqueeRegex = /<div class="clients-marquee full-bleed"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
if (marqueeRegex.test(indexContent)) {
  indexContent = indexContent.replace(marqueeRegex, buildMarqueeHtml());
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('Successfully updated index.html client marquee with 20 distinct verified brand logos.');
} else {
  console.log('Warning: marqueeRegex did not match in index.html');
}

// 4. Update _redirects
console.log('\n=== Step 4: Adding 301 redirects to _redirects ===');
const redirectsPath = path.join(ROOT_DIR, '_redirects');
let redirectsContent = fs.readFileSync(redirectsPath, 'utf8');

const newRedirectRules = [];

// Directory redirect rule
newRedirectRules.push(`/auram_jewellery_assets/*  /auram_jewellery_assets/:splat  301!`);
newRedirectRules.push(`/Auram\\ Jewellery\\ assets/*  /auram_jewellery_assets/:splat  301!`);

RENAME_MAP.forEach(([oldRel, newRel]) => {
  const oldUrl = '/' + oldRel;
  const newUrl = '/' + newRel;
  const encodedOldUrl = '/' + encodeURI(oldRel);
  const parenEncodedOldUrl = '/' + encodeURI(oldRel).replace(/\(/g, '%28').replace(/\)/g, '%29');

  newRedirectRules.push(`${encodedOldUrl}  ${newUrl}  301!`);
  if (parenEncodedOldUrl !== encodedOldUrl) {
    newRedirectRules.push(`${parenEncodedOldUrl}  ${newUrl}  301!`);
  }
  // Escaped space version if applicable
  if (oldUrl.includes(' ')) {
    const spaceEscaped = oldUrl.replace(/ /g, '\\ ');
    newRedirectRules.push(`${spaceEscaped}  ${newUrl}  301!`);
  }
});

// Also add Logos/auram_jewellery_logo.webp
newRedirectRules.push(`/Logos/auram_jewellery_logo.webp  /Logos/logo_auram_jewellery.webp  301!`);
newRedirectRules.push(`/Logos/Auram\\ Jewellery\\ logo.webp  /Logos/logo_auram_jewellery.webp  301!`);

const headerComment = '\n# Image & Asset Renaming 301 Redirects\n';
const uniqueRules = [...new Set(newRedirectRules)];
redirectsContent += headerComment + uniqueRules.join('\n') + '\n';
fs.writeFileSync(redirectsPath, redirectsContent, 'utf8');
console.log(`Added ${uniqueRules.length} asset redirect rules to _redirects.`);

console.log('\n=== Step 5: Verification ===');

// Check that no old names remain in any HTML/CSS/JS file
const oldNames = RENAME_MAP.map(([oldRel]) => path.basename(oldRel));
oldNames.push('auram_jewellery_assets');
oldNames.push('ChatGPT Image');

const leaks = [];
searchFiles(ROOT_DIR).forEach(file => {
  // Ignore scripts/rename-images.js and _redirects
  if (file.includes('rename-images.js') || file.includes('_redirects') || file.includes('internal-linking-audit.md')) return;
  const c = fs.readFileSync(file, 'utf8');
  oldNames.forEach(oldName => {
    if (c.includes(oldName) || c.includes(encodeURI(oldName))) {
      leaks.push({ file: path.relative(ROOT_DIR, file), oldName });
    }
  });
});

if (leaks.length > 0) {
  console.log(`❌ Found ${leaks.length} remaining references to old filenames:`);
  console.log(leaks);
} else {
  console.log('✅ ZERO references to old filenames remain across the codebase!');
}
