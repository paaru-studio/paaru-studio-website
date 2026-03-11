import os
from PIL import Image

MAX_SIZE = (1920, 1920)

def compress_image(filepath):
    try:
        size_mb = os.path.getsize(filepath) / 1024 / 1024
        if size_mb < 0.4:  # skip under 400KB
            return
            
        with Image.open(filepath) as img:
            # Resize if too large
            if img.width > MAX_SIZE[0] or img.height > MAX_SIZE[1]:
                img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
                print(f"Resizing {filepath} down to {img.size}")
            
            # Save back heavily compressed
            temp_path = filepath + '.tmp.webp'
            img.save(temp_path, 'WEBP', quality=65, method=6)
            
            new_size = os.path.getsize(temp_path)
            orig_size = os.path.getsize(filepath)
            
            if new_size < orig_size:
                os.replace(temp_path, filepath)
                print(f"Compressed {filepath}: {orig_size/1024:.0f}KB -> {new_size/1024:.0f}KB")
            else:
                os.remove(temp_path)
                print(f"No compression gain for {filepath}")
                
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

# Process current directory
for root, dirs, files in os.walk('.'):
    # skip venv
    if '.venv' in root: continue
    
    for file in files:
        if file.lower().endswith(('.webp', '.jpg', '.jpeg', '.png')):
            compress_image(os.path.join(root, file))

