#!/usr/bin/env python3
"""
Aggressive reupload script:
1. Compress large images (iteratively reduce quality/scale aggressively)
2. Fix filenames with trailing whitespace
3. Reupload videos with resource_type='video'
4. Update cloudinary-upload-log.json
5. Re-run replacements
"""

import json
import subprocess
import sys
import os
from pathlib import Path

# Auto-install dependencies
required_packages = ['cloudinary', 'python-dotenv', 'Pillow', 'requests']
for pkg in required_packages:
    try:
        __import__(pkg.replace('-', '_'))
    except ImportError:
        print(f"[AUTO-INSTALL] Installing {pkg}...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', pkg, '-q'], check=False)

import cloudinary
from cloudinary.uploader import upload
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()

CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '').strip()
API_KEY = os.environ.get('CLOUDINARY_API_KEY', '').strip()
API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '').strip()

if not all([CLOUD_NAME, API_KEY, API_SECRET]):
    print("ERROR: Missing Cloudinary credentials in .env")
    sys.exit(1)

cloudinary.config(cloud_name=CLOUD_NAME, api_key=API_KEY, api_secret=API_SECRET)

LOG_FILE = Path('cloudinary-upload-log.json')

def load_log():
    if LOG_FILE.exists():
        return json.load(LOG_FILE.open())
    return []

def save_log(log):
    LOG_FILE.write_text(json.dumps(log, indent=2))

def compress_image(file_path, max_size_mb=10):
    """Iteratively compress image: reduce quality and scale until <= max_size_mb."""
    max_bytes = max_size_mb * 1024 * 1024
    img = Image.open(file_path)
    
    # Start with quality 85 and scale 100%
    quality = 85
    scale = 100
    
    for attempt in range(10):  # Max 10 attempts
        buffer = io.BytesIO()
        
        # Apply scale if needed
        if scale < 100:
            w, h = img.size
            new_w = int(w * scale / 100)
            new_h = int(h * scale / 100)
            scaled_img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        else:
            scaled_img = img
        
        # Save with reduced quality
        scaled_img.save(buffer, format='JPEG' if file_path.suffix.lower() in ['.jpg', '.jpeg'] else 'PNG', 
                        quality=quality, optimize=True)
        size = buffer.tell()
        
        if size <= max_bytes:
            print(f"  ✓ Compressed to {size / 1024 / 1024:.2f}MB (quality={quality}, scale={scale}%)")
            return buffer.getvalue()
        
        # Reduce aggressively
        quality = max(30, quality - 10)
        scale = max(50, scale - 10)
    
    print(f"  ✗ Could not compress below {max_bytes / 1024 / 1024:.1f}MB after 10 attempts")
    return None

def fix_and_upload_file(file_path, file_name, is_video=False):
    """Upload file with aggressive compression for images or video settings for MP4s."""
    try:
        # Clean filename: remove trailing/leading whitespace
        clean_name = file_name.strip()
        
        # For MP4/video, upload with resource_type='video'
        if is_video or file_path.suffix.lower() in ['.mp4', '.mov', '.avi']:
            print(f"  [VIDEO] Uploading {clean_name} with resource_type='video'...")
            result = upload(
                str(file_path),
                folder='paaru-studio',
                public_id=Path(clean_name).stem,
                overwrite=True,
                resource_type='video',
                timeout=300
            )
            return result
        
        # For images, check size and compress if needed
        file_size_mb = file_path.stat().st_size / 1024 / 1024
        if file_size_mb > 10:
            print(f"  [COMPRESS] {clean_name} is {file_size_mb:.2f}MB, compressing...")
            compressed_data = compress_image(file_path, max_size_mb=10)
            if not compressed_data:
                return None
            
            # Write compressed temp file
            temp_path = Path(f".tmp_{clean_name}")
            temp_path.write_bytes(compressed_data)
            
            result = upload(
                str(temp_path),
                folder='paaru-studio',
                public_id=Path(clean_name).stem,
                overwrite=True
            )
            
            temp_path.unlink()
            return result
        
        # Normal upload
        print(f"  [UPLOAD] Uploading {clean_name}...")
        result = upload(
            str(file_path),
            folder='paaru-studio',
            public_id=Path(clean_name).stem,
            overwrite=True
        )
        return result
        
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        return None

def main():
    print("[AGGRESSIVE REUPLOAD] Starting...")
    log = load_log()
    
    if not log:
        print("ERROR: No upload log found")
        return
    
    # Find failed/errored items
    failed_items = [item for item in log if item.get('status') in ['error', 'skipped']]
    print(f"Found {len(failed_items)} failed/skipped items to reprocess\n")
    
    reupload_count = 0
    for item in failed_items:
        file_name = item.get('file_name') or item.get('local_path', '')
        local_path = Path(item.get('local_path', ''))
        
        if not local_path.exists():
            print(f"✗ File not found: {local_path}")
            continue
        
        is_video = local_path.suffix.lower() in ['.mp4', '.mov', '.avi']
        print(f"\n[{reupload_count + 1}] {file_name} ({local_path.stat().st_size / 1024 / 1024:.2f}MB)")
        
        result = fix_and_upload_file(local_path, file_name, is_video=is_video)
        
        if result and result.get('public_id'):
            cloudinary_url = result.get('secure_url')
            item['status'] = 'success'
            item['cloudinary_url'] = cloudinary_url
            item['cloudinary_public_id'] = result.get('public_id')
            item['error'] = None
            print(f"  ✓ Success: {cloudinary_url}")
            reupload_count += 1
        else:
            item['status'] = 'error'
            item['error'] = 'Reupload failed'
            print(f"  ✗ Reupload failed")
    
    print(f"\n[SAVE] Updated upload log with {reupload_count} successful reupload(s)")
    save_log(log)
    
    # Re-run replacements
    print("\n[REPLACE] Re-running URL replacements...")
    result = subprocess.run([sys.executable, 'replace_urls.py'], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)

if __name__ == '__main__':
    main()
