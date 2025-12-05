#!/usr/bin/env python3
"""
Replace local image/media references with Cloudinary URLs using cloudinary-upload-log.json
Backs up modified files to ./replacements_backup/<relative-path>.bak
"""
import os
import re
import json
from pathlib import Path

ROOT = Path.cwd()
LOG_FILE = ROOT / 'cloudinary-upload-log.json'
BACKUP_DIR = ROOT / 'replacements_backup'
SEARCH_EXTS = ['.html', '.css', '.js', '.md']

def load_log():
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def build_map(upload_log):
    mapping = {}
    for item in upload_log:
        if item.get('status') == 'success' and item.get('cloudinary_url'):
            fname = item.get('file_name')
            # also map URL-escaped and space-less variants
            mapping[fname] = item['cloudinary_url']
            mapping[fname.replace(' ', '%20')] = item['cloudinary_url']
            mapping[fname.replace(' ', '_')] = item['cloudinary_url']
            mapping[os.path.basename(item.get('local_path'))] = item['cloudinary_url']
    return mapping

# Patterns to find occurrences of filenames in HTML/CSS/JS
def generate_patterns(filename):
    esc = re.escape(filename)
    patterns = [
        re.compile(r'src=["\']([^"\']*\/)?' + esc + r'["\']', flags=re.IGNORECASE),
        re.compile(r'href=["\']([^"\']*\/)?' + esc + r'["\']', flags=re.IGNORECASE),
        re.compile(r'url\(["\']?([^"\']*\/)?' + esc + r'["\']?\)', flags=re.IGNORECASE),
        re.compile(r'([^A-Za-z0-9_\-\/.])' + esc + r'([^A-Za-z0-9_\-.])'),
    ]
    return patterns

def backup_file(path: Path):
    rel = path.relative_to(ROOT)
    dest = BACKUP_DIR / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'rb') as src, open(dest.with_suffix(dest.suffix + '.bak'), 'wb') as dst:
        dst.write(src.read())


def replace_in_file(path: Path, mapping):
    text = path.read_text(encoding='utf-8')
    original = text
    changed = False

    for fname, url in mapping.items():
        # Replace common attribute occurrences first
        # src/href
        text_new = re.sub(r'(src=["\'])([^"\']*\/)?' + re.escape(fname) + r'(["\'])', r"\1" + url + r"\3", text, flags=re.IGNORECASE)
        if text_new != text:
            text = text_new
            changed = True

        text_new = re.sub(r'(href=["\'])([^"\']*\/)?' + re.escape(fname) + r'(["\'])', r"\1" + url + r"\3", text, flags=re.IGNORECASE)
        if text_new != text:
            text = text_new
            changed = True

        # url(...) in css
        text_new = re.sub(r'(url\(["\']?)([^"\']*\/)?' + re.escape(fname) + r'(["\']?\))', r"\1" + url + r"\3", text, flags=re.IGNORECASE)
        if text_new != text:
            text = text_new
            changed = True

        # Plain occurrences (word boundaries)
        text_new = re.sub(r'(?<![A-Za-z0-9_\-\/])' + re.escape(fname) + r'(?![A-Za-z0-9_\-\.])', url, text, flags=re.IGNORECASE)
        if text_new != text:
            text = text_new
            changed = True

    if changed:
        # backup
        backup_file(path)
        path.write_text(text, encoding='utf-8')
        return True
    return False


def main():
    if not LOG_FILE.exists():
        print('Upload log not found:', LOG_FILE)
        return

    upload_log = load_log()
    mapping = build_map(upload_log)
    if not mapping:
        print('No successful uploads in log to replace.')
        return

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    files_changed = []
    files_scanned = 0

    for ext in SEARCH_EXTS:
        for path in ROOT.rglob(f'*{ext}'):
            if path.is_file():
                files_scanned += 1
                try:
                    if replace_in_file(path, mapping):
                        files_changed.append(str(path.relative_to(ROOT)))
                except Exception as e:
                    print('Error processing', path, e)

    print('\nReplacement complete')
    print('Files scanned:', files_scanned)
    print('Files changed:', len(files_changed))
    if files_changed:
        for p in files_changed[:200]:
            print(' -', p)

if __name__ == '__main__':
    main()
