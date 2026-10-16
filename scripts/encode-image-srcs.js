/**
 * encode-image-srcs.js
 * URL-encodes image src and srcset attributes containing spaces or parentheses.
 * Does NOT rename any files on disk.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const mappings = [
  { from: 'image_01.webp', to: 'image_01.webp' },
  { from: 'portfolio_pics/03_1.webp', to: 'portfolio_pics/03_1.webp' },
  { from: 'portfolio_pics/04_1.webp', to: 'portfolio_pics/04_1.webp' },
  { from: 'influencer_network_pic.webp', to: 'influencer_network_pic.webp' },
  { from: 'google_ads_video01.webp', to: 'google_ads_video01.webp' },
  { from: 'google_performance_ads01.webp', to: 'google_performance_ads01.webp' },
  { from: 'social_media_02.webp', to: 'social_media_02.webp' },
  { from: 'social_media_03.webp', to: 'social_media_03.webp' },
  { from: 'social_media_04.webp', to: 'social_media_04.webp' }
];

const chatGptImages = [
  'Logos/logo_simpliaxis.webp',
  'Logos/logo_fortis.webp',
  'Logos/logo_ovum.webp',
  'Logos/logo_mytatva.webp',
  'Logos/logo_herbalife.webp',
  'Logos/logo_anora.webp',
  'Logos/logo_the_mohraj.webp',
  'Logos/logo_the_tribe_concepts.webp',
  'Logos/logo_livspace.webp'
];

chatGptImages.forEach(img => {
  mappings.push({ from: img, to: img.replace(/ /g, '%20') });
});

const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

let totalEncoded = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  let fileReplacements = 0;

  mappings.forEach(m => {
    // Check in src="..."
    const srcBefore = `src="${m.from}"`;
    const srcAfter = `src="${m.to}"`;
    if (content.includes(srcBefore)) {
      const occurrences = content.split(srcBefore).length - 1;
      fileReplacements += occurrences;
      content = content.split(srcBefore).join(srcAfter);
      changed = true;
    }

    // Check in srcset="..."
    const srcsetBefore = `srcset="${m.from}"`;
    const srcsetAfter = `srcset="${m.to}"`;
    if (content.includes(srcsetBefore)) {
      const occurrences = content.split(srcsetBefore).length - 1;
      fileReplacements += occurrences;
      content = content.split(srcsetBefore).join(srcsetAfter);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[${file}] URL-encoded ${fileReplacements} image src/srcset attributes.`);
    totalEncoded += fileReplacements;
  }
});

console.log(`\nSuccessfully URL-encoded ${totalEncoded} total image references across HTML files.`);
