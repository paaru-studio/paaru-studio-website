#!/usr/bin/env python3
"""
Convert all JPG/JPEG images to WebP format using PIL (Pillow).
Maintains original quality while reducing file size by 25-35%.
"""

import os
import glob
from PIL import Image

def convert_to_webp(input_path, quality=85):
    """Convert a single image to WebP format."""
    try:
        # Open the image
        img = Image.open(input_path)
        
        # Convert RGBA to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        
        # Create output path
        output_path = os.path.splitext(input_path)[0] + '.webp'
        
        # Save as WebP
        img.save(output_path, 'WEBP', quality=quality, method=6)
        
        # Get file sizes
        original_size = os.path.getsize(input_path)
        webp_size = os.path.getsize(output_path)
        reduction = ((original_size - webp_size) / original_size) * 100
        
        print(f"✓ {os.path.basename(input_path)}")
        print(f"  Original: {original_size/1024:.1f} KB → WebP: {webp_size/1024:.1f} KB ({reduction:.1f}% reduction)")
        
        return True, original_size, webp_size
    except Exception as e:
        print(f"✗ Error converting {input_path}: {e}")
        return False, 0, 0

def main():
    """Convert all JPG/JPEG images in current directory and subdirectories."""
    # Find all JPG/JPEG files
    patterns = ['*.jpg', '*.jpeg', '*.JPG', '*.JPEG']
    image_files = []
    
    for pattern in patterns:
        image_files.extend(glob.glob(pattern))
        # Also search in subdirectories
        image_files.extend(glob.glob(f'**/{pattern}', recursive=True))
    
    # Remove duplicates
    image_files = list(set(image_files))
    
    # Filter out already converted files (if WebP exists)
    files_to_convert = []
    files_skipped = []
    
    for img_path in image_files:
        webp_path = os.path.splitext(img_path)[0] + '.webp'
        if os.path.exists(webp_path):
            files_skipped.append(img_path)
        else:
            files_to_convert.append(img_path)
    
    print(f"Found {len(image_files)} JPG/JPEG images")
    print(f"  {len(files_to_convert)} to convert")
    print(f"  {len(files_skipped)} already have WebP versions\n")
    
    if not files_to_convert:
        print("No images to convert!")
        return
    
    # Convert images
    total_original = 0
    total_webp = 0
    successful = 0
    
    for img_path in sorted(files_to_convert):
        success, orig_size, webp_size = convert_to_webp(img_path)
        if success:
            successful += 1
            total_original += orig_size
            total_webp += webp_size
        print()
    
    # Summary
    print("=" * 50)
    print(f"Conversion complete!")
    print(f"  Successfully converted: {successful}/{len(files_to_convert)} images")
    if total_original > 0:
        total_reduction = ((total_original - total_webp) / total_original) * 100
        print(f"  Total size: {total_original/1024/1024:.2f} MB → {total_webp/1024/1024:.2f} MB")
        print(f"  Total reduction: {total_reduction:.1f}%")

if __name__ == '__main__':
    # Check if Pillow is installed
    try:
        from PIL import Image
        main()
    except ImportError:
        print("Error: Pillow (PIL) is not installed.")
        print("Install it with: pip3 install Pillow")
        print("or: python3 -m pip install Pillow")
