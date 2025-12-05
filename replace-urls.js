#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const UPLOAD_LOG = 'cloudinary-upload-log.json';

// List of file extensions to search in
const SEARCH_EXTENSIONS = ['.html', '.css', '.js', '.md'];

function loadUploadLog() {
  try {
    const logContent = fs.readFileSync(UPLOAD_LOG, 'utf-8');
    return JSON.parse(logContent);
  } catch (error) {
    console.error(chalk.red(`❌ Error reading upload log: ${error.message}`));
    process.exit(1);
  }
}

function createReplacementMap(uploadLog) {
  const map = new Map();

  uploadLog.forEach((item) => {
    if (item.status === 'success' && item.cloudinary_url) {
      // Map both relative and absolute paths
      const fileName = item.file_name;
      map.set(fileName, item.cloudinary_url);
    }
  });

  return map;
}

function replaceUrlsInFile(filePath, replacementMap) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    replacementMap.forEach((cloudinaryUrl, fileName) => {
      // Create regex patterns to match various ways the file might be referenced
      const patterns = [
        new RegExp(`["']([^"']*\\/)?(${fileName.replace(/\./g, '\\.')})["']`, 'g'),
        new RegExp(`src=["']([^"']*\\/)?(${fileName.replace(/\./g, '\\.')})["']`, 'g'),
        new RegExp(`href=["']([^"']*\\/)?(${fileName.replace(/\./g, '\\.')})["']`, 'g'),
        new RegExp(`url\\(["']?([^"']*\\/)?(${fileName.replace(/\./g, '\\.')})["']?\\)`, 'g'),
      ];

      patterns.forEach((pattern) => {
        if (pattern.test(content)) {
          content = content.replace(pattern, `"${cloudinaryUrl}"`);
          modified = true;
          console.log(chalk.green(`   ✓ Replaced: ${fileName}`));
        }
      });
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(chalk.blue(`📝 Updated: ${filePath}`));
      return true;
    }
    return false;
  } catch (error) {
    console.error(chalk.red(`   ✗ Error processing ${filePath}: ${error.message}`));
    return false;
  }
}

function findAndReplaceUrls() {
  console.log(chalk.bold.cyan('🔗 Starting URL Replacement\n'));

  // Load upload log
  const uploadLog = loadUploadLog();
  const replacementMap = createReplacementMap(uploadLog);

  if (replacementMap.size === 0) {
    console.warn(chalk.yellow('⚠️  No successful uploads found in log'));
    return;
  }

  console.log(chalk.bold(`Found ${replacementMap.size} files to replace URLs for\n`));

  // Find all HTML, CSS, and JS files
  const filesToProcess = [];
  const searchDir = process.cwd();

  SEARCH_EXTENSIONS.forEach((ext) => {
    const glob = require('glob');
    const files = glob.sync(path.join(searchDir, `**/*${ext}`), {
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/legacy_site/**',
        '**/paaru-studio-website/**',
      ],
    });
    filesToProcess.push(...files);
  });

  console.log(chalk.bold(`Scanning ${filesToProcess.length} files for URL replacements\n`));

  let replacementCount = 0;
  filesToProcess.forEach((file) => {
    if (replaceUrlsInFile(file, replacementMap)) {
      replacementCount++;
    }
  });

  console.log(chalk.bold.green(`\n✅ URL replacement complete!`));
  console.log(chalk.bold(`📊 Summary:`));
  console.log(chalk.green(`   ✓ Files updated: ${replacementCount}`));
}

// Run URL replacement
findAndReplaceUrls();
