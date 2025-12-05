#!/usr/bin/env python3
"""
Fix and re-upload skipped/failed Cloudinary uploads:
- Resize/compress large images to fit <=10MB
- Rename (trim) filenames with trailing whitespace
- Upload videos with resource_type='video'
- Update `cloudinary-upload-log.json` with new results
- Re-run replacements after uploads
"""
import os
import sys
import json
import shutil
import subprocess
from pathlib import Path
from typing import List

# Install required packages
subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--quiet', 'cloudinary', 'Pillow'])

import cloudinary
from cloudinary.uploader import upload
from dotenv import load_dotenv
from PIL import Image

load_dotenv()
ROOT = Path.cwd()
LOG_FILE = ROOT / 'cloudinary-upload-log.json'
MAX_BYTES = 10 * 1024 * 1024  # 10MB
TMP_DIR = ROOT / '.cloudinary_tmp'
TMP_DIR.mkdir(exist_ok=True)

IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
VIDEO_EXTS = {'.mp4', '.webm', '.mov', '.avi'}

# Configure Cloudinary from env
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)


def load_log():
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_log(log):
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(log, f, indent=2)


def trim_filename(path: Path) -> Path:
    name = path.name
    trimmed = name.strip()
    if name != trimmed:
        new_path = path.with_name(trimmed)
        print(f"Renaming file: '{name}' -> '{trimmed}'")
        shutil.move(str(path), str(new_path))
        return new_path
    return path


def compress_image(src: Path, dest: Path) -> bool:
    """Attempt to compress/resize image until it's under MAX_BYTES. Return True on success."""
    try:
        img = Image.open(src)
        img_format = img.format if img.format else 'JPEG'

        # Start with quality 85 and max width/height 2000
        quality = 85
        max_side = max(img.size)
        scale = 1.0

        # Reduce loop
        for attempt in range(8):
            tmp_size = dest
            if scale < 1.0:
                new_size = (int(img.width * scale), int(img.height * scale))
                resized = img.resize(new_size, Image.LANCZOS)
            else:
                resized = img

            save_params = {}
            if img_format.upper() in ('JPEG', 'JPG'):
                save_params['format'] = 'JPEG'
                save_params['quality'] = quality
                save_params['optimize'] = True
            elif img_format.upper() == 'PNG':
                save_params['format'] = 'PNG'
                save_params['optimize'] = True
            else:
                save_params['format'] = img_format

            resized.save(tmp_size, **save_params)
            size = tmp_size.stat().st_size
            print(f"  attempt {attempt+1}: size={size/1024/1024:.2f}MB, quality={quality}, scale={scale:.2f}")
            if size <= MAX_BYTES:
                return True

            # decrease quality and scale
            if quality > 30:
                quality = max(30, quality - 15)
            scale = scale * 0.8

        return False
    except Exception as e:
        print('  compress_image error', e)
        return False


def reupload_item(item: dict) -> dict:
    """Attempt to fix and re-upload the item. Returns updated item dict."""
    local = item.get('local_path')
    fname = item.get('file_name')
    path = ROOT / local
    if not path.exists():
        # Maybe the log used just the filename
        path = ROOT / fname
        if not path.exists():
            print(f"File not found: {local} / {fname}")
            item['status'] = 'error'
            item['error'] = 'local file not found'
            return item

    # Trim filename if needed
    if path.name != path.name.strip():
        path = trim_filename(path)

    suffix = path.suffix.lower()
    # If image and too large, try compress
    tmpfile = TMP_DIR / f"tmp_{path.name}"

    if suffix in IMAGE_EXTS:
        size = path.stat().st_size
        if size > MAX_BYTES or item.get('status') != 'success':
            print(f"Processing image: {path} ({size/1024/1024:.2f}MB)")
            ok = compress_image(path, tmpfile)
            upload_path = tmpfile if ok else path
            if not ok:
                print(f"  Could not compress under {MAX_BYTES} bytes; will attempt upload anyway")
            try:
                res = upload(str(upload_path), folder='paaru-studio', public_id=os.path.splitext(path.name)[0], overwrite=True)
                item['cloudinary_url'] = res.get('secure_url')
                item['cloudinary_public_id'] = res.get('public_id')
                item['status'] = 'success'
                print(f"  Uploaded: {item['cloudinary_url']}")
            except Exception as e:
                print('  upload error', e)
                item['status'] = 'error'
                item['error'] = str(e)

    elif suffix in VIDEO_EXTS:
        # Upload as video
        try:
            print(f"Uploading video: {path}")
            res = upload(str(path), resource_type='video', folder='paaru-studio', public_id=os.path.splitext(path.name)[0], overwrite=True)
            item['cloudinary_url'] = res.get('secure_url')
            item['cloudinary_public_id'] = res.get('public_id')
            item['status'] = 'success'
            print(f"  Uploaded video: {item['cloudinary_url']}")
        except Exception as e:
            print('  video upload error', e)
            item['status'] = 'error'
            item['error'] = str(e)

    else:
        # Other files (pdf etc.) try upload normally
        try:
            print(f"Uploading file: {path}")
            res = upload(str(path), folder='paaru-studio', public_id=os.path.splitext(path.name)[0], overwrite=True)
            item['cloudinary_url'] = res.get('secure_url')
            item['cloudinary_public_id'] = res.get('public_id')
            item['status'] = 'success'
            print(f"  Uploaded: {item['cloudinary_url']}")
        except Exception as e:
            print('  upload error', e)
            item['status'] = 'error'
            item['error'] = str(e)

    # cleanup tmp
    if tmpfile.exists():
        try:
            tmpfile.unlink()
        except Exception:
            pass

    return item


def main():
    if not LOG_FILE.exists():
        print('Upload log missing:', LOG_FILE)
        return

    log = load_log()
    to_process = []
    for i, item in enumerate(log):
        if item.get('status') != 'success':
            to_process.append((i, item))

    print(f"Found {len(to_process)} items to reprocess")

    for idx, item in to_process:
        print('---')
        print('Reprocessing:', item.get('local_path') or item.get('file_name'), 'status=', item.get('status'))
        updated = reupload_item(item)
        log[idx] = updated
        # save after each change
        save_log(log)

    print('\nRe-upload phase complete. Now re-running replacements...')

    # Run replacements
    try:
        subprocess.check_call([sys.executable, 'replace_urls.py'])
    except Exception as e:
        print('Failed to run replace_urls.py', e)

    print('\nAll done. Updated upload log saved to', LOG_FILE)

if __name__ == '__main__':
    main()
