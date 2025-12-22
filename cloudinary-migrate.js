#!/usr/bin/env node

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DRY_RUN = process.env.DRY_RUN === 'true';
const UPLOAD_DIR = path.join(__dirname);
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.pdf'];

// Log file for tracking uploads
const uploadLog = [];

async function uploadFile(filePath) {
  try {
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath).toLowerCase();
    const relativePath = path.relative(UPLOAD_DIR, filePath);

    console.log(chalk.blue(`📤 Processing: ${relativePath}`));

    if (DRY_RUN) {
      console.log(chalk.yellow(`   [DRY RUN] Would upload: ${fileName}`));
      return {
        local_path: relativePath,
        file_name: fileName,
        status: 'dry_run',
      };
    }

    // Determine resource type
    let resourceType = 'image';
    if (['.mp4', '.webm'].includes(fileExt)) {
      resourceType = 'video';
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'paaru-studio',
      public_id: fileName.replace(/\.[^/.]+$/, ''),
      resource_type: resourceType,
      overwrite: true,
      tags: ['paaru-studio', 'migration'],
    });

    console.log(chalk.green(`   ✓ Uploaded: ${fileName}`));
    console.log(chalk.gray(`   → URL: ${result.secure_url}`));

    return {
      local_path: relativePath,
      file_name: fileName,
      cloudinary_url: result.secure_url,
      cloudinary_public_id: result.public_id,
      status: 'success',
    };
  } catch (error) {
    console.error(chalk.red(`   ✗ Error uploading ${filePath}: ${error.message}`));
    return {
      local_path: filePath,
      file_name: path.basename(filePath),
      status: 'error',
      error: error.message,
    };
  }
}

async function findAndUploadFiles() {
  console.log(chalk.bold.cyan('🚀 Starting Cloudinary Migration\n'));

  // Validate configuration
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.error(
      chalk.red('❌ Cloudinary credentials not found. Please create .env file with credentials.')
    );
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log(chalk.yellow('⚠️  DRY RUN MODE - No files will be uploaded\n'));
  }

  // Find all supported files
  const patterns = SUPPORTED_EXTENSIONS.map((ext) => `**/*${ext}`);
  let files = [];

  for (const pattern of patterns) {
    const foundFiles = glob.sync(path.join(UPLOAD_DIR, pattern), {
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/legacy_site/**',
        '**/paaru-studio-website/**',
        '**/public/**',
        '**/src/**',
      ],
    });
    files = files.concat(foundFiles);
  }

  console.log(chalk.bold(`Found ${files.length} files to upload\n`));

  // Upload files
  for (const file of files) {
    const result = await uploadFile(file);
    uploadLog.push(result);
    // Add small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Save upload log
  const logPath = path.join(UPLOAD_DIR, 'cloudinary-upload-log.json');
  fs.writeFileSync(logPath, JSON.stringify(uploadLog, null, 2));

  console.log(
    chalk.bold.green(
      `\n✅ Migration complete! Upload log saved to: cloudinary-upload-log.json`
    )
  );

  // Summary
  const successful = uploadLog.filter((item) => item.status === 'success').length;
  const failed = uploadLog.filter((item) => item.status === 'error').length;
  const dryRun = uploadLog.filter((item) => item.status === 'dry_run').length;

  console.log(chalk.bold('\n📊 Summary:'));
  console.log(chalk.green(`   ✓ Successful: ${successful}`));
  console.log(chalk.red(`   ✗ Failed: ${failed}`));
  if (dryRun > 0) {
    console.log(chalk.yellow(`   ⚠️  Dry Run: ${dryRun}`));
  }
}

// Run migration
findAndUploadFiles().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
