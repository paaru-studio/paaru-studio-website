/**
 * encode-image-srcs.js
 * URL-encodes image src and srcset attributes containing spaces or parentheses.
 * Does NOT rename any files on disk.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const mappings = [
  { from: 'Image 01.webp', to: 'Image%2001.webp' },
  { from: 'portfolio_pics/03 (1).webp', to: 'portfolio_pics/03%20%281%29.webp' },
  { from: 'portfolio_pics/04 (1).webp', to: 'portfolio_pics/04%20%281%29.webp' },
  { from: 'Influencer Network Pic.webp', to: 'Influencer%20Network%20Pic.webp' },
  { from: 'google Ads Video01.webp', to: 'google%20Ads%20Video01.webp' },
  { from: 'google performance ads01.webp', to: 'google%20performance%20ads01.webp' },
  { from: 'social media_02.webp', to: 'social%20media_02.webp' },
  { from: 'social media_03.webp', to: 'social%20media_03.webp' },
  { from: 'social media_04.webp', to: 'social%20media_04.webp' }
];

const chatGptImages = [
  'Logos/ChatGPT Image Aug 21, 2025 at 01_00_18 PM.webp',
  'Logos/ChatGPT Image Aug 21, 2025 at 01_51_46 PM.webp',
  'Logos/ChatGPT Image Aug 21, 2025 at 02_14_37 PM.webp',
  'Logos/ChatGPT Image Aug 21, 2025 at 12_46_51 PM.webp',
  'Logos/ChatGPT Image Aug 21, 2025 at 12_52_24 PM.webp',
  'Logos/ChatGPT Image Aug 22, 2025 at 01_00_39 PM.webp',
  'Logos/ChatGPT Image Aug 22, 2025 at 12_55_36 PM.webp',
  'Logos/ChatGPT Image Aug 22, 2025 at 12_57_54 PM.webp',
  'Logos/ChatGPT Image Aug 26, 2025 at 11_29_17 AM.webp'
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
