# Cloudinary Migration Guide

This guide walks you through setting up and running the automated Cloudinary migration for your Paaru Studio website.

## Prerequisites

- Node.js 14+ installed
- Cloudinary account (free tier available at https://cloudinary.com)
- npm package manager

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Cloudinary Credentials

1. Sign up at https://cloudinary.com (free tier available)
2. Go to your Dashboard
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Cloudinary credentials:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   DRY_RUN=false
   ```

## Usage

### Option 1: Dry Run (Recommended First Step)

Test without actually uploading:

```bash
DRY_RUN=true npm run migrate
```

### Option 2: Upload Files to Cloudinary

```bash
npm run migrate
```

This will:
- Find all images (jpg, jpeg, png, gif, webp) and videos (mp4, webm)
- Upload them to Cloudinary in the `paaru-studio` folder
- Create a `cloudinary-upload-log.json` file with mappings

### Option 3: Replace URLs in Your Code

After uploading, replace all local file references with Cloudinary URLs:

```bash
npm run replace-urls
```

This will update all `.html`, `.css`, and `.js` files with new URLs.

### Option 4: Full Migration (Upload + Replace)

```bash
npm run full-migration
```

This runs both upload and URL replacement in sequence.

## What Gets Uploaded

The migration automatically uploads:
- **Images**: jpg, jpeg, png, gif, webp
- **Videos**: mp4, webm
- **Documents**: pdf

**Excluded Directories**:
- `node_modules/`
- `.git/`
- `legacy_site/`
- `paaru-studio-website/`
- `public/`
- `src/`

## Output Files

- **cloudinary-upload-log.json**: Contains mapping of local files to Cloudinary URLs
- Modified HTML/CSS/JS files with new Cloudinary URLs

## Benefits

✅ Reduce Netlify bandwidth usage  
✅ Faster content delivery with CDN  
✅ Automatic image optimization  
✅ Easy rollback with upload log  

## Troubleshooting

### "Cloudinary credentials not found"
Make sure your `.env` file exists and has valid credentials.

### "Upload failed"
Check your API key and secret are correct. Verify your Cloudinary account is active.

### URLs not replacing
Run `npm run migrate` first to generate the upload log.

## Rollback

If you need to revert, simply use git:

```bash
git checkout -- .
```

The upload log is saved in `cloudinary-upload-log.json` for reference.

## Support

For Cloudinary API documentation, visit: https://cloudinary.com/documentation
