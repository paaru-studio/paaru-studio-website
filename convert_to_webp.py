#!/usr/bin/env python3
"""
Convert all <img> tags with .jpg/.jpeg sources to <picture> elements with WebP support.
Preserves all attributes (loading, alt, class, style, width, height, etc.)
"""

import re
import os
import glob

def convert_img_to_picture(match):
    """Convert a single img tag to picture element with WebP source."""
    full_tag = match.group(0)
    
    # Extract the src attribute
    src_match = re.search(r'src=["\']([^"\']+\.jpe?g)["\']', full_tag, re.IGNORECASE)
    if not src_match:
        return full_tag
    
    src_path = src_match.group(1)
    # Create WebP path by replacing extension
    webp_path = re.sub(r'\.(jpe?g)$', '.webp', src_path, flags=re.IGNORECASE)
    
    # Build the picture element
    indent = match.group(1) if match.group(1) else ''
    picture = f'''{indent}<picture>
{indent}    <source srcset="{webp_path}" type="image/webp">
{indent}    {full_tag.strip()}
{indent}</picture>'''
    
    return picture

def process_html_file(filepath):
    """Process a single HTML file to convert img tags."""
    print(f"Processing: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern to match img tags with .jpg or .jpeg sources
    # Captures leading whitespace for proper indentation
    pattern = r'([ \t]*)<img\s+[^>]*src=["\'][^"\']+\.jpe?g["\'][^>]*>'
    
    # Convert all matching img tags
    content = re.sub(pattern, convert_img_to_picture, content, flags=re.IGNORECASE)
    
    if content != original_content:
        # Backup original file
        backup_path = filepath + '.backup'
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(original_content)
        
        # Write updated content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        changes = content.count('<picture>') - original_content.count('<picture>')
        print(f"  ✓ Converted {changes} images")
        print(f"  ✓ Backup saved to {backup_path}")
        return changes
    else:
        print(f"  - No changes needed")
        return 0

def main():
    """Process all HTML files in the current directory."""
    html_files = glob.glob('*.html')
    
    # Exclude certain files if needed
    exclude_files = []  # Add files to exclude if needed
    html_files = [f for f in html_files if f not in exclude_files]
    
    print(f"Found {len(html_files)} HTML files to process\n")
    
    total_converted = 0
    for filepath in sorted(html_files):
        converted = process_html_file(filepath)
        total_converted += converted
        print()
    
    print(f"=== Summary ===")
    print(f"Total images converted: {total_converted}")
    print(f"Files processed: {len(html_files)}")
    print(f"\nBackup files created with .backup extension")
    print(f"Review changes and delete backups if satisfied")

if __name__ == '__main__':
    main()
