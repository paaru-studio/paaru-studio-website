#!/usr/bin/env python3
"""
Cloudinary Migration Tool - Using Official SDK
Uploads files to Cloudinary and generates replacement mappings
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from typing import Dict, List

# Install cloudinary SDK
try:
    import cloudinary
    from cloudinary.uploader import upload
except ImportError:
    print("Installing cloudinary SDK...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--quiet", "cloudinary"],
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    import cloudinary
    from cloudinary.uploader import upload

from dotenv import load_dotenv

class CloudinaryMigrator:
    """Handles Cloudinary file uploads using official SDK"""

    SUPPORTED_EXTENSIONS = {
        '.jpg', '.jpeg', '.png', '.gif', '.webp',
        '.mp4', '.webm', '.pdf'
    }

    EXCLUDE_DIRS = {
        'node_modules', '.git', 'legacy_site',
        '.next', 'dist', 'build', '.vscode', '.idea'
    }

    def __init__(self, dry_run: bool = False):
        load_dotenv()
        self.cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
        self.api_key = os.getenv('CLOUDINARY_API_KEY')
        self.api_secret = os.getenv('CLOUDINARY_API_SECRET')
        self.dry_run = dry_run
        self.upload_log: List[Dict] = []

        # Configure cloudinary
        cloudinary.config(
            cloud_name=self.cloud_name,
            api_key=self.api_key,
            api_secret=self.api_secret
        )

    def validate_config(self) -> bool:
        """Validate Cloudinary credentials"""
        if not all([self.cloud_name, self.api_key, self.api_secret]):
            print("❌ Cloudinary credentials not found!")
            return False
        print(f"✓ Cloud Name: {self.cloud_name}")
        print(f"✓ API Key: {self.api_key[:10]}...")
        return True

    def should_exclude(self, file_path: str) -> bool:
        """Check if file should be excluded"""
        parts = Path(file_path).parts
        return any(exclude in parts for exclude in self.EXCLUDE_DIRS)

    def find_files(self) -> List[str]:
        """Find all media files recursively"""
        files = []
        root_dir = Path.cwd()

        for item in root_dir.rglob('*'):
            if item.is_file():
                if item.suffix.lower() in self.SUPPORTED_EXTENSIONS:
                    if not self.should_exclude(str(item)):
                        files.append(str(item))

        return sorted(set(files))

    def upload_file(self, file_path: str) -> Dict:
        """Upload a single file to Cloudinary"""
        file_name = os.path.basename(file_path)
        relative_path = os.path.relpath(file_path, os.getcwd())

        print(f"📤 Uploading: {relative_path}")

        if self.dry_run:
            print(f"   [DRY RUN] Would upload: {file_name}")
            return {
                'local_path': relative_path,
                'file_name': file_name,
                'status': 'dry_run',
            }

        try:
            result = upload(
                file_path,
                folder='paaru-studio',
                public_id=os.path.splitext(file_name)[0],
                tags=['paaru-studio', 'migration'],
                overwrite=True
            )

            cloudinary_url = result.get('secure_url')
            public_id = result.get('public_id')

            print(f"   ✓ Success: {cloudinary_url}")

            return {
                'local_path': relative_path,
                'file_name': file_name,
                'cloudinary_url': cloudinary_url,
                'cloudinary_public_id': public_id,
                'status': 'success',
            }

        except Exception as e:
            print(f"   ✗ Error: {str(e)}")
            return {
                'local_path': relative_path,
                'file_name': file_name,
                'status': 'error',
                'error': str(e),
            }

    def migrate(self):
        """Execute the migration"""
        print("\n🚀 Starting Cloudinary Migration\n")

        if not self.validate_config():
            sys.exit(1)

        if self.dry_run:
            print("\n⚠️  DRY RUN MODE - No files will be uploaded\n")

        files = self.find_files()
        print(f"\nFound {len(files)} files to migrate\n")

        if not files:
            print("No files found to upload.")
            return

        for i, file_path in enumerate(files, 1):
            result = self.upload_file(file_path)
            self.upload_log.append(result)
            print(f"   [{i}/{len(files)}]")

        # Save upload log
        log_path = 'cloudinary-upload-log.json'
        with open(log_path, 'w') as f:
            json.dump(self.upload_log, f, indent=2)

        print(f"\n✅ Migration complete!")
        print(f"📄 Log saved to: {log_path}\n")

        # Summary
        successful = len([item for item in self.upload_log if item['status'] == 'success'])
        failed = len([item for item in self.upload_log if item['status'] == 'error'])
        dry_run = len([item for item in self.upload_log if item['status'] == 'dry_run'])

        print(f"📊 Summary:")
        print(f"   ✓ Successful: {successful}")
        print(f"   ✗ Failed: {failed}")
        if dry_run > 0:
            print(f"   ⚠️  Dry Run: {dry_run}")


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Migrate files to Cloudinary CDN')
    parser.add_argument('--dry-run', action='store_true', help='Run in dry-run mode')
    args = parser.parse_args()

    migrator = CloudinaryMigrator(dry_run=args.dry_run)
    migrator.migrate()


if __name__ == '__main__':
    main()
